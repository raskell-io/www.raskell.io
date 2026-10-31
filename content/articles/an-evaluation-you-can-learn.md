+++
title = "An Evaluation You Can Learn"
date = 2026-10-27
draft = true
description = "NNUE from scratch: a piece-square table with a hidden layer, updated two rows at a time, quantised to integers, fast enough for a million calls a second."

[taxonomies]
tags = ["game-ai", "neural-networks", "machine-learning", "rust"]
series = ["learning-to-play"]

[extra]
author = "Raffael"
in_short = [
  "A chess engine calls its evaluation about a million times a second, so a learned replacement must answer in well under a microsecond on a CPU, which is what led to NNUE.",
  "Kishi's network is the hand-written piece-square table with one hidden layer of 512 units added, so pieces can interact, and the board is fed in twice, once from each side's view, with shared weights.",
  "The design is efficiently updatable: a move changes only a few inputs, so the engine adds and subtracts two rows of weights instead of recomputing, and the hidden layer costs almost nothing per node.",
  "Quantising the first layer to integers suits browser SIMD, while keeping the output layer in floats cut the error from about 12 centipawns to about 2, in an 820 KB network embedded in the WebAssembly module.",
  "The network makes each node about two and a half times slower than the table, so it must be better by enough to make up for seeing fewer positions, a question later parts of the series answer.",
]
+++

<!--
DRAFT NOTES (remove before publish)
1. Check the Rust fragments against engine/src/nnue.rs before publishing: the names are Kishi's, the
   bodies are shortened to the idea.
2. Measure and fill in: nodes per second with PeSTO and with the network, one core (`kishi bench` with
   `--hce` and with `--net nets/gen1.nnue`). The 2.5× in the text is from self-play throughput (1,790
   against 720 positions a second), which is the same ratio but a different measurement.
3. Hero image, if the series gets them.
-->

> Part 3 of *Learning to Play.* Previous: [Three Parts and No Brain](/articles/three-parts-and-no-brain/). Next: [The Engine Plays Itself](/articles/the-engine-plays-itself/).

A chess engine asks its evaluation function for a number about a million times a second. Any network that replaces the hand-written one has to answer in well under a microsecond, on a CPU, with no batching, and eventually inside a browser tab on a phone. That budget shaped everything in this part more than the mathematics did, and the design it produced is the one every strong CPU engine has converged on since 2020. It is called NNUE, and it is less exotic than its name.

## A table with a hidden layer

[Part 2](/articles/three-parts-and-no-brain/) ended on a number. PeSTO, the hand-written evaluation, is 768 weights: one for each of twelve piece types on each of 64 squares. Evaluating a position means adding up the weights of the pieces that are on the board. Written as a network, that is 768 inputs, each 0 or 1, one output, and no hidden layer. A linear model.

Its limit is that nothing interacts. A knight on f5 is worth the same with or without a pawn on e6 behind it, a rook on an open file is worth the same as one behind its own pawns, and a king with three pawns in front of it is worth what the king table says for that square. Every chess player knows these are not the same, and no table can say so, because a table has one weight per piece and square and no way to combine them.

One hidden layer fixes that in principle. A hidden unit can read several inputs, so it can learn "knight on f5 and pawn on e6" as a thing with its own value. Kishi's network has 512 of them, which turns out to be enough to beat the table.

{% diagram(title="The network") %}
   768 inputs                512 hidden               8 outputs, one used
   one per piece on a        the same weights for     chosen by how many
   square, from the side     both views               pieces are left
   to move's view
   [ 0 1 0 0 ... 1 0 ]  --->  [  512 ]  ---> clamp, square ---+
                                                              +---> ( eval )
   [ 0 0 1 0 ... 0 1 ]  --->  [  512 ]  ---> clamp, square ---+
   the same position
   from the other side
{% end %}

Two things in the picture are not obvious, and they are the whole design.

## Two views of one board

The first is that the board goes in twice. Once as the side to move sees it, once as the opponent sees it, and the opponent's view is the board flipped vertically with the colours swapped. Flipping a square is `square ^ 56`. The same 768 × 512 weights serve both views, so a white knight on g1 seen by white and a black knight on g8 seen by black are the same input and get the same treatment. The network does not have to learn chess twice, once per colour.

The feature index for a piece, from a viewer's side, is three numbers packed together: whose piece it is relative to the viewer, what kind, and where.

```rust
// (colour relative to the viewer) × 384 + kind × 64 + square, with the
// board flipped for the viewer on the other side.
fn feature(viewer: Color, piece: Piece, sq: Square) -> usize {
    let (ours, sq) = match viewer {
        Color::White => (piece.color() == Color::White, sq),
        Color::Black => (piece.color() == Color::Black, sq ^ 56),
    };
    (!ours as usize) * 384 + piece.kind() as usize * 64 + sq as usize
}
```

The output layer then reads the side to move's 512 values first and the opponent's second, so it can learn that the same material counts for more when it is your turn.

## Efficiently updatable

The second thing is the reason the design works at a million calls a second, and it is in the name: efficiently updatable. A position has at most 32 pieces, so at most 32 of the 768 inputs are 1. The hidden layer's input is the sum of at most 32 rows of the weight matrix plus a bias. That is already cheap. What makes it fast is that the search never evaluates a position from nothing. It evaluates the position it just made a move in, and a move changes two inputs.

