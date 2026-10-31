+++
title = "프로젝트"
description = "벤처, 대표 프로젝트, 실험실의 실험들. 실제 사용자와 운영을 염두에 둔 작업, 그리고 그저 흥미로워서 하는 몇 가지 곁가지 프로젝트입니다."
template = "projects.html"

[extra]
headline = "운영 환경에서 살아남도록 만듭니다."
# _index.md와 같은 단계와 순서입니다. 프로젝트 설명의 번역은 data/projects/<slug>.toml의 [i18n.ko]에 있습니다.
tiers = [
  { key = "venture", title = "벤처", cta = { eyebrow = "투자 유치 중", title = "초기 벤처를 지원해 주십시오.", text = "엔젤, 벤처, 전략적 투자자를 환영합니다. 오픈 소스 프로젝트는 GitHub Sponsors, Open Collective, Ko-fi를 통한 후원도 받습니다.", links = [ { name = "투자 방법", url = "@/invest.md" }, { name = "오픈 소스 후원", url = "@/invest.md#open-source-projects" } ] }, deck = "실제 회사로 자라 가는 초기 단계의 벤처입니다. 실제 사용자와 실제 책임이 있으며, 초기 사용자와 투자자와의 대화에 열려 있습니다.", projects = ["archipelag-io", "cyanea", "humankind", "arcanist"] },
  { key = "flagship", title = "대표 프로젝트와 본격적인 작업", deck = "운영을 목표로 유지하는 인프라, 도구, 시스템입니다. 제가 반복해서 부딪히는 실제 문제를 풉니다.", projects = ["zentinel", "hx", "bhc", "shiioo", "aqueduct", "refrakt", "vela", "broodwar-live"] },
  { key = "civic", title = "공공과 연구", deck = "개방형 표준, 근거, 시스템적 사고를 공공의 삶, 역사, 그리고 인간 집단 연구에 적용합니다.", projects = ["die-zukunft", "human-macroscope", "chronicle-of-earth"] },
  { key = "lab", title = "실험실 / 취미 프로젝트", deck = "많은 아이디어를 시도하고, 작지만 실제로 동작하게 만들어 내놓은 뒤 어떤 것이 살아남는지 봅니다. 일부는 대표 프로젝트가 되고, 일부는 영원히 재미로 남습니다. 어느 쪽이든 부담은 없습니다.", projects = ["wasm-ad", "coconutos", "terrarium", "hotaru", "kishi", "sango", "conflux", "ushio", "driftscape", "robogym", "awesomeify", "learn-you-the-web"] },
]
+++
