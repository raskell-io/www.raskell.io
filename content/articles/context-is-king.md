+++
title = "Context Is King: The Layer That Makes a Model Yours"
date = 2026-12-01
draft = true
description = "Models are general; context makes them yours. Why every person will have a context layer, and what I learned building one for my own agents."

[taxonomies]
tags = ["agent-experience", "context-engineering", "knowledge-management", "external-memory", "provenance", "local-first", "agents"]

[extra]
author = "Raffael"
in_short = [
  "Generative pre-trained transformers made capability general and cheap; what makes them effective for a particular person is context, and that is where the next large gains in effectiveness and efficiency come from.",
  "Every person who works with agents will have a personal context layer, and the assistants they talk to will be as good as that layer; the model is rented, so the context should be owned, in open formats, by the person.",
  "The layer I built for my own agents is a small router of linked Markdown notes in git that every session starts from, with separation enforced in code and one command as the only interface.",
  "A nightly dream consolidates it against session transcripts with no human review, which is defensible only because the gates are mechanical and every night can be reverted.",
  "Kurumi is the assistant on top of such a layer, and IT Intelligence is the same layer for a whole organisation: the pattern is one, at every scale.",
]
+++

The large language models of the last few years made capability general. A generative pre-trained transformer has read a large part of what humanity has written, and it can draft, reason, translate and write code in almost any domain. That was the revolution. What it did not do is make the model know anything about you: your projects, your rules, the decisions you already made and why, the people you work with, the mistakes you do not want repeated. The model is the same for everyone. Whatever makes it yours has to come from somewhere else.

That somewhere else is context, and I think it is where the next large step in what these systems can do will come from: the same model, given the right two kilobytes about the person it works for. This post is about that layer: why it matters more than most people assume, why every person who works with agents will end up with one, and what I learned building mine.

## The general model and the missing context

Generality is the gift of these models and it is also their gap. A model that can do almost anything does not know which of those things you need, in which style, under which constraints, with which history. Every session with an assistant that lacks that knowledge starts with a stranger, and you pay for it twice: in effectiveness, because the stranger guesses and some guesses are wrong, and in efficiency, because it spends tokens and minutes rediscovering your world before it does anything useful.

Context closes both gaps. In [Context Is the Product](/articles/context-is-the-product/) I argued that models are becoming commodities and context is not. In [Agent Experience](/articles/agent-experience/) I described how much an agent has to guess as the measure of how well a system serves it. A personal context layer is agent experience for a person: the same model, given a short page about who you are, what you are building and which mistakes not to repeat, asks fewer questions, guesses less, spends fewer tokens getting oriented, and makes the kind of change you would have made. It becomes bespoke without being retrained.

