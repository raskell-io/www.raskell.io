+++
title = "上下文为王：让模型属于你的那一层"
date = 2026-12-01
draft = true
description = "模型是通用的，上下文让它属于你。为什么每个人都会有一层上下文，以及我为自己的智能体构建它时学到了什么。"

[extra]
author = "Raffael"
in_short = [
  "生成式预训练 Transformer 让能力变得通用而廉价；让它对某一个人真正有效的是上下文，而下一次效果与效率的大幅提升正来自这里。",
  "每个与智能体共事的人都会有一层个人上下文，他们交谈的助手有多好，取决于这一层有多好；模型是租来的，所以上下文应当由本人以开放格式拥有。",
  "我为自己的智能体构建的这一层，是一个由 git 中相互链接的 Markdown 笔记组成的小型路由器，每个会话都从它开始，隔离由代码强制执行，唯一的接口是一条命令。",
  "每晚的一次「做梦」对照会话记录来整理它，无需人工审核；这之所以站得住，只因为闸门是机械的，而且每一晚都可以回滚。",
  "Kurumi 是建在这样一层之上的助手，IT Intelligence 则是同一层在整个组织上的版本：无论规模大小，模式都是同一个。",
]
+++

过去几年的大语言模型让能力变得通用。一个生成式预训练 Transformer 读过人类写下的很大一部分东西，几乎在任何领域都能起草、推理、翻译和写代码。那是一场革命。它没有做到的，是让模型知道任何关于你的事：你的项目、你的规则、你已经做过的决定以及原因、与你共事的人、你不想再犯的错误。模型对每个人都一样。凡是让它属于你的东西，都得从别处来。

那个别处就是上下文。我认为这些系统能力的下一大步正来自这里：同一个模型，拿到关于它所服务之人的恰当的两千字节。大多数人低估了这一层。我认为每个与智能体共事的人最终都会有这样一层，而构建我自己的那一层，让我对它的理解超过了任何一篇论文。

## 通用模型与缺失的上下文 {#the-general-model-and-the-missing-context}

通用性是这些模型的天赋，也是它们的缺口。一个几乎什么都能做的模型，并不知道你需要其中哪一件，用哪种风格，在哪些约束之下，带着怎样的历史。每一次与缺少这些知识的助手的会话，都从一个陌生人开始，而你为此付出两次代价：一次在效果上，因为陌生人会猜，有些猜错了；一次在效率上，因为它在做任何有用的事之前，要花 token 和时间重新摸清你的世界。

上下文同时填补这两个缺口。在 [Context Is the Product](/articles/context-is-the-product/) 里我论证过，模型正在变成商品，而上下文不会。在 [Agent Experience](/articles/agent-experience/) 里我把一个智能体需要猜多少，描述为衡量一个系统对它服务得有多好的标准。个人上下文层就是面向一个人的智能体体验：同一个模型，拿到一页简短的说明，写着你是谁、你在构建什么、哪些错误不要重犯，就会少问问题、少猜、少花 token 来熟悉情况，并做出你自己也会做的那种改动。它无需重新训练就变得量身定制。

