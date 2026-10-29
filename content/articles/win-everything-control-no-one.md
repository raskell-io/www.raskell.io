+++
title = "Win Everything, Control No One"
date = 2026-10-29
description = "Sebastian Mallaby's biography of Demis Hassabis is the best history of modern AI I know, and an honest study of a man who hates control and exercises it."

[taxonomies]
tags = ["intelligence", "reinforcement-learning", "games", "research-labs", "ai-alignment", "history-of-technology", "technology-races"]
categories = ["reviews"]

[extra]
author = "Raffael"
review = "the-infinity-machine"
+++

*The Infinity Machine* opens with a scene that has nothing to do with Demis Hassabis. In 2015, after a talk at the Royal Society, Nick Bostrom asks Geoffrey Hinton why he keeps doing AI research if he thinks political systems will use it to terrorise people. Hinton answers that he could give the usual arguments, "but the truth is that the prospect of discovery is too sweet." Mallaby says the story haunted him, and it sets the question for the whole book: if the people building this technology understand the danger, why do they build it anyway, and does it matter what kind of people they are?

His answer is a biography of Demis Hassabis, and it is also the best account I have read of how AI got from game-playing programs to where it is now. I give it 8.5 out of 10. It is required reading for anyone who wants to understand the people behind this technology, what drives them, and why nobody seems able to stop it.

## What the book is

The book does two things. It tells a life: Hassabis watching his father play chess at four and beating adults within weeks, a chess master at thirteen, a game designer at Bullfrog before university, a failed games studio, a PhD in neuroscience, DeepMind, the sale to Google, AlphaGo, AlphaFold, the Nobel Prize, and the scramble after ChatGPT. And it tells the history of the field through its ideas, in the order they arrived. Mallaby had about thirty hours with Hassabis over three years and interviewed more than a hundred people around him, so the rivals and the people who fell out with him speak in their own words.

The title comes from Cambridge. Hassabis and his friend David Silver imagined a machine that would find the patterns in a near infinity of data, and Hassabis later recruited Mustafa Suleyman with the line that an infinity machine would have infinite potential (chapters 2 and 4). Behind the phrase is the problem of induction, which symbolic AI never solved and which the rest of the book watches deep learning and reinforcement learning solve, piece by piece.

## A history of AI, told in the right order

Mallaby explains the technology twice, once with an analogy and once with the mechanism. For example:

- **How an image network learns** (chapter 6). The first layers find edges and patches of colour, later layers find curves and textures, deeper ones find the outline of a paw, and the last ones name the cat. Then the mechanism: weights, biases, sixty million parameters nudged until inputs match outputs.
- **Why the Atari agent needed experience replay** (chapter 6). An image classifier fed a sorted stack of photos, all cats first, concludes that everything is a cat. An agent stuck in one corner of a game has the same problem. Storing experiences and sampling them at random fixed it, and Hassabis saw in it what the hippocampus does during sleep.
- **Why the Atari agent needed a second network** (chapter 6). An agent that keeps adding optimism to its own estimates is like a man who finds a couple of hundred-dollar bills on the pavement and concludes he will be a billionaire by walking for a month. Mallaby's fix is a tennis coach who watches for a while before giving advice: one network plays with frozen weights, a second one learns, and the lessons are handed over only after a period of study.
- **AlphaGo as two kinds of thinking** (chapter 9). A policy network proposes moves the way a strong player sees them at a glance, a value network judges positions, and tree search does the slow deliberate part, which Mallaby maps onto Kahneman's System One and System Two.
- **Residual networks** (chapter 12). Deep networks garble their signal like a game of telephone; skip connections are express lanes past the middle layers.
- **The transformer** (chapter 12). Embeddings as a map of language with hundreds of dimensions, attention as knowing which earlier episode of a crime drama you need to understand this one, and a detour through Henri Bergson on time as attention rather than sequence.

The explanations need no background and do not talk down to the reader. The order matters as much: each chapter shows what the previous breakthrough made possible and what it could not do, so the chain from ImageNet to Atari to AlphaGo to AlphaZero to the transformer to AlphaFold to reasoning models reads as one argument.

## The feud at the centre

