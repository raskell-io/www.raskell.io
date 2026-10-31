---
title: "에이전트란 실제로 무엇인가"
url: https://raskell.io/ko/articles/what-an-agent-actually-is/
author: Raffael Schneider
date: 2026-06-02
description: "AI 에이전트는 업계에서 가장 많은 뜻을 떠안은 단어입니다. 그 해부학과 계보, 그리고 Bun 위의 TypeScript 약 200줄로 만든 동작하는 구현을 다룹니다. The Agent Platform Handbook의 첫 번째 편입니다."
tags: [agents, ai-platforms, durable-execution, typescript]
series: the-agent-platform-handbook
lang: ko
translation_of: https://raskell.io/articles/what-an-agent-actually-is/
---

# 에이전트란 실제로 무엇인가

## 요약

에이전트는 목표, 모델, 컨텍스트, 도구, 루프라는 다섯 가지 속성을 지닌 소프트웨어입니다. 하나라도 빠지면 챗봇이나 워크플로, 혹은 한 번으로 끝나는 컴플리션(completion)이 됩니다. 아키텍처는 SHRDLU와 BDI 연구 때부터 이미 옳았습니다. 빠져 있던 것은 쓸 만한 언어 모델이었고, 이후 함수 호출이 루프를 소프트웨어 문제로 바꾸어 놓았습니다. 2025년부터 2026년 사이 코딩 에이전트와 뒤이어 어시스턴트 에이전트가 루프와 도구와 런타임을 하나로 묶었지만, 그 아래에 일관된 플랫폼을 갖춘 조직은 거의 없습니다. 이 시리즈는 그 간극을 메우려 합니다. 저는 셸 도구 하나와 반복 예산을 갖춘, 동작하는 에이전트를 Bun 위의 TypeScript로 만들고, 채팅 제품이 조용히 도구를 늘려 가면서 이름표가 아키텍처보다 뒤처진다는 것을 보여 드립니다. 챗봇은 모르는 것 때문에 실패하고 에이전트는 잘못 행동해서 실패합니다. 폭주하는 루프와 비용, 거짓 성공 보고, 격리의 부재, 숨은 상태 같은 실패 양상은 이후의 글들에서 다룹니다.

