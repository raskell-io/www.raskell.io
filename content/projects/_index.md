+++
title = "Projects"
description = "Ventures, flagship builds, and lab experiments. Real users, production intent, and a few side quests that are simply interesting."
template = "projects.html"

[extra]
headline = "Built to survive production."
# Each project is a TOML file in data/projects/<slug>.toml. Order here is display order.
tiers = [
  { key = "venture", title = "Ventures", cta = { eyebrow = "Open to investment", title = "Back a venture early.", text = "Angel, venture, and strategic investors are welcome. The open-source projects take sponsorship too, through GitHub Sponsors, Open Collective, and Ko-fi.", links = [ { name = "How to invest", url = "@/invest.md" }, { name = "Sponsor open source", url = "@/invest.md#open-source-projects" } ] }, deck = "Early-stage ventures on a path to becoming real companies. Real users, real stakes, and open to conversations with early users and investors.", projects = ["archipelag-io", "cyanea", "humankind", "arcanist"] },
  { key = "flagship", title = "Flagship and serious builds", deck = "Infrastructure, tooling, and systems I maintain with production intent. These solve real problems I hit repeatedly.", projects = ["zentinel", "hx", "bhc", "broodwar-live", "refrakt", "vela"] },
  { key = "civic", title = "Civic and research", deck = "Open standards, evidence, and systems thinking applied to public life, history, and the study of human collectives.", projects = ["die-zukunft", "human-macroscope", "chronicle-of-earth"] },
  { key = "lab", title = "Labs / passion projects", deck = "I try a lot of ideas, ship them small and real, and see which ones stick. Some will graduate to flagship. Some will stay fun forever. No pressure either way.", projects = ["wasm-ad", "coconutos", "terrarium", "hotaru", "kishi", "sango", "conflux", "shiioo", "ushio", "driftscape", "robogym", "awesomeify", "learn-you-the-web"] },
]
+++
