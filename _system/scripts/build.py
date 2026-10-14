#!/usr/bin/env python3
"""Build site/index.html from recipes/ and cocktails/. No dependencies.
Validates frontmatter against _system/SCHEMA.md / _system/TAGS.md; exits 1 on errors."""
import json, re, sys, html, pathlib
ROOT = pathlib.Path(__file__).resolve().parents[2]  # repo root (this file is _system/scripts/build.py)
REQ = ["title", "slug", "type", "status", "owner"]
STATUSES = {"to-try", "made", "favorite", "retired"}

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

def allowed_tags():
    tags = set()
    for line in (ROOT / "_system/TAGS.md").read_text().splitlines():
        if line.startswith("- **") and ":" in line:
            tags |= {t.strip() for t in line.split(":", 1)[1].split(",") if t.strip()}
    return tags

def staples():
    return [l[2:].split(" | ")[0].strip().lower() for l in (ROOT/"kitchen/staples.md").read_text().splitlines() if l.startswith("- ")]

def md_to_html(md):
    out, inlist = [], None
    for line in md.splitlines():
        s = line.strip()
        esc = html.escape(s)
        esc = re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", esc)
        esc = re.sub(r"(https?://\S+)", r'<a href="\1">\1</a>', esc)
        m_ul, m_ol = re.match(r"^- (\[[ x]\] )?(.*)", esc), re.match(r"^\d+\. (.*)", esc)
        kind = "ul" if m_ul else "ol" if m_ol else None
        if inlist and kind != inlist: out.append(f"</{inlist}>"); inlist = None
        if kind and not inlist:
            out.append('<ul class="chk">' if (m_ul and m_ul.group(1)) else f"<{kind}>"); inlist = kind
        if m_ul:
            box = m_ul.group(1)
            pre = ('<span class="box x"></span>' if "x" in box else '<span class="box"></span>') if box else ""
            out.append(f"<li>{pre}{m_ul.group(2)}</li>")
        elif m_ol: out.append(f"<li>{m_ol.group(1)}</li>")
        elif s.startswith("## "):
            out.append(f"<h3>{esc[3:]}</h3>")
        elif s.startswith("# "): out.append(f"<h2>{esc[2:]}</h2>")
        elif s: out.append(f"<p>{esc}</p>")
    if inlist: out.append(f"</{inlist}>")
    return "\n".join(out)

def static_html(items, st):
    """No-JavaScript version (iPhone Files / Quick Look disables JS). In-page links only."""
    e = html.escape
    miss = lambda r: [i for i in r["ingredients"] if i not in st]
    def card(r):
        m = miss(r)
        return (f'<li class="sc"><a href="#r-{e(r["slug"])}"><b>{"🍸 " if r["dir"]=="cocktails" else ""}{e(r["title"])}</b></a>'
                f'<br><small>{e(r["status"])} · {e(r["type"])}{" · "+e(str(r["time_minutes"]))+" min" if r["time_minutes"] else ""}'
                f'<br>{"Need: "+e(", ".join(m)) if m else "Have all staples"}</small></li>')
    def sec(i, title, rs):
        return f'<h2 id="{i}">{e(title)} ({len(rs)})</h2><ul class="sl">' + ("".join(card(r) for r in rs) or "<li>None</li>") + '</ul><p><a href="#top">↑ Top</a></p>'
    tags = sorted({t for r in items for t in r["tags"]})
    groups = [("g-food", "Food", [r for r in items if r["dir"]=="recipes"]),
              ("g-drinks", "Drinks", [r for r in items if r["dir"]=="cocktails"]),
              ("g-try", "To try", [r for r in items if r["status"]=="to-try"]),
              ("g-fav", "Favorites + made", [r for r in items if r["status"] in ("favorite","made")]),
              ("g-have", "Can make now (have all staples)", [r for r in items if not miss(r)]),
              ("g-near", "Missing 1 to 2 items", [r for r in items if 1 <= len(miss(r)) <= 2])]
    nav = " · ".join(f'<a href="#{i}">{e(t)}</a>' for i, t, _ in groups)
    tagnav = " · ".join(f'<a href="#t-{e(t)}">{e(t)}</a>' for t in tags)
    out = [f'<div id="top"></div><h1>🍲 Our Recipes</h1><p class="sn"><b>Browse:</b> {nav}</p><p class="sn"><b>Tags:</b> {tagnav}</p>']
    out.append(sec("all", "All recipes", sorted(items, key=lambda r: r["title"])))
    out += [sec(i, t, rs) for i, t, rs in groups]
    out += [sec("t-"+t, "Tag: "+t, [r for r in items if t in r["tags"]]) for t in tags]
    for r in items:
        src = r["source"]
        out.append(f'<hr><article id="r-{e(r["slug"])}"><h2>{e(r["title"])}</h2><p><small>{e(r["status"])} · {e(r["type"])} · {e(", ".join(r["tags"]))}</small></p>'
                   + (f'<p><small>Source: {e(src)}</small></p>' if src else "") + r["html"] + '<p><a href="#top">↑ Top</a></p></article>')
    return "\n".join(out)

