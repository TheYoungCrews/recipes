import { verifyGoogleIdToken, whoFor } from "../_lib/auth.js";
import { verifySiwe } from "../_lib/siwe.js";
import { readSession } from "../_lib/session.js";
import { commitCook } from "../_lib/github.js";
import { todayNY } from "../_lib/recipe.js";
const out = (status, body) => Response.json(body, { status, headers: { "cache-control": "no-store" } });

export async function onRequestPost({ request, env }) {
  if (!env.GITHUB_TOKEN || !((env.GOOGLE_CLIENT_ID && env.COOKS) || (env.COOKS_ETH && env.SESSION_SECRET))) return out(503, { error: "Sign-in isn't set up yet." });
  let b;
  try { b = await request.json(); } catch { return out(400, { error: "Bad request." }); }
  let who, clear = false;
  if (b && b.siwe) {
    if (!env.COOKS_ETH || !env.SESSION_SECRET) return out(503, { error: "Ethereum sign-in isn't set up yet." });
    let r;
    try { r = await verifySiwe({ message: String(b.siwe.message || ""), signature: String(b.siwe.signature || ""), cookie: request.headers.get("cookie"), secret: env.SESSION_SECRET, cooksEth: env.COOKS_ETH, domain: env.SITE_DOMAIN || "blind-tiger.pages.dev" }); }
    catch { return out(401, { error: "Please sign in again." }); }
    who = r.who; clear = true;
  } else if (!/^Bearer\s+[^n]/i.test(request.headers.get("authorization") || "") && (who = await readSession(request.headers.get("cookie"), env.SESSION_SECRET))) {
    // signed in via session cookie (set after Google or SIWE sign-in)
  } else {
    if (!env.GOOGLE_CLIENT_ID || !env.COOKS) return out(503, { error: "Google sign-in isn't set up yet." });
    let user;
    try { user = await verifyGoogleIdToken((request.headers.get("authorization") || "").replace(/^Bearer\s+/i, ""), env.GOOGLE_CLIENT_ID); }
    catch { return out(401, { error: "Please sign in again." }); }
    who = whoFor(user.email, env.COOKS);
  }
  if (!who) return out(403, { error: "Only Crews and Anna can log cooks here." });
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
    const res = out(200, { ok: true, who, date: todayNY(), commit: r.sha.slice(0, 7) });
    if (clear) res.headers.set("set-cookie", "siwe_nonce=; Path=/api; Max-Age=0; HttpOnly; Secure; SameSite=Strict");
    return res;
  } catch (e) {
    return out(e.status === 404 ? 404 : 502, { error: e.status === 404 ? "Recipe not found." : "Couldn't save to the recipe book. Try again in a minute." });
  }
}
