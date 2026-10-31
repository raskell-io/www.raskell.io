+++
title = "IT 智能：企业 IT 缺失的数据层"
date = 2026-11-02
draft = true
description = "商业智能告诉一家公司它是怎么做生意的，却没有什么告诉它，它的 IT 是怎么拼在一起的。我为什么开始构建一个 Enterprise Context Platform。"

[extra]
author = "Raffael"
image = "it-intelligence.avif"
cover = "covers/it-intelligence.avif"
reads = ["enterprise-architecture-as-strategy", "seeing-like-a-state"]
in_short = [
  "企业建起了商业智能来了解自己怎么卖东西，却无法低成本地回答：自己有哪些 IT，归谁负责，彼此如何连接。我把这个缺失的层称为 IT 智能。",
  "事实分散在各自独立的记录系统里，而它们之间的知识，消失在部落知识和知识孤岛之中；关于默会知识、信息政治和知识隐藏的研究，有助于解释这一点。",
  "我正在构建的 Enterprise Context Platform 摄取每一个来源，为其准确性打分，再把它解析成一个由实体构成的本体，带有出处和置信度，通过 Web 界面、REST 和 MCP 对外提供。",
  "IT 上下文应当默认开放，并建立在开源之上：缺少上下文的智能体探索代价高昂、重复劳动、只能靠猜，而一个共享的模型能把反复的重新发现变成一次查询。",
  "随着智能体写下越来越多的代码，工作上移到一个新的抽象层级，那些围绕稀缺实现能力搭建起来的组织会成为下一个瓶颈，不得不改变形态。",
]
+++

问一家大公司上个季度在德国卖出了多少份保险，几秒钟就能得到答案，还附带图表、趋势线和按渠道的拆分。再问同一家公司：哪些应用处理客户的健康数据，归谁负责，跑在哪些集群上，其中哪些已经在调用语言模型？你得到的是一场会议，然后是一张电子表格，然后是第二场会议，因为那张表格和 CMDB 对不上。

企业花了三十年构建商业智能，却从未为自己的 IT 构建过对应的东西。我开始把这个缺失的东西称为 **IT 智能**（**IT Intelligence**），把提供它的平台称为 **Enterprise Context Platform**（企业上下文平台）。

## 让这个缺口显现出来的那份工作 {#the-job-that-made-the-gap-visible}

过去一段时间，我在一家瑞士金融集团担任面向智能体 AI 和 AI 平台的企业解决方案架构师（Enterprise Solution Architect）。这家集团既有庞大的保险业务，也有一家银行，通过十多个市场单元运营。我的任务是协调一致：确保所有这些市场单元的解决方案架构指令、政策和设计，正确地诠释了企业架构所定义的能力，而这些能力又是从公司战略推导出来的。

纸面上，这是一条干净的链条。

{% diagram(title="The chain as it is drawn") %}
   ┌──────────────────────────┐
   │ corporate strategy       │
   └─────────────┬────────────┘
                 ▼
   ┌──────────────────────────┐
   │ enterprise architecture  │  capabilities, principles, target landscape
   └─────────────┬────────────┘
                 ▼
   ┌──────────────────────────┐
   │ solution architecture    │  directives, policies, reference designs
   └─────────────┬────────────┘
                 ▼
   ┌──────────────────────────┐
   │ 10+ market units         │  actual systems, actual teams, actual budgets
   └──────────────────────────┘
{% end %}

实际上，每一个箭头都是一次翻译，由人在文档里完成，速度各不相同：战略一年一变，能力地图在有人得空时才更新，解决方案设计按项目来，而系统本身每天都在变。等到一项能力被十个市场单元诠释过一遍，你就有了十种诠释，却没有任何低成本的办法看出它们在哪里分道扬镳。

知道「好」是什么样子，是这份工作里容易的部分；知道实际上有什么，才是难的部分。每一次评审都从考古开始：存在哪些应用，它们用了哪些平台服务，归哪个团队负责，EA 仓库里的条目是否仍然和代码仓库对得上，代码仓库是否仍然和集群上运行的东西对得上。

最近我换了一个更契合这个问题的角色。我现在是集团 AI 架构师（Group AI Architect），在 AI 与数据部门内部工作，目标与之前相似：让 AI 在每个市场单元都得到协调一致的使用。区别在于，我现在坐在数据和平台旁边，而不是从外部评审它们。正是这一点，让我得以开始构建那个我一直希望存在的东西。

## 我以前造过一个小的 {#i-built-a-small-one-before}

在成为企业解决方案架构师之前，我是集团 Web 服务交付平台的平台工程师和解决方案架构师。这个平台包括 WAF、CDN，以及一批负责流量整形的入口代理，它们共同为公司暴露给内部边界和互联网的一切，提供 Web 安全和 Web 交付能力。

