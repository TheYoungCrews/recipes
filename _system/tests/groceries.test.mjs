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
test("inventory.md: parentheticals dropped, matching items leave the list and show as in_house", () => {
  const r = py(`import tempfile, pathlib
f = pathlib.Path(tempfile.mkdtemp()) / "inv.md"
f.write_text("# Inventory\\n\\n## Fridge\\n- butter (Kerrygold)\\n- broccolini\\n- picanha steaks (4: 2 salted for Tuesday, 2 for Friday)\\n- thyme\\n- whole milk\\n")
inv = G.inventory(f)
p = G.current()
g = G.build(p, inv=["broccolini", "thyme", "cremini mushrooms"])
g0 = G.build(p, inv=[])
print(json.dumps({"inv": inv, "lines": [i["line"] for i in g["detail"]], "lines0": [i["line"] for i in g0["detail"]], "house": g["in_house"],
  "m": [G.matches("broccolini", "broccolini"), G.matches("fresh thyme", "thyme"), G.matches("coconut milk", "whole milk"), G.matches("Yukon Gold potatoes", "gold potatoes")]}))`);
  assert.deepEqual(r.inv, ["butter", "broccolini", "picanha steaks", "thyme", "whole milk"]);
  assert.deepEqual(r.m, [true, true, false, true]);
  for (const line of r.lines) assert.doesNotMatch(line, /broccolini|thyme|cremini/i, line);
  for (const h of r.house) { assert.ok(h.inventory, JSON.stringify(h)); assert.ok(r.lines0.includes(h.line), h.line); }
  assert.equal(r.lines0.length - r.lines.length, r.house.length);
});
test("water is never a grocery item; scallions merge with green onions, amountless twins fold in", () => {
  const got = py(`e = [dict(G.parse_line(x), recipe="r") for x in ["4 green onions, thinly sliced", "1 scallion, thinly sliced", "Green onions, sliced, for garnish"]]
print(json.dumps([i["line"] for i in G.merge(e)]))`);
  assert.equal(got.length, 1); assert.match(got[0], /^5 green onions/);
});
