+++
title = "Start Here"
description = "New here? Start with three short pieces, then go deeper along four reading tracks. Each track reads well in order, and each article stands on its own."
template = "tracks.html"

[[extra.tracks]]
title = "Edge systems and applied security"
deck = "How policy, auth, WAF, and observability are moving to the edge, and what that means for how we build backends."
items = [
  { path = "articles/edge-systems-are-the-new-backend.md", note = "Auth, policy, inference, and business logic are moving to the edge and the client. The traditional backend is becoming a persistence layer." },
  { path = "articles/what-zentinel-is-really-optimizing-for.md", note = "Every major proxy was a product of its time. Zentinel is a product of this one: safety, operability, and the operator's ability to sleep." },
  { path = "articles/notes-from-rsac-2026.md", note = "Third time at RSA Conference, first time as a speaker. What I saw on the floor and what I am still processing." },
]

[[extra.tracks]]
title = "Building agent platforms"
deck = "The Agent Platform Handbook builds an agent harness from first principles, one post and one working piece of code at a time."
items = [
  { path = "articles/what-an-agent-actually-is.md", note = "The most overloaded word in the industry, taken apart: the anatomy, the lineage, and a working agent in about two hundred lines of TypeScript." },
  { path = "articles/your-agent-wants-root.md", note = "An agent with a shell tool is arbitrary code execution with a friendly face. Why Docker alone is not enough, and a hardened sandbox you can use today." },
  { path = "articles/the-bill-is-part-of-the-loop.md", note = "Every response already carries its own cost. Turning that number into something the loop can see and act on." },
]

[[extra.tracks]]
title = "Platform automation and operability"
deck = "Workflows, guardrails, and the tooling that makes shipping sustainable."
items = [
  { path = "articles/how-ai-makes-bare-metal-viable-again.md", note = "I moved two production apps from Kubernetes to a single Hetzner box. The missing piece was not the hardware." },
  { path = "articles/mise-ate-my-makefile.md", note = "Mise replaced Make, asdf, and a pile of shell scripts with a single TOML file per project." },
  { path = "articles/how-i-work-these-days.md", note = "From Kaggle and Hugging Face in 2020 to coding agents in late 2025, and why the routine finally feels right." },
]

[[extra.tracks]]
title = "Languages, AI, and open source"
deck = "What happens to programming languages when AI writes most of the code, and why Haskell still matters."
items = [
  { path = "articles/what-programming-languages-become-when-ai-writes-the-code.md", note = "Three futures for the layer between human intent and machine execution, and why I bet on Haskell." },
  { path = "articles/all-beginning-is-haskell.md", note = "How Haskell shaped the way I think about building systems." },
  { path = "articles/looking-back-on-2025.md", note = "On reading Tim Berners-Lee in Okinawa, and why AI might accidentally save the web from itself." },
]
+++

## If you have ten minutes

Three short ways in, each showing a different side of what I do.

- **[Alert triage is a context problem](/notes/alert-triage-is-a-context-problem/)**, a two-minute note from my day job. A colleague and I put an LLM on a noisy WAF. It did not make the alerts quieter on its own. Giving it the context an operator would look up first did.
- **[A model gateway is a reverse proxy](/notes/a-model-gateway-is-a-reverse-proxy/)**, another short note, and the idea I keep coming back to: most of what an agent platform needs is old infrastructure work with a new payload, and the vocabulary of edge proxies carries over almost unchanged.
- **[The hx benchmarks](https://arcanist.sh/hx/benchmarks/)**, for judging the engineering by something you can run. hx is a Haskell toolchain written in Rust, and the page writes down the test machine, the method, and the limits. The [longer story](/articles/why-we-built-a-haskell-package-manager-in-rust/) explains why it exists.

The four tracks below go deeper, one subject at a time.
