+++
title = "How CRISPR works"
date = 2026-11-14
draft = true
description = "Bacteria keep mug shots of the viruses that attacked them, and Cas9 uses them to cut. A 3D model to step through, from the discovery to the tool."

[taxonomies]
tags = ["genetics", "synthetic-biology", "life-sciences", "history-of-science"]

[extra]
reads = ["the-code-breaker"]
+++

Chapter 9 of Walter Isaacson's *The Code Breaker*, "Clustered Repeats", tells how CRISPR was found, and I wanted to see the mechanism rather than only read about it. So I built a model of it. Step through it below, or press play and watch, and drag to turn it.

{{ crispr_3d() }}

The history is the best part of the chapter. In 1987 a Japanese doctoral student, Yoshizumi Ishino, noticed an odd pattern while sequencing a gene in *E. coli*: short identical stretches of DNA repeated at regular intervals, with different stretches in between. He mentioned it in the last lines of his paper, said nobody knew what it was for, and moved on. A few years later Francisco Mojica, a graduate student in Alicante studying microbes that live in salt ponds, found the same pattern, first assumed he had made a mistake, and then spent a decade trying to explain it with little funding and much advice to stop.

The answer came in August 2003, when he ran the spacers through a database and found that they matched the DNA of viruses that attack those bacteria. Bacteria, it turned out, have an immune system that remembers. Journals were slow to believe it; the paper took until 2005 to appear. Two food scientists at the Danish company Danisco, Rodolphe Barrangou and Philippe Horvath, confirmed it in their collection of yogurt bacteria: strains collected after a virus attack carried new spacers that matched that virus. And in 2012 Jennifer Doudna and Emmanuelle Charpentier showed how the cutting works and that it can be programmed, which turned a bacterial defence into a tool for editing any DNA.

What I find most elegant is how little it takes. A library of short snippets, a way to copy them into guides, and one enzyme that compares a guide with whatever DNA it meets. The same pattern of matching a stored sample against what arrives is how a lot of security systems work, and it is a fine example of what I mean in [beautiful, and useful](@/notes/beautiful-and-useful.md): a curiosity about salt-loving microbes that turned, years later, into one of the most useful tools in biology.

## References

- Walter Isaacson, *The Code Breaker* (2021), chapter 9, "Clustered Repeats", chapter 12, "The Yogurt Makers", and chapter 17, "CRISPR-Cas9".
- Francisco J. M. Mojica et al., "Intervening sequences of regularly spaced prokaryotic repeats derive from foreign genetic elements", *Journal of Molecular Evolution* 60, 2005.
- Martin Jinek, Krzysztof Chylinski, Ines Fonfara, Michael Hauer, Jennifer A. Doudna, and Emmanuelle Charpentier, [A programmable dual-RNA-guided DNA endonuclease in adaptive bacterial immunity](https://pubmed.ncbi.nlm.nih.gov/22745249/), *Science* 337, 816 to 821, 2012.
