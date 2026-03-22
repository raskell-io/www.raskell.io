+++
title = "What Zentinel Is Really Optimizing For"
date = 2026-03-22
description = "Every major proxy was a product of its time. HAProxy for load balancing, Nginx for web serving, Envoy for service mesh. Zentinel is a product of this time: a post-agentic reverse proxy built for safety, operability, and the operator's ability to sleep."

[taxonomies]
tags = ["edge-systems", "applied-security", "oss", "reliability", "platform-automation"]
categories = ["patterns"]

[extra]
author = "Raffael"
+++

The clearest way I can describe the motivation behind Zentinel is this: I got tired of not trusting the thing that stood between my users and the internet.

Not because the proxies I ran were bad. They were not. I have genuine respect for the engineering in Nginx, HAProxy, Envoy. I learned a lot from operating them, and I mean that sincerely. But over years of running these systems in production, a pattern kept repeating, and it was always some version of the same story: the proxy did something I could not predict from reading its configuration.

A WAF module gets slow under load, and because it runs inside the proxy process, the entire data path backs up. A retry storm starts because the default retry policy is implicit rather than explicit. A configuration reload takes effect partially because there is no atomic swap. An unbounded queue grows until memory runs out and the OOM killer takes the proxy down along with everything else on the box.

None of these are exotic. If you have operated proxies at any real scale, you have seen most of them. And every time, the root cause pointed at the same structural issue: the proxy was optimized for something other than what I actually needed from it.

That is not a criticism. It is a statement about time.

## Every proxy was built for its era

HAProxy was born in 2000. Willy Tarreau built it to solve a specific, urgent problem: distributing TCP connections across a pool of backend servers. The internet was scaling fast. Sites needed load balancing. HAProxy did that one job with extraordinary precision, and twenty-five years later it still does. It is one of the most reliable pieces of infrastructure software ever written. But it was built as a load balancer, and when you need it to do security enforcement, you are extending a load balancer.

Nginx arrived in 2004. Igor Sysoev was solving the C10K problem: how do you handle 10,000 concurrent connections without the process-per-connection model falling over? Nginx was built as a web server. An event-driven architecture that served static files and handled connections with remarkable efficiency. The reverse proxy capability came later, almost as a side effect of how well it handled connections, and eventually became one of its most important use cases. But the core was always a web server. The assumptions about configuration, about reload behavior, about how modules interact with the request path, those assumptions come from web serving.

Varnish showed up in 2006. Poul-Henning Kamp built it because dynamic web pages were slow and caching was the answer. Varnish sat in front of your web server, cached responses in memory, and served them fast. That was the whole job. A caching proxy, and a beautiful one.

Envoy was born at Lyft around 2016. Microservices had created a new problem: how do you route, observe, and control traffic between hundreds of internal services that come and go? The service mesh was the answer, and Envoy was the data plane. It brought observability, retries, circuit breaking, and policy enforcement to a world where the network topology was no longer something you could draw on a whiteboard and expect to remain accurate for more than a week.

Traefik arrived in the same era, optimized for automatic service discovery in container environments. Services appear and disappear. The proxy figures out the routing on its own.

Every single one of these was the right tool at the right time. They solved the problem that mattered most when they were built, and they solved it well. I used most of them. I admired most of them. I am not here to argue that any of them were wrong.

But I am here to say that their time shaped what they became, and so did the economics of how software was built.

## The generality trap

Here is something I noticed over years of operating these tools: they all converge.

Nginx adds load balancing. HAProxy adds HTTP/2 and Lua scripting. Envoy adds caching, WAF capabilities, ext_proc for external processing. Traefik adds middleware chains. Every proxy, over time, becomes a Swiss army knife.

This is not a design failure. It is an economic inevitability.

Building a production-grade reverse proxy takes a team, sometimes a large one, working over many years. Nginx took Igor years before it was production-ready. Envoy is maintained by hundreds of contributors across multiple organizations. HAProxy has been continuously refined for a quarter of a century by one of the most skilled systems programmers alive.

When the cost of building software is that high, you need the result to serve a broad market. You cannot afford to optimize for one narrow concern. You need your proxy to be useful to web servers and API gateways and service meshes and CDN edges and everything in between. The economic pressure pushes relentlessly toward generality. Toward one more feature. Toward covering one more use case. Toward becoming the tool that everyone can use, even if nobody uses it for exactly the thing they wish it was designed for.

