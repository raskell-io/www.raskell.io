+++
title = "Edge Systems Are the New Backend"
date = 2026-02-11
draft = true
description = "Auth, policy, inference, and business logic are migrating to the edge and the client. The traditional backend is becoming a persistence layer. Here is what that architecture looks like."

[taxonomies]
tags = ["edge-systems", "platform-automation"]
categories = ["deep-dives"]
series = ["deep-dives"]

[extra]
author = "Raffael"
+++

A request arrives at your system. In the next 50 milliseconds, before any application code runs, this happens: TLS termination, route matching, WAF inspection against 285 detection rules, JWT validation, rate limit evaluation, request body validation against a JSON schema, and trace context generation. The request either dies at the edge or arrives at your backend pre-authenticated, pre-validated, and pre-authorized.

Five years ago, your backend did all of this. Every service validated its own tokens, enforced its own rate limits, ran its own security checks. Today, the backend might not even exist in the form you expect. It might be a static site served from edge nodes, a thin persistence API, or a headless CMS that publishes content to a CDN and never handles a user request directly.

Something shifted. Not just at the edge. On both ends.

## The three-tier past

The architecture most of us learned was simple. Client, backend, database. The browser rendered HTML, maybe ran some jQuery. The backend did everything: authentication, authorization, business logic, rendering, validation, rate limiting, session management. The database stored state. Clean separation, one direction, easy to reason about.

This model worked because the browser was dumb. It could render markup and submit forms. Any real computation had to happen on the server. The backend was fat by necessity, not by design.

Microservices made it worse. Consider a typical setup: a user service, an order service, a payment service, a notification service, an inventory service. Each one needs to validate JWTs. Each one needs to enforce rate limits. Each one needs input validation, request logging, and error handling. That is five services times six concerns. Thirty implementations of logic that should exist exactly once.

Now multiply. Real organizations have 15, 50, 200 services. Each team implements auth slightly differently. One uses a shared library, one copied the code two years ago, one rolled their own because the library did not support their token format. The rate limiting configurations drift. The logging formats diverge. A security patch to the JWT validation logic means PRs across every repository, coordinated deployments, and someone asking "did we get all of them?"

```
                 ┌──────────┬──────────┬──────────┐
                 │ Users    │ Orders   │ Payments │
                 │ Service  │ Service  │ Service  │
                 ├──────────┼──────────┼──────────┤
  Auth           │ ✓ (v2.1) │ ✓ (v1.9) │ ✓ (v2.0)│
  Rate limiting  │ ✓ (lib)  │ ✓ (copy) │ ✗ (none)│
  Validation     │ ✓        │ ✓        │ ✓       │
  WAF/Security   │ ✗        │ ✗        │ ✗       │
  Logging        │ JSON     │ text     │ JSON    │
  Tracing        │ ✓        │ ✗        │ ✓       │
                 └──────────┴──────────┴──────────┘
```

Libraries helped. Service meshes helped more. But the complexity was still distributed across every service, in every team's codebase, in every deployment pipeline. The mesh moved networking concerns to a sidecar. It did not move application-level concerns like auth, validation, or security inspection.

The edge was an afterthought. A reverse proxy. TLS termination. Maybe Varnish for caching. Maybe a CDN for static assets. It was infrastructure plumbing, not a place where decisions happened.

That model is over.

## Two migrations, one hollowing

Here is the thing I keep coming back to: business logic is migrating in two directions simultaneously.

Upward, to the edge. Infrastructure concerns like auth, WAF, and rate limiting now execute at the edge layer, before requests reach any backend. But it goes further than that. Edge Workers run actual application code. Containers deploy at the edge. Server-side rendering happens at edge nodes 50ms from the user, not in a data center 200ms away.

Downward, to the client. The browser is no longer dumb. WebAssembly runs near-native code. WebGPU puts the GPU to work on ML inference and image processing. Web Workers handle background computation. Service Workers intercept network requests and serve cached responses offline. CRDTs let the client own its data and sync when it feels like it.

