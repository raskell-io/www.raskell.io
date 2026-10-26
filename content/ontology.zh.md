+++
title = "本体"
description = "这个网站上有哪些种类的东西，它们如何相连，地图又如何画出它们：每个种类一个图标，三种颜色，以及地图上每条线的含义。"
template = "ontology.html"

[extra]
headings = { kinds = "种类", relations = "关系", topics = "主题的种类", statuses = "阅读状态" }
decks = { kinds = "地图上有三种颜色，每组一种。每个种类的画法都一样，是一个带图标的圆盘，节点的连接越多就越大。", relations = "地图上的每条线都是下面其中一种。它们大多来自页面或数据文件里的一个字段。", topics = "主题来自同一套词汇。学科说明一页讲的是什么；概念是跨越学科的想法，正是它们让地图值得一读。", statuses = "阅读记录里的每部作品都有一个状态。每个状态在阅读页面上是一个书架，在地图上是一个枢纽。" }

[[extra.groups]]
title = "我写的东西"
deck = "我写下的内容，以及在地图上把东西聚到一起的枢纽。"
color = "#f4f0df"
kinds = [
  { key = "article", name = "文章", desc = "长文：一个论点、一次构建或一篇书评，通常分成几章。", where = "content/articles/" },
  { key = "review", name = "书评", desc = "关于阅读记录中一部作品的文章，带有评分。书评是书评分类里的文章。", where = "extra.review" },
  { key = "note", name = "笔记", desc = "关于一个想法的一段话或一页。笔记以后可能会长成一篇文章。", where = "content/notes/" },
  { key = "shelf", icon = "journal", name = "书架", desc = "阅读记录里的一个状态，比如待读或已读，画成把它的作品聚到一起的枢纽。", where = "status, data/reading.toml" },
  { key = "group", name = "项目组", desc = "一档项目，比如创业项目或实验项目，画成把它的项目聚到一起的枢纽。", where = "tiers, content/projects/" },
]

[[extra.groups]]
title = "我做的东西，以及它们如何编排"
deck = "我做的演讲和项目，以及给文章排出顺序的系列和分类。"
color = "#efd093"
kinds = [
  { key = "talk", name = "演讲", desc = "一场会议演讲的幻灯片，附有活动和场地。", where = "content/talks/" },
  { key = "project", name = "项目", desc = "我构建的软件、网站或研究，附有状态和链接。", where = "data/projects/" },
  { key = "series", name = "系列", desc = "跨越几篇文章的阅读顺序，一部分接一部分地读。", where = "taxonomies.series" },
  { key = "category", name = "分类", desc = "一种写作形式，而不是一个学科。目前只有一个：书评。", where = "categories_descriptions" },
]

[[extra.groups]]
title = "想法，以及别人的作品"
deck = "贯穿一切的主题，以及我读过的书、论文和报告。作品的青色比主题浅一些。"
color = "#72d7dc"
kinds = [
  { key = "topic", name = "主题", desc = "来自同一套词汇的一个学科或一个想法。主题挂在更宽泛的主题下面，并把其他一切连在一起。", where = "data/tags.toml" },
  { key = "book", color = "#a9e8e9", name = "书", desc = "阅读记录中的一本非虚构书。", where = "data/reading.toml" },
  { key = "novel", color = "#a9e8e9", name = "小说", desc = "阅读记录中的虚构作品。", where = "data/reading.toml" },
  { key = "paper", color = "#a9e8e9", name = "论文", desc = "一篇论文或学位论文。", where = "data/reading.toml" },
  { key = "report", color = "#a9e8e9", name = "报告", desc = "一份报告或一个长篇情景，比如 AI 2027。", where = "data/reading.toml" },
  { key = "essay", color = "#a9e8e9", name = "随笔", desc = "一篇随笔或一组随笔。", where = "data/reading.toml" },
]

[[extra.relations]]
from = "article"
verb = "讲的是"
to = "topic"
desc = "页面、项目和作品各自带着它们的主题。地图的大部分就是这些线。"

[[extra.relations]]
from = "topic"
verb = "归于"
to = "topic"
desc = "一个主题和它更宽泛的主题。其中一些有意跨越领域，比如风险归于可靠性。"

[[extra.relations]]
from = "article"
verb = "链接到"
to = "article"
desc = "一页正文里指向另一页的每个链接。两页都会显示它，分别是链接到和被链接自。"

[[extra.relations]]
from = "article"
verb = "属于"
to = "series"
desc = "一篇文章和它所属的系列。"

[[extra.relations]]
from = "review"
verb = "评论"
to = "book"
desc = "一篇书评和它评论的作品。"

[[extra.relations]]
from = "article"
verb = "讨论"
to = "book"
desc = "讨论一部作品但不评论它的页面。"

[[extra.relations]]
from = "review"
verb = "在"
to = "category"
desc = "一个页面和它的分类，也就是一种写作形式。"

[[extra.relations]]
from = "book"
verb = "放在"
to = "journal"
desc = "一部作品和它在阅读记录里的书架。"

[[extra.relations]]
from = "project"
verb = "在"
to = "group"
desc = "一个项目和它在项目页面上的档位。"

[[extra.relations]]
from = "project"
verb = "相关于"
to = "project"
desc = "彼此相属的项目，比如 Hotaru 和 Terrarium。"

[[extra.topic_kinds]]
key = "domain"
name = "领域"
desc = "一个工作或研究的领域，比如分布式系统或历史。"

[[extra.topic_kinds]]
key = "concept"
name = "概念"
desc = "一个跨越领域的想法，比如增强、狂妄或公地。"

[[extra.topic_kinds]]
key = "technology"
name = "技术"
desc = "一门语言、一个工具或一个平台，比如 Rust 或 OpenTelemetry。"

[[extra.topic_kinds]]
key = "site"
name = "网站"
desc = "关于这个网站本身。"

[[extra.statuses]]
key = "reading"
name = "在读"
desc = "我此刻正在读的东西。"

[[extra.statuses]]
key = "next"
name = "接下来"
desc = "我紧接着要读的东西，按顺序排列。"

[[extra.statuses]]
key = "backlog"
name = "待读"
desc = "总有一天，没有特定顺序。"

[[extra.statuses]]
key = "read"
name = "已读"
desc = "已经读完，附有读完的月份。"

[[extra.statuses]]
key = "set-aside"
name = "暂放"
desc = "开始读了但没有读完，暂时如此。"
+++

这个网站上的一切，都属于少数几个种类之一：我写的东西，我做的或编排的东西，或者文章所连接的一个想法、一部别人的作品。每个种类都有一个图标，无论它出现在哪里都一样：在列表里，在[从这里开始](@/start-here.zh.md)，在[搜索](@/search.zh.md)里，以及作为它在[地图](@/map.zh.md)上的节点。

每个种类都只在一个地方登记，一个页面文件夹或一个数据文件，然后从那里到达每一页。这一页是理解这一切的钥匙。上面的数字是实时的，会随着网站的成长而变化。
