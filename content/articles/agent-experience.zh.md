+++
title = "智能体体验：你构建的一切的第三位读者"
date = 2026-11-24
draft = true
description = "UX 服务于使用系统的人，DX 服务于构建系统的人。如今智能体两件事都在做，而它们需要猜多少，已经成了一个设计问题。"

[extra]
author = "Raffael"
in_short = [
  "当智能体来写代码，开发者花在语法和模式上的时间变少，花在架构、集成和需求上的时间变多，而智能体所驱动的工具比以前更重要了。",
  "智能体体验（AX）是 Mathias Biilmann 在 2025 年提出的说法，衡量它最好的标准只有一个：一个智能体要在你的系统里做对一件事，需要猜多少。",
  "接口排列在一架可读性阶梯上，从什么都不用猜的编译器和模式，一直到什么都得猜的 HTML 和截图；错误和反馈是所有接口里最重要的那一个。",
  "工具已经变得可以廉价重写，Bun 从 Zig 移植到 Rust、Anthropic 弃用 git 都说明了这一点，所以如今选择一个生态系统，你所承诺的与其说是它的代码，不如说是它的前提。",
  "智能体的上下文经由一条由仓库、协议、图谱和索引组成的供应链到来，它应当得到和其他任何供应链一样的对待：来源、新鲜度、稳定的契约和成本。",
  "标准正在快速到来（AGENTS.md、MCP、Agent Skills、llms.txt），但缺口更大：命令行工具的契约、有保证的副作用、上下文的来源信息、衡量系统的方法，以及指令与数据之间的边界。",
]
+++

看一个编程智能体在一个它从没见过的仓库里工作十分钟，数一数它猜了多少次：哪个命令运行测试，linter 的抱怨是不是致命的，部署工具那两段散文加一个堆栈跟踪到底是什么意思，工单说的是三个都叫 `billing` 的服务里的哪一个，以及 README 是否仍然属实。每一次猜测都花费 token 和时间，有些猜错了，而猜错的那些最后会进到一个拉取请求里。

这些猜测几乎没有一个说明了模型的什么。它们来自智能体被丢进去的那个系统，而其中大多数可以通过设计消除。一个系统对如今承担其大量工作的智能体服务得有多好，已经成为一个独立的设计问题，这篇文章是我描述它的尝试。

## 开发者上移了一层 {#the-developer-moved-up-a-level}

在 [Almost Irrelevant](/articles/almost-irrelevant/) 里我论证过，一旦智能体写下大部分代码，编程语言的选择就远没有以前那么重要了，因为智能体吸收了学习曲线、繁文缛节和样板代码。同样的转变也改变了开发者整天在想的事情。花在语法、设计模式和怎么写一个循环上的心思少了，更多的心思放在整体的形状上：哪个系统拥有哪些数据，一个改动如何波及旁边的三个系统，需求是什么，以及工作完成时什么必须为真。

