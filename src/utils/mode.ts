import type { ToolSet } from "ai";
import type { Mode } from "../types";
import { agentTools, chatTools } from "./tools";

export function createMode(name: string, tools: ToolSet): Mode {
  return { name, tools };
}

export const chatMode: Mode = {
  name: "chat",
  tools: chatTools,
};

export const agentMode: Mode = {
  name: "agent",
  tools: agentTools,
};
