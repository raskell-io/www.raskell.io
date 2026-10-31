+++
title = "The Original Data Company"
date = 2026-11-07
draft = true
description = "Insurers say they are not tech companies. Yet an insurer sells a prediction wrapped in a promise, and has since a 1693 life table: the original data company."

[taxonomies]
tags = ["insurance", "finance", "cryptocurrency", "trust", "machine-learning", "history-of-technology", "determinism"]

[extra]
author = "Raffael"
reads = ["debt", "the-black-swan", "antifragile", "skin-in-the-game", "geld-aus-dem-nichts", "wer-regiert-das-geld"]
in_short = [
  "Insurers and banks that say they are not tech companies misunderstand their own product: an insurer is a technology company that happens to hold a balance sheet, and the oldest data company there is.",
  "Money, policies and accounts are abstract records of trust, and I define technology as the formalisation of trust into procedure, something that happens the same way every time and can be checked.",
  "Halley's 1693 life table already had the whole architecture of insurance: a collected dataset, a model fitted to it, and a price derived from the model; underwriting, pricing, reserving and capital modelling are all prediction.",
  "The data that defines risk is moving into cars, phones, wearables and buildings, so whoever sees the road can price the risk best, and agents fit the symbolic world insurers already live in.",
  "Capital, float and regulation make the promise credible but do not decide who wins, so insurers should own their models and data, treat procedures as code, and let agents explore while keeping what works.",
]
+++

"We are not a tech company." I have heard the sentence in meetings at the insurer I work for, which since a recent merger is also a bank, and before that at a bank where I worked, said by smart, experienced people, usually as a reason: for why a platform does not need to be built in-house, why engineering is a cost to be contained, why the interesting work happens somewhere else. Every time, I am baffled, because I think the opposite is true. An insurer is not a financial company that happens to use technology. It is a technology company that happens to hold a balance sheet, and in a precise sense it is the oldest data company there is.

This post is the argument for that. It builds on [The River and the Canal](/articles/the-river-and-the-canal/), which ended with the observation that banks and insurers sell sameness, and on a note about why [trust is earned by sameness](/notes/trust-is-earned-by-sameness/). It is not a post about monetary politics, although it starts with money, because money is where the abstraction begins.

## Abstract businesses

You cannot touch an insurance policy. You cannot touch a bank account either, or a pension, or a share in a fund. What these businesses sell is abstract: a promise that something will happen in a certain way when certain conditions are met. A large part of the economy, most of what economists call the service sector, works like this, even when it does not look alike from the outside. A bank, an insurer, a broker, a payment provider and a land registry have different products and the same substance. They sell kept promises.

Money itself is the deepest example. The textbook story says that people bartered until someone invented coins, and that credit came later. David Graeber's [*Debt: The First 5,000 Years*](https://en.wikipedia.org/wiki/Debt:_The_First_5000_Years) takes that story apart: "In fact, our standard account of monetary history is precisely backwards. We did not begin with barter, discover money, and then eventually develop credit systems. It happened precisely the other way around. What we now call virtual money came first." Credit systems, ways of keeping account of who owes what to whom, are documented in Mesopotamia thousands of years before coinage appeared, between roughly 600 and 500 BCE. Money, in that reading, started as a record of trust, and it still is one. A currency is worth what people believe it is worth, which is why the more accurate word for it is the old one, credit, from the Latin *credere*, to believe.

