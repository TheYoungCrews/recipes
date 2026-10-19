// /add page: paste one or many recipes (signed-in cooks only). Split preview, then POST /api/add.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const ta = $("#paste"), preview = $("#preview"), countEl = $("#count"), listEl = $("#titles");
  const save = $("#save"), msg = $("#msg"), gate = $("#gate"), form = $("#form");
  const say = (t, ok) => { msg.textContent = t || ""; msg.className = "addmsg" + (ok ? " ok" : ""); };

  // Same split rules as the server (functions/_lib/paste.js), kept small for preview.
  const DASH = /^(?:-{3,}|_{3,}|\*{3,})\s*$/;
  const TITLE_LINE = /^(?:title\s*:\s*|#{1,3}\s+|recipe\s*:\s*)(.+?)\s*$/i;
  function titleFrom(chunk) {
    const t = String(chunk || "").trim();
    const fm = /^title:\s*(.+)$/im.exec(t);
    if (fm) return clean(fm[1]);
    for (const line of t.split(/\r?\n/).slice(0, 12)) {
      const m = TITLE_LINE.exec(line.trim());
      if (m) return clean(m[1]);
    }
    const first = t.split(/\r?\n/).map(l => l.trim()).find(l => l && !l.startsWith("---"));
    return clean(first || "Untitled").slice(0, 80);
  }
  function clean(s) { return String(s || "").replace(/^#+\s*/, "").replace(/^["'`]+|["'`]+$/g, "").replace(/\s+/g, " ").trim() || "Untitled"; }
  function splitRecipes(text) {
    const raw = String(text || "").replace(/^\uFEFF/, "").trim();
    if (!raw) return [];
    const lines = raw.split(/\r?\n/);
    const byDash = splitOnDashes(lines);
    if (byDash.length > 1) return byDash;
    const byHead = splitOnHeadings(lines);
    if (byHead.length > 1) return byHead;
    return [raw];
  }
  function splitOnDashes(lines) {
    const chunks = []; let buf = [], inFm = false, sawFmClose = false;
    const flush = () => { const t = buf.join("\n").trim(); if (t) chunks.push(t); buf = []; inFm = false; sawFmClose = false; };
    for (const line of lines) {
      if (DASH.test(line.trim())) {
        if (!inFm && !sawFmClose && buf.every(l => !l.trim())) { inFm = true; buf.push(line); continue; }
        if (inFm && !sawFmClose) { inFm = false; sawFmClose = true; buf.push(line); continue; }
        flush(); continue;
      }
      buf.push(line);
    }
    flush(); return chunks;
  }
  function splitOnHeadings(lines) {
    const starts = [];
    for (let i = 0; i < lines.length; i++) {
      const t = lines[i].trim();
      if (/^#{1,2}\s+\S/.test(t) || /^title\s*:\s*\S/i.test(t) || /^recipe\s*:\s*\S/i.test(t)) starts.push(i);
    }
    if (starts.length < 2) return [];
    const kept = [starts[0]];
    for (const i of starts.slice(1)) if (i - kept[kept.length - 1] >= 3) kept.push(i);
    if (kept.length < 2) return [];
    return kept.map((a, k) => lines.slice(a, k + 1 < kept.length ? kept[k + 1] : lines.length).join("\n").trim()).filter(Boolean);
  }

  function refresh() {
    const chunks = splitRecipes(ta.value);
    const titles = chunks.map(titleFrom);
    if (!titles.length) { preview.hidden = true; save.disabled = true; return; }
    preview.hidden = false;
    countEl.textContent = titles.length === 1 ? "Found 1 recipe" : `Found ${titles.length} recipes`;
    listEl.innerHTML = titles.map(t => `<li>${t.replace(/[<&]/g, c => ({ "<": "&lt;", "&": "&amp;" }[c]))}</li>`).join("");
    save.disabled = false;
  }
  ta.addEventListener("input", refresh);

  async function ensureSignedIn() {
    if (window.KAUTH && await window.KAUTH.signedIn()) return true;
    gate.hidden = false; form.hidden = true;
    say("Sign in so we know it's you.");
    await window.KAUTH.signIn($(".gsi", gate), t => say(t));
    return false;
  }

  window.KAUTH.onSignedIn.push(() => { gate.hidden = true; form.hidden = false; say(""); refresh(); });

  (async () => {
    if (await window.KAUTH.signedIn()) { gate.hidden = true; form.hidden = false; }
    else { gate.hidden = false; form.hidden = true; }
  })();

  $("#signin").addEventListener("click", () => ensureSignedIn());

  form.addEventListener("submit", async e => {
    e.preventDefault();
    if (!(await window.KAUTH.signedIn())) return ensureSignedIn();
    const text = ta.value;
    if (!text.trim()) return say("Paste a recipe first.");
    save.disabled = true; say("Saving…");
    const r = await fetch("/api/add", {
      method: "POST", credentials: "same-origin",
      headers: window.KAUTH.headers(),
      body: JSON.stringify({ text }),
    }).catch(() => null);
    const j = r ? await r.json().catch(() => ({})) : {};
    if (r && r.status === 401) {
      sessionStorage.removeItem("gid"); save.disabled = false;
      return ensureSignedIn();
    }
    if (!r || !r.ok) { save.disabled = false; return say(j.error || "Couldn't save. Try again?"); }
    const names = (j.titles || []).map(t => `• ${t}`).join("\n");
    say(`Saved ${j.count} for ${j.who === "anna" ? "Anna" : "Crews"}.\n${names}\n\nThese get filed onto the site within the hour.`, true);
    ta.value = ""; refresh(); save.disabled = true;
  });
})();
