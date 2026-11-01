// "Add to this week" buttons: <button data-week-slug="slug" hidden>. They stay hidden unless you're signed in
// (GET /api/plan answers 401 otherwise). A tap POSTs /api/plan, which commits plans/<week>.md; the deploy rebuilds /week/.
(function () {
  var btns = [].slice.call(document.querySelectorAll("[data-week-slug]"));
  if (!btns.length) return;
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
      .then(function (p) { busy = false; if (!p) return; plan = p; btns.forEach(function (b) { b.hidden = false; paint(b); }); })
      .catch(function () { busy = false; });
  }
  btns.forEach(function (b) {
    b.addEventListener("click", function (ev) {
      ev.preventDefault(); ev.stopPropagation();
      var s = b.dataset.weekSlug, action = inPlan(s) ? "remove" : "add";
      b.disabled = true; say(b, "Saving...");
      fetch("/api/plan", { method: "POST", credentials: "same-origin", headers: hdrs(), body: JSON.stringify({ slug: s, action: action }) })
        .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, j: j }; }); })
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
