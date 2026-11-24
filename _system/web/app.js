// Crews & Anna's Kitchen: search, filters, dinner picker. Data: window.KITCHEN = {items, staples, inventory}.
(function(){
const K=window.KITCHEN, items=K.items, bySlug={};
items.forEach(r=>bySlug[r.slug]=r);
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const q=$('#q'), clr=$('#qclear');
const foodGrid=$('#food'), foodBase=$$('#food .card');
const bar=$('#bar'), barBase=bar?$$('#bar .card'):[];
function clearSearch(){q.value="";filter();q.focus()}
q.addEventListener('input',filter);
q.addEventListener('keydown',e=>{if(e.key==="Escape"){e.preventDefault();clearSearch()}});
if(clr)clr.addEventListener('click',clearSearch);
$('#askform').addEventListener('submit',e=>{e.preventDefault();filter()});
// ---- Filters + live search
let chip="all";
$$('.chip').forEach(c=>c.addEventListener('click',()=>{$$('.chip').forEach(x=>x.classList.remove('on'));c.classList.add('on');chip=c.dataset.f;filter()}));
const mins=el=>parseInt(bySlug[el.dataset.slug].time_minutes)||NaN;
function foodOrder(){
  const m=$('#sort').value;
  if(!m)return foodBase.slice();
  const dir=m==="long"?-1:1;
  return foodBase.slice().sort((a,b)=>{const x=mins(a),y=mins(b);
    if(isNaN(x)||isNaN(y))return isNaN(x)-isNaN(y); return (x-y)*dir||foodBase.indexOf(a)-foodBase.indexOf(b)});
}
function arrange(grid, order, v){
  const title=[], other=[], hidden=[];
  order.forEach(el=>{
    const r=bySlug[el.dataset.slug];
    const okChip=grid!==foodGrid||chip==="all"||r.type===chip||r.status===chip||r.tags.includes(chip);
    const s=v?scoreItem(r,v):2;
    const show=okChip&&s>0;
    el.hidden=!show;
    (show?(s===2?title:other):hidden).push(el);
  });
  [...title,...other,...hidden].forEach(el=>grid.appendChild(el));
  return title.length+other.length;
}
function filter(){
  const v=q.value.trim();
  if(clr)clr.hidden=!v;
  const season=$('#season'); if(season)season.hidden=!!v;
  const foodShown=arrange(foodGrid, foodOrder(), v);
  const barShown=bar?arrange(bar, barBase, v):0;
  if(bar)bar.hidden=!!v&&barShown===0;
  $('#nores').hidden=v?foodShown+barShown>0:foodShown>0;
}
$('#sort').addEventListener('change',filter);
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
// Cards link to the canonical /r/<slug> page so a copied or shared URL is always the plain recipe page, not /#r-<slug>.
})();
// ---- Sign-in (Google or Ethereum/SIWE) shared by Cooked it and Ask about this. The server keeps a 30-day HttpOnly session cookie that renews itself with use; signed-in state always comes from GET /api/session.
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
  f.hidden=false;   // plain /r/<slug> pages ship it hidden so the page reads fine without JavaScript
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
  f.hidden=false;   // plain /r/<slug> pages ship it hidden so the page reads fine without JavaScript
  let val=0, photo=null; const msg=$(".cmsg",f), save=$(".b2",f), say=(t,ok)=>{msg.textContent=t;msg.className="cmsg"+(ok?" ok":"")};
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));
  async function loadUsed(){
    const box=$(".used",f); if(!box||box.dataset.loaded)return;
    try{
      const h={}; const tk=tok(); if(tk)h.authorization="Bearer "+tk;
      const r=await fetch("/api/inventory?slug="+encodeURIComponent(f.dataset.slug),{credentials:"same-origin",headers:h});
      if(!r.ok)return;
      const j=await r.json(); box.dataset.loaded="1";
      if(!j.items||!j.items.length)return;
      box.hidden=false;
      box.innerHTML='<p class=usedlab>Used up from the inventory?</p><p class=usedsub>Checked items look used up. Uncheck anything you still have, or check anything you finished.</p>'
        +j.items.map(it=>`<label><input type=checkbox value="${esc(it.name)}"${it.suggested?" checked":""}><span>${esc(it.name)}<span class=why>${esc(it.reason||"")}</span></span></label>`).join("");
    }catch(e){}
  }
  $$(".rate button",f).forEach(b=>b.addEventListener("click",()=>{const n=+b.dataset.v;val=val===n?n-.5:n;if(val<1)val=n;stars(f,val);save.disabled=false;getCfg();loadUsed()}));
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
    const used=[...f.querySelectorAll(".used input[type=checkbox]")];
    const payload={slug:f.dataset.slug,rating:val,note:$("textarea",f).value,photo,siwe:siwe||undefined};
    if(used.length) payload.remove=used.filter(x=>x.checked).map(x=>x.value);
    const r=await fetch("/api/cook",{method:"POST",credentials:"same-origin",headers:h,
      body:JSON.stringify(payload)}).catch(()=>null);
    const j=r?await r.json().catch(()=>({})):{};
    if(r&&r.status===401){sessionStorage.removeItem("gid");save.disabled=false;f.dataset.want=1;return ask()}
    if(!r||!r.ok){save.disabled=false;return say(j.error||"Couldn't save. Try again?")}
    $(".gsi",f).innerHTML="";
    const taken=(j.inventory&&j.inventory.removed||[]).filter(Boolean);
    say(`Logged for ${j.who==="anna"?"Anna":"Crews"} ✓ The page updates in a couple minutes.`+(taken.length?" Took "+taken.join(", ")+" off the inventory.":""),true);
    const art=f.closest("article"),d=art&&$(".diary",art);if(d){$(".diary-empty",d)?.remove();const row=document.createElement("div");
      row.innerHTML=`<span>today</span><div><b>${j.who}</b>: ${val}/5 ${$("textarea",f).value.replace(/[<&]/g,"")}</div>`;d.prepend(row)}
    shareAfter(j.who);
  }
  // Right after a rating: a Share to story button with the stars and note on the card (share.js draws and shares it)
  function shareAfter(who){
    $(".shrow",f)?.remove();
    const pg=document.querySelector(`button.sharebtn[data-share="${f.dataset.slug}"]`);
    const row=document.createElement("p");row.className="shrow";
    const b=document.createElement("button");b.type="button";b.className="sharebtn";b.textContent="Share to your story";
    b.dataset.share=f.dataset.slug;b.dataset.title=f.dataset.title||"";
    b.kshare={rating:val,note:$("textarea",f).value,photo:photo||(pg&&pg.dataset.photo)||"",who:who==="anna"?"Anna":"Crews",cooks:(parseInt(pg&&pg.dataset.cooks,10)||0)+1};
    const m=document.createElement("span");m.className="shmsg";m.setAttribute("role","status");
    row.append(b,m);$(".cmsg",f).after(row);
    if(window.KSHARE&&window.KSHARE.wire)window.KSHARE.wire(b);else b.hidden=true;
  }
  async function ask(){
    const ok=await window.KAUTH.signIn($(".gsi",f),say);
    if(ok===false)save.disabled=false;
  }
  window.KAUTH.onSignedIn.push(()=>{loadUsed().then(()=>{if(!f.dataset.want)return; delete f.dataset.want; const box=$(".used",f); if(box&&!box.hidden&&box.querySelector("input")){save.disabled=false; return say("Check what you used up, then tap Log it.");} send();});});
  f.addEventListener("submit",async e=>{e.preventDefault();if(!val)return say("Pick some stars first.");if(await window.KAUTH.signedIn())return send();f.dataset.want=1;ask()});
});
})();
