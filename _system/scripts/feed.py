"""Public activity feed: new dishes and ratings only.

No weekly plans, inventory, grocery lists, addresses, emails or other
personal info. Built at site-build time into /feed.xml and /follow.
"""
import datetime, html, re
from zoneinfo import ZoneInfo

BASE = "https://blind-tiger.pages.dev"
ET = ZoneInfo("America/New_York")
EMAIL = re.compile(r"[\w.+-]+@[\w-]+\.[\w.]+")
FEED_CAP = 50
DRINK = ("cocktail", "mocktail")

def _plain(s):
    s = EMAIL.sub("[email]", s or "")
    s = s.replace(" — ", ", ").replace("—", ", ").replace("–", "-")
    return re.sub(r"\s+", " ", s).strip()

def _day(s):
    try:
        return datetime.date.fromisoformat(str(s).strip()[:10])
    except (TypeError, ValueError):
        return None

def _rate(v):
    try:
        return f"{float(v):g}"
    except (TypeError, ValueError):
        return str(v).strip()

def events(items, cap=FEED_CAP):
    """Additions and ratings, newest first. items are the build.py recipe dicts."""
    import site_render
    ev, seen = [], {}
    for r in items:
        if r.get("status") == "retired":
            continue
        slug, title = r.get("slug") or "", r.get("title") or ""
        if not slug or not title:
            continue
        url = f"{BASE}/r/{slug}"
        kind = "cocktail" if r.get("type") in DRINK else "recipe"
        category = "cocktails" if r.get("type") in DRINK or r.get("dir") == "cocktails" else "food"
        added = _day(r.get("added"))
        if added:
            P = site_render.recipe_parts(r)
            note = _plain(P.get("intro") or "") or f"A new {kind} in the cookbook."
            ev.append({
                "kind": "added",
                "date": added,
                "title": f"Added: {title}",
                "dish": title,
                "link": url,
                "guid": f"{url}#added-{added.isoformat()}",
                "note": note,
                "slug": slug,
                "category": category,
                "rating": "",
                "photo": r.get("photo") or "",
            })
        else:
            P = None
        for d in (P or site_render.recipe_parts(r)).get("diary") or []:
            if not d.get("rating"):
                continue
            dt = _day(d.get("date"))
            if not dt:
                continue
            rate = _rate(d["rating"])
            who = re.sub(r"[^a-z]", "", (d.get("who") or "").lower())
            guid = f"{url}#rated-{dt.isoformat()}-{rate}-{who or 'us'}"
            seen[guid] = seen.get(guid, 0) + 1
            if seen[guid] > 1:
                guid = f"{guid}-{seen[guid]}"
            ev.append({
                "kind": "rated",
                "date": dt,
                "title": f"Rated {rate}/5: {title}",
                "dish": title,
                "link": url,
                "guid": guid,
                "note": _plain(d.get("text") or ""),
                "slug": slug,
                "category": category,
                "rating": rate,
                "photo": r.get("photo") or "",
            })
    ev.sort(key=lambda e: (-e["date"].toordinal(), 0 if e["kind"] == "rated" else 1, e["title"].lower()))
    return ev[:cap]

def _pub(d, noon=True):
    t = datetime.time(12, 0) if noon else datetime.time(0, 0)
    return datetime.datetime.combine(d, t, tzinfo=ET).strftime("%a, %d %b %Y %H:%M:%S %z")

def _el(tag, text, **attrs):
    a = "".join(f' {k}="{html.escape(str(v), True)}"' for k, v in attrs.items())
    if text is None:
        return f"<{tag}{a}/>"
    return f"<{tag}{a}>{html.escape(str(text), False)}</{tag}>"

def rss(ev, now=None):
    """RSS 2.0 document for the given events."""
    now = now or datetime.datetime.now(ET)
    lines = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
        "<channel>",
        _el("title", "Crews & Anna's Kitchen"),
        _el("link", f"{BASE}/follow"),
        _el("description", "New recipes and ratings from Anna and Crews."),
        _el("language", "en-us"),
        _el("lastBuildDate", now.strftime("%a, %d %b %Y %H:%M:%S %z")),
        f'<atom:link href="{html.escape(BASE + "/feed.xml", True)}" rel="self" type="application/rss+xml"/>',
    ]
    for e in ev:
        lines += [
            "<item>",
            _el("title", e["title"]),
            _el("link", e["link"]),
            _el("guid", e["guid"], isPermaLink="false"),
            _el("pubDate", _pub(e["date"])),
        ]
        if e.get("note"):
            lines.append(_el("description", e["note"]))
        if e.get("category"):
            lines.append(_el("category", e["category"]))
        lines.append("</item>")
    lines += ["</channel>", "</rss>", ""]
    return "\n".join(lines)
