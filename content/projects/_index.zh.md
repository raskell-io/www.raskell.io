+++
title = "项目"
description = "创业项目、旗舰作品和实验室里的实验。真实的用户，面向生产的意图，还有几个只是单纯有趣的支线任务。"
template = "projects.html"

[extra]
headline = "为在生产环境中存活而构建。"
# 与 _index.md 相同的层级与顺序；项目的说明翻译在 data/projects/<slug>.toml 的 [i18n.zh] 中。
tiers = [
  { key = "venture", title = "创业项目", cta = { eyebrow = "开放投资", title = "尽早支持一个创业项目。", text = "欢迎天使投资人、风险投资人和战略投资人。开源项目也接受赞助，可以通过 GitHub Sponsors、Open Collective 和 Ko-fi。", links = [ { name = "如何投资", url = "@/invest.md" }, { name = "赞助开源", url = "@/invest.md#open-source-projects" } ] }, deck = "正在走向真正公司的早期创业项目。真实的用户，真实的投入，欢迎早期用户和投资人来聊。", projects = ["archipelag-io", "cyanea", "humankind", "arcanist"] },
  { key = "flagship", title = "旗舰与认真之作", deck = "我以生产为目标维护的基础设施、工具和系统。它们解决的是我反复遇到的真实问题。", projects = ["zentinel", "hx", "bhc", "shiioo", "refrakt", "vela", "broodwar-live"] },
  { key = "civic", title = "公共与研究", deck = "把开放标准、证据和系统思维用于公共生活、历史，以及对人类集体的研究。", projects = ["die-zukunft", "human-macroscope", "chronicle-of-earth"] },
  { key = "lab", title = "实验室与兴趣项目", deck = "我尝试很多想法，把它们做得小而真实，看看哪些能留下来。有些会升级为旗舰项目，有些会永远只是好玩。两种都没有压力。", projects = ["wasm-ad", "coconutos", "terrarium", "hotaru", "kishi", "sango", "conflux", "ushio", "driftscape", "robogym", "awesomeify", "learn-you-the-web"] },
]
+++
