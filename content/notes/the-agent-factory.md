+++
title = "The agent factory"
date = 2026-10-25
draft = true
description = "Coding agents on short-lived microVMs, orchestrated like a remote team and working in the same tickets and pull requests as employees. The new work style."

[taxonomies]
tags = ["agents", "isolation", "future-of-work", "ai-platforms", "economics", "factories", "self-hosting"]
+++

The execution half of [the loop](/notes/architecture-becomes-a-loop/) is a factory: a fleet of coding agents, Claude Code instances in the version we discussed, each on a secure runtime, a microVM that lives for one task and keeps no state except what the repositories and the [warehouse](/notes/the-enterprise-context-warehouse/) hold, orchestrated the way a remote team is orchestrated, through tickets, branches and reviews, and working in the same tickets and pull requests as the employees. Not a tool employees call; colleagues employees work with. That is the new work style, and it changes management more than it changes tooling. [What Sixteen AI Agents Taught Me About Management](/articles/what-sixteen-ai-agents-taught-me-about-management/) is the small-scale version of the same lesson.

Three things the factory cannot do without. The warehouse is its library; a factory without context produces plausible changes nobody can accept, and the tools it calls are the ones from [Tools: How Agents Actually Do Things](/articles/tools-how-agents-actually-do-things/), run inside the sandbox rather than on someone's laptop. The runtime can be the company's own metal, which is cheaper than it was, as in [How AI Makes Bare Metal Viable Again](/articles/how-ai-makes-bare-metal-viable-again/). [The risk gate](/notes/design-time-risk-with-a-threshold/) is its exit; the factory must not be able to deploy what nobody scored. And a budget, because a factory paid per token has a bill, and as I argued in [The Bill Is Part of the Loop](/articles/the-bill-is-part-of-the-loop/), the bill belongs inside the control loop rather than in next month's invoice.

The agents in it also need to be someone. That is the last note: [agents are their own principals](/notes/agents-are-their-own-principals/).

## References

- [Firecracker](https://firecracker-microvm.github.io/): the microVM runtime the secure runtime is modelled on.
- [Claude Code](https://code.claude.com/docs/en/overview): the coding agent in question.
