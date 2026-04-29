import { tool } from "ai";
import { z } from "zod";
import {
  DESCRIPTION,
  PROMPT,
  MAX_OUTPUT_LENGTH,
  BANNED_COMMANDS,
} from "./prompt";
import { PersistentShell } from "../../utils/PersistentShell";

const inputSchema = z.object({
  command: z.string().describe("The bash command to execute"),
  timeout: z
    .number()
    .optional()
    .describe("Timeout in milliseconds, max 600000"),
});

export const BashTool = tool({
  description: DESCRIPTION + "\n\n" + PROMPT,
  title: "Bash",
  inputSchema,
  execute: async ({ command, timeout }, { abortSignal }) => {
    try {
      const banned = BANNED_COMMANDS.find((cmd) =>
        command
          .split(/[;&|]+/)
          .some((part) => part.trim().split(/\s+/)[0] === cmd),
      );
      if (banned)
        return { success: false, error: `Command "${banned}" is not allowed` };

      const shell = PersistentShell.getInstance();

      const result = await shell.exec(command, abortSignal, timeout);

      const combined = [result.stdout, result.stderr]
        .filter(Boolean)
        .join("\n");
      const truncated = combined.length > MAX_OUTPUT_LENGTH;
      return {
        success: !result.interrupted && result.code === 0,
        output: truncated
          ? combined.slice(0, MAX_OUTPUT_LENGTH) + "\n... (truncated)"
          : combined,
        truncated,
      };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  },
});
