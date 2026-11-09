// kitchen/inventory.md helpers: match recipe lines, decide what a cook used up,
// add checked-off groceries, never invent amounts, never touch staples.
const UNI = { "½": "1/2", "¼": "1/4", "¾": "3/4", "⅓": "1/3", "⅔": "2/3", "⅛": "1/8" };
const NUM = "(?:\\d+\\s+\\d+/\\d+|\\d+/\\d+|\\d+(?:\\.\\d+)?)";
const UNITS = {
  lb: "w", lbs: "w", pound: "w", pounds: "w", oz: "w", ounce: "w", ounces: "w",
  cup: "v", cups: "v", tbsp: "v", tablespoon: "v", tablespoons: "v", tsp: "v", teaspoon: "v", teaspoons: "v",
  clove: "clove", cloves: "clove", sprig: "sprig", sprigs: "sprig", can: "can", cans: "can",
  bunch: "bunch", bunches: "bunch", head: "head", heads: "head", pint: "pint", pints: "pint"
};
const SIZES = new Set(["small", "medium", "large"]);
const DESCRIPTORS = new Set(["yellow", "white", "red", "sweet", "large", "medium", "small", "fresh", "kosher", "flaky", "sea", "fine", "coarse",
  "unsalted", "salted", "whole", "grated", "freshly", "ground", "cracked", "cold", "good", "extra-virgin", "extra", "virgin",
  "light", "regular", "block", "shaved", "chopped", "diced", "sliced", "minced", "thinly", "finely", "shredded", "softened", "melted",
  "low-sodium", "full-fat", "plain", "yukon", "of"]);
const ALIASES = { "chili crunch": "chili crisp", "chili oil or chili crunch": "chili crisp", "chilli crisp": "chili crisp" };
const FRACS = { 0.5: "½", 0.25: "¼", 0.75: "¾", "0.333": "⅓", "0.667": "⅔", 0.125: "⅛" };
const TAIL = /\s+(peppers?|steaks?|fillets?|filets?|breasts?|thighs?|chops?|roasts?)\s*$/i;

export const okInvItem = s => {
  const t = String(s || "").replace(/\s+/g, " ").trim();
  return t.length >= 1 && t.length <= 80 && !/[\[\]#,\"`\n\r]/.test(t);
};
export const cleanInvItem = s => String(s || "").replace(/\s+/g, " ").trim();

export function fold(x) {
  return String(x).normalize("NFKD").replace(/[\u0300-\u036f]/g, "");
}
function sing(w) {
  return /(?:ss|us)$/.test(w) ? w : w.replace(/(?<=[a-z])(?:es|s)$/, "");
}
export function key(name) {
  let n = name.toLowerCase();
  n = n.replace(/\b(fresh|freshly|kosher|flaky|cold|grated|good|unsalted|thinly|finely|roughly|sliced|chopped|minced|diced|dry|dried)\b/g,
    m => (m === "dry" || m === "dried") ? m : "");
  n = n.replace(/\s+/g, " ").trim().replace(/\bchicken broth\b/, "chicken stock");
  return /(?:ss|us)$/.test(n) ? n : n.replace(/(?<=[a-z])(?:es|s)$/, "");
}

// Same rule as groceries.py matches(): item IS the staple, allowing only descriptor words before it.
export function matches(item, staple) {
  item = ALIASES[String(item).toLowerCase().trim()] || item;
  item = fold(item); staple = fold(staple);
  const it = fold(item).toLowerCase().replace(/[^a-z\- ]/g, " ").split(/\s+/).filter(w => w && w !== "clove" && w !== "cloves").map(sing);
  const st = fold(staple).toLowerCase().split(/\s+/).filter(Boolean).map(sing);
  if (!st.length) return false;
  for (const alt of it.join(" ").split(" or ")) {
    const a = alt.split(/\s+/).filter(Boolean);
    if (a.length >= st.length && a.slice(-st.length).join(" ") === st.join(" ") && a.slice(0, a.length - st.length).every(w => DESCRIPTORS.has(w))) return true;
  }
  return false;
}

export function invMatch(a, b) {
  if (!a || !b) return false;
  if (matches(a, b) || matches(b, a)) return true;
  const ka = key(a), kb = key(b);
  if (ka && ka === kb) return true;
  const a2 = a.replace(TAIL, "").trim(), b2 = b.replace(TAIL, "").trim();
  if ((a2 && a2 !== a) || (b2 && b2 !== b)) {
    if (a2 && b2 && (matches(a2, b2) || matches(b2, a2))) return true;
    if (a2 && a2 !== a && (matches(a2, b) || matches(b, a2))) return true;
    if (b2 && b2 !== b && (matches(a, b2) || matches(b2, a))) return true;
  }
  return false;
}

export function stapleNames(md) {
  return String(md || "").split(/\n/).filter(l => l.startsWith("- ")).map(l => l.slice(2).split(" | ")[0].trim().toLowerCase()).filter(Boolean);
}
export function isStaple(name, staples) {
  const n = String(name || "").replace(/\s*\([^)]*\)/g, "").trim() || name;
  return (staples || []).some(s => matches(n, s) || matches(name, s));
}

