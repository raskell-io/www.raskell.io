---
title: "The Constraint Moves: A Day at Agentic Engineering Days Zurich"
url: https://raskell.io/articles/agentic-engineering-days-zurich-2026/
author: Raffael Schneider
date: 2026-11-20
description: "Seven talks at Agentic Engineering Days Zurich 2026, and the thread through them: agents do not remove a constraint, they move it somewhere else."
tags: [agents, agent-harness, agent-protocols, data-fusion, multiplayer-work, switzerland]
---

# The Constraint Moves: A Day at Agentic Engineering Days Zurich

## In short

Agentic Engineering Days Zurich 2026 was one sold-out day in a hotel by Zurich main station, with 40 sessions picked from 344 submissions, and the best part of it was the people. Pini Reznik's abstract gave me the lens for the day: AI does not remove the constraint, it moves it. Every talk I saw was an answer to where it should go. Exasol made the case for moving data fusion into the database, so agents stop carrying the integration burden on every call. It was a sponsored talk, and the one I will test first. The protocol talk said the simplest protocol that reduces the most uncertainty wins; NVIDIA's NOOA turned the agent back into typed software, which made me want a compiler to check those types. GitHub Next showed the constraint landing on team alignment, which points to work as a shared conversation between people and agents, with the decisions living inside it.

