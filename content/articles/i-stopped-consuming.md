+++
title = "I Stopped Consuming"
date = 2026-12-08
draft = true
description = "I stopped renting my entertainment and started building it, and it made me the polymath I always wanted to be. It is the most fun I have had."

[taxonomies]
tags = ["attention-economy", "games", "local-first", "augmentation", "simulation", "life-sciences", "future-of-work"]

[extra]
author = "Raffael"
+++

<!-- Draft, captured 2026-11-21. Raffael's realization, in his words: "I stopped consuming apps, Netflix,
entertainment subscriptions and what not. I built my own apps that I want to spend time with: Manabi,
Driftscape, Paw and Claw, Waterfront, Kishi, my own book review format on my dev/tech blog (rather than using
some Goodreads or whatever). I entertain myself by rebuilding, rethinking, reinventing the world. And it is
fun AF." Keep that last note of joy; the piece should sound delighted, not ascetic.

Tier: short to mid (1,500 to 2,500 words). Possible arc, not yet agreed:
  1. The realization: the evening I noticed I had not opened a streaming app or an app store in weeks, and
     what I had opened instead. (Ask Raffael for the concrete moment and roughly when it started.)
  2. What replaced what: a table, one row per thing.
       Language app subscription      -> Manabi (reading-first CJK and Hebrew, offline PWA)
       Music and ambient streaming    -> Driftscape (composable, location-aware soundscapes; in development)
       Mobile and console games       -> Paw & Claw (Advance Wars-style, Rust and Bevy), Waterfront (in design and early code)
       Chess and Go apps              -> Kishi (chess, shogi, Go engines in Rust and WebAssembly, offline)
       Goodreads                      -> the reading log and reviews on this site
     (Ask which subscriptions he actually cancelled, so the left column is true.)
  3. Why it is possible now: agents make code cheap, so a person can build the thing instead of renting it.
     Link: ideas-stop-waiting, power-in-the-good-sense, the Skin in the Game review (ownership).
  4. Why it is more fun: consuming is passive; building is play with the rules of the world. Rebuilding
     how a language is learned, how a game of chess is played, how a book is reviewed. Link: learning-to-play,
     plan-then-execute (Waterfront), goat-games (what I used to play).
  4b. The second half of the realization (Raffael, 2026-11-21): "I can finally dabble into all these fringe topics
     and other things that I have always found interesting (life science, microbiology, game development,
     simulations, mathematics, machine learning, space/aeronautical engineering, robotics, etc). I finally can
     become the post-AI polymath I always aspired to be." Building is how he learns a field, not only how he
     plays. Evidence already on the site, one line each:
       life science, microbiology  -> Cyanea (bioinformatics notebooks), the reviews of How Life Works and The Code Breaker, the smell note
       neuroscience                -> Hotaru (simulated neuron cultures playing Pong, after DishBrain), the A Brief History of Intelligence review
       simulations                 -> Terrarium (LLM agents forming civilisations), Waterfront
       game development            -> Paw & Claw, Rainbow River, Waterfront
       mathematics, ML, game AI    -> Kishi, Learning to Play
       robotics                    -> RoboGym (browser-based robot training)
       space and aeronautics       -> the reading log (A City on Mars); ask whether a project exists or is planned
     The reading log and the topic map show the breadth; link /reading/ and /map/.
     Angle: the polymath used to be someone with private means and decades (Leonardo, Leibniz, Franklin).
     With agents as tireless assistants, curiosity becomes cheaper to act on. Counterpoint to face: breadth
     without depth, the dilettante risk. Possible answer: building forces depth, because the thing has to work.
     Check the facts on historical polymaths in a source before writing them.
  5. What it is not: not a productivity hack, not a moral stance against Netflix. Counterargument to address
     honestly: shared culture (nobody else watches my apps with me), time cost, the risk of only ever tinkering.
  6. Close: one sharp line about building as the new leisure.
