// node --test _system/tests/  (Node 20+). Mocked JWKS + GitHub; no network.
import test from "node:test"; import assert from "node:assert/strict";
import { verifyGoogleIdToken, whoFor, _resetCache } from "../../functions/_lib/auth.js";
import { applyCook, photoName, todayNY } from "../../functions/_lib/recipe.js";
import { commitCook } from "../../functions/_lib/github.js";

const CID = "test-client.apps.googleusercontent.com";
const b64u = b => Buffer.from(b).toString("base64url");
const kp = await crypto.subtle.generateKey({ name: "RSASSA-PKCS1-v1_5", modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: "SHA-256" }, true, ["sign", "verify"]);
const other = await crypto.subtle.generateKey({ name: "RSASSA-PKCS1-v1_5", modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: "SHA-256" }, true, ["sign", "verify"]);
const pub = await crypto.subtle.exportKey("jwk", kp.publicKey);
const jwksFetch = async () => new Response(JSON.stringify({ keys: [{ ...pub, kid: "k1" }] }), { headers: { "cache-control": "max-age=100" } });
const NOW = 1_800_000_000;
async function tok(claims = {}, { key = kp.privateKey, kid = "k1", alg = "RS256" } = {}) {
  const h = b64u(JSON.stringify({ alg, kid, typ: "JWT" }));
  const p = b64u(JSON.stringify({ iss: "https://accounts.google.com", aud: CID, exp: NOW + 600, iat: NOW, email: "Cook@Example.com", email_verified: true, ...claims }));
  const sig = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, new TextEncoder().encode(h + "." + p));
  return `${h}.${p}.${b64u(sig)}`;
}
const v = (t, cid = CID) => { _resetCache(); return verifyGoogleIdToken(t, cid, { fetchFn: jwksFetch, now: NOW }); };

test("valid token", async () => assert.equal((await v(await tok())).email, "cook@example.com"));
test("wrong signature", async () => assert.rejects(v(await tok({}, { key: other.privateKey })), /signature/));
test("wrong aud", async () => assert.rejects(v(await tok({ aud: "x" })), /audience/));
test("wrong iss", async () => assert.rejects(v(await tok({ iss: "evil.com" })), /issuer/));
test("expired", async () => assert.rejects(v(await tok({ exp: NOW - 3600 })), /expired/));
test("unverified email", async () => assert.rejects(v(await tok({ email_verified: false })), /verified/));
test("unknown kid", async () => assert.rejects(v(await tok({}, { kid: "zz" })), /unknown key/));
test("alg none", async () => assert.rejects(v(await tok({}, { alg: "none" })), /alg/));
test("tampered payload", async () => { const [h, , s] = (await tok()).split("."); const p = b64u(JSON.stringify({ iss: "accounts.google.com", aud: CID, exp: NOW + 600, email: "x@y.z", email_verified: true })); await assert.rejects(v(`${h}.${p}.${s}`), /signature/); });
test("no client id", async () => assert.rejects(v(await tok(), ""), /configured/));
test("allowlist map", () => {
  const env = "a@x.com=crews, B@y.com=anna";
  assert.equal(whoFor("a@x.com", env), "crews"); assert.equal(whoFor("b@y.com", env), "anna"); assert.equal(whoFor("c@z.com", env), null); assert.equal(whoFor("a@x.com", ""), null);
});

