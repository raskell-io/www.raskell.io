+++
title = "Goals in a wide range of environments"
date = 2026-10-26
draft = true
description = "Shane Legg could not build intelligence without measuring it, so he defined it. My agents and my chess engines both sit under the definition."

[taxonomies]
tags = ["intelligence", "agents", "game-ai", "research-labs", "evaluation"]

[extra]
reads = ["the-infinity-machine"]
+++

Before he co-founded DeepMind, Shane Legg decided that the biggest problem in the field was that nobody could measure the thing it was trying to build, and that you cannot build what you cannot measure. His doctorate with Marcus Hutter was the attempt, and the definition they settled on is one sentence: "Intelligence measures an agent's ability to achieve goals in a wide range of environments." Not the ability to pass as human, which Turing's test asks for and which Legg thought an arbitrary benchmark, and not performance at one task, however impressive. Generality is the mark.

I like the definition because it puts two things I work on under one roof. The agent of [the handbook](/articles/what-an-agent-actually-is/), a goal, a model, context, tools and a loop, is a machine for achieving goals, and its generality is exactly what the platform work is about: how many environments, how many kinds of task, before it needs a person. And the chess engine in [Kishi](/articles/learning-to-play/) is the opposite case, superhuman in one environment and helpless one square outside it, which is why the step from chess to shogi to Go is a step along Legg's axis rather than a step up in strength. The same man, incidentally, gave the field the phrase artificial general intelligence, as a politer title for a book of Ben Goertzel's that was going to be called *Real AI*.

## References

- Shane Legg and Marcus Hutter, [Universal Intelligence: A Definition of Machine Intelligence](https://arxiv.org/abs/0712.3329) (2007).
- Sebastian Mallaby, *The Infinity Machine* (Penguin Press, 2026), chapter 4.
