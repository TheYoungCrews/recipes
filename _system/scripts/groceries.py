#!/usr/bin/env python3
"""Weekly plan -> grocery list (stdlib only). Also used by build.py for the /week/ page.

  python3 _system/scripts/groceries.py              # current plan, markdown list
  python3 _system/scripts/groceries.py --json       # current plan, JSON
  python3 _system/scripts/groceries.py --txt        # current plan, short names only (= /groceries.txt)
  python3 _system/scripts/groceries.py plans/2026-W45.md

Reads the chosen recipes' Our version checklists, merges clear duplicates (same item, compatible units),
drops kitchen/staples.md items and the plan's on_hand items, and sorts what's left by store section.
Plan format: _system/SCHEMA.md ("Weekly plans")."""
import datetime, json, pathlib, re, sys
from fractions import Fraction as F
ROOT = pathlib.Path(__file__).resolve().parents[2]
SECTIONS = ["produce", "meat and seafood", "dairy", "pantry", "frozen", "other"]
NIGHTS = {"mon": "Monday", "tue": "Tuesday", "wed": "Wednesday", "thu": "Thursday", "fri": "Friday", "sat": "Saturday", "sun": "Sunday"}

# ---- parsing helpers (same flat frontmatter as recipes)
def parse_fm(text):
    m = re.match(r"^---\n(.*?)\n---\n?(.*)$", text, re.S)
    if not m: return None, text
    fm = {}
    for line in m.group(1).splitlines():
        line = re.sub(r"\s+#.*$", "", line)
        if ":" not in line: continue
        k, v = line.split(":", 1); v = v.strip()
        if v.startswith("[") and v.endswith("]"):
            v = [x.strip().strip("'\"") for x in v[1:-1].split(",") if x.strip()]
        fm[k.strip()] = v
    return fm, m.group(2)

def staples():
    return [l[2:].split(" | ")[0].strip().lower() for l in (ROOT / "kitchen/staples.md").read_text().splitlines() if l.startswith("- ")]

def checklist(body):
    """Ingredient lines from ## Our version (checkbox lines only)."""
    m = re.search(r"^## Our version\s*$(.*?)(?=^## |\Z)", body, re.S | re.M)
    return [x.group(1).strip() for x in re.finditer(r"^- \[[ x]\]\s*(.+)$", m.group(1) if m else "", re.M)]

# ---- quantities
UNI = {"½": "1/2", "¼": "1/4", "¾": "3/4", "⅓": "1/3", "⅔": "2/3", "⅛": "1/8"}
NUM = r"(?:\d+\s+\d+/\d+|\d+/\d+|\d+(?:\.\d+)?)"
UNITS = {"lb": ("w", 16), "lbs": ("w", 16), "pound": ("w", 16), "pounds": ("w", 16), "oz": ("w", 1), "ounce": ("w", 1), "ounces": ("w", 1),
         "cup": ("v", 48), "cups": ("v", 48), "tbsp": ("v", 3), "tablespoon": ("v", 3), "tablespoons": ("v", 3), "tsp": ("v", 1), "teaspoon": ("v", 1), "teaspoons": ("v", 1),
         "clove": ("clove", 1), "cloves": ("clove", 1), "sprig": ("sprig", 1), "sprigs": ("sprig", 1), "can": ("can", 1), "cans": ("can", 1),
         "bunch": ("bunch", 1), "bunches": ("bunch", 1), "head": ("head", 1), "heads": ("head", 1), "pint": ("pint", 1), "pints": ("pint", 1)}
SIZES = {"small", "medium", "large"}

def num(s):
    s = s.strip()
    if " " in s: a, b = s.split(None, 1); return F(a) + F(b)
    return F(s)

def fmt(q):
    w, r = divmod(q.numerator, q.denominator); r = F(r, q.denominator)
    frac = {F(1, 2): "½", F(1, 4): "¼", F(3, 4): "¾", F(1, 3): "⅓", F(2, 3): "⅔", F(1, 8): "⅛"}.get(r)
    if r == 0: return str(w)
    if frac: return f"{w}{frac}" if w else frac
    return f"{float(q):g}"

