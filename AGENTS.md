# AGENTS.md: recipe repo playbook (any agent, any model)

Private repo `TheYoungCrews/recipes`. Plain markdown, $0. This page is enough on its own. For more detail see `skills/recipe-intake/SKILL.md`, `skills/recipe-feedback/SKILL.md`, `SCHEMA.md` and `TAGS.md`.

## Hard rules
- **Never delete, rename or overwrite** a file. Only create new ones or make small edits as described below. To drop a recipe, set `status: retired`.
- Keep it **private**: never paste repo contents publicly. Never buy anything or edit shopping lists.
- Never invent amounts, ratings or feedback. Write `(amount not given)`, and say what you couldn't see.
- Never edit `## Original` after capture. Never force-push.

## 1. Intake (link, IG/TikTok/YouTube post, photo, screenshot, video, text, email)
1. **Dedupe first:** search `recipes/`, `cocktails/`, `inbox/` for the same source URL (ignore `?igsh=`/`utm_` params) or a near-identical title. If it matches, don't create anything; tell the sender which file it is.
2. **Decode:** caption, then video speech and on-screen text, then the creator's own comments, then any linked recipe page. For photos or screenshots, read the text; for a dish photo with no recipe, mark it `(reconstructed from photo)`.
3. **File:** `recipes/<slug>.md` (drinks: `cocktails/<slug>.md`). The slug is the title in lowercase, ASCII, hyphens only, max 60 chars. If the path exists and it's a different recipe, add `-2`.
4. **Frontmatter** (flat, one line each, lists as `[a, b]`):
```yaml
---
title: Crispy Gochujang Salmon Bites
slug: crispy-gochujang-salmon-bites
type: main            # main|side|soup-bowl|breakfast|dessert|sauce|prep-component|snack|cocktail|mocktail
status: to-try
tags: [fish, korean, air-fryer, weeknight-30]   # 3-8 from TAGS.md: protein, method, effort required
ingredients: [salmon, gochujang, honey, soy sauce, garlic]  # lowercase, use pantry/staples.md wording
serves: 2
time_minutes: 25
source: https://www.instagram.com/p/XXXX/
source_type: instagram   # instagram|tiktok|youtube|web|book|ai|family|own
added: YYYY-MM-DD
added_by: anna           # the PERSON: crews|anna
via: muse/<model>        # agent/model that wrote it
owner: "@creatorhandle" # whose recipe in practice: creator until adapted, then anna|crews|anna+crews
input_type: instagram-video  # instagram-video|instagram-carousel|tiktok|youtube|web-page|photo|screenshot|video-file|text|email
last_made:
rating:
cooks: 0
---
```
   Tag values: protein chicken/turkey/beef/lamb/pork/fish/shellfish/egg/veg/organ; method dutch-oven/air-fryer/grill/sheet-pan/one-pot/no-cook/braise/smoker/stovetop; effort quick-20/weeknight-30/weeknight-45/weekend-project/make-ahead/freezer-friendly. **Weeknight dinners are the priority.** No store info in recipes (that's a later grocery-list step). Apply the **Standing substitutions** in `taste-profile.md` in Our version: soy sauce becomes liquid aminos, chili paste becomes sambal oelek. Others are in TAGS.md. Don't invent tags.
5. **Body:** one-line pitch (creator @handle). Then `## Original` (faithful ingredients + steps), then `## Our version`: a grocery checklist (`- [x]` if in `pantry/staples.md`, else `- [ ]`) and steps adapted to our Dutch oven / air fryer and taste (brothy, charred, umami, lime/herbs, high-protein; see `taste-profile.md`). Then `## Notes` with `- YYYY-MM-DD (via <agent>): captured, sent by <who>.`
6. **Can't decode properly?** Save the raw material as `inbox/YYYY-MM-DD-<slug>.md` (source, sender, via, raw text). A later agent normalizes it and adds `normalized_to: <path>` at the top.

## 2. Feedback ("made it", voice note, text, `made:` email)
1. **Match the recipe** by title or slug (ignore words like "the" and "bowls"). If it's ambiguous, ask once, or write `inbox/YYYY-MM-DD-feedback-<slug>.md` and change nothing.
2. **Notes**, newest first under `## Notes`: `- YYYY-MM-DD (anna via instinct/<model>, 4/5): too salty; loved the basil. -> Our version updated: yes|no`
3. **Frontmatter:** set `owner` to who adapted it (`anna`/`crews`/`anna+crews`) once Our version gets a real change from them. `status: made` (`favorite` only for 5/5 or "favorite"; `retired` only for "never again"), `last_made`, `rating` if one was given, `cooks` + 1.
4. **Our version:** edit only for a specific fix ("halve the chili crisp"), with the smallest change, marked `(changed YYYY-MM-DD: was ...)`. If it says "Same as original", copy the Original in first. Vague praise goes in Notes only.
5. **taste-profile.md:** add only general preferences ("Anna dislikes cilantro"), noting who and the slug, plus a `## Change log` line. No duplicates.

## 3. Email path: crews@mail.grokbot.com (people and agents)
Subjects: `recipe: <what>`, `cocktail: <what>`, `made: <title> N/5`, `recipe-raw: <what>` (raw drop).
Body: the link, and either the full markdown file (agents) or plain words (people: who, what to change). Attach photos, screenshots or videos as they are. Grok Bot turns these into commits.

## 4. Delivery (try in this order)
1. **git:** pull, check the path doesn't exist, write, `python3 scripts/build.py` (must pass), then commit `add: <slug>` / `feedback: <slug>` and push. If the push is rejected: `git pull --rebase`, then push again.
2. **GitHub API:** `PUT /repos/TheYoungCrews/recipes/contents/<path>` with `message` and base64 `content`, and **no `sha`**, so an existing file can't be overwritten (422 = exists).
3. **Email** crews@mail.grokbot.com (section 3).
4. **Raw drop** to `inbox/` (by git or email).
Then reply to the sender in one line: what you saved or changed, what to buy, and anything you guessed.
