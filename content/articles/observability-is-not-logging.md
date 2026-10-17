+++
title = "Observability Is Not Logging"
date = 2026-07-25
draft = true
description = "The ledger from part eight knows a run cost forty cents across nine turns, and nothing about the shape of those turns. This post turns the per-turn record into a trace: a span type in one file, a tracer that captures the causal tree of a run without touching the loop, and an honest account of when the homegrown tracer should give way to OpenTelemetry and its GenAI semantic conventions. Part nine of The Agent Platform Handbook."

[taxonomies]
tags = ["agents", "ai-platforms", "observability", "typescript"]
series = ["the-agent-platform-handbook"]

[extra]
author = "Raffael"
image = "observability-is-not-logging.avif"
og_image = "observability-is-not-logging.png"
+++

<!--
DRAFT NOTES — remove before publish
1. CODE DEPENDENCY: the handbook repo is at post-06. Commit + tag post-07 (model.ts,
   agent.ts) and post-08 (price.ts, ledger, metered, withBudget) BEFORE this post,
   then implement + tag post-09 (span.ts, tracer, traced). The tag links in the live
   Part 7 and Part 8 articles are currently 404 for the same reason. Reconcile the
   Span/Tracer code below against the real repo before publishing.
2. Set the final date; remove draft = true.
3. Add hero (960x300 -> .avif) and OG (1200x630 .png) as observability-is-not-logging.*
4. Wire Part 8's "Next:" line to link here: /articles/observability-is-not-logging/
5. Part 10 title confirmed as "Evaluation Closes the Loop"; link the "Next:" line
   below once post-10 publishes (brief promoted in context/briefs/the-agent-platform-handbook.md).
-->

> Part 9 of *The Agent Platform Handbook. From Loop to Platform.* Previous: [The Bill Is Part of the Loop](/articles/the-bill-is-part-of-the-loop/). Next: Evaluation Closes the Loop.

[Post eight](/articles/the-bill-is-part-of-the-loop/) taught the loop to read its own bill. Every response carries a `usage` object, a price table turns it into dollars, and a ledger accumulates the total, attributed to the run that caused it. The harness sits at tag `post-08`: a loop, a router, a fallback chain, a meter, and a budget that degrades before it stops.

That ledger can tell you a run cost forty cents across nine turns. It cannot tell you anything about the nine turns. Which one escalated to the strong model. Which tool call failed and got retried. Where the seven seconds of wall-clock actually went. The number is a sum, and a sum throws away the shape of the thing it summed.

This post keeps the number and recovers the shape. It turns the per-turn record the meter already produces into a trace: a tree of spans you can read top to bottom and see the run happen. It ships as tag `post-09`: a `span.ts`, a tracer the decorators write into, and one line in the loop.

## What observability actually meant

The word did not start in software. It came from control theory, where a system is observable if you can reconstruct its internal state from its outputs. That is the useful definition to carry into an agent harness, because it draws a line most "observability" tooling ignores. Logging gives you outputs. Observability is the claim that the outputs are enough to reconstruct what the system did.

The industry arrived here the long way. First there were logs, lines of text you grepped after something broke. Then metrics, counters and gauges you could graph, good for "how many" and useless for "which one." Then, in 2010, Google published Dapper, the paper that described distributed tracing: propagate an identifier across service boundaries, record a span for each unit of work, and reassemble the spans into the tree of a single request. Honeycomb and Charity Majors later reframed the whole category around a sharper test. Monitoring answers the questions you knew to ask in advance. Observability is for the questions you did not, the unknown-unknowns you can only investigate after the incident, by slicing the raw events along a dimension you did not think mattered until now.

OpenTelemetry is where that history settled. It defines three signal types, and the distinction between two of them is the entire point of this post. A log is an event at a point in time. A trace is a causal tree of spans, each with a start, an end, a parent, and attributes. Logs tell you what happened. Traces tell you what happened *because of* what, and how long each step took inside the whole.

