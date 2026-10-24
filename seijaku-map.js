// The site graph: a small force-directed graph of articles, notes, topics, series, categories, projects and reading on a
// canvas, no libraries. The /map/ page mounts the whole graph from its #map-data JSON; the end-of-page
// maps (partials/local_map.html) fetch that JSON and mount one page's neighbourhood with SeijakuMap.local().
(function () {
  "use strict";

function mount(fig, data, opts) {
  opts = opts || {};
  var canvas = fig.querySelector("canvas");
  var ctx = canvas.getContext("2d");
  var card = fig.querySelector(".map__card");
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var font = getComputedStyle(document.body).fontFamily;

  var STYLE = {
    article: { fill: "#f4f0df", base: 2.6, grow: 0.9 },
    note: { fill: "#f4f0df", square: true, base: 2.2, grow: 0.8 },
    talk: { fill: "#efd093", base: 3, grow: 0.9 },
    tag: { fill: "#72d7dc", base: 3.2, grow: 1.45 },
    series: { fill: "#efd093", base: 5, grow: 1.1 },
    category: { fill: null, ring: "#efd093", square: true, base: 4.4, grow: 0.9 },
    project: { fill: null, ring: "#efd093", base: 4.4, grow: 1.1 },
    work: { fill: null, ring: "#a9e8e9", diamond: true, base: 3.4, grow: 0.9 },
    hub: { fill: null, ring: "#f4f0df", base: 6, grow: 0.5 }
  };
  var REST = { tag: 46, series: 40, category: 52, talk: 60, project: 58, work: 54, article: 64, note: 56, hub: 70, tagtag: 62 };

  // Nodes and links ---------------------------------------------------------
  var nodes = [], byId = {};
  data.nodes.forEach(function (n) {
    if (!n) { return; }
    n.deg = 0; n.nb = []; n.vx = 0; n.vy = 0;
    byId[n.id] = n; nodes.push(n);
  });
  var seen = {}, links = [];
  data.links.forEach(function (l) {
    if (!l) { return; }
    var a = byId[l[0]], b = byId[l[1]];
    var key = l[0] < l[1] ? l[0] + "|" + l[1] : l[1] + "|" + l[0];
    if (!a || !b || a === b || seen[key]) { return; }
    seen[key] = true;
    a.deg++; b.deg++; a.nb.push(b); b.nb.push(a);
    var page = function (n) { return n.kind === "article" || n.kind === "note" || n.kind === "talk"; };
    var k = a.kind === "hub" || b.kind === "hub" ? "hub" : a.kind === "tag" && b.kind === "tag" ? "tagtag" : page(a) ? b.kind : a.kind;
    links.push({ a: a, b: b, rest: REST[k] || 50 });
  });
  // Orphans (an unlinked project, a topic with no articles) would only drift; leave them out.
  nodes = nodes.filter(function (n) { return n.deg > 0; });
  nodes.forEach(function (n, i) {
    var s = STYLE[n.kind];
    n.r = s.base + Math.sqrt(n.deg) * s.grow;
    // Deterministic start: a sunflower spiral, so the layout comes out the same on every visit.
    var t = i * 2.39996, rad = 26 * Math.sqrt(i + 1);
    n.x = Math.cos(t) * rad; n.y = Math.sin(t) * rad;
  });

  // Simulation --------------------------------------------------------------
  var alpha = 1;
  function tick() {
    var i, j, a, b, dx, dy, d2, d, f;
    for (i = 0; i < nodes.length; i++) {
      a = nodes[i];
      for (j = i + 1; j < nodes.length; j++) {
        b = nodes[j];
        dx = b.x - a.x; dy = b.y - a.y; d2 = Math.max(dx * dx + dy * dy, 64);
        if (d2 > 160000) { continue; }
        f = (420 * alpha) / d2;
        a.vx -= dx * f; a.vy -= dy * f; b.vx += dx * f; b.vy += dy * f;
      }
    }
    for (i = 0; i < links.length; i++) {
      a = links[i].a; b = links[i].b;
      dx = b.x - a.x; dy = b.y - a.y; d = Math.sqrt(dx * dx + dy * dy) || 0.01;
      f = ((d - links[i].rest) / d) * alpha * 0.3;
      var wa = b.deg / (a.deg + b.deg), wb = 1 - wa;   // the busier end moves less
      a.vx += dx * f * wa; a.vy += dy * f * wa; b.vx -= dx * f * wb; b.vy -= dy * f * wb;
    }
    for (i = 0; i < nodes.length; i++) {
      a = nodes[i];
      a.vx -= a.x * 0.006 * alpha; a.vy -= a.y * 0.006 * alpha;
      if (a.fixed) { a.vx = 0; a.vy = 0; continue; }
      a.vx *= 0.6; a.vy *= 0.6;
      var v = Math.sqrt(a.vx * a.vx + a.vy * a.vy);
      if (v > 24) { a.vx *= 24 / v; a.vy *= 24 / v; }   // no slingshots out of a crowded start
      a.x += a.vx; a.y += a.vy;
    }
    alpha += (0 - alpha) * 0.018;
  }

  // View --------------------------------------------------------------------
  var W = 0, H = 0, dpr = 1, scale = 1, tx = 0, ty = 0, touched = false, view = { padTop: opts.padTop == null ? 64 : opts.padTop, bg: null };
  var focus = opts.focus ? byId[opts.focus] : null;
  var hidden = {}, hover = null, sel = null;
  // Group hubs travel with the projects toggle, shelves (of: "work") with the reading toggle.
  function visible(n) { return !hidden[n.kind === "hub" ? n.of || "project" : n.kind]; }
  function fit(animate) {
    var x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    nodes.forEach(function (n) {
      if (!visible(n)) { return; }
      x0 = Math.min(x0, n.x - n.r); y0 = Math.min(y0, n.y - n.r); x1 = Math.max(x1, n.x + n.r); y1 = Math.max(y1, n.y + n.r);
    });
    if (x0 === Infinity) { return; }
    var padTop = view.padTop, pad = 28;
    var s = Math.min((W - pad * 2) / (x1 - x0), (H - padTop - pad) / (y1 - y0), 2.4);
    var nx = W / 2 - ((x0 + x1) / 2) * s, ny = padTop + (H - padTop - pad) / 2 - ((y0 + y1) / 2) * s;
    if (!animate || reduce) { scale = s; tx = nx; ty = ny; return; }
    var s0 = scale, x0v = tx, y0v = ty, t0 = performance.now();
    (function step(now) {
      var k = Math.min(1, (now - t0) / 380), e = 1 - Math.pow(1 - k, 3);
      scale = s0 + (s - s0) * e; tx = x0v + (nx - x0v) * e; ty = y0v + (ny - y0v) * e;
      draw();
      if (k < 1) { requestAnimationFrame(step); }
    })(t0);
  }
  function zoomAt(f, sx, sy) {
    var s = Math.max(0.25, Math.min(6, scale * f));
    tx = sx - (sx - tx) * (s / scale); ty = sy - (sy - ty) * (s / scale); scale = s;
    touched = true; draw();
  }
  function resize() {
    var r = canvas.getBoundingClientRect();
    dpr = window.devicePixelRatio || 1; W = r.width; H = r.height;
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    if (!touched) { fit(false); }
    draw();
  }

  // Drawing -----------------------------------------------------------------
  function lit(n) { return !sel || n === sel || sel.nb.indexOf(n) >= 0; }
  function draw() {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    if (view.bg) { ctx.fillStyle = view.bg; ctx.fillRect(0, 0, W, H); }
    ctx.setTransform(dpr * scale, 0, 0, dpr * scale, dpr * tx, dpr * ty);
    ctx.lineWidth = 1 / scale;
    links.forEach(function (l) {
      if (!visible(l.a) || !visible(l.b)) { return; }
      var on = sel && (l.a === sel || l.b === sel);
      ctx.strokeStyle = on ? "rgba(114, 215, 220, 0.75)" : sel ? "rgba(244, 240, 223, 0.04)" : "rgba(244, 240, 223, 0.13)";
      ctx.beginPath(); ctx.moveTo(l.a.x, l.a.y); ctx.lineTo(l.b.x, l.b.y); ctx.stroke();
    });
    nodes.forEach(function (n) {
      if (!visible(n)) { return; }
      var st = STYLE[n.kind];
      ctx.globalAlpha = lit(n) ? 1 : 0.18;
      ctx.beginPath();
      if (st.square) { ctx.rect(n.x - n.r, n.y - n.r, n.r * 2, n.r * 2); }
      else if (st.diamond) { var q = n.r * 1.25; ctx.moveTo(n.x, n.y - q); ctx.lineTo(n.x + q, n.y); ctx.lineTo(n.x, n.y + q); ctx.lineTo(n.x - q, n.y); ctx.closePath(); } else { ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2); }
      if (st.fill) { ctx.fillStyle = st.fill; ctx.fill(); }
      else { ctx.fillStyle = "#0b1412"; ctx.fill(); ctx.lineWidth = 1.6; ctx.strokeStyle = st.ring; ctx.stroke(); ctx.lineWidth = 1 / scale; }
      if (n === hover || n === sel || n === focus) {
        ctx.beginPath(); ctx.arc(n.x, n.y, n.r + 3 / scale + 1.5, 0, Math.PI * 2);
        ctx.lineWidth = (n === focus ? 2.2 : 1.5) / scale; ctx.strokeStyle = n === focus ? "#efd093" : "#f4f0df"; ctx.stroke(); ctx.lineWidth = 1 / scale;
      }
    });
    ctx.globalAlpha = 1;
    labels();
  }
  // Labels in screen space at a fixed size; busiest first, and a label that would overlap one already drawn is skipped.
  function labels() {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var list = nodes.filter(function (n) {
      if (!visible(n)) { return false; }
      if (n === hover || n === sel || n === focus) { return true; }
      if (sel) { return lit(n); }
      if (opts.allLabels) { return true; }
      if (n.kind === "article" || n.kind === "note" || n.kind === "talk") { return scale > 1.7; }
      return n.deg >= 2 || scale > 1.2;
    }).sort(function (a, b) {
      return (b === hover || b === sel || b === focus) - (a === hover || a === sel || a === focus) || b.deg - a.deg;
    });
    var boxes = [];
    list.forEach(function (n) {
      var big = n.kind !== "article" && n.kind !== "note" && n.kind !== "talk";
      ctx.font = (big ? "500 " : "400 ") + (big ? 13 : 12) + "px " + font;
      var text = n.label.length > 42 ? n.label.slice(0, 40) + "…" : n.label;
      var w = ctx.measureText(text).width, x = Math.max(4, Math.min(W - w - 4, n.x * scale + tx - w / 2)), y = (n.y + n.r) * scale + ty + 6;   // kept inside the canvas
      var box = [x - 3, y - 2, x + w + 3, y + 15];
      var clash = boxes.some(function (o) { return box[0] < o[2] && box[2] > o[0] && box[1] < o[3] && box[3] > o[1]; });
      if (clash && n !== hover && n !== sel) { return; }
      boxes.push(box);
      ctx.fillStyle = "rgba(11, 20, 18, 0.72)"; ctx.fillRect(box[0], box[1], box[2] - box[0], box[3] - box[1]);
      ctx.fillStyle = n === focus ? "#efd093" : n.kind === "tag" ? "#a9e8e9" : n.kind === "article" || n.kind === "note" || n.kind === "talk" ? "rgba(244, 240, 223, 0.86)" : n.kind === "hub" ? "#f4f0df" : n.kind === "work" ? "#a9e8e9" : "#efd093";
      ctx.textBaseline = "top"; ctx.fillText(text, x, y);
    });
  }

  // Selection card -----------------------------------------------------------
  var KIND_NAME = { article: "Article", note: "Note", talk: "Talk", tag: "Topic", series: "Series", project: "Project", hub: "Group", work: "Reading", category: "Category" };
  function select(n) {
    sel = n;
    if (!card) { draw(); return; }
    if (!n) { card.hidden = true; draw(); return; }
    card.querySelector(".map__card-kind").textContent = (n.kind === "hub" && n.of === "work" ? "Shelf" : KIND_NAME[n.kind]) + (n.meta && n.kind !== "project" && n.kind !== "hub" ? " · " + n.meta : "") + " · " + n.deg + " links";
    card.querySelector(".map__card-title").textContent = n.label;
    var desc = card.querySelector(".map__card-desc");
    desc.textContent = n.desc || ""; desc.hidden = !n.desc;
    var open = card.querySelector(".map__card-open");
    open.href = n.url || "#"; open.hidden = !n.url;
    card.hidden = false;
    draw();
  }

  // Input ------------------------------------------------------------------
  function at(sx, sy) {
    var wx = (sx - tx) / scale, wy = (sy - ty) / scale, best = null, bd = Infinity;
    nodes.forEach(function (n) {
      if (!visible(n)) { return; }
      var dx = n.x - wx, dy = n.y - wy, d = Math.sqrt(dx * dx + dy * dy), reach = n.r + 8 / scale;
      if (d < reach && d < bd) { best = n; bd = d; }
    });
    return best;
  }
  function local(e) { var r = canvas.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; }
  var ptrs = {}, drag = null, pinch = null;
  canvas.addEventListener("pointerdown", function (e) {
    var p = local(e);
    ptrs[e.pointerId] = p;
    canvas.setPointerCapture(e.pointerId);
    var ids = Object.keys(ptrs);
    if (ids.length === 2) {
      var a = ptrs[ids[0]], b = ptrs[ids[1]];
      pinch = { d: Math.hypot(a[0] - b[0], a[1] - b[1]), s: scale }; drag = null; return;
    }
    var n = at(p[0], p[1]);
    drag = { node: n, x: p[0], y: p[1], tx: tx, ty: ty, moved: false };
  });
  canvas.addEventListener("pointermove", function (e) {
    var p = local(e);
    if (ptrs[e.pointerId]) { ptrs[e.pointerId] = p; }
    if (pinch) {
      var ids = Object.keys(ptrs); if (ids.length < 2) { return; }
      var a = ptrs[ids[0]], b = ptrs[ids[1]], d = Math.hypot(a[0] - b[0], a[1] - b[1]);
      zoomAt((pinch.s * d / pinch.d) / scale, (a[0] + b[0]) / 2, (a[1] + b[1]) / 2); return;
    }
    if (drag) {
      if (Math.abs(p[0] - drag.x) + Math.abs(p[1] - drag.y) > 4) { drag.moved = true; }
      if (!drag.moved) { return; }
      touched = true;
      if (drag.node) {
        drag.node.fixed = true; drag.node.x = (p[0] - tx) / scale; drag.node.y = (p[1] - ty) / scale;
        if (alpha < 0.25) { alpha = 0.25; run(); }
      } else {
        tx = drag.tx + p[0] - drag.x; ty = drag.ty + p[1] - drag.y;
      }
      draw(); return;
    }
    var h = at(p[0], p[1]);
    if (h !== hover) { hover = h; canvas.style.cursor = h ? "pointer" : "grab"; draw(); }
  });
  function end(e) {
    delete ptrs[e.pointerId];
    if (pinch) { if (Object.keys(ptrs).length < 2) { pinch = null; } return; }
    if (!drag) { return; }
    if (drag.node) { drag.node.fixed = false; }
    if (!drag.moved) {
      // A second tap on the selected dot opens it.
      if (drag.node && drag.node === sel && sel.url) { location.href = sel.url; return; }
      select(drag.node);
    }
    drag = null;
  }
  canvas.addEventListener("pointerup", end);
  canvas.addEventListener("pointercancel", end);
  canvas.addEventListener("pointerleave", function () { if (hover) { hover = null; draw(); } });
  canvas.addEventListener("dblclick", function (e) { var p = local(e), n = at(p[0], p[1]); if (n && n.url) { location.href = n.url; } });
  // Plain scrolling keeps scrolling the page; pinch (ctrlKey on trackpads) or Cmd/Ctrl + wheel zooms.
  canvas.addEventListener("wheel", function (e) {
    if (!e.ctrlKey && !e.metaKey) { return; }
    e.preventDefault();
    var p = local(e); zoomAt(Math.exp(-e.deltaY * 0.004), p[0], p[1]);
  }, { passive: false });
  fig.querySelectorAll("[data-zoom]").forEach(function (b) {
    b.addEventListener("click", function () {
      var z = b.getAttribute("data-zoom");
      if (z === "fit") { touched = false; fit(true); } else { zoomAt(z === "in" ? 1.35 : 1 / 1.35, W / 2, H / 2); }
    });
  });
  fig.querySelectorAll("[data-kind]").forEach(function (b) {
    b.addEventListener("click", function () {
      var k = b.getAttribute("data-kind"), on = b.getAttribute("aria-pressed") === "true";
      b.setAttribute("aria-pressed", on ? "false" : "true");
      hidden[k] = on;
      if (sel && !visible(sel)) { select(null); }
      draw();
    });
  });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && sel) { select(null); } });
  // Focus a node from outside (e.g. /map/#a:/articles/x/): select it and centre on it.
  function focusOn(id) {
    var n = byId[id]; if (!n || nodes.indexOf(n) < 0) { return; }
    touched = true; scale = Math.max(scale, 1.6); tx = W / 2 - n.x * scale; ty = H / 2 - n.y * scale; select(n);
  }

  // Export -----------------------------------------------------------------
  function save(blob, name) {
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
  }
  var base = (location.hostname || "site").replace(/^www\./, "").replace(/\W+/g, "-") + "-map";
  // The whole graph, fitted, on the map's own ground at 3200 x 2000; filters and selection apply as shown.
  function exportPng() {
    var keep = { ctx: ctx, W: W, H: H, dpr: dpr, scale: scale, tx: tx, ty: ty, view: view };
    var off = document.createElement("canvas");
    off.width = 3200; off.height = 2000;
    ctx = off.getContext("2d"); W = 1600; H = 1000; dpr = 2; view = { padTop: 36, bg: "#0b1412" };
    fit(false); draw();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.font = "500 13px " + font; ctx.fillStyle = "rgba(244, 240, 223, 0.55)"; ctx.textBaseline = "alphabetic";
    ctx.fillText(location.host + location.pathname + " · " + new Date().toISOString().slice(0, 10), 24, H - 20);
    ctx = keep.ctx; W = keep.W; H = keep.H; dpr = keep.dpr; scale = keep.scale; tx = keep.tx; ty = keep.ty; view = keep.view;
    draw();
    off.toBlob(function (b) { if (b) { save(b, base + ".png"); } }, "image/png");
  }
  // Everything on the map (not just what is shown): nodes with their degree, and links as source/target pairs.
  function exportJson() {
    var out = {
      source: location.href,
      generated: new Date().toISOString(),
      nodes: nodes.map(function (n) { return { id: n.id, kind: n.kind, label: n.label, url: n.url, meta: n.meta, description: n.desc || undefined, degree: n.deg }; }),
      links: links.map(function (l) { return { source: l.a.id, target: l.b.id }; })
    };
    save(new Blob([JSON.stringify(out, null, 2) + "\n"], { type: "application/json" }), base + ".json");
  }
  fig.querySelectorAll("[data-export]").forEach(function (b) {
    b.addEventListener("click", function () {
      if (b.getAttribute("data-export") === "png") { exportPng(); } else { exportJson(); }
      var d = b.closest("details"); if (d) { d.open = false; }
    });
  });

  // Run --------------------------------------------------------------------
  var running = false;
  function run() {
    if (running) { return; }
    running = true;
    (function frame() {
      tick(); tick();
      if (!touched) { fit(false); }
      draw();
      if (alpha > 0.004) { requestAnimationFrame(frame); } else { running = false; }
    })();
  }
  if (reduce) { while (alpha > 0.004) { tick(); } }
  if (window.ResizeObserver) { new ResizeObserver(resize).observe(canvas); } else { addEventListener("resize", resize); }
  resize();
  if (!reduce) { run(); }
  fig.classList.add("is-ready");
  if (opts.select) { setTimeout(function () { if (reduce || !running) { focusOn(opts.select); } else { var w = setInterval(function () { if (!running) { clearInterval(w); focusOn(opts.select); } }, 120); } }, 60); }
  return { focusOn: focusOn };
}

