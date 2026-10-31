+++
title = "构建 IT Intelligence：一个仓库里的参考实现"
date = 2026-11-16
draft = true
description = "如何用开源组件搭建一个 Enterprise Context Platform（企业上下文平台）：本体、连接器、工作流、存储、API、MCP 和界面，全部放在一个你可以运行的仓库里。"

[extra]
author = "Raffael"
in_short = [
  "这是我上一篇文章里那个 IT Intelligence 平台的参考实现，放在一个开源仓库里，里面住着一家刻意弄得杂乱的虚构公司：Kestrel Group。",
  "本体先行，其余一切都由它生成或以它为准做校验；来自数据源的观测，与模型从中得出的实体分开保存。",
  "每一条关系都是一行记录，带着依据、置信度和来源；身份解析从共享键到规则再到模型推断逐层进行，不确定的链接排进队列，等待所属团队确认。",
  "工作流以持久化的方式运行数据摄取，数据源的评分公开可见；一个 Go 二进制同时提供 REST 和 MCP 服务器，它给出的回答以实体为中心、篇幅很小，并且总是带着出处。",
  "层次的顺序比工具更重要；数据库、工作流引擎、前端和模型提供方都是可以日后再议的选择，而这个参考实现对自己留下的空缺也坦白交代。",
]
+++

在 [IT Intelligence](/articles/it-intelligence/) 一文里我提出，大公司为自己的销售数字建起来的东西，从来没有为自己的 IT 建过：一个模型，知道有哪些东西存在、归谁所有、彼此如何相连、是否符合战略，并且每一个为它工作的人和智能体都能读懂。接下来那个显而易见的问题很公道：真要把它建出来，是什么样子？

