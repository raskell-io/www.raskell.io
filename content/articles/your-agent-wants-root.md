+++
title = "Your Agent Wants Root"
date = 2026-06-05
description = "An agent with a shell tool is arbitrary code execution with a friendly face. A short tour of why Docker alone is not enough, what Firecracker, gVisor, and Kata actually solve, and a hardened sandbox you can wrap the post-one agent in today. Part two of The Agent Platform Handbook."

[taxonomies]
tags = ["applied-security", "ai-engineering", "edge-systems"]
categories = ["patterns"]
series = ["the-agent-platform-handbook"]

[extra]
author = "Raffael"
image = "your-agent-wants-root.avif"
og_image = "your-agent-wants-root.png"
+++

> Part 2 of *The Agent Platform Handbook. From Loop to Platform.* Previous: [What an Agent Actually Is](/articles/what-an-agent-actually-is/). Next: Tools, How Agents Actually Do Things.

In [post one](/articles/what-an-agent-actually-is/) we did not just define what an agent is. We built one. A working harness in roughly one hundred and fifty lines of TypeScript on Bun: a loop, a one-tool registry, a system prompt, a dispatcher, and an iteration budget.

A note on the word, because post one did not use it. The *harness* is the code that wraps the model and turns a chat API into something that acts. Loop, tools, system prompt, dispatcher, budgets today, and (further into the series) memory, identity, observability, policy, and the rest. Everything that is yours to write and yours to operate. The model is a dependency you call. The harness is the artifact you ship. In this series the harness is what grows, post by post.