On Friday I spent a day at [Agentic Engineering Days Zurich](https://www.agenticdays.com/) with a few colleagues. It ran for one day in the Marriott next to Zurich main station, organised by [letsboot.ch](https://www.letsboot.ch/), with 40 sessions picked from 344 submissions across five rooms, and it was sold out. Next year it moves to a bigger venue and two days, which tells you something about how the year went.

Jonas and Barbara Felix and their team organised all of it, and for a first edition it was close to flawless: rooms on time, talks on time, good food, and an apéro long enough for the conversations the talks started. Thank you both.

<figure>
<img src="/agentic-days-2026-foyer.avif" alt="The foyer of the Marriott before the first talk" width="1600" height="667" loading="lazy">
<figcaption>The foyer of the Marriott at Zurich main station, half an hour before the opening. Most of the conversations I remember happened here, not in the rooms.</figcaption>
</figure>

Some of the speakers were the Swiss cloud native scene of a few years ago, now working on the next thing. Those were not the sessions I came for. I came for the people who build the parts the rest of us use, and the programme had them: NVIDIA, GitHub, Red Hat and IBM, Google, and a database founder from Exasol. I saw seven talks, met more interesting people than I expected, and came home with one sentence I have not been able to put down.


## The constraint moves

The sentence is from Pini Reznik, who co-founded Container Solutions and wrote [Cloud Native Transformation](https://www.oreilly.com/pub/au/7845) for O'Reilly, and who now runs re:cinq. His abstract for "From Copilot to the Dark Factory" describes what happens when a company buys coding assistants for everyone: individuals get faster, but "PR volume rises, review queues grow, tests weaken, and context, security, and platform bottlenecks become visible." Then the line: "AI does not remove the constraint; it moves it."

Anyone who has read Goldratt will recognise the shape, and I had written a version of it myself a week earlier in [Every layer moves the uncertainty](https://raskell.io/notes/every-layer-moves-the-uncertainty/). What made it useful on Friday was that it turned a programme of unrelated talks into one question. A coding assistant moves the constraint from typing to review. An agent with access to five systems moves it from the integration layer into the agent. So for each talk I asked where the constraint had gone, and whether that was a good place for it.

Reznik's own talk drew the move as a chart, "Who Builds Software with AI?", with complexity on one axis and the number of developers a system needs on the other. Excel macros and simple scripts sit near the origin, then functional tools for one to five developers, market platforms like Booking.com and HubSpot for fifty to a hundred, and mega systems like Google Search and AWS for more than a thousand. Past that the axis reads "Impossible", with a climate simulator, a city digital twin and personalised medicine as examples. His red arrows moved every band one step to the left: non-developers become citizen developers, a team of five builds what used to need a hundred, and the far end of the axis stops being impossible. If that is roughly right, the scarce thing is no longer people who can write code. It is everything around the code that a single team cannot do alone, and his closing slide said what to do about it: "Find the constraint. Build the capability. Repeat." The long version is a book he wrote with Michael Müller, [From Cloud Native to AI Native](https://re-cinq.com/whitepapers), which re:cinq gives away.

<figure>
<img src="/agentic-days-2026-reznik.avif" alt="Pini Reznik and his chart of who builds software with AI" width="1600" height="800" loading="lazy">
<figcaption>Pini Reznik of re:cinq at his chart "Who Builds Software with AI?": every band of complexity moves one step to the left, and "Impossible" stops being the end of the axis.</figcaption>
</figure>

| Talk | Where the constraint went |
|---|---|
| Wrike, an SRE agent in production | into the context, which nobody tests |
| Exasol, Beyond MCP | out of the agent and into the database |
| Red Hat and IBM, Agents Speak Protocol | out of each integration and into a contract at each boundary |
| NVIDIA, NOOA | out of prompts and back into ordinary typed software |
| GitHub Next, collaborative environments | from writing the code to agreeing on what to write |
| Typeform, When Software Stops Being Deterministic | from test suites into evaluation and traces |
| re:cinq, From Copilot to the Dark Factory | from the people writing code to the people writing specs and checks |

## The agent as the integration layer

My morning started with David Pech of Wrike and an SRE agent that had been in production for months. His abstract describes most such agents as "barely junior sysadmins in a trench coat", and the lessons he listed were not about models: the framework mattered less than expected, misleading documentation misled the agent, and context that nobody tests degrades quietly from one version to the next. I suspect the title is a line from the agent's own instructions, and that every team building one ends up writing it.

An hour later Alexander Stigsen took the same problem one level down. Stigsen founded [Realm](https://en.wikipedia.org/wiki/Realm_(database)), the mobile database MongoDB bought in 2019, and is now Chief Product and Technology Officer at [Exasol](https://www.exasol.com/), the in-memory analytics database from Nuremberg. His talk, "Beyond MCP", was a sponsored slot and a product pitch, and I say that up front because it was also the clearest diagnosis of a problem I work on.

Give an agent one MCP server per system, a CRM, billing, support, and the agent becomes your integration layer. It pays for every tool schema and every raw result in its context, makes one roundtrip per source, joins data without a query planner, caches nothing across sources, and reconciles three spellings of the same customer on every call. His slide listed seven costs and summed them up in one line: "The agent carries the integration burden." The abstract adds the constraint that rules out the obvious fix: "regulated organisations can't copy it all into one AI platform."

His answer was one MCP interface over a federated database that queries the data where it lives, with a semantic layer that maps the vocabulary of each source onto a shared business concept. `account_id` in the CRM and `customer_ref` in billing become one customer identity; invoices, refunds and currencies become net revenue in CHF. One semantic layer, and every agent reuses it.

I knew data fusion as an idea. What I had not considered is placing it inside the persistence layer, where the store does the heavy lifting once and every agent gets the result. It is the argument of [Context is cheaper than exploration](https://raskell.io/notes/context-is-cheaper-than-exploration/) one layer down, and it touches the pattern in [Building IT Intelligence](https://raskell.io/articles/building-it-intelligence/) directly. There, fusion is a pipeline: observations from each source, identity resolution as a workflow step, entities and edges in PostgreSQL, and every link carrying its basis and confidence.

The counterargument is easy to make, and I make it to myself. A database that fuses at query time moves the constraint again, into a product I do not control, and the semantics I care about most, which source to trust and how sure a match is, are exactly what the pipeline makes explicit. Exasol's own [documentation](https://docs.exasol.com/db/latest/ai/ai_build_agents/mcp-server-as-agent-tool.htm) also warns that an agent with nothing but the MCP server may write SQL that ignores Exasol's dialect. So I will not decide this from a slide. On Monday I start testing it against the reference implementation, and I wrote the question down in [Data fusion belongs in the store](https://raskell.io/notes/data-fusion-belongs-in-the-store/).

## The people who wrote the standards

Stefano Maestri and Alessio Soldano gave the next talk, and it was a pleasure to see the people behind the protocols in person. Maestri sits on the [A2A Technical Steering Committee](https://github.com/a2aproject/A2A/blob/main/GOVERNANCE.md) for IBM and wrote the launch post for the [A2A Java SDK](https://quarkus.io/blog/a2a-project-launches-java-sdk); Soldano led RESTEasy at Red Hat and is a committer on Apache CXF. Between them they have lived through SOAP against REST from the inside, and the talk was built on that history.

<figure>
<img src="/agentic-days-2026-protocol-stage.avif" alt="Stefano Maestri and Alessio Soldano on stage" width="1600" height="800" loading="lazy">
<figcaption>Stefano Maestri (left, at the lectern) and Alessio Soldano under the lens of their talk: "The simplest protocol that reduces the most uncertainty wins."</figcaption>
</figure>

Their lens was "The simplest protocol that reduces the most uncertainty wins." Their map put an agent in the middle and an agreement at each boundary: Open Responses toward models, MCP toward tools, A2A toward other agents, AG-UI and A2UI toward users, AGENTS.md and Skills toward knowledge, OpenTelemetry GenAI toward operations, ACP toward the editor, and x402 toward payments. The question under the map was "What do you want to make replaceable?"

The talk was abstract, a map more than a story, and I would have liked one system walked through end to end. But the map gave me a better question for the Exasol talk I had just left. "One MCP interface" is a bet on one boundary: the agent keeps a standard contract and the data behind it becomes replaceable. That is only true if the semantic layer travels with the contract and not with the product, and that is what I will be checking. The line from their deck I keep coming back to is "Opening a channel is not the agreement." An MCP server opens a channel. The meaning of a customer is the agreement. More in [The simplest protocol that reduces the most uncertainty wins](https://raskell.io/notes/the-simplest-protocol-wins/).

## Everything is software again

I had looked at [NOOA](https://github.com/NVIDIA-NeMo/labs-OO-Agents) when NVIDIA published it in the summer and never found the afternoon to try it, so I was glad to hear Matt Staats explain it himself. Staats wrote his PhD on testing and an [award-winning ICSE paper](https://bibtex.github.io/ICSE-2011-StaatsWH11a.html) on test oracles, the question of how you know a program's output is right, which is a good background for someone whose job is now evaluating agents. His abstract opens with "An agent is only as good as the harness around the model."

<figure>
<img src="/agentic-days-2026-nooa-stage.avif" alt="Matt Staats on stage, explaining NOOA" width="1600" height="800" loading="lazy">
<figcaption>Matt Staats of NVIDIA in front of "Zoom out: now everything is software", the slide where the agent loop becomes an object with internal state.</figcaption>
</figure>

NOOA treats an agent as a Python class. Methods are capabilities, fields are state, docstrings are prompts, and the signature is the contract. A method with an empty body is completed at runtime by the model, which acts by writing Python that calls typed services, the CodeAct idea from [Wang et al.](https://arxiv.org/abs/2402.01030) NVIDIA's [write-up](https://developer.nvidia.com/blog/six-agent-harness-capabilities-for-higher-model-performance/) names six capabilities: typed input and output, pass by reference, code as action, programmable loop engineering, explicit object state, and model-callable harness APIs. It reports 82.2% on SWE-bench Verified with GPT-5.5, which are NVIDIA's numbers and not mine. The slide that stayed with me said "Zoom out: now everything is software": the agent loop becomes an object with internal state, called by a deterministic application with typed tasks in and typed values out. The example on the next slide was small enough to show here. It is adapted from NOOA's framework tour, as the slide notes, and `llm` is a configured client:

```python
from nooa import Agent

ItemPrice = tuple[str, float]
CategoryTotal = tuple[str, float]

class BillingAgent(Agent, llm=llm):
    categories: set[str] = {"food", "travel", "other"}

    async def categorize(self, prices: list[ItemPrice]) -> list[CategoryTotal]:
        """Group items by self.categories; sum prices for each category."""
        ...

    async def run(self, raw: list[ItemPrice]) -> list[CategoryTotal]:
        prices = []
        for item, price in raw:
            if price >= 0: prices.append((item, price))
        return await self.categorize(prices)
```

`run` is ordinary Python and filters the input the way any program would. `categorize` has no body: the `...` hands it to the model, the docstring is the prompt, and the signature says what has to come back. The judgement is delegated and the contract is not.

The results Staats showed were about memory, measured on ARC-AGI-3 games with the same model and the same skill throughout. Letting the agent keep its own notes in Markdown reached 38.4%; NOOA's memory API reached 50.2%. The agents wrote 3,262 memories, but automated recall brought back only 4.1 per turn on average, so the context window stayed small. The slide after that was titled "Software is cheaper than thinking", subtitled "even if software is doing the thinking": to reach the Markdown run's score, the version with a world model and the memory API spent about $290 in estimated API cost against about $1,040. Structured memory that the harness manages beats notes the model has to reread, and recall that brings back four memories out of thousands is a form of [strategic forgetting](https://raskell.io/notes/strategic-forgetting/), this time with a price attached.

This is the most convincing place I have seen the constraint moved. Prompts and loose tool lists are hard to review, version and test; a class with a signature is not. It is close to what I described in [Tools: How Agents Actually Do Things](https://raskell.io/articles/tools-how-agents-actually-do-things/), taken further than I took it.

What I kept thinking about was the word "typed" in a language that does not enforce types. In Python the contract between the application and the agent is checked when the call happens, and NOOA retries until the output fits. In a language whose compiler enforces the contract, the program would not build until the types agree. That sent me back to [bhc](https://arcanist.sh/bhc/) and to whether inference and harness bindings could be a native primitive there, with an agent call typed like any other effect. I do not know yet whether that is a library, a language feature or a bad idea. The half-formed version is in [Harness types in the compiler](https://raskell.io/notes/harness-types-in-the-compiler/).

## The constraint lands on alignment

The most visionary talk of the day came from Krzysztof Cieślak of GitHub Next, who created Ionide, the F# tooling, and lists himself as a co-creator of Copilot. His abstract says "agentic engineering has been a solo story so far", and that matches my experience: one person, several agents, a lot of output, and nobody else in the room. One slide said "Most AI tools focus on single-developer productivity"; the one that got the room said "Code is cheap. Shared understanding and trust aren't."

<figure>
<img src="/agentic-days-2026-cieslak.avif" alt="Krzysztof Cieślak: code is cheap, shared understanding and trust are not" width="1600" height="800" loading="lazy">
<figcaption>Krzysztof Cieślak of GitHub Next: "Code is cheap. Shared understanding and trust aren't." The slide that got the room.</figcaption>
</figure>

He showed two research prototypes. Ace puts a team, its chat, its coding agents and their microVMs into one shared workspace. [Chopin](https://githubnext.com/projects/chopin/), its successor, is "A real-time multiplayer, agentic planning environment", where coworkers and agents write a plan together around a repository and settle decisions where everyone can see them. GitHub Next is careful to call Chopin "neither a product nor a finished prototype", and Ace is paused.

The argument behind them is Reznik's sentence again. Maggie Appleton of GitHub Next [put it](https://maggieappleton.com/zero-alignment) in one line earlier this year: "Agreeing on what to build is the new bottleneck." When agents make the code cheap, the constraint moves to the conversation about what the code should be, and pull requests, issues and chat were not built for that conversation at that speed.

I believe this is where work is going: shared conversations with several people and several agents in them, where the decisions, the designs and the code are produced inside the conversation and stay attached to it. It made me think of [Zed](https://zed.dev/), which I used early because I liked the vision long before agents were a topic. Zed is written in Rust and, in [their words](https://zed.dev/blog/videogame), "rendered like a videogame", on a GPU framework of its own, and it was multiplayer from the start. This year they announced [DeltaDB](https://zed.dev/blog/introducing-deltadb), version control that "captures every operation in between and gives each one a stable identity", and [Delta](https://zed.dev/blog/introducing-delta), built on it, whose announcement says "The thread is where software happens now, and the interface should reflect it." Zed came ahead of its time and lost some momentum along the way. I am still rooting for them. More in [The conversation is the workspace](https://raskell.io/notes/the-conversation-is-the-workspace/).

## Determinism, and the dark factory

The afternoon closed for me with Susanna Wong, a staff engineer at Typeform, on what happens when software stops being deterministic. Most of our engineering practice assumes the same input gives the same output; her abstract states it plainly, "LLM systems break that assumption", and the talk went through what Typeform had to change: continuous evaluation in place of test suites, traces in place of logs, prompts reviewed as engineering artifacts, and orchestration around components that do not behave the same way twice. It is the ground [Evaluation Closes the Loop](https://raskell.io/articles/evaluation-closes-the-loop/) covers, and it was good to hear it from someone who had to live through it in a product.

Her last slide was labelled "The one thing to take home", and it said "Prompts buy yield. Systems buy guarantees." Under it: "Reliability is a property of the system, not the model." And at the bottom, in small type, the sentence of the day in another form: "Determinism didn't disappear. It moved: out of the model, into the system around it." A prompt can raise the share of good answers. Only the system around the model, the evaluation, the retries, the typed contract, the human who signs off, can promise anything.

Her talk is also where Reznik's dark factory leads. The term comes from lights-out manufacturing, and Dan Shapiro's [five levels](https://www.danshapiro.com/blog/2026/01/the-five-levels-from-spicy-autocomplete-to-the-software-factory/) of AI coding end with it: a "black box that turns specs into software". Simon Willison's [summary](https://simonwillison.net/2026/Jan/28/the-five-levels/) pictures a factory where "the lights are out because robots don't need to see." Reznik's six systems for getting there are orchestration, sandboxes, context, validation, governance and learning loops, and none of them is the model. Turn the lights out and the constraint moves to the two things that are left for people: writing the spec, and knowing whether the output is right. That is Wong's talk, and it is Staats's old field.

## What I took home

<figure>
<img src="/agentic-days-2026-colleagues.avif" alt="With colleagues at the apéro" width="1600" height="800" loading="lazy">
<figcaption>With my colleagues at the apéro, the part of a conference no talk replaces.</figcaption>
</figure>

The talks were good, and the day was better, mostly for the conversations between them and at the apéro with my colleagues. But if I keep one thing, it is the habit Reznik's sentence gave me. Every talk I saw moved a constraint: into the database, into a protocol, into a type, into a shared conversation, into evaluation. None of them made one disappear. The useful question about any new agent tool is not what it removes but where it puts the work, and whether that place is one I can see, test and own.

<figure>
<img src="/agentic-days-2026-zurich.avif" alt="Zurich main station at dusk, on the way home" width="1600" height="800" loading="lazy">
<figcaption>Zurich main station at dusk, on the way back to Basel.</figcaption>
</figure>

## References

- [Agentic Engineering Days Zurich 2026, programme](https://www.agenticdays.com/sessions)
- Pini Reznik, [From Copilot to the Dark Factory](https://www.agenticdays.com/session/1301641-from-copilot-to-the-dark-factory), session abstract
- David Pech, ["YOU MUST NOT ssh!" and Other Stories from Building Our SRE Agent](https://www.agenticdays.com/session/1250380-you-must-not-ssh-and-other-stories-from-building-our-sre), session abstract
- Alexander Stigsen, [Beyond MCP: Supercharging your agents with a single unified data plane](https://www.agenticdays.com/session/1368894-beyond-mcp-supercharging-your-agents-with-a-single-unified), session abstract
- Exasol, [MCP Server as an agent tool](https://docs.exasol.com/db/latest/ai/ai_build_agents/mcp-server-as-agent-tool.htm)
- Stefano Maestri and Alessio Soldano, [Agents Speak Protocol](https://maeste.it/agents-speak-protocol-aed/), deck and [sources](https://maeste.it/agents-speak-protocol-aed/sources.html)
- A2A project, [GOVERNANCE.md](https://github.com/a2aproject/A2A/blob/main/GOVERNANCE.md)
- Matt Staats, [NOOA: Inside NVIDIA's Object-Oriented Agent Harness](https://www.agenticdays.com/session/1305345-nooa-inside-nvidia-s-object-oriented-agent-harness), session abstract
- NVIDIA, [NVIDIA-NeMo/labs-OO-Agents](https://github.com/NVIDIA-NeMo/labs-OO-Agents) and [Six Agent Harness Capabilities for Higher Model Performance](https://developer.nvidia.com/blog/six-agent-harness-capabilities-for-higher-model-performance/)
- Xingyao Wang et al., [Executable Code Actions Elicit Better LLM Agents](https://arxiv.org/abs/2402.01030), ICML 2024
- Matt Staats, Michael W. Whalen and Mats P. E. Heimdahl, [Programs, Tests, and Oracles: The Foundations of Testing Revisited](https://bibtex.github.io/ICSE-2011-StaatsWH11a.html), ICSE 2011
- Krzysztof Cieślak, [The next frontier: agentic collaborative environments](https://www.agenticdays.com/session/1283743-the-next-frontier-agentic-collaborative-environments), session abstract; GitHub Next, [Chopin](https://githubnext.com/projects/chopin/)
- Maggie Appleton, [One Developer, Two Dozen Agents, Zero Alignment](https://maggieappleton.com/zero-alignment)
- Zed, [Leveraging Rust and the GPU to render user interfaces at 120 FPS](https://zed.dev/blog/videogame), [Software Is Made Between Commits](https://zed.dev/blog/introducing-deltadb) and [Introducing Delta](https://zed.dev/blog/introducing-delta)
- Susanna Wong, [When Software Stops Being Deterministic](https://www.agenticdays.com/session/1287383-when-software-stops-being-deterministic-rethinking), session abstract
- Pini Reznik and Michael Müller, [From Cloud Native to AI Native](https://re-cinq.com/whitepapers)
- Susanna Wong, closing slide of the talk, photographed in the room
- Dan Shapiro, [The Five Levels: from Spicy Autocomplete to the Dark Factory](https://www.danshapiro.com/blog/2026/01/the-five-levels-from-spicy-autocomplete-to-the-software-factory/)
- Simon Willison, [The five levels](https://simonwillison.net/2026/Jan/28/the-five-levels/)
