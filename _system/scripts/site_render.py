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
    return (f'<a class=card href="#r-{E(r["slug"])}" data-slug="{E(r["slug"])}">{stamp}{ph}<div class=bd>'
            f'<h3 class="tt hand">{E(r["title"])}</h3><div class=tags>{tags}</div>'
            f'<div class=meta><span>{E(str(t))+" min" if t else "&nbsp;"}</span>{right}</div></div></a>')

def recipe_view(r, staples):
    sec = sections(r["body"])
    orig, ours, notes = sec.get("original", []), sec.get("our version", []), sec.get("notes", [])
    ou_ul, ou_ol = lists(ours); or_ul, or_ol = lists(orig)
    ours_checks = [x for x in ou_ul if re.match(r"\[[ x]\]", x)]
    ings = ours_checks or [x for x in or_ul if not re.match(r"\d{4}-", x)]
    steps = ou_ol or or_ol
    ing_html = ""
    for i, x in enumerate(ings):
        m = re.match(r"\[([ x])\]\s*(.*)", x); txt = m.group(2) if m else x
        have = '<span class=have>on hand</span>' if (m and m.group(1) == "x") else ""
        ing_html += f'<label><input type=checkbox name="{E(r["slug"])}-{i}"><span>{inline(txt)}</span>{have}</label>'
    def step(s):
        m = re.match(r"^\*\*(.+?)\*\*:?\s*(.*)", s)
        return f"<li><div><b>{E(m.group(1).rstrip(':'))}</b>{inline(m.group(2))}</div></li>" if m else f"<li><div>{inline(s)}</div></li>"
    step_html = "".join(step(s) for s in steps)
    # Our version box: prose/extra bullets that weren't pulled into ingredients/steps
    extra = [l for l in ours if l.strip() and not re.match(r"^\s*(- \[[ x]\]|\d+\.\s)", l)] if (ours_checks or ou_ol) else [l for l in ours if l.strip()]
    if extra and not (ours_checks or ou_ol): extra = ours
    ours_html = f'<h3 class="sec hand">Our version</h3><div class=ours>{md_block(extra)}</div>' if any(l.strip() for l in extra) else ""
    diary = []
    for l in notes:
        m = re.match(r"^\s*- (\d{4}-\d{2}-\d{2})\s*(\(([^)]*)\))?:?\s*(.*)", l)
        if not m: continue
        d = datetime.date.fromisoformat(m.group(1)).strftime("%b %-d")
        who = f"<b>{E(m.group(3))}</b>: " if m.group(3) else ""
        diary.append(f"<div><span>{d}</span><div>{who}{inline(m.group(4))}</div></div>")
    diary_html = "".join(diary) or "<p class=diary-empty>Not cooked yet.</p>"
    intro = " ".join(l.strip() for l in sec["_intro"] if l.strip() and not l.strip().startswith("!["))
    hero = f'<div class=hero style="background-image:url({E(r["photo"])})"></div>' if r["photo"] else ""
    tags = "".join(f"<span class=tag>{E(t)}</span>" for t in [r["type"]] + r["tags"][:4])
    cooks = r.get("cooks") or "0"
    facts = [(f'{r["time_minutes"]}m' if r["time_minutes"] else "–", "time"), (r["serves"] or "–", "serves"),
             ((r["owner"] or "–").replace("anna+crews", "both").title(), "owner"),
             (stars(r["rating"]) or E(r["status"].replace("-", " ")), f'{cooks} cook{"s" if str(cooks)!="1" else ""}')]
    facts_html = "".join(f"<div><b>{v if '<' in str(v) else E(str(v))}</b>{E(k)}</div>" for v, k in facts)
    orig_html = f'<details class=orig><summary>The original</summary>{md_block(orig)}</details>' if any(l.strip() for l in orig) else ""
    src = f'<p class=src>Source: {inline(r["source"])}</p>' if r["source"] else ""
    return f'''<article class=view id="r-{E(r["slug"])}"><div class=wrap><a class=back href="#top">← Kitchen</a>
<div class="sheet rc">{hero}<div class=in><div class=tags>{tags}</div>
<h1 class=hand style="margin-top:10px">{E(r["title"])}</h1>{f"<p class=lede>{inline(intro)}</p>" if intro else ""}
<div class=facts>{facts_html}</div>
{f'<h3 class="sec hand">Ingredients</h3><div class="ing ruled">{ing_html}</div>' if ing_html else ""}
{f'<h3 class="sec hand">{"Method" if r["type"] in DRINK else "Steps"}</h3><ol class=st>{step_html}</ol>' if step_html else ""}
{ours_html}{orig_html}
<h3 class="sec hand">Cook diary</h3><div class=diary>{diary_html}</div>
<div class="cook soon"><h4 class=hand>Cooked it? <span class=soonpill>COMING SOON</span></h4><p>Soon you'll rate it here and it'll log as cooked that day. For now, text the bot your rating and a photo.</p>
<div class=rate aria-hidden=true><span>★</span><span>★</span><span>★</span><span>★</span><span>★</span></div>
<textarea disabled placeholder="How'd it go? (optional)"></textarea>
<div class=r><button disabled class=b1>📷 Add photo</button><button disabled class=b2>Log it</button></div></div>
{src}</div></div></div></article>'''

