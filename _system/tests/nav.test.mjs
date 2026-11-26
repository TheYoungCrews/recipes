// node --test _system/tests/nav.test.mjs  Home header links and the /cocktails/ list page.
import test from "node:test"; import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(fileURLToPath(new URL(".", import.meta.url)), "../..");
const py = (code) => execFileSync("python3", ["-c", `import sys, json, tempfile, pathlib, shutil\nsys.path.insert(0, "_system/scripts")\nimport site_render\n${code}`], { encoding: "utf8", cwd: root });

const drink = (type, slug, title) => ({
  title, slug, type, status: "to-try", owner: "crews", credit: "", source: "", source_url: "",
  time_minutes: "5", serves: "1", rating: "", cooks: "0", tags: [], photo: "",
  body: "A drink.\\n\\n## Original\\n\\n## Our version\\n- [ ] gin (2 oz)\\n\\n1. Stir with ice.\\n",
});
const cocktail = drink("cocktail", "aged-eggnog", "Aged Eggnog");
const mocktail = drink("mocktail", "lime-and-soda", "Lime and Soda");
const food = {
  title: "Soup", slug: "soup", type: "soup-bowl", status: "to-try", owner: "crews", credit: "",
  source: "", source_url: "", time_minutes: "30", serves: "2", rating: "", cooks: "0", tags: [], photo: "",
  body: "A soup.\\n\\n## Original\\n\\n## Our version\\n- [ ] onion\\n\\n1. Simmer.\\n",
};

test("home header source links recipes to /#kitchen and cocktails to /cocktails/", () => {
  const render = readFileSync(path.join(root, "_system/scripts/site_render.py"), "utf8");
  const css = readFileSync(path.join(root, "_system/web/style.css"), "utf8");
  assert.match(render, /<a href="\/#kitchen">\{len\(food\)\} recipes<\/a>/);
  assert.match(render, /<a href="\/cocktails\/">\{len\(bar\)\} cocktails<\/a>/);
  assert.match(render, /href="\/week\/">what.+s cooking<\/a>/);
  assert.match(render, /href="\/add">\+ add one<\/a>/);
  assert.match(render, /<h2 class=hand id=kitchen>The kitchen/);
  assert.match(render, /<section class=bar id=bar>/);
  assert.match(css, /#kitchen,#bar\{scroll-margin-top:16px\}/);
  // Old /#r-<slug> redirects stay limited to that pattern, so /#kitchen and /#bar are safe.
  assert.match(render, /HASH_REDIRECT_JS = '\(function\(\)\{var m=\/\^#r-/);
  assert.doesNotMatch(render.slice(render.indexOf("HASH_REDIRECT_JS"), render.indexOf("HASH_REDIRECT_JS") + 200), /#kitchen|#bar|#cocktails/);
  assert.doesNotMatch(render, /—/);
});

test("static_pages writes a /cocktails/ list, section ids on /r/, and a sitemap entry", () => {
  const out = py(`
import json
d = pathlib.Path(tempfile.mkdtemp())
try:
    site_render.static_pages(${JSON.stringify([food, cocktail, mocktail])}, d)
    print(json.dumps({
      "cocktails": (d / "cocktails" / "index.html").read_text(),
      "r": (d / "r" / "index.html").read_text(),
      "sitemap": (d / "sitemap.xml").read_text(),
      "recipe": (d / "r" / "soup.html").read_text(),
    }))
finally:
    shutil.rmtree(d)
`);
  const pages = JSON.parse(out);
  const { cocktails: c, r, sitemap, recipe } = pages;
  assert.match(c, /<title>Cocktails · Crews &amp; Anna's Kitchen<\/title>/);
  assert.match(c, /rel=canonical href="https:\/\/recipes\.crews\.fyi\/cocktails\/"/);
  assert.match(c, /<h1>Cocktails<\/h1>/);
  assert.match(c, /href="\/r\/aged-eggnog">Aged Eggnog</);
  assert.match(c, /href="\/r\/lime-and-soda">Lime and Soda</);
  assert.doesNotMatch(c, /href="\/r\/soup"/);
  assert.match(c, /data-week-slug="aged-eggnog"/);
  assert.match(c, /data-week-slug="lime-and-soda"/);
  assert.match(c, /href="\/r\/">All recipes</);
  assert.match(c, /href="\/week\/">/);
  assert.doesNotMatch(c, /—/);
  assert.doesNotMatch(c, /pages\.dev/);

  assert.match(r, /<h2 id=recipes>Recipes<\/h2>/);
  assert.match(r, /<h2 id=cocktails>Cocktails<\/h2>/);
  assert.match(r, /href="#recipes">\d+ recipes</);
  assert.match(r, /href="\/cocktails\/">\d+ cocktails</);
  assert.match(r, /href="\/cocktails\/">Cocktails</);

  assert.match(sitemap, /<loc>https:\/\/recipes\.crews\.fyi\/cocktails\/<\/loc>/);
  assert.match(recipe, /href="\/cocktails\/">Cocktails</);
});
