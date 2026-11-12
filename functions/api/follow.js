// POST /api/follow  {email, interest, website?}  public signup (website is a honeypot)
// GET  /api/follow  Bearer FOLLOW_LIST_SECRET or RECIPE_API_KEYS  -> subscriber list
import {
  validEmail, normalizeEmail, normalizeInterest, isHoneypot, clientIp,
  authorizedLister, rateLimited, subscribe, listActive, readBody, wantsHtml,
} from "../_lib/follow.js";

const json = (status, body) => Response.json(body, { status, headers: { "cache-control": "no-store" } });
const SITE = "https://blind-tiger.pages.dev";

function back(request, qs) {
  const url = new URL("/follow", request.url);
  for (const [k, v] of Object.entries(qs)) if (v != null) url.searchParams.set(k, v);
  return Response.redirect(url.toString(), 303);
}

export async function onRequestPost({ request, env }) {
  if (!env.FOLLOW_KV) return json(503, { error: "Follow isn't switched on yet." });
  const body = await readBody(request);
  if (!body || typeof body !== "object") return json(400, { error: "Send your email and a preference." });
  if (isHoneypot(body)) {
    // Pretend it worked so bots go away. Nothing is stored.
    return wantsHtml(request) ? back(request, { ok: "1" }) : json(200, { ok: true });
  }
  const email = normalizeEmail(body.email);
  const interest = normalizeInterest(body.interest);
  if (!validEmail(email)) {
    const error = "That email doesn't look right.";
    return wantsHtml(request) ? back(request, { err: "email" }) : json(400, { error });
  }
  if (await rateLimited(env.FOLLOW_KV, clientIp(request))) {
    const error = "Give it a minute, then try again.";
    return wantsHtml(request) ? back(request, { err: "slow" }) : json(429, { error });
  }
  const { rec, already } = await subscribe(env.FOLLOW_KV, { email, interest });
  if (wantsHtml(request)) return back(request, { ok: "1", interest: rec.interest });
  return json(200, { ok: true, already, interest: rec.interest });
}

export async function onRequestGet({ request, env }) {
  if (!authorizedLister(request, env)) return json(401, { error: "Pass a Bearer key to list subscribers." });
  if (!env.FOLLOW_KV) return json(503, { error: "Follow isn't switched on yet." });
  const origin = env.SITE_ORIGIN || SITE;
  const subscribers = await listActive(env.FOLLOW_KV, origin);
  return json(200, { site: origin, count: subscribers.length, subscribers });
}
