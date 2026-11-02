/* Idea lineage: which idea led to which product, field by field, under the paradigms of their time.
 *
 * Reads the same JSON as the people timeline (static/data/ai-people.json): from the
 * <script data-people-timeline> on the page when there is one, else from the mount's data-src URL.
 * Draws the paradigms as overlapping bars on top, one row per track (field) below with every idea
 * (diamond) and product (circle) placed in time, and the lineage as curves between them. Choosing an
 * item traces everything it builds on and everything that came out of it. Without JavaScript the
 * shortcode's list of paradigms stays visible instead.
 *
 * Data used:
 *   range     {start, focus, end}
 *   paradigms [{id, name, start, end, summary, src, ref, url}]
 *   tracks    [{id, name, summary}]
 *   moments   [{id, date, kind: idea|product|event, title, short, detail, people, orgs, track, src, ref, url}]
 *   lineage   [{from, to, note, src, ref, url}]
 */
(function () {
  "use strict";

  var NS = "http://www.w3.org/2000/svg";
  var LEFT = 168, PAD = 18, AXIS = 28, PBAR = 20, PGAP = 4, LANE = 19, TRACK_PAD = 10, FONT = 11;

  function el(tag, attrs, parent) {
    var n = document.createElementNS(NS, tag);
    for (var k in attrs) if (attrs[k] !== undefined && attrs[k] !== null) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }
  function h(tag, cls, parent, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined) n.textContent = text;
    if (parent) parent.appendChild(n);
    return n;
  }
  // "2015", "2015-12", "2015-12-11", "1950s" -> fractional year
  function year(d, fallback) {
    if (d === null || d === undefined || d === "") return fallback;
    var s = String(d);
    if (/^\d{4}s$/.test(s)) return +s.slice(0, 4) + 5;
    var p = s.split("-").map(Number);
    if (p.length === 1) return p[0] + 0.5;
    if (p.length === 2) return p[0] + (p[1] - 0.5) / 12;
    return p[0] + (p[1] - 1) / 12 + (p[2] - 0.5) / 365;
  }
  function startOf(d) { var p = String(d).split("-").map(Number); return p.length === 1 ? p[0] : year(d); }
  var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  function human(d) {
    if (!d) return "now";
    var p = String(d).split("-");
    if (p.length === 1) return p[0];
    if (p.length === 2) return MONTHS[+p[1] - 1] + " " + p[0];
    return +p[2] + " " + MONTHS[+p[1] - 1] + " " + p[0];
  }

  function build(mount, data) {
    var R = data.range, tracks = data.tracks || [], paradigms = data.paradigms || [];
    var people = {}; (data.people || []).forEach(function (p) { people[p.id] = p; });
    var orgs = data.orgs || {};
    var trackIx = {}; tracks.forEach(function (t, i) { trackIx[t.id] = i; });
    var items = data.moments.filter(function (m) { return (m.kind === "idea" || m.kind === "product") && m.track in trackIx; });
    var byId = {}; items.forEach(function (m) { byId[m.id] = m; });
    var edges = (data.lineage || []).filter(function (e) { return byId[e.from] && byId[e.to]; });
    var up = {}, down = {};
    edges.forEach(function (e) {
      (down[e.from] = down[e.from] || []).push(e);
      (up[e.to] = up[e.to] || []).push(e);
    });
    var state = { selected: null, paradigm: null };

    mount.innerHTML = "";
    var key = h("p", "ptl-bandkey", mount);
    key.innerHTML = '<span class="ptl-k ptl-k--idea"></span>Ideas <span class="ptl-k ptl-k--product"></span>Products ' +
      '<span class="ail-k ail-k--up"></span>Built on <span class="ail-k ail-k--down"></span>Led to';
    var frame = h("div", "ptl-frame ail-frame", mount);
    frame.tabIndex = 0;
    frame.setAttribute("role", "region");
    frame.setAttribute("aria-label", "Lineage of ideas and products, scroll sideways");
    var tip = h("div", "ptl-tip", mount); tip.hidden = true;
    var panel = h("div", "ptl-panel", mount);
    panel.setAttribute("aria-live", "polite");
    var HINT = "Choose an idea or a product to trace what it built on and what came out of it, or a paradigm to see its years.";
    h("p", "ptl-hint", panel, HINT);

    // --- scale (the same squeeze as the people timeline) ---------------------------------
    var W, x, compact;
    function scale() {
      compact = frame.clientWidth < 600;
      LEFT = compact ? 92 : 168;
      frame.classList.toggle("ptl-compact", compact);
      var avail = Math.max(frame.clientWidth - LEFT - PAD, 560);
      var years = R.end - R.focus;
      var perYear = Math.max(avail / (years + 3.2), compact ? 46 : 58);   // wide enough that recent labels do not pile up; scrolls sideways
      var early = perYear * 3.2;
      W = LEFT + early + perYear * years + PAD;
      x = function (t) {
        if (t <= R.focus) return LEFT + Math.max(0, (t - R.start) / (R.focus - R.start)) * early;
        return LEFT + early + (Math.min(t, R.end) - R.focus) * perYear;
      };
    }
    var ctx = document.createElement("canvas").getContext("2d");
    function textWidth(s, family) { ctx.font = FONT + "px " + family; return ctx.measureText(s).width; }
    function label(m) { return m.short || m.title; }

    function showTip(evt, lines) {
      tip.innerHTML = "";
      lines.forEach(function (l, i) { h(i === 0 ? "strong" : "span", null, tip, l); });
      tip.hidden = false;
      var r = mount.getBoundingClientRect();
      tip.style.left = Math.min(evt.clientX - r.left + 14, r.width - 280) + "px";
      tip.style.top = (evt.clientY - r.top + 14) + "px";
    }
    function hideTip() { tip.hidden = true; }

    function srcEl(parent, item) {
      if (!item.src) return;
      var span = h("span", "ptl-src-p", parent);
      var names = item.src.filter(function (s) { return s !== "web" || !item.url; })
        .map(function (s) { return data.sources[s] ? data.sources[s].short : s; });
      span.appendChild(document.createTextNode(names.join(", ") + (item.ref ? (names.length ? " · " : "") + item.ref : "")));
      if (item.url) {
        if (names.length || item.ref) span.appendChild(document.createTextNode(" · "));
        var a = h("a", null, span, new URL(item.url).hostname.replace(/^www\./, "")); a.href = item.url; a.rel = "noopener";
      }
    }

    // everything upstream and downstream of one item
    function trace(id) {
      var anc = {}, desc = {}, eUp = {}, eDown = {};
      (function walkUp(i) { (up[i] || []).forEach(function (e) { eUp[edges.indexOf(e)] = true; if (!anc[e.from]) { anc[e.from] = true; walkUp(e.from); } }); })(id);
      (function walkDown(i) { (down[i] || []).forEach(function (e) { eDown[edges.indexOf(e)] = true; if (!desc[e.to]) { desc[e.to] = true; walkDown(e.to); } }); })(id);
      return { anc: anc, desc: desc, eUp: eUp, eDown: eDown };
    }

    // --- panels ------------------------------------------------------------------------
    function itemButton(parent, m, note, edge) {
      var li = h("li", null, parent);
      h("span", "ptl-when", li, human(m.date));
      var b = h("button", "ptl-link", li, m.title); b.type = "button";
      b.addEventListener("click", function () { select({ item: m.id }); });
      if (note) h("span", "ail-note", li, note);
      if (edge) srcEl(h("span", "ptl-src", li), edge);
    }
    function itemPanel(m) {
      panel.innerHTML = "";
      var t = tracks[trackIx[m.track]];
      h("p", "ptl-meta", panel, human(m.date) + " · " + (m.kind === "idea" ? "Idea" : "Product") + " · " + t.name);
      h("h3", null, panel, m.title);
      if (m.detail) h("p", null, panel, m.detail);
      var who = (m.people || []).map(function (id) { return people[id] && people[id].name; }).filter(Boolean);
      var os = (m.orgs || []).map(function (id) { return orgs[id] ? orgs[id].name : id; });
      if (who.length || os.length) h("p", "ptl-meta", panel, who.concat(os).join(", "));
      srcEl(h("p", null, panel), m);
      var ups = (up[m.id] || []).slice().sort(function (a, b) { return year(byId[a.from].date) - year(byId[b.from].date); });
      var downs = (down[m.id] || []).slice().sort(function (a, b) { return year(byId[a.to].date) - year(byId[b.to].date); });
      if (ups.length) {
        h("h4", null, panel, "Built on");
        var ul = h("ul", "ptl-ties ail-list ail-list--up", panel);
        ups.forEach(function (e) { itemButton(ul, byId[e.from], e.note, e); });
      }
      if (downs.length) {
        h("h4", null, panel, "Led to");
        var ul2 = h("ul", "ptl-ties ail-list ail-list--down", panel);
        downs.forEach(function (e) { itemButton(ul2, byId[e.to], e.note, e); });
      }
      if (!ups.length && !downs.length) h("p", "ptl-hint", panel, "No lineage recorded for this one yet.");
    }
    function paradigmPanel(p) {
      panel.innerHTML = "";
      h("p", "ptl-meta", panel, "Paradigm · " + human(p.start) + " to " + (p.end ? human(p.end) : "now"));
      h("h3", null, panel, p.name);
      h("p", null, panel, p.summary);
      srcEl(h("p", null, panel), p);
    }
    function select(what) {
      state.selected = what && what.item ? what.item : null;
      state.paradigm = what && what.paradigm ? what.paradigm : null;
      if (state.selected) itemPanel(byId[state.selected]);
      else if (state.paradigm) paradigmPanel(paradigms.filter(function (p) { return p.id === state.paradigm; })[0]);
      else { panel.innerHTML = ""; h("p", "ptl-hint", panel, HINT); }
      draw(true);
    }

    // --- draw ----------------------------------------------------------------------------
    function draw(keepScroll) {
      var scrollLeft = frame.scrollLeft;
      scale();
      frame.innerHTML = "";
      var family = getComputedStyle(frame).getPropertyValue("--font-mono") || "monospace";

      // paradigm lanes
      var pl = [];
      var plist = paradigms.map(function (p) {
        var a = x(startOf(p.start)), b = x(p.end ? startOf(p.end) : R.end);
        var lane = 0; while (pl[lane] !== undefined && pl[lane] > a - 2) lane++;
        var leftFree = pl[lane] === undefined ? LEFT : pl[lane];
        pl[lane] = b; return { p: p, a: a, b: b, lane: lane, leftFree: leftFree };
      });
      var pTop = AXIS + 8, pH = pl.length * (PBAR + PGAP);
      var top = pTop + pH + 14;

      // items: lanes inside each track so labels never collide
      var rows = tracks.map(function () { return []; });
      var placed = items.map(function (m) {
        var X = x(Math.max(year(m.date), R.start));
        var w = 12 + textWidth(label(m), family);
        return { m: m, X: X, a: X - 7, b: X + w };
      }).sort(function (p, q) { return p.X - q.X; });
      placed.forEach(function (it) {
        var lanes = rows[trackIx[it.m.track]];
        var lane = 0; while (lanes[lane] !== undefined && lanes[lane] > it.a - 4) lane++;
        lanes[lane] = it.b; it.lane = lane;
      });
      placed.forEach(function (it) { if (it.b + PAD > W) W = it.b + PAD; });
      var trackTop = [], y = top;
      tracks.forEach(function (t, i) { trackTop[i] = y; y += Math.max(rows[i].length, 1) * LANE + TRACK_PAD * 2; });
      var Hh = y + PAD;
      var pos = {};
      placed.forEach(function (it) { it.Y = trackTop[trackIx[it.m.track]] + TRACK_PAD + it.lane * LANE + LANE / 2; pos[it.m.id] = it; });

      var tr = state.selected ? trace(state.selected) : null;
      var era = state.paradigm ? paradigms.filter(function (p) { return p.id === state.paradigm; })[0] : null;
      var eraA = era ? startOf(era.start) : 0, eraB = era ? (era.end ? startOf(era.end) : R.end + 1) : 0;
      function inEra(m) { var t = year(m.date); return t >= eraA && t < eraB; }

      // names column
      var names = h("div", "ptl-names ail-names", frame);
      names.style.width = LEFT + "px"; names.style.height = Hh + "px"; names.style.marginRight = -LEFT + "px";
      var pn = h("div", "ail-name ail-name--band", names, "Paradigms");
      pn.style.top = pTop + "px"; pn.style.height = pH + "px";
      tracks.forEach(function (t, i) {
        var n = h("div", "ail-name", names, t.name);
        n.title = t.summary;
        n.style.top = trackTop[i] + "px"; n.style.height = (rows[i].length * LANE + TRACK_PAD * 2 || LANE) + "px";
      });

      var svg = el("svg", { width: W, height: Hh, viewBox: "0 0 " + W + " " + Hh, class: "ptl-svg ail-svg", role: "img",
        "aria-label": "Lineage of " + items.length + " ideas and products in " + tracks.length + " fields, " + R.start + " to " + R.end }, frame);
      var defs = el("defs", {}, svg);
      ["base", "up", "down"].forEach(function (k) {
        var mk = el("marker", { id: "ail-arrow-" + k, viewBox: "0 0 8 8", refX: 7, refY: 4, markerWidth: 6, markerHeight: 6, orient: "auto-start-reverse" }, defs);
        el("path", { d: "M0 0L8 4L0 8z", class: "ail-arrow ail-arrow--" + k }, mk);
      });

      // track stripes, year grid
      tracks.forEach(function (t, i) {
        if (i % 2 === 0) el("rect", { x: 0, y: trackTop[i], width: W, height: (trackTop[i + 1] || Hh - PAD) - trackTop[i], class: "ptl-zebra" }, svg);
      });
      var g = el("g", { class: "ptl-axis" }, svg);
      var ticks = [R.start, 1970, 1990];
      for (var t = R.focus; t <= R.end; t++) ticks.push(t);
      var perYear = x(R.focus + 1) - x(R.focus);
      ticks.forEach(function (t) {
        var X = x(t);
        el("line", { x1: X, x2: X, y1: AXIS - 6, y2: Hh - PAD, class: t % 5 === 0 || t < R.focus ? "major" : "" }, g);
        if (t < R.focus || perYear >= 52 || t % 2 === 1 || t === R.focus) { var tx = el("text", { x: X + 3, y: AXIS - 12 }, g); tx.textContent = t; }
      });
      el("rect", { x: LEFT, y: AXIS - 6, width: x(R.focus) - LEFT, height: Hh - PAD - AXIS + 6, class: "ptl-early" }, svg);
      var et = el("text", { x: LEFT + 4, y: Hh - PAD - 6, class: "ptl-early-label" }, svg); et.textContent = "compressed";
      if (era) el("rect", { x: x(eraA), y: AXIS - 6, width: Math.max(x(Math.min(eraB, R.end)) - x(eraA), 2), height: Hh - PAD - AXIS + 6, class: "ail-era" }, svg);

      // paradigms
      var pg = el("g", { class: "ail-paradigms" }, svg);
      plist.forEach(function (q) {
        var Y = pTop + q.lane * (PBAR + PGAP);
        var grp = el("g", { class: "ail-paradigm" + (state.paradigm === q.p.id ? " on" : "") + (state.paradigm && state.paradigm !== q.p.id ? " dim" : ""),
          tabindex: 0, role: "button", "aria-label": q.p.name + ", " + human(q.p.start) + " to " + (q.p.end ? human(q.p.end) : "now") }, pg);
        el("rect", { x: q.a, y: Y, width: Math.max(q.b - q.a, 4), height: PBAR, rx: 5, class: "ail-pbar" + (q.p.end ? "" : " open") }, grp);
        var name = q.p.name, room = q.b - q.a - 12, tw = textWidth(name, family);
        if (tw <= room) { var tx = el("text", { x: q.a + 7, y: Y + PBAR / 2 + 4, class: "ail-plabel" }, grp); tx.textContent = name; }
        else if (q.leftFree < q.a - tw - 16) {   // a short era: its name sits to the left of the bar
          var tl = el("text", { x: q.a - 6, y: Y + PBAR / 2 + 4, class: "ail-plabel", "text-anchor": "end" }, grp); tl.textContent = name;
        } else {
          while (name.length > 3 && textWidth(name + "…", family) > room) name = name.slice(0, -1);
          if (name.length > 3) { var tt = el("text", { x: q.a + 7, y: Y + PBAR / 2 + 4, class: "ail-plabel" }, grp); tt.textContent = name + "…"; }
        }
        grp.addEventListener("mousemove", function (e) { showTip(e, [q.p.name, human(q.p.start) + " to " + (q.p.end ? human(q.p.end) : "now")]); });
        grp.addEventListener("mouseleave", hideTip);
        grp.addEventListener("click", function () { hideTip(); select(state.paradigm === q.p.id ? null : { paradigm: q.p.id }); });
        grp.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); select({ paradigm: q.p.id }); } });
      });

      // lineage curves
      var lg = el("g", { class: "ail-edges" }, svg);
      edges.forEach(function (e, i) {
        var a = pos[e.from], b = pos[e.to];
        var kind = tr ? (tr.eUp[i] ? "up" : tr.eDown[i] ? "down" : "off") : "base";
        if (kind === "off") return;
        var x1 = a.X + 6, y1 = a.Y, x2 = b.X - 7, y2 = b.Y;
        if (x2 < x1 + 4) { x2 = b.X; y2 = b.Y + (b.Y > a.Y ? -6 : 6); x1 = a.X; y1 = a.Y + (b.Y > a.Y ? 6 : -6); }
        var dx = Math.max(Math.abs(x2 - x1) * 0.5, 24);
        var path = el("path", { d: "M" + x1 + " " + y1 + "C" + (x1 + dx) + " " + y1 + " " + (x2 - dx) + " " + y2 + " " + x2 + " " + y2,
          class: "ail-edge ail-edge--" + kind + (era && !(inEra(a.m) || inEra(b.m)) ? " dim" : ""), "marker-end": "url(#ail-arrow-" + kind + ")" }, lg);
        path.addEventListener("mousemove", function (ev) { showTip(ev, [a.m.title + " → " + b.m.title, e.note || ""].filter(Boolean)); });
        path.addEventListener("mouseleave", hideTip);
      });

      // items
      var ig = el("g", { class: "ail-items" }, svg);
      placed.forEach(function (it) {
        var m = it.m;
        var rel = tr ? (m.id === state.selected ? "self" : tr.anc[m.id] ? "up" : tr.desc[m.id] ? "down" : "off") : "";
        var dim = (tr && rel === "off") || (era && !inEra(m));
        var grp = el("g", { class: "ptl-moment ail-item" + (dim ? " dim" : "") + (rel === "self" ? " on" : ""), "data-kind": m.kind, "data-rel": rel,
          tabindex: 0, role: "button", "aria-label": m.title + ", " + human(m.date) }, ig);
        el("rect", { x: it.X - 8, y: it.Y - LANE / 2, width: it.b - it.a + 4, height: LANE, class: "ptl-hit" }, grp);
        if (m.kind === "idea") el("path", { d: "M" + it.X + " " + (it.Y - 5.5) + "l5.5 5.5-5.5 5.5-5.5-5.5z" }, grp);
        else el("circle", { cx: it.X, cy: it.Y, r: 4.5 }, grp);
        { var tx = el("text", { x: it.X + 9, y: it.Y + 3.8, class: "ail-label" }, grp); tx.textContent = label(m); }
        grp.addEventListener("mousemove", function (e) { showTip(e, [m.title, human(m.date) + " · " + (m.kind === "idea" ? "Idea" : "Product")]); });
        grp.addEventListener("mouseleave", hideTip);
        grp.addEventListener("click", function () { hideTip(); select(state.selected === m.id ? null : { item: m.id }); });
        grp.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); select({ item: m.id }); } });
      });

      if (keepScroll) frame.scrollLeft = scrollLeft;
      else frame.scrollLeft = frame.scrollWidth;   // open on the recent years, where most of it is
    }

    draw(false);
    var last = frame.clientWidth;
    window.addEventListener("resize", function () {
      if (Math.abs(frame.clientWidth - last) > 40) { last = frame.clientWidth; draw(true); }
    });
  }

  function start(mount, data) {
    var fallback = mount.parentNode.querySelector(".ail-fallback");
    if (fallback) fallback.hidden = true;
    mount.hidden = false;
    build(mount, data);
  }
  function init() {
    document.querySelectorAll("[data-ail]").forEach(function (mount) {
      var inline = document.querySelector("script[data-people-timeline]");
      if (inline) {
        try { start(mount, JSON.parse(inline.textContent)); return; } catch (e) { /* fall through to fetch */ }
      }
      var url = mount.getAttribute("data-src");
      if (!url) return;
      fetch(url).then(function (r) { return r.json(); }).then(function (d) { start(mount, d); }).catch(function () {});
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
