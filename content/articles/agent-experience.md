+++
title = "Agent Experience: The Third Reader of Everything You Build"
date = 2026-11-24
draft = true
description = "UX serves the people who use a system and DX the people who build it. Agents now do both, and how much they have to guess has become a design concern."

[taxonomies]
tags = ["agent-experience", "agents", "ai-engineering", "developer-tooling", "context-engineering", "legibility", "interfaces"]

[extra]
author = "Raffael"
in_short = [
  "When agents write the code, developers spend less time on syntax and patterns and more on architecture, integration and requirements, and the tools the agents drive matter more than ever.",
  "Agent experience, a term Mathias Biilmann introduced in 2025, is best measured by one thing: how much an agent has to guess to do the right thing in your system.",
  "Interfaces sit on a legibility ladder, from compilers and schemas that leave nothing to guess down to HTML and screenshots that leave everything; errors and feedback are the most important interface of all.",
  "Tooling has become cheap to rewrite, as Bun's port from Zig to Rust and Anthropic's move off git show, so what a choice of ecosystem commits you to is its premises, not its implementation.",
  "An agent's context arrives through a supply chain of repositories, protocols, graphs and indexes, and it deserves the same care as any other supply chain: provenance, freshness, stable contracts and cost.",
  "The standards are arriving fast (AGENTS.md, MCP, Agent Skills, llms.txt), but the gaps are larger: a contract for command-line tools, guaranteed effects, provenance on context, a way to measure systems, and a boundary between instructions and data.",
]
+++

Watch a coding agent work for ten minutes in a repository it has never seen, and count the guesses: which command runs the tests, whether the linter's complaint is fatal, what the deployment tool means by two paragraphs of prose and a stack trace, which of the three services called `billing` the ticket is about, and whether the README is still true. Each guess costs tokens and time, some are wrong, and the wrong ones end up in a pull request.

Hardly any of those guesses say something about the model. They come from the system the agent was dropped into, and most of them can be designed away. How well a system serves the agents that now do much of its work has become a design concern of its own, and this post is my attempt to describe it.

## The developer moved up a level

In [Almost Irrelevant](/articles/almost-irrelevant/) I argued that once agents write most of the code, the choice of programming language matters much less than it did, because the agent absorbs the learning curve, the ceremony and the boilerplate. The same shift changes what the developer thinks about all day: less about syntax, design patterns and how to express a loop, and more about the shape of the whole: which system owns which data, how a change ripples into the three systems next to it, what the requirement actually is, and what has to be true when the work is done.

