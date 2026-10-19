"""Voice-friendly exports: site/recipes.json (full) and site/recipes-index.json (tiny). Plain text, no markdown, no emails."""
import json, re
from credit import credit as _credit

SITE = "https://blind-tiger.pages.dev"
EMAIL = re.compile(r"[\w.+-]+@[\w-]+\.[\w.]+")

def plain(s):
    s = re.sub(r"!\[[^\]]*\]\([^)]*\)", "", s)
    s = re.sub(r"\[([^\]]+)\]\([^)]*\)", r"\1", s)
    s = re.sub(r"[*_`]{1,3}", "", s)
    s = EMAIL.sub("[email]", s)
    return re.sub(r"\s+", " ", s).strip()

def sections(body):
    out, cur = {}, None
    for line in body.splitlines():
        m = re.match(r"^##\s+(.*)", line)
        if m: cur = m.group(1).strip().lower(); out[cur] = []; continue
        if cur: out[cur].append(line)
    return out

def parse(lines):
    ings, steps = [], []
    for l in lines:
        s = l.strip()
        m = re.match(r"^[-*]\s+(?:\[[ xX]\]\s+)?(.*)", s)
        if m: ings.append(plain(m.group(1))); continue
        m = re.match(r"^\d+[.)]\s+(.*)", s)
        if m: steps.append(plain(m.group(1)))
    return [i for i in ings if i], [s for s in steps if s]

def entry(r):
    sec = sections(r["body"])
    oi, os_ = parse(sec.get("original", []))
    yi, ys = parse(sec.get("our version", []))
    notes = [plain(re.sub(r"^[-*]\s+", "", l.strip())) for l in sec.get("notes", []) if re.match(r"^\s*[-*]\s+", l)]
    return {"slug": r["slug"], "title": r["title"], "type": r["type"], "status": r["status"],
            "tags": r["tags"], "rating": r["rating"] or None, "cooks": r["cooks"] or 0,
            "last_made": r["last_made"] or None, "serves": r["serves"] or None,
            "time_minutes": r["time_minutes"] or None, "url": f'{SITE}/#r-{r["slug"]}', "credit": _credit(r)[0], "credit_url": _credit(r)[1],
            "ingredients": yi or oi, "steps": ys or os_, "notes": notes[:3]}

def write(items, out):
    root = out.parent
    (out/"kitchen.json").write_text(json.dumps({"taste": (root/"kitchen/taste-profile.md").read_text(), "staples": (root/"kitchen/staples.md").read_text()}, ensure_ascii=False))
    full = [entry(r) for r in items]
    (out/"recipes.json").write_text(json.dumps({"site": SITE, "count": len(full), "items": full}, indent=1, ensure_ascii=False))
    (out/"recipes-index.json").write_text(json.dumps([{k: e[k] for k in ("slug","title","tags","status")} for e in full], ensure_ascii=False))
    hdr = "".join(f"/{f}\n  Cache-Control: public, max-age=300\n  Access-Control-Allow-Origin: *\n" for f in ("recipes.json", "recipes-index.json", "llms.txt", "openapi.json"))
    (out/"_headers").write_text(hdr)
    (out/"llms.txt").write_text("""# Crews & Anna's Kitchen

> Recipes and cocktails from Crews and Anna. Plain-text data for AI agents.

## For AI agents
- Read recipes: https://blind-tiger.pages.dev/recipes.json (full) or https://blind-tiger.pages.dev/recipes-index.json (list)
- Add a recipe (default): follow https://github.com/TheYoungCrews/recipes/blob/main/AGENTS.md and email crews@mail.grokbot.com with "recipe:" or "cocktail:" in the subject
- Bulk add: POST https://blind-tiger.pages.dev/api/recipes (Bearer key; schema https://blind-tiger.pages.dev/openapi.json) or paste at https://blind-tiger.pages.dev/add
- Agents with repo write access commit to inbox/ in https://github.com/TheYoungCrews/recipes
""")
