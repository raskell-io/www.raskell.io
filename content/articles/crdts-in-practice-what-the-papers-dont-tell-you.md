+++
title = "CRDTs in Practice: What the Papers Don't Tell You"
date = 2026-04-16
draft = true
description = "CRDTs promise conflict-free merges with mathematical guarantees. The papers are correct. They are also incomplete. Here is what building a real CRDT engine taught me about clocks, garbage, and the distance between theory and production."

[taxonomies]
tags = ["reliability", "oss", "rust"]
categories = ["deep-dives"]

[extra]
author = "Raffael"
+++

If you have managed infrastructure config across multiple environments, you know the pattern. You have a Git repository. It holds runtime configuration for your services. There is a `dev` branch, a `staging` branch, and a `production` branch. Each branch represents the state of a different environment. When you want to promote a config change from dev to production, you merge the branch.

This is how we did it at work. We had dozens of infrastructure components, each with its own IaC-inspired runtime config repository. The repositories were not Terraform or Pulumi. They were closer to declarative state files that described what a running system should look like: feature flags, routing rules, rate limits, WAF policies, certificate configurations. The actual infrastructure read these files at runtime and reconciled.

The branching model was simple and intuitive. It was also, over time, a source of constant pain.

## The stage branch problem

The first problem is drift. When `dev` and `production` diverge, which they always do, merging becomes a negotiation. A config value that makes sense in dev might be dangerous in production. A rate limit tuned for staging traffic is meaningless under production load. The branches are not really "versions" of the same configuration. They are different configurations that happen to share a history.

The second problem is merge conflicts. When two engineers change the same config file on different branches, Git treats this as a conflict even when the changes are to different fields. You are now resolving a merge conflict in a YAML file that controls production routing. The cognitive load is high and the stakes are real.

The third problem is ordering. Git branches encode a linear history, but config changes are not linear. Engineer A changes a rate limit on dev. Engineer B changes a feature flag on staging. These changes are independent. They do not conflict semantically. But the branching model forces you to sequence them. A merges first, then B merges on top of A, or vice versa. The merge order becomes load-bearing, and it should not be.

The fourth problem is visibility. Which branch represents "truth" for a given environment? Production, presumably. But what about the changes sitting on staging that have not been promoted yet? Are they pending, or abandoned? The branch model does not distinguish between "waiting for review" and "forgotten." Three months later, you discover a staging branch with fifteen commits that nobody remembers the purpose of.

I lived with this for long enough to recognize a pattern. The problems were not bugs in our workflow. They were consequences of using a tool designed for source code versioning to manage distributed mutable state. Git is excellent at what it does. What it does is track the history of a single lineage of changes. What we needed was a way for multiple writers to modify shared state concurrently, independently, and merge without conflicts.

That is, by definition, a CRDT.

## What a CRDT actually is

If you have read the Wikipedia article, you know the acronym: Conflict-free Replicated Data Type. If you have read the Shapiro et al. paper, you know the formal definition: a data type equipped with a merge function that is associative, commutative, and idempotent. If you have read neither, here is the intuition.

Imagine two people editing a shared document on two different laptops with no internet connection. They each make changes. When they reconnect, their changes need to combine into a single document without either person's work being lost, and without a central server deciding who "wins."

A CRDT is a data structure where this combination is automatic and deterministic. No matter what order the changes arrive in, no matter how many times the same change is applied, every replica converges to the same state. The merge function guarantees it.

The three properties of the merge function are what make this work:

- **Associative**: `merge(merge(A, B), C) = merge(A, merge(B, C))`. Grouping does not matter.
- **Commutative**: `merge(A, B) = merge(B, A)`. Order does not matter.
- **Idempotent**: `merge(A, A) = A`. Applying the same change twice has no additional effect.

These properties mean you can relay operations through any number of intermediate nodes, in any order, with any amount of duplication, and every replica will converge. No coordination protocol. No consensus algorithm. No leader election. The math handles it.

This sounds too good to be true. It is not too good to be true. But it is more complicated than it sounds.

## Conflux

Conflux is the CRDT engine I built to solve the config management problem. It is written in Rust, with pluggable storage backends for SQLite, PostgreSQL, and DynamoDB. The core data model is a document: a flat `HashMap<EntityId, Entity>` where each entity holds a set of CRDT-typed fields.

The field types determine how concurrent edits merge:

| CRDT type | Merge behavior | Use case |
|-----------|---------------|----------|
| `LwwRegister<T>` | Last writer wins (by timestamp) | Simple values: name, status, URL |
| `GrowOnlySet<T>` | Union of both sides | Tags, labels, immutable references |
| `ObservedRemoveSet<T>` | Add wins over concurrent remove | Collaborator lists, mutable collections |
| `MaxRegister` | Higher value wins | Version counters, progress indicators |
| `MinRegister` | Lower value wins | Earliest timestamps, priority values |

