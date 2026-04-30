import type { Session } from "./session";
import {
  saveSession,
  loadSession,
  listSessions,
  type SessionStoreOptions,
} from "./session";

export abstract class Store {
  abstract save(session: Session): void | Promise<void>;
  abstract load(id: string): Promise<Session | null>;
  abstract list(): Promise<Session[]>;
}

export function createStore({
  list,
  load,
  save,
}: {
  save: (session: Session) => void | Promise<void>;
  load: (id: string) => Session | Promise<Session> | null;
  list: () => Session[] | Promise<Session[]>;
}) {
  return new (class extends Store {
    async save(session: Session) {
      return await save(session);
    }

    async load(id: string) {
      return await load(id);
    }

    async list() {
      return await list();
    }
  })();
}

export function createFileStore(options: SessionStoreOptions) {
  return createStore({
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
  });
}
