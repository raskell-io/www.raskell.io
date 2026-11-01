/* People timeline: who worked where, when, and where they went next.
 *
 * Reads the JSON in <script type="application/json" data-people-timeline> next to a
 * <div class="ptl" data-ptl> mount (written by the `people_timeline` shortcode from a file in data/)
 * and draws one lane per person: bars coloured by organisation (or by place), a mark where someone
 * left, arcs to the people they founded, funded, fought or followed, and a band of milestones on top.
 * Without JavaScript the shortcode's plain list stays visible instead.
 *
 * Data shape (all dates "YYYY", "YYYY-MM" or "YYYY-MM-DD"):
 *   range   {start, focus, end}   years; start..focus is drawn compressed
 *   orgs    {id: {name, kind, colour, place}}
 *   places  {id: {name, colour}}
 *   sources {id: {short, title}}
 *   people  [{id, name, handle, url, photo, photo_credit, summary, src: [...],
 *             stints: [{org, role, start, end, place, left, src}]}]
 *   links   [{a, b, kind, date, end, note, src}]
 *   moments [{date, kind: idea|product|event, title, detail, people, orgs, place, src}]
 */
(function () {
  "use strict";

  var NS = "http://www.w3.org/2000/svg";
  var ROW = 46, BAR = 12, TOPBAND = 108, AXIS = 30, LEFT = 220, PAD = 18, LEGEND_TOP = 12;
  var LINK_KINDS = {
    cofounders: "Co-founded", mentor: "Mentored", funder: "Funded", investment: "Invested in",
    rival: "Rivals", fired: "Pushed out", resigned: "Resigned over", defected: "Left for a rival of",
    ally: "Allies", partnership: "Partners", board: "On the board with", family: "Family", other: "Linked"
  };
  var LINK_TONE = {
    cofounders: "gold", funder: "teal", investment: "teal", mentor: "teal", ally: "teal",
    partnership: "teal", board: "grey", family: "grey", other: "grey",
    rival: "red", fired: "red", resigned: "red", defected: "violet"
  };
  var MOMENT_ROWS = [
    { kind: "idea", label: "Ideas" },
    { kind: "product", label: "Products" },
    { kind: "event", label: "Turns" }
  ];

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
  // "2015", "2015-12", "2015-12-11" -> fractional year at the middle of the period named.
  function year(d, fallback) {
    if (d === null || d === undefined || d === "") return fallback;
    var p = String(d).split("-").map(Number);
    if (p.length === 1) return p[0] + 0.5;
    if (p.length === 2) return p[0] + (p[1] - 0.5) / 12;
    return p[0] + (p[1] - 1) / 12 + (p[2] - 0.5) / 365;
  }
  function startOf(d) { var p = String(d).split("-").map(Number); return p.length === 1 ? p[0] : year(d); }
  function endOf(d, fallback) {
    if (d === null || d === undefined || d === "") return fallback;
    var p = String(d).split("-").map(Number); return p.length === 1 ? p[0] + 1 : year(d);
  }
  var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  function human(d) {
    if (!d) return "now";
    var p = String(d).split("-");
    if (p.length === 1) return p[0];
    if (p.length === 2) return MONTHS[+p[1] - 1] + " " + p[0];
    return +p[2] + " " + MONTHS[+p[1] - 1] + " " + p[0];
  }
  function initials(name) {
    var w = name.replace(/\(.*?\)/g, "").trim().split(/\s+/);
    return (w[0][0] + (w.length > 1 ? w[w.length - 1][0] : "")).toUpperCase();
  }

  function build(mount, data) {
    var R = data.range, people = data.people, orgs = data.orgs, places = data.places || {};
    var byId = {}; people.forEach(function (p, i) { p.index = i; byId[p.id] = p; });
    var state = { colour: "org", sources: {}, focusOrg: null, selected: null };
    Object.keys(data.sources || {}).forEach(function (s) { state.sources[s] = true; });

    function visibleBySource(item) {
      if (!item.src || !item.src.length) return true;
      return item.src.some(function (s) { return state.sources[s] !== false; });
    }

    // --- controls ---------------------------------------------------------------
    mount.innerHTML = "";
    var controls = h("div", "ptl-controls", mount);
    var colourGroup = h("div", "ptl-group", controls);
    h("span", "ptl-group-label", colourGroup, "Colour by");
    ["org", "place"].forEach(function (mode) {
      var b = h("button", "ptl-chip", colourGroup, mode === "org" ? "Organisation" : "Place");
      b.type = "button"; b.setAttribute("aria-pressed", String(state.colour === mode));
      b.addEventListener("click", function () {
        state.colour = mode;
        colourGroup.querySelectorAll("button").forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
        draw();
      });
    });
    if (data.sources && Object.keys(data.sources).length > 1) {
      var srcGroup = h("div", "ptl-group", controls);
      h("span", "ptl-group-label", srcGroup, "From");
      Object.keys(data.sources).forEach(function (s) {
        var b = h("button", "ptl-chip", srcGroup, data.sources[s].short);
        b.type = "button"; b.title = data.sources[s].title; b.setAttribute("aria-pressed", "true");
        b.addEventListener("click", function () {
          state.sources[s] = !state.sources[s];
          if (!Object.keys(state.sources).some(function (k) { return state.sources[k]; })) state.sources[s] = true;
          b.setAttribute("aria-pressed", String(state.sources[s]));
          draw();
        });
      });
    }
    var key = h("p", "ptl-bandkey", mount);
    key.innerHTML = '<span class="ptl-k ptl-k--idea"></span>Ideas <span class="ptl-k ptl-k--product"></span>Products <span class="ptl-k ptl-k--event"></span>Turns <span class="ptl-k ptl-k--flip"></span>Moved on';
    var legend = h("div", "ptl-legend", mount);

    var frame = h("div", "ptl-frame", mount);
    frame.tabIndex = 0;
    frame.setAttribute("role", "region");
    frame.setAttribute("aria-label", "Timeline, scroll sideways");
    var tip = h("div", "ptl-tip", mount); tip.hidden = true;
    var panel = h("div", "ptl-panel", mount);
    panel.setAttribute("aria-live", "polite");
    h("p", "ptl-hint", panel, "Choose a person, an organisation or a milestone to see the details and the sources.");

    // --- scale --------------------------------------------------------------------
    var W, x;
    function scale() {
      // phones: the name column shrinks to the portraits; the name is in each portrait's label and the panel
      state.compact = frame.clientWidth < 600;
      LEFT = state.compact ? 58 : 220;
      frame.classList.toggle("ptl-compact", state.compact);
      var avail = Math.max(frame.clientWidth - LEFT - PAD, 560);
      var years = R.end - R.focus;
      var perYear = Math.max(avail / (years + 3.2), 30);   // phones scroll sideways; wide screens fit
      var early = perYear * 3.2;                        // start..focus squeezed into about three years of width
      W = LEFT + early + perYear * years + PAD;
      x = function (t) {
        if (t <= R.focus) return LEFT + Math.max(0, (t - R.start) / (R.focus - R.start)) * early;
        return LEFT + early + (Math.min(t, R.end) - R.focus) * perYear;
      };
    }

    function colourOf(stint) {
      if (state.colour === "place") {
        var pl = places[stint.place] || null;
        return pl ? pl.colour : "var(--faint)";
      }
      var o = orgs[stint.org];
      return o && o.colour ? o.colour : "var(--faint)";
    }

    // --- tooltip -----------------------------------------------------------------
    function showTip(evt, lines) {
      tip.innerHTML = "";
      lines.forEach(function (l, i) { h(i === 0 ? "strong" : "span", null, tip, l); });
      tip.hidden = false;
      var r = mount.getBoundingClientRect();
      var px = evt.clientX - r.left + 14, py = evt.clientY - r.top + 14;
      tip.style.left = Math.min(px, r.width - 280) + "px";
      tip.style.top = py + "px";
    }
    function hideTip() { tip.hidden = true; }

    // --- detail panel -----------------------------------------------------------------
    // "Hao, Mallaby · ch. 4" with a link when the claim was checked on the web
    function srcEl(parent, item, cls) {
      if (!item.src) return;
      var span = h("span", cls || "ptl-src", parent);
      var names = item.src.filter(function (s) { return s !== "web" || !item.url; })
        .map(function (s) { return data.sources[s] ? data.sources[s].short : s; });
      span.appendChild(document.createTextNode(names.join(", ") + (item.ref ? (names.length ? " · " : "") + item.ref : "")));
      if (item.url) {
        if (names.length || item.ref) span.appendChild(document.createTextNode(" · "));
        var a = h("a", null, span, new URL(item.url).hostname.replace(/^www\./, "")); a.href = item.url; a.rel = "noopener";
      }
    }
    function portrait(p, size, parent) {
      var wrap = h("span", "ptl-portrait", parent);
      wrap.style.setProperty("--ptl-size", size + "px");
      if (p.photo) {
        var img = h("img", null, wrap); img.src = p.photo; img.alt = ""; img.loading = "lazy"; img.decoding = "async";
      } else {
        h("span", "ptl-initials", wrap, initials(p.name));
      }
      return wrap;
    }
    function personPanel(p) {
      panel.innerHTML = "";
      var head = h("div", "ptl-panel-head", panel);
      portrait(p, 64, head);
      var who = h("div", null, head);
      h("h3", null, who, p.name);
      var meta = h("p", "ptl-meta", who);
      if (p.handle) {
        var a = h("a", null, meta, "@" + p.handle); a.href = "https://x.com/" + p.handle; a.rel = "noopener";
      }
      if (p.url) {
        if (p.handle) meta.appendChild(document.createTextNode(" · "));
        var w = h("a", null, meta, /wikipedia/.test(p.url) ? "Wikipedia" : "Profile"); w.href = p.url; w.rel = "noopener";
      }
      if (p.summary) h("p", null, panel, p.summary);
      if (p.photo && p.photo_credit) {
        var c = p.photo_credit, cr = h("p", "ptl-credit", panel, "Photo: " + (c.by || "Wikimedia Commons") + ", ");
        var la = h("a", null, cr, c.licence || "licence"); la.href = c.licence_url || c.page; la.rel = "license noopener";
        cr.appendChild(document.createTextNode(", via "));
        var pa = h("a", null, cr, "Wikimedia Commons"); pa.href = c.page; pa.rel = "noopener";
      }
      var list = h("ol", "ptl-stints", panel);
      p.stints.filter(visibleBySource).forEach(function (s) {
        var li = h("li", null, list);
        var dot = h("span", "ptl-dot", li); dot.style.background = colourOf(s);
        h("span", "ptl-when", li, human(s.start) + " to " + (s.end ? human(s.end) : "now"));
        var o = orgs[s.org];
        h("span", null, li, (s.role ? s.role + ", " : "") + (o ? o.name : s.org) + (s.place && places[s.place] ? " (" + places[s.place].name + ")" : ""));
        if (s.left) h("span", "ptl-left", li, s.left);
        srcEl(li, s);
      });
      var mine = data.links.filter(function (l) { return (l.a === p.id || l.b === p.id) && visibleBySource(l); });
      if (mine.length) {
        h("h4", null, panel, "Ties");
        var ul = h("ul", "ptl-ties", panel);
        mine.sort(function (a, b) { return year(a.date, 0) - year(b.date, 0); }).forEach(function (l) {
          var other = byId[l.a === p.id ? l.b : l.a];
          var li = h("li", null, ul);
          li.dataset.tone = LINK_TONE[l.kind] || "grey";
          h("span", "ptl-when", li, human(l.date));
          var b = h("button", "ptl-link", li, other ? other.name : (orgs[l.b] ? orgs[l.b].name : l.b));
          b.type = "button";
          if (other) b.addEventListener("click", function () { select({ person: other.id }); });
          h("span", null, li, " " + (LINK_KINDS[l.kind] || l.kind).toLowerCase() + (l.note ? ": " + l.note : ""));
          srcEl(li, l);
        });
      }
      var theirs = data.moments.filter(function (m) { return (m.people || []).indexOf(p.id) >= 0 && visibleBySource(m); });
      if (theirs.length) {
        h("h4", null, panel, "Milestones");
        var ml = h("ul", "ptl-ties", panel);
        theirs.forEach(function (m) {
          var li = h("li", null, ml);
          h("span", "ptl-when", li, human(m.date));
          var b = h("button", "ptl-link", li, m.title); b.type = "button";
          b.addEventListener("click", function () { select({ moment: data.moments.indexOf(m) }); });
        });
      }
    }
    function momentPanel(m) {
      panel.innerHTML = "";
      h("p", "ptl-meta", panel, human(m.date) + (m.place && places[m.place] ? " · " + places[m.place].name : "") + " · " + ({ idea: "Idea", product: "Product", event: "Turn" }[m.kind] || m.kind));
      h("h3", null, panel, m.title);
      if (m.detail) h("p", null, panel, m.detail);
      var who = (m.people || []).map(function (id) { return byId[id]; }).filter(Boolean);
      if (who.length) {
        var row = h("p", "ptl-people", panel);
        who.forEach(function (p) {
          var b = h("button", "ptl-link", row); b.type = "button";
          portrait(p, 24, b); b.appendChild(document.createTextNode(p.name));
          b.addEventListener("click", function () { select({ person: p.id }); });
        });
      }
      var os = (m.orgs || []).map(function (id) { return orgs[id] ? orgs[id].name : id; });
      if (os.length) h("p", "ptl-meta", panel, os.join(", "));
      srcEl(h("p", "ptl-src-p", panel), m);
    }
    function orgPanel(id) {
      var o = orgs[id]; panel.innerHTML = "";
      h("p", "ptl-meta", panel, (o.kind || "") + (o.place && places[o.place] ? " · " + places[o.place].name : "") + (o.founded ? " · founded " + human(o.founded) : ""));
      h("h3", null, panel, o.name);
      if (o.note) h("p", null, panel, o.note);
      var ul = h("ul", "ptl-ties", panel);
      people.forEach(function (p) {
        p.stints.filter(function (s) { return s.org === id && visibleBySource(s); }).forEach(function (s) {
          var li = h("li", null, ul);
          h("span", "ptl-when", li, human(s.start) + " to " + (s.end ? human(s.end) : "now"));
          var b = h("button", "ptl-link", li, p.name); b.type = "button";
          b.addEventListener("click", function () { select({ person: p.id }); });
          if (s.role) h("span", null, li, ", " + s.role);
        });
      });
    }
    function select(what) {
      state.selected = what;
      if (what && what.person) { state.focusOrg = null; personPanel(byId[what.person]); }
      else if (what && what.moment !== undefined) momentPanel(data.moments[what.moment]);
      else if (what && what.org) { state.focusOrg = what.org; orgPanel(what.org); }
      draw();
      if (what && what.person) {
        var row = frame.querySelector('[data-person="' + what.person + '"]');
        if (row && row.scrollIntoView && !isVisible(row)) row.scrollIntoView({ block: "nearest" });
      }
    }
    function isVisible(n) {
      var r = n.getBoundingClientRect();
      return r.top >= 0 && r.bottom <= (window.innerHeight || 0);
    }

    // --- drawing ------------------------------------------------------------------------
    function draw() {
      scale();
      var shown = people.filter(function (p) { return p.stints.some(visibleBySource); });
      var rowOf = {}; shown.forEach(function (p, i) { rowOf[p.id] = i; });
      // rows grow with the number of roles someone held at once: lane 0 at the bottom, parallel roles above it
      var LANE = 9, cursor = AXIS + TOPBAND, layout = {};
      shown.forEach(function (p) {
        var stints = p.stints.filter(visibleBySource).slice().sort(function (a, b) { return startOf(a.start) - startOf(b.start); });
        // longest roles claim the main line first; shorter parallel ones (board seats, side funds) go above
        var spans = stints.map(function (s, i) {
          var a = x(startOf(s.start)), o = orgs[s.org] || {};
          var side = /board|investor|advis|trustee|chair of|donor/i.test(s.role || "") || o.kind === "investor" || o.kind === "nonprofit";
          var bb = Math.max(x(endOf(s.end, R.end)), a + 4);
          return { i: i, a: a, b: bb, w: (bb - a) * (side ? 0.25 : 1) };
        });
        var lanesOf = [], used = [];
        spans.slice().sort(function (p, q) { return q.w - p.w; }).forEach(function (sp) {
          var lane = 0;
          while ((used[lane] || []).some(function (o) { return sp.a < o.b - 1 && o.a < sp.b - 1; })) lane++;
          (used[lane] = used[lane] || []).push(sp); lanesOf[sp.i] = lane;
        });
        var rowH = ROW + Math.max(0, used.length - 1) * LANE;
        layout[p.id] = { top: cursor, h: rowH, y0: cursor + rowH - ROW / 2, stints: stints, lanes: lanesOf };
        cursor += rowH;
      });
      var Hh = cursor + PAD;
      var sel = state.selected && state.selected.person ? state.selected.person : null;
      var related = {};
      if (sel) {
        related[sel] = true;
        data.links.forEach(function (l) { if (l.a === sel) related[l.b] = true; if (l.b === sel) related[l.a] = true; });
      }

      frame.innerHTML = "";
      var svg = el("svg", { width: W, height: Hh, viewBox: "0 0 " + W + " " + Hh, class: "ptl-svg", role: "img",
        "aria-label": "Timeline of " + shown.length + " people from " + R.start + " to " + R.end }, frame);
      var defs = el("defs", {}, svg);
      var clip = el("clipPath", { id: "ptl-circle", clipPathUnits: "objectBoundingBox" }, defs);
      el("circle", { cx: 0.5, cy: 0.5, r: 0.5 }, clip);

      // year grid
      var g = el("g", { class: "ptl-axis" }, svg);
      var ticks = [R.start, 1970, 1990];
      for (var y = R.focus; y <= R.end; y++) ticks.push(y);
      var perYear = x(R.focus + 1) - x(R.focus);
      ticks.forEach(function (t) {
        var X = x(t);
        el("line", { x1: X, x2: X, y1: AXIS - 6, y2: Hh - PAD, class: t % 5 === 0 || t < R.focus ? "major" : "" }, g);
        if (t < R.focus || perYear >= 52 || t % 2 === 1 || t === R.focus) {
          var tx = el("text", { x: X + 3, y: AXIS - 12 }, g); tx.textContent = t;
        }
      });
      // compressed era shading
      el("rect", { x: LEFT, y: AXIS - 6, width: x(R.focus) - LEFT, height: Hh - PAD - AXIS + 6, class: "ptl-early" }, svg);
      var et = el("text", { x: LEFT + 4, y: Hh - PAD - 6, class: "ptl-early-label" }, svg); et.textContent = "compressed";

      // milestone band
      var band = el("g", { class: "ptl-band" }, svg);
      MOMENT_ROWS.forEach(function (mr, i) {
        var y0 = AXIS + 10 + i * 30;
        var lab = el("text", { x: 14, y: y0 + 4, class: "ptl-band-label" }, band); lab.textContent = mr.label;
        el("line", { x1: LEFT, x2: W - PAD, y1: y0, y2: y0, class: "ptl-band-rule" }, band);
        var placed = [];
        data.moments.forEach(function (m, mi) {
          if (m.kind !== mr.kind || !visibleBySource(m)) return;
          var X = x(year(m.date, R.end));
          var lane = 0; while (placed.some(function (p) { return p.lane === lane && Math.abs(p.x - X) < 9; })) lane++;
          placed.push({ x: X, lane: lane });
          var Y = y0 + (lane % 3) * 6 - (lane ? 3 : 0);
          var hit = el("g", { class: "ptl-moment", "data-kind": m.kind, tabindex: 0, role: "button",
            "aria-label": human(m.date) + ": " + m.title }, band);
          var focused = sel && (m.people || []).indexOf(sel) >= 0;
          var dim = (sel && !focused) || (state.focusOrg && (m.orgs || []).indexOf(state.focusOrg) < 0);
          if (dim) hit.classList.add("dim");
          if (state.selected && state.selected.moment === mi) hit.classList.add("on");
          if (m.kind === "idea") el("path", { d: "M" + X + " " + (Y - 6) + "l6 6-6 6-6-6z" }, hit);
          else if (m.kind === "product") el("circle", { cx: X, cy: Y, r: 5 }, hit);
          else el("rect", { x: X - 1.5, y: Y - 7, width: 3, height: 14, rx: 1 }, hit);
          el("rect", { x: X - 8, y: Y - 10, width: 16, height: 20, class: "ptl-hit" }, hit);
          hit.addEventListener("mousemove", function (e) { showTip(e, [m.title, human(m.date)]); });
          hit.addEventListener("mouseleave", hideTip);
          hit.addEventListener("click", function () { hideTip(); select({ moment: mi }); });
          hit.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); select({ moment: mi }); } });
        });
      });

      // people lanes
      var top = AXIS + TOPBAND;
      var lanes = el("g", { class: "ptl-lanes" }, svg);
      shown.forEach(function (p, i) {
        var L = layout[p.id], y0 = L.y0;
        var dim = (sel && !related[p.id]) || (state.focusOrg && !p.stints.some(function (s) { return s.org === state.focusOrg; }));
        var row = el("g", { class: "ptl-row" + (dim ? " dim" : "") + (sel === p.id ? " on" : ""), "data-person": p.id }, lanes);
        if (i % 2 === 0) el("rect", { x: 0, y: L.top, width: W, height: L.h, class: "ptl-zebra" }, row);
        var stints = L.stints;
        if (stints.length) {
          var first = x(startOf(stints[0].start)), last = x(endOf(stints[stints.length - 1].end, R.end));
          el("line", { x1: first, x2: last, y1: y0, y2: y0, class: "ptl-thread" }, row);
        }
        // overlapping stints (a board seat during a job) stack slightly above
        stints.forEach(function (s, si) {
          var a = x(startOf(s.start)), b = Math.max(x(endOf(s.end, R.end)), a + 4);
          var lane = L.lanes[si];
          var yy = y0 - lane * LANE - BAR / 2 + (lane ? 2 : 0);
          var bar = el("rect", { x: a, y: yy, width: b - a, height: BAR - (lane ? 4 : 0), rx: (BAR - (lane ? 4 : 0)) / 2,
            fill: colourOf(s), class: "ptl-bar" + (s.end ? "" : " open") + (state.focusOrg === s.org ? " hl" : "") }, row);
          var o = orgs[s.org];
          bar.addEventListener("mousemove", function (e) {
            showTip(e, [(o ? o.name : s.org), (s.role ? s.role + ", " : "") + human(s.start) + " to " + (s.end ? human(s.end) : "now"),
              s.place && places[s.place] ? places[s.place].name : "", s.left || ""].filter(Boolean));
          });
          bar.addEventListener("mouseleave", hideTip);
          bar.addEventListener("click", function () { hideTip(); select({ org: s.org }); });
          if (lane === 0 && b - a > 58 && o) {
            var t = el("text", { x: a + 7, y: y0 + 4, class: "ptl-bar-label" }, row);
            t.textContent = o.short || o.name;
            while (t.getComputedTextLength && t.getComputedTextLength() > b - a - 12 && t.textContent.length > 3) t.textContent = t.textContent.slice(0, -2) + "…";
          }
          if (s.end && s.left) {   // a flip: where they left, and why
            var fx = x(endOf(s.end, R.end));
            var f = el("g", { class: "ptl-flip" }, row);
            el("circle", { cx: fx, cy: y0 - lane * LANE, r: lane ? 3.5 : 4.5 }, f);
            f.addEventListener("mousemove", function (e) { showTip(e, ["Left " + (o ? o.name : s.org), human(s.end), s.left]); });
            f.addEventListener("mouseleave", hideTip);
          }
        });
      });

      // ties of the selected person, drawn as arcs between lanes at the year they happened
      if (sel && rowOf[sel] !== undefined) {
        var arcs = el("g", { class: "ptl-arcs" }, svg);
        data.links.forEach(function (l) {
          if ((l.a !== sel && l.b !== sel) || !visibleBySource(l)) return;
          var other = l.a === sel ? l.b : l.a;
          if (rowOf[other] === undefined) return;
          var X = x(year(l.date, R.end));
          var y1 = layout[sel].y0, y2 = layout[other].y0;
          var bend = Math.min(90, 14 + Math.abs(y2 - y1) * 0.28);
          var path = el("path", { d: "M" + X + " " + y1 + " C" + (X + bend) + " " + y1 + " " + (X + bend) + " " + y2 + " " + X + " " + y2,
            class: "ptl-arc", "data-tone": LINK_TONE[l.kind] || "grey" }, arcs);
          el("circle", { cx: X, cy: y2, r: 3.5, class: "ptl-arc-end", "data-tone": LINK_TONE[l.kind] || "grey" }, arcs);
          path.addEventListener("mousemove", function (e) {
            showTip(e, [(LINK_KINDS[l.kind] || l.kind) + ": " + byId[l.a].name + " and " + byId[l.b].name, human(l.date), l.note || ""].filter(Boolean));
          });
          path.addEventListener("mouseleave", hideTip);
        });
      }

      // names: an HTML column that stays put while the chart scrolls sideways
      var names = h("div", "ptl-names");
      frame.insertBefore(names, svg);
      names.style.height = Hh + "px";
      names.style.width = LEFT + "px"; names.style.marginInlineEnd = -LEFT + "px";
      h("div", "ptl-names-band", names).style.height = (AXIS + TOPBAND) + "px";
      shown.forEach(function (p, i) {
        var dim = (sel && !related[p.id]) || (state.focusOrg && !p.stints.some(function (s) { return s.org === state.focusOrg; }));
        var b = h("button", "ptl-name" + (sel === p.id ? " on" : "") + (dim ? " dim" : ""), names);
        b.type = "button"; b.style.top = layout[p.id].top + "px"; b.style.height = layout[p.id].h + "px";
        b.dataset.person = p.id;
        b.setAttribute("aria-pressed", String(sel === p.id));
        b.title = p.name;
        var ring = portrait(p, 32, b);
        var now = p.stints.filter(visibleBySource).slice(-1)[0];
        if (now) ring.style.setProperty("--ptl-ring", colourOf(now));
        var txt = h("span", "ptl-name-text", b);
        h("span", null, txt, p.name);
        if (p.handle) h("span", "ptl-handle", txt, "@" + p.handle);
        b.addEventListener("click", function () { select(sel === p.id ? null : { person: p.id }); if (sel === p.id) clearPanel(); });
      });

      // legend
      legend.innerHTML = "";
      // keys ordered by how many people passed through; the long tail sits behind "Show all"
      var used = {};
      shown.forEach(function (p) {
        var seen = {};
        p.stints.filter(visibleBySource).forEach(function (s) { var k = state.colour === "place" ? s.place : s.org; if (k && !seen[k]) { seen[k] = true; used[k] = (used[k] || 0) + 1; } });
      });
      var table = state.colour === "place" ? places : orgs;
      var keys = Object.keys(table).filter(function (k) { return used[k] && table[k].legend !== false; })
        .sort(function (a, b) { return used[b] - used[a] || (table[a].name < table[b].name ? -1 : 1); });
      var cut = state.legendAll ? keys.length : Math.min(keys.length, LEGEND_TOP);
      if (state.focusOrg && keys.indexOf(state.focusOrg) >= cut) cut = keys.indexOf(state.focusOrg) + 1;
      keys.slice(0, cut).forEach(function (k) {
        var b = h("button", "ptl-key" + (state.focusOrg === k ? " on" : ""), legend);
        b.type = "button";
        var sw = h("span", "ptl-dot", b); sw.style.background = table[k].colour;
        b.appendChild(document.createTextNode(table[k].short || table[k].name));
        if (state.colour === "org") b.addEventListener("click", function () { if (state.focusOrg === k) { state.focusOrg = null; clearPanel(); draw(); } else select({ org: k }); });
        else b.disabled = true;
      });
      if (keys.length > LEGEND_TOP) {
        var more = h("button", "ptl-key ptl-more", legend, state.legendAll ? "Show fewer" : "Show all " + keys.length);
        more.type = "button"; more.setAttribute("aria-expanded", String(!!state.legendAll));
        more.addEventListener("click", function () { state.legendAll = !state.legendAll; draw(); });
      }
    }
    function clearPanel() {
      state.selected = null;
      panel.innerHTML = "";
      h("p", "ptl-hint", panel, "Choose a person, an organisation or a milestone to see the details and the sources.");
    }

    draw();
    var last = frame.clientWidth;
    window.addEventListener("resize", function () {
      if (Math.abs(frame.clientWidth - last) > 40) { last = frame.clientWidth; draw(); }
    });
    // open on the present
    frame.scrollLeft = 0;
  }

  function init() {
    document.querySelectorAll("[data-ptl]").forEach(function (mount) {
      var src = mount.parentNode.querySelector("script[data-people-timeline]");
      if (!src) return;
      var data;
      try { data = JSON.parse(src.textContent); } catch (e) { return; }
      var fallback = mount.parentNode.querySelector(".ptl-fallback");
      if (fallback) fallback.hidden = true;
      mount.hidden = false;
      build(mount, data);
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
