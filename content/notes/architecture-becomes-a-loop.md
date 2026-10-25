+++
title = "Architecture becomes a loop"
date = 2026-10-25
draft = true
description = "Enterprise architecture used to be a quarterly document. With agents it is a loop: context, proposal, risk gate, change, and context again."

[taxonomies]
tags = ["enterprise-architecture", "agents", "ai-platforms", "platform-automation", "risk", "legibility"]

[extra]
reads = ["enterprise-architecture-as-strategy"]
+++

Enterprise architecture, as I have practised it in large companies, is a document discipline. Someone draws the target landscape, someone reviews the solution design against it, and the two meet a few times a year. The documents are mostly right and mostly late, and the gap between them and the systems that actually run is where the interesting failures live. Ross, Weill and Robertson's *Enterprise Architecture as Strategy*, the standard text of that discipline, is on my reading list for exactly that reason.

The way I now think it should work in a company with agents is a loop with five parts. A [context warehouse](/notes/the-enterprise-context-warehouse/) holds what the company knows about itself, in formats a model reads natively, including [the network it runs on](/notes/the-warehouse-knows-the-network/) and organised by [a taxonomy agents can read](/notes/a-taxonomy-agents-can-read/). Agents, in the sense of [What an Agent Actually Is](/articles/what-an-agent-actually-is/), a goal, a model, context, tools and a loop, read it and propose: a solution design, a change to the portfolio, an extension to the landscape. [A risk gate](/notes/design-time-risk-with-a-threshold/) scores the proposal at design time and either approves it or escalates it to a human architect. [An agent factory](/notes/the-agent-factory/) carries the approved change out alongside employees, with the agents acting as [principals of their own](/notes/agents-are-their-own-principals/). And the change lands back in the warehouse, so the next proposal starts from the new state.

None of the five parts is exotic on its own. The loop is the idea, and [the thing that stops it](/notes/the-bottleneck-is-read-access/) is not technical.
