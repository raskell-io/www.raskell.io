+++
title = "The Bottleneck Is Data, and Europe Is Sitting on It"
date = 2026-06-30
description = "Frontier AI is running short on public text, not compute. Europe's edge is the high-quality data it never put online. Capturing it needs coordination."

[taxonomies]
tags = ["sovereignty", "policy", "oss"]
categories = ["deep-dives"]

[extra]
author = "Raffael"
image = "the-bottleneck-is-data-and-europe-is-sitting-on-it.avif"
og_image = "the-bottleneck-is-data-and-europe-is-sitting-on-it.png"
related = [
    "patents-per-capita-is-a-vanity-metric",
    "the-economics-of-inference",
    "archipelag-io-distributed-compute-from-mining-rigs-to-open-beta",
]
+++

The public conversation about who wins in AI is almost entirely a conversation about hardware. Who has the most accelerators, who controls the fabs, whose export-control list bites whose supply chain. That conversation is real, and I have spent enough time on the compute side to take it seriously. It is also, increasingly, the wrong place to look for the binding constraint.

The people running the largest labs have been saying so out loud. At NeurIPS in December 2024, Ilya Sutskever told a packed room that "pre-training as we know it will unquestionably end," for the blunt reason that "compute is growing through better hardware, better algorithms and larger clusters, but the data is not growing, because we have but one internet." He called data "the fossil fuel of AI" and said the field had "achieved peak data."[^sutskever] A month later Elon Musk said the cumulative sum of human knowledge usable for training had been "exhausted" the previous year.[^musk] Strip away the showmanship and the claim underneath is an engineering claim about a substrate running short.

I want to take that claim seriously and follow it to where it leads, which is not where the hardware conversation goes. If the scarce input is high-quality data, then the interesting question is who holds the data that has not already been consumed. The answer, for a large and specific category of it, is Europe. Not because Europe planned it that way, but because Europe wrote and printed and catalogued for five centuries and then, for the most part, never put the result on the open web.

<!-- more -->

---

## The substrate is shifting from compute to data

I argued in [Patents Per Capita Is a Vanity Metric](/articles/patents-per-capita-is-a-vanity-metric/) that national innovation debates fixate on lagging outputs and ignore the substrate that produces them. The same mistake is happening one level down in AI. Accelerator counts are the visible, countable, photographable number. They are not the number that is about to bind.

The most careful public estimate of the data ceiling comes from Epoch AI. Their analysis puts the total stock of public human-generated text at roughly 300 trillion tokens, with a wide confidence interval of 100 to 1,000 trillion, and projects that frontier training runs will fully utilize that stock at some point between 2026 and 2032, earlier if models continue to be trained well past the compute-optimal point.[^epoch] That is not a prediction of an imminent wall. It is a prediction that the easy phase, where you grow capability mostly by pointing a larger crawler at a larger fraction of the same web, is ending on a schedule you can read.

The raw web is large and most of it is not worth training on. Common Crawl, the standard open snapshot of the public web, published a single monthly archive in June 2026 containing 2.10 billion pages and 354 terabytes of uncompressed content.[^commoncrawl] After aggressive filtering and deduplication, the usable yield collapses. HuggingFace's FineWeb, a well-regarded cleaned English corpus derived from Common Crawl, lands at roughly 15 trillion tokens.[^educatingsilicon] The gap between petabytes of raw HTML and a few tens of trillions of clean tokens is the whole game. Quantity was never the constraint. Clean, relevant, rights-clear quantity is.

That reframing matters because it changes what counts as an asset. Under the old frame, the asset is a crawler and a cluster. Under the new frame, the asset is a corpus nobody else can easily get: curated, domain-dense, provenance-clean, and ideally in a language or a register that the incumbents undersampled. Compute is one substrate, and I have written about [why the economics of inference now read like a utility bill](/articles/the-economics-of-inference/) and about [Archipelag.io as a sovereign answer at the compute layer](/articles/archipelag-io-distributed-compute-from-mining-rigs-to-open-beta/). Data is the other substrate, and it is the one where the strategic map looks very different from the hardware map.

## How the incumbents actually got their data

To see why clean data is the constraint, look at what the largest labs were willing to do to get more of it. The behaviour is the evidence. When a company with effectively unlimited access to the public web starts taking legal and reputational risk to acquire text, the text has become the scarce input.

Two United States court cases from June 2025 put the practice on the record, and they point in different directions, so it is worth being precise about both.

In *Bartz v. Anthropic*, Judge William Alsup drew a clean line. Training a model on books was "exceedingly transformative" and protected as fair use when the books were lawfully acquired. Downloading and retaining pirated copies from shadow libraries was not, and exposed the company to infringement liability.[^anthropic] In September 2025 Anthropic agreed to settle for at least 1.5 billion dollars, reported as the largest copyright settlement in United States history, covering roughly 500,000 works at about 3,000 dollars each, with an agreement to destroy the pirated copies. The settlement figure traces back to a pool of around seven million books the company had pulled from shadow libraries.[^anthropic]

