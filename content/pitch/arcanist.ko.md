+++
title = "Arcanist"
description = "AI가 작성한 코드를 저렴하게 검사할 수 있게 하고, 각 검사를 기록해 사람이든 모델이든 누구도 같은 검사를 반복하지 않게 하는 Haskell 도구."
path = "ko/invest/arcanist"
template = "venture.html"

[extra]
project = "arcanist"
eyebrow = "투자 소개서"
parent = { name = "투자", url = "@/invest.md" }
contact_anchor = "talk-about-investing"
+++

이제 모델은 사람이 검토할 수 있는 것보다 빠르게 코드를 작성하며, 여러 연구에서 그 코드의 상당 부분이 틀렸거나 안전하지 않다는 결과가 거듭 나오고 있습니다. Arcanist는 두 가지를 제공합니다. hx는 재현 가능한 빌드와 코딩 에이전트용 인터페이스를 갖춘 빠른 단일 Haskell 툴체인이고, bhc는 GHC를 기준으로 공개적으로 측정되는 두 번째 Haskell 컴파일러입니다. 서명된 레지스트리는 이미 bhc가 어떤 패키지 버전을 빌드했는지 기록하고 있습니다. 다음 단계는 한 번 검사된 함수를 필요로 하는 모든 사람과 모델이 그 검사를 인용할 수 있는 공유 자원(commons)입니다.

## 문제 {#the-problem}

생성은 저렴해졌지만 검사는 그렇지 않습니다. 모든 에이전트 세션이 같은 함수를 다시 검사하고 그 결과를 버리며, 모든 팀이 검토 비용을 다시 지불합니다.

{% tiles(cols=3) %}
- **Haskell을 사용하는 팀** ghcup, cabal 또는 Stack, 포매터, 린터, 커버리지 도구를 동시에 다뤄야 합니다. 2025년 State of Haskell 설문에서 27퍼센트가 지난 1년 사이 컴파일러 업그레이드로 코드가 깨졌다고 답했습니다.
- **AI가 작성한 코드를 배포하는 모든 사람** 결과물이 누구도 검토할 수 없을 만큼 빠르게 도착하며, "거의 맞음"이 AI 도구에 대한 가장 흔한 불만입니다.
- **코딩 에이전트 자신** 터미널 앞의 사람을 위해 쓰인 출력이 아니라, 구조화된 오류와 종료 코드를 제공하는 도구가 필요합니다.
{% end %}

## 제품 {#the-product}

{% tiles(cols=3) %}
- **hx** Haskell 작업 흐름 전체를 하나의 Rust 바이너리에 담았습니다. 툴체인 설치, 빌드, 테스트, 포맷, 린트, 커버리지, 배포까지 포함합니다. 현재 0.11 릴리스로, 2026년 1월 이후 42번째 릴리스입니다.
- **재현 가능한 빌드** lockfile이 모든 의존성을 SHA-256과 Hackage 리비전으로 고정하며, 차이가 생기면 CI가 실패합니다.
- **에이전트를 위한 설계** hx는 MCP를 통해 코딩 에이전트에 build, test, lock, doctor 도구를 제공하며, 구조화된 오류를 반환합니다.
- **bhc** Basel Haskell Compiler로, Rust로 처음부터 새로 작성한 컴파일러이자 런타임입니다. Pandoc의 221개 모듈 전부가 타입 검사와 컴파일을 통과하며, 219개 테스트 프로그램의 결과가 GHC와 일치합니다.
- **레지스트리** registry.arcanist.sh는 서명되어 있고, 일반 cabal로 읽을 수 있으며, 모든 버전에 대해 서명된 bhc 빌드 결과를 저장합니다. 프리뷰 단계이며 배포는 초대제입니다.
- **어디서나** Homebrew, cargo, Nix, aqua, winget, 컨테이너 이미지, 그리고 macOS, Linux, Windows용 바이너리를 제공합니다.
{% end %}

작은 프로젝트에서 cabal과 비교한 자체 보고 벤치마크에서 hx는 시작이 6배, 콜드 빌드가 5.6배, 재빌드가 4.8배 빠릅니다. bhc는 수치만큼이나 부족한 점도 공개합니다. 컴파일된 프로그램은 아직 가비지 컬렉션을 하지 않으므로, 장시간 실행되는 서비스는 그 마일스톤을 기다려야 합니다.

## 시장 {#the-market}

AI가 작성한 코드를 검증하는 시장의 규모를 산정한 곳은 아직 없으며, 이 페이지도 그런 수치를 지어내지 않습니다. 그 주변 시장은 크고 빠르게 움직이고 있습니다.

