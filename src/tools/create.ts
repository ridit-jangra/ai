import { tool } from "ai";
import type { FlexibleSchema, ToolExecuteFunction } from "ai";

export type ToolOptions = {
  name: string;
  description: string;
  inputSchema: FlexibleSchema;
  execute: ToolExecuteFunction<any, any>;
};

export function createTool({
  name,
  description,
  inputSchema,
  execute,
}: ToolOptions) {
  return tool({
    title: name,
    description,
    inputSchema,
    execute,
  });
}
