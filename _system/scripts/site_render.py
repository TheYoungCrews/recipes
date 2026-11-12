"""Render the Crews & Anna's Kitchen site (stdlib only). Called by build.py.
One index.html: home + every recipe as an <article id="r-slug"> shown via CSS :target,
so recipe links are deep-linkable (/#r-slug) and work without JavaScript."""
import base64, datetime, html, json, re, shutil, pathlib
E = html.escape
SITE = pathlib.Path(__file__).resolve().parents[1] / "web"
SEASONS = {12:"winter",1:"winter",2:"winter",3:"spring",4:"spring",5:"spring",6:"summer",7:"summer",8:"summer",9:"fall",10:"fall",11:"fall"}
SEASON_WORDS = {"fall":["autumn","halloween","thanksgiving"],"winter":["christmas","holiday","winter"],"spring":["spring"],"summer":["summer","peach"]}
DRINK = ("cocktail","mocktail")

def inline(s):
    s = E(s)
    s = re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", s)
    return re.sub(r"(https?://[^\s<]+)", r'<a href="\1" rel="noopener">\1</a>', s)

def sections(body):
    out, cur = {"_intro": []}, "_intro"
    for line in body.splitlines():
        m = re.match(r"^##\s+(.*)", line)
        if m: cur = m.group(1).strip().lower(); out[cur] = []; continue
        out[cur].append(line)
    return out

def photo_of(body):
    m = re.search(r"!\[[^\]]*\]\((photos/[^)\s]+)\)", body)
    return m.group(1) if m else ""

def lists(lines):
    ul = [l.strip()[2:] for l in lines if re.match(r"^\s*- ", l)]
    ol = [re.sub(r"^\s*\d+\.\s+", "", l) for l in lines if re.match(r"^\s*\d+\.\s", l)]
    return ul, ol

def md_block(lines):
    out, kind = [], None
    for l in lines:
        s = l.strip()
        if re.match(r"!\[", s): continue
        k = "ul" if s.startswith("- ") else "ol" if re.match(r"\d+\.\s", s) else None
        if kind and k != kind: out.append(f"</{kind}>"); kind = None
        if k and not kind: out.append(f"<{k}>"); kind = k
        if k == "ul":
            t = s[2:]; box = re.match(r"\[([ x])\]\s*(.*)", t)
            out.append(f'<li><span class="box{" x" if box.group(1)=="x" else ""}"></span>{inline(box.group(2))}</li>' if box else f"<li>{inline(t)}</li>")
        elif k == "ol": out.append("<li>" + inline(re.sub(r"^\d+\.\s+", "", s)) + "</li>")
        elif s.startswith("#"): out.append(f"<h4>{inline(s.lstrip('#').strip())}</h4>")
        elif s: out.append(f"<p>{inline(s)}</p>")
    if kind: out.append(f"</{kind}>")
    return "\n".join(out)

def stars(r):
    try: r = float(r)
    except (TypeError, ValueError): return ""
    f = int(r); h = r - f >= .5
    return f'<span class=stars aria-label="{r:g} stars">' + "★"*f + ("½" if h else "") + "<i>" + "★"*(5-f-h) + "</i></span>"

def card(r):
    ph = (f'<div class=ph style="background-image:url({E(r["photo"])})" role=img aria-label="{E(r["title"])}"></div>' if r["photo"]
          else f'<div class="ph ging"><span class=hand>{E(r["title"].split("(")[0].strip())}</span></div>')
    tags = "".join(f"<span class=tag>{E(t)}</span>" for t in r["tags"][:3])
    st = r["status"]
    right = stars(r["rating"]) or {"favorite":"<span class=fav>favorite</span>","made":"made it"}.get(st, "")
    stamp = "<span class=stamp>TO TRY</span>" if st == "to-try" else ""
    t = r["time_minutes"]
    return (f'<a class=card href="/r/{E(r["slug"])}" data-slug="{E(r["slug"])}">{stamp}{ph}<div class=bd>'
            + (f'<h3 class="tt hand">{E(r["title"])}</h3>' if r["photo"] else f'<h3 class=sr>{E(r["title"])}</h3>') + f'<div class=tags>{tags}</div>'
            + f'<div class=meta><span>{E(str(t))+" min" if t else "&nbsp;"}</span>{right}</div></div></a>')


DEV = re.compile(r"filed|captur|reconstruct|estimate|standing sub|taste.profile|our version updated|replaced with|marked made|not recorded|recorded part|incomplete|version was|removed|mix-up|original|cooks:|recipe-specific|not a global|kitchen/|\bstatus\b|time_minutes|inbox/|email \d", re.I)
def clean(t):
    """Strip changelog / developer asides from a visible line."""
    t = re.sub(r"\s*\((?:changed|was|original:|see original|amounts are)[^)]*\)", "", t, flags=re.I)
    t = re.sub(r";?\s*(?:standing sub|subbing for|per kitchen)[^;)]*", "", t, flags=re.I)
    t = re.sub(r"\s*->\s*our version updated:.*$", "", t, flags=re.I)
    t = re.sub(r"\bOriginal guidance was about\b", "Plan on about", t)
    t = re.sub(r"\(\s*\)", "", t)
    return re.sub(r"\s{2,}", " ", t).strip()
def ours_prose(lines):
    out = []
    for l in lines:
        s = l.strip()
        if not s or re.match(r"^\(changed", s, re.I) or s.startswith("**Steps**"): continue
        s = re.sub(r"^Same as (?:the )?original[.,:]?\s*(?:with one change:|except)?\s*", "", s, flags=re.I)
        sent = [x for x in re.split(r"(?<=[.!?])\s+", s) if x and not DEV.search(x) and not re.search(r"no standing|edit here after|original", x, re.I)]
        s = clean(" ".join(sent))
        if s and not s.startswith("**Grocery"): out.append(s[0].upper()+s[1:] if not s.startswith(("-", "*")) else s)
    return out

