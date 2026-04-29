import { createGroq } from "@ai-sdk/groq";
import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOllama } from "ai-sdk-ollama";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import type { LanguageModel } from "ai";

export type ProviderType =
  | "groq"
  | "openai"
  | "anthropic"
  | "ollama"
  | "openrouter"
  | "google";

export type ProviderConfig = {
  provider: ProviderType;
  model: string;
  apiKey?: string;
  baseURL?: string;
};

export function buildProvider(config: ProviderConfig): LanguageModel {
  switch (config.provider) {
    case "groq":
      if (!config.apiKey) throw new Error("Groq API key missing.");
      return createGroq({ apiKey: config.apiKey })(config.model);

    case "openai":
      if (!config.apiKey) throw new Error("OpenAI API key missing.");
      return createOpenAI({
        apiKey: config.apiKey,
        ...(config.baseURL ? { baseURL: config.baseURL } : {}),
      })(config.model);

    case "anthropic":
      if (!config.apiKey) throw new Error("Anthropic API key missing.");
      return createAnthropic({ apiKey: config.apiKey })(config.model);

    case "ollama":
      return createOllama({
        baseURL: config.baseURL ?? "http://localhost:11434/api",
      })(config.model);

    case "google":
      if (!config.apiKey) throw new Error("Google Gemini API key missing.");
      return createGoogleGenerativeAI({ apiKey: config.apiKey })(config.model);

    case "openrouter":
      if (!config.apiKey) throw new Error("OpenRouter API key missing.");
      return createOpenRouter({
        apiKey: config.apiKey,
        ...(config.baseURL ? { baseURL: config.baseURL } : {}),
      })(config.model);
  }
}
