+++
title = "CRDTs in Practice: What the Papers Do Not Tell You"
date = 2026-04-16
draft = true
description = "The guarantees of CRDTs hold. What building Conflux taught me about the rest: clock drift, semantic conflicts, garbage, and schema change."

[taxonomies]
tags = ["distributed-systems", "local-first", "determinism", "reliability", "rust"]

[extra]
author = "Raffael"
in_short = [
  "Managing infrastructure config with one Git branch per environment caused drift, false conflicts and load-bearing merge order, so I built *Conflux*, a schema-aware CRDT engine in Rust, to let many writers merge without conflicts.",
  "The mathematical guarantees hold, but they rest on clocks, and a hybrid logical clock that refuses a timestamp too far in the future quietly gives up part of its causality guarantee.",
  "A merge can be conflict-free and still wrong. Choosing a merge strategy per field, flagging concurrent writes for review, and recording who wrote what with which intent make those cases rarer and visible.",
  "Conflux keeps its whole operation log on purpose, as the audit trail, but CRDT metadata such as tombstones grows too, and collecting it needs causal stability, which needs every replica to be known and alive.",
  "Changing a field's merge strategy is the problem I have not solved; I would build garbage collection and schema migration in from day one, because conflict-free does not mean problem-free.",
  "Zed's editor, its DeltaDB, and GitHub Next's Chopin show where this goes now that agents edit alongside people: CRDT text underneath, every operation kept with its provenance, and decisions recorded apart from the merged prose.",
]
+++

<!--
DRAFT NOTES (remove before publish)
1. Checked 2026-11-21 against conflux at 83b92a8 (v1.0.0, February 2026): six strategies, uhlc 0.9 with its
   default 500 ms max delta, gRPC replication with anti-entropy every 30 s and a 5 s leader heartbeat, append-only
   operation log with snapshots, no garbage collection, no merge-strategy migration.
2. The April draft described a skew threshold of five seconds, a compaction protocol with watermarks and a 30-day
   replica expiry, storage figures (2.4 MB to 180 KB), schema versions with conversion functions, and WebSocket and
   HTTP long-polling transports. None of that is in the code, so the text now describes what is there and calls the
   rest unsolved. If any of it lives in an unpushed branch, restore the passage with the real numbers.
3. The opening describes the branch-per-environment setup at a former workplace in general terms only; keep it that way.
4. Every reference was fetched and checked on 2026-11-21 (papers via HAL, arXiv, Crossref and OpenAlex; Zed and
   GitHub Next pages and the githubnext/chopin README and docs/architecture.md). Quotes are verbatim from those fetches.
5. Not claimed on purpose: post-merge validation and the strategy-change error. Both are fixed in the conflux
   working tree (2026-11-21, uncommitted): FieldState::merge returns MergeError::StrategyMismatch instead of
   panicking, and the HTTP and gRPC write paths run validate_document and report violations in the response
   (reported, not rejected, so replicas still converge). Once that is released, the text may say so; until then
   it describes v1.0.0.
6. Publish date: suggested 2026-12-22 (the next free Tuesday after the drafts on 11-24, 12-01, 12-08, 12-15).
-->

If you have managed infrastructure config across several environments, you know the pattern. A Git repository holds the runtime configuration for your services, with a `dev` branch, a `staging` branch, and a `production` branch, each one the state of a different environment. To promote a change from dev to production, you merge the branch.

This is how we did it at work. Dozens of infrastructure components each had their own runtime config repository. These were declarative state files rather than Terraform or Pulumi projects, and they described what a running system should look like: feature flags, routing rules, rate limits, WAF policies, certificate settings. The running systems read these files and reconciled. The branching model was simple and intuitive, and over time it became a source of constant pain.

## The stage branch problem

The first problem is drift. When `dev` and `production` diverge, which they always do, every merge becomes a negotiation. A value that makes sense in dev can be dangerous in production, and a rate limit tuned for staging traffic means nothing under production load. The branches are not versions of one configuration so much as different configurations that happen to share a history.

The second problem is merge conflicts. When two engineers change the same file on different branches, Git reports a conflict even when they touched different fields, and you end up resolving a conflict in a YAML file that controls production routing.