The backend is caught in the middle. Squeezed from both sides. And what remains is not a "backend" in any traditional sense. It is a persistence layer. A place where data rests and syncs. The interesting work happens elsewhere.

## What moved to the edge

### Infrastructure concerns

The first wave was obvious. Cross-cutting concerns that every service needed are better handled once, at the point of entry.

**Authentication.** Validating a JWT does not require application context. The token is self-contained: a signature, an issuer, an expiry, a set of claims. Parse it, verify the signature against a JWKS endpoint, check the expiry, extract the claims, attach them as headers. Done. The backend receives `X-User-Id: alice` and `X-User-Role: admin` instead of a raw Bearer token it has to decode itself.

This is not hypothetical. Here is what this looks like in practice:

```kdl
agent "auth" {
    type "auth"
    grpc address="http://localhost:50051"
    events "request_headers"
    timeout-ms 100
    failure-mode "closed"
    max-concurrent-calls 100
}
```

That agent handles JWT, OIDC, SAML, mTLS, and API key validation. Every route behind it gets authentication for free. Every backend service trusts the edge to have done the work. The auth agent crashes? Failure mode is "closed". Requests stop, but the proxy stays up.

**Rate limiting.** Token bucket algorithms with per-client keys. The edge layer sees every request before the backend does. It is the natural place to enforce rate limits because it can reject bad traffic before it consumes backend resources. A rejected request at the edge costs microseconds. A rejected request at the backend costs a database query, a connection slot, and whatever work happened before the check.

There are two flavors. Local rate limiting uses in-process token buckets. Fast, no network hops, but each edge node tracks its own counters. If you have 10 edge nodes and a limit of 100 requests per second, each node allows 100, so the effective limit is 1,000. For most use cases, this is fine. Abuse does not distribute itself evenly across your infrastructure.

Distributed rate limiting uses a shared store (Redis, typically). Accurate across nodes, but adds a network hop per request. The tradeoff is latency versus precision. I default to local rate limiting and switch to distributed only when the use case demands exact global limits, like API billing or token budgets for LLM inference.

**Security inspection.** WAFs used to be appliances. Expensive, opaque, binary. A request was either blocked or allowed. Modern WAFs use anomaly scoring. Each rule contributes a score, and the total determines the action:

```
Score 0-9:    Allow
Score 10-24:  Log (warning, investigate later)
Score 25+:    Block
```

This is a fundamentally different model than binary block/allow. It lets you tune aggressively without breaking legitimate traffic. I run 285 detection rules at the edge and process 912K requests per second on clean traffic. That is 30x faster than ModSecurity's C implementation. The performance gap matters because it means WAF inspection can happen on every request, not just suspicious ones.

**API validation.** If your API has a JSON Schema, why validate request bodies in your application code? Validate at the edge. Reject malformed requests before they consume a connection, a goroutine, a database transaction. The backend receives only structurally valid payloads.

**Observability.** Trace context should originate at the edge, not at the application. The edge is where the request enters your system. It is where you assign a trace ID, start the clock, and record the first span. If you originate traces in your application, you miss everything that happened before: TLS negotiation time, WAF processing time, the fact that the request sat in a rate limit queue for 50ms. Starting traces at the edge gives you the full picture.

### The isolation problem

You cannot put all of this in a monolithic proxy. That is how you end up with nginx and 47 modules where nobody understands the interaction effects. A WAF bug should not take down your routing. A slow auth provider should not block rate limit checks.

The answer is process isolation. Thin dataplane, crash-isolated external agents. Each agent runs as a separate process with its own failure domain:

```
┌──────────────────────────────────────────┐
│ Edge Proxy (thin dataplane)              │
│ Routing │ TLS │ Caching │ Load Balancing │
└─────┬──────────┬──────────┬──────────────┘
      │          │          │
      ▼          ▼          ▼
   [WAF]      [Auth]    [Rate Limit]
  process     process     process
```

Each agent gets its own concurrency semaphore. A slow WAF cannot starve auth. Each agent has a circuit breaker. Three failures in 30 seconds and the circuit opens. Each agent has a configurable failure mode, and this is where the design gets interesting:

