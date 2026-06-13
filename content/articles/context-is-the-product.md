+++
title = "Context Is the Product"
date = 2026-06-13
description = "Models are commodities. Context is not. The sources of context an agent draws on, why retrieval alone is not enough, and a minimal .AGENTS/ convention that loads context from disk into the same harness we have been building. Part four of The Agent Platform Handbook."

[taxonomies]
tags = ["ai-engineering", "platform-automation", "typescript"]
categories = ["patterns"]
series = ["the-agent-platform-handbook"]

[extra]
author = "Raffael"
image = "context-is-the-product.avif"
og_image = "context-is-the-product.png"
+++

> Part 4 of *The Agent Platform Handbook. From Loop to Platform.* Previous: [Tools: How Agents Actually Do Things](/articles/tools-how-agents-actually-do-things/). Next: Retrieval Is a Tool, Not a Layer.

In [post one](/articles/what-an-agent-actually-is/) we built the agent harness: a loop, a one-tool registry, a system prompt, a dispatcher, and an iteration budget. In [post two](/articles/your-agent-wants-root/) we slid a sandboxed runtime underneath the shell tool without touching the loop. In [post three](/articles/tools-how-agents-actually-do-things/) we promoted the registry into a real toolbox and let the model call several tools in one turn. The harness sits at tag [`post-03`](https://github.com/raskell-io/the-agent-platform-handbook/tree/post-03) today: a loop, a registry, four sandboxed tools, parallel dispatch, output caps, error envelopes. The pieces fit. The agent answers concrete questions about the directory it is pointed at.

It also walks into every conversation knowing nothing.

You can hand the same harness to ten different projects this afternoon. It will run. It will not know that your repo uses Bun and not Node, that your team writes "do not" instead of "don't", that `git push --force` is a fireable offense on the `main` branch, that the README is two years out of date, that your secrets live in `1Password://Engineering`, or that the term "Zentinel" in your prompt means a specific WAF tuner and not a generic security product. It will figure most of that out by running tools, slowly, and it will get the rest of it wrong.

The model is not what makes an agent good at your work. The context is. This is the post that builds that layer into the same harness, ships it as tag [`post-04`](https://github.com/raskell-io/the-agent-platform-handbook/tree/post-04), and explains why the convention is converging on a directory called `.AGENTS/` rather than a single file.

## Why the model is not the product

The frontier model market in mid-2026 has roughly five vendors shipping roughly comparable coding agents. Pick any of them. You can swap them at the loop boundary and most of your agents keep working. What does not swap is the system prompt, the tool definitions, the project documentation, the conventions, the glossary, and the working knowledge the model brings into every turn. Those are yours. They are also the difference between an agent that ships and an agent that hallucinates.

This is not a new observation in the field, but it is a recent one in the product narrative. For most of 2023 and 2024 the public story was "the new model is twice as smart." The internal story for anyone running agents in production was "the old model is fine; we cannot get useful context into it cheaply enough." The same evals that the vendor leaderboards measure are the ones a small team can saturate with a half-decent context strategy, on a year-old model, for an order of magnitude less money per call.

You can hold this in your head with one frame. The model is software you rent. The harness is software you write. The context is the only piece of either one that is your team's, your project's, your codebase's. The model is replaceable. The context is what makes the replacement work at all.

That is the thesis of this post and it determines everything that follows.

## The three sources of context

An agent gets context from three places, and the engineering decisions you make at each layer are different.

{% diagram(title="Sources of context for an agent turn") %}

   +-----------------------+        what the operator pre-loads
   |   Static context      |        before the first turn ever runs.
   |  --------------       |        cheap to author, expensive to fix
   |  system prompt        |        once a million calls have run on
   |  project rules        |        it. ships with the harness, lives
   |  glossary, conventions|        in git, reviewed by humans.
   +-----------+-----------+
               |
               v
   +-----------------------+        what arrives during the turn,
   |   Dynamic context     |        per request, often per tool call.
   |  --------------       |        the agent decides what to fetch.
   |  retrieved docs       |        the model never sees the source
   |  tool outputs         |        of truth, only the slice the
   |  fetched URLs         |        retriever returned.
   +-----------+-----------+
               |
               v
   +-----------------------+        what survives across turns and
   |   Persistent context  |        across sessions. notes the agent
   |  --------------       |        writes for its future self. covered
   |  session memory       |        in post six. mentioned here only
   |  cross-session memory |        so the diagram is complete.
   +-----------------------+

{% end %}

Static context is the layer this post is about. It is the cheapest layer to get right and the one most teams skip because it feels like documentation rather than engineering. It is also the layer that compounds: every other layer of context loads on top of it, and a confused static layer makes every retrieval ambiguous and every tool output harder to interpret.

Dynamic context is what post three started, with `fs_read` and `http_get`. It is also what RAG systems do at industrial scale. The model decides what it needs and a tool fetches it. We will come back to dynamic context as its own design problem in [post five](#) when we look at retrieval, embedding stores, and the per-task subsetting that lets a large repository fit into a small turn.

Persistent context is memory. Notes the agent writes to itself. A session log. A long-running working set the next conversation gets to read. [Post six](#) is dedicated to it because the engineering story is genuinely different, and the design choices are larger than they look.

The honest version of the rule is that static context is necessary and not sufficient. Get it right and the other two layers have a fighting chance. Get it wrong and no amount of retrieval saves you.

## How we got here

Static context started life as the system prompt. A string at the top of a Python file. Six sentences. "You are a helpful assistant who specializes in customer support for an airline."

That worked until it did not. The pattern that broke it was the same pattern every working agent now lives inside: as soon as a model has tools, the operator has to tell it which tool to pick for which job, what the inputs mean, what the failure modes are, what the project's conventions are, and what is out of scope. Six sentences cannot hold any of that.

The industry tried to fix it in four moves, roughly in order.

**Long system prompts (2022 to 2023).** The first move was to make the string longer. Six sentences became six paragraphs. Then six pages. The OpenAI Cookbook and the early LangChain prompts shipped with the model's role, examples, rules of engagement, output format, and a list of constraints. It worked, in the sense that the agent behaved better. It also produced a maintenance problem: when the team grew, the prompt drifted, nobody owned it, and small edits broke distant behaviors. Prompts were software with no test suite.

**Retrieval-augmented generation (2020 to 2024).** The original RAG paper by Lewis and others at FAIR landed in 2020, two years before ChatGPT, and described a system that fetched relevant documents from a corpus and concatenated them into the model's input. By 2023 the pattern was the default for any system that needed to answer over a private corpus. By 2024 every vector database vendor had a product and a marketing budget. RAG solved the corpus problem. It did not solve the conventions problem. A retrieval system can pull "the most relevant page about how to deploy" out of fifty thousand pages of docs. It does not know that your deploy convention changed last week and the relevant page is three weeks out of date.

**Long context windows (2024).** Gemini shipped a one-million-token context window in February 2024. Claude followed with two hundred thousand, then five hundred thousand, then a million. The new story was "you do not need retrieval; just put everything in the prompt." It is true for some workloads. It is wildly expensive for most, because the per-call cost scales linearly with the input tokens you paid for, even when prompt caching is in play. Long contexts made some classes of problem tractable. They did not change the engineering question. The question is still "what should the model know on every turn, regardless of which slice of the corpus is loaded."

**The convention layer (2025 to 2026).** The pattern that worked, and that converged across vendors, was a per-project file. The team puts the agent's operating context in a markdown file at the root of the repo. Anthropic's Claude Code shipped `CLAUDE.md` in early 2025. Cursor's IDE agent shipped `.cursorrules` around the same time. OpenAI Codex normalized `AGENTS.md`. Aider had its own convention. Continue had another. Through 2025 the file proliferated and the names diverged. In early 2026 a working group of vendor engineers, after enough customers complained about maintaining four near-identical files in every repo, started consolidating on a single convention. The shape they landed on was a directory, not a file, called `.AGENTS/`.

The lineage from "long system prompt" to ".AGENTS/ directory" is one continuous line. Every step was a reaction to the previous step failing under scale. Each step kept what worked and added what was missing. The directory at the end is the smallest thing the industry could agree on that solves the problem the file did not.

## Why a directory and not a file

If you have ever worked on a repo with a sprawling `CLAUDE.md` you know why the file is not enough.

A single markdown file in the repo root has three failure modes that show up almost immediately.

The first is conflict at scale. Two people edit the same file from different feature branches and the merge is painful enough that one of them gives up. The team stops writing context updates because the file is a contested resource.

The second is loss of structure. The file grows section by section. Some sections are conventions. Some are glossaries. Some are reminders about which scripts do what. Some are project history. The model reads it as one giant string and the operator cannot tell, six months later, which section is still load-bearing and which is dead.

The third is the inability to scope. The same file gets loaded for every task, regardless of whether the agent is doing a database migration or fixing a typo. A small repo can afford to pay for the whole file every turn. A large repo cannot. There is no way to say "load this section only when the task touches the API layer."

A directory fixes all three. You get one file per concern. Conflicts move from line-level to file-level, which is easier. Structure becomes the directory layout, which is self-documenting. Scoping becomes a load-order decision that the loader can make per task, with budgets, with priorities, and with reproducible behavior. The convention is small and the engineering surface that wraps it is well-understood: read files, concatenate, cap.

There is a fourth, subtler reason. A directory is the natural seam between project context and agent identity. Project context belongs to the project and lives in git. Agent identity, the system prompt that says "you are a careful command-line assistant," belongs to the harness and ships with it. A file in the repo root muddles those two. A directory lets the harness own the loader and the project own the contents, and they meet at a stable interface.

That is the architecture the rest of this post adds to the harness.

## The mental model

Before the code, the picture.

{% diagram(title="The context layer in the agent harness") %}

    repo on disk                       harness                       model
    -----------                        -------                       -----

    .AGENTS/                       +----------------+
    +-- overview.md      ----+     |                |
    +-- conventions.md   ----+---->|  loadContext   |
    +-- glossary.md      ----+     |                |
    +-- security.md      ----+     +-------+--------+
    +-- ...                                |
                                           | LoadedContext
                                           v
                                  +-----------------+         system prompt
                                  |  systemPrompt   |---------------------->
                                  |  CORE + ctx     |
                                  +-----------------+

                                           ^
                                           |
                                  +-----------------+
                                  |  loop / step    |
                                  +-----------------+

{% end %}

Read it left to right. The project owns a directory of markdown files. The harness owns a loader that reads them at startup, applies a byte budget, and produces a `LoadedContext` object. The harness's system-prompt builder takes the core prompt (the agent's role, the toolbox description) and concatenates the rendered context block underneath it. The loop and step functions never know any of this happened. Same `step(messages, system)` call as before, with a different `system` string.

The loader has three responsibilities, and they are worth naming because each one is a place where teams get tempted to do something clever and pay for it.

**Read the files.** Deterministically, in a defined order. The order matters because the model attends to the start of the prompt differently than the middle. Put the high-signal files first.

**Cap the total size.** A byte budget across all sources. Anything that does not fit is either dropped or truncated with a visible marker, never silently rolled off.

**Render with attribution.** Each source is wrapped in a `<context path="...">` block so the model can tell the user which file the rule came from. This is cheap, costs maybe twenty tokens per source, and turns "the conventions say to never use the shell tool to write files" into a citation the operator can audit.

That is the whole thing. Nothing else belongs in the loader. Per-task filtering, embedding-based selection, dynamic retrieval, and memory are separate layers that the next two posts will build on top of this one.

## Build the loader

The harness from `post-03` has six files. We add a seventh: `context.ts`. We also create the `.AGENTS/` directory with three example sources.

The `context.ts` module exports one function. Roughly seventy lines.

```typescript
// context.ts
import { readFile, readdir, stat } from "node:fs/promises";
import { join } from "node:path";

export type ContextSource = {
  path: string;
  bytes: number;
  content: string;
  truncated: boolean;
};

export type LoadedContext = {
  sources: ContextSource[];
  rendered: string;
  totalBytes: number;
  budgetBytes: number;
};

export type ContextOptions = {
  dir?: string;
  maxBytes?: number;
};

const DEFAULT_DIR = ".AGENTS";
const DEFAULT_MAX_BYTES = 32 * 1024;
const PRIORITY = ["overview.md", "conventions.md", "glossary.md"];
```

Three types and three constants. `ContextSource` carries enough metadata for the operator to debug what got loaded. `LoadedContext` carries the rendered string for the system prompt plus accounting for the operator. `ContextOptions` is the only knob: a directory and a byte budget. Defaults match the convention.

The ordering policy is two lines.

```typescript
function orderEntries(entries: string[]): string[] {
  const present = new Set(entries);
  const head = PRIORITY.filter((n) => present.has(n));
  const tail = entries
    .filter((n) => !PRIORITY.includes(n))
    .filter((n) => n.endsWith(".md"))
    .sort();
  return [...head, ...tail];
}
```

Three priority files load first in a fixed order: `overview.md`, `conventions.md`, `glossary.md`. Everything else loads alphabetically. The model attends to the start of the prompt more strongly than to the middle, so the policy puts the highest-signal files at the start and lets the rest tail in.

The load itself reads each file, accounts for it against the budget, and either takes it whole, truncates it, or stops.

```typescript
export async function loadContext(opts: ContextOptions = {}): Promise<LoadedContext> {
  const dir = opts.dir ?? process.env.AGENTS_DIR ?? DEFAULT_DIR;
  const budget = opts.maxBytes ?? DEFAULT_MAX_BYTES;

  if (!(await isDir(dir))) {
    return { sources: [], rendered: "", totalBytes: 0, budgetBytes: budget };
  }

  const entries = await readdir(dir);
  const ordered = orderEntries(entries);

  const sources: ContextSource[] = [];
  let used = 0;

  for (const name of ordered) {
    const path = join(dir, name);
    const raw = await readFile(path, "utf8");
    const bytes = Buffer.byteLength(raw, "utf8");
    const remaining = budget - used;

    if (bytes <= remaining) {
      sources.push({ path, bytes, content: raw, truncated: false });
      used += bytes;
      continue;
    }

    if (remaining < 256) break;

    const head = raw.slice(0, remaining);
    const note = `\n\n[truncated: ${bytes - remaining} more bytes]`;
    sources.push({ path, bytes: remaining, content: head + note, truncated: true });
    used += remaining;
    break;
  }

  const rendered = sources
    .map((s) => `<context path="${s.path}">\n${s.content.trimEnd()}\n</context>`)
    .join("\n\n");

  return { sources, rendered, totalBytes: used, budgetBytes: budget };
}
```

A few details to call out, because the cheap version of this loader gets every one of them wrong.

The directory defaults to `.AGENTS` but accepts an environment override through `AGENTS_DIR`. The override lets you point a single binary at a per-project context without rewriting the harness.

The budget defaults to thirty-two kilobytes. That is roughly eight thousand tokens at the typical English-to-token ratio, which is generous on a modern model and cheap with prompt caching. Pick the budget your model and your wallet can sustain, not the budget that fits "everything you wrote."

The truncation marker is visible. The model reads `[truncated: 4096 more bytes]` and knows the source was clipped. That matters because the model can decide to ask a tool to read the rest, which is exactly the behavior you want when a file is too big to fit in the prompt.

The render wraps each source in a `<context path="...">` tag. The tag is not a special token. The model treats it as structure because it has seen similar shapes in its training data. Cite-back behavior comes for free.

The loader never errors on a missing directory. If `.AGENTS/` does not exist, the loader returns an empty context and the harness falls back to the core prompt. That is the right default for a small project that has not opted in yet.

## A sample `.AGENTS/`

The repo at `post-04` ships with three sources. They are short on purpose. The point is the shape, not the content.

```
.AGENTS/
├── overview.md       what this repo is, how it is organized
├── conventions.md    rules the agent must follow per tool
└── glossary.md       terms specific to this project
```

The shape is the contract. Any agent that loads from `.AGENTS/` should expect these three files. Anything else is project-specific. A security-sensitive project might add `security.md`. A monorepo might add `services.md` with one section per service. A multi-platform repo might add `platforms.md`. The convention does not constrain those.

The content of `conventions.md` matters more than people expect, so the example in the repo is worth quoting in part.

```
## Filesystem

- Read files with `fs_read`, not `shell`. The shell tool runs inside a
  sandbox that does not see the host filesystem.
- Do not write files. There is no write tool in this harness yet.
- Do not assume the working directory. Use absolute paths or paths
  rooted at the repo, never `~`.
```

That paragraph fixes about four hallucinated tool calls per session in practice. It costs roughly fifty tokens to load. The math is not subtle.

The rule of thumb that survives contact with reality is to write conventions in the negative voice when you can. "Do not write files" tells the model where the edge is and what to do at it. "Always use the shell tool for system inspection" tells the model nothing useful because it does not say what to do when the system inspection means reading a file. Negative rules are testable. Positive rules drift.

## Wiring it into the harness

Three changes in `agent.ts`. The diff is small because the loop never moved.

The import comes in at the top.

```typescript
import { loadContext, type LoadedContext } from "./context";
```

The system prompt builder turns from a constant string into a function that takes the loaded context.

```typescript
const CORE_PROMPT = `You are a careful command-line assistant.
You have access to a small toolbox: a sandboxed shell, a file reader,
an HTTP GET, and a read-only git wrapper. Use them to investigate the
user's request and answer concretely. Multiple tools may run in one
turn. When you have the answer, stop calling tools and reply in plain
text.`;

function systemPrompt(ctx: LoadedContext): string {
  if (ctx.sources.length === 0) return CORE_PROMPT;
  return (
    CORE_PROMPT +
    "\n\nProject context loaded from .AGENTS/. Treat the contents below " +
    "as authoritative for this project's conventions and terminology. " +
    "Each block is wrapped in <context path=\"...\"> tags so you can " +
    "cite it back to the user.\n\n" +
    ctx.rendered
  );
}
```

The core prompt is short on purpose. It says what the agent is, what tools it has, and when to stop. Everything else is project context. The bridge sentence between the core and the context tells the model how to treat what follows, which is the kind of framing that pays for itself within one turn.

The run function loads the context once at startup, logs what got loaded, and threads the system string into every step.

```typescript
export async function run(goal: string, maxIterations = 10) {
  const ctx = await loadContext();
  const system = systemPrompt(ctx);
  for (const s of ctx.sources) {
    console.error(`# context ${s.path} (${s.bytes}B${s.truncated ? ", truncated" : ""})`);
  }
  // ... rest of the loop unchanged
}
```

The four lines of logging matter more than they look. The first time an agent does something unexpected, the operator wants to know which files were in scope. Printing them is the cheapest debugging artifact you will ever ship. Print them.

That is the whole wiring change. The `for` loop, the dispatcher, the `Promise.all` over tool calls, the iteration budget are all untouched. The loop does not know context exists.

## What it looks like running

A short transcript shows the difference the context layer makes.

```
$ bun agent.ts "what does this repo do, and what conventions should I follow?"
# context .AGENTS/overview.md (812B)
# context .AGENTS/conventions.md (1186B)
# context .AGENTS/glossary.md (824B)
This repository is the reference harness for the Agent Platform Handbook
series on raskell.io. The harness is a Bun + TypeScript agent against the
Anthropic Messages API. Each git tag (post-01 through post-04) is the
exact state of the code that the matching post discusses.

The conventions you should follow:

- Use fs_read for file reads, not shell. The shell runs in a sandbox
  without host filesystem access (.AGENTS/conventions.md).
- Do not write files. No write tool exists in this harness yet
  (.AGENTS/conventions.md).
- git is read-only. Allowed subcommands: log, diff, show, status, branch,
  ls-files (.AGENTS/conventions.md).
- http_get accepts https:// only, for public documentation and APIs
  (.AGENTS/conventions.md).
```

Zero tool calls. The model answered from the static context alone, and cited each rule back to the file it came from. The same agent without `.AGENTS/` would have run three or four `fs_read` calls, traversed the directory, opened the README, and produced a similar answer two seconds slower and one cache miss away.

The same harness, with a different `.AGENTS/`, becomes a different agent.

## Why retrieval alone is not enough

This is the section where the RAG enthusiast and the long-context enthusiast both push back, and they are both wrong in instructive ways.

A retrieval system answers the question "what is relevant to this turn." A static context answers the question "what is true about this project regardless of any turn." The two are not interchangeable. The retrieval system cannot know that your team prohibits force pushes unless you wrote that into a document and the retriever surfaced it. The retriever will surface it sometimes. The static context surfaces it every time.

Three failure modes show up if you try to skip the static layer.

**Cold-start emptiness.** The very first turn of a session has no prior context, no tool outputs, no retrieval hits. The model has the user's prompt and whatever you preloaded. Without static context, the model starts every session with the same generic priors. With it, the model starts every session knowing what the project is about and what it cannot do.

**Retrieval misses on infrequent rules.** A convention that comes up once a month is unlikely to retrieve cleanly. The embedding distance from "do not force push" to "I want to clean up the commit history" is not small but not zero, and a top-k retriever will sometimes miss it. The static layer hard-codes the rules that you cannot afford to miss.

**Cross-cutting concerns.** The convention "do not write files" applies to every tool call. There is no single document the retriever could match against every relevant turn. The static layer is the only place this kind of rule belongs.

The long-context argument is structurally similar. "Just put the whole repo in the prompt." Two problems. The repo is bigger than the window for any non-trivial codebase, and you pay for every token on every turn. Even with prompt caching at ninety percent hit rate, the bill for a thousand-turn session against a two-hundred-thousand-token repo is real money. Static context lets you put the part that has to be in the prompt in the prompt, and let the rest live behind retrieval and tools.

The honest synthesis is that all three layers are necessary. Static for the rules. Retrieval for the corpus. Tools for everything live. This post is about the first one because it is the layer that everyone defers and that determines whether the other two work.

## Designing context that the model can actually use

Once you have a loader, the engineering question becomes "what do you put in `.AGENTS/`." There are four patterns that hold up.

**Conventions in the negative voice.** Tell the model what it cannot do, why, and what to do instead. A convention like "do not write files; there is no write tool" is testable: the model either tries to write a file or it does not, and you can grep for it in the trace. A convention like "be helpful" is not testable. Negative rules also fail safer when the model misreads them.

**Glossary entries for project-specific nouns.** Every project has a few terms that mean something different inside the project than outside. "Zentinel" in your company might be a WAF tuner. "The pipeline" might be a four-stage build system. The model has seen all of these words in its training data and will pick a meaning at random unless you tell it. A short glossary is cheap insurance.

**Overview as a sitemap, not a story.** The overview file should answer "what is here and where do I find it." Not "what is the history of this project." The history goes in the README for humans. The overview goes in `.AGENTS/` for agents and is the structural map: the modules, the files, the entry points, the canonical commands. Keep it short. Update it when files move.

**One file per concern.** Resist the temptation to put security rules in `conventions.md` because they are conventions. Make a `security.md`. Resist the temptation to put architecture in `overview.md` because it is overview. Make an `architecture.md`. Each file gets its own load slot, its own conflict surface, its own owner. The directory is what makes this affordable.

The decision table summarizes where each kind of context goes.

| Kind of context                            | Lives in                | Why                                              |
|--------------------------------------------|-------------------------|--------------------------------------------------|
| What the agent is, role, toolbox           | `CORE_PROMPT` in harness | Ships with the harness, not the project.         |
| Project rules, conventions, prohibitions   | `.AGENTS/conventions.md` | Per-project, hard-coded, cited back to the user. |
| Project-specific terms and acronyms        | `.AGENTS/glossary.md`    | Disambiguates words the model knows differently. |
| Sitemap, modules, canonical commands       | `.AGENTS/overview.md`    | Self-documents the repo for the agent.           |
| Sensitive policies (do-not-touch lists)    | `.AGENTS/security.md`    | Separates audit surface from general rules.      |
| Large reference material (API docs, RFCs)  | Retrieval, not static    | Too big for the budget, not needed every turn.   |
| Live system state (running processes, db)  | Tools                    | Static context goes stale; tools always fresh.   |
| Notes the agent writes to its future self  | Memory (post six)        | Belongs in a layer this post does not build.     |

The table is the four-line summary of the rest of the series. Each row maps to one layer the harness either has, will have, or deliberately delegates to a tool.

## Failure modes worth naming

The first time you hit any of these you will think the loader is broken. It is not. These are static-context problems specifically.

**Context drift.** The conventions file says "use Bun 1.1," your toolchain moved to Bun 1.5, the file is not updated, the model produces commands that work fine but cite a version that is two minor releases old. The fix is to treat `.AGENTS/` files as code, reviewed in PRs, with the same kind of "is this still true" sweep you do on the README.

**Stale glossary.** A term changes meaning. The team renames "Zentinel" to "Sentinel" because the original was a joke. The glossary still says "Zentinel is a WAF tuner." The model now uses both names interchangeably and the user is confused. Treat the glossary as a single source of truth. Update it on rename PRs.

**Budget eviction silently dropping a critical file.** A new file pushes the total over thirty-two kilobytes, the loader stops loading after `conventions.md`, and `security.md` is silently absent from the prompt. The fix is the visible truncation marker and the per-file logging in the loader. The operator sees the size before the agent runs and can raise the budget or trim a file.

**Over-stuffed conventions.** The team writes every preference, taste, and personal hobby horse into `conventions.md`. The file balloons to ten thousand tokens. The model attention spreads thin. Sub-rules get ignored. The fix is to apply the same editorial discipline to the conventions file that you would apply to a real document. Cut anything that is not load-bearing.

**Citation theater.** The model picks up the citation pattern and starts citing files that were not in the loaded context. This happens because the model is good at pattern-matching and `(.AGENTS/conventions.md)` is a pattern. The fix is to read your traces. If a citation is wrong, the convention was either missing or unclear, and the file needs an edit.

**Context overriding the operator.** A convention says "always reply in English." The user asks for a French answer. The model says no. The convention won. This is sometimes what you want and often not. Decide explicitly which rules are operator-overridable and which are not, and write the irreversible ones in the strongest voice. We will come back to this in [post fourteen](#) on policy.

**Token cost surprise.** The loader is cheap. The cumulative cost of loading thirty-two kilobytes of context on every call is not. Prompt caching makes it manageable. Without prompt caching, your bill is roughly ten times what it would be without `.AGENTS/`. Turn caching on. We will spend [post eighteen](#) on the economics.

## What this layer does not solve

Static context is one layer. Things you might expect this post to cover that get a dedicated post later.

- **Per-task subsetting.** Loading the whole `.AGENTS/` directory on every turn is wasteful for large repos. The next refinement is to load only the files relevant to the current task. That is a retrieval problem with a static-context shape, and we will pick it up in [post five](#).
- **Memory across turns and sessions.** A note the agent wrote yesterday is not in `.AGENTS/`. It is in a memory layer with different lifetime, different ownership, and different write semantics. [Post six](#).
- **Per-tool context.** A tool might want a small chunk of context that only matters when it runs. "Reading this file? Here is what to expect in its structure." That belongs in the tool description, not in `.AGENTS/`. We covered the principle in [post three](/articles/tools-how-agents-actually-do-things/).
- **MCP-served context.** A team that runs many agents may want context to live in a shared service, not in every repo. MCP has a `resources/list` and `resources/read` shape that fits. [Post eight](#).
- **Versioning, evals, and rollback.** A bad edit to `.AGENTS/conventions.md` can degrade every agent in the fleet. The discipline that wraps that is the same discipline that wraps any production string. Reviewed PRs, traced behavior, a rollback path. [Post sixteen](#) covers the eval side.
- **Identity and authorization.** A convention that says "do not deploy to production" does not stop the agent from deploying to production if the tool is available. That is policy and identity, [post thirteen](#) and [post fourteen](#).

The pattern is the same as in the earlier posts. Each layer earns the right to be small by deferring everything that does not belong to it. The static-context layer earns its keep by being short, deterministic, and cited.

## Where this lands in the platform

Total damage going from `post-03` to `post-04`: one new file (`context.ts`), one new directory (`.AGENTS/`) with three sample files, three changes in `agent.ts`. The loop, the registry, the tools, the sandbox, and the types are all untouched. The diff is roughly one hundred and twenty lines. In exchange, the agent now arrives at every turn knowing what the project is, how to talk about it, and what it is not allowed to do.

In the reference architecture from [post twenty-two](#), the context layer is the seam between the project and the agent. The harness loads from it. The retriever in [post five](#) layers on top of it. The memory layer in [post six](#) writes alongside it. The policy layer in [post fourteen](#) reads from it to decide what is enforced and what is advisory. Same diagram as the earlier posts, with one more box filled in.

The rule from the earlier posts still holds. The harness only ever grows; it does not get rewritten. Each post adds one layer to the same artifact and explains why the layer below was not enough.

The layer below this one was a model that knew nothing about your project. The layer above is the model that pulls the slice of context it needs for the turn at hand. Static context makes the agent useful on every turn at a fixed cost. Per-task retrieval makes it useful on the turns where the static layer is not enough, at a variable cost the agent decides. Next we build the layer that turns a loader into a retriever and explains why embeddings are sometimes the right answer and sometimes a trap. That post will ship as `post-05` in the same repo.

## Next

**Part 5: Retrieval Is a Tool, Not a Layer.** Why pulling context dynamically is its own design problem, where embeddings stop being the right answer, and how to subset `.AGENTS/` per task in the harness we have been building.