function num(s) {
  s = String(s).trim();
  if (s.includes(" ")) {
    const [a, b] = s.split(/\s+/, 2);
    return Number(a) + num(b);
  }
  if (s.includes("/")) {
    const [n, d] = s.split("/");
    return Number(n) / Number(d);
  }
  return Number(s);
}
function fmt(q) {
  if (q == null || Number.isNaN(q)) return "";
  const w = Math.trunc(q), r = Math.abs(q - w);
  let frac = FRACS[r];
  if (!frac) {
    if (Math.abs(r - 1 / 3) < 0.01) frac = "⅓";
    else if (Math.abs(r - 2 / 3) < 0.01) frac = "⅔";
  }
  if (r < 1e-9) return String(w);
  if (frac) return w ? `${w}${frac}` : frac;
  return String(q);
}

export function parseLine(line) {
  const raw = line;
  let s = line;
  for (const [k, v] of Object.entries(UNI)) s = s.replace(new RegExp(`(\\d)${k}`, "g"), `$1 ${v}`).replaceAll(k, v);
  const optional = /^(?:optional:?\s+)/i.test(s) || /\(optional\)|,\s*optional\b/i.test(s);
  s = s.replace(/^(?:optional:?\s+)/i, "").replace(/\s*\(optional\)/gi, "");
  if (!new RegExp("^" + NUM).test(s)) {
    const pm = new RegExp("^([^(]+?)\\s*\\(\\s*(" + NUM + ")(?:\\s+([A-Za-z]+))?[^)]*\\)").exec(s);
    if (pm) {
      const u = pm[3] && UNITS[pm[3].toLowerCase()] ? pm[3] : "";
      s = [pm[2], u, pm[1].trim()].filter(Boolean).join(" ") + s.slice(pm[0].length);
    }
  }
  s = s.replace(/\s*\([^)]*\)/g, "");
  s = s.split(",")[0].split(";")[0].trim();
  s = s.replace(/\s+(?:to finish|to taste|for serving)$/i, "");
  let qty = null, unit = null, kind = null, size = null, rng = false;
  const m = new RegExp("^(" + NUM + ")(?:\\s*(?:to|-|–)\\s*(" + NUM + "))?\\s+(.*)$").exec(s);
  if (m) {
    qty = num(m[1]); let rest = m[3]; rng = !!m[2];
    if (rng) qty = [qty, num(m[2])];
    const wm = /^(\S+)(?:\s+(.*))?$/.exec(rest);
    const w0 = ((wm && wm[1]) || "").toLowerCase().replace(/\.$/, "");
    if (w0 && UNITS[w0]) {
      unit = w0; kind = UNITS[w0]; rest = (wm && wm[2]) || "";
      rest = rest.replace(/^of\s+/, "");
    } else if (w0 && SIZES.has(w0)) {
      size = w0; rest = (wm && wm[2]) || ""; kind = "count";
    } else kind = "count";
    s = rest;
  }
  return { raw, qty, range: rng, unit, kind, size, name: s.trim(), optional };
}

