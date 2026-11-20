+++
title = "Data fusion belongs in the store"
date = 2026-11-20
description = "An agent that joins five MCP servers by itself carries the integration burden on every call. The store could do that work once, for every agent."

[taxonomies]
tags = ["data-fusion", "context-engineering", "enterprise-architecture", "agent-protocols"]
+++

One slide at [Agentic Engineering Days Zurich](/articles/agentic-engineering-days-zurich-2026/) listed "Seven costs of separate data MCP servers": context overhead, multiple roundtrips, high token cost, cross-source joins, separate compute, fragmented caching and inconsistent semantics. Under the list, in green: "The agent carries the integration burden." The talk was by Alexander Stigsen, who founded the mobile database Realm before MongoDB bought it in 2019 and is now Chief Product and Technology Officer at [Exasol](https://www.exasol.com/). It was a sponsored slot, and the answer it sold was one MCP interface over a federated database, with a semantic layer that maps `account_id` in the CRM and `customer_ref` in billing to one customer identity.

The constraint behind the pitch is real, and the [abstract](https://www.agenticdays.com/session/1368894-beyond-mcp-supercharging-your-agents-with-a-single-unified) names it: "regulated organisations can't copy it all into one AI platform." So the data stays where it is, and something has to give it one meaning. Today that something is usually the agent, which reconciles three spellings of the same customer on every call and forgets the result afterwards.

I knew data fusion as an idea. What I had not considered is putting it inside the persistence layer, where the store does the joining and the reconciling once and every agent gets the result. It is the argument of [Context is cheaper than exploration](/notes/context-is-cheaper-than-exploration/), one layer lower: a meaning computed once in the store is a meaning no agent has to work out again.

The pattern in [Building IT Intelligence](/articles/building-it-intelligence/) does that fusion today in its own pipeline, on PostgreSQL: observations from each source, identity resolution as a workflow step, and every link stored with its basis, its confidence and its source. That explicitness is the part I would not give up. A store that fuses at query time either keeps it, or moves the same judgement into a product I do not control. Exasol's own [documentation](https://docs.exasol.com/db/latest/ai/ai_build_agents/mcp-server-as-agent-tool.htm) also warns that an agent with nothing but the MCP server may write SQL that ignores Exasol's dialect, so the semantic layer alone does not carry the whole meaning. I will test it against the reference implementation before I believe either answer.
