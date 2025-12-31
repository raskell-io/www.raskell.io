+++
title = "Looking back on 2025"
date = 2025-12-31
description = "On reading Tim Berners-Lee in Okinawa, and why AI might accidentally save the web from itself."

[taxonomies]
tags = ["ai-for-ops", "edge-systems", "oss"]
categories = ["deep-dives"]

[extra]
author = "Raffael"
image = "looking-back-on-2025.avif"
+++

I spent part of this year on the shores of Okinawa. The water there is something else entirely — this impossible azure that shifts to turquoise in the shallows, so clear you can see the coral formations from the surface. I found myself thinking about systems while I was there, the way you do when you're floating in salt water with nothing pressing to attend to.

Between swims, I read Tim Berners-Lee's "This is for everyone." I've been building web software for over a decade now, and I thought I understood what the web was. But reading TBL's words while watching that reef ecosystem do its thing — thousands of species in constant exchange, no central coordinator, just emergent complexity from simple rules — something shifted in how I saw it all.

The web TBL imagined was supposed to work like that reef. A commons. Many small nodes, each doing their own thing, connected through open protocols. Information flowing freely. The beauty of it wasn't in any single node but in the connections between them, the way the whole became more than the sum of its parts. The same principle that makes a reef resilient makes a network powerful: diversity, redundancy, local adaptation.

What we built instead looks more like industrial aquaculture. Five platforms. Algorithmic monoculture. Content optimized for engagement metrics rather than usefulness. We took a system designed for decentralization and built the most centralized information infrastructure in human history.

I keep thinking about how that happened. The web itself never changed — HTTP still works the same way, HTML still does what it always did. What changed was the economics. Publishing became free, but being *found* became expensive. The platforms positioned themselves as the gatekeepers of attention, and suddenly you couldn't reach people without paying the toll, whether in ad spend or in algorithmic compliance or in the slow erosion of doing whatever it took to game SEO.

The thing about monocultures is they're efficient right up until they're not. A reef can lose a species and adapt. A monoculture gets one disease and collapses. We've been watching the web's monoculture show stress fractures for years — the enshittification of platforms, the SEO content farms drowning out signal with noise, the way social media stopped being social and started being a feed of engagement-optimized content from strangers.

Then 2025 happened, and AI started breaking things in interesting ways.

The obvious take is that AI makes the content problem worse. And superficially, that's true — if you thought SEO spam was bad before, wait until you see what happens when generating ten thousand pages of plausible-sounding garbage costs essentially nothing. The content farms went into overdrive. Social platforms filled with synthetic engagement.

But here's the thing I keep coming back to: maybe that's the fever that breaks the infection.

The old economics of the web depended on a particular scarcity. Human attention is finite, and the platforms controlled access to it. You wanted eyeballs, you played their game. SEO worked because Google was the gateway and you could optimize for what Google wanted. Platform distribution mattered because that's where the people were.

AI disrupts this in ways that I think are genuinely interesting. When an AI assistant can synthesize information from across the web and deliver it directly to the user, the value of ranking first on Google diminishes. Why click through to a content farm when the answer is already in front of you? When AI agents can find and surface relevant content directly, you don't need to be on the platform where the eyeballs gather. The middleman's leverage starts to evaporate.

And crucially: when everyone can generate infinite content at zero marginal cost, content quantity becomes worthless. What matters is provenance. Accuracy. Usefulness. The things that are actually hard. The things that require a human perspective, or at least require *being right* in ways that matter.

I find myself unexpectedly optimistic about what comes next.

If AI breaks the distribution stranglehold that platforms have, the economics of the web could flip in interesting directions. The old model needed scale because reaching people was expensive. But if AI handles discovery — finding relevant content and bringing it to users — then maybe you don't need scale anymore. Maybe small becomes viable again.

Think about what this means concretely. A static site costs nearly nothing to run. No databases to scale, no servers to babysit, just files sitting on edge nodes around the world. If you don't need to capture user data for ad-driven personalization, you don't need the complexity of the surveillance stack. If you don't need platform distribution, you don't need to play platform games.

There's another piece to this that I think most people are missing: edge computing changes what personalization can mean. The conventional wisdom is that personalization requires surveillance — you need to know everything about a user to show them relevant content. But that's only true if personalization happens in a centralized database somewhere. If personalization happens at the edge, at the moment of request, you can adapt content to context without ever needing to know who the user is. The edge function doesn't need a profile. It just needs to know what was asked for and what context it's being asked in.

This is the architecture I keep thinking about: static content at the origin, edge functions that adapt it anonymously, AI agents that find and surface it based on actual relevance rather than SEO gaming. No surveillance required. No platform dependency. No scaling costs that force you into growth-at-all-costs mode.

It looks more like a reef than a fish farm.

I don't want to oversell this. The transition, if it happens, won't be clean. The platforms aren't going to quietly cede control. The incentives that built the current web are still operating. And AI itself could go in directions that make things worse rather than better — there are plenty of dystopian paths from here.

But when I think about what I want to build toward, it's that reef model. Many small, specialized nodes. Interconnected through open protocols. Resilient because distributed. Sustainable because the economics work at small scale.

This site is part of that bet. Static content, no tracking, no platform dependencies. The tools I'm working on — Sentinel, Sango, Ushio — they're all about making edge infrastructure more accessible, making it easier to build and operate systems that are distributed and independent.

2025 was the year AI started breaking the old model. I don't know exactly what grows in its place. But floating in that Okinawan water, watching the reef do what reefs do, I got a sense of what healthy systems look like. Diverse. Interconnected. Resilient. Not optimized for any single metric, but somehow working anyway.

That's what I'm betting on.