An agent run is a distributed system that happens to live in one process. The loop calls the model, the model asks for tools, the tools call the filesystem and the network and sometimes another model. That is a call tree with latency and cost at every node. Logging it gives you a flat wall of lines in arrival order. Tracing it gives you the tree.

## The unit is the turn, the run is a tree

Here is the reframe that makes the code obvious. The atom of an agent is not the request and not the log line. It is the turn: one pass through the loop, one model call, zero or more tool calls, and whatever the model decided to do with the results. A run is a sequence of turns, and each turn is itself a small tree of work.

The meter from post eight was already emitting one structured record per model call. Input tokens, output tokens, cache reads, cost. Those records are not logs. They are span attributes that have not been given a span yet. All that is missing is the causal structure: a parent for each record, a start and an end, and the tool calls sitting as siblings to the model call inside the same turn.

So the job is not to add logging. The harness is drowning in potential log lines already. The job is to give the events a tree.

## A span in one type

A span is a named interval with attributes and children. That is the whole data structure.

```typescript
type SpanKind = "run" | "turn" | "model" | "tool";

type Span = {
  name: string;
  kind: SpanKind;
  startedAt: number;
  endedAt?: number;
  attributes: Record<string, string | number | boolean>;
  children: Span[];
  error?: string;
};
```

A tracer owns the current span and a stack, so that anything opening a span becomes a child of whatever is already open. This is the one piece of shared state the harness needs, and it is deliberately boring.

```typescript
class Tracer {
  private stack: Span[] = [];
  root?: Span;

  start(name: string, kind: SpanKind, attributes: Record<string, string | number | boolean> = {}): Span {
    const span: Span = { name, kind, startedAt: now(), attributes, children: [] };
    const parent = this.stack[this.stack.length - 1];
    if (parent) parent.children.push(span);
    else this.root = span;
    this.stack.push(span);
    return span;
  }

  end(span: Span, error?: string) {
    span.endedAt = now();
    if (error) span.error = error;
    this.stack.pop();
  }
}
```

`now()` is a monotonic clock, not wall time, so a clock adjustment mid-run cannot make a span appear to end before it started. Everything else falls out of these two methods. Open a span, do the work, close it. The parent link is implicit in the order you open them, which is exactly the causal structure a trace is supposed to capture.

## Tracing without touching the loop

The pattern from the last two posts pays off again here. In [post seven](/articles/the-model-is-a-dependency/) the model became an interface, and in [post eight](/articles/the-bill-is-part-of-the-loop/) `metered` and `withBudget` wrapped that interface without the loop noticing. Tracing is one more decorator on the same interface.

```typescript
function traced(model: Model, tracer: Tracer): Model {
  return {
    async complete(request) {
      const span = tracer.start("model.complete", "model", {
        "request.model": request.model,
      });
      try {
        const response = await model.complete(request);
        span.attributes["response.model"] = response.model;
        span.attributes["usage.input_tokens"] = response.usage.input_tokens;
        span.attributes["usage.output_tokens"] = response.usage.output_tokens;
        span.attributes["cost.usd"] = priceOf(response.usage, response.model);
        return response;
      } catch (err) {
        tracer.end(span, String(err));
        throw err;
      }
      finally {
        if (!span.endedAt) tracer.end(span);
      }
    },
  };
}
```

Two attributes on that span do more than they look. `request.model` is what the router was asked for; `response.model` is what actually answered. When the budget from post eight downgrades a turn past its soft cap, those two disagree, and the trace records the downgrade as data instead of a mystery. The cost attribute reuses `priceOf` from the meter, so the same number the ledger sums is now pinned to the exact span that spent it.

The tool side is the same move, applied where the registry dispatches. A run opens the root span, each turn opens a turn span, and each tool call the model requests opens a child under the current turn.

```typescript
async function callTool(registry: Registry, call: ToolCall, tracer: Tracer) {
  const span = tracer.start(`tool.${call.name}`, "tool", { "tool.name": call.name });
  try {
    const result = await registry.dispatch(call);
    span.attributes["result.bytes"] = result.length;
    return result;
  } catch (err) {
    tracer.end(span, String(err));
    throw err;
  } finally {
    if (!span.endedAt) tracer.end(span);
  }
}
```

