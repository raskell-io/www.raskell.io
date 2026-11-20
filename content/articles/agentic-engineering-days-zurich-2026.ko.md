+++
title = "제약은 옮겨 갑니다: Agentic Engineering Days Zurich에서 보낸 하루"
date = 2026-11-20
description = "Agentic Engineering Days Zurich 2026의 일곱 개 발표와 그것들을 꿰는 실마리입니다. 에이전트는 제약을 없애지 않고 다른 곳으로 옮깁니다."

[extra]
author = "Raffael"
image = "agentic-engineering-days-zurich-2026.avif"
cover = "covers/agentic-engineering-days-zurich-2026.avif"
in_short = [
  "Agentic Engineering Days Zurich 2026은 취리히 중앙역 옆 호텔에서 열린, 매진된 하루짜리 행사였습니다. 344건의 제출 가운데 40개 세션이 선정되었고, 가장 좋았던 것은 사람들이었습니다.",
  "Pini Reznik의 발표 소개글이 그날을 보는 렌즈가 되었습니다. AI는 제약을 없애지 않고 옮깁니다. 제가 본 모든 발표는 그 제약이 어디로 가야 하는지에 대한 하나의 답이었습니다.",
  "Exasol은 데이터 융합을 데이터베이스 안으로 옮겨서 에이전트가 호출할 때마다 통합의 부담을 지지 않게 하자고 주장했습니다. 후원 발표였고, 제가 가장 먼저 시험해 볼 발표이기도 합니다.",
  "프로토콜 발표는 불확실성을 가장 많이 줄이는 가장 단순한 프로토콜이 이긴다고 말했습니다. NVIDIA의 NOOA는 에이전트를 다시 타입이 있는 소프트웨어로 되돌렸고, 저는 그 타입을 검사할 컴파일러를 원하게 되었습니다.",
  "GitHub Next는 제약이 팀의 합의로 옮겨 가는 모습을 보여 주었습니다. 이는 사람과 에이전트가 함께하는 공유된 대화로서의 일, 그리고 그 안에 머무는 결정을 가리킵니다.",
]
+++

