---
title: "People of the AI labs, 1955 to 2026"
url: https://raskell.io/data/ai-people/
author: Raffael Schneider
date: 2026-11-01
description: "Who worked where in AI and when, why they left, how they were tied to each other, and the ideas and turns around them, from two books."
tags: [research-labs, technology-races, history-of-technology, machine-learning]
data: https://raskell.io/data/ai-people.json
format: JSON
licence: "CC BY 4.0"
licence_url: https://creativecommons.org/licenses/by/4.0/
sources:
  - {title: "Empire of AI: Dreams and Nightmares in Sam Altman's OpenAI", author: "Karen Hao", publisher: "Penguin Press", year: "2025", isbn: "9780593657508"}
  - {title: "The Infinity Machine: Demis Hassabis, DeepMind, and the Quest for Superintelligence", author: "Sebastian Mallaby", publisher: "Penguin Press", year: "2026", isbn: "9780593831847"}
reads: [empire-of-ai, the-infinity-machine]
---

# People of the AI labs, 1955 to 2026

This is the data behind the figure in my note [Who contributed to AI](https://raskell.io/notes/who-contributed-to-ai/): the people who carried the idea of a learning machine from the 1950s to the labs of today, where each of them worked and when, and how they were tied to one another. I compiled it while reading Karen Hao's *Empire of AI* and Sebastian Mallaby's *The Infinity Machine* back to back, and I am publishing it on its own so that you can draw something else from it.

*[An interactive figure (people timeline) is drawn here on the HTML page; its data: https://raskell.io/data/ai-people.json.]*

## What a record is

The file is one JSON object. The core of it is 31 people. Each person has an `id`, a `name`, a one-line `summary`, a `url` to read more, and a list of `stints`. A stint is one role at one organisation: `org`, `role`, `start`, `end` (null while it lasts), `place`, and `left`, a sentence on why it ended. There are 126 stints in all.

Around the people sit four more parts:

- `orgs`: 101 labs, companies, universities and funders, keyed by id, each with a name, a kind, the year or month it was founded, its place, and a short note.
- `places`: 22 places, from the Bay Area to London and Toronto, so that a stint can be drawn where it happened.
- `links`: 67 ties between two people, with a `kind` (mentor, ally, rival, cofounders, and a few rarer ones), a date, and a note.
- `moments`: 265 ideas, products and events, each with a date, a title, a detail, and the people and organisations it involves.

Dates are `YYYY`, `YYYY-MM` or `YYYY-MM-DD`, as precise as the source allows and no more. The `about` object at the top of the file repeats the title and the licence and describes the main fields, so the file still makes sense when it travels without this page. `range` says which years the figure draws, and where its compressed early decades end.

## Where each fact comes from

Every stint, tie and moment carries `src`: `hao`, `mallaby`, `web`, or more than one of them. Facts from a book carry `ref`, the chapter they come from, so that you can check them against your own copy. Facts I took from outside the books were checked on the web, and each of them carries the `url` I checked it against.

## How I compiled it

I read both books in full and wrote every fact down in my own words, with the chapter it comes from. The summaries, roles, reasons for leaving and moment details are my sentences, not the authors'. Before publishing I ran a check against the text of both books, and no run of eight words in this file is copied from either of them.

## What it does not cover

The cast is the one the two books follow, so it leans towards OpenAI, DeepMind and the people around them. Many who did important work in the field are missing because neither book is about them, and I did not add people the books do not discuss. The ties are the ones the books describe; two people without a tie here may still have known each other well. A `left` field is my summary of what the source says, not a verdict on what happened.

## Portraits

Twenty of the people have a portrait. The portraits come from Wikimedia Commons under their own licences; each person's `photo_credit` names the photographer, the licence and the Commons page. They are not covered by the licence of this dataset; reuse them under their own terms.

## Using it

The data is under CC BY 4.0. Use it, change it, draw it differently. Credit it as Raffael Schneider, "People of the AI labs, 1955 to 2026", raskell.io, and link this page or the file at [/data/ai-people.json](https://raskell.io/data/ai-people.json).