没有变的是工具。它比以前更重要了，原因 Jarred Sumner 在 [Bun 加入 Anthropic](https://bun.com/blog/bun-joins-anthropic) 时说得很好：「如果大部分新代码将由 AI 智能体来编写、测试和部署：围绕这些代码的运行时和工具就变得重要得多。」他写道，人类「与每一行代码都更疏离了，所以代码运行的环境必须快速且可预测」。智能体一天把同一个命令运行上千次，并且按字面理解每一次输出，所以开发者早已学会忽略的那些怪癖，现在每运行一次都要付出代价。

## 三种读者 {#three-readers}

如今每个系统都有三种读者：

| | 用户体验（UX） | 开发者体验（DX） | 智能体体验（AX） |
|---|---|---|---|
| 是谁 | 使用系统的人 | 在系统之上或之中构建的人 | 做这两件事之一的智能体 |
| 读什么 | 界面、文字、流程 | 文档、API、错误、工具 | 一切，按字面，每一次 |
| 记得什么 | 习惯，跨越多年 | 团队口口相传的知识 | 会话之间什么都不记得，除非写了下来 |
| 向谁求助 | 客服、同事 | 同事、论坛 | 没有人；它去猜 |
| 困惑的代价 | 失去一个客户 | 损失一个下午 | 一个错误的改动，以机器的速度重复 |

第三种的名字来自 Netlify 的首席执行官 Mathias Biilmann，他在 2025 年 1 月的 [Introducing AX: Why Agent Experience Matters](https://biilmann.blog/articles/introducing-ax) 中提出了它，定义为「AI 智能体作为一个产品或平台的用户所获得的整体体验」。其他人很快接过了这个说法。一个月后，Resend 的 Zeno Rocha 在 [What is AX](https://resend.com/blog/agent-experience) 中写道：「智能体应当能在几毫秒内就上手运行。」这个术语诞生时，是一个关于卖给开发者的产品的问题：一个智能体能不能注册、读文档并完成部署，而不需要一个人去点完一张表单？

我用得更宽泛。智能体体验是每一个代码库、每一个内部工具、两个团队之间的每一个 API、一家公司保存的每一套知识的属性，因为智能体如今在所有这些地方工作，而不只是在一个产品的大门口。我还用一个更窄的定义，因为它更容易付诸行动：**智能体体验，就是一个智能体要在你的系统里做对一件事，需要猜多少**。一个好的系统留给它猜的很少，并且让剩下的猜测检查起来很便宜。

## 猜测从哪里来 {#where-the-guesses-come-from}

第一份有分量的证据表明，决定智能体能做什么的是接口，而不只是模型，它来自 2024 年的 SWE-agent 论文（[Yang et al.](https://arxiv.org/abs/2405.15793)）。这篇论文提出了智能体-计算机接口的概念，并给出了一个经得起时间检验的论点：「语言模型智能体代表了一类新的终端用户，有它们自己的需求和能力。」它的消融实验值得仔细读，因为每一处改动都在接口上，没有一处在模型上：

| 对接口的改动（SWE-bench Lite） | 解决率 |
|---|---|
| 完整的接口：一个带 linter 的编辑器，会拒绝有问题的编辑，摘要式的搜索，一个每次显示 100 行的文件查看器 | 18.0% |
| 同样的编辑器，去掉 linter 这道护栏 | 15.0% |
| 搜索结果逐页返回，而不是给出摘要 | 12.0% |
| 显示整个文件，而不是每次 100 行 | 12.7% |
| 完全没有编辑命令 | 10.3% |

让智能体看到更多的文件内容，结果反而更差；让它翻阅搜索结果，比完全不给搜索还差，后者得分 15.7%。有帮助的是更少的信息，以可预测的形状给出。Anthropic 在自己的智能体上得出了同样的教训：在 [Building effective agents](https://www.anthropic.com/engineering/building-effective-agents) 里，团队写道，对于他们的编程智能体，他们「花在优化工具上的时间比花在整体提示词上的还多」，并给出建议：「通过详尽的工具文档和测试，精心打造你的智能体-计算机接口（ACI）。」他们的建议有一个借自制造业的名字：「给你的工具做防错（poka-yoke）」，也就是改造它们，让错误一开始就很难犯。

在我自己的工作里，猜测来自一份很短的清单，而几乎所有这些地方一直都在；人们通过问同事把它们消化掉了。

- **会变形的输出**。一个为人打印表格的工具，带颜色和进度条，却没有稳定的机器格式。
- **用散文写的错误**。一条写给匆忙之中的人的消息，智能体得去解读它，而且它的措辞在版本之间会变。
- **存在于脑子里的约定**。团队怎么给分支命名，哪些测试不稳定，哪个目录已经废弃。
- **互相矛盾的名字**。同一个应用，在仓库里叫一个名字，在集群里叫另一个，在事故工具里又叫第三个。
- **漂移了的文档**。一份两年前属实的 README，没有任何东西说明这一点。
- **没有来源的知识**。一个答案，没有办法知道它从哪里来、有多旧。

## 可读性阶梯 {#the-legibility-ladder}

并非所有接口留下的猜测都一样多。我发现把它们排个序很有用，从什么都不用猜的，到几乎什么都得猜的：

| 级 | 接口 | 智能体仍然要猜什么 |
|---|---|---|
| 1 | 编译器或类型检查器 | 几乎什么都不用：答案是「是」，或者确切地指出哪里不行、为什么 |
| 2 | 带公开模式的结构化输出（JSON Schema、OpenAPI、RFC 9457 错误） | 下一步做什么，而不是发生了什么 |
| 3 | 有稳定参数、退出码和 `--json` 模式的 CLI | 没有文档说明的字段是什么意思 |
| 4 | 智能体可以获取的 Markdown 文档（`llms.txt`、`.md` 副本） | 它是否仍然有效，以及它与代码如何对应 |
| 5 | HTML 页面 | 在导航和脚本之间，内容在哪里 |
| 6 | 图形界面 | 几乎一切 |

改善智能体体验，主要就是把东西沿着这架阶梯往上挪的工作。Cloudflare 的数字说明了往上走一级值多少：当 [Markdown for Agents](https://blog.cloudflare.com/markdown-for-agents/) 向请求 Markdown 的客户端以 Markdown 提供页面时，他们的一篇博客文章从 16,180 个 token 降到了 3,150 个，用他们的话说：「把原始 HTML 喂给 AI，就像按字付费去读包装，而不是读里面的信。」Anthropic 的长时间运行智能体把功能清单保存在 JSON 而不是 Markdown 里，因为「模型不太可能不恰当地修改或覆盖 JSON 文件」（[Effective harnesses for long-running agents](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents)）。所处的那一级，决定了智能体的注意力有多少用在工作上，有多少用在弄清楚自己在看什么上。

同一个命令可以处在两个不同的级上。这是一个为人编写的部署工具：

```text
⠋ Deploying claims-api to prod...
✗ Something went wrong. The rollout could not be completed because one or more
  replicas failed their readiness checks. Check the dashboard for details.
```

而这是同一次失败，为每一种读者编写：

```text
$ deployctl rollout claims-api --env prod --json
{"status":"failed","stage":"readiness","service":"claims-api","env":"prod",
 "replicas":{"ready":1,"wanted":3},"probe":"/healthz","last_status":503,
 "logs":"deployctl logs claims-api --env prod --since 10m","exit_code":3}
```

第一个要求智能体去猜，然后把它打发到一个它看不见的仪表盘。第二个说明了什么失败了、差了多少、下一步去哪里看，以及根据哪个退出码分支，而人读它也一样清楚。

## 错误信息就是 API {#the-error-message-is-the-api}

一个系统里最值得为智能体用心的部分，是它的反馈：错误、警告、测试输出、评审意见。智能体大部分时间都处在一个循环里，尝试一件事，然后读返回了什么，所以返回的东西就是它用得最多的接口。

我所知道的最清楚的示范，是 Bun 的重写。Bun 原本用 Zig 写成，2026 年 5 月，Jarred Sumner [用 Rust 重写了它](https://bun.com/blog/bun-in-rust)，「在 Claude Code 中使用了大约 50 个动态工作流，在 11 天里持续运行」。智能体先机械地移植了每一个文件，然后一个工作流把编译器的错误当作工作队列来处理，一个 crate 接一个 crate，起点大约是一万六千个错误。他对这为什么行得通的总结是：「编译器错误是比风格指南更好的反馈循环。」编译器错误指向一行代码，无可争辩，问题修好了它就消失，所以智能体可以在无人监督的情况下处理成千上万个，而风格指南没有人能这么说。

Nicholas Carlini 从另一边走到了同一个地方，当时他让十六个智能体[构建一个 C 编译器](https://www.anthropic.com/engineering/building-c-compiler)：「我必须不断提醒自己，我是在为 Claude 而不是为自己编写这个测试框架」。他的规则很具体：「测试框架不应该打印成千上万字节的无用信息」，它应该只打印几行，其余的记录到文件里，而错误应该很容易用搜索找到。Cloudflare 把这一点用到了 Web 本身，向智能体返回 [RFC 9457 问题详情](https://blog.cloudflare.com/rfc-9457-agent-error-pages/)，而不是那些「给智能体线索，而不是指令」的错误页面，并把原则浓缩成一句话：「核心价值不在于格式的选择，而在于语义的稳定。」

一个具有语义稳定性的错误看起来是这样的，而且它在每个版本里的意思都一样：

```json
{
  "type": "https://errors.example.com/quota-exceeded",
  "title": "Quota exceeded",
  "status": 429,
  "detail": "Project claims-api has used 1000 of 1000 builds this month.",
  "retry_after": "2026-12-01T00:00:00Z",
  "fix": "Raise the quota with: deployctl quota set claims-api --builds 2000"
}
```

Anthropic 给工具作者的建议直截了当地说了同样的事：「对你的错误响应做提示词工程，清楚地传达具体且可操作的改进」（[Writing effective tools for agents](https://www.anthropic.com/engineering/writing-tools-for-agents)）。对智能体来说，错误信息是 API 的一部分，它需要 API 的其余部分所得到的东西：版本、文档和测试。

## 当工具可以随手丢弃，前提依然存在 {#when-tooling-is-disposable-premises-remain}

工具过去替换起来很昂贵，所以我们与它们的缺陷共处了几十年。智能体让替换变得足够便宜，成了一个真正的选项，而我认为其后果还没有被充分认识到。

据 [The Register](https://www.theregister.com/devops/2026/07/14/zig-creator-calls-buns-claude-rust-rewrite-unreviewed-slop/5270743) 报道，Bun 的重写花费了「按 API 价格计算大约 165,000 美元」，而这个运行时第一次写成用了好几年。它在 8 月 20 日作为 [Bun 1.4](https://bun.com/blog/bun-v1.4) 发布。动机很实际：让团队疲于奔命的缺陷是内存缺陷，释放后使用和重复释放，正是换一门语言就能排除的那一类。它也有争议。Zig 的创造者在同一篇报道里称之为「未经评审的垃圾」，而十一天的智能体工作是否和多年的人工工作一样可靠，是一个公允的问题，只有在生产环境中经受时间才能回答。但重写确实发生了，代价是一家公司可以选择承担的，单是这一点就改变了算法。

Anthropic 在自己的工具上走得更远。10 月，它描述了[重新设计源代码管理](https://www.anthropic.com/research/redesigning-source-control)：「如今的瓶颈，是所有为人类规模而建的开发者基础设施：源代码管理、构建和 CI。」每天合并的改动从 2026 年 5 月的大约 2,500 个增长到 9 月的超过 30,000 个，于是团队构建了自己的版本控制系统 Scion，并在五个月内把单一仓库迁离了 git。Git 假定客户端离线工作，并持有仓库的完整副本。「由于我们几乎所有的客户端都是智能体和作业」，团队为始终在线的客户端设计了 Scion。一个前提变了，一个服务了整个行业二十年的工具就不再合适。

我把这称为重写门槛：重写一个工具的代价低于与它的前提共处的那个临界点。智能体把这个门槛大幅压低了，由此引出两件事。

第一，实现变得没那么重要，前提变得更重要。当一个工具的代码可以在几周内重新生成，你选择一个生态系统时所承诺的就是它的设计前提：它的内存模型，它的兼容性承诺，它的输出是否确定，它的模块如何命名和查找，它的错误保证什么。智能体每天面对的正是这些，在重写之后幸存下来的也正是这些。Bun 重写的拉取请求承诺「同样的架构，同样的数据结构。」（[#30412](https://github.com/oven-sh/bun/pull/30412)）；改变的是关于由谁来释放内存的那个前提。

第二，智能体体验成了重写的理由。一个错误用散文写、输出不稳定的工具，过去只是令人烦恼。现在它是每个智能体每次运行都要缴纳的一笔税，到了某个时候，花钱换一个更好的工具，比缴这笔税更便宜。

## 上下文供应链 {#the-context-supply-chain}

智能体体验的另一半，是智能体从哪里得到它所知道的东西。我在 [Context Is the Product](/articles/context-is-the-product/) 里写过智能体所依赖的几类上下文，在 [Retrieval Is a Tool, Not a Layer](/articles/retrieval-is-a-tool-not-a-layer/) 里写过为什么检索应该是一个工具。从智能体这一侧看，它的表现就像一条供应链：

{% diagram(title="The context supply chain") %}
  sources                  channels                     the agent
  ─────────────────        ───────────────────────      ──────────────
  repository         ──▶   AGENTS.md, docs/, code  ──┐
  systems of record  ──▶   APIs, MCP servers       ──┤
  company knowledge  ──▶   graphs, ontologies      ──┼──▶  context window
  documents          ──▶   embeddings, search      ──┤     (finite, costly)
  people             ──▶   reviews, approvals      ──┘
                                 │
     every link carries: provenance · freshness · a stable contract · a cost in tokens
{% end %}

这条链上的每一环，都具有任何供应链都有的四个属性。**来源**：智能体能否知道一个事实从哪里来，一个人事后能否核查它？**新鲜度**：这个事实是否带有日期，还是智能体只能假设？**稳定的契约**：这个渠道在版本之间是否保持形状，还是每一次改动都会让下游的智能体出错？**成本**：把这个事实放进窗口要花多少 token？Anthropic 关于上下文工程的指南正是这样看待窗口的：「因此，上下文必须被当作一种边际收益递减的有限资源」（[Effective context engineering](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)），而把 MCP 服务器作为智能体可以调用的代码呈现给它，而不是一长串工具，让他们的一个工作流「从 150,000 个 token 降到了 2,000 个」（[Code execution with MCP](https://www.anthropic.com/engineering/code-execution-with-mcp)）。

渠道正在标准化，对任何在其上构建的人来说这都是好消息。2025 年 12 月，Linux 基金会围绕三个捐赠的项目成立了 [Agentic AI Foundation](https://www.linuxfoundation.org/press/linux-foundation-announces-the-formation-of-the-agentic-ai-foundation)：来自 Anthropic 的 Model Context Protocol，来自 Block 的 goose，以及来自 OpenAI 的 AGENTS.md。一个用于仓库的约定，一个用于系统的协议，一个参考智能体，置于中立的治理之下，这是这条供应链共享基础设施的开端。

没有任何标准能提供的是内容，而大多数公司的智能体体验恰恰在这里最糟糕。在一家公司内部，智能体最常问的问题是：「这个归谁负责，什么依赖它，它还在用吗？」而在大多数组织里，答案散落在六个互相矛盾的工具里。这正是 [IT Intelligence](/articles/it-intelligence/) 所讨论的问题，也是[参考实现](/articles/building-it-intelligence/)通过一个 MCP 服务器来回答、给出小而以实体为中心且始终附带来源的答案的原因。一个智能体可以查询的知识层，每个事实都附有出处，这就是组织本身的智能体体验。

## 目前的标准 {#the-standards-so-far}

对一个两年前还没有名字的领域来说，智能体体验已经有了相当多的共同基础。截至 2026 年 11 月，它看起来是这样的：

| 关注点 | 现有的东西 | 起始 | 背后是谁 |
|---|---|---|---|
| 仓库中给智能体的指令 | [AGENTS.md](https://agents.md/) | 2025 年 | OpenAI，现属 Agentic AI Foundation |
| 向模型说明一个网站 | [llms.txt](https://llmstxt.org/) | 2024 年 9 月 | Answer.AI，一份提案 |
| 把智能体连接到工具和数据 | [Model Context Protocol](https://modelcontextprotocol.io/)，当前修订版 2026-07-28 | 2024 年 11 月 | Anthropic，现属 Agentic AI Foundation |
| 打包的专业知识和工作流 | [Agent Skills](https://www.anthropic.com/news/donating-agent-skills-to-the-agentic-ai-foundation) | 2025 年 10 月 | Anthropic，2026 年 10 月捐赠给 Agentic AI Foundation |
| HTTP API 的错误 | [RFC 9457](https://www.rfc-editor.org/rfc/rfc9457) 问题详情 | 2023 年 | IETF |
| 分析工具和编译器的发现 | [SARIF 2.1.0](https://docs.oasis-open.org/sarif/sarif/v2.1.0/sarif-v2.1.0.html)，以及编译器格式，比如 GCC 的 SARIF 输出和 [rustc 的 JSON](https://doc.rust-lang.org/rustc/json.html) | 2020 年 | OASIS |
| 按需以 Markdown 提供页面 | `Accept: text/markdown` | 2026 年 | Cloudflare，出于实践 |
| 服务及其负责人的目录 | Backstage 的 [catalog-info.yaml](https://backstage.io/docs/features/software-catalog/descriptor-format) | 2020 年 | 事实上的约定 |
| 一个事实从哪里来 | [PROV-O](https://www.w3.org/TR/prov-o/) | 2013 年 | W3C |

有两点很突出。最新的条目是智能体每天都在用的，它们来自模型厂商，并很快转入了中立治理；按 Anthropic 的统计，自 2025 年 12 月这个标准发布以来，仅 Agent Skills 一项就有超过 70 个智能体平台接入。较早的条目来自标准组织，很好地解决了问题的一部分，但它们是为别的读者写的：SARIF 为代码扫描器，PROV-O 为语义网，Backstage 为开发者门户。还没有人为智能体把它们连接起来。

## 还缺什么 {#what-is-still-missing}

我预计未来几年的大部分工作、大部分有意思的想法，都会出现在这些缺口里。下面是我一再碰到的几个，每一个都附上了今天最接近的东西：

| 缺口 | 今天最接近的东西 | 它缺少什么 |
|---|---|---|
| 命令行工具的契约 | HTTP 有 RFC 9457，分析器有 SARIF | 智能体每天运行的成千上万个 CLI 之间的任何共同之处 |
| 可以信赖的副作用 | MCP 工具注解 | 保证：它们只是提示 |
| 上下文的来源和新鲜度 | PROV-O，几个产品约定 | 智能体读取的渠道里的一个字段 |
| 衡量智能体体验的方法 | SWE-bench 之类的模型基准测试 | 改变系统、固定智能体的基准测试 |
| 组织上下文 | Backstage 目录 | 今天什么是真实的，不止团队声明了什么 |
| 面向智能体的文本的变更管理 | API 版本管理 | 工具描述、指令和错误含义的版本与变更日志 |
| 指令与数据之间的边界 | 没有通用的做法 | 一种标记上下文中哪些内容可以服从的方式 |
| 持久的人工交接 | MCP 引导（elicitation） | 可以等上几天、有名字有记录的审批 |

**命令行工具的契约**。智能体一生中有很大一部分时间在 shell 里度过，而 shell 根本没有共享的契约。每个工具都自创机器模式（如果有的话）、自己的退出码和自己的错误措辞。RFC 9457 为 HTTP 解决了这个问题，SARIF 为静态分析解决了它；命令行需要同样的东西：一个用于机器输出的标准参数，每个错误都有带稳定类型的问题详情，下一步操作作为一个字段，以及含义有文档说明的退出码。这是不起眼的工作，而我怀疑它为智能体节省的时间，会比下一次模型发布还多。

**可以信赖的副作用**。在智能体运行某个东西之前，它需要知道这个操作是读还是写，能否安全地重复，能否撤销，是否会触及系统之外。MCP 恰好有用于这些的字段，`readOnlyHint`、`destructiveHint`、`idempotentHint` 和 `openWorldHint`，而规范对它们很坦诚：「ToolAnnotations 中的所有属性都是提示。它们不保证忠实地描述工具的行为」（[schema](https://modelcontextprotocol.io/specification/2026-07-28/schema)），客户端「必须（MUST）将工具注解视为不可信的，除非它们来自可信的服务器」（[tools](https://modelcontextprotocol.io/specification/2026-07-28/server/tools)）。这种谨慎是对的，而缺口依然敞开着。缺少的是一种有东西去检查的副作用声明：一个强制只读的沙箱，或者一个标准的试运行，返回一份会改变什么的计划，就像基础设施工具在应用之前先展示一份计划那样。

**上下文的来源和新鲜度**。一个 `AGENTS.md` 没有负责人，也没有日期。一个 `llms.txt` 不说明它最后一次属实是什么时候。一个工具结果没有通用的字段说明它的事实从哪里来。语义网很久以前就在 PROV-O 里解决了来源问题，但智能体读取的渠道没有一个带着它。在它们带上之前，智能体分不清一个今天早上核查过的事实和一个三次重组之前写下的事实，评审它工作的人也分不清。我希望智能体收到的每一个事实都带有三样东西：一个来源，一个截至日期，一个负责人。这就是我在[参考实现](/articles/building-it-intelligence/)里内置的东西，而它本不应该需要一个定制的平台。

**衡量智能体体验的方法**。我们有的每一个基准测试都固定环境、改变模型。智能体体验需要的恰恰相反：固定智能体，改变系统。谁也无法用别人认可的方式说明，一个仓库、API 或内部平台比另一个对智能体更友好，所以改进无法比较，甚至无法宣称。下面的冷启动测试是我的权宜之计。一个真正的方法，会是一套公开的任务，由一个固定的智能体在一个系统上运行，并且在任何地方都用同样的方式计数猜测。

**组织上下文**。Backstage 让在代码旁边用一个文件描述服务成为常态，这是真正的一步。但目录记录的是团队声明了什么，而智能体需要的是什么是真实的：在实践中谁负责这个命名空间，哪个应用还在调用旧的 API，哪条记录已经过时。对于一个带有置信度和证据的归属与依赖图谱，没有任何标准，每家想要它的公司都得独自构建。这正是 [IT Intelligence](/articles/it-intelligence/) 所讨论的缺口。

**面向智能体的文本的变更管理**。我们给 API 打版本，因为它们一变，客户端就会出错。智能体也是客户端，但它们依赖的文本在悄无声息地变化：一个工具描述被改写，一个指令文件被重新组织，一条错误信息多了一句话。每一处这样的变化都会改变智能体的行为，而没有人看见出错，因为没有测试失败。更糟的是，工具描述本身就是给模型的指令，所以改动它会以代码评审者永远不会去留意的方式改变行为。面向智能体的文本需要 API 表面所拥有的东西：版本、变更日志，以及一份有人评审的差异。

**指令与数据之间的边界**。智能体上下文里的一切看起来都一样：用户的请求，仓库的约定，它获取的一个网页，一个陌生人写的议题评论。其中哪些可以服从、哪些只能阅读，一概不加标记，而这正是提示词注入的根源。更好的模型降低了风险，沙箱限制了损害，正如我在 [Your Agent Wants Root](/articles/your-agent-wants-root/) 里写的，但缺失的那一块是一种约定，贯穿每一个渠道，说明权威从哪里来。

**持久的人工交接**。MCP 的引导（elicitation）让服务器可以在会话中途向用户询问信息，这覆盖了快速提问的情形。更难的情形是必须等待的审批：一个需要第二个人点头的改动，而这个人休假到周四，事后还要有一份记录说明是谁同意的。这种交接至今仍缺一个标准。这正是带有人工等待的持久化执行引擎（比如 [Aqueduct](https://github.com/raskell-io/aqueduct)）存在的原因，而我预计这种交接会成为一个独立的协议。

这些缺口没有一个需要突破，只需要几个人就某件乏味的事情达成一致，Web 就是这样得到 HTTP 状态码的，命令行也是这样得到 `--help` 的。这一次的不同在于速度：谁先把约定写下来，并让它易于采用，谁就会在很长时间里定义智能体的工作方式。

## 衡量它 {#measuring-it}

智能体体验可以衡量，而且衡量的成本很低。我用的是我称为冷启动测试的方法：

1. 在系统里挑一个真实的任务，就是新同事在第一周会接到的那种。
2. 把它交给一个全新的智能体，不给额外指令，没有记忆，没有帮助。
3. 让它去做，并保留完整记录。
4. 从记录中数出四样东西：

| 指标 | 它告诉你什么 |
|---|---|
| 猜测：尝试过的命令、打开过的文件或陈述过的假设，最后证明是错的 | 系统留下多少需要猜的东西 |
| 到第一次构建成功或测试通过为止的轮数 | 反馈循环有多快 |
| 第一次正确改动之前花掉的 token | 获取上下文有多昂贵 |
| 需要人介入的次数 | 知识还在哪些地方只存在于脑子里 |

每做一次旨在改善的改动，就再运行一次。数字会有噪声，因为智能体本身就有噪声，但记录不会：每一次猜错都指向一个具体的缺口，而大多数缺口一个下午就能补上。每一个没补上的缺口，都是我所说的智能体体验债务，和任何债务一样，它会利滚利，因为每个智能体在每次运行时都要再付一遍。

## 该怎么做 {#what-to-do-about-it}

对构建软件的人和运行软件的人来说，清单很短，而且没有一样是稀奇的。

- **把约定写在智能体会找到的地方**。根目录下一个 `AGENTS.md`，指向一个始终保持属实的 `docs/` 目录，胜过人们脑子里再多的知识。
- **给每个工具一种机器形式**。稳定的参数，有意义的退出码，一个 `--json` 模式，以及默认简短、细节写进日志文件的输出。
- **把错误当作 API 对待**。给它们稳定的类型，说明下一步做什么，并在版本之间保持它们的含义。
- **把检查放在评审之前**。类型、模式、linter 和测试在一个人需要去看之前，就把猜测变成了答案。
- **把你的知识作为带来源的数据发布**。归属、依赖和状态应该放在智能体可以查询的地方，每个事实都附有出处。
- **按前提选择生态系统**。兼容性承诺、确定性和一个会解释自己的编译器，如今比库目录的大小更有价值，因为目录可以重新生成，前提不能。
- **运行冷启动测试**。不是一次，而是每个季度一次，就像你运行负载测试那样。

我听到最多的反对意见是，这一切是换了个新名字的良好开发者体验。其中很多确实如此，而我认为这令人鼓舞：一个智能体体验好的系统，几乎总是对人也更好。区别在于宽容度。人在文档出错时会问同事，学一次就记住团队的习惯，而智能体会去猜，并且除非习惯被写下来，它在每次会话里都从零开始。一个误读了错误的人损失一个下午；智能体在每次运行时都误读它，并行地，比任何评审都跟得上的速度还快。

## 第三位读者 {#the-third-reader}

三十年来，我们为使用系统的人设计，十五年来，为构建系统的人设计。如今智能体承担了这两份工作中的很大一部分，而它们是最没有能力绕过我们留下的模糊之处的读者，这让它们成了我们所拥有的、关于什么仍需修复的最诚实的向导。

## 参考资料 {#references}

- Mathias Biilmann，[Introducing AX: Why Agent Experience Matters](https://biilmann.blog/articles/introducing-ax)，2025 年 1 月 28 日。
- Zeno Rocha，[What is AX (Agent Experience) and how to improve it](https://resend.com/blog/agent-experience)，Resend，2025 年 2 月。
- John Yang、Carlos E. Jimenez、Alexander Wettig、Kilian Lieret、Shunyu Yao、Karthik Narasimhan 和 Ofir Press，[SWE-agent: Agent-Computer Interfaces Enable Automated Software Engineering](https://arxiv.org/abs/2405.15793)，2024。
- Erik S. 和 Barry Zhang，[Building effective agents](https://www.anthropic.com/engineering/building-effective-agents)，Anthropic，2024 年 12 月 19 日。
- Ken Aizawa，[Writing effective tools for agents, with agents](https://www.anthropic.com/engineering/writing-tools-for-agents)，Anthropic，2025 年 9 月 11 日。
- Anthropic，[Effective context engineering for AI agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)，2025 年 9 月 29 日。
- Adam Jones 和 Conor Kelly，[Code execution with MCP: Building more efficient agents](https://www.anthropic.com/engineering/code-execution-with-mcp)，Anthropic，2025 年 11 月 4 日。
- Justin Young，[Effective harnesses for long-running agents](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents)，Anthropic，2025 年 11 月 26 日。
- Jarred Sumner，[Bun is joining Anthropic](https://bun.com/blog/bun-joins-anthropic)，2025 年 12 月 2 日，以及 [Rewriting Bun in Rust](https://bun.com/blog/bun-in-rust)，2026 年 7 月 8 日；拉取请求 [Rewrite Bun in Rust](https://github.com/oven-sh/bun/pull/30412)；[Bun 1.4](https://bun.com/blog/bun-v1.4)。
- [Zig creator calls Bun's Claude Rust rewrite "unreviewed slop"](https://www.theregister.com/devops/2026/07/14/zig-creator-calls-buns-claude-rust-rewrite-unreviewed-slop/5270743)，The Register，2026 年 7 月 14 日。
- Linux Foundation，[Linux Foundation Announces the Formation of the Agentic AI Foundation](https://www.linuxfoundation.org/press/linux-foundation-announces-the-formation-of-the-agentic-ai-foundation)，2025 年 12 月 9 日。
- Nicholas Carlini，[Building a C compiler with parallel Claudes](https://www.anthropic.com/engineering/building-c-compiler)，Anthropic，2026 年 2 月 5 日。
- Celso Martinho 和 Will Allen，[Introducing Markdown for Agents](https://blog.cloudflare.com/markdown-for-agents/)，Cloudflare，2026 年 2 月 12 日。
- Cloudflare，[Slashing agent token costs by 98% with RFC 9457-compliant error responses](https://blog.cloudflare.com/rfc-9457-agent-error-pages/)，2026 年 3 月 11 日。
- Anthropic，[Redesigning source control at Anthropic](https://www.anthropic.com/research/redesigning-source-control)，2026 年 10 月 13 日。
- [RFC 9457: Problem Details for HTTP APIs](https://www.rfc-editor.org/rfc/rfc9457)，2023。
- Jeremy Howard，[/llms.txt: a proposal to provide information to help LLMs use websites](https://www.answer.ai/posts/2024-09-03-llmstxt.html)，Answer.AI，2024 年 9 月 3 日，以及 [AGENTS.md](https://agents.md/)。
