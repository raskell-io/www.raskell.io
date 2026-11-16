---
title: "IT Intelligence 만들기: 리포지토리 하나에 담은 참조 구현"
url: https://raskell.io/ko/articles/building-it-intelligence/
author: Raffael Schneider
date: 2026-11-16
description: "오픈 소스 부품으로 Enterprise Context Platform(엔터프라이즈 컨텍스트 플랫폼)을 만드는 방법입니다. 온톨로지, 커넥터, 워크플로, 저장소, API, MCP, UI를 직접 실행할 수 있는 리포지토리 하나에 담았습니다."
tags: [enterprise-architecture, context-engineering, agents, provenance, oss, durable-execution, knowledge-management]
lang: ko
translation_of: https://raskell.io/articles/building-it-intelligence/
---

# IT Intelligence 만들기: 리포지토리 하나에 담은 참조 구현

## 요약

이 글은 지난 글에서 다룬 IT 인텔리전스 플랫폼의 참조 구현입니다. 오픈 소스 리포지토리 하나에 담겨 있고, 그 안에는 일부러 어수선하게 만든 가상의 회사 Kestrel Group이 들어 있습니다. 온톨로지가 가장 먼저 오고, 나머지는 모두 온톨로지에서 생성되거나 온톨로지에 맞춰 검증됩니다. 소스에서 온 관찰은 모델이 그 관찰로부터 결론 내린 엔티티와 분리해 둡니다. 모든 관계는 근거, 신뢰도, 출처를 지닌 하나의 행입니다. 아이덴티티 해석(identity resolution)은 공유 키에서 규칙으로, 다시 모델 추론으로 진행되며, 불확실한 연결은 담당 팀이 확인하도록 대기열에 올라갑니다. API와 분리된 워크플로 오케스트레이터가 재시도와 재개를 갖추고 수집을 실행하며, 소스는 공개적으로 점수가 매겨지고, API는 REST와 MCP 서버를 제공합니다. MCP 서버의 답은 작고 엔티티 중심이며 언제나 출처를 함께 담고 있습니다. 도구보다 계층의 순서가 더 중요합니다. 데이터베이스, 워크플로 엔진, 프런트엔드, 모델 제공자는 나중에 다시 고를 수 있는 선택이며, 테스트 모음이 이 글의 주장을 실행 중인 시스템에 대해 검증합니다.