```kdl
agent "waf" {
    type "waf"
    timeout-ms 100
    failure-mode "closed"
    max-concurrent-calls 50
    circuit-breaker {
        failure-threshold 5
        success-threshold 2
        timeout-seconds 30
    }
}

agent "rate-limit" {
    type "rate-limit"
    timeout-ms 50
    failure-mode "open"
    max-concurrent-calls 200
}
```

The WAF fails closed. If it crashes or times out, requests are blocked. You lose availability to preserve security. Rate limiting fails open. If it crashes, requests are allowed. You lose rate enforcement to preserve availability. These are explicit choices per agent, not global defaults. The operator decides which tradeoff to make for each concern, and the decision is visible in the config, not buried in code.

Agents return decisions. The proxy merges them. A blocking decision from any agent wins. Otherwise, header mutations accumulate. The model is simple: agents advise, the proxy decides. No agent can override another agent's block. No agent can force a request through. The proxy owns the final call.

This is not a workaround. It is the fundamental design choice. Complex logic lives outside the core, behind process boundaries. The proxy stays small, fast, and boring. The agents handle the interesting work in isolation. A bug in a Lua scripting agent does not corrupt the routing table. A memory leak in the WAF agent does not exhaust the proxy's memory. The process boundary is the blast radius.

### Edge Workers: business logic at the edge

Infrastructure concerns were the first wave. The second wave is actual business logic.

Cloudflare Workers, Deno Deploy, Fastly Compute, Vercel Edge Functions. These are not just "serverless at the CDN." They are full compute environments running at edge nodes around the world. V8 isolates spin up in under 5ms. Cold starts are measured in single-digit milliseconds, not seconds. Your code runs 50ms from the user instead of 200ms away in us-east-1.

The constraints matter, because they shape what belongs here. Typical Edge Worker limits: 10-50ms CPU time per request (not wall time, actual CPU), 128MB memory, no raw TCP sockets, no persistent file system. You get a request, key-value storage, and the ability to make sub-requests to origins. That is it. These constraints are not bugs. They are what makes sub-millisecond cold starts possible. V8 isolates are cheap because they are small and short-lived.

What fits within these constraints is surprisingly broad:

- **API routing and transformation.** A request comes in for `/api/v2/users`. The edge Worker rewrites it, fans out to two backend services (user profiles from one, preferences from another), merges the responses, and returns a single payload. The backend services are simple data sources. The edge Worker is the API layer.
- **A/B testing and feature flags.** Read the experiment cookie, hash the user ID, assign a variant, route to the right origin or rewrite the response. No round trip to a feature flag service. The decision happens in microseconds at the node closest to the user.
- **Personalization.** Look up the user's segment in KV storage, inject the right content block, set cache headers accordingly. The backend generated all variants at build time. The edge picks the right one per request.
- **Server-side rendering.** Render HTML at the edge node closest to the user. Frameworks like Next.js and Remix already support this. React Server Components run at the edge. The "server" in server-side rendering is not your server. It is an edge node in 300 locations.
- **Authentication and session management.** Validate tokens, refresh sessions, set secure cookies. The auth flow never touches your origin. Cloudflare Workers KV or Durable Objects store session state at the edge.

The pattern: compute that depends on request context but not on deep application state moves to the edge. If you can do it with a request, a key-value lookup, and a response, it probably belongs here. If it needs a complex database query or a multi-step transaction, it does not.

### Containers at the edge

Edge Workers hit a ceiling when you need persistent connections, large memory, or long-running processes. For those workloads, containers at the edge.

Fly.io, Railway, and Lambda@Edge deploy containers or full processes to edge locations worldwide. Your application runs with real file systems, TCP connections, and whatever runtime you need. But it runs close to users, not in a centralized data center. Latency drops from 200ms to 20ms.

The interesting problem is data gravity. Compute is easy to distribute. Data is not. If your container runs in Tokyo but your database is in Frankfurt, you have not solved the latency problem. You have moved it from the user-to-server hop to the server-to-database hop. The solutions are still maturing: read replicas at the edge (Turso, Neon), embedded databases that sync (LiteFS, libSQL), and eventually-consistent stores designed for multi-region (DynamoDB Global Tables, CockroachDB).

