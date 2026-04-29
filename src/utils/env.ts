import { join } from "path";
import { homedir } from "os";

export const MILO_BASE_DIR =
  process.env.MILO_CONFIG_DIR ?? join(homedir(), ".milo");

export const MEMORY_DIR = join(MILO_BASE_DIR, "memory");
export const SESSIONS_DIR = join(MILO_BASE_DIR, "sessions");

export const EXECUTION_STATE_FILE = join(MILO_BASE_DIR, "execution-state.json");
export const CONFIG_FILE = join(MILO_BASE_DIR, "config.json");