def parse_line(line):
    """'1 lb Yukon Gold potatoes, cut in chunks' -> dict(qty, unit kind, display unit, name, size, optional, raw)."""
    raw = line
    s = line
    for k, v in UNI.items(): s = re.sub(rf"(\d){k}", rf"\1 {v}", s).replace(k, v)
    optional = bool(re.match(r"(?i)optional:?\s*", s)) or bool(re.search(r"(?i)\(optional\)|,\s*optional\b", s))
    s = re.sub(r"(?i)^optional:?\s*", "", s); s = re.sub(r"(?i)\s*\(optional\)", "", s)
    if not re.match(NUM, s):                       # 'chicken thighs (1.5 lb boneless)' -> '1.5 lb chicken thighs'
        pm = re.match(rf"^([^(]+?)\s*\(\s*({NUM})(?:\s+([A-Za-z]+))?[^)]*\)", s)
        if pm:
            u = pm.group(3) if pm.group(3) and pm.group(3).lower() in UNITS else ""
            s = " ".join(x for x in [pm.group(2), u, pm.group(1).strip()] if x) + s[pm.end():]
    s = re.sub(r"\s*\([^)]*\)", "", s)           # parentheticals
    s = s.split(",")[0].split(";")[0].strip()     # prep notes after the comma
    s = re.sub(r"(?i)\s+(?:to finish|to taste|for serving)$", "", s)
    qty = unit = kind = size = None; rng = False
    m = re.match(rf"^({NUM})(?:\s*(?:to|-|–)\s*({NUM}))?\s+(.*)$", s)
    if m:
        qty, rest = num(m.group(1)), m.group(3); rng = bool(m.group(2))
        if rng: qty = (qty, num(m.group(2)))
        w = rest.split(None, 1)
        if w and w[0].lower().rstrip(".") in UNITS:
            unit = w[0].lower().rstrip("."); kind = UNITS[unit][0]; rest = w[1] if len(w) > 1 else ""
            rest = re.sub(r"^of\s+", "", rest)
        elif w and w[0].lower() in SIZES:
            size = w[0].lower(); rest = w[1] if len(w) > 1 else ""; kind = "count"
        else: kind = "count"
        s = rest
    name = s.strip()
    return {"raw": raw, "qty": qty, "range": rng, "unit": unit, "kind": kind, "size": size, "name": name, "optional": optional}

def key(name):
    n = name.lower()
    n = re.sub(r"\b(fresh|freshly|kosher|flaky|cold|grated|good|unsalted|thinly|finely|roughly|sliced|chopped|minced|diced|dry|dried)\b", lambda m: m.group(0) if m.group(0) in ("dry", "dried") else "", n)
    n = re.sub(r"\s+", " ", n).strip()
    n = re.sub(r"\bchicken broth\b", "chicken stock", n)   # same thing on the shelf
    return re.sub(r"(?<=[a-z])(es|s)$", "", n) if not n.endswith(("ss", "us")) else n

def have_key(name):
    """What the site's 'already have' checkbox stores in on_hand: the merge key, safe for a flat [a, b] list."""
    return re.sub(r"\s+", " ", re.sub(r"[\[\],#\"'`]", " ", key(name))).strip()

# ---- staples and on-hand matching
DESCRIPTORS = {"yellow", "white", "red", "sweet", "large", "medium", "small", "fresh", "kosher", "flaky", "sea", "fine", "coarse",
               "unsalted", "salted", "whole", "grated", "freshly", "ground", "cracked", "cold", "good", "extra-virgin", "extra", "virgin",
               "light", "regular", "block", "shaved", "chopped", "diced", "sliced", "minced", "thinly", "finely", "shredded", "softened", "melted", "low-sodium", "full-fat", "plain", "of"}
ALIASES = {"chili crunch": "chili crisp", "chili oil or chili crunch": "chili crisp", "chilli crisp": "chili crisp"}
def matches(item, staple):
    """True when the item IS the staple, allowing only descriptor words before it ('kosher salt', 'large yellow onions').
    'coconut milk' does not match 'milk'; 'rice vinegar' does not match 'rice'."""
    item = ALIASES.get(item.lower().strip(), item)
    it = [w for w in re.sub(r"[^a-z\- ]", " ", item.lower()).split() if w not in ("clove", "cloves")]; st = staple.lower().split()
    sing = lambda w: re.sub(r"(?<=[a-z])(es|s)$", "", w) if not w.endswith(("ss", "us")) else w
    it, st = [sing(w) for w in it], [sing(w) for w in st]
    for alt in " ".join(it).split(" or "):      # 'barramundi or flounder': any alternative
        a = alt.split()
        if len(a) >= len(st) and a[-len(st):] == st and all(w in DESCRIPTORS for w in a[:-len(st)]): return True
    return False

