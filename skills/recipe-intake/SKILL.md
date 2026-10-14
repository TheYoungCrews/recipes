---
name: recipe-intake
description: Turn any recipe or cocktail input (IG/TikTok/YouTube post, recipe link, photo, screenshot, video, email, plain text) into a new `to-try` file in the private repo TheYoungCrews/recipes. For any agent or model (Muse, Instinct, Grok Bot, ChatGPT, Claude, ...).
---
# Skill: recipe intake (any agent, any input)

Muse decoding Instagram posts is one example. The same steps apply to every agent and every kind of input.

## 0. Inputs and what to read
| Input | Read |
|---|---|
| IG / TikTok / YouTube post | caption, video audio and on-screen text, carousel frames, creator's own comments |
| Recipe web page | the recipe card (ingredients + steps); skip the life story |
| Photo / screenshot (cookbook page, handwritten card, menu, a dish) | read the text in the image; for a dish photo with no recipe, write a best-guess recipe and mark it `(reconstructed from photo)` |
| Video file | transcript plus on-screen text |
| Plain text / voice note ("that miso pasta from Sunday") | turn it into a brief; ask the sender for anything critical you can't fill in |
| Email to crews@mail.grokbot.com | the subject + body + attachments, using the rules above for each |
If you can't finish properly (no tools for video, unclear photo), use **Raw drop** (section 3D) instead of guessing.

You are adding ONE new recipe (or cocktail) file. The rules here are complete. If the repo is readable, `AGENTS.md`, `SCHEMA.md` and `TAGS.md` win over this file where they disagree.

## Hard rules
- **Never delete, rename or overwrite an existing file.** Only create new files. If the target path already exists, stop and use the duplicate rule below.
- Never buy anything, edit shopping lists, or change `pantry/staples.md`, `taste-profile.md` or `bar.md`.
- Never invent amounts or steps silently. Write `(amount not given)` or `(step inferred)`.
- Keep the repo private. Never paste its contents anywhere public.

## 1. Dedupe first (always)
Before creating anything, search `recipes/`, `cocktails/` and `inbox/` for (a) the same `source:` URL (compare without tracking params) and (b) a near-identical title. If it's the same recipe, do NOT create a file; tell the sender which file it is (you may append a dated line under `## Notes` only if the sender asked you to add a note).

## 2. Decode
For a social post, work through these in order and note which ones you actually saw:
1. **Caption:** usually has the ingredient list and amounts. Expand any "recipe in comments" or "link in bio".
2. **Video/audio:** transcribe the spoken steps and read the on-screen text (amounts, temps, times). Read each frame of a carousel.
3. **Comments:** the creator's pinned or own replies often fix amounts or substitutions. Ignore other commenters unless the creator confirms them.
4. **Linked page:** if the caption links to a full recipe, use that as the source of truth.
If you could only see part of the post (e.g. caption only), say so in the description line, e.g. `(caption only; video not watched)`.

## 2b. Write the file
**Path:** `recipes/<slug>.md`, or `cocktails/<slug>.md` for drinks.
**Slug:** title in lowercase, ASCII only, words joined with `-`, no other punctuation, max 60 chars. Example: `Crispy Gochujang Salmon Bites!` becomes `crispy-gochujang-salmon-bites`. If the path already exists, try `-2`, `-3`, and so on, but first check it's not the same recipe (see duplicates).


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
added_by: anna                            # the PERSON who sent it: crews | anna | (agent name if self-initiated)
via: muse/<model name>                    # the agent + model that wrote the file, e.g. muse/gpt-x, instinct/claude-x, grok-bot
owner: "@creatorhandle"                   # source creator until Crews/Anna adapt it
input_type: instagram-video               # what you decoded: instagram-video | instagram-carousel | tiktok | youtube | web-page | photo | screenshot | video-file | text | email
last_made:
rating:
cooks: 0
---
```
Cocktails also get `spirit:` and `glass:`, and `type: cocktail` or `mocktail`.

**Tags** (allowed values, from TAGS.md): include at least one protein (or `veg`), one method and one effort tag.
- protein: chicken, turkey, beef, lamb, pork, fish, shellfish, egg, veg, organ
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
- YYYY-MM-DD (via muse): captured from Instagram, sent by anna.
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
**C. Email** (no GitHub access, and the normal path for people): email **crews@mail.grokbot.com**. Grok Bot reads that inbox and commits entries.
- Subject: `recipe: <title or short description>` (drinks: `cocktail: ...`; feedback on a made dish: `made: <title> N/5`).
- Body: the link (if any), and either the full markdown file (agents) or plain words (people): who it's from, anything to change. Attach photos/screenshots/videos as-is.
**D. Raw drop** (can't fully decode): commit `inbox/YYYY-MM-DD-<short-slug>.md` containing the source URL, sender, `via`, and whatever raw text or transcript you have (or email it with subject `recipe-raw: ...`). Any later agent normalizes it: it writes the real recipe file, then adds `normalized_to: recipes/<slug>.md` at the top of the inbox file. Inbox files are never deleted.

## 4. Report back to the sender (one short message)
Title, one-line pitch, what to buy (the `[ ]` items), and the file path or email used. Mention anything you couldn't see or had to guess.
