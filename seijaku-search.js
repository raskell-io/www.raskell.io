// Search for seijaku: one engine behind the nav dialog (press /) and the search page. It searches the
// garden index (partials/garden_data.html: pages, works, projects, topics, cited links), filters it by
// kind with a chip per kind, and adds Zola's full-text index for words that only appear in page bodies.
// Both indexes load on first use, so pages that never search pay nothing.
(function () {
  "use strict";

  // Interface text in the page's language: base.html sets window.SEIJAKU_I18N (English text -> translation) on
  // translated pages; anything missing stays English. {name} placeholders are filled by fill().
  function T(s) { var d = window.SEIJAKU_I18N; return (d && d[s]) || s; }
  function fill(s, v) { return T(s).replace(/\{(\w+)\}/g, function (m, k) { return k in v ? v[k] : m; }); }

  // Filters, in chip order. An item belongs to a chip when `test` says so.
  var CHIPS = [
    { key: "all", label: T("All"), test: function () { return true; } },
    { key: "article", label: T("Articles"), test: function (i) { return i.k === "article"; } },
    { key: "review", label: T("Reviews"), test: function (i) { return i.c.indexOf("reviews") >= 0; } },
    { key: "note", label: T("Notes"), test: function (i) { return i.k === "note"; } },
    { key: "talk", label: T("Talks"), test: function (i) { return i.k === "talk"; } },
    { key: "work", label: T("Books and papers"), test: function (i) { return i.k === "work"; } },
    { key: "project", label: T("Projects"), test: function (i) { return i.k === "project"; } },
    { key: "topic", label: T("Topics"), test: function (i) { return i.k === "topic"; } },
    { key: "link", label: T("Links"), test: function (i) { return i.k === "link"; } }
  ];
  var WORK_ORDER = { "Reading now": 0, "Up next": 1, "Read": 2, "Backlog": 3, "Set aside": 4 };

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function load(src) {
    return new Promise(function (resolve, reject) {
      var s = document.createElement("script");
      s.src = src; s.onload = resolve; s.onerror = reject;
      document.head.appendChild(s);
    });
  }
  function host(u) { try { return new URL(u).hostname.replace(/^www\./, ""); } catch (e) { return ""; } }
  function short(u) {
    try { var x = new URL(u), p = (x.pathname + x.search).replace(/\/$/, ""); return host(u) + (p.length > 48 ? p.slice(0, 46) + "…" : p); }
    catch (e) { return u; }
  }

  // The garden index: inline on the search page, fetched from it everywhere else (once per page view).
  var gardenPromise = null;
  function garden(src) {
    if (gardenPromise) { return gardenPromise; }
    var inline = document.getElementById("garden-data");
    gardenPromise = (inline ? Promise.resolve(inline.textContent) : !src ? Promise.resolve('{"items":[]}') :
      fetch(src, { credentials: "same-origin" }).then(function (r) { return r.text(); }).then(function (html) {
        var m = html.match(/<script[^>]*id="?garden-data"?[^>]*>([\s\S]*?)<\/script>/);
        if (!m) { throw new Error("no search data"); }
        return m[1];
      })).then(function (text) { return prepare(JSON.parse(text).items.filter(Boolean)); });
    return gardenPromise;
  }

  // Merge link rows by URL, name topics, and precompute the lowercase text each field is matched against.
  function prepare(rows) {
    var items = [], links = {}, topicNames = {};
    rows.forEach(function (r) { if (r.k === "topic") { topicNames[r.s] = r.t; } });
    var seen = {};
    rows.forEach(function (r) {
      // A project listed on two pages (projects and apps) is one result.
      if (r.k !== "link") { if (!seen[r.k + r.u]) { seen[r.k + r.u] = 1; items.push(r); } return; }
      var key = r.u.replace(/\/+$/, "").replace(/^http:/, "https:"), l = links[key];
      if (!l) {
        l = links[key] = { k: "link", u: r.u, t: "", d: short(r.u), dom: host(r.u), g: [], c: [], cites: [], r: 0, y: "" };
        items.push(l);
      }
      // A link wrapped around a whole card has a paragraph for text: keep its first line.
      var text = (r.t || "").trim().split(/\n\s*\n|\n {4,}/)[0].replace(/\s+/g, " ").trim();
      if (text.length > 90) { text = text.slice(0, 88).replace(/\s+\S*$/, "") + "…"; }
      if (text && !/^https?:\/\//.test(text) && text.length > l.t.length) { l.t = text; }
      if (r.r) { l.r = 1; }
      if (!l.cites.some(function (c) { return c.u === r.p; })) { l.cites.push({ u: r.p, t: r.pt }); }
    });
    items.forEach(function (i) {
      i.c = i.c || []; i.g = i.g || [];
      if (i.k === "link") {
        if (!i.t) { i.t = i.d; }
        var where = i.cites.map(function (c) { return c.t; }).slice(0, 2).join(", ");
        i.m = (i.r ? T("Reference") + " · " : "") + (i.cites.length > 2 ? fill("cited in {pages} and {n} more", { pages: where, n: i.cites.length - 2 }) : fill("cited in {pages}", { pages: where }));
      }
      i.badge = i.k === "article" && i.c.indexOf("reviews") >= 0 ? T("Review") :
        i.k === "work" ? T((i.m || "").split(" · ")[0]) : i.k === "link" ? i.dom : T(i.k.charAt(0).toUpperCase() + i.k.slice(1));
      i.f = {
        title: (i.t || "").toLowerCase(),
        topics: i.g.map(function (g) { return topicNames[g] || g; }).join(" ").toLowerCase(),
        meta: ((i.m || "") + " " + (i.s || "") + " " + (i.dom || "") + " " + i.badge).toLowerCase(),
        desc: (i.d || "").toLowerCase(),
        cites: (i.cites || []).map(function (c) { return c.t; }).join(" ").toLowerCase()
      };
    });
    return items;
  }

  // Score one item against the query words: every word must match the start of a word in some field (or
  // the page body, through the full-text index), so "rust" finds Rust and not "trust"; earlier fields weigh more.
  var WEIGHTS = { title: 6, topics: 3, meta: 2, desc: 1.5, cites: 1 };
  function score(item, words, fulltext) {
    var total = 0, ft = fulltext[item.u] || 0;
    for (var w = 0; w < words.length; w++) {
      var best = 0;
      for (var f in WEIGHTS) {
        var hay = item.f[f], at = hay.indexOf(words[w]);
        while (at > 0 && !/[\s\-(:"'·,./]/.test(hay.charAt(at - 1))) { at = hay.indexOf(words[w], at + 1); }
        if (at >= 0 && WEIGHTS[f] > best) { best = WEIGHTS[f]; }
      }
      if (!best && !ft) { return 0; }
      total += best;
    }
    // The site's own things first: a cited link ranks a little below a page or work with the same match.
    return (total + ft * 4) * (item.k === "link" ? 0.75 : 1);
  }

  // Order for browsing with an empty query: newest first overall; within one kind, its own order.
  function byDate(a, b) { return (b.y || "").localeCompare(a.y || ""); }
  function browseOrder(a, b) {
    if (a.k === "work" && b.k === "work") {
      var sa = WORK_ORDER[(a.m || "").split(" · ")[2]], sb = WORK_ORDER[(b.m || "").split(" · ")[2]];
      if (sa !== sb) { return sa - sb; }
    }
    if (a.k === "link" && b.k === "link" && a.cites.length !== b.cites.length) { return b.cites.length - a.cites.length; }
    if (a.k === "topic" && b.k === "topic") { return a.t.localeCompare(b.t); }
    return (b.y || "").localeCompare(a.y || "");
  }

  function mark(text, words) {
    var out = esc(text);
    words.forEach(function (w) {
      if (w.length < 2) { return; }
      out = out.replace(new RegExp("(" + esc(w).replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")", "ig"), "<mark>$1</mark>");
    });
    return out;
  }

  function mount(root) {
    var input = root.querySelector("input"), chipsEl = root.querySelector(".garden__chips");
    var list = root.querySelector(".garden__results"), status = root.querySelector(".garden__status");
    var more = root.querySelector(".garden__more"), full = root.querySelector(".garden__full");
    var isPage = root.classList.contains("garden--page");
    var step = parseInt(root.dataset.limit || "20", 10), limit = step;
    var items = null, kind = "all", ftIndex = null, ftLoading = null;

    if (isPage) {
      var q = new URLSearchParams(location.search);
      input.value = q.get("q") || "";
      if (q.get("type")) { kind = q.get("type"); }
    }

    // Zola's full-text index, for words that appear only in page bodies. Loaded on the first real query.
    function fullText(query) {
      if (!root.dataset.index || query.length < 3) { return Promise.resolve({}); }
      if (!ftLoading) {
        ftLoading = (window.elasticlunr ? Promise.resolve() : load(root.dataset.lib))
          .then(function () { return window.searchIndex ? null : load(root.dataset.index); })
          .then(function () { ftIndex = elasticlunr.Index.load(window.searchIndex); }, function () { ftIndex = null; });
      }
      return ftLoading.then(function () {
        var out = {};
        if (!ftIndex) { return out; }
        var hits = ftIndex.search(query, { fields: { title: { boost: 2 }, description: { boost: 1.5 }, body: { boost: 1 } }, bool: "AND", expand: true });
        var top = hits.length ? hits[0].score : 1;
        hits.forEach(function (h) {
          out[h.ref] = h.score / top;
          // A page the garden index does not know (no search page configured): show it as a plain result.
          if (!items.some(function (i) { return i.u === h.ref; })) {
            var d = ftIndex.documentStore.getDoc(h.ref) || {};
            var extra = { k: "article", t: d.title || h.ref, u: h.ref, d: d.description || (d.body || "").slice(0, 160), g: [], c: [], y: "", badge: T("Page") };
            extra.f = { title: extra.t.toLowerCase(), topics: "", meta: "", desc: extra.d.toLowerCase(), cites: "" };
            items.push(extra);
          }
        });
        return out;
      });
    }

    var seq = 0;
    function render() {
      if (!items) { return; }
      var query = input.value.trim().toLowerCase(), words = query.split(/\s+/).filter(Boolean), mine = ++seq;
      fullText(query).then(function (ft) {
        if (mine !== seq) { return; }
        var matched = words.length ? items.map(function (i) { return [i, score(i, words, ft)]; })
          .filter(function (p) { return p[1] > 0; }).sort(function (a, b) { return b[1] - a[1]; }).map(function (p) { return p[0]; })
          : items.slice();
        // Chips: a count per kind for the current query; kinds the site has none of stay hidden.
        chipsEl.innerHTML = CHIPS.map(function (c) {
          var total = c.key === "all" ? items.length : items.filter(c.test).length;
          if (!total) { return ""; }
          var n = c.key === "all" ? matched.length : matched.filter(c.test).length;
          return '<button type="button" class="facet" data-kind="' + c.key + '" aria-pressed="' + (kind === c.key) + '"' + (n || kind === c.key ? "" : " disabled") + ">" + esc(c.label) + '<span class="facet__n">' + n + "</span></button>";
        }).join("");
        chipsEl.hidden = !words.length && !isPage && kind === "all";
        var chip = CHIPS.filter(function (c) { return c.key === kind; })[0] || CHIPS[0];
        var shown = matched.filter(chip.test);
        if (!words.length) { shown.sort(kind === "all" ? byDate : browseOrder); }
        // With no query, the dialog stays quiet until a kind is picked; the page lists everything.
        if (!words.length && !isPage && kind === "all") {
          list.innerHTML = ""; status.textContent = T("Search everything here: articles, books, projects, topics, and every link cited.");
          more.hidden = true; return;
        }
        status.textContent = words.length ? (shown.length ? fill(shown.length === 1 ? "{n} result" : "{n} results", { n: shown.length }) : (kind !== "all" ? fill("Nothing found for “{q}” in {kind}.", { q: input.value.trim(), kind: chip.label.toLowerCase() }) : fill("Nothing found for “{q}”.", { q: input.value.trim() })))
          : shown.length + " " + (kind === "all" ? T("entries") : chip.label.toLowerCase());
        list.innerHTML = shown.slice(0, limit).map(function (i) {
          var ext = i.k === "link" || (i.k === "project" && host(i.u) !== location.hostname.replace(/^www\./, ""));
          return '<li class="garden__item garden__item--' + i.k + '"><a href="' + esc(i.u) + '"' + (ext ? ' rel="noopener" target="_blank"' : "") + ">" +
            '<span class="garden__kind">' + esc(i.badge) + "</span>" +
            '<span class="garden__title">' + mark(i.t, words) + (ext ? ' <span class="garden__ext" aria-hidden="true">↗</span>' : "") + "</span>" +
            (i.d ? '<span class="garden__desc">' + mark(i.d, words) + "</span>" : "") +
            (i.k !== "work" && i.m || i.k === "work" ? '<span class="garden__meta">' + esc(i.k === "work" ? (i.m || "").split(" · ").slice(1).join(" · ") : i.m) + (i.y && i.k !== "link" && i.k !== "work" ? " · " + esc(i.y.slice(0, 4)) : "") + "</span>" : "") +
            "</a></li>";
        }).join("");
        more.hidden = shown.length <= limit;
        if (full) { full.href = full.href.split("?")[0] + (words.length || kind !== "all" ? "?" + new URLSearchParams(Object.assign(words.length ? { q: input.value.trim() } : {}, kind !== "all" ? { type: kind } : {})).toString() : ""); }
        if (isPage) {
          var p = new URLSearchParams();
          if (words.length) { p.set("q", input.value.trim()); }
          if (kind !== "all") { p.set("type", kind); }
          var s = p.toString();
          history.replaceState(null, "", location.pathname + (s ? "?" + s : "") + location.hash);
        }
      });
    }

    function start() {
      if (items) { render(); return; }
      status.textContent = T("Loading…");
      garden(root.dataset.src).then(function (g) { items = g; render(); }, function () {
        items = []; status.textContent = T("The full index could not load; searching the writing only."); render();
      });
    }

    input.addEventListener("input", function () { limit = step; render(); });
    chipsEl.addEventListener("click", function (e) {
      var b = e.target.closest(".facet");
      if (!b) { return; }
      kind = kind === b.dataset.kind && kind !== "all" ? "all" : b.dataset.kind;
      limit = step; render(); input.focus();
    });
    more.addEventListener("click", function () { limit += step; render(); });
    // Arrow keys move from the field through the results and back.
    root.addEventListener("keydown", function (e) {
      if (e.key !== "ArrowDown" && e.key !== "ArrowUp") { return; }
      var links = [].slice.call(list.querySelectorAll("a")), at = links.indexOf(document.activeElement);
      if (!links.length) { return; }
      e.preventDefault();
      if (e.key === "ArrowDown") { (links[at + 1] || links[0]).focus(); }
      else if (at <= 0) { input.focus(); } else { links[at - 1].focus(); }
    });
    if (isPage) {
      root.querySelector("form").addEventListener("submit", function (e) { e.preventDefault(); });
      start();
    }
    return { start: start, input: input };
  }

  var mounted = [].map.call(document.querySelectorAll("[data-garden]"), function (root) { return { root: root, api: mount(root) }; });

  // The dialog: opens from the nav button, the menu link, or "/".
  var dialog = document.getElementById("search");
  if (!dialog || typeof dialog.showModal !== "function") { return; }
  var inner = mounted.filter(function (m) { return dialog.contains(m.root); })[0];
  if (!inner) { return; }
  function open() { dialog.showModal(); inner.api.input.select(); inner.api.start(); }
  document.querySelectorAll("[data-search-open]").forEach(function (b) {
    b.addEventListener("click", function (e) { e.preventDefault(); var d = b.closest("details"); if (d) { d.open = false; } open(); });
  });
  document.addEventListener("keydown", function (e) {
    var t = e.target.tagName;
    if (e.key === "/" && !dialog.open && t !== "INPUT" && t !== "TEXTAREA" && !e.target.isContentEditable) { e.preventDefault(); open(); }
  });
  dialog.addEventListener("click", function (e) { if (e.target === dialog) { dialog.close(); } });
})();
