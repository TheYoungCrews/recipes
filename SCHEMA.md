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
stores: [trader-joes, buford-highway]       # optional: where to buy the non-staple items (values from TAGS.md store list)
serves: 2
time_minutes: 30
source: https://...                        # URL, "Instagram @handle", "ChatGPT brief", etc.
source_type: instagram                     # instagram | tiktok | youtube | web | book | ai | family | own
added: 2026-10-13                          # YYYY-MM-DD
added_by: crews                            # PERSON who sent/asked for it: crews | anna | agent name if self-initiated
via: grok-bot                              # agent/model that wrote the file, e.g. muse/<model>, instinct/<model>, grok-bot, human
input_type: text                           # instagram-video | instagram-carousel | tiktok | youtube | web-page | photo | screenshot | video-file | text | email
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
Optional `stores:` lists where to shop for this recipe. In the grocery checklist, an item can end with `@store`, e.g. `- [ ] thai basil @buford-highway`. Staples carry their usual store in `pantry/staples.md` as `- item | store`.

## Provenance
`added_by` + `via` + `source_type`/`input_type` say who wanted it, which agent/model wrote it, and what it came from. `via` and `input_type` are optional for older files.

## Dedupe rule
Before creating a file, search `recipes/`, `cocktails/`, `inbox/` for the same `source` URL (ignoring tracking params) or a near-identical title. Match = no new file.

## inbox/
Raw drops (`inbox/YYYY-MM-DD-<slug>.md`) that an agent couldn't fully decode. Free-form; must include source, sender, via. When normalized, add `normalized_to: <path>` at the top. Never deleted.