This model makes sense when compute and data can be co-located:

- **Regional APIs** that comply with data residency requirements. Run the container and the database replica in the same region. GDPR data stays in the EU. Japanese user data stays in Japan.
- **Real-time applications** where 200ms round trips kill the experience. Collaborative editing, multiplayer, live dashboards. A WebSocket server 20ms away feels instant. One 200ms away feels sluggish.
- **Stateful edge compute** where you need more than a request/response cycle. Background processing, scheduled jobs, long-running connections.

The line between "edge" and "origin" blurs. If your container runs in 30 regions and handles requests locally with a local database replica, is that an edge deployment or a distributed backend? The distinction stops mattering. What matters is that the compute and the data are close to the user.

## What moved to the client

The other half of the migration goes downward. The browser is not the thin client it used to be.

### WebAssembly

WASM runs at near-native speed in every modern browser. Not "fast for JavaScript." Actually fast. Compiled from Rust, C++, Go, or any language with an LLVM backend. Sandboxed, portable, deterministic.

What this enables:

- **Image and video processing** in the browser. No upload to a server, no round trip, no privacy concern. The pixels never leave the device.
- **Document parsing and transformation.** PDF rendering, spreadsheet computation, file format conversion. Libraries compiled to WASM and running client-side.
- **Cryptographic operations.** End-to-end encryption where the server never sees plaintext. Key derivation, signing, verification, all in the browser.
- **Full relational databases in the browser.** This is the one that changes architectures.

SQLite compiled to WASM (via projects like sql.js, wa-sqlite, or the official SQLite WASM build) gives the browser a real relational database. Not a key-value store. Not IndexedDB's awkward object store API. Actual SQL with joins, indexes, transactions, and triggers. Backed by the Origin Private File System (OPFS) for persistence, it survives page reloads and browser restarts.

The implications are significant. Your application can run complex queries locally. Filter, sort, aggregate, full-text search. All instant, all offline. The server becomes a sync endpoint. It ships a database snapshot down and accepts change sets back. The client does the querying. The server does the storing.

This pattern scales down elegantly. A note-taking app with SQLite-in-WASM needs no backend API for reads. A project management tool can filter and search 10,000 tasks without a network request. A CMS authoring interface can work fully offline and sync when the author reconnects. The read path is local. The write path syncs eventually.

WASI (WebAssembly System Interface) extends this further. It gives WASM modules controlled access to file systems, clocks, and network sockets outside the browser. WASM becomes a universal runtime: the same binary runs in the browser, at the edge (Cloudflare Workers use WASM under the hood), and on bare metal. Write once, deploy to every layer of the stack.

The pattern: anything that is CPU-bound, privacy-sensitive, or latency-sensitive is a candidate for client-side WASM. If the computation does not need server-side state, it should not round-trip to a server.

### WebGPU

WebGPU landed in Chrome in 2023, in Firefox and Safari shortly after, and it changes the math on what the client can compute. This is not WebGL with a new name. WebGL exposes a graphics pipeline. WebGPU exposes compute shaders. Direct, general-purpose GPU computation from JavaScript or WASM.

The immediate application is ML inference. Run a language model, an image classifier, or a recommendation engine on the user's GPU. No server call, no API cost per token, no latency. The model weights download once (cached by the browser) and run locally. Privacy by default, because the data never leaves the device.

This is not theoretical. Stable Diffusion generates images in the browser via WebGPU. Small language models (Phi-2, Gemma 2B, Llama 3.2 1B) run at usable speeds on consumer hardware. MediaPipe runs pose detection, face tracking, and hand gesture recognition in real time. The trajectory is clear: models get smaller through distillation and quantization, consumer GPUs get faster, and the gap between "cloud inference" and "local inference" narrows every quarter.

