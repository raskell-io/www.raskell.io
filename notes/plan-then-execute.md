---
title: "Plan, then let go"
url: https://raskell.io/notes/plan-then-execute/
author: Raffael Schneider
date: 2026-11-20
description: "Wargames call it WEGO, agent builders call it plan-then-execute: commit to the whole plan, lock it in, then watch it run without touching it."
tags: [agents, agent-harness, game-design, simulation, emergence]
---

# Plan, then let go

While working on the design of Waterfront, the game I am sketching as a successor to [Gangsters: Organized Crime](https://raskell.io/notes/orders-for-the-week/), I went looking for the name of the rhythm I loved in it: give your orders with the clock stopped, then watch the week play out and do not touch it. Wargamers call it WEGO, *"we go"*, as opposed to the alternating *"I go, you go"* of classic turns. Everyone plans in secret, everything resolves at once. [Diplomacy](https://en.wikipedia.org/wiki/Diplomacy_(game)) works this way on paper, [Combat Mission](https://en.wikipedia.org/wiki/Combat_Mission) and [Frozen Synapse](https://en.wikipedia.org/wiki/Frozen_Synapse) on screen.

The same shape turned up, under a different name, in the work I do during the day. In agent architectures it is called plan-then-execute, and it is the counterpart to the [ReAct](https://arxiv.org/abs/2210.03629) loop, where the model reasons, calls a tool, reads the result, and decides the next step, over and over. A plan-then-execute agent drafts the whole sequence of tool calls first, and then ordinary code or smaller models run it without asking the planner again.

The three phases are the same in both worlds:

| Phase | In the game | In the agent |
|---|---|---|
| Plan | the weekly order sheet: who goes where, with whom, and what to do if it goes wrong | the planner writes the full graph of tool calls, with branches |
| Lock in | the week starts; no orders change until it ends | control passes to the executor; the plan is fixed |
| Execute | the city runs, schedules cross, you watch | the steps run; the planner sees the outcome at the end |

The reason for the lock is different in each. In the game, the lock is where the fun comes from: you cannot rescue a bad plan mid-week, so planning carries the weight, and the week becomes a story you did not write. In the agent, the lock is a security property. [Design Patterns for Securing LLM Agents against Prompt Injections](https://arxiv.org/abs/2506.08837) (Beurer-Kellner and others, 2025) puts it plainly: *"A prompt injection cannot force the LLM into executing a tool that is not part of the defined plan."* Untrusted text read during execution can still bend the arguments of a planned call, the paper notes, but it cannot add a new one. This year a Berkeley group went further and argued in [Web Agents Should Adopt the Plan-Then-Execute Paradigm](https://arxiv.org/abs/2605.14290) (Piet and others, 2026) that web agents should fix their program before reading any live page, since pages mix in text from sellers, reviewers and advertisers.

The trade-off is also the same. Plan-then-execute suits work where the big picture matters more than the next step and where reacting to what you see is risky or expensive. It suits poorly work where you cannot know the next step until you see the result of this one. A player in Waterfront who wants to react to every event would be playing the wrong game, and an agent exploring an unknown codebase is better off in a loop.

What I like is that the friction is the point in both. The player and the planner give up control at the moment it would be most tempting to keep it, and in exchange they get something that cannot happen while they hold on: a week that surprises you, an agent whose control flow nobody else can rewrite. I spend my days on the second and my evenings on the first, and it is a small pleasure to find they are one idea.

## References

- Luca Beurer-Kellner and others, [Design Patterns for Securing LLM Agents against Prompt Injections](https://arxiv.org/abs/2506.08837), arXiv:2506.08837, 2025.
- Julien Piet and others, [Web Agents Should Adopt the Plan-Then-Execute Paradigm](https://arxiv.org/abs/2605.14290), arXiv:2605.14290, 2026.
- Shunyu Yao and others, [ReAct: Synergizing Reasoning and Acting in Language Models](https://arxiv.org/abs/2210.03629), arXiv:2210.03629, 2022.
- [Combat Mission](https://en.wikipedia.org/wiki/Combat_Mission), Wikipedia.
