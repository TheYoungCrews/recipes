// node --test _system/tests/  Weekly plan helpers + /api/plan with mocked GitHub. Fake keys only; no network.
import test from "node:test"; import assert from "node:assert/strict";
import { isoWeek, mondayOf, pickWeek, editPlan, readPlan, newPlan, editHave } from "../../functions/_lib/plan.js";
import { commitPlanEdit } from "../../functions/_lib/github.js";
import { onRequestPost, onRequestGet } from "../../functions/api/plan.js";

test("iso weeks", () => {
  assert.deepEqual(isoWeek("2026-11-04"), { week: "2026-W45", starts: "2026-11-02" });
  assert.deepEqual(isoWeek("2027-01-01"), { week: "2026-W53", starts: "2026-12-28" });
  assert.equal(mondayOf("2026-W45"), "2026-11-02");
  assert.equal(mondayOf("2026-W01"), "2025-12-29");
});
test("pick week", () => {
  assert.deepEqual(pickWeek(["README.md", "2026-W44.md", "2026-W45.md"], "2026-11-03"), { week: "2026-W45", starts: "2026-11-02", exists: true });
  assert.equal(pickWeek(["2026-W45.md"], "2026-11-01").week, "2026-W45");          // Sunday before: upcoming
  assert.deepEqual(pickWeek(["2026-W40.md"], "2026-11-08"), { week: "2026-W46", starts: "2026-11-09", exists: false }); // Sunday: next week
  assert.deepEqual(pickWeek([], "2026-11-04"), { week: "2026-W45", starts: "2026-11-02", exists: false });
});
const PLAN = "---\nweek: 2026-W45\nstarts: 2026-11-02\nrecipes: [a, b]\nnights: [mon, wed]\nextras: [bread]\n---\nNote.\n";
test("edit plan", () => {
  let r = editPlan(PLAN, { action: "add", slug: "c" });
  assert.deepEqual(readPlan(r.md), { recipes: ["a", "b", "c"], nights: ["mon", "wed", "any"], extras: ["bread"], on_hand: [] });
  assert.ok(r.md.endsWith("---\nNote.\n"));
  r = editPlan(r.md, { action: "remove", slug: "a" });
  assert.deepEqual(readPlan(r.md), { recipes: ["b", "c"], nights: ["wed", "any"], extras: ["bread"], on_hand: [] });
  assert.equal(editPlan(PLAN, { action: "add", slug: "bread" }).changed, false);
  r = editPlan(PLAN, { action: "remove", slug: "bread" });
  assert.equal(r.as, "extra"); assert.deepEqual(readPlan(r.md).extras, []);
  r = editPlan(newPlan({ week: "2026-W46", starts: "2026-11-09" }), { action: "add", slug: "pie", as: "extra" });
  assert.deepEqual(readPlan(r.md), { recipes: [], nights: [], extras: ["pie"], on_hand: [] });
});

function fakeGit(files) {
  const calls = [];
  const fetchFn = async (url, init = {}) => {
    const p = url.replace("https://api.github.com/repos/o/r", ""), m = init.method || "GET";
    calls.push([m, p, init.body ? JSON.parse(init.body) : null]);
    const ok = b => new Response(JSON.stringify(b), { status: 200 });
    if (p.startsWith("/git/ref/")) return ok({ object: { sha: "h1" } });
    if (p.startsWith("/git/commits/")) return ok({ tree: { sha: "t0" } });
    if (p.startsWith("/contents/plans?")) return ok(Object.keys(files).filter(k => k.startsWith("plans/")).map(k => ({ name: k.slice(6) })));
    if (p.startsWith("/contents/")) { const f = p.slice(10).split("?")[0]; return files[f] != null ? ok({ content: Buffer.from(files[f]).toString("base64") }) : new Response("{}", { status: 404 }); }
    if (p === "/git/trees") return ok({ sha: "t1" });
    if (p === "/git/commits") return ok({ sha: "c1234567890" });
    if (p.startsWith("/git/refs/")) return ok({});
    return new Response("{}", { status: 500 });
  };
  return { fetchFn, calls };
}
test("commitPlanEdit: dinner vs extra by type, one path only", async () => {
  const g = fakeGit({ "plans/2026-W45.md": PLAN, "recipes/soup.md": "---\ntype: soup-bowl\n---\n", "recipes/loaf.md": "---\ntype: breakfast\n---\n" });
  const r = await commitPlanEdit({ token: "x", repo: "o/r", slug: "soup", action: "add", who: "anna", today: "2026-11-03", fetchFn: g.fetchFn });
  assert.equal(r.as, "dinner"); assert.equal(r.path, "plans/2026-W45.md");
  const tree = g.calls.find(c => c[1] === "/git/trees")[2].tree;
  assert.equal(tree.length, 1); assert.equal(tree[0].path, "plans/2026-W45.md");
  assert.match(g.calls.find(c => c[1] === "/git/commits")[2].message, /^plan: add soup to 2026-W45 \(anna via site\)$/);
  const r2 = await commitPlanEdit({ token: "x", repo: "o/r", slug: "loaf", action: "add", who: "anna", today: "2026-11-03", fetchFn: fakeGit({ "plans/2026-W45.md": PLAN, "recipes/loaf.md": "---\ntype: breakfast\n---\n" }).fetchFn });
  assert.equal(r2.as, "extra"); assert.deepEqual(r2.plan.extras, ["bread", "loaf"]);
  await assert.rejects(commitPlanEdit({ token: "x", repo: "o/r", slug: "nope", action: "add", who: "anna", today: "2026-11-03", fetchFn: g.fetchFn }), /unknown recipe/);
});
test("/api/plan needs auth", async () => {
  const env = { GITHUB_TOKEN: "x", RECIPE_API_KEYS: "anna=" + "a".repeat(32), SESSION_SECRET: "s".repeat(32) };
  const req = (h = {}) => new Request("https://x/api/plan", { method: "POST", headers: { "content-type": "application/json", ...h }, body: JSON.stringify({ slug: "soup", action: "add" }) });
  assert.equal((await onRequestPost({ request: req(), env })).status, 401);
  assert.equal((await onRequestPost({ request: req({ authorization: "Bearer wrong" }), env })).status, 401);
  assert.equal((await onRequestGet({ request: new Request("https://x/api/plan"), env })).status, 401);
  const bad = new Request("https://x/api/plan", { method: "POST", headers: { authorization: "Bearer " + "a".repeat(32) }, body: JSON.stringify({ slug: "../x", action: "add" }) });
  assert.equal((await onRequestPost({ request: bad, env })).status, 400);
});

