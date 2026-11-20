---
title: "Harness types in the compiler"
url: https://raskell.io/notes/harness-types-in-the-compiler/
author: Raffael Schneider
date: 2026-11-20
description: "NVIDIA's NOOA makes an agent a Python object with typed contracts. A language that enforces types could make the harness a compiler primitive. An open question."
tags: [agent-harness, type-systems, haskell, compilers]
---

# Harness types in the compiler

[NOOA](https://github.com/NVIDIA-NeMo/labs-OO-Agents), NVIDIA's object-oriented agent harness, models an agent as a Python class: methods are capabilities, fields are state, docstrings are prompts and type annotations are contracts. Matt Staats walked through it at [Agentic Engineering Days Zurich](https://raskell.io/articles/agentic-engineering-days-zurich-2026/), ending on a slide that said "Zoom out: now everything is software", the agent loop as an object with internal state, called from a deterministic application with typed tasks and typed values going in and out.

It is the right direction, and Python is the weak point of it. A type annotation in Python is a promise the runtime checks when the call happens, if anyone checks it at all. In a language where the compiler enforces types, the contract between the application and the agent would be checked before anything runs, and the boundary in [Determinism is what intelligence leaves behind](https://raskell.io/notes/determinism-is-what-intelligence-leaves-behind/) would be part of the program's type, not a convention.

So the thought I left with: could [bhc](https://arcanist.sh/bhc/) carry inference and harness bindings as a native primitive, with an agent call typed like any other effect? I do not know yet whether that is a library, a language feature or a bad idea. [Almost Irrelevant](https://raskell.io/articles/almost-irrelevant/) argued that what a compiler checks is what stays valuable when agents write the code; this would be the same argument applied to the agent itself.
