+++
title = "The warehouse knows the network"
date = 2026-10-25
draft = true
description = "The warehouse needs runtime truth as well: every service, domain and endpoint, the API registry, and the public documentation of the stack it runs."

[taxonomies]
tags = ["enterprise-architecture", "networking", "context-engineering", "provenance"]
+++

A proposal that says "add a service in front of the policy system" is only useful if the policy system resolves to something concrete: hostnames, domains, endpoints, the API contract and its version, the gateway in front of it, the certificates and DNS zones involved, and the team that owns each. That is runtime truth, and in most companies it lives apart from the architecture truth, in DNS, in the API management tool, in the gateway configuration, in the cloud accounts, owned by people who have never opened LeanIX.

So the [context warehouse](/notes/the-enterprise-context-warehouse/) has to know the network. A registry of every web service with its FQDNs and endpoints, the API registry with the OpenAPI specifications, and the joins between them and the taxonomy, so that a box on a diagram and a hostname in a log are the same thing to an agent. The public half of the stack belongs in too: the vendor documentation, the standards, the release notes and the security advisories for the technology the company actually runs, sourced with provenance so an agent can tell a current vendor page from a five-year-old blog post.

This is the part that turns an agent's proposal from a drawing into a pull request against real infrastructure, and it is also the graph that [the risk gate](/notes/design-time-risk-with-a-threshold/) computes blast radius over. Without it, a risk score is a guess about a diagram.
