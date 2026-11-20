+++
title = "约束在移动：Agentic Engineering Days Zurich 的一天"
date = 2026-11-20
description = "Agentic Engineering Days Zurich 2026 的七场演讲，以及贯穿其中的主线：智能体不会消除约束，只会把它移到别处。"

[extra]
author = "Raffael"
image = "agentic-engineering-days-zurich-2026.avif"
cover = "covers/agentic-engineering-days-zurich-2026.avif"
in_short = [
  "Agentic Engineering Days Zurich 2026 是在苏黎世火车总站旁一家酒店里举办的一天，门票售罄，40 场分会从 344 份投稿中选出，而其中最好的部分是人。",
  "Pini Reznik 的摘要给了我看这一天的视角：AI 不会消除约束，只会移动它。我看过的每一场演讲，都是在回答约束应该去往何处。",
  "Exasol 主张把数据融合移进数据库，这样智能体就不必在每次调用时背负集成的负担。这是一场赞助演讲，也是我会最先去测试的一场。",
  "协议那场演讲说，能消除最多不确定性的最简单协议会胜出；NVIDIA 的 NOOA 把智能体重新变回带类型的软件，这让我想要一个编译器来检查这些类型。",
  "GitHub Next 展示了约束落在团队对齐上，这指向一种工作方式：人与智能体共享的对话，决策就存在于对话之中。",
]
+++

