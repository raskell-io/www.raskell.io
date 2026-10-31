+++
title = "IT Intelligence: The Missing Data Layer of Enterprise IT"
date = 2026-11-02
draft = true
description = "Business intelligence tells a company how it sells. Nothing tells it how its IT fits together. Why I started building an Enterprise Context Platform."

[taxonomies]
tags = ["enterprise-architecture", "context-engineering", "legibility", "knowledge-management", "provenance", "democratisation", "oss", "future-of-work"]

[extra]
author = "Raffael"
image = "it-intelligence.avif"
cover = "covers/it-intelligence.avif"
reads = ["enterprise-architecture-as-strategy", "seeing-like-a-state"]
in_short = [
  "Companies built business intelligence to know how they sell, but cannot cheaply answer what IT they have, who owns it and how it connects; I call that missing layer IT intelligence.",
  "The facts sit in separate systems of record, and the knowledge between them is lost to tribal knowledge and silos, which research on tacit knowledge, information politics and knowledge hiding helps explain.",
  "The Enterprise Context Platform I am building ingests every source, scores it for accuracy, and resolves it into an ontology of entities with provenance and confidence, served through a web UI, REST and MCP.",
  "IT context should be open by default and built on open source, because agents without it explore expensively, duplicate work and guess, while a shared model turns rediscovery into a lookup.",
  "As agents write more code and work moves up a level of abstraction, organisations built around scarce implementation capacity become the next bottleneck and will have to change shape.",
]
+++

Ask a large company how many insurance policies it sold in Germany last quarter and you get an answer in seconds, with a chart, a trend line and a breakdown by channel. Ask the same company which applications process customer health data, who owns them, which clusters they run on and which of them already call a language model, and you get a meeting, then a spreadsheet, then a second meeting because the spreadsheet disagrees with the CMDB.

Companies spent thirty years building business intelligence. They never built the equivalent for their own IT. I have started calling that missing thing **IT intelligence**, and the platform that provides it an **Enterprise Context Platform**.

## The job that made the gap visible

For the last while I was an Enterprise Solution Architect for agentic AI and AI platforms at a Swiss financial group, one with both a large insurance business and a bank, operating through more than ten market units. My task was harmony: making sure that the solution architecture directives, policies and designs across all of those market units properly interpreted the capabilities enterprise architecture had defined, which in turn were derived from the corporate strategy.

On paper that is a clean chain.

{% diagram(title="The chain as it is drawn") %}
   ┌──────────────────────────┐
   │ corporate strategy       │
   └─────────────┬────────────┘
                 ▼
   ┌──────────────────────────┐
   │ enterprise architecture  │  capabilities, principles, target landscape
   └─────────────┬────────────┘
                 ▼
   ┌──────────────────────────┐
   │ solution architecture    │  directives, policies, reference designs
   └─────────────┬────────────┘
                 ▼
   ┌──────────────────────────┐
   │ 10+ market units         │  actual systems, actual teams, actual budgets
   └──────────────────────────┘
{% end %}

In practice each arrow is a translation done by people, in documents, at different speeds: strategy moves yearly, capability maps when someone has time, solution designs per project, and the systems themselves daily. By the time a capability has been interpreted by ten market units, you have ten interpretations, and no cheap way to see where they diverge.

Knowing what good looks like was the easy part of the job; knowing what is actually there was the hard one. Every review started with archaeology: which applications exist, which platform services they use, which team owns them, whether the entry in the EA repository still matches the code repository, whether the repository still matches what runs on the cluster.

Recently I moved into a role that fits the problem better. I am now the Group AI Architect, working from inside the AI and Data division, and the goal is similar: harmonious use of AI across every market unit. The difference is that I now sit next to the data and the platforms rather than reviewing them from the outside. That is what made it possible to start building the thing I kept wishing existed.

## I built a small one before

Before I became an Enterprise Solution Architect, I was a platform engineer and solution architect for the group's web service delivery platform: the WAF, the CDN and a number of ingress proxies doing traffic shaping, together providing the web security and web delivery capabilities for everything the company exposed to the internal perimeter and to the internet.