In *Kadrey v. Meta*, decided the same month, Judge Vince Chhabria reached the opposite headline result, granting Meta summary judgment on fair use, but he was unusually explicit that the ruling turned on the plaintiffs failing to develop the right argument rather than on the underlying conduct being clearly lawful.[^meta] What surfaced in the filings is the part that matters for my argument. According to the plaintiffs' court filings, Meta acquired its training books by torrenting tens of terabytes from shadow libraries including LibGen and Anna's Archive, and internal communications quoted in those filings describe employees noting that "torrenting from a corporate laptop does not feel right" and recording that the effort proceeded after escalation to Mark Zuckerberg.[^meta] Those lines are plaintiffs' characterizations of discovery material, not judicial findings, and I am flagging them as such. The point does not depend on the precise wording. The point is that a company of that size routed around the clean, licensed path because the clean, licensed path did not contain enough text.

The shadow libraries themselves are not a fringe phenomenon. Books3, a dataset of roughly 196,000 pirated books scraped from a private tracker, sat inside The Pile and trained an entire generation of open models before an anti-piracy group forced its removal in 2023.[^books3] Anna's Archive, the largest of the current shadow libraries, indexes around 64 million books and 96 million papers across roughly 1.1 petabytes of data, and it does not pretend to be anything other than a training-data supplier. It openly offers high-speed bulk access to model builders, and by its own account had provided that access to around thirty companies, most of them based in China, as of early 2025.[^annas] At least one Chinese frontier lab's published technical work has been reported to list hundreds of thousands of ebooks sourced from Anna's Archive among its training data.[^deepseek]

I am not raising this to score a moral point. I am raising it because it is the cleanest available signal of what the market values. Both the American and the Chinese frontier efforts have treated the high-quality remainder of human text as worth acquiring through grey and black channels. The surface web is picked over. The next increment of quality is expensive, contested, and in many cases not on the web at all.

## What Europe actually has

This is where the map stops favouring the incumbents. The text that the scrapers cannot reach, because it was never digitized or never made public, is disproportionately European, and it is disproportionately the high-quality kind.

Start with the scale of what exists on paper. One careful independent estimate puts every book ever written at roughly 21 trillion tokens and the entire body of scientific and academic literature at roughly another trillion, with around 100 million of those papers reachable only through shadow libraries and the rest behind paywalls or offline.[^educatingsilicon] Set that against the 300-trillion-token public stock from Epoch and the picture is clear. The openly available, rights-clear, clean corpus is a thin slice of what humanity has actually produced. Most of the rest is either already scraped, locked behind a paywall, or sitting in a building.

<svg class="chart" viewBox="0 0 720 350" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="chdt chdd" style="width: 100%; height: auto; display: block; margin: 2.5rem auto; font-family: system-ui, sans-serif;">
  <title id="chdt">Estimated text by pool, in trillions of tokens</title>
  <desc id="chdd">Horizontal bar chart of rough token-stock estimates. Total public human text stock about 300 trillion, high-quality web text about 100 trillion, all books ever written about 21 trillion, and the largest fully open multilingual corpus, Common Corpus, 2.3 trillion.</desc>
  <text x="0" y="22" font-size="15" font-weight="600" fill="var(--font-color)">Where the text is (trillions of tokens, indicative)</text>
  <text x="0" y="44" font-size="12" fill="var(--light-font-color)">The largest fully open, rights-clear corpus is a sliver of the total stock. Most of the gap is scraped, paywalled, or offline.</text>

  <g transform="translate(0, 72)">
    <text x="290" y="20" text-anchor="end" font-size="13" fill="var(--font-color)">Public human text stock</text>
    <rect x="300" y="2" width="380" height="26" rx="6" fill="var(--accent-secondary)" opacity="0.55"/>
    <text x="688" y="20" font-size="13" font-weight="600" fill="var(--font-color)" font-family="ui-monospace, monospace">~300</text>
  </g>
  <g transform="translate(0, 120)">
    <text x="290" y="20" text-anchor="end" font-size="13" fill="var(--font-color)">High-quality web text</text>
    <rect x="300" y="2" width="127" height="26" rx="6" fill="var(--accent-secondary)" opacity="0.55"/>
    <text x="435" y="20" font-size="13" font-weight="600" fill="var(--font-color)" font-family="ui-monospace, monospace">~100</text>
  </g>
  <g transform="translate(0, 168)">
    <text x="290" y="20" text-anchor="end" font-size="13" fill="var(--font-color)">All books ever written</text>
    <rect x="300" y="2" width="27" height="26" rx="6" fill="var(--accent-secondary)" opacity="0.55"/>
    <text x="335" y="20" font-size="13" font-weight="600" fill="var(--font-color)" font-family="ui-monospace, monospace">~21</text>
  </g>
  <g transform="translate(0, 216)">
    <text x="290" y="20" text-anchor="end" font-size="13" font-weight="700" fill="var(--accent-primary)">Common Corpus (open, clean)</text>
    <rect x="300" y="2" width="5" height="26" rx="3" fill="var(--accent-primary)"/>
    <text x="313" y="20" font-size="13" font-weight="700" fill="var(--accent-primary)" font-family="ui-monospace, monospace">2.3</text>
  </g>

  <text x="0" y="320" font-size="11" fill="var(--light-font-color)" font-style="italic">Sources: total stock from Epoch AI; web and book estimates from Educating Silicon; Common Corpus from PleIAs. Definitions differ between analyses, so the bars are indicative rather than strictly comparable.</text>