function mdSection(body, title) {
  const re = new RegExp(`^## ${title}\\s*$`, "m");
  const start = re.exec(body);
  if (!start) return "";
  const after = body.slice(start.index + start[0].length);
  const next = /^## /m.exec(after);
  return next ? after.slice(0, next.index) : after;
}

export function checklist(body) {
  const text = String(body || "").replace(/\r\n/g, "\n");
  let lines = [...mdSection(text, "Our version").matchAll(/^- \[[ x]\]\s*(.+)$/mg)].map(m => m[1].trim());
  if (!lines.length) {
    lines = [...mdSection(text, "Original").matchAll(/^- (?!\[[ x]\])(.+)$/mg)].map(m => m[1].trim());
  }
  return lines.filter(l => l && !l.startsWith("#") && !/^#+\s/.test(l));
}

function parseCount(paren) {
  if (!paren) return null;
  // Only simple "(2)" or "(2, for Friday)". Skip brands, "full fat", and "4: 2 salted..." notes.
  const m = /^\s*(\d+)\s*(?:,\s*(.*))?$/.exec(paren);
  if (!m) return null;
  if (/^\d+\s*:/.test(paren)) return null;
  return { n: Number(m[1]), rest: (m[2] || "").trim() };
}

export function parseInvItem(line) {
  const rest = line.slice(2).split(" | ")[0].trim();
  const m = /^(.*?)\s*\(([^)]*)\)\s*$/.exec(rest);
  const name = (m ? m[1] : rest).trim();
  const paren = m ? m[2] : null;
  return { line, display: rest, name, paren, count: parseCount(paren) };
}

export function parseInventory(md) {
  const lines = String(md || "").replace(/\r\n/g, "\n").split("\n");
  const items = [];
  let section = "";
  lines.forEach((line, i) => {
    const h = /^##\s+(.+?)\s*$/.exec(line);
    if (h) { section = h[1]; return; }
    if (line.startsWith("- ")) items.push({ index: i, section, ...parseInvItem(line) });
  });
  return { lines, items };
}

function amountPhrase(p) {
  if (p.qty == null) return null;
  const q = p.range ? `${fmt(p.qty[0])} to ${fmt(p.qty[1])}` : fmt(p.qty);
  return [q, p.unit, p.size].filter(Boolean).join(" ");
}
function wholeCount(p) {
  if (p.kind !== "count" || p.qty == null || p.range) return null;
  const n = Array.isArray(p.qty) ? null : Number(p.qty);
  if (n == null || Number.isNaN(n) || Math.abs(n - Math.round(n)) > 1e-9) return null;
  return Math.round(n);
}

function decideUse(parsed, inv) {
  const raw = String(parsed.raw || "").toLowerCase();
  if (/\ball of\b|\ball the\b|\bthe rest of\b/.test(raw)) {
    return { suggested: true, op: "remove", by: null, reason: "recipe uses all of it" };
  }
  const n = wholeCount(parsed);
  if (n != null) {
    if (inv.count) {
      if (n >= inv.count.n) return { suggested: true, op: "remove", by: null, reason: n === inv.count.n ? `used all ${inv.count.n}` : `used ${n}, more than the ${inv.count.n} on hand` };
      return { suggested: true, op: "subtract", by: n, reason: `used ${n} of ${inv.count.n}` };
    }
    return { suggested: true, op: "remove", by: null, reason: "used the whole item" };
  }
  const amt = amountPhrase(parsed);
  return { suggested: false, op: "remove", by: null, reason: amt ? `recipe uses ${amt}; check if you used it all` : "amount not clear; check if you used it all" };
}

