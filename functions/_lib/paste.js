// Split a pasted blob into recipe items and wrap each as an inbox/*.md file. Content is data only.
import { todayNY } from "./recipe.js";

export const MAX_BYTES = 200_000;
export const MAX_ITEMS = 40;
export const MAX_PASTE_ITEMS_DAY = 100;

const DASH = /^(?:-{3,}|_{3,}|\*{3,})\s*$/;
const TITLE_LINE = /^(?:title\s*:\s*|#{1,3}\s+|recipe\s*:\s*)(.+?)\s*$/i;
const FM_TITLE = /^title:\s*(.+)$/im;

export function slugify(title) {
  return String(title || "untitled").normalize("NFKD").replace(/[^\w\s-]/g, "")
    .toLowerCase().trim().replace(/[\s_]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || "untitled";
}

export function titleFrom(chunk) {
  const t = String(chunk || "").trim();
  if (!t) return "Untitled";
  const fm = FM_TITLE.exec(t);
  if (fm) return cleanTitle(fm[1]);
  for (const line of t.split(/\r?\n/).slice(0, 12)) {
    const m = TITLE_LINE.exec(line.trim());
    if (m) return cleanTitle(m[1]);
  }
  const first = t.split(/\r?\n/).map(l => l.trim()).find(l => l && !l.startsWith("---") && !l.startsWith("```"));
  return cleanTitle(first || "Untitled").slice(0, 80);
}

function cleanTitle(s) {
  return String(s || "").replace(/^#+\s*/, "").replace(/^["'`]+|["'`]+$/g, "").replace(/\s+/g, " ").trim() || "Untitled";
}

/** Split pasted text into recipe chunks. Prefer clear separators; otherwise one item. */
export function splitRecipes(text) {
  const raw = String(text || "").replace(/^\uFEFF/, "").trim();
  if (!raw) return [];
  const lines = raw.split(/\r?\n/);

  // 1) Horizontal rules (---) as separators, but not YAML frontmatter fences inside a chunk.
  const byDash = splitOnDashes(lines);
  if (byDash.length > 1) return byDash;

  // 2) Repeated top-level headings / Title: / recipe: starts
  const byHead = splitOnHeadings(lines);
  if (byHead.length > 1) return byHead;

  return [raw];
}

function splitOnDashes(lines) {
  const chunks = [];
  let buf = [], inFm = false, sawFmClose = false, contentBefore = false;
  const flush = () => {
    const t = buf.join("\n").trim();
    if (t) chunks.push(t);
    buf = []; inFm = false; sawFmClose = false; contentBefore = false;
  };
  for (const line of lines) {
    if (DASH.test(line.trim())) {
      // Opening YAML ---
      if (!inFm && !sawFmClose && buf.every(l => !l.trim())) {
        inFm = true; buf.push(line); continue;
      }
      // Closing YAML ---
      if (inFm && !sawFmClose) {
        inFm = false; sawFmClose = true; buf.push(line); continue;
      }
      // Separator between recipes
      flush();
      continue;
    }
    if (line.trim()) contentBefore = true;
    buf.push(line);
  }
  flush();
  // If we only ever saw one YAML doc, byDash length 1 is correct.
  return chunks;
}

function splitOnHeadings(lines) {
  const starts = [];
  for (let i = 0; i < lines.length; i++) {
    const t = lines[i].trim();
    if (/^#{1,2}\s+\S/.test(t) || /^title\s*:\s*\S/i.test(t) || /^recipe\s*:\s*\S/i.test(t)) {
      // Skip title: inside a frontmatter block already started
      starts.push(i);
    }
  }
  // Need at least 2 recipe starts, and not every line
  if (starts.length < 2) return [];
  // Drop starts that are too close (< 3 lines) to the previous (noise)
  const kept = [starts[0]];
  for (const i of starts.slice(1)) if (i - kept[kept.length - 1] >= 3) kept.push(i);
  if (kept.length < 2) return [];
  const chunks = [];
  for (let k = 0; k < kept.length; k++) {
    const a = kept[k], b = k + 1 < kept.length ? kept[k + 1] : lines.length;
    const t = lines.slice(a, b).join("\n").trim();
    if (t) chunks.push(t);
  }
  return chunks.length > 1 ? chunks : [];
}

/** Build inbox markdown for one pasted chunk. */
export function wrapInboxFile({ chunk, who, date = todayNY(), slug, title, via = "site-paste" }) {
  const body = String(chunk || "").trim();
  const hasFm = /^---\r?\n/.test(body);
  let fm = {}, rest = body;
  if (hasFm) {
    const m = body.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
    if (m) {
      for (const line of m[1].split(/\r?\n/)) {
        if (!line.includes(":")) continue;
        const i = line.indexOf(":");
        fm[line.slice(0, i).trim()] = line.slice(i + 1).trim();
      }
      rest = m[2];
    }
  }
  const t = title || fm.title || titleFrom(body);
  const s = slug || slugify(fm.slug || t);
  const fields = {
    title: unquote(String(t).replace(/^["']|["']$/g, "")),
    slug: s,
    type: fm.type || "main",
    status: "to-try",
    tags: fm.tags || "[]",
    ingredients: fm.ingredients || "[]",
    serves: fm.serves || "",
    time_minutes: fm.time_minutes || "",
    source: fm.source || "",
    source_type: fm.source_type || "ai",
    added: date,
    added_by: who,
    via,
    owner: fm.owner || "unknown",
    credit: fm.credit || "",
    input_type: "text",
    last_made: "",
    rating: "",
    cooks: "0",
  };
  // Keep optional spirit/glass if present
  if (fm.spirit) fields.spirit = unquote(fm.spirit);
  if (fm.glass) fields.glass = unquote(fm.glass);
  const fmLines = Object.entries(fields).filter(([, v]) => v !== undefined)
    .map(([k, v]) => `${k}: ${v}`).join("\n");
  const note = `- ${date} (via ${via}): added by ${who}; pending filing.`;
  let outRest = rest.trim();
  if (!/^##\s+Notes/m.test(outRest)) outRest = (outRest ? outRest + "\n\n" : "") + `## Notes\n${note}\n`;
  else outRest = outRest.replace(/^##\s+Notes\s*$/m, `## Notes\n${note}`);
  return { path: `inbox/${date}-${s}.md`, title: fields.title, slug: s, content: `---\n${fmLines}\n---\n${outRest}\n` };
}

function unquote(s) {
  const t = String(s || "").trim();
  if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))) return t.slice(1, -1);
  return t;
}

/** Assign unique inbox paths given existing paths (Set of "inbox/....md"). */
export function uniquePaths(files, existing) {
  const used = new Set(existing);
  const out = [];
  for (const f of files) {
    let path = f.path, n = 2;
    const m = /^(inbox\/\d{4}-\d{2}-\d{2}-)(.+)(\.md)$/.exec(path);
    while (used.has(path)) {
      path = m ? `${m[1]}${m[2]}-${n}${m[3]}` : path.replace(/\.md$/, `-${n}.md`);
      n++;
    }
    used.add(path);
    const slug = path.replace(/^inbox\/\d{4}-\d{2}-\d{2}-/, "").replace(/\.md$/, "");
    out.push({ ...f, path, slug, content: f.content.replace(/^slug: .+$/m, `slug: ${slug}`) });
  }
  return out;
}

/** Build inbox markdown from a structured JSON recipe object. */
export function wrapJsonRecipe({ recipe, who, date = todayNY(), via = "api" }) {
  const r = recipe || {};
  const title = (r.title && String(r.title).trim()) || titleFrom(JSON.stringify(r)) || "Untitled";
  const slug = slugify(r.slug || title);
  const ingredients = Array.isArray(r.ingredients) ? r.ingredients : [];
  const steps = Array.isArray(r.steps) ? r.steps : [];
  const notes = r.notes != null ? String(r.notes) : "";
  const source = r.source != null ? String(r.source) : "";
  const type = r.type === "cocktail" || r.type === "mocktail" ? r.type : (r.type || "main");
  const body = r.body || r.markdown || "";
  if (body && String(body).trim()) {
    return wrapInboxFile({ chunk: String(body).trim(), who, date, slug, title, via });
  }
  const ingList = ingredients.map(x => {
    if (typeof x === "string") return `- ${x}`;
    const amt = x.amount != null ? `${x.amount} ` : "";
    return `- ${amt}${x.name || x.item || JSON.stringify(x)}`.trim();
  }).join("\n") || "- (amount not given)";
  const stepList = steps.map((x, i) => `${i + 1}. ${typeof x === "string" ? x : (x.text || JSON.stringify(x))}`).join("\n") || "1. (steps not given)";
  const parts = [`# ${title}`];
  if (source) parts.push(`Source: ${source}`);
  parts.push("", "## Ingredients", ingList, "", "## Steps", stepList);
  if (notes) parts.push("", "## Cook notes", notes);
  const file = wrapInboxFile({ chunk: parts.join("\n"), who, date, slug, title, via });
  file.content = file.content.replace(/^type: .+$/m, `type: ${type}`);
  if (source) file.content = file.content.replace(/^source: .*$/m, `source: ${JSON.stringify(source)}`);
  return file;
}
