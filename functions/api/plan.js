// GET  /api/plan  -> this week's plan (live from the repo): { week, starts, recipes, nights, extras }
// POST /api/plan  {slug, action: "add"|"remove", as?: "dinner"|"extra", night?: "mon".."sun"|"any"}
//                 {item, action: "have"|"unhave"}  item = a grocery line's key from /week.json ("chicken stock"); edits on_hand
// Auth: Bearer RECIPE_API_KEYS (agents) or the site's signed-in session (Crews and Anna). Writes only plans/<week>.md.
import { identifyFull, renewCookies } from "../_lib/session.js";
import { whoForApiKey } from "../_lib/apikey.js";
import { commitPlanEdit, readCurrentPlan } from "../_lib/github.js";
import { todayNY } from "../_lib/recipe.js";
import { cleanItem, okItem } from "../_lib/plan.js";
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
  if (!auth) return out(401, { error: "Sign in or pass a Bearer API key. The public copy is /week.json." });
  if (!env.GITHUB_TOKEN) return out(503, { error: "Plans aren't set up yet." });
  try { return out(200, await readCurrentPlan({ token: env.GITHUB_TOKEN, repo: env.GITHUB_REPO || "TheYoungCrews/recipes", today: todayNY() })); }
  catch { return out(502, { error: "Couldn't read the plan. Try again in a minute." }); }
}
export async function onRequestPost({ request, env }) {
  const auth = await whoFrom(request, env);
  if (!auth) return out(401, { error: "Sign in or pass a Bearer API key to change this week's plan." });
  if (!env.GITHUB_TOKEN) return out(503, { error: "Plans aren't set up yet." });
  let b; try { b = await request.json(); } catch { return out(400, { error: "Send JSON: {slug, action}." }); }
  const slug = String((b && b.slug) || ""), action = String((b && b.action) || "add");
  if (!["add", "remove", "have", "unhave"].includes(action)) return out(400, { error: "action must be add, remove, have or unhave." });
  if (action === "have" || action === "unhave") {
    const item = cleanItem(b.item);
    if (!okItem(item)) return out(400, { error: "item: 1 to 80 characters, no commas, brackets, quotes or #." });
    try {
      const r = await commitPlanEdit({ token: env.GITHUB_TOKEN, repo: env.GITHUB_REPO || "TheYoungCrews/recipes", item, action, who: auth.who, via: auth.via, today: todayNY() });
      const cookies = auth.id ? await renewCookies(auth.id, env) : [];
      return out(200, { ok: true, who: auth.who, item, action, changed: r.changed, week: r.week, path: r.path, on_hand: r.plan.on_hand,
        have: r.plan.on_hand.some(x => cleanItem(x) === item), commit: r.sha ? r.sha.slice(0, 7) : null,
        message: r.changed ? "Saved. /week/ rebuilds in about a minute." : "No change needed." }, cookies);
    } catch (e) {
      return out(e.noPlan ? 409 : 502, { error: e.noPlan ? "There's no plan for this week yet." : "Couldn't save. Try again in a minute." });
    }
  }
  if (!/^[a-z0-9-]{1,100}$/.test(slug)) return out(400, { error: "Bad recipe." });
  const as = b.as == null ? null : String(b.as), night = b.night == null ? "any" : String(b.night);
  if (as && !["dinner", "extra"].includes(as)) return out(400, { error: "as must be dinner or extra." });
  if (!["mon", "tue", "wed", "thu", "fri", "sat", "sun", "any"].includes(night)) return out(400, { error: "night must be mon..sun or any." });
  try {
    const r = await commitPlanEdit({ token: env.GITHUB_TOKEN, repo: env.GITHUB_REPO || "TheYoungCrews/recipes", slug, action, as, night, who: auth.who, via: auth.via, today: todayNY() });
    const cookies = auth.id ? await renewCookies(auth.id, env) : [];
    return out(200, { ok: true, who: auth.who, slug, action, changed: r.changed, as: r.as, week: r.week, path: r.path,
      in_plan: r.plan.recipes.includes(slug) || r.plan.extras.includes(slug), plan: r.plan, commit: r.sha ? r.sha.slice(0, 7) : null,
      message: r.changed ? "Saved. /week/ and the grocery list rebuild in about a minute." : "No change needed." }, cookies);
  } catch (e) {
    return out(e.status === 404 ? 404 : 502, { error: e.status === 404 ? "Recipe not found." : "Couldn't save the plan. Try again in a minute." });
  }
}
