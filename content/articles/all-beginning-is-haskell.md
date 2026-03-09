+++
title = "All beginning is Haskell"
date = 2023-03-06
updated = 2026-03-09
description = "How Haskell shaped the way I think about building systems, and why I am still building Haskell tooling years after writing my first monad."

[taxonomies]
tags = ["oss"]
categories = ["deep-dives"]

[extra]
author = "Raffael"
image = "all-beginning-is-haskell.avif"
og_image = "all-beginning-is-haskell.png"
+++

This site is called raskell.io. That is not an accident.

I started learning Haskell because I liked mathematics and someone told me there was a programming language built on top of it. Not "inspired by" in the loose way that every language claims some mathematical foundation. Actually built on lambda calculus, category theory, and type theory, in a way where the math is not decoration but structure.

What I did not expect was how thoroughly it would rewire the way I think about building software. Not because Haskell is the best language for every task. It is not, and I write far more Rust than Haskell these days. But because Haskell teaches you to think about programs in a way that makes you better at everything else.

## What Haskell actually teaches you

Most introductions to Haskell talk about pure functions, immutability, and monads. They are not wrong, but they miss the point. The point is not any single feature. It is how those features combine into a way of thinking about programs as compositions of well-typed transformations.

In an imperative language, you think about sequences of steps. Do this, then that, then check a condition, then loop. The program is a recipe. In Haskell, you think about transformations. What goes in, what comes out, what shape does the data have at each stage. The program is a pipeline.

This sounds abstract until you see it in practice. Suppose you need to process a list of user records: filter out inactive users, extract their email addresses, and normalize them to lowercase.

In an imperative style, you write a loop with conditions and mutations. In Haskell:

```haskell
activeEmails :: [User] -> [Email]
activeEmails = map (normalize . email) . filter isActive
```

One line. Read it right to left: filter active users, then map over the result, extracting and normalizing emails. The type signature tells you what goes in (`[User]`) and what comes out (`[Email]`). No mutation. No intermediate variables. No place for off-by-one errors or null pointer exceptions.

The type signature is not just documentation. It is a contract enforced by the compiler. If `isActive` expects a `User` and you pass it a `String`, the program will not compile. If `normalize` returns an `Email` but you try to use it as a `String`, the program will not compile. The compiler is your first reviewer, and it is tireless.

## Types as design tools

The deeper lesson is that types are not just error catchers. They are design tools.

When I design a system in Haskell, I start with the types. What are the entities? What are the relationships? What transformations are valid? The type system forces you to be precise about these questions before you write any logic. This precision surfaces design problems early, when they are cheap to fix.

Consider modeling a document that can be in one of several states:

```haskell
data Document
  = Draft { content :: Text, author :: UserId }
  | UnderReview { content :: Text, author :: UserId, reviewer :: UserId }
  | Published { content :: Text, author :: UserId, publishedAt :: UTCTime }
```

This is an algebraic data type. Each variant carries exactly the data that makes sense for that state. A `Draft` has no reviewer. A `Published` document has a timestamp. You cannot accidentally access a reviewer on a draft because the type system will not let you. The invalid state is unrepresentable.

This pattern, making illegal states unrepresentable, is perhaps the most valuable idea I took from Haskell. I use it in Rust constantly. Rust's `enum` with associated data is directly descended from Haskell's algebraic data types, and the same design principle applies: encode your invariants in the type system and let the compiler enforce them.

## The monad is not the point

Every Haskell introduction eventually gets to monads, usually with a metaphor involving burritos or boxes. I will skip the metaphor.

A monad is a pattern for sequencing computations that carry some context. The `IO` monad carries the context of interacting with the outside world. The `Maybe` monad carries the context of possible failure. The `State` monad carries the context of mutable state. The pattern is the same in each case: take a value in a context, apply a function that produces a new value in a context, get back a combined context.

```haskell
lookupUser :: UserId -> IO (Maybe User)
lookupUser uid = do
  conn <- getConnection
  result <- query conn "SELECT * FROM users WHERE id = ?" [uid]
  return (listToMaybe result)
```

The `IO` monad here sequences database operations. The `Maybe` handles the case where no user is found. The types tell you both things at a glance: this function does I/O and might not return a result.

The point of monads is not that they are clever. The point is that they make effects explicit and composable. In most languages, a function can do I/O, throw exceptions, mutate global state, or launch missiles, and you cannot tell from its signature. In Haskell, the type signature tells you exactly what effects a function can have. `Int -> Int` is pure. `Int -> IO Int` does I/O. `Int -> Maybe Int` can fail. The information is right there, enforced by the compiler.

This discipline, making effects explicit, changed how I design APIs even in languages that do not enforce it. When I write a Rust function that returns `Result<T, E>`, I am using the same pattern: making failure explicit in the type rather than hiding it behind an exception. Rust learned this from Haskell, and so did I.

## Why I am still building Haskell tooling

If Haskell taught me so much, why do I mostly write Rust?

The honest answer: Haskell's ecosystem has gaps. The language itself is excellent. GHC is one of the most sophisticated compilers ever built. The type system is unmatched in its expressiveness among production languages. But the surrounding infrastructure, the package management, the build tooling, the deployment story, has not kept pace.

Dependency management in Haskell is fragmented. Cabal and Stack coexist with overlapping but incompatible approaches. Build times are long. Cross-compilation is painful. Setting up a Haskell development environment from scratch still involves more friction than it should in 2026.