// What this dish might take off inventory.md. Staples are never listed.
export function proposeRemovals(inventoryMd, recipeMd, staplesMd) {
  const inv = parseInventory(inventoryMd);
  const staples = stapleNames(staplesMd);
  const seen = new Set();
  const out = [];
  for (const raw of checklist(recipeMd)) {
    const parsed = parseLine(raw);
    if (!parsed.name) continue;
    for (const item of inv.items) {
      if (isStaple(item.name, staples)) continue;
      if (!invMatch(parsed.name, item.name)) continue;
      const id = item.name.toLowerCase();
      const use = decideUse(parsed, item);
      if (seen.has(id)) {
        const prev = out.find(x => x.name.toLowerCase() === id);
        if (prev && use.suggested && !prev.suggested) Object.assign(prev, use, { recipe: raw });
        continue;
      }
      seen.add(id);
      out.push({
        name: item.name,
        line: item.display,
        section: item.section,
        suggested: use.suggested,
        op: use.op,
        by: use.by,
        reason: use.reason,
        recipe: raw
      });
    }
  }
  return out;
}

function rewriteCountLine(item, remaining) {
  const rest = item.count && item.count.rest ? item.count.rest : "";
  const paren = rest ? `(${remaining}, ${rest})` : `(${remaining})`;
  return `- ${item.name} ${paren}`;
}

export function applyOps(inventoryMd, ops) {
  const parsed = parseInventory(inventoryMd);
  const byName = new Map();
  for (const op of ops) {
    const keyName = cleanInvItem(op.name).toLowerCase();
    if (!keyName) continue;
    byName.set(keyName, op);
  }
  const touched = [];
  const removed = [];
  const subtracted = [];
  // Edit from the bottom so indexes stay valid.
  const items = [...parsed.items].sort((a, b) => b.index - a.index);
  for (const item of items) {
    const op = byName.get(item.name.toLowerCase());
    if (!op) continue;
    if (op.op === "subtract" && op.by > 0 && item.count && item.count.n > op.by) {
      const left = item.count.n - op.by;
      parsed.lines[item.index] = rewriteCountLine(item, left);
      subtracted.push({ name: item.name, from: item.count.n, by: op.by, left });
      touched.push(item.name);
    } else {
      parsed.lines.splice(item.index, 1);
      // Drop a leftover blank line that sat under a now-empty extra gap? Keep structure as-is.
      removed.push(item.name);
      touched.push(item.name);
    }
  }
  let md = parsed.lines.join("\n");
  if (inventoryMd.endsWith("\n") && !md.endsWith("\n")) md += "\n";
  return { md, changed: md !== inventoryMd.replace(/\r\n/g, "\n"), removed, subtracted, touched };
}

// selected: names the cook checked. Null/undefined = follow suggestions.
// An explicit check on a partial item means they used it up (remove the line).
export function applySelectedRemovals(inventoryMd, proposed, selected) {
  const allow = new Map(proposed.map(p => [p.name.toLowerCase(), p]));
  let picks;
  if (selected == null) picks = proposed.filter(p => p.suggested);
  else {
    picks = [];
    for (const raw of selected) {
      const n = cleanInvItem(raw);
      if (!n) continue;
      const hit = allow.get(n.toLowerCase()) || [...allow.values()].find(p => invMatch(n, p.name));
      if (hit) picks.push(hit);
    }
  }
  const ops = picks.map(p => {
    if (selected == null) return p;
    // User checked it: if the rule wanted a subtract, keep that; otherwise they said it's gone.
    if (p.suggested && p.op === "subtract") return p;
    return { ...p, op: "remove", by: null };
  });
  return applyOps(inventoryMd, ops);
}

