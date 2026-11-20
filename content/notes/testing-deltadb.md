+++
title = "Testing DeltaDB"
date = 2026-11-21
draft = true
description = "Where DeltaDB can be tried today, what to keep out of it, and the one question a first test should answer: is review faster with the conversation attached?"

[taxonomies]
tags = ["multiplayer-work", "provenance", "developer-tooling", "agents"]
+++

[The conversation is the workspace](/notes/the-conversation-is-the-workspace/) ended on Zed's [DeltaDB](https://zed.dev/blog/introducing-deltadb), version control that "captures every operation in between and gives each one a stable identity" and ties each edit to the agent conversation that produced it. The obvious next step is to try it, so here is where that is possible today.

DeltaDB is not something you install or host on its own. It is the storage under [Delta](https://delta.dev), Zed's "multiplayer environment for coding with agents and reviewing what they build", which has been in public beta since Zed's post [Replace PRs with Delta](https://zed.dev/blog/delta-public-beta). There are three ways in:

| Way in | What it does |
|---|---|
| [Delta app](https://delta.dev/download) | macOS, Linux and Windows, or in the browser without installing anything |
| [Delta CLI](https://delta.dev/cli) | syncs the sessions of an agent you already use, such as Claude Code, to DeltaDB, so a teammate can join the same session |
| [Claude Agent in Delta](https://delta.dev/blog/claude-agent-in-delta) | runs Claude inside Delta on an existing Claude subscription |

The CLI asks which sessions to sync: private sync, organisation sharing, or manual, where only sessions you share explicitly leave the machine. Delta "stores the conversation and a copy of this checkout, including uncommitted changes, in DeltaDB", which is Zed's cloud, so I keep it to my own open source repositories and start with manual sharing.

The test I want to run is small. Share one Claude Code session on a public repository, then open the thread as a reviewer would, from another machine, and compare it with reviewing the same change as a pull request. The question is the one the conference left me with: is review faster and better when the conversation is attached to the code, or does it only move the reading from the diff to the thread? I will add the answer here.
