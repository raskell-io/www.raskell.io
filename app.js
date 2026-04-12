// =============================================================================
// Theme Toggle - 3-way (light/dark/auto)
// =============================================================================

(function() {
  'use strict';

  const STORAGE_KEY = 'ThemeColorScheme';
  const THEMES = ['light', 'dark', 'auto'];

  function getStoredTheme() {
    try {
      return localStorage.getItem(STORAGE_KEY) || 'auto';
    } catch (e) {
      return 'auto';
    }
  }

  function getSystemTheme() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function getEffectiveTheme(stored) {
    if (stored === 'auto') {
      return getSystemTheme();
    }
    return stored;
  }

  function applyTheme(theme) {
    const effective = getEffectiveTheme(theme);
    document.documentElement.setAttribute('data-user-color-scheme', effective);
    document.documentElement.setAttribute('data-theme-setting', theme);

    // Dispatch event for other components
    const event = new CustomEvent('onColorSchemeChange', { detail: effective });
    window.dispatchEvent(event);
  }

  function saveTheme(theme) {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch (e) {
      // Storage not available
    }
  }

  function cycleTheme() {
    const current = getStoredTheme();
    const currentIndex = THEMES.indexOf(current);
    const nextIndex = (currentIndex + 1) % THEMES.length;
    return THEMES[nextIndex];
  }

  function initThemeToggle() {
    // Apply initial theme immediately
    const stored = getStoredTheme();
    applyTheme(stored);

    // Set up toggle buttons
    // Set initial aria-label with current theme
    const initialTheme = getStoredTheme();
    const themeLabels = { light: 'Light theme active, switch to dark', dark: 'Dark theme active, switch to auto', auto: 'Auto theme active, switch to light' };
    document.querySelectorAll('.theme-toggle').forEach(button => {
      button.setAttribute('aria-label', themeLabels[initialTheme] || 'Toggle color theme');

      button.addEventListener('click', (e) => {
        e.preventDefault();

        // Cycle to next theme
        const newTheme = cycleTheme();
        saveTheme(newTheme);
        applyTheme(newTheme);

        // Update aria-label with new state
        button.setAttribute('aria-label', themeLabels[newTheme] || 'Toggle color theme');

        // Add animation class
        button.classList.add('animating');
        setTimeout(() => button.classList.remove('animating'), 500);
      });
    });

    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      const stored = getStoredTheme();
      if (stored === 'auto') {
        applyTheme('auto');
      }
    });
  }

  // Apply theme immediately (before DOM ready) to prevent flash
  applyTheme(getStoredTheme());

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initThemeToggle);
  } else {
    initThemeToggle();
  }
})();

// =============================================================================
// Mobile Menu
// =============================================================================

class MobileMenu {
  constructor() {
    this.menuButton = document.getElementById("mobile-menu-button");
    this.menuOverlay = document.getElementById("mobile-menu-overlay");
    this.isOpen = false;

    if (this.menuButton && this.menuOverlay) {
      this.init();
    }
  }

  init() {
    this.menuButton.addEventListener("click", () => this.toggle());

    const menuLinks = this.menuOverlay.querySelectorAll("a");
    menuLinks.forEach((link) => {
      link.addEventListener("click", () => this.close());
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.isOpen) {
        this.close();
      }
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth >= 800 && this.isOpen) {
        this.close();
      }
    });
  }

  toggle() {
    this.isOpen ? this.close() : this.open();
  }

  open() {
    this.isOpen = true;
    this.menuButton.setAttribute("aria-expanded", "true");
    this.menuButton.setAttribute("aria-label", "Close menu");
    this.menuOverlay.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  close() {
    this.isOpen = false;
    this.menuButton.setAttribute("aria-expanded", "false");
    this.menuButton.setAttribute("aria-label", "Open menu");
    this.menuOverlay.classList.remove("active");
    document.body.style.overflow = "";
  }
}

// =============================================================================
// Footnotes Enhancement
// =============================================================================

function renderFootnotes() {
  const footnoteRefs = document.querySelectorAll('sup[id^="fnref"]');

  footnoteRefs.forEach((ref) => {
    const link = ref.querySelector("a");
    if (link) {
      const footnoteId = link.getAttribute("href").substring(1);
      const footnote = document.getElementById(footnoteId);

      if (footnote) {
        ref.style.cursor = "pointer";
        ref.title = footnote.textContent;
      }
    }
  });
}

// =============================================================================
// Scroll-aware Navbar (hide on scroll down, show on scroll up)
// =============================================================================

class ScrollNavbar {
  constructor() {
    this.navbar = document.querySelector('.navbar');
    if (!this.navbar) return;

    this.navbarHeight = this.navbar.offsetHeight;
    this.lastScrollY = window.scrollY;
    this.translateY = 0;
    this.revealing = false;
    this.ticking = false;
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Re-measure after layout settles (safe area insets may load late)
    requestAnimationFrame(() => {
      this.navbarHeight = this.navbar.offsetHeight;
    });

    window.addEventListener('scroll', () => this.onScroll(), { passive: true });
    window.addEventListener('resize', () => {
      this.navbarHeight = this.navbar.offsetHeight;
    });
  }

  onScroll() {
    if (!this.ticking) {
      requestAnimationFrame(() => {
        this.update();
        this.ticking = false;
      });
      this.ticking = true;
    }
  }

  update() {
    const currentY = window.scrollY;
    const delta = currentY - this.lastScrollY;

    if (delta > 0) {
      // Scrolling down — push navbar up 1:1 with scroll (no transition)
      this.revealing = false;
      this.translateY = Math.max(-this.navbarHeight, this.translateY - delta);
      this.navbar.style.transition = 'none';
      this.navbar.style.transform = `translateY(${this.translateY}px)`;
    } else if (delta < 0 && currentY > this.navbarHeight) {
      // Scrolling up, past the navbar — smooth slide in
      if (!this.revealing) {
        this.revealing = true;
        this.navbar.style.transition = this.reducedMotion
          ? 'none'
          : 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)';
      }
      this.translateY = 0;
      this.navbar.style.transform = 'translateY(0)';
    } else if (currentY <= this.navbarHeight) {
      // At the top — reset
      this.revealing = false;
      this.translateY = 0;
      this.navbar.style.transition = 'none';
      this.navbar.style.transform = 'translateY(0)';
    }

    // Background when navbar is visible and page is scrolled
    this.navbar.classList.toggle('navbar--scrolled', this.translateY === 0 && currentY > 20);

    this.lastScrollY = currentY;
  }
}

// Initialize on load
window.addEventListener("load", () => {
  setTimeout(() => {
    new MobileMenu();
    new ScrollNavbar();
    renderFootnotes();
  }, 0);
});