TYPE_ORDER = [("main","Mains"),("soup-bowl","Soups & bowls"),("side","Sides"),("breakfast","Breakfast"),("snack","Snacks"),
              ("sauce","Sauces"),("prep-component","Building blocks"),("dessert","Desserts")]
STATUS_EMOJI = {"favorite": "⭐", "made": "✅", "to-try": "🆕", "retired": "💤"}

def readme(items):
    """The human front page. Regenerated on every build; don't edit by hand."""
    def row(r):
        t = f'{r["time_minutes"]} min' if r["time_minutes"] else "–"
        rating = f'{r["rating"]}/5' if r["rating"] else ""
        return f'| {STATUS_EMOJI.get(r["status"], "")} [{r["title"]}]({r["dir"]}/{r["slug"]}.md) | {t} | {r["owner"]} | {rating} |'
    live = [r for r in items if r["status"] != "retired"]
    food = [r for r in live if r["dir"] == "recipes"]; drinks = [r for r in live if r["dir"] == "cocktails"]
    made = sum(r["status"] in ("made", "favorite") for r in live)
    out = ["# 🍲 Crews & Anna's Kitchen", "",
           "The weeknight dinners we actually cook, the ones we want to try, and how we like them. "
           "Every recipe keeps the creator's original next to *our version*, tuned a little each time we make it.", "",
           f"**{len(food)} recipes · {sum(r['status'] in ('made','favorite') for r in food)} cooked · {sum(r['status']=='to-try' for r in food)} to try · {len(drinks)} drink{'s' if len(drinks)!=1 else ''}**", "",
           "⭐ favorite · ✅ made · 🆕 to try", ""]
    seen = set()
    for key, label in TYPE_ORDER + [(None, "Other")]:
        rs = sorted([r for r in food if (r["type"] == key if key else r["type"] not in dict(TYPE_ORDER))], key=lambda r: r["title"])
        if not rs: continue
        out += [f"## {label}", "", "| Recipe | Time | Owner | Rating |", "|---|---|---|---|"] + [row(r) for r in rs] + [""]
    if drinks:
        out += ["## 🍸 Cocktails", "", "| Drink | Time | Owner | Rating |", "|---|---|---|---|"] + [row(r) for r in sorted(drinks, key=lambda r: r["title"])] + [""]
    out += ["## Our kitchen", "",
            "- [Taste profile](kitchen/taste-profile.md): what we like, standing swaps, stores",
            "- [Staples](kitchen/staples.md): what's usually in the pantry",
            "- [Bar](kitchen/bar.md): what's on the shelf", "",
            "**Add a recipe:** send the link, photo or post to one of our agents, or email **crews@mail.grokbot.com** (`recipe: <name>`, or `made: <name> 4/5` after cooking).", "",
            "<sub>For agents: [AGENTS.md](AGENTS.md) · system files in [_system/](_system/README.md). This page is generated by `_system/scripts/build.py`.</sub>", ""]
    return "\n".join(out)

