import { access, mkdir, readdir, readFile, writeFile } from "fs/promises";
import type { Session } from "./session";
import {
  saveSession,
  loadSession,
  listSessions,
  type SessionStoreOptions,
} from "./session";
import { mkdirSync } from "fs";
import { join, resolve } from "path";

export interface MemoryStore {
  read(name: string): string | null | Promise<string | null>;
  write(name: string, content: string): void | Promise<void>;
  list(): string[] | Promise<string[]>;
}

export interface SessionStore {
  save: (session: Session) => void | Promise<void>;
  load: (id: string) => Session | Promise<Session | null> | null;
  list: () => Session[] | Promise<Session[]>;
}

export abstract class Store {
  abstract session: SessionStore;
  abstract memory: MemoryStore;
}

export function createStore({
  session,
  memory,
}: {
  session: SessionStore;
  memory: MemoryStore;
}) {
  return new (class extends Store {
    memory = memory;
    session = session;
  })();
}

export function createFileStore(
  options: SessionStoreOptions & { memoryDir?: string },
) {
  const memoryDir = resolve(options.memoryDir ?? "./memory");
  mkdirSync(memoryDir, { recursive: true });

  const memory: MemoryStore = {
    async read(name) {
      const fullPath = safeJoin(memoryDir, name);
      if (!fullPath) return null;
      try {
        await access(fullPath);
        return await readFile(fullPath, "utf-8");
      } catch {
        return null;
      }
    },

    async write(name, content) {
      const fullPath = safeJoin(memoryDir, name);
      if (!fullPath) throw new Error("Invalid memory path");
      await mkdir(join(fullPath, ".."), { recursive: true });
      await writeFile(fullPath, content, "utf-8");
    },

    async list() {
      return readdirRecursive(memoryDir).then((files) =>
        files.map((f) => f.slice(memoryDir.length + 1)),
      );
    },
  };

  const session: SessionStore = {
    save: (session) => saveSession(session, options),
    load: (id) => loadSession(id, options),
    list: () =>
      listSessions(options).map((s) => ({
        id: s.id,
        messages: [],
        memoryLoaded: false,
        createdAt: s.createdAt,
        updatedAt: s.updatedAt,
      })),
  };

  return createStore({
    memory,
    session,
  });
}

function safeJoin(base: string, name: string): string | null {
  const full = resolve(join(base, name));
  return full.startsWith(base) ? full : null;
}

async function readdirRecursive(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const results = await Promise.all(
    entries.map(async (e) => {
      const full = join(dir, e.name);
      return e.isDirectory() ? readdirRecursive(full) : [full];
    }),
  );
  return results.flat();
}
