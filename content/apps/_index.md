+++
title = "Apps"
description = "Things you can open and use: local-first tools for learning and thinking, and a couple of worlds to play in."
template = "projects.html"

[extra]
count_label = "apps"
# Each app is a TOML file in data/projects/<slug>.toml, same format as the projects page.
tiers = [
  { key = "tools", title = "Tools", size = "large", deck = "Local-first apps that run in your browser and work offline. Your data stays on your devices.", projects = ["manabi", "kurumi"] },
  { key = "play", title = "Games and simulations", size = "large", deck = "Worlds with rules, played turn by turn or left to evolve on their own.", projects = ["paw-and-claw", "terrarium"] },
]
+++
