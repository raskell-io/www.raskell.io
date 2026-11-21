+++
title = "The most intolerant wins"
date = 2026-11-21
description = "Taleb's minority rule: a strict few win when the flexible many do not mind. It is how formats, standards, and this site's files for agents spread."

[taxonomies]
tags = ["open-standards", "game-theory", "agents", "interfaces"]

[extra]
reads = ["skin-in-the-game"]
+++

Chapter 2 of Nassim Nicholas Taleb's *Skin in the Game* is called "The Most Intolerant Wins", and it describes what he calls the minority rule, *"the mother of all asymmetries."* A small, stubborn minority, *"say 3 or 4 percent of the total population,"* can make everyone follow its preferences, as long as the rule is asymmetric: the minority will not accept the majority's choice, but the majority does not mind the minority's.

His first example is a drink. At a summer barbecue of the New England Complex Systems Institute, he offered a friend who keeps kosher a glass of lemonade, expecting a refusal, and the friend drank it: the container carried a kosher mark. Someone who keeps kosher will not drink a non-kosher drink, but nobody else cares whether theirs is kosher, so producers and grocers make all of it kosher instead of keeping two supplies, two aisles, and two inventories. A naive observer would think the majority chose it. The majority simply did not object.

Software runs on this rule more than we admit. A protocol or format spreads less because most users want it than because a few refuse anything else and the rest do not mind. One strict client that rejects anything but valid UTF-8 or a signed request makes every producer clean up its output, because the other clients accept the clean version too. One large customer that requires single sign-on makes a vendor build it, and then every customer gets it.

I have built this site on the same asymmetry. Most readers are people, and they never see `llms.txt`, the Markdown copies of every article, or the JSON files. A small and growing share of readers are agents, and they work far better with those files than with HTML. Humans do not mind that the files exist; agents need them. So the site serves both, and that is how a minority's format becomes part of the default.

The rule also explains why [the simplest protocol wins](@/notes/the-simplest-protocol-wins.md): the cheaper it is for the majority to go along, the smaller the minority needs to be. Taleb adds one condition that matters for anyone designing a standard. It only works if the minority has skin in the game, if it really will refuse. A preference that gives way under pressure is not a rule, just a wish. I wrote more about the book in my [review](@/articles/review-skin-in-the-game.md).
