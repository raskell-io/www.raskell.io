+++
title = "Source Code Is the New Assembly"
date = 2026-05-07
description = "Closing the trilogy. The artifact you author is no longer source code. It is a typed, verifiable object that carries meaning. Code becomes a lowering target."

[taxonomies]
tags = ["ai-for-ops", "haskell"]
categories = ["deep-dives"]

[extra]
author = "Raffael"
image = "semantic-artifacts-and-meaning-engines.avif"
og_image = "semantic-artifacts-and-meaning-engines.png"
related = [
    "what-comes-after-the-last-programming-language",
    "what-programming-languages-become-when-ai-writes-the-code",
    "why-we-built-a-haskell-package-manager-in-rust",
]
+++

In [The Last Programming Language Might Not Be for Humans](/articles/what-programming-languages-become-when-ai-writes-the-code/), I argued that if AI becomes the primary author of code, the source language has to bend around that author. In [What Comes After the Last Programming Language](/articles/what-comes-after-the-last-programming-language/), I extended the argument one layer down: even the operating system still assumes a human is writing CPU-centric instruction streams, and that assumption has an expiration date.

I left the deepest move for last on purpose.

If languages are bending and operating systems are bending, it is because something more fundamental is bending. The unit of software is changing. The thing we treat as authoritative, version, review, ship, replay, and audit, is on its way to becoming something other than a tree of source files.

I want to make that move explicitly. This is the post where I plant the flag.

## What I am actually claiming

The clearest way I can put it is this: programming languages were never the destination. They were a writing system for an era when humans had to author the syntax. They survived because humans were the bottleneck, and the machine had to be addressed through a human-legible medium. That arrangement is starting to come apart.

Once generation is cheap, syntax is not the scarce resource anymore. The scarce resource is semantic stability. What I want is not a better language for models to type. I want an artifact that preserves meaning across generation, verification, lowering, execution, audit, and replay.

I will call that thing a **semantic artifact**, and I will call the machine around it a **meaning engine**. Both terms exist in adjacent literatures already. I am using them deliberately, not as branding.

A semantic artifact is the new unit of software. The meaning engine is what compilers and runtimes become when they accept those units. Source code does not vanish in this picture. It demotes. It survives the way assembly survives today: indispensable, specialized, and no longer the layer most people author.

That is the full claim. The rest of this post is the case for it.

## Programming languages were always writing systems

There is a reflex in our field to treat programming languages as if they were a category unto themselves. They are not. They are a specialized branch of writing.

Writing, in linguistics, is a technology for making language visible and durable. It is a system of conventional marks that encodes linguistic structure in a persistent medium. It is not thought itself. It is not even speech. It is a representation that allows institutions, tools, and machines to act on language across time and space.

Programming languages fit this definition without strain. They are notation systems that encode executable intent in marks a compiler can consume. Like every writing system, they were shaped by the dominant author and the dominant medium of their era.

Assembly is the closest thing we have to a logographic system for computation. Each opcode points at one specific machine action. There is no abstraction between the symbol and the execution. C is structured prose for systems work, designed when the author was a competent human engineer and the target was a single-CPU machine with byte-addressable memory. Python is a writing system tuned for readability and velocity, designed for an author who would rather get to the point than negotiate with the type system. Haskell pushes in the other direction, toward formal logic notation, where the writing system itself encodes proof obligations.

Every one of these languages is a compromise between precision and expressiveness. None of them was final. Each was tuned to what humans could reasonably author and what compilers could reasonably lower.

Once you see this clearly, the historical contingency becomes obvious. Source code is not sacred. It is a notation layer that won because humans had to write something, and machines had to lower something. It became the universal artifact of software because the author was human and the medium was text. Change the author, and the universal artifact has no reason to stay text.

