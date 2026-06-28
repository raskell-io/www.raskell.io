+++
title = "Brain Emulation, Read as an Infrastructure Problem"
date = 2026-06-28
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

Someone sent me an MIT thesis this week. [*From Worm to Human: Scaling Brain Emulation*](https://pdf.isaak.net/scaling-emulations), by Isaak Freeman, submitted March 2026 in the Boyden Lab.

I read things like this fairly often. Brain emulation is nowhere near my field, but I keep more intellectual pet topics than I have time for, most of them with no obvious connection to the platform and infrastructure work that is supposedly my lane. I follow them because they are interesting, not because I can see the use up front. In my experience the payoff is almost always there. It just shows up late, and from a direction I did not predict. Connectomics has been one of them for years, a slow background read I never expected to need. Most of the time that kind of reading stays in its own compartment, a detour I do not ask to earn its keep. Every so often a detour walks straight into the problem I am actually paid to think about, and I find I have been circling the same question from two directions without noticing. This thesis was one of those times.

What pulled me in was not the biology. The abstract was doing something I have spent the last few months on this blog trying to do for software systems, just for a far more demanding workload. It was treating brain emulation as an engineering problem with identifiable bottlenecks, not a speculative aspiration defined by what we do not know.

I find that kind of reframing useful. It is what makes the difference between a research field and an engineering field. The same move that made virtual memory possible, that made hardware virtualization possible, that is currently happening to LLM serving on GPUs, was happening in this thesis to whole-brain simulation. The question stops being "is this even feasible" and starts being "what specifically is binding today, and which of those constraints sits on a known curve."

Once you stand somewhere with that frame, the numbers do most of the work.

## The shape of the claim

Freeman argues that three previously separate fronts have advanced enough that emulation of small organisms is tractable now and emulation of larger ones is on a trajectory that can be read.

The first is connectomics. For decades only the <i class="binomial">C. elegans</i> connectome was complete, with 302 neurons. In October 2024, a team of over 200 scientists published the [complete wiring diagram of an adult fruit fly brain](https://www.nature.com/articles/s41586-024-07558-y): 139,255 neurons, 54.5 million synapses. The cost per reconstructed neuron has fallen from roughly $16,500 to about $100 for zebrafish larvae. That is not a graceful curve, that is a step change.

The second is functional imaging. The number of neurons recorded simultaneously has doubled roughly every 7.4 years. The recent [ZAPBench dataset](https://arxiv.org/abs/2503.02618) captures more than 70,000 neurons across nearly an entire larval zebrafish brain at approximately 1 Hz. Voltage imaging has reached roughly one-third of larval-zebrafish neurons.

The third is simulation. Detailed neuron and synapse models exist along a quality spectrum, from simple proxies to biologically accurate. The Allen Institute [simulated nearly 10 million mouse neurons on the Fugaku supercomputer](https://alleninstitute.org/news/one-of-worlds-most-detailed-virtual-brain-simulations-is-changing-how-we-study-the-brain), which is the closest existing approximation to a whole-brain mammalian simulation. A Chinese team [ran an 86-billion-neuron simulation on 14,012 GPUs](https://www.nature.com/articles/s43588-024-00731-3), although Freeman is careful to note that it was too crude and oversimplified to deserve the term "emulation."

Each of these would be a story on its own. Together they cross a threshold. Mapping, recording, and simulating are no longer in the same era they were in five years ago.

## The compute math, which is what got my attention

This is the section where my idle reading turned into note-taking. The thesis stops feeling like neuroscience here and starts feeling like a substrate question.

Under what Freeman calls pessimistic assumptions, real-time human brain emulation requires roughly 6 × 10<sup>20</sup> FLOP per second, 700 GB of memory per GPU, and 24 GB per second of interconnect bandwidth. Mid-2020s AI clusters reach roughly 4 × 10<sup>20</sup> FLOP per second, 180 GB of memory per GPU, and 1.8 TB per second of interconnect, with larger clusters under construction.

The interesting thing in those numbers is not that the gap closes. It is the shape of the gap.

Modern AI clusters are over-provisioned on interconnect bandwidth by a factor of roughly seventy-five for this workload. They are under-provisioned on per-GPU memory by a factor of nearly four. They are slightly under-provisioned on aggregate compute. The conclusion is unavoidable: the substrate built for LLM inference does not fit brain emulation cleanly. It overshoots on one axis, undershoots on another, and lands roughly correct on a third.

This is the same observation I have been making about the gap between LLM inference and the operating systems that schedule it. The previous time was [coconutOS](/articles/what-comes-after-the-last-programming-language/), where the argument was that an inference workload running on Linux is using an OS designed for human-authored sequential CPU programs. The argument generalizes. Whenever a new workload becomes economically important, the existing substrate ends up looking like an awkward fit. The fit is good enough to ship the first generation. It is not good enough to be optimal.

Brain emulation is the next test of the same principle, on a different axis. LLM inference exposed that we are running on the wrong scheduler. Brain emulation will expose that we are running on the wrong memory shape.

## What "the wrong memory shape" means

It is worth being concrete about why per-GPU memory is the binding constraint and interconnect is not.

A real biophysical neuron model, running with synaptic detail, needs to keep state for every synapse it touches. The fruit fly brain has 54.5 million synapses across about 140,000 neurons, which is already roughly 400 synapses per neuron on average. A human cerebral cortex has on the order of 10<sup>14</sup> to 10<sup>15</sup> synapses across roughly 10<sup>10</sup> neurons. If you partition a human-scale simulation across GPUs, each GPU is responsible for some neurons and the local fraction of their synapses, plus the buffers required to integrate their activity at the simulation timestep.

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

The framing does sharpen one thing worth stating plainly. If emulation is a serious second path to advanced AI, then the substrate question stops being one-dimensional. Transformer scaling and brain emulation do not pull on the same hardware. Scaling transformers rewards dense compute and high interconnect bandwidth, which is precisely the cluster the industry is already building. Emulation rewards memory density and locality, which is the cluster nobody is building. Two candidate paths to a similar destination, asking for two different machines. Anyone committing capital to a single substrate roadmap today is making an implicit bet that the other path stays marginal. That bet is rarely stated out loud, and the history of computing is unkind to people who assumed the dominant workload would stay dominant.

That said, anyone reading the thesis should know the framing is in there. Freeman does not hide it. It is part of why the thesis is worth reading, even if you arrive for the engineering numbers.

## A note on doing this as field notes

The other version of this post I considered was a "field notes" piece. Personal hook, two or three pulls from the thesis, post the same day. I decided against it for the same reason the thesis itself rejects shorter framings. Once you start treating the numbers seriously, the substrate question is the right place to land, and that does not fit in a few hundred words.

The deeper reason is that the argument lives in a shape, not a number. A field note can carry a single striking figure, the cost per neuron falling two orders of magnitude, the 86-billion-neuron run. It cannot carry a mismatch, because a mismatch only becomes visible once you set three axes next to each other and see that the cluster overshoots on one, undershoots on another, and lands close on the third. A single number is a headline. Three numbers in the wrong proportion are an argument. The shorter form keeps the headline and loses the argument, and the argument was the only part worth the reader's time.

I will probably come back to the thesis when the simulation and benchmarking sections give me sharper numbers than what I have used here. The State of Brain Emulation Report 2025, which Freeman cites as a multi-author companion document ([arXiv:2510.15745](https://arxiv.org/abs/2510.15745)), is also on my list. It lives at [brainemulation.mxschons.com](https://brainemulation.mxschons.com) for anyone who wants the broader synthesis before I get to it.

## Closing

I have spent the last few months arguing that the substrate is the next thing to bend, in proxy infrastructure, in operating systems for inference, and in the artifact engineers actually author. Brain emulation is the most demanding version of the same argument I have come across.

The AI cluster you are renting today is roughly a generation away from being able to run a thing nobody designed it to run. The cluster after the next one will probably be able to. The only question is what we want the substrate to actually look like by the time it gets there.

This is what I keep reading outside my field for. You go in for the curiosity, expecting nothing practical, and once in a while you walk out holding a sharper version of a question you already had. The brain does not care how anyone provisions a GPU. But an honest accounting of what it would take to simulate one says something true about the machines we are building for everything else, and I would not have gone looking for it on purpose.

Freeman's thesis is the best piece of work I have read on framing that question concretely. Worth reading, even if neuroscience is not your beat.

## References

- Isaak Freeman, [*From Worm to Human: Scaling Brain Emulation*](https://pdf.isaak.net/scaling-emulations), MIT, Boyden Lab, March 2026. The thesis this post responds to.
- Zanichelli, Schons, Freeman, Shiu, and Arkhipov, [*State of Brain Emulation Report 2025*](https://arxiv.org/abs/2510.15745) (arXiv:2510.15745). The multi-author companion synthesis, mirrored at [brainemulation.mxschons.com](https://brainemulation.mxschons.com).
- Dorkenwald et al., [*Neuronal wiring diagram of an adult brain*](https://www.nature.com/articles/s41586-024-07558-y), Nature 634, 124-138 (2024). The FlyWire adult <i class="binomial">Drosophila</i> connectome: 139,255 neurons, ~5 × 10<sup>7</sup> synapses.
- Immer et al., [*ZAPBench: A Benchmark for Whole-Brain Activity Prediction in Zebrafish*](https://arxiv.org/abs/2503.02618), ICLR 2025. Light-sheet recording of more than 70,000 neurons across a larval zebrafish brain.
- Allen Institute, [*One of the world's most detailed virtual brain simulations*](https://alleninstitute.org/news/one-of-worlds-most-detailed-virtual-brain-simulations-is-changing-how-we-study-the-brain) (2025). Roughly 10 million mouse-cortex neurons and 26 billion synapses simulated on Fugaku, presented at SC25.
- Lu et al., [*Simulation and assimilation of the digital human brain*](https://www.nature.com/articles/s43588-024-00731-3), Nature Computational Science (2024). The 86-billion-neuron, 47.8-trillion-synapse spiking simulation on 14,012 GPUs.
