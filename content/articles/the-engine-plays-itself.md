+++
title = "The Engine Plays Itself"
date = 2026-10-28
draft = true
description = "Self-play as reinforcement learning: the engine makes its own training data, a network learns to predict the outcome, and one unfitted constant cost 176 Elo."

[taxonomies]
tags = ["game-ai", "self-play", "reinforcement-learning", "training-data", "rust"]
series = ["learning-to-play"]

[extra]
author = "Raffael"
in_short = [
  "With no games database and no budget, *Kishi* makes its own training data: the engine plays itself, records positions and its search scores, and writes each game result back onto every position.",
  "This counts as reinforcement learning because every label comes from the engine's own play, with a training target that blends the search score with the actual game result as the corrective signal.",
  "The first network lost badly despite good training and validation loss, because the scaling constant K was set to the half-remembered 400 from the Elo formula instead of being fitted to the data.",
  "Refitting K to the games turned a losing network into a winning one, a swing of 176 Elo; the scale of a model output is part of its interface, and only the arena could see that contract.",
  "Generation 1 beats the hand-written evaluation at equal nodes, but at equal time it is roughly level because the network makes each node slower, so the app still plays the table.",
]
+++

<!--
DRAFT NOTES (remove before publish)
1. Timings to measure and fill in: training generation 1 (30 epochs on 5.6M positions, 10 threads) and
   the 400-game arena at 20,000 nodes. Neither was recorded on 2026-10-22. `scripts/generation.sh`
   now prints both; take them from the generation 2 run.
2. The three equal-time matches: the notebook has them as −41 ± 47, −28 ± 50 and +22 ± 49 but not
   which settings each used; rerun one at 100 ms with 300 games and quote that one.
3. Validation loss with K = 400 against K = 165 would make the "the loss curve looked fine" point
   concrete; the K = 400 training log was not kept. Retrain once with --k 400 and keep the log.
4. Hero image, if the series gets them.
-->

> Part 4 of *Learning to Play.* Previous: [An Evaluation You Can Learn](/articles/an-evaluation-you-can-learn/). Next: Equal Nodes Is Not Equal Time.

Where do you get five million labelled chess positions when you have no games database and no budget? You make them. The engine plays itself, writes down what it saw and what it thought of it, and when the game ends eighty moves later, the result goes back onto every position in it. That is the whole idea, and it has a name, self-play. This part is the loop as Kishi runs it, what makes it reinforcement learning rather than curve fitting, and the one constant that turned a winning network into a losing one.

## The loop

Three programs, all in the Kishi repository under `tools/`, and a shell script that runs them in order.

{% diagram(title="One generation") %}
   +-------------+   positions, scores,   +-------------+   new network   +-------------+
   |   datagen   | ------ results ------> |    train    | --------------> |    arena    |
   |  self-play  |                        | predict the |                 | vs previous |
   +-------------+                        |   outcome   |                 | generation  |
          ^                               +-------------+                 +------+------+
          |                                                                      |
          +--------------- the stronger player plays the next games -------------+
{% end %}

Generation 0 is the hand-written evaluation from [part 2](/articles/three-parts-and-no-brain/). It plays the first games. A network learns from them and becomes generation 1. Generation 1 plays generation 0, and if it wins, it plays the next games, and so on. Each generation's data comes from a slightly better player than the last, and the network learns from the mistakes of the evaluation it replaces.

```sh
scripts/generation.sh 2 8000000     # train gen2 on gens 0 and 1's games, play gen1, then self-play 8M positions
```

## Making the data

`datagen` runs one game loop per thread. Each game starts with eight or nine random legal moves, so that the engine does not play the same opening fifty thousand times, kept only if a quick search says the position is within two and a half pawns of equal, so that the data is not full of lost positions. Then the engine plays both sides, about 5,000 search nodes a move, and after every move it writes a record if the position is worth learning from: not in check, the best move quiet rather than a capture, the score not a mate. Those are the positions the evaluation is actually asked about during a search; the noisy ones are the search's job to resolve, not the network's.

Games end by the rules, or early when the outcome is no longer in doubt: a score beyond twenty pawns for six plies in a row is a win, a score within eight centipawns for twelve plies after move 80 is a draw. When a game ends, its result is written into every record it produced. A record is 32 bytes:

| Bytes | Content |
|---|---|
| 8 | which squares are occupied, as a bitboard |
| 16 | a nibble per occupied square, in order: which piece |
| 2 | the search's score, in centipawns |
| 1 | the result: loss, draw or win, from white's view |
| 1 | the side to move |
| 4 | spare |

Castling rights and en passant are not stored; the network has no inputs for them. Generation 0 on ten cores:

```text
$ datagen --brain hce --out data/gen0.bin --threads 10
5579892 positions, 57046 games (+19383 =17752 -19911), 1795 pos/s
```

Fifty-two minutes for 5.6 million positions from 57,000 games, a third of them won by white, a third drawn, a third won by black. The file is 178 megabytes and can be appended to, so a run can be stopped when the laptop is needed and resumed overnight.

## Why this is reinforcement learning

It is worth being precise about what kind of learning this is, because the words get used loosely.

Nothing in the data came from a human. No games database, no opening book, no annotated positions. Every label is a consequence of the engine's own choices, and the signal that tells the network it was wrong is the result of a game it played. That is the defining property of reinforcement learning: the agent learns from the outcomes of its own actions. The agent here is the whole engine, search plus evaluation, and the part that learns is the evaluation.

The target the network is trained towards is a blend of two things. One is the search's own score for the position, turned into a probability of winning. The other is what actually happened in the game.

```text
target = (1 − wdl) · sigmoid(score / K) + wdl · result        result ∈ {0, ½, 1}
loss   = mean over positions of (sigmoid(network(position) / K) − target)²
```

