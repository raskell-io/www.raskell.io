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
        <span class="slide__id-text">
          <span class="slide__id-name">Raffael Schneider</span>
          <span class="slide__id-role">Enterprise Solution Architect</span>
          <span class="slide__id-org">AI Platforms</span>
        </span>
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
    <h2 class="slide__title">It came down to three subscriptions.</h2>
    <p class="slide__subline">December 2022 → November&nbsp;2025</p>
    <ol class="slide__timeline">
      <li>
        <span class="slide__timeline-date">December 2022</span>
        <p><strong>OpenAI.</strong> Subscription almost day one. Chat-first AI joins my daily workflow and stays there.</p>
      </li>
      <li>
        <span class="slide__timeline-date">Then Zed</span>
        <p>A Rust-built editor that bet on AI very early. The best LLM integrations of its era. My gateway to AI-assisted development while Cursor, Windsurf, and Copilot were finding their feet.</p>
      </li>
      <li>
        <span class="slide__timeline-date">May 2025</span>
        <p><strong>Claude Code drops.</strong> First TUI-first coding agent. I take the $20 Anthropic subscription the day it ships. Hooked.</p>
      </li>
      <li>
        <span class="slide__timeline-date">November 2025</span>
        <p><strong>Opus 4.5 ships.</strong> I upgrade to the $200 Max 20× plan right before Christmas vacation. Three weeks of free time meets a step-change in capability.</p>
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
      <a class="slide__card slide__card--linked" href="https://archipelag.io" target="_blank" rel="noopener">
        <img class="slide__card-icon" src="/talks/iat-13-basel/archipelag.png" alt="" width="48" height="48" loading="lazy">
        <div>
          <h3>Archipelag.io</h3>
          <p>Distributed AI compute. Inference across idle GPUs and mining rigs.</p>
        </div>
      </a>
      <a class="slide__card slide__card--linked" href="https://cyanea.bio" target="_blank" rel="noopener">
        <img class="slide__card-icon" src="/talks/iat-13-basel/cyanea.png" alt="" width="48" height="48" loading="lazy">
        <div>
          <h3>Cyanea</h3>
          <p>Open community platform for life-science research.</p>
        </div>
      </a>
      <a class="slide__card slide__card--linked" href="https://humankind.plus" target="_blank" rel="noopener">
        <img class="slide__card-icon" src="/talks/iat-13-basel/humankind.png" alt="" width="48" height="48" loading="lazy">
        <div>
          <h3>Humankind</h3>
          <p>A long-running creative initiative, finally with a home of its own.</p>
        </div>
      </a>
      <a class="slide__card slide__card--linked" href="https://arcanist.sh" target="_blank" rel="noopener">
        <img class="slide__card-icon" src="/talks/iat-13-basel/arcanist.svg" alt="" width="48" height="48" loading="lazy">
        <div>
          <h3>Arcanist.sh</h3>
          <p>Haskell ecosystem in Rust. Home of <strong>hx</strong> and the <strong>Basel Haskell Compiler</strong>.</p>
        </div>
      </a>
      <a class="slide__card slide__card--linked" href="https://zentinelproxy.io" target="_blank" rel="noopener">
        <img class="slide__card-icon" src="/talks/iat-13-basel/zentinel.png" alt="" width="48" height="48" loading="lazy">
        <div>
          <h3>Zentinel</h3>
          <p>Security-first reverse proxy on Pingora.</p>
        </div>
      </a>
      <a class="slide__card slide__card--linked" href="https://die-zukunft.ch" target="_blank" rel="noopener">
        <img class="slide__card-icon" src="/talks/iat-13-basel/die-zukunft.png" alt="" width="48" height="48" loading="lazy">
        <div>
          <h3>Die Zukunft</h3>
          <p>A Swiss political party. Past left and right, into UBI, digital sovereignty, and a serious technology agenda.</p>
        </div>
      </a>
    </div>
    <p class="slide__minor-label">Experiments and tooling</p>
    <ul class="slide__minor-chips">
      <li><img src="/talks/iat-13-basel/terrarium.png" alt="" width="20" height="20"> Terrarium</li>
      <li><svg class="slide__minor-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.55 0-.27-.01-1.18-.02-2.14-3.2.69-3.87-1.36-3.87-1.36-.52-1.33-1.27-1.69-1.27-1.69-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.75 2.68 1.24 3.34.95.1-.74.4-1.24.73-1.53-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.76 0c2.2-1.49 3.17-1.18 3.17-1.18.62 1.59.23 2.76.11 3.05.74.81 1.18 1.84 1.18 3.1 0 4.42-2.69 5.39-5.25 5.68.41.36.78 1.06.78 2.14 0 1.55-.01 2.79-.01 3.17 0 .31.21.67.8.55C20.21 21.39 23.5 17.08 23.5 12 23.5 5.65 18.35.5 12 .5z"/></svg> Shiioo</li>
      <li><svg class="slide__minor-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.55 0-.27-.01-1.18-.02-2.14-3.2.69-3.87-1.36-3.87-1.36-.52-1.33-1.27-1.69-1.27-1.69-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.75 2.68 1.24 3.34.95.1-.74.4-1.24.73-1.53-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.76 0c2.2-1.49 3.17-1.18 3.17-1.18.62 1.59.23 2.76.11 3.05.74.81 1.18 1.84 1.18 3.1 0 4.42-2.69 5.39-5.25 5.68.41.36.78 1.06.78 2.14 0 1.55-.01 2.79-.01 3.17 0 .31.21.67.8.55C20.21 21.39 23.5 17.08 23.5 12 23.5 5.65 18.35.5 12 .5z"/></svg> Conflux</li>
      <li><svg class="slide__minor-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.55 0-.27-.01-1.18-.02-2.14-3.2.69-3.87-1.36-3.87-1.36-.52-1.33-1.27-1.69-1.27-1.69-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.75 2.68 1.24 3.34.95.1-.74.4-1.24.73-1.53-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.76 0c2.2-1.49 3.17-1.18 3.17-1.18.62 1.59.23 2.76.11 3.05.74.81 1.18 1.84 1.18 3.1 0 4.42-2.69 5.39-5.25 5.68.41.36.78 1.06.78 2.14 0 1.55-.01 2.79-.01 3.17 0 .31.21.67.8.55C20.21 21.39 23.5 17.08 23.5 12 23.5 5.65 18.35.5 12 .5z"/></svg> Refrakt</li>
      <li><img src="/talks/iat-13-basel/kurumi.png" alt="" width="20" height="20"> Kurumi</li>
      <li><svg class="slide__minor-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.55 0-.27-.01-1.18-.02-2.14-3.2.69-3.87-1.36-3.87-1.36-.52-1.33-1.27-1.69-1.27-1.69-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.75 2.68 1.24 3.34.95.1-.74.4-1.24.73-1.53-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.76 0c2.2-1.49 3.17-1.18 3.17-1.18.62 1.59.23 2.76.11 3.05.74.81 1.18 1.84 1.18 3.1 0 4.42-2.69 5.39-5.25 5.68.41.36.78 1.06.78 2.14 0 1.55-.01 2.79-.01 3.17 0 .31.21.67.8.55C20.21 21.39 23.5 17.08 23.5 12 23.5 5.65 18.35.5 12 .5z"/></svg> Vela</li>
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
    <h2 class="slide__title">Where the human still steers.</h2>
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
    <svg class="slide__diagram" viewBox="0 0 1200 320" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="diag05-title">
      <title id="diag05-title">Before: the human reasoned about syntax; the compiler enforced it. Now: the human reasons about meaning; the coding agent interprets it.</title>
      <defs>
        <marker id="diag05-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
          <path d="M0 0 L10 5 L0 10 z" fill="#a8acba"/>
        </marker>
      </defs>
      <text x="22" y="89" class="slide__diagram-row-label">Before</text>
      <g class="slide__diagram-node">
        <rect x="140" y="55" width="240" height="70" rx="14"/>
        <text x="260" y="86">Human</text>
        <text x="260" y="108" class="slide__diagram-node-sub">reasons about</text>
      </g>
      <line x1="395" y1="90" x2="465" y2="90" class="slide__diagram-arrow" marker-end="url(#diag05-arrow)"/>
      <g class="slide__diagram-node slide__diagram-node--soft">
        <rect x="480" y="55" width="240" height="70" rx="14"/>
        <text x="600" y="86">Syntax</text>
        <text x="600" y="108" class="slide__diagram-node-sub">enforced by</text>
      </g>
      <line x1="735" y1="90" x2="805" y2="90" class="slide__diagram-arrow" marker-end="url(#diag05-arrow)"/>
      <g class="slide__diagram-node">
        <rect x="820" y="55" width="240" height="70" rx="14"/>
        <text x="940" y="86">Compiler</text>
        <text x="940" y="108" class="slide__diagram-node-sub">that makes it work</text>
      </g>
      <text x="22" y="239" class="slide__diagram-row-label">Now</text>
      <g class="slide__diagram-node">
        <rect x="140" y="205" width="240" height="70" rx="14"/>
        <text x="260" y="236">Human</text>
        <text x="260" y="258" class="slide__diagram-node-sub">reasons about</text>
      </g>
      <line x1="395" y1="240" x2="465" y2="240" class="slide__diagram-arrow" marker-end="url(#diag05-arrow)"/>
      <g class="slide__diagram-node slide__diagram-node--accent">
        <rect x="480" y="205" width="240" height="70" rx="14"/>
        <text x="600" y="236">Meaning</text>
        <text x="600" y="258" class="slide__diagram-node-sub">interpreted by</text>
      </g>
      <line x1="735" y1="240" x2="805" y2="240" class="slide__diagram-arrow" marker-end="url(#diag05-arrow)"/>
      <g class="slide__diagram-node slide__diagram-node--accent">
        <rect x="820" y="205" width="240" height="70" rx="14"/>
        <text x="940" y="236">Coding Agent</text>
        <text x="940" y="258" class="slide__diagram-node-sub">that makes it work</text>
      </g>
    </svg>
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
      The biggest change was not productivity. The biggest change was willingness.
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
        <p>Co-presented an AI Web Security tool at <strong>RSAC 2026</strong> with Milan Duric. Same trip: a private downtown dinner hosted by <strong>Maverick Capital</strong>, room of AI Platform leaders.</p>
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
        raffael-e-schneider
      </a>
      <span class="slide__byline-sep" aria-hidden="true">·</span>
      <a href="https://twitter.com/raskelll">
        <svg class="slide__byline-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
        @raskelll
      </a>
    </p>
  </div>
</section>
