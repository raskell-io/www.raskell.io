# AGENTS.md: curating raskell.io

raskell.io is Raffael Schneider's site and digital garden: articles, reviews, notes, talks, a reading
log, projects, and a topic vocabulary, all connected on one map and in one search index, and published
again for machines (llms.txt, Markdown copies, JSON files, JSON-LD, WebMCP). This file is the contract
for adding content so that it reaches every one of those places. It applies to any agent (Claude Code,
Codex, Cursor, and others) and to people.

The short version: **content is registered once, in a source file; everything else is generated.**
Never edit a generated file by hand. If a new piece of content does not show up somewhere it should,
the fix is in the source file or in the generator, not in the output.

## Stack, in one paragraph

Zola 0.22.1, always through mise (`mise exec zola@0.22.1 -- zola ...`; the zola on PATH is newer and
incompatible). The theme is seijaku, a git submodule in `themes/seijaku` (standalone repo
`raskell-io/seijaku`). Anything another site could use belongs in the theme; raskell-specific things stay
here (`templates/partials/head_extra.html`, `templates/partials/body_end.html`, `sass/site.scss`,
`static/`, `.mise/tasks/`). Hosting is GitHub Pages behind Cloudflare; CI is
`.github/workflows/deploy.yml`.

## Registers: where content lives

Every kind of content has exactly one source of truth.

| Kind | Register | Required | Notes |
|---|---|---|---|
| Article | `content/articles/<slug>.md` | title, date, description (under 160 chars), `tags` | `extra.image` (social banner) and `extra.cover` (via `mise run covers <slug>`) optional |
| Review | an article (or note) with `extra.review = "<work-id>"` and `categories = ["reviews"]` | the work in `data/reading.toml` with `status = "read"`, `finished`, `rating` | `mise run review <work-id>` scaffolds it |
| Note | `content/notes/<slug>.md` | title, date, description, `tags` | no image, cover, or series; a paragraph or a page |
| Talk | `content/talks/<slug>.md` with `template = "slide-deck.html"` | title, date, description, `extra.event`, `extra.venue`, `extra.event_url` | slides are HTML sections; assets in `static/talks/<slug>/`; add a card to `content/speaking.md` |
| Work (book, novel, paper, report, article, essay, journal) | `data/reading.toml`, one `[[works]]` block | id, title, author, kind, status | dates are months, `"YYYY-MM"`; `rating` 1 to 10 when reviewed; cover via `mise run reading-covers <id>` |
| Project or app | `data/projects/<slug>.toml` | title, description, status, links, topics | listed by adding the slug to a tier in `content/projects/_index.md` or `content/apps/_index.md` |
| Topic | `data/tags.toml` | name, kind (domain, concept, technology, site), description | `broader` links it into the graph; define it before using it |
| Category | `config.toml`, `extra.seijaku.categories_descriptions` | a one-line description | a form of writing, not a subject; today only `reviews` |
| Series | `taxonomies.series` on each part, `extra.seijaku.series_descriptions` in config | | only for real multi-part reading orders |

Hand-curated places that are not generated: the homepage "What I am working on" list
(`content/_index.md`, `[[extra.now]]`; the `reading = true` item fills itself from the reading log),
the reading tracks on `content/start-here.md`, the talk cards on `content/speaking.md`, the project
order inside tiers, and `featured = true` for homepage project cards.

## Sinks: where content goes

Once registered, content reaches all of these without further work, unless the table says otherwise.

| Sink | Built by | What feeds it |
|---|---|---|
| Pages, section lists, topic pages, category pages, series pages | Zola | content files, taxonomies |
| `/reading/` (shelves, covers, ratings, review links) | theme `reading.html` | `data/reading.toml`, reviews |
| The map `/map/` and `/map.json` | theme `partials/graph_data.html`; `mise run map-json` after the build | `graph_sections` (articles, notes, talks), topics and `broader`, series, categories, works, projects, every in-text link between pages |
| Search `/search/`, the `/` dialog, `/garden.json`, `/links.json` | theme `partials/garden_data.html` and `static/seijaku-search.js`; `mise run garden-json` after the build | pages, works, projects, topics, every external link in page bodies (links under a `## References` heading are marked as references) |
| `/llms.txt`, `/llms-full.txt`, Markdown copies (`<url>.md` for articles, notes, talks), `/reading.json` | `mise run llms` before the build | content front matter and bodies, `data/reading.toml`, `data/tags.toml`, project tiers |
| Feeds | Zola | `/rss.xml`, `/atom.xml`, `/articles/rss.xml`, `/notes/rss.xml`, `/talks/rss.xml`, `/categories/reviews/rss.xml`, plus one per topic and series |
| Social cards `og/<path>.png` | `mise run og` after the build, template `og/card.html` | page title, description, date, cover; reviews get the book cover and rating |
| JSON-LD | `templates/partials/head_extra.html` (talks: `templates/slide-deck.html`) | BlogPosting and Review (itemReviewed, reviewRating), DefinedTerm topics, the reading log as an ItemList, Datasets for the data files, a SearchAction |
| Discovery files | static, hand-maintained | `static/robots.txt`, `static/ai.txt`, `static/.well-known/api-catalog`, `static/.well-known/auth.md` |
| WebMCP tools for in-browser agents | `static/js/webmcp.js` | reads llms.txt, the Markdown copies, map.json, garden.json, reading.json |
| Sitemap, IndexNow ping | Zola; CI on push | every page |

