+++
title = "In vivo, not in vitro"
date = 2026-11-07
description = "An open question: can intelligence be measured anywhere but in performance? My hunch is that it shows only when an agent acts."

[taxonomies]
tags = ["intelligence", "language", "linguistics", "semiotics", "evaluation", "agents", "legibility"]

[extra]
reads = ["empire-of-ai"]
+++

A question I want to keep open: how do you measure intelligence?

My hunch is that it is best measured in vivo, not in vitro. An intelligent agent shows what it is capable of by performing: acting in an environment, against a goal, with consequences. I do not think you can deduce it from anything that is not a performance, such as the size of a model, the data it was trained on, its architecture, or the answers it gives to a fixed set of questions in a test tube. Those can be evidence of potential. Intelligence itself appears only in the act.

This sits close to the definition Shane Legg and Marcus Hutter settled on, that intelligence is the ability to achieve goals in a wide range of environments, which is already a definition by performance. What I am adding is a doubt about the lab. A benchmark is a performance too, but a staged one: the environment is fixed, the goal is given, and nothing is at stake. That makes it legible and comparable, and it makes it a proxy that can be learned for its own sake. The more an evaluation looks like a real task, with an open environment, a goal the agent has to pursue over time, and results that someone depends on, the more I trust what it says.

Karen Hao's *Empire of AI* gave me a second angle. Early OpenAI argued over the "pure language" hypothesis, that training on text alone could be enough for general intelligence, against the "grounding" hypothesis, that perceiving and acting in the world matters as much. I read that partly as an argument about the same question: whether intelligence can be read off what a system has absorbed, or only off what it does.

Both sides of that argument are older than language models. The pure language bet leans on an idea from linguistics, J. R. Firth's line that "you shall know a word by the company it keeps": meaning lives in how words are distributed among other words, which is exactly what a model trained on next-word prediction learns. The grounding side is a question from semiotics, the relation between a sign and what it stands for. Stevan Harnad called it the symbol grounding problem and compared it to learning Chinese from a Chinese-Chinese dictionary alone: every symbol is explained by other symbols, and nothing touches the world. If he is right, a system that only reads may never mean anything, and the only place to find out is in what it does.

Open threads:

- If intelligence is only visible in performance, what is the smallest performance that still tells you something?
- How do you compare agents whose environments differ, without falling back to a shared test tube?
- Is "potential" a meaningful quantity at all, or only a forecast of future performance?
- Does acting in the world ground symbols, or does a tool call that returns more text just extend the dictionary?

## References

- Shane Legg and Marcus Hutter, [Universal Intelligence: A Definition of Machine Intelligence](https://arxiv.org/abs/0712.3329) (2007).
- J. R. Firth, "A synopsis of linguistic theory, 1930 to 1955", in *Studies in Linguistic Analysis* (Philological Society, Blackwell, 1957), p. 11.
- Stevan Harnad, [The Symbol Grounding Problem](https://arxiv.org/abs/cs/9906002), *Physica D* 42 (1990), 335 to 346.
- Karen Hao, *Empire of AI* (2025), chapter 5.
