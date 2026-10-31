+++
title = "Building IT Intelligence: A Reference Implementation in One Repository"
date = 2026-11-16
draft = true
description = "How to build an Enterprise Context Platform from open source parts: ontology, connectors, workflows, store, API, MCP and UI, in one repository you can run."

[taxonomies]
tags = ["enterprise-architecture", "context-engineering", "agents", "provenance", "oss", "platform-automation", "knowledge-management"]

[extra]
author = "Raffael"
+++

<!-- TODO(Raffael): the repository linked throughout (github.com/raskell-io/it-intelligence) has to exist before this is published. Name, layout and snippets below are the proposal; align them with the real repo once it is built. -->

In [IT Intelligence](/articles/it-intelligence/) I argued that large companies never built for their own IT what they built for their sales figures: one model that knows what exists, who owns it, how it connects and whether it matches the strategy, readable by every person and every agent who works on it. The obvious next question is a fair one: what does that look like when you build it?

This post is the answer, as concretely as I can make it without showing anyone's real landscape. It walks through a reference implementation in a single open source repository, [raskell-io/it-intelligence](https://github.com/raskell-io/it-intelligence), with a fictional company inside it. You can clone it, run it on a laptop, point a coding agent at it, and see every layer the first post described: connectors, a workflow orchestrator, a persistence store, the Context Model itself, an API backend with an MCP server, a frontend, and the analytics that turn the model into artifacts.

The reference is not the platform I run at work. It is smaller, simpler and deliberately boring. The shape is the same, and the shape is what I want to show.

## The fictional company

Every example below uses the **Kestrel Group**, a made-up financial group with three market units, about forty applications, a dozen teams, two container clusters, a WAF, an API gateway and the usual collection of systems of record. The repository ships Kestrel as seed files that imitate the exports you would get from real tools: an application list from an EA repository, configuration items and incidents from an IT service management tool, repositories and teams from a git host, namespaces and workloads from a cluster, policies from a WAF, routes from a gateway.

The seed data is deliberately messy. Names differ between systems, two applications claim the same repository, one namespace has no owner label, a market unit runs its own integration platform that nobody in group IT knows about, and the EA repository lists an application that was switched off a year ago. A clean demo would prove nothing. The interesting part of IT intelligence is what happens when the sources disagree.

## The shape of the system

{% diagram(title="it-intelligence, the reference implementation") %}

   seed/ or real sources
          |
          v
   +-------------+     +---------------------+     +------------------+
   | connectors  | --> |  Temporal workflows | --> |   PostgreSQL     |
   | (Go)        |     |  ingest, resolve,   |     |   observations   |
   +-------------+     |  score, build       |     |   entities       |
                       +----------+----------+     |   edges          |
                                  |                |   scorecards     |
                                  | LLM calls      |   artifacts      |
                                  v                +--------+---------+
                       +---------------------+              |
                       | resolver (pluggable |              |
                       | model provider)     |              |
                       +---------------------+              |
                                                            v
   +------------------+      +---------------------------------------+
   | web (Next.js)    | <--> |  api (Go): REST  +  MCP  +  artifacts |
   +------------------+      +---------------------------------------+
                                     ^                  ^
                                     |                  |
                          coding agents (MCP)    other systems (REST)

   ontology/  (LinkML)  -->  generated types, SQL, JSON Schema, OWL, docs

{% end %}

Six moving parts, and one file that sits above all of them. I will go through them in the order you would build them, which is not the order data flows through them. The ontology comes first, because everything else is generated from it or validated against it.

## The repository

```text
it-intelligence/
  ontology/                 the Context Model, in LinkML
    context_model.yaml
    generated/              JSON Schema, SQL, OWL, SHACL, docs (do not edit)
  connectors/               one package per source kind
    earepo/  itsm/  githost/  cluster/  waf/  gateway/
  mapping/                  observation -> entities and edges, per connector
  resolver/                 identity resolution, deterministic and AI-assisted
  workflows/                Temporal workflows and activities
  store/                    PostgreSQL schema, migrations, queries
  api/                      REST and MCP server, one Go binary
  artifacts/                diagram, insight and ADR generators
  web/                      Next.js frontend
  seed/                     the Kestrel Group, as source-shaped exports
  deploy/                   docker compose for a laptop, Helm chart for a cluster
  .mcp.json                 lets a coding agent in this repo use the MCP server
  Makefile
```

