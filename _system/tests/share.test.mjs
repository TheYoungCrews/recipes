// node --test _system/tests/share.test.mjs  Share to story card: pure layout helpers in share.js, and where the buttons render.
import test from "node:test"; import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import vm from "node:vm";

const root = path.resolve(fileURLToPath(new URL(".", import.meta.url)), "../..");
const src = readFileSync(path.join(root, "_system/web/share.js"), "utf8");
const ctx = {}; vm.runInNewContext(src, ctx);   // no document here, so only the helpers load
const S = ctx.KSHARE;
const mono = (t) => t.length * 10;   // 10px per character

test("card is a 1080x1920 story", () => { assert.equal(S.W, 1080); assert.equal(S.H, 1920); });

test("wrapLines wraps on words and caps lines with an ellipsis", () => {
  assert.deepEqual([...S.wrapLines("Denver Steak with Brussels Sprouts", 120, mono)], ["Denver Steak", "with", "Brussels", "Sprouts"]);
  assert.deepEqual([...S.wrapLines("  one   two ", 100, mono)], ["one two"]);
  const capped = S.wrapLines("aa bb cc dd ee ff gg hh", 50, mono, 2);
  assert.equal(capped.length, 2);
  assert.match(capped[1], /\.\.\.$/);
  assert.ok(mono(capped[1]) <= 50);
  assert.deepEqual([...S.wrapLines("", 100, mono)], []);
});

test("fitTitle picks the biggest size that fits in the line limit", () => {
  const at = (t, s) => t.length * s * 0.5;
  const big = S.fitTitle("Pork Ramen", 1000, at, [190, 150, 100], 3);
  assert.equal(big.size, 190); assert.deepEqual([...big.lines], ["Pork Ramen"]);
  const long = S.fitTitle("Christmas Brown Butter Pecan Freezer Door Old Fashioned", 800, at, [150, 120, 90], 3);
  assert.ok(long.size < 150); assert.ok(long.lines.length <= 3);
  const never = S.fitTitle("Supercalifragilisticexpialidocious Soup Of The Day Again", 200, at, [150, 120], 2);
  assert.equal(never.size, 120); assert.ok(never.lines.length <= 2);
});

test("starParts and ratingLabel round to half stars", () => {
  assert.deepEqual([...S.starParts(4.5)], [1, 1, 1, 1, 0.5]);
  assert.deepEqual([...S.starParts("3")], [1, 1, 1, 0, 0]);
  assert.deepEqual([...S.starParts(7)], [1, 1, 1, 1, 1]);
  assert.deepEqual([...S.starParts("")], [0, 0, 0, 0, 0]);
  assert.equal(S.ratingLabel(4.5), "4.5/5");
  assert.equal(S.ratingLabel("5"), "5/5");
  assert.equal(S.ratingLabel(""), "");
});

test("shortNote trims at a word and keeps short notes whole", () => {
  assert.equal(S.shortNote("  Great   with rice. "), "Great with rice.");
  const n = S.shortNote("word ".repeat(60), 40);
  assert.ok(n.length <= 40); assert.match(n, /^word( word)*\.\.\.$/);
  assert.equal(S.shortNote(""), "");
});

test("fileName is a safe png name", () => {
  assert.equal(S.fileName("pork-ramen"), "blind-tiger-pork-ramen.png");
  assert.equal(S.fileName("../Bad Slug!"), "blind-tiger-bad-slug.png");
  assert.equal(S.fileName(""), "blind-tiger-recipe.png");
});

test("recipeUrl is the full plain page link", () => {
  assert.equal(S.recipeUrl("pork-ramen"), "https://blind-tiger.pages.dev/r/pork-ramen");
  assert.equal(S.recipeUrl("a b"), "https://blind-tiger.pages.dev/r/a%20b");
});

test("a tap copies the link first, synchronously, then shares", () => {
  const go = src.slice(src.indexOf("async function go"), src.indexOf("function wire"));
  const copy = go.indexOf("copyLink(b)"), firstAwait = go.indexOf("await"), share = go.indexOf("navigator.share");
  assert.ok(copy > 0 && copy < firstAwait && copy < share);
  assert.match(src, /navigator\.clipboard\.writeText\(url\)/);
  assert.match(src, /execCommand\("copy"\)/);
  assert.match(src, /Link copied/);
});

