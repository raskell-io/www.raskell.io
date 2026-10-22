+++
title = "Archipelag.io"
description = "Open AI models on a network of community-operated computers: each request goes to a capable machine nearby, and every job records where it ran."
path = "invest/archipelag-io"
template = "venture.html"

[extra]
project = "archipelag-io"
eyebrow = "Investor brief"
parent = { name = "Invest", url = "@/invest.md" }
contact_anchor = "talk-about-investing"
+++

Most AI requests from Europe travel to data centres operated under foreign law, while capable computers nearby sit idle most of the day. Archipelag.io is a working open beta that sends AI jobs to the nearest suitable community computer, runs only signed and reviewed model packages, and works with code written for the OpenAI API. The next step is real payouts for hosts, enforced regional placement for customers with residency needs, and a launch city by city, starting in Switzerland.

## The problem

{% tiles(cols=3) %}
- **Developers in Europe** They want open-weight models behind an API they already use, with a known, nearby place where the work happens. Today their prompts go to US hyperscaler regions.
- **Owners of idle hardware** Gaming PCs, Apple Silicon Macs, former mining rigs, and office servers: compute that is paid for and unused most of the day.
- **The gap in between** Decentralized markets rent out raw machines instead of giving results, expose hosts to arbitrary code, and treat reliability as an afterthought.
{% end %}

## The product

{% tiles(cols=3) %}
- **An OpenAI-compatible API** Streaming chat and tool calling, through the web, the API, Python and JavaScript SDKs, and a CLI.
- **Islands** The host agent, written in Rust, runs on Linux, macOS, and Windows, with Docker and GPU passthrough or WebAssembly.
- **Nearby-first placement** The coordinator scores hosts on speed, fit, and headroom, and prefers the same region, then neighbouring ones.
- **Signed Cargos only** Hosts run curated, signed model packages in a sandbox. Never arbitrary code.
- **A record of every job** Which Island ran each job is stored, so location is something you can check.
- **A growing catalog** Open models for chat, images, and embeddings, including tool-using models since October 2026.
{% end %}

The open beta has run since March 2026. It is free: hosts earn virtual credits while metering is validated, and real-money payouts are not enabled yet.

## The market

Analysts define these markets differently, so the figures are context. The most relevant are inference platforms, because Archipelag.io sells results rather than GPU hours, and the European sovereign segment.

