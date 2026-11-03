+++
title = "People of the World Wide Web, 1945 to 2026"
date = 2026-11-03
description = "Who worked where on the web and when, how they were tied to each other, and which idea led to which product, from Tim Berners-Lee's memoir."
draft = true

[taxonomies]
tags = ["history-of-technology", "hypertext", "open-data", "decentralisation", "training-data"]

[extra]
file = "data/web-people.json"
licence = "CC BY 4.0"
licence_url = "https://creativecommons.org/licenses/by/4.0/"
counts = ["people", "orgs", "links", "moments", "lineage"]
reads = ["this-is-for-everyone"]
sources = [
  { title = "This Is for Everyone: The Unfinished Story of the World Wide Web", author = "Tim Berners-Lee with Stephen Witt", publisher = "Macmillan", year = 2025, isbn = "9781035023677" },
]
+++

This is the data behind the two figures in my note [Who built the web](@/notes/who-built-the-web.md). It has the same shape as [People of the AI labs](@/data/ai-people.md).

{{ people_timeline(data="static/data/web-people.json") }}

{{ idea_lineage(data="static/data/web-people.json") }}

## Where it comes from

The ideas, products, events and ties come from one book, Tim Berners-Lee's memoir, and each carries its chapter in `ref`. That makes this one participant's account, not a neutral history: the ties mostly run through him, and where a disagreement appears, it is his side of it.

A memoir rarely dates other people's careers, so most stints come from Wikipedia and carry a `url`. A few dates that the book leaves open are also taken from the web, such as when Facebook and Spotify launched; those records list both sources. The `src` field says which applies to each record. A stint with a null `end` is either ongoing or not known to have ended.
