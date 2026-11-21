---
title: "Smell is pattern recognition"
url: https://raskell.io/notes/smell-is-pattern-recognition/
author: Raffael Schneider
date: 2026-11-21
description: "Max Bennett explains neural networks with the nose. For the brain, smell is the easiest pattern to recognise; for machines, the hardest sense to build."
tags: [olfaction, neural-networks, neuroscience, evolution, intelligence]
---

# Smell is pattern recognition

Chapter 7 of Max Bennett's *A Brief History of Intelligence*, "The Problems of Pattern Recognition", explains neural networks with the nose, and that is why I am writing this down. I love everything that goes through the nose: I keep a fragrance collection, I cook mostly for taste, I like wine and spirit tastings, cocktails, and the craft of essential oils and aromas. It is a pleasure to find smell at the centre of a book about intelligence.

Bennett's point is simple. There is no molecule for pulled pork. A smell is a mixture of many molecules that activates a pattern across many kinds of olfactory neurons; the lamprey, his model for the first vertebrates, has about fifty. So, in his words, "smell recognition is nothing more than pattern recognition." Earlier animals recognised the world one neuron at a time: one cell for light, one for touch. The first vertebrates, some five hundred million years ago, learned to read the pattern instead, and fifty cells can make more patterns than any animal will ever meet.

Reading a pattern raises two problems, and Bennett draws both as smells:

| Problem | The smell version | How the cortex may solve it |
|---|---|---|
| Discrimination | A predator and a meal activate overlapping neurons, but one means flee and the other means approach. | Expansion and sparsity: a few olfactory neurons feed many cortical neurons, each wired to only some of them, so overlapping inputs become separate patterns. |
| Generalisation | The same predator never smells exactly the same twice: another age, another diet, another background. | Auto-association: cortical neurons wire to each other, so a partial pattern brings back the whole memory. |

Then he builds the machine version, still with smells. To train a network to tell eggs from flowers, you show it labelled examples, measure the error at the output, and nudge every weight a little in the right direction, millions of times. That is backpropagation, popularised in the 1980s by Geoffrey Hinton, David Rumelhart and Ronald Williams. Hinton keeps turning up in what I read; he is all over *Empire of AI*, and by now he feels like the grandfather of the field. Bennett opens his introduction with a Hinton quotation and comes back to him in chapter 11 with the Helmholtz machine. He also reports that Hinton himself saw backpropagation as a poor model of the brain: a child tells an egg from a strawberry before knowing either word, and no brain can adjust millions of synapses at once by exactly the right amount.

The detail I liked most is in an endnote. Smell has no invariance problem. A face looks different from every angle and distance, but an egg releases the same molecules wherever it sits, so it activates the same olfactory neurons. And smell is the one sense that skips the thalamus and goes straight to the cortex. Bennett suggests the two facts may be connected: the thalamus might be what the other senses need to recognise things that are rotated, moved, or scaled.

That gives me a way to put my own belief more precisely. I believe smell will be the last sense we learn to read and write with machines. Not the last we understand, but the last for which we build input and output devices as ordinary as a camera and a screen, a microphone and a speaker. For the brain, smell is the easiest pattern problem. For engineers, it is the hardest, and the difficulty is in the instruments, not in the recognition. Sight compresses well: three kinds of cones, so three channels in, three primaries out. Smell has no such shortcut. Bennett notes that rats carry more than a thousand olfactory receptor types, and an output device cannot mix every scent from three cartridges. It has to put the actual molecules into the air.

There is progress, and the recognition side is moving first, as the chapter would predict. In 2023, a team from Osmo and the Monell Chemical Senses Center published a principal odor map in *Science*: a graph neural network that predicts from a molecule's structure how it will smell, and matched human panelists at describing odors in words. In 2024 Osmo reported a "scent teleportation": a plum measured by gas chromatography and mass spectrometry, turned into a formula, and reprinted by a machine. That is the company's own account, and it is a laboratory, not a device in a pocket. Recognising a smell from data is starting to work. Writing one back into a room is still chemistry. I would bet that a phone that can play a perfume as easily as a song will come after everything else on the list.

More on the book in my review, [A Brief History of Intelligence](https://raskell.io/articles/review-a-brief-history-of-intelligence/).

## References

- Max Bennett, *A Brief History of Intelligence* (2023), chapter 7, "The Problems of Pattern Recognition", and its endnotes; chapter 11 for the Helmholtz machine.
- Brian K. Lee, Emily J. Mayhew, et al., "A principal odor map unifies diverse tasks in olfactory perception", *Science* 381 (2023), [doi:10.1126/science.ade4401](https://doi.org/10.1126/science.ade4401); press release by the Monell Chemical Senses Center on [EurekAlert](https://www.eurekalert.org/news-releases/999716).
- Osmo, "[Teleporting scent](https://www.osmo.ai/blog/teleporting-scent)", the company's account of the plum reprint.
