+++
title = "Cyanea"
description = "让生物信息学分析始终保持版本化、随时可以运行，无论是在浏览器中，还是在机构自己掌控的服务器上，数据都不必移动。"
path = "zh/invest/cyanea"
template = "venture.html"

[extra]
project = "cyanea"
eyebrow = "投资简报"
parent = { name = "投资", url = "@/invest.md" }
contact_anchor = "talk-about-investing"
+++

大多数已发表的生物学 notebook 已经无法再运行：一项研究考察了一万多个 notebook，能重新得出相同结果的不到十分之一。Cyanea 把每一项分析与其确切的数据和版本一起保存，并在浏览器中通过 WebAssembly 运行，或在机构自己掌控的节点上运行，因此敏感数据不必离开原地。它是开源的，构建在 18 个经过测试的 Rust 库之上，目前处于公开 alpha 阶段。

## 问题 {#the-problem}

分析活不过它的作者。依赖会漂移，数据链接会失效，没有人说得清某张图是由哪个文件的哪个版本生成的。学生一离开，工作也随之离开。

{% tiles(cols=3) %}
- **学术实验室** 一位课题负责人带着几名学员，审稿人要求可复现性，而每逢有人毕业，结果就会消失。
- **核心设施** 它们为许多客户实验室提供分析，需要能够移交并经得起质询的版本化结果。
- **生物技术团队** 5 到 20 人的小型计算团队，需要标准化分析、审计追踪和快速上手。这是第一批付费买家。
- **联盟与制药企业** 多个站点需要共享方法，却不能移动患者数据或专有数据。
- **教学** 无需安装的 notebook 和一套学习课程：这是漏斗的顶端。
{% end %}

## 产品 {#the-product}

{% tiles(cols=3) %}
- **Spaces** 数据集、notebook、实验方案和结果一起进行版本管理，支持单元格级别的差异比较和恢复。
- **锁定的输入** 每个数据文件都按其 SHA-256 哈希存储，结果会链接回生成它们的单元格、代码版本和数据。
- **在浏览器中运行** notebook 单元格在 worker 中通过 WebAssembly 运行，无需安装任何东西。六个浏览器工具可以查看序列、比对、FASTQ、VCF 和进化树，文件始终不离开本机。
- **Rust 分析核心** 18 个采用 Apache 许可证的 crate，约 3,700 个测试，覆盖从序列和比对到单细胞、系统发育学和蛋白质组学的领域。
- **内置 21 种格式** 从 FASTA 和 FASTQ 到 VCF、BAM、Parquet、PDB 和 Newick，上传时即可识别并建立索引。
- **为团队而建** 组织和角色、实时在线状态、带 webhook 的 REST API、Jupyter 导入，以及 ORCID 登录。
{% end %}

联邦功能让自托管节点能够以内容哈希清单的形式相互发布选定的 space，这样方法可以流动，而数据留在原地。

## 市场 {#the-market}

各家市场报告对生物信息学的定义不同，这些数字仅作背景参考。单独针对科学 notebook 的可靠数字并不存在，本页也不会凭空编造一个。

