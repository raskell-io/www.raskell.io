+++
title = "IT Intelligence 만들기: 리포지토리 하나에 담은 참조 구현"
date = 2026-11-16
draft = true
description = "오픈 소스 부품으로 Enterprise Context Platform(엔터프라이즈 컨텍스트 플랫폼)을 만드는 방법입니다. 온톨로지, 커넥터, 워크플로, 저장소, API, MCP, UI를 직접 실행할 수 있는 리포지토리 하나에 담았습니다."

[extra]
author = "Raffael"
in_short = [
  "이 글은 지난 글에서 다룬 IT 인텔리전스 플랫폼의 참조 구현입니다. 오픈 소스 리포지토리 하나에 담겨 있고, 그 안에는 일부러 어수선하게 만든 가상의 회사 Kestrel Group이 들어 있습니다.",
  "온톨로지가 가장 먼저 오고, 나머지는 모두 온톨로지에서 생성되거나 온톨로지에 맞춰 검증됩니다. 소스에서 온 관찰은 모델이 그 관찰로부터 결론 내린 엔티티와 분리해 둡니다.",
  "모든 관계는 근거, 신뢰도, 출처를 지닌 하나의 행입니다. 아이덴티티 해석(identity resolution)은 공유 키에서 규칙으로, 다시 모델 추론으로 진행되며, 불확실한 연결은 담당 팀이 확인하도록 대기열에 올라갑니다.",
  "워크플로가 수집을 내구성 있게(durably) 실행하고, 소스는 공개적으로 점수가 매겨지며, Go 바이너리 하나가 REST와 MCP 서버를 함께 제공합니다. MCP 서버의 답은 작고 엔티티 중심이며 언제나 출처를 함께 담고 있습니다.",
  "도구보다 계층의 순서가 더 중요합니다. 데이터베이스, 워크플로 엔진, 프런트엔드, 모델 제공자는 나중에 다시 고를 수 있는 선택이며, 이 참조 구현은 자신이 남긴 빈틈에 대해 솔직합니다.",
]
+++

[IT Intelligence(IT 인텔리전스)](/articles/it-intelligence/)에서 저는 대기업들이 매출 수치를 위해서는 만들었으면서 정작 자신의 IT를 위해서는 한 번도 만들지 않은 것이 있다고 주장했습니다. 무엇이 존재하는지, 누가 그것을 소유하는지, 그것이 어떻게 연결되는지, 전략과 맞는지를 아는 하나의 모델이고, 그 일에 관여하는 모든 사람과 모든 에이전트가 읽을 수 있는 모델입니다. 그러면 당연히 다음 질문이 나오고, 충분히 물을 만한 질문입니다. 실제로 만들면 어떤 모습입니까?

