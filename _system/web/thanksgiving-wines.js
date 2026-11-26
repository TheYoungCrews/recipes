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
  var pushed = false;
  var lockY = 0;

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
    var title = el("h2", "wmodal-title", titles[key] || key);
    title.id = "wine-modal-title";
    var x = el("button", "wmodal-x", "\u00d7");
    x.type = "button";
    x.setAttribute("aria-label", "Close");
    x.setAttribute("data-close", "");
    head.appendChild(title);
    head.appendChild(x);
    cardEl.appendChild(head);

    var body = el("div", "wmodal-body");
    var credit = [];
    if (card.producer) credit.push(card.producer);
    if (card.vintage) credit.push(String(card.vintage));
    if (credit.length) body.appendChild(el("p", "wmodal-producer", credit.join(" \u00b7 ")));
    if (card.originAndGrape) body.appendChild(section("Origin & Grape", el("p", "", card.originAndGrape)));
    if (card.arbitrage) body.appendChild(section("Arbitrage", el("p", "", card.arbitrage)));
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
      if (dl.childNodes.length) body.appendChild(section("Structure", dl));
    }
    if (card.tastingNotes) body.appendChild(section("Tasting Notes", el("p", "", card.tastingNotes)));
    if (card.similarTo) body.appendChild(section("Similar To", el("p", "", card.similarTo)));
    if (card.idealPairings) body.appendChild(section("Ideal Pairings", el("p", "", card.idealPairings)));
    if (card.service && typeof card.service === "object") {
      var bits = ["glass", "decant", "temp"].map(function (k) { return card.service[k]; }).filter(Boolean);
      if (bits.length) body.appendChild(section("Service", el("p", "", bits.join(" \u00b7 "))));
    }
    var bot = el("button", "wmodal-close-end", "Close");
    bot.type = "button";
    bot.setAttribute("data-close", "");
    body.appendChild(bot);
    cardEl.appendChild(body);
    cardEl.setAttribute("aria-labelledby", "wine-modal-title");
  }

  function lockScroll() {
    lockY = window.scrollY || window.pageYOffset || 0;
    document.body.classList.add("wine-open");
    document.documentElement.classList.add("wine-open");
    document.body.style.position = "fixed";
    document.body.style.top = "-" + lockY + "px";
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";
    document.body.style.overflow = "hidden";
  }

  function unlockScroll() {
    document.body.classList.remove("wine-open");
    document.documentElement.classList.remove("wine-open");
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.left = "";
    document.body.style.right = "";
    document.body.style.width = "";
    document.body.style.overflow = "";
    window.scrollTo(0, lockY);
  }

  function open(key, from) {
    var card = data[key];
    if (!card) return;
    lastFocus = from || document.activeElement;
    fill(key, card);
    root.hidden = false;
    root.classList.add("on");
    lockScroll();
    if (!pushed) {
      history.pushState({ thanksgivingWine: key }, "");
      pushed = true;
    }
    var body = cardEl.querySelector(".wmodal-body");
    if (body) body.scrollTop = 0;
    var x = cardEl.querySelector(".wmodal-x");
    if (x) x.focus();
    else cardEl.focus();
  }

  function close(fromPopstate) {
    if (root.hidden) return;
    root.hidden = true;
    root.classList.remove("on");
    unlockScroll();
    if (lastFocus && typeof lastFocus.focus === "function") lastFocus.focus();
    lastFocus = null;
    if (pushed && !fromPopstate) {
      pushed = false;
      history.back();
      return;
    }
    pushed = false;
  }

  document.querySelectorAll("button.wine[data-wine]").forEach(function (btn) {
    btn.addEventListener("click", function () { open(btn.getAttribute("data-wine"), btn); });
  });
  root.addEventListener("click", function (e) {
    if (e.target.closest("[data-close]")) close();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !root.hidden) {
      e.preventDefault();
      close();
    }
  });
  window.addEventListener("popstate", function () {
    if (pushed) {
      pushed = false;
      close(true);
    }
  });
})();
