+++
title = "Cyanea"
description = "Bioinformatics analyses that stay versioned and runnable, in the browser or on a server the institution controls, so the data does not have to move."
path = "invest/cyanea"
template = "venture.html"

[extra]
project = "cyanea"
eyebrow = "Investor brief"
parent = { name = "Invest", url = "@/invest.md" }
contact_anchor = "talk-about-investing"
+++

Most published biology notebooks no longer run: in one study of more than ten thousand of them, fewer than one in ten gave the same results again. Cyanea stores each analysis with its exact data and versions, and runs it on WebAssembly in the browser or on a node the institution controls, so sensitive data does not have to leave. It is open source, built on 18 tested Rust libraries, and in public alpha now.

## The problem

Analyses do not survive their authors. Dependencies drift, data links die, and nobody can say which version of which file produced a figure. When a student leaves, the work leaves with them.

{% tiles(cols=3) %}
- **Academic labs** A principal investigator and a handful of trainees, with reviewers asking for reproducibility and results that disappear at every graduation.
- **Core facilities** They deliver analyses to many client labs and need versioned results they can hand over and defend.
- **Biotech teams** Small computational groups of 5 to 20 people that need standard analyses, an audit trail, and fast onboarding. The first paying buyer.
- **Consortia and pharma** Several sites that need to share methods without moving patient or proprietary data.
- **Teaching** Zero-install notebooks and a learning curriculum: the top of the funnel.
{% end %}

## The product

{% tiles(cols=3) %}
- **Spaces** Datasets, notebooks, protocols, and results that version together, with cell-level diffs and restore.
- **Pinned inputs** Every data file is stored by its SHA-256 hash, and results link back to the cells, code versions, and data that made them.
- **Runs in the browser** Notebook cells run on WebAssembly in a worker, with nothing to install. Six browser tools inspect sequences, alignments, FASTQ, VCF, and trees without the file ever leaving the machine.
- **A Rust analysis core** 18 Apache-licensed crates with about 3,700 tests, from sequences and alignment to single-cell, phylogenetics, and proteomics.
- **21 formats built in** FASTA and FASTQ to VCF, BAM, Parquet, PDB, and Newick, recognised and indexed on upload.
- **Built for teams** Organisations and roles, live presence, a REST API with webhooks, Jupyter import, and ORCID login.
{% end %}

Federation lets self-hosted nodes publish selected spaces to each other as content-hashed manifests, so a method can travel while the data stays home.

## The market

Market reports define bioinformatics differently; these figures are context. No reliable figure exists for scientific notebooks on their own, and this page does not invent one.

