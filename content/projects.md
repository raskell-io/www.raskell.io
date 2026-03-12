+++
title = "Projects"
template = "projects-page.html"
+++

## Ventures

### Archipelago

Distributed compute, locally powered. A platform for running workloads on edge infrastructure — from GPU nodes to mobile devices. Coordinator app (Phoenix/Elixir), Rust node agents, mobile host agents (iOS/Android), WASM microjobs, and official SDKs (Python, TypeScript).

**Status:** In active development

<p class="project-links"><a href="https://archipelag-io.github.io/website/"><i data-lucide="globe"></i> Website</a> · <a href="https://github.com/archipelag-io"><i data-lucide="github"></i> GitHub</a></p>

---

### Cyanea

Bioinformatics platform built with Phoenix/Elixir and Rust NIFs. Building tools to accelerate genomic research through fast, collaborative data infrastructure.

**Status:** In active development

<p class="project-links"><a href="https://github.com/cyanea-bio/cyanea"><i data-lucide="github"></i> GitHub</a></p>

---

## Flagship and serious builds

### Zentinel: Guard the Free Web

A secure, high-performance reverse proxy with programmable security agents, built on Cloudflare's Pingora framework. Formerly Sentinel — now its own org with a full ecosystem: 20+ security agents, SDKs in 7 languages (Rust, Python, TypeScript, Go, Kotlin, Haskell, Elixir), a pure Rust ModSecurity reimplementation, a fleet management control plane, and a benchmarking framework.

**Key features:**
- Programmable agent architecture for security, routing, and observability
- Pure Rust ModSecurity engine with OWASP CRS compatibility
- Agent SDKs for extending in any language
- Control plane for fleet management (Elixir/Phoenix)
- Config converter from nginx, Apache, HAProxy, Traefik, Caddy, Envoy

**Status:** In active development

<p class="project-links"><a href="https://zentinelproxy.io"><i data-lucide="globe"></i> Website</a> · <a href="https://zentinelproxy.io/docs/"><i data-lucide="book-open"></i> Docs</a> · <a href="https://github.com/zentinelproxy/zentinel"><i data-lucide="github"></i> GitHub</a></p>

---

### Conflux

Schema-aware config state coordination. Multiple writers, deterministic merge, git milestones. A CRDT document engine with pluggable storage backends (SQLite, PostgreSQL, DynamoDB).

**Status:** In active development

<p class="project-links"><a href="https://github.com/raskell-io/conflux"><i data-lucide="github"></i> GitHub</a></p>

---

### hx

Extremely fast Haskell package and project manager built in Rust. Designed to replace the fragmented Haskell tooling ecosystem with a single, cohesive tool that handles dependencies, builds, and project scaffolding with sub-second response times.

**Status:** In active development

<p class="project-links"><a href="https://hx.arcanist.sh"><i data-lucide="globe"></i> Website</a> · <a href="https://github.com/arcanist-sh/hx"><i data-lucide="github"></i> GitHub</a></p>

---

### bhc

The Basel Haskell Compiler. A next-generation Haskell compiler and runtime targeting predictable, low-latency performance. Features structured concurrency primitives, a tensor-native numeric pipeline for ML workloads, and a runtime designed for systems where GC pauses are unacceptable.

**Status:** In active development

<p class="project-links"><a href="https://bhc.arcanist.sh"><i data-lucide="globe"></i> Website</a> · <a href="https://github.com/arcanist-sh/bhc"><i data-lucide="github"></i> GitHub</a></p>

---

### Shiioo (CO)

The Virtual Company OS. Agentic enterprise orchestrator: DAG workflows, event sourcing, MCP tools, categorized skill registry with git import.

**Status:** In active development

<p class="project-links"><a href="https://github.com/raskell-io/shiioo"><i data-lucide="github"></i> GitHub</a></p>

---

### Sango

A command-line diagnostic tool that evaluates web edge infrastructure health. Named after coral, symbolizing how the tool monitors edge systems like coral guards a reef ecosystem.

