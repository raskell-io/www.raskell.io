---
title: "Intelligence is compression"
url: https://raskell.io/notes/intelligence-is-compression/
author: Raffael Schneider
date: 2026-11-14
description: "Ilya Sutskever's internal slogan at OpenAI: a model that must predict the world has to compress it. I think it is the most useful definition we have."
tags: [intelligence, language, neural-networks, mathematics]
---

# Intelligence is compression

Karen Hao reports in *Empire of AI* (chapter 5) that while Alec Radford was teaching a transformer to predict the next word, the work that became GPT, Ilya Sutskever had a short way of explaining why it mattered: "Intelligence is compression." A model trained to generate convincing text is forced to squeeze what it sees about the world into its essence. In a 2016 memo, Hao writes, Sutskever went further and argued that compression was the only thing needed for general intelligence. OpenAI's public version borrowed Richard Feynman's line, "What I cannot create, I do not understand", which Hao calls "heavily anthropomorphized".

I think the slogan is right, and older than OpenAI. The argument goes like this:

- To compress data well, you have to predict it. A compressor that knows what comes next only has to store the surprises.
- To predict text well, you have to model whatever produced the text: grammar first, then facts, then the reasoning and intentions of the people who wrote it.
- So the better the compression, the more of the world the model has had to capture. A model that compresses everything people have written down cannot help learning a great deal about people.

This is not a metaphor. Prediction and compression are the same problem in information theory, which is why Marcus Hutter has offered a prize since 2006 for compressing a fixed slice of Wikipedia, as a benchmark for intelligence. Next-word prediction is exactly that contest, run at the scale of the internet.

It is also half of a wager. The other half, in the same chapter, is Dario Amodei's bet on the "pure language" hypothesis: that text alone is enough to learn from. Put together, they say that compressing everything humans have written is a path to general intelligence. That is my reading, not Hao's, and it is the bet the rest of the book is about. Whether it is enough is still open; I lean towards thinking a model also has to act, as I argued in [in vivo, not in vitro](https://raskell.io/notes/in-vivo-not-in-vitro/). But compression explains why the bet got as far as it did, and it fits the larger conviction I share with Altman, that intelligence is [an emergent property of matter](https://raskell.io/notes/an-emergent-property-of-matter/) arranged to predict.

More on the book in my review, [An Empire of People](https://raskell.io/articles/review-empire-of-ai/).

## References

- Karen Hao, *Empire of AI* (2025), chapter 5, "Scale of Ambition".
- The Hutter Prize for lossless compression of human knowledge, [prize.hutter1.net](http://prize.hutter1.net/).
