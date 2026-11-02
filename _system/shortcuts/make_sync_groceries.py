#!/usr/bin/env python3
"""Writes the unsigned "Sync Groceries" Shortcut plist (stdlib only).

  python3 _system/shortcuts/make_sync_groceries.py /tmp/Sync\\ Groceries.shortcut

Flow: Get https://blind-tiger.pages.dev/groceries.txt -> split by new lines -> Find Reminders in "Groceries"
(open, plus checked off in the last week) -> one lowercase text "|title|title|" -> for each feed line, if that text
does not contain "|line|" (whole-title match, any case), add a reminder to "Groceries" and bump AddedCount
-> notify "Added N: a, b" when N > 0, else "Nothing new to add".
The file has to be signed on a Mac (`shortcuts sign --mode anyone`) before iOS will import it; the signed copy
lives at _system/web/sync-groceries.shortcut and is served at /sync-groceries.shortcut."""
import plistlib, sys, uuid

FEED = "https://blind-tiger.pages.dev/groceries.txt"
LIST = {"Title": "Groceries", "Identifier": "A99A9127-03ED-4C82-89C8-DFC3C297B14B", "IsAllCalendar": False}
OBJ = "\ufffc"
U = lambda n: str(uuid.uuid5(uuid.NAMESPACE_URL, "sync-groceries/" + n)).upper()   # stable ids, so rebuilds diff cleanly

def out(uid, name, prop=None):
    v = {"Type": "ActionOutput", "OutputUUID": uid, "OutputName": name}
    if prop: v["Aggrandizements"] = [{"Type": "WFPropertyVariableAggrandizement", "PropertyName": prop}]
    return v
def var(name): return {"Type": "Variable", "VariableName": name}
def att(v): return {"Value": v, "WFSerializationType": "WFTextTokenAttachment"}
def tokens(*parts):
    """Text with variables: tokens('|', var(...), '|')."""
    s, by = "", {}
    for p in parts:
        if isinstance(p, str): s += p
        else: by[f"{{{len(s)}, 1}}"] = p; s += OBJ
    return {"Value": {"string": s, "attachmentsByRange": by}, "WFSerializationType": "WFTextTokenString"}
def cond_input(v): return {"Type": "Variable", "Variable": att(v)}
def act(ident, **p): return {"WFWorkflowActionIdentifier": "is.workflow.actions." + ident, "WFWorkflowActionParameters": p}

def find_reminders(uid, completed, last_week=False):
    rows = [{"Operator": 4, "Property": "List", "Removable": True,
             "Values": {"Enumeration": {"Value": "Groceries", "WFSerializationType": "WFStringSubstitutableState"}}},
            {"Operator": 4, "Property": "Is Completed", "Removable": True, "Values": {"Bool": completed}}]
    if last_week:
        rows.append({"Operator": 1001, "Property": "Completion Date", "Removable": True, "Values": {"Number": 1, "Unit": 8192}})
    return act("filter.reminders", UUID=uid, WFContentItemFilter={"Value": {
        "WFActionParameterFilterPrefix": 1, "WFContentPredicateBoundedDate": False, "WFActionParameterFilterTemplates": rows},
        "WFSerializationType": "WFContentPredicateTableTemplate"})