이 글이 그 답입니다. 누구의 실제 IT 환경도 보여 주지 않으면서 할 수 있는 한 구체적으로 답하겠습니다. 이 글은 오픈 소스 리포지토리 하나, [raskell-io/it-intelligence](https://github.com/raskell-io/it-intelligence)에 담긴 참조 구현을 차례로 살펴봅니다. 그 안에는 가상의 회사가 들어 있습니다. 리포지토리를 클론해 노트북에서 실행하고, 코딩 에이전트를 연결해 보면, 첫 번째 글에서 설명한 모든 계층을 볼 수 있습니다. 커넥터, 워크플로 오케스트레이터, 영속 저장소, 컨텍스트 모델(컨텍스트 모델) 자체, MCP 서버를 갖춘 API 백엔드, 프런트엔드, 그리고 모델을 산출물로 바꾸는 분석입니다.

이 참조 구현은 제가 회사에서 운영하는 플랫폼이 아닙니다. 그보다 작고 단순하며, 일부러 지루하게 만들었습니다. 형태는 같고, 제가 보여 드리고 싶은 것은 바로 그 형태입니다.

## 가상의 회사 {#the-fictional-company}

아래의 모든 예시는 **Kestrel Group**을 사용합니다. 마켓 유닛 세 개, 애플리케이션 약 마흔 개, 팀 열두 개 남짓, 컨테이너 클러스터 두 개, WAF 하나, API 게이트웨이 하나, 그리고 흔히 보는 기록 시스템(system of record) 몇 가지를 갖춘 가상의 금융 그룹입니다. 리포지토리는 Kestrel을 실제 도구에서 내보낸 데이터를 흉내 낸 시드 파일로 제공합니다. EA 리포지토리의 애플리케이션 목록, IT 서비스 관리 도구의 구성 항목과 인시던트, Git 호스트의 리포지토리와 팀, 클러스터의 네임스페이스와 워크로드, WAF의 정책, 게이트웨이의 라우트입니다.

시드 데이터는 일부러 어수선하게 만들었습니다. 시스템마다 이름이 다르고, 두 애플리케이션이 같은 리포지토리를 자기 것이라고 주장하며, 한 네임스페이스에는 소유자 레이블이 없고, 한 마켓 유닛는 그룹 IT의 누구도 모르는 자체 통합 플랫폼을 운영하며, EA 리포지토리에는 1년 전에 운영을 종료한 애플리케이션이 올라 있습니다. 깔끔한 데모는 아무것도 증명하지 못합니다. IT 인텔리전스에서 흥미로운 부분은 소스들이 서로 다르게 말할 때 무슨 일이 일어나는가입니다.

## 시스템의 형태 {#the-shape-of-the-system}

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

움직이는 부품 여섯 개와, 그 모두의 위에 놓인 파일 하나입니다. 저는 이것들을 데이터가 흐르는 순서가 아니라 실제로 만들 순서대로 살펴보겠습니다. 온톨로지가 가장 먼저입니다. 나머지는 모두 온톨로지에서 생성되거나 온톨로지에 맞춰 검증되기 때문입니다.

## 리포지토리 {#the-repository}

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

여기서 모노레포가 옳은 선택인 데는 지루한 이유가 있습니다. 온톨로지는 바뀌고, 바뀔 때마다 저장소, 매퍼, API, MCP 도구, 프런트엔드 타입이 모두 함께 바뀌어야 합니다. 리포지토리 하나라면 그것은 풀 리퀘스트 하나, 리뷰 하나, CI 실행 한 번입니다. 리포지토리 다섯 개에 흩어져 있으면 조율의 문제가 되는데, 그것이 바로 이 플랫폼이 없애려는 종류의 문제입니다.

스택은 처음부터 끝까지 오픈 소스이고, 놀랄 일이 없다는 이유로 골랐습니다.

| 관심사 | 참조 구현의 선택 | 이유 | 합리적인 대안 |
|---|---|---|---|
| 온톨로지 | [LinkML](https://linkml.io/) | YAML 스키마 하나에서 여러 산출물이 생성되고, RDF와 OWL로 이어지는 다리가 있음 | OWL과 SHACL 직접 사용, JSON Schema 단독 |
| 영속성 | PostgreSQL | 누구나 운영할 수 있고, 재귀 쿼리로 그래프 요구 대부분을 처리함 | PostgreSQL 위의 Apache AGE, 전용 그래프 데이터베이스 |
| 오케스트레이션 | [Temporal](https://temporal.io/) | 내구성 있고 재시도 가능하며 관찰 가능한 워크플로, 스케줄 기능 내장 | Airflow, Dagster, Argo Workflows |
| 백엔드 | Go | REST와 MCP를 위한 정적 바이너리 하나, 신경 쓸 필요 없을 만큼 빠름 | MCP SDK가 있는 어떤 언어든 |
| 에이전트 인터페이스 | [Model Context Protocol](https://modelcontextprotocol.io/) | 코딩 에이전트가 이미 사용하는 프로토콜 | OpenAPI 명세를 갖춘 REST |
| 프런트엔드 | Next.js | 엔티티 페이지, 그래프 뷰, 리뷰 대기열을 빠르게 만들 수 있음 | 어떤 웹 프레임워크든 |
| 다이어그램 | 텍스트로 쓴 [Mermaid](https://mermaid.js.org/) | diff가 가능하고, Git 호스트와 위키와 채팅에서 렌더링됨 | Structurizr DSL, PlantUML |

이 선택들 중 어느 것도 핵심이 아닙니다. 무엇을 바꾸든 설계는 유지됩니다. 잘 바뀌지 않는 것은 계층의 순서와 각 계층이 따르는 규칙입니다.

## 첫 번째 계층: 온톨로지 {#layer-one-the-ontology}

컨텍스트 모델이 곧 온톨로지이고, 파일 하나 `ontology/context_model.yaml`에 들어 있습니다. 제가 LinkML을 쓰는 이유는 모델을 읽기 쉬운 YAML로 한 번만 쓰고, 시스템의 각 부분이 필요로 하는 형태로 생성할 수 있기 때문입니다. 검증을 위한 JSON Schema, 저장소를 위한 SQL, 시맨틱 웹 도구로 추론하고 싶은 사람을 위한 OWL과 SHACL, Python과 TypeScript 모델, 그리고 사람이 읽을 수 있는 문서입니다. Go 타입은 JSON Schema에서 생성됩니다.

Kestrel 모델을 줄인 버전입니다.

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

관계는 따로 선언합니다. 각 관계가 도메인(domain)과 레인지(range)를 지닌 닫힌 어휘입니다.

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

이것을 만들면서 모델링 규칙 네 가지가 나왔고, 이 규칙들은 문법보다 중요합니다.

**핵심을 작게 유지합니다.** Kestrel에는 엔티티 종류가 아홉 개, 관계 종류가 약 열다섯 개 있습니다. 새 종류는 누군가가 답할 수 있게 되는 질문 하나로 자신의 존재를 정당화해야 합니다. 첫 번째 글에서 썼듯이 실패 양상은 온톨로지의 무분별한 확장이고, 이를 막는 방법은 한 사람이 화이트보드 앞에서 설명할 수 있는 스키마입니다.

**엔티티와 관찰을 분리합니다.** 관찰은 소스가 특정 시점에 말한 것입니다. 내보낸 데이터의 한 행, API에서 온 JSON 객체 하나입니다. 엔티티는 컨텍스트 모델이 모든 관찰을 종합해 내린 결론입니다. 둘을 섞으면 카탈로그는 소스의 사본이 되고, 소스의 모순도 고스란히 물려받습니다.

**관계를 일급 객체로 만듭니다.** 온톨로지에서 관계는 슬롯입니다. 저장소에서는 모든 관계가 근거, 신뢰도, 출처, “last seen”을 지닌 독립된 행이 됩니다. “모델은 왜 이렇게 생각하는가?”라는 질문에 답하는 방법은 이것뿐이고, 누군가가 모델을 신뢰할지는 바로 이 질문이 결정합니다.

**역량 맵은 플랫폼 팀이 아니라 엔터프라이즈 아키텍처에서 가져옵니다.** `Capability`는 그룹 자체의 역량 모델로 채워집니다. 이 결정 하나 덕분에 “모든 마켓 유닛에서 보험금 청구 처리를 지원하는 시스템은 무엇인가” 같은 질문이 쿼리가 되고, 전략은 이렇게 모델 안으로 들어옵니다.

`make ontology`는 `ontology/generated/`의 모든 것을 다시 생성하고, 생성된 파일이 최신이 아니면 CI가 실패합니다. 온톨로지는 코드이고, 코드처럼 리뷰됩니다.

## 두 번째 계층: 저장소 {#layer-two-the-store}

PostgreSQL은 다섯 가지를 담습니다. 관찰, 엔티티, 엣지, 스코어카드, 산출물입니다. 스키마는 거의 전부를 보여 드릴 수 있을 만큼 짧습니다.

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

관찰은 추가 전용(append-only)입니다. 어떤 것도 덮어쓰지 않으므로 모델은 언제나 소스가 말한 것으로부터 다시 만들어질 수 있고, 모든 엣지는 `evidence`를 통해 자신을 만든 관찰을 가리킬 수 있습니다.

`basis` 열은 첫 번째 글에서 말한 구분을 담습니다. **asserted**(단언된) 엣지는 소스 자체의 키에서 곧바로 나온 것입니다. 클러스터가 이 워크로드는 저 네임스페이스에서 실행된다고 말하는 경우입니다. **derived**(도출된) 엣지는 규칙에 따라 다른 엣지들로부터 따라 나옵니다. 워크로드가 어떤 팀이 소유한 네임스페이스에서 실행되므로, 달리 말하는 것이 없으면 그 팀이 워크로드를 소유한다는 식입니다. **inferred**(추론된) 엣지는 리졸버가 대개 모델의 도움을 받아 제안한 것으로, 신뢰도와 그 근거가 된 추론을 함께 지닙니다. 팀이 추론된 엣지를 확인하면 `confirmed_by`와 `confirmed_at`이 설정되고, 엣지는 사람의 이름이 붙은 단언된 엣지가 됩니다.

왜 그래프 데이터베이스가 아니라 PostgreSQL입니까? 아키텍트와 에이전트가 묻는 것 대부분은 엔티티에서 한두 홉 떨어진 것이고, 나머지는 재귀 쿼리가 잘 처리하는 범위가 정해진 탐색이기 때문입니다. 고전적인 “이것을 바꾸면 무엇이 깨지는가” 질문은 이렇습니다.

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

그래프가 이 방식으로 편하게 처리할 수 있는 규모를 넘어서면, [Apache AGE](https://age.apache.org/)가 같은 PostgreSQL 인스턴스에 openCypher 쿼리를 더해 주고, 전용 그래프 데이터베이스는 나중에 따로 내릴 결정입니다. 모든 팀이 이미 운영할 줄 아는 데이터베이스로 시작하는 것이 첫날부터 그래프 쿼리 언어의 우아함을 누리는 것보다 가치 있습니다.

## 세 번째 계층: 커넥터와 매핑 {#layer-three-connectors-and-mapping}

커넥터는 한 가지 일만 합니다. 소스를 읽고 관찰을 내보냅니다. 커넥터는 온톨로지에 대해 아무것도 모릅니다.

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

매핑은 별도의 단계로, 커넥터마다 매퍼가 하나씩 있으며, 관찰을 **단언**(assertion)으로 바꿉니다. 후보 엔티티와 후보 엣지이고, 각각 자신이 나온 관찰이 태그로 붙어 있습니다.

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

이렇게 나누면 커넥터를 재사용할 수 있습니다. 같은 Git 호스트 커넥터가 어느 회사에서든 동작하기 때문입니다. 그리고 회사 고유의 지식은 리뷰할 수 있는 매퍼에 남습니다. 또한 소스를 소유한 팀이 커넥터를 직접 쓸 수 있다는 뜻이기도 하며, 기여는 그렇게 시작됩니다. 참조 구현에서 소스를 추가하는 일은 파일 세 개입니다. 커넥터, 매퍼, 그리고 테스트에 쓸 시드 내보내기 파일입니다.

코드 조각의 레이블 확인은 시스템 전체에서 가장 손쉬운 성과입니다. EA 리포지토리의 애플리케이션 ID를 담은 배포 레이블 하나가 추론을 단언으로 바꿉니다. 레이블을 추가하는 팀이 하나 늘 때마다 모델은 더 확실해지고, 스코어카드가 그것을 보여 줍니다.

## 네 번째 계층: 아이덴티티 해석 {#layer-four-identity-resolution}

매핑은 같은 대상에 대해 많은 후보를 만들어 냅니다. EA 리포지토리는 “Policy Administration”이라고 하고, Git 호스트에는 `pol-adm-svc`와 `pol-adm-ui`가 있고, 클러스터는 네임스페이스 `claims-prod`에서 `policy-admin`을 실행하며, IT 서비스 관리 도구에는 “PAS”라는 비즈니스 서비스가 있습니다. 아이덴티티 해석(identity resolution)은 이 가운데 어떤 것들이 하나의 엔티티인지 결정합니다.

해석은 값싸고 확실한 것에서 비싸고 불확실한 것으로, 세 번의 패스로 진행됩니다.

1. **키.** 소스들에 걸쳐 공유되는 식별자, 예를 들어 배포 레이블의 애플리케이션 ID나 리포지토리 메타데이터 파일의 CMDB 참조가 단언된 연결을 만듭니다.
2. **규칙.** 정밀도가 알려진 결정론적 휴리스틱입니다. 정규화한 이름이 같은 경우, 소유 팀이 정확히 하나의 애플리케이션만 소유한 리포지토리, 네임스페이스 명명 규칙 같은 것입니다. 이것들은 도출된 연결을 만듭니다.
3. **추론.** 남은 것은 모델로 갑니다. 모델은 후보와 그럴듯한 일치 대상의 짧은 목록을 이름, 설명, README, 소유자, 레이블과 함께 받고, 구조화된 판단을 돌려줍니다.

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

임곗값은 명시적이며 설정 안에 있습니다. 0.9를 넘으면 연결은 추론된 것으로 저장되고 평소처럼 표시됩니다. 0.6과 0.9 사이면 추론된 것으로 저장되고 담당 팀이 확인하도록 대기열에 올라갑니다. 0.6 미만이면 버려지고 로그에 남습니다. 추론된 연결이 조용히 단언된 연결로 승격되는 일은 결코 없습니다. 그러려면 사람이 필요합니다. 모델 제공자는 교체할 수 있고, 참조 구현은 호스팅된 모델뿐 아니라 로컬 모델로도 동작합니다. 입력은 메타데이터이고 프롬프트는 작기 때문입니다.

## 다섯 번째 계층: 워크플로 {#layer-five-workflows}

지금까지의 모든 단계는 Temporal 액티비티이고, 워크플로가 이것들을 하나로 묶습니다. 주된 워크플로는 소스 하나를 처음부터 끝까지 수집합니다.

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

참조 구현에는 워크플로가 네 개 있습니다.

| 워크플로 | 트리거 | 하는 일 |
|---|---|---|
| `IngestSource` | 소스별 스케줄 또는 웹훅 | 추출, 매핑, 해석, 점수 계산, 기록 |
| `ConfirmLink` | 팀이 UI에서 확인하거나 거부함 | 추론된 엣지를 승격하거나 제거하고, 누가 언제 했는지 기록 |
| `DeclarePrimary` | 데이터 세트 소유자가 리뷰를 거친 요청으로 | 데이터 세트의 지위를 primary로 전환하고 소유자와 날짜를 기록 |
| `BuildArtifacts` | 매일 밤, 그리고 대규모 수집 후 | 모델 스냅숏에서 인사이트, 다이어그램, 초안을 다시 생성 |

왜 크론 작업과 스크립트 몇 개가 아니라 워크플로 엔진입니까? 수집은 오래 걸리고, 불안정한 API와 통신하며, 시간 초과가 나는 모델을 호출하기 때문입니다. Temporal은 각 단계를 따로 재시도하고, 충돌 후에는 멈춘 지점에서 다시 시작하며, 모든 실행을 입력과 실패와 함께 UI에 보여 줍니다. 마지막 부분은 흔히 과소평가됩니다. 소스의 스코어카드가 떨어지면 첫 번째 질문은 지난 수집에서 무슨 일이 있었는가이고, 그 답은 클릭 한 번 거리에 있습니다. 첫 번째 글에서 설명한 웹 딜리버리 셀프서비스에 제가 Temporal을 쓴 것도 같은 이유였고, 거기서는 워크플로가 운영자의 일을 넘겨받았습니다.

## 여섯 번째 계층: 점수 매기기 {#layer-six-scoring}

`Score` 액티비티는 수집할 때마다 소스와 데이터 세트별로 스코어카드를 계산합니다.

| 신호 | 계산 방식 |
|---|---|
| 신선도(freshness) | 소스의 예상 주기 안에 변경되거나 확인된 레코드의 비율 |
| 완전성(completeness) | 매퍼가 필요로 하는 모든 필드를 갖춘 레코드의 비율 |
| 일치도(agreement) | 적어도 하나의 다른 소스가 확인해 주는 사실의 비율 |
| 해석 가능성(resolvability) | 컨텍스트 모델 엔티티로 해석되는 레코드의 비율 |

전체 점수는 가중 평균이고, 가중치는 설정으로 정하며, 모든 숫자는 그 뒤에 있는 레코드로 연결됩니다. 점수에서 두 가지가 따라 나옵니다. 새 엣지는 소스의 점수를 반영한 신뢰도로 시작하므로, 잘 관리된 소스에서 온 사실은 방치된 소스에서 온 같은 주장보다 우선합니다. 그리고 스코어카드는 모든 팀이 볼 수 있는 페이지에 공개되므로, 데이터 품질은 감사 지적 사항에서 리그 순위표에 가까운 것으로 바뀝니다.

## 일곱 번째 계층: API와 MCP 서버 {#layer-seven-the-api-and-the-mcp-server}

Go 바이너리 하나가 같은 쿼리로 세 가지 표면을 제공합니다. 시스템과 프런트엔드를 위한 REST API, 에이전트를 위한 MCP 서버, 그리고 생성된 산출물을 위한 정적 엔드포인트입니다. 이것들을 한 프로세스에 두는 것은 의도적입니다. 같은 엔티티를 보는 에이전트와 사람은 같은 사실을 봐야 하고, 이를 보장하는 가장 쉬운 방법은 구현을 두 개 두지 않는 것입니다.

설계에 가장 많은 공을 들인 곳은 MCP 서버입니다. 에이전트를 위한 도구는 프로그램을 위한 API와는 규칙이 다른 인터페이스이기 때문입니다. Kestrel 서버는 몇 가지 도구를 노출합니다.

| 도구 | 입력 | 반환 |
|---|---|---|
| `search_entities` | 텍스트, 선택적으로 종류 | id, 종류, 한 줄 요약을 갖춘 일치하는 엔티티 |
| `get_entity` | id | 엔티티, 그 속성, 지위, 직접 연결된 엣지 |
| `find_owner` | id 또는 자유 텍스트 이름 | 소유 팀, 소유 관계가 어떻게 확립되었는지, 그리고 신뢰도 |
| `impact_of_change` | id, 깊이 | 주어진 깊이까지 이것에 의존하는 대상, 거리별로 묶음 |
| `explain_fact` | 엣지 id | 엣지 하나의 근거: 소스, 관찰, basis, 누가 확인했는지 |
| `list_decisions` | id | 엔티티를 제약하는 아키텍처 결정 |
| `render_diagram` | id, 뷰 | 엔티티 주변의 Mermaid 다이어그램 |

세 가지 규칙이 이 도구들을 만들었습니다. **도구는 엔티티 중심입니다.** 에이전트는 범용 쿼리 언어보다 “이것과 그 주변을 달라”에서 더 잘 추론하기 때문입니다. **모든 답에는 출처가 담깁니다.** 그래서 에이전트는 사실이 어디서 왔는지 인용할 수 있고 사람은 그것을 확인할 수 있습니다. **답은 작습니다.** 하위 그래프 전체가 아니라 에이전트가 이어서 따라갈 수 있는 id를 담습니다. 이 플랫폼의 목적은 에이전트의 토큰을 아끼는 것이지 컨텍스트 윈도우를 넘치게 하는 것이 아니기 때문입니다. 경제적인 근거는 [The Economics of Inference](/articles/the-economics-of-inference/)에서, 도구 설계의 근거는 [Tools: How Agents Actually Do Things](/articles/tools-how-agents-actually-do-things/)에서 다뤘습니다.

`find_owner`의 답은 이런 모습입니다.

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

코딩 에이전트가 이것을 쓸 수 있도록, 리포지토리에는 프로젝트 범위의 MCP 설정이 들어 있습니다. Claude Code에서는 리포지토리 루트의 `.mcp.json`입니다.

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

회사에서는 같은 항목이 공유 인스턴스를 가리키고, 모든 새 리포지토리가 출발하는 템플릿에 들어갑니다. 그때부터 모든 노트북의 모든 코딩 에이전트가 서비스를 대상으로 코드를 쓰기 전에 그 서비스의 소유자가 누구인지 물어볼 수 있습니다.

## 여덟 번째 계층: 프런트엔드 {#layer-eight-the-frontend}

Next.js 프런트엔드는 기술적으로는 가장 덜 흥미로운 계층이지만, 사람들이 다시 찾아올지를 결정하는 계층입니다. 뷰는 다섯 개입니다.

- **엔티티 페이지.** 엔티티마다 하나씩 있으며, 속성, 종류별로 묶은 엣지, 마우스를 올리면 보이는 출처, 그리고 사실이 낡으면 호박색으로 바뀌는 “last seen”이 있습니다.
- **그래프 뷰.** 어떤 엔티티든 그 주변을 보여 주며, 관계 종류와 깊이로 거를 수 있습니다.
- **리뷰 대기열.** 팀마다 하나씩 있으며, 확인을 기다리는 추론된 연결과 각각에 대한 모델의 이유가 나란히 있습니다.
- **소스 스코어카드.** 여섯 번째 계층의 리그 순위표입니다.
- **산출물.** `BuildArtifacts`가 만든 모든 것이며, 각각 그것을 만든 스냅숏이 표시되어 있습니다.

TypeScript 타입은 온톨로지에서 오므로, 모델이 바뀌면 프런트엔드는 따라잡을 때까지 컴파일에 실패합니다. 이것은 올바른 종류의 마찰입니다.

## 아홉 번째 계층: 산출물 {#layer-nine-artifacts}

산출물은 컨텍스트 모델이 조회 이상의 몫을 해내기 시작하는 곳입니다. `BuildArtifacts` 워크플로는 모델의 스냅숏을 찍고 그 위에서 생성기를 실행합니다. 각 산출물은 자신이 나온 스냅숏을 기록하므로, 다시 만들어 낼 수 있고 독자는 그것이 얼마나 최신인지 알 수 있습니다.

**텍스트로 된 다이어그램.** 생성기는 엔티티의 주변을 따라가며 Mermaid를 씁니다. Kestrel의 보험 계약 관리 애플리케이션에 대한 출력은 이렇습니다.

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

추론된 엣지는 점선으로 그려지고 신뢰도가 표시되므로, 다이어그램은 자신이 아는 것에 대해 정직합니다. 텍스트이기 때문에 Git 호스트, 위키, 채팅 도구에서 렌더링되고, 스냅숏 사이에 diff를 떠서 한 분기 동안 IT 환경에서 무엇이 바뀌었는지 보여 줄 수 있습니다.

**인사이트.** 각 인사이트는 이름, 설명, 임곗값을 지닌 쿼리이며, 스냅숏마다 실행됩니다. Kestrel에는 어느 실제 회사에서든 무언가를 찾아내곤 하는 인사이트 몇 개가 함께 들어 있습니다.

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

다른 인사이트들은 마켓 유닛마다 둘 이상의 플랫폼이 지원하는 역량(통합 후보), WAF 정책 없이 인터넷에 노출된 엔드포인트, EA 생명주기는 “retired”라고 하는데 워크로드는 여전히 실행 중인 애플리케이션, 그리고 커밋 이력으로 계산한 트럭 팩터(truck factor)가 1인 리포지토리를 찾아냅니다. 각 발견은 관련된 엔티티로 연결되므로, 서랍에 들어갈 보고서가 아니라 대화의 출발점이 됩니다.

**초안.** 마지막 생성기 묶음은 사람이 마무리할 문서를 만듭니다. 솔루션 설계의 현황 섹션, 맥락과 선택지가 미리 채워진 아키텍처 결정 기록, 영향을 받는 애플리케이션과 그 소유자를 담은 통합을 위한 짧은 비즈니스 케이스입니다. 언어 모델이 가장 도움이 되는 곳이 여기이고, 동시에 가장 짧은 고삐가 필요한 곳도 여기입니다. 초안의 모든 주장은 엔티티나 엣지를 인용해야 하고, 생성기는 그렇지 않은 초안을 거부합니다. 초안은 출처를 갖춘 출발점일 뿐 결코 답이 아닙니다. 초안을 답으로 여기는 것이 첫 번째 글에서 산출물 과신(artifact over-trust)이라고 부른 실패 양상입니다.

## 실행하기 {#running-it}

```sh
git clone https://github.com/raskell-io/it-intelligence
cd it-intelligence
make up       # PostgreSQL, Temporal, api, worker and web via docker compose
make seed     # load the Kestrel Group exports
make ingest   # run IngestSource for every seeded source
open http://localhost:3000
```

첫 번째 수집이 끝나면 볼 만한 곳이 세 군데 있습니다. 스코어카드 페이지에서는 EA 리포지토리 내보내기가 신선도에서 가장 낮은 점수를 받은 것을 볼 수 있습니다. 1년 전에 운영을 종료한 그 애플리케이션 때문입니다. claims platform 팀의 리뷰 대기열에는 `pol-adm-ui`에서 Policy Administration으로 가는 추론된 연결이 모델의 이유와 함께 들어 있습니다. 그리고 리포지토리 안의 코딩 에이전트에게 “claims-prod의 소유자는 누구이고 무엇이 그것에 의존하는가?”라고 물으면, 그래프를 지나간 경로를 인용하는 답이 도구 호출 스무 번이 아니라 두 번 만에 나와야 합니다.

## 참조 구현이 다루지 않는 것 {#what-the-reference-leaves-out}

참조 구현은 자신의 빈틈에 대해 솔직할 때 신뢰를 얻습니다. 큰 빈틈은 이렇습니다.

- **아이덴티티와 접근 제어.** 참조 구현에는 인증이 없습니다. 실제 배포에서는 쓰기에 대해 신원 확인이 필요합니다. 확인과 primary 선언에는 사람의 이름이 붙기 때문입니다. 제가 주장했듯이 읽기는 기본적으로 모두에게 열려 있어야 하지만, 그렇더라도 마찬가지입니다.
- **규모를 갖춘 실제 커넥터.** 커넥터는 시드 파일과 몇몇 공개 API를 읽습니다. 운영 환경의 커넥터는 페이지네이션, 속도 제한, 부분 실패, 자격 증명, 그리고 예고 없이 스키마를 바꾸는 소스를 다뤄야 합니다. 이 일은 화려하지 않고 끝이 없습니다.
- **이력.** 참조 구현은 관찰 이력은 보관하지만 엔티티와 엣지는 제자리에서 다시 만듭니다. 특정 시점에 대한 질문(“마이그레이션 전에 IT 환경은 어떤 모습이었는가?”)에는 유효 기간을 지닌 엣지 이력이 필요합니다. 이는 간단한 확장이지만 저장 공간과 쿼리 복잡도에서 실제 비용이 듭니다.
- **규모.** Kestrel에는 애플리케이션이 마흔 개 있습니다. 큰 그룹에는 애플리케이션이 수천 개, 관찰이 수백만 건 있습니다. PostgreSQL은 그 정도를 감당하지만, 재귀 쿼리에는 인덱스와 제한과 약간의 주의가 필요하고, 야간 산출물 빌드는 증분 방식이 되어야 합니다.
- **온톨로지 자체의 거버넌스.** 누가 엔티티 종류를 추가할 수 있는지, 그 변경을 어떻게 리뷰하는지는 조직의 질문입니다. 리포지토리는 코드 리뷰로 이를 뒷받침할 수는 있어도 답할 수는 없습니다.

이 가운데 어느 것도 형태를 바꾸지 않습니다. 이것들은 오후 한나절에 이해할 수 있는 참조 구현과 그룹 전체를 위해 운영할 수 있는 플랫폼 사이의 차이입니다.

## 여기서 가져갈 것 {#what-to-take-from-it}

이런 것을 만든다면 도구보다 순서가 더 중요합니다. 온톨로지를 먼저 쓰고 그것에서 생성하십시오. 관찰과 엔티티를 분리해 두십시오. 모든 관계를 근거, 신뢰도, 출처를 지닌 행으로 만드십시오. 소스의 점수를 공개적으로 매기십시오. MCP 서버를 API와 같은 프로세스에 두십시오. 산출물은 스냅숏에서, 출처와 함께, 텍스트로 생성하십시오. 나머지, 즉 데이터베이스, 워크플로 엔진, 프런트엔드 프레임워크, 모델 제공자는 나중에 다시 고를 수 있는 선택입니다.

이 리포지토리는 뜯어보라고 있는 것입니다. 여러분의 내보내기 데이터로 실행했는데 모델이 무언가를 잘못 판단한다면, 그것이 일어날 수 있는 가장 유용한 일이고, 저는 그 이야기를 듣고 싶습니다.

## 참고 자료 {#references}

- Raffael Schneider, [IT Intelligence: The Missing Data Layer of Enterprise IT](/articles/it-intelligence/), 이 플랫폼의 필요성을 논한 짝을 이루는 글입니다.
- [LinkML](https://linkml.io/), Linked Data Modeling Language, 그리고 그 [생성기](https://linkml.io/linkml/generators/).
- [Temporal](https://temporal.io/), 내구성 있는 워크플로 실행(durable execution).
- [PostgreSQL documentation on recursive queries](https://www.postgresql.org/docs/current/queries-with.html) (`WITH RECURSIVE`).
- [Apache AGE](https://age.apache.org/), PostgreSQL 위에서 openCypher로 하는 그래프 쿼리.
- [Model Context Protocol](https://modelcontextprotocol.io/), 그리고 [공식 Go SDK](https://github.com/modelcontextprotocol/go-sdk).
- [Mermaid](https://mermaid.js.org/), 텍스트로 쓰는 다이어그램.
- [Backstage software catalog](https://backstage.io/docs/features/software-catalog), 엔티티 모델의 조상 격인 개발자 포털.
- Simon Brown, [The C4 model](https://c4model.com/), 생성기가 목표로 삼을 수 있는 아키텍처 뷰.
- Michael Nygard, [Documenting Architecture Decisions](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions).
