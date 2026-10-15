// One atomic commit (recipe edit + optional photo) via the GitHub git data API.
import { applyCook, photoName } from "./recipe.js";
const enc = s => btoa(unescape(encodeURIComponent(s)));
const dec = b => decodeURIComponent(escape(atob(b.replace(/\n/g, ""))));

export async function commitCook({ token, repo = "TheYoungCrews/recipes", branch = "main", slug, who, date, rating, note, photoB64, fetchFn = fetch }) {
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
    const md = applyCook(dec(file.content), { date, who, rating, note, photo: photoRel });
    tree.push({ path: `${dir}/${slug}.md`, mode: "100644", type: "blob", content: md });
    const t = await api(`/git/trees`, { method: "POST", body: JSON.stringify({ base_tree: commit.tree.sha, tree }) });
    const msg = `file: made ${slug} (${who} via site${rating != null ? `, ${rating}/5` : ""})`;
    const c = await api(`/git/commits`, { method: "POST", body: JSON.stringify({ message: msg, tree: t.sha, parents: [head] }) });
    try { await api(`/git/refs/heads/${branch}`, { method: "PATCH", body: JSON.stringify({ sha: c.sha, force: false }) }); return { sha: c.sha, photo: photoRel, path: `${dir}/${slug}.md` }; }
    catch (e) { if (e.status !== 422 && e.status !== 409) throw e; }  // someone pushed in between: retry
  }
  throw new Error("could not commit (busy), try again");
}
