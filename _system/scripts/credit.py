"""Public credit line for a recipe: 'By Crews', 'Mom's recipe', or the creator (linked to the video or source URL).
Never exposes the pipeline (ChatGPT, Apple Notes, Muse, email, via). Optional frontmatter `credit:` wins.
Credit the original recipe creator, not a reposter. Optional `source_url` is the public link
(the specific video, else the creator's YouTube channel, else their Instagram profile);
if it is omitted, a URL in `source` is used."""
import re
from urllib.parse import urlparse, urlunparse, parse_qsl, urlencode

PEOPLE = {"crews": "By Crews", "anna": "By Anna", "anna+crews": "By Crews & Anna", "crews+anna": "By Crews & Anna",
          "mom": "Mom's recipe", "crews-mom": "Mom's recipe", "anna-mom": "Anna's mom's recipe"}
HOUSE = {"crews": "Crews", "anna": "Anna", "anna+crews": "Both", "crews+anna": "Both",
         "mom": "Mom", "crews-mom": "Mom", "anna-mom": "Anna's mom"}
PIPE = re.compile(r"chatgpt|gemini|claude|muse|instinct|grok|apple notes|cooking notes|cocktail notes|email|\bvia\b|ai-generated|text from|unknown|source_type", re.I)
DOMAINS = {"southernliving.com": "Southern Living", "whiteoakpastures.com": "White Oak Pastures", "theguardian.com": "The Guardian",
           "food.com": "Food.com", "liquor.com": "Liquor.com", "alpenz.com": "Haus Alpenz", "ajc.com": "AJC", "seriouseats.com": "Serious Eats"}
DROP_QS = {"igsh", "igshid", "exln", "fbclid", "gclid", "si", "feature", "pp", "hl", "rdl", "refsrc", "mbid"}
HASH_RE = re.compile(r"^#r-([a-z0-9]+(?:-[a-z0-9]+)*)$", re.I)

def clean_url(u):
    """Strip tracking query params, fragments and trailing punctuation from a URL."""
    if not u: return ""
    u = str(u).strip().rstrip(").,\"'")
    p = urlparse(u)
    if p.scheme not in ("http", "https") or not p.netloc: return ""
    q = [(k, v) for k, v in parse_qsl(p.query, keep_blank_values=True)
         if not k.lower().startswith("utm_") and k.lower() not in DROP_QS]
    return urlunparse((p.scheme, p.netloc, p.path, p.params, urlencode(q), ""))

def url_of(src):
    m = re.search(r"https?://\S+", src or "")
    return clean_url(m.group(0)) if m else ""

def from_url(u):
    p = urlparse(u); host = p.netloc.lower().removeprefix("www.").removeprefix("blog.")
    if "instagram.com" in host or "tiktok.com" in host or "youtube.com" in host or "youtu.be" in host:
        m = re.match(r"/@?([A-Za-z0-9._]+)/?$", p.path)
        if m and m.group(1) not in ("reel", "p", "watch", "shorts", "c", "channel"): return "@" + m.group(1)
        return None
    for d, name in DOMAINS.items():
        if host.endswith(d): return name
    return host or None

def credit_href(fm):
    """Public link for the credit: source_url if set, else a URL in source."""
    return url_of(str(fm.get("source_url") or "")) or url_of(str(fm.get("source") or "")) or None

def credit(fm):
    """Returns (text, href) or (None, None)."""
    src, st = str(fm.get("source") or ""), str(fm.get("source_type") or "").lower()
    owner = str(fm.get("owner") or "").strip().strip('"').lower()
    href = credit_href(fm)
    if fm.get("credit"): return str(fm["credit"]).strip().strip('"'), href
    if st in ("own", "ai", "family") or PIPE.search(src) and not href:
        if owner in PEOPLE: return PEOPLE[owner], None
        who = str(fm.get("added_by") or "").lower()
        return PEOPLE.get(who, "By Crews"), None
    o = str(fm.get("owner") or "").strip().strip('"')
    if o and owner not in PEOPLE and owner != "unknown" and not PIPE.search(o): return o, href
    if href: return from_url(href), href
    return None, None

def facts_owner(fm):
    """(label, href) for the compact OWNER cell. Household stays short and unlinked.
    Creators use the credit text (or a cleaned owner), linked when we have a URL.
    No quotes, and handles are not title-cased."""
    owner = str(fm.get("owner") or "").strip().strip('"').lower()
    if owner in HOUSE:
        return HOUSE[owner], None
    if owner in ("", "unknown"):
        return "–", None
    name = str(fm.get("credit") or "").strip().strip('"') or str(fm.get("owner") or "").strip().strip('"')
    return (name or "–"), credit_href(fm)

def hash_redirect_path(hash_value):
    """If hash is #r-<slug>, return the canonical /r/<slug> path, else ''."""
    m = HASH_RE.fullmatch((hash_value or "").strip())
    return f"/r/{m.group(1).lower()}" if m else ""
