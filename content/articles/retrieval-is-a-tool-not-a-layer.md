+++
title = "Retrieval Is a Tool, Not a Layer"
date = 2026-06-17
description = "Loading the whole .AGENTS/ directory on every turn does not scale. The fix is not a retrieval layer bolted to the side of the agent. It is a search tool in the registry the agent already has. BM25 over project docs, no vector store, and an honest account of when embeddings start to earn their keep. Part five of The Agent Platform Handbook."

[taxonomies]
tags = ["ai-engineering", "platform-automation", "typescript"]
categories = ["patterns"]
series = ["the-agent-platform-handbook"]

[extra]
author = "Raffael"
image = "retrieval-is-a-tool-not-a-layer.avif"
og_image = "retrieval-is-a-tool-not-a-layer.png"
+++

> Part 5 of *The Agent Platform Handbook. From Loop to Platform.* Previous: [Context Is the Product](/articles/context-is-the-product/). Next: [Memory Is a Write Path](/articles/memory-is-a-write-path/).

[Post four](/articles/context-is-the-product/) gave the harness a context layer. A `context.ts` module reads markdown files from a `.AGENTS/` directory at startup, applies a byte budget, wraps each file in a `<context path="...">` block, and concatenates the whole thing under the core prompt. The agent now arrives at every turn knowing what the project is, how to talk about it, and what it is not allowed to do. The harness sits at tag [`post-04`](https://github.com/raskell-io/the-agent-platform-handbook/tree/post-04): a loop, a registry, four sandboxed tools, parallel dispatch, and a static context loader.

It loads the entire directory on every turn.

That is fine for the three small files the repo ships with. It is roughly three kilobytes. It costs almost nothing with prompt caching, and the agent reads its conventions on turn one without a single tool call. The argument from post four holds: the static layer is necessary, and it is cheap when it is small.

The directory does not stay small. The first real project that adopts `.AGENTS/` adds a `security.md`. Then an `architecture.md`. Then, because it is a monorepo, a file per service. Then the platform team adds a `deploy.md` and the data team adds a `schemas.md` and six months later the directory is forty files and four hundred kilobytes, and the loader from post four is pasting all of it into every turn, including the turn where the user asked the agent to fix a typo in the README.

This post is about the layer that fixes that. It ships as tag [`post-05`](https://github.com/raskell-io/the-agent-platform-handbook/tree/post-05). The change is smaller than the problem makes it sound, because the harness already has the right shape. The agent does not need a retrieval *layer*. It needs a retrieval *tool*.

## The wrong fix has a product page

The reflex, when "load everything" stops scaling, is to reach for retrieval-augmented generation. Stand up a vector database. Pick an embedding model. Write a chunker. Write an ingestion job that walks the corpus, embeds every chunk, and upserts it into the store. Write a sync job so that when a document changes, the index changes with it. Add the vector store to your deployment, your backups, your on-call rotation, and your bill.

Now, on every turn, you embed the user's query, run a nearest-neighbor search against the store, pull the top chunks, and splice them into the prompt. This is the architecture every vector database vendor will sell you, and for a corpus of fifty thousand documents it is the right architecture. For a `.AGENTS/` directory it is a second production system standing next to your agent to solve a problem your agent already has the machinery to solve.

The framing error is in the word "layer." A layer sits beside the agent and feeds it. It has its own lifecycle, its own failure modes, its own latency, its own operational surface. You built one whole distributed system in [post three's registry](/articles/tools-how-agents-actually-do-things/) and you are about to build a second one next to it.

You do not have to. The registry from post three already dispatches named operations, runs them in parallel, caps their output, and wraps their errors. Retrieval is a named operation that takes a query and returns text. It is a tool. Put it in the registry and the agent calls it the same way it calls `fs_read` or `git`, on the turns where it needs it, and not on the turns where it does not.

## Pinned versus searchable

The split that makes this work was already implied by post four. That post argued that some context is cross-cutting: the rule "do not write files" applies to every tool call, so it has to be present on every turn. Other context is topical: the glossary entry for a term the agent will use once this session, the security policy that only matters when the task touches secrets, the architecture note that only matters when the task touches the loop.

Post four loaded both kinds the same way. Post five separates them.

{% diagram(title="Pinned context versus searchable context") %}

   .AGENTS/
   +-- overview.md      ---+
   +-- conventions.md   ---+----> PINNED  ----> system prompt, every turn
   |                                            (cross-cutting, always true)
   +-- glossary.md      ---+
   +-- security.md      ---+----> SEARCHABLE -> context_search tool, on demand
   +-- architecture.md  ---+                    (topical, pulled per task)
   +-- ...              ---+

{% end %}

Pinned files load into the system prompt on every turn, exactly as in post four, with the same budget and the same `<context>` wrapping. The pinned set is deliberately tiny: `overview.md`, so the agent knows what the project is, and `conventions.md`, so the agent knows the rules that apply to every action. These are the files you cannot afford to have the agent miss, so you pay for them every turn on purpose.

Everything else in `.AGENTS/` becomes searchable. It is not in the prompt. It is sitting in an index, and the agent pulls the relevant sections by calling a tool. The glossary moves here, because a glossary is a lookup table and you look things up when you need them. The security policy moves here, because the turn that prints a file needs it and the turn that counts lines does not. The architecture notes move here for the same reason.

The contract in `context.ts` is two lines.

```typescript
// Pinned files load into every turn. They carry cross-cutting rules that
// have to be true regardless of the task. Everything else in .AGENTS/ is
// searchable on demand through the context_search tool (see retriever.ts).
export const PINNED = ["overview.md", "conventions.md"];

export function isPinned(name: string): boolean {
  return PINNED.includes(name);
}
```

`loadContext` from post four now filters to the pinned set and is otherwise unchanged. The byte budget, the truncation marker, the per-file logging, the `<context>` rendering all survive. The function got smaller, not more complex.

## The retriever

The searchable half needs an index and a ranker. The whole thing is one new file, `retriever.ts`, and it does not import a database.

Start with the shape of an indexed chunk.

```typescript
export type Chunk = {
  path: string;            // .AGENTS/security.md
  heading: string;         // "Secrets"
  text: string;            // the section body, heading included
  length: number;          // token count, for length normalization
  tf: Map<string, number>; // term -> frequency within this chunk
};
```

A chunk is a section, not a file and not a fixed-size window. Markdown already tells you where the meaningful boundaries are: they are the headings. Splitting on headings means a chunk is a coherent unit a human wrote on purpose, with a title that describes it. That title becomes the chunk's `heading`, which is both a retrieval signal and the label the agent cites back to the user.

The chunker walks the file line by line, starts a new chunk at every heading, and tokenizes each section as it closes.

```typescript
function chunkMarkdown(path: string, raw: string): Chunk[] {
  const chunks: Chunk[] = [];
  let heading = "(intro)";
  let buf: string[] = [];

  const flush = () => {
    const body = buf.join("\n").trim();
    if (body.length === 0) return;
    const tf = new Map<string, number>();
    let length = 0;
    for (const tok of tokenize(body)) {
      tf.set(tok, (tf.get(tok) ?? 0) + 1);
      length++;
    }
    chunks.push({ path, heading, text: body, length, tf });
  };

  for (const line of raw.split("\n")) {
    const m = /^#{1,6}\s+(.*)$/.exec(line);
    if (m) {
      flush();
      heading = m[1].trim();
      buf = [line];
    } else {
      buf.push(line);
    }
  }
  flush();
  return chunks;
}
```

Tokenization is lowercase, split on non-alphanumeric, drop a short stop list and single characters. Nothing clever. The point is to count terms, and the ranker does the rest.

The ranker is BM25. It is the function that powers Lucene, Elasticsearch, and most of the search you have ever used that was not a neural model, and it has been the strong baseline in information retrieval for thirty years. The formula rewards a chunk for containing a query term often, with two corrections that matter. Term frequency saturates, so the tenth occurrence of a word counts for much less than the second. And the score is normalized by chunk length, so a long section does not win simply for being long. Rare terms, the ones that actually discriminate between sections, are weighted up through inverse document frequency.

```typescript
const K1 = 1.5;
const B = 0.75;

export function search(index: Index, query: string, k = 3): Hit[] {
  const terms = tokenize(query);
  if (terms.length === 0 || index.chunks.length === 0) return [];

  const N = index.chunks.length;
  const hits: Hit[] = [];

  for (const chunk of index.chunks) {
    let score = 0;
    for (const term of terms) {
      const tf = chunk.tf.get(term);
      if (!tf) continue;
      const df = index.df.get(term) ?? 0;
      const idf = Math.log(1 + (N - df + 0.5) / (df + 0.5));
      const denom = tf + K1 * (1 - B + B * (chunk.length / (index.avgLength || 1)));
      score += idf * (tf * (K1 + 1)) / denom;
    }
    if (score > 0) hits.push({ chunk, score });
  }

  hits.sort((a, b) => b.score - a.score);
  return hits.slice(0, k);
}
```

That is the entire ranking engine. No model to download, no service to call, no index to host. `buildIndex` reads the non-pinned markdown files at startup, chunks them, and computes document frequencies and the average chunk length once. The result lives in memory for the life of the process.

## The tool

Wrapping the retriever as a tool is the part that earns this post its title. The retriever does not get a special pathway into the loop. It gets registered like every other tool, with a name, an input schema, an output cap, and a handler.

```typescript
export function makeContextSearch(index: Index): Tool {
  return {
    name: "context_search",
    description:
      "Search the project's on-demand .AGENTS/ context for sections relevant " +
      "to a query. Returns the best-matching documentation sections, each " +
      "wrapped in a <context> block with its source path and heading. Use " +
      "this when you need project conventions, glossary terms, or architecture " +
      "notes that are not already in your system prompt. The system prompt " +
      "lists which sources are searchable.",
    input_schema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Natural-language description of what you need." },
        k: { type: "number", description: "Maximum number of sections to return. Defaults to 3." },
      },
      required: ["query"],
    },
    max_output_bytes: 16 * 1024,
    run: async ({ query, k }) => {
      const q = String(query ?? "").trim();
      if (q.length === 0) return { ok: false, error: "query is required" };

      const limit = typeof k === "number" && k > 0 ? Math.floor(k) : 3;
      const hits = search(index, q, limit);
      if (hits.length === 0) return { ok: true, value: `no matching context for: ${q}` };

      return {
        ok: true,
        value: hits
          .map(
            (h) =>
              `<context path="${h.chunk.path}" section="${h.chunk.heading}" score="${h.score.toFixed(2)}">\n` +
              `${h.chunk.text.trim()}\n</context>`,
          )
          .join("\n\n"),
      };
    },
  };
}
```

`makeContextSearch` is a factory rather than a plain export because the tool closes over the index that `buildIndex` produced at startup. That is the only structural difference between this tool and the four that came before it. Everything downstream is identical. The registry caps its output at `max_output_bytes`. The loop dispatches it in the same `Promise.all` as any other call from the turn. A miss returns an ordinary `ok` result with a "no matching context" string, not an error, because an empty search is a fact about the corpus, not a failure of the tool.

The rendered hit carries `path`, `section`, and `score`. The agent reads the section, answers the question, and cites the source the same way it learned to cite pinned context in post four. The score is there for the operator. When you read the trace and wonder why the agent pulled a particular section, the number tells you how strong the match was.

## Wiring it into the loop

Three changes in `agent.ts`, and the loop body does not move.

The registry construction becomes a function, because one tool now depends on runtime state.

```typescript
function buildRegistry(index: Index): Registry {
  return new Registry()
    .register(shell)
    .register(fs_read)
    .register(http_get)
    .register(git)
    .register(makeContextSearch(index));
}
```

The system prompt gains a manifest. The agent cannot search a corpus it does not know exists, so the prompt lists the searchable sources and their section headings. The manifest is small, a few dozen tokens, and it is the difference between an agent that calls `context_search` on the right turn and one that never calls it at all.

```typescript
const m = manifest(index);
if (m) {
  parts.push(
    "More project context is available on demand. Call context_search " +
    "with a natural-language query to pull the relevant sections instead " +
    "of guessing. Searchable sources and their sections:\n\n" + m,
  );
}
```

And `run` builds the index at startup, alongside the pinned load it already did.

```typescript
const ctx = await loadContext();
const index = await buildIndex();
const registry = buildRegistry(index);
const system = systemPrompt(ctx, index);
```

The pinned files print as `# pinned`, and the searchable corpus prints its size, so the operator sees both halves of the context layer before the agent runs. That is the whole wiring change. The dispatcher, the parallel `Promise.all`, the iteration budget, the error envelopes are untouched. The loop still does not know what a tool does. It only knows how to call one.

## What it looks like running

The manifest tells the agent what is searchable. The agent decides when to reach for it.

```
$ bun agent.ts "am I allowed to write files or print the contents of .env?"
# pinned .AGENTS/overview.md (1002B)
# pinned .AGENTS/conventions.md (1339B)
# searchable 11 sections across 3 files
> context_search {"query":"writing files and printing secret env files"} -> ok
No, on both counts.

- Printing .env is prohibited. The security policy excludes .env,
  secrets.env, and any .key, .pem, or .p12 file, and says to stop and
  explain rather than print it (.AGENTS/security.md, "Secrets").
- There is no write tool in this harness, and the policy says to describe
  the change and let the operator apply it instead
  (.AGENTS/security.md, "Filesystem boundaries").
```

One tool call. The rule lived in `security.md`, which is not in the prompt, and the agent retrieved exactly the two sections it needed and cited both by file and heading. The pinned `conventions.md` told it that rules exist and to prefer rejecting over guessing. The searchable `security.md` told it which rule. The same harness pointed at a forty-file `.AGENTS/` behaves identically. It pays for two pinned files and one search, not for forty files on a turn that touched one of them.

## Why not embeddings

This is the section the vector database vendor disagrees with, so it is worth being precise about where they are right.

Embeddings solve a real problem: vocabulary mismatch. A lexical ranker scores on the words that are actually present. If the user asks "how do I ship this" and the document says "deployment procedure," BM25 sees no shared terms and scores zero. An embedding model maps both phrases into a vector space where "ship" and "deployment" sit close together, and the search finds the document anyway. When you cannot control the words in the query, and you cannot control the words in the corpus, semantic search is the answer. That is most consumer search, most support-ticket retrieval, most search over a corpus written by people who are not you.

A `.AGENTS/` directory is none of those things. You control the corpus. You wrote it. The query comes from a model that has the manifest in its prompt, so it knows the corpus uses the word "deployment" and phrases its search accordingly. The vocabulary-mismatch problem that justifies embeddings is a problem you can edit away by writing the glossary heading as the word people search for. At this scale the docs and the queries share an author and a vocabulary, and lexical ranking is not a weaker version of the right answer. It is the right answer.

The cost of reaching for embeddings anyway is not zero, and it is worth naming.

| Concern              | Lexical (BM25)                          | Embeddings + vector store                         |
|----------------------|------------------------------------------|---------------------------------------------------|
| Infrastructure       | None. An in-memory index.                | An embedding model and a vector database to host. |
| Build cost           | Read files, count terms. Milliseconds.   | Embed every chunk. A model call per chunk.        |
| Staleness            | Rebuild is reading the directory again.  | Re-embed and re-upsert on every document edit.    |
| Debuggability        | Read the score. See which terms matched. | Cosine distance in a space you cannot inspect.    |
| Failure mode         | Misses on vocabulary mismatch.           | Retrieves plausible-but-wrong neighbors silently. |
| Right scale          | Tens of files, hundreds of chunks.       | Tens of thousands of documents and up.            |

The last row is the whole decision. Embeddings earn their keep when the corpus is too large for a human to have written with consistent vocabulary, when the queries come from people you do not control, or when you genuinely need to match across languages or heavy paraphrase. None of that is true of a project's own context directory, and all of it is true of a knowledge base with fifty thousand pages. The mistake is not using embeddings. The mistake is using them at the scale where a thirty-year-old ranking function does the job with no operational surface at all.

When `.AGENTS/` grows past the point where lexical ranking holds, the tool boundary is exactly where you swap the implementation. `context_search` keeps its name, its schema, and its contract. The retriever behind it grows an embedding index. The agent never knows the difference, and neither does the loop. That is the payoff of treating retrieval as a tool: the upgrade path is a change behind an interface, not a new system.

## Failure modes worth naming

The first time you hit one of these you will suspect the retriever. Usually the retriever is fine and the corpus or the prompt needs an edit.

**Under-retrieval.** The agent answers from priors instead of calling `context_search`, and gets the project-specific detail wrong. The cause is almost always a weak manifest or a missing instruction. The pinned `conventions.md` should say, in the negative voice from post four, that the agent must search project context before guessing. The manifest should list headings specific enough that the model recognizes the turn needs them.

**Over-retrieval.** The agent calls `context_search` on every turn, including turns that the pinned context already answers. This costs a tool round-trip and some latency. The fix is the manifest again, framed so the model treats search as the fallback for topical detail, not the default for everything.

**Stale index.** `buildIndex` runs once at startup. A long-running agent process will not see edits to `.AGENTS/` until it restarts. For a CLI that starts per invocation this never matters. For a daemon it does, and the fix is to watch the directory and rebuild, which is a few lines and a problem for the day you actually run a daemon, not before.

**Chunk boundaries.** A rule that spans two headings gets split across two chunks, and a top-k search returns one half. The fix is editorial: keep a rule under one heading. The heading-based chunker rewards documents that are organized the way you would organize them for a human reader anyway.

**Vocabulary mismatch.** The lexical failure mode the embeddings section described. A query shares no terms with the section that answers it, and the search scores zero. At `.AGENTS/` scale the fix is to add the missing word to the heading or the body. You own the corpus. Make it say what people search for.

**Manifest bloat.** Forty searchable files, each with eight headings, is a manifest of three hundred lines, and now the thing you built to keep context out of the prompt is itself a large block of context in the prompt. The fix is to summarize: list files and a short description rather than every heading, once the directory is large enough that the full listing stops paying for itself.

## What this layer does not solve

The pattern from the earlier posts holds. Each layer earns the right to be small by deferring what does not belong to it.

- **Embeddings for large corpora.** The tool boundary is built to absorb this. The day the corpus outgrows lexical ranking, the retriever behind `context_search` changes and nothing else does. This post does not build it because nothing at `.AGENTS/` scale needs it.
- **Per-turn token budgeting.** Retrieved sections compete for the same window as the conversation history and the pinned context. Deciding how many sections to pull and how to evict them under pressure is a budgeting problem this post leaves at a fixed `k`. [Post eighteen](#) on economics returns to it.
- **Memory across turns and sessions.** Retrieval reads context the project wrote. It does not write anything. A note the agent leaves for its future self is a different layer with a different lifetime and different write semantics, and it is the whole subject of the next post.
- **Shared context across many agents.** A fleet may want its context to live in a service rather than in every repo. The MCP `resources/list` and `resources/read` shape fits behind the same tool boundary. [Post eight](#).

## Where this lands in the platform

Total damage going from `post-04` to `post-05`: one new file (`retriever.ts`), one new tool (`tools/context_search.ts`), a split in `context.ts` between pinned and searchable, and three changes in `agent.ts`. The loop, the registry internals, the sandbox, the four original tools, and the types are all untouched. The agent now pays a fixed cost for the context that is always true, and a variable cost it decides for the context that is only sometimes relevant.

The retriever sits on top of the static layer from post four, exactly as that post predicted it would. The pinned files are the static context. The searchable files are the corpus. The tool is the seam between them, and the seam is an entry in the registry from [post three](/articles/tools-how-agents-actually-do-things/), dispatched and capped and error-wrapped by machinery that already existed. No vector store joined the deployment. No second system joined the on-call rotation. Retrieval became a tool, because the harness was already the kind of thing that turns a function into a capability the model can reach.

The rule from the earlier posts still holds. The harness only ever grows; it does not get rewritten. Each post adds one capability to the same artifact and explains why the layer below was not enough. The layer below this one was a context loader that read everything every turn. This one reads what the turn needs. The layer above is the one that writes.

## Next

**Part 6: [Memory Is a Write Path](/articles/memory-is-a-write-path/).** Retrieval reads context the project authored. Memory is the agent writing context for its own future turns and future sessions. Why the write path is the hard part, where session memory and cross-session memory diverge, and what it takes to let an agent remember without letting it corrupt its own ground truth.
