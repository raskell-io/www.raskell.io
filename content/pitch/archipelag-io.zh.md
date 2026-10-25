+++
title = "Archipelag.io"
description = "在由社区运营的计算机网络上运行开放 AI 模型：每个请求都会交给附近一台能胜任的机器，每个任务都会记录它在哪里运行。"
path = "zh/invest/archipelag-io"
template = "venture.html"

[extra]
project = "archipelag-io"
eyebrow = "投资简报"
parent = { name = "投资", url = "@/invest.md" }
contact_anchor = "talk-about-investing"
+++

来自欧洲的大多数 AI 请求都被送往受外国法律管辖的数据中心，而附近能胜任的计算机一天中大部分时间都闲置着。Archipelag.io 是一个正在运行的公开测试版：它把 AI 任务发送到最近的合适社区计算机，只运行经过签名和审核的模型包，并兼容为 OpenAI API 编写的代码。下一步是为主机提供真实收益，为有数据驻留需求的客户强制执行区域内部署，并从瑞士开始逐个城市上线。

## 问题 {#the-problem}

{% tiles(cols=3) %}
- **欧洲的开发者** 他们希望通过自己已经在用的 API 使用开放权重模型，并清楚知道工作在附近的哪个地方完成。如今他们的提示词被送往美国超大规模云服务商的区域。
- **闲置硬件的所有者** 游戏 PC、Apple Silicon Mac、退役矿机和办公室服务器：这些算力已经付过钱，一天中大部分时间却没有使用。
- **两者之间的空白** 去中心化市场出租的是裸机而不是结果，让主机暴露在任意代码之下，并把可靠性当作事后才考虑的问题。
{% end %}

## 产品 {#the-product}

{% tiles(cols=3) %}
- **兼容 OpenAI 的 API** 支持流式聊天和工具调用，可通过网页、API、Python 和 JavaScript SDK 以及 CLI 使用。
- **Island** 主机代理用 Rust 编写，可在 Linux、macOS 和 Windows 上运行，支持带 GPU 直通的 Docker 或 WebAssembly。
- **就近优先的调度** 协调器按速度、匹配度和余量为主机打分，优先选择同一区域，其次是相邻区域。
- **只运行签名的 Cargo** 主机在沙箱中运行经过精选和签名的模型包，绝不运行任意代码。
- **每个任务都有记录** 系统会保存每个任务由哪个 Island 运行，因此运行位置是可以核查的。
- **不断扩充的模型目录** 用于聊天、图像和嵌入的开放模型，自 2026 年 10 月起还包括能使用工具的模型。
{% end %}

公开测试版自 2026 年 3 月起运行，目前免费：在计量得到验证期间，主机赚取的是虚拟积分，真实货币收益尚未开放。

## 市场 {#the-market}

分析机构对这些市场的定义各不相同，因此这些数字仅作背景参考。最相关的是推理平台市场，因为 Archipelag.io 出售的是结果而不是 GPU 时长，以及欧洲主权云细分市场。

