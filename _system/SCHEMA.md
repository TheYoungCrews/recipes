# Frontmatter schema (v1)

Every file in `recipes/` and `cocktails/` starts with YAML frontmatter. Keep values on one line; lists use `[a, b]`.

```yaml
---
title: Chili Crisp Chicken Noodle Bowl     # required: the short dish name, 2-4 words, no amounts, equipment, or ingredient lists
slug: chili-crisp-chicken-noodle-bowl      # required, = filename without .md
type: soup-bowl                            # required, one _system/TAGS.md "type"
status: to-try                             # required: to-try | made | favorite | retired
tags: [chicken, dutch-oven, air-fryer, weeknight-30]   # only values from _system/TAGS.md
ingredients: [cherry tomatoes, asparagus, egg white spaghetti, bone broth, chili crisp, lime, green onion, sesame seeds, chicken nuggets]  # normalized names, lowercase, singular-ish; match kitchen/staples.md wording
serves: 2
time_minutes: 30
prep_minutes: 10                           # optional integer, only from the source (blank if not given)
cook_minutes: 20                           # optional integer, only from the source; build warns if prep+cook != time_minutes
source: https://...                        # URL or citation for where we captured it (a post, book page, "ChatGPT brief", etc.)
source_url: https://...                     # optional public credit link: the original creator's video of this dish/drink, else their YouTube channel, else their Instagram profile. If omitted, a URL in `source` is used. Strip tracking params (?igsh=, ?exln=, utm_...).
source_type: instagram                     # instagram | tiktok | youtube | web | book | ai | family | own
added: 2026-10-13                          # YYYY-MM-DD
added_by: crews                            # PERSON who sent/asked for it: crews | anna | agent name if self-initiated
via: grok-bot                              # agent/model that wrote the file, e.g. muse/<model>, instinct/<model>, grok-bot, human
input_type: text                           # instagram-video | instagram-carousel | tiktok | youtube | web-page | photo | screenshot | video-file | text | email
owner: kelly-gellner                      # whose recipe it is in practice: anna | crews | anna+crews | <creator name/@handle> while unadapted
credit: "White Oak Pastures"                 # optional public credit line shown on the site. Credit the original recipe creator, not a reposter or someone who filmed a later version. Never the pipeline (no ChatGPT/Muse/notes/email). Omit for own/AI recipes ("By Crews"/"By Anna" is derived from owner; owner mom -> "Mom's recipe").
last_made:                                 # YYYY-MM-DD or blank
rating:                                    # 1-5 or blank (latest overall)
cooks: 0                                   # times made
---
```

## Body sections (in this order)
1. One-line description.
2. `## Original` - faithful to the source (ingredients + steps). For AI-born recipes, the first draft.
3. `## Our version` - adapted to our staples, gear (Dutch oven, air fryer) and taste-profile. Grocery checklist with `- [ ]` items, then steps. Our version is the recipe as we cook it now: edit it in place and keep it clean, with no inline change annotations (no `(changed ...)`, `(was ...)`, "swapped from", "standing sub" asides). Put the reason for a change in a dated Notes line instead (`- YYYY-MM-DD (grok-bot): swapped Averna for Cynar per crews.`). Git keeps the history. The site shows only Our version (falling back to Original only when Our version has no list/steps) plus personal cook-diary Notes from crews/anna; Original and agent notes are never shown.
   **Amounts inline in steps:** Every step that adds or uses a listed ingredient writes its amount inline at that step, copied exactly from the checklist, e.g. `Add the ginger (1 tbsp, grated) and garlic (3 cloves, minced).` If an ingredient is split across steps, give the part used in that step. Never invent an amount: if the list has none (or says `to taste`), leave the mention bare or use the list's own words. Crews reads these on a kitchen touchscreen and should not have to scroll back to the list. The build warns (does not fail) when a step mentions a listed ingredient without its amount; `python3 _system/scripts/inline_amounts.py` lists them.
4. `## Notes` - dated feedback log, newest first: `- 2026-10-20 (Crews, 4/5): too salty; halve chili crisp.`

Cocktails add optional `spirit:` and `glass:` fields.

## Stores
Recipes carry no store info (no `stores:` field, no `@store` marks). Store picking happens later in a separate grocery-list step that uses `kitchen/staples.md` usual stores. `ingredients:` is the key field for matching and tagging.

## Provenance
`added_by` + `via` + `source_type`/`input_type` say who wanted it, which agent/model wrote it, and what it came from. `via` and `input_type` are optional for older files.

## Dedupe rule
Before creating a file, search `recipes/`, `cocktails/`, `inbox/` for the same `source` URL (ignoring tracking params) or a near-identical title. Match = no new file.

## inbox/
Landing zone for outside agents (Muse, Instinct, ...), which may write **only** here, one new file each, created with the GitHub contents API (create-only, no `sha`).
- `inbox/YYYY-MM-DD-<slug>.md`: a full recipe (all frontmatter above + body).
- `inbox/YYYY-MM-DD-made-<slug>.md`: feedback (`inbox_type: feedback`, `recipe`, `cooked`, `who`, `rating`, `via`, then their words).
- `inbox/YYYY-MM-DD-raw-<slug>.md`: a raw drop (source, sender, via, raw text).
Commit message: `inbox: <title> (via <agent>)`. Grok Bot's hourly routine validates each file, files it into `recipes/` / `cocktails/` (or applies the feedback), and adds `filed_to: <path>` at the top. Inbox files are never deleted.

## Owner
`owner` is not `source` (where it came from) and not `added_by` (who sent it). New intake defaults to the original recipe creator (name or @handle), not a reposter. Switch it to `anna`, `crews` or `anna+crews` once they adapt it, i.e. the first real feedback that changes Our version. Required (build.py fails without it).

