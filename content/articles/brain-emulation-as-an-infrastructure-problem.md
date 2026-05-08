+++
title = "Brain Emulation, Read as an Infrastructure Problem"
date = 2026-05-08
draft = true
description = "An MIT thesis argues brain emulation has crossed into engineering. Read as infrastructure, the numbers describe a workload your AI cluster was not built for."

[taxonomies]
tags = ["ai-for-ops", "distributed-systems", "platform-automation"]
categories = ["patterns"]

[extra]
author = "Raffael"
image = "brain-emulation-as-an-infrastructure-problem.avif"
og_image = "brain-emulation-as-an-infrastructure-problem.png"
related = [
    "what-comes-after-the-last-programming-language",
    "the-economics-of-inference",
    "how-ai-makes-bare-metal-viable-again",
]
+++

Someone sent me an MIT thesis this week. [*From Worm to Human: Scaling Brain Emulation*](https://pdf.isaak.net/scaling-emulations), by Isaak Freeman, submitted March 2026 in the Boyden Lab. I do not normally read neuroscience theses. I made an exception because the abstract was doing something I have spent the last few months on this blog trying to do for software systems, just for a much more demanding workload.

It was treating brain emulation as an engineering problem with identifiable bottlenecks, not a speculative aspiration defined by what we do not know.

I find that kind of reframing useful. It is what makes the difference between a research field and an engineering field. The same move that made virtual memory possible, that made hardware virtualization possible, that is currently happening to LLM serving on GPUs, was happening in this thesis to whole-brain simulation. The question stops being "is this even feasible" and starts being "what specifically is binding today, and which of those constraints sits on a known curve."

Once you stand somewhere with that frame, the numbers do most of the work.

## The shape of the claim

Freeman argues that three previously separate fronts have advanced enough that emulation of small organisms is tractable now and emulation of larger ones is on a trajectory that can be read.

The first is connectomics. For decades only the C. elegans connectome was complete, with 302 neurons. In October 2024, a team of over 200 scientists published the complete wiring diagram of an adult fruit fly brain: 139,255 neurons, 54.5 million synapses. The cost per reconstructed neuron has fallen from roughly $16,500 to about $100 for zebrafish larvae. That is not a graceful curve, that is a step change.

The second is functional imaging. The number of neurons recorded simultaneously has doubled roughly every 7.4 years. The recent ZAPBench dataset captures more than 70,000 neurons across nearly an entire larval zebrafish brain at approximately 1 Hz. Voltage imaging has reached roughly one-third of larval-zebrafish neurons.

The third is simulation. Detailed neuron and synapse models exist along a quality spectrum, from simple proxies to biologically accurate. The Allen Institute simulated nearly 10 million mouse neurons on the Fugaku supercomputer, which is the closest existing approximation to a whole-brain mammalian simulation. A Chinese team in December 2024 ran an 86-billion-neuron simulation on 14,012 GPUs, although Freeman is careful to note that it was too crude and oversimplified to deserve the term "emulation."

Each of these would be a story on its own. Together they cross a threshold. Mapping, recording, and simulating are no longer in the same era they were in five years ago.

## The compute math, which is what got my attention

This is where the thesis stops feeling like neuroscience and starts feeling like a substrate question.

Under what Freeman calls pessimistic assumptions, real-time human brain emulation requires roughly 6e20 FLOP per second, 700 GB of memory per GPU, and 24 GB per second of interconnect bandwidth. Mid-2020s AI clusters reach roughly 4e20 FLOP per second, 180 GB of memory per GPU, and 1.8 TB per second of interconnect, with larger clusters under construction.

The interesting thing in those numbers is not that the gap closes. It is the shape of the gap.

Modern AI clusters are over-provisioned on interconnect bandwidth by a factor of roughly seventy-five for this workload. They are under-provisioned on per-GPU memory by a factor of nearly four. They are slightly under-provisioned on aggregate compute. The conclusion is unavoidable: the substrate built for LLM inference does not fit brain emulation cleanly. It overshoots on one axis, undershoots on another, and lands roughly correct on a third.

This is the same observation I have been making about the gap between LLM inference and the operating systems that schedule it. The previous time was [coconutOS](/articles/what-comes-after-the-last-programming-language/), where the argument was that an inference workload running on Linux is using an OS designed for human-authored sequential CPU programs. The argument generalizes. Whenever a new workload becomes economically important, the existing substrate ends up looking like an awkward fit. The fit is good enough to ship the first generation. It is not good enough to be optimal.

Brain emulation is the next test of the same principle, on a different axis. LLM inference exposed that we are running on the wrong scheduler. Brain emulation will expose that we are running on the wrong memory shape.

## What "the wrong memory shape" means

It is worth being concrete about why per-GPU memory is the binding constraint and interconnect is not.

A real biophysical neuron model, running with synaptic detail, needs to keep state for every synapse it touches. The fruit fly brain has 54.5 million synapses across about 140,000 neurons, which is already roughly 400 synapses per neuron on average. A human cerebral cortex has on the order of 1e14 to 1e15 synapses across roughly 1e10 neurons. If you partition a human-scale simulation across GPUs, each GPU is responsible for some neurons and the local fraction of their synapses, plus the buffers required to integrate their activity at the simulation timestep.

Why so little interconnect, then, for so much compute? Brains are local. Most of a neuron's synaptic targets are physically close in tissue, and the rate of cross-partition communication that has to leave a GPU and reach another GPU is bounded by the rate of neural firing across the cut. That bound is small. Spikes are sparse, the events are small, and you do not need terabit links between partitions.

You do, however, need every synapse to live somewhere fast enough to be integrated at simulation time. The simulation timestep is on the order of milliseconds. The working set has to be resident. You do not get to swap synapse state to disk the way you can swap an LLM weight tile.

So the workload looks like: many GPUs, modest per-GPU compute, very large per-GPU memory, very modest interconnect. The current AI cluster looks like: many GPUs, very high per-GPU compute, modest per-GPU memory, very high interconnect. The shape difference is real.

This is the kind of mismatch that drives architectural transitions. It is also the kind of mismatch that takes years to resolve cleanly because the existing substrate is good enough for the first wave of the new workload.

## What I think this means for builders

The most interesting paragraph in Freeman's preface is this one.

> The goal throughout has been to make brain emulation legible as an engineering problem with identifiable bottlenecks, rather than a speculative aspiration defined mainly by what we do not know.

That move is what the second post of my recent trilogy, on inference-native operating systems, was trying to do. The same move sits underneath my writing on edge systems and proxy infrastructure. It is, I think, the most important shift a technical field can go through, because it changes who works in it, what their day looks like, and what the next ten years of progress look like.

If you are building infrastructure, this thesis is one more data point that the workloads coming over the horizon are not going to look like what your current scheduler, memory hierarchy, and interconnect were designed for. The gap between "the AI cluster I rent today" and "the substrate the next generation of workloads actually wants" is going to widen, not narrow. Brain emulation is the most extreme version of that argument I have seen so far. It is also the same argument.

A few things I would carry forward concretely.

- Per-GPU memory will keep being the binding constraint for an expanding class of workloads. Bandwidth is the easy axis. Density is the hard one.
- Workloads with strong locality and large per-node state will keep showing up. They look weird on current clusters because clusters are built for the opposite shape.
- The substrate question is durable. Every time we think the substrate is done, a workload arrives that asks a question we did not design for.

## A note on the alternative-path-to-AI framing

Freeman's thesis is also making a different argument I want to acknowledge but not centre. He places brain emulation alongside the LLM track as an alternative path to advanced AI: detailed neuronal maps of an actual human brain, replayed in simulation, as a more biologically faithful path to general intelligence than scaling transformers.

I have less to say about that framing because it pulls toward AGI-trajectory questions I have stayed off this blog. I will note only that the workload-shape argument I made above is independent of whether emulation produces something we would call intelligent. The infrastructure mismatch is real even if the simulations are only ever used for neuroscience.

That said, anyone reading the thesis should know the framing is in there. Freeman does not hide it. It is part of why the thesis is worth reading, even if you arrive for the engineering numbers.

## A note on doing this as field notes

The other version of this post I considered was a "field notes" piece. Personal hook, two or three pulls from the thesis, post the same day. I decided against it for the same reason the thesis itself rejects shorter framings. Once you start treating the numbers seriously, the substrate question is the right place to land, and that does not fit in a few hundred words.

I will probably come back to the thesis when the simulation and benchmarking sections give me sharper numbers than what I have used here. The State of Brain Emulation Report 2025, which Freeman cites as a multi-author companion document (arXiv:2510.15745), is also on my list. It lives at [brainemulation.mxschons.com](https://brainemulation.mxschons.com) for anyone who wants the broader synthesis before I get to it.

## Closing

I have spent the last few months arguing that the substrate is the next thing to bend, in proxy infrastructure, in operating systems for inference, and in the artifact engineers actually author. Brain emulation is the most demanding version of the same argument I have come across.

The AI cluster you are renting today is roughly a generation away from being able to run a thing nobody designed it to run. The cluster after the next one will probably be able to. The only question is what we want the substrate to actually look like by the time it gets there.

Freeman's thesis is the best piece of work I have read on framing that question concretely. Worth reading, even if neuroscience is not your beat.
