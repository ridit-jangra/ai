import { runLLM } from "./llm";
import type { StepToolCall, StepToolResult } from "../types";
import { chatTools } from "./tools";
import type { Session } from "./session";

export async function chatWithModel(
  prompt: string,
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
    mode: "chat",
    tools: chatTools,
    onToolCall,
    onToolResult,
    abortSignal,
  });
}
