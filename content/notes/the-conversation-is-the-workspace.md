+++
title = "The conversation is the workspace"
date = 2026-11-20
description = "Work is moving into shared conversations between several people and several agents, with the decisions and artifacts living inside the conversation."

[taxonomies]
tags = ["multiplayer-work", "future-of-work", "interfaces", "agents"]
+++

Krzysztof Cieślak of GitHub Next, who created the Ionide tooling for F#, opened his talk at [Agentic Engineering Days Zurich](/articles/agentic-engineering-days-zurich-2026/) with a slide that said "Most AI tools focus on single-developer productivity" and followed it with "Code is cheap. Shared understanding and trust aren't." His abstract puts it more plainly: "agentic engineering has been a solo story so far."

He showed two research prototypes. Ace puts a team, its chat, its agents and their microVMs into one shared workspace; it is paused for now. [Chopin](https://githubnext.com/projects/chopin/), its successor, is "A real-time multiplayer, agentic planning environment", where coworkers and agents write a plan together around a repository. GitHub Next calls it "neither a product nor a finished prototype", which is honest, and the idea is further along than the software. Maggie Appleton of the same team [named the problem](https://maggieappleton.com/zero-alignment) earlier this year: "Agreeing on what to build is the new bottleneck."

I think this is where work goes. Not one person prompting one agent and pasting the result into a document, but a conversation with several people and several agents in it, where the decisions, the designs and the code are produced inside the conversation and stay attached to it. The artifact keeps the argument that made it, which is what pull requests, tickets and meeting notes have always lost.

Zed got there early from the editor side. It was multiplayer before agents were a topic, and this year it announced [DeltaDB](https://zed.dev/blog/introducing-deltadb), version control that "captures every operation in between and gives each one a stable identity", and [Delta](https://zed.dev/blog/introducing-delta) on top of it, whose announcement says "The thread is where software happens now, and the interface should reflect it." Zed came ahead of its time and lost some momentum along the way; I am still rooting for them. [The agent factory](/notes/the-agent-factory/) is the execution side of the same picture; this is the deciding side.
