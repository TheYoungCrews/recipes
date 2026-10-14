# Frontmatter schema (v1)

Every file in `recipes/` and `cocktails/` starts with YAML frontmatter. Keep values on one line; lists use `[a, b]`.

```yaml
---
title: Chili Crisp Chicken Noodle Bowl     # required
slug: chili-crisp-chicken-noodle-bowl      # required, = filename without .md
type: soup-bowl                            # required, one TAGS.md "type"
status: to-try                             # required: to-try | made | favorite | retired
tags: [chicken, dutch-oven, air-fryer, weeknight-30]   # only values from TAGS.md
ingredients: [cherry tomatoes, asparagus, egg white spaghetti, bone broth, chili crisp, lime, green onion, sesame seeds, chicken nuggets]  # normalized names, lowercase, singular-ish; match pantry/staples.md wording
serves: 2
time_minutes: 30
prep_minutes: 10                           # optional integer, only from the source (blank if not given)
cook_minutes: 20                           # optional integer, only from the source; build warns if prep+cook != time_minutes
source: https://...                        # URL, "Instagram @handle", "ChatGPT brief", etc.
source_type: instagram                     # instagram | tiktok | youtube | web | book | ai | family | own
added: 2026-10-13                          # YYYY-MM-DD
added_by: crews                            # PERSON who sent/asked for it: crews | anna | agent name if self-initiated
via: grok-bot                              # agent/model that wrote the file, e.g. muse/<model>, instinct/<model>, grok-bot, human
input_type: text                           # instagram-video | instagram-carousel | tiktok | youtube | web-page | photo | screenshot | video-file | text | email
owner: kelly-gellner                      # whose recipe it is in practice: anna | crews | anna+crews | <creator name/@handle> while unadapted
last_made:                                 # YYYY-MM-DD or blank
rating:                                    # 1-5 or blank (latest overall)
cooks: 0                                   # times made
---
```

## Body sections (in this order)
1. One-line description.
2. `## Original` - faithful to the source (ingredients + steps). For AI-born recipes, the first draft.
3. `## Our version` - adapted to our staples, gear (Dutch oven, air fryer) and taste-profile. Grocery checklist with `- [ ]` items, then steps.
4. `## Notes` - dated feedback log, newest first: `- 2026-10-20 (Crews, 4/5): too salty; halve chili crisp.`

Cocktails add optional `spirit:` and `glass:` fields.

## Stores
Recipes carry no store info (no `stores:` field, no `@store` marks). Store picking happens later in a separate grocery-list step that uses `pantry/staples.md` usual stores. `ingredients:` is the key field for matching and tagging.

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
`owner` is not `source` (where it came from) and not `added_by` (who sent it). New intake defaults to the source creator (name or @handle). Switch it to `anna`, `crews` or `anna+crews` once they adapt it, i.e. the first real feedback that changes Our version. Required (build.py fails without it).

## Times
`time_minutes` is the total. `prep_minutes` and `cook_minutes` are optional whole numbers, copied from the source only (blank if the source doesn't say). The build warns if prep + cook differs from the total, and suggests the time tag from the total: 20 or less is `quick-20`, 30 or less `weeknight-30`, 45 or less `weeknight-45`, anything longer `weekend-project`.
**Conflicts round down:** when sources or fields disagree on time, keep the LOWER total in `time_minutes`, keep sourced prep/cook as written, and add a Notes line explaining it. The build then only prints an info line.