def render(items, staples, root):
    root = pathlib.Path(root); out = root / "site"
    (out / "photos").mkdir(parents=True, exist_ok=True)
    for r in items:
        p = photo_of(r["body"]); r["photo"] = ""
        src = root / r["dir"] / p if p else None
        if src and src.exists():
            shutil.copy2(src, out / "photos" / src.name); r["photo"] = "photos/" + src.name
    css = (SITE/"style.css").read_text().replace("/*FONT*/", base64.b64encode((SITE/"caveat.woff2").read_bytes()).decode())
    shutil.copy2(SITE/"tablecloth.jpg", out/"tablecloth.jpg")
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
                       "staples":staples}, ensure_ascii=False).replace("</","<\\/")
    js = (SITE/"app.js").read_text()
    home = f'''<section id=home><div class=wrap>
<form id=askform class="sheet ask" role=search><h1 class=hand>What's cooking?</h1>
<div class=askbox><input id=q type=search enterkeyhint=search autocomplete=off placeholder="What are we feeling tonight?" aria-label="Ask the kitchen"><button aria-label=Ask>↑</button></div>
<div class=hints><button type=button class=hint data-q="what can I make with what's in the pantry">🥬 from the pantry</button><button type=button class=hint data-q="something quick tonight">⏱ under 30 min</button><button type=button class=hint data-q="a cocktail for two">🍸 a drink for two</button></div>
<div id=answer class=answer hidden></div></form>
{f'<h2 class=hand>This {season} <small>{len(picks)} picks</small></h2><div class=row>{"".join(card(r) for r in picks)}</div>' if picks else ""}
<h2 class=hand>The kitchen <small>{len(food)} recipes</small></h2>
<div class=tools><div class=chips>{chip_html}</div><button id=pick type=button class="pick hand">🎲 what's for dinner?</button></div>
<div id=food class=grid style="margin-top:10px">{"".join(card(r) for r in food)}</div><p id=nores class=nores hidden>No recipes match. Try another chip or word.</p>
{f'<section class=bar id=bar><h2 class=hand>The bar cart <small>{len(bar)} cocktails</small></h2><div class=grid>{"".join(card(r) for r in bar)}</div></section>' if bar else ""}
<section id=add class="sheet addr"><h2 class=hand>Add a recipe</h2><p>Got a recipe for us? <a href="mailto:crews@mail.grokbot.com?subject=recipe%3A%20">Email it to crews@mail.grokbot.com</a> with "recipe:" and the name in the subject.</p><p>Using an AI assistant? <a href="https://github.com/TheYoungCrews/recipes/blob/main/AGENTS.md">Point it at our instructions</a>.</p></section>
<footer>made at home <span class=heart>♥</span> {len(live)} recipes · <a href="https://github.com/TheYoungCrews/recipes">the recipe files</a></footer>
<noscript><p>Search and the dinner picker need JavaScript; every recipe still opens.</p></noscript></div></section>'''
    views = "\n".join(recipe_view(r, staples) for r in live)
    page = f'''<!doctype html><html lang=en><head><meta charset=utf-8><meta name=viewport content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>Crews &amp; Anna's Kitchen</title><meta name=theme-color content="#7f9a7a"><meta name=apple-mobile-web-app-capable content=yes>
<meta name=apple-mobile-web-app-title content="Kitchen"><link rel=apple-touch-icon href="{banner}"><style>{css}</style></head>
<body><div id=top></div><header class=banner><div class=x2box><div class=x2tab><div class=x2lbl><h1 class=hand>Crews &amp; Anna's Kitchen</h1></div></div><div class=x2lip></div><p class=x2sub>{len(food)} recipes · {len(bar)} cocktails · <a href="#add">+ add one</a></p></div></header>{home}{views}
<script>window.KITCHEN={data};</script><script>{js}</script></body></html>'''
    (out/"index.html").write_text(page)
