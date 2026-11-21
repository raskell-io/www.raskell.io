---
title: "Lindy for software"
url: https://raskell.io/notes/lindy-for-software/
author: Raffael Schneider
date: 2026-11-21
description: "For things that do not age, time is the only judge that cannot be fooled. A rule for choosing software: bet on what has already lasted."
tags: [risk, developer-tooling, oss, open-standards]
---

# Lindy for software

Chapter 8 of Nassim Nicholas Taleb's *Skin in the Game* is called "An Expert Called Lindy", after a deli in New York where actors gossiping about Broadway noticed that a show that had lasted a hundred days could expect a hundred more. Taleb turns it into a general rule for things that do not age the way bodies do: ideas, books, technologies. For them, the longer they have survived, the longer they are likely to survive. *"The only effective judge of things is time,"* he writes, and the reason is fragility: *"resistance to the ravages of time, that is, what we gloriously call survival, is the ability to handle disorder."*

I use it as a rule for choosing technology, and it has rarely let me down. SQL is fifty years old and will outlive most databases that tried to replace it. Unix, the shell, plain text, HTTP, and email have all survived generations of better ideas. A framework released last year might be excellent, but it has not yet been tested by the disorder that kills software: changing maintainers, changing fashions, a security flaw in the wrong place, a company that loses interest.

The rule does not say new things are bad. It says that the burden of proof is on them, and that the more of your system depends on a component, the more Lindy it should be. Use the new thing at the edge, where it is cheap to replace. Put the old thing in the middle, where replacing it would be a rewrite. That is the reasoning behind [A Blueprint for the Static Web](https://raskell.io/articles/a-blueprint-for-the-static-web/): HTML files on a server are about as Lindy as the web gets, and they have no code to break at request time.

It applies to people and companies as well, and that is the part I care about most now that agents make code cheap. A product run well by the same owner for ten years has passed a test no feature list can, which is the argument of my [review of the book](https://raskell.io/articles/review-skin-in-the-game/). Taleb puts it more bluntly: *"You can't fool Lindy."*
