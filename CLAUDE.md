@AGENTS.md

## For Claude Code

- The curation contract above is the source of truth for adding content; keep it current when a register
  or sink changes. Local, uncommitted context lives in `.claude/CLAUDE.md` and `.claude/rules/` (voice,
  editorial position, publishing workflow) and `.claude/PROMPT_NEW_ARTICLE.md` (drafting prompt); read
  them before writing prose for the site when they are present.
- The `curate` skill (`.claude/skills/curate/`) walks through adding or changing content end to end:
  register, validate, generate, look at every sink, commit in the right order.
- Verify visually before reporting done: screenshots with headless Chrome via playwright-core in the
  session scratchpad (light, dark, and phone width), not just a successful build.
- Facts about the outside world (release dates, prices, quotations) come from a source checked in the
  session, and the source goes into the page.
