+++
title = "The job is choosing when to be deterministic"
date = 2026-10-26
draft = true
description = "Prompt engineering, context engineering, harness engineering: three names in three years for one job, moving context assembly from model calls into code."

[taxonomies]
tags = ["context-engineering", "agents", "determinism", "ai-platforms", "ai-engineering"]
+++

Drew Breunig's state-of-the-field talk at AGNTCon, written up on his site, has the cleanest account I have read of why the vocabulary keeps changing while the work does not. In 2023 choosing what the model sees was prompt engineering, done by hand. In 2025 it was context engineering, done by the system, which assembled the context dynamically. In 2026 it is harness engineering, because the fixes have moved out of the context and into code around the model. Three names, one job: moving the assembly of context from probabilistic model calls to deterministic code, one piece at a time, and deciding each time which side of that line a decision belongs on.

His toolbox has not changed either, which I find reassuring. Six moves: augmentation (retrieval, skills), tool loadout (do not expose six hundred skills at startup, which an enterprise team he worked with was doing), quarantine (subagents with a blank history in the same environment), pruning, offloading to files or a database, and summarisation. In a dozen lines of DSPy he shows all of them as plain functions around a while loop. It is the same loop as [What an Agent Actually Is](/articles/what-an-agent-actually-is/), with the context decisions pulled out into code, and it is the division I argued for in [Context Is the Product](/articles/context-is-the-product/) and [Retrieval Is a Tool, Not a Layer](/articles/retrieval-is-a-tool-not-a-layer/).

One commenter on the Hacker News thread put the practical version well: the question in front of any task is whether to ask the model to do it, or to ask the model to build the thing that does it, and the answer turns on how deterministic the task is. Another observation of Breunig's belongs next to that: when a system prompt repeats an instruction seven times in capitals, someone is fighting the weights, working against what the model was trained to do, and the fix is usually in the harness or the model choice, not in a louder prompt.

## References

- Drew Breunig, [The State of Context Engineering](https://www.dbreunig.com/2026/10/24/the-state-of-context-engineering.html) (24 October 2026), the talk and transcript.
- [Hacker News discussion](https://news.ycombinator.com/item?id=50235780) of the talk.
