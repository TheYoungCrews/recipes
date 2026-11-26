// Wine Scout popups on the Thanksgiving drinks page. Vanilla JS, no dependencies.
(function () {
  var root = document.getElementById("wine-modal");
  if (!root) return;
  var cardEl = root.querySelector(".wmodal-card");
  var data = {};
  var tag = document.getElementById("wine-cards");
  if (tag) {
    try { data = JSON.parse(tag.textContent); } catch (err) { data = {}; }
  }
  var titles = {
    "Sonoma Zinfandel": "Sonoma Zinfandel",
    "Chateauneuf-du-Pape": "Châteauneuf-du-Pape",
    "Napa Sauvignon Blanc": "Napa Sauvignon Blanc",
    "Sauternes": "Sauternes"
  };
  var lastFocus = null;

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null && text !== "") n.textContent = text;
    return n;
  }

  function section(label, bodyNode) {
    var wrap = el("section", "wmodal-sec");
    wrap.appendChild(el("h3", "wmodal-lbl", label));
    wrap.appendChild(bodyNode);
    return wrap;
  }

  function fill(key, card) {
    cardEl.replaceChildren();
    var head = el("div", "wmodal-head");
    var close = el("button", "wmodal-close", "Close");
    close.type = "button";
    close.setAttribute("aria-label", "Close");
    var title = el("h2", "wmodal-title", titles[key] || key);
    title.id = "wine-modal-title";
    head.appendChild(title);
    head.appendChild(close);
    cardEl.appendChild(head);
    var credit = [];
    if (card.producer) credit.push(card.producer);
    if (card.vintage) credit.push(String(card.vintage));
    if (credit.length) cardEl.appendChild(el("p", "wmodal-producer", credit.join(" · ")));
    if (card.originAndGrape) cardEl.appendChild(section("Origin & Grape", el("p", "", card.originAndGrape)));
    if (card.arbitrage) cardEl.appendChild(section("Arbitrage", el("p", "", card.arbitrage)));
    if (card.structure && typeof card.structure === "object") {
      var dl = el("dl", "wmodal-stats");
      ["body", "dryness", "tannin", "acidity"].forEach(function (k) {
        if (!card.structure[k]) return;
        var row = el("div", "wmodal-stat");
        var lab = k.charAt(0).toUpperCase() + k.slice(1);
        row.appendChild(el("dt", "", lab));
        row.appendChild(el("dd", "", card.structure[k]));
        dl.appendChild(row);
      });
      if (dl.childNodes.length) cardEl.appendChild(section("Structure", dl));
    }
    if (card.tastingNotes) cardEl.appendChild(section("Tasting Notes", el("p", "", card.tastingNotes)));
    if (card.similarTo) cardEl.appendChild(section("Similar To", el("p", "", card.similarTo)));
    if (card.idealPairings) cardEl.appendChild(section("Ideal Pairings", el("p", "", card.idealPairings)));
    if (card.service && typeof card.service === "object") {
      var bits = ["glass", "decant", "temp"].map(function (k) { return card.service[k]; }).filter(Boolean);
      if (bits.length) cardEl.appendChild(section("Service", el("p", "", bits.join(" · "))));
    }
    cardEl.setAttribute("aria-labelledby", "wine-modal-title");
  }

  function open(key, from) {
    var card = data[key];
    if (!card) return;
    lastFocus = from || document.activeElement;
    fill(key, card);
    root.hidden = false;
    root.classList.add("on");
    document.body.classList.add("wine-open");
    var close = cardEl.querySelector(".wmodal-close");
    if (close) close.focus();
    else cardEl.focus();
  }

  function close() {
    if (root.hidden) return;
    root.hidden = true;
    root.classList.remove("on");
    document.body.classList.remove("wine-open");
    if (lastFocus && typeof lastFocus.focus === "function") lastFocus.focus();
    lastFocus = null;
  }

  document.querySelectorAll("button.wine[data-wine]").forEach(function (btn) {
    btn.addEventListener("click", function () { open(btn.getAttribute("data-wine"), btn); });
  });
  root.addEventListener("click", function (e) {
    if (e.target.closest("[data-close]") || e.target.closest(".wmodal-close")) close();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !root.hidden) {
      e.preventDefault();
      close();
    }
  });
})();
