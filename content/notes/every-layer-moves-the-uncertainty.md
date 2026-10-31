+++
title = "Every layer moves the uncertainty"
date = 2026-11-11
draft = true
description = "Each new layer in computing makes one thing predictable and pushes the uncertainty somewhere else. The useful question about a new layer is where it went."

[taxonomies]
tags = ["abstraction", "determinism", "platform-automation", "history-of-technology", "forecasting"]
+++

Every layer I have worked with in computing made one thing predictable so that the people above it could stop thinking about it. The function call made control flow predictable, microservices made ownership predictable, Kubernetes made placement predictable, workflow engines made the order and history of a process predictable. None of them removed uncertainty. Each one moved it: into interfaces, into the network, into reconciliation loops, into step bodies that may run twice. The table in [The River and the Canal](/articles/the-river-and-the-canal/) follows the move layer by layer, and [Source Code Is the New Assembly](/articles/semantic-artifacts-and-meaning-engines/) follows it down through programming languages.

So the first question I ask about any new layer is where the uncertainty went. For most layers the answer is somewhere you can see and engineer: a network you can trace, a journal you can replay. For agent runtimes the answer is into the model, which is the one place nobody can inspect. That does not make agents a bad layer. It makes them the first layer where the uncertainty went somewhere invisible, and it is why I want something deterministic and readable on either side of them.
