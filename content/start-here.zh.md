+++
title = "从这里开始"
description = "第一次来？先读三篇短文，再沿着四条阅读路线深入。每条路线按顺序读最好，每篇文章也都可以单独阅读。"
template = "tracks.html"

[[extra.tracks]]
title = "边缘系统与应用安全"
deck = "策略、认证、WAF 和可观测性如何移向边缘，以及这对我们构建后端的方式意味着什么。"
items = [
  { path = "articles/edge-systems-are-the-new-backend.md", note = "认证、策略、推理和业务逻辑正在移向边缘和客户端。传统的后端正在变成一个持久化层。" },
  { path = "articles/what-zentinel-is-really-optimizing-for.md", note = "每一个主流代理都是它那个时代的产物。Zentinel 是这个时代的产物：安全、可运维性，以及运维人员能安心睡觉。" },
  { path = "articles/notes-from-rsac-2026.md", note = "第三次参加 RSA Conference，第一次作为演讲者。我在会场上看到了什么，以及我还在消化的东西。" },
]

[[extra.tracks]]
title = "构建智能体平台"
deck = "《Agent Platform Handbook》从第一性原理出发构建一个智能体框架，每次一篇文章、一段能运行的代码。"
items = [
  { path = "articles/what-an-agent-actually-is.md", note = "业界含义最被滥用的一个词，拆开来看：它的构造、它的来历，以及一个大约两百行 TypeScript 就能运行的智能体。" },
  { path = "articles/your-agent-wants-root.md", note = "一个带 shell 工具的智能体，就是一张友善面孔下的任意代码执行。为什么只有 Docker 还不够，以及一个今天就能用的加固沙箱。" },
  { path = "articles/the-bill-is-part-of-the-loop.md", note = "每一次响应本身都带着它的成本。把这个数字变成循环能够看到并据此行动的东西。" },
]

[[extra.tracks]]
title = "平台自动化与可运维性"
deck = "工作流、护栏，以及让交付可持续的工具。"
items = [
  { path = "articles/how-ai-makes-bare-metal-viable-again.md", note = "我把两个生产应用从 Kubernetes 搬到了一台 Hetzner 服务器上。缺的那一块并不是硬件。" },
  { path = "articles/mise-ate-my-makefile.md", note = "Mise 用每个项目一个 TOML 文件，取代了 Make、asdf 和一堆 shell 脚本。" },
  { path = "articles/how-i-work-these-days.md", note = "从 2020 年的 Kaggle 和 Hugging Face，到 2025 年底的编程智能体，以及为什么这套日常终于感觉对了。" },
]

[[extra.tracks]]
title = "语言、AI 与开源"
deck = "当 AI 写下大部分代码时，编程语言会怎样，以及为什么 Haskell 依然重要。"
items = [
  { path = "articles/what-programming-languages-become-when-ai-writes-the-code.md", note = "人的意图与机器执行之间那一层的三种未来，以及我为什么押注 Haskell。" },
  { path = "articles/all-beginning-is-haskell.md", note = "Haskell 如何塑造了我思考构建系统的方式。" },
  { path = "articles/looking-back-on-2025.md", note = "关于在冲绳读 Tim Berners-Lee，以及为什么 AI 也许会意外地把 Web 从它自己手中拯救出来。" },
]
+++

## 如果你有十分钟 {#if-you-have-ten-minutes}

三个简短的入口，各自展示我所做之事的一个侧面。

- **[告警分诊是一个上下文问题](/notes/alert-triage-is-a-context-problem/)**，一篇来自我日常工作的两分钟笔记。我和一位同事把一个 LLM 接到了一个嘈杂的 WAF 上。它本身并没有让告警变少。真正起作用的，是把运维人员首先会去查的上下文交给它。
- **[模型网关就是一个反向代理](/notes/a-model-gateway-is-a-reverse-proxy/)**，另一篇短笔记，也是我反复回到的一个想法：智能体平台需要的大部分东西，都是装着新载荷的老基础设施工作，边缘代理的那套词汇几乎可以原封不动地沿用过来。
- **[hx 基准测试](https://arcanist.sh/hx/benchmarks/)**，让你用可以亲自运行的东西来评判工程质量。hx 是一个用 Rust 写的 Haskell 工具链，这一页写明了测试机器、方法和局限。[更长的故事](/articles/why-we-built-a-haskell-package-manager-in-rust/)讲了它为什么存在。

下面四条路线会更深入，每次一个主题。