But inference is not the only use case. WebGPU handles any parallel computation: physics simulations for games, signal processing for audio applications, particle systems for data visualization, and large-scale matrix operations. Anything you would reach for CUDA or Metal for on native can now run in the browser. The compute budget of the client just increased by orders of magnitude.

### Web Workers and Service Workers

Web Workers give you background threads. Heavy computation does not block the UI. Parse a large file, run a simulation, index a search corpus. All off the main thread, all without janking the interface.

Service Workers sit between the browser and the network. They intercept every fetch request and decide what to do: serve from cache, go to network, do both and race them. This enables:

- **Offline-first applications.** The app works without a network connection. Data syncs when connectivity returns.
- **Background sync.** Queue mutations while offline, replay them when online.
- **Push notifications.** Wake the app without the user having it open.
- **Intelligent caching.** Cache API responses, serve stale data while revalidating, pre-fetch resources the user is likely to need.

The Service Worker is the client-side equivalent of the edge proxy. It intercepts, caches, validates, and routes. It makes the client self-sufficient.

### Local-first and CRDTs

Here is where it gets interesting. If the client has compute (WASM, WebGPU, Web Workers) and storage (IndexedDB, OPFS) and offline capability (Service Workers), why does it need a server at all?

CRDTs (Conflict-free Replicated Data Types) answer the consistency question. Multiple clients can edit the same data independently, offline, with no coordination. When they reconnect, their changes merge automatically without conflicts. No server-mediated locking. No "last write wins" data loss. Mathematical guarantees that concurrent edits converge to the same state.

The architecture:

```
Client A (offline)     Client B (offline)
    │                      │
    ├── Local edits        ├── Local edits
    │   (CRDT ops)         │   (CRDT ops)
    │                      │
    └──────┐      ┌────────┘
           ▼      ▼
      ┌──────────────┐
      │ Sync service  │  (thin, stateless)
      │ (persistence  │
      │  + relay)     │
      └──────────────┘
```

The sync service is not a backend. It stores operations and relays them between clients. It does not run business logic. It does not validate (the CRDT handles consistency). It does not transform (the merge function is built into the data type). It is a persistence layer with a WebSocket attached.

I build systems like this. The concrete model: a document is a flat `HashMap<EntityId, Entity>` where each entity holds CRDT-typed fields. The field types determine how concurrent edits merge:

| CRDT type | Merge behavior | Use case |
|-----------|---------------|----------|
| LwwRegister\<T\> | Last writer wins (by timestamp) | Simple values: name, status, URL |
| GrowOnlySet\<T\> | Union of both sides | Tags, labels, immutable references |
| ObservedRemoveSet\<T\> | Add wins over concurrent remove | Collaborator lists, mutable collections |
| MaxRegister | Higher value wins | Version counters, progress indicators |
| MinRegister | Lower value wins | Earliest timestamps, priority values |

Each field carries a hybrid logical clock (HLC) timestamp. The HLC combines physical time with a logical counter, so causality is preserved even when wall clocks drift. Two clients edit the same field at the "same" time? The HLC ordering is deterministic. Both clients converge to the same value without coordination.

The merge function has three properties that make this work: it is associative (grouping does not matter), commutative (order does not matter), and idempotent (applying the same operation twice has no additional effect). These are not implementation details. They are the mathematical foundation that makes server-free consistency possible. You can sync operations in any order, from any number of clients, through any number of intermediate relays, and every replica converges to the same state.

The client owns its data. The server is optional. When the server exists, it persists operations and relays them. It does not arbitrate, transform, or validate beyond authentication.

This is not a niche pattern for collaborative text editors. Any application where users create and modify data can benefit. Notes, task managers, project planning tools, CMS authoring, form builders. The question is not "should this be local-first?" The question is "does this need a server, and if so, for what?"

## What the backend becomes

If the edge handles infrastructure concerns and business logic that depends on request context, and the client handles computation, rendering, and local state, what is left for the backend?

A persistence layer.

The backend becomes the place where data rests between sessions and syncs between devices. Not an application server. A persistence layer.

Consider the spectrum of what "backend" looks like now:

