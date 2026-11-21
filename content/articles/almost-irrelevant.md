+++
title = "Almost Irrelevant: Choosing a Language When Agents Write the Code"
date = 2026-11-19
description = "When agents write most of the code, the language matters less than it did, but not nothing. What Rust, Go, Elixir and Haskell still buy you."

[taxonomies]
tags = ["programming-languages", "ai-engineering", "rust", "golang", "elixir", "haskell", "type-systems"]

[extra]
author = "Raffael"
image = "almost-irrelevant.avif"
cover = "covers/almost-irrelevant.avif"
in_short = [
  "Coding agents absorb the costs that used to decide a language choice, the learning curve, the boilerplate and the hiring pool, so the choice matters much less than it did.",
  "What is left is what a language promises after the agent has gone: what the compiler checks, what the runtime does under failure, how the code reads in review, and how it composes across a company.",
  "Rust is for things that have to work no matter what, the ground C and C++ used to hold, and for replacing the COBOL core systems on mainframes; Go is for plain code a whole company shares, the ground Java used to hold.",
  "Elixir is for platforms that are distributed by nature and for ambitious projects one person runs, with typing still arriving; Haskell, through bhc, is a bet on a different way of building software, where verified meaning accumulates instead of being rewritten.",
  "Python and TypeScript keep their places in the notebook and the browser, and what people write more and more is requirements, in Markdown and JSON rather than in a programming language.",
]
+++

If an agent writes most of your code, does it still matter which language it writes in?

For most of my career the choice of language was a choice about people. Who can you hire, how long until they are productive, what do they already know, and how much will they hate the borrow checker in their first month. Those costs decided more language debates than any benchmark did, and they have mostly collapsed. An agent writes idiomatic Rust as readily as it writes Python. It does not mind boilerplate, needs no month to learn lifetimes and has no opinions about tabs. The learning curve that kept teams away from Rust, Elixir or Haskell is now largely the agent's problem.

So my answer is that the language has become almost irrelevant, but not quite, because a language was always more than a way of typing. It is also a compiler that decides what gets checked before anything runs, a runtime that decides what happens when things fail, a style that decides how quickly a person can review what the agent wrote, and a module system that decides how the code fits with everything else the organisation has. None of those went away, and some matter more than before.

I have written about where programming languages are heading in the long run, in [The Last Programming Language Might Not Be for Humans](/articles/what-programming-languages-become-when-ai-writes-the-code/). This post is the practical companion: which languages I reach for today, for what, and why. It is opinionated, and it is about four languages, because those are the four I use.

## What the agent absorbs, and what it does not

