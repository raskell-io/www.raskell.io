---
title: "Harness types in the compiler"
url: https://raskell.io/notes/harness-types-in-the-compiler/
author: Raffael Schneider
date: 2026-11-20
description: "NVIDIA's NOOA makes an agent a Python object with typed contracts. A language that enforces types could make the harness a compiler primitive. An open question."
tags: [agent-harness, type-systems, haskell, compilers, arcanist, bhc]
---

# Harness types in the compiler

[NOOA](https://github.com/NVIDIA-NeMo/labs-OO-Agents), NVIDIA's object-oriented agent harness, models an agent as a Python class: methods are capabilities, fields are state, the docstring is the prompt and the signature is the contract. A method whose body is `...` is completed at runtime by the model, which acts by writing Python that calls typed services. Matt Staats walked through it at [Agentic Engineering Days Zurich](https://raskell.io/articles/agentic-engineering-days-zurich-2026/). His background is test oracles, the question of how you know a program's output is right, and his abstract opens with "An agent is only as good as the harness around the model."

The results he showed were about memory, and they are the strongest argument for treating the harness as software. On ARC-AGI-3 games with the same model, an agent keeping its own notes in Markdown reached 38.4%; NOOA's memory API reached 50.2%, and matched the Markdown score for about $290 in estimated API cost against about $1,040. The slide was titled "Software is cheaper than thinking." Structure the harness manages beats structure the model has to reread.

It is the right direction, and Python is the weak point of it. A signature in Python is checked when the call happens, and NOOA retries until the output fits. In a language whose compiler enforces the contract, the program would not build until the application and the agent agree on types, and the line in [Determinism is what intelligence leaves behind](https://raskell.io/notes/determinism-is-what-intelligence-leaves-behind/) between what is decided and what is delegated would be part of the program's type, not a convention.

So the thought I left with: could [bhc](https://arcanist.sh/bhc/) carry inference and harness bindings as a native primitive, with an agent call typed like any other effect, and its retries, budget and memory visible in the type? I do not know yet whether that is a library, a language feature or a bad idea. [Almost Irrelevant](https://raskell.io/articles/almost-irrelevant/) argued that what a compiler checks is what stays valuable when agents write the code; this would be the same argument applied to the agent itself.
