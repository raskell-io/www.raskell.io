+++
title = "I Stopped Writing Most of My Code"
date = 2026-06-10
description = "Slide deck for IT's ABOUT TECH #13 in Basel. A 15-minute story about what changed for a long-time engineer after Claude Opus 4.5 and Claude Code arrived, and what happens to a backlog of years-old ideas when the bottleneck stops being time."
template = "slide-deck.html"

[extra]
event = "IT's ABOUT TECH #13"
event_url = "https://www.swissmadesoftware.org/en/news/2026/iat--13.html"
venue = "FHNW Aula, Basel"
event_date_human = "10 June 2026"
+++

<section class="slide slide--title">
  <div class="slide__inner">
    <p class="slide__eyebrow">IT's ABOUT TECH #13 · Basel · 10 June 2026</p>
    <h1 class="slide__title slide__title--xl">I Stopped Writing Most of My Code</h1>
    <p class="slide__sub">The year my backlog came alive.</p>
    <p class="slide__id">
      <span class="slide__id-item">
        <img class="slide__avatar" src="/talks/iat-13-basel/raffael-portrait.png" alt="Raffael Schneider" width="64" height="64">
        <span>Raffael Schneider</span>
      </span>
      <span class="slide__id-sep" aria-hidden="true">·</span>
      <span class="slide__id-item slide__id-item--brand">
        <img class="slide__avatar slide__avatar--brand" src="/raskell-mascot.avif" alt="Raskell tanuki" width="64" height="64">
        <a href="https://raskell.io">raskell.io</a>
      </span>
    </p>
  </div>
</section>

<section class="slide">
  <div class="slide__inner">
    <p class="slide__eyebrow">01</p>
    <h2 class="slide__title slide__title--mono">May → November&nbsp;2025</h2>
    <p class="slide__lede">Two milestones, six months apart.</p>
    <ol class="slide__timeline">
      <li>
        <span class="slide__timeline-date">Before</span>
        <p>Mostly using Zed's AI offering. Solid editor, fine integrations. Nothing that changed how I worked.</p>
      </li>
      <li>
        <span class="slide__timeline-date">May 2025</span>
        <p><strong>Claude Code drops.</strong> I take the $20 Anthropic subscription on day one. Early adopter, on a hunch.</p>
      </li>
      <li>
        <span class="slide__timeline-date">November 2025</span>
        <p><strong>Opus 4.5 ships.</strong> I upgrade to the $200 Max 20× plan right before Christmas vacation. A better model meets three weeks of free time on my hands.</p>
      </li>
    </ol>
    <p class="slide__kicker">I am an engineer. I know how to build things.</p>
    <p class="slide__kicker slide__kicker--strong">The bottleneck was never ideas. The bottleneck was always time.</p>
  </div>
</section>

<section class="slide">
  <div class="slide__inner">
    <p class="slide__eyebrow">02</p>
    <h2 class="slide__title">Then something changed.</h2>
    <div class="slide__stack">
      <div class="slide__pill">
        <img class="slide__pill-icon slide__pill-icon--brand" src="/talks/iat-13-basel/claude.svg" alt="" width="32" height="32">
        Claude Opus 4.5
      </div>
      <div class="slide__pill">
        <img class="slide__pill-icon slide__pill-icon--brand" src="/talks/iat-13-basel/claude-code.png" alt="" width="32" height="32">
        Claude Code
      </div>
    </div>
    <p class="slide__quote">
      I expected a better autocomplete.<br>
      What I got was something closer to a junior engineer that never sleeps.
    </p>
  </div>
</section>

<section class="slide">
  <div class="slide__inner">
    <p class="slide__eyebrow">03</p>
    <h2 class="slide__title">The new workflow</h2>
    <div class="slide__compare">
      <div class="slide__compare-col">
        <p class="slide__compare-label">Before</p>
        <ul>
          <li>Decide what to build</li>
          <li class="is-heavy">Translate thoughts into syntax</li>
          <li>Review and ship</li>
        </ul>
      </div>
      <div class="slide__compare-col">
        <p class="slide__compare-label">After</p>
        <ul>
          <li class="is-heavy">Decide what to build</li>
          <li>Translate thoughts into syntax</li>
          <li class="is-heavy">Decide whether the result is acceptable</li>
        </ul>
      </div>
    </div>
    <p class="slide__kicker slide__kicker--strong">
      You no longer spend most of your time translating thoughts into syntax.
      You spend most of your time deciding.
    </p>
  </div>
</section>