{% tiles(cols=3, variant="figures") %}
- **1060 亿美元** 2025 年全球 AI 推理市场规模，预计到 2030 年达到 2550 亿美元。[MarketsandMarkets](https://www.marketsandmarkets.com/PressReleases/ai-inference.asp)
- **188 亿美元** 2025 年 AI 推理平台即服务市场规模，每年增长 41%，到 2030 年达到 1050 亿美元。[MarketsandMarkets](https://www.webull.com/news/13617937942971392)
- **69 亿美元** 2025 年欧洲主权云基础设施市场规模，预计到 2027 年达到 231 亿美元。[Gartner](https://www.gartner.com/en/newsroom/press-releases/2026-02-09-gartner-says-worldwide-sovereign-cloud-iaas-spending-will-total-us-dollars-80-billion-in-2026)
{% end %}

## 为什么是现在 {#why-now}

{% tiles(cols=2, variant="figures") %}
- **+83 %** 2026 年欧洲主权云支出的预期增长；2027 年欧洲将超过北美。[Gartner](https://www.gartner.com/en/newsroom/press-releases/2026-02-09-gartner-says-worldwide-sovereign-cloud-iaas-spending-will-total-us-dollars-80-billion-in-2026)
- **2000 亿欧元** 欧盟用于 AI 算力的 InvestAI 计划。新建站点需要数年时间，而家庭和办公室里的硬件今天就已存在。[Euronews](https://www.euronews.com/next/2025/02/11/eu-to-mobilise-200-billion-for-ai-investment)
- **“无法保证”** 微软自己的法务总监在被问及法国数据能否不被美国当局获取时的回答。[The Register](https://www.theregister.com/2025/07/25/microsoft_admits_it_cannot_guarantee/)
- **开放权重** 以 MIT 和 Apache 许可证发布的开放模型如今已接近前沿水平，因此一个开放模型目录足以支撑一款产品。
{% end %}

小模型也在不断变小：拥有数十亿参数的模型如今已能装进普通的笔记本电脑和手机，这让更多已经存在的硬件变成了可用的供给。

## 与众不同之处 {#what-sets-it-apart}

{% tiles(cols=2) %}
1. **提供结果，而非机器** 客户调用的是他们已经熟悉的 API。没有人需要租用机器或管理集群。
2. **就近优先** 调度优先选择离调用方近且能胜任的主机，从而降低延迟，并让工作留在本地。
3. **对主机安全** 只运行经过签名和精选的 Cargo，并有注册表白名单和沙箱配置文件把关。
4. **从手机到服务器** 为五个平台提供原生构建，iOS 和 Android 代理也在测试中。
5. **没有代币，没有链** 只有普通的积分，以及以后普通的收益。客户与结果之间没有任何投机性的东西。
{% end %}

## 竞争 {#competition}

| 公司 | 他们做什么 | Archipelag.io 的不同之处 |
|---|---|---|
| Akash Network | 基于代币的去中心化云，正在加入消费级 GPU | 没有代币。就近优先调度，并且只运行签名的精选包 |
| io.net, Nosana | 以代币激励的 GPU 市场 | 通过兼容 OpenAI 的 API 出售结果，聚焦瑞士和欧洲 |
| Salad | 来自美国的消费级 GPU 容器云 | 主机绝不运行任意代码；位置是调度的一项输入 |
| Vast.ai, RunPod | 按小时计价的 GPU 租赁 | 通过 API 提供结果，而不是需要自己管理的基础设施 |
| Together AI, Hyperbolic | 托管的开放模型推理 | 供给来自独立主机而不是自有集群，并且可以选择位置 |
| OVHcloud, Scaleway, Infomaniak | 欧洲所有的数据中心 | 无需数据中心资本支出：供给随着许多城市中的社区硬件一同增长 |

## 商业模式 {#business-model}

{% tiles(cols=3) %}
- **面向客户的积分** 按用量为 API 结果计价，限定区域运行并附带执行记录的任务收取溢价。
- **面向主机的收益** 按实际执行任务的时间付费，可靠的硬件和位于人口密集都市区的主机还能获得奖励。
- **算力交易所** 在供给和需求之间按市场定价，已经在用虚拟积分运行。
{% end %}

市场进入策略是逐个城市推进：在一个都市区先发展 25 到 50 台主机，在该区域保留云端兜底，并从不能把数据发送到美国区域的瑞士和欧洲公司开始。网站正在邀请设计合作伙伴共同打造定制模型包。

## 目前进展 {#where-it-stands}

{% tiles(cols=3, variant="figures") %}
- **2026 年 3 月** 免费公开测试版自 3 月 13 日起在 app.archipelag.io 上线。
- **v0.6** 2026 年 10 月发布的 Island 版本，支持工具调用，并在每个原生构建中带有 llama.cpp 运行时。
- **5** 拥有原生 Island 构建的桌面和服务器平台数量，另有移动端代理在测试中。
{% end %}

Island 代理、CLI、两个 SDK 和网站都在 GitHub 上公开，其中 Island 采用 MIT 许可证。目前还没有付费客户：在计量得到验证之前，支付功能是刻意关闭的。

## 风险 {#risks}

{% tiles(cols=2) %}
- **家用主机不可靠** 任务失败时会重新排队，主机会积累信誉，调度会退回到相邻区域，云端兜底也是上线计划的一部分。
- **数据暴露** 主机经过身份验证，流量经过加密。面向受监管买家的机密推理目前还是原型，也是资金的优先投向之一。
- **数据驻留承诺** 目前调度只是优先选择某个区域。在做出任何驻留承诺之前，会先实现强制执行和可导出的执行记录。
- **资金更充足的竞争对手** 它们大多是代币网络或美国云服务商。Archipelag.io 的竞争优势在于没有代币、欧洲定位，以及通过 API 提供结果。
{% end %}

## 资金将用于什么 {#what-funding-would-do}

{% tiles(cols=2) %}
1. **真实收益** 完成计量验证，开启计费和主机收益，并公布收益规则。
2. **强制执行数据驻留** 严格的区域限制、客户可以导出的执行记录，以及第三方安全审查。
3. **第一个都市区** 在一个瑞士城市发展 25 到 50 台主机，并公布延迟和可靠性数据。
4. **更大的模型** 让面向大型开放模型的多主机推理以及机密推理从实验阶段走向标准功能。
5. **一支团队** 招聘基础设施可靠性、安全和开发者关系方面的人才。
{% end %}

## 洽谈投资 {#talk-about-investing}

{% panel(eyebrow="欢迎投资", title="及早支持 Archipelag.io。", contact=true) %}
我在寻找明白欧洲为什么需要可以自主决定部署位置的 AI 算力的天使投资人、基金和战略合作伙伴。请给我发一条简短的消息，说明你是谁，以及你最想先看到什么。更多内容请见[投资](/zh/invest/)页面。
{% end %}