**Static sites.** This site is an example. raskell.io is built with Zola. Markdown files compile to HTML at build time and deploy to edge CDN nodes. No application server. No database. No runtime process. The "backend" is a git repository and a CI pipeline. Content lives as files. Serving happens at the edge. The total monthly infrastructure cost is the price of a domain name.

This is not limited to blogs. Documentation sites, marketing pages, product landing pages, e-commerce storefronts with pre-rendered product pages. Any content that changes at author-time rather than request-time can be static. The headless CMS (Contentful, Sanity, Strapi, or just a git repo) publishes content. The static site generator builds HTML. The CDN serves it. The "backend" runs at build time, not at request time.

**Thin persistence APIs.** For applications with dynamic data, the backend shrinks to a database with an API in front of it. Accept writes, serve reads, enforce schema constraints. GraphQL or REST over Postgres. No rendering. No business logic beyond data integrity. The API exists so that clients and edge workers have somewhere to store and retrieve state.

The interesting shift: even the persistence API is getting thinner. Services like Supabase, PlanetScale, and Turso expose the database directly over HTTP or WebSockets with built-in auth. Your "backend" becomes a hosted database with row-level security policies. No application code at all.

**Sync relays.** For local-first applications, the backend is even simpler. Accept CRDT operations from clients, persist them to durable storage, fan them out to other connected clients via WebSocket. No merge logic (the CRDT handles that). No transformation. No validation beyond authentication. The relay does not understand the data. It stores and forwards.

**Event logs.** Append-only storage. Clients sync by replaying events from their last known position. The log is the source of truth. Everything else (search indexes, analytics dashboards, recommendation models) is a materialized view built asynchronously. The hot path is the append. The read path is the replay. Both are simple.

**Batch processors.** The one place where traditional backend compute survives: jobs that require access to the full dataset. Analytics aggregation, report generation, search index building, ML model training. These run on schedules or triggers, not in the request path. They read from the event log or the database, compute, and write results back. The user never waits for them.

The common thread: the backend does not touch the hot path. User requests hit the edge and the client. The backend runs in the background, on its own schedule, when no one is waiting.

## The architecture that makes this work

Pushing logic to the edge and the client is not free. Both environments have constraints, and ignoring them is how you build fragile systems.

### At the edge: bounded resources

Every operation at the edge needs explicit limits. No open-ended computations, no unbounded queues, no surprise behavior. This is not just good practice. It is existential. The edge proxy sits between the internet and your infrastructure. If it behaves unpredictably, everything behind it suffers.

Concretely:

| Resource | Bound | Why |
|----------|-------|-----|
| Agent concurrency | Per-agent semaphore (default: 100) | Prevents noisy neighbor between agents |
| Agent timeout | 100ms default | Prevents latency cascade |
| Connection pool | Explicit max (default: 10K) | Prevents file descriptor exhaustion |
| Request body | Streaming, not buffered | Prevents memory exhaustion |
| Route cache | LRU with size limit | Prevents unbounded growth |
| Rate limit queues | Bounded with max delay | Prevents request pile-up |

If you cannot articulate the bound for every resource your edge system uses, you do not have an architecture. You have an accident waiting for load.

### On the client: isolation and sandboxing

The client has different constraints. Battery life, memory pressure, the user closing the tab at any moment.