{% tiles(cols=3, variant="figures") %}
- **USD 23.5 bn** Global bioinformatics in 2025, growing 13 percent a year to USD 43.5 bn by 2030. [BCC Research](https://www.bccresearch.com/market-research/biotechnology/bioinformatics-technologies-and-global-markets-bio051g.html)
- **USD 8.0 bn** Computational biology in 2025, projected at USD 22.7 bn by 2034. [Global Market Insights](https://www.gminsights.com/industry-analysis/computational-biology-market)
- **USD 4.2 bn** Bioinformatics services in 2025, growing 16 percent a year. [Persistence Market Research](https://www.persistencemarketresearch.com/mediarelease/bioinformatics-services-market.asp)
{% end %}

## Why now

{% tiles(cols=2, variant="figures") %}
- **8.5 %** Notebooks from biomedical papers that reproduced identical results: 879 of 10,388. [GigaScience 2024](https://pmc.ncbi.nlm.nih.gov/articles/PMC10783158/)
- **70 %+** Researchers who have failed to reproduce another scientist's experiment. [Nature survey](https://www.nature.com/articles/533452a)
- **2025/327** The EU health data regulation requires secure processing environments for secondary use; Swiss law treats genetic data as sensitive. Analysis has to go to the data. [Belgian Health Data Agency](https://www.hda.belgium.be/en/news/regulation-european-health-data-space-published)
- **800+** Life-sciences companies in the Basel area, next door to Cyanea. [BaselArea](https://baselarea.swiss//wp-content/uploads/2023/01/Fakten-uber-die-Life-Sciences-DE_2025-1.pdf)
{% end %}

WebAssembly now runs Rust at native-like speed in the browser: Cyanea's FASTA parser reads about 2.4 GB per second, roughly six times BioPython, with results identical to the digit. And as AI makes analysis code cheap, the scarce asset becomes the trusted record of what was run on what.

## What sets it apart

{% tiles(cols=2) %}
1. **Runs where you are** Analyses run in the browser with nothing to install, or on a server the institution controls.
2. **Every input pinned** Content-addressed data and versioned notebooks, so a result points to exactly what made it.
3. **Share the method, not the data** Self-hosted nodes publish selected spaces to each other; patient data stays where it is.
4. **One validated core everywhere** The same Rust crates run on the server, in the browser, and in Python, validated against BioPython.
5. **Open by default** The node and the libraries are Apache 2.0, and self-hosted nodes have no plan limits.
{% end %}

## Competition

| Company | What they do | How Cyanea differs |
|---|---|---|
| Galaxy | Open web platform for tool workflows, run on servers | Code notebooks and versioned data in one space, browser execution, and federation |
| Jupyter, Google Colab | General notebooks; Colab runs on Google servers | Data and versions travel with the notebook, with no upload to a third party |
| marimo, Observable, Deepnote | Reactive or hosted notebooks, general purpose | Bioinformatics-native, with Rust libraries and 21 formats built in |
| Posit | R and Python IDE and enterprise server | No install; provenance and data versioning are core objects |
| Seqera (Nextflow) | Pipeline orchestration on HPC and cloud | Cyanea keeps the record of interactive analysis and is designed to take in pipeline results |
| DNAnexus, Terra | Cloud genomics platforms that host your data | Data can stay on the institution's own node |
| Code Ocean | Containerised capsules for reproducible papers | Lighter: browser execution, no containers, federated sharing |
| Latch Bio | Hosted workflows and no-code interfaces for biotech | Open source, self-hostable, and local-first |

## Business model

Open core: self-hosting is free, and the hosted hub charges for what self-hosting cannot replace. Billing and plan limits are built.

{% tiles(cols=2, variant="figures") %}
- **USD 0** Free: public spaces, browser execution, and 1 GB.
- **USD 98** Pro, per user and month: private spaces, 100 GB, and server compute credits.
- **USD 499** Team, per workspace and month: 1 TB, five seats, and audit export.
- **USD 15k+** Enterprise, per year: on-premise or air-gapped deployment and support.
{% end %}

Go-to-market starts with three to five design partners, two academic labs and one biotech group, each bringing one real analysis, with free Pro or Team plans for a year in exchange for feedback. Core facilities and Swiss and EU groups for whom data residency is a hard rule are the natural first buyers.

## Where it stands

{% tiles(cols=3, variant="figures") %}
- **Public alpha** The hosted hub and website are live at cyanea.bio.
- **3,700** Tests across 18 open-source Rust crates, published on crates.io.
- **10** Seeded starter spaces, one per domain, plus six browser tools.
{% end %}

There are no paying customers or design partners yet. Python and R cells are accepted but do not run yet, and the self-hosted node still depends on a core library that will be opened. These are the first things funding goes into.

## Risks

{% tiles(cols=2) %}
- **"A toy in the browser"** Biologists work in Python and R. Python execution and GB-scale server compute are the first priority; the server path already exists.
- **Self-hosting depends on a private core** Opening the core library is on the plan before the first enterprise sale.
- **Federation trust** Manifests are content-hashed today; cryptographic signing comes next.
- **Open source and revenue** The hub charges for managed compute, the network, governance, and support, which self-hosting does not replace.
- **One founder, wide scope** The strategy cuts breadth on purpose and leads with reproducible analysis, not with crate counts.
- **Compliance buyers** Regulated customers need SOC 2 or HIPAA. Planned for the enterprise phase.
{% end %}

## What funding would do

{% tiles(cols=3) %}
1. **Months 0 to 3** Run records with one-click re-run and diffs, a provenance graph, Python in the browser and on the server, and three to five design partners.
2. **Months 3 to 6** GB-scale server compute, review and approval, audit export, Nextflow and Snakemake import, and first paid teams.
3. **Months 6 to 9** A federated re-run across two nodes, signed manifests, SSO, a path to SOC 2, and an open core library.
{% end %}

## Talk about investing

{% panel(eyebrow="Open to investment", title="Back Cyanea early.", contact=true) %}
I am looking for angels and funds who know life sciences or scientific software, and for labs and core facilities that want to be design partners. Send me a short message with who you are and what you would like to see first. More on the [Invest](/invest/) page.
{% end %}
