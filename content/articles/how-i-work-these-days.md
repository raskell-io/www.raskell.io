+++
title = "How I Work These Days"
date = 2026-03-15
updated = 2026-03-15
description = "From Kaggle and Hugging Face in 2020 to coding agents in late 2025, this is the shift that changed how I build, how I work, and why my daily routine now feels like the one I had been waiting for."

[taxonomies]
tags = ["ai-for-ops", "oss", "platform-automation"]
categories = ["meta"]

[extra]
author = "Raffael"
image = "how-i-work-these-days.avif"
og_image = "how-i-work-these-days.png"
+++

If you had asked me a few years ago what kind of shift would truly change software again, I would probably have said something vague about machine learning becoming more useful, more accessible, more integrated into normal tooling. I would not have said that within a few years I would be spending large parts of my day in conversation with models, building products at a pace that used to feel unrealistic for one person.

But that is where I am now, and the path here did not start with ChatGPT. It started earlier.

## Before the shock

I had been on Kaggle and Hugging Face since 2020. I was already paying attention. I had a decent understanding of machine learning, enough to know that something important was happening. I was not looking at this space as an outsider who suddenly discovered AI in a news cycle. I had been around it long enough to see that the ingredients were there.

Still, understanding a field and feeling a historical shift are not the same thing. When OpenAI released ChatGPT 3.5 in November 2022, something in me changed almost immediately. I do not mean that in a mystical way. I mean I recognized, very quickly, that this was not just another incremental product launch. It felt like a boundary marker, one of those moments where you can see a new layer of the technology stack forming in front of you.

At the time, I thought: this is going to be enormous. Bigger than most people realize. Bigger, maybe, than the web itself in terms of how deeply it will alter the shape of work, software, and the distribution of capability. That sounds exaggerated when people say it too casually. I know that. But that was honestly my reaction back then. Not hype. Recognition.

I was one of the early people willing to pay OpenAI. That mattered to me. I wanted access, and I wanted to stay close to the frontier as it moved. I did not want to be reading second-hand summaries while something this consequential was taking shape in real time.

## The part I still underestimated

Even then, I still underestimated one thing: the speed. I understood generative AI was around the corner. I did not understand just how fast it would become operationally useful for actual software creation.

I had read AI 2027, the scenario work by Daniel Kokotajlo, Scott Alexander, Thomas Larsen, Eli Lifland, and Romeo Dean. It stayed with me, and it still does now in March 2026. I still think the basic direction it sketches is largely correct, even if the path is turning out a bit differently in practice than any single forecast can capture. But even with that framing in my head, I did not fully expect that less than two years after ChatGPT 3.5, coding agents would already start to feel like a real category rather than a novelty.

That part came faster than I thought.

## Paying attention, waiting for the right moment

In 2025 I was trying different tools seriously. I was paying for Claude Code from May 2025 onward, but I was not especially impressed at first. I liked the CLI orientation. I liked that it felt coder-friendly. That part made sense to me immediately. But the model quality at that moment, and the rate limiting, left me cold. It was interesting. It was not yet transformative for my own workflow.

So I mostly leaned on Zed's offering. I liked the editor experience, and I still do. I still reach for Zed when I want to inspect, edit, or move through files outside of Vim in the terminal. It fit me better in that phase.

Then November 2025 arrived, three years after ChatGPT 3.5, and then December came with Christmas break. I gave Claude Code another real try, this time with Opus 4.5, and that was the moment it really landed for me. Not politely. Not academically. It hit me hard.

I remember the feeling very clearly: this is it. This is the first time the whole thing feels like more than an assistant and less than a gimmick. This is a tool I can genuinely build with.

## Zentinel was the proof

Zentinel had been sitting in the back of my mind for a long time. The idea was not new. The frustration behind it was not new either. At my day job, we had been dealing with unreliable reverse proxies for long enough that the pain was familiar. I had always wanted River, the Pingora-based reverse proxy, to succeed. I wanted that project to become the thing I could reach for and trust. But it never got there.

So I did what this new moment suddenly made possible: I stopped waiting for somebody else to build the thing I wanted to exist.

I built Zentinel with Opus 4.5, and it worked.

That is the part that still feels a little surreal when I say it plainly. Three months later it is up, it is real, and people are using it. Not as a demo. Not as an abandoned prototype. As actual software in the hands of actual users.

That changed something fundamental in how I think about work. Once one long-held idea made it through that bottleneck, a lot of others started moving too. It was not just that I had a new tool. It was that the relationship between ambition and execution had changed. The old constraint, the one that said "yes, this could exist, but not with your current time and current bandwidth," had weakened.

## Then everything else started moving

