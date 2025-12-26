// Color Scheme Toggle
class ThemeColorScheme {
  constructor(toggleElements) {
    this.localStorageKey = "ThemeColorScheme";
    this.currentScheme = this.getSavedScheme();
    this.systemPreferScheme = window.matchMedia("(prefers-color-scheme: dark)")
      .matches
      ? "dark"
      : "light";

    this.bindMatchMedia();
    this.dispatchEvent(document.documentElement.dataset.userColorScheme);

    // Bind click handlers to all toggle elements
    if (toggleElements) {
      toggleElements.forEach((el) => {
        if (el) this.bindClick(el);
      });
    }

    if (document.body.style.transition == "") {
      document.body.style.setProperty(
        "transition",
        "background-color .3s ease",
      );
    }
  }

  saveScheme() {
    localStorage.setItem(this.localStorageKey, this.currentScheme);
  }

  bindClick(toggleEl) {
    toggleEl.addEventListener("click", (e) => {
      // Add sparkle animation
      toggleEl.classList.add("transitioning");
      setTimeout(() => {
        toggleEl.classList.remove("transitioning");
      }, 600);

      if (this.isDark()) {
        this.currentScheme = "light";
      } else {
        this.currentScheme = "dark";
      }

      this.setBodyClass();

      if (this.currentScheme == this.systemPreferScheme) {
        this.currentScheme = "auto";
      }

      this.saveScheme();
    });
  }

  isDark() {
    return (
      this.currentScheme == "dark" ||
      (this.currentScheme == "auto" && this.systemPreferScheme == "dark")
    );
  }

  dispatchEvent(colorScheme) {
    const event = new CustomEvent("onColorSchemeChange", {
      detail: colorScheme,
    });
    window.dispatchEvent(event);
  }

  setBodyClass() {
    if (this.isDark()) {
      document.documentElement.dataset.userColorScheme = "dark";
    } else {
      document.documentElement.dataset.userColorScheme = "light";
    }

    this.dispatchEvent(document.documentElement.dataset.userColorScheme);
  }

  getSavedScheme() {
    const savedScheme = localStorage.getItem(this.localStorageKey);
    if (
      savedScheme == "light" ||
      savedScheme == "dark" ||
      savedScheme == "auto"
    ) {
      return savedScheme;
    }
    return "auto";
  }

  bindMatchMedia() {
    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", (e) => {
        if (e.matches) {
          this.systemPreferScheme = "dark";
        } else {
          this.systemPreferScheme = "light";
        }
        this.setBodyClass();
      });
  }
}

// Mobile Menu
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
    // Toggle menu on button click
    this.menuButton.addEventListener("click", () => {
      this.toggle();
    });

    // Close menu when clicking on a link
    const menuLinks = this.menuOverlay.querySelectorAll("a");
    menuLinks.forEach((link) => {
      link.addEventListener("click", () => {
        this.close();
      });
    });

    // Close menu on escape key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.isOpen) {
        this.close();
      }
    });

    // Close menu when resizing to desktop
    window.addEventListener("resize", () => {
      if (window.innerWidth >= 800 && this.isOpen) {
        this.close();
      }
    });
  }

  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
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

// Footnotes Enhancement
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

// Initialize on load
window.addEventListener("load", () => {
  setTimeout(() => {
    // Get all theme toggle buttons (desktop and mobile)
    const themeButtons = [
      document.getElementById("dark-mode-button"),
      document.getElementById("dark-mode-button-mobile"),
    ].filter(Boolean);

    new ThemeColorScheme(themeButtons);
    new MobileMenu();
    renderFootnotes();
  }, 0);
});