Links to make: the apps page, each project page, this-site-is-becoming-a-map (the site as its own app).
Hero: needs a prompt (hero-prompt-i-stopped-consuming.md) when the prose is written. -->

<!--
DRAFT NOTES (remove before publish)
1. The concrete moment: the opening still says "at some point this year". Raffael, when and where did you
   notice? One real evening beats any general sentence.
2. Cancelled, confirmed 2026-11-21: video streaming, a language-learning app, music streaming, game apps and
   subscriptions. Name the services only if you want to; the table stays generic.
3. Space and aeronautics: no project yet, only the reading list. Say so, or name a plan if there is one.
4. In short bullets, hero prompt, and the back-link from ideas-stop-waiting on release day.
-->

At some point this year I noticed that I had stopped consuming. Not on principle, and not as a detox. I had simply stopped opening the apps and subscriptions that used to fill my evenings, because the software I wanted to spend time with was software I had built myself.

That can sound like a sermon, and it is not one. I did not give anything up. I swapped one kind of fun for a bigger one, and it is the most fun I have had in years.

## What replaced what

The list is short and a little embarrassing in how literal it is.

| What I paid for or opened every evening | What I open now |
|---|---|
| A video streaming subscription | the things below, mostly |
| A language-learning app | [Manabi](https://manabi.raskell.io), a reading-first app for Chinese, Japanese, Korean, and Hebrew that runs offline in the browser |
| A music streaming subscription | [Driftscape](https://github.com/raskell-io/driftscape), composable ambient soundscapes, still in development |
| Mobile and console games | [Paw & Claw](https://pawandclaw.raskell.io), turn-based tactics with woodland armies, and Waterfront, a crime-management game I am designing in the spirit of [Gangsters: Organized Crime](https://en.wikipedia.org/wiki/Gangsters:_Organized_Crime) |
| Chess and Go apps | [Kishi](https://kishi.raskell.io), chess, shogi, and Go against engines I wrote and trained myself |
| A book-tracking site | the [reading log](/reading/) and the reviews on this site |

None of these are better products than the ones they replaced, measured the way products are measured. Manabi has one user who matters. Kishi's board is quieter than any chess app, on purpose. My reading log has no social feed and no reading challenge. What they have instead is that every one of them works the way I think it should, and when it does not, I change it.

That is the whole difference, and it turns out to be enormous. A streaming service decides what I watch next. A language app decides how I learn, and it decided long ago that streaks and gems were the way. When the app is mine, the decisions are mine, and making those decisions is the entertaining part.

## Why it is possible now

For most of my life this would have been a fantasy. Building a language app good enough to use every day is a year of evenings. Writing three game engines and the training loop behind them is a winter, at least. Nobody with a day job does five of those for fun.

What changed is that agents write most of the code now. I wrote about the feeling in [Ideas stop waiting](/notes/ideas-stop-waiting/): Kishi, which would have been a winter of evenings, was done in a month beside a day job. The bottleneck moved from typing the thing to deciding what it should be, and deciding what it should be is precisely the part I enjoy. I called that [power, in the good sense](/notes/power-in-the-good-sense/): not power over anyone, but the plain capability to make a thing exist.

There is an ownership argument too, the one Nassim Nicholas Taleb makes in *Skin in the Game*, which I wrote about in [The Phrase That Stayed](/articles/review-skin-in-the-game/). When I rent my entertainment, someone else owns the outcome. When I build it, I do, including the bugs, and I find I like it much better that way.

## Why it is more fun

Consuming is pleasant and passive. You sit, it plays. Building is play with the rules themselves. Instead of learning Japanese the way an app thinks I should, I get to decide how reading should be taught and then find out whether I was right. Instead of playing chess against an engine, I get to [teach an engine to play](/articles/learning-to-play/) and watch it beat the version of itself from last week. And a strategy game of my own means sitting with the question that every good one answers, [who may act, when, and at what cost](/notes/board-games-already-solved-agent-coordination/), and answer it my way.

The games I loved most were always the ones with systems you could see into. My [GOAT list](/notes/goat-games/) is full of them, from Phantasy Star Online to Anno 1602. Building a game is the same pleasure from the other side of the table: you are not discovering how the world works, you are deciding it.

## The polymath part

There is a second half to this. Building is not only how I play now; it is how I learn.

I have always been interested in far more fields than one career leaves room for: life science, neuroscience, game development, simulation, mathematics, machine learning, robotics, space. For most of my life that curiosity ended at the bookshelf. Reading about a field is one thing; doing anything in it took a lab, a team, or years. Now it takes a project, and the project teaches me the field because the thing has to work.

| A field I always wanted to get into | What I built or wrote to get in |
|---|---|
| Life science and microbiology | [Cyanea](https://cyanea.bio), bioinformatics notebooks that re-run in the browser; reviews of [How Life Works](/articles/review-how-life-works/) and [A Brief History of Intelligence](/articles/review-a-brief-history-of-intelligence/) |
| Neuroscience | [Hotaru](https://hotaru.raskell.io), simulated neuron cultures playing Pong, after the [DishBrain experiment](https://doi.org/10.1016/j.neuron.2022.09.001) |
| Simulation | [Terrarium](https://terrarium.raskell.io), where LLM agents form societies, and Waterfront |
| Game development | Paw & Claw, [Rainbow River](https://rainbowriver.raskell.io), Waterfront |
| Mathematics, machine learning, game AI | Kishi and the [Learning to Play](/articles/learning-to-play/) series |
| Robotics | [RoboGym](https://github.com/raskell-io/robogym), robot training in the browser, still very early |
| Smell, of all things | the note [Smell is pattern recognition](/notes/smell-is-pattern-recognition/) |
| Space and aeronautics | so far only the [reading log](/reading/) |

The [map](/map/) of this site shows the same thing from above: one person's interests as a graph, with projects and reading and writing joined wherever they touch. When I [started the map](/articles/this-site-is-becoming-a-map/) I thought of it as a way to organise writing. It has turned into the most honest description of what I do with my evenings.

The obvious objection is breadth without depth, the dilettante who knows a little about everything. I take it seriously, and my answer is that building is a strong cure for it. Reading lets you believe you understand a field. A simulation of neurons that refuses to learn, or an engine that loses 176 Elo to one constant you forgot to fit, does not let you believe anything. The thing either works or it shows you exactly where your understanding ran out.

## What it is not

It is not a productivity system. I am not optimising my evenings; I am enjoying them. It is not a moral position against Netflix either. People who love films should watch films.

There are real costs, and I would rather name them. Nobody watches my apps with me, so the shared culture of a series everyone is talking about passes me by. Building takes more energy than watching, and on a tired evening the honest choice is to read or sleep, not to open an editor. And there is a risk I watch for: tinkering forever, building tools to build tools, never finishing anything anyone else can use. My guard against that is to ship. Most of what is in the tables above is online and free to use, unfinished in places, and real enough that other people can find its faults.

I used to think of entertainment as something I bought. It turns out it is something I make, and for the first time the making is cheap enough to be the fun part.

## References

- Brett J. Kagan and others, [In vitro neurons learn and exhibit sentience when embodied in a simulated game-world](https://doi.org/10.1016/j.neuron.2022.09.001), Neuron 110(23), 3952 to 3969, 2022. The DishBrain experiment behind Hotaru.
- Nassim Nicholas Taleb, [Skin in the Game: Hidden Asymmetries in Daily Life](https://en.wikipedia.org/wiki/Skin_in_the_Game_(book)), Random House, 2018.
- Hothouse Creations, [Gangsters: Organized Crime](https://en.wikipedia.org/wiki/Gangsters:_Organized_Crime), Eidos Interactive, 1998.
- My own earlier notes this piece builds on: [Ideas stop waiting](/notes/ideas-stop-waiting/), [Power, in the good sense](/notes/power-in-the-good-sense/), [My GOAT games](/notes/goat-games/), and [This Site Is Becoming a Map](/articles/this-site-is-becoming-a-map/).