What did not move is tooling. It matters more than before, for a reason Jarred Sumner put well when [Bun joined Anthropic](https://bun.com/blog/bun-joins-anthropic): "If most new code is going to be written, tested, and deployed by AI agents: The runtime and tooling around that code become way more important." Humans, he wrote, "are more detached from every individual line, so the environment it runs in has to be fast and predictable". An agent runs the same command a thousand times a day and takes every output literally, so the quirks a developer learned to ignore now cost something on every run.

## Three readers

Every system now has three kinds of reader:

| | User experience (UX) | Developer experience (DX) | Agent experience (AX) |
|---|---|---|---|
| Who | a person using the system | a person building on or in it | an agent doing either |
| Reads | screens, words, flows | docs, APIs, errors, tools | everything, literally, every time |
| Remembers | habits, across years | the team's tribal knowledge | nothing between sessions, unless it is written down |
| Asks for help | support, a colleague | a colleague, a forum | nobody; it guesses |
| Cost of confusion | a lost customer | a lost afternoon | a wrong change, repeated at machine speed |

The name for the third comes from Mathias Biilmann, the chief executive of Netlify, who introduced it in January 2025 in [Introducing AX: Why Agent Experience Matters](https://biilmann.blog/articles/introducing-ax), as "the holistic experience AI agents will have as the user of a product or platform", and others picked it up quickly; Zeno Rocha at Resend wrote soon after: "Agents should be able to get up and running in milliseconds." ([What is AX](https://resend.com/blog/agent-experience)). The term was born as a question about products sold to developers: can an agent sign up, read the docs and deploy without a human clicking through a form?

I use it more widely. Agent experience is a property of every codebase, internal tool, API between two teams and body of knowledge a company keeps, because agents now work inside all of them, and not only at the front door of a product. I also use a narrower definition, because it is easier to act on: **agent experience is how much an agent has to guess to do the right thing in your system.** A good system leaves little to guess, and makes the remaining guesses cheap to check.

## Where the guesses come from

The first serious evidence that interfaces, not just models, decide what an agent can do came from the SWE-agent paper in 2024 ([Yang et al.](https://arxiv.org/abs/2405.15793)), which introduced the idea of an agent-computer interface and opened with a sentence that has aged well: "LM agents represent a new category of end user, with their own needs and abilities." Its ablations are worth reading closely, because every change was to the interface and none to the model:

| Change to the interface (SWE-bench Lite) | Resolved |
|---|---|
| The full interface: an editor with a linter that rejects broken edits, summarised search, a 100-line file viewer | 18.0% |
| The same editor without the linter guardrail | 15.0% |
| Search that returns results page by page instead of a summary | 12.0% |
| Showing the whole file instead of 100 lines at a time | 12.7% |
| No edit command at all | 10.3% |

Showing the agent more of the file made it worse, and letting it browse search results made it worse than giving it no search at all, which scored 15.7%. What helped was less information, in a predictable shape. Anthropic drew the same lesson for its own agents: in [Building effective agents](https://www.anthropic.com/engineering/building-effective-agents) the team wrote that for their coding agent they "spent more time optimizing our tools than the overall prompt", and that you should "carefully craft your agent-computer interface (ACI) through thorough tool documentation and testing". Their advice has a name borrowed from manufacturing: "Poka-yoke your tools", change them so that the mistake is hard to make in the first place.

In my own work the guesses come from a short list of places, and almost all of them were always there; humans simply absorbed them by asking a colleague.

- **Output that changes shape.** A tool that prints a table for people, with colours and a progress bar, and no stable machine form.
- **Errors in prose.** A message written for a person in a hurry, which an agent has to interpret, and which changes wording between versions.
- **Conventions that live in heads.** How the team names branches, which tests are flaky, which directory is dead.
- **Names that disagree.** The same application called one thing in the repository, another in the cluster and a third in the incident tool.
- **Documents that drifted.** A README that was true two years ago, with nothing to say so.
- **Knowledge without provenance.** An answer with no way to tell where it came from or how old it is.

## The legibility ladder

Not all interfaces leave the same amount to guess. I find it useful to rank them, from the ones that leave nothing to guess to the ones that leave almost everything:

| Rung | Interface | What the agent still has to guess |
|---|---|---|
| 1 | a compiler or type checker | almost nothing: the answer is yes, or exactly where and why not |
| 2 | structured output with a published schema (JSON Schema, OpenAPI, RFC 9457 errors) | what to do next, not what happened |
| 3 | a CLI with stable flags, exit codes and a `--json` mode | the meaning of fields that are not documented |
| 4 | Markdown documentation an agent can fetch (`llms.txt`, `.md` copies) | whether it is current, and how it maps to the code |
| 5 | HTML pages | where the content is, among the navigation and scripts |
| 6 | a graphical interface | nearly everything |

Improving agent experience is mostly the work of moving things up this ladder. Cloudflare's numbers make the case for the lower rungs: when [Markdown for Agents](https://blog.cloudflare.com/markdown-for-agents/) serves a page as Markdown to a client that asks for it, one of their blog posts drops from 16,180 tokens to 3,150, and in their words, "Feeding raw HTML to an AI is like paying by the word to read packaging instead of the letter inside." Anthropic's long-running agents keep their list of features in JSON rather than Markdown because "the model is less likely to inappropriately change or overwrite JSON files" ([Effective harnesses for long-running agents](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents)). The rung decides how much of the agent's attention goes to the work and how much to working out what it is looking at.

The same command can sit on two different rungs. This is a deployment tool written for people:

```text
⠋ Deploying claims-api to prod...
✗ Something went wrong. The rollout could not be completed because one or more
  replicas failed their readiness checks. Check the dashboard for details.
```

and this is the same failure written for every reader:

```text
$ deployctl rollout claims-api --env prod --json
{"status":"failed","stage":"readiness","service":"claims-api","env":"prod",
 "replicas":{"ready":1,"wanted":3},"probe":"/healthz","last_status":503,
 "logs":"deployctl logs claims-api --env prod --since 10m","exit_code":3}
```

The first asks the agent to guess and then sends it to a dashboard it cannot see. The second says what failed, by how much, where to look next and which exit code to branch on, and a person can read it just as well.

## The error message is the API

The part of a system that deserves the most care for agents is its feedback: errors, warnings, test output, review comments. An agent spends most of its time in a loop of trying something and reading what came back, so what comes back is the interface it uses most.

The clearest demonstration I know is the rewrite of Bun. Bun was written in Zig, and in May 2026 Jarred Sumner [rewrote it in Rust](https://bun.com/blog/bun-in-rust) "using about 50 dynamic workflows in Claude Code run continuously over the course of 11 days". The agents first ported every file mechanically, and then a workflow worked through the compiler's errors as a work queue, crate by crate, starting from about sixteen thousand. His summary of why that worked: "Compiler errors are a better feedback loop than a style guide." A compiler error points at a line, cannot be argued with and disappears when the problem is fixed, so an agent can work through thousands of them without supervision, which nobody can say of a style guide.

Nicholas Carlini came to the same place from the other side when he had sixteen agents [build a C compiler](https://www.anthropic.com/engineering/building-c-compiler): "I had to constantly remind myself that I was writing this test harness for Claude and not for myself." His rules are concrete: "The test harness should not print thousands of useless bytes", it should print a few lines and log the rest to a file, and errors should be easy to find with a search. Cloudflare applied it to the web itself, returning [RFC 9457 problem details](https://blog.cloudflare.com/rfc-9457-agent-error-pages/) to agents instead of error pages that "give agents clues, not instructions", and put the principle in one line: "The core value is not format choice. It is semantic stability."

An error with semantic stability looks like this, and it means the same thing in every version:

```json
{
  "type": "https://errors.example.com/quota-exceeded",
  "title": "Quota exceeded",
  "status": 429,
  "detail": "Project claims-api has used 1000 of 1000 builds this month.",
  "retry_after": "2026-12-01T00:00:00Z",
  "fix": "Raise the quota with: deployctl quota set claims-api --builds 2000"
}
```

Anthropic's advice for tool authors says the same thing directly: "prompt-engineer your error responses to clearly communicate specific and actionable improvements" ([Writing effective tools for agents](https://www.anthropic.com/engineering/writing-tools-for-agents)). For an agent the error message is part of the API, and it needs what the rest of an API gets: a version, documentation and tests.

## When tooling is disposable, premises remain

Tools used to be expensive to replace, so we lived with their defects for decades. Agents have made replacing them cheap enough to be a real option, and I do not think the consequences have sunk in yet.

The Bun rewrite cost, by Sumner's account, "around $165,000 at API pricing", for a runtime that took years to write the first time. It shipped as [Bun 1.4](https://bun.com/blog/bun-v1.4) in August. The motive was practical: the bugs that kept the team busy were memory bugs, use-after-free and double-free, the kind a different language rules out. It was controversial, too. The creator of Zig called it "unreviewed slop" ([The Register](https://www.theregister.com/devops/2026/07/14/zig-creator-calls-buns-claude-rust-rewrite-unreviewed-slop/5270743)), and whether eleven days of agent work is as solid as years of human work is a fair question that only time in production will answer. But the rewrite happened, at a cost a single company could choose to pay, and that alone changes the calculation.

Anthropic went further with its own tools. In October it described [redesigning source control](https://www.anthropic.com/research/redesigning-source-control): "The bottleneck, now, is all of the developer infrastructure built for human scale: source control, builds, and CI." Changes merged per day went from about 2,500 in May 2026 to more than 30,000 in September, so the team built Scion, its own version control system, and moved its monorepo off git in five months. Git assumes clients that work offline with a full copy of the repository; "since nearly all of our clients are agents and jobs", Scion assumes clients that are always online. One premise changed, and a tool that had served the industry for twenty years stopped fitting.

I call this the rewrite threshold: the point at which rewriting a tool costs less than living with its premises. Agents have pushed that threshold down sharply, and two things follow.

The first is that implementations matter less and premises matter more. When the code of a tool can be regenerated in weeks, what you commit to by choosing an ecosystem is its design premises: its memory model, its compatibility promise, whether its outputs are deterministic, how its modules are named and found, what its errors guarantee. Those are what an agent works against every day, and those are what survive a rewrite. The Bun rewrite kept "the same architecture, the same data structures"; it changed the premise about who frees memory.

The second is that agent experience becomes a reason to rewrite. A tool with prose errors and unstable output used to be an annoyance. Now it is a tax paid on every run of every agent, and at some point paying for a better tool is cheaper than paying the tax.

## The context supply chain

The other half of agent experience is where an agent gets what it knows. I wrote about the kinds of context an agent draws on in [Context Is the Product](/articles/context-is-the-product/), and about why retrieval belongs in a tool in [Retrieval Is a Tool, Not a Layer](/articles/retrieval-is-a-tool-not-a-layer/). Here I want to look at the same thing as a supply chain, because that is how it behaves:

{% diagram(title="The context supply chain") %}
  sources                  channels                     the agent
  ─────────────────        ───────────────────────      ──────────────
  repository         ──▶   AGENTS.md, docs/, code  ──┐
  systems of record  ──▶   APIs, MCP servers       ──┤
  company knowledge  ──▶   graphs, ontologies      ──┼──▶  context window
  documents          ──▶   embeddings, search      ──┤     (finite, costly)
  people             ──▶   reviews, approvals      ──┘
                                 │
     every link carries: provenance · freshness · a stable contract · a cost in tokens
{% end %}

Every link in that chain has the four properties any supply chain has. **Provenance:** can the agent tell where a fact came from, and can a person check it afterwards? **Freshness:** does the fact carry a date, or does the agent have to assume? **A stable contract:** does the channel keep its shape between versions, or does every change break the agents downstream? **Cost:** what does it take in tokens to get the fact into the window? Anthropic's context engineering guidance treats the window exactly that way: "Context, therefore, must be treated as a finite resource with diminishing marginal returns" ([Effective context engineering](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)), and presenting MCP servers to an agent as code it can call, rather than as a long list of tools, cut one of their workflows "from 150,000 tokens to 2,000 tokens" ([Code execution with MCP](https://www.anthropic.com/engineering/code-execution-with-mcp)).

The channels are standardising, which is good news for anyone building on them. In December 2025 the Linux Foundation formed the [Agentic AI Foundation](https://www.linuxfoundation.org/press/linux-foundation-announces-the-formation-of-the-agentic-ai-foundation) around three contributed projects: the Model Context Protocol from Anthropic, goose from Block and AGENTS.md from OpenAI. A convention for the repository, a protocol for systems and a reference agent, under neutral governance, is the start of a shared infrastructure for this supply chain.

What no standard supplies is the content, and that is where most companies have the worst agent experience of all. The question an agent asks most often inside a company is about ownership rather than code, "who owns this, what depends on it, and is it still used?", and in most organisations the answer is scattered across six tools that disagree. That is the problem [IT Intelligence](/articles/it-intelligence/) is about, and the reason the [reference implementation](/articles/building-it-intelligence/) answers through an MCP server with small, entity-centric answers that always carry their provenance. A knowledge layer an agent can query, with the source of every fact attached, is agent experience for the organisation itself.

## The standards so far

For a field that did not have a name two years ago, agent experience already has a fair amount of shared ground. This is the map as I see it in November 2026:

| Concern | What exists | Since | Who stands behind it |
|---|---|---|---|
| Instructions for agents in a repository | [AGENTS.md](https://agents.md/) | 2025 | OpenAI, now the Agentic AI Foundation |
| A website explained to a model | [llms.txt](https://llmstxt.org/) | September 2024 | Answer.AI, a proposal |
| Connecting agents to tools and data | [Model Context Protocol](https://modelcontextprotocol.io/), current revision 2026-07-28 | November 2024 | Anthropic, now the Agentic AI Foundation |
| Packaged know-how and workflows | [Agent Skills](https://www.anthropic.com/news/donating-agent-skills-to-the-agentic-ai-foundation) | October 2025 | Anthropic, donated to the Agentic AI Foundation in October 2026 |
| Errors from HTTP APIs | [RFC 9457](https://www.rfc-editor.org/rfc/rfc9457) problem details | 2023 | IETF |
| Findings from analysis tools and compilers | [SARIF 2.1.0](https://docs.oasis-open.org/sarif/sarif/v2.1.0/sarif-v2.1.0.html), plus compiler formats such as GCC's SARIF output and [rustc's JSON](https://doc.rust-lang.org/rustc/json.html) | 2020 | OASIS |
| Pages as Markdown on request | `Accept: text/markdown` | 2026 | Cloudflare, by practice |
| A catalogue of services and owners | Backstage's [catalog-info.yaml](https://backstage.io/docs/features/software-catalog/descriptor-format) | 2020 | a de facto convention |
| Where a fact came from | [PROV-O](https://www.w3.org/TR/prov-o/) | 2013 | W3C |

Two things stand out. The newest entries are the ones agents actually use, and they came from model vendors and moved quickly to neutral governance; Agent Skills alone has been integrated by "more than 70 agent platforms" in under a year, by Anthropic's count. The older entries, from standards bodies, solve parts of the problem well, but were written for other readers: SARIF for code scanners, PROV-O for the semantic web, Backstage for a developer portal. Nobody has yet joined them up for agents.

## What is still missing

The gaps are where I expect most of the work, and most of the interesting ideas, in the next few years. These are the ones I keep running into, each with the nearest thing that exists today:

| Gap | Nearest thing today | What it lacks |
|---|---|---|
| A contract for command-line tools | RFC 9457 for HTTP, SARIF for analysers | anything common to the thousands of CLIs agents run every day |
| Effects you can rely on | MCP tool annotations | guarantees: they are hints |
| Provenance and freshness on context | PROV-O, a few product conventions | a field in the channels agents actually read |
| A measure of agent experience | model benchmarks such as SWE-bench | a benchmark of systems, not of models |
| Organisational context | Backstage catalogues | what is true, rather than what was declared |
| Change management for agent-facing text | API versioning | versions and changelogs for tool descriptions, instructions and error meanings |
| A boundary between instructions and data | none in common use | a way to mark what in the context may be obeyed |
| Durable hand-offs to people | MCP elicitation | approvals that wait for days, with a name and a record |

**A contract for command-line tools.** Agents spend much of their lives in a shell, and the shell has no shared contract at all. Every tool invents its own machine mode, if it has one, its own exit codes and its own error wording. RFC 9457 solved this for HTTP and SARIF for static analysis; the command line needs the same thing: a standard flag for machine output, problem details with a stable type for every error, the next action as a field, and exit codes with documented meaning. It is unglamorous work, and I suspect it would save agents more time than the next model release.

**Effects you can rely on.** Before an agent runs something, it needs to know whether the action reads or writes, can be repeated safely, can be undone, and reaches outside the system. MCP has fields for exactly this, `readOnlyHint`, `destructiveHint`, `idempotentHint` and `openWorldHint`, and the specification is honest about them: "all properties in ToolAnnotations are hints. They are not guaranteed to provide a faithful description of tool behavior" ([schema](https://modelcontextprotocol.io/specification/2025-06-18/schema)), and clients "MUST consider tool annotations to be untrusted unless they come from trusted servers" ([tools](https://modelcontextprotocol.io/specification/2025-06-18/server/tools)). That is the right caution, and it leaves the gap open. What is missing is an effect declaration that something checks: a sandbox that enforces read-only, or a standard dry-run that returns a plan of what would change, the way an infrastructure tool shows a plan before it applies one.

**Provenance and freshness on context.** An `AGENTS.md` has no owner and no date. An `llms.txt` does not say when it was last true. A tool result has no common field for where its facts came from. The semantic web solved provenance long ago in PROV-O, but none of the channels agents read carry it. Until they do, an agent cannot tell a fact checked this morning from one written three reorganisations ago, and neither can the person reviewing its work. I would like every fact an agent receives to carry three things: a source, an as-of date and an owner. It is what I built into the [reference implementation](/articles/building-it-intelligence/), and it should not need a custom platform.

**A measure of agent experience.** Every benchmark we have holds the environment fixed and varies the model. Agent experience needs the opposite: hold the agent fixed and vary the system. There is no shared way to say that one repository, API or internal platform is easier for agents than another, so improvements cannot be compared or even claimed. The cold-start test below is my stopgap. A real one would be a public suite of tasks, run against a system by a fixed agent, with the guesses counted the same way everywhere.

**Organisational context.** Backstage made it normal to describe a service in a file next to its code, and that is a real step. But a catalogue records what teams declared, and agents need what is true: who actually owns the namespace, which application still calls the old API, which record is stale. There is no standard for an ownership and dependency graph that carries confidence and evidence, and every company that wants one builds it alone. That is the gap [IT Intelligence](/articles/it-intelligence/) is about.

**Change management for agent-facing text.** We version APIs because clients break when they change. Agents are clients too, but the text they depend on changes silently: a tool description is reworded, an instruction file is reorganised, an error message gains a sentence. Each of those changes what agents do, and nobody sees the breakage because no test failed. Worse, a tool description is an instruction to the model, so changing it changes behaviour in ways a reviewer of code would never look for. Agent-facing text needs what API surfaces have: versions, changelogs, and a diff that someone reviews.

**A boundary between instructions and data.** Everything in an agent's context looks alike: the user's request, the repository's conventions, a web page it fetched, an issue comment written by a stranger. There is no common way to mark which of those may be obeyed and which may only be read, and that is the root of prompt injection. Better models reduce the risk, and sandboxes contain the damage, as I wrote in [Your Agent Wants Root](/articles/your-agent-wants-root/), but the missing piece is a convention, carried through every channel, for where authority comes from.

**Durable hand-offs to people.** MCP's elicitation lets a server ask the user for information in the middle of a session, which covers the quick question. The harder case is the approval that has to wait: a change that needs a second person, who is on holiday until Thursday, and a record afterwards of who said yes. There is no standard for that hand-off, so every platform builds its own. It is the reason durable execution engines with waits for people, such as [Aqueduct](https://github.com/raskell-io/aqueduct), exist, and I expect the hand-off to become a protocol of its own.

None of these gaps needs a breakthrough, only a few people agreeing on something boring, which is how the web got HTTP status codes and how the command line got `--help`. The difference this time is the speed: whoever writes the convention down first, and makes it easy to adopt, will define how agents work for a long time.

## Measuring it

Agent experience can be measured, and the measurement is cheap. I use what I call the cold-start test:

1. Pick a real task in the system, the kind a new colleague would get in their first week.
2. Give it to a fresh agent with no extra instructions, no memory and no help.
3. Let it work, and keep the transcript.
4. Count, from the transcript, four things:

| Measure | What it tells you |
|---|---|
| guesses: commands tried, files opened or assumptions stated that turned out wrong | how much the system leaves to guess |
| turns until the first green build or passing test | how fast the feedback loop is |
| tokens spent before the first correct change | how expensive the context is to reach |
| times a person had to step in | where the knowledge still lives only in heads |

Run it again after every change that is meant to help. The numbers will be noisy, because agents are, but the transcript is not: every wrong guess points at a specific gap, and most gaps take an afternoon to close. Every gap left open is what I would call agent experience debt, and like any debt it compounds, because every agent pays it again, on every run.

## What to do about it

For people who build software and people who run it, the list is short, and none of it is exotic.

- **Write the conventions down where an agent will find them.** An `AGENTS.md` at the root, pointing into a `docs/` directory that is kept true, beats any amount of knowledge in people's heads.
- **Give every tool a machine form.** Stable flags, meaningful exit codes, a `--json` mode, and output that is short by default with the details in a log file.
- **Treat errors as an API.** Give them stable types, say what to do next, and keep their meaning between versions.
- **Put checks before reviews.** Types, schemas, linters and tests turn guesses into answers before a person has to look.
- **Publish your knowledge as data with provenance.** Ownership, dependencies and status belong in something an agent can query, with the source of each fact attached.
- **Choose ecosystems by their premises.** Compatibility promises, determinism and a compiler that explains itself are worth more now than the size of the library catalogue, because the catalogue can be regenerated and the premises cannot.
- **Run the cold-start test.** Not once, but every quarter, the way you would run a load test.

The objection I hear most is that all of this is simply good developer experience. Much of it is, and I take that as encouraging: a system with good agent experience is almost always better for people too. The difference is forgiveness. A person asks a colleague when the docs are wrong and learns the team's habits once, while an agent guesses, and starts from nothing in every session unless the habits are written down. A person who misreads an error loses an afternoon; an agent misreads it on every run, in parallel, faster than any review can follow.

## The third reader

For thirty years we designed for the person using a system, and for fifteen for the person building it. Agents now do a large share of both jobs, and they are the reader least able to work around what we left unclear, which makes them the most honest guide we have to what still needs fixing.

## References

- Mathias Biilmann, [Introducing AX: Why Agent Experience Matters](https://biilmann.blog/articles/introducing-ax), 28 January 2025.
- Zeno Rocha, [What is AX (Agent Experience) and how to improve it](https://resend.com/blog/agent-experience), Resend, February 2025.
- John Yang, Carlos E. Jimenez, Alexander Wettig, Kilian Lieret, Shunyu Yao, Karthik Narasimhan and Ofir Press, [SWE-agent: Agent-Computer Interfaces Enable Automated Software Engineering](https://arxiv.org/abs/2405.15793), 2024.
- Erik S. and Barry Zhang, [Building effective agents](https://www.anthropic.com/engineering/building-effective-agents), Anthropic, 19 December 2024.
- Ken Aizawa, [Writing effective tools for agents, with agents](https://www.anthropic.com/engineering/writing-tools-for-agents), Anthropic, 11 September 2025.
- Anthropic, [Effective context engineering for AI agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents), 29 September 2025.
- Adam Jones and Conor Kelly, [Code execution with MCP: Building more efficient agents](https://www.anthropic.com/engineering/code-execution-with-mcp), Anthropic, 4 November 2025.
- Justin Young, [Effective harnesses for long-running agents](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents), Anthropic, 26 November 2025.
- Jarred Sumner, [Bun is joining Anthropic](https://bun.com/blog/bun-joins-anthropic), 2 December 2025, and [Rewriting Bun in Rust](https://bun.com/blog/bun-in-rust), 8 July 2026; the pull request [Rewrite Bun in Rust](https://github.com/oven-sh/bun/pull/30412); [Bun 1.4](https://bun.com/blog/bun-v1.4).
- [Zig creator calls Bun's Claude Rust rewrite "unreviewed slop"](https://www.theregister.com/devops/2026/07/14/zig-creator-calls-buns-claude-rust-rewrite-unreviewed-slop/5270743), The Register, 14 July 2026.
- Linux Foundation, [Linux Foundation Announces the Formation of the Agentic AI Foundation](https://www.linuxfoundation.org/press/linux-foundation-announces-the-formation-of-the-agentic-ai-foundation), 9 December 2025.
- Nicholas Carlini, [Building a C compiler with a team of parallel Claudes](https://www.anthropic.com/engineering/building-c-compiler), Anthropic, 5 February 2026.
- Celso Martinho and Will Allen, [Introducing Markdown for Agents](https://blog.cloudflare.com/markdown-for-agents/), Cloudflare, 12 February 2026.
- Sam Marsh, [Slashing agent token costs by 98% with RFC 9457-compliant error responses](https://blog.cloudflare.com/rfc-9457-agent-error-pages/), Cloudflare, 11 March 2026.
- Anthropic, [Redesigning source control at Anthropic](https://www.anthropic.com/research/redesigning-source-control), 13 October 2026.
- [RFC 9457: Problem Details for HTTP APIs](https://www.rfc-editor.org/rfc/rfc9457), 2023.
- Jeremy Howard, [/llms.txt: a proposal to provide information to help LLMs use websites](https://www.answer.ai/posts/2024-09-03-llmstxt.html), Answer.AI, 3 September 2024, and [AGENTS.md](https://agents.md/).
