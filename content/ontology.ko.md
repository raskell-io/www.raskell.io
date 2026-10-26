+++
title = "온톨로지"
description = "이 사이트에 어떤 종류의 것들이 있고, 서로 어떻게 이어지며, 지도가 그것들을 어떻게 그리는지 설명합니다. 종류마다 아이콘 하나, 색 세 가지, 그리고 지도 위 모든 선의 뜻입니다."
template = "ontology.html"

[extra]
headings = { kinds = "종류", relations = "관계", topics = "주제의 종류", statuses = "읽기 상태" }
decks = { kinds = "지도에는 그룹마다 하나씩 세 가지 색이 있습니다. 모든 종류는 아이콘이 든 원반으로 똑같이 그려지며, 노드는 연결이 많을수록 커집니다.", relations = "지도 위의 모든 선은 다음 중 하나입니다. 대부분은 페이지나 데이터 파일의 필드 하나에서 나옵니다.", topics = "주제는 하나의 어휘에서 나옵니다. 분야는 페이지가 무엇에 관한 것인지 말해 주고, 개념은 분야를 가로지르는 생각이며, 지도를 읽을 만하게 만드는 것은 바로 개념입니다.", statuses = "읽기 기록의 모든 작품에는 상태가 있습니다. 각 상태는 읽기 페이지에서는 책장이고, 지도에서는 허브입니다." }

[[extra.groups]]
title = "제가 쓴 것"
deck = "제가 쓴 글, 그리고 지도에서 여러 항목을 한데 모으는 허브입니다."
color = "#f4f0df"
kinds = [
  { key = "article", name = "글", desc = "긴 글입니다. 하나의 주장, 하나의 구축 과정, 또는 서평이며 보통 여러 장으로 나뉩니다.", where = "content/articles/" },
  { key = "review", name = "서평", desc = "읽기 기록의 작품 하나를 다룬 글로, 평점이 붙습니다. 서평은 서평 분류에 속한 글입니다.", where = "extra.review" },
  { key = "note", name = "노트", desc = "하나의 생각을 다룬 한 단락이나 한 페이지입니다. 노트는 나중에 글로 자랄 수 있습니다.", where = "content/notes/" },
  { key = "shelf", icon = "journal", name = "책장", desc = "읽기 기록의 상태 하나로, 예를 들어 읽을 목록이나 읽음이며, 그 작품들을 모으는 허브로 그려집니다.", where = "status, data/reading.toml" },
  { key = "group", name = "프로젝트 그룹", desc = "벤처나 실험실 같은 프로젝트 단계 하나로, 그 프로젝트들을 모으는 허브로 그려집니다.", where = "tiers, content/projects/" },
]

[[extra.groups]]
title = "제가 만든 것, 그리고 그 배열"
deck = "제가 만든 발표와 프로젝트, 그리고 글에 순서를 주는 시리즈와 분류입니다."
color = "#efd093"
kinds = [
  { key = "talk", name = "발표", desc = "행사와 장소가 함께 적힌 콘퍼런스 발표 슬라이드입니다.", where = "content/talks/" },
  { key = "project", name = "프로젝트", desc = "제가 만드는 소프트웨어, 사이트, 또는 연구로, 상태와 링크가 함께 있습니다.", where = "data/projects/" },
  { key = "series", name = "시리즈", desc = "여러 글에 걸친 읽기 순서로, 한 편씩 차례로 읽습니다.", where = "taxonomies.series" },
  { key = "category", name = "분류", desc = "주제가 아니라 글의 형식입니다. 지금은 서평 하나뿐입니다.", where = "categories_descriptions" },
]

[[extra.groups]]
title = "생각, 그리고 다른 사람의 작품"
deck = "모든 것을 가로지르는 주제, 그리고 제가 읽은 책, 논문, 보고서입니다. 작품은 주제보다 옅은 청록색입니다."
color = "#72d7dc"
kinds = [
  { key = "topic", name = "주제", desc = "하나의 어휘에서 나온 분야나 생각입니다. 주제는 더 넓은 주제 아래에 놓이며 다른 모든 것을 잇습니다.", where = "data/tags.toml" },
  { key = "book", color = "#a9e8e9", name = "책", desc = "읽기 기록의 논픽션 책입니다.", where = "data/reading.toml" },
  { key = "novel", color = "#a9e8e9", name = "소설", desc = "읽기 기록의 픽션입니다.", where = "data/reading.toml" },
  { key = "paper", color = "#a9e8e9", name = "논문", desc = "논문이나 학위논문입니다.", where = "data/reading.toml" },
  { key = "report", color = "#a9e8e9", name = "보고서", desc = "AI 2027 같은 보고서나 긴 시나리오입니다.", where = "data/reading.toml" },
  { key = "essay", color = "#a9e8e9", name = "에세이", desc = "에세이 한 편이나 에세이 연재입니다.", where = "data/reading.toml" },
]

