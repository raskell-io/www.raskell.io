---
title: "The River and the Canal"
url: https://raskell.io/articles/the-river-and-the-canal/
author: Raffael Schneider
date: 2026-10-31
description: "Agents explore the rugged world; workflows are what exploration leaves behind. Chess, StarCraft, a factory under the sea, and why I build an engine."
tags: [agents, game-ai, fractals, abstraction, determinism, durable-execution, trust, factories, post-scarcity, legibility, finance, insurance]
---

# The River and the Canal

## In short

Agents are best at exploring open, foggy problems; deterministic workflows are best at repeating known ones, and businesses that sell sameness, like banks and insurers, depend on the second. Every layer of computing made one more thing predictable so people could stop thinking about it; an agent orchestrator for everything is the first layer that hands the thinking back. The design that works is a meta-factory: agents explore, write down what works as a workflow, a deterministic engine runs it, and agents repair or retire it when the world changes. Workflows can still contain bounded agent steps, like locks in a canal, which keeps judgement where it is needed and makes the rest auditable, repeatable and cheap. Not everything should become a procedure: the agents at the edge stay, because the fog never lifts completely.

*A note before you start: this is a different kind of post from most on this site. It is a philosophical essay rather than a technical one, and a long read, around forty-five minutes. It starts with a photograph and ends with the name of a workflow engine, and in between it goes through fractals, games, cosmology, a century of thinking about organisations, a story from 4chan, and a field guide you can use on Monday. It is also, more than anything else I have written here, a map of how I think. If you want only the practical part, [skip to the field guide](#a-field-guide).*

There is a photograph on the wall of the café where I am writing this. It is [*Whispering Current*](https://www.armingraessl.ch/collection/006-whispering-current) by the photographer Armin Grässl. His own caption begins "Among massive rocks, the water carves its way", which is what it shows: a mountain river running over a bed of rocks, white where it breaks and dark where it pools, with pine trees dissolving into fog behind it. No two metres of that river behave the same way. The water does not know where it is going in any sense we would recognise. It tries every gap, fills every hollow, and finds a path through terrain that nobody planned, one rock at a time.

I keep looking at it, because it answers a question I could not answer at my desk. A few weeks ago I started building a durable workflow engine in Rust, something in the family of [Temporal](https://temporal.io/) and [Restate](https://restate.dev/), under the working name *tsumugi*. It is a reasonable project. A self-contained engine that starts as a library and grows into a cluster is useful, and I wrote down why in a long design brief. But the brief kept circling a question it never answered: why would anyone need a workflow engine in 2026, when an agent can do the work?

Agents built on harnesses like [Claude Code](https://www.anthropic.com/claude-code) are remarkable at exactly what that river does. Give one a goal and an unfamiliar codebase, a broken deployment or a vague request, and it probes, fails, adjusts and finds a way through. If that is the new shape of work, a workflow engine, with its fixed steps and its insistence on determinism, looks like a tool for a world that is ending.

I do not think it is, but the answer turned out to be much bigger than the project. It also ends with the project's name, which knew what the project was about before I did.

## Everything is a fractal

Look closer at the river and it does something else. The pattern of the water around one large rock repeats around the smaller rocks, and around the pebbles between them. The trees behind it branch the way the river branches, and their branches branch again. Benoit Mandelbrot opened [*The Fractal Geometry of Nature*](https://en.wikipedia.org/wiki/The_Fractal_Geometry_of_Nature) in 1982 with the sentence that made this way of seeing famous: "Clouds are not spheres, mountains are not cones, coastlines are not circles, and bark is not smooth, nor does lightning travel in a straight line." Nature is rough, and its roughness looks alike at different scales. That [self-similarity](https://en.wikipedia.org/wiki/Self-similarity) is what a [fractal](https://en.wikipedia.org/wiki/Fractal) is.

This is the idea I have carried longest, longer than any project on this site, and it runs underneath everything that follows; I keep a shorter version of it as a note, [Everything is a fractal](https://raskell.io/notes/everything-is-a-fractal/). I find it very likely that we live in a world without limits in time or space, stretching without end in every direction, and in such a world the fractal is the most natural shape there is: the same patterns recurring at every scale, with no largest and no smallest instance. Cosmologists have a name for the strong version of this, [fractal cosmology](https://en.wikipedia.org/wiki/Fractal_cosmology), the hypothesis that matter is distributed as a fractal at every scale. It is a minority position; most cosmologists read the galaxy surveys as showing that the universe becomes smooth beyond a few hundred million light years. So I hold the infinite, fractal world as a working intuition rather than a claim I could defend in a physics seminar. As an intuition about how ideas, organisations and machines behave, it has never let me down.

It came to me, as it came to many people of my generation, through *Jurassic Park*. Michael Crichton's [1990 novel](https://en.wikipedia.org/wiki/Jurassic_Park_(novel)), one of my favourite books, is built around chaos theory, which most readers had met, if at all, through James Gleick's [*Chaos: Making a New Science*](https://en.wikipedia.org/wiki/Chaos:_Making_a_New_Science) from 1987. Crichton's mathematician, [Ian Malcolm](https://en.wikipedia.org/wiki/Ian_Malcolm_(character)), was partly inspired by Gleick. The novel is divided into "iterations" rather than parts, and each one opens with a drawing of the same fractal, the [Heighway dragon curve](https://en.wikipedia.org/wiki/Dragon_curve), a little more folded than the last. In the 1993 film, Malcolm gets the line everyone remembers: "Life, uh, finds a way." It is the river again.

What I took from all of this is an idea about ideas. The [Mandelbrot set](https://en.wikipedia.org/wiki/Mandelbrot_set), the most famous fractal of all, comes from one tiny rule applied again and again: take a number, square it, add a constant, repeat. Iterating something simple produces something of unlimited richness. I think good ideas work the same way, in science, in engineering, in business and in every craft I know. The best ones are rarely leaps. They are small iterations on what came before, a simple improvement that adds just enough novelty for a new behaviour to emerge, and then they become the layer everyone else builds on. [Stuart Kauffman](https://en.wikipedia.org/wiki/Stuart_Kauffman) called the space of such next steps the *adjacent possible*: at any moment only certain steps are one move away from what exists, and Steven Johnson made the phrase the opening of his book on where good ideas come from. Michael Tomasello described the other half of the mechanism as [a ratchet](https://en.wikipedia.org/wiki/Ratchet_effect): each generation keeps what the last one built and adds a little, and the gain does not slip back.

That ratchet is why progress feels the way it does. Once a layer exists, we stop seeing it. Nobody marvels at running water, or at a function call, or at a search engine, and nobody can go back to the world before them. AI is on the same ratchet now. Whatever anyone thinks about it, someone will take the next step, and the step after that, and the layer will become ordinary.

My thinking tends to work like this: syncretic and convergent, pulling ideas from very different places until they turn out to be the same idea at different scales. This essay is an example. The fractal will keep coming back: in the games, in the businesses, in the orchestrators, in the factory under the sea, and in the name of the engine.

## Two kinds of games

I have been reading Sebastian Mallaby's *The Infinity Machine*, his book about Demis Hassabis and DeepMind, which I [reviewed here](https://raskell.io/articles/win-everything-control-no-one/). In chapter 13, after the Go and chess triumphs, DeepMind turns to StarCraft II, and Mallaby describes why it was a different kind of problem:

> StarCraft is less like a board game than like the human experience of life: an unbroken stream of choices and sub-choices, some involving long-term planning and some more immediate, all rendered more bewildering by the fog of imperfect information.

Chess is the purest closed game there is. The board is fully visible, the rules never change, the moves alternate, and the end is defined: checkmate, or a draw. Everything that can happen is, in principle, known in advance. StarCraft is the opposite. You see only what your units see, and the rest is literally called the [fog of war](https://en.wikipedia.org/wiki/Fog_of_war). Nothing waits for your turn, and what counts as winning depends on what the other player is doing right now. DeepMind did eventually build [AlphaStar](https://en.wikipedia.org/wiki/AlphaStar_(software)), which by Mallaby's account won 99.8 percent of its games against ranked human players by October 2019, but it took a different kind of machine: one that learned to act under uncertainty rather than one that searched a known tree.

I played a lot of StarCraft. The difference between the two games is not academic to me. In chess you can be right. In StarCraft you can only be less wrong than the other player, a little faster. StarCraft is also fractal in a way chess is not. Mallaby's "choices and sub-choices" is exact: the same problem, deciding under fog with too little time, repeats at every timescale, from the economy of the whole game down to the movement of a single unit in a single second.

### The third game

At the same time, an ocean away, a different lab was making a different bet. In 2017 a team at Google had introduced the [transformer](https://en.wikipedia.org/wiki/Transformer_(deep_learning_architecture)), in a paper titled ["Attention Is All You Need"](https://arxiv.org/abs/1706.03762). Mallaby describes Ilya Sutskever reading the paper and leaping out of his chair. OpenAI pointed the transformer at language: a [generative, pre-trained transformer](https://en.wikipedia.org/wiki/Generative_pre-trained_transformer), GPT, trained to continue text. GPT-2 followed in February 2019, while DeepMind was deep in StarCraft, and at the end of 2022 its conversational descendant, [ChatGPT](https://en.wikipedia.org/wiki/ChatGPT), became a worldwide sensation.

DeepMind had the transformer too; AlphaStar was built on it. What it did not have was the conviction that language was the game worth playing. Mallaby is direct about why: "when it came to language modeling, Hassabis's taste buds went awry, and the reasons included his skepticism about ungrounded symbols, his love of games, and his presumption that human experience was more varied and perhaps grander than all of the text on the internet." Hassabis himself is gracious about it: "Look, you can't be Nostradamus every time."

I read that as a philosophical miss more than a technical one. Language is a third kind of terrain, neither chess nor StarCraft: the world that humans built out of symbols to describe, compress and coordinate the other two. Contracts, laws, procedures, code, documentation, the shell on a Linux machine. Hassabis bet that intelligence would be won in games and in the physical world, and the first general-purpose agents arrived through text instead.

Not everyone accepts that this settles anything. [Yann LeCun](https://en.wikipedia.org/wiki/Yann_LeCun) has argued for years that language models cannot reach human-level intelligence on their own, because humans and animals learn about reality by acting in it, not by reading about it. He left Meta in November 2025 and founded [AMI](https://techcrunch.com/2026/01/23/whos-behind-ami-labs-yann-lecuns-world-model-startup/), which raised just over a billion dollars in 2026 to build world models; its mission statement says that real intelligence "does not start in language. It starts in the world." In his view, today's agents live in a narrow world of programming languages, interpreters and terminal sessions, and the real fog is elsewhere.

There is an old observation behind his position. In 1988 the roboticist Hans Moravec noted in *Mind Children* that it is comparatively easy to make computers perform like adults on intelligence tests or at checkers, and very hard to give them the perception and mobility of a one-year-old. The things we find hard, symbols and logic, turned out to be easy for machines. The things we find effortless, walking across a riverbed without slipping, turned out to be the hard part. The observation is known as [Moravec's paradox](https://en.wikipedia.org/wiki/Moravec%27s_paradox).

I think both Hassabis's critics and LeCun are right about something, and the distinction runs straight through this essay. The agents I am writing about explore the fog inside the symbolic world: unfamiliar codebases, ambiguous documents, undocumented APIs. That world has rules, but so many of them, so loosely enforced, that it behaves like StarCraft from the inside. The river in the photograph, and the robots that will one day have to cross it, need what LeCun is building. But the businesses that sell sameness, the banks and insurers and administrations, live almost entirely in the symbolic world already. Their products are contracts and their factories are procedures. That is exactly the terrain where language agents are strongest, and exactly why the question of what they should leave behind matters so much there.

## Risk and uncertainty

The difference between chess and StarCraft has a much older name in economics. In 1921 Frank Knight published [*Risk, Uncertainty, and Profit*](https://www.econlib.org/library/Knight/knRUP.html), and drew a line that is still useful. **Risk** is uncertainty you can measure: you do not know what will happen in a single case, but you know the distribution across many similar cases. **Uncertainty**, in Knight's strict sense ([Knightian uncertainty](https://en.wikipedia.org/wiki/Knightian_uncertainty)), is the kind you cannot measure, because there is no meaningful set of similar cases to count. Risk can, in principle, be insured. Uncertainty cannot. And Knight argued that profit, in a competitive economy, comes from uncertainty rather than from risk, because measurable risk gets priced and competed away.

Read that with the two games in mind. An insurance company is literally a machine for turning risk into procedure. It takes events that are unpredictable for each customer, such as a burst pipe, a car accident or a stolen bicycle, and makes them predictable in aggregate, then handles each one through a process that is the same every time. The entrepreneur, the researcher and the robot engineer live on the other side of Knight's line. Their profit, if it comes, comes from acting well where nobody can measure the odds.

That gives the two kinds of game an economic meaning. A closed game is one where the risks can be measured, so the right response is a procedure. An open game is one where the uncertainty cannot be measured, so the right response is judgement, exploration and adaptation. Both are valuable. They are not the same kind of value.

## Two kinds of businesses

Once you see those two games, businesses sort themselves surprisingly cleanly.

A bank, an insurer, a tax office, a land registry, a pension fund, and the newer arrivals such as a crypto broker, sell something abstract. You cannot touch an insurance policy. What the customer buys is a promise that a certain thing will happen in a certain way when certain conditions are met, every time, for everyone, for decades. The value of such a business is its sameness. A claim handled differently depending on the mood of the day is not a feature; it is the product failing.

[Niklas Luhmann](https://en.wikipedia.org/wiki/Niklas_Luhmann), the German sociologist, gave this a precise name. In *Vertrauen* (1968, in English as part of *Trust and Power*), he describes trust as a way of reducing complexity: you cannot verify everything, so you decide what to rely on. He distinguishes **personal trust**, in someone you know, from **system trust**, in institutions such as money and banks that you rely on without knowing anyone inside them. Nobody trusts their bank because they trust the clerk. They trust it because they trust the system to behave the same way regardless of the clerk. [Max Weber](https://en.wikipedia.org/wiki/Max_Weber) made the same point half a century earlier about [bureaucracy](https://en.wikipedia.org/wiki/Bureaucracy): its strength, and the source of its legitimacy, is calculability, the application of rules uniformly and without regard for persons. A bureaucracy is a promise that you can predict what it will do.

The crypto broker is the newest and most extreme version of this. Its customers are asked to trust the code itself, in the form of [smart contracts](https://en.wikipedia.org/wiki/Smart_contract), and in the purest cases the procedure is so deterministic that it runs on a public ledger where anyone can replay it. Whatever you think of the industry, it is a striking demonstration of the principle: when there is no personal trust at all, determinism has to carry everything.

Other businesses bargain with the physical world: robotics, energy, space, agriculture, medicine, any research lab. The terrain changes under them. A robot arm that worked yesterday meets a part that is slightly bent today. A drilling rig meets rock nobody predicted. Their value lies in adapting on the spot, and a procedure that cannot bend is a liability.

Most real companies contain both, and the boundary runs through departments rather than between companies. The claims department of an insurer plays chess. Its product development plays StarCraft. And the pattern repeats inside each of them: a bank is a procedure made of procedures, each department a smaller version of the promise the whole company makes, down to the single form that has to be filled in the same way every time. The two kinds of problem differ in kind, and they call for different kinds of machines.

## Two kinds of machines

This distinction is also older than it looks. In 1960, in *The New Science of Management Decision*, [Herbert Simon](https://en.wikipedia.org/wiki/Herbert_A._Simon) separated **programmed decisions**, the routine and repetitive ones that an organisation handles with an established procedure, from **non-programmed decisions**, the novel and unstructured ones that require problem solving. He treated them as two ends of a continuum rather than two boxes, and he expected the programmed end to be taken over by computers. For the non-programmed end, the computers of his day had very little to offer.

Sixty-four years later, in December 2024, Anthropic published a short guide called ["Building effective agents"](https://www.anthropic.com/engineering/building-effective-agents) that draws almost the same line for language models. "Workflows are systems where LLMs and tools are orchestrated through predefined code paths. Agents, on the other hand, are systems where LLMs dynamically direct their own processes and tool usage." Its advice is sober: "workflows offer predictability and consistency for well-defined tasks, whereas agents are the better option when flexibility and model-driven decision-making are needed at scale." And it names the costs plainly: "The autonomous nature of agents means higher costs, and the potential for compounding errors."

So we have deterministic machines on one side: workflow engines, process engines, schedulers, and in a broader sense every bureaucracy that ever wrote down a procedure. Given the same inputs, they do the same thing, and when something goes wrong you can replay what happened step by step. On the other side are agents, which in 2026 means language models in a loop with tools, and which have always also meant people. Give them a goal and they find a way, and the way will be different every time. The distinction is old. The news is that, for the first time, machines are good at Simon's non-programmed end.

Put the two kinds of problem against the two kinds of machine and you get four cells, two of them mistakes:

| | **Deterministic machine** (procedure, workflow) | **Agentic machine** (explores at runtime) |
|---|---|---|
| **Closed problem** (measurable risk, rules known, end defined) | the insurer's claims process: trust through sameness | expensive improvisation; correct most of the time, and nobody can say why it did what it did |
| **Open problem** (uncertainty, fog, changing terrain) | brittle automation that breaks at the first unforeseen rock | the explorer: finds a path by trial and error |

The bottom-left cell is the history of enterprise automation: rigid processes laid over messy reality, and the endless exception handling that follows. The top-right cell is the risk of this moment. Agents are good enough now that it is tempting to hand them everything, including the closed games, and an agent playing chess will usually play reasonable chess. But "usually" and "reasonable" are not what a customer buys from an insurer.

The arithmetic is unforgiving. Suppose an agent gets each step of a twenty-step process right 95 percent of the time, which would be very good. The chance that all twenty steps are right is 0.95 to the power of twenty, about 36 percent. At 99 percent per step it is about 82 percent. A deterministic workflow does not have this problem for the steps that are deterministic, which is why the useful question is never "agent or workflow" for a whole process, but which steps need judgement and which do not.

And there is the question of explanation. An agent's transcript shows what it said it was thinking, and that is useful. But the reasoning comes out of weights nobody can read. You can inspect what it said. You cannot inspect why, and you cannot be sure it will say the same thing tomorrow. For a closed game, where the customer, the auditor and the regulator all expect the same answer to the same question, that is not good enough on its own.

## Everything was always an orchestrator

I have spent most of my working life on orchestration layers of one kind or another, and looking back, each of them was a way of making one more thing deterministic so that the people above it could stop worrying about it. [Alfred North Whitehead](https://en.wikipedia.org/wiki/Alfred_North_Whitehead) put the general principle in a sentence in 1911, in *An Introduction to Mathematics*: "Civilization advances by extending the number of important operations which we can perform without thinking about them." Every orchestrator is a machine for Whitehead's sentence.

| Layer | Unit of work | What it made deterministic | Where the uncertainty went |
|---|---|---|---|
| The monolith | the function call | control flow inside one process | into the code, held together by interfaces, types and ABIs |
| Microservices | the service | ownership and deployment boundaries | into the network between services |
| Kubernetes, Nomad | the container, the job | placement, restarts, desired state | into reconciliation loops and configuration |
| WebAssembly function platforms | the function | isolation and portability of very small units | into how the functions are composed |
| Workflow engines | the step | the order, durability and history of a process | into the step bodies, which may run more than once |
| Agent runtimes in microVMs | the task | the sandbox, and little else | into the model |

I was very fond of [Nomad](https://www.nomadproject.io/) in its day, because it made the abstraction so plain: you describe a job, and the scheduler makes it so. [Kubernetes](https://kubernetes.io/) did the same with more ceremony. The WebAssembly platforms pushed the idea further. I followed [wasmCloud](https://wasmcloud.com/) closely, which suggested that an application is nothing but small functions, compiled to a portable format and placed wherever there is room. Every one of these layers moved complexity rather than removing it. [Microservices](https://en.wikipedia.org/wiki/Microservices) did not make systems simpler; they moved the hard part from interfaces inside one program to the network between many, which is why we then needed service meshes, tracing and [observability that is more than logging](https://raskell.io/articles/observability-is-not-logging/).

Read the table as a fractal. Every row makes the same move one scale up: take what was uncertain at the level below, make it predictable, and let the people above stop thinking about it. And every row, once it settled, became invisible. Nobody thinks about the function call any more, few people think about which machine their container runs on, and in a few years almost nobody will think about the durable workflow underneath their software. That is Tomasello's ratchet and Whitehead's sentence at the same time.

The last row is different in kind. Recently I sat through a pitch in which one of the large consulting firms described how it runs agents internally: a Kubernetes-like orchestrator for secure microVMs, each running a coding-agent harness, fed Markdown context describing the job, the task or the position to be filled. It was a good pitch, close to things I have built myself. [Kage](https://github.com/raskell-io/kage) was a local-first orchestrator for agentic work. Shiioo, in [its second form](https://raskell.io/articles/shiioo-reimagined-and-a-home-ai-lab/), runs a small virtual company of agents with a rules file deciding what they may do alone, and the experiment behind [sixteen agents with an org chart](https://raskell.io/articles/what-sixteen-ai-agents-taught-me-about-management/) taught me how quickly that gets complicated. I also know from [Your Agent Wants Root](https://raskell.io/articles/your-agent-wants-root/) how much of the work is simply keeping such a runtime contained.

Every earlier layer took something uncertain and made it predictable, so that the layer above could rely on it without thinking. An agent orchestrator for everything does the reverse. It takes work that companies spent decades turning into procedure and hands it back to something that improvises. For the open problems that is exactly right. For the closed ones it trades away the one thing those businesses actually sell, and it runs Whitehead's sentence backwards: it extends the number of operations that require thinking.

So, should we build agent orchestrators for everything? I am sceptical. There will always be a large problem space that is deterministic by nature, because the trust an established process creates is valuable in itself.

## Exploration and exploitation

If agents are not the answer to everything, they are still the answer to something new, and organisation theory has a name for it. In 1991 James March published ["Exploration and Exploitation in Organizational Learning"](https://doi.org/10.1287/orsc.2.1.71), one of the most cited papers in the field. Exploration is the search for new possibilities: experimentation, variation, risk. Exploitation is the refinement of what is already known: efficiency, execution, reliability. Every organisation needs both, and they compete for the same scarce resources. March's warning was that adaptive processes which refine exploitation faster than exploration tend to look effective in the short run and destroy themselves in the long run. Organisations drift towards exploitation, because its returns are closer, more certain and easier to measure.

The [same trade-off](https://en.wikipedia.org/wiki/Exploration%E2%80%93exploitation_dilemma) sits at the heart of [reinforcement learning](https://en.wikipedia.org/wiki/Reinforcement_learning), DeepMind's own field. An agent that only exploits what it already knows never finds a better strategy; an agent that only explores never collects the reward. AlphaGo and AlphaStar are, among other things, very sophisticated answers to that dilemma. The trade-off is fractal as well. It appears inside a single agent deciding whether to try a new command, in a team deciding whether to rewrite or patch, in a firm deciding whether to build a new product, and in an industry deciding whether to bet on games or on language.

Agents change the price of exploration. For most of history it was expensive. It needed skilled people, time, and tolerance for failure, which is why March's organisations drifted away from it. Language agents make exploration in the symbolic world cheap. An agent can try ten approaches to an unfamiliar integration overnight, read every document in a regulatory change, or work through a backlog of odd cases that no procedure covers. Exploitation, meanwhile, was always what deterministic machines were good at.

That suggests a division of labour that neither side achieves alone. Agents explore; workflows exploit. The design question is the interface between them: how what an agent learns by exploring becomes something a workflow can exploit, and how a workflow that has stopped working is handed back to exploration.

## Routines are the memory of a company

Richard Nelson and [Sidney Winter](https://en.wikipedia.org/wiki/Sidney_G._Winter) answered part of that question in 1982, in *An Evolutionary Theory of Economic Change*, a founding text of [evolutionary economics](https://en.wikipedia.org/wiki/Evolutionary_economics). They argued that the behaviour of a firm is best understood through its **routines**: the regular, predictable patterns of how it does things. Routines play the role in an organisation that genes play in biology. They are its memory, they are how it reproduces its behaviour from one year to the next, and economic change happens through search for new routines and selection among them.

The weakness of routines, as Nelson and Winter knew, is where they live. Most of an organisation's routines reside in the heads of the people who perform them, partly written down in procedures and manuals, mostly not. I wrote about this in IT Intelligence as tribal knowledge: the explicit knowledge nobody wrote down, and the tacit knowledge that perhaps nobody can.

A workflow engine changes where a routine lives. A routine encoded as a workflow is no longer a description of what people are supposed to do. It is the thing that does it, and every execution leaves a journal of exactly what happened. The organisation's memory becomes executable and inspectable at the same time, which means a company can read its own routines, compare them, test them against past cases, and change them deliberately, instead of discovering them in interviews and workshops.

What was missing until recently was the step before: turning a routine into a workflow took a human analyst, a developer and a long project. Ikujiro Nonaka and Hirotaka Takeuchi called the step from tacit to explicit knowledge *externalisation*, part of their [SECI model](https://en.wikipedia.org/wiki/SECI_model_of_knowledge_dimensions), and it was always the slow and expensive part of organisational learning. Agents can now take that step: they can watch, explore, try, and write down.

## The factory under the sea

Now a detour, which says something about how I read the internet.

I read 4chan, and I read ufology, in roughly the spirit in which other people read science fiction: not as reports, but as a source of strange and sometimes excellent thought experiments. An anonymous poster, known as UFOAnon, once wrote [a long thread](https://imgur.com/a/4chan-whistleblower-NXjWQaN) claiming to explain how non-human craft operate around Earth. Most of it I file under fiction. One image from it has stayed with me, because it is such a good piece of engineering imagination.

In the story, there is a factory under the sea. It does not house a fleet. It builds craft on demand, each one designed for a single mission: one for mining, one for delivery, one for carrying living things, one for something like sightseeing. A craft is made for its mission, flies it, returns, and is taken apart. Nothing is kept that is not needed. The factory itself is the only permanent thing.

Whatever you think of the source, the design is convincing, and for a reason that has nothing to do with aliens. It is what a civilisation would build once making things is effectively free. If fabrication costs nothing, you stop maintaining general-purpose machines that do many jobs badly, and you start producing purpose-built machines that do one job well and then disappear. Science fiction has a name for that condition, [post-scarcity](https://raskell.io/tags/post-scarcity/), and its best-known portrait is Iain M. Banks's [Culture](https://en.wikipedia.org/wiki/The_Culture), the series Hassabis grew up on, as Mallaby tells it.

The idea also has a respectable ancestry. In the 1940s John von Neumann designed, on paper, a [universal constructor](https://en.wikipedia.org/wiki/Von_Neumann_universal_constructor): a machine inside a [cellular automaton](https://en.wikipedia.org/wiki/Cellular_automaton) that could build any machine from a description of it, including a copy of itself. His design had three parts: the **description**, a blueprint; the **constructor**, which builds whatever the description says; and the **copier**, which duplicates the description. Arthur Burks completed and published the work in 1966, after von Neumann's death, as *Theory of Self-Reproducing Automata*. The separation matters. Because the description is separate from the machinery that executes it, descriptions can change, accumulate and evolve while the constructor stays the same.

Software has lived in that world for decades. Copying a program, a container image or a compiled binary costs close to nothing, which is why we already think in factories, templates and patterns rather than in individual artefacts. The [factory](https://en.wikipedia.org/wiki/Factory_method_pattern) and [strategy](https://en.wikipedia.org/wiki/Strategy_pattern) patterns from object-oriented design are small, domestic versions of the same idea.

That, I think, is the deepest reason the story convinces me: it is fractal. The factory pattern in source code, an object whose job is to make other objects, is the same idea as a plant that makes cars, which is the same idea as a factory that makes craft, or other factories, on demand. Von Neumann's constructor is the same idea again, one level of abstraction up. A pattern that holds at three or four scales is rarely an accident. It usually means you have found something about how the world is put together. What changed in 2026 is that the factory can now think: it can write the descriptions itself.

## The meta-factory

Put the pieces together. Agents are explorers: they are at their best in the fog, finding a path through problems that nobody has solved before. Workflows are routines: they are at their best on known ground, doing the same thing every time, with a history anyone can read. Choosing one of them is the mistake. The better design connects them, so that what the explorer finds becomes a routine.

*The meta-factory*

```text
   ┌──────────────────────────────┐
   │ the rugged world:            │
   │ open, foggy, changing        │
   └───────────────┬──────────────┘
                   ▼
   ┌──────────────────────────────┐
   │ an agent explores            │  trial and error, at runtime
   └───────────────┬──────────────┘
                   │  a path is found, and it will be needed again
                   ▼
   ┌──────────────────────────────┐
   │ the agent writes a workflow  │  typed, validated, simulated
   │                              │  against past cases, reviewed
   └───────────────┬──────────────┘
                   ▼
   ┌──────────────────────────────┐
   │ a deterministic engine       │  journaled, replayable, auditable;
   │ runs it                      │  may contain bounded agent steps
   └───────────────┬──────────────┘
                   ▼
   ┌──────────────────────────────┐
   │ observe                      │  exceptions, drift, new fog
   └───────┬──────────────┬───────┘
           ▼              ▼
        repaired         retired
       by an agent      when the mission is over
```

In von Neumann's terms, the workflow definition is the description, the engine is the constructor, and versioning is the copier. In the terms of the story, the agent is the factory under the sea and workflows are its craft.

Faced with a new kind of claim, a new regulatory report or a new integration, an agent works out how to do it, the way any capable person would. If the work is a one-off, that is the end of it. If it will recur, the agent does what a good employee does after solving something the third time: it writes the procedure down. Here, writing it down means producing a workflow definition for a deterministic engine, one that can be validated, simulated against past cases, reviewed by a person and versioned. From then on the procedure runs on the engine, the same way every time, and every run leaves a journal that shows exactly what happened. When the world shifts and the workflow starts producing exceptions, an agent investigates and proposes a repair. When the mission is over, the workflow is retired, like a craft returning to be taken apart.

Two details make this more than a diagram.

First, a workflow can contain judgement without giving up its shape. Some steps do need an agent: reading an unstructured document, drafting a letter, deciding whether an odd case fits a rule. Those steps can be agent calls inside the workflow, with their inputs and outputs journaled and their scope bounded. I think of them as [locks](https://en.wikipedia.org/wiki/Lock_(water_navigation)) in a canal: controlled points where the water is allowed to rise and fall, inside a channel that otherwise runs straight. The arithmetic from earlier explains why this matters. A twenty-step process with two bounded agent steps and eighteen deterministic ones fails far less often than twenty agent steps in a row, and when it does fail, you know which lock leaked.

Second, this is the oldest idea about organisations, applied to a new kind of worker. People can do almost anything; that is what makes them valuable and what makes them hard to rely on. Companies have always responded the same way: processes, hierarchies, directives, checklists, training. They turned the improvisation of capable people into procedure wherever the work was repeatable, and left room for judgement where it was not. Today companies are trying to contain agents with policies, guardrails and governance frameworks, which is the same move with a different vocabulary. The meta-factory takes it one step further. Instead of containing the agent only with rules about what it may not do, you let it do what it is good at, exploring, and you let it hand its results to a machine that is good at something else, repeating.

### The same loop at every scale

The meta-factory is one loop repeated at every scale. A procedure contains locks where an agent explores; that agent may itself run a small procedure; procedures are composed into larger ones; and a department, seen from far enough away, is a procedure that a company once explored its way into.

| Scale | What explores | What gets crystallised |
|---|---|---|
| a single step | an agent reading one unusual document | an answer, journaled |
| a procedure | agents handling the cases it does not cover | a new rule or branch |
| a department | agents and people handling new kinds of work | new procedures |
| a company | people and agents testing new markets | new products and departments |
| an industry | companies competing with each other | standards, regulation, shared infrastructure |

The same verbs work at every row: explore, crystallise, run, observe, repair, retire. That is what makes it a design rather than a slogan. An engine that supports the loop at one scale supports it at all of them, as long as a workflow can contain agents and an agent can start workflows.

### What a crafted procedure looks like

Suppose an insurer's claims agents keep encountering water damage claims where the customer's photos are missing or unusable. After working through a few dozen such cases by hand, an agent proposes a procedure. It might look like this:

```yaml
# procedures/claims/water-damage-photo-evidence.yaml (illustrative)
procedure: water-damage-photo-evidence
version: 3
origin:
  explored_by: agent/claims-explorer
  cases_studied: 37
  replayed_against: 412 closed claims, 0 divergences from human outcomes
  approved_by: claims-process-owner
  approved_at: 2026-10-12
steps:
  - id: classify_documents
    kind: agent                  # a lock: bounded judgement, journaled
    budget_tokens: 20000
    output_schema: DocumentClassification
  - id: check_coverage
    kind: rule
    rule: coverage.water_damage.v7
  - id: request_missing_photos
    when: classify_documents.missing_photos
    kind: message
    template: claims/missing-photos
  - id: wait_for_customer
    kind: wait
    timeout: 14d
    on_timeout: escalate
  - id: settle_or_escalate
    kind: rule
    escalate_if: amount > 5000 or classify_documents.confidence < 0.8
```

Every property of the meta-factory that matters is visible in those few lines. The procedure records where it came from: which agent explored it, how many cases, who approved it. It was replayed against hundreds of closed claims before anyone trusted it. It contains exactly one place where a model is allowed to judge, with a budget and a schema for its answer. Everything else is rules, messages and waits, which a deterministic engine runs the same way every time. And it has a version number, which means it can be replaced, compared and retired.

## A field guide

The philosophy is only useful if it changes decisions. I would apply it like this, in a company that has agents and a workflow engine and wants to use both well.

### When to leave work to an agent, and when to crystallise it

| Signal | Leave it to an agent | Crystallise it into a workflow |
|---|---|---|
| Frequency | once, or rarely | weekly or more often |
| Variance between cases | high: every case is different | low: cases have the same shape |
| Stakes of a wrong outcome | low, reversible | high, customer-facing, regulated |
| Need to explain afterwards | nice to have | required: auditor, regulator, court, customer |
| Cost per run | acceptable as a one-off | adds up across thousands of runs |
| Stability of the terrain | changing month to month | stable for quarters |

No single row decides. A rare case with very high stakes may still deserve a procedure; a frequent case with wild variance may be better served by an agent with a strong checklist. But when most rows point right, an agent doing the work every time is a cost and a risk that a workflow would remove.

### The lifecycle of a crafted procedure

1. **Explore.** Agents handle new kinds of work directly, with humans reviewing outcomes. Every case is recorded with enough context to be replayed.
2. **Propose.** When a pattern recurs, an agent drafts a workflow definition from the cases it has handled, marking the steps that still need judgement.
3. **Prove.** The draft is replayed against past cases. Where it diverges from what humans or agents did before, the divergence is explained or the draft is fixed.
4. **Approve.** A named person who owns the process approves it. The approval is recorded in the procedure itself, as in the example above.
5. **Run.** The engine runs it deterministically. Agent steps inside it are bounded by budgets and output schemas.
6. **Observe.** Exceptions, escalations, timeouts and cost per run are tracked per procedure and per version.
7. **Repair or retire.** When exceptions rise, the procedure goes back to an agent for investigation. When the work disappears, the procedure is retired and its history kept.

### What to measure

- **Crystallisation rate:** how much recurring work has moved from agents to procedures over a quarter.
- **Exception rate per procedure:** the share of runs that escalate. Rising exceptions are the earliest sign that the terrain has changed.
- **Divergence on replay:** when a procedure is changed, how many past cases it would now handle differently.
- **Cost per run:** tokens and compute, compared with the agent-only alternative.
- **Time to repair:** how long a failing procedure stays broken before an agent and a person fix it.
- **Retirement rate:** procedures nobody runs any more. A company that never retires anything is accumulating zombies.

### Why regulators will like it

In regulated industries this design is also where supervisors are heading. The [EU AI Act requires](https://artificialintelligenceact.eu/article/12/) that high-risk AI systems technically allow the automatic recording of events over their lifetime, and that deployers keep those logs. A workflow engine produces that record by construction: every step, every input, every agent call and its answer, in order, replayable. An agent working freely produces a transcript, which is better than nothing but much harder to audit, compare and reproduce. Wrapping agents in procedures is the cheapest path to the kind of traceability that regulated work already demands.

### How it fails

- **Premature crystallisation.** Turning something into a procedure before the terrain is understood, which produces brittle workflows and endless exceptions: the bottom-left cell of the table.
- **Zombie procedures.** Workflows nobody owns or understands, still running because nobody dares to retire them.
- **Agent drift inside the locks.** A model update changes how a bounded agent step behaves. Replay against past cases is the defence, and it has to run whenever a model changes, not only when the procedure does.
- **Rubber-stamp approval.** People approving agent-written procedures without reading them. The procedure has to be short and readable enough that approval means something.
- **[Goodhart's law](https://en.wikipedia.org/wiki/Goodhart%27s_law) on the metrics.** Optimising the crystallisation rate by crystallising things that should have stayed with agents.

## The canal and its warning

Humans have always done this to landscapes. Look at the river in Grässl's photograph and then at any city: we build cubes, spheres, straight lines and right angles, shapes that never occur in the terrain, because they serve an idea. A canal is a river that has been told what to do. It carries barges on a timetable, which a mountain river never will.

In Mandelbrot's terms, a canal is [Euclidean](https://en.wikipedia.org/wiki/Euclidean_geometry) and a river is fractal. Euclid gives us straight lines, planes and smooth curves, which are easy to build, measure and trust. Nature gives us roughness at every scale, and most of the information is in the roughness. A company needs both geometries, and it goes wrong when it believes the smooth one can replace the rough one.

There is a warning in this, and I take it from James C. Scott's [*Seeing Like a State*](https://en.wikipedia.org/wiki/Seeing_Like_a_State), which I leaned on in IT Intelligence as well. Scott shows how schemes that impose legible order on complex systems, from planned forests to planned cities, tend to destroy the practical knowledge that made the original system work. He calls that knowledge *mētis*: the skill of the harbour pilot who knows one particular port, or the farmer who knows one particular field. Canal every river and you lose what rivers do: the floodplains, the fish, the ways the water finds that no engineer would have drawn.

Weber saw the same danger from inside the bureaucracy. The calculability that makes it trustworthy can also make it inhuman, when procedural correctness wins over substantive justice, and his image for the end state, usually translated as the [iron cage](https://en.wikipedia.org/wiki/Iron_cage), has outlived most of his other phrases. March saw it from the side of learning: an organisation that only exploits becomes very good at last year's problems and then fails.

The meta-factory has to respect all three warnings. Not everything should become a workflow. The agents at the edge, exploring, are a permanent part of the picture rather than a phase before everything is automated, because the fog never lifts completely. And the people who hold the mētis are not replaced by procedures. Their role changes: they become the ones who decide what deserves to become a procedure, who read and approve what agents propose, and who notice when the river has moved.

The balance I am after is a canal network with a wild river still running beside it, and with people, and agents, who know when to dig a new canal and when to fill an old one in.

## What this means for organisations

If this picture is right, a few things follow for companies that live mostly in the symbolic world, which is most of them.

**Process owners become editors.** Today a process owner maintains documentation that describes what people should do, and hopes it matches what they do. In the meta-factory, the owner reviews procedures that agents propose, approves versions, reads exception reports and decides when to retire something. It is closer to editing than to administration, and it needs people who understand both the business and the procedure language well enough to read it critically.

**The organisation chart starts to look like a set of routines.** Much of what middle management did was coordinate people performing routines and handle the exceptions. When routines run on an engine and exceptions are routed to agents first and people second, the coordinating layer shrinks and the editing layer grows. I wrote about the same shift from the architect's point of view in What the architect does now.

**Trust moves from people to procedures, and has to be earned again.** Luhmann's system trust was always trust in procedure. What is new is that the procedures can now be written by machines. Customers and regulators will extend system trust to agent-written procedures only if the provenance is visible, the approvals are real and the history can be replayed. More than any technical detail, that is the condition under which the whole idea works.

**Exploration becomes a budget line.** If agents make exploration cheap, a company can afford to keep exploring at the edges of every department, and should. March's drift towards exploitation was partly a cost problem. That excuse is weaker now.

## What this means for the engine

If the meta-factory is right, a workflow engine in the agentic era is less a Temporal alternative that happens to be written in Rust than the constructor that agents write descriptions for, and that changes what it has to be good at.

- **Procedures as artefacts an agent can write and a person can read.** Definitions that a model can produce, a schema can validate, a simulator can run against past cases, and a person can review in one sitting, with their provenance inside them.
- **Determinism you can prove.** Replay serves more than recovery after a crash: it is how you show an auditor what happened, how you check that a repaired procedure still behaves like the old one on old cases, and how you detect that a model update has changed an agent step.
- **Bounded agent steps as a first-class concept.** Steps that call a model, journal its full answer so a crash never runs or bills it twice, enforce a budget and an output schema, and can be replayed with the recorded answer.
- **Birth and death as everyday operations.** Versions, approvals, deployments, draining and retirement, because purpose-built procedures are meant to come and go.
- **Exceptions as a signal.** Escalations and timeouts are data as much as errors: they tell an agent where the terrain has changed.
- **Small enough to be everywhere.** A library inside a single binary on a laptop, growing into a cluster when it must, because the factory should be able to put a craft wherever the work is.

### Checking what the factory makes

A factory is only as trustworthy as its inspection. If agents write procedures, and soon the engines and runtimes those procedures run on, something has to check their work without depending on trust in the agent. That is the bet behind the other project I am building, [Arcanist](https://arcanist.sh/), and its [Basel Haskell Compiler](https://arcanist.sh/bhc/), BHC: when generating code is cheap, correctness has to be checkable. Or, as the Arcanist site puts it: "The model does not need to be right. It needs to be checkable."

Haskell matters here for a reason that runs through this whole essay. A pure function in Haskell is deterministic by construction: given the same inputs it returns the same result, and code with side effects has to declare them in its type. That is exactly the line a durable execution engine has to draw between workflow code, which must replay identically, and step bodies, which talk to the world. Engines like Temporal enforce that line at runtime, by detecting non-determinism after the fact. A type system can enforce it before the code ever runs. BHC, still in beta, compiles the same Haskell source to native code and to WebAssembly under different runtime profiles, each of which the project describes as "a contract between your code and the runtime it runs on", and by its own measurement 236 of 243 test programs already produce byte-for-byte the same output on WebAssembly as natively.

The broader bet is that a compiler like this can become instrumental in AI-assisted engineering. Agents write the code; the compiler verifies what can be verified; a registry records what was checked, so that nobody, human or model, has to check the same thing twice; and the result is a workload, a runtime or an engine whose behaviour can be trusted for reasons other than the reputation of whoever wrote it. It is the meta-factory again, one scale down: agents explore, the result crystallises into something rigid, and an inspector stands at the gate. I wrote about the verification side in [The Proof You Only Have to Write Once](https://raskell.io/articles/the-proof-you-only-have-to-write-once/), about the tooling in [Why We Built a Haskell Package Manager in Rust](https://raskell.io/articles/why-we-built-a-haskell-package-manager-in-rust/), and about code becoming a lowering target in [Source Code Is the New Assembly](https://raskell.io/articles/semantic-artifacts-and-meaning-engines/). Whether tsumugi's procedures will one day be written in a language that a compiler like BHC can check, I do not know yet. It is the direction I am most curious about.

### The name

When I wrote the design brief, I gave the project a working name almost by accident. *Tsumugi* (紡ぎ) is Japanese for spinning: the work of taking raw fibre, tangled and irregular, and drawing it out into a thread that holds. I picked it because it sounded right for an engine that weaves many small durable threads of execution. Only in this café did I notice that it describes the whole idea. The raw fibre is what agents bring back from the fog. The thread is the procedure. The engine is the wheel.

[Spinning](https://en.wikipedia.org/wiki/Spinning_(textiles)) is fractal, too. Fibres are twisted into a single yarn, single yarns are twisted together into a plied yarn, plied yarns into cord, cord into rope: the same motion at a larger scale each time, and each layer stronger than the one inside it. That is how the engine should work as well: steps twisted into workflows, workflows into larger workflows, procedures into the routines of a whole company. I am keeping the name.

## Closing

Whitehead said that civilisation advances by extending the number of important operations we can perform without thinking about them. For most of history, the thinking that came before was done by people, slowly and expensively, and the operations they turned into routines lived in manuals and in memory. Now the exploring can be done by machines that are astonishingly good at finding paths through the symbolic world, and the routines can run on machines that do the same thing every time and remember exactly what they did.

Agents find the path through the rugged world. Workflows are what we keep of the paths worth walking again: written down, repeatable, inspectable, and trusted because they do not improvise. The companies that do well with agents will be neither the ones that let agents do everything nor the ones that forbid them, but the ones that let agents explore and then turn what they find into procedure, on a runtime that can be read, and that remember to leave some of the river wild.

If the world is as unbounded as I suspect, the pattern does not end there. There is no final layer, only the next iteration: agents exploring at the edge of what we know, procedures keeping what was worth keeping, and both becoming the ground the next layer stands on, until we stop noticing them. Crichton divided his novel into iterations because it was a story about systems that keep unfolding past the point where anyone controls them. This is the same kind of story. Life finds a way, and so does the river. Our part is to decide which of its paths are worth keeping.

## References

On games, language and AI:

- Sebastian Mallaby, *The Infinity Machine: Demis Hassabis, DeepMind, and the Quest to Build a Mind*, Penguin Press, 2026, chapter 13 on StarCraft, AlphaStar and the language bet.
- Ashish Vaswani and colleagues, [Attention Is All You Need](https://arxiv.org/abs/1706.03762), 2017, the transformer paper.
- On Yann LeCun's world-model company AMI: [TechCrunch, Who's behind AMI Labs](https://techcrunch.com/2026/01/23/whos-behind-ami-labs-yann-lecuns-world-model-startup/) and [eWeek on the $1.03 billion round](https://eweek.com/news/meta-ai-yann-lecun-ami-world-models-startup).
- Hans Moravec, *Mind Children: The Future of Robot and Human Intelligence*, Harvard University Press, 1988; see [Moravec's paradox](https://en.wikipedia.org/wiki/Moravec%27s_paradox).
- Anthropic, [Building effective agents](https://www.anthropic.com/engineering/building-effective-agents), 19 December 2024.

On fractals, iteration and ideas:

- Benoit B. Mandelbrot, *The Fractal Geometry of Nature*, W. H. Freeman, 1982.
- James Gleick, *Chaos: Making a New Science*, Viking, 1987.
- Michael Crichton, *Jurassic Park*, Alfred A. Knopf, 1990, and the 1993 film directed by Steven Spielberg; on the novel's iterations, the [Heighway dragon curve](https://en.wikipedia.org/wiki/Dragon_curve).
- [Fractal cosmology](https://en.wikipedia.org/wiki/Fractal_cosmology), including the case for large-scale homogeneity from galaxy surveys.
- Stuart Kauffman, *At Home in the Universe*, Oxford University Press, 1995, and Steven Johnson, *Where Good Ideas Come From*, Riverhead, 2010, on the adjacent possible.
- Michael Tomasello, *The Cultural Origins of Human Cognition*, Harvard University Press, 1999, on the ratchet effect.

On risk, trust and organisations:

- Frank H. Knight, [*Risk, Uncertainty, and Profit*](https://www.econlib.org/library/Knight/knRUP.html), 1921.
- Niklas Luhmann, *Trust and Power*, Polity; the essay on trust first appeared in German as *Vertrauen* in 1968.
- Max Weber, *Economy and Society*, on bureaucracy and rational-legal authority.
- Herbert A. Simon, *The New Science of Management Decision*, Harper and Brothers, 1960.
- James G. March, "Exploration and Exploitation in Organizational Learning", *Organization Science* 2(1), 1991, pp. 71 to 87, [doi:10.1287/orsc.2.1.71](https://doi.org/10.1287/orsc.2.1.71).
- Richard R. Nelson and Sidney G. Winter, *An Evolutionary Theory of Economic Change*, Belknap Press of Harvard University Press, 1982.
- Ikujiro Nonaka and Hirotaka Takeuchi, *The Knowledge-Creating Company*, Oxford University Press, 1995.
- James C. Scott, *Seeing Like a State*, Yale University Press, 1998.
- Alfred North Whitehead, *An Introduction to Mathematics*, 1911.

On factories and machines:

- John von Neumann, *Theory of Self-Reproducing Automata*, edited and completed by Arthur W. Burks, University of Illinois Press, 1966; see [Von Neumann universal constructor](https://en.wikipedia.org/wiki/Von_Neumann_universal_constructor).
- Erich Gamma, Richard Helm, Ralph Johnson and John Vlissides, *Design Patterns: Elements of Reusable Object-Oriented Software*, Addison-Wesley, 1994, for the factory and strategy patterns.
- UFOAnon, the anonymous 4chan thread with the factory under the sea, [collected on imgur](https://imgur.com/a/4chan-whistleblower-NXjWQaN), for the curious. Read it as fiction.
- [Temporal](https://temporal.io/) and [Restate](https://restate.dev/), durable execution engines.
- [Arcanist](https://arcanist.sh/), Haskell tooling for the age of AI-authored code, and its [Basel Haskell Compiler](https://arcanist.sh/bhc/).
- [Kubernetes](https://kubernetes.io/), [HashiCorp Nomad](https://www.nomadproject.io/) and [wasmCloud](https://wasmcloud.com/), orchestrators.

On regulation:

- Regulation (EU) 2024/1689, the AI Act, [Article 12, record-keeping](https://artificialintelligenceact.eu/article/12/).

On the photograph:

- Armin Grässl, [*006 Whispering Current*](https://www.armingraessl.ch/collection/006-whispering-current), photograph, from his Transforming Spaces editions.