{% diagram(title="One move, two rows") %}
   accumulator, 512 numbers       knight g1 -> f3
   ---------------------------    -----------------------------------
   before: the rows of every      - row[our knight, g1]
           piece on the board,    + row[our knight, f3]
           summed                 -----------------------------------
   after:  the same sum with      2 × 512 additions, instead of
           two rows swapped       summing 32 rows again
{% end %}

A quiet move subtracts one row and adds one. A capture subtracts two and adds one. Castling moves two pieces. Kishi fuses the subtractions and additions into a single pass over the changed rows, per view, and keeps one accumulator per ply on a stack, so going back up the tree is free: the parent's accumulator is still there. With 16-bit integers and NEON, two rows of 512 are a few dozen instructions. The hidden layer, which looks like the expensive part of the network, costs almost nothing per node. All the work is in the output layer.

## Clamp, square, sum

The non-linearity between the layers is a squared clipped ReLU: `clamp(x, 0, 1)²`. Clipping is what makes integers work, because a value that can never leave 0 to 1 can be stored in a byte's worth of range. Squaring is what the engine community found to fit better than the plain clip in this family of networks, and it is still one multiply.

The output layer is 1,024 weights and a bias: the side to move's 512 squared values, then the opponent's. There are eight of these output layers, and the engine picks one by how many pieces are left on the board. A network with one output has to find one set of weights that works in the opening and the endgame. Eight small heads let it have different opinions about a bishop with 28 pieces on the board and with 6, for 32 kilobytes of extra weights and no extra time.

```text
eval = ( Σ clamp(a, 0, 255)² × w / 255² + b ) × 400
```

The 400 is a scale, so that the network's output, which is trained as a probability, comes out in centipawns. Hold that number too; it has a part to play in [part 4](/articles/the-engine-plays-itself/).

## Quantisation

The trainer works in 32-bit floats. The engine does not want them. Floats are fine on the M4, but the browser's SIMD is 128 bits wide, and sixteen 8-bit lanes or eight 16-bit lanes per instruction beats four floats. The first layer's weights and biases are therefore multiplied by 255 and stored as 16-bit integers, the accumulator is 16-bit, the clamp is to 0 to 255, and the square is exact in 32 bits.

The output layer is where I stopped. Rounding its 1,024 weights to 16-bit integers put the integer network about 12 centipawns away from the float network it was trained as, on average over the validation set. Keeping that one layer in floats brought it to about 2. The trainer reports the gap after every run, so a quantisation that quietly damages a network shows up as a number, not as a lost match three days later. The output layer runs as one float multiply-add per input, sixteen lanes at a time, with NEON on the laptop and `simd128` in WebAssembly.

The whole network is 820,268 bytes: a magic number, two sizes, 786,432 first-layer weights, 1,024 biases, 8 × 1,024 output weights and 8 biases. The chess engine includes it at compile time with `include_bytes!`, so the WebAssembly module the browser downloads has the network inside it, and there is nothing to fetch and nothing to version separately.

## Where it comes from

None of this is new, and the lineage matters for the series. Yu Nasu published the design in 2018 for computer shogi, where hand-written evaluations had run out of road years earlier, and the shogi engines of the YaneuraOu family ran with it. In 2020 Hisayori Noda ported it to Stockfish, and Stockfish 12 shipped with a network instead of its hand-written evaluation and gained around 80 Elo at once. Every strong CPU engine has used some form of it since.

The original features were not Kishi's 768. Nasu's networks indexed every piece by where its own king stood, so that "a gold on 5h" is a different input for each of the 81 squares the king can be on, and the king's safety becomes something the first layer can see. Kishi's network is the plainest member of the family, with no king in the index at all. That is deliberate for the chess parts: it is the smallest thing that can beat the table, and it is the one to understand first. King-relative features come back in part 6, where the game they were invented for needs them.

## The tax

One number from this part has to be paid for by the rest of the series. With the network, each node of search costs about two and a half times what it costs with the table. Self-play throughput, which is dominated by search, fell from 1,790 positions a second to 720 on the same cores when the engine switched from PeSTO to the first trained network. In the same time, the engine with the network sees forty percent of the positions.

So the network cannot just be better than the table per position. It has to be better by enough to make up for seeing two and a half times fewer positions, or the engine with the network loses to the engine without it, in the only measurement that matters, which is a game on a clock. Whether a network trained on a laptop clears that bar is the question [part 4](/articles/the-engine-plays-itself/) sets up and part 5 answers.

## What it cost on the laptop

| | |
|---|---|
| Inference | a few hundred lines of Rust: features, accumulators, the output layer, the file format |
| Network file | 820 KB, embedded in the WebAssembly module |
| Per node | about 2.5 × the hand-written evaluation |
| Quantisation error | about 2 centipawns, measured by the trainer after every run |

The network is 820 kilobytes and a few hundred lines of Rust. Everything hard about it is the question of what to train it on.

## References

- Yu Nasu, [Efficiently Updatable Neural-Network-based Evaluation Functions for Computer Shogi](https://www.apply.computer-shogi.org/wcsc28/appeal/the_end_of_genesis_T.N.K.evolution_turbo_type_D/nnue.pdf) (2018, in Japanese).
- Stockfish, [Introducing NNUE Evaluation](https://stockfishchess.org/blog/2020/introducing-nnue-evaluation/) (September 2020).
- [NNUE](https://www.chessprogramming.org/NNUE), Chess Programming Wiki.
- [Kishi](https://github.com/raskell-io/kishi): `engine/src/nnue.rs`, and `engine/docs/nnue.md` for the file format.
