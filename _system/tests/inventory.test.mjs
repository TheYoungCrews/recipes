// node --test _system/tests/inventory.test.mjs
import test from "node:test"; import assert from "node:assert/strict";
import {
  matches, invMatch, parseLine, checklist, proposeRemovals, applySelectedRemovals,
  applyAdd, applyExactRemove, inferSection, isStaple, stapleNames, okInvItem
} from "../../functions/_lib/inventory.js";

const STAPLES = `- salt
- black pepper
- garlic
- onion
- butter
- eggs
- milk
- olive oil
- honey
- parmesan
`;

const INV = `# Inventory

## Pantry: produce
- butternut squash
- gold potatoes

## Fridge
- picanha steaks (2, for Friday)
- carrots
- jalapeño
- heavy cream
- butter (Kerrygold)
- eggs
- Greek yogurt
`;

const SOUP = `---
title: Squash Soup
---

## Our version
- [x] 1 butternut squash, about 2 pounds
- [x] 1 cup chopped onion
- [x] 1½ teaspoons chopped garlic
- [ ] ½ cup thinly sliced carrot
- [x] ½ teaspoon salt
- [x] ½ teaspoon black pepper
- [ ] 1 tablespoon finely minced jalapeño pepper
- [ ] ¼ cup heavy cream
- [ ] Crème fraîche or Greek yogurt (amount not given)
`;

test("matches: descriptors before, not coconut milk vs milk", () => {
  assert.equal(matches("broccolini", "broccolini"), true);
  assert.equal(matches("fresh thyme", "thyme"), true);
  assert.equal(matches("Yukon Gold potatoes", "gold potatoes"), true);
  assert.equal(matches("coconut milk", "milk"), false);
  assert.equal(matches("rice vinegar", "rice"), false);
  assert.equal(matches("whole milk", "milk"), true);
});

test("invMatch: jalapeño pepper and unicode", () => {
  assert.equal(invMatch("finely minced jalapeño pepper", "jalapeño"), true);
  assert.equal(invMatch("jalapeno", "jalapeño"), true);
  assert.equal(invMatch("picanha steaks", "picanha steaks"), true);
  assert.equal(invMatch("1 picanha steak", "picanha steaks"), true);
  assert.equal(invMatch("black pepper", "jalapeño"), false);
  assert.equal(invMatch("red pepper flakes", "jalapeño"), false);
});

test("parseLine amounts", () => {
  const a = parseLine("1 butternut squash, about 2 pounds");
  assert.equal(a.qty, 1); assert.equal(a.kind, "count"); assert.equal(a.name, "butternut squash");
  const b = parseLine("½ cup thinly sliced carrot");
  assert.equal(b.kind, "v"); assert.equal(b.unit, "cup"); assert.equal(b.qty, 0.5); assert.match(b.name, /carrot/);
  const c = parseLine("1 tablespoon finely minced jalapeño pepper");
  assert.equal(c.kind, "v"); assert.equal(c.unit, "tablespoon"); assert.equal(c.qty, 1);
  const d = parseLine("2 picanha steaks");
  assert.equal(d.kind, "count"); assert.equal(d.qty, 2); assert.equal(d.name, "picanha steaks");
});

test("proposeRemovals: squash soup, whole vs partial vs staples", () => {
  const p = proposeRemovals(INV, SOUP, STAPLES);
  const by = Object.fromEntries(p.map(x => [x.name.toLowerCase(), x]));
  assert.ok(by["butternut squash"]); assert.equal(by["butternut squash"].suggested, true);
  assert.ok(by["jalapeño"]); assert.equal(by["jalapeño"].suggested, false);
  assert.match(by["jalapeño"].reason, /tablespoon|tbsp/i);
  assert.ok(by["carrots"]); assert.equal(by["carrots"].suggested, false);
  assert.match(by["carrots"].reason, /½ cup|1\/2 cup|0\.5 cup/i);
  assert.ok(by["heavy cream"]); assert.equal(by["heavy cream"].suggested, false);
  assert.ok(by["greek yogurt"]); assert.equal(by["greek yogurt"].suggested, false);
  assert.equal(by["butter"], undefined);
  assert.equal(by["eggs"], undefined);
  assert.equal(by["gold potatoes"], undefined);
  assert.equal(by.onion, undefined);
  assert.equal(by.garlic, undefined);
});

