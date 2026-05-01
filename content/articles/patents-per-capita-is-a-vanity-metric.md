+++
title = "Patents Per Capita Is a Vanity Metric"
date = 2026-05-01
draft = true
description = "Switzerland tops the Global Innovation Index for the fifteenth year running. As an engineer, that should make you suspicious of the metric, not proud of the country."

[taxonomies]
tags = ["oss", "sovereignty", "metrics", "policy"]
categories = ["reviews"]

[extra]
author = "Raffael"
image = "patents-per-capita-is-a-vanity-metric.avif"
og_image = "patents-per-capita-is-a-vanity-metric.png"
+++

It is the first of May, Labour Day. A holiday explicitly about work, which makes it a good day to ask whether the work that gets counted is the work that actually matters.

Earlier this week I posted on LinkedIn about how Swiss innovation rankings tend to be illustrated with photos of Zurich, even though Basel produces a meaningful share of what those rankings reward. It performed better than most of my other shares there. Some of the feedback agreed. Some pushed back. Almost all of it stayed inside the same frame the rankings themselves set: which Swiss city deserves credit for the score. That is not the question I find interesting. The question I find interesting is what the score is measuring in the first place, and whether it is the score we should be optimising for. The LinkedIn format is not the right place to work that out. A long-form post on a Labour Day morning is.

Switzerland topped the Global Innovation Index in 2025 for the fifteenth year in a row.[^gii2025] The index is published annually by the World Intellectual Property Organization, the United Nations agency that administers the international patent system, and it ranks roughly 140 economies on how innovative they are. The 2025 press release went out in September. The country celebrated. Zurich's skyline got photographed again. Roche and Novartis, the two Basel-headquartered pharmaceutical giants, were name-checked. ETH Zurich and EPFL, the country's two federal technical universities, got their nods. The framing was the usual one: small country, outsized output, durable lead.

I am Swiss. I am from Basel. I build infrastructure for a living, which means I spend a lot of time staring at dashboards that report how systems are performing in production. A number that sits at the top of a leaderboard for fifteen consecutive years should make any engineer who watches dashboards suspicious before it makes them proud. The metrics that look the smoothest the longest are usually the ones telling you the least about what is happening right now.

This post is about why "most innovative country" is a vanity metric: a number that is real, and countable, and correlated with success, but that should not be the thing you optimise for. The Global Innovation Index measures yesterday extremely well. It does not measure today, and it tells you almost nothing about tomorrow.

<!-- more -->

---

## What the index actually measures

The 2025 Global Innovation Index evaluates roughly 140 economies across 80 indicators. Those indicators cluster into seven pillars: institutions (rule of law, regulatory quality), human capital and research (schools, universities, R&D spending), infrastructure (energy, logistics, digital), market sophistication (credit, investment, trade), business sophistication (knowledge workers, R&D collaboration), knowledge and technology outputs (patents, scientific publications, software exports), and creative outputs (design, brands, cultural goods). Inside those pillars, the heavy hitters are familiar to anyone who has skimmed a country brief: patents filed through the Patent Cooperation Treaty (the international patent system that lets one filing apply across many countries), scientific publications, research and development spending as a share of GDP, venture capital deals, high-tech exports, university rankings, intellectual property licensing income.

Switzerland's overall GII 2025 score is 66.0 out of 100. Its pillar profile is worth reading carefully.[^gii-pillars] The country leads the world in *creative outputs* (rank 1), is second in *knowledge and technology outputs*, sits at rank 3 on *institutions* and *market sophistication*, rank 5 on *infrastructure* and *business sophistication*, and rank 6 on *human capital and research*. WIPO frames this as a balanced ecosystem with one relative weakness. I read it as a leading-versus-lagging signal sitting right there in the table. Creative outputs are downstream of choices made years ago. Human capital and research is upstream of where the country goes next, since it captures the schools, universities, and research workforce that produce the next generation of patents and companies. The pillar most predictive of the next decade is the one Switzerland is weakest on.

