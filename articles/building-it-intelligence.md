---
title: "Building IT Intelligence: A Reference Implementation in One Repository"
url: https://raskell.io/articles/building-it-intelligence/
author: Raffael Schneider
date: 2026-11-16
description: "How to build an Enterprise Context Platform from open source parts: ontology, connectors, workflows, store, API, MCP and UI, in one repository you can run."
tags: [enterprise-architecture, context-engineering, agents, provenance, oss, durable-execution, knowledge-management]
---

# Building IT Intelligence: A Reference Implementation in One Repository

## In short

This is a reference implementation of the IT intelligence platform from my earlier post, in one open source repository with a deliberately messy fictional company, the Kestrel Group, inside it. The ontology comes first and everything is generated from or validated against it, and observations from sources are kept separate from the entities the model concludes from them. Every relationship is a row with a basis, a confidence and a source, and identity resolution runs from shared keys to rules to model inference, with uncertain links queued for the owning team to confirm. A workflow orchestrator, separate from the API, ingests with retries and resume, sources are scored in public, and the API serves REST and an MCP server whose small, entity-centric answers always carry their provenance. The order of the layers matters more than the tools; the database, workflow engine, frontend and model provider are choices you can revisit, and a test suite checks this post's claims against the running system.

In [IT Intelligence](https://raskell.io/articles/it-intelligence/) I argued that large companies never built for their own IT what they built for their sales figures: one model that knows what exists, who owns it, how it connects and whether it matches the strategy, readable by every person and every agent who works on it. The obvious next question is a fair one: what does that look like when you build it?

This post answers it as concretely as I can without showing anyone's real landscape, by walking through a reference implementation in a single open source repository, [raskell-io/it-intelligence](https://github.com/raskell-io/it-intelligence), with a fictional company inside it. You can clone it, run it on a laptop, point a coding agent at it, and see every layer the first post described: connectors, workflow orchestration, a persistence store, the Context Model itself, an API backend with an MCP server, a frontend, and the analytics that turn the model into artifacts.

The reference is smaller, simpler and more boring than the platform I run at work, but it has the same shape, and the shape is what I want to show.

## The fictional company

Every example below uses the **Kestrel Group**, a made-up financial group with three market units, about forty applications, a dozen teams, two container clusters, a WAF, an API gateway and the usual collection of systems of record. The repository ships Kestrel as seed files that imitate the exports you would get from real tools: an application list from an EA repository, configuration items and incidents from an IT service management tool, repositories and teams from a git host, namespaces and workloads from a cluster, policies from a WAF, routes from a gateway.

The seed data is deliberately messy. Names differ between systems, two applications claim the same repository, one namespace has no owner label, a market unit runs its own integration platform that nobody in group IT knows about, and the EA repository lists an application that was switched off a year ago. A clean demo would prove nothing, because IT intelligence earns its keep where the sources disagree.

## The shape of the system

*it-intelligence, the reference implementation*

```text
   ┌────────────────────────┐
   │ seed/ or real sources  │
   └────────────┬───────────┘
                ▼
   ┌────────────────────────┐
   │ connectors (Go)        │
   └────────────┬───────────┘
                ▼
   ┌────────────────────────┐     ┌──────────────────────┐
   │ workflow orchestrator: │ ──▶ │ PostgreSQL:          │
   │ extract, judge,        │     │ observations,        │
   │ build, score           │     │ entities, edges,     │
   └────────────┬───────────┘     │ scorecards,          │
                │ LLM calls       │ artifacts            │
                ▼                 └──────────┬───────────┘
   ┌────────────────────────┐                │
   │ resolver (pluggable    │                │
   │ model provider)        │                │
   └────────────────────────┘                ▼
   ┌──────────────────┐      ┌──────────────────────────┐
   │ web (Next.js)    │ ◀──▶ │ API (Go): REST, MCP,     │
   └──────────────────┘      │ artifacts; starts runs   │
                             └─────┬──────────────┬─────┘
                                   ▲              ▲
                     coding agents (MCP)   other systems (REST)

   ontology/ (LinkML) ──▶ generated types, store vocabulary, JSON Schema, OWL
```

Six moving parts, and one file that sits above all of them. I will go through them in the order you would build them, which is not the order data flows through them. The ontology comes first, because everything else is generated from it or validated against it.

## The repository

```text
it-intelligence/
  ontology/       context_model.yaml, entities.yaml, relations.yaml: the Context Model in LinkML
    generated/    JSON Schema, OWL, SHACL, the store vocabulary (do not edit)
  cmd/itx/        the one binary: serve, worker, ingest, verify, runs, snapshot
  connectors/     one package per source kind: earepo/ itsm/ githost/ cluster/ waf/ gateway/
  mapping/        observations to candidate entities and edges, one mapper per connector
  resolver/       identity resolution: keys, rules, inference, pluggable model providers
  workflows/      the workflows, and runner/, the minimal orchestrator that runs them
  store/          PostgreSQL migrations and the generated vocabulary
  api/            REST, MCP and the queries both share
  artifacts/      Mermaid diagrams and insights
  web/            Next.js frontend
  config/         sources, resolver thresholds and rules, people, the verify baseline
  seed/           the Kestrel Group as source-shaped exports, plus an answer key
  deploy/         docker compose for a laptop, a Helm chart for a cluster
  docs/           architecture, decision records, adding a source
  .mcp.json       lets a coding agent in this repo use the MCP server
  Makefile
```

A monorepo is the right call here for a boring reason: the ontology changes, and when it does, the store, the mappers, the API, the MCP tools and the frontend types all have to change with it. In one repository that is one pull request, one review and one CI run. Spread over five repositories it is a coordination problem, which is exactly the kind of problem the platform is meant to remove.

The stack is open source throughout and chosen for being unsurprising:

| Concern | Choice in the reference | Why | Reasonable alternatives |
|---|---|---|---|
| Ontology | [LinkML](https://linkml.io/) | one YAML schema, many generated artifacts, a bridge to RDF and OWL | OWL with SHACL directly, JSON Schema alone |
| Persistence | PostgreSQL | everyone can run it, recursive queries cover most graph needs | Apache AGE on PostgreSQL, a dedicated graph database |
| Orchestration | a durable workflow orchestrator, its own component apart from the API; the reference ships a minimal one over PostgreSQL | retries, resume, schedules and long waits for people belong to the platform, not to each request | [Temporal](https://temporal.io/), [Restate](https://restate.dev/), [Aqueduct](https://github.com/raskell-io/aqueduct), or a similar engine |
| Backend | Go | one static binary, `itx`, run as the API (`itx serve`) and as the workflow worker (`itx worker`) | any language with an MCP SDK |
| Agent interface | [Model Context Protocol](https://modelcontextprotocol.io/) | what coding agents already speak | REST with an OpenAPI description |
| Frontend | Next.js | fast to build entity pages, graph views and review queues | any web framework |
| Diagrams | [Mermaid](https://mermaid.js.org/) as text | diffable, renders in Git hosts, wikis and chat | Structurizr DSL, PlantUML |

Any of these can be swapped without changing the design. What cannot be swapped is the order of the layers and the rules each one follows.

### Why Go

One choice deserves more than a table row, because I would make it again for almost any platform a large company has to run for ten years: the backend is written in Go.

Corporate code is read far more often than it is written, by people who did not write it, often years later and under some pressure. Go is built for exactly that reader. There is usually one idiomatic way to do a thing, and `gofmt` settles the layout, so code from one team and code from a contractor on another continent look the same. Everything is explicit and typed: errors are values you handle where they happen, dependencies are passed in rather than injected by a framework, and there is no inheritance hierarchy to climb before you find the line that does the work. The language simply does not offer most of the machinery that enterprise Java made famous, so the factories of factories never get written. A new colleague, or a coding agent, can open `resolver/` and follow it without a guide.

Dependencies are named by where they live. An import path is a module path, and for most modules that is the address of a Git repository; the module file pins versions and a checksum file guards them:

```go
// go.mod (trimmed)
module github.com/raskell-io/it-intelligence

require (
	github.com/jackc/pgx/v5 v5.12.0
	github.com/modelcontextprotocol/go-sdk v1.8.0
)
```

Inside the module, packages import each other by path and compile from source. That is what makes the monorepo cheap: the mappers, the resolver, the REST API and the MCP server share the generated `vocab` package without anyone publishing an internal library, versioning it and waiting for it to reach an artifact repository. Change the ontology, regenerate, and `go build ./...` tells you within seconds everything that broke.

It is fast twice. A clean build of the whole repository, dependencies included, takes about twenty seconds on my laptop and a rebuild after a change under two, so the feedback loop stays short, and the result is one static binary that starts instantly and serves requests with little memory, which is what you want from both the API and the worker. The tooling comes in the box: `go test`, `go vet`, the race detector, `pprof` for profiling and `gopls` for every editor, with nothing to choose or configure. And the [Go 1 compatibility promise](https://go.dev/doc/go1compat) means code written today still builds in a decade, which is the timescale corporate software actually lives on.

Go has its costs. `if err != nil` gets repetitive, the type system has no sum types, so some of the ontology's precision ends up in validation rather than in types, and generics arrived late and are deliberately modest. For the frontend I use TypeScript, where the ecosystem is. But for the part of a platform that has to be correct, boring and readable by the next person, I do not know a better fit.

## Layer one: the ontology

The Context Model is the ontology, and it lives in `ontology/`: `context_model.yaml` and the two files it imports, `entities.yaml` and `relations.yaml`. I use LinkML because it lets the model be written once, in readable YAML, and generated into the forms each part of the system needs: [JSON Schema](https://json-schema.org/) for validation, the store's vocabulary (tables of entity and relation kinds, and a trigger that rejects any edge outside its domain and range), [OWL](https://www.w3.org/TR/owl2-overview/) and [SHACL](https://www.w3.org/TR/shacl/) for anyone who wants to reason over it with semantic web tooling, Python and TypeScript models, and human-readable documentation. The Go types are generated from the JSON Schema.

A trimmed version of the Kestrel model:

```yaml
# ontology/entities.yaml (trimmed)
classes:
  Entity:
    abstract: true
    slots: [id, name, standing, last_seen]
  Application:
    is_a: Entity
    description: A thing the business recognises as one system, however many parts it has.
  Repository:
    is_a: Entity
  Workload:
    is_a: Entity
  Namespace:
    is_a: Entity
  Team:
    is_a: Entity
  Capability:
    is_a: Entity
    description: A business capability from the enterprise architecture capability map.
  Endpoint:
    is_a: Entity
  Decision:
    is_a: Entity
    description: An architecture decision record, with the entities it constrains.
  MarketUnit:
    is_a: Entity

enums:
  Standing:
    permissible_values:
      secondary: {description: mirrored from an authoritative system}
      primary: {description: the Context Model is authoritative}
```

Relationships are a closed vocabulary of slots. LinkML allows one domain per slot, so where a relationship may start from several kinds of entity, annotations carry the full domain and range for the generator that writes the store's vocabulary:

```yaml
# ontology/relations.yaml (trimmed)
slots:
  deployed_as:
    description: The application runs as this workload.
    domain: Application
    range: Workload
    multivalued: true
    annotations: {ctx_domain: Application, ctx_range: Workload, ctx_cardinality: many}
  runs_in:
    description: The workload runs in this namespace.
    domain: Workload
    range: Namespace
    annotations: {ctx_domain: Workload, ctx_range: Namespace, ctx_cardinality: one}
  owned_by:
    description: The accountable team.
    range: Team
    annotations: {ctx_domain: "Application Repository Workload Namespace Endpoint", ctx_range: Team, ctx_cardinality: one}
```

Four modelling rules came out of building this, and they matter more than the syntax.

**Keep the core small.** Kestrel has nine entity kinds and exactly fifteen relationship kinds. Every new kind has to justify itself by a question it lets someone answer. The failure mode, as I wrote in the first post, is ontology sprawl, and the defence is a schema one person can explain on a whiteboard.

**Separate entities from observations.** An observation is what a source said at a point in time: a row in an export, a JSON object from an API. An entity is what the Context Model concluded from all observations together. Mixing the two is how a catalogue becomes a copy of its sources, with all their contradictions.

**Make relationships first-class.** In the ontology a relationship is a slot. In the store every relationship becomes a row of its own, with a basis, a confidence, a source and a "last seen". That is the only way to answer "why does the model think this?", which is the question that decides whether anyone trusts it.

**Take the capability map from enterprise architecture, not from the platform team.** `Capability` is populated from the group's own capability model. That single decision is what lets a question like "which systems support claims handling in every market unit" be a query, and it is how strategy enters the model.

`make ontology` regenerates everything in `ontology/generated/`, and CI fails if the generated files are out of date. The ontology is code, reviewed like code.

## Layer two: the store

PostgreSQL holds five things: observations, entities, edges, scorecards and artifacts. Around them sit a few supporting tables: aliases (the names each source uses for an entity), a registry of data sets, an append-only log of every confirmation and declaration, the recorded model judgements, snapshots, and the state of workflow runs. The core is short enough to show:

```sql
-- store/schema.sql (trimmed)
create table observation (
  id           bigserial primary key,
  source       text not null,          -- 'earepo', 'cluster', ...
  dataset      text not null,          -- 'applications', 'workloads', ...
  external_id  text not null,          -- the id inside the source
  payload      jsonb not null,
  observed_at  timestamptz not null
);

create table entity (
  id          text primary key,        -- 'ctx:Application/policy-admin'
  kind        text not null,
  name        text not null,
  standing    text not null default 'secondary',
  attributes  jsonb not null default '{}',
  last_seen   timestamptz not null
);

create table edge (
  id            text primary key,       -- a stable hash of kind, endpoints and source
  kind          text not null references relation_kind(kind),
  from_id       text not null references entity(id),
  to_id         text not null references entity(id),
  basis         text not null,          -- 'asserted' | 'derived' | 'inferred'
  confidence    double precision not null,
  status        text not null,          -- 'active' | 'pending' | 'rejected'
  source        text not null,
  evidence      jsonb not null default '{}',
  confirmed_by  text,
  confirmed_at  timestamptz,
  last_seen     timestamptz,
  unique (kind, from_id, to_id, source)
);
```

Observations are append-only. Nothing is ever overwritten, so the model can always be rebuilt from what the sources said, and every edge can point back to the observations that produced it through its `evidence`.

The `basis` column carries the distinction from the first post. An **asserted** edge came straight from a source's own key: the cluster says this workload runs in that namespace. A **derived** edge follows from other edges by a rule: the workload runs in a namespace owned by a team, so the team owns the workload unless something says otherwise. An **inferred** edge was proposed by the resolver, usually with a model's help, and carries a confidence and the reasoning behind it. When a team confirms an inferred edge, `confirmed_by` and `confirmed_at` are set and the edge becomes asserted, with a person's name on it. A trigger on the table checks every edge against the vocabulary generated from the ontology, so the store cannot hold a relationship the model does not allow.

None of this needs a provenance standard to work, but it lines up with one. In the terms of the W3C's [PROV-O](https://www.w3.org/TR/prov-o/), an edge is an entity that was derived from the observations in its `evidence` and attributed to its `source` or, once confirmed, to a person. The reference does not export PROV, and it does not yet record which ingest run produced an edge, the activity in PROV's terms; if another tool needs the lineage, those are the two places to start.

Why PostgreSQL and not a graph database? Because most of what architects and agents ask is one or two hops from an entity, and the rest is a bounded traversal that a recursive query handles well. The classic "what breaks if I change this" question:

```sql
-- everything that depends on payment-gateway, up to four hops away
with recursive impact(id, depth) as (
  select 'ctx:Application/payment-gateway'::text, 0
  union
  select e.from_id, i.depth + 1
  from edge e
  join impact i on e.to_id = i.id
  where e.kind = 'depends_on' and i.depth < 4
)
select id, min(depth) as distance
from impact
where depth > 0
group by id
order by distance, id;
```

If the graph grows past what this handles comfortably, [Apache AGE](https://age.apache.org/) adds openCypher queries to the same PostgreSQL instance, and a dedicated graph database is a later, separate decision. Starting with the database every team already knows how to operate is worth more than the elegance of a graph query language on day one.

## Layer three: connectors and mapping

A connector does one thing: it reads a source and emits observations. It knows nothing about the ontology.

```go
// connectors/connector.go
type Observation struct {
	Source     string
	Dataset    string
	ExternalID string
	Payload    json.RawMessage
	ObservedAt time.Time
}

type Connector interface {
	Name() string
	Datasets() []string
	Extract(ctx context.Context, dataset string, since time.Time) iter.Seq2[Observation, error]
}
```

Mapping is a separate step, one mapper per connector, and it turns observations into **assertions**: candidate entities and candidate edges, each tagged with the observation it came from. The kind and relation constants come from a `vocab` package generated from the ontology, so a mapper cannot invent a relationship.

```go
// mapping/mappers.go, the cluster mapper (trimmed)
func (clusterMapper) Map(ctx Context, o connectors.Observation) (Assertions, error) {
	a := start(o)
	var k k8sObject
	if err := decode(o, &k); err != nil {
		return a, err
	}
	if o.Dataset == "workloads" {
		wl := a.Entity(vocab.Workload, k.Metadata.Namespace+"/"+k.Metadata.Name, k.Metadata.Name, nil)
		a.Edge(vocab.RunsIn, wl, Key(vocab.Namespace, k.Metadata.Namespace), Asserted)
		// The cheapest win in the whole system: a label carrying the EA application id
		// turns an inference into an assertion.
		if app := k.Metadata.Labels[ctx.Config.ApplicationLabel]; app != "" {
			a.Edge(vocab.DeployedAs, Alias(vocab.Application, "earepo:applications", app), wl, Asserted)
		}
	}
	return a, nil
}
```

The split keeps connectors reusable, because the same git host connector works for any company, and keeps the company-specific knowledge in the mappers, where it can be reviewed. It also means a connector can be written by the team that owns the source, which is how contribution starts. In the reference, adding a source is three files: a connector, a mapper and a seed export to test against.

The label check matters beyond this one mapper: every team that adds the EA application ID to its deployments turns one of the model's inferences into an assertion, and the scorecard shows the improvement the next morning.

## Layer four: identity resolution

Mapping produces many candidates for the same thing. The EA repository says "Policy Administration", the git host has `pol-adm-svc` and `pol-adm-ui`, the cluster runs `policy-admin` in namespace `claims-prod`, and the IT service management tool has a business service called "PAS". Resolution decides which of these are one entity.

It runs in three passes, from cheap and certain to expensive and uncertain:

1. **Keys.** Shared identifiers across sources, such as the application ID in a deployment label or a CMDB reference in a repository's metadata file, produce asserted links.
2. **Rules.** Deterministic heuristics with known precision: identical normalised names, a repository whose owning team owns exactly one application, a namespace naming convention. These produce derived links.
3. **Inference.** Whatever is left goes to a model. Each candidate gets a shortlist of at most five applications, those of its owning team first and then the most similar names, and the model sees the candidate's name, README excerpt or description, owner and namespace, and returns a structured judgement.

```json
{
  "candidate": "githost:repo/kestrel/pol-adm-ui",
  "match": "ctx:Application/policy-admin",
  "confidence": 0.82,
  "reasons": [
    "README describes the policy administration frontend",
    "same owning team as pol-adm-svc, already linked by key",
    "deploys to claims-prod next to policy-admin"
  ]
}
```

"PAS", the business service in the IT service management tool, resolves the same way: the model links it to Policy Administration at 0.93, because PAS is the usual abbreviation, the support group owns the application, and its incident texts mention `pol-adm-svc`.

The thresholds are explicit and live in configuration. Above 0.9 the link is stored as inferred and shown normally. Between 0.6 and 0.9 it is stored as inferred and queued for the owning team to confirm. Below 0.6 it is dropped and logged. No inferred link is ever silently promoted to asserted; that takes a person. The model provider is pluggable. By default the reference replays recorded judgements, so it runs offline, without an API key, and gives the same answers every time; one line in `config/resolver.yaml` switches it to a local model or a hosted one, which works well because the inputs are metadata and the prompts are small.

The problem is an old one. Statisticians call it record linkage, and Ivan Fellegi and Alan Sunter gave it a formal theory in 1969: two thresholds split candidate pairs into links, non-links and possible links that go to a person for review. The three bands above are the same idea, with a model's judgement where their theory has match weights. If your sources hold millions of records rather than a few hundred applications, look at [Splink](https://moj-analytical-services.github.io/splink/), an open source implementation of that probabilistic approach from the UK Ministry of Justice.

## Layer five: workflows

Ingestion talks to flaky sources and calls models that time out, so it needs retries per step, resumption after a crash, schedules, and a place to see what happened. And not everything here is quick: a link waits for a team to confirm it, a primary declaration waits for a second person to approve it, and either can sit for days while someone is on holiday and a reminder goes out by email. That work does not belong in the API. So workflow orchestration is a component of its own: the API is the control plane, which starts runs and reports on them but never runs them, and an orchestrator does the running.

In production that orchestrator is a durable workflow engine, Temporal, Restate or something similar; the design does not depend on which.

One candidate is my own: [Aqueduct](https://github.com/raskell-io/aqueduct), a durable execution engine in Rust built for procedures that agents write and people approve. It journals every step before it counts, waits for a person with a timeout (a signal or an id anyone can complete, raised to someone else if nobody answers), and runs steps on workers in any language over gRPC or HTTP, so the steps here could stay in Go. It is young, and its own README asks you not to depend on it yet, so I name it as an option rather than the default.

The reference ships a minimal orchestrator over PostgreSQL behind the same contract, as a separate process, `itx worker`, so it runs on a laptop with nothing else to install. A workflow is a fixed list of idempotent steps:

```go
// workflows/workflows.go (trimmed)
modelSteps := []runner.Step{
	{Name: "Judge", Run: d.judge, Timeout: 30 * time.Minute},
	{Name: "Build", Run: d.build, Timeout: 10 * time.Minute},
	{Name: "Score", Run: d.score, Timeout: 10 * time.Minute},
}
return []runner.Workflow{
	{Name: "IngestSource", Steps: append([]runner.Step{extract}, modelSteps...)},
	{Name: "IngestAll", Steps: all},
	{Name: "ConfirmLink", Steps: []runner.Step{applyLink, build, score}},
	{Name: "DeclarePrimary", Steps: []runner.Step{applyPrimary, build}},
	{Name: "BuildArtifacts", Steps: artifactSteps},
}
```

Runs and step attempts live in two tables. A worker claims a run with `select ... for update skip locked` and keeps a heartbeat, so several workers can run side by side and a run abandoned by a crashed process is picked up by another. A run resumes at the first step that did not succeed, retries back off with jitter, and steps pass nothing but the run id: whatever a step produces goes to PostgreSQL. Because the API and the worker are separate processes, they scale separately, and a slow ingest never holds up a query from an agent.

| Workflow | Trigger | Steps |
|---|---|---|
| `IngestSource` | a source's interval, or on demand | Extract, Judge, Build, Score |
| `IngestAll` | `make ingest` | Extract for every source, then Judge, Build, Score and the artifact steps |
| `ConfirmLink` | a team confirms or rejects in the UI | Apply, Build, Score |
| `DeclarePrimary` | a data set owner's request, approved by a second person | Apply, Build |
| `BuildArtifacts` | nightly, and at the end of `IngestAll` | Snapshot, Diagrams, Insights |

Every run shows up on `/runs` with its steps, attempts, errors and durations, which matters more than it sounds: when a source's scorecard drops, the first question is what happened during the last ingest, and the answer is one click away. What the minimal orchestrator cannot do is wait days for a person inside a workflow, send the reminders, or fan out to thousands of parallel tasks. In the reference, `ConfirmLink` and `DeclarePrimary` therefore start only after the person has answered. A durable engine moves that wait into the workflow itself, which is the first thing it adds, and swapping it in is mechanical: the steps already have the shape of activities, and the API only ever starts runs and reads their state.

## Layer six: scoring

The `Score` activity computes a scorecard per source and data set on every ingest:

| Signal | Computed as |
|---|---|
| freshness | share of records changed or confirmed within the source's expected cycle |
| completeness | share of records with every field the mapper needs |
| agreement | share of facts that at least one other source confirms, so facts only one source holds pull it down |
| resolvability | share of records whose identity and references all resolve to Context Model entities |

The overall score is a weighted mean, the weights are configuration, and every number links to the records behind it. On the seed after one ingest, the EA repository's applications score 0.58 and its capabilities 0.45, the cluster's namespaces 0.75, and the IT service management tool's business services 0.99. Two things follow from the scores. Every asserted fact starts at a confidence of 0.7 plus 0.3 times its source's last overall score, so a fact from a well-kept source outranks the same claim from a neglected one, and derived facts inherit the weakest confidence in their chain. And the scorecards are public, on a page every team can see, which turns data quality from an audit finding into something closer to a league table.

## Layer seven: the API and the MCP server

The API process, `itx serve`, serves three surfaces from the same queries: a REST API for systems and the frontend, an MCP server for agents, and a static endpoint for generated artifacts. Keeping them in one process is deliberate. An agent and a person looking at the same entity must see the same facts, and the easiest way to guarantee that is to not have two implementations.

The MCP server is where most of the design effort went, because tools for agents are an interface with different rules than an API for programs. The Kestrel server exposes a handful:

| Tool | Input | Returns |
|---|---|---|
| `search_entities` | text, optional kind | matching entities with ids, kinds and one-line summaries |
| `get_entity` | id | the entity, its attributes, its standing and its direct edges |
| `find_owner` | id or free-text name | the owning team, how the ownership was established, and confidence |
| `impact_of_change` | id, depth | dependants up to the given depth, grouped by distance |
| `explain_fact` | edge id | the evidence behind one edge: sources, observations, basis, who confirmed it |
| `list_decisions` | id | architecture decisions that constrain the entity |
| `render_diagram` | id, view | a Mermaid diagram of the entity's neighbourhood |

Three rules shaped them. **Tools are entity-centric**, because agents reason better from "give me this thing and its neighbourhood" than from generic query languages. **Every answer carries its provenance**, so an agent can cite where a fact came from and a human can check it. **Answers are small**, with ids the agent can follow up on, rather than whole subgraphs, because the point of the platform is to save the agent tokens, not to flood its context window. I made the economic case in [The Economics of Inference](https://raskell.io/articles/the-economics-of-inference/) and the design case for tools in [Tools: How Agents Actually Do Things](https://raskell.io/articles/tools-how-agents-actually-do-things/).

Asked *"who owns claims-prod and what depends on it?"*, an agent in the repository calls `find_owner` and gets this after the first ingest:

```text
find_owner {"id": "claims-prod"}
  owner: ctx:Team/claims-platform, derived, 0.92
  path:  ctx:Namespace/claims-prod <- runs_in - ctx:Workload/claims-prod/claims-settlement (asserted, cluster)
         ctx:Workload/claims-prod/claims-settlement <- deployed_as - ctx:Application/claims-settlement (asserted, cluster)
         ctx:Application/claims-settlement - owned_by -> ctx:Team/claims-platform (asserted, itsm)
```

The namespace carries no owner label, so the ownership is derived, and the answer says so. Three claims applications run in `claims-prod` and all point to the same team; the strongest chain wins, and the agent can cite every fact it rests on. The team's next step is plain from the answer: an owner label on the namespace turns the derivation into an assertion.

To let a coding agent use it, the repository carries a project-scoped MCP configuration. In Claude Code that is a `.mcp.json` at the repository root:

```json
{
  "mcpServers": {
    "it-intelligence": {
      "type": "http",
      "url": "http://localhost:8080/mcp"
    }
  }
}
```

In a company, the same entry points at the shared instance and goes into the template every new repository starts from. From then on, every coding agent on every notebook can ask who owns a service before it writes code against it.

## Layer eight: the frontend

The Next.js frontend is the least interesting layer technically and the one that decides whether people come back. It has five views:

- **Entity pages**, one per entity, with attributes, edges grouped by kind, provenance on hover, and a "last seen" that turns amber when a fact goes stale.
- **A graph view** of any entity's neighbourhood, filtered by relationship kind and depth.
- **A review queue** per team, with the inferred links waiting for confirmation and the model's reasons next to each.
- **Source scorecards**, the league table from layer six.
- **Artifacts**, everything `BuildArtifacts` produced, each stamped with the snapshot it was built from.

The TypeScript types come from the ontology, so when the model changes the frontend fails to compile until it catches up, which is the right kind of friction.

## Layer nine: artifacts

Artifacts are where a context model starts earning its keep beyond lookups. The `BuildArtifacts` workflow takes a snapshot of the model and runs generators over it. Each artifact records the snapshot it came from, so it can be reproduced and so a reader knows how current it is.

**Diagrams as text.** A generator walks an entity's neighbourhood and writes Mermaid. For Kestrel's policy administration application, the output is:

```text
flowchart LR
  app_policy_admin["Policy Administration<br/>owner: claims-platform"]
  repo_svc["repo: pol-adm-svc"]
  repo_ui["repo: pol-adm-ui"]
  wl["workload: policy-admin<br/>ns: claims-prod"]
  ep["endpoint: api.kestrel.example/policies<br/>WAF: enforced"]
  cap["capability: Policy Management"]
  pay["Payment Gateway"]

  app_policy_admin -->|realised_by| repo_svc
  app_policy_admin -.->|realised_by, inferred 0.82| repo_ui
  app_policy_admin -->|deployed_as| wl
  app_policy_admin -->|exposed_via| ep
  app_policy_admin -->|supports| cap
  app_policy_admin -->|depends_on| pay
```

Inferred edges are dashed and labelled with their confidence, so the diagram is honest about what it knows. Because it is text, it renders in the Git host, the wiki and the chat tool, and it can be diffed between snapshots to show what changed in a landscape over a quarter.

**Insights.** Each insight is a query with a name, a description and a threshold, run on every snapshot. Kestrel ships with a few that tend to find something in any real company:

```sql
-- applications in production with no accountable owner
select a.id, a.name
from entity a
where a.kind = 'Application'
  and a.attributes->>'lifecycle' = 'production'
  and not exists (
    select 1 from edge e
    where e.from_id = a.id and e.kind = 'owned_by'
      and e.confidence >= 0.8
  );
```

Others find capabilities supported by more than one platform per market unit (consolidation candidates), endpoints exposed to the internet without a WAF policy, applications whose EA lifecycle says "retired" while workloads still run, and repositories with a truck factor of one, computed from commit history. Each finding links to the entities involved, so it is a starting point for a conversation rather than a report that gets filed.

**Drafts** are the next step and not built yet: generators for a solution design's current-state section, a pre-filled architecture decision record or a short business case, each required to cite an entity or an edge for every claim. That citation rule is the defence against what I called artifact over-trust in the first post.

## Running it

You need Docker, and no API key.

```sh
git clone https://github.com/raskell-io/it-intelligence
cd it-intelligence
make up       # PostgreSQL, the API, the workflow worker and the web UI
make seed     # register the Kestrel Group sources
make ingest   # extract, judge, build, score, and build the artifacts
make verify   # check the resolver against the answer key, and this post against the system
open http://localhost:3000
```

After the first ingest, three places are worth a look. The scorecards page shows the EA repository export scoring worst on freshness: most of its records were last touched more than half a year ago, among them the application that was switched off a year ago. The review queue for the claims platform team holds the inferred link from `pol-adm-ui` to Policy Administration, at 0.82, with the model's three reasons. And asking a coding agent in the repository "who owns claims-prod and what depends on it?" produces an answer that cites its path through the graph, in two tool calls instead of twenty.

The part I am proudest of is `make verify`. The seed ships with an answer key: what the Kestrel Group really looks like, written down by hand. The verify step compares the resolved model with it and checks every concrete claim in this post against the running system, and CI runs it on every change. On the seed, edges come out with a precision of 0.996 and a recall of 0.994, and identities at 1.0. Every rule's precision is measured too, and one of them, `team_owns_single_app`, gets 0 of its 1 case right: it links an experiments repository to an application it has nothing to do with. That is exactly the kind of thing a reference should show rather than hide.

## What the reference leaves out

A reference implementation earns trust by being honest about its gaps, and these are the big ones.

- **Identity and access.** The reference has no authentication. Writes carry a name from an "act as" picker, sent as an `X-Actor` header, because confirmations and primary declarations need one. A real deployment needs real identity for writes, even if reads stay open to everyone, as I argued they should.
- **Real connectors at scale.** The connectors read the seed files; only the git host has a small live mode, for one GitHub organisation. Production connectors deal with pagination, rate limits, partial failures, credentials and sources that change their schema without warning. That work is unglamorous and endless.
- **History.** The reference keeps observation history but rebuilds entities and edges in place. Point-in-time questions ("what did the landscape look like before the migration?") need edge history with validity intervals, which is a straightforward extension and a real cost in storage and query complexity. Snapshots, and `itx snapshot diff` between them, are the cheap substitute in the meantime.
- **Scale.** Kestrel has forty applications, and the reference rebuilds the whole model on every ingest. That is fine for thousands of entities, not for millions. PostgreSQL copes with a large group's landscape, but the build has to become incremental and the recursive queries need indexes, limits and some care.
- **Drafts.** The generators for decision records and business cases, with their citation check, are not built yet.
- **Governance of the ontology itself.** Who may add an entity kind, and how the change is reviewed, is an organisational question the repository can support with code review but not answer.

None of these changes the shape. They are the difference between a reference you can understand in an afternoon and a platform you can run for a group.

## What to take from it

If you build one of these, the order matters more than the tools: an ontology first, with everything generated from it; observations kept apart from entities; every relationship a row with a basis, a confidence and a source; sources scored in public; the MCP server in the same process as the API, and orchestration outside it; artifacts as text, from snapshots, with their sources. The database, the workflow engine, the frontend framework and the model provider are choices you can revisit later.

The repository is there to be taken apart. If you run it against your own exports and the model gets something wrong, that is the most useful thing that can happen, and I would like to hear about it: [CONTRIBUTING.md](https://github.com/raskell-io/it-intelligence/blob/main/CONTRIBUTING.md) explains how to add a source, and issues are open.


## References

- Raffael Schneider, [IT Intelligence: The Missing Data Layer of Enterprise IT](https://raskell.io/articles/it-intelligence/), the companion post with the argument for the platform.
- [raskell-io/it-intelligence](https://github.com/raskell-io/it-intelligence), the reference implementation, with its decision records in `docs/adr/`.
- [LinkML](https://linkml.io/), the Linked Data Modeling Language, and its [generators](https://linkml.io/linkml/generators/).
- [Temporal](https://temporal.io/), [Restate](https://restate.dev/) and [Aqueduct](https://github.com/raskell-io/aqueduct), durable execution engines, any of which can take the orchestrator's place.
- [PostgreSQL documentation on recursive queries](https://www.postgresql.org/docs/current/queries-with.html) (`WITH RECURSIVE`).
- [Apache AGE](https://age.apache.org/), graph queries with openCypher on PostgreSQL.
- [Model Context Protocol](https://modelcontextprotocol.io/), and the [official Go SDK](https://github.com/modelcontextprotocol/go-sdk).
- [Mermaid](https://mermaid.js.org/), diagrams as text.
- [Backstage software catalog](https://backstage.io/docs/features/software-catalog), the developer-portal ancestor of the entity model.
- Simon Brown, [The C4 model](https://c4model.com/), for architecture views that a generator can target.
- [The Go 1 compatibility promise](https://go.dev/doc/go1compat), the reason Go code written years ago still builds.
- Ivan P. Fellegi and Alan B. Sunter, "A Theory for Record Linkage", *Journal of the American Statistical Association* 64, no. 328 (1969): 1183 to 1210, [doi:10.1080/01621459.1969.10501049](https://doi.org/10.1080/01621459.1969.10501049), the foundation of identity resolution with thresholds and clerical review.
- [Splink](https://moj-analytical-services.github.io/splink/), open source probabilistic record linkage from the UK Ministry of Justice.
- W3C, [PROV-O: The PROV Ontology](https://www.w3.org/TR/prov-o/), the standard vocabulary for where a fact came from.
- W3C, [OWL 2 Web Ontology Language](https://www.w3.org/TR/owl2-overview/) and [SHACL](https://www.w3.org/TR/shacl/), the semantic web forms the ontology is generated into, and [JSON Schema](https://json-schema.org/), the form used for validation.
- Michael Nygard, [Documenting Architecture Decisions](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions).
