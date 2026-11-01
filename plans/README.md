# Weekly plans

One file per week, `YYYY-Www.md` (ISO week, starting Monday). It lists the dinners by recipe slug, rough nights, servings and what's already on hand.

- Format: `_system/SCHEMA.md`, "Weekly plans".
- Grocery list: `python3 _system/scripts/groceries.py` (or `--json`).
- Bakes, sides and anything without a night go in `extras`.
- On the site: https://blind-tiger.pages.dev/week/ (also /week.md and /week.json).
- Signed in on /week/, tick a grocery line to mark it "already have" (it goes into `on_hand`).
- Signed in on the site, "+ Add to this week" on any recipe adds or removes it here (through `POST /api/plan`, see AGENTS.md section 5).
