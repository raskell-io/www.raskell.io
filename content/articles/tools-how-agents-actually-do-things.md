+++
title = "Tools: How Agents Actually Do Things"
date = 2026-06-08
draft = true
description = "Function calling is the API between language and action, but the engineering is in the registry. A working four-tool registry in TypeScript on Bun, schema design that survives model drift, parallel tool calls, and the failure modes nobody mentions in the demo. Part three of The Agent Platform Handbook."

[taxonomies]
tags = ["ai-engineering", "platform-automation"]
categories = ["patterns"]
series = ["the-agent-platform-handbook"]

[extra]
author = "Raffael"
image = "tools-how-agents-actually-do-things.avif"
og_image = "tools-how-agents-actually-do-things.png"
+++

> Part 3 of *The Agent Platform Handbook. From Loop to Platform.* Previous: [Your Agent Wants Root](/articles/your-agent-wants-root/). Next: Context Is the Product.

In [post one](/articles/what-an-agent-actually-is/) the agent had one tool. In [post two](/articles/your-agent-wants-root/) we put that tool behind a hardened sandbox. The loop works. The runtime is fenced. The agent is still mostly useless, because one tool means the model can either run a shell command or do nothing. Every real agent has a toolbox.

This is the toolbox post. We will extend the agent with four tools (`shell`, `fs_read`, `http_get`, `git`), build a registry around them, handle parallel tool calls, and look at the failure modes that show up the first time the model has more than one thing to pick from.

The interesting work in this post is not the tools themselves. It is the registry, the schemas, and the contract between what the model sees and what your code runs. Get those right and adding a fifth tool is a one-file change. Get them wrong and you will spend the next quarter retraining users on a registry the model cannot navigate.

## How we got here

For about a year, the way you let a language model call a function was to ask it nicely.

The ReAct paper in October 2022 sketched the loop in pseudocode. The first implementations, including the early LangChain releases that month, made it real by parsing the model's prose output. You instructed the model to write `Action: search` on one line, `Action Input: "what is X"` on the next, then stopped generation on a token like `Observation:` and used the rest of the lines verbatim. It worked. It also broke whenever the model felt creative, whenever the user's question contained the stop token, whenever the prompt accidentally taught the model a slightly different format.

Then on June 13, 2023, OpenAI shipped function calling. You declared your tools with a JSON Schema. The model returned a structured object with `name` and `arguments`. No more parsing prose. No more stop tokens. The reliability gap between "this works in the demo" and "this works on Tuesday morning" closed by an order of magnitude in a single release. Anthropic shipped `tool_use` shortly after on the same shape, and structured outputs (constrained decoding that guarantees the model emits valid JSON for a given schema) followed in late 2024.