// One node's neighbourhood: the node, everything linked to it, and the links among those.
function neighbourhood(data, id) {
  var keep = {}; keep[id] = true;
  data.links.forEach(function (l) { if (!l) { return; } if (l[0] === id) { keep[l[1]] = true; } if (l[1] === id) { keep[l[0]] = true; } });
  return {
    nodes: data.nodes.filter(function (n) { return n && keep[n.id]; }),
    links: data.links.filter(function (l) { return l && keep[l[0]] && keep[l[1]]; })
  };
}

// The whole graph lives on the map page; fetch it once and reuse it for every local map.
var graphPromise = null;
function graph(src) {
  if (!graphPromise) {
    graphPromise = fetch(src, { credentials: "same-origin" }).then(function (r) { return r.text(); }).then(function (html) {
      var m = html.match(/<script[^>]*id="?map-data"?[^>]*>([\s\S]*?)<\/script>/);
      if (!m) { throw new Error("no map data"); }
      return JSON.parse(m[1]);
    });
  }
  return graphPromise;
}

function local(fig) {
  var id = fig.getAttribute("data-focus");
  return graph(fig.getAttribute("data-src")).then(function (data) {
    var sub = neighbourhood(data, id);
    if (sub.nodes.length < 2) { fig.classList.add("is-empty"); return null; }
    return mount(fig, sub, { focus: id, padTop: 18, allLabels: sub.nodes.length <= 28 });
  }).catch(function () { fig.classList.add("is-empty"); });
}

window.SeijakuMap = { mount: mount, local: local, neighbourhood: neighbourhood };

// The full map page.
var fig = document.querySelector("[data-map]");
var src = document.getElementById("map-data");
if (fig && src) {
  var hash = decodeURIComponent(location.hash.slice(1));
  mount(fig, JSON.parse(src.textContent), { select: hash || null });
}
// End-of-page maps load when their <details> opens (they may also be open from the start).
document.querySelectorAll("[data-localmap]").forEach(function (d) {
  var fig2 = d.querySelector("[data-focus]"), done = false;
  function go() { if (d.open && !done) { done = true; local(fig2); } }
  d.addEventListener("toggle", go); go();
});
})();