def recipe_parts(r):
    """Everything the public site shows for one recipe, as plain data. Used by the modal, /r/<slug> pages and /r/<slug>.md."""
    sec = sections(r["body"])
    orig, ours, notes = sec.get("original", []), sec.get("our version", []), sec.get("notes", [])
    ou_ul, ou_ol = lists(ours); or_ul, or_ol = lists(orig)
    ours_checks = [x for x in ou_ul if re.match(r"\[[ x]\]", x)]
    ings = []
    for x in ours_checks or [x for x in or_ul if not re.match(r"\d{4}-", x)]:
        m = re.match(r"\[([ x])\]\s*(.*)", x)
        ings.append((clean(m.group(2) if m else x), bool(m and m.group(1) == "x")))
    steps = ou_ol or or_ol
    extra = ours_prose([l for l in ours if not re.match(r"^\s*(- \[[ x]\]|\d+\.\s)", l)])
    diary = []
    for l in notes:
        m = re.match(r"^\s*- (\d{4}-\d{2}-\d{2})\s*(\(([^)]*)\))?:?\s*(.*)", l)
        if not m: continue
        who = (m.group(3) or "").lower()
        person = re.match(r"(crews|anna)\b", who)
        if not person or "filed" in who or "grok" in who: continue
        raw = m.group(4)
        rate = re.search(r"(\d(?:\.\d)?)/5", who) or re.search(r"(\d(?:\.\d)?)\s*/\s*5", raw)
        pm = re.search(r"(photos/[\w.-]+\.(?:jpe?g|png|webp))", raw, re.I)
        raw = re.sub(r"!\[[^\]]*\]\([^)]*\)|\(?photos/[\w.-]+\.(?:jpe?g|png|webp)\)?", "", raw, flags=re.I)
        raw = re.sub(r"^(?:made it|cooked it)[,.:]?\s*(?:\d(?:\.\d)?\s*/\s*5[.,]?)?\s*", "", raw.strip(), flags=re.I)
        txt = clean(" ".join(x for x in re.split(r"(?<=[.!?])\s+", raw) if not DEV.search(x)))
        if txt and txt[0].islower(): txt = txt[0].upper() + txt[1:]
        if not txt and not rate and not pm: continue
        diary.append({"date": m.group(1), "who": person.group(1).title(), "rating": rate.group(1) if rate else "",
                      "text": txt, "photo": pm.group(1) if pm else ""})
    intro = " ".join(l.strip() for l in sec["_intro"] if l.strip() and not l.strip().startswith("!["))
    intro = clean(" ".join(x for x in re.split(r"(?<=[.!?])\s+", intro) if not DEV.search(x)))
    from credit import credit as _cr
    ct, ch = _cr(r)
    return {"ings": ings, "steps": steps, "extra": extra, "diary": diary, "intro": intro, "credit": ct, "credit_url": ch}

def step_html(s, inl=None):
    m = re.match(r"^\*\*(.+?)\*\*:?\s*(.*)", s)
    return f"<li><div><b>{E(m.group(1).rstrip(':'))}</b>{inline(m.group(2))}</div></li>" if m else f"<li><div>{inline(clean(s))}</div></li>"

WKCSS = """.wkrow{margin:10px 0}.wkbtn{font:600 15px -apple-system,BlinkMacSystemFont,sans-serif;background:#fffdf7;color:#4f6b4c;border:2px solid #7f9a7a;border-radius:999px;padding:7px 14px;cursor:pointer}
.wkbtn.on{background:#7f9a7a;color:#fff}.wkbtn[data-short]{font-size:12px;padding:2px 9px;margin-left:6px;border-width:1px}.wkbtn:disabled{opacity:.6}.wkmsg{display:block;font-size:13px;color:#7a7266;margin-top:4px}li .wkmsg{display:inline;margin-left:6px}"""
def wkbtn(slug, short=False):
    """Signed-in only (week-btn.js unhides it). Without JS or signed out, nothing shows."""
    if short: return f' <button type=button class=wkbtn data-short data-week-slug="{E(slug)}" hidden>+ this week</button><span class=wkmsg role=status></span>'
    return f'<p class=wkrow><button type=button class=wkbtn data-week-slug="{E(slug)}" hidden>+ Add to this week</button><span class=wkmsg role=status></span></p>'

def cook_form(r, hidden=False):
    """The one "Cooked it?" form (rate + note + photo -> /api/cook), shared by the home page view and /r/<slug>.
    The Cooked it block of app.js (served alone as /cook.js on /r/ pages) wires it up. hidden=True keeps it off
    the page without JavaScript; the script unhides it."""
    return (f'<form class=cook data-slug="{E(r["slug"])}" data-title="{E(r["title"])}"{" hidden" if hidden else ""}><h4 class=hand>Cooked it?</h4>\n'
            '<p class=cooksub>Rate it and it logs as cooked today.</p>\n'
            '<div class=rate role=radiogroup aria-label="Rating">' + "".join(f'<button type=button data-v="{i}" aria-label="{i} stars">★</button>' for i in range(1, 6)) + '<span class=rv></span></div>\n'
            '<textarea name=note maxlength=1000 placeholder="How\'d it go? (optional)"></textarea>\n'
            '<div class=pv hidden><img alt=""><button type=button class=px aria-label="Remove photo">×</button></div>\n'
            '<div class=used hidden></div>\n'
            '<div class=r><label class=b1>📷 Add or drop photo<input type=file accept="image/*" hidden></label><button class=b2 disabled>Log it</button></div>\n'
            '<div class=gsi></div><p class=cmsg role=status></p></form>')


def recipe_view(r, staples):
    P = recipe_parts(r)
    ing_html = ""
    for i, (txt, onhand) in enumerate(P["ings"]):
        have = '<span class=have>on hand</span>' if onhand else ""
        ing_html += f'<label><input type=checkbox name="{E(r["slug"])}-{i}"><span>{inline(txt)}</span>{have}</label>'
    steps_html = "".join(step_html(s) for s in P["steps"])
    extra = P["extra"]
    ours_html = f'<h3 class="sec hand">Notes from us</h3><div class=ours>{md_block(extra)}</div>' if extra else ""
    diary = []
    for d0 in P["diary"]:
        d = datetime.date.fromisoformat(d0["date"]).strftime("%b %-d")
        st = stars(d0["rating"]) if d0["rating"] else ""
        th = f'<img class=dthumb src="{E(d0["photo"])}" alt="" loading=lazy>' if d0["photo"] else ""
        txt = d0["text"]
        diary.append(f'<div class=dent><span class="dd hand">{d}</span><div><div class=dwho><b>{d0["who"]}</b>{st}</div>{f"<p>{inline(txt)}</p>" if txt else ""}{th}</div></div>')
    intro = P["intro"]
    diary_html = "".join(diary) or "<p class=diary-empty>Not cooked yet.</p>"
    hero = f'<div class=hero style="background-image:url({E(r["photo"])})"></div>' if r["photo"] else ""
    tags = "".join(f"<span class=tag>{E(t)}</span>" for t in [r["type"]] + r["tags"][:4])
    cooks = r.get("cooks") or "0"
    facts = [(E(f'{r["time_minutes"]}m') if r["time_minutes"] else "–", "time"), (E(str(r["serves"] or "–")), "serves"),
             (E(str(r["owner"] or "–").replace("anna+crews", "both").title()), "owner"),
             (stars(r["rating"]) or E(r["status"].replace("-", " ")), f'{cooks} cook{"s" if str(cooks)!="1" else ""}')]
    facts_html = "".join(f"<div><b>{v}</b>{E(k)}</div>" for v, k in facts)
    orig_html = ""  # Original stays in the file, never on the site
    ct, ch = P["credit"], P["credit_url"]
    src = (f'<p class=src><a href="{E(ch)}" rel=noopener target=_blank>{E(ct)}</a></p>' if ch else f'<p class=src>{E(ct)}</p>') if ct else ""
    return f'''<article class=view id="r-{E(r["slug"])}"><div class=wrap><a class=back href="#top">← Kitchen</a> <a class=plainlink href="/r/{E(r["slug"])}">plain page</a>
<div class="sheet rc">{hero}<div class=in><div class=tags>{tags}</div>
<h1 class=hand style="margin-top:10px">{E(r["title"])}</h1>{f"<p class=lede>{inline(intro)}</p>" if intro else ""}
<div class=facts>{facts_html}</div>{"" if r["type"] in DRINK else wkbtn(r["slug"])}
{f'<h3 class="sec hand">Ingredients</h3><div class="ing ruled">{ing_html}</div>' if ing_html else ""}
{f'<h3 class="sec hand">{"Method" if r["type"] in DRINK else "Steps"}</h3><ol class=st>{steps_html}</ol>' if steps_html else ""}
{ours_html}{orig_html}
<h3 class="sec hand">Cook diary</h3><div class=diary>{diary_html}</div>
{cook_form(r)}
<form class=askr data-slug="{E(r["slug"])}"><h4 class=hand>Ask about this</h4><div class=askrow><input maxlength=500 placeholder="Out of something? Doubling it?" aria-label="Ask about this recipe"><button aria-label=Ask>↑</button></div><p class=askans role=status hidden></p><div class=gsi></div></form>
{src}</div></div></div></article>'''

