+++
title = "Own identity, human sponsor"
date = 2026-10-26
draft = true
description = "An agent that can act needs its own identity and a named human who answers for it, the way a contractor has a manager. The rule on its own."

[taxonomies]
tags = ["agent-identity", "agents", "applied-security", "ethics", "policy"]
+++

When I wrote that [agents are their own principals](/notes/agents-are-their-own-principals/), the objection I expect is accountability: if the agent has its own identity and its own rights, who is responsible when it does something wrong? The on-behalf-of pattern answered that by construction, badly, by making the person whose token was borrowed responsible for things they did not do.

The rule I would put in its place has two halves, and both are needed. The agent has an identity of its own, so that the audit trail says what actually happened and its permissions fit the task. And every agent identity has a named human sponsor, recorded in the directory next to it, who answers for what it does, approves what it may have, and retires it when it is no longer needed. That is how a company already treats a contractor, a service account done properly, or a junior employee in their first week. The sponsor is not the person the agent works for on a given task; it is the person the organisation holds accountable for the agent existing at all.

The failure mode the rule prevents is the obvious one: own identity, nobody's problem. Fleets of agents nobody owns, with permissions nobody reviews, is the service-account sprawl of the 2010s with the ability to act, and the sponsor field is the cheapest control against it. It is also what makes an [agent factory](/notes/the-agent-factory/) answerable at all: every agent in it has a sponsor, so every change it makes has a person behind it, without that person having done the work.
