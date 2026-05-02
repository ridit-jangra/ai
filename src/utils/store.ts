import type { Session } from "./session";
import {
  saveSession,
  loadSession,
  listSessions,
  type SessionStoreOptions,
} from "./session";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join, resolve } from "path";

export interface MemoryStore {
  read(name: string): string | null;
  write(name: string, content: string): void;
  list(): string[];
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
    read(name) {
      const fullPath = safeJoin(memoryDir, name);
      if (!fullPath || !existsSync(fullPath)) return null;
      return readFileSync(fullPath, "utf-8");
    },
    write(name, content) {
      const fullPath = safeJoin(memoryDir, name);
      if (!fullPath) throw new Error("Invalid memory path");

      mkdirSync(join(fullPath, ".."), { recursive: true });
      writeFileSync(fullPath, content, "utf-8");
    },
    list() {
      return readdirRecursive(memoryDir).map((f) =>
        f.slice(memoryDir.length + 1),
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

function readdirRecursive(dir: string): string[] {
  const { readdirSync, statSync } = require("fs") as typeof import("fs");
  const entries = readdirSync(dir, { withFileTypes: true });
  return entries.flatMap((e) => {
    const full = join(dir, e.name);
    return e.isDirectory() ? readdirRecursive(full) : [full];
  });
}
