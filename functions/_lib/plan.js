// Pure helpers for the weekly plan files in plans/ (schema: _system/SCHEMA.md "Weekly plans").
// Same "current plan" rule as _system/scripts/groceries.py: the week containing today, else the next one coming up.
const pad = n => String(n).padStart(2, "0");
const ymd = d => `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
const parseDay = s => { const [y, m, d] = s.split("-").map(Number); return new Date(Date.UTC(y, m - 1, d)); };
export const NIGHTS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
export const DINNER_TYPES = new Set(["main", "soup-bowl"]);

export function isoWeek(day) {               // "2026-11-04" -> { week: "2026-W45", starts: "2026-11-02" }
  const d = parseDay(day), dow = (d.getUTCDay() + 6) % 7;
  const mon = new Date(d); mon.setUTCDate(d.getUTCDate() - dow);
  const thu = new Date(mon); thu.setUTCDate(mon.getUTCDate() + 3);
  const y = thu.getUTCFullYear(), jan4 = new Date(Date.UTC(y, 0, 4));
  const wk1 = new Date(jan4); wk1.setUTCDate(jan4.getUTCDate() - ((jan4.getUTCDay() + 6) % 7));
  return { week: `${y}-W${pad(1 + Math.round((mon - wk1) / (7 * 864e5)))}`, starts: ymd(mon) };
}
export function mondayOf(week) {             // "2026-W45" -> "2026-11-02"
  const m = /^(\d{4})-W(\d{2})$/.exec(week); if (!m) return null;
  const jan4 = new Date(Date.UTC(+m[1], 0, 4));
  const wk1 = new Date(jan4); wk1.setUTCDate(jan4.getUTCDate() - ((jan4.getUTCDay() + 6) % 7));
  wk1.setUTCDate(wk1.getUTCDate() + 7 * (+m[2] - 1)); return ymd(wk1);
}
/** names: plan filenames in plans/ ("2026-W45.md"). Returns { week, starts, exists }. */
export function pickWeek(names, today) {
  const weeks = names.map(n => /^(\d{4}-W\d{2})\.md$/.exec(n)).filter(Boolean).map(m => ({ week: m[1], starts: mondayOf(m[1]) })).sort((a, b) => a.starts < b.starts ? -1 : 1);
  const t = parseDay(today);
  const cur = weeks.find(w => { const s = parseDay(w.starts); return s <= t && t - s < 7 * 864e5; });
  if (cur) return { ...cur, exists: true };
  const up = weeks.find(w => w.starts > today);
  if (up) return { ...up, exists: true };
  // No plan yet: this week, or next week if today is Sunday (planning day).
  const next = new Date(t); if (t.getUTCDay() === 0) next.setUTCDate(t.getUTCDate() + 1);
  return { ...isoWeek(ymd(next)), exists: false };
}
export function newPlan({ week, starts }) {
  return `---\nweek: ${week}\nstarts: ${starts}\nserves: 2\nrecipes: []\nnights: []\nextras: []\non_hand: []\nadd: []\n---\n`;
}
const split = md => { const m = /^---\n([\s\S]*?)\n---\n?([\s\S]*)$/.exec(md.replace(/\r\n/g, "\n")); if (!m) throw new Error("no frontmatter"); return [m[1], m[2]]; };
export function getList(fm, key) {
  const m = new RegExp(`^${key}:[ \\t]*\\[(.*)\\][ \\t]*(#.*)?$`, "m").exec(fm);
  return m ? m[1].split(",").map(s => s.trim().replace(/^['"]|['"]$/g, "")).filter(Boolean) : [];
}
function setList(fm, key, list) {
  const line = `${key}: [${list.join(", ")}]`, re = new RegExp(`^${key}:.*$`, "m");
  return re.test(fm) ? fm.replace(re, line) : fm + `\n${line}`;
}
export function readPlan(md) {
  const [fm] = split(md);
  return { recipes: getList(fm, "recipes"), nights: getList(fm, "nights"), extras: getList(fm, "extras") };
}
/** action add|remove. as: "dinner" | "extra". night: mon..sun|any (dinners only). Returns { md, changed, as }. */
export function editPlan(md, { action, slug, as = "dinner", night = "any" }) {
  let [fm, body] = split(md);
  let recipes = getList(fm, "recipes"), nights = getList(fm, "nights"), extras = getList(fm, "extras");
  if (nights.length !== recipes.length) nights = recipes.map((_, i) => nights[i] || "any");
  const had = recipes.includes(slug) || extras.includes(slug);
  if (action === "add") {
    if (had) return { md, changed: false, as: recipes.includes(slug) ? "dinner" : "extra" };
    if (as === "extra") extras.push(slug);
    else { recipes.push(slug); nights.push(NIGHTS.includes(night) ? night : "any"); }
  } else if (action === "remove") {
    if (!had) return { md, changed: false, as };
    const i = recipes.indexOf(slug);
    if (i >= 0) { recipes.splice(i, 1); nights.splice(i, 1); as = "dinner"; } else { extras = extras.filter(s => s !== slug); as = "extra"; }
  } else throw new Error("bad action");
  fm = setList(setList(setList(fm, "recipes", recipes), "nights", nights), "extras", extras);
  return { md: `---\n${fm}\n---\n${body}`, changed: true, as };
}
export const typeOf = md => ((/^type:[ \t]*([a-z-]+)/m.exec(md) || [])[1] || "");
