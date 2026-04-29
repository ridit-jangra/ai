import { runLLM } from "./llm";
import type { StepToolCall, StepToolResult } from "../types";
import { chatTools } from "./tools";
import type { Session } from "./session";
import { chatMode } from "./mode";
import type { LanguageModel } from "ai";

export async function chat(
  prompt: string,
  provider: LanguageModel,
  session?: Session,
  onToolCall?: (t: StepToolCall) => void,
  onToolResult?: (t: StepToolResult) => void,
  abortSignal?: AbortSignal,
  systemPrompt?: string,
) {
  return runLLM({
    system: systemPrompt ?? "",
    prompt,
    session,
    mode: chatMode,
    tools: chatTools,
    onToolCall,
    onToolResult,
    abortSignal,
    steps: 50,
    provider,
  });
}