That team was a good place to try things. One of them was AI-assisted curation of WAF rules, which my colleague Milan Duric and I presented at RSAC 2026. For readers outside security: RSAC, formerly the RSA Conference, is one of the largest security conferences in the world, held every spring at the Moscone Center in San Francisco. The 2026 edition drew more than 40,000 people. Next to practitioners, researchers and CISOs, its stages regularly host well-known names from Silicon Valley, government, and sometimes Hollywood. I had attended twice before, in 2024 and 2025, and being on the programme as a speaker the third time was something I am quietly proud of. Our talk was [Self-Learning WAF: Using Generative AI to Tame ModSecurity False Positives](https://path.rsaconference.com/flow/rsac/us26/FullAgenda/page/catalog/session/1753946922633001YdMq). I wrote about the conference itself in [Notes from RSAC 2026](/articles/notes-from-rsac-2026/).

The other one is, in hindsight, a small Enterprise Context Platform, scoped to the mandate of one squad. The problem was the same one this post is about, at a smaller size. Application teams wanted to know how their web services were exposed, which WAF rules applied to them, how the CDN in front of them behaved and what their DNS records actually did. The answers were spread across the proxies, the WAF, the CDN provider's console and the DNS, and the teams asking had access to none of them. So they asked us, and a large share of our week went to answering questions and carrying out changes by hand.

I formalised every data structure in the squad's domain as a **manifest**: a declarative, Git-persisted description of an exposure, a WAF policy, a CDN configuration, a DNS record, and how they related. On top of the manifests sat three layers:

{% diagram(title="The web delivery self-service, one squad's scope") %}
   ┌──────────────────────────┐
   │ Next.js frontend         │  self-service portal: see what is
   │                          │  exposed and how, order changes
   └─────────────┬────────────┘
                 ▼
   ┌──────────────────────────┐
   │ Go API backend           │  control plane: validates requests,
   │                          │  starts workflows
   └─────────────┬────────────┘
                 ▼
   ┌──────────────────────────┐
   │ Temporal workflows       │  create, adjust and remove resources,
   │                          │  do the operator work
   └──────┬────────────┬──────┘
          ▼            ▼
    manifests in Git    WAF, CDN, ingress proxies, DNS
    (source of truth)
{% end %}

The portal was a facade over the manifests. A team could look up its service and see, in one place, through which perimeter it was reachable, which WAF rules applied, how the CDN cached and forwarded, and which DNS records pointed where, without ever needing an account with the CDN vendor. When they wanted a change, they ordered it in the portal. The Go backend acted as the control plane, validated the request and started a Temporal workflow, and the workflow did what a human operator used to do: update the manifest in Git, apply the change to the WAF, the CDN, the proxies and the DNS, check the result and roll back if needed. Over time, the workflows took over practically all of the operational work that had needed dedicated operators.

Milan and I have submitted that system as a talk to the RSAC 2027 Call for Speakers. 

Three lessons from it carry directly into the platform this post is about. Formalising the data was the hard part and the valuable part; the portal and the workflows were easy once the manifests existed. Making the data readable to everyone removed most of the questions before they were asked. And once the data was trustworthy, automation followed almost by itself. The Enterprise Context Platform is the same bet with a much larger scope and a much higher ambition: not one squad's mandate, but the IT landscape of the whole group.

## Business intelligence has a twin nobody built

Business intelligence works because of a boring, well-understood architecture: operational systems produce data, a pipeline extracts it, a warehouse models it into facts and dimensions, and analysts and dashboards query the model. Nobody argues that a sales report should be assembled by emailing twelve regional controllers.

IT has all the operational systems and none of the rest. The data is there, scattered across systems of record that each know one slice:

| System | Typical examples | What it knows | What it does not know |
|---|---|---|---|
| EA repository (application portfolio) | Ardoq, LeanIX | applications, capabilities, business ownership, lifecycle | whether the application still exists in that shape |
| Data governance catalogue | Alation, Collibra, Microsoft Purview | data domains, data owners, classifications, lineage | which runtime actually touches the data |
| IT service management and CMDB | Jira Service Management, ServiceNow | services, configuration items, incidents, changes | the architectural intent behind them |
| Source code platform (git hosting) | Bitbucket, GitHub, GitLab | repositories, teams, code, dependencies, activity | which application a repository belongs to |
| Container platform | AKS, EKS, OpenShift | clusters, namespaces, workloads, images | who is accountable for a namespace |
| Observability platform | Datadog, Dynatrace, Grafana | dashboards, alerts, what people actually watch | what the metrics mean for the business |
| Internal platform services | an integration platform or message broker, a WAF, an API gateway, a CDN | integration flows, WAF rules, API exposure, CDN config | the end-to-end path a request takes |

The examples are the usual suspects in each category, listed alphabetically; most large companies run one or two from each row, and which ones does not change the argument.

Every row is somebody's source of truth for something. No row answers an architect's question on its own. The questions architects actually ask cross three or four rows at once: "which customer-facing applications in market unit X expose an API through the gateway without a WAF policy, and who owns them?"

That question has an answer, but it lives in the joins between the rows, and today the joins live in people's heads.

## Tribal knowledge and knowledge silos

A group with more than ten market units, each with its own platforms, squads and sometimes competing services, loses knowledge in two distinct ways, and it helps to keep them apart because they need different fixes. Both have decades of research behind them, and the research is more useful than the usual management slogans.

### Tribal knowledge: what was never written down

**Tribal knowledge** is knowledge that was never written down. Which team really runs the old integration hub. Why two applications share a database. That the gateway in one market unit quietly routes through another. It is not hidden on purpose; nobody ever turned it into words, let alone into structured data. It lives in a handful of people, and it leaves when they do.

The philosopher Michael Polanyi gave the underlying phenomenon its classic formulation in *The Tacit Dimension*: "we can know more than we can tell." Some of what an experienced engineer knows about a landscape is tacit in that strict sense. They recognise that a design will not work long before they can say why. Ikujiro Nonaka and Hirotaka Takeuchi built a model of organisational learning around converting such knowledge, the SECI model, and called the step from tacit to explicit *externalisation*. Their critics point out that much tacit knowledge resists codification altogether, and I think both sides are right. A lot of what passes for tribal knowledge in IT is not deeply tacit at all. It is explicit knowledge that nobody was ever asked to write down, because there was no place to put it. Who owns a namespace is perfectly sayable; it is just recorded nowhere.

James C. Scott adds the warning. In *Seeing Like a State* he describes *mētis*, the practical knowledge acquired through long experience, and shows how schemes that make a complex system legible from above tend to destroy exactly that knowledge, because the simplified map gets treated as the territory. Any platform that promises to make a company legible to itself should take that seriously. The Context Model will never contain everything the people running a system know, and it should not pretend to. What it can do is make the explicit part cheap, and point to the people who hold the rest.

That second job has a name too. Daniel Wegner's theory of *transactive memory* describes how groups remember: not everyone needs to know everything, as long as everyone knows *who knows what*. Small teams build that directory naturally. A group of thousands of people across ten market units cannot, and that is where tribal knowledge turns from a quirk into a risk. Software engineering measures one version of the risk directly as the *truck factor*, the number of people who would have to leave before a project stalls. Avelino and colleagues estimated it for 133 popular open source projects on GitHub and found that 65 percent had a truck factor of two or less. There is no reason to believe internal enterprise code does better, and because the Context Model already reads the commit history, it can compute a truck factor for every application in the group.

### Knowledge silos: written down, but out of reach

**Knowledge silos** are the opposite problem. The knowledge is formalised and persisted somewhere, in a tool, a spreadsheet, a wiki space, but it is not readily accessible to the people who need it. The complaint has its own famous line: "If only HP knew what HP knows", usually attributed to the former Hewlett-Packard CEO Lew Platt, though Carl Sieloff traces the phrase back to the 1980s as a standing complaint inside the company.

Sometimes the silo is an accident and sometimes it is deliberate. My own guesses at the reasons, from what I have seen, are some mix of:

- **Access control as a reflex.** In a regulated company the default answer to "who can read this?" is "as few people as possible", and it gets applied to metadata about systems as if it were customer data.
- **Licences priced per seat.** If every reader of the EA repository or the data catalogue costs a licence, reading becomes a budget decision.
- **Knowledge as a bargaining chip.** A team that is the only one able to answer a question is a team that gets invited to meetings, keeps its headcount and justifies its budget.
- **Fear of exposure.** Open inventories show the technical debt, the duplicated platforms and the shadow IT. Not everyone is keen to have that visible.
- **No interface.** The data sits in a legacy tool with no API, and the export is a quarterly spreadsheet someone produces by hand.
- **Competition between units.** When two squads offer overlapping platforms, making your own landscape transparent can feel like handing the other one an argument.

The literature supports some of these guesses and complicates others. Thomas Davenport, Robert Eccles and Laurence Prusak studied information management in more than twenty-five companies and published the result as "Information Politics" in 1992. Their observation was that information technology was supposed to flatten hierarchies and free information, and often did the opposite: once information became organisational currency, managers found it too valuable to give away. The most common arrangement they found they called *information feudalism*, where each department controls how its own information is gathered, stored and shared. Thirty years later, with every department running its own SaaS tools, that description has aged well.

Catherine Connelly and colleagues went further and studied *knowledge hiding*, the deliberate withholding of knowledge someone has asked for. They found three forms: evasive hiding (promising an answer that never comes, or giving a partial one), playing dumb, and rationalised hiding (explaining why the information cannot be shared). All three were predicted by distrust, and evasive hiding was less common where the climate encouraged sharing. One of the authors put the practical conclusion bluntly when the study came out: without a climate of trust, it does not matter how good the software is, people are not going to use it.

Gabriel Szulanski's study of best-practice transfer inside firms is the useful counterweight to my cynical list. Looking at 122 transfers in eight companies, he found that what made knowledge "sticky" was mostly not motivation. The main barriers were knowledge-related: the receiving unit lacked the capacity to absorb it, nobody fully understood why the practice worked, and the relationship between source and recipient was arduous. Many silos are simply hard to use, which makes them a design problem as much as a political one.

Morten Hansen adds a distinction I find essential for this platform. In a study of 120 product development projects, he showed that weak ties across units help teams *find* useful knowledge elsewhere, but that transferring complex knowledge needs strong ties between the people involved. He called it the search-transfer problem. A Context Model is a machine for search. It can tell an engineer in one market unit that the platform they need already exists in another, and who runs it. It cannot transfer the experience of running it. That still takes a conversation.

Finally, silos in the organisation become silos in the landscape. Melvin Conway observed in 1968 that organisations which design systems are constrained to produce designs that copy their own communication structures. Ten market units that do not talk to each other build ten integration platforms that do not talk to each other. Matthew Skelton and Manuel Pais turn this around in *Team Topologies* with the "inverse Conway manoeuvre": design the team structure for the architecture you want. You cannot do that well without first seeing the architecture you have. Gillian Tett, an anthropologist turned financial journalist, makes the broader case in *The Silo Effect*: silos are a side effect of expertise and specialisation, not only of bad intentions, and the organisations that manage them best are the ones that deliberately build ways to see across them.

### What the platform can and cannot do about it

| Phenomenon | What the research says | What the Context Model does | What it cannot do |
|---|---|---|---|
| Tacit knowledge | some knowledge cannot be told (Polanyi), and legibility schemes can destroy practical knowledge (Scott) | records what can be made explicit, links to the people who know the rest | capture judgement and experience |
| Unrecorded explicit knowledge | externalisation needs a place and a format (Nonaka and Takeuchi) | gives every fact a place, an owner and a provenance | make people write it down |
| Concentrated knowledge | groups depend on knowing who knows what (Wegner); truck factors are low (Avelino et al.) | makes the "who knows what" directory explicit, computes truck factors per application | spread the knowledge itself |
| Information feudalism and knowledge hiding | information is currency, hiding grows with distrust (Davenport et al., Connelly et al.) | makes reading the default and hiding visible as an exception | create trust on its own |
| Sticky knowledge | barriers are mostly absorptive capacity and causal ambiguity (Szulanski) | lowers the cost of finding and understanding context | replace learning |
| Search versus transfer | weak ties find, strong ties transfer (Hansen) | solves search, across all market units | replace the conversation that transfers complex knowledge |
| Organisational silos shaping systems | systems mirror communication structures (Conway) | shows the landscape as it is, so team design can be deliberate | reorganise anyone |

The last column matters as much as the third. Jeffrey Pfeffer and Robert Sutton called the general failure the *knowing-doing gap*: organisations often know what to do and still do not do it. An open map of the landscape closes the knowing part. The doing remains a question of incentives, ownership and leadership, which is why the platform is designed around contribution and authority as much as around data.

Both problems produce the same symptom for an architect: the cost of knowing what is there is higher than the cost of guessing, so people guess. Decisions get made on partial pictures, platforms get duplicated, and harmonisation becomes a series of negotiations instead of a series of queries.

## The problem, stated plainly

**A large company cannot cheaply and reliably answer questions about its own IT.** I mean the plain questions about the present, not the hard ones about the future. What exists, who owns it, how it connects, what it is for, and whether it matches what the strategy said it should be.

Everything else follows from that one gap. Strategy reaches the systems late and distorted, because nobody can check the systems against it without a project. Platforms get built twice, because the team building the second one could not find the first. Architecture reviews spend their time reconstructing the current state instead of judging the proposal. Operational teams answer the same questions every week, because the answers are not anywhere a person could look them up. And knowledge that lives in people, or behind someone's access policy, quietly decides which options a decision ever considers.

Agents make it urgent. A company that rolls out coding agents to every engineer and runs agent factories in its delivery pipelines is about to multiply the number of actors making decisions about its IT, and every one of them starts without context. Agents without enterprise context do what people without it do, only faster: they guess, they duplicate, and they build what already exists. The alternative is to give them, and the people around them, one place where the current state of the company's IT is known, trustworthy and open to read.

The goal, then, is to make the current state of enterprise IT cheap to know, trustworthy enough to act on, and open to every person and every agent who builds on it.

## One problem, three scales

Looking back, I have been working on the same problem for years, at a growing scale, and only recently gave it a name.

| Role | Scope | The question nobody could answer cheaply | What I built or did |
|---|---|---|---|
| Platform engineer and solution architect, web service delivery | one squad's mandate: WAF, CDN, ingress proxies, DNS | how is my web service exposed and protected? | manifests in Git, a self-service portal, Temporal workflows doing the operator work |
| Enterprise Solution Architect, agentic AI and AI platforms | solution architecture across 10+ market units | does what we build match what enterprise architecture and strategy intend? | reviews, directives and reference designs, starting every time from archaeology |
| Group AI Architect, AI and Data | the IT landscape of the whole group | what exists, how does it fit together, and what should we change? | the Enterprise Context Platform |

The pattern repeats at each step. First the data has to be formalised, then it has to be readable by everyone, and only then can work be automated on top of it, whether by workflows or by agents. In the web delivery squad that pattern worked. In the enterprise solution architect role, its absence was the main cost of the job. The Enterprise Context Platform is the attempt to apply it to the whole company.

It also connects to what I have been writing here. [Context Is the Product](/articles/context-is-the-product/) and the rest of [The Agent Platform Handbook](/articles/what-an-agent-actually-is/) argue that the context an agent reads matters more than the model it runs on, at the scale of one repository. [Memory Is a Write Path](/articles/memory-is-a-write-path/) is about how context gets written back safely, which is the same question as how a data set becomes a primary source. The notes on the [enterprise context warehouse](/notes/the-enterprise-context-warehouse/) sketched the idea at company scale before I had built any of it. And this site is a toy version of the same thing: every page is published again for machines, as described in [This Site Is Becoming a Map](/articles/this-site-is-becoming-a-map/). The Enterprise Context Platform is where those threads meet in production.

## What I mean by an Enterprise Context Platform

An EA repository is a curated description of the landscape, maintained by architects for architects. The Enterprise Context Platform is a data layer for everything that happens inside an IT department: what is built, deployed, exposed, changed, broken, watched, owned and decided, as it happens, from the systems where it happens. The EA repository is one of its sources and the architect one of its users; its main consumers, increasingly, are agents.

The platform I started building has three layers, and the middle one is the point.

{% diagram(title="Enterprise Context Platform") %}
   SOURCES                 CONTEXT MODEL              SURFACES
   EA repository ─────┐
   data catalogue ────┤    ┌────────────────────┐
   ITSM and CMDB ─────┤    │ entities           │ ──▶ Web UI
   source code ───────┼──▶ │ relationships      │ ──▶ REST API
   container platform ┤    │ provenance         │ ──▶ MCP, for agents
   observability ─────┤    │ confidence         │
   integration ───────┤    └─────────┬──────────┘
   WAF and exposure ──┤              ▼
   CDN ───────────────┘     analytics over the model
            ingest                   ▼
                            artifacts: analyses, business
                            cases, diagrams, ADRs
{% end %}

**Ingestion.** Each source gets a connector. Some of it is static and deterministic: a namespace on the container platform is a namespace, a team on the source code platform is a team, an application in the EA repository has an ID. Some of it needs help. Mapping a repository called `pol-adm-svc-v2` to the application "Policy Administration" in the EA repository is a judgement call, and that is where the ingestion is AI-assisted: a model proposes the link from names, READMEs, owners, deployment labels and descriptions, and records how confident it is and why.

The ingestion layer also scores every data set from every source for accuracy. Not every system of record deserves the same trust: an inventory pulled live from the container platform is close to ground truth, an application list maintained by hand once a year is not. The score is computed, not declared, from signals such as freshness, completeness of mandatory fields, how often the source agrees with other sources about the same entity, and how many of its records survive identity resolution. A sketch of what a source scorecard records:

```yaml
# ingestion/scorecards/ea-repository.yaml (illustrative)
source: ea_repository
dataset: applications
last_ingested: 2026-10-29T03:00:00Z
scores:
  freshness: 0.62        # share of records touched in the last 180 days
  completeness: 0.81     # mandatory fields present
  agreement: 0.74        # facts confirmed by at least one other source
  resolvability: 0.88    # records matched to a Context Model entity
overall: 0.76
```

The scores travel into the model. A relationship derived from a high-scoring data set starts with more confidence than one derived from a low-scoring one, and every owner can see how their source compares with the rest.

**The Context Model.** This is the ontology, the heart of the platform. Raw records from sources are not the model. The model is the set of abstract entities deduced from those records and the relationships between them: an Application is realised by Repositories, deployed as Workloads in Namespaces, owned by a Team, supports a Capability, processes Data Objects of a certain classification, is exposed through an Endpoint, sits behind a WAF policy, is watched by a Dashboard. An Application in this sense is what you get when a record in the EA repository, three code repositories, two namespaces and a business service in IT service management turn out to be the same thing.

**Surfaces.** The model is exposed three ways, Web UI, REST API and MCP, and each serves a different kind of consumer. The same entities with the same semantics sit behind all three, which matters more every month, as I argued in [Context Is the Product](/articles/context-is-the-product/).

| Consumer | Surface | What they do with it |
|---|---|---|
| Coding agents on every developer and engineer notebook (local Claude Code instances) | MCP | ask which service owns an API, which platform to deploy to, what the reference architecture says, before writing a line of code |
| Remote agent factories in the SDLC | MCP | the same questions, asked by agents that build, test and change software in pipelines rather than on a laptop |
| Enterprise architects, solution architects and engineers | Web UI | discover what exists, learn how a domain fits together, explore dependencies before a design review |
| Other systems that need the context | REST API | sink systems pull Context Model data into their own processes: portfolio tooling, risk and compliance reporting, onboarding, cost allocation |

The first two rows are the reason the platform has to exist now rather than in five years. A coding agent on a notebook starts every session knowing nothing about the company it works for. Give it an MCP endpoint into the Context Model and it knows which team to ask, which platform service to reuse instead of rebuilding, and which architectural decision already ruled out the approach it was about to take. Multiply that by every engineer and every agent factory in the group, and the Context Model becomes the shared memory of how the company builds software.

On top of the model sits analytics, and that is where it stops being a catalogue and starts being intelligence. Because the model is connected, it can produce artifacts: an architecture analysis of a market unit, the first draft of a business case for consolidating three overlapping platforms, a solution architecture diagram generated from what actually runs, an EA view of capability coverage, an architecture decision record pre-filled with the current state and the options. The same analytics find business use cases on their own: processes that cross five systems where two would do, components duplicated in four market units, solutions that could be made more efficient (same outcome, less cost) or more effective (better outcome, same cost). A finding like that used to need someone who happened to know both sides. Now it needs a query and someone willing to act on it.

## Why the ontology is the hard part

Ingestion is plumbing. Surfaces are a UI and two APIs. The Context Model is where the real decisions are, and where I have changed my mind most.

A minimal slice of the entity model looks roughly like this. It is illustrative, not the actual schema:

```yaml
# context-model/entities.yaml (illustrative)
Application:
  identity: [ea_repository.application_id]
  derived_from: [ea_repository.application, itsm.business_service]
  relations:
    realised_by:   Repository      # many
    deployed_as:   Workload        # many
    owned_by:      Team            # one, accountable
    supports:      Capability      # many
    processes:     DataObject      # many, with classification
    exposed_via:   Endpoint        # many

Repository:
  identity: [source_code.repository_path]
  relations:
    belongs_to:    Application     # inferred, carries confidence
```

Three things turned out to matter more than I expected.

**Identity resolution is most of the work.** The same application has a different name in every system, and sometimes no name at all. Deciding when two records are the same entity is the core problem. Deterministic keys solve part of it (a deployment label that carries the application ID from the EA repository is a gift). The rest is inference, and inference needs to be visible.

**Every edge carries provenance and confidence.** An edge that came from a foreign key in an API is a different kind of fact than an edge a model proposed from a README. Both are useful. Treating them as equal is how you build a beautiful graph that nobody trusts. Each relationship records where it came from, when it was last seen, and whether it was asserted, derived or inferred. I made the same argument for the [context warehouse](/notes/the-enterprise-context-warehouse/), and it holds even more strongly once the graph starts producing artifacts people act on.

**The model has to be opinionated, and the opinions have to be the enterprise architecture's.** The entity types, the relationship types and the capability map are not neutral. They are where corporate strategy and EA's capabilities enter the platform. If the Context Model uses the same capability taxonomy that EA uses, then "which systems support capability X across all market units" is a query, not a project. That is the harmony problem from my previous role, turned into a data problem. More on that in [A taxonomy agents can read](/notes/a-taxonomy-agents-can-read/).

## Primary and secondary sources

Not all data in the Context Model has the same standing, and the model says so explicitly.

Most of it starts as a **secondary source**: a copy, ingested from a system that is authoritative for it. The container platform is authoritative for what runs in a namespace. The source code platform is authoritative for who has access to a repository. The Context Model mirrors those facts, scores them and connects them, but if it disagrees with the source, the source wins and the correction goes there.

Some of it is a **primary source**: the Context Model is the authoritative place for it. At first that is mostly what no other system holds, the confirmed links between entities. Nobody else records that these three repositories, these two namespaces and that business service are one application. Once a team confirms it, that fact lives in the Context Model and nowhere else.

Over time, more data moves from secondary to primary. When a data set is curated, scored highly and used everywhere through the model, and the original tool adds nothing but a second place to maintain it, the sensible thing is to declare the Context Model authoritative for it and retire the copy.

{% diagram(title="How a data set changes standing") %}
   ┌──────────────────────────┐
   │ ingested from a source   │  secondary: the source wins
   └─────────────┬────────────┘
                 ▼
   ┌──────────────────────────┐
   │ scored and connected     │
   │ in the model             │
   └─────────────┬────────────┘
                 ▼
   ┌──────────────────────────┐
   │ curated by its owner,    │
   │ used through the model   │
   └─────────────┬────────────┘
                 ▼
   ┌──────────────────────────┐
   │ declared primary in      │  an explicit decision, with
   │ the Context Model        │  an owner and a date
   └──────────────────────────┘
{% end %}

The move is always an explicit decision, made per data set, with an owner and a date, so everyone knows where to correct a fact.

## Open by default

The premise I hold most firmly is that **enterprise IT context is not sensitive**. Which applications exist, who owns them, which capabilities they support, which platforms they run on, how they connect: all of it should be accessible to anyone in the company, and to any agent working on their behalf.

IT context here means the metadata about systems, not the data inside them. Customer records, credentials and secrets are not IT context and never enter the model. Everything that describes the landscape does.

The argument is about who gets to think holistically. When context is restricted, only the few people with access to every silo can see the whole, and they become the bottleneck for every decision that crosses a boundary. When it is open, an engineer in one market unit can notice that the platform service they are about to build already exists in another. A solution architect can see the second-order effects of a design before the review. A coding agent can reuse instead of duplicate. Democratising IT context is how you get more people, and more agents, contributing to the decisions that create the most value, instead of waiting for the few who can see everything.

## Built in the open, improved by contribution

The platform is built entirely on open source technology. No vendor product sits at its core. That was a deliberate choice, and not only for cost.

A platform that asks the whole company to trust its picture of the landscape has to be transparent about how that picture is made. Every connector, every scoring rule, every entity type and every inference prompt can be read and understood by anyone who cares to look. When someone asks why the model says an application belongs to their team, the answer is a chain of sources and rules they can follow, not a black box.

The same openness makes contribution possible. Teams can add connectors for their own systems, propose entity types, correct mappings and curate their data sets. And they have a reason to. A data set that is accurate, curated and meaningfully connected in the Context Model is used by every architect, every engineer and every agent in the group. It scores well, it gets read, and it may end up being declared authoritative. A data set that is stale scores badly, and everyone can see that too. The incentive is built into the model: the more care a team puts into its data, the more valuable that data becomes, for them and for everyone else. The idea is close to what Zhamak Dehghani describes as *data as a product* in data mesh: the domain that knows the data owns it, curates it and serves it to others with explicit quality guarantees. The Context Model applies the same principle to metadata about IT, with the scorecards as the quality guarantee.

## What it changes for an architect

The difference shows up in the questions that become cheap.

| Question | Before | With the Context Model |
|---|---|---|
| Which applications in market unit X use a language model? | survey, two weeks | a query, plus a list of low-confidence matches to check |
| Who owns namespace `claims-prod-07`? | ask around | owning team via workload, repository and application |
| Do our AI solutions follow the group reference architecture? | review each design | compare actual topology to the reference, per market unit |
| What would consolidating these three integration platforms touch? | a workshop | the dependency subgraph, as a diagram and a draft business case |
| Is this ADR still true? | nobody knows | the ADR's assumptions checked against the current model |

None of these answers is perfect. All of them are a better starting point than a blank page and a meeting invite. The architect's job moves from gathering the current state to judging it, which is the shift I described in [What the architect does now](/notes/what-the-architect-does-now/).

## From context to work

The table above is the architect's view, and it undersells the platform. The architect is the user who notices the gap first, not the one who benefits most.

Most work in an IT department is routine: looking things up, translating between systems, coordinating between teams, and carrying out changes that follow a known pattern. Who owns this, where does it run, what depends on it, which rule applies, which form do I fill in, who has to approve, what changed last week. People do that work today because the context it needs is scattered across a dozen tools and a few hundred heads. An agent can do most of it, but only if it can read that context, and that is precisely what the Context Model provides.

| Role today | Work that is mostly context retrieval and routine change | What an agent needs from the Context Model |
|---|---|---|
| Service desk and operations | routing incidents, finding owners, applying standard changes | ownership, dependencies, change history, runbooks |
| Platform operators | provisioning, exposure, certificates, DNS, WAF exceptions | the manifests, the policies, the current state of every resource |
| Solution and enterprise architects | current-state analysis, compliance checks against principles, first drafts of designs and ADRs | the landscape, the capability map, the reference architectures, past decisions |
| Security and compliance | evidence collection, control checks, exposure reviews | what is exposed, through what, with which data classification |
| Engineers and coding agents | finding the right service, API, platform and convention before building | everything above, through MCP, in the editor |
| Portfolio and IT management | inventories, cost allocation, rationalisation candidates | applications, owners, usage, overlaps across market units |

I have seen this happen at small scale. In the web delivery squad, once the manifests existed and the Temporal workflows could read them, the workflows took over practically all of the operational work that had needed dedicated operators. The automation had been possible for years; what it had lacked was context good enough to act on safely.

Done right, at the scale of a whole IT department, this substantially reduces the number of people an IT organisation needs. Not by replacing judgement, which becomes more valuable, as I argued in [What the architect does now](/notes/what-the-architect-does-now/), but by removing the large share of work that only existed because context was expensive to get. That is the business case, and it is a much larger one than better architecture reviews. How a company handles the people side of that shift is a leadership question this platform does not answer, and it deserves more care than a blog post can give it.

## Context is cheaper than exploration

Headcount is the part of the business case people notice. The part they miss is what happens to the agents themselves.

An agent without enterprise context keeps working anyway, by exploring. Asked who owns a service and what depends on it, a coding agent on a notebook will search repositories, read READMEs, grep deployment files, query the cluster if it has access, follow links into a wiki, and reason over everything it found. Every one of those steps is a tool call, every tool result goes into the context window, and the whole growing window is paid for again on every following turn. Then the next agent, on the next notebook, asks the same question and does the same exploration from scratch, and so does every agent after it.

The difference is easiest to see as an order of magnitude. The numbers below are my own illustrative estimates, not measurements:

```text
Question: "Who owns payment-gateway, and what breaks if we change its API?"

Without a Context Model                    With a Context Model
---------------------------                --------------------
~25 tool calls (search, read, grep, ...)   1 to 2 MCP calls
~150,000 to 250,000 input tokens           ~3,000 to 6,000 input tokens
over the whole exploration                 one entity and its subgraph
answer: plausible, unverified              answer: sourced, scored, current
repeated by every agent that asks          computed once, read by everyone

1,000 engineers x 20 such questions a day x ~200,000 tokens
  = ~4 billion tokens a day spent rediscovering the same facts
```

Tokens are not a rounding error. As I argued in [The Economics of Inference](/articles/the-economics-of-inference/), they are a metered resource that behaves more like electricity than like software licences, and an enterprise that rolls out agents to thousands of people will feel them on the bill. A Context Model turns repeated exploration into a lookup. The ingestion layer does the expensive work once, scores it and keeps it current, and every agent afterwards reads the result. It is the same move as a cache or a materialised view, applied to what a company knows about itself.

The second effect is quality. A context window is finite, and every token spent on exploration is a token not spent on the actual task. An agent that starts from a clean, sourced subgraph reasons over the right facts instead of over whatever its search happened to surface. It also stops making the classic mistakes of an agent without context: building a service that already exists, choosing a platform the company is retiring, contradicting an architecture decision it never saw. In the sense that matters to a company, an agent gets smarter by starting from what the company already knows, whichever model it runs on. I made the same argument for single repositories in [Context Is the Product](/articles/context-is-the-product/) and [Retrieval Is a Tool, Not a Layer](/articles/retrieval-is-a-tool-not-a-layer/); the Context Model is that argument at enterprise scale.

The third effect is the one I underestimated: communication gets clearer. Today a conversation about "the payment gateway" between two teams can be about three different things, and nobody notices until a change breaks the wrong one. With a Context Model there is one place where entities are defined, one identifier for each, and one vocabulary, the ontology, that everyone uses:

| Between | Before | With a shared Context Model |
|---|---|---|
| Human and human | different names for the same system, different pictures of the landscape | one entity, one identifier, one page to point at |
| Agent and human | the agent's answer is plausible but untraceable | the answer cites entities, and each entity cites its secondary source |
| Agent and agent | each agent explores separately and hands over prose | agents hand over entity references that both can resolve |

None of this hides the original sources. Every fact the Context Model returns carries its provenance: which system of record it came from, when it was last seen, how that source scored. The ontology is the common language; the systems of record remain one click away for anyone, human or agent, who wants to check.

## A new level of abstraction

Step back, and this is a familiar story in IT. Every major advance has moved the level at which people solve problems. Assembler let programmers stop writing machine code. C let them stop thinking in registers. Object-oriented and managed languages let them stop managing memory and start modelling domains. Frameworks, cloud platforms and infrastructure as code removed whole layers of plumbing. Each time the work moved up rather than disappearing, and the people who did it started solving larger problems.

Coding agents are the next step, and a bigger one. Since the generation of models around Claude Opus 4.5, released in November 2025, agents such as Claude Code write most of the code in a growing number of teams, including mine, as I described in [How I Work These Days](/articles/how-i-work-these-days/). A technical person now mainly produces intent, constraints, design and judgement, and less and less code. I argued in [Source Code Is the New Assembly](/articles/semantic-artifacts-and-meaning-engines/) that code is becoming a lowering target, the way assembly became one.

That changes the job. An engineer working with agents spends their time the way a solution architect, a requirements engineer or a business analyst does: understanding the problem, deciding what should be built, specifying it well enough that an agent can build it, and judging whether the result is resilient, scalable and right. The technical background stays essential, because it is what lets them judge, but the level at which they work has moved up by a whole layer.

At that level the most important input is context. An engineer who works as an architect needs to know the landscape; an agent that builds what they specify needs to know it too. That is why I think IT intelligence and the new abstraction belong together. The Context Model is what makes working at the higher level safe, because it is the shared, current, sourced picture that both the human and the agent design against.

## The organisation is the next bottleneck

If engineers work like architects and analysts, and agents carry out most of the implementation, then competencies that used to sit in different roles, and different boxes on the org chart, start to concentrate in the same people. Engineering, architecture, requirements and analysis converge. And they begin to compete with management and decision-making as well. Much of what middle management does in an IT organisation is coordination: finding out who knows what, translating between teams, sequencing work, reporting status. A Context Model and a fleet of agents do a lot of exactly that. When a small team with agents can understand a problem, design a solution, build it and run it, the layers that existed to coordinate large teams around scarce implementation capacity lose much of their reason to exist.

Most enterprise IT organisations were designed around that scarcity. Building was slow and expensive, so the organisation grew structures to ration it: demand management, project portfolios, annual budget cycles, long queues for architecture review, separate teams for requirements, design, build and run. Conway's law cuts both ways here. Those structures produced the fragmented landscape described at the start of this post, and they will keep producing it, at agent speed, unless they change.

When building becomes fast and cheap, the bottleneck moves. It moves to deciding what to build, and to the business absorbing what gets built. The money-making business units, the functional consumers of everything IT delivers, now have to keep up: formulate needs precisely enough, decide faster, change their processes when the new solution arrives, and stop treating IT as a queue they wait in. An IT department that can deliver in weeks what used to take quarters is only worth as much as the business's ability to use it.

I do not know yet what the right organisational shape is. I am fairly sure about some of its properties:

- **Smaller teams with broader mandates**, each owning a problem from understanding to operation, with agents doing most of the implementation.
- **Decision rights closer to the business**, because the person who understands the need and the person who can now build the solution are increasingly the same person or sit at the same table.
- **Funding by product and outcome rather than by project**, because projects are a unit of scarce implementation capacity, and that capacity is no longer the scarce thing.
- **Governance as an automated gate rather than a review queue**, scoring designs against the Context Model at design time and escalating only what genuinely needs a human, as in [Design-time risk with a threshold](/notes/design-time-risk-with-a-threshold/) and [Architecture becomes a loop](/notes/architecture-becomes-a-loop/).
- **A shared picture of the company as infrastructure**, which is what the Context Model is for.

This is a shift in kind, not in degree. It changes how technology is built, and it changes how an organisation has to be built to absorb technology at the pace it can now be produced. Companies that introduce coding agents without IT intelligence will get faster at building the wrong things. Companies that introduce both without changing their organisation will build the right things and then wait for the organisation to catch up. The ones that do all three will look very different in five years from the ones that do not.

## Related work, and what this is not

None of the individual ideas here is new, and the work that came before deserves credit.

**Automated EA documentation.** Researchers at TU Munich and the University of Innsbruck have worked for over a decade on keeping enterprise architecture models current automatically instead of by hand. Farwick and colleagues collected the requirements for automated EA model maintenance in 2011 and analysed which information sources inside a company can feed an EA model, and how good their data is, in 2013, which is the ingestion and scoring problem described above. Martin Kleehaus and Florian Matthes later showed how runtime instrumentation of services can keep EA models up to date. More recently, Reitemeyer and Fill surveyed how large language models and knowledge graphs combine in enterprise modelling. This body of work is the closest academic ancestor of the Context Model, and it shows the problem is old. Its goal, though, is a better EA model. The goal here is a data layer that agents can work from.

**AI context platforms.** In 2026 the industry discovered the same gap from the other side. Gartner, according to vendor summaries of its reports, has started describing a category of *AI context platforms*: software that constructs, governs and delivers semantically organised knowledge to AI agents. Several products launched under that banner this year. TopQuadrant markets TQ Data Foundation explicitly as an enterprise context platform. DataHub launched a context platform that merges metadata from more than a hundred data systems into a graph served to agents over MCP. Neo4j announced a context engine. And Ardoq, an EA tool vendor, acquired the graph database GraphLake to build what it calls an "EA-grade context graph for enterprise AI", with its CEO declaring that enterprise architecture "is the substrate the rest of the AI stack runs on".

I take the market's arrival as confirmation that the gap is real, and I am clearly not the only person who reached for the words "enterprise context platform". But the differences matter, and they are the reason this should not be read as one more EA repository or one more data catalogue:

| | EA repository | Data catalogue and context products | Enterprise Context Platform |
|---|---|---|---|
| What it describes | the application portfolio, as architects curate it | analytical data: tables, metrics, lineage | everything that happens in IT: portfolio, code, runtime, exposure, operations, decisions |
| Where the data comes from | mostly manual entry | data platforms and BI tools | every system of record and every platform, scored for accuracy |
| How current | as current as the last review | close to the data stack | as current as the sources, with "last seen" on every fact |
| Who it is for | architects | analysts and analytics agents | every person and every agent in IT, in any role |
| Authority | the repository is the record | mirrors the sources | secondary by default, primary where declared |
| Access | licensed seats | licensed, often per user | open to everyone by default |
| Technology | vendor product | vendor product | open source, readable, extensible by contribution |

The closest neighbour is the developer portal, such as Backstage, whose software catalogue gives a software organisation one model of what exists. The Context Model is that idea extended from one engineering organisation to a whole IT department, and from people browsing a catalogue to agents doing work.

## Tradeoffs and objections

**"This is just a CMDB."** A CMDB is a system of record that teams are asked to maintain by hand, which is why it drifts. The Context Model is derived first. It does not depend on anyone typing things in; it reads what the systems already say and keeps its own opinion separate from the sources. Where the CMDB is right, the model agrees with it. Where it is wrong, the model shows the disagreement, which is itself useful.

**"This is just an EA repository with more connectors."** An EA repository is very good at the portfolio view, and it is one of the most important sources here. But it describes the landscape as architects intend and curate it, a few times a year, for a few licensed readers. It does not know what runs on the cluster, what the WAF lets through, which code repository actually implements an application, which incident hit it last night, or which change is in flight. The Context Model is built from all of that, continuously, for every person and agent who works in IT. The EA repository feeds it; the two are not the same kind of thing.

**"AI-assisted ingestion means hallucinated architecture."** It would, if inferred edges were presented as facts. They are not. Inferred relationships carry their confidence and their reasoning, low-confidence ones are queued for confirmation by the owning team, and a confirmation becomes an asserted fact with a name and a date attached. I would not trust the platform without this, and neither should anyone else.

**"Why build it yourself?"** Partly because the ontology is the product, and an ontology bought off the shelf encodes someone else's enterprise. Partly because the sources are a specific mix of vendor tools and internal platforms that no product covers. Partly because a platform people are asked to trust and contribute to has to be one they can read, which an open source stack allows and a vendor product does not. And partly because I needed to know whether the idea holds before asking anyone to fund it. A self-built platform is the cheapest honest test.

**"An open map of the IT landscape helps attackers."** It is the objection I hear most. An attacker who is already inside the network can map most of the landscape with enough time; the defenders and builders, today, often cannot. Keeping the map closed mostly protects the attacker's advantage in patience. Real protection belongs on the systems themselves, in identity, network controls and secrets management, not in making it hard for colleagues to know what exists. Where a single detail is genuinely dangerous, a specific vulnerability or a credential, it is not IT context and it does not go into the model.

What it costs: connectors break when sources change their APIs, identity resolution needs ongoing care, and access is the real constraint. A platform that sees the whole IT landscape needs read access to the whole IT landscape, and in a regulated financial group that is a conversation, not a config change. I wrote about that in [The bottleneck is read access](/notes/the-bottleneck-is-read-access/).

## Failure modes I am watching for

- **The pretty graph.** A UI that impresses in a demo and answers no real question. The test is whether architects open it before a review without being asked to.
- **Silent staleness.** A source connector fails, the model keeps showing last month's state, and nobody notices. Every entity needs a "last seen" and the UI has to show it.
- **Ontology sprawl.** Every team wants its own entity type. The model has to stay small enough that one person can explain it on a whiteboard.
- **Artifact over-trust.** A generated business case reads well and is wrong in a way only the owning team would spot. Artifacts are drafts with sources, not answers.
- **A second shadow repository.** If people start editing secondary data in the platform instead of in its system of record, it becomes the thing it was supposed to fix. Corrections to secondary data go back to the source. Only data explicitly declared primary is maintained in the Context Model.
- **Openness eroded by exceptions.** Every team that asks to hide one field has a reasonable-sounding reason. Grant enough of them and the model becomes another silo. Exceptions need a high bar and a public list.
- **Gamed scores.** Once scores carry status, someone will optimise for the score rather than the accuracy. The signals have to stay grounded in agreement with other sources, which is hard to fake.

## Closing

Business intelligence made a company legible to its executives. IT intelligence makes it legible to everyone who builds it, people and agents alike, and as the level at which software gets built moves up, that shared picture of the company becomes the thing everything else is built on. The [loop I sketched for architecture](/notes/architecture-becomes-a-loop/) needs a place to start from and a place to land back in, and the Context Model is meant to be both.

## References

Knowledge, tacit and explicit:

- Michael Polanyi, *The Tacit Dimension*, Doubleday, 1966; reissued by the University of Chicago Press, 2009, with a foreword by Amartya Sen.
- Ikujiro Nonaka and Hirotaka Takeuchi, *The Knowledge-Creating Company*, Oxford University Press, 1995; an overview of their [SECI model](https://en.wikipedia.org/wiki/SECI_model_of_knowledge_dimensions).
- James C. Scott, *Seeing Like a State*, Yale University Press, 1998, chapter 9 on mētis.
- Daniel M. Wegner, "Transactive Memory: A Contemporary Analysis of the Group Mind", in B. Mullen and G. R. Goethals (eds.), *Theories of Group Behavior*, Springer, 1987; Wegner's own [summary of transactive memory](https://dtg.sites.fas.harvard.edu/DANWEGNER/wjh/tm.htm).
- Guilherme Avelino, Leonardo Passos, Andre Hora and Marco Tulio Valente, [A Novel Approach for Estimating Truck Factors](https://arxiv.org/abs/1604.06766), ICPC 2016.
- [Tribal knowledge](https://en.wikipedia.org/wiki/Tribal_knowledge), Wikipedia, for the term and its usage.

Silos, hiding and transfer:

- Thomas H. Davenport, Robert G. Eccles and Laurence Prusak, "Information Politics", *Sloan Management Review* 34(1), 1992, pp. 53 to 65.
- Catherine E. Connelly, David Zweig, Jane Webster and John P. Trougakos, [Knowledge hiding in organizations](https://doi.org/10.1002/job.737), *Journal of Organizational Behavior* 33(1), 2012, pp. 64 to 88; a shorter [research brief](https://smith.queensu.ca/insight/content/research-brief-knowledge-hiding-in-organizations.php) from Queen's University.
- Gabriel Szulanski, "Exploring Internal Stickiness: Impediments to the Transfer of Best Practice Within the Firm", *Strategic Management Journal* 17, Winter Special Issue, 1996, pp. 27 to 43.
- Morten T. Hansen, [The Search-Transfer Problem: The Role of Weak Ties in Sharing Knowledge across Organization Subunits](https://doi.org/10.2307/2667032), *Administrative Science Quarterly* 44(1), 1999, pp. 82 to 111.
- Carl G. Sieloff, ["If only HP knew what HP knows": the roots of knowledge management at Hewlett-Packard](https://doi.org/10.1108/13673279910259385), *Journal of Knowledge Management* 3(1), 1999.
- Gillian Tett, *The Silo Effect: The Peril of Expertise and the Promise of Breaking Down Barriers*, Simon and Schuster, 2015.
- Jeffrey Pfeffer and Robert I. Sutton, *The Knowing-Doing Gap*, Harvard Business School Press, 2000.

Automated EA documentation:

- Farwick, Agreiter, Breu, Ryll, Voges and Hanschke, "Requirements for Automated Enterprise Architecture Model Maintenance", ICEIS 2011.
- Farwick, Breu, Hauder, Roth and Matthes, "Enterprise Architecture Documentation: Empirical Analysis of Information Sources for Automation", HICSS 2013.
- Roth, Hauder, Farwick, Breu and Matthes, "Enterprise Architecture Documentation: Current Practices and Future Directions", Wirtschaftsinformatik 2013.
- Martin Kleehaus and Florian Matthes, [Automated Enterprise Architecture Model Maintenance via Runtime IT Discovery](https://doi.org/10.1007/978-3-030-49640-1_13), in *Intelligent Systems Reference Library* 188, Springer, 2021, pp. 247 to 263.
- Reitemeyer and Fill, [Applying Large Language Models in Knowledge Graph-based Enterprise Modeling: Challenges and Opportunities](https://arxiv.org/abs/2501.03566), 2025.

AI context platforms (2026):

- Gartner, *Market Overview for AI Context Platforms*, 13 August 2026, and *How to Navigate the Emerging AI Context Platform Market*, 1 September 2026; I have read only the [abstracts](https://www.gartner.com/en/documents/8486545) and vendor summaries such as [Atlan's](https://atlan.com/know/ai-agent/context-layer/gartner-impact-radar-ai-context-platform/).
- TopQuadrant, [TopQuadrant Launches Enterprise Context Platform to Build Trusted AI](https://www.einpresswire.com/article/893232971/topquadrant-launches-enterprise-context-platform-to-build-trusted-ai), 18 February 2026.
- DataHub, [Announcing the DataHub Context Platform](https://datahub.com/?p=14496), 2026.
- Neo4j, [Neo4j Context Engine](https://neo4j.com/?p=433599), October 2026.
- Ardoq, [Ardoq Acquires GraphLake to Establish the EA-Grade Context Graph for Enterprise AI](https://www.ardoq.com/news/ardoq-graphlake-context-graph-enterprise-ai), 8 June 2026.
- [Backstage software catalog](https://backstage.io/docs/features/software-catalog), the developer-portal version of the idea.

Organisation and architecture:

- Melvin E. Conway, [How Do Committees Invent?](http://www.melconway.com/Home/Committees_Paper.html), *Datamation* 14(4), 1968, pp. 28 to 31.
- Matthew Skelton and Manuel Pais, *Team Topologies*, IT Revolution, 2019.
- Zhamak Dehghani, [Data Mesh](https://www.thoughtworks.com/insights/books/data-mesh), O'Reilly, 2022.
- Jeanne W. Ross, Peter Weill and David C. Robertson, *Enterprise Architecture as Strategy*, Harvard Business School Press, 2006.
- Michael Nygard, [Documenting Architecture Decisions](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions), the origin of the ADR.

Conferences:

- [RSAC Conference](https://www.rsaconference.com/About/FAQ), San Francisco.
- Raffael Schneider and Milan Duric, [Self-Learning WAF: Using Generative AI to Tame ModSecurity False Positives](https://path.rsaconference.com/flow/rsac/us26/FullAgenda/page/catalog/session/1753946922633001YdMq), RSAC 2026, session NCS-W01.

Technology:

- Anthropic, [Introducing Claude Opus 4.5](https://www.anthropic.com/news/claude-opus-4-5), November 2025.
- [Model Context Protocol](https://modelcontextprotocol.io/), the protocol behind the agent endpoints.
- [Temporal](https://temporal.io/), the durable workflow engine behind the web delivery self-service.
