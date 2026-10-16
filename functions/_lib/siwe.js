// Sign in with Ethereum (EIP-4361): HMAC nonce cookie, message parsing/checks, personal_sign recovery. No network.
import { secp256k1, keccak_256 } from "./vendor/noble.js";
const enc = new TextEncoder();
const hex = b => [...b].map(x => x.toString(16).padStart(2, "0")).join("");
const unhex = h => Uint8Array.from(h.match(/../g) || [], x => parseInt(x, 16));
export const NONCE_TTL = 600;

export function toChecksum(addr) {
  const a = String(addr).toLowerCase().replace(/^0x/, "");
  if (!/^[0-9a-f]{40}$/.test(a)) throw new Error("bad address");
  const h = hex(keccak_256(enc.encode(a)));
  return "0x" + [...a].map((c, i) => (parseInt(h[i], 16) >= 8 ? c.toUpperCase() : c)).join("");
}

async function hmac(secret, data) {
  const k = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return hex(new Uint8Array(await crypto.subtle.sign("HMAC", k, enc.encode(data))));
}
export async function makeNonceCookie(secret, now = Math.floor(Date.now() / 1000)) {
  const nonce = hex(crypto.getRandomValues(new Uint8Array(16)));
  const exp = now + NONCE_TTL;
  return { nonce, value: `${nonce}.${exp}.${await hmac(secret, `${nonce}.${exp}`)}` };
}
export async function readNonceCookie(cookieHeader, secret, now = Math.floor(Date.now() / 1000)) {
  const m = /(?:^|;\s*)siwe_nonce=([0-9a-f]{32})\.(\d+)\.([0-9a-f]{64})/.exec(cookieHeader || "");
  if (!m) throw new Error("no nonce");
  const [, nonce, exp, mac] = m;
  if ((await hmac(secret, `${nonce}.${exp}`)) !== mac) throw new Error("bad nonce");
  if (+exp < now) throw new Error("nonce expired");
  return nonce;
}

export function parseSiwe(msg) {
  const lines = String(msg).split("\n");
  const m0 = /^(\S+) wants you to sign in with your Ethereum account:$/.exec(lines[0] || "");
  if (!m0 || !/^0x[0-9a-fA-F]{40}$/.test(lines[1] || "")) throw new Error("not a SIWE message");
  const f = {};
  for (const l of lines.slice(2)) { const m = /^([A-Za-z ]+): (.*)$/.exec(l); if (m && !(m[1] in f)) f[m[1]] = m[2]; }
  return { domain: m0[1], address: lines[1], uri: f["URI"], version: f["Version"], chainId: f["Chain ID"], nonce: f["Nonce"],
           issuedAt: f["Issued At"], expirationTime: f["Expiration Time"], notBefore: f["Not Before"] };
}

export function recoverPersonal(msg, sigHex) {
  const s = String(sigHex).replace(/^0x/, "");
  if (!/^[0-9a-fA-F]{130}$/.test(s)) throw new Error("bad signature");
  const b = unhex(s); let v = b[64]; if (v >= 27) v -= 27;
  if (v !== 0 && v !== 1) throw new Error("bad signature");
  const m = enc.encode(msg);
  const hash = keccak_256(new Uint8Array([...enc.encode(`\x19Ethereum Signed Message:\n${m.length}`), ...m]));
  const sig = secp256k1.Signature.fromBytes(b.slice(0, 64), "compact").addRecoveryBit(v);
  if (sig.hasHighS()) throw new Error("bad signature");
  const pub = sig.recoverPublicKey(hash).toBytes(false);
  return "0x" + hex(keccak_256(pub.slice(1)).slice(-20));
}

// COOKS_ETH env: "0xabc...=crews,0xdef...=anna"
export function whoForAddr(addr, env) {
  for (const pair of String(env || "").split(",")) {
    const [a, who] = pair.split("=").map(s => (s || "").trim().toLowerCase());
    if (a && who && a === String(addr).toLowerCase()) return who;
  }
  return null;
}

export async function verifySiwe({ message, signature, cookie, secret, cooksEth, domain = "blind-tiger.pages.dev", now = Math.floor(Date.now() / 1000) }) {
  if (!secret) throw new Error("not configured");
  const p = parseSiwe(message);
  if (p.domain !== domain) throw new Error("bad domain");
  if (!p.uri || !(p.uri === `https://${domain}` || p.uri.startsWith(`https://${domain}/`))) throw new Error("bad uri");
  if (p.version !== "1") throw new Error("bad version");
  if (p.chainId !== "1") throw new Error("bad chain");
  const nonce = await readNonceCookie(cookie, secret, now);
  if (p.nonce !== nonce) throw new Error("nonce mismatch");
  const iat = Date.parse(p.issuedAt) / 1000;
  if (!(iat <= now + 60 && iat >= now - NONCE_TTL)) throw new Error("expired");
  if (p.expirationTime) { const e = Date.parse(p.expirationTime) / 1000; if (!(e > now) || e > iat + NONCE_TTL) throw new Error("expired"); }
  if (p.notBefore && Date.parse(p.notBefore) / 1000 > now + 60) throw new Error("not yet valid");
  const addr = recoverPersonal(message, signature);
  if (addr !== p.address.toLowerCase()) throw new Error("signer mismatch");
  return { address: addr, who: whoForAddr(addr, cooksEth) };
}
