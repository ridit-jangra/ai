import type { LanguageModel } from "ai";
import type { Store } from "./store";
import { runLLM, type RunLLMOptions } from "./llm";

export function createClient({
  provider,
  store,
}: {
  provider: LanguageModel;
  store?: Store;
}) {
  return {
    run: (opts: Omit<RunLLMOptions, "provider" | "sessionStore" | "mode">) =>
      runLLM({
        ...opts,
        provider,
        sessionStore: store,
      }),
  };
}
