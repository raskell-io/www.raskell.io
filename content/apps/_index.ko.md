+++
title = "앱"
description = "바로 열어서 쓸 수 있는 것들입니다. 배우고 생각하기 위한 로컬 우선 도구, 그리고 실제 세계를 흉내 낸 시뮬레이션부터 게임까지 몇 가지 상호작용 세계가 있습니다."
template = "projects.html"

[extra]
count_label = "apps"
# _index.md와 같은 단계와 순서입니다. 앱 설명의 번역은 data/projects/<slug>.toml의 [i18n.ko]에 있습니다.
tiers = [
  { key = "tools", title = "도구", size = "large", deck = "브라우저에서 실행되고 오프라인에서도 동작하는 로컬 우선 앱입니다. 데이터는 여러분의 기기에 남습니다.", projects = ["manabi", "kurumi"] },
  { key = "play", title = "시뮬레이션과 게임", size = "large", deck = "규칙이 있는 세계입니다. 한 턴씩 플레이하거나, 스스로 진화하도록 내버려 둘 수 있습니다.", projects = ["paw-and-claw", "kishi", "rainbow-river", "terrarium", "hotaru"] },
]
+++
