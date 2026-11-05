// node --test _system/tests/  Inline amounts in steps (runs inline_amounts.py and build.py through python3; no network).
import test from "node:test"; import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
const py = (code) => JSON.parse(execFileSync("python3", ["-c", `import sys, json; sys.path.insert(0, "_system/scripts"); import inline_amounts as I\n${code}`], { encoding: "utf8" }));
const doc = (steps) => `Pitch.\n\n## Original\n- 1 tbsp ginger\n\n1. Add the ginger.\n\n## Our version\n**Grocery & inventory check**\n- [ ] ginger (1 tbsp, grated)\n- [ ] garlic (3 cloves, minced)\n- [ ] salt (to taste)\n- [ ] cilantro (amount not given)\n\n**Steps**\n${steps}\n\n## Notes\n`;
const miss = (steps) => py(`print(json.dumps([i["name"] for i in I.missing(${JSON.stringify(doc(steps))})]))`);

test("flags a step that mentions a listed ingredient without its amount", () => {
  assert.deepEqual(miss("1. Add the ginger and garlic (3 cloves, minced)."), ["ginger"]);
  assert.deepEqual(miss("1. Add the ginger and garlic.").sort(), ["garlic", "ginger"]);
});
test("passes when the amount is inline", () => {
  assert.deepEqual(miss("1. Add the ginger (1 tbsp, grated) and garlic (3 cloves, minced)."), []);
});
test("ignores items with no amount, and only reads Our version", () => {
  assert.deepEqual(miss("1. Season with salt, add the ginger (1 tbsp) and garlic (3 cloves), top with cilantro."), []);
  assert.deepEqual(py(`print(json.dumps(len(I.missing("## Original\\n- 1 tbsp ginger\\n\\n1. Add the ginger.\\n"))))`), 0);
});
test("suggest inserts the listed amount after the first mention", () => {
  const out = py(`print(json.dumps(I.suggest(${JSON.stringify(doc("1. Add the ginger and stir."))})))`);
  assert.match(out, /1\. Add the ginger \(1 tbsp, grated\) and stir\./);
  assert.match(out, /## Original\n- 1 tbsp ginger\n\n1\. Add the ginger\.\n/);
});
test("build only warns about missing inline amounts, never fails on them", () => {
  const r = spawnSync("python3", ["_system/scripts/build.py"], { encoding: "utf8" });
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.doesNotMatch(r.stdout, /VALIDATION ERRORS[\s\S]*without its amount/);
});
