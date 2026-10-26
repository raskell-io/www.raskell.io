+++
title = "After PHP Gate: A Blueprint for the Static Web"
date = 2026-10-26
description = "Last week's PHP flaws reached every server that runs code per request. My blueprint for sites and apps that run none at all."

[taxonomies]
tags = ["applied-security", "edge-systems", "open-web", "zola", "webassembly", "rust", "context-engineering"]

[extra]
author = "Raffael"
image = "a-blueprint-for-the-static-web.avif"
cover = "covers/a-blueprint-for-the-static-web.avif"
+++

Last Wednesday, the PHP project shipped [four releases in one afternoon](https://www.php.net/archive/2026.php).
PHP 8.5.12, 8.4.27, 8.3.36 and 8.2.35 fixed two flaws that allow unauthenticated remote code execution, both rated
critical at CVSS 9.2:

- [CVE-2026-109618](https://nvd.nist.gov/vuln/detail/CVE-2026-109618), "RCE via OOM corruption"
  ([GHSA-w8hw-w9fx-j79w](https://github.com/php/php-src/security/advisories/GHSA-w8hw-w9fx-j79w))
- [CVE-2026-109619](https://nvd.nist.gov/vuln/detail/CVE-2026-109619), "RCE via stale global state"
  ([GHSA-6wmf-4rv5-p3rp](https://github.com/php/php-src/security/advisories/GHSA-6wmf-4rv5-p3rp))

[The advisory](https://www.php.net/archive/2026.php) is short and does not leave much room for interpretation: the
flaws affect "all PHP installations serving web requests, including PHP-FPM, Apache with mod_php, php-cgi, FrankenPHP
and LiteSpeed," and "there are no complete mitigations, updating is the only safe choice." Details had
[leaked a day before the embargo lifted](https://threatlandscape.io/blog/php-core-rce-cve-2026-109618-109619-leak-ahead-of-embargo),
honeypots started seeing attempts soon after, and for the rest of the week hosting providers, agencies and WordPress
admins were patching, checking, and patching again. Most people call the flaws
[PHP2Shell](https://threatlandscape.io/blog/php-core-rce-cve-2026-109618-109619-leak-ahead-of-embargo). I have been
calling the week PHP Gate.

The scale is what makes it a gate rather than a bug. PHP runs
[69.2% of the websites](https://w3techs.com/technologies/details/pl-php) whose server-side language W3Techs can
identify, and WordPress alone runs [39.6% of all websites](https://w3techs.com/technologies/details/cm-wordpress). Laravel, MediaWiki (so, Wikipedia), Drupal, Magento: the
productive web is still, to a large degree, a PHP interpreter that executes for every single request. When the
interpreter has a hole, every one of those requests is a way in.

I do not want to pile on PHP. The PHP team handled this well, and the language has carried more of the web than any
other. What worries me is a habit that goes far beyond PHP: running code on a server, at request time, to produce a
page that is almost always the same page it produced a second ago. Most of the sites caught up in PHP Gate could
have been a folder of files, with no runtime for anyone to attack.

This post is the blueprint I use instead. I looked at every web project I have built over the last few years, about
forty sites, documentation sites and web apps across several GitHub organisations, and wrote down what they all do.
The practices turned out to be the same every time. There are two template repositories at the end you can clone.
The blueprint is not the answer to everything, either, so there is also a section on when a project needs a real
backend, and what I build those with.

If "static" and "dynamic" are fuzzy terms for you, read the next section first; it explains them without assuming
anything. If you build websites for a living, skip ahead to [the shape of it](#the-shape-of-it).

## Static and dynamic, in plain words

Every time you open a web page, your browser asks a computer somewhere (a **server**) for it, and the server sends
back a file of HTML that the browser draws. The difference between a static and a dynamic website is *when that file
is made*.

A **dynamic** website makes the page at the moment you ask for it. A program on the server (WordPress, written in PHP,
is the most common one) reads a template, asks a database for the article, fills the article into the template, and
sends you the result. Then it does the same thing again for the next visitor, and the next, usually producing exactly
the same page. It is a kitchen that cooks every plate to order, even when everybody orders the same dish.

```
dynamic:  you ──► server ──► PHP runs ──► database ──► page is assembled ──► you
                  (for every visitor, every time)
```

A **static** website makes every page once, ahead of time, whenever the content changes. A program called a **static
site generator** (this site uses one called Zola) reads all the articles and templates and writes out a folder of
finished HTML files. That folder is copied to a **CDN**, a network of servers around the world that does nothing but
hand out files quickly from somewhere close to you. When you ask for a page, nothing is cooked. The finished file is
simply handed over.

```
static:   writer ──► build, once per change ──► folder of files ──► CDN
          you ──► CDN ──► the finished file ──► you
                  (nothing runs when you visit)
```

Static does not mean boring or frozen. A static page can still be interactive, because the interactivity runs in
*your* browser: menus, search, maps, even a chess engine. What a static site does not have is a program on a server
that runs because you visited, which is the part PHP Gate attacked.

A few more words this post uses, so they do not get in the way later:

- **Edge** means the CDN's servers close to the reader. An **edge function** (Cloudflare calls them **Workers**) is a
  small program that runs there, for the rare jobs a file cannot do, like accepting a form.
- **Build** is the step that turns content and templates into the finished files. It runs when a change is merged, not
  when someone visits.
- **Backend** is a program on a server that the website talks to: it stores data, checks passwords, takes payments.
  A static site has no backend of its own; an app may still need one.
- **WebAssembly** lets code written in languages like Rust run inside the browser, close to the speed of a native
  program.
- **Agents** are AI assistants that read websites on someone's behalf. They read static pages especially well.

## The idea in one paragraph

Render at commit time, serve files from the edge, and run code only where it cannot be avoided. A page is built once,
when a change is merged, and from then on it is a file on a CDN. Logic that must react to a visitor moves to one of
two places: the visitor's own browser (JavaScript, or Rust compiled to WebAssembly when the work is heavy), or a small
edge function that does exactly one job. There is no application server, no database behind the pages, and no
runtime to patch at two in the morning, because there is nothing running between the request and the file.

## Why bother

**Security.** A static page cannot be exploited the way PHP Gate was exploited, because a request for it never
executes anything. The attack surface shrinks to the CDN (which is someone else's full-time job), the build (which
runs in a throwaway container on merge, not on request), and whatever edge functions you choose to add. On most of my
sites that last list has zero or one entries. You still have a supply chain to care about, which is why pinning and
review matter so much later in this post, but you no longer have an interpreter facing the internet.

**Operations.** A static site has no server of its own to patch, scale or restart. During PHP Gate my static sites
needed nothing from me. A traffic spike is the CDN's problem, and the CDN was built for it. Rollback is a redeploy of
the previous commit, a single click in the Pages dashboard.

**Speed and cost.** Files from an edge cache are as fast as the web gets, and serving them costs next to nothing:
Cloudflare Pages hosts a static site on its free plan with up to 20,000 files.

**Longevity.** A folder of HTML ages better than almost any other software. Sites I built years ago still render
exactly as they did, with no framework upgrade, no runtime end of life, no database migration. PHP 8.2 reaches end of
life on 31 December; a static site has no such date.

**Machines.** More of my readers are now agents, and static pages are simple for them to fetch and parse. If you
also publish each page as Markdown and describe it with structured data, they read it correctly.

There are real counterarguments:

- **Dynamic features.** Comments, forms, search, accounts, payments. Most of them have a static-friendly form:
  search runs in the browser over a prebuilt index, forms post to an edge function, comments become pull requests or
  issues. Some things genuinely need a server, and then you should run one; the [next section](#when-you-do-need-a-backend)
  is about those. The point is to run it for those things only, not for every page view.
- **Editors who do not use Git.** This is the real reason WordPress wins in many organisations, and the blueprint does
  not fully solve it. GitHub's web editor and issue forms get non-technical contributors surprisingly far, and an
  agent can turn a Word document into a pull request. For a newsroom with forty editors, I would think harder.
- **Vendor dependence.** I lean on Cloudflare. Everything I deploy is still just files in Git, so moving hosts is an
  afternoon. This site is served by GitHub Pages behind Cloudflare, and every push goes to Codeberg as well as
  GitHub.
- **Build times.** A large site takes minutes to build, not milliseconds to render. My largest project takes about a
  minute for ten languages; Cloudflare's build limit is twenty minutes. Precomputing data in separate build steps
  keeps it there.

## When you do need a backend

Some projects are not websites with a few interactive parts. They are services, and pretending otherwise produces a
pile of edge functions that slowly turns into a backend nobody designed. These are the signs I look for:

- **People have accounts and their own data.** Logins, profiles, private documents, per-user settings that must follow
  them across devices.
- **Many people write, not just read.** A marketplace, a forum, a booking system, an internal tool where every user
  changes shared state.
- **Things happen in real time between users.** Chat, collaborative editing, live dashboards, presence.
- **The work is heavy, long, or secret.** Jobs that run for minutes, data that cannot be shipped to the browser,
  integrations that need credentials, money moving between parties.
- **The data does not fit in a build.** Millions of records that change by the minute cannot be rendered into files
  on every merge.

When two or more of these are true, I build a backend, and I pick it by the shape of the problem:

| The project | What I reach for | Why |
|---|---|---|
| An API: endpoints, data, integrations | **Go** | One static binary, a fast start, modest memory, an excellent standard library for HTTP, and concurrency that is easy to reason about. |
| A rich app frontend that renders per user | **Next.js**, or a framework like it | Server rendering where a page depends on who is looking, static export where it does not, and the largest ecosystem of components and people. |
| A service that is distributed by nature: real time, many connections, many nodes | **Elixir and Phoenix** | The BEAM was built for exactly this: lightweight processes, supervision that restarts what fails, clustering, PubSub and LiveView without bolting on extra infrastructure. |
| The same, with a type system that catches mistakes at compile time | **[Refrakt](https://refrakt.raskell.io)** | My own framework, in Gleam on the BEAM: productive like Phoenix, explicit like Gleam, with generators for the routine parts. Still young; I use it where I can follow its changes. |

Two of my own services show the Phoenix row in practice: [Cyanea](https://cyanea.bio) runs Phoenix on SQLite, and
[Archipelag.io](https://archipelag.io) runs Phoenix with Postgres and NATS. Both run on one bare-metal server, which I
wrote about in [How AI Makes Bare Metal Viable Again](@/articles/how-ai-makes-bare-metal-viable-again.md).

Even with a backend, most of the blueprint still applies. A service with a real backend has parts that are just
content: the landing page, the documentation, the changelog, the legal pages, the blog. Those stay static, on the
blueprint, and the backend is a separate deployment with a small, well-defined API. The rest of the lessons carry over
unchanged: agent context first, the data types declared before the code, pinned versions, and as little running at
request time as the problem allows. And keep the PHP Gate lesson close: a backend is a runtime facing the internet,
so it needs an owner, an update routine, and the discipline to keep it no bigger than it has to be.

## The shape of it

Every project of mine, from a one-page product site to a ten-language knowledge base, has the same shape:

```
  GitHub organisation (one per product)
  ┌────────────────────────────────────────────────────────────┐
  │ .github   .claude  theme  content   site    app     worker │
  │ profile   context  Zola   Markdown  config  Svelte  edge   │
  │ policies  rules    Tera   + data    build   + Rust  logic  │
  └───────────────────┬──────┬─────────┬───────┬───────┬───────┘
                      └──────┴─────────┤       │       │
                                       │       │       │    theme and content: submodules,
                                       ▼       ▼       ▼           pinned and reviewed
                                 ┌───────────────────┐┌─────────┐
                                 │ Cloudflare Pages  ││ Workers │
                                 │ files at the edge ││ one job │
                                 └─────────┬─────────┘└────┬────┘
                                           ▼               ▼
                    readers and agents: HTML, Markdown, JSON-LD, llms.txt
```

Content, presentation and distribution live apart. The content repository holds Markdown and data and nothing else.
The theme repository holds templates and styles. The site repository pins both as git submodules, adds
configuration, and is the thing Cloudflare builds. Apps get their own repository, and edge functions either live next
to the site or in their own. Each repository has one job, so each one is small enough to reason about, and an agent
working in it does not have to load the world.

## The practices

I found eleven practices that every mature project of mine follows, and that the younger ones are converging on.
They are listed roughly in the order I set them up.

### 1. Start with the agent context, before the first line of code

The first file in every repository is `AGENTS.md`, and in a Claude Code project `CLAUDE.md` simply imports it
(`@AGENTS.md`) and adds the Claude-specific parts. I write it before any code, as the contract the repository works
under: the stack, where each kind of content is registered, what is generated and must never be
edited, how to verify a change, and the rules that always hold. On this site it starts like this:

```markdown
The short version: **content is registered once, in a source file; everything else is generated.**
Never edit a generated file by hand. If a new piece of content does not show up somewhere it should,
the fix is in the source file or in the generator, not in the output.
```

Then come the rules, in `.claude/rules/`, one file per kind of task (content, templates, Rust), each scoped to the
paths it applies to. Then skills, in `.claude/skills/`, for the workflows that repeat: add a page end to end, publish
an article, translate. My most mature project goes further: an organisation-level context repository that every
repository's `AGENTS.md` points to, subagents with restricted tools (the reviewer is read-only and forms its verdict
before it sees the editor's report), and an explicit list of changes that require a human.

Writing it first costs an hour. In return, every later session, mine or an agent's, starts from the same
understanding, and the decisions the rest of this list depends on are made before they are needed.

### 2. Declare the ontology before you write the content

Every site knows a small number of kinds of thing: articles, notes, projects, talks, books, topics. I declare them up
front, each with its register (where instances live), its required fields, its allowed values, and the schema.org
type it becomes for machines. In the blueprint this is `data/kinds.toml`:

```toml
[kinds.article]
register = "content/articles/"
required = ["title", "date", "description", "taxonomies.topics"]
optional = ["updated", "draft", "extra.author", "extra.image"]
jsonld = "BlogPosting"

[kinds.project]
register = "data/projects.toml"
required = ["slug", "title", "description", "status", "url", "topics"]
jsonld = "SoftwareApplication"
enum.status = ["live", "beta", "early", "archived"]
```

A validator enforces it on every pull request, using only the Python standard library so it runs anywhere. Unknown
fields fail, so a typo in `descripton` cannot silently drop a page's description. Topics come from one vocabulary,
with `broader` links that turn the vocabulary into a small graph. On this site the same declarations drive the
[map](/map/), the search index, the JSON-LD and the [ontology page](/ontology/) that explains all of it to readers.

The payoff is that nothing is improvised later. When I add a reading log, a talk, or a new kind of project, the
question is "what kind is it, and where is it registered," not "where should I put this file."

### 3. One GitHub organisation per product, one job per repository

A personal account mixes everything. An organisation gives a product its own members, its own secrets, its own
profile, and room for the repositories it will grow into. I start with the same set:

| Repository | Job |
|---|---|
| `.github` | Organisation profile, shared issue forms, `SECURITY.md`, contributing guide |
| `.claude` | Organisation-wide agent context: rules, skills, decisions, plans |
| `theme` | The Zola theme, versioned on its own |
| `content` | Markdown and data, validated in CI |
| `site` | Configuration and build, pins theme and content as submodules |
| `app`, `worker` | Only when the product needs them |

Two rules keep this healthy. Submodule URLs are HTTPS, so the Cloudflare build can clone them without SSH keys. And
the theme is never copied into a site: I found one organisation where five copies of a theme had drifted from the
original in fourteen to eighteen template files each. A submodule pin makes drift a visible commit instead of an
invisible fork.

### 4. GitHub is the content store and the moderation layer

There is no admin panel, because Git already is one. Every change is a pull request with a diff, a review and a
history. `CODEOWNERS` says who must approve changes to content, headers and edge code. An issue form collects
corrections with a required URL and a dropdown for what is wrong. Contributors submit a pull request from a fork, and
the validator runs before a human looks.

Reader input lands in the same place. The blueprint's only edge function takes the feedback form from every page and
files it as a GitHub issue in the content repository, with mentions defused so nobody can ping your team through your
own site. Feedback, corrections and contributions all end up in one queue, moderated by the same people with the same
tools, and nothing a stranger types ever reaches a page without a review.

Put together, every change follows the same path, whoever starts it:

```
  reader      ──► feedback form ──► Worker ──► GitHub issue ──► triaged ──┐
  editor      ──► branch ─────────────────────────────────────────────────┤
  contributor ──► fork ───────────────────────────────────────────────────┤
                                                                          │
  ┌───────────────────────────────────────────────────────────────────────┘
  ▼
  pull request to the content repository
  │   CI validates the ontology, builds the site, runs the tests
  ▼
  review and approval by CODEOWNERS, then merge to main
  │   a workflow in the content repository calls the Pages deploy hook
  ▼
  Pages rebuilds the site ──► new files on the CDN
```

When content lives in its own repository, one small workflow in it closes the loop: on every push to `main`, it calls
the Pages deploy hook, and the site rebuilds with the new content. Without it, a merged correction waits for the
next unrelated site change.

### 5. Zola, pinned, through mise

Zola is a single binary with no plugin ecosystem to keep patched, it builds this site in a few seconds, and its Tera
templates are expressive enough for everything on this list: the map, the JSON-LD, the topic pages, the Markdown
copies. The one thing to get right is the version. My survey found Zola 0.19, 0.19.2, 0.21, 0.22.1 and 0.23.6 across
my own sites, and the newest release changed its template engine enough that my templates no longer build on it. So
the version is pinned in `mise.toml`, and CI and the Cloudflare build read the same pin:

```toml
[tools]
# 0.23 replaced the template engine; these templates target 0.22.
# Upgrade on purpose, in its own change, never because a machine has a newer zola on PATH.
zola = "0.22.1"
python = "3.13.17"

[tasks.build]
depends = ["check", "llms", "security-txt"]
run = "zola build"
```

mise doubles as the task runner, so `mise run check`, `mise run build` and `mise run dev` mean the same thing on my
laptop, in CI, on Cloudflare and for an agent.

### 6. Cloudflare Pages, and know its limits before it tells you

Pages connects to the GitHub repository, builds on every push, and gives every pull request a preview URL. The build
command is a short script that installs the pinned tools and runs `mise run build`. Two files in `static/` do the
rest: `_headers` for security and caching, `_redirects` to keep old URLs alive when content moves.

The limits are generous and still worth checking locally, because the failure is quiet: 25 MiB per file, 20,000 files
per site on the free plan (100,000 on paid plans), 100 header rules, a twenty-minute build. My most mature project
keeps an incident log of every time one of these bit, each entry with the local check that would have caught it. The
blueprint's build script ends with two of those checks, so an oversized WebAssembly file or a file explosion fails in
CI instead of at upload:

```sh
big=$(find public -type f -size +25M | head -1); [ -z "$big" ] || { echo "too large for Pages: $big"; exit 1; }
n=$(find public -type f | wc -l); [ "$n" -lt 20000 ] || { echo "too many files for Pages: $n"; exit 1; }
```

### 7. Workers only for what a file cannot do

An edge function is the right tool when something needs state, a secret, or a protocol. My Workers each do one thing:
accept a form, proxy two country domains onto language prefixes, sync an offline notes app to
object storage, run a package registry, or serve an MCP server over a static JSON API. They are small, read-only where
they can be, cached, and hold at most one narrowly scoped secret (`wrangler secret put`, never the repository).

The feedback Worker in the blueprint is about sixty lines and does the job a contact form plugin used to do: it checks
the origin, rate-limits per address, drops bots that fill a hidden field, validates the message, and opens one issue
with a fine-grained token that can do nothing else. Its tests run with `node --test` against a stubbed GitHub, so the
logic is checked without deploying anything.

### 8. Apps are static too: Svelte, prerendered, with a service worker

When a project is an app rather than a site, I still ship files. SvelteKit with the static adapter prerenders every
route, and the result deploys to Pages exactly like a Zola site. Svelte compiles away most of its runtime, which
keeps the bundle small, and its runes keep local state in plain variables.

Offline support is what makes an app usable on a train or a plane. SvelteKit's own service worker is enough,
without a plugin. The pattern I use everywhere: one cache per deploy, named after the build version so a new
deploy never mixes with an old one; hashed assets cache-first, because their content can never change; pages
network-first with the cache as the fallback. My language-learning app goes further and picks a strategy per kind of
data, stale-while-revalidate for dictionary shards and network-only for the user's own API calls. Only three of my
apps had a service worker at all. All of them should.

### 9. Rust compiled to WebAssembly, for the right reasons

When an app needs real computation, a chess engine, a neural simulation, a config validator, I write it in Rust and
compile it to WebAssembly. The layout is always the same: a core crate with no wasm or JavaScript in it, tested with
plain `cargo test`, and a thin crate that exports a C ABI over it. No wasm-bindgen unless a framework needs it. The
browser reads results straight out of the module's linear memory. A release profile with fat LTO, one codegen unit
and `panic = "abort"`, then `wasm-opt`, keeps modules small: the blueprint's is 16 KB, and the build fails if it grows
past its budget. Heavy work runs in a Web Worker, so the page never freezes.

```
  main thread               Web Worker                     WebAssembly module
  ┌──────────────┐          ┌──────────────────┐           ┌──────────────────────┐
  │ Svelte UI    │ message  │ render.worker.js │ C ABI     │ crates/wasm          │
  │              ├─────────►│                  ├──────────►│   numbers in, a      │
  │ never blocks │          │ calls in bands   │           │   pointer out        │
  │              │◄─────────┤ of rows          │◄──────────┤                      │
  └──────────────┘ pixels,  └──────────────────┘ reads     │ crates/core          │
                   transferred                   linear    │   plain Rust,        │
                   not copied                    memory    │   tested natively    │
                                                           └──────────────────────┘
```

I wanted the blueprint to show the speed-up, so I measured it. It renders the same Mandelbrot image in Rust and in
JavaScript, side by side, and on that tight floating-point loop Chrome's JavaScript engine was as fast as
WebAssembly: 73 ms against 75 to 92 ms. The first WebAssembly run even took 192 ms, because V8 starts WebAssembly in a
baseline compiler and cannot move a running call onto optimised code, so one long call never gets fast. Rendering in
bands of rows, many short calls instead of one long one, brought it to parity.

The reasons to use Rust in the browser lie elsewhere:

- **One core, many places.** [Zentinel](https://zentinelproxy.io)'s documentation validates every configuration
  snippet in the browser with the real configuration parser, compiled to WebAssembly from the same crate the proxy
  uses. A snippet that would not load in production shows red on the page. The same Rust that runs in a server or a
  desktop app runs in the tab, tested once.
- **Types at the boundary.** The only interface between JavaScript and the logic is a handful of typed numbers and a
  pointer. Everything behind it is checked by the compiler.
- **The work JavaScript is bad at.** 64-bit integer arithmetic, bit boards, tight memory layouts, threads. Kishi's
  chess engine is that kind of code.

### 10. Make it legible to machines

Agents read the web for people now, and a static site is simple for them to read. Every site of mine ships the same
kit:

- `llms.txt` at the root, an index of the site in Markdown, and `llms-full.txt` with the full text.
- A Markdown copy of every page at its URL with `.md`, linked from the page with
  `<link rel="alternate" type="text/markdown">`, served with `Access-Control-Allow-Origin: *`.
- JSON-LD on every page, typed by the ontology: BlogPosting, SoftwareApplication, DefinedTerm, Review, Dataset.
- `robots.txt` with a single group and a Content-Signal line that says what the content may be used for.
- `.well-known/`: `security.txt` with an expiry that a build step keeps a year ahead, an RFC 9727 API catalog, and an
  `auth.md` that states nothing needs authentication, so an agent treats a 403 as a fault, not a policy.
- Where it pays off: a WebMCP script that registers in-browser tools only when an agent is present, an MCP server
  over the static JSON API, IndexNow pings after deploy.

None of this is heavy. It is a few templates and one script that runs before the build, and it means an agent quoting
your site quotes the page, not a scrape of it.

The same discipline covers people who use assistive technology: one `h1`, a skip link, visible focus, labels on
icon-only buttons and canvases, motion only under `prefers-reduced-motion: no-preference`, and every page working
without JavaScript, with scripts adding to it rather than building it.

### 11. Security is mostly saying no

A static site gets most of its security from what it does not do, and the rest from a few lines of configuration:

- **A strict Content Security Policy.** `default-src 'none'`, scripts and styles from `'self'` only, no
  `unsafe-inline`, no `unsafe-eval`. On a Zola site that is easy: no inline scripts, structured data is a JSON block
  the policy does not touch. On a SvelteKit app, `csp.mode = "hash"` hashes the framework's one inline script, and the
  single inline style its screen-reader announcer needs is allowed by its hash with `'unsafe-hashes'`. WebAssembly
  needs `'wasm-unsafe-eval'` and nothing broader.
- **No third parties.** Self-hosted fonts or the system stack, no CDN scripts, no analytics on the page.
- **No secrets in the client.** If a feature needs a key, it is a Worker with one scoped secret, or the user brings
  their own key and it never leaves their browser.
- **Pinned everything.** Tools in `mise.toml`, the Rust toolchain in `rust-toolchain.toml`, npm packages to exact
  versions, GitHub Actions to commit SHAs, with Dependabot proposing the updates as pull requests.
- **Review as a control.** Nothing reaches `main` without a pull request, and the people in `CODEOWNERS` approve
  changes to headers and edge code.

## Hands-on: the blueprint in an afternoon

The two template repositories put all of the above into files:
[blueprint-site](https://github.com/raskell-io/blueprint-site) (Zola, the ontology, the agent context, the machine
kit, the feedback Worker) and [blueprint-app](https://github.com/raskell-io/blueprint-app) (SvelteKit, the service
worker, the Rust core and its WebAssembly boundary). Both build on a fresh clone. These are the steps, in order.

**1. Create the organisation and its first repositories.** On GitHub, create an organisation for the product, then:

```sh
gh repo create your-org/.github --public
gh repo create your-org/site --public --template raskell-io/blueprint-site --clone
cd site
```

**2. Give it context first.** Edit `AGENTS.md`: the product in one sentence, the stack table, the registers. Keep
`CLAUDE.md` as `@AGENTS.md` plus what is specific to Claude. Delete the rules you do not need, add the ones you do.

**3. Declare the ontology.** Edit `data/kinds.toml` until it lists every kind your site will have, and
`data/topics.toml` until it holds your vocabulary. Then run the validator:

```sh
mise install
mise run check
# check_content: ontology holds
```

Then break something on purpose, to see what a mistake looks like. A note with a misspelled field, an undefined
topic and a file name with capitals gets this:

```
content/notes/Bad_Note.md: file name must be a lowercase slug with hyphens
content/notes/Bad_Note.md: missing required field `description` for a note
content/notes/Bad_Note.md: unknown field `descripton` (a note has date, description, draft, taxonomies.topics, title, updated)
content/notes/Bad_Note.md: topic `php` is not defined in data/topics.toml
check_content: 4 problem(s)
```

**4. Write, build, look.**

```sh
mise run dev      # http://127.0.0.1:1111, with drafts
mise run build    # public/: pages, feed, sitemap, llms.txt, .md copies, security.txt
```

Open a page, view its source, and find its JSON-LD; open `/llms.txt`; open the page's URL with `.md` at the end.

**5. Split the theme and the content into their own repositories** once the site works:

```sh
gh repo create your-org/theme --public && gh repo create your-org/content --public
git subtree split --prefix=themes/blueprint -b theme && git push git@github.com:your-org/theme.git theme:main
git subtree split --prefix=content -b content && git push git@github.com:your-org/content.git content:main
git rm -r themes/blueprint content && git commit -m "Theme and content move to their own repositories"
git submodule add https://github.com/your-org/theme.git themes/blueprint
git submodule add https://github.com/your-org/content.git content
```

**6. Connect Cloudflare Pages.** Workers & Pages, Create, Pages, Connect to Git, pick `your-org/site`. Build command
`bash scripts/cf-pages-build.sh`, output directory `public`. Add the custom domain in the project. Create a deploy
hook under Settings, Builds, and store it as `CF_PAGES_DEPLOY_HOOK` in the content repository, with the
`rebuild-site` workflow from the blueprint.

**7. Deploy the Worker,** if you want reader feedback:

```sh
cd worker
npx wrangler secret put GITHUB_TOKEN   # fine-grained: Issues read and write, on the content repo only
npx wrangler deploy
```

**8. Check the headers in production,** because a header that did not apply fails silently:

```sh
curl -sI https://your-domain/ | grep -iE "content-security-policy|x-content-type|referrer|link"
```

For an app, start from `blueprint-app` instead: `mise run test` runs the Rust core's tests and clippy, `mise run
build` builds the WebAssembly module within its budget and then the static app, and the same Pages setup deploys it.

## What I still get wrong

Writing this meant auditing my own projects, and they do not all follow the list. Most of my product sites have no
Content Security Policy, and the few that do still allow inline scripts. Several load fonts from Google, which
contradicts my own theme's "no external requests." Zola versions drift across five releases. Some product sites have
no CI at all and rely on Cloudflare's build to notice problems. Content pushes in my largest project do not trigger a
rebuild, and its CSP still carries `unsafe-inline`. The blueprints are the version where each of those is fixed, and I
am moving the rest of my projects onto them one by one.

## The takeaway

PHP Gate was a week of emergency patching for a large part of the web, and for most of the affected sites, nothing
about their content needed a server in the first place. The safest runtime is the one you never start. Build your
pages when you merge, serve them as files, and keep code for the places it actually has to run. When a project truly
needs a server, give it a real backend, built for the job, and keep everything around it static.

## References

- PHP: [News archive 2026](https://www.php.net/archive/2026.php), the advance notice of 20 October and the security
  releases and advisory of 21 October 2026.
- PHP security advisories [GHSA-w8hw-w9fx-j79w](https://github.com/php/php-src/security/advisories/GHSA-w8hw-w9fx-j79w)
  (CVE-2026-109618) and [GHSA-6wmf-4rv5-p3rp](https://github.com/php/php-src/security/advisories/GHSA-6wmf-4rv5-p3rp)
  (CVE-2026-109619).
- NVD: [CVE-2026-109618](https://nvd.nist.gov/vuln/detail/CVE-2026-109618) and
  [CVE-2026-109619](https://nvd.nist.gov/vuln/detail/CVE-2026-109619).
- Threat Landscape: [PHP core RCEs CVE-2026-109618 and CVE-2026-109619 leak early](https://threatlandscape.io/blog/php-core-rce-cve-2026-109618-109619-leak-ahead-of-embargo),
  on the leak, the name PHP2Shell and the attempts seen afterwards.
- W3Techs: [Usage statistics of PHP](https://w3techs.com/technologies/details/pl-php) and
  [of WordPress](https://w3techs.com/technologies/details/cm-wordpress), figures as of 26 October 2026.
- Cloudflare: [Pages limits](https://developers.cloudflare.com/pages/platform/limits/).
- [llms.txt](https://llmstxt.org/), [Content Signals](https://contentsignals.org/),
  [RFC 9727: api-catalog](https://www.rfc-editor.org/rfc/rfc9727), [RFC 9116: security.txt](https://www.rfc-editor.org/rfc/rfc9116).
- [Zola](https://www.getzola.org/), [mise](https://mise.jdx.dev/), [SvelteKit](https://svelte.dev/docs/kit),
  [Rust and WebAssembly](https://doc.rust-lang.org/rustc/platform-support/wasm32-unknown-unknown.html).