def section(name):
    n = name.lower()
    if re.search(r"\bfrozen\b", n): return "frozen"
    if re.search(r"\b(wine|beer|bourbon|vodka|gin|rum|vermouth|sherry|brandy)\b", n) and "vinegar" not in n: return "other"
    if re.search(r"\b(picanha|steak|beef|chuck|short ?ribs?|brisket|chicken|thighs?|pork|bacon|sausage|lamb|turkey|shrimp|fish|salmon|barramundi|flounder|cod|scallops?|mussels|clams|crab|prosciutto|pancetta|chorizo)\b", n) \
       and not re.search(r"\b(stock|broth|bouillon|sauce|paste)\b", n): return "meat and seafood"
    if re.search(r"\b(butter|milk|cream|cheese|parmesan|pecorino|feta|mozzarella|ricotta|yogurt|eggs?|cottage|mascarpone|crème fraîche|sour cream)\b", n) \
       and not re.search(r"\b(coconut|peanut|almond|oat|apple) (milk|cream|butter)\b", n): return "dairy"
    if re.search(r"\b(dried|ground|powder|flakes|canned|can|oil|purée|puree|extract|chips|pecans|walnuts|almonds|nuts|seeds|mix|crunch|crisp|tortillas|vinegar|salsa)\b", n): return "pantry"
    if re.search(r"\b(onions?|shallots?|garlic|mushrooms?|cremini|shiitake|potato(es)?|thyme|rosemary|sage|parsley|cilantro|basil|mint|dill|chives|limes?|lemons?|ginger|carrots?|zucchini|celery|serranos?|jalapeños?|bell peppers?|scallions?|green onions?|spinach|kale|lettuce|arugula|cabbage|tomato(es)?|squash|apples?|avocados?|cucumbers?|herbs?|greens|leeks?|fennel|broccoli|cauliflower|green beans|corn|broccolini|snap peas|bok choy|sweet potato(es)?)\b", n): return "produce"
    if re.search(r"\b(stock|broth|polenta|grits|rice|pasta|orzo|spaghetti|couscous|quinoa|oats|farro|tortillas|chickpeas|olives|capers|noodles?|flour|sugar|vinegar|oil|mustard|dijon|sauce|paste|spice|salt|pepper|curry|turmeric|cumin|paprika|honey|beans|lentils|bamboo shoots|coconut milk|aminos|sambal|breadcrumbs|panko)\b", n): return "pantry"
    return "other"

# ---- merging
def merge(entries):
    """entries: parsed lines (with 'recipe'). Merge same item when units are compatible; otherwise keep separate lines."""
    groups = {}
    for e in entries:
        k = (key(e["name"]), e["kind"] if e["kind"] in ("w", "v") else (e["kind"], e["unit"] and UNITS[e["unit"]][0], e["size"]))
        if e["qty"] is None or (e["range"] and e["kind"] not in ("w", "v")): k = k + (id(e),)   # no amount, or a count range: never summed
        groups.setdefault(k, []).append(e)
    out = []
    for k, es in groups.items():
        e0 = es[0]; recipes = sorted({e["recipe"] for e in es})
        if len(es) == 1 or e0["qty"] is None:
            line = clean_line(e0)
        else:
            if e0["kind"] in ("w", "v"):
                lo = sum((e["qty"][0] if e["range"] else e["qty"]) * UNITS[e["unit"]][1] for e in es)
                hi = sum((e["qty"][1] if e["range"] else e["qty"]) * UNITS[e["unit"]][1] for e in es)
                name = max((e["name"] for e in es), key=lambda n: ("fresh" in n.lower(), -len(n)))
                if section(name) == "produce": name = PREP.sub("", name)
                if lo == hi: line = f"{fmt_amount(hi, e0['kind'])} {name}"
                else:
                    u = fmt_amount(hi, e0["kind"]).split(" ", 1)[1]; m = {"lb": 16, "oz": 1, "cup": 48, "cups": 48, "tbsp": 3, "tsp": 1}[u]
                    if m > 1 and ((lo / m) % F(1, 4) or (hi / m) % F(1, 4)): u, m = ("oz", 1) if e0["kind"] == "w" else ("tsp", 1)
                    line = f"{fmt(lo / m)} to {fmt(hi / m)} {u} {name}"
            else:
                total = sum(e["qty"] for e in es)
                u = e0["unit"]; sz = e0["size"]
                name = plural(e0["name"]) if total > 1 and not u else e0["name"]
                u = (u if total <= 1 or u.endswith("s") else UNITS_PLURAL.get(u, u + "s")) if u else None
                line = " ".join(x for x in [fmt(total), u, sz, name] if x)
        nice = re.sub(r"\s+", " ", re.sub(r"[\[\],#\"'`]", " ", PREP.sub("", e0["name"]).lower())).strip()
        out.append({"line": pretty(line), "item": e0["name"], "key": nice if have_key(nice) == have_key(e0["name"]) else have_key(e0["name"]), "section": section(e0["name"]), "recipes": recipes,
                    "optional": all(e["optional"] for e in es), "from": [e["raw"] for e in es]})
    return out

