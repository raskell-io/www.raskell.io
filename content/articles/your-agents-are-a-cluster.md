+++
title = "Your Agents Are a Cluster"
date = 2026-12-15
draft = true
description = "Multi-agent systems fail the way distributed systems fail: stale context, split decisions, false reports. The fixes are decades old."

[taxonomies]
tags = ["agents", "distributed-systems", "agent-harness", "reliability", "ai-platforms", "ai-engineering"]

[extra]
author = "Raffael"
in_short = [
  "In April I called agent coordination a management problem. That was half of it: management says who decides, and distributed systems says what each agent can know when it decides.",
  "Three sources from 2025, Cognition's Don't Build Multi-Agents, Anthropic's account of its research system, and the MAST failure study from Berkeley, describe the same failures from three directions, and every one of them already has a name in distributed systems.",
  "An agent's context is a cache of the world at the moment it read it, so the classic failures follow: stale reads, lost updates, split decisions, and work done twice.",
  "The fixes are old too: one writer per piece of state, a single decider for contested choices, reports checked against the artefact instead of trusted, and messages that are typed, few, and paid for.",
  "The first rule of distributed systems applies as well: do not distribute what you do not have to. Spread reading across many agents and keep writing in one thread.",
]
+++

<!--
DRAFT NOTES (remove before publish)
1. Reread against "What Sixteen AI Agents Taught Me About Management" so the two read as a pair, not a correction.
2. Quotes checked 2026-11-21: Cognition, Anthropic, MAST (abstract and HTML v3), Lamport's 1987 email,
   Fowler's 2014 article, the Wikipedia page on the fallacies.
3. The ChatDev +9.4% figure is from the MAST paper's introduction; the paper does not name a venue, so cite
   the arXiv id only.
4. On release day: link back from what-sixteen-ai-agents-taught-me-about-management and
   board-games-already-solved-agent-coordination; Korean and Chinese translations; hero prompt.
-->

In April I wrote about [the week I ran sixteen AI agents in parallel](/articles/what-sixteen-ai-agents-taught-me-about-management/) and concluded that managing them is a management problem, not a technical one. I still believe that. But I have come to think it was half of the answer.

Management tells you who decides. It gives you roles, leads, escalation paths, and a budget. What it does not tell you is what each of those agents can *know* at the moment it decides, and almost every failure I saw that week came from there. Agent A refactored the authentication module while agent B wrote tests against the old one. Agent C chose REST for a new API while agent D generated gRPC stubs for it. Nobody was disobedient and nobody was stupid. They were working from different pictures of the same codebase, and the pictures disagreed.

That kind of failure has a name, and a literature, and about fifty years of fixes. It is the central problem of distributed systems. Sixteen agents working on one repository are not a team of employees so much as a cluster of nodes that share state over an unreliable channel. Once I started reading my own traces that way, most of the problems stopped looking new.

## Three reports, one diagnosis

I am not the only one who got here. In 2025, three very different sources described the failures of multi-agent systems, and read side by side they say the same thing.

