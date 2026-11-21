+++
title = "The Enterprise Stack: Next.js, Go and Temporal for Platforms Many Teams Share"
date = 2026-11-19
draft = true
description = "How I would build an enterprise platform many teams share: Next.js in front, a Go API and CLI, and Temporal running the connectors."

[taxonomies]
tags = ["enterprise-architecture", "golang", "typescript", "durable-execution", "platform-automation", "ai-platforms", "agents"]

[extra]
author = "Raffael"
in_short = [
  "A platform many teams share has a different constraint from a solo project: many front doors, many systems next door, processes that wait for days, and auditors who want to know why.",
  "The shape matters more than the brands: one API contract, many clients generated from it, and a durable layer for everything that waits. Next.js, Go and Temporal are my current best fit for each layer.",
  "Next.js stays a thin front door with no database credentials and no business rules, because Server Actions are public endpoints and the framework's advisory count went from 6 in 2024 to 51 in 2026.",
  "A Go API is the product, and the portal, the CLI and the MCP server all call it through one generated client, so every action a person can click is also an action a script or an agent can call.",
  "Temporal runs the connectors to Jira, Salesforce, LeanIX and the rest, which all rate-limit, retry and deliver webhooks more than once; it costs a programming model to learn and a serious system to operate.",
]
+++

<!--
DRAFT NOTES (remove before publish)
1. Sources: every outside quote and figure was fetched and checked on 2026-11-21. ServiceNow's rate-limit page and
   Uber's Cadence post refused automated fetches, so ServiceNow appears only through its SDK's cross-scope guide and
   Cadence's history only through Temporal's own about page.
2. The AccessRequest workflow compiles and passes go vet against go.temporal.io/sdk v1.51.0 (checked 2026-11-21,
   with stub types and activities). The Cobra command calls a generated client that does not exist, so it stays
   marked illustrative.
3. Open choices only Raffael can make: OpenAPI with oapi-codegen (chosen here, consistent with IT Intelligence) or
   Connect with protobuf; Temporal Cloud or self-hosted as the default for a regulated company; whether citizen apps
   are hosted by the platform or by the teams.
4. Links to drafts: The Solo Stack and The Run Outlives the Process. Publish together or drop the links.
5. Corporate boundary: nothing here describes an employer. Keep it that way in edits.
6. Hero prompt, Korean and Chinese translations.
-->