test("applySelectedRemovals: defaults drop whole squash, leave partials", () => {
  const proposed = proposeRemovals(INV, SOUP, STAPLES);
  const r = applySelectedRemovals(INV, proposed, null);
  assert.equal(r.changed, true);
  assert.deepEqual(r.removed, ["butternut squash"]);
  assert.match(r.md, /^- carrots$/m);
  assert.match(r.md, /^- jalapeño$/m);
  assert.match(r.md, /^- heavy cream$/m);
  assert.doesNotMatch(r.md, /butternut squash/);
});

test("applySelectedRemovals: user can mark jalapeño used up and keep squash", () => {
  const proposed = proposeRemovals(INV, SOUP, STAPLES);
  const r = applySelectedRemovals(INV, proposed, ["jalapeño"]);
  assert.deepEqual(r.removed, ["jalapeño"]);
  assert.match(r.md, /butternut squash/);
  assert.doesNotMatch(r.md, /jalapeño/);
});

test("applySelectedRemovals: empty list touches nothing; extras ignored", () => {
  const proposed = proposeRemovals(INV, SOUP, STAPLES);
  const r = applySelectedRemovals(INV, proposed, []);
  assert.equal(r.changed, false);
  const r2 = applySelectedRemovals(INV, proposed, ["gateau basque", "gold potatoes"]);
  assert.equal(r2.changed, false);
});

test("count subtract: 1 of 2 steaks left, 2 of 2 removed", () => {
  const rec1 = "## Our version\n- [ ] 1 picanha steak\n";
  const rec2 = "## Our version\n- [ ] 2 picanha steaks\n";
  const p1 = proposeRemovals(INV, rec1, STAPLES);
  const hit = p1.find(x => x.name === "picanha steaks");
  assert.ok(hit); assert.equal(hit.suggested, true); assert.equal(hit.op, "subtract"); assert.equal(hit.by, 1);
  const a = applySelectedRemovals(INV, p1, null);
  assert.match(a.md, /^- picanha steaks \(1, for Friday\)$/m);
  assert.deepEqual(a.subtracted.map(s => s.left), [1]);
  const p2 = proposeRemovals(INV, rec2, STAPLES);
  const b = applySelectedRemovals(INV, p2, null);
  assert.doesNotMatch(b.md, /picanha/);
  assert.deepEqual(b.removed, ["picanha steaks"]);
});

test("weight against a no-count line stays (do not invent)", () => {
  const rec = "## Our version\n- [ ] 1 lb gold potatoes\n";
  const p = proposeRemovals(INV, rec, STAPLES);
  const hit = p.find(x => x.name === "gold potatoes");
  assert.ok(hit); assert.equal(hit.suggested, false);
  const r = applySelectedRemovals(INV, p, null);
  assert.match(r.md, /^- gold potatoes$/m);
});