Each field carries a hybrid logical clock (HLC) timestamp. When two replicas sync, the merge function walks the entity map, compares timestamps and CRDT types, and produces a deterministic result. The output is the same regardless of which replica syncs first or how many times they sync.

This is the clean version. The version you would find in a paper or a conference talk. The version that fits on a slide. Now let me tell you what actually happens when you build this.

## Clock drift is not a theoretical concern

Every timestamp-based CRDT depends on clocks. The HLC (Hybrid Logical Clock) is the standard answer. It combines physical wall-clock time with a logical counter. When a node generates an event, it takes the maximum of its local wall time and its last known HLC time, increments the counter if the wall time has not advanced, and attaches the result to the event. This preserves causality: if event A caused event B, then `hlc(A) < hlc(B)`. Always.

The HLC algorithm is elegant and well-studied. Kulkarni et al. published it in 2014, and the proof is solid. What the proof does not cover is what happens when your nodes disagree about wall time by thirty seconds.

```
Node A clock:  14:00:00.000
Node B clock:  14:00:30.000  (30s ahead)

Node B writes field X = "foo" at HLC(14:00:30.000, 0)
Node A writes field X = "bar" at HLC(14:00:01.000, 0)

Merge result: X = "foo" (Node B's timestamp wins)
```

Node A's write happened after Node B's in real time, but the HLC says otherwise because Node B's clock is ahead. For an `LwwRegister`, this means Node B "wins" even though Node A wrote last.

In a controlled environment, say, a set of servers in the same data center running NTP with a tight sync, the drift is usually under a millisecond. The HLC handles that gracefully. But Conflux was designed for a world where the writers are not always in the same data center. Laptops. CI runners. Edge nodes. Devices that wake from sleep with a stale clock and take a few seconds to sync.

The practical mitigation is unglamorous. Conflux tracks the maximum observed clock skew across all replicas in a sync session. If the skew exceeds a configurable threshold (default: five seconds), the sync completes but emits a warning. The merge is still deterministic. The HLC guarantees are still intact. But the user needs to know that their "last writer wins" field might not reflect the write they think was last.

I considered alternatives. Vector clocks give you true causality without depending on wall time, but they grow linearly with the number of replicas. For a system with three writers, that is fine. For a system where any number of CI runners, developer laptops, and edge nodes can write, the vector becomes unbounded. Lamport timestamps are compact but give you a total order, not a causal one. You cannot distinguish "A happened before B" from "A and B are concurrent." The HLC is the right tradeoff for Conflux. It is just not a tradeoff you can ignore.

## LWW considered harmful (sometimes)

The `LwwRegister` is the most intuitive CRDT and the most dangerous. Last writer wins. Simple. Except "last" is determined by the timestamp, and as we just discussed, timestamps are only as good as your clock sync.

But even with perfect clocks, LWW has a semantic problem. Two engineers independently change the same config value. Engineer A sets the rate limit to 1000 because she ran a load test and determined that 1000 is the safe threshold. Engineer B sets the rate limit to 500 because he is responding to an incident and needs to throttle traffic immediately. Engineer B's write has a later timestamp. LWW picks 500. In this case, that is the right answer. But it is the right answer by accident, not by design.

Now reverse the scenario. Engineer A is responding to the incident. She sets the rate limit to 500 at 14:00:01. Engineer B, unaware of the incident, sets it to 1000 at 14:00:02 because his load test just finished. LWW picks 1000. The incident response is silently overwritten.

The CRDT did exactly what it promised. It merged without conflict. It converged deterministically. And the result is wrong.

This is the gap between "conflict-free" and "correct." CRDTs eliminate technical conflicts. They do not eliminate semantic conflicts. The papers are precise about this, but the marketing around CRDTs often is not. "No more merge conflicts" is true at the data structure level. It is misleading at the application level.

Conflux addresses this in two ways. First, the schema definition encourages you to choose the right CRDT type for each field. A rate limit that should only decrease during an incident is better modeled as a `MinRegister` than an `LwwRegister`. The merge function for `MinRegister` always picks the lower value, regardless of timestamp. No clock dependency. No ordering ambiguity. The tradeoff is that you cannot raise the rate limit by writing a higher value. You need to reset the field, which is a different operation with different semantics.

Second, Conflux logs every merge decision with the full context: which replicas contributed, what the pre-merge values were, what the HLC timestamps were, and which CRDT rule applied. This audit trail does not prevent semantic conflicts. But it makes them visible. When the rate limit unexpectedly changes, you can trace exactly why.

## Storage grows forever (and you have to deal with it)

