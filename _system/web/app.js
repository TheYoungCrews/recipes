// Crews & Anna's Kitchen: search/ask, filters, dinner picker. Data: window.KITCHEN = {items, staples}.
(function(){
const K=window.KITCHEN, items=K.items, staples=new Set(K.staples), bySlug={};
items.forEach(r=>bySlug[r.slug]=r);
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
// Rotating placeholders
const ph=["What are we feeling tonight?","What do we want to cook tonight?","Tell me what's in your pantry…","Something cozy under 30 minutes?","A drink with rye?"];
let pi=0;const q=$('#q');setInterval(()=>{if(!q.value&&document.activeElement!==q){pi=(pi+1)%ph.length;q.placeholder=ph[pi]}},2800);

// ---- Ask: local matcher. To plug in Workers AI later, set window.ASK_BACKEND = async (question, items) => [{slug, why}, ...].
// Whatever the backend returns is filtered to slugs that exist here, so it can never invent a recipe.
const STOP=new Set("a an and the i we me my our us to of for in on with what do want something some tonight feel feeling like have got is are it that this cook make eat dinner please can you tell about any whats what's in your pantry fridge".split(" "));
const SYN={cozy:["soup-bowl","braise","fall","winter"],soup:["soup-bowl"],bowl:["soup-bowl"],noodle:["noodle","noodles","spaghetti"],noodles:["noodle","spaghetti"],
 spicy:["chili crisp","sambal oelek","jalapeno","chili"],quick:["quick-20","weeknight-30"],fast:["quick-20","weeknight-30"],easy:["weeknight-30","sheet-pan","one-pot"],
 drink:["cocktail"],drinks:["cocktail"],cocktail:["cocktail"],whiskey:["rye","bourbon","whiskey"],healthy:["high-protein"],protein:["high-protein"],
 fall:["fall"],autumn:["fall"],halloween:["fall"],christmas:["winter"],beef:["beef"],chicken:["chicken"],turkey:["turkey"],lamb:["lamb"],veggie:["veg"]};
const norm=s=>(s||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");
function localAsk(question){
  const text=norm(question), words=text.split(/[^a-z0-9-]+/).filter(w=>w&&!STOP.has(w));
  const quick=/quick|fast|under 30|30 min|weeknight|tonight/.test(text), drink=/drink|cocktail|bar|negroni|manhattan|sour|rye|mezcal|rum|gin/.test(text);
  const pantry=/pantry|fridge|have |on hand|got /.test(text);
  const terms=new Set(); words.forEach(w=>{terms.add(w);(SYN[w]||[]).forEach(t=>terms.add(t)); if(w.endsWith('s'))terms.add(w.slice(0,-1))});
  const res=items.filter(r=>r.status!=="retired").map(r=>{
    let score=0, hits=[], hay=norm(r.title);
    const ings=r.ingredients.map(norm), tags=r.tags.map(norm);
    terms.forEach(t=>{ if(t.length<3)return;
      const ing=ings.find(i=>i.includes(t)); if(ing){score+=3;hits.push(ing)}
      if(tags.includes(t)||norm(r.type)===t){score+=2}
      if(hay.includes(t)){score+=2;if(!ing)hits.push(t)} });
    const isDrink=r.type==="cocktail"||r.type==="mocktail";
    if(drink&&isDrink)score+=3; if(!drink&&isDrink)score-=4; if(drink&&!isDrink)score-=4;
    const t=parseInt(r.time_minutes)||99; if(quick&&!isDrink&&t<=30)score+=2;
    const have=ings.filter(i=>staples.has(i)).length, cover=ings.length?have/ings.length:0;
    score+=cover*(pantry?4:1.5);
    if(r.status==="favorite")score+=.6; if(r.rating)score+=parseFloat(r.rating)/10;
    const why=[]; const uniq=[...new Set(hits)].slice(0,3);
    if(uniq.length)why.push("Uses "+uniq.join(", "));
    if(ings.length&&!isDrink)why.push(`${have} of ${ings.length} ingredients usually on hand`);
    if(r.time_minutes&&!isDrink)why.push(r.time_minutes+" min");
    if(r.status==="favorite")why.push("a favorite"); else if(r.status==="to-try")why.push("still on the to-try list");
    if(r.rating)why.push(`last rated ${r.rating}★`);
    return {slug:r.slug,score,why:why.join(" · ")};
  }).filter(x=>x.score>0.5).sort((a,b)=>b.score-a.score).slice(0,3);
  return res;
}
async function ask(question){
  if(typeof window.ASK_BACKEND==="function"){
    try{const out=await window.ASK_BACKEND(question,items);const ok=(out||[]).filter(x=>bySlug[x.slug]).slice(0,3);if(ok.length)return ok}catch(e){}
  }
  return localAsk(question);
}
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
async function run(){
  const v=q.value.trim(), box=$('#answer'); if(!v){box.hidden=true;filter();return}
  const out=await ask(v); box.hidden=false;
  box.innerHTML=`<div class=q>You asked: <b>"${esc(v)}"</b></div>`+(out.length?out.map((x,i)=>{const r=bySlug[x.slug];
    return `<a class=ans href="#r-${r.slug}" style="text-decoration:none;color:inherit"><span class=n>${i+1}</span><div><div class="t hand">${esc(r.title)}</div><div class=w>${esc(x.why)}</div></div><span class=go>Open →</span></a>`}).join("")
    :`<div class=empty>Nothing in our book matches that yet. Try an ingredient, like "chicken" or "rye".</div>`)+
    `<div class=note>Simple keyword and pantry matching for now (no AI yet). It only suggests recipes already in our book.</div>`;
  filter();
}
$('#askform').addEventListener('submit',e=>{e.preventDefault();run()});
$$('.hint').forEach(h=>h.addEventListener('click',()=>{q.value=h.dataset.q;run()}));
// ---- Filters + live title search
let chip="all";
$$('.chip').forEach(c=>c.addEventListener('click',()=>{$$('.chip').forEach(x=>x.classList.remove('on'));c.classList.add('on');chip=c.dataset.f;filter()}));
function filter(){
  const v=norm(q.value).trim(); let shown=0;
  $$('#food .card').forEach(el=>{const r=bySlug[el.dataset.slug];
    const okChip=chip==="all"||r.type===chip||r.status===chip||r.tags.includes(chip);
    const okQ=!v||(norm(r.title)+" "+r.ingredients.join(" ")+" "+r.tags.join(" ")).includes(v)||$('#answer').hidden===false;
    el.hidden=!(okChip&&okQ); if(!el.hidden)shown++});
  $('#nores').hidden=shown>0;
}
// ---- Dinner picker: random made/favorite/to-try main or bowl
$('#pick').addEventListener('click',()=>{
  const pool=items.filter(r=>r.type!=="cocktail"&&r.type!=="mocktail"&&r.status!=="retired"); if(!pool.length)return;
  const r=pool[Math.floor(Math.random()*pool.length)];
  $$('.picked').forEach(x=>x.classList.remove('picked'));
  const el=$(`#food .card[data-slug="${r.slug}"]`); if(el){el.hidden=false;el.classList.add('picked');el.scrollIntoView({behavior:"smooth",block:"center"})}
  $('#pick').textContent="🎲 how about "+r.title.split("(")[0].trim()+"?";
});
// Ingredient checkboxes remember state per recipe on this device
$$('.ing input').forEach((cb,i)=>{const k="chk:"+cb.name;cb.checked=localStorage.getItem(k)==="1";cb.addEventListener('change',()=>localStorage.setItem(k,cb.checked?"1":"0"))});
// Scroll to top when opening a recipe
window.addEventListener('hashchange',()=>{if(location.hash.startsWith('#r-'))window.scrollTo(0,0)});
})();