The thread that ties the history together is the rivalry between reinforcement learning and deep learning. It starts as geography: Hinton's deep learners in Toronto, Richard Sutton's reinforcement learners in Alberta, barely speaking. The RL theorist Csaba Szepesvári admits that neural networks work in practice but he will not use them because he cannot prove anything about them; Hinton tells his student Vlad Mnih, who wants to combine the two, "I've tried that. It doesn't work." Mnih goes to London and does it anyway, and the Atari agent is the result (chapter 6).

From there the book shows the pendulum swinging, and it never lets either side win for long:

| Period | Who looked right | What happened | What the other side contributed |
|---|---|---|---|
| 2006 to 2012 | Deep learning | Hinton's deep belief networks, then graphics chips, then Alex Krizhevsky's ImageNet win, trained in his bedroom; his three-person company sells to Google for $44 million (chapters 4 and 6) | Nothing yet: the two camps barely talk |
| 2013 | Both, for the first time | DeepMind's Atari agent learns dozens of games from pixels and a score; the room at the NIPS conference goes silent at the Breakout tunnel (chapter 6) | A convolutional network to see the screen, from deep learning; Q-learning, experience replay and a second network to keep its estimates honest, from RL |
| 2014 to 2016 | Reinforcement learning | AlphaGo beats Fan Hui five to nothing, then Lee Sedol four to one, with Move 37 (chapter 9) | The policy and value networks that stand in for intuition are deep learning, trained first on 150,000 human games |
| 2017 | Reinforcement learning, loudly | AlphaZero learns Go, chess and shogi from self-play alone, with no human games at all (chapter 12) | A residual network from Microsoft, deep enough to fold AlphaGo's two networks into one |
| 2017 to 2019 | Deep learning | LeCun calls RL the "cherry on the cake"; the transformer and GPT learn from unlabelled text, which removes RL's two selling points, learning without human labels and generating its own data (chapter 12) | Little, until post-training |
| 2017 to 2020 | Neither alone | Gaia, a simulated natural world for agents, fails; AlphaStar's win rate against StarCraft II's built-in bots jumps from 10 to 84 percent because of a transformer, then RL takes it to 99.8 percent against ranked humans; a pure self-play StarCraft agent never gets off the ground (chapter 13) | Each needed the other, and neither could do it alone |
| 2018 to 2020 | Deep learning, with biology | AlphaFold starts as an RL project and wins by mostly abandoning RL; "Protein folding is not a two-player game," Hassabis says (chapter 15) | A search step in the first AlphaFold, then nothing; the decisive ideas came from evolution and the transformer |
| 2022 to 2023 | Deep learning, tamed by RL | ChatGPT and DeepMind's unreleased Sparrow both become usable through reinforcement learning from human feedback; Silver's attempt to bring machine RL to Gemini stalls, because nobody can write a reward for a good haiku (chapters 16 to 18) | Human raters supply the reward that the game score used to supply |
| 2024 onward | Reinforcement learning again | Rewards from maths and logic problems with right answers teach models to reason step by step: OpenAI's o1, Gemini Flash Thinking, DeepSeek's R1-Zero; AlphaProof wins an Olympiad silver medal; Silver and Sutton announce the "Era of Experience" (chapters 19 and 20) | The language models being trained are deep learning; RL now runs on top of them, and so does reward hacking |

Every real breakthrough in the book combines both methods, and the side that looks wrong at any moment is usually waiting for the other side's next advance.

## What DeepMind got wrong

Mallaby is a sympathetic biographer, but he does not hide DeepMind's mistakes. DeepMind's 2010 business plan dismissed what it called the mistaken notion that language is intelligence expressed. Hassabis believed a model had to act in the world to understand it, and he misjudged GPT for years. He admits it: "you can't be Nostradamus every time" (chapter 13).

Afterwards he explains why. He had assumed the space of human behaviour was nearly infinite; it turned out that the roughly fourteen trillion words on the internet capture most of it. He compares the internet to the coal and oil the Industrial Revolution happened to find in the ground: nobody built it for AI, and it did not have to be there. I made the same argument from the other side in my review of Tim Berners-Lee's memoir, [The Web Was the Training Set](/articles/the-web-was-the-training-set/), and Hassabis reaches it from inside the lab.

