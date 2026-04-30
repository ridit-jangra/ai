import type { LanguageModel, ToolSet } from "ai";
import type { Store } from "./store";
import { runLLM, type RunLLMOptions } from "./llm";

export function createClient({
  provider,
  store,
  tools,
}: {
  provider: LanguageModel;
  store?: Store;
  tools?: ToolSet;
}) {
  return {
    run: (opts: Omit<RunLLMOptions, "provider" | "sessionStore">) =>
      runLLM({
        ...opts,
        provider,
        sessionStore: store,

        tools: {
          ...tools,
          ...opts.tools,
        },
      }),
  };
}
