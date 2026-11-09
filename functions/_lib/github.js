// One atomic commit (recipe edit + optional photo) via the GitHub git data API.
import * as P from "./plan.js";
import { applyCook, photoName } from "./recipe.js";
import { proposeRemovals, applySelectedRemovals, applyAdd, applyExactRemove } from "./inventory.js";
const enc = s => btoa(unescape(encodeURIComponent(s)));
const dec = b => decodeURIComponent(escape(atob(b.replace(/\n/g, ""))));
async function readContent(api, path, ref) {
  try { return dec((await api(`/contents/${path}?ref=${ref}`)).content); }
  catch (e) { if (e.status !== 404) throw e; return null; }
}

export async function commitCook({ token, repo = "TheYoungCrews/recipes", branch = "main", slug, who, date, rating, note, photoB64, remove, fetchFn = fetch }) {
  const api = async (path, init = {}) => {
    const r = await fetchFn(`https://api.github.com/repos/${repo}${path}`, { ...init, headers: {
      authorization: `Bearer ${token}`, accept: "application/vnd.github+json", "user-agent": "blind-tiger-cook", "content-type": "application/json" } });
    if (!r.ok) { const e = new Error(`github ${r.status} ${path}`); e.status = r.status; throw e; }
    return r.json();
  };
  for (let attempt = 0; attempt < 3; attempt++) {
    const ref = await api(`/git/ref/heads/${branch}`);
    const head = ref.object.sha;
    const commit = await api(`/git/commits/${head}`);
    let dir = null, file = null;
    for (const d of ["recipes", "cocktails"]) {
      try { file = await api(`/contents/${d}/${slug}.md?ref=${head}`); dir = d; break; } catch (e) { if (e.status !== 404) throw e; }
    }
    if (!file) { const e = new Error("unknown recipe"); e.status = 404; throw e; }
    const tree = [];
    let photoRel = null;
    if (photoB64) {
      let existing = new Set();
      try { existing = new Set((await api(`/contents/${dir}/photos?ref=${head}`)).map(f => f.name)); } catch (e) { if (e.status !== 404) throw e; }
      const name = photoName(slug, date, existing);
      const blob = await api(`/git/blobs`, { method: "POST", body: JSON.stringify({ content: photoB64, encoding: "base64" }) });
      tree.push({ path: `${dir}/photos/${name}`, mode: "100644", type: "blob", sha: blob.sha });
      photoRel = `photos/${name}`;
    }
    const recipeMd = dec(file.content);
    const md = applyCook(recipeMd, { date, who, rating, note, photo: photoRel });
    tree.push({ path: `${dir}/${slug}.md`, mode: "100644", type: "blob", content: md });
    let inventory = { removed: [], subtracted: [] };
    const invMd = await readContent(api, "kitchen/inventory.md", head);
    const staplesMd = (await readContent(api, "kitchen/staples.md", head)) || "";
    if (invMd != null) {
      const proposed = proposeRemovals(invMd, recipeMd, staplesMd);
      const applied = applySelectedRemovals(invMd, proposed, remove);
      inventory = { removed: applied.removed, subtracted: applied.subtracted };
      if (applied.changed) tree.push({ path: "kitchen/inventory.md", mode: "100644", type: "blob", content: applied.md });
    }
    const t = await api(`/git/trees`, { method: "POST", body: JSON.stringify({ base_tree: commit.tree.sha, tree }) });
    let msg = `file: made ${slug} (${who} via site${rating != null ? `, ${rating}/5` : ""})`;
    if (inventory.removed.length || inventory.subtracted.length) {
      const bits = inventory.removed.concat(inventory.subtracted.map(s => `${s.name} (${s.left} left)`));
      msg += `; inventory: used ${bits.join(", ")}`;
    }
    const c = await api(`/git/commits`, { method: "POST", body: JSON.stringify({ message: msg, tree: t.sha, parents: [head] }) });
    try { await api(`/git/refs/heads/${branch}`, { method: "PATCH", body: JSON.stringify({ sha: c.sha, force: false }) }); return { sha: c.sha, photo: photoRel, path: `${dir}/${slug}.md`, inventory }; }
    catch (e) { if (e.status !== 422 && e.status !== 409) throw e; }  // someone pushed in between: retry
  }
  throw new Error("could not commit (busy), try again");
}