<section class="slide">
  <div class="slide__inner">
    <p class="slide__eyebrow">04</p>
    <h2 class="slide__title">What I actually built</h2>
    <div class="slide__grid slide__grid--icons">
      <a class="slide__card slide__card--linked" href="https://arcanist.sh" target="_blank" rel="noopener">
        <img class="slide__card-icon" src="/talks/iat-13-basel/arcanist.svg" alt="" width="48" height="48" loading="lazy">
        <div>
          <h3>Arcanist.sh</h3>
          <p>Haskell ecosystem in Rust. Home of <strong>hx</strong> and <strong>BHC</strong>.</p>
        </div>
      </a>
      <a class="slide__card slide__card--linked" href="https://archipelag.io" target="_blank" rel="noopener">
        <img class="slide__card-icon" src="/talks/iat-13-basel/archipelag.png" alt="" width="48" height="48" loading="lazy">
        <div>
          <h3>Archipelag.io</h3>
          <p>Distributed AI compute. Inference across idle GPUs and mining rigs.</p>
        </div>
      </a>
      <a class="slide__card slide__card--linked" href="https://zentinelproxy.io" target="_blank" rel="noopener">
        <img class="slide__card-icon" src="/talks/iat-13-basel/zentinel.png" alt="" width="48" height="48" loading="lazy">
        <div>
          <h3>Zentinel</h3>
          <p>Security-first reverse proxy on Pingora.</p>
        </div>
      </a>
      <a class="slide__card slide__card--linked" href="https://cyanea.bio" target="_blank" rel="noopener">
        <img class="slide__card-icon" src="/talks/iat-13-basel/cyanea.png" alt="" width="48" height="48" loading="lazy">
        <div>
          <h3>Cyanea</h3>
          <p>Open community platform for life-science research.</p>
        </div>
      </a>
      <a class="slide__card slide__card--linked" href="https://die-zukunft.ch" target="_blank" rel="noopener">
        <img class="slide__card-icon" src="/talks/iat-13-basel/die-zukunft.png" alt="" width="48" height="48" loading="lazy">
        <div>
          <h3>Die Zukunft</h3>
          <p>A Swiss political party. Founded entirely outside office hours.</p>
        </div>
      </a>
      <a class="slide__card slide__card--linked" href="https://humankind.plus" target="_blank" rel="noopener">
        <img class="slide__card-icon" src="/talks/iat-13-basel/humankind.png" alt="" width="48" height="48" loading="lazy">
        <div>
          <h3>Humankind</h3>
          <p>A long-running creative initiative, finally with a home of its own.</p>
        </div>
      </a>
    </div>
    <p class="slide__minor-label">Experiments and tooling</p>
    <ul class="slide__minor-chips">
      <li><img src="/talks/iat-13-basel/terrarium.png" alt="" width="20" height="20"> Terrarium</li>
      <li>Shiioo</li>
      <li>Conflux</li>
      <li>Refrakt</li>
      <li><img src="/talks/iat-13-basel/kurumi.png" alt="" width="20" height="20"> Kurumi</li>
      <li>Vela</li>
      <li>…and the daily-driver utilities</li>
    </ul>
    <p class="slide__kicker slide__kicker--strong">
      None of these were started because AI generated ideas.
      AI allowed existing ideas to escape my notebook.
    </p>
  </div>
</section>

<section class="slide">
  <div class="slide__inner">
    <p class="slide__eyebrow">05</p>
    <h2 class="slide__title">What AI is still bad at</h2>
    <ul class="slide__list">
      <li>Requirements</li>
      <li>Architecture tradeoffs</li>
      <li>Long-term maintainability</li>
      <li>Taste</li>
      <li>Product decisions</li>
      <li>Knowing when not to build something</li>
    </ul>
    <p class="slide__kicker slide__kicker--strong">
      The human did not disappear. The human moved up the stack.
    </p>
  </div>
</section>

<section class="slide slide--closing">
  <div class="slide__inner">
    <p class="slide__eyebrow">06</p>
    <h2 class="slide__title">The unexpected consequence</h2>
    <p class="slide__quote slide__quote--xl">
      I thought AI would make me write software faster.<br>
      Instead, it made me start projects I would never have started before.
    </p>
    <p class="slide__kicker slide__kicker--strong">
      The biggest change was not productivity. The biggest change was permission.
    </p>
  </div>
</section>

<section class="slide">
  <div class="slide__inner">
    <p class="slide__eyebrow">07</p>
    <h2 class="slide__title">What happened next</h2>
    <ol class="slide__timeline">
      <li>
        <span class="slide__timeline-date">March 2026 · San Francisco</span>
        <p>Co-presented an AI Web Security tool at <strong>RSAC 2026</strong> with <strong>Milan Duric</strong>. Same trip: a private downtown dinner hosted by <strong>Maverick Capital</strong>, room of AI Platform leaders.</p>
      </li>
      <li>
        <span class="slide__timeline-date">Spring 2026</span>
        <p>Shipped a <strong>Temporal-based self-service</strong> that lets users order web-service resources while AI quietly handles the operational work. Role at the time: Senior Platform Engineer & Solution Architect, Web Security / Application Delivery.</p>
      </li>
      <li>
        <span class="slide__timeline-date">Two weeks ago</span>
        <p>New role: <strong>Enterprise Solution Architect</strong> for Group-wide AI Platform and AI-assisted development.</p>
      </li>
      <li>
        <span class="slide__timeline-date">Last week</span>
        <p>Joined <a href="https://thejfloor.com/"><strong>J floor</strong></a>. More talks already on the calendar.</p>
      </li>
    </ol>
    <p class="slide__kicker slide__kicker--strong">
      None of this was on my calendar a year ago.
    </p>
  </div>
</section>

<section class="slide slide--end">
  <div class="slide__inner">
    <p class="slide__eyebrow">Thank you</p>
    <p class="slide__quote slide__quote--final">
      The most important thing Claude Code gave me was not faster software development.
      It gave me the ability to turn years of accumulated ideas into working systems
      before I lost interest in them.
    </p>
    <p class="slide__byline slide__byline--icons">
      <a href="https://raskell.io">
        <img class="slide__byline-icon slide__byline-icon--img" src="/raskell-mascot.avif" alt="" width="20" height="20">
        raskell.io
      </a>
      <span class="slide__byline-sep" aria-hidden="true">·</span>
      <a href="https://ch.linkedin.com/in/raffael-e-schneider">
        <svg class="slide__byline-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
        LinkedIn
      </a>
      <span class="slide__byline-sep" aria-hidden="true">·</span>
      <a href="https://twitter.com/raskelll">
        <svg class="slide__byline-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
        @raskelll
      </a>
    </p>
  </div>
</section>
