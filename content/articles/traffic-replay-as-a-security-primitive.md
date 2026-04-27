+++
title = "Traffic Replay as a Security Primitive"
date = 2026-04-27
description = "WAF tuning is a guessing game because you cannot reproduce the traffic that triggered the rule. Deterministic replay changes that."

[taxonomies]
tags = ["applied-security", "edge-systems", "reliability"]
categories = ["patterns"]

[extra]
author = "Raffael"
image = "traffic-replay-as-a-security-primitive.avif"
og_image = "traffic-replay-as-a-security-primitive.png"
+++

If you have ever tuned a WAF rule, you know the cycle. A rule triggers on legitimate traffic. You get paged. You look at the logs, which tell you the rule ID and the request path but not enough to reproduce what happened. You loosen the rule based on your best guess. You deploy. You wait. Next week, you get paged again, either because the rule is still too aggressive or because you loosened it too far and now something is getting through.

The problem is not the WAF. The problem is that you are tuning a stateful, context-dependent system without the ability to reproduce the inputs that caused the behavior you are trying to change. You are debugging blind.

This is not unique to WAFs. Every edge system that makes decisions about traffic, proxies, rate limiters, auth gateways, bot detectors, suffers from the same structural issue: the traffic that triggered the behavior is gone. It existed for the duration of the request, it was logged incompletely, and now you are making changes based on a partial reconstruction of what happened.

Traffic replay solves this. Not as a testing tool. As a security primitive.

## What replay actually means

Traffic replay, in the sense I mean it here, is not load testing. It is not generating synthetic traffic that looks like production. It is capturing real requests as they happened, in order, with their headers and bodies intact, and re-executing them against a target environment deterministically.

The distinction matters. Load testing answers "can this system handle the volume?" Replay answers "will this system make the same decisions about the same traffic?" One is about throughput. The other is about behavior.

A replayed request hits the same WAF rules, the same rate limits, the same routing logic as the original. If the original was blocked, you can see whether the replay is also blocked, and if not, exactly what changed. If you modify a rule and replay the same traffic, you get a direct comparison: old behavior versus new behavior, same inputs, different configuration.

This is the primitive that WAF tuning has always been missing. Not better logs. Not more dashboards. The ability to say "here is the exact traffic that caused the problem, and here is what happens when I change the rule."

## The capture problem

The first obstacle is getting the traffic into a replayable format. Production traffic is ephemeral. It arrives, gets processed, and disappears. Logs capture metadata: timestamps, status codes, paths, maybe some headers. They do not capture the full request as a replayable artifact.

There are two practical approaches.

The first is capturing at the browser. Every modern browser can export a session as a HAR (HTTP Archive) file. This gives you the complete request and response for every HTTP transaction in a session: method, URL, headers, body, timing. When a user reports "this request was blocked," you can ask them for a HAR export. You now have the exact traffic, not a description of it.

The second is capturing at the proxy. If your reverse proxy or load balancer can mirror traffic to a capture endpoint, you get production-representative traffic without depending on user cooperation. This is more complex to set up but gives you continuous coverage rather than incident-by-incident captures.

Either way, the result is the same: a sequence of HTTP requests that can be replayed faithfully.

## Replay is not as simple as resending

There are subtleties that make naive replay useless.

The obvious one is URLs. If you captured traffic hitting `production.example.com` and want to replay it against `staging.example.com`, you need to rewrite the host. But you also need to rewrite any absolute URLs in headers like `Origin` and `Referer`, and potentially in request bodies for APIs that include callback URLs.

Then there are cookies. A replayed request with production session cookies will either fail authentication on staging (different session store) or, worse, succeed against a production session you did not intend to touch. Cookie stripping is not optional. It is a safety requirement.

Headers need mutation too. You might need to inject an authorization token for the staging environment, or add a header that tells the WAF "this is a replay, do not count it toward rate limits." You might need to strip headers that identify the original client IP to avoid polluting analytics.

And ordering matters. If request B depends on state created by request A (a login followed by an authenticated action), replaying them in parallel or out of order produces meaningless results. Deterministic replay means sequential, in capture order, by default.

None of this is algorithmically hard. But getting it wrong in any of these dimensions produces results that are misleading rather than useful. A replay tool that does not handle URL rewriting, cookie stripping, header mutation, and ordering is a footgun, not a primitive.

