+++
title = "The Field Exists Now"
date = 2026-05-22
draft = false
description = "Alasdair Allan's agentlanguages.dev catalogue turns AI-oriented programming languages from a loose set of experiments into a field with camps, disagreements, and testable claims."

[taxonomies]
tags = ["ai-engineering", "programming-languages", "haskell"]
categories = ["field-notes"]

[extra]
author = "Raffael"
image = "the-field-exists-now.avif"
og_image = "the-field-exists-now.png"
related = [
    "what-programming-languages-become-when-ai-writes-the-code",
    "what-comes-after-the-last-programming-language",
    "semantic-artifacts-and-meaning-engines",
]
+++

Alasdair Allan, the creator of [Vera](https://veralang.dev/), has started a public catalogue at [agentlanguages.dev](https://agentlanguages.dev/): programming languages designed for AI agents to write.

When he mentioned it to me on LinkedIn, the count was twenty-one. When I checked, the site already listed twenty-eight. That pace is the point.

Six months ago, the idea that programming languages would bend around AI authorship still sounded like a late-night compiler conversation. Now there is a catalogue, a taxonomy, and enough independent projects to argue about the shape of the field without pretending the field is hypothetical.

That is a real change.

## The taxonomy is better than my timeline

In [The Last Programming Language Might Not Be for Humans](/articles/what-programming-languages-become-when-ai-writes-the-code/), I described three futures:

- explicit languages stripped of ambiguity
- declarative languages where types act as proof obligations
- no language at all, where the prompt is the specification and the executable is the product

I still think that direction of travel is useful. The long arc points away from source code as the thing humans primarily edit, and toward artifacts that agents generate, compilers check, runtimes execute, and other agents can trust.

But Alasdair's taxonomy is cleaner for describing the field as it exists today.

He splits it into three camps:

- syntactic, where the problem is representational ambiguity
- verification, where the problem is semantic correctness
- orchestration, where the problem is agent coordination

That framing is less linear and more honest. Vera and my Haskell work are not step one and step two. They are two near-term answers to the same pressure.

That correction matters because it changes what we should measure.

If the field is a timeline, the question is which phase arrives next. If the field is a set of camps, the question is which diagnosis is right for which workload.

That is a much better question.

## Vera and BHC are adjacent, not sequential

One useful correction: Raskell is not the project. Raskell is this blog.

The relevant projects are [hx](https://arcanist.sh/hx/) and BHC, the Basel Haskell Compiler, both under [arcanist.sh](https://arcanist.sh/). hx is the tooling layer. BHC is the compiler layer.

That distinction matters because the bet is not "invent Raskell as a new AI language." The bet is that Haskell already has much of the semantic shape we need, and that the missing layer is tooling, runtime control, diagnostics, and compilation strategy.

Vera takes a more bespoke path. It asks what a language should look like if it is designed for models from first principles. That leads to mandatory contracts, typed effects, solver-backed verification, and De Bruijn-style slot references instead of variable names.

That is a serious design. I like it because it does not just say "AI will write code" and stop there. It changes the language around that claim.

BHC starts from the other side.

It assumes Haskell's purity, type system, and compositional style are already close to the right substrate for AI-written software. The weak points are around the compiler and the experience around it: how fast the loop is, how clear the errors are, how reproducible the build is, how explicit the runtime profile is, and eventually how much semantic information survives into numeric and GPU-oriented lowering.

So I do not think Vera and BHC compete for the same idea. They may compete for attention, mindshare, or some future market. But intellectually they are adjacent.

Vera says: design the language around the agent.

BHC says: make the semantically rich language operationally good enough for the agent era.

Both are verification-camp bets.

## Why the verification camp is crowded

The most interesting thing in the catalogue is how crowded the verification camp is.

That should not surprise us, but it still does.

Once you work with coding agents every day, the failure mode becomes obvious. The problem is not that the model cannot type syntax. It can type syntax just fine. The problem is that plausible code is cheap, and plausible code is often wrong.

That changes the job of the language.

A language for AI-authored code does not need to make the model feel clever. It needs to make wrongness cheap to detect. Ideally before runtime. Ideally before deployment. Ideally in a form the model can consume and repair.

That is why contracts, effects, refinement types, strong type systems, proof export, SMT solvers, and structured compiler diagnostics keep showing up. These are not aesthetic choices. They are different ways of building a feedback loop around a generator that will always be probabilistic.

The generator does not need to be trusted. The artifact needs to be checkable.

That sentence is probably the center of the whole field.

## The market is less interesting than the artifact

There will be a temptation to turn this into a market map too early.

Which language wins? Which toolchain gets adopted? Which one has the most stars? Which one gets bundled into an IDE or agent framework first?

Those questions matter eventually. They do not matter most right now.

The important question is what the unit of software becomes when the author is no longer primarily human. My answer, in [Source Code Is the New Assembly](/articles/semantic-artifacts-and-meaning-engines/), was that source code becomes one rendering of a richer semantic artifact.

The agentlanguages.dev catalogue strengthens that view.

The syntactic camp is trying to make the text representation easier for models to manipulate. The verification camp is trying to make the artifact easier to prove correct. The orchestration camp is trying to make agent work easier to sequence, constrain, and audit.

Those are not disconnected concerns. They are different surfaces of the same object.

If agents are going to generate software that matters, the artifact has to carry more than instructions. It has to carry constraints, effects, provenance, trust boundaries, and execution intent. Source code can be part of that. It cannot remain the whole thing.

## Where BHC fits

BHC's long-term target is not just "AI writes Haskell."

That is too small.

The more interesting target is verifiable compute expressed through a functional, semantically dense language and lowered into the right execution profile. Sometimes that means ordinary native code. Sometimes WebAssembly. Eventually, for the numeric profile, it should mean GPU-oriented compute where the compiler can preserve enough structure to reason about what is being executed.

This is the part that keeps pulling me back to Haskell.

Functional purity is not just beautiful. It is useful. It makes dependencies visible. It makes transformations local. It reduces the hidden state an agent has to simulate. It gives the compiler more leverage. It gives verification machinery more structure.

And Haskell is verbose in exactly the right places. Not verbose like boilerplate. Verbose like meaning. Type signatures, algebraic data types, explicit transformations, pure functions. These are things an agent can generate, a compiler can check, and a human can audit later when something matters enough to read.

That is the bet behind BHC and hx.

Not a new language for its own sake. Not Haskell nostalgia. A belief that semantic density becomes more valuable when generation gets cheap.

## What the catalogue proves

The catalogue does not prove which camp is right.

It proves the pressure is real.

Independent people arrived in the same neighborhood at roughly the same time, using different words and different tools. That usually means the underlying constraint changed. In this case, the constraint is authorship.

The old language design question was: what can humans write, read, and maintain?

The new question is: what can agents generate, compilers verify, runtimes constrain, and humans audit when needed?

That does not make human readability irrelevant. It changes its position. Human readability becomes part of auditability, not necessarily the primary authoring constraint.

That is the shift agentlanguages.dev makes visible.

The field exists now. It has camps. It has disagreements. It has projects with code, projects with papers, projects with benchmarks, and projects that are still mostly intent. That is fine. Early fields are messy.

The useful thing is that we can stop arguing about whether the category is real and start arguing about which claims survive measurement.

That is where the work gets interesting.
