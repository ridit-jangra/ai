import type { ModelMessage } from "ai";
import {
  readFileSync,
  writeFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
} from "fs";
import { join } from "path";

export type Session = {
  id: string;
  messages: ModelMessage[];
  memoryLoaded: boolean;
  createdAt: number;
  updatedAt: number;
  compacted?: boolean;
};

export type SessionStoreOptions = {
  sessionsDir: string;
};

export function createSession(id?: string): Session {
  return {
    id: id ?? crypto.randomUUID(),
    messages: [],
    memoryLoaded: false,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

export function saveSession(
  session: Session,
  options: SessionStoreOptions,
): void {
  mkdirSync(options.sessionsDir, { recursive: true });
  const path = join(options.sessionsDir, `${session.id}.json`);
  session.updatedAt = Date.now();
  writeFileSync(path, JSON.stringify(session, null, 2), "utf-8");
}

export function loadSession(
  id: string,
  options: SessionStoreOptions,
): Session | null {
  const path = join(options.sessionsDir, `${id}.json`);
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, "utf-8")) as Session;
  } catch {
    return null;
  }
}

export function listSessions(options: SessionStoreOptions): {
  id: string;
  createdAt: number;
  updatedAt: number;
}[] {
  if (!existsSync(options.sessionsDir)) return [];
  return readdirSync(options.sessionsDir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => {
      try {
        const session = JSON.parse(
          readFileSync(join(options.sessionsDir, f), "utf-8"),
        ) as Session;
        return {
          id: session.id,
          createdAt: session.createdAt,
          updatedAt: session.updatedAt,
        };
      } catch {
        return null;
      }
    })
    .filter((s): s is NonNullable<typeof s> => s !== null)
    .sort((a, b) => b.updatedAt - a.updatedAt);
}

export function loadMemoryIntoSession(
  session: Session,
  projectMemoryContent?: string,
): Session {
  if (session.memoryLoaded) return session;

  if (projectMemoryContent) {
    session.messages.push({
      role: "user",
      content: `<memory>\n# Project Memory\n${projectMemoryContent}\n</memory>`,
    });
    session.messages.push({
      role: "assistant",
      content:
        "Memory loaded. I'll apply these preferences throughout our session.",
    });
  }

  session.memoryLoaded = true;
  return session;
}
