import { generateText, stepCountIs } from "ai";
import { getModel } from "./model";
import {
  type Session,
  type SessionStoreOptions,
  createSession,
  loadMemoryIntoSession,
  saveSession,
} from "./session";
import type { LLMOptions } from "../types";
import { compactSession, shouldCompact } from "./compaction";
import { repairJSON } from "./json";

export type RunLLMOptions = LLMOptions & {
  session?: Session;
  sessionStore?: SessionStoreOptions; // if omitted, session won't be persisted
  memoryContent?: string;
};

export async function runLLM({
  system,
  tools,
  session,
  sessionStore,
  memoryContent,
  prompt,
  onToolCall,
  onToolResult,
  abortSignal,
  steps,
  provider,
}: RunLLMOptions): Promise<{ text: string; session: Session }> {
  const activeSession = session ?? createSession();

  loadMemoryIntoSession(activeSession, memoryContent);

  if (shouldCompact(activeSession)) {
    const summary = await generateText({
      model: provider,
      prompt: `summarize this chat: ${JSON.stringify(activeSession.messages)}`,
    });
    compactSession(activeSession, summary.text);
  }

  const messagesBeforePrompt = [...activeSession.messages];
  activeSession.messages.push({ role: "user", content: prompt });

  const result = await generateText({
    model: provider,
    system,
    messages: activeSession.messages,
    stopWhen: stepCountIs(steps ?? 100),
    tools,
    abortSignal,
    experimental_repairToolCall: async ({ toolCall }) => {
      const repaired = repairJSON(toolCall.input as string);
      if (repaired === null) return null;
      return { ...toolCall, input: JSON.parse(repaired) };
    },
    onStepFinish: ({ toolCalls, toolResults }) => {
      for (const toolCall of toolCalls ?? []) {
        onToolCall?.({
          id: toolCall.toolCallId,
          toolName: toolCall.toolName,
          input: toolCall.input,
        });
      }
      for (const toolResult of toolResults ?? []) {
        const toolCall = toolCalls?.find(
          (t) => t.toolCallId === toolResult.toolCallId,
        );
        onToolResult?.({
          id: toolResult.toolCallId,
          toolName: toolResult.toolName,
          input: toolCall?.input,
          output: toolResult.output,
        });
      }
    },
  });

  activeSession.messages = [
    ...messagesBeforePrompt,
    { role: "user", content: prompt },
    ...result.response.messages,
  ];

  if (sessionStore) {
    saveSession(activeSession, sessionStore);
  }

  return { text: result.text, session: activeSession };
}
