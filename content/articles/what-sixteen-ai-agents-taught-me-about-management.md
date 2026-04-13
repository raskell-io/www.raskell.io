+++
title = "What Sixteen AI Agents Taught Me About Management"
date = 2026-04-20
draft = true
description = "What happens when you give sixteen AI agents an org chart, a reporting structure, and a token budget. A story about orchestration, management, and running out of runway."

[taxonomies]
tags = ["ai-for-ops", "platform-automation"]
categories = ["patterns"]

[extra]
author = "Raffael"
+++

Over the 2025 Christmas holidays I had sixteen AI agents running in parallel across four macOS workspaces. Each workspace held four Ghostty terminal panes, each pane running its own Claude Code instance, each instance working on a different piece of a different project. I was on Anthropic's 20x Max subscription, and during the holiday period the token limits were generous enough that I could burn through context at a rate I had never attempted before.

It was the most productive week of my engineering life. It was also the week I learned that managing AI agents is, at its core, a management problem. Not a technical one.

## The terminal wall

The setup started simple. Mitchell Hashimoto's Ghostty, which I consider one of the best terminal emulators released in years, supports split panes in both directions. Four panes per workspace. Four workspaces. Sixteen agents. Each one working on a real task: scaffolding a new crate, writing tests for a module I had sketched out, researching an API I needed to integrate, refactoring a component I had been putting off for months.

{% diagram(title="The terminal wall: 4 workspaces x 4 Ghostty panes") %}
Workspace 1              Workspace 2              Workspace 3              Workspace 4
===================      ===================      ===================      ===================
| Agent 1 | Agent 2|     | Agent 5 | Agent 6|     | Agent 9  | Agent 10|   | Agent 13 | Agent 14|
|  scaffold|  tests |     |  refactor| research|   |  API     |  migrate|   |  docs    |  bench  |
|---------|---------|     |---------|---------|     |---------|---------|   |---------|---------|
| Agent 3 | Agent 4|     | Agent 7 | Agent 8|     | Agent 11 | Agent 12|   | Agent 15 | Agent 16|
|  config |  lint  |     |  deploy |  review |     |  schema  |  ci     |   |  proto   |  fuzz   |
===================      ===================      ===================      ===================

                         Me: switching between workspaces,
                         scrolling back through conversations,
                         keeping a text file of who does what
{% end %}

The first few hours were exhilarating. I would spin up an agent, give it a task, switch to the next pane, give it a task, move to the next workspace, repeat. By mid-morning I had more concurrent engineering work happening than most small teams produce in a day.

Then the problems started.

I could not remember what each agent was doing. This was before Claude Code added the prompt and context summary at the top of the input line, so the only way to check was to scroll back through the conversation history and find the original prompt. With sixteen sessions, that meant a lot of scrolling. I started naming my macOS workspaces. I named each Ghostty pane. I kept a text file open with a list of which agent was doing what. I was, without quite realizing it, building a project management system out of sticky notes and window titles.

The irony was not lost on me. I had sixteen AI agents doing engineering work, and I was spending half my time doing the one thing AI was supposed to eliminate: keeping track of who was working on what.

## Kage, the first attempt

