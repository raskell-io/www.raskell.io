+++
title = "Arcanist"
description = "Haskell tooling that makes AI-written code cheap to check, and records each check so nobody, human or model, has to repeat it."
path = "invest/arcanist"
template = "venture.html"

[extra]
project = "arcanist"
eyebrow = "Investor brief"
parent = { name = "Invest", url = "@/invest.md" }
contact_anchor = "talk-about-investing"
+++

Models now write code faster than people can review it, and studies keep finding that a large share of that code is wrong or insecure. Arcanist ships hx, one fast Haskell toolchain with reproducible builds and an interface for coding agents, and bhc, a second Haskell compiler measured in public against GHC. Its signed registry already records which package versions bhc has built. The next step is a commons where a function checked once can be cited by every human or model that needs it.

## The problem

Generation became cheap. Checking did not. Every agent session re-checks the same functions and throws the result away, and every team pays for review again.

{% tiles(cols=3) %}
- **Teams running Haskell** They juggle ghcup, cabal or Stack, formatters, linters, and coverage tools. In the 2025 State of Haskell survey, 27 percent said a compiler upgrade broke their code in the last year.
- **Anyone shipping AI-written code** Output arrives faster than anyone can review it, and "almost right" is the most common complaint about AI tools.
- **Coding agents themselves** They need tools with structured errors and exit codes, not output written for a human at a terminal.
{% end %}

## The product

{% tiles(cols=3) %}
- **hx** The whole Haskell workflow in one Rust binary: toolchain install, build, test, format, lint, coverage, and publish. Release 0.11, the 42nd since January 2026.
- **Reproducible builds** A lockfile pins every dependency by SHA-256 and Hackage revision, and CI fails on drift.
- **Built for agents** hx serves build, test, lock, and doctor tools to coding agents over MCP, with structured errors.
- **bhc** The Basel Haskell Compiler, a clean-slate compiler and runtime in Rust. All 221 Pandoc modules type-check and compile, and 219 test programs agree with GHC.
- **The registry** registry.arcanist.sh is signed, readable by plain cabal, and stores a signed bhc build result for every version. Preview, publishing by invitation.
- **Everywhere** Homebrew, cargo, Nix, aqua, winget, a container image, and binaries for macOS, Linux, and Windows.
{% end %}

In a self-reported benchmark against cabal on a small project, hx starts 6 times faster, builds cold 5.6 times faster, and rebuilds 4.8 times faster. bhc publishes its gaps as openly as its numbers: compiled programs do not yet collect garbage, so long-running services wait for that milestone.

## The market

No one has sized a market for verifying AI-written code yet, and this page does not invent one. The markets around it are large and moving fast.