[IT Intelligence(IT 인텔리전스)](https://raskell.io/articles/it-intelligence/)에서 저는 대기업들이 매출 수치를 위해서는 만들었으면서 정작 자신의 IT를 위해서는 한 번도 만들지 않은 것이 있다고 주장했습니다. 무엇이 존재하는지, 누가 그것을 소유하는지, 그것이 어떻게 연결되는지, 전략과 맞는지를 아는 하나의 모델이고, 그 일에 관여하는 모든 사람과 모든 에이전트가 읽을 수 있는 모델입니다. 그러면 당연히 다음 질문이 나오고, 충분히 물을 만한 질문입니다. 실제로 만들면 어떤 모습입니까?

이 글이 그 답입니다. 누구의 실제 IT 환경도 보여 주지 않으면서 할 수 있는 한 구체적으로 답하겠습니다. 이 글은 오픈 소스 리포지토리 하나, [raskell-io/it-intelligence](https://github.com/raskell-io/it-intelligence)에 담긴 참조 구현을 차례로 살펴봅니다. 그 안에는 가상의 회사가 들어 있습니다. 리포지토리를 클론해 노트북에서 실행하고, 코딩 에이전트를 연결해 보면, 첫 번째 글에서 설명한 모든 계층을 볼 수 있습니다. 커넥터, 워크플로 오케스트레이션, 영속 저장소, 컨텍스트 모델(Context Model) 자체, MCP 서버를 갖춘 API 백엔드, 프런트엔드, 그리고 모델을 산출물로 바꾸는 분석입니다.

이 참조 구현은 제가 회사에서 운영하는 플랫폼보다 작고, 단순하고, 더 지루합니다. 하지만 형태는 같고, 제가 보여 드리고 싶은 것은 바로 그 형태입니다.

## 가상의 회사 {#the-fictional-company}

아래의 모든 예시는 **Kestrel Group**을 사용합니다. 마켓 유닛 세 개, 애플리케이션 약 마흔 개, 팀 열두 개 남짓, 컨테이너 클러스터 두 개, WAF 하나, API 게이트웨이 하나, 그리고 흔히 보는 기록 시스템(system of record) 몇 가지를 갖춘 가상의 금융 그룹입니다. 리포지토리는 Kestrel을 실제 도구에서 내보낸 데이터를 흉내 낸 시드 파일로 제공합니다. EA 리포지토리의 애플리케이션 목록, IT 서비스 관리 도구의 구성 항목과 인시던트, Git 호스트의 리포지토리와 팀, 클러스터의 네임스페이스와 워크로드, WAF의 정책, 게이트웨이의 라우트입니다.

시드 데이터는 일부러 어수선하게 만들었습니다. 시스템마다 이름이 다르고, 두 애플리케이션이 같은 리포지토리를 자기 것이라고 주장하며, 한 네임스페이스에는 소유자 레이블이 없고, 한 마켓 유닛은 그룹 IT의 누구도 모르는 자체 통합 플랫폼을 운영하며, EA 리포지토리에는 1년 전에 운영을 종료한 애플리케이션이 올라 있습니다. 깔끔한 데모는 아무것도 증명하지 못합니다. IT 인텔리전스가 제값을 하는 곳은 소스들이 서로 다르게 말하는 곳이기 때문입니다.

## 시스템의 형태 {#the-shape-of-the-system}

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

움직이는 부품 여섯 개와, 그 모두의 위에 놓인 파일 하나입니다. 저는 이것들을 데이터가 흐르는 순서가 아니라 실제로 만들 순서대로 살펴보겠습니다. 온톨로지가 가장 먼저입니다. 나머지는 모두 온톨로지에서 생성되거나 온톨로지에 맞춰 검증되기 때문입니다.

## 리포지토리 {#the-repository}

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

여기서 모노레포가 옳은 선택인 데는 지루한 이유가 있습니다. 온톨로지는 바뀌고, 바뀔 때마다 저장소, 매퍼, API, MCP 도구, 프런트엔드 타입이 모두 함께 바뀌어야 합니다. 리포지토리 하나라면 그것은 풀 리퀘스트 하나, 리뷰 하나, CI 실행 한 번입니다. 리포지토리 다섯 개에 흩어져 있으면 조율의 문제가 되는데, 그것이 바로 이 플랫폼이 없애려는 종류의 문제입니다.

스택은 처음부터 끝까지 오픈 소스이고, 놀랄 일이 없다는 이유로 골랐습니다.

| 관심사 | 참조 구현의 선택 | 이유 | 합리적인 대안 |
|---|---|---|---|
| 온톨로지 | [LinkML](https://linkml.io/) | YAML 스키마 하나에서 여러 산출물이 생성되고, RDF와 OWL로 이어지는 다리가 있음 | OWL과 SHACL 직접 사용, JSON Schema 단독 |
| 영속성 | PostgreSQL | 누구나 운영할 수 있고, 재귀 쿼리로 그래프 요구 대부분을 처리함 | PostgreSQL 위의 Apache AGE, 전용 그래프 데이터베이스 |
| 오케스트레이션 | API와 분리된 독자적인 구성 요소인 내구성 있는 워크플로 오케스트레이터, 참조 구현은 PostgreSQL 위의 최소한의 오케스트레이터를 함께 제공함 | 재시도, 재개, 스케줄, 사람을 오래 기다리는 일은 개별 요청이 아니라 플랫폼이 맡아야 함 | [Temporal](https://temporal.io/), [Restate](https://restate.dev/), [Aqueduct](https://github.com/raskell-io/aqueduct), 또는 비슷한 엔진 |
| 백엔드 | Go | 정적 바이너리 하나 `itx`를 API(`itx serve`)로도, 워크플로 워커(`itx worker`)로도 실행함 | MCP SDK가 있는 어떤 언어든 |
| 에이전트 인터페이스 | [Model Context Protocol](https://modelcontextprotocol.io/) | 코딩 에이전트가 이미 사용하는 프로토콜 | OpenAPI 명세를 갖춘 REST |
| 프런트엔드 | Next.js | 엔티티 페이지, 그래프 뷰, 리뷰 대기열을 빠르게 만들 수 있음 | 어떤 웹 프레임워크든 |
| 다이어그램 | 텍스트로 쓴 [Mermaid](https://mermaid.js.org/) | diff가 가능하고, Git 호스트와 위키와 채팅에서 렌더링됨 | Structurizr DSL, PlantUML |

이 가운데 어느 것이든 설계를 바꾸지 않고 교체할 수 있습니다. 교체할 수 없는 것은 계층의 순서와 각 계층이 따르는 규칙입니다.

### 왜 Go인가 {#why-go}

그중 한 가지 선택은 표의 한 행보다 더 많은 설명을 들일 만합니다. 대기업이 10년 동안 운영해야 하는 플랫폼이라면 거의 어떤 것이든 저는 같은 선택을 다시 할 것이기 때문입니다. 백엔드는 Go로 작성되어 있습니다.

기업의 코드는 쓰이는 것보다 훨씬 자주 읽힙니다. 그것도 그 코드를 쓰지 않은 사람이, 흔히 몇 년 뒤에, 어느 정도 압박을 받으며 읽습니다. Go는 바로 그런 독자를 위해 만들어졌습니다. 어떤 일을 하는 관용적인 방법은 대개 하나뿐이고, 레이아웃은 `gofmt`가 정하므로, 한 팀의 코드와 다른 대륙에 있는 외주 개발자의 코드가 똑같아 보입니다. 모든 것이 명시적이고 타입이 정해져 있습니다. 오류는 발생한 곳에서 처리하는 값이고, 의존성은 프레임워크가 주입하는 대신 인자로 전달되며, 실제로 일을 하는 줄을 찾기 전에 기어올라야 할 상속 계층도 없습니다. 이 언어는 엔터프라이즈 Java를 유명하게 만든 장치 대부분을 아예 제공하지 않으므로, 팩토리의 팩토리는 애초에 쓰이지 않습니다. 새 동료나 코딩 에이전트도 `resolver/`를 열어 안내서 없이 따라갈 수 있습니다.

의존성은 그것이 있는 위치로 이름이 붙습니다. import 경로는 모듈 경로이고, 대부분의 모듈에서 그것은 Git 리포지토리의 주소입니다. 모듈 파일은 버전을 고정하고, 체크섬 파일이 그 버전을 지킵니다.

```go
// go.mod (trimmed)
module github.com/raskell-io/it-intelligence

require (
	github.com/jackc/pgx/v5 v5.12.0
	github.com/modelcontextprotocol/go-sdk v1.8.0
)
```

모듈 안에서는 패키지들이 경로로 서로를 import하고 소스에서 컴파일됩니다. 모노레포의 비용이 낮은 것은 이 때문입니다. 매퍼, 리졸버, REST API, MCP 서버가 생성된 `vocab` 패키지를 공유하는데, 누군가가 내부 라이브러리를 게시하고, 버전을 붙이고, 그것이 아티팩트 리포지토리에 도달하기를 기다릴 필요가 없습니다. 온톨로지를 바꾸고 다시 생성하면, `go build ./...`가 몇 초 안에 깨진 것을 모두 알려 줍니다.

Go는 두 번 빠릅니다. 의존성까지 포함해 리포지토리 전체를 깨끗한 상태에서 빌드하는 데 제 노트북에서 약 20초가 걸리고, 변경 후 다시 빌드하는 데는 2초가 채 걸리지 않으므로 피드백 루프가 짧게 유지됩니다. 그리고 결과물은 즉시 시작되고 적은 메모리로 요청을 처리하는 정적 바이너리 하나이며, API와 워커 모두에 바라는 것이 바로 이것입니다. 도구도 기본으로 들어 있습니다. `go test`, `go vet`, 경쟁 상태 탐지기(race detector), 프로파일링을 위한 `pprof`, 모든 편집기를 위한 `gopls`가 있고, 고르거나 설정할 것이 없습니다. 그리고 [Go 1 호환성 약속](https://go.dev/doc/go1compat) 덕분에 오늘 쓴 코드는 10년 뒤에도 빌드됩니다. 기업 소프트웨어가 실제로 살아가는 시간 척도가 바로 그 정도입니다.

Go에도 대가가 있습니다. `if err != nil`은 반복적으로 느껴지고, 타입 시스템에 합 타입(sum type)이 없어서 온톨로지의 정밀함 일부는 타입이 아니라 검증 쪽에 남게 되며, 제네릭은 늦게 들어왔고 의도적으로 소박합니다. 프런트엔드에는 생태계가 있는 TypeScript를 씁니다. 하지만 플랫폼 가운데 정확하고, 지루하고, 다음 사람이 읽을 수 있어야 하는 부분에 대해서라면, 저는 이보다 잘 맞는 것을 알지 못합니다.

## 첫 번째 계층: 온톨로지 {#layer-one-the-ontology}

컨텍스트 모델이 곧 온톨로지이고, `ontology/`에 들어 있습니다. `context_model.yaml`과, 이 파일이 import하는 두 파일 `entities.yaml`과 `relations.yaml`입니다. 제가 LinkML을 쓰는 이유는 모델을 읽기 쉬운 YAML로 한 번만 쓰고, 시스템의 각 부분이 필요로 하는 형태로 생성할 수 있기 때문입니다. 검증을 위한 [JSON Schema](https://json-schema.org/), 저장소의 어휘(엔티티 종류와 관계 종류의 테이블, 그리고 도메인과 레인지를 벗어난 엣지를 거부하는 트리거), 시맨틱 웹 도구로 추론하고 싶은 사람을 위한 [OWL](https://www.w3.org/TR/owl2-overview/)과 [SHACL](https://www.w3.org/TR/shacl/), Python과 TypeScript 모델, 그리고 사람이 읽을 수 있는 문서입니다. Go 타입은 JSON Schema에서 생성됩니다.

Kestrel 모델을 줄인 버전입니다.

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

관계는 슬롯으로 이루어진 닫힌 어휘입니다. LinkML은 슬롯마다 도메인(domain)을 하나만 허용하므로, 관계가 여러 종류의 엔티티에서 시작될 수 있는 경우에는 저장소의 어휘를 쓰는 생성기를 위해 어노테이션이 전체 도메인과 레인지(range)를 담습니다.

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

이것을 만들면서 모델링 규칙 네 가지가 나왔고, 이 규칙들은 문법보다 중요합니다.

**핵심을 작게 유지합니다.** Kestrel에는 엔티티 종류가 아홉 개, 관계 종류가 정확히 열다섯 개 있습니다. 새 종류는 누군가가 답할 수 있게 되는 질문 하나로 자신의 존재를 정당화해야 합니다. 첫 번째 글에서 썼듯이 실패 양상은 온톨로지의 무분별한 확장이고, 이를 막는 방법은 한 사람이 화이트보드 앞에서 설명할 수 있는 스키마입니다.

**엔티티와 관찰을 분리합니다.** 관찰은 소스가 특정 시점에 말한 것입니다. 내보낸 데이터의 한 행, API에서 온 JSON 객체 하나입니다. 엔티티는 컨텍스트 모델이 모든 관찰을 종합해 내린 결론입니다. 둘을 섞으면 카탈로그는 소스의 사본이 되고, 소스의 모순도 고스란히 물려받습니다.

**관계를 일급 객체로 만듭니다.** 온톨로지에서 관계는 슬롯입니다. 저장소에서는 모든 관계가 근거, 신뢰도, 출처, “last seen”을 지닌 독립된 행이 됩니다. “모델은 왜 이렇게 생각하는가?”라는 질문에 답하는 방법은 이것뿐이고, 누군가가 모델을 신뢰할지는 바로 이 질문이 결정합니다.

**역량 맵은 플랫폼 팀이 아니라 엔터프라이즈 아키텍처에서 가져옵니다.** `Capability`는 그룹 자체의 역량 모델로 채워집니다. 이 결정 하나 덕분에 “모든 마켓 유닛에서 보험금 청구 처리를 지원하는 시스템은 무엇인가” 같은 질문이 쿼리가 되고, 전략은 이렇게 모델 안으로 들어옵니다.

`make ontology`는 `ontology/generated/`의 모든 것을 다시 생성하고, 생성된 파일이 최신이 아니면 CI가 실패합니다. 온톨로지는 코드이고, 코드처럼 리뷰됩니다.

## 두 번째 계층: 저장소 {#layer-two-the-store}

PostgreSQL은 다섯 가지를 담습니다. 관찰, 엔티티, 엣지, 스코어카드, 산출물입니다. 그 주위에 보조 테이블 몇 개가 있습니다. 별칭(각 소스가 엔티티를 부르는 이름), 데이터 세트 레지스트리, 모든 확인과 선언을 담는 추가 전용 로그, 기록해 둔 모델 판단, 스냅숏, 그리고 워크플로 실행의 상태입니다. 핵심은 보여 드릴 수 있을 만큼 짧습니다.

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

관찰은 추가 전용(append-only)입니다. 어떤 것도 덮어쓰지 않으므로 모델은 언제나 소스가 말한 것으로부터 다시 만들어질 수 있고, 모든 엣지는 `evidence`를 통해 자신을 만든 관찰을 가리킬 수 있습니다.

`basis` 열은 첫 번째 글에서 말한 구분을 담습니다. **asserted**(단언된) 엣지는 소스 자체의 키에서 곧바로 나온 것입니다. 클러스터가 이 워크로드는 저 네임스페이스에서 실행된다고 말하는 경우입니다. **derived**(도출된) 엣지는 규칙에 따라 다른 엣지들로부터 따라 나옵니다. 워크로드가 어떤 팀이 소유한 네임스페이스에서 실행되므로, 달리 말하는 것이 없으면 그 팀이 워크로드를 소유한다는 식입니다. **inferred**(추론된) 엣지는 리졸버가 대개 모델의 도움을 받아 제안한 것으로, 신뢰도와 그 근거가 된 추론을 함께 지닙니다. 팀이 추론된 엣지를 확인하면 `confirmed_by`와 `confirmed_at`이 설정되고, 엣지는 사람의 이름이 붙은 단언된 엣지가 됩니다. 테이블의 트리거가 모든 엣지를 온톨로지에서 생성된 어휘에 맞춰 검사하므로, 저장소는 모델이 허용하지 않는 관계를 담을 수 없습니다.

이 모든 것은 출처(provenance) 표준 없이도 동작하지만, 그런 표준 하나와 잘 맞아떨어집니다. W3C의 [PROV-O](https://www.w3.org/TR/prov-o/) 용어로 말하면, 엣지는 `evidence`에 담긴 관찰로부터 도출되었고(derived), `source`에, 또는 확인된 뒤에는 사람에게 귀속되는(attributed) 엔티티입니다. 참조 구현은 PROV를 내보내지 않으며, 어떤 수집 실행이 엣지를 만들었는지, 즉 PROV 용어로 활동(activity)도 아직 기록하지 않습니다. 다른 도구가 그 계보를 필요로 한다면, 시작할 곳은 이 두 군데입니다.

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

매핑은 별도의 단계로, 커넥터마다 매퍼가 하나씩 있으며, 관찰을 **단언**(assertion)으로 바꿉니다. 후보 엔티티와 후보 엣지이고, 각각 자신이 나온 관찰이 태그로 붙어 있습니다. 종류와 관계를 나타내는 상수는 온톨로지에서 생성된 `vocab` 패키지에서 오므로, 매퍼가 관계를 지어낼 수는 없습니다.

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

이렇게 나누면 커넥터를 재사용할 수 있습니다. 같은 Git 호스트 커넥터가 어느 회사에서든 동작하기 때문입니다. 그리고 회사 고유의 지식은 리뷰할 수 있는 매퍼에 남습니다. 또한 소스를 소유한 팀이 커넥터를 직접 쓸 수 있다는 뜻이기도 하며, 기여는 그렇게 시작됩니다. 참조 구현에서 소스를 추가하는 일은 파일 세 개입니다. 커넥터, 매퍼, 그리고 테스트에 쓸 시드 내보내기 파일입니다.

레이블 확인은 이 매퍼 하나를 넘어서 중요합니다. 배포에 EA 애플리케이션 ID를 추가하는 팀이 하나 늘 때마다 모델의 추론 하나가 단언으로 바뀌고, 스코어카드는 다음 날 아침 그 개선을 보여 줍니다.

## 네 번째 계층: 아이덴티티 해석 {#layer-four-identity-resolution}

매핑은 같은 대상에 대해 많은 후보를 만들어 냅니다. EA 리포지토리는 “Policy Administration”이라고 하고, Git 호스트에는 `pol-adm-svc`와 `pol-adm-ui`가 있고, 클러스터는 네임스페이스 `claims-prod`에서 `policy-admin`을 실행하며, IT 서비스 관리 도구에는 “PAS”라는 비즈니스 서비스가 있습니다. 아이덴티티 해석(identity resolution)은 이 가운데 어떤 것들이 하나의 엔티티인지 결정합니다.

해석은 값싸고 확실한 것에서 비싸고 불확실한 것으로, 세 번의 패스로 진행됩니다.

1. **키.** 소스들에 걸쳐 공유되는 식별자, 예를 들어 배포 레이블의 애플리케이션 ID나 리포지토리 메타데이터 파일의 CMDB 참조가 단언된 연결을 만듭니다.
2. **규칙.** 정밀도가 알려진 결정론적 휴리스틱입니다. 정규화한 이름이 같은 경우, 소유 팀이 정확히 하나의 애플리케이션만 소유한 리포지토리, 네임스페이스 명명 규칙 같은 것입니다. 이것들은 도출된 연결을 만듭니다.
3. **추론.** 남은 것은 모델로 갑니다. 각 후보는 애플리케이션 최대 다섯 개로 된 짧은 목록을 받는데, 소유 팀의 애플리케이션이 먼저 오고 그다음에 이름이 가장 비슷한 것들이 옵니다. 모델은 후보의 이름, README 발췌나 설명, 소유자, 네임스페이스를 보고 구조화된 판단을 돌려줍니다.

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

IT 서비스 관리 도구의 비즈니스 서비스인 “PAS”도 같은 방식으로 해석됩니다. 모델은 이것을 0.93으로 Policy Administration에 연결합니다. PAS는 흔히 쓰는 약어이고, 그 지원 그룹이 애플리케이션을 소유하며, 인시던트 텍스트에 `pol-adm-svc`가 언급되기 때문입니다.

임곗값은 명시적이며 설정 안에 있습니다. 0.9를 넘으면 연결은 추론된 것으로 저장되고 평소처럼 표시됩니다. 0.6과 0.9 사이면 추론된 것으로 저장되고 담당 팀이 확인하도록 대기열에 올라갑니다. 0.6 미만이면 버려지고 로그에 남습니다. 추론된 연결이 조용히 단언된 연결로 승격되는 일은 결코 없습니다. 그러려면 사람이 필요합니다. 모델 제공자는 교체할 수 있습니다. 기본적으로 참조 구현은 기록해 둔 판단을 재생하므로, 오프라인에서 API 키 없이 실행되고 매번 같은 답을 냅니다. `config/resolver.yaml`의 한 줄로 로컬 모델이나 호스팅된 모델로 바꿀 수 있고, 입력이 메타데이터이고 프롬프트가 작기 때문에 그렇게 해도 잘 동작합니다.

이 문제는 오래된 것입니다. 통계학자들은 이것을 레코드 연결(record linkage)이라고 부르며, Ivan Fellegi와 Alan Sunter가 1969년에 이에 대한 형식 이론을 세웠습니다. 두 개의 임곗값이 후보 쌍을 연결, 비연결, 그리고 사람의 검토로 넘어가는 가능한 연결로 나눕니다. 위의 세 구간은 같은 생각이며, 그들의 이론에서 일치 가중치(match weight)가 있는 자리에 모델의 판단이 들어갑니다. 소스에 애플리케이션 수백 개가 아니라 레코드 수백만 건이 있다면, 영국 법무부(UK Ministry of Justice)가 만든 그 확률적 접근의 오픈 소스 구현인 [Splink](https://moj-analytical-services.github.io/splink/)를 살펴보십시오.

## 다섯 번째 계층: 워크플로 {#layer-five-workflows}

수집은 불안정한 소스와 통신하고 시간 초과가 나는 모델을 호출하므로, 단계별 재시도, 충돌 후 재개, 스케줄, 그리고 무슨 일이 있었는지 볼 수 있는 곳이 필요합니다. 게다가 여기서 모든 일이 빨리 끝나지는 않습니다. 연결은 팀이 확인하기를 기다리고, primary 선언은 두 번째 사람이 승인하기를 기다리며, 누군가 휴가 중이고 이메일로 알림이 나가는 동안 둘 다 며칠씩 머물 수 있습니다. 그런 일은 API에 속하지 않습니다. 그래서 워크플로 오케스트레이션은 독자적인 구성 요소입니다. API는 컨트롤 플레인으로서 실행을 시작하고 그 상태를 보고하지만 직접 실행하지는 않으며, 실행은 오케스트레이터가 맡습니다.

운영 환경에서 그 오케스트레이터는 Temporal, Restate 또는 그와 비슷한 내구성 있는 워크플로 엔진입니다. 설계는 그중 무엇인지에 좌우되지 않습니다.

후보 하나는 제가 만든 것입니다. [Aqueduct](https://github.com/raskell-io/aqueduct)는 에이전트가 쓰고 사람이 승인하는 절차를 위해 만든, Rust로 작성한 내구성 있는 실행 엔진입니다. 모든 단계를 완료로 치기 전에 저널에 기록하고, 시간 제한을 두고 사람을 기다리며(시그널이나 누구든 완료할 수 있는 id로 기다리고, 아무도 답하지 않으면 다른 사람에게 넘깁니다), 단계를 gRPC나 HTTP를 통해 어떤 언어로 된 워커에서든 실행하므로 여기의 단계들은 Go로 남을 수 있습니다. 아직 초기 단계이고, 자체 README도 아직 의존하지 말라고 하므로, 저는 이것을 기본값이 아니라 선택지로 언급합니다.

참조 구현은 같은 계약 뒤에서 동작하는 PostgreSQL 기반의 최소한의 오케스트레이터를 별도의 프로세스 `itx worker`로 제공하므로, 다른 것을 설치하지 않고도 노트북에서 실행됩니다. 워크플로는 멱등적인 단계들의 고정된 목록입니다.

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

실행과 단계 시도는 테이블 두 개에 저장됩니다. 워커는 `select ... for update skip locked`로 실행을 가져가고 하트비트를 유지하므로, 여러 워커가 나란히 실행될 수 있고, 충돌한 프로세스가 버린 실행은 다른 워커가 이어받습니다. 실행은 성공하지 못한 첫 단계에서 재개되고, 재시도는 지터를 두고 간격을 늘리며, 단계들은 실행 id 외에는 아무것도 주고받지 않습니다. 단계가 만든 것은 무엇이든 PostgreSQL로 갑니다. API와 워커는 별도의 프로세스이므로 따로 확장되고, 느린 수집이 에이전트의 쿼리를 붙잡아 두는 일은 없습니다.

| 워크플로 | 트리거 | 단계 |
|---|---|---|
| `IngestSource` | 소스별 주기, 또는 요청 시 | Extract, Judge, Build, Score |
| `IngestAll` | `make ingest` | 모든 소스에 대해 Extract, 그다음 Judge, Build, Score와 산출물 단계 |
| `ConfirmLink` | 팀이 UI에서 확인하거나 거부함 | Apply, Build, Score |
| `DeclarePrimary` | 데이터 세트 소유자의 요청, 두 번째 사람이 승인 | Apply, Build |
| `BuildArtifacts` | 매일 밤, 그리고 `IngestAll`이 끝날 때 | Snapshot, Diagrams, Insights |

모든 실행은 `/runs`에 단계, 시도, 오류, 소요 시간과 함께 나타나며, 이것은 생각보다 중요합니다. 소스의 스코어카드가 떨어지면 첫 번째 질문은 지난 수집에서 무슨 일이 있었는가이고, 그 답은 클릭 한 번 거리에 있습니다. 최소한의 오케스트레이터가 할 수 없는 일은 워크플로 안에서 사람을 며칠씩 기다리는 것, 알림을 보내는 것, 수천 개의 병렬 작업으로 퍼져 나가는 것입니다. 그래서 참조 구현에서 `ConfirmLink`와 `DeclarePrimary`는 사람이 답한 뒤에야 시작합니다. 내구성 있는 엔진은 그 기다림을 워크플로 자체 안으로 옮기며, 이것이 엔진이 더해 주는 첫 번째 것입니다. 엔진으로 교체하는 일은 기계적입니다. 단계들은 이미 액티비티의 형태를 갖추고 있고, API는 실행을 시작하고 그 상태를 읽는 일만 하기 때문입니다.

## 여섯 번째 계층: 점수 매기기 {#layer-six-scoring}

`Score` 액티비티는 수집할 때마다 소스와 데이터 세트별로 스코어카드를 계산합니다.

| 신호 | 계산 방식 |
|---|---|
| 신선도(freshness) | 소스의 예상 주기 안에 변경되거나 확인된 레코드의 비율 |
| 완전성(completeness) | 매퍼가 필요로 하는 모든 필드를 갖춘 레코드의 비율 |
| 일치도(agreement) | 적어도 하나의 다른 소스가 확인해 주는 사실의 비율, 따라서 한 소스만 가진 사실은 점수를 끌어내림 |
| 해석 가능성(resolvability) | 아이덴티티와 참조가 모두 컨텍스트 모델 엔티티로 해석되는 레코드의 비율 |

전체 점수는 가중 평균이고, 가중치는 설정으로 정하며, 모든 숫자는 그 뒤에 있는 레코드로 연결됩니다. 시드에서 수집을 한 번 마치면, EA 리포지토리의 애플리케이션은 0.58, 역량은 0.45, 클러스터의 네임스페이스는 0.75, IT 서비스 관리 도구의 비즈니스 서비스는 0.99를 받습니다. 점수에서 두 가지가 따라 나옵니다. 단언된 사실은 모두 0.7에 소스의 마지막 전체 점수의 0.3배를 더한 신뢰도로 시작하므로, 잘 관리된 소스에서 온 사실은 방치된 소스에서 온 같은 주장보다 우선하고, 도출된 사실은 자신의 사슬에서 가장 약한 신뢰도를 물려받습니다. 그리고 스코어카드는 모든 팀이 볼 수 있는 페이지에 공개되므로, 데이터 품질은 감사 지적 사항에서 리그 순위표에 가까운 것으로 바뀝니다.

## 일곱 번째 계층: API와 MCP 서버 {#layer-seven-the-api-and-the-mcp-server}

API 프로세스 `itx serve`는 같은 쿼리로 세 가지 표면을 제공합니다. 시스템과 프런트엔드를 위한 REST API, 에이전트를 위한 MCP 서버, 그리고 생성된 산출물을 위한 정적 엔드포인트입니다. 이것들을 한 프로세스에 두는 것은 의도적입니다. 같은 엔티티를 보는 에이전트와 사람은 같은 사실을 봐야 하고, 이를 보장하는 가장 쉬운 방법은 구현을 두 개 두지 않는 것입니다.

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

세 가지 규칙이 이 도구들을 만들었습니다. **도구는 엔티티 중심입니다.** 에이전트는 범용 쿼리 언어보다 “이것과 그 주변을 달라”에서 더 잘 추론하기 때문입니다. **모든 답에는 출처가 담깁니다.** 그래서 에이전트는 사실이 어디서 왔는지 인용할 수 있고 사람은 그것을 확인할 수 있습니다. **답은 작습니다.** 하위 그래프 전체가 아니라 에이전트가 이어서 따라갈 수 있는 id를 담습니다. 이 플랫폼의 목적은 에이전트의 토큰을 아끼는 것이지 컨텍스트 윈도우를 넘치게 하는 것이 아니기 때문입니다. 경제적인 근거는 [The Economics of Inference](https://raskell.io/articles/the-economics-of-inference/)에서, 도구 설계의 근거는 [Tools: How Agents Actually Do Things](https://raskell.io/articles/tools-how-agents-actually-do-things/)에서 다뤘습니다.

“*claims-prod의 소유자는 누구이고 무엇이 그것에 의존하는가?*”라는 질문을 받으면, 리포지토리 안의 에이전트는 `find_owner`를 호출하고, 첫 번째 수집 후에는 이런 답을 받습니다.

```text
find_owner {"id": "claims-prod"}
  owner: ctx:Team/claims-platform, derived, 0.92
  path:  ctx:Namespace/claims-prod <- runs_in - ctx:Workload/claims-prod/claims-settlement (asserted, cluster)
         ctx:Workload/claims-prod/claims-settlement <- deployed_as - ctx:Application/claims-settlement (asserted, cluster)
         ctx:Application/claims-settlement - owned_by -> ctx:Team/claims-platform (asserted, itsm)
```

네임스페이스에는 소유자 레이블이 없으므로 소유 관계는 도출된 것이고, 답도 그렇다고 말합니다. `claims-prod`에서는 보험금 청구 애플리케이션 세 개가 실행되고 모두 같은 팀을 가리킵니다. 가장 강한 사슬이 이기고, 에이전트는 그 답이 기대는 모든 사실을 인용할 수 있습니다. 팀이 다음에 할 일은 답에서 분명히 드러납니다. 네임스페이스에 소유자 레이블을 달면 도출이 단언으로 바뀝니다.

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

**초안**은 다음 단계이며 아직 만들어지지 않았습니다. 솔루션 설계의 현황 섹션, 미리 채워진 아키텍처 결정 기록, 짧은 비즈니스 케이스를 위한 생성기이고, 각각 모든 주장에 대해 엔티티나 엣지를 인용해야 합니다. 그 인용 규칙이 첫 번째 글에서 산출물 과신(artifact over-trust)이라고 부른 것에 대한 방어입니다.

## 실행하기 {#running-it}

Docker만 있으면 되고, API 키는 필요 없습니다.

```sh
git clone https://github.com/raskell-io/it-intelligence
cd it-intelligence
make up       # PostgreSQL, the API, the workflow worker and the web UI
make seed     # register the Kestrel Group sources
make ingest   # extract, judge, build, score, and build the artifacts
make verify   # check the resolver against the answer key, and this post against the system
open http://localhost:3000
```

첫 번째 수집이 끝나면 볼 만한 곳이 세 군데 있습니다. 스코어카드 페이지에서는 EA 리포지토리 내보내기가 신선도에서 가장 낮은 점수를 받은 것을 볼 수 있습니다. 레코드 대부분이 마지막으로 수정된 지 반년이 넘었고, 1년 전에 운영을 종료한 그 애플리케이션도 그중 하나입니다. claims platform 팀의 리뷰 대기열에는 `pol-adm-ui`에서 Policy Administration으로 가는 추론된 연결이 0.82로, 모델의 세 가지 이유와 함께 들어 있습니다. 그리고 리포지토리 안의 코딩 에이전트에게 “claims-prod의 소유자는 누구이고 무엇이 그것에 의존하는가?”라고 물으면, 그래프를 지나간 경로를 인용하는 답이 도구 호출 스무 번이 아니라 두 번 만에 나옵니다.

제가 가장 자랑스럽게 여기는 부분은 `make verify`입니다. 시드에는 정답지가 함께 들어 있습니다. Kestrel Group이 실제로 어떤 모습인지 손으로 적어 둔 것입니다. verify 단계는 해석된 모델을 정답지와 비교하고, 이 글의 구체적인 주장 하나하나를 실행 중인 시스템에 대해 확인하며, CI는 변경이 있을 때마다 이를 실행합니다. 시드에서 엣지는 정밀도 0.996, 재현율 0.994로 나오고, 아이덴티티는 1.0입니다. 규칙마다 정밀도도 측정하는데, 그중 하나인 `team_owns_single_app`은 사례 1건 가운데 0건을 맞힙니다. 이 규칙은 실험용 리포지토리를 아무 관계도 없는 애플리케이션에 연결합니다. 참조 구현이라면 숨기지 말고 보여 줘야 하는 것이 바로 이런 것입니다.

## 참조 구현이 다루지 않는 것 {#what-the-reference-leaves-out}

참조 구현은 자신의 빈틈에 대해 솔직할 때 신뢰를 얻습니다. 큰 빈틈은 이렇습니다.

- **아이덴티티와 접근 제어.** 참조 구현에는 인증이 없습니다. 확인과 primary 선언에는 이름이 필요하므로, 쓰기에는 “act as” 선택기에서 고른 이름이 `X-Actor` 헤더로 실려 갑니다. 실제 배포에서는 쓰기에 진짜 신원 확인이 필요합니다. 제가 주장했듯이 읽기는 모두에게 열려 있더라도 마찬가지입니다.
- **규모를 갖춘 실제 커넥터.** 커넥터는 시드 파일을 읽습니다. Git 호스트만 GitHub 조직 하나를 위한 작은 라이브 모드를 갖추고 있습니다. 운영 환경의 커넥터는 페이지네이션, 속도 제한, 부분 실패, 자격 증명, 그리고 예고 없이 스키마를 바꾸는 소스를 다뤄야 합니다. 이 일은 화려하지 않고 끝이 없습니다.
- **이력.** 참조 구현은 관찰 이력은 보관하지만 엔티티와 엣지는 제자리에서 다시 만듭니다. 특정 시점에 대한 질문(“마이그레이션 전에 IT 환경은 어떤 모습이었는가?”)에는 유효 기간을 지닌 엣지 이력이 필요합니다. 이는 간단한 확장이지만 저장 공간과 쿼리 복잡도에서 실제 비용이 듭니다. 그때까지는 스냅숏과, 스냅숏 사이의 `itx snapshot diff`가 값싼 대용품입니다.
- **규모.** Kestrel에는 애플리케이션이 마흔 개 있고, 참조 구현은 수집할 때마다 모델 전체를 다시 빌드합니다. 엔티티가 수천 개라면 괜찮지만, 수백만 개라면 그렇지 않습니다. PostgreSQL은 큰 그룹의 IT 환경을 감당하지만, 빌드는 증분 방식이 되어야 하고 재귀 쿼리에는 인덱스와 제한과 약간의 주의가 필요합니다.
- **초안.** 결정 기록과 비즈니스 케이스를 위한 생성기는 그 인용 검사와 함께 아직 만들어지지 않았습니다.
- **온톨로지 자체의 거버넌스.** 누가 엔티티 종류를 추가할 수 있는지, 그 변경을 어떻게 리뷰하는지는 조직의 질문입니다. 리포지토리는 코드 리뷰로 이를 뒷받침할 수는 있어도 답할 수는 없습니다.

이 가운데 어느 것도 형태를 바꾸지 않습니다. 이것들은 오후 한나절에 이해할 수 있는 참조 구현과 그룹 전체를 위해 운영할 수 있는 플랫폼 사이의 차이입니다.

## 여기서 가져갈 것 {#what-to-take-from-it}

이런 것을 만든다면 도구보다 순서가 더 중요합니다. 온톨로지를 먼저 쓰고 모든 것을 그것에서 생성하십시오. 관찰과 엔티티를 분리해 두십시오. 모든 관계를 근거, 신뢰도, 출처를 지닌 행으로 만드십시오. 소스의 점수를 공개적으로 매기십시오. MCP 서버는 API와 같은 프로세스에 두고, 오케스트레이션은 그 바깥에 두십시오. 산출물은 스냅숏에서, 출처와 함께, 텍스트로 생성하십시오. 데이터베이스, 워크플로 엔진, 프런트엔드 프레임워크, 모델 제공자는 나중에 다시 고를 수 있는 선택입니다.

이 리포지토리는 뜯어보라고 있는 것입니다. 여러분의 내보내기 데이터로 실행했는데 모델이 무언가를 잘못 판단한다면, 그것이 일어날 수 있는 가장 유용한 일이고, 저는 그 이야기를 듣고 싶습니다. [CONTRIBUTING.md](https://github.com/raskell-io/it-intelligence/blob/main/CONTRIBUTING.md)에 소스를 추가하는 방법이 설명되어 있고, 이슈는 열려 있습니다.

## 참고 자료 {#references}

- Raffael Schneider, [IT Intelligence: The Missing Data Layer of Enterprise IT](https://raskell.io/articles/it-intelligence/), 이 플랫폼의 필요성을 논한 짝을 이루는 글입니다.
- [raskell-io/it-intelligence](https://github.com/raskell-io/it-intelligence), 참조 구현이며, 결정 기록은 `docs/adr/`에 있습니다.
- [LinkML](https://linkml.io/), Linked Data Modeling Language, 그리고 그 [생성기](https://linkml.io/linkml/generators/).
- [Temporal](https://temporal.io/), [Restate](https://restate.dev/), [Aqueduct](https://github.com/raskell-io/aqueduct), 내구성 있는 실행 엔진이며, 어느 것이든 오케스트레이터의 자리를 대신할 수 있습니다.
- [PostgreSQL documentation on recursive queries](https://www.postgresql.org/docs/current/queries-with.html) (`WITH RECURSIVE`).
- [Apache AGE](https://age.apache.org/), PostgreSQL 위에서 openCypher로 하는 그래프 쿼리.
- [Model Context Protocol](https://modelcontextprotocol.io/), 그리고 [공식 Go SDK](https://github.com/modelcontextprotocol/go-sdk).
- [Mermaid](https://mermaid.js.org/), 텍스트로 쓰는 다이어그램.
- [Backstage software catalog](https://backstage.io/docs/features/software-catalog), 엔티티 모델의 조상 격인 개발자 포털.
- Simon Brown, [The C4 model](https://c4model.com/), 생성기가 목표로 삼을 수 있는 아키텍처 뷰.
- [The Go 1 compatibility promise](https://go.dev/doc/go1compat), 몇 년 전에 쓴 Go 코드가 지금도 빌드되는 이유.
- Ivan P. Fellegi, Alan B. Sunter, “A Theory for Record Linkage”, *Journal of the American Statistical Association* 64, no. 328 (1969): 1183 to 1210, [doi:10.1080/01621459.1969.10501049](https://doi.org/10.1080/01621459.1969.10501049), 임곗값과 사람의 검토(clerical review)를 갖춘 아이덴티티 해석의 토대.
- [Splink](https://moj-analytical-services.github.io/splink/), 영국 법무부(UK Ministry of Justice)가 만든 오픈 소스 확률적 레코드 연결.
- W3C, [PROV-O: The PROV Ontology](https://www.w3.org/TR/prov-o/), 사실이 어디서 왔는지를 나타내는 표준 어휘.
- W3C, [OWL 2 Web Ontology Language](https://www.w3.org/TR/owl2-overview/)와 [SHACL](https://www.w3.org/TR/shacl/), 온톨로지가 생성되는 시맨틱 웹 형식, 그리고 검증에 쓰이는 형식인 [JSON Schema](https://json-schema.org/).
- Michael Nygard, [Documenting Architecture Decisions](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions).
