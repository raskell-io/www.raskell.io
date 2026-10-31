+++
title = "The Run Outlives the Process"
date = 2026-11-20
draft = true
description = "Processes die mid-run. This part journals every model response and tool result, so a run resumes after a crash, and waits a week for an approval, without repeating anything."

[taxonomies]
tags = ["agents", "durable-execution", "reliability", "ai-platforms", "typescript"]
series = ["the-agent-platform-handbook"]

[extra]
author = "Raffael"
in_short = [
  "So far a run lived exactly as long as the process running it, so a crash, a deploy, or an approval that took a day meant starting over, paying again, and repeating side effects.",
  "This part gives every run a journal: each model response and tool result is appended and flushed to disk before the run moves on, and a resume replays it instead of asking again.",
  "One primitive does the work: do a step at most once per run, keyed by the turn number or the tool call's id, so a replay makes the same decisions and pays nothing for them.",
  "The same journal turns approval into a durable wait: the run records what it needs, stops, and carries on a minute or a week later, once a person has decided.",
  "The one gap left is a crash between doing a step and recording it, so tools with side effects must be safe to repeat; past a single machine, this is a job for an engine such as Temporal or Restate.",
]
+++

<!--
DRAFT NOTES (remove before publish)
1. REAL RUN: the two run blocks in "Trying it" are illustrative. They match the format of a
   run against a mock of the Messages API (the machinery is real: crash, resume, approval and
   replay were all exercised; the model replies, costs and run ids are not). Run the demo with
   ANTHROPIC_API_KEY in the handbook repo and paste the real output:
     CRASH_AFTER_TURN=2 bun agent.ts "What do the release tags in this repository mean? Remember the answer."
     bun agent.ts runs
     bun agent.ts resume <run-id>
     bun agent.ts approve <run-id>
     bun agent.ts resume <run-id>
   If the model takes a different path (say, no memory_write), rewrite the walkthrough around it.
2. The code is on branch post-11-wip (commit dd327d0) in the handbook repo, on top of post-10.
   After post-10 is tagged with its real baseline: rebase post-11-wip onto main, fast-forward
   main, tag post-11, push.
3. Hero image (960x300 PNG), then AVIF, OG PNG, `mise run covers`.
4. Part 12 title for the "Next:" line (identity per the plan in part one).
5. Wire Part 10's "Next:" line to /articles/the-run-outlives-the-process/, and set the date.
-->

> Part 11 of *The Agent Platform Handbook. From Loop to Platform.* Previous: [Evaluation Closes the Loop](/articles/evaluation-closes-the-loop/). Next: identity.