def groceries_inventory(root):
    """kitchen/inventory.md names for the home page's 'on hand' scoring (app.js)."""
    import groceries
    return groceries.inventory(pathlib.Path(root) / "kitchen/inventory.md")

def render(items, staples, root):
    root = pathlib.Path(root); out = root / "site"
    (out / "photos").mkdir(parents=True, exist_ok=True)
    for r in items:
        p = photo_of(r["body"]); r["photo"] = ""
        src = root / r["dir"] / p if p else None
        if src and src.exists():
            shutil.copy2(src, out / "photos" / src.name); r["photo"] = "photos/" + src.name
    css = (SITE/"style.css").read_text().replace("/*FONT*/", base64.b64encode((SITE/"caveat.woff2").read_bytes()).decode()) + WKCSS
    shutil.rmtree(out/"wallet", ignore_errors=True); shutil.copytree(SITE/"wallet", out/"wallet")
    shutil.copy2(SITE/"icon-180.png", out/"icon-180.png"); shutil.copy2(SITE/"tablecloth.jpg", out/"tablecloth.jpg"); shutil.copy2(SITE/"og.jpg", out/"og.jpg")
    banner = "data:image/jpeg;base64," + base64.b64encode((SITE/"banner-web.jpg").read_bytes()).decode()
    season = SEASONS[datetime.date.today().month]
    live = [r for r in items if r["status"] != "retired"]
    food = [r for r in live if r["type"] not in DRINK]; bar = [r for r in live if r["type"] in DRINK]
    rank = lambda r: ({"favorite":0,"made":1}.get(r["status"],2), r["title"])
    picks = sorted([r for r in live if season in r["tags"] or any(w in r["title"].lower() for w in SEASON_WORDS[season])], key=rank)[:8]
    food.sort(key=lambda r: (0 if r["photo"] else 1,) + rank(r)); bar.sort(key=rank)
    types = [t for t in ["main","soup-bowl","side","breakfast","snack","sauce","dessert"] if any(r["type"]==t for r in food)]
    common = ["weeknight-30","quick-20","high-protein","one-pot","sheet-pan",season]
    chips = ["all"] + types + [s for s in ["favorite","to-try"] if any(r["status"]==s for r in food)] + [t for t in common if any(t in r["tags"] for r in food)]
    chip_html = "".join(f'<button class="chip{" on" if c=="all" else ""}" data-f="{E(c)}">{E(c.replace("-"," "))}</button>' for c in dict.fromkeys(chips))
    data = json.dumps({"items":[{k:r[k] for k in ["title","slug","type","status","tags","ingredients","time_minutes","rating"]} for r in live],
                       "staples":staples, "inventory":groceries_inventory(root)}, ensure_ascii=False).replace("</","<\\/")
    js = (SITE/"app.js").read_text()
    home = f'''<section id=home><div class=wrap>
<form id=askform class="sheet ask" role=search><h1 class=hand>What's cooking?</h1>
<div class=askbox><input id=q type=search enterkeyhint=search autocomplete=off placeholder="What are we feeling tonight?" aria-label="Ask the kitchen"><button aria-label=Ask>↑</button></div>
<div class=hints><button type=button class=hint data-q="what can I make with what's in the pantry">🥬 from the pantry</button><button type=button class=hint data-q="something quick tonight">⏱ under 30 min</button><button type=button class=hint data-q="a cocktail for two">🍸 a drink for two</button></div>
<div id=answer class=answer hidden></div><div id=asksign class=asksign hidden><span class=asksay>Sign in to ask the kitchen helper (we're matching by keyword for now).</span> <button type=button id=asksignbtn class=hand>sign in to ask</button><div class=gsi></div></div></form>
{f'<h2 class=hand>This {season} <small>{len(picks)} picks</small></h2><div class=row>{"".join(card(r) for r in picks)}</div>' if picks else ""}
<h2 class=hand>The kitchen <small>{len(food)} recipes</small></h2>
<div class=tools><div class=chips>{chip_html}</div><select id=sort class=sort aria-label="Sort recipes"><option value="">our picks</option><option value=quick>quickest first</option><option value=long>longest first</option></select><button id=pick type=button class="pick hand">🎲 what's for dinner?</button></div>
<div id=food class=grid style="margin-top:10px">{"".join(card(r) for r in food)}</div><p id=nores class=nores hidden>No recipes match. Try another chip or word.</p>
{f'<section class=bar id=bar><h2 class=hand>The bar cart <small>{len(bar)} cocktails</small></h2><div class=grid>{"".join(card(r) for r in bar)}</div></section>' if bar else ""}
<p id=add class="addline hand"><a href="/week/">This week's dinners and grocery list</a> · Got one we should try? <a href="/add">Add recipes</a> · <a href="https://github.com/TheYoungCrews/recipes/blob/main/AGENTS.md">for AI assistants</a></p>
<footer>made at home <span class=heart>♥</span> {len(live)} recipes · <a href="/follow">follow along</a> · <a href="https://github.com/TheYoungCrews/recipes">the recipe files</a></footer>
<noscript><p>Search and the dinner picker need JavaScript; every recipe still opens. Plain pages for every recipe: <a href="/r/">all recipes</a>.</p></noscript></div></section>'''
    views = "\n".join(recipe_view(r, staples) for r in live)
    page = f'''<!doctype html><html lang=en><head><meta charset=utf-8><meta name=viewport content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>Crews &amp; Anna's Kitchen</title><meta name=theme-color content="#7f9a7a"><meta name=apple-mobile-web-app-capable content=yes>
<meta name=description content="The dinners we keep making, the ones we swear we&#x27;ll try, and Anna&#x27;s favorite cocktails."><meta property="og:title" content="Crews &amp; Anna&#x27;s Kitchen"><meta property="og:description" content="The dinners we keep making, the ones we swear we&#x27;ll try, and Anna&#x27;s favorite cocktails."><meta property="og:type" content="website"><meta property="og:url" content="https://blind-tiger.pages.dev/"><link rel=canonical href="https://blind-tiger.pages.dev/"><link rel=sitemap type="application/xml" href="/sitemap.xml">{RSS}<meta property="og:image" content="https://blind-tiger.pages.dev/og.jpg"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:alt" content="Crews &amp; Anna&#x27;s Kitchen on a gingham tablecloth"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="Crews &amp; Anna&#x27;s Kitchen"><meta name="twitter:description" content="The dinners we keep making, the ones we swear we&#x27;ll try, and Anna&#x27;s favorite cocktails."><meta name="twitter:image" content="https://blind-tiger.pages.dev/og.jpg"><link rel="alternate" type="application/json" href="/recipes.json" title="All recipes for agents"><link rel="help" href="https://github.com/TheYoungCrews/recipes/blob/main/AGENTS.md"><meta name="agent-instructions" content="AI agents: read /recipes.json. To add a recipe follow AGENTS.md and email crews@mail.grokbot.com (recipe: in the subject). Bulk: POST /api/recipes (OpenAPI /openapi.json) or paste at /add.">
<meta name=apple-mobile-web-app-title content="Kitchen"><link rel=apple-touch-icon href="/icon-180.png"><link rel=icon type=image/png href="/icon-180.png"><style>{css}</style></head>
<body><div aria-hidden="true" style="position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0"><h2>For AI agents</h2><p>Read recipes from <a href="/recipes.json">/recipes.json</a>. To add one, follow <a href="https://github.com/TheYoungCrews/recipes/blob/main/AGENTS.md">AGENTS.md</a> and email crews@mail.grokbot.com with "recipe:" in the subject. Bulk: POST <a href="/openapi.json">/api/recipes</a> or paste at <a href="/add">/add</a>.</p><p>Every recipe has a plain page with no JavaScript at /r/&lt;slug&gt; and markdown at /r/&lt;slug&gt;.md. A link like /#r-&lt;slug&gt; is the same recipe as /r/&lt;slug&gt;. Full list: <a href="/r/">/r/</a> and <a href="/sitemap.xml">/sitemap.xml</a>.</p><ul>{"".join(f'<li><a href="/r/{E(r["slug"])}">{E(r["title"])}</a></li>' for r in sorted(live, key=lambda r: r["title"].lower()))}</ul></div><div id=top></div><header class=banner><div class=x2box><div class=x2tab><div class=x2lbl><h1 class=hand>Crews &amp; Anna's Kitchen</h1></div></div><div class=x2lip></div><p class=x2sub>{len(food)} recipes · {len(bar)} cocktails · <a href="/week/">this week</a> · <a href="/add">+ add one</a></p></div></header>{home}{views}
<script>window.KITCHEN={data};</script><script>{js}</script><script src="/week-btn.js" defer></script></body></html>'''
    (out/"index.html").write_text(page)
    static_pages(live, out)
    week_page(live, out)
    follow_page(live, out)
    # /add paste page (human fallback) + OpenAPI for GPT Actions / agents
    add_tpl = (SITE / "add.html").read_text()
    add_js = (SITE / "add.js").read_text()
    # Minimal KAUTH bootstrap reused from app.js sign-in block is loaded via inline extract:
    # include shared app.js for KAUTH (full kitchen JS is fine; page only uses KAUTH).
    app_js = (SITE / "app.js").read_text()
    # Only the shared sign-in block: the kitchen code expects the home page DOM and data,
    # and throwing there would stop KAUTH from ever being defined on /add.
    a, b = app_js.index("// ---- Sign-in"), app_js.index("// ---- Cooked it")
    app_js = app_js[a:b]
    add_page = add_tpl.replace("<!--STYLE-->", f"<style>{css}</style>").replace(
        '<script src="/add-app.js"></script>\n<!--ADDJS-->',
        f"<script>{app_js}</script><script>{add_js}</script>",
    )
    (out / "add.html").write_text(add_page)
    shutil.copy2(SITE / "openapi.json", out / "openapi.json")