def main():
    tags_ok, errs, items, warns, infos = allowed_tags(), [], [], [], []
    TIME_TAGS = ["quick-20", "weeknight-30", "weeknight-45", "weekend-project"]
    for d in ["recipes", "cocktails"]:
        for f in sorted((ROOT/d).glob("*.md")):
            fm, body = parse_fm(f.read_text())
            if fm is None: errs.append(f"{f.name}: no frontmatter"); continue
            for k in REQ:
                if not fm.get(k): errs.append(f"{f.name}: missing {k}")
            if fm.get("slug") and fm["slug"] != f.stem: errs.append(f"{f.name}: slug != filename")
            if fm.get("status") not in STATUSES: errs.append(f"{f.name}: bad status {fm.get('status')}")
            for t in fm.get("tags") or []:
                if t not in tags_ok: errs.append(f"{f.name}: unknown tag '{t}' (add to _system/TAGS.md)")
            if fm.get("type") and fm["type"] not in tags_ok: errs.append(f"{f.name}: unknown type '{fm['type']}'")
            nums = {}
            for k in ["time_minutes", "prep_minutes", "cook_minutes"]:
                v = fm.get(k, "")
                if v in ("", None): continue
                if not re.fullmatch(r"\d+", str(v)): errs.append(f"{f.name}: {k} must be a whole number (got '{v}')")
                else: nums[k] = int(v)
            if "prep_minutes" in nums and "cook_minutes" in nums and "time_minutes" in nums and nums["prep_minutes"] + nums["cook_minutes"] != nums["time_minutes"]:
                (infos if nums["time_minutes"] < nums["prep_minutes"] + nums["cook_minutes"] else warns).append(f"{f.name}: prep {nums['prep_minutes']} + cook {nums['cook_minutes']} = {nums['prep_minutes']+nums['cook_minutes']} but time_minutes is {nums['time_minutes']}")
            total = nums.get("time_minutes", (nums["prep_minutes"] + nums["cook_minutes"]) if {"prep_minutes","cook_minutes"} <= nums.keys() else None)
            if total is not None and fm.get("type") not in ("cocktail", "mocktail"):
                want = "quick-20" if total <= 20 else "weeknight-30" if total <= 30 else "weeknight-45" if total <= 45 else "weekend-project"
                have = [t for t in fm.get("tags") or [] if t in TIME_TAGS]
                if have != [want]: warns.append(f"{f.name}: total {total} min suggests time tag '{want}' (has {have or 'none'})")
            if "stores" in fm: errs.append(f"{f.name}: 'stores:' not allowed in recipes (grocery-list step only)")
            if re.search(r"^- \[[ x]\] .* @[a-z-]+\s*$", body, re.M): errs.append(f"{f.name}: '@store' marks not allowed in checklists")
            items.append({**{k: fm.get(k, "") for k in ["title","slug","type","status","owner","rating","time_minutes","prep_minutes","cook_minutes","serves","source","last_made"]},
                          "tags": fm.get("tags") or [], "ingredients": [i.lower() for i in fm.get("ingredients") or []],
                          "dir": d, "html": md_to_html(body)})
    for i in infos: print("info:", i, "(lower total kept: round-down rule)")
    for w in warns: print("WARN:", w)
    if errs:
        print("VALIDATION ERRORS:\n  " + "\n  ".join(errs)); sys.exit(1)
    data = json.dumps({"items": items, "staples": staples()}).replace("</", "<\\/")
    out = ROOT/"site"; out.mkdir(exist_ok=True)
    page = (ROOT/"_system/scripts/site_template.html").read_text().replace("/*DATA*/null", data)
    page = page.replace("<!--STATIC-->", static_html(items, set(staples())))
    (out/"index.html").write_text(page)
    keys = ["title","slug","type","status","owner","tags","ingredients","time_minutes","prep_minutes","cook_minutes","serves","rating","last_made","source"]
    index = [{**{k: r[k] for k in keys}, "path": f'{r["dir"]}/{r["slug"]}.md'} for r in items]
    (out/"recipes.json").write_text(json.dumps(index, indent=2, ensure_ascii=False))
    (ROOT/"README.md").write_text(readme(items))
    print(f"built site/index.html with {len(items)} items")

if __name__ == "__main__": main()
