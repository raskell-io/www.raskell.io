+++
title = "The enterprise context warehouse"
date = 2026-10-25
draft = true
description = "What the company knows about itself, exported from its systems of record into text a model reads natively, with provenance on every record."

[taxonomies]
tags = ["enterprise-architecture", "context-engineering", "knowledge-management", "provenance", "agents", "external-memory", "open-standards"]

[extra]
reads = ["building-a-second-brain"]
+++

A large company already has the systems of record: LeanIX for the application portfolio, ServiceNow for services and the CMDB, Jira and Confluence for decisions and the reasons behind them, the identity directory, the cloud inventories. Each has a UI built for people and an API built for integrators, and an agent that needs all of them spends its budget on plumbing before it has read a single fact.

The warehouse is an export with an opinion. It is a second brain for the company, in the sense Tiago Forte gives the phrase in *Building a Second Brain*, with the difference that the reader is a model. Every source is pulled into one read-mostly corpus in the formats a model reads natively: Markdown for prose and decisions, JSON for inventories and relations, and diagrams as text, Mermaid for what is really a graph, and for architecture views a textual form such as the ArchiMate exchange format or the C4 model in Structurizr DSL, because text can be diffed, generated and reviewed. The opinion is the [taxonomy](/notes/a-taxonomy-agents-can-read/) the exports are organised by, and it is where most of the work goes.

Two rules I would not bend. Provenance travels with every record, which source, which version, when, so an agent can tell current from stale and a reviewer can trace a claim back. And the warehouse stays read-mostly: it is the company's context, in the sense I argued in [Context Is the Product](/articles/context-is-the-product/), not another system that teams have to keep in sync by hand. The systems of record stay the record; the warehouse is what the agents read. What the agents learn while working goes back through a write path of its own, which is [a different problem](/articles/memory-is-a-write-path/). This site runs a toy version of the idea: every page is also published as Markdown and JSON for agents, as described in [This Site Is Becoming a Map](/articles/this-site-is-becoming-a-map/).

## References

- The Open Group, [ArchiMate 3 specification](https://pubs.opengroup.org/architecture/archimate3-doc/), with its exchange format.
- Simon Brown, [The C4 model](https://c4model.com/), and the [Structurizr DSL](https://docs.structurizr.com/dsl) that writes it as text.
- [LeanIX](https://www.leanix.net/en/) and [ServiceNow](https://docs.servicenow.com/), two of the systems of record the warehouse reads from.