The Model Context Protocol, also from Anthropic, arrived in November 2024 and added a transport layer for tools so they could live in a separate process or a separate machine. The calling convention did not change. MCP just gave the registry a network. We will spend [post eight](#) on MCP specifically.

The lesson from this lineage is one sentence. The model talks JSON now. The work that remains is the work you control: the registry, the schemas, the contract for what happens after the call. That is what this post is about.

## The mental model

A tool layer has three pieces. The model picks. The registry resolves. The handler runs.

{% diagram(title="The tool layer of an agent") %}
                +-------------------+
                |      Model        |
                | "I want to call   |
                |  fs_read with     |
                |  path=/etc/hosts" |
                +---------+---------+
                          |
                          | tool_use block
                          v
                +-------------------+         schema list
                |  Tool registry    | <-----  the model sees
                | name -> handler   |
                +---------+---------+
                          |
                          | dispatch
                          v
                +-------------------+
                |     Handler       |
                | side effect runs  |
                | (in the sandbox)  |
                +---------+---------+
                          |
                          | { ok, value | error }
                          v
                +-------------------+
                |  tool_result      | --->  back into context
                +-------------------+
{% end %}

What the model sees and what the handler runs are decoupled. The model sees a name, a description, and a JSON schema for inputs. The handler sees parsed arguments and returns a result string. The registry is the seam. Every tool engineering decision in this post is about that seam.

## Build the registry

The contract from [post one](/articles/what-an-agent-actually-is/) was a single `Tool` type. We need three small additions to make it a real registry: a result envelope so errors are data and not exceptions, an output cap so a 50 MB log file does not blow the context window, and a registry object so the loop does not care how many tools exist.

```typescript
// types.ts
export type ToolResult =
  | { ok: true; value: string }
  | { ok: false; error: string };

export type Tool = {
  name: string;
  description: string;
  input_schema: {
    type: "object";
    properties: Record<string, unknown>;
    required?: string[];
  };
  max_output_bytes?: number;
  run: (input: Record<string, unknown>) => Promise<ToolResult>;
};
```

Three things changed since post one.

`ToolResult` is a tagged union. Tools never throw to the loop. They return `{ ok: false, error }` when the side effect fails or the input is wrong. This matters because the model needs to read the failure and decide what to do next. An exception kills the loop. A returned error gives the model a chance to retry, switch tools, or report back to the user.

`max_output_bytes` is the per-tool truncation cap. The default is small. A `shell` tool that runs `cat /var/log/syslog` should not return three megabytes of text into a context window that costs you per token.

The registry itself is tiny.

```typescript
// registry.ts
import type { Tool, ToolResult } from "./types";

export class Registry {
  private readonly tools = new Map<string, Tool>();

  register(tool: Tool): this {
    if (this.tools.has(tool.name)) {
      throw new Error(`duplicate tool: ${tool.name}`);
    }
    this.tools.set(tool.name, tool);
    return this;
  }

  schemas() {
    return Array.from(this.tools.values()).map(({ run, ...t }) => t);
  }

  async dispatch(name: string, input: Record<string, unknown>): Promise<ToolResult> {
    const tool = this.tools.get(name);
    if (!tool) return { ok: false, error: `unknown tool: ${name}` };
    try {
      const result = await tool.run(input);
      return cap(result, tool.max_output_bytes ?? 8192);
    } catch (err) {
      return { ok: false, error: `tool threw: ${String(err)}` };
    }
  }
}

function cap(result: ToolResult, max: number): ToolResult {
  if (!result.ok) return result;
  const bytes = Buffer.byteLength(result.value, "utf8");
  if (bytes <= max) return result;
  const head = result.value.slice(0, max);
  return { ok: true, value: `${head}\n\n[truncated: ${bytes - max} more bytes]` };
}
```

The registry holds tools, hands the model the schema view (without the handler), dispatches by name, caps output, and turns any thrown exception into a returned error. Forty lines. Done.

## Four tools

Now the actual toolbox. The shapes are deliberate, and so are the descriptions.

```typescript
// tools/fs.ts
import type { Tool } from "../types";

export const fs_read: Tool = {
  name: "fs_read",
  description:
    "Read a UTF-8 text file from the local filesystem and return its contents. " +
    "Fails if the path does not exist, is not a regular file, is not valid UTF-8, " +
    "or exceeds 1 MB. Use this for source files, configs, and logs.",
  input_schema: {
    type: "object",
    properties: {
      path: { type: "string", description: "Absolute or relative path to the file." },
    },
    required: ["path"],
  },
  max_output_bytes: 1024 * 1024,
  run: async ({ path }) => {
    try {
      const file = Bun.file(String(path));
      const exists = await file.exists();
      if (!exists) return { ok: false, error: `no such file: ${path}` };
      if (file.size > 1024 * 1024) return { ok: false, error: `file too large: ${file.size} bytes` };
      const text = await file.text();
      return { ok: true, value: text };
    } catch (err) {
      return { ok: false, error: String(err) };
    }
  },
};
```

Notice the description. It tells the model what the tool does, when it fails, and when to choose it ("Use this for source files, configs, and logs"). The model's tool-selection is a function of these strings. Vague descriptions produce vague selection. Boring, specific descriptions produce reliable selection.

```typescript
// tools/http.ts
export const http_get: Tool = {
  name: "http_get",
  description:
    "Perform an HTTP GET request and return the response body as text. " +
    "Times out after 10 seconds. Returns the status code in the result. " +
    "Use this to fetch public documentation, API responses, or web pages. " +
    "Do not use it to interact with internal services.",
  input_schema: {
    type: "object",
    properties: {
      url: { type: "string", description: "Absolute https:// URL." },
    },
    required: ["url"],
  },
  max_output_bytes: 64 * 1024,
  run: async ({ url }) => {
    const u = String(url);
    if (!u.startsWith("https://")) return { ok: false, error: "only https:// is allowed" };
    try {
      const ctl = AbortSignal.timeout(10_000);
      const res = await fetch(u, { signal: ctl });
      const body = await res.text();
      return { ok: true, value: `status: ${res.status}\n\n${body}` };
    } catch (err) {
      return { ok: false, error: String(err) };
    }
  },
};
```

Two design choices to call out. The tool enforces `https://` at the handler level even though the description says so, because the model will sometimes call it with `http://` anyway. The status code is folded into the value, not into a separate field, because the model reads strings.

```typescript
// tools/git.ts
export const git: Tool = {
  name: "git",
  description:
    "Run a read-only git command in the current repository and return its output. " +
    "Allowed subcommands: log, diff, show, status, branch, ls-files. " +
    "Any other subcommand is rejected. Use this to inspect history, " +
    "see uncommitted changes, or list tracked files.",
  input_schema: {
    type: "object",
    properties: {
      args: {
        type: "array",
        items: { type: "string" },
        description: "Arguments after `git`, e.g. ['log', '--oneline', '-5'].",
      },
    },
    required: ["args"],
  },
  max_output_bytes: 32 * 1024,
  run: async ({ args }) => {
    const a = (args as string[]) ?? [];
    const allowed = new Set(["log", "diff", "show", "status", "branch", "ls-files"]);
    if (a.length === 0 || !allowed.has(a[0])) {
      return { ok: false, error: `subcommand not allowed: ${a[0] ?? "(none)"}` };
    }
    const proc = Bun.spawn(["git", ...a.map(String)], { stdout: "pipe", stderr: "pipe" });
    const [stdout, stderr] = await Promise.all([
      new Response(proc.stdout).text(),
      new Response(proc.stderr).text(),
    ]);
    const code = await proc.exited;
    if (code !== 0) return { ok: false, error: stderr || `git exited ${code}` };
    return { ok: true, value: stdout };
  },
};
```

The `git` tool is interesting because it shows the allow-list pattern. The model can ask `git push --force` if it wants to. The handler refuses, returns a clear error, and the model goes back to the drawing board. The allow-list lives in the handler, not in the description, because trusting the model to obey natural-language constraints is exactly the trap [post two](/articles/your-agent-wants-root/) was about.

The `shell` tool from post two stays as it was. Four tools, registered:

```typescript
// agent.ts
import { Registry } from "./registry";
import { fs_read } from "./tools/fs";
import { http_get } from "./tools/http";
import { git } from "./tools/git";
import { shell } from "./tools/shell";

const tools = new Registry()
  .register(shell)
  .register(fs_read)
  .register(http_get)
  .register(git);
```

## The loop changes a little

Modern frontier models can ask for several tools in a single turn. Treat them as parallel calls and you save round trips. Treat them as sequential and the model will figure it out, but slowly.

```typescript
// agent.ts (continued)
const response = await client.messages.create({
  model: "claude-sonnet-4-6",
  max_tokens: 4096,
  system: SYSTEM_PROMPT,
  tools: tools.schemas(),
  messages,
});

messages.push({ role: "assistant", content: response.content });

if (response.stop_reason === "end_turn") {
  // ... print final answer, return
}

const calls = response.content.filter((b) => b.type === "tool_use");
const results = await Promise.all(
  calls.map(async (block) => {
    const result = await tools.dispatch(block.name, block.input as Record<string, unknown>);
    console.error(`> ${block.name} ${JSON.stringify(block.input)} -> ${result.ok ? "ok" : "err"}`);
    return {
      type: "tool_result" as const,
      tool_use_id: block.id,
      content: result.ok ? result.value : result.error,
      is_error: !result.ok,
    };
  }),
);

messages.push({ role: "user", content: results });
```

Two changes from post one. The loop runs all tool calls from a single turn in parallel with `Promise.all`. The `is_error` flag is set when the result was an error, because the model uses it to decide whether to retry or change strategy.

A short transcript shows the difference.

```
$ bun agent.ts "summarize the largest TypeScript file under src and tell me what changed in the last commit"
> fs_read {"path":"src/agent.ts"} -> ok
> git {"args":["log","-1","--stat"]} -> ok
src/agent.ts (185 lines) implements the agent loop against the Anthropic
Messages API. It builds a registry of four tools (shell, fs_read, http_get,
git), dispatches tool_use blocks in parallel, and stops when the model
returns an end_turn response or hits the 10-iteration budget. The last
commit added the parallel-dispatch path and a small output truncation
helper; net 38 lines added across agent.ts and registry.ts.
```

One turn. Two tool calls. They ran simultaneously. The model fused the results into a single answer.

## Designing tools that the model can actually use

After you have built the registry, the failure mode that bites you is not the code. It is the design. Three patterns that hold up.

**One tool per concept.** A `fs` tool with a union input schema (`mode: "read" | "list" | "stat"`) reads cleaner to a human and worse to a model. The model has to pick the right `mode` *and* the right arguments simultaneously. Split it: `fs_read`, `fs_list`, `fs_stat`. Three tools, three clear pictures. The model picks better and the schemas are simpler.

**Descriptions are written for the model.** The description is the only place the model learns when to use a tool. Be specific about inputs, outputs, error cases, and use cases. "Read a file" picks worse than the `fs_read` description above. The cost of the extra eighty tokens per turn is rounding error against the cost of the model picking the wrong tool and looping.

**Errors are data.** Every tool returns `{ ok, error }` rather than throwing. The model can read the error, reason about it, and choose: retry with different inputs, switch tools, or surface the failure to the user. An exception removes all of that.

The honest version of the tradeoff is in the table.

| Decision         | Cheap option              | Right option                            | Why                                                |
|------------------|---------------------------|-----------------------------------------|----------------------------------------------------|
| Tool granularity | one tool with a `mode`    | one tool per concept                    | Better selection, simpler schemas, simpler errors. |
| Description      | one sentence              | inputs, errors, when-to-use, in prose   | The model picks from the string.                   |
| Error model      | throw exceptions          | tagged-union `ToolResult` always        | The model can recover. Exceptions kill the loop.   |
| Output size      | return whatever the OS gives | cap per tool, truncate with a marker | Context windows are not log files.                 |
| Side effects     | run, hope, retry on error | idempotency keys or `confirm` argument  | Retries are real. Re-deletes are real.             |
| Parallel calls   | serial loop               | `Promise.all` over tool_use blocks      | Modern models batch. Latency drops by ~Nx.         |
| Sensitive ops    | "do not delete files" in prompt | allow-list in the handler          | The model will eventually try anyway.              |

## Failure modes worth naming

The first time you hit any of these you will think your code is broken. It is not. These are tool-layer problems specifically.

- **Tool sprawl.** Beyond roughly twenty tools, models start picking poorly. Domains blur. Two tools with similar descriptions get confused. The fix is not "better descriptions." It is fewer tools at any given turn, achieved by routing or by giving different sub-agents different toolboxes. We will come back to this in [post twelve](#).
- **Description rot.** A tool's behavior changes (faster timeout, new error mode, narrower input). The description does not. The model keeps picking it for the old reasons. Treat descriptions as part of the API surface. Version them.
- **Argument hallucination.** The model passes `path: "the file the user mentioned"` instead of an actual path because it lost track of the conversation. Strict schemas help. Server-side validation of plausible inputs (file exists, URL parses) helps more.
- **Hallucinated tools.** The model invents a tool name that is not in the registry. The registry returns `unknown tool: X` as an error. The model reads it and either retries with a real tool or apologizes. Both are correct behaviors. The bug would be silently dispatching to a default handler.
- **Output explosion.** A `cat large_file` or a `curl massive_api` blows the context window. The per-tool cap above handles it. Without a cap, you discover the problem at a token-cost billing alert.
- **Side effects on retry.** The model calls a tool, the call hangs, the loop retries, the tool runs twice. For idempotent reads, this is fine. For `git push`, `email_send`, or `database_write`, it is not. Idempotency keys or explicit `confirm: true` arguments are the only durable fixes.
- **Concurrent races.** Parallel tool calls can step on each other. Two `fs_write` calls to the same path in one turn is the classic example. The agent will not notice. You will, in production. The fix is per-tool serialization or explicit no-parallel marking in the dispatcher.
- **Auth surfaces in errors.** A tool that calls an internal API may put a bearer token in its error message when the request fails. That error becomes part of the conversation and gets sent back to the model on the next turn. Strip secrets from error strings at the handler.

## What this layer does not solve

This is the tool layer. It is not the context layer, the memory layer, or the identity layer. Things you might expect this post to cover that get a dedicated post later.

- **Where the tool definitions live.** Hardcoded into the agent works at the demo scale. Real fleets need a shared registry. That is MCP. [Post eight](#).
- **Which tools an agent should know about for a given task.** The registry above gives every tool to every turn. Per-task filtering and tool discovery are part of the context strategy. [Post four](#) and [post five](#).
- **Which agent gets which tools.** Different sub-agents need different toolboxes. The dispatch problem is the multi-agent problem. [Post ten](#) and [post twelve](#).
- **Who is allowed to call which tool.** Per-tool RBAC, capability tokens, human-in-the-loop approvals. [Post fourteen](#).
- **Identity for the call itself.** When the `http_get` tool calls an internal service, the service needs to know who is asking. [Post thirteen](#).

## Where this lands in the platform

Post one was the loop. Post two was the runtime around the loop. This post is what the loop reaches through to do anything useful. In the reference architecture from [post twenty-two](#), the registry is the seam between the agent process and everything else: MCP servers, internal APIs, file systems, side effects, the world.

The rule from earlier posts still holds. Each post adds one layer and explains why the layer below was not enough.

The layer below this one was an empty toolbox. The layer above is what the model knows when it picks. A model with a brilliant toolbox and no context will pick wrong every time. Next we make the model less blind.

## Next

**Part 4: Context Is the Product.** Models are commodities. Context is not. Sources of context, why retrieval alone is not enough, and a minimal `.AGENTS/` convention that loads context from disk into the same agent we have been building.