## The diff is the point

Replay alone is useful. Replay with behavioral diffing is what changes the WAF tuning workflow.

The pattern works like this. You have a set of captured traffic. You replay it against environment A (say, production with the current WAF rules) and save the results. You replay the same traffic against environment B (staging with the proposed rule change) and save those results. Then you diff.

The diff is not a text diff. It is a behavioral diff. For each request in the capture, you compare:

- **Status codes**: did the same request get a 200 in one environment and a 403 in the other?
- **WAF decisions**: did the WAF block in one and allow in the other? Which rule ID? What score?
- **Security headers**: did CSP, HSTS, or X-Frame-Options change between environments?
- **Response characteristics**: same content type? Same cache behavior?

```
Request: GET /api/v2/users?search=<script>alert(1)</script>

Production (current rules):
  Status: 403
  x-waf-action: block
  x-waf-rule: 941100

Staging (proposed rules):
  Status: 200
  x-waf-action: pass
  x-waf-rule: (none)

⚠ WAF regression: XSS payload now passes
```

This changes the WAF tuning conversation entirely. Instead of "I think loosening rule 941100 is safe," you have "I replayed 2,000 captured requests against the proposed rule change. Three requests that were previously blocked are now allowed. Here they are. Two are false positives that should pass. One is an XSS payload that should not."

That is not a guess. That is evidence.

## Why this is a security primitive

I use the word "primitive" deliberately. A primitive is a building block that other things compose on top of. Deterministic replay with behavioral diffing is a primitive because it enables patterns that are otherwise impractical:

**Safe WAF rule iteration.** Change a rule, replay traffic, inspect the behavioral diff, deploy with confidence. The feedback loop goes from "deploy and hope" to "verify, then deploy." This is the most immediate use case, and the one that solves the 3 AM pager problem.

**Environment drift detection.** Replay the same traffic against staging and production on a regular schedule. When the behaviors diverge, you know something changed that should not have. This catches configuration drift, certificate mismatches, and routing differences before they become incidents.

**Regression testing for edge config.** Every change to your proxy, WAF, or rate limiter configuration gets a replay run before deployment. The diff tells you exactly what changed in observable behavior. This is the edge infrastructure equivalent of a unit test suite, except instead of testing code you are testing policy.

**Incident reproduction.** When a user reports a block, capture the traffic, replay it, confirm the block, and then iterate on the fix in staging without affecting production. The time from "user report" to "verified fix" drops from hours to minutes.

**Compliance evidence.** When an auditor asks "how do you know your WAF rules are working?", you can show them replay runs with behavioral diffs that demonstrate which rules triggered on which traffic patterns. Not "we have a WAF configured." Verifiable behavioral evidence.

Each of these patterns exists in some ad-hoc form at organizations that invest heavily in security tooling. What they lack is a common primitive that makes them systematic.

## What exists today

There is no shortage of tools that touch parts of this problem. The gap is in how they compose.

