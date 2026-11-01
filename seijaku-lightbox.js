// Image overlay for anything marked data-lightbox="<image url>" (article covers, book covers): opens the image
// in a native <dialog>, with a zoom toggle, drag to pan when zoomed, and Escape, the close button or a click on
// the backdrop to close. data-lightbox-alt carries the description. Labels come from window.SEIJAKU_I18N.
(function () {
  var triggers = document.querySelectorAll("[data-lightbox]");
  if (!triggers.length || typeof HTMLDialogElement !== "function") return;
  var L = window.SEIJAKU_I18N || {};
  var t = function (s) { return L[s] || s; };

  var dlg = null, img, zoomBtn, stage, opener = null;

  function build() {
    dlg = document.createElement("dialog");
    dlg.className = "lightbox";
    dlg.setAttribute("aria-label", t("Image"));
    dlg.innerHTML =
      '<div class="lightbox__bar">' +
      '<button type="button" class="lightbox__btn" data-act="zoom"></button>' +
      '<button type="button" class="lightbox__btn" data-act="close" aria-label="' + t("Close") + '">' +
      '<svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 4l8 8M12 4l-8 8"/></svg></button>' +
      "</div>" +
      '<div class="lightbox__stage"><img alt="" decoding="async"></div>';
    document.body.appendChild(dlg);
    img = dlg.querySelector("img");
    stage = dlg.querySelector(".lightbox__stage");
    zoomBtn = dlg.querySelector('[data-act="zoom"]');
    dlg.querySelector('[data-act="close"]').addEventListener("click", function () { dlg.close(); });
    zoomBtn.addEventListener("click", function () { setZoom(!dlg.classList.contains("is-zoomed")); });
    img.addEventListener("dblclick", function (e) { setZoom(!dlg.classList.contains("is-zoomed"), e); });
    // A click on the backdrop (the dialog itself, outside the stage content) closes it.
    dlg.addEventListener("click", function (e) { if (e.target === dlg || e.target === stage) dlg.close(); });
    dlg.addEventListener("close", function () {
      setZoom(false);
      document.documentElement.classList.remove("has-lightbox");
      if (opener) opener.focus({ preventScroll: true });
    });
    pan();
  }

  function setZoom(on, at) {
    // Zoomed: twice the fitted width, or the image's own width if that is larger.
    if (on && !dlg.classList.contains("is-zoomed")) {
      img.style.width = Math.max(img.naturalWidth, img.clientWidth * 2) + "px";
    } else if (!on) {
      img.style.width = "";
    }
    dlg.classList.toggle("is-zoomed", on);
    zoomBtn.setAttribute("aria-pressed", on ? "true" : "false");
    zoomBtn.setAttribute("aria-label", t(on ? "Zoom out" : "Zoom in"));
    zoomBtn.innerHTML = on
      ? '<svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="7" cy="7" r="4.5"/><path d="M10.5 10.5L14 14M5 7h4"/></svg>'
      : '<svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="7" cy="7" r="4.5"/><path d="M10.5 10.5L14 14M5 7h4M7 5v4"/></svg>';
    if (on) {
      // Keep the point that was double-clicked under the pointer; otherwise centre the image.
      requestAnimationFrame(function () {
        var fx = 0.5, fy = 0.5;
        if (at && img.getBoundingClientRect) {
          var r = img.getBoundingClientRect();
          fx = (at.clientX - r.left) / r.width; fy = (at.clientY - r.top) / r.height;
        }
        stage.scrollLeft = fx * stage.scrollWidth - stage.clientWidth / 2;
        stage.scrollTop = fy * stage.scrollHeight - stage.clientHeight / 2;
      });
    }
  }

  // Drag to pan while zoomed (mouse and pen; touch already scrolls natively).
  function pan() {
    var down = null;
    stage.addEventListener("pointerdown", function (e) {
      if (!dlg.classList.contains("is-zoomed") || e.pointerType === "touch") return;
      down = { x: e.clientX, y: e.clientY, l: stage.scrollLeft, t: stage.scrollTop, moved: false };
      stage.setPointerCapture(e.pointerId);
    });
    stage.addEventListener("pointermove", function (e) {
      if (!down) return;
      var dx = e.clientX - down.x, dy = e.clientY - down.y;
      if (Math.abs(dx) + Math.abs(dy) > 3) down.moved = true;
      stage.scrollLeft = down.l - dx; stage.scrollTop = down.t - dy;
    });
    var up = function () { down = null; };
    stage.addEventListener("pointerup", up);
    stage.addEventListener("pointercancel", up);
  }

  function open(el) {
    if (!dlg) build();
    opener = el;
    img.src = el.getAttribute("data-lightbox");
    img.alt = el.getAttribute("data-lightbox-alt") || "";
    setZoom(false);
    document.documentElement.classList.add("has-lightbox");
    dlg.showModal();
  }

  triggers.forEach(function (el) {
    el.setAttribute("role", "button");
    if (!el.hasAttribute("tabindex")) el.setAttribute("tabindex", "0");
    el.setAttribute("aria-haspopup", "dialog");
    if (!el.hasAttribute("aria-label")) el.setAttribute("aria-label", t("Open image"));
    el.addEventListener("click", function (e) { e.preventDefault(); open(el); });
    el.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(el); }
    });
  });
})();