/** Create-only batch of inbox/*.md files in one commit. Never touches paths outside inbox/. */
export async function commitInboxBatch({ token, repo = "TheYoungCrews/recipes", branch = "main", files, message, fetchFn = fetch }) {
  if (!files || !files.length) throw new Error("no files");
  for (const f of files) {
    if (!/^inbox\/[a-z0-9._-]+\.md$/i.test(f.path) || f.path.includes("..")) {
      const e = new Error("bad inbox path"); e.status = 400; throw e;
    }
  }
  const api = async (path, init = {}) => {
    const r = await fetchFn(`https://api.github.com/repos/${repo}${path}`, { ...init, headers: {
      authorization: `Bearer ${token}`, accept: "application/vnd.github+json", "user-agent": "blind-tiger-paste", "content-type": "application/json" } });
    if (!r.ok) { const e = new Error(`github ${r.status} ${path}`); e.status = r.status; throw e; }
    if (r.status === 204) return null;
    const t = await r.text();
    return t ? JSON.parse(t) : null;
  };
  for (let attempt = 0; attempt < 3; attempt++) {
    const ref = await api(`/git/ref/heads/${branch}`);
    const head = ref.object.sha;
    const commit = await api(`/git/commits/${head}`);
    let existing = new Set();
    try {
      const listing = await api(`/contents/inbox?ref=${head}`);
      if (Array.isArray(listing)) existing = new Set(listing.map(f => `inbox/${f.name}`));
    } catch (e) { if (e.status !== 404) throw e; }
    const { uniquePaths } = await import("./paste.js");
    const unique = uniquePaths(files, existing);
    const tree = unique.map(f => ({ path: f.path, mode: "100644", type: "blob", content: f.content }));
    const t = await api(`/git/trees`, { method: "POST", body: JSON.stringify({ base_tree: commit.tree.sha, tree }) });
    const c = await api(`/git/commits`, { method: "POST", body: JSON.stringify({ message, tree: t.sha, parents: [head] }) });
    try {
      await api(`/git/refs/heads/${branch}`, { method: "PATCH", body: JSON.stringify({ sha: c.sha, force: false }) });
      return { sha: c.sha, paths: unique.map(f => f.path), files: unique };
    } catch (e) { if (e.status !== 422 && e.status !== 409) throw e; }
  }
  throw new Error("could not commit (busy), try again");
}

