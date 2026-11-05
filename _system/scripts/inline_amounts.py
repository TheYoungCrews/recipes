"""Inline amounts in Our version steps.

Every step that adds or uses a listed ingredient should carry its amount inline,
e.g. "add the ginger (1 tbsp, grated)". This module reads a recipe body's
"## Our version" checklist, works out each item's name and amount, and reports
items that a step mentions while no step mention shows the amount nearby.
build.py prints those as warnings (never errors). Run directly to list them:
  python3 _system/scripts/inline_amounts.py [files...]
"""
import re, sys, unicodedata
from pathlib import Path

FRAC = "½¼¾⅓⅔⅛⅜⅝⅞"
NUM = rf"(?:\d+(?:[ -]\d+/\d+|[.,/]\d+)?[{FRAC}]?|[{FRAC}])"
QTY = rf"{NUM}(?:\s*(?:-|–|to|or)\s*{NUM})?"
UNITS = ("oz|ounces?|fl oz|lbs?|pounds?|g|grams?|kg|ml|l|liters?|cups?|c|tbsp|tablespoons?|tsp|teaspoons?|cloves?|cans?|"
         "packages?|pkg|bunch(?:es)?|sprigs?|dash(?:es)?|drops?|slices?|pinch(?:es)?|small|medium|large|inch(?:es)?|"
         "-inch|cm|pieces?|heads?|stalks?|jars?|bottles?|sticks?|handfuls?|fillets?|links?|leaves|qt|quarts?|pints?|barspoons?|bsp")
WORD_QTY = r"(?:a|an|one|two|three|four|five|six|half|a few|a couple|a handful|a pinch|a splash|a dash|a bunch|a small handful|a big handful|several|few|couple)"
NO_AMOUNT = re.compile(r"amount not given|not given|not recorded|unspecified|no amount", re.I)
GENERIC = {"oil", "juice", "sauce", "powder", "paste", "seeds", "seed", "leaves", "cheese", "water", "stock", "broth", "pepper",
           "salt", "sugar", "wine", "syrup", "liqueur", "vinegar", "beans", "mix", "cream", "milk", "flakes", "zest", "fat",
           "drippings", "cubes", "cube", "ice", "bitters", "steak", "steaks", "meat", "spice", "spices", "blend", "chips",
           "and", "or", "of", "the", "with", "for", "fresh", "dried", "ground", "whole", "large", "small", "red", "green",
           "white", "black", "yellow", "hot", "sweet", "dry", "light", "dark", "simple", "homemade", "tea", "rings", "peel"}
NO_PREFIX = {"fish", "olive", "chili", "hot", "soy", "coconut", "sesame oil", "maple", "orange", "lemon", "lime", "tomato", "garlic", "onion", "egg", "baking", "sea", "kosher", "brown", "powdered", "granulated", "heavy", "sour", "cream", "bone", "beef", "vegetable", "red pepper"}
HEAD_SECOND = {"thighs", "thigh", "breasts", "breast", "fillets", "fillet", "steaks", "cloves", "leaves", "sprigs", "wedges",
               "seeds", "patties", "links", "chunk", "florets"}

def fold(s):
    """Lowercase and drop accents, one char per char so spans line up with the original text."""
    out = []
    for c in s:
        d = unicodedata.normalize("NFKD", c)
        out.append(d[0] if len(d) > 1 and d[0].isalpha() and all(unicodedata.combining(x) for x in d[1:]) else c)
    return "".join(out).lower()

def section(body, name="Our version"):
    m = re.search(rf"^## {name}[^\n]*\n(.*?)(?=^## |\Z)", body, re.M | re.S)
    return m.group(1) if m else ""

def checklist(body):
    out = []
    for line in section(body).splitlines():
        m = re.match(r"^- (?:\[[ xX]\] )?(.+)$", line.strip())
        if m: out.append(parse_item(m.group(1)))
    return [i for i in out if i]

def steps(body):
    return [m.group(1) for m in re.finditer(r"^\d+\.\s+(.*)$", section(body), re.M)]

def has_qty(s):
    s = s.strip()
    if NO_AMOUNT.search(s) or re.match(r"(?:to taste|optional|as needed|for serving|to serve|for garnish)\b", s, re.I): return False
    return bool(re.search(NUM, s) or re.match(WORD_QTY + r"\b", s, re.I))

def parse_item(text):
    t = re.sub(r"^\s*(?:optional|garnish)\s*:\s*", "", text.strip(), flags=re.I)
    t = re.sub(r"\*\*|`", "", t)
    m = re.match(rf"^((?:about |~|approx\.? )?{QTY}(?:\s*\([^)]*\))?(?:\s*(?:{UNITS})\b\.?)?(?:\s*\([^)]*\))?(?:\s+(?:small|medium|large|can|cans|jar|package|bunch))?)\s+(?:of\s+)?(.+)$", t, re.I)
    if m:
        qty, rest = m.group(1).strip(), m.group(2)
        name = re.split(r",|\s\(|;|\s-\s|\s–\s", rest)[0].strip()
        extra = rest[len(name):].strip(" ,")
        amount = qty if not extra or extra.startswith("(") else f"{qty}, {extra}"
    else:
        name = re.split(r"\s\(|,|;|\s-\s|\s–\s", t)[0].strip()
        rest = t[len(name):].strip(" ,")
        pm = re.match(r"^\(([^)]*)\)", rest)
        amount = ""
        if pm:
            first = re.split(r";", pm.group(1))[0].strip()
            if has_qty(first): amount = first
    if not name: return None
    amount = re.sub(r"\s*\(([^)]*)\)", r", \1", amount).strip(" ,")
    if amount and not has_qty(amount): amount = ""
    return {"raw": text, "name": name, "amount": amount, "aliases": aliases(name)}