**Key features:**
- TLS analysis (certificate chain, cipher suites, ALPN)
- HTTP/1.1, HTTP/2, and HTTP/3 protocol detection
- Security header evaluation (HSTS, CSP, COOP/COEP)
- Performance metrics with threshold-based alerts

**Status:** In active development

<p class="project-links"><a href="https://sango.raskell.io"><i data-lucide="globe"></i> Website</a> · <a href="https://github.com/raskell-io/sango"><i data-lucide="github"></i> GitHub</a></p>

---

### Ushio

A traffic replay tool designed to understand edge and WAF behavior. Named after the Japanese word for "tide," reflecting how the tool replays captured traffic deterministically across environments.

**Key features:**
- HAR file support for traffic capture
- URL rewriting for staging/production comparison
- Header mutation and cookie stripping
- WAF detection and behavioral diff

**Status:** In active development

<p class="project-links"><a href="https://github.com/raskell-io/ushio"><i data-lucide="github"></i> GitHub</a></p>

---

### Die Zukunft

Eine Neue Schweizer Partei. A Swiss political movement with a digital-first governance platform, evidence-based research pipeline, and multilateral presence.

**Status:** In active development

<p class="project-links"><a href="https://die-zukunft.ch"><i data-lucide="globe"></i> Website</a> · <a href="https://github.com/zukunft-ch"><i data-lucide="github"></i> GitHub</a></p>

---

## Labs / passion projects

These are exploratory. Some will become serious. Some will stay fun.

### Terrarium

A societal simulation engine where LLM-powered agents form emergent civilizations. A societal petri dish — create worlds with rules, populate them with autonomous agents powered by language models, and observe what develops organically.

**Key features:**
- Agents with personality traits, beliefs, survival needs, and memories
- Seven core actions (move, gather, eat, rest, speak, give, attack)
- Event-sourced logging with perfect replay capability
- Dwarf Fortress-inspired terminal viewer
- Beliefs over facts — property exists only as subjective conviction

**Status:** In active development

<p class="project-links"><a href="https://github.com/raskell-io/terrarium"><i data-lucide="github"></i> GitHub</a></p>

---

### Driftscape

Ambient soundscape platform — composable, location-aware, AI-powered background music.

**Status:** In active development

<p class="project-links"><a href="https://github.com/raskell-io/driftscape"><i data-lucide="github"></i> GitHub</a></p>

---

### robogym

Rust/Bevy PWA for training robotic agents.

**Status:** Very early

<p class="project-links"><a href="https://github.com/raskell-io/robogym"><i data-lucide="github"></i> GitHub</a></p>

---

### Paw & Claw

HD-2D-stylized turn-based tactics game (spiritual successor to Nintendo's Advance Wars) built with Rust/Bevy.

**Status:** In active development

<p class="project-links"><a href="https://github.com/raskell-io/paw-and-claw"><i data-lucide="github"></i> GitHub</a></p>

---

### Kurumi

A local-first second brain. Your ideas, everywhere, offline. Named after the Japanese word for walnut — because it looks like a brain.

**Key features:**
- Wikilinks and backlinks for connecting thoughts
- Graph visualization of note relationships
- Full-text search and hashtag filtering
- Completely offline-first with optional sync via Automerge CRDTs
- Progressive Web App (PWA) support
- No vendor lock-in — your data stays yours

**Status:** In active development

<p class="project-links"><a href="https://github.com/raskell-io/kurumi"><i data-lucide="github"></i> GitHub</a></p>

---

### Awesomeify

Index GitHub repos and generate static awesome-list sites.

**Status:** In active development

<p class="project-links"><a href="https://github.com/raskell-io/awesomeify"><i data-lucide="github"></i> GitHub</a></p>

---

### Learn You the Web

A friendly guide to how the web actually works. For Real This Time.

An e-book that explains the web's core technologies — HTTP, DNS, TLS, and the protocols that hold it all together — without the hand-waving or oversimplification.

**Status:** In progress

<p class="project-links"><a href="https://learn-you-the-web.raskell.io"><i data-lucide="book-open"></i> Read online</a> · <a href="https://github.com/raskell-io/learn-you-the-web"><i data-lucide="github"></i> GitHub</a></p>
