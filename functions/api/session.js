// GET: who am I (session cookie or Google bearer); renews the 30-day session when it's over a day old.
// POST {siwe:{message,signature}} or Bearer Google -> sets cook_session.
import { verifySiwe } from "../_lib/siwe.js";
import { makeSession, identifyFull, renewCookies, CLEAR_OLD } from "../_lib/session.js";
const out = (status, body, cookies = []) => {
  const h = new Headers({ "cache-control": "no-store" });
  for (const c of cookies) h.append("set-cookie", c);
  return Response.json(body, { status, headers: h });
};
export async function onRequestGet({ request, env }) {
  const id = await identifyFull(request, env);
  return id ? out(200, { who: id.who }, await renewCookies(id, env)) : out(401, { error: "signed out" });
}
export async function onRequestPost({ request, env }) {
  if (!env.SESSION_SECRET) return out(503, { error: "Sign-in isn't set up yet." });
  let b = {}; try { b = await request.json(); } catch {}
  let who = null;
  if (b && b.siwe) {
    if (!env.COOKS_ETH) return out(503, { error: "Ethereum sign-in isn't set up yet." });
    try { who = (await verifySiwe({ message: String(b.siwe.message || ""), signature: String(b.siwe.signature || ""), cookie: request.headers.get("cookie"), secret: env.SESSION_SECRET, cooksEth: env.COOKS_ETH, domain: env.SITE_DOMAIN || "blind-tiger.pages.dev" })).who; }
    catch { return out(401, { error: "Please sign in again." }); }
  } else { const id = await identifyFull(request, env); who = id && id.who; }
  if (!who) return out(403, { error: "Only Crews and Anna can sign in here." });
  return out(200, { who }, [await makeSession(env.SESSION_SECRET, who), CLEAR_OLD, "siwe_nonce=; Path=/api; Max-Age=0; HttpOnly; Secure; SameSite=Strict"]);
}
