// Split-flap headline: the homepage's "machine room." rolls over to other places, Solari-board style.
// Each character sits on its own flap; on a change the flaps spin through a few glyphs left to right
// and settle on the new word. The h1 keeps its first wording for screen readers and search; visitors
// with reduced motion see it static. No dependencies.
(function () {
  "use strict";
  var el = document.querySelector("[data-flap]");
  if (!el || matchMedia("(prefers-reduced-motion: reduce)").matches) { return; }
  var words = [el.textContent.trim()].concat(el.getAttribute("data-flap").split("|").map(function (s) { return s.trim(); }).filter(Boolean));
  var GLYPHS = "abcdefghijklmnopqrstuvwxyz0123456789#%&*+=<>/";
  var HOLD = 5200, STEP = 55, STAGGER = 42;

  // Accessible text stays the original; the board itself is decoration.
  var label = document.createElement("span");
  label.className = "visually-hidden";
  label.textContent = words[0];
  var board = document.createElement("span");
  board.className = "flap-board";
  board.setAttribute("aria-hidden", "true");
  el.textContent = "";
  el.appendChild(label);
  el.appendChild(board);
  el.classList.add("is-flap");

  function cell(ch) {
    var c = document.createElement("span");
    c.className = "flap" + (ch === " " ? " flap--space" : "");
    c.textContent = ch === " " ? " " : ch;
    return c;
  }
  function setCell(c, ch) {
    c.classList.toggle("flap--space", ch === " ");
    c.textContent = ch === " " ? " " : ch;
    c.classList.remove("is-flip"); void c.offsetWidth; c.classList.add("is-flip");
  }
  words[0].split("").forEach(function (ch) { board.appendChild(cell(ch)); });

  var index = 0, busy = false;
  function roll(next) {
    busy = true;
    var target = next.split("");
    while (board.children.length < target.length) { board.appendChild(cell(" ")); }
    var cells = Array.prototype.slice.call(board.children), done = 0;
    cells.forEach(function (c, i) {
      var to = target[i] || " ", spins = 3 + Math.floor(Math.random() * 4);
      if (c.textContent === (to === " " ? " " : to)) { spins = 0; }
      setTimeout(function tick() {
        if (spins-- > 0) { setCell(c, GLYPHS.charAt(Math.floor(Math.random() * GLYPHS.length))); setTimeout(tick, STEP); return; }
        if (c.textContent !== (to === " " ? " " : to)) { setCell(c, to); }
        if (++done === cells.length) {
          while (board.children.length > target.length) { board.removeChild(board.lastChild); }
          busy = false;
        }
      }, i * STAGGER);
    });
  }
  function loop() {
    setTimeout(function () {
      if (document.hidden || busy) { return loop(); }
      index = (index + 1) % words.length;
      roll(words[index]);
      loop();
    }, HOLD);
  }
  loop();
})();