There is measured evidence that a curated layer adds something that search alone does not. In [The components of agent memory](https://www.anthropic.com/research/components-of-agent-memory), Anthropic reports that when Claude had both a search tool and a wiki it had built up over time, its score rose "from 54% to 61% as that wiki grew, compared with 53% when it had access to the search tool alone". Search finds what exists. A curated layer says what matters.

## Every person, a context layer

I think every person who works with agents will have something like this within a few years, and that the way people interact with their assistants will be shaped by it. You will not prompt a model; you will talk to an assistant, by text or by voice, that already knows your projects, your commitments and your way of working, and that acts for you across your tools. Several assistants, probably, from different vendors, for different jobs. What makes them yours, and what keeps them consistent with each other, is the layer they all draw from.

The important question is who owns that layer. Today memory mostly lives inside products. Each agent tool keeps its own, in its own format, and what one learns about you stays there. That is convenient and it is a trap: the more an assistant knows about you, the harder it is to leave, and the more of your working life sits in a store you cannot read, move or correct. The alternative is a context layer that belongs to the person, in open formats on their own devices, versioned like code, and offered to whichever assistant they choose through a small interface. The model is rented. The context should be owned.

Owning it also means building it, at least for now. What follows is how I built mine, in general terms and with simplified names, and the decisions I would keep.

## Building one

Every coding agent session I started began with a stranger. What an agent did learn during a session was stored per working directory and per tool, so a lesson one agent picked up in one repository never reached another agent in the next. For a while I kept two hand-maintained copies of the same rules in the instruction files of two different agent tools, and they drifted apart within days. So I built one place that knows what I work on, what my rules are and how I like work done, and that every agent session starts from. I call it my brain, since that is what it is for my agents. It took one long session with a coding agent and a fair amount of arguing with it about the design.

The requirements, as I stated them at the start:

- plain Markdown in git, interlinked, cheap to parse and to search;
- usable by more than one agent tool, and later by others;
- separate contexts, such as personal projects and work for a client or employer, that must never mix;
- a nightly "dream" that consolidates, challenges and refines the notes, with no human review;
- a few absolute rules that nothing may override, with everything else open to revision.

The agent and I disagreed about almost every one of these before anything was built, and the disagreements produced the design.

## A router, not a store

The first draft wanted the brain to know everything. That conflicts with being cheap to load, and it duplicates information that already has a home. The version that held up is a router: the notes hold distilled facts and pointers, and each project's own files, its README, its decision records, its status file, stay the source of truth. A session loads a small entry page, about 2,600 bytes in practice, and follows links from there when it needs more.

Every note is one Markdown file about one thing: a project, a rule, a lesson, a machine, an open question. The front matter says what it is and how far to trust it:

```markdown
---
id: lesson.verify-before-done
type: lesson
context: core
title: Verify before reporting done
summary: A passing build is not a finished change; look at the result.
status: confirmed
source: person
date: 2026-11-02
---

Screenshots of the page in light, dark and phone width before saying a site
change is done. Applies to every project with a UI; see [[rule.no-unverified-claims]].
```

`status` separates what the person said or confirmed from what an agent inferred, and `source` says where the note came from: the person, a session, an import or a dream. That one distinction does a lot of work. An agent can follow a confirmed rule without asking and treat an unconfirmed one as a hint to check.

Notes link to each other with `[[id]]`. A small compiler turns the folder into two things: a one-line-per-note index for agents that want to scan, and a graph file for anything that wants to traverse:

```json
{
  "nodes": [
    { "id": "lesson.verify-before-done", "type": "lesson", "status": "confirmed" },
    { "id": "rule.no-unverified-claims", "type": "rule", "status": "confirmed" }
  ],
  "edges": [
    { "from": "lesson.verify-before-done", "to": "rule.no-unverified-claims" }
  ]
}
```

A linter rejects broken links, unknown types, an entry page that has grown too large, and any note that refers to another context. The structure is deliberately close to what Anthropic describes for Claude's own memory: transcripts as ground truth, one page per entity, linked pages, and a small injected layer on top. Claude Code keeps that top layer small in the same spirit; according to the same post, it loads "only the first 200 lines or 25 KB" of its memory index into each session.

## Separate repositories, and a wall

Separating contexts by folders inside one repository does not work, because anything that can read the repository can read all of it. The design instead has one core repository for what is true of the person in every context, such as working style and general rules, and one repository per context for its projects and lessons. A session loads core plus exactly one context. A note in a context can link to core, and cannot express a link into another context at all, because ids only resolve within core and the current context.

That is separation at read time. The harder problem is separation at write time, when something leaves the machine. Telling an agent not to mix contexts is an instruction, and instructions are followed most of the time. A hook that refuses the commit is a wall. So the wall became code: hooks on commit, commit message and push, and a hook on the agent's outward-facing shell commands. Each works out which context the repository belongs to and blocks content, author identity, commit messages and push targets that carry another context's identifying terms. It fails closed, and it was tested against nine cases in a throwaway repository before it was switched on.

The most useful hour of the whole session came from running the wall's audit over repositories that already existed. It found things nobody had looked for: a tool's local cache file committed by accident to a public repository, with an internal account name inside; absolute home-directory paths in public files, which reveal the machine's user name; an agent instruction file whose contents agents had copied into project instruction files. Some fixes were ordinary commits, one needed a history rewrite, and one repository became private. Two limits are worth knowing before you rely on a rewrite: a hosting provider can keep old commits reachable by hash, and a fork someone else owns stays public. The general lesson is that **separation has to be enforced where content leaves the machine, not in the prompt**, and that building the guard is worth it for the audit alone.

The same idea applies to the rules themselves. A small set of axioms, things that must never change, are sealed with a lock file of hashes, and sealing needs an interactive terminal, so no agent can do it. Everything else, including rules I stated myself, is open to challenge. I first wanted every rule I had written to be protected from the dream, and the agent pushed back: that is too broad, because it freezes rules that turn out to be wrong, and too weak, because a protection the dream could edit protects nothing. Few axioms, mechanically sealed, and the rest open, was the better answer.

## One command, any agent

Every session starts the same way. A command, `ctx context`, prints the entry page, the axioms in one line each, the current context's home page and, if the working directory belongs to a known project, that project's note. One agent tool runs it from a session-start hook; the other is told to run it in its instruction file. A third tool, or a tool that does not exist yet, can call the same command. `ctx find` and `ctx show` look things up, and `ctx capture "..."` appends to an inbox.

This is the least exciting part of the design and the one I would copy first. Integration through a command that prints text keeps every consumer ignorant of how the brain is stored. The notes can move, the format can change, the graph can grow a database underneath, and no agent configuration has to change. It is a stable contract on the second rung of the [legibility ladder](/articles/agent-experience/#the-legibility-ladder), and it means the brain is not tied to any one agent vendor.

## Dreaming

The part that makes the brain grow is a nightly consolidation, which I call dreaming because Anthropic and others do. The idea of letting my notes dream came from [Joachim Prinzbach](https://www.linkedin.com/in/joachimprinzbach/), a colleague at Helvetia, who showed it to me before Anthropic published its post on agent memory; the short version of that story is in [Memory that dreams](/notes/memory-that-dreams/). The idea comes from how memory is thought to work in people: during sleep and quiet rest, "the hippocampus replays our recent experiences", and some of them are distilled into lasting knowledge (Anthropic). Letta and UC Berkeley proposed [sleep-time compute](https://www.letta.com/blog/sleep-time-compute) in 2025 as a way for agents to use idle time to reorganise what they know, and Anthropic shipped [dreaming in Claude Managed Agents](https://claude.com/blog/new-in-claude-managed-agents) in May 2026.

Each night, for each context separately:

{% diagram(title="One night of dreaming, for one context") %}
  step            what happens
  ──────────────  ───────────────────────────────────────────────────────────
  1 harvest       session transcripts (text only, capped), new inbox entries,
                  the tools' own memory files, notes written by hand in Kurumi
                          │
                          ▼
  2 consolidate   a headless model, run in this context's repository:
                  test the notes against the transcripts; correct, merge
                  and prune; record what lasts; raise conflicts as open
                  questions; write a short journal of what changed
                          │
                          ▼
  3 gate          touched a protected path?  linter fails?  hook refuses?
                          │
                 yes ─────┴───── no
                  │               │
                  ▼               ▼
            discard the     commit and push:
            whole run       one dream, one commit
{% end %}

The gates are what make this defensible without a person reviewing it. The transcripts are the ground truth and are never edited. The protected paths, the axioms, the registry of contexts, the tool itself, the hooks and the dream's own prompt, cannot be touched; a run that touches one is thrown away whole. The linter and the commit hook apply to the dream like to any other writer. And because one dream is one commit, any night can be reverted with one command. Unreviewed automation is reasonable when the gates are mechanical and the undo is cheap; it is reckless when the only gate is the model's judgement.

The first real run took about three minutes. It read three sessions and the tools' own memory files and committed thirteen files. It corrected a stale claim in the notes I had written by hand to seed the brain. It took rules one agent tool had written into its private memory and turned them into notes the other tool could see. And it raised one open question, about two positions of mine that pull against each other, which is exactly what I want a second brain to do and what I would never have written down myself.

Anthropic's post has a good example of why the transcript matters as ground truth. In a long run of a game, a memory note held the wrong location for a place Claude needed, and dreaming "checked the note against the session transcript, caught its error, and rewrote it". With the corrected note Claude went straight on; with the uncorrected one it went back to the wrong route three times. A memory that is never checked against what happened does not stay neutral. It drifts, and the agent follows it.

## Kurumi: the assistant on top of the layer

A context layer that only agents can read drifts away from the person it describes, so I need to read and correct it comfortably too. I do that in [Kurumi](https://kurumi.raskell.io), the local-first notes app I build, and Kurumi is also where the idea of a personal assistant on top of a personal context layer is furthest along.

Kurumi keeps its data in its own database, but it can sync a local folder of Markdown and read changes back. The brain does not point Kurumi at its notes directly. A command, `ctx mirror`, writes a one-way copy in Kurumi's own format, one vault per context. Links are rewritten from ids to titles, because Kurumi resolves links by title. The dream's open questions become Kurumi's own question records and the project notes its project records, so they show up where I already track questions and projects. Each night's journal becomes a note, so "what changed last night" is something I read with my coffee. A note that leaves the brain is marked as deleted rather than removed, because Kurumi restores files that simply disappear. And anything I write in Kurumi is picked up by the next dream as my own words, with `source: person`.

Kurumi was already working on the same idea from the person's side. Its built-in agent keeps a note called "Kurumi memory" that it reads at the start of every conversation, and anyone can open and edit it, which is a small injected layer in exactly the sense above. When you ask it about a person or a project, it walks your notes along the links, in both directions, to the to-dos, decisions and open questions attached, and shows the path it took as a small graph. And a "living note" rewrites itself from the notes on its topic every few hours, with links back to every source, which is dreaming at the scale of a single page.

The mirror is a workaround. The proper version is a Kurumi feature I have started: a linked folder vault that opens the brain's files directly, keeps their foreign front matter byte for byte, resolves links by a configurable key and guards every write with a content hash. The first part, read-only linked vaults behind Kurumi's store, is on a branch; the rest is in progress.

## The same layer, for a whole company

If this sounds familiar, it should. In [IT Intelligence](/articles/it-intelligence/) and the [reference implementation](/articles/building-it-intelligence/) I described a knowledge layer for a whole organisation's IT landscape. A personal context layer is the same pattern at the scale of one person:

| | IT Intelligence, for an organisation | A context layer, for a person |
|---|---|---|
| Raw material | exports and APIs of every system | session transcripts, inbox, hand-written notes |
| What is kept | entities and edges, with a basis, a confidence and a source | one note per entity, with a status and a source |
| Source of truth | each system of record | each project's own files |
| Consolidation | ingest, judge, build and score, on a schedule | the nightly dream |
| What a person reviews | a queue of uncertain links to confirm | open questions raised by the dream |
| How agents read it | an MCP server with small answers and provenance | one command that prints a small page |
| How people read it | a web interface with entity pages and graphs | Kurumi |
| What must never happen | an inferred link silently promoted to fact | one context's content in another's repository |

In both cases the design rests on the same few decisions: keep what sources said apart from what was concluded, say how far each fact can be trusted, let machines do the consolidation under gates that do not depend on their judgement, give agents a small and stable way in, and give people a readable view of the same thing. I did not plan the parallel. It appeared because the problem is the same: a general model, dropped into a specific world, needs a map of that world it can trust.

## What to copy

If you want to build your own, these are the decisions I would keep, in order of how much they mattered:

- **A router, not a store.** Small notes that point at the real sources, and a small entry page.
- **One note per entity, with status and source.** Confirmed and inferred are different kinds of knowledge; mark them.
- **Links as ids, compiled into an index and a graph.** Cheap to scan, cheap to traverse, checked by a linter.
- **One command as the only interface.** Every agent tool calls it, none of them knows how the notes are stored.
- **Separation as code.** Separate repositories for contexts that must not mix, and hooks that refuse what should not leave.
- **Few axioms, sealed by hand.** Everything else open to revision.
- **Consolidation with mechanical gates.** Transcripts as ground truth, protected paths, a linter, one revertable commit per run.
- **A human view of the same notes.** If you cannot read and correct your context layer comfortably, it will drift away from you.

## What is not proven yet

This is a working system, but a young one, and some parts have only been shown once. At the time of writing, the scheduled nightly job had not run on its own yet; one dream was run by hand, for one context. The second agent tool's wiring had not been exercised in a live session. The mirror into Kurumi was checked against Kurumi's code, its parser, link resolver and record reader, but not yet in the running app, and the linked folder vault has unit tests and nothing more. I will write about how it holds up after a few months of nights.

## The model is rented

The models will keep getting better, and everyone will have the same ones. What will differ is what each of them knows about the person or the company it works for. That knowledge does not come with the model, it does not have to be locked inside a vendor's product, and it is not hard to start: a folder of linked notes, a command that prints the right page, and a few gates you can trust. Context is what turns a general model into your assistant, and it is the part you can own.

## References

- Lance Martin, [The components of agent memory](https://www.anthropic.com/research/components-of-agent-memory), Anthropic, 6 November 2026.
- Anthropic, [New in Claude Managed Agents: dreaming, outcomes, and multiagent orchestration](https://claude.com/blog/new-in-claude-managed-agents), 19 May 2026.
- Letta, [Sleep-time Compute](https://www.letta.com/blog/sleep-time-compute), 21 April 2025.
- [Do Language Models Need Sleep? Offline Recurrence for Improved Online Inference](https://arxiv.org/abs/2605.26099), arXiv, May 2026.
- [Kurumi](https://kurumi.raskell.io), a local-first second brain, and its [documentation on AI and the agent](https://github.com/raskell-io/kurumi/blob/main/docs/ai.md).
- Raffael Schneider, [Context Is the Product](/articles/context-is-the-product/), [Agent Experience](/articles/agent-experience/), [IT Intelligence](/articles/it-intelligence/) and [Building IT Intelligence](/articles/building-it-intelligence/).
