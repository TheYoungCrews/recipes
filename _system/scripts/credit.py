"""Public credit line for a recipe: 'By Crews', 'Mom's recipe', or the creator (linked to the source URL).
Never exposes the pipeline (ChatGPT, Apple Notes, Muse, email, via). Optional frontmatter `credit:` wins."""
import re
from urllib.parse import urlparse
PEOPLE = {"crews": "By Crews", "anna": "By Anna", "anna+crews": "By Crews & Anna", "crews+anna": "By Crews & Anna",
          "mom": "Mom's recipe", "crews-mom": "Mom's recipe", "anna-mom": "Anna's mom's recipe"}
PIPE = re.compile(r"chatgpt|gemini|claude|muse|instinct|grok|apple notes|cooking notes|cocktail notes|email|\bvia\b|ai-generated|text from|unknown|source_type", re.I)
DOMAINS = {"southernliving.com": "Southern Living", "whiteoakpastures.com": "White Oak Pastures", "theguardian.com": "The Guardian",
           "food.com": "Food.com", "liquor.com": "Liquor.com", "alpenz.com": "Haus Alpenz", "ajc.com": "AJC", "seriouseats.com": "Serious Eats"}

def url_of(src):
    m = re.search(r"https?://\S+", src or ""); return m.group(0).rstrip(").,\"'") if m else ""

def from_url(u):
    p = urlparse(u); host = p.netloc.lower().removeprefix("www.").removeprefix("blog.")
    if "instagram.com" in host or "tiktok.com" in host or "youtube.com" in host:
        m = re.match(r"/@?([A-Za-z0-9._]+)/?$", p.path)
        if m and m.group(1) not in ("reel", "p", "watch"): return "@" + m.group(1)
        return None
    for d, name in DOMAINS.items():
        if host.endswith(d): return name
    return host or None

def credit(fm):
    """Returns (text, href) or (None, None)."""
    src, st = str(fm.get("source") or ""), str(fm.get("source_type") or "").lower()
    owner = str(fm.get("owner") or "").strip().strip('"').lower()
    href = url_of(src) or None
    if fm.get("credit"): return str(fm["credit"]).strip().strip('"'), href
    if st in ("own", "ai", "family") or PIPE.search(src) and not href:
        if owner in PEOPLE: return PEOPLE[owner], None
        who = str(fm.get("added_by") or "").lower()
        return PEOPLE.get(who, "By Crews"), None
    o = str(fm.get("owner") or "").strip().strip('"')
    if o and owner not in PEOPLE and owner != "unknown" and not PIPE.search(o): return o, href
    if href: return from_url(href), href
    return None, None
