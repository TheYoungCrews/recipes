import { verifyGoogleIdToken, whoFor } from "../_lib/auth.js";
import { commitCook } from "../_lib/github.js";
import { todayNY } from "../_lib/recipe.js";
const out = (status, body) => Response.json(body, { status, headers: { "cache-control": "no-store" } });

export async function onRequestPost({ request, env }) {
  if (!env.GOOGLE_CLIENT_ID || !env.GITHUB_TOKEN || !env.COOKS) return out(503, { error: "Sign-in isn't set up yet." });
  let user;
  try { user = await verifyGoogleIdToken((request.headers.get("authorization") || "").replace(/^Bearer\s+/i, ""), env.GOOGLE_CLIENT_ID); }
  catch { return out(401, { error: "Please sign in again." }); }
  const who = whoFor(user.email, env.COOKS);
  if (!who) return out(403, { error: "Only Crews and Anna can log cooks here." });
  let b;
  try { b = await request.json(); } catch { return out(400, { error: "Bad request." }); }
  const slug = String(b.slug || "");
  if (!/^[a-z0-9-]{1,100}$/.test(slug)) return out(400, { error: "Bad recipe." });
  let rating = b.rating == null || b.rating === "" ? null : Number(b.rating);
  if (rating != null && !(rating >= 1 && rating <= 5 && rating * 2 === Math.round(rating * 2))) return out(400, { error: "Rating must be 1 to 5." });
  const note = String(b.note || "").slice(0, 1000);
  let photoB64 = null;
  if (b.photo) {
    photoB64 = String(b.photo).replace(/^data:image\/jpeg;base64,/, "");
    if (!/^[A-Za-z0-9+/=]+$/.test(photoB64) || photoB64.length > 6_000_000 || !photoB64.startsWith("/9j/")) return out(400, { error: "Photo must be a JPEG under ~4 MB." });
  }
  try {
    const r = await commitCook({ token: env.GITHUB_TOKEN, repo: env.GITHUB_REPO || "TheYoungCrews/recipes", slug, who, date: todayNY(), rating, note, photoB64 });
    return out(200, { ok: true, who, date: todayNY(), commit: r.sha.slice(0, 7) });
  } catch (e) {
    return out(e.status === 404 ? 404 : 502, { error: e.status === 404 ? "Recipe not found." : "Couldn't save to the recipe book. Try again in a minute." });
  }
}
