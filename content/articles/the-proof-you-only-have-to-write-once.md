+++
title = "The Proof You Only Have to Write Once"
date = 2026-06-19
description = "Generation is cheap, so verification is the bottleneck — and we throw the verification away every time. What if a proof, once written, could be named, shared, and vouched for? A content-addressed commons for verified Haskell, and the move I left for after the semantic-artifact trilogy."
draft = false

[taxonomies]
tags = ["ai-engineering", "programming-languages", "haskell"]
categories = ["deep-dives"]

[extra]
author = "Raffael"
image = "the-proof-you-only-have-to-write-once.avif"
og_image = "the-proof-you-only-have-to-write-once.png"
related = [
    "semantic-artifacts-and-meaning-engines",
    "what-programming-languages-become-when-ai-writes-the-code",
    "why-we-built-a-haskell-package-manager-in-rust",
]
+++

I have watched an agent write the same date parser four times this week.

Not one project. Four. Four sessions, four chats, four little functions that come out looking almost exactly like this:

```haskell
parseRFC3339 :: Text -> Either ParseError UTCTime
parseRFC3339 = ...

-- the property that says it actually works
prop_roundtrip :: UTCTime -> Bool
prop_roundtrip t = parseRFC3339 (formatRFC3339 t) == Right t
```

Each one generated from nothing, type-checked, tested against the round-trip property and a fistful of awkward timezones, and correct. Then deleted the moment its task closed, so the next session could generate it, check it, and test it again from nothing. The fifth time it happens I will probably not notice, and that is the part that bothers me.

I have spent the better part of a trilogy circling this. I argued that when AI becomes the primary author, [the source language has to bend around it](/articles/what-programming-languages-become-when-ai-writes-the-code/); that [the operating system bends too](/articles/what-comes-after-the-last-programming-language/); and that the unit of software is itself changing — that what we author is becoming a *semantic artifact*, a typed, verifiable object that carries meaning, and that the compiler becomes a *meaning engine* around it. I [planted that flag](/articles/semantic-artifacts-and-meaning-engines/) and called it the end of the series.

It was not the end. There is a move I left for after the flag was in the ground, and the date parser is what keeps dragging me back to it.

## Mathematics solved this a long time ago

A mathematician does not re-prove the Pythagorean theorem every time she needs a hypotenuse. She cites it. Somebody proved it once, somebody checked the proof, and it entered a shared body of established results that the whole field now stands on. Mathematics is, among other things, the largest and oldest commons of verified work we have. Its real advantage is not that mathematicians are clever. It is that a proof, once established, is never thrown away. The next person picks it up by name.