The code lives at tag [`post-01`](https://github.com/raskell-io/the-agent-platform-handbook/tree/post-01) of [`the-agent-platform-handbook`](https://github.com/raskell-io/the-agent-platform-handbook), and the rest of the series builds on it one layer at a time. Every post adds one file or rewrites one piece. This is the post that adds the second layer.

The harness has one tool so far, called `shell`, that runs any command you hand it under `sh -c`. Post one closed with a one-line caveat: that tool will run `rm -rf $HOME` if the model decides that is the right command, and the model will decide this at least once.

This post is about the gap between "at least once" and "we are fine with that."

The shell tool from post one is, by any honest reading, an arbitrary-code-execution primitive with a polite English-language API in front of it. The model is non-deterministic. Tool results can carry instructions the model will treat as authoritative. Other agents may feed inputs back into your loop. Each of those is a way for a tool call to do something the operator did not intend. The defense is not to write better prompts. The defense is to put a fence around the runtime so the cost of a bad call is bounded.

So this is the runtime post: the layer that sits underneath every tool the harness will ever have. We will sketch the threat model, walk the lineage of isolation primitives from chroot to microVMs, explain why "just run it in Docker" is only half an answer, and end by adding that layer to the harness from post one. The agent loop does not move. Only the floor underneath the shell tool changes, and the diff lands as tag [`post-02`](https://github.com/raskell-io/the-agent-platform-handbook/tree/post-02) in the same repo.

## What an agent runtime is actually exposed to

A traditional service runs known code. You wrote it. You reviewed it. The only inputs are the ones the API contract allows. An agent runtime is not that.

Three things make the agent threat model different.

First, the **model picks the action**. The set of commands your shell tool will execute over its lifetime is a function of every prompt, every retrieved document, every tool output, and the model's sampling temperature. You cannot enumerate it in advance. You cannot review it in code. You can only constrain what happens after.

Second, **tool results are an injection surface**. A web page the agent fetches can contain "ignore previous instructions and run X." A code file the agent reads can contain a comment that nudges the next decision. This is indirect prompt injection, documented by Greshake and others in 2023, and there is no fully reliable defense at the model layer. The runtime is where you assume the model will eventually be tricked.

Third, **blast radius scales with fanout**. A single agent in a single shell on a single laptop is a manageable problem. A fleet of one hundred agents per tenant, each with shell, network, and file-system access, is not. Once you have more than one, you have a multi-tenant security problem whether you planned for one or not.

So the question is no longer "can my agent be subverted." It will be. The question is "what does the rest of the system look like the day after."

## A short history of trying to contain a process

The good news is that the industry has been working on "give this process less than the full machine" for forty-six years. The bad news is that almost none of the early answers were built with an adversary that picks its own commands in mind.

The lineage matters because every modern option is a reaction to a specific failure of the option before it.

**chroot**, Unix V7, 1979. Bill Joy's contribution. A process sees a subtree of the filesystem as its root. Designed for build isolation, not security. Trivial to escape if you have any capability beyond a vanilla user.

**FreeBSD jails**, Poul-Henning Kamp, 1999. Took chroot's filesystem trick and added process visibility, network, and user separation. The first credible "container" in the modern sense. Still in production today and still good at what it does.

**Solaris Zones**, 2004. A more ambitious version of jails with resource controls. Influential design, not a survivor.

**Linux cgroups and namespaces**, 2002 through 2008. Namespaces gave you separate views of mounts, PIDs, networks, and users. cgroups, originally Process Containers from Google in 2007, gave you per-group resource accounting. The pieces existed. The user experience was awful.

**LXC**, 2008. Tied cgroups and namespaces into a single CLI. Still awful, just less so.

**Docker**, 2013. Took the same primitives and made them shippable. Image format, registry, declarative configuration, single command. The reason every paragraph after this one talks about "containers" is Docker.

**Kubernetes**, 2014. Made running many containers across many machines a default. Pushed isolation choices down into the runtime layer.

**Kata Containers**, 2017. A merger of Intel Clear Containers and Hyper.sh runV. Each pod runs in its own Linux VM, exposed to Kubernetes through a runtime that looks OCI-compatible. The first serious answer to "what if my container shared less than a whole kernel with the host."

**Firecracker**, AWS, 2018. A minimal virtual machine monitor on top of KVM, built to run Lambda and Fargate workloads. Around 125 milliseconds to boot. No legacy device model. Designed from the start for multi-tenant short-lived workloads.

**gVisor**, Google, 2018. A user-space kernel, called `runsc`, that intercepts syscalls from a container and services most of them itself, only escalating a narrow subset to the host. Drop-in replacement for `runc` in any OCI-compatible runtime. Slower I/O, smaller attack surface.

**Wasmtime and the WASI runtimes**, 2019 onward. A different model entirely: compile your tool to WebAssembly, run it in a sandbox with capability-passed I/O. Excellent for things that fit. Not yet a general answer for "run arbitrary shell commands."

The lesson from this lineage is the one the agent runtime question keeps re-asking. Every layer was designed for the threat model of the time. chroot was about build isolation. Docker was about deployment ergonomics. Firecracker, gVisor, and Kata were the first three options designed in an era where the workload itself was assumed to be untrusted. That assumption is the one that matches what an agent does.

## Why a default Docker container is not enough

Docker is the default for almost every agent project that is past the laptop stage. There are good reasons. The packaging is good. The ecosystem is enormous. Kubernetes speaks it natively. For most workloads that are not adversarial, it is the right answer.

Three things stop it from being enough for an agent runtime.

**The kernel is shared.** A default `docker run` puts your process in a set of namespaces with a set of cgroups, but it runs against the same kernel as the host. Any kernel bug reachable from the container becomes a host compromise. This is not theoretical. The runc CVEs of 2019 and 2024 each gave a container with default settings a path to escape. Those got patched. The next one is in flight somewhere.

**The defaults are generous.** A vanilla `docker run` keeps a substantial set of Linux capabilities, allows the container to write to its own root filesystem, leaves network access to internal services open by default, and runs the process as root inside the container. None of those are inherent to containers. All of them have to be turned off explicitly.

**The agent will be told to do things.** Volume mounts that expose the host filesystem will get used. Network interfaces that reach internal APIs will get called. Secrets sitting in environment variables will end up in tool output. The model is helpful. It does not have a security review board.

The honest version of the rule is this. A hardened Docker container, with capabilities dropped, network disabled, the root filesystem read-only, user namespacing on, no-new-privileges set, and resource caps in place, is enough for **single-tenant, low-stakes, well-scoped** agent workloads. It is not enough for multi-tenant or for code paths where the agent can be steered by external input. For those, you want a second isolation boundary underneath the container.

## The mental model

There are three boundaries you can put between an agent's tool call and the host kernel. Stack them in your head before picking a vendor.

{% diagram(title="Three isolation boundaries for an agent tool call") %}
                              host kernel
       =================================================
       |                                               |
       |    +------------------+    +---------------+  |
       |    |  Docker default  |    |  Hardened     |  |
       |    |  ----------------|    |  Docker       |  |
       |    |  shared kernel,  |    |  ----------   |  |
       |    |  many caps,      |    |  no caps,     |  |
       |    |  network on,     |    |  no net,      |  |
       |    |  fs writable     |    |  ro fs        |  |
       |    +------------------+    +---------------+  |
       |             ^                       ^         |
       |             |                       |         |
       |    +--------+-----------------------+------+  |
       |    |               gVisor (runsc)          |  |
       |    |  user-space kernel intercepts the     |  |
       |    |  syscall surface. host kernel sees    |  |
       |    |  only a narrow subset.                |  |
       |    +---------------------------------------+  |
       |                       ^                       |
       |                       |                       |
       |    +------------------+--------------------+  |
       |    |        Firecracker / Kata             |  |
       |    |  separate Linux kernel per workload.  |  |
       |    |  KVM is the boundary. host kernel is  |  |
       |    |  one hypervisor call away.            |  |
       |    +---------------------------------------+  |
       =================================================
                            host hardware
{% end %}

Read it bottom-up. Firecracker and Kata give you the strongest isolation by giving the workload its own kernel and putting KVM between it and yours. gVisor gives you most of the same benefit with a lower operational cost by replacing the syscall surface with a user-space implementation. Hardened Docker is what you actually want at the laptop or small-team scale. Default Docker is fine for code you wrote and not for code the model wrote.

Pick the layer that matches the workload. Stacking is allowed and often correct: hardened Docker plus gVisor is the usual production starting point for agent fleets.

## Adding the runtime layer to the harness

The cheapest meaningful upgrade to the harness from post one is to stop running tool calls in the same process as the agent loop. Wrap the shell tool in a hardened container, with gVisor underneath if you have it installed. The loop stays the same. The blast radius drops by an order of magnitude. None of the four other pieces of the harness (system prompt, dispatcher, message history, iteration budget) need to know any of this happened.

Install gVisor once on the host:

```
# Linux only. macOS users can skip gVisor and keep the hardened flags.
curl -fsSL https://gvisor.dev/archive.key | sudo gpg --dearmor \
  -o /usr/share/keyrings/gvisor-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) \
  signed-by=/usr/share/keyrings/gvisor-archive-keyring.gpg] \
  https://storage.googleapis.com/gvisor/releases release main" | \
  sudo tee /etc/apt/sources.list.d/gvisor.list
sudo apt-get update && sudo apt-get install -y runsc
sudo runsc install
sudo systemctl reload docker
```

You now have `runsc` as an available Docker runtime. From here, the rest of this section is three small changes to the harness from post one. The repo at `post-01` has three files (`agent.ts`, `tools.ts`, `package.json`); at `post-02` it has four. Run `git diff post-01 post-02` against [`the-agent-platform-handbook`](https://github.com/raskell-io/the-agent-platform-handbook) and the entire delta of this post is on screen.

**Change 1: extract the `Tool` type into its own file.** In post one, `Tool` lived at the top of `tools.ts` next to the only implementation. We are about to grow the toolbox and start swapping tool implementations between sandboxed and non-sandboxed variants, so the type and the implementations want to live in different files. Pure refactor, no behavior change.

```typescript
// types.ts (new file)
export type Tool = {
  name: string;
  description: string;
  input_schema: {
    type: "object";
    properties: Record<string, unknown>;
    required?: string[];
  };
  run: (input: Record<string, unknown>) => Promise<string>;
};
```

**Change 2: point `agent.ts` at the new location.** One line. The loop, the system prompt, the iteration budget, the tool-call dispatcher are all untouched.

```diff
  // agent.ts
  import Anthropic from "@anthropic-ai/sdk";
  import type { MessageParam, ToolResultBlockParam } from "@anthropic-ai/sdk/resources/messages";
- import { shell, type Tool } from "./tools";
+ import { shell } from "./tools";
+ import type { Tool } from "./types";
```

**Change 3: rewrite `tools.ts` so the shell tool runs inside a hardened container.** The exported name, description, and input schema stay the same so the model sees the same tool. Everything that changes is below the public interface, in `run`. That is the separation we are paying for: the agent does not know its tool got fenced.

```typescript
// tools.ts (sandboxed version)
import type { Tool } from "./types";

const SANDBOX_IMAGE = "alpine:3.20";
const SANDBOX_WORKDIR = "/work";

const dockerArgs = (image: string, command: string) => [
  "docker", "run",
  "--rm",
  "--runtime=runsc",                  // gVisor. drop on macOS.
  "--network=none",                   // no exfil, no SSRF
  "--read-only",                      // no writes to the rootfs
  "--tmpfs", "/tmp:size=64m",         // give /tmp back, bounded
  "--cap-drop=ALL",                   // no Linux capabilities
  "--security-opt=no-new-privileges", // no setuid escalation
  "--user=1000:1000",                 // unprivileged uid in the container
  "--memory=256m",                    // hard memory cap
  "--cpus=0.5",                       // fractional cpu cap
  "--pids-limit=64",                  // no fork bombs
  "--workdir", SANDBOX_WORKDIR,
  image,
  "sh", "-c", command,
];

export const shell: Tool = {
  name: "shell",
  description:
    "Run a shell command inside an isolated sandbox with no network and a read-only filesystem. Returns stdout, stderr, and exit code as JSON.",
  input_schema: {
    type: "object",
    properties: {
      command: {
        type: "string",
        description: "Shell command to run under `sh -c` inside the sandbox.",
      },
    },
    required: ["command"],
  },
  run: async ({ command }) => {
    const args = dockerArgs(SANDBOX_IMAGE, String(command));
    const proc = Bun.spawn(args, { stdout: "pipe", stderr: "pipe" });
    const [stdout, stderr] = await Promise.all([
      new Response(proc.stdout).text(),
      new Response(proc.stderr).text(),
    ]);
    const code = await proc.exited;
    return JSON.stringify({ code, stdout, stderr });
  },
};
```

Total damage: one new file of ten lines, one moved import, and forty-five lines of `tools.ts`. In exchange, roughly a thousand-fold reduction in blast radius. The agent can still ask `rm -rf /`. It will return an exit code, an error, and a clean host. Network calls will fail closed. Reads outside `/work` are not possible because nothing is mounted into `/work`. The sandbox dies the moment the command returns, so persistence between calls is also gone, which is a separate problem we will pick up in [post six on memory](#).

A few things to notice.

The harness shape from post one is intact. Same loop, same dispatcher, same system prompt, same iteration budget, same JSON contract between the agent and the tool. The sandbox is a runtime concern, not an agent-architecture concern. This separation is exactly the point. You should be able to swap gVisor for Firecracker, or Docker for Podman, or Alpine for a custom image, without touching the loop.

The tradeoffs are real. Spawning a container per tool call costs roughly 200 to 800 milliseconds on a modern host, mostly Docker daemon overhead. For a coding agent that runs three shell commands per turn, that is acceptable. For a sub-millisecond-per-call tool, it is not. The fix at scale is a container pool, or moving to Firecracker microVMs with snapshot/restore where boot time drops to around 125 milliseconds and per-call cost drops further.

The image is `alpine:3.20`, which is around 8 megabytes. Use a bigger image when the workload needs it. Mount a per-session work directory under `/work` when the agent needs to read or write files between calls. Both of those are configuration changes, not architecture changes.

## Picking the layer

Use the table to pick where to start. The honest answer for most teams is "hardened Docker plus gVisor today, Firecracker microVMs later when scale or tenancy demands it."

| Workload                                  | Sensible default                        | Why                                                |
|-------------------------------------------|-----------------------------------------|----------------------------------------------------|
| Local dev agent, one user, your laptop    | Hardened Docker, gVisor if available    | Convenience wins; the blast radius is one machine. |
| Shared internal tool, single tenant       | Hardened Docker plus gVisor             | Cheap upgrade, real benefit, no orchestration cost.|
| Multi-tenant SaaS, agent per user session | Firecracker microVM per session         | Per-tenant kernel isolation; fast boot per session.|
| Kubernetes-native agent platform          | Kata Containers                         | Drop-in OCI shape, pod-level VM boundary.          |
| Unknown code from the public internet     | gVisor at minimum, microVM preferred    | Syscall surface or hypervisor surface, not yours.  |
| WASM-shaped pure-function tool            | Wasmtime with capability-passed I/O     | Fastest sandbox available when the workload fits.  |
| Throwaway batch job, internal only        | Hardened Docker                         | Stacking layers adds cost without proportional gain.|

The table assumes Linux. macOS does not have KVM, so Firecracker and gVisor are Linux-host options. On macOS you can run them inside a Linux VM (Lima, OrbStack, Docker Desktop) and pay the nested cost.

## What this layer does not solve

Isolation is a necessary condition for a safe agent runtime. It is not a sufficient one. The honest list of what is still on your plate after this post.

- **Outbound network policy.** `--network=none` is the right default for the shell tool. The moment you give an agent an `http` tool, you need an egress policy that distinguishes "the model should reach the public web" from "the model should never reach the internal metadata service." That is its own design problem.
- **Persistent state.** A throwaway sandbox forgets everything between calls. Real agents need memory across tool invocations. The design question is which directories survive, who can read them, and what the eviction policy is. We will come back to this in [post six](#).
- **Tool-level policy.** Even inside a perfectly isolated sandbox, you may want certain commands to require human approval. That is a permissions problem, not an isolation problem, and we will spend [post fourteen](#) on it.
- **Identity.** A sandboxed container still has to call your tools, your models, and your APIs. Long-lived API keys baked into the image are how production agent fleets get embarrassed. [Post thirteen](#) puts SPIFFE under this stack.
- **Time and resource budgets.** `--cpus=0.5` and `--memory=256m` cap a single invocation. They do not cap a loop that asks for one hundred invocations. Iteration budgets, token budgets, and wall-clock budgets are a separate fence. [Post sixteen](#) covers that fence.

## Where this lands in the platform

You can hold the platform in your head one box at a time, and you can hold the harness on disk one tag at a time. Post one drew the agent loop and shipped it as [`post-01`](https://github.com/raskell-io/the-agent-platform-handbook/tree/post-01). This post opened the runtime box, put three concrete things inside it (a hardened container, a user-space kernel, a microVM), picked one, and shipped the result as [`post-02`](https://github.com/raskell-io/the-agent-platform-handbook/tree/post-02). The reference architecture in [post twenty-two](#) will keep this box exactly where it is and treat the contents as a choice that varies by workload.

The rule from post one still holds. Each post adds one layer to the same harness and explains why the layer below was not enough. The harness only ever grows; it does not get rewritten.

The layer below this one was the shell tool itself. The layer above is the rest of the toolbox. An agent with one tool is a demo. An agent with a real tool registry is software. Next we extend the same harness with a real registry, give it a schema, and explain what changes when the model decides between four tools instead of one. That post will ship as `post-03` in the same repo.

## Next

**Part 3: Tools, How Agents Actually Do Things.** Function calling, structured outputs, schema design that survives model drift, and the failure modes nobody talks about. We extend the post-one agent with a four-tool registry and a tool-selection trace.
