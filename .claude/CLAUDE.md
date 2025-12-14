# Task: Re-spin and redesign raskell.io into a “hard-systems / platform automation” tech home

You are a senior engineer + designer with strong Hugo + Zola experience. You will refactor my static site (currently Hugo, might migrate to Zola) to match a new public identity:

**Identity / spin**
- I build automation-first platforms and edge systems that survive production reality.
- Applied security is one arena of “hard problems” (adversarial inputs, safety constraints, signal/noise).
- I prefer open, sustainable solutions and open standards over vendor lock-in.
- Tone: calm, sharp, pragmatic, slightly opinionated. Not corporate. Not “thought leader”.

**Current site**
- Homepage currently has a short intro and a “Latest Articles” list. Latest posts include Void Linux disk maintenance and older Haskell/OpenBSD posts.
- Site is intentionally lightweight and simple. Keep that spirit.

---

## Goals
1. **Make the homepage instantly communicate what I build and write about** (automation/platforms/edge/applied security).
2. **Keep the site minimal, fast, readable, and timeless** (no heavy JS frameworks, no gimmicks).
3. Add “professional gravity” without becoming corporate:
   - speaking/talks
   - selected writing / start-here
   - projects
4. Make it easier to publish:
   - better content taxonomy (tags/series)
   - templates/archetypes
   - consistent post metadata and UX

## Non-goals
- No newsletter popups, tracking, cookie banners, or engagement bait.
- No “personal brand” cringe. No hustle tone.
- No politics.

---

## Deliverables
### A) Design + UX changes
- Update **homepage hero copy** to reflect the new spin.
- Add a top nav: `Articles`, `Start here`, `Projects`, `Speaking`, `About`, `RSS`.
- Homepage sections (minimal, scannable):
  1) Hero (1–2 sentences + 2 CTAs)
  2) “Start here” (3 curated links)
  3) “What I’m working on” (short, optional)
  4) “Selected writing” (6 posts max + tags)
  5) “Projects” (2–4 cards)
  6) “Speaking” (RSAC mention + talk list placeholder)
- Add a **/speaking** page (even if some items are “details soon”).
- Add a **/start-here** page that curates posts by theme.
- Add a **/projects** page that lists projects with short descriptions and links.
- Add a short **/about** page (bio + interests + how to contact).

### B) Content and structure
- Introduce a clear taxonomy:
  - Topics/tags: `platform-automation`, `edge-systems`, `applied-security`, `oss`, `reliability`, `observability`, `linux-bsd`, `ai-for-ops`
  - Optional series: `field-notes`, `patterns`, `deep-dives`
- Make article pages feel “engineer-friendly”:
  - excellent code block styling
  - visible reading time + date + tags
  - consistent header image handling (optional)
  - good typography and spacing

### C) Implementation (Hugo first, Zola-ready second)
- Implement in Hugo in a way that is easy to migrate later:
  - keep content Markdown clean and portable
  - avoid Hugo-only shortcodes unless necessary; if used, keep them minimal and document them
- Provide a short `MIGRATION_NOTES.md` explaining how your structure maps to Zola:
  - content folder structure
  - front matter fields
  - taxonomies
  - templates/partials equivalents

---

## Visual direction
- Minimal, modern, slightly “systems” aesthetic.
- Monospace accents for code/metadata, but body text should be highly readable.
- Prefer neutral colors, subtle borders, and whitespace.
- Accessibility: good contrast, keyboard nav, sensible headings.

---

## Copy: homepage hero (use this direction, not necessarily verbatim)
Write copy that sounds like me:
- “I build automation-first platforms and edge systems that survive production reality.”
- “Writing about platform automation, operability, open standards, and applied security.”
CTAs:
- Primary: “Start here”
- Secondary: “Speaking” or “Projects”

Avoid fluffy claims. Avoid “I’m passionate about…”. Show, don’t tell.

---

## Speaking content requirement
Create `/speaking` with:
- A top line: “RSAC 2026 speaker (details soon)”
- A section for “Talks” with one featured talk placeholder:
  - title: `TBD`
  - summary: 2–3 sentences (pragmatic, engineering-focused)
  - takeaways: 3 bullets
- A short “Available for” section:
  - podcasts, panels, technical talks (security/platform/edge)

---

## Projects content requirement
Create `/projects` listing (cards):
- Name
- 1-line description
- Links (GitHub, site, etc.)
Include placeholders if you don’t know exact projects; keep format consistent.

---

## Technical constraints
- Must keep the site lightweight and fast.
- No client-side frameworks.
- If you add JS, it must be tiny and optional (e.g., theme toggle).
- Keep CSS maintainable (either plain CSS, SCSS, or minimal utility approach). Prefer clarity.

---

## What I want from you (the agent)
1. Inspect repo structure and identify where to implement:
   - layouts, partials, home template, list/single templates
   - existing theme overrides
2. Propose a minimal file-change plan and then implement it.
3. Output:
   - the exact files changed/added (with code)
   - any new front matter fields needed (document them)
   - `MIGRATION_NOTES.md` for Zola mapping

If something is missing (e.g., theme name, current layouts), make a reasonable assumption, implement cleanly, and explain what you assumed.

---

## Acceptance checklist
- Homepage communicates the new “hard systems / automation-first” identity in 5 seconds.
- Navigation includes Start here / Projects / Speaking.
- Articles remain the core, but “professional surface” is present.
- Styling is consistent, readable, and looks intentional.
- Works with `hugo server` and produces valid HTML.
- Migration notes to Zola are clear.
