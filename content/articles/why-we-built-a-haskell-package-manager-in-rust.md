+++
title = "Why We Built a Haskell Package Manager in Rust"
date = 2026-04-13
description = "hx is a fast, opinionated Haskell toolchain built in Rust, following the playbook astral.sh used to modernize Python."

[taxonomies]
tags = ["oss", "platform-automation", "rust", "haskell"]
categories = ["patterns"]

[extra]
author = "Raffael"
image = "why-we-build-hx.avif"
og_image = "why-we-build-hx.png"
+++

Why would anyone invest serious engineering effort into Haskell tooling in 2026? Haskell is a niche language. It has been a niche language for thirty years. Most companies do not use it. Most developers have never written a line of it. If you are going to pour months of work into building a package manager and toolchain from scratch, in Rust no less, the obvious question is: why not just use Rust?

Here is the answer, and it is the same answer I gave in [The Last Programming Language Might Not Be for Humans](/articles/what-programming-languages-become-when-ai-writes-the-code/): the way we write software is changing. AI is becoming the primary author of code, and the languages that will matter most in that future are not the ones optimized for human typing speed. They are the ones optimized for formal correctness, composability, and provability. Haskell is not niche in that framing. It is early.

I have [written before](/articles/all-beginning-is-haskell/) about why Haskell shaped the way I think. The short version: Haskell teaches you to think about programs as compositions of well-typed transformations, and that discipline makes you better at everything else. I still believe this. I write most of my production software in Rust, but I think in Haskell.

The problem was never the language. The problem was everything around it.

## The state of Haskell tooling

If you want to start a Haskell project today, here is what you do. First you install ghcup, which manages GHC (the compiler), Cabal (the build tool), Stack (a different build tool), and HLS (the language server). Then you decide whether to use Cabal or Stack, which is a decision that has split the Haskell community for over a decade and which nobody has fully resolved. Then you configure your project, using either a `.cabal` file (a custom format that predates TOML, YAML, and JSON as configuration languages) or a `stack.yaml` plus a `.cabal` file (because Stack still needs Cabal files underneath). Then you wait for GHC to compile your dependencies, which takes long enough that you start questioning your life choices.

I am not exaggerating for effect. This is the actual experience. I have introduced Haskell to teams and watched the enthusiasm drain from people's faces during the toolchain setup. Not because the language was hard. Because the first thirty minutes were spent fighting `ghcup`, `cabal update`, resolver mismatches, and cryptic build errors that had nothing to do with the code they wanted to write.

Here is what a typical first encounter looks like. You want to write a small HTTP server in Haskell. You install ghcup. You install GHC 9.8.2. You run `cabal init`. You get a `.cabal` file with a dozen fields, most of which you do not understand yet. You add `warp` as a dependency. You run `cabal build`. GHC starts compiling `warp` and its transitive dependencies: `http-types`, `bytestring`, `text`, `network`, `streaming-commons`, `vault`, `wai`, and about forty others. This takes four to six minutes on a modern machine. The first time. Every time you switch GHC versions or clean your cache, you pay that cost again.

Now compare this with Rust. You run `cargo new my-server`. You add `axum` to `Cargo.toml`. You run `cargo build`. It compiles. The first build is not instant either, but `cargo` does not ask you which of two incompatible build tools you prefer, does not require a separate tool to manage the compiler, and does not present you with a configuration format from 2005.

Or Python. `uv init my-server`. `uv add fastapi`. `uv run`. Done. The entire dependency resolution and installation takes less than a second because `uv` resolves and installs in parallel, in Rust, without spawning Python.

Every major language ecosystem has converged on the same answer: one tool that handles project creation, dependency management, building, testing, and publishing. Haskell has three tools that each do part of the job, disagree about how dependencies should work, and require a fourth tool to manage the compiler itself.

This is not a new complaint. People have been talking about Haskell's tooling problem for years. The difference is that someone finally decided to do something about it the way [astral.sh](https://astral.sh) did for Python: rewrite the developer experience from scratch, in Rust, and make everything dramatically faster.

That someone was me.

## The astral.sh playbook

When Astral released `uv` and `ruff`, it proved something important. You can take a mature ecosystem with deeply entrenched tooling, rebuild the developer experience in Rust, and people will switch. Not because the old tools were broken. Because the new ones were fast enough and coherent enough that the switching cost paid for itself immediately.

