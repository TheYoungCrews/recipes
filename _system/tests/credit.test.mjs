// node --test _system/tests/credit.test.mjs  Credit links, owner cell, hash redirects, OG tags.
import test from "node:test"; import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(fileURLToPath(new URL(".", import.meta.url)), "../..");
const py = (code) => execFileSync("python3", ["-c", `import sys, json\nsys.path.insert(0, "_system/scripts")\nimport credit, site_render\n${code}`], { encoding: "utf8", cwd: root });
const parse = (code) => JSON.parse(py(`print(json.dumps(${code}, default=str))`));

test("clean_url strips tracking params and trailing punctuation", () => {
  assert.equal(
    parse('credit.clean_url("https://www.instagram.com/reel/DfnfF-7Pz6p/?exln=dGVjMWltYnIzYmNo")'),
    "https://www.instagram.com/reel/DfnfF-7Pz6p/",
  );
  assert.equal(
    parse('credit.clean_url("https://www.instagram.com/p/XXXX/?igsh=abc&utm_source=ig")'),
    "https://www.instagram.com/p/XXXX/",
  );
});

test("credit prefers source_url over a URL in source, and strips quotes from the name", () => {
  const fm = {
    owner: '"@_happyhourharry_"',
    credit: '"Anders Erickson"',
    source: "https://www.instagram.com/reel/DfnfF-7Pz6p/?exln=junk",
    source_url: "https://www.youtube.com/watch?v=Eg7DLBgwJqM",
    source_type: "instagram",
  };
  const [text, href] = parse(`credit.credit(${JSON.stringify(fm)})`);
  assert.equal(text, "Anders Erickson");
  assert.equal(href, "https://www.youtube.com/watch?v=Eg7DLBgwJqM");
  const [label, ownerHref] = parse(`credit.facts_owner(${JSON.stringify(fm)})`);
  assert.equal(label, "Anders Erickson");
  assert.equal(ownerHref, href);
  assert.ok(!label.includes('"'));
});

test("facts_owner uses a clean handle (no quotes, no title-case) and links to the reel in source", () => {
  const fm = {
    owner: '"@_happyhourharry_"',
    credit: '"@_happyhourharry_"',
    source: "https://www.instagram.com/reel/DfnfF-7Pz6p/",
    source_type: "instagram",
  };
  const [label, href] = parse(`credit.facts_owner(${JSON.stringify(fm)})`);
  assert.equal(label, "@_happyhourharry_");
  assert.equal(href, "https://www.instagram.com/reel/DfnfF-7Pz6p/");
});

test("household owner cell stays short and unlinked even when a credit URL exists", () => {
  const fm = {
    owner: "anna+crews",
    credit: "Eat Yourself Skinny",
    source: "https://www.eatyourselfskinny.com/asian-ground-turkey-and-green-bean-stir-fry/",
    source_type: "web",
  };
  const [label, href] = parse(`credit.facts_owner(${JSON.stringify(fm)})`);
  assert.equal(label, "Both");
  assert.equal(href, null);
  const [ct, ch] = parse(`credit.credit(${JSON.stringify(fm)})`);
  assert.equal(ct, "Eat Yourself Skinny");
  assert.ok(ch.includes("eatyourselfskinny.com"));
});

test("facts_html links the owner name and does not title-case or quote the handle", () => {
  const r = {
    title: "The Fence Hopper",
    slug: "the-fence-hopper",
    type: "cocktail",
    status: "to-try",
    owner: "Anders Erickson",
    credit: "Anders Erickson",
    source: "https://www.instagram.com/reel/DfnfF-7Pz6p/",
    source_url: "https://www.youtube.com/watch?v=Eg7DLBgwJqM",
    time_minutes: "5",
    serves: "1",
    rating: "",
    cooks: "0",
    tags: [],
  };
  const html = py(`print(site_render.facts_html(${JSON.stringify(r)}))`);
  assert.match(html, /href="https:\/\/www\.youtube\.com\/watch\?v=Eg7DLBgwJqM"/);
  assert.match(html, />Anders Erickson<\/a>/);
  assert.doesNotMatch(html, /Happyhourharry|@_happyhourharry_|\"Anders/);
});

test("hash #r-<slug> becomes the canonical /r/<slug> path", () => {
  assert.equal(parse('credit.hash_redirect_path("#r-the-fence-hopper")'), "/r/the-fence-hopper");
  assert.equal(parse('credit.hash_redirect_path("#r-THE-FENCE-HOPPER")'), "/r/the-fence-hopper");
  assert.equal(parse('credit.hash_redirect_path("#r-airmail")'), "/r/airmail");
  assert.equal(parse('credit.hash_redirect_path("#top")'), "");
  assert.equal(parse('credit.hash_redirect_path("#r-")'), "");
  assert.equal(parse('credit.hash_redirect_path("")'), "");
  assert.equal(parse('credit.hash_redirect_path("#r-bad slug")'), "");
});

test("home page source redirects #r-slug and no longer writes that hash on card clicks", () => {
  const render = readFileSync(path.join(root, "_system/scripts/site_render.py"), "utf8");
  const app = readFileSync(path.join(root, "_system/web/app.js"), "utf8");
  assert.match(render, /HASH_REDIRECT_JS/);
  assert.match(render, /location\.replace\("\/r\/"/);
  assert.doesNotMatch(render, /Open in the kitchen/);
  assert.doesNotMatch(render, /href="\/#r-/);
  assert.doesNotMatch(app, /location\.hash\s*=\s*['"]r-/);
});

test("plain /r/<slug> pages have their own og title, description, canonical url and image", () => {
  const r = {
    title: "The Fence Hopper",
    slug: "the-fence-hopper",
    type: "cocktail",
    status: "to-try",
    owner: "Anders Erickson",
    credit: "Anders Erickson",
    source: "https://www.instagram.com/reel/DfnfF-7Pz6p/",
    source_url: "https://www.youtube.com/watch?v=Eg7DLBgwJqM",
    time_minutes: "5",
    serves: "1",
    rating: "",
    cooks: "0",
    tags: ["bourbon"],
    photo: "",
    body: "Anders Erickson's fall bourbon cocktail topped with IPA.\n\n## Original\n\n## Our version\n- [ ] bourbon (1 oz)\n\n1. Shake 1 oz bourbon with ice.\n",
  };
  const html = py(`print(site_render.recipe_page(${JSON.stringify(r)}, site_render.recipe_parts(${JSON.stringify(r)})))`);
  assert.match(html, /property="og:title" content="The Fence Hopper"/);
  assert.match(html, /property="og:url" content="https:\/\/blind-tiger\.pages\.dev\/r\/the-fence-hopper"/);
  assert.match(html, /rel=canonical href="https:\/\/blind-tiger\.pages\.dev\/r\/the-fence-hopper"/);
  assert.match(html, /property="og:image" content="https:\/\/blind-tiger\.pages\.dev\/og\.jpg"/);
  assert.match(html, /property="og:description" content="[^"]*Anders Erickson/);
  assert.doesNotMatch(html, /property="og:url" content="https:\/\/blind-tiger\.pages\.dev\/"/);
  assert.match(html, /class=facts/);
  assert.match(html, /href="https:\/\/www\.youtube\.com\/watch\?v=Eg7DLBgwJqM"/);
});