{% tiles(cols=3, variant="figures") %}
- **USD 106 bn** Global AI inference in 2025, projected at USD 255 bn by 2030. [MarketsandMarkets](https://www.marketsandmarkets.com/PressReleases/ai-inference.asp)
- **USD 18.8 bn** AI inference platforms as a service in 2025, growing 41 percent a year to USD 105 bn by 2030. [MarketsandMarkets](https://www.webull.com/news/13617937942971392)
- **USD 6.9 bn** European sovereign cloud infrastructure in 2025, expected at USD 23.1 bn by 2027. [Gartner](https://www.gartner.com/en/newsroom/press-releases/2026-02-09-gartner-says-worldwide-sovereign-cloud-iaas-spending-will-total-us-dollars-80-billion-in-2026)
{% end %}

## Why now

{% tiles(cols=2, variant="figures") %}
- **+83 %** Expected growth of European sovereign cloud spending in 2026; Europe passes North America in 2027. [Gartner](https://www.gartner.com/en/newsroom/press-releases/2026-02-09-gartner-says-worldwide-sovereign-cloud-iaas-spending-will-total-us-dollars-80-billion-in-2026)
- **EUR 200 bn** The EU InvestAI plan for AI compute. New sites take years; the hardware in homes and offices exists today. [Euronews](https://www.euronews.com/next/2025/02/11/eu-to-mobilise-200-billion-for-ai-investment)
- **"Cannot guarantee"** Microsoft's own legal director on whether French data stays out of reach of US authorities. [The Register](https://www.theregister.com/2025/07/25/microsoft_admits_it_cannot_guarantee/)
- **Open weights** Open models released under MIT and Apache licences now sit close to the frontier, so a catalog of open models can carry a product.
{% end %}

Small models also keep shrinking: models with billions of parameters now fit on ordinary laptops and phones, which turns more of the hardware already out there into usable supply.

## What sets it apart

{% tiles(cols=2) %}
1. **Results, not machines** Customers call an API they already know. Nobody rents a box or manages a cluster.
2. **Nearby first** Placement prefers capable hosts close to the caller, which cuts latency and keeps work local.
3. **Safe for hosts** Only signed, curated Cargos run, behind a registry allowlist and sandbox profiles.
4. **From phones to servers** Native builds for five platforms, plus iOS and Android agents in testing.
5. **No token, no chain** Plain credits and, later, plain payouts. Nothing speculative between the customer and the result.
{% end %}

## Competition

| Company | What they do | How Archipelag.io differs |
|---|---|---|
| Akash Network | Token-based decentralized cloud, adding consumer GPUs | No token. Nearby-first placement, and only signed curated packages run |
| io.net, Nosana | Token-incentivised GPU marketplaces | Sells results through an OpenAI-compatible API, with a Swiss and European focus |
| Salad | Consumer-GPU container cloud from the US | Hosts never run arbitrary code; location is a placement input |
| Vast.ai, RunPod | GPU rental priced by the hour | Results over an API instead of infrastructure to manage |
| Together AI, Hyperbolic | Hosted open-model inference | Supply from independent hosts rather than owned clusters, with a choice of location |
| OVHcloud, Scaleway, Infomaniak | European-owned data centres | No data-centre capex: supply grows with community hardware in many cities |

## Business model

{% tiles(cols=3) %}
- **Credits for customers** Usage-based pricing for API results, with a premium for region-restricted runs that come with execution records.
- **Payouts for hosts** Paid for active job time, with bonuses for reliable hardware and for hosts in dense metros.
- **A compute exchange** Market pricing between supply and demand, already running with virtual credits.
{% end %}

Go-to-market is city by city: seed 25 to 50 hosts in one metro, keep a cloud fallback in the region, and start with Swiss and European companies that cannot send data to US regions. The website invites design partners for custom model packages.

## Where it stands

{% tiles(cols=3, variant="figures") %}
- **Mar 2026** Free open beta live at app.archipelag.io since March 13.
- **v0.6** Island release of October 2026, with tool calling and a llama.cpp runtime on every native build.
- **5** Desktop and server platforms with native Island builds, plus mobile agents in testing.
{% end %}

The Island agent, the CLI, both SDKs, and the website are public on GitHub, the Island under the MIT licence. There are no paying customers yet: payments are switched off on purpose until metering is validated.

## Risks

{% tiles(cols=2) %}
- **Unreliable home hosts** Jobs are requeued on failure, hosts build reputation, placement falls back to neighbouring regions, and a cloud fallback is part of the launch plan.
- **Data exposure** Hosts are identity-verified and traffic is encrypted. Confidential inference for regulated buyers is a prototype and a funding priority.
- **Residency claims** Placement prefers a region today. Hard enforcement and exportable execution records come before any residency promise.
- **Better-funded rivals** Most are token networks or US clouds. Archipelag.io competes on no token, European positioning, and results over an API.
{% end %}

## What funding would do

{% tiles(cols=2) %}
1. **Real payouts** Finish metering validation, switch on billing and host payouts, and publish payout rules.
2. **Enforced residency** Hard regional restriction, execution records customers can export, and a third-party security review.
3. **The first metro** 25 to 50 seeded hosts in one Swiss city, with published latency and reliability numbers.
4. **Bigger models** Bring multi-host inference for large open models, and confidential inference, from experimental to standard.
5. **A team** Hires in infrastructure reliability, security, and developer relations.
{% end %}

## Talk about investing

{% panel(eyebrow="Open to investment", title="Back Archipelag.io early.", contact=true) %}
I am looking for angels, funds, and strategic partners who see why Europe needs AI compute it can place. Send me a short message with who you are and what you would like to see first. More on the [Invest](/invest/) page.
{% end %}
