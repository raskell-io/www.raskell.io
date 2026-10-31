---
title: "Shiioo, Re-imagined, and the Home AI Lab It Runs On"
url: https://raskell.io/articles/shiioo-reimagined-and-a-home-ai-lab/
author: Raffael Schneider
date: 2026-10-30
description: "How I re-imagined Shiioo with what 2026 taught me about agent systems, and why my local setup moves to a Mac Studio and DGX Sparks."
tags: [agents, inference, self-hosting, local-first, gpus, economics, rust, energy]
---

# Shiioo, Re-imagined, and the Home AI Lab It Runs On

## In short

The first *Shiioo* modelled agents as a company with roles, squads and approval boards, but it described my work badly, hid a fragile core, and spent about 40 percent of tokens on agents talking to each other. The re-imagined *Shiioo* is a personal agent workforce for one owner: an append-only, hash-chained event log as the only state, leases with fencing tokens, rules before every tool call, and work handed out from a phone. It hires existing harnesses such as Claude Code and Codex, run headless in their own git worktrees, instead of writing agent personas, so each improvement in the agents arrives the day it ships. A Mac Studio with 256 GB becomes the always-on office for local models, with DGX Sparks planned as CUDA nodes, so subscriptions pay for serious software work and cheap thinking runs on electricity. The lessons are to build the record before the features, build for the user you are, and hire agents rather than write them; the hardware speeds are still ceilings from arithmetic, not measurements.