How that record is created today is less mysterious than it sounds, and less public than most people assume. In 2014 the Bank of England published a short article in its Quarterly Bulletin, ["Money creation in the modern economy"](https://www.bankofengland.co.uk/quarterly-bulletin/2014/q1/money-creation-in-the-modern-economy), explaining that most money in a modern economy takes the form of bank deposits, and that the principal way those deposits are created is commercial banks making loans. The Swiss economist [Mathias Binswanger](https://www.fhnw.ch/de/personen/mathias-binswanger) built a whole book on the consequences, *Geld aus dem Nichts* (*Money Out of Nothing*, 2015). Its first chapter, on how commercial banks create money, opens under a heading that says it all: "the false idea of banks as financial intermediaries" (*"Die falsche Vorstellung von Banken als Finanzintermediäre"*). The journalist Paul Schreyer takes the argument further in *Wer regiert das Geld?* (*Who Governs Money?*, 2016):

> All the decision-making power and sovereignty of a society comes down to two simple questions: Who may create money? And who decides how it is used?
>
> *Alle Entscheidungsgewalt und Souveränität einer Gesellschaft läuft auf zwei simple Fragen hinaus: Wer darf das Geld erschaffen? Und wer entscheidet über seine Verwendung?*

There is a large and heated debate about what this means for states and democracies, and I find it important, but it is not the subject here. The point I need is simpler: even the most basic product of the financial industry is an abstraction, a carefully maintained record of trust.

## What these businesses are for

Nobody wrote a mandate for banks and insurers, and yet they fulfil one. Every society has to answer two questions, again and again, and it has never managed to answer them without institutions. Where should its resources go? And who carries the cost when something goes wrong that nobody could have foreseen? Economists have names for the two functions. The first is **capital allocation**, or financial intermediation: deciding which of all the possible futures gets funded. The second is **risk pooling**, or mutualisation: spreading the cost of misfortunes that strike a few across the many who might have been struck. Banks do the first, insurers the second. Both look as if they had been designed by the collective body we call humanity, and in a sense they were, slowly, by trial and error, over centuries.

Joseph Schumpeter saw the first function more clearly than anyone. In *The Theory of Economic Development* he describes the banker not as a middleman who passes on other people's savings but as the one who decides which new ventures happen at all: "He makes possible the carrying out of new combinations, authorises people, in the name of society as it were, to form them. He is the ephor of the exchange economy." An ephor was a magistrate in ancient Sparta. Schumpeter's point is that by deciding whom to lend to, banks decide, on society's behalf, what gets built and how a civilisation grows.

The second function is just as old and just as social. Before there were insurers, there were families and clans that absorbed the loss when one member's house burned down, guilds that supported members who fell ill, villages with common funds for fire and flood. Taleb, in *Skin in the Game*, calls that kind of in-group protection a form of self-insurance, "something that can only work for a limited number of people and can’t be universalized". An insurer is what you get when it is universalised: the same thing done with strangers, at scale, under contract: everyone pays a little so that nobody has to pay everything. Social insurance does it through the state. The principle underneath is the same in all of them, a kind of solidarity made calculable.

Both functions are fractal, which by now will surprise nobody who has read [Everything is a fractal](/notes/everything-is-a-fractal/). A person decides where to put their time, attention and money. A family decides which child goes to which school and who takes over the farm. A tribe decides who hunts and who stays. A company decides which products to fund, a bank which companies, a society which industries. At every scale it is the same act: placing bets on the future with limited resources, and sharing the losses of the bets that fail.

And at every scale the bet needs someone willing to take the other side. When Christopher Columbus wanted to sail west across an ocean whose far side nobody in Europe could chart, he spent years looking for backers, until the Crown of Castile agreed, persuaded and helped by [Luis de Santángel](https://en.wikipedia.org/wiki/Luis_de_Sant%C3%A1ngel), a royal finance official who arranged much of the money. That is Knight's uncertainty in its purest form: no table of similar voyages, no measurable odds, only judgement and a willingness to lose. Somebody chose to take the bet. Every bank loan to a new venture is a smaller version of that choice.

Nassim Nicholas Taleb has spent a series of books on what happens at the edges of these functions. *The Black Swan* is about events defined by "rarity, extreme impact, and retrospective (though not prospective) predictability", which is exactly where lending and insurance fail most painfully. Taleb is unusually kind to one part of the industry. Reinsurers, who carry the catastrophe risks that primary insurers pass on, are in his account, "unlike bankers", "introspective enough to know that it actually could have been far worse, because the past twenty years did not have a big catastrophe, and all you need is one of those per century to kiss the business good-bye." *Skin in the Game* starts from the code of Hammurabi, which punished a builder whose house collapsed on its owner, because "the best place to hide risks is “in the corners,” in burying vulnerabilities to rare events that only the architect (or the trader) can detect." Insurance has a famous example of the opposite: for most of its history, the individual members who backed policies at Lloyd's, the Names, were liable with everything they owned. And *Antifragile* draws the distinction that matters most for an institution whose job is to absorb other people's shocks: "The resilient resists shocks and stays the same; the antifragile gets better."

The point for this argument is what all of these functions have in common. Whether it is a banker choosing a borrower, an underwriter pricing a ship, or a reinsurer pricing a hurricane, the work is the same: assessing the world, putting numbers on it, and deciding which promise to make to whom at what price. Society delegated two of its most important decisions to institutions whose core activity is calculation. That is the next step in the argument.

## What technology actually is

If the product is a record of trust, what does it take to produce one well? Mostly, it takes doing the same thing every time. In the trust note I described the two halves of that: **consistency**, the same input giving the same outcome over time, and **integrity**, the thing being whole and being what it claims to be. A bank that books your payment differently depending on the clerk, or an insurer whose policy means something different from what its documents say, has nothing left to sell.

That is also my working definition of technology, at least the kind that matters here. Strip away the hardware, and technology is the formalisation of trust into procedure: taking something you would otherwise have to believe and turning it into something that happens the same way every time and can be checked. A ledger is a technology in this sense, so is double-entry bookkeeping, so is a database transaction, and so is a workflow engine. In [The River and the Canal](/articles/the-river-and-the-canal/) I described how every layer of computing made one more thing predictable so that the people above it could stop thinking about it. Financial institutions were doing that with paper, people and procedures long before computers existed, and when computers arrived, banks and insurers were among their earliest commercial users, because they were already in the business computers are for.

So my claim is that abstract businesses always were technology companies, rather than that they should become them, and that the sentence "we are not a tech company" is a misunderstanding of their own product. Of all of them, the insurer is the clearest case.

## Bitcoin, or trust without an institution

If technology is formalised trust and money is a record of trust, then sooner or later someone was going to try to formalise money itself, all the way down, until no institution was left. On 31 October 2008, six weeks after Lehman Brothers collapsed and exactly eighteen years before I started writing this post, someone calling themselves Satoshi Nakamoto sent a short message titled ["Bitcoin P2P e-cash paper"](https://www.metzdowd.com/pipermail/cryptography/2008-October/014810.html) to a mailing list for cryptographers. The paper it linked, ["Bitcoin: A Peer-to-Peer Electronic Cash System"](https://bitcoin.org/bitcoin.pdf), states its aim in its first sentence: "A purely peer-to-peer version of electronic cash would allow online payments to be sent directly from one party to another without going through a financial institution." A few paragraphs later it names what it wants to replace: "What is needed is an electronic payment system based on cryptographic proof instead of trust." When the network started in January 2009, its very first block carried a line from that day's front page of *The Times*: "Chancellor on brink of second bailout for banks."

That is why Bitcoin, and the wider idea of a distributed ledger or blockchain that it introduced, caused the fuss it did. It went straight at the heart of what abstract financial institutions do. Banks keep the ledger of who owes what, which Graeber shows is the oldest form of money there is. Central banks and, as the Bank of England explains, commercial banks decide how much money exists. Bitcoin replaced the first with a public ledger that every participant can check and nobody can quietly rewrite, and the second with an algorithm: new coins appear on a fixed schedule, halving every 210,000 blocks, until the supply approaches 21 million and stops. In the terms of this post, it is my definition of technology taken to its extreme, trust formalised so completely that the trusted institution is no longer needed. It is also the purest answer anyone has given to Schreyer's first question, who may create money: nobody, only the protocol.

What happened next is just as instructive. Within a few years an industry of exchanges, custodians and brokers grew up around the protocol, because most people did not want to hold their own keys, verify their own transactions or have no one to call when something went wrong. The crypto broker I mentioned in [The River and the Canal](/articles/the-river-and-the-canal/) sells exactly what banks sell: sameness, safekeeping, a promise. Bitcoin answered who may create money; it did not answer Schreyer's second question, who decides how it is used, nor the questions of what gets funded and who carries the cost of misfortune. Those functions, capital allocation and risk pooling, are still performed by institutions that crunch numbers about the world, which is the argument of this post.

And then there is the question I find hardest to let go of: who actually invented it. Satoshi Nakamoto stopped communicating publicly in the early 2010s, and the identity has never been established; a British court ruled in 2024 that one well-known claimant, Craig Wright, is not Satoshi. My own speculation, and I want to be clear that it is speculation and nothing more, is that it may have come from inside an intelligence agency, the NSA perhaps, or another one. The hints people point to are thin but real: the hash function at the core of Bitcoin, SHA-256, belongs to the [SHA-2 family designed by the NSA](https://en.wikipedia.org/wiki/SHA-2) and published as a federal standard in 2001 and 2002, and an NSA research report from 1996, "How to Make a Mint: The Cryptography of Anonymous Electronic Cash", had studied anonymous digital money more than a decade earlier. None of that is evidence; SHA-256 was public and widely used, and the electronic cash literature was well known among cryptographers. I hold the idea the way I hold the factory under the sea: as a thought experiment worth turning over. If it were true, it would be the strangest twist of all, an institution building the tool designed to make institutions unnecessary.

## The original data company

In 1693 the astronomer Edmond Halley, of the comet, published a paper in the *Philosophical Transactions of the Royal Society* with a dry title: "An Estimate of the Degrees of the Mortality of Mankind". He had been sent birth and death records from the city of Breslau, and from them he built a life table: of a group of people born in the same year, how many survive to each age. Then he did something new with it. He used the table to calculate what a life annuity should cost, how much a person of a given age should pay for an income until death. Halley's recommendations to the English crown were ignored for decades, but the method was not. A collected dataset, a statistical model fitted to it, and a price derived from the model: that is the whole architecture of insurance, and of every data company since, written down three centuries before anyone said "big data".

The rest of the toolkit arrived around the same time. In 1654 Blaise Pascal and Pierre de Fermat had worked out the mathematics of chance in a correspondence about gambling. In 1713 Jacob Bernoulli's posthumous *Ars Conjectandi* gave the law of large numbers, the reason an insurer can be confident about a thousand houses while knowing nothing about any single one. And in the late 1680s, in Edward Lloyd's coffee house in London, merchants and ship owners gathered for the most valuable thing the house offered, reliable shipping news, and the people who underwrote voyages there became [Lloyd's of London](https://en.wikipedia.org/wiki/Lloyd%27s_of_London). The house also gave its name to *Lloyd's List*, a shipping newspaper. The first great insurance market grew up around an information service.

Frank Knight, whom I leaned on in the river essay, explains why this works. Risk, in his sense, is uncertainty you can measure across many similar cases, and measurable risk can be insured. An insurer is a machine for turning measurable risk into procedure. Its entire edge is measuring better than the next insurer.

## Modelling the model

Look at what an insurer actually does all day, and translate it.

| What the insurer calls it | What a tech company would call it |
|---|---|
| Underwriting | predicting the probability and size of a loss for one customer |
| Pricing | a model that turns that prediction into a price that holds across a portfolio |
| Claims handling | a high-volume workflow with fraud detection and exception handling |
| Reserving | forecasting what is already owed but not yet known |
| Capital modelling | simulating the whole balance sheet under thousands of scenarios |
| Reinsurance | buying protection from someone who models your models |
| Distribution | a funnel, a recommender and a customer interface |

None of these rows is a metaphor. Pricing is a model fitted to data. Reserving is a forecast. Capital modelling is simulation, and regulators require it. Under the [Swiss Solvency Test](https://www.finma.ch/en/supervision/insurers/cross-sectoral-tools/swiss-solvency-test-sst/), for example, an insurer has to quantify its risks on its whole balance sheet every year, with a standard model or, where that does not fit its risks, an internal model of its own that the supervisor approves. Solvency II in the European Union works on the same principle. Since Hurricane Andrew in 1992, which bankrupted several insurers that had priced storms from past claims, and the Northridge earthquake two years later, property insurers have relied on catastrophe models that simulate hurricanes, earthquakes and floods across their portfolios.

And there is a fractal in it, which I cannot resist. An insurer models the world. A reinsurer, the insurer of insurers, models the insurers' models. A regulator models the reinsurers and insurers to decide how much capital the whole system needs. Each layer is the same activity one scale up: build a model of the layer below, find where it is wrong, and put a price on the error.

{% diagram(title="An insurer as a prediction pipeline") %}
   ┌────────────────────────────┐
   │ data about the world       │  claims history, exposure, weather,
   │                            │  vehicles, buildings, health
   └─────────────┬──────────────┘
                 ▼
   ┌────────────────────────────┐
   │ model                      │  probability and size of loss,
   │                            │  per customer and per portfolio
   └─────────────┬──────────────┘
                 ▼
   ┌────────────────────────────┐
   │ price and promise          │  the policy: a prediction wrapped
   │                            │  in a contract
   └─────────────┬──────────────┘
                 ▼
   ┌────────────────────────────┐
   │ procedure                  │  claims handled the same way,
   │                            │  every time, for decades
   └─────────────┬──────────────┘
                 ▼
   ┌────────────────────────────┐
   │ outcomes                   │  feed the next model
   └────────────────────────────┘
{% end %}

Every step in that pipeline is technology in the sense I defined: either a model that makes a prediction, or a procedure that keeps a promise the same way every time. The balance sheet sits underneath as the backstop that makes the promise credible. It is not the product.

## Who sees the road

If the edge of an insurer is measuring better, then the most important question about its future is who has the best measurements. For most of history the answer was the insurer itself: it had the claims history, the actuaries and the tables. That is changing, and the clearest example is the car.

A modern car is a sensor platform that happens to have wheels. It knows how hard you brake, how fast you take corners, whether you use your seat belt and what time of night you drive. Tesla already sells insurance in parts of the United States that is priced from exactly that. Its [real-time insurance](https://tesla.com/support/insurance/real-time-insurance) computes a Safety Score from the vehicle's own data, without any extra device, and adjusts the premium monthly according to the score and the miles driven.

George Hotz saw the same thing from a stranger angle. He became famous for jailbreaking the iPhone and the PlayStation 3, then founded [comma.ai](https://comma.ai/), which makes an open-source driver-assistance system that people retrofit into their cars. In interviews, including [his conversation with Lex Fridman](https://lexfridman.com/george-hotz/), he has floated the idea that comma's real long-term business could be insurance: a company whose devices see how millions of miles are driven knows who is a good driver better than any insurer working from age, postcode and claims history. Whether comma ever does it matters less than the logic, which is airtight. Whoever has the best model of the risk can offer the best price for it, and the best model goes to whoever sees the road.

The same logic applies far beyond cars. Phones know how people move, watches know how they sleep and how their hearts behave, buildings increasingly know when their pipes leak. Every one of those sensors is, potentially, an underwriting model held by someone who is not an insurer. An insurer that believes it is not a tech company is a company that has not yet noticed who its real competitors are.

## Banks and brokers, briefly

The argument transfers, with different nouns. A bank's core decision, whether to lend, is a prediction: will this borrower pay back? Credit scoring, which FICO turned into a general-purpose score in the United States in 1989, is a model, and modern lenders run on far richer ones. Payments are a giant, real-time fraud-detection problem. Trading desks are models and execution engines. A broker is a matching and routing system with a promise of fair execution attached. Each of them sells a prediction or a procedure, wrapped in trust, backed by capital. The balance sheet is what makes the promise believable. The technology is what makes it true.

## Why the sentence persists

If the argument is so clear, why do intelligent people in these companies keep saying "we are not a tech company"? I think there are three reasons, and none of them is stupidity.

The first is accounting. In most banks and insurers, IT grew up as a cost centre that served "the business", and the organisation chart still reflects that. Conway's law, which I wrote about in [The River and the Canal](/articles/the-river-and-the-canal/), does the rest: a company organised as if technology were a supporting function builds systems that behave like one, which then confirms the belief.

The second is identity. "Tech company" in public imagination means Silicon Valley: consumer apps, hoodies, growth at any cost, a habit of breaking things. A Swiss insurer that has kept its promises for a century and a half does not want to be that, and it is right not to. But the fix is a better definition of technology, not a rejection of it. Keeping promises consistently for a century and a half is a technical achievement.

The third is that the technology in these companies is old enough to have become invisible. The ratchet I described in the river essay applies here too: once a layer works, nobody sees it any more. Nobody in an insurer marvels at the actuarial tables, the policy administration system or the claims workflow, the way nobody marvels at running water. They are simply how things are done. Marc Andreessen wrote in 2011 that software was eating the world. For insurers, it was eaten long ago and has been digesting ever since.

## Why it matters now

This would be a curiosity if nothing were changing. Two things are.

The first is the sensors, as above. The data that defines risk is moving out of insurers' hands and into cars, phones, wearables and buildings. An insurer that does not think of itself as a data company will wake up as a balance sheet that someone else's model rents.

The second is agents. In the river essay I argued that language agents are strongest in the symbolic world, the world of documents, contracts, procedures and code, and that this is exactly where banks and insurers already live. Their products are contracts and their factories are procedures. That makes them the companies most exposed to what agents can do, and also the companies best placed to benefit, if they treat agents as a new kind of engineering and not as a new kind of vendor. An insurer that sees itself as a technology company will ask how to let agents explore its claims, its underwriting and its operations, and how to turn what they find into procedures it can trust. An insurer that sees itself as something else will buy a chatbot.

## The honest counterargument

There is a real objection, and it deserves a real answer. Insurers are not only models. They hold risk capital, which no software company does. A large part of their profit comes from investing the premiums they collect before claims are paid, what Warren Buffett calls the float, money an insurer holds but does not own. They are regulated as financial institutions, and their brands are built on solidity, not on code. Surely that makes them financial companies first?

I think it makes them financial companies too, which is not the same thing. Capital is what makes the promise credible: without it, a prediction is just an opinion. The float is a consequence of the timing of the promise. Regulation exists because the promises matter so much. But none of those things is what the customer buys, and none of them decides whether one insurer beats another. Two insurers with the same capital and the same regulator win or lose on who measures risk better, prices it better and keeps the promise more consistently and more cheaply. Those are all technical problems. Buffett himself has warned that float can be drowned by poor underwriting results, which is another way of saying that the model comes first.

## What changes if you accept it

If an insurer is a technology company, a few things follow, and none of them requires hoodies.

- **Own the models.** Pricing, underwriting, claims triage and capital models are the product. Outsourcing them is outsourcing the business.
- **Own the data, and the context around it.** Including the data about your own systems, which is the argument of [IT Intelligence](/articles/it-intelligence/): a company that cannot answer questions about itself cannot build reliable technology on top of itself.
- **Treat engineers, actuaries and data scientists as one craft.** They are doing the same thing with different tools: turning uncertainty into procedure.
- **Make procedures first-class.** Claims and underwriting procedures are code, whether they are written down in a manual or in a workflow engine. Treat them like code: versioned, tested against past cases, replayable.
- **Go where the sensors are.** Partner with the companies that see the road, the home and the body, or become one.
- **Let agents explore, and keep what works.** The insurer's oldest skill, turning measured risk into a procedure that runs the same way every time, is exactly the skill the agentic era needs.

## Closing

Halley's life table was a dataset, a model and a price. Lloyd's was an insurance market built around a news service. Every policy since has been a prediction wrapped in a promise, and every claims department a procedure designed to keep that promise the same way, every time. That is technology in the only sense that matters for these businesses: the formalisation of trust. Insurers do not need to become tech companies. They need to notice that they already are, and that the competition for the next model of the world has already started, often in companies that do not call themselves insurers at all.

## References

- David Graeber, *Debt: The First 5,000 Years*, Melville House, 2011, updated and expanded edition 2014.
- Michael McLeay, Amar Radia and Ryland Thomas, [Money creation in the modern economy](https://www.bankofengland.co.uk/quarterly-bulletin/2014/q1/money-creation-in-the-modern-economy), Bank of England Quarterly Bulletin, 2014 Q1.
- Mathias Binswanger, *Geld aus dem Nichts: Wie Banken Wachstum ermöglichen und Krisen verursachen* (Money Out of Nothing: How Banks Enable Growth and Cause Crises), Wiley-VCH, 2015; translations are mine.
- Satoshi Nakamoto, [Bitcoin: A Peer-to-Peer Electronic Cash System](https://bitcoin.org/bitcoin.pdf), 2008, and the [announcement on the cryptography mailing list](https://www.metzdowd.com/pipermail/cryptography/2008-October/014810.html), 31 October 2008.
- [The Bitcoin genesis block](https://en.bitcoin.it/wiki/Genesis_block) and its embedded *Times* headline.
- [SHA-2](https://en.wikipedia.org/wiki/SHA-2), the hash function family designed by the NSA and standardised by NIST.
- Laurie Law, Susan Sabett and Jerry Solinas, "How to Make a Mint: The Cryptography of Anonymous Electronic Cash", National Security Agency, 1996.
- Paul Schreyer, *Wer regiert das Geld? Banken, Demokratie und Täuschung* (Who Governs Money? Banks, Democracy and Deception), Westend, 2016; translations are mine.
- Joseph A. Schumpeter, *The Theory of Economic Development*, 1911, English translation 1934; the banker quote as cited in [Festré and Nasica, MPRA paper 67694](https://mpra.ub.uni-muenchen.de/67694/1/MPRA_paper_67694.pdf) from the 1983 edition, p. 74.
- [Risk pool](https://en.wikipedia.org/wiki/Risk_pool), on pooling and mutualisation.
- [Luis de Santángel](https://en.wikipedia.org/wiki/Luis_de_Sant%C3%A1ngel), on the financing of Columbus's first voyage.
- Nassim Nicholas Taleb, [*The Black Swan*](https://en.wikipedia.org/wiki/The_Black_Swan:_The_Impact_of_the_Highly_Improbable) (2007), [*Antifragile*](https://en.wikipedia.org/wiki/Antifragile_(book)) (2012) and [*Skin in the Game*](https://en.wikipedia.org/wiki/Skin_in_the_Game_(book)) (2018).
- Edmond Halley, [An Estimate of the Degrees of the Mortality of Mankind](https://ui.adsabs.harvard.edu/abs/1693RSPT...17..596H/abstract), *Philosophical Transactions of the Royal Society* 17, 1693, pp. 596 to 610.
- Jacob Bernoulli, *Ars Conjectandi*, 1713.
- [Lloyd's of London](https://en.wikipedia.org/wiki/Lloyd%27s_of_London), on its origins in Edward Lloyd's coffee house.
- Frank H. Knight, [*Risk, Uncertainty, and Profit*](https://www.econlib.org/library/Knight/knRUP.html), 1921.
- Tesla, [Real-Time Insurance](https://tesla.com/support/insurance/real-time-insurance) and the Safety Score.
- [comma.ai](https://comma.ai/) and the [Lex Fridman podcast with George Hotz](https://lexfridman.com/george-hotz/).
- On catastrophe modelling after Hurricane Andrew: [Insurance Journal, Lessons Learned from Hurricane Andrew](https://www.insurancejournal.com/magazines/mag-features/2017/09/04/462873.htm).
- FINMA, [Swiss Solvency Test](https://www.finma.ch/en/supervision/insurers/cross-sectoral-tools/swiss-solvency-test-sst/).
- [The History of the FICO Score](https://blog.myfico.com/history-of-the-fico-score/).
- Marc Andreessen, "Why Software Is Eating the World", *The Wall Street Journal*, 2011.
- Warren Buffett, letters to Berkshire Hathaway shareholders, on insurance float.