周五我和几位同事在 [Agentic Engineering Days Zurich](https://www.agenticdays.com/) 度过了一天。会议在苏黎世火车总站旁的 Marriott 举办，为期一天，由 [letsboot.ch](https://www.letsboot.ch/) 组织，五个会场共 40 场分会，从 344 份投稿中选出，门票售罄。明年它会换到更大的场地，办两天，这多少说明了这一年是怎么过的。

Jonas 和 Barbara Felix 以及他们的团队组织了这一切，作为第一届，几乎无可挑剔：会场准时，演讲准时，食物很好，apéro 也足够长，长到能容下演讲引出的那些对话。谢谢你们两位。

<figure>
<img src="/agentic-days-2026-foyer.avif" alt="第一场演讲开始前 Marriott 的大堂" width="1600" height="667" loading="lazy">
<figcaption>开幕前半小时，苏黎世火车总站旁 Marriott 的大堂。我记得的大部分对话都发生在这里，而不是在会场里。</figcaption>
</figure>

有些演讲者是几年前瑞士云原生圈子里的人，如今在做下一件事。那些分会不是我来的目的。我来是为了那些构建我们其他人所用部件的人，而议程里有他们：NVIDIA、GitHub、Red Hat 和 IBM、Google，还有一位来自 Exasol 的数据库创始人。我看了七场演讲，遇到的有趣的人比我预想的多，回家时带着一句我一直放不下的话。


## 约束在移动 {#the-constraint-moves}

这句话出自 Pini Reznik，他联合创办了 Container Solutions，为 O'Reilly 写了 [Cloud Native Transformation](https://www.oreilly.com/pub/au/7845)，现在经营 re:cinq。他为“From Copilot to the Dark Factory”写的摘要描述了一家公司给所有人买了编程助手之后会发生什么：个人变快了，但“PR 数量上升，评审队列变长，测试变弱，上下文、安全和平台方面的瓶颈逐渐显现。”然后是那句话：“AI 不会消除约束；它只是移动约束。”（“AI does not remove the constraint; it moves it.”）

读过 Goldratt 的人会认出这个形状，而我自己一周前也在 [Every layer moves the uncertainty](/notes/every-layer-moves-the-uncertainty/) 里写过它的一个版本。周五让它变得有用的是，它把一份互不相关的议程变成了一个问题。编程助手把约束从打字移到评审。一个能访问五个系统的智能体，把约束从集成层移进了智能体本身。所以对每一场演讲，我都问约束去了哪里，以及那是不是一个好地方。

Reznik 自己的演讲把这种移动画成了一张图，“Who Builds Software with AI?”，一条轴是复杂度，另一条轴是一个系统需要的开发者人数。Excel 宏和简单脚本靠近原点，然后是一到五名开发者的功能型工具，五十到一百名开发者的市场平台，比如 Booking.com 和 HubSpot，再是一千名以上开发者的超大系统，比如 Google Search 和 AWS。再往后，轴上写着“Impossible”（不可能），例子是气候模拟器、城市数字孪生和个性化医疗。他的红色箭头把每一档都向左移了一步：非开发者变成公民开发者，五个人的团队能造出过去需要一百人的东西，轴的最远端也不再是不可能。如果这大致正确，稀缺的就不再是会写代码的人，而是代码周围一切单个团队无法独自完成的事情，他的结束幻灯片说了该怎么做：“找到约束。构建能力。重复。”（“Find the constraint. Build the capability. Repeat.”）完整版本是他和 Michael Müller 合写的一本书，[From Cloud Native to AI Native](https://re-cinq.com/whitepapers)，re:cinq 免费提供。

<figure>
<img src="/agentic-days-2026-reznik.avif" alt="Pini Reznik 和他那张谁在用 AI 构建软件的图表" width="1600" height="800" loading="lazy">
<figcaption>re:cinq 的 Pini Reznik 站在他的图表“Who Builds Software with AI?”前：每一档复杂度都向左移了一步，“Impossible”不再是轴的尽头。</figcaption>
</figure>

| 演讲 | 约束去了哪里 |
|---|---|
| Wrike，生产环境中的 SRE 智能体 | 进入上下文，而没有人测试上下文 |
| Exasol，Beyond MCP | 离开智能体，进入数据库 |
| Red Hat 和 IBM，Agents Speak Protocol | 离开每一个集成，进入每个边界上的契约 |
| NVIDIA，NOOA | 离开提示词，回到普通的带类型软件 |
| GitHub Next，协作环境 | 从写代码转到就写什么达成一致 |
| Typeform，When Software Stops Being Deterministic | 从测试套件转到评估和追踪 |
| re:cinq，From Copilot to the Dark Factory | 从写代码的人转到写规格和检查的人 |

## 智能体成为集成层 {#the-agent-as-the-integration-layer}

我的上午从 Wrike 的 David Pech 和一个已在生产环境运行数月的 SRE 智能体开始。他的摘要把大多数这类智能体描述为“勉强算是初级系统管理员，裹着一件风衣”，他列出的教训与模型无关：框架没有预想的那么重要，误导性的文档误导了智能体，而没有人测试的上下文会在一个版本到下一个版本之间悄悄退化。我猜标题就是智能体自身指令里的一句话，而每一个构建这类智能体的团队最后都会写下它。

一小时后，Alexander Stigsen 把同一个问题往下推了一层。Stigsen 创办了 [Realm](https://en.wikipedia.org/wiki/Realm_(database))，也就是 MongoDB 在 2019 年收购的那个移动数据库，现在是 [Exasol](https://www.exasol.com/) 的首席产品与技术官，Exasol 是来自纽伦堡的内存分析数据库。他的演讲“Beyond MCP”是一个赞助时段，也是一场产品推介，我先把这一点说在前面，因为它同时也是我见过的对我所研究问题最清晰的诊断。

给智能体每个系统配一个 MCP 服务器，CRM、计费、客服，智能体就成了你的集成层。它要为上下文里的每一个工具 schema 和每一份原始结果付费，每个数据源一次往返，在没有查询规划器的情况下连接数据，跨数据源什么都不缓存，并且在每次调用时都要调和同一个客户的三种拼写。他的幻灯片列出了七项成本，并用一句话总结：“智能体背负着集成的负担。”（“The agent carries the integration burden.”）摘要还补充了一条排除了显而易见解决办法的约束：“受监管的组织无法把所有数据复制到一个 AI 平台里。”

他的答案是在一个联邦数据库之上提供一个 MCP 接口，在数据所在之处查询数据，并用一个语义层把每个数据源的词汇映射到共享的业务概念上。CRM 里的 `account_id` 和计费系统里的 `customer_ref` 变成同一个客户身份；发票、退款和币种变成以 CHF 计的净收入。一个语义层，每个智能体都复用它。

我知道数据融合这个想法。我没有考虑过的，是把它放进持久化层，由存储一次性完成繁重的工作，每个智能体都拿到结果。这是 [Context is cheaper than exploration](/notes/context-is-cheaper-than-exploration/) 的论点往下一层，也直接触及 [Building IT Intelligence](/articles/building-it-intelligence/) 里的模式。在那里，融合是一条流水线：来自每个数据源的观测，作为工作流步骤的身份解析，PostgreSQL 里的实体和边，以及每条链接都带着它的依据和置信度。

反驳很容易提出，我也对自己提出过。一个在查询时做融合的数据库会再次移动约束，移进一个我无法控制的产品，而我最在意的语义，也就是该信任哪个数据源、一次匹配有多确定，恰恰是流水线明确表达出来的东西。Exasol 自己的[文档](https://docs.exasol.com/db/latest/ai/ai_build_agents/mcp-server-as-agent-tool.htm)也提醒，一个只有 MCP 服务器的智能体可能会写出忽略 Exasol 方言的 SQL。所以我不会凭一张幻灯片做决定。周一我开始拿参考实现来测试它，并把这个问题记在了 [Data fusion belongs in the store](/notes/data-fusion-belongs-in-the-store/) 里。

## 制定标准的人 {#the-people-who-wrote-the-standards}

下一场演讲由 Stefano Maestri 和 Alessio Soldano 主讲，能亲眼见到协议背后的人是一件乐事。Maestri 代表 IBM 担任 [A2A Technical Steering Committee](https://github.com/a2aproject/A2A/blob/main/GOVERNANCE.md) 成员，并为 [A2A Java SDK](https://quarkus.io/blog/a2a-project-launches-java-sdk) 写了发布文章；Soldano 在 Red Hat 领导过 RESTEasy，也是 Apache CXF 的提交者。他们两人从内部亲历了 SOAP 与 REST 之争，这场演讲就建立在那段历史之上。

<figure>
<img src="/agentic-days-2026-protocol-stage.avif" alt="Stefano Maestri 和 Alessio Soldano 在台上" width="1600" height="800" loading="lazy">
<figcaption>Stefano Maestri（左，讲台旁）和 Alessio Soldano，身后是他们演讲的视角：“能消除最多不确定性的最简单协议会胜出。”</figcaption>
</figure>

他们的视角是“能消除最多不确定性的最简单协议会胜出。”（“The simplest protocol that reduces the most uncertainty wins.”）他们的地图把一个智能体放在中间，每个边界上都有一份约定：面向模型的 Open Responses，面向工具的 MCP，面向其他智能体的 A2A，面向用户的 AG-UI 和 A2UI，面向知识的 AGENTS.md 和 Skills，面向运维的 OpenTelemetry GenAI，面向编辑器的 ACP，以及面向支付的 x402。地图下面的问题是：“你想让什么变得可替换？”

这场演讲很抽象，与其说是一个故事，不如说是一张地图，我本希望能看到一个系统被从头到尾走一遍。但这张地图给了我一个更好的问题，用来回看我刚离开的那场 Exasol 演讲。“一个 MCP 接口”是押注在一个边界上：智能体保有一份标准契约，契约背后的数据变得可替换。只有当语义层随契约而走、而不是随产品而走时，这才成立，而这正是我要检查的。他们幻灯片里我一再回想的一句是：“打开一条通道并不等于达成约定。”（“Opening a channel is not the agreement.”）MCP 服务器打开一条通道。一个客户意味着什么，才是约定。更多内容见 [The simplest protocol that reduces the most uncertainty wins](/notes/the-simplest-protocol-wins/)。

## 一切重新成为软件 {#everything-is-software-again}

NVIDIA 在夏天发布 [NOOA](https://github.com/NVIDIA-NeMo/labs-OO-Agents) 时我看过它，却一直没找到一个下午去试，所以我很高兴听到 Matt Staats 亲自讲解。Staats 的博士论文研究测试，还写过一篇关于测试预言的[获奖 ICSE 论文](https://bibtex.github.io/ICSE-2011-StaatsWH11a.html)，也就是你如何知道一个程序的输出是对的，对一个如今工作是评估智能体的人来说，这是很好的背景。他的摘要开头是：“一个智能体的好坏，取决于模型周围的 harness。”

<figure>
<img src="/agentic-days-2026-nooa-stage.avif" alt="Matt Staats 在台上讲解 NOOA" width="1600" height="800" loading="lazy">
<figcaption>NVIDIA 的 Matt Staats 站在“Zoom out: now everything is software”前，这张幻灯片里智能体循环变成了一个带内部状态的对象。</figcaption>
</figure>

NOOA 把智能体当作一个 Python 类。方法是能力，字段是状态，docstring 是提示词，签名是契约。一个方法体为空的方法在运行时由模型补全，模型的行动方式是编写调用带类型服务的 Python，也就是来自 [Wang et al.](https://arxiv.org/abs/2402.01030) 的 CodeAct 思路。NVIDIA 的[文章](https://developer.nvidia.com/blog/six-agent-harness-capabilities-for-higher-model-performance/)列出了六项能力：带类型的输入和输出，按引用传递，以代码为行动，可编程的循环工程，显式的对象状态，以及模型可调用的 harness API。它报告在 SWE-bench Verified 上用 GPT-5.5 达到 82.2%，这是 NVIDIA 的数字，不是我的。让我记住的那张幻灯片写着“Zoom out: now everything is software”（拉远看：现在一切都是软件）：智能体循环变成一个带内部状态的对象，被一个确定性的应用调用，带类型的任务进去，带类型的值出来。下一张幻灯片上的例子小到可以放在这里。正如幻灯片所注明的，它改编自 NOOA 的框架导览，`llm` 是一个已配置好的客户端：

```python
from nooa import Agent

ItemPrice = tuple[str, float]
CategoryTotal = tuple[str, float]

class BillingAgent(Agent, llm=llm):
    categories: set[str] = {"food", "travel", "other"}

    async def categorize(self, prices: list[ItemPrice]) -> list[CategoryTotal]:
        """Group items by self.categories; sum prices for each category."""
        ...

    async def run(self, raw: list[ItemPrice]) -> list[CategoryTotal]:
        prices = []
        for item, price in raw:
            if price >= 0: prices.append((item, price))
        return await self.categorize(prices)
```

`run` 是普通的 Python，像任何程序一样过滤输入。`categorize` 没有方法体：`...` 把它交给模型，docstring 是提示词，签名说明了必须返回什么。判断被委托了出去，契约没有。

Staats 展示的结果关于记忆，在 ARC-AGI-3 游戏上测量，全程使用同一个模型和同一个 skill。让智能体用 Markdown 自己记笔记达到了 38.4%；NOOA 的记忆 API 达到了 50.2%。智能体写下了 3,262 条记忆，但自动召回平均每轮只取回 4.1 条，所以上下文窗口保持得很小。之后那张幻灯片的标题是“Software is cheaper than thinking”（软件比思考便宜），副标题是“even if software is doing the thinking”（即使是软件在思考）：要达到 Markdown 那次运行的分数，带世界模型和记忆 API 的版本估算 API 成本约 $290，对比约 $1,040。由 harness 管理的结构化记忆胜过模型必须反复重读的笔记，而从数千条记忆中只取回四条的召回，是一种 [strategic forgetting](/notes/strategic-forgetting/)，这次还附上了价格。

这是我见过的约束被移动得最令人信服的地方。提示词和松散的工具列表难以评审、版本化和测试；一个带签名的类则不然。它接近我在 [Tools: How Agents Actually Do Things](/articles/tools-how-agents-actually-do-things/) 里描述的东西，只是走得比我更远。

我一直在想的，是“带类型”这个词出现在一门不强制类型的语言里。在 Python 中，应用与智能体之间的契约在调用发生时才被检查，NOOA 会重试直到输出符合。在一门由编译器强制契约的语言里，类型不一致，程序就构建不起来。这让我回到 [bhc](https://arcanist.sh/bhc/)，想推理和 harness 绑定能否在那里成为原生原语，让一次智能体调用像任何其他 effect 一样带类型。我还不知道那会是一个库、一个语言特性，还是一个坏主意。半成形的版本在 [Harness types in the compiler](/notes/harness-types-in-the-compiler/) 里。

## 约束落在对齐上 {#the-constraint-lands-on-alignment}

这一天最有远见的演讲来自 GitHub Next 的 Krzysztof Cieślak，他创造了 F# 工具 Ionide，并把自己列为 Copilot 的共同创造者之一。他的摘要说“到目前为止，智能体工程一直是一个人的故事”，这与我的经验相符：一个人，几个智能体，大量产出，房间里没有别人。一张幻灯片写着“大多数 AI 工具关注的是单个开发者的生产力”；让全场有反应的那张写着“代码很便宜。共同的理解和信任却不是。”（“Code is cheap. Shared understanding and trust aren't.”）

<figure>
<img src="/agentic-days-2026-cieslak.avif" alt="Krzysztof Cieślak：代码很便宜，共同的理解和信任却不是" width="1600" height="800" loading="lazy">
<figcaption>GitHub Next 的 Krzysztof Cieślak：“代码很便宜。共同的理解和信任却不是。”这张幻灯片让全场有了反应。</figcaption>
</figure>

他展示了两个研究原型。Ace 把一个团队、它的聊天、它的编程智能体以及它们的 microVM 放进一个共享工作空间。它的后继者 [Chopin](https://githubnext.com/projects/chopin/) 是“一个实时多人、智能体化的规划环境”，同事和智能体围绕一个代码仓库一起写计划，并在所有人都能看到的地方敲定决策。GitHub Next 小心地称 Chopin“既不是产品，也不是完成的原型”，而 Ace 已经暂停。

它们背后的论点又是 Reznik 那句话。GitHub Next 的 Maggie Appleton 今年早些时候用一句话[说出了它](https://maggieappleton.com/zero-alignment)：“就构建什么达成一致，是新的瓶颈。”当智能体让代码变得便宜，约束就移到了关于代码应该是什么的对话上，而 pull request、issue 和聊天并不是为那种速度下的那种对话而建的。

我相信工作正在往这里去：几个人和几个智能体共处其中的共享对话，决策、设计和代码都在对话里产生，并一直附着在对话上。这让我想到 [Zed](https://zed.dev/)，我很早就用它，因为在智能体成为话题之前很久我就喜欢它的愿景。Zed 用 Rust 编写，用[他们的话](https://zed.dev/blog/videogame)说，“像电子游戏一样渲染”，建立在自己的 GPU 框架之上，并且从一开始就是多人协作的。今年他们发布了 [DeltaDB](https://zed.dev/blog/introducing-deltadb)，一种“捕捉其间每一个操作并赋予每个操作稳定身份”的版本控制，以及构建在它之上的 [Delta](https://zed.dev/blog/introducing-delta)，其发布文章写道：“如今软件发生在线程里，界面应该反映这一点。”Zed 来得早于它的时代，一路上失去了一些势头。我仍然在为他们加油。更多内容见 [The conversation is the workspace](/notes/the-conversation-is-the-workspace/)。

## 确定性，以及黑灯工厂 {#determinism-and-the-dark-factory}

对我来说，下午以 Typeform 的 staff engineer Susanna Wong 收尾，讲的是当软件不再具有确定性时会发生什么。我们大部分工程实践都假定同样的输入给出同样的输出；她的摘要直白地说，“LLM 系统打破了这个假设”，演讲讲述了 Typeform 不得不改变的东西：用持续评估取代测试套件，用追踪取代日志，把提示词当作工程产物来评审，以及围绕那些不会两次表现相同的组件做编排。这是 [Evaluation Closes the Loop](/articles/evaluation-closes-the-loop/) 涵盖的领域，能从一个必须在产品中亲历这一切的人那里听到它，很好。

她的最后一张幻灯片标着“The one thing to take home”（要带回家的一件事），写着“提示词买来的是产出率。系统买来的是保证。”（“Prompts buy yield. Systems buy guarantees.”）下面是：“可靠性是系统的属性，而不是模型的属性。”最底部用小字写着这一天那句话的另一种形式：“确定性没有消失。它移动了：从模型里出来，进入模型周围的系统。”（“Determinism didn't disappear. It moved: out of the model, into the system around it.”）提示词可以提高好答案的比例。只有模型周围的系统，评估、重试、带类型的契约、签字确认的人，才能承诺任何东西。

她的演讲也是 Reznik 的黑灯工厂通向的地方。这个词来自无人值守制造，Dan Shapiro 的 AI 编程[五个层级](https://www.danshapiro.com/blog/2026/01/the-five-levels-from-spicy-autocomplete-to-the-software-factory/)以它结尾：一个“把规格变成软件的黑箱”。Simon Willison 的[总结](https://simonwillison.net/2026/Jan/28/the-five-levels/)描绘了一座工厂，那里“灯是关着的，因为机器人不需要看见”。Reznik 通向那里的六个系统是编排、沙箱、上下文、验证、治理和学习循环，没有一个是模型。把灯关掉，约束就移到了留给人的两件事上：写规格，以及知道输出是否正确。这就是 Wong 的演讲，也是 Staats 的老本行。

## 我带回家的东西 {#what-i-took-home}

<figure>
<img src="/agentic-days-2026-colleagues.avif" alt="在 apéro 上和同事们一起" width="1600" height="800" loading="lazy">
<figcaption>在 apéro 上和我的同事们一起，这是会议中任何演讲都无法替代的部分。</figcaption>
</figure>

演讲很好，这一天更好，主要是因为演讲之间以及 apéro 上和同事们的那些对话。但如果只留下一件事，那就是 Reznik 那句话给我的习惯。我看过的每一场演讲都移动了一个约束：进入数据库，进入协议，进入类型，进入共享对话，进入评估。没有一场让约束消失。关于任何新的智能体工具，有用的问题不是它消除了什么，而是它把工作放到了哪里，以及那个地方是不是我能看见、测试并掌握的。

<figure>
<img src="/agentic-days-2026-zurich.avif" alt="黄昏时的苏黎世火车总站，在回家的路上" width="1600" height="800" loading="lazy">
<figcaption>黄昏时的苏黎世火车总站，在回巴塞尔的路上。</figcaption>
</figure>

## 参考资料 {#references}

- [Agentic Engineering Days Zurich 2026, programme](https://www.agenticdays.com/sessions)
- Pini Reznik, [From Copilot to the Dark Factory](https://www.agenticdays.com/session/1301641-from-copilot-to-the-dark-factory)，会议摘要
- David Pech, ["YOU MUST NOT ssh!" and Other Stories from Building Our SRE Agent](https://www.agenticdays.com/session/1250380-you-must-not-ssh-and-other-stories-from-building-our-sre)，会议摘要
- Alexander Stigsen, [Beyond MCP: Supercharging your agents with a single unified data plane](https://www.agenticdays.com/session/1368894-beyond-mcp-supercharging-your-agents-with-a-single-unified)，会议摘要
- Exasol, [MCP Server as an agent tool](https://docs.exasol.com/db/latest/ai/ai_build_agents/mcp-server-as-agent-tool.htm)
- Stefano Maestri and Alessio Soldano, [Agents Speak Protocol](https://maeste.it/agents-speak-protocol-aed/)，幻灯片及[来源](https://maeste.it/agents-speak-protocol-aed/sources.html)
- A2A project, [GOVERNANCE.md](https://github.com/a2aproject/A2A/blob/main/GOVERNANCE.md)
- Matt Staats, [NOOA: Inside NVIDIA's Object-Oriented Agent Harness](https://www.agenticdays.com/session/1305345-nooa-inside-nvidia-s-object-oriented-agent-harness)，会议摘要
- NVIDIA, [NVIDIA-NeMo/labs-OO-Agents](https://github.com/NVIDIA-NeMo/labs-OO-Agents) 和 [Six Agent Harness Capabilities for Higher Model Performance](https://developer.nvidia.com/blog/six-agent-harness-capabilities-for-higher-model-performance/)
- Xingyao Wang et al., [Executable Code Actions Elicit Better LLM Agents](https://arxiv.org/abs/2402.01030), ICML 2024
- Matt Staats, Michael W. Whalen and Mats P. E. Heimdahl, [Programs, Tests, and Oracles: The Foundations of Testing Revisited](https://bibtex.github.io/ICSE-2011-StaatsWH11a.html), ICSE 2011
- Krzysztof Cieślak, [The next frontier: agentic collaborative environments](https://www.agenticdays.com/session/1283743-the-next-frontier-agentic-collaborative-environments)，会议摘要；GitHub Next, [Chopin](https://githubnext.com/projects/chopin/)
- Maggie Appleton, [One Developer, Two Dozen Agents, Zero Alignment](https://maggieappleton.com/zero-alignment)
- Zed, [Leveraging Rust and the GPU to render user interfaces at 120 FPS](https://zed.dev/blog/videogame)、[Software Is Made Between Commits](https://zed.dev/blog/introducing-deltadb) 和 [Introducing Delta](https://zed.dev/blog/introducing-delta)
- Susanna Wong, [When Software Stops Being Deterministic](https://www.agenticdays.com/session/1287383-when-software-stops-being-deterministic-rethinking)，会议摘要
- Pini Reznik and Michael Müller, [From Cloud Native to AI Native](https://re-cinq.com/whitepapers)
- Susanna Wong，演讲的结束幻灯片，现场拍摄
- Dan Shapiro, [The Five Levels: from Spicy Autocomplete to the Dark Factory](https://www.danshapiro.com/blog/2026/01/the-five-levels-from-spicy-autocomplete-to-the-software-factory/)
- Simon Willison, [The five levels](https://simonwillison.net/2026/Jan/28/the-five-levels/)