The composition order matters, the same way it did for the meter and the budget. The tracer sits outermost, wrapping the whole model chain, because a span should capture what actually happened including the retry and the downgrade, not the intent before either. The one line the loop gains is the turn span, opened at the top of each pass and closed at the bottom. Everything else is a decorator the loop never sees.

## Reading the shape of a run

This is the part the ledger could not give you. A single run, rendered as its span tree, with duration, tokens, and cost on each node:

```
run  agent.session                                    7.41s   $0.41
├─ turn 1                                             0.83s   $0.002
│  └─ model.complete  haiku→haiku            412 tok  0.79s   $0.002
├─ turn 2                                             1.14s   $0.004
│  ├─ model.complete  sonnet→sonnet        1.2k tok  0.71s   $0.004
│  └─ tool.fs.read    docs/schema.md         ok       0.05s
├─ turn 3                                             2.02s   $0.006
│  ├─ model.complete  sonnet→sonnet        1.4k tok  0.68s   $0.006
│  └─ tool.shell      migrate.sh          ERROR       1.31s
├─ turn 4  (retry)                                    1.90s   $0.005
│  ├─ model.complete  sonnet→sonnet        1.3k tok  0.66s   $0.005
│  └─ tool.shell      migrate.sh            ok        1.22s
└─ turn 5                                             1.52s   $0.393
   └─ model.complete  sonnet→opus         3.1k tok  1.49s   $0.393
```

Read it top to bottom and the run explains itself. Turn one was cheap and ran on the small model. Turn three failed in the shell, not in the model, and the loop retried it in turn four. Turn five is where the money went: the request asked for `sonnet` and `opus` answered, which means the router escalated a hard turn, and that single span is ninety-five percent of the bill. The ledger told you the run cost forty-one cents. The trace tells you that thirty-nine of those cents live in one span, and points at the exact turn to look at first.

No prior post could show you that picture, because each one owned a fragment of it. Routing lived in [post seven](/articles/the-model-is-a-dependency/), cost in [post eight](/articles/the-bill-is-part-of-the-loop/), the shell tool in [post two](/articles/your-agent-wants-root/), the tool registry in [post three](/articles/tools-how-agents-actually-do-things/). The trace is the first artifact that holds all of them in one frame, because it records the run rather than any one subsystem's view of it.

## When the homegrown tracer stops being enough

The span tree above is a hundred lines of code and it will carry you a long way. It stops carrying you at the point where you want to keep traces across runs, query them by attribute, compare today's latency against last week's, or hand a trace to someone who is not sitting at your terminal. Building a storage layer, a query language, and a waterfall UI is not a side quest. It is a product, and it already exists several times over.

That is where OpenTelemetry earns the dependency. The upgrade is the same tool-boundary trick the series keeps using: the `Tracer` above is an interface, so you swap the body for an OTel `Tracer`, keep the decorators, and the loop still never notices. What you get in return is an exporter to any backend that speaks OTLP, Jaeger and Tempo and Honeycomb among them, and a schema other people already understand.

The schema part is worth a beat, because OpenTelemetry has been standardizing exactly this problem. The GenAI semantic conventions define attribute names for model spans so that a trace from your harness and a trace from someone else's mean the same thing:

```typescript
span.setAttributes({
  "gen_ai.operation.name": "chat",
  "gen_ai.request.model": request.model,
  "gen_ai.response.model": response.model,
  "gen_ai.usage.input_tokens": response.usage.input_tokens,
  "gen_ai.usage.output_tokens": response.usage.output_tokens,
});
```

Adopt those names on the homegrown span from the start, even before you take the dependency, and the eventual migration is a rename instead of a rewrite. One caveat worth stating plainly: as of mid-2026 the GenAI conventions are still marked experimental and the attribute names have moved between releases. Pin the version you target and expect to touch the mapping again. This is an area where I would keep the indirection of my own attribute names and translate at the export boundary, rather than scatter `gen_ai.*` strings through the harness.