I work on a lot of things at the same time. At any moment there are more than ten active projects: open source tools, a few early ventures, sites like this one, and passion projects like a [chess engine](https://raskell.io/articles/learning-to-play/) and a simulated neuron culture. None of them is big, and all of them want the same evenings. I have used Claude Code since May 2025, but for most of that year it was AI-assisted development: me at the keyboard, the model helping. Then Anthropic released Claude Opus 4.5 on 24 November 2025, and inside Claude Code it was the first model I trusted with a task while I did something else. Over November and December the work changed shape, and since then most of it has gone through agents I delegate to rather than work beside.

In April I wrote two articles about where that leads. The [first](https://raskell.io/articles/what-sixteen-ai-agents-taught-me-about-management/) was about running sixteen agents in parallel over Christmas with Shiioo, a tool I built to organise them, and how it all worked until the token budget ran out. The [second](https://raskell.io/articles/the-economics-of-inference/) zoomed out from my desk to the economy and ended on one line: the bottleneck was not the architecture, the bottleneck was the meter.

Since then I have upgraded both halves. I re-imagined Shiioo around how I actually work and rebuilt it on what I learned about engineering agent systems over 2026, and the local setup I had been running (an iMac, a gaming PC and this MacBook) is giving way to a Mac Studio with 256 GB of memory, with one or two NVIDIA DGX Sparks to follow. Some of the hardware part is still a plan, and I say so where it is.

## What the first Shiioo was

Many people noticed the same thing at the same time. Over the turn of the year Clawdbot, Peter Steinberger's personal agent that you talk to through your chat apps, spread fast; by the end of January it had been renamed twice and was called [OpenClaw](https://github.com/openclaw/openclaw). If one agent could finish a task, the next problem was running ten. My first answer was [Kage](https://github.com/raskell-io/kage) (影, shadow), started on 3 January, a local-first orchestrator that pooled my subscriptions and spawned Claude Code sessions in the background. Two days later I started again, bigger.

Shiioo (シーイーオー, *shī-ī-ō*, the Japanese reading of CEO, written in katakana like most loanwords) started on 5 January 2026. The repository, now called [shiioo-legacy](https://github.com/raskell-io/shiioo-legacy), has 44 commits up to April and about 44,000 lines of Rust. Its phases read like the table of contents of an enterprise product: a DAG workflow engine, a policy engine, organisation management, a capacity broker, approval boards with quorum, multi-tenancy and high availability, secret management, a GraphQL API, a web dashboard, a Rust SDK, Kubernetes health probes, Prometheus metrics, a skill registry. The first day alone carries nine of those phases.

The model behind it was a company: agents as employees with roles and skills, grouped into squads with leads, reporting up a hierarchy to me. That helped sixteen agents stop contradicting each other, but it described my work badly. I do not run one company with departments; I run a dozen unrelated streams of work that share one person, and the unit that matters is a repository and a task. The new design's decision record names the mismatch:

> The first design docs leaned towards a managed agent cloud (organisations, tenants, Postgres clusters, SDKs), where Omnara and Claude Managed Agents already exist and compete on breadth.

That leaning was deliberate. In January the idea felt new: I knew of nobody else running coding agents as a company with roles, budgets and an approval board, and I saw a product in it. So the first Shiioo went out under the [Business Source License](https://mariadb.com/bsl11/), a source-available licence MariaDB wrote for this kind of plan. Anyone could read, run and change the code, in production too, except to offer Shiioo as a managed service to third parties, which was the business I had in mind. Four years after each release, the code would have turned into Apache-2.0 on its own.

In a way I was right. By spring it felt like everyone was building an agent orchestration platform, and running agents as a managed workforce is now a product category, with Omnara and Claude Managed Agents in it. But I never built the interest a product needs, and it was never my focus either: Shiioo was one of a dozen things I was doing at once, and what I wanted from it was help with the other eleven, not a company to run.

The breadth also hid problems in the core, which the port notes for the new version list. Events were buffered in memory before they were written, so an event that an agent had already acted on could vanish in a crash. The "distributed lock" and "leader election" were `HashMap`s inside one process, shared with nobody. The audit hash chain lived in a `Vec` and was gone after a restart. That is a poor foundation for a system whose main promise was that every decision could be traced back to its origin.

I stopped using it for a different reason, though: about 40 percent of the tokens went to agents talking to each other, and when the holiday limits ended, I could no longer pay for their meetings.

## Shiioo, re-imagined

By the time I came back to it in October, the field had sorted itself into layers. Google open-sourced [AX](https://github.com/google/ax), its Agent Executor: a Kubernetes-style orchestrator that runs agent workloads in a cluster, declared in manifests, suspended and resumed like any other job. NVIDIA built [OpenShell](https://nvidianews.nvidia.com/news/openshell-reference-architecture), a runtime that draws a boundary around an agent and enforces what it may touch, and on 21 October announced a reference architecture around it that reaches down to the DGX Spark. At the other end, [Herdr](https://github.com/ogulcancelik/herdr) put coding agents into a terminal workspace on your own laptop. Between them they cover the data centre, the enterprise and the single terminal. None of them covers my case: one person, a few machines at home, a dozen repositories, and a record of everything the agents did.

The new [Shiioo](https://github.com/raskell-io/shiioo) started on 22 October. Four days and 22 commits later it has 13 crates, about 24,500 lines of Rust and 146 tests, under Apache-2.0 from the first commit. There is no product to protect anymore, and anyone who wants the tool can use it. It is smaller than the legacy code and does more of what I need.

The idea stayed: a workforce of agents I hand work to and hold to account. What changed is what it stands on, which is what I learned about building agent systems over 2026: an append-only log as the only state, leases with fencing tokens instead of locks, deterministic simulation to find the races before they happen, rules that sit in front of every tool call, and agents that already exist, run as they are, instead of personas I wrote myself.

It is built for one person with many projects, a few always-on machines and subscriptions to the good coding agents. That person wants to hand out work from a phone to whichever project needs it, and check what comes back. The decision record calls it "a personal agent workforce, not a managed agent cloud". "Virtual Company OS" survives as the tagline, but the company is only the staff; the work lives in my repositories.

That is the vision for Shiioo 2.0. The office is one always-on machine at home, the nodes are whatever else I own, the employees are the best agent harnesses of the moment, run as they are and replaced when something better comes along, and I sit at the phone, later at a desk. What I trust is the log and the rules, whatever the agents do. The positioning document says it shorter: "Single owner. Local-first. Autonomous by default, approvals by exception."

*The new Shiioo: one office, several machines*

```text
   phone ──Telegram──▶ Telegram API ◀──long-poll──┐
   phone ──Tailscale──▶ https://office.tailnet ───┤
                                                  ▼
                       ┌──────── shiioo server (the office) ────────┐
                       │ event log (redb, hash-chained)             │
                       │ rules and approvals · capacity broker      │
                       │ planner · routines · API + SSE · dashboard │
                       └──────────────────┬─────────────────────────┘
                     nodes dial out over Tailscale, no inbound ports
            ┌─────────────────────┬────────┴──────────┬───────────────────┐
       node in the office    node: DGX Spark     node: DGX Spark     node: the MacBook
       (the Mac Studio)      (/run on:spark)     (maybe, see below)
       runs Claude Code, Codex and local models in git worktrees, per repository
```

**The event log is the only state.** Every run is an append-only, hash-chained log: each model message, tool call, result, rule verdict and approval. The log is written before anything acts on it. Workers hold leases with fencing tokens, so a crashed worker, a laptop that went to sleep or a lost connection means the run resumes from its log, and a side effect does not happen twice. The store is [redb](https://github.com/cberner/redb), embedded, in one directory. A seeded simulation harness crashes and races workers on purpose, so any failure it finds can be replayed.

**Agents are harnesses, not personas.** The first Shiioo modelled each agent as an employee with a skills file, a squad and a lead, and they coordinated by talking. The new one hires agents that already exist: [Claude Code](https://docs.anthropic.com/en/docs/claude-code) on my Claude subscription and [Codex](https://github.com/openai/codex) on my OpenAI subscription, each run headless in its own git worktree and branch of whichever repository the task belongs to. They do not talk to each other: a task goes in, and a branch or a file comes out. Without the org chart, most of the meetings that ate the budget are gone too.

**Rules decide what an agent may do.** A `rules.toml` says per tool, command, path and repository what an agent may do alone (`allow`), what needs me (`ask`) and what never happens (`deny`). Before every tool call the harness asks Shiioo. Most calls are decided at once; an `ask` arrives on my phone as an Allow or Deny button. If the server is unreachable, the answer is deny.

```toml
default = "ask"

[[rules]]
tool = ["Bash", "shell"]
command = "git push --force*"
decision = "deny"
reason = "rewrites shared history"

[[rules]]
tool = ["Bash", "shell"]
command = "git push *"
decision = "ask"
reason = "pushes leave the machine"

[[rules]]
tool = ["Edit", "Write"]
path = "docs/*"
decision = "allow"
```

The first matching rule decides, and a command chained with `&&`, `;` or `|` is checked segment by segment, so `git status && git push` still asks. A rule can be scoped to one repository with `repo`, which matters when a site I can rebuild in a minute sits next to a venture's production code.

**The phone is the interface.** Telegram for handing out work (`/run sango fix the flaky test and open a PR`), approving and being told when something finished; a small dashboard over [Tailscale](https://tailscale.com) for the live log and the diff. The office has no public address: the bot long-polls Telegram, and the dashboard lives on my tailnet. A labelled GitHub issue in any of my repositories works as well, which is how most work arrives anyway.

Some of the old scope came back, smaller. There is a planner (`/plan <repo> <goal>` produces a plan; approving it turns the plan into labelled issues that the intake works through), routines on a schedule I can type (`weekdays 07:00`), a morning report across every project, container isolation with an egress allow list, an encrypted secret store whose values are redacted from the log, and mail an agent can draft but only the office can send, after I tap. What did not come back are tenants, quorum boards, GraphQL and the SDK.

## The hardware I had

I have run models at home for a while. The first Shiioo already had a home: I tested the setup on an iMac with an M2 and 16 GB of memory, which stayed on as the always-on machine. For local inference I used a gaming PC I bought in 2024, a prebuilt Gigabyte Aorus Model S with a Ryzen 9 5900X, 32 GB of memory and a GeForce RTX 3080 with 10 GB of video memory. And much of the actual work happened on the MacBook I am writing this on, an M4 with 16 GB of memory, which is also the machine behind every measurement in the [Learning to Play](https://raskell.io/articles/learning-to-play/) series.

Its limits told me what the next setup needed:

- **Memory decides which models you can run at all.** A gaming GPU has fast memory but not much of it. The 3080 holds about 10 GB, so the models that fit are small, and the ones worth delegating real thinking to do not fit. The MacBook's 16 GB are for the work, not for a model next to it.
- **Three machines with three jobs, and no single record.** Each machine did its part, but nothing knew what the others had done. Which run happened where, with which model, and why, lived in my head.
- **The always-on machine should be the strong one.** The office runs the planner, the log and the local models, so it needs the most memory in the house, not the least. The iMac had 16 GB, the same as the laptop.

New hardware without the new Shiioo would have meant three faster machines and still no record. The new Shiioo without new hardware would have had nowhere to run the work that should not go to a subscription. So I did both.

## What runs where

The capacity broker is where the April lesson ended up in code. Shiioo keeps a list of agents in order, and a new task goes to the first one whose subscription window is not exhausted: Claude Code first, Codex next. The positioning document puts it as a principle: subscriptions and hardware are the scarce resources, not money.

Subscriptions are the right tool for hard software work, done by the best models available. A dozen projects also need a lot of small, cheap thinking: triaging an issue, summarising a night of runs into the morning report, turning a vague request into a plan, reading a log to decide whether a run is stuck, going through a folder of documents I would rather not send anywhere. In the first Shiioo, this was the coordination traffic that used up 40 percent of the budget, running on the same frontier model as the real work. A local model can do most of it, and Shiioo has a third kind of agent for that: its own agent loop, talking to [Ollama](https://ollama.com), [LM Studio](https://lmstudio.ai) or an [MLX](https://github.com/ml-explore/mlx) server on the machine, paid in electricity. Anything private stays on the machine.

The split I am aiming for:

| Work | Who does it | Paid with |
|---|---|---|
| Serious software work, pull requests | Claude Code, then Codex | subscriptions |
| Planning, triage, summaries, the morning report | a local model on the Mac Studio | electricity |
| Private documents, mail drafts, bulk reading | a local model, never the cloud | electricity |
| Fine-tuning, training, CUDA-only tools, renders | a DGX Spark node | electricity |
| The record, the rules, the approvals | the office, always | nothing |

The economics article argued that inference behaves like a utility. In those terms, I still buy from the grid, but I want to generate the base load myself.

## The office: a Mac Studio

The new office is a Mac Studio with the M5 Ultra and 256 GB of unified memory. Apple introduced it on 25 August 2026 and it shipped from 22 September. On Apple's spec page, the 256 GB option comes with the larger chip, a 36-core CPU and an 80-core GPU, and that is the one I ordered: the top configuration, for about CHF 10,000. It has not arrived yet; delivery is about four weeks out.

For running language models, memory bandwidth matters more than core count, and the M5 Ultra has 1.2 TB/s. When a model generates text, each new token has to read essentially all of the model's weights from memory once. A dense 70-billion-parameter model at 4-bit precision is about 35 GB of weights. So the upper bound on generation speed is the bandwidth divided by the bytes read per token:

```text
tokens per second  ≤  memory bandwidth  /  bytes read per token

Mac Studio M5 Ultra   1,200 GB/s / 35 GB  ≈  34 tokens/s   (ceiling)
DGX Spark               273 GB/s / 35 GB  ≈   8 tokens/s   (ceiling)
```

These are upper bounds; real numbers come in below them. Mixture-of-experts models read only their active experts per token, so a model much larger than 70B can still run at a usable speed. The 256 GB decide the rest: the model has to fit, with room left for long contexts and for more than one model loaded at the same time, because the office runs the planner while an agent somewhere else needs a summary.

The Mac Studio is also where the always-on part will live. `shiioo install` sets it up as a login service that starts at boot and keeps the Mac awake, and the office and its first node run in one process. Until it arrives, the new Shiioo runs only as a development instance on the iMac, which is where the first one was tested too. So the speeds above are ceilings from arithmetic, not measurements, and the measured ones go into the follow-up.

## The nodes: one or two DGX Sparks

The [DGX Spark](https://docs.nvidia.com/dgx/dgx-spark/hardware.html) makes the opposite trade. It is a 150 by 150 millimetre box with NVIDIA's GB10 chip, which has 20 Arm cores, a Blackwell GPU with 6,144 CUDA cores, up to 1 petaFLOP of FP4 compute with sparsity, and 128 GB of unified memory at 273 GB/s. With less than a quarter of the Mac's bandwidth, it is slow at generating text from a large model, but it runs everything that needs CUDA: fine-tuning, training, the parts of the ecosystem that only run on NVIDIA, and GPU jobs like renders and audio. Compared with the gaming PC, it gives up raw GPU speed for far more memory and the same NVIDIA software stack that data centres run.

It also has a ConnectX-7 network card. Two Sparks connect directly with a QSFP cable at 200 Gb/s, no switch, and NVIDIA says the pair handles models up to 405 billion parameters, against 200 billion for one.

| | Mac Studio M5 Ultra | DGX Spark (128 GB) |
|---|---|---|
| Memory | 256 GB unified | 128 GB unified |
| Bandwidth | 1.2 TB/s | 273 GB/s |
| Compute | 36-core CPU, 80-core GPU | 20-core Arm CPU, Blackwell GPU, 1 PFLOP FP4 (sparse) |
| Software | macOS, MLX, Metal | DGX OS, CUDA |
| Linking | Thunderbolt 5, RDMA (per Apple) | ConnectX-7, 200 Gb/s QSFP |
| Role in Shiioo | the office, large-model inference | nodes: training, CUDA work, GPU jobs |

In Shiioo a Spark is a node. It runs `shiioo node`, enrolls with a one-time token, dials out to the office over Tailscale, and takes the runs addressed to it. From the phone that is `/run on:spark …`. The node works against the office's log over HTTP, so a Spark that loses power in the middle of a fine-tuning run is the same case as a Claude Code run on a laptop that went to sleep: the lease expires, the run resumes, nothing happens twice. Every run, on every machine and for every project, lands in the same record, which the old setup never had.

The concrete thing I want a Spark for first is [Kishi](https://kishi.raskell.io), my chess, shogi and Go engine. Its networks learn by self-play, and so far all of that has run on a laptop with 16 GB of memory. I want self-play to run overnight on a machine other than my laptop, started from my phone, with the result in the morning report.

The open questions were which and how many. The 128 GB Spark launched at $3,999. By the start of October it listed at $6,950, with NVIDIA citing memory supply, and from 23 October there is a 64 GB version for $4,999. Two 64 GB boxes cost more than one 128 GB box and give the same memory, split across a cable. Two 128 GB boxes give the 405B configuration for about $14,000. I will take the 128 GB version: the point of the box is memory, and halving it to save 28 percent of the price is the wrong trade. Whether a second one follows depends on what the first one measures.

## Next: a desk to sit at

The phone works for handing out work and answering a request to push. It does not work for a Saturday with six projects open at once. For that I want what Herdr gets right. It is written in Rust under Apache-2.0. It keeps one workspace per repository, marks each agent as working, blocked or idle, and its background server keeps the terminals alive when the window closes or the SSH connection drops. Agents can drive it through a local socket: open panes, prompt each other, wait until another agent needs input.

Shiioo already has the hard half of that. The office keeps the log, the leases and the workers, and it survives a reboot: a run picks up from its log, where a terminal multiplexer can restore the layout but not the processes that were running in it. What is missing is the surface. The design for it, the desk, is the next phase, and it has three parts:

- **A workspace.** On a wide screen the dashboard becomes a sidebar with one space per repository, a "Needs you" group on top with every pending approval across all projects, the machines with what each one is running, and several runs open side by side, each with its diff next to the request that would push it.
- **Talking to a running employee.** A message to a run ("use the existing retry helper, do not add a dependency") reaches the agent at its next turn, or interrupts it now. A finished run can be followed up on the same branch and the same session.
- **Taking over.** One button opens the agent's own terminal in the run's worktree, resumed from its session, with the rules still active. I type to Claude Code as I would on my laptop; an `ask` still asks, and a `deny` still denies. When I hand back, the transcript goes into the log, so the ten minutes I spent at the keyboard are on the record like everything else.

Everything goes through the same API as the phone, so a native app in the spirit of Herdr becomes one more client later, not a second product. Once the Mac Studio is here, I expect to spend most of my Shiioo time at the desk.

## What I will measure

Everything above is a plan with arithmetic behind it. The follow-up should be measurements, and since the claims in this article can be wrong in specific ways, I would rather write down now what I will measure and what would prove me wrong.

| Question | How I will measure it | What would prove me wrong |
|---|---|---|
| How fast are the local models? | Generation and prompt-processing speed for the models the planner and triage use, on the Mac Studio, the gaming PC and the MacBook | Generation far below the bandwidth ceiling, or long prompts that take minutes before the first token |
| Are they good enough? | A week of triage and planning tasks done twice, by a local model and by Claude Code, compared without knowing which is which | I prefer the frontier answer most of the time |
| Does work move off the subscriptions? | Runs per employee and per project from the log, and how often the capacity broker sees a window exhausted | The Claude window still runs out in the same weeks as before |
| What does it cost to run? | A metering plug on the Mac Studio and the Spark for a month | The electricity costs more than the subscription tier it replaces |
| How much of me does it need? | Approvals per day and the time from request to answer | More than a handful a day, or approvals I tap without reading |
| Does a second Spark earn its cable? | Jobs that did not fit, or waited, on one Spark | Nothing ran out of memory or waited overnight |

Most of these are queries over the log rather than a separate tool. When a harness session ends, Shiioo records the harness's own summary, with its token usage and, where the harness reports it, the cost. When a provider reports its rate-limit windows, such as Claude's five-hour and seven-day windows, that is an event too. Every rule verdict and every approval, with who answered and when, is in the same record. The numbers for the follow-up should come out of the system I am measuring, not out of a spreadsheet I keep next to it.

Two of the rows are less obvious. Prompt processing is where the Spark may well beat the Mac: reading a long prompt is limited by compute, not memory bandwidth, and a planner that reads a whole repository's issues before it writes a plan spends most of its time there. The approvals row measures something hardware cannot fix. If the rules ask me too often, I stop reading the requests, and then the approval button protects nothing. I will count that as a failure even if every other number looks good.

## What I took from it

The expensive part of the first Shiioo was agents coordinating with each other, and that is the work that needs the best model least. The new design removes most of it, and the new machines run what is left at home. Three other lessons came with it.

**Build the record before the features.** The first Shiioo had approval boards, multi-tenancy and a GraphQL API on top of a log that could lose events in a crash. The new one started with the log, the leases and a simulation that tries to break them, and everything else came afterwards. It took four days to get back most of the features I use, and it would have taken much longer to make the old core correct under them.

**Build for the user you are.** I designed the first Shiioo for a market I imagined: companies running agents as a managed service, under a licence that protected that business. The user I actually had was me, with a dozen projects and one phone. Once I designed for that user, half the scope went away, and the rest became something I will actually use.

**Hire the agents, do not write them.** In the eleven months since Opus 4.5, the agents have improved faster than anything I could have built around them. A system that runs Claude Code and Codex as they are gets each improvement on the day it ships. A system with its own agent personas would need me to keep up with them. What Shiioo owns is the part that does not improve on its own: the record, the rules and where the work runs.

The hardware follows from the same idea. Faster machines without a shared record would have been three faster islands. With the record in place, a new machine is one more node, and I can measure what each one is worth.

## References

- Shiioo, the new version: [github.com/raskell-io/shiioo](https://github.com/raskell-io/shiioo); its [positioning](https://github.com/raskell-io/shiioo/blob/main/docs/positioning.md) and [ADR-0008](https://github.com/raskell-io/shiioo/blob/main/docs/adr/0008-personal-workforce-not-managed-cloud.md)
- Shiioo, [the desk design](https://github.com/raskell-io/shiioo/blob/main/docs/design/desk.md) (phase 8, a requirements draft)
- Herdr: [github.com/ogulcancelik/herdr](https://github.com/ogulcancelik/herdr)
- Google, AX (Agent Executor): [github.com/google/ax](https://github.com/google/ax)
- NVIDIA, [OpenShell Reference Architecture for Safe AI Agents](https://nvidianews.nvidia.com/news/openshell-reference-architecture) (21 October 2026)
- OpenClaw: [github.com/openclaw/openclaw](https://github.com/openclaw/openclaw); Business Today, [Clawdbot becomes OpenClaw](https://www.businesstoday.in/technology/news/story/the-lobster-sheds-its-shell-for-the-third-time-as-clawdbot-becomes-openclaw-513650-2026-01-30) (30 January 2026)
- Kage: [github.com/raskell-io/kage](https://github.com/raskell-io/kage)
- Shiioo legacy: [github.com/raskell-io/shiioo-legacy](https://github.com/raskell-io/shiioo-legacy)
- Apple, [Mac Studio tech specs](https://www.apple.com/mac-studio/specs/)
- Invide Labs, [M5 Ultra Mac Studio raises AI bandwidth to 1.2TB/s](https://blog.invidelabs.com/m5-ultra-mac-studio-local-ai/) (dates and configurator prices, checked 26 August 2026)
- NVIDIA, [DGX Spark hardware overview](https://docs.nvidia.com/dgx/dgx-spark/hardware.html)
- StorageReview, [NVIDIA DGX Spark 64GB, October 23, $4,999](https://www.storagereview.com/news/nvidia-dgx-spark-64gb-october-23-4999-two-units-cluster-to-128gb)
- AI Weekly, relaying Tom's Hardware, [Nvidia launches 64GB DGX Spark at $4,999 as 128GB hits $6,950](https://aiweekly.co/alerts/nvidia-launches-64gb-dgx-spark-at-4999-as-128gb-hits-6950)
