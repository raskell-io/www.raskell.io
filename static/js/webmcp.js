// WebMCP: a typed tool list for an in-browser agent (https://webmachinelearning.github.io/webmcp/).
// Loaded by partials/body_end.html only when document.modelContext (or the older navigator.modelContext)
// exists, so ordinary visitors never download it. Everything here reads the site's own public files:
// llms.txt, the per-page Markdown copies, map.json, and the search index. Read-only except open_page.
(function () {
  "use strict";
  var ctx = (typeof document !== "undefined" && document.modelContext) || (typeof navigator !== "undefined" && navigator.modelContext);
  if (!ctx || typeof ctx.registerTool !== "function") { return; }
  var ORIGIN = location.origin, controller = new AbortController(), registered = [];

  function collapse(s) { return String(s || "").replace(/\s+/g, " ").trim(); }
  function meta(name) { var m = document.querySelector('meta[name="' + name + '"]'); return m ? m.getAttribute("content") : null; }
  function sameSite(u) { var url = new URL(u, ORIGIN); if (url.origin !== ORIGIN) { throw new Error("Only raskell.io URLs"); } return url; }
  function mdUrl(u) { var url = sameSite(u); var m = url.pathname.match(/^\/(articles|notes)\/([^/]+)\/?$/); return m ? ORIGIN + "/" + m[1] + "/" + m[2] + ".md" : null; }
  var graphP = null;
  function graph() { return graphP || (graphP = fetch(ORIGIN + "/map.json").then(function (r) { if (!r.ok) { throw new Error("map.json " + r.status); } return r.json(); })); }
  var searchP = null;
  function search() {
    if (searchP) { return searchP; }
    function load(src) { return new Promise(function (ok, no) { var s = document.createElement("script"); s.src = src; s.onload = ok; s.onerror = no; document.head.appendChild(s); }); }
    var d = document.getElementById("search");
    searchP = (window.elasticlunr ? Promise.resolve() : load(d ? d.dataset.lib : "/elasticlunr.min.js"))
      .then(function () { return window.searchIndex ? null : load(d ? d.dataset.index : "/search_index.en.js"); })
      .then(function () { return elasticlunr.Index.load(window.searchIndex); });
    return searchP;
  }

  var tools = [
    {
      name: "search_site",
      title: "Search raskell.io",
      description: "Full-text search over every article, note, and page on raskell.io (the same index as the site's search box). Returns titles, URLs, and descriptions; read a result with get_page_markdown.",
      inputSchema: { type: "object", properties: { query: { type: "string", minLength: 1, description: "Search terms, e.g. 'model gateway' or 'WAF tuning'" }, limit: { type: "integer", minimum: 1, maximum: 25, description: "Max results (default 8)" } }, required: ["query"], additionalProperties: false },
      annotations: { readOnlyHint: true },
      execute: function (input) {
        return search().then(function (idx) {
          var hits = idx.search(input.query, { fields: { title: { boost: 2 }, description: { boost: 1.5 }, body: { boost: 1 } }, expand: true }).slice(0, input.limit || 8);
          return { query: input.query, results: hits.map(function (h) { var doc = idx.documentStore.getDoc(h.ref) || {}; return { url: h.ref, title: doc.title, description: doc.description || null, markdown: mdUrl(h.ref) }; }) };
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
        var kind = /^\/articles\/[^/]+\/$/.test(location.pathname) ? "article" : /^\/notes\/[^/]+\/$/.test(location.pathname) ? "note" : /^\/tags\/[^/]+\/$/.test(location.pathname) ? "topic" : "page";
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
      description: "Full text of an article or note on raskell.io as clean Markdown with front matter (title, date, topics, URL). Defaults to the current page.",
      inputSchema: { type: "object", properties: { url: { type: "string", description: "A raskell.io article or note URL; omit for the current page" } }, additionalProperties: false },
      annotations: { readOnlyHint: true },
      execute: function (input) {
        var u = mdUrl(input.url || location.href);
        if (!u) { return { error: "Only articles and notes have Markdown copies. Use get_current_page, or llms.txt for the site index.", llms: ORIGIN + "/llms.txt" }; }
        return fetch(u).then(function (r) { if (!r.ok) { throw new Error(u + " " + r.status); } return r.text(); }).then(function (t) { return { url: u, markdown: t }; });
      }
    },
    {
      name: "get_site_index",
      title: "Read the site index (llms.txt)",
      description: "The llms.txt index: who writes raskell.io, every article and note with a one-line summary, the series, the topic vocabulary, and the projects.",
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
      description: "The neighbourhood of one node in the site graph: an article, note, topic, series, or project, and everything linked to it. Pass a URL (e.g. the current page) or a graph id like 't:agents' or 'p:zentinel'.",
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