A monorepo is the right call here for a boring reason: the ontology changes, and when it does, the store, the mappers, the API, the MCP tools and the frontend types all have to change with it. In one repository that is one pull request, one review and one CI run. Spread over five repositories it is a coordination problem, which is exactly the kind of problem the platform is meant to remove.

The stack is open source throughout and chosen for being unsurprising:

| Concern | Choice in the reference | Why | Reasonable alternatives |
|---|---|---|---|
| Ontology | [LinkML](https://linkml.io/) | one YAML schema, many generated artifacts, a bridge to RDF and OWL | OWL with SHACL directly, JSON Schema alone |
| Persistence | PostgreSQL | everyone can run it, recursive queries cover most graph needs | Apache AGE on PostgreSQL, a dedicated graph database |
| Orchestration | [Temporal](https://temporal.io/) | durable, retryable, observable workflows; schedules built in | Airflow, Dagster, Argo Workflows |
| Backend | Go | one static binary for REST and MCP, fast enough to not think about | any language with an MCP SDK |
| Agent interface | [Model Context Protocol](https://modelcontextprotocol.io/) | what coding agents already speak | REST with an OpenAPI description |
| Frontend | Next.js | fast to build entity pages, graph views and review queues | any web framework |
| Diagrams | [Mermaid](https://mermaid.js.org/) as text | diffable, renders in Git hosts, wikis and chat | Structurizr DSL, PlantUML |

None of these choices is the point. Swap any of them and the design holds. What does not swap well is the order of the layers and the rules each one follows.

## Layer one: the ontology

The Context Model is the ontology, and it lives in one file: `ontology/context_model.yaml`. I use LinkML because it lets the model be written once, in readable YAML, and generated into the forms each part of the system needs: JSON Schema for validation, SQL for the store, OWL and SHACL for anyone who wants to reason over it with semantic web tooling, Python and TypeScript models, and human-readable documentation. The Go types are generated from the JSON Schema.

A trimmed version of the Kestrel model:

```yaml
# ontology/context_model.yaml (trimmed)
id: https://example.org/it-intelligence/context-model
name: context_model
default_prefix: ctx
prefixes:
  linkml: https://w3id.org/linkml/
  ctx: https://example.org/it-intelligence/
imports: [linkml:types]

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

enums:
  Standing:
    permissible_values:
      secondary: {description: mirrored from an authoritative system}
      primary: {description: the Context Model is authoritative}
```

Relationships are declared separately, as a closed vocabulary with a domain and a range each:

```yaml
# ontology/relations.yaml (trimmed)
relations:
  realised_by:  {domain: Application, range: Repository}
  deployed_as:  {domain: Application, range: Workload}
  runs_in:      {domain: Workload,    range: Namespace}
  owned_by:     {domain: Entity,      range: Team, cardinality: one}
  supports:     {domain: Application, range: Capability}
  exposed_via:  {domain: Application, range: Endpoint}
  depends_on:   {domain: Application, range: Application}
  constrains:   {domain: Decision,    range: Entity}
```

Four modelling rules came out of building this, and they matter more than the syntax.

**Keep the core small.** Kestrel has nine entity kinds and about fifteen relationship kinds. Every new kind has to justify itself by a question it lets someone answer. The failure mode, as I wrote in the first post, is ontology sprawl, and the defence is a schema one person can explain on a whiteboard.

**Separate entities from observations.** An observation is what a source said at a point in time: a row in an export, a JSON object from an API. An entity is what the Context Model concluded from all observations together. Mixing the two is how a catalogue becomes a copy of its sources, with all their contradictions.

**Make relationships first-class.** In the ontology a relationship is a slot. In the store every relationship becomes a row of its own, with a basis, a confidence, a source and a "last seen". That is the only way to answer "why does the model think this?", which is the question that decides whether anyone trusts it.

**Take the capability map from enterprise architecture, not from the platform team.** `Capability` is populated from the group's own capability model. That single decision is what lets a question like "which systems support claims handling in every market unit" be a query, and it is how strategy enters the model.

`make ontology` regenerates everything in `ontology/generated/`, and CI fails if the generated files are out of date. The ontology is code, reviewed like code.

## Layer two: the store

PostgreSQL holds five things: observations, entities, edges, scorecards and artifacts. The schema is short enough to show almost in full:

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
  id            bigserial primary key,
  kind          text not null,         -- 'owned_by', 'realised_by', ...
  from_id       text not null references entity(id),
  to_id         text not null references entity(id),
  basis         text not null,         -- 'asserted' | 'derived' | 'inferred'
  confidence    real not null,
  source        text not null,
  evidence      jsonb not null default '{}',
  confirmed_by  text,
  confirmed_at  timestamptz,
  last_seen     timestamptz not null
);
```

Observations are append-only. Nothing is ever overwritten, so the model can always be rebuilt from what the sources said, and every edge can point back to the observations that produced it through its `evidence`.

The `basis` column carries the distinction from the first post. An **asserted** edge came straight from a source's own key: the cluster says this workload runs in that namespace. A **derived** edge follows from other edges by a rule: the workload runs in a namespace owned by a team, so the team owns the workload unless something says otherwise. An **inferred** edge was proposed by the resolver, usually with a model's help, and carries a confidence and the reasoning behind it. When a team confirms an inferred edge, `confirmed_by` and `confirmed_at` are set and the edge becomes asserted, with a person's name on it.

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

Mapping is a separate step, one mapper per connector, and it turns observations into **assertions**: candidate entities and candidate edges, each tagged with the observation it came from.

```go
// mapping/cluster.go (trimmed)
func (m ClusterMapper) Map(o connectors.Observation) (Assertions, error) {
	var w struct {
		Name      string            `json:"name"`
		Namespace string            `json:"namespace"`
		Labels    map[string]string `json:"labels"`
	}
	if err := json.Unmarshal(o.Payload, &w); err != nil {
		return Assertions{}, err
	}
	a := Assertions{}
	wl := a.Entity("Workload", w.Namespace+"/"+w.Name, o)
	ns := a.Entity("Namespace", w.Namespace, o)
	a.Edge("runs_in", wl, ns, Asserted, o)
	if app, ok := w.Labels["app.kestrel.example/application-id"]; ok {
		a.Edge("deployed_as", a.Ref("Application", app), wl, Asserted, o)
	}
	return a, nil
}
```

The split keeps connectors reusable, because the same git host connector works for any company, and keeps the company-specific knowledge in the mappers, where it can be reviewed. It also means a connector can be written by the team that owns the source, which is how contribution starts. In the reference, adding a source is three files: a connector, a mapper and a seed export to test against.

The label check in the snippet is the cheapest win in the whole system. A deployment label that carries the application ID from the EA repository turns an inference into an assertion. Every team that adds one makes the model more certain, and the scorecard shows it.

## Layer four: identity resolution

Mapping produces many candidates for the same thing. The EA repository says "Policy Administration", the git host has `pol-adm-svc` and `pol-adm-ui`, the cluster runs `policy-admin` in namespace `claims-prod`, and the IT service management tool has a business service called "PAS". Resolution decides which of these are one entity.

It runs in three passes, from cheap and certain to expensive and uncertain:

1. **Keys.** Shared identifiers across sources, such as the application ID in a deployment label or a CMDB reference in a repository's metadata file, produce asserted links.
2. **Rules.** Deterministic heuristics with known precision: identical normalised names, a repository whose owning team owns exactly one application, a namespace naming convention. These produce derived links.
3. **Inference.** Whatever is left goes to a model, which gets the candidate and a short list of plausible matches with their names, descriptions, READMEs, owners and labels, and returns a structured judgement.

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

The thresholds are explicit and live in configuration. Above 0.9 the link is stored as inferred and shown normally. Between 0.6 and 0.9 it is stored as inferred and queued for the owning team to confirm. Below 0.6 it is dropped and logged. No inferred link is ever silently promoted to asserted; that takes a person. The model provider is pluggable, and the reference works with a local model as well as with a hosted one, because the inputs are metadata and the prompts are small.

## Layer five: workflows

Every step so far is a Temporal activity, and the workflows tie them together. The main one ingests a single source end to end:

```go
// workflows/ingest.go (trimmed)
func IngestSource(ctx workflow.Context, in IngestInput) (IngestResult, error) {
	ctx = workflow.WithActivityOptions(ctx, workflow.ActivityOptions{
		StartToCloseTimeout: 30 * time.Minute,
		RetryPolicy:         &temporal.RetryPolicy{MaximumAttempts: 5},
	})
	var a *Activities

	var batch ExtractResult
	if err := workflow.ExecuteActivity(ctx, a.Extract, in).Get(ctx, &batch); err != nil {
		return IngestResult{}, err
	}
	var mapped MapResult
	if err := workflow.ExecuteActivity(ctx, a.Map, batch).Get(ctx, &mapped); err != nil {
		return IngestResult{}, err
	}
	var resolved ResolveResult
	if err := workflow.ExecuteActivity(ctx, a.Resolve, mapped).Get(ctx, &resolved); err != nil {
		return IngestResult{}, err
	}
	var card Scorecard
	if err := workflow.ExecuteActivity(ctx, a.Score, in.Source, resolved).Get(ctx, &card); err != nil {
		return IngestResult{}, err
	}
	return IngestResult{Scorecard: card, QueuedForReview: resolved.Queued}, nil
}
```

The reference has four workflows:

| Workflow | Trigger | What it does |
|---|---|---|
| `IngestSource` | a schedule per source, or a webhook | extract, map, resolve, score, write |
| `ConfirmLink` | a team confirms or rejects in the UI | promote or remove an inferred edge, record who and when |
| `DeclarePrimary` | a data set owner, through a reviewed request | switch a data set's standing to primary, with owner and date |
| `BuildArtifacts` | nightly, and after large ingests | regenerate insights, diagrams and drafts from a model snapshot |

Why a workflow engine rather than a cron job and some scripts? Because ingestion is long-running, talks to flaky APIs and calls models that time out. Temporal retries each step on its own, resumes after a crash where it stopped, and shows every run with its inputs and failures in its UI. That last part is underrated: when a source's scorecard drops, the first question is what happened during the last ingest, and the answer is one click away. It is the same reason I used Temporal for the web delivery self-service described in the first post, where workflows took over the operators' work.

## Layer six: scoring

The `Score` activity computes a scorecard per source and data set on every ingest:

| Signal | Computed as |
|---|---|
| freshness | share of records changed or confirmed within the source's expected cycle |
| completeness | share of records with every field the mapper needs |
| agreement | share of facts that at least one other source confirms |
| resolvability | share of records that resolve to a Context Model entity |

The overall score is a weighted mean, the weights are configuration, and every number links to the records behind it. Two things follow from the scores. New edges start with a confidence that reflects their source's score, so a fact from a well-kept source outranks the same claim from a neglected one. And the scorecards are public, on a page every team can see, which turns data quality from an audit finding into something closer to a league table.

## Layer seven: the API and the MCP server

One Go binary serves three surfaces from the same queries: a REST API for systems and the frontend, an MCP server for agents, and a static endpoint for generated artifacts. Keeping them in one process is deliberate. An agent and a person looking at the same entity must see the same facts, and the easiest way to guarantee that is to not have two implementations.

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

Three rules shaped them. **Tools are entity-centric**, because agents reason better from "give me this thing and its neighbourhood" than from generic query languages. **Every answer carries its provenance**, so an agent can cite where a fact came from and a human can check it. **Answers are small**, with ids the agent can follow up on, rather than whole subgraphs, because the point of the platform is to save the agent tokens, not to flood its context window. I made the economic case in [The Economics of Inference](/articles/the-economics-of-inference/) and the design case for tools in [Tools: How Agents Actually Do Things](/articles/tools-how-agents-actually-do-things/).

A `find_owner` answer looks like this:

```json
{
  "entity": "ctx:Namespace/claims-prod",
  "owner": "ctx:Team/claims-platform",
  "basis": "derived",
  "confidence": 0.93,
  "path": [
    "ctx:Namespace/claims-prod <- runs_in - ctx:Workload/claims-prod/policy-admin",
    "ctx:Workload/claims-prod/policy-admin <- deployed_as - ctx:Application/policy-admin",
    "ctx:Application/policy-admin - owned_by -> ctx:Team/claims-platform (asserted, earepo)"
  ],
  "last_seen": "2026-11-12T03:04:11Z"
}
```

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

The TypeScript types come from the ontology, so when the model changes the frontend fails to compile until it catches up. That is the right kind of friction.

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

**Drafts.** The last group of generators produces documents for humans to finish: a current-state section for a solution design, an architecture decision record pre-filled with the context and the options, a short business case for a consolidation with the affected applications and their owners. These are where a language model helps most, and also where it needs the tightest leash. Every claim in a draft must cite an entity or an edge, and the generator rejects drafts that do not. A draft is a starting point with sources, never an answer, which is the failure mode I called artifact over-trust in the first post.

## Running it

```sh
git clone https://github.com/raskell-io/it-intelligence
cd it-intelligence
make up       # PostgreSQL, Temporal, api, worker and web via docker compose
make seed     # load the Kestrel Group exports
make ingest   # run IngestSource for every seeded source
open http://localhost:3000
```

<!-- TODO(Raffael): replace with the real commands and, if it helps, a short console transcript of the first ingest once the repo exists. -->

After the first ingest, three places are worth a look. The scorecards page shows the EA repository export scoring worst on freshness, because of the application that was switched off a year ago. The review queue for the claims platform team holds the inferred link from `pol-adm-ui` to Policy Administration, with the model's reasons. And asking a coding agent in the repository "who owns claims-prod and what depends on it?" should produce an answer that cites its path through the graph, in two tool calls instead of twenty.

## What the reference leaves out

A reference implementation earns trust by being honest about its gaps. These are the big ones.

- **Identity and access.** The reference has no authentication. A real deployment needs identity for writes, because confirmations and primary declarations carry a person's name, even if reads are open to everyone by default, as I argued they should be.
- **Real connectors at scale.** The connectors read seed files and a few public APIs. Production connectors deal with pagination, rate limits, partial failures, credentials and sources that change their schema without warning. That work is unglamorous and endless.
- **History.** The reference keeps observation history but rebuilds entities and edges in place. Point-in-time questions ("what did the landscape look like before the migration?") need edge history with validity intervals, which is a straightforward extension and a real cost in storage and query complexity.
- **Scale.** Kestrel has forty applications. A large group has thousands of applications and millions of observations. PostgreSQL copes with that, but the recursive queries need indexes, limits and some care, and the nightly artifact build needs to become incremental.
- **Governance of the ontology itself.** Who may add an entity kind, and how the change is reviewed, is an organisational question the repository can support with code review but not answer.

None of these changes the shape. They are the difference between a reference you can understand in an afternoon and a platform you can run for a group.

## What to take from it

If you build one of these, the order matters more than the tools. Write the ontology first and generate from it. Keep observations and entities apart. Make every relationship a row with a basis, a confidence and a source. Score your sources in public. Put the MCP server in the same process as the API. Generate artifacts as text, with sources, from snapshots. Everything else, the database, the workflow engine, the frontend framework, the model provider, is a choice you can revisit later.

The repository is there to be taken apart. If you run it against your own exports and the model gets something wrong, that is the most useful thing that can happen, and I would like to hear about it.

<!-- TODO(Raffael): contribution and contact line; link the repo's CONTRIBUTING.md once it exists. -->

## References

- Raffael Schneider, [IT Intelligence: The Missing Data Layer of Enterprise IT](/articles/it-intelligence/), the companion post with the argument for the platform.
- [LinkML](https://linkml.io/), the Linked Data Modeling Language, and its [generators](https://linkml.io/linkml/generators/).
- [Temporal](https://temporal.io/), durable workflow execution.
- [PostgreSQL documentation on recursive queries](https://www.postgresql.org/docs/current/queries-with.html) (`WITH RECURSIVE`).
- [Apache AGE](https://age.apache.org/), graph queries with openCypher on PostgreSQL.
- [Model Context Protocol](https://modelcontextprotocol.io/), and the [official Go SDK](https://github.com/modelcontextprotocol/go-sdk).
- [Mermaid](https://mermaid.js.org/), diagrams as text.
- [Backstage software catalog](https://backstage.io/docs/features/software-catalog), the developer-portal ancestor of the entity model.
- Simon Brown, [The C4 model](https://c4model.com/), for architecture views that a generator can target.
- Michael Nygard, [Documenting Architecture Decisions](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions).
