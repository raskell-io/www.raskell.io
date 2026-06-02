+++
title = "What an Agent Actually Is"
date = 2026-06-02
description = "AI agent is the most overloaded word in the industry. This is the anatomy, the lineage, and a working implementation in roughly two hundred lines of TypeScript on Bun. Part one of The Agent Platform Handbook."

[taxonomies]
tags = ["ai-engineering", "ai-for-ops", "typescript"]
categories = ["deep-dives"]
series = ["the-agent-platform-handbook"]

[extra]
author = "Raffael"
image = "what-an-agent-actually-is.avif"
og_image = "what-an-agent-actually-is.png"
+++

> Part 1 of *The Agent Platform Handbook. From Loop to Platform.* A 22-post series that walks the agent stack from a single loop to a production platform. Next: [Your Agent Wants Root](/articles/your-agent-wants-root/).

If you sit in three meetings on the same day, you will hear the word *agent* used to mean three different things. A vendor will use it to mean a chat window with a logo. A platform team will use it to mean a workflow with a retry. A security lead will use it to mean a long-running process with credentials you cannot see. None of those people are entirely wrong. None of them are talking about the same thing.

This is the first post in a series that goes from a single agent loop up to a production platform. Before we can talk about isolation, tools, identity, or orchestration, we have to agree on what the thing in the middle of the diagram actually is. So we will define it, sketch its anatomy, trace the path the industry took to get here, and then build a working one in roughly two hundred lines of TypeScript on Bun.

By the end of the post the abstract noun is a concrete file you can run.

## A working definition

An agent is software with five properties. Drop any one and what you have is something else.

1. **A goal.** Not a single prompt. A target state, a task description, or a problem statement that the system is trying to satisfy.
2. **A model.** One or more inference engines that translate the current state plus the goal into a next step. Today this is almost always a large language model.
3. **A context.** Information the model can read beyond the user input. System prompts, documents, prior turns, environment state, configuration files.
4. **Tools.** A finite, named set of side-effecting operations the model is allowed to invoke. Reading a file. Running a shell command. Calling an API.
5. **A loop.** The model picks a tool, the tool runs, the result re-enters the context, the model picks again. The loop ends when the goal is satisfied, the budget is exhausted, or a stop condition is hit.