# ---- Static recipe pages for people and LLMs that don't run JavaScript: /r/<slug> (HTML) and /r/<slug>.md
BASE = "https://blind-tiger.pages.dev"
RSS = '<link rel="alternate" type="application/rss+xml" title="Crews &amp; Anna\'s Kitchen" href="/feed.xml">'
PAGE_CSS = """@font-face{font-family:Hand;src:url(/caveat.woff2) format('woff2');font-weight:400 700;font-display:swap}
body{margin:0;font:17px/1.6 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;color:#2a2723;background:#fbf6ea;
background-image:linear-gradient(90deg,rgba(127,154,122,.10) 50%,transparent 50%),linear-gradient(rgba(127,154,122,.10) 50%,transparent 50%);background-size:28px 28px}
main{max-width:720px;margin:24px auto;padding:24px 22px 32px;background:#fffdf6;border:1px solid #e9e1cf;border-radius:14px}
h1,h2{font-family:Hand,"Bradley Hand",cursive;color:#4f6b4c;line-height:1.1}h1{font-size:44px;margin:4px 0 6px}h2{font-size:30px;margin:28px 0 8px}
a{color:#4f6b4c}.meta,.credit,nav{color:#7a7266;font-size:15px}.credit{margin:0 0 6px}img.hero{width:100%;border-radius:10px;margin:8px 0}
li{margin:4px 0}.diary li img{display:block;max-width:180px;border-radius:8px;margin-top:4px}footer{max-width:720px;margin:0 auto 32px;padding:0 22px;color:#7a7266;font-size:14px}"""

def plain_md(s):
    return re.sub(r"\s+", " ", re.sub(r"\*\*(.+?)\*\*", r"\1", s)).strip()

def _facts(r):
    out = []
    if r["serves"]: out.append(f'Serves {r["serves"]}')
    if r["time_minutes"]: out.append(f'{r["time_minutes"]} min')
    out.append({"favorite": "Favorite", "made": "Made it", "to-try": "To try"}.get(r["status"], r["status"].title()))
    try: out.append(f'Rated {float(r["rating"]):g}/5')
    except (TypeError, ValueError): pass
    c = str(r.get("cooks") or "0")
    if c not in ("", "0"): out.append(f'Cooked {c} time{"s" if c != "1" else ""}')
    return out

