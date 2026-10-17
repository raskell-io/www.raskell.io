+++
title = "The Model Is a Dependency"
date = 2026-07-09
description = "Every layer of the harness has existed to put the right tokens in front of one hardcoded model string. This post pulls that string out and makes the model a dependency: why you route a cheap model for easy turns and a strong one for hard turns, what a fallback looks like when a provider is down, and why 'models are commodities' is a claim about your architecture before it is a claim about the market. Part seven of The Agent Platform Handbook."

[taxonomies]
tags = ["agents", "ai-platforms", "inference", "reliability", "economics", "typescript"]
series = ["the-agent-platform-handbook"]

[extra]
author = "Raffael"
image = "the-model-is-a-dependency.avif"
cover = "covers/the-model-is-a-dependency.avif"
og_image = "the-model-is-a-dependency.png"
+++

> Part 7 of *The Agent Platform Handbook. From Loop to Platform.* Previous: [Memory Is a Write Path](/articles/memory-is-a-write-path/). Next: [The Bill Is Part of the Loop](/articles/the-bill-is-part-of-the-loop/).

[Post six](/articles/memory-is-a-write-path/) gave the agent a write path. A `memory.ts` module lets it save durable facts into a directory it cannot escape, indexed by the same BM25 ranker that powers retrieval, pinned and searched the same way, and walled off from the project context it must not corrupt. The harness sits at tag [`post-06`](https://github.com/raskell-io/the-agent-platform-handbook/tree/post-06): a loop, a registry, four sandboxed tools, parallel dispatch, a pinned context layer, a lexical retriever, and an agent-owned memory. Six posts of machinery, all of it pointed at one thing.

That thing is the model, and it has been a single hardcoded string this entire time.

Open `agent.ts` at `post-06` and find the only function that actually calls the API. It has carried the same line since [post one](/articles/what-an-agent-actually-is/):

```typescript
async function step(registry: Registry, messages: MessageParam[], system: string) {
  return client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4096,
    system,
    tools: registry.schemas(),
    messages,
  });
}
```

Every other part of the harness became a swappable thing as the series went on. Tools are entries in a registry. Context is files in a directory. Memory is a write surface with a boundary. The model is a string literal, named once, in the one place that matters most. This post pulls it out and makes the model a dependency the loop can route, fail over, and replace. It ships as tag [`post-07`](https://github.com/raskell-io/the-agent-platform-handbook/tree/post-07).

## The string that never moved

It is worth being precise about why this particular hardcode is the dangerous one, because at first glance it looks harmless. It is a valid model id. It works. It has worked for six posts.

It is the riskiest line in the harness for the same reason it is easy to miss: it is the dependency every other layer feeds. The context loader, the retriever, the memory index, the sandbox, the tool registry all exist to assemble the right tokens and hand them to that one call. Everything upstream is in service of the model. And the model is the one component whose three most important properties are entirely outside your control.

Its **cost** is set by a vendor and changes without your say. Its **availability** is a remote service that has outages. Its **capability** is fixed at a tier you chose once and then forgot you chose. A hardcoded string commits you to a single answer on all three axes for every turn the agent ever takes. The cheap turn and the hard turn pay the same price. The outage takes the whole agent down. The capability ceiling is wherever you left it. None of that is visible until it bills you, pages you, or fails you.

The fix is the oldest one in software. Put an interface between the thing you depend on and the thing that uses it, so the user describes what it needs and the boundary decides who provides it.

## A model is a function from request to response

A new file, `model.ts`, holds the whole boundary. It starts by naming what a turn actually is, stripped of any vendor:

```typescript
export type ModelRequest = {
  system: string;
  messages: MessageParam[];
  tools: Omit<Tool, "run">[];
  maxTokens: number;
  hard: boolean; // does this turn need the strong model?
};

export interface Model {
  readonly name: string;
  complete(req: ModelRequest): Promise<Message>;
}
```

Look at what is in `ModelRequest` and what is not. It has the four things any chat model needs to do a turn: a system prompt, the conversation, the tools, and an output ceiling. It has one extra field, `hard`, which is a routing hint the loop fills in, and which I will come back to. What it does not have is a model id, or a temperature, or anything that names a provider. The request describes the work. It does not name who does it.

`Model` is the interface. One method, `complete`, that takes a request and returns a `Message`. Anything that satisfies that shape is a model as far as the loop is concerned: a real provider, a router that picks between several, a recorded fixture in a test that never touches the network. This is the sentence "models are commodities" rendered as a type. It is a claim about the shape of your code before it is a claim about the market.

The first thing that satisfies the interface is a single provider model:

```typescript
const client = new Anthropic();

export function anthropicModel(id: string): Model {
  return {
    name: id,
    complete: (req) =>
      client.messages.create({
        model: id,
        max_tokens: req.maxTokens,
        system: req.system,
        tools: req.tools,
        messages: req.messages,
      }),
  };
}
```

That is the same API call that used to live in `step`, with one change: the model id is now an argument, not a literal. This is the only function in the entire harness that imports the vendor SDK or names a model string. Everything else, including the loop, now speaks `Model`. The blast radius of "we are switching providers" just shrank to one file.

## Route the turn, not the session

Once the model is a parameter, the obvious next question is which model, and the obvious wrong answer is "pick one." The right answer is "it depends on the turn," and that is the whole reason the model had to become a dependency in the first place. A string cannot vary by turn. A function can.

Watch what an agent loop actually spends its turns on. The agent reads a file and decides the next step. It runs a command and summarizes the output. It searches its context and picks the relevant slice. The large majority of turns in a tool-driven loop are this kind of routine digestion, and a small fast model handles them without complaint. A few turns are different: the opening plan, the recovery after something failed, the moment the task is genuinely ambiguous. Those want the strong model.

The price gap makes the case on its own. At the time of writing, the relevant tier runs roughly one dollar per million input tokens and five per million output for the small model, three and fifteen for the mid model, five and twenty-five for the large one.[^pricing] That is a three-to-five-times spread, paid on every turn, and most turns are the cheap kind. Routing them to the small model is not a micro-optimization. It is the difference between an agent you can afford to leave running and one you cannot.

The router is four lines, because all the work is in the interface it composes:

```typescript
export function router(cheap: Model, strong: Model): Model {
  return {
    name: `router(${cheap.name},${strong.name})`,
    complete: (req) => (req.hard ? strong : cheap).complete(req),
  };
}
```

A router is a `Model` that delegates to other `Model`s. The loop cannot tell the difference between a router and a single provider, which is the point: routing is invisible above the interface.

That leaves the actual decision, the `hard` flag, and here I am going to be honest rather than clever. The harness uses the cheapest signal that is already sitting in the loop: it starts optimistic and escalates on evidence of trouble.

```typescript
let hard = false; // first turn is optimistic: take the cheap model, escalate on trouble
// ... inside the loop, after running the turn's tools:
hard = results.some((r) => r.is_error); // a tool error means the next turn is recovery: send in the strong model
```

The first turn goes to the cheap model. A turn whose tools all succeeded is followed by another cheap turn. The moment a tool returns an error, the next turn is recovery, and recovery is exactly the kind of reasoning the strong model is worth paying for, so the next turn escalates. This is a proxy for difficulty, not a measurement of it, and I want it labeled as a proxy. A turn can be hard without any tool failing, and an error can be trivial to fix. Better signals exist: a tiny classifier turn that reads the request and rates it, the token length of the turn, an explicit tool the agent can call to say "this one needs thought." The harness ships the cheap signal because it costs nothing and recovers most of the value, and because a routing layer that is easy to reason about is worth more than one that is clever and opaque.

## Fallback is the layer below the SDK's retries

Routing handles cost and capability. It does nothing for availability, which is the axis that turns a slow night into a pager at 3 a.m. A model is a remote service, and remote services go down. A hardcoded string has exactly one response to an outage: stop.

The fix is a second `Model` that wraps a primary and falls over to a backup:

```typescript
export function withFallback(primary: Model, backup: Model): Model {
  return {
    name: `${primary.name}|${backup.name}`,
    async complete(req) {
      try {
        return await primary.complete(req);
      } catch (err) {
        if (!isOutage(err)) throw err;
        console.error(`# ${primary.name} is down (${String(err)}), failing over to ${backup.name}`);
        return backup.complete(req);
      }
    },
  };
}
```

The important judgment is in `isOutage`, and it is a judgment about which layer owns retries. The provider SDK already retries rate limits and server errors with exponential backoff before it ever throws. So if `complete` throws, the SDK has already tried and given up. This is not a busy endpoint, it is a down one, and you handle the two differently:

```typescript
function isOutage(err: unknown): boolean {
  return (
    err instanceof Anthropic.InternalServerError ||
    err instanceof Anthropic.APIConnectionError
  );
}
```

`InternalServerError` covers any status at or above 500, which is where an overloaded provider lands. `APIConnectionError` covers the network simply not answering. Those are the errors a different endpoint might survive, so those are the only ones worth failing over for. A `400` is not an outage, it is a malformed request, which is to say our bug. Retrying our bug on a second provider just breaks it twice and hides the cause. Fallback is for the failures that are theirs, not the ones that are ours.

The default wiring puts routing and fallback together:

```typescript
export function defaultModel(): Model {
  const haiku = anthropicModel("claude-haiku-4-5");
  const sonnet = anthropicModel("claude-sonnet-4-6");
  return router(withFallback(haiku, sonnet), withFallback(sonnet, haiku));
}
```

Each tier fails over to the other. That is a compromise I will name plainly: failing the strong tier down to the cheap one trades quality for availability on purpose, because a degraded answer beats no answer when the strong endpoint is dark. In production the backup is not a weaker model, it is the same tier on a second provider, the same Sonnet-class capability behind a different endpoint, wrapped in the same `Model` interface so the loop never learns there were two. And that is the real content of "models are commodities." It is only true if nothing above the interface knows which provider answered. The moment your loop branches on the vendor, you do not have a commodity, you have a lock-in with extra steps.

## What the loop changed

The point of doing this work in a file the loop does not import is that the loop barely changes. `agent.ts` drops the vendor SDK import and the `client`, asks for a model once, threads the routing flag, and logs which model actually answered each turn:

```typescript
const model = defaultModel();
// ...
let hard = false;
for (let i = 0; i < maxIterations; i++) {
  const response = await step(model, registry, messages, system, hard);
  console.error(`# turn ${i + 1} ${hard ? "hard" : "easy"} -> ${response.model}`);
  // ... handle tool calls ...
  hard = results.some((r) => r.is_error);
}
```

The `response.model` field is the model the request actually ran on, reported by the API, so the log is ground truth rather than what we hoped would happen. Run the agent on a clean task and the turns read `easy -> claude-haiku-4-5`. Make it hit a wall and the line after the failure flips to `hard -> claude-sonnet-4-6`. The routing is visible, per turn, in the place you were already watching.

## What this layer does not solve

The interface is in the right place. Several things behind it are still stubs, and naming them is the honest way to ship a boundary.

- **Responses are not normalized.** `complete` returns the vendor's `Message`, and the loop still reads its `content` blocks and `stop_reason` directly. A genuinely different provider returns a different shape, and making it fit means an adapter that translates content and stop reasons into one internal type behind the interface. The boundary is drawn; the translation across it is not written. Until it is, "swap the provider" works for any provider that speaks the same response shape, and no further.
- **The routing signal is a proxy.** Tool-error-means-hard is one cheap heuristic standing in for a real difficulty estimate. It misses hard turns that do not fail and over-escalates on trivial errors. A better router earns its keep with a real signal; this one earns its keep by being free and legible.
- **Cost is logged, not budgeted.** The harness prints which model ran. It does not count the tokens or the dollars, and it does not stop. A turn can route to the cheap model and still cost a fortune by carrying a huge context, and nothing here would notice. Seeing the model is not the same as seeing the bill.
- **Routing fights the cache.** Switching models mid-session invalidates the provider's prompt cache, because the cache is keyed per model.[^cache] An agent that alternates between two models every few turns keeps neither tier's cache warm, and the cache miss has a price of its own. A serious router weighs the saved price of the cheap tier against the lost savings of a cold cache. The harness routes naively and leaves that arithmetic for later.
- **The prompt is not portable.** The system prompt was written and tuned against one model family. A different provider may read it differently. The interface swaps the model; it does not swap the prompt that earned the model's behaviour, and a real multi-provider setup carries a prompt per family.

## Where this lands in the platform

Total damage going from `post-06` to `post-07`: one new file, `model.ts`, holding the `Model` interface, a single-provider implementation, a router, and a fallback wrapper. The change to `agent.ts` is seventeen lines added and nine removed: drop the SDK import and the client, take a model from `defaultModel()`, thread the `hard` flag through `step`, and log the model that answered. The loop, the registry, the sandbox, the four tools, the context layer, the retriever, and the memory are untouched. They were already speaking to a function that returns a response. They did not need to know the function grew a router and a fallback underneath them.

The rule from the earlier posts still holds. The harness only ever grows; it does not get rewritten. Each post adds one capability to the same artifact and explains why the layer below was not enough. Every layer until now existed to assemble the right tokens and hand them to one fixed model. This post took the fixedness away. The model is now a dependency the agent routes by difficulty, fails over on outage, and can replace without the loop noticing, and the one thing every other layer feeds is finally as swappable as the layers that feed it.

## Next

**Part 8: The Bill Is Part of the Loop.** Routing just turned cost and latency into a per-turn variable, and the harness still cannot see either one. Every layer in the series added a cost surface: tool output, pinned context, retrieved chunks, memory, and now a model that bills differently every turn. Part eight instruments the loop. Token and dollar accounting per turn, a trace you can actually read after the run, and the budget that turns "route the cheap model" from a hope into a ceiling the agent cannot cross. You cannot operate what you cannot see, and right now the most expensive thing in the platform is the thing you can see the least.

[^pricing]: Per-model pricing changes; treat these as the shape of the gap, not a current quote. At the time of writing, the small, mid, and large tiers used here (`claude-haiku-4-5`, `claude-sonnet-4-6`, `claude-opus-4-8`) run roughly $1 / $5, $3 / $15, and $5 / $25 per million input / output tokens respectively. The exact numbers matter less than the ratio: the cheap tier is several times cheaper per token, and most turns in a tool loop are cheap-tier work.

[^cache]: Prompt caches are scoped per model, so a request that changes the model id cannot read a cache written under the previous one. This is the same reason a fork operation has to reuse its parent's exact model and prompt prefix to hit the cache, and the reason routing every turn between two models is not free even when the cheaper model wins on raw token price.
