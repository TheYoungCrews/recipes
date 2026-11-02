// node --test _system/tests/  Short grocery names and the /groceries.txt feed (runs groceries.py through python3; no network).
import test from "node:test"; import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
const py = (code) => JSON.parse(execFileSync("python3", ["-c", `import sys, json; sys.path.insert(0, "_system/scripts"); import groceries as G\n${code}`], { encoding: "utf8" }));

test("short names drop amounts, prep and filler words", () => {
  const got = py(`print(json.dumps([G.short_name(G.parse_line(x)["name"], names={}) for x in [
    "1 lb Yukon Gold potatoes, cut in chunks", "8 sprigs fresh thyme", "1½ cups dry red wine", "⅓ cup chopped pecans",
    "1.5 lb boneless skinless chicken thighs", "1 package organic baby spinach", "2 jars of salsa verde"]]))`);
  assert.deepEqual(got, ["Yukon Gold potatoes", "Thyme", "Dry red wine", "Pecans", "Chicken thighs", "Baby spinach", "Salsa verde"]);
});
test("override map from kitchen/grocery-names.md wins", () => {
  const got = py(`n = G.grocery_names(); print(json.dumps([G.short_name(G.parse_line(x)["name"], names=n) for x in [
    "1 package Trader Joe's precooked lentils", "8 oz Monterey Jack or Oaxaca cheese", "½ cup sour cream", "Crème fraîche or Greek yogurt"]]))`);
  assert.deepEqual(got, ["Lentils", "Shredded cheese", "Greek yogurt", "Greek yogurt"]);
});
test("groceries.txt: non-optional, deduped, section order, no amounts", () => {
  const txt = py(`g = {"detail": [
    {"short": "Polenta", "section": "pantry", "optional": False},
    {"short": "Cremini mushrooms", "section": "produce", "optional": False},
    {"short": "Cilantro", "section": "produce", "optional": True},
    {"short": "cremini mushrooms", "section": "produce", "optional": False},
    {"short": "Chicken thighs", "section": "meat and seafood", "optional": False}]}
print(json.dumps(G.to_txt(g)))`);
  assert.equal(txt, "Cremini mushrooms\nChicken thighs\nPolenta\n");
  assert.equal(py(`print(json.dumps(G.to_txt({"detail": []})))`), "");
});
test("current plan feed has no amounts or on-hand items", () => {
  const r = py(`g = G.build(); print(json.dumps({"txt": G.to_txt(g) if g else "", "have": [h["on_hand"] for h in (g or {}).get("have", [])], "shorts": [i["short"] for i in (g or {}).get("detail", [])]}))`);
  for (const line of r.txt.split("\n").filter(Boolean)) {
    assert.doesNotMatch(line, /^\d|[½¼¾⅓⅔⅛]/, line);
    assert.equal(line, line.trim());
  }
  assert.equal(r.txt.split("\n").filter(Boolean).length, new Set(r.txt.toLowerCase().split("\n").filter(Boolean)).size);
});