这篇文章就是回答，在不展示任何真实系统版图的前提下，我尽量写得具体。它会带你走一遍一个参考实现，全部放在一个开源仓库 [raskell-io/it-intelligence](https://github.com/raskell-io/it-intelligence) 里，里面有一家虚构的公司。你可以克隆它，在笔记本电脑上运行它，把一个编程智能体接到它上面，并看到第一篇文章描述过的每一层：连接器、工作流编排器、持久化存储、Context Model 本身、带 MCP 服务器的 API 后端、前端，以及把模型变成产出物的分析。

这个参考实现不是我在工作中运行的那个平台。它更小、更简单，也刻意做得平淡无奇。形态是一样的，而我想展示的正是形态。

## 虚构的公司 {#the-fictional-company}

下面的每个例子都用 **Kestrel Group**：一家虚构的金融集团，有三个市场单元、大约四十个应用、十几个团队、两个容器集群、一个 WAF、一个 API 网关，以及常见的那一堆记录系统。仓库以种子文件的形式提供 Kestrel，这些文件模仿你从真实工具里导出的东西：企业架构仓库里的应用清单，IT 服务管理工具里的配置项和事件单，代码托管平台上的仓库和团队，集群里的命名空间和工作负载，WAF 里的策略，网关里的路由。

种子数据是刻意弄乱的。不同系统里的名字各不相同，两个应用声称拥有同一个仓库，一个命名空间没有所有者标签，一个市场单元运行着自己的集成平台而集团 IT 里没人知道，企业架构仓库里还列着一个一年前就已下线的应用。一个干净的演示什么也证明不了。IT Intelligence 有意思的地方，恰恰在于数据源彼此矛盾时会发生什么。

## 系统的形态 {#the-shape-of-the-system}

{% diagram(title="it-intelligence, the reference implementation") %}
   ┌────────────────────────┐
   │ seed/ or real sources  │
   └────────────┬───────────┘
                ▼
   ┌────────────────────────┐
   │ connectors (Go)        │
   └────────────┬───────────┘
                ▼
   ┌────────────────────────┐     ┌──────────────────────┐
   │ Temporal workflows:    │ ──▶ │ PostgreSQL:          │
   │ ingest, resolve,       │     │ observations,        │
   │ score, build           │     │ entities, edges,     │
   └────────────┬───────────┘     │ scorecards,          │
                │ LLM calls       │ artifacts            │
                ▼                 └──────────┬───────────┘
   ┌────────────────────────┐                │
   │ resolver (pluggable    │                │
   │ model provider)        │                │
   └────────────────────────┘                ▼
   ┌──────────────────┐      ┌──────────────────────────┐
   │ web (Next.js)    │ ◀──▶ │ api (Go): REST, MCP,     │
   └──────────────────┘      │ artifacts                │
                             └─────┬──────────────┬─────┘
                                   ▲              ▲
                     coding agents (MCP)   other systems (REST)

   ontology/ (LinkML) ──▶ generated types, SQL, JSON Schema, OWL, docs
{% end %}

六个活动部件，外加一个凌驾于它们之上的文件。我会按照你构建它们的顺序逐一讲解，这和数据流经它们的顺序并不相同。本体排在最前，因为其余一切要么由它生成，要么以它为准做校验。

## 仓库 {#the-repository}

```text
it-intelligence/
  ontology/                 the Context Model, in LinkML
    context_model.yaml
    generated/              JSON Schema, SQL, OWL, SHACL, docs (do not edit)
  connectors/               one package per source kind
    earepo/  itsm/  githost/  cluster/  waf/  gateway/
  mapping/                  observation -> entities and edges, per connector
  resolver/                 identity resolution, deterministic and AI-assisted
  workflows/                Temporal workflows and activities
  store/                    PostgreSQL schema, migrations, queries
  api/                      REST and MCP server, one Go binary
  artifacts/                diagram, insight and ADR generators
  web/                      Next.js frontend
  seed/                     the Kestrel Group, as source-shaped exports
  deploy/                   docker compose for a laptop, Helm chart for a cluster
  .mcp.json                 lets a coding agent in this repo use the MCP server
  Makefile
```

这里选择单一仓库，理由很平淡：本体会变，而它一变，存储、映射器、API、MCP 工具和前端类型都得跟着变。在一个仓库里，这是一个拉取请求、一次评审、一次 CI 运行。分散在五个仓库里，它就成了一个协调问题，而这正是这个平台本来要消除的那类问题。

技术栈从头到尾都是开源的，选它们是因为它们不会带来意外：

| 关注点 | 参考实现中的选择 | 原因 | 合理的替代方案 |
|---|---|---|---|
| 本体 | [LinkML](https://linkml.io/) | 一份 YAML 模式，生成多种产物，并通向 RDF 和 OWL | 直接用 OWL 加 SHACL，或只用 JSON Schema |
| 持久化 | PostgreSQL | 人人都能运行，递归查询覆盖了大部分图需求 | PostgreSQL 上的 Apache AGE，专用图数据库 |
| 编排 | [Temporal](https://temporal.io/) | 持久、可重试、可观测的工作流；自带调度 | Airflow，Dagster，Argo Workflows |
| 后端 | Go | 一个静态二进制同时提供 REST 和 MCP，快到不必为性能操心 | 任何有 MCP SDK 的语言 |
| 智能体接口 | [Model Context Protocol](https://modelcontextprotocol.io/) | 编程智能体本来就会说的语言 | 带 OpenAPI 描述的 REST |
| 前端 | Next.js | 能很快做出实体页面、图视图和评审队列 | 任何 Web 框架 |
| 图表 | 文本形式的 [Mermaid](https://mermaid.js.org/) | 可做差异比对，能在代码托管平台、维基和聊天工具里渲染 | Structurizr DSL，PlantUML |

这些选择都不是重点。换掉其中任何一个，设计依然成立。不太好换的，是各层的顺序以及每一层遵循的规则。

## 第一层：本体 {#layer-one-the-ontology}

Context Model 就是本体，它放在一个文件里：`ontology/context_model.yaml`。我用 LinkML，是因为它让模型只需用可读的 YAML 写一次，然后生成系统各部分所需的形式：用于校验的 JSON Schema，用于存储的 SQL，供想用语义网工具对它做推理的人使用的 OWL 和 SHACL，Python 和 TypeScript 模型，以及人能读的文档。Go 类型则由 JSON Schema 生成。

Kestrel 模型的精简版：

```yaml
# ontology/context_model.yaml (trimmed)
id: https://example.org/it-intelligence/context-model
name: context_model
default_prefix: ctx
prefixes:
  linkml: https://w3id.org/linkml/
  ctx: https://example.org/it-intelligence/
imports: [linkml:types]

classes:
  Entity:
    abstract: true
    slots: [id, name, standing, last_seen]
  Application:
    is_a: Entity
    description: A thing the business recognises as one system, however many parts it has.
  Repository:
    is_a: Entity
  Workload:
    is_a: Entity
  Namespace:
    is_a: Entity
  Team:
    is_a: Entity
  Capability:
    is_a: Entity
    description: A business capability from the enterprise architecture capability map.
  Endpoint:
    is_a: Entity
  Decision:
    is_a: Entity
    description: An architecture decision record, with the entities it constrains.

enums:
  Standing:
    permissible_values:
      secondary: {description: mirrored from an authoritative system}
      primary: {description: the Context Model is authoritative}
```

关系单独声明，是一套封闭的词汇，每种关系各有定义域和值域：

```yaml
# ontology/relations.yaml (trimmed)
relations:
  realised_by:  {domain: Application, range: Repository}
  deployed_as:  {domain: Application, range: Workload}
  runs_in:      {domain: Workload,    range: Namespace}
  owned_by:     {domain: Entity,      range: Team, cardinality: one}
  supports:     {domain: Application, range: Capability}
  exposed_via:  {domain: Application, range: Endpoint}
  depends_on:   {domain: Application, range: Application}
  constrains:   {domain: Decision,    range: Entity}
```

构建它的过程中得出了四条建模规则，它们比语法更重要。

**核心要小。** Kestrel 有九种实体和大约十五种关系。每一个新种类都必须用它能让人回答的某个问题来证明自己存在的必要。正如我在第一篇文章里写的，失败模式是本体无序膨胀，而防线是一份一个人能在白板上讲清楚的模式。

**把实体和观测分开。** 观测是某个数据源在某个时间点说过的话：导出文件里的一行，API 返回的一个 JSON 对象。实体是 Context Model 综合所有观测得出的结论。把两者混在一起，目录就会变成数据源的副本，连同它们所有的矛盾。

**让关系成为一等公民。** 在本体里，关系是一个槽。在存储里，每一条关系都成为单独的一行，带着依据、置信度、来源和「最后一次见到」的时间。只有这样才能回答「模型为什么这么认为？」，而这个问题决定了是否有人信任它。

**能力地图取自企业架构，而不是平台团队。** `Capability` 由集团自己的能力模型填充。正是这一个决定，让「哪些系统在每个市场单元里支撑理赔处理」这样的问题成为一次查询，战略也正是由此进入模型的。

`make ontology` 会重新生成 `ontology/generated/` 里的一切，生成文件过期时 CI 会失败。本体就是代码，像代码一样接受评审。

## 第二层：存储 {#layer-two-the-store}

PostgreSQL 存放五样东西：观测、实体、边、记分卡和产出物。模式短到几乎可以完整展示：

```sql
-- store/schema.sql (trimmed)
create table observation (
  id           bigserial primary key,
  source       text not null,          -- 'earepo', 'cluster', ...
  dataset      text not null,          -- 'applications', 'workloads', ...
  external_id  text not null,          -- the id inside the source
  payload      jsonb not null,
  observed_at  timestamptz not null
);

create table entity (
  id          text primary key,        -- 'ctx:Application/policy-admin'
  kind        text not null,
  name        text not null,
  standing    text not null default 'secondary',
  attributes  jsonb not null default '{}',
  last_seen   timestamptz not null
);

create table edge (
  id            bigserial primary key,
  kind          text not null,         -- 'owned_by', 'realised_by', ...
  from_id       text not null references entity(id),
  to_id         text not null references entity(id),
  basis         text not null,         -- 'asserted' | 'derived' | 'inferred'
  confidence    real not null,
  source        text not null,
  evidence      jsonb not null default '{}',
  confirmed_by  text,
  confirmed_at  timestamptz,
  last_seen     timestamptz not null
);
```

观测只追加。任何东西都不会被覆盖，所以模型总能根据数据源说过的话重建，每一条边也都能通过它的 `evidence` 指回产生它的那些观测。

`basis` 这一列承载着第一篇文章里的那个区分。**asserted**（断言）边直接来自数据源自己的键：集群说这个工作负载运行在那个命名空间里。**derived**（推导）边由规则从其他边得出：工作负载运行在某个团队所有的命名空间里，所以除非另有说明，这个团队就拥有这个工作负载。**inferred**（推断）边由解析器提出，通常借助模型，带着置信度和背后的理由。当一个团队确认了一条推断边，`confirmed_by` 和 `confirmed_at` 就会被填上，这条边变成断言边，上面写着一个人的名字。

为什么用 PostgreSQL 而不是图数据库？因为架构师和智能体问的大部分问题，都在离某个实体一两跳的范围之内，其余的是有界遍历，递归查询处理得很好。经典的「我改了这个会坏掉什么」问题：

```sql
-- everything that depends on payment-gateway, up to four hops away
with recursive impact(id, depth) as (
  select 'ctx:Application/payment-gateway'::text, 0
  union
  select e.from_id, i.depth + 1
  from edge e
  join impact i on e.to_id = i.id
  where e.kind = 'depends_on' and i.depth < 4
)
select id, min(depth) as distance
from impact
where depth > 0
group by id
order by distance, id;
```

如果图增长到这种方式难以从容应对的规模，[Apache AGE](https://age.apache.org/) 可以在同一个 PostgreSQL 实例上加入 openCypher 查询，而专用图数据库则是之后另行做出的决定。从每个团队都已经会运维的数据库起步，比第一天就追求图查询语言的优雅更有价值。

## 第三层：连接器与映射 {#layer-three-connectors-and-mapping}

连接器只做一件事：读取一个数据源，产出观测。它对本体一无所知。

```go
// connectors/connector.go
type Observation struct {
	Source     string
	Dataset    string
	ExternalID string
	Payload    json.RawMessage
	ObservedAt time.Time
}

type Connector interface {
	Name() string
	Datasets() []string
	Extract(ctx context.Context, dataset string, since time.Time) iter.Seq2[Observation, error]
}
```

映射是单独的一步，每个连接器配一个映射器，它把观测变成**断言**：候选实体和候选边，每一个都标记着它来自哪条观测。

```go
// mapping/cluster.go (trimmed)
func (m ClusterMapper) Map(o connectors.Observation) (Assertions, error) {
	var w struct {
		Name      string            `json:"name"`
		Namespace string            `json:"namespace"`
		Labels    map[string]string `json:"labels"`
	}
	if err := json.Unmarshal(o.Payload, &w); err != nil {
		return Assertions{}, err
	}
	a := Assertions{}
	wl := a.Entity("Workload", w.Namespace+"/"+w.Name, o)
	ns := a.Entity("Namespace", w.Namespace, o)
	a.Edge("runs_in", wl, ns, Asserted, o)
	if app, ok := w.Labels["app.kestrel.example/application-id"]; ok {
		a.Edge("deployed_as", a.Ref("Application", app), wl, Asserted, o)
	}
	return a, nil
}
```

这样拆分让连接器可以复用，因为同一个代码托管平台连接器适用于任何公司；公司特有的知识则留在映射器里，在那里可以被评审。这也意味着连接器可以由拥有该数据源的团队来写，贡献正是这样开始的。在参考实现里，加一个数据源只需要三个文件：一个连接器，一个映射器，和一份用来测试的种子导出。

代码片段里对标签的检查，是整个系统里最划算的一步。一个携带企业架构仓库中应用 ID 的部署标签，能把一次推断变成一条断言。每个加上这种标签的团队都让模型更确定，记分卡也会体现出来。

## 第四层：身份解析 {#layer-four-identity-resolution}

映射会为同一个东西产生许多候选。企业架构仓库写的是「Policy Administration」，代码托管平台上有 `pol-adm-svc` 和 `pol-adm-ui`，集群在命名空间 `claims-prod` 里运行着 `policy-admin`，IT 服务管理工具里有一个叫「PAS」的业务服务。解析要决定其中哪些是同一个实体。

它分三轮进行，从便宜而确定到昂贵而不确定：

1. **键。** 跨数据源共享的标识符，比如部署标签里的应用 ID，或者仓库元数据文件里的 CMDB 引用，产生断言链接。
2. **规则。** 精度已知的确定性启发式规则：规范化之后完全相同的名字，一个所属团队恰好只拥有一个应用的仓库，命名空间的命名约定。它们产生推导链接。
3. **推断。** 剩下的交给模型，模型拿到候选项和一份简短的可能匹配清单，附带它们的名字、描述、README、所有者和标签，然后返回一个结构化的判断。

```json
{
  "candidate": "githost:repo/kestrel/pol-adm-ui",
  "match": "ctx:Application/policy-admin",
  "confidence": 0.82,
  "reasons": [
    "README describes the policy administration frontend",
    "same owning team as pol-adm-svc, already linked by key",
    "deploys to claims-prod next to policy-admin"
  ]
}
```

阈值是明确的，写在配置里。高于 0.9，链接作为推断链接存储并正常显示。介于 0.6 和 0.9 之间，链接作为推断链接存储，并排进队列等待所属团队确认。低于 0.6 则丢弃并记录日志。推断链接永远不会被悄悄提升为断言链接；那需要一个人来做。模型提供方是可插拔的，参考实现既能用本地模型，也能用托管模型，因为输入是元数据，提示词也很小。

## 第五层：工作流 {#layer-five-workflows}

到目前为止的每一步都是一个 Temporal activity，工作流把它们串起来。最主要的那个工作流，端到端地摄取单个数据源：

```go
// workflows/ingest.go (trimmed)
func IngestSource(ctx workflow.Context, in IngestInput) (IngestResult, error) {
	ctx = workflow.WithActivityOptions(ctx, workflow.ActivityOptions{
		StartToCloseTimeout: 30 * time.Minute,
		RetryPolicy:         &temporal.RetryPolicy{MaximumAttempts: 5},
	})
	var a *Activities

	var batch ExtractResult
	if err := workflow.ExecuteActivity(ctx, a.Extract, in).Get(ctx, &batch); err != nil {
		return IngestResult{}, err
	}
	var mapped MapResult
	if err := workflow.ExecuteActivity(ctx, a.Map, batch).Get(ctx, &mapped); err != nil {
		return IngestResult{}, err
	}
	var resolved ResolveResult
	if err := workflow.ExecuteActivity(ctx, a.Resolve, mapped).Get(ctx, &resolved); err != nil {
		return IngestResult{}, err
	}
	var card Scorecard
	if err := workflow.ExecuteActivity(ctx, a.Score, in.Source, resolved).Get(ctx, &card); err != nil {
		return IngestResult{}, err
	}
	return IngestResult{Scorecard: card, QueuedForReview: resolved.Queued}, nil
}
```

参考实现有四个工作流：

| 工作流 | 触发方式 | 做什么 |
|---|---|---|
| `IngestSource` | 每个数据源一个调度，或一个 webhook | 提取、映射、解析、评分、写入 |
| `ConfirmLink` | 团队在界面里确认或拒绝 | 提升或删除一条推断边，记录是谁、在何时 |
| `DeclarePrimary` | 数据集所有者通过一次经过评审的请求发起 | 把数据集的地位切换为 primary，记录所有者和日期 |
| `BuildArtifacts` | 每晚一次，以及大规模摄取之后 | 根据模型快照重新生成洞察、图表和草稿 |

为什么用工作流引擎，而不是一个 cron 任务加几个脚本？因为数据摄取运行时间长，要和不稳定的 API 打交道，还要调用会超时的模型。Temporal 会单独重试每一步，崩溃之后从中断处继续，并在它的界面里展示每一次运行及其输入和失败。最后这一点常被低估：当某个数据源的记分卡下滑时，第一个问题就是上一次摄取期间发生了什么，而答案只需点一下。我在第一篇文章描述的 Web 交付自助服务里使用 Temporal，也是出于同样的原因，在那里工作流接过了运维人员的工作。

## 第六层：评分 {#layer-six-scoring}

`Score` activity 在每次摄取时，为每个数据源和数据集计算一张记分卡：

| 信号 | 计算方式 |
|---|---|
| 新鲜度 | 在数据源预期周期内被修改或确认过的记录所占比例 |
| 完整度 | 具备映射器所需全部字段的记录所占比例 |
| 一致度 | 至少有另一个数据源确认的事实所占比例 |
| 可解析度 | 能解析到某个 Context Model 实体的记录所占比例 |

总分是加权平均，权重写在配置里，每个数字都链接到背后的记录。分数带来两个结果。新的边一开始的置信度反映其数据源的分数，所以一个维护良好的数据源给出的事实，排在一个被忽视的数据源给出的同样说法之前。而且记分卡是公开的，放在每个团队都能看到的页面上，这让数据质量从一条审计发现，变得更像一张联赛积分榜。

## 第七层：API 与 MCP 服务器 {#layer-seven-the-api-and-the-mcp-server}

一个 Go 二进制用同一套查询提供三个出口：供系统和前端使用的 REST API，供智能体使用的 MCP 服务器，以及一个提供已生成产出物的静态端点。把它们放在一个进程里是有意为之。一个智能体和一个人看同一个实体时，必须看到同样的事实，而保证这一点最简单的办法，就是不要有两套实现。

大部分设计精力都花在了 MCP 服务器上，因为给智能体用的工具是一种接口，它的规则和给程序用的 API 不同。Kestrel 的服务器提供了少数几个：

| 工具 | 输入 | 返回 |
|---|---|---|
| `search_entities` | 文本，可选的种类 | 匹配的实体，附带 id、种类和一行摘要 |
| `get_entity` | id | 实体本身、它的属性、它的地位和它的直接边 |
| `find_owner` | id 或自由文本名称 | 所属团队、所有权是如何确立的，以及置信度 |
| `impact_of_change` | id，深度 | 给定深度内的依赖方，按距离分组 |
| `explain_fact` | 边 id | 一条边背后的证据：数据源、观测、依据、谁确认了它 |
| `list_decisions` | id | 约束该实体的架构决策 |
| `render_diagram` | id，视图 | 该实体周边的一张 Mermaid 图 |

塑造它们的有三条规则。**工具以实体为中心**，因为比起通用查询语言，智能体从「把这个东西和它周围的东西给我」出发推理得更好。**每个回答都带着出处**，这样智能体可以引用事实的来源，人也可以去核查。**回答要小**，给出智能体可以继续追问的 id，而不是整张子图，因为这个平台的意义在于替智能体省 token，而不是把它的上下文窗口淹没。经济上的理由我在 [The Economics of Inference](/articles/the-economics-of-inference/) 里讲过，工具设计上的理由则在 [Tools: How Agents Actually Do Things](/articles/tools-how-agents-actually-do-things/) 里。

一个 `find_owner` 的回答是这样的：

```json
{
  "entity": "ctx:Namespace/claims-prod",
  "owner": "ctx:Team/claims-platform",
  "basis": "derived",
  "confidence": 0.93,
  "path": [
    "ctx:Namespace/claims-prod <- runs_in - ctx:Workload/claims-prod/policy-admin",
    "ctx:Workload/claims-prod/policy-admin <- deployed_as - ctx:Application/policy-admin",
    "ctx:Application/policy-admin - owned_by -> ctx:Team/claims-platform (asserted, earepo)"
  ],
  "last_seen": "2026-11-12T03:04:11Z"
}
```

为了让编程智能体能用上它，仓库里带着一份项目范围的 MCP 配置。在 Claude Code 里，那就是仓库根目录下的一个 `.mcp.json`：

```json
{
  "mcpServers": {
    "it-intelligence": {
      "type": "http",
      "url": "http://localhost:8080/mcp"
    }
  }
}
```

在公司里，同样的条目指向共享实例，并写进每个新仓库起步所用的模板。从那以后，每台笔记本电脑上的每个编程智能体，都能在针对某个服务写代码之前先问一句它归谁所有。

## 第八层：前端 {#layer-eight-the-frontend}

Next.js 前端在技术上是最无趣的一层，却决定了人们会不会再回来。它有五个视图：

- **实体页面**，每个实体一页，展示属性、按种类分组的边、悬停时显示的出处，以及一个在事实过时后变成琥珀色的「最后一次见到」。
- **图视图**，展示任意实体的周边，可按关系种类和深度筛选。
- **评审队列**，每个团队一个，列出等待确认的推断链接，每条旁边附着模型给出的理由。
- **数据源记分卡**，也就是第六层的那张联赛积分榜。
- **产出物**，`BuildArtifacts` 生成的一切，每一件都标注着它所依据的快照。

TypeScript 类型来自本体，所以模型一变，前端就编译不过，直到它跟上为止。这是正确的那种摩擦。

## 第九层：产出物 {#layer-nine-artifacts}

产出物是上下文模型开始在查询之外证明自身价值的地方。`BuildArtifacts` 工作流给模型拍一张快照，然后在上面运行生成器。每一件产出物都记录着它来自哪个快照，这样它可以被复现，读者也知道它有多新。

**文本形式的图表。** 一个生成器遍历某个实体的周边，写出 Mermaid。对 Kestrel 的保单管理应用，输出是：

```text
flowchart LR
  app_policy_admin["Policy Administration<br/>owner: claims-platform"]
  repo_svc["repo: pol-adm-svc"]
  repo_ui["repo: pol-adm-ui"]
  wl["workload: policy-admin<br/>ns: claims-prod"]
  ep["endpoint: api.kestrel.example/policies<br/>WAF: enforced"]
  cap["capability: Policy Management"]
  pay["Payment Gateway"]

  app_policy_admin -->|realised_by| repo_svc
  app_policy_admin -.->|realised_by, inferred 0.82| repo_ui
  app_policy_admin -->|deployed_as| wl
  app_policy_admin -->|exposed_via| ep
  app_policy_admin -->|supports| cap
  app_policy_admin -->|depends_on| pay
```

推断边画成虚线，并标注置信度，所以图对自己知道什么是诚实的。因为它是文本，它能在代码托管平台、维基和聊天工具里渲染，还能在快照之间做差异比对，展示一个季度里系统版图发生了哪些变化。

**洞察。** 每条洞察都是一个带名字、描述和阈值的查询，在每个快照上运行。Kestrel 自带几条，在任何真实公司里往往都能找出点什么：

```sql
-- applications in production with no accountable owner
select a.id, a.name
from entity a
where a.kind = 'Application'
  and a.attributes->>'lifecycle' = 'production'
  and not exists (
    select 1 from edge e
    where e.from_id = a.id and e.kind = 'owned_by'
      and e.confidence >= 0.8
  );
```

其他洞察会找出：在每个市场单元里由不止一个平台支撑的能力（合并的候选），没有 WAF 策略却暴露在互联网上的端点，企业架构生命周期标为「已退役」却仍有工作负载在运行的应用，以及根据提交历史算出卡车因子为一的仓库。每条发现都链接到涉及的实体，所以它是一场对话的起点，而不是一份被归档了事的报告。

**草稿。** 最后一组生成器产出交给人来完成的文档：解决方案设计中的现状章节，预先填好背景和选项的架构决策记录，一份关于某次合并的简短商业论证，附带受影响的应用及其所有者。这是语言模型帮助最大的地方，也是最需要把它拴紧的地方。草稿里的每一个论断都必须引用某个实体或某条边，不满足这一点的草稿会被生成器拒绝。草稿是一个带出处的起点，永远不是答案；把它当作答案，正是我在第一篇文章里称为「对产出物的过度信任」的那种失败模式。

## 运行它 {#running-it}

```sh
git clone https://github.com/raskell-io/it-intelligence
cd it-intelligence
make up       # PostgreSQL, Temporal, api, worker and web via docker compose
make seed     # load the Kestrel Group exports
make ingest   # run IngestSource for every seeded source
open http://localhost:3000
```

第一次摄取之后，有三个地方值得看看。记分卡页面显示企业架构仓库的导出在新鲜度上得分最低，原因就是那个一年前已经下线的应用。理赔平台团队的评审队列里，放着从 `pol-adm-ui` 到 Policy Administration 的那条推断链接，附带模型的理由。在仓库里问编程智能体「claims-prod 归谁所有，什么依赖它？」，应该会得到一个引用它在图中路径的回答，只需两次工具调用，而不是二十次。

## 参考实现没有涵盖的部分 {#what-the-reference-leaves-out}

一个参考实现靠坦白自己的空缺来赢得信任。下面是几个大的。

- **身份与访问。** 参考实现没有认证。真正的部署需要为写操作提供身份，因为确认和 primary 声明上都写着一个人的名字，即便读取默认对所有人开放，正如我主张的那样。
- **规模化的真实连接器。** 这些连接器读取种子文件和少数几个公开 API。生产环境的连接器要处理分页、限流、部分失败、凭据，以及不打招呼就改模式的数据源。这项工作毫不光鲜，而且没有尽头。
- **历史。** 参考实现保留观测的历史，但实体和边是原地重建的。时间点上的问题（「迁移之前系统版图是什么样子？」）需要带有效区间的边历史，这是一个直接的扩展，但在存储和查询复杂度上都有实实在在的代价。
- **规模。** Kestrel 有四十个应用。一个大型集团有成千上万个应用和数以百万计的观测。PostgreSQL 应付得了，但递归查询需要索引、限制和一些小心，每晚的产出物构建也需要改成增量式的。
- **本体本身的治理。** 谁可以新增一种实体，这种变更如何评审，是一个组织层面的问题，仓库可以用代码评审来支持它，却回答不了它。

这些都不会改变形态。它们是一个下午就能读懂的参考实现，与一个能为整个集团运行的平台之间的差别。

## 可以从中带走什么 {#what-to-take-from-it}

如果你要建一个这样的系统，顺序比工具更重要。先写本体，再由它生成。把观测和实体分开。让每一条关系都成为一行，带着依据、置信度和来源。公开给你的数据源打分。把 MCP 服务器和 API 放在同一个进程里。从快照生成文本形式、带出处的产出物。其余的一切，数据库、工作流引擎、前端框架、模型提供方，都是可以日后再议的选择。

这个仓库就是拿来拆的。如果你用自己的导出数据运行它，而模型弄错了什么，那是可能发生的最有用的事，我很想听听。

## 参考资料 {#references}

- Raffael Schneider，[IT Intelligence: The Missing Data Layer of Enterprise IT](/articles/it-intelligence/)，配套文章，论证了为什么需要这个平台。
- [LinkML](https://linkml.io/)，Linked Data Modeling Language，以及它的[生成器](https://linkml.io/linkml/generators/)。
- [Temporal](https://temporal.io/)，持久化工作流执行。
- [PostgreSQL documentation on recursive queries](https://www.postgresql.org/docs/current/queries-with.html)（`WITH RECURSIVE`）。
- [Apache AGE](https://age.apache.org/)，在 PostgreSQL 上用 openCypher 做图查询。
- [Model Context Protocol](https://modelcontextprotocol.io/)，以及[官方 Go SDK](https://github.com/modelcontextprotocol/go-sdk)。
- [Mermaid](https://mermaid.js.org/)，文本形式的图表。
- [Backstage software catalog](https://backstage.io/docs/features/software-catalog)，实体模型在开发者门户领域的前身。
- Simon Brown，[The C4 model](https://c4model.com/)，适合作为生成器输出目标的架构视图。
- Michael Nygard，[Documenting Architecture Decisions](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions)。
