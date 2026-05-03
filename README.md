# @ridit/ai

**your agents, in minutes.**

build AI agents that remember things, use tools, persist sessions, and work in teams. works with any model. no magic, no black boxes. just agents.

---

## install

```bash
npm install @ridit/ai
# or
bun add @ridit/ai
```

---

## what it does

- **any model** — anthropic, openai, groq, google, ollama, openrouter
- **memory** — inject context into any session
- **sessions** — persist to disk or localStorage.
- **compaction** — context too long? it summarizes itself. automatically.
- **tools** — files, bash, memory, sub-agents, and more

---

## quick start

```typescript
import { buildProvider, runLLM } from "@ridit/ai";
import { FileWriteTool, ThinkTool } from "@ridit/ai/tools";

const provider = buildProvider({
  provider: "anthropic",
  model: "claude-sonnet-4-20250514",
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const { text, session } = await runLLM({
  prompt: "create a hello world python script",
  provider,
  tools: { ThinkTool, FileWriteTool },
});

console.log(text);
```

that's it. agent runs, uses tools, returns text and the session.

---

## providers

```typescript
import { buildProvider } from "@ridit/ai";

buildProvider({
  provider: "anthropic",
  model: "claude-sonnet-4-20250514",
  apiKey: "...",
});
buildProvider({ provider: "openai", model: "gpt-4o", apiKey: "..." });
buildProvider({
  provider: "groq",
  model: "llama-3.3-70b-versatile",
  apiKey: "...",
});
buildProvider({ provider: "google", model: "gemini-2.0-flash", apiKey: "..." });
buildProvider({ provider: "ollama", model: "llama3.2" }); // no key needed
buildProvider({
  provider: "openrouter",
  model: "meta-llama/llama-3.3-70b-instruct",
  apiKey: "...",
});
```

---

## sessions

sessions are opt-in. no storage passed = runs in memory, nothing saved. your call.

### node

```typescript
import { createStore } from "@ridit/ai/utils";

const store = createStore({ ... });

const { session } = await runLLM({ prompt: "hey", provider, store });

// resume later
const { text } = await runLLM({
  prompt: "what did i say before?",
  provider,
  session,
  storage,
});
```

### browser

```typescript
import { createStore } from "@ridit/ai/utils";

const store = createStore({
  async save(session) {
    localStorage.setItem(session.id, JSON.stringify(session));
  },
  async load(id) {
    const s = localStorage.getItem(id);
    return s ? JSON.parse(s) : null;
  },
  async list() {
    return [];
  },
});

const { text, session } = await runLLM({ prompt: "hi", provider, store });
```

### node

```typescript
import { createStore } from "@ridit/ai/utils";
import { readFile, writeFile, mkdir } from "fs/promises";
import { join } from "path";

const sessionsDir = "./sessions";
await mkdir(sessionsDir, { recursive: true });

const store = createStore({
  session: {
    async save(session) {
      await writeFile(
        join(sessionsDir, `${session.id}.json`),
        JSON.stringify(session),
        "utf-8",
      );
    },
    async load(id) {
      try {
        const raw = await readFile(join(sessionsDir, `${id}.json`), "utf-8");
        return JSON.parse(raw);
      } catch {
        return null;
      }
    },
    async list() {
      return []; // implement if needed
    },
  },
  memory: {
    async read(name) {
      return null;
    },
    async write(name, content) {},
    async list() {
      return [];
    },
  },
});

const { text, session } = await runLLM({ prompt: "hey", provider, store });

// resume later
const { text: text2 } = await runLLM({
  prompt: "what did i say before?",
  provider,
  store,
  sessionId: session.id,
});
```

bring your own adapter. redis, supabase, sqlite — whatever you want.

---

## tools

```typescript
import {
  ThinkTool, // internal reasoning step
} from "@ridit/ai/tools";
```

## Memory tools

Memory tools need a store to store your memory.

```typescript
import { createMemoryTools } from "@ridit/ai/tools";

const { MemoryReadTool, MemoryWriteTool, MemoryEditTool } =
  createMemoryTools(store); // your store
```

Create yours too!

---

## compaction

when sessions get long, `@ridit/ai` summarizes the history and compacts it automatically before the next call. you don't have to think about it.

---

## system prompts

```typescript
const { text } = await runLLM({
  prompt: "review this PR",
  provider,
  system: "you are a senior typescript engineer. be direct. no fluff.",
});
```

## client

create client 1 time, run as many times as your want without configuring multiple times.

```typescript
const provider = buildProvider({
  model: "openai/gpt-oss-120b",
  provider: "groq",
  apiKey: "...",
});

const client = createClient({ provider, tools: {} }); // tools is to set a global set of tools

const text = await client.run({
  prompt: "hey!",
  tools: { FileReadTool, FileWriteTool }, // override global tools
});

console.log(text);
```

---

## api

### `buildProvider(config)`

| field      | type         | required                      |
| ---------- | ------------ | ----------------------------- |
| `provider` | `"anthropic" | "openai"                      |
| `model`    | `string`     | ✅                            |
| `apiKey`   | `string`     | for hosted providers          |
| `baseURL`  | `string`     | for ollama / custom endpoints |

### `runLLM(options)`

| field           | type             | description                      |
| --------------- | ---------------- | -------------------------------- |
| `prompt`        | `string`         | user message                     |
| `provider`      | `LanguageModel`  | from `buildProvider()`           |
| `system`        | `string`         | system prompt                    |
| `tools`         | `object`         | tool map                         |
| `session`       | `Session`        | resume a session                 |
| `storage`       | `SessionStorage` | persistence adapter              |
| `memoryContent` | `string`         | memory to inject                 |
| `steps`         | `number`         | max agentic steps (default: 100) |
| `onToolCall`    | `function`       | intercept before tool runs       |
| `onToolResult`  | `function`       | observe tool output              |
| `abortSignal`   | `AbortSignal`    | cancel in-flight requests        |

---

## built with

[Vercel AI SDK](https://sdk.vercel.ai) — model routing, tool calling, streaming

---

## history

`@ridit/ai` started as the core of [Milo](https://github.com/ridit-jangra/Milo) — a terminal AI agent/pet. after building out memory, sessions, compaction, and multi-agent support there, it made sense to pull it out into a proper framework anyone could use.

if you want to see what you can build with it, go look at Milo.

---

## license

MIT © [Ridit Jangra](https://ridit.space)

made with 💕