Python's tooling situation before `uv` was remarkably similar to Haskell's. You had `pip`, `pip-tools`, `pipenv`, `poetry`, `conda`, `virtualenv`, `venv`, `pyenv`. Each solved part of the problem. Each had opinions that conflicted with the others. Setting up a Python project from scratch meant choosing a stack of tools, hoping they worked together, and accepting that your lockfile format depended on which combination you picked. Sound familiar?

Astral looked at that landscape and did not try to fix any single tool. They rewrote the experience. `uv` is a single Rust binary that does what `pip`, `pip-tools`, `virtualenv`, and `pyenv` did, but 10-100x faster and with a coherent interface. `ruff` is a single Rust binary that does what `flake8`, `isort`, `pycodestyle`, and `pyflakes` did, but 100x faster. The Python community did not switch because they were told to. They switched because the tools were obviously better the first time they used them.

The playbook has three steps:

1. **Wrap first.** Use the existing tools under the hood rather than reimplementing everything. `uv` wraps pip's package index and resolver logic. hx wraps GHC and Cabal.
2. **Tame second.** Add better error messages, faster startup, unified configuration, and workflows that make sense. This is where most of the user-facing value lives.
3. **Replace last.** Only replace underlying components when you have to. For hx, that meant building a native build mode that bypasses Cabal entirely for simple projects, and a native dependency resolver in Rust that is 24x faster than Cabal's constraint solver.

This approach is pragmatic in a way that matters. You do not need to rebuild the world to improve the experience. You need to rebuild the surface. The parts that people touch every day.

## Why Rust

The choice to build hx in Rust is not tribalism. It is a direct response to a structural problem.

Haskell's existing tooling is written in Haskell. This creates a bootstrap problem. To build the build tool, you need the compiler. To install the compiler, you need the compiler manager. To build the compiler manager, you need a compiler. The dependency chain is circular, and every link in it is slow to compile.

Think about what this means in practice. You are a new developer. You want to try Haskell. You download ghcup. ghcup is a shell script that downloads a pre-built GHC binary, but it also installs Cabal, which is itself a Haskell binary compiled with GHC. If the pre-built binary does not exist for your platform, you need GHC to build Cabal, but you need Cabal to set up GHC. The bootstrap documentation exists because the bootstrap problem exists, and it exists because the tools are written in the language they manage.

GHC's runtime system adds initialization overhead to every invocation. When you type `cabal build`, the first 45 milliseconds are spent starting the GHC runtime before Cabal even begins to think about your project. Stack is worse at 89 milliseconds. These numbers sound small until you are running commands in a tight development loop, hitting save and expecting the build to start instantly. Or in CI, where the build tool is invoked hundreds of times across a pipeline and those milliseconds compound into minutes.

hx starts in 12 milliseconds. Not because Rust is magic. Because a native binary without a garbage-collected runtime does not need to initialize one. The tool should not have the same dependencies as the thing it manages.

```shell
hx build    # 12ms startup + build time
cabal build # 45ms startup + build time
stack build # 89ms startup + build time
```

Memory tells the same story:

| Tool | Startup memory | Build memory (simple project) |
|------|---------------|-------------------------------|
| hx | 8 MB | 45 MB |
| cabal | 45 MB | 250 MB |
| stack | 85 MB | 320 MB |

For a tool you invoke constantly, this matters. Especially on CI runners with constrained memory, or on a laptop where you have four terminal panes open with different projects.

The Rust decision also solves the distribution problem. A Rust binary is a single static executable that cross-compiles trivially. No runtime dependencies. No "install GHC first so you can install the tool that installs GHC." `curl | sh` and you are running. hx is available via the install script, Cargo, aqua, winget on Windows, and Homebrew. Every distribution channel ships a self-contained binary.

## What hx actually does

hx replaces the `cabal + stack + ghcup + fourmolu + hlint` workflow with a single binary:

```shell
curl -fsSL https://arcanist.sh/hx/install.sh | sh
hx new my-app && cd my-app
hx run
```

No ghcup. No stack. No cabal-install. One tool, one configuration file, one lockfile format.

### Configuration

The configuration is `hx.toml`. Not a `.cabal` file with its custom syntax that nobody can parse without a library. Not a `stack.yaml` with YAML indentation traps. TOML, the same format that Rust (`Cargo.toml`), Python (`pyproject.toml`), and most modern tools have converged on.

```toml
[project]
name = "my-app"
kind = "bin"

[toolchain]
ghc = "9.8.2"

[build]
optimization = 2
warnings = true

[format]
formatter = "fourmolu"

[lint]
hlint = true

[hooks]
pre-build = "scripts/generate-version.sh"
post-test = "scripts/notify.sh"
```