This creates a particular kind of friction. You adopt a proxy for its core strength, and then you spend years working around its assumptions in every other area. You chose Nginx because it handles connections well, but now you are fighting its reload model and its embedded Lua modules that share a fate with the worker process. You chose Envoy because it observes service traffic brilliantly, but now you are wrestling with an xDS configuration surface that could fill a textbook, and a C++ codebase where memory safety is a matter of programmer discipline rather than compiler guarantee.

I lived in that friction for a long time. I knew what I wanted. I could describe it in detail to anyone who would listen. But wanting a purpose-built proxy and building one are different things when building one requires a team and years of sustained effort.

## What I kept wishing for

After enough 3 AM incidents and enough post-mortems, the shape of what I was looking for became concrete enough to write down.

I wanted a reverse proxy where the operator can reason about what will happen under any condition. Including conditions they did not anticipate. That is the whole thesis. Everything else follows from it.

When you are on call, "reason about what will happen" is not philosophical. It means concrete things.

It means every queue has a maximum depth. Every timeout is explicit and declared. Every connection pool has a ceiling. No unbounded allocations anywhere. If you set a body size limit of 10 MB, that is a hard limit, not a suggestion. If a security agent's concurrency is capped at 100, the 101st request gets the configured failure mode, not a silent queue that grows until the box dies.

It means every route declares what happens when a security agent is unreachable. Not a global toggle. Per route, per agent. Your API fails closed when the WAF is down (deny everything, because your API handles sensitive data and you do not want it exposed without inspection). Your marketing site fails open (allow traffic, log the gap, because a few minutes of unfiltered marketing pages is better than a full outage). You decide. You write it down. The system enforces it.

```kdl
agents {
    agent "waf" {
        transport { unix-socket "/var/run/zentinel-waf.sock" }
        events "request-headers" "request-body"
        timeout-ms 50
        max-concurrent-calls 100
        failure-mode "closed"

        circuit-breaker {
            failure-threshold 5
            success-threshold 3
            timeout-seconds 30
        }
    }
}

routes {
    route "api" {
        priority 100
        matches { path-prefix "/api/" }
        upstream "backend"
        filters "waf"
        failure-mode "closed"
    }

    route "marketing" {
        priority 50
        matches { path-prefix "/" }
        upstream "static-backend"
        filters "waf"
        failure-mode "open"
    }
}
```

It means every security decision gets a trace ID and ends up in structured logs. When someone asks "why was this request blocked at 3:47 AM?", you can answer with a correlation ID and a full trace: which agent decided, which rule matched, how long it took. Not "the WAF blocked it, probably." The actual chain of events.

It means configuration reloads are atomic. You send SIGHUP, the new configuration is parsed, validated, and swapped in. In-flight requests finish on the old config. New requests pick up the new one. No window where half the routes are on the old version and half on the new.

I could describe all of this clearly. I had been able to for years. Describing what you want and having the means to build it are different things.

## The insight about isolation

The single biggest realization I had was about failure domains.

In every proxy I had operated, extension logic ran inside the proxy process. Nginx has embedded Lua via OpenResty. HAProxy has SPOE and Lua. Envoy has Wasm filters and ext_proc. They all share the same structural problem: the extension and the proxy share a fate.

If your Lua WAF script enters an infinite loop in nginx, the nginx worker is stuck. If your Wasm filter in Envoy allocates too much memory, the Envoy process pays for it. A slow SPOE agent in HAProxy backs pressure into the proxy's request handling. I have been on the receiving end of all three patterns, and they all end the same way: you are awake at 3 AM trying to figure out why your entire proxy fleet is degraded because one security module is having a bad day.

This is the classic shared-fate problem. When everything runs in one process, everything fails together. A slow WAF does not just slow down WAF-protected routes. It consumes worker resources that affect all routes. A memory leak in an auth filter does not just take down auth. It takes down the process.

The answer I kept coming back to was process isolation. Not as a compromise or a workaround, but as the foundational design principle. Security and policy logic should live in separate processes, each with its own memory, its own concurrency limits, and its own circuit breaker.

```
                 ┌─────────────────────┐
                 │   Proxy Core        │
                 │   (Rust / Pingora)  │
                 └──────────┬──────────┘
                            │
              ┌─────────────┼─────────────┐
              │             │             │
     ┌────────▼───────┐ ┌──▼──────────┐ ┌▼───────────────┐
     │  WAF Agent     │ │ Auth Agent  │ │ Custom Agent   │
     │  semaphore: 100│ │ semaphore:50│ │ semaphore: 25  │
     │  timeout: 50ms │ │ timeout:30ms│ │ timeout: 200ms │
     │  fail: closed  │ │ fail: closed│ │ fail: open     │
     └────────────────┘ └─────────────┘ └────────────────┘

     Each agent: own process, own memory, own circuit breaker.
     Slow WAF ≠ slow auth. Crashed agent ≠ crashed proxy.
```

