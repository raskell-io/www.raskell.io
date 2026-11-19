+++
title = "The Enterprise Stack: Next.js, Go and Temporal for Platforms Many Teams Share"
date = 2026-11-19
draft = true
description = "How I would build an enterprise platform many teams share: Next.js in front, a Go API and CLI, and Temporal running the connectors."

[taxonomies]
tags = ["enterprise-architecture", "golang", "typescript", "durable-execution", "platform-automation", "ai-platforms"]

[extra]
author = "Raffael"
+++

<!--
Idea, not yet written. Builds on:
- A Blueprint for the Static Web (/articles/a-blueprint-for-the-static-web/).
- Almost Irrelevant, "Go: for code a whole company shares" (/articles/almost-irrelevant/).
- The River and the Canal (/articles/the-river-and-the-canal/): workflows as what exploration leaves behind.

Arc:
- The shape of the problem: omnichannel platforms many teams use and extend. Agentic AI hubs,
  Backstage-like self-service portals, marketplaces with citizen apps.
- Next.js for the many front doors: web, embedded views, design system, server components.
- One Go API, and a CLI on the same client, so every action is scriptable and agent-callable.
- Temporal as the connector layer to the systems next door (Jira, LeanIX, ServiceNow, Salesforce):
  retries, long-running approvals, compensation, an audit trail for free.
- Extension model: how citizen apps plug in without owning the integrations.
- Where it hurts: three runtimes to operate, Temporal's learning curve, versioning workflows.
- Contrast with the solo stack: what changes when the constraint is many teams, not one person.
-->
