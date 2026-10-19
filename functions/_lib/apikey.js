// Per-person API keys from Pages secret RECIPE_API_KEYS (never in repo).
// Format: "anna=<hex>,crews=<hex>" (comma-separated). Compared in constant time per entry.
export function whoForApiKey(authHeader, keysEnv) {
  const m = /^Bearer\s+(\S+)/i.exec(String(authHeader || "").trim());
  if (!m) return null;
  const presented = m[1];
  for (const pair of String(keysEnv || "").split(",")) {
    const i = pair.indexOf("=");
    if (i < 1) continue;
    const who = pair.slice(0, i).trim().toLowerCase();
    const key = pair.slice(i + 1).trim();
    if (!who || !key || (who !== "anna" && who !== "crews")) continue;
    if (timingSafeEqual(key, presented)) return who;
  }
  return null;
}

function timingSafeEqual(a, b) {
  const enc = new TextEncoder();
  const aa = enc.encode(a), bb = enc.encode(b);
  if (aa.length !== bb.length) {
    let x = 0; for (let i = 0; i < aa.length; i++) x |= aa[i];
    return false;
  }
  let out = 0;
  for (let i = 0; i < aa.length; i++) out |= aa[i] ^ bb[i];
  return out === 0;
}