export function grocerySection(name) {
  const n = name.toLowerCase();
  if (/\bfrozen\b/.test(n)) return "frozen";
  if (/\b(wine|beer|bourbon|vodka|gin|rum|vermouth|sherry|brandy)\b/.test(n) && !n.includes("vinegar")) return "other";
  if (/\b(picanha|steak|beef|chuck|short ?ribs?|brisket|chicken|thighs?|pork|bacon|sausage|lamb|turkey|shrimp|fish|salmon|barramundi|flounder|cod|scallops?|mussels|clams|crab|prosciutto|pancetta|chorizo)\b/.test(n)
    && !/\b(stock|broth|bouillon|sauce|paste)\b/.test(n)) return "meat and seafood";
  if (/\b(butter|milk|cream|cheese|parmesan|pecorino|feta|mozzarella|ricotta|yogurt|eggs?|cottage|mascarpone|crème fraîche|sour cream)\b/.test(n)
    && !/\b(coconut|peanut|almond|oat|apple) (milk|cream|butter)\b/.test(n)) return "dairy";
  if (/\b(dried|ground|powder|flakes|canned|can|oil|purée|puree|extract|chips|pecans|walnuts|almonds|nuts|seeds|mix|crunch|crisp|tortillas|vinegar|salsa)\b/.test(n)) return "pantry";
  if (/\b(onions?|shallots?|garlic|mushrooms?|cremini|shiitake|potato(?:es)?|thyme|rosemary|sage|parsley|cilantro|basil|mint|dill|chives|limes?|lemons?|ginger|carrots?|zucchini|celery|serranos?|jalapeños?|jalapenos?|bell peppers?|scallions?|green onions?|spinach|kale|lettuce|arugula|cabbage|tomato(?:es)?|squash|apples?|avocados?|cucumbers?|herbs?|greens|leeks?|fennel|broccoli|cauliflower|green beans|corn|broccolini|snap peas|bok choy|sweet potato(?:es)?)\b/.test(n)) return "produce";
  if (/\b(stock|broth|polenta|grits|rice|pasta|orzo|spaghetti|couscous|quinoa|oats|farro|tortillas|chickpeas|olives|capers|noodles?|flour|sugar|vinegar|oil|mustard|dijon|sauce|paste|spice|salt|pepper|curry|turmeric|cumin|paprika|honey|beans|lentils|bamboo shoots|coconut milk|aminos|sambal|breadcrumbs|panko)\b/.test(n)) return "pantry";
  return "other";
}

export function inferSection(name) {
  const g = grocerySection(name);
  const n = name.toLowerCase();
  if (g === "frozen" || /\bfrozen\b/.test(n)) return "Freezer";
  if (g === "dairy") return "Fridge";
  if (g === "meat and seafood") return "Fridge";
  if (g === "produce") {
    if (/\b(cilantro|parsley|thyme|rosemary|sage|basil|mint|dill|chives|kale|spinach|lettuce|arugula|herbs?|greens|carrots?|celery|broccolini|broccoli|mushrooms?|cremini|shiitake|snap peas|green beans|bok choy|cabbage|cucumbers?|tomato(?:es)?|jalapeños?|jalapenos?|serranos?|bell peppers?|lemons?|limes?|ginger|scallions?|green onions?)\b/.test(n)) return "Fridge";
    return "Pantry: produce";
  }
  if (g === "pantry") {
    if (/\b(flour|baking|chocolate|vanilla|stevia|sugar|cornstarch|yeast)\b/.test(n)) return "Pantry: baking";
    if (/\b(pasta|rice|grain|wrap|tortilla|noodles?|orzo|polenta|grits|quinoa|farro|couscous)\b/.test(n)) return "Pantry: pasta, grains, wraps";
    if (/\b(chickpeas|beans|tomatoes|coconut milk|pumpkin|broth|stock|mussels|sardines|oysters|clams|tuna|lentil stew|canned)\b/.test(n)) return "Pantry: cans and jars";
    if (/\b(granola|seeds?|walnuts|pecans|almonds|nuts|chips|crackers|snack)\b/.test(n)) return "Pantry: nuts, seeds, snacks";
    if (/\b(oil|vinegar|sauce|aminos|honey|mustard|ketchup|mayo|pesto|crunch|crisp|gochujang|miso|hot sauce|sesame)\b/.test(n)) return "Pantry: oils, sauces, condiments";
    if (/\b(salt|pepper|spice|cumin|paprika|cinnamon|turmeric|seasoning|flakes)\b/.test(n)) return "Pantry: spices and salt";
    if (/\b(coffee|protein|creatine|psyllium|oat milk)\b/.test(n)) return "Pantry: drinks and protein";
    return "Pantry: cans and jars";
  }
  if (g === "other") {
    if (/\b(wine|beer|soda|cola|heineken|vermouth|seltzer|club soda|ginger beer)\b/.test(n)) return "Fridge";
    return "New";
  }
  return "New";
}

