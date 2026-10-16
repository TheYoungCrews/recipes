// GET: who am I (from Google bearer or session cookie). POST {siwe:{message,signature}} or Bearer Google -> sets cook_session.
import { verifySiwe } from "../_lib/siwe.js";
import { makeSession, identify } from "../_lib/session.js";
const out = (status, body, h = {}) => Response.json(body, { status, headers: { "cache-control": "no-store", ...h } });
export async function onRequestGet({ request, env }) {
  const who = await identify(request, env);
  return who ? out(200, { who }) : out(401, { error: "signed out" });
}
export async function onRequestPost({ request, env }) {
  if (!env.SESSION_SECRET) return out(503, { error: "Sign-in isn't set up yet." });
  let b = {}; try { b = await request.json(); } catch {}
  let who = null;
  if (b && b.siwe) {
    if (!env.COOKS_ETH) return out(503, { error: "Ethereum sign-in isn't set up yet." });
    try { who = (await verifySiwe({ message: String(b.siwe.message || ""), signature: String(b.siwe.signature || ""), cookie: request.headers.get("cookie"), secret: env.SESSION_SECRET, cooksEth: env.COOKS_ETH, domain: env.SITE_DOMAIN || "blind-tiger.pages.dev" })).who; }
    catch { return out(401, { error: "Please sign in again." }); }
  } else who = await identify(request, env);
  if (!who) return out(403, { error: "Only Crews and Anna can sign in here." });
  const h = new Headers({ "cache-control": "no-store" });
  h.append("set-cookie", await makeSession(env.SESSION_SECRET, who));
  h.append("set-cookie", "siwe_nonce=; Path=/api; Max-Age=0; HttpOnly; Secure; SameSite=Strict");
  return Response.json({ who }, { headers: h });
}
