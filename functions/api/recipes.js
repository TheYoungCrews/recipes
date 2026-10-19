// POST /api/add | /api/recipes — batch recipes into inbox/ (one commit).
// Auth: Bearer RECIPE_API_KEYS or existing Google/SIWE session. Content is data only.
import { identifyFull, renewCookies } from "../_lib/session.js";
import { whoForApiKey } from "../_lib/apikey.js";
import { splitRecipes, wrapInboxFile, wrapJsonRecipe, titleFrom, MAX_BYTES, MAX_ITEMS, MAX_PASTE_ITEMS_DAY } from "../_lib/paste.js";
import { commitInboxBatch } from "../_lib/github.js";
import { todayNY } from "../_lib/recipe.js";

const out = (status, body, cookies = []) => {
  const h = new Headers({ "cache-control": "no-store" });
  for (const c of cookies) h.append("set-cookie", c);
  return Response.json(body, { status, headers: h });
};

async function reservePaste(kv, n, now = Date.now()) {
  if (!kv) return { ok: true };
  const k = "paste:" + new Date(now).toISOString().slice(0, 10);
  const cur = JSON.parse((await kv.get(k)) || '{"n":0}');
  if (cur.n + n > MAX_PASTE_ITEMS_DAY) return null;
  cur.n += n;
  await kv.put(k, JSON.stringify(cur), { expirationTtl: 3 * 86400 });
  return cur;
}

async function whoFrom(request, env) {
  const keyWho = whoForApiKey(request.headers.get("authorization"), env.RECIPE_API_KEYS);
  if (keyWho) return { who: keyWho, via: "api", id: null };
  const id = await identifyFull(request, env);
  if (id) return { who: id.who, via: "site-paste", id };
  return null;
}

function parseBody(request, rawText, json) {
  const ctype = (request.headers.get("content-type") || "").toLowerCase();
  // markdown body
  if (ctype.includes("text/markdown") || ctype.includes("text/plain")) {
    return { kind: "markdown", text: rawText };
  }
  if (json && typeof json.markdown === "string") return { kind: "markdown", text: json.markdown };
  if (json && typeof json.text === "string") return { kind: "markdown", text: json.text };
  if (json && Array.isArray(json.recipes)) return { kind: "json", recipes: json.recipes };
  if (json && (json.title || json.ingredients || json.steps || json.body)) return { kind: "json", recipes: [json] };
  if (typeof rawText === "string" && rawText.trim() && !ctype.includes("json")) return { kind: "markdown", text: rawText };
  return null;
}

export async function onRequestPost({ request, env }) {
  const auth = await whoFrom(request, env);
  if (!auth) return out(401, { error: "Sign in or pass a Bearer API key to add recipes." });
  if (!env.GITHUB_TOKEN) return out(503, { error: "Adding recipes isn't set up yet." });

  const len = Number(request.headers.get("content-length") || 0);
  if (len > MAX_BYTES + 8192) return out(413, { error: "That paste is too big. Try fewer recipes at once." });

  const buf = await request.arrayBuffer();
  if (buf.byteLength > MAX_BYTES + 8192) return out(413, { error: "That paste is too big. Try fewer recipes at once." });
  const rawText = new TextDecoder().decode(buf);
  let json = null;
  try { json = JSON.parse(rawText); } catch {}

  const parsed = parseBody(request, rawText, json);
  if (!parsed) return out(400, { error: "Send markdown ({markdown}) or JSON ({recipes:[...]})." });

  const date = todayNY();
  let files = [];
  if (parsed.kind === "markdown") {
    if (!parsed.text.trim()) return out(400, { error: "Paste a recipe first." });
    if (new TextEncoder().encode(parsed.text).length > MAX_BYTES) return out(413, { error: "That paste is too big. Try fewer recipes at once." });
    const chunks = splitRecipes(parsed.text);
    if (!chunks.length) return out(400, { error: "Paste a recipe first." });
    if (chunks.length > MAX_ITEMS) return out(400, { error: `That's ${chunks.length} recipes. Paste up to ${MAX_ITEMS} at a time.` });
    files = chunks.map(chunk => wrapInboxFile({ chunk, who: auth.who, date, title: titleFrom(chunk), via: auth.via }));
  } else {
    if (!parsed.recipes.length) return out(400, { error: "Send at least one recipe." });
    if (parsed.recipes.length > MAX_ITEMS) return out(400, { error: `That's ${parsed.recipes.length} recipes. Send up to ${MAX_ITEMS} at a time.` });
    files = parsed.recipes.map(recipe => wrapJsonRecipe({ recipe, who: auth.who, date, via: auth.via }));
  }

  if (!(await reservePaste(env.ASK_KV, files.length))) {
    return out(429, { error: "That's enough for today. Try again tomorrow." });
  }

  const msg = `inbox: paste from ${auth.who} (${files.length} recipe${files.length === 1 ? "" : "s"})`;
  try {
    const r = await commitInboxBatch({
      token: env.GITHUB_TOKEN,
      repo: env.GITHUB_REPO || "TheYoungCrews/recipes",
      files,
      message: msg,
    });
    const saved = r.files || files;
    const cookies = auth.id ? await renewCookies(auth.id, env) : [];
    return out(200, {
      ok: true,
      who: auth.who,
      count: saved.length,
      titles: saved.map(f => f.title),
      commit: r.sha.slice(0, 7),
      message: "These get filed onto the site within the hour.",
    }, cookies);
  } catch (e) {
    return out(e.status === 409 ? 409 : 502, {
      error: e.status === 409 ? "One of those names is already in the inbox. Try again in a minute." : "Couldn't save to the recipe book. Try again in a minute.",
    });
  }
}

export async function onRequestGet() {
  return out(405, { error: "POST markdown or JSON to add recipes. See /openapi.json." });
}
