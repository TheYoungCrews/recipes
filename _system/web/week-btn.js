// "Add to this week" buttons: <button data-week-slug="slug" hidden>. They stay hidden unless you're signed in
// (GET /api/plan answers 401 otherwise). A tap POSTs /api/plan, which commits plans/<week>.md; the deploy rebuilds /week/.
// On /week/, each dinner has a Remove button (<button data-week-remove>) instead of the add toggle. A tap confirms,
// takes the dish off the plan, and hides it on the page. The grocery list catches up after the rebuild.
// If you aren't signed in, a "Sign in to edit this week" link appears; cook.js provides the same Google/wallet sign-in.
(function () {
  // Also the /week/ "already have" checkboxes (input.have[data-have]): checking adds the item to the plan's on_hand.
  var rms = [].slice.call(document.querySelectorAll("[data-week-remove]"));
  var btns = [].slice.call(document.querySelectorAll("[data-week-slug]:not([data-week-remove])"));
  var boxes = [].slice.call(document.querySelectorAll("input.have[data-have]"));
  if (!btns.length && !boxes.length && !rms.length) return;
  var queue = Promise.resolve();   // one save at a time, in click order, so quick taps never overwrite each other
  var plan = null, busy = false, offered = false;
  function hdrs() { return window.KAUTH && window.KAUTH.headers ? window.KAUTH.headers() : { "content-type": "application/json" }; }
  function inPlan(s) { return !!plan && (plan.recipes.indexOf(s) >= 0 || plan.extras.indexOf(s) >= 0); }
  function paint(b) {
    var on = inPlan(b.dataset.weekSlug), short = b.hasAttribute("data-short");
    b.classList.toggle("on", on);
    b.setAttribute("aria-pressed", on ? "true" : "false");
    b.textContent = on ? (short ? "✓ What’s Cooking" : "✓ On What’s Cooking (tap to remove)") : (short ? "+ What’s Cooking" : "+ Add to What’s Cooking");
  }
  function say(b, t) { var m = b.parentNode.querySelector(".wkmsg"); if (m) m.textContent = t; }
  function editBox() { return document.querySelector(".wkedit"); }
  function sayEdit(t) {
    var box = editBox(); if (!box) return;
    box.hidden = false;
    var m = box.querySelector(".wkmsg"); if (m) m.textContent = t;
  }
  function offerSignIn() {
    var box = editBox(), btn = document.querySelector(".wksign");
    if (box) box.hidden = false;
    if (!btn || offered) return;
    offered = true;
    btn.addEventListener("click", function () {
      if (!window.KAUTH || !window.KAUTH.signIn) {
        sayEdit("Sign in on a recipe page first, then come back here.");
        return;
      }
      var slot = document.querySelector(".gsi");
      window.KAUTH.signIn(slot || btn.parentNode, sayEdit);
    });
  }
  function signedInUi() {
    var btn = document.querySelector(".wksign"); if (btn) btn.hidden = true;
    var slot = document.querySelector(".gsi"); if (slot) slot.innerHTML = "";
    var box = editBox(), m = box && box.querySelector(".wkmsg");
    if (m) m.textContent = "";
    if (box) box.hidden = true;
  }
  function start() {
    if (busy || plan) return; busy = true;
    fetch("/api/plan", { credentials: "same-origin", headers: hdrs() })
      .then(function (r) {
        if (r && r.ok) return r.json();
        if (r && r.status === 401 && (rms.length || boxes.length)) offerSignIn();
        return null;
      })
      .then(function (p) {
        busy = false; if (!p) return; plan = p;
        signedInUi();
        btns.forEach(function (b) { b.hidden = false; paint(b); });
        rms.forEach(function (b) { b.hidden = false; });
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
        if (m) m.textContent = (want ? "Got it: " : "Back on the list: ") + x.dataset.have + (want ? ". Added to the inventory." : ". Taken off the inventory.") + " The page catches up after the rebuild (about a minute).";
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
  rms.forEach(function (b) {
    b.addEventListener("click", function (ev) {
      ev.preventDefault(); ev.stopPropagation();
      var s = b.dataset.weekSlug, title = b.dataset.title || "this recipe";
      if (!confirm("Take " + title + " off this week?")) return;
      b.disabled = true; say(b, "Removing...");
      post({ slug: s, action: "remove" })
        .then(function (x) {
          if (!x.ok) { b.disabled = false; return say(b, x.j.error || "Couldn't save. Try again."); }
          if (x.j.plan) plan = x.j.plan;
          var li = b.closest("li"); if (li) li.hidden = true;
          sayEdit((x.j.changed === false ? "Already off this week." : "Taken off this week.") + " The grocery list updates in about a minute.");
        })
        .catch(function () { b.disabled = false; say(b, "Couldn't reach the kitchen. Try again."); });
    });
  });
  start();
  if (window.KAUTH && window.KAUTH.onSignedIn) window.KAUTH.onSignedIn.push(start);
})();
