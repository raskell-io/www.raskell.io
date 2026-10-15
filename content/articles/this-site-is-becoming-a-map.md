+++
title = "This Site Is Becoming a Map"
date = 2026-10-15
description = "A blog shows what I wrote last. The new map on raskell.io shows what I keep coming back to, and it is the start of a public second brain."

[taxonomies]
tags = ["zola"]
categories = ["meta"]

[extra]
author = "Raffael"
image = "this-site-is-becoming-a-map.avif"
cover = "covers/this-site-is-becoming-a-map.avif"
og_image = "this-site-is-becoming-a-map.png"
+++

A blog is a timeline. The newest post sits on top, everything else slides down, and after a while the only way to find the post from last spring is to remember roughly when you read it. That works for news. It works badly for ideas, because ideas do not arrive in date order. Two posts written months apart can be circling the same problem, and nothing on a timeline tells you that.

This site now has a second way in. The [map](/map/) draws everything here as one graph: every article, every topic, every series, and every project, with a line wherever two of them are actually connected. It is the first piece of something I have wanted for a long time, and this post is about what it is, what it already showed me, and where I want to take it.

## What is on the map

Right now the map holds 32 articles, 20 topics, 2 series, and 21 projects, joined by 266 connections. Pearl dots are articles, cyan dots are topics, champagne dots are series, and rings are projects, grouped under the same headings as the [projects](/projects/) and [apps](/apps/) pages. Click a dot and its neighbors light up, along with a short card that tells you what it is and lets you open it.

The connections are the part that matters, so it is worth being precise about where they come from. An article connects to:

- the topics it is tagged with,
- the series it belongs to,
- every other article it links to in its text,
- every project it links to or names.

Projects also connect to the topics they are about, so the things I build sit next to the things I write about, even where I have not written about them yet.

None of this is maintained by hand. The graph is computed when the site is built, in the same template that renders the page. The article-to-article edges are my favorite part, because they come for free from writing:

```jinja
{%- for a in sec.pages %}{% for b in sec.pages %}
  {%- if a.path != b.path and a.content is containing(b.path) %}
    ["a:{{ a.path | safe }}","a:{{ b.path | safe }}"],
  {%- endif %}
{%- endfor %}{% endfor %}
```

If one post links to another, the template finds the other post's path in the rendered body and emits an edge. Every time I cross-reference something, the map grows a line. That is a quiet incentive to cross-reference more, which is exactly the habit I want.

## Why not just tags

The obvious objection is that tags already do this. Every article here has had tags for years, and every tag has a page that lists its articles.

Tags answer one question at a time. The tag page for `platform-automation` tells you what is filed under platform automation. It does not tell you that half of those posts also sit under `ai-engineering`, that many of them link to each other, or that one project ties a cluster of them together. A list per tag is a set of drawers. The map shows you how the drawers overlap.

The second objection is the better one. Anyone who has used Obsidian knows the graph view: a beautiful hairball that looks profound and tells you nothing. A graph is only as good as its edges, and edges drawn from shared words or vague similarity produce exactly that hairball. This is why every edge on the map comes from a deliberate act. I tagged it, I put it in a series, I linked it, or I named the project. If the map looks like a hairball someday, that will be an honest picture of my writing.

## What it already showed me

I expected the map to be a nicer table of contents. It turned out to be a mirror, and not an entirely flattering one.

**Two centers of gravity.** Most of the graph hangs off two topics, `platform-automation` and `ai-engineering`. That is where most of my writing has gone in the last year, and it is a fair summary of what makes me tick right now: how to run systems well, and what changes when software writes software.