{% tiles(cols=3, variant="figures") %}
- **235 亿美元** 2025 年全球生物信息学市场规模，每年增长 13%，到 2030 年达到 435 亿美元。[BCC Research](https://www.bccresearch.com/market-research/biotechnology/bioinformatics-technologies-and-global-markets-bio051g.html)
- **80 亿美元** 2025 年计算生物学市场规模，预计到 2034 年达到 227 亿美元。[Global Market Insights](https://www.gminsights.com/industry-analysis/computational-biology-market)
- **42 亿美元** 2025 年生物信息学服务市场规模，每年增长 16%。[Persistence Market Research](https://www.persistencemarketresearch.com/mediarelease/bioinformatics-services-market.asp)
{% end %}

## 为什么是现在 {#why-now}

{% tiles(cols=2, variant="figures") %}
- **8.5 %** 生物医学论文中能复现出相同结果的 notebook 比例：10,388 个中的 879 个。[GigaScience 2024](https://pmc.ncbi.nlm.nih.gov/articles/PMC10783158/)
- **70 %+** 曾经未能复现其他科学家实验的研究人员比例。[Nature 调查](https://www.nature.com/articles/533452a)
- **2025/327** 欧盟健康数据法规要求二次使用必须在安全处理环境中进行；瑞士法律将遗传数据视为敏感数据。分析必须走向数据。[Belgian Health Data Agency](https://www.hda.belgium.be/en/news/regulation-european-health-data-space-published)
- **800+** 巴塞尔地区的生命科学公司数量，就在 Cyanea 的家门口。[BaselArea](https://baselarea.swiss//wp-content/uploads/2023/01/Fakten-uber-die-Life-Sciences-DE_2025-1.pdf)
{% end %}

WebAssembly 如今能在浏览器中以接近原生的速度运行 Rust：Cyanea 的 FASTA 解析器每秒读取约 2.4 GB，大约是 BioPython 的六倍，结果精确到每一位数字都完全相同。而随着 AI 让分析代码变得廉价，稀缺的资产变成了一份可信的记录：什么代码在什么数据上运行过。

## 与众不同之处 {#what-sets-it-apart}

{% tiles(cols=2) %}
1. **在你所在的地方运行** 分析可以在浏览器中运行，无需安装任何东西，也可以在机构自己掌控的服务器上运行。
2. **每个输入都被锁定** 内容寻址的数据和版本化的 notebook，让每个结果都准确指向生成它的东西。
3. **共享方法，而非数据** 自托管节点相互发布选定的 space；患者数据留在原地。
4. **同一个经过验证的核心随处运行** 同样的 Rust crate 在服务器、浏览器和 Python 中运行，并以 BioPython 为基准进行验证。
5. **默认开放** 节点和库都采用 Apache 2.0 许可证，自托管节点没有套餐限制。
{% end %}

## 竞争 {#competition}

| 公司 | 他们做什么 | Cyanea 的不同之处 |
|---|---|---|
| Galaxy | 面向工具工作流的开放 Web 平台，在服务器上运行 | 代码 notebook 和版本化数据在同一个 space 中，支持浏览器执行和联邦 |
| Jupyter, Google Colab | 通用 notebook；Colab 在 Google 的服务器上运行 | 数据和版本随 notebook 一起流动，无需上传给第三方 |
| marimo, Observable, Deepnote | 响应式或托管的通用 notebook | 原生面向生物信息学，内置 Rust 库和 21 种格式 |
| Posit | R 和 Python IDE 以及企业服务器 | 无需安装；溯源和数据版本管理是核心对象 |
| Seqera (Nextflow) | 在 HPC 和云上编排流水线 | Cyanea 保存交互式分析的记录，并被设计为可以接收流水线结果 |
| DNAnexus, Terra | 托管你数据的云端基因组学平台 | 数据可以留在机构自己的节点上 |
| Code Ocean | 用于可复现论文的容器化胶囊 | 更轻量：浏览器执行、无需容器、联邦式共享 |
| Latch Bio | 面向生物技术的托管工作流和无代码界面 | 开源、可自托管、本地优先 |

## 商业模式 {#business-model}

开放核心模式：自托管免费，托管中心对自托管无法替代的部分收费。计费和套餐限制已经实现。

{% tiles(cols=2, variant="figures") %}
- **0 美元** 免费版：公开 space、浏览器执行和 1 GB 存储。
- **98 美元** 专业版，每用户每月：私有 space、100 GB 存储和服务器算力额度。
- **499 美元** 团队版，每个工作区每月：1 TB 存储、五个席位和审计导出。
- **15,000+ 美元** 企业版，每年：本地部署或物理隔离部署，以及支持服务。
{% end %}

市场进入从三到五个设计合作伙伴开始：两个学术实验室和一个生物技术团队，每家带来一项真实的分析，以换取反馈的方式免费使用一年专业版或团队版。核心设施，以及把数据驻留视为硬性规定的瑞士和欧盟团队，是天然的第一批买家。

## 目前进展 {#where-it-stands}

{% tiles(cols=3, variant="figures") %}
- **公开 alpha** 托管中心和网站已在 cyanea.bio 上线。
- **3,700** 18 个开源 Rust crate 中的测试数量，这些 crate 已发布在 crates.io 上。
- **10** 预置的入门 space，每个领域一个，另有六个浏览器工具。
{% end %}

目前还没有付费客户，也还没有设计合作伙伴。Python 和 R 单元格可以被接收，但还不能运行；自托管节点仍然依赖一个将会开源的核心库。这些是资金最先投入的地方。

## 风险 {#risks}

{% tiles(cols=2) %}
- **“浏览器里的玩具”** 生物学家使用 Python 和 R 工作。Python 执行和 GB 级服务器算力是第一优先级；服务器路径已经存在。
- **自托管依赖一个私有核心** 开源核心库已列入计划，会在第一笔企业销售之前完成。
- **联邦信任** 清单目前采用内容哈希；下一步是加密签名。
- **开源与收入** 托管中心对托管算力、网络、治理和支持收费，这些是自托管无法替代的。
- **一位创始人，范围很广** 战略有意收窄广度，以可复现分析为先导，而不是以 crate 的数量为先导。
- **合规型买家** 受监管的客户需要 SOC 2 或 HIPAA。已计划在企业阶段完成。
{% end %}

## 资金将用于什么 {#what-funding-would-do}

{% tiles(cols=3) %}
1. **第 0 到 3 个月** 支持一键重新运行和差异比较的运行记录、溯源图、在浏览器和服务器上运行 Python，以及三到五个设计合作伙伴。
2. **第 3 到 6 个月** GB 级服务器算力、审阅与批准、审计导出、Nextflow 和 Snakemake 导入，以及第一批付费团队。
3. **第 6 到 9 个月** 跨两个节点的联邦式重新运行、签名清单、SSO、通往 SOC 2 的路径，以及开源的核心库。
{% end %}

## 洽谈投资 {#talk-about-investing}

{% panel(eyebrow="欢迎投资", title="及早支持 Cyanea。", contact=true) %}
我在寻找了解生命科学或科学软件的天使投资人和基金，也在寻找愿意成为设计合作伙伴的实验室和核心设施。请给我发一条简短的消息，说明你是谁，以及你最想先看到什么。更多内容请见[投资](/zh/invest/)页面。
{% end %}
