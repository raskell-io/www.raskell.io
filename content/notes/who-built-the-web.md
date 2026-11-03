+++
title = "Who built the web"
date = 2026-11-03
description = "A companion piece to Tim Berners-Lee's This Is for Everyone: who built the web, where they worked, and which idea led to which product."
draft = true

[taxonomies]
tags = ["history-of-technology", "hypertext", "open-data", "decentralisation", "training-data"]

[extra]
reads = ["this-is-for-everyone"]
+++

After drawing [who contributed to AI](@/notes/who-contributed-to-ai.md), I wanted to know whether the same two figures work for another story. So I went back to Tim Berners-Lee's [*This Is for Everyone*](@/articles/the-web-was-the-training-set.md), written with Stephen Witt. It is one person's account, and the figures inherit that: they show the web as he tells it, with him at the centre of most ties. Memoirs also rarely say when other people changed jobs, so the careers the book does not date come from the web, each with its source linked.

Each lane is a person, each bar a place they worked. Choose a person to draw their ties to the others; choose an organisation or a place to see everyone who passed through it. The band on top holds the ideas, the products, and the turns that moved the story. It starts in 1945, with Vannevar Bush's essay on linked documents, and squeezes the years before 1989.

{{ people_timeline(data="static/data/web-people.json") }}

## From idea to product

The second figure sorts the ideas and products into fields, with the eras of the web on top. Each arrow says that one thing built on another. Berners-Lee wrote a program called Enquire at CERN in 1980 and proposed the web nine years later, dropping the fixed categories Enquire had required. The arrows into the web are fewer than you might expect: he says that when he first conceived it he had never heard of Ted Nelson or Douglas Engelbart, so the line from Bush through Xanadu to the 1968 demonstration runs beside the web, and does not lead into it.

{{ idea_lineage(data="static/data/web-people.json") }}

The figure ends where the AI one begins. The web's text went into Common Crawl, founded in 2008; OpenAI's researchers turned to it to train GPT, and ChatGPT reached the public in 2022. I wrote about that in my [review of the book](@/articles/the-web-was-the-training-set.md).

The data behind both figures is a dataset of its own, with a page on what each record holds and where it comes from: [People of the World Wide Web, 1945 to 2026](@/data/web-people.md).

## References

- Tim Berners-Lee with Stephen Witt, *This Is for Everyone: The Unfinished Story of the World Wide Web* (Macmillan, 2025).