</svg>

Now narrow to Europe and the picture sharpens into something specific. Europe printed, archived, and catalogued continuously for five centuries, across two dozen living languages and several dead ones, in a literary and scientific culture that produced a large fraction of the world's pre-digital written record. A meaningful share of that record has been carefully digitized already. It is simply not free, and not open.

The cleanest single example is a media house. The *Neue Zürcher Zeitung* digitized its entire print run back to its first edition in 1780, around 1.9 million newspaper pages, in a project that cost roughly a million francs.[^nzz] It is one of the most complete continuous records of European public life that exists in machine-readable form. It is also paywalled. The freely accessible portion stops at 1914. Everything after that, which is to say the part covering the century that actually shaped modern Europe, is available to subscribers and pay-per-article customers only.[^nzz] That is one newspaper, in one city, in one of the smaller European countries. Multiply that pattern across every national paper of record, every regional press, every learned society and professional journal on the continent, and the size of the locked corpus comes into view.

The aggregators show the digitized-and-public layer, and it is already large. Europeana federates somewhere between 55 and 60 million digitized items from more than 4,000 cultural-heritage institutions.[^europeana] France's Gallica holds around 10 million documents from the Bibliothèque nationale and some 300 partner institutions.[^gallica] The Deutsche Digitale Bibliothek aggregates well over 40 million objects from more than 700 contributing bodies.[^ddb] These are real, and they are a starting point, but they are also the visible tip. Underneath sits the much larger mass that is digitized-but-restricted, like the NZZ archive, and the larger mass still that is not digitized at all: national and regional archives, parish and notarial records, scientific society proceedings, government documents, technical literature, and the back catalogues of publishers who have no commercial reason to scan a hundred-year-old monograph.

That this material can be turned into clean training data is not hypothetical. Harvard released Institutional Books 1.0 in June 2025, a 242-billion-token dataset built directly from its library's digitized collections, with provenance attached.[^harvard] That is a single university library producing, from previously offline holdings, a corpus comparable in size to a respectable national-language web crawl, and a rights-clear one. The European version of that move, executed across the continent's libraries and archives, is a corpus with no equivalent anywhere else.

There is a second European asset that the incumbents structurally cannot replicate: aligned multilingual text. The European Union operates in 24 official languages, and decades of parliamentary and legal translation have produced parallel corpora of a quality that does not exist for most of the world's languages. The Europarl corpus aligns proceedings of the European Parliament across 21 languages at roughly 50 million words per language.[^europarl] The JRC-Acquis and the broader EUR-Lex body of European law provide aligned legal text across more than 20 languages, with one English-side build alone exceeding 840 million tokens.[^eurlex] For the long tail of European languages that United States and Chinese models undersample, Maltese, Irish, Estonian, Latvian, and the rest, this kind of high-quality aligned text is the difference between a usable model and a useless one. It is also, again, a European-made asset that fell out of how Europe governs itself.

I will put the structure plainly in a table, because the three pools behave very differently and the differences are the whole strategic point.

| Pool | Rough size | Status | Who can use it |
|------|-----------|--------|----------------|
| High-quality public web | ~100T tokens | Scraped | Everyone, already consumed |
| Shadow-library books and papers | tens of T tokens | Pirated | Whoever accepts the legal and ethical risk |
| Books, archives, science, mostly offline or paywalled | 20T+ tokens | Locked | Whoever holds the rights or has lawful access |
| European cultural heritage and aligned multilingual text | large, uncounted | Fragmented across borders and institutions | Whoever coordinates to assemble it |
| Open, rights-clear corpora | ~2-15T tokens | Open | Everyone, but small so far |

The incumbents have exhausted row one, taken legal risk on row two, and are litigating their way through row three. Rows four and five are where Europe holds a position nobody can scrape or export-control away. The catch is in the last column of row four. The asset exists, but it is scattered across thousands of institutions, dozens of jurisdictions, and two dozen languages, and no single actor can assemble it alone.