This is the same observation [Unison](https://www.unison-lang.org/) has been making in production for years, just from a different angle. Unison stores definitions by the hash of their structured form, not by filename. Text is a view, not the artifact. The system has not gone post-code. It has gone post-text, while keeping code as the underlying object. That is a useful first step, and it is much more than a curiosity. It is a working proof that the source file is not load-bearing in the way our tools pretend it is.

## Code is a lossy compression of intent

The thing programmers do, when we write code, is compression. We take a high-dimensional, contextual, often-ambiguous understanding of what the system should do, and we squeeze it into a rigid, linear, explicit sequence of statements that a compiler will accept.

The compiler then performs a different compression, from our notation down to machine code. By the time the binary runs, several lossy passes have happened. Assumptions live in our heads or in a README. Side effects live implicitly in function calls. The reasons we made certain decisions live in commit messages, ticket systems, or, more often, nowhere. The artifact that runs is missing most of the meaning that produced it.

We know this is lossy because we spend enormous effort patching the loss. We write tests to recover behavioral intent. We write documentation to recover design intent. We write architecture decision records to recover historical intent. We write runbooks to recover operational intent. We sprinkle assertions to recover invariants we could not express in the type system. We add observability to recover what the running program is actually doing because the source did not say.

Programming, in this view, is manual compression of intent into executable form. It worked because the human author could hold the uncompressed version in their head while typing the compressed version. It also worked because the compressed version was good enough to ship and the uncompressed version did not have to survive review.

AI changes the economics of that compression. Generation gets cheap. Expansion from a few sentences to thousands of lines of code is no longer the hard part. What gets relatively more expensive is the part that was always implicit: deciding which version is correct, which assumptions are still valid, which constraints must hold, which environments will give the same result, which side effects are allowed.

In a world with cheap generation, the uncompressed version is what we should be authoring. Not the compressed one.

## What a semantic artifact actually is

A semantic artifact is not a fancier source file. It is not "code with metadata." It is a different kind of object, with different properties, and the difference matters.

A semantic artifact is **intent-first**. It says what must hold, not how. It can carry "how" as one of several lowerings, but the upper layer is the obligation, not the implementation.

It is **structured**. It is a typed graph of entities, constraints, transformations, effects, evidence, and provenance. Text is one rendering. JSON is another. A diagram is another. None of them is the artifact.

It is **content-addressed**. Identity is structural, derived from the artifact itself, not from a filename or a path. Two artifacts with the same meaning have the same identity. This is the lesson Unison teaches and the lesson the rest of the industry has not fully absorbed.

It is **explicit about effects**. Reads, writes, time, randomness, network, ledger postings, model inference, file system access, are all declared. Effects are part of the type, not lurking inside a function body. Koka and Vera both make this argument from the language side. A semantic artifact takes the same idea seriously enough to make it part of the artifact identity.

It is **verifiable**. It carries obligations: properties that must hold, invariants that must be preserved, preconditions on inputs, postconditions on outputs. Some of these are dischargeable by SMT solvers. Some need proof kernels. Some can only be enforced at runtime. The artifact records which is which, and what evidence exists for each.

It is **reproducible**. It declares its environment with enough precision that a meaning engine somewhere else, or the same meaning engine a year later, can replay it and get the same outputs. Wasm with the deterministic profile, Nix-pinned environments, content-addressed inputs, deterministic schedulers, this is the substrate that makes reproducibility a property rather than a hope.

It is **explainable**. Execution emits a provenance graph. What ran, on what data, in what environment, with what assumptions, against what obligations, with what residual uncertainty. The provenance is part of the output, not a log file someone deletes after a week.

The thing to notice about that list is that none of these properties is exotic. Every one of them already exists in some production system today. What does not exist yet is the synthesis. We treat them as add-ons around code. The argument I am making is that they are not add-ons. They are the artifact, and code is one rendering of it.

## The meaning engine

If the artifact changes, the machine around it has to change too. Compilers were built for source text. Runtimes were built for binaries. Neither was built for typed, verifiable, provenance-rich semantic objects.

The meaning engine is what fills that gap. I am using the term as a placeholder for a category, not for a single product. A meaning engine accepts a semantic artifact and:

1. **Elaborates** it. Resolves references, links schemas, grounds entities, checks types and effects.
2. **Verifies** it. Discharges obligations against the right backend. Type checks first. SMT for decidable arithmetic and structural constraints. Proof kernels for the residual cases that need full mathematical certainty. Runtime contracts for the cases nothing else can decide.
3. **Plans** execution. Picks an environment. Pins a target. Chooses where to run, on what hardware, with what capability set.
4. **Lowers** to code. Wasm, native CPU, GPU kernels, distributed dataflow graphs, whatever the planner decided. Code becomes an output, not an input.
5. **Executes** deterministically. Capability-bounded, replayable, audited.
6. **Explains**. Emits a provenance graph alongside the result. Says what assumptions held, what proofs passed, what tests ran, what fell back to runtime checks, what remained uncertain.

The interesting reframing is the compiler itself. The old job of a compiler was to translate one notation into another. The job of a meaning engine is to materialize meaning into execution and to keep meaning intact across that materialization. Translation becomes a sub-task. The primary task is preservation.

The semantic intermediate representation is where this lives or dies. I do not think the answer is "use LLVM IR with more comments." LLVM IR is too low. It is already shaped around the mechanics of execution. We need a layer above it that carries domain meaning, obligations, and effects with first-class status.

[MLIR](https://mlir.llvm.org/) is the most relevant existing infrastructure for this. It treats multi-level structure as the design center: dialects, regions, operations, progressive lowering. A meaning engine could plausibly use an MLIR-style dialect stack with a semantic dialect at the top and execution dialects at the bottom. That is an implementation question, not a thesis question, and I want to keep the two separate.

## A scientific experiment as an executable artifact

Abstract claims about new artifacts age badly. The argument has to survive contact with concrete domains. The first place I would point is science.

Take a differential expression analysis from RNA sequencing. Today, the artifact that runs is some combination of: a Snakemake or Nextflow workflow, a Conda environment file, a few R scripts, a Jupyter notebook with the figure-generation logic, a README that explains how to run it, and a PDF describing the methods for the eventual paper. The "program" is spread across all of these, and the relationships between them are mostly informal.

People have been trying to fix this. The [Common Workflow Language](https://www.commonwl.org/) standardizes the workflow part. [RO-Crate](https://www.researchobject.org/ro-crate/) packages methods, data, outputs, and identifiers together. [PROV-O](https://www.w3.org/TR/prov-o/) gives you a vocabulary for entities, activities, and agents. These are real progress, and they show that the field has been edging toward semantic artifacts for years. What is still missing is a single authoritative object that also carries assumptions, allowed environments, correctness obligations, and execution traces in one verifiable form.

A semantic artifact for the same analysis would look more like this:

```
artifact RNASeqDiffExp.v3
  inputs {
    reads: FASTQ[]
    reference: GenomeRef
    alpha: Real where 0 < alpha <= 1.0
  }
  assumptions {
    sha256(reference) == "9f8c1a..."
    paired_end(reads)
    same_instrument(reads)
  }
  outputs {
    counts: CountTable
    figures: FigureSet
  }
  effects {
    fs.read("reads/", "reference/")
    fs.write("results/")
    cpu.simd
    gpu.optional
  }
  obligations {
    deterministic_target = "wasm32-wasi"
    environment = "nix:sha256-7m..."
    p_adj_threshold(counts) <= alpha
  }
  plan {
    trim -> align -> quantify -> diffexp -> render
  }
```

The syntax above is illustrative. The shape is the point.

What this artifact gives you that a workflow file plus a README does not: a reviewer can inspect the assumptions directly. A lab can replay the artifact against the pinned environment and reproduce the figures byte for byte. An auditor can ask whether GPU execution changed numerical behavior and get a defensible answer. A future model can propose an optimization, and the meaning engine can reject the optimization automatically if it weakens any obligation. The provenance graph it emits is the methods section of the paper, machine-checkable, not a paragraph somebody wrote at midnight before submission.

The artifact does not have to make every claim machine-decidable. It only has to make explicit which claims are decided how. That is already a significant improvement over the current state, where most of those distinctions live in tribal knowledge.

## A contract as an executable artifact

The second domain I would point to is the one where words and computation already overlap uncomfortably: legal and financial agreements.

There is real prior art here. The [Accord Project](https://accordproject.org/) models contracts as text plus a data model plus executable logic. The [Common Domain Model](https://cdm.finos.org/) treats financial products and lifecycle events as machine-readable, machine-executable domain objects. Smart contracts, in their actual industrial form rather than the crypto-bro form, have been heading in this direction for a decade.

The honest statement is that legal language will never be fully decidable. Many clauses are intentionally ambiguous. Many require human judgment. That is not a bug. It is how the institution works.

But a semantic artifact does not require full decidability. It requires that the boundaries between decidable and undecidable be explicit. Some clauses become parameters. Some clauses become executable logic. Some clauses remain text with cross-references into the structured part. The artifact records which is which.

```
contract FixedRateLoan.v1
  parties { lender, borrower }
  terms {
    principal: Money where principal > 0
    rateAPR: Percent where 0 <= rateAPR <= 0.25
    termMonths: Nat where termMonths > 0
  }
  preconditions {
    kyc_clear(borrower)
    sanctions_clear(borrower)
  }
  obligations {
    monthly_payment(m) = amortize(principal, rateAPR, termMonths, m)
    total_paid = principal + total_interest(principal, rateAPR, termMonths)
  }
  effects {
    ledger.post
    notice.send
    archive.write
  }
  evidence {
    jurisdiction = "CH"
    execution_target = "wasm-ledger"
    text_reference = "Loan_2026_03_15.pdf#sha256:4b2a..."
  }
```

A loan agreement, in this form, is verifiable in the parts that should be verifiable, executable in the parts that should be executable, and traceable back to the natural-language contract for the parts that are not either. A bank can check on every payment that the obligations still hold. An auditor can ask why a specific posting happened and get a provenance graph that points back to the artifact and the inputs. A regulator can require a class of contracts to demonstrate certain invariants without reading every contract by hand.

This is a much more serious model of "smart software" than the casual conflation of code with policy that the smart-contract era encouraged. The point is not that every rule becomes automatic. The point is that the system can tell you, without ambiguity, which rules it can enforce, which rules it can only check, and which rules a human still has to interpret.

## What current systems already get right

I want to be careful here, because the easy mistake is to write this kind of essay as if nothing existing matters and everything has to be invented from scratch. That is wrong. Most of the pieces of a meaning engine already exist. They are scattered across systems that solved one face of the problem each. The synthesis is what is missing.

[Vera](https://veralang.dev/) optimizes for the generation loop. It makes syntax canonical, contracts mandatory, effects explicit, verification part of the normal compilation pipeline, and Wasm the default execution target. It is, in my framing, the best current example of "language designed for machine authorship." It is not yet a meaning engine because the source text remains the artifact of authority. But the discipline it imposes on the artifact is exactly the discipline a semantic artifact needs.

[BHC](https://github.com/bhc-lang) (the bridge Haskell compiler I have written about elsewhere) optimizes for the typed substrate and the deployment surface. Multi-stage IRs, a Core layer that survives across lowerings, profile-specific runtime contracts, multiple backends from native to Wasm to GPU. It treats semantic preservation across lowering as a first-class goal, which is the exact discipline a meaning engine needs at the lowering layer. It is still source-language-centered, by design. That is its scope.

[Dafny](https://dafny.org/) and [Lean](https://lean-lang.org/) push hardest toward proof-bearing semantics. Dafny puts specifications inside the language and uses SMT to discharge them. Lean has a minimal trusted kernel and builds proof automation on top. They show what the upper bound of "verified meaning" looks like in practice. They are not yet the substrate for cross-domain artifacts, deterministic deployment, and provenance packaging, but they set the standard for what the verification layer of a meaning engine should aspire to.

[Koka](https://koka-lang.github.io/koka/doc/index.html) and similar effect-typed languages show that you can keep effect information at the type level without giving up performance. Effects in the type signature, not just in the function body. That is the model the artifact needs at the meaning layer.

[MLIR](https://mlir.llvm.org/) shows that a multi-level dialect stack is a workable architecture for keeping high-level structure across lowering. A semantic IR sitting above MLIR-style dialects is a plausible engineering path.

[Wasm](https://webassembly.org/) and [WASI](https://wasi.dev/), with the recent [deterministic profile](https://github.com/WebAssembly/proposals) work and tooling like [Wasmtime's determinism guide](https://docs.wasmtime.dev/), give us a portable, sandboxed, increasingly deterministic execution target. This is the substrate that makes "replay this artifact and get byte-identical outputs" feasible without operating-system heroics.

[Nix](https://nix.dev/) gives us declarative, reproducible, isolated environments. The pinning story is mature. The integration story is still rough. But the building block is real.

[PROV-O](https://www.w3.org/TR/prov-o/), [RO-Crate](https://www.researchobject.org/ro-crate/), and [CWL](https://www.commonwl.org/) give us standards for provenance, packaging, and portable workflows, particularly in the scientific domain. They are evidence that "explainability as a structural property of the artifact" is not science fiction. It is the way some communities already work.

[Unison](https://www.unison-lang.org/) gives us content-addressed, structured code identity. This is the lesson the rest of us still have not fully internalized: identity should not depend on filenames or formatting.

If I were to draw the comparison shortly: Vera optimizes the generation loop. BHC optimizes the typed substrate. Dafny and Lean optimize formal truth. Wasm and Nix optimize deterministic deployment. PROV and RO-Crate optimize provenance. Unison optimizes structural identity. None of them is the future on its own. The future is the synthesis.

## From compilers to meaning engines

The reframing I find most useful is to put the old pipeline next to the new one and look at what changes.

{% diagram(title="From compiler to meaning engine") %}
Old pipeline
============

  source code  ->  compile  ->  binary  ->  run


New pipeline
============

  intent
    |
    v
  elaborate   --->  semantic artifact
    |                (typed, content-addressed,
    |                 effects explicit)
    v
  verify      --->  obligation graph
    |                (proved | tested | runtime)
    v
  plan        --->  execution plan
    |                (env pinned, target chosen,
    |                 capabilities bounded)
    v
  lower       --->  Wasm | native | GPU | distributed
    |
    v
  execute     --->  results
    |
    v
  explain     --->  provenance graph
{% end %}

Every stage matters, and every stage has explicit outputs. Elaboration produces a fully grounded semantic artifact. Verification produces a graph of discharged and residual obligations. Planning produces a deterministic execution plan with a pinned environment and a capability set. Lowering produces target-specific code as one of several possible outputs. Execution produces results plus a provenance graph. Explanation reads the provenance graph and answers questions about why the system did what it did.

The execution trace becomes a first-class output, not a side effect. Today, a stack trace exists because something went wrong. In a meaning engine, an execution trace exists because something happened, and the system promises to be able to reconstruct it later.

The compiler does not disappear. It moves. It becomes one stage of a larger pipeline, and the pipeline is what people interact with.

## Why this is bigger than programming

I want to zoom out for one section, because the trilogy has been quietly building toward a claim that is not really about programming languages at all.

Writing systems have changed several times. Oral tradition gave way to written records. Manuscripts gave way to print. Print gave way to digital text. Each transition expanded the scale and durability of what humans could record, distribute, and act on collectively. Each transition reshaped institutions in ways that took decades to settle.

We are in the early phase of another transition. We are moving from systems that **record** knowledge to systems that **execute** knowledge. A scientific paper is a record. A semantic artifact for a scientific experiment is an execution. A legal contract is a record. A semantic artifact for a financial product is an execution. An infrastructure runbook is a record. A semantic artifact for the same operational behavior is an execution.

This is the civilizational layer of the argument, and I am stating it deliberately even though it is uncomfortable. The shift from text-as-record to text-as-execution will be at least as large as the shift from manuscript to print. It will not be the same as previous transitions, because it is happening on infrastructure we built and partially understand, not on infrastructure that emerged organically over centuries. But the order of magnitude is similar.

If that framing is even half right, "what programming language should we use" is a small question. The big question is what kinds of institutions we are willing to build on top of artifacts that are themselves executable.

## The role of humans

If we do not write code, what do we do? This is a fair question, and I want to answer it directly rather than dodge it.

We define constraints. We shape intent. We evaluate outcomes. We design systems of meaning. We argue about which obligations matter and which assumptions are reasonable. We negotiate the boundaries between automated and human-decided parts of an artifact. We decide which evidence is acceptable and which is not.

This is a different job. It is closer to architecture than to authorship. The unit of work is the obligation, not the function.

For people who like writing code, this is going to feel like a loss. I understand. I like writing code too. But the historical pattern is clear. Each abstraction layer demoted the layer below it from "primary skill" to "specialized skill." Assembly programming did not disappear when C arrived. It became the thing a small number of people did when it really mattered, in compilers, in kernels, in performance-critical hot paths. The same is going to happen one layer up. Most people will stop authoring code as the primary artifact. Some people will keep doing it, where it really matters, and they will be more important to the field, not less.

The work that gets more interesting, in this picture, is the work of building meaning engines themselves. The substrate is wide open. There is room for many designs. The decade ahead is going to look more like the early compiler era than like the late framework era. That is a good time to be working on infrastructure.

## Implications for builders right now

The migration is staged. The way I think about the timeline:

{% diagram(title="Migration roadmap") %}
Near term              Medium term            Long term
(now)                  (2-3 years)            (3-10 years)

Semantic           ->  Artifact core      ->  Multi-target
sidecars                                      lowering

- specs beside         - content-             - Wasm/WASI first
  the code               addressed            - native CPU
- pinned envs            identity             - GPU kernels
  (Nix)                - typed effects        - distributed DAGs
- provenance           - obligation
  (PROV-O)               graphs              Artifact-first
- deterministic        - graded                domains
  replay (Wasm)          verification       - science
                                            - contracts
Improve auditability   Make the artifact    - infra policy
without abandoning     the review surface   - audit/compliance
the current stack
{% end %}

I do not want to leave this post in the air. The trilogy has been escalating, and each step has been more speculative than the last. This post is the most speculative of the three. It is fair to ask what any of this implies for what we should be doing in 2026, not in 2036.

A few things I think are already actionable.

Take semantic sidecars seriously. If you are shipping software in any regulated or critical domain, you can already start writing artifact manifests that bind your code to its assumptions, its allowed effects, its pinned environment, its provenance, and its replay instructions. You do not need a new compiler to do this. You need discipline and a few tools that already exist. Nix and Wasm are good starting points. PROV-O is a usable vocabulary. The investment compounds.

Treat reproducibility as a property, not a hope. If you cannot replay your artifact deterministically, you do not have a semantic artifact. You have a hope. Wasm with the deterministic profile, Nix-pinned environments, content-addressed inputs, and deterministic schedulers are the building blocks. The cost of getting there is real but bounded, and the gains in audit, debugging, and incident response are immediate.

Make effects explicit. You do not need a new language to do this. You can do it with discipline in the language you already use. Module boundaries that separate pure from effectful code are not exotic, they are just unfashionable in some communities. The discipline is what matters. The syntax is downstream.

Stop treating proof and test and observation as the same thing. They are not. A proven property, a tested property, and an observed property carry different weights. A meaning engine has to keep them separate. You can start keeping them separate yourself, in code review and in design review, today.

Invest in IRs more than in syntax. The next decade of leverage is in the layer above LLVM IR and below user-facing source. If you are building tools for software development, this is where the interesting work is. The tooling that wins will preserve more meaning than today's compiler stacks do.

If you build infrastructure, the heuristic is simple. Anywhere your team is currently relying on "shell scripts plus a README plus a notebook plus a PDF plus tribal knowledge" to encode a process, that is a candidate for a semantic artifact. Pick one such process, and try to model it as an artifact instead of as a pile.

## Open questions I do not pretend to have settled

I am stating the thesis confidently, but I want to be honest about what I do not know.

I do not know the exact shape of the semantic IR. I have a bias toward an MLIR-style dialect stack with a semantic dialect at the top, augmented with effect typing, content-addressed identity, and explicit obligations. A content-addressed term graph in the Unison style is a credible alternative. A two-part design with a logical core plus an executable planning layer is another. The winning design is probably hybrid. I would rather present the question honestly than fake an answer.

I do not know how much proof to demand before execution. Too much proof and the system is unusable. Too little and the artifact loses its claim to authority. Vera's split between static proof and runtime fallback is realistic. Lean's kernel model is the strongest, and the slowest. The right answer is graded, not absolute, and it will probably depend on the domain.

I do not know how distributed execution fits in. Wasm gives us a portable substrate. WASI gives us a capability model. Content addressing gives us identity. None of these solves scheduling, data locality, and semantic replay across clusters. That is an implementation frontier, not a hole in the thesis, but it is a frontier and I want to flag it as one.

I do not know which domains move first. My best guess is the domains that already pay most of the cost of ambiguity today: scientific workflows, regulated finance, compliance and audit, infrastructure policy, and certain parts of public-sector procurement. Domains where the gap between "what we wrote" and "what we ran" is currently catastrophic when something goes wrong. I would not be surprised if those domains develop their own meaning engines first, and a general-purpose substrate emerges as the synthesis a few years later.

I do not know how long the migration takes. My only confident claim about timing is that it does not arrive by deleting today's stacks. It arrives by moving semantics upward, year by year, until the artifact most teams care about is no longer a tree of source files.

## Closing

We called them programming languages because we thought we were speaking to machines. In reality, we were translating ourselves into a form machines could tolerate. The notation was a compromise between what we could write and what they could lower.

Now that machines can understand us more directly, the question is not how to write better code. The question is how to think in systems that can be executed. The artifact we author should preserve meaning, not perform it. The runtime should keep that meaning intact, not erase it during translation.

Code does not disappear in this story. It drops a layer. It becomes implementation detail, escape hatch, optimization substrate, foreign-function boundary. Important. Powerful. Not primary.

The trilogy ends here, in the same place each transition in computing has ended. The previous artifact survives, demoted, while a higher layer takes over the work of authority. Source code joins assembly in the long list of things that used to be the thing and now are something we lower to.

The interesting work, for the rest of this decade, is at the layer above. That is where I am spending mine.

## Further reading

The systems already pointing at parts of this future, grouped by the dimension each one gets right.

**Semantic IRs and structural identity.** The argument that artifact identity should not depend on filenames, and that compiler stacks should preserve high-level structure across lowering, already has working precedent.

- [MLIR](https://mlir.llvm.org/) for multi-level dialect stacks
- [Unison](https://www.unison-lang.org/) for content-addressed code

**Verification.** What it looks like to push specifications and proofs into the artifact, with three different bets on how strict the proof obligation should be.

- [Dafny](https://dafny.org/) for specs in the language, SMT-backed
- [Lean](https://lean-lang.org/) for a minimal trusted kernel and proofs as terms
- [Vera](https://veralang.dev/) for Z3 on decidable cases and runtime fallback for the rest

**Typed effects.** The case for putting side effects into the type rather than hiding them in the function body.

- [Koka](https://koka-lang.github.io/koka/doc/index.html) for row-polymorphic effects with handlers
- [Vera](https://veralang.dev/) for mandatory effect declarations on every function

**Reproducible execution.** What "the same artifact runs the same way somewhere else, a year later" actually requires in production.

- [WebAssembly](https://webassembly.org/) and [WASI](https://wasi.dev/) for portable, sandboxed, increasingly deterministic execution
- [Wasmtime determinism guide](https://docs.wasmtime.dev/) for the concrete steps to byte-identical replay
- [Nix](https://nix.dev/) for declarative, isolated, pinned environments

**Provenance and packaging.** The vocabulary for explaining what ran, on what data, in what environment, with what evidence.

- [PROV-O](https://www.w3.org/TR/prov-o/) for entities, activities, and agents
- [RO-Crate](https://www.researchobject.org/ro-crate/) for artifact bundles with methods, data, and identifiers
- [Common Workflow Language](https://www.commonwl.org/) for portable, vendor-neutral workflows

**Domain artifacts.** The honest evidence that "software artifact" is too narrow a category for what comes next.

- [Accord Project](https://accordproject.org/) for contracts as text plus data model plus logic
- [Common Domain Model](https://cdm.finos.org/) for financial products and lifecycle events as machine-readable, machine-executable objects
