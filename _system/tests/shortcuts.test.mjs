// node --test _system/tests/  Generated Sync Groceries shortcut plist (stdlib plistlib; no network).
import test from "node:test"; import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const inspect = (dest) => JSON.parse(execFileSync("python3", ["-c", `
import json, plistlib, sys
p = plistlib.load(open(sys.argv[1], "rb"))
by = {}
for a in p["WFWorkflowActions"]:
    by.setdefault(a["WFWorkflowActionIdentifier"], []).append(a["WFWorkflowActionParameters"])
def path_string(tok):
    if isinstance(tok, str): return tok
    return (tok or {}).get("Value", {}).get("string", "")
gf = by["is.workflow.actions.documentpicker.open"][0]
ap = by["is.workflow.actions.file.append"][0]
fmt = by["is.workflow.actions.format.date"][0]
comment = by["is.workflow.actions.comment"][0]["WFCommentActionText"]
notes = []
for n in by["is.workflow.actions.notification"]:
    notes.append(path_string(n.get("WFNotificationActionBody")))
print(json.dumps({
    "name": p.get("WFWorkflowName"),
    "ids": [a["WFWorkflowActionIdentifier"] for a in p["WFWorkflowActions"]],
    "comment": comment,
    "get_picker": gf.get("WFShowFilePicker"),
    "get_err": gf.get("WFFileErrorIfNotFound"),
    "get_service": gf.get("WFFileStorageService"),
    "get_path": path_string(gf.get("WFGetFilePath")),
    "append_mode": ap.get("WFAppendFileWriteMode"),
    "append_newline": ap.get("WFAppendOnNewLine"),
    "append_service": ap.get("WFFileStorageService"),
    "append_path": path_string(ap.get("WFFilePath")),
    "date_style": fmt.get("WFDateFormatStyle"),
    "date_fmt": fmt.get("WFDateFormat"),
    "date_fmt_str": fmt.get("WFDateFormatString"),
    "notes": notes,
}))
`, dest], { encoding: "utf8" }));

test("Sync Groceries shortcut logs sent items per week and parses as a plist", () => {
  const dest = join(mkdtempSync(join(tmpdir(), "sg-")), "Sync Groceries.shortcut");
  execFileSync("python3", ["_system/shortcuts/make_sync_groceries.py", dest]);
  const info = inspect(dest);
  assert.equal(info.name, "Sync Groceries");
  for (const id of [
    "is.workflow.actions.date",
    "is.workflow.actions.format.date",
    "is.workflow.actions.documentpicker.open",
    "is.workflow.actions.file.append",
    "is.workflow.actions.addnewreminder",
    "is.workflow.actions.notification",
  ]) assert.ok(info.ids.includes(id), id);
  assert.equal(info.get_picker, false);
  assert.equal(info.get_err, false);
  assert.equal(info.get_service, "iCloud Drive");
  assert.match(info.get_path, /\/Shortcuts\/Cookbook\/groceries-sent-/);
  assert.match(info.get_path, /\.txt/);
  assert.equal(info.append_mode, "Append");
  assert.equal(info.append_newline, true);
  assert.equal(info.append_service, "iCloud Drive");
  assert.match(info.append_path, /\/Cookbook\/groceries-sent-/);
  assert.match(info.append_path, /\.txt/);
  assert.equal(info.date_style, "Custom");
  assert.equal(info.date_fmt, "YYYY-'W'ww");
  assert.equal(info.date_fmt_str, "YYYY-'W'ww");
  assert.match(info.comment, /already added this week/i);
  assert.match(info.comment, /Deleting a reminder/i);
  assert.ok(info.notes.some((n) => n.includes("Added ")));
  assert.ok(info.notes.some((n) => n.includes("Nothing new to add")));
});