[[extra.relations]]
from = "article"
verb = "다룬다"
to = "topic"
desc = "페이지, 프로젝트, 작품은 각자 주제를 지닙니다. 지도의 대부분이 이 선입니다."

[[extra.relations]]
from = "topic"
verb = "아래에 놓인다"
to = "topic"
desc = "주제와 그보다 넓은 주제입니다. 일부는 일부러 분야를 잇습니다. 예를 들어 위험은 신뢰성 아래에 놓입니다."

[[extra.relations]]
from = "article"
verb = "링크한다"
to = "article"
desc = "한 페이지 본문에서 다른 페이지로 가는 모든 링크입니다. 두 페이지 모두 링크하는 글과 링크된 글로 이를 보여 줍니다."

[[extra.relations]]
from = "article"
verb = "속한다"
to = "series"
desc = "글과 그 글이 속한 시리즈입니다."

[[extra.relations]]
from = "review"
verb = "평한다"
to = "book"
desc = "서평과 그 서평이 다루는 작품입니다."

[[extra.relations]]
from = "article"
verb = "논한다"
to = "book"
desc = "작품을 평하지 않고 논하는 페이지입니다."

[[extra.relations]]
from = "review"
verb = "들어 있다"
to = "category"
desc = "페이지와 그 분류, 곧 글의 형식입니다."

[[extra.relations]]
from = "book"
verb = "꽂혀 있다"
to = "journal"
desc = "작품과 읽기 기록에서 그 작품이 놓인 책장입니다."

[[extra.relations]]
from = "project"
verb = "들어 있다"
to = "group"
desc = "프로젝트와 프로젝트 페이지에서 그 프로젝트가 속한 단계입니다."

[[extra.relations]]
from = "project"
verb = "관련된다"
to = "project"
desc = "Hotaru와 Terrarium처럼 함께 묶이는 프로젝트입니다."

[[extra.topic_kinds]]
key = "domain"
name = "분야"
desc = "분산 시스템이나 역사처럼 일이나 연구의 분야입니다."

[[extra.topic_kinds]]
key = "concept"
name = "개념"
desc = "증강, 오만, 공유지처럼 분야를 가로지르는 생각입니다."

[[extra.topic_kinds]]
key = "technology"
name = "기술"
desc = "Rust나 OpenTelemetry 같은 언어, 도구, 플랫폼입니다."

[[extra.topic_kinds]]
key = "site"
name = "사이트"
desc = "이 사이트 자체에 관한 것입니다."

[[extra.statuses]]
key = "reading"
name = "지금 읽는 중"
desc = "지금 읽고 있는 것입니다."

[[extra.statuses]]
key = "next"
name = "다음 차례"
desc = "바로 다음에 읽을 것으로, 순서대로입니다."

[[extra.statuses]]
key = "backlog"
name = "읽을 목록"
desc = "언젠가 읽을 것으로, 정해진 순서는 없습니다."

[[extra.statuses]]
key = "read"
name = "읽음"
desc = "다 읽은 것으로, 다 읽은 달이 함께 적힙니다."

[[extra.statuses]]
key = "set-aside"
name = "잠시 덮어 둠"
desc = "시작했지만 아직 끝내지 않은 것입니다."
+++

이 사이트의 모든 것은 몇 안 되는 종류 중 하나입니다. 제가 쓴 것, 제가 만들거나 배열한 것, 또는 글이 이어 주는 생각이나 다른 사람의 작품입니다. 종류마다 아이콘이 하나 있고, 그 종류가 어디에 나타나든 아이콘은 같습니다. 목록에서, [여기서 시작](@/start-here.ko.md)에서, [검색](@/search.ko.md)에서, 그리고 [지도](@/map.ko.md) 위의 노드로서도 그렇습니다.

각 종류는 한 곳, 곧 페이지 폴더나 데이터 파일 하나에 등록되고, 거기서부터 모든 페이지에 닿습니다. 이 페이지는 그 모든 것을 읽는 열쇠입니다. 숫자는 실시간이며 사이트가 자라면서 바뀝니다.
