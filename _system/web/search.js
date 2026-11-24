// Simple home-page search over recipes and cocktails. No network, no sign-in.
export function norm(s){
  return String(s||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");
}

function fields(r){
  const title=norm(r.title);
  const other=[
    ...(r.ingredients||[]),
    ...(r.tags||[]),
    r.cuisine||"",
    r.spirit||"",
  ].map(norm).filter(Boolean);
  return {title, all:[title, ...other].join(" ")};
}

function tokens(q){
  return norm(q).split(/[^a-z0-9]+/).filter(Boolean);
}

// 2 = title match, 1 = ingredient/tag/cuisine/spirit match, 0 = no match.
export function scoreItem(r, query){
  const q=norm(query).trim();
  if(!q) return 2;
  const f=fields(r);
  const words=tokens(q);
  const has=hay=>words.every(w=>hay.includes(w));
  if(has(f.title) || f.title.includes(q)) return 2;
  if(has(f.all) || f.all.includes(q)) return 1;
  return 0;
}

export function searchItems(items, query){
  const q=norm(query).trim();
  if(!q) return items.slice();
  return items
    .map(r=>({r, s:scoreItem(r, query)}))
    .filter(x=>x.s>0)
    .sort((a,b)=>b.s-a.s)
    .map(x=>x.r);
}