def _date(d): return datetime.date.fromisoformat(d).strftime("%b %-d, %Y")

def recipe_md(r, P):
    url = f'{BASE}/r/{r["slug"]}'
    L = [f'# {r["title"]}', ""]
    if P["credit"]: L += [(f'{P["credit"]} ({P["credit_url"]})' if P["credit_url"] else P["credit"]), ""]
    L += [" · ".join(_facts(r)), ""]
    if P["intro"]: L += [plain_md(P["intro"]), ""]
    if P["ings"]: L += ["## Ingredients", ""] + [f"- {plain_md(t)}" for t, _ in P["ings"]] + [""]
    if P["steps"]: L += ["## " + ("Method" if r["type"] in DRINK else "Steps"), ""] + [f"{i}. {plain_md(clean(s))}" for i, s in enumerate(P["steps"], 1)] + [""]
    if P["extra"]: L += ["## Notes from us", ""] + [x if x.startswith(("- ", "* ")) else x for x in P["extra"]] + [""]
    if P["diary"]:
        L += ["## Cook diary", ""]
        for d in P["diary"]:
            bits = [_date(d["date"]), d["who"]] + ([f'{float(d["rating"]):g}/5'] if d["rating"] else [])
            L.append(f'- {", ".join(bits)}' + (f': {plain_md(d["text"])}' if d["text"] else ""))
        L.append("")
    L += [f"Page: {url}", f"Kitchen: {BASE}/", ""]
    return "\n".join(L)

def recipe_page(r, P):
    slug, title = r["slug"], r["title"]
    url = f"{BASE}/r/{slug}"
    facts = " · ".join(_facts(r))
    desc_src = plain_md(P["intro"]) or (("Ingredients: " + ", ".join(plain_md(t) for t, _ in P["ings"])) if P["ings"] else title)
    desc = (" ".join(x for x in [P["credit"] + "." if P["credit"] else "", facts + ".", desc_src] if x))
    desc = desc if len(desc) <= 200 else desc[:197].rsplit(" ", 1)[0] + "..."
    img = f'{BASE}/{r["photo"]}' if r["photo"] else f"{BASE}/og.jpg"
    credit = ""
    if P["credit"]:
        credit = f'<p class=credit><a href="{E(P["credit_url"])}" rel=noopener>{E(P["credit"])}</a></p>' if P["credit_url"] else f'<p class=credit>{E(P["credit"])}</p>'
    ld = {"@context": "https://schema.org", "@type": "Recipe", "name": title, "url": url, "image": img,
          "recipeIngredient": [plain_md(t) for t, _ in P["ings"]],
          "recipeInstructions": [{"@type": "HowToStep", "text": plain_md(clean(s))} for s in P["steps"]],
          "recipeCategory": r["type"], "keywords": ", ".join(r["tags"])}
    if P["credit"]: ld["author"] = {"@type": "Person", "name": re.sub(r"^By ", "", P["credit"])}
    if r["serves"]: ld["recipeYield"] = str(r["serves"])
    if r["time_minutes"]: ld["totalTime"] = f'PT{r["time_minutes"]}M'
    if P["intro"]: ld["description"] = plain_md(P["intro"])
    ldj = json.dumps(ld, ensure_ascii=False).replace("</", "<\\/")
    body = [f'<nav><a href="/">← Crews &amp; Anna\'s Kitchen</a> · <a href="/r/{E(slug)}.md">Markdown</a> · <a href="/#r-{E(slug)}">Open in the kitchen</a> · <a href="/week/">This week</a></nav>',
            f"<h1>{E(title)}</h1>", credit, f"<p class=meta>{E(facts)}</p>", "" if r["type"] in DRINK else wkbtn(slug)]
    if r["photo"]: body.append(f'<img class=hero src="/{E(r["photo"])}" alt="{E(title)}">')
    if P["intro"]: body.append(f"<p>{inline(P['intro'])}</p>")
    if P["ings"]: body.append("<h2>Ingredients</h2><ul>" + "".join(f"<li>{inline(t)}</li>" for t, _ in P["ings"]) + "</ul>")
    if P["steps"]:
        body.append(f'<h2>{"Method" if r["type"] in DRINK else "Steps"}</h2><ol>'
                    + "".join(re.sub(r"</?div>", "", step_html(s)).replace("</b>", "</b> ", 1) if s.startswith("**") else re.sub(r"</?div>", "", step_html(s)) for s in P["steps"]) + "</ol>")
    if P["extra"]: body.append("<h2>Notes from us</h2>" + md_block(P["extra"]))
    body.append("<h2>Cook diary</h2>")
    if P["diary"]:
        items = []
        for d in P["diary"]:
            bits = [_date(d["date"]), d["who"]] + ([f'{float(d["rating"]):g}/5'] if d["rating"] else [])
            items.append(f'<li><b>{E(", ".join(bits))}</b>' + (f": {inline(d['text'])}" if d["text"] else "")
                         + (f'<img src="/{E(d["photo"])}" alt="" loading=lazy>' if d["photo"] else "") + "</li>")
        body.append("<ul class=diary>" + "".join(items) + "</ul>")
    else: body.append("<p>Not cooked yet.</p>")
    body.append(cook_form(r, hidden=True))   # same form + /api/cook as the home page; cook.js shows it, so no-JS readers see a plain page
    t, dsc = E(title), E(desc)
    return f'''<!doctype html><html lang=en><head><meta charset=utf-8><meta name=viewport content="width=device-width,initial-scale=1">
<title>{t} · Crews &amp; Anna's Kitchen</title><meta name=description content="{dsc}"><link rel=canonical href="{url}">
<link rel=alternate type="text/markdown" href="/r/{E(slug)}.md">{RSS}<meta name=theme-color content="#7f9a7a">
<meta property="og:type" content="article"><meta property="og:site_name" content="Crews &amp; Anna's Kitchen"><meta property="og:title" content="{t}"><meta property="og:description" content="{dsc}"><meta property="og:url" content="{url}"><meta property="og:image" content="{E(img)}">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="{t}"><meta name="twitter:description" content="{dsc}"><meta name="twitter:image" content="{E(img)}">
<link rel=icon type=image/png href="/icon-180.png"><link rel=apple-touch-icon href="/icon-180.png"><style>{PAGE_CSS}{WKCSS}{cook_css()}</style>
<script type="application/ld+json">{ldj}</script></head>
<body><main>
{chr(10).join(x for x in body if x)}
</main><footer>From <a href="/">Crews &amp; Anna's Kitchen</a>. <a href="/follow">Follow along</a>. Plain text: <a href="/r/{E(slug)}.md">/r/{E(slug)}.md</a> · all recipes: <a href="/recipes.json">/recipes.json</a></footer><script src="/cook.js" defer></script><script src="/week-btn.js" defer></script></body></html>'''