In the time since, I have built a whole range of things that had been accumulating in my head for years: Cyanea, Archipelag, Humankind, Arcanist and its Rust-based `hx` Haskell toolchain, the new Basel Haskell Compiler, and other pieces besides.

It has been a wild ride, but not in the shallow "everything is crazy" sense people often write about. More in the sense that an internal dam broke. For a long time I had more ideas than I had time, more design clarity than I had execution bandwidth, and more conviction than I had manpower. That is a frustrating place to live in for years. You learn to carry around a quiet backlog of unrealized things. Some of them stay alive as notes. Some become recurring thoughts during commutes or late at night. Some start to hurt a little because you know they are viable, but you also know you are not going to get to them with the tools and energy available to you at that point in your life.

Now the world is different. I can finally push through the backlog that used to exist only in notebooks, mental sketches, half-written design docs, and conversations with myself.

## What my days look like now

My daily routine changed dramatically.

I still have a day job, and then I have the rest of my work. Together it often adds up to something close to sixteen hours a day. That would sound bleak if I were forcing it. It does not feel bleak. It feels like release.

My workspace reflects that change. These days I use mostly Apple hardware, which is funny if you know how much of a Linux person I am, and how much of an OpenBSD person I still am. That part of me has not gone anywhere. I still love those systems. I still think they matter deeply. But if I am being honest about the practical question of where I am most productive right now, Apple has become the answer.

I work across a MacBook Pro M4, an iMac, and an Apple Vision Pro. I spend time talking ideas out in real time with ChatGPT's voice mode, using it less like a search engine and more like a sparring partner. Sometimes intimate, sometimes brutally honest, sometimes audacious in exactly the way a good thinking partner should be. I push an idea, it pushes back, I sharpen it, it sharpens me, and we keep going until something solid emerges.

![My desk setup right now](/how-i-work-these-days-desk.avif)

Then there is the terminal, where much of the actual implementation happens in Ghostty, usually with four panes open, often with multiple Claude Code agents running in parallel on the Max plan. Two hundred dollars a month for that level of leverage is, for me, one of the clearest trades I have ever made.

This is not a lifestyle performance. It is just the current shape of my work: ideas moving between speech, terminal, editor, design notes, code, back to speech, then back to code again.

## Beast mode, for lack of a better term

There is a part of this that feels almost embarrassingly direct to say, but it would be dishonest to leave it out: I am the happiest I have ever been.

Not because everything is easy. It is not. Not because every project succeeds. They will not. Not because the industry suddenly became sane. It did not.

I am happy because the mismatch that used to define so much of my working life has narrowed. For years I had to live with the feeling that my ideas were outrunning my available hours and my available hands. Now, for the first time, it feels like I can actually meet myself where my ambition has been waiting.

There is a phrase people use, "beast mode," and usually I would avoid it because it sounds like posturing. But I do not really have a cleaner shorthand for the intensity of this period. I am working hard, very hard, but with a degree of joy and clarity that makes the effort feel proportionate.

I am in conquest mode.

Not conquest in the empty startup sense. Not domination, not vanity metrics, not growth for its own sake. I mean conquest over the inertia that used to keep good ideas trapped inside my head. Conquest over backlog. Conquest over hesitation. Conquest over the old excuses about lacking time, lacking team, lacking the right moment.

And yes, some of it is for me. To feel better. To feel more whole. To stop carrying around years of deferred execution. But some of it is also because I genuinely want to make useful things. I want to build software that improves the texture of work, that makes systems more reliable, that gives people better tools, that opens up possibilities that were previously too expensive or too cumbersome to pursue.

That still matters to me. Probably more than ever.

## The real change

So when I say that the way I work these days has changed, I do not just mean that I use different tools.

I mean that the relation between thought and execution changed. The lag collapsed. The emotional burden of unrealized ideas shrank. The number of things that are now viable to attempt expanded dramatically. That is the real story.

I was already paying attention in 2020. I recognized the significance of ChatGPT in 2022. I underestimated the speed anyway. Then late 2025 arrived, the tools crossed a threshold, and my daily life reorganized itself around that fact.

Three years is not a long time. It feels longer when you live through a real transition.

And I suspect we are still early.

## References and further reading

- [AI 2027](https://ai-2027.com/) - Scenario work that influenced how I thought about the trajectory of this space
- [Zed](https://zed.dev/) - Editor I still use alongside Vim
- [Ghostty](https://ghostty.org/) - Terminal I use for most of my agent-heavy coding sessions
- [Zentinel](https://zentinelproxy.io/) - Reverse proxy project that became the first real proof point for this workflow
- [Cyanea](https://cyanea.bio/) - One of the projects that came to life during this period
- [Archipelag](https://archipelag.io/) - Another product that moved from idea to reality in this new working mode