test("inferSection and applyAdd, skip staples and duplicates", () => {
  assert.equal(inferSection("cremini mushrooms"), "Fridge");
  assert.equal(inferSection("gold potatoes"), "Pantry: produce");
  assert.equal(inferSection("feta"), "Fridge");
  assert.equal(inferSection("frozen peas"), "Freezer");
  assert.equal(inferSection("mystery widget"), "New");
  const r = applyAdd(INV, ["cremini mushrooms", "salt", "gold potatoes", "mystery widget"], STAPLES);
  assert.deepEqual(r.added.map(a => a.name), ["cremini mushrooms", "mystery widget"]);
  assert.deepEqual(r.skipped_staples, ["salt"]);
  assert.deepEqual(r.already, ["gold potatoes"]);
  assert.match(r.md, /## Fridge[\s\S]*- cremini mushrooms/);
  assert.match(r.md, /## New\n- mystery widget/);
  const r2 = applyAdd(r.md, ["Cremini mushrooms"], STAPLES);
  assert.equal(r2.changed, false);
});

test("unhave removes only an exact name, not a fuzzy cousin", () => {
  const r = applyExactRemove(INV, ["picanha steaks"]);
  assert.doesNotMatch(r.md, /picanha/);
  const r2 = applyExactRemove(INV, ["yukon gold potato"]);
  assert.equal(r2.changed, false);
  assert.match(r2.md, /gold potatoes/);
});

test("okInvItem rejects markup, allows apostrophes", () => {
  assert.equal(okInvItem("cremini mushrooms"), true);
  assert.equal(okInvItem("Trader Joe's lentils"), true);
  assert.equal(okInvItem("a, b"), false);
  assert.equal(okInvItem(""), false);
  assert.ok(isStaple("butter (Kerrygold)", stapleNames(STAPLES)));
});

test("checklist reads Our version boxes and skips headings", () => {
  const lines = checklist(SOUP);
  assert.ok(lines.some(l => /butternut squash/.test(l)));
  assert.ok(!lines.some(l => l.startsWith("#")));
});

import { commitCook, commitPlanEdit, commitInventoryEdit, readInventoryPreview } from "../../functions/_lib/github.js";
import { onRequestGet, onRequestPost } from "../../functions/api/inventory.js";
const RECIPE = SOUP;

function fakeGit(files) {
  const calls = [];
  const fetchFn = async (url, init = {}) => {
    const p = url.replace("https://api.github.com/repos/o/r", ""), m = init.method || "GET";
    calls.push([m, p, init.body ? JSON.parse(init.body) : null]);
    const ok = b => new Response(JSON.stringify(b), { status: 200 });
    if (p.startsWith("/git/ref/")) return ok({ object: { sha: "h1" } });
    if (p.startsWith("/git/commits/")) return ok({ tree: { sha: "t0" } });
    if (p.startsWith("/contents/plans?")) return ok(Object.keys(files).filter(k => k.startsWith("plans/")).map(k => ({ name: k.slice(6) })));
    if (p.startsWith("/contents/")) {
      const f = p.slice(10).split("?")[0];
      return files[f] != null ? ok({ content: Buffer.from(files[f]).toString("base64") }) : new Response("{}", { status: 404 });
    }
    if (p === "/git/trees") return ok({ sha: "t1" });
    if (p === "/git/commits") return ok({ sha: "c1234567890" });
    if (p.startsWith("/git/refs/")) return ok({});
    return new Response("{}", { status: 500 });
  };
  return { fetchFn, calls };
}

test("commitCook includes inventory in the same commit when squash is used up", async () => {
  const g = fakeGit({
    "recipes/squash-soup.md": RECIPE,
    "kitchen/inventory.md": INV,
    "kitchen/staples.md": STAPLES
  });
  const r = await commitCook({ token: "x", repo: "o/r", slug: "squash-soup", who: "crews", date: "2026-11-09", rating: 5, note: "good", fetchFn: g.fetchFn });
  assert.deepEqual(r.inventory.removed, ["butternut squash"]);
  const tree = g.calls.find(c => c[1] === "/git/trees")[2].tree;
  assert.equal(tree.some(x => x.path === "recipes/squash-soup.md"), true);
  const inv = tree.find(x => x.path === "kitchen/inventory.md");
  assert.ok(inv); assert.doesNotMatch(inv.content, /butternut squash/); assert.match(inv.content, /carrots/);
  assert.match(g.calls.find(c => c[1] === "/git/commits")[2].message, /inventory: used butternut squash/);
});

test("commitCook respects an explicit remove list", async () => {
  const g = fakeGit({ "recipes/squash-soup.md": RECIPE, "kitchen/inventory.md": INV, "kitchen/staples.md": STAPLES });
  const r = await commitCook({ token: "x", repo: "o/r", slug: "squash-soup", who: "crews", date: "2026-11-09", rating: 4, note: "", remove: ["jalapeño"], fetchFn: g.fetchFn });
  assert.deepEqual(r.inventory.removed, ["jalapeño"]);
  const inv = g.calls.find(c => c[1] === "/git/trees")[2].tree.find(x => x.path === "kitchen/inventory.md");
  assert.match(inv.content, /butternut squash/);
  assert.doesNotMatch(inv.content, /jalapeño/);
});

test("commitCook with empty remove list leaves inventory alone", async () => {
  const g = fakeGit({ "recipes/squash-soup.md": RECIPE, "kitchen/inventory.md": INV, "kitchen/staples.md": STAPLES });
  const r = await commitCook({ token: "x", repo: "o/r", slug: "squash-soup", who: "crews", date: "2026-11-09", rating: 4, remove: [], fetchFn: g.fetchFn });
  assert.deepEqual(r.inventory.removed, []);
  assert.equal(g.calls.find(c => c[1] === "/git/trees")[2].tree.some(x => x.path === "kitchen/inventory.md"), false);
});

test("commitPlanEdit have adds to inventory, unhave removes the exact line", async () => {
  const plan = "---\nweek: 2026-W46\nstarts: 2026-11-09\nrecipes: [a]\nnights: [any]\nextras: []\non_hand: []\n---\n";
  const g = fakeGit({ "plans/2026-W46.md": plan, "kitchen/inventory.md": INV, "kitchen/staples.md": STAPLES });
  const r = await commitPlanEdit({ token: "x", repo: "o/r", item: "cremini mushrooms", action: "have", who: "crews", today: "2026-11-09", fetchFn: g.fetchFn });
  assert.equal(r.changed, true);
  assert.deepEqual(r.plan.on_hand, ["cremini mushrooms"]);
  assert.deepEqual((r.inventory.added || []).map(a => a.name), ["cremini mushrooms"]);
  const inv = g.calls.find(c => c[1] === "/git/trees")[2].tree.find(x => x.path === "kitchen/inventory.md");
  assert.match(inv.content, /cremini mushrooms/);
});

test("commitPlanEdit unhave removes the exact inventory line", async () => {
  const plan = "---\nweek: 2026-W46\nstarts: 2026-11-09\nrecipes: [a]\nnights: [any]\nextras: []\non_hand: [cremini mushrooms]\n---\n";
  const inv = INV.replace("## Fridge\n", "## Fridge\n- cremini mushrooms\n");
  const g = fakeGit({ "plans/2026-W46.md": plan, "kitchen/inventory.md": inv, "kitchen/staples.md": STAPLES });
  const r = await commitPlanEdit({ token: "x", repo: "o/r", item: "cremini mushrooms", action: "unhave", who: "crews", today: "2026-11-09", fetchFn: g.fetchFn });
  assert.deepEqual(r.inventory.removed, ["cremini mushrooms"]);
  const file = g.calls.find(c => c[1] === "/git/trees")[2].tree.find(x => x.path === "kitchen/inventory.md");
  assert.doesNotMatch(file.content, /cremini mushrooms/);
});

test("commitPlanEdit have skips staples", async () => {
  const plan = "---\nweek: 2026-W46\nstarts: 2026-11-09\nrecipes: [a]\nnights: [any]\n---\n";
  const g = fakeGit({ "plans/2026-W46.md": plan, "kitchen/inventory.md": INV, "kitchen/staples.md": STAPLES });
  const r = await commitPlanEdit({ token: "x", repo: "o/r", item: "salt", action: "have", who: "crews", today: "2026-11-09", fetchFn: g.fetchFn });
  assert.deepEqual(r.inventory.skipped_staples, ["salt"]);
  const tree = g.calls.find(c => c[1] === "/git/trees")[2].tree;
  assert.equal(tree.some(x => x.path === "kitchen/inventory.md"), false);
});

test("commitInventoryEdit add and no-op on duplicate", async () => {
  const g = fakeGit({ "kitchen/inventory.md": INV, "kitchen/staples.md": STAPLES });
  const r = await commitInventoryEdit({ token: "x", repo: "o/r", items: ["Lentils", "salt"], action: "add", who: "crews", via: "api", fetchFn: g.fetchFn });
  assert.equal(r.changed, true);
  assert.deepEqual(r.added.map(a => a.name), ["Lentils"]);
  assert.deepEqual(r.skipped_staples, ["salt"]);
  const r2 = await commitInventoryEdit({ token: "x", repo: "o/r", items: ["gold potatoes"], action: "add", who: "crews", fetchFn: g.fetchFn });
  assert.equal(r2.changed, false);
});

test("/api/inventory needs auth", async () => {
  const env = { GITHUB_TOKEN: "x", RECIPE_API_KEYS: "crews=" + "a".repeat(32), SESSION_SECRET: "s".repeat(32) };
  const get = new Request("https://x/api/inventory?slug=squash-soup");
  assert.equal((await onRequestGet({ request: get, env })).status, 401);
  const post = new Request("https://x/api/inventory", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ items: ["Lentils"], action: "add" }) });
  assert.equal((await onRequestPost({ request: post, env })).status, 401);
  const bad = new Request("https://x/api/inventory", { method: "POST", headers: { authorization: "Bearer " + "a".repeat(32), "content-type": "application/json" }, body: JSON.stringify({ items: ["x, [y]"], action: "add" }) });
  assert.equal((await onRequestPost({ request: bad, env })).status, 400);
});

test("readInventoryPreview lists squash soup suggestions", async () => {
  const g = fakeGit({ "recipes/squash-soup.md": RECIPE, "kitchen/inventory.md": INV, "kitchen/staples.md": STAPLES });
  const r = await readInventoryPreview({ token: "x", repo: "o/r", slug: "squash-soup", fetchFn: g.fetchFn });
  const squash = r.items.find(i => i.name === "butternut squash");
  assert.equal(squash.suggested, true);
});
