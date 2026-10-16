// Short signed session cookie (who.exp.hmac) set after Google or SIWE sign-in. HMAC-SHA256 with SESSION_SECRET.
import { verifyGoogleIdToken, whoFor } from "./auth.js";
const enc = new TextEncoder();
const hex = b => [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, "0")).join("");
export const SESSION_TTL = 12 * 3600;
async function mac(secret, data) {
  const k = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return hex(await crypto.subtle.sign("HMAC", k, enc.encode("session:" + data)));
}
export async function makeSession(secret, who, now = Math.floor(Date.now() / 1000)) {
  const exp = now + SESSION_TTL;
  return `cook_session=${who}.${exp}.${await mac(secret, `${who}.${exp}`)}; Path=/api; Max-Age=${SESSION_TTL}; HttpOnly; Secure; SameSite=Strict`;
}
export async function readSession(cookieHeader, secret, now = Math.floor(Date.now() / 1000)) {
  if (!secret) return null;
  const m = /(?:^|;\s*)cook_session=([a-z0-9+-]{1,40})\.(\d+)\.([0-9a-f]{64})/.exec(cookieHeader || "");
  if (!m || +m[2] < now) return null;
  return (await mac(secret, `${m[1]}.${m[2]}`)) === m[3] ? m[1] : null;
}
// Who is calling? Google ID token (Bearer) first, then session cookie. Returns cook name or null.
export async function identify(request, env) {
  const bearer = (request.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  if (bearer && bearer !== "null" && env.GOOGLE_CLIENT_ID && env.COOKS) {
    try { const u = await verifyGoogleIdToken(bearer, env.GOOGLE_CLIENT_ID); const w = whoFor(u.email, env.COOKS); if (w) return w; } catch {}
  }
  return readSession(request.headers.get("cookie"), env.SESSION_SECRET);
}
