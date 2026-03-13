+++
title = "Archipelag.io Is in Open Beta: Here's Why I Built It"
date = 2026-03-13
description = "The eight-year journey from watching Ethereum miners sacrifice their gaming PCs to building a decentralized compute network that just entered open beta. Architecture, conviction, and the long road from whitepaper to production."

[taxonomies]
tags = ["platform-automation", "edge-systems", "oss"]
categories = ["deep-dives"]
series = ["deep-dives"]

[extra]
author = "Raffael"
image = "archipelag-io-open-beta.avif"
og_image = "archipelag-io-open-beta.png"
+++

There is an abandoned factory building in Glarus, a small town wedged between mountains in eastern Switzerland. In 2018, the building was loud. Not machinery-loud, fan-loud. Rows of bare motherboards bolted to open-air frames, each bristling with GPUs and daisy-chained power supplies. The air tasted like warm dust and ozone. Cables ran everywhere, held in place by zip ties and optimism. This was an Ethereum mining operation, and I was standing in the middle of it, watching people I knew convert their gaming rigs, hardware they loved, into money-printing machines.

I was there because Vitalik Buterin had decided to visit. He had flown in on a private jet to Geneva, driven up in a black limousine with tinted windows, and walked into this dusty, chaotic space to see what Swiss miners were building. It was surreal. The creator of Ethereum, stepping over power cables in an industrial ruin, nodding at rack after rack of GPUs humming away at proof-of-work hashes. I do not think he was impressed by the elegance of the setup. Nobody was. But something about that scene stuck with me.

People were willing to sacrifice their gaming entertainment, their *leisure hardware*, to chase the dream of sovereign financial independence using fundamentally nerdy equipment: PCs, internet connections, blockchain protocols, and GPU graphics cards. They were converting consumer-grade technology into economic infrastructure, and they were doing it themselves. No data center leases. No vendor contracts. No permission from anyone. Just people, hardware, and a protocol that made it worth their while.

I had skin in the game too. I invested (gambled, honestly) in crypto during that era. I watched the charts, rode the swings, felt the dopamine spikes and the stomach-drops. The financial side was wild and ultimately unsustainable for most people. But the *infrastructure* side, the part where ordinary humans turned their homes into compute nodes and got paid for it: that part was real, and that part stayed with me long after the crypto hype faded and the rigs went quiet.

