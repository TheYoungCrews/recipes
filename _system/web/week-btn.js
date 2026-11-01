// "Add to this week" buttons: <button data-week-slug="slug" hidden>. They stay hidden unless you're signed in
// (GET /api/plan answers 401 otherwise). A tap POSTs /api/plan, which commits plans/<week>.md; the deploy rebuilds /week/.
(function () {
  // Also the /week/ "already have" checkboxes (input.have[data-have]): checking adds the item to the plan's on_hand.
  var btns = [].slice.call(document.querySelectorAll("[data-week-slug]"));
  var boxes = [].slice.call(document.querySelectorAll("input.have[data-have]"));
  if (!btns.length && !boxes.length) return;
  var queue = Promise.resolve();   // one save at a time, in click order, so quick taps never overwrite each other
  var plan = null, busy = false;
  function hdrs() { return window.KAUTH && window.KAUTH.headers ? window.KAUTH.headers() : { "content-type": "application/json" }; }
  function inPlan(s) { return !!plan && (plan.recipes.indexOf(s) >= 0 || plan.extras.indexOf(s) >= 0); }
  function paint(b) {
    var on = inPlan(b.dataset.weekSlug), short = b.hasAttribute("data-short");
    b.classList.toggle("on", on);
    b.setAttribute("aria-pressed", on ? "true" : "false");
    b.textContent = on ? (short ? "✓ this week" : "✓ On this week's list (tap to remove)") : (short ? "+ this week" : "+ Add to this week");
  }
  function say(b, t) { var m = b.parentNode.querySelector(".wkmsg"); if (m) m.textContent = t; }
  function start() {
    if (busy || plan) return; busy = true;
    fetch("/api/plan", { credentials: "same-origin", headers: hdrs() })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (p) {
        busy = false; if (!p) return; plan = p; btns.forEach(function (b) { b.hidden = false; paint(b); });
        if (boxes.length) {
          document.documentElement.classList.add("havemode");
          var m = document.querySelector(".havemsg"); if (m) m.hidden = false;
          boxes.forEach(function (x) { x.hidden = false; });
        }
      })
      .catch(function () { busy = false; });
  }
  function post(body) {
    var run = function () {
      return fetch("/api/plan", { method: "POST", credentials: "same-origin", headers: hdrs(), body: JSON.stringify(body) })
        .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, j: j }; }, function () { return { ok: false, j: {} }; }); });
    };
    var p = queue.then(run, run); queue = p.catch(function () {}); return p;
  }
  boxes.forEach(function (x) {
    x.addEventListener("change", function () {
      var li = x.closest("li"), want = x.checked, m = document.querySelector(".havemsg");
      li.classList.toggle("done", want); li.classList.toggle("undone", !want);   // struck through right away
      if (m) m.textContent = "Saving...";
      post({ action: want ? "have" : "unhave", item: x.dataset.have }).then(function (r) {
        if (!r.ok) { x.checked = !want; li.classList.toggle("done", !want); li.classList.toggle("undone", want); if (m) m.textContent = (r.j && r.j.error) || "Couldn't save. Try again."; return; }
        if (m) m.textContent = (want ? "Got it: " : "Back on the list: ") + x.dataset.have + ". The page catches up after the rebuild (about a minute).";
      }, function () { x.checked = !want; li.classList.toggle("done", !want); li.classList.toggle("undone", want); if (m) m.textContent = "Couldn't reach the kitchen. Try again."; });
    });
  });
  btns.forEach(function (b) {
    b.addEventListener("click", function (ev) {
      ev.preventDefault(); ev.stopPropagation();
      var s = b.dataset.weekSlug, action = inPlan(s) ? "remove" : "add";
      b.disabled = true; say(b, "Saving...");
      post({ slug: s, action: action })
        .then(function (x) {
          b.disabled = false;
          if (!x.ok) return say(b, x.j.error || "Couldn't save. Try again.");
          plan = x.j.plan; btns.forEach(paint);
          say(b, !x.j.changed ? "Already set." : action === "add"
            ? "Added to " + x.j.week + ". The grocery list updates in about a minute."
            : "Taken off " + x.j.week + ". The grocery list updates in about a minute.");
        })
        .catch(function () { b.disabled = false; say(b, "Couldn't reach the kitchen. Try again."); });
    });
  });
  start();
  if (window.KAUTH && window.KAUTH.onSignedIn) window.KAUTH.onSignedIn.push(start);
})();
