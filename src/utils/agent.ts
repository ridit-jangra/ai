import { runLLM } from "../utils/llm";
import type { StepToolCall, StepToolResult } from "../types";
import { agentTools } from "../utils/tools";
import type { Session } from "../utils/session";
import { agentMode } from "./mode";
import type { LanguageModel } from "ai";

export async function createAgent(
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
    mode: agentMode,
    tools: agentTools,
    onToolCall,
    onToolResult,
    abortSignal,
    provider,
  });
}