This is the story of how that factory visit turned into [Archipelag.io](https://archipelag.io), a distributed compute network that entered open beta today. It has been eight years of thinking, two years of building, and a lot of being wrong about the right things at the wrong time.

<!-- more -->

---

## The whitepaper nobody asked for

The blockchain hype faded. Other things took over. I moved on to platform engineering, security work, edge systems. But the image of those mining rigs kept coming back. Not the crypto part, the *topology* part. The fact that thousands of people, globally, had independently decided to run compute infrastructure in their homes. That was a distributed network. A messy, profit-motivated, beautifully organic distributed network.

Before ChatGPT hit during Christmas 2022 and rewired everyone's expectations about what compute was *for*, I had already drafted a whitepaper for an idea I could not stop thinking about: what if people could share compute resources (RAM and CPU) the same way miners shared hash power, but for general workloads?

At the time, I did not think much about GPUs. They were there, obviously, relevant for gaming and for the mining operations I had witnessed, but I thought they were too niche for a general-purpose compute network. I was focused on CPU and memory. The workloads I imagined were batch processing, data transformation, lightweight inference: things that needed more cores and more RAM rather than massively parallel floating-point throughput.

Boy, was I wrong.

I will get to how wrong I was about GPUs. But first, let me explain why the core idea, people sharing compute with each other through a coordinated network, felt not just viable but *inevitable*.

## Why this should exist

The argument is embarrassingly simple. The hardware exists. The bandwidth exists. The people exist.

The gaming industry alone ships over 30 million discrete GPUs per year. Each of those cards sits idle for most of its life. You play for a few hours, maybe you do some 3D rendering or video editing, and then it sits there, drawing idle power, doing nothing. Multiply that by the tens of millions of gaming PCs, workstations, and creative machines worldwide, and you are looking at an ocean of stranded compute.

On the demand side, three companies control the vast majority of GPU cloud capacity. If you want to run AI inference at scale, you rent from AWS, Azure, or GCP. You pay their prices. You play by their rules. You send your data to their regions. For a lot of the world (developers in Southeast Asia, startups in Latin America, researchers in Africa) those prices are prohibitive, and those regions are far away. Latency matters. Data sovereignty matters. Cost matters.

The gap between supply and demand is not a technology problem. It is a coordination problem. The compute is already deployed in homes and offices worldwide. The people who own it would happily share it for compensation. The people who need it would happily pay less than hyperscaler rates for inference that runs closer to them. What is missing is the protocol, the trust model, and the marketplace that connects them.

That is what Archipelag.io is. A network of independent islands (the name comes from *archipelago*) working together. Each island is a host running the Archipelag.io node agent. Each host contributes compute capacity to the network. Users submit workloads through a web UI, an API, or an SDK, and the network routes those workloads to the best available host based on proximity, capability, and reputation.

It is not blockchain. There are no tokens. There is no consensus mechanism. There is no decentralization theater. It is a coordinated marketplace with a trust model, a billing system, and a reputation engine, built on boring, battle-tested infrastructure.

## The technology bets

Every project of this scope requires a few technology bets: commitments to specific stacks and paradigms that will either vindicate your judgment or haunt you for years. Here are the ones I made, why I made them, and which ones panned out.

### Elixir and the BEAM

I have believed for a long time that Elixir and the BEAM virtual machine are the ideal foundation for distributed coordination systems. The BEAM was designed for telecom switching, exactly the kind of fault-tolerant, high-concurrency, message-passing architecture you need when you are orchestrating work across unreliable nodes in different regions.

In Archipelag.io, the coordinator is an Elixir/Phoenix application. It manages the job lifecycle (submitted → queued → assigned → started → streaming → succeeded/failed), the host registry, the placement algorithm, billing, reputation tracking, and the real-time streaming UI. Phoenix LiveView lets us push token-by-token LLM output to the browser over WebSockets without writing a line of JavaScript for the streaming logic.

The BEAM gives us things for free that other platforms charge dearly for. Process isolation means a misbehaving job handler does not bring down the coordinator. Supervision trees mean crashed processes restart automatically. Distribution primitives mean we can (eventually) run coordinators in multiple regions and have them communicate natively. Pattern matching makes state machine logic clean and auditable, and the job lifecycle is fundamentally a state machine.

This was the bet I was most confident in, and it has paid off. The coordinator handles real-time streaming, concurrent job dispatch, health monitoring, and billing without breaking a sweat. Elixir was the right call.

### Rust for the node agent

The node agent, the software that runs on host machines, manages containers, reports capabilities, and executes workloads, is written in Rust. This was a pragmatic decision, not an ideological one.

The agent needs to interact with Docker, manage GPU resources via nvidia-smi, execute WASM modules, handle cryptographic verification of container images and self-updates, and do all of this with minimal resource overhead on a machine that is simultaneously running user workloads. It needs to be fast, memory-safe, and reliable on Linux, macOS, and Windows.

Rust delivers on all of that. Tokio gives us async I/O for concurrent job handling. Bollard gives us Docker API access. Wasmtime gives us WASM execution with fuel metering. Ed25519 verification for self-updates is straightforward with established crates. And the type system catches entire categories of bugs at compile time that would be runtime panics in other languages.

The agent is roughly 7,700 lines of Rust. It pulls jobs from NATS JetStream, manages a local image cache with LRU eviction, sends heartbeats every 10 seconds with system metrics, and sandboxes workloads with seccomp profiles, read-only filesystems, and dropped capabilities. It is one of the parts of the system I am most proud of.

### WASM: the bet that has not fully landed (yet)

Here is where the story gets interesting, because this is the bet I made early that turned out to be *directionally* correct but *temporally* wrong.

When I first drafted the whitepaper, I thought WebAssembly was going to be the lingua franca of distributed compute. The idea was elegant: any device that could run a browser, or later a dedicated WASM runtime like Wasmtime or Wasmer, could participate in the network. WASM provides sandboxing, portability, and near-native performance. You compile your workload to WASM once, and it runs everywhere.

I still believe this. WASM *is* the right abstraction for portable, sandboxed compute. The node agent supports WASM execution today, and we ship 22 WASM modules for utility workloads like JSON processing, CSV transformation, compression, hashing, and QR code generation. For lightweight, CPU-bound tasks, WASM is excellent.

But WASM has not eaten the world the way I expected it to by 2026. Adoption has been steady but not explosive. The WASI ecosystem is still maturing. GPU access from WASM is still nascent. For the workloads that actually drive demand right now (LLM inference and image generation) you need CUDA, and that means Docker containers with NVIDIA runtime support.

So we built both paths. Docker containers for heavy GPU workloads. WASM modules for lightweight, portable tasks. The bet is that WASM's share of the pie grows over time as the runtime ecosystem matures and as WebGPU (more on this shortly) closes the GPU access gap. For now, containers do the heavy lifting.

### WebGPU: the catalyst

This is the part that made me stop procrastinating and actually build the thing.

WebGPU became a standard in modern browsers (Chrome, Edge, Safari, Firefox) and suddenly the browser was not just a document renderer or an application platform. It was a *GPU compute platform*. You could write shaders, run matrix multiplications, and perform inference directly in the browser tab without plugins, without native code, without any installation at all.

WebGPU did not exist when I wrote the original whitepaper. WebGL was around, but it was a graphics API, not a compute API. WebGPU is different. It exposes compute shaders. It is designed for the kind of general-purpose GPU work that machine learning requires. And it runs everywhere a modern browser runs.

That realization is what finally forced my hand. If browsers can do GPU compute, then every laptop, every phone, every tablet with a modern browser becomes a potential compute node. Not just the gaming PCs with NVIDIA cards, but *everything*. The network does not have to be limited to enthusiasts who know how to install Docker and configure nvidia-smi. It can include anyone with a browser.

We are not there yet in the current beta. Today, the primary path for GPU hosts is the Rust node agent with Docker and NVIDIA runtime support. But the iOS agent (Swift, currently in early stage) already runs WASM microtasks and has CoreML integration planned. Browser-based hosting via WebGPU is on the roadmap. When it lands, it fundamentally changes the supply side of the network.

### NATS JetStream for messaging

Job dispatch in a distributed system is a messaging problem. You need reliable delivery to hosts that may go offline at any time. You need streaming for token-by-token LLM output. You need durability so that if a host crashes mid-job, the work can be reassigned.

We use NATS with JetStream for this. Three streams handle the core flows:

| Stream | Purpose | Retention |
|--------|---------|-----------|
| `JOBS` | Job dispatch to agents | WorkQueue (at-most-once, no duplicates) |
| `JOB_STATUS` | Status updates from agents | 24-hour retention |
| `JOB_OUTPUT` | Output streaming (tokens, images) | 1-hour retention, 1GB cap |

NATS is a single binary, easy to deploy, battle-tested in production at scale, and natively supports the pub/sub and queue group patterns we need. JetStream adds durability and exactly-once semantics where we need them (job dispatch) while letting us use fire-and-forget for things like heartbeats and progress updates.

The alternative was Kafka or Redis Streams, but NATS fits the "lightweight, single-binary, easy to operate" philosophy better. We are building infrastructure for a distributed network; the messaging layer itself should not require a distributed systems PhD to operate.

## Architecture: how it actually works

Let me walk through what happens when you type a prompt into Archipelag.io and press enter.

### The control plane

The coordinator, our Elixir/Phoenix application, is the brain. It does not run any inference itself. It manages the network: who is online, what they can do, who needs what, and who owes whom.

When a user submits a chat message, the coordinator:

1. Validates the input (message length, token limits, rate limits)
2. Checks the user's credit balance
3. Runs the placement algorithm to find the best host
4. Atomically deducts credits (preventing TOCTOU race conditions)
5. Publishes the job to NATS JetStream on the selected host's job stream
6. Opens a WebSocket channel to stream results back to the user's browser

The placement algorithm scores available hosts on multiple dimensions: karma (reputation), current load, geographic proximity, hardware tier match, and workload compatibility. A host with a high-karma RTX 4090 that is close to the user and currently idle will score higher than a low-karma RTX 3060 that is far away and already running two jobs.

### The data plane

On the host side, the Rust node agent is a pull consumer on NATS JetStream. It sits there, listening for jobs on its dedicated stream (`host.{id}.jobs`). When a job arrives:

1. The agent acknowledges the message (preventing redelivery)
2. Publishes a "started" status update
3. Checks the local image cache for the required container image
4. Pulls the image if missing (with cosign signature verification)
5. Launches the container with the appropriate seccomp profile
6. Pipes the job input (JSON) to the container's stdin
7. Reads the container's stdout line by line, parsing streaming output
8. Publishes each output chunk to NATS (`host.{id}.output`)
9. On completion, publishes "succeeded" status
10. The coordinator receives the status, updates the job record, increments the host's karma

The container itself runs in a sandbox. Depending on the workload's trust tier, it gets different levels of restriction:

- **Restricted**: 256MB RAM, 60-second timeout, no network, no GPU, minimal syscalls
- **Standard**: 1GB RAM, 5-minute timeout, no network, GPU access, default seccomp
- **Elevated**: 8GB RAM, 10-minute timeout, network allowed, GPU access, relaxed seccomp

All containers run with a read-only root filesystem, all Linux capabilities dropped, and network disabled by default. We do not trust workload code. The agent does not trust workload code. The coordinator does not trust workload code. Trust is earned through the reputation system and enforced through sandboxing.

### The streaming path

For LLM inference, latency perception matters enormously. Nobody wants to wait 30 seconds for a complete response. They want to see tokens appear in real-time, like they do in ChatGPT.

The output protocol is simple. Workload containers write JSON lines to stdout:

```json
{"type": "token", "content": "The"}
{"type": "token", "content": " answer"}
{"type": "token", "content": " is"}
{"type": "token", "content": " 42"}
{"type": "done", "usage": {"prompt_tokens": 12, "completion_tokens": 4}}
```

The agent captures each line and publishes it to NATS. The coordinator consumes these chunks from JetStream and pushes them to the user's browser via WebSocket. Phoenix LiveView handles the real-time DOM updates. The result: token-by-token streaming from a GPU in someone's home to your browser, routed through the coordinator, with sub-second perceived latency.

## The reputation engine

Trust is the hardest problem in any distributed marketplace. How do you ensure that hosts actually run the workloads they claim to? How do you handle hosts that go offline mid-job? How do you prevent gaming the system?

Archipelag.io uses a karma-based reputation system. Every host starts with a baseline karma score. Successful jobs increase karma. Failed jobs, timeouts, and dropped connections decrease it. The placement algorithm weights karma heavily, so reliable hosts get more work and earn more credits.

The karma system tracks:

- **Success rate**: What percentage of assigned jobs complete successfully?
- **Latency**: How quickly does the host start and complete jobs?
- **Uptime**: How consistently is the host available?
- **Failure severity**: Did the host fail gracefully (reported error) or ungracefully (disappeared)?

Hosts that fall below a karma threshold enter a cooldown period where they receive fewer job assignments. Persistent bad actors get suspended. The system is designed to be fair; network hiccups and occasional failures are tolerated, but deliberate abuse or chronic unreliability is penalized.

This is one of the open questions we are testing in the beta. Does the karma system actually produce the right incentives? Do hosts game it? Are the thresholds calibrated correctly? We will find out.

## What you can do with Archipelag.io today

The open beta launched today, March 13, 2026, and runs through June 13. Everything financial during the beta is virtual: credits, earnings, payouts, all fake money. We need to test the system under real-world conditions without anyone losing real money if (when) things break.

### As a user

You can run AI workloads through the web UI, the API, or our SDKs (JavaScript/TypeScript and Python).

**LLM chat**: Mistral 7B and Llama models via llama.cpp. You type a prompt, the network routes it to a host with sufficient VRAM, and you get streaming responses. We expose an OpenAI-compatible API at `/api/v1/chat/completions`, so if your code already talks to OpenAI, you can point it at Archipelag.io with minimal changes.

**Image generation**: Stable Diffusion XL. Specify a prompt, get an image. Adjust parameters like resolution, steps, and guidance scale.

**Computer vision**: 54 container workloads covering object detection, face blurring, image captioning, OCR, depth estimation, style transfer, upscaling, segmentation, and more.

**Document and media processing**: PDF extraction, HTML-to-PDF conversion, video transcoding via FFmpeg, audio normalization, and other utility workloads.

**WASM utilities**: 22 lightweight modules for JSON/CSV processing, compression, hashing, base64 encoding, QR code generation, and similar tasks.

The marketplace lists available workloads with their requirements, pricing (in virtual credits for now), and trust levels. You can browse, try, and provide feedback.

### As a host

If you have an NVIDIA GPU (RTX 3060 or better), you can install the node agent and start contributing compute. The agent runs on Linux, macOS, and Windows. It detects your hardware capabilities, registers with the coordinator, and starts pulling jobs.

You control your availability. You decide when the agent runs, what workloads you accept, and how much of your hardware you share. Credits earned during the beta are virtual, but beta participants will receive bonus credits when we transition to real billing.

We are also testing mobile participation. The iOS agent lets iPhones and M-series Macs contribute to the network for lightweight WASM tasks. It only runs when your device is charging, on WiFi, and thermally comfortable. We are not going to drain your battery or cook your phone.

## What we do not know yet

The beta exists precisely because we have a list of things we do not know and cannot know without real traffic, real users, and real hosts.

**Routing effectiveness.** The placement algorithm looks good in testing, but real-world host distributions, network conditions, and workload mixes will be different. Does proximity-based routing actually reduce latency? Are there edge cases where the "best" host by our scoring is not the best host in practice?

**Onboarding friction.** Is it actually easy enough for a non-technical person to install the node agent and start hosting? Where do people get stuck? What assumptions did we make about users that turn out to be wrong?

**Karma calibration.** Are the reputation thresholds right? Do they converge on good behavior quickly enough? Do they punish too harshly for transient failures?

**Supply and demand balance.** Will we have enough hosts for the workloads users want to run? Will we have enough users to keep hosts busy? The chicken-and-egg problem is real in any marketplace.

**Workload diversity.** Are people mostly doing LLM chat, or do the vision, document, and utility workloads get traction? This shapes our roadmap for what to build next.

These are not rhetorical questions. If you join the beta and encounter friction, weirdness, or broken things, we want to hear about it. GitHub issues and direct email both work.

## The long road: 2018 to 2026

This project did not happen in a straight line.

**2018**: I am standing in a factory in Glarus, watching Vitalik Buterin inspect mining rigs. The idea plants itself: people will run infrastructure at home for the right incentive.

**2019 to 2021**: The idea percolates. I think about it in the shower, on trains, during boring meetings. I sketch architectures on napkins. I prototype bits in Elixir. I convince myself WASM will make it possible to run workloads on any device. I do not build anything real because the demand signal is not there; people are mining crypto, not running general compute.

**Late 2022**: I write a whitepaper. CPU and RAM sharing. Federated compute via BEAM nodes. WASM as the universal execution target. It is ambitious, probably too ambitious, and does not account for GPUs at all. ChatGPT ships in December and rearranges everyone's understanding of what compute is valuable for.

**2023**: The post-ChatGPT landscape reshapes the thesis completely. GPU inference is suddenly the workload that matters. My whitepaper's dismissal of GPUs as "too niche" is embarrassingly wrong. But the *core idea*, people sharing home compute through a coordinated network, is more relevant than ever, because GPU cloud capacity is expensive and constrained.

**2024**: I start building seriously. Elixir coordinator. Rust node agent. NATS for messaging. Docker for workload isolation. The architecture solidifies. I make the hard decisions about trust models, billing, and reputation. I look at WebGPU becoming a standard in major browsers and realize the future supply side of this network is every device with a modern browser, not just PCs with NVIDIA cards.

**2025**: Continuous development. The coordinator grows to 36,000+ lines of Elixir. The workload catalog expands to 94 containers and 22 WASM modules. SDKs for JavaScript and Python. The iOS agent takes shape. Load testing, security hardening, operational runbooks. I recruit beta testers and fix everything they break.

**March 13, 2026**: Open beta. You are here.

Eight years from idea to open beta is a long time. I am not going to pretend it was a master plan executed flawlessly. It was an idea that would not die, shaped by technological shifts I did not predict, refined by being wrong about specifics while being (I think) right about the direction. The path from "people will share compute for the right incentive" to "here is a working distributed inference network" was not straight, but it got here.

## Why I am proud of this

I am proud of this because it *works*. Not in a demo sense. Not in a pitch deck sense. In a "real users can submit real workloads to real hosts and get real results streamed back to their browsers in real time" sense. The coordinator handles the orchestration. The agents handle the execution. The reputation system tracks trust. The billing system tracks credits. The security model keeps everyone sandboxed. It all holds together.

I am proud of it because the architecture reflects real convictions, not hype. Elixir/BEAM for coordination because it is genuinely the best tool for the job, not because it is trendy. Rust for the agent because performance and safety matter at the edge, not because Rust is the fashionable choice. NATS because it is simple and reliable, not because it is the most marketed messaging system. Every technology choice was made for engineering reasons, and I can defend each one.

I am proud of it because the trust model is honest. We do not pretend that hosts are trustworthy. We do not pretend that workloads are safe. We sandbox everything, verify everything, and build reputation over time. The security model assumes adversarial conditions because distributed networks *are* adversarial conditions.

And I am proud of it because the bet, the one I made in 2018 standing in a dusty factory watching people run compute infrastructure from their homes, turned out to be right. Not in the way I originally imagined. Not for the use case I first predicted. But the fundamental insight, that there is an ocean of idle compute in the world and that a well-designed network can put it to work, that part was right. It just took eight years, a GPU revolution, and the humility to throw away the parts I got wrong.

## What comes next

The beta runs until June 13, 2026. After that, if the system proves itself:

- **Real payments**: Stripe integration is built and tested. When we flip the switch, hosts earn real money and users spend real money.
- **Model expansion**: More LLMs, more vision models, more specialized workloads based on what beta users actually want.
- **Geographic growth**: More hosts in more regions. The network gets better as it gets bigger.
- **Multi-region coordinators**: Right now, there is a single coordinator. The architecture supports multiple coordinators in different regions, communicating via BEAM distribution. This is planned for post-beta.
- **Stronger isolation**: Firecracker microVMs for workloads that need stronger sandboxing than Docker provides.
- **Browser-based hosting**: WebGPU-powered hosting directly from a browser tab. No agent installation. No Docker. Just open a page and contribute compute.
- **Android agent**: Currently we have iOS. Android is next.

## Try it

If any of this resonates, if you have idle GPU capacity and want to put it to work, if you need inference and want an alternative to hyperscaler pricing, or if you just want to poke at a distributed system and see what breaks, the beta is open.

- **Use AI**: Sign up at [app.archipelag.io](https://app.archipelag.io) and start chatting with models, generating images, or hitting the API.
- **Host compute**: Install the [node agent](https://github.com/archipelag-io/node-agent) and register your hardware.
- **Build on it**: The [JavaScript](https://github.com/archipelag-io/archipelag-js) and [Python](https://github.com/archipelag-io/archipelag-python) SDKs are available. The API is OpenAI-compatible.

All credits during the beta are virtual. Nothing financial is real. Break things. Tell us what is broken. That is the entire point.

---

*Archipelag.io is open beta from March 13 through June 13, 2026. Feedback goes to [GitHub issues](https://github.com/archipelag-io) or directly to the team. The hardware exists. The bandwidth exists. The people exist. Let us see if the network does too.*