## What not to put on a span

The tempting move, the first time you have spans, is to attach everything. The full prompt, the full completion, every tool result verbatim. Do not, and the reasons are the operational ones that bite later rather than in the demo.

The first is data. Prompts and completions are the most sensitive payload the agent touches. They carry user input, retrieved documents, secrets the model was handed, and whatever the tools read off disk. A span attribute is a copy of that data, shipped to a telemetry backend, retained on its schedule, visible to anyone with query access. A trace store is not the place you want a second uncontrolled copy of every prompt to live. Redact at the boundary, or record a hash and a length instead of the text, and put the full content behind a separate, access-controlled path if you need it at all.

The second is cardinality and cost. Tracing everything at full fidelity is not free, and the bill has the same shape as the token bill from last post: it arrives later and larger than you expected. High-cardinality attributes, unique ids and full text, are what make trace storage expensive and trace queries slow. Sampling is the usual answer, and it has a trap the agent case makes worse. Head sampling, deciding at the start of a run whether to keep it, will throw away the rare expensive trace precisely because it looked ordinary at turn one. If you sample, sample at the tail, after the run's cost and outcome are known, so the forty-cent escalation and the failed tool call are the ones you keep.

A short list of failure modes worth naming, because each one has cost me time somewhere:

- Spans that never close, because an error path skipped the `end` call. The `finally` block above exists for exactly this. An unclosed span silently swallows its children in the tree.
- Clock skew from wall-time timestamps. Use a monotonic clock for durations.
- Attribute explosion, where a well-meaning `attributes["prompt"] = prompt` turns every trace into a storage line item.
- Sampling that hides the incident, covered above.
- A trace that looks complete but is missing the tool subtree, because a tool was called through a path that did not open a span. Coverage of the instrumentation is itself a thing to check.

## Tradeoffs and what this does not solve

The honest edges, as a table, because "it depends" owes you the specifics:

| Concern | Where it holds | Where it breaks |
| --- | --- | --- |
| Span tree | Exact causal shape of one run, read top to bottom | Overhead and storage grow with how much you instrument |
| Homegrown tracer | No dependency, readable, ships in one file | No persistence, no query, no UI past the terminal |
| OTel + GenAI semconv | Portable, backend-agnostic, others understand it | Conventions still experimental, names drift between releases |
| Prompt and output on spans | Full fidelity when you are debugging a bad answer | A second uncontrolled copy of sensitive data, plus cost |
| Sampling | Bounds the telemetry bill | Head sampling drops the rare trace you most wanted |

The row to watch is the last content row. A trace is only as safe as the least sensitive thing you put on it, and the pressure to attach the full prompt is strongest at exactly the moment you are debugging something important. Decide the redaction rule once, at the export boundary, and do not relax it per incident.

What this does not solve is judgment. The trace shows you that turn five cost thirty-nine cents and escalated to `opus`. It does not tell you whether that was the right call or a router that panics on hard prompts. It shows you the shell tool failed and retried. It does not tell you whether the migration was safe to retry at all. The trace is the evidence. Reading it is still the job, and knowing whether the run was actually *good*, not just observable, is a different feedback loop and the next post.

## Where this lands in the platform

The loop can now route a turn, fail over when a provider is down, stay inside a budget, and reconstruct exactly what it did when you ask. Four of the properties an agent exposes at runtime, which model answered, whether it was up, what it cost, and the causal shape of the work, are now things the harness reads and records rather than things that happen to it and vanish.

What the harness still cannot do is tell you whether any of it was correct. The trace of a run that produced a wrong answer looks exactly like the trace of a run that produced a right one. Same spans, same tokens, same cost, and the only difference is a judgment nothing in the harness has made yet. Closing that gap, turning outcomes into a signal the loop can be measured against, is where this goes next.

Everything here ships as tag `post-09`: a `span.ts`, a `Tracer`, three `traced` decorators over the model and the tools, and the one line in the loop that opens a turn span.