금요일에 저는 동료 몇 명과 함께 [Agentic Engineering Days Zurich](https://www.agenticdays.com/)에서 하루를 보냈습니다. 행사는 취리히 중앙역 옆 Marriott에서 하루 동안 열렸고, [letsboot.ch](https://www.letsboot.ch/)가 주최했습니다. 344건의 제출 가운데 40개 세션이 선정되어 다섯 개의 방에서 진행되었고, 표는 매진되었습니다. 내년에는 더 큰 장소에서 이틀 동안 열린다고 하니, 올해가 어땠는지 짐작할 수 있습니다.

Jonas와 Barbara Felix, 그리고 그들의 팀이 이 모든 것을 준비했고, 첫 회치고는 거의 흠잡을 데가 없었습니다. 방도 제시간에, 발표도 제시간에, 음식도 좋았고, 아페로(apéro)는 발표가 시작한 대화를 이어 가기에 충분히 길었습니다. 두 분께 감사드립니다.

<figure>
<img src="/agentic-days-2026-foyer.avif" alt="첫 발표 전 Marriott의 로비" width="1600" height="667" loading="lazy">
<figcaption>개막 30분 전, 취리히 중앙역 Marriott의 로비입니다. 제가 기억하는 대화 대부분은 발표장이 아니라 이곳에서 있었습니다.</figcaption>
</figure>

발표자 중 일부는 몇 년 전 스위스 클라우드 네이티브 커뮤니티의 사람들이었고, 이제는 다음 일을 하고 있었습니다. 제가 찾아간 세션은 그쪽이 아니었습니다. 저는 나머지 우리가 쓰는 부품을 만드는 사람들을 보러 갔고, 프로그램에는 그런 사람들이 있었습니다. NVIDIA, GitHub, Red Hat과 IBM, Google, 그리고 Exasol의 데이터베이스 창업자입니다. 저는 일곱 개의 발표를 들었고, 예상보다 흥미로운 사람들을 많이 만났으며, 내려놓을 수 없는 문장 하나를 가지고 돌아왔습니다.


## 제약은 옮겨 갑니다 {#the-constraint-moves}

그 문장은 Pini Reznik의 것입니다. 그는 Container Solutions를 공동 창업했고 O'Reilly에서 [Cloud Native Transformation](https://www.oreilly.com/pub/au/7845)을 썼으며, 지금은 re:cinq를 이끌고 있습니다. "From Copilot to the Dark Factory"의 소개글은 회사가 모든 직원에게 코딩 어시스턴트를 사 줄 때 무슨 일이 일어나는지 설명합니다. 개인은 빨라지지만 "PR의 양이 늘고, 리뷰 대기열이 길어지고, 테스트는 약해지며, 컨텍스트와 보안과 플랫폼의 병목이 드러납니다." 그리고 이 문장이 이어집니다. "AI는 제약을 없애지 않습니다. 옮길 뿐입니다."(AI does not remove the constraint; it moves it.)

Goldratt를 읽은 사람이라면 이 모양을 알아볼 것이고, 저도 일주일 전에 [Every layer moves the uncertainty](/notes/every-layer-moves-the-uncertainty/)에서 비슷한 이야기를 썼습니다. 금요일에 이 문장이 쓸모 있었던 것은, 서로 관계없는 발표들로 이루어진 프로그램을 하나의 질문으로 바꾸어 주었기 때문입니다. 코딩 어시스턴트는 제약을 타이핑에서 리뷰로 옮깁니다. 다섯 개 시스템에 접근하는 에이전트는 제약을 통합 계층에서 에이전트 안으로 옮깁니다. 그래서 저는 발표마다 제약이 어디로 갔는지, 그리고 그곳이 제약이 있기에 좋은 자리인지 물었습니다.

Reznik의 발표는 이 이동을 "Who Builds Software with AI?"라는 차트로 그렸습니다. 한 축은 복잡도, 다른 축은 시스템에 필요한 개발자 수입니다. 원점 가까이에 Excel 매크로와 간단한 스크립트가 있고, 그다음은 개발자 한 명에서 다섯 명이 만드는 기능적 도구, 쉰 명에서 백 명이 필요한 Booking.com과 HubSpot 같은 시장 플랫폼, 천 명이 넘게 필요한 Google Search와 AWS 같은 거대 시스템이 있습니다. 그 너머의 축에는 "Impossible"이라고 쓰여 있고, 기후 시뮬레이터, 도시 디지털 트윈, 개인 맞춤 의료가 예로 나옵니다. 그의 빨간 화살표는 모든 구간을 왼쪽으로 한 칸씩 옮겼습니다. 비개발자는 시민 개발자가 되고, 다섯 명의 팀이 예전에는 백 명이 필요하던 것을 만들며, 축의 끝은 더 이상 불가능이 아닙니다. 이것이 대체로 맞다면, 희소한 것은 더 이상 코드를 쓸 줄 아는 사람이 아닙니다. 한 팀이 혼자서는 할 수 없는, 코드를 둘러싼 모든 것입니다. 그의 마지막 슬라이드는 그에 대해 무엇을 해야 하는지 말했습니다. "제약을 찾으십시오. 역량을 만드십시오. 반복하십시오."(Find the constraint. Build the capability. Repeat.) 긴 버전은 그가 Michael Müller와 함께 쓴 책 [From Cloud Native to AI Native](https://re-cinq.com/whitepapers)이고, re:cinq가 무료로 배포합니다.

<figure>
<img src="/agentic-days-2026-reznik.avif" alt="Pini Reznik과 AI로 소프트웨어를 누가 만드는지에 관한 그의 차트" width="1600" height="800" loading="lazy">
<figcaption>re:cinq의 Pini Reznik이 "Who Builds Software with AI?" 차트 앞에 서 있습니다. 복잡도의 모든 구간이 왼쪽으로 한 칸씩 옮겨 가고, "Impossible"은 더 이상 축의 끝이 아닙니다.</figcaption>
</figure>

| 발표 | 제약이 옮겨 간 곳 |
|---|---|
| Wrike, 운영 중인 SRE 에이전트 | 아무도 테스트하지 않는 컨텍스트 안으로 |
| Exasol, Beyond MCP | 에이전트 밖으로, 데이터베이스 안으로 |
| Red Hat과 IBM, Agents Speak Protocol | 개별 통합 밖으로, 각 경계의 계약 안으로 |
| NVIDIA, NOOA | 프롬프트 밖으로, 다시 평범한 타입 있는 소프트웨어 안으로 |
| GitHub Next, 협업 환경 | 코드를 쓰는 일에서 무엇을 쓸지 합의하는 일로 |
| Typeform, When Software Stops Being Deterministic | 테스트 스위트에서 평가와 트레이스로 |
| re:cinq, From Copilot to the Dark Factory | 코드를 쓰는 사람들에서 명세와 검사를 쓰는 사람들로 |

## 통합 계층으로서의 에이전트 {#the-agent-as-the-integration-layer}

제 아침은 Wrike의 David Pech, 그리고 몇 달째 운영 환경에서 돌아가는 SRE 에이전트로 시작했습니다. 그의 소개글은 이런 에이전트 대부분을 "트렌치코트를 입은, 겨우 주니어 수준의 시스템 관리자"라고 묘사하고, 그가 든 교훈은 모델에 관한 것이 아니었습니다. 프레임워크는 예상보다 덜 중요했고, 오해를 부르는 문서는 에이전트를 오도했으며, 아무도 테스트하지 않는 컨텍스트는 버전이 바뀔 때마다 조용히 나빠졌습니다. 저는 발표 제목이 에이전트 자신의 지침에 있는 한 줄이라고 짐작하며, 이런 에이전트를 만드는 팀이라면 결국 모두 그 줄을 쓰게 된다고 생각합니다.

한 시간 뒤 Alexander Stigsen은 같은 문제를 한 층 아래에서 다루었습니다. Stigsen은 2019년 MongoDB가 인수한 모바일 데이터베이스 [Realm](https://en.wikipedia.org/wiki/Realm_(database))을 창업했고, 지금은 뉘른베르크의 인메모리 분석 데이터베이스 [Exasol](https://www.exasol.com/)의 Chief Product and Technology Officer입니다. 그의 발표 "Beyond MCP"는 후원 세션이자 제품 홍보였습니다. 이 점을 먼저 밝히는 이유는, 그것이 제가 다루는 문제에 대한 가장 명확한 진단이기도 했기 때문입니다.

에이전트에게 시스템마다 MCP 서버 하나씩, 즉 CRM, 청구, 지원 시스템을 주면 에이전트가 여러분의 통합 계층이 됩니다. 에이전트는 모든 도구 스키마와 모든 원시 결과를 컨텍스트에 담는 비용을 치르고, 소스마다 한 번씩 왕복하며, 쿼리 플래너 없이 데이터를 조인하고, 소스 사이에서 아무것도 캐시하지 않으며, 같은 고객의 세 가지 표기를 호출할 때마다 맞춥니다. 그의 슬라이드는 일곱 가지 비용을 나열하고 한 줄로 요약했습니다. "에이전트가 통합의 부담을 집니다."(The agent carries the integration burden.) 소개글은 뻔한 해결책을 배제하는 제약을 덧붙입니다. "규제받는 조직은 그것을 전부 하나의 AI 플랫폼으로 복사할 수 없습니다."

그의 답은 데이터가 있는 곳에서 쿼리하는 연합(federated) 데이터베이스 위에 MCP 인터페이스 하나를 두고, 각 소스의 어휘를 공유된 비즈니스 개념에 대응시키는 시맨틱 계층을 두는 것이었습니다. CRM의 `account_id`와 청구 시스템의 `customer_ref`는 하나의 고객 정체성이 되고, 송장과 환불과 통화는 CHF 기준 순매출이 됩니다. 시맨틱 계층은 하나이고, 모든 에이전트가 그것을 재사용합니다.

저는 데이터 융합을 하나의 개념으로 알고 있었습니다. 제가 생각해 보지 못한 것은 그것을 영속성 계층 안에 두는 것입니다. 그러면 저장소가 무거운 일을 한 번 하고 모든 에이전트가 그 결과를 받습니다. 이는 [Context is cheaper than exploration](/notes/context-is-cheaper-than-exploration/)의 주장을 한 층 아래로 내린 것이고, [Building IT Intelligence](/articles/building-it-intelligence/)의 패턴과 직접 맞닿아 있습니다. 그 글에서 융합은 파이프라인입니다. 각 소스의 관찰, 워크플로 단계로서의 정체성 해석, PostgreSQL의 엔티티와 엣지, 그리고 근거와 신뢰도를 담은 모든 연결입니다.

반론은 쉽게 나오고, 저도 스스로에게 그 반론을 제기합니다. 쿼리 시점에 융합하는 데이터베이스는 제약을 다시 옮깁니다. 제가 통제하지 못하는 제품 안으로요. 그리고 제가 가장 신경 쓰는 의미, 즉 어떤 소스를 신뢰할지와 일치가 얼마나 확실한지는 바로 파이프라인이 명시적으로 만드는 것입니다. Exasol 자신의 [문서](https://docs.exasol.com/db/latest/ai/ai_build_agents/mcp-server-as-agent-tool.htm)도 MCP 서버만 가진 에이전트가 Exasol의 방언을 무시하는 SQL을 쓸 수 있다고 경고합니다. 그래서 저는 이것을 슬라이드만 보고 결정하지 않겠습니다. 월요일에 참조 구현을 상대로 시험을 시작하며, 그 질문은 [Data fusion belongs in the store](/notes/data-fusion-belongs-in-the-store/)에 적어 두었습니다.

## 표준을 쓴 사람들 {#the-people-who-wrote-the-standards}

다음 발표는 Stefano Maestri와 Alessio Soldano가 맡았고, 프로토콜 뒤에 있는 사람들을 직접 보는 것은 즐거운 일이었습니다. Maestri는 IBM을 대표해 [A2A Technical Steering Committee](https://github.com/a2aproject/A2A/blob/main/GOVERNANCE.md)에 참여하고 있으며 [A2A Java SDK](https://quarkus.io/blog/a2a-project-launches-java-sdk)의 출시 글을 썼습니다. Soldano는 Red Hat에서 RESTEasy를 이끌었고 Apache CXF의 커미터입니다. 두 사람은 SOAP 대 REST를 안에서 겪었고, 발표는 그 역사 위에 세워져 있었습니다.

<figure>
<img src="/agentic-days-2026-protocol-stage.avif" alt="무대 위의 Stefano Maestri와 Alessio Soldano" width="1600" height="800" loading="lazy">
<figcaption>Stefano Maestri(왼쪽, 연단)와 Alessio Soldano가 발표의 렌즈 아래 서 있습니다. "불확실성을 가장 많이 줄이는 가장 단순한 프로토콜이 이깁니다."</figcaption>
</figure>

그들의 렌즈는 "불확실성을 가장 많이 줄이는 가장 단순한 프로토콜이 이깁니다"(The simplest protocol that reduces the most uncertainty wins)였습니다. 그들의 지도는 가운데에 에이전트를 두고 각 경계에 합의를 두었습니다. 모델 쪽으로는 Open Responses, 도구 쪽으로는 MCP, 다른 에이전트 쪽으로는 A2A, 사용자 쪽으로는 AG-UI와 A2UI, 지식 쪽으로는 AGENTS.md와 Skills, 운영 쪽으로는 OpenTelemetry GenAI, 에디터 쪽으로는 ACP, 결제 쪽으로는 x402입니다. 지도 아래의 질문은 "무엇을 교체 가능하게 만들고 싶습니까?"였습니다.

발표는 추상적이었고, 이야기라기보다 지도였습니다. 하나의 시스템을 처음부터 끝까지 따라가 주었으면 좋았을 것입니다. 하지만 그 지도는 방금 나온 Exasol 발표에 대해 더 나은 질문을 주었습니다. "MCP 인터페이스 하나"는 하나의 경계에 거는 내기입니다. 에이전트는 표준 계약을 유지하고, 그 뒤의 데이터는 교체 가능해집니다. 이것은 시맨틱 계층이 제품이 아니라 계약과 함께 움직일 때만 참이고, 제가 확인하려는 것이 바로 그것입니다. 그들의 덱에서 제가 계속 떠올리는 문장은 "채널을 여는 것은 합의가 아닙니다"(Opening a channel is not the agreement)입니다. MCP 서버는 채널을 엽니다. 고객이 무엇을 뜻하는지가 합의입니다. 자세한 내용은 [The simplest protocol that reduces the most uncertainty wins](/notes/the-simplest-protocol-wins/)에 있습니다.

## 모든 것이 다시 소프트웨어입니다 {#everything-is-software-again}

저는 NVIDIA가 여름에 [NOOA](https://github.com/NVIDIA-NeMo/labs-OO-Agents)를 공개했을 때 살펴보았지만 시험해 볼 오후를 끝내 찾지 못했습니다. 그래서 Matt Staats가 직접 설명하는 것을 들을 수 있어 반가웠습니다. Staats는 테스트에 관한 박사 논문을 썼고, 테스트 오라클, 즉 프로그램의 출력이 옳은지 어떻게 아는가라는 질문에 관한 [수상 경력의 ICSE 논문](https://bibtex.github.io/ICSE-2011-StaatsWH11a.html)을 썼습니다. 지금 에이전트를 평가하는 일을 하는 사람에게 좋은 배경입니다. 그의 소개글은 "에이전트는 모델을 둘러싼 하네스만큼만 좋습니다"로 시작합니다.

<figure>
<img src="/agentic-days-2026-nooa-stage.avif" alt="무대에서 NOOA를 설명하는 Matt Staats" width="1600" height="800" loading="lazy">
<figcaption>NVIDIA의 Matt Staats가 "Zoom out: now everything is software" 슬라이드 앞에 서 있습니다. 에이전트 루프가 내부 상태를 가진 객체가 되는 슬라이드입니다.</figcaption>
</figure>

NOOA는 에이전트를 Python 클래스로 다룹니다. 메서드는 능력이고, 필드는 상태이며, docstring은 프롬프트이고, 시그니처는 계약입니다. 본문이 비어 있는 메서드는 런타임에 모델이 완성하며, 모델은 타입이 있는 서비스를 호출하는 Python을 써서 행동합니다. [Wang et al.](https://arxiv.org/abs/2402.01030)의 CodeAct 아이디어입니다. NVIDIA의 [글](https://developer.nvidia.com/blog/six-agent-harness-capabilities-for-higher-model-performance/)은 여섯 가지 능력을 꼽습니다. 타입이 있는 입력과 출력, 참조에 의한 전달, 행동으로서의 코드, 프로그래밍 가능한 루프 엔지니어링, 명시적인 객체 상태, 모델이 호출할 수 있는 하네스 API입니다. 이 글은 GPT-5.5로 SWE-bench Verified에서 82.2%를 보고하는데, 이는 NVIDIA의 숫자이지 제 숫자가 아닙니다. 제게 남은 슬라이드는 "Zoom out: now everything is software"였습니다. 에이전트 루프는 내부 상태를 가진 객체가 되고, 타입이 있는 작업을 받아 타입이 있는 값을 돌려주는 결정론적 애플리케이션이 그것을 호출합니다. 다음 슬라이드의 예제는 여기에 실을 만큼 작았습니다. 슬라이드에 적혀 있듯 NOOA의 프레임워크 소개에서 가져와 고친 것이고, `llm`은 설정된 클라이언트입니다.

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

`run`은 평범한 Python이고, 여느 프로그램처럼 입력을 거릅니다. `categorize`에는 본문이 없습니다. `...`가 그것을 모델에 넘기고, docstring이 프롬프트이며, 시그니처가 무엇이 돌아와야 하는지 말합니다. 판단은 위임되지만 계약은 위임되지 않습니다.

Staats가 보여 준 결과는 메모리에 관한 것이었고, 같은 모델과 같은 스킬로 ARC-AGI-3 게임에서 측정했습니다. 에이전트가 Markdown으로 자기 메모를 남기게 했을 때는 38.4%에 도달했고, NOOA의 메모리 API로는 50.2%에 도달했습니다. 에이전트들은 3,262개의 메모리를 썼지만, 자동 회상은 턴마다 평균 4.1개만 불러왔기 때문에 컨텍스트 창은 작게 유지되었습니다. 그다음 슬라이드의 제목은 "Software is cheaper than thinking", 부제는 "even if software is doing the thinking"이었습니다. Markdown 실행의 점수에 도달하는 데, 월드 모델과 메모리 API를 쓴 버전은 추정 API 비용으로 약 1,040달러가 아니라 약 290달러를 썼습니다. 하네스가 관리하는 구조화된 메모리가 모델이 다시 읽어야 하는 메모를 이깁니다. 그리고 수천 개 중 네 개를 불러오는 회상은 [strategic forgetting](/notes/strategic-forgetting/)의 한 형태이며, 이번에는 가격표가 붙어 있습니다.

이것은 제가 본 것 중 제약을 가장 설득력 있게 옮긴 사례입니다. 프롬프트와 느슨한 도구 목록은 리뷰하고, 버전을 관리하고, 테스트하기 어렵습니다. 시그니처가 있는 클래스는 그렇지 않습니다. 이는 제가 [Tools: How Agents Actually Do Things](/articles/tools-how-agents-actually-do-things/)에서 설명한 것과 가깝고, 제가 간 것보다 더 멀리 나아갔습니다.

제가 계속 생각한 것은 타입을 강제하지 않는 언어에서 쓰이는 "타입이 있는"이라는 말이었습니다. Python에서 애플리케이션과 에이전트 사이의 계약은 호출이 일어날 때 검사되고, NOOA는 출력이 맞을 때까지 재시도합니다. 컴파일러가 계약을 강제하는 언어라면, 타입이 맞을 때까지 프로그램이 빌드되지 않을 것입니다. 그래서 저는 [bhc](https://arcanist.sh/bhc/)로 돌아가, 추론과 하네스 바인딩이 그곳에서 네이티브 기본 요소가 될 수 있는지, 에이전트 호출이 다른 효과처럼 타입을 가질 수 있는지 생각하게 되었습니다. 그것이 라이브러리인지, 언어 기능인지, 나쁜 아이디어인지는 아직 모릅니다. 덜 다듬어진 버전은 [Harness types in the compiler](/notes/harness-types-in-the-compiler/)에 있습니다.

## 제약은 합의에 내려앉습니다 {#the-constraint-lands-on-alignment}

그날 가장 비전 있는 발표는 GitHub Next의 Krzysztof Cieślak이 했습니다. 그는 F# 도구인 Ionide를 만들었고, 스스로를 Copilot의 공동 창작자로 소개합니다. 그의 소개글은 "에이전틱 엔지니어링은 지금까지 혼자만의 이야기였습니다"라고 말하며, 이는 제 경험과 일치합니다. 한 사람, 여러 에이전트, 많은 산출물, 그리고 방에는 아무도 없습니다. 한 슬라이드는 "대부분의 AI 도구는 개발자 한 명의 생산성에 집중합니다"라고 했고, 방의 반응을 얻은 슬라이드는 "코드는 쌉니다. 공유된 이해와 신뢰는 그렇지 않습니다"(Code is cheap. Shared understanding and trust aren't.)라고 했습니다.

<figure>
<img src="/agentic-days-2026-cieslak.avif" alt="Krzysztof Cieślak: 코드는 싸지만, 공유된 이해와 신뢰는 그렇지 않습니다" width="1600" height="800" loading="lazy">
<figcaption>GitHub Next의 Krzysztof Cieślak: "코드는 쌉니다. 공유된 이해와 신뢰는 그렇지 않습니다." 방의 반응을 얻은 슬라이드입니다.</figcaption>
</figure>

그는 두 개의 연구 프로토타입을 보여 주었습니다. Ace는 팀, 그 팀의 채팅, 코딩 에이전트, 그리고 에이전트의 microVM을 하나의 공유 작업 공간에 넣습니다. 그 후속인 [Chopin](https://githubnext.com/projects/chopin/)은 "실시간 멀티플레이어 에이전틱 계획 환경"으로, 동료와 에이전트가 저장소를 중심으로 함께 계획을 쓰고 모두가 볼 수 있는 곳에서 결정을 내립니다. GitHub Next는 Chopin을 "제품도 아니고 완성된 프로토타입도 아니다"라고 조심스럽게 말하며, Ace는 중단된 상태입니다.

그 뒤에 있는 주장은 다시 Reznik의 문장입니다. GitHub Next의 Maggie Appleton은 올해 초 이를 한 줄로 [표현했습니다](https://maggieappleton.com/zero-alignment). "무엇을 만들지 합의하는 것이 새로운 병목입니다." 에이전트가 코드를 싸게 만들면, 제약은 코드가 무엇이어야 하는지에 관한 대화로 옮겨 가고, 풀 리퀘스트와 이슈와 채팅은 그런 속도의 그런 대화를 위해 만들어지지 않았습니다.

저는 일이 이쪽으로 가고 있다고 믿습니다. 여러 사람과 여러 에이전트가 함께하는 공유된 대화이고, 결정과 설계와 코드가 그 대화 안에서 만들어지고 그 대화에 붙어 남습니다. 이것을 보며 [Zed](https://zed.dev/)가 떠올랐습니다. 에이전트가 화제가 되기 훨씬 전부터 그 비전이 좋아서 일찍부터 썼던 에디터입니다. Zed는 Rust로 쓰였고, [그들의 표현](https://zed.dev/blog/videogame)으로는 자체 GPU 프레임워크 위에서 "비디오게임처럼 렌더링"되며, 처음부터 멀티플레이어였습니다. 올해 그들은 "그 사이의 모든 작업을 포착하고 각각에 안정적인 정체성을 부여하는" 버전 관리 [DeltaDB](https://zed.dev/blog/introducing-deltadb)를 발표했고, 그 위에 만든 [Delta](https://zed.dev/blog/introducing-delta)의 발표문은 "이제 소프트웨어가 일어나는 곳은 스레드이며, 인터페이스는 그것을 반영해야 합니다"라고 말합니다. Zed는 시대를 앞서 나왔고 그 과정에서 동력을 조금 잃었습니다. 저는 여전히 그들을 응원합니다. 자세한 내용은 [The conversation is the workspace](/notes/the-conversation-is-the-workspace/)에 있습니다.

## 결정론, 그리고 다크 팩토리 {#determinism-and-the-dark-factory}

제 오후는 Typeform의 스태프 엔지니어 Susanna Wong의 발표로 마무리되었습니다. 소프트웨어가 결정론적이기를 멈출 때 무슨 일이 일어나는지에 관한 발표였습니다. 우리의 엔지니어링 관행 대부분은 같은 입력이 같은 출력을 준다고 가정합니다. 그녀의 소개글은 이를 분명히 말합니다. "LLM 시스템은 그 가정을 깹니다." 발표는 Typeform이 무엇을 바꿔야 했는지 짚었습니다. 테스트 스위트 대신 지속적인 평가, 로그 대신 트레이스, 엔지니어링 산출물로서 리뷰되는 프롬프트, 그리고 두 번 같은 방식으로 동작하지 않는 구성 요소를 둘러싼 오케스트레이션입니다. 이는 [Evaluation Closes the Loop](/articles/evaluation-closes-the-loop/)가 다루는 영역이고, 제품에서 그것을 직접 겪어야 했던 사람에게서 듣는 것이 좋았습니다.

그녀의 마지막 슬라이드에는 "The one thing to take home"이라는 제목이 붙어 있었고, "프롬프트는 수율을 삽니다. 시스템은 보장을 삽니다"(Prompts buy yield. Systems buy guarantees.)라고 쓰여 있었습니다. 그 아래에는 "신뢰성은 모델이 아니라 시스템의 속성입니다." 그리고 맨 아래 작은 글씨로, 그날의 문장이 다른 형태로 쓰여 있었습니다. "결정론은 사라지지 않았습니다. 옮겨 갔습니다. 모델 밖으로, 그것을 둘러싼 시스템 안으로." 프롬프트는 좋은 답의 비율을 높일 수 있습니다. 모델을 둘러싼 시스템, 즉 평가, 재시도, 타입이 있는 계약, 승인하는 사람만이 무언가를 약속할 수 있습니다.

그녀의 발표는 Reznik의 다크 팩토리가 이르는 곳이기도 합니다. 이 용어는 무인(lights-out) 제조에서 왔고, Dan Shapiro가 말한 AI 코딩의 [다섯 단계](https://www.danshapiro.com/blog/2026/01/the-five-levels-from-spicy-autocomplete-to-the-software-factory/)는 그것으로 끝납니다. "명세를 소프트웨어로 바꾸는 블랙박스"입니다. Simon Willison의 [요약](https://simonwillison.net/2026/Jan/28/the-five-levels/)은 "로봇은 볼 필요가 없기 때문에 불이 꺼져 있는" 공장을 그립니다. 그곳에 이르기 위한 Reznik의 여섯 시스템은 오케스트레이션, 샌드박스, 컨텍스트, 검증, 거버넌스, 학습 루프이며, 그중 어느 것도 모델이 아닙니다. 불을 끄면 제약은 사람에게 남은 두 가지로 옮겨 갑니다. 명세를 쓰는 일, 그리고 출력이 옳은지 아는 일입니다. 그것이 Wong의 발표이고, Staats의 오래된 분야입니다.

## 제가 가지고 돌아온 것 {#what-i-took-home}

<figure>
<img src="/agentic-days-2026-colleagues.avif" alt="아페로에서 동료들과 함께" width="1600" height="800" loading="lazy">
<figcaption>아페로에서 동료들과 함께. 어떤 발표도 대신할 수 없는 컨퍼런스의 한 부분입니다.</figcaption>
</figure>

발표들은 좋았고, 하루는 그보다 더 좋았습니다. 주로 발표 사이사이, 그리고 아페로에서 동료들과 나눈 대화 덕분이었습니다. 하지만 하나만 남긴다면, Reznik의 문장이 준 습관입니다. 제가 본 모든 발표는 제약을 옮겼습니다. 데이터베이스 안으로, 프로토콜 안으로, 타입 안으로, 공유된 대화 안으로, 평가 안으로. 어느 것도 제약을 사라지게 하지 않았습니다. 새로운 에이전트 도구에 대해 물을 쓸모 있는 질문은 그것이 무엇을 없애는가가 아니라 일을 어디에 두는가, 그리고 그곳이 제가 보고, 테스트하고, 책임질 수 있는 자리인가입니다.

<figure>
<img src="/agentic-days-2026-zurich.avif" alt="집으로 가는 길, 해 질 녘의 취리히 중앙역" width="1600" height="800" loading="lazy">
<figcaption>해 질 녘의 취리히 중앙역, Basel로 돌아가는 길입니다.</figcaption>
</figure>

## 참고 자료 {#references}

- [Agentic Engineering Days Zurich 2026, programme](https://www.agenticdays.com/sessions)
- Pini Reznik, [From Copilot to the Dark Factory](https://www.agenticdays.com/session/1301641-from-copilot-to-the-dark-factory), 세션 소개글
- David Pech, ["YOU MUST NOT ssh!" and Other Stories from Building Our SRE Agent](https://www.agenticdays.com/session/1250380-you-must-not-ssh-and-other-stories-from-building-our-sre), 세션 소개글
- Alexander Stigsen, [Beyond MCP: Supercharging your agents with a single unified data plane](https://www.agenticdays.com/session/1368894-beyond-mcp-supercharging-your-agents-with-a-single-unified), 세션 소개글
- Exasol, [MCP Server as an agent tool](https://docs.exasol.com/db/latest/ai/ai_build_agents/mcp-server-as-agent-tool.htm)
- Stefano Maestri and Alessio Soldano, [Agents Speak Protocol](https://maeste.it/agents-speak-protocol-aed/), 덱과 [sources](https://maeste.it/agents-speak-protocol-aed/sources.html)
- A2A project, [GOVERNANCE.md](https://github.com/a2aproject/A2A/blob/main/GOVERNANCE.md)
- Matt Staats, [NOOA: Inside NVIDIA's Object-Oriented Agent Harness](https://www.agenticdays.com/session/1305345-nooa-inside-nvidia-s-object-oriented-agent-harness), 세션 소개글
- NVIDIA, [NVIDIA-NeMo/labs-OO-Agents](https://github.com/NVIDIA-NeMo/labs-OO-Agents) and [Six Agent Harness Capabilities for Higher Model Performance](https://developer.nvidia.com/blog/six-agent-harness-capabilities-for-higher-model-performance/)
- Xingyao Wang et al., [Executable Code Actions Elicit Better LLM Agents](https://arxiv.org/abs/2402.01030), ICML 2024
- Matt Staats, Michael W. Whalen and Mats P. E. Heimdahl, [Programs, Tests, and Oracles: The Foundations of Testing Revisited](https://bibtex.github.io/ICSE-2011-StaatsWH11a.html), ICSE 2011
- Krzysztof Cieślak, [The next frontier: agentic collaborative environments](https://www.agenticdays.com/session/1283743-the-next-frontier-agentic-collaborative-environments), 세션 소개글; GitHub Next, [Chopin](https://githubnext.com/projects/chopin/)
- Maggie Appleton, [One Developer, Two Dozen Agents, Zero Alignment](https://maggieappleton.com/zero-alignment)
- Zed, [Leveraging Rust and the GPU to render user interfaces at 120 FPS](https://zed.dev/blog/videogame), [Software Is Made Between Commits](https://zed.dev/blog/introducing-deltadb) and [Introducing Delta](https://zed.dev/blog/introducing-delta)
- Susanna Wong, [When Software Stops Being Deterministic](https://www.agenticdays.com/session/1287383-when-software-stops-being-deterministic-rethinking), 세션 소개글
- Pini Reznik and Michael Müller, [From Cloud Native to AI Native](https://re-cinq.com/whitepapers)
- Susanna Wong, closing slide of the talk, photographed in the room
- Dan Shapiro, [The Five Levels: from Spicy Autocomplete to the Dark Factory](https://www.danshapiro.com/blog/2026/01/the-five-levels-from-spicy-autocomplete-to-the-software-factory/)
- Simon Willison, [The five levels](https://simonwillison.net/2026/Jan/28/the-five-levels/)