Everything in one file. The toolchain version is pinned per-project, so different projects can use different GHC versions without conflict. When you run `hx build` in a project pinned to GHC 9.8.2 and another pinned to 9.6.4, hx switches automatically. No `ghcup set` commands. No global state.

### Lockfiles

The lockfile is also TOML. Every dependency is pinned with a sha256 fingerprint:

```toml
version = 1
ghc = "9.8.2"
created_at = "2026-01-16T00:00:00Z"

[[package]]
name = "aeson"
version = "2.2.1.0"
sha256 = "a5a5b8a..."
deps = ["base", "text", "bytestring"]
```

`hx lock --check` in CI fails if the lockfile is stale. This is deterministic by default. Not "deterministic if you remember to run `cabal freeze` and commit the freeze file and hope nobody ran `cabal update` on a different machine." Deterministic the way `cargo` and `uv` are deterministic. Automatically. Every time.

If you are coming from Stack, you might say "Stack already has lockfiles." It does. Stack's approach is to pin to a Stackage snapshot, which gives you a curated set of packages known to work together. This is a valid approach, but it means your dependency versions are dictated by what the Stackage maintainers decided to include in that snapshot. If you need a newer version of a package that is not in the current LTS, you start adding `extra-deps`, and your reproducibility guarantees become more complex. hx resolves from Hackage directly, pins every version, and verifies checksums. You control exactly what you get.

### Native builds

For simple projects with only `base` dependencies, hx has a native build mode that bypasses Cabal entirely. It constructs the module graph itself and invokes GHC directly:

| Operation | hx native | hx (cabal backend) | cabal | stack |
|-----------|-----------|-------------------|-------|-------|
| Cold build | 0.48s | 2.52s | 2.68s | 3.2s |
| Incremental | 0.05s | 0.35s | 0.39s | 0.52s |
| Single file change | 0.31s | 1.42s | 1.42s | 1.8s |

5.6x faster cold builds. 7.8x faster incremental builds. The difference comes from eliminating Cabal's package database queries, build plan calculation, and job scheduling overhead.

Where does the time go in a normal Cabal build? Roughly: runtime initialization (45ms), reading the package database (80-120ms), computing the build plan (200-400ms depending on dependency count), checking file timestamps through the Cabal build system (100-200ms), and only then invoking GHC. hx native mode skips all of that. It reads file timestamps directly, constructs a minimal module graph, and calls GHC with exactly the flags needed. For projects with external dependencies, hx falls back to the Cabal backend transparently. You do not have to think about it.

### Dependency resolution

hx includes a native dependency resolver written in Rust. The `hx-solver` crate implements constraint resolution using the same algorithm as Cabal's solver, but without the overhead of GHC's runtime:

| Direct dependencies | hx | cabal |
|--------------------|-----|-------|
| 10 packages | 5ms | 120ms |
| 20 packages | 18ms | 450ms |
| 50 packages | 85ms | 2.8s |
| 100 packages | 320ms | 12.5s |

At 100 dependencies, hx resolves in 320 milliseconds. Cabal takes 12.5 seconds. In a real-world test with 20 direct dependencies and their transitive closure, hx resolved in 1.2 seconds versus 8.5 seconds for `cabal freeze`. Stack's resolver is faster at 0.8 seconds because Stackage snapshots are pre-computed, but you trade resolution speed for version flexibility.

### Error messages

Haskell's reputation for cryptic error messages is partly deserved and partly a tooling problem. GHC type errors can be daunting, but build tool errors are often worse because they mix configuration issues with compilation issues in unhelpful ways. "Could not resolve dependencies" from Cabal tells you almost nothing about which constraint is blocking resolution or what you could change to fix it.

hx uses structured error codes with actionable suggestions:

```
E0012: Package 'aeson' not found in local index

  The package index may be outdated.
  Run: hx index update

  Or add the package explicitly:
  Run: hx add aeson
```

```
E0020: GHC version mismatch

  Project requires GHC 9.8.2 but 9.6.4 is active.
  Run: hx toolchain install 9.8.2
```

Every error has a code, a human-readable explanation, and a concrete command to fix it. `hx doctor` runs a comprehensive diagnostic of your entire environment, checking GHC, Cabal, HLS, PATH configuration, and project setup, reporting exactly what is wrong and how to fix each issue.

### Everything else