This is why hx exists. hx is a Haskell toolchain CLI that I am building in Rust. The choice of implementation language is deliberate. Haskell's tooling problems are partly caused by tooling that is itself written in Haskell, creating bootstrap problems and long compile times for the tools themselves. A Rust binary starts instantly, compiles to a single static executable, and cross-compiles trivially. The tool should not have the same dependencies as the thing it manages.

hx is distributed through [mise](https://raskell.io/articles/mise-ate-my-makefile/) (naturally), as well as through AUR, Homebrew, Scoop, and Chocolatey. The goal is that setting up a Haskell project should be as frictionless as setting up a Rust project: one command to install the toolchain, one command to build.

On the other end of the spectrum, bhc (the Basel Haskell Compiler) is an experiment in taking Haskell in a direction GHC was never designed for: compiling Haskell for low-latency runtimes without a garbage collector. The target is workloads like tensor pipelines and real-time systems where GC pauses are not acceptable. bhc is early and ambitious, but it comes from the same conviction: Haskell's ideas deserve better infrastructure than they currently have.

## The Haskell in my Rust

I write Rust the way Haskell taught me to think.

Rust's ownership model is not the same as Haskell's purity, but it serves a similar purpose: it forces you to think about data flow explicitly. In Haskell, you cannot mutate a value because the language will not let you. In Rust, you can mutate, but the borrow checker forces you to be explicit about who owns the data and who can see it. Both languages make you think before you write.

[Conflux](https://github.com/raskell-io/conflux), my CRDT engine, uses algebraic data types for its merge semantics. Each CRDT field type (LwwRegister, GrowOnlySet, ObservedRemoveSet) is an enum variant with associated data, exactly the pattern I described above. The merge function is associative, commutative, and idempotent. These are mathematical properties that I learned to care about from Haskell, where such properties are often expressed as type class laws.

[Zentinel](https://zentinelproxy.io), the reverse proxy, uses Rust's type system to enforce that WAF decisions are handled in the correct pipeline stage. An `AgentDecision` is either `Allow`, `Block`, or `Modify`, and the proxy's merge logic ensures that a `Block` from any agent cannot be overridden. The pattern is a monoid (decisions combine associatively with `Block` as the absorbing element), though nobody would call it that in the Rust codebase. The concept came from Haskell. The implementation is pure Rust.

Even [Shiioo](https://github.com/raskell-io/shiioo), the agentic orchestrator, uses Haskell-influenced patterns. DAG workflows are compositions of typed transformations. Events are algebraic data types with exhaustive pattern matching. The event-sourcing model treats state as a fold over an event stream. `foldl` in Haskell, `Iterator::fold` in Rust. Same idea, different syntax.

## Why "raskell"

The name is a portmanteau. Raffael plus Haskell. I chose it because Haskell is where my engineering thinking started to take its current shape. Not the first language I learned, but the first one that changed how I think about all the others.

I do not believe you need to write Haskell to benefit from Haskell. But I believe that learning it, really learning it, not just reading about monads but building something real with algebraic data types and type classes and higher-order functions, will make you a better engineer in whatever language you actually use.

All beginning is Haskell. The rest is implementation.

## References and further reading

### Learning Haskell
- [Haskell Language](https://www.haskell.org/) - Official site with documentation and community links
- [Learn You a Haskell for Great Good!](https://learnyouahaskell.com/) - Approachable illustrated introduction
- [Real World Haskell](https://book.realworldhaskell.org/) - Practical Haskell for production use
- [Haskell Wiki](https://wiki.haskell.org/) - Community-maintained reference and tutorials
- [Typeclassopedia](https://wiki.haskell.org/Typeclassopedia) - Comprehensive guide to Haskell's type class hierarchy

### Type systems and theory
- [Haskell Curry](https://en.wikipedia.org/wiki/Haskell_Curry) - The logician the language is named after
- [Lambda calculus](https://en.wikipedia.org/wiki/Lambda_calculus) - Alonzo Church's formal system underlying Haskell
- [Hindley-Milner type system](https://en.wikipedia.org/wiki/Hindley%E2%80%93Milner_type_system) - The type inference algorithm at the core of Haskell and ML
- [Making illegal states unrepresentable](https://blog.janestreet.com/effective-ml-revisited/) - Yaron Minsky's influential talk on using types for correctness
- [Algebraic data types](https://wiki.haskell.org/Algebraic_data_type) - Haskell wiki reference on sum and product types

### Monads and effects
- [Philip Wadler, "Monads for functional programming"](https://homepages.inf.ed.ac.uk/wadler/papers/marktoberdorf/baastad.pdf) - The foundational paper on monads in programming
- [All About Monads](https://wiki.haskell.org/All_About_Monads) - Haskell wiki guide to monadic programming

### Haskell tooling
- [GHC](https://www.haskell.org/ghc/) - The Glasgow Haskell Compiler
- [Cabal](https://www.haskell.org/cabal/) - Haskell's build and package system
- [Stack](https://docs.haskellstack.org/) - Alternative build tool with curated package sets
- [mise-hx](https://github.com/raskell-io/mise-hx) - mise plugin for the hx Haskell toolchain CLI

### Projects referenced
- [Conflux](https://github.com/raskell-io/conflux) - CRDT engine using algebraic data types for merge semantics
- [Zentinel](https://zentinelproxy.io) - Reverse proxy with monoid-based decision merging
- [Shiioo](https://github.com/raskell-io/shiioo) - Agentic orchestrator using event-sourced state folds
