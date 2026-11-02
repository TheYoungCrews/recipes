# Grocery names (short names for the shared list)

The Sync Groceries Shortcut adds one short, generic name per item to Apple Reminders ("Lentils", not "1 package Trader Joe's precooked lentils"). The build makes most names on its own: it drops amounts, prep words (chopped, sliced), "fresh", "boneless", "skinless" and "organic", then capitalizes the first letter. Add a line here only when that result reads wrong.

Format: `- <key> | <Short name>`. The key is the item's `key` in https://blind-tiger.pages.dev/week.json (`items[].key`), lowercase. Read by `_system/scripts/groceries.py`; used for https://blind-tiger.pages.dev/groceries.txt and `items[].short`.

- sour cream | Greek yogurt
- crème fraîche or greek yogurt | Greek yogurt
- monterey jack or oaxaca cheese | Shredded cheese
- package trader joe s precooked lentils | Lentils
- kodiak cakes protein power cakes mix | Kodiak pancake mix
- bellwether farms a2 organic whole milk yogurt | Whole milk yogurt
- jalapeño pepper | Jalapeño
- carrot | Carrots
