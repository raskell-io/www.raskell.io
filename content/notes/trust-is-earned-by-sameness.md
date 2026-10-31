+++
title = "Trust is earned by sameness"
date = 2026-11-12
draft = true
description = "Banks, procedures and compilers are trusted for sameness: consistency over time, integrity throughout. When machines write the procedures, it has to be shown."

[taxonomies]
tags = ["trust", "determinism", "provenance", "formal-methods", "finance"]
+++

Niklas Luhmann separated personal trust, in someone you know, from system trust, in institutions you rely on without knowing anyone inside them. Nobody trusts their bank because they trust the clerk; they trust it because it behaves the same way regardless of the clerk. System trust is earned by sameness, and the things we trust most in computing earn it the same way: a compiler that turns the same source into the same binary, a lockfile that resolves to the same dependencies, a workflow that replays to the same result.

Sameness is a plain word for two older ones. **Consistency** is sameness over time: the same input gives the same outcome today, next year and for the next customer. **Integrity** is sameness all the way through: the thing is whole and is what it claims to be, the word going back to the Latin *integer*, untouched, whole. We use it for people in exactly that sense, someone who acts the same whether or not anyone is watching, and computing uses it in the same sense, where an integrity check is a hash that proves the bytes are the ones that were published. Banks, procedures and compilers earn trust by having both: they behave consistently, and they are, inside, what they present outside.

What changes when agents write the code and the procedures is that sameness can no longer be assumed from who made the thing. It has to be shown: a type checker that accepts the program, a replay that matches past cases, a record of what was checked and by whom, provenance that travels with the artefact. That is the common thread under several things I am building, [Arcanist](https://arcanist.sh/) and its compiler on one side, scored and sourced context in [IT Intelligence](/articles/it-intelligence/) on another, and the bet I described in [The Proof You Only Have to Write Once](/articles/the-proof-you-only-have-to-write-once/). The more of our systems machines write, the more of our trust will depend on checks that anyone can rerun.