function findHeading(lines, section) {
  const want = section.toLowerCase();
  for (let i = 0; i < lines.length; i++) {
    const h = /^##\s+(.+?)\s*$/.exec(lines[i]);
    if (h && h[1].toLowerCase() === want) return i;
  }
  return -1;
}
function sectionEnd(lines, headingAt) {
  for (let i = headingAt + 1; i < lines.length; i++) {
    if (/^##\s+/.test(lines[i])) return i;
  }
  return lines.length;
}

export function applyAdd(inventoryMd, items, staplesMd) {
  const staples = stapleNames(staplesMd);
  const parsed = parseInventory(inventoryMd);
  const added = [];
  const skipped_staples = [];
  const already = [];
  for (const raw of items) {
    const name = cleanInvItem(raw);
    if (!name || !okInvItem(name)) continue;
    if (isStaple(name, staples)) { skipped_staples.push(name); continue; }
    if (parsed.items.some(it => it.name.toLowerCase() === name.toLowerCase() || invMatch(name, it.name))) {
      already.push(name); continue;
    }
    const section = inferSection(name);
    let h = findHeading(parsed.lines, section);
    if (h < 0) {
      if (parsed.lines.length && parsed.lines[parsed.lines.length - 1] !== "") parsed.lines.push("");
      parsed.lines.push(`## ${section}`);
      parsed.lines.push(`- ${name}`);
      h = parsed.lines.length - 2;
    } else {
      const end = sectionEnd(parsed.lines, h);
      let insert = end;
      while (insert > h + 1 && parsed.lines[insert - 1] === "") insert--;
      parsed.lines.splice(insert, 0, `- ${name}`);
    }
    // Refresh items so later dupes in this same batch are seen.
    const next = parseInventory(parsed.lines.join("\n"));
    parsed.lines = next.lines;
    parsed.items = next.items;
    added.push({ name, section });
  }
  let md = parsed.lines.join("\n");
  if (!md.endsWith("\n")) md += "\n";
  const orig = inventoryMd.replace(/\r\n/g, "\n");
  const origNL = orig.endsWith("\n") ? orig : orig + "\n";
  return { md, changed: md !== origNL, added, skipped_staples, already };
}

// Unchecking a grocery item: only remove an exact name match (parentheticals stripped),
// never a fuzzy hit, so leftover "gold potatoes" is not dropped when unhaving "yukon gold potato".
export function applyExactRemove(inventoryMd, items) {
  const parsed = parseInventory(inventoryMd);
  const want = new Set(items.map(x => cleanInvItem(x).toLowerCase()).filter(Boolean));
  const removed = [];
  const ordered = [...parsed.items].sort((a, b) => b.index - a.index);
  for (const item of ordered) {
    if (!want.has(item.name.toLowerCase())) continue;
    parsed.lines.splice(item.index, 1);
    removed.push(item.name);
  }
  let md = parsed.lines.join("\n");
  if (inventoryMd.endsWith("\n") && !md.endsWith("\n")) md += "\n";
  return { md, changed: md !== inventoryMd.replace(/\r\n/g, "\n"), removed };
}

export function applyInventoryEdit(inventoryMd, { action, items, staplesMd }) {
  if (action === "add") return applyAdd(inventoryMd, items, staplesMd);
  if (action === "remove") return applyExactRemove(inventoryMd, items);
  throw new Error("bad action");
}
