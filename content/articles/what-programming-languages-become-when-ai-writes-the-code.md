+++
title = "The Last Programming Language Might Not Be for Humans"
date = 2026-04-11
description = "Someone built a programming language designed for LLMs to write. I had the same idea in December. Here are three futures for the intermediate layer between human intent and machine execution, and why I bet on Haskell."

[taxonomies]
tags = ["ai-for-ops", "oss"]
categories = ["patterns"]

[extra]
author = "Raffael"
image = "what-programming-languages-become-when-ai-writes-the-code.avif"
og_image = "what-programming-languages-become-when-ai-writes-the-code.png"
+++

This morning I was standing at my desk, drinking watered-down instant coffee, doing what I do every morning after triaging the high-alert emails and notifications: thirty minutes of HackerNews. It is a ritual I time-box and never skip. I go to the office every day, and whether I am at that desk or at my home desk, the morning is the same. Coffee, posture, front page.

HackerNews remains one of the best ways to keep a finger on the pulse of the Bay Area, of tech, of science, of whatever intellectually stimulating thought surfaced overnight. I follow a handful of curated newsletters too, but I have noticed over the years that HN covers most of their content anyway if you know how to filter high signal from low signal. I could write something about a different link every single day. Most mornings I resist. This morning I did not.

A link caught my eye. [Vera](https://veralang.dev/), a new programming language "designed for machines to write, not humans." Statically typed, purely functional, compiles to WebAssembly, uses Microsoft's Z3 solver for contract verification. It has a ferret mascot. I like animal mascots for tech projects. Ferris the crab for Rust, the gopher for Go, the Shisa guardian dog for [Zentinel](https://zentinelproxy.io/). The ferret is a good choice.

But the mascot is not why I stopped scrolling. I stopped because somebody had built the thing I had been thinking about since Christmas.

## The Christmas realization

I had been a paying Claude Code subscriber since May 2025, when Anthropic first launched it. The CLI orientation made sense to me immediately, even though the early rate limits and model quality left me wanting more. By December 2025, I had upgraded to the Max subscription, I was on vacation, and Anthropic had made the daily limits generous that month. I was burning through every idea I had accumulated over the years. Some were good. Some were terrible. All of them were finally testable in a way they had not been before, because I could pair-program with a model that kept up. I wrote about that shift more fully in [How I Work These Days](/articles/how-i-work-these-days/), the short version being that late 2025 was when the relationship between ambition and execution fundamentally changed for me. The dam broke. Ideas that had been sitting in notebooks for years started becoming real software in days.

It was during one of those late-night sessions, deep in a Claude Code conversation about compiler design, that a thought crystallized. I had been building [hx](https://arcanist.sh/hx/) and thinking about how AI would change the way people write Haskell, when I realized the question was bigger than Haskell. Agent-assisted software development is approaching a point where the output language itself, the intermediate layer we use to express how information should be processed, is going to change fundamentally.

This is not an abstract observation. Programming languages have always been shaped by who writes them. Assembly was shaped by hardware engineers who thought in registers and opcodes. C was shaped by systems programmers who needed portable abstractions over memory. Python was shaped by people who wanted to get things done without fighting the syntax. COBOL was shaped by business analysts who wanted code that read like English. Every language carries the fingerprints of its intended author. If AI becomes the primary author of code, it follows that the language should adapt to that new author's strengths and weaknesses.

I kept coming back to three concrete possibilities. Three ways the intermediate layer could evolve. Not competing visions, exactly. More like three points on a timeline.

## Make the language explicit enough for machines

Anyone who has spent real time with coding agents has seen the failure mode. You ask an LLM to write a Python function. The output looks plausible. It passes linting. The variable names are reasonable. The structure follows common patterns. Then it fails at runtime because of a subtle implicit behavior the model did not track. A default mutable argument that gets shared across calls. A generator that gets silently exhausted on second iteration. A method that returns `None` instead of raising an exception because some library author decided that was more "Pythonic." The model was not wrong about the algorithm. It was wrong about the language's hidden behaviors.

This is the problem Vera is trying to solve, and the first approach I had been contemplating. Take the simplicity and explicitness of Go, push it further, and design a language where every instruction, every method, every design pattern is as unambiguous as possible. No implicit behaviors. No naming ambiguity. No style choices. One canonical way to write everything, so that an LLM does not have to waste inference tokens reasoning about which of seventeen valid approaches to take.

The language would need excellent compiler diagnostics. Not just "type mismatch on line 47," but structured feedback that a model can parse, understand, and act on immediately. Rust and Elixir already do this well for humans. Do it even better, and do it for machines.

The pipeline looks like this:

{% diagram(title="Explicit language feedback loop") %}
+-------+     prompt      +-------+    explicit     +-----------+
| Human | ------------->  |  LLM  | ------------->  | Verifying |
+-------+                 +-------+    source       | Compiler  |
                             ^                      +-----------+
                             |                           |
                             |   structured error        |
                             |   + suggested fix         |
                             +---------------------------+
                                                         |
                                                    verified
                                                         |
                                                         v
                                                  [correct program]
{% end %}

The key insight is the feedback loop. The compiler does not just reject bad code. It explains what is wrong in terms the model can act on, with a concrete fix suggestion. The model re-generates. The compiler re-checks. You converge on correct code through iteration, and the tightness of that loop depends on how unambiguous the language is and how actionable the errors are.

Vera is exactly this idea, executed with conviction. Here is what a function looks like:

{% vera() %}
public fn safe_divide(@Int, @Int -> @Int)
  requires(@Int.1 != 0)
  ensures(@Int.result == @Int.0 / @Int.1)
  effects(pure)
{
  @Int.0 / @Int.1
}
{% end %}

No variable names at all. Parameters are referenced by type and positional index using De Bruijn slot notation. `@Int.0` is the most recently bound integer, `@Int.1` is the one before that. Every function must declare its preconditions (`requires`), postconditions (`ensures`), and side effects (`effects`). The compiler verifies contracts statically using Z3 where possible and falls back to runtime checks for what it cannot decide at compile time.

The design principle is sharp: the model does not need to be right, it needs to be checkable. The language constrains the space of valid programs so tightly that the compiler catches mistakes before execution and explains them in natural language. Division by zero is not a runtime exception. It is a contract violation caught during compilation.

Think of it like this. Traditional languages are an open field. You can walk in any direction, and you might end up somewhere useful or you might walk off a cliff. Vera is a guided path with guardrails. You can only go certain directions, and every time you try to step off the path, a sign tells you exactly where to step instead. An LLM on an open field will wander. An LLM on a guided path will converge.

The early benchmark results are interesting, if mixed. Kimi K2.5 apparently writes perfect Vera code, scoring 100% on VeraBench and beating its own Python and TypeScript scores. Other models do not fare as well. Claude Opus 4 scores 88% in Vera versus 96% in Python. The Vera team is honest about this variance, which I appreciate. The [HackerNews discussion](https://news.ycombinator.com/item?id=47696263) was thin, twelve points and three skeptical comments, which tells you how early this conversation still is. The broader developer community has not engaged with this idea seriously yet. That will change.

But there is something that bothers me about optimizing the language for how machines iterate on solutions. Look at the pipeline diagram again. The LLM is still generating step-by-step instructions. It is still describing HOW to do things, just with the ambiguity stripped out and the contracts made explicit. The machine still reasons through the process sequentially. You have reduced the noise in the feedback loop, but you have not changed the nature of the signal. The model is still writing recipes. They are just more precise recipes.

What if you stopped writing recipes entirely?

## Describe what, not how

The second idea starts from a different premise. Instead of making procedural code easier for AI to write correctly, change what you ask the AI to express.

Let me make this concrete. Say you need to find the ten most recent server errors in a log. Here is how you would describe that process in a procedural language:

```python
errors = []
for entry in log_entries:
    if entry.status >= 500:
        errors.append({
            "time": entry.timestamp,
            "path": entry.path,
            "code": entry.status
        })
errors.sort(key=lambda e: e["time"], reverse=True)
return errors[:10]
```

You are telling the machine: create an empty list. Walk through each entry. Check a condition. If it matches, build a dictionary and append it. Then sort the accumulated list by a key. Then take the first ten elements. Every step is an instruction. The machine has to track the mutable list, the iteration state, the sort, the slice. And if you get any step wrong, the others might still succeed, producing output that looks correct but is subtly broken. A missing `reverse=True` and you silently get the oldest errors instead of the most recent.

Here is the same thing in Haskell:

```haskell
recentErrors :: [LogEntry] -> [ErrorSummary]
recentErrors =
    take 10
  . sortBy (flip compare `on` time)
  . map toSummary
  . filter isServerError
```

Read it bottom to top: filter server errors, transform each into a summary, sort by time descending, take ten. There is no mutable accumulator. No loop variable. No intermediate state. You are not describing a process. You are describing a relationship between the input and the output. The function says what the result IS, not how to compute it step by step.

The type signature at the top, `[LogEntry] -> [ErrorSummary]`, is a contract the compiler enforces. If `toSummary` returns the wrong type, if `isServerError` does not take a `LogEntry`, if you accidentally compose functions in an order that does not type-check, the compiler rejects the program before it runs. Not with a vague "object has no attribute" at runtime. With a precise type error at compile time that tells you exactly which piece does not fit.

This distinction matters enormously for AI. Think about what an LLM actually has to track in each case:

{% diagram(title="Procedural vs declarative complexity") %}
Procedural (Vera, Python, Go)          Declarative (Haskell)
================================       ================================
- mutable variables and their          - input type
  current state at each step           - output type
- loop iteration progress              - which transformations to compose
- conditional branching outcomes       - whether types align
- order of side effects
- implicit language behaviors
- names and what they refer to
{% end %}

The procedural model asks the AI to simulate execution in its head. The declarative model asks the AI to describe a transformation and let the compiler verify it. One plays to an LLM's weakness (tracking state across many steps). The other plays to its strength (recognizing and generating patterns that satisfy formal constraints).

The pipeline changes fundamentally:

{% diagram(title="Type-driven proof pipeline") %}
+-------+     prompt      +-------+   type sigs      +-----------+
| Human | ------------->  |  LLM  | ------------->    | Compiler  |
+-------+                 +-------+   pure exprs      +-----------+
                                                           |
                                                      types align?
                                                        /      \
                                                      yes       no
                                                      |          |
                                                      v          v
                                              [proven correct]  [precise type error:
                                                                 "Expected LogEntry,
                                                                  got String at ...]
{% end %}

No feedback loop needed in the happy path. If the types align, the program is correct by construction for the properties the type system tracks. The compiler is not iterating with the model. It is checking a proof.

This is the approach I bet on. It is the reason this blog exists.

Raskell, the name behind this site, is a portmanteau of Rascal (as in raccoon, which is my mascot) and Haskell. The language I have loved for years because of how elegantly it describes things close to mathematical proofs. QEDs, not TODOs. When you write a well-typed Haskell function, you are not just writing code. You are writing a proof that a certain transformation is valid, and the compiler is the proof checker.

But loving Haskell and shipping Haskell in production are different experiences, and the gap between them is mostly tooling. The ecosystem is fragmented in a way that has frustrated people for over a decade. `cabal`, `stack`, `ghcup`. Three tools that do overlapping jobs with different opinions about how dependencies should work. If you come from Python, imagine if `pip`, `poetry`, and `pyenv` were all developed independently, with different lockfile formats, different resolver algorithms, and occasional incompatibilities. That was Haskell. Build times were slow. Error messages ranged from helpful to cryptic. The runtime assumed one performance profile fits every use case. If you wanted Haskell for edge functions, for embedded systems, for GPU-accelerated numerics, you spent as much time fighting the toolchain as writing the actual code.

The language was right. The surrounding infrastructure was not.

So I started building [arcanist.sh](https://arcanist.sh), taking the same approach that [astral.sh](https://astral.sh) brought to Python tooling. When astral.sh released `uv` and `ruff`, it showed that you could take a mature ecosystem with entrenched tooling, rebuild the developer experience from scratch in Rust, and make everything dramatically faster and more coherent. I wanted to do the same for Haskell. arcanist.sh houses two projects.

[hx](https://arcanist.sh/hx/) is a fast, opinionated, next-gen toolchain for Haskell, built in Rust. One tool that replaces the fragmented stack. Managed compiler versions pinned per-project. Deterministic TOML lockfiles with fingerprint verification. 5.6x faster cold builds than cabal. 7.8x faster incremental rebuilds.

```shell
curl -fsSL https://arcanist.sh/install.sh | sh
hx new my-app && cd my-app
hx run
```

No ghcup. No stack. No cabal-install. Just `hx`.

[BHC](https://arcanist.sh/bhc/), the Basel Haskell Compiler, goes further. It is a clean-slate Haskell compiler written in Rust, not a GHC fork, targeting the Haskell 2026 Platform specification. It uses LLVM for native code generation and offers six runtime profiles that you select at compile time:

| Profile | Designed for | Key trait |
|---------|-------------|-----------|
| default | General applications | Lazy evaluation, GC-managed, GHC-compatible semantics |
| server | Backend services | Structured concurrency, automatic cancellation, observability hooks |
| numeric | ML and scientific compute | Strict numerics, tensor lowering, SIMD, GPU backends (CUDA/ROCm) |
| edge | WASM and CDN workers | Minimal footprint, direct WASM emission without LLVM |
| realtime | Games, audio, robotics | Bounded GC pauses under 1ms, arena allocation |
| embedded | Bare metal, microcontrollers | No GC at all, static allocation, targets like ARM Cortex-M |

The same Haskell source, different runtime contracts depending on what you are building. Your security policy engine compiles with the server profile and gets structured concurrency with tracing. Your tensor pipeline compiles with the numeric profile and gets GPU acceleration. Your edge function compiles to WASM and runs on Cloudflare Workers. Same language. Same type safety. Different performance envelopes.

The conviction behind this work is specific. When AI writes the code, the language that survives is not the one optimized for procedural explicitness. It is the one that brings consistency and purity by describing what something is, not how to compute it. AI is extraordinarily good at generating expressions that satisfy formal constraints. And source code that reads like a proof can survive time. It can survive maintainer burnout. It can survive the fact that three years from now, nobody remembers why a function was written the way it was. The types remember. The proof is self-documenting in a way that procedural code never is, because the types encode the intent.

Vera and arcanist.sh accept the same premise: the intermediate layer is changing. They disagree about which direction it should change in. Vera optimizes for reducing errors in the generation loop. Valuable. But hx and BHC optimize for making the generated code correct by construction, because the language itself constrains what valid programs look like at a structural level.

## Skip the language entirely

The third possibility is the one I think about late at night and do not have a concrete project for. Not yet. It is also the one I find most fascinating and most unsettling.

What if AI stops writing source code at all?

To understand why this is plausible, it helps to look at what source code actually is. It is not the final product. It never was. Source code is a set of instructions that a compiler transforms into machine code. Machine code is what the hardware executes. Source code exists because humans needed an abstraction layer between their intentions and the silicon. We think in concepts like "sort this list" or "reject unauthorized requests." The CPU thinks in register moves, memory loads, and conditional jumps. Source code bridges that gap.

But that bridge was built for human authors. If the author is no longer human, the bridge serves a different purpose. It becomes an audit trail. A way for humans to read and verify what the AI produced. Not an authoring medium, but a transparency layer.

I see this playing out in two distinct phases.

### Phase one: AI targets existing machine code

The first phase is closer than most people think, and it is conceptually straightforward. We already train models on source code. What happens when we also train them extensively on compiled artifacts? On binaries, object files, intermediate representations, the actual output of compilers?

Consider what a compiler does. It takes source code and transforms it into machine instructions following well-defined, deterministic rules. There is a mapping between source patterns and output patterns. A `for` loop in C becomes a specific sequence of compare, branch, and increment instructions on x86. A function call follows a specific calling convention. Memory allocation follows specific system call patterns. These mappings are learnable. They are patterns, and pattern recognition is exactly what LLMs excel at.

{% diagram(title="Skipping the source layer") %}
Today:
human intent → prompt → LLM → source code → compiler → x86/ARM → CPU

Phase one:
human intent → prompt → LLM → x86/ARM directly → CPU
                                (trained on source +
                                 compiled artifact pairs)
{% end %}

In this phase, the model skips the source code layer and generates machine code directly. Not by "compiling" in the traditional sense. By having learned the patterns well enough to produce valid executables from intent descriptions. The way a fluent translator does not parse grammar rules consciously but produces correct sentences from meaning directly.

This sounds radical until you remember that we already trust compilers we do not read the output of. When was the last time you inspected the assembly output of `gcc -O3` to verify it correctly compiled your C program? You trust the compiler. You test the behavior of the resulting binary. You do not audit the intermediate representation. If an AI can produce binaries that pass the same behavioral tests, the practical difference between "AI-generated machine code" and "compiler-generated machine code" becomes a question of trust calibration, not fundamental possibility.

The analogy I keep returning to is aviation. Early pilots flew by hand and understood every mechanical system in the aircraft. Fly-by-wire changed that. The pilot communicates intent (climb, turn, maintain altitude). The computer translates that into control surface movements. The pilot does not manually adjust ailerons and elevators for every gust of wind. They trust the system. They verify outcomes (altitude, heading, airspeed), not intermediate steps. Phase one of post-language programming is fly-by-wire for software.

If this sounds speculative, consider what happened this week. Anthropic announced [Project Glasswing](https://www.anthropic.com/glasswing), a coalition including AWS, Apple, Google, Microsoft, NVIDIA, CrowdStrike, Palo Alto Networks, the Linux Foundation, and others, formed to secure the world's most critical software using AI. Dario Amodei, Anthropic's CEO, put it plainly:

> "AI models have reached a level of coding capability where they can surpass all but the most skilled humans at finding and exploiting software vulnerabilities."

The proof point he offered: "For OpenBSD, we found a bug that's been present for 27 years."

Think about what that means. OpenBSD is one of the most carefully audited codebases in the world. Decades of security-focused human review by some of the most meticulous systems programmers alive. And an AI model found something that every human reviewer missed for twenty-seven years. If AI can understand existing code deeply enough to find vulnerabilities that humans cannot, it can understand code deeply enough to generate it without human-readable source as an intermediate step. The question is no longer whether AI comprehends code at a structural level. That question was answered this week. The question is what it does with that comprehension next.

### Phase two: a new kind of machine

The second phase is further out and more speculative. But I think it is where things ultimately go.

If AI is generating code for machines to execute and no human needs to read it, there is no reason that code needs to target instruction sets designed for human comprehension. x86 and ARM were designed with the assumption that someone, at least occasionally, would look at the instructions. They have mnemonics. They follow conventions that make disassembly feasible. They are organized into instructions that map, loosely, to operations humans understand.

But what if the execution target was designed from scratch for AI-generated code? A virtual machine or runtime that consumes a new kind of bytecode. Not optimized for human readability. Not optimized for hand-authored assembly. Optimized purely for execution density and machine generation.

{% diagram(title="AI-native execution target") %}
Phase two:
human intent → prompt → AI → dense symbolic bytecode → AI-native VM
                               (opaque to humans,         |
                                optimized for machine     v
                                generation + execution)  [result]
{% end %}

I keep thinking about information density. Chinese characters encode meaning in individual symbols that carry far more semantic weight than Latin alphabet words. A single character can represent a concept that takes an entire English phrase to express. When a system is designed for readers who can process dense symbols natively, the representation compresses. It becomes more efficient at the cost of being less accessible to readers who were not part of the design audience.

AI-native bytecode could follow the same principle. Each instruction could encode complex composite operations that would take dozens of conventional instructions to express. The bytecode would be dense in ways that make current machine code look verbose. Entirely opaque when decompiled or analyzed. Not obfuscated on purpose. Just natively incomprehensible to human cognition, the same way a trained neural network's weights are incomprehensible even though they encode real, functional knowledge.

The virtual machine running this bytecode would itself be a different kind of system. Not a stack machine or a register machine in the traditional sense. Possibly something closer to a dataflow engine, where the bytecode describes transformation graphs rather than sequential instructions. Think of it as the difference between giving someone turn-by-turn driving directions (go north, turn left, continue for two miles) versus handing them a map with the destination marked. The bytecode is the map. The VM figures out the route.

I want to be honest about where we are. We are not at phase one. Not in April 2026. Current models still need the intermediate layer. They produce better code when they can reason through it step by step. They benefit from type systems and contracts and explicit error messages. The first and second approaches are not just viable, they are necessary right now.

But the trajectory is visible. Models are getting better at generating correct programs with every generation. Formal verification is becoming more practical. Hardware is getting cheaper. The gap between "prompt that describes intent" and "correct executable output" is shrinking. Phase one will arrive when models trained on enough source-plus-binary pairs can reliably produce correct executables. Phase two will arrive when someone asks: if the model is already generating the binary, why are we targeting an instruction set that was designed for a species that is no longer doing the writing?

At some point the intermediate layer becomes optional. And optional things, given enough time, become vestigial.

## What this means

I do not think these three approaches are in competition. They are three points on a timeline, and the timeline is the story of the intermediate layer contracting.

{% diagram(title="The intermediate layer timeline") %}
Near term          Medium term           Long term
(now)              (2-5 years)           (5-15 years)

Explicit           Declarative           Post-language
languages          languages             (AI-native targets)
(Vera)             (Haskell + BHC)

Reduce noise  -->  Change the signal --> Remove the layer
in the loop        entirely              entirely

HOW, but           WHAT, verified        Intent to
unambiguous        by types              execution
{% end %}

In the near term, explicit languages like Vera make AI-generated code more reliable by constraining the generation space and providing machine-readable diagnostics. This is useful today. If you are building an AI coding pipeline right now and need to ship next quarter, this approach works.

In the medium term, declarative languages like Haskell, especially with modern tooling and modern runtimes, make AI-generated code correct by construction. The type system does the heavy verification work at a fundamental level. The code that survives is the code that describes invariants, not procedures. This is the era I am building for with arcanist.sh.

In the long term, the language disappears. First into existing machine code generated directly by AI. Then into new execution formats designed for AI generation from the ground up. The intermediate layer that has defined software engineering for seventy years becomes an implementation detail.

That last possibility makes some people uncomfortable. It made me uncomfortable when I first thought about it in December. It means that the craft of programming as we know it, the fluency in syntax, the mastery of idioms, the instinct for an elegant implementation, becomes less like a core skill and more like knowing how to operate a manual lathe. Valuable in the right context. Still needed for the hard cases. But no longer the primary way most software gets built.

This has happened before. There was a time when every programmer understood assembly. Then C abstracted it away, and most programmers stopped reading machine code. Then Python and JavaScript abstracted C away, and most programmers stopped thinking about memory management. Each time, the previous layer did not disappear. It became the domain of specialists who maintained the infrastructure everyone else stood on. The same thing will happen to source code. It will not vanish. It will specialize.

I still write code every day. I still think in types. I am still building hx and BHC because I believe the medium-term future is both real and long, and Haskell's strengths are exactly what that future demands. Pure functions, strong types, provable correctness. These are not luxuries in a world where AI writes the implementation. They are the load-bearing structure. But I do it with one eye on the horizon, knowing that the intermediate layer I am investing in is exactly that. Intermediate.

The person who built Vera saw the same thing I saw, probably around the same time. They chose the first approach. I chose the second. Somebody, eventually, will build the third. And then we will all need to figure out what we mean by "programming" when nobody writes programs anymore.

I am already curious about the answer.