CRDTs are monotonic by design. State only grows. A `GrowOnlySet` never shrinks. An `ObservedRemoveSet` tracks removals as tombstones, which are themselves additions to an internal set. Even an `LwwRegister` retains the history of all writes until you explicitly compact it.

In the academic literature, this is a known property, usually handled with a single sentence: "garbage collection is left as an implementation concern." That sentence hides a significant engineering problem.

In Conflux, every entity field stores its full operation history for the current sync epoch. A sync epoch is the interval between two successful full syncs across all replicas. Within an epoch, you need the history to correctly merge concurrent operations from replicas that have not yet synced. After a full sync, you know every replica has seen every operation, and you can safely discard the history and keep only the current value.

The problem is that "after a full sync" is not always well-defined. If you have three replicas and one goes offline for a week, the other two cannot compact. The offline replica might come back with operations that reference history you have already discarded. If you compacted too early, those operations cannot merge correctly.

```
Replica A: [op1, op2, op3, op4, op5]  -- wants to compact
Replica B: [op1, op2, op3, op4, op5]  -- wants to compact
Replica C: [op1, op2] ................ -- offline since op2

Can A and B compact ops 1-5?

No. C will come back with ops that depend
on the state after op2. If A and B have
discarded ops 1-4, they cannot verify that
C's new operations merge correctly with the
intermediate states.
```

Conflux uses a two-phase compaction protocol. First, every active replica reports its sync watermark: the latest operation it has seen and acknowledged from every other replica. Second, the compaction threshold is set to the minimum watermark across all known replicas. Operations below the threshold are safe to compact because every replica has seen them.

This works when all replicas are reachable. When a replica goes permanently offline, the minimum watermark never advances, and storage grows indefinitely. The practical solution is a replica expiry timeout. If a replica has not synced within a configurable window (default: 30 days), it is assumed dead and excluded from the watermark calculation. If it comes back after that window, it must perform a full state transfer rather than an incremental sync.

This is not elegant. It is a policy decision that trades correctness for practicality. The pure CRDT model says "all replicas eventually converge, no matter how long they are offline." The production system says "if you disappear for 30 days, you rejoin from scratch." I have not found a way to avoid this tradeoff.

The storage numbers, for context: a Conflux document with 500 entities, each with 10 fields, averaging 4 operations per field per sync epoch, consumes about 2.4 MB of operation history. After compaction, it drops to about 180 KB (just the current values plus metadata). The 13x reduction is why compaction matters. Without it, a busy document would consume hundreds of megabytes within a few months.

## Schema evolution is the problem nobody warns you about

The papers assume a fixed schema. Entity has fields. Fields have CRDT types. The merge function knows the types at compile time. Everything is clean.

In production, schemas change. You add a field. You remove a field. You change a field from an `LwwRegister` to an `ObservedRemoveSet` because the original type was wrong. Each of these changes interacts with the CRDT merge semantics in ways that are not covered by the standard theory.

Adding a field is the easy case. Replicas that do not know about the new field simply do not have it. When they sync with a replica that does, the new field appears. The merge function treats a missing field as "empty," which is the identity element for the CRDT type. No conflict.

Removing a field is harder. If Replica A removes field X and Replica B writes to field X concurrently, what happens? In Conflux, a field removal is modeled as a tombstone with an HLC timestamp. If B's write has a later timestamp than A's removal, the field reappears. This is the "add wins over concurrent remove" semantic, consistent with the `ObservedRemoveSet` logic. It is also surprising if you are the person who removed the field and expected it to stay removed.

Changing a field's CRDT type is the hardest case. An `LwwRegister<String>` and a `GrowOnlySet<String>` have incompatible merge functions. If Replica A upgrades the schema and Replica B has not yet, their operations for that field are type-incompatible. Conflux handles this by versioning the schema itself. Each field carries a schema version, and the merge function first checks version compatibility. If the versions differ, the higher version wins, and the lower-version value is migrated using a type-specific conversion function. `LwwRegister` to `GrowOnlySet`: the current register value becomes the initial element of the set. `GrowOnlySet` to `LwwRegister`: the set is serialized as the register value. These conversions are lossy. There is no general-purpose lossless migration between arbitrary CRDT types.

The practical lesson: choose your CRDT types carefully at the start. Migrations work, but they are a source of subtle behavior that is hard to reason about during an incident. When I design a new Conflux schema, I spend more time on the type assignments than on the entity structure. The entity structure can evolve freely. The types are commitments.

## The sync protocol

Syncing two Conflux replicas works in three phases:

```
Phase 1: Exchange       Phase 2: Merge         Phase 3: Acknowledge
 
Replica A ──ops──▶     A merges B's ops        A ──ack──▶ B
Replica B ──ops──▶     B merges A's ops        B ──ack──▶ A
                       (deterministic,
                        same result)
```

