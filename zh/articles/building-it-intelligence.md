---
title: "构建 IT Intelligence：一个仓库里的参考实现"
url: https://raskell.io/zh/articles/building-it-intelligence/
author: Raffael Schneider
date: 2026-11-16
description: "如何用开源组件搭建一个 Enterprise Context Platform（企业上下文平台）：本体、连接器、工作流、存储、API、MCP 和界面，全部放在一个你可以运行的仓库里。"
tags: [enterprise-architecture, context-engineering, agents, provenance, oss, durable-execution, knowledge-management]
lang: zh-Hans
translation_of: https://raskell.io/articles/building-it-intelligence/
---

# 构建 IT Intelligence：一个仓库里的参考实现

## 简而言之

这是我上一篇文章里那个 IT Intelligence 平台的参考实现，放在一个开源仓库里，里面住着一家刻意弄得杂乱的虚构公司：Kestrel Group。 本体先行，其余一切都由它生成或以它为准做校验；来自数据源的观测，与模型从中得出的实体分开保存。 每一条关系都是一行记录，带着依据、置信度和来源；身份解析从共享键到规则再到模型推断逐层进行，不确定的链接排进队列，等待所属团队确认。 一个独立于 API 的工作流编排器负责数据摄取，支持重试和断点续跑；数据源的评分公开可见；API 同时提供 REST 和一个 MCP 服务器，后者给出的回答以实体为中心、篇幅很小，并且总是带着出处。 层次的顺序比工具更重要；数据库、工作流引擎、前端和模型提供方都是可以日后再议的选择，而一套测试会对照运行中的系统检查这篇文章里的说法。