CI order matters: `tags-check`, `security-txt`, `llms`, `zola build`, `map-json`, `garden-json`, `og`,
deploy, IndexNow.

## Topics are for discovery

The map is meant to make connections visible that nobody drew by hand, so topics come in two kinds:
subjects (machine learning, history) and ideas that cut across them (augmentation, hubris, the commons,
external memory, legibility). Ideas are what make the map interesting.

- Prefer a topic that joins different kinds of things: a book, an article, a project, a talk. A topic only
  one item uses is a leaf; give it `broader` parents so it still connects.
- Use `broader` to bridge fields on purpose: Legibility sits under Observability and Metrics, Risk under
  Reliability, Intelligence under both Machine learning and Neuroscience.
- Tag an idea only where the work or page actually discusses it; check the text first.
- For a new book, ask what it is about beyond its subject: which tension, method, institution, or failure
  mode does it share with something already on the site?

## Recipes

### A new article
1. Write `content/articles/<slug>.md` with `draft = true` (`mise run new <slug>` scaffolds one).
2. Tag it with 3 to 7 topics from `data/tags.toml`, the most specific that apply. If a topic is missing,
   add it to `data/tags.toml` first (name, kind, description, broader).
3. Link related articles and notes in the text: every in-body link is an edge on the map and a "Linked
   from" entry on the other page. Put sources under a `## References` heading so they are marked as
   references in links.json and search.
4. If the article discusses a work from the reading log without reviewing it, add `reads = ["<id>"]`
   under `[extra]`.
5. Hero image: PNG in `static/`, AVIF beside it, `extra.image`; then `mise run covers <slug>`.
6. Remove the `draft` line to publish.

### A new review
1. Make sure the work is in `data/reading.toml`; set `status = "read"`, `finished = "YYYY-MM"` (or `"YYYY"` when only the year is known), and
   `rating = N` (1 to 10). Fetch its cover with `mise run reading-covers <id>` and check it is the right
   edition; pin a wrong match with `isbn` or `cover_id`, or skip with `cover_id = "none"`.
2. `mise run review <id> [slug]` writes a draft with `review = "<id>"`, `categories = ["reviews"]`, the
   work's topics, and the questions a review here answers.
3. Quote the work exactly and sparingly, with chapter references; keep apart what the author argues,
   what evidence the work offers, and what the reviewer infers.
4. Everything else follows: the "Review of" and "Rating" rows, the book cover in the header, the Reviews
   category and feed, the review social card, the review link on /reading/, the map edge, Review JSON-LD,
   and `review_of` and `rating` in the Markdown copy.

### A new note
`content/notes/<slug>.md` with title, date, description, tags. Keep it short: a few lines, a table, some
links. A note may later grow into an article; link the two.

### A new talk
1. `content/talks/<slug>.md` with `template = "slide-deck.html"`, `date`, `description`, and under
   `[extra]`: `event`, `event_url`, `venue`, `event_date_human`. Assets go in `static/talks/<slug>/`.
2. Add a card for it to `content/speaking.md`.
3. It reaches /talks/, its feed, the map, search, llms.txt, and gets a Markdown copy of its slides.

### A new work in the reading log
Add a `[[works]]` block to `data/reading.toml` (fields documented at the top of the file), run
`mise run reading-covers <id>`, look at the cover, and commit the image in `static/covers/reading/`.
Covers are fetched once and committed; CI does not fetch them.

### A new project or app
Add `data/projects/<slug>.toml`, then add the slug to a tier in `content/projects/_index.md` or
`content/apps/_index.md`. Topics come from the same vocabulary. `related` links projects on the map.

### A new category
Describe it in `config.toml` under `categories_descriptions` first; `tags-check` rejects undescribed
categories. Categories are forms of writing; subjects are topics.

## Adding a new kind of content

