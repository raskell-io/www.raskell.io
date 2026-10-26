+++
title = "Ontology"
description = "The kinds of things on this site, how they connect, and how the map draws them: one icon for each kind, three colours, and what every line on the map means."
template = "ontology.html"

[extra]
headings = { kinds = "Kinds", relations = "Relations", topics = "Topic kinds", statuses = "Reading statuses" }
decks = { kinds = "Three colours on the map, one for each group. Every kind is drawn the same way, as a disc with its icon, and a node grows with its connections.", relations = "Every line on the map is one of these. Most of them come from a single field on a page or in a data file.", topics = "Topics come from one vocabulary. Subjects say what a page is about; concepts are the ideas that cut across subjects, and they make the map worth reading.", statuses = "Every work in the reading log has a status. Each status is a shelf on the reading page and a hub on the map." }

[[extra.groups]]
title = "My writing"
deck = "What I wrote, and the hubs that gather things together on the map."
color = "#f4f0df"
kinds = [
  { key = "article", name = "Article", desc = "Long-form writing: an argument, a build, or a review, usually in chapters.", where = "content/articles/" },
  { key = "review", name = "Review", desc = "An article about one work from the reading log, with a rating. Reviews are articles in the Reviews category.", where = "extra.review" },
  { key = "note", name = "Note", desc = "A paragraph or a page on one idea. A note may later grow into an article.", where = "content/notes/" },
  { key = "shelf", icon = "journal", name = "Shelf", desc = "A status in the reading log, such as Backlog or Read, drawn as a hub that gathers its works.", where = "status, data/reading.toml" },
  { key = "group", name = "Project group", desc = "A tier of projects, such as Ventures or Labs, drawn as a hub that gathers its projects.", where = "tiers, content/projects/" },
]

[[extra.groups]]
title = "What I made, and how it is arranged"
deck = "The talks and projects I made, and the series and categories that give the writing its order."
color = "#efd093"
kinds = [
  { key = "talk", name = "Talk", desc = "A conference talk as slides, with its event and venue.", where = "content/talks/" },
  { key = "project", name = "Project", desc = "Software, a site, or a study I build, with its status and its links.", where = "data/projects/" },
  { key = "series", name = "Series", desc = "A reading order across several articles, read part by part.", where = "taxonomies.series" },
  { key = "category", name = "Category", desc = "A form of writing rather than a subject. Today there is one: Reviews.", where = "categories_descriptions" },
]

[[extra.groups]]
title = "Ideas, and other people's work"
deck = "The topics that run through everything, and the books, papers, and reports I read. Works are a paler teal than topics."
color = "#72d7dc"
kinds = [
  { key = "topic", name = "Topic", desc = "A subject or an idea from one vocabulary. Topics sit under broader topics and join everything else.", where = "data/tags.toml" },
  { key = "book", color = "#a9e8e9", name = "Book", desc = "A non-fiction book from the reading log.", where = "data/reading.toml" },
  { key = "novel", color = "#a9e8e9", name = "Novel", desc = "Fiction from the reading log.", where = "data/reading.toml" },
  { key = "paper", color = "#a9e8e9", name = "Paper", desc = "A paper or a thesis.", where = "data/reading.toml" },
  { key = "report", color = "#a9e8e9", name = "Report", desc = "A report or a long scenario, such as AI 2027.", where = "data/reading.toml" },
  { key = "essay", color = "#a9e8e9", name = "Essay", desc = "An essay or a series of essays.", where = "data/reading.toml" },
]

[[extra.relations]]
from = "article"
verb = "is about"
to = "topic"
desc = "Pages, projects, and works each carry their topics. This is most of the map."

[[extra.relations]]
from = "topic"
verb = "sits under"
to = "topic"
desc = "A topic and its broader topics. Some of these bridge fields on purpose, such as Risk under Reliability."

[[extra.relations]]
from = "article"
verb = "links to"
to = "article"
desc = "Every link in the text of one page to another. Both pages show it, as Links to and Linked from."

[[extra.relations]]
from = "article"
verb = "is part of"
to = "series"
desc = "An article and the series it belongs to."

[[extra.relations]]
from = "review"
verb = "reviews"
to = "book"
desc = "A review and the work it reviews."

[[extra.relations]]
from = "article"
verb = "discusses"
to = "book"
desc = "A page that discusses a work without reviewing it."

[[extra.relations]]
from = "review"
verb = "is in"
to = "category"
desc = "A page and its category, a form of writing."

[[extra.relations]]
from = "book"
verb = "is on"
to = "journal"
desc = "A work and its shelf in the reading log."

[[extra.relations]]
from = "project"
verb = "is in"
to = "group"
desc = "A project and its tier on the projects page."

[[extra.relations]]
from = "project"
verb = "is related to"
to = "project"
desc = "Projects that belong together, such as Hotaru and Terrarium."

[[extra.topic_kinds]]
key = "domain"
name = "Domain"
desc = "A field of work or study, such as Distributed systems or History."

[[extra.topic_kinds]]
key = "concept"
name = "Concept"
desc = "An idea that cuts across fields, such as Augmentation, Hubris, or the Commons."

[[extra.topic_kinds]]
key = "technology"
name = "Technology"
desc = "A language, a tool, or a platform, such as Rust or OpenTelemetry."

[[extra.topic_kinds]]
key = "site"
name = "Site"
desc = "About this site itself."

[[extra.statuses]]
key = "reading"
name = "Reading now"
desc = "What I am reading at the moment."

[[extra.statuses]]
key = "next"
name = "Up next"
desc = "What I will read right after, in order."

[[extra.statuses]]
key = "backlog"
name = "Backlog"
desc = "Some day, in no particular order."

[[extra.statuses]]
key = "read"
name = "Read"
desc = "Finished, with the month I finished it."

[[extra.statuses]]
key = "set-aside"
name = "Set aside"
desc = "Started and not finished, for now."
+++

Everything on this site is one of a small number of kinds: something I wrote, something I made or arranged, or an idea or a work by someone else that the writing connects to. Each kind has one icon, and it is the same wherever the kind appears: in lists, on [Start here](@/start-here.md), in [search](@/search.md), and as its node on the [map](@/map.md).

Each kind is registered in one place, a folder of pages or a data file, and reaches every page from there. This page is the key to all of it. The counts are live and change as the site grows.
