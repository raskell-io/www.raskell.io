// =============================================================================
// Link Preview — External link tooltips with metadata
// =============================================================================

(function () {
  'use strict';

  var SITE_HOST = window.location.hostname;
  var HOVER_DELAY = 400;
  var HIDE_DELAY = 250;

  var metadata = null;
  var metadataLoaded = false;
  var activeLink = null;
  var hoverTimer = null;
  var hideTimer = null;
  var previewEl = null;
  var overlayEl = null;
  var MOBILE_BREAKPOINT = 800;

  function isMobile() {
    return window.innerWidth < MOBILE_BREAKPOINT ||
      !window.matchMedia('(hover: hover)').matches;
  }

  // ---- Metadata ----

  function loadMetadata() {
    if (metadataLoaded) return Promise.resolve(metadata);
    metadataLoaded = true;
    return fetch('/link-previews.json')
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) { metadata = d; return d; })
      .catch(function () { metadata = null; return null; });
  }

  function getMetadata(url) {
    if (!metadata) return null;
    var normalized = url.replace(/\/$/, '');
    return metadata[url] || metadata[normalized] || metadata[normalized + '/'] || null;
  }

  function getDomain(url) {
    try { return new URL(url).hostname.replace(/^www\./, ''); }
    catch (e) { return url; }
  }

  // ---- Escaping ----

  function esc(str) {
    var d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }

  // ---- Preview Element ----

  function ensureElements() {
    if (previewEl) return;

    previewEl = document.createElement('div');
    previewEl.className = 'link-preview';
    previewEl.setAttribute('role', 'tooltip');
    previewEl.hidden = true;
    document.body.appendChild(previewEl);

    overlayEl = document.createElement('div');
    overlayEl.className = 'link-preview-overlay';
    overlayEl.hidden = true;
    overlayEl.addEventListener('click', hidePreview);
    document.body.appendChild(overlayEl);

    previewEl.addEventListener('mouseenter', function () { clearTimeout(hideTimer); });
    previewEl.addEventListener('mouseleave', function () { scheduleHide(); });
  }

  function renderPreview(link, meta) {
    var url = link.href;
    var domain = getDomain(url);
    var title = esc(meta && meta.title ? meta.title : link.textContent.trim());
    var description = meta && meta.description ? esc(meta.description) : '';
    var image = meta && meta.image ? meta.image : '';

    var html = '';

    if (image) {
      html += '<div class="link-preview__image"><img src="' + esc(image) + '" alt="" loading="lazy" /></div>';
    }

    html += '<div class="link-preview__body">';
    html += '<div class="link-preview__domain">' + esc(domain) + '</div>';
    html += '<div class="link-preview__title">' + title + '</div>';
    if (description) {
      html += '<div class="link-preview__desc">' + description + '</div>';
    }
    html += '</div>';

    html += '<a class="link-preview__visit" href="' + esc(url) + '" target="_blank" rel="noopener noreferrer">';
    html += 'Visit <span class="link-preview__arrow">&#8599;</span></a>';

    html += '<button class="link-preview__close" aria-label="Close preview">&times;</button>';

    previewEl.innerHTML = html;

    previewEl.querySelector('.link-preview__close').addEventListener('click', function (e) {
      e.stopPropagation();
      hidePreview();
    });
  }

  // ---- Positioning (Desktop) ----

  function positionPreview(link) {
    var rect = link.getBoundingClientRect();
    var pw = previewEl.offsetWidth;
    var ph = previewEl.offsetHeight;
    var scrollY = window.scrollY;
    var scrollX = window.scrollX;
    var gap = 10;

    // Prefer above the link
    var top = rect.top + scrollY - ph - gap;
    var above = true;

    if (top - scrollY < gap) {
      top = rect.bottom + scrollY + gap;
      above = false;
    }

    // Center horizontally on the link, clamped to viewport
    var left = rect.left + scrollX + (rect.width / 2) - (pw / 2);
    left = Math.max(scrollX + gap, Math.min(left, scrollX + window.innerWidth - pw - gap));

    previewEl.style.top = top + 'px';
    previewEl.style.left = left + 'px';

    previewEl.classList.toggle('link-preview--above', above);
    previewEl.classList.toggle('link-preview--below', !above);
  }

  // ---- Show / Hide ----

  function showPreview(link) {
    if (activeLink === link) return;

    ensureElements();

    loadMetadata().then(function () {
      var meta = getMetadata(link.href);
      activeLink = link;
      renderPreview(link, meta);

      if (isMobile()) {
        // Mobile: bottom sheet
        previewEl.classList.add('link-preview--mobile');
        previewEl.classList.remove('link-preview--above', 'link-preview--below');
        previewEl.style.top = '';
        previewEl.style.left = '';
        overlayEl.hidden = false;
        previewEl.hidden = false;
        document.body.style.overflow = 'hidden';
        requestAnimationFrame(function () {
          overlayEl.classList.add('active');
          previewEl.classList.add('active');
        });
      } else {
        // Desktop: positioned tooltip
        previewEl.classList.remove('link-preview--mobile');
        previewEl.hidden = false;
        requestAnimationFrame(function () {
          positionPreview(link);
          previewEl.classList.add('active');
        });
      }
    });
  }

  function hidePreview() {
    clearTimeout(hoverTimer);
    clearTimeout(hideTimer);
    if (!previewEl || !activeLink) return;

    previewEl.classList.remove('active');
    overlayEl.classList.remove('active');

    setTimeout(function () {
      previewEl.hidden = true;
      overlayEl.hidden = true;
      document.body.style.overflow = '';
      activeLink = null;
    }, 200);
  }

  function scheduleHide() {
    clearTimeout(hideTimer);
    hideTimer = setTimeout(hidePreview, HIDE_DELAY);
  }

  // ---- Link Detection ----

  function isExternal(link) {
    try {
      var u = new URL(link.href);
      return u.hostname !== SITE_HOST && u.protocol.indexOf('http') === 0;
    } catch (e) { return false; }
  }

  function shouldSkip(link) {
    return link.closest('h1, h2, h3, h4, h5, h6, pre, code, nav, .link-preview, .navbar, .footer');
  }

  function setupLink(link) {
    if (!isExternal(link) || shouldSkip(link)) return;
    // Skip image-only links
    if (link.children.length === 1 && link.children[0].tagName === 'IMG') return;

    link.classList.add('external-link');

    // Click: on mobile/narrow viewport, intercept and show preview first
    link.addEventListener('click', function (e) {
      if (isMobile()) {
        if (activeLink === link) return; // second tap navigates
        e.preventDefault();
        showPreview(link);
      }
    });

    // Hover: only effective on desktop with pointer device
    link.addEventListener('mouseenter', function () {
      if (isMobile()) return;
      clearTimeout(hideTimer);
      clearTimeout(hoverTimer);
      hoverTimer = setTimeout(function () { showPreview(link); }, HOVER_DELAY);
    });
    link.addEventListener('mouseleave', function () {
      if (isMobile()) return;
      clearTimeout(hoverTimer);
      scheduleHide();
    });

    // Keyboard
    link.addEventListener('focus', function () { showPreview(link); });
    link.addEventListener('blur', function () { scheduleHide(); });
  }

  // ---- Global Events ----

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && activeLink) hidePreview();
  });

  var ticking = false;
  window.addEventListener('scroll', function () {
    if (isMobile() || ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      if (activeLink && previewEl && !previewEl.hidden) positionPreview(activeLink);
      ticking = false;
    });
  }, { passive: true });
  window.addEventListener('resize', hidePreview, { passive: true });

  // ---- Init ----

  function init() {
    var links = document.querySelectorAll('#main-content a[href]');
    for (var i = 0; i < links.length; i++) setupLink(links[i]);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
