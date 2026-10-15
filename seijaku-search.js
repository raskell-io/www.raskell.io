// Site search for seijaku (only loaded when config.build_search_index is true).
// The elasticlunr library and Zola's index load on first open, so pages pay nothing until then.
(function () {
  var dialog = document.getElementById("search");
  if (!dialog || typeof dialog.showModal !== "function") { return; }
  var input = dialog.querySelector("input");
  var list = dialog.querySelector(".search__results");
  var status = dialog.querySelector(".search__status");
  var index = null, loading = null;

  function load(src) {
    return new Promise(function (resolve, reject) {
      var s = document.createElement("script");
      s.src = src; s.onload = resolve; s.onerror = reject;
      document.head.appendChild(s);
    });
  }
  function ready() {
    if (index) { return Promise.resolve(index); }
    if (!loading) {
      loading = load(dialog.dataset.lib)
        .then(function () { return load(dialog.dataset.index); })
        .then(function () { index = elasticlunr.Index.load(window.searchIndex); return index; });
    }
    return loading;
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function render(q) {
    if (!q.trim()) { list.innerHTML = ""; status.textContent = ""; return; }
    var hits = index.search(q, { fields: { title: { boost: 2 }, description: { boost: 1.5 }, body: { boost: 1 } }, expand: true }).slice(0, 12);
    status.textContent = hits.length ? hits.length + (hits.length === 1 ? " result" : " results") : "Nothing found for “" + q + "”.";
    list.innerHTML = hits.map(function (h) {
      var d = index.documentStore.getDoc(h.ref);
      var desc = d.description || (d.body || "").slice(0, 160);
      return '<li><a href="' + esc(h.ref) + '"><strong>' + esc(d.title || h.ref) + "</strong><span>" + esc(desc) + "</span></a></li>";
    }).join("");
  }
  function open() {
    dialog.showModal();
    input.select();
    ready().then(function () { render(input.value); }, function () { status.textContent = "Search could not load."; });
  }
  document.querySelectorAll("[data-search-open]").forEach(function (b) {
    b.addEventListener("click", function (e) { e.preventDefault(); var d = b.closest("details"); if (d) { d.open = false; } open(); });
  });
  document.addEventListener("keydown", function (e) {
    var t = e.target.tagName;
    if (e.key === "/" && !dialog.open && t !== "INPUT" && t !== "TEXTAREA" && !e.target.isContentEditable) { e.preventDefault(); open(); }
  });
  input.addEventListener("input", function () { if (index) { render(input.value); } });
  dialog.addEventListener("click", function (e) { if (e.target === dialog) { dialog.close(); } });
})();
