+++
title = "Context inertia, and the cure is forgetting"
date = 2026-10-26
draft = true
description = "Long-running agents fixate on a subtask and will not let go. The fix is the oldest tool in the box: clear the context and keep the work."

[taxonomies]
tags = ["context-engineering", "agents", "external-memory", "evaluation"]
+++

The new failure mode Breunig names is context inertia: a model trained to be persistent hyper-focuses on a hypothesis or a subtask and keeps pursuing it after it should stop. The examples arrived together. Anthropic's self-replication tests found agents fixating on one proposed solution if they ran too long; Microsoft Research's Fork-and-Flush paper found research agents making ever tinier changes to one idea instead of searching for alternatives, which looks on a chart like a gain followed by a long flat line; a Berkeley paper is called, bluntly, Scaling Discovery Requires Forgetting. Persistence is what makes a good coding agent, and the same quality works against it on a long horizon.

The cures are the same in all three, and none is new. Clear the conversation on a schedule, every ninety minutes in Anthropic's harness, after a short written note, while keeping the environment: the files, the code, everything the agent produced stays, and only the running context goes. Each clearing shows up on the Berkeley chart as another jump. Breunig's point is that after two years of new models we still have the same six context tools, and inertia is handled with three of them: quarantine, offloading and deletion.

A commenter on the Hacker News thread described the practice from the inside: checkpoint into artifacts, code, a retroactive design document and a retroactive execution plan, hand them to a fresh agent to validate, and resume with a clean context. He noticed that the design doc and the plan had become outputs of the coding process rather than inputs to it, and did not know what to make of that. I think it is exactly what [Memory Is a Write Path](/articles/memory-is-a-write-path/) says from the other direction: what survives a context reset is what was written down, so the writing down is the work. Another commenter, running everything locally, reported that pruning before compaction rarely pays, because it invalidates the prompt cache for everything after the pruned turn; forgetting is cheap, selective forgetting is not.

## References

- Drew Breunig, [The State of Context Engineering](https://www.dbreunig.com/2026/10/24/the-state-of-context-engineering.html) (24 October 2026).
- [Hacker News discussion](https://news.ycombinator.com/item?id=50235780) of the talk.
