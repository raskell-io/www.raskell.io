+++
title = "The enterprise context warehouse"
date = 2026-10-25
draft = true
description = "What the company knows about itself, exported from its systems of record into text a model reads natively, with provenance on every record."

[taxonomies]
tags = ["enterprise-architecture", "context-engineering", "knowledge-management", "provenance", "agents"]
+++

A large company already has the systems of record: LeanIX for the application portfolio, ServiceNow for services and the CMDB, Jira and Confluence for decisions and the reasons behind them, the identity directory, the cloud inventories. Each has a UI built for people and an API built for integrators, and an agent that needs all of them spends its budget on plumbing before it has read a single fact.

The warehouse is an export with an opinion. Every source is pulled into one read-mostly corpus in the formats a model reads natively: Markdown for prose and decisions, JSON for inventories and relations, and diagrams as text, Mermaid for what is really a graph, and for architecture views a textual form such as the ArchiMate exchange format or the C4 model in Structurizr DSL, because text can be diffed, generated and reviewed. The opinion is the [taxonomy](/notes/a-taxonomy-agents-can-read/) the exports are organised by, and it is where most of the work goes.

Two rules I would not bend. Provenance travels with every record, which source, which version, when, so an agent can tell current from stale and a reviewer can trace a claim back. And the warehouse stays read-mostly: it is the company's context, in the sense I argued in [Context Is the Product](/articles/context-is-the-product/), not another system that teams have to keep in sync by hand. The systems of record stay the record; the warehouse is what the agents read.
