---
name: curate
description: Add or change content on raskell.io so it reaches every register and sink. Use for any new or edited article, review, note, talk, book or paper in the reading log, project or app, topic, category, or series, and when the user asks why something does not show up on the map, in search, in llms.txt, in a feed, or in a social card. Also use when adding a new kind of content to the site.
---

# Curate content on raskell.io

`AGENTS.md` at the repo root is the contract: the registers table says where each kind of content lives,
the sinks table says where it goes, and the recipes say what to fill in. This skill is the order of work.

## 1. Classify the request

Decide which kinds are involved: article, review, note, talk, work (book, novel, paper, report),
project or app, topic, category, series, or a hand-curated place (homepage now list, Start here tracks,
Speaking cards). A review is two registrations: the work in `data/reading.toml` and the article.
Something that fits none of these is a new kind: go to step 6.

## 2. Gather facts before writing

- Read the 2 or 3 most recent articles or notes for voice. Read `.claude/rules/` and
  `.claude/PROMPT_NEW_ARTICLE.md` when they exist.
- Check outside facts (dates, prices, quotations, ISBNs) against a source in this session, and cite it.
  For a review, read the work itself if a copy is available, and quote it exactly.
- Find what the site already says on the subject (`grep -rn` in `content/`) so the new piece links to it
  instead of repeating it.

## 3. Register

Write the source file(s) per the recipe in `AGENTS.md`. Checklist:

- [ ] Front matter complete; description under 160 characters; `draft = true` until the user says publish.
- [ ] 3 to 7 topics, the most specific; any new topic added to `data/tags.toml` first, with `broader`.
      Include at least one idea that joins this piece to something of a different kind (see "Topics are
      for discovery" in `AGENTS.md`), and only where the text actually discusses it.
- [ ] In-body links to related pages (they become map edges and backlinks).
- [ ] Sources under a `## References` heading when there are several.
- [ ] Reviews: `extra.review`, `categories = ["reviews"]`, and in `data/reading.toml` `status = "read"`,
      `finished = "YYYY-MM"` (or `"YYYY"`), `rating`. Pages that discuss a work without reviewing it: `extra.reads`.
- [ ] Works: cover fetched with `mise run reading-covers <id>` and looked at; wrong edition pinned with
      `isbn` or `cover_id`.
- [ ] Talks: `extra.event`, `extra.venue`, `extra.event_url`; a card on `content/speaking.md`.
- [ ] Projects: the slug added to a tier in `content/projects/_index.md` or `content/apps/_index.md`.
- [ ] Writing rules: no em or en dashes, no contractions, no AI filler. Check with
      `grep -n '[—–]' <file>`.

## 4. Generate and validate

```sh
mise run tags-check
mise run llms
mise exec zola@0.22.1 -- zola build --drafts
mise run map-json && mise run garden-json
mise run og <section>/<slug>
mise exec zola@0.22.1 -- zola check --drafts --skip-external-links
```

## 5. Look at every sink

Do not report done on a green build alone. Serve with
`mise exec zola@0.22.1 -- zola serve --drafts --port 1111` and check:

- the page itself (light, dark, phone width) and its social card in `public/og/`
- its place on `/map/` (`/map/#a:/<section>/<slug>/` selects it) and its "On the map" box
- a search for it on `/search/`, with the right chip
- its line in `static/llms.txt`, its Markdown copy, and for reviews the `review_of` and `rating` lines
- for works: its row on `/reading/` and its entry in `static/reading.json`
- the feed it belongs to

Screenshots with playwright-core and the local Chrome, in the session scratchpad.

## 6. A new kind of content

Work through "Adding a new kind of content" in `AGENTS.md`, one touch point at a time, and update
`AGENTS.md` itself (registers, sinks, recipe) in the same change. Theme files go in `themes/seijaku`.

## 7. Report, then commit when asked

Tell the user what was registered, where it now appears, and anything unverified. Commit and push only
when asked: theme submodule first (push, then fast-forward `../seijaku`), then this repo, which pushes
to GitHub and Codeberg. Never commit `linkedin-*.md`. After the deploy, check the live URLs.