Walden Yan at Cognition, the company behind Devin, wrote [Don't Build Multi-Agents](https://cognition.com/blog/dont-build-multi-agents) in June 2025. His example is a Flappy Bird clone split between two subagents: one builds the background with the pipes, the other builds the bird. One of them produces a background that looks like Super Mario Bros.; the other a bird that moves nothing like the one in Flappy Bird. Even when both get the full task, the results do not fit, because, in his words, *"The actions subagent 1 took and the actions subagent 2 took were based on conflicting assumptions not prescribed upfront."* He boils it down to two principles: *"Share context, and share full agent traces, not just individual messages"*, and *"Actions carry implicit decisions, and conflicting decisions carry bad results."*

A day later, Anthropic published [How we built our multi-agent research system](https://www.anthropic.com/engineering/multi-agent-research-system). It is the success story: a lead agent with parallel subagents beat a single agent by 90.2% on Anthropic's internal research eval. But it is candid about the costs and the limits. Multi-agent systems *"use about 15× more tokens than chats."* Without detailed task descriptions, *"agents duplicate work, leave gaps, or fail to find necessary information."* And the fit is narrow: *"some domains that require all agents to share the same context or involve many dependencies between agents are not a good fit for multi-agent systems today"*, which includes most coding, since *"most coding tasks involve fewer truly parallelizable tasks than research."*

The third is a study. In [Why Do Multi-Agent LLM Systems Fail?](https://arxiv.org/abs/2503.13657), Mert Cemri and twelve colleagues at Berkeley annotated 1,642 execution traces from seven open-source multi-agent frameworks and sorted what went wrong into a taxonomy they call MAST: fourteen failure modes in three groups, system design issues, inter-agent misalignment, and task verification. Failure rates ran from 41% to 86.7%. Their conclusion is the one that matters here: the failures *"often stem from system design issues, not just LLM limitations."*

A startup that advises against the architecture, a lab that ships it, and a research group that measured it. All three put the failures in the space between the agents, not inside them.

## The same failures, older names

Each of them has had a name in distributed systems for decades. If you want one book that covers all of them, it is Martin Kleppmann's [Designing Data-Intensive Applications](https://dataintensive.net/), whose chapters on replication, transactions, and consistency read today like a field guide to multi-agent bugs.

| What the agents did | Where I saw it | The name it already has |
|---|---|---|
| Wrote tests against an API another agent had just changed | my sixteen agents | a stale read |
| Overwrote another agent's change to the same file | my sixteen agents | a lost update |
| Chose REST and gRPC for the same API, in parallel | my sixteen agents, Cognition's bird and background | split brain: two nodes decide without consensus |
| Investigated the same question three times | Anthropic's chip crisis example | no partitioning of the work |
| Restarted a conversation and forgot what was agreed | MAST, conversation reset | a node restart that loses volatile state |
| Did not pass on what another agent needed to know | MAST, information withholding | a message that was never sent |
| Reported a task as done that was not | MAST, incorrect and incomplete verification | a faulty node whose reports cannot be trusted |
| Waited for the slowest subagent before anything moved | Anthropic, synchronous subagents | a barrier, and tail latency |
| Spent the budget on status updates and clarifications | my sixteen agents, Anthropic's *"excessive updates"* | a chatty protocol |

None of these are exotic. They are the first chapter of any book on distributed systems. What is new is only the node: a process that reads natural language, writes natural language, and is confident either way.

## The fallacies, again

In 1994, L Peter Deutsch and others at Sun Microsystems wrote down seven assumptions that every engineer new to distributed systems makes and later regrets, and around 1997 James Gosling added an eighth. They are known as the [fallacies of distributed computing](https://en.wikipedia.org/wiki/Fallacies_of_distributed_computing), and they read as if they had been written for agent builders:

1. **The network is reliable.** The agent is reliable. It is not: it stops halfway, loops, or declares victory early. MAST has a failure mode called *unaware of stopping conditions*.
2. **Latency is zero.** Every message between agents is a model call, seconds long, and a chain of them is minutes.
3. **Bandwidth is infinite.** The context window is not. Cognition's first principle, share full traces, runs straight into it, which is why the same post ends up proposing a model whose only job is to compress history.
4. **The network is secure.** Agent-to-agent messages are untrusted input. A subagent that read a poisoned web page passes the poison on as a finding, which is why [Beurer-Kellner and others](https://arxiv.org/abs/2506.08837) treat the boundary between agents as a place for the same isolation patterns as any tool output.
5. **Topology does not change.** Agents are spawned and discarded mid-task, and the orchestrator's picture of who is working on what goes out of date.
6. **There is one administrator.** Different agents run under different instructions, tools, and permissions, sometimes from different vendors.
7. **Transport cost is zero.** Every token between agents is paid for. This is the one that ended my experiment in April.
8. **The network is homogeneous.** One agent runs a frontier model, another a small one, a third a different provider, and they do not read the same message the same way.

The original list was a warning to people who treated remote calls like local ones. The agent version is a warning to people who treat a second agent like a second pair of hands.

## Context is a cache

The idea that changed how I read my traces is simple: an agent's context is a cache. It is a copy of the world as it was when the agent read it, and nothing invalidates it when the world changes.

A human engineer has the same problem but is constantly, cheaply refreshed. You overhear a conversation, you see a commit in the channel, you notice the file you are editing changed on main. An agent gets none of that. It read the authentication module at nine o'clock, and at ten it is still writing tests for the module it remembers.

Leslie Lamport's [Time, Clocks, and the Ordering of Events in a Distributed System](https://lamport.azurewebsites.net/pubs/time-clocks.pdf) (1978) gives the precise version. What matters is not when something happened by the clock but whether one event *could have influenced* another, his *happened before* relation. Agent B's tests are wrong because they do not causally follow agent A's change: B acted without having seen it. Read Cognition's two principles with Lamport in mind and they become one rule. *Share full traces* means: make sure every agent has seen the events its work depends on. *Actions carry implicit decisions* means: every write is an event that later work must follow, or it will conflict.

There are two classic ways to honour that rule. You can give everyone the same log and let them read it in order, which is what Cognition recommends: one agent, one continuous context. Or you can divide the state so that no two agents depend on the same part of it, and then their caches cannot disagree about anything that matters. Both are good. What does not work is the default most frameworks give you: several agents, a shared repository, and a chat channel between them, hoping that talking keeps their caches in sync.

## Pick one writer

Most of the fixes come down to who is allowed to write what.

**One owner per piece of state.** The cheapest consistency protocol is not to need one. Give each agent a part of the codebase it alone may change, a module, a directory, a service, and let others read but not write it. This is what [worker placement](/notes/board-games-already-solved-agent-coordination/) does in a board game: one worker per action space, and if you wanted that space, you should have gone first. It is also why agents coordinating through shared state with clear ownership are easier to reason about than agents that message each other.

**Optimistic concurrency where ownership is impossible.** When two agents must touch the same code, let them work on branches and merge, and let the merge fail loudly. A merge with a conflict is a compare-and-swap that did not succeed, and the right response is the one databases use: read the new state, redo the work, try again. The harness has to do this, not the agent's good intentions.

**One decider for contested choices.** REST or gRPC is not a question that two agents should both answer. Consensus algorithms such as [Raft](https://raft.github.io/raft.pdf) make it tractable by electing a single leader that decides and replicating what it decided. The agent equivalent is the escalation path from my April post: a decision that crosses an ownership boundary goes to one place. The MAST authors report the same effect from the other side. In ChatDev, a change that gave the CEO agent the final say raised task success by 9.4%.

**Leases, not locks forever.** Agents die without cleaning up. Anything an agent reserves, a file, a ticket, the single deploy slot, should be reserved for a limited time and released automatically, so a stalled agent does not hold the cluster hostage.

## Make failure boring

*"A distributed system is one in which the failure of a computer you didn't even know existed can render your own computer unusable,"* Leslie Lamport wrote in [an email in May 1987](https://lamport.azurewebsites.net/pubs/distributed-system.txt). Agents bring a variant: an agent you did trust can tell you it worked when it did not. Deutsch saw this one coming too. In 2021 he added a ninth fallacy to his list: *"The party you are communicating with is trustworthy."*

That is not malice, and it is not quite a [Byzantine fault](https://lamport.azurewebsites.net/pubs/byz.pdf) in the formal sense, but the defence is the same: do not act on a single unverified report. An agent saying "the tests pass" is a claim; the harness running the tests is evidence. MAST gives verification its own category for a reason. The cheapest reliable check is almost always against the artefact: the build, the diff, the test output, the HTTP response, never against the agent's summary of them. That is the job of [evaluation](/articles/evaluation-closes-the-loop/), and in a multi-agent system it has to happen between every handover, not only at the end.

Partial failure needs the old tools as well. Steps should be idempotent, so retrying an agent's work after a crash does not do it twice. A run should keep a journal, so a restart resumes instead of resetting, which removes MAST's *conversation reset* by construction. And a change that spans several systems, a ticket, a branch, a deployment, needs what Hector Garcia-Molina and Kenneth Salem called a [saga](https://www.cs.cornell.edu/andru/cs711/2002fa/reading/sagas.pdf) in 1987: a sequence of steps, each with a compensating step that undoes it, so a run that fails halfway can be unwound instead of left half done.

## Budget the protocol

The lesson that cost me the most in April was that agents talking to each other is the expensive part. Anthropic's figure of about fifteen times the tokens of a chat matches what I saw. Distributed systems learned the same lesson about network round trips and answered it with protocol design, and the answers carry over.

- **Typed messages.** A message between agents should have a schema: a decision, its scope, whether it needs approval. Free text invites a reply, and a reply invites another one.
- **Fewer round trips.** Give a subagent everything it needs up front, as Anthropic's guidance says: *"an objective, an output format, guidance on the tools and sources to use, and clear task boundaries."* A good task description is a batched request.
- **No acknowledgements for their own sake.** Status updates nobody reads are the agent version of a chatty protocol. If the harness can see progress in the log, no agent needs to announce it.
- **Backpressure.** An orchestrator that can spawn fifty subagents for a simple question, which Anthropic reports its early versions did, needs a limit the same way a server needs a bounded queue.

## Do not distribute what you do not have to

In *Patterns of Enterprise Application Architecture*, Martin Fowler called it [the First Law of Distributed Object Design](https://martinfowler.com/articles/distributed-objects-microservices.html): *"don't distribute your objects."* It has aged well because it is the honest answer: distribution buys you capacity and costs you consistency, and you should only pay when you need the capacity.

The same holds for agents, and the three reports agree on where the line is. Research, search, and review are reads: many agents can explore many directions at once, and their findings combine without conflicting. That is where Anthropic's system shines. Writing code is writes: every change constrains the next one, and agents working in parallel step on each other. That is where Cognition says to keep one thread.

Databases settled this long ago. Reads scale out to replicas; writes go through one primary. My advice for agents is the same.

{% diagram(title="Fan out the reading, keep the writing in one thread") %}
                 +-------------------------------+
                 |  writer: one agent, one log    |
                 |  owns the branch, makes every  |
                 |  change, has read every report |
                 +---------------+---------------+
                                 ^
               typed findings,   |   no writes, no
               one message each  |   chatter between them
       +-----------+-------------+-------------+-----------+
       |           |             |             |           |
  +----+----+ +----+----+  +-----+-----+ +-----+----+ +----+----+
  | search  | | read    |  | review    | | check    | | read    |
  | the code| | tickets |  | the diff  | | the docs | | the logs|
  +---------+ +---------+  +-----------+ +----------+ +---------+
       readers: many, parallel, disposable, read-only
{% end %}
 Fan out the reading: let ten agents search the codebase, read the tickets, review the diff, and check the documentation. Keep the writing in one thread that has seen all of it. When the work is too big for one thread, partition it so the writers do not share state, and give the boundaries an owner.

## What changes for platforms

For anyone building an agent platform inside an organisation, I think this changes who you need in the room. The people who know how to make agent coordination work are not mainly the people who write good prompts. They are the people who have run a cluster, debugged a split brain at three in the morning, and know why the retry needs an idempotency key. The vocabulary already exists. So do the patterns, the failure modes, and the tests.

In April I wrote that agent orchestration is organisational design, and that good managers already have the skills it needs. I would now add the other half. Management decides who may act. Distributed systems decides what each actor can know when it acts. A multi-agent system needs both, and only the second one is written down in fifty years of papers we can simply read.

## References

- Walden Yan, [Don't Build Multi-Agents](https://cognition.com/blog/dont-build-multi-agents), Cognition, June 12, 2025.
- Jeremy Hadfield, Barry Zhang, Kenneth Lien, Florian Scholz, Jeremy Fox, and Daniel Ford, [How we built our multi-agent research system](https://www.anthropic.com/engineering/multi-agent-research-system), Anthropic, June 13, 2025.
- Mert Cemri and others, [Why Do Multi-Agent LLM Systems Fail?](https://arxiv.org/abs/2503.13657), arXiv:2503.13657, 2025.
- Leslie Lamport, [Time, Clocks, and the Ordering of Events in a Distributed System](https://lamport.azurewebsites.net/pubs/time-clocks.pdf), Communications of the ACM 21(7), 1978.
- Leslie Lamport, Robert Shostak, and Marshall Pease, [The Byzantine Generals Problem](https://lamport.azurewebsites.net/pubs/byz.pdf), ACM Transactions on Programming Languages and Systems 4(3), 1982.
- Hector Garcia-Molina and Kenneth Salem, [Sagas](https://www.cs.cornell.edu/andru/cs711/2002fa/reading/sagas.pdf), SIGMOD 1987.
- Diego Ongaro and John Ousterhout, [In Search of an Understandable Consensus Algorithm](https://raft.github.io/raft.pdf), USENIX ATC 2014.
- [Fallacies of distributed computing](https://en.wikipedia.org/wiki/Fallacies_of_distributed_computing), Wikipedia.
- Leslie Lamport, [distribution](https://lamport.azurewebsites.net/pubs/distributed-system.txt), email of May 28, 1987.
- Martin Kleppmann, [Designing Data-Intensive Applications](https://dataintensive.net/), O'Reilly Media, 2017.
- Luca Beurer-Kellner and others, [Design Patterns for Securing LLM Agents against Prompt Injections](https://arxiv.org/abs/2506.08837), arXiv:2506.08837, 2025.
- Martin Fowler, *Patterns of Enterprise Application Architecture*, Addison-Wesley, 2002, chapter 7, "Distribution Strategies"; and [Microservices and the First Law of Distributed Objects](https://martinfowler.com/articles/distributed-objects-microservices.html), 2014.
