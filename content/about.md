+++
title = "About"
description = "Raffael is an AI architect in Basel, working on enterprise AI and agent platforms, edge systems, and applied security."

[extra]
headline = 'Turning <span class="iridescent">intelligence</span><br>into <span class="accent">real-world</span> capability.'
banner = "images/about-banner.avif"
banner_fallback = "images/about-banner.jpg"
banner_motion = "images/about-banner-motion.avif"
banner_motion_fallback = "images/about-banner-motion.webp"
banner_alt = "Two white humanoid robots on a jungle path, looking toward a sunlit valley with tall white spires."
og_image = "about.png"
portrait = "images/raffael.webp"
portrait_alt = "Raffael"
+++

Hi, I am Raffael. I live in Basel and work as an AI architect.

By day I am Enterprise Solution Architect for AI Platforms and Agentic AI at Helvetia Baloise Group. I help define a Group-wide AI platform: a common foundation for the secure, governed use of foundation models, agents, and AI-assisted engineering across market units with different technology strategies. Before that, I spent the first half of 2026 there as a platform engineer on secure web delivery and edge infrastructure, where a colleague and I built an LLM-assisted workflow that turns noisy ModSecurity alerts into review items an operator can act on.

Outside of work, I build automation-first platforms and edge systems at the intersection of security and AI, and a lot more besides: programming-language tooling, local-first apps, simulations, and games. For years my ideas lived in a notebook because there was never enough time to try them. AI moved the bottleneck from writing the code to deciding what is worth building, so now I ship ideas small and real and see which ones stick. What I write here is my own view, not my employer's.

<p class="equation" role="math" aria-label="raskell equals rascal times Haskell times Raffael, tanuki mascot included"><span class="math"><var>raskell</var><span class="mrel">=</span><var>rascal</var><span class="mbin">×</span><var>Haskell</var><span class="mbin">×</span><var>Raffael</var></span><span class="math-text">(tanuki mascot included)</span></p>

Tech that serves humans. Boring by default, precise when required.

I like hard problems. The kind where latency, reliability, risk, and people all collide. Applied security is just one arena of that. It is systems under pressure with adversarial inputs and questionable signal-to-noise.

## What I do

{% tiles() %}
- **AI and agent platforms** Model gateways, orchestration, context, memory, tool use, governance, and observability.
- **Platform automation** Workflows, guardrails, self-service, operability.
- **Edge systems** Reverse proxies, policy, observability, safe change.
- **Applied security** Reduce noise, keep humans effective, ship pragmatic controls.
- **AI-assisted engineering** Agentic workflows, model-driven tooling, ops automation.
- **Languages and tooling** Compilers, package managers, frameworks, and specs.
- **Local-first apps** Software that keeps your data on your device.
- **Simulations and games** Interactive worlds, some that mimic real ones and some made for play.
- **Open standards** Sustainable solutions over vendor lock-in.
{% end %}

## Projects

I run several early-stage ventures and flagship builds, alongside a steady stream of experiments. The main ones:

{{ project_cards(slugs=["zentinel", "archipelag-io", "cyanea", "arcanist"]) }}

[All projects →](/projects/) · Several of them are [open to investment](/invest/).

## Speaking

{% panel(eyebrow="Talks, panels, podcasts", title="Most recently at RSAC 2026 and in Basel.", links=["Talks and availability|@/speaking.md"]) %}
Platform automation, edge systems, applied security, and what changes when AI writes most of the code.
{% end %}

## Contact

{{ contact() }}

Everything I write here is free to reuse under [CC BY 4.0](/license/), and the code samples under MIT. Credit me and link the page.