## This is a coordination problem, not a technology problem

The reason Europe's data advantage is latent rather than realized is the same reason Europe struggles with most continental-scale projects. The asset is fragmented, and the fragmentation is structural. A French library, a Swiss newspaper, a German learned society, and an Italian state archive each hold a piece, each operates under a different national transposition of European law, each has its own rights situation, and none of them has either the mandate or the budget to turn its holdings into training data. The technical problem of building a corpus from clean text was solved years ago. The hard problem is institutional, legal, and political.

The legal layer is genuinely double-edged, and pretending otherwise would be dishonest. Europe has built the most elaborate data-governance stack in the world, and parts of it cut against assembling large corpora while other parts are precisely the tools you would want.

The General Data Protection Regulation, in force since 2018, governs any corpus containing personal data and forces a lawful-basis-plus-safeguards regime that sits awkwardly with indiscriminate scraping.[^gdpr] That is a real constraint, though less of one for the historical and literary material that makes up most of the latent corpus. The Copyright in the Digital Single Market Directive of 2019 is the instrument that matters most, and it contains both the obstacle and the opening. Its Article 4 permits text and data mining for any purpose, including commercial, but lets rightsholders opt out through a machine-readable reservation, which is exactly how European publishers and news houses now block commercial training.[^dsm] Its Article 3, by contrast, grants a mandatory text-and-data-mining exception to research organizations and cultural-heritage institutions, applies to any work they have lawful access to, and cannot be opted out of.[^dsm] That asymmetry is the most underused lever in European AI policy. The institutions that hold the latent corpus are, very often, exactly the research organizations and cultural-heritage bodies that Article 3 privileges.

The enabling instruments go further. The Data Governance Act, applicable since September 2023, creates the legal machinery for data intermediaries, data altruism organizations, and the re-use of protected public-sector data.[^dga] The Data Act, most of it applicable since September 2025, opens up industrial and machine-generated data.[^dataact] The Open Data Directive obliges public bodies to publish high-value datasets in machine-readable, bulk-downloadable form.[^opendata] And the Common European Data Spaces strategy has stood up fourteen sectoral data spaces, including, pointedly, a language data space and a cultural-heritage data space built on Europeana, which are the natural legal containers for exactly the corpus I am describing.[^dataspaces] On top of all of it, the AI Act now requires general-purpose model providers to publish a detailed summary of their training data and to respect the Article 4 copyright opt-out, even for data scraped outside Europe, if the model is sold into the European market.[^aiact]

The honest reading is that this stack was built to protect rights and to enable sharing, and that the protection has so far outrun the enablement. The Draghi report on European competitiveness made the cost concrete in 2024, counting roughly a hundred technology-focused laws and more than 270 regulators across the digital domain, and estimating that a mid-sized firm faces around 1.3 million euros in GDPR compliance cost, while framing the United States and China as structurally advantaged at aggregating data.[^draghi] That critique is fair as far as it goes. But the conclusion is not that the rules are fatal. The conclusion is that Europe has already built the legal containers, the Article 3 exception, the data altruism framework, the data spaces, and has simply not filled them. The instruments exist. The coordinated effort to use them does not.

## It is already starting, just not at the scale of the asset

The encouraging part is that the proof of concept is done. The pieces of a coordinated European data effort exist today, built by small teams on modest budgets, and they work. They are uncoordinated and underfunded relative to the size of the prize, but they demonstrate that the approach is sound.

The clearest example is Common Corpus, assembled by the French company PleIAs. It is the largest fully open multilingual training corpus in existence, around 2.27 trillion tokens, built entirely from public-domain and openly licensed material with per-document provenance.[^commoncorpus] Nearly a trillion of those tokens come from its OpenCulture collection of books and newspapers, exactly the cultural-heritage material I have been describing, and it carries enough volume in German, Spanish, Italian, Polish, Greek, and Latin to train serious multilingual models.[^commoncorpus] Common Corpus is the template. It shows that you can build a clean, auditable, rights-clear corpus at the trillion-token scale without touching a shadow library, and that doing so in Europe yields a multilingual asset by default.

The other pieces are filling in around it. OpenWebSearch.eu is building an open European web index to reduce dependence on Google and Bing, funded with 8.5 million euros across fourteen research and computing centres in seven countries.[^openwebsearch] A modest sum for a sovereign index, but the architecture is the right one: an open substrate every European lab can build on rather than a proprietary one they must rent. And the sovereign-model layer has gone from nothing to a real field in about two years. Fraunhofer's Teuken-7B trained from scratch on roughly 4 trillion tokens across all 24 official European languages.[^teuken] The EuroLLM project, trained on Spain's MareNostrum 5 supercomputer, now covers all 24 plus 11 more languages and has reached a 22-billion-parameter model.[^eurollm] Spain's publicly funded ALIA initiative, backed by more than 240 million euros, produced the Salamandra family trained on 9.37 trillion tokens across 35 languages.[^alia] Finland's Poro demonstrated the "blessing of multilinguality," using a high-resource language to lift a low-resource one.[^poro] Latvia's TildeOpen did the same for the Baltic and Eastern European languages that every American and Chinese model treats as an afterthought.[^tildeopen]