test("card footer shows the recipe's stars and made count, or nothing", () => {
  assert.equal(S.madeLabel(0), ""); assert.equal(S.madeLabel("1"), "Made once"); assert.equal(S.madeLabel(3), "Made 3 times");
  const both = S.footerParts("4.5", "3", false);
  assert.deepEqual([...both.stars], [1, 1, 1, 1, 0.5]); assert.equal(both.text, "4.5/5  \u00B7  Made 3 times");
  assert.equal(S.footerParts("5", "", false).text, "5/5");
  const made = S.footerParts("", "2", false); assert.equal(made.stars, null); assert.equal(made.text, "Made 2 times");
  assert.equal(S.footerParts("", "0", false), null);
  assert.equal(S.footerParts("", "", false), null);
  // right after rating the new stars are up top, so the footer is only the made count
  const after = S.footerParts("4", "2", true); assert.equal(after.stars, null); assert.equal(after.text, "Made 2 times");
  assert.equal(S.footerParts("4", "", true), null);
});

test("coverBox center-crops like object-fit: cover", () => {
  const b = S.coverBox(2000, 1000, 500, 500);
  assert.equal(b.sw, 1000); assert.equal(b.sh, 1000); assert.equal(b.sx, 500); assert.equal(b.sy, 0);
});

test("share flow uses the file share sheet with a download and press-to-save fallback", () => {
  assert.match(src, /navigator\.canShare\(\{ files: \[f\] \}\)/);
  assert.match(src, /navigator\.share\(\{ files: \[f\]/);
  assert.match(src, /a\.download = f\.name/);
  assert.match(src, /Press and hold the card/);
  assert.doesNotMatch(src, /fillText\("blind-tiger/);   // the domain is no longer drawn on the card
  assert.doesNotMatch(src, /\u2014/);   // no em dashes
});

test("recipe pages and the home view render a Share to story button and load share.js", () => {
  const py = (code) => execFileSync("python3", ["-c", `import sys, json\nsys.path.insert(0, "_system/scripts")\nimport site_render\n${code}`], { encoding: "utf8", cwd: root });
  const r = { title: "Pork Ramen", slug: "pork-ramen", type: "main", status: "made", owner: "crews", credit: "", source: "", source_url: "",
    time_minutes: "30", serves: "2", rating: "4", cooks: "1", tags: [], photo: "photos/pork-ramen.jpg",
    body: "## Original\n\n## Our version\n- [ ] ramen noodles (2 packs)\n\n1. Boil the noodles.\n" };
  const page = py(`print(site_render.recipe_page(${JSON.stringify(r)}, site_render.recipe_parts(${JSON.stringify(r)})))`);
  assert.match(page, /<button type=button class=sharebtn data-share="pork-ramen" data-title="Pork Ramen" data-photo="\/photos\/pork-ramen\.jpg" data-rating="4" data-cooks="1" hidden>Share to story<\/button>/);
  assert.match(page, /<script src="\/share\.js" defer><\/script>/);
  assert.match(page, /\.sharebtn\{/);
  const view = py(`print(site_render.recipe_view(${JSON.stringify(r)}, set()))`);
  assert.match(view, /class=sharebtn data-share="pork-ramen"/);
  assert.match(page, /data-rating="4" data-cooks="1" hidden>/);
  const noPhoto = py(`print(site_render.share_btn(${JSON.stringify({ ...r, photo: "" })}))`);
  assert.doesNotMatch(noPhoto, /data-photo/);
  const fresh = py(`print(site_render.share_btn(${JSON.stringify({ ...r, rating: "", cooks: "0" })}))`);
  assert.doesNotMatch(fresh, /data-rating|data-cooks/);
  const app = readFileSync(path.join(root, "_system/web/app.js"), "utf8");
  assert.match(app, /shareAfter\(j\.who\)/);
  assert.match(app, /KSHARE\.wire\(b\)/);
});
