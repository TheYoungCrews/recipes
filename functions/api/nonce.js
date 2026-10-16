import { makeNonceCookie, toChecksum, NONCE_TTL } from "../_lib/siwe.js";
export async function onRequestGet({ request, env }) {
  if (!env.SESSION_SECRET) return Response.json({ error: "not configured" }, { status: 503 });
  const { nonce, value } = await makeNonceCookie(env.SESSION_SECRET);
  let address = null;
  const a = new URL(request.url).searchParams.get("address");
  if (a) { try { address = toChecksum(a); } catch { return Response.json({ error: "bad address" }, { status: 400 }); } }
  return Response.json({ nonce, address }, { headers: { "cache-control": "no-store",
    "set-cookie": `siwe_nonce=${value}; Path=/api; Max-Age=${NONCE_TTL}; HttpOnly; Secure; SameSite=Strict` } });
}
