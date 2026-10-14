---
name: recipe-feedback
description: Record "we made it" feedback (voice note, text, chat, or an email with subject `made: <title> N/5`) into the right recipe file in TheYoungCrews/recipes, and grow kitchen/taste-profile.md. Works for any agent or model.
---
# Skill: recipe feedback (any agent, any input)

Follows the feedback protocol in `AGENTS.md` (section 3). Read `_system/SCHEMA.md`, `_system/TAGS.md` and `kitchen/taste-profile.md` first.

## Hard rules
- Never delete or rename files. Never edit `## Original`.
- Never invent feedback, ratings or dates. Use only what the person said. If no rating was given, leave `rating` as it is.
- **Outside agents (Muse, Instinct, ...) only create `inbox/YYYY-MM-DD-made-<slug>.md`** (format below) and never edit recipe files. Grok Bot's hourly filing routine applies sections 2 to 4.
- The filing routine only touches the matched recipe file, `kitchen/taste-profile.md` and the inbox file (it adds `filed_to:`).

## 0. Inbox feedback file (outside agents)
```yaml
---
inbox_type: feedback
recipe: <slug if known, else the title as said>
cooked: YYYY-MM-DD
who: anna            # crews | anna | anna+crews
rating: 4            # only if they gave a number
via: muse
---
<their words: what worked, what to change, any general preference>
```
Deliver it with the GitHub contents API, create-only (`PUT .../contents/inbox/YYYY-MM-DD-made-<slug>.md`, message `inbox: made <title> (via <agent>)`, no `sha`). Fallback: email crews@mail.grokbot.com, subject `made: <title> N/5`.

## 1. Parse the input
| Input | How |
|---|---|
| Email to crews@mail.grokbot.com, subject `made: <title> N/5` | title + rating from the subject; comments from the body |
| Voice note | transcribe; pull out dish, rating, who, what worked, what to change |
| Text / chat ("made the lamb bowls, 4/5, too salty, Anna loved the basil") | same |
Extract: **dish**, **who** (crews / anna / both), **rating** (1-5, optional; turn "loved it" into a rating only if they gave a number), **date cooked** (default today), **comments**, **changes** they want, and **general preferences** ("we don't like cilantro").

## 2. Match the recipe
1. Search `recipes/` and `cocktails/` frontmatter `title` and `slug`. Normalize: lowercase, drop punctuation and words like "the", "bowl(s)", "recipe".
2. Exact or clear single match (e.g. "lamb bowls" -> `braised-lamb-collard-noodle-bowls`): use it.
3. Several plausible matches, or none:
   - If you can ask the sender, ask one short question listing the candidates.
   - Otherwise leave the inbox file unfiled, add `candidates:` to it, and ask Crews. Change no recipe.
4. They cooked something not in the repo: capture it first with `_system/skills/recipe-intake/SKILL.md`, or drop it to `inbox/`.

## 3. Update the recipe file
1. **Notes line** under `## Notes`, newest first (just below the heading):
   `- YYYY-MM-DD (anna via instinct/<model>, 4/5): too salty; loved the Thai basil. -> Our version updated: yes`
   Use `(who via agent, N/5)`; leave out `, N/5` if there was no rating.
2. **Frontmatter:** if this feedback changes Our version, set `owner:` to who adapted it (`anna`, `crews`, `anna+crews`); otherwise leave it. `status: made` (`favorite` only if they rate it 5/5 or call it a favorite; `retired` only if they say "never again"). `last_made:` = date cooked. `rating:` = latest rating if given. `cooks:` + 1.
3. **Our version:** change it only when the feedback names a concrete fix ("halve the chili crisp", "needed 10 more minutes", "use spinach next time"). Make the smallest edit, and mark it inline, e.g. `(changed 2026-10-20: was 2 tbsp)`. Vague feedback ("pretty good") changes only the Notes. If Our version just says "Same as original", copy the Original into Our version first, then apply the fix.

## 4. Update kitchen/taste-profile.md
Add only **general** preferences that apply beyond this dish ("Anna doesn't like cilantro", "we like more acid", "spice level 3/5 is our max"):
- Put it under `## Likes` or `## Dislikes / avoid` (or `## Open questions` if unclear), tagged with who and the dish: `- More lime/acid in brothy bowls (both; braised-lamb-collard-noodle-bowls, 2026-10-20)`.
- Add a line under `## Change log`: `- YYYY-MM-DD: added "<pref>" from <slug> feedback (<who> via <agent>)`.
- Don't duplicate an existing line; if feedback contradicts one, update it and log the change.

## 5. Save and confirm
- Run `python3 _system/scripts/build.py` (must pass).
- Commit `file: made <slug>` (include taste-profile changes in the same commit), after adding `filed_to: <path>` at the top of the inbox file. Push the normal way and never force-push.
- Reply to the sender in one line: what you recorded, what you changed in Our version, and any taste-profile addition.
