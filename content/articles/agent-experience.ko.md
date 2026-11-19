+++
title = "에이전트 경험: 여러분이 만드는 모든 것의 세 번째 독자"
date = 2026-11-24
draft = true
description = "UX는 시스템을 쓰는 사람을, DX는 시스템을 만드는 사람을 위한 것입니다. 이제 에이전트가 두 일을 모두 하고, 에이전트가 얼마나 추측해야 하는지가 설계의 문제가 되었습니다."

[extra]
author = "Raffael"
in_short = [
  "에이전트가 코드를 쓰게 되면 개발자는 문법과 패턴에 쓰는 시간이 줄고 아키텍처, 통합, 요구사항에 쓰는 시간이 늘어납니다. 그리고 에이전트가 다루는 도구는 그 어느 때보다 중요해집니다.",
  "에이전트 경험(AX)은 Mathias Biilmann이 2025년에 소개한 용어이고, 한 가지로 재는 것이 가장 좋습니다. 에이전트가 여러분의 시스템에서 옳은 일을 하기 위해 얼마나 추측해야 하는가입니다.",
  "인터페이스는 가독성의 사다리 위에 놓입니다. 추측할 것을 남기지 않는 컴파일러와 스키마에서, 모든 것을 추측하게 만드는 HTML과 스크린샷까지입니다. 그리고 오류와 피드백이 모든 인터페이스 가운데 가장 중요합니다.",
  "Bun을 Zig에서 Rust로 옮긴 일과 Anthropic이 git을 떠난 일이 보여 주듯, 도구는 다시 쓰기 싼 것이 되었습니다. 그래서 생태계를 고를 때 약속하게 되는 것은 구현이 아니라 그 생태계의 전제입니다.",
  "에이전트의 컨텍스트는 리포지토리, 프로토콜, 그래프, 인덱스로 이루어진 공급망을 거쳐 도착하고, 다른 모든 공급망과 같은 관리를 받아야 합니다. 출처, 신선도, 안정적인 계약, 비용입니다.",
  "표준은 빠르게 등장하고 있지만(AGENTS.md, MCP, Agent Skills, llms.txt), 빈틈이 더 큽니다. 명령줄 도구를 위한 계약, 보장된 효과, 컨텍스트의 출처, 시스템을 측정하는 방법, 그리고 지시와 데이터 사이의 경계입니다.",
]
+++

처음 보는 리포지토리에서 코딩 에이전트가 10분 동안 일하는 모습을 지켜보며 추측을 세어 보십시오. 어떤 명령이 테스트를 실행하는지, 린터의 경고가 치명적인지, 배포 도구가 산문 두 단락과 스택 트레이스로 무엇을 말하려는지, `billing`이라는 이름의 서비스 세 개 가운데 티켓이 말하는 것이 어느 것인지, 그리고 README가 아직도 맞는지입니다. 추측 하나하나가 토큰과 시간을 쓰고, 그중 일부는 틀리며, 틀린 추측은 결국 풀 리퀘스트에 들어갑니다.

그런 추측 가운데 모델에 대해 무언가를 말해 주는 것은 거의 없습니다. 추측은 에이전트가 놓인 시스템에서 나오고, 그 대부분은 설계로 없앨 수 있습니다. 이제 일의 상당 부분을 맡은 에이전트를 시스템이 얼마나 잘 돕는지는 그 자체로 하나의 설계 문제가 되었고, 이 글은 그것을 기술해 보려는 제 시도입니다.

## 개발자는 한 단계 위로 올라갔습니다 {#the-developer-moved-up-a-level}

[Almost Irrelevant](/articles/almost-irrelevant/)에서 저는 에이전트가 코드 대부분을 쓰게 되면 프로그래밍 언어 선택이 예전보다 훨씬 덜 중요해진다고 주장했습니다. 학습 곡선, 형식적 절차, 보일러플레이트를 에이전트가 떠안기 때문입니다. 같은 변화가 개발자가 하루 종일 생각하는 대상도 바꿉니다. 문법, 디자인 패턴, 루프를 어떻게 표현할지에 쓰는 생각은 줄고, 전체의 형태에 쓰는 생각이 늘어납니다. 어떤 시스템이 어떤 데이터를 소유하는지, 한 변경이 옆에 있는 세 시스템으로 어떻게 번지는지, 요구사항이 실제로 무엇인지, 일이 끝났을 때 무엇이 참이어야 하는지입니다.

