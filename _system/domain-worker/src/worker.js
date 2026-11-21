// recipes.crews.fyi -> https://blind-tiger.pages.dev (same path and query).
// The Pages origin stays at pages.dev; this Worker only gives the site a custom hostname.
const ORIGIN = "https://blind-tiger.pages.dev";
const ORIGIN_HOST = "blind-tiger.pages.dev";
const PUBLIC_HOST = "recipes.crews.fyi";

const HOP = new Set(["connection", "keep-alive", "proxy-authenticate", "proxy-authorization", "te", "trailer", "transfer-encoding", "upgrade", "host"]);

export function stripCookieDomain(cookie) {
  return String(cookie).split(";").filter((p) => !/^\s*domain\s*=/i.test(p)).join(";");
}

export function rewriteLocation(loc) {
  if (!loc) return loc;
  try {
    const u = new URL(loc, ORIGIN);
    if (u.hostname === ORIGIN_HOST) {
      u.protocol = "https:";
      u.hostname = PUBLIC_HOST;
      return u.toString();
    }
  } catch {}
  return loc;
}

function outboundHeaders(request) {
  const headers = new Headers();
  for (const [k, v] of request.headers) {
    if (!HOP.has(k.toLowerCase())) headers.set(k, v);
  }
  headers.set("X-Forwarded-Host", PUBLIC_HOST);
  headers.set("X-Forwarded-Proto", "https");
  return headers;
}

function inboundHeaders(resp) {
  const headers = new Headers(resp.headers);
  const loc = headers.get("Location");
  if (loc) headers.set("Location", rewriteLocation(loc));
  const cookies = typeof headers.getSetCookie === "function" ? headers.getSetCookie() : [];
  if (cookies.length) {
    headers.delete("Set-Cookie");
    for (const c of cookies) headers.append("Set-Cookie", stripCookieDomain(c));
  }
  return headers;
}

export default {
  async fetch(request) {
    const src = new URL(request.url);
    const dest = new URL(src.pathname + src.search, ORIGIN);
    const init = { method: request.method, headers: outboundHeaders(request), redirect: "manual" };
    if (request.method !== "GET" && request.method !== "HEAD") {
      init.body = request.body;
      init.duplex = "half";
    }
    const resp = await fetch(dest, init);
    return new Response(resp.body, { status: resp.status, statusText: resp.statusText, headers: inboundHeaders(resp) });
  },
};
