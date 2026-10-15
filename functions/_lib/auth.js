// Verify a Google Identity Services ID token (RS256 JWT) with WebCrypto. No dependencies.
const JWKS_URL = "https://www.googleapis.com/oauth2/v3/certs";
let cache = { keys: null, exp: 0 };
const b64u = s => Uint8Array.from(atob(s.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((s.length + 3) % 4)), c => c.charCodeAt(0));
const json = s => JSON.parse(new TextDecoder().decode(b64u(s)));

async function jwks(fetchFn, now) {
  if (cache.keys && cache.exp > now) return cache.keys;
  const res = await fetchFn(JWKS_URL);
  if (!res.ok) throw new Error("jwks fetch failed");
  const m = /max-age=(\d+)/.exec(res.headers.get("cache-control") || "");
  cache = { keys: (await res.json()).keys, exp: now + (m ? +m[1] : 3600) };
  return cache.keys;
}
export function _resetCache() { cache = { keys: null, exp: 0 }; }

export async function verifyGoogleIdToken(token, clientId, { fetchFn = fetch, now = Math.floor(Date.now() / 1000) } = {}) {
  if (!clientId) throw new Error("not configured");
  const parts = String(token || "").split(".");
  if (parts.length !== 3) throw new Error("malformed token");
  const header = json(parts[0]), p = json(parts[1]);
  if (header.alg !== "RS256") throw new Error("bad alg");
  const jwk = (await jwks(fetchFn, now)).find(k => k.kid === header.kid);
  if (!jwk) throw new Error("unknown key");
  const key = await crypto.subtle.importKey("jwk", { kty: "RSA", n: jwk.n, e: jwk.e, alg: "RS256", ext: true },
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["verify"]);
  const ok = await crypto.subtle.verify("RSASSA-PKCS1-v1_5", key, b64u(parts[2]), new TextEncoder().encode(parts[0] + "." + parts[1]));
  if (!ok) throw new Error("bad signature");
  if (p.aud !== clientId) throw new Error("bad audience");
  if (!["accounts.google.com", "https://accounts.google.com"].includes(p.iss)) throw new Error("bad issuer");
  if (!(p.exp > now - 60)) throw new Error("expired");
  if (p.iat && p.iat > now + 300) throw new Error("issued in the future");
  if (p.email_verified !== true && p.email_verified !== "true") throw new Error("email not verified");
  return { email: String(p.email).toLowerCase(), name: p.name || "" };
}

// COOKS env: "a@x.com=crews,b@y.com=anna"
export function whoFor(email, cooksEnv) {
  for (const pair of String(cooksEnv || "").split(",")) {
    const [e, who] = pair.split("=").map(s => (s || "").trim().toLowerCase());
    if (e && who && e === email) return who;
  }
  return null;
}