/** Add or remove one recipe in the current week's plan file (plans/YYYY-Www.md), one commit. have/unhave also update kitchen/inventory.md. */
export async function commitPlanEdit({ token, repo = "TheYoungCrews/recipes", branch = "main", slug, item, action, as, night, who, via = "site", today, fetchFn = fetch }) {
  const haveMode = action === "have" || action === "unhave";

  const api = async (path, init = {}) => {
    const r = await fetchFn(`https://api.github.com/repos/${repo}${path}`, { ...init, headers: {
      authorization: `Bearer ${token}`, accept: "application/vnd.github+json", "user-agent": "blind-tiger-plan", "content-type": "application/json" } });
    if (!r.ok) { const e = new Error(`github ${r.status} ${path}`); e.status = r.status; throw e; }
    return r.json();
  };
  for (let attempt = 0; attempt < 6; attempt++) {
    if (attempt) await new Promise(r => setTimeout(r, 150 * attempt + Math.floor(Math.random() * 200)));   // someone else committed first: re-read and retry
    const head = (await api(`/git/ref/heads/${branch}`)).object.sha;
    const commit = await api(`/git/commits/${head}`);
    let recipe = null;
    if (haveMode) {
      let names = [];
      try { names = (await api(`/contents/plans?ref=${head}`)).map(f => f.name); } catch (e) { if (e.status !== 404) throw e; }
      const wk = P.pickWeek(names, today), path = `plans/${wk.week}.md`;
      if (!wk.exists) { const e = new Error("no plan this week"); e.status = 409; e.noPlan = true; throw e; }
      const r = P.editHave(dec((await api(`/contents/${path}?ref=${head}`)).content), { action, item });
      const plan = P.readPlan(r.md);
      const files = [];
      if (r.changed) files.push({ path, mode: "100644", type: "blob", content: r.md });
      let inventory = { changed: false, added: [], removed: [], skipped_staples: [], already: [] };
      const invMd = await readContent(api, "kitchen/inventory.md", head);
      const staplesMd = (await readContent(api, "kitchen/staples.md", head)) || "";
      if (invMd != null) {
        inventory = action === "have" ? applyAdd(invMd, [item], staplesMd) : applyExactRemove(invMd, [item]);
        if (inventory.changed) files.push({ path: "kitchen/inventory.md", mode: "100644", type: "blob", content: inventory.md });
      }
      if (!files.length) return { sha: null, changed: false, week: wk.week, path, plan, inventory };
      const t = await api(`/git/trees`, { method: "POST", body: JSON.stringify({ base_tree: commit.tree.sha, tree: files }) });
      const c = await api(`/git/commits`, { method: "POST", body: JSON.stringify({ message: `plan: ${action} ${P.cleanItem(item)} ${wk.week} (${who} via ${via})`, tree: t.sha, parents: [head] }) });
      try { await api(`/git/refs/heads/${branch}`, { method: "PATCH", body: JSON.stringify({ sha: c.sha, force: false }) }); return { sha: c.sha, changed: true, week: wk.week, path, plan, inventory }; }
      catch (e) { if (e.status !== 422 && e.status !== 409) throw e; continue; }
    }
    try { recipe = await api(`/contents/recipes/${slug}.md?ref=${head}`); } catch (e) { if (e.status !== 404) throw e; }   // food only, not cocktails/
    if (!recipe) { const e = new Error("unknown recipe"); e.status = 404; throw e; }
    let names = [];
    try { names = (await api(`/contents/plans?ref=${head}`)).map(f => f.name); } catch (e) { if (e.status !== 404) throw e; }
    const wk = P.pickWeek(names, today);
    const path = `plans/${wk.week}.md`;
    const cur = wk.exists ? dec((await api(`/contents/${path}?ref=${head}`)).content) : P.newPlan(wk);
    const kind = as === "extra" || as === "dinner" ? as : (P.DINNER_TYPES.has(P.typeOf(dec(recipe.content))) ? "dinner" : "extra");
    const r = P.editPlan(cur, { action, slug, as: kind, night });
    const plan = P.readPlan(r.md);
    if (!r.changed) return { sha: null, changed: false, week: wk.week, path, as: r.as, plan };
    const t = await api(`/git/trees`, { method: "POST", body: JSON.stringify({ base_tree: commit.tree.sha, tree: [{ path, mode: "100644", type: "blob", content: r.md }] }) });
    const msg = `plan: ${action} ${slug} ${action === "add" ? "to" : "from"} ${wk.week} (${who} via ${via})`;
    const c = await api(`/git/commits`, { method: "POST", body: JSON.stringify({ message: msg, tree: t.sha, parents: [head] }) });
    try { await api(`/git/refs/heads/${branch}`, { method: "PATCH", body: JSON.stringify({ sha: c.sha, force: false }) }); return { sha: c.sha, changed: true, week: wk.week, path, as: r.as, plan }; }
    catch (e) { if (e.status !== 422 && e.status !== 409) throw e; }
  }
  throw new Error("could not commit (busy), try again");
}

