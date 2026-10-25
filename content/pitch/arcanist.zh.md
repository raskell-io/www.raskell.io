+++
title = "Arcanist"
description = "让 AI 编写的代码检查起来成本低廉的 Haskell 工具链，并把每一次检查记录下来，让任何人或模型都不必重复同样的检查。"
path = "zh/invest/arcanist"
template = "venture.html"

[extra]
project = "arcanist"
eyebrow = "投资简报"
parent = { name = "投资", url = "@/invest.md" }
contact_anchor = "talk-about-investing"
+++

如今模型写代码的速度已经超过了人审查代码的速度，而研究一再发现，这些代码中有相当大一部分是错误的或不安全的。Arcanist 提供 hx 和 bhc：hx 是一套快速的 Haskell 工具链，支持可复现构建，并为编程智能体提供接口；bhc 是第二个 Haskell 编译器，以 GHC 为基准公开测量。它的签名注册表已经记录了 bhc 构建过哪些包版本。下一步是建立一个公共资源库：一个函数只需检查一次，任何需要它的人或模型都可以引用这次检查。

## 问题 {#the-problem}

生成变得便宜了，检查却没有。每一次智能体会话都在重新检查同样的函数，然后把结果丢掉；每一个团队都要再为审查付一次钱。

{% tiles(cols=3) %}
- **使用 Haskell 的团队** 他们要同时应付 ghcup、cabal 或 Stack、格式化工具、linter 和覆盖率工具。在 2025 年 State of Haskell 调查中，27% 的受访者表示过去一年里编译器升级破坏过他们的代码。
- **所有交付 AI 编写代码的人** 产出的速度超过了任何人的审查速度，而“几乎正确”是对 AI 工具最常见的抱怨。
- **编程智能体本身** 它们需要的是带有结构化错误和退出码的工具，而不是写给终端前的人看的输出。
{% end %}

## 产品 {#the-product}

{% tiles(cols=3) %}
- **hx** 整个 Haskell 工作流集中在一个 Rust 二进制文件里：工具链安装、构建、测试、格式化、lint、覆盖率和发布。当前为 0.11 版，是自 2026 年 1 月以来的第 42 个版本。
- **可复现构建** lockfile 按 SHA-256 和 Hackage 修订版本锁定每一个依赖，一旦出现漂移，CI 就会失败。
- **为智能体而建** hx 通过 MCP 向编程智能体提供 build、test、lock 和 doctor 工具，并返回结构化错误。
- **bhc** Basel Haskell Compiler，一个用 Rust 从零编写的编译器和运行时。Pandoc 的全部 221 个模块都能通过类型检查并编译，219 个测试程序的结果与 GHC 一致。
- **注册表** registry.arcanist.sh 经过签名，普通的 cabal 就能读取，并为每个版本保存一份签名的 bhc 构建结果。目前为预览版，发布需受邀。
- **随处可用** Homebrew、cargo、Nix、aqua、winget、容器镜像，以及适用于 macOS、Linux 和 Windows 的二进制文件。
{% end %}

在一项自行报告的、基于一个小型项目与 cabal 对比的基准测试中，hx 的启动速度快 6 倍，冷构建快 5.6 倍，重新构建快 4.8 倍。bhc 公开自己的不足，就像公开自己的数据一样坦诚：编译后的程序目前还不做垃圾回收，因此长期运行的服务要等到这个里程碑完成。

## 市场 {#the-market}

目前还没有人测算过验证 AI 编写代码的市场规模，本页也不会凭空编造一个。它周边的市场规模很大，而且变化很快。

