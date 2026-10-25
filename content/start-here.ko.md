+++
title = "여기서 시작"
description = "처음 오셨나요? 짧은 글 세 편으로 시작한 다음, 네 가지 읽기 트랙을 따라 더 깊이 들어가 보십시오. 각 트랙은 순서대로 읽으면 좋고, 각 글은 따로 읽어도 됩니다."
template = "tracks.html"

[[extra.tracks]]
title = "엣지 시스템과 응용 보안"
deck = "정책, 인증, WAF, 관측 가능성이 어떻게 엣지로 옮겨 가고 있는지, 그리고 그것이 백엔드를 만드는 방식에 어떤 의미인지 다룹니다."
items = [
  { path = "articles/edge-systems-are-the-new-backend.md", note = "인증, 정책, 추론, 비즈니스 로직이 엣지와 클라이언트로 옮겨 가고 있습니다. 전통적인 백엔드는 영속성 계층이 되어 가고 있습니다." },
  { path = "articles/what-zentinel-is-really-optimizing-for.md", note = "주요 프록시는 모두 자기 시대의 산물이었습니다. Zentinel은 이 시대의 산물입니다. 안전성, 운영 용이성, 그리고 운영자가 잠을 잘 수 있는 것." },
  { path = "articles/notes-from-rsac-2026.md", note = "RSA Conference에 세 번째로 갔고, 연사로는 처음이었습니다. 현장에서 본 것과 아직 소화하고 있는 것들입니다." },
]

[[extra.tracks]]
title = "에이전트 플랫폼 만들기"
deck = "The Agent Platform Handbook은 글 한 편과 동작하는 코드 한 조각씩, 첫 원리부터 에이전트 하네스를 만들어 갑니다."
items = [
  { path = "articles/what-an-agent-actually-is.md", note = "업계에서 가장 남용되는 단어를 해부합니다. 구조, 계보, 그리고 TypeScript 약 이백 줄로 동작하는 에이전트." },
  { path = "articles/your-agent-wants-root.md", note = "셸 도구를 가진 에이전트는 친근한 얼굴을 한 임의 코드 실행입니다. Docker만으로는 왜 충분하지 않은지, 그리고 오늘 바로 쓸 수 있는 강화된 샌드박스." },
  { path = "articles/the-bill-is-part-of-the-loop.md", note = "모든 응답에는 이미 자신의 비용이 담겨 있습니다. 그 숫자를 루프가 보고 행동할 수 있는 것으로 바꾸는 이야기입니다." },
]

[[extra.tracks]]
title = "플랫폼 자동화와 운영 용이성"
deck = "워크플로, 가드레일, 그리고 출시를 지속 가능하게 만드는 도구."
items = [
  { path = "articles/how-ai-makes-bare-metal-viable-again.md", note = "운영 중인 앱 두 개를 Kubernetes에서 Hetzner 서버 한 대로 옮겼습니다. 빠져 있던 조각은 하드웨어가 아니었습니다." },
  { path = "articles/mise-ate-my-makefile.md", note = "Mise는 Make, asdf, 그리고 잔뜩 쌓인 셸 스크립트를 프로젝트마다 TOML 파일 하나로 대체했습니다." },
  { path = "articles/how-i-work-these-days.md", note = "2020년의 Kaggle과 Hugging Face부터 2025년 말의 코딩 에이전트까지, 그리고 이 일상이 마침내 맞게 느껴지는 이유." },
]

[[extra.tracks]]
title = "언어, AI, 오픈 소스"
deck = "AI가 코드 대부분을 쓰게 될 때 프로그래밍 언어에 어떤 일이 일어나는지, 그리고 Haskell이 왜 여전히 중요한지."
items = [
  { path = "articles/what-programming-languages-become-when-ai-writes-the-code.md", note = "사람의 의도와 기계의 실행 사이에 있는 계층의 세 가지 미래, 그리고 제가 Haskell에 거는 이유." },
  { path = "articles/all-beginning-is-haskell.md", note = "Haskell이 시스템을 만드는 일에 대한 제 사고방식을 어떻게 형성했는지." },
  { path = "articles/looking-back-on-2025.md", note = "오키나와에서 Tim Berners-Lee를 읽은 일, 그리고 AI가 어쩌다 웹을 웹 자신으로부터 구해 낼지도 모르는 이유." },
]
+++

## 10분이 있다면 {#if-you-have-ten-minutes}

짧은 입구 세 개입니다. 각각 제가 하는 일의 다른 면을 보여 줍니다.

- **[Alert triage is a context problem](/notes/alert-triage-is-a-context-problem/)**: 본업에서 나온 2분짜리 노트입니다. 동료 한 명과 저는 시끄러운 WAF에 LLM을 붙였습니다. LLM 자체가 경보를 조용하게 만든 것은 아니었습니다. 운영자가 가장 먼저 찾아볼 컨텍스트를 LLM에게 준 것이 경보를 조용하게 만들었습니다.
- **[A model gateway is a reverse proxy](/notes/a-model-gateway-is-a-reverse-proxy/)**: 또 하나의 짧은 노트이자, 제가 계속 되돌아오는 생각입니다. 에이전트 플랫폼에 필요한 것의 대부분은 새로운 페이로드를 실은 오래된 인프라 작업이며, 엣지 프록시의 어휘는 거의 그대로 옮겨 갑니다.
- **[hx 벤치마크](https://arcanist.sh/hx/benchmarks/)**: 직접 실행해 볼 수 있는 것으로 엔지니어링을 판단하고 싶다면. hx는 Rust로 만든 Haskell 툴체인이며, 이 페이지에는 테스트 머신, 방법, 한계가 적혀 있습니다. [더 긴 이야기](/articles/why-we-built-a-haskell-package-manager-in-rust/)에서 hx가 왜 존재하는지 설명합니다.

아래의 네 트랙은 한 번에 한 주제씩 더 깊이 들어갑니다.