Read individually, each of these is a worthy regional project. Read together, they are a continent independently rediscovering the same insight from a dozen directions: that Europe's edge is multilingual, culturally specific, rights-clear data, and that building on it is both legal and effective. What is missing is the layer above them. There is no shared corpus they all draw from, no coordinated digitization programme feeding them, and no continental budget treating the underlying data as strategic infrastructure rather than as a collection of national research grants.

## What I would actually build

If the goal is to convert a latent asset into a strategic one, the work is mostly institutional, and it is the kind of goal-oriented industrial policy that Europe is capable of when it decides a thing matters. Mirroring the approach I took in the patents piece, these are the moves I would make, in rough order of impact.

1. **A European training-data commons, with Common Corpus as the template.** One pooled, openly licensed, provenance-tracked corpus that every European lab can train on, assembled from public-domain holdings, openly licensed material, and Article 3 text-and-data-mining output. The technical pattern is proven. What is needed is the mandate and the budget to run it at the scale of the continent's holdings rather than one company's effort.

2. **Mass digitization funded as infrastructure, not as a cultural grant.** The largest part of the asset is still on paper. Treat the national libraries, archives, scientific-society back catalogues, and newspaper morgues the way you would treat roads or grid capacity, because for the AI substrate that is exactly what they are. The Harvard Institutional Books result shows the per-institution yield. The European total is enormous, and it depreciates while it sits in boxes.

3. **Aggressive, lawful use of the Article 3 exception.** The mandatory, non-waivable text-and-data-mining right for research organizations and cultural-heritage institutions is the single most powerful legal tool Europe already owns and barely uses. Route digitization and corpus-building through the institutions that hold the lawful access, and a large fraction of the locked corpus becomes legally minable without a single licensing negotiation.

4. **Collective licensing for the rest, negotiated at coalition scale.** For the genuinely commercial archives, the NZZ-class assets, negotiate once, at the level of the coalition, through a clearinghouse, rather than forcing every lab to strike its own deal or do without. The Anthropic settlement is the price of doing this badly and after the fact. A clearinghouse is the price of doing it deliberately and in advance.

5. **Keep the corpus and the index open, on principle.** This is the anti-lock-in argument I keep returning to. A shared open corpus and an open web index mean every European lab iterates on the same substrate and competes on models rather than on data hoards. A proprietary corpus reproduces, at the European level, exactly the dependency the whole effort is meant to escape.

6. **Land the data where the jurisdiction is clear.** Tie the corpus to sovereign compute, MareNostrum 5, LUMI, JUPITER, and distributed capacity of the kind [Archipelag.io](/articles/archipelag-io-distributed-compute-from-mining-rigs-to-open-beta/) is building, so that the strategic asset is trained and served under European law rather than rented from a provider subject to someone else's.

None of this requires a technical breakthrough. All of it requires coordination across borders, languages, and institutions, which is the specific thing Europe finds hardest and the specific thing that, done once, produces an asset no competitor can copy.

