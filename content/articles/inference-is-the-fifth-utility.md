+++
title = "Inference Is the Fifth Utility"
date = 2026-04-20
draft = true
description = "Inference tokens are not API calls. They are a metered resource that is consumed, generates value, and correlates with power draw. The economics of the post-AI world look less like software and more like water, electricity, and gas."

[taxonomies]
tags = ["ai-for-ops", "platform-automation", "edge-systems"]
categories = ["patterns"]

[extra]
author = "Raffael"
+++

In the [previous article](/articles/what-sixteen-ai-agents-taught-me-about-management/), I described running sixteen AI agents as a virtual company over Christmas 2025. The architecture worked. The coordination model worked. What did not work was the economics. My token budget evaporated in days, not because the agents were unproductive, but because every act of coordination, every status update, every escalation consumed a metered resource that I could not replenish fast enough.

At the time, I framed this as a budget problem. My consumer subscription could not sustain the overhead of agent-to-agent communication. An enterprise with API access and a real budget would not have the same constraint. That framing was correct, but it was also too small.

What I was actually experiencing, at the scale of one person and sixteen terminal panes, was something much larger. I was experiencing inference as a utility. Not as a software feature. Not as an API call. As a consumed physical resource, the same way I consume electricity when I turn on a light and water when I open a tap.

That framing changes everything about how you think about the economics of AI.

## What makes something a utility

Utilities share a set of properties that distinguish them from ordinary goods and services. They are not optional. Modern life depends on them. They are consumed continuously, not purchased once. They require massive physical infrastructure to produce and deliver. They are metered. They are priced per unit of consumption. Their supply chains are subject to geography, geopolitics, and regulation. And their cost structure is dominated by the capital expenditure of building and maintaining the infrastructure, not by the marginal cost of the next unit delivered.

Water. Electricity. Natural gas. Telecommunications. These are the four traditional utilities. Every modern economy is built on top of them. Their availability, reliability, and cost determine what is possible in a given jurisdiction. You do not build a semiconductor fab where the power grid is unreliable. You do not run a data center where the water supply for cooling is uncertain. The utility layer is the foundation, and everything above it is constrained by what the foundation can support.

Inference is acquiring every one of these properties.

It is consumed continuously. Every agent interaction, every model call, every token generated is a unit of consumption. When my sixteen agents were coordinating, they were consuming inference the way a factory floor consumes electricity: steadily, measurably, and in direct proportion to the work being performed.

It requires massive physical infrastructure. The data centers running frontier models are among the most capital-intensive facilities being built anywhere in the world right now. They require advanced silicon, enormous quantities of power, water for cooling, and physical security. They are not software projects. They are industrial projects.

It is metered and priced per unit. Every major inference provider charges per token. Input tokens, output tokens, sometimes with different rates for different capability tiers. The billing model is already a utility billing model. You pay for what you consume.

Its supply chain is subject to geography and geopolitics. This is where it gets interesting.

## Chips, data, talent, energy

At RSAC 2026, I attended a panel with four former NSA directors and US Cyber Command commanders. Paul Nakasone laid out what he considers the four factors that determine a nation state's strategic potentiality in this era. Not GDP. Not military strength. Four things: chips, data, talent, and energy.

I [wrote about this](/articles/notes-from-rsac-2026/) at the time. But I have been thinking about those four factors through a different lens since the shiioo experience. Nakasone was talking about national power. I am talking about the supply chain of a utility.

Every utility has a supply chain that determines who can produce it, at what cost, and with what dependencies. For electricity, the supply chain is fuel (coal, gas, uranium, sunlight, wind), generation infrastructure (power plants, turbines, panels), transmission (the grid), and distribution (the last mile to your outlet). For water, it is source (rivers, aquifers, desalination), treatment, transmission (pipes, pumps), and distribution.

For inference, the supply chain is Nakasone's four factors.

