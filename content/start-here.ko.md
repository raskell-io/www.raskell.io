+++
title = "여기서 시작"
description = "처음 오셨나요? 짧은 글 세 편으로 시작한 다음, 일곱 가지 읽기 트랙을 따라 더 깊이 들어가 보십시오. 각 트랙은 순서대로 읽으면 좋고, 각 항목은 따로 읽어도 됩니다."
template = "tracks.html"

[extra.quick]
title = "10분이 있다면"
deck = "짧은 입구 세 개입니다. 각각 제가 하는 일의 다른 면을 보여 줍니다."
items = [
  { path = "articles/traffic-replay-as-a-security-primitive.md", note = "운영자의 관점에서 본 응용 보안입니다. 규칙을 촉발한 트래픽을 재현할 수 있기 전까지 WAF 튜닝은 추측에 머뭅니다." },
  { path = "articles/the-economics-of-inference.md", note = "추론 토큰이 API 호출보다 물, 전기, 가스에 더 가깝게 움직이는 이유와, 그것이 AI 경제에 뜻하는 바를 다룹니다." },
  { url = "https://arcanist.sh/hx/benchmarks/", title = "hx 벤치마크", note = "직접 실행해 볼 수 있는 것으로 엔지니어링을 판단하고 싶다면. hx는 Rust로 만든 Haskell 툴체인이며, 이 페이지에는 테스트 머신, 방법, 한계가 적혀 있습니다." },
]

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
title = "게임을 배우는 기계"
deck = "게임을 두는 프로그램이 어떻게 배우는지 체스, 쇼기, 바둑으로 보여 줍니다. 연재, 직접 상대할 수 있는 엔진, 그리고 그 뒤에 있는 책입니다."
items = [
  { path = "articles/learning-to-play.md", note = "체스 신동의 안내서, 오래된 게임 세 가지, 노트북 한 대. 게임 AI의 아이디어를 Rust로 다시 만들어 휴대전화 브라우저에서 돌리고, 측정합니다." },
  { project = "kishi" },
  { work = "reinforcement-learning-an-introduction", note = "자기 대국의 바탕이 되는 교과서입니다. 자기 대국에서 배우는 엔진이 실제로 무엇을 하는지 설명합니다." },
  { work = "the-infinity-machine", note = "게임을 두는 프로그램과 AlphaGo에서 범용 지능 경쟁에 이르는 DeepMind의 길입니다." },
]

[[extra.tracks]]
title = "뇌, 에뮬레이션, 시뮬레이션된 마음"
deck = "뇌를 컴퓨터에 복사하려면 무엇이 필요한지, 그리고 수천 개의 시뮬레이션된 뉴런이 이미 무엇을 하는지 다룹니다."
items = [
  { path = "articles/brain-emulation-as-an-infrastructure-problem.md", note = "MIT 학위논문은 뇌 에뮬레이션이 공학의 영역에 들어섰다고 주장합니다. 인프라로 읽으면, 그 숫자는 여러분의 AI 클러스터가 감당하도록 만들어지지 않은 워크로드를 말해 줍니다." },
  { work = "from-worm-to-human", note = "뇌 에뮬레이션을 공학 프로그램으로 다루는 학위논문이며, 그 숫자는 용량 계획처럼 읽힙니다." },
  { work = "state-of-brain-emulation-2025", note = "커넥토믹스, 기록, 모델링이 각각 어디까지 왔고 서로 얼마나 떨어져 있는지에 대한 이 분야 스스로의 조사입니다." },
  { project = "hotaru" },
]

[[extra.tracks]]
title = "열린 웹과 그 데이터"
deck = "선물로서의 웹, 학습 데이터로서의 웹, 그리고 열린 채로 지킬 가치가 있는 공유지로서의 웹입니다."
items = [
  { path = "articles/the-web-was-the-training-set.md", note = "Tim Berners-Lee의 회고록은 프랑스와 스위스에 걸친 연구소에서 한 영국 엔지니어가 프로토콜을 내어 준 이야기입니다. 2026년에 읽으면, AI 데이터 공급의 기원 이야기이기도 합니다." },
  { path = "articles/the-bottleneck-is-data-and-europe-is-sitting-on-it.md", note = "프런티어 AI에 부족한 것은 컴퓨팅이 아니라 공개된 텍스트입니다. 유럽의 강점은 온라인에 올린 적 없는 고품질 데이터이며, 이를 활용하려면 조율이 필요합니다." },
  { path = "articles/this-site-is-becoming-a-map.md", note = "블로그는 제가 마지막으로 쓴 것을 보여 줍니다. raskell.io의 새 지도는 제가 계속 되돌아오는 것을 보여 주며, 공개된 두 번째 뇌의 시작입니다." },
  { path = "articles/looking-back-on-2025.md", note = "오키나와에서 Tim Berners-Lee를 읽은 일, 그리고 AI가 어쩌다 웹을 웹 자신으로부터 구해 낼지도 모르는 이유." },
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
  { path = "articles/why-we-built-a-haskell-package-manager-in-rust.md", note = "Rust로 만든 빠른 Haskell 툴체인 hx, 그리고 hx가 Python 도구를 현대화한 방식을 따르는 이유입니다." },
]
+++

아래의 일곱 트랙은 한 번에 한 주제씩 더 깊이 들어갑니다. 트랙에는 여러 종류가 섞일 수 있습니다. 글 한 편, 그 글이 다루는 프로젝트, 그리고 함께 읽을 만한 책입니다.
