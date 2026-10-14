# AGENTS.md - rules for any AI agent working in this repo

You may be Grok Bot, Muse, ChatGPT, Claude, or anything else. Follow these rules exactly. Plain markdown only; no databases, no paid services.

## 0. Always first
1. Read `SCHEMA.md`, `TAGS.md`, `taste-profile.md`, `pantry/staples.md` (and `bar.md` for drinks).
2. Never delete a recipe; set `status: retired` instead.
3. Never add to a shopping list or buy anything. Briefs only.
4. One recipe per file: `recipes/<slug>.md` or `cocktails/<slug>.md`. Slug = lowercase-hyphenated title.
5. Commit message: `add: <slug>` / `feedback: <slug>` / `taste: <what changed>`.
6. Run `python3 scripts/build.py` after changes; it validates frontmatter and fails loudly on unknown tags.

## 1. Decode protocol (capture -> to-try)
Full step-by-step intake skill for any agent and any input (posts, links, photos, screenshots, video, text, email): [`skills/recipe-intake/SKILL.md`](skills/recipe-intake/SKILL.md). Dedupe first; can't decode? drop it in `inbox/`.

Input: a link, IG/TikTok caption, screenshot, transcript, or a free-text idea.
1. Check for duplicates (search titles/sources in `recipes/`). If found, add a note instead of a new file.
2. Extract the source faithfully into `## Original`. If amounts are missing (common in reels), write `(amount not given)`; never invent silently. If you could only see the caption, say so in the description line.
3. Write `## Our version`: adapt to staples, gear (Dutch oven, air fryer) and the taste profile. Mark each grocery item `- [x]` if it is in `pantry/staples.md`, else `- [ ]`.
4. Fill frontmatter: `status: to-try`, `added`, `added_by` (the person), `via` (you/your model), `input_type`, `source`, `source_type`, normalized `ingredients` (staples wording).
5. Reply to the human with: title, 1-line pitch, what to buy, link to file.

## 2. Tag protocol
- 3 to 8 tags, only from `TAGS.md`. Include at least: one protein (or `veg`), one method, one effort.
- Add `hosting`/`crowd` only if it scales to 6+.
- Cocktails: `type: cocktail` or `mocktail`, one spirit tag, one style tag, plus `spirit:` field.
- Need a new tag? Add it to `TAGS.md` in the same commit and mention it to the human.

## 3. Feedback protocol (after cooking)
Input: "made X, 4/5, too salty, Anna loved the herbs".
1. Append a dated line under `## Notes` (format in `templates/feedback.md`).
2. Update frontmatter: `status` (`made`; `favorite` if 5/5 or they say so; `retired` if "never again"), `last_made`, `rating`, `cooks += 1`.
3. Apply concrete fixes to `## Our version` (keep `## Original` untouched).
4. If the feedback reveals a general preference (e.g. "too much cilantro"), add it to `taste-profile.md` with date and recipe slug.
5. Confirm back in one line what changed.

## 4. Writing new briefs (no source)
Use `taste-profile.md` likes, prefer staples, and fill `## Original` with your first draft (`source_type: ai`).

## 5. If you cannot write to GitHub
Produce the full markdown file in your reply (or email it to crews@mail.grokbot.com); Grok Bot will commit it.

## 6. Inbox
`inbox/` holds raw drops. Any agent may normalize one: write the real file per the intake skill, then add `normalized_to:` at the top of the inbox file. Never delete inbox files.