def cook_js():
    """/cook.js: app.js's shared sign-in block and its Cooked it block, unchanged, so /r/<slug> pages log cooks
    through the same code, /api/cook endpoint and sign-in as the home page (no second implementation)."""
    js = (SITE / "app.js").read_text()
    return js[js.index("// ---- Sign-in"):]

_COOK_CSS = None
def cook_css():
    """The Cooked it form's rules from style.css (plus its color variables), for the plain /r/<slug> pages."""
    global _COOK_CSS
    if _COOK_CSS is None:
        keys = (":root{", ".cook", ".rate", ".pv{", ".gsi", "signrow", ".sbtn", ".gsiover", ".b1", ".b2", ".hand{")
        rows = [l for l in (SITE / "style.css").read_text().splitlines() if l.startswith(keys) or any(k in l for k in keys[1:-1])]
        _COOK_CSS = "\n".join(l for l in rows if not l.startswith((".addcard", ".addr", ".addback"))) + "\n.cook,.cook *{box-sizing:border-box}"
    return _COOK_CSS

def static_pages(live, out):
    rdir = out / "r"; shutil.rmtree(rdir, ignore_errors=True); rdir.mkdir(parents=True)
    shutil.copy2(SITE / "caveat.woff2", out / "caveat.woff2"); shutil.copy2(SITE / "week-btn.js", out / "week-btn.js")
    (out / "cook.js").write_text(cook_js())
    if (SITE / "sync-groceries.shortcut").exists(): shutil.copy2(SITE / "sync-groceries.shortcut", out / "sync-groceries.shortcut")   # signed Shortcut, source in _system/shortcuts/
    for r in live:
        P = recipe_parts(r)
        (rdir / f'{r["slug"]}.html').write_text(recipe_page(r, P))
        (rdir / f'{r["slug"]}.md').write_text(recipe_md(r, P))
    by = sorted(live, key=lambda r: r["title"].lower())
    food = [r for r in by if r["type"] not in DRINK]; bar = [r for r in by if r["type"] in DRINK]
    li = lambda rs: "<ul>" + "".join(f'<li><a href="/r/{E(r["slug"])}">{E(r["title"])}</a>{"" if r["type"] in DRINK else wkbtn(r["slug"], True)}</li>' for r in rs) + "</ul>"
    (rdir / "index.html").write_text(f'''<!doctype html><html lang=en><head><meta charset=utf-8><meta name=viewport content="width=device-width,initial-scale=1">
<title>All recipes · Crews &amp; Anna's Kitchen</title><meta name=description content="Every recipe and cocktail in Crews &amp; Anna's Kitchen as a plain page."><link rel=canonical href="{BASE}/r/">{RSS}<style>{PAGE_CSS}{WKCSS}</style></head>
<body><main><nav><a href="/">← Crews &amp; Anna's Kitchen</a> · <a href="/follow">Follow along</a></nav><h1>All recipes</h1><p class=meta>{len(food)} recipes and {len(bar)} cocktails. Each page has a plain markdown copy at the same address plus .md.</p>
<h2>Recipes</h2>{li(food)}<h2>Cocktails</h2>{li(bar)}</main><script src="/week-btn.js" defer></script></body></html>''')
    today = datetime.date.today().isoformat()
    urls = [f"{BASE}/", f"{BASE}/week/", f"{BASE}/r/", f"{BASE}/follow"] + [f'{BASE}/r/{r["slug"]}' for r in by]
    (out / "sitemap.xml").write_text('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
                                     + "".join(f"<url><loc>{u}</loc><lastmod>{today}</lastmod></url>\n" for u in urls) + "</urlset>\n")
    (out / "robots.txt").write_text(f"User-agent: *\nAllow: /\nDisallow: /api/\nSitemap: {BASE}/sitemap.xml\n")


