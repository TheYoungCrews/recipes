import test from "node:test"; import assert from "node:assert/strict";
import { splitRecipes, titleFrom, wrapInboxFile, wrapJsonRecipe, uniquePaths, slugify } from "../../functions/_lib/paste.js";
import { whoForApiKey } from "../../functions/_lib/apikey.js";
import { onRequestPost as addPost } from "../../functions/api/add.js";

test("split on --- between recipes", () => {
  const c = splitRecipes("# A\n\ning\n\n---\n\n# B\n\ning");
  assert.equal(c.length, 2);
  assert.match(c[0], /^# A/);
  assert.match(c[1], /^# B/);
});

test("split on repeated Title: headings", () => {
  const c = splitRecipes("Title: Soup\n- water\n\nTitle: Salad\n- lettuce");
  assert.equal(c.length, 2);
  assert.equal(titleFrom(c[0]), "Soup");
  assert.equal(titleFrom(c[1]), "Salad");
});

test("no clear separator stays one item", () => {
  assert.equal(splitRecipes("Just one blurb about dinner").length, 1);
});

test("yaml frontmatter --- is not a splitter", () => {
  const c = splitRecipes("---\ntitle: Pie\nslug: pie\n---\nBody here\n");
  assert.equal(c.length, 1);
  assert.equal(titleFrom(c[0]), "Pie");
});

test("wrapInboxFile sets via and added_by", () => {
  const f = wrapInboxFile({ chunk: "# Chili\n\n- beans", who: "anna", date: "2026-10-19", via: "api" });
  assert.match(f.path, /^inbox\/2026-10-19-chili\.md$/);
  assert.match(f.content, /added_by: anna/);
  assert.match(f.content, /via: api/);
  assert.match(f.content, /via api/);
});

test("wrapJsonRecipe structured", () => {
  const f = wrapJsonRecipe({
    recipe: { title: "Egg Bites", ingredients: ["6 eggs"], steps: ["Bake"], source: "Anna" },
    who: "anna", date: "2026-10-19",
  });
  assert.equal(f.title, "Egg Bites");
  assert.match(f.content, /6 eggs/);
  assert.match(f.content, /Bake/);
});

test("uniquePaths bumps slug", () => {
  const files = [
    { path: "inbox/2026-10-19-soup.md", title: "Soup", content: "slug: soup\n" },
    { path: "inbox/2026-10-19-soup.md", title: "Soup", content: "slug: soup\n" },
  ];
  const u = uniquePaths(files, new Set(["inbox/2026-10-19-soup.md"]));
  assert.equal(u[0].path, "inbox/2026-10-19-soup-2.md");
  assert.equal(u[1].path, "inbox/2026-10-19-soup-3.md");
});

test("api key allowlist", () => {
  const env = "anna=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa,crews=bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb";
  assert.equal(whoForApiKey("Bearer aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", env), "anna");
  assert.equal(whoForApiKey("Bearer bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb", env), "crews");
  assert.equal(whoForApiKey("Bearer wrong", env), null);
  assert.equal(whoForApiKey("", env), null);
});

test("POST /api/add without auth is 401", async () => {
  const res = await addPost({
    request: new Request("https://blind-tiger.pages.dev/api/add", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ markdown: "# X\n" }),
    }),
    env: { GITHUB_TOKEN: "t", RECIPE_API_KEYS: "anna=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" },
  });
  assert.equal(res.status, 401);
});

test("slugify ascii", () => {
  assert.equal(slugify("Banana Bread Old Fashioned!"), "banana-bread-old-fashioned");
});