<svg class="chart" viewBox="0 0 720 470" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="ch2t ch2d" style="width: 100%; height: auto; display: block; margin: 2.5rem auto; font-family: system-ui, sans-serif;">
  <title id="ch2t">Switzerland's GII 2025 ranking by pillar</title>
  <desc id="ch2d">Horizontal bar chart of Switzerland's rank in each of the seven Global Innovation Index pillars in 2025. Creative outputs rank 1, Knowledge and technology outputs rank 2, Institutions rank 3, Market sophistication rank 3, Infrastructure rank 5, Business sophistication rank 5, Human capital and research rank 6.</desc>
  <text x="0" y="22" font-size="15" font-weight="600" fill="var(--font-color)">Switzerland GII 2025 — rank by pillar (1 is best)</text>
  <text x="0" y="44" font-size="12" fill="var(--light-font-color)">Bar length scales with how close to rank 1; the highlighted pillar is the country's weakest.</text>

  <g transform="translate(0, 70)">
    <text x="290" y="20" text-anchor="end" font-size="13" fill="var(--font-color)">Creative outputs</text>
    <rect x="300" y="2" width="380" height="26" rx="6" fill="var(--accent-secondary)" opacity="0.55"/>
    <text x="700" y="20" font-size="13" font-weight="600" fill="var(--font-color)" font-family="ui-monospace, monospace">1</text>
  </g>
  <g transform="translate(0, 120)">
    <text x="290" y="20" text-anchor="end" font-size="13" fill="var(--font-color)">Knowledge &amp; technology outputs</text>
    <rect x="300" y="2" width="326" height="26" rx="6" fill="var(--accent-secondary)" opacity="0.55"/>
    <text x="700" y="20" font-size="13" font-weight="600" fill="var(--font-color)" font-family="ui-monospace, monospace">2</text>
  </g>
  <g transform="translate(0, 170)">
    <text x="290" y="20" text-anchor="end" font-size="13" fill="var(--font-color)">Institutions</text>
    <rect x="300" y="2" width="271" height="26" rx="6" fill="var(--accent-secondary)" opacity="0.55"/>
    <text x="700" y="20" font-size="13" font-weight="600" fill="var(--font-color)" font-family="ui-monospace, monospace">3</text>
  </g>
  <g transform="translate(0, 220)">
    <text x="290" y="20" text-anchor="end" font-size="13" fill="var(--font-color)">Market sophistication</text>
    <rect x="300" y="2" width="271" height="26" rx="6" fill="var(--accent-secondary)" opacity="0.55"/>
    <text x="700" y="20" font-size="13" font-weight="600" fill="var(--font-color)" font-family="ui-monospace, monospace">3</text>
  </g>
  <g transform="translate(0, 270)">
    <text x="290" y="20" text-anchor="end" font-size="13" fill="var(--font-color)">Infrastructure</text>
    <rect x="300" y="2" width="163" height="26" rx="6" fill="var(--accent-secondary)" opacity="0.55"/>
    <text x="700" y="20" font-size="13" font-weight="600" fill="var(--font-color)" font-family="ui-monospace, monospace">5</text>
  </g>
  <g transform="translate(0, 320)">
    <text x="290" y="20" text-anchor="end" font-size="13" fill="var(--font-color)">Business sophistication</text>
    <rect x="300" y="2" width="163" height="26" rx="6" fill="var(--accent-secondary)" opacity="0.55"/>
    <text x="700" y="20" font-size="13" font-weight="600" fill="var(--font-color)" font-family="ui-monospace, monospace">5</text>
  </g>
  <g transform="translate(0, 370)">
    <text x="290" y="20" text-anchor="end" font-size="13" font-weight="700" fill="var(--accent-primary)">Human capital &amp; research</text>
    <rect x="300" y="2" width="109" height="26" rx="6" fill="var(--accent-primary)"/>
    <text x="700" y="20" font-size="13" font-weight="700" fill="var(--accent-primary)" font-family="ui-monospace, monospace">6</text>
  </g>

  <text x="0" y="450" font-size="11" fill="var(--light-font-color)" font-style="italic">Source: WIPO Global Innovation Index 2025, Switzerland country profile.</text>
</svg>

The composite score is a weighted average of these inputs. By construction, every indicator in the index is a *trailing artifact of decisions made years or decades earlier*. A patent filed in 2024 is the legal endpoint of research that started, on average, three to seven years earlier in pharma and longer in materials science. A high-tech export reflects a manufacturing line that was capitalized at some point in the last decade. R&D-as-percentage-of-GDP is a flow, but the labs and equipment that flow funds are stocks built over twenty years.

This is not a complaint about WIPO's methodology. It is a complaint about how the number gets read.

A note on scope. This post is titled around patents per capita because patents per capita is the cleanest single-axis example of the structural problem. The Global Innovation Index is a composite of eighty indicators, including inputs as well as outputs, and a fair critic would point out that I am picking a fight with one indicator in the title and with the whole index in the body. Both deserve the same critique. The headline takeaway from the index, "most innovative country", is itself a countable, lagging summary that aggregates the same structural failure indicator by indicator. The composite inherits the problem rather than mitigating it.