The arcanist.sh post [The Scorecard Is Right. The Weights Are Wrong.](https://arcanist.sh/blog/the-scorecard-is-right-the-weights-are-wrong/) made one argument I keep coming back to: the usual language scorecards are fair, but their weights assume a human author who has to hold the whole program in their head. Change the author and the weights change. Roughly like this:

| What a language costs or gives you | Weight when people wrote the code | Weight when agents write it |
|---|---|---|
| Learning curve, ceremony, boilerplate | high | low: the agent pays it |
| Size of the hiring pool | high | lower: fewer people write, more people review |
| What the compiler checks before anything runs | medium | high: generation is cheap, verification is the bottleneck |
| How the code reads to a reviewer | medium | high: every line still needs a reader |
| Build and test speed | medium | high: the loop runs at machine speed |
| What the runtime does under load and failure | high | unchanged |
| Ecosystem and libraries | high | still high: agents reuse libraries too |

The rows that lost weight are about writing; the rows that gained weight are about trusting what was written. That is the lens for the rest of this post: for each language, what does it promise about code that nobody on the team typed?

To keep the examples comparable, every snippet below handles a piece of the same small requirement, the kind a bank's core system is full of: post monthly interest on an account, rounded half away from zero to the cent, and never to a closed account. It is written out in full near the end, in the form I think requirements will take.

## Rust: for things that have to work

Rust holds the ground C and C++ used to hold: proxies, operating systems, runtimes, compilers, engines, anything that runs for months, sits on a hot path or handles input from people who mean harm. The borrow checker gives memory safety and freedom from data races at compile time, without a garbage collector, and the type system makes it natural to put invariants where the compiler can see them.

The famous cost of Rust was the fight with the borrow checker, and that fight is the kind of cost an agent absorbs. Rust even turns it into an advantage, because its compiler errors are precise, local and actionable, which makes them close to ideal feedback for a model working in a loop. The agent proposes, the compiler objects with a line number and a suggestion, the agent fixes it. By the time a person reads the code, a whole class of mistakes is already gone.

This is what that feedback looks like when two threads append to the same ledger, which in many languages compiles and then fails only now and then, under load, in production:

```rust
let mut ledger = Vec::new();
let a = thread::spawn(move || ledger.push("interest"));
let b = thread::spawn(move || ledger.push("fees"));
```

```text
error[E0382]: use of moved value: `ledger`
 --> src/main.rs:6:27
  |
5 |     let a = thread::spawn(move || ledger.push("interest"));
  |                           ------- ------ variable moved due to use in closure
  |                           |
  |                           value moved into closure here
6 |     let b = thread::spawn(move || ledger.push("fees"));
  |                           ^^^^^^^ ------ use occurs due to use in closure
  |                           |
  |                           value used here after move
  |
help: consider cloning the value before moving it into the closure
```

The program never runs, and the error says exactly where and why. It also shows the limit of the compiler, and the point where a person or a requirement still matters: the suggested fix, cloning the vector, compiles, but it gives each thread its own ledger, which is not what a bank wants. The right fix is one shared ledger behind a lock, `Arc<Mutex<Vec<_>>>`, and choosing it takes knowing what the code is for. The compiler narrows the agent's options to the safe ones; the requirement picks among them.

The evidence that this matters at scale is not mine. Google reported in 2024 that the share of memory safety vulnerabilities in Android fell "from 76% to 24% over 6 years as development shifted to memory safe languages", and that the problem is "overwhelmingly with new code" ([Google Security Blog](https://security.googleblog.com/2024/09/eliminating-memory-safety-vulnerabilities-Android.html)). A year later the same team reported a memory safety vulnerability density in Rust "more than 1000x" lower than in Android's C and C++, and Rust changes with a roughly four times lower rollback rate ([Google Security Blog](https://security.googleblog.com/2025/11/rust-in-android-move-fast-fix-things.html)). If agents are about to write a great deal of new code, the safest place for that new code to land is a language where those mistakes do not compile.

Most of what I build is in Rust for that reason. [Zentinel](https://zentinelproxy.io/), a reverse proxy, sits in front of other people's traffic. Aqueduct, a durable execution engine, has to replay a run to the same result after a crash ([The River and the Canal](/articles/the-river-and-the-canal/) explains why). hx and bhc are toolchains other people's builds depend on ([Why We Built a Haskell Package Manager in Rust](/articles/why-we-built-a-haskell-package-manager-in-rust/) tells that story). Shiioo runs agents on my own machine and keeps the record of what they did ([Shiioo, Re-imagined](/articles/shiioo-reimagined-and-a-home-ai-lab/)). Each of these fails expensively, and each ships as one static binary.

The same reasoning makes Rust my first choice for the biggest job of this kind: replacing the core systems that banks, insurers and public administrations still run on mainframes, most of them written in COBOL decades ago. Those systems work. They are reliable, they do decimal arithmetic correctly, and they have survived every attempt to replace them, mostly because nobody can say with confidence what all of their code does. Agents change half of that problem. They read COBOL patiently, explain what a program does, and write the new version without tiring. What they do not change is the need for the new system to be at least as dependable as the old one, and that is where the language matters. Rust gives you the mainframe's virtues without the mainframe: no undefined behaviour, no garbage collector pausing in the middle of a posting run (Discord moved a service from Go to Rust in 2020 for this reason, after Go's collector, which runs at least every two minutes, caused [regular latency spikes](https://discord.com/blog/why-discord-is-switching-from-go-to-rust)), exact decimal types such as [rust_decimal](https://docs.rs/rust_decimal/) for money, and a compiler that turns away whole classes of mistakes before the program runs. Whether the interest itself is right is still for the requirement and its tests to say, as the cloned ledger above showed.

The money part is short. COBOL programs keep amounts as fixed-point decimals, and the replacement has to do the same, never binary floating point, where `0.1 + 0.2` is `0.30000000000000004`:

```rust
use rust_decimal::{Decimal, RoundingStrategy};
use rust_decimal_macros::dec;

/// Monthly interest, rounded half away from zero to the cent.
fn monthly_interest(balance: Decimal, annual_rate: Decimal) -> Decimal {
    (balance * annual_rate / dec!(12))
        .round_dp_with_strategy(2, RoundingStrategy::MidpointAwayFromZero)
}

// monthly_interest(dec!(1234.56), dec!(0.015)) == dec!(1.54)
```

The rounding rule is written into the code by name, because a rounding rule that lives only in someone's memory of how the old system behaved is how migrations go wrong.

What the mainframe did with batch windows and transaction monitors, Rust does with [Tokio](https://tokio.rs/), its asynchronous runtime: thousands of concurrent tasks on a handful of threads, with timers, timeouts and cancellation. Tokio itself runs inside one process; the distribution comes from running many small binaries on as many machines as the load needs, in front of a database that replicates. The migration itself should be boring on purpose: run the old and the new system side by side on the same inputs, compare every output, and switch over one product or one batch at a time once they agree. With Tokio, the core of that comparison is a few lines:

```rust
/// Parallel run: the mainframe stays the system of record, the new core shadows it.
async fn post_interest(
    legacy: &Legacy, core: &Core, divergences: &Divergences, balance: Decimal,
) -> Outcome {
    let (old, new) = tokio::join!(legacy.post(balance), core.post(balance));
    if old != new {
        divergences.record(balance, &old, &new).await;
    }
    old
}
```

Both systems get the same input at the same time, the old answer is the one that counts, and every disagreement is written down for someone to explain. That comparison is the real work, and it is work agents are good at. The language is what makes it safe to trust what they produce afterwards.

Rust has its costs, and agents do not remove all of them. Builds are slower than Go's. Async Rust is still harder than it should be. And Rust is not quick to review for someone who does not read lifetimes fluently, which matters when the reviewer is a person from another team. (Google's Android engineers report the opposite, that Rust changes spend about a quarter less time in review, but they compare it with C++, not with Go, and they review Rust every day.) I would not write a company's internal services in it by default, only the parts those services cannot afford to have fail.

## Go: for code a whole company shares

Go is what Java used to be for large organisations: the language of the plain, long-lived services they run by the hundred, written by many teams and read by many more. I wrote the long version of this in the "Why Go" section of [Building IT Intelligence](/articles/building-it-intelligence/#why-go), so here is the short one.

Go is idiomatic to the point of being boring, and in a company that is the highest praise there is. There is usually one way to do a thing, `gofmt` settles the layout, errors are values handled where they happen, dependencies are passed in rather than conjured by a framework, and the language does not offer the machinery that turned enterprise Java into factories of factories. Imports are module paths, usually the address of a Git repository, so referencing another team's code is a line in a file and not a ticket to the artifact repository team. Inside one module everything compiles from source, which makes a company-wide monorepo cheap: there are no internal libraries to publish, version and wait for. It compiles in seconds, runs fast, ships as one binary, and its tooling (tests, vet, the race detector, profiling, the language server) comes in the box. And the [Go 1 compatibility promise](https://go.dev/doc/go1compat) says that programs written to the specification "will continue to compile and run correctly, unchanged", which is the timescale corporate software lives on.

What changes with agents is that this boredom becomes an asset twice. Agent-written Go looks like human-written Go, because there is so little room for style, so a reviewer from another team reads it at the speed of prose. And the same sameness makes a large Go codebase easy for agents to navigate: a function does what its signature says, and the call graph is right there.

The interest rule in Go reads like this, and it would read the same way whichever team or agent wrote it:

```go
var ErrClosed = errors.New("account is closed")

// MonthlyInterest returns the interest in cents for one month,
// rounded half away from zero, as the requirement says.
func MonthlyInterest(ctx context.Context, accounts Accounts, iban string, bps int64) (int64, error) {
	acct, err := accounts.Get(ctx, iban)
	if err != nil {
		return 0, fmt.Errorf("monthly interest for %s: %w", iban, err)
	}
	if acct.Closed {
		return 0, fmt.Errorf("monthly interest for %s: %w", iban, ErrClosed)
	}
	return roundHalfAway(acct.Balance*bps, 10000*12), nil
}
```

The dependency is an interface passed in, every failure is a value with context added on the way up, and a caller can ask `errors.Is(err, ErrClosed)` instead of parsing a message, and none of it needs explaining to someone from another team.

The cost is that Go checks less than Rust or Haskell. It has no sum types, `nil` is still a value, and a good share of correctness lives in tests rather than in types. For a company that is usually the right trade: the system that has to be correct gets Rust, and the hundred services around it get Go.

## Elixir: for platforms that are distributed by nature

Elixir runs on the BEAM, the Erlang virtual machine, and the BEAM was built for telephone switches: millions of small isolated processes, supervisors that restart what crashes, messages between nodes as a first-class thing, and a culture of designing for failure instead of pretending it will not happen. Most languages add distribution with libraries and infrastructure. On the BEAM it is the default way of thinking.

A process on the BEAM is not an operating system thread. A new one takes 327 words of memory, about 2.6 KB, according to the [Erlang efficiency guide](https://www.erlang.org/doc/system/eff_guide_processes.html), with its own heap, so one machine runs hundreds of thousands of them and one process's garbage collection never stops the others. (WhatsApp, built on Erlang, reported holding [over two million TCP connections](https://blog.whatsapp.com/1-million-is-so-2011) on a single server in January 2012.) Processes share nothing and talk by messages, and supervisors watch them. An application is a tree of supervisors, and a cluster is several of those trees on machines that can message each other. This is broodwar.live's tree, trimmed:

```elixir
children = [
  Broodwar.Repo,                                    # the database pool
  {DNSCluster, query: dns_cluster_query()},         # find the other nodes
  {Phoenix.PubSub, name: Broodwar.PubSub},          # messages across nodes
  {Oban, Application.fetch_env!(:broodwar, Oban)},  # durable jobs in SQLite
  Broodwar.Ingestion.LiquipediaThrottle,            # one process, one rate limit
  BroodwarWeb.Endpoint                              # one process per connection
]

Supervisor.start_link(children, strategy: :one_for_one, name: Broodwar.Supervisor)
```

broodwar.live runs on one node, with SQLite. On two machines, with the database moved to PostgreSQL so both can reach it, the same tree looks like this:

{% diagram(title="One application on the BEAM, on two nodes") %}
   node a                                     node b
  ┌────────────────────────────────────┐      ┌──────────────────────┐
  │ Broodwar.Supervisor (one_for_one)  │      │ Broodwar.Supervisor  │
  │  ├─ Repo        database pool      │      │  ├─ Repo             │
  │  ├─ PubSub ◀───────────────────────┼──────┼─▶├─ PubSub           │
  │  ├─ Oban        job queues         │      │  ├─ Oban             │
  │  ├─ Throttle    crashed, so the    │      │  ├─ Throttle         │
  │  │              supervisor starts  │      │  └─ Endpoint         │
  │  │              a fresh one alone  │      │      ○ ○ ○ ○ ...     │
  │  └─ Endpoint                       │      └──────────┬───────────┘
  │      ○ ○ ○ ○ ○ ○ ○ ○ ...           │                 │
  │      one process per connection    │                 │
  └─────────────────┬──────────────────┘                 │
                    └─────────────────┬──────────────────┘
                                      ▼
                      PostgreSQL: data, and Oban's jobs
{% end %}

When the throttle process crashes, its supervisor starts a fresh one, and the open connections, the job queues and the other node never notice. A message published on one node reaches subscribers on the other. That is the whole distributed system, and none of it needed a separate piece of infrastructure.

That makes Elixir my choice for platforms that are distributed by nature: anything omnichannel, where the same conversation arrives by web, chat, email and phone; anything with live presence and many open connections; anything with a lot of background work that has to survive restarts. The background work is where [Oban](https://oban.hexdocs.pm/Oban.html) comes in, a job framework that "uses PostgreSQL, MySQL, or SQLite3 for persistence". Jobs live in the database you already have, with retries, uniqueness and queues, and no separate broker to run. In [broodwar.live](https://broodwar.live), a job that ingests tournament pages from Liquipedia looks like this:

```elixir
# api.broodwar.live, lib/broodwar/ingestion/match_sync.ex (trimmed)
use Oban.Worker,
  queue: :ingestion,
  max_attempts: 3,
  unique: [period: 3600, fields: [:args]]

@impl Oban.Worker
def perform(%Oban.Job{args: %{"pages" => pages}}) when is_list(pages) do
  case run(pages) do
    {:ok, _summaries} -> :ok
    {:error, {:rate_limited, _} = reason} -> {:cancel, reason}
    {:error, reason} -> {:error, reason}
  end
end
```

Retries, deduplication within an hour, and the decision to stop rather than retry when the source rate-limits us: eight lines, all of them readable by someone who has never seen Elixir. [Humankind](https://humankind.plus), an archive of people's voices and stories, runs eight queues the same way (transcription, embeddings, voice synthesis, story generation, among others) next to Phoenix's real-time updates, in one runtime.

This is also why Elixir is my favourite language for ambitious projects that one person runs. What a company would split into a web tier, a queue, a broker, a cache and a cluster manager, the BEAM gives you in one system you can still hold in your head. It does not have the hiring pool or the cross-team conventions of Go, so I would not make it the default for a large organisation, but a small team gets a long way on it.

The weakness has been typing, and with agents it weighs more, because a dynamic language checks less of what the agent wrote before it runs. That is changing. [Elixir 1.20](https://elixir-lang.org/blog/2026/06/03/elixir-v1-20-0-released), released in June 2026, can "perform type inference and gradually type check every Elixir program, without introducing type annotations". Typed structs and type signatures are still to come, without a fixed date ([the roadmap](https://elixir-lang.org/blog/2026/01/09/type-inference-of-all-and-next-15/)). Until then I lean on pattern matching, typespecs and tests, and I review agent-written Elixir more carefully than agent-written Rust.

If you want the BEAM with static types today, there is [Gleam](https://gleam.run/), "a friendly language for building type-safe systems that scale". It compiles to the same virtual machine, so it gets the processes, supervisors and distribution, it can use packages written in Erlang and Elixir, and it has been stable since [version 1.0 in March 2024](https://gleam.run/news/gleam-version-1/). Everything is typed and checked by the compiler, the property that gains weight when an agent writes the code. Its ecosystem is younger than Elixir's, and there is no Phoenix or Oban written in it, though Elixir libraries can be called through its foreign function interface, with the types written by hand. For a new service on the BEAM where correctness matters more than the framework, it is the choice I would look at first.

## Haskell and bhc: a different kind of bet

Rust, Go and Elixir are better answers to questions we already had. Haskell, in the form I am building it, answers one that appears only once agents write the code: what happens when generation is cheap?

A model produces plausible code in seconds, and plausible code is often wrong, so the scarce work moves from writing code to knowing it is correct (and, as I argued in [The Behavioural Turn](/articles/the-behavioural-turn/), to deciding how much of it anyone reads at all). Haskell is the production language that makes the most of that checkable. A well-typed function is a small proof that a transformation is valid, effects are visible in the signature, and illegal states can be made unrepresentable. The model does not have to be right; it has to be checkable, and the compiler is the checker. The checker can even sit inside generation: a team at ETH Zurich and UC Berkeley let a type checker constrain a model's output token by token and cut compilation errors in generated TypeScript by more than half ([Mündler et al., 2025](https://arxiv.org/abs/2504.09246)).

The interest requirement says interest is never posted to a closed account. In most languages that rule is an `if` that somebody has to remember. In Haskell it can be the shape of the data:

```haskell
newtype Cents       = Cents Integer
newtype BasisPoints = BasisPoints Integer

data OpenAccount   = OpenAccount { iban :: String, balance :: Cents }
data ClosedAccount = ClosedAccount { closedIban :: String }
data Account       = Open OpenAccount | Closed ClosedAccount

-- Interest can only be posted to an open account: the type says so.
postInterest :: BasisPoints -> OpenAccount -> OpenAccount
postInterest (BasisPoints bps) acct = acct { balance = Cents (c + interest) }
  where
    Cents c  = balance acct
    interest = roundHalfAway (c * bps) (10000 * 12)

monthEnd :: BasisPoints -> Account -> Account
monthEnd rate (Open a)   = Open (postInterest rate a)
monthEnd _    (Closed c) = Closed c
```

An agent that tries to post interest to a closed account gets this from `bhc check`, before anything runs, instead of a failing test or a bug report weeks later:

```text
Type errors:
  1: type mismatch: expected `OpenAccount`, found `ClosedAccount`
```

Nobody has to remember the rule, because the program cannot express breaking it. That was the bet of [The Last Programming Language Might Not Be for Humans](/articles/what-programming-languages-become-when-ai-writes-the-code/), and it is why [arcanist.sh](https://arcanist.sh/manifesto/) exists.

[bhc](https://arcanist.sh/bhc/), the Basel Haskell Compiler, is a clean-slate compiler for the same language, written in Rust, and it adds two ideas that I think make this a different way of building software rather than a better Haskell.

The first is that a runtime is a contract you choose. The same source compiles under a profile: `default` for lazy evaluation as usual, `server` for structured concurrency with deadlines, `numeric` for fused, strict numeric code and tensor kernels, `edge` for a minimal WebAssembly runtime. The performance envelope stops being folklore and becomes part of what a function is: not only "this is correct", but "this is correct under this contract".

The second is [the commons](https://arcanist.sh/commons/). Today every agent, in every session, writes and checks the same date parser again and throws the verification away. bhc elaborates every definition into its explicit meaning, with type class instances spelled out, and that meaning can be addressed by its content. A definition then carries an identity, a precise record of what has been checked about it and what has not, and signatures from whoever compiled, tested, reviewed or vouched for it. Two people who write the same function in different styles have written the same function, and their evidence pools on one object. The agent's job changes from "write this code" to "assemble this from meaning that is already checked, and where nothing exists, write it, prove it and leave it for the next one". [The Proof You Only Have to Write Once](/articles/the-proof-you-only-have-to-write-once/) has the long version.

That is what I mean by a different way of building software: the unit of software stops being a file of instructions and becomes a piece of verified meaning under a stated contract, shared across everyone who needs it.

It is also the part furthest from done. bhc is at version 0.2. It type-checks and compiles all 221 modules of Pandoc, and Pandoc's Markdown reader and HTML writer run end to end, but the garbage collector is not yet wired into compiled code, so long-running servers are not a fit yet ([status](https://arcanist.sh/bhc/status/)). The commons is a direction with its first steps on the roadmap, not a service you can use today. I am building toward it because I think it is where verification has to go once most code is generated, and Haskell is the language where that is closest to reachable.

## The obvious objection

The strongest argument against all of this is that agents are best at the languages with the most training data, so you should write everything in Python and TypeScript and stop worrying.

There is something to it, and both languages have earned their places. Python owns data science, machine learning and the notebook, where its libraries have no equal and much of the code runs once and is thrown away. JavaScript is the language of the browser, and TypeScript is how to write it without regret; a front end in anything else is usually a self-inflicted wound. But I rarely go back to either for anything that has to last. I used to reach for them for speed of writing and familiarity, and those are the costs an agent now absorbs; what remains is a runtime that finds type errors in production.

How fluently a model writes a language and what the result guarantees are different questions. The fluency gap is smaller than the objection assumes: MultiPL-E, which translated the standard code-generation benchmarks into 18 languages, found a model matching or beating its Python score in several of them ([Cassano et al., 2022](https://arxiv.org/abs/2208.08227)). The guarantee gap is measurable too: when researchers added type annotations to JavaScript bugs that had survived testing and review, TypeScript flagged 15% of them ([Gao, Bird and Barr, 2017](https://earlbarr.com/publications/typestudy.pdf)). Whatever gap remains between how well models write Rust and how well they write Python, it is a gap in the cheap part; the gap between what the two compilers check is in the expensive one.

The other fair objection is that four languages are three too many for one organisation. That is true for most companies, and it is why I would not hand this list to a company as a policy. A company should pick very few languages and give each one a job. Mine looks like this:

| If the thing you build | Reach for | Because |
|---|---|---|
| must not fail, sits on a hot path, handles hostile input, or replaces a mainframe core system | Rust | the compiler rules out whole classes of failure, with no garbage collector |
| is one of a hundred services many teams read and change | Go | one idiomatic way, fast builds, a monorepo without published libraries |
| is distributed by nature, real-time, omnichannel, or a small team's whole platform | Elixir | supervision, distribution and durable jobs come with the runtime |
| needs its correctness checked, shared and built on | Haskell with bhc | types as proofs, runtime contracts, verification that accumulates |
| lives in a notebook, a training loop or a browser | Python or TypeScript | that is where their libraries are, and nothing else comes close |

## What people will write instead

If agents write the code, what do people write? More and more, requirements: what a system must do, which cases matter, what must never happen, and who approves what. That writing is declarative when it is precise and descriptive when it is not, and in either case it says what should be true rather than how to get there.

The interest rule behind every snippet in this post, written the way I now write requirements, is a short Markdown file:

```markdown
## Monthly interest

- Interest is posted on the last business day of each month.
- Monthly interest is balance × annual rate ÷ 12, in cents,
  rounded half away from zero.
- A closed account never receives interest.
- Until the switch-over, the mainframe's result is the one that counts,
  and every difference from the new core is recorded.
```

and the cases that pin it down, in JSON:

```json
[
  { "case": "ordinary month", "account": { "status": "open", "balance": "1234.56" },
    "annual_rate": "0.015", "expect": { "interest": "1.54" } },
  { "case": "closed account", "account": { "status": "closed", "balance": "1200.00" },
    "annual_rate": "0.015", "expect": { "interest": "0.00" } }
]
```

Everything in the four languages above is downstream of those two files.

The formats for that writing are Markdown, for intent, decisions and the instructions agents read (a brief, a design record, an `AGENTS.md`), and JSON, with YAML and TOML as its friendlier relatives, for anything with structure: a schema, a configuration, a contract between two systems, the cases a test runs against (the same known cases that [Evaluation Closes the Loop](/articles/evaluation-closes-the-loop/) scores an agent on). Neither is a programming language, and those are the two formats I now edit most by hand. This site is an example: the writing is Markdown, the data is TOML and JSON, and most of the code that turns them into pages was written by agents.

Even that may be a passing stage. Markdown and JSON matter to people because people still read them, and as more of what they describe is checked by machines, the human part shrinks to stating intent and approving the result. A requirement precise enough for a machine to check is not far from a type (the argument of [Source Code Is the New Assembly](/articles/semantic-artifacts-and-meaning-engines/)), which is one more reason I think the Haskell bet is a bet on where requirements are heading, and not only on where code is.

## What is left of the choice

When the cost of writing code goes to zero, a language stops being a tool for writing and becomes a set of promises about code that nobody typed. Choose it for what it still promises after the agent has left the room.

## References

- Jeff Vander Stoep and Alex Rebert, [Eliminating Memory Safety Vulnerabilities at the Source](https://security.googleblog.com/2024/09/eliminating-memory-safety-vulnerabilities-Android.html), Google Security Blog, 25 September 2024.
- Jeff Vander Stoep, [Rust in Android: move fast and fix things](https://security.googleblog.com/2025/11/rust-in-android-move-fast-fix-things.html), Google Security Blog, 13 November 2025.
- Jesse Howarth, [Why Discord is switching from Go to Rust](https://discord.com/blog/why-discord-is-switching-from-go-to-rust), 4 February 2020.
- [Go 1 and the Future of Go Programs](https://go.dev/doc/go1compat), the Go 1 compatibility promise.
- WhatsApp, [1 million is so 2011](https://blog.whatsapp.com/1-million-is-so-2011), 6 January 2012.
- José Valim, [Elixir v1.20 released: now a gradually typed language](https://elixir-lang.org/blog/2026/06/03/elixir-v1-20-0-released), 3 June 2026, and [Type inference of all constructs and the next 15 months](https://elixir-lang.org/blog/2026/01/09/type-inference-of-all-and-next-15/), 9 January 2026.
- [Gleam](https://gleam.run/), a statically typed language for the BEAM, and [Gleam version 1](https://gleam.run/news/gleam-version-1/), 4 March 2024.
- [Tokio](https://tokio.rs/), the asynchronous runtime for Rust, and [rust_decimal](https://docs.rs/rust_decimal/), decimal numbers for financial calculations.
- [Oban](https://oban.hexdocs.pm/Oban.html), background jobs for Elixir backed by the database.
- arcanist.sh, [Manifesto](https://arcanist.sh/manifesto/), [The Commons](https://arcanist.sh/commons/), and [The Scorecard Is Right. The Weights Are Wrong.](https://arcanist.sh/blog/the-scorecard-is-right-the-weights-are-wrong/)
- [bhc](https://arcanist.sh/bhc/) and [where bhc stands](https://arcanist.sh/bhc/status/), last updated 20 October 2026.
- Federico Cassano et al., [MultiPL-E: A Scalable and Extensible Approach to Benchmarking Neural Code Generation](https://arxiv.org/abs/2208.08227), 2022.
- Zheng Gao, Christian Bird and Earl T. Barr, [To Type or Not to Type: Quantifying Detectable Bugs in JavaScript](https://earlbarr.com/publications/typestudy.pdf), ICSE 2017.
- Niels Mündler, Jingxuan He, Hao Wang, Koushik Sen, Dawn Song and Martin Vechev, [Type-Constrained Code Generation with Language Models](https://arxiv.org/abs/2504.09246), 2025.

### Further reading

On this site, the longer arguments behind this post:

- [The Last Programming Language Might Not Be for Humans](/articles/what-programming-languages-become-when-ai-writes-the-code/), on explicit, declarative and post-language futures, and why I bet on Haskell.
- [What Comes After the Last Programming Language](/articles/what-comes-after-the-last-programming-language/), on what the machine underneath becomes.
- [Why We Built a Haskell Package Manager in Rust](/articles/why-we-built-a-haskell-package-manager-in-rust/), Rust and Haskell in one project, each for its job.
- [The River and the Canal](/articles/the-river-and-the-canal/), the essay behind Aqueduct and durable execution.
- [How I Work These Days](/articles/how-i-work-these-days/), what working with coding agents looks like day to day.
- [The Proof You Only Have to Write Once](/articles/the-proof-you-only-have-to-write-once/), the commons for verified Haskell in full.

Rust and memory safety:

- [Fearless Concurrency](https://doc.rust-lang.org/book/ch16-00-concurrency.html), the chapter of *The Rust Programming Language* on what the compiler rules out in concurrent code.
- [The Case for Memory Safe Roadmaps](https://www.cisa.gov/resources-tools/resources/case-memory-safe-roadmaps), CISA and partner agencies, 6 December 2023, on planning the move away from memory-unsafe languages.
- [What is memory safety and why does it matter?](https://www.memorysafety.org/docs/memory-safety/), Prossimo at ISRG, a short primer.
- [Rust in the Linux kernel](https://docs.kernel.org/rust/index.html), the kernel's own documentation.
- Martin Fowler, [Strangler Fig Application](https://martinfowler.com/bliki/StranglerFigApplication.html), the pattern for replacing a legacy core system piece by piece while it keeps running.

Go and software engineering at scale:

- Rob Pike, [Go at Google: Language Design in the Service of Software Engineering](https://go.dev/talks/2012/splash.article), 2012, why Go is plain on purpose. The best single text on the argument in this post.
- [Effective Go](https://go.dev/doc/effective_go) and the [Go Proverbs](https://go-proverbs.github.io/), what idiomatic means in practice.
- [Go Modules Reference](https://go.dev/ref/mod), how import paths, versions and checksums work.

The BEAM, Elixir and Gleam:

- Joe Armstrong, [Making reliable distributed systems in the presence of software errors](https://erlang.org/download/armstrong_thesis_2003.pdf), PhD thesis, 2003, the reasoning behind supervisors and "let it crash".
- [OTP Design Principles](https://www.erlang.org/doc/system/design_principles.html), supervision trees and behaviours, from the Erlang documentation.
- Gary Rennie, [The Road to 2 Million Websocket Connections in Phoenix](https://www.phoenixframework.org/blog/the-road-to-2-million-websocket-connections), 3 November 2015, what one BEAM machine can hold open.
- Giuseppe Castagna, Guillaume Duboc and José Valim, [The Design Principles of the Elixir Type System](https://arxiv.org/abs/2306.06391), 2023, and the Elixir guide to [gradual set-theoretic types](https://hexdocs.pm/elixir/gradual-set-theoretic-types.html).
- [The Gleam language tour](https://tour.gleam.run/), the quickest way to see what typed code on the BEAM looks like.

Types as proofs, and verification that accumulates:

- Philip Wadler, [Propositions as Types](https://homepages.inf.ed.ac.uk/wadler/papers/propositions-as-types/propositions-as-types.pdf), the correspondence between programs and proofs that the Haskell bet rests on.
- Alexis King, [Parse, don't validate](https://lexi-lambda.github.io/blog/2019/11/05/parse-don-t-validate/), 2019, how to put invariants into types in everyday code.
- Yaron Minsky, [Effective ML Revisited](https://blog.janestreet.com/effective-ml-revisited/), Jane Street, the source of "make illegal states unrepresentable".
- [Unison](https://www.unison-lang.org/), the language that introduced content-addressed code, and arcanist.sh's [Building the Commons](https://arcanist.sh/blog/building-the-commons/), the engineering behind bringing it to Haskell.