{% tiles(cols=3, variant="figures") %}
- **81 亿美元** 2025 年 AI 编程助手市场规模，预计到 2032 年达到 1270 亿美元。[MarketsandMarkets](https://www.marketsandmarkets.com/Market-Reports/ai-code-assistant-market-166208330.html)
- **10 亿美元** Claude Code 发布六个月后的年化收入。开发者愿意为能写代码的 AI 付费。[Anthropic](https://anthropic.com/news/anthropic-acquires-bun-as-claude-code-reaches-usd1b-milestone)
- **64 亿美元** 2025 年软件开发工具市场规模，到 2031 年将增长到 157 亿美元。[Mordor Intelligence](https://www.mordorintelligence.com/industry-reports/software-development-tools-market)
{% end %}

## 为什么是现在 {#why-now}

{% tiles(cols=2, variant="figures") %}
- **45 %** AI 生成的代码引入安全漏洞的测试用例比例，而且模型变大后并没有改善。[Veracode](https://www.veracode.com/press-release/ai-generated-code-poses-major-security-risks-in-nearly-half-of-all-development-tasks-veracode-research-reveals/)
- **1.7 倍** 与纯人工编写的 pull request 相比，AI 参与编写的 pull request 中重大问题的倍数。[CodeRabbit](https://coderabbit.ai/blog/state-of-ai-vs-human-code-generation-report)
- **46 %** 不信任 AI 输出准确性的开发者比例，一年前为 31%。[Stack Overflow 调查，经 TechRepublic 报道](https://www.techrepublic.com/article/news-developer-trust-in-ai-declines/)
- **14.5 亿美元** 形式化验证公司 Harmonic 在 2025 年的估值。检查正在吸引资本。[Crowdfund Insider](https://www.crowdfundinsider.com/2025/11/256050-robinhood-ceo-backed-harmonic-becomes-unicorn-on-series-c/)
{% end %}

AI 实验室也在收购开发者工具：OpenAI 宣布收购 uv 和 Ruff 背后的公司 Astral，Anthropic 收购了 Bun。快速而一致的工具链已经成为智能体平台的战略资产。

## 与众不同之处 {#what-sets-it-apart}

{% tiles(cols=2) %}
1. **一个二进制文件覆盖整个工作流** 六个独立工具变成了 hx 的命令，可通过八个渠道安装。
2. **默认可复现** 按哈希锁定的 lockfile、离线同步，以及在出现漂移时失败的 CI 检查。
3. **为循环中的智能体而建** 一个返回结构化错误的 MCP 服务器，代码中还附带 llms.txt 和 AGENTS.md。
4. **公开测量的第二个编译器** 以 GHC 为基准真相，公开发布注明日期的数据，包括不足之处。
5. **会不断积累的验证** 注册表保存由定时验证器为每个版本生成的签名构建结果，一次完成的检查会一直留有记录。
{% end %}

## 竞争 {#competition}

| 替代方案 | 它做什么 | Arcanist 的不同之处 |
|---|---|---|
| cabal-install | 标准的 Haskell 构建工具 | hx 驱动 cabal，并在一个二进制文件中加入工具链安装、哈希 lockfile、格式化、lint、覆盖率和 MCP |
| Stack | 精选快照和可复现构建 | hx 直接读取 `.cabal` 和 Hackage，并能导入 Stack 项目 |
| GHCup | 安装 GHC、Cabal 和 HLS | hx 读取相同的元数据，按项目安装，无需单独的工具 |
| Nix, haskell.nix | 封闭式构建 | 采用成本更高；hx 提供一个 flake，同时保持更简单的默认方式 |
| GHC | 参考编译器 | bhc 是一个独立的第二编译器，带有 WebAssembly 后端；GHC 仍是基准真相 |
| Hackage | 中央包索引 | 经过签名，兼容 cabal，并按版本记录验证结果 |
| Lean, Dafny | 证明助手 | 互为补充：Arcanist 在一门生产语言中把检查变成可复用的记录 |

## 商业模式 {#business-model}

hx、bhc 和注册表都是免费的，并将一直免费。目前它们通过 [GitHub Sponsors](https://github.com/sponsors/arcanist-sh) 和 Ko-fi 获得资助，公司也可以资助特定功能或安全审查。付费层建在其上，就像 Astral 先用免费工具建立用户基础一样。

{% tiles(cols=2) %}
- **私有注册表** 为运行 Haskell 或 AI 编写代码的公司提供验证记录、策略控制和审计日志。
- **验证即服务** 付费的验证器算力，附带签名结果。
- **支持** 为在 CI 中采用 hx 的团队提供支持合同。
- **战略契合** 正如对 Astral 和 Bun 的收购所表明的，智能体平台需要可以检查的输出。
{% end %}

## 目前进展 {#where-it-stands}

{% tiles(cols=3, variant="figures") %}
- **68** 大约九个月内 hx 和 bhc 的发布次数：分别为 42 次和 26 次。
- **3,000+** hx 和 bhc 在 GitHub 和 crates.io 上的发布版本下载量。
- **221 / 221** bhc 能通过类型检查并编译的 Pandoc 模块数。
{% end %}

注册表已以预览版上线，并有了第一个经过验证的包，定时验证器会为结果签名。hx 曾在 ZuriHac 2026 上发表。目前还没有付费客户：这是一张早期入场券，投向一套已经每隔几周就发布一次的工具。

## 风险 {#risks}

{% tiles(cols=2) %}
- **语言小众** Haskell 的社区忠实但规模不大。hx 现在服务于现有的 Haskell 团队，而验证这一核心设想瞄准的是规模大得多的 AI 编写代码市场。
- **编译器成熟度** bhc 目前还不能运行长期服务。hx 现在就能配合 GHC 使用，因此业务并不依赖 bhc。
- **开源收入** 捐款很少能养活一个编译器。托管注册表和付费验证是自然的付费层。
- **只有一位维护者** Arcanist 由一个人构建，并大量使用 AI 智能体。资金将用于增加工程师。
{% end %}

## 资金将用于什么 {#what-funding-would-do}

{% tiles(cols=2) %}
1. **垃圾回收** 在编译代码路径上实现可用的回收器，让 bhc 能够运行服务。
2. **端到端运行 Pandoc** pandoc 命令完全在 bhc 下运行。
3. **开放的注册表** 从预览走向开放发布，验证器算力不再局限于一个 CI 任务。
4. **公共资源库的第一个里程碑** 面向可复现产物的内容寻址定义和证明。
5. **真实 GPU 验证** 在硬件上测试 CUDA 和 ROCm 后端。
6. **团队和设计合作伙伴** 再招两名工程师，并与公司开展私有注册表试点。
{% end %}

## 洽谈投资 {#talk-about-investing}

{% panel(eyebrow="欢迎投资与赞助", title="及早支持 Arcanist。", links=["在 GitHub 上赞助|https://github.com/sponsors/arcanist-sh"], contact=true) %}
如需投资，请给我发一条简短的消息，说明你是谁，以及你最想先看到什么。如果想支持这项开源工作，可以直接赞助。更多内容请见[投资](/zh/invest/)页面。
{% end %}
