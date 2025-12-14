// Add copy buttons and anchors to code blocks
document.addEventListener("DOMContentLoaded", function () {
  const codeBlocks = document.querySelectorAll(
    'pre[class*="language-"], .highlight > .chroma',
  );

  let codeBlockCounter = 0;

  codeBlocks.forEach(function (codeBlock) {
    // Skip if button already exists
    if (codeBlock.querySelector(".copy-code-button")) {
      return;
    }

    // Add unique ID for anchoring
    codeBlockCounter++;
    const codeId = `code-${codeBlockCounter}`;
    codeBlock.id = codeId;

    // Create copy button
    const button = document.createElement("button");
    button.className = "copy-code-button";
    button.type = "button";
    button.setAttribute("aria-label", "Copy code to clipboard");

    // Add icon and text
    button.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
            <span>Copy</span>
        `;

    // Add click event
    button.addEventListener("click", async function () {
      const code = codeBlock.querySelector("code");
      const text = code.innerText;

      try {
        await navigator.clipboard.writeText(text);

        // Update button state
        button.classList.add("copied");
        const span = button.querySelector("span");
        const originalText = span.textContent;
        span.textContent = "Copied!";

        // Reset after 2 seconds
        setTimeout(function () {
          button.classList.remove("copied");
          span.textContent = originalText;
        }, 2000);
      } catch (err) {
        console.error("Failed to copy code:", err);
      }
    });

    codeBlock.appendChild(button);
  });
});