Phase 1: each replica sends the operations the other has not seen. This is determined by comparing sync vectors, which track the latest operation each replica has received from every other replica. The delta is usually small. A full sync only happens on first contact or after a replica exceeds the expiry window.

Phase 2: each replica independently applies the received operations using the CRDT merge function. Because the merge is associative, commutative, and idempotent, both replicas arrive at the same state regardless of the order operations are processed. This phase requires no coordination. Each replica can merge at its own pace.

Phase 3: each replica acknowledges the sync by updating its sync vector and reporting its new watermark. This is what enables compaction. The acknowledge phase is also where clock skew is detected and reported.

The transport layer is pluggable. Conflux ships with WebSocket and HTTP long-polling transports. The WebSocket transport maintains a persistent connection and pushes operations in real time. The HTTP transport polls at a configurable interval for environments where WebSocket is not available or not desired. The protocol is the same either way. Only the delivery mechanism changes.

For the config management use case that started all of this, the HTTP transport with a 30-second poll interval is sufficient. Config changes are not real-time collaborative edits. A 30-second propagation delay is fine. The important property is that the propagation is automatic, deterministic, and does not require anyone to run `git merge`.

## What about Automerge and Yjs?

A reasonable question: why build a custom CRDT engine when Automerge and Yjs exist?

Automerge is excellent for document-shaped data. It models a document as a JSON-like tree with fine-grained character-level editing, which makes it ideal for collaborative text editing and rich document applications. Yjs is similarly focused on real-time collaboration with a sophisticated encoding format that makes sync payloads tiny.

Conflux solves a different problem. The data model is not a document tree. It is a flat map of entities with typed fields. There is no text editing. There is no rich document structure. There are config values, feature flags, routing rules, and policy definitions. The operations are "set this field to this value," not "insert character at position 47."

The flat entity model makes several things simpler. Merge is O(fields changed), not O(document depth). Schema validation is straightforward because every field has an explicit type. Compaction is per-entity, so you can compact aggressively for stable entities while retaining history for active ones. And the storage backends can use a simple key-value layout rather than a tree-aware structure.

I also needed pluggable storage. Automerge stores its data in a custom binary format that is optimized for document sync but requires Automerge-aware tooling to inspect. Conflux stores operations and state in whatever backend you choose: SQLite for single-node development, PostgreSQL for shared infrastructure, DynamoDB for serverless deployments. You can query the current state with standard SQL. You can back it up with standard database tools. You can inspect it without importing a library.

This is not a criticism of Automerge or Yjs. They are better tools for their target use case. But the target use case matters, and "CRDT" is not a single category of tool. It is a family of data structures with different strengths.

## What I would do differently

Three things.

First, I would have started with fewer CRDT types. Conflux launched with five field types. In practice, 90% of fields use `LwwRegister` or `GrowOnlySet`. The `MinRegister` and `MaxRegister` types have clear use cases, but they are rare enough that I could have added them later. The `ObservedRemoveSet` is the most complex type to implement correctly, and I have fixed more bugs in its tombstone management than in the rest of the engine combined. Fewer types at the start would have meant fewer edge cases, faster development, and a smaller surface area for bugs.

Second, I would have built the compaction protocol earlier. The first version of Conflux stored full history forever, with compaction planned as a "later" optimization. It was not later. Storage growth became a problem within weeks of real use. The compaction protocol was retrofitted, and the retrofit required changes to the sync vector format, the storage schema, and the replica registration model. Building it in from the start would have been significantly less work.

Third, I would have made schema evolution a first-class concept from day one rather than adding it after the first schema migration broke a production sync. The current versioned-schema approach works, but it was designed under pressure. I suspect there are cleaner models, possibly borrowing from database schema migration tools or protocol buffer evolution rules. This is an area I am still iterating on.

## The distance between theory and production

CRDTs work. The mathematical guarantees are real. If your merge function satisfies the three properties, your replicas will converge. This is provably true and practically useful. I am building production systems on these guarantees and I trust them.

But the theory gives you the foundation, not the building. Clocks drift. Storage grows. Schemas change. Replicas go offline and come back with stale state. Users make concurrent writes that are technically conflict-free and semantically contradictory. The merge function handles all of these at the data structure level. At the application level, you still need policies, visibility, and the humility to admit that "conflict-free" does not mean "problem-free."

The config management problem I started with is solved. No more stage branches. No more merge conflicts in YAML files. No more wondering which branch represents truth. Each environment is a Conflux replica. Config changes propagate automatically. The merge is deterministic. The audit trail is complete. Engineers make changes without coordinating, and the system converges.

It took building a CRDT engine from scratch to get there. The papers got me started. The production problems taught me the rest.