[The Solo Stack](/articles/the-solo-stack-elixir-and-phoenix/) is about the projects where I am the whole team. This piece is about the opposite constraint: a platform that many teams share, build on, and depend on. Three shapes keep coming up. An agentic AI hub, where teams publish agents and tools and other teams use them. A self-service portal in the spirit of [Backstage](https://backstage.io/docs/overview/what-is-backstage), *"an open source framework for building developer portals"*. And a marketplace where people outside the platform team build small [citizen apps](/notes/citizen-entrepreneurs/) of their own.

They have the same constraints. There are many front doors: a web portal, views embedded in other products, a command line, an MCP server for agents, other teams' code. There are many systems next door, each with its own API, rate limits and moods: Jira, ServiceNow, Salesforce, LeanIX. Many processes wait: for an approval, for a ticket to move, for a nightly sync, sometimes for a week. And somebody will eventually ask who did what, and why.

My answer is a shape before it is a stack. One API contract that is the product. Many front doors, all generated from that contract. And a durable layer for everything that waits. Today I would fill those layers with Next.js, Go and Temporal, and I will argue for each, but I hold the layers more firmly than the brands.

## The shape

{% diagram(title="One contract, many front doors, a durable layer for what waits") %}
   people          agents           other teams' code       citizen apps
     │               │                     │                     │
     ▼               ▼                     ▼                     ▼
 ┌──────────┐  ┌────────────┐       ┌─────────────┐      ┌──────────────┐
 │ Next.js  │  │ CLI (Cobra)│       │ generated   │      │ manifest and │
 │ portal   │  │ MCP server │       │ SDK         │      │ scoped token │
 └────┬─────┘  └─────┬──────┘       └──────┬──────┘      └──────┬───────┘
      └──────────────┴───── one generated client ───────────────┘
                                   │
                                   ▼
                     ┌──────────────────────────┐   authorization, validation,
                     │ Go API: the control plane│   audit, idempotency keys;
                     └────────────┬─────────────┘   starts and queries workflows
                                  │ start, signal, update, query
                                  ▼
                     ┌──────────────────────────┐
                     │ Temporal: namespaces per │
                     │ team, Nexus between them │
                     └────────────┬─────────────┘
                                  │ one task queue per system
               ┌──────────────┬───┴──────────┬──────────────┐
               ▼              ▼              ▼              ▼
          jira-worker   servicenow-wkr  salesforce-wkr  leanix-worker   (Go)
               │              │              │              │
             Jira        ServiceNow     Salesforce        LeanIX
{% end %}

Read it from the bottom. Every external system gets its own worker pool, so its rate limits and outages stay its own. Above that, Temporal holds every process that has to wait or retry. Above that, a Go API decides who may do what and records it. And every way in, for people, scripts, agents and other teams, is a client of that one API.

## The API is the product

The [CNCF platforms white paper](https://tag-app-delivery.cncf.io/whitepapers/platforms/) defines a platform as *"an integrated collection of capabilities defined and presented according to the needs of the platform's users"*. The users of an enterprise platform are people in a browser, engineers in a terminal, pipelines in CI, and, more and more, agents. If the portal can do something the API cannot, three of those four are second-class citizens. So the API comes first, and the portal is one of its clients.

I would write that API in Go. I made the case in [Almost Irrelevant](/articles/almost-irrelevant/#go-for-code-a-whole-company-shares) and in the [Why Go](/articles/building-it-intelligence/#why-go) section of Building IT Intelligence: it is the language a whole company can read, agent-written Go looks like human-written Go, and the [Go 1 compatibility promise](https://go.dev/doc/go1compat) means a service written today still builds in five years. The API owns authorization, validation, the audit log, and idempotency keys. It starts and queries workflows; it never runs them.

The contract is an OpenAPI document, and the clients are generated from it with [oapi-codegen](https://github.com/oapi-codegen/oapi-codegen). The portal's server side calls the generated client. So does the CLI. So does the MCP server. One change to the contract, one regeneration, and every front door learns the new action at once. There is public precedent for each piece. The [Stripe CLI](https://github.com/stripe/stripe-cli/blob/master/pkg/gen/gen_resources_cmds.go) generates its resource commands from Stripe's OpenAPI spec. [`gh api`](https://cli.github.com/manual/gh_api) *"Makes an authenticated HTTP request to the GitHub API and prints the response"*, an escape hatch for everything the curated commands do not cover. And GitHub's own [MCP server](https://github.com/github/github-mcp-server) is written in Go on top of the same kind of typed client a CLI would use.

The CLI is built with [Cobra](https://github.com/spf13/cobra), the library behind Kubernetes, Hugo and the GitHub CLI. A command is a thin wrapper around a generated call:

```go
// cmd/platform/access.go (illustrative): the same generated client the portal and the MCP server use
func newAccessRequestCmd(c *api.ClientWithResponses) *cobra.Command {
	var app, role string
	cmd := &cobra.Command{
		Use:   "request --app APP --role ROLE",
		Short: "Request access to an application",
		RunE: func(cmd *cobra.Command, _ []string) error {
			resp, err := c.CreateAccessRequestWithResponse(cmd.Context(),
				api.CreateAccessRequestJSONRequestBody{App: app, Role: role})
			if err != nil {
				return err
			}
			return printJSON(cmd.OutOrStdout(), resp.JSON202) // the workflow id, to follow up with "status"
		},
	}
	cmd.Flags().StringVar(&app, "app", "", "application id")
	cmd.Flags().StringVar(&role, "role", "", "role to request")
	return cmd
}
```

The command returns a workflow id rather than a result, because requesting access is not something that finishes in a request. That small detail is the whole reason Temporal is in this stack, and I come back to it below. What a CLI owes its callers, `--json`, honest exit codes, structured errors, is its own subject, which I wrote about in [Agent Experience](/articles/agent-experience/).

## Next.js as a thin front door

The portal is where most people meet the platform, and I would build it in Next.js: server rendering for pages that depend on who is looking, the largest pool of components and people, and a design system that teams can share. But I would keep it thin, and the reasons are in Next.js's own documentation.

Sam Newman's [Backends For Frontends](https://samnewman.io/patterns/architectural/bff/) pattern is the right frame: *"one experience, one BFF"*, owned by the team that owns the interface. Next.js's [data security guide](https://nextjs.org/docs/app/guides/data-security) recommends the same for organisations like these: HTTP APIs *"for existing large applications and organizations"*, called from Server Components under a *"Zero Trust"* model. The same guide explains why the trust has to sit somewhere else. A Server Action *"is reachable via a direct POST request, not just through your application's UI"*, and *"A page-level authentication check does not extend to the Server Actions defined within it."* Every Server Action is a public endpoint, whatever the page around it looks like.

The security record points the same way. Vercel published the numbers itself in November 2026: [6 advisories in 2024, 14 in 2025, and 51 in 2026](https://nextjs.org/blog/how-were-using-ai-to-make-nextjs-more-secure), 70% of them in code at least a year old, found faster now that AI makes old bugs cheap to discover. Two of them were severe. [CVE-2025-29927](https://github.com/vercel/next.js/security/advisories/GHSA-f82v-jwr5-mffw), rated 9.1, let a request skip authorization done in middleware. [CVE-2025-55182](https://react.dev/blog/2025/12/03/critical-security-vulnerability-in-react-server-components), rated 10.0, was remote code execution through React Server Components. Next.js 16 has since [renamed middleware to `proxy.ts`](https://nextjs.org/blog/next-16) *"to clarify network boundary"*, which is the right lesson.

I read all of this as an argument for an architecture in which a Next.js bug costs a bad day rather than a breach: the front end holds no database credentials, no business rules, and no authorization logic that the Go API does not repeat. The portal decides what to show. The API decides what is allowed.

One more temptation to resist: splitting the portal into independently deployed micro-frontends. Next.js supports [multi-zones](https://nextjs.org/docs/app/guides/multi-zones), separate apps under one domain, at the cost of a hard navigation between them. Module federation is the other route, and its own maintainers have [put Next.js support into maintenance mode](https://github.com/module-federation/core/issues/3153) with the advice *"If you are exploring microfrontends, do not use Next.js!"* My default is one portal, with teams contributing routes and packages to it, and zones only where an area truly has its own life.

## Temporal for everything that waits

The interesting work of an enterprise platform happens in the systems next door, and those systems were not built to be called by a platform in a hurry. A few of their published limits:

| System | What its documentation says | What the connector must do |
|---|---|---|
| [Jira Cloud](https://developer.atlassian.com/cloud/jira/platform/rate-limiting/) | points-based hourly quotas per tenant and a global pool of 65,000 points an hour; 429 with `Retry-After` | budget calls across teams, back off, honour `Retry-After` |
| Jira webhooks | [retried up to five times](https://developer.atlassian.com/cloud/jira/platform/webhooks/), 5 to 15 minutes apart; *"some webhooks might be delivered more than once"*; REST-registered webhooks expire after 30 days | deduplicate, and renew registrations on a timer |
| [Salesforce](https://resources.docs.salesforce.com/latest/latest/en-us/sfdc/pdf/salesforce_app_limits_cheatsheet.pdf) | a daily API allocation of 100,000 plus a share per licence; 25 concurrent long-running requests in production, then `REQUEST_LIMIT_EXCEEDED` | spread work over the day, cap concurrency |
| [LeanIX](https://updates.leanix.net/announcements/rate-limiting-for-requests-from-integration-api) | *"a global rate limit of 20 requests per second per workspace"* for the Integration API | throttle per workspace |

Every row asks for the same three things: retry with backoff, be idempotent, and be able to wait, sometimes for minutes, sometimes for days. Writing that by hand in every integration is how platforms end up with a different half-working retry loop per team. Durable execution puts it in one place. I wrote the long version of what durable execution is, with its history and its trade-offs, in [The Run Outlives the Process](/articles/the-run-outlives-the-process/); here I only need what it gives a platform.

Temporal has the longest pedigree of the engines. Its founders, Maxim Fateev and Samar Abbas, built AWS Simple Workflow and Azure's Durable Task Framework, and [*"In 2015, they reunited at Uber to co-create Cadence"*](https://temporal.io/about), the engine Temporal grew out of. The [server is MIT licensed](https://github.com/temporalio/temporal). The model is simple to state and takes a while to absorb. A workflow is ordinary Go code that [*"must be deterministic"*](https://docs.temporal.io/workflow-definition), because it is replayed from its history after a crash. Anything that touches the world, an API call, a model call, a database write, is an activity, retried according to a [retry policy](https://docs.temporal.io/encyclopedia/retry-policies). And [*"A Workflow can sleep for days, months, or even years"*](https://docs.temporal.io/develop/go/workflows/timers) without a worker being up.

Waiting for a person is the part that fits platforms best. Temporal's [message passing](https://docs.temporal.io/encyclopedia/workflow-message-passing) has three kinds: signals, which are fire and forget; queries, which read state; and updates, *"synchronous, tracked write requests"* that can be validated before they are accepted. An approval is an update, so the approver learns at once whether their decision was accepted. The status page in the portal is a query. A webhook arriving from Jira is a signal.

```go
// Illustrative: open a ticket, wait up to five days for a decision, provision, undo on failure.
func AccessRequest(ctx workflow.Context, req Request) (res Result, err error) {
	ctx = workflow.WithActivityOptions(ctx, workflow.ActivityOptions{
		StartToCloseTimeout: 30 * time.Second,
		RetryPolicy: &temporal.RetryPolicy{InitialInterval: 2 * time.Second, BackoffCoefficient: 2,
			MaximumInterval: 5 * time.Minute, NonRetryableErrorTypes: []string{"Forbidden", "Invalid"}},
	})
	var undo []func(workflow.Context)
	defer func() { // compensate in reverse order, even if the workflow was cancelled
		if err != nil {
			dctx, _ := workflow.NewDisconnectedContext(ctx)
			for i := len(undo) - 1; i >= 0; i-- { undo[i](dctx) }
		}
	}()

	var ticket string
	if err = workflow.ExecuteActivity(ctx, a.OpenJiraTicket, req).Get(ctx, &ticket); err != nil {
		return
	}
	undo = append(undo, func(c workflow.Context) { _ = workflow.ExecuteActivity(c, a.CloseJiraTicket, ticket).Get(c, nil) })

	var decision *Decision
	err = workflow.SetUpdateHandlerWithOptions(ctx, "decide",
		func(ctx workflow.Context, d Decision) error { decision = &d; return nil },
		workflow.UpdateHandlerOptions{Validator: func(ctx workflow.Context, d Decision) error { return d.CheckApprover(req) }})
	if err != nil {
		return
	}
	if ok, _ := workflow.AwaitWithTimeout(ctx, 5*24*time.Hour, func() bool { return decision != nil }); !ok || !decision.Approved {
		return Result{Status: "not approved", Ticket: ticket}, nil
	}
	err = workflow.ExecuteActivity(ctx, a.GrantRole, req).Get(ctx, nil)
	return Result{Status: "granted", Ticket: ticket}, err
}
```

The compensations are a [saga](https://www.cs.princeton.edu/research/techreps/598), Hector Garcia-Molina and Kenneth Salem's 1987 answer to transactions that run too long to hold locks: a sequence of steps, each with a step that undoes it. Temporal's own [write-up of the pattern](https://temporal.io/blog/saga-pattern-made-easy) is honest about the part it cannot do for you: *"you, the programmer, need to make sure each Temporal Activity is idempotent."* Activities run at least once. The connector to Jira still needs an idempotency key, and the workflow id plus the step name makes a good one.

## Many teams, many namespaces

A shared platform runs many teams' workflows, and sooner or later they call each other. Temporal's early answer, letting one team's workflow start another's directly, had the problem its own [announcement of Nexus](https://temporal.io/blog/announcing-nexus-connect-temporal-applications-across-isolated-namespaces) names: there was no service contract between them, and the caller needed broad access to the other team's namespace. Nexus, [generally available since March 2025](https://temporal.io/blog/replay-2025-product-announcements), gives each team its own namespace and lets it publish operations to others through an [endpoint](https://docs.temporal.io/nexus), *"a reverse proxy that decouples callers from handlers"*.

That maps closely onto [Team Topologies](https://teamtopologies.com/key-concepts), the book by Matthew Skelton and Manuel Pais that gave platform teams their vocabulary. A platform team provides its capabilities *X-as-a-Service*, and the goal is the *Thinnest Viable Platform*, not the largest one. In this stack the platform team owns the Go API, the connector workers and the Nexus endpoints for shared capabilities. Stream-aligned teams own their own workflows in their own namespaces and call the platform through contracts.

## Citizen apps call the API, never the integrations

The marketplace shape adds people who are not engineers on the platform team, and who should not need to be. The rule I would hold to is that a citizen app calls the platform's API with a scoped token and never talks to Jira or Salesforce directly. The connectors, their credentials and their rate budgets belong to the platform.

The large app platforms all converged on a version of this. An Atlassian Forge app declares in its [manifest](https://developer.atlassian.com/platform/forge/manifest-reference/permissions/) which outside domains it may call, and calls to any domain not listed *"will be rejected"*. ServiceNow's SDK documentation on [cross-scope privileges](https://servicenow.github.io/sdk/guides/cross-scope-privilege-guide) puts it as a rule: *"Never assume cross-scope access works by default."* Shopify marks its most sensitive [access scopes](https://shopify.dev/docs/api/usage/access-scopes) as requiring Shopify's own approval. A manifest of permissions, reviewed once and enforced by the platform, is the cheapest governance there is. When those apps are written or run by agents, the same boundary does the work I described in [Your Agent Wants Root](/articles/your-agent-wants-root/).

## The agentic AI hub

The sharpest current version of all this is a hub where teams publish agents. An agent run is a long, failure-prone process that calls models and tools, waits for people, and must not do the same expensive thing twice after a crash. That is a workflow, and the engines have noticed. In October 2026 Temporal shipped [integrations](https://temporal.io/blog/ai-framework-integrations) for the OpenAI Agents SDK, Google's ADK, AWS Strands, LangGraph and Vercel's AI SDK, with the pitch that *"Temporal adds durable execution without requiring you to rewrite the agent."* Each model call becomes an activity, each approval an update, each tool call to Jira an activity on the Jira worker.

Two caveats from Temporal's own documentation belong in the design. The [OpenAI Agents SDK integration guide](https://docs.temporal.io/develop/python/integrations/openai-agents) says *"Temporal's durability does not extend to MCP servers, which run independently of the Workflow"*, so an MCP tool that changes something still needs its own idempotency. And a workflow's history records everything the run saw, prompts and tool outputs included, so it needs the same care as any other store of sensitive data: payload encryption, retention limits, and no secrets passed as arguments. Developer portals are moving the same way; [Port](https://www.port.io/) now describes itself as a platform for the *"Agentic SDLC"*.

## Where it hurts

**Three runtimes.** Node for the portal, Go for the API and workers, and Temporal itself, with its database. A single TypeScript stack would be simpler to hire for and to run, and for a small platform I would take that trade. For one many teams depend on for years, I would rather have the API in the language they can all read.

**Temporal is a serious system to operate.** Its [production checklist](https://docs.temporal.io/self-hosted-guide/production-checklist) opens with *"Temporal Server is a complex system to run and scale"*, and the number of history shards is fixed when the cluster is created. Quo's account of [moving its self-hosted Temporal from Postgres to Cassandra](https://www.quo.com/blog/postgres-to-cassandra/) sums up where it bites: *"Persistence is almost always the constraint."* Temporal Cloud removes that work and replaces it with a bill, [from $50 per million actions](https://temporal.io/pricing) at the low end.

**Limits you design around.** A workflow's history has a hard limit of [51,200 events or 50 MB](https://docs.temporal.io/workflow-execution/limits). A long-lived process, or an agent conversation, has to continue as new before it gets there.

**Changing code that is still running.** A workflow started last week replays against the code you deploy today. Temporal's [versioning](https://docs.temporal.io/develop/go/versioning) handles that with patches, *"similar to a feature flag"*, and with worker versioning, but it is a discipline every team has to learn, and determinism errors after a deploy are the classic first incident.

**A front end on a monthly patch cycle.** The Next.js numbers above mean someone has to own upgrades as a routine, not as an emergency.

## The alternatives

Temporal is my default, not the only reasonable choice:

| Engine | Model | Why it might fit | Why I would not default to it here |
|---|---|---|---|
| [AWS Step Functions](https://docs.aws.amazon.com/step-functions/latest/dg/choosing-workflow-type.html) | state machines in JSON; Standard runs up to one year, Express up to five minutes | fully managed, nothing to operate | one cloud only; logic split between JSON and functions |
| [Restate](https://docs.restate.dev/concepts/durable_execution) | journaled code behind a server that is *"a single binary written in Rust"* | far less to operate than Temporal | younger; the server is under the [Business Source License](https://github.com/restatedev/restate/blob/main/LICENSE) |
| [DBOS](https://docs.dbos.dev/architecture) | a library on Postgres, with *"no separate orchestration server"* | the lowest operating cost of all | built for one application, less for a shared layer between teams |
| [Camunda 8 / Zeebe](https://docs.camunda.io/docs/components/zeebe/zeebe-overview/) | BPMN process models | business owners can read and own the diagrams | a second language for the processes, next to the code |
| [Apache Airflow](https://airflow.apache.org/docs/apache-airflow/stable/index.html) | *"a platform for orchestrating batch workflows"* | data pipelines on a schedule | not built for per-request processes that wait on people |
| Postgres with `skip locked` | your own runs table and workers | how [IT Intelligence](/articles/building-it-intelligence/) does it, and the right way to learn | you will rebuild timers, signals and versioning |

If the organisation is all in on one cloud, Step Functions is a fair choice. If the people who own the processes want diagrams they can sign off, Camunda has a real point. For a platform many teams build on, in code, across clouds, Temporal is the one I would bet on.

## What changes from the solo stack

Most of the difference comes from who reads the code. In the solo stack, one runtime does everything because one person has to hold it all. Here, every layer is chosen so that a different team can own it, read it, and replace it without asking the others: a contract in the middle, generated clients at the edges, and the waiting moved into an engine with its own history.

In [The River and the Canal](/articles/the-river-and-the-canal/) I described workflows as the canals an organisation digs once it knows where the water should go. An enterprise platform is mostly canals: between teams, between systems, between a request and the person who approves it. Temporal is the tool I would dig them with.

## References

- Matthew Skelton and Manuel Pais, [Team Topologies: Key Concepts](https://teamtopologies.com/key-concepts), Team Topologies; the book, second edition, IT Revolution, 2025.
- CNCF TAG App Delivery, [Platforms White Paper](https://tag-app-delivery.cncf.io/whitepapers/platforms/), Cloud Native Computing Foundation.
- Backstage documentation, [What is Backstage?](https://backstage.io/docs/overview/what-is-backstage), Backstage; Stefan Ålund, [Announcing Backstage](https://backstage.io/blog/2020/03/16/announcing-backstage/), Spotify, 2020.
- Sam Newman, [Pattern: Backends For Frontends](https://samnewman.io/patterns/architectural/bff/), samnewman.io, 2015.
- Next.js documentation, [Data Security](https://nextjs.org/docs/app/guides/data-security) and [Multi-Zones](https://nextjs.org/docs/app/guides/multi-zones), Vercel.
- Next.js team, [Next.js 16](https://nextjs.org/blog/next-16), Vercel, 2025; [How we're using AI to make Next.js more secure](https://nextjs.org/blog/how-were-using-ai-to-make-nextjs-more-secure), Vercel, 2026.
- Vercel, [Authorization Bypass in Next.js Middleware, CVE-2025-29927](https://github.com/vercel/next.js/security/advisories/GHSA-f82v-jwr5-mffw), GitHub Security Advisory, 2025.
- React Team, [Critical Security Vulnerability in React Server Components](https://react.dev/blog/2025/12/03/critical-security-vulnerability-in-react-server-components), react.dev, 2025.
- Module Federation, [Next.js Support is in maintenance mode](https://github.com/module-federation/core/issues/3153), GitHub, 2024.
- The Go Team, [Go 1 and the Future of Go Programs](https://go.dev/doc/go1compat), go.dev.
- [Cobra](https://github.com/spf13/cobra), spf13, GitHub; [oapi-codegen](https://github.com/oapi-codegen/oapi-codegen), GitHub.
- GitHub, [gh api](https://cli.github.com/manual/gh_api), GitHub CLI manual; [GitHub MCP Server](https://github.com/github/github-mcp-server), GitHub.
- Stripe, [Stripe CLI resource command generation](https://github.com/stripe/stripe-cli/blob/master/pkg/gen/gen_resources_cmds.go), GitHub.
- Temporal, [About Temporal](https://temporal.io/about), Temporal Technologies; [temporalio/temporal](https://github.com/temporalio/temporal), GitHub.
- Temporal documentation, [Workflow Definition](https://docs.temporal.io/workflow-definition), [Retry Policies](https://docs.temporal.io/encyclopedia/retry-policies), [Timers in Go](https://docs.temporal.io/develop/go/workflows/timers), [Workflow message passing](https://docs.temporal.io/encyclopedia/workflow-message-passing), [Versioning in Go](https://docs.temporal.io/develop/go/versioning), [Nexus](https://docs.temporal.io/nexus), [Workflow execution limits](https://docs.temporal.io/workflow-execution/limits), and [Self-hosted production checklist](https://docs.temporal.io/self-hosted-guide/production-checklist), Temporal Technologies.
- Temporal Go SDK reference, [package workflow](https://pkg.go.dev/go.temporal.io/sdk/workflow), pkg.go.dev.
- Phil Prasek and Roey Berman, [Announcing Nexus](https://temporal.io/blog/announcing-nexus-connect-temporal-applications-across-isolated-namespaces), Temporal, 2024; Meagan Speare, [Replay 2025 product announcements](https://temporal.io/blog/replay-2025-product-announcements), Temporal, 2025.
- Emily Fortuna, [Saga design pattern explained](https://temporal.io/blog/saga-pattern-made-easy), Temporal, 2023.
- Hector Garcia-Molina and Kenneth Salem, [SAGAS](https://www.cs.princeton.edu/research/techreps/598), Princeton University technical report TR-070-87, 1987; SIGMOD 1987.
- Hien Phan, Johann Schleier-Smith, and David Hyde, [You don't need to build a new reliability system for every AI Framework](https://temporal.io/blog/ai-framework-integrations), Temporal, 2026.
- Temporal documentation, [OpenAI Agents SDK integration](https://docs.temporal.io/develop/python/integrations/openai-agents), Temporal Technologies.
- Temporal, [Temporal Cloud pricing](https://temporal.io/pricing), Temporal Technologies.
- Tris Lahey, [Self-hosted Temporal lessons: Outgrowing Postgres and moving to Cassandra](https://www.quo.com/blog/postgres-to-cassandra/), Quo, 2026.
- Atlassian, [Jira Cloud rate limiting](https://developer.atlassian.com/cloud/jira/platform/rate-limiting/) and [Webhooks](https://developer.atlassian.com/cloud/jira/platform/webhooks/), Atlassian Developer.
- Salesforce, [Salesforce Developer Limits and Allocations Quick Reference](https://resources.docs.salesforce.com/latest/latest/en-us/sfdc/pdf/salesforce_app_limits_cheatsheet.pdf), Salesforce, 2026.
- SAP LeanIX, [Rate limiting for requests from Integration API](https://updates.leanix.net/announcements/rate-limiting-for-requests-from-integration-api), LeanIX, 2022.
- Atlassian, [Forge manifest permissions](https://developer.atlassian.com/platform/forge/manifest-reference/permissions/); ServiceNow, [Cross-scope privileges](https://servicenow.github.io/sdk/guides/cross-scope-privilege-guide), ServiceNow SDK; Shopify, [Access scopes](https://shopify.dev/docs/api/usage/access-scopes), Shopify.dev.
- AWS, [Choosing workflow type in Step Functions](https://docs.aws.amazon.com/step-functions/latest/dg/choosing-workflow-type.html), Amazon Web Services; Restate, [Durable Execution](https://docs.restate.dev/concepts/durable_execution); DBOS, [Architecture](https://docs.dbos.dev/architecture); Camunda, [Zeebe overview](https://docs.camunda.io/docs/components/zeebe/zeebe-overview/); Apache Airflow, [Documentation](https://airflow.apache.org/docs/apache-airflow/stable/index.html).
- Port, [port.io](https://www.port.io/).
