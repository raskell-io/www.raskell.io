+++
title = "How AI Makes Bare Metal Viable Again"
date = 2026-03-08
updated = 2026-03-08
description = "I migrated two production apps from Kubernetes to fly.io to a single Hetzner box. The missing piece was not the hardware. It was having an AI that could build bespoke deployment tooling in hours instead of months."

[taxonomies]
tags = ["platform-automation", "ai-for-ops", "rust", "elixir"]
categories = ["deep-dives"]
series = ["deep-dives"]

[extra]
author = "Raffael"
image = "how-ai-makes-bare-metal-viable-again.avif"
og_image = "how-ai-makes-bare-metal-viable-again.png"
+++

I was paying over two hundred dollars a month to run two apps that had zero paying users.

Not because the apps were complex. Not because they needed high availability across regions. Because I was running Kubernetes on DigitalOcean, and Kubernetes has opinions about how much infrastructure you need. A control plane. Worker nodes. Load balancers. Persistent volumes. Managed databases. Each line item modest on its own, adding up to a bill that felt absurd for two Phoenix applications in their bootstrapping phase.

The apps are [archipelag.io](https://archipelag.io) and [cyanea.bio](https://cyanea.bio). Both are Elixir/Phoenix projects. Archipelag uses PostgreSQL and NATS for its messaging layer. Cyanea uses SQLite. Neither gets meaningful traffic yet. Both are real products I am actively building, not side projects I will abandon next month. But they are pre-revenue, and every dollar I spend on infrastructure is a dollar I am betting against future income that does not exist yet.

Something had to change.

## The Kubernetes trap

Here is the thing about Kubernetes: it solves problems you might not have. If you are running fifty microservices across three regions with autoscaling requirements and a platform team to manage it, Kubernetes earns its keep. If you are running two BEAM applications that each consume less than 512 MB of memory, you are paying a complexity tax for infrastructure capabilities you will never touch.

My K8s setup on DigitalOcean looked like this: a managed cluster with two worker nodes (the minimum for any reasonable availability), a managed PostgreSQL instance for Archipelag, a load balancer for ingress, persistent volumes for Cyanea's SQLite database. Each component had its own monthly cost. The cluster management fee alone was more than what I would eventually pay for an entire bare metal server.

The operational overhead was worse than the cost. Helm charts. Ingress controllers. Certificate managers. Pod disruption budgets. Every time I wanted to deploy a new version, I was wrangling YAML files that described infrastructure concerns my apps did not care about. A Phoenix release does not need a pod spec. It needs a port, an environment, and someone to restart it if it crashes.

And the YAML, my God, the YAML. A simple Phoenix app that listens on a port and serves HTTP needs, at minimum, a Deployment manifest, a Service manifest, and an Ingress manifest. Add a ConfigMap for environment variables, a Secret for credentials, a PersistentVolumeClaim if you need disk, a HorizontalPodAutoscaler if you want autoscaling. For Cyanea alone, I had six Kubernetes manifests totaling a few hundred lines of YAML, all to describe an application that boils down to: run this binary, give it a port, point a domain at it.

The cognitive load compounds. You learn the Kubernetes resource model, then the DigitalOcean-specific annotations for their load balancer, then the cert-manager CRDs for TLS, then the quirks of persistent volumes on managed K8s (spoiler: they are not as persistent as you think if you do not get the reclaim policy right). Each layer has its own documentation, its own failure modes, its own upgrade cycle. I spent more time debugging infrastructure than building product.

The irony is not lost on me. Kubernetes was designed for teams running hundreds of services at Google-scale. I was running two apps. The orchestrator had more moving parts than the things it was orchestrating. It was like hiring a logistics fleet to deliver two packages across town.

I knew I was over-engineered. But the alternative, at the time, seemed like a step backward.

## The Nomad detour

I should mention that Kubernetes was never the only orchestrator I considered. For the past five years, while the industry went all-in on K8s, I had been quietly admiring HashiCorp's [Nomad](https://www.nomadproject.io/). Where Kubernetes is a sprawling ecosystem of CRDs, operators, and control loops, Nomad is refreshingly minimal. A single binary. A simple job spec. No opinions about networking, no built-in service mesh, no mandatory etcd cluster. You tell it what to run, it runs it.

That minimalism appealed to me. Nomad treats workload scheduling as the core problem and stays out of everything else. No built-in networking layer means you bring your own, which sounds like a drawback until you realize it means you are not locked into someone else's networking model.

And I happened to have my own networking layer already. I had been building [Zentinel](https://zentinelproxy.io/) in parallel, a security-first reverse proxy built on Cloudflare's [Pingora](https://github.com/cloudflare/pingora) framework in Rust. Zentinel handles TLS termination, WAF inspection, rate limiting, domain-based routing, all the edge concerns I care about. It also supports sleepable ops, where backend instances can be suspended and woken on demand, which is perfect for apps that do not need to be running 24/7.

So I tried pairing them. Nomad for workload scheduling, Zentinel for the network layer. And it worked. The combination gave me a lightweight orchestrator that did not try to own every concern, paired with a reverse proxy that handled edge traffic the way I wanted. Two focused tools, each doing one thing well.

But then IBM acquired HashiCorp, and the calculus changed.

The acquisition itself was not the problem. Companies get acquired. It happens. The problem was the trajectory. HashiCorp had already re-licensed Terraform from MPL to BSL (Business Source License) in 2023, a move that fractured the community and spawned the [OpenTofu](https://opentofu.org/) fork. The pattern was familiar: open-source project gains adoption, company monetizes through enterprise features, company gets acquired, new owner tightens the screws. I had watched it happen with Redis, with Elasticsearch, with MongoDB. Each time the community forks, there is a period of uncertainty, split maintenance effort, and feature divergence.

I did not want to build my infrastructure on a foundation where the governance could shift at any time. Nomad is still open source today. But "still open source" and "will remain open source" are different statements, and after the Terraform situation, I was not confident in the latter. The BSL license change had been a signal, and IBM's acquisition amplified it. I did not need to go down that road with another HashiCorp product.

The Nomad experiment did teach me something valuable, though. It confirmed that the KISS approach to deployment was right. You do not need the full Kubernetes machinery. A scheduler that starts processes, checks their health, and restarts them when they crash is sufficient for a wide range of workloads. And a dedicated reverse proxy that handles TLS and routing is cleaner than bundling networking into the orchestrator.

That insight, Nomad's minimalism plus Zentinel's Pingora-based proxy architecture, became the design seed for what I would eventually build.

## The fly.io middle ground

With Nomad off the table as a long-term bet, I migrated to [fly.io](https://fly.io) in late 2025. It was genuinely better than K8s for my use case. Fly understands BEAM applications at a fundamental level. The BEAM runtime is designed for the kind of lightweight, long-lived processes that Fly's infrastructure optimizes for. You push a release, it runs it. No YAML. No ingress controllers. No cluster management.

Fly also made the service dependencies painless. Managed Postgres with a few commands. NATS was straightforward to set up. Tigris (Fly's S3-compatible object storage) handled blob storage for Cyanea's file uploads. The developer experience was genuinely excellent, and I mean that without reservation. The Fly team has built something thoughtful.

The cost dropped meaningfully. No cluster management fee. No minimum node count. Pay-per-VM pricing that scales down to fractions of a shared CPU. Fly's model is honest about what small applications actually need, and the pricing reflects that. I went from over two hundred dollars a month on DigitalOcean K8s to roughly a quarter of that.

For a while, it was the right answer. And if I had been scaling horizontally, adding regions, needing the kind of elastic compute that cloud-native platforms excel at, I would have stayed. If my apps suddenly got traction and I needed instances in Tokyo, Frankfurt, and Virginia, Fly would be the obvious choice. The multi-region story is one of Fly's genuine strengths. You deploy once, it runs everywhere. That is hard to replicate.

But I was not scaling horizontally. I was running two apps in one location. On a good day, they handled maybe a few hundred requests. The compute they needed was trivial, a fraction of a shared CPU core. And I was still paying for a platform designed to scale to thousands of instances across dozens of regions, even though I needed exactly one instance of each app, in exactly one place, doing very little work.

There is also a subtler cost that managed platforms carry: the abstraction tax. When something goes wrong on Fly (and it did, occasionally, things like deployment timeouts or the odd networking hiccup), you are debugging at the platform level, not the system level. You file a support ticket or check the status page. You do not SSH in and look at processes, because there are no processes you can see. The platform is the intermediary, and the intermediary has its own failure modes that you cannot inspect or fix.

The cloud-native model, even the lean version that Fly offers, has a floor. You are always paying for the platform's capabilities, not just your usage of them. When your usage is "two small apps, one location, no scale," that floor matters. And when the platform sits between you and your processes, you lose the ability to debug at the level where the answers actually live.

## The bare metal math

I started looking at dedicated servers. Not VPS instances, not cloud VMs. Actual hardware you can SSH into, where your processes run on real cores and your data sits on real disks.

Hetzner runs a [server auction](https://www.hetzner.com/sb/) where they sell refurbished dedicated machines at steep discounts. These are servers that have been running in Hetzner's data centers, got rotated out of customer contracts, and are resold at prices that make cloud compute look like a luxury good. The hardware is used but maintained, and Hetzner's data centers are well-run, proper cooling, redundant power, good network connectivity.

I found a box with a multi-core Intel CPU, 128 GB of DDR4 RAM, and two 1 TB NVMe drives that I configured in RAID 1 for redundancy. EUR 38 a month. About forty-two dollars. Fixed price. No bandwidth metering (Hetzner includes 20 TB of traffic on dedicated servers, which for my workload might as well be unlimited). No surprises on the bill.

Let that sink in for a moment. For less than what I was paying for managed Postgres alone on either platform, I could have an entire server with more RAM than I know what to do with, fast NVMe storage with mirror redundancy, and enough compute headroom to run not two but twenty applications without breaking a sweat. The two NVMe drives alone, if bought retail, would cost more than a year of hosting.

I ran the numbers on capacity. My two Phoenix apps, even under load, would use maybe 1-2 GB of RAM combined. PostgreSQL with a modest dataset, another gig or two. NATS, negligible. That leaves well over 120 GB of RAM sitting idle. The CPU tells a similar story. Phoenix on the BEAM is remarkably efficient with CPU resources, the scheduler does its own preemptive multitasking across lightweight processes, and my workloads are I/O-bound, not compute-bound. I could run my entire current stack and barely register on a load graph.

The headroom is the point. On a cloud platform, headroom costs money. More RAM, higher tier. More CPU, higher tier. On bare metal, the headroom is already paid for. Growing from two apps to ten does not change my monthly bill. Adding a staging environment does not change my monthly bill. Running background workers, a metrics stack, a CI runner, none of it changes my monthly bill. The marginal cost of additional workloads on existing hardware is zero.

The math was obvious. The problem was everything else.

## Why bare metal was hard

Bare metal has always been cheap. That was never the issue. The issue was everything you had to build and maintain yourself.

On a managed platform, you get deployment pipelines, TLS certificate management, process supervision, reverse proxying, log aggregation, health checks, and rollback mechanisms out of the box. On bare metal, you get a Linux login prompt and a blinking cursor.

Historically, going bare metal for web applications meant weeks of setup:

- Install and configure nginx or HAProxy as a reverse proxy
- Set up Certbot or acme.sh for Let's Encrypt certificates, and hope the renewal cron does not silently break
- Write deployment scripts (rsync, symlinks, restart commands) and debug them for months
- Configure systemd services for each app, with the right restart policies and environment files
- Build a process supervision layer that handles crashes, port allocation, and graceful shutdowns
- Figure out zero-downtime deploys (which means running two instances, health checking the new one, swapping traffic, draining the old one)
- Set up log rotation, monitoring, backups
- Harden the server (firewall, SSH config, automatic security updates)

Each of these is a solved problem in isolation. There are blog posts and Stack Overflow answers for every one of them. But stitching them together into a coherent, reliable deployment system is a full-time job for a week or two, and maintaining it is an ongoing tax on your attention.

This is why the cloud won. Not because bare metal is expensive. Because the operational cost of doing it yourself was prohibitive for small teams. The cloud sold you a package deal: we handle the infrastructure, you handle the application. Worth it, even at a premium.

But what if that operational cost dropped to near zero?

## The AI shift

I had Claude Code with Opus 4.6 available. I had spent months working with it on other projects. Compilers, CRDT engines, reverse proxies. I knew what it could do with a clear spec and a well-defined problem domain.

And deploying web applications to bare metal is a well-defined problem domain.

The core requirements are straightforward: upload an artifact, start it on a port, check that it is healthy, route traffic to it, stop the old one. Everything else, TLS, process supervision, rollback, log capture, is layered on top of that core loop. The problem space is wide but shallow. Lots of features, few genuinely novel algorithms.

This is exactly the kind of work where AI shines. Not because it writes perfect code on the first try. But because it can iterate through a feature list at a pace that would take a solo developer weeks, producing working implementations in hours. The feedback loop is tight: describe what you want, get code, test it, refine. The domain knowledge exists in a thousand deployment tools that came before. The AI has seen all of them.

So I decided to build my own deployment tool. From scratch. With AI as my co-engineer.

## Building Vela

[Vela](https://github.com/raskell-io/vela) is what came out of that process. A single Rust binary that handles everything I listed above: reverse proxy, auto-TLS, process supervision, zero-downtime deploys, health checks, secret management, log streaming, rollbacks. No containers. No Docker. No YAML.

The design draws from both of its ancestors. From Nomad, the suckless philosophy: a single binary, minimal configuration, no opinions about things that are not its problem. From Zentinel, the Pingora-inspired proxy architecture: hyper-based reverse proxy with TLS termination, domain-based routing, and WebSocket support baked into the same process. Vela is what happens when you take the best ideas from tools you admire and combine them into something purpose-built for your exact workload.

The design philosophy is blunt: one binary, two modes.

```
┌─────────────────────────────────────────────┐
│  Your server                                │
│                                             │
│  Vela daemon                                │
│  ├── Reverse proxy (:80/:443, auto-TLS)     │
│  ├── Process manager (start, health, swap)  │
│  └── IPC socket                             │
│                                             │
│  Apps                                       │
│  ├── cyanea.bio      → :10001              │
│  └── archipelag.io   → :10002              │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│  Your laptop                                │
│                                             │
│  vela deploy  →  scp + ssh  →  server       │
└─────────────────────────────────────────────┘
```

`vela serve` runs on the server. It is the reverse proxy, the process manager, and the IPC daemon, all in one process. `vela deploy` runs on your laptop. It reads a manifest, uploads your artifact over SSH, and tells the server to activate it.

SSH is the control plane. No tokens, no API keys, no custom authentication layer. If you can SSH into the server, you can deploy. This is a deliberate choice. SSH key management is a solved problem. Every developer already has it configured. Every server already has it running. Building a custom auth system on top would be adding complexity for no practical gain.

### The manifest

Each app gets a `Vela.toml` in its project root:

```toml
[app]
name = "cyanea"
domain = "app.cyanea.bio"

[deploy]
server = "deploy@my-server"
type = "beam"
binary = "server"
health = "/health"
strategy = "sequential"
pre_start = "bin/cyanea eval 'Cyanea.Release.migrate()'"

[env]
DATABASE_PATH = "${data_dir}/cyanea.db"
SECRET_KEY_BASE = "${secret:SECRET_KEY_BASE}"
```

That is the entire deploy configuration. The app type tells Vela how to start it (`beam` runs Elixir releases, `binary` runs compiled executables). The health path tells it where to check. The strategy tells it how to swap traffic. The `pre_start` hook runs database migrations before the new instance starts, and if migrations fail, the deploy aborts and the old instance keeps running.

Environment variables support two substitution patterns: `${data_dir}` expands to the app's persistent data directory (which survives deploys), and `${secret:KEY}` pulls from the server-side secret store. Secrets never live in your repo.

Deploying looks like this:

```bash
MIX_ENV=prod mix release
vela deploy ./_build/prod/rel/cyanea
```

Two commands. The artifact goes up, the health check passes, traffic swaps, done.

### Zero-downtime deploys

Vela supports two deploy strategies, and the choice matters.

**Blue-green** is the default. The new instance starts alongside the old one on a fresh port. Vela runs a health check against it (30 retries, one per second, five-second timeout per attempt). Once the health check passes, the reverse proxy atomically swaps the route table entry for that domain to point at the new port. The old instance gets a configurable drain period to finish in-flight requests, then receives SIGTERM. If it does not exit within the drain window, SIGKILL.

```
Time ──────────────────────────────────────────►

Old instance     ████████████████████░░░░  (draining)
New instance              ░░░░████████████████████
                          ▲   ▲
                     start │   │ health passes, swap
```

Zero downtime. The user never sees a blip. This works for stateless apps and apps backed by PostgreSQL (where both instances can connect to the same database simultaneously).

**Sequential** is for SQLite apps. You cannot have two processes writing to the same SQLite database (WAL mode helps, but concurrent writers from separate instances is asking for trouble). So Vela stops the old instance first, starts the new one, health checks it, and activates it. Sub-second blip. Acceptable for apps where the alternative is write contention.

```
Time ──────────────────────────────────────────►

Old instance     ████████████████████
New instance                          ░░░░████████████████████
                                 ▲   ▲
                            stop │   │ start + health check
```

The decision is per-app, configured in the manifest. Cyanea uses sequential (SQLite). Archipelag uses blue-green (PostgreSQL).

### Process supervision

Vela does not just start your app and walk away. It supervises it. If a process crashes, Vela detects the exit (via non-blocking `try_wait` on the child process handle), logs it, and restarts from the stored launch configuration:

```rust
pub async fn check_and_restart(&mut self) -> Vec<String> {
    let mut to_restart = Vec::new();

    for (key, process) in &mut self.running {
        match process.child.try_wait() {
            Ok(Some(status)) if !status.success() => {
                // Process exited unexpectedly
                to_restart.push((
                    key.clone(),
                    process.launch_config.clone(),
                ));
            }
            _ => {}
        }
    }

    for (key, config) in to_restart {
        // Restart on same port if available, allocate new otherwise
        self.restart_from_config(&key, &config).await;
    }
}
```

Each app's `LaunchConfig` (release directory, binary name, app type, environment variables, data directory) is stored so that restarts use the exact same configuration. The daemon also persists app state to disk, so if Vela itself restarts (server reboot, daemon upgrade), it restores all running apps from their saved configurations.

This is the kind of feature that would take a day to specify and a week to implement if you were writing it from scratch. With Claude, it took about an hour of iteration, including the edge cases around port reallocation and the pending/active state split during deploys.

### Built-in services

Both of my apps have service dependencies. Archipelag needs PostgreSQL and NATS. Rather than managing these separately, Vela handles service provisioning directly:

```toml
[services.postgres]
version = "17"
databases = ["archipelag_prod"]

[services.nats]
version = "2.10"
jetstream = true
```

On first deploy, Vela installs PostgreSQL (via apt), creates the database with a generated password, and injects `DATABASE_URL` into the app's environment. For NATS, it downloads the binary, generates a config, and starts it as a supervised child process with `NATS_URL` injected. Service credentials persist across deploys and daemon restarts.

This was one of those features where the AI really earned its keep. The NATS lifecycle management alone, downloading the right binary for the platform, generating config, supervising the process, health-checking the monitoring endpoint, persisting credentials, involved touching six or seven modules. Claude handled the plumbing while I focused on the design decisions.

### The reverse proxy

Vela embeds its own reverse proxy built on hyper. It handles TLS termination (auto-provisioned via Let's Encrypt ACME HTTP-01, or static certificates for Cloudflare setups), domain-based routing, WebSocket upgrades, and HTTP-to-HTTPS redirects.

The routing model is simple. A thread-safe hash map from domain to port:

```rust
pub struct RouteTable {
    routes: Arc<RwLock<HashMap<String, u16>>>,
}
```

When a request arrives, Vela extracts the Host header, looks up the port, and forwards the request to `localhost:{port}`. When a deploy swaps traffic, it is a single write-lock on the hash map to update the port number. Atomic. No configuration reload. No proxy restart.

For WebSocket connections (which both Phoenix apps use for LiveView), Vela detects the `Upgrade: websocket` header and switches to raw TCP tunneling with bidirectional I/O. This was important for my use case, Phoenix LiveView is WebSocket-native, and if the proxy does not handle upgrades correctly, the entire UI breaks.

## From empty box to production in a day

Here is the timeline of the actual migration. I bought the Hetzner server and within about 48 hours, both apps were running in production with HTTPS, process supervision, automated backups, and daily health reports.

The sequence went roughly like this:

1. **Hardware validation**: Check NVMe drive health, run memory tests, verify RAID configuration. The drives had about 25,000 power-on hours (these are auction servers, they have been used), but SMART health passed and wear levels were well within acceptable range.

2. **OS provisioning**: Debian, RAID 1 across both NVMe drives. Straightforward.

3. **Server hardening**: Firewall rules, SSH hardening (key-only auth, non-default port, rate limiting), automatic security updates, intrusion detection. This is the part I am deliberately vague about. If you are running a public-facing server, hardening is non-negotiable, but I am not going to publish my exact firewall configuration.

4. **Vela installation**: Download the binary, create a config file, install the systemd service. Five minutes.

5. **First app deployed (Cyanea)**: Built the Elixir release on the server, set secrets, ran migrations, deployed. The entire build-and-deploy cycle for a Phoenix app with a Rust NIF took about fifteen minutes, most of which was compilation.

6. **Second app deployed (Archipelag)**: Same flow, plus provisioning PostgreSQL and restoring a database dump from Fly, plus setting up NATS. About thirty minutes.

7. **TLS certificates**: Updated DNS records, Let's Encrypt certificates issued automatically. Vela handles the ACME challenge internally, no Certbot, no cron job, no manual cert management.

8. **Monitoring**: A daily health report script that checks system metrics, service status, and app health, then emails a summary. Simple but effective.

The most time-consuming part was not the tooling. It was migrating the PostgreSQL data from Fly and verifying that both apps behaved correctly in their new environment. The infrastructure setup itself, the part that would have taken weeks without Vela, took hours.

## The broader thesis

Here is what I think is happening, and I think it is bigger than my personal infrastructure bill.

The cloud won because it sold a bundle: compute, networking, storage, deployment, monitoring, scaling, security, all integrated, all managed. The alternative was building each piece yourself, and the labor cost made that prohibitive for small teams. Managed infrastructure was cheaper than an ops engineer.

AI changes that equation. Not by making the cloud cheaper, but by making bespoke tooling economically viable.

Consider what I got with Vela. A deployment tool that does exactly what I need and nothing more. No container orchestration, because I do not use containers. No multi-region routing, because I run in one location. No autoscaling, because two apps do not need to autoscale. Every feature exists because I needed it. Every feature works with my specific stack (Elixir/BEAM, Rust, SQLite, PostgreSQL, NATS). The tool is tailored to my workload the way a bespoke suit is tailored to a body.

This kind of custom tooling used to be a luxury. You needed either a platform team that could invest weeks of engineering time, or the rare individual who was both a skilled systems programmer and willing to spend their evenings writing deployment tools instead of building products. The economics did not make sense for a solo founder or a two-person team.

With AI, the cost of building bespoke tooling drops by an order of magnitude. Not to zero, you still need to know what you want, you still need to test and iterate, you still need to understand the domain well enough to evaluate the output. But the gap between "I know what I need" and "I have a working implementation" shrinks from weeks to hours.

And when bespoke tooling is cheap, the cloud's bundle becomes less compelling. You do not need the managed Kubernetes service if you can build a deployment tool that fits your exact needs. You do not need the managed database service if you can install PostgreSQL yourself and the AI helps you set up backups, monitoring, and failover. You do not need the managed TLS service if your deployment tool handles ACME natively.

What you are left paying for is compute and bandwidth. And for compute and bandwidth, bare metal is drastically cheaper than the cloud.

## The API is bespoke

There is a subtlety here that I think is worth calling out. When people talk about the cloud's advantages, they often point to the API-driven experience. Infrastructure as code. Declarative configuration. Programmable everything. And that is real. The cloud's API layer is genuinely valuable.

But the API does not have to come from a cloud provider. It can come from your own tooling.

Vela gives me an API-driven experience. I declare my app's configuration in a TOML manifest. I run a single command to deploy. I can check status, stream logs, manage secrets, trigger backups, and roll back releases, all from my laptop, all through a CLI that speaks SSH to a daemon on the server. The experience is not worse than Fly or Heroku. In some ways it is better, because the tool does exactly what I need and nothing else, and when something goes wrong, I can read the source code.

The difference is that my "API" is a 5,000-line Rust binary instead of a multi-billion-dollar cloud platform. And that is fine. I do not need the platform. I need the interface. AI lets me build the interface.

This is, I think, the pattern that will play out more broadly. The cloud's value was never just compute. It was the operational layer on top of compute, the tooling that made raw hardware usable. AI makes it possible to build that operational layer yourself, tailored to your needs, at a fraction of the cost. The cloud becomes optional. The server becomes a commodity. The differentiator is the tooling, and the tooling is something AI can help you build.

## What the numbers look like

Let me be concrete about costs, because this is ultimately an economic argument.

**Kubernetes on DigitalOcean** (my original setup):
- Managed K8s cluster: ~$12/month (control plane fee)
- Worker nodes (2x smallest): ~$24/month
- Managed PostgreSQL: ~$15/month
- Load balancer: ~$12/month
- Persistent volumes, bandwidth, extras: ~$15/month
- **Total: ~$78-80/month** (and this was after I trimmed it)

**Fly.io** (the middle ground):
- Two Phoenix apps (shared-cpu-1x, 256MB each): ~$14/month
- Managed Postgres: ~$25/month
- Managed NATS: ~$20/month
- Bandwidth, extras: ~$10/month
- **Total: ~$70/month**

The managed services were the killer. Fly's compute pricing is fair, but managed Postgres and managed NATS added up fast. And that was at near-zero traffic. Egress pricing on Fly is metered, so if either app had started getting real user load, the bandwidth bill alone would have pushed the total well past a hundred dollars a month.

**Hetzner bare metal** (current):
- Dedicated server (auction): EUR 38/month (~$42)
- That is it. PostgreSQL, NATS, TLS, everything runs on the box.
- **Total: ~$42/month**

The Hetzner box is cheaper than Fly right now, and the gap only widens as usage grows. But the raw dollar comparison understates the difference. Look at what I am getting. 128 GB of RAM versus 512 MB. Multi-core CPU versus shared fractional cores. Two terabytes of NVMe storage versus a few gigs. Bandwidth that is essentially unlimited (Hetzner includes 20 TB of traffic) versus metered egress that scales with every user you add.

The capacity gap is the real story. On Fly, scaling from two apps to ten means linearly increasing costs, more VMs, more managed database instances, more bandwidth charges. On my Hetzner box, scaling from two apps to ten means... nothing. The resources are already there. I paid for them. PostgreSQL, NATS, any other service I want to run, it all fits on the same box with room to spare.

And there is no surprise bill. No bandwidth overage. No "your database exceeded the row limit" fee. No managed service add-on creep. Thirty-eight euros a month, every month, regardless of what I run on it.

## When this does not apply

I would be dishonest if I pretended bare metal is the right answer for everyone. It is not.

**If you need multi-region presence**, the cloud still wins. Running your own hardware in three continents is a different kind of problem. Edge computing, CDN-native architectures (which I [wrote about previously](https://raskell.io/articles/edge-systems-are-the-new-backend/)), and platforms like Fly or Cloudflare Workers are the right tools for workloads that need to be close to users worldwide.

**If you need elastic scaling**, bare metal does not flex. A server has fixed resources. If your traffic spikes 10x for an hour, you cannot add capacity on demand. You can over-provision (and at these prices, generous over-provisioning is affordable), but it is not the same as true elasticity.

**If you do not understand the operational basics**, bare metal will bite you. Server hardening, backup strategies, disk monitoring, security patching, these are your responsibility. The cloud abstracts them away. On bare metal, a missed security update is your problem. A full disk is your problem. A failed drive (RAID helps, but is not magic) is your problem.

**If your team is large and needs guardrails**, managed platforms provide consistency and governance that bare metal does not. Kubernetes is complex, but it is complex in a standardized way. Everyone knows how to deploy to K8s. Everyone knows how to debug a pod. Your custom Vela setup is legible to exactly the people who built it.

The sweet spot for bare metal, especially AI-assisted bare metal, is small teams building products that need reliability but not scale, performance but not elasticity, control but not standardization. Solo founders. Two-person startups. Side projects that might become real businesses.

## What I learned

The migration took about 48 hours from "I have an empty server" to "both apps are in production with HTTPS, monitoring, and automated backups." Most of that time was data migration and validation, not infrastructure setup.

Vela is now at version 0.5.0 with a feature list I am genuinely proud of: blue-green and sequential deploys, process supervision with auto-restart, built-in reverse proxy with auto-TLS, service dependency management (Postgres and NATS), secret management, log streaming, rollbacks, remote builds, scheduled backups, deploy hooks, and machine-readable status output for monitoring integration.

I built most of it in a few focused sessions with Claude Code. Not because the code is trivial, it is about 4,000 lines of Rust with async IPC, Unix socket communication, ACME certificate management, process lifecycle handling, and a reverse proxy with WebSocket support. But because the problem domain is well-understood, the requirements were clear, and AI is remarkably good at turning clear requirements into working implementations.

The thing I keep coming back to: the cloud was never selling compute. It was selling convenience. And convenience used to require a company with thousands of engineers to build platforms that abstracted away the hard parts. Now, a developer with a clear idea of what they need and an AI that can write systems code can build a fit-for-purpose operational layer in a weekend.

That does not make the cloud irrelevant. It makes the cloud optional for a much larger class of workloads than it was before.

Buy a server. Build your tools. Ship your product. The infrastructure should be boring. With AI, it finally can be.

## References and further reading

### Tools and platforms
- [Vela](https://github.com/raskell-io/vela) - The bare-metal deployment tool built in this article
- [Hetzner Server Auction](https://www.hetzner.com/sb/) - Refurbished dedicated servers at steep discounts
- [fly.io](https://fly.io) - The managed platform I migrated from
- [Nomad](https://www.nomadproject.io/) - HashiCorp's minimal workload orchestrator
- [OpenTofu](https://opentofu.org/) - Community fork of Terraform after the BSL relicense
- [Pingora](https://github.com/cloudflare/pingora) - Cloudflare's Rust framework for building programmable proxies
- [hyper](https://hyper.rs/) - Rust HTTP library powering Vela's reverse proxy
- [Let's Encrypt](https://letsencrypt.org/) - Free TLS certificates, automated via ACME in Vela
- [NATS](https://nats.io/) - Lightweight messaging system used by Archipelag

### Frameworks and runtimes
- [Phoenix Framework](https://www.phoenixframework.org/) - Elixir web framework powering both apps
- [Erlang/OTP](https://www.erlang.org/) - The BEAM virtual machine that runs Phoenix and Elixir
- [Rust](https://www.rust-lang.org/) - Systems language Vela and Zentinel are written in

### Projects referenced
- [Zentinel](https://zentinelproxy.io) - Security-first reverse proxy built on Pingora
- [Archipelag](https://archipelag.io) - Distributed compute platform
- [Cyanea](https://cyanea.bio) - Bioinformatics platform
- [Claude Code](https://github.com/anthropics/claude-code) - AI coding tool used to build Vela
