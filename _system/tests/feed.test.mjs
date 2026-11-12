// node --test _system/tests/feed.test.mjs  Public RSS feed (additions + ratings).
import test from "node:test"; import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";

const py = (code) => execFileSync("python3", ["-c", `import sys, json, datetime\nsys.path.insert(0, "_system/scripts")\nimport feed, site_render\n${code}`], { encoding: "utf8" });
const parse = (code) => JSON.parse(py(`print(json.dumps(${code}, default=str))`));

const recipe = (over = {}) => ({
  title: over.title || "Test Steak",
  slug: over.slug || "test-steak",
  type: over.type || "main",
  status: over.status || "made",
  owner: "crews",
  added: over.added ?? "2026-11-01",
  rating: over.rating ?? "",
  tags: [],
  ingredients: [],
  body: over.body ?? `A weeknight steak.\n\n## Original\n\n## Our version\n\n## Notes\n${over.notes || ""}`,
});

test("events include an addition and a rating, newest first", () => {
  const items = [recipe({
    notes: "- 2026-11-10 (crews via site, 4.5/5): excellent dinner\n- 2026-11-01 (grok-bot): filed for the week of 2026-11-02\n",
  })];
  const ev = parse(`feed.events(${JSON.stringify(items)})`);
  assert.equal(ev.length, 2);
  assert.equal(ev[0].kind, "rated");
  assert.equal(ev[0].title, "Rated 4.5/5: Test Steak");
  assert.equal(ev[0].date, "2026-11-10");
  assert.equal(ev[0].note, "Excellent dinner");
  assert.equal(ev[0].guid, "https://blind-tiger.pages.dev/r/test-steak#rated-2026-11-10-4.5-crews");
  assert.equal(ev[1].kind, "added");
  assert.equal(ev[1].title, "Added: Test Steak");
  assert.equal(ev[1].guid, "https://blind-tiger.pages.dev/r/test-steak#added-2026-11-01");
  assert.match(ev[1].note, /weeknight steak/i);
});

test("agent notes, unrated diary lines, retired recipes and emails stay out", () => {
  const items = [
    recipe({ status: "retired", notes: "- 2026-11-10 (crews via site, 5/5): secret\n" }),
    recipe({
      title: "Soup", slug: "soup", added: "2026-11-08",
      notes: "- 2026-11-09 (anna via site, 4/5): loved it, email me at test@example.com\n- 2026-11-09 (anna): just a cook note, no rating\n- 2026-11-08 (grok-bot): planned for this week, inventory updated\n",
    }),
  ];
  const ev = parse(`feed.events(${JSON.stringify(items)})`);
  assert.deepEqual(ev.map(e => e.kind + ":" + e.slug), ["rated:soup", "added:soup"]);
  assert.equal(ev[0].note.includes("@"), false);
  assert.match(ev[0].note, /\[email\]/);
  assert.doesNotMatch(JSON.stringify(ev), /planned for this week|inventory|secret|test@/i);
});

test("RSS is valid XML with stable guids, newest first, and a cap", () => {
  const items = [];
  for (let i = 0; i < 60; i++) {
    const d = `2026-10-${String((i % 28) + 1).padStart(2, "0")}`;
    items.push(recipe({ title: `Dish ${i}`, slug: `dish-${i}`, added: d, notes: "" }));
  }
  const xml = py(`print(feed.rss(feed.events(${JSON.stringify(items)}), now=datetime.datetime(2026,11,11,18,0,tzinfo=feed.ET)))`);
  assert.match(xml, /^<\?xml version="1.0" encoding="UTF-8"\?>/);
  assert.match(xml, /<rss version="2.0"/);
  assert.match(xml, /<channel>/);
  assert.match(xml, /<atom:link /);
  const titles = [...xml.matchAll(/<title>([^<]*)<\/title>/g)].map(m => m[1]);
  assert.equal(titles[0], "Crews &amp; Anna's Kitchen");
  assert.equal(titles.length - 1, 50, "capped at 50 items");
  const guids = [...xml.matchAll(/<guid[^>]*>([^<]*)<\/guid>/g)].map(m => m[1]);
  assert.equal(new Set(guids).size, guids.length);
  assert.doesNotMatch(xml, /plans\/|inventory\.md|grocery/i);
  assert.match(xml, /<category>food<\/category>/);
  const n = JSON.parse(py(`import xml.etree.ElementTree as ET, json\nprint(json.dumps(len(ET.fromstring(${JSON.stringify(xml)}).findall("channel/item"))))`));
  assert.equal(n, 50);
});

test("follow_page writes RSS and a follow page, and _headers sets the XML type", () => {
  const items = [recipe({
    notes: "- 2026-11-10 (crews via site, 4.5/5): excellent dinner\n",
  })];
  const out = JSON.parse(py(`
import tempfile, pathlib, shutil, json, xml.etree.ElementTree as ET, voice_json
from site_render import follow_page
d = pathlib.Path(tempfile.mkdtemp())
try:
    follow_page(${JSON.stringify(items)}, d)
    xml = (d / "feed.xml").read_text()
    html = (d / "follow/index.html").read_text()
    print(json.dumps({"n": len(ET.fromstring(xml).findall("channel/item")), "xml": xml, "html": html, "hdr": voice_json.headers()}))
finally:
    shutil.rmtree(d)
`));
  assert.equal(out.n, 2);
  assert.match(out.xml, /Rated 4.5\/5: Test Steak/);
  assert.match(out.xml, /<guid isPermaLink="false">https:\/\/blind-tiger\.pages\.dev\/r\/test-steak/);
  assert.match(out.html, /Follow along with Crews &amp; Anna's kitchen/);
  assert.match(out.html, /href="\/feed\.xml"/);
  assert.doesNotMatch(out.html, /blogtrottr/i);
  assert.match(out.html, /rel="alternate" type="application\/rss\+xml"/);
  assert.match(out.html, /name=interest value=both checked/);
  assert.match(out.html, /You'll get an email when we add a new recipe or cocktail/);
  assert.match(out.html, /property="og:image" content="https:\/\/blind-tiger\.pages\.dev\/follow-og\.png"/);
  assert.match(out.html, /twitter:card" content="summary_large_image"/);
  assert.doesNotMatch(out.html, /—/);
  assert.match(out.hdr, /\/feed\.xml\n\s*Content-Type: application\/rss\+xml; charset=utf-8/);
  assert.match(out.hdr, /\/follow-og\.png\n\s*Content-Type: image\/png/);
  assert.match(out.xml, /<category>/);
});