UNITS_PLURAL = {"bunch": "bunches", "pint": "pints"}
def plural(n):
    w = n.split()
    if not w or w[-1].endswith("s"): return n
    last = w[-1]; last = last + "es" if last.endswith(("o", "ch", "sh", "x")) else last + "s"
    return " ".join(w[:-1] + [last])

def fmt_amount(base, kind):
    if kind == "w":
        return f"{fmt(base / 16)} lb" if base >= 16 and (base % 4 == 0) else f"{fmt(base)} oz"
    if base >= 12: return f"{fmt(base / 48)} cup{'s' if base > 48 else ''}"   # 12 tsp = ¼ cup
    if base >= 3 and base % F(3, 2) == 0: return f"{fmt(base / 3)} tbsp"
    return f"{fmt(base)} tsp"

def pretty(s):
    for k, v in UNI.items(): s = re.sub(rf"\b{v}\b", k, s)
    return s

SHORT = {"tablespoon": "tbsp", "tablespoons": "tbsp", "teaspoon": "tsp", "teaspoons": "tsp", "pound": "lb", "pounds": "lb", "ounce": "oz", "ounces": "oz"}
PREP = re.compile(r"\b(?:thinly |finely |roughly )?(?:sliced|minced|chopped|diced|grated)\s+", re.I)
def clean_line(e):
    """One standalone shopping line, prep notes and parentheticals dropped: '8 oz cremini mushrooms'."""
    if section(e["name"]) == "produce": e = {**e, "name": PREP.sub("", e["name"])}
    if e["unit"]: e = {**e, "unit": SHORT.get(e["unit"], e["unit"])}
    if e["qty"] is None: return e["name"][0].upper() + e["name"][1:] if e["name"] else e["raw"]
    q = e["qty"]
    qs = f"{fmt(q[0])} to {fmt(q[1])}" if e["range"] else fmt(q)
    return " ".join(x for x in [qs, e["unit"], e["size"], e["name"]] if x)

# ---- short names for the shared list (/groceries.txt, items[].short)
def grocery_names():
    """kitchen/grocery-names.md: '- <key> | <Short name>' overrides, keyed by items[].key."""
    f = ROOT / "kitchen/grocery-names.md"
    if not f.exists(): return {}
    out = {}
    for l in f.read_text().splitlines():
        if l.startswith("- ") and " | " in l:
            k, v = l[2:].split(" | ", 1)
            if k.strip() and v.strip(): out[have_key(k.strip())] = v.strip()
    return out

DROP = re.compile(r"(?i)\b(?:fresh|freshly|boneless|skinless|organic)\b\s*")
CONTAINER = re.compile(r"(?i)^(?:packages?|bags?|jars?|boxes|box|bottles?|containers?|tubs?)\s+(?:of\s+)?")
def short_name(name, k=None, names=None):
    """'1 lb Yukon Gold potatoes' item -> 'Yukon Gold potatoes'. Override map first (by merge key), else a cleaned, capitalized name."""
    names = grocery_names() if names is None else names
    for kk in [k, have_key(name)]:
        if kk and have_key(kk) in names: return names[have_key(kk)]
    n = CONTAINER.sub("", PREP.sub("", name)); n = DROP.sub("", n)
    n = re.sub(r"\s+", " ", n).strip(" ,;-")
    return n[:1].upper() + n[1:] if n else name

