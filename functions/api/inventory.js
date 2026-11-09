// GET  /api/inventory?slug=squash-soup  -> inventory lines this dish may take off: {slug, items:[{name,line,section,suggested,reason}]}
// POST /api/inventory  {items:["Cremini mushrooms"], action:"add"|"remove"}
// Auth: Bearer RECIPE_API_KEYS or the site's signed-in session. Writes only kitchen/inventory.md. Never touches staples.
import { identifyFull, renewCookies } from "../_lib/session.js";
import { whoForApiKey } from "../_lib/apikey.js";
import { commitInventoryEdit, readInventoryPreview } from "../_lib/github.js";
import { cleanInvItem, okInvItem } from "../_lib/inventory.js";

const out = (status, body, cookies = []) => {
  const h = new Headers({ "cache-control": "no-store" });
  for (const c of cookies) h.append("set-cookie", c);
  return Response.json(body, { status, headers: h });
};
async function whoFrom(request, env) {
  const k = whoForApiKey(request.headers.get("authorization"), env.RECIPE_API_KEYS);
  if (k) return { who: k, via: "api", id: null };
  const id = await identifyFull(request, env);
  return id ? { who: id.who, via: "site", id } : null;
}

export async function onRequestGet({ request, env }) {
  const auth = await whoFrom(request, env);
  if (!auth) return out(401, { error: "Sign in or pass a Bearer API key." });
  if (!env.GITHUB_TOKEN) return out(503, { error: "Inventory isn't set up yet." });
  const slug = new URL(request.url).searchParams.get("slug") || "";
  if (!/^[a-z0-9-]{1,100}$/.test(slug)) return out(400, { error: "Pass ?slug= for the recipe." });
  try {
    return out(200, await readInventoryPreview({ token: env.GITHUB_TOKEN, repo: env.GITHUB_REPO || "TheYoungCrews/recipes", slug }));
  } catch (e) {
    return out(e.status === 404 ? 404 : 502, { error: e.status === 404 ? "Recipe not found." : "Couldn't read the inventory. Try again in a minute." });
  }
}

export async function onRequestPost({ request, env }) {
  const auth = await whoFrom(request, env);
  if (!auth) return out(401, { error: "Sign in or pass a Bearer API key to change the inventory." });
  if (!env.GITHUB_TOKEN) return out(503, { error: "Inventory isn't set up yet." });
  let b; try { b = await request.json(); } catch { return out(400, { error: "Send JSON: {items, action}." }); }
  const action = String((b && b.action) || "add");
  if (!["add", "remove"].includes(action)) return out(400, { error: "action must be add or remove." });
  const raw = Array.isArray(b && b.items) ? b.items : (b && b.item != null ? [b.item] : []);
  const items = raw.map(x => cleanInvItem(x)).filter(Boolean);
  if (!items.length || items.length > 40) return out(400, { error: "items: 1 to 40 names." });
  if (items.some(x => !okInvItem(x))) return out(400, { error: "Each item must be 1 to 80 characters, with no commas, brackets, quotes or #." });
  try {
    const r = await commitInventoryEdit({ token: env.GITHUB_TOKEN, repo: env.GITHUB_REPO || "TheYoungCrews/recipes", items, action, who: auth.who, via: auth.via });
    const cookies = auth.id ? await renewCookies(auth.id, env) : [];
    return out(200, {
      ok: true, who: auth.who, action, changed: r.changed,
      added: (r.added || []).map(a => a.name || a),
      removed: r.removed || [],
      skipped_staples: r.skipped_staples || [],
      already: r.already || [],
      commit: r.sha ? r.sha.slice(0, 7) : null,
      message: r.changed ? "Saved. The inventory updates in about a minute." : "No change needed."
    }, cookies);
  } catch (e) {
    return out(e.status === 404 ? 404 : 502, { error: e.status === 404 ? "Inventory file not found." : "Couldn't save. Try again in a minute." });
  }
}
