---
title: "Who contributed to AI"
url: https://raskell.io/notes/who-contributed-to-ai/
author: Raffael Schneider
date: 2026-11-01
description: "A companion piece to Karen Hao's Empire of AI and Sebastian Mallaby's The Infinity Machine: who built AI, where, and which idea led to which product."
tags: [research-labs, technology-races, history-of-technology, machine-learning]
---

# Who contributed to AI

This is a companion piece to two books I read back to back: Karen Hao's [*Empire of AI*](https://raskell.io/reading/), which follows OpenAI, and Sebastian Mallaby's *The Infinity Machine*, which follows Demis Hassabis and DeepMind through the same years. The same twenty or thirty names run through both. Each of them carried part of an old idea, that a machine could learn to think, from a lab in Toronto or a games studio in London to the systems we use today, and many carried it through several organisations before it worked. I kept losing track of who was where in which year, so I drew it.

Each lane is a person, each bar a place they worked. A ring marks where someone moved on, and hovering it says why. Choose a person to draw their ties to the others at the moment they happened, with a dashed line where the tie ended in conflict; choose an organisation or a place to see everyone who passed through it. The band on top holds the ideas, the products, and the turns that moved the story. It starts in 1955, with McCarthy's proposal that gave the field its name, and squeezes the next fifty years so that the part both books are about has room.

*[An interactive figure (people timeline) is drawn here on the HTML page; its data: https://raskell.io/data/ai-people.json.]*

## From idea to product

The people are only half of it. The other half is how one idea made the next one possible, and how long the road from a paper to a product turned out to be. Backpropagation was published in 1986 and waited twenty-six years for the graphics chips that made AlexNet work. The Transformer came out of Google in 2017 and reached most people five years later as ChatGPT, after passing through GPT-1, GPT-2, GPT-3, a code model, and a round of training on human preferences. The same thread runs the other way too: AlphaZero, built to play board games, gave its name and its method to DeepSeek's R1-Zero, one of the reasoning models of 2025.

The second figure sorts the ideas and products into fields, with the paradigms of each period on top. They overlap, because a new way of working never ends the old one at once: AlphaGo in 2016 still searched through moves the way chess programs had since the 1950s, only guided by networks that had learned what a good position looks like. Each arrow says that one thing built on another, and every arrow has a source, most of them a chapter in one of the two books. Choose an idea or a product to trace everything it rests on and everything that came out of it; choose a paradigm to see its years.

*[An interactive figure (idea lineage) is drawn here on the HTML page; its data: https://raskell.io/data/ai-people.json.]*

What the figure shows, more than any single arrow, is how few of today's products started out aimed at one. The lines that end in an assistant begin in image recognition, in board games, in machine translation. They converge on language only around 2018, and on the assistant only in 2022.

The data behind both figures is a dataset of its own, with a page on what each record holds, where every fact comes from, and how I compiled it: [People of the AI labs, 1955 to 2026](https://raskell.io/data/ai-people/).

## References

- Karen Hao, *Empire of AI: Dreams and Nightmares in Sam Altman's OpenAI* (Penguin Press, 2025).
- Sebastian Mallaby, *The Infinity Machine: Demis Hassabis, DeepMind, and the Quest for Superintelligence* (Penguin Press, 2026).
