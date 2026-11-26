"""Voice-friendly exports: site/recipes.json (full) and site/recipes-index.json (tiny). Plain text, no markdown, no emails."""
import json, re
from credit import credit as _credit
from site_url import SITE
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
            "time_minutes": r["time_minutes"] or None, "url": f'{SITE}/r/{r["slug"]}' if r["status"] != "retired" else None,
            "md_url": f'{SITE}/r/{r["slug"]}.md' if r["status"] != "retired" else None, "credit": _credit(r)[0], "credit_url": _credit(r)[1],
            "ingredients": yi or oi, "steps": ys or os_, "notes": notes[:3]}


def headers():
    """Cloudflare Pages _headers for the JSON, markdown and RSS exports."""
    hdr = "".join(f"/{f}\n  Cache-Control: public, max-age=300\n  Access-Control-Allow-Origin: *\n" for f in ("recipes.json", "recipes-index.json", "llms.txt", "openapi.json", "week.json", "week.md"))
    hdr += "/r/*\n  Cache-Control: public, max-age=300\n  Access-Control-Allow-Origin: *\n/r/*.md\n  Content-Type: text/markdown; charset=utf-8\n/week.md\n  Content-Type: text/markdown; charset=utf-8\n/week/*\n  Cache-Control: public, max-age=300\n/cocktails/*\n  Cache-Control: public, max-age=300\n"
    hdr += "/groceries.txt\n  Content-Type: text/plain; charset=utf-8\n  Cache-Control: no-cache\n  Access-Control-Allow-Origin: *\n"   # Sync Groceries Shortcut feed
    hdr += '/sync-groceries.shortcut\n  Content-Type: application/octet-stream\n  Content-Disposition: attachment; filename="Sync Groceries.shortcut"\n  Cache-Control: public, max-age=300\n'
    hdr += "/feed.xml\n  Content-Type: application/rss+xml; charset=utf-8\n  Cache-Control: public, max-age=300\n  Access-Control-Allow-Origin: *\n"
    hdr += "/follow-og.png\n  Content-Type: image/png\n  Cache-Control: public, max-age=86400\n  Access-Control-Allow-Origin: *\n"
    hdr += "/thanksgiving-drinks/menu.png\n  Content-Type: image/png\n  Cache-Control: public, max-age=86400\n  Access-Control-Allow-Origin: *\n"
    hdr += "/thanksgiving-drinks/*\n  Cache-Control: public, max-age=300\n"
    return hdr

def write(items, out):
    root = out.parent
    (out/"kitchen.json").write_text(json.dumps({"taste": (root/"kitchen/taste-profile.md").read_text(), "staples": (root/"kitchen/staples.md").read_text(),
        "inventory": (root/"kitchen/inventory.md").read_text() if (root/"kitchen/inventory.md").exists() else ""}, ensure_ascii=False))
    full = [entry(r) for r in items]
    (out/"recipes.json").write_text(json.dumps({"site": SITE, "count": len(full), "items": full}, indent=1, ensure_ascii=False))
    (out/"recipes-index.json").write_text(json.dumps([{k: e[k] for k in ("slug","title","tags","status","url")} for e in full], ensure_ascii=False))
    (out/"_headers").write_text(headers())
    (out/"llms.txt").write_text(f"""# Crews & Anna's Kitchen

> Recipes and cocktails from Crews and Anna. Plain-text data for AI agents.

## For AI agents
- Read recipes: {SITE}/recipes.json (full) or {SITE}/recipes-index.json (list)
- One recipe as a plain page (no JavaScript): {SITE}/r/<slug>, or as markdown: {SITE}/r/<slug>.md
- Share and fetch /r/<slug> (or /r/<slug>.md). Old /#r-<slug> links redirect to /r/<slug>. List of every page: {SITE}/r/, {SITE}/cocktails/, and {SITE}/sitemap.xml
- Add a recipe (default): follow https://github.com/TheYoungCrews/recipes/blob/main/AGENTS.md and email crews@mail.grokbot.com with "recipe:" or "cocktail:" in the subject
- Bulk add: POST {SITE}/api/recipes (Bearer key; schema {SITE}/openapi.json) or paste at {SITE}/add
- This week's dinners and grocery list: {SITE}/week/ (markdown {SITE}/week.md, JSON {SITE}/week.json)
- Add or remove a recipe on this week's plan: POST {SITE}/api/plan with {{"slug": "<slug>", "action": "add"|"remove"}} (Bearer key; GET /api/plan reads the live plan; details in AGENTS.md section 5)
- Mark a grocery line as already have: POST {SITE}/api/plan with {{"action": "have"|"unhave", "item": "<items[].key from /week.json>"}} (Bearer key)
- Agents with repo write access commit to inbox/ in https://github.com/TheYoungCrews/recipes

## Recipes
""" + "".join(f'- [{e["title"]}]({e["url"]}): markdown {e["md_url"]}\n' for e in sorted(full, key=lambda e: e["title"].lower()) if e["url"]))
