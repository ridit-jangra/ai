import type { Session } from "./session";
import {
  saveSession,
  loadSession,
  listSessions,
  type SessionStoreOptions,
} from "./session";

export abstract class Store {
  abstract save(session: Session): void;
  abstract load(id: string): Session | null;
  abstract list(): Session[];
}

export function createStore({
  list,
  load,
  save,
}: {
  save: (session: Session) => void;
  load: (id: string) => Session | null;
  list: () => Session[];
}) {
  return new (class extends Store {
    save(session: Session): void {
      return save(session);
    }

    load(id: string): Session | null {
      return load(id);
    }

    list(): Session[] {
      return list();
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