/** Read the current week's plan (no commit). */
export async function readCurrentPlan({ token, repo = "TheYoungCrews/recipes", branch = "main", today, fetchFn = fetch }) {

  const api = async path => {
    const r = await fetchFn(`https://api.github.com/repos/${repo}${path}`, { headers: { authorization: `Bearer ${token}`, accept: "application/vnd.github+json", "user-agent": "blind-tiger-plan" } });
    if (!r.ok) { const e = new Error(`github ${r.status}`); e.status = r.status; throw e; }
    return r.json();
  };
  let names = [];
  try { names = (await api(`/contents/plans?ref=${branch}`)).map(f => f.name); } catch (e) { if (e.status !== 404) throw e; }
  const wk = P.pickWeek(names, today);
  const plan = wk.exists ? P.readPlan(dec((await api(`/contents/plans/${wk.week}.md?ref=${branch}`)).content)) : { recipes: [], nights: [], extras: [], on_hand: [] };
  return { week: wk.week, starts: wk.starts, path: `plans/${wk.week}.md`, exists: wk.exists, ...plan };
}

/** Preview which inventory lines a recipe would take off. */
export async function readInventoryPreview({ token, repo = "TheYoungCrews/recipes", branch = "main", slug, fetchFn = fetch }) {
  const api = async path => {
    const r = await fetchFn(`https://api.github.com/repos/${repo}${path}`, { headers: { authorization: `Bearer ${token}`, accept: "application/vnd.github+json", "user-agent": "blind-tiger-inventory" } });
    if (!r.ok) { const e = new Error(`github ${r.status} ${path}`); e.status = r.status; throw e; }
    return r.json();
  };
  let file = null;
  for (const d of ["recipes", "cocktails"]) {
    try { file = await api(`/contents/${d}/${slug}.md?ref=${branch}`); break; } catch (e) { if (e.status !== 404) throw e; }
  }
  if (!file) { const e = new Error("unknown recipe"); e.status = 404; throw e; }
  const invMd = await readContent(api, "kitchen/inventory.md", branch);
  const staplesMd = (await readContent(api, "kitchen/staples.md", branch)) || "";
  const items = invMd != null ? proposeRemovals(invMd, dec(file.content), staplesMd) : [];
  return { slug, items };
}

/** Add or remove grocery names in kitchen/inventory.md, one commit. Never touches staples. */
export async function commitInventoryEdit({ token, repo = "TheYoungCrews/recipes", branch = "main", items, action, who, via = "api", fetchFn = fetch }) {
  const api = async (path, init = {}) => {
    const r = await fetchFn(`https://api.github.com/repos/${repo}${path}`, { ...init, headers: {
      authorization: `Bearer ${token}`, accept: "application/vnd.github+json", "user-agent": "blind-tiger-inventory", "content-type": "application/json" } });
    if (!r.ok) { const e = new Error(`github ${r.status} ${path}`); e.status = r.status; throw e; }
    return r.json();
  };
  for (let attempt = 0; attempt < 6; attempt++) {
    if (attempt) await new Promise(r => setTimeout(r, 150 * attempt + Math.floor(Math.random() * 200)));
    const head = (await api(`/git/ref/heads/${branch}`)).object.sha;
    const commit = await api(`/git/commits/${head}`);
    const invMd = await readContent(api, "kitchen/inventory.md", head);
    if (invMd == null) { const e = new Error("no inventory file"); e.status = 404; throw e; }
    const staplesMd = (await readContent(api, "kitchen/staples.md", head)) || "";
    const applied = action === "add" ? applyAdd(invMd, items, staplesMd) : applyExactRemove(invMd, items);
    if (!applied.changed) return { sha: null, changed: false, ...applied };
    const t = await api(`/git/trees`, { method: "POST", body: JSON.stringify({ base_tree: commit.tree.sha, tree: [{ path: "kitchen/inventory.md", mode: "100644", type: "blob", content: applied.md }] }) });
    const names = (applied.added || []).map(a => a.name).concat(applied.removed || []);
    const msg = `inventory: ${action} ${names.slice(0, 8).join(", ") || "items"} (${who} via ${via})`;
    const c = await api(`/git/commits`, { method: "POST", body: JSON.stringify({ message: msg, tree: t.sha, parents: [head] }) });
    try { await api(`/git/refs/heads/${branch}`, { method: "PATCH", body: JSON.stringify({ sha: c.sha, force: false }) }); return { sha: c.sha, changed: true, ...applied }; }
    catch (e) { if (e.status !== 422 && e.status !== 409) throw e; }
  }
  throw new Error("could not commit (busy), try again");
}
