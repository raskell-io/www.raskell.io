+++
title = "Context is cheaper than exploration"
date = 2026-11-03
draft = true
description = "An agent without context explores, and every agent pays for the same exploration again. Computing a fact once for every agent is a cache for a company."

[taxonomies]
tags = ["context-engineering", "economics", "agents", "inference"]
+++

An agent that does not know something does not stop. It explores: searches, reads, greps, queries, and reasons over whatever it found, paying for every token of it, and paying again on every turn after. Then the next agent asks the same question and pays for the same exploration from scratch. In [IT Intelligence](/articles/it-intelligence/) I estimated that a thousand engineers asking twenty such questions a day spend billions of tokens rediscovering the same facts. The numbers were illustrative; the shape is not.

The fix is the oldest trick in computing applied to what a company knows about itself: compute once, read many. A context platform, a well-kept repository of decisions, a typed catalogue of services, anything that lets an agent look up instead of search, is a cache for the organisation. It makes agents cheaper, as I argued for inference generally in [The Economics of Inference](/articles/the-economics-of-inference/), and it makes them better, because the window they do not spend on searching is spent on the task. I expect this to matter more every year, because the number of agents asking grows much faster than the number of facts worth knowing.