## The lagging-indicator problem

Anyone who has run production systems knows the difference between a leading and a lagging indicator. A leading indicator tells you what is about to happen. A lagging indicator tells you what already happened. They both matter. They are not interchangeable.

If you operate a website, the rate at which queues are backing up is a leading indicator that the system is about to slow down. The 99th-percentile request time averaged over the last thirty days is lagging: by the time that number is bad, customers have already been having a bad week. The slide deck a leadership team reviews once a quarter is the most lagging signal of all. You do not learn that your platform is on fire from the quarterly review. You learn it weeks earlier from the live operational telemetry.

The Global Innovation Index is the quarterly review. It tells you, in 2025, what the substrate produced over the last decade. It does not tell you what the substrate is producing this quarter, and it does not tell you what the substrate will produce in 2035.

The lag matters because by the time the index drops, the substrate has been eroding for a decade. Redirecting capital, retaining talent, rebuilding fabrication capacity, and re-establishing supply-chain proximity then take another decade. You cannot turn around innovation telemetry the way you can turn around a misconfigured load balancer. The feedback loop is measured in twenty-year cycles.

## What the 2025 numbers actually say

**Patents per capita.** WIPO's *World Intellectual Property Indicators*, the agency's annual statistical report, places Switzerland *third* in resident patent applications per million population, at 1,212 (2023 data, the most recent vintage with country-level breakdowns).[^wipi2024] The Republic of Korea sits at 3,696. Japan sits at 1,839. South Korea files roughly three times as many patents per capita as Switzerland. After Switzerland the ranking continues with China at 1,079 and the United States at 824, and falls off sharply through the rest of the field.[^wipi-cross] This number does not show up prominently in the headline GII ranking, because the GII is a composite of dozens of indicators, but it is the cleanest single-axis measurement of "patents per capita" available, and Switzerland is no longer at the top of it.

<svg class="chart" viewBox="0 0 720 430" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="ch1t ch1d" style="width: 100%; height: auto; display: block; margin: 2.5rem auto; font-family: system-ui, sans-serif;">
  <title id="ch1t">Patents per million population, 2023</title>
  <desc id="ch1d">Bar chart of resident patent applications per million population. Republic of Korea 3,696, Japan 1,839, Switzerland 1,212, China 1,079, United States 824, Israel about 170, Nigeria about 2.</desc>
  <text x="0" y="22" font-size="15" font-weight="600" fill="var(--font-color)">Patents per million population (2023)</text>
  <text x="0" y="44" font-size="12" fill="var(--light-font-color)">Resident patent applications. Switzerland sits in a cluster with China, ahead of the US and far behind Korea.</text>

  <g transform="translate(0, 70)">
    <text x="170" y="20" text-anchor="end" font-size="13" fill="var(--font-color)">Republic of Korea</text>
    <rect x="180" y="2" width="470" height="28" rx="6" fill="var(--accent-secondary)" opacity="0.55"/>
    <text x="660" y="20" font-size="13" font-weight="600" fill="var(--font-color)" font-family="ui-monospace, monospace">3,696</text>
  </g>
  <g transform="translate(0, 116)">
    <text x="170" y="20" text-anchor="end" font-size="13" fill="var(--font-color)">Japan</text>
    <rect x="180" y="2" width="234" height="28" rx="6" fill="var(--accent-secondary)" opacity="0.55"/>
    <text x="660" y="20" font-size="13" font-weight="600" fill="var(--font-color)" font-family="ui-monospace, monospace">1,839</text>
  </g>
  <g transform="translate(0, 162)">
    <text x="170" y="20" text-anchor="end" font-size="13" font-weight="700" fill="var(--accent-primary)">Switzerland</text>
    <rect x="180" y="2" width="154" height="28" rx="6" fill="var(--accent-primary)"/>
    <text x="660" y="20" font-size="13" font-weight="700" fill="var(--accent-primary)" font-family="ui-monospace, monospace">1,212</text>
  </g>
  <g transform="translate(0, 208)">
    <text x="170" y="20" text-anchor="end" font-size="13" fill="var(--font-color)">China</text>
    <rect x="180" y="2" width="137" height="28" rx="6" fill="var(--accent-secondary)" opacity="0.55"/>
    <text x="660" y="20" font-size="13" font-weight="600" fill="var(--font-color)" font-family="ui-monospace, monospace">1,079</text>
  </g>
  <g transform="translate(0, 254)">
    <text x="170" y="20" text-anchor="end" font-size="13" fill="var(--font-color)">United States</text>
    <rect x="180" y="2" width="105" height="28" rx="6" fill="var(--accent-secondary)" opacity="0.55"/>
    <text x="660" y="20" font-size="13" font-weight="600" fill="var(--font-color)" font-family="ui-monospace, monospace">824</text>
  </g>
  <g transform="translate(0, 300)">
    <text x="170" y="20" text-anchor="end" font-size="13" fill="var(--font-color)">Israel</text>
    <rect x="180" y="2" width="22" height="28" rx="6" fill="var(--accent-secondary)" opacity="0.55"/>
    <text x="660" y="20" font-size="13" font-weight="600" fill="var(--font-color)" font-family="ui-monospace, monospace">~170</text>
  </g>
  <g transform="translate(0, 346)">
    <text x="170" y="20" text-anchor="end" font-size="13" fill="var(--font-color)">Nigeria</text>
    <rect x="180" y="2" width="4" height="28" rx="2" fill="var(--accent-secondary)" opacity="0.55"/>
    <text x="660" y="20" font-size="13" font-weight="600" fill="var(--font-color)" font-family="ui-monospace, monospace">~2</text>
  </g>

  <text x="0" y="412" font-size="11" fill="var(--light-font-color)" font-style="italic">Sources: WIPO World Intellectual Property Indicators 2024 (top five). Israel and Nigeria from World Bank patent data, 2020–2021.</text>