**Manual security testing platforms.** [Burp Suite](https://portswigger.net/burp) is the standard. Its Repeater lets you capture a request and resend it with modifications, which is replay in the most literal sense. [OWASP ZAP](https://www.zaproxy.org/) provides similar capabilities as open source. Both are excellent for manual pen-testing: an engineer investigates a specific request, tweaks parameters, observes the response. What they do not do is automated, batch-level behavioral comparison across environments. You can replay one request in Burp and inspect the result. You cannot replay two thousand requests against staging and production and get a structured diff of every WAF decision that changed. The workflow is manual and investigative, not systematic and CI-integrated.

**Traffic capture and replay tools.** [GoReplay](https://goreplay.org/) (gor) captures live HTTP traffic and replays it against another environment. It is the closest existing tool to what I am describing, and it is good at what it does: mirroring production traffic to a staging environment for load and correctness testing. [mitmproxy](https://mitmproxy.org/) can intercept, record, and replay HTTP flows with full scriptability. [tcpreplay](https://tcpreplay.appneta.com/) operates at the TCP level for network-layer replay. The limitation across all of these is that they are replay tools, not behavioral analysis tools. They send the traffic. What happens next, comparing WAF decisions, diffing security headers, detecting regressions, is left to you.

**Desktop proxies.** [Charles Proxy](https://www.charlesproxy.com/) and [Fiddler](https://www.telerik.com/fiddler) capture and replay HTTP traffic with rich GUIs. They are useful for development debugging but are desktop applications, not CLI tools. They do not integrate into CI/CD pipelines or produce machine-readable behavioral diffs.

**Load testing tools.** [k6](https://k6.io/), [Locust](https://locust.io/), [Gatling](https://gatling.io/). These can replay captured traffic at volume, but they measure performance, not policy behavior. They answer "can the system handle the load?" not "did the WAF make the same decision?"

**WAF testing frameworks.** [ftw](https://github.com/coreruleset/ftw) (Framework for Testing WAFs) is the OWASP project for validating Core Rule Set behavior. It uses synthetic payloads designed to trigger specific rules. [Nuclei](https://github.com/projectdiscovery/nuclei) is a template-based vulnerability scanner that sends crafted requests and checks responses. Both are valuable for validating that your WAF blocks known-bad patterns. Neither replays real captured traffic, which means neither can tell you whether a rule change affects the legitimate traffic that your actual users send.

**API testing tools.** [Hurl](https://hurl.dev/) can chain HTTP requests with assertions, which is close to sequential replay with verification. [curl](https://curl.se/) can resend individual requests. Both are useful building blocks but do not provide the capture-replay-diff workflow as a single primitive.

The pattern across all of these is the same. Each tool handles one or two steps well: capture, or replay, or analysis. No single tool captures real traffic, replays it deterministically with URL rewriting and cookie stripping, and then produces a structured behavioral diff across WAF decisions, security headers, and status codes. The pieces exist. The composition does not.

This is the gap that [Ushio](https://github.com/raskell-io/ushio) fills.

Ushio is a Rust CLI that does three things. It converts HAR files into a replayable capture format. It replays captures against one or more targets with URL rewriting, header mutation, and cookie stripping. And it diffs two replay results to identify behavioral changes in status codes, WAF decisions, and security headers.

```bash
# Convert a browser HAR export to ushio format
ushio convert session.har -o capture.json

# Replay against staging with auth header, strip cookies
ushio replay capture.json \
  -t https://staging.example.com \
  --header "Authorization:Bearer $TOKEN" \
  --strip-cookies \
  -o staging.json

# Replay against production
ushio replay capture.json \
  -t https://prod.example.com \
  --strip-cookies \
  -o prod.json

# Diff the results
ushio diff staging.json prod.json --only-diff
```

The output is either pretty-printed for human review or JSON for pipeline integration. Exit code 0 means no behavioral differences. Exit code 1 means differences were found. This makes it composable with CI/CD: run a replay diff on every edge config change, fail the pipeline if behavior regresses.

## What changes when you have this

The shift is from reactive to proactive. Without replay, you discover WAF problems when users report them or when the pager goes off. With replay, you discover them before deployment. The feedback loop compresses from incident-driven to change-driven.

But the deeper shift is epistemic. Without replay, WAF tuning is a matter of judgment and experience. You read the rule, you read the logs, you make a call. With replay, it is a matter of evidence. You replay the traffic, you observe the behavior, you make a decision based on what actually happened.

I do not think this replaces judgment. You still need to decide whether a particular request that is now being allowed is acceptable. But the decision is grounded in concrete behavior rather than reconstruction from incomplete logs. The security engineer's job changes from "guess what the WAF will do" to "observe what the WAF does and decide if that is correct."

Every edge system that makes decisions about traffic should be testable with real traffic. WAFs, rate limiters, bot detectors, auth gateways. If you cannot replay traffic and diff the behavior, you cannot systematically verify that the system does what you think it does. That is not a tooling problem. That is a visibility problem. And it is solvable.

## References

- [Ushio](https://github.com/raskell-io/ushio) - Deterministic edge traffic replay tool
- [Zentinel](https://github.com/zentinelproxy/zentinel) - Security-first reverse proxy with structured WAF decision logging
- [HAR 1.2 specification](http://www.softwareishard.com/blog/har-12-spec/) - The HTTP Archive format
- [What Zentinel Is Really Optimizing For](/articles/what-zentinel-is-really-optimizing-for/) - The operator-first proxy design philosophy
- [Notes from RSAC 2026](/articles/notes-from-rsac-2026/) - Where the applied security thread connects to industry context
