+++
title = "An agent's own data pod"
date = 2026-10-26
draft = true
description = "If an agent is a principal of its own, it needs its own data as well as its own identity: what it learned, what it was told, what it may keep."

[taxonomies]
tags = ["agent-identity", "data-sovereignty", "privacy", "agents", "local-first"]
+++

[Agents are their own principals](/notes/agents-are-their-own-principals/), and principals have data. An agent that works for months accumulates what it has learned about the systems it touches, what people have told it, the preferences of the team it works with, and its own record of what it did and why. Under the on-behalf-of pattern that material lived in the user's space, mixed with the user's own, which was wrong in both directions: the user could not separate their data from the agent's, and the agent lost its memory when the user changed.

The structure I would give it is the one the data-sovereignty people built for humans: a pod, a store that belongs to one principal, with the principal's identity on it and explicit grants for who may read what. For an agent, the pod holds its memory, in the sense of [Memory Is a Write Path](/articles/memory-is-a-write-path/), its working notes and its audit trail, and the grants are set by its sponsor rather than by the agent itself. Retiring the agent archives the pod; it does not vanish into someone's home directory.

Two consequences follow that I find clarifying. Privacy becomes a question about agents too: what an agent may retain about the people it works with is a policy, not an accident of context windows, and the pod is where the policy is enforced. And the local-first instinct, data where its owner is rather than in whichever service happened to see it first, turns out to apply to software principals as naturally as to people, which suggests the instinct was right about something more general than personal data.
