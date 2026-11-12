// node --test _system/tests/follow.test.mjs  /api/follow and /api/unfollow (mocked KV; no network, no mail).
import test from "node:test"; import assert from "node:assert/strict";
import { onRequestPost as followPost, onRequestGet as followGet } from "../../functions/api/follow.js";
import { onRequestGet as unfollowGet, onRequestPost as unfollowPost } from "../../functions/api/unfollow.js";

function memKV() {
  const m = new Map();
  return {
    async get(k) { return m.has(k) ? m.get(k) : null; },
    async put(k, v) { m.set(k, v); },
    async delete(k) { m.delete(k); },
    async list({ prefix, cursor }) {
      const keys = [...m.keys()].filter(k => k.startsWith(prefix)).map(name => ({ name }));
      return { keys, list_complete: true, cursor: undefined };
    },
    _map: m,
  };
}

const SECRET = "f".repeat(32);
const envOf = (kv) => ({ FOLLOW_KV: kv, FOLLOW_LIST_SECRET: SECRET, RECIPE_API_KEYS: "crews=" + "a".repeat(32) });

const post = (body, headers = {}, env, ip = "1.2.3.4") => followPost({
  request: new Request("https://blind-tiger.pages.dev/api/follow", {
    method: "POST",
    headers: { "content-type": "application/json", "cf-connecting-ip": ip, ...headers },
    body: JSON.stringify(body),
  }),
  env,
});
const list = (env, auth) => followGet({
  request: new Request("https://blind-tiger.pages.dev/api/follow", { headers: auth ? { authorization: auth } : {} }),
  env,
});

test("signup stores email and interest, list returns unfollow URL", async () => {
  const env = envOf(memKV());
  const r = await post({ email: "  Friend@Example.COM ", interest: "food" }, {}, env);
  assert.equal(r.status, 200);
  const b = await r.json();
  assert.equal(b.ok, true);
  assert.equal(b.already, false);
  assert.equal(b.interest, "food");
  assert.equal((await list(env)).status, 401);
  const listed = await (await list(env, "Bearer " + SECRET)).json();
  assert.equal(listed.count, 1);
  assert.equal(listed.subscribers[0].email, "friend@example.com");
  assert.equal(listed.subscribers[0].interest, "food");
  assert.match(listed.subscribers[0].unsubscribe, /^https:\/\/blind-tiger\.pages\.dev\/api\/unfollow\?token=[a-f0-9]+$/);
});

test("existing subscriber updates interest; honeypot and bad email are rejected", async () => {
  const env = envOf(memKV());
  await post({ email: "a@b.co", interest: "both" }, {}, env);
  const r = await post({ email: "a@b.co", interest: "cocktails" }, {}, env);
  assert.equal((await r.json()).already, true);
  const listed = await (await list(env, "Bearer " + SECRET)).json();
  assert.equal(listed.count, 1);
  assert.equal(listed.subscribers[0].interest, "cocktails");
  const bad = await post({ email: "not-an-email" }, {}, env);
  assert.equal(bad.status, 400);
  const honey = await post({ email: "bot@spam.com", website: "http://x" }, {}, env);
  assert.equal(honey.status, 200);
  assert.equal((await (await list(env, "Bearer " + SECRET)).json()).count, 1);
});

test("rate limit kicks in, and RECIPE_API_KEYS can list", async () => {
  const env = envOf(memKV());
  for (let i = 0; i < 8; i++) {
    const r = await post({ email: `n${i}@x.co` }, {}, env, "9.9.9.9");
    assert.equal(r.status, 200, await r.text());
  }
  assert.equal((await post({ email: "overflow@x.co" }, {}, env, "9.9.9.9")).status, 429);
  const listed = await (await list(env, "Bearer " + "a".repeat(32))).json();
  assert.equal(listed.count, 8);
});

test("GET unfollow removes the subscriber; POST update brings them back with a new preference", async () => {
  const env = envOf(memKV());
  await post({ email: "pal@x.co", interest: "both" }, {}, env);
  const unsub = (await (await list(env, "Bearer " + SECRET)).json()).subscribers[0].unsubscribe;
  const token = new URL(unsub).searchParams.get("token");
  const gone = await unfollowGet({
    request: new Request(unsub, { headers: { accept: "application/json" } }),
    env,
  });
  assert.equal(gone.status, 200);
  assert.equal((await gone.json()).unsubscribed, true);
  assert.equal((await (await list(env, "Bearer " + SECRET)).json()).count, 0);
  const back = await unfollowPost({
    request: new Request("https://blind-tiger.pages.dev/api/unfollow", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ token, action: "update", interest: "cocktails" }),
    }),
    env,
  });
  assert.equal(back.status, 200);
  const listed = await (await list(env, "Bearer " + SECRET)).json();
  assert.equal(listed.count, 1);
  assert.equal(listed.subscribers[0].interest, "cocktails");
});
