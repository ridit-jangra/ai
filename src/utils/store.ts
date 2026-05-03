import type { Session } from "./session";

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
