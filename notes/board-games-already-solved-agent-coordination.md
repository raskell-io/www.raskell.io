---
title: "Board games already solved agent coordination"
url: https://raskell.io/notes/board-games-already-solved-agent-coordination/
author: Raffael Schneider
date: 2026-11-21
description: "Turn structures from German-style board games, read as agent architectures: role selection, worker placement, auctions, deck-building, automa."
tags: [agents, agent-harness, board-games, game-design, game-theory]
---

# Board games already solved agent coordination

After [Plan, then let go](https://raskell.io/notes/plan-then-execute/) I kept going down the list. WEGO is one turn structure among many, and most of the others have a counterpart in how we build agents. Most of the best ones come from the German-style board games that have always fascinated me, the *Autorenspiele*: games by a named author, whose name the *Spiele-Autoren-Zunft* wants *"zumindest auf der Coverseite der Verpackung sowie in der Spielanleitung"*, at least on the front of the box and in the rules.

A Eurogame is, at its core, a carefully tuned answer to one question: who may act, when, and at what cost. That is also the question an agent harness has to answer.

| Turn structure | A game that uses it | The agent counterpart |
|---|---|---|
| I go, you go | Chess | the [ReAct](https://arxiv.org/abs/2210.03629) loop: act, observe, act again |
| Everyone plans, then all resolves | [Diplomacy](https://en.wikipedia.org/wiki/Diplomacy_(game)) | [plan-then-execute](https://raskell.io/notes/plan-then-execute/) |
| Programmed actions | [RoboRally](https://en.wikipedia.org/wiki/RoboRally) | a plan written as a queue of tool calls, where a small early mistake compounds |
| Role selection | [Puerto Rico](https://en.wikipedia.org/wiki/Puerto_Rico_(board_game)) | an orchestrator that picks a task every worker then carries out |
| Worker placement | [Caylus](https://en.wikipedia.org/wiki/Caylus_(game)) | parallel agents contending for shared resources: locks, rate limits, a single deploy slot |
| Auctions | [Modern Art](https://en.wikipedia.org/wiki/Modern_Art_(game)) | market-based task allocation, the [contract net](https://en.wikipedia.org/wiki/Contract_Net_Protocol) |
| Deck-building | [Dominion](https://en.wikipedia.org/wiki/Dominion_(card_game)) | curating the tool set and the context |
| Cooperation with limited talk | [Hanabi](https://en.wikipedia.org/wiki/Hanabi_(card_game)) | agents that must infer what another agent knows |
| Automa | the solo modes of the Automa Factory | simulated users for [evaluation](https://raskell.io/articles/evaluation-closes-the-loop/) |

Some of these are more than analogies. In Puerto Rico each player picks one role per round, every player then performs that role's action, and the one who picked it gets a small privilege. That is a supervisor handing the same instruction to many workers, with the supervisor's own share decided by the choice. Reid G. Smith's [contract net protocol](https://doi.org/10.1109/TC.1980.1675516) (1980) allocates tasks among autonomous nodes by announcement and bidding, which is an auction table with the art removed. And Hanabi is not only like an agent benchmark, it is one: [The Hanabi Challenge](https://arxiv.org/abs/1902.00506) (Bard and others, 2019) proposes it as a research domain because it *"elevates reasoning about the beliefs and intentions of other agents to the foreground."*

The Automa is my favourite. An *automa* is a small deck of cards that plays the opponent in a solo game: draw a card, follow its icons. Morten Monrad Pedersen founded the Automa Factory to build them for other publishers. [Punchboard's review of solo modes](https://punchboard.co.uk/blog-solo-modes-in-board-games-part-two-automa/) lists the games that *"will never work for solo"*: *"Social deduction, auction games, take-that mechanics, party games."* They are the games where the other player's mind is the game. Replace "opponent" with "user" and that is the honest limit of every simulated user in an agent eval: a deck of cards can stand in for behaviour, not for intent.

The general lessons come from what Eurogames value:

- **Few actions, each one costly.** A Euro gives you two or three meaningful moves a round, not twenty. An agent with a small, typed action surface does better than one with fifty loose tools, which is also what [Piet and others](https://arxiv.org/abs/2605.14290) argue for web agents: typed site interfaces instead of clicks.
- **Indirect interaction.** You rarely attack anyone in a Euro; you take the space they needed. Agents that coordinate through shared state are easier to reason about than agents that message each other.
- **Open information, little luck.** The outcome follows from the decisions, so you can replay a game and see why you lost. That is what you want from a trace.
- **A known end.** Every Euro has a visible end trigger, and good players plan backwards from it. Agents are bad at knowing when to stop; a budget or an end condition does that job.
- **Playtesting.** A Euro is played hundreds of times before its numbers are fixed. Evals are the same work.

For Waterfront the table reads the other way round. The weekly order sheet already sits between WEGO and worker placement: lieutenants are workers, the city's docks and warehouses are action spaces, and two gangs choosing the same pier on the same night is exactly the kind of coincidence the week should produce. Board games got there first, agent builders arrived later, and I am happy to borrow from both.

## References

- Spiele-Autoren-Zunft, [11-Punkte-Liste](https://www.spieleautorenzunft.de/files/public/Dokumente-DE/11-Punkte-Liste%20-%20V5.pdf), on naming the author on the box.
- Reid G. Smith, [The Contract Net Protocol: High-Level Communication and Control in a Distributed Problem Solver](https://doi.org/10.1109/TC.1980.1675516), IEEE Transactions on Computers, C-29(12), 1980.
- Nolan Bard and others, [The Hanabi Challenge: A New Frontier for AI Research](https://arxiv.org/abs/1902.00506), arXiv:1902.00506, 2019; Artificial Intelligence 280, 2020.
- Julien Piet and others, [Web Agents Should Adopt the Plan-Then-Execute Paradigm](https://arxiv.org/abs/2605.14290), arXiv:2605.14290, 2026.
- Shunyu Yao and others, [ReAct: Synergizing Reasoning and Acting in Language Models](https://arxiv.org/abs/2210.03629), arXiv:2210.03629, 2022.
- Punchboard, [Solo Modes in Board Games, Part Two: Automa](https://punchboard.co.uk/blog-solo-modes-in-board-games-part-two-automa/).
- [Puerto Rico](https://en.wikipedia.org/wiki/Puerto_Rico_(board_game)) and [Caylus](https://en.wikipedia.org/wiki/Caylus_(game)), Wikipedia.
