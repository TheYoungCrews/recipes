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
  window.ASK_AI_USED=false;
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
    `<div class=note>${window.ASK_AI_USED?"Picked by the kitchen helper from our book.":"Simple keyword and pantry matching. It only suggests recipes already in our book."}</div>`;
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
// ---- Sign-in (Google or Ethereum/SIWE) shared by Cooked it and Ask. The server keeps a 30-day HttpOnly session cookie that renews itself with use; signed-in state always comes from GET /api/session.
(function(){
let cfg=null,gsi=null;
const getCfg=()=>cfg||(cfg=fetch("/api/config").then(r=>r.ok?r.json():{}).catch(()=>({})));
const gtok=()=>{try{const t=JSON.parse(sessionStorage.getItem("gid")||"null");return t&&t.exp>Date.now()/1000+60?t.v:null}catch(e){return null}};
const saveTok=v=>{try{const p=JSON.parse(atob(v.split(".")[1].replace(/-/g,"+").replace(/_/g,"/")));sessionStorage.setItem("gid",JSON.stringify({v,exp:p.exp}))}catch(e){}};
const A=window.KAUTH={onSignedIn:[],headers:()=>{const t=gtok(),h={"content-type":"application/json"};if(t)h.authorization="Bearer "+t;return h}};
const done=async()=>{await fetch("/api/session",{method:"POST",credentials:"same-origin",headers:A.headers()}).catch(()=>{});A.onSignedIn.forEach(f=>{try{f()}catch(e){}})};
A.signedIn=async()=>{const r=await fetch("/api/session",{credentials:"same-origin",headers:A.headers()}).catch(()=>null);return !!(r&&r.ok)};
function loadGsi(id){return gsi||(gsi=new Promise((ok,no)=>{const s=document.createElement("script");s.src="https://accounts.google.com/gsi/client";s.async=true;
  s.onload=()=>{google.accounts.id.initialize({client_id:id,callback:r=>{saveTok(r.credential);done()},auto_select:true,context:"signin"});ok()};s.onerror=no;document.head.appendChild(s)}))}
const G_ICON='<svg viewBox="0 0 48 48" width="18" height="18" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.6 5.4 2.6 13.3l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z"/><path fill="#4285F4" d="M46.1 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.4c-.5 2.9-2.2 5.3-4.6 7l7.3 5.7c4.3-4 7-9.9 7-17.2z"/><path fill="#FBBC05" d="M10.5 28.6c-.5-1.4-.8-3-.8-4.6s.3-3.2.8-4.6l-7.9-6.1C1 16.6 0 20.2 0 24s1 7.4 2.6 10.7l7.9-6.1z"/><path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.3-5.7c-2 1.4-4.7 2.3-8.6 2.3-6.3 0-11.6-4.1-13.5-9.9l-7.9 6.1C6.6 42.6 14.6 48 24 48z"/></svg>';
const E_ICON='<svg viewBox="0 0 256 417" width="12" height="19" aria-hidden="true"><path fill="#343434" d="M127.9 0l-2.8 9.5v275.7l2.8 2.8 127.9-75.6z"/><path fill="#8C8C8C" d="M127.9 0L0 212.3l127.9 75.6V154.2z"/><path fill="#3C3C3B" d="M127.9 312.2l-1.6 1.9v98.2l1.6 4.6L256 236.6z"/><path fill="#8C8C8C" d="M127.9 416.9V312.2L0 236.6z"/><path fill="#141414" d="M127.9 287.9l127.9-75.6-127.9-58.1z"/><path fill="#393939" d="M0 212.3l127.9 75.6V154.2z"/></svg>';
let walletLoad=null;
function loadWallet(){
  if(!walletLoad){const l=document.createElement("link");l.rel="stylesheet";l.href="/wallet/wallet.css";document.head.appendChild(l);
    walletLoad=import("/wallet/wallet.js").then(()=>window.KWALLET)}
  return walletLoad;
}
function signedInNow(){A.onSignedIn.forEach(f=>{try{f()}catch(e){}})}
A.signIn=async(box,say)=>{
  const c=await getCfg(), g$=c.clientId&&c.ready, e$=!!c.eth;
  if(!g$&&!e$){say("Sign-in isn't switched on yet.");return false}
  box.innerHTML="";say("Sign in so we know it's you:");
  const row=document.createElement("div");row.className="signrow";box.appendChild(row);
  if(g$){const b=document.createElement("div");b.className="sbtn";b.innerHTML=G_ICON+"<span>Google</span><div class=gsiover></div>";row.appendChild(b);
    try{await loadGsi(c.clientId);const w=Math.round(b.getBoundingClientRect().width)||170;
      google.accounts.id.renderButton(b.querySelector(".gsiover"),{type:"standard",shape:"pill",text:"signin",size:"large",width:Math.max(120,w)})}catch(e){b.remove()}}
  if(e$){const b=document.createElement("button");b.type="button";b.className="sbtn";b.innerHTML=E_ICON+"<span>Wallet</span>";row.appendChild(b);
    b.addEventListener("click",async()=>{b.disabled=true;say("Opening wallets…");
      try{const W=await loadWallet();say("Sign in so we know it's you:");W.open({say,onDone:()=>{say("");signedInNow()}})}
      catch(e){say("Couldn't load the wallet picker.")}finally{b.disabled=false}})}
  A.onSignedIn.push(()=>{box.innerHTML=""});
};
// Per-recipe "ask about this"
document.querySelectorAll("form.askr").forEach(f=>{
  const box=f.querySelector(".askans"),gs=f.querySelector(".gsi"),say=t=>{box.textContent=t;box.hidden=!t};
  async function go(){
    const qv=f.querySelector("input").value.trim();if(!qv)return;
    say("Thinking…");
    const r=await fetch("/api/ask",{method:"POST",credentials:"same-origin",headers:A.headers(),body:JSON.stringify({slug:f.dataset.slug,question:qv})}).catch(()=>null);
    const j=r?await r.json().catch(()=>({})):{};
    if(r&&r.status===401){sessionStorage.removeItem("gid");say("Sign in to ask.");A.onSignedIn.push(()=>go());return A.signIn(gs,say)}
    say(r&&r.ok?j.answer:(j.error||"Couldn't ask right now."));
  }
  f.addEventListener("submit",e=>{e.preventDefault();go()});
});
// Main ask box -> AI search when signed in (the local matcher stays as the fallback)
window.ASK_BACKEND=async q=>{
  if(!(await A.signedIn())){const n=document.getElementById("asksign");if(n)n.hidden=false;throw new Error("signed out")}
  const r=await fetch("/api/ask",{method:"POST",credentials:"same-origin",headers:A.headers(),body:JSON.stringify({mode:"search",question:q})});
  if(!r.ok)throw new Error("ask failed");window.ASK_AI_USED=true;return (await r.json()).picks||[];
};
const sb=document.getElementById("asksignbtn");
if(sb)sb.addEventListener("click",()=>{const n=document.getElementById("asksign"),say=t=>{n.querySelector(".asksay").textContent=t};
  A.onSignedIn.push(()=>{n.hidden=true;const f=document.getElementById("askform");if(f&&document.getElementById("q").value.trim())f.requestSubmit()});
  A.signIn(n.querySelector(".gsi"),say)});
})();
// ---- Cooked it: rate + note + photo -> /api/cook (Google sign-in; server checks the allowlist)
(function(){
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
let cfg=null, gsiLoaded=null, pending=null;
const getCfg=()=>cfg||(cfg=fetch("/api/config").then(r=>r.ok?r.json():{}).catch(()=>({})));
const tok=()=>{try{const t=JSON.parse(sessionStorage.getItem("gid")||"null");return t&&t.exp>Date.now()/1000+60?t.v:null}catch(e){return null}};
const saveTok=v=>{try{const p=JSON.parse(atob(v.split(".")[1].replace(/-/g,"+").replace(/_/g,"/")));sessionStorage.setItem("gid",JSON.stringify({v,exp:p.exp,email:p.email}))}catch(e){}};
function loadGsi(clientId){
  return gsiLoaded||(gsiLoaded=new Promise((ok,no)=>{const s=document.createElement("script");s.src="https://accounts.google.com/gsi/client";s.async=true;
    s.onload=()=>{google.accounts.id.initialize({client_id:clientId,callback:r=>{saveTok(r.credential);if(pending){const f=pending;pending=null;f()}},auto_select:true,context:"signin"});ok()};s.onerror=no;document.head.appendChild(s)}));
}
const stars=(el,v)=>{$$(".rate button",el).forEach((b,i)=>{const n=i+1;b.style.color="";b.style.background="";
  b.className=v>=n?"f":v>=n-.5?"h":""});$(".rv",el).textContent=v?`${v}/5`:"";};
function resize(file){
  return createImageBitmap(file,{imageOrientation:"from-image"}).catch(()=>createImageBitmap(file)).then(img=>{
    const k=Math.min(1,1600/Math.max(img.width,img.height)),c=document.createElement("canvas");
    c.width=Math.round(img.width*k);c.height=Math.round(img.height*k);c.getContext("2d").drawImage(img,0,0,c.width,c.height);
    return c.toDataURL("image/jpeg",.84)});
}
$$("form.cook").forEach(f=>{
  let val=0, photo=null; const msg=$(".cmsg",f), save=$(".b2",f), say=(t,ok)=>{msg.textContent=t;msg.className="cmsg"+(ok?" ok":"")};
  $$(".rate button",f).forEach(b=>b.addEventListener("click",()=>{const n=+b.dataset.v;val=val===n?n-.5:n;if(val<1)val=n;stars(f,val);save.disabled=false;getCfg()}));
  async function usePhoto(file){if(!file)return;if(!/^image\//.test(file.type||"")&&!/\.(heic|heif|jpe?g|png|webp|gif)$/i.test(file.name||""))return say("That's not a photo.");say("Shrinking photo…");
    try{photo=await resize(file);$(".pv img",f).src=photo;$(".pv",f).hidden=false;say("")}catch(err){say("Couldn't read that photo.")}}
  $("input[type=file]",f).addEventListener("change",e=>usePhoto(e.target.files[0]));
  // Drag a photo anywhere onto the Cooked it form
  let dz=0;const hasFile=e=>[...(e.dataTransfer&&e.dataTransfer.types||[])].includes("Files");
  f.addEventListener("dragenter",e=>{if(!hasFile(e))return;e.preventDefault();dz++;f.classList.add("drop")});
  f.addEventListener("dragover",e=>{if(!hasFile(e))return;e.preventDefault();e.dataTransfer.dropEffect="copy"});
  f.addEventListener("dragleave",()=>{if(--dz<=0){dz=0;f.classList.remove("drop")}});
  f.addEventListener("drop",e=>{if(!hasFile(e))return;e.preventDefault();dz=0;f.classList.remove("drop");usePhoto(e.dataTransfer.files[0])});
  $(".px",f).addEventListener("click",()=>{photo=null;$(".pv",f).hidden=true;$("input[type=file]",f).value=""});
  async function send(siwe){
    say("Saving…");save.disabled=true;
    const t=tok(),h={"content-type":"application/json"};if(t)h.authorization="Bearer "+t;
    const r=await fetch("/api/cook",{method:"POST",credentials:"same-origin",headers:h,
      body:JSON.stringify({slug:f.dataset.slug,rating:val,note:$("textarea",f).value,photo,siwe:siwe||undefined})}).catch(()=>null);
    const j=r?await r.json().catch(()=>({})):{};
    if(r&&r.status===401){sessionStorage.removeItem("gid");save.disabled=false;f.dataset.want=1;return ask()}
    if(!r||!r.ok){save.disabled=false;return say(j.error||"Couldn't save. Try again?")}
    $(".gsi",f).innerHTML="";
    say(`Logged for ${j.who==="anna"?"Anna":"Crews"} ✓ The page updates in a couple minutes.`,true);
    const d=$(".diary",f.closest("article"));if(d){$(".diary-empty",d)?.remove();const row=document.createElement("div");
      row.innerHTML=`<span>today</span><div><b>${j.who}</b>: ${val}/5 ${$("textarea",f).value.replace(/[<&]/g,"")}</div>`;d.prepend(row)}
  }
  async function ask(){
    const ok=await window.KAUTH.signIn($(".gsi",f),say);
    if(ok===false)save.disabled=false;
  }
  window.KAUTH.onSignedIn.push(()=>{if(f.dataset.want){delete f.dataset.want;send()}});
  f.addEventListener("submit",async e=>{e.preventDefault();if(!val)return say("Pick some stars first.");if(await window.KAUTH.signedIn())return send();f.dataset.want=1;ask()});
});
})();
