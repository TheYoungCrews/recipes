"""Build _system/web/follow-og.png (1200x630) for /follow link previews. Run: python3 _system/scripts/follow_og.py"""
import pathlib
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageOps

ROOT = pathlib.Path(__file__).resolve().parents[2]
WEB = ROOT / "_system/web"
W, H = 1200, 630
SAGE, SAGE_D, CREAM, PAPER, INK, LINE = "#7f9a7a", "#4f6b4c", "#fbf6ea", "#fffdf6", "#2a2723", "#e9e1cf"
HAND = "/tmp/Caveat.ttf"
SANS = "/usr/share/fonts/truetype/sand-box/custom/Source Sans Pro/SourceSansPro-Regular.ttf"
SANS_SB = "/usr/share/fonts/truetype/sand-box/custom/Source Sans Pro/SourceSansPro-Semibold.ttf"
PHOTOS = [
    ROOT / "recipes/photos/picanha-with-red-wine-mushrooms-2026-11-10.jpg",
    ROOT / "recipes/photos/chilli-brothy-rice-caramelised-soy-chicken-2026-11-04.jpg",
    ROOT / "cocktails/photos/aged-eggnog-2026-11-02.jpg",
    ROOT / "recipes/photos/golden-szechuan-seafood-curry-2026-10-27.jpg",
    ROOT / "cocktails/photos/smoke-and-bitters-2026-11-05.jpg",
    ROOT / "recipes/photos/braised-lamb-collard-noodle-bowls-2026-10-18.jpg",
]

def font(path, size):
    return ImageFont.truetype(path, size=size)

def rounded(im, rad):
    im = im.convert("RGBA")
    mask = Image.new("L", im.size, 0)
    d = ImageDraw.Draw(mask)
    d.rounded_rectangle((0, 0, *im.size), rad, fill=255)
    out = Image.new("RGBA", im.size, (0, 0, 0, 0))
    out.paste(im, mask=mask)
    return out

def crop_cover(path, w, h):
    im = Image.open(path).convert("RGB")
    scale = max(w / im.width, h / im.height)
    im = im.resize((max(1, int(im.width * scale)), max(1, int(im.height * scale))), Image.Resampling.LANCZOS)
    left, top = (im.width - w) // 2, (im.height - h) // 2
    return im.crop((left, top, left + w, top + h))

def frame(path, w, h, rot):
    photo = crop_cover(path, w, h)
    pad = 10
    card = Image.new("RGB", (w + pad * 2, h + pad * 2), PAPER)
    card.paste(photo, (pad, pad))
    card = rounded(card, 18)
    # drop shadow
    shadow = Image.new("RGBA", (card.width + 24, card.height + 24), (0, 0, 0, 0))
    sd = Image.new("RGBA", (card.width, card.height), (60, 50, 30, 90))
    sd = rounded(sd, 18)
    shadow.paste(sd, (10, 14), sd)
    shadow = shadow.filter(ImageFilter.GaussianBlur(8))
    shadow.paste(card, (6, 4), card)
    return shadow.rotate(rot, resample=Image.Resampling.BICUBIC, expand=True)

def wrap(draw, text, fnt, width):
    words, lines, cur = text.split(), [], ""
    for w in words:
        trial = (cur + " " + w).strip()
        if draw.textlength(trial, font=fnt) <= width:
            cur = trial
        else:
            if cur: lines.append(cur)
            cur = w
    if cur: lines.append(cur)
    return lines

def build():
    cloth = crop_cover(WEB / "tablecloth.jpg", W, H).filter(ImageFilter.GaussianBlur(0.4))
    # cream wash so type stays readable
    wash = Image.new("RGB", (W, H), CREAM)
    base = Image.blend(cloth, wash, 0.35).convert("RGBA")
    # sage gingham overlay, light
    grid = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    g = ImageDraw.Draw(grid)
    for x in range(0, W, 28):
        g.rectangle((x, 0, x + 14, H), fill=(127, 154, 122, 28))
    for y in range(0, H, 28):
        g.rectangle((0, y, W, y + 14), fill=(127, 154, 122, 18))
    base = Image.alpha_composite(base, grid)

    # left paper panel
    panel = Image.new("RGBA", (620, 520), (0, 0, 0, 0))
    pd = ImageDraw.Draw(panel)
    pd.rounded_rectangle((0, 0, 619, 519), 28, fill=(255, 253, 246, 235), outline=(233, 225, 207, 255), width=2)
    # sage top bar
    pd.rounded_rectangle((0, 0, 619, 18), 0, fill=(127, 154, 122, 255))
    # cover bar corners: redraw top as sage then clip? simple band is fine
    pd.rectangle((0, 0, 619, 16), fill=(127, 154, 122, 255))
    base.paste(panel, (56, 56), panel)

    draw = ImageDraw.Draw(base)
    title_font = font(HAND, 78)
    body_font = font(SANS, 32)
    small_font = font(SANS_SB, 22)
    title = "Follow along with Crews & Anna's kitchen"
    tx, ty = 88, 120
    for line in wrap(draw, title, title_font, 520):
        draw.text((tx, ty), line, font=title_font, fill=SAGE_D)
        ty += 84
    ty += 8
    sub = "Get an email when we add a recipe or cocktail, or rate one. At most one a day."
    for line in wrap(draw, sub, body_font, 500):
        draw.text((tx, ty), line, font=body_font, fill=INK)
        ty += 40
    draw.text((tx, 500), "Crews & Anna's Kitchen", font=small_font, fill=SAGE)

    # photo collage on the right
    sizes = [(280, 210), (240, 180), (230, 180), (220, 170)]
    rots = [-7, 6, -4, 8]
    positions = [(690, 70), (940, 140), (700, 330), (940, 370)]
    paths = [p for p in PHOTOS if p.exists()]
    for i, pos in enumerate(positions):
        if i >= len(paths):
            break
        w, h = sizes[i]
        fr = frame(paths[i], w, h, rots[i])
        # center-ish paste
        base.paste(fr, pos, fr)

    out = base.convert("RGB")
    dest = WEB / "follow-og.png"
    out.save(dest, "PNG", optimize=True)
    print(f"wrote {dest} {out.size}")

if __name__ == "__main__":
    build()