hx bundles the rest of the development workflow too. `hx fmt` wraps fourmolu for formatting. `hx lint` wraps hlint. `hx coverage --html --open` generates an HTML coverage report and opens it in your browser. `hx doc --open` builds Haddock documentation and serves it locally. `hx watch` detects file changes in 15 milliseconds (versus 180ms for `stack --file-watch`) and triggers rebuilds or test runs. `hx profile --heap` generates heap profiles for memory analysis.

The goal is that you should never need to leave hx to do something with your Haskell project. Not because hx reimplements everything, but because it wraps the best existing tools with a consistent interface and fast orchestration.

There is also a plugin system using Steel, a Scheme dialect, for custom build lifecycle hooks:

```scheme
;; .hx/plugins/check-todos.scm
(define (on-build-success project)
  (when (file-exists? "TODO.md")
    (warn "Do not forget to update TODO.md")))

(register-hook 'post-build on-build-success)
```

Plugins live in `.hx/plugins/` and time out after a configurable interval so a misbehaving script cannot stall your build. They hook into pre-build, post-build, pre-test, post-test, and other lifecycle events. Lightweight enough that you can add project-specific automation without maintaining a separate build script.

### Migration

If you have an existing project, hx can import it:

```shell
hx init --from-cabal   # Import from an existing .cabal project
hx init --from-stack   # Import from a Stack project
```

It reads your existing configuration, generates `hx.toml`, creates a lockfile, and you are running. The `.cabal` file is preserved for compatibility. hx reads it for package metadata and dependency specifications, but the build configuration and toolchain management move to `hx.toml`.

## The architecture

hx is structured as a Rust workspace with 14 crates:

{% diagram(title="hx workspace architecture") %}
                          hx-cli
                            |
              +-------------+-------------+
              |             |             |
          hx-core       hx-config      hx-ui
              |             |
    +---------+---------+   |
    |         |         |   |
hx-cabal  hx-solver  hx-lock
    |         |
hx-cache  hx-toolchain
    |
hx-doctor

Separate concerns: hx-plugins, hx-lsp, hx-warnings, hx-telemetry
{% end %}

Each crate has a single responsibility. `hx-solver` knows how to resolve dependencies but nothing about building. `hx-cabal` knows how to invoke Cabal but nothing about configuration. `hx-toolchain` manages GHC installations but nothing about lockfiles. This separation means you can test the resolver without setting up a build environment, and you can change the build backend without touching the resolver.

The `hx-lsp` crate is worth calling out. It provides language server protocol support, which means hx can manage HLS (Haskell Language Server) versions matched to your project's GHC version. When your project uses GHC 9.8.2, hx ensures HLS is compatible. No more "HLS crashed because it was compiled with a different GHC than your project uses." This is a problem that has frustrated Haskell developers for years, and it is entirely a tooling coordination problem.

## The bigger picture

I built hx because I needed it. But the timing is not accidental.

In [The Last Programming Language Might Not Be for Humans](/articles/what-programming-languages-become-when-ai-writes-the-code/), I laid out three futures for programming languages as AI becomes the primary author of code. The first future is explicit languages designed to minimize LLM errors through tight feedback loops. The second is declarative languages where code describes what something is rather than how to compute it, and the type system acts as a proof checker. The third is no language at all, where AI generates machine code directly.

I bet on the second future. Here is why.

When an LLM writes imperative code, it has to track mutable state across dozens of lines, reason about the order of side effects, and hold implicit language behaviors in context. When it writes Haskell, it expresses a relationship between inputs and outputs, and the compiler verifies that the relationship is consistent. The model does not need to simulate execution step by step. It needs to generate an expression that satisfies type constraints. This is what LLMs are good at. Pattern recognition. Constraint satisfaction. Formal structure.

Consider what happens when an AI generates a Haskell function with a wrong type. The compiler does not produce a vague runtime error three layers deep in a call stack. It produces a precise, localized type error at compile time: "Expected `[LogEntry] -> [ErrorSummary]`, got `[LogEntry] -> [LogEntry]`." The model reads this, adjusts, and re-generates. The feedback loop is tight, but unlike the explicit-language approach, the tightness comes from the type system itself, not from bolted-on contracts. The correctness guarantees are structural, not ceremonial.

This matters even more when you think about code that has to survive time. Procedural code decays. Three years from now, nobody remembers why a function mutates a global variable on line 47. The variable name made sense to whoever wrote it. The mutation order made sense in the context of the original design. But context evaporates. Types do not. A function signature that says `Request -> Policy -> Decision` is self-documenting in a way that no amount of comments on imperative code can match. The proof is in the types, and the types are checked by the compiler, not by human memory.

