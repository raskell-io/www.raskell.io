+++
title = "应用"
description = "可以直接打开使用的东西：用于学习和思考的本地优先工具，以及几个互动世界，从模拟真实世界到游戏。"
template = "projects.html"

[extra]
count_label = "apps"
# 与 _index.md 相同的层级与顺序；应用的说明翻译在 data/projects/<slug>.toml 的 [i18n.zh] 中。
tiers = [
  { key = "tools", title = "工具", size = "large", deck = "在浏览器中运行、可以离线使用的本地优先应用。你的数据留在你自己的设备上。", projects = ["manabi", "kurumi"] },
  { key = "play", title = "模拟与游戏", size = "large", deck = "有规则的世界，可以一回合一回合地玩，也可以任其自行演化。", projects = ["paw-and-claw", "kishi", "rainbow-river", "terrarium", "hotaru"] },
]
+++
