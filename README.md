# Recipes (Crews & Anna)

Private, $0, agent-agnostic recipe repo. Plain markdown + a documented frontmatter schema, so any AI agent (Grok Bot, Muse, ChatGPT, Claude) or a human can add and update recipes.

## Layout
| Path | What |
|---|---|
| `AGENTS.md` | Rules any agent must follow (decode, tag, feedback protocols) |
| `SCHEMA.md` | Frontmatter fields and allowed values |
| `TAGS.md` | Tag taxonomy (only these tags) |
| `taste-profile.md` | What we like / dislike; read before writing any brief |
| `pantry/staples.md` | ~30 hand-kept staples, used for "what can I make" |
| `bar.md` | Home bar inventory |
| `recipes/` | Food briefs, one file each |
| `cocktails/` | Drink briefs (same schema, `type: cocktail`) |
| `skills/muse-capture/SKILL.md` | Skill for Muse or any agent: IG post -> to-try recipe file -> push (email fallback) |
| `templates/` | Copy these to start a new brief |
| `scripts/build.py` | Builds `site/index.html` (no dependencies, Python 3) |

## Flow
capture -> `status: to-try` -> cook -> feedback -> dated note + "Our version" update + taste-profile update -> `made` / `favorite` / `retired`.

## Browse
`python3 scripts/build.py` then open `site/index.html` (single self-contained file: works offline, on a phone, or from iCloud/Drive). Filters: tags, status, search, and "missing at most N ingredients" vs `pantry/staples.md`.