# ---- /week/: this week's dinners + grocery list, from plans/ via groceries.py (HTML, /week.md, /week.json)
WEEK_CSS = """.meals{list-style:none;padding:0}.wk h2 small{font:15px -apple-system,BlinkMacSystemFont,sans-serif;color:#7a7266}.meals li{margin:8px 0}.meals b{font-family:Hand,cursive;font-size:24px;color:#4f6b4c;font-weight:700}
.gl h3{font-size:14px;letter-spacing:2px;text-transform:uppercase;color:#7f9a7a;margin:18px 0 4px}.gl ul{list-style:none;padding:0;margin:0}
.gl li{padding:6px 0 6px 30px;border-bottom:1px dashed #e9e1cf;position:relative}.gl li:before{content:"";position:absolute;left:4px;top:10px;width:14px;height:14px;border:2px solid #7f9a7a;border-radius:4px}
.staples{color:#7a7266;font-size:15px}.gl label{display:block;cursor:pointer}.gl ul.got span,.gl li.done span{text-decoration:line-through;color:#9a9286}
.gl ul.got li.undone span{text-decoration:none;color:inherit}.gl ul.got li:before{content:"✓";color:#7f9a7a;font-weight:700;text-align:center;line-height:14px}.havemode .gl li:before{display:none}.havemode .gl li{padding-left:4px}
.gl input.have{width:18px;height:18px;margin:0 10px 0 0;vertical-align:-3px;accent-color:#7f9a7a}.havemsg{font-size:13px;color:#7a7266;min-height:1em}"""
def week_page(live, out):
    import groceries
    wdir = out / "week"; shutil.rmtree(wdir, ignore_errors=True); wdir.mkdir(parents=True)
    g = groceries.build()
    by = {r["slug"]: r for r in live}
    head = lambda t: f'''<!doctype html><html lang=en><head><meta charset=utf-8><meta name=viewport content="width=device-width,initial-scale=1">
<title>{t} · Crews &amp; Anna's Kitchen</title><meta name=description content="This week's dinners and grocery list."><link rel=canonical href="{BASE}/week/">
<link rel=alternate type="text/markdown" href="/week.md">{RSS}<meta name=theme-color content="#7f9a7a"><link rel=icon type=image/png href="/icon-180.png"><link rel=apple-touch-icon href="/icon-180.png">
<style>{PAGE_CSS}{WEEK_CSS}{WKCSS}</style></head>'''
    nav = '<nav><a href="/">← Crews &amp; Anna\'s Kitchen</a> · <a href="/week.md">Markdown</a> · <a href="/week.json">JSON</a> · <a href="/r/">All recipes</a> · <a href="/follow">Follow along</a></nav>'
    if not g:
        (wdir / "index.html").write_text(head("This week") + f"<body><main class=wk>{nav}<h1>This week</h1><p>No plan yet.</p></main></body></html>")
        (out / "week.md").write_text("# This week\n\nNo plan yet.\n"); (out / "week.json").write_text("null"); (out / "groceries.txt").write_text(""); return
    d = datetime.date.fromisoformat(g["starts"]); end = d + datetime.timedelta(days=6)
    span = f'{d.strftime("%b %-d")} to {end.strftime("%b %-d") if end.month != d.month else end.strftime("%-d")}'
    meals, extras = [], []
    for m in g["meals"]:
        r = by.get(m["slug"]); facts = " · ".join(_facts(r)) if r else ""
        li = f'<li><b><a href="/r/{E(m["slug"])}">{E(m["title"])}</a></b>{wkbtn(m["slug"], True)}<br><span class=meta>{E(m["night"]) + " · " if m.get("kind") != "extra" else ""}{E(facts)}</span></li>'
        (extras if m.get("kind") == "extra" else meals).append(li)
    keys = {i["line"]: i["key"] for i in g["detail"]}
    # Each line gets a hidden 'already have' checkbox; week-btn.js shows them for signed-in cooks (plain list otherwise).
    gli = lambda x: f'<li><label><input type=checkbox class=have data-have="{E(keys.get(x, ""))}" hidden><span>{E(x)}</span></label></li>' if keys.get(x) else f"<li>{E(x)}</li>"
    gl = "".join(f'<h3>{E(sec["section"])}</h3><ul>' + "".join(gli(x) for x in sec["items"]) + "</ul>" for sec in g["sections"]) or "<p>Nothing to buy beyond staples.</p>"
    if g["optional"]: gl += "<h3>optional</h3><ul>" + "".join(gli(x) for x in g["optional"]) + "</ul>"
    if g["have"]: gl += ('<h3>Already have</h3><ul class=got>' + "".join(f'<li><label><input type=checkbox class=have data-have="{E(h["on_hand"])}" checked hidden><span>{E(h["line"])}</span></label></li>' for h in g["have"]) + "</ul>")
    if g.get("in_house"): gl += ('<h3>In the house</h3><ul class=got>' + "".join(f'<li><span>{E(h["line"])}</span></li>' for h in g["in_house"]) + "</ul>")
    body = [nav, f'<h1>This week</h1><p class=meta>{E(span)} · dinners for {E(str(g["serves"]))}</p>']
    if g["note"]: body.append(f"<p>{inline(plain_md(g['note']))}</p>")
    body.append('<h2>Dinners</h2><ul class=meals>' + "".join(meals) + "</ul>")
    if extras: body.append('<h2>Also this week <small>bakes, sides, anytime</small></h2><ul class=meals>' + "".join(extras) + "</ul>")
    body.append(f'<h2>Grocery list</h2><p class=havemsg role=status hidden>Check what you already have or just bought. It is added to the inventory and moves to Already have after the next rebuild (about a minute).</p><div class=gl>{gl}</div>')
    if g["staples_assumed"]: body.append(f'<p class=staples>Not on the list because we keep them stocked: {E(", ".join(g["staples_assumed"]))}. Running low? Add them.</p>')
    (wdir / "index.html").write_text(head(f"This week, {span}") + "<body><main class=wk>\n" + "\n".join(body)
        + f'\n</main><footer>From <a href="/">Crews &amp; Anna\'s Kitchen</a>. <a href="/follow">Follow along</a>. Plan: <a href="https://github.com/TheYoungCrews/recipes/blob/main/{E(g["plan_file"])}">{E(g["plan_file"])}</a> · plain text: <a href="/week.md">/week.md</a></footer><script src="/week-btn.js" defer></script></body></html>')
    (out / "week.md").write_text(groceries.to_md(g, BASE) + f"\nPage: {BASE}/week/\n")
    g2 = {k: v for k, v in g.items() if k != "detail"}
    g2["url"], g2["md_url"] = f"{BASE}/week/", f"{BASE}/week.md"
    g2["items"] = [{"line": i["line"], "short": i["short"], "key": i["key"], "section": i["section"], "optional": i["optional"], "recipes": i["recipes"]} for i in g["detail"]]
    (out / "week.json").write_text(json.dumps(g2, ensure_ascii=False, indent=1))
    (out / "groceries.txt").write_text(groceries.to_txt(g))   # feed for the Sync Groceries Shortcut


# ---- /follow and /feed.xml: public additions and ratings only (see feed.py)
EXPECT = {
    "both": "You'll get an email when we add a new recipe or cocktail, and when we cook and rate one. At most one email a day, bundled if there's more than one. Unsubscribe anytime.",
    "food": "You'll get an email when we add a new recipe, and when we cook and rate one. Cocktails stay off the list. At most one email a day, bundled if there's more than one. Unsubscribe anytime.",
    "cocktails": "You'll get an email when we add a new cocktail, and when we mix and rate one. Recipes stay off the list. At most one email a day, bundled if there's more than one. Unsubscribe anytime.",
}
OG_DESC = "Get an email when we add a recipe or cocktail, or rate one. At most one a day. Pick food, cocktails, or both."
FOLLOW_CSS = """.follow .ask{margin:-46px auto 0;max-width:760px}
.follow .lede{margin:0 0 16px;color:#4b463e;font-size:16px}
.pills{display:flex;gap:8px;flex-wrap:wrap;margin:0 0 8px}
.pills label{flex:1;min-width:88px;text-align:center;font:700 14px/1 -apple-system,sans-serif;padding:10px 12px;border-radius:999px;border:1.5px solid var(--line);background:var(--paper);color:var(--ink);cursor:pointer}
.pills input{position:absolute;opacity:0;pointer-events:none}
.pills label:has(input:checked),.pills label.on{background:var(--sage-d);color:#fff;border-color:var(--sage-d)}
.expect{margin:0 0 16px;color:var(--mute);font-size:14px;line-height:1.45}
.askbox button.go{width:auto;padding:0 18px;font:700 15px/38px -apple-system,sans-serif;cursor:pointer}
.hp{position:absolute;left:-9999px;height:0;width:0;opacity:0}
.fmsg{margin:12px 0 0;min-height:1.2em;font-size:14px;color:var(--mute)}
.fmsg.ok{color:var(--sage-d);font:700 26px/1.3 Hand,cursive}
.fmsg.err{color:var(--red);font-weight:600}
#followform.done .askbox,#followform.done .pills{display:none}
#followform.done .expect{display:none}
.follow .grid{margin-top:10px}
.card .note{margin:0;color:#4b463e;font-size:13px;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
.rssq{text-align:center;margin:28px 0 0;font-size:12px;color:var(--mute)}
.rssq a{color:var(--mute);text-decoration:underline;text-decoration-style:dotted;text-underline-offset:3px}
"""
FOLLOW_JS = r"""
(function(){
  var form = document.getElementById("followform");
  if (!form) return;
  var expect = document.getElementById("expect");
  var msg = document.getElementById("fmsg");
  var interestOf = function(){ var el = form.querySelector("input[name=interest]:checked"); return (el && el.value) || "both"; };
  var textFor = function(v){ return expect.getAttribute("data-" + v) || expect.getAttribute("data-both"); };
  var paint = function(){ expect.textContent = textFor(interestOf()); };
  form.addEventListener("change", paint);
  paint();
  var params = new URLSearchParams(location.search);
  if (params.get("ok")) {
    form.classList.add("done");
    msg.className = "fmsg ok";
    msg.textContent = "You're in. " + textFor(params.get("interest") || "both");
    return;
  }
  if (params.get("err") === "email") { msg.className = "fmsg err"; msg.textContent = "That email doesn't look right."; }
  if (params.get("err") === "slow") { msg.className = "fmsg err"; msg.textContent = "Give it a minute, then try again."; }
  form.addEventListener("submit", async function(e){
    e.preventDefault();
    msg.textContent = ""; msg.className = "fmsg";
    var fd = new FormData(form);
    var body = { email: fd.get("email"), interest: fd.get("interest") || "both", website: fd.get("website") || "" };
    var btn = form.querySelector("button[type=submit]");
    btn.disabled = true;
    try {
      var r = await fetch("/api/follow", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
      var d = await r.json().catch(function(){ return {}; });
      if (r.ok && d.ok) {
        form.classList.add("done");
        msg.className = "fmsg ok";
        msg.textContent = (d.already ? "You're already on the list. " : "You're in. ") + textFor(body.interest);
      } else {
        msg.className = "fmsg err";
        msg.textContent = d.error || "Something went wrong. Try again in a minute.";
        btn.disabled = false;
      }
    } catch (err) {
      msg.className = "fmsg err";
      msg.textContent = "Something went wrong. Try again in a minute.";
      btn.disabled = false;
    }
  });
})();
"""