def to_txt(g):
    """Plain feed for the Sync Groceries Shortcut: one short name per line, non-optional items only,
    staples and on_hand already left off by build(). Deduped case-insensitively, in store-section order."""
    seen, out = set(), []
    for s in SECTIONS:
        for i in g["detail"]:
            if i["section"] != s or i["optional"]: continue
            if i["short"].lower() in seen: continue
            seen.add(i["short"].lower()); out.append(i["short"])
    return "\n".join(out) + ("\n" if out else "")

# ---- plans
def plans():
    out = []
    for f in sorted((ROOT / "plans").glob("*.md")):
        if f.name.lower() == "readme.md": continue
        fm, body = parse_fm(f.read_text())
        if fm: out.append((f, fm, body))
    return out

def current(today=None):
    """The plan whose week contains today; else the next upcoming one; else the latest past one."""
    today = today or datetime.date.today(); ps = plans()
    if not ps: return None
    def start(p): return datetime.date.fromisoformat(p[1]["starts"])
    for p in ps:
        if start(p) <= today <= start(p) + datetime.timedelta(days=6): return p
    up = [p for p in ps if start(p) > today]
    return min(up, key=start) if up else max(ps, key=start)

def load_recipes():
    rs = {}
    for d in ["recipes", "cocktails"]:
        for f in (ROOT / d).glob("*.md"):
            fm, body = parse_fm(f.read_text())
            if fm: rs[f.stem] = (fm, body)
    return rs

def validate(f, fm, rs):
    errs = []
    for k in ["week", "starts"]:
        if not fm.get(k): errs.append(f"{f.name}: missing {k}")
    dup = [s for s in set((fm.get("recipes") or []) + (fm.get("extras") or [])) if ((fm.get("recipes") or []) + (fm.get("extras") or [])).count(s) > 1]
    if dup: errs.append(f"{f.name}: listed twice: {', '.join(dup)}")
    if fm.get("week") and fm["week"] != f.stem: errs.append(f"{f.name}: week != filename")
    try: datetime.date.fromisoformat(fm.get("starts", ""))
    except ValueError: errs.append(f"{f.name}: starts must be YYYY-MM-DD")
    for s in (fm.get("recipes") or []) + (fm.get("extras") or []):
        if s not in rs: errs.append(f"{f.name}: unknown recipe slug '{s}'")
    n = fm.get("nights") or []
    if n and len(n) != len(fm.get("recipes") or []): errs.append(f"{f.name}: nights must line up with recipes (same count)")
    for x in n:
        if x not in NIGHTS and x != "any": errs.append(f"{f.name}: bad night '{x}' (mon..sun or any)")
    return errs