A disclosure before anyone reads the prescriptions as disinterested analysis. I have skin in this. I founded [Archipelag.io](/articles/archipelag-io-distributed-compute-from-mining-rigs-to-open-beta/), which exists because I think sovereign compute is a real and underbuilt category, and I founded [Die Zukunft](https://die-zukunft.ch/), a Swiss political movement built around open standards, anti-lock-in procurement, and applying engineering principles to public infrastructure. The data argument in this post is the same engineering thesis as the compute argument, pointed at a different substrate. Read it as analysis and as advocacy. Both are present, and I would rather say so.

## The honest limits

The case has real weaknesses, and a thesis is only worth the counterarguments it survives.

The first is quality. Centuries of printed text are not clean training data the moment they are scanned. Optical character recognition on old typefaces is noisy, historical orthography drifts, and the domain skews heavily toward whatever institutions chose to preserve. Digitization at continental scale is slow and expensive, and the payoff arrives over a decade, not a quarter. This is real, and it is the main reason the asset is still latent. It is also exactly the kind of unglamorous, long-horizon infrastructure work that compounds, which is the argument for starting now rather than the argument against starting at all.

The second is legal risk. The Article 3 exception is powerful but bounded, the Article 4 opt-out fragments what is commercially minable, national transpositions differ, and personal data lurks in archives in ways GDPR takes seriously. A European data commons would spend real effort on rights clearance and on keeping personal data out of the public layer. That effort is a cost. It is also the thing that makes the resulting corpus defensible rather than a 1.5-billion-dollar liability waiting to be assessed.

The third is that data alone does not produce a frontier model. You still need compute, talent, and the willingness to fund training runs at a scale Europe has historically flinched at. A clean corpus is necessary, not sufficient. I am not claiming the corpus wins the race by itself. I am claiming it is the one input where Europe holds a structural advantage that cannot be bought or scraped, and that an advantage in the binding constraint is worth organizing around.

The fourth is the framing itself. "Europe wins the AI race" is the wrong goal, and I have deliberately avoided it everywhere except this sentence. Beating the largest American or Chinese model at the next benchmark is neither likely nor the point. The realistic goal is sovereign capability and a defensible position: models that are genuinely better at Europe's languages, that are trained on rights-clear data that survives an audit, and that serve regulated industries which cannot legally run on a corpus of uncertain provenance. That is a niche the incumbents cannot easily contest, and it happens to sit exactly where Europe's data advantage is.

The last is that synthetic data may erode the value of the human-text moat over time, and the lab leaders quoted at the top are betting on it. So far synthetic data has proven reliable mainly in narrow, checkable domains like mathematics and code, and it is generated from models that were themselves trained on the human corpus. The rare, high-quality, culturally specific human data is, if anything, more valuable in a synthetic-data world, because it is the seed the synthetic process cannot fabricate.

## The substrate Europe already owns

The hardware conversation is not wrong, it is just crowded, and it concerns an asset Europe will always be buying rather than holding. The data conversation is quieter and points at an asset Europe already holds and has simply never organized.

The United States and China have scraped the surface of human knowledge, and where the surface ran out, the largest labs paid a billion and a half dollars in settlements, or accepted access from shadow libraries, to reach the next layer. The layer below that, the books and archives and scientific record and aligned multilingual text that were never put online, is disproportionately European, disproportionately high in quality, and legally protected in a way that makes it impossible to take by scraping or to remove by export control. It is the rare strategic asset that an adversary cannot acquire faster than you can, because acquiring it means owning the five centuries that produced it.

The question is not whether Europe can build the infrastructure to use it. The components already exist, built by small teams who saw the opportunity early. The question is whether Europe treats its written record as a cultural curiosity to be admired in a museum, or as strategic infrastructure to be funded, coordinated, and put to work. Optimize the substrate. The models will follow.

[^sutskever]: Ilya Sutskever, talk at NeurIPS 2024, December 2024, as reported in The Decoder, ["OpenAI co-founder says AI is reaching 'peak data' as it hits the limits of the internet"](https://the-decoder.com/openai-co-founder-says-ai-is-reaching-peak-data-as-it-hits-the-limits-of-the-internet/). The "fossil fuel of AI" and "peak data" phrasings are quoted directly from the talk.

[^musk]: Elon Musk, in conversation with Mark Penn streamed on X, 8 January 2025, reported by TechCrunch, ["Elon Musk agrees that we've exhausted AI training data"](https://techcrunch.com/2025/01/08/elon-musk-agrees-that-weve-exhausted-ai-training-data/). Musk's claim is rhetorical and offered without methodology, and is best read as sentiment rather than estimate. Contrast it with the Epoch projection in the next note.

[^epoch]: Pablo Villalobos et al., ["Will we run out of data? Limits of LLM scaling based on human-generated data"](https://epoch.ai/publications/will-we-run-out-of-data-limits-of-llm-scaling-based-on-human-generated-data), Epoch AI, updated June 2024. Total public human-text stock estimated at roughly 300 trillion tokens (90% CI 100T to 1,000T), projected to be fully utilized between 2026 and 2032, earlier under heavy overtraining.

[^commoncrawl]: Common Crawl, June 2026 archive (CC-MAIN-2026-25): 2.10 billion pages, 354.59 TiB uncompressed. [commoncrawl.org/latest-crawl](https://commoncrawl.org/latest-crawl).

[^educatingsilicon]: ["How much LLM training data is there, in the limit?"](https://www.educatingsilicon.com/2024/05/09/how-much-llm-training-data-is-there-in-the-limit/), Educating Silicon, 9 May 2024. Estimates: all books ever written ~21 trillion tokens; scientific and academic literature ~1 trillion tokens, of which roughly 100 million papers are reachable only via shadow libraries; high-quality web text ~60 to 160 trillion tokens, with HuggingFace's FineWeb (~15 trillion filtered English tokens) as an anchor. These are independent estimates and definitions differ from Epoch's; treat as indicative.

[^anthropic]: *Bartz v. Anthropic*, N.D. Cal. No. 3:24-cv-05417 (Judge William Alsup), summary judgment June 2025: training on lawfully acquired books held transformative and fair use, downloading and retaining pirated copies from shadow libraries held not protected. Settlement reported at no less than 1.5 billion dollars (September 2025), covering roughly 500,000 works at about 3,000 dollars each, with destruction of pirated copies, drawn from a pool of around seven million downloaded books. NPR, ["Anthropic to pay $1.5 billion to authors in landmark AI settlement"](https://www.npr.org/2025/09/05/nx-s1-5529404/anthropic-settlement-authors-copyright-ai); Authors Guild, ["What authors need to know about the Anthropic settlement"](https://authorsguild.org/advocacy/artificial-intelligence/what-authors-need-to-know-about-the-anthropic-settlement/).

[^meta]: *Kadrey v. Meta*, N.D. Cal. No. 3:23-cv-03417 (Judge Vince Chhabria), summary judgment for Meta on fair use, 25 June 2025; the opinion states it turns on the plaintiffs' failure to develop the record rather than on the lawfulness of the conduct. [Opinion (Justia, Doc. 598)](https://law.justia.com/cases/federal/district-courts/california/candce/3:2023cv03417/415175/598/). The torrenting volume and the internal communications are drawn from the plaintiffs' court filings and are characterizations of discovery material, not judicial findings of fact. Reporting: Rolling Stone, ["Meta Pirated Library, Court Filing Alleges"](https://www.rollingstone.com/culture/culture-news/ai-meta-pirated-library-zuckerberg-1235235394/).

[^books3]: The Pile (EleutherAI, December 2020) and its Books3 component, roughly 196,000 books scraped from a private tracker, removed in 2023 after anti-piracy action. [The Pile (Wikipedia)](https://en.wikipedia.org/wiki/The_Pile_(dataset)); Gizmodo, ["Anti-Piracy Group Takes AI Training Dataset 'Books3' Offline"](https://gizmodo.com/anti-piracy-group-takes-ai-training-dataset-books3-off-1850743763). Book counts vary between sources (~191,000 to ~196,640).

[^annas]: Anna's Archive scale and stated mission per [its Wikipedia entry](https://en.wikipedia.org/wiki/Anna's_Archive) (as of mid-2026): roughly 64.4 million books, 95.7 million papers, ~1.1 petabytes; offers high-speed bulk access to model trainers and, per its operators, had served around thirty companies, mostly China-based, as of January 2025.

[^deepseek]: Reported in secondary analysis that a Chinese vision-language model's technical work lists hundreds of thousands of ebooks sourced from Anna's Archive among its training data. See ["Shadow libraries and AI training"](https://www.nembal.com/blog/sahdow_libraries_and_ai_training). I have not independently verified the underlying technical report; treat the specific figure as reported rather than confirmed.

[^nzz]: *Neue Zürcher Zeitung* archive digitization back to 1780, roughly 1.9 million pages, project cost around one million francs. The full archive at [zeitungsarchiv.nzz.ch](https://zeitungsarchiv.nzz.ch/) is paywalled; a free subset covering issues up to 1914 is available via e-newspaperarchives.ch. NZZ, ["NZZ digitalisiert Ausgaben seit 1780"](https://www.nzz.ch/zuerich/nzz-digitalisiert-ausgaben-seit-1780-im-internet-zugaenglich-ld.1648371).

[^europeana]: Europeana aggregates roughly 55 to 60 million digitized items from more than 4,000 institutions; the exact count varies by source and date. [europeana.eu/en/about-us](https://www.europeana.eu/en/about-us).

[^gallica]: Gallica holds approximately 10 million documents from the Bibliothèque nationale de France and around 300 partner institutions. [bnf.fr Gallica](https://www.bnf.fr/en/gallica-bnf-digital-library).

[^ddb]: The Deutsche Digitale Bibliothek aggregates well over 40 million objects from more than 700 institutions. [deutsche-digitale-bibliothek.de](https://www.deutsche-digitale-bibliothek.de/?lang=en); figures vary, so cite the live portal counter for precision.

[^harvard]: Harvard Library, ["Institutional Books 1.0"](https://arxiv.org/pdf/2506.08300), June 2025: a 242-billion-token dataset built from the library's digitized collections, with provenance.

[^dsm]: Directive (EU) 2019/790 on copyright in the Digital Single Market. Article 4 permits text and data mining for any purpose subject to a machine-readable rightsholder opt-out (Art. 4(3)); Article 3 grants a mandatory, non-waivable text-and-data-mining exception to research organizations and cultural-heritage institutions for works to which they have lawful access. [EUR-Lex 2019/790](https://eur-lex.europa.eu/eli/dir/2019/790/oj).

[^gdpr]: Regulation (EU) 2016/679 (GDPR), applicable since 25 May 2018. [EUR-Lex 2016/679](https://eur-lex.europa.eu/eli/reg/2016/679/oj).

[^dga]: Regulation (EU) 2022/868 (Data Governance Act), applicable since 24 September 2023: data intermediation services, data altruism organizations, and re-use of protected public-sector data. [EUR-Lex 2022/868](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32022R0868).

[^dataact]: Regulation (EU) 2023/2854 (Data Act), most provisions applicable since 12 September 2025: access to and sharing of connected-product and related-service data. [EUR-Lex 2023/2854](https://eur-lex.europa.eu/eli/reg/2023/2854/oj).

[^opendata]: Directive (EU) 2019/1024 on open data and the re-use of public-sector information, including mandatory high-value datasets (Implementing Regulation (EU) 2023/138). [EUR-Lex 2019/1024](https://eur-lex.europa.eu/eli/dir/2019/1024/oj).

[^dataspaces]: European Commission, [Common European Data Spaces](https://digital-strategy.ec.europa.eu/en/policies/data-spaces): fourteen sectoral data spaces in development, including a language data space and a cultural-heritage data space built on Europeana.

[^aiact]: Regulation (EU) 2024/1689 (AI Act), in force since 1 August 2024, general-purpose model obligations applying from 2 August 2025. Article 53 requires a copyright-compliance policy respecting the DSM Art. 4(3) opt-out and a publicly available "sufficiently detailed summary" of training content using an AI Office template (published 24 July 2025). [EUR-Lex 2024/1689](https://eur-lex.europa.eu/eli/reg/2024/1689/oj); [Code of Practice and template](https://digital-strategy.ec.europa.eu/en/policies/contents-code-gpai).

[^draghi]: European Commission, ["The future of European competitiveness"](https://commission.europa.eu/topics/eu-competitiveness/draghi-report_en) (Draghi report), September 2024: roughly 100 technology-focused laws and more than 270 digital regulators across member states, and an estimated ~1.3 million euro GDPR compliance cost for a mid-sized firm.

[^commoncorpus]: PleIAs, Common Corpus: roughly 2.27 trillion tokens, fully open, built from public-domain and openly licensed sources with per-document provenance; the OpenCulture collection (books and newspapers) accounts for ~967 billion tokens. [HuggingFace dataset](https://huggingface.co/datasets/PleIAs/common_corpus); [arXiv 2506.01732](https://arxiv.org/abs/2506.01732).

[^openwebsearch]: OpenWebSearch.eu, building an open European web index; 8.5 million euros under Horizon Europe (grant 101070014), fourteen research and computing centres across seven countries. [openwebsearch.eu](https://openwebsearch.eu/open-webindex/).

[^teuken]: Fraunhofer-led OpenGPT-X / Teuken-7B: a 7-billion-parameter model trained on roughly 4 trillion tokens across all 24 official EU languages, Apache-2.0. [Fraunhofer IAIS](https://www.iais.fraunhofer.de/en/industries_and_cross-sector_solutions/cross-sector_solutions/generative-ai/opengpt-x.html); [Teuken-7B on HuggingFace](https://huggingface.co/openGPT-X/Teuken-7B-instruct-v0.6).

[^eurollm]: EuroLLM family, trained on Spain's MareNostrum 5, covering all 24 official EU languages plus 11 more; the 22-billion-parameter model's technical report appeared in February 2026. [EuroLLM-9B](https://huggingface.co/blog/eurollm-team/eurollm-9b); [EuroLLM-22B](https://huggingface.co/blog/eurollm-team/eurollm-22b).

[^alia]: ALIA, Spain's publicly funded multilingual AI infrastructure (over 240 million euros), trained on MareNostrum 5; the Salamandra model family trained on 9.37 trillion tokens across 35 languages. [Barcelona Supercomputing Center](https://www.bsc.es/news/bsc-news/alia-europes-first-public-open-and-multilingual-ai-infrastructure).

[^poro]: Poro 34B (Silo AI / SiloGen and TurkuNLP), trained on the LUMI supercomputer to advance European low-resource languages, demonstrating cross-lingual transfer ("the blessing of multilinguality"). [LumiOpen/Poro-34B](https://huggingface.co/LumiOpen/Poro-34B); [arXiv 2404.01856](https://arxiv.org/pdf/2404.01856).

[^tildeopen]: TildeOpen LLM (Tilde, Latvia), an open foundational model (~30 billion parameters) focused on underrepresented Eastern European and Baltic languages, trained on LUMI and JUPITER via the EU's Large AI Grand Challenge. [tilde.ai/tildeopen-llm](https://tilde.ai/tildeopen-llm/).

[^europarl]: Philipp Koehn, ["Europarl: A Parallel Corpus for Statistical Machine Translation"](https://aclanthology.org/2005.mtsummit-papers.11/), MT Summit 2005: parallel European Parliament proceedings across 21 languages, roughly 50 million words per language.

[^eurlex]: JRC-Acquis and the EUR-Lex corpus: aligned EU legal text across more than 20 languages, with one English-side build exceeding 840 million tokens. [JRC-Acquis](https://joint-research-centre.ec.europa.eu/language-technology-resources/jrc-acquis_en).
