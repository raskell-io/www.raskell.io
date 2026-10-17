+++
title = "Alert triage is a context problem"
date = 2026-10-17
draft = true
description = "An LLM does not make a noisy WAF quieter. Giving it the context an operator would look up first does."

[taxonomies]
tags = ["ai-for-ops", "waf", "applied-security", "context-engineering"]
+++

Earlier this year a colleague and I put an LLM in front of our ModSecurity alerts. The goal was never to let the model decide what to block. It was to turn a wall of rule IDs into review items an operator can act on: what the request was, which rule fired and why, whether it looks like the same false positive as last week.

The model was the easy part. What made the output useful was the context we put in front of it: the rule's own description, the normalised request, the recent history for that path, and the decisions operators had already made on similar alerts. Without that, the model explains the rule back to you, confidently and at length. With it, the summary starts to look like what a careful operator writes after ten minutes of digging.

That is the same lesson as [Context Is the Product](/articles/context-is-the-product/), arrived at from the security side. It is also why [traffic replay](/articles/traffic-replay-as-a-security-primitive/) matters here: the most valuable context for a WAF alert is the traffic that triggered it, reproducibly.

The human stays in the loop. The model shortens the loop.