const MD = `---
title: Test Soup
slug: test-soup
status: to-try
last_made:
rating:
cooks:
---
A soup.

## Original
- 1 thing

## Notes
- 2026-10-01 (crews): old note.
`;
test("applyCook: to-try -> made, note newest first, photo before first heading", () => {
  const o = applyCook(MD, { date: "2026-10-14", who: "anna", rating: 4.5, note: "Great\n with  lime", photo: "photos/test-soup-2026-10-14.jpg" });
  assert.match(o, /^status: made$/m); assert.match(o, /^rating: 4.5$/m); assert.match(o, /^last_made: 2026-10-14$/m); assert.match(o, /^cooks: 1$/m);
  assert.match(o, /## Notes\n- 2026-10-14 \(anna via site, 4.5\/5\): Great with lime\n- 2026-10-01/);
  assert.match(o, /A soup\.\n\n!\[Made 2026-10-14\]\(photos\/test-soup-2026-10-14.jpg\)\n\n## Original/);
});
test("applyCook: 5 stars -> favorite, cooks increments, new photo goes first, no rating keeps rating", () => {
  let o = applyCook(MD.replace("cooks:", "cooks: 2").replace("A soup.", "A soup.\n\n![x](photos/old.jpg)"), { date: "2026-10-14", who: "crews", rating: 5, note: "", photo: "photos/new.jpg" });
  assert.match(o, /^status: favorite$/m); assert.match(o, /^cooks: 3$/m); assert.match(o, /\(crews via site, 5\/5\): cooked it\./);
  assert.ok(o.indexOf("photos/new.jpg") < o.indexOf("photos/old.jpg"));
  o = applyCook(o, { date: "2026-10-15", who: "crews", rating: null, note: "again" });
  assert.match(o, /^rating: 5$/m); assert.match(o, /\(crews via site\): again/);
});
test("applyCook: adds Notes section and missing fields", () => {
  const o = applyCook("---\ntitle: X\nstatus: made\n---\nBody\n", { date: "2026-10-14", who: "crews", rating: 3, note: "ok" });
  assert.match(o, /^cooks: 1$/m); assert.match(o, /## Notes\n- 2026-10-14 \(crews via site, 3\/5\): ok/);
});
test("photoName dedupes", () => assert.equal(photoName("s", "2026-10-14", new Set(["s-2026-10-14.jpg", "s-2026-10-14-2.jpg"])), "s-2026-10-14-3.jpg"));
test("todayNY uses New York date", () => assert.equal(todayNY(new Date("2026-10-15T02:30:00Z")), "2026-10-14"));

test("commitCook builds one commit with photo + recipe, retries on race", async () => {
  const calls = []; let patches = 0;
  const fetchFn = async (url, init = {}) => {
    const path = url.replace("https://api.github.com/repos/O/R", ""); const body = init.body ? JSON.parse(init.body) : null;
    calls.push([init.method || "GET", path, body]);
    assert.equal(init.headers.authorization, "Bearer T");
    const J = (o, s = 200) => new Response(JSON.stringify(o), { status: s });
    if (path === "/git/ref/heads/main") return J({ object: { sha: "HEAD" } });
    if (path === "/git/commits/HEAD") return J({ tree: { sha: "TREE" } });
    if (path.startsWith("/contents/recipes/test-soup.md")) return J({ content: Buffer.from(MD).toString("base64") });
    if (path.startsWith("/contents/recipes/photos")) return J([{ name: "test-soup-2026-10-14.jpg" }]);
    if (path === "/git/blobs") return J({ sha: "BLOB" });
    if (path === "/git/trees") return J({ sha: "NEWTREE" });
    if (path === "/git/commits") return J({ sha: "abcdef123" });
    if (path === "/git/refs/heads/main") return ++patches === 1 ? J({}, 422) : J({});
    return J({}, 404);
  };
  const r = await commitCook({ token: "T", repo: "O/R", slug: "test-soup", who: "anna", date: "2026-10-14", rating: 4, note: "yum", photoB64: "/9jAAA", fetchFn });
  assert.equal(r.photo, "photos/test-soup-2026-10-14-2.jpg"); assert.equal(patches, 2);
  const tree = calls.filter(c => c[1] === "/git/trees").at(-1)[2];
  assert.equal(tree.base_tree, "TREE");
  assert.deepEqual(tree.tree[0], { path: "recipes/photos/test-soup-2026-10-14-2.jpg", mode: "100644", type: "blob", sha: "BLOB" });
  assert.match(tree.tree[1].content, /\(anna via site, 4\/5\): yum/); assert.match(tree.tree[1].content, /photos\/test-soup-2026-10-14-2.jpg/);
  const c = calls.filter(c => c[1] === "/git/commits" && c[0] === "POST").at(-1)[2];
  assert.equal(c.message, "file: made test-soup (anna via site, 4/5)"); assert.deepEqual(c.parents, ["HEAD"]);
});
test("commitCook 404 for unknown slug", async () => {
  const fetchFn = async url => url.endsWith("/git/ref/heads/main") ? new Response('{"object":{"sha":"H"}}') : url.endsWith("/git/commits/H") ? new Response('{"tree":{"sha":"T"}}') : new Response("{}", { status: 404 });
  await assert.rejects(commitCook({ token: "T", repo: "O/R", slug: "nope", who: "crews", date: "2026-10-14", rating: 3, fetchFn }), e => e.status === 404);
});