def build():
    A, B, C, D, E, F, G, J, K, M, N, P, Z = (U(x) for x in "download split open done titles bars lower item wrapped add joined plusone zero".split())
    LOOP, IF1, IF2 = U("loop"), U("if-new"), U("if-any")
    a = [
        act("comment", WFCommentActionText="Sync Groceries: adds this week's cookbook grocery list (blind-tiger.pages.dev/groceries.txt) to the shared Reminders list Groceries. Skips anything already there, open or checked off in the last week."),
        act("downloadurl", UUID=A, WFURL=FEED, WFHTTPMethod="GET"),
        act("text.split", UUID=B, text=att(out(A, "Contents of URL")), WFTextSeparator="New Lines"),
        find_reminders(C, False),
        find_reminders(D, True, last_week=True),
        # "||" up front so a blank feed line ("||") always counts as present and is skipped.
        act("gettext", UUID=E, WFTextActionText=tokens("||\n", out(C, "Reminders", "Title"), "\n", out(D, "Reminders", "Title"), "\n")),
        act("text.replace", UUID=F, WFInput=tokens(out(E, "Text")), WFReplaceTextFind="\\s*\\n\\s*", WFReplaceTextReplace="|",
            WFReplaceTextRegularExpression=True, WFReplaceTextCaseSensitive=False),
        act("text.changecase", UUID=G, text=att(out(F, "Updated Text")), WFCaseType="lowercase"),
        act("setvariable", WFVariableName="Have", WFInput=att(out(G, "Updated Text"))),
        # Counter starts at 0 and only goes up inside the branch that really adds a reminder.
        act("number", UUID=Z, WFNumberActionNumber="0"),
        act("setvariable", WFVariableName="AddedCount", WFInput=att(out(Z, "Number"))),
        act("repeat.each", UUID=LOOP + "-S", GroupingIdentifier=LOOP, WFControlFlowMode=0, WFInput=att(out(B, "Split Text"))),
        act("text.changecase", UUID=J, text=att(var("Repeat Item")), WFCaseType="lowercase"),
        act("gettext", UUID=K, WFTextActionText=tokens("|", out(J, "Updated Text"), "|")),
        act("conditional", GroupingIdentifier=IF1, WFControlFlowMode=0, WFCondition=999,
            WFInput=cond_input(var("Have")), WFConditionalActionString=tokens(out(K, "Text"))),
        act("addnewreminder", UUID=M, WFCalendarItemTitle=tokens(var("Repeat Item")), WFCalendarDescriptor=dict(LIST),
            WFCalendarItemCalendar="Groceries", WFAlertEnabled="No Alert"),
        act("appendvariable", WFVariableName="Added", WFInput=att(var("Repeat Item"))),
        act("math", UUID=P, WFInput=att(var("AddedCount")), WFMathOperation="+", WFMathOperand="1"),
        act("setvariable", WFVariableName="AddedCount", WFInput=att(out(P, "Calculation Result"))),
        act("conditional", UUID=IF1 + "-E", GroupingIdentifier=IF1, WFControlFlowMode=2),
        act("repeat.each", UUID=LOOP + "-E", GroupingIdentifier=LOOP, WFControlFlowMode=2),
        act("conditional", GroupingIdentifier=IF2, WFControlFlowMode=0, WFCondition=2, WFInput=cond_input(var("AddedCount")), WFNumberValue="0"),
        act("text.combine", UUID=N, text=att(var("Added")), WFTextSeparator="Custom", WFTextCustomSeparator=", "),
        act("notification", WFNotificationActionTitle=tokens("Sync Groceries"),
            WFNotificationActionBody=tokens("Added ", var("AddedCount"), ": ", out(N, "Combined Text")), WFNotificationActionSound=False),
        act("conditional", GroupingIdentifier=IF2, WFControlFlowMode=1),
        act("notification", WFNotificationActionTitle=tokens("Sync Groceries"),
            WFNotificationActionBody=tokens("Nothing new to add"), WFNotificationActionSound=False),
        act("conditional", UUID=IF2 + "-E", GroupingIdentifier=IF2, WFControlFlowMode=2),
    ]
    return {"WFWorkflowActions": a, "WFWorkflowName": "Sync Groceries",
            "WFWorkflowClientVersion": "2700.0.4", "WFWorkflowMinimumClientVersion": 900, "WFWorkflowMinimumClientVersionString": "900",
            "WFWorkflowIcon": {"WFWorkflowIconGlyphNumber": 61587, "WFWorkflowIconStartColor": 3031607807},
            "WFWorkflowHasOutputFallback": False, "WFWorkflowHasShortcutInputVariables": False, "WFWorkflowImportQuestions": [],
            "WFWorkflowInputContentItemClasses": [], "WFWorkflowOutputContentItemClasses": [], "WFWorkflowTypes": []}

if __name__ == "__main__":
    dest = sys.argv[1] if len(sys.argv) > 1 else "Sync Groceries.shortcut"
    with open(dest, "wb") as f: plistlib.dump(build(), f, fmt=plistlib.FMT_XML)
    print(dest)
