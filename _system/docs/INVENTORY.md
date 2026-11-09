# Inventory updates

`kitchen/inventory.md` is the live list of what is in the house. Three things now write to it automatically. Staples (`kitchen/staples.md`) are never quantity-tracked: they are not added when you check off groceries, and they are not removed when you rate a dish.

## 1. Rating a dish

On a recipe page, the Cooked it form loads a "Used up from the inventory?" checklist (signed in). It lists inventory items that match the dish's Our version ingredients.

- Pre-checked: the recipe clearly used the whole item (a count like `1 butternut squash`, `all`, or a counted inventory line such as `picanha steaks (2, for Friday)` when the recipe amount is clear). Counted lines are subtracted when only some were used (`(2, for Friday)` minus 1 becomes `(1, for Friday)`).
- Unchecked: the amount looks partial or unclear (`½ cup carrots`, `1 tablespoon jalapeño`, `1 lb` against a line with no count). Leave it unchecked if you still have some; check it if you finished the item. Amounts are never invented.
- Log it saves the rating and the inventory edit in the same commit.

`GET /api/inventory?slug=<slug>` (session or Bearer key) returns the same checklist: `{ items: [{ name, line, section, suggested, reason }] }`.

## 2. Checking off groceries on This week

Signed in on https://blind-tiger.pages.dev/week/, each grocery checkbox still marks the plan's `on_hand` list. It also adds that item to `kitchen/inventory.md` (section inferred when possible, otherwise `## New`). Unchecking removes the exact line that was added, not a fuzzy match, so leftover cousins stay put. Staples are not added.

## 3. Checking off groceries in Apple Reminders

iOS Shortcuts cannot run at the moment you check off a reminder. There is no "when a reminder is completed" trigger. The closest options are: run a shortcut after shopping, run it when you close the Reminders app, or run it at a time of day.

The shortcut calls `POST https://blind-tiger.pages.dev/api/inventory` with a Bearer Recipe API key (the same kind of key used for `/api/plan`). It never belongs in this repo. Put it only in the shortcut on your phone.

```
POST /api/inventory
Authorization: Bearer <your Recipe API key>
Content-Type: application/json

{ "action": "add", "items": ["Cremini mushrooms", "Lentils"] }
```

`action` may be `add` or `remove`. Up to 40 names. Staples are skipped. Names already in the inventory are skipped. Reply includes `added`, `removed`, `skipped_staples`, `already`, and `commit`.

Do not delete completed Groceries reminders after posting. The Sync Groceries shortcut uses recently checked-off titles to avoid adding the same item twice.

### Build "Add Bought Groceries" on iPhone

1. Open the Shortcuts app and tap + to create a shortcut. Name it **Add Bought Groceries**.
2. Add **Text**. Paste your Recipe API key here and nothing else. This is the only place the key should live. Do not screenshot it into the cookbook.
3. Add **Set variable**. Name: `Key`. Variable: the Text from step 2.
4. Add **Find Reminders**:
   - Filter: List is **Groceries**
   - Add Filter: Is Completed is **Yes**
   - Add Filter: Completion Date is in the last **2 days**
   - Sort by Completion Date, latest first (optional)
5. Add **Repeat with Each** on the Found Reminders.
6. Inside the loop, add **Get Details of Reminders** (or use the Repeat Item's Title) and **Add to Variable**. Name: `Bought`.
7. After the loop, add **If** `Bought` has any value.
8. Inside If:
   - Add **Dictionary**. Keys:
     - `action` (Text): `add`
     - `items` (variable): `Bought`
   - Add **Get Contents of URL**:
     - URL: `https://blind-tiger.pages.dev/api/inventory`
     - Method: POST
     - Headers: `Authorization` = `Bearer ` then the `Key` variable (one space after Bearer), and `Content-Type` = `application/json`
     - Request Body: JSON, and choose the Dictionary as the body (or File / JSON from the Dictionary)
   - Add **Show Notification** titled `Add Bought Groceries` with body `Added checked-off groceries to the inventory.`
9. In Otherwise, notify `Nothing checked off in the last 2 days.`
10. Run it once after a shopping trip to confirm. You should see a commit like `inventory: add ... (crews via api)` and the items on https://blind-tiger.pages.dev after about a minute. If you get 401, the key is missing or wrong.

### Closest automations

None of these fire the instant you check a box. Pick one:

- **After shopping:** open Shortcuts and run **Add Bought Groceries**.
- **When you close Reminders:** Shortcuts > Automation > New > App > Reminders > Is Closed > Run Immediately > Add Bought Groceries.
- **Every evening:** Shortcuts > Automation > New > Time of Day (for example 7:00 PM, Daily) > Run Immediately > Add Bought Groceries.

Turn on Run Immediately after you have tested the shortcut by hand, so it does not ask each time.

## Limits

- Partial uses stay on the inventory unless you check them on the rating form.
- Grocery uncheck only removes an exact name match.
- Section guesses can land in `## New`; move the line by hand if you want it elsewhere.
- The Reminders shortcut only looks at items checked off in the last 2 days. Older completions are ignored (they can be added by running a wider Find Reminders filter once, or by checking them on /week/).
- Adding the same name twice is a no-op.
