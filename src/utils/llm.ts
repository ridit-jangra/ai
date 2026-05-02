import { generateText, stepCountIs } from "ai";
import { type Session, createSession, loadMemoryIntoSession } from "./session";
import type { LLMOptions } from "../types";
import { compactSession, shouldCompact } from "./compaction";
import { repairJSON } from "./json";
import type { Store } from "./store";

export type RunLLMOptions = LLMOptions & {
  session?: Session;
  sessionId?: string;
  store?: Store; // if omitted, session won't be persisted
  memoryContent?: string;
};

export async function runLLM({
  system,
  tools,
  session,
  store,
  sessionId,
  memoryContent,
  prompt,
  onToolCall,
  onToolResult,
  abortSignal,
  steps,
  provider,
}: RunLLMOptions): Promise<{ text: string; session: Session }> {
  let activeSession: Session;

  if (session) {
    activeSession = session;
  } else if (store && store.session && sessionId) {
    activeSession =
      (await store.session.load(sessionId)) ?? createSession(sessionId);
  } else {
    activeSession = createSession(sessionId);
  }

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

  const memoryPrompt = `
  # Memory
  - After EVERY response, decide if anything was learned worth saving. If yes, call MemoryWriteTool immediately.
  - Do not wait for the user to ask you to save. Be proactive.
  - Name files meaningfully, e.g. "user.md", "project/notes.md".
  - Use MemoryReadTool when the user references something unfamiliar.
  - Use MemoryEditTool for small updates to existing files instead of rewriting.
  - Use MemoryListTool to discover what files exist before reading.
  ${
    store
      ? `\nCurrently stored memories:\n${store.memory.list().join("\n") || "(none yet)"}`
      : ""
  }`;

  const result = await generateText({
    model: provider,
    system: system + memoryPrompt,
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

  if (store && store.session) {
    store.session.save(activeSession);
  }

  return { text: result.text, session: activeSession };
}
