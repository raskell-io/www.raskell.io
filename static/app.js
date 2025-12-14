// Color Scheme Toggle
class ThemeColorScheme {
  constructor(toggleEl) {
    this.localStorageKey = "ThemeColorScheme";
    this.currentScheme = this.getSavedScheme();
    this.systemPreferScheme = window.matchMedia("(prefers-color-scheme: dark)")
      .matches
      ? "dark"
      : "light";

    this.bindMatchMedia();
    this.dispatchEvent(document.documentElement.dataset.userColorScheme);

    if (toggleEl) {
      this.bindClick(toggleEl);
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

// Copy Button for Code Blocks
function renderCopyButton() {
  const codeBlocks = document.querySelectorAll("pre");

  codeBlocks.forEach((block) => {
    if (!block.querySelector(".copy-button")) {
      const button = document.createElement("button");
      button.className = "copy-button";
      button.textContent = "Copy";

      button.addEventListener("click", () => {
        const code = block.querySelector("code");
        const text = code.textContent;

        navigator.clipboard.writeText(text).then(() => {
          button.textContent = "Copied!";
          setTimeout(() => {
            button.textContent = "Copy";
          }, 2000);
        });
      });

      block.style.position = "relative";
      block.appendChild(button);
    }
  });
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
    new ThemeColorScheme(document.getElementById("dark-mode-button"));
    renderCopyButton();
    renderFootnotes();
  }, 0);
});