test("have / unhave edit on_hand", () => {
  const md = PLAN.replace("extras: [bread]\n", "extras: [bread]\non_hand: [picanha]\n");
  let r = editHave(md, { action: "have", item: " Chicken  Stock " });
  assert.deepEqual(readPlan(r.md).on_hand, ["picanha", "chicken stock"]);
  assert.equal(editHave(r.md, { action: "have", item: "chicken stock" }).changed, false);
  r = editHave(r.md, { action: "unhave", item: "picanha" });
  assert.deepEqual(readPlan(r.md).on_hand, ["chicken stock"]); assert.ok(r.md.endsWith("Note.\n"));
  assert.deepEqual(readPlan(editHave(PLAN, { action: "have", item: "thyme" }).md).on_hand, ["thyme"]);   // no on_hand line yet
  assert.throws(() => editHave(PLAN, { action: "have", item: "a, b" }), /bad item/);
});
test("have: rapid checks retry on a moved branch, nothing lost", async () => {
  // Branch moves under us twice (409/422 on the ref update): each retry re-reads the latest file.
  let file = PLAN, head = 1, fails = 2, pendingTree = null;
  const fetchFn = async (url, init = {}) => {
    const p = url.replace("https://api.github.com/repos/o/r", ""), m = init.method || "GET";
    const ok = b => new Response(JSON.stringify(b), { status: 200 });
    if (p.startsWith("/git/ref/")) return ok({ object: { sha: "h" + head } });
    if (p.startsWith("/git/commits/")) return ok({ tree: { sha: "t" } });
    if (p.startsWith("/contents/plans?")) return ok([{ name: "2026-W45.md" }]);
    if (p.startsWith("/contents/plans/2026-W45.md")) return ok({ content: Buffer.from(file).toString("base64") });
    if (p === "/git/trees") { pendingTree = JSON.parse(init.body).tree[0].content; return ok({ sha: "t1" }); }
    if (p === "/git/commits") return ok({ sha: "c" + head });
    if (p.startsWith("/git/refs/")) {
      if (fails-- > 0) { file = editHave(file, { action: "have", item: "other" + fails }).md; head++; return new Response("{}", { status: 422 }); }
      file = pendingTree; head++; return ok({});
    }
    return new Response("{}", { status: 500 });
  };
  const r = await commitPlanEdit({ token: "x", repo: "o/r", item: "thyme", action: "have", who: "crews", today: "2026-11-03", fetchFn });
  assert.equal(r.changed, true);
  assert.deepEqual(readPlan(file).on_hand, ["other1", "other0", "thyme"]);
  const r2 = await commitPlanEdit({ token: "x", repo: "o/r", item: "thyme", action: "unhave", who: "crews", today: "2026-11-03", fetchFn });
  assert.deepEqual(readPlan(file).on_hand, ["other1", "other0"]); assert.equal(r2.changed, true);
});
test("/api/plan have needs auth and a clean item", async () => {
  const env = { GITHUB_TOKEN: "x", RECIPE_API_KEYS: "anna=" + "a".repeat(32), SESSION_SECRET: "s".repeat(32) };
  const mk = (body, h = {}) => new Request("https://x/api/plan", { method: "POST", headers: { "content-type": "application/json", ...h }, body: JSON.stringify(body) });
  assert.equal((await onRequestPost({ request: mk({ action: "have", item: "thyme" }), env })).status, 401);
  assert.equal((await onRequestPost({ request: mk({ action: "have", item: "x, [y]" }, { authorization: "Bearer " + "a".repeat(32) }), env })).status, 400);
});