{% tiles(cols=3, variant="figures") %}
- **USD 8.1 bn** AI code assistants in 2025, projected at USD 127 bn by 2032. [MarketsandMarkets](https://www.marketsandmarkets.com/Market-Reports/ai-code-assistant-market-166208330.html)
- **USD 1 bn** Run-rate revenue of Claude Code six months after launch. Developers pay for AI that writes code. [Anthropic](https://anthropic.com/news/anthropic-acquires-bun-as-claude-code-reaches-usd1b-milestone)
- **USD 6.4 bn** Software development tools in 2025, growing to USD 15.7 bn by 2031. [Mordor Intelligence](https://www.mordorintelligence.com/industry-reports/software-development-tools-market)
{% end %}

## Why now

{% tiles(cols=2, variant="figures") %}
- **45 %** Share of test cases where AI-generated code introduced a security flaw, with no improvement as models grew. [Veracode](https://www.veracode.com/press-release/ai-generated-code-poses-major-security-risks-in-nearly-half-of-all-development-tasks-veracode-research-reveals/)
- **1.7 x** More major issues in AI-coauthored pull requests than in human-only ones. [CodeRabbit](https://coderabbit.ai/blog/state-of-ai-vs-human-code-generation-report)
- **46 %** Developers who distrust the accuracy of AI output, up from 31 percent a year earlier. [Stack Overflow survey via TechRepublic](https://www.techrepublic.com/article/news-developer-trust-in-ai-declines/)
- **USD 1.45 bn** Valuation of Harmonic, a formal-verification company, in 2025. Checking is attracting capital. [Crowdfund Insider](https://www.crowdfundinsider.com/2025/11/256050-robinhood-ceo-backed-harmonic-becomes-unicorn-on-series-c/)
{% end %}

AI labs are also buying developer tools: OpenAI announced the acquisition of Astral, the company behind uv and Ruff, and Anthropic acquired Bun. Fast, coherent toolchains have become strategic for agent platforms.

## What sets it apart

{% tiles(cols=2) %}
1. **One binary for the whole workflow** Six separate tools become hx commands, installable through eight channels.
2. **Reproducible by default** Hash-pinned lockfiles, offline sync, and a CI check that fails on drift.
3. **Built for agents in the loop** An MCP server with structured errors, plus llms.txt and AGENTS.md shipped with the code.
4. **A second compiler measured in public** Dated, published numbers against GHC as ground truth, including the gaps.
5. **Verification that accumulates** The registry keeps signed build results per version from a scheduled verifier, so a check done once stays on record.
{% end %}

## Competition

| Alternative | What it does | How Arcanist differs |
|---|---|---|
| cabal-install | The standard Haskell build tool | hx drives cabal and adds toolchain install, a hash lockfile, format, lint, coverage, and MCP in one binary |
| Stack | Curated snapshots and reproducible builds | hx reads `.cabal` and Hackage directly, and imports Stack projects |
| GHCup | Installs GHC, Cabal, and HLS | hx reads the same metadata and installs per project, without a separate tool |
| Nix, haskell.nix | Hermetic builds | Heavier to adopt; hx ships a flake and keeps a simpler default |
| GHC | The reference compiler | bhc is an independent second compiler with a WebAssembly backend; GHC stays the ground truth |
| Hackage | The central package index | Signed, cabal-compatible, and records verification results per version |
| Lean, Dafny | Proof assistants | Complementary: Arcanist makes checks reusable records in a production language |

## Business model

hx, bhc, and the registry are free and stay free. Today they are funded through [GitHub Sponsors](https://github.com/sponsors/arcanist-sh) and Ko-fi, and companies can fund specific features or security reviews. The paid layers sit on top, the way Astral built adoption with free tools first.

{% tiles(cols=2) %}
- **Private registry** Verification records, policy controls, and audit logs for companies running Haskell or AI-written code.
- **Verification as a service** Paid verifier capacity with signed results.
- **Support** Contracts for teams adopting hx in CI.
- **Strategic fit** Agent platforms need output they can check, as the Astral and Bun acquisitions showed.
{% end %}

## Where it stands

{% tiles(cols=3, variant="figures") %}
- **68** Releases of hx and bhc in about nine months: 42 and 26.
- **3,000+** Release downloads from GitHub and crates.io across hx and bhc.
- **221 / 221** Pandoc modules that bhc type-checks and compiles.
{% end %}

The registry is live in preview with its first verified package, and the scheduled verifier signs its results. hx was presented at ZuriHac 2026. There are no paying customers yet: this is an early ticket into tooling that already ships every few weeks.

## Risks

{% tiles(cols=2) %}
- **A small language** Haskell has a devoted but small community. hx serves existing Haskell teams now, and the verification thesis aims at the much larger market for AI-written code.
- **Compiler maturity** bhc does not yet run long-lived services. hx works with GHC today, so the business does not depend on bhc.
- **Open-source revenue** Donations rarely fund compilers. A hosted registry and paid verification are the natural paid layers.
- **One maintainer** Arcanist is built by one person with heavy use of AI agents. Funding would add engineers.
{% end %}

## What funding would do

{% tiles(cols=2) %}
1. **Garbage collection** A live collector on the compiled-code path, so bhc can run services.
2. **Pandoc end to end** The pandoc command running fully under bhc.
3. **An open registry** From preview to open publishing, with verifier capacity beyond one CI job.
4. **The first commons milestone** Content-addressed definitions and attestations for reproducible artifacts.
5. **Real GPU validation** The CUDA and ROCm backends tested on hardware.
6. **A team and design partners** Two more engineers, and a private registry pilot with companies.
{% end %}

## Talk about investing

{% panel(eyebrow="Open to investment and sponsorship", title="Back Arcanist early.", links=["Sponsor on GitHub|https://github.com/sponsors/arcanist-sh"], contact=true) %}
For investment, send me a short message with who you are and what you would like to see first. To support the open-source work, sponsor it directly. More on the [Invest](/invest/) page.
{% end %}
