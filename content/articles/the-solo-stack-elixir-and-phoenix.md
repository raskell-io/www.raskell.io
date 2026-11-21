+++
title = "The Solo Stack: Elixir and Phoenix When the Site Has to Do Things"
date = 2026-11-19
draft = true
description = "When a project outgrows the static web and there is still only one of me: Elixir, Phoenix and the BEAM doing the heavy lifting."

[taxonomies]
tags = ["elixir", "distributed-systems", "self-hosting", "developer-tooling", "entrepreneurship"]

[extra]
author = "Raffael"
reads = ["elixir-in-action"]
in_short = [
  "The static blueprint stops at five signs: accounts, many writers, real time, heavy or secret work, and data that does not fit a build. Each of them maps to something Phoenix or the BEAM already ships.",
  "What a typical stack splits into a web tier, a cache, a broker, a websocket service and a cron box, the BEAM runs as one release next to one database, which is what makes it a stack one person can hold in their head.",
  "Phoenix 1.8 generates authentication with magic links and scopes into your own code, LiveView and Presence handle live state without a JavaScript app, and Oban keeps background jobs in the database you already have.",
  "Three of my six Phoenix apps run on SQLite and three ship Rust NIFs for the CPU-heavy parts, and broodwar.live shows the honest middle: a static Zola site in front of a small Phoenix JSON API.",
  "It hurts in known places: a small hiring pool, types still arriving, CPU-bound work that belongs in Rust, generated auth code that never updates itself, and Archipelag.io still needing NATS to talk to its Rust workers.",
]
+++

<!--
DRAFT NOTES (remove before publish)
1. broodwar.live's database: SQLite, confirmed in api.broodwar.live (ecto_sqlite3). Almost Irrelevant was corrected
   on 2026-11-21 (code comment; the two-node diagram now says it assumes PostgreSQL).
2. Where each app runs today (Fly, or the Hetzner box with Vela), and whether any of them runs more than one
   clustered node. The draft says "most of mine run on one node"; confirm.
3. A real crash the supervisor absorbed in production would beat the illustrative ones. Ask Raffael.
4. Sources: every outside quote and figure was re-fetched and checked on 2026-11-21 (AutoCodeBench Table 4:
   Claude Opus 4 Elixir Pass@1 80.3 reasoning, 82.3 non-reasoning, its best language).
5. Elixir v1.21: as of 2026-11-19 there was no release post. Re-check the Elixir blog on release day and update the
   types paragraph if it shipped.
6. The sibling article, The Enterprise Stack, is also a draft; publish the two together or drop the link.
7. Hero prompt, Korean and Chinese translations.
-->