The third problem is ordering. Git records a linear history, but config changes are not linear. Engineer A changes a rate limit on dev, engineer B changes a feature flag on staging, and the two changes have nothing to do with each other. The branching model still forces you to sequence them, and the merge order becomes load-bearing when it should not matter at all.

The fourth problem is visibility. Production is the truth for production, presumably, but what about the changes sitting on staging that were never promoted? The branch model cannot tell "waiting for review" from "forgotten", and three months later you find a staging branch with fifteen commits whose purpose nobody remembers.

After living with this long enough I stopped seeing bugs in our workflow and started seeing the consequences of using a tool built for versioning source code to manage shared, mutable state. Git is excellent at tracking one lineage of changes. We needed many writers changing shared state at the same time, independently, with merges that cannot conflict, and that is the definition of a CRDT.

## What a CRDT actually is

CRDT stands for conflict-free replicated data type. Marc Shapiro, Nuno Preguiça, Carlos Baquero and Marek Zawirski gave the formal treatment in [2011](https://inria.hal.science/hal-00932836). In the state-based form, the states of a replica form a join semilattice, and merging two states means taking their least upper bound. That makes the merge function:

- **Commutative**: `merge(A, B) = merge(B, A)`. Order does not matter.
- **Associative**: `merge(merge(A, B), C) = merge(A, merge(B, C))`. Grouping does not matter.
- **Idempotent**: `merge(A, A) = A`. Receiving the same state twice changes nothing.

The operation-based form gets to the same place differently: operations that may run concurrently must commute, and the network has to deliver each one exactly once and in causal order.

The intuition is simpler than the lattice. Two people edit the same document on two laptops without a connection. When they reconnect, their changes have to combine into one document without losing either person's work and without a server deciding who wins. With a CRDT, that combination is automatic and deterministic: whatever order the changes arrive in, and however often the same change arrives, every replica ends up in the same state. You can relay updates through any number of nodes, in any order, with any amount of duplication, and they still converge, with no consensus protocol and no leader. The rest of this article is about the details that the convergence proof does not cover.

## Conflux

[Conflux](https://github.com/raskell-io/conflux) is the engine I built for the config problem. It is a daemon and a command-line tool in Rust that replaces Git as the write path for configuration. Humans, CI pipelines, operators and autoscalers submit typed operations, such as setting the `weight` field of the route `api` to 80 with a stated intent, instead of text diffs. The engine merges them deterministically and projects the resolved state to a Git repository from time to time as a milestone, so the history people like to read in Git is still there. Storage is pluggable: SQLite, PostgreSQL, DynamoDB, and an in-memory store for tests.

The core data model is a document: a `HashMap<EntityId, Entity>` in which each entity has a type, an optional parent, and a set of fields. The schema, written in TOML, gives every field a merge strategy, and each strategy is backed by a CRDT:

| Strategy | CRDT | Merge behaviour | Typical use |
|---|---|---|---|
| `lww` | `LwwRegister` | highest timestamp wins, ties broken by actor | names, images, URLs |
| `max` | `MaxRegister` | higher value wins | replica counts, version counters |
| `min` | `MinRegister` | lower value wins | timeouts, limits that may only tighten |
| `grow` | `GrowOnlySet` | union, nothing is ever removed | tags, immutable references |
| `set` | `ObservedRemoveSet` | add and remove, a concurrent add wins | ports, member lists |
| `review` | `ReviewRegister` | last writer wins, concurrent writes flagged for a human | anything where a silent winner is unacceptable |

Every write carries a hybrid logical clock timestamp. Environments live in the data as overlays: staging and development inherit from production, and promoting a change is one more operation.

## Clock drift is not a theoretical concern

Every timestamp-based CRDT depends on clocks, and the usual answer is the hybrid logical clock that Sandeep Kulkarni, Murat Demirbas and colleagues [published in 2014](https://cse.buffalo.edu/tech-reports/2014-04.pdf). It combines wall-clock time with a logical counter. When a node creates an event, it takes the larger of its wall time and the highest timestamp it has seen, and bumps the counter if the wall time has not moved. When it receives a message, it does the same with the incoming timestamp. The result keeps the property that matters: if event *e* happened before event *f*, then *e*'s timestamp is smaller than *f*'s, and the timestamps stay close to physical time.

Conflux uses the Rust crate [uhlc](https://github.com/atolab/uhlc-rs) for its clocks. What the paper does not cover is what happens when two nodes disagree about wall time by thirty seconds:

```
Node A wall clock:  14:00:00.000
Node B wall clock:  14:00:30.000   (30 s ahead)

Node B writes route.api.weight = 50  at HLC 14:00:30.000
Node A writes route.api.weight = 80  at HLC 14:00:01.000   (one second later, in real time)

Merge result for an lww field: 50
```

Node A wrote last in real time, but node B's clock is ahead, so node B wins. That is the correct outcome by the rules of a last-writer-wins register, because the two writes were concurrent: neither node had seen the other's write. It is still not what the operator at node A expected.

The more interesting case is the one where A *has* seen B's write. A hybrid logical clock should then advance A's clock past B's timestamp, so A's next write wins. uhlc refuses to do that when the incoming timestamp is more than its maximum delta ahead of local time, 500 milliseconds by default, because a timestamp that far in the future may come from a broken clock, and accepting it would drag every clock in the cluster forward. Conflux logs a warning, applies the operation anyway, and leaves its clock where it was. The write is safe and the state still converges, but A's next write can carry a smaller timestamp than a write it has already seen. The causality guarantee holds only within the delta.

I think that is the right default. A clock that any peer can push thirty seconds into the future is a worse failure than a register that occasionally prefers the write with the earlier wall time. But the guarantee comes with a footnote, and the footnote is about NTP, not about the algorithm. Inside one data centre with tight clock synchronisation, the skew is far below the delta and the footnote never matters. Across laptops running the CLI against a local store, CI runners and nodes in other regions, it does.

The alternatives have their own costs. Vector clocks track causality exactly, without wall time, but grow with the number of participants. Lamport timestamps are compact and consistent with causality, but they cannot tell you whether two events were concurrent, and they have nothing to do with the time an operator sees on a dashboard. Conflux uses both ideas where they fit: hybrid logical clocks on every operation, and version vectors between replication nodes, of which there are few, so the vectors stay small. The many actors that write are not replicas and never appear in a vector.

## Last writer wins, considered harmful (sometimes)

The last-writer-wins register is the most intuitive CRDT and the most dangerous, because "last" means the highest timestamp, and timestamps are only as good as the clocks behind them. But even with perfect clocks, it has a semantic problem.

Two engineers change the same rate limit. One sets it to 1000 because a load test showed that 1000 is safe. The other sets it to 500 because an incident is in progress and traffic needs throttling now. If the incident response has the later timestamp, the register picks 500, which is right, but right by accident. Reverse the timing, so the load-test result lands one second after the incident response, and the register picks 1000. The incident response is silently overwritten. The CRDT did exactly what it promised: it merged without conflict and converged deterministically, and the result is wrong.

That is the gap between conflict-free and correct. CRDTs remove technical conflicts; they do not remove semantic ones. The papers are precise about this, and the way CRDTs are often sold is not: "no more merge conflicts" is true for the data structure and misleading for the application. Conflux narrows the gap in three ways.

**Choose the strategy per field.** A limit that should only tighten during an incident fits a `min` field better than an `lww` field: the lower value always wins, regardless of timestamps, so there is no clock dependency at all. The price is that the field can only go down. Raising it again takes a deliberate change outside the merge rule, which is the point, but it is a different operation with different semantics, and the schema has to say so.

**Flag concurrent writes for review.** A `review` field picks a winner by timestamp, like `lww`, but when two different actors wrote two different values it marks the field as needing review. `conflux conflicts` lists those fields, and `conflux resolve` records a person's choice as an operation of its own. The detection is deliberately coarse: it flags any two writes from different actors with different values, including some that were not truly concurrent, because for these fields a needless question costs less than a silent winner.

**Keep the evidence.** Every operation is appended to a log with its actor, its timestamp, and the intent the writer gave, and `conflux blame` shows who last changed each field. That does not prevent a semantic conflict, but when the rate limit changes unexpectedly, you can see exactly which write won and why.

## Storage grows, and that is half on purpose

CRDTs are monotonic by design: state only grows. A `GrowOnlySet` never shrinks. An `ObservedRemoveSet` does not delete an element; it records the tags of the element's additions as removed, in a set of tombstones that is itself only ever added to. Conflux removes entities the same way, with a tombstone flag that is merged as a last-writer-wins register, because a replica that has not yet heard of the removal could otherwise bring the entity back.

Conflux also keeps every operation it has ever accepted, and that part is on purpose. The operation log is the audit trail: who changed what, when, and with which intent, signed where the actor has a key. Snapshots make it fast to rebuild the current state without replaying the whole log, and milestones mark the points that were projected to Git. I do not want to throw that history away, and for config, which changes slowly, the log stays small enough that I have not needed to.

The tombstones are a different matter. They are not history anyone reads; they are metadata the merge needs, and only for as long as an operation concurrent with the removal might still arrive. Shapiro and his colleagues give this problem its own section in their [comprehensive study](https://inria.hal.science/inria-00555588), observing that CRDTs *"tend to become inefficient over time, as tombstones accumulate"*. Their condition for discarding such metadata is stability: an update is stable at a replica once every update concurrent with it has been delivered there. And they name the catch: *"Liveness of Φ requires that the set of replicas be known and that they not crash permanently (undetectably)."* Carlos Baquero, Paulo Sérgio Almeida and Ali Shoker build on the same idea with [causal stability](https://repositorio.inesctec.pt/server/api/core/bitstreams/b3895e16-abb3-4e21-b7e7-265d405660cf/content) in their 2014 pure operation-based framework, where operations live in a log only until they are causally stable and can be folded into the state.

In practice that means one question: do you know every replica, and will each of them come back? Conflux's replication nodes are configured, so the set is known, and the version vectors they already exchange are the information a stability check needs. What is missing is a policy for the node that never comes back. Wait forever, and the tombstones are never collected. Give up on it after some time, and a node that returns after that time has to be rebuilt from a snapshot rather than synced incrementally. Every system I have read about makes that trade somewhere, and Conflux has not made it yet.

## Schema evolution is the problem nobody warns you about

The papers assume a fixed schema: entities have fields, fields have types, and the merge function knows the types. In production, schemas change, and every kind of change meets the merge rules differently.

Adding a field is the easy case. Entities that have never seen it simply do not have it, and the first write creates it. The catch is the transition: a node still running the old schema rejects an operation for a field it does not know, so the schema has to reach every node before anyone writes to the new field.

Removing a field from the schema is quieter than it sounds. New writes to it are rejected, but the values already stored stay where they are, and nothing in the merge removes them.

Changing a field's merge strategy is the hard case, and the one I have not solved. An `lww` register and a grow-only set have different merge functions, and there is no merge of one with the other. Today Conflux treats the strategy of a field with existing state as a commitment: changing it on a live document is not supported, and the safe path is a new field and a migration by hand. Geoffrey Litt, Peter van Hardenberg and Orion Henry's [Project Cambria](https://www.inkandswitch.com/cambria/) at Ink & Switch is the most promising approach I know: bidirectional lenses that translate data between schema versions on demand, so old and new writers can keep working on the same document. Translating values is the easier half. Translating the merge metadata, so that a register's history becomes a sensible set, is the part I have not seen solved in general.

The practical lesson is to choose merge strategies with care from the start. When I design a Conflux schema now, I spend more time on the strategy of each field than on the shape of the entities. The entities can evolve; the strategies are commitments.

## How nodes stay in sync

The merge needs no coordination, but a cluster still needs a protocol to move operations around. Conflux nodes replicate over gRPC in three ways:

```
            broadcast: every accepted operation goes to every peer
  Node A  ─────────────────────────────────────────────▶  Node B
          ◀─────────────────────────────────────────────
            anti-entropy, every 30 s: compare version vectors,
            send the operations the other side is missing

  Leader election (heartbeat every 5 s): one node projects milestones to Git
```

Broadcast is the fast path: an operation one node accepts goes straight to the others. Anti-entropy is the safety net: every thirty seconds by default, each node compares version vectors with its peers and fills any gap, so a node that missed a broadcast during a network partition catches up without anyone noticing. Because the merge is commutative, associative and idempotent, it does not matter that broadcast and anti-entropy sometimes deliver the same operation twice, or in a different order.

Leader election is the part that surprised me. Merging state needs no leader, but writing milestones to a Git repository does, because two nodes committing the same milestone would produce exactly the kind of history Conflux was built to avoid. So the cluster elects one node, by heartbeat, to do the one job that cannot be done concurrently. The CRDT removes coordination from the write path, not from the system.

Clients reach a node over a REST API, gRPC streams for watchers, or webhooks. For the config use case that started all of this, a propagation delay of seconds is fine; config is not a real-time collaborative text. What matters is that propagation is automatic and deterministic, and that nobody has to run `git merge`.

## What about Automerge and Yjs?

A fair question is why I built a CRDT engine at all when [Automerge](https://automerge.org/docs/hello/) and [Yjs](https://docs.yjs.dev/) exist. I use Automerge myself, in [Kurumi](https://kurumi.raskell.io), where the data really is a set of documents.

Automerge descends from the JSON CRDT that Martin Kleppmann and Alastair Beresford [described in 2017](https://arxiv.org/abs/1608.03960): a document is a JSON-like tree of maps, lists, counters and text, and concurrent edits anywhere in it merge automatically. Yjs, which Petru Nicolaescu, Kevin Jahns and colleagues [presented in 2016](https://doi.org/10.1145/2957276.2957310), exposes its CRDT as shared types, maps, arrays and text, built for real-time collaborative editors. Both are local-first in the sense of the [Ink & Switch essay](https://www.inkandswitch.com/essay/local-first/) by Kleppmann, Adam Wiggins, Peter van Hardenberg and Mark McGranaghan: the data lives on your device first, and the server is optional.

Conflux solves a narrower problem. Its data is a set of entities with typed fields, with no document tree and no text in it, and its operations are "set this field to this value", not "insert a character at position 47". That makes several things simpler. The merge strategy is declared per field, so the schema says how each value behaves under concurrency instead of every field inheriting the same rule. Validation is straightforward because every field has an explicit type. And the storage backends can keep operations, snapshots and milestones as ordinary rows. Automerge's repository stores documents as binary changes and [compacted snapshots](https://automerge.org/docs/reference/under-the-hood/storage/) under keys of a key-value store, which is efficient and needs Automerge to read. Conflux's state can be queried with SQL and backed up with the database's own tools.

Automerge and Yjs are better tools for collaborative documents, and I would not use Conflux for one. "CRDT" names a family of data structures with different strengths, and the target use case decides which one you want.

## Agents in the document

Since the first version of this article, the question has changed. CRDTs used to be the machinery behind people editing together. Now some of the other writers are agents, and they write faster than any of us. Three projects show where that leads, and each of them meets the problems above in its own way.

[Zed](https://zed.dev/) is the evidence that a CRDT holds up inside a production editor. In [How CRDTs make multiplayer text editing part of Zed's DNA](https://zed.dev/blog/crdts) (2022), Nathan Sobo explains why Zed chose CRDTs over operational transformation: instead of transforming concurrent operations, *"we structure our data so that concurrent operations are inherently commutative"*. Every insertion gets an identifier made of a replica id and a sequence number, deletions hide text behind tombstones instead of removing it, and concurrent insertions at the same place are ordered by Lamport timestamps. Two details stood out to me after building Conflux. Zed's ordering needs no wall clock at all, so the drift problem from earlier does not arise for its text. And replica ids are assigned centrally, so the set of replicas is known, which is exactly the precondition that stability, and with it garbage collection, depends on.

DeltaDB carries the idea up into version control. Sobo's [post introducing it](https://zed.dev/blog/introducing-deltadb) in June 2026 says: *"Where Git captures a snapshot at each commit, DeltaDB captures every operation in between and gives each one a stable identity."* It also says that *"DeltaDB embeds conflict-free replicated worktrees"*, so that *"many people and agents can edit the same files at once across different machines"*, and that *"A message and the edit it produced are recorded side by side, so neither drifts away from the other."* The [public beta announcement](https://zed.dev/blog/delta-public-beta) adds that *"A commit remains the checkpoint you push, pull, and build from. DeltaDB retains the work between those checkpoints."* I wrote about that premise in [The conversation is the workspace](/notes/the-conversation-is-the-workspace/) and planned a small trial in [Testing DeltaDB](/notes/testing-deltadb/). I have not run it yet, so what follows is a reading of the design, not a result.

Read next to Conflux, DeltaDB makes the opposite trade to compaction. A CRDT system usually wants to fold old operations into state and forget them. DeltaDB's premise is that the operations are the product: every edit addressable, and tied to the conversation that produced it. Conflux keeps its operation log for a smaller version of the same reason, as evidence of who changed what and with which intent; DeltaDB keeps the whole conversation as the intent. That is also the best answer I know to the semantic conflict. When a merge is conflict-free and wrong, the first question is who wrote the value that won, and why, and provenance answers it. The posts I read do not say what DeltaDB does over years with the metadata a replicated text accumulates, the tombstones of every deleted line, and that is what I would ask first.

[Chopin](https://githubnext.com/projects/chopin/), the GitHub Next prototype Krzysztof Cieślak showed at [Agentic Engineering Days Zurich](/articles/agentic-engineering-days-zurich-2026/), is the planning side. Its project page describes *"a real-time, multiplayer planning environment"* in which *"agents editing the plan should behave like other users editing the plan."* Its [open source repository](https://github.com/githubnext/chopin) shows the machinery. A document is *"represented as restricted MDX, Lexical, and Yjs"*, and the server keeps *"complete Yjs checkpoints and the accepted update journal after each checkpoint"*: checkpoint plus journal, the same compromise between keeping history and keeping it small. Two of its design choices read like answers to the lessons in this article. A Yjs epoch *"Identifies one collaborative history. Rebuild or replacement creates a new epoch so clients discard incompatible updates."* That is a blunt and honest way to handle a change the merge cannot express: start a new history instead of pretending to merge across it. And decisions are kept out of the merged text: *"Question answers and accepted comments live in attributed records separate from the prose they produced. Later edits cannot silently overwrite what the team decided."* That is my rate-limit problem, solved at the right level. The prose may converge however the CRDT likes, but a decision is not a value that a later write can win against.

My view is that agents make the semantic conflict worse in a specific way. A person who overwrites a colleague's change usually notices; an agent making a hundred edits a minute does not, and the CRDT merges every one of them without complaint. Convergence becomes cheap, and correctness becomes the thing to protect. I expect the systems that last to look like these three put together: a CRDT underneath for the text, operations kept with their identity and provenance above it, and a separate, attributed record of decisions that no merge rule may override. Conflux's review fields and operation log are a small version of the last two, and I would make them more central if I started again.

## What I would do differently

I would build garbage collection in from the first day, together with the replica policy it depends on. Deciding late what happens to a node that disappears means deciding it under pressure, and the decision touches the replication protocol, the store, and the way a node rejoins.

Schema migration belongs in the engine, not in its users' runbooks. The day you need to change a field's merge strategy is the day you discover there is no merge between strategies, and a lens layer in the spirit of Cambria is far easier to design before the first production document exists.

The clock policy should be explicit in configuration. A 500 millisecond delta is a reasonable default for a data centre and a tight one for a fleet of laptops, and an operator should choose it knowingly, with a metric for how often it is exceeded.

Last, the review register's concurrency detection should rest on real causal information. The version vectors are already there; using them would flag exactly the writes that were concurrent, rather than every pair from different actors.

## The distance between theory and production

CRDTs work. If your merge function is the least upper bound of a semilattice, your replicas converge; that is provably true and practically useful, and I trust it. But the theory gives you the foundation, not the building. Clocks drift and the clock protects itself by giving up a little causality. Users make concurrent writes that are conflict-free and contradictory. Metadata accumulates, and collecting it needs a decision about replicas that will never return. Schemas change, and merge strategies do not convert into each other. The merge handles all of it at the level of the data structure. At the level of the application you still need policies, visibility, and the humility to accept that conflict-free does not mean problem-free. As with [every layer](/notes/every-layer-moves-the-uncertainty/), the uncertainty does not disappear; it moves to where you can see it.

In Conflux there are no stage branches and no merge conflicts in YAML files, and nobody has to wonder which branch is the truth. Each environment is an overlay on one document, changes propagate on their own, and every write is in the log with the name of whoever made it. The papers got me started; the problems they leave out taught me the rest.

## References

- Marc Shapiro, Nuno Preguiça, Carlos Baquero, and Marek Zawirski, [Conflict-free Replicated Data Types](https://inria.hal.science/hal-00932836), SSS 2011 (Stabilization, Safety, and Security of Distributed Systems), LNCS 6976, 2011.
- Marc Shapiro, Nuno Preguiça, Carlos Baquero, and Marek Zawirski, [A comprehensive study of Convergent and Commutative Replicated Data Types](https://inria.hal.science/inria-00555588), Inria Research Report RR-7506, 2011.
- Sandeep Kulkarni, Murat Demirbas, Deepak Madappa, Bharadwaj Avva, and Marcelo Leone, [Logical Physical Clocks and Consistent Snapshots in Globally Distributed Databases](https://cse.buffalo.edu/tech-reports/2014-04.pdf), University at Buffalo technical report 2014-04; published as Logical Physical Clocks, OPODIS 2014, LNCS 8878.
- Leslie Lamport, [Time, Clocks, and the Ordering of Events in a Distributed System](https://lamport.azurewebsites.net/pubs/time-clocks.pdf), Communications of the ACM 21(7), 1978.
- Carlos Baquero, Paulo Sérgio Almeida, and Ali Shoker, [Making Operation-based CRDTs Operation-based](https://repositorio.inesctec.pt/server/api/core/bitstreams/b3895e16-abb3-4e21-b7e7-265d405660cf/content), DAIS 2014 (Distributed Applications and Interoperable Systems), LNCS 8460, 2014.
- Martin Kleppmann and Alastair R. Beresford, [A Conflict-Free Replicated JSON Datatype](https://arxiv.org/abs/1608.03960), IEEE Transactions on Parallel and Distributed Systems, 2017; arXiv:1608.03960.
- Petru Nicolaescu, Kevin Jahns, Michael Derntl, and Ralf Klamma, [Near Real-Time Peer-to-Peer Shared Editing on Extensible Data Types](https://doi.org/10.1145/2957276.2957310), GROUP 2016.
- Martin Kleppmann, Adam Wiggins, Peter van Hardenberg, and Mark McGranaghan, [Local-first software: You own your data, in spite of the cloud](https://www.inkandswitch.com/essay/local-first/), Ink & Switch, 2019.
- Geoffrey Litt, Peter van Hardenberg, and Orion Henry, [Project Cambria: Translate your data with lenses](https://www.inkandswitch.com/cambria/), Ink & Switch, 2020.
- [Automerge documentation](https://automerge.org/docs/hello/), including [Storage](https://automerge.org/docs/reference/under-the-hood/storage/).
- [Yjs documentation](https://docs.yjs.dev/).
- [uhlc](https://github.com/atolab/uhlc-rs), a hybrid logical clock for Rust, with a default maximum delta of 500 ms.
- Nathan Sobo, [How CRDTs make multiplayer text editing part of Zed's DNA](https://zed.dev/blog/crdts), Zed blog, December 1, 2022.
- Nathan Sobo, [Software Is Made Between Commits](https://zed.dev/blog/introducing-deltadb), Zed blog, June 11, 2026, introducing DeltaDB.
- Nathan Sobo, [Introducing Delta](https://zed.dev/blog/introducing-delta), Zed blog, August 12, 2026.
- Nathan Sobo, [Replace PRs with Delta: Now in Public Beta](https://zed.dev/blog/delta-public-beta), Zed blog, September 16, 2026.
- Krzysztof Cieślak and Maggie Appleton, [Chopin: A real-time multiplayer, agentic planning environment](https://githubnext.com/projects/chopin/), GitHub Next, September 2026; source and [architecture notes](https://github.com/githubnext/chopin/blob/main/docs/architecture.md) at [githubnext/chopin](https://github.com/githubnext/chopin).
- [Conflux](https://github.com/raskell-io/conflux), the engine described here.
