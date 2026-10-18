// Signed session cookie (who.exp.hmac) set after Google or SIWE sign-in. HMAC-SHA256 with SESSION_SECRET.
// Lasts 30 days and slides: any signed-in request with a session older than a day gets a fresh 30-day cookie.
import { verifyGoogleIdToken, whoFor } from "./auth.js";
const enc = new TextEncoder();
const hex = b => [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, "0")).join("");
export const SESSION_TTL = 30 * 24 * 3600;
export const RENEW_AFTER = 24 * 3600;
async function mac(secret, data) {
  const k = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return hex(await crypto.subtle.sign("HMAC", k, enc.encode("session:" + data)));
}
export async function makeSession(secret, who, now = Math.floor(Date.now() / 1000)) {
  const exp = now + SESSION_TTL;
  return `cook_session=${who}.${exp}.${await mac(secret, `${who}.${exp}`)}; Path=/; Max-Age=${SESSION_TTL}; Expires=${new Date(exp * 1000).toUTCString()}; HttpOnly; Secure; SameSite=Lax`;
}
// Older builds set the cookie on Path=/api; clear that copy so only the Path=/ one remains.
export const CLEAR_OLD = "cook_session=; Path=/api; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Secure; SameSite=Strict";
// Returns { who, exp } for the newest valid cook_session cookie, or null.
export async function readSessionFull(cookieHeader, secret, now = Math.floor(Date.now() / 1000)) {
  if (!secret) return null;
  let best = null;
  for (const m of String(cookieHeader || "").matchAll(/(?:^|;\s*)cook_session=([a-z0-9+-]{1,40})\.(\d+)\.([0-9a-f]{64})/g)) {
    const exp = +m[2];
    if (exp < now || exp > now + SESSION_TTL + 300) continue;
    if ((await mac(secret, `${m[1]}.${m[2]}`)) !== m[3]) continue;
    if (!best || exp > best.exp) best = { who: m[1], exp };
  }
  return best;
}
export async function readSession(cookieHeader, secret, now) {
  const s = await readSessionFull(cookieHeader, secret, now);
  return s ? s.who : null;
}
// Who is calling? Session cookie or Google ID token (Bearer). Returns { who, via, exp } or null.
export async function identifyFull(request, env, now = Math.floor(Date.now() / 1000)) {
  const s = await readSessionFull(request.headers.get("cookie"), env.SESSION_SECRET, now);
  if (s) return { ...s, via: "session" };
  const bearer = (request.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  if (bearer && bearer !== "null" && bearer !== "undefined" && env.GOOGLE_CLIENT_ID && env.COOKS) {
    try { const u = await verifyGoogleIdToken(bearer, env.GOOGLE_CLIENT_ID); const w = whoFor(u.email, env.COOKS); if (w) return { who: w, via: "google" }; } catch {}
  }
  return null;
}
export async function identify(request, env) {
  const r = await identifyFull(request, env);
  return r ? r.who : null;
}
// Set-Cookie values to send back for a signed-in caller: a fresh session if they have none, or theirs is over a day old.
export async function renewCookies(id, env, now = Math.floor(Date.now() / 1000)) {
  if (!id || !env.SESSION_SECRET) return [];
  if (id.via === "session" && id.exp - now > SESSION_TTL - RENEW_AFTER) return [];
  return [await makeSession(env.SESSION_SECRET, id.who, now), CLEAR_OLD];
}