**One project holds a lot together.** [Zentinel](https://zentinelproxy.io) has more connections than any other project: eleven articles led to it before this one. Articles about edge systems, security, Rust, and even about how I work all lead back to it. I knew it mattered to me. I did not know it was the load-bearing beam of the site.

**A quiet corner.** The Linux and BSD posts sit off to one side, connected to each other and barely to anything else. They date from 2022 to 2024, an older version of my interests, and the map makes that visible in a way a date never did.

**Things I build and never write about.** [Manabi](https://manabi.raskell.io), [Paw & Claw](https://pawandclaw.raskell.io), and [Terrarium](https://github.com/raskell-io/terrarium) hung off their topics and their group and nothing else. Until this post, not a single article mentioned them. A timeline hides that kind of gap completely. On the map, it is a dot with a thin line or two, and it is hard to unsee.

## Where this is going

The map is the first visible piece of a longer shift. Over the next few years, I want a garden to grow alongside the articles here: a personal but shared map of what I think about, what I build, and what changed my mind.

None of these ideas are new. Vannevar Bush described the [memex](https://www.theatlantic.com/magazine/archive/1945/07/as-we-may-think/303881/) in 1945, a desk that would let a reader tie documents together into trails and follow them later, the way the mind follows associations. Andy Matuschak's [evergreen notes](https://notes.andymatuschak.org/Evergreen_notes) and Maggie Appleton's [history of digital gardens](https://maggieappleton.com/garden-history) describe the modern version: notes that grow and get revised instead of being published once and left to age. What I want to add is a specific practice, built on the tools I already trust: plain files, a static site, open formats, no platform in between.

Concretely, that means a few changes, roughly in this order:

1. **Short notes next to long articles.** The long articles stay. They are where I work an idea through properly, with code, trade-offs, and counterarguments. Next to them, I want short notes: a paragraph or a page on an idea, a paper, or a question I have not answered yet. Notes are cheap to write and easy to link, and some of them will become the starting point for a longer piece. The map will show which article grew out of which notes.
2. **Notes that grow.** Some pages should be revised over time rather than frozen on their publication date. The `updated` field already exists, and I want to use it on purpose.
3. **What shaped me.** The books, papers, talks, and people that keep showing up in my thinking deserve to be dots too, so you can follow an idea back to where it came from.
4. **Private to public.** [Kurumi](https://kurumi.raskell.io), the local-first second brain I am building, already has wikilinks, backlinks, and a graph view of its own. Eventually, I want a path for a note to move from a private graph like that to the public one when it is ready, without copying it by hand.
5. **Readable by agents.** Plain files, explicit links, the graph as JSON, and the site's [llms.txt](/llms.txt) mean an agent can walk this garden as easily as a person can. I want that to stay true as it grows, so the notes can serve as source material for my own agents, and for anyone else's, when they work on something I have thought about before.

I do not know yet how far this goes, or what it looks like when the map has five hundred dots instead of eighty. That is part of the point. A garden is not designed up front.

## A shared map

A personal map published on the web is still, in one sense, just mine. I want it to be a little more than that. The map has an export button: you can download it as an image, or as JSON with every node and every edge. Take the data, draw it differently, connect it to your own notes, or tell me which links are missing. If you think two pieces belong together and the map does not show it, that is usually a post I should write.

## The rest of the relaunch

It has been quiet here since July. I was away for a good part of that time: in Greece, visiting family and swimming in the Ionian Sea, and then in Hong Kong and Okinawa, where I enjoyed the subtropical weather, sat through two typhoons, and went back to the coral reefs and beaches I wrote about in [Looking back on 2025](/articles/looking-back-on-2025/). The redesign is what I did when I got back.

The map arrived together with a new design for the whole site, a quieter theme called [seijaku](https://github.com/raskell-io/seijaku), from the Japanese word for stillness. The article index is denser and grouped by year, covers are cut automatically from each post's social banner, the tanuki in the corner blinks, and every old URL still works. Most of it was built in a long session with an AI coding agent, the way I described in [How I Work These Days](/articles/how-i-work-these-days/).

The map's first version had one memorable bug. A single minus sign turned the repulsion between nodes into attraction, and every dot slid into the middle of the canvas until the whole graph was one bright point. It is the most honest picture of a blog I have seen: everything piled in one place, with no way to tell what connects to what.

A blog tells you what I wrote last. The map shows what I keep coming back to.