这门手艺已经有了名字。Andrej Karpathy 的话，经 [Simon Willison 引用](https://simonwillison.net/2025/Jun/27/context-engineering/)，在 2025 年 6 月把上下文工程称为「用恰好合适的信息填满上下文窗口的精妙艺术与科学」。这些信息大多关于任务。个人上下文层是其中关于你的那一部分，也是从一个任务到下一个任务都不会改变的那一部分。

有实测证据表明，一层经过整理的知识能带来单靠搜索带不来的东西。在 [The components of agent memory](https://www.anthropic.com/research/components-of-agent-memory) 中，Anthropic 报告说，当 Claude 同时拥有一个搜索工具和一个它逐渐积累起来的 wiki 时，它的得分「随着 wiki 的增长从 54% 升到 61%，而只能使用搜索工具时为 53%」。搜索找到存在的东西。整理过的一层说明什么重要。

## 每个人，一层上下文 {#every-person-a-context-layer}

我认为几年之内，每个与智能体共事的人都会有类似的东西，而人们与助手互动的方式也会由它塑造。你不会去提示一个模型；你会通过文字或语音，与一个已经了解你的项目、你的承诺和你的工作方式的助手交谈，它会在你的各种工具之间替你行动。大概还会有好几个助手，来自不同的厂商，做不同的工作。让它们属于你、并让它们彼此保持一致的，是它们共同取用的那一层。

重要的问题是这一层归谁所有。今天，记忆大多存在于产品内部。每个智能体工具都保存自己的一份，用自己的格式，一个工具了解到的关于你的东西就留在那里。这很方便，也是一个陷阱：助手对你了解得越多，你就越难离开，你的工作生活也就越多地存放在一个你无法阅读、迁移或更正的地方。另一种选择，是一层属于本人的上下文，以开放格式存放在本人自己的设备上，像代码一样做版本管理，并通过一个小接口提供给本人选择的任何助手。模型是租来的。上下文应当是自己的。

拥有它也意味着构建它，至少目前如此。下面是我如何构建我的那一层，用笼统的说法和简化过的名字，以及我会保留的那些决定。

## 构建一层 {#building-one}

我开启的每一个编程智能体会话，都从一个陌生人开始。智能体在会话中确实学到的东西，按工作目录、按工具分别保存，所以一个智能体在一个仓库里学到的教训，从来到不了下一个仓库里的另一个智能体。有一段时间，我在两个不同智能体工具的指令文件里手工维护同一套规则的两份副本，几天之内它们就各走各路了。于是我建了一个地方，它知道我在做什么、我的规则是什么、我喜欢怎样把事情做完，并且每个智能体会话都从它开始。我叫它我的大脑，因为对我的智能体来说它就是这个。它花了与一个编程智能体的一次长会话，以及与它就设计争论了相当一番。

我一开始提出的要求：

- 放在 git 里的纯 Markdown，相互链接，解析和搜索都很廉价；
- 可以被不止一个智能体工具使用，以后也能被其他工具使用；
- 相互隔离的上下文，比如个人项目和为客户或雇主做的工作，绝不能混在一起；
- 每晚一次「做梦」，整理、质疑并完善这些笔记，无需人工审核；
- 少数几条任何东西都不能推翻的绝对规则，其余一切都可以修改。

在动手构建之前，那个智能体和我几乎在每一条上都有分歧，而正是这些分歧产生了设计。

## 是路由器，不是仓库 {#a-router-not-a-store}

第一版设计想让大脑知道一切。这与加载成本低相冲突，而且会重复已经有归属的信息。经受住考验的版本是一个路由器：笔记保存提炼过的事实和指向，而每个项目自己的文件，它的 README、它的决策记录、它的状态文件，仍然是事实的来源。一个会话加载一个小小的入口页，实际大约 2,600 字节，需要更多时再从那里顺着链接走。

每条笔记是一个只讲一件事的 Markdown 文件：一个项目、一条规则、一个教训、一台机器、一个未决问题。这接近 Andy Matuschak 所说的 [evergreen notes](https://notes.andymatuschak.org/Evergreen_notes)，它们「被写下和组织起来，以便随着时间、跨越项目不断演进、贡献和积累」。区别在于读者：这些笔记首先是写给智能体的，人是第二个读者。前置元数据说明它是什么，以及可以信任它到什么程度：

```markdown
---
id: lesson.verify-before-done
type: lesson
context: core
title: Verify before reporting done
summary: A passing build is not a finished change; look at the result.
status: confirmed
source: person
date: 2026-11-02
---

Screenshots of the page in light, dark and phone width before saying a site
change is done. Applies to every project with a UI; see [[rule.no-unverified-claims]].
```

`status` 把本人说过或确认过的内容，与智能体推断出的内容分开；`source` 说明笔记从哪里来：本人、一次会话、一次导入或一次做梦。这一个区分起了很大作用。智能体可以不经询问就遵循一条已确认的规则，而把一条未确认的规则当作需要核实的提示。

笔记之间用 `[[id]]` 互相链接。一个小编译器把这个文件夹变成两样东西：一份每条笔记一行的索引，给想要浏览的智能体；一个图文件，给任何想要遍历的东西：

```json
{
  "nodes": [
    { "id": "lesson.verify-before-done", "type": "lesson", "status": "confirmed" },
    { "id": "rule.no-unverified-claims", "type": "rule", "status": "confirmed" }
  ],
  "edges": [
    { "from": "lesson.verify-before-done", "to": "rule.no-unverified-claims" }
  ]
}
```

一个 linter 会拒绝失效的链接、未知的类型、长得过大的入口页，以及任何指向另一个上下文的笔记。这个结构有意贴近 Anthropic 为 Claude 自己的记忆所描述的样子：会话记录是事实依据，一个由相互链接的页面组成、每页讲一个主题的 wiki，以及顶上一小层注入的内容，因为「记忆层级的顶层必须保持相对较小」。Claude Code 本着同样的精神让它保持小巧；据同一篇文章，它「只加载前 200 行或 25 KB」的记忆索引到每个会话中。这种层级本身比这些产品都要古老。[MemGPT](https://arxiv.org/abs/2310.08560) 由 Charles Packer 等人在 2023 年提出了「虚拟上下文管理，一种借鉴层级式内存系统的技术」，其灵感来自操作系统：上下文窗口里一小层快的，外加一大层慢的，由智能体按需调入。

## 分开的仓库，和一堵墙 {#separate-repositories-and-a-wall}

用同一个仓库里的文件夹来隔离上下文是行不通的，因为任何能读这个仓库的东西都能读到全部。这个设计改为一个核心仓库，存放对本人在每个上下文中都成立的东西，比如工作风格和通用规则，再为每个上下文各设一个仓库，存放它的项目和教训。一个会话加载核心，外加恰好一个上下文。一个上下文里的笔记可以链接到核心，却根本无法表达指向另一个上下文的链接，因为 id 只在核心和当前上下文之内解析。

这是读取时的隔离。更难的问题是写入时的隔离，也就是有东西离开这台机器的时候。告诉智能体不要混用上下文，是一条指令，而指令大多数时候会被遵守。一个拒绝提交的钩子则是一堵墙。于是这堵墙变成了代码：提交、提交信息和推送上的钩子，以及智能体对外发出的 shell 命令上的一个钩子。每一个都会判断仓库属于哪个上下文，并拦下带有另一个上下文识别性词语的内容、作者身份、提交信息和推送目标。它在出错时选择拒绝，并且在启用之前，在一个一次性仓库里针对九种情况做过测试。

整次会话中最有用的一个小时，来自对已有仓库运行这堵墙的审计。它找到了从来没人找过的东西：一个工具的本地缓存文件被意外提交到一个公开仓库，里面有一个内部账户名；公开文件里的家目录绝对路径，暴露了机器的用户名；一个智能体指令文件，其内容被智能体复制进了各个项目的指令文件。有些修复是普通的提交，有一个需要重写历史，还有一个仓库改成了私有。在依赖历史重写之前，有两个限制值得知道：托管服务商可能让旧提交仍然可以通过哈希访问，而别人拥有的分叉会保持公开。总的教训是，**隔离必须在内容离开机器的地方强制执行，而不是在提示词里**，而且光是为了这次审计，构建这道防线就值得。

同样的想法也适用于规则本身。一小组公理，也就是绝不能改变的东西，用一个哈希锁定文件封存，而封存需要一个交互式终端，所以没有智能体能做到。其余一切，包括我自己定下的规则，都可以被质疑。我起初想让我写下的每一条规则都不受做梦影响，那个智能体反驳了：这太宽，因为它会冻结那些后来证明是错的规则；也太弱，因为一个做梦本身就能编辑的保护什么也保护不了。少数几条公理，机械地封存，其余开放，是更好的答案。

## 一条命令，任何智能体 {#one-command-any-agent}

每个会话都以同样的方式开始。一条命令 `ctx context` 打印出入口页、每条一行的公理、当前上下文的主页，以及当工作目录属于一个已知项目时，该项目的笔记。一个智能体工具从会话启动钩子里运行它；另一个则在它的指令文件里被告知去运行它。第三个工具，或者一个尚不存在的工具，也可以调用同一条命令。`ctx find` 和 `ctx show` 用来查找，`ctx capture "..."` 则追加到一个收件箱。

这是设计中最不起眼的部分，也是我会最先照搬的部分。通过一条打印文本的命令来集成，让每个使用方都不必知道大脑是怎样存储的。笔记可以搬家，格式可以改变，图的下面可以长出一个数据库，而任何智能体的配置都不用改。它是[可读性阶梯](/articles/agent-experience/#the-legibility-ladder)第二级上的一份稳定契约，这意味着大脑不被绑定在任何一家智能体厂商身上。

## 做梦 {#dreaming}

让大脑成长的部分，是每晚的一次整理，我叫它做梦，因为 Anthropic 和其他人也这么叫。让我的笔记做梦这个想法，来自 Helvetia 的同事 [Joachim Prinzbach](https://www.linkedin.com/in/joachimprinzbach/)，他在 Anthropic 发表关于智能体记忆的文章之前就给我看过；这个故事的简短版本在 [Memory that dreams](/notes/memory-that-dreams/) 里。这个想法来自人们对人类记忆运作方式的理解：在睡眠和安静休息时，「海马体会重放我们最近的经历」，其中一部分会被提炼为持久的知识（Anthropic）。智能体版本的历史不长。[Generative Agents](https://arxiv.org/abs/2304.03442) 由 Joon Sung Park 等人在 2023 年提出，它为每个模拟角色保存完整的经历记录，并让它「随着时间把这些记忆综合为更高层次的反思」。Letta 在 2025 年 4 月提出了 [sleep-time compute](https://www.letta.com/blog/sleep-time-compute)，论文作者为 Kevin Lin、Charlie Snell 等人，让智能体「利用空闲时间重新组织信息」。而 Anthropic 在 2026 年 5 月以研究预览的形式推出了 [Claude Managed Agents 中的做梦功能](https://claude.com/blog/new-in-claude-managed-agents)。

每晚，对每个上下文分别进行：

{% diagram(title="One night of dreaming, for one context") %}
  step            what happens
  ──────────────  ───────────────────────────────────────────────────────────
  1 harvest       session transcripts (text only, capped), new inbox entries,
                  the tools' own memory files, notes written by hand in Kurumi
                          │
                          ▼
  2 consolidate   a headless model, run in this context's repository:
                  test the notes against the transcripts; correct, merge
                  and prune; record what lasts; raise conflicts as open
                  questions; write a short journal of what changed
                          │
                          ▼
  3 gate          touched a protected path?  linter fails?  hook refuses?
                          │
                 yes ─────┴───── no
                  │               │
                  ▼               ▼
            discard the     commit and push:
            whole run       one dream, one commit
{% end %}

闸门是让这件事在没有人审核的情况下也站得住的原因。会话记录是事实依据，从不被编辑。受保护的路径，包括公理、上下文登记表、工具本身、钩子和做梦自己的提示词，都不能被触碰；一次触碰了其中任何一个的运行会被整个丢弃。linter 和提交钩子对做梦一视同仁，就像对待任何其他写入者。而且因为一次做梦就是一次提交，任何一晚都可以用一条命令回滚。当闸门是机械的、撤销的代价很低时，无人审核的自动化是合理的；当唯一的闸门是模型自己的判断时，它就是鲁莽的。

第一次真正的运行花了大约三分钟。它读了三个会话和各个工具自己的记忆文件，提交了十三个文件。它更正了我为了给大脑打底而手写的笔记里一个过时的说法。它把一个智能体工具写进自己私有记忆里的规则，变成了另一个工具也能看到的笔记。它还提出了一个未决问题，关于我的两个互相拉扯的立场，这正是我希望第二大脑做的事，也是我自己绝不会写下来的东西。

Anthropic 的文章里有一个很好的例子，说明为什么会话记录作为事实依据很重要。在一个游戏的长时间运行中，一条记忆笔记记错了 Claude 需要去的一个地方的位置，而做梦「把这条笔记与会话记录对照，发现了错误，并重写了它」。有了更正后的笔记，Claude 一路向前；用着未更正的笔记，它「三次退回到那条先前的路线上」。一份从不与实际发生的事对照的记忆不会保持中立。它会漂移，而智能体会跟着它走。

## Kurumi：建在这一层之上的助手 {#kurumi-the-assistant-on-top-of-the-layer}

一层只有智能体能读的上下文，会离它所描述的那个人越来越远，所以我自己也需要能舒服地阅读和更正它。我在 [Kurumi](https://kurumi.raskell.io) 里做这件事，它是我开发的本地优先笔记应用，而在个人上下文层之上建一个个人助手这个想法，也是在 Kurumi 里走得最远。

Kurumi 把数据保存在自己的数据库里，但它可以同步一个本地的 Markdown 文件夹，并把改动读回来。大脑并不让 Kurumi 直接指向它的笔记。一条命令 `ctx mirror` 用 Kurumi 自己的格式写出一份单向副本，每个上下文一个库。链接从 id 改写为标题，因为 Kurumi 按标题解析链接。做梦提出的未决问题变成 Kurumi 自己的问题记录，项目笔记变成它的项目记录，这样它们就出现在我本来就在跟踪问题和项目的地方。每晚的日志变成一条笔记，所以「昨晚改了什么」是我配着咖啡读的东西。一条离开大脑的笔记会被标记为已删除，而不是直接移除，因为 Kurumi 会恢复那些凭空消失的文件。而我在 Kurumi 里写下的任何东西，都会被下一次做梦当作我自己的话收进来，带着 `source: person`。

Kurumi 早已从人的一侧在做同样的事。它内置的智能体保存着一条叫「Kurumi memory」的笔记，每次对话开始时都会读，任何人都可以打开并编辑它，这正是上面所说的那种一小层注入内容。当你问它关于某个人或某个项目的事，它会沿着链接，双向地走过你的笔记，找到附在上面的待办、决定和未决问题，并用一张小图展示它走过的路径。还有一种「living note」，会根据它所在主题的笔记重写自己，最多每六小时一次，并带有指回每个来源的链接，这就是单页规模上的做梦。

这个镜像只是权宜之计。正式的版本是我已经开始做的一个 Kurumi 功能：一个链接文件夹库，直接打开大脑的文件，逐字节保留它们外来的前置元数据，按一个可配置的键解析链接，并用内容哈希守护每一次写入。第一部分，即 Kurumi 存储之后的只读链接库，已经在一个分支上；其余部分还在进行中。

## 同一层，面向整个公司 {#the-same-layer-for-a-whole-company}

在 [IT Intelligence](/articles/it-intelligence/) 和它的[参考实现](/articles/building-it-intelligence/)里，我描述过一个面向整个组织 IT 版图的知识层。个人上下文层是同一个模式，只是规模缩小到一个人：

| | IT Intelligence，面向一个组织 | 上下文层，面向一个人 |
|---|---|---|
| 原始材料 | 每个系统的导出和 API | 会话记录、收件箱、手写笔记 |
| 保存什么 | 实体和边，带有依据、置信度和来源 | 每个实体一条笔记，带有状态和来源 |
| 事实来源 | 每个记录系统 | 每个项目自己的文件 |
| 整理 | 按计划进行摄取、判断、构建和评分 | 每晚的做梦 |
| 人审阅什么 | 一个待确认的不确定链接队列 | 做梦提出的未决问题 |
| 智能体怎么读 | 一个给出简短答案和来源信息的 MCP 服务器 | 一条打印出一小页的命令 |
| 人怎么读 | 一个带有实体页面和图的网页界面 | Kurumi |
| 绝不能发生什么 | 一个推断出的链接被悄悄提升为事实 | 一个上下文的内容出现在另一个的仓库里 |

两种情况下，设计都建立在同样几条决定之上：把来源说了什么与得出了什么结论分开，说明每个事实可以信任到什么程度，让机器在不依赖其自身判断的闸门之下完成整理，给智能体一个小而稳定的入口，再给人一个可读的、同一份东西的视图。这个平行关系不是我计划的。它之所以出现，是因为问题是同一个：一个通用模型被丢进一个具体的世界，需要一张它能信任的、关于那个世界的地图。

## 值得照搬的 {#what-to-copy}

如果你想构建自己的那一层，这些是我会保留的决定，按它们的重要程度排列：

- **是路由器，不是仓库。** 指向真正来源的小笔记，以及一个小入口页。
- **每个实体一条笔记，带状态和来源。** 已确认的和推断出的是不同种类的知识；把它们标出来。
- **以 id 作链接，编译成索引和图。** 浏览廉价，遍历廉价，由 linter 检查。
- **一条命令作为唯一接口。** 每个智能体工具都调用它，没有一个知道笔记是怎样存储的。
- **隔离写成代码。** 不能混用的上下文用分开的仓库，再加上拒绝不该外流之物的钩子。
- **少数公理，手工封存。** 其余一切都可以修改。
- **带机械闸门的整理。** 会话记录作为事实依据，受保护的路径，一个 linter，每次运行一次可回滚的提交。
- **同一份笔记的人类视图。** 如果你不能舒服地阅读和更正你的上下文层，它就会离你越来越远。

## 尚未证明的 {#what-is-not-proven-yet}

这是一个能工作的系统，但还很年轻。第一次做梦是手动运行的，只针对一个上下文。此后，定时任务已经在凌晨三点半自行做梦，针对每个上下文，在它的第一周里有四个晚上，而两个智能体工具都从同一条命令开始它们的会话。一周还算不上可靠的记录。Kurumi 镜像最初是对照 Kurumi 的代码，也就是它的解析器、链接解析器和记录读取器来检查的，此后也已经在运行中的应用里试过了。将取代它的链接文件夹库，在一个分支上有单元测试，仅此而已。几个月的夜晚之后，我会写一写它表现如何。

## 模型是租来的 {#the-model-is-rented}

模型会越来越好，而每个人拥有的都是同样的模型。不同的，是每个模型对它所服务的那个人或那家公司知道多少。这种知识不随模型而来，也不必被锁在某个厂商的产品里，而且开始并不难：一个相互链接的笔记文件夹，一条打印出正确页面的命令，以及几道你可以信任的闸门。上下文是把一个通用模型变成你的助手的东西，也是你可以拥有的那一部分。

## 参考资料 {#references}

- Lance Martin, [The components of agent memory](https://www.anthropic.com/research/components-of-agent-memory), Anthropic, 6 November 2026.
- Anthropic, [New in Claude Managed Agents: dreaming, outcomes, and multiagent orchestration](https://claude.com/blog/new-in-claude-managed-agents), 19 May 2026.
- Letta, [Sleep-time Compute](https://www.letta.com/blog/sleep-time-compute), 21 April 2025.
- Kevin Lin, Charlie Snell, Yu Wang, Charles Packer, Sarah Wooders, Ion Stoica, and Joseph E. Gonzalez, *Sleep-time compute: Beyond inference scaling at test-time*, arXiv:2504.13171, 2025, as cited in the Letta post.
- Charles Packer, Sarah Wooders, Kevin Lin, Vivian Fang, Shishir G. Patil, Ion Stoica, and Joseph E. Gonzalez, [MemGPT: Towards LLMs as Operating Systems](https://arxiv.org/abs/2310.08560), arXiv:2310.08560, 2023.
- Joon Sung Park, Joseph C. O'Brien, Carrie J. Cai, Meredith Ringel Morris, Percy Liang, and Michael S. Bernstein, [Generative Agents: Interactive Simulacra of Human Behavior](https://arxiv.org/abs/2304.03442), arXiv:2304.03442, 2023.
- Simon Willison, [Context engineering](https://simonwillison.net/2025/Jun/27/context-engineering/), simonwillison.net, 27 June 2025, quoting Andrej Karpathy.
- Andy Matuschak, [Evergreen notes](https://notes.andymatuschak.org/Evergreen_notes), Andy's working notes.
- [Kurumi](https://kurumi.raskell.io), a local-first second brain, and its [documentation on AI and the agent](https://github.com/raskell-io/kurumi/blob/main/docs/ai.md).
- Raffael Schneider, [Memory that dreams](/notes/memory-that-dreams/), [Context Is the Product](/articles/context-is-the-product/), [Agent Experience](/articles/agent-experience/), [IT Intelligence](/articles/it-intelligence/) and [Building IT Intelligence](/articles/building-it-intelligence/).
