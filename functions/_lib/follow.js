// /follow subscribers in FOLLOW_KV (keys prefixed follow:). No emails are sent here.
import { whoForApiKey, timingSafeEqual } from "./apikey.js";

export const INTERESTS = ["food", "cocktails", "both"];
export const RATE_MAX = 8;
export const RATE_TTL = 3600;
export const TOKEN_RE = /^[a-f0-9]{32,64}$/;
const EMAIL_RE = /^[a-z0-9._%+\-']{1,64}@[a-z0-9.\-]{1,190}\.[a-z]{2,24}$/i;

export function normalizeEmail(s) {
  return String(s || "").trim().toLowerCase();
}
export function validEmail(s) {
  const e = normalizeEmail(s);
  return e.length >= 6 && e.length <= 254 && EMAIL_RE.test(e) && !e.includes("..");
}
export function normalizeInterest(s) {
  const v = String(s || "both").trim().toLowerCase();
  return INTERESTS.includes(v) ? v : "both";
}
export function isHoneypot(body) {
  return String((body && (body.website || body.company)) || "").trim() !== "";
}
export function clientIp(request) {
  return request.headers.get("cf-connecting-ip")
    || String(request.headers.get("x-forwarded-for") || "").split(",")[0].trim()
    || "0.0.0.0";
}
export function newToken(bytes = 24) {
  const b = new Uint8Array(bytes);
  crypto.getRandomValues(b);
  return [...b].map(x => x.toString(16).padStart(2, "0")).join("");
}
export function authorizedLister(request, env) {
  const auth = request.headers.get("authorization") || "";
  const m = /^Bearer\s+(\S+)/i.exec(auth);
  if (!m) return false;
  if (env.FOLLOW_LIST_SECRET && timingSafeEqual(String(env.FOLLOW_LIST_SECRET), m[1])) return true;
  return !!whoForApiKey(auth, env.RECIPE_API_KEYS);
}

export async function rateLimited(kv, ip, now = Date.now()) {
  const hour = new Date(now).toISOString().slice(0, 13);
  const key = `follow:rl:${ip}:${hour}`;
  const n = parseInt((await kv.get(key)) || "0", 10);
  if (n >= RATE_MAX) return true;
  await kv.put(key, String(n + 1), { expirationTtl: RATE_TTL });
  return false;
}

export async function readByEmail(kv, email) {
  const raw = await kv.get(`follow:email:${email}`);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}
export async function readByToken(kv, token) {
  if (!TOKEN_RE.test(token || "")) return null;
  const email = await kv.get(`follow:token:${token}`);
  return email ? readByEmail(kv, email) : null;
}

export async function save(kv, rec) {
  await kv.put(`follow:email:${rec.email}`, JSON.stringify(rec));
  await kv.put(`follow:token:${rec.token}`, rec.email);
  return rec;
}

export async function subscribe(kv, { email, interest, now = new Date() }) {
  const existing = await readByEmail(kv, email);
  const iso = now.toISOString();
  if (existing && existing.status !== "unsubscribed") {
    existing.interest = interest;
    existing.updated = iso;
    existing.status = "active";
    await save(kv, existing);
    return { rec: existing, already: true };
  }
  const rec = existing && existing.token
    ? { ...existing, interest, status: "active", updated: iso }
    : { email, interest, token: newToken(), created: iso, updated: iso, status: "active" };
  if (!rec.created) rec.created = iso;
  await save(kv, rec);
  return { rec, already: false };
}

export async function unsubscribe(kv, token, now = new Date()) {
  const rec = await readByToken(kv, token);
  if (!rec) return null;
  rec.status = "unsubscribed";
  rec.updated = now.toISOString();
  await save(kv, rec);
  return rec;
}

export async function setInterest(kv, token, interest, now = new Date()) {
  const rec = await readByToken(kv, token);
  if (!rec) return null;
  rec.interest = interest;
  rec.status = "active";
  rec.updated = now.toISOString();
  await save(kv, rec);
  return rec;
}

export async function listActive(kv, origin) {
  const out = [];
  let cursor;
  do {
    const page = await kv.list({ prefix: "follow:email:", cursor });
    for (const k of page.keys || []) {
      const rec = JSON.parse((await kv.get(k.name)) || "null");
      if (!rec || rec.status === "unsubscribed") continue;
      out.push({
        email: rec.email,
        interest: rec.interest || "both",
        created: rec.created,
        unsubscribe: `${origin}/api/unfollow?token=${rec.token}`,
      });
    }
    cursor = page.list_complete ? null : page.cursor;
  } while (cursor);
  out.sort((a, b) => String(a.created).localeCompare(String(b.created)));
  return out;
}

export async function readBody(request) {
  const ct = request.headers.get("content-type") || "";
  if (ct.includes("application/x-www-form-urlencoded") || ct.includes("multipart/form-data")) {
    try {
      const fd = await request.formData();
      return Object.fromEntries(fd.entries());
    } catch { return null; }
  }
  try { return await request.json(); } catch { return null; }
}

export function isFormPost(request) {
  const ct = request.headers.get("content-type") || "";
  return ct.includes("application/x-www-form-urlencoded") || ct.includes("multipart/form-data");
}

export function wantsHtml(request) {
  return isFormPost(request) || (request.headers.get("accept") || "").includes("text/html");
}
