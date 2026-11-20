+++
title = "The simplest protocol that reduces the most uncertainty wins"
date = 2026-11-20
description = "A lens from a talk on agent protocols: judge a standard by how many decisions it removes from your application, and ask what it makes replaceable."

[taxonomies]
tags = ["agent-protocols", "open-standards", "abstraction", "history-of-technology"]
+++

Stefano Maestri sits on the A2A Technical Steering Committee for IBM and wrote the launch post for the A2A Java SDK. Alessio Soldano led RESTEasy at Red Hat and is a committer on Apache CXF. Between them they lived through SOAP against REST from the inside, and their talk at [Agentic Engineering Days Zurich](/articles/agentic-engineering-days-zurich-2026/) used that history as its argument. The lens was one line: "The simplest protocol that reduces the most uncertainty wins."

Their [deck](https://maeste.it/agents-speak-protocol-aed/) asks one practical question of every standard: how many decisions disappear from the application? The answer for agents is not one protocol but an agreement at each boundary. Open Responses toward models, MCP toward tools, A2A toward other agents, AG-UI and A2UI toward users, AGENTS.md, Skills and Plugins toward knowledge, OpenTelemetry GenAI toward operations, ACP toward the editor, and x402 toward payments. The question under the map was "What do you want to make replaceable?", and the rule beside it was "Keep the contract. Change the implementation."

Two distinctions from the talk are worth keeping. MCP gives access to a capability: the agent calls a tool and the host keeps policy and consent. A2A delegates an outcome to a counterpart whose model, tools and memory stay private: "Agree on the work. Keep internals private." Most confusion about agent protocols comes from mixing the two up.

The lens fits [Every layer moves the uncertainty](/notes/every-layer-moves-the-uncertainty/) closely. A protocol is a layer whose whole job is to make one boundary predictable, so the useful question is the same: which decisions leave my application, and where does the uncertainty go instead. The deck's smallest line was the one I kept: "Opening a channel is not the agreement." An MCP server opens a channel. What a customer means, what a task owes and when it is done are the agreement, and no transport settles them.