def aliases(name):
    n = fold(re.sub(r"[^\w\s'&-]", " ", name)).strip()
    n = re.sub(r"\s+", " ", n)
    words = n.split()
    al = {n}
    for i in range(1, len(words)):
        suf = " ".join(words[i:])
        if len(words) - i > 1 or (suf not in GENERIC and len(suf) > 2): al.add(suf)
    if len(words) >= 2 and words[1] in HEAD_SECOND and words[0] not in GENERIC: al.add(words[0])
    if words and words[0] in ("fresh", "dried", "frozen"): al.add(" ".join(words[1:]))
    if len(words) >= 2 and words[-1] in GENERIC | HEAD_SECOND:
        pre = " ".join(words[:-1])
        if pre not in GENERIC and pre not in NO_PREFIX and len(pre) > 2: al.add(pre)
    return {a for a in al if a}

def core(amount):
    m = re.search(rf"{QTY}(?:\s*(?:{UNITS})\b)?|{WORD_QTY}\b", amount, re.I)
    return m.group(0) if m else amount

def _rx(alias):
    return re.compile(r"(?<![\w-])" + re.escape(alias).replace(r"\ ", r"\s+") + r"(?:e?s)?(?![\w-])", re.I)

def mentions(items, text):
    """Map item index -> list of (start, end) spans in text, longest alias wins, shared aliases dropped."""
    owner = {}
    for idx, it in enumerate(items):
        for a in it["aliases"]:
            owner.setdefault(a, set()).add(idx)
    taken, spans = [], {}
    pairs = sorted(((a, ids) for a, ids in owner.items()), key=lambda p: -len(p[0]))
    ft = fold(text)
    for a, ids in pairs:
        if len(ids) > 1:
            full = [i for i in ids if fold(items[i]["name"]) == a]
            if len(full) != 1: continue
            ids = set(full)
        (idx,) = ids
        for m in _rx(a).finditer(ft):
            if any(m.start() < e and s < m.end() for s, e in taken): continue
            taken.append((m.start(), m.end())); spans.setdefault(idx, []).append((m.start(), m.end()))
    return spans

def missing(body):
    """Items with an amount that steps mention, where no mention shows the amount nearby."""
    items, st = checklist(body), steps(body)
    if not items or not st: return []
    text = "\n".join(st)
    spans = mentions(items, text)
    out = []
    for idx, sp in spans.items():
        it = items[idx]
        if not it["amount"]: continue
        c = fold(core(it["amount"]))
        ok = any(c in fold(text[max(0, s - 40): e + 60]) for s, e in sp)
        if not ok: out.append(it)
    return out

def suggest(body):
    """Return body with ' (amount)' added after the first step mention of each item that lacks it. For review, not blind use."""
    items, st = checklist(body), steps(body)
    if not items or not st: return body
    lack = {i["raw"] for i in missing(body)}
    text = "\n".join(st)
    spans = mentions(items, text)
    ins = []
    for idx, sp in spans.items():
        if items[idx]["raw"] not in lack: continue
        s, e = min(sp)
        if text[e:e + 2].strip().startswith("("): continue
        ins.append((e, f" ({items[idx]['amount']})"))
    for e, add in sorted(ins, reverse=True): text = text[:e] + add + text[e:]
    new = text.split("\n")
    sec = section(body); out = sec; k = 0
    def rep(m):
        nonlocal k
        r = f"{m.group(1)}{new[k]}"; k += 1; return r
    out = re.sub(r"^(\d+\.\s+).*$", rep, sec, flags=re.M)
    return body.replace(sec, out, 1)

def main(paths):
    root = Path(__file__).resolve().parents[2]
    files = [Path(p) for p in paths] or sorted(list((root/"recipes").glob("*.md")) + list((root/"cocktails").glob("*.md")))
    n = 0
    for f in files:
        for it in missing(f.read_text()):
            n += 1; print(f"{f.name}: step mentions '{it['name']}' without its amount ({it['amount']})")
    print(f"{n} step mentions missing inline amounts")

if __name__ == "__main__":
    if sys.argv[1:2] == ["--suggest"]:
        for p in sys.argv[2:]:
            f = Path(p); t = f.read_text(); fm_end = t.find("\n---", 3) + 4
            f.write_text(t[:fm_end] + suggest(t[fm_end:]))
    else: main(sys.argv[1:])