</svg>

Per-capita framing flatters small countries, and the chart does not show what absolute output looks like. Switzerland's 1,212 per million works out to roughly 11,000 resident patent applications in 2023.[^abs] China filed around 1.64 million the same year. The United States filed about 518,000. South Korea filed roughly 288,000. In absolute terms the gap is one to two orders of magnitude.

Innovation does not scale linearly with population either. Doubling Switzerland's headcount would not double its patent output, because the bottleneck is not citizens but laboratories, capital, supply chains, and the dense cluster of expertise that took a century to build. Per-capita is useful for stripping out that scale effect. The absolute frontier still belongs disproportionately to the large economies. Both numbers matter. The post is about which one the GII *headlines*, not about which one is real.

A second caveat the chart does not show: not all patents are the same patent. Korea's lead reflects in part a domestic filing culture dominated by utility models and strategic corporate portfolios, where average claim scope is narrow and average commercial value is low. Switzerland's filings are weighted toward pharmaceutical molecules and precision instruments, where families extend internationally and a single patent can anchor billions of dollars in revenue. Adjusting for citation depth, family extension, or commercial value compresses the gap considerably and on some quality-weighted measures inverts it. This is exactly the vanity-metric problem in miniature: the index uses raw count, so the leaderboard rewards filing volume over filing weight. Korea is genuinely a patent superpower. It is also a very particular kind of patent superpower.

**R&D intensity.** "R&D intensity" is the standard cross-country comparison for research investment: total research and development spending in a country, divided by that country's GDP. Switzerland's figure was 3.31% in 2021, the most recent year reported by the World Bank.[^wb-rd-ch] In 2024, Sweden recorded 3.57% of GDP. Belgium reached 3.36% and Austria 3.26%.[^eurostat-rd] The Swiss number has historically sat in a band between roughly 3.1% and 3.4% over the last decade. Sweden has now pulled ahead. Belgium and Austria are within touching distance. This is the input metric, the money going *into* research before any patent or paper comes out. Patents and publications are downstream of it, and the upstream race is tightening.

**Direction of travel.** The European Innovation Scoreboard, an annual ranking published by the European Commission that scores the EU member states (and a handful of associated countries including Switzerland) on innovation performance, keeps Switzerland in first place in Europe for the eighth consecutive year, with a 2025 score of 169.3 (where 100 is the EU average).[^eis2025] The same report notes that the Swiss score has slipped slightly compared to 2024. One year of small drift is noise. Two or three years of small drift is signal. At the regional level, the Zurich region ranks fourth in Europe and Ticino is also in the top ten, but the regional leaderboard is now headed by Stockholm, Hovedstaden (the Copenhagen metropolitan region), and London. Swiss regions are not extending their lead. They are defending it.

Read together, the 2025 numbers describe a country still ranked first by the lagging composite but *no longer obviously first on the leading inputs*. South Korea is filing roughly three times as many patents per capita. Sweden is out-investing Switzerland on R&D as a share of GDP, and Belgium and Austria are closing. The European composite is drifting downward. Swiss regions are no longer running the European table. The cache is still warm. The queue is filling.

