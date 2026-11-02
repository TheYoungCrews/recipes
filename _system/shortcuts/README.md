# Shortcuts

- **Sync Groceries** (`make_sync_groceries.py`): adds this week's grocery list from https://blind-tiger.pages.dev/groceries.txt to the shared Apple Reminders list "Groceries", skipping anything already there (open, or checked off in the last week; whole title, any case). Install on iPhone from https://blind-tiger.pages.dev/sync-groceries.shortcut.
- To change it: edit the script, run `python3 _system/shortcuts/make_sync_groceries.py "Sync Groceries.shortcut"`, sign it on a Mac with `shortcuts sign --mode anyone --input "Sync Groceries.shortcut" --output "Sync Groceries signed.shortcut"`, and save the signed file as `_system/web/sync-groceries.shortcut`. iOS won't import an unsigned file.