> *The Agent Platform Handbook. From Loop to Platform.* 1편. 하나의 루프에서 프로덕션 플랫폼까지 에이전트 스택을 따라가는 22편짜리 시리즈입니다. 다음 편: [Your Agent Wants Root](https://raskell.io/articles/your-agent-wants-root/).

같은 날 회의 세 개에 들어가 보면 *에이전트*라는 단어가 세 가지 다른 뜻으로 쓰이는 것을 듣게 됩니다. 벤더는 로고가 붙은 채팅 창을 뜻합니다. 플랫폼 팀은 재시도가 달린 워크플로를 뜻합니다. 보안 책임자는 들여다볼 수 없는 자격 증명을 쥔 채 오래 실행되는 프로세스를 뜻합니다. 이들 가운데 완전히 틀린 사람은 없습니다. 그리고 같은 것을 말하는 사람도 없습니다.

이 글은 하나의 에이전트 루프에서 시작해 프로덕션 플랫폼까지 올라가는 시리즈의 첫 편입니다. 격리, 도구, 아이덴티티, 오케스트레이션을 이야기하기 전에, 다이어그램 한가운데 있는 그것이 실제로 무엇인지부터 합의해야 합니다. 그래서 먼저 정의를 내리고, 그 해부학을 그려 보고, 업계가 여기까지 오게 된 경로를 따라간 다음, Bun 위의 TypeScript 약 200줄로 동작하는 에이전트를 직접 만들어 보겠습니다.

글이 끝날 무렵이면 이 추상명사는 실행할 수 있는 구체적인 파일이 되어 있을 것입니다.

## 실무적인 정의 {#a-working-definition}

에이전트는 다섯 가지 속성을 지닌 소프트웨어입니다. 어느 하나라도 빠지면 그것은 다른 무언가가 됩니다.

1. **목표.** 단 하나의 프롬프트가 아닙니다. 시스템이 충족하려고 하는 목표 상태, 작업 설명, 또는 문제 진술입니다.
2. **모델.** 현재 상태와 목표를 다음 단계로 옮겨 주는 하나 이상의 추론 엔진입니다. 오늘날 이것은 거의 언제나 대규모 언어 모델입니다.
3. **컨텍스트.** 사용자 입력 외에 모델이 읽을 수 있는 정보입니다. 시스템 프롬프트, 문서, 이전 턴, 환경 상태, 설정 파일 같은 것들입니다.
4. **도구.** 모델이 호출하도록 허용된, 부수 효과를 일으키는 연산들의 이름 붙은 유한한 집합입니다. 파일 읽기. 셸 명령 실행. API 호출.
5. **루프.** 모델이 도구를 고르고, 도구가 실행되고, 그 결과가 컨텍스트로 다시 들어가고, 모델이 다시 고릅니다. 루프는 목표가 충족되거나, 예산이 소진되거나, 정지 조건에 걸리면 끝납니다.

프로덕션에는 보통 여섯 번째 속성이 있습니다. 루프가 끝난 뒤에도 살아남는 상태인 **메모리**입니다. 메모리는 [여섯 번째 글](https://raskell.io/articles/memory-is-a-write-path/)에서 별도의 계층으로 다루기로 하고, 이 첫 에이전트는 상태 없이 두겠습니다.

다섯 가지 속성을 모두 갖춘 시스템은 에이전트입니다. 넷만 갖춘 시스템은 따로 이름을 붙일 만한 다른 무언가입니다. 채팅 창에는 목표, 모델, 컨텍스트, 루프가 있지만 도구가 없으므로 챗봇입니다. CI 파이프라인에는 목표, 컨텍스트, 도구, 루프가 있지만 모델이 없으므로 워크플로입니다. 함수 호출에는 목표, 모델, 컨텍스트, 도구가 있지만 루프가 없으므로 한 번으로 끝나는 컴플리션입니다. 행동을 열린 결말로 만드는 것은 루프의 존재입니다. 그 루프를 중요하게 만드는 것은 도구의 존재입니다.

지금까지 출시된 모든 에이전트의 아키텍처 다이어그램은 이렇게 생겼습니다.

*The agent loop*

```text
                          +--------------+
                          |    Goal      |
                          | (user task)  |
                          +-------+------+
                                  |
                                  v
   +------------+         +---------------+         +------------+
   |  Context   +-------->|     Model     |<--------+   Memory   |
   | docs, env, |         | next action?  |         | (optional) |
   | prior turns|         +-------+-------+         +------------+
   +------------+                 |
                                  | tool call
                                  v
                          +---------------+
                          |   Tool        |
                          | shell, http,  |
                          | file, custom  |
                          +-------+-------+
                                  |
                                  | result
                                  v
                          +---------------+
                          |    Runtime    |
                          | (where the    |
                          |  side effect  |
                          |  happens)     |
                          +-------+-------+
                                  |
                                  v
                       +----------+----------+
                       | done? --no--> loop  |
                       |   |                 |
                       |  yes                |
                       |   v                 |
                       | return              |
                       +---------------------+
```

다이어그램은 일부러 작게 그렸습니다. 이 시리즈의 거의 모든 글은 이 그림을 다시 그리면서 구성 요소 하나를 열어 볼 것입니다. 두 번째 글은 런타임을 엽니다. 세 번째 글은 도구를 엽니다. 네 번째 글은 컨텍스트를 엽니다. 여섯 번째 글은 메모리를 엽니다. 일곱 번째 글은 모델을 엽니다. 시리즈 끝의 마무리 글은 이 모두를 하나의 레퍼런스 아키텍처로 조립합니다.

이 그림을 머릿속에 담아 두십시오. 다시 이 그림으로 돌아오겠습니다.

## 여기까지 오게 된 길 {#how-we-got-here}

이 절의 나머지는 배경으로 읽으셔도 되고, 이미 겪어 오셨다면 처음 두 소절은 건너뛰셔도 됩니다. 2024년부터 2026년까지를 다루는 세 번째 소절은 어느 쪽이든 읽어 볼 만합니다. 함께 일하는 모든 사람이 왜 갑자기 *에이전트*라는 단어를 쓰는지 설명해 주기 때문입니다.

### 옛 AI {#the-old-ai}

소프트웨어 에이전트라는 아이디어는 현대의 LLM보다 약 50년 앞섭니다. 1970년 Terry Winograd(테리 위노그라드)의 SHRDLU는 자연어 명령을 받아, 시뮬레이션된 블록 세계에서 행동을 계획하고, 실행하고, 내부 상태를 갱신하는 프로그램이었습니다. 목표가 있었고, 세계에 대한 모델이 있었고, 도구 집합과 루프가 있었습니다. 그것은 에이전트였습니다. 블록 세계 안에서는 훌륭하게 작동했지만 그 밖으로 한 걸음만 나가면 곧바로 무너졌습니다. 세계에 대한 모델은 손으로 코딩한 것이었고 언어 이해는 깨지기 쉬웠기 때문입니다.

1980년대와 1990년대 내내 이 아이디어는 이름을 바꾸어 가며 계속 돌아왔습니다. 전문가 시스템은 비즈니스 로직을 추론 규칙으로 감쌌습니다. Bratman(브랫먼) 등이 정식화한 믿음-욕구-의도(Belief-Desire-Intention) 아키텍처는 에이전트에게 명시적인 인지 모델을 주었습니다. 에이전트가 무엇을 믿는지, 무엇을 원하는지, 다음에 무엇을 하려고 하는지에 대한 모델입니다. 좋은 논문들이 있었고, 동작하는 시스템과 출시된 제품도 있었습니다. 이들 모두가 놓친 것은 쓸 만한 언어 모델이었습니다. 에이전트의 목표를 형식 논리나 구조화된 DSL로 명세할 수는 있었습니다. 하지만 “비행기 표 좀 예약해 줘”라고 말해서 그것을 해석하게 할 수는 없었습니다.

이 시대의 교훈은 아키텍처가 수십 년 동안 옳았다는 것입니다. 병목은 모델이었습니다.

### 채팅의 시대 {#the-chat-era}

2020년 GPT-3가, 2022년 말 ChatGPT가 등장하자 언어의 병목이 무너졌습니다. 마침내 목표를 영어로 쓰면 시스템이 앞뒤가 맞게 응답했습니다. 업계의 첫 반응은 그 능력을 채팅 창으로 감싸서 파는 것이었습니다. 그것은 에이전트가 아닙니다. 루프도 도구도 없고, 모델은 자신이 사는 세계에 아무것도 할 수 없습니다. 대화를 기억하는 아주 좋은 자동 완성입니다.

에이전트 패턴은 누군가가 뻔한 다음 질문을 던졌을 때에야 돌아왔습니다. 모델이 영어를 읽고 쓸 수 있고, 우리가 모델에게 함수를 호출하게 할 수 있다면, 루프를 닫아서 모델이 행동하게 할 수 있지 않을까?

2022년 말부터 2023년 초 사이 두 편의 논문과 두 개의 화제가 된 데모가 그 질문에 답했습니다.

논문이 먼저였습니다. 2022년 10월에 발표된 Yao(야오) 등의 *ReAct: Synergizing Reasoning and Acting in Language Models*는 추론 단계와 도구 사용 단계를 번갈아 끼워 넣으면 어느 한쪽만 쓸 때보다 성능이 좋아진다는 것을 보여 주었습니다. 청사진은 냅킨 한 장에 들어갈 만큼 작았습니다. 생각하고, 행동하고, 관찰하고, 반복한다. 이것은 그 뒤로 출시된 거의 모든 에이전트의 사실상 표준 패턴이 되었습니다.

데모는 2023년 초에 나왔습니다. 2023년 3월 Toran Bruce Richards(토런 브루스 리처즈)가 공개한 Auto-GPT는 GPT-4를 바로 그 루프로 감싸 사람 없이 돌아가게 했습니다. 데모는 눈부셨고 끊임없이 고장 났습니다. 몇 주 뒤 Yohei Nakajima(나카지마 요헤이)의 BabyAGI는 약 100줄의 Python으로 같은 일을 했습니다. 둘 다 프로덕션 수준은 아니었습니다. 둘 다 ReAct 논문을 읽어 본 적 없는 사람들에게 그 아이디어를 알아볼 수 있게 만들었습니다. Auto-GPT 이후로는 “ChatGPT인데 작업이 끝날 때까지 계속 움직인다고 생각해 보세요”라는 말로 에이전트를 설명할 수 있었습니다. 그것은 엔지니어링이 아니라 마케팅의 돌파구였지만, 아이디어는 마케팅을 통해 퍼집니다.

뒤이은 엔지니어링의 돌파구는 2023년 6월에 출시된 OpenAI의 함수 호출 API였습니다. 자유로운 산문에서 “모델이 `search(query)`를 호출하고 싶어 한다”는 것을 파싱해 내려 애쓰는 대신, JSON 스키마로 도구를 선언하면 모델이 구조화된 도구 호출을 돌려주었습니다. Anthropic의 `tool_use`도 같은 패턴으로 출시되었습니다. 함수 호출과 함께 에이전트 루프는 정규식 문제이기를 멈추고 소프트웨어 문제가 되었습니다. 이 이야기는 [세 번째 글](https://raskell.io/articles/tools-how-agents-actually-do-things/)에서 다시 다룹니다.

2023년의 물결은 최초의 진짜 프레임워크들을 낳았습니다. 2022년 10월의 LangChain, 2023년 말의 AutoGen, 2024년의 CrewAI와 LangGraph입니다. 이들은 추상화로 경쟁했습니다. 어떤 것은 이겼고 어떤 것은 졌습니다. 이들은 이후의 글에서 살펴보겠습니다. 지금 중요한 것은 2024년 중반이 되자 에이전트를 만드는 일이 연구 프로젝트가 아니라 Python이나 TypeScript 연습 문제가 되었다는 점입니다.

### 2025년에서 2026년의 번들링 {#the-2025-to-2026-bundling}

여기서 *에이전트*라는 단어는 연구 용어이기를 멈추고 제품 범주가 되었습니다. 이 일은 두 차례의 물결로 일어났습니다.

첫 번째 물결은 빌더를 향한 것이었습니다. 2025년 초 Anthropic은 Claude Code를 출시했습니다. 노트북에서 돌아가며 파일을 편집하고, 셸 명령을 실행하고, 하위 에이전트를 띄울 수 있는 명령줄 에이전트였습니다. OpenAI는 Codex를 컴플리션 엔드포인트가 아닌 진짜 에이전트로 다시 내놓았습니다. 오픈 소스 커뮤니티는 OpenCode와 그 주변의 여섯 개 남짓한 프로젝트(aider, continue, opencoder)를 내놓아, 같은 형태에 벤더 중립적인 표면을 주었습니다. 이들 가운데 기술적으로 새로운 것은 없었습니다. 루프는 ReAct 루프였습니다. 도구는 `bash`와 `edit`였습니다. 새로웠던 것은 번들링이었습니다. 루프와 도구와 런타임이 30초 만에 설치할 수 있는 바이너리 하나에 함께 담겨 도착했습니다. 그것이 출시되자, 모든 인프라 및 플랫폼 엔지니어는 일주일 안에 노트북에 동작하는 에이전트를 갖게 되었습니다.

그다음에 일어난 일은 [What Sixteen AI Agents Taught Me About Management](https://raskell.io/articles/what-sixteen-ai-agents-taught-me-about-management/)에 썼습니다. 빌더들은 동작하는 에이전트를 갖게 되자 하나보다 많이 돌리고 싶어 했습니다. 하나보다 많이 돌리자 조정 문제에 부딪혔습니다. 조정 문제에 부딪히자, 에이전트 오케스트레이션이 소프트웨어 포장을 두른 관리의 문제라는 것을 알게 되었습니다.

두 번째 물결은 어시스턴트를 향한 것이었고, 개발자 청중을 완전히 벗어났습니다. OpenClaw는 2026년 초에 출시되어 첫 주에 GitHub 스타 10만 개를 넘겼습니다. Hermes가 같은 길을 따랐습니다. 둘 다 에이전트 패턴을 코드를 쓰지 않는 사람들에게 건넸습니다. 리서치 작업. 계약서 검토. 일정 조율. 같은 루프에 다른 도구와 다른 컨텍스트를 붙인 것입니다. 기업의 구매자는 더 이상 개발자 도구 팀이 아니라 워크플로가 있는 모든 사업 부서가 되었습니다.

2026년 중반인 지금, 시장은 바로 여기에 있습니다. 모든 엔지니어링 조직에는 코딩 에이전트를 로컬에서 돌리는 빌더들이 있습니다. 모든 비즈니스 조직에는 어시스턴트 에이전트를 시범 운영하는 누군가가 있습니다. 그 모든 것 아래에 일관된 플랫폼을 갖춘 조직은 거의 없습니다. 이 시리즈의 목적은 그 간극을 메우는 것입니다.

## 하나 만들어 보기 {#build-one}

에이전트가 무엇인지는 하나를 만들어 보면서 배우게 됩니다. 이어지는 코드는 Bun 위의 TypeScript로 쓴, 완전히 동작하는 에이전트입니다. 약 200줄입니다. 명령줄에서 목표를 읽고, 작은 도구 레지스트리와 함께 Anthropic의 API를 호출하고, 도구 호출을 실행하고, 결과를 되먹이고, 모델이 끝내거나 반복 예산이 소진되면 멈춥니다.

따라 하려면 세 가지가 필요합니다.

```
bun --version          # 1.1 or newer
echo $ANTHROPIC_API_KEY  # any valid key
bun add @anthropic-ai/sdk
```

이 글의 전체 소스는 [`the-agent-platform-handbook`](https://github.com/raskell-io/the-agent-platform-handbook)의 `post-01` 태그에 있습니다. 코드를 에디터에서 읽고 싶으시다면 클론해서 `bun agent.ts "list the three largest files under /etc"`를 실행해 보셔도 됩니다.

### 도구 인터페이스 {#the-tool-interface}

가장 먼저 정의할 만한 가장 작은 단위는 도구입니다. 도구에는 이름, 모델이 읽을 수 있는 설명, 입력에 대한 JSON 스키마, 그리고 부수 효과를 실행하고 문자열을 돌려주는 함수가 있습니다.

```typescript
// tools.ts
export type Tool = {
  name: string;
  description: string;
  input_schema: {
    type: "object";
    properties: Record<string, unknown>;
    required?: string[];
  };
  run: (input: Record<string, unknown>) => Promise<string>;
};
```

이것이 계약의 전부입니다. `run` 함수가 문자열을 돌려주는 것은 모델이 결과를 텍스트로 읽기 때문입니다. 도구가 구조화된 데이터를 돌려준다면 `JSON.stringify`로 직렬화하고 파싱은 모델에게 맡기십시오. 이 선택은 [세 번째 글](https://raskell.io/articles/tools-how-agents-actually-do-things/)에서 구조화된 출력을 더 자세히 볼 때 다시 살펴보겠습니다.

에이전트에게 줄 수 있는 단일 도구 가운데 가장 쓸모 있는 셸 도구는 이렇게 생겼습니다.

```typescript
// tools.ts (continued)
export const shell: Tool = {
  name: "shell",
  description:
    "Run a shell command in the current working directory and return its stdout, stderr, and exit code as JSON.",
  input_schema: {
    type: "object",
    properties: {
      command: {
        type: "string",
        description: "The shell command to run. Runs under `sh -c`.",
      },
    },
    required: ["command"],
  },
  run: async ({ command }) => {
    const proc = Bun.spawn(["sh", "-c", String(command)], {
      stdout: "pipe",
      stderr: "pipe",
    });
    const [stdout, stderr] = await Promise.all([
      new Response(proc.stdout).text(),
      new Response(proc.stderr).text(),
    ]);
    const code = await proc.exited;
    return JSON.stringify({ code, stdout, stderr });
  },
};
```

눈여겨볼 점이 몇 가지 있습니다. 설명은 여러분이 아니라 모델을 위해 쓴 것입니다. 도구가 무엇을 하는지, 무엇을 돌려주는지, 어떤 제약이 있는지 구체적으로 쓰십시오. JSON 스키마는 모델이 이 도구를 호출할지 결정할 때 보는 계약입니다. Bun의 `Bun.spawn`은 스트림을 돌려주므로, stdout과 stderr를 모두 읽어 종료 코드와 함께 모델이 추론할 수 있는 하나의 JSON 페이로드로 묶습니다.

이 도구는 어떤 셸 명령이든 실행합니다. 터무니없이 위험합니다. 배포하지 마십시오. 그 이유와 대처법을 설명하는 데 [두 번째 글](https://raskell.io/articles/your-agent-wants-root/)을 통째로 쓰겠습니다. 여러분의 노트북에서 사용자 한 명, 디렉터리 하나로 돌리는 데모라면 괜찮습니다.

### 루프 {#the-loop}

루프는 대부분의 설명이 서둘러 지나가는 부분입니다. 천천히 보겠습니다.

```typescript
// agent.ts
import Anthropic from "@anthropic-ai/sdk";
import type { MessageParam, ToolResultBlockParam } from "@anthropic-ai/sdk/resources/messages";
import { shell, type Tool } from "./tools";

const client = new Anthropic();
const tools: Tool[] = [shell];

const SYSTEM_PROMPT = `You are a careful command-line assistant.
You have access to a shell tool. Use it to investigate the user's
request and answer concretely. When you have the answer, stop calling
tools and reply in plain text.`;
```

SDK를 가져오고, 도구 하나를 등록하고, 시스템 프롬프트를 씁니다. 시스템 프롬프트는 사용자 입력이 아닌 첫 번째 컨텍스트입니다. 이것을 진짜 컨텍스트 전략으로 키우는 방법은 [네 번째 글](https://raskell.io/articles/context-is-the-product/)에서 다룹니다. 지금은 모델에게 어떻게 행동할지 알려 주는 한 문단일 뿐입니다.

```typescript
// agent.ts (continued)
async function step(messages: MessageParam[]) {
  return client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    tools: tools.map(({ run, ...t }) => t),
    messages,
  });
}
```

모델을 부르는 한 번 한 번이 `step`입니다. 우리가 보내는 도구 목록은 스키마뿐이고 `run` 함수는 절대 보내지 않으므로, 그것을 떼어 냅니다. 모델이 돌려주는 메시지는 최종 텍스트 답변이거나, 하나 이상의 도구를 호출해 달라는 요청입니다.

루프 자체는 50줄입니다.

```typescript
// agent.ts (continued)
export async function run(goal: string, maxIterations = 10) {
  const messages: MessageParam[] = [{ role: "user", content: goal }];

  for (let i = 0; i < maxIterations; i++) {
    const response = await step(messages);
    messages.push({ role: "assistant", content: response.content });

    if (response.stop_reason === "end_turn") {
      const text = response.content
        .filter((b) => b.type === "text")
        .map((b) => (b as { text: string }).text)
        .join("\n");
      console.log(text);
      return;
    }

    if (response.stop_reason !== "tool_use") {
      throw new Error(`unexpected stop reason: ${response.stop_reason}`);
    }

    const toolResults: ToolResultBlockParam[] = [];
    for (const block of response.content) {
      if (block.type !== "tool_use") continue;
      const tool = tools.find((t) => t.name === block.name);
      if (!tool) {
        toolResults.push({
          type: "tool_result",
          tool_use_id: block.id,
          content: `unknown tool: ${block.name}`,
          is_error: true,
        });
        continue;
      }
      console.error(`> ${block.name} ${JSON.stringify(block.input)}`);
      try {
        const result = await tool.run(block.input as Record<string, unknown>);
        toolResults.push({ type: "tool_result", tool_use_id: block.id, content: result });
      } catch (err) {
        toolResults.push({
          type: "tool_result",
          tool_use_id: block.id,
          content: String(err),
          is_error: true,
        });
      }
    }

    messages.push({ role: "user", content: toolResults });
  }

  console.error(`iteration limit (${maxIterations}) reached`);
}
```

한 번 따라가 보겠습니다. 목표를 첫 번째 사용자 메시지로 두고 시작합니다. 모델을 호출합니다. 모델의 응답을 대화에 덧붙입니다. 모델이 `end_turn`이라고 하면 최종 텍스트를 출력하고 반환합니다. 모델이 `tool_use`라고 하면 요청된 도구를 찾아 실행하고, 그 결과를 사용자 역할의 `tool_result` 블록으로 덧붙입니다. 모델은 다음 턴에서 그 결과를 보고 무엇을 할지 정합니다.

`maxIterations`가 달린 `for` 루프는 이 에이전트와 끝없는 실행 사이에 서 있는 유일한 것입니다. 반복 횟수가 올바른 예산 단위인지는 [여덟 번째 글](https://raskell.io/articles/the-bill-is-part-of-the-loop/)의 상당 부분을 들여 다루겠습니다. 올바른 단위는 아니지만 가장 단순한 단위입니다. 가장 단순한 것에서 시작하십시오.

진입점은 두 줄입니다.

```typescript
// agent.ts (continued)
const goal = process.argv.slice(2).join(" ");
if (!goal) {
  console.error("usage: bun agent.ts '<goal>'");
  process.exit(1);
}
await run(goal);
```

이것이 에이전트의 전부입니다. import와 시스템 프롬프트를 포함해 약 140줄의 코드입니다. 처음에 내린 정의에 따르면 이것은 진짜 에이전트입니다. 목표, 모델, 컨텍스트(시스템 프롬프트와 계속 쌓이는 메시지 목록), 도구(하나), 루프(`maxIterations`가 달린 `for`)가 있습니다.

### 실행해 보기 {#running-it}

짧은 실행 기록을 보면 루프가 구체적으로 보입니다.

```
$ bun agent.ts "what is the largest TypeScript file under src and what does it do?"
> shell {"command":"find src -name '*.ts' -type f -printf '%s %p\n' | sort -nr | head -5"}
> shell {"command":"wc -l src/agent.ts"}
> shell {"command":"head -40 src/agent.ts"}
The largest TypeScript file under src is src/agent.ts at 4837 bytes
(150 lines). It implements an agent loop against the Anthropic Messages
API. It defines a single shell tool, sends the user's goal to the model,
executes any tool calls the model requests, feeds the results back, and
stops when the model returns an end_turn response or the iteration
budget of 10 steps is exhausted.
```

`>`로 시작하는 줄은 에이전트의 도구 호출로, 루프 안의 `console.error`가 남긴 로그입니다. 마지막 문단은 모델의 `end_turn` 텍스트입니다. 도구 호출 세 번, 최종 답변 하나, 닫힌 루프 하나.

여러분은 이제 에이전트를 갖게 되었습니다.

## 대부분의 에이전트 데모가 에이전트가 아닌 이유 {#why-most-agent-demos-are-not-agents}

정의가 구체적이 되었고 동작하는 예시도 생겼으니, 무엇이 에이전트이고 무엇이 아닌지라는 질문이 쓸모 있어집니다. 정직한 답은 이 표에 있습니다.

| 시스템                              | 목표 | 모델 | 컨텍스트 | 도구 | 루프 | 판정     |
|--------------------------------------|:----:|:-----:|:-------:|:-----:|:----:|-------------|
| ChatGPT, 2022년 출시 당시                 |  Y   |   Y   |    Y    |   N   |  Y   | 챗봇     |
| 오늘의 ChatGPT(웹 탐색, 코드, 파일)  |  Y   |   Y   |    Y    |   Y   |  Y   | 에이전트       |
| Cursor의 인라인 편집                 |  Y   |   Y   |    Y    |   Y   |  N   | 컴플리션  |
| GitHub Actions 워크플로            |  Y   |   N   |    Y    |   Y   |  Y   | 워크플로    |
| 순수한 검색 증강(RAG) 채팅      |  Y   |   Y   |    Y    |   N   |  Y   | 챗봇+RAG |
| 함수 호출 API 호출 한 번          |  Y   |   Y   |    Y    |   Y   |  N   | 도구 호출   |
| 터미널의 Claude Code          |  Y   |   Y   |    Y    |   Y   |  Y   | 에이전트       |
| 이 글의 스크립트              |  Y   |   Y   |    Y    |   Y   |  Y   | 에이전트       |
| Auto-GPT, BabyAGI                    |  Y   |   Y   |    Y    |   Y   |  Y   | 에이전트       |
| OpenClaw                             |  Y   |   Y   |    Y    |   Y   |  Y   | 에이전트       |
| LLM 단계가 있는 Temporal 워크플로 |  Y   |   Y   |    Y    |   Y   |  Y   | 에이전트       |

처음 두 행은 2년을 사이에 둔 같은 제품입니다. ChatGPT는 2022년 11월 도구 없는 채팅 창으로 출시되었습니다. 오늘날 같은 웹 UI는 실시간 웹을 탐색하고, 샌드박스 런타임에서 Python을 실행하고, PDF를 변환해 읽고, 이미지를 생성할 수 있습니다. 선을 넘은 것입니다. 흥미로운 점은 사용자에게 보이는 언어는 바뀌지 않았다는 것입니다. 여전히 챗봇이라고 불립니다. 우리가 쓰고 있는 정의로는 에이전트입니다. 마케팅 아래에서 경계가 움직였습니다.

앞으로 2년 동안 업계 전반에서 예상해야 할 패턴이 바로 이것입니다. 모든 채팅 제품은 조용히 도구를 늘려 갈 것입니다. 모든 워크플로 제품은 조용히 모델을 들여올 것입니다. 이름표는 아키텍처보다 1년이나 2년 뒤처질 것입니다. 이름표에만 귀를 기울이면, 어떤 시스템이 거버넌스를 다르게 적용해야 할 무언가로 바뀌는 순간을 놓치게 됩니다.

순수 RAG 행은 선을 넘지 않는 행입니다. 자기 컨텍스트를 풍부하게 하기만 하는 검색 증강 채팅은 중요한 의미에서의 도구를 얻지 못합니다. 모델은 찾아낸 것을 바탕으로 무언가 다른 일을 하기로 결정할 수 없습니다. 더 풍부한 컨텍스트에서 답할 뿐입니다. 쓸모 있고 때로는 훌륭하지만 에이전트는 아닙니다. 같은 시스템이 “다른 질의로 다시 검색하기”나 “이 문서 가져오기” 같은 도구를 얻는 순간, 그것은 에이전트가 됩니다.

LLM 단계가 있는 Temporal 행은 정반대의 이유로 흥미롭습니다. 그것은 에이전트입니다. 동시에 워크플로이기도 합니다. 두 범주는 서로 배타적이지 않습니다. 거의 모든 에이전트의 프로덕션 버전이 왜 결국 지속형(durable) 워크플로에 감싸이게 되는지는 이후의 글에서 설명하겠습니다.

이 표의 요점은 단어의 문지기 노릇을 하는 것이 아닙니다. 개념적인 구분을 가리키는 것입니다. 챗봇은 모르는 것 때문에 실패합니다. 에이전트는 잘못 행동해서 실패합니다. 시스템이 행동할 수 있게 되면 실패 양상이 바뀌고, 운영자에게 져야 할 책임도 바뀝니다.

## 실패 양상 {#failure-modes}

위의 스크립트는 처음 열 번은 잘 돌아갈 것입니다. 이 스크립트가 지닌 실패 양상 가운데 어떤 것은 뻔합니다. 어떤 것은 프로덕션에서만 보입니다. 대략 마주치게 될 순서대로 정직하게 꼽은 목록입니다.

- **진전으로 위장한 무한 루프.** 모델은 수렴하지 않은 채 끝없이 도구를 호출할 수 있습니다. 오늘은 `maxIterations = 10`이 여러분을 여러분 자신의 데모로부터 구해 줍니다. 내일 누군가 더 어려운 질문을 던지면 구해 주지 못합니다. 진짜 예산은 단계가 아니라 토큰이나 실제 경과 시간을 기준으로 합니다. 이 문제는 [여덟 번째 글](https://raskell.io/articles/the-bill-is-part-of-the-loop/)에서 제대로 고치겠습니다.
- **비용 폭주.** 모든 반복은 대화 전체를 입력으로 받는 완전한 모델 호출입니다. 새 턴마다 이전 턴을 모두 다시 보내기 때문에, 토큰 비용은 단계 수에 대해 대략 제곱으로 늘어납니다. 열 단계짜리 루프는 한 단계 호출의 열 배보다 많은 비용이 듭니다. 프롬프트 캐싱이 도움이 됩니다. 값싼 턴에 더 작은 모델을 쓰면 더 도움이 됩니다. 이 주제에는 [여덟 번째 글](https://raskell.io/articles/the-bill-is-part-of-the-loop/)을 쓰겠습니다.
- **성공에 대한 거짓말.** 모델은 실제로 확인하지 않고도 작업을 끝냈다고 주장할 수 있습니다. 셸 도구는 답이 맞는지 확인하지 않습니다. “X를 했나요?”라고 물으면, 사실은 “시도했고, 실패했고, 포기했다”인데도 “네”라는 답을 들을 수 있습니다. 평가(eval)는 이것을 위해 존재합니다. 이후의 글에서 설명하겠습니다.
- **망가진 도구 출력.** 도구가 1메가바이트짜리 바이너리 데이터를 돌려주면 모델은 숨이 막히거나 환각을 일으킵니다. 도구 출력은 요약하거나, 잘라 내거나, 스키마에 맞게 다듬어야 합니다. 에이전트가 대신 해 주지 않습니다.
- **격리의 부재.** 모델이 `rm -rf $HOME`이 맞는 명령이라고 판단하면 셸 도구는 그것을 실행합니다. 모델이 그렇게 판단하는 일은 자주 있지 않을 것입니다. 하지만 적어도 한 번은 있을 것입니다. 이것이 다음 글의 주제입니다.
- **숨은 상태.** 모든 도구 호출은 런타임에 부수 효과를 남깁니다. 파일이 생기고, 네트워크 호출이 일어나고, 데이터베이스 행이 삽입됩니다. 대화 로그는 그 어느 것도 담지 않습니다. 모델의 추론은 재생할 수 있습니다. 모델이 추론하던 대상인 세계는 재생할 수 없습니다. 진지한 시스템은 멱등성과 지속형 실행(durable execution)으로 이것을 다룹니다.
- **동시성 엣지 케이스.** 이 루프는 순차적입니다. 모델은 한 턴에 여러 도구를 요청할 수 있고, 위의 예시는 그것들을 차례로 실행합니다. 그 도구들 가운데 두 개가 같은 파일에 쓰려고 하면, 모델은 볼 수 없는 버그가 생깁니다.

이 가운데 어느 것도 에이전트를 만들지 말아야 할 이유는 아닙니다. 이것들은 이 시리즈의 나머지가 존재하는 이유입니다.

## 이 글이 일부러 빼놓은 것 {#what-this-post-left-out-on-purpose}

긴 글이라도 빠지는 것은 있습니다. 의도적으로 빼놓은 것들과, 그것을 다루는 글을 함께 적어 둡니다.

- **격리.** 셸 도구는 위험합니다. [두 번째 글: Your Agent Wants Root](https://raskell.io/articles/your-agent-wants-root/)에서 고칩니다.
- **진짜 도구 레지스트리.** 도구 하나는 데모입니다. 쓸모 있는 에이전트에는 네 개에서 열두 개쯤의 도구가 있습니다. [세 번째 글](https://raskell.io/articles/tools-how-agents-actually-do-things/)에서 다룹니다.
- **컨텍스트 전략.** 시스템 프롬프트는 한 문단입니다. 진짜 시스템은 디스크에서 컨텍스트를 불러와 작업마다 다듬습니다. [네 번째 글](https://raskell.io/articles/context-is-the-product/)과 [다섯 번째 글](https://raskell.io/articles/retrieval-is-a-tool-not-a-layer/)에서 다룹니다.
- **세션을 넘나드는 메모리.** 이 에이전트는 실행과 실행 사이에 모든 것을 잊습니다. [여섯 번째 글](https://raskell.io/articles/memory-is-a-write-path/)에서 다룹니다.
- **모델 선택.** 우리는 모델 하나를 하드코딩했습니다. 프로덕션 에이전트는 라우팅을 합니다. [일곱 번째 글](https://raskell.io/articles/the-model-is-a-dependency/)에서 다룹니다.
- **도구 프로토콜.** 이 도구 인터페이스는 직접 만든 것입니다. 업계는 MCP로 수렴했습니다. 이후의 글에서 다룹니다.
- **프레임워크.** 우리는 이것을 맨손으로 만들었습니다. 프레임워크 이야기는 시리즈 후반에 나옵니다.
- **아이덴티티, 평가, 지속성, 경제성, 거버넌스.** 시리즈의 네 번째와 다섯 번째 아크(arc) 전체에서 다룹니다.

시리즈의 목차를 보시면 그 모양이 보입니다. 시리즈의 나머지 글은 하나하나가 방금 만든 에이전트의 한계를 하나씩 고칩니다.

## 플랫폼에서 이것이 놓이는 자리 {#where-this-lands-in-the-platform}

이 글 맨 위의 다이어그램은 최종 레퍼런스 아키텍처에서 가장 작은 상자입니다. 에이전트 루프는 런타임 안에 있습니다. 런타임은 플릿(fleet) 안에 있습니다. 플릿은 아이덴티티, 관측 가능성, 거버넌스, 컨트롤 플레인을 갖춘 플랫폼 안에 있습니다. 시리즈 끝에서 우리가 도달하는 모양은 처음에 시작한 모양과 같습니다. 그것을 엔터프라이즈 규모로 키우고, 모든 구성 요소를 열어 각자에 프로덕션 수준의 이야기를 붙인 것입니다.

시리즈 전체를 하나의 규칙으로 머릿속에 담아 둘 수 있습니다. 각 글은 스택에 계층 하나를 더하고, 그 아래 계층만으로는 왜 충분하지 않았는지를 설명합니다.

다음 계층은 런타임입니다. 방금 프런티어 모델에게 건넨 셸 도구는 장전된 총입니다. 다음 주에는 그 총구를 안전한 곳으로 돌리는 방법을 설명하겠습니다.

## 다음 글 {#next}

**2편: [Your Agent Wants Root](https://raskell.io/articles/your-agent-wants-root/).** Docker 컨테이너만으로는 왜 충분하지 않은지, 그리고 Firecracker, gVisor, Kata가 실제로 무엇을 해결하는지. 목요일에 게시됩니다.