This series builds a small agent in TypeScript, one piece per part, and every part ships as working code in a [companion repository](https://github.com/raskell-io/the-agent-platform-handbook). By now the agent uses tools inside a sandbox, reads project context, remembers across sessions, picks a model per turn, stays inside a budget, records every run as a trace, and, since [part ten](/articles/evaluation-closes-the-loop/), is scored against a golden set that fails the build when it gets worse.

All of that assumes one thing nobody wrote down: that a run finishes in the process that started it. The loop holds the conversation in an array. If the process dies in turn six, the array dies with it, and the only way forward is to start again from turn one. That means paying for turns one to five a second time, hoping the model takes the same path, and running every tool again, including the ones that changed something.

Processes die all the time. A deploy restarts the container. The machine runs out of memory. The laptop lid closes. A provider times out in the middle of a turn. And some runs are meant to stop: when an agent needs a person to approve something, the honest answer is often "tomorrow", and no process should sit in memory for a day waiting for it.

This part makes a run outlive the process running it. Every model response and every tool result goes into a journal on disk before the run acts on it, and a run can be resumed from that journal at any time, by any process. The code is at tag [`post-11`](https://github.com/raskell-io/the-agent-platform-handbook/tree/post-11).

## How durable execution got here

The idea is older than agents by decades. Databases solved it first: a write-ahead log records each change before it is applied, so after a crash the database replays the log and arrives where it was. Journaling file systems did the same for disks. The pattern is always the same: write down what you are about to rely on, make the write survive, then rely on it.

Long-running business processes needed it next, because they span many systems and much more time than one transaction. Hector Garcia-Molina and Kenneth Salem described [sagas](https://www.cs.cornell.edu/andru/cs711/2002fa/reading/sagas.pdf) in 1987: a long transaction split into steps, each with a compensating step that undoes it, so a process that cannot finish can still leave the world consistent. Workflow engines spent the next thirty years putting that idea into products.

The version this part borrows from is younger. Microsoft's [Durable Functions](https://learn.microsoft.com/en-us/azure/azure-functions/durable/durable-functions-orchestrations) keep an orchestration's history as a sequence of events, and after a restart they re-run the orchestrator code from the start; whenever the code asks for an activity that already ran, the framework hands back the recorded result instead of running it again. Cadence, built at Uber and open-sourced in 2017, and [Temporal](https://temporal.io/about), founded by Cadence's creators in 2019, made the same model general: a workflow's [event history](https://docs.temporal.io/workflow-execution) is the source of truth, and a worker that picks it up replays it to the point of failure and carries on. [Restate](https://restate.dev/blog/why-we-built-restate/), from the people who built Apache Flink, records an execution journal for each invocation and replays it on re-invocation in the same way.

Agent frameworks arrived at the same need from the other side. LangGraph's [checkpointers](https://docs.langchain.com/oss/python/langgraph/persistence) persist a thread's state after every step, for, in their words, "human-in-the-loop workflows, time travel, and fault tolerance". The workflow engines now market themselves for agents, and the agent frameworks now ship persistence. They are converging because an agent run is a long-running process with an unusually expensive and unusually unpredictable step in the middle of it: the model call.

## What a crash costs

It is worth being precise about what goes wrong, because each loss needs a different fix.

The work is lost. Turns one to five happened, and their results lived in memory. Starting over means paying for them again, in money and in time.

The path is lost. A model is not deterministic. Starting over does not repeat the first five turns, it produces five new ones, which may go somewhere else entirely. The run you resume is not the run you had.

Side effects repeat. If turn three wrote a memory, sent a message, or opened a ticket, starting over does it again.

The wait is lost. A run that was waiting for a person has nowhere to wait except in memory. Kill the process and the question it asked is gone, along with everything that led up to it.

A journal fixes the first three, and turns the fourth from a problem into a feature.

## The shape of it

{% diagram(title="A run and its journal") %}
   bun agent.ts "<goal>"                    bun agent.ts resume <run-id>
            │                                          │
            ▼                                          ▼
   ┌──────────────────┐   append, fsync    ┌──────────────────────────┐
   │ the loop, turn N │ ─────────────────▶ │ runs/<run-id>.jsonl      │
   │                  │                    │ start, model, tool, ...  │
   │ once(step):      │ ◀───────────────── │ wait, decision, end      │
   │ recorded? read   │   replay on resume └──────────────────────────┘
   │ otherwise: do it │                                ▲
   └────────┬─────────┘                                │
            │ a tool needs approval                    │
            ▼                                          │
   record "wait", stop                                 │
                                         bun agent.ts approve <run-id>
{% end %}

The loop is the loop from part one, with every step that touches the outside world routed through one function, `once`. The journal is an append-only file per run. Starting a run creates a journal; resuming one replays it. Approval, which used to be impossible, becomes two lines in the same file: what the run is waiting for, and what a person decided.

## A journal is a file

Each line of the journal is one thing that happened, as JSON:

```typescript
export type Entry =
  | { kind: "start"; goal: string; at: string }
  | { kind: "model"; key: string; value: unknown; cost: number }
  | { kind: "tool"; key: string; name: string; value: unknown }
  | { kind: "wait"; key: string; name: string; input: Record<string, unknown>; at: string }
  | { kind: "decision"; key: string; approved: boolean; at: string }
  | { kind: "end"; stopped: string; at: string };
```

A model entry holds the whole response the model gave, and what it cost. A tool entry holds the result the tool returned, success or error. The goal is in the first line, so a run can be resumed from its id alone.

The one detail that makes it a journal rather than a log is when the write happens. An entry is appended and flushed to disk with `fsync` before the loop continues, so once `append` returns, the entry survives a `kill -9`, a reboot, or a lost container:

```typescript
append(entry: Entry): void {
  const fd = openSync(this.file, "a");
  try {
    writeSync(fd, JSON.stringify(entry) + "\n");
    fsyncSync(fd);
  } finally {
    closeSync(fd);
  }
  this.entries.push(entry);
}
```

A crash can still land in the middle of a write and leave half a line at the end of the file. Every line before it was flushed whole, so reading the journal stops at the first line that does not parse. The torn step is simply not in the journal, and the resume does it again.

A file per run is the smallest thing that works, and it is honest about where it stops working: one machine, one disk. Moving the journal to a database table, or to a service built for it, changes `append` and `open` and nothing else.

## Once per step

Everything else rests on one function. Given a step and a key, `once` returns the recorded result if the journal has one, and otherwise does the step live and records its result before anyone can act on it:

```typescript
export async function once<T>(journal: Journal, kind: "model" | "tool", key: string, live: () => Promise<...>) {
  const recorded = journal.find(kind, key);
  if (recorded) {
    return { value: recorded.value as T, cost: "cost" in recorded ? recorded.cost : 0, replayed: true };
  }
  const result = await live();
  journal.append({ kind, key, ... });
  return { ...result, replayed: false };
}
```

The model call in the loop goes through it, keyed by the turn number:

```typescript
const r = await once(journal, "model", `turn ${i + 1}`, async () => {
  const before = ledger.cost;
  const value = await step(model, registry, messages, system, hard);
  return { value, cost: ledger.cost - before };
});
```

So does every tool call, keyed by the `tool_use` id the model gave it. The keys are what make replay work. A key has to come out the same on every replay, and both do: the turn number because the loop counts the same way, the tool call id because it comes from a model response that was itself read back from the journal.

That is also the answer to the question every durable execution system has to answer, which is what to do about nondeterminism. Temporal asks you to write workflow code that is deterministic and to push everything that is not, network calls, clocks, random numbers, into activities whose results get recorded. An agent loop has one big source of nondeterminism, the model, and it already sits behind a single call. Record that call, and the loop around it becomes deterministic: given the same recorded responses, it builds the same messages, asks for the same tools, with the same ids, in the same order. The replay does not have to hope the model repeats itself, because the model is not asked.

Two consequences follow, and both are worth stating plainly. A replay costs nothing: the recorded responses come from a file, with no tokens and no latency. The budget from part eight still counts them, because the ledger adds each replayed turn's recorded cost back in; a run that was interrupted at forty cents of a fifty-cent ceiling does not get a fresh fifty cents by crashing. And a replay reproduces decisions, not the world. If a file changed on disk between the crash and the resume, the replayed turns still see the old content they read the first time, and the first live turn after them sees the new one. That is the right behavior, because the replayed turns already acted on what they saw, but it is worth knowing when a resumed run surprises you.

## The gap that remains

There is one window `once` cannot close: after a tool has done its work and before its result is in the journal. A crash there means the journal has no record of the call, so the resume makes it again. Every durable execution system has this window, and the name for the guarantee it leaves you is at-least-once: a step runs one or more times, never zero, and usually once.

The fix is not in the journal, it is in the tools. A tool with side effects has to be safe to run twice. `memory_write` already is, because it writes a memory by name, and writing the same memory twice leaves the same file. A tool that charges a card or sends an email has to be made safe, and the usual way is an idempotency key: the tool passes a unique id with the request, and the receiving system ignores a second request with an id it has already seen. Stripe's API works exactly [this way](https://docs.stripe.com/api/idempotent_requests). The `tool_use` id the model assigns to each call is a ready-made key, stable across replays, and a tool that forwards it downstream gets exactly-once effects out of an at-least-once loop.

## Waiting for a person

The journal also solves a problem the loop could not solve before. Some calls should not happen until a person has looked at them. In this harness the obvious one is `memory_write`: it is the only tool whose effect outlives the run, since every later session reads what it wrote. So it gets a flag:

```typescript
export const memory_write: Tool = {
  name: "memory_write",
  approval: true,
  ...
};
```

When the model asks for a call that needs approval, the loop records what it is waiting for and stops. Nothing of that turn runs until every call in it has been decided, so the resume picks up the turn whole:

```typescript
const pending = toolUses.filter(
  (b) => registry.needsApproval(b.name) && !journal.find("tool", b.id) && !journal.find("decision", b.id),
);
if (pending.length > 0 && approvals === "wait") {
  for (const b of pending) {
    if (!journal.find("wait", b.id)) {
      journal.append({ kind: "wait", key: b.id, name: b.name, input: b.input, at: new Date().toISOString() });
    }
  }
  return { answer: null, stopped: "waiting", cost: ledger.cost, calls };
}
```

`bun agent.ts approve <run-id>` appends a decision for each open wait, and `deny` appends a refusal, which the model sees as an error result on that call and has to work around. Then `bun agent.ts resume <run-id>` replays the run up to the waiting turn, finds the decision, and carries on live. Between the stop and the resume there is no process at all. The run is a file, and it can wait a minute or a month.

This is the part I find most useful in practice, because it removes a false choice. Without durability, an agent either does everything without asking, or keeps a process alive while it asks, which is fragile and does not scale past a demo. With a journal, asking is just another kind of step.

The evaluator from part ten gets one new option for this. An eval run must not wait for a person, and must not change anything a person would have had to approve, so `eval.ts` runs the agent with `approvals: "deny"`, and gives every run a throwaway directory for its journal, the way it already did for memory.

## A tool that never answers

A durable run can still hang. A tool that waits forever on a network call keeps the run in the turn forever, and no journal helps with that. So every tool now has a deadline, thirty seconds unless the tool says otherwise:

```typescript
async function withTimeout(work: Promise<ToolResult>, ms: number): Promise<ToolResult> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const deadline = new Promise<ToolResult>((resolve) => {
    timer = setTimeout(() => resolve({ ok: false, error: `timed out after ${ms} ms` }), ms);
  });
  try {
    return await Promise.race([work, deadline]);
  } finally {
    clearTimeout(timer);
  }
}
```

A timeout is an ordinary error result. The model sees it, the next turn goes to the stronger model as with any tool error since part seven, and the result is journaled like any other, so a resume does not wait thirty seconds again. What the timeout does not do is stop the call: the promise keeps running in the background. A tool that can be stopped should take an `AbortSignal`, and a tool with side effects should be safe to repeat anyway, for the reason in the previous section.

Model calls already had their own version of this. The SDK retries transient errors, and the router from part seven fails over to the other tier when one is down. The journal adds the piece that was missing: when all of that still fails and the process gives up, the next process does not start from zero.

## Trying it

`CRASH_AFTER_TURN` makes the agent kill itself, the hard way, after a given turn, so the whole cycle can be seen in a minute. Here a run is asked what the release tags mean and to remember the answer, and dies after its second turn:

```
$ CRASH_AFTER_TURN=2 bun agent.ts "What do the release tags in this repository mean? Remember the answer."
# run run-mvwsvzbz-xqw3
# turn 1 easy -> claude-haiku-4-5-20251001 $0.0099 (run $0.0099)
> fs_read {"path":"README.md"} -> ok
# turn 2 easy -> claude-haiku-4-5-20251001 $0.0099 (run $0.0198)
> context_search {"query":"release tags"} -> ok
# simulated crash after turn 2

$ bun agent.ts runs
run-mvwsvzbz-xqw3  interrupted  What do the release tags in this repository mean? Remember the answer.

$ bun agent.ts resume run-mvwsvzbz-xqw3
# run run-mvwsvzbz-xqw3, resuming from 5 journal entries
# turn 1 easy -> claude-haiku-4-5-20251001 $0.0099 (run $0.0099) replayed
> fs_read {"path":"README.md"} -> ok (replayed)
# turn 2 easy -> claude-haiku-4-5-20251001 $0.0099 (run $0.0198) replayed
> context_search {"query":"release tags"} -> ok (replayed)
# turn 3 easy -> claude-haiku-4-5-20251001 $0.0099 (run $0.0297)
# approval needed: memory_write {"name":"release-tags-map-to-posts", ...}
# run run-mvwsvzbz-xqw3 is waiting: bun agent.ts approve run-mvwsvzbz-xqw3 (or deny), then resume
```

The first two turns come back from the journal: same responses, same tool results, no tokens spent. Turn three is live, and it wants to write a memory, so the run stops and says what it is waiting for. Approving it and resuming finishes the run:

```
$ bun agent.ts approve run-mvwsvzbz-xqw3
approved: memory_write {"name":"release-tags-map-to-posts", ...}
now: bun agent.ts resume run-mvwsvzbz-xqw3

$ bun agent.ts resume run-mvwsvzbz-xqw3
# run run-mvwsvzbz-xqw3, resuming from 8 journal entries
# turn 1 easy -> claude-haiku-4-5-20251001 $0.0099 (run $0.0099) replayed
# turn 2 easy -> claude-haiku-4-5-20251001 $0.0099 (run $0.0198) replayed
# turn 3 easy -> claude-haiku-4-5-20251001 $0.0099 (run $0.0297) replayed
> memory_write {"name":"release-tags-map-to-posts", ...} -> ok
# turn 4 easy -> claude-haiku-4-5-20251001 $0.0099 (run $0.0396)
Each post-NN tag is the agent exactly as that part of the handbook leaves it. I saved that as a memory.
```

The trace printed after a resume shows what this process did: the replayed turns, marked as replayed, and the live ones with their model calls and costs. The running total in the turn lines is the run's, across every process that worked on it. Resuming a finished run again replays all four turns and prints the same answer, at no cost, which turns out to be a convenient way to look at an old run.

## Use an engine, or build this?

About three hundred lines of journal, loop changes, and tool flags are enough to show the mechanism, and the mechanism is the point of this part: once you have seen `once` and a key, every durable execution product is easier to understand. They are not enough to run a fleet on.

| Approach | Where it holds | Where it breaks |
| --- | --- | --- |
| A journal file per run (this part) | One machine, few runs, easy to read and debug | No locking, no shared storage, no scheduling, no versioning |
| A table in your database | Shared by several workers, queryable | You build leases, retries, timers, and replay yourself |
| LangGraph checkpointer | Already in the framework, per-step state | State snapshots rather than a journal of effects; the side-effect gap is yours |
| Temporal or Restate | Many workers, timers, signals, versioning, years of hard cases | An engine to run and operate, and a programming model to learn |

The rule I use: build the small version to understand it, and use an engine the moment a second machine is involved. Two processes resuming the same run at the same time is a bug this code does not prevent, and the fix, a lease on the run, is the first of many things an engine already does. I am building one of those engines myself, [Aqueduct](https://github.com/raskell-io/aqueduct), for the procedures that agents write and people approve, and [The River and the Canal](/articles/the-river-and-the-canal/) is the long version of why.

## What this does not solve

Versioning is the hard one. A journal records what an earlier version of the code did. If the code changes between the crash and the resume, say a tool was renamed or the system prompt grew a paragraph, the replayed steps still match their keys, but the live turns after them run against a conversation the new code would not have produced. Temporal handles this with explicit version markers in workflow code. Here, the safe practice is to finish or abandon runs before deploying a change that alters the tools or the loop.

The journal holds everything the run saw. Every file the agent read and every response it got is in that file, which makes it as sensitive as the most sensitive thing the agent touched. It belongs on encrypted storage, with the same access rules as the data, and it should expire.

Journals grow. A run of a few turns writes a few kilobytes; an agent that runs for days writes a lot more. Real systems compact old history into a snapshot or cap how long a run may live. This one keeps everything, which is fine for a harness and wrong for production.

Concurrent resumes are not prevented, as above. And at-least-once remains at-least-once: the journal narrows the window for a repeated side effect to the moment between doing and recording, but only the tool can close it.

## Where this lands in the platform

The loop can now route a turn, fail over, stay inside a budget, explain itself, be scored, and survive its process. The run is no longer a variable in memory. It is a file that any process can pick up, and that makes two things possible that were not before: an agent that keeps going after a restart, and an agent that stops on purpose to ask.

Asking raises the next question. When the agent waits for approval, who is asking, and on whose behalf? So far the agent has borrowed the identity of whoever started it: their API key, their file permissions, their name in the logs. The next part gives the agent an identity of its own, with its own credentials, its own permissions, and a person who answers for it.

As with every part of the series, the code is in the [companion repository](https://github.com/raskell-io/the-agent-platform-handbook), and [`post-11`](https://github.com/raskell-io/the-agent-platform-handbook/tree/post-11) is the agent exactly as this part leaves it. One new file holds the journal, the loop runs every model call and tool call through `once`, tools can ask for approval and have deadlines, and the command line gained `resume`, `approve`, `deny`, and `runs`.

## References

- Hector Garcia-Molina and Kenneth Salem, [Sagas](https://www.cs.cornell.edu/andru/cs711/2002fa/reading/sagas.pdf), SIGMOD 1987
- Microsoft, [Durable orchestrations](https://learn.microsoft.com/en-us/azure/azure-functions/durable/durable-functions-orchestrations): event sourcing and replay in Durable Functions
- Temporal, [Workflow Execution](https://docs.temporal.io/workflow-execution): event history, replay, and deterministic constraints; [Who we are](https://temporal.io/about)
- Stephan Ewen, [Why we built Restate](https://restate.dev/blog/why-we-built-restate/)
- LangChain, [LangGraph persistence](https://docs.langchain.com/oss/python/langgraph/persistence)
- Stripe, [Idempotent requests](https://docs.stripe.com/api/idempotent_requests)
