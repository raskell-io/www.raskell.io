+++
title = "Memory that dreams"
date = 2026-11-15
description = "A colleague showed me that agent memory should dream before Anthropic published on it. Replay the day, and check the notes against what happened."

[taxonomies]
tags = ["external-memory", "context-engineering", "agents", "neuroscience", "knowledge-management"]
+++

The best idea in the context layer my agents start from was not mine. [Joachim Prinzbach](https://www.linkedin.com/in/joachimprinzbach/), a colleague at Helvetia, showed me the idea that it should dream: run while nobody is working, read back the day's sessions, and tidy up what the agents learned, the way sleep is thought to tidy up what people learned. He did so before Anthropic published its post on the subject, which I only read afterwards.

That post, [The components of agent memory](https://www.anthropic.com/research/components-of-agent-memory) by Lance Martin, explains why the idea works. During sleep and quiet rest, "the hippocampus replays our recent experiences", and some of them are distilled into lasting knowledge. Agents already keep the raw material for the same division of labour: their transcripts. The post's best example comes from a long run of a game, where a memory note held the wrong location for a place Claude needed. Dreaming "checked the note against the session transcript, caught its error, and rewrote it", and Claude went straight on; in the run with the uncorrected note it went back to the wrong route three times. The post also measures the effect of a wiki that grows by dreaming: with both the wiki and a search tool, Claude's score rose "from 54% to 61% as that wiki grew, compared with 53% when it had access to the search tool alone". And it explains why the layer injected into every session has to stay small; Claude Code loads "only the first 200 lines or 25 KB" of its memory index.

So I taught my notes to dream, one context at a time. A model reads the day's transcripts and the notes, tests the notes against what actually happened, corrects, merges and prunes, and raises conflicts it finds as open questions. Nobody reviews the result, so the gates are mechanical: the transcripts are never edited, a few paths can never be touched, a linter and a commit hook check every run, and each night is one commit that can be reverted. The first run, started by hand while the nightly schedule waits for its first night, took about three minutes, corrected a stale note I had written by hand, and raised an open question about two positions of mine that pull against each other, which I would never have written down myself.

What I take from both is that a memory nobody checks against what happened does not stay neutral. It drifts, and the agent follows it. Replaying the day is the check.

## References

- Lance Martin, [The components of agent memory](https://www.anthropic.com/research/components-of-agent-memory), Anthropic, 6 November 2026.
- Letta, [Sleep-time Compute](https://www.letta.com/blog/sleep-time-compute), 21 April 2025, where the idea of agents using idle time to reorganise their memory was proposed.