There is usually a sixth property in production, **memory**, which is state that survives the loop. We will treat memory as a separate layer in [post six](#) and keep this first agent stateless.

A system with all five properties is an agent. A system with four is something else worth a name. A chat window has goal, model, context, and a loop, but no tools, so it is a chatbot. A CI pipeline has a goal, context, tools, and a loop, but no model, so it is a workflow. A function call has a goal, a model, context, and a tool, but no loop, so it is a one-shot completion. The presence of the loop is what makes the behavior open-ended. The presence of tools is what makes the loop matter.

The architecture diagram for every agent ever shipped looks like this.

{% diagram(title="The agent loop") %}
                          +--------------+
                          |    Goal      |
                          | (user task)  |
                          +-------+------+
                                  |
                                  v
   +------------+         +---------------+         +------------+
   |  Context   +-------->|     Model     |<--------+   Memory   |
   | docs, env, |         | next action?  |         | (optional) |
   | prior turns|         +-------+-------+         +------------+
   +------------+                 |
                                  | tool call
                                  v
                          +---------------+
                          |   Tool        |
                          | shell, http,  |
                          | file, custom  |
                          +-------+-------+
                                  |
                                  | result
                                  v
                          +---------------+
                          |    Runtime    |
                          | (where the    |
                          |  side effect  |
                          |  happens)     |
                          +-------+-------+
                                  |
                                  v
                       +----------+----------+
                       | done? --no--> loop  |
                       |   |                 |
                       |  yes                |
                       |   v                 |
                       | return              |
                       +---------------------+
{% end %}

The diagram is small on purpose. Almost every post in this series will redraw it with one component opened up. Post two opens the runtime. Post three opens the tool. Post four opens the context. Post six opens the memory. Post seven opens the model. The capstone in post twenty-two assembles all of them into a reference architecture.

Hold the picture in your head. We will come back to it.

## How we got here

You can read the rest of this section as background and skip the first two subsections if you have already lived through them. The third subsection, on the 2024 to 2026 stretch, is worth the read either way because it explains why everyone you work with is suddenly using the word *agent*.

### The old AI

The idea of a software agent is older than the modern LLM by about fifty years. Terry Winograd's SHRDLU, in 1970, was a program that took natural-language commands, planned actions in a simulated blocks world, executed them, and updated its internal state. It had a goal, a model of the world, a set of tools, and a loop. It was an agent. It worked beautifully on the blocks world and fell over the instant you stepped outside it, because the model of the world was hand-coded and the language understanding was brittle.

Through the 1980s and 1990s the idea kept coming back under different names. Expert systems wrapped business logic in inference rules. The Belief-Desire-Intention architecture, formalized by Bratman and others, gave agents an explicit cognitive model: what they believed, what they wanted, what they intended to do next. There were good papers, working systems, and shipping products. The thing all of them missed was a usable model of language. You could specify the agent's goals in formal logic or in a structured DSL. You could not say "go book me a flight" and have it parse.

The lesson from this era is that the architecture has been right for decades. The bottleneck was the model.

### The chat era

When GPT-3 arrived in 2020 and ChatGPT in late 2022, the language bottleneck broke. You could finally write a goal in English and the system would respond coherently. The first response from the industry was to wrap that capability in a chat window and sell it. That is not an agent. There is no loop, no tools, and the model cannot do anything to the world it lives in. It is a very good autocomplete with a memory of the conversation.

The agent pattern only came back when somebody asked the obvious next question. If the model can read and write English, and we can let it call functions, can we close the loop and let it act?

Two papers and two viral demos answered that question between late 2022 and early 2023.

The papers came first. *ReAct: Synergizing Reasoning and Acting in Language Models* by Yao and others, published in October 2022, showed that interleaving a reasoning step with a tool-use step produced better performance than either alone. The blueprint was small enough to fit on a napkin: think, act, observe, repeat. It became the de facto pattern for almost every agent shipped since.

The demos came in early 2023. Auto-GPT, released by Toran Bruce Richards in March 2023, wrapped GPT-4 in exactly that loop and let it run unattended. It demoed brilliantly and broke constantly. BabyAGI, by Yohei Nakajima a few weeks later, did the same thing with about a hundred lines of Python. Neither was production-grade. Both made the idea legible to people who had never read the ReAct paper. After Auto-GPT you could explain an agent by saying "imagine ChatGPT but it keeps going until the task is done." That was a marketing breakthrough, not an engineering one, but marketing is how ideas spread.

OpenAI's function-calling API, launched in June 2023, was the engineering breakthrough that followed. Instead of trying to parse "the model wants to call `search(query)`" out of free-form prose, you declared your tools with JSON schemas and the model returned a structured tool call. Anthropic's `tool_use` shipped on the same pattern. With function calling, the agent loop stopped being a regex problem and started being a software problem. We will come back to this in [post three](#).

The 2023 wave produced the first real frameworks: LangChain in October 2022, AutoGen in late 2023, CrewAI and LangGraph in 2024. They competed on abstractions. Some won, some lost. We will review them in [post nine](#). The point for now is that by mid-2024, building an agent was a Python or TypeScript exercise rather than a research project.

### The 2025 to 2026 bundling

Here is where the word *agent* stopped being a research term and became a product category. It happened in two waves.

The first wave was builder-facing. In early 2025, Anthropic shipped Claude Code, a command-line agent that ran on your laptop, edited files, ran shell commands, and could spawn sub-agents. OpenAI relaunched Codex as a real agent rather than a completion endpoint. The open-source community produced OpenCode and a half-dozen adjacent projects (aider, continue, opencoder) that gave the same shape a vendor-neutral surface. None of these were technically novel. The loop was the ReAct loop. The tools were `bash` and `edit`. What was new was the bundling: the loop, the tools, and the runtime arrived together, in a binary you could install in thirty seconds. Once that shipped, every infrastructure and platform engineer had a working agent on their laptop within a week.

I wrote about what came next in [What Sixteen AI Agents Taught Me About Management](/articles/what-sixteen-ai-agents-taught-me-about-management/). Once builders had working agents, they wanted to run more than one. Once they ran more than one, they hit coordination problems. Once they hit coordination problems, they discovered that agent orchestration is a management problem with a software wrapper.

The second wave was assistant-facing and it broke out of the developer audience entirely. OpenClaw shipped in early 2026 and crossed a hundred thousand GitHub stars in its first week. Hermes followed in the same lane. Both took the agent pattern and gave it to people who do not write code. A research task. A contract review. A calendar negotiation. The same loop, with different tools and different context. The enterprise buyer stopped being the developer tooling team and started being any line of business with a workflow.

That is where the market is right now, as of mid-2026. Every engineering org has builders running coding agents locally. Every business org has someone piloting an assistant agent. Almost no organization has a coherent platform underneath any of it. The point of this series is to close that gap.

## Build one

You learn what an agent is by building one. The code that follows is a complete, working agent in TypeScript on Bun. It is roughly two hundred lines. It reads a goal from the command line, calls Anthropic's API with a small tool registry, executes tool calls, feeds results back, and stops when the model is done or the iteration budget is exhausted.

You will need three things to follow along.

```
bun --version          # 1.1 or newer
echo $ANTHROPIC_API_KEY  # any valid key
bun add @anthropic-ai/sdk
```

The full source for this post is in [`the-agent-platform-handbook`](https://github.com/raskell-io/the-agent-platform-handbook) at tag `post-01`. You can clone it and run `bun agent.ts "list the three largest files under /etc"` if you would rather read the code in your editor.

### The tool interface

The smallest unit worth defining first is a tool. A tool has a name, a description the model can read, a JSON schema for its input, and a function that runs the side effect and returns a string.

```typescript
// tools.ts
export type Tool = {
  name: string;
  description: string;
  input_schema: {
    type: "object";
    properties: Record<string, unknown>;
    required?: string[];
  };
  run: (input: Record<string, unknown>) => Promise<string>;
};
```

That is the entire contract. The `run` function returns a string because the model will read the result as text. If your tool returns structured data, serialize it with `JSON.stringify` and let the model parse it. We will revisit this choice in [post three](#) when we look at structured outputs more carefully.

A shell tool, which is the most useful single tool you can give an agent, looks like this.

```typescript
// tools.ts (continued)
export const shell: Tool = {
  name: "shell",
  description:
    "Run a shell command in the current working directory and return its stdout, stderr, and exit code as JSON.",
  input_schema: {
    type: "object",
    properties: {
      command: {
        type: "string",
        description: "The shell command to run. Runs under `sh -c`.",
      },
    },
    required: ["command"],
  },
  run: async ({ command }) => {
    const proc = Bun.spawn(["sh", "-c", String(command)], {
      stdout: "pipe",
      stderr: "pipe",
    });
    const [stdout, stderr] = await Promise.all([
      new Response(proc.stdout).text(),
      new Response(proc.stderr).text(),
    ]);
    const code = await proc.exited;
    return JSON.stringify({ code, stdout, stderr });
  },
};
```

A few things to notice. The description is written for the model, not for you. Be specific about what the tool does, what it returns, and what its constraints are. The JSON schema is the contract the model sees when it decides whether to call this tool. Bun's `Bun.spawn` returns streams, so we read both stdout and stderr and join them with the exit code into one JSON payload the model can reason about.

This tool will run any shell command. That is wildly unsafe. Do not deploy it. We will spend [post two](#) explaining why and what to do about it. For a single-user, single-directory demo on your own laptop, it is fine.

### The loop

The loop is the part most explanations rush. Take it slowly.

```typescript
// agent.ts
import Anthropic from "@anthropic-ai/sdk";
import type { MessageParam, ToolResultBlockParam } from "@anthropic-ai/sdk/resources/messages";
import { shell, type Tool } from "./tools";

const client = new Anthropic();
const tools: Tool[] = [shell];

const SYSTEM_PROMPT = `You are a careful command-line assistant.
You have access to a shell tool. Use it to investigate the user's
request and answer concretely. When you have the answer, stop calling
tools and reply in plain text.`;
```

We pull in the SDK, register one tool, and write a system prompt. The system prompt is the first piece of context that is not user input. We will spend [post four](#) on how to grow this into a real context strategy. For now it is a single paragraph telling the model how to behave.

```typescript
// agent.ts (continued)
async function step(messages: MessageParam[]) {
  return client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    tools: tools.map(({ run, ...t }) => t),
    messages,
  });
}
```

Every call to the model is a `step`. The tool list we send is the schema only, never the `run` function, so we strip it. The model returns a message that is either a final text answer or a request to call one or more tools.

The loop itself is fifty lines.

```typescript
// agent.ts (continued)
export async function run(goal: string, maxIterations = 10) {
  const messages: MessageParam[] = [{ role: "user", content: goal }];

  for (let i = 0; i < maxIterations; i++) {
    const response = await step(messages);
    messages.push({ role: "assistant", content: response.content });

    if (response.stop_reason === "end_turn") {
      const text = response.content
        .filter((b) => b.type === "text")
        .map((b) => (b as { text: string }).text)
        .join("\n");
      console.log(text);
      return;
    }

    if (response.stop_reason !== "tool_use") {
      throw new Error(`unexpected stop reason: ${response.stop_reason}`);
    }

    const toolResults: ToolResultBlockParam[] = [];
    for (const block of response.content) {
      if (block.type !== "tool_use") continue;
      const tool = tools.find((t) => t.name === block.name);
      if (!tool) {
        toolResults.push({
          type: "tool_result",
          tool_use_id: block.id,
          content: `unknown tool: ${block.name}`,
          is_error: true,
        });
        continue;
      }
      console.error(`> ${block.name} ${JSON.stringify(block.input)}`);
      try {
        const result = await tool.run(block.input as Record<string, unknown>);
        toolResults.push({ type: "tool_result", tool_use_id: block.id, content: result });
      } catch (err) {
        toolResults.push({
          type: "tool_result",
          tool_use_id: block.id,
          content: String(err),
          is_error: true,
        });
      }
    }

    messages.push({ role: "user", content: toolResults });
  }

  console.error(`iteration limit (${maxIterations}) reached`);
}
```

Walk through it once. We start with the goal as the first user message. We call the model. We append the model's response to the conversation. If the model says `end_turn`, we print the final text and return. If the model says `tool_use`, we find the requested tool, run it, and append the result as a user-role `tool_result` block. The model sees the result on its next turn and decides what to do.

The `for` loop with `maxIterations` is the only thing standing between this agent and an unbounded run. We will spend a chunk of [post sixteen](#) on whether iteration counts are the right budget unit. They are not, but they are the simplest. Start with the simplest.

The entry point is two lines.

```typescript
// agent.ts (continued)
const goal = process.argv.slice(2).join(" ");
if (!goal) {
  console.error("usage: bun agent.ts '<goal>'");
  process.exit(1);
}
await run(goal);
```

That is the entire agent. Around one hundred and forty lines of code with the imports and the system prompt. It is a real agent by the definition we started with. It has a goal, a model, context (the system prompt and the running message list), tools (one of them), and a loop (the `for` with `maxIterations`).

### Running it

A small transcript makes the loop concrete.

```
$ bun agent.ts "what is the largest TypeScript file under src and what does it do?"
> shell {"command":"find src -name '*.ts' -type f -printf '%s %p\n' | sort -nr | head -5"}
> shell {"command":"wc -l src/agent.ts"}
> shell {"command":"head -40 src/agent.ts"}
The largest TypeScript file under src is src/agent.ts at 4837 bytes
(150 lines). It implements an agent loop against the Anthropic Messages
API. It defines a single shell tool, sends the user's goal to the model,
executes any tool calls the model requests, feeds the results back, and
stops when the model returns an end_turn response or the iteration
budget of 10 steps is exhausted.
```

The lines prefixed with `>` are the agent's tool calls, logged from the `console.error` in the loop. The final paragraph is the model's `end_turn` text. Three tool calls, one final answer, one closed loop.

You have an agent.

## Why most agent demos are not agents

Now that the definition is concrete and you have a working example, the question of what is and is not an agent becomes useful. The honest version of the answer is in the table.

| System                              | Goal | Model | Context | Tools | Loop | Verdict     |
|--------------------------------------|:----:|:-----:|:-------:|:-----:|:----:|-------------|
| ChatGPT, 2022 launch                 |  Y   |   Y   |    Y    |   N   |  Y   | Chatbot     |
| ChatGPT today (browse, code, files)  |  Y   |   Y   |    Y    |   Y   |  Y   | Agent       |
| Cursor's inline edit                 |  Y   |   Y   |    Y    |   Y   |  N   | Completion  |
| A GitHub Actions workflow            |  Y   |   N   |    Y    |   Y   |  Y   | Workflow    |
| A pure retrieval-augmented chat      |  Y   |   Y   |    Y    |   N   |  Y   | Chatbot+RAG |
| A function-calling API call          |  Y   |   Y   |    Y    |   Y   |  N   | Tool call   |
| Claude Code in the terminal          |  Y   |   Y   |    Y    |   Y   |  Y   | Agent       |
| The script in this post              |  Y   |   Y   |    Y    |   Y   |  Y   | Agent       |
| Auto-GPT, BabyAGI                    |  Y   |   Y   |    Y    |   Y   |  Y   | Agent       |
| OpenClaw                             |  Y   |   Y   |    Y    |   Y   |  Y   | Agent       |
| A Temporal workflow with an LLM step |  Y   |   Y   |    Y    |   Y   |  Y   | Agent       |

The first two rows are the same product two years apart. ChatGPT launched in November 2022 as a chat window with no tools. Today the same web UI can browse the live web, run Python in a sandboxed runtime, convert and read PDFs, and generate images. It crossed the line. The interesting thing is that the user-facing language did not change. It is still called a chatbot. Under the definition we are working with, it is an agent. The boundary moved underneath the marketing.

That is the pattern to expect across the industry over the next two years. Every chat product will quietly grow tools. Every workflow product will quietly grow a model. The labels will lag the architecture by a year or two. If you only listen to the labels, you will miss the moment a system becomes something you should be governing differently.

The pure RAG row is the one that does not cross. A retrieval-augmented chat that only enriches its own context does not get tools in the sense that matters. The model cannot decide to do something different based on what it finds. It just answers from a richer context. Useful, sometimes excellent, not an agent. The moment that same system gains a "search again with a different query" or "fetch this document" tool, it is.

The Temporal-with-LLM row is interesting for the opposite reason. That is an agent. It is also a workflow. The two categories are not mutually exclusive. [Post seventeen](#) will explain why the production version of almost every agent ends up wrapped in a durable workflow.

The point of the table is not to gatekeep the word. It is to point at the conceptual distinction. A chatbot fails by being uninformed. An agent fails by acting wrong. Once your system can act, the failure mode changes, and so does what you owe the operator.

## Failure modes

The script above will work the first ten times you run it. Some of the failure modes it has are obvious. Some you only see in production. The honest list, in roughly the order you will hit them.

- **Infinite loops disguised as progress.** The model can call tools forever without converging. `maxIterations = 10` saves you from your own demo today. It will not save you when somebody asks a harder question tomorrow. Real budgets are token-based or wall-clock-based, not step-based. We will fix this properly in [post sixteen](#).
- **Cost runaway.** Every iteration is a full model call with the entire conversation as input. The token cost grows roughly quadratically with the number of steps because each new turn re-sends every prior turn. A ten-step loop costs more than ten times a one-step call. Prompt caching helps. Smaller models for the cheap turns help more. We will spend [post eighteen](#) on this.
- **Lying about success.** The model can claim it completed the task without actually verifying. The shell tool does not check whether the answer is correct. You can ask "did you do X?" and get "yes" when the truth is "I tried, it failed, I gave up." Evals exist for this. [Post sixteen](#) explains them.
- **Broken tool output.** If a tool returns a megabyte of binary data, the model will choke or hallucinate. Tool outputs need to be summarized, truncated, or schema-shaped. The agent will not do this for you.
- **No isolation.** The shell tool will run `rm -rf $HOME` if the model decides that is the right command. The model will not decide this often. It will decide it at least once. That is the topic of the next post.
- **Hidden state.** Every tool call has side effects on the runtime. Files get created. Network calls get made. Database rows get inserted. The conversation log does not capture any of it. You can replay the model's reasoning. You cannot replay the world it was reasoning about. Idempotency and durable execution are how serious systems handle this.
- **Concurrency edge cases.** This loop is sequential. The model can ask for multiple tools in one turn, and the example above runs them in order. If two of those tools both want to write the same file, you have a bug the model cannot see.

None of these are reasons not to build an agent. They are the reasons the rest of this series exists.

## What this post left out on purpose

A long post still leaves things out. The intentional omissions, with pointers to the posts that pick them up.

- **Isolation.** The shell tool is dangerous. Fixed in [post two: Your Agent Wants Root](/articles/your-agent-wants-root/).
- **A real tool registry.** One tool is the demo. A useful agent has four to a dozen. Covered in [post three](#).
- **Context strategy.** The system prompt is a paragraph. Real systems load context from disk and shape it per task. Covered in [post four](#) and [post five](#).
- **Memory across sessions.** The agent forgets everything between runs. Covered in [post six](#).
- **Model selection.** We hardcoded one model. Production agents route. Covered in [post seven](#).
- **Tool protocol.** The tool interface is bespoke. The industry converged on MCP. Covered in [post eight](#).
- **Frameworks.** We built this raw. The framework conversation is in [post nine](#).
- **Identity, evals, durability, economics, governance.** All of arc four and five.

If you read the table of contents for the series you can see the shape: every post in the rest of the series fixes one limitation of the agent you just built.

## Where this lands in the platform

The diagram at the top of this post is the smallest box in the eventual reference architecture. The agent loop sits inside a runtime. The runtime sits inside a fleet. The fleet sits inside a platform with identity, observability, governance, and a control plane. The shape we end up with in [post twenty-two](#) is the same shape we started with, blown up to enterprise scale, with every component opened up and given its own production-grade story.

You can hold the whole series in your head with a single rule. Each post adds one layer of the stack and explains why the layer below was not enough on its own.

The next layer up is the runtime. The shell tool you just gave a frontier model is a loaded gun. Next week we explain how to point it somewhere safe.

## Next

**Part 2: [Your Agent Wants Root](/articles/your-agent-wants-root/).** Why a Docker container is not enough, and what Firecracker, gVisor, and Kata actually solve. Publishes Thursday.
