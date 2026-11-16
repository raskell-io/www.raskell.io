+++
title = ""
date = 2026-11-16
draft = true
description = ""

[taxonomies]
tags = ["intelligence", "neuroscience", "reinforcement-learning", "neural-networks", "olfaction", "evolution"]
categories = ["reviews"]

[extra]
author = "Raffael"
review = "a-brief-history-of-intelligence"
+++

<!-- A review of A Brief History of Intelligence by Max Bennett (book). Questions worth answering, in any order and not as headings:
  - Why did I pick it up, and what question was I bringing to it?
  - What is its central argument? A fair, short account the author would recognise.
  - Which ideas, experiments, episodes, or passages deserve attention? Be specific: chapter or page.
  - Where was I persuaded, unconvinced, or surprised? What changed in my understanding, or did not, and why?
  - Who should read it, with what expectations: prerequisites, depth, limits?
  Keep apart what the author argues, what evidence the work offers, and what I infer beyond it.
  When this goes out, set the work's status in data/reading.toml to "read" with a finished date. -->

<!-- Draft notes while reading. Not yet prose for the review; the structure comes later.

Opening idea: Bennett starts the introduction with The Jetsons (September 1962). The show predicted video calls,
flat screens, cell phones, 3D printing and smartwatches, but not the one thing it took for granted: Rosey, the
robot who keeps the house, helps with homework, and reads the family's moods. As of print, Bennett notes, no robot
can load a dishwasher, and "it isn't fundamentally a mechanical problem; it's an intellectual one". A good frame
for the review and for the hero image (an original retro-futurist housekeeping robot, not Rosey herself).

Hinton: the introduction's epigraph is his ("the only way to get artificial intelligence to work is to do the
computation in a way similar to the human brain"); he returns in chapter 7 (backpropagation) and chapter 11 (the
Helmholtz machine, with Peter Dayan). Link the Empire of AI review, where he is a central figure.
-->

## Smell, the first pattern

Chapter 7, "The Problems of Pattern Recognition", is where the book clicked for me, because Bennett explains neural networks with the nose. A smell is not one molecule but a mixture that lights up a pattern across many kinds of olfactory neurons, and the first vertebrates were the first animals that could read such patterns. From there he walks through the two problems any pattern recogniser has to solve, discrimination and generalisation, shows how the early cortex may solve them with expansion, sparsity, and auto-association, and then shows how an artificial network solves them with backpropagation, the method Geoffrey Hinton, David Rumelhart and Ronald Williams popularised in the 1980s. His running example for the machine is a network that learns to tell egg smells from flower smells.

The chapter then moves on to catastrophic forgetting (a network taught to add twos forgets how to add ones, in McCloskey and Cohen's 1989 experiment) and to the invariance problem in vision, where Hubel and Wiesel's cats lead to Fukushima's convolutional networks. Smell is the quiet hinge here: an egg smells the same from any angle, so smell has no invariance problem, and it is the one sense that bypasses the thalamus.

I wrote more about this, and about why I think smell will be the last sense we learn to read and write with machines, in a note: [Smell is pattern recognition](@/notes/smell-is-pattern-recognition.md).