在 [IT Intelligence](https://raskell.io/articles/it-intelligence/) 一文里我提出，大公司为自己的销售数字建起来的东西，从来没有为自己的 IT 建过：一个模型，知道有哪些东西存在、归谁所有、彼此如何相连、是否符合战略，并且每一个为它工作的人和智能体都能读懂。接下来那个显而易见的问题很公道：真要把它建出来，是什么样子？

这篇文章就是回答，在不展示任何真实系统版图的前提下，我尽量写得具体。它会带你走一遍一个参考实现，全部放在一个开源仓库 [raskell-io/it-intelligence](https://github.com/raskell-io/it-intelligence) 里，里面有一家虚构的公司。你可以克隆它，在笔记本电脑上运行它，把一个编程智能体接到它上面，并看到第一篇文章描述过的每一层：连接器、工作流编排、持久化存储、Context Model 本身、带 MCP 服务器的 API 后端、前端，以及把模型变成产出物的分析。

这个参考实现比我在工作中运行的那个平台更小、更简单，也更平淡无奇，但它的形态是一样的，而我想展示的正是形态。

## 虚构的公司 {#the-fictional-company}

下面的每个例子都用 **Kestrel Group**：一家虚构的金融集团，有三个市场单元、大约四十个应用、十几个团队、两个容器集群、一个 WAF、一个 API 网关，以及常见的那一堆记录系统。仓库以种子文件的形式提供 Kestrel，这些文件模仿你从真实工具里导出的东西：企业架构仓库里的应用清单，IT 服务管理工具里的配置项和事件单，代码托管平台上的仓库和团队，集群里的命名空间和工作负载，WAF 里的策略，网关里的路由。

种子数据是刻意弄乱的。不同系统里的名字各不相同，两个应用声称拥有同一个仓库，一个命名空间没有所有者标签，一个市场单元运行着自己的集成平台而集团 IT 里没人知道，企业架构仓库里还列着一个一年前就已下线的应用。一个干净的演示什么也证明不了，因为 IT Intelligence 的价值，恰恰体现在数据源彼此矛盾的地方。

## 系统的形态 {#the-shape-of-the-system}

*it-intelligence, the reference implementation*

```text
   ┌────────────────────────┐
   │ seed/ or real sources  │
   └────────────┬───────────┘
                ▼
   ┌────────────────────────┐
   │ connectors (Go)        │
   └────────────┬───────────┘
                ▼
   ┌────────────────────────┐     ┌──────────────────────┐
   │ workflow orchestrator: │ ──▶ │ PostgreSQL:          │
   │ extract, judge,        │     │ observations,        │
   │ build, score           │     │ entities, edges,     │
   └────────────┬───────────┘     │ scorecards,          │
                │ LLM calls       │ artifacts            │
                ▼                 └──────────┬───────────┘
   ┌────────────────────────┐                │
   │ resolver (pluggable    │                │
   │ model provider)        │                │
   └────────────────────────┘                ▼
   ┌──────────────────┐      ┌──────────────────────────┐
   │ web (Next.js)    │ ◀──▶ │ API (Go): REST, MCP,     │
   └──────────────────┘      │ artifacts; starts runs   │
                             └─────┬──────────────┬─────┘
                                   ▲              ▲
                     coding agents (MCP)   other systems (REST)

   ontology/ (LinkML) ──▶ generated types, store vocabulary, JSON Schema, OWL
```

六个活动部件，外加一个凌驾于它们之上的文件。我会按照你构建它们的顺序逐一讲解，这和数据流经它们的顺序并不相同。本体排在最前，因为其余一切要么由它生成，要么以它为准做校验。

## 仓库 {#the-repository}

```text
it-intelligence/
  ontology/       context_model.yaml, entities.yaml, relations.yaml: the Context Model in LinkML
    generated/    JSON Schema, OWL, SHACL, the store vocabulary (do not edit)
  cmd/itx/        the one binary: serve, worker, ingest, verify, runs, snapshot
  connectors/     one package per source kind: earepo/ itsm/ githost/ cluster/ waf/ gateway/
  mapping/        observations to candidate entities and edges, one mapper per connector
  resolver/       identity resolution: keys, rules, inference, pluggable model providers
  workflows/      the workflows, and runner/, the minimal orchestrator that runs them
  store/          PostgreSQL migrations and the generated vocabulary
  api/            REST, MCP and the queries both share
  artifacts/      Mermaid diagrams and insights
  web/            Next.js frontend
  config/         sources, resolver thresholds and rules, people, the verify baseline
  seed/           the Kestrel Group as source-shaped exports, plus an answer key
  deploy/         docker compose for a laptop, a Helm chart for a cluster
  docs/           architecture, decision records, adding a source
  .mcp.json       lets a coding agent in this repo use the MCP server
  Makefile
```

这里选择单一仓库，理由很平淡：本体会变，而它一变，存储、映射器、API、MCP 工具和前端类型都得跟着变。在一个仓库里，这是一个拉取请求、一次评审、一次 CI 运行。分散在五个仓库里，它就成了一个协调问题，而这正是这个平台本来要消除的那类问题。

技术栈从头到尾都是开源的，选它们是因为它们不会带来意外：

| 关注点 | 参考实现中的选择 | 原因 | 合理的替代方案 |
|---|---|---|---|
| 本体 | [LinkML](https://linkml.io/) | 一份 YAML 模式，生成多种产物，并通向 RDF 和 OWL | 直接用 OWL 加 SHACL，或只用 JSON Schema |
| 持久化 | PostgreSQL | 人人都能运行，递归查询覆盖了大部分图需求 | PostgreSQL 上的 Apache AGE，专用图数据库 |
| 编排 | 一个持久化工作流编排器，作为独立于 API 的组件；参考实现自带一个基于 PostgreSQL 的最小编排器 | 重试、断点续跑、调度以及等待人来处理的长时间等待属于平台，而不属于每一个请求 | [Temporal](https://temporal.io/)，[Restate](https://restate.dev/)，[Aqueduct](https://github.com/raskell-io/aqueduct)，或类似的引擎 |
| 后端 | Go | 一个静态二进制 `itx`，既作为 API 运行（`itx serve`），也作为工作流 worker 运行（`itx worker`） | 任何有 MCP SDK 的语言 |
| 智能体接口 | [Model Context Protocol](https://modelcontextprotocol.io/) | 编程智能体本来就会说的语言 | 带 OpenAPI 描述的 REST |
| 前端 | Next.js | 能很快做出实体页面、图视图和评审队列 | 任何 Web 框架 |
| 图表 | 文本形式的 [Mermaid](https://mermaid.js.org/) | 可做差异比对，能在代码托管平台、维基和聊天工具里渲染 | Structurizr DSL，PlantUML |

换掉其中任何一个，设计都不会改变。换不掉的，是各层的顺序以及每一层遵循的规则。

### 为什么用 Go {#why-go}

有一个选择值得多说几句，而不只是表格里的一行，因为几乎任何一个大公司要运行十年的平台，我都会再这样选一次：后端用 Go 来写。

企业里的代码被阅读的次数远多于被编写的次数，读它的人往往不是写它的人，常常是在多年以后，而且带着一些压力。Go 正是为这样的读者而设计的。做一件事通常只有一种地道的写法，`gofmt` 决定了排版，所以一个团队写的代码和另一个大洲上的外包人员写的代码看起来一模一样。一切都是显式的、有类型的：错误是值，在发生的地方处理；依赖是传进来的，而不是由框架注入；也没有一层层的继承体系要先爬完，才能找到真正干活的那一行。企业级 Java 出了名的那套机制，这门语言大多根本不提供，所以工厂的工厂永远不会被写出来。一位新同事，或者一个编程智能体，可以打开 `resolver/`，不用向导就能顺着读下去。

依赖按它们所在的位置命名。导入路径就是模块路径，对大多数模块来说，那就是一个 Git 仓库的地址；模块文件锁定版本，校验和文件守护着它们：

```go
// go.mod (trimmed)
module github.com/raskell-io/it-intelligence

require (
	github.com/jackc/pgx/v5 v5.12.0
	github.com/modelcontextprotocol/go-sdk v1.8.0
)
```

在模块内部，包按路径互相导入，并从源码编译。正是这一点让单一仓库的成本很低：映射器、解析器、REST API 和 MCP 服务器共用生成的 `vocab` 包，没有人需要发布一个内部库、给它打版本、再等它进入制品仓库。改动本体，重新生成，`go build ./...` 几秒之内就会告诉你所有坏掉的地方。

它快在两处。整个仓库连同依赖做一次干净构建，在我的笔记本电脑上大约需要二十秒，改动之后的重新构建不到两秒，所以反馈回路一直很短；而构建的结果是一个静态二进制，启动即用，处理请求时占用的内存很少，这正是 API 和 worker 都需要的。工具链是自带的：`go test`、`go vet`、竞态检测器、用于性能剖析的 `pprof`，以及适用于各种编辑器的 `gopls`，没有什么需要挑选或配置。而且 [Go 1 兼容性承诺](https://go.dev/doc/go1compat) 意味着今天写的代码十年后依然能构建，而这正是企业软件真正存活的时间尺度。

Go 也有它的代价。`if err != nil` 写多了会显得重复；类型系统没有和类型（sum type），所以本体的一部分精确性只能落在校验里，而不是类型里；泛型来得晚，而且刻意做得很克制。前端我用 TypeScript，因为生态在那里。但对于平台中那个必须正确、平淡、并且下一个人读得懂的部分，我不知道还有什么更合适的选择。

## 第一层：本体 {#layer-one-the-ontology}

Context Model 就是本体，它放在 `ontology/` 里：`context_model.yaml`，以及它导入的两个文件 `entities.yaml` 和 `relations.yaml`。我用 LinkML，是因为它让模型只需用可读的 YAML 写一次，然后生成系统各部分所需的形式：用于校验的 [JSON Schema](https://json-schema.org/)，存储的词汇表（实体种类和关系种类的表，以及一个拒绝任何超出定义域和值域的边的触发器），供想用语义网工具对它做推理的人使用的 [OWL](https://www.w3.org/TR/owl2-overview/) 和 [SHACL](https://www.w3.org/TR/shacl/)，Python 和 TypeScript 模型，以及人能读的文档。Go 类型则由 JSON Schema 生成。

Kestrel 模型的精简版：

```yaml
# ontology/entities.yaml (trimmed)
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
  MarketUnit:
    is_a: Entity

enums:
  Standing:
    permissible_values:
      secondary: {description: mirrored from an authoritative system}
      primary: {description: the Context Model is authoritative}
```

关系是一套由槽构成的封闭词汇。LinkML 每个槽只允许一个定义域，所以当一种关系可以从几种实体出发时，就由注解为生成存储词汇表的那个生成器携带完整的定义域和值域：

```yaml
# ontology/relations.yaml (trimmed)
slots:
  deployed_as:
    description: The application runs as this workload.
    domain: Application
    range: Workload
    multivalued: true
    annotations: {ctx_domain: Application, ctx_range: Workload, ctx_cardinality: many}
  runs_in:
    description: The workload runs in this namespace.
    domain: Workload
    range: Namespace
    annotations: {ctx_domain: Workload, ctx_range: Namespace, ctx_cardinality: one}
  owned_by:
    description: The accountable team.
    range: Team
    annotations: {ctx_domain: "Application Repository Workload Namespace Endpoint", ctx_range: Team, ctx_cardinality: one}
```

构建它的过程中得出了四条建模规则，它们比语法更重要。

**核心要小。** Kestrel 有九种实体和正好十五种关系。每一个新种类都必须用它能让人回答的某个问题来证明自己存在的必要。正如我在第一篇文章里写的，失败模式是本体无序膨胀，而防线是一份一个人能在白板上讲清楚的模式。

**把实体和观测分开。** 观测是某个数据源在某个时间点说过的话：导出文件里的一行，API 返回的一个 JSON 对象。实体是 Context Model 综合所有观测得出的结论。把两者混在一起，目录就会变成数据源的副本，连同它们所有的矛盾。

**让关系成为一等公民。** 在本体里，关系是一个槽。在存储里，每一条关系都成为单独的一行，带着依据、置信度、来源和「最后一次见到」的时间。只有这样才能回答「模型为什么这么认为？」，而这个问题决定了是否有人信任它。

**能力地图取自企业架构，而不是平台团队。** `Capability` 由集团自己的能力模型填充。正是这一个决定，让「哪些系统在每个市场单元里支撑理赔处理」这样的问题成为一次查询，战略也正是由此进入模型的。

`make ontology` 会重新生成 `ontology/generated/` 里的一切，生成文件过期时 CI 会失败。本体就是代码，像代码一样接受评审。

## 第二层：存储 {#layer-two-the-store}

PostgreSQL 存放五样东西：观测、实体、边、记分卡和产出物。它们周围还有几张辅助表：别名（每个数据源对某个实体使用的名字），数据集登记表，一份记录每一次确认和声明的只追加日志，录制下来的模型判断，快照，以及工作流运行的状态。核心部分短到可以展示出来：

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
  id            text primary key,       -- a stable hash of kind, endpoints and source
  kind          text not null references relation_kind(kind),
  from_id       text not null references entity(id),
  to_id         text not null references entity(id),
  basis         text not null,          -- 'asserted' | 'derived' | 'inferred'
  confidence    double precision not null,
  status        text not null,          -- 'active' | 'pending' | 'rejected'
  source        text not null,
  evidence      jsonb not null default '{}',
  confirmed_by  text,
  confirmed_at  timestamptz,
  last_seen     timestamptz,
  unique (kind, from_id, to_id, source)
);
```

观测只追加。任何东西都不会被覆盖，所以模型总能根据数据源说过的话重建，每一条边也都能通过它的 `evidence` 指回产生它的那些观测。

`basis` 这一列承载着第一篇文章里的那个区分。**asserted**（断言）边直接来自数据源自己的键：集群说这个工作负载运行在那个命名空间里。**derived**（推导）边由规则从其他边得出：工作负载运行在某个团队所有的命名空间里，所以除非另有说明，这个团队就拥有这个工作负载。**inferred**（推断）边由解析器提出，通常借助模型，带着置信度和背后的理由。当一个团队确认了一条推断边，`confirmed_by` 和 `confirmed_at` 就会被填上，这条边变成断言边，上面写着一个人的名字。表上的一个触发器会对照由本体生成的词汇表检查每一条边，所以存储里不可能存放模型不允许的关系。

这些都不需要一个出处标准就能运作，但它与一个现成的标准对得上。用 W3C [PROV-O](https://www.w3.org/TR/prov-o/) 的术语来说，一条边是一个实体（entity），它派生自其 `evidence` 里的那些观测，并归属于它的 `source`，或者在确认之后归属于某个人。参考实现不导出 PROV，也还没有记录是哪一次摄取运行产生了某条边，也就是 PROV 术语中的活动（activity）；如果另一个工具需要这条谱系，这两处就是起点。

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

映射是单独的一步，每个连接器配一个映射器，它把观测变成**断言**：候选实体和候选边，每一个都标记着它来自哪条观测。种类和关系的常量来自一个由本体生成的 `vocab` 包，所以映射器无法凭空发明一种关系。

```go
// mapping/mappers.go, the cluster mapper (trimmed)
func (clusterMapper) Map(ctx Context, o connectors.Observation) (Assertions, error) {
	a := start(o)
	var k k8sObject
	if err := decode(o, &k); err != nil {
		return a, err
	}
	if o.Dataset == "workloads" {
		wl := a.Entity(vocab.Workload, k.Metadata.Namespace+"/"+k.Metadata.Name, k.Metadata.Name, nil)
		a.Edge(vocab.RunsIn, wl, Key(vocab.Namespace, k.Metadata.Namespace), Asserted)
		// The cheapest win in the whole system: a label carrying the EA application id
		// turns an inference into an assertion.
		if app := k.Metadata.Labels[ctx.Config.ApplicationLabel]; app != "" {
			a.Edge(vocab.DeployedAs, Alias(vocab.Application, "earepo:applications", app), wl, Asserted)
		}
	}
	return a, nil
}
```

这样拆分让连接器可以复用，因为同一个代码托管平台连接器适用于任何公司；公司特有的知识则留在映射器里，在那里可以被评审。这也意味着连接器可以由拥有该数据源的团队来写，贡献正是这样开始的。在参考实现里，加一个数据源只需要三个文件：一个连接器，一个映射器，和一份用来测试的种子导出。

对标签的检查不只关乎这一个映射器：每个在自己的部署里加上企业架构应用 ID 的团队，都会把模型的一次推断变成一条断言，第二天早上记分卡就会体现出这份改进。

## 第四层：身份解析 {#layer-four-identity-resolution}

映射会为同一个东西产生许多候选。企业架构仓库写的是「Policy Administration」，代码托管平台上有 `pol-adm-svc` 和 `pol-adm-ui`，集群在命名空间 `claims-prod` 里运行着 `policy-admin`，IT 服务管理工具里有一个叫「PAS」的业务服务。解析要决定其中哪些是同一个实体。

它分三轮进行，从便宜而确定到昂贵而不确定：

1. **键。** 跨数据源共享的标识符，比如部署标签里的应用 ID，或者仓库元数据文件里的 CMDB 引用，产生断言链接。
2. **规则。** 精度已知的确定性启发式规则：规范化之后完全相同的名字，一个所属团队恰好只拥有一个应用的仓库，命名空间的命名约定。它们产生推导链接。
3. **推断。** 剩下的交给模型。每个候选项会得到一份最多五个应用的简短清单，先是其所属团队的应用，然后是名字最相近的应用；模型看到候选项的名字、README 摘录或描述、所有者和命名空间，然后返回一个结构化的判断。

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

「PAS」，也就是 IT 服务管理工具里的那个业务服务，也以同样的方式解析：模型以 0.93 的置信度把它链接到 Policy Administration，因为 PAS 是常用的缩写，它的支持组拥有这个应用，而它的事件单文本里提到了 `pol-adm-svc`。

阈值是明确的，写在配置里。高于 0.9，链接作为推断链接存储并正常显示。介于 0.6 和 0.9 之间，链接作为推断链接存储，并排进队列等待所属团队确认。低于 0.6 则丢弃并记录日志。推断链接永远不会被悄悄提升为断言链接；那需要一个人来做。模型提供方是可插拔的。默认情况下，参考实现回放录制好的判断，所以它可以离线运行，不需要 API 密钥，每次都给出同样的答案；在 `config/resolver.yaml` 里改一行，就能切换到本地模型或托管模型，效果很好，因为输入是元数据，提示词也很小。

这是一个老问题。统计学家称之为记录链接（record linkage），Ivan Fellegi 和 Alan Sunter 在 1969 年为它给出了一套形式化理论：两个阈值把候选对分成链接、非链接，以及交给人来复核的可能链接。上面的三个区间是同一个思路，只是在他们的理论使用匹配权重的地方，换成了模型的判断。如果你的数据源存有数以百万计的记录，而不是几百个应用，可以看看 [Splink](https://moj-analytical-services.github.io/splink/)，这是英国司法部（UK Ministry of Justice）对这种概率方法的开源实现。

## 第五层：工作流 {#layer-five-workflows}

数据摄取要和不稳定的数据源打交道，还要调用会超时的模型，所以它需要每一步单独重试、崩溃之后能接着运行、调度，以及一个可以查看发生了什么的地方。而且这里的事情并不都很快：一条链接要等团队确认，一次 primary 声明要等第二个人批准，两者都可能搁置好几天，其间也许有人在休假，提醒则通过邮件发出。这些工作不属于 API。所以工作流编排是一个独立的组件：API 是控制面，它启动运行并报告运行情况，但从不亲自执行，执行由编排器来做。

在生产环境里，这个编排器是一个持久化工作流引擎，Temporal、Restate 或类似的东西；设计并不取决于选哪一个。

其中一个候选是我自己的：[Aqueduct](https://github.com/raskell-io/aqueduct)，一个用 Rust 写的持久化执行引擎，为智能体编写、人来批准的流程而建。它在每一步被计入之前先把它写进日志，带超时地等待一个人（通过一个信号，或一个任何人都能完成的 id；如果没人回应，就上报给另一个人），并通过 gRPC 或 HTTP 在任何语言写的 worker 上运行步骤，所以这里的步骤可以继续用 Go 写。它还很年轻，它自己的 README 也请大家暂时不要依赖它，所以我把它列为一个选项，而不是默认选择。

参考实现自带一个基于 PostgreSQL 的最小编排器，遵循同样的契约，作为一个单独的进程 `itx worker` 运行，所以它在笔记本电脑上就能跑，不需要另装任何东西。一个工作流是一串固定的、幂等的步骤：

```go
// workflows/workflows.go (trimmed)
modelSteps := []runner.Step{
	{Name: "Judge", Run: d.judge, Timeout: 30 * time.Minute},
	{Name: "Build", Run: d.build, Timeout: 10 * time.Minute},
	{Name: "Score", Run: d.score, Timeout: 10 * time.Minute},
}
return []runner.Workflow{
	{Name: "IngestSource", Steps: append([]runner.Step{extract}, modelSteps...)},
	{Name: "IngestAll", Steps: all},
	{Name: "ConfirmLink", Steps: []runner.Step{applyLink, build, score}},
	{Name: "DeclarePrimary", Steps: []runner.Step{applyPrimary, build}},
	{Name: "BuildArtifacts", Steps: artifactSteps},
}
```

运行和步骤尝试存放在两张表里。worker 用 `select ... for update skip locked` 认领一次运行，并持续发送心跳，所以几个 worker 可以并排运行，被崩溃进程丢下的运行会由另一个 worker 接手。一次运行从第一个没有成功的步骤处继续，重试带抖动地退避，步骤之间只传递运行 id：一个步骤产出的任何东西都写进 PostgreSQL。因为 API 和 worker 是分开的进程，它们可以分别扩展，一次缓慢的摄取永远不会拖住智能体的查询。

| 工作流 | 触发方式 | 步骤 |
|---|---|---|
| `IngestSource` | 数据源自己的时间间隔，或按需触发 | Extract、Judge、Build、Score |
| `IngestAll` | `make ingest` | 对每个数据源执行 Extract，然后是 Judge、Build、Score 以及产出物的各个步骤 |
| `ConfirmLink` | 团队在界面里确认或拒绝 | Apply、Build、Score |
| `DeclarePrimary` | 数据集所有者发起请求，由第二个人批准 | Apply、Build |
| `BuildArtifacts` | 每晚一次，以及 `IngestAll` 结束时 | Snapshot、Diagrams、Insights |

每一次运行都会显示在 `/runs` 上，连同它的步骤、尝试、错误和耗时。这一点比听起来更重要：当某个数据源的记分卡下滑时，第一个问题就是上一次摄取期间发生了什么，而答案只需点一下。最小编排器做不到的，是在工作流内部等一个人好几天、发送提醒，或者扇出成成千上万个并行任务。因此在参考实现里，`ConfirmLink` 和 `DeclarePrimary` 只在人已经作答之后才启动。持久化引擎会把这段等待移进工作流本身，这是它带来的第一样东西；而换上它是机械性的工作：这些步骤已经具备 activity 的形态，API 也从来只是启动运行、读取运行状态。

## 第六层：评分 {#layer-six-scoring}

`Score` activity 在每次摄取时，为每个数据源和数据集计算一张记分卡：

| 信号 | 计算方式 |
|---|---|
| 新鲜度 | 在数据源预期周期内被修改或确认过的记录所占比例 |
| 完整度 | 具备映射器所需全部字段的记录所占比例 |
| 一致度 | 至少有另一个数据源确认的事实所占比例，所以只有一个数据源持有的事实会拉低它的分数 |
| 可解析度 | 身份和引用全部能解析到 Context Model 实体的记录所占比例 |

总分是加权平均，权重写在配置里，每个数字都链接到背后的记录。在种子数据上完成一次摄取之后，企业架构仓库的应用得分 0.58，能力得分 0.45，集群的命名空间得分 0.75，IT 服务管理工具的业务服务得分 0.99。分数带来两个结果。每一条断言事实的初始置信度是 0.7 加上 0.3 乘以其数据源最近一次的总分，所以一个维护良好的数据源给出的事实，排在一个被忽视的数据源给出的同样说法之前；推导出的事实则继承其链条中最弱的那个置信度。而且记分卡是公开的，放在每个团队都能看到的页面上，这让数据质量从一条审计发现，变得更像一张联赛积分榜。

## 第七层：API 与 MCP 服务器 {#layer-seven-the-api-and-the-mcp-server}

API 进程 `itx serve` 用同一套查询提供三个出口：供系统和前端使用的 REST API，供智能体使用的 MCP 服务器，以及一个提供已生成产出物的静态端点。把它们放在一个进程里是有意为之。一个智能体和一个人看同一个实体时，必须看到同样的事实，而保证这一点最简单的办法，就是不要有两套实现。

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

塑造它们的有三条规则。**工具以实体为中心**，因为比起通用查询语言，智能体从「把这个东西和它周围的东西给我」出发推理得更好。**每个回答都带着出处**，这样智能体可以引用事实的来源，人也可以去核查。**回答要小**，给出智能体可以继续追问的 id，而不是整张子图，因为这个平台的意义在于替智能体省 token，而不是把它的上下文窗口淹没。经济上的理由我在 [The Economics of Inference](https://raskell.io/articles/the-economics-of-inference/) 里讲过，工具设计上的理由则在 [Tools: How Agents Actually Do Things](https://raskell.io/articles/tools-how-agents-actually-do-things/) 里。

被问到 *「claims-prod 归谁所有，什么依赖它？」* 时，仓库里的智能体会调用 `find_owner`，并在第一次摄取之后得到这样的结果：

```text
find_owner {"id": "claims-prod"}
  owner: ctx:Team/claims-platform, derived, 0.92
  path:  ctx:Namespace/claims-prod <- runs_in - ctx:Workload/claims-prod/claims-settlement (asserted, cluster)
         ctx:Workload/claims-prod/claims-settlement <- deployed_as - ctx:Application/claims-settlement (asserted, cluster)
         ctx:Application/claims-settlement - owned_by -> ctx:Team/claims-platform (asserted, itsm)
```

这个命名空间没有所有者标签，所以所有权是推导出来的，回答也如实说明了这一点。有三个理赔应用运行在 `claims-prod` 里，全都指向同一个团队；最强的那条链胜出，智能体可以引用它所依据的每一个事实。团队下一步该做什么，从回答里一目了然：在命名空间上加一个所有者标签，就能把推导变成断言。

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

**草稿**是下一步，目前还没有实现：一组生成器，用来写解决方案设计中的现状章节、预先填好的架构决策记录或一份简短的商业论证，每一份都必须为每个论断引用某个实体或某条边。这条引用规则，就是对付我在第一篇文章里称为「对产出物的过度信任」的那道防线。

## 运行它 {#running-it}

你需要 Docker，不需要 API 密钥。

```sh
git clone https://github.com/raskell-io/it-intelligence
cd it-intelligence
make up       # PostgreSQL, the API, the workflow worker and the web UI
make seed     # register the Kestrel Group sources
make ingest   # extract, judge, build, score, and build the artifacts
make verify   # check the resolver against the answer key, and this post against the system
open http://localhost:3000
```

第一次摄取之后，有三个地方值得看看。记分卡页面显示企业架构仓库的导出在新鲜度上得分最低：它的大部分记录上一次被改动是在半年多以前，其中就包括那个一年前已经下线的应用。理赔平台团队的评审队列里，放着从 `pol-adm-ui` 到 Policy Administration 的那条推断链接，置信度 0.82，附带模型给出的三条理由。在仓库里问编程智能体「claims-prod 归谁所有，什么依赖它？」，会得到一个引用它在图中路径的回答，只需两次工具调用，而不是二十次。

我最得意的部分是 `make verify`。种子数据附带一份答案表：Kestrel Group 真实的样子，由人手写下来。verify 这一步把解析出的模型与它比较，并对照运行中的系统检查这篇文章里的每一个具体说法，CI 在每次改动时都会运行它。在种子数据上，边的精确率是 0.996，召回率是 0.994，身份则都是 1.0。每条规则的精确率也会被测量，其中一条规则 `team_owns_single_app` 在它仅有的 1 个案例上答对了 0 个：它把一个实验仓库链接到了一个与之毫无关系的应用上。这正是一个参考实现应该展示而不是隐藏的东西。

## 参考实现没有涵盖的部分 {#what-the-reference-leaves-out}

一个参考实现靠坦白自己的空缺来赢得信任。下面是几个大的。

- **身份与访问。** 参考实现没有认证。写操作带着一个从「以某人身份操作」选择器里选出的名字，作为 `X-Actor` 请求头发送，因为确认和 primary 声明都需要一个名字。真正的部署需要为写操作提供真实的身份，即便读取对所有人开放，正如我主张的那样。
- **规模化的真实连接器。** 这些连接器读取种子文件；只有代码托管平台的连接器有一个小小的在线模式，面向单个 GitHub 组织。生产环境的连接器要处理分页、限流、部分失败、凭据，以及不打招呼就改模式的数据源。这项工作毫不光鲜，而且没有尽头。
- **历史。** 参考实现保留观测的历史，但实体和边是原地重建的。时间点上的问题（「迁移之前系统版图是什么样子？」）需要带有效区间的边历史，这是一个直接的扩展，但在存储和查询复杂度上都有实实在在的代价。在此之前，快照以及快照之间的 `itx snapshot diff` 是廉价的替代办法。
- **规模。** Kestrel 有四十个应用，参考实现在每次摄取时都重建整个模型。对成千上万个实体来说这没问题，对数以百万计的实体则不行。PostgreSQL 应付得了一个大型集团的系统版图，但构建必须改成增量式的，递归查询也需要索引、限制和一些小心。
- **草稿。** 用于决策记录和商业论证的生成器，连同它们的引用检查，还没有实现。
- **本体本身的治理。** 谁可以新增一种实体，这种变更如何评审，是一个组织层面的问题，仓库可以用代码评审来支持它，却回答不了它。

这些都不会改变形态。它们是一个下午就能读懂的参考实现，与一个能为整个集团运行的平台之间的差别。

## 可以从中带走什么 {#what-to-take-from-it}

如果你要建一个这样的系统，顺序比工具更重要：先写本体，其余一切由它生成；把观测和实体分开；让每一条关系都成为一行，带着依据、置信度和来源；公开给数据源打分；MCP 服务器与 API 放在同一个进程里，编排放在它之外；产出物是文本形式，从快照生成，并带着出处。数据库、工作流引擎、前端框架和模型提供方，都是可以日后再议的选择。

这个仓库就是拿来拆的。如果你用自己的导出数据运行它，而模型弄错了什么，那是可能发生的最有用的事，我很想听听：[CONTRIBUTING.md](https://github.com/raskell-io/it-intelligence/blob/main/CONTRIBUTING.md) 说明了如何添加一个数据源，issue 也是开放的。

## 参考资料 {#references}

- Raffael Schneider，[IT Intelligence: The Missing Data Layer of Enterprise IT](https://raskell.io/articles/it-intelligence/)，配套文章，论证了为什么需要这个平台。
- [raskell-io/it-intelligence](https://github.com/raskell-io/it-intelligence)，参考实现，决策记录在 `docs/adr/` 里。
- [LinkML](https://linkml.io/)，Linked Data Modeling Language，以及它的[生成器](https://linkml.io/linkml/generators/)。
- [Temporal](https://temporal.io/)、[Restate](https://restate.dev/) 和 [Aqueduct](https://github.com/raskell-io/aqueduct)，持久化执行引擎，其中任何一个都可以接替编排器的位置。
- [PostgreSQL documentation on recursive queries](https://www.postgresql.org/docs/current/queries-with.html)（`WITH RECURSIVE`）。
- [Apache AGE](https://age.apache.org/)，在 PostgreSQL 上用 openCypher 做图查询。
- [Model Context Protocol](https://modelcontextprotocol.io/)，以及[官方 Go SDK](https://github.com/modelcontextprotocol/go-sdk)。
- [Mermaid](https://mermaid.js.org/)，文本形式的图表。
- [Backstage software catalog](https://backstage.io/docs/features/software-catalog)，实体模型在开发者门户领域的前身。
- Simon Brown，[The C4 model](https://c4model.com/)，适合作为生成器输出目标的架构视图。
- [The Go 1 compatibility promise](https://go.dev/doc/go1compat)，多年前写的 Go 代码至今仍能构建，原因就在这里。
- Ivan P. Fellegi 和 Alan B. Sunter，"A Theory for Record Linkage"，*Journal of the American Statistical Association* 64, no. 328 (1969): 1183 至 1210，[doi:10.1080/01621459.1969.10501049](https://doi.org/10.1080/01621459.1969.10501049)，以阈值和人工复核做身份解析的理论基础。
- [Splink](https://moj-analytical-services.github.io/splink/)，英国司法部（UK Ministry of Justice）的开源概率记录链接工具。
- W3C，[PROV-O: The PROV Ontology](https://www.w3.org/TR/prov-o/)，描述一个事实从何而来的标准词汇。
- W3C，[OWL 2 Web Ontology Language](https://www.w3.org/TR/owl2-overview/) 和 [SHACL](https://www.w3.org/TR/shacl/)，本体被生成为的语义网形式，以及 [JSON Schema](https://json-schema.org/)，用于校验的形式。
- Michael Nygard，[Documenting Architecture Decisions](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions)。
