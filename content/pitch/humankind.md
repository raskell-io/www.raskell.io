+++
title = "Humankind"
description = "Keep the voice, stories, and values of someone you love, with every answer showing whether it was said, pieced together, or guessed."
path = "invest/humankind"
template = "venture.html"

[extra]
project = "humankind"
eyebrow = "Investor brief"
parent = { name = "Invest", url = "@/invest.md" }
contact_anchor = "talk-about-investing"
+++

Most families lose the texture of a person within two generations. The tools that try to keep it either print a book or build a chatbot that pretends to be someone. Humankind is a private, consent-first archive where a person and their family gather voice, stories, and memories, and where every answer drawn from that archive is labelled as recorded, reconstructed, or speculative.

## The problem

Photo apps and family trees keep names, dates, and pictures. They do not keep how someone told a story, what they found funny, or what they would say to a grandchild. That is usually gone one or two generations later, and often much sooner when memory starts to fade.

{% tiles(cols=2) %}
- **Adult children of ageing parents** They want to capture stories and a voice while there is still time, often right after a diagnosis such as dementia.
- **Families spread across countries** Grandchildren who meet their grandparents a few times a year, if at all.
- **People facing serious illness** They want to leave something truthful behind, on their own terms.
- **Care homes and hospices** They already run reminiscence and life-story work by hand. The results are rarely kept in a form anyone can use later.
{% end %}

## The product

The application is built: an Elixir and Phoenix LiveView app with Rust for audio, cryptography, image processing, and local embeddings.

{% tiles(cols=3) %}
- **A living archive** Text, audio, video, and photos, with transcription and guided prompts that suggest which memories are still missing.
- **Shared spaces** Family members contribute their own memories, with attribution, and guardians who can look after an archive.
- **A grounded persona** Conversations drawn only from the archive, with lenses for how a person speaks to a grandchild or to a student.
- **Voice, if consented** Optional voice synthesis from the person's own recordings, behind its own consent scope.
- **Stories** Narratives built from cited memories, exported as PDF or Markdown.
- **Yours to take** Encryption at rest, full deletion, and an export of the whole archive.
{% end %}

## The market

Market reports disagree, and some count digital estate management as "digital legacy", so these figures are context rather than the market Humankind addresses. The direction is consistent: people spend real money on keeping family memory, and the category is growing.