Programming works the other way, and AI has made it worse. I argued in the [manifesto](https://arcanist.sh/manifesto/) that in Haskell a well-typed function *is* a proof: the type is a claim, and the compiler is the proof checker. Fine. Then why does every agent, in every session, reprove `sort`? Why is there no *Annals* for functions, no shared ledger that says "this has been checked, you may build on it"? We have the proofs. We generate thousands of them an hour. We delete every single one.

If generation is cheap and verification is the bottleneck — and that is the whole argument — then verifying the same thing twice is the waste. We reuse the cheap thing, the code, without a second thought, and we recompute the expensive thing, the proof that it holds, on every turn. That is backwards. A proof is not a draft. It does not expire because a new agent walked into the room.

## Git and Unison stop one level too early

The machinery for not throwing things away is older than this argument, and most of you use it every day. Git content-addresses everything you commit: ask it for a blob and you get bytes keyed by their hash, and if you write the same file twice it stores it once. [Unison](https://www.unison-lang.org/), which I leaned on in the last post, pushes the idea up a level. It addresses *definitions* by the hash of their structured form, so the text is a view, not the artifact.

Both stop one level too low for what I want. Git's `7f3a9c…` is a pile of characters, and Git has no idea whether it type-checks. Unison's hash knows the structure but not the guarantees. I want to address the thing one level higher again: not the bytes, not even the definition, but the verified meaning — the definition together with everything we have established about it.

The unit you borrow, then, is not a function someone wrote. It is a function someone proved, one you can re-check in seconds, one other people have already vouched for. I have started calling that unit a **manifest**, and the clearest way to explain it is to show one:

```
manifest  7f3a9c1e…
  signature   : Text -> Either ParseError UTCTime
  contract    : { profile = server, edition = H26 }
  evidence    :
      types       established      -- it checks
      totality    established      -- no partial branch is reachable
      roundtrips  tested · 1000 cases
      tz-folding  asserted         -- claimed by the author, never checked
  vouched-by  :
      raffael@raskell.io           reviewed
      ci@arcanist.sh               reproducible-build ✓
```

This is a different kind of object from a `.hs` file. It carries an identity, the hash. It carries an evidence bundle that says exactly what holds, and, just as plainly, what was only *asserted* and never checked. And it carries a provenance: who stands behind it. I am careful not to call it a truth. A well-typed function proves consistency with a specification, not fitness for your intent; `head :: [a] -> a` is perfectly well-typed and still throws on the empty list. A manifest claims something narrower and more useful: an account of what holds, with the gaps marked, that anyone can check.

## The same source is not the same manifest

There is a wrinkle here, specific to the compiler I am building, and it is the most clarifying part of the design. In BHC the same source does not have one meaning. The same `Date.hs`, compiled under different runtime profiles, means different things:

```console
$ bhc --profile=server  Date.hs    # structured, observable     → manifest 7f3a9c…
$ bhc --profile=numeric Date.hs    # strict, fused, unboxed      → manifest b21e08…
$ bhc --profile=edge    Date.hs    # stripped to a thin runtime  → manifest 4d90f7…
```

Same text. Three behaviours. Three manifests. A manifest cannot be named by its meaning alone. It is named by its meaning and its contract: the profile, the edition, the dependencies it was checked against. This is the semantic-artifact thesis taken literally. The unit of software is meaning under a stated contract, and that pair — *meaning ⊗ contract* — is its name.

This sounds like extra bookkeeping. It is the opposite. The alternative — one name for the function no matter how it was compiled — would be a quiet lie, because a server build and an edge build do not behave the same way under load, and pretending they are interchangeable is the kind of mistake that ships at 3am. The address refuses to pretend. It tells you what you are getting before you depend on it.

It also keeps borrowing safe. When you borrow a manifest you borrow it under a contract, and you cannot accidentally pull the numeric-profile version into an edge service and inherit behaviour you never asked for. This is the discipline mathematics already keeps. A proof is a proof only relative to its axioms; change the axioms and you have a different theorem, even if the sentence on the page is unchanged. The contract is the axioms. Two definitions share an identity when they mean the same thing *and* were checked under the same assumptions, and not before.

## Type classes should make this impossible

This is the part I was least sure about, so I checked it in the compiler instead of guessing. Type classes break content-addressing. The meaning of

```haskell
sort :: Ord a => [a] -> [a]
```

depends on which `Ord` shows up at the call site, and that choice is nowhere in the text of `sort`. It is resolved later, globally, out of the import graph. This is the thing Unison sidestepped by not having type classes at all; you pass the equivalent of a dictionary by hand. I am not willing to give up type classes. They are most of what makes Haskell pleasant. So the question is whether you can address Haskell's code without amputating Haskell.

You can, and the reason is that the compiler already does the work for its own purposes. Once the type checker resolves a constraint, the class is gone. The dictionary becomes an ordinary argument, and each method becomes a field selection on it. That `sort` elaborates into something with this shape:

```haskell
-- after elaboration: the instance is explicit, passed in
sort :: OrdDict a -> [a] -> [a]
sort dOrd xs = ... compareOf dOrd ...
```

Now you hash the elaborated form, not the surface, and the ground is solid. The `Ord Int` instance `sort` was compiled against is no longer ambient. It is sitting there as an argument, with its own content hash, an ordinary dependency. Which instance did this function use? Look at the dependency list. The answer is a hash, not a property of the program's imports.

That discipline is what the date parser has been asking for. Two people write the parser differently —

```haskell
-- Alice
parseRFC3339 = parse . Text.unpack
  where parse = ...

-- Bob
parseRFC3339 input = run (unpack input)
  where run = ...
```

— but they mean the same thing. Both elaborate to the same Core, hash to the same `7f3a9c…`, and land on one manifest. Their evidence and their signatures merge onto it. The more people who independently arrive at the same definition, the more vouched-for it gets, because they are all strengthening one object instead of making copies of it.

I will not pretend it is free. BHC's intermediate form is still name-based, not yet in the canonical shape you need before two alpha-equivalent definitions hash the same. That normalization is the one new pass standing between this essay and a working store. But it is a pass, not a miracle, and the rest is mostly already in the compiler under other names: a query engine that caches by hash, interface files with a hash slot already stubbed in, signature verification already shipping in the toolchain. I went looking for blockers and mostly found things half-built. The full engineering — the identity model, the sealed reproducible builds that make a vouch checkable by anyone, the trust model — is laid out on [arcanist.sh](https://arcanist.sh/building-the-commons/).

## The fifth date parser

Before an agent writes a line, this is the call I want it to make:

```console
$ hx commons lookup 'Text -> Either ParseError UTCTime' \
      --named parseRFC3339 --requires-property roundtrips --profile server

  7f3a9c1e…   total ✓   roundtrips ✓ (1000 cases)   vouched ×2
```

The agent does not generate the function. It cites it: pulls the manifest, re-checks the evidence in a few seconds, composes, and moves on. It writes a fresh one only when nothing matches, and when it does, and the result type-checks and proves out and builds reproducibly, that result goes back into the commons, named and vouched, so the next agent finds it instead of writing it again.

Look at what that does to the lookup itself. It is not a search for a function with the right type; the type alone would return a hundred plausible wrecks. It is a search filtered by evidence: total, satisfies this property, vouched by someone you trust. You set the bar, and the commons enforces it. The agent is not asking "is there a date parser." It is asking "is there a date parser I am allowed to build on."

And look at what it does to review. Today a person re-reads regenerated plumbing on every change, because the agent produced it fresh and nobody knows whether this version is the good one. When the plumbing arrives from the commons with its proof attached, there is nothing to review there — the date parser was settled the first time. Attention moves to the part of the system that is actually new, the part no manifest covers yet, the part that was always the point. The commons does not make the hard problems easy. It clears the easy ones off the desk so the hard ones get the attention.

That is the limit of it, and worth saying plainly. The commons will not prove your novel core for you; that is still yours to write, and to prove. What it removes is the tax — the thousandth re-derivation of `sort`, the fifth date parser — that should never have been charged to anyone in the first place. That is the mathematician's move: do not re-prove what is proved, spend the effort on what is not.

## The proof is the asset, not the code

This is not a new phase. It is the one I have been describing all along, except the proofs accumulate instead of evaporating. Declarative, proof-carrying code only pays for itself when the proofs are kept, and so far we have kept none of them. One agent proving one function is a curiosity. A commons where every proof is banked, named, re-checkable, and vouched for is a different kind of thing: a single program can be correct by construction, and so can an ecosystem, once it stops throwing the construction away.

I argued before that source code is becoming a lowering target, the way assembly did. This is the other half of that claim. If the code is the lowering target, then the durable asset — the thing worth versioning, reviewing, trusting, and keeping — is the verification, not the text it was lowered from. A commons is just the place that asset lives. It would be the first time programming has had anything like an *Annals*: a body of checked results, written mostly by machines, that anyone can verify and everyone can build on.

I do not have all of it built. I have a conviction, and a compiler that is further along than the idea is. But I keep coming back to that date parser, written for the fourth time, deleted for the fourth time, queued up to be written for the fifth. I would like the fifth time to be the last.

---

*A note on where this sits.* There is a [catalogue of languages built for agents to write](https://agentlanguages.dev), sorted into camps: make the syntax unambiguous, make the errors mechanically catchable, or constrain the orchestration. BHC and hx are filed, fairly, under "not a new language" — the bet that Haskell's purity and density already make AI-written, verifiable code natural once the tooling stops hurting. The commons is where that bet reaches into the verification camp, without becoming a new language: not a syntax for agents, but a place to keep what they have proved.