But none of that matters if nobody can set up a Haskell project without losing thirty minutes to toolchain configuration. The language's virtues are locked behind a tooling wall. You can have the most expressive type system in production use, the most rigorous correctness guarantees, the best theoretical fit for agent-assisted development, and it means nothing if a developer's first experience is fighting `ghcup` for half an hour. First impressions are permanent, and Haskell's first impression has been "powerful but painful" for too long.

If Haskell is going to be relevant in a world where AI writes most of the code, the experience of using Haskell has to be as fast and frictionless as the experience of using Rust or Python. Not comparable. Equal. That is what hx is for. Not to make Haskell slightly more convenient. To remove the tooling objection entirely, so the conversation can be about the language's actual strengths instead of its ecosystem's historical baggage.

And hx is just the first step. [BHC](https://arcanist.sh/bhc/), the Basel Haskell Compiler, goes further. GHC is a remarkable piece of engineering, but it was designed for a world where Haskell ran on desktops and servers with one performance profile. BHC is a clean-slate Haskell compiler, also written in Rust, offering six runtime profiles for different deployment targets:

- **Server**: structured concurrency with automatic cancellation, observability hooks, deadline-aware scheduling
- **Numeric**: strict-by-default in hot paths, tensor lowering, SIMD auto-vectorization, GPU backends for CUDA and ROCm
- **Edge**: minimal runtime footprint, direct WASM emission, designed for Cloudflare Workers and Fastly Compute
- **Realtime**: bounded GC pauses under 1 millisecond, arena allocation, designed for games and audio processing
- **Embedded**: no GC at all, static allocation, bare-metal targets like ARM Cortex-M

Same language. Same type safety. Different performance contracts depending on what you are building. Your security policy engine compiles with the server profile. Your tensor pipeline compiles with the numeric profile and runs on a GPU. Your edge function compiles to WASM. You do not change your source code. You change the compiler flag.

hx already supports BHC as an alternative backend:

```shell
hx build --compiler=bhc --profile=server
```

One flag. Same project. Different runtime.

The vision behind [arcanist.sh](https://arcanist.sh) is that Haskell's ideas deserve infrastructure that matches their ambition. The language has always been decades ahead of its tooling. hx closes the gap on the developer experience side. BHC closes it on the runtime side. Together, they make the case that Haskell is not a language for academics and hobbyists. It is a language for the era we are entering, where correctness is not a luxury, it is the load-bearing structure of software that AI writes and humans verify.

The tooling is not separate from the thesis. The tooling IS the thesis.

## The Bet, What If I am Wrong

I want to be direct about something. This is a gamble.

I do not know whether Haskell will go through a revival. Nobody does. Nobody knows how AI-assisted development will actually evolve, which languages will matter in five years, or whether the thesis I outlined in the previous post will hold up against what reality delivers. I have a conviction, not a crystal ball.

I spent months building hx and BHC. Months of my own time, and to be perfectly blunt, a significant number of Anthropic's Claude tokens. I pair-programmed most of this with Claude Code on my Max subscription, and that is not a footnote. It is part of the story. The tools I am building for AI-assisted Haskell development were themselves built using AI-assisted development. If that sounds circular, it is. The thesis tested itself during its own construction.

But I could be wrong. Haskell could remain niche forever. The AI era could favor a language nobody has thought of yet. The intermediate layer might not evolve the way I expect. The industry might double down on Python and TypeScript for agent-assisted workflows and never look back. These are all plausible outcomes.

What I can do is build toward what I believe in and put the work out in the open. If I am right, Haskell gets the tooling it always deserved, and the language is ready when the moment arrives. If I am wrong, the ideas in hx and BHC, fast Rust-based tooling, deterministic lockfiles, multiple runtime profiles, structured error messages, are valuable regardless. Good infrastructure design does not expire just because the language it serves does not win the popularity contest.

And honestly, even on the unlikely side, I would rather have tried and been wrong than watched from the sidelines while the most elegant language I have ever used slowly faded because nobody bothered to fix the parts that were not the language.

At least I have tried.

## Try it

```shell
curl -fsSL https://arcanist.sh/hx/install.sh | sh
hx new my-app && cd my-app
hx run
```

Then try `hx doctor`, `hx fmt`, `hx test --watch`. See how it feels when the tooling gets out of your way.

hx is MIT-licensed and open source. If you have opinions about Haskell tooling, I want to hear them.
