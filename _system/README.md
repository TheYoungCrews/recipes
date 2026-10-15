# System guide (for agents and maintenance)

Private, $0, agent-agnostic recipe repo. Plain markdown + a documented frontmatter schema, so any AI agent (Grok Bot, Muse, ChatGPT, Claude) or a human can add and update recipes.

## Layout
| Path | What |
|---|---|
| `README.md` | Human cookbook front page, **generated** by build.py (don't edit) |
| `AGENTS.md` | Rules any agent must follow (decode, tag, feedback protocols) |
| `_system/SCHEMA.md` | Frontmatter fields and allowed values |
| `_system/TAGS.md` | Tag taxonomy (only these tags) |
| `kitchen/taste-profile.md` | What we like / dislike; read before writing any brief |
| `kitchen/staples.md` | ~30 hand-kept staples, used for "what can I make" |
| `kitchen/bar.md` | Home bar inventory |
| `recipes/` | Food briefs, one file each |
| `cocktails/` | Drink briefs (same schema, `type: cocktail`) |
| `_system/skills/recipe-intake/SKILL.md` | Intake skill for any agent/model (Muse, Instinct, ...) and any input -> to-try file |
| `_system/skills/recipe-feedback/SKILL.md` | Feedback skill: 'we made it' -> Notes, Our version, taste profile |
| `_system/docs/CLOUDFLARE.md` | Chosen hosting: Cloudflare Pages + Access (email PIN, private, $0) |
| `_system/docs/HOSTING.md` | Alternative: spare laptop + Tailscale |
| `inbox/` | Where outside agents drop new recipes/feedback (create-only); filed hourly into `recipes/` |
| `_system/templates/` | Copy these to start a new brief |
| `_system/scripts/build.py` | Builds `site/index.html` (+ `site/photos/`), `site/recipes.json` and the root `README.md` (no dependencies, Python 3). Design lives in `_system/web/` (style.css, app.js, Caveat font, banner); HTML is rendered by `_system/scripts/site_render.py` |

## Adding a recipe (no GitHub needed)
**Anna and Crews:** either
1. **Send it to any of our agents** (Muse, Instinct, Grok Bot): "save this recipe" plus the link, photo or text. They drop it in `inbox/`, and it's filed within the hour.
2. **Or email crews@mail.grokbot.com** with subject `recipe: <what it is>` (`cocktail: ...` for drinks, `made: <title> 4/5` for feedback after cooking). Paste the link, or attach a photo or screenshot, and add a line with anything you want changed. Grok Bot turns it into a recipe.
Then browse the site (below). It shows up as **to-try**.

**Agents:** follow `AGENTS.md`. Outside agents commit one file to `inbox/` only (GitHub contents API, create-only, fine-grained token); email is the fallback.

## Flow
capture -> `status: to-try` -> cook -> feedback -> dated note + "Our version" update + taste-profile update -> `made` / `favorite` / `retired`.

## Browse
Online (once set up): the Cloudflare Pages URL, signed in with email + PIN (see `_system/docs/CLOUDFLARE.md`). Offline:
`python3 _system/scripts/build.py` then open `site/index.html` (single self-contained file: works offline, on a phone, or from iCloud/Drive). Filters: tags, status, search, and "missing at most N ingredients" vs `kitchen/staples.md`.
