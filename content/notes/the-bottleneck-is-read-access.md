+++
title = "The bottleneck is read access"
date = 2026-10-25
draft = true
description = "The loop assumes the sources can be read. In a large company that is the hard part: data has owners, ownership feels like standing, APIs mature slowly."

[taxonomies]
tags = ["enterprise-architecture", "knowledge-management", "metrics", "agents"]
+++

Every part of [the loop](/notes/architecture-becomes-a-loop/) assumes that the systems of record can be read, and in a large company that assumption is where the project goes to die. Data has owners. Ownership feels like standing, and a request for read-only access to feed a [warehouse](/notes/the-enterprise-context-warehouse/) reads, to the owner, as a request to be made replaceable. Then the practical limits behind the political one: APIs that exist in the licence but not in practice, APIs that work but nobody documented, MCP servers that are demos, exports that need a ticket and a person who is on holiday.

I think the honest thing is to say what this is. The capability that AI has [democratised](/notes/a-capability-democratised/), the ability to build and change things, runs here into the oldest form of [power](/notes/power-in-the-good-sense/) there is, holding the data. The warehouse is a political project before it is a technical one, and pretending otherwise wastes a year.

The practical thing is to measure it. The time from "we would like to read X" to the first record from X in the warehouse, per source, is the number that tells you how far a company is from any of this, and it is a number a leadership team can be shown. Start read-only, start with the sources whose owners want to be read, and treat each refusal as a line on the roadmap rather than a reason to stop.
