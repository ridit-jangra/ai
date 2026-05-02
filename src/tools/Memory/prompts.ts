export const memoryRead = {
  description: "Read a persistent memory file.",
  prompt: `Reads memory to recall information from past sessions.
  Use this at the start of a session to load context about:
  - User preferences
  - Project conventions
  - Previously stored information
  If the user references something you don't recognize, read memory to find out more.
  If not found in memory, tell the user you don't know or ask them to tell you.`,
};

export const memoryWrite = {
  description: "Write or overwrite a persistent memory file.",
  prompt: `Saves important information to memory for future sessions.
  Use this to store:
  - User preferences and settings
  - Project conventions and context
  - Key facts learned during the session
  Name files meaningfully, e.g. "user.md", "project/conventions.md".
  Prefer MemoryEditTool for small updates to existing files.
  After any non-trivial task, decide if anything learned is worth saving. If yes, write it.`,
};

export const memoryEdit = {
  description: "Edit a specific section of a persistent memory file.",
  prompt: `Updates a specific part of a memory file without rewriting the whole thing.
  Use this to:
  - Update a preference that changed
  - Fix incorrect information
  - Append or modify a specific section
  Prefer this over MemoryWriteTool when only a small part needs to change.`,
};

export const memoryList = {
  description: "List all available persistent memory files.",
  prompt: `Returns a list of all saved memory file names.
  Use this when:
  - You're unsure what memory files exist
  - The user references something and you don't know which file might contain it
  - At the start of a session before deciding what to read
  After listing, use MemoryReadTool to read the relevant files.`,
};