A new kind (say, podcasts or bookmarks) has to be taught to every sink. Touch points:

- Register: a section in `content/` or a data file in `data/`, with its fields documented at the top.
- Validation: `.mise/tasks/tags-check` (topics used, required fields, allowed values).
- Map: `graph_data.html` (node kind and edges), `static/seijaku-map.js` (`STYLE`, `REST`, `KIND_NAME`),
  `map.html` (legend button), `sass/components/_map.scss` (legend swatch).
- Search: `garden_data.html` (rows), `static/seijaku-search.js` (a chip in `CHIPS`, badge, browse order),
  `.mise/tasks/garden-json`.
- Machine copies: `.mise/tasks/llms` (llms.txt section, llms-full.txt, Markdown copies, a JSON file if
  it is data), `templates/partials/head_extra.html` (alternate links, JSON-LD).
- Discovery: `static/robots.txt`, `static/ai.txt`, `static/.well-known/api-catalog`,
  `static/.well-known/auth.md`, and the "For agents" list in the llms task.
- WebMCP: `static/js/webmcp.js` (search kinds, a tool if the kind deserves one, `get_current_page`).
- Social card: `og_card.html` and `og/card.html` if it needs its own layout.
- Docs: this file, and the theme README for anything in the theme.

## Translations

English is the source language and lives at `/`; Simplified Chinese (`zh`) and Korean (`ko`) live under
`/zh/` and `/ko/`. Today the homepage, About, Projects, and Apps are translated; everything else is English in
every language, and the footer's language switch sends readers of an untranslated page to that
language's home.

- **A page:** add `<name>.<code>.md` beside the source (`content/about.zh.md`, `content/_index.ko.md`) with
  the same front matter and a translated title, description, and body. URLs keep the English names
  (`/zh/about/`); never set a translated `slug` or `path`. Links inside a translation point to the
  English page unless that page is translated too.
- **Project data:** each `data/projects/<slug>.toml` ends with `[i18n.zh]` and `[i18n.ko]` tables
  (`description`, optionally `title` and `tagline`); the cards use them wherever they appear. A new
  project gets both tables, or it shows in English on the translated pages.
- **Interface text:** `config.toml`, `[extra.seijaku.i18n.<code>]`: `labels` maps English interface text
  (navigation, footer, homepage buttons) to its translation; `tagline` and `footer_about` replace the
  footer introduction. A new nav item or footer link needs its label added for each language.
- **A language:** a `[languages.<code>]` block (with `build_search_index = false` and `taxonomies = []`),
  an entry in `extra.seijaku.languages` (native name, hreflang, og_locale), and an `i18n` table.
- **English only, by design for now:** topics, series, categories, feeds, search, the map, llms.txt and
  the other machine files, and social cards (a translation reuses the English card).
- Translations follow the writing rules: no em or en dashes; Korean in the formal 합니다체. Chinese
  paragraphs go on one line, because a line break inside one renders as a space.

## Verify before reporting done

```sh
mise run tags-check                                   # vocabulary, reading log, categories, reviews
mise run llms                                         # llms.txt, llms-full.txt, Markdown copies, reading.json
mise exec zola@0.22.1 -- zola build                   # add --drafts to see drafts
mise run map-json && mise run garden-json             # the data files, from the built pages
mise run og articles/<slug>                           # one social card, to look at
mise exec zola@0.22.1 -- zola check --skip-external-links
mise exec zola@0.22.1 -- zola serve --drafts --port 1111
```

Then look at the result: the page, its place on the map, a search for it, its line in `static/llms.txt`,
and its social card. Screenshots with headless Chrome (playwright-core) work well for this.

## Writing rules

- No em dashes or en dashes. No contractions ("do not", "it is"). No AI filler ("delve", "leverage",
  "unlock", "robust", "synergy", "transformative", "paradigm").
- First person, concrete, calm, slightly opinionated; not corporate, not "thought leadership".
- No politics, except load-bearing civic-engineering references.
- "Archipelag.io" in full.
- Quote sources exactly; say what is sourced and what is opinion.

## Committing

- Commit and push only when asked.
- Theme first: commit in `themes/seijaku`, push it, fast-forward the standalone checkout
  (`../seijaku`), then commit and push this repo (CI checks the submodule out from GitHub).
- This repo pushes to GitHub and Codeberg (two push URLs on `origin`).
- Never commit `linkedin-*.md` drafts in the repo root.
- Generated files are gitignored: `static/llms*.txt`, `static/{articles,notes}/`, `static/talks/*.md`,
  `static/reading.json`, `public/`. Committed by hand: covers in `static/covers/`, reading covers in
  `static/covers/reading/`.