那个团队是个尝试新东西的好地方。其中之一是用 AI 辅助整理 WAF 规则，我和同事 Milan Duric 在 RSAC 2026 上做了这个分享。给安全圈以外的读者介绍一下：RSAC 原名 RSA Conference，是世界上最大的安全会议之一，每年春天在旧金山的 Moscone Center 举行。2026 年那一届吸引了四万多人。除了从业者、研究者和 CISO，它的舞台上也常有来自硅谷、政府，有时还有好莱坞的知名人物。此前我参加过两次，分别在 2024 年和 2025 年，第三次能作为演讲者出现在议程上，是一件让我暗自自豪的事。我们的演讲是 [Self-Learning WAF: Using Generative AI to Tame ModSecurity False Positives](https://path.rsaconference.com/flow/rsac/us26/FullAgenda/page/catalog/session/1753946922633001YdMq)。关于这次会议本身，我写在了 [RSAC 2026 笔记](/articles/notes-from-rsac-2026/)里。

另一个尝试，回头看，就是一个小型的 Enterprise Context Platform，范围限于一个小队的职责。问题和这篇文章讨论的是同一个，只是规模更小。应用团队想知道：他们的 Web 服务是如何暴露的，哪些 WAF 规则作用于它们，前面的 CDN 表现如何，它们的 DNS 记录实际上做了什么。答案分散在代理、WAF、CDN 供应商的控制台和 DNS 里，而提问的团队对这些一样都没有访问权限。于是他们来问我们，我们每周有很大一部分时间花在回答问题和手工执行变更上。

我把这个小队领域里的每一种数据结构都形式化成了一份 **manifest**（清单）：一种声明式的、持久化在 Git 里的描述，描述一次暴露、一条 WAF 策略、一份 CDN 配置、一条 DNS 记录，以及它们之间的关系。在这些清单之上有三层：

{% diagram(title="The web delivery self-service, one squad's scope") %}
   ┌──────────────────────────┐
   │ Next.js frontend         │  self-service portal: see what is
   │                          │  exposed and how, order changes
   └─────────────┬────────────┘
                 ▼
   ┌──────────────────────────┐
   │ Go API backend           │  control plane: validates requests,
   │                          │  starts workflows
   └─────────────┬────────────┘
                 ▼
   ┌──────────────────────────┐
   │ Temporal workflows       │  create, adjust and remove resources,
   │                          │  do the operator work
   └──────┬────────────┬──────┘
          ▼            ▼
    manifests in Git    WAF, CDN, ingress proxies, DNS
    (source of truth)
{% end %}

门户是清单之上的一层外观。一个团队可以查到自己的服务，在一个地方看到：它通过哪个边界可达，哪些 WAF 规则适用，CDN 如何缓存和转发，哪些 DNS 记录指向哪里，完全不需要在 CDN 供应商那里开账号。想要变更时，他们在门户里下单。Go 后端充当控制平面，校验请求并启动一个 Temporal 工作流，工作流做的正是过去人工运维做的事：更新 Git 里的清单，把变更应用到 WAF、CDN、代理和 DNS 上，检查结果，必要时回滚。随着时间推移，这些工作流接管了过去需要专职运维人员承担的几乎全部运维工作。

Milan 和我已经把这套系统作为演讲提交给了 RSAC 2027 的演讲征集。

它留下的三条经验，直接延续到了这篇文章讨论的平台上。把数据形式化是困难的部分，也是有价值的部分；一旦清单存在，门户和工作流就很容易了。让所有人都能读到数据，使大多数问题在被提出之前就消失了。而一旦数据值得信赖，自动化几乎会自己跟上。Enterprise Context Platform 是同一个赌注，只是范围大得多，野心也大得多：不是一个小队的职责，而是整个集团的 IT 版图。

## 商业智能有一个没人造出来的孪生兄弟 {#business-intelligence-has-a-twin-nobody-built}

商业智能之所以行得通，靠的是一套乏味而成熟的架构：业务系统产生数据，管道把数据抽取出来，数据仓库把它建模成事实和维度，分析师和仪表盘查询这个模型。没有人会主张一份销售报告应该靠给十二个区域财务主管发邮件来拼凑。

IT 拥有全部的业务系统，却没有其余的任何部分。数据就在那里，散落在各个记录系统中，每个系统只知道其中一片：

| 系统 | 典型例子 | 它知道什么 | 它不知道什么 |
|---|---|---|---|
| EA 仓库（应用组合） | Ardoq, LeanIX | 应用、能力、业务归属、生命周期 | 这个应用是否仍以那种形态存在 |
| 数据治理目录 | Alation, Collibra, Microsoft Purview | 数据域、数据所有者、分类、血缘 | 实际上是哪个运行时在接触这些数据 |
| IT 服务管理与 CMDB | Jira Service Management, ServiceNow | 服务、配置项、事件、变更 | 它们背后的架构意图 |
| 源代码平台（git 托管） | Bitbucket, GitHub, GitLab | 仓库、团队、代码、依赖、活跃度 | 一个仓库属于哪个应用 |
| 容器平台 | AKS, EKS, OpenShift | 集群、命名空间、工作负载、镜像 | 谁对一个命名空间负责 |
| 可观测性平台 | Datadog, Dynatrace, Grafana | 仪表盘、告警、人们实际在盯着什么 | 这些指标对业务意味着什么 |
| 内部平台服务 | 集成平台或消息代理、WAF、API 网关、CDN | 集成流程、WAF 规则、API 暴露、CDN 配置 | 一个请求端到端经过的路径 |

这些例子是各类别里的常见产品，按字母顺序排列；大多数大公司每一行都用着一两个，具体用哪个并不改变论点。

每一行都是某人在某件事上的事实来源（source of truth），但没有哪一行能单独回答架构师的问题。架构师真正提出的问题，会同时跨越三四行：「市场单元 X 里，哪些面向客户的应用通过网关暴露了 API 却没有 WAF 策略，它们归谁负责？」

这个问题是有答案的，但答案存在于各行之间的连接里，而今天，这些连接存在于人们的脑子里。

## 部落知识与知识孤岛 {#tribal-knowledge-and-knowledge-silos}

一个拥有十多个市场单元的集团，每个单元都有自己的平台、小队，有时还有相互竞争的服务，它会以两种截然不同的方式丢失知识。把两者分开很有帮助，因为它们需要不同的解法。两者背后都有几十年的研究，而这些研究比常见的管理口号有用得多。

### 部落知识：从未被写下来的东西 {#tribal-knowledge-what-was-never-written-down}

**部落知识**（tribal knowledge）是从未被写下来的知识。哪个团队真正在运行那个老旧的集成枢纽。为什么两个应用共用一个数据库。某个市场单元的网关悄悄地经由另一个单元路由。它并不是被刻意藏起来的；只是从来没有人把它变成文字，更不用说变成结构化数据。它存在于少数几个人身上，他们一走，它也就跟着走了。

哲学家 Michael Polanyi 在《默会维度》（*The Tacit Dimension*）中为这一底层现象给出了经典表述：「我们所知道的，多于我们能说出的。」一位经验丰富的工程师对一片 IT 版图的了解，有一部分在这个严格意义上是默会的。他们早在能说清原因之前，就能认出一个设计行不通。野中郁次郎（Ikujiro Nonaka）和竹内弘高（Hirotaka Takeuchi）围绕这类知识的转化建立了一个组织学习模型，即 SECI 模型，并把从默会到显性的那一步称为*外化*（externalisation）。他们的批评者指出，许多默会知识根本无法编码，我认为双方都有道理。IT 里很多被当作部落知识的东西，其实根本谈不上深层的默会。它们是显性知识，只是从来没有人被要求把它写下来，因为没有地方可写。谁拥有一个命名空间，完全是说得出来的；只不过哪里都没有记录。

James C. Scott 补上了警告。他在《国家的视角》（*Seeing Like a State*）中描述了 *mētis*，即通过长期经验获得的实践知识，并展示了那些试图让复杂系统从上方变得清晰可读的方案，往往恰恰摧毁了这种知识，因为简化的地图被当成了疆域本身。任何承诺让一家公司对自己变得清晰可读的平台，都应当严肃对待这一点。Context Model 永远不会包含运行一个系统的人所知道的一切，也不应假装如此。它能做的，是让显性的那部分变得廉价，并指向掌握其余部分的人。

这第二项工作也有名字。Daniel Wegner 的*交互记忆*（transactive memory）理论描述了群体如何记忆：不需要每个人都知道一切，只要每个人都知道*谁知道什么*。小团队会自然地建立起这样一份目录。一个跨越十个市场单元、成千上万人的集团做不到，而这正是部落知识从一个怪癖变成一种风险的地方。软件工程直接测量这种风险的一个版本，称为*卡车因子*（truck factor）：需要离开多少人，一个项目才会停滞。Avelino 及其同事为 GitHub 上 133 个流行的开源项目估算了这个数字，发现 65% 的项目卡车因子不超过二。没有理由相信企业内部的代码会更好，而由于 Context Model 本来就读取提交历史，它可以为集团里的每一个应用计算出卡车因子。

### 知识孤岛：写下来了，却够不着 {#knowledge-silos-written-down-but-out-of-reach}

**知识孤岛**是相反的问题。知识被形式化了，也被持久化在某处，在某个工具、某张电子表格、某个 wiki 空间里，但需要它的人并不能方便地获取。这种抱怨有一句著名的话：「要是 HP 知道 HP 知道些什么就好了」，通常被归于惠普前 CEO Lew Platt，不过 Carl Sieloff 把这句话追溯到 1980 年代，那时它已经是公司内部一句常见的抱怨。

孤岛有时是意外，有时是刻意的。根据我见过的情况，我自己对原因的猜测是以下几种的某种混合：

- **把访问控制当作条件反射。** 在一家受监管的公司里，「谁能读这个？」的默认答案是「越少越好」，而这个答案被套用到关于系统的元数据上，仿佛那是客户数据。
- **按席位计价的许可证。** 如果 EA 仓库或数据目录的每一位读者都要花一份许可证，那么阅读就成了一个预算决策。
- **把知识当作筹码。** 一个唯一能回答某个问题的团队，就是一个会被邀请开会、能保住编制、能为预算找到理由的团队。
- **害怕暴露。** 开放的清单会显示出技术债、重复建设的平台和影子 IT。不是每个人都乐意让这些被看见。
- **没有接口。** 数据躺在一个没有 API 的遗留工具里，导出物是某人每季度手工做出来的一张电子表格。
- **单元之间的竞争。** 当两个小队提供相互重叠的平台时，让自己的版图透明，可能感觉像是在给对方递论据。

文献支持其中一些猜测，也让另一些变得更复杂。Thomas Davenport、Robert Eccles 和 Laurence Prusak 研究了二十五家以上公司的信息管理，并在 1992 年以「Information Politics」（信息政治）为题发表了结果。他们观察到，信息技术本应使层级扁平化、让信息自由流动，却常常适得其反：一旦信息成了组织里的通货，管理者就觉得它太宝贵，舍不得给出去。他们发现的最常见的安排，被他们称为*信息封建主义*（information feudalism）：每个部门控制着自己的信息如何被收集、存储和共享。三十年后，每个部门都运行着自己的 SaaS 工具，这个描述依然十分贴切。

Catherine Connelly 及其同事更进一步，研究了*知识隐藏*（knowledge hiding），也就是刻意不提供别人索要的知识。他们发现了三种形式：推脱隐藏（承诺给出一个永远不会来的答案，或只给出部分答案）、装傻，以及合理化隐藏（解释为什么这些信息不能共享）。不信任对这三种形式都有预测作用，而在鼓励分享的氛围中，推脱隐藏较少见。研究发表时，其中一位作者直截了当地说出了实际结论：没有信任的氛围，软件再好也没用，人们就是不会去用它。

Gabriel Szulanski 关于企业内部最佳实践转移的研究，是对我那份愤世嫉俗的清单的有益平衡。他考察了八家公司的 122 次转移，发现让知识具有「粘性」的，主要不是动机。主要障碍与知识本身有关：接收单元缺乏吸收它的能力，没有人完全理解这种做法为什么有效，来源方和接收方之间的关系艰难。许多孤岛只是很难用，这让它们既是一个政治问题，也同样是一个设计问题。

Morten Hansen 补充了一个我认为对这个平台至关重要的区分。在一项针对 120 个产品开发项目的研究中，他表明，跨单元的弱联系有助于团队在别处*找到*有用的知识，但转移复杂知识需要相关人员之间的强联系。他称之为搜索与转移问题（search-transfer problem）。Context Model 是一台用于搜索的机器。它可以告诉一个市场单元的工程师，他们需要的平台已经在另一个单元存在，以及由谁在运行。它无法转移运行它的经验。那仍然需要一场对话。

最后，组织里的孤岛会变成版图里的孤岛。Melvin Conway 在 1968 年观察到，设计系统的组织，其产出的设计必然复制自身的沟通结构。十个彼此不沟通的市场单元，会建出十个彼此不沟通的集成平台。Matthew Skelton 和 Manuel Pais 在《Team Topologies》中把这一点倒转过来，提出「逆康威策略」（inverse Conway manoeuvre）：按照你想要的架构来设计团队结构。可如果不先看清你现有的架构，就做不好这件事。人类学家出身、后来成为财经记者的 Gillian Tett 在《谷仓效应》（*The Silo Effect*）中提出了更广泛的论点：孤岛是专业知识和专业化的副作用，而不仅仅是恶意的产物，管理孤岛最好的组织，是那些刻意建立起跨越孤岛观察的方法的组织。

### 平台对此能做什么，不能做什么 {#what-the-platform-can-and-cannot-do-about-it}

| 现象 | 研究怎么说 | Context Model 做什么 | 它不能做什么 |
|---|---|---|---|
| 默会知识 | 有些知识无法言说（Polanyi），清晰可读化的方案可能摧毁实践知识（Scott） | 记录能被显性化的部分，链接到知道其余部分的人 | 捕捉判断力和经验 |
| 未被记录的显性知识 | 外化需要一个地方和一种格式（Nonaka 和 Takeuchi） | 给每一个事实一个位置、一个所有者和一个出处 | 让人们把它写下来 |
| 集中的知识 | 群体依赖于知道谁知道什么（Wegner）；卡车因子很低（Avelino 等） | 把「谁知道什么」的目录显性化，按应用计算卡车因子 | 传播知识本身 |
| 信息封建主义与知识隐藏 | 信息是通货，隐藏随不信任而增长（Davenport 等，Connelly 等） | 让阅读成为默认，让隐藏作为例外变得可见 | 单凭自己建立信任 |
| 知识粘性 | 障碍主要是吸收能力和因果模糊（Szulanski） | 降低找到和理解上下文的成本 | 取代学习 |
| 搜索与转移 | 弱联系负责找到，强联系负责转移（Hansen） | 解决搜索问题，覆盖所有市场单元 | 取代转移复杂知识的那场对话 |
| 组织孤岛塑造系统 | 系统映照沟通结构（Conway） | 如实展示版图，让团队设计可以有意为之 | 对任何人进行重组 |

最后一列和第三列同样重要。Jeffrey Pfeffer 和 Robert Sutton 把这种普遍的失败称为*知行差距*（knowing-doing gap）：组织常常知道该做什么，却依然不去做。一张开放的版图地图弥合的是「知」的那部分。「行」仍然是激励、归属和领导力的问题，这也是为什么这个平台围绕贡献和权威来设计，程度不亚于围绕数据。

这两个问题在架构师那里产生的是同一个症状：知道有什么的成本高于猜测的成本，于是人们去猜。决策基于片面的图景做出，平台被重复建设，协调一致变成了一连串谈判，而不是一连串查询。

## 把问题说清楚 {#the-problem-stated-plainly}

**一家大公司无法低成本、可靠地回答关于它自己 IT 的问题。** 我指的是关于现状的朴素问题，而不是关于未来的难题。存在什么，归谁负责，如何连接，用来做什么，以及它是否符合战略所说的应有样子。

其余一切都源于这一个缺口。战略抵达系统时已经迟了，也走了样，因为不立一个项目，就没有人能对照战略检查系统。平台被建了两遍，因为建第二个的团队找不到第一个。架构评审把时间花在重建现状上，而不是评判提案。运维团队每周回答同样的问题，因为答案不在任何一个人能查到的地方。而那些存在于人脑中、或藏在某人访问策略背后的知识，悄悄地决定了一项决策究竟会考虑哪些选项。

智能体让这件事变得紧迫。一家给每位工程师都配上编程智能体、并在交付管道里运行智能体工厂的公司，即将成倍增加对其 IT 做出决策的行动者数量，而每一个行动者都从零上下文开始。缺少企业上下文的智能体，做的正是缺少上下文的人所做的事，只是更快：它们猜测，它们重复，它们构建早已存在的东西。另一种选择，是给它们以及它们周围的人一个地方，在那里，公司 IT 的现状是已知的、值得信赖的、开放可读的。

那么目标就是：让企业 IT 的现状变得廉价可知，可信到足以据此行动，并向每一个在其上构建的人和智能体开放。

## 一个问题，三种尺度 {#one-problem-three-scales}

回头看，我多年来一直在处理同一个问题，尺度不断变大，直到最近才给它起了名字。

| 角色 | 范围 | 没人能低成本回答的问题 | 我构建或做了什么 |
|---|---|---|---|
| 平台工程师和解决方案架构师，Web 服务交付 | 一个小队的职责：WAF、CDN、入口代理、DNS | 我的 Web 服务是如何暴露和受保护的？ | Git 里的清单、一个自助服务门户、承担运维工作的 Temporal 工作流 |
| 企业解决方案架构师，智能体 AI 与 AI 平台 | 跨越十多个市场单元的解决方案架构 | 我们构建的东西是否符合企业架构和战略的意图？ | 评审、指令和参考设计，每一次都从考古开始 |
| 集团 AI 架构师，AI 与数据 | 整个集团的 IT 版图 | 存在什么，它们如何拼在一起，我们应该改变什么？ | Enterprise Context Platform |

每一步都在重复同一个模式。先要把数据形式化，然后要让所有人都能读到它，只有在那之后，才能在其上实现自动化，无论是靠工作流还是靠智能体。在 Web 交付小队里，这个模式奏效了。在企业解决方案架构师的角色里，它的缺失是这份工作的主要成本。Enterprise Context Platform 是把它应用到整个公司的尝试。

它也和我在这里写过的东西相连。[上下文就是产品](/articles/context-is-the-product/)和[智能体平台手册](/articles/what-an-agent-actually-is/)的其余部分主张，在单个仓库的尺度上，智能体读到的上下文比它所运行的模型更重要。[记忆是一条写入路径](/articles/memory-is-a-write-path/)讨论的是上下文如何被安全地写回，这和一个数据集如何成为一手来源是同一个问题。关于[企业上下文仓库](/notes/the-enterprise-context-warehouse/)的笔记，在我动手构建任何东西之前，就在公司尺度上勾勒了这个想法。而这个网站本身就是同一件事的玩具版本：每一页都会再为机器发布一次，正如[这个网站正在变成一张地图](/articles/this-site-is-becoming-a-map/)里所描述的。Enterprise Context Platform 是这些线索在生产环境中交汇的地方。

## 我所说的 Enterprise Context Platform 是什么 {#what-i-mean-by-an-enterprise-context-platform}

EA 仓库是对版图的一份精心整理的描述，由架构师为架构师维护。Enterprise Context Platform 则是一个数据层，覆盖 IT 部门内部发生的一切：构建了什么，部署了什么，暴露了什么，改变了什么，坏了什么，被监控着什么，归谁所有，做出了什么决定，在它发生的时候，从它发生的系统里获取。EA 仓库是它的来源之一，架构师是它的用户之一；而它的主要消费者，越来越多地是智能体。

我开始构建的这个平台有三层，中间那层才是重点。

{% diagram(title="Enterprise Context Platform") %}
   SOURCES                 CONTEXT MODEL              SURFACES
   EA repository ─────┐
   data catalogue ────┤    ┌────────────────────┐
   ITSM and CMDB ─────┤    │ entities           │ ──▶ Web UI
   source code ───────┼──▶ │ relationships      │ ──▶ REST API
   container platform ┤    │ provenance         │ ──▶ MCP, for agents
   observability ─────┤    │ confidence         │
   integration ───────┤    └─────────┬──────────┘
   WAF and exposure ──┤              ▼
   CDN ───────────────┘     analytics over the model
            ingest                   ▼
                            artifacts: analyses, business
                            cases, diagrams, ADRs
{% end %}

**摄取。** 每个来源都有一个连接器。其中一部分是静态且确定的：容器平台上的命名空间就是命名空间，源代码平台上的团队就是团队，EA 仓库里的应用有一个 ID。另一部分则需要帮助。把一个名为 `pol-adm-svc-v2` 的仓库映射到 EA 仓库里的应用「Policy Administration」，是一个需要判断的决定，而摄取正是在这里由 AI 辅助的：模型根据名称、README、所有者、部署标签和描述提出这条链接，并记录它有多大把握以及理由。

摄取层还会为每个来源的每个数据集的准确性打分。并不是每个记录系统都值得同等的信任：从容器平台实时拉取的清单接近真实状态，一份每年手工维护一次的应用列表则不然。分数是计算出来的，而不是声明出来的，依据的信号包括新鲜度、必填字段的完整度、该来源在同一实体上与其他来源一致的频率，以及它有多少条记录能通过身份解析。一张来源记分卡记录的内容大致如下：

```yaml
# ingestion/scorecards/ea-repository.yaml (illustrative)
source: ea_repository
dataset: applications
last_ingested: 2026-10-29T03:00:00Z
scores:
  freshness: 0.62        # share of records touched in the last 180 days
  completeness: 0.81     # mandatory fields present
  agreement: 0.74        # facts confirmed by at least one other source
  resolvability: 0.88    # records matched to a Context Model entity
overall: 0.76
```

这些分数会传递进模型。从高分数据集推导出的关系，起始置信度高于从低分数据集推导出的关系，而且每个所有者都能看到自己的来源和其他来源相比如何。

**Context Model。** 这就是本体，平台的核心。来源的原始记录并不是模型。模型是从这些记录中推导出的一组抽象实体，以及它们之间的关系：一个 Application 由若干 Repository 实现，以 Workload 的形式部署在 Namespace 中，归一个 Team 所有，支撑一项 Capability，处理某种分类的 Data Object，通过一个 Endpoint 暴露，位于一条 WAF 策略之后，被一个 Dashboard 监控。这个意义上的 Application，就是当 EA 仓库里的一条记录、三个代码仓库、两个命名空间和 IT 服务管理里的一个业务服务被证明是同一个东西时，你得到的那个东西。

**界面。** 模型通过三种方式对外暴露，Web 界面、REST API 和 MCP，每一种服务于不同类型的消费者。三者背后是语义相同的同一批实体，这一点每个月都变得更加重要，正如我在[上下文就是产品](/articles/context-is-the-product/)中所论证的。

| 消费者 | 界面 | 他们用它做什么 |
|---|---|---|
| 每位开发者和工程师笔记本上的编程智能体（本地 Claude Code 实例） | MCP | 在写下一行代码之前，询问哪个服务拥有某个 API、该部署到哪个平台、参考架构怎么说 |
| SDLC 中的远程智能体工厂 | MCP | 同样的问题，由在管道里而不是在笔记本上构建、测试和修改软件的智能体提出 |
| 企业架构师、解决方案架构师和工程师 | Web 界面 | 发现存在什么，了解一个领域如何拼在一起，在设计评审之前探索依赖关系 |
| 需要上下文的其他系统 | REST API | 下游系统把 Context Model 的数据拉进自己的流程：组合管理工具、风险与合规报告、入职、成本分摊 |

前两行是这个平台必须现在存在、而不是五年后才存在的原因。笔记本上的编程智能体，每次会话开始时都对它所服务的公司一无所知。给它一个通往 Context Model 的 MCP 端点，它就知道该问哪个团队，该复用哪个平台服务而不是重建，以及哪一项架构决策已经排除了它正要采用的方案。把这一点乘以集团里的每一位工程师和每一座智能体工厂，Context Model 就成了公司如何构建软件的共享记忆。

模型之上是分析，而正是在这里，它不再是一份目录，开始成为智能。因为模型是相互连接的，它可以产出产出物：一个市场单元的架构分析，整合三个重叠平台的商业论证初稿，根据实际运行的东西生成的解决方案架构图，一份关于能力覆盖的 EA 视图，一份预先填好现状和选项的架构决策记录。同样的分析还能自己发现业务用例：横跨五个系统、其实两个就够的流程，在四个市场单元里重复建设的组件，可以变得更高效（结果相同，成本更低）或更有效（结果更好，成本相同）的解决方案。这样的发现过去需要某个恰好对两边都了解的人。现在需要的是一次查询，以及一个愿意据此行动的人。

## 为什么本体是最难的部分 {#why-the-ontology-is-the-hard-part}

摄取是管道活。界面是一个 UI 加两个 API。Context Model 才是真正做决定的地方，也是我改变想法最多的地方。

实体模型的一个最小切片大致如下。这只是示意，不是实际的 schema：

```yaml
# context-model/entities.yaml (illustrative)
Application:
  identity: [ea_repository.application_id]
  derived_from: [ea_repository.application, itsm.business_service]
  relations:
    realised_by:   Repository      # many
    deployed_as:   Workload        # many
    owned_by:      Team            # one, accountable
    supports:      Capability      # many
    processes:     DataObject      # many, with classification
    exposed_via:   Endpoint        # many

Repository:
  identity: [source_code.repository_path]
  relations:
    belongs_to:    Application     # inferred, carries confidence
```

有三件事比我预想的更重要。

**身份解析占了大部分工作。** 同一个应用在每个系统里都有不同的名字，有时根本没有名字。判断两条记录何时是同一个实体，是核心问题。确定性的键能解决其中一部分（一个携带 EA 仓库应用 ID 的部署标签，简直是一份礼物）。其余的靠推断，而推断需要是可见的。

**每条边都带有出处和置信度。** 来自某个 API 外键的边，和模型根据 README 提出的边，是不同种类的事实。两者都有用。把它们同等对待，就是你建出一张漂亮却无人信任的图的方式。每一条关系都记录它来自哪里，最后一次被看到是什么时候，以及它是被断言的、被推导的，还是被推断的。我在讨论[上下文仓库](/notes/the-enterprise-context-warehouse/)时提出过同样的论点，而一旦这张图开始产出人们据以行动的产出物，这个论点就更加成立。

**模型必须有立场，而这些立场必须是企业架构的立场。** 实体类型、关系类型和能力地图都不是中立的。它们是公司战略和 EA 的能力进入平台的地方。如果 Context Model 使用与 EA 相同的能力分类法，那么「哪些系统在所有市场单元中支撑能力 X」就是一次查询，而不是一个项目。这就是我上一个角色里的协调一致问题，被变成了一个数据问题。更多内容见[一套智能体能读懂的分类法](/notes/a-taxonomy-agents-can-read/)。

## 一手来源与二手来源 {#primary-and-secondary-sources}

Context Model 中并不是所有数据都具有同等地位，模型会明确说明这一点。

大部分数据起初是**二手来源**：一份副本，从对它具有权威性的系统摄取而来。容器平台对一个命名空间里运行着什么具有权威性。源代码平台对谁有权访问一个仓库具有权威性。Context Model 镜像这些事实，为其打分，把它们连接起来，但如果它与来源不一致，以来源为准，更正也要回到来源那里去做。

有些数据则是**一手来源**：Context Model 就是它的权威所在。起初，这主要是任何其他系统都不持有的东西，即实体之间已确认的链接。没有别人记录这三个仓库、这两个命名空间和那个业务服务是同一个应用。一旦某个团队确认了这一点，这个事实就存在于 Context Model 中，别无他处。

随着时间推移，更多数据会从二手转为一手。当一个数据集经过整理、得分很高、通过模型被到处使用，而原来的工具除了多出一个需要维护的地方之外别无贡献时，明智的做法就是宣布 Context Model 对它具有权威性，并让那份副本退役。

{% diagram(title="How a data set changes standing") %}
   ┌──────────────────────────┐
   │ ingested from a source   │  secondary: the source wins
   └─────────────┬────────────┘
                 ▼
   ┌──────────────────────────┐
   │ scored and connected     │
   │ in the model             │
   └─────────────┬────────────┘
                 ▼
   ┌──────────────────────────┐
   │ curated by its owner,    │
   │ used through the model   │
   └─────────────┬────────────┘
                 ▼
   ┌──────────────────────────┐
   │ declared primary in      │  an explicit decision, with
   │ the Context Model        │  an owner and a date
   └──────────────────────────┘
{% end %}

这种转变始终是一个明确的决定，按数据集逐一做出，有所有者，有日期，这样每个人都知道该去哪里更正一个事实。

## 默认开放 {#open-by-default}

我最坚定持有的前提是：**企业 IT 上下文并不敏感**。存在哪些应用，归谁负责，支撑哪些能力，运行在哪些平台上，如何相互连接：这一切都应该向公司里的任何人开放，也向任何代表他们工作的智能体开放。

这里的 IT 上下文指的是关于系统的元数据，而不是系统内部的数据。客户记录、凭据和密钥不是 IT 上下文，永远不会进入模型。所有描述版图的东西都会进入。

这个论点关乎谁有资格进行整体思考。当上下文受到限制时，只有少数能访问每一个孤岛的人才能看到全貌，他们成了每一项跨越边界的决策的瓶颈。当它开放时，一个市场单元的工程师可以注意到，自己正要构建的平台服务已经在另一个单元存在。一位解决方案架构师可以在评审之前看到一个设计的二阶效应。一个编程智能体可以复用而不是重复。让 IT 上下文民主化，就是让更多的人和更多的智能体参与到创造最大价值的决策中，而不是等待那少数能看到一切的人。

## 开放构建，因贡献而改进 {#built-in-the-open-improved-by-contribution}

这个平台完全构建在开源技术之上。它的核心没有任何供应商产品。这是一个刻意的选择，而且不仅仅是出于成本考虑。

一个要求整个公司信任它对版图描绘的平台，必须对这幅图景是如何形成的保持透明。每一个连接器、每一条打分规则、每一种实体类型、每一个推断提示词，任何愿意去看的人都能阅读和理解。当有人问为什么模型说某个应用属于他们的团队时，答案是一串他们可以追溯的来源和规则，而不是一个黑箱。

同样的开放也让贡献成为可能。团队可以为自己的系统添加连接器，提议实体类型，更正映射，整理自己的数据集。而且他们有这样做的理由。一个在 Context Model 中准确、经过整理、并且有意义地连接起来的数据集，会被集团里的每一位架构师、每一位工程师和每一个智能体使用。它得分高，被人阅读，最终可能被宣布为权威来源。一个陈旧的数据集得分低，这一点每个人也都看得到。激励就内置在模型里：一个团队对其数据投入的心血越多，这些数据就越有价值，对他们自己如此，对其他所有人也是如此。这个想法接近 Zhamak Dehghani 在数据网格（data mesh）中所描述的*数据即产品*（data as a product）：了解数据的领域拥有它、整理它，并以明确的质量保证把它提供给他人。Context Model 把同样的原则应用到关于 IT 的元数据上，记分卡就是质量保证。

## 它为架构师改变了什么 {#what-it-changes-for-an-architect}

区别体现在那些变得廉价的问题上。

| 问题 | 以前 | 有了 Context Model |
|---|---|---|
| 市场单元 X 里有哪些应用使用了语言模型？ | 发调查问卷，两周 | 一次查询，外加一份需要核实的低置信度匹配列表 |
| 命名空间 `claims-prod-07` 归谁？ | 到处打听 | 经由工作负载、仓库和应用找到所属团队 |
| 我们的 AI 解决方案是否遵循集团参考架构？ | 逐个评审设计 | 按市场单元，把实际拓扑与参考架构比较 |
| 整合这三个集成平台会牵涉到什么？ | 一场研讨会 | 依赖子图，以图表和商业论证初稿的形式呈现 |
| 这份 ADR 还成立吗？ | 没人知道 | 对照当前模型检查 ADR 的假设 |

这些答案没有一个是完美的。但它们全都是比一张白纸加一封会议邀请更好的起点。架构师的工作从收集现状转向评判现状，这正是我在[架构师现在做什么](/notes/what-the-architect-does-now/)中描述的转变。

## 从上下文到工作 {#from-context-to-work}

上面那张表是架构师的视角，它低估了这个平台。架构师是最先注意到这个缺口的用户，却不是受益最多的用户。

IT 部门的大部分工作都是例行公事：查找东西，在系统之间翻译，在团队之间协调，执行遵循已知模式的变更。这个归谁，在哪里运行，什么依赖它，适用哪条规则，该填哪张表，谁必须审批，上周改了什么。今天由人来做这些工作，是因为它所需的上下文分散在十几个工具和几百个脑袋里。智能体可以完成其中的大部分，但前提是它能读到那些上下文，而这正是 Context Model 所提供的。

| 今天的角色 | 主要是检索上下文和例行变更的工作 | 智能体需要从 Context Model 获得什么 |
|---|---|---|
| 服务台与运维 | 分派事件、找到所有者、执行标准变更 | 归属、依赖、变更历史、运行手册 |
| 平台运维人员 | 资源开通、暴露、证书、DNS、WAF 例外 | 清单、策略、每项资源的当前状态 |
| 解决方案架构师与企业架构师 | 现状分析、对照原则的合规检查、设计和 ADR 的初稿 | 版图、能力地图、参考架构、过往决策 |
| 安全与合规 | 收集证据、控制检查、暴露面评审 | 暴露了什么，通过什么暴露，涉及哪种数据分类 |
| 工程师与编程智能体 | 在构建之前找到正确的服务、API、平台和约定 | 以上全部，通过 MCP，在编辑器里 |
| 组合管理与 IT 管理 | 清单盘点、成本分摊、合理化候选 | 应用、所有者、使用情况、跨市场单元的重叠 |

我在小尺度上见过这种情况发生。在 Web 交付小队里，一旦清单存在，Temporal 工作流又能读取它们，这些工作流就接管了过去需要专职运维人员承担的几乎全部运维工作。这种自动化多年前就已经可行；它所缺少的，是足以安全据之行动的上下文。

如果做得对，在整个 IT 部门的尺度上，这会大幅减少一个 IT 组织所需的人数。不是通过取代判断，判断反而会变得更有价值，正如我在[架构师现在做什么](/notes/what-the-architect-does-now/)中所论证的，而是通过去掉那一大块只因为上下文获取成本高昂才存在的工作。这就是商业论证，而且它比更好的架构评审要大得多。一家公司如何处理这一转变中人的那一面，是一个领导力问题，这个平台并不回答它，它值得的审慎，远非一篇博客文章所能给予。

## 上下文比探索便宜 {#context-is-cheaper-than-exploration}

人员编制是商业论证中人们会注意到的部分。他们忽略的部分，是智能体本身会发生什么。

没有企业上下文的智能体照样会继续工作，靠的是探索。被问到谁拥有一个服务、什么依赖于它时，笔记本上的编程智能体会搜索仓库，阅读 README，grep 部署文件，如果有权限还会查询集群，顺着链接进入 wiki，再对它找到的一切进行推理。每一步都是一次工具调用，每一个工具结果都会进入上下文窗口，而这个不断增长的窗口在随后的每一轮都要再付一次费。然后，下一台笔记本上的下一个智能体问同样的问题，从头做一遍同样的探索，之后的每一个智能体也都如此。

这种差别用数量级来看最清楚。下面的数字是我自己的示意性估算，不是测量结果：

```text
Question: "Who owns payment-gateway, and what breaks if we change its API?"

Without a Context Model                    With a Context Model
---------------------------                --------------------
~25 tool calls (search, read, grep, ...)   1 to 2 MCP calls
~150,000 to 250,000 input tokens           ~3,000 to 6,000 input tokens
over the whole exploration                 one entity and its subgraph
answer: plausible, unverified              answer: sourced, scored, current
repeated by every agent that asks          computed once, read by everyone

1,000 engineers x 20 such questions a day x ~200,000 tokens
  = ~4 billion tokens a day spent rediscovering the same facts
```

token 不是可以忽略的零头。正如我在[推理的经济学](/articles/the-economics-of-inference/)中所论证的，它们是一种计量资源，表现得更像电力而不是软件许可证，一家向成千上万人推广智能体的企业会在账单上感受到它们。Context Model 把重复的探索变成一次查询。摄取层把昂贵的工作做一次，为其打分并保持更新，之后的每个智能体读取结果即可。这和缓存或物化视图是同一招，只是应用在一家公司对自己的认知上。

第二个效果是质量。上下文窗口是有限的，每一个花在探索上的 token，都是没有花在实际任务上的 token。一个从干净、有出处的子图出发的智能体，是在正确的事实上推理，而不是在它的搜索碰巧翻出来的东西上推理。它也不再犯缺少上下文的智能体的那些典型错误：构建一个已经存在的服务，选择一个公司正在淘汰的平台，违背一项它从未见过的架构决策。在对公司真正重要的意义上，一个智能体从公司已知的东西出发，就会变得更聪明，无论它运行在哪个模型上。我在[上下文就是产品](/articles/context-is-the-product/)和[检索是工具，不是层](/articles/retrieval-is-a-tool-not-a-layer/)中为单个仓库提出过同样的论点；Context Model 是这个论点在企业尺度上的版本。

第三个效果是我低估了的：沟通变得更清晰。今天，两个团队之间关于「支付网关」的一次对话，可能指的是三个不同的东西，直到一次变更搞坏了错误的那一个，才有人注意到。有了 Context Model，就有一个定义实体的地方，每个实体有一个标识符，还有一套人人都使用的词汇，也就是本体：

| 之间 | 以前 | 有了共享的 Context Model |
|---|---|---|
| 人与人 | 同一个系统有不同的名字，对版图有不同的图景 | 一个实体，一个标识符，一个可以指给对方看的页面 |
| 智能体与人 | 智能体的回答听起来合理，却无法追溯 | 回答引用实体，每个实体又引用其二手来源 |
| 智能体与智能体 | 每个智能体各自探索，交接的是大段文字 | 智能体交接双方都能解析的实体引用 |

这一切都不会把原始来源藏起来。Context Model 返回的每一个事实都带有出处：它来自哪个记录系统，最后一次被看到是什么时候，那个来源得了多少分。本体是共同语言；对于任何想要核实的人或智能体来说，记录系统始终只在一次点击之外。

## 一个新的抽象层级 {#a-new-level-of-abstraction}

退一步看，这在 IT 里是一个熟悉的故事。每一次重大进步，都移动了人们解决问题的层级。汇编让程序员不必再写机器码。C 让他们不必再以寄存器的方式思考。面向对象语言和托管语言让他们不必再管理内存，开始为领域建模。框架、云平台和基础设施即代码移除了一整层又一整层的管道活。每一次，工作都是向上移动，而不是消失，做这些工作的人开始解决更大的问题。

编程智能体是下一步，而且是更大的一步。自 2025 年 11 月发布的 Claude Opus 4.5 那一代模型以来，像 Claude Code 这样的智能体在越来越多的团队里写下了大部分代码，包括我的团队，正如我在[我这些天如何工作](/articles/how-i-work-these-days/)中描述的那样。一个技术人员现在主要产出的是意图、约束、设计和判断，代码越来越少。我在[源代码是新的汇编](/articles/semantic-artifacts-and-meaning-engines/)中论证过，代码正在成为 lowering（逐层降低）的目标，就像汇编当年那样。

这改变了这份工作。与智能体一起工作的工程师，花时间的方式就像解决方案架构师、需求工程师或业务分析师那样：理解问题，决定应该构建什么，把它规定得足够清楚以便智能体能构建出来，并判断结果是否有韧性、可扩展、正确。技术背景仍然不可或缺，因为正是它让他们能够做出判断，但他们工作的层级已经整整上移了一层。

在那个层级上，最重要的输入是上下文。一个以架构师方式工作的工程师需要了解版图；一个构建他们所规定之物的智能体也需要了解它。这就是为什么我认为 IT 智能和新的抽象层级是相伴而生的。Context Model 让在更高层级上工作变得安全，因为它是人和智能体共同据以设计的那幅共享、当前、有出处的图景。

## 组织是下一个瓶颈 {#the-organisation-is-the-next-bottleneck}

如果工程师像架构师和分析师那样工作，而智能体承担了大部分实现，那么过去分属不同角色、位于组织架构图上不同方框里的能力，就开始集中到同一批人身上。工程、架构、需求和分析趋于融合。而且它们也开始与管理和决策相竞争。IT 组织里中层管理所做的很多事情是协调：弄清谁知道什么，在团队之间翻译，安排工作顺序，汇报状态。Context Model 和一队智能体恰恰能做很多这样的事。当一个带着智能体的小团队就能理解一个问题、设计解决方案、构建它并运行它时，那些为了围绕稀缺的实现能力协调大团队而存在的层级，就失去了大部分存在的理由。

大多数企业 IT 组织都是围绕这种稀缺来设计的。构建既慢又贵，于是组织长出了配给它的结构：需求管理、项目组合、年度预算周期、漫长的架构评审队列，以及分别负责需求、设计、构建和运行的独立团队。康威定律在这里是双向的。正是这些结构产生了本文开头描述的那片碎片化的版图，而且除非它们改变，它们还会继续产生这样的版图，以智能体的速度。

当构建变得又快又便宜时，瓶颈就会转移。它转移到决定构建什么，以及业务吸收所构建之物的能力上。那些赚钱的业务单元，也就是 IT 所交付的一切的功能性消费者，现在必须跟上：足够精确地表述需求，更快地做出决定，在新的解决方案到来时改变自己的流程，不再把 IT 当作一条排队等候的队伍。一个能在几周内交付过去需要几个季度的东西的 IT 部门，其价值只取决于业务使用它的能力。

我还不知道正确的组织形态是什么。但对它的某些特性，我相当有把握：

- **更小的团队，更宽的职责**，每个团队从理解到运行全程负责一个问题，由智能体完成大部分实现。
- **决策权更靠近业务**，因为理解需求的人和现在能构建解决方案的人，越来越多地是同一个人，或者坐在同一张桌子旁。
- **按产品和成果而不是按项目拨款**，因为项目是稀缺实现能力的计量单位，而这种能力已不再是稀缺的东西。
- **治理作为自动化关卡而不是评审队列**，在设计阶段对照 Context Model 为设计打分，只把真正需要人来处理的事情升级上去，正如[带阈值的设计期风险](/notes/design-time-risk-with-a-threshold/)和[架构成为一个循环](/notes/architecture-becomes-a-loop/)中所写的。
- **把一幅共享的公司图景当作基础设施**，这正是 Context Model 的用途。

这是性质上的转变，而不是程度上的转变。它改变了技术的构建方式，也改变了一个组织必须如何构建自己，才能以技术如今能够被生产出来的速度吸收技术。引入编程智能体却没有 IT 智能的公司，会更快地构建错误的东西。两者都引入却不改变组织的公司，会构建出正确的东西，然后等待组织跟上。三件事都做的公司，五年后看起来会和那些没做的公司截然不同。

## 相关工作，以及这不是什么 {#related-work-and-what-this-is-not}

这里的每一个想法单独来看都不新，之前的工作值得肯定。

**自动化 EA 文档。** 慕尼黑工业大学和因斯布鲁克大学的研究者十多年来一直致力于自动保持企业架构模型的更新，而不是靠手工维护。Farwick 及其同事在 2011 年整理了自动化 EA 模型维护的需求，并在 2013 年分析了公司内部有哪些信息来源可以为 EA 模型提供数据，以及这些数据的质量如何，这正是上文描述的摄取和打分问题。Martin Kleehaus 和 Florian Matthes 后来展示了如何通过对服务进行运行时插桩来保持 EA 模型的更新。最近，Reitemeyer 和 Fill 综述了大语言模型和知识图谱在企业建模中如何结合。这一系列工作是 Context Model 最接近的学术前身，它也表明这个问题由来已久。不过，它的目标是一个更好的 EA 模型。这里的目标则是一个智能体可以据以工作的数据层。

**AI 上下文平台。** 2026 年，业界从另一侧发现了同一个缺口。根据供应商对其报告的摘要，Gartner 已经开始描述一个名为 *AI 上下文平台*（AI context platforms）的类别：构建、治理并向 AI 智能体交付经过语义组织的知识的软件。今年有好几款产品打着这面旗号发布。TopQuadrant 明确把 TQ Data Foundation 作为企业上下文平台来推广。DataHub 发布了一个上下文平台，把来自一百多个数据系统的元数据合并成一张图，通过 MCP 提供给智能体。Neo4j 宣布了一个上下文引擎。而 EA 工具供应商 Ardoq 收购了图数据库 GraphLake，用来构建它所说的「面向企业 AI 的 EA 级上下文图」，其 CEO 宣称企业架构「是 AI 技术栈其余部分赖以运行的基底」。

我把市场的到来看作是对这个缺口真实存在的确认，显然我也不是唯一一个想到「enterprise context platform」这个词的人。但差别很重要，正是这些差别，让这件事不应被理解为又一个 EA 仓库或又一个数据目录：

| | EA 仓库 | 数据目录与上下文产品 | Enterprise Context Platform |
|---|---|---|---|
| 它描述什么 | 应用组合，按架构师的整理 | 分析型数据：表、指标、血缘 | IT 中发生的一切：组合、代码、运行时、暴露、运维、决策 |
| 数据从哪里来 | 主要靠手工录入 | 数据平台和 BI 工具 | 每一个记录系统和每一个平台，并对准确性打分 |
| 有多新 | 和上一次评审一样新 | 紧贴数据栈 | 和来源一样新，每个事实都带有「最后一次被看到」 |
| 它为谁服务 | 架构师 | 分析师和分析类智能体 | IT 中每一个人和每一个智能体，无论什么角色 |
| 权威性 | 仓库本身就是记录 | 镜像来源 | 默认是二手来源，经宣布后成为一手来源 |
| 访问 | 许可席位 | 需要许可，常常按用户计 | 默认向所有人开放 |
| 技术 | 供应商产品 | 供应商产品 | 开源，可读，可通过贡献扩展 |

最近的邻居是开发者门户，比如 Backstage，它的软件目录给一个软件组织提供了一个关于「存在什么」的模型。Context Model 是把这个想法从一个工程组织扩展到整个 IT 部门，从人浏览目录扩展到智能体完成工作。

## 权衡与反对意见 {#tradeoffs-and-objections}

**「这不过是一个 CMDB。」** CMDB 是一个要求团队手工维护的记录系统，这就是它会漂移的原因。Context Model 首先是推导出来的。它不依赖任何人往里输入东西；它读取各个系统本来就在说的内容，并把自己的判断与来源分开保存。CMDB 正确的地方，模型与它一致。CMDB 错误的地方，模型会显示出这种不一致，而这本身就有用。

**「这不过是一个多了些连接器的 EA 仓库。」** EA 仓库非常擅长组合视图，它也是这里最重要的来源之一。但它描述的是架构师所意图和整理的版图，一年几次，供少数持有许可的读者阅读。它不知道集群上运行着什么，WAF 放行了什么，哪个代码仓库真正实现了一个应用，昨晚哪个事件击中了它，或者哪项变更正在进行中。Context Model 由所有这些构建而成，持续不断，为每一个在 IT 中工作的人和智能体服务。EA 仓库为它提供数据；两者不是同一类东西。

**「AI 辅助摄取意味着幻觉出来的架构。」** 如果推断出的边被当作事实呈现，那确实如此。但它们并没有。推断出的关系带有其置信度和推理过程，低置信度的关系会排队等待所属团队确认，而一次确认就会成为一个附有姓名和日期的断言事实。没有这一点，我不会信任这个平台，别人也不应该信任。

**「为什么要自己建？」** 部分原因是本体就是产品，而一个现成买来的本体，编码的是别人的企业。部分原因是来源是供应商工具和内部平台的一种特定组合，没有哪个产品能覆盖。部分原因是一个要求人们信任并为之贡献的平台，必须是他们能够阅读的，开源技术栈允许这一点，供应商产品则不然。还有部分原因是，在请任何人为它出资之前，我需要知道这个想法是否站得住。自建平台是最便宜的诚实测试。

**「一张开放的 IT 版图地图会帮助攻击者。」** 这是我听到最多的反对意见。一个已经进入网络内部的攻击者，只要有足够的时间，就能绘制出版图的大部分；而防守者和建设者，在今天往往做不到。让地图保持封闭，主要保护的是攻击者在耐心上的优势。真正的保护应当放在系统本身上，放在身份、网络控制和密钥管理上，而不是让同事难以知道存在什么。当某个具体细节确实危险时，比如一个具体的漏洞或一份凭据，它就不是 IT 上下文，也不会进入模型。

代价是什么：来源更改 API 时连接器会坏掉，身份解析需要持续维护，而访问权限才是真正的约束。一个能看到整个 IT 版图的平台，需要对整个 IT 版图的读取权限，而在一家受监管的金融集团里，这是一场对话，而不是一次配置变更。我在[瓶颈在于读取权限](/notes/the-bottleneck-is-read-access/)中写过这一点。

## 我在警惕的失败模式 {#failure-modes-i-am-watching-for}

- **漂亮的图。** 一个在演示中令人印象深刻、却回答不了任何真实问题的界面。检验标准是架构师是否会在没人要求的情况下，在评审前主动打开它。
- **无声的过时。** 某个来源连接器失败了，模型继续显示上个月的状态，却没有人注意到。每个实体都需要一个「最后一次被看到」，界面也必须把它显示出来。
- **本体膨胀。** 每个团队都想要自己的实体类型。模型必须保持足够小，小到一个人能在白板上把它讲清楚。
- **对产出物的过度信任。** 一份生成的商业论证读起来很好，却以一种只有所属团队才能发现的方式出了错。产出物是带有来源的草稿，而不是答案。
- **第二个影子仓库。** 如果人们开始在平台里而不是在其记录系统里编辑二手数据，它就会变成它本来要解决的那个东西。对二手数据的更正要回到来源。只有被明确宣布为一手来源的数据，才在 Context Model 中维护。
- **开放被例外侵蚀。** 每个要求隐藏某个字段的团队，都有一个听起来合理的理由。批准得足够多，模型就会变成又一个孤岛。例外需要很高的门槛和一份公开的清单。
- **被操纵的分数。** 一旦分数关乎声望，就会有人去优化分数而不是准确性。这些信号必须始终以与其他来源的一致性为基础，而这很难造假。

## 结语 {#closing}

商业智能让一家公司对它的高管变得清晰可读。IT 智能让它对每一个构建它的人和智能体变得清晰可读；而随着软件构建的层级不断上移，这幅共享的公司图景，会成为其他一切赖以构建的东西。我为架构勾勒的那个[循环](/notes/architecture-becomes-a-loop/)需要一个出发的地方和一个落回的地方，而 Context Model 就是要成为这两者。

## 参考文献 {#references}

知识，默会的与显性的：

- Michael Polanyi, *The Tacit Dimension*, Doubleday, 1966; reissued by the University of Chicago Press, 2009, with a foreword by Amartya Sen.
- Ikujiro Nonaka and Hirotaka Takeuchi, *The Knowledge-Creating Company*, Oxford University Press, 1995; an overview of their [SECI model](https://en.wikipedia.org/wiki/SECI_model_of_knowledge_dimensions).
- James C. Scott, *Seeing Like a State*, Yale University Press, 1998, chapter 9 on mētis.
- Daniel M. Wegner, "Transactive Memory: A Contemporary Analysis of the Group Mind", in B. Mullen and G. R. Goethals (eds.), *Theories of Group Behavior*, Springer, 1987; Wegner's own [summary of transactive memory](https://dtg.sites.fas.harvard.edu/DANWEGNER/wjh/tm.htm).
- Guilherme Avelino, Leonardo Passos, Andre Hora and Marco Tulio Valente, [A Novel Approach for Estimating Truck Factors](https://arxiv.org/abs/1604.06766), ICPC 2016.
- [Tribal knowledge](https://en.wikipedia.org/wiki/Tribal_knowledge), Wikipedia, for the term and its usage.

孤岛、隐藏与转移：

- Thomas H. Davenport, Robert G. Eccles and Laurence Prusak, "Information Politics", *Sloan Management Review* 34(1), 1992, pp. 53 to 65.
- Catherine E. Connelly, David Zweig, Jane Webster and John P. Trougakos, [Knowledge hiding in organizations](https://doi.org/10.1002/job.737), *Journal of Organizational Behavior* 33(1), 2012, pp. 64 to 88; a shorter [research brief](https://smith.queensu.ca/insight/content/research-brief-knowledge-hiding-in-organizations.php) from Queen's University.
- Gabriel Szulanski, "Exploring Internal Stickiness: Impediments to the Transfer of Best Practice Within the Firm", *Strategic Management Journal* 17, Winter Special Issue, 1996, pp. 27 to 43.
- Morten T. Hansen, [The Search-Transfer Problem: The Role of Weak Ties in Sharing Knowledge across Organization Subunits](https://doi.org/10.2307/2667032), *Administrative Science Quarterly* 44(1), 1999, pp. 82 to 111.
- Carl G. Sieloff, ["If only HP knew what HP knows": the roots of knowledge management at Hewlett-Packard](https://doi.org/10.1108/13673279910259385), *Journal of Knowledge Management* 3(1), 1999.
- Gillian Tett, *The Silo Effect: The Peril of Expertise and the Promise of Breaking Down Barriers*, Simon and Schuster, 2015.
- Jeffrey Pfeffer and Robert I. Sutton, *The Knowing-Doing Gap*, Harvard Business School Press, 2000.

自动化 EA 文档：

- Farwick, Agreiter, Breu, Ryll, Voges and Hanschke, "Requirements for Automated Enterprise Architecture Model Maintenance", ICEIS 2011.
- Farwick, Breu, Hauder, Roth and Matthes, "Enterprise Architecture Documentation: Empirical Analysis of Information Sources for Automation", HICSS 2013.
- Roth, Hauder, Farwick, Breu and Matthes, "Enterprise Architecture Documentation: Current Practices and Future Directions", Wirtschaftsinformatik 2013.
- Martin Kleehaus and Florian Matthes, [Automated Enterprise Architecture Model Maintenance via Runtime IT Discovery](https://doi.org/10.1007/978-3-030-49640-1_13), in *Intelligent Systems Reference Library* 188, Springer, 2021, pp. 247 to 263.
- Reitemeyer and Fill, [Applying Large Language Models in Knowledge Graph-based Enterprise Modeling: Challenges and Opportunities](https://arxiv.org/abs/2501.03566), 2025.

AI 上下文平台（2026）：

- Gartner, *Market Overview for AI Context Platforms*, 13 August 2026, and *How to Navigate the Emerging AI Context Platform Market*, 1 September 2026；我只读过[摘要](https://www.gartner.com/en/documents/8486545)，以及 [Atlan 的](https://atlan.com/know/ai-agent/context-layer/gartner-impact-radar-ai-context-platform/)这类厂商总结。
- TopQuadrant, [TopQuadrant Launches Enterprise Context Platform to Build Trusted AI](https://www.einpresswire.com/article/893232971/topquadrant-launches-enterprise-context-platform-to-build-trusted-ai), 18 February 2026.
- DataHub, [Announcing the DataHub Context Platform](https://datahub.com/?p=14496), 2026.
- Neo4j, [Neo4j Context Engine](https://neo4j.com/?p=433599), October 2026.
- Ardoq, [Ardoq Acquires GraphLake to Establish the EA-Grade Context Graph for Enterprise AI](https://www.ardoq.com/news/ardoq-graphlake-context-graph-enterprise-ai), 8 June 2026.
- [Backstage software catalog](https://backstage.io/docs/features/software-catalog), the developer-portal version of the idea.

组织与架构：

- Melvin E. Conway, [How Do Committees Invent?](http://www.melconway.com/Home/Committees_Paper.html), *Datamation* 14(4), 1968, pp. 28 to 31.
- Matthew Skelton and Manuel Pais, *Team Topologies*, IT Revolution, 2019.
- Zhamak Dehghani, [Data Mesh](https://www.thoughtworks.com/insights/books/data-mesh), O'Reilly, 2022.
- Jeanne W. Ross, Peter Weill and David C. Robertson, *Enterprise Architecture as Strategy*, Harvard Business School Press, 2006.
- Michael Nygard, [Documenting Architecture Decisions](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions), the origin of the ADR.

会议：

- [RSAC Conference](https://www.rsaconference.com/About/FAQ), San Francisco.
- Raffael Schneider and Milan Duric, [Self-Learning WAF: Using Generative AI to Tame ModSecurity False Positives](https://path.rsaconference.com/flow/rsac/us26/FullAgenda/page/catalog/session/1753946922633001YdMq), RSAC 2026, session NCS-W01.

技术：

- Anthropic, [Introducing Claude Opus 4.5](https://www.anthropic.com/news/claude-opus-4-5), November 2025.
- [Model Context Protocol](https://modelcontextprotocol.io/), the protocol behind the agent endpoints.
- [Temporal](https://temporal.io/), the durable workflow engine behind the web delivery self-service.
