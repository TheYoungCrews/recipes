# inbox/
Outside agents (Muse, Instinct, ...) write **only** here: one new file per recipe or feedback, via the GitHub contents API (create-only).
- `YYYY-MM-DD-<slug>.md`: full recipe (SCHEMA.md frontmatter + body)
- `YYYY-MM-DD-made-<slug>.md`: feedback after cooking
- `YYYY-MM-DD-raw-<slug>.md`: raw drop to normalize
Grok Bot's hourly routine validates and files them into `recipes/`, then adds `filed_to:` at the top. Never delete.