## What an engineer would actually instrument

If you were tasked with building a leading-indicator dashboard for national innovation, you would not start with patents and publications. You would start with the substrate.

A first cut at leading indicators:

- **Production capacity onshore.** What fraction of high-value manufacturing happens inside the country versus offshored. The patents are downstream of the factories.
- **Supply-chain proximity.** Time and jurisdictional distance between research, prototyping, fabrication, and deployment. Innovation compounds when the loop is short.
- **Time-to-compute.** For software and AI workloads, how long it takes a researcher to get from idea to running a meaningful experiment on appropriate hardware. This is a real bottleneck and almost no national index measures it.
- **Vendor concentration.** What share of critical infrastructure depends on a small number of foreign suppliers whose access can be revoked. Lock-in is a leading indicator of fragility.
- **Jurisdictional clarity over critical systems.** Where the box physically sits, whose law governs it, who can compel disclosure or shutdown.
- **Talent flux.** Net inflow versus outflow of researchers, engineers, and founders, by sector and by seniority. Public university enrollment is a lagging proxy. LinkedIn migration data is closer to leading.
- **Fabrication and energy capacity.** GPU import volume, semiconductor packaging capacity, datacenter construction permits, grid headroom. The physical floor under everything else.

None of these show up in the GII. Most of them are harder to measure than patent counts, which is part of why patent counts dominate. The number is popular because it is countable, not because it is the right one.

The AI-specific version of this argument is sharper still. If the next decade of innovation runs on inference, the binding constraint is GPU-hours per researcher. The leading indicators are sovereign training capacity, time from grant approval to a running cluster, energy headroom for a serious datacenter buildout, and the share of national compute that depends on a foreign vendor whose access can be restricted by export control. Switzerland has world-class researchers and effectively zero sovereign training capacity at scale. That gap does not show up in any 2025 ranking. It will show up in the 2035 one.

## Why this matters for Switzerland specifically

Switzerland's lead is real. Roche and Novartis are not hype. ETH Zurich and EPFL are genuinely world-class research universities. The pharmaceutical cluster in and around Basel, which has been accumulating expertise, suppliers, regulators, and capital since the dye industry of the nineteenth century, is the kind of dense multi-decade compounding asset that other countries cannot conjure on demand. None of that is in dispute.

What is in dispute is the *direction of the second derivative*. The GII tells you about the height of the mountain. It does not tell you whether you are still climbing.