[A Blueprint for the Static Web](/articles/a-blueprint-for-the-static-web/) ends where most of my projects eventually go: the moment a site has to *do* things. Its last practical section lists [the signs that you need a backend](/articles/a-blueprint-for-the-static-web/#when-you-do-need-a-backend): people have accounts, many people write, things happen in real time between users, the work is heavy or long or secret, or the data no longer fits in a build. When two or more are true, I build one.

The problem is that I am one person. I have a day job, more than ten projects, and evenings that are already spoken for. A backend that needs a web tier, a Redis, a job broker, a websocket service and a cron box is not a backend I can run by night. So for anything that has to do things, live, for many people, I reach for the same stack almost every time: Elixir, Phoenix, and the BEAM underneath them.

I made the short case for Elixir in [Almost Irrelevant](/articles/almost-irrelevant/#elixir-for-platforms-that-are-distributed-by-nature): processes, supervision trees, Oban, the types that are arriving. This piece is the long one, about everything that article skipped. Accounts, live views, presence, deploys, operations, and the places where it hurts.

## Five signs, five answers

The Blueprint's five signs are a good spine, because each of them maps to something Phoenix or the BEAM already ships. That mapping is most of my argument.

| The sign | What answers it | What I do not have to run |
|---|---|---|
| People have accounts and their own data | `mix phx.gen.auth`: magic links, scopes, sudo mode, generated into my code | an identity service |
| Many people write | Ecto and a database (Postgres or SQLite), with changesets and scopes | an ORM fight |
| Things happen in real time between users | LiveView, Phoenix.PubSub, Presence, Channels | a separate websocket service and a pub/sub broker |
| The work is heavy, long, or secret | Oban jobs in the same database; Rust NIFs for CPU work | a job broker and a worker fleet |
| The data does not fit in a build | Phoenix as an API, with the static site still in front | a second front end |

The right-hand column is the point. Every row is a system I would otherwise operate, patch, monitor and pay for. On the BEAM most of them are libraries inside one release.

## One runtime instead of five

David Heinemeier Hansson called Rails [*"The One Person Framework"*](https://world.hey.com/dhh/the-one-person-framework-711e6318) in 2021: *"A toolkit so powerful that it allows a single individual to create modern applications upon which they might build a competitive business."* I agree with him about Rails, and about Laravel and Django too. They get one person to a solid application with a database, forms and accounts very quickly.

My claim is narrower. Rails gets one person to a CRUD application. The BEAM gets one person to the parts that usually need a *second system*: thousands of open connections, live state shared between users, a cluster, a pub/sub bus, jobs that survive restarts. Those are the parts where a small stack quietly turns into a large one.

{% diagram(title="What a typical stack runs, and what the BEAM runs") %}
  a typical web stack                     the solo stack
  ┌──────────────────────────┐            ┌────────────────────────────────┐
  │ web tier (n instances)   │            │ one release (mix release)      │
  ├──────────────────────────┤            │  ├─ Endpoint: HTTP, websockets │
  │ websocket service        │            │  ├─ LiveView: per-user state   │
  ├──────────────────────────┤            │  ├─ PubSub + Presence          │
  │ Redis: pub/sub, cache    │            │  ├─ Oban: queues, cron, retry  │
  ├──────────────────────────┤            │  └─ NIFs: Rust for hot loops   │
  │ job broker + workers     │            └───────────────┬────────────────┘
  ├──────────────────────────┤                            │
  │ cron box                 │                            ▼
  ├──────────────────────────┤                  Postgres or SQLite
  │ database                 │
  └──────────────────────────┘
       six things to deploy                    two things to deploy
{% end %}

None of this is new. Joe Armstrong's [2003 thesis](https://erlang.org/download/armstrong_thesis_2003.pdf) describes a research program *"started in 1981 to find better ways of programming Telecom applications"*, and its premise is the one that matters to a solo developer: *"We assume that such programs do contain errors, and investigate methods for building reliable systems despite such errors."* The slogans are in section 4.3: *"Let some other process do the error recovery."* and *"Let it crash."* When you are the only person on call, a runtime that expects failure and restarts the failed part without waking you is not a philosophy. It is a staffing plan.

If you want to understand the model properly, Saša Jurić's [*Elixir in Action*](/reading/#elixir-in-action) is still the book I recommend, and his talk [The Soul of Erlang and Elixir](https://gotopia.tech/sessions/712/the-soul-of-erlang-and-elixir) shows it in forty minutes of live demos.

## What Phoenix puts in the box

### Accounts, generated into your code

Since [Phoenix 1.8](https://www.phoenixframework.org/blog/phoenix-1-8-released) (August 2025), `mix phx.gen.auth` *"now uses magic links by default for login and registration"*, and it introduces scopes, *"a new first-class pattern in Phoenix, designed to make secure data access the _default_."* A scope is a struct that carries who is asking, and the generated code passes it into every query:

```elixir
# lib/my_app/notebooks.ex, as the 1.8 generators shape it (illustrative)
def list_notebooks(%Scope{} = scope) do
  Repo.all_by(Notebook, user_id: scope.user.id)
end

def get_notebook!(%Scope{} = scope, id) do
  Repo.get_by!(Notebook, id: id, user_id: scope.user.id)
end
```

The forgotten `WHERE user_id = ?` is one of the oldest bugs on the web. Making the scope the first argument of every function turns it into something you have to remove on purpose.

The detail I value most: the code is generated into the app, where I can read and change it. The [guide](https://phoenix.hexdocs.pm/mix_phx_gen_auth.html) says so plainly: *"you now have complete freedom to modify the authentication system"*, and *"it will not be updated after it's been generated."* That is the right trade for one person who wants to understand every line between a login form and a session, and it is also a cost I come back to below.

### Live state without a JavaScript app

[LiveView](https://www.phoenixframework.org/blog/phoenix-liveview-1.0-released) reached 1.0 in December 2024, *"six years after the first LiveView commit"*, and Chris McCord's stated goal was to build rich applications *"without writing JavaScript."* In [How We Got to LiveView](https://fly.io/blog/how-we-got-to-liveview/) he describes the idea in one line: the server can *"model the entire user visit as a cheap bit of concurrency on the server."* Each visitor is a process holding their state; events come in over a websocket, and only the changed parts of the page go back out.

Add PubSub and Presence and a page becomes shared. Cyanea has a version of this for showing who else has a notebook open. Stripped down, the shape is:

```elixir
# who is looking at this notebook, live (illustrative)
def mount(%{"id" => id}, _session, socket) do
  topic = "notebook:" <> id
  if connected?(socket) do
    Phoenix.PubSub.subscribe(MyApp.PubSub, topic)
    MyAppWeb.Presence.track(self(), topic, to_string(socket.assigns.current_scope.user.id), %{})
  end
  {:ok, assign(socket, topic: topic, viewers: MyAppWeb.Presence.list(topic))}
end

def handle_info(%Phoenix.Socket.Broadcast{event: "presence_diff"}, socket) do
  {:noreply, assign(socket, viewers: MyAppWeb.Presence.list(socket.assigns.topic))}
end
```

Two things happen under that code that would be separate systems elsewhere. [Phoenix.PubSub](https://phoenix-pubsub.hexdocs.pm/Phoenix.PubSub.html) by default *"uses Distributed Elixir, directly exchanging notifications between servers"*, so there is no Redis in the middle. And Presence sits on [Phoenix.Tracker](https://phoenix-pubsub.hexdocs.pm/Phoenix.Tracker.html), which uses *"a heartbeat protocol and CRDT to replicate presence information across a cluster in an eventually consistent, conflict-free manner. Under this design, there is no single source of truth or global process."* A conflict-free replicated data type, shipped in the box, so that a list of who is online survives a node going away.

### A dashboard you did not build

[LiveDashboard](https://phoenix-live-dashboard.hexdocs.pm/Phoenix.LiveDashboard.html) ships with every new app and shows telemetry, processes, ETS tables, and the operating system, live, in the browser. For one person it covers most of what I would otherwise wire into a metrics stack on day one. When a project grows up, the Zentinel control plane shows the next step: OpenTelemetry instrumentation for Phoenix and Ecto, exported like any other service.

## Data, jobs, and the boring rest

**Data.** [Ecto](https://hexdocs.pm/ecto/Ecto.html) keeps queries composable and validation explicit, in changesets, and it leaves the database in plain view. The database does not have to be Postgres. Three of my six Phoenix apps run on SQLite, which for a single node on a single machine removes one more thing to operate.

**Jobs.** [Oban](https://hex.pm/packages/oban) stores jobs in Postgres, SQLite3 or MySQL, which means retries, uniqueness, cron and queues live in the database I already back up. [Oban Web became open source](https://oban.pro/articles/oss-web-and-new-oban) in January 2025 under Apache 2.0, so the job dashboard is free too. Oban Pro costs [$150 a month](https://oban.pro/pricing); none of my apps need it.

**Releases.** `mix release` [*"Assembles a self-contained release"*](https://mix.hexdocs.pm/Mix.Tasks.Release.html) that includes the runtime, so the server needs nothing installed. One myth to retire: the BEAM's famous hot code upgrades are not something Elixir releases do for you. The docs say so: *"The reason we don't provide hot code upgrades is because they are very complicated to perform in practice."* What people actually do is a rolling or blue-green deploy.

**Deploys.** I wrote the long version of my own path in [How AI Makes Bare Metal Viable Again](/articles/how-ai-makes-bare-metal-viable-again/): from Kubernetes, via Fly, to one Hetzner server and [Vela](https://github.com/raskell-io/vela), a single Rust binary that knows how to run a BEAM release with blue-green deploys. If you would rather not write a deployer, [Fly's clustering guide](https://docs.fly.io/elixir/the-basics/clustering) gets several nodes talking with `dns_cluster` and a shared cookie, and [Kamal](https://kamal-deploy.org/) deploys any container to your own machines. Most solo apps do not need a cluster at all. One node, with its own supervision tree inside and a process supervisor outside, goes a long way.

## What my own apps actually use

The stack is easier to judge in use than in a feature list. Six of my Phoenix apps, as their repositories show them:

| App | Front end | Database | Jobs | Native code | Notes |
|---|---|---|---|---|---|
| [Archipelag.io](https://archipelag.io) | LiveView, Channels | Postgres | Oban, five queues | none | NATS carries jobs to the Rust host agents |
| [broodwar.live](https://broodwar.live) API | none: JSON for a Zola site | SQLite | Oban, with a cron plugin | Rust replay parser | the hybrid below |
| [Humankind](https://humankind.plus) | LiveView, Presence | Postgres and pgvector | Oban, eight queues | Rust for audio, crypto, images | passkeys, field encryption |
| [Cyanea](https://cyanea.bio) | LiveView, Presence | SQLite | Oban, seven queues | Rust analysis core | the heaviest NIF user |
| Zentinel control plane | LiveView, GraphQL | Postgres or SQLite | Oban | none | OpenTelemetry, OIDC, SAML |
| [Driftscape](https://github.com/raskell-io/driftscape) | LiveView | SQLite | none | none | early |

A few patterns stand out. Every one of them uses the Phoenix 1.8 defaults (Bandit, DNSCluster, Req, telemetry) and almost nothing exotic: no Broadway, no Ash, no Oban Pro. Half run on SQLite. Half ship Rust through [Rustler](https://github.com/rusterlium/rustler), which is my answer to the BEAM's weakest spot.

### The honest middle: broodwar.live

The project I would show someone first is the one with the least Phoenix in it. [broodwar.live](https://broodwar.live) is a static Zola site, built exactly as the Blueprint describes, and behind it sits `api.broodwar.live`: a small Phoenix JSON API with no LiveView at all. Oban polls tournament streams every three minutes and ingests pages from Liquipedia, a Rust NIF parses StarCraft replays, and the data lives in one SQLite file.

That is the answer I give when someone asks how much backend they need. Keep everything that can be static static. Put the parts that have to do things behind a small API on the BEAM. The two halves deploy separately, fail separately, and each stays small enough to understand.

## Agents write Elixir better than you might expect

The usual objection to Elixir is the hiring pool, and it is real: in the [Stack Overflow Developer Survey 2025](https://survey.stackoverflow.co/2025/technology/), 2.7% of respondents used Elixir and 2.4% used Phoenix. For a company that is a cost. For one person working with agents, it matters less than it used to.

Phoenix itself has noticed. New apps from 1.8 on include an `AGENTS.md` whose guidelines *"correct common mistakes LLMs make with syntax, idioms, and critical API usage."* [Tidewave](https://tidewave.ai/), from Dashbit, connects a coding agent to the running application, so it can read logs, run code and query the database instead of guessing. And on [AutoCodeBench](https://arxiv.org/abs/2508.09101), a 2025 benchmark of 3,920 problems in twenty languages, Elixir was among the strongest languages for frontier models: Claude Opus 4 scored above 80% Pass@1 on it, higher than on any other language. The caveat matters: the Elixir problems were produced by translating Python ones, so the benchmark measures how well models write Elixir, not how hard Elixir problems are.

The plausible reasons are plain ones: the language is small, the idioms are strong, and pattern matching puts the intent on the page. As I wrote in Almost Irrelevant, I still review agent-written Elixir more carefully than agent-written Rust, for the reason that opens the next section.

## Where it hurts

**Types are still arriving.** [Elixir 1.20](https://elixir-lang.org/blog/2026/06/03/elixir-v1-20-0-released), released in June 2026, can *"perform type inference and gradually type check every Elixir program, without introducing type annotations"*. Typed structs and type signatures are [next on the roadmap](https://elixir-lang.org/blog/2026/01/09/type-inference-of-all-and-next-15/), and the November post on [narrowing with reverse arrows](https://elixir-lang.org/blog/2026/11/10/inference-narrowing-reverse-arrows/) shows the work moving fast, but until signatures land a good share of correctness lives in tests. If that is the deciding factor, Gleam runs on the same VM with a full type system, and my own [Refrakt](https://refrakt.raskell.io) is a Phoenix-like framework for it.

**CPU-bound work does not belong on the BEAM.** The scheduler is built for many small tasks, not one long one. The [erl_nif documentation](https://www.erlang.org/doc/apps/erts/erl_nif.html) expects a well-behaved native function to return *"within 1 millisecond"*, and anything longer has to run on dirty schedulers. Worse, [a crash in a NIF](https://www.erlang.org/doc/system/nif.html) *"brings the emulator down too."* Rustler exists for exactly this: its stated goal is that a Rust NIF *"should never be able to crash the BEAM."* Discord made the same move in 2019: its sorted member list became [a Rust NIF](https://discord.com/blog/using-rust-to-scale-elixir-for-11-million-concurrent-users) whose worst case was 3.68 microseconds across sets of 5,000 to 1,000,000 items, after one of the pure Elixir attempts had taken 640 microseconds for a single insert into a list of 250,000. Three of my apps do this. It works, and it costs a Rust toolchain in every build.

**Generated code does not update itself.** The same property I praised in `phx.gen.auth` means a security fix in the generator does not reach an app generated last year. Someone has to read the generator's changelog and port the fixes by hand, and with generated code that someone is you.

**Not everything stays on the BEAM.** Archipelag.io is the exception to my own pitch. Its coordinator is Phoenix, but the hosts that run jobs are Rust agents, and talking to non-BEAM nodes still needs a broker, so it runs NATS. The BEAM removes the infrastructure between BEAM nodes; between languages, you still need some.

**LiveView holds state per visitor.** Every connected user is a process with memory on the server, and every interaction is a round trip. McCord himself writes that *"When LiveView is close to your users, interactions are immediate"*, which is also the condition. On a flaky mobile connection far from the server, a page that renders in the browser can feel better. For most of my apps the trade is worth it; for a public site with heavy anonymous traffic it would not be.

**Clustering is easy until it is not.** On Fly it is a DNS query and a cookie. On bare metal it is cookies, an open distribution port, and the question of what happens when two nodes stop seeing each other. My answer, for one person, is to avoid it: run one node until the day you cannot, and that day comes later than you think.

## What I would not build this way

- **Heavy computation.** Cyanea compiles Rust into its release for a reason. If the core of the product is number crunching, the BEAM should be the coordinator, not the worker.
- **A company's shared services.** When many teams own the code, I want the language they can all read, which is Go, and a platform shape built for many teams. That is the subject of [The Enterprise Stack](/articles/the-enterprise-stack-nextjs-go-and-temporal/), the companion to this piece.
- **Anything a static site can do.** The Blueprint still comes first. The best backend is the one you did not need to build.

For everything else, the projects where people log in, see each other, and wait for work to finish, the BEAM is the closest thing I know to a team in a box. What it does is shrink the system until one person is enough to run it.

## References

- Joe Armstrong, [Making reliable distributed systems in the presence of software errors](https://erlang.org/download/armstrong_thesis_2003.pdf), PhD thesis, Royal Institute of Technology (KTH), Stockholm, 2003.
- Saša Jurić, [*Elixir in Action*](https://www.manning.com/books/elixir-in-action-second-edition), second edition, Manning, 2019.
- Erlang/OTP documentation, [Supervisor Behaviour](https://www.erlang.org/doc/system/sup_princ.html), [Processes](https://www.erlang.org/doc/system/eff_guide_processes.html), [erl_nif](https://www.erlang.org/doc/apps/erts/erl_nif.html), and [NIFs](https://www.erlang.org/doc/system/nif.html).
- David Heinemeier Hansson, [The One Person Framework](https://world.hey.com/dhh/the-one-person-framework-711e6318), HEY World, 2021.
- Phoenix documentation, [Overview](https://hexdocs.pm/phoenix/overview.html) and [mix phx.gen.auth](https://phoenix.hexdocs.pm/mix_phx_gen_auth.html), Phoenix Framework.
- Chris McCord, [Phoenix 1.8.0 released!](https://www.phoenixframework.org/blog/phoenix-1-8-released), Phoenix Framework blog, 2025.
- Chris McCord, [Phoenix LiveView 1.0.0 is here!](https://www.phoenixframework.org/blog/phoenix-liveview-1.0-released), Phoenix Framework blog, 2024.
- Phoenix LiveView documentation, [Welcome](https://hexdocs.pm/phoenix_live_view/welcome.html), Phoenix Framework.
- Chris McCord, [How We Got to LiveView](https://fly.io/blog/how-we-got-to-liveview/), Fly.io blog.
- Phoenix.PubSub documentation, [Phoenix.PubSub](https://phoenix-pubsub.hexdocs.pm/Phoenix.PubSub.html) and [Phoenix.Tracker](https://phoenix-pubsub.hexdocs.pm/Phoenix.Tracker.html), Phoenix Framework.
- Phoenix LiveDashboard documentation, [Phoenix.LiveDashboard](https://phoenix-live-dashboard.hexdocs.pm/Phoenix.LiveDashboard.html), Phoenix Framework.
- Ecto documentation, [Ecto](https://hexdocs.pm/ecto/Ecto.html) and [Ecto.Repo](https://hexdocs.pm/ecto/Ecto.Repo.html), Hex.
- Oban documentation, [Oban](https://hexdocs.pm/oban/Oban.html), and the [package page](https://hex.pm/packages/oban), Hex.
- Oban, [OSS Oban Web and Oban v2.19](https://oban.pro/articles/oss-web-and-new-oban), oban.pro, 2025; [Pricing](https://oban.pro/pricing), oban.pro.
- Mix documentation, [mix release](https://mix.hexdocs.pm/Mix.Tasks.Release.html), Elixir.
- Fly.io documentation, [Clustering your application](https://docs.fly.io/elixir/the-basics/clustering), Fly.io; [Kamal](https://kamal-deploy.org/), 37signals.
- [Rustler](https://github.com/rusterlium/rustler), rusterlium, GitHub.
- Matt Nowack, [Using Rust to Scale Elixir for 11 Million Concurrent Users](https://discord.com/blog/using-rust-to-scale-elixir-for-11-million-concurrent-users), Discord, 2019.
- José Valim, [Elixir v1.20 released](https://elixir-lang.org/blog/2026/06/03/elixir-v1-20-0-released), Elixir blog, 2026.
- José Valim, [Type inference of all constructs and the next 15 months](https://elixir-lang.org/blog/2026/01/09/type-inference-of-all-and-next-15/), Elixir blog, 2026.
- José Valim and Guillaume Duboc, [Type inference and narrowing with reverse arrows](https://elixir-lang.org/blog/2026/11/10/inference-narrowing-reverse-arrows/), Elixir blog, 2026.
- Jason Chou and others, [AutoCodeBench: Large Language Models are Automatic Code Benchmark Generators](https://arxiv.org/abs/2508.09101), arXiv:2508.09101, 2025.
- Stack Overflow, [Developer Survey 2025: Technology](https://survey.stackoverflow.co/2025/technology/), Stack Overflow, 2025.
- Dashbit, [Tidewave](https://tidewave.ai/), Dashbit.
- Saša Jurić, [The Soul of Erlang and Elixir](https://gotopia.tech/sessions/712/the-soul-of-erlang-and-elixir), GOTO Chicago, 2019.
