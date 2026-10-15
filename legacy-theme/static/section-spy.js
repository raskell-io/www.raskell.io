// Section spy — highlights the current section with a left accent bar
document.addEventListener("DOMContentLoaded", function () {
  var container = document.querySelector(".page-content");
  if (!container) return;

  var headings = Array.from(container.querySelectorAll("h2, h3"));
  if (headings.length === 0) return;

  // Wrap each heading + its following content in a .section-spy div
  var sections = [];
  headings.forEach(function (heading) {
    var wrapper = document.createElement("div");
    wrapper.className = "section-spy";

    // Insert wrapper before the heading
    heading.parentNode.insertBefore(wrapper, heading);

    // Move the heading into the wrapper
    wrapper.appendChild(heading);

    // Move all following siblings until the next h2/h3 or hr
    while (wrapper.nextSibling) {
      var next = wrapper.nextSibling;
      var tag = next.nodeName && next.nodeName.toLowerCase();
      if (tag === "h2" || tag === "h3" || tag === "hr") break;
      // Skip the divs we already created
      if (next.classList && next.classList.contains("section-spy")) break;
      wrapper.appendChild(next);
    }

    sections.push(wrapper);
  });

  // Remove <hr> separators since the sections now provide visual structure
  Array.from(container.querySelectorAll("hr")).forEach(function (hr) {
    hr.remove();
  });

  var active = null;
  var offset = Math.round(window.innerHeight * 0.45);

  function update() {
    var current = null;

    for (var i = 0; i < sections.length; i++) {
      if (sections[i].getBoundingClientRect().top <= offset) {
        current = sections[i];
      } else {
        break;
      }
    }

    if (!current) current = sections[0];

    if (current !== active) {
      if (active) active.classList.remove("section-spy--active");
      current.classList.add("section-spy--active");
      active = current;
    }
  }

  window.addEventListener("scroll", update, { passive: true });
  update();
});
