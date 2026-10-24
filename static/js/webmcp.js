// WebMCP: a typed tool list for an in-browser agent (https://webmachinelearning.github.io/webmcp/).
// Loaded by partials/body_end.html only when document.modelContext (or the older navigator.modelContext)
// exists, so ordinary visitors never download it. Everything here reads the site's own public files:
// llms.txt, the per-page Markdown copies, map.json, garden.json (the search index: articles, reviews,
// notes, talks, works, projects, topics, cited links), reading.json, and Zola's full-text index for page
// bodies. Read-only except open_page.
(function () {
  "use strict";
  var ctx = (typeof document !== "undefined" && document.modelContext) || (typeof navigator !== "undefined" && navigator.modelContext);
  if (!ctx || typeof ctx.registerTool !== "function") { return; }
  var ORIGIN = location.origin, controller = new AbortController(), registered = [];

  function collapse(s) { return String(s || "").replace(/\s+/g, " ").trim(); }
  function meta(name) { var m = document.querySelector('meta[name="' + name + '"]'); return m ? m.getAttribute("content") : null; }
  function sameSite(u) { var url = new URL(u, ORIGIN); if (url.origin !== ORIGIN) { throw new Error("Only raskell.io URLs"); } return url; }
  function mdUrl(u) { var url = sameSite(u); var m = url.pathname.match(/^\/(articles|notes|talks)\/([^/]+)\/?$/); return m ? ORIGIN + "/" + m[1] + "/" + m[2] + ".md" : null; }
  function json(path) { return fetch(ORIGIN + path).then(function (r) { if (!r.ok) { throw new Error(path + " " + r.status); } return r.json(); }); }
  // The garden index: garden.json when published, else the inline index on the search page.
  var gardenP = null;
  function garden() {
    return gardenP || (gardenP = json("/garden.json").catch(function () {
      return fetch(ORIGIN + "/search/").then(function (r) { return r.text(); }).then(function (html) {
        var m = html.match(/<script[^>]*id="?garden-data"?[^>]*>([\s\S]*?)<\/script>/);
        if (!m) { throw new Error("no search index"); }
        var rows = JSON.parse(m[1]).items.filter(Boolean), links = {}, items = [];
        rows.forEach(function (r) {
          if (r.k !== "link") { items.push({ kind: r.k === "article" && (r.c || []).indexOf("reviews") >= 0 ? "review" : r.k, title: r.t, url: r.u, description: r.d, date: r.y, topics: r.g, meta: r.m }); return; }
          var key = r.u.replace(/\/+$/, ""), l = links[key] || (links[key] = { kind: "link", title: "", url: r.u, reference: false, cited_in: [] });
          var t = (r.t || "").trim().split(/\n\s*\n|\n {4,}/)[0].replace(/\s+/g, " ").trim();
          if (t && !/^https?:/.test(t) && t.length > l.title.length) { l.title = t; }
          l.reference = l.reference || !!r.r;
          if (!l.cited_in.some(function (c) { return c.url === r.p; })) { l.cited_in.push({ title: r.pt, url: r.p }); }
        });
        return { items: items.concat(Object.keys(links).map(function (k) { return links[k]; })) };
      });
    }));
  }
  function words(q) { return String(q || "").toLowerCase().split(/\s+/).filter(Boolean); }
  function matches(item, ws) {
    var hay = [item.title, item.description, item.meta, item.domain, (item.topics || []).join(" "), (item.cited_in || []).map(function (c) { return c.title; }).join(" ")].join(" ").toLowerCase();
    return ws.every(function (w) { return new RegExp("(^|[\\s\\-(:\"'·,./])" + w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).test(hay); });
  }
  var graphP = null;
  // map.json when published (CI writes it after the build), else the inline graph on the map page, in the same shape.
  function graph() {
    return graphP || (graphP = fetch(ORIGIN + "/map.json").then(function (r) { if (!r.ok) { throw new Error("map.json " + r.status); } return r.json(); }).catch(function () {
      return fetch(ORIGIN + "/map/").then(function (r) { return r.text(); }).then(function (html) {
        var m = html.match(/<script[^>]*id="?map-data"?[^>]*>([\s\S]*?)<\/script>/);
        if (!m) { throw new Error("no graph data"); }
        var raw = JSON.parse(m[1]), nodes = raw.nodes.filter(Boolean), byId = {}, links = [], seen = {}, deg = {};
        nodes.forEach(function (n) { byId[n.id] = n; });
        raw.links.forEach(function (l) {
          if (!l || !byId[l[0]] || !byId[l[1]] || l[0] === l[1]) { return; }
          var k = l[0] < l[1] ? l[0] + "|" + l[1] : l[1] + "|" + l[0];
          if (seen[k]) { return; }
          seen[k] = 1; links.push({ source: l[0], target: l[1] }); deg[l[0]] = (deg[l[0]] || 0) + 1; deg[l[1]] = (deg[l[1]] || 0) + 1;
        });
        return { nodes: nodes.filter(function (n) { return deg[n.id]; }).map(function (n) { return { id: n.id, kind: n.kind, label: n.label, url: n.url, meta: n.meta, description: n.desc || undefined, degree: deg[n.id] }; }), links: links };
      });
    }));
  }
  var searchP = null;
  function search() {
    if (searchP) { return searchP; }
    function load(src) { return new Promise(function (ok, no) { var s = document.createElement("script"); s.src = src; s.onload = ok; s.onerror = no; document.head.appendChild(s); }); }
    var d = document.querySelector("[data-garden][data-lib]");
    searchP = (window.elasticlunr ? Promise.resolve() : load(d ? d.dataset.lib : ORIGIN + "/elasticlunr.min.js"))
      .then(function () { return window.searchIndex ? null : load(d ? d.dataset.index : ORIGIN + "/search_index.en.js"); })
      .then(function () { return elasticlunr.Index.load(window.searchIndex); });
    return searchP;
  }

  var tools = [
    {
      name: "search_site",
      title: "Search raskell.io",
      description: "Search everything on raskell.io: articles, reviews, notes, talks, books and papers from the reading log, projects, topics, and every external link the writing cites. Matches titles, descriptions, topics, and authors, plus the full text of pages. Filter with kind. Read a page with get_page_markdown.",
      inputSchema: { type: "object", properties: {
        query: { type: "string", minLength: 1, description: "Search terms, e.g. 'model gateway' or 'Berners-Lee'" },
        kind: { type: "string", enum: ["any", "article", "review", "note", "talk", "work", "project", "topic", "link"], description: "Only this kind (default any). work = a book or paper from the reading log; link = an external source the writing cites." },
        limit: { type: "integer", minimum: 1, maximum: 50, description: "Max results (default 10)" } }, required: ["query"], additionalProperties: false },
      annotations: { readOnlyHint: true },
      execute: function (input) {
        var kind = input.kind && input.kind !== "any" ? input.kind : null, ws = words(input.query), limit = input.limit || 10;
        return Promise.all([garden(), search().catch(function () { return null; })]).then(function (r) {
          var items = r[0].items.filter(function (i) { return (!kind || i.kind === kind) && matches(i, ws); });
          var urls = {};
          items.forEach(function (i) { urls[i.url] = 1; });
          // Pages whose body matches but whose title and description do not.
          if (r[1] && (!kind || /^(article|review|note|talk)$/.test(kind))) {
            r[1].search(input.query, { fields: { title: { boost: 2 }, description: { boost: 1.5 }, body: { boost: 1 } }, bool: "AND", expand: true }).forEach(function (h) {
              if (urls[h.ref]) { return; }
              var page = r[0].items.filter(function (i) { return i.url === h.ref; })[0];
              if (page && (!kind || page.kind === kind)) { items.push(page); urls[h.ref] = 1; }
            });
          }
          return { query: input.query, kind: kind || "any", total: items.length, results: items.slice(0, limit).map(function (i) {
            var out = { kind: i.kind, title: i.title, url: i.url, description: i.description || null };
            if (i.date) { out.date = i.date; }
            if (i.meta) { out.meta = i.meta; }
            if (i.kind === "link") { out.cited_in = i.cited_in; out.reference = !!i.reference; }
            var md = /^https?:/.test(i.url) && i.url.indexOf(ORIGIN) === 0 ? mdUrl(i.url) : null;
            if (md) { out.markdown = md; }
            return out;
          }) };
        });
      }
    },
    {
      name: "list_reading",
      title: "List the reading log",
      description: "Books, papers, and reports from the reading log on raskell.io: what is being read now, what is next, the backlog, and what has been read, with the month finished, ratings out of 10, one-line takes, and links to reviews.",
      inputSchema: { type: "object", properties: { status: { type: "string", enum: ["any", "reading", "next", "backlog", "read", "set-aside"], description: "Only works with this status (default any)" } }, additionalProperties: false },
      annotations: { readOnlyHint: true },
      execute: function (input) {
        return json("/reading.json").then(function (d) {
          var st = input.status && input.status !== "any" ? input.status : null;
          return { source: d.source, works: d.works.filter(function (w) { return !st || w.status === st; }) };
        });
      }
    },
    {
      name: "find_links",
      title: "Find sources cited on raskell.io",
      description: "External links the writing on raskell.io cites, with the pages that cite them and whether they are listed as references. Filter by words in the link text, the URL's domain, or the citing page; omit the query for the most-cited sources.",
      inputSchema: { type: "object", properties: { query: { type: "string", description: "Words or a domain, e.g. 'arxiv' or 'Common Crawl'; omit for the most cited" }, references_only: { type: "boolean", description: "Only links listed under a References heading" }, limit: { type: "integer", minimum: 1, maximum: 100, description: "Max results (default 20)" } }, additionalProperties: false },
      annotations: { readOnlyHint: true },
      execute: function (input) {
        return garden().then(function (g) {
          var ws = words(input.query);
          var links = g.items.filter(function (i) {
            if (i.kind !== "link" || (input.references_only && !i.reference)) { return false; }
            if (!i.domain) { try { i.domain = new URL(i.url).hostname.replace(/^www\./, ""); } catch (e) { i.domain = ""; } }
            return !ws.length || matches(i, ws) || ws.every(function (w) { return i.url.toLowerCase().indexOf(w) >= 0; });
          }).sort(function (a, b) { return b.cited_in.length - a.cited_in.length; });
          return { total: links.length, links: links.slice(0, input.limit || 20).map(function (l) { return { title: l.title, url: l.url, domain: l.domain, reference: !!l.reference, cited_in: l.cited_in }; }) };
        });
      }
    },
    {
      name: "get_current_page",
      title: "Describe the current page",
      description: "Metadata of the page open in the browser: URL, title, description, kind (article, note, topic, project list, ...), topics, dates, the Markdown copy URL, and the heading outline.",
      inputSchema: { type: "object", properties: {}, additionalProperties: false },
      annotations: { readOnlyHint: true },
      execute: function () {
        var kw = meta("keywords");
        var path = location.pathname, review = !!document.querySelector('a[href*="/categories/reviews/"]') && /^\/articles\//.test(path);
        var kind = /^\/articles\/[^/]+\/$/.test(path) ? (review ? "review" : "article") : /^\/notes\/[^/]+\/$/.test(path) ? "note" : /^\/talks\/[^/]+\/$/.test(path) ? "talk"
          : /^\/tags\/[^/]+\/$/.test(path) ? "topic" : /^\/categories\/[^/]+\/$/.test(path) ? "category" : path === "/reading/" ? "reading log" : path === "/search/" ? "search" : path === "/map/" ? "map" : "page";
        var times = Array.prototype.map.call(document.querySelectorAll(".pagehead time, table.meta time"), function (t) { return t.getAttribute("datetime"); });
        return {
          url: location.href, title: document.title, kind: kind,
          description: meta("description"), summary: collapse((document.querySelector("[data-ai-summary]") || {}).textContent) || null,
          topics: kw ? kw.split(/,\s*/) : [], dates: times, markdown: mdUrl(location.href),
          headings: Array.prototype.map.call(document.querySelectorAll(".prose h2, .prose h3"), function (h) { return { level: h.tagName.toLowerCase(), text: collapse(h.textContent), id: h.id || null }; })
        };
      }
    },
    {
      name: "get_page_markdown",
      title: "Read a page as Markdown",
      description: "Full text of an article, review, note, or talk on raskell.io as clean Markdown with front matter (title, date, topics, URL; for reviews the reviewed work and the rating). Defaults to the current page.",
      inputSchema: { type: "object", properties: { url: { type: "string", description: "A raskell.io article or note URL; omit for the current page" } }, additionalProperties: false },
      annotations: { readOnlyHint: true },
      execute: function (input) {
        var u = mdUrl(input.url || location.href);
        if (!u) { return { error: "Only articles, notes, and talks have Markdown copies. Use get_current_page, list_reading for the reading log, or llms.txt for the site index.", llms: ORIGIN + "/llms.txt" }; }
        return fetch(u).then(function (r) { if (!r.ok) { throw new Error(u + " " + r.status); } return r.text(); }).then(function (t) { return { url: u, markdown: t }; });
      }
    },
    {
      name: "get_site_index",
      title: "Read the site index (llms.txt)",
      description: "The llms.txt index: who writes raskell.io, every article, review, note, and talk with a one-line summary, the series, the reading log, the sources cited most, the topic vocabulary, and the projects.",
      inputSchema: { type: "object", properties: {}, additionalProperties: false },
      annotations: { readOnlyHint: true },
      execute: function () { return fetch(ORIGIN + "/llms.txt").then(function (r) { return r.text(); }).then(function (t) { return { url: ORIGIN + "/llms.txt", markdown: t }; }); }
    },
    {
      name: "list_topics",
      title: "List the topics",
      description: "The topic vocabulary of the site graph: each topic with its kind (domain, concept, technology), definition, and how many pages and projects connect to it.",
      inputSchema: { type: "object", properties: {}, additionalProperties: false },
      annotations: { readOnlyHint: true },
      execute: function () {
        return graph().then(function (g) {
          return { topics: g.nodes.filter(function (n) { return n.kind === "tag"; }).map(function (n) { return { id: n.id, name: n.label, kind: (n.meta || "").split(" · ")[0], description: n.description || null, url: n.url, connections: n.degree }; }) };
        });
      }
    },
    {
      name: "get_connections",
      title: "Show what a page or topic connects to",
      description: "The neighbourhood of one node in the site graph: an article, note, talk, topic, series, category, book from the reading log, or project, and everything linked to it. Pass a URL (e.g. the current page) or a graph id like 't:agents', 'p:zentinel', 'w:this-is-for-everyone', or 'c:reviews'.",
      inputSchema: { type: "object", properties: { node: { type: "string", description: "A raskell.io URL or graph id; omit for the current page" } }, additionalProperties: false },
      annotations: { readOnlyHint: true },
      execute: function (input) {
        return graph().then(function (g) {
          var key = input.node || location.href, node = null;
          g.nodes.forEach(function (n) { if (n.id === key || n.url === key || (n.url && sameUrl(n.url, key))) { node = n; } });
          if (!node) { return { error: "No graph node for " + key }; }
          var ids = {};
          g.links.forEach(function (l) { if (l.source === node.id) { ids[l.target] = 1; } if (l.target === node.id) { ids[l.source] = 1; } });
          return { node: node, connected: g.nodes.filter(function (n) { return ids[n.id]; }).map(function (n) { return { id: n.id, kind: n.kind, label: n.label, url: n.url }; }) };
        });
        function sameUrl(a, b) { try { return new URL(a, ORIGIN).pathname === new URL(b, ORIGIN).pathname; } catch (e) { return false; } }
      }
    },
    {
      name: "cite_current_page",
      title: "Cite the current page",
      description: "Citations for the article or note open in the browser, in APA, MLA, a plain line, and BibTeX.",
      inputSchema: { type: "object", properties: {}, additionalProperties: false },
      annotations: { readOnlyHint: true },
      execute: function () {
        var out = {};
        document.querySelectorAll(".cite__row").forEach(function (r) { out[collapse(r.querySelector(".cite__fmt").textContent).toLowerCase()] = r.querySelector(".cite__text").textContent; });
        return Object.keys(out).length ? { url: location.href, citations: out } : { error: "This page has no citation block; only articles and notes do." };
      }
    },
    {
      name: "open_page",
      title: "Open a page on raskell.io",
      description: "Navigate the browser to a page on raskell.io, e.g. a search result or a connected node.",
      inputSchema: { type: "object", properties: { url: { type: "string", minLength: 1, description: "A raskell.io URL or path" } }, required: ["url"], additionalProperties: false },
      annotations: { readOnlyHint: false },
      execute: function (input) { var u = sameSite(input.url); location.assign(u.href); return { opening: u.href }; }
    }
  ];

  function register(tool) {
    var p;
    try { p = ctx.registerTool(tool, { signal: controller.signal }); } catch (err) { p = Promise.reject(err); }
    return Promise.resolve(p).then(function () { registered.push(tool.name); }, function (err) { if (window.console && console.debug) { console.debug("[webmcp] could not register " + tool.name, err); } });
  }
  window.raskellWebMCP = { ready: Promise.all(tools.map(register)).then(function () { return registered.slice(); }), tools: registered, dispose: function () { controller.abort(); } };
})();