The other mistakes were organisational. Google was stuck in Xerox PARC's dilemma: it invented the transformer and could not ship a chatbot without endangering search. DeepMind was stuck in Bell Labs' dilemma: a culture built for open-ended exploration could not switch to engineering when the path became obvious. DeepMind had a chatbot, Sparrow, with twenty-three behavioural rules and web search, nearly ready when ChatGPT launched, and it never shipped (chapters 16 and 17).

## The people

Peter Thiel backed DeepMind because it seemed contrarian and cheap, never believed in it, and nearly let it run out of money (chapter 7). Elon Musk promised money, tried to buy DeepMind for Tesla or SpaceX in a phone call from a closet, then co-founded OpenAI against it after sitting on DeepMind's own safety board (chapters 8 and 10). Mark Zuckerberg lost DeepMind at dinner when Hassabis noticed he was just as excited about virtual reality and 3D printing as about AI, then hired Yann LeCun to poach its staff (chapter 8). Larry Page called Musk a "speciesist" for preferring humans to machines (chapter 10). Sam Altman, seen mostly through the eyes of his rivals, appears as the man who wrote in 2015 that stopping humanity from developing AI was "almost definitely not" possible, and then did more than anyone to prove it. Dario Amodei turns up as the safety researcher who scaled GPT-2 and later left to found Anthropic.

Mustafa Suleyman's story is the hardest to read. He was the friend of Hassabis's younger brother and became a co-founder. His health work for the NHS was good (the Streams app cut the share of unnoticed urgent kidney cases from 12.4 to 3.3 percent, chapter 11) and was killed by a tabloid story about data. His campaign to put DeepMind under independent oversight ran for three years and failed (chapter 14). Then came a bullying investigation, a sabbatical, and a Bloomberg headline, and the friendship ended. Mallaby lets both men tell their side.

## Why it cannot be governed

Coming out of the book, I am more convinced than before that AI cannot be stopped, and cannot be governed, at least for now. That is my conclusion, but the book supplies most of the evidence for it. Every attempt to govern it from inside the industry fails, and the governments arrive late, with voluntary commitments:

- **The ethics and safety board** Google agreed to when it bought DeepMind met once, at SpaceX. Several of its guests then founded or funded a rival lab. "Our supposed advisers were really our rivals," Hassabis says (chapter 10).
- **The independent panel** that watched over DeepMind Health was shut down when Google absorbed the health team (chapter 14).
- **Project Mario**, three years of negotiation for a DeepMind with a board of three Google directors, three DeepMind directors and three independents, ended with nothing. Reid Hoffman pledged a billion dollars to a DeepMind that walked away, and it never happened (chapter 14).
- **OpenAI's nonprofit board** fired Altman and lasted five days (chapter 18).
- **The pause letter** in 2023 was signed by more than a thousand people, but not by the heads of the leading labs. Hassabis's objection holds up: a moratorium on models while chips and data centres keep improving would hand the next race to whoever has the most compute when it ends (chapter 18).

By 2025 Hassabis has concluded that "Safety isn't about governance structures" and that the best you can do is have a seat at the table. Mallaby calls this a "flimsy scaffolding of reassurance" and admits it may be the best on offer. I agree with him on both counts.

## The parts I recognised

There is a line in chapter 3 about Hassabis's "burning desire to play and win something, anything", which his first games studio tried to satisfy with fantasy football and StarCraft. When a colleague finally beat him at table football, he declared that his soul was on fire. I laughed, because I recognise the feeling. I played in a chess club when I was young, StarCraft is still my favourite strategy game, and I follow the Korean Brood War scene closely enough to have built [a site about it](https://broodwar.live). So the chapters on AlphaStar, and on AlphaGo against Lee Sedol in front of two hundred million viewers in Korea, were personal in a way most AI history is not.

So were the games. I loved Peter Molyneux's *Black & White* and later *Fable*, and Hassabis worked on the early design of *Black & White* because it was the first game whose creatures changed their own rules from the player's slaps and strokes, a small reinforcement learning system in a commercial game (chapter 2). Before that, as a teenager, he built the simulated visitors of *Theme Park*, who got thirsty from salty chips and sick on roller coasters. The book draws a straight line from those simulated worlds to Gaia, DeepMind's attempt at a simulated biosphere, and to Hassabis's fascination with Conway's Game of Life and emergence: put simple parts together and properties appear that none of the parts had. That is the question I keep coming back to in my own simulations, from [Hotaru](https://hotaru.raskell.io), a simulated neuron culture that learns to play Pong, to the engines in [Kishi](https://kishi.raskell.io). Kishi plays chess, shogi and Go, the same three games AlphaZero learned, and the [Learning to Play](/articles/learning-to-play/) series is my small-scale version of the questions in chapters 9 and 12. Hassabis also reached the top of the English shogi rankings.

