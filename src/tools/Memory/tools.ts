import { tool } from "ai";
import { z } from "zod";
import type { Store } from "../../utils/store";
import { memoryRead, memoryWrite, memoryEdit, memoryList } from "./prompts";

export function createMemoryTools(store: Store) {
  const MemoryReadTool = tool({
    title: "MemoryRead",
    description: `${memoryRead.description}\n\n${memoryRead.prompt}`,
    inputSchema: z.object({
      name: z
        .string()
        .describe(
          "Name of the memory file, e.g. 'user.md' or 'project/notes.md'",
        ),
    }),
    execute: async ({ name }) => {
      try {
        const content = store.memory.read(name);
        if (content === null) {
          return {
            success: false,
            error: `Memory file '${name}' does not exist`,
          };
        }
        return { success: true, content };
      } catch (err) {
        return { success: false, error: String(err) };
      }
    },
  });

  const MemoryWriteTool = tool({
    title: "MemoryWrite",
    description: `${memoryWrite.description}\n\n${memoryWrite.prompt}`,
    inputSchema: z.object({
      name: z
        .string()
        .describe(
          "Name of the memory file, e.g. 'user.md' or 'project/context.md'",
        ),
      content: z.string().describe("Full content to write to the memory file"),
    }),
    execute: async ({ name, content }) => {
      try {
        store.memory.write(name, content);
        return { success: true, message: `Memory written to '${name}'` };
      } catch (err) {
        return { success: false, error: String(err) };
      }
    },
  });

  const MemoryEditTool = tool({
    title: "MemoryEdit",
    description: `${memoryEdit.description}\n\n${memoryEdit.prompt}`,
    inputSchema: z.object({
      name: z.string().describe("Name of the memory file"),
      old_string: z
        .string()
        .describe("The exact string to replace (must appear exactly once)"),
      new_string: z.string().describe("The replacement string"),
    }),
    execute: async ({ name, old_string, new_string }) => {
      try {
        const content = store.memory.read(name);
        if (content === null) {
          return {
            success: false,
            error: `Memory file '${name}' does not exist`,
          };
        }

        const occurrences = content.split(old_string).length - 1;
        if (occurrences === 0) {
          return {
            success: false,
            error: "old_string not found in memory file",
          };
        }
        if (occurrences > 1) {
          return {
            success: false,
            error: `old_string found ${occurrences} times — must be unique. Add more context to narrow it down.`,
          };
        }

        store.memory.write(name, content.replace(old_string, new_string));
        return { success: true, message: `Memory '${name}' updated` };
      } catch (err) {
        return { success: false, error: String(err) };
      }
    },
  });

  const MemoryListTool = tool({
    title: "MemoryList",
    description: `${memoryList.description}\n\n${memoryList.prompt}`,
    inputSchema: z.object({}),
    execute: async () => {
      try {
        const files = store.memory.list();
        return { success: true, files };
      } catch (err) {
        return { success: false, error: String(err) };
      }
    },
  });

  return { MemoryReadTool, MemoryWriteTool, MemoryEditTool, MemoryListTool };
}
