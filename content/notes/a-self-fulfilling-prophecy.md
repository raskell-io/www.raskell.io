+++
title = "A self-fulfilling prophecy"
date = 2026-11-14
description = "Karen Hao says scaling laws are like Moore's Law: not a law of nature but a self-fulfilling prophecy. She is half right, and the half matters."

[taxonomies]
tags = ["neural-networks", "semiconductors", "forecasting", "history-of-technology", "technology-races"]

[extra]
reads = ["empire-of-ai"]
+++

At the end of chapter 4 of *Empire of AI*, Karen Hao compares OpenAI's scaling laws to Moore's Law. Moore's Law, she writes, was never a principle of physics. It was an observation Gordon Moore made about the pace he could drive his own company to, and a choice to keep that pace, which the rest of the industry then copied because it was the most competitive strategy. OpenAI's internal "law" of compute doubling, and the scaling laws that replaced it, are the same: "It is not a natural phenomenon. It's a self-fulfilling prophecy."

She is right about Moore's Law, and it is worth remembering how much of technological progress works this way. A forecast that everyone believes becomes a schedule. Chip makers planned their factories around it, suppliers planned around the chip makers, and software assumed the chips would arrive. The prediction coordinated an industry, and the coordination made the prediction come true.

The same thing happened with scaling. Once the labs believed that a bigger model trained on more data with more compute would reliably get better, money, chips, power plants, and careers lined up behind that belief, and the belief kept paying out. Hao is right that this was a choice, and that the choice crowded out other paths: better architectures, better data, approaches other than deep learning.

But a prophecy can only fulfil itself where the world allows it. Moore's Law ran for decades because transistors could in fact be made smaller; it slowed when physics said no. Scaling laws are measurements, loss curves that fall along a straight line on a log scale across many orders of magnitude, first published by OpenAI researchers in 2020 and corrected by DeepMind in 2022. Investment decided how far along the line the industry would go. It did not draw the line. Hao's own reporting shows the other side: by late 2024 OpenAI was struggling to make its next model good enough, and scaling alone "no longer seemed to be enough" (chapter 18). A pure prophecy would not have stalled.

So the useful version of her point is narrower and, I think, more interesting. The regularity is real; the decision to follow it at any cost is social. That is how every large bet on technology works, from chips to railways, and it is the subject of [A billion without a plan](@/notes/a-billion-without-a-plan.md).

More on the book in my review, [An Empire of People](@/articles/review-empire-of-ai.md).

## References

- Karen Hao, *Empire of AI* (2025), chapter 4, "Dreams of Modernity", and chapter 18, "A Formula for Empire".
- Gordon E. Moore, "Cramming more components onto integrated circuits", *Electronics* 38(8), 1965.
- Jared Kaplan et al., [Scaling Laws for Neural Language Models](https://arxiv.org/abs/2001.08361), 2020.
- Jordan Hoffmann et al., [Training Compute-Optimal Large Language Models](https://arxiv.org/abs/2203.15556), 2022.