그대로인 것은 도구입니다. 도구는 예전보다 더 중요해졌고, 그 이유는 Jarred Sumner가 [Bun이 Anthropic에 합류할 때](https://bun.com/blog/bun-joins-anthropic) 잘 표현했습니다. “새 코드 대부분을 AI 에이전트가 쓰고, 테스트하고, 배포하게 된다면, 그 코드를 둘러싼 런타임과 도구는 훨씬 더 중요해집니다.” 그는 사람이 “개별 코드 한 줄 한 줄에서 더 멀어지므로, 코드가 실행되는 환경은 빠르고 예측 가능해야 한다”고 썼습니다. 에이전트는 같은 명령을 하루에 천 번 실행하고 모든 출력을 문자 그대로 받아들입니다. 그래서 개발자가 무시하는 법을 익혔던 기벽들이 이제는 실행할 때마다 비용이 됩니다.

## 세 독자 {#three-readers}

이제 모든 시스템에는 세 종류의 독자가 있습니다.

| | 사용자 경험(UX) | 개발자 경험(DX) | 에이전트 경험(AX) |
|---|---|---|---|
| 누구 | 시스템을 쓰는 사람 | 시스템 위에서나 안에서 무언가를 만드는 사람 | 그 둘 중 하나를 하는 에이전트 |
| 읽는 것 | 화면, 문구, 흐름 | 문서, API, 오류, 도구 | 모든 것을, 문자 그대로, 매번 |
| 기억하는 것 | 몇 년에 걸친 습관 | 팀의 구전 지식 | 적어 두지 않는 한, 세션 사이에 아무것도 |
| 도움을 구하는 곳 | 고객 지원, 동료 | 동료, 포럼 | 아무 데도 없음. 추측함 |
| 혼란의 비용 | 잃어버린 고객 | 날려 버린 오후 | 기계의 속도로 반복되는 잘못된 변경 |

세 번째의 이름은 Netlify의 최고경영자 Mathias Biilmann에게서 왔습니다. 그는 2025년 1월 [Introducing AX: Why Agent Experience Matters](https://biilmann.blog/articles/introducing-ax)에서 이 말을 소개하며 “AI 에이전트가 제품이나 플랫폼의 사용자로서 겪게 될 총체적인 경험”이라고 정의했습니다. 다른 사람들도 금세 이 말을 받아들였습니다. 한 달 뒤 Resend의 Zeno Rocha는 [What is AX](https://resend.com/blog/agent-experience)에서 “에이전트는 밀리초 만에 시작하고 돌아갈 수 있어야 합니다”라고 썼습니다. 이 용어는 개발자에게 파는 제품에 관한 질문으로 태어났습니다. 사람이 양식을 하나하나 클릭해 넘기지 않아도 에이전트가 가입하고, 문서를 읽고, 배포할 수 있는가 하는 질문입니다.

저는 이 말을 더 넓게 씁니다. 에이전트 경험은 모든 코드베이스, 내부 도구, 두 팀 사이의 API, 회사가 간직한 모든 지식의 속성입니다. 이제 에이전트는 제품의 정문에서만이 아니라 그 모든 것 안에서 일하기 때문입니다. 또 저는 더 좁은 정의도 씁니다. 그쪽이 행동으로 옮기기 쉽기 때문입니다. **에이전트 경험이란 에이전트가 여러분의 시스템에서 옳은 일을 하기 위해 얼마나 추측해야 하는가입니다.** 좋은 시스템은 추측할 것을 거의 남기지 않고, 남은 추측은 확인하기 싸게 만듭니다.

## 추측은 어디서 오는가 {#where-the-guesses-come-from}

모델만이 아니라 인터페이스가 에이전트가 할 수 있는 일을 결정한다는 첫 번째 진지한 증거는 2024년의 SWE-agent 논문([Yang et al.](https://arxiv.org/abs/2405.15793))에서 나왔습니다. 이 논문은 에이전트-컴퓨터 인터페이스라는 개념을 도입했고, 시간이 지나도 낡지 않은 주장을 폈습니다. “LM 에이전트는 고유한 필요와 능력을 지닌 새로운 범주의 최종 사용자입니다.” 이 논문의 절제 실험(ablation)은 꼼꼼히 읽어 볼 만합니다. 모든 변경이 인터페이스에 대한 것이었고, 모델에 대한 것은 하나도 없었기 때문입니다.

| 인터페이스 변경(SWE-bench Lite) | 해결 비율 |
|---|---|
| 전체 인터페이스: 깨진 편집을 거부하는 린터가 달린 편집기, 요약된 검색, 100줄짜리 파일 뷰어 | 18.0% |
| 린터라는 안전장치가 없는 같은 편집기 | 15.0% |
| 요약 대신 결과를 한 페이지씩 돌려주는 검색 | 12.0% |
| 한 번에 100줄 대신 파일 전체를 보여 주기 | 12.7% |
| 편집 명령이 아예 없음 | 10.3% |

에이전트에게 파일을 더 많이 보여 주자 결과가 나빠졌고, 검색 결과를 넘겨 보게 하자 검색이 아예 없을 때(15.7%)보다도 나빠졌습니다. 도움이 된 것은 예측 가능한 형태로 주어진 더 적은 정보였습니다. Anthropic도 자사 에이전트에서 같은 교훈을 얻었습니다. [Building effective agents](https://www.anthropic.com/engineering/building-effective-agents)에서 팀은 코딩 에이전트를 만들 때 “전체 프롬프트보다 도구를 최적화하는 데 더 많은 시간을 썼다”고 썼고, “철저한 도구 문서화와 테스트를 통해 에이전트-컴퓨터 인터페이스(ACI)를 신중하게 만들라”고 조언했습니다. 이 조언에는 제조업에서 빌려 온 이름이 있습니다. “도구에 포카요케를 적용하라(Poka-yoke your tools)”, 즉 애초에 실수하기 어렵도록 도구를 바꾸라는 것입니다.

제 일에서 추측은 몇 안 되는 곳에서 나오고, 그 거의 전부는 늘 거기 있었습니다. 사람은 그저 동료에게 물어보는 것으로 그것을 흡수했을 뿐입니다.

- **모양이 바뀌는 출력.** 색과 진행 표시줄을 곁들여 사람을 위한 표를 출력하면서, 안정적인 기계용 형식은 없는 도구.
- **산문으로 된 오류.** 바쁜 사람을 위해 쓴 메시지. 에이전트는 이것을 해석해야 하고, 문구는 버전마다 바뀝니다.
- **머릿속에 사는 관례.** 팀이 브랜치에 이름을 붙이는 방식, 어떤 테스트가 불안정한지, 어떤 디렉터리가 죽었는지.
- **서로 어긋나는 이름.** 같은 애플리케이션이 리포지토리에서는 이 이름, 클러스터에서는 저 이름, 장애 관리 도구에서는 또 다른 이름으로 불리는 것.
- **어긋나 버린 문서.** 2년 전에는 사실이었지만, 이제 아니라는 것을 알려 주는 표시는 하나도 없는 README.
- **출처 없는 지식.** 어디서 왔는지, 얼마나 오래되었는지 알 길이 없는 답.

## 가독성의 사다리 {#the-legibility-ladder}

모든 인터페이스가 같은 양의 추측을 남기지는 않습니다. 저는 추측할 것을 전혀 남기지 않는 인터페이스부터 거의 모든 것을 남기는 인터페이스까지 순위를 매겨 보는 것이 유용하다고 생각합니다.

| 단 | 인터페이스 | 에이전트가 여전히 추측해야 하는 것 |
|---|---|---|
| 1 | 컴파일러나 타입 검사기 | 거의 없음: 답은 예, 아니면 정확히 어디서 왜 아닌지 |
| 2 | 공개된 스키마가 있는 구조화된 출력(JSON Schema, OpenAPI, RFC 9457 오류) | 무슨 일이 일어났는지가 아니라 다음에 무엇을 할지 |
| 3 | 안정적인 플래그, 종료 코드, `--json` 모드가 있는 CLI | 문서화되지 않은 필드의 의미 |
| 4 | 에이전트가 가져올 수 있는 Markdown 문서(`llms.txt`, `.md` 사본) | 그것이 최신인지, 코드와 어떻게 대응하는지 |
| 5 | HTML 페이지 | 내비게이션과 스크립트 사이에서 내용이 어디 있는지 |
| 6 | 그래픽 인터페이스 | 거의 모든 것 |

에이전트 경험을 개선하는 일은 대부분 무언가를 이 사다리 위로 옮기는 일입니다. Cloudflare의 수치는 한 단 올라가는 것이 얼마나 값진지 보여 줍니다. [Markdown for Agents](https://blog.cloudflare.com/markdown-for-agents/)가 요청하는 클라이언트에게 페이지를 Markdown으로 내주면, 그들의 블로그 글 하나가 16,180토큰에서 3,150토큰으로 줄어듭니다. 그들의 표현으로는 “AI에게 원시 HTML을 먹이는 것은 안에 든 편지가 아니라 포장지를 읽는 데 단어당 돈을 내는 것과 같습니다.” Anthropic의 장기 실행 에이전트는 기능 목록을 Markdown이 아니라 JSON으로 보관합니다. “모델이 JSON 파일을 부적절하게 바꾸거나 덮어쓸 가능성이 더 낮기” 때문입니다([Effective harnesses for long-running agents](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents)). 어느 단에 있느냐가, 에이전트의 주의력 가운데 얼마가 일 자체로 가고 얼마가 지금 무엇을 보고 있는지 알아내는 데 가는지를 정합니다.

같은 명령이 서로 다른 두 단에 놓일 수 있습니다. 이것은 사람을 위해 쓴 배포 도구입니다.

```text
⠋ Deploying claims-api to prod...
✗ Something went wrong. The rollout could not be completed because one or more
  replicas failed their readiness checks. Check the dashboard for details.
```

그리고 이것은 모든 독자를 위해 쓴 같은 실패입니다.

```text
$ deployctl rollout claims-api --env prod --json
{"status":"failed","stage":"readiness","service":"claims-api","env":"prod",
 "replicas":{"ready":1,"wanted":3},"probe":"/healthz","last_status":503,
 "logs":"deployctl logs claims-api --env prod --since 10m","exit_code":3}
```

첫 번째는 에이전트에게 추측하라고 한 다음, 에이전트가 볼 수 없는 대시보드로 보냅니다. 두 번째는 무엇이 실패했는지, 얼마나 실패했는지, 다음에 어디를 볼지, 어떤 종료 코드로 분기할지를 말해 주며, 사람도 똑같이 잘 읽을 수 있습니다.

## 오류 메시지가 곧 API입니다 {#the-error-message-is-the-api}

에이전트를 위해 시스템에서 가장 신경 써야 할 부분은 피드백입니다. 오류, 경고, 테스트 출력, 리뷰 코멘트입니다. 에이전트는 대부분의 시간을 무언가를 시도하고 돌아온 것을 읽는 루프 안에서 보내므로, 돌아오는 것이 에이전트가 가장 많이 쓰는 인터페이스입니다.

제가 아는 가장 분명한 예는 Bun의 재작성입니다. Bun은 Zig로 쓰였고, 2026년 5월에 Jarred Sumner는 “Claude Code에서 약 50개의 동적 워크플로를 11일 동안 쉬지 않고 실행해” Bun을 [Rust로 다시 썼습니다](https://bun.com/blog/bun-in-rust). 에이전트들은 먼저 모든 파일을 기계적으로 옮겼고, 그다음 한 워크플로가 컴파일러 오류를 작업 대기열 삼아 크레이트 하나씩 처리해 나갔습니다. 처음에는 약 1만 6천 개였습니다. 그것이 왜 통했는지에 대한 그의 요약은 이렇습니다. “컴파일러 오류는 스타일 가이드보다 더 나은 피드백 루프입니다.” 컴파일러 오류는 한 줄을 가리키고, 반박할 수 없으며, 문제가 고쳐지면 사라집니다. 그래서 에이전트는 감독 없이 수천 개의 오류를 처리해 나갈 수 있고, 스타일 가이드에 대해서는 누구도 그렇게 말할 수 없습니다.

Nicholas Carlini는 에이전트 열여섯에게 [C 컴파일러를 만들게 했을 때](https://www.anthropic.com/engineering/building-c-compiler) 반대편에서 같은 곳에 이르렀습니다. “저는 이 테스트 하네스를 저 자신이 아니라 Claude를 위해 쓰고 있다는 것을 계속 스스로 상기해야 했습니다.” 그의 규칙은 구체적입니다. “테스트 하네스는 쓸모없는 바이트를 수천 개씩 출력해서는 안 됩니다.” 몇 줄만 출력하고 나머지는 파일에 기록해야 하며, 오류는 검색으로 쉽게 찾을 수 있어야 합니다. Cloudflare는 이것을 웹 자체에 적용했습니다. “에이전트에게 지시가 아니라 단서를 주는” 오류 페이지 대신 [RFC 9457 문제 상세(problem details)](https://blog.cloudflare.com/rfc-9457-agent-error-pages/)를 에이전트에게 돌려주었고, 그 원칙을 한 줄로 정리했습니다. “핵심 가치는 형식의 선택이 아닙니다. 의미의 안정성입니다.”

의미가 안정적인 오류는 이런 모습이고, 모든 버전에서 같은 것을 뜻합니다.

```json
{
  "type": "https://errors.example.com/quota-exceeded",
  "title": "Quota exceeded",
  "status": 429,
  "detail": "Project claims-api has used 1000 of 1000 builds this month.",
  "retry_after": "2026-12-01T00:00:00Z",
  "fix": "Raise the quota with: deployctl quota set claims-api --builds 2000"
}
```

Anthropic이 도구 작성자에게 주는 조언도 같은 것을 직접 말합니다. “구체적이고 실행 가능한 개선점을 분명히 전달하도록 오류 응답을 프롬프트 엔지니어링하라”([Writing effective tools for agents](https://www.anthropic.com/engineering/writing-tools-for-agents)). 에이전트에게 오류 메시지는 API의 일부이고, API의 나머지가 받는 것을 똑같이 받아야 합니다. 버전, 문서, 테스트입니다.

## 도구가 일회용이 되면 전제가 남습니다 {#when-tooling-is-disposable-premises-remain}

도구는 예전에는 교체하기 비쌌고, 그래서 우리는 수십 년 동안 그 결함을 안고 살았습니다. 에이전트는 교체를 현실적인 선택지로 삼을 수 있을 만큼 싸게 만들었고, 저는 그 결과가 아직 제대로 실감되지 않았다고 생각합니다.

[The Register](https://www.theregister.com/devops/2026/07/14/zig-creator-calls-buns-claude-rust-rewrite-unreviewed-slop/5270743)의 보도에 따르면 Bun의 재작성에는 “API 가격 기준으로 약 165,000달러”가 들었습니다. 처음 쓰는 데 몇 년이 걸린 런타임입니다. 재작성된 Bun은 8월 20일 [Bun 1.4](https://bun.com/blog/bun-v1.4)로 출시되었습니다. 동기는 실용적이었습니다. 팀을 바쁘게 만든 버그는 메모리 버그, 즉 use-after-free와 double-free였고, 다른 언어라면 배제되는 종류의 버그였습니다. 논란도 있었습니다. 같은 기사에서 Zig의 창시자는 이것을 “리뷰되지 않은 쓰레기(unreviewed slop)”라고 불렀고, 11일 동안의 에이전트 작업이 몇 년 동안의 사람 작업만큼 견고한지는 정당한 질문이며 프로덕션에서 보낸 시간만이 답할 수 있습니다. 하지만 재작성은 일어났고, 한 회사가 치르기로 선택할 수 있는 비용으로 일어났습니다. 그것만으로도 계산이 바뀝니다.

Anthropic은 자사 도구에서 한 걸음 더 나아갔습니다. 10월에 Anthropic은 [소스 관리를 다시 설계한 일](https://www.anthropic.com/research/redesigning-source-control)을 소개했습니다. “이제 병목은 사람의 규모에 맞춰 만들어진 모든 개발자 인프라입니다. 소스 관리, 빌드, CI입니다.” 하루에 병합되는 변경은 2026년 5월 약 2,500건에서 9월 30,000건 이상으로 늘었고, 그래서 팀은 자체 버전 관리 시스템인 Scion을 만들어 다섯 달 만에 모노레포를 git에서 옮겼습니다. git은 리포지토리 전체 사본을 가지고 오프라인에서 일하는 클라이언트를 전제합니다. “클라이언트 거의 전부가 에이전트와 작업(job)이므로”, 팀은 Scion을 언제나 온라인인 클라이언트를 위해 설계했습니다. 전제 하나가 바뀌자, 20년 동안 업계를 떠받쳐 온 도구가 더는 맞지 않게 되었습니다.

저는 이것을 재작성 문턱이라고 부릅니다. 도구를 다시 쓰는 비용이 그 도구의 전제를 안고 사는 비용보다 작아지는 지점입니다. 에이전트는 그 문턱을 크게 낮췄고, 여기서 두 가지가 따라 나옵니다.

첫째, 구현은 덜 중요해지고 전제는 더 중요해집니다. 도구의 코드를 몇 주 만에 다시 생성할 수 있다면, 생태계를 고를 때 약속하게 되는 것은 그 생태계의 설계 전제입니다. 메모리 모델, 호환성 약속, 출력이 결정적인지, 모듈에 이름을 어떻게 붙이고 어떻게 찾는지, 오류가 무엇을 보장하는지입니다. 에이전트가 매일 상대하는 것이 그것이고, 재작성에서 살아남는 것도 그것입니다. Bun 재작성의 풀 리퀘스트는 “같은 아키텍처, 같은 데이터 구조”를 약속했습니다([#30412](https://github.com/oven-sh/bun/pull/30412)). 바뀐 것은 누가 메모리를 해제하는가에 대한 전제였습니다.

둘째, 에이전트 경험이 재작성의 이유가 됩니다. 산문으로 된 오류와 불안정한 출력을 가진 도구는 예전에는 그저 성가신 것이었습니다. 이제 그것은 모든 에이전트가 실행할 때마다 내는 세금이고, 어느 시점이 되면 더 나은 도구에 돈을 쓰는 편이 세금을 내는 것보다 쌉니다.

## 컨텍스트 공급망 {#the-context-supply-chain}

에이전트 경험의 나머지 절반은 에이전트가 아는 것을 어디서 얻는가입니다. 에이전트가 기대는 컨텍스트의 종류에 대해서는 [Context Is the Product](/articles/context-is-the-product/)에서, 검색(retrieval)이 왜 도구에 속하는지에 대해서는 [Retrieval Is a Tool, Not a Layer](/articles/retrieval-is-a-tool-not-a-layer/)에서 썼습니다. 여기서는 같은 것을 공급망으로 보려고 합니다. 실제로 그렇게 동작하기 때문입니다.

{% diagram(title="The context supply chain") %}
  sources                  channels                     the agent
  ─────────────────        ───────────────────────      ──────────────
  repository         ──▶   AGENTS.md, docs/, code  ──┐
  systems of record  ──▶   APIs, MCP servers       ──┤
  company knowledge  ──▶   graphs, ontologies      ──┼──▶  context window
  documents          ──▶   embeddings, search      ──┤     (finite, costly)
  people             ──▶   reviews, approvals      ──┘
                                 │
     every link carries: provenance · freshness · a stable contract · a cost in tokens
{% end %}

그 사슬의 모든 고리는 어떤 공급망이든 지니는 네 가지 속성을 가집니다. **출처:** 에이전트가 사실이 어디서 왔는지 알 수 있고, 나중에 사람이 그것을 확인할 수 있습니까? **신선도:** 사실에 날짜가 붙어 있습니까, 아니면 에이전트가 짐작해야 합니까? **안정적인 계약:** 채널이 버전이 바뀌어도 형태를 유지합니까, 아니면 바뀔 때마다 하류의 에이전트가 깨집니까? **비용:** 그 사실을 컨텍스트 창에 넣는 데 토큰이 얼마나 듭니까? Anthropic의 컨텍스트 엔지니어링 지침은 컨텍스트 창을 바로 그렇게 다룹니다. “따라서 컨텍스트는 한계 수익이 체감하는 유한한 자원으로 다뤄야 합니다”([Effective context engineering](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)). 그리고 MCP 서버를 긴 도구 목록이 아니라 에이전트가 호출할 수 있는 코드로 제시하자, 그들의 워크플로 하나가 “150,000토큰에서 2,000토큰으로” 줄었습니다([Code execution with MCP](https://www.anthropic.com/engineering/code-execution-with-mcp)).

채널은 표준화되고 있고, 그 위에서 무언가를 만드는 사람에게는 좋은 소식입니다. 2025년 12월 Linux Foundation은 기여받은 세 프로젝트를 중심으로 [Agentic AI Foundation](https://www.linuxfoundation.org/press/linux-foundation-announces-the-formation-of-the-agentic-ai-foundation)을 결성했습니다. Anthropic의 Model Context Protocol, Block의 goose, OpenAI의 AGENTS.md입니다. 리포지토리를 위한 관례, 시스템을 위한 프로토콜, 그리고 참조 에이전트가 중립적인 거버넌스 아래 모인 것은 이 공급망을 위한 공유 인프라의 시작입니다.

어떤 표준도 공급하지 않는 것은 내용이고, 대부분의 회사가 가장 나쁜 에이전트 경험을 겪는 곳이 바로 거기입니다. 회사 안에서 에이전트가 가장 자주 묻는 질문은 코드가 아니라 소유권에 관한 것입니다. “이것은 누구의 것이고, 무엇이 이것에 의존하며, 아직 쓰이고 있는가?” 그리고 대부분의 조직에서 그 답은 서로 어긋나는 도구 여섯 개에 흩어져 있습니다. [IT Intelligence](/articles/it-intelligence/)가 다루는 문제가 그것이고, [참조 구현](/articles/building-it-intelligence/)이 MCP 서버를 통해, 언제나 출처를 지닌 작고 엔티티 중심적인 답으로 응답하는 이유도 그것입니다. 모든 사실에 출처가 붙어 있고 에이전트가 질의할 수 있는 지식 계층은 조직 자체를 위한 에이전트 경험입니다.

## 지금까지의 표준 {#the-standards-so-far}

2년 전에는 이름조차 없던 분야치고, 에이전트 경험에는 이미 공유된 기반이 꽤 있습니다. 2026년 11월에 제가 보는 지도는 이렇습니다.

| 관심사 | 존재하는 것 | 시작 | 뒤에 있는 곳 |
|---|---|---|---|
| 리포지토리 안의 에이전트용 지시 | [AGENTS.md](https://agents.md/) | 2025 | OpenAI, 현재는 Agentic AI Foundation |
| 모델에게 설명하는 웹사이트 | [llms.txt](https://llmstxt.org/) | 2024년 9월 | Answer.AI, 제안 단계 |
| 에이전트를 도구와 데이터에 연결하기 | [Model Context Protocol](https://modelcontextprotocol.io/), 현재 개정판 2026-07-28 | 2024년 11월 | Anthropic, 현재는 Agentic AI Foundation |
| 묶어서 전달하는 노하우와 워크플로 | [Agent Skills](https://www.anthropic.com/news/donating-agent-skills-to-the-agentic-ai-foundation) | 2025년 10월 | Anthropic, 2026년 10월 Agentic AI Foundation에 기증 |
| HTTP API의 오류 | [RFC 9457](https://www.rfc-editor.org/rfc/rfc9457) 문제 상세 | 2023 | IETF |
| 분석 도구와 컴파일러의 발견 사항 | [SARIF 2.1.0](https://docs.oasis-open.org/sarif/sarif/v2.1.0/sarif-v2.1.0.html), 그리고 GCC의 SARIF 출력과 [rustc의 JSON](https://doc.rust-lang.org/rustc/json.html) 같은 컴파일러 형식 | 2020 | OASIS |
| 요청하면 Markdown으로 내주는 페이지 | `Accept: text/markdown` | 2026 | Cloudflare, 관행으로 |
| 서비스와 소유자의 카탈로그 | Backstage의 [catalog-info.yaml](https://backstage.io/docs/features/software-catalog/descriptor-format) | 2020 | 사실상의 관례 |
| 사실이 어디서 왔는지 | [PROV-O](https://www.w3.org/TR/prov-o/) | 2013 | W3C |

눈에 띄는 것이 두 가지 있습니다. 가장 새로운 항목들이 에이전트가 실제로 쓰는 것들이고, 그것들은 모델 공급사에서 나와 빠르게 중립적인 거버넌스로 옮겨 갔습니다. Anthropic의 집계로는 2025년 12월 표준이 공개된 이후 Agent Skills 하나만 해도 70개가 넘는 에이전트 플랫폼이 통합했습니다. 표준 기구에서 나온 오래된 항목들은 문제의 일부를 잘 풀지만, 다른 독자를 위해 쓰였습니다. SARIF는 코드 스캐너를, PROV-O는 시맨틱 웹을, Backstage는 개발자 포털을 위한 것입니다. 그것들을 에이전트를 위해 하나로 엮은 사람은 아직 없습니다.

## 아직 빠져 있는 것 {#what-is-still-missing}

앞으로 몇 년 동안 일의 대부분, 그리고 흥미로운 아이디어의 대부분은 이 빈틈에서 나오리라고 봅니다. 제가 계속 부딪히는 빈틈들을, 오늘 존재하는 가장 가까운 것과 함께 적으면 이렇습니다.

| 빈틈 | 오늘 가장 가까운 것 | 부족한 것 |
|---|---|---|
| 명령줄 도구를 위한 계약 | HTTP를 위한 RFC 9457, 분석기를 위한 SARIF | 에이전트가 매일 실행하는 수천 개의 CLI에 공통된 것이라면 무엇이든 |
| 믿을 수 있는 효과 | MCP 도구 주석 | 보장: 주석은 힌트일 뿐임 |
| 컨텍스트의 출처와 신선도 | PROV-O, 몇몇 제품의 관례 | 에이전트가 실제로 읽는 채널 안의 필드 |
| 에이전트 경험의 척도 | SWE-bench 같은 모델 벤치마크 | 모델이 아니라 시스템의 벤치마크 |
| 조직의 컨텍스트 | Backstage 카탈로그 | 선언된 것이 아니라 실제로 참인 것 |
| 에이전트가 읽는 텍스트의 변경 관리 | API 버전 관리 | 도구 설명, 지시, 오류 의미의 버전과 변경 이력 |
| 지시와 데이터 사이의 경계 | 널리 쓰이는 것은 없음 | 컨텍스트 안에서 무엇을 따라도 되는지 표시하는 방법 |
| 사람에게 넘기는 오래가는 인계 | MCP 엘리시테이션(elicitation) | 며칠씩 기다리고, 이름과 기록이 남는 승인 |

**명령줄 도구를 위한 계약.** 에이전트는 삶의 상당 부분을 셸에서 보내는데, 셸에는 공유된 계약이 전혀 없습니다. 도구마다 기계 모드가 있다면 그것을 저마다의 방식으로 만들고, 종료 코드와 오류 문구도 저마다 만듭니다. HTTP에서는 RFC 9457이, 정적 분석에서는 SARIF가 이 문제를 풀었습니다. 명령줄에도 같은 것이 필요합니다. 기계용 출력을 위한 표준 플래그, 모든 오류에 안정적인 타입이 붙은 문제 상세, 필드로 표현된 다음 행동, 의미가 문서화된 종료 코드입니다. 화려하지 않은 일이고, 저는 이것이 다음 모델 출시보다 에이전트의 시간을 더 많이 아껴 주리라고 짐작합니다.

**믿을 수 있는 효과.** 에이전트는 무언가를 실행하기 전에 그 행동이 읽기인지 쓰기인지, 안전하게 반복할 수 있는지, 되돌릴 수 있는지, 시스템 바깥에 닿는지 알아야 합니다. MCP에는 바로 이것을 위한 필드인 `readOnlyHint`, `destructiveHint`, `idempotentHint`, `openWorldHint`가 있고, 명세는 이 필드들에 대해 솔직합니다. “ToolAnnotations의 모든 속성은 힌트입니다. 도구의 동작을 충실하게 기술한다고 보장되지 않습니다”([스키마](https://modelcontextprotocol.io/specification/2026-07-28/schema)). 그리고 클라이언트는 “신뢰할 수 있는 서버에서 온 것이 아니라면 도구 주석을 신뢰할 수 없는 것으로 간주해야 합니다(MUST)”([도구](https://modelcontextprotocol.io/specification/2026-07-28/server/tools)). 올바른 신중함이고, 그래서 빈틈은 열린 채로 남습니다. 빠진 것은 무언가가 실제로 검사하는 효과 선언입니다. 읽기 전용을 강제하는 샌드박스, 또는 인프라 도구가 적용하기 전에 계획을 보여 주듯이 무엇이 바뀔지에 대한 계획을 돌려주는 표준 드라이런입니다.

**컨텍스트의 출처와 신선도.** `AGENTS.md`에는 소유자도 날짜도 없습니다. `llms.txt`는 마지막으로 언제 사실이었는지 말하지 않습니다. 도구 결과에는 그 사실들이 어디서 왔는지 담는 공통 필드가 없습니다. 시맨틱 웹은 오래전에 PROV-O로 출처 문제를 풀었지만, 에이전트가 읽는 채널 가운데 그것을 담은 것은 하나도 없습니다. 그렇게 되기 전까지 에이전트는 오늘 아침에 확인한 사실과 조직 개편 세 번 전에 쓰인 사실을 구별할 수 없고, 그 작업을 리뷰하는 사람도 마찬가지입니다. 저는 에이전트가 받는 모든 사실이 세 가지를 지니면 좋겠습니다. 출처, 기준 날짜, 소유자입니다. 제가 [참조 구현](/articles/building-it-intelligence/)에 넣은 것이 그것이고, 이것을 위해 맞춤형 플랫폼이 필요해서는 안 됩니다.

**에이전트 경험의 척도.** 우리가 가진 모든 벤치마크는 환경을 고정하고 모델을 바꿉니다. 에이전트 경험에는 그 반대가 필요합니다. 에이전트를 고정하고 시스템을 바꾸는 것입니다. 한 리포지토리, API, 내부 플랫폼이 다른 것보다 에이전트에게 더 쉽다고 말할 공유된 방법이 없으므로, 개선을 비교할 수도, 개선했다고 주장할 수도 없습니다. 아래의 콜드 스타트 테스트는 제 임시방편입니다. 제대로 된 척도라면, 고정된 에이전트가 한 시스템을 상대로 실행하는 공개 과제 모음이 있고, 추측을 어디서나 같은 방식으로 셀 것입니다.

**조직의 컨텍스트.** Backstage는 서비스를 코드 옆의 파일로 기술하는 것을 평범한 일로 만들었고, 그것은 진짜 진전입니다. 하지만 카탈로그는 팀이 선언한 것을 기록하고, 에이전트에게 필요한 것은 실제로 참인 것입니다. 실제로 누가 그 네임스페이스를 소유하는지, 어떤 애플리케이션이 아직 옛 API를 호출하는지, 어떤 레코드가 낡았는지입니다. 신뢰도와 증거를 담은 소유권과 의존성 그래프를 위한 표준은 없고, 그것을 원하는 회사는 모두 혼자 만듭니다. [IT Intelligence](/articles/it-intelligence/)가 다루는 빈틈이 그것입니다.

**에이전트가 읽는 텍스트의 변경 관리.** 우리는 API에 버전을 붙입니다. API가 바뀌면 클라이언트가 깨지기 때문입니다. 에이전트도 클라이언트이지만, 에이전트가 의존하는 텍스트는 조용히 바뀝니다. 도구 설명의 문구가 바뀌고, 지시 파일이 재구성되고, 오류 메시지에 문장이 하나 붙습니다. 그 하나하나가 에이전트가 하는 일을 바꾸는데, 실패한 테스트가 없으므로 아무도 그 깨짐을 보지 못합니다. 더 나쁜 것은 도구 설명이 모델에게 주는 지시라는 점입니다. 그래서 도구 설명을 바꾸면, 코드 리뷰어라면 결코 살펴보지 않을 방식으로 동작이 바뀝니다. 에이전트가 읽는 텍스트에는 API 표면이 가진 것이 필요합니다. 버전, 변경 이력, 그리고 누군가 리뷰하는 diff입니다.

**지시와 데이터 사이의 경계.** 에이전트의 컨텍스트 안에서는 모든 것이 비슷해 보입니다. 사용자의 요청, 리포지토리의 관례, 에이전트가 가져온 웹 페이지, 낯선 사람이 쓴 이슈 코멘트가 모두 그렇습니다. 그중 무엇을 따라도 되고 무엇은 읽기만 해야 하는지 표시하는 공통된 방법이 없고, 그것이 프롬프트 인젝션의 뿌리입니다. [Your Agent Wants Root](/articles/your-agent-wants-root/)에서 썼듯이 더 나은 모델은 위험을 줄이고 샌드박스는 피해를 가둡니다. 하지만 빠진 조각은 권한이 어디서 오는지에 대한 관례, 모든 채널을 관통해 전달되는 관례입니다.

**사람에게 넘기는 오래가는 인계.** MCP의 엘리시테이션은 서버가 세션 도중에 사용자에게 정보를 요청할 수 있게 해 주고, 빠른 질문은 이것으로 해결됩니다. 더 어려운 경우는 기다려야 하는 승인입니다. 두 번째 사람이 필요한 변경이 있는데 그 사람은 목요일까지 휴가 중이고, 나중에는 누가 승인했는지 기록이 남아야 하는 경우입니다. 그런 인계를 위한 표준은 없으므로, 플랫폼마다 자기 것을 만듭니다. [Aqueduct](https://github.com/raskell-io/aqueduct)처럼 사람을 기다리는 대기 기능을 갖춘 내구성 있는 실행 엔진이 존재하는 이유가 그것이고, 저는 이 인계가 그 자체로 하나의 프로토콜이 되리라고 예상합니다.

이 빈틈 가운데 어느 것도 돌파구를 필요로 하지 않습니다. 몇몇 사람이 지루한 무언가에 합의하기만 하면 되고, 웹이 HTTP 상태 코드를 얻고 명령줄이 `--help`를 얻은 것도 그런 방식이었습니다. 이번에 다른 것은 속도입니다. 관례를 가장 먼저 적어 두고 그것을 받아들이기 쉽게 만드는 사람이 오랫동안 에이전트가 일하는 방식을 정의할 것입니다.

## 측정하기 {#measuring-it}

에이전트 경험은 측정할 수 있고, 측정하는 데 드는 비용도 적습니다. 저는 콜드 스타트 테스트라고 부르는 방법을 씁니다.

1. 시스템에서 실제 과제 하나를 고릅니다. 새 동료가 첫 주에 받을 만한 종류의 과제입니다.
2. 추가 지시도, 기억도, 도움도 없는 새 에이전트에게 그 과제를 줍니다.
3. 일하게 두고, 대화 기록(transcript)을 남깁니다.
4. 기록에서 네 가지를 셉니다.

| 측정 항목 | 알려 주는 것 |
|---|---|
| 추측: 시도한 명령, 연 파일, 밝힌 가정 가운데 틀린 것으로 드러난 것 | 시스템이 추측할 것을 얼마나 남기는지 |
| 첫 번째 성공한 빌드나 통과한 테스트까지의 턴 수 | 피드백 루프가 얼마나 빠른지 |
| 첫 번째 올바른 변경 전까지 쓴 토큰 | 컨텍스트에 닿는 데 얼마나 비싼지 |
| 사람이 개입해야 했던 횟수 | 지식이 아직 머릿속에만 사는 곳이 어디인지 |

도움이 되라고 만든 변경을 할 때마다 다시 실행하십시오. 에이전트가 그렇듯 숫자에는 잡음이 많겠지만, 기록은 그렇지 않습니다. 틀린 추측 하나하나가 구체적인 빈틈을 가리키고, 대부분의 빈틈은 오후 한나절이면 메울 수 있습니다. 열린 채로 남은 빈틈은 제가 에이전트 경험 부채라고 부르는 것이고, 다른 모든 부채처럼 복리로 불어납니다. 모든 에이전트가 실행할 때마다 그것을 다시 치르기 때문입니다.

## 무엇을 할 것인가 {#what-to-do-about-it}

소프트웨어를 만드는 사람과 운영하는 사람에게 할 일의 목록은 짧고, 그중 특이한 것은 하나도 없습니다.

- **관례를 에이전트가 찾을 곳에 적어 두십시오.** 루트에 둔 `AGENTS.md`가 늘 사실로 유지되는 `docs/` 디렉터리를 가리키게 하는 편이, 사람들 머릿속에 든 어떤 지식보다 낫습니다.
- **모든 도구에 기계용 형식을 주십시오.** 안정적인 플래그, 의미 있는 종료 코드, `--json` 모드, 그리고 기본으로는 짧고 자세한 내용은 로그 파일에 남기는 출력입니다.
- **오류를 API로 다루십시오.** 오류에 안정적인 타입을 주고, 다음에 무엇을 할지 말하게 하고, 버전이 바뀌어도 의미를 유지하십시오.
- **리뷰 앞에 검사를 두십시오.** 타입, 스키마, 린터, 테스트는 사람이 들여다보기 전에 추측을 답으로 바꿉니다.
- **지식을 출처가 붙은 데이터로 공개하십시오.** 소유권, 의존성, 상태는 각 사실의 출처가 붙은 채로, 에이전트가 질의할 수 있는 곳에 있어야 합니다.
- **생태계를 전제로 고르십시오.** 호환성 약속, 결정성, 스스로를 설명하는 컴파일러가 이제는 라이브러리 카탈로그의 크기보다 더 가치 있습니다. 카탈로그는 다시 생성할 수 있지만 전제는 그럴 수 없기 때문입니다.
- **콜드 스타트 테스트를 실행하십시오.** 한 번으로 끝내지 말고, 부하 테스트를 하듯이 분기마다 하십시오.

제가 가장 많이 듣는 반론은 이 모든 것이 그저 좋은 개발자 경험이라는 것입니다. 상당 부분은 그렇고, 저는 그것을 고무적으로 받아들입니다. 에이전트 경험이 좋은 시스템은 거의 언제나 사람에게도 더 좋습니다. 차이는 관용에 있습니다. 사람은 문서가 틀리면 동료에게 묻고 팀의 습관을 한 번 익히지만, 에이전트는 추측하고, 습관이 적혀 있지 않으면 세션마다 아무것도 없는 상태에서 시작합니다. 오류를 잘못 읽은 사람은 오후 한나절을 잃습니다. 에이전트는 실행할 때마다, 병렬로, 어떤 리뷰도 따라갈 수 없는 속도로 그것을 잘못 읽습니다.

## 세 번째 독자 {#the-third-reader}

30년 동안 우리는 시스템을 쓰는 사람을 위해 설계했고, 15년 동안은 시스템을 만드는 사람을 위해 설계했습니다. 이제 에이전트가 그 두 일의 큰 몫을 맡고 있고, 에이전트는 우리가 불분명하게 남겨 둔 것을 스스로 피해 가는 능력이 가장 부족한 독자입니다. 그래서 에이전트는 아직 무엇을 고쳐야 하는지 알려 주는, 우리가 가진 가장 정직한 안내자입니다.

## 참고 자료 {#references}

- Mathias Biilmann, [Introducing AX: Why Agent Experience Matters](https://biilmann.blog/articles/introducing-ax), 2025년 1월 28일.
- Zeno Rocha, [What is AX (Agent Experience) and how to improve it](https://resend.com/blog/agent-experience), Resend, 2025년 2월.
- John Yang, Carlos E. Jimenez, Alexander Wettig, Kilian Lieret, Shunyu Yao, Karthik Narasimhan, Ofir Press, [SWE-agent: Agent-Computer Interfaces Enable Automated Software Engineering](https://arxiv.org/abs/2405.15793), 2024.
- Erik S., Barry Zhang, [Building effective agents](https://www.anthropic.com/engineering/building-effective-agents), Anthropic, 2024년 12월 19일.
- Ken Aizawa, [Writing effective tools for agents, with agents](https://www.anthropic.com/engineering/writing-tools-for-agents), Anthropic, 2025년 9월 11일.
- Anthropic, [Effective context engineering for AI agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents), 2025년 9월 29일.
- Adam Jones, Conor Kelly, [Code execution with MCP: Building more efficient agents](https://www.anthropic.com/engineering/code-execution-with-mcp), Anthropic, 2025년 11월 4일.
- Justin Young, [Effective harnesses for long-running agents](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents), Anthropic, 2025년 11월 26일.
- Jarred Sumner, [Bun is joining Anthropic](https://bun.com/blog/bun-joins-anthropic), 2025년 12월 2일, 그리고 [Rewriting Bun in Rust](https://bun.com/blog/bun-in-rust), 2026년 7월 8일. 풀 리퀘스트 [Rewrite Bun in Rust](https://github.com/oven-sh/bun/pull/30412), 그리고 [Bun 1.4](https://bun.com/blog/bun-v1.4).
- [Zig creator calls Bun's Claude Rust rewrite "unreviewed slop"](https://www.theregister.com/devops/2026/07/14/zig-creator-calls-buns-claude-rust-rewrite-unreviewed-slop/5270743), The Register, 2026년 7월 14일.
- Linux Foundation, [Linux Foundation Announces the Formation of the Agentic AI Foundation](https://www.linuxfoundation.org/press/linux-foundation-announces-the-formation-of-the-agentic-ai-foundation), 2025년 12월 9일.
- Nicholas Carlini, [Building a C compiler with parallel Claudes](https://www.anthropic.com/engineering/building-c-compiler), Anthropic, 2026년 2월 5일.
- Celso Martinho, Will Allen, [Introducing Markdown for Agents](https://blog.cloudflare.com/markdown-for-agents/), Cloudflare, 2026년 2월 12일.
- Cloudflare, [Slashing agent token costs by 98% with RFC 9457-compliant error responses](https://blog.cloudflare.com/rfc-9457-agent-error-pages/), 2026년 3월 11일.
- Anthropic, [Redesigning source control at Anthropic](https://www.anthropic.com/research/redesigning-source-control), 2026년 10월 13일.
- [RFC 9457: Problem Details for HTTP APIs](https://www.rfc-editor.org/rfc/rfc9457), 2023.
- Jeremy Howard, [/llms.txt: a proposal to provide information to help LLMs use websites](https://www.answer.ai/posts/2024-09-03-llmstxt.html), Answer.AI, 2024년 9월 3일, 그리고 [AGENTS.md](https://agents.md/).