def build(plan=None, today=None):
    p = plan or current(today)
    if not p: return None
    f, fm, body = p
    rs = load_recipes(); errs = validate(f, fm, rs)
    if errs: raise ValueError("; ".join(errs))
    st = staples(); on_hand = [x for x in fm.get("on_hand") or [] if x.strip()]
    def have_hit(e):   # which on_hand entry covers this line: same merge key, or the older loose match ('picanha')
        k = key(e["name"])
        return next((o for o in on_hand if k == have_key(o)), None) or next(
            (o for o in on_hand if matches(e["name"], o.lower()) or re.search(rf"\b{re.escape(o.lower())}", e["name"].lower())), None)
    entries, skipped_staples, skipped_onhand, meals = [], [], [], []
    nights = fm.get("nights") or ["any"] * len(fm["recipes"])
    extras = fm.get("extras") or []
    for slug, night in list(zip(fm["recipes"], nights)) + [(x, "extra") for x in extras]:
        rfm, rbody = rs[slug]
        meals.append({"slug": slug, "title": rfm.get("title", slug), "night": NIGHTS.get(night, "Any night" if night != "extra" else "Anytime"),
                      "kind": "extra" if night == "extra" else "dinner", "serves": rfm.get("serves", ""), "time_minutes": rfm.get("time_minutes", "")})
        for line in checklist(rbody):
            if line.startswith("#"): continue
            e = parse_line(line); e["recipe"] = slug
            if not e["name"]: continue
            parts = re.split(r"\s+(?:and|&)\s+", e["name"])
            hit = next((s for s in st if matches(e["name"], s)), None) or (
                ", ".join(h for h in (next((s for s in st if matches(x, s)), None) for x in parts)) if len(parts) > 1 and all(any(matches(x, s) for s in st) for x in parts) else None)
            if hit: e["staple"] = hit; skipped_staples.append(e); continue
            h = have_hit(e)
            if h: e["have"] = h; skipped_onhand.append(e); continue
            entries.append(e)
    for x in fm.get("add") or []:
        e = parse_line(x); e["recipe"] = "added"
        h = have_hit(e)
        if h: e["have"] = h; skipped_onhand.append(e)
        else: entries.append(e)
    items = merge(entries)
    names = grocery_names()
    for i in items: i["short"] = short_name(i["item"], i["key"], names)
    grouped = {s: [i for i in items if i["section"] == s and not i["optional"]] for s in SECTIONS}
    optional = [i for i in items if i["optional"]]
    check = sorted({x for e in skipped_staples for x in e["staple"].split(", ")})
    have = []   # 'Already have': the lines each on_hand entry took off the list (or the entry itself if it matched nothing)
    for o in on_hand:
        got = merge([e for e in skipped_onhand if e["have"] == o])
        have += [{"line": i["line"], "on_hand": o} for i in got] or [{"line": o, "on_hand": o}]
    return {"week": fm["week"], "starts": fm["starts"], "serves": fm.get("serves", "2"), "plan_file": f"plans/{f.name}",
            "meals": meals, "on_hand": fm.get("on_hand") or [], "note": body.strip(),
            "sections": [{"section": s, "items": [i["line"] for i in grouped[s]]} for s in SECTIONS if grouped[s]],
            "optional": [i["line"] for i in optional], "staples_assumed": check, "have": have,
            "detail": items}

def to_md(g, base="https://blind-tiger.pages.dev"):
    d = datetime.date.fromisoformat(g["starts"])
    L = [f"# This week: {d.strftime('%b %-d')} to {(d + datetime.timedelta(days=6)).strftime('%b %-d, %Y')}", "",
         f"Dinners for {g['serves']}. Plan file: {g['plan_file']}", "", "## Dinners", ""]
    L += [f"- {m['night']}: {m['title']} ({base}/r/{m['slug']})" for m in g["meals"] if m["kind"] == "dinner"] + [""]
    ex = [m for m in g["meals"] if m["kind"] == "extra"]
    if ex: L += ["## Also this week (bakes, sides, anytime)", ""] + [f"- {m['title']} ({base}/r/{m['slug']})" for m in ex] + [""]
    L += ["## Grocery list", ""]
    for s in g["sections"]:
        L += [f"### {s['section'].capitalize()}", ""] + [f"- {x}" for x in s["items"]] + [""]
    if not g["sections"]: L += ["Nothing to buy beyond staples.", ""]
    if g["optional"]: L += ["### Optional", ""] + [f"- {x}" for x in g["optional"]] + [""]
    if g["have"]: L += ["## Already have (not on the list)", ""] + [f"- [x] {h['line']}" for h in g["have"]] + [""]
    if g["staples_assumed"]: L += ["## Staples we're counting on", "", ", ".join(g["staples_assumed"]), ""]
    return "\n".join(L)

if __name__ == "__main__":
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    plan = None
    if args:
        f = pathlib.Path(args[0]); f = f if f.is_absolute() else pathlib.Path.cwd() / f
        fm, body = parse_fm(f.read_text()); plan = (f, fm, body)
    g = build(plan)
    if not g: print("No plans in plans/."); sys.exit(1)
    if "--txt" in sys.argv: print(to_txt(g), end=""); sys.exit(0)
    if "--json" in sys.argv: g.pop("detail") if "--short" in sys.argv else None; print(json.dumps(g, ensure_ascii=False, indent=2))
    else: print(to_md(g))
