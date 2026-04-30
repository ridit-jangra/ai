import type { LanguageModel, ToolSet } from "ai";
import type { Session } from "./utils/session";
import type { Store } from "./utils/store";

export type ChatMessage =
  | { id: string; type: "user"; text: string }
  | { id: string; type: "assistant"; text: string }
  | {
      id: string;
      type: "tool_call";
      toolName: string;
      input: unknown;
      isOrchestrated?: boolean;
      taskId?: string;
    }
  | {
      id: string;
      type: "tool_result";
      toolName: string;
      input: unknown;
      output: unknown;
      success: boolean;
      isOrchestrated?: boolean;
      taskId?: string;
    }
  | {
      id: string;
      type: "permission_request";
      toolName: string;
      input: unknown;
      preview: unknown;
      resolve: (decision: PermissionDecision) => void;
    };

export type StepToolCall = {
  id: string;
  toolName: string;
  input: unknown;
};

export type StepToolResult = {
  id: string;
  toolName: string;
  output: unknown;
  input?: unknown;
};

export type LLMOptions = {
  system?: string;
  tools?: ToolSet;
  session?: Session;
  prompt: string;
  onToolCall?: (toolCall: StepToolCall) => void;
  onToolResult?: (toolResult: StepToolResult) => void;
  abortSignal?: AbortSignal;
  steps?: number;
  provider: LanguageModel;
  sessionStore?: Store;
};

export type PermissionDecision = "allow" | "allow_session" | "deny";

export type PermissionRequest = {
  id: string;
  toolName: string;
  input: unknown;
};
