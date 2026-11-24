// node --test _system/tests/search.test.mjs  Home page search: title/ingredient match, signed-out, no AI.
import test from "node:test"; import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { scoreItem, searchItems } from "../web/search.js";

const root = path.resolve(fileURLToPath(new URL(".", import.meta.url)), "../..");
const items = [
  {title:"Rye Toast", slug:"rye-toast", ingredients:["bread","butter"], tags:["breakfast"], cuisine:"", spirit:""},
  {title:"Manhattan", slug:"manhattan", ingredients:["rye","sweet vermouth","angostura bitters"], tags:["stirred"], cuisine:"", spirit:"rye"},
  {title:"Chicken Noodle Bowl", slug:"chicken-noodle-bowl", ingredients:["chicken","noodles"], tags:["weeknight-30"], cuisine:"", spirit:""},
  {title:"Bistek", slug:"bistek", ingredients:["sirloin steak","lemon juice"], tags:["filipino","beef"], cuisine:"filipino", spirit:""},
  {title:"Freezer Door Spiced Cranberry Paper Plane", slug:"paper-plane", ingredients:["bourbon","aperol","amaro nonino"], tags:[], cuisine:"", spirit:"bourbon"},
];

test("title matches rank ahead of ingredient or spirit matches", () => {
  assert.deepEqual(searchItems(items, "rye").map(r => r.slug), ["rye-toast", "manhattan"]);
  assert.equal(scoreItem(items[0], "rye"), 2);
  assert.equal(scoreItem(items[1], "rye"), 1);
});

test("ingredient, tag, cuisine, and spirit matches work, case-insensitive", () => {
  assert.deepEqual(searchItems(items, "CHICKEN").map(r => r.slug), ["chicken-noodle-bowl"]);
  assert.deepEqual(searchItems(items, "sweet vermouth").map(r => r.slug), ["manhattan"]);
  assert.deepEqual(searchItems(items, "Filipino").map(r => r.slug), ["bistek"]);
  assert.ok(searchItems(items, "bourbon").some(r => r.slug === "paper-plane"));
  assert.deepEqual(searchItems(items, "paper plane").map(r => r.slug), ["paper-plane"]);
});

test("empty query returns the original list, in order", () => {
  assert.deepEqual(searchItems(items, "   ").map(r => r.slug), items.map(r => r.slug));
  assert.deepEqual(searchItems(items, "xyz-nothing"), []);
});

test("home search works signed out and does not call the network", () => {
  const app = readFileSync(path.join(root, "_system/web/app.js"), "utf8");
  const kitchen = app.slice(0, app.indexOf("// ---- Sign-in"));
  assert.doesNotMatch(kitchen, /\/api\/ask|ASK_BACKEND|ASK_AI|localAsk|asksign|signedIn|Sign in/);
  assert.match(kitchen, /scoreItem/);
  assert.match(kitchen, /Escape/);
  assert.match(kitchen, /qclear/);
  assert.equal(kitchen.includes("fetch("), false);
  const ask = readFileSync(path.join(root, "functions/api/ask.js"), "utf8");
  assert.doesNotMatch(ask, /mode === "search"|mode:"search"/);
  const render = readFileSync(path.join(root, "_system/scripts/site_render.py"), "utf8");
  assert.doesNotMatch(render, /from the pantry|a drink for two|asksign|sign in to ask|Ask the kitchen/);
  assert.match(render, /aria-label="Search recipes and cocktails"/);
  assert.match(render, /id=qclear/);
  assert.match(render, /search\.js/);
});