A disclosure before the prescriptions. I have skin in this. I founded [Archipelag.io](/articles/archipelag-io-distributed-compute-from-mining-rigs-to-open-beta/), a distributed compute network that exists because I think sovereign compute is a real and underbuilt category. I also founded [Die Zukunft](https://die-zukunft.ch/), a Swiss political movement that does not fit the left-right axis and is not trying to. Its platform centers on open standards, anti-lock-in procurement, and using engineering principles to make public IT and critical infrastructure actually work — the same engineering thesis this post argues, in policy form. The conventional left-right substrate is, in my read, part of why public IT and infrastructure decisions land where they do, and I think building an alternative is more useful than winning an argument inside it. Reasonable people will read what follows partly as analysis and partly as pitch. Both are present. I would rather name the conflict than have you discover it later.

Three things would matter if the goal is to stay on the leaderboard in 2040:

1. **Production onshoring for high-value goods.** Reshoring pharma manufacturing, semiconductor packaging, and AI infrastructure into Swiss territory. Not because globalization is bad, but because innovation compounds where the loop is tight.
2. **Sovereign compute infrastructure.** The substrate for the next twenty years of innovation is GPU compute, fab capacity, and the networks that connect them. Whoever controls those, controls the rate at which downstream patents can be filed. I have written about [Archipelag.io as the working answer at the network layer](/articles/archipelag-io-distributed-compute-from-mining-rigs-to-open-beta/), and about [why the economics of inference are now a utility-bill problem, not a software-license problem](/articles/the-economics-of-inference/).
3. **Open standards and anti-lock-in procurement in government and critical industry.** Vendor-coupled critical infrastructure is fragile innovation infrastructure. The cheaper a system is to exit, the more the ecosystem can iterate around it.

These are infrastructure problems, not policy preferences. They show up in queue depth before they show up in the index.

## The honest limit

The QBR-versus-queue-depth metaphor only goes so far. National innovation is not a load balancer, and the comparison breaks down where political economy, demographics, education systems, and culture come in. I am not arguing that the GII should be replaced or that Switzerland is in trouble. The country is fine, by any reasonable measure, and will remain so for the foreseeable future.

I am arguing that *fifteen years at the top of a lagging composite* is exactly the kind of streak that should make a thoughtful reader ask what the leading indicators look like. The press cycle does not ask that question. The infrastructure work does.

Patents per capita is a vanity metric in the same way "daily active users" is a vanity metric in product analytics: a number that goes up reliably while the underlying product is rotting, because it counts surface activity rather than depth of engagement. It is real, it is countable, it correlates with health, and it is not the thing you should optimise for. Optimise for the substrate. The downstream metrics will follow.

[^gii2025]: WIPO, [*Global Innovation Index 2025: Innovation Investment Growth Slows*](https://www.wipo.int/en/web/global-innovation-index/w/news/2025/wipo-global-innovation-index-2025-switzerland-sweden-us-the-republic-of-korea-and-singapore-top-ranking-china-enters-top-10-innovation-investment-growth-slows), September 2025. Top five: Switzerland, Sweden, United States, Republic of Korea, Singapore. China enters the top ten for the first time.

[^gii-pillars]: WIPO, [*GII 2025 results*](https://www.wipo.int/web-publications/global-innovation-index-2025/en/gii-2025-results.html). Switzerland scores 66.0 overall and is rank 1 in *creative outputs*, top five in five further pillars, and rank 6 in *human capital and research*.

[^wipi2024]: WIPO, [*World Intellectual Property Indicators 2024: Patents Highlights*](https://www.wipo.int/web-publications/world-intellectual-property-indicators-2024-highlights/en/patents-highlights.html). Resident patent applications per million population (2023): Republic of Korea 3,696, Japan 1,839, Switzerland 1,212, China 1,079, United States 824. The headline 2024 figures published in [WIPI 2025](https://www.wipo.int/web-publications/world-intellectual-property-indicators-2025-highlights/en/patents-highlights.html) shift the top three slightly — Korea 3,783, Japan 1,913, Switzerland 1,235 — but per-country breakdowns beyond the top three were not yet released in machine-comparable form at the time of writing, so the chart below uses the 2023 vintage for cross-country consistency.

[^abs]: Absolute resident patent applications in 2023, per WIPO. China approximately 1.64 million; United States 518,364; Republic of Korea 287,954. Switzerland's figure of roughly 10,700 comes from the [GII 2025 Switzerland country profile](https://www.wipo.int/edocs/gii-ranking/2025/ch.pdf), indicator 6.1.1 *Patents by origin* (10.73 thousand in 2023), which corresponds to 1,212 per million given a population of approximately 8.9 million.

[^wipi-cross]: For Israel and Nigeria, comparable figures are not in WIPI 2024's top-20 origin tables. The approximate values shown in the chart (~170 for Israel, ~2 for Nigeria) are from the [World Bank *Patent applications, residents* dataset](https://data.worldbank.org/indicator/IP.PAT.RESD), divided by population, with 2020 (Nigeria) and 2021 (Israel) being the most recent reported values. Israel's figure understates its real innovation activity because most Israeli inventors file abroad through the USPTO and EPO rather than domestically, which is itself a useful illustration of how a single national metric can mislead.

[^wb-rd-ch]: World Bank, [*Research and development expenditure (% of GDP) — Switzerland*](https://data.worldbank.org/indicator/GB.XPD.RSDV.GD.ZS?locations=CH). Latest reported figure 3.31% (2021).

[^eurostat-rd]: Eurostat, R&D expenditure 2024 figures as reported in the European Innovation Scoreboard 2025 background data. Sweden 3.57%, Belgium 3.36%, Austria 3.26%.

[^eis2025]: European Commission, [*European Innovation Scoreboard 2025*](https://research-and-innovation.ec.europa.eu/knowledge-publications-tools-and-data/publications/all-publications/european-innovation-scoreboard-2025_en). Switzerland: score 169.3 (EU average = 100), rank 1 in Europe for the eighth consecutive year, score down slightly versus 2024. Regional rankings from the [*Regional Innovation Scoreboard 2025 — Switzerland profile*](https://ec.europa.eu/assets/rtd/ris/2025/ec_rtd_ris-regional-profile-ch.pdf): Zurich (CH04) ranks fourth in Europe; the regional leaderboard is headed by Stockholm, Hovedstaden, and London.

