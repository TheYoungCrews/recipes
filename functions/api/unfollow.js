// GET  /api/unfollow?token=  one-click unsubscribe, then a short page to change preference
// POST /api/unfollow         {token, action: "unsubscribe"|"update", interest?}
import { normalizeInterest, TOKEN_RE, readByToken, unsubscribe, setInterest, readBody, wantsHtml } from "../_lib/follow.js";

const json = (status, body) => Response.json(body, { status, headers: { "cache-control": "no-store" } });

export async function onRequestGet({ request, env }) {
  const token = new URL(request.url).searchParams.get("token") || "";
  if (!env.FOLLOW_KV) return page(request, "Follow isn't switched on yet.", null, { error: true });
  if (!TOKEN_RE.test(token)) return page(request, "That unsubscribe link isn't valid.", null, { error: true });
  const rec = await unsubscribe(env.FOLLOW_KV, token);
  if (!rec) return page(request, "That unsubscribe link isn't valid.", null, { error: true });
  if (!wantsHtml(request) && (request.headers.get("accept") || "").includes("application/json")) {
    return json(200, { ok: true, unsubscribed: true });
  }
  return page(request, "You're unsubscribed. If you'd rather stay on for just food, just cocktails, or both, pick one below.", token, { unsubscribed: true });
}

export async function onRequestPost({ request, env }) {
  if (!env.FOLLOW_KV) return json(503, { error: "Follow isn't switched on yet." });
  const body = await readBody(request) || {};
  const token = String(body.token || new URL(request.url).searchParams.get("token") || "");
  const action = String(body.action || "unsubscribe");
  if (!TOKEN_RE.test(token)) return finish(request, 400, { error: "That unsubscribe link isn't valid." }, token);
  if (action === "update") {
    const rec = await setInterest(env.FOLLOW_KV, token, normalizeInterest(body.interest));
    if (!rec) return finish(request, 404, { error: "That unsubscribe link isn't valid." }, token);
    return finish(request, 200, { ok: true, interest: rec.interest }, token, "You're back on the list. You can close this page.");
  }
  const rec = await unsubscribe(env.FOLLOW_KV, token);
  if (!rec) return finish(request, 404, { error: "That unsubscribe link isn't valid." }, token);
  return finish(request, 200, { ok: true, unsubscribed: true }, token, "You're unsubscribed.");
}

function finish(request, status, body, token, msg) {
  if (wantsHtml(request)) {
    if (body.error) return page(request, body.error, token, { error: true });
    return page(request, msg || "Saved.", token, body);
  }
  return json(status, body);
}

function page(request, message, token, state = {}) {
  const E = s => String(s || "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const form = token && (state.unsubscribed || state.ok || state.interest)
    ? `<form method="post" action="/api/unfollow" class="pills">
<input type="hidden" name="token" value="${E(token)}">
<input type="hidden" name="action" value="update">
<p class="sub">Stay on for:</p>
<div class="row">
<button name="interest" value="food">Food</button>
<button name="interest" value="cocktails">Cocktails</button>
<button name="interest" value="both">Both</button>
</div>
</form>`
    : "";
  const html = `<!doctype html><html lang=en><head><meta charset=utf-8><meta name=viewport content="width=device-width,initial-scale=1">
<title>Follow along · Crews &amp; Anna's Kitchen</title>
<meta name=theme-color content="#7f9a7a">
<link rel=icon type=image/png href="/icon-180.png">
<style>
@font-face{font-family:Hand;src:url(/caveat.woff2) format("woff2");font-weight:400 700;font-display:swap}
body{margin:0;font:16px/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;color:#2a2723;background:#fbf6ea;
background-image:linear-gradient(90deg,rgba(127,154,122,.10) 50%,transparent 50%),linear-gradient(rgba(127,154,122,.10) 50%,transparent 50%);background-size:28px 28px}
main{max-width:560px;margin:48px auto;padding:28px 22px;background:#fffdf6;border:1px solid #e9e1cf;border-radius:14px}
h1{font-family:Hand,cursive;font-size:36px;line-height:1.05;color:#4f6b4c;margin:0 0 10px}
p{margin:0 0 14px;color:#4b463e}
.sub{color:#7a7266;font-size:14px}
.row{display:flex;gap:8px;flex-wrap:wrap}
button{border:0;background:#7f9a7a;color:#fff;border-radius:999px;padding:10px 16px;font:700 15px -apple-system,sans-serif;cursor:pointer}
a{color:#4f6b4c}
footer{margin-top:22px;font-size:13px;color:#7a7266}
</style></head>
<body><main>
<h1>Follow along</h1>
<p>${E(message)}</p>
${form}
<footer><a href="/follow">Back to Follow along</a> · <a href="/">Crews &amp; Anna's Kitchen</a></footer>
</main></body></html>`;
  return new Response(html, { status: state.error ? 400 : 200, headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" } });
}