WASM runs in a sandbox. No file system access, no network access, no shared memory (unless explicitly granted). This is the security model that makes client-side compute viable. Untrusted code (your own, running on someone else's device) cannot escape the sandbox.

Web Workers run in separate threads with message-passing. No shared mutable state. No locks. No data races. The isolation is enforced by the runtime, not by programmer discipline.

Service Workers have a lifecycle managed by the browser. They can be terminated at any time to save resources. Your offline logic must handle graceful shutdown. This means: durable state in IndexedDB, idempotent sync operations, no in-memory state that cannot be reconstructed.

CRDTs provide consistency guarantees without coordination. But they are not magic. They consume memory (tombstones for deleted items, version vectors for causal ordering). They need garbage collection. They need careful schema design because not every data model maps cleanly to CRDT primitives. A counter works. A last-writer-wins register works. A rich text document with formatting, comments, and embedded media requires careful thought.

### The trust boundary

Here is the part most edge-computing articles skip: trust.

If the edge handles auth, the backend trusts the edge to have done auth correctly. If the client handles business logic, the server trusts the client to have computed correctly. These are real trust boundaries with real failure modes.

At the edge, trust is earned through:
- **Failure isolation.** Agent crashes do not take down the proxy. Bad config is validated before activation.
- **Observability.** Every decision is logged, metered, and traceable. If the WAF blocked a request, you can see exactly which rules fired and why.
- **Bounded behavior.** No surprise modes. Every resource has explicit limits. Every failure mode is configured, not assumed.

On the client, trust is conditional:
- **Never trust the client for security decisions.** Validate at the edge or the backend. Client-side checks are UX, not security.
- **Trust the client for its own data.** If the user is editing their own document, the client is authoritative. CRDTs handle consistency. The server persists, it does not arbitrate.
- **Verify at the boundary.** When client data syncs to the server, validate schema and authorization. Trust the merge, verify the input.

## When not to do this

Not everything belongs at the edge or on the client. Here is what stays in the backend:

**Multi-service transactions.** If an operation needs to read from three databases, check inventory, charge a payment, and send a notification, that is a backend workflow. Distributed transactions need coordination, and coordination needs a central authority.

**Heavy data joins.** If your query joins six tables with complex filters and aggregations, it runs next to the database, not at an edge node 200ms away from the data.

**Regulatory requirements.** Some industries mandate that data processing happens in specific locations, on specific infrastructure, with specific audit trails. Edge deployment may not satisfy these constraints.

**Small teams with simple needs.** If you have one backend, ten users, and no latency problems, this architecture is overhead. A Django app behind nginx is fine. Optimize when you have a reason to optimize, not before.

The edge handles cross-cutting concerns and request-context computation. The client handles local state and user-facing compute. The backend handles coordination, persistence, and anything that needs the full dataset. Know which is which.

## Where this is going

Five years ago, the stack was: browser (thin) renders server-generated HTML, backend (fat) runs everything, database stores state. The mental model was request/response, and the backend was the center of gravity.

The stack now:

```
┌─────────────────────────────────────────────────────┐
│ Client                                               │
│ WASM │ WebGPU │ Web Workers │ Service Workers │ CRDT │
│ (compute, render, offline, local state)              │
└────────────────────┬────────────────────────────────┘
                     │
┌────────────────────┴────────────────────────────────┐
│ Edge                                                 │
│ Proxy │ Workers │ Containers │ KV │ Durable Objects  │
│ (auth, WAF, routing, SSR, API aggregation, policy)   │
└────────────────────┬────────────────────────────────┘
                     │
┌────────────────────┴────────────────────────────────┐
│ Backend                                              │
│ Database │ Sync relay │ Event log │ Batch processing  │
│ (persistence, coordination, async compute)           │
└─────────────────────────────────────────────────────┘
```

The client is fat. The edge is fat. The backend is thin. The center of gravity moved to both ends simultaneously.

Every year, this accelerates. Models get smaller and run on consumer GPUs. WASM runtimes get faster and gain more system APIs through WASI. Edge platforms add durable storage, queues, and cron triggers. CRDTs mature from academic curiosities to production libraries. SQLite-in-the-browser goes from experiment to default architecture for offline-capable apps.

The backend will not disappear. Data needs to live somewhere durable, and cross-device sync needs a relay. Coordination problems need a central authority. Batch processing needs access to the full dataset. But the backend's role is narrowing to exactly these things. It is becoming infrastructure, not application. Plumbing, not logic.

I find myself building systems where the most interesting engineering happens at the boundaries. A reverse proxy that inspects 912K requests per second through 285 WAF rules, authenticates with sub-millisecond latency, and routes with crash-isolated agents. A client that owns its data through CRDTs, syncs when it feels like it, and runs inference on the local GPU. Between them, a database. Necessary and boring.

The backend is not dead. It is just not where the interesting work happens anymore.
