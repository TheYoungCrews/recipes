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
source: https://...                        # URL, "Instagram @handle", "ChatGPT brief", etc.
source_type: instagram                     # instagram | tiktok | youtube | web | book | ai | family | own
added: 2026-10-13                          # YYYY-MM-DD
added_by: grok-bot                         # who/which agent captured it
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