If you have read about temporal-difference learning, the first term is the bootstrapped estimate: the current evaluation, improved by a few plies of lookahead, standing in for the truth. The second is the Monte Carlo return, the truth itself, arriving eighty moves late and very noisy. Kishi uses `wdl = 0.3`: mostly the search's judgement, corrected by what actually happened. Pure results would be too noisy to learn from at this volume; pure search scores would only teach the network to imitate the evaluation that produced them, which cannot make it better. The result is the reinforcement signal, and it is what lets generation 1 know things generation 0 did not.

It is also worth saying what this loop is not. AlphaZero's loop trains two outputs, a value and a policy, and the policy target comes from the search's visit counts, so the search teaches the network which moves to look at as well as who is winning. Kishi's chess network has no policy. The search decides what to look at with its ordinary heuristics, and the network only answers how good a position is. That is the right division for a game where alpha-beta works; the other loop belongs to Go, and part 8 builds it.

## Training

`train` loads every record into memory, shuffles once, and holds out one percent for validation. Then thirty epochs of Adam at a batch size of 16,384, with the learning rate following a cosine from 0.001 down to a fiftieth of that. Each batch is split across threads with their own gradient buffers, summed at the end. The gradients are checked against finite differences in a test, which is the single most useful test in the repository, because a wrong gradient does not crash, it just learns slowly and badly. At the end the trainer quantises the network as [part 3](/articles/an-evaluation-you-can-learn/) describes, and prints how far the integer network is from the float one.

Nothing in that paragraph is specific to chess, and I want to resist making it sound more than it is. It is regression with a sigmoid on the output, on 5.6 million rows of 768 sparse binary features. The reason it runs in minutes on a laptop rather than hours on a GPU is that the first layer is sparse, at most 32 active inputs per row, and the whole network is a million parameters.

## The constant that cost 176 Elo

The first network I trained lost. On the same data that later produced a winner, against the hand-written evaluation it was supposed to replace, at equal search nodes:

```text
nnue vs hce: +113 =71 -216  elo -91.5 ± 31.8
```

The training loss had gone down steadily. The validation loss had followed it. The quantisation error was two centipawns. By every number the trainer printed, the network was fine, and it lost by 90 Elo, and two more variants with a smaller hidden layer and different epochs lost by 45 and 89.

The constant in the formula above, `K`, is the scale that turns a score in centipawns into a probability. I had set it to 400, which is a number everyone in this field half-remembers: it is the constant in the Elo formula, where 400 rating points mean ten-to-one odds. It has nothing to do with centipawns. The right question is: in these games, how many centipawns of search score correspond to what probability of winning? That is a property of the data, and you can fit it. The K under which `sigmoid(score / K)` best predicts the recorded results of generation 0's games is 165.

Retrained with `K = 165`, same data, same network, same everything else:

```text
nnue vs hce: +217 =62 -121  elo +85.0 ± 32.2
```

A swing of 176 Elo from one constant. Why so much? A network trained with the wrong K still learns the right ordering of positions, but its outputs come out on the wrong scale, by a factor of about 400 over 165. And the search, remember, is a pile of bets with margins in centipawns: prune if the evaluation is 75 per ply above the target, razor if it is 250 per ply below, extend if one move is clearly better than the rest. Those margins were tuned against an evaluation that speaks PeSTO's centipawns. Feed them a number that is two and a half times too large and every bet fires at the wrong moment. The network was not wrong about chess. It was speaking a different dialect to a search that could not tell.

Two lessons, and they are the ones I would carry to any learned component that plugs into a hand-tuned system. The scale of a model's output is part of its interface, and the consumer's assumptions about that scale are a contract the trainer is party to whether it knows it or not. And the training loss cannot see the contract. Only the arena could.

## Does it win?

At equal nodes, 400 paired games at 20,000 nodes a move, generation 1 beats the hand-written evaluation by 85 ± 32. The network learned something about chess from 57,000 games that 768 numbers twice could not hold, and it took an afternoon.

At equal time it is a different story. [Part 3](/articles/an-evaluation-you-can-learn/) ended with the tax: a node costs two and a half times more with the network. In matches at 100 milliseconds a move, where the engine with the table searches two and a half times as many positions, the three results I have lie between −41 and +22 Elo, all with error bars of about 50. Generation 1 is about as good as the thing it replaced, when the clock is running. The app still plays the table.

That is the honest state of the loop after one generation, and it is the right place to stop this part, because it is exactly the question the next one is about: what more generations, more data and the speed tax do to each other, and what it takes for a network to earn its place on a phone.

## What it cost on the laptop

| | |
|---|---|
| Generation 0's games, 5.6M positions | 52 minutes on ten cores |
| Training generation 1, 30 epochs | minutes (to be measured and filled in) |
| The arena, 400 games at 20,000 nodes | (to be measured and filled in) |
| Generation 1's games, 8M positions | about three hours at 720 positions a second |
| The lesson about K | one afternoon and three losing networks |

A self-play loop is a machine for turning electricity into rating points, and a constant you did not fit runs it backwards.

## References

- Richard Sutton and Andrew Barto, [Reinforcement Learning: An Introduction](http://incompleteideas.net/book/the-book-2nd.html), second edition, chapter 6 for temporal-difference learning.
- David Silver and others, [A general reinforcement learning algorithm that masters chess, shogi, and Go through self-play](https://www.science.org/doi/10.1126/science.aar6404), Science (2018), for the other loop.
- [Kishi](https://github.com/raskell-io/kishi): `tools/src/bin/datagen.rs`, `tools/src/bin/train.rs`, `tools/src/bin/arena.rs`, `scripts/generation.sh`, and `nets/LOG.md` for every generation's result.
