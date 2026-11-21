+++
title = "Rationality is avoidance of ruin"
date = 2026-11-21
description = "One hundred people at a casino are not one person a hundred times. For agents, it means reversible actions can run free and irreversible ones need a gate."

[taxonomies]
tags = ["risk", "probability", "agents", "agent-harness"]

[extra]
reads = ["skin-in-the-game"]
+++

The last chapter of Nassim Nicholas Taleb's *Skin in the Game*, which he calls the central one, rests on a thought experiment. One hundred people go to a casino, each with a set amount, for one evening. A few lose everything, and that tells you nothing about the others; from the group you can work out whether the casino prices its odds fairly. Now one person, *"your cousin Theodorus Ibn Warqa,"* goes to the same casino a hundred days in a row. *"On day 28 cousin Theodorus Ibn Warqa is bust. Will there be day 29? No."*

Taleb calls the first view ensemble probability and the second time probability, and his point is that they are not the same once there is a state you cannot come back from. He calls that state ruin, and draws the consequence plainly: *"if there is a possibility of ruin, cost-benefit analyses are no longer possible."* A game of Russian roulette pays well five times out of six, and the expected value is meaningless, because if you keep playing *"you will end up in the cemetery."* Hence the chapter's definition: *"Rationality is avoidance of systemic ruin."*

I find this the most useful rule for designing agent harnesses. An agent runs many steps, and most of them are like the hundred people: if one fails, you retry, roll back, or let the evaluation catch it, and the average is what matters. That is where an agent should be free to explore. A few steps are like cousin Theodorus on day 28: deleting data that has no backup, sending money, publishing, deploying to production, emailing a customer. One failure there ends the game, and no success rate on the other steps makes up for it.

So the line I draw is not between easy and hard tasks, or between trusted and untrusted models. It is between reversible and irreversible actions. Reversible ones run on their own and are checked by [evaluation](@/articles/evaluation-closes-the-loop.md) afterwards. Irreversible ones go through a gate, a plan that is reviewed before it runs, as in [Plan, then let go](@/notes/plan-then-execute.md), or a person who signs it off. The point of the gate is not that the agent is usually wrong. It is that "usually" is the wrong measure once ruin is possible.

The idea runs through my [review of the book](@/articles/review-skin-in-the-game.md) as well: whoever can be ruined by a decision should be the one who makes it.
