import { buildProvider } from "./providers";
import type { LanguageModel } from "ai";
import type { ProviderConfig } from "./providers";

export function getModel(config: ProviderConfig): {
  model: LanguageModel;
  modelId: string;
  config: ProviderConfig;
} {
  return {
    model: buildProvider(config),
    modelId: config.model,
    config,
  };
}
