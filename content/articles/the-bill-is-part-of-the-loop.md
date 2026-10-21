+++
title = "The Bill Is Part of the Loop"
date = 2026-07-18
description = "Every model response already carries its own bill in the usage field, and the loop throws it away. This post reads that field, prices it against a table, and turns cost into a value the loop can see per turn and act on: a metering decorator that needs no loop change, a running ledger, prompt-cache accounting that moves the number the most, and a budget that degrades before it stops. Part eight of The Agent Platform Handbook."

[taxonomies]
tags = ["agents", "ai-platforms", "economics", "observability", "metrics", "typescript"]
series = ["the-agent-platform-handbook"]

[extra]
author = "Raffael"
image = "the-bill-is-part-of-the-loop.avif"
cover = "covers/the-bill-is-part-of-the-loop.avif"
+++

> Part 8 of *The Agent Platform Handbook. From Loop to Platform.* Previous: [The Model Is a Dependency](/articles/the-model-is-a-dependency/). Next: [Observability Is Not Logging](/articles/observability-is-not-logging/).

[Post seven](/articles/the-model-is-a-dependency/) pulled the model out of a hardcoded string and made it a dependency the loop can route and fail over. A `Model` is now an interface: `complete(request)` returns a response, and the loop neither knows nor cares whether a cheap model, a strong model, a router, or a fallback chain produced it. The harness sits at tag [`post-07`](https://github.com/raskell-io/the-agent-platform-handbook/tree/post-07).

That interface has a property we have not spent yet. Every response the model returns carries a `usage` object: input tokens, output tokens, cache reads, cache writes. It arrives on every single turn, exact, for free. And the loop reads past it every time.

You find out what an agent cost the way you find out about a gas leak. From the invoice, at the end of the month, long after the loop that caused it has exited. This post reads the number the loop already has, turns it into dollars, and then does the thing the title promises: feeds the bill back into the loop as an input the loop acts on. It ships as tag [`post-08`](https://github.com/raskell-io/the-agent-platform-handbook/tree/post-08).

## How we started paying attention

Cost control did not start with agents. It started with cloud. The FinOps movement grew up around the same problem one layer down: a bill that arrives monthly, aggregated by account, with no line back to the team or the feature that ran up the number. The fix there was chargeback and showback, attributing spend to the thing that caused it, close enough to the moment it happened that someone could still change their behavior.

Agents inherited the problem and made it worse, because an agent spends money in a tight loop with no human in it. The prompt-caching pricing changes of 2024 and 2025 turned the token bill into something you could cut by an order of magnitude if you structured the prompt correctly, and left it untouched if you did not. Gateway products like OpenRouter and Portkey appeared in part to surface per-call cost that the raw provider dashboards buried.

The through-line is the same each time. The bill is a lagging signal until you move it next to the code that generates it. What follows is that move, for one agent loop.

## The number is already in your hand

Here is the response type the SDK hands back on every call, trimmed to the field that matters:

```typescript
type Usage = {
  input_tokens: number;
  output_tokens: number;
  cache_creation_input_tokens: number | null;
  cache_read_input_tokens: number | null;
};
```

Four buckets, and every one of them is priced differently. This is the whole reason the naive approach (count the tokens, multiply by one number) is wrong. A token you write to the cache and a token you read back from it differ in price by more than ten times.

It is worth being precise about why reading this beats reading a dashboard. The provider console shows you the same tokens, but a day late and aggregated per API key, not per task. That is the FinOps problem again, exactly. The `usage` field is a leading signal you already hold. The dashboard is a lagging report you go and fetch. For a loop that has to decide, mid-run, whether it can afford the next turn, only one of those is any use.

## A price is a table, not a constant

A new file, `price.ts`, holds what a turn costs. It starts by naming the four rates, then lists them per model:

```typescript
import type { Usage } from "@anthropic-ai/sdk/resources/messages";

// All four rates in US dollars per million tokens. A price is data, not logic:
// it drifts, so it lives in one table you edit, next to the ids it describes.
export type Price = {
  input: number;
  output: number;
  cacheWrite: number; // 5-minute write, 1.25x input
  cacheRead: number; //  cache hit,      0.1x input
};

const PRICES: Record<string, Price> = {
  "claude-haiku-4-5": { input: 1, output: 5, cacheWrite: 1.25, cacheRead: 0.1 },
  "claude-sonnet-4-6": { input: 3, output: 15, cacheWrite: 3.75, cacheRead: 0.3 },
};
```

A common objection lands here: prices change, so a hardcoded table is already wrong. That is true and it does not matter as much as it sounds. The `usage` counts are exact, straight from the response. Only the multiplier is a guess, and a multiplier that is wrong by a constant factor still ranks turns correctly, still triggers a budget at roughly the right place, still tells you the strong model costs several times the cheap one. The table is a config value you edit in one place when a vendor moves a number. It is not load-bearing precision.

Turning a `usage` record into a cost is then arithmetic:

```typescript
// Price one response. The buckets are summed separately because a cache read
// costs a tenth of fresh input, and that gap is the whole point of caching.
export function costOf(model: string, usage: Usage): number {
  const p = PRICES[model];
  if (!p) throw new Error(`no price for model ${model}`);
  return (
    (usage.input_tokens * p.input +
      usage.output_tokens * p.output +
      (usage.cache_creation_input_tokens ?? 0) * p.cacheWrite +
      (usage.cache_read_input_tokens ?? 0) * p.cacheRead) /
    1_000_000
  );
}
```

That is the entire pricing layer. It knows nothing about the loop, the router, or the budget. It converts a response into a number.

## Metering is a decorator, not a rewrite

Now the payoff for having made the model a dependency in the last post. Cost accounting is not new plumbing threaded through the loop. It is one more decorator on `Model`, the same shape as the `router` and `withFallback` from post seven.

First, somewhere to accumulate:

```typescript
export type Ledger = {
  turns: number;
  cost: number;
  byModel: Record<string, number>;
};

export function newLedger(): Ledger {
  return { turns: 0, cost: 0, byModel: {} };
}
```

Then the decorator. A `metered` model wraps another model, lets it run, reads the `usage` the response already carried, prices it, and files it in the ledger:

```typescript
import type { Model } from "./model";
import { costOf } from "./price";

export function metered(inner: Model, ledger: Ledger): Model {
  return {
    name: `metered(${inner.name})`,
    async complete(req) {
      const res = await inner.complete(req);
      const cost = costOf(res.model, res.usage);
      ledger.turns += 1;
      ledger.cost += cost;
      ledger.byModel[res.model] = (ledger.byModel[res.model] ?? 0) + cost;
      return res;
    },
  };
}
```

Note `res.model`, not the requested model. The router picks a tier and the fallback chain may override it, but the response reports who actually answered. Metering prices the truth, not the intent.

It slots into `defaultModel` between the router and the concrete models, one line changed:

```typescript
export function defaultModel(ledger: Ledger, capUSD: number): Model {
  const haiku = anthropicModel("claude-haiku-4-5");
  const sonnet = anthropicModel("claude-sonnet-4-6");
  const routed = router(withFallback(haiku, sonnet), withFallback(sonnet, haiku));
  return withBudget(metered(routed, ledger), ledger, capUSD);
}
```

The loop calling `defaultModel` never learns that metering happened. That is the same invisibility `withFallback` has, and it is the point. Because the model is an interface, observability composes onto it without touching control flow.

## Attribute the spend, do not just total it

The ledger keeps a per-model breakdown, `byModel`, and that is not decoration. The previous post argued that a tool-driven loop spends most of its turns on routine digestion, which the cheap model handles, and reserves the strong model for the few hard turns. That was an argument. The ledger turns it into a measurement.

Add one line to the loop and every turn prints what it cost:

```typescript
const before = ledger.cost;
const response = await step(model, registry, messages, system, hard);
const turnCost = ledger.cost - before;
console.error(
  `# turn ${i + 1} ${hard ? "hard" : "easy"} -> ${response.model} ` +
    `$${turnCost.toFixed(4)} (run $${ledger.cost.toFixed(4)})`,
);
```

Run a real task and the shape falls out of the log: a long tail of cheap Haiku turns at a fraction of a cent each, punctuated by a handful of Sonnet turns after a tool error, each worth several of the cheap ones. The routing claim from post seven stops being something I asserted and becomes something the ledger prints. That is the quiet value of metering. It closes the loop on the previous post before it does anything new.

## The cache moves the number more than the model does

Here is the part that surprised me, and it is why this post adds caching rather than assuming it.

Look again at `costOf`. A cache read is priced at a tenth of fresh input. The harness has a large, stable prefix on every single turn: the pinned `.AGENTS/` context, the tool descriptions, the memory block, the system prompt. Post six built all of it. And until now, every turn paid full input price to send that prefix again.

Prompt caching is a prefix match. Mark the stable part with a cache breakpoint and the second turn onward reads it back instead of re-sending it. In `model.ts`, the system prompt was a plain string:

```typescript
system: req.system,
```

Wrapping it in a cached block is the whole change:

```typescript
system: [{ type: "text", text: req.system, cache_control: { type: "ephemeral" } }],
```

Now watch the ledger across two turns of the same run. On turn one, `cache_creation_input_tokens` is large: you pay the 1.25x write premium once to seed the cache. On turn two, that same span comes back as `cache_read_input_tokens` at 0.1x, and `input_tokens` collapses to just the new content of the turn. For an agent whose prefix dwarfs its per-turn additions, which is most agents, this is the single largest line item you can move.

The lesson is the ordering. You could not see this win until you were measuring. The first thing the ledger revealed was not a cheaper model to switch to. It was a prefix you were paying to resend. Metering pointed at the fix before it paid for itself.

## A budget is a ledger with authority

Everything so far is observation. Metering watches, it does not act. The title of this post promises the bill becomes part of the loop, and that requires the ledger to grow teeth.

A budget is one more decorator. It reads the running total the ledger has been keeping and, crucially, it degrades before it stops:

```typescript
export class BudgetExceeded extends Error {
  constructor(readonly spent: number, readonly cap: number) {
    super(`budget exceeded: $${spent.toFixed(4)} of $${cap.toFixed(2)}`);
  }
}

export function withBudget(inner: Model, ledger: Ledger, capUSD: number): Model {
  const soft = capUSD * 0.8;
  return {
    name: `budget(${inner.name})`,
    complete(req) {
      if (ledger.cost >= capUSD) throw new BudgetExceeded(ledger.cost, capUSD);
      const overSoft = ledger.cost >= soft;
      // past the soft line, ride the cheap model regardless of the hard flag
      return inner.complete({ ...req, hard: req.hard && !overSoft });
    },
  };
}
```

Two thresholds, two behaviors. Past eighty percent of the cap, the budget clears the `hard` flag before the turn runs, so the router sends the cheap model even on a turn the loop wanted the strong one for. The agent gets slower and dumber, but it keeps going. At the hard cap, it raises `BudgetExceeded` and refuses the turn outright.

The loop catches that and stops with grace instead of a surprise:

```typescript
const ledger = newLedger();
const model = defaultModel(ledger, 0.5); // fifty-cent ceiling for the run

// inside the loop:
try {
  const response = await step(model, registry, messages, system, hard);
  // ... handle the turn
} catch (err) {
  if (err instanceof BudgetExceeded) {
    console.error(`# ${err.message} -- stopping with a partial answer`);
    return;
  }
  throw err;
}
```

An agent that hits its ceiling now returns what it has, with a log line saying why, instead of billing you for a runaway loop you find out about tomorrow. The composition order matters and is worth reading off `defaultModel`: the budget wraps the meter, which wraps the router. The budget reads the total the meter has been filling, and adjusts the request before the router ever sees it. The bill from the last N turns shapes turn N plus one. That sentence is the literal meaning of the title.

## Tradeoffs and what this does not solve

The honest edges, as a table, because "it depends" owes you one:

| Concern | Where it holds | Where it breaks |
| --- | --- | --- |
| Token counts | Exact, from the response | Never estimated, so never the weak point |
| Price table | One file, easy to update | You own keeping it current; a vendor change is silent until you edit it |
| Budget | A backstop against runaway loops | Not a scheduler. It caps total spend, it does not plan the cheapest path to the goal |
| Attribution | Per run, per model | Not yet per user or per tenant. That is a platform concern, and it comes later |
| Degrade-before-stop | Keeps the agent alive near the cap | A task that genuinely needs the strong model will do worse under the soft cap, quietly |

The last row is the one to watch in production. Riding the cheap model past the soft cap trades quality for survival on purpose, and on a hard task that trade can produce a confidently worse answer with no error to flag it. The budget buys you a bounded bill, not a good outcome under pressure. Know which one you are asking for.

## Where this lands in the platform

The loop can now route the turn, fail over when a provider is down, and stay inside a spend ceiling while it does. Cost has moved from a report you read the next day to an input the loop consumes on the current turn. Three of the properties the model exposes (which one, whether it is up, what it costs) are now things the harness reads and acts on, rather than things that happen to it.

What the harness still cannot do is tell you what it did. The ledger knows the run cost forty cents across nine turns, but it cannot show you the shape of those turns: which tool failed, which turn escalated, where the time went. That per-turn record is the raw material for a trace, and turning it into one is the next post.

Everything here ships as tag [`post-08`](https://github.com/raskell-io/the-agent-platform-handbook/tree/post-08), the same as every part in the series: a `price.ts`, a `metered` and a `withBudget` decorator, a ledger, and the one line of caching that moved the number the most.
