import type { LanguageModel } from "ai";
import type { Store } from "./store";
import type { Mode } from "../types";
import { runLLM, type RunLLMOptions } from "./llm";

export function createClient({
  provider,
  store,
  mode,
}: {
  provider: LanguageModel;
  store?: Store;
  mode?: Mode;
}) {
  return {
    run: (opts: Omit<RunLLMOptions, "provider" | "sessionStore" | "mode">) =>
      runLLM({
        ...opts,
        provider,
        sessionStore: store,
        mode,
      }),
  };
}