If the WAF agent gets slow, the WAF agent's semaphore fills up. The auth agent keeps running on its own semaphore. The proxy core keeps routing. Nobody shares a failure domain unless you explicitly configure them to.

This is not just about crash isolation, though that matters. The deeper point is queue isolation. In a shared-process model, a slow filter creates backpressure that affects all traffic. With process isolation, a slow agent only affects the routes that use it, and only up to the concurrency limit you configured. The blast radius is bounded and declared. You can look at the config and know the worst case.

The agents communicate over Unix domain sockets or gRPC, and they can be written in any language. There are SDKs for Rust, Go, Python, TypeScript, Elixir, Kotlin, and Haskell. The protocol is simple: 4-byte length, 1-byte type, JSON or MessagePack payload.

The operational consequence is what I care about most: you can deploy, restart, and update agents independently. Roll out a new WAF rule set without touching the proxy. Restart a misbehaving auth agent without dropping a single connection. When you are trying to fix one thing at 3 AM without breaking three others, that independence matters more than any benchmark number.

## A product of this moment

Every piece of software is shaped by when it was built.

The proxies I described earlier were products of their time not just in what problems they solved, but in how they could be built. Nginx needed Igor working for years. Envoy needed Google, Lyft, and a large open source community. HAProxy needed Willy Tarreau's decades of sustained refinement. That was the only way to build infrastructure of that quality. One person, or even a small team, could not realistically build a production-grade reverse proxy with a novel architecture and ship it in months. The economics did not allow it.

That structural reality is changing, and I think the change matters more than most people in infrastructure have absorbed yet.

I wrote about the broader shift in [How I Work These Days](/articles/how-i-work-these-days/). The short version: I had been using Claude Code since May 2025, but it was not until Christmas 2025, working with Opus 4.5, that something fundamentally clicked. The constraint I had lived with for years, the gap between knowing exactly what I wanted and having the bandwidth to build it, narrowed in a way that I still find hard to fully describe. Not because the model wrote the code for me. But because the feedback loop between design intent and working implementation compressed from weeks to hours.

When Cloudflare open-sourced Pingora in 2024, I had paid attention immediately. A proxy framework written in Rust, battle-tested at over a trillion requests per day in Cloudflare's own network. The TCP listener, the HTTP parser, the TLS termination, the connection pooling, the async runtime. All the low-level machinery that you do not want to write from scratch. I had watched River, the community Pingora-based reverse proxy, hoping it would become the thing I could reach for and trust. It never got there.

So I stopped waiting and started building. Pingora as a foundation. Rust for memory safety at the boundary. An agentic workflow that let one person move at the pace of a small team.

What came out was not a general-purpose proxy. It was not a Swiss army knife. It was a purpose-built tool, tailored from the start to one specific problem: safe, observable, operatable edge traffic enforcement. No more, no less.

This is the part I think matters beyond Zentinel itself: when the cost of building serious software drops dramatically, you can afford to be specialized. You do not need to serve a broad market to justify the investment. You can build exactly the thing that solves exactly your problem, with exactly the tradeoffs you want. No feature creep driven by needing to justify a twenty-person team. No compromises driven by needing to appeal to every possible use case.

I think of it as bespoke infrastructure. Software that is tailored to a specific problem by someone who deeply understands that problem, made viable by tools that compress the gap between "I know exactly what this should be" and "it exists." The same way that a load balancer was the right thing to build in 2000, and a service mesh data plane was the right thing to build in 2016, a purpose-built safe reverse proxy is the right thing to build in 2026. Not because the world suddenly needs one more proxy, but because the world can finally have proxies that are designed for specific jobs instead of being general enough to justify their development cost.

Zentinel is a post-agentic reverse proxy. Not because it uses AI internally (it does not, unless you count the inference-aware rate limiting for LLM traffic). But because it could only exist in a world where agentic development made bespoke infrastructure viable. One person. Three months. A clear vision that had been accumulating for years. That is not a story that was possible to tell in 2020.

## Glass-box infrastructure

There is a conviction behind Zentinel that is not technical, and I want to be honest about it.

I believe critical web infrastructure should be open. Not "open core" with the important parts behind a license. Not "source available" with restrictions on how you run it. Open in the way that matters: you can read it, fork it, modify it, run it on your own hardware, never call anyone for permission.

