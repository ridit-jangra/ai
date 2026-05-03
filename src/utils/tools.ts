import { BashTool } from "../tools/BashTool/tool";
import { FileEditTool } from "../tools/FileEditTool/tool";
import { FileReadTool } from "../tools/FileReadTool/tool";
import { FileWriteTool } from "../tools/FileWriteTool/tool";
import { GlobTool } from "../tools/GlobTool/tool";
import { GrepTool } from "../tools/GrepTool/tool";
import { RecallTool } from "../tools/RecallTool/tool";
import { ThinkTool } from "../tools/ThinkTool/tool";

export const agentTools = {
  FileReadTool,
  FileWriteTool,
  FileEditTool,
  GrepTool,
  BashTool,
  ThinkTool,
  GlobTool,
  RecallTool,
};

export const subagentTools = {
  FileReadTool,
  FileWriteTool,
  FileEditTool,
  BashTool,
  GrepTool,
  GlobTool,
  ThinkTool,
};

export const chatTools = {
  RecallTool,
  FileReadTool,
  GrepTool,
};
