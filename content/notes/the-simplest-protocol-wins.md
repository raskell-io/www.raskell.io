+++
title = "The simplest protocol that reduces the most uncertainty wins"
date = 2026-11-20
description = "A lens from a talk on agent protocols: judge a standard by how many decisions it removes from your application, and ask what it makes replaceable."

[taxonomies]
tags = ["agent-protocols", "open-standards", "abstraction", "history-of-technology"]
+++

Stefano Maestri and Alessio Soldano, who work on the protocols themselves (Maestri sits on the A2A Technical Steering Committee), gave their talk at [Agentic Engineering Days Zurich](/articles/agentic-engineering-days-zurich-2026/) one lens: "The simplest protocol that reduces the most uncertainty wins." Their map put an agreement at each boundary of an agent: Open Responses for models, MCP for capabilities, A2A for other agents, AG-UI and A2UI for users, AGENTS.md, Skills and Plugins for knowledge, OpenTelemetry GenAI for operations, ACP for the editor, x402 for payments. The question under the map was "What do you want to make replaceable?"

The lens fits [Every layer moves the uncertainty](/notes/every-layer-moves-the-uncertainty/) closely. A protocol is a layer whose whole job is to make one boundary predictable, so the useful question is the same: which decisions disappear from my application, and where does the uncertainty go instead. The [deck](https://maeste.it/agents-speak-protocol-aed/) answers with history, CORBA against REST and SOAP against JSON, and its smallest line was the one I kept: "Opening a channel is not the agreement."