Zentinel is Apache-2.0-licensed. Every agent is open source. The configuration format is documented. The protocol is specified. There is no hidden control plane, no phone-home telemetry, no vendor dependency.

But open source alone is not what I mean by transparent. Plenty of projects publish their source and remain effectively opaque. The code is there, technically, but understanding what a particular configuration will actually do still requires reading thousands of lines of parser logic, or just deploying it and hoping for the best.

This is where the Rust decision pays off in a way I did not fully anticipate when I started.

Because Zentinel is written in Rust, the core crates compile to WebAssembly. Not as a side project or a reimplementation. The same `zentinel-config` crate that parses and validates your KDL configuration in production compiles to a Wasm module that runs in a browser tab.

This means the [config playground](https://zentinelproxy.io/playground/) on the Zentinel website is not a JavaScript approximation of what the parser does. It is the parser. The actual Rust code, compiled to Wasm, running against your configuration in real time. When it says your config is valid, that is the same validation logic that will run when Zentinel starts up on your server. When it flags an error, that is the same error you would see in production.

The same applies to the [config converter](https://zentinelproxy.io/converter/). If you are migrating from nginx, HAProxy, or Traefik, the conversion tool runs the actual Zentinel config crate in your browser. You paste your existing config, you get KDL output, and you can validate the result on the spot. No round-trip to a server. No "upload your infrastructure config to our cloud service." It runs locally, in your browser, using the production code.

This matters more than it might sound. When you can run the same code that your proxy runs in production, right in your browser, you can reason about the proxy's internal behavior directly. You are not trusting documentation about how the parser interprets a particular KDL construct. You are running the parser. You are not guessing what happens when two routes have the same priority. You are watching the actual matching logic evaluate your routes.

The proxy becomes glass-like. Not transparent in the "we published the source, good luck reading it" sense. Transparent in the sense that you can interact with its internals, poke at its logic, verify its behavior before it ever touches production traffic. The same Rust, the same types, the same validation rules, running wherever you need them: on the server, in CI, in your browser.

That is what I mean by trustworthy infrastructure. Not "trust us, it works." Trust it because you can verify it yourself, using the same code, without asking anyone for permission.

## Where this leaves me

Every generation of proxies solved the problem of its era. HAProxy solved load balancing. Nginx solved web serving. Envoy solved service mesh routing. Varnish solved caching. Each was the right answer at the right time, and each was shaped by what was possible when it was built.

The problem I kept running into was different. Not throughput. Not feature count. Not service discovery. Just: can I understand what this system will do at 3 AM when something I did not plan for happens? Can I reason about its failure modes from reading its configuration? Can I trust it enough to sleep?

No existing proxy was designed from scratch for that question, because no existing proxy could afford to be that specialized. The economics of building infrastructure software pushed everything toward generality.

What changed is that the economics changed. One person, with the right foundation and the right tools, can now build purpose-built infrastructure that would have required a team and a multi-year roadmap before.

Zentinel is the proxy I needed and could not find, built in the specific window of time when building it became possible. It is a product of this moment, in the same way that every proxy before it was a product of its own.

And maybe that is what this era of software is really about. Not that AI writes code for you. That framing misses the point entirely. It is that the gap between knowing what should exist and making it exist got smaller, and the things people build when that gap closes are going to be very specific, very opinionated, and very good at exactly one thing.

## References and further reading

- [Zentinel](https://github.com/zentinelproxy/zentinel) - The source code, Apache-2.0-licensed
- [Zentinel documentation](https://docs.zentinelproxy.io/) - Architecture, configuration reference, agent protocol
- [Zentinel playground](https://zentinelproxy.io/playground/) - Browser-based config validation using the actual Rust crate compiled to Wasm
- [Zentinel config converter](https://zentinelproxy.io/converter/) - Migrate from nginx, HAProxy, or Traefik configs to KDL
- [Zentinel manifesto](https://zentinelproxy.io/manifesto/) - The design philosophy in full
- [Pingora](https://github.com/cloudflare/pingora) - Cloudflare's open source proxy framework that Zentinel builds on
- [How I Work These Days](/articles/how-i-work-these-days/) - The broader shift in how I build software, and where Zentinel fits in that story
- [HAProxy](http://www.haproxy.org/) - Willy Tarreau's load balancer, still one of the best pieces of infrastructure software ever written
- [Nginx](https://nginx.org/) - Igor Sysoev's web server that became the internet's default reverse proxy
- [Envoy](https://www.envoyproxy.io/) - The service mesh data plane that brought observability to distributed systems
- [Varnish](https://varnish-cache.org/) - Poul-Henning Kamp's caching proxy