def kitchen_css():
    """Home-page CSS with the Hand font inlined, paths fixed for pages other than /."""
    css = (SITE / "style.css").read_text().replace("/*FONT*/", base64.b64encode((SITE / "caveat.woff2").read_bytes()).decode())
    return css.replace("url(tablecloth.jpg)", "url(/tablecloth.jpg)")

def follow_page(live, out):
    """Write /feed.xml, /follow and the follow Open Graph image."""
    import feed
    ev = feed.events(live)
    (out / "feed.xml").write_text(feed.rss(ev), encoding="utf-8")
    og = SITE / "follow-og.png"
    if og.exists():
        shutil.copy2(og, out / "follow-og.png")
    fdir = out / "follow"
    shutil.rmtree(fdir, ignore_errors=True)
    fdir.mkdir(parents=True)
    cards = []
    for e in ev[:8]:
        name = e.get("dish") or e["title"]
        ph = (f'<div class=ph style="background-image:url(/{E(e["photo"])})" role=img aria-label="{E(name)}"></div>'
              if e.get("photo") else f'<div class="ph ging"><span class=hand>{E(name)}</span></div>')
        badge = "Rated" if e["kind"] == "rated" else "Added"
        st = stars(e["rating"]) if e.get("rating") else ""
        note = f'<p class=note>{E(e["note"])}</p>' if e.get("note") and e["kind"] == "rated" else ""
        cat = "cocktail" if e.get("category") == "cocktails" else "recipe"
        cards.append(
            f'<a class=card href="/r/{E(e["slug"])}">'
            f'<span class=stamp>{badge}</span>{ph}<div class=bd>'
            f'<h3 class="tt hand">{E(name)}</h3>'
            f'<div class=tags><span class=tag>{E(badge.lower())}</span><span class=tag>{cat}</span></div>'
            f'{note}<div class=meta><span>{E(_date(e["date"].isoformat()))}</span>{st}</div></div></a>'
        )
    og_title = "Follow along with Crews & Anna's kitchen"
    css = kitchen_css() + FOLLOW_CSS
    xe = lambda s: html.escape(s, False)
    t, d, u, img = xe(og_title), xe(OG_DESC), f"{BASE}/follow", f"{BASE}/follow-og.png"
    html_page = f'''<!doctype html><html lang=en><head><meta charset=utf-8><meta name=viewport content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>{t}</title>
<meta name=description content="{d}">
<link rel=canonical href="{u}">{RSS}
<meta name=theme-color content="#7f9a7a">
<meta property="og:title" content="{t}">
<meta property="og:description" content="{d}">
<meta property="og:url" content="{u}">
<meta property="og:type" content="website">
<meta property="og:image" content="{img}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="{t}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{t}">
<meta name="twitter:description" content="{d}">
<meta name="twitter:image" content="{img}">
<link rel=icon type=image/png href="/icon-180.png"><link rel=apple-touch-icon href="/icon-180.png">
<style>{css}</style></head>
<body class=follow>
<header class=banner><div class=x2box><div class=x2tab><div class=x2lbl><h1 class=hand>Crews &amp; Anna's Kitchen</h1></div></div><div class=x2lip></div>
<p class=x2sub><a href="/">the kitchen</a> · <a href="/r/">all recipes</a></p></div></header>
<section><div class=wrap>
<form id=followform class="sheet ask" method="post" action="/api/follow">
<h1 class=hand>Follow along with Crews &amp; Anna's kitchen</h1>
<p class=lede>Get an email when we add a new dish or rate one.</p>
<div class=pills role=radiogroup aria-label="What to follow">
<label><input type=radio name=interest value=food> Food</label>
<label><input type=radio name=interest value=cocktails> Cocktails</label>
<label><input type=radio name=interest value=both checked> Both</label>
</div>
<p class=expect id=expect data-both="{xe(EXPECT['both'])}" data-food="{xe(EXPECT['food'])}" data-cocktails="{xe(EXPECT['cocktails'])}">{xe(EXPECT['both'])}</p>
<div class=askbox>
<input type=email name=email autocomplete=email inputmode=email required placeholder="Your email" aria-label="Your email">
<input class=hp type=text name=website tabindex=-1 autocomplete=off aria-hidden=true>
<button class=go type=submit>Follow</button>
</div>
<p class=fmsg id=fmsg role=status></p>
</form>
<h2 class=hand>Recently <small>what's new</small></h2>
{('<div class=grid>' + ''.join(cards) + '</div>') if cards else '<p class=nores>Nothing to show yet.</p>'}
<p class=rssq><a href="/feed.xml">RSS feed</a></p>
<footer>made at home <span class=heart>♥</span> · <a href="/">Crews &amp; Anna's Kitchen</a></footer>
</div></section>
<script>{FOLLOW_JS}</script>
</body></html>'''
    (fdir / "index.html").write_text(html_page)
