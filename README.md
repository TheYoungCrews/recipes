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
| `skills/recipe-intake/SKILL.md` | Intake skill for any agent/model (Muse, Instinct, ...) and any input -> to-try file |
| `skills/recipe-feedback/SKILL.md` | Feedback skill: 'we made it' -> Notes, Our version, taste profile |
| `docs/CLOUDFLARE.md` | Chosen hosting: Cloudflare Pages + Access (email PIN, private, $0) |
| `docs/HOSTING.md` | Alternative: spare laptop + Tailscale |
| `inbox/` | Raw drops waiting to be normalized |
| `templates/` | Copy these to start a new brief |
| `scripts/build.py` | Builds `site/index.html` (no dependencies, Python 3) |

## Adding a recipe (no GitHub needed)
**Anna and Crews:** either
1. **Email crews@mail.grokbot.com** with subject `recipe: <what it is>` (`cocktail: ...` for drinks, `made: <title> 4/5` for feedback after cooking). Paste the link, or attach a photo or screenshot, and add a line with anything you want changed. Grok Bot turns it into a recipe.
2. **Send it to any of our agents** (Muse, Instinct, Grok Bot): "save this recipe" plus the link, photo or text.
Then browse the site (below). It shows up as **to-try**.

**Agents:** follow `skills/recipe-intake/SKILL.md`.

## Flow
capture -> `status: to-try` -> cook -> feedback -> dated note + "Our version" update + taste-profile update -> `made` / `favorite` / `retired`.

## Browse
Online (once set up): the Cloudflare Pages URL, signed in with email + PIN (see `docs/CLOUDFLARE.md`). Offline:
`python3 scripts/build.py` then open `site/index.html` (single self-contained file: works offline, on a phone, or from iCloud/Drive). Filters: tags, status, search, and "missing at most N ingredients" vs `pantry/staples.md`.
