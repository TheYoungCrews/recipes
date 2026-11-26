// node --test _system/tests/thanksgiving.test.mjs  Thanksgiving drinks menu page.
import test from "node:test"; import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(fileURLToPath(new URL(".", import.meta.url)), "../..");
const py = (code) => execFileSync("python3", ["-c", `import sys, json, tempfile, pathlib, shutil\nsys.path.insert(0, "_system/scripts")\nimport site_render\n${code}`], { encoding: "utf8", cwd: root });

test("home header does not link to the Thanksgiving drinks page", () => {
  const render = readFileSync(path.join(root, "_system/scripts/site_render.py"), "utf8");
  const header = render.slice(render.indexOf("class=x2sub"), render.indexOf("</header>"));
  assert.doesNotMatch(header, /thanksgiving/);
  assert.match(render, /thanksgiving_drinks_page\(out\)/);
  assert.doesNotMatch(render, /—/);
});

test("thanksgiving_drinks_page writes the menu, recipe links, og tags, and share image", () => {
  const out = py(`
import json
d = pathlib.Path(tempfile.mkdtemp())
src = pathlib.Path(tempfile.mkdtemp()) / "menu.png"
src.write_bytes(b"\\x89PNG\\r\\n\\x1a\\n")
try:
    site_render.thanksgiving_drinks_page(d, src)
    html = (d / "thanksgiving-drinks" / "index.html").read_text()
    img = d / "thanksgiving-drinks" / "menu.png"
    wines = d / "thanksgiving-drinks" / "wines.json"
    js = d / "thanksgiving-drinks" / "wines.js"
    print(json.dumps({"html": html, "has_png": img.exists(), "png_size": img.stat().st_size, "has_wines": wines.exists(), "has_js": js.exists()}))
finally:
    shutil.rmtree(d)
    shutil.rmtree(src.parent)
`);
  const { html, has_png, png_size, has_wines, has_js } = JSON.parse(out);
  assert.equal(has_png, true);
  assert.ok(png_size > 0);
  assert.match(html, /<title>Thanksgiving Beverage Menu · Crews &amp; Anna's Kitchen<\/title>/);
  assert.match(html, /rel=canonical href="https:\/\/recipes\.crews\.fyi\/thanksgiving-drinks\/"/);
  assert.match(html, /property="og:title" content="Thanksgiving Beverage Menu"/);
  assert.match(html, /property="og:description" content="A beverage menu for Thanksgiving at the Blind Tiger: batched cocktails, Alton Brown&#x27;s aged eggnog, wine, and a few zero-proof pours."/);
  assert.match(html, /property="og:image" content="https:\/\/recipes\.crews\.fyi\/thanksgiving-drinks\/menu\.png"/);
  assert.match(html, /property="og:image:width" content="1080"/);
  assert.match(html, /property="og:image:height" content="1350"/);
  assert.match(html, /property="og:url" content="https:\/\/recipes\.crews\.fyi\/thanksgiving-drinks\/"/);
  assert.match(html, /name="twitter:card" content="summary_large_image"/);
  assert.match(html, /href="\/r\/freezer-door-spiced-cranberry-paper-plane">Spiced Cranberry Paper Plane</);
  assert.match(html, /href="\/r\/banana-bread-old-fashioned">Banana Bread Old Fashioned</);
  assert.match(html, /href="\/r\/aged-eggnog">Alton Brown's Aged Eggnog</);
  assert.match(html, /Châteauneuf-du-Pape/);
  assert.match(html, /Sonoma Zinfandel/);
  assert.match(html, /Napa Sauvignon Blanc/);
  assert.match(html, /Napa Cabernet Sauvignon/);
  assert.match(html, /Feel free to bring your own\./);
  assert.match(html, /Sauternes/);
  assert.match(html, /Carajillo/);
  assert.match(html, /Lemonade/);
  assert.match(html, /Iced tea/);
  assert.match(html, /Aging since October 18\./);
  assert.match(html, /Nov 26, 2026/);
  assert.match(html, /<h1>Thanksgiving<\/h1>/);
  assert.match(html, /<p class=sub>Beverage Menu<\/p>/);
  assert.match(html, /House Wine Selection/);
  assert.match(html, /data-wine="Sonoma Zinfandel"/);
  assert.match(html, /data-wine="Chateauneuf-du-Pape"/);
  assert.match(html, /data-wine="Napa Sauvignon Blanc"/);
  assert.match(html, /data-wine="Sauternes"/);
  assert.doesNotMatch(html, /data-wine="Napa Cabernet/);
  assert.match(html, /<p class=name>Napa Cabernet Sauvignon<\/p>/);
  assert.match(html, /id="wine-cards"/);
  assert.match(html, /src="\/thanksgiving-drinks\/wines\.js"/);
  assert.equal(has_wines, true);
  assert.equal(has_js, true);
  assert.doesNotMatch(html, /—/);
  assert.doesNotMatch(html, /pages\.dev/);
  assert.doesNotMatch(html, /href="\/r\/soup"/);
});

test("sitemap lists /thanksgiving-drinks/ and _headers cache the share image", () => {
  const out = py(`
import json, voice_json
d = pathlib.Path(tempfile.mkdtemp())
food = {"title": "Soup", "slug": "soup", "type": "soup-bowl", "status": "to-try", "owner": "crews", "credit": "", "source": "", "source_url": "", "time_minutes": "30", "serves": "2", "rating": "", "cooks": "0", "tags": [], "photo": "", "body": "A soup.\\n\\n## Original\\n\\n## Our version\\n- [ ] onion\\n\\n1. Simmer.\\n"}
try:
    site_render.static_pages([food], d)
    print(json.dumps({"sitemap": (d / "sitemap.xml").read_text(), "hdr": voice_json.headers()}))
finally:
    shutil.rmtree(d)
`);
  const { sitemap, hdr } = JSON.parse(out);
  assert.match(sitemap, /<loc>https:\/\/recipes\.crews\.fyi\/thanksgiving-drinks\/<\/loc>/);
  assert.match(hdr, /\/thanksgiving-drinks\/menu\.png\n\s*Content-Type: image\/png/);
  assert.match(hdr, /\/thanksgiving-drinks\/\*\n\s*Cache-Control: public, max-age=300/);
});

test("share image asset is in the web folder", () => {
  const img = path.join(root, "_system/web/thanksgiving-drinks.png");
  assert.equal(existsSync(img), true);
  const buf = readFileSync(img);
  assert.ok(buf.length > 10000);
  assert.equal(buf.subarray(0, 8).toString("hex"), "89504e470d0a1a0a");
});
