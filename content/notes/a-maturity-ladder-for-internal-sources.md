+++
title = "A maturity ladder for internal sources"
date = 2026-10-26
draft = true
description = "Rate every internal system on how readable it is, five-star style, and measure the time from asking to the first record. Two numbers for how far a company is."

[taxonomies]
tags = ["open-data", "open-standards", "metrics", "enterprise-architecture", "knowledge-management"]
+++

[Read access](/notes/the-bottleneck-is-read-access/) is the bottleneck, and bottlenecks need a number. Tim Berners-Lee's five-star ladder for open data was built for governments publishing to the public, and it transfers almost unchanged to a company publishing to its own agents. One star: the data exists somewhere, a PDF or a spreadsheet on a share. Two: it is structured and machine-readable, an export, a report API. Three: it is in an open format rather than a vendor's. Four: things in it have stable identifiers, so a record can be referred to from elsewhere. Five: it links to other sources by those identifiers. Most internal systems I have met sit at two, and the jump that matters for a [context warehouse](/notes/the-enterprise-context-warehouse/) is from two to four, because without stable identifiers the taxonomy cannot join anything.

The second number is time. From the day someone asks to read a source for the warehouse to the day its first record lands, per source, in days. It captures everything the ladder does not: the owner's reluctance, the ticket queue, the API that exists in the licence and not in practice, the MCP server that is a demo. It is a number a leadership team can be shown, and it tends to move once it is shown.

The caution from [Patents per Capita Is a Vanity Metric](/articles/patents-per-capita-is-a-vanity-metric/) applies: both numbers can be gamed, by publishing things nobody needs at five stars or by counting a stub as a first record. The defence is to measure only the sources an actual proposal was waiting on.

## References

- [Five-star open data](https://5stardata.info/en/): the original ladder.
