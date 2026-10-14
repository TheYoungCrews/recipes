---
name: muse-capture
description: Turn an Instagram (or TikTok/YouTube/web) recipe or cocktail post into a new `to-try` file in the private repo TheYoungCrews/recipes. Works for any agent.
---
# Skill: capture a post into the recipe repo

You are adding ONE new recipe (or cocktail) file. The rules here are complete. If the repo is readable, `AGENTS.md`, `SCHEMA.md` and `TAGS.md` win over this file where they disagree.

## Hard rules
- **Never delete, rename or overwrite an existing file.** Only create new files. If the target path already exists, stop and use the duplicate rule below.
- Never buy anything, edit shopping lists, or change `pantry/staples.md`, `taste-profile.md` or `bar.md`.
- Never invent amounts or steps silently. Write `(amount not given)` or `(step inferred)`.
- Keep the repo private. Never paste its contents anywhere public.

## 1. Decode the post
Work through these in order and note which ones you actually saw:
1. **Caption:** usually has the ingredient list and amounts. Expand any "recipe in comments" or "link in bio".
2. **Video/audio:** transcribe the spoken steps and read the on-screen text (amounts, temps, times). Read each frame of a carousel.
3. **Comments:** the creator's pinned or own replies often fix amounts or substitutions. Ignore other commenters unless the creator confirms them.
4. **Linked page:** if the caption links to a full recipe, use that as the source of truth.
If you could only see part of the post (e.g. caption only), say so in the description line, e.g. `(caption only; video not watched)`.

## 2. Write the file
**Path:** `recipes/<slug>.md`, or `cocktails/<slug>.md` for drinks.
**Slug:** title in lowercase, ASCII only, words joined with `-`, no other punctuation, max 60 chars. Example: `Crispy Gochujang Salmon Bites!` becomes `crispy-gochujang-salmon-bites`. If the path already exists, try `-2`, `-3`, and so on, but first check it's not the same recipe (see duplicates).

**Duplicates:** search existing files for the same `source:` URL or a near-identical title. If it's the same recipe, do NOT write a file. Tell Crews which file it matches.

**Frontmatter** (flat keys, lists as `[a, b]`, one line each):
```yaml
---
title: Crispy Gochujang Salmon Bites
slug: crispy-gochujang-salmon-bites      # must equal the filename
type: main                                # one of: main, side, soup-bowl, breakfast, dessert, sauce, prep-component, snack, cocktail, mocktail
status: to-try                            # always to-try for captures
tags: [fish, korean, air-fryer, weeknight-30]   # 3-8, only from TAGS.md
ingredients: [salmon, gochujang, honey, soy sauce, garlic, green onion, rice]  # lowercase; reuse pantry/staples.md wording
serves: 2
time_minutes: 25
source: https://www.instagram.com/p/XXXXXXXX/    # canonical post URL, no tracking params (?igsh=..., ?utm_...)
source_type: instagram                    # instagram | tiktok | youtube | web | book | ai | family | own
added: YYYY-MM-DD                         # today's date
added_by: muse                            # your agent name
last_made:
rating:
cooks: 0
---
```
Cocktails also get `spirit:` and `glass:`, and `type: cocktail` or `mocktail`.

**Tags** (allowed values, from TAGS.md): include at least one protein (or `veg`), one method and one effort tag.
- protein: chicken, beef, lamb, pork, fish, shellfish, egg, veg, organ
- cuisine: american, mexican, italian, japanese, chinese, korean, thai, vietnamese, indian, mediterranean, southern, fusion
- method: dutch-oven, air-fryer, grill, sheet-pan, one-pot, no-cook, braise, smoker, stovetop
- effort: weeknight-30, weekend-project, make-ahead, freezer-friendly
- occasion: hosting (only if it scales to 6+), date-night, crowd, holiday, halloween
- season: spring, summer, fall, winter. diet: high-protein, gluten-free, dairy-free
- cocktail spirit: bourbon, rye, gin, vodka, rum, tequila, mezcal, brandy, amaro, zero-proof. cocktail style: stirred, shaken, built, batch, highball, sour
If nothing fits, leave the tag out and tell Crews which tag you'd add. Don't add tags to TAGS.md yourself.

**Body:**
```markdown
One-line pitch. Creator: @handle. (Note what you could and couldn't see.)

## Original
**Ingredients**
- 2 salmon fillets (about 1 lb)
**Steps**
1. ...

## Our version
**Grocery & inventory check**
- [x] soy sauce          <- [x] if it's in pantry/staples.md, else [ ]
- [ ] salmon
**Steps**
1. ... adapted to a Dutch oven / air fryer and taste-profile.md (brothy, charred, umami, lime/herb finish, high-protein) when that fits.

## Notes
- YYYY-MM-DD (muse): captured from Instagram.
```

## 3. Deliver it (try these in order)
**A. git** (if you have a shell and repo access):
```bash
git clone https://github.com/TheYoungCrews/recipes.git && cd recipes   # or git pull
test -e recipes/<slug>.md && echo "EXISTS - stop" && exit 1
# write the file
python3 scripts/build.py      # validates; fix any error it reports
git add recipes/<slug>.md
git commit -m "add: <slug>"
git push origin main          # if rejected: git pull --rebase, then push. Never --force.
```
**B. GitHub REST API** (token with contents:write on this repo only):
`PUT https://api.github.com/repos/TheYoungCrews/recipes/contents/recipes/<slug>.md` with JSON `{"message":"add: <slug>","content":"<base64 of file>","branch":"main"}`. Do **not** send a `sha` field: without it, GitHub refuses to overwrite an existing file (422). On a 422, pick the next slug suffix or treat it as a duplicate.
**C. Email fallback** (no GitHub access): email **crews@mail.grokbot.com**, subject `recipe-capture: <slug>`, body = the full markdown file exactly, plus the post URL. Grok Bot will commit it.

## 4. Report back to Crews (one short message)
Title, one-line pitch, what to buy (the `[ ]` items), and the file path or email used. Mention anything you couldn't see or had to guess.