{% tiles(cols=3, variant="figures") %}
- **USD 15 to 25 bn** Global digital legacy market in 2025, growing about 14 to 16 percent a year. [Mordor Intelligence, Precedence Research](https://www.mordorintelligence.com/industry-reports/digital-legacy-market)
- **USD 7.3 bn** Genealogy products and services in 2025, forecast at USD 16.6 bn by 2032. [Kings Research](https://www.kingsresearch.com/genealogy-products-and-services-market-29)
- **104 m** Registered users at MyHeritage alone: family memory is a mass market. [Calcalist](https://www.calcalistech.com/ctechnews/article/syr4gmfmzl)
{% end %}

## Why now

{% tiles(cols=2, variant="figures") %}
- **22 %** Share of the EU population aged 65 or older in 2025, and rising every year. [Eurostat](https://ec.europa.eu/eurostat/statistics-explained/index.php/Population_structure_and_ageing)
- **57 m** People living with dementia worldwide, with nearly 10 million new cases a year. Memory has to be captured before it fades. [WHO via NIHR](https://www.dementiaresearcher.nihr.ac.uk/who-dementia-statistics/)
- **281 m** International migrants in 2024. Families live further apart than ever. [IOM World Migration Report](https://ruralindiaonline.org/en/library/resource/world-migration-report-2024/)
- **Aug 2026** EU AI Act transparency duties for chatbots and synthetic voice now apply. Humankind discloses by design. [Cooley](https://www.cooley.com/news/insight/2026/2026-08-03-eu-ai-act-transparency-obligations-take-effect-2-august-2026)
{% end %}

Transcription, retrieval, and voice synthesis have also become cheap enough that a small team can build what took funded companies years.

## What sets it apart

{% tiles(cols=2) %}
1. **Every answer shows where it comes from** Each memory and each answer is labelled recorded, reconstructed, or speculative, and a separate check audits generated text against its sources. Truth over fluency.
2. **Consent you can audit** Consent records are append-only and versioned, with separate scopes for data processing, persona conversations, stories, and voice. Nothing is overwritten.
3. **A family archive, not a solo recording** Several people contribute to one archive, each with attribution, and guardians cannot rewrite where a memory came from.
4. **The persona never claims to be the person** It says what it is, will not invent memories, and is built for preservation, not resurrection.
5. **Useful while the person is alive** Families share stories in circles today. Humankind is not only for after someone has died.
{% end %}

## Competition

| Company | What they do | How Humankind differs |
|---|---|---|
| StoryWorth | Weekly email prompts that become a printed book | Keeps voice and media, takes contributions from the whole family, and adds a persona with provenance |
| Remento | Spoken stories turned into books | A living archive, not only a book; every answer cites its sources |
| HereAfter AI | Interview-based life-story avatar in the person's voice | Recorded, reconstructed, and speculative material is labelled; consent scopes and guardians |
| StoryFile | Video question and answer avatars; filed for Chapter 11 in 2024 | Low-cost asynchronous capture and a full export, so the archive does not depend on the company |
| Project December | Chatbots built from a questionnaire about anyone | No persona without the subject's consent or a guardian's |
| Ancestry, MyHeritage | Family trees, records, DNA | Complementary: they record who someone was related to, Humankind records who someone was |

## Business model

{% tiles(cols=3) %}
- **Free** One archive and limited conversations, so a family can start without a decision.
- **Pro** Unlimited archives, voice, and story export.
- **Family** Shared spaces for everyone who wants to contribute.
- **Capture packages** A one-off package when a diagnosis comes and time matters.
- **Care partnerships** Pilots with hospices, care homes, and dementia charities that already do life-story work.
- **Preservation** A paid long-term tier with a guaranteed export and archive escrow.
{% end %}

The free, pro, and family tiers are planned in the product roadmap. Capture packages, care partnerships, and the preservation tier are the next options to test with families.

## Where it stands

- The application is built and tested: archive, consent, encryption, provenance, persona, voice, stories, and sharing.
- The website is live with a waitlist for early access.
- Next: production deployment in a Swiss or EU region, then a closed beta with families from the waitlist.

There are no paying users yet. This is an early ticket into a product that exists, before the market has seen it.

## Risks

{% tiles(cols=2) %}
- **Emotional harm** Research on "deadbots" warns of manipulation and dependency. Humankind requires consent, rules out addictive patterns and advertising, and will add ways to retire a persona with dignity.
- **Public scepticism** Many people reject AI recreations of the dead. Humankind is positioned on preservation and on sharing while alive, not on talking to the dead.
- **Regulation** Rules for data of deceased people differ by country, and the AI Act requires disclosure. Guardians with a documented scope and a self-disclosing persona answer both.
- **Longevity** A memory company that disappears takes the memories with it. Full export exists today; open formats and escrow are planned.
{% end %}

## What funding would do

{% tiles(cols=2) %}
1. **Launch** Production deployment in a Swiss or EU region, with backups and monitoring.
2. **Closed beta** Families from the waitlist, and structured interviews about what they keep and why.
3. **Care pilots** One or two hospices or care organisations, run with an ethics advisor.
4. **Billing** The free, pro, and family tiers.
5. **Trust** An AI Act compliance pass for synthetic voice, open export formats, and archive escrow.
6. **Mobile capture** An app for recording voice and stories offline, where the conversations happen.
{% end %}

## Talk about investing

{% panel(eyebrow="Open to investment", title="Back Humankind early.", contact=true) %}
I am looking for angels and funds who care about doing this carefully. Send me a short message with who you are and what you would like to see first. More on how I work with investors on the [Invest](/invest/) page.
{% end %}