{% tiles(cols=3, variant="figures") %}
- **81억 달러** 2025년 AI 코드 어시스턴트 시장 규모로, 2032년에는 1,270억 달러로 전망됩니다. [MarketsandMarkets](https://www.marketsandmarkets.com/Market-Reports/ai-code-assistant-market-166208330.html)
- **10억 달러** 출시 6개월 후 Claude Code의 연환산 매출입니다. 개발자는 코드를 작성하는 AI에 비용을 지불합니다. [Anthropic](https://anthropic.com/news/anthropic-acquires-bun-as-claude-code-reaches-usd1b-milestone)
- **64억 달러** 2025년 소프트웨어 개발 도구 시장 규모로, 2031년에는 157억 달러로 성장할 전망입니다. [Mordor Intelligence](https://www.mordorintelligence.com/industry-reports/software-development-tools-market)
{% end %}

## 왜 지금인가 {#why-now}

{% tiles(cols=2, variant="figures") %}
- **45 %** AI가 생성한 코드가 보안 결함을 만든 테스트 케이스의 비율이며, 모델이 커져도 개선되지 않았습니다. [Veracode](https://www.veracode.com/press-release/ai-generated-code-poses-major-security-risks-in-nearly-half-of-all-development-tasks-veracode-research-reveals/)
- **1.7배** 사람만 작성한 pull request에 비해 AI가 공동 작성한 pull request에서 발견된 주요 문제의 배수입니다. [CodeRabbit](https://coderabbit.ai/blog/state-of-ai-vs-human-code-generation-report)
- **46 %** AI 출력의 정확성을 신뢰하지 않는 개발자의 비율로, 1년 전 31퍼센트에서 늘었습니다. [Stack Overflow 설문, TechRepublic 보도](https://www.techrepublic.com/article/news-developer-trust-in-ai-declines/)
- **14억 5천만 달러** 형식 검증 기업 Harmonic의 2025년 기업 가치입니다. 검사 분야에 자본이 모이고 있습니다. [Crowdfund Insider](https://www.crowdfundinsider.com/2025/11/256050-robinhood-ceo-backed-harmonic-becomes-unicorn-on-series-c/)
{% end %}

AI 연구소들도 개발자 도구를 인수하고 있습니다. OpenAI는 uv와 Ruff를 만든 회사 Astral의 인수를 발표했고, Anthropic은 Bun을 인수했습니다. 빠르고 일관된 툴체인은 에이전트 플랫폼에 전략적인 자산이 되었습니다.

## 차별점 {#what-sets-it-apart}

{% tiles(cols=2) %}
1. **작업 흐름 전체를 위한 하나의 바이너리** 별도의 도구 여섯 개가 hx 명령이 되며, 여덟 개 채널을 통해 설치할 수 있습니다.
2. **기본적으로 재현 가능** 해시로 고정된 lockfile, 오프라인 동기화, 그리고 차이가 생기면 실패하는 CI 검사를 제공합니다.
3. **루프 안의 에이전트를 위한 설계** 구조화된 오류를 반환하는 MCP 서버와 함께, 코드에 llms.txt와 AGENTS.md를 포함해 배포합니다.
4. **공개적으로 측정되는 두 번째 컴파일러** GHC를 기준 정답으로 삼아, 부족한 점까지 포함한 날짜가 명시된 수치를 공개합니다.
5. **축적되는 검증** 레지스트리는 정기 검증기가 버전마다 생성한 서명된 빌드 결과를 보관하므로, 한 번 수행한 검사가 기록으로 남습니다.
{% end %}

## 경쟁 {#competition}

| 대안 | 하는 일 | Arcanist의 차이 |
|---|---|---|
| cabal-install | 표준 Haskell 빌드 도구 | hx는 cabal을 구동하면서 툴체인 설치, 해시 lockfile, 포맷, 린트, 커버리지, MCP를 하나의 바이너리에 더합니다 |
| Stack | 선별된 스냅샷과 재현 가능한 빌드 | hx는 `.cabal`과 Hackage를 직접 읽고, Stack 프로젝트를 가져올 수 있습니다 |
| GHCup | GHC, Cabal, HLS 설치 | hx는 같은 메타데이터를 읽어 별도 도구 없이 프로젝트별로 설치합니다 |
| Nix, haskell.nix | 밀폐된(hermetic) 빌드 | 도입 부담이 더 큽니다. hx는 flake를 제공하면서 더 단순한 기본값을 유지합니다 |
| GHC | 참조 컴파일러 | bhc는 WebAssembly 백엔드를 갖춘 독립적인 두 번째 컴파일러이며, GHC는 계속 기준 정답으로 남습니다 |
| Hackage | 중앙 패키지 인덱스 | 서명되어 있고 cabal과 호환되며, 버전마다 검증 결과를 기록합니다 |
| Lean, Dafny | 증명 보조 도구 | 상호 보완적입니다. Arcanist는 실제 서비스에 쓰이는 언어에서 검사를 재사용 가능한 기록으로 만듭니다 |

## 비즈니스 모델 {#business-model}

hx, bhc, 레지스트리는 무료이며 앞으로도 무료로 유지됩니다. 현재는 [GitHub Sponsors](https://github.com/sponsors/arcanist-sh)와 Ko-fi를 통해 자금을 지원받고 있으며, 기업은 특정 기능이나 보안 검토에 자금을 댈 수 있습니다. 유료 계층은 그 위에 놓입니다. Astral이 먼저 무료 도구로 사용자 기반을 쌓은 방식과 같습니다.

{% tiles(cols=2) %}
- **프라이빗 레지스트리** Haskell이나 AI가 작성한 코드를 운영하는 기업을 위한 검증 기록, 정책 통제, 감사 로그입니다.
- **서비스형 검증** 서명된 결과를 제공하는 유료 검증기 용량입니다.
- **지원** CI에 hx를 도입하는 팀을 위한 지원 계약입니다.
- **전략적 적합성** Astral과 Bun의 인수 사례가 보여주듯, 에이전트 플랫폼에는 검사할 수 있는 출력이 필요합니다.
{% end %}

## 현재 위치 {#where-it-stands}

{% tiles(cols=3, variant="figures") %}
- **68** 약 9개월 동안의 hx와 bhc 릴리스 수로, 각각 42회와 26회입니다.
- **3,000+** GitHub와 crates.io에서 hx와 bhc 릴리스를 내려받은 횟수입니다.
- **221 / 221** bhc가 타입 검사와 컴파일을 통과시키는 Pandoc 모듈 수입니다.
{% end %}

레지스트리는 첫 번째 검증된 패키지와 함께 프리뷰로 운영 중이며, 정기 검증기가 결과에 서명합니다. hx는 ZuriHac 2026에서 발표되었습니다. 아직 유료 고객은 없습니다. 이미 몇 주마다 릴리스되는 도구에 초기 단계에서 참여할 수 있는 기회입니다.

## 위험 요소 {#risks}

{% tiles(cols=2) %}
- **작은 언어** Haskell은 헌신적이지만 작은 커뮤니티를 가지고 있습니다. hx는 지금 기존 Haskell 팀을 지원하며, 검증이라는 핵심 가설은 훨씬 더 큰 AI 작성 코드 시장을 겨냥합니다.
- **컴파일러 성숙도** bhc는 아직 장시간 실행되는 서비스를 돌리지 못합니다. hx는 지금 GHC와 함께 동작하므로, 사업이 bhc에 의존하지 않습니다.
- **오픈소스 수익** 기부금으로 컴파일러 개발 비용이 충당되는 경우는 드뭅니다. 호스팅 레지스트리와 유료 검증이 자연스러운 유료 계층입니다.
- **한 명의 메인테이너** Arcanist는 AI 에이전트를 적극적으로 활용하는 한 사람이 만들고 있습니다. 투자를 받으면 엔지니어를 충원하겠습니다.
{% end %}

## 투자금의 용도 {#what-funding-would-do}

{% tiles(cols=2) %}
1. **가비지 컬렉션** 컴파일된 코드 경로에서 동작하는 컬렉터를 구현해 bhc가 서비스를 실행할 수 있게 합니다.
2. **Pandoc 전 과정 실행** pandoc 명령이 bhc 아래에서 완전히 실행되게 합니다.
3. **개방된 레지스트리** 프리뷰에서 공개 배포로 전환하고, 검증기 용량을 CI 작업 하나 이상으로 확장합니다.
4. **공유 자원의 첫 마일스톤** 재현 가능한 산출물을 위한 콘텐츠 주소 기반 정의와 증명(attestation)입니다.
5. **실제 GPU 검증** CUDA와 ROCm 백엔드를 실제 하드웨어에서 테스트합니다.
6. **팀과 디자인 파트너** 엔지니어 두 명을 추가로 채용하고, 기업들과 프라이빗 레지스트리 파일럿을 진행합니다.
{% end %}

## 투자 상담 {#talk-about-investing}

{% panel(eyebrow="투자와 후원을 환영합니다", title="Arcanist를 초기에 지원해 주십시오.", links=["GitHub에서 후원하기|https://github.com/sponsors/arcanist-sh"], contact=true) %}
투자를 원하시면 어떤 분이신지, 그리고 무엇을 가장 먼저 보고 싶으신지 짧은 메시지로 알려 주십시오. 오픈소스 작업을 지원하시려면 직접 후원해 주시면 됩니다. 자세한 내용은 [투자](/ko/invest/) 페이지에 있습니다.
{% end %}
