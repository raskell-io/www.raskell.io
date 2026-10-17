+++
title = "A model gateway is a reverse proxy"
date = 2026-10-17
draft = true
description = "Routing, fallback, metering, and policy for model calls are the problems edge proxies solved for HTTP. The vocabulary carries over almost unchanged."

[taxonomies]
tags = ["ai-platforms", "inference", "edge-systems"]
+++

Every enterprise AI platform ends up with a model gateway: one place where requests to foundation models pass through before they reach a provider. Look at what it does and it reads like a reverse proxy's feature list. It routes a request to an upstream, retries and fails over when one is down, applies rate limits and budgets per tenant, enforces policy on what goes out, and logs enough to bill and audit later.

That is not an analogy I reach for to sound clever. It is the same engineering. The questions I kept asking while building [Zentinel](https://zentinelproxy.io) (where does policy live, what fails closed, what happens when an upstream is slow) are the questions a model gateway has to answer, with tokens instead of bytes as the unit of cost.

In the Agent Platform Handbook this layer shows up twice: as routing and fallback in [The Model Is a Dependency](/articles/the-model-is-a-dependency/), and as metering in [The Bill Is Part of the Loop](/articles/the-bill-is-part-of-the-loop/). In an organisation it is one shared service, and it belongs to the platform, not to each team that calls a model.

The edge moved once already; [the backend became a persistence layer](/articles/edge-systems-are-the-new-backend/). Model traffic is the next thing to route through it.
