+++
title = "Projects"
description = "Ventures, flagship builds, and lab experiments. Real users, production intent, and a few side quests that are simply interesting."
template = "projects.html"

[extra]
headline = "Built to survive production."
# Each project is a TOML file in data/projects/<slug>.toml. Order here is display order.
tiers = [
  { key = "venture", title = "Ventures", deck = "Projects on a path to becoming real companies. Real users, real revenue potential, real stakes.", projects = ["archipelag-io", "cyanea", "humankind", "arcanist"] },
  { key = "flagship", title = "Flagship and serious builds", deck = "Infrastructure, tooling, and systems I maintain with production intent. These solve real problems I hit repeatedly.", projects = ["zentinel", "broodwar-live", "conflux", "hx", "bhc", "shiioo", "sango", "ushio", "vela", "refrakt"] },
  { key = "civic", title = "Civic and research", deck = "Work outside software that runs on the same principles: open standards, evidence, and systems thinking applied to public life and to the study of human collectives.", projects = ["die-zukunft", "human-macroscope"] },
  { key = "lab", title = "Labs / passion projects", deck = "Exploratory builds, side quests, and things I work on because they are interesting. Some will graduate to flagship. Some will stay fun forever. No pressure either way.", projects = ["coconutos", "driftscape", "robogym", "awesomeify", "learn-you-the-web"] },
]
+++