## Credit link
The site's owner/credit line links to `source_url` if set, otherwise to a URL in `source`. Prefer the original creator's video of this dish or drink. If that is not findable, use their YouTube channel if they make videos, otherwise their Instagram profile. Never invent a URL. `source` can still record the post you actually captured it from (for example a friend's reel of someone else's recipe).

## Times
`time_minutes` is the total. `prep_minutes` and `cook_minutes` are optional whole numbers, copied from the source only (blank if the source doesn't say). The build warns if prep + cook differs from the total, and suggests the time tag from the total: 20 or less is `quick-20`, 30 or less `weeknight-30`, 45 or less `weeknight-45`, anything longer `weekend-project`.
**Conflicts round down:** when sources or fields disagree on time, keep the LOWER total in `time_minutes`, keep sourced prep/cook as written, and add a Notes line explaining it. The build then only prints an info line.

## Weekly plans (`plans/`)
One file per week, named by ISO week: `plans/YYYY-Www.md` (for example `plans/2026-W45.md` for Mon Nov 2 to Sun Nov 8, 2026). Same flat frontmatter rules as recipes.

```yaml
---
week: 2026-W45            # required, = filename without .md
starts: 2026-11-02        # required, the Monday of that week (YYYY-MM-DD)
serves: 2                 # usually 2 (Crews and Anna)
recipes: [picanha-with-red-wine-mushrooms, picanha-over-polenta]   # dinners: slugs from recipes/
nights: [mon, wed]        # optional, rough night for each recipe in the same order: mon..sun or any
extras: [pumpkin-pecan-bread]   # optional, bakes, sides or anything without a night; also feeds the grocery list
on_hand: [picanha]        # optional, things already in the kitchen; matching grocery lines move to "Already have"
add: []                   # optional, extra shopping lines, e.g. ["1 dozen eggs"]
---
A line or two about the week (shown on /week/).
```

- The grocery list comes from each recipe's `## Our version` checklist, never from Original. `python3 _system/scripts/groceries.py` prints it (add `--json` for JSON).
- Duplicates merge only when it's clearly the same item in compatible units (lb and oz, cups/tbsp/tsp, or the same count unit). Ranges and lines without an amount are never summed.
- Anything in `kitchen/staples.md` is left off (and listed under "staples we're counting on"), and so is anything matching `on_hand`.
- `kitchen/inventory.md` is the live on-hand list (`- item` lines under `## ` sections; a parenthetical like `(Kerrygold)` is ignored for matching). Grocery lines that match an item, by the same matching staples use, are left off and listed under "In the house" (`in_house` in /week.json). `staples.md` stays the always-restock list and is never quantity-tracked. Rating a dish (`POST /api/cook`) removes used-up matching ingredients in the same commit (whole items and clear counts automatically; partials only if the cook checks them). Checking off a grocery line on /week/ (`have`) adds it; unchecking removes the exact added line. `POST /api/inventory` does the same add/remove for the Reminders shortcut. Details: `_system/docs/INVENTORY.md`.
- Lines are grouped as produce, meat and seafood, dairy, pantry, frozen, other, with an Optional group for `Optional:` checklist lines.
- The site shows the current plan at /week/ (plus /week.md and /week.json): the plan whose week contains today, else the next one coming up, else the latest. The build fails on an unknown slug or a bad date.
- `extras` show on /week/ under "Also this week" with no night. A slug can't be in both `recipes` and `extras`. A plan needs at least one of them.
- To change the week, edit the plan file (swap a slug, move a night, add to `on_hand`). Old plan files stay as the record.
- **Already have checkboxes:** signed in on /week/, each grocery line has a checkbox. Checking it adds the line's name key (`items[].key` in /week.json, like `chicken stock`) to `on_hand` through `POST /api/plan` (`action: have`) and adds that name to `kitchen/inventory.md` (right section if it can be inferred, else `## New`; staples are not added). Unchecking removes it from `on_hand` (`unhave`) and removes the exact inventory line. After the rebuild the line moves to an "Already have" section (in /week.md and `have` in /week.json too). An `on_hand` entry covers a line when its name key matches (same key the list merges by) or, for hand-written entries like `picanha`, when the name contains it. Staples are checked first.
- **Short names and /groceries.txt:** each grocery line also gets a short, generic name for the shared Reminders list (`items[].short` in /week.json): amounts, prep words, "fresh", "boneless", "skinless", "organic" and container words (package, jar, bag) are dropped and the first letter is capitalized, so `1 lb Yukon Gold potatoes` becomes `Yukon Gold potatoes`. Overrides live in `kitchen/grocery-names.md` as `- <key> | <Short name>` (key = `items[].key`), e.g. `- package trader joe s precooked lentils | Lentils`. https://blind-tiger.pages.dev/groceries.txt lists those names one per line for the non-optional lines (staples and `on_hand` already left off), deduped, in section order. `groceries.py --txt` prints the same thing. The Sync Groceries Shortcut reads it.
- **Add to this week button:** signed in on the site, every food recipe (its /r/<slug> page, the /r/ list, the recipe view on the home page, and /week/) has a "+ Add to this week" button. A tap calls `POST /api/plan`, which commits a one-line change to the current plan file (`plan: add <slug> to YYYY-Www (<who> via site)`). `main` and `soup-bowl` go into `recipes` with night `any`; everything else goes into `extras`. Tapping again removes it. If there's no plan for the week yet it creates one (next week's on a Sunday). The deploy then rebuilds /week/ and the grocery list in about a minute. Signed out or without JavaScript the button never shows.