That frustration led to [kage](https://github.com/raskell-io/kage). The name means shadow in Japanese. The idea was straightforward: build a Rust binary that could orchestrate multiple terminal sessions, let me switch between them, and show me at a glance what each one was doing.

kage used `alacritty_terminal` (the terminal emulation library extracted from the Alacritty terminal emulator) to manage PTY sessions, `ratatui` for a terminal UI, and `redb` for local persistence. I could spawn agents with goals, set iteration limits, checkpoint and resume sessions, and pool across multiple LLM providers. The vision was that I could use Claude Code alongside OpenAI's Codex and whatever else was available, routing tasks to whichever provider had capacity.

{% diagram(title="kage: terminal session orchestrator") %}
+-----------------------------------------------------------+
|                      kage TUI (ratatui)                   |
|  +-------+  +-------+  +-------+  +-------+  +-------+   |
|  | Sess 1|  | Sess 2|  | Sess 3|  | Sess 4|  |  ...  |   |
|  | goal: |  | goal: |  | goal: |  | goal: |  |       |   |
|  | scaf. |  | tests |  | refac.|  | API   |  |       |   |
|  +---+---+  +---+---+  +---+---+  +---+---+  +-------+   |
|      |          |           |          |                   |
+------|----------|-----------|----------|-------------------+
       |          |           |          |
  +----v----+  +--v----+  +--v----+  +--v----+
  | PTY     |  | PTY   |  | PTY   |  | PTY   |    alacritty_terminal
  | (Claude)|  |(Codex)|  |(Claude|  |(Claude|    manages each session
  +---------+  +-------+  +-------+  +-------+

  +---------------------+    +------------------+
  | redb (persistence)  |    | LLM provider pool|
  | checkpoints, goals, |    | Anthropic, OpenAI|
  | session state       |    | route by capacity|
  +---------------------+    +------------------+
{% end %}

It worked. Technically. I could see all my sessions in one interface. I could switch between them. I could track what each agent was supposed to be doing.

But it felt clunky. The terminal streaming had issues. The UI was functional but not fluid. And more importantly, I realized the tool was solving the wrong problem. The problem was not that I needed a better way to look at sixteen terminal panes. The problem was that sixteen independent agents with no coordination between them produced sixteen independent streams of work with no coherence between them. Agent A would refactor a module that agent B was simultaneously writing tests for, using the old API. Agent C would make a design decision that conflicted with what agent D was building. I was the only point of integration, and I could not context-switch fast enough to catch every conflict.

{% diagram(title="The coordination problem kage could not solve") %}
Agent A: refactors auth module         Agent B: writes tests for auth module
  |                                       |
  +-- removes old_login()                 +-- tests old_login()
  +-- renames to authenticate()           +-- expects old return type
  +-- changes return type                 +-- passes locally (stale code)
                                          +-- FAILS after A merges

Agent C: picks REST for new API        Agent D: builds gRPC client for new API
  |                                       |
  +-- adds /api/v2/users                  +-- generates proto stubs
  +-- writes OpenAPI spec                 +-- implements streaming calls
                                          +-- INCOMPATIBLE with C's design

              Me (the only integration point):
              "Wait, what is everyone doing?"
{% end %}

I needed the agents to coordinate with each other. Not just run in parallel. Actually collaborate.

## Shiioo, the virtual company

The second attempt was [shiioo](https://github.com/raskell-io/shiioo). The name is the Japanese romanization of CEO. The premise had changed entirely.

What if the agents were not just parallel workers? What if they were employees in a virtual enterprise, each with a specific role, a defined skillset, a limited set of tools, and a reporting structure?

I had been reading about organizational design and it struck me how directly the problems I was having with agent orchestration mapped to problems that real companies solve with management hierarchies. When you have sixteen people working on a project, you do not give each one independent access to everything and hope for the best. You create teams. You assign leads. You define communication channels. You escalate decisions that exceed a team's authority.

So that is what I built. shiioo is a Rust-based client-server system with an event-sourced persistence layer. Each agent is modeled as an employee with a `SKILLS.md` file that defines its capabilities, a limited set of MCP interfaces it can access, and a position in an organizational hierarchy. Agents are grouped into squads. Each squad has a lead. Squad leads report to department leads. Department leads report up to me.

{% diagram(title="shiioo: virtual company hierarchy") %}
                            +------------------+
                            |   CEO (me)       |
                            |   Strategic      |
                            |   decisions only |
                            +--------+---------+
                                     |
                   +-----------------+-----------------+
                   |                                   |
          +--------v---------+               +---------v--------+
          |  Dept Lead:      |               |  Dept Lead:      |
          |  Infrastructure  |               |  Product         |
          +--------+---------+               +---------+--------+
                   |                                   |
          +--------+--------+                 +--------+--------+
          |                 |                 |                 |
   +------v------+  +------v------+   +------v------+  +------v------+
   | Squad Lead: |  | Squad Lead: |   | Squad Lead: |  | Squad Lead: |
   | Backend     |  | Platform    |   | Frontend    |  | Data        |
   +------+------+  +------+------+   +------+------+  +------+------+
          |                 |                 |                 |
     +----+----+       +---+---+        +----+----+       +---+---+
     |    |    |       |       |        |    |    |       |       |
    Ag1  Ag2  Ag3    Ag4     Ag5      Ag6  Ag7  Ag8    Ag9    Ag10

   Each agent has:
   - SKILLS.md (capabilities)     - Limited MCP interfaces
   - Defined scope of authority   - Escalation path upward
{% end %}

The architecture uses a DAG workflow engine built on `petgraph` for task dependencies, a policy engine for authorization and approval gates, and a capacity broker that routes LLM calls across multiple providers. Every action is event-sourced, which means I have a complete audit trail of every decision every agent made, and I can replay any sequence of events to understand how a particular outcome was reached.

{% diagram(title="shiioo system architecture") %}
+-------------------------------------------------------------------+
|                         shiioo server                             |
|                                                                   |
|  +------------------+  +------------------+  +-----------------+  |
|  | Workflow Engine   |  | Policy Engine    |  | Capacity Broker |  |
|  | (petgraph DAGs)  |  | (RBAC, approval  |  | (route LLM     |  |
|  |                  |  |  gates, authz)   |  |  calls across   |  |
|  | task deps,       |  |                  |  |  providers)     |  |
|  | retries,         |  | who can do what, |  |                 |  |
|  | timeouts         |  | who approves     |  | Anthropic,      |  |
|  +--------+---------+  +--------+---------+  | OpenAI, ...     |  |
|           |                     |             +---------+-------+  |
|           +----------+----------+                       |         |
|                      |                                  |         |
|              +-------v--------+                         |         |
|              | Event Store    |    +--------------------v------+  |
|              | (redb + S3)   |    | MCP Tool Server            |  |
|              |               |    | (expose enterprise tools   |  |
|              | every action  |    |  to agents)                |  |
|              | is persisted, |    +----------------------------+  |
|              | replayable    |                                    |
|              +---------------+                                    |
+-------------------------------------------------------------------+
        |                                        |
   +----v----+                              +----v----+
   | CLI REPL|                              | Web     |
   | (Chief  |                              | Dashboard|
   | of Staff|                              | (real-  |
   | mode)   |                              |  time)  |
   +---------+                              +---------+
{% end %}

The key insight was the escalation model. Most tasks could be handled by individual agents within their defined scope. When an agent encountered a decision that exceeded its authority, such as a design choice that would affect other teams, a dependency conflict, or a resource allocation question, it escalated to its squad lead. The squad lead either resolved it or escalated further. Only the decisions that truly required strategic judgment, market positioning, resource allocation across projects, architectural direction, reached me.

I was the CEO. Not in some metaphorical sense. In the literal operational sense that the only decisions that required my attention were the ones that should require a CEO's attention.

## It worked

I am not going to oversell this. shiioo was rough. The UI was a REPL with seven built-in commands. The web dashboard was basic. The documentation was incomplete.

But the model worked. I bootstrapped multiple projects using this setup over the holidays. Agents would pick up tasks, work within their scope, coordinate through the reporting structure, and escalate when they hit ambiguity. The squad lead agents were particularly effective because they had enough context about their team's work to resolve most conflicts without involving me.

The event sourcing turned out to be more valuable than I expected. When something went wrong, and things did go wrong, I could trace the decision chain from the final output back to the original task assignment. I could see exactly where an agent made a bad call, which agent approved it, and what information was available at each step. This is something you cannot do with sixteen independent terminal sessions. You cannot even do it with most human teams.

For a week, I was running a virtual company. And the virtual company was shipping code.

## Then the tokens ran out

Here is the part nobody talks about when they discuss agent orchestration: the economics.

During the Christmas holiday period, Anthropic's 20x Max subscription was unusually generous with token limits. I do not know the exact numbers, but the allowance was noticeably higher than usual. I was burning through it.

The problem was not the agents doing useful work. The problem was the agents talking to each other. In any organization, a significant portion of communication is overhead. Status updates. Clarifying questions. Acknowledging instructions. Confirming understanding. In a human company, this overhead is accepted because humans need it to function. In an agent company, every word of that communication costs tokens.

I watched my weekly token budget evaporate. Not because the agents were writing code, although they were. Because the squad leads were having lengthy exchanges with their teams about task requirements. Because agents were asking clarifying questions that a slightly better prompt would have made unnecessary. Because the escalation chain, every step of it, required a full context window of conversation.

{% diagram(title="Where the tokens actually went") %}
Token budget (weekly)
=====================

  Useful work (code, tests, docs)       ████████░░░░░░░░░░░░  ~35%
  Agent-to-agent coordination           ██████████████░░░░░░  ~40%
  Escalation chain overhead             ████████░░░░░░░░░░░░  ~15%
  Clarifying questions / retries        ████░░░░░░░░░░░░░░░░  ~10%
                                        ^^^^^^^^^^^^^^^^^^^^
                                        |---- productive ---|--- overhead ---|

  The overhead was not a bug. It was the cost of coordination.
  The same cost human companies pay in salaries for meetings,
  Slack threads, standups, and status reports.

  The difference: human overhead is a fixed cost.
  Token overhead scales with every message.
{% end %}

It was the AI equivalent of employees standing around the coffee machine. Except every minute at the coffee machine cost real money.

When the holiday period ended and the token limits returned to normal, shiioo became impractical for my situation. I have more than ten active projects. I need to decide, deliberately and granularly, what my limited token budget goes toward. A virtual company that autonomously allocates its own token spend, no matter how effectively, does not give me that control. I stopped using it. Not because the architecture was wrong. Because the economics did not fit my constraints.

## The management lesson

Here is what I find genuinely interesting about this experience. Every problem I encountered was a management problem that real companies have solved, or at least learned to live with.

The coordination problem: sixteen independent workers producing inconsistent output. Solved the same way companies solve it. Hierarchy, defined roles, communication channels.

The overhead problem: too much communication relative to productive work. Every manager knows this. Every company struggles with it. The optimal amount of coordination is not zero and it is not "as much as possible." It is somewhere in between, and finding that point is one of the hardest problems in organizational design.

The economics problem: the work gets done, but the cost of the work exceeds the budget. This is not a technology problem. This is a business problem. And it has different answers at different scales.

For an individual developer on a consumer subscription, shiioo's overhead is too expensive. The token cost of agent-to-agent communication eats into the budget for actual work. I need to be hands-on, directing each agent personally, because my token budget is small enough that every token should go toward output I directly value.

For an enterprise with API access and a meaningful budget, the calculus is completely different. If you are paying for engineering time at market rates, the token cost of agent coordination is a rounding error compared to the cost of human coordination. The overhead that made shiioo impractical for me, agents discussing requirements, leads resolving conflicts, escalation chains processing decisions, would be a bargain for a company that currently pays humans to do the same thing at 100x the cost and 10x the latency.

{% diagram(title="The economics at different scales") %}
Individual developer (consumer sub)     Enterprise (API access)
====================================    ====================================

Token budget:  limited, weekly cap      Token budget:  pay per use, large
Overhead cost: eats into real work      Overhead cost: rounding error
Control need:  high (every token        Control need:  moderate (aggregate
               must count)                             ROI matters)

  +----------+                            +----------+
  |  Useful  |  <-- want to maximize      |  Useful  |  <-- still majority
  |  work    |      this slice            |  work    |
  +----------+                            +----------+
  | Overhead |  <-- this hurts            | Overhead |  <-- acceptable cost
  +----------+                            +----------+
  | Budget   |                            |          |
  +----------+                            | Room to  |
  (no room)                               | grow     |
                                          +----------+

  Same architecture. Different economics. Different answer.
{% end %}

## Then OpenClaw happened

A few weeks after Christmas, [OpenClaw](https://github.com/openclaw/openclaw) launched and crossed 100,000 GitHub stars within its first week. The community was impressed. A personal AI agent framework with multi-agent support, tool integrations, and an approachable setup experience.

I looked at it and felt a mix of recognition and mild frustration. OpenClaw solved the "how do I run an AI agent" problem elegantly. But shiioo was solving a different problem. Not "how do I run agents" but "how do I run an organization of agents." Hiring, delegation, escalation, governance, audit trails, budget management. The boring, structural, enterprise problems that do not demo well but determine whether agent orchestration actually works at scale.

OpenClaw is a good tool for individuals. What I built, rough as it was, is a sketch of what enterprises will need when they move past "we have an AI assistant" to "we have an AI workforce." Those are fundamentally different problems, and they require fundamentally different architectures.

I do not say this to diminish OpenClaw. I say it because I think the industry is still mostly working on the first problem while the second one is coming fast.

## What I would do differently

If I were building shiioo again today, three things would change.

First, the communication protocol between agents needs to be structured and minimal. Free-form conversation between agents is expensive and produces the same rambling overhead that plagues human Slack channels. Agents should exchange typed messages with defined schemas. Not "hey, I was thinking about the API design and I wonder if we should consider..." but `{ type: "design_decision", scope: "api", proposal: "...", requires_approval: true }`. Every token in agent-to-agent communication should carry information, not politeness.

Second, the token budget needs to be a first-class resource managed by the system, not an afterthought. Every agent should have a token allowance. Every escalation should have a cost. The system should make tradeoff decisions about whether a clarifying question is worth the tokens, the same way a well-run company makes tradeoff decisions about whether a meeting is worth the calendar time.

Third, I would separate the orchestration layer from the LLM provider entirely. shiioo was built around the Anthropic Messages API. It should have been built around an abstract capability interface where the provider is a pluggable backend. Not for vendor neutrality as a principle, but because the economics change when you can route low-stakes agent communication through a smaller, cheaper model and reserve the frontier model for decisions that actually require it.

{% diagram(title="Smarter token routing by decision weight") %}
Task type                Model tier          Cost per 1K tokens
==========               ==========          ==================

Strategic decisions       Frontier            $$$$
(architecture, design)    (Opus, GPT-5)
        |
        v
Squad lead coordination   Mid-tier            $$
(conflict resolution,     (Sonnet, GPT-4o)
 task assignment)
        |
        v
Agent-to-agent comms      Small/fast          $
(status, ack, handoff)    (Haiku, GPT-4o-mini)

Route by decision weight, not uniformly.
Most tokens go to the cheapest tier.
Most value comes from the expensive tier.
{% end %}

## What this means for actual enterprises

I ran my virtual company for a week across personal projects. It was an experiment. But the patterns I stumbled into are not experimental. They are the same patterns that every large organization will need to operationalize as agentic employees become real line items on the org chart.

This is not a distant future. Companies are already deploying AI agents for customer support, code review, compliance checks, and data pipeline management. What most of them have not done yet is think about what happens when those agents need to coordinate. When the support agent needs to escalate to the engineering agent. When the compliance agent needs to block a deployment the CI agent is trying to push. When three agents working on the same codebase need to not step on each other.

The companies that figure this out first will have a structural advantage that compounds. Here is why.

Consider a mid-size engineering organization. Two hundred engineers. They spend, conservatively, 30% of their time on coordination. Standups, planning meetings, Slack threads, code review discussions, design document feedback loops, incident response coordination. That is sixty full-time-equivalent salaries spent on people talking to each other about work rather than doing it. Nobody questions this cost because it has always been the cost of building software with humans.

Now replace even a fraction of that coordination layer with agents. Not the engineers themselves. The coordination between them. An agentic squad lead that triages incoming tickets, assigns them based on skill match, checks for conflicts with in-flight work, and only escalates to a human lead when the decision genuinely requires human judgment. An agentic project manager that tracks dependencies across teams, flags blockers before they become crises, and generates status updates from actual commit history instead of asking twelve people to fill out a spreadsheet.

|                      | Today                                                        | Near future                                                  |
|----------------------|--------------------------------------------------------------|--------------------------------------------------------------|
| **Coordination**     | All human, expensive, slow, lossy                            | Mostly agents, cheap, fast, auditable                        |
| **Status updates**   | Asked for weekly (often stale by the time they reach leadership) | Generated from event logs (always current)                   |
| **Conflict detection** | Someone notices during code review (after the work is done)  | Automatic, flagged before work begins                        |
| **Escalation**       | Informal, depends on who knows whom                          | Structured, policy-driven, with full context                 |

The organizations that will benefit most are not the ones with the best AI models. They are the ones that treat agent orchestration as an organizational design problem. That means defining clear scopes of authority, building escalation paths that preserve context, implementing approval gates that match their governance requirements, and maintaining audit trails that satisfy compliance. These are not engineering problems. They are operations problems. And most companies already have people who know how to solve them. They are called managers.

The irony is that the skills most relevant to the agentic enterprise are not machine learning or prompt engineering. They are the skills that good managers have always had: defining clear responsibilities, building trust through transparency, knowing when to delegate and when to intervene, and designing systems where people, or agents, can do their best work without tripping over each other.

Every enterprise will need to answer a specific set of questions in the next few years. How do you onboard an agentic employee? How do you define its scope? What happens when it makes a mistake? Who is accountable? How do you audit its decisions? How do you revoke its access? These questions sound like IT governance, and they are. But the answers will reshape how companies think about headcount, team structure, and operational capacity in ways that most leadership teams have not begun to consider.

The companies that start experimenting now, even crudely, even with something as rough as what I built over a holiday week, will have a vocabulary and a set of institutional patterns that the latecomers will not. And in organizational design, having the right patterns early matters more than having the best technology late.

## Where this goes

I still believe the virtual company model is the right abstraction for large-scale agent orchestration. Not because it is clever. Because it solves the same coordination problems that human organizations solve, using the same structural patterns that have been refined over decades of organizational theory.

The technology is ready. The architectures are straightforward. The missing piece is the economics. When frontier model inference costs drop by another order of magnitude, and they will, the token overhead of agent-to-agent communication stops being prohibitive. When that happens, the question will not be "should we orchestrate agents in a hierarchy" but "what does the org chart look like."

I suspect we are closer to that moment than most people think. And when it arrives, the hard problems will not be technical. They will be the same problems that have always made management hard: delegation, trust, accountability, and knowing when to let your people work and when to step in.

The agents are ready to work. We just need to learn how to manage them.

## References

- [kage: Local-first agentic work orchestrator](https://github.com/raskell-io/kage)
- [shiioo: Virtual Company OS](https://github.com/raskell-io/shiioo)
- [OpenClaw: Personal AI agent framework](https://github.com/openclaw/openclaw)
- [Ghostty terminal emulator](https://ghostty.org)
- [alacritty_terminal crate](https://crates.io/crates/alacritty_terminal)
