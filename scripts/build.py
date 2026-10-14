#!/usr/bin/env python3
"""Build site/index.html from recipes/ and cocktails/. No dependencies.
Validates frontmatter against SCHEMA.md / TAGS.md; exits 1 on errors."""
import json, re, sys, html, pathlib
ROOT = pathlib.Path(__file__).resolve().parent.parent
REQ = ["title", "slug", "type", "status"]
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
    for line in (ROOT / "TAGS.md").read_text().splitlines():
        if line.startswith("- **") and ":" in line:
            tags |= {t.strip() for t in line.split(":", 1)[1].split(",") if t.strip()}
    return tags

def staples():
    return [l[2:].strip().lower() for l in (ROOT/"pantry/staples.md").read_text().splitlines() if l.startswith("- ")]

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

def main():
    tags_ok, errs, items = allowed_tags(), [], []
    for d in ["recipes", "cocktails"]:
        for f in sorted((ROOT/d).glob("*.md")):
            fm, body = parse_fm(f.read_text())
            if fm is None: errs.append(f"{f.name}: no frontmatter"); continue
            for k in REQ:
                if not fm.get(k): errs.append(f"{f.name}: missing {k}")
            if fm.get("slug") and fm["slug"] != f.stem: errs.append(f"{f.name}: slug != filename")
            if fm.get("status") not in STATUSES: errs.append(f"{f.name}: bad status {fm.get('status')}")
            for t in fm.get("tags") or []:
                if t not in tags_ok: errs.append(f"{f.name}: unknown tag '{t}' (add to TAGS.md)")
            if fm.get("type") and fm["type"] not in tags_ok: errs.append(f"{f.name}: unknown type '{fm['type']}'")
            items.append({**{k: fm.get(k, "") for k in ["title","slug","type","status","rating","time_minutes","serves","source","last_made"]},
                          "tags": fm.get("tags") or [], "ingredients": [i.lower() for i in fm.get("ingredients") or []],
                          "dir": d, "html": md_to_html(body)})
    if errs:
        print("VALIDATION ERRORS:\n  " + "\n  ".join(errs)); sys.exit(1)
    data = json.dumps({"items": items, "staples": staples()}).replace("</", "<\\/")
    out = ROOT/"site"; out.mkdir(exist_ok=True)
    (out/"index.html").write_text((ROOT/"scripts/site_template.html").read_text().replace("/*DATA*/null", data))
    print(f"built site/index.html with {len(items)} items")

if __name__ == "__main__": main()
