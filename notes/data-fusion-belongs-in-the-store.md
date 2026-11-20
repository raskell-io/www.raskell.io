---
title: "Data fusion belongs in the store"
url: https://raskell.io/notes/data-fusion-belongs-in-the-store/
author: Raffael Schneider
date: 2026-11-20
description: "An agent that joins five MCP servers by itself carries the integration burden on every call. The store could do that work once, for every agent."
tags: [data-fusion, context-engineering, enterprise-architecture, agent-protocols]
---

# Data fusion belongs in the store

One slide at [Agentic Engineering Days Zurich](https://raskell.io/articles/agentic-engineering-days-zurich-2026/) listed "Seven costs of separate data MCP servers": context overhead, multiple roundtrips, high token cost, cross-source joins, separate compute, fragmented caching and inconsistent semantics. Under the list, in green: "The agent carries the integration burden." The talk was Alexander Stigsen's for Exasol, a sponsored slot, and the answer it sold was one MCP interface over a federated database, with a semantic layer that maps `account_id` in the CRM and `customer_ref` in billing to one customer.

I knew data fusion as an idea. What I had not considered is putting it inside the persistence layer, so that the store does the joining and the reconciling, and the agent asks for a customer instead of for three rows it then has to agree on. It is the same argument as [Context is cheaper than exploration](https://raskell.io/notes/context-is-cheaper-than-exploration/), one layer lower: a meaning computed once in the store is a meaning no agent has to work out again.

The pattern in [Building IT Intelligence](https://raskell.io/articles/building-it-intelligence/) does that fusion today in its own pipeline, on PostgreSQL, with identity resolution as a workflow step. The open question for me is whether a database that fuses at query time can replace part of that pipeline, or only moves the same work into a product I do not control. I will test it against the reference implementation before I believe either answer.
