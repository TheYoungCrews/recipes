// node --test _system/tests/notfound.test.mjs  The generated 404.html for missing paths.
import test from "node:test"; import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(fileURLToPath(new URL(".", import.meta.url)), "../..");
const py = (code) => execFileSync("python3", ["-c", `import sys, json, tempfile, pathlib, shutil\nsys.path.insert(0, "_system/scripts")\nimport site_render\n${code}`], { encoding: "utf8", cwd: root });

const live = [
  { title: "Zebra Cake", slug: "zebra-cake", type: "dessert", status: "to-try", body: "", tags: [], serves: "", time_minutes: "", rating: "", cooks: "0" },
  { title: "Aged Eggnog", slug: "aged-eggnog", type: "cocktail", status: "favorite", body: "", tags: [], serves: "", time_minutes: "", rating: "", cooks: "0" },
];

test("not_found_page writes a kitchen-styled 404.html with big type and a way home", () => {
  const html = py(`
d = pathlib.Path(tempfile.mkdtemp())
try:
    site_render.not_found_page(${JSON.stringify(live)}, d)
    print((d / "404.html").read_text())
finally:
    shutil.rmtree(d)
`);
  assert.match(html, /<title>Page not found · Crews &amp; Anna's Kitchen<\/title>/);
  assert.match(html, /name=robots content="noindex"/);
  assert.match(html, /<h1>It fell behind the stove<\/h1>/);
  assert.match(html, /We checked under the Dutch oven and behind the spice jars/);
  assert.match(html, /That page isn't in this kitchen/);
  assert.match(html, /href="\/">Back to the kitchen/);
  assert.match(html, /href="\/r\/">All recipes/);
  assert.match(html, /href="\/week\/">What’s Cooking/);
  assert.match(html, /href="\/r\/aged-eggnog">Aged Eggnog/);  // alphabetical fallback before the surprise script runs
  assert.match(html, /"s": "zebra-cake"/);
  assert.match(html, /id=surprise/);
  assert.match(html, /viewport-fit=cover/);
  assert.match(html, /font-size:22px/);
  assert.match(html, /font-family:Hand/);
  assert.match(html, /background-image:linear-gradient/);
  assert.match(html, /Crews &amp; Anna's Kitchen/);
  assert.doesNotMatch(html, /—/);
  assert.doesNotMatch(html, /pages\.dev/);
});