The future he wants is close to the one I want: biology solved by computation, robots and automation doing the work, and abundance. He grew up on Iain Banks's Culture novels, and in chapter 7 he goes further than most people in the industry. He doubts universal basic income is the answer and prefers what he calls universal basic provision: housing, schooling, health care and travel at a level today's millionaires enjoy, free to every citizen, with work for anyone who wants a Ferrari. Silver, at the end of chapter 20, proposes a human right to AI assistance. Neither is a plan, but both are better starting points than most of the policy debate.

## Winning without controlling

Mallaby keeps two of Hassabis's traits in view for the whole book, and they happen to be two I share. He is ferociously competitive: Hinton calls him the only person he has met who is more competitive than Hinton. And he insists, from chapter 2 onward, that he does not want to control anyone, saying it is "really bad to manipulate or control people", a value he traces to his mother's church. He also does not seem to care about money. At eighteen he refused to cash a £500,000 cheque from Molyneux so he could go to Cambridge. When he sold DeepMind, he and Suleyman negotiated the research budget before the price, and in the epilogue he says he would not have swapped the Nobel for any amount of money. He drives a ten-year-old Audi and his one luxury is a Liverpool season ticket.

Mallaby tests the claim about control, and the evidence is mixed:

- At Elixir, Hassabis's "Jedi mind trick" inspired a team past the point of honest feedback. "Who would've thought that you can actually inspire people too much?" he says later (chapter 3). A psychologist tells Mallaby that charismatic people cannot avoid dominating others, however hard they try.
- He walked away from venture capital at Elixir because giving up half the company meant being controlled. At DeepMind he took nine times as many shares as his scientific co-founder because he wanted control of the mission (chapter 5).
- He hated domination in both directions: he would not dominate, and he would not be dominated. When Suleyman challenged his direction, he let an investigation do what a conversation should have done (chapter 14).
- In the epilogue Mallaby puts it to him directly: "He had told me repeatedly that he didn't want to control others. And yet he did control people." Hassabis answers that he exercises a reluctant power, because the things he wants to do require large teams.

For anyone who likes to win and dislikes power, this is a warning: the first trait puts you in situations where you have to exercise the power the second trait wants to avoid. Hassabis's answer, that power is acceptable as a means to the work and never as an end, is the right one. But the book shows how much discipline it takes to keep it a means.

## Where it falls short

The half point I hold back is mostly about distance. Mallaby states his verdict in the introduction, that Hassabis is "decent and public-spirited", before the evidence, and although the book does test it, Hassabis gets the last word on most disputes. OpenAI and Anthropic are seen from outside, mostly through people who left them or competed with them, so Altman is drawn almost entirely by his rivals. And Mallaby editorialises in places where he could have reported: he is hard on the independent panel that criticised DeepMind Health, generous to DeepMind in the argument over Gemini's benchmarks, and at one point says DeepSeek's R1-Zero was, "for all intents and purposes", self-aware, a claim the evidence he gives does not support.

The last chapters also read like dispatches. They race through benchmarks and product names that are already dated, and they lack the calm of the chapters about Cambridge, Elixir and AlphaGo. That may be unavoidable in a book finished in 2026 about a race still running, and none of it changes my recommendation.

## Who should read it

Anyone who wants to understand the last fifteen years of AI through the people who made them, with the concepts explained along the way. No technical background is needed, and if you have one, the explanations are still worth reading for their order and their analogies. It pairs well with the forecasts on [my reading log](/reading/) such as *AI 2027*: those describe where this might go, and this book shows who is driving and why, and how little anyone, including the drivers, controls the route.

The book ends with Hassabis in a pub, saying that it should feel amazing to watch his dreams come true and does not, because of the mad rush. He is still optimistic.
