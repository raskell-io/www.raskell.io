+++
title = "Speaking"
description = "Talks, panels, and podcasts on agentic AI, post-AI-authored code, platform automation, edge systems, and applied security."
+++

## Talks

The slide decks are collected under [Talks](@/talks/_index.md).

{% card(title="I Stopped Writing Most of My Code", url="/talks/iat-13-basel/", eyebrow="IT's ABOUT TECH #13, Basel", meta="June 10, 2026 · FHNW Aula", links=["Open the slide deck|/talks/iat-13-basel/", "Event page|https://www.swissmadesoftware.org/en/news/2026/iat--13.html"]) %}
A 15-minute showcase at swiss made software's IT's ABOUT TECH evening on the theme "Hand's on software engineering was yesterday, now it's AI — Really?". Not a tool talk. A story about what changed for a long-time engineer after Claude Opus 4.5 and Claude Code arrived, and what happens to a backlog of years-old ideas when the bottleneck stops being time.

**Key takeaways:**

- The bottleneck moved from translating thoughts into syntax to deciding what to build and whether the result is acceptable
- AI did not generate the ideas. It let existing ideas escape the notebook
- The human did not disappear. The human moved up the stack
{% end %}

{% card(title="Self-Learning WAF: Using Generative AI to Tame ModSecurity False Positives", url="https://path.rsaconference.com/flow/rsac/us26/FullAgenda/page/catalog/session/1753946922633001YdMq", eyebrow="RSAC 2026 · NCS-W01", meta="March 25, 2026 · Moscone Center, San Francisco", links=["View session on RSAC website|https://path.rsaconference.com/flow/rsac/us26/FullAgenda/page/catalog/session/1753946922633001YdMq"]) %}
ModSecurity with the OWASP Core Rule Set (CRS) is a powerful open-source WAF, but tuning false positives remains painful and time-consuming. This talk introduced a self-learning approach that uses generative AI to analyze blocked requests, determine legitimacy, and automatically generate tuning rules, reducing manual effort while keeping humans in the loop for approval.

**Key takeaways:**

- How generative AI can classify WAF false positives with high accuracy
- A practical pipeline for automated rule generation with human oversight
- Lessons learned from applying this approach in production environments

**Media-friendly version:** Using generative AI to automatically detect and fix WAF false positives, keeping ModSecurity effective without the tuning headache.
{% end %}

## Available for

I am available for technical talks, panels, and podcasts on:

{% tiles(cols=2) %}
- **Agentic AI** Agent platforms, orchestration, context, tool use, governance, and observability.
- **Post-AI-authored code** What changes when AI writes most of the code: verification, review, tooling, and where the human moves.
- **Platform automation** Self-service infrastructure, workflows, and guardrails.
- **Edge systems** Reverse proxies, ingress, policy enforcement.
- **Applied security** Practical controls, incident response, operability.
- **Open standards** Sustainable architecture over vendor lock-in.
{% end %}

{% panel(eyebrow="Invite me", title="Have a stage, a panel, or a podcast?", contact=true) %}
Send me a message on X or LinkedIn with the event, the date, and the audience.
{% end %}