Chips are the generation capacity. Advanced GPUs, specifically the frontier silicon manufactured overwhelmingly by TSMC in Taiwan and designed primarily by NVIDIA in the United States, are the turbines of the inference economy. Without them, you do not generate inference at competitive cost. The global concentration of this manufacturing capacity in a single facility on a geopolitically contested island is the equivalent of the entire world's electricity depending on one power plant. It is a single point of failure that makes infrastructure planners lose sleep.

Energy is the fuel. Frontier inference is measured in gigawatts now, not megawatts. A single large-scale inference cluster draws more power than a small city. The [AI 2027](https://ai-2027.com/) scenario projects global AI datacenter power consumption reaching 38 GW by 2026, and that number is rising on a curve that shows no sign of flattening. You cannot run inference without power, and you cannot build the power infrastructure overnight. The jurisdictions that have cheap, abundant, reliable energy have a structural advantage that no amount of software cleverness can compensate for.

Data is the raw material that the models learned from, the substrate that makes inference meaningful rather than random. Who has it, under what legal constraints it can be used, and how diverse and representative it is all determine the quality and applicability of the inference you can produce.

Talent is the operational workforce. Not just the researchers who design the models, but the engineers who build the infrastructure, the operators who keep it running, and the security professionals who defend it. This is the human capital layer that every utility depends on, and it is concentrated in a handful of geographic clusters for the same reasons that petrochemical engineering talent concentrates near refineries.

When you map it out, inference has the same supply chain structure as any mature utility. And the strategic implications follow directly.

| Supply chain layer | Electricity | Water | Inference |
|--------------------|-------------|-------|-----------|
| **Raw input** | Fuel (gas, uranium, sun) | Source (river, aquifer) | Data (training corpora) |
| **Generation** | Power plants, turbines | Treatment plants | GPUs, data centers |
| **Transmission** | The grid | Pipes, pumps | Networks, API endpoints |
| **Fuel for generation** | Primary energy | Electricity for pumping | Electricity (38+ GW) |
| **Key bottleneck** | Grid capacity, permits | Water rights, drought | Chip fabrication (TSMC) |
| **Geopolitical risk** | Pipeline politics, OPEC | Cross-border rivers | Taiwan, export controls |

The analogy is not a metaphor. It is a structural description.

## What AI 2027 got right about the economics

The [AI 2027](https://ai-2027.com/) scenario, written by Daniel Kokotajlo, Scott Alexander, Thomas Larsen, Eli Lifland, and Romeo Dean, is a speculative timeline. The authors are careful to frame it that way. But the economic projections in it have a quality that I keep returning to: they treat AI compute as an industrial resource, not a software product.

Their scenario tracks global AI datacenter spending reaching the trillion-dollar range. It maps the distribution of frontier compute capacity across nations, with the United States holding roughly 70% through its companies and China at around 12%. It projects power consumption figures that match what utility planners, not software engineers, would recognize as relevant.

What makes this framing useful is not the specific numbers. It is the category. When you project AI spending in trillions and power consumption in tens of gigawatts, you are not describing a software industry. You are describing a utility buildout. The capital expenditure patterns, the infrastructure timelines, the regulatory questions, the geopolitical competition, all of it maps to how nations have historically competed over energy infrastructure, telecommunications infrastructure, and industrial capacity.

The AI 2027 authors project that the feedback loop of AI systems accelerating AI research compresses the timeline for capability growth. Whether their specific dates hold is less important than the structural observation: if capability is growing on a steep curve and that capability requires physical infrastructure that grows on a much slower curve, then the binding constraint on AI is not software. It is infrastructure. It is the utility layer.

This is what I experienced at the personal scale with shiioo. The software worked. The orchestration model worked. What ran out was the physical resource: tokens, which is to say inference, which is to say compute, which is to say silicon and electricity. The bottleneck was not the architecture. The bottleneck was the meter.

## What this means for post-AI systems

If inference is a utility, then every system that depends on inference is a utility consumer. And that changes how you design those systems.

When I built shiioo, I treated token consumption as a budget to manage. That was the individual developer framing: I have a fixed allocation, I need to spend it wisely. But if you zoom out to the enterprise or the nation state, the framing shifts. You are not managing a budget. You are managing a utility dependency.

The questions become infrastructure questions. How much inference capacity do you need? Where does it come from? What happens when your provider has an outage? What are your contractual guarantees for availability and throughput? What is your fallback if the primary supply is interrupted? Do you own any generation capacity, or are you entirely dependent on external providers?

These are exactly the questions that enterprises ask about electricity, about water, about telecommunications. And they are starting to ask them about inference, even if most of them do not yet use that framing.

The organizations that will navigate this transition well are the ones that recognize what inference actually is: a consumed resource that correlates with power draw, requires physical infrastructure, and generates value in the form of information contextualization and evaluation. Every time a post-AI system communicates with another system or with a human, it is consuming inference. Every agent-to-agent message, every model evaluation, every generated response is a unit drawn from a metered supply that has real physical costs behind it.

The implications branch in several directions.

**Pricing will converge toward utility models.** Per-token pricing is already the norm, but the industry will move toward the more sophisticated pricing structures that utilities use: tiered rates, time-of-use pricing, capacity reservations, spot markets. Some of this is already emerging. It will accelerate as enterprises start treating inference spend the way they treat energy spend: as a major operational cost that requires dedicated procurement and optimization.

**Sovereignty will matter.** If inference is a utility, then depending on a foreign provider for your inference supply is the same kind of strategic vulnerability as depending on a foreign country for your energy supply. Europe learned this lesson with Russian natural gas. The question of whether you can run inference workloads within your own jurisdiction, on your own infrastructure, under your own legal framework, is not an abstract concern about data residency. It is a question of infrastructure sovereignty. This is why I built [Archipelag](https://archipelag.io/), and it is why I think the compute sovereignty conversation in Europe needs to move from policy papers to physical infrastructure.

**Efficiency will become an engineering discipline.** When electricity was cheap and abundant, nobody optimized for energy efficiency. When it became expensive, an entire engineering discipline emerged around it. The same will happen with inference. Right now, most systems that use inference do so profligately, full context windows, verbose prompts, redundant calls. As inference cost becomes a meaningful line item, optimizing for token efficiency will become as normal as optimizing for energy efficiency. The structured communication protocols I described in the shiioo article, typed messages instead of free-form conversation, are an early example of this. Every token should carry information, not politeness.

**Metering and observability will be essential.** You cannot manage a utility you cannot measure. Enterprises will need inference observability the same way they need power monitoring and network monitoring: real-time visibility into consumption, cost attribution to specific workloads and teams, anomaly detection for unexpected usage spikes, and capacity planning based on historical patterns. The tooling for this barely exists today. It will be a significant market within a few years.

## The meter is the message

Here is the thing that keeps coming back to me. When I ran out of tokens over Christmas, my first reaction was frustration. My second reaction was to think about the architecture differently, to design for token efficiency, to route cheap communication through cheaper models. But my third reaction, the one that has stayed with me longest, was recognition.

I recognized the shape of the problem. It was not a new shape. It was the shape of every utility constraint I have ever encountered. The shape of "the infrastructure is the bottleneck." The shape of "the resource is finite and metered and you need to think about your consumption." The shape of "the supply chain is geopolitical."

Nakasone's four factors, chips, data, talent, energy, are not just a framework for assessing national power. They are the bill of materials for producing inference. And the nations, enterprises, and individuals who control that bill of materials will have the same structural advantage that energy-rich nations had in the industrial age and bandwidth-rich nations had in the information age.

The fifth utility is here. We are just early enough that most people still think they are buying software.

## References

- [What Sixteen AI Agents Taught Me About Management](/articles/what-sixteen-ai-agents-taught-me-about-management/) - The predecessor to this article
- [Notes from RSAC 2026](/articles/notes-from-rsac-2026/) - Paul Nakasone's four factors and the geopolitical dimension
- [AI 2027](https://ai-2027.com/) - Scenario work by Kokotajlo, Alexander, Larsen, Lifland, and Dean
- [Archipelag](https://archipelag.io/) - Decentralized, sovereignty-first AI compute network
- [How I Work These Days](/articles/how-i-work-these-days/) - Where I first wrote about the shift to agent-driven development
