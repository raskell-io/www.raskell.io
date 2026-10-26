+++
title = "从这里开始"
description = "第一次来？先读三篇短文，再沿着七条阅读路线深入。每条路线按顺序读最好，每一篇也都可以单独阅读。"
template = "tracks.html"

[extra.quick]
title = "如果你有十分钟"
deck = "三个简短的入口，各自展示我所做之事的一个侧面。"
items = [
  { path = "articles/traffic-replay-as-a-security-primitive.md", note = "从运维者的角度看应用安全：在能够重放触发规则的流量之前，WAF 调优只能靠猜。" },
  { path = "articles/the-economics-of-inference.md", note = "为什么推理 token 更像水、电和燃气，而不像 API 调用，以及这对 AI 经济意味着什么。" },
  { url = "https://arcanist.sh/hx/benchmarks/", title = "hx 基准测试", note = "让你用可以亲自运行的东西来评判工程质量。hx 是一个用 Rust 写的 Haskell 工具链，这一页写明了测试机器、方法和局限。" },
]

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
title = "会学习下棋的机器"
deck = "游戏程序如何学习，以国际象棋、将棋和围棋为例：这个系列、可以对弈的引擎，以及背后的书。"
items = [
  { path = "articles/learning-to-play.md", note = "一本国际象棋神童的手册、三种古老的棋和一台笔记本电脑：用 Rust 重建游戏 AI 背后的思想，在手机浏览器里运行，并加以测量。" },
  { project = "kishi" },
  { work = "reinforcement-learning-an-introduction", note = "自我对弈背后的教科书：一个从自己的对局中学习的引擎，究竟在做什么。" },
  { work = "the-infinity-machine", note = "DeepMind 的道路：从会下棋的程序和 AlphaGo，到通用智能的竞赛。" },
]

[[extra.tracks]]
title = "大脑、仿真与模拟的心智"
deck = "把一个大脑复制进计算机需要什么，以及几千个模拟神经元已经能做到什么。"
items = [
  { path = "articles/brain-emulation-as-an-infrastructure-problem.md", note = "一篇 MIT 论文认为，大脑仿真已经进入工程阶段。把它当作基础设施来读，这些数字描述的是一种你的 AI 集群并非为之而建的工作负载。" },
  { work = "from-worm-to-human", note = "一篇把大脑仿真当作工程计划来写的论文，它的数字读起来像一份容量规划。" },
  { work = "state-of-brain-emulation-2025", note = "这个领域自己的综述：连接组学、记录和建模各自走到了哪里，彼此还相距多远。" },
  { project = "hotaru" },
]

[[extra.tracks]]
title = "开放的 Web 与它的数据"
deck = "Web 作为一份礼物、一个训练集，以及一片值得保持开放的公地。"
items = [
  { path = "articles/the-web-was-the-training-set.md", note = "Tim Berners-Lee 的回忆录，讲的是一位英国工程师在一个法瑞边境的实验室里把一个协议送了出去。在 2026 年读，它也是 AI 数据来源的起源故事。" },
  { path = "articles/the-bottleneck-is-data-and-europe-is-sitting-on-it.md", note = "前沿 AI 缺的是公开文本，而不是算力。欧洲的优势在于它从未放到网上的高质量数据。要把它利用起来，需要协调。" },
  { path = "articles/this-site-is-becoming-a-map.md", note = "博客展示的是我最近写了什么。raskell.io 上的新地图展示的是我一再回到的东西，它也是一个公开的第二大脑的开端。" },
  { path = "articles/looking-back-on-2025.md", note = "关于在冲绳读 Tim Berners-Lee，以及为什么 AI 也许会意外地把 Web 从它自己手中拯救出来。" },
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
  { path = "articles/why-we-built-a-haskell-package-manager-in-rust.md", note = "hx，一个用 Rust 写的快速 Haskell 工具链，以及它为什么沿用了让 Python 工具现代化的那套做法。" },
]
+++

下面七条路线会更深入，每次一个主题。一条路线可以混合不同的类型：一篇文章、它所描述的项目，以及值得一起读的书。
