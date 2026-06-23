+++
title = "Memory Is a Write Path"
date = 2026-06-23
description = "Retrieval reads context the project authored. Memory is the agent writing context for its own future sessions, and the write is the part that is dangerous. Why session memory comes free from the transcript, why cross-session memory needs a separate write surface, and how to let an agent remember without letting it corrupt its own ground truth. Part six of The Agent Platform Handbook."

[taxonomies]
tags = ["ai-engineering", "platform-automation", "typescript"]
categories = ["patterns"]
series = ["the-agent-platform-handbook"]

[extra]
author = "Raffael"
image = "memory-is-a-write-path.avif"
og_image = "memory-is-a-write-path.png"
+++

> Part 6 of *The Agent Platform Handbook. From Loop to Platform.* Previous: [Retrieval Is a Tool, Not a Layer](/articles/retrieval-is-a-tool-not-a-layer/). Next: The Model Is a Dependency.

[Post five](/articles/retrieval-is-a-tool-not-a-layer/) gave the harness a read path. A `retriever.ts` module chunks the searchable half of `.AGENTS/` by heading, ranks sections with BM25, and exposes the whole thing as a `context_search` tool the agent calls on the turns where it needs project detail. The harness sits at tag [`post-05`](https://github.com/raskell-io/the-agent-platform-handbook/tree/post-05): a loop, a registry, four sandboxed tools, parallel dispatch, a pinned context layer, and a lexical retriever behind a tool. The agent reads what the project authored, and it reads only the slice each turn needs.

It cannot write a single thing.

Every run starts from the same blank state. The agent works out, on turn three of a session, that this repo deploys through a script that refuses to run with a dirty tree. It finishes the task. The process exits. The next session it works that out again, from scratch, because the only place that fact ever lived was the transcript of a conversation that no longer exists. Retrieval reads context the project wrote. Nothing writes the context the agent learns.

This post adds the write path. It ships as tag [`post-06`](https://github.com/raskell-io/the-agent-platform-handbook/tree/post-06). The machinery is small, because the read side from post five already did most of the work. The hard part is not storing a fact. The hard part is that a stored fact becomes ground truth on every future turn, and an agent that writes its own ground truth can poison it.

## Reads are safe, writes are not

The reason retrieval was a calm post and memory is a nervous one comes down to a single asymmetry.

A read is idempotent and disposable. When `context_search` returns the wrong section, the agent wastes a tool call, notices the result does not answer the question, and moves on. The cost is one round-trip. The corpus is untouched. Run the same search twice and you get the same answer twice. Nothing accumulates.

A write is neither. When the agent saves a fact that is wrong, or true today and false next month, that fact does not cost one turn. It is loaded into context on every future turn, presented with the same weight as everything else the agent knows, and acted on until something removes it. A retrieval mistake is a bad answer. A memory mistake is a bad premise, and a bad premise is worse, because the agent reasons forward from it confidently and the error shows up three steps later wearing the face of a conclusion.

This is the whole design problem, and it is worth stating before any code. Memory is not hard because writing to disk is hard. Memory is hard because the thing you are writing is the agent's future ground truth, and you are letting the agent write it. Everything in `post-06` is shaped by one goal: let the agent remember, without letting it corrupt the context it depends on.

## Session memory is already solved

There is a temptation, when you set out to build memory, to build one mechanism that handles everything from "what did the user just ask me to do" to "what did I learn about this project last month." Resist it, because those are two different lifetimes with two different readers, and one of them is already handled.

Within a single run, the agent already remembers everything. The message array in the loop accumulates every turn: the user's request, every tool call, every result, every intermediate reply. That array is session memory. It is working memory for the task in front of the agent, it is bounded by the context window, and it dies when the process exits. The loop from [post one](/articles/what-an-agent-actually-is/) has carried it the entire series. You do not need a tool, a file, or a database to remember what happened earlier in the same conversation. You need the transcript you already have.

Cross-session memory is the unsolved half, and it is unsolved precisely because of its reader. A note you leave for later in the same run is read by an agent that still has the whole conversation in context. A note you leave for next week is read by an agent that has none of it. The reader of a durable memory is a stranger who happens to share your name. That is the constraint that makes the write path hard, and it is the reason a durable memory has to be written differently from a scratch note: small, self-contained, and phrased to survive the loss of all the context that made it obvious when you wrote it.

| | Session memory | Cross-session memory |
|---|---|---|
| Lifetime | One run | Across runs, indefinitely |
| Mechanism | The message array, already in the loop | Files on disk, loaded at startup |
| Reader | The agent, with full conversation context | The agent, with none of it |
| Failure mode | Runs out of context window | Persists a wrong premise forever |
| Built in this post | Nothing. It already exists. | The entire write path. |

So `post-06` builds only the durable path. The scratchpad is the transcript. The work is everything that outlives it.

## The shape: a file per fact

The durable store is a directory, `memory/`, and the unit is one file per fact. This is the same shape the read side settled on in post four, and it is not a coincidence. A fact the agent wants to keep is a small markdown document with a title and a body, exactly like a `.AGENTS/` section, so it indexes the same way and reads back the same way.

Each memory carries three pieces of frontmatter and a body. The type captures the contract.

```typescript
export type MemoryType = "fact" | "preference" | "decision";

export type Memory = {
  name: string;        // slug and filename stem; the dedup key
  description: string;  // one line; lands in the always-pinned index
  type: MemoryType;     // fact, preference, or decision
  body: string;         // the fact, written to stand on its own later
};
```

On disk a memory is the kind of file a person could read and edit without tooling.

```markdown
---
name: operator-prefers-ripgrep
description: The operator searches code with ripgrep and wants line numbers
type: preference
---

When searching the codebase outside the sandbox, the operator prefers
ripgrep (`rg`) over `grep`, and asks for `rg -n` so matches carry line
numbers they can paste straight into a `path:line` reference.
```

The `description` is doing the same job the pinned files did in post four. It is the one line the agent pays for on every turn, the summary that tells the agent this memory exists and roughly what it covers. The `body` is the part it pays for only on the turns it actually pulls the memory. The split between always-loaded summary and on-demand body is the post-five idea applied to a second corpus, and it is what keeps a hundred memories from costing a hundred memories' worth of tokens on the turn the user said hello.

The directory mirrors `.AGENTS/` one more way. It has an index file, `MEMORY.md`, that lists every memory in one line each. The difference from `.AGENTS/` is who writes it, and that difference is the next two sections.

## Ground truth stays read-only

The boundary that keeps the agent from corrupting itself is really two boundaries wearing one coat.

The first is a directory boundary. The agent writes to `memory/` and to nowhere else. `.AGENTS/` is project ground truth, authored by the people who run the agent, and it is read-only to the agent for the entire series. There is no tool that writes to it. The memory write path hardcodes its directory and slugs every name into a flat filename, so there is no path the model can supply that climbs out of `memory/` and into the project's authored context. The thing the agent cannot afford to corrupt and the thing the agent is allowed to write live in different directories, and the write tool only knows about one of them.

```typescript
export function resolveMemoryDir(dir?: string): string {
  return dir ?? process.env.MEMORY_DIR ?? DEFAULT_DIR;
}
```

The second is an authority boundary, and it lives in the prompt. Pinned `.AGENTS/` context is introduced as authoritative. Memory is introduced as the agent's own fallible notes, lower in authority than the pinned context, to be verified against the live system before it is acted on.

```typescript
parts.push(
  "You keep a durable memory across sessions. The entries below are " +
  "notes you saved on earlier runs, one line each. They are your own " +
  "past observations, not project ground truth: treat them as fallible, " +
  "prefer the pinned .AGENTS/ context when they conflict, and verify " +
  "against the live system before acting. Call memory_search to pull the " +
  "full text of a relevant entry. Call memory_write to save a new durable " +
  "fact when you learn one that is stable and reusable.\n\n" +
  mem.rendered,
);
```

That framing matters more than it looks. A memory and a pinned convention can arrive in the same prompt and contradict each other, because the project changed after the agent wrote its note. Without an authority order the agent has no principled way to choose, and a stale self-authored note can override a current project rule. With it, the agent treats its own memory as a lead to verify, not a fact to obey. Memory earns a place in the context window, but it does not earn the project's authority, and the prompt says so on every turn.

## The write path

Saving a memory is one function, and almost all of it is the careful part rather than the writing part.

```typescript
export async function writeMemory(
  input: { name: string; description: string; type?: string; body: string },
  dir = resolveMemoryDir(),
): Promise<{ name: string; updated: boolean }> {
  const name = slugify(input.name);
  if (!name) throw new Error("memory name is empty after slugifying");

  const description = input.description.trim();
  if (!description) throw new Error("memory description is required");

  const body = input.body.trim();
  if (!body) throw new Error("memory body is required");
  if (Buffer.byteLength(body, "utf8") > MAX_BODY_BYTES) {
    throw new Error(`memory body exceeds ${MAX_BODY_BYTES} bytes`);
  }

  await mkdir(dir, { recursive: true });
  const file = join(dir, `${name}.md`);
  const updated = await exists(file);
  await writeFile(file, render({ name, description, type: coerceType(input.type), body }), "utf8");
  await rebuildIndexFile(dir);
  return { name, updated };
}
```

The slug is the load-bearing decision. `slugify` lowercases the name, replaces every run of non-alphanumeric characters with a single hyphen, trims, and clamps the length. It does two jobs at once. It sanitizes the path, so a name the model invented can never traverse out of the directory or collide with the filesystem. And it makes the slug the dedup key. "User prefers ripgrep" and "user-prefers-ripgrep" slug to the same filename, so writing a memory whose name matches an existing one overwrites it in place. That overwrite is not a bug to guard against. It is the correction path. When the agent learns that a fact it saved is now wrong, it writes the corrected version under the same name, and the stale memory is gone rather than lingering to be recalled forever. The function reports `updated` so the operator can see a correction land in the trace.

The size clamp is the other guard worth naming. A memory is a fact, not a transcript. The four-kilobyte cap on the body keeps the agent from dumping a whole conversation into a single memory and calling it remembering. If a fact does not fit in four kilobytes, it is not one fact, and the agent should write several.

The tool around this function is the thinnest possible wrapper, and its description is most of its design. The description tells the model what a memory is for, when to write one, and, with equal weight, when not to: not for things that only matter for the current task, and not for things `.AGENTS/` already states. An agent that remembers everything is as useless as one that remembers nothing, because the index becomes noise and the signal drowns. The instruction to not remember is part of the write path.

## The index is derived, not authored

`MEMORY.md` is the agent's pinned index, the list of one-line summaries that loads on every turn. The agent never writes it directly. Every call to `writeMemory` regenerates it from the files on disk.

```typescript
async function rebuildIndexFile(dir: string): Promise<void> {
  const memories = await listMemories(dir);
  const lines = memories.map(
    (m) => `- [${m.name}](${m.name}.md) (${m.type}) -- ${m.description}`,
  );
  // header omitted; writes MEMORY.md from the lines above
}
```

This is a small thing with a large payoff. If the agent wrote both the fact and the index line, the two could disagree. The index could point at a memory that was renamed, or describe a memory whose body later changed, or simply drift as edits accumulate. By making the index a pure function of the files, regenerated on every write, the two cannot diverge. The agent owns the facts. The layer owns the index. There is exactly one source of truth, the files, and the index is a view of it. A view cannot be stale relative to the thing it is a view of.

## Recall reuses the retriever

The read side of memory is the read side of post five, pointed at a different directory. That is the entire implementation, and it is the payoff the last post promised when it argued that putting retrieval behind a tool boundary lets you change what is behind it without touching anything else.

Post five's `retriever.ts` grew two exported helpers so a second corpus could reuse the ranker. `makeChunk` builds one scored chunk from a heading and a body. `indexChunks` turns a set of chunks into a searchable index. The `.AGENTS/` path and the memory path now both build chunks their own way and finish through the same two functions, so BM25 ranks both corpora with one implementation.

```typescript
export async function buildMemoryIndex(dir = resolveMemoryDir()): Promise<Index> {
  const memories = await listMemories(dir);
  const chunks = memories.map((m) =>
    makeChunk(join(dir, `${m.name}.md`), m.description, `${m.description}\n\n${m.body}`),
  );
  return indexChunks(chunks);
}
```

Each memory is one chunk, and its `description` becomes the chunk heading, so a search hit cites back the same one-liner the agent already saw in the pinned index. The `memory_search` tool wraps this index exactly the way `context_search` wrapped its own in post five: a factory that closes over the index built at startup, a query and an optional `k`, an output cap, and a rendered result with the source path and score. The only difference is the wrapper, `<memory>` rather than `<context>`, and the tool description, which repeats the authority warning so the model sees it at the moment of recall and not only at the top of the prompt.

The retriever did not learn anything new. It learned to serve a second customer, and the second customer was almost free.

## Wiring it into the loop

The loop body does not move. The changes are in startup and in the prompt, the same places post five touched.

The registry construction takes a second index now, because a second tool closes over runtime state.

```typescript
function buildRegistry(contextIndex: Index, memoryIndex: Index): Registry {
  return new Registry()
    .register(shell)
    .register(fs_read)
    .register(http_get)
    .register(git)
    .register(makeContextSearch(contextIndex))
    .register(makeMemorySearch(memoryIndex))
    .register(memory_write);
}
```

Startup builds the memory index and the pinned block alongside the context it already loaded, and prints the size of each, so the operator sees all three layers of context before the agent runs a single turn.

```typescript
const ctx = await loadContext();
const contextIndex = await buildIndex();
const mem = await loadMemory();
const memoryIndex = await buildMemoryIndex();
const registry = buildRegistry(contextIndex, memoryIndex);
const system = systemPrompt(ctx, contextIndex, mem);
```

The system prompt gains the memory block from the authority section above, or, when the directory is empty, a single line telling the agent it has a memory it has not written to yet. The dispatcher, the parallel `Promise.all`, the iteration budget, the error envelopes are all untouched. The loop still does not know what a tool does. It learned to load one more index at startup, and nothing else.

## What it looks like running

The write path and the read path are best shown across two separate processes, because that boundary, the process exit, is the one session memory cannot cross and the whole reason this layer exists.

First session, the agent learns something and decides to keep it.

```
$ bun agent.ts "remember that we deploy this project with ./deploy.sh,
  which refuses to run unless the git tree is clean"
# pinned .AGENTS/overview.md (1002B)
# pinned .AGENTS/conventions.md (1339B)
# searchable 11 sections across 3 files
# memory 2 entries
> memory_write {"name":"deploy-with-deploy-sh","type":"decision", ...} -> ok
Saved. In a later session I will know deploys go through ./deploy.sh and
that it refuses to run against a dirty tree, so a deploy starts with a
clean commit or a stash.
```

Second session, a fresh process with an empty transcript, a different question that the saved fact answers.

```
$ bun agent.ts "how do I cut a release here?"
# pinned .AGENTS/overview.md (1002B)
# pinned .AGENTS/conventions.md (1339B)
# searchable 11 sections across 3 files
# memory 3 entries
> memory_search {"query":"cut a release, deploy script, tags"} -> ok
Two things from earlier sessions apply.

- Deploys run through ./deploy.sh, and it refuses to run with a dirty
  git tree, so commit or stash first (memory: deploy-with-deploy-sh).
- Release tags follow the post-NN convention and map one-to-one to
  posts, so cut the next number rather than moving an existing tag
  (memory: release-tags-map-to-posts).
```

The memory count went from two to three between the sessions, because the write from the first run is on disk and loaded at the start of the second. The agent in the second session has no memory of the conversation in the first. It has the file the first session left behind, the one-line summary pinned into its prompt, and a search tool to pull the body. That is cross-session memory, and it is the difference between an agent that learns and an agent that relearns.

## Why one file per fact

The shape is worth defending against the two alternatives, because both look simpler at first and both cost you the part that matters.

| Approach | Correction | Dedup | Human-editable | Index drift |
|---|---|---|---|---|
| One file per fact | Overwrite by slug | Slug is the key | Yes, plain markdown | None; index derived from files |
| Append-only log | Append a contradiction, hope recall prefers it | None; duplicates pile up | Painful; one growing file | The log is the index, and it only grows |
| One memory blob | Rewrite the whole blob | Manual, inside the blob | Yes, but merges are lossy | The blob is the index |

The append-only log is the reflex for anything called memory, and it is wrong for this for the same reason it is right for an audit trail. It never forgets, which is exactly the property you do not want. A fact that became false is still in the log, recalled with the same weight as its own correction, and now the agent has two contradictory memories and a ranking function deciding which one wins. The single blob fails the other way: every write rewrites everything, corrections are lossy merges, and two facts that should be independent are coupled in one document. One file per fact gives you the correction path for free through the slug, keeps facts independent, stays readable and editable by a person, and lets the index be a derived view rather than a thing that drifts. The cost is a directory of small files, which is a cost a filesystem was built to absorb.

## Failure modes worth naming

The first time you hit one of these you will suspect the store. Usually the store is fine and the prompt or the corpus needs an edit.

**Memory poisoning.** The agent saves a fact that is wrong, or that decays, and reasons from it forward in later sessions. This is the failure the whole post is built around, and the defenses are layered rather than absolute: the authority framing tells the agent to verify before acting, the slug-keyed overwrite gives a correction path, and the size clamp keeps any one memory from being a sprawling premise. None of that makes a wrong memory impossible. It makes a wrong memory correctable and low-authority instead of permanent and trusted.

**Over-remembering.** The agent treats `memory_write` as a reflex and saves task-local trivia, and the index fills with noise until the signal is buried. The fix is the tool description, framed so that remembering is for stable, reusable facts and the default is to not write. An index of five good memories beats an index of fifty where five are good.

**Stale recall index.** `buildMemoryIndex` runs once at startup. A memory written mid-run is on disk and in the transcript, so the agent still knows it this session, but the search index will not include it until the next process starts. For a CLI that starts per invocation this never bites. For a long-running daemon it does, and the fix is the same directory watch post five deferred, for the same reason.

**Vocabulary mismatch on recall.** The lexical ranker scores on the words present, and it does not stem. A memory whose body says "searching" will not match a query that says "search," and a query that shares no terms with the memory that answers it scores zero. You own this corpus, so the fix is editorial: write the description in the words you will later search for. The same correction post five named, now pointed at memory.

**Slug collisions.** Two genuinely different facts can slug to the same name if you name them carelessly, and the second silently overwrites the first. The dedup that powers corrections is the same mechanism that causes this. The fix is naming discipline, and the size clamp plus the `updated` flag in the trace make a surprise overwrite visible rather than silent.

## What this layer does not solve

Each layer earns the right to be small by deferring what does not belong to it. Memory defers more than most, because memory is where a platform's hardest questions live.

- **Forgetting on purpose.** Overwrite-by-slug corrects a memory; it does not delete one that is simply obsolete. A `memory_forget` tool is a few lines, but eviction policy, deciding what ages out and when, is a real problem this post leaves at "rewrite or leave it." The store grows until someone prunes it.
- **Conflict resolution.** When a memory and the live system disagree, the prompt tells the agent to trust the system. When two memories disagree, the ranker picks one and the post does not arbitrate. Reconciling contradictory memories is its own design problem.
- **Shared memory across a fleet.** This memory is per-checkout, on local disk. A fleet of agents that should share what one of them learned needs the store behind a service rather than in every repo, and the MCP resource shape fits behind the same tool boundary. [Post eight](#).
- **Embeddings for a large memory.** At a few dozen memories, lexical recall is the right answer for the same reasons it was in post five. The day the store outgrows it, the retriever behind `memory_search` changes and the tool boundary holds. Nothing at this scale needs it.

## Where this lands in the platform

Total damage going from `post-05` to `post-06`: one new file (`memory.ts`), two new tools (`memory_write` and `memory_search`), two exported helpers on `retriever.ts` so the ranker serves a second corpus, and the startup and prompt changes in `agent.ts`. The loop, the registry internals, the sandbox, the four original tools, and the context layer are untouched. The agent now pays a fixed cost for the one-line summaries of what it has chosen to remember, a variable cost it decides for the bodies, and it writes new memories into a directory it cannot escape and whose contents it is told to distrust.

The read path and the write path are the same shape from two sides. Post five read what the project authored. This post writes what the agent learned, into a parallel directory, indexed by the same ranker, pinned and searched the same way, and walled off from the ground truth it must not touch. The hard part was never the disk. It was the asymmetry that a write becomes a future read with the authority of fact, and the answer was to give the agent a write surface that is its own, structured, correctable, and explicitly less trusted than the context it was handed.

The rule from the earlier posts still holds. The harness only ever grows; it does not get rewritten. Each post adds one capability to the same artifact and explains why the layer below was not enough. The layer below this one read context the project wrote. This one writes context the agent learns. The layer above is the model itself, the dependency every other layer has been feeding.

## Next

**Part 7: The Model Is a Dependency.** Every layer so far has existed to put the right tokens in front of the model. Part seven opens the model: why the harness treats it as a swappable dependency rather than a fixed assumption, how to route a cheap model for easy turns and a strong one for hard turns without rewriting the loop, what a fallback looks like when a provider is down, and why "models are commodities" is a claim about your architecture before it is a claim about the market.
