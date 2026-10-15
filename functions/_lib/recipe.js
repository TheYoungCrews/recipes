// Pure helpers: apply a "cooked it" log to a recipe markdown file (follows _system/skills/recipe-feedback).
export function todayNY(d = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/New_York", year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
}

function setField(fm, key, val) {
  const re = new RegExp(`^${key}:.*$`, "m");
  return re.test(fm) ? fm.replace(re, `${key}: ${val}`) : fm.replace(/\n?$/, `\n${key}: ${val}`);
}
const getField = (fm, key) => ((new RegExp(`^${key}:[ \\t]*(.*)$`, "m").exec(fm) || [])[1] || "").trim();

export function applyCook(md, { date, who, rating, note, photo }) {
  const m = /^---\n([\s\S]*?)\n---\n?([\s\S]*)$/.exec(md.replace(/\r\n/g, "\n"));
  if (!m) throw new Error("no frontmatter");
  let fm = m[1], body = m[2];
  const status = getField(fm, "status");
  if (rating != null) fm = setField(fm, "rating", String(rating));
  fm = setField(fm, "last_made", date);
  fm = setField(fm, "cooks", String((parseInt(getField(fm, "cooks"), 10) || 0) + 1));
  if (rating === 5 && status !== "retired") fm = setField(fm, "status", "favorite");
  else if (status === "to-try") fm = setField(fm, "status", "made");

  const clean = String(note || "").replace(/\s+/g, " ").trim();
  const line = `- ${date} (${who} via site${rating != null ? `, ${rating}/5` : ""}): ${clean || "cooked it."}`;
  const lines = body.split("\n");
  let ni = lines.findIndex(l => /^##\s+notes\s*$/i.test(l));
  if (ni < 0) { while (lines.length && lines[lines.length - 1] === "") lines.pop(); lines.push("", "## Notes"); ni = lines.length - 1; }
  lines.splice(ni + 1, 0, line);

  if (photo) {
    const img = `![Made ${date}](${photo})`;
    let pi = lines.findIndex(l => /^!\[[^\]]*\]\(photos\//.test(l.trim()));
    if (pi >= 0) lines.splice(pi, 0, img);              // newest photo first = card cover
    else {
      const h = lines.findIndex(l => /^##\s/.test(l));
      const at = h < 0 ? lines.length : h;
      lines.splice(at, 0, img, "");
    }
  }
  return `---\n${fm}\n---\n${lines.join("\n")}`;
}

export function photoName(slug, date, existing = new Set()) {
  let n = `${slug}-${date}.jpg`, i = 2;
  while (existing.has(n)) n = `${slug}-${date}-${i++}.jpg`;
  return n;
}
