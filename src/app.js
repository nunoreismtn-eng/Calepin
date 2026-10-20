/* ===================== APP ===================== */
const IN_VIEWER = !!(window.claude && typeof window.claude.use === "function");
const PUBLIC = typeof BUILD!=="undefined" && !!BUILD.public;
const DEFAULTS = (typeof BUILD!=="undefined" && BUILD.defaults) || {};   // name/company for the private builds (private.json, never in the public site)
const APP_URL = (typeof BUILD!=="undefined" && BUILD.appUrl) || "";
const IS_MOBILE = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || (navigator.platform==="MacIntel" && navigator.maxTouchPoints>1);
const IS_ANDROID = /Android/i.test(navigator.userAgent);
const FAST = (()=>{ const m=/[?&]fast=([\d.]+)/.exec(location.search); return m ? clamp(parseFloat(m[1])||1, 0.005, 1) : 1; })();   // test runs only: scales pauses
function micPolicyAllows(){
  try{ const p=document.permissionsPolicy||document.featurePolicy; if(p && typeof p.allowsFeature==="function") return !!p.allowsFeature("microphone"); }catch(e){}
  return !IN_VIEWER;
}
const MIC_OK = !!SpeechRec && micPolicyAllows();
const TABS = ["hoje","licoes","frases","progresso"];
const TAB_META = { hoje:["Hoje","today"], licoes:["Lições","slabs"], frases:["Frases","quote"], progresso:["Progresso","chart"] };
const $ = (s,r=document)=>r.querySelector(s), $$ = (s,r=document)=>Array.from(r.querySelectorAll(s));
const h = escHtml;
const pad2 = n => String(n).padStart(2,"0");
const LESSON_BY_ID = {}; LESSONS.forEach(L=>{ LESSON_BY_ID[L.id]=L; });
const MOD_BY_ID = {}; MODULES.forEach(M=>{ MOD_BY_ID[M.id]=M; });
const WHO = { A:"Elle", N:"Vous", C:"Lui" };
const N_ITEMS = Object.keys(ITEM_BY_ID).length, N_TERMS = GLOSSARY.reduce((a,g)=>a+g.items.length,0);
const fold = t => String(t||"").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/[’']/g," ");

const ICONS = {
  today:'<path d="M3 18.5h18M6.5 18.5a5.5 5.5 0 0 1 11 0M12 5v3M5.2 8.2l2 2M18.8 8.2l-2 2"/>',
  slabs:'<path d="M3.5 8 12 4.5 20.5 8 12 11.5z"/><path d="m3.5 12 8.5 3.5 8.5-3.5M3.5 16l8.5 3.5 8.5-3.5"/>',
  quote:'<path d="M11 7.5 7 12l4 4.5M17.5 7.5l-4 4.5 4 4.5"/>',
  chart:'<path d="M3 20.5h18M6.5 17v-5M11.5 17V6M16.5 17v-8"/>',
  sliders:'<path d="M4 6h9M17 6h3M4 12h3M11 12h9M4 18h11M19 18h1"/><circle cx="15" cy="6" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="17" cy="18" r="2"/>',
  play:'<path d="M8 5.6v12.8a.6.6 0 0 0 .9.5l10-6.4a.6.6 0 0 0 0-1L8.9 5.1a.6.6 0 0 0-.9.5z"/>',
  pause:'<rect x="6.5" y="5" width="3.6" height="14" rx="1"/><rect x="13.9" y="5" width="3.6" height="14" rx="1"/>',
  back:'<path d="M4.6 12a7.4 7.4 0 1 0 2.2-5.2M4.6 4.6v4.3h4.3"/>',
  skip:'<path d="M19.4 12a7.4 7.4 0 1 1-2.2-5.2M19.4 4.6v4.3h-4.3"/>',
  volume:'<path d="M4 9.5h3.4L12 6v12l-4.6-3.5H4z"/><path d="M15.5 9.5a3.6 3.6 0 0 1 0 5M18.2 7a7.2 7.2 0 0 1 0 10"/>',
  mic:'<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21M8.5 21h7"/>',
  x:'<path d="M6 6l12 12M18 6 6 18"/>',
  check:'<path d="m5 12.5 4.5 4.5L19 7.5"/>',
  chevR:'<path d="m9.5 6 6 6-6 6"/>',
  info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
  warn:'<path d="M12 4.2 2.9 19.5h18.2z"/><path d="M12 10v4.4M12 17h.01"/>',
  download:'<path d="M12 4v11M7.5 10.5 12 15l4.5-4.5M4 15v4a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-4"/>',
  upload:'<path d="M12 15V4M7.5 8.5 12 4l4.5 4.5M4 15v4a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-4"/>',
  trash:'<path d="M4 7h16M9 7V4h6v3M6.5 7l1 13h9l1-13"/>',
  search:'<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.2-4.2"/>',
  repeat:'<path d="M17 3.5l3 3-3 3M4 11.5V10a3.5 3.5 0 0 1 3.5-3.5H20M7 20.5l-3-3 3-3M20 12.5V14a3.5 3.5 0 0 1-3.5 3.5H4"/>',
  flame:'<path d="M12 3c.8 3.2 5 5.4 5 10a5 5 0 0 1-10 0c0-2.4 1.3-3.9 2.4-5 .3 1.5 1.1 2.6 2.4 3C10.8 8 12 5.5 12 3z"/>',
  clock:'<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  ear:'<path d="M4.5 15.5V12a7.5 7.5 0 0 1 15 0v3.5"/><rect x="3.5" y="13.5" width="4.5" height="6.5" rx="1.6"/><rect x="16" y="13.5" width="4.5" height="6.5" rx="1.6"/>'
};
function ic(n, cls){ return `<svg class="ic ${cls||""}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[n]||""}</svg>`; }
// the mark: guillemets drawn as the arrows of a dimension line
const BRAND_SVG = '<svg viewBox="0 0 32 32" aria-hidden="true" class="mark"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9.5v13M29 9.5v13" stroke="#62B0A4" stroke-width="1.6"/><path d="M9.6 13l-3 3 3 3M13.6 13l-3 3 3 3M22.4 13l3 3-3 3M18.4 13l3 3-3 3" stroke="currentColor" stroke-width="2.1"/></g></svg>';

/* ---------- Local storage ---------- */
const LS = {
  get(k,d){ try{ const v=localStorage.getItem("calepin:"+k); return v==null?d:JSON.parse(v); }catch(e){ return d; } },
  set(k,v){ try{ localStorage.setItem("calepin:"+k, JSON.stringify(v)); return true; }catch(e){ return false; } },
  del(k){ try{ localStorage.removeItem("calepin:"+k); }catch(e){} }
};

/* ---------- State ---------- */
const SET_DEF = { name:"", company:"", rate:0.92, pause:1.3, showFr:true, showPt:true, theme:"auto", voices:{ A:"auto", N:"auto", C:"auto", P:"auto" }, onboarded:false };
function mergeSettings(o){
  o=o||{};
  const s=Object.assign({}, SET_DEF, { name:DEFAULTS.name||"", company:DEFAULTS.company||"" }, o);
  s.voices=Object.assign({}, SET_DEF.voices, o.voices||{});
  if(![0.8,0.92,1].includes(s.rate)) s.rate=0.92;
  if(![1,1.3,1.6].includes(s.pause)) s.pause=1.3;
  if(!["auto","light","dark"].includes(s.theme)) s.theme="auto";
  return s;
}
function mergeProg(o){ o=o||{}; return { lessons:o.lessons&&typeof o.lessons==="object"?o.lessons:{}, srs:o.srs&&typeof o.srs==="object"?o.srs:{}, days:o.days&&typeof o.days==="object"?o.days:{}, history:Array.isArray(o.history)?o.history:[], resume:o.resume||null }; }
const S = {
  tab: TABS.includes(LS.get("tab","hoje")) ? LS.get("tab","hoje") : "hoje",
  settings: mergeSettings(LS.get("settings", null)),
  prog: mergeProg(LS.get("progress", null)),
  seg: LS.get("seg","frases")==="glossario" ? "glossario" : "frases",
  q:"", open: LS.get("open", {})
};
function saveSettings(){ LS.set("settings", S.settings); syncPersona(); }
function saveProg(){ LS.set("progress", S.prog); }
function syncPersona(){
  Persona.name=(S.settings.name||"").trim(); Persona.company=(S.settings.company||"").trim();
  Voice.prefs=Object.assign({}, S.settings.voices); Voice.assign();
}
function applyTheme(){
  const t=S.settings.theme, r=document.documentElement;
  if(t==="auto") r.removeAttribute("data-theme"); else r.setAttribute("data-theme", t);
}
const today = () => dayKey();
function addPractice(sec){ if(sec<=0) return; const k=today(); S.prog.days[k]=(S.prog.days[k]||0)+Math.round(sec); }
function addHistory(e){ S.prog.history.unshift(e); if(S.prog.history.length>300) S.prog.history.length=300; }
function nextLesson(){
  const p=S.prog.lessons;
  return LESSONS.find(L=>p[L.id] && p[L.id].ok===false) || LESSONS.find(L=>!p[L.id]) || null;
}
function lessonScript(L){ return buildLesson(L, { first:L.n===1, pause:S.settings.pause, rate:S.settings.rate, narrator:narratorVoiceOn(), prev:prevForLesson(L, S.prog.srs, today(), today()), seed:today() }); }
function stats(){
  const p=S.prog, t=today();
  const ids=Object.keys(p.srs).filter(id=>ITEM_BY_ID[id]);
  return {
    done: LESSONS.filter(L=>p.lessons[L.id]).length,
    learned: ids.length, known: ids.filter(id=>p.srs[id].b>=3).length,
    secs: Object.values(p.days).reduce((a,b)=>a+(+b||0),0),
    streak: streak(p.days, t), due: srsDue(p.srs, t).length
  };
}
const dueCount = () => srsDue(S.prog.srs, today()).length;
function relDay(k){ const d=daysBetween(today(), k); return d===0 ? "hoje" : d===1 ? "amanhã" : d===-1 ? "ontem" : (d>1 && d<7) ? `daqui a ${d} dias` : `dia ${ptShort(k)}`; }
function phaseLabel(ph){ const p=PHASES.find(x=>x.id===ph); return p ? p.pt : "Início"; }

/* ---------- Small UI pieces ---------- */
let toastT=null;
function toast(m){ const t=$("#toast"); t.textContent=m; t.hidden=false; clearTimeout(toastT); toastT=setTimeout(()=>{ t.hidden=true; }, 3200); }
function cote(label, cls){ return `<div class="cote ${cls||""}" aria-hidden="true"><i></i><span>${h(label)}</span><i></i></div>`; }
function whoChip(w){ return `<span class="who w-${w}">${WHO[w]||""}</span>`; }
const setBtn = () => `<button class="icon-btn only-m" data-act="settings" aria-label="Definições">${ic("sliders")}</button>`;
function brandBlock(){ return `<span class="brand-mark">${BRAND_SVG}</span><span class="brand-txt"><b>Calepin</b><small lang="fr">Le français de la pierre</small></span>`; }

/* ---------- Stone swatches (drawn, never photos) ---------- */
let _sid=0;
function stoneSVG(key, w, h, seed){
  const st=STONES[key]||STONES.carrara, r=seeded(hashStr(key+"#"+(seed||0))), id="sv"+(++_sid), f=v=>v.toFixed(1);
  const marble = key==="carrara" || key==="quartzite" || key==="nero", q = key==="quartzite", nb = key==="nero";
  if(marble){ h=Math.max(60, Math.round(400*h/w)); w=400; }   // one scale for every size: small swatches show finer stone
  let defs="", body=`<rect width="${w}" height="${h}" fill="${st.base}"/>`;
  const cloud=(freq, color, op)=>{
    defs+=`<filter id="${id}c" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="${freq}" numOctaves="4" seed="${Math.floor(r()*90)}"/><feColorMatrix values="0 0 0 0 ${color[0]} 0 0 0 0 ${color[1]} 0 0 0 0 ${color[2]} 1.6 0 0 0 -0.7"/></filter>`;
    body+=`<rect width="${w}" height="${h}" filter="url(#${id}c)" opacity="${op}"/>`;
  };
  if(key==="granit"){
    const cols=["#1E2123","#2C3032","#8A8F92","#C4C8CA","#6A7073","#E3E5E6"];
    const tile=(sz, n, pid)=>{ let t=""; for(let i=0;i<n;i++) t+=`<circle cx="${f(r()*sz)}" cy="${f(r()*sz)}" r="${f(0.35+r()*r()*1.5)}" fill="${cols[Math.floor(r()*cols.length)]}" opacity="${f(0.45+r()*0.5)}"/>`; defs+=`<pattern id="${id}${pid}" width="${sz}" height="${sz}" patternUnits="userSpaceOnUse">${t}</pattern>`; body+=`<rect width="${w}" height="${h}" fill="url(#${id}${pid})"/>`; };
    tile(61, 46, "a"); tile(47, 30, "b");
    cloud("0.02 0.03", [0.85,0.87,0.88], 0.22);
  } else if(key==="travertin"){
    cloud("0.004 0.05", [0.62,0.5,0.32], 0.35);
    for(let i=0;i<11;i++){ const y=h*(i+r())/11, dy=()=>f(y+(r()-0.5)*7); body+=`<path d="M-10 ${f(y)} C${f(w*0.3)} ${dy()} ${f(w*0.7)} ${dy()} ${w+10} ${dy()}" fill="none" stroke="${r()<0.5?"#F0E6D2":"#B39A6E"}" stroke-width="${f(0.8+r()*5)}" opacity="${f(0.15+r()*0.3)}"/>`; }
    for(let i=0;i<Math.round(w*h/1300);i++) body+=`<ellipse cx="${f(r()*w)}" cy="${f(r()*h)}" rx="${f(0.7+r()*2.6)}" ry="${f(0.3+r()*0.8)}" fill="#8A7049" opacity="${f(0.25+r()*0.3)}"/>`;
  } else {
    // veins: gentle curves across the slab, torn into natural shapes by a displacement map
    const S=Math.max(w,h), ang=(q?-28:-14)+(r()-0.5)*(q?16:20), sn=Math.floor(r()*500);
    cloud(q?"0.004 0.02":"0.008 0.012", q?[0.42,0.5,0.46]:nb?[0.3,0.32,0.33]:[0.52,0.55,0.57], q?0.55:nb?0.5:0.45);
    let lines="", halo="";
    for(let i=0;i<(q?7:nb?8:6);i++){
      const y=h/2+(r()-0.5)*h*1.6, d=`M${f(w/2-S)} ${f(y)} C${f(w/2-S/3)} ${f(y+(r()-0.5)*h*0.6)} ${f(w/2+S/3)} ${f(y+(r()-0.5)*h*0.6)} ${f(w/2+S)} ${f(y+(r()-0.5)*h*0.4)}`;
      const major=i<2, wd=major ? (q?3.5:1.6)+r()*(q?3:1.2) : (q?0.8:0.45)+r()*(q?1.2:0.6);
      lines+=`<path d="${d}" stroke="${q&&major?"#F5F8F6":st.vein}" stroke-width="${f(wd)}" opacity="${f(major?(nb?0.92:0.75):(nb?0.45:0.35)+r()*0.3)}"/>`;
      if(major) halo+=`<path d="${d}" stroke="${q?"#F4F7F5":st.vein}" stroke-width="${f(wd*7)}" opacity="${q?0.35:nb?0.07:0.12}"/>`;
    }
    const disp=sd=>`<feTurbulence type="fractalNoise" baseFrequency="${q?"0.006 0.014":"0.008 0.007"}" numOctaves="3" seed="${sn}" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="${q?60:50}" xChannelSelector="R" yChannelSelector="G" result="d"/><feGaussianBlur in="d" stdDeviation="${sd}"/>`;
    defs+=`<filter id="${id}d" x="-30%" y="-30%" width="160%" height="160%">${disp(0.45)}</filter><filter id="${id}h" x="-30%" y="-30%" width="160%" height="160%">${disp(6)}</filter>`;
    body+=`<g transform="rotate(${f(ang)} ${w/2} ${h/2})" fill="none" stroke-linecap="round"><g filter="url(#${id}h)">${halo}</g><g filter="url(#${id}d)">${lines}</g></g>`;
  }
  return `<svg class="stone s-${key}" viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false"><defs>${defs}</defs>${body}</svg>`;
}

/* ---------- Speaking (shared by the players and the lists) ---------- */
const SOFT_ERR = new Set(["interrupted","canceled","not-allowed"]);
const NARR = { failed:false };
const narratorVoiceOn = () => Voice.narratorOn && !NARR.failed;
async function sayFr(text, who, slow, alive){
  const v=Voice.pick[who]||Voice.pick.N||null;
  const o={ voice:v, lang:"fr-FR", rate:S.settings.rate*(slow?0.78:1), pitch:Voice.pitch[who]||1 };
  let r=await Voice.speak(frSpeech(text), o);
  if(alive() && !r.ok && v && !SOFT_ERR.has(r.err)) r=await Voice.speak(frSpeech(text), Object.assign({}, o, { voice:null }));   // the system's default French
  return r;
}
async function sayPt(text, alive){
  const v=Voice.pick.P;
  let r=await Voice.speak(text, { voice:v, lang:"pt-PT", rate:1, pitch:1 });
  if(!alive() || r.ok || SOFT_ERR.has(r.err)) return r;
  if(v){ r=await Voice.speak(text, { voice:null, lang:"pt-PT", rate:1, pitch:1 }); if(!alive() || r.ok || SOFT_ERR.has(r.err)) return r; }
  NARR.failed=true; toast("A voz portuguesa não respondeu. O professor passa a aparecer em texto.");
  return r;
}
// a narrator line: Portuguese, with the «French» quotations in the French voice
async function sayLine(text, alive){
  for(const p of speechParts(text)){
    if(!alive()) return { ok:false, err:"interrupted" };
    const r = p.lang==="fr" ? await sayFr(p.text, "N", false, alive) : await sayPt(p.text, alive);
    if(!alive()) return r;
    if(r.err==="not-allowed") return r;
    if(p.lang==="pt" && NARR.failed) return { ok:false, err:"narrator" };
  }
  return { ok:true };
}
function refText(ref){
  const p=String(ref||"").split(":");
  if(p[0]==="i"){ const it=ITEM_BY_ID[p[1]+":"+p[2]]; return it ? { text:it.fr, who:"N" } : null; }
  if(p[0]==="g"){ const g=GLOSSARY[+p[1]], t=g && g.items[+p[2]]; return t ? { text:t[0], who:"A" } : null; }
  if(p[0]==="d"){ const L=LESSON_BY_ID[p[1]], d=L && L.dialogue[+p[2]]; return d ? { text:d[1], who:d[0] } : null; }
  return null;
}
const Tap = {
  btn:null, gen:0,
  async play(ref, slow, btn){
    const t=refText(ref); if(!t) return;
    if(P.playing) P.pause();
    const g=++this.gen; Voice.stop(); this.mark(btn); await sleep(50);
    if(g!==this.gen) return;
    const r=await sayFr(t.text, t.who, slow, ()=>g===this.gen);
    if(g!==this.gen) return;
    this.mark(null);
    if(!r.ok && !SOFT_ERR.has(r.err)) toast(soundTrouble());
  },
  mark(btn){ if(this.btn) this.btn.classList.remove("playing"); this.btn=btn||null; if(btn) btn.classList.add("playing"); },
  stop(){ this.gen++; this.mark(null); }
};
function soundTrouble(){
  if(!Voice.ok) return "Este browser não tem voz sintetizada. Abre a app no Chrome.";
  if(Voice.frStatus==="missing") return "Falta a voz francesa neste aparelho. Vê como instalar nas Definições.";
  return "O som não arrancou. Confirma o volume e as vozes nas Definições.";
}
function micErrText(err){
  return err==="not-allowed"||err==="service-not-allowed" ? "Sem acesso ao microfone. Autoriza-o nas definições do browser."
    : err==="no-speech"||err==="timeout" ? "Não ouvi nada. Tenta outra vez, com o telemóvel mais perto."
    : err==="network" ? "O reconhecimento de voz precisa de rede."
    : err==="audio-capture" ? "O microfone está ocupado ou indisponível."
    : "O reconhecimento de voz não está disponível aqui.";
}
function heardHtml(s){
  const [lab,cls]=scoreLabel(s.score);
  return `<span class="sc ${cls}">${Math.round(s.score*100)}% · ${lab}</span>`
    + (s.missing && s.missing.length ? `<span class="miss">Faltou: ${s.missing.slice(0,4).map(w=>`<i lang="fr">${h(w)}</i>`).join(", ")}</span>` : "")
    + (s.heard ? `<span class="heard">Ouvi: <i lang="fr">${h(s.heard)}</i></span>` : "");
}
async function checkPhrase(ref, btn){
  if(!MIC_OK) return;
  const t=refText(ref); if(!t) return;
  const row=btn.closest("[data-row]"), out=row && row.querySelector(".fres");
  Tap.stop(); Voice.stop(); if(P.playing) P.pause();
  btn.classList.add("rec"); btn.disabled=true;
  if(out){ out.hidden=false; out.innerHTML=`<span class="listening">A ouvir. Diz a frase em francês.</span>`; }
  const r=await listenFr(9000);
  btn.classList.remove("rec"); btn.disabled=false;
  if(!out) return;
  out.innerHTML = r.ok ? heardHtml(bestScore(fill(t.text), r.alts)) : `<span class="miss">${h(micErrText(r.err))}</span>`;
}

/* ---------- Render ---------- */
let raf0=0;
function schedule(){ if(raf0) return; raf0=requestAnimationFrame(()=>{ raf0=0; render(); }); }
function render(){
  renderNav();
  const v=$("#view");
  v.innerHTML = S.tab==="licoes" ? viewLicoes() : S.tab==="frases" ? viewFrases() : S.tab==="progresso" ? viewProgresso() : viewHoje();
  if(S.tab==="frases") renderList();
}
function goTab(t){ if(!TABS.includes(t)) return; S.tab=t; LS.set("tab",t); window.scrollTo(0,0); render(); Nav.later(); }
function renderNav(){
  const due=dueCount();
  const btn=(t,cls)=>{ const [label,icon]=TAB_META[t], on=S.tab===t; return `<button class="${cls}${on?" on":""}" role="tab" aria-selected="${on}" data-act="tab" data-tab="${t}">${ic(icon)}<span>${label}</span>${t==="hoje"&&due?`<i class="badge" aria-label="${due} frases para rever">${due}</i>`:""}</button>`; };
  $("#tabbar").innerHTML=TABS.map(t=>btn(t,"tab")).join("");
  $("#rail-tabs").innerHTML=TABS.map(t=>btn(t,"rtab")).join("");
}
function voiceNotice(where){
  const out=[];
  if(IN_VIEWER && APP_URL) out.push(["info", "No telemóvel, usa a app instalável", `Abre o link no Chrome do Android e escolhe <b>Instalar app</b>: fica com ícone, ecrã inteiro e as vozes do telemóvel.`, `<a class="btn sm ghost" href="${h(APP_URL)}" target="_blank" rel="noopener">Abrir a app ↗</a>`]);
  if(!Voice.ok) out.push(["warn", "Este browser não fala", "A app precisa de voz sintetizada. No Android, abre-a no Chrome.", ""]);
  else if(Voice.loaded && Voice.frStatus==="missing") out.push(["warn", "Falta a voz francesa", androidVoiceSteps("Francês (França)"), ""]);
  else if(Voice.loaded && Voice.all.length && !Voice.pick.P && S.settings.voices.P!=="off" && where!=="hoje-min") out.push(["info", "O professor aparece em texto", `Não encontrei uma voz portuguesa neste aparelho. ${androidVoiceSteps("Português (Portugal)")}`, ""]);
  return out.map(([k,t,p,a])=>`<section class="notice n-${k}">${ic(k==="warn"?"warn":"info")}<div><b>${h(t)}</b><p>${p}</p>${a?`<div class="notice-a">${a}</div>`:""}</div></section>`).join("");
}
function androidVoiceSteps(lang){
  return IS_ANDROID || !IS_MOBILE
    ? `No Android: Definições → procura “texto para voz” → Serviços de voz da Google → Instalar dados de voz → <b>${h(lang)}</b>.`
    : `Instala a voz <b>${h(lang)}</b> nas definições de acessibilidade do sistema.`;
}

/* ---------- Hoje ---------- */
function viewHoje(){
  const name=(S.settings.name||"").trim(), hr=new Date().getHours(), L=nextLesson();
  return `
  <header class="page-head hoje-head">
    <div class="m-brand only-m">${brandBlock()}</div>
    <div class="head-btns">${installBtn()}${setBtn()}</div>
  </header>
  <section class="hello">
    <h1 class="display" lang="fr">${hr<18?"Bonjour":"Bonsoir"}${name?", "+h(name):""}.</h1>
    <p class="fr-date" lang="fr">${h(frDate())}</p>
  </section>
  ${installCard()}
  ${voiceNotice("hoje")}
  ${heroCard(L)}
  <div class="duo">${reviewCard()}${phraseOfDay()}</div>
  ${courseMini()}`;
}
function heroCard(L){
  if(!L){
    return `<article class="hero hero-done"><div class="hero-stone">${stoneSVG("quartzite", 640, 200, 99)}<span class="hero-num">16</span></div><div class="hero-body"><p class="eyebrow">Curso concluído</p><h2 class="fr-title" lang="fr">Félicitations.</h2><p class="pt-sub">Fizeste as 16 lições.</p><p class="hero-sit">Agora, a revisão diária mantém as frases vivas. Repete as lições onde ainda hesitas, de preferência antes de uma reunião em francês.</p><div class="hero-actions"><button class="btn primary lg" data-act="tab" data-tab="licoes">${ic("slabs")} Ver as lições</button></div></div></article>`;
  }
  const M=MOD_BY_ID[L.m], res=S.prog.resume && S.prog.resume.id===L.id ? S.prog.resume : null, rec=S.prog.lessons[L.id];
  const sc=lessonScript(L), mins=Math.max(1, Math.round(sc.total/60));
  const eyebrow = rec && rec.ok===false ? "Para repetir hoje" : res ? `Em curso · ${phaseLabel(res.ph)}` : !Object.keys(S.prog.lessons).length ? "A tua primeira lição" : "Próxima lição";
  return `<article class="hero">
    <div class="hero-stone">${stoneSVG(M.stone, 640, 200, L.n)}<span class="hero-mod">Module ${M.n} · <span lang="fr">${h(M.fr)}</span></span><span class="hero-num">${pad2(L.n)}</span></div>
    <div class="hero-body">
      <p class="eyebrow">${h(eyebrow)}</p>
      <h2 class="fr-title" lang="fr">${frHtml(L.fr)}</h2>
      <p class="pt-sub">${h(L.pt)}</p>
      <p class="hero-sit">${ptHtml(L.situation)}</p>
      ${cote(`${mins} min`)}
      <ul class="facts"><li><b>${L.items.length}</b><span>frases novas</span></li><li><b>${sc.spoken}</b><span>respostas em voz alta</span></li><li><b>${L.roles.length}</b><span>trocas de conversa</span></li></ul>
      ${res?`<div class="resume"><span style="width:${clamp(res.pct||0,2,100)}%"></span></div>`:""}
      <div class="hero-actions">
        <button class="btn primary lg" data-act="play-lesson" data-id="${L.id}">${ic("play","fill")} ${res?"Continuar":"Começar a lição"}</button>
        ${res?`<button class="btn ghost" data-act="restart-lesson" data-id="${L.id}">Recomeçar</button>`:`<button class="btn ghost" data-act="lesson" data-id="${L.id}">Guião</button>`}
      </div>
    </div>
  </article>`;
}
function reviewCard(){
  const t=today(), due=srsDue(S.prog.srs, t).length, nx=srsNext(S.prog.srs, t), any=Object.keys(S.prog.srs).length;
  if(!any) return `<section class="card rv"><p class="eyebrow" lang="fr">Révision</p><h3>A revisão começa amanhã</h3><p class="muted">Depois de cada lição, as frases voltam aqui no dia certo: um dia depois, três, uma semana, duas, um mês.</p></section>`;
  if(due) return `<section class="card rv hot"><p class="eyebrow" lang="fr">Révision du jour</p><h3>${due} ${due===1?"frase":"frases"} para rever</h3><p class="muted">Cerca de ${Math.max(1,Math.round(due*14/60))} min. Ouves o português, respondes em voz alta e dizes se sabias.</p><button class="btn primary" data-act="review">${ic("repeat")} Rever agora</button></section>`;
  return `<section class="card rv"><p class="eyebrow" lang="fr">Révision</p><h3>Nada para rever hoje</h3><p class="muted">${nx?`Próxima revisão ${h(relDay(nx.day))}: ${nx.n} ${nx.n===1?"frase":"frases"}.`:""} Se te apetecer, treina dez frases ao acaso.</p><button class="btn ghost" data-act="practice">${ic("repeat")} Treino livre</button></section>`;
}
function phraseOfDay(){
  const learned=Object.keys(S.prog.srs).filter(id=>ITEM_BY_ID[id]);
  const pool=(learned.length ? learned.map(id=>ITEM_BY_ID[id]) : lessonItems(nextLesson()||LESSONS[0])).filter(it=>it.fr.split(" ").length>=3);
  const it=pool[hashStr(today())%pool.length];
  if(!it) return "";
  const ref="i:"+it.id;
  return `<section class="card pod" data-row><p class="eyebrow" lang="fr">Phrase du jour</p><p class="pod-fr" lang="fr">${frHtml(it.fr)}</p><p class="pod-pt">${ptHtml(it.pt)}</p>
    <div class="pbtns">${playBtns(ref)}</div><div class="fres" hidden></div></section>`;
}
function playBtns(ref){
  return `<button class="pbtn" data-act="say" data-ref="${ref}" aria-label="Ouvir">${ic("volume")}</button><button class="pbtn txt" data-act="say-slow" data-ref="${ref}" aria-label="Ouvir devagar" lang="fr">lent</button>${MIC_OK?`<button class="pbtn" data-act="check" data-ref="${ref}" aria-label="Verificar a pronúncia">${ic("mic")}</button>`:""}`;
}
function courseMini(){
  return `<section class="course"><div class="sec-head"><h2 class="sec-title" lang="fr">Le parcours</h2><button class="linkbtn" data-act="tab" data-tab="licoes">Todas as lições ${ic("chevR")}</button></div>
  <div class="cm">${MODULES.map(M=>{ const ls=LESSONS.filter(L=>L.m===M.id), done=ls.filter(L=>S.prog.lessons[L.id]).length;
    return `<button class="cm-row" data-act="tab" data-tab="licoes"><span class="sw">${stoneSVG(M.stone, 80, 80, M.n)}</span><span class="cm-t"><b lang="fr">${h(M.fr)}</b><small>${h(M.pt)}</small></span><span class="cm-steps" aria-label="${done} de ${ls.length} lições">${ls.map(L=>`<i class="${S.prog.lessons[L.id]?"on":""}"></i>`).join("")}</span></button>`; }).join("")}</div></section>`;
}
let installEvt=null, INSTALLED=false;
const STANDALONE = (()=>{ try{ return matchMedia("(display-mode: standalone)").matches || navigator.standalone===true; }catch(e){ return false; } })();
// Install help on the phone: the browser's own prompt when it offers one, otherwise the steps for this browser
const IS_IOS = /iPhone|iPad|iPod/i.test(navigator.userAgent) || (navigator.platform==="MacIntel" && navigator.maxTouchPoints>1);
const IN_APP_BROWSER = /; wv\)|FBAN|FBAV|Instagram|Line\/|LinkedInApp|Snapchat|TikTok/i.test(navigator.userAgent);
const canInstallHere = () => !IN_VIEWER && !STANDALONE && !INSTALLED && IS_MOBILE;
function installSteps(){
  return IN_APP_BROWSER
    ? `Abriste o link dentro de outra app, e aí não dá para instalar. Toca nos <b>⋮</b> e escolhe <b>Abrir no ${IS_IOS?"Safari":"Chrome"}</b>; depois instala a partir daí.`
    : IS_IOS ? `No Safari, toca em <b>Partilhar</b> e depois em <b>Adicionar ao ecrã principal</b>.`
    : /SamsungBrowser/i.test(navigator.userAgent) ? `Toca no menu <b>≡</b> e escolhe <b>Adicionar página a</b> → <b>Ecrã principal</b>.`
    : `No Chrome, toca nos <b>⋮</b> no canto superior direito e escolhe <b>Instalar app</b> ou <b>Adicionar ao ecrã principal</b>. Se só vires <b>Abrir no Chrome</b>, toca primeiro aí.`;
}
function installCard(){
  if(!canInstallHere() || Date.now() < Number(LS.get("install-later",0)||0)) return "";
  const later=`<button class="btn sm ghost" data-act="install-later">Agora não</button>`;
  if(installEvt) return `<section class="notice n-info">${ic("download")}<div><b>Instala a app no telemóvel</b><p>Fica com ícone no ecrã principal, abre em ecrã inteiro e funciona sem rede.</p><div class="notice-a"><button class="btn sm primary" data-act="install">Instalar</button>${later}</div></div></section>`;
  return `<section class="notice n-info">${ic("download")}<div><b>Instala a app no telemóvel</b><p>${installSteps()}</p><div class="notice-a">${later}</div></div></section>`;
}
// stays in the header even after "Agora não" or a cancelled install
function installBtn(){ return canInstallHere() ? `<button class="icon-btn" data-act="install-help" aria-label="Instalar a app">${ic("download")}</button>` : ""; }
function installHelpHtml(){
  return `<p class="ls-sit">${installSteps()}</p>
    ${installEvt?`<div class="row-btns" style="margin-top:14px"><button class="btn primary" data-act="install">${ic("download")} Instalar agora</button></div>`:""}
    <p class="hint">Se carregaste sem querer em <b>Cancelar</b> ou <b>Não instalar</b>, não faz mal: o menu <b>⋮</b> do Chrome continua a ter <b>Instalar app</b>, e este botão fica sempre aqui no topo.</p>
    <p class="hint">Depois de instalada, abre o Calepin pelo ícone no ecrã principal: fica em ecrã inteiro e funciona sem rede.</p>`;
}
function openInstallHelp(){ Sheet.open("Instalar a app", installHelpHtml(), { kind:"install" }); }
async function promptInstall(){
  const ev=installEvt; if(!ev){ openInstallHelp(); return; }
  installEvt=null;
  try{ await ev.prompt(); const c=ev.userChoice ? await ev.userChoice : null; if(c && c.outcome==="accepted") INSTALLED=true; }catch(e){}
  if(Sheet.kind==="install") Sheet.set(installHelpHtml());
  schedule();
}
// already installed? (Chrome on Android answers this for the app's own manifest)
try{ if(navigator.getInstalledRelatedApps && !STANDALONE) navigator.getInstalledRelatedApps().then(list=>{ if(list && list.length){ INSTALLED=true; schedule(); } }).catch(()=>{}); }catch(e){}

/* ---------- Lições ---------- */
function lessonStatus(L, nx){
  const rec=S.prog.lessons[L.id], res=S.prog.resume && S.prog.resume.id===L.id;
  if(rec && rec.ok===false) return ["Repetir","redo"];
  if(res) return ["Em curso","next"];
  if(rec) return [`Feita${rec.n>1?` ${rec.n}×`:""}`,"done"];
  if(nx && nx.id===L.id) return ["Seguinte","next"];
  return ["",""];
}
function viewLicoes(){
  const nx=nextLesson();
  return `<header class="page-head"><div><p class="eyebrow">16 lições · 4 módulos · 15 min cada</p><h1 class="display" lang="fr">Leçons</h1></div>${setBtn()}</header>
  ${MODULES.map(M=>{
    const ls=LESSONS.filter(L=>L.m===M.id);
    return `<section class="mod"><div class="mod-banner ${M.stone==="granit"?"dark":""}">${stoneSVG(M.stone, 760, 150, M.n*7)}<div class="mb-txt"><span class="mb-num">Module ${M.n}</span><span class="mb-fr" lang="fr">${h(M.fr)}</span><span class="mb-pt">${h(M.pt)} · ${h(M.blurb)}</span></div></div>
      <div class="lrows">${ls.map(L=>{ const [lab,cls]=lessonStatus(L,nx); return `<button class="lrow" data-act="lesson" data-id="${L.id}"><span class="lnum">${pad2(L.n)}</span><span class="ltxt"><b lang="fr">${frHtml(L.fr)}</b><small>${h(L.pt)}</small></span>${lab?`<span class="lstat ${cls}">${cls==="done"?ic("check"):""}${h(lab)}</span>`:"<span></span>"}${ic("chevR","chev")}</button>`; }).join("")}</div></section>`;
  }).join("")}
  ${roastSection()}`;
}
function phraseRow(it){
  const sr=S.prog.srs[it.id], ref="i:"+it.id;
  return `<div class="frow" data-row><div class="ftx"><p class="fr" lang="fr">${frHtml(it.fr)}</p><p class="pt">${ptHtml(it.pt)}</p>${sr?`<span class="box" title="${sr.b>=3?"Na memória":"A consolidar"} · caixa ${sr.b} de 5" aria-label="Caixa ${sr.b} de 5">${[1,2,3,4,5].map(k=>`<i class="${k<=sr.b?"on":""}"></i>`).join("")}</span>`:""}</div><div class="pbtns">${playBtns(ref)}</div><div class="fres" hidden></div></div>`;
}
function openLesson(id){
  const L=LESSON_BY_ID[id]; if(!L) return;
  const M=MOD_BY_ID[L.m], sc=lessonScript(L), res=S.prog.resume && S.prog.resume.id===L.id ? S.prog.resume : null, rec=S.prog.lessons[L.id];
  Sheet.open(`Leçon ${L.n}`, `
    <div class="ls-head ${M.stone==="granit"?"dark":""}">${stoneSVG(M.stone, 640, 140, L.n+40)}<div class="ls-ht"><span class="mb-num">Module ${M.n} · <span lang="fr">${h(M.fr)}</span></span><h3 class="fr-title" lang="fr">${frHtml(L.fr)}</h3><span class="mb-pt">${h(L.pt)}</span></div></div>
    <p class="ls-sit">${ptHtml(L.situation)}</p>
    ${cote(`${Math.max(1,Math.round(sc.total/60))} min · ${sc.spoken} respostas em voz alta`)}
    <div class="ls-actions"><button class="btn primary" data-act="play-lesson" data-id="${L.id}">${ic("play","fill")} ${res?"Continuar":rec?"Fazer outra vez":"Começar a lição"}</button><button class="btn ghost" data-act="play-dialogue" data-id="${L.id}">${ic("ear")} Só o diálogo</button></div>
    ${res?`<p class="hint">Ficaste em ${h(phaseLabel(res.ph))}. <button class="linkbtn" data-act="restart-lesson" data-id="${L.id}">Recomeçar do início</button></p>`:rec?`<p class="hint">Feita ${rec.n}× · a última ${h(relDay(rec.last))}${rec.ok===false?" · marcada para repetir":""}.</p>`:""}
    <h4 class="ls-h" lang="fr">Dialogue</h4>
    <div class="ls-dlg">${L.dialogue.map((d,j)=>`<div class="dl" data-row>${whoChip(d[0])}<div class="dl-t"><p class="fr" lang="fr">${frHtml(d[1])}</p><p class="pt">${ptHtml(d[2])}</p></div><button class="pbtn" data-act="say" data-ref="d:${L.id}:${j}" aria-label="Ouvir">${ic("volume")}</button></div>`).join("")}</div>
    <h4 class="ls-h"><span lang="fr">Phrases</span> <small>${L.items.length}</small></h4>
    <div class="flist">${lessonItems(L).map(phraseRow).join("")}</div>
    <h4 class="ls-h" lang="fr">Notes</h4>
    ${L.notes.map(n=>`<p class="ls-note">${ptHtml(n)}</p>`).join("")}`, { kind:"lesson" });
}

/* ---------- Frases ---------- */
function viewFrases(){
  return `<header class="page-head"><div><p class="eyebrow">${N_ITEMS} frases · ${N_TERMS} termos técnicos</p><h1 class="display" lang="fr">Phrases</h1></div>${setBtn()}</header>
  <div class="tools">
    <div class="seg" role="tablist" aria-label="Ver">${[["frases","Frases das lições"],["glossario","Glossário técnico"]].map(([k,l])=>`<button role="tab" aria-selected="${S.seg===k}" class="${S.seg===k?"on":""}" data-act="seg" data-v="${k}">${l}</button>`).join("")}</div>
    <label class="search">${ic("search")}<input id="q" type="search" enterkeyhint="search" placeholder="${S.seg==="frases"?"Procurar em francês ou português":"Procurar termo: chant, tranche, devis…"}" value="${h(S.q)}" autocomplete="off" spellcheck="false" aria-label="Procurar"></label>
  </div>
  <div id="flist-host"></div>`;
}
function renderList(){
  const host=$("#flist-host"); if(!host) return;
  const q=fold(S.q).trim(), match=(...t)=>!q || t.some(x=>fold(x).includes(q));
  let html="";
  if(S.seg==="frases"){
    LESSONS.forEach(L=>{
      const its=lessonItems(L).filter(it=>match(fill(it.fr), fill(it.pt)));
      if(!its.length) return;
      const open = q ? true : S.open[L.id]!=null ? S.open[L.id] : L.n===1;
      const learned=its.filter(it=>S.prog.srs[it.id]).length;
      html+=`<details class="grp" data-g="${L.id}"${open?" open":""}><summary><span class="lnum">${pad2(L.n)}</span><span class="ltxt"><b lang="fr">${frHtml(L.fr)}</b><small>${h(L.pt)} · ${its.length} ${its.length===1?"frase":"frases"}${learned?` · ${learned} aprendidas`:""}</small></span>${ic("chevR","chev")}</summary><div class="flist">${its.map(phraseRow).join("")}</div></details>`;
    });
  } else {
    GLOSSARY.forEach((g,c)=>{
      const its=g.items.map((t,k)=>[t,k]).filter(([t])=>match(t[0], t[1]));
      if(!its.length) return;
      const key="g"+c, open = q ? true : S.open[key]!=null ? S.open[key] : c===0;
      html+=`<details class="grp" data-g="${key}"${open?" open":""}><summary><span class="ltxt"><b lang="fr">${h(g.cat)}</b><small>${h(g.pt)} · ${its.length}</small></span>${ic("chevR","chev")}</summary><div class="glist">${its.map(([t,k])=>`<div class="grow" data-row><span class="g-fr" lang="fr">${frHtml(t[0])}${t[2]?` <em class="g-gen">${t[2]==="f"?"fém.":"masc."}</em>`:""}</span><span class="g-pt">${h(t[1])}</span><button class="pbtn" data-act="say" data-ref="g:${c}:${k}" aria-label="Ouvir">${ic("volume")}</button></div>`).join("")}</div></details>`;
    });
  }
  host.innerHTML = html || `<div class="empty"><p>Nada encontrado para “${h(S.q)}”.</p><button class="btn ghost sm" data-act="clear-q">Limpar a pesquisa</button></div>`;
}

/* ---------- Progresso ---------- */
const HM_BINS=[0,5,10,20,30];   // minutes per day
function hmLevel(min){ if(!min) return 0; let l=1; HM_BINS.forEach((b,i)=>{ if(i>0 && min>b) l=i+1; }); return Math.min(5,l); }
function viewProgresso(){
  const st=stats(), p=S.prog;
  const head=`<header class="page-head"><div><p class="eyebrow">O teu ritmo</p><h1 class="display" lang="fr">Progrès</h1></div>${setBtn()}</header>`;
  if(!st.secs && !st.done) return head+`<div class="empty big"><div class="empty-stone">${stoneSVG("travertin", 300, 120, 5)}</div><h3>Ainda não há progresso</h3><p>Depois da primeira lição, vês aqui o tempo de prática, as frases que já tens na memória e os dias seguidos.</p><button class="btn primary" data-act="play-next">${ic("play","fill")} Começar a lição 1</button></div>`;
  const tiles=[
    ["Lições concluídas", `${st.done}`, `de ${LESSONS.length}`],
    ["Frases na memória", `${st.known}`, `${st.learned} aprendidas`],
    ["Tempo de prática", fmtDur(st.secs), "a falar e a ouvir"],
    ["Dias seguidos", `${st.streak}`, st.streak ? (p.days[today()] ? "contando hoje" : "treina hoje para manter") : "começa hoje"]
  ];
  return head+`
  <section class="tiles">${tiles.map(([l,v,s])=>`<div class="tile"><span class="t-l">${h(l)}</span><span class="t-v">${h(v)}</span><span class="t-s">${h(s)}</span></div>`).join("")}</section>
  ${heatmap()}
  ${mastery()}
  ${historyList()}`;
}
function heatmap(){
  const t=today(), now=keyDate(t), wd=(now.getDay()+6)%7, start=addDays(t, -(wd+7*11));
  let cells="", months="", lastM=-1, rows=[];
  for(let w=0; w<12; w++){
    const k0=addDays(start, w*7), m=keyDate(k0).getMonth();
    months+=`<span>${m!==lastM?PT_MONTHS[m]:""}</span>`; lastM=m;
    for(let d=0; d<7; d++){
      const k=addDays(start, w*7+d), fut=k>t, sec=S.prog.days[k]||0, min=Math.round(sec/60), lv=fut?-1:hmLevel(sec?Math.max(1,min):0);
      const tip=`${["seg","ter","qua","qui","sex","sáb","dom"][d]} ${ptShort(k)} · ${sec?fmtDur(sec):"sem prática"}`;
      cells+= fut ? `<span class="c fut"></span>` : `<span class="c l${lv}${k===t?" today":""}" data-tip="${h(tip)}"${sec?' tabindex="0"':""} role="img" aria-label="${h(tip)}"></span>`;
      if(sec) rows.push([k, sec]);
    }
  }
  return `<section class="card chart-card"><div class="sec-head"><h2 class="sec-title">Dias de prática</h2><span class="muted sm">últimas 12 semanas</span></div>
    <div class="hm-wrap"><div class="hm-days" aria-hidden="true"><span>seg</span><span></span><span>qua</span><span></span><span>sex</span><span></span><span></span></div><div class="hm-main"><div class="hm-months" aria-hidden="true">${months}</div><div class="hm">${cells}</div></div></div>
    <div class="hm-foot"><span class="hm-scale" aria-label="Escala: menos para mais minutos">menos ${[1,2,3,4,5].map(l=>`<i class="c l${l}"></i>`).join("")} mais</span>
    <details class="tview"><summary>Ver em tabela</summary>${rows.length?`<table><thead><tr><th>Dia</th><th>Prática</th></tr></thead><tbody>${rows.reverse().map(([k,s])=>`<tr><td>${h(ptShort(k))}</td><td>${h(fmtDur(s))}</td></tr>`).join("")}</tbody></table>`:`<p class="muted sm">Sem prática neste período.</p>`}</details></div>
  </section>`;
}
function mastery(){
  const rows=MODULES.map(M=>{
    const ids=LESSONS.filter(L=>L.m===M.id).flatMap(L=>lessonItems(L).map(i=>i.id)), n=ids.length;
    const known=ids.filter(id=>(S.prog.srs[id]||{}).b>=3).length, learned=ids.filter(id=>S.prog.srs[id]).length;
    const done=LESSONS.filter(L=>L.m===M.id && S.prog.lessons[L.id]).length;
    const tip=`${M.pt}: ${known} na memória, ${learned} aprendidas, de ${n} frases`;
    return `<div class="mrow" tabindex="0" data-tip="${h(tip)}"><span class="mr-name"><span class="sw sm">${stoneSVG(M.stone, 40, 40, M.n)}</span><span><b lang="fr">${h(M.fr)}</b><small>${done}/4 lições</small></span></span><span class="mr-bar" role="img" aria-label="${h(tip)}"><i class="lr" style="width:${(100*learned/n).toFixed(1)}%"></i><i class="kn" style="width:${(100*known/n).toFixed(1)}%"></i></span><span class="mr-val">${known}<small>/${n}</small></span></div>`;
  }).join("");
  return `<section class="card chart-card"><div class="sec-head"><h2 class="sec-title">Frases por módulo</h2></div>
    <div class="legend"><span><i class="k-kn"></i>Na memória · revistas com sucesso pelo menos duas vezes</span><span><i class="k-lr"></i>Aprendidas</span></div>
    ${rows}</section>`;
}
function historyList(){
  const list=S.prog.history.slice(0,14);
  if(!list.length) return "";
  const label=e=>{ const L=LESSON_BY_ID[e.id];
    if(e.k==="lesson" && L) return `Lição ${pad2(L.n)} · <span lang="fr">${frHtml(L.fr)}</span>`;
    if(e.k==="dialogue" && L) return `Diálogo da lição ${pad2(L.n)}`;
    if(e.k==="review") return `Revisão · ${e.n} ${e.n===1?"frase":"frases"}${e.ok!=null?`, ${e.ok} sabidas`:""}`;
    if(e.k==="practice") return `Treino livre · ${e.n} frases`;
    if(e.k==="roast"){ const x=roSet(e.set); return `<span lang="fr">Madame Colette</span>${x?` · <span lang="fr">${h(x.fr)}</span>`:""} · ${e.note}/20`; }
    return "Prática"; };
  return `<section class="card"><div class="sec-head"><h2 class="sec-title">Histórico</h2></div><ul class="hist">${list.map(e=>`<li><span class="h-d">${h(relDayShort(dayKey(e.d)))}</span><span class="h-t">${label(e)}</span><span class="h-m">${h(fmtDur(e.sec||0))}</span></li>`).join("")}</ul></section>`;
}
function relDayShort(k){ const d=daysBetween(k, today()); return d===0?"Hoje":d===1?"Ontem":ptShort(k); }

/* ---------- Overlay host (lesson player, review, welcome) ---------- */
const Ov = {
  kind:null,
  show(kind, html){ this.kind=kind; const o=$("#ov"); o.className="ov ov-"+kind; o.innerHTML=html; o.hidden=false; o.scrollTop=0; document.body.classList.add("locked"); Nav.later(); },
  hide(){ const o=$("#ov"); o.hidden=true; o.innerHTML=""; this.kind=null; document.body.classList.remove("locked"); Nav.later(); }
};
const DIAL = {
  prof:["Professeur","O professor"], read:["Lisez","Lê"], listen:["Écoutez","Ouve"], answer:["À vous","Responde"],
  repeat:["Répétez","Repete"], paused:["Pause","Em pausa"], done:["Terminé","Concluído"], grade:["Alors ?","Como correu?"], mic:["Je vous écoute","A ouvir-te"]
};
function dialHtml(stone, seed){
  return `<div class="dial" id="dial" data-state="paused"><div class="d-stone">${stoneSVG(stone, 200, 200, seed)}</div><span class="d-pulse"></span><svg viewBox="0 0 200 200" aria-hidden="true"><circle class="d-track" cx="100" cy="100" r="94"/><circle class="d-arc" id="d-arc" cx="100" cy="100" r="94" pathLength="100"/></svg><div class="d-label" aria-live="polite"><b id="d-fr" lang="fr"></b><small id="d-pt"></small></div></div>`;
}
function setDial(state, ms){
  const d=$("#dial"); if(!d) return;
  d.dataset.state=state;
  const [fr,pt]=DIAL[state]||["",""]; $("#d-fr").textContent=fr; $("#d-pt").textContent=pt;
  const arc=$("#d-arc"); arc.classList.remove("count");
  if(ms){ arc.style.setProperty("--d", Math.round(ms)+"ms"); void arc.getBoundingClientRect(); arc.classList.add("count"); }
}

/* ---------- Lesson player ---------- */
const P = {
  mode:null, L:null, sc:null, i:0, gen:0, playing:false, finished:false,
  cancels:new Set(), waitFin:null, curU:null, unitT0:0, pausedAt:0,
  lastFr:null, card:null, revealed:false, part:null, fails:0,
  t0:0, active:0, flushed:0, prevIds:[], seed:"",
  ctx(L, prev){ return { first:L.n===1, pause:S.settings.pause, rate:S.settings.rate, narrator:narratorVoiceOn(), prev, seed:this.seed }; },
  open(L, o){
    o=o||{};
    if(R.open) R.close(true);
    if(Sheet.isOpen) Sheet.close(true);
    Tap.stop(); Voice.stop();
    this.mode=o.dialogue?"dialogue":"lesson"; this.L=L; this.finished=false; this.fails=0;
    const res=!o.dialogue && !o.restart && S.prog.resume && S.prog.resume.id===L.id ? S.prog.resume : null;
    if(o.restart && S.prog.resume && S.prog.resume.id===L.id){ S.prog.resume=null; saveProg(); }
    this.seed=(res && res.seed) || today();
    const prev = o.dialogue ? [] : (res && Array.isArray(res.prev) ? res.prev.map(id=>ITEM_BY_ID[id]).filter(Boolean) : prevForLesson(L, S.prog.srs, today(), this.seed));
    this.prevIds=prev.map(p=>p.id);
    this.sc = o.dialogue ? buildDialogue(L, this.ctx(L,[])) : buildLesson(L, this.ctx(L, prev));
    this.i = res ? clamp(res.i|0, 0, this.sc.steps.length-1) : 0;
    this.curU=null; this.lastFr=null; this.card=null; this.active=0; this.flushed=0; this.pausedAt=0; this.playing=false;
    Ov.show("player", this.html());
    this.preview(this.i);
    Wake.hold("player");
    this.play();
  },
  rebuild(){
    if(!this.sc || this.mode!=="lesson") { if(this.sc && this.mode==="dialogue") this.sc=buildDialogue(this.L, this.ctx(this.L,[])); this.paintProgress(); return; }
    const prev=this.prevIds.map(id=>ITEM_BY_ID[id]).filter(Boolean);
    this.sc=buildLesson(this.L, this.ctx(this.L, prev));
    this.paintProgress();
  },
  html(){
    const L=this.L, M=MOD_BY_ID[L.m], lesson=this.mode==="lesson";
    return `<div class="pl" role="dialog" aria-modal="true" aria-label="Lição ${L.n}">
      <header class="pl-top">
        <button class="icon-btn" data-act="pl-close" aria-label="Fechar">${ic("x")}</button>
        <div class="pl-title"><span>${lesson?`Leçon ${pad2(L.n)}`:`Dialogue · leçon ${pad2(L.n)}`}</span><b lang="fr">${frHtml(L.fr)}</b></div>
        <button class="icon-btn" data-act="pl-pop" aria-label="Ritmo e texto" aria-expanded="false">${ic("sliders")}</button>
      </header>
      <div class="pl-pop" id="pl-pop" hidden>${this.popHtml()}</div>
      <div class="pl-prog"><div class="pl-track"><i id="pl-fill"></i></div><span id="pl-left"></span></div>
      ${lesson?`<ol class="pl-phases" id="pl-phases">${this.sc.phases.map(p=>{ const x=PHASES.find(y=>y.id===p); return `<li data-p="${p}"><span lang="fr">${x.fr}</span></li>`; }).join("")}</ol>`:""}
      <div class="pl-stage" id="pl-stage">
        ${dialHtml(M.stone, L.n)}
        <p class="pl-cue" id="pl-cue" aria-live="polite"></p>
        <div class="pl-card" id="pl-card"></div>
        <p class="pl-warn" id="pl-warn" hidden></p>
      </div>
      <footer class="pl-ctl" id="pl-ctl">
        <div class="pl-main">
          <button class="cbtn" data-act="pl-back" aria-label="Voltar">${ic("back")}<small>Voltar</small></button>
          <button class="cbtn big" data-act="pl-toggle" id="pl-toggle" aria-label="Pausa">${ic("pause","fill")}</button>
          <button class="cbtn" data-act="pl-skip" aria-label="Saltar">${ic("skip")}<small>Saltar</small></button>
        </div>
        <div class="pl-sub"><button class="chip-btn" id="pl-done" data-act="pl-done" disabled>Já respondi</button><button class="chip-btn" data-act="pl-replay" id="pl-replay" disabled>${ic("volume")} Ouvir de novo</button></div>
      </footer>
    </div>`;
  },
  popHtml(){
    const s=S.settings, seg=(k,opts)=>`<div class="seg sm" role="radiogroup">${opts.map(([v,l])=>`<button role="radio" aria-checked="${s[k]===v}" class="${s[k]===v?"on":""}" data-act="set" data-k="${k}" data-v="${v}">${l}</button>`).join("")}</div>`;
    return `<p class="set-l">Velocidade do francês</p>${seg("rate",[[0.8,"Calma"],[0.92,"Normal"],[1,"Nativa"]])}
      <p class="set-l">Tempo para responderes</p>${seg("pause",[[1,"Curto"],[1.3,"Médio"],[1.6,"Longo"]])}
      <label class="tog"><input type="checkbox" data-k="showFr"${s.showFr?" checked":""}><span>Mostrar o francês escrito</span></label>
      <label class="tog"><input type="checkbox" data-k="showPt"${s.showPt?" checked":""}><span>Tradução no diálogo</span></label>`;
  },
  play(){
    if(this.playing || this.finished || !this.sc) return;
    if(this.pausedAt && performance.now()-this.pausedAt>8000){ const st=this.sc.steps[this.i]; if(st) this.i=this.sc.starts[st.u]; }
    this.pausedAt=0; this.playing=true; this.t0=performance.now(); this.paintCtl(); this.run();
  },
  async run(){
    const g=++this.gen;
    if(Voice.busy()){ Voice.stop(); await sleep(90); if(g!==this.gen) return; }
    while(this.i<this.sc.steps.length){
      const st=this.sc.steps[this.i];
      if(st.u!==this.curU){ this.curU=st.u; this.unitT0=performance.now(); this.saveResume(); }
      this.paintProgress();
      await this.exec(st, g);
      if(g!==this.gen) return;
      this.i++;
    }
    this.complete();
  },
  async exec(st, g){
    const alive=()=>g===this.gen;
    if(st.t==="phase"){ this.paintPhase(st.p); return; }
    if(st.t==="gap") return this.delay(st.sec*1000*FAST, g);
    if(st.t==="pt"){
      if(st.card) this.setCard(st.card);
      this.cue(st.cue || st.task ? st.text : "", st.task);
      if(!narratorVoiceOn()){ if(st.cue) return; setDial("read"); return this.delay(readSec(st.text)*1000*FAST, g); }
      setDial("prof");
      const r=await sayLine(st.text, alive);
      if(!alive()) return;
      if(r.err==="not-allowed") return this.blocked();
      if(!r.ok && !st.cue && !narratorVoiceOn()){ setDial("read"); return this.delay(readSec(st.text)*1000*FAST, g); }
      return;
    }
    if(st.t==="fr"){
      if(st.card) this.setCard(st.card);
      if(st.part) this.showPart(st.part); else if(st.reveal) this.reveal();
      if(!st.card || st.card.kind!=="role") this.cue("");
      setDial("listen");
      this.lastFr={ text:st.text, who:st.who, slow:!!st.slow }; this.paintCtl();
      const r=await sayFr(st.text, st.who, st.slow, alive);
      if(!alive()) return;
      if(r.err==="not-allowed") return this.blocked();
      if(!r.ok && !SOFT_ERR.has(r.err)){ this.fails++; if(this.fails>=2) this.warn(soundTrouble()); return this.delay(readSec(st.text)*700*FAST, g); }
      this.fails=0; this.warn("");
      return;
    }
    if(st.t==="wait") return this.wait(st, g);
  },
  blocked(){ this.pause(); toast("Toca em ▶ para o som começar."); },
  delay(ms, g){
    return new Promise(res=>{ let t=0; const fin=()=>{ clearTimeout(t); this.cancels.delete(fin); res(); }; this.cancels.add(fin); t=setTimeout(fin, Math.max(0,ms)); });
  },
  wait(st, g){
    const ms=st.sec*1000*FAST;
    setDial(st.k==="repeat" ? "repeat" : "answer", ms);
    this.setDone(st.k);
    return new Promise(res=>{ let t=0; const fin=()=>{ clearTimeout(t); this.cancels.delete(fin); if(this.waitFin===fin) this.waitFin=null; this.setDone(null); res(); }; this.cancels.add(fin); this.waitFin=fin; t=setTimeout(fin, ms); });
  },
  halt(){
    this.gen++;
    [...this.cancels].forEach(f=>f()); this.cancels.clear(); this.waitFin=null;
    Voice.stop();
    if(this.playing){ this.active+=performance.now()-this.t0; this.playing=false; }
  },
  pause(){ if(!this.playing) return; this.halt(); this.pausedAt=performance.now(); setDial("paused"); this.paintCtl(); this.flushTime(); this.saveResume(); },
  toggle(){ if(this.finished) return; this.playing ? this.pause() : this.play(); },
  jump(to){
    const was=this.playing; this.halt(); this.pausedAt=0;
    this.i=clamp(to, 0, this.sc.steps.length); this.curU=null;
    if(this.i>=this.sc.steps.length){ this.complete(); return; }
    this.preview(this.i);
    if(was) this.play(); else { setDial("paused"); this.paintCtl(); }
  },
  back(){
    const st=this.sc.steps[Math.min(this.i, this.sc.steps.length-1)], s0=this.sc.starts[st.u];
    const into=performance.now()-this.unitT0;
    this.jump(this.i>s0 && (into>1500 || !this.playing) ? s0 : (this.sc.starts[st.u-1] ?? 0));
  },
  skip(){ const st=this.sc.steps[Math.min(this.i, this.sc.steps.length-1)], nx=this.sc.starts[st.u+1]; this.jump(nx==null ? this.sc.steps.length : nx); },
  doneWait(){ if(this.waitFin) this.waitFin(); },
  async replay(){
    if(!this.lastFr || this.finished) return;
    const was=this.playing; this.halt(); const g=++this.gen;
    setDial("listen"); await sleep(70); if(g!==this.gen) return;
    await sayFr(this.lastFr.text, this.lastFr.who, this.lastFr.slow, ()=>g===this.gen);
    if(g!==this.gen) return;
    if(was){ this.pausedAt=0; this.play(); } else setDial("paused");
  },
  // show the first card of the block at i (when jumping or resuming, before it plays)
  preview(i){
    const st=this.sc.steps[i]; if(!st) return;
    this.paintPhase(st.ph); this.paintProgress();
    for(let k=i; k<this.sc.steps.length && this.sc.steps[k].u===st.u; k++){ if(this.sc.steps[k].card){ this.setCard(this.sc.steps[k].card); break; } }
    this.cue("");
  },
  saveResume(){
    if(this.mode!=="lesson" || this.finished || !this.sc) return;
    const st=this.sc.steps[Math.min(this.i, this.sc.steps.length-1)], i0=this.sc.starts[st.u];
    if(this.sc.acc[i0]<20 && !(S.prog.resume && S.prog.resume.id===this.L.id)) return;
    S.prog.resume={ id:this.L.id, i:i0, prev:this.prevIds, seed:this.seed, ph:st.ph, at:Date.now(), pct:Math.round(100*this.sc.acc[i0]/this.sc.total) };
    saveProg();
  },
  flushTime(){
    let a=this.active; if(this.playing) a+=performance.now()-this.t0;
    const d=Math.floor((a-this.flushed)/1000);
    if(d>0){ addPractice(d); this.flushed+=d*1000; saveProg(); }
  },
  complete(){
    this.halt(); this.finished=true; this.flushTime(); Wake.drop("player");
    const L=this.L, t=today();
    if(this.mode==="lesson"){
      const rec=S.prog.lessons[L.id]||{ n:0, first:t };
      rec.n=(rec.n||0)+1; rec.last=t; rec.ok=null; S.prog.lessons[L.id]=rec;
      srsAddLesson(S.prog.srs, L, t);
      if(S.prog.resume && S.prog.resume.id===L.id) S.prog.resume=null;
    }
    addHistory({ d:Date.now(), k:this.mode==="lesson"?"lesson":"dialogue", id:L.id, sec:Math.round(this.active/1000) });
    saveProg(); buzz(30);
    this.paintDone();
  },
  close(){
    if(Ov.kind!=="player") return;
    const finished=this.finished;
    this.halt(); this.flushTime();
    if(this.mode==="lesson" && !finished) this.saveResume();
    Wake.drop("player"); Ov.hide();
    const kept=this.mode==="lesson" && !finished && S.prog.resume && S.prog.resume.id===this.L.id;
    this.mode=null; this.sc=null;
    if(kept) toast("Lição em pausa. Continuas onde ficaste.");
    render();
  },
  rate(ok){
    const rec=S.prog.lessons[this.L.id]; if(!rec) return;
    rec.ok=!!ok; saveProg();
    $$(".done-q .seg button").forEach(b=>{ const on=b.dataset.ok===(ok?"1":"0"); b.classList.toggle("on", on); b.setAttribute("aria-checked", on); });
    const nx=nextLesson();
    $("#done-msg").textContent = ok ? (nx ? `Ótimo. Amanhã: lição ${nx.n}, ${nx.pt}.` : "Curso concluído. Mantém a revisão diária.") : "Sem problema: repete esta lição amanhã. É assim que o método funciona.";
    this.paintNextBtn();
  },
  paintNextBtn(){
    const b=$("#done-next"); if(!b) return;
    const nx=nextLesson();
    if(!nx){ b.hidden=true; return; }
    b.hidden=false; b.dataset.id=nx.id;
    b.innerHTML = nx.id===this.L.id ? `${ic("repeat")} Repetir agora` : `Lição ${nx.n} ${ic("chevR")}`;
  },
  /* painting */
  setCard(c){ this.card=c; this.revealed=false; this.part=null; this.paintCard(); },
  reveal(){ this.revealed=true; this.part=null; this.paintCard(); },
  showPart(p){ this.part=p; this.paintCard(); },
  cue(text, task){ const el=$("#pl-cue"); if(!el) return; el.textContent = task ? "" : (text||""); },
  warn(text){ const el=$("#pl-warn"); if(!el) return; el.hidden=!text; el.textContent=text||""; },
  setDone(k){ const b=$("#pl-done"); if(!b) return; b.disabled=!k; b.textContent = k==="repeat" ? "Já repeti" : "Já respondi"; b.classList.toggle("hot", k==="answer"||k==="role"); },
  paintCtl(){
    const t=$("#pl-toggle"); if(!t) return;
    t.innerHTML=ic(this.playing?"pause":"play","fill"); t.setAttribute("aria-label", this.playing?"Pausa":"Continuar");
    const r=$("#pl-replay"); if(r) r.disabled=!this.lastFr;
  },
  paintProgress(){
    const sc=this.sc; if(!sc) return; const k=Math.min(this.i, sc.steps.length);
    const f=sc.total ? sc.acc[k]/sc.total : 0, left=Math.max(0, sc.total-sc.acc[k]);
    const fill=$("#pl-fill"), l=$("#pl-left"); if(!fill) return;
    fill.style.width=(f*100).toFixed(1)+"%";
    l.textContent = left>=90 ? `${Math.round(left/60)} min` : `${Math.max(0,Math.round(left))} s`;
  },
  paintPhase(p){
    const order=this.sc?this.sc.phases:[], c=order.indexOf(p);
    $$("#pl-phases li").forEach(li=>{ const k=order.indexOf(li.dataset.p); li.classList.toggle("on", li.dataset.p===p); li.classList.toggle("past", c>-1 && k<c); });
  },
  paintCard(){
    const el=$("#pl-card"); if(!el) return;
    const c=this.card, sf=S.settings.showFr, L=this.L;
    if(!c){ el.innerHTML=""; return; }
    const frLine=(txt, on)=> `<p class="pc-fr${on?" on":""}" lang="fr">${on ? (sf ? frHtml(txt) : `<span class="audio-only">${ic("ear")} só áudio</span>`) : `<span class="dots" aria-label="à espera">· · ·</span>`}</p>`;
    let html="";
    if(c.kind==="title") html=`<p class="pc-label">Module ${MOD_BY_ID[L.m].n} · <span lang="fr">${h(MOD_BY_ID[L.m].fr)}</span></p><h2 class="pc-title" lang="fr">${frHtml(L.fr)}</h2><p class="pc-sub">${h(L.pt)}</p>`;
    else if(c.kind==="say") html=`<p class="pc-say">${ptHtml(c.text)}</p>`;
    else if(c.kind==="note") html=`<p class="pc-label">Note ${c.j+1}</p><p class="pc-say note">${ptHtml(c.text)}</p>`;
    else if(c.kind==="end") html=`<p class="pc-label" lang="fr">Fin</p><p class="pc-say">${ptHtml(c.text)}</p>`;
    else if(c.kind==="line"){
      html=`<div class="pc-dlg" id="pc-dlg">${L.dialogue.slice(0,c.j+1).map((d,k)=>`<div class="dl${k===c.j?" on":""}">${whoChip(d[0])}<div class="dl-t"><p class="fr" lang="fr">${sf?frHtml(d[1]):`<span class="audio-only">${ic("ear")} só áudio</span>`}</p>${S.settings.showPt?`<p class="pt">${ptHtml(d[2])}</p>`:""}</div></div>`).join("")}</div>`;
    }
    else if(c.kind==="role") html=`<div class="pc-cue">${whoChip(c.who)}<p lang="fr">${sf?frHtml(c.cue):`<span class="audio-only">${ic("ear")} só áudio</span>`}</p></div><p class="pc-label">Responde</p><p class="pc-pt">${ptHtml(c.task)}</p>${frLine(c.fr, this.revealed)}`;
    else html=`<p class="pc-label">${h(c.label)}</p><p class="pc-pt">${ptHtml(c.pt)}</p>${frLine(this.part||c.fr, this.revealed||!!this.part)}`;
    el.innerHTML=html; el.dataset.kind=c.kind;
    const dlg=$("#pc-dlg"); if(dlg) dlg.scrollTop=dlg.scrollHeight;
  },
  paintDone(){
    const L=this.L, M=MOD_BY_ID[L.m], stage=$("#pl-stage"), ctl=$("#pl-ctl");
    $("#pl-fill").style.width="100%"; $("#pl-left").textContent="";
    $$("#pl-phases li").forEach(li=>{ li.classList.remove("on"); li.classList.add("past"); });
    const mins=Math.max(1, Math.round(this.active/60000));
    if(this.mode==="dialogue"){
      stage.innerHTML=`<div class="pl-done"><div class="medal">${stoneSVG(M.stone, 160, 160, L.n)}<span>${ic("check")}</span></div><p class="eyebrow" lang="fr">Dialogue écouté</p><h2 class="fr-title" lang="fr">${frHtml(L.fr)}</h2><p class="muted">Ouve-o mais vezes até perceberes tudo sem ler.</p></div>`;
      ctl.innerHTML=`<div class="done-actions"><button class="btn ghost" data-act="pl-close">Fechar</button><button class="btn primary" data-act="play-dialogue" data-id="${L.id}">${ic("repeat")} Ouvir outra vez</button></div>`;
      return;
    }
    stage.innerHTML=`<div class="pl-done">
      <div class="medal">${stoneSVG(M.stone, 160, 160, L.n)}<span>${ic("check")}</span></div>
      <p class="eyebrow" lang="fr">Leçon ${pad2(L.n)} terminée</p>
      <h2 class="fr-title" lang="fr">${frHtml(L.fr)}</h2>
      <ul class="facts center"><li><b>${mins}</b><span>${mins===1?"minuto":"minutos"}</span></li><li><b>${L.items.length}</b><span>frases novas</span></li><li><b>${this.sc.spoken}</b><span>respostas em voz alta</span></li></ul>
      <div class="done-q"><p>Respondeste bem a pelo menos oito em cada dez?</p><div class="seg" role="radiogroup"><button role="radio" aria-checked="false" data-act="rate-lesson" data-ok="1">Sim, quase sempre</button><button role="radio" aria-checked="false" data-act="rate-lesson" data-ok="0">Ainda não</button></div><p class="done-msg" id="done-msg" aria-live="polite"></p></div>
      <p class="muted sm">As ${L.items.length} frases entram na revisão de amanhã.</p>
    </div>`;
    ctl.innerHTML=`<div class="done-actions"><button class="btn ghost" data-act="pl-close">Fechar</button><button class="btn primary" id="done-next" data-act="next-lesson"></button></div>`;
    setDial("done");
    this.paintNextBtn();
  }
};

/* ---------- Daily review (spaced repetition, interactive) ---------- */
const R = {
  open:false, ids:[], k:0, practice:false, gen:0, stage:"", res:[], cancels:new Set(), heard:null, t0:0, active:0, flushed:0, listening:false, waitFin:null,
  start(practice){
    const t=today();
    const ids = practice
      ? (()=>{ const a=Object.keys(S.prog.srs).filter(id=>ITEM_BY_ID[id]), r=seeded(Date.now()&0xffffff); for(let i=a.length-1;i>0;i--){ const j=Math.floor(r()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a.slice(0,10); })()
      : srsDue(S.prog.srs, t).slice(0,20);
    if(!ids.length){ toast(practice ? "Ainda não há frases aprendidas. Começa pela lição 1." : "Nada para rever hoje."); return; }
    if(Sheet.isOpen) Sheet.close(true);
    Tap.stop();
    this.ids=ids; this.k=0; this.res=[]; this.practice=!!practice; this.open=true; this.active=0; this.flushed=0; this.t0=performance.now();
    Ov.show("review", this.html()); Wake.hold("review"); this.item();
  },
  html(){
    return `<div class="pl rv-pl" role="dialog" aria-modal="true" aria-label="Revisão">
      <header class="pl-top"><button class="icon-btn" data-act="rv-close" aria-label="Fechar">${ic("x")}</button><div class="pl-title"><span lang="fr">${this.practice?"Entraînement libre":"Révision du jour"}</span><b id="rv-count"></b></div><span class="icon-btn ghostly"></span></header>
      <div class="pl-prog"><div class="pl-track"><i id="pl-fill"></i></div><span id="pl-left"></span></div>
      <div class="pl-stage" id="pl-stage">${dialHtml("quartzite", 3)}<div class="pl-card" id="pl-card"></div></div>
      <footer class="pl-ctl" id="pl-ctl"></footer></div>`;
  },
  cur(){ return ITEM_BY_ID[this.ids[this.k]]; },
  timeNow(){ return this.active + (this.open ? performance.now()-this.t0 : 0); },
  async item(){
    const g=++this.gen, it=this.cur(), alive=()=>g===this.gen;
    this.stage="prompt"; this.heard=null; this.paint();
    if(narratorVoiceOn()){
      setDial("prof");
      const r=await sayLine(`Como se diz ${qpt(it.pt)}${/[?!]$/.test(it.pt)?"":"?"}`, alive);
      if(!alive()) return;
      if(r.err==="not-allowed"){ this.stall(); return; }
    } else { setDial("read"); await this.delay(readSec(it.pt)*600*FAST); if(!alive()) return; }
    this.stage="answer"; this.paint();
    const ms=waitSec("answer", it.fr, S.settings.pause)*1000*FAST;
    setDial("answer", ms);
    await new Promise(res=>{ let t=0; const fin=()=>{ clearTimeout(t); this.cancels.delete(fin); if(this.waitFin===fin) this.waitFin=null; res(); }; this.cancels.add(fin); this.waitFin=fin; t=setTimeout(fin, ms); });
    if(!alive()) return;
    this.reveal(g);
  },
  delay(ms){ return new Promise(res=>{ let t=0; const fin=()=>{ clearTimeout(t); this.cancels.delete(fin); res(); }; this.cancels.add(fin); t=setTimeout(fin, ms); }); },
  stop(){ this.gen++; [...this.cancels].forEach(f=>f()); this.cancels.clear(); this.waitFin=null; Voice.stop(); if(listenFr.cur) listenFr.cur.stop(); },
  stall(){ this.stop(); this.stage="stalled"; this.paint(); setDial("paused"); toast("Toca em Continuar para o som começar."); },
  async reveal(g){
    const it=this.cur(), alive=()=>g===this.gen;
    this.stage="reveal"; this.paint(); setDial("listen");
    await sayFr(it.fr, "N", false, alive);
    if(!alive()) return;
    this.stage="grade"; this.paint(); setDial("grade");
  },
  show(){ if(this.stage==="prompt" || this.stage==="answer" || this.stage==="stalled"){ this.stop(); this.reveal(this.gen); } },
  resume(){ if(this.stage==="stalled") this.item(); },
  async replay(){ if(this.stage!=="grade" && this.stage!=="reveal") return; const g=++this.gen; Voice.stop(); await sleep(60); if(g!==this.gen) return; setDial("listen"); await sayFr(this.cur().fr, "N", false, ()=>g===this.gen); if(g===this.gen) setDial("grade"); },
  async mic(){
    if(!MIC_OK || this.listening || this.stage==="grade" || this.stage==="reveal") return;
    this.stop(); const g=this.gen; await sleep(80); if(g!==this.gen) return;
    this.stage="listen"; this.listening=true; this.paint(); setDial("mic");
    const r=await listenFr(9000); this.listening=false;
    if(g!==this.gen) return;
    this.heard = r.ok ? bestScore(fill(this.cur().fr), r.alts) : { err:r.err };
    this.reveal(g);
  },
  grade(v){
    if(this.stage!=="grade" && this.stage!=="reveal") return;
    this.stop();
    const id=this.ids[this.k]; srsGrade(S.prog.srs, id, v, today(), this.practice); this.res.push(v); saveProg();
    this.k++;
    if(this.k<this.ids.length) this.item(); else this.finish();
  },
  flushTime(){ const a=this.timeNow(), d=Math.floor((a-this.flushed)/1000); if(d>0){ addPractice(d); this.flushed+=d*1000; saveProg(); } },
  finish(){
    this.stop(); this.flushTime(); Wake.drop("review"); this.stage="done";
    const n=this.res.length, c=[0,0,0]; this.res.forEach(v=>c[v]++);
    addHistory({ d:Date.now(), k:this.practice?"practice":"review", n, ok:c[2], sec:Math.round(this.timeNow()/1000) }); saveProg();
    const nx=srsNext(S.prog.srs, today());
    $("#pl-fill").style.width="100%"; $("#pl-left").textContent=""; $("#rv-count").textContent="";
    $("#pl-stage").innerHTML=`<div class="pl-done"><div class="medal">${stoneSVG("quartzite", 160, 160, 4)}<span>${ic("check")}</span></div><p class="eyebrow" lang="fr">${this.practice?"Entraînement terminé":"Révision terminée"}</p><h2 class="fr-title">${n} ${n===1?"frase":"frases"}</h2>
      <ul class="facts center"><li><b>${c[2]}</b><span>sabia</span></li><li><b>${c[1]}</b><span>hesitei</span></li><li><b>${c[0]}</b><span>não sabia</span></li></ul>
      <p class="muted">${c[0]?`As que falhaste voltam amanhã. `:""}${nx?`Próxima revisão ${h(relDay(nx.day))}.`:""}</p></div>`;
    $("#pl-ctl").innerHTML=`<div class="done-actions"><button class="btn primary" data-act="rv-close">Concluir</button></div>`;
    setDial("done"); buzz(30);
  },
  close(silent){
    if(!this.open) return;
    if(this.stage!=="done"){ this.stop(); this.flushTime(); if(this.res.length) { addHistory({ d:Date.now(), k:this.practice?"practice":"review", n:this.res.length, ok:this.res.filter(v=>v===2).length, sec:Math.round(this.timeNow()/1000) }); saveProg(); } }
    this.open=false; Wake.drop("review");
    if(Ov.kind==="review") Ov.hide();
    if(!silent) render();
  },
  interrupt(){ if(!this.open || this.stage==="done" || this.stage==="grade") return; this.flushTime(); this.stop(); this.stage="stalled"; this.paint(); setDial("paused"); },
  paint(){
    const it=this.cur(); if(!it) return;
    const n=this.ids.length, sf=S.settings.showFr;
    $("#rv-count").textContent=`${this.k+1} de ${n}`;
    $("#pl-fill").style.width=(100*this.k/n).toFixed(1)+"%"; $("#pl-left").textContent=`${n-this.k} ${n-this.k===1?"frase":"frases"}`;
    const shown=this.stage==="reveal"||this.stage==="grade";
    const L=LESSON_BY_ID[it.lesson];
    $("#pl-card").innerHTML=`<p class="pc-label">Como se diz</p><p class="pc-pt">${ptHtml(it.pt)}</p>
      <p class="pc-fr${shown?" on":""}" lang="fr">${shown ? (sf?frHtml(it.fr):`<span class="audio-only">${ic("ear")} só áudio</span>`) : `<span class="dots">· · ·</span>`}</p>
      ${this.heard ? `<div class="fres rv-res">${this.heard.err ? `<span class="miss">${h(micErrText(this.heard.err))}</span>` : heardHtml(this.heard)}</div>` : ""}
      <p class="pc-src">Lição ${pad2(L.n)} · <span lang="fr">${frHtml(L.fr)}</span></p>`;
    const sug = this.heard && !this.heard.err ? (this.heard.score>=0.85?2:this.heard.score>=0.6?1:0) : -1;
    let ctl="";
    if(this.stage==="grade"||this.stage==="reveal") ctl=`<div class="grades" role="group" aria-label="Como correu"><button class="gbtn g0${sug===0?" sug":""}" data-act="rv-grade" data-v="0"><b>Não sabia</b><small>volta amanhã</small></button><button class="gbtn g1${sug===1?" sug":""}" data-act="rv-grade" data-v="1"><b>Hesitei</b><small>amanhã outra vez</small></button><button class="gbtn g2${sug===2?" sug":""}" data-act="rv-grade" data-v="2"><b>Sabia</b><small>${this.practice?"mantém":"mais espaçado"}</small></button></div><div class="pl-sub"><button class="chip-btn" data-act="rv-replay">${ic("volume")} Ouvir de novo</button></div>`;
    else if(this.stage==="stalled") ctl=`<div class="pl-sub"><button class="btn primary" data-act="rv-resume">${ic("play","fill")} Continuar</button><button class="chip-btn" data-act="rv-show">Mostrar a resposta</button></div>`;
    else if(this.stage==="listen") ctl=`<div class="pl-sub"><span class="listening big">${ic("mic")} A ouvir… diz a frase em francês.</span></div>`;
    else ctl=`<div class="pl-sub">${MIC_OK?`<button class="chip-btn hot" data-act="rv-mic">${ic("mic")} Responder ao microfone</button>`:""}<button class="chip-btn" data-act="rv-show">Mostrar a resposta</button></div>`;
    $("#pl-ctl").innerHTML=ctl;
  }
};

/* ---------- Bonus · Sans pitié: Madame Colette asks, you answer at the microphone, every mistake gets a remark ---------- */
Object.assign(DIAL, { cask:["Question","Ouve a pergunta"], cjudge:["Colette","A julgar-te"], cnext:["Alors ?","Outra vez ou seguinte"] });
const RO_N = 10, RO_NUM = ["I","II","III","IV"];
const roSets = () => MODULES.map(M=>({ id:M.id, num:RO_NUM[M.n-1]||String(M.n), fr:M.fr, pt:M.pt })).concat([{ id:"all", num:"I–IV", fr:"Tout mélangé", pt:"Os quatro módulos" }]);
const roSet = id => roSets().find(x=>x.id===id) || null;
function roBest(id){ let b=null; S.prog.history.forEach(e=>{ if(e.k==="roast" && e.set===id && (b==null || e.note>b)) b=e.note; }); return b; }
// whole sentences from the course (no name placeholders), phrases you have already met first
function roPool(set){ return Object.values(ITEM_BY_ID).filter(it=>(set==="all" || (LESSON_BY_ID[it.lesson]||{}).m===set) && !/[{}]/.test(it.fr) && /[.?!]\s*$/.test(it.fr) && normFr(it.fr).split(" ").length>=2); }
function roDraw(set){
  const r=seeded((Date.now() ^ hashStr(set)) & 0xffffff), mix=a=>{ for(let i=a.length-1;i>0;i--){ const j=Math.floor(r()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; };
  const pool=mix(roPool(set));
  return mix(pool.filter(it=>S.prog.srs[it.id]).concat(pool.filter(it=>!S.prog.srs[it.id])).slice(0, RO_N));
}
function roastSection(){
  return `<section class="mod roast"><div class="mod-banner dark">${stoneSVG("nero", 760, 150, 9)}<div class="mb-txt"><span class="mb-num">Bonus · Madame Colette · +18</span><span class="mb-fr" lang="fr">Sans pitié</span><span class="mb-pt">Ela pergunta, tu respondes ao microfone, e cada erro leva um insulto. Meio em francês, meio em português, sem filtro nenhum.</span></div></div>
    <div class="lrows">${roSets().map(x=>{ const b=roBest(x.id); return `<button class="lrow" data-act="roast" data-id="${x.id}"><span class="lnum">${x.num}</span><span class="ltxt"><b lang="fr">${h(x.fr)}</b><small>${h(x.pt)}</small></span>${b!=null?`<span class="lstat ${b>=14?"done":b>=10?"next":"redo"}">${b}/20</span>`:"<span></span>"}${ic("chevR","chev")}</button>`; }).join("")}</div></section>`;
}
// her lines mix both languages: [Portuguese] in brackets, the rest French
function roMix(t){ return String(t).split(/\[([^\]]*)\]/).map((p,k)=> k%2 ? `<span class="ro-pt" lang="pt-PT">${h(p)}</span>` : h(frTypo(p))).join(""); }
const roSpeech = t => String(t).replace(/[\[\]]/g,"");
function coletteSays(line, cls){
  return `<figure class="ro-say${cls?" "+cls:""}"><span class="ro-av" aria-hidden="true"><i>${stoneSVG("nero", 80, 80, 3)}</i><b>C</b></span><div class="ro-bubble"><blockquote lang="fr">${roMix(line[0])}</blockquote><figcaption>${ptHtml(line[1])}</figcaption></div></figure>`;
}
// one line of words, the wrong ones wrapped in a tag; French spacing before ? ! : ;
function roLine(toks, tag){ return toks.map((x,k)=>(k ? (/^[?!:;»]/.test(x.w) ? " " : " ") : "") + (x.bad ? `<${tag}>${h(frTypo(x.w))}</${tag}>` : h(frTypo(x.w)))).join(""); }
const RO_RING = '<svg class="ro-ring" viewBox="0 0 200 130" aria-hidden="true"><path pathLength="100" d="M62 24C100 6 170 12 182 52c12 40-42 68-86 66C50 116 14 96 18 62 22 32 70 14 120 16c20 1 36 6 48 14" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round"/></svg>';
const Roast = {
  open:false, set:null, items:[], k:0, stage:"", gen:0, cancels:new Set(), att:[], verdict:null, line:null, aside:null, used:new Set(), noMic:false, rnd:Math.random, t0:0, active:0, flushed:0, listening:false,
  get typed(){ return !MIC_OK || this.noMic; },
  start(set){
    if(!roSet(set) || !roPool(set).length) return;
    if(Sheet.isOpen) Sheet.close(true);
    Tap.stop(); Voice.stop();
    this.set=set; this.items=roDraw(set); this.k=0; this.att=this.items.map(()=>[]); this.verdict=null; this.aside=null; this.used=new Set();
    this.rnd=seeded(Date.now() & 0xffffff); this.open=true; this.listening=false; this.active=0; this.flushed=0; this.t0=performance.now();
    Ov.show("roast", this.html()); Wake.hold("roast");
    this.intro();
  },
  html(){
    const x=roSet(this.set);
    return `<div class="pl ro-pl" role="dialog" aria-modal="true" aria-label="Madame Colette">
      <header class="pl-top"><button class="icon-btn" data-act="ro-close" aria-label="Fechar">${ic("x")}</button><div class="pl-title"><span>Sans pitié · ${h(x.fr)}</span><b lang="fr">Madame Colette</b></div><span class="icon-btn ghostly"></span></header>
      <div class="pl-prog"><div class="pl-track"><i id="pl-fill"></i></div><span id="pl-left"></span></div>
      <div class="pl-stage ro-stage" id="pl-stage">${dialHtml("nero", 5)}<div class="pl-card ro-card" id="pl-card"></div></div>
      <footer class="pl-ctl" id="pl-ctl"></footer></div>`;
  },
  it(){ return this.items[this.k]; },
  question(){ const it=this.it(); return `Como se diz ${qpt(it.pt)}${/[?!]$/.test(it.pt)?"":"?"}`; },
  timeNow(){ return this.active + (this.open ? performance.now()-this.t0 : 0); },
  delay(ms){ return new Promise(res=>{ let t=0; const fin=()=>{ clearTimeout(t); this.cancels.delete(fin); res(); }; this.cancels.add(fin); t=setTimeout(fin, ms); }); },
  stop(){ this.gen++; [...this.cancels].forEach(f=>f()); this.cancels.clear(); Voice.stop(); if(listenFr.cur) listenFr.cur.stop(); },
  pick(kind){
    let a=(COLETTE.lines[kind]||COLETTE.lines.bad).filter(l=>!l[2] || l[2]===(this.typed?"t":"s"));
    const f=a.filter(l=>!this.used.has(l[0])); if(f.length) a=f;
    const l=a[Math.floor(this.rnd()*a.length)]; this.used.add(l[0]); return l;
  },
  async say(text, g){
    const mark=on=>{ const el=$(".ro-say"); if(el) el.classList.toggle("talk", on); };
    mark(true); const r=await sayFr(roSpeech(text), "A", false, ()=>g===this.gen); if(g===this.gen) mark(false);   // the Portuguese bits too, with her French accent
    return r;
  },
  async intro(){
    const g=++this.gen, st=Object.assign({}, LS.get("colette", null)||{});
    this.line = st.met ? COLETTE.hello[Math.floor(this.rnd()*COLETTE.hello.length)] : COLETTE.intro;
    if(!st.met){ st.met=true; LS.set("colette", st); }
    this.stage="intro"; this.paint(); setDial("cjudge");
    await this.say(this.line[0], g); if(g!==this.gen) return;
    await this.delay(400*FAST); if(g!==this.gen) return;
    this.ask();
  },
  go(){ if(this.stage==="intro"){ this.stop(); this.ask(); } },
  async ask(){
    const g=++this.gen, alive=()=>g===this.gen, n=this.items.length;
    this.verdict=null; this.listening=false;
    this.aside = n>4 && this.k===Math.floor(n/2) ? COLETTE.mid : n>1 && this.k===n-1 ? COLETTE.last : null;
    this.stage="ask"; this.paint();
    if(this.typed && !IS_MOBILE) setTimeout(()=>{ const i=$("#ro-in"); if(i) i.focus(); }, 30);
    if(this.aside){ setDial("cjudge"); await this.say(this.aside[0], g); if(!alive()) return; }
    if(narratorVoiceOn()){ setDial("cask"); await sayLine(this.question(), alive); if(!alive()) return; }
    this.stage="answer"; setDial("answer");
  },
  async hear(){
    if(!["ask","answer"].includes(this.stage) || !narratorVoiceOn()) return;
    this.stop(); const g=this.gen; setDial("cask");
    await sayLine(this.question(), ()=>g===this.gen);
    if(g===this.gen){ this.stage="answer"; setDial("answer"); }
  },
  async mic(){
    if(!this.open || this.typed) return;
    if(this.listening){ if(listenFr.cur) listenFr.cur.stop(); return; }   // second tap: done speaking
    if(!["ask","answer","verdict"].includes(this.stage)) return;
    this.stop(); const g=this.gen; await sleep(80); if(g!==this.gen) return;
    this.stage="listen"; this.listening=true; this.paint(); setDial("mic");
    const r=await listenFr(9000); this.listening=false;
    if(g!==this.gen) return;
    if(!r.ok && ["not-allowed","service-not-allowed","audio-capture","unsupported","start"].includes(r.err)){
      this.noMic=true; toast(`${micErrText(r.err)} Escreve a resposta.`); this.stage="answer"; this.paint(); setDial("answer"); return;
    }
    if(!r.ok && r.err==="network"){ toast(micErrText(r.err)); this.stage="answer"; this.paint(); setDial("answer"); return; }
    this.judge(r.ok ? r.alts : null);
  },
  submit(){
    if(!this.open || !["ask","answer"].includes(this.stage)) return;
    const i=$("#ro-in"), v=i ? i.value.trim() : "";
    this.stop(); this.judge(v ? [v] : null);
  },
  skip(){ if(!["ask","answer","listen"].includes(this.stage)) return; this.stop(); this.listening=false; this.judge(null, true); },
  async judge(alts, gaveUp){
    const g=++this.gen, target=fill(this.it().fr), typed=this.typed, tries=this.att[this.k];
    const prev=tries.length ? tries[tries.length-1].s : null;
    let d=null; (alts||[]).forEach(a=>{ const x=roastDiff(target, a, typed); if(!d || x.score>d.score) d=x; });
    const kind = gaveUp ? "skip" : roastKind(d, prev, typed), s = d ? d.score : 0;
    tries.push({ s, kind });
    const v=roastSlots(d, typed), l=this.pick(kind);
    let fr=roastFill(l[0], v), pt=roastFill(l[1], v);
    if(kind==="good" && d){ const t = d.missing.length ? COLETTE.tail.miss : d.subs.length ? COLETTE.tail.sub : d.extras.length ? COLETTE.tail.extra : typed && d.acc.length ? COLETTE.tail.acc : null; if(t){ fr+=" "+roastFill(t[0], v); pt+=" "+roastFill(t[1], v); } }
    this.verdict={ kind, d, s, fr, pt, gaveUp:!!gaveUp, typed };
    this.stage="verdict"; this.paint(); setDial("cjudge"); buzz(s>=0.8 ? 20 : [30,60,30]);
    await this.say(fr, g); if(g!==this.gen) return;
    if(s<0.95){ await this.delay(260*FAST); if(g!==this.gen) return; setDial("listen"); await this.say(roastFill(COLETTE.model, { fr:target }), g); if(g!==this.gen) return; }
    setDial("cnext");
  },
  retry(){
    if(this.stage!=="verdict") return;
    if(!this.typed){ this.mic(); return; }
    this.stop(); this.stage="answer"; this.aside=null; this.paint(); setDial("answer");
    const i=$("#ro-in"); if(i) i.focus();
  },
  async replay(){ if(this.stage!=="verdict") return; this.stop(); const g=this.gen; setDial("listen"); await this.say(fill(this.it().fr), g); if(g===this.gen) setDial("cnext"); },
  next(){ if(this.stage!=="verdict") return; this.stop(); this.k++; if(this.k<this.items.length) this.ask(); else this.finish(); },
  finish(){
    this.stop(); this.flushTime(); Wake.drop("roast"); this.stage="done";
    const { raw, note }=roastNote(this.att.map(a=>a.length ? a[0].s : 0));
    const atFirst=this.att.filter(a=>a.length && a[0].s>=0.8).length;
    const insults=this.att.reduce((n,a)=>n+a.length, 0);   // even her compliments are insults
    const best=roBest(this.set);
    addHistory({ d:Date.now(), k:"roast", set:this.set, n:this.items.length, note, sec:Math.round(this.timeNow()/1000) }); saveProg();
    const b=COLETTE.verdict.find(x=>raw<x[0]) || COLETTE.verdict[COLETTE.verdict.length-1];
    this.line=[roastFill(b[2], { n:note }), roastFill(b[3], { n:note })];
    $("#pl-fill").style.width="100%"; $("#pl-left").textContent="";
    $("#pl-stage").dataset.stage="done";
    $("#pl-card").innerHTML=`<div class="pl-done ro-done">
      <div class="ro-grade" role="img" aria-label="Nota: ${note} em 20">${RO_RING}<b>${note}</b><span>/20</span></div>
      <p class="eyebrow" lang="fr">${h(b[1])}</p>
      ${coletteSays(this.line)}
      <ul class="facts center"><li><b>${this.items.length}</b><span>frases</span></li><li><b>${atFirst}</b><span>certas à primeira</span></li><li><b>${insults}</b><span>${insults===1?"insulto":"insultos"}</span></li></ul>
      <p class="muted sm">${best==null ? "Primeira nota aqui. Agora é subir." : note>best ? `Nova melhor nota aqui. A anterior era ${best}/20.` : `A tua melhor nota aqui: ${best}/20.`}</p></div>`;
    $("#pl-ctl").innerHTML=`<div class="done-actions"><button class="btn ghost" data-act="ro-close">Fechar</button><button class="btn primary" data-act="ro-again">${ic("repeat")} Outra ronda</button></div>`;
    setDial("done"); buzz(30);
    this.say(this.line[0], ++this.gen);
  },
  flushTime(){ const a=this.timeNow(), d=Math.floor((a-this.flushed)/1000); if(d>0){ addPractice(d); this.flushed+=d*1000; saveProg(); } },
  close(silent){
    if(!this.open) return;
    this.stop(); if(this.stage!=="done") this.flushTime();
    this.listening=false; this.open=false; Wake.drop("roast");
    if(Ov.kind==="roast") Ov.hide();
    if(!silent) render();
  },
  interrupt(){
    if(!this.open || this.stage==="done") return;
    this.flushTime(); this.stop(); this.listening=false;
    if(this.stage==="verdict") setDial("cnext"); else { this.stage="answer"; this.paint(); setDial("answer"); }
  },
  diffHtml(){
    const v=this.verdict, d=v.d, cls=scoreLabel(v.s)[1];
    const said = d ? roLine(d.h, "s") : `<em>${v.gaveUp ? "desististe" : v.typed ? "resposta vazia" : "silêncio"}</em>`;
    const right = d ? roLine(d.t, "mark") : frHtml(this.it().fr);
    return `<div class="ro-diff">
      <div class="ro-row"><span class="ro-k">${v.typed ? "Escreveste" : "Ouvi"}</span><p lang="fr">${said}</p>${d ? `<span class="sc ${cls}">${Math.round(v.s*100)}%</span>` : ""}</div>
      <div class="ro-row ok"><span class="ro-k">Correto</span><p lang="fr">${right}</p></div></div>`;
  },
  paint(){
    const card=$("#pl-card"), ctl=$("#pl-ctl"), stg=$("#pl-stage"); if(!card || this.stage==="done") return;
    const it=this.it(), n=this.items.length, typed=this.typed;
    stg.dataset.stage=this.stage;
    $("#pl-fill").style.width=(100*(this.k+(this.stage==="verdict"?1:0))/n).toFixed(1)+"%";
    $("#pl-left").textContent = this.stage==="intro" ? `${n} frases` : `${this.k+1} de ${n}`;
    if(this.stage==="intro"){
      card.innerHTML=`${coletteSays(this.line)}<p class="ro-how">${typed
        ? `Ela pergunta em português, tu escreves a resposta em francês, e ela corrige-te… à maneira dela.${IN_VIEWER ? " Na app instalada no telemóvel respondes ao microfone." : ""}`
        : "Ela pergunta em português, tu tocas no microfone e respondes em francês, e ela corrige-te… à maneira dela."}</p>`;
      ctl.innerHTML=`<div class="pl-sub"><button class="btn primary" data-act="ro-go">Começar ${ic("chevR")}</button></div>`;
      return;
    }
    const q=`<p class="pc-label">Como se diz</p><p class="pc-pt">${ptHtml(it.pt)}</p>`;
    if(this.stage==="verdict"){
      card.innerHTML=`<div class="ro-q">${q}</div>${this.diffHtml()}${coletteSays([this.verdict.fr, this.verdict.pt])}`;
      ctl.innerHTML=`<div class="done-actions"><button class="btn ghost" data-act="ro-retry">${ic(typed?"repeat":"mic")} ${this.verdict.s<0.95?"Tentar outra vez":"Outra vez"}</button><button class="btn primary" data-act="ro-next">${this.k===n-1?"Ver a nota":"Seguinte"} ${ic("chevR")}</button></div><div class="pl-sub"><button class="chip-btn" data-act="ro-replay">${ic("volume")} Ouvir a resposta</button></div>`;
      return;
    }
    const listen=this.stage==="listen";
    card.innerHTML=(this.aside && !listen ? coletteSays(this.aside, "mini") : "") + q + (listen ? `<p class="ro-listening" aria-live="polite">${ic("mic")} A ouvir… responde em francês.</p>` : "");
    const hearBtn = narratorVoiceOn() && !listen ? `<button class="chip-btn" data-act="ro-hear">${ic("volume")} Ouvir a pergunta</button>` : "";
    ctl.innerHTML = typed
      ? `<form class="ro-type" id="ro-form" autocomplete="off"><input id="ro-in" lang="fr" type="text" enterkeyhint="send" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="Escreve em francês…" aria-label="A tua resposta em francês"><button class="btn primary" type="submit">Enviar</button></form><div class="pl-sub"><button class="chip-btn" data-act="ro-skip">Não sei</button>${hearBtn}</div>`
      : `<div class="pl-main ro-main"><button class="cbtn big ro-mic${listen?" rec":""}" data-act="ro-mic" aria-label="${listen?"Parar de ouvir":"Responder ao microfone"}">${ic("mic")}<small>${listen?"Toca quando acabares":"Responder"}</small></button></div><div class="pl-sub"><button class="chip-btn" data-act="ro-skip">Não sei</button>${hearBtn}</div>`;
  }
};

/* ---------- Welcome (first launch) ---------- */
const Welcome = {
  show(){
    Ov.show("welcome", `<div class="wel">
      <div class="wel-stone">${stoneSVG("carrara", 720, 300, 11)}<div class="wel-mark">${BRAND_SVG}</div></div>
      <div class="wel-body">
        <h1 class="wel-title">Calepin</h1>
        <p class="wel-sub" lang="fr">Le français de la pierre</p>
        <p class="wel-lead">O francês do teu trabalho, ao estilo Pimsleur. O professor diz-te em português o que queres dizer, tu respondes em francês em voz alta, e ouves logo a versão nativa.</p>
        <ul class="wel-pts">
          <li><span class="num">16</span><div><b>Lições de 15 minutos</b><p>Do primeiro telefonema ao arquiteto até à receção da obra: amostras, chapas, acabamentos, orçamento, transporte e montagem.</p></div></li>
          <li><span class="num">${ic("mic")}</span><div><b>Falas antes de ouvir</b><p>O esforço de lembrar é o que fixa a frase. Usa auscultadores ou o altifalante e responde sempre em voz alta.</p></div></li>
          <li><span class="num">${ic("repeat")}</span><div><b>Revisão no dia certo</b><p>Cada frase volta quando está quase a esquecer-se: um dia depois, três, uma semana, um mês.</p></div></li>
        </ul>
        <div class="wel-form">
          <label class="field">O teu nome<input id="w-name" value="${h(S.settings.name)}" autocomplete="given-name" placeholder="Como te apresentas ao telefone"></label>
          <label class="field">A tua empresa<input id="w-company" value="${h(S.settings.company)}" autocomplete="organization" placeholder="Entra na lição 1"></label>
        </div>
        <div class="wel-sound"><button class="btn ghost" data-act="w-test">${ic("volume")} Testar o som</button><p class="hint" id="w-sound" aria-live="polite"></p></div>
        <button class="btn primary lg block" data-act="w-start">Começar</button>
      </div></div>`);
  },
  read(){ const n=$("#w-name"), c=$("#w-company"); if(n) S.settings.name=n.value.trim(); if(c) S.settings.company=c.value.trim(); },
  start(){ this.read(); S.settings.onboarded=true; saveSettings(); Voice.stop(); Ov.hide(); render(); },
  async test(btn){
    this.read(); syncPersona();
    const out=$("#w-sound"); btn.disabled=true; const g=++Tap.gen; const alive=()=>g===Tap.gen;
    out.textContent="A tocar…";
    const a=await sayFr("Bonjour ! Vous m'entendez bien ?", "A", false, alive);
    let msg = a.ok ? `Francês: ${Voice.pick.A ? Voice.pick.A.name : "voz do sistema"}.` : soundTrouble();
    if(a.ok && narratorVoiceOn()){ const p=await sayLine("E esta é a voz do professor, em português.", alive); msg += p.ok ? ` Professor: ${Voice.pick.P ? Voice.pick.P.name : "voz do sistema"}${Voice.narratorBR?" (do Brasil)":""}.` : " O professor fica em texto."; }
    else if(a.ok) msg+=" O professor aparece em texto: não há voz portuguesa instalada.";
    if(alive()) out.textContent=msg;
    btn.disabled=false;
  }
};

/* ---------- Settings ---------- */
function voiceRow(who, label, list, extra){
  const cur=S.settings.voices[who]||"auto", pk=Voice.pick[who];
  const auto=`<option value="auto"${cur==="auto"?" selected":""}>Automática${pk&&cur==="auto"?` · ${h(pk.name)}`:""}</option>`;
  return `<div class="vrow"><label class="field">${label}<select data-voice="${who}">${auto}${extra||""}${list.map(v=>`<option value="${h(v.voiceURI)}"${cur===v.voiceURI?" selected":""}>${h(v.name)} · ${h(vLang(v))}</option>`).join("")}</select></label><button class="btn ghost sm" data-act="test-voice" data-who="${who}" aria-label="Ouvir ${label}">${ic("volume")}</button></div>`;
}
function voiceStatus(){
  if(!Voice.ok) return `<p class="hint warn">Este browser não tem voz sintetizada. No Android, usa o Chrome.</p>`;
  if(!Voice.loaded) return `<p class="hint">A procurar as vozes do aparelho…</p>`;
  const bits=[];
  if(Voice.frStatus==="missing") bits.push(`<b>Falta a voz francesa.</b> ${androidVoiceSteps("Francês (França)")}`);
  else if(Voice.frStatus==="blind") bits.push("O browser não mostra a lista de vozes: a app usa a voz francesa do sistema.");
  else bits.push(`${Voice.fr.length} ${Voice.fr.length===1?"voz francesa":"vozes francesas"}${Voice.pick.A && Voice.pick.A===Voice.pick.N ? ": como é a mesma voz para todos, a app muda o tom de cada pessoa." : "."}`);
  if(S.settings.voices.P!=="off"){
    if(Voice.pick.P) bits.push(Voice.narratorBR ? "O professor usa uma voz do Brasil porque não há Português (Portugal) instalado." : "");
    else if(Voice.all.length) bits.push(`Sem voz portuguesa: o professor aparece em texto. ${androidVoiceSteps("Português (Portugal)")}`);
  }
  return bits.filter(Boolean).map(b=>`<p class="hint">${b}</p>`).join("");
}
function settingsHtml(){
  const s=S.settings, seg=(k,opts)=>`<div class="seg" role="radiogroup">${opts.map(([v,l])=>`<button role="radio" aria-checked="${s[k]===v}" class="${s[k]===v?"on":""}" data-act="set" data-k="${k}" data-v="${v}">${l}</button>`).join("")}</div>`;
  return `
  <section class="set-sec"><h3>Tu</h3>
    <label class="field">O teu nome<input id="s-name" data-field="name" value="${h(s.name)}" autocomplete="given-name"></label>
    <label class="field">A tua empresa<input id="s-company" data-field="company" value="${h(s.company)}" autocomplete="organization"></label>
    <p class="hint">Entram na lição 1, quando te apresentas ao telefone.</p></section>
  ${canInstallHere()?`<section class="set-sec"><h3>Instalar no telemóvel</h3><p class="hint">${installSteps()}</p>${installEvt?`<div class="row-btns"><button class="btn primary sm" data-act="install">${ic("download")} Instalar agora</button></div>`:""}</section>`:""}
  <section class="set-sec" id="set-voices"><h3>Vozes</h3>${voicesBlock()}</section>
  <section class="set-sec"><h3>Ritmo</h3>
    <p class="set-l">Velocidade do francês</p>${seg("rate",[[0.8,"Calma"],[0.92,"Normal"],[1,"Nativa"]])}
    <p class="set-l">Tempo para responderes</p>${seg("pause",[[1,"Curto"],[1.3,"Médio"],[1.6,"Longo"]])}
    <p class="hint">Começa em Normal e Médio. Quando as respostas saírem sem esforço, passa a Nativa e Curto.</p></section>
  <section class="set-sec"><h3>Ecrã</h3>
    <label class="tog"><input type="checkbox" data-k="showFr"${s.showFr?" checked":""}><span>Mostrar o francês escrito<small>Desliga para treinar só de ouvido, como no Pimsleur original.</small></span></label>
    <label class="tog"><input type="checkbox" data-k="showPt"${s.showPt?" checked":""}><span>Tradução no diálogo</span></label>
    <p class="set-l">Tema</p>${seg("theme",[["auto","Automático"],["light","Claro"],["dark","Escuro"]])}</section>
  <section class="set-sec"><h3>Os teus dados</h3>
    <p class="hint">O progresso fica guardado neste aparelho${IN_VIEWER?", nesta página":""}.${IN_VIEWER?"":" Exporta-o para o levares para outro telemóvel."}</p>
    <div class="row-btns">${IN_VIEWER?"":`<button class="btn ghost sm" data-act="export">${ic("download")} Exportar</button><button class="btn ghost sm" data-act="import">${ic("upload")} Importar</button><input type="file" id="imp-file" accept="application/json,.json" hidden>`}<button class="btn ghost sm danger" data-act="reset">${ic("trash")} Apagar o progresso</button></div>
    <p class="hint" id="data-msg" hidden></p></section>
  <section class="set-sec about"><h3>O método</h3>
    <p>Cada lição segue a estrutura Pimsleur: ouves um diálogo real da obra, aprendes as frases por partes, a começar pelo fim, e o professor volta a pedir-tas em intervalos cada vez maiores. Depois tens frases novas para construir sozinho e uma conversa em que és tu a responder.</p>
    <p>Regra de ouro: responde sempre em voz alta, antes de ouvires a resposta. Se acertares em oito de cada dez, passa à lição seguinte. Se não, repete-a no dia seguinte.</p></section>`;
}
function voicesBlock(){
  return `${voiceStatus()}
    ${voiceRow("P","Professor, em português", Voice.pt, `<option value="off"${S.settings.voices.P==="off"?" selected":""}>Só texto, sem voz</option>`)}
    ${voiceRow("A","Interlocutora", Voice.fr)}
    ${voiceRow("N","Tu, nas respostas modelo", Voice.fr)}
    ${voiceRow("C","Encarregado de obra", Voice.fr)}`;
}
function openSettings(){ Sheet.open("Definições", settingsHtml(), { kind:"settings", onClose:()=>render() }); }
async function testVoice(who, btn){
  const alive=()=>true; Tap.stop(); Voice.stop(); await sleep(50);
  btn.classList.add("playing");
  const lines={ A:"Bonjour, monsieur. Je vous écoute.", N:"Bonjour, madame. Je voudrais parler à Madame Moreau.", C:"Bonjour ! Vous commencez la pose aujourd'hui ?" };
  const r = who==="P" ? await sayLine("Olá. Eu digo-te o que dizer, e tu respondes em francês.", alive) : await sayFr(lines[who], who, false, alive);
  btn.classList.remove("playing");
  if(!r.ok && !SOFT_ERR.has(r.err)) toast(who==="P" ? "A voz portuguesa não respondeu." : soundTrouble());
}
function exportData(){
  const data={ app:"calepin", v:1, at:new Date().toISOString(), settings:S.settings, progress:S.prog };
  const blob=new Blob([JSON.stringify(data)], { type:"application/json" }), a=document.createElement("a");
  a.href=URL.createObjectURL(blob); a.download=`calepin-${today()}.json`; document.body.appendChild(a); a.click();
  setTimeout(()=>{ URL.revokeObjectURL(a.href); a.remove(); }, 1500);
  dataMsg("Ficheiro exportado. Para o recuperar noutro aparelho, usa Importar.");
}
function dataMsg(t){ const m=$("#data-msg"); if(m){ m.hidden=false; m.textContent=t; } }
async function importData(file){
  try{
    const d=JSON.parse(await file.text());
    if(!d || d.app!=="calepin" || !d.progress) throw new Error("bad");
    S.prog=mergeProg(d.progress); S.settings=mergeSettings(Object.assign({}, d.settings||{}, { onboarded:true }));
    saveProg(); saveSettings(); applyTheme();
    Sheet.set(settingsHtml()); dataMsg(`Progresso importado: ${Object.keys(S.prog.lessons).length} lições, ${Object.keys(S.prog.srs).length} frases.`);
  }catch(e){ dataMsg("Este ficheiro não é uma exportação do Calepin."); }
}
let resetArm=0;
function resetProgress(btn){
  if(Date.now()-resetArm>4000){ resetArm=Date.now(); btn.innerHTML=`${ic("trash")} Toca outra vez para apagar tudo`; btn.classList.add("armed"); return; }
  resetArm=0; S.prog=mergeProg({}); saveProg();
  btn.innerHTML=`${ic("trash")} Apagar o progresso`; btn.classList.remove("armed");
  dataMsg("Progresso apagado. As definições ficaram.");
}

/* ---------- Sheet ---------- */
const Sheet = {
  onClose:null, lastFocus:null, kind:null,
  get isOpen(){ return !$("#sheet-wrap").hidden; },
  open(title, html, opts){
    if(this.isOpen) this.close(true);
    $("#sheet-title").textContent=title; this.set(html); this.onClose=(opts&&opts.onClose)||null; this.kind=(opts&&opts.kind)||null; this.lastFocus=document.activeElement;
    $("#sheet-wrap").hidden=false; document.body.classList.add("locked"); Nav.later();
    setTimeout(()=>{ const c=$("#sheet-close"); if(c) c.focus({ preventScroll:true }); }, 40);
  },
  set(html){ const b=$("#sheet-body"); b.innerHTML=html; b.scrollTop=0; },
  close(silent){
    if(!this.isOpen) return;
    const cb=this.onClose; this.onClose=null; this.kind=null;
    $("#sheet-wrap").hidden=true; if(!Ov.kind) document.body.classList.remove("locked"); $("#sheet-body").innerHTML="";
    Tap.stop(); Voice.stop();
    if(cb && !silent) cb();
    Nav.later();
    if(!silent && this.lastFocus && this.lastFocus.focus){ try{ this.lastFocus.focus({ preventScroll:true }); }catch(e){} }
  }
};

/* ---------- Phone behaviour: back gesture, screen on, haptics ---------- */
// Back gesture closes the player (it keeps your place), then panels, then returns to Hoje.
const Nav = {
  on: !IN_VIEWER, guard:false, skip:0, t:0, armed:false,
  init(){
    if(!this.on) return;
    try{ const st=history.state; if(st && st.calepin===1) this.guard=true; else history.replaceState({ calepin:0 }, ""); }
    catch(e){ this.on=false; return; }
    window.addEventListener("popstate", e=>this.pop(e));
    this.later();
  },
  later(){ if(!this.on || this.t) return; this.t=setTimeout(()=>{ this.t=0; this.sync(); }, 0); },
  atRoot(){ return S.tab==="hoje" && !Sheet.isOpen && !Ov.kind; },
  sync(){
    const need=!this.atRoot();
    try{
      if(need && !this.guard){
        const ua=navigator.userActivation;
        if(ua && !ua.hasBeenActive){ if(!this.armed){ this.armed=true; const go=()=>{ this.armed=false; removeEventListener("pointerup",go,true); removeEventListener("keydown",go,true); this.later(); }; addEventListener("pointerup",go,true); addEventListener("keydown",go,true); } return; }
        history.pushState({ calepin:1 }, ""); this.guard=true;
      } else if(!need && this.guard){ this.guard=false; this.skip++; history.back(); }
    }catch(e){}
  },
  pop(e){
    if(this.skip>0){ this.skip--; return; }
    if(e.state && e.state.calepin===1){ this.guard=true; this.later(); return; }
    this.guard=false;
    if(Ov.kind==="player") P.close();
    else if(Ov.kind==="review") R.close();
    else if(Ov.kind==="roast") Roast.close();
    else if(Ov.kind==="welcome") Welcome.start();
    else if(Sheet.isOpen) Sheet.close();
    else if(S.tab!=="hoje") goTab("hoje");
    this.later();
  }
};
// Keeps the screen on during a lesson: speech stops when the phone locks.
const Wake = {
  why:new Set(), lock:null, busy:false,
  hold(k){ this.why.add(k); document.documentElement.classList.add("live"); this.refresh(); },
  drop(k){ this.why.delete(k); if(this.why.size) return; document.documentElement.classList.remove("live"); const l=this.lock; this.lock=null; if(l) l.release().catch(()=>{}); },
  async refresh(){
    if(!this.why.size || this.lock || this.busy || !("wakeLock" in navigator) || document.visibilityState!=="visible") return;
    this.busy=true;
    try{ const l=await navigator.wakeLock.request("screen"); if(!this.why.size) l.release().catch(()=>{}); else { this.lock=l; l.addEventListener("release", ()=>{ if(this.lock===l) this.lock=null; }); } }
    catch(e){}
    this.busy=false;
  }
};
function buzz(p){ try{ if(IS_MOBILE && navigator.vibrate) navigator.vibrate(p); }catch(e){} }
document.addEventListener("visibilitychange", ()=>{
  if(document.visibilityState==="visible"){ Wake.refresh(); return; }
  if(P.mode) { if(IS_MOBILE && P.playing){ P.pause(); } else P.flushTime(); }
  if(R.open){ if(IS_MOBILE) R.interrupt(); else R.flushTime(); }
  if(Roast.open){ if(IS_MOBILE) Roast.interrupt(); else Roast.flushTime(); }
  if(IS_MOBILE){ Tap.stop(); Voice.stop(); }
});
window.addEventListener("pagehide", ()=>{ if(P.mode){ P.flushTime(); P.saveResume(); } if(R.open) R.flushTime(); if(Roast.open) Roast.flushTime(); });
window.addEventListener("beforeinstallprompt", e=>{ e.preventDefault(); installEvt=e; if(S.tab==="hoje" && !Ov.kind) schedule(); });
window.addEventListener("appinstalled", ()=>{ installEvt=null; toast("App instalada. Já a tens no ecrã principal."); if(S.tab==="hoje") schedule(); });
// While the phone keyboard is open, the tab bar steps aside (and comes back when it closes, even if the field keeps focus)
const isField = el=> !!el && (el.tagName==="TEXTAREA" || el.tagName==="SELECT" || el.isContentEditable || (el.tagName==="INPUT" && !/^(checkbox|radio|range|button|submit|reset|file|color)$/i.test(el.type||"")));
const vvH = ()=> window.visualViewport ? window.visualViewport.height : window.innerHeight;
let maxVH=vvH(), kbT=0;
function kbCheck(){ const v=vvH(); maxVH=Math.max(maxVH, v); document.body.classList.toggle("typing", IS_MOBILE && isField(document.activeElement) && v < maxVH*0.8); }
const kbLater=()=>{ clearTimeout(kbT); kbT=setTimeout(kbCheck, 120); };
if(window.visualViewport) window.visualViewport.addEventListener("resize", kbLater); else window.addEventListener("resize", kbLater);
window.addEventListener("orientationchange", ()=>{ maxVH=0; kbLater(); });
document.addEventListener("focusin", kbLater);
document.addEventListener("focusout", kbLater);

/* ---------- Events ---------- */
document.addEventListener("submit", e=>{ if(e.target && e.target.id==="ro-form"){ e.preventDefault(); Roast.submit(); } });
document.addEventListener("click", async e=>{
  const a=e.target.closest("[data-act]"); if(!a) return;
  const act=a.dataset.act, id=a.dataset.id;
  switch(act){
    case "tab": if(Sheet.isOpen) Sheet.close(true); goTab(a.dataset.tab); break;
    case "settings": openSettings(); break;
    case "sheet-close": Sheet.close(); break;
    case "lesson": openLesson(id); break;
    case "roast": Roast.start(id); break;
    case "ro-close": Roast.close(); break;
    case "ro-go": Roast.go(); break;
    case "ro-mic": Roast.mic(); break;
    case "ro-skip": Roast.skip(); break;
    case "ro-hear": Roast.hear(); break;
    case "ro-retry": Roast.retry(); break;
    case "ro-next": Roast.next(); break;
    case "ro-replay": Roast.replay(); break;
    case "ro-again": { const st=Roast.set; Roast.close(true); Roast.start(st); break; }
    case "play-lesson": { const L=LESSON_BY_ID[id]; if(L) P.open(L); break; }
    case "restart-lesson": { const L=LESSON_BY_ID[id]; if(L) P.open(L, { restart:true }); break; }
    case "play-dialogue": { const L=LESSON_BY_ID[id]; if(L) P.open(L, { dialogue:true }); break; }
    case "play-next": { const L=nextLesson()||LESSONS[0]; P.open(L); break; }
    case "next-lesson": { const L=LESSON_BY_ID[a.dataset.id] || nextLesson(); if(L){ P.close(); P.open(L, { restart:true }); } break; }
    case "review": R.start(false); break;
    case "practice": R.start(true); break;
    case "say": Tap.play(a.dataset.ref, false, a); break;
    case "say-slow": Tap.play(a.dataset.ref, true, a); break;
    case "check": checkPhrase(a.dataset.ref, a); break;
    case "seg": S.seg=a.dataset.v; LS.set("seg", S.seg); S.q=""; render(); break;
    case "clear-q": S.q=""; render(); { const q=$("#q"); if(q) q.focus(); } break;
    case "install": promptInstall(); break;
    case "install-help": if(installEvt) promptInstall(); else openInstallHelp(); break;
    case "install-later": LS.set("install-later", Date.now()+14*DAY); schedule(); break;
    // player
    case "pl-close": P.close(); break;
    case "pl-toggle": P.toggle(); break;
    case "pl-back": P.back(); break;
    case "pl-skip": P.skip(); break;
    case "pl-done": P.doneWait(); break;
    case "pl-replay": P.replay(); break;
    case "pl-pop": { const p=$("#pl-pop"); p.hidden=!p.hidden; a.setAttribute("aria-expanded", String(!p.hidden)); break; }
    case "rate-lesson": P.rate(a.dataset.ok==="1"); break;
    // review
    case "rv-close": R.close(); break;
    case "rv-show": R.show(); break;
    case "rv-mic": R.mic(); break;
    case "rv-grade": R.grade(+a.dataset.v); break;
    case "rv-replay": R.replay(); break;
    case "rv-resume": R.resume(); break;
    // welcome
    case "w-start": Welcome.start(); break;
    case "w-test": Welcome.test(a); break;
    // settings
    case "set": {
      const k=a.dataset.k, raw=a.dataset.v, v = k==="theme" ? raw : parseFloat(raw);
      S.settings[k]=v; saveSettings();
      if(k==="theme") applyTheme();
      $$(`[data-act="set"][data-k="${k}"]`).forEach(b=>{ const on=b.dataset.v===raw; b.classList.toggle("on", on); b.setAttribute("aria-checked", String(on)); });
      if(P.mode && (k==="rate"||k==="pause")) P.rebuild();
      break;
    }
    case "test-voice": testVoice(a.dataset.who, a); break;
    case "export": exportData(); break;
    case "import": { const f=$("#imp-file"); if(f) f.click(); break; }
    case "reset": resetProgress(a); break;
  }
});
document.addEventListener("change", e=>{
  const t=e.target;
  if(t.matches("select[data-voice]")){ S.settings.voices[t.dataset.voice]=t.value; NARR.failed=false; saveSettings(); const vb=$("#set-voices"); if(vb) vb.innerHTML=`<h3>Vozes</h3>${voicesBlock()}`; return; }
  if(t.matches("input[type=checkbox][data-k]")){ S.settings[t.dataset.k]=t.checked; saveSettings(); $$(`input[type=checkbox][data-k="${t.dataset.k}"]`).forEach(x=>{ x.checked=t.checked; }); if(P.mode) P.paintCard(); return; }
  if(t.id==="imp-file" && t.files && t.files[0]){ importData(t.files[0]); t.value=""; return; }
});
let qT=0;
document.addEventListener("input", e=>{
  const t=e.target;
  if(t.id==="q"){ S.q=t.value; clearTimeout(qT); qT=setTimeout(renderList, 120); return; }
  if(t.matches("input[data-field]")){ S.settings[t.dataset.field]=t.value; saveSettings(); }
});
document.addEventListener("toggle", e=>{
  const d=e.target; if(!d.matches || !d.matches("details.grp") || S.q) return;
  S.open[d.dataset.g]=d.open; LS.set("open", S.open);
}, true);
document.addEventListener("keydown", e=>{
  if(isField(e.target)) return;
  if(e.key==="Escape"){ if(Ov.kind==="player") P.close(); else if(Ov.kind==="review") R.close(); else if(Ov.kind==="roast") Roast.close(); else if(Sheet.isOpen) Sheet.close(); return; }
  if(Ov.kind==="player" && !P.finished){
    if(e.key===" " || e.key==="k"){ e.preventDefault(); P.toggle(); }
    else if(e.key==="ArrowRight"){ e.preventDefault(); if(P.waitFin) P.doneWait(); else P.skip(); }
    else if(e.key==="ArrowLeft"){ e.preventDefault(); P.back(); }
    else if(e.key==="r"){ P.replay(); }
  } else if(Ov.kind==="review"){
    if(e.key===" "){ e.preventDefault(); if(R.stage==="grade") R.replay(); else R.show(); }
    else if(["1","2","3"].includes(e.key)) R.grade(+e.key-1);
  } else if(Ov.kind==="roast" && e.target===document.body){
    if(e.key===" "){ e.preventDefault(); if(Roast.stage==="intro") Roast.go(); else Roast.mic(); }
    else if(e.key==="Enter" && Roast.stage==="verdict"){ e.preventDefault(); Roast.next(); }
  }
});
// tooltips for the charts (hover, focus and tap)
function showTip(t){ const f=$("#ftip"); f.textContent=t.dataset.tip; f.hidden=false; const r=t.getBoundingClientRect(); f.style.left=clamp(r.left+r.width/2, 110, window.innerWidth-110)+"px"; f.style.top=(r.top-8)+"px"; }
document.addEventListener("pointerover", e=>{ const t=e.target.closest && e.target.closest("[data-tip]"); if(t) showTip(t); });
document.addEventListener("pointerout", e=>{ const t=e.target.closest && e.target.closest("[data-tip]"); if(t && !t.contains(e.relatedTarget)) $("#ftip").hidden=true; });
document.addEventListener("focusin", e=>{ const t=e.target.closest && e.target.closest("[data-tip]"); if(t) showTip(t); });
document.addEventListener("focusout", e=>{ if(e.target.closest && e.target.closest("[data-tip]")) $("#ftip").hidden=true; });
window.addEventListener("scroll", ()=>{ const f=$("#ftip"); if(f && !f.hidden) f.hidden=true; }, { passive:true });

/* ---------- Boot ---------- */
(function boot(){
  $("#rail-brand").innerHTML=brandBlock();
  $("#rail-foot").innerHTML=`<button class="btn ghost sm" data-act="settings">${ic("sliders")} Definições</button>${IN_VIEWER&&APP_URL?`<a class="linkbtn sm" href="${h(APP_URL)}" target="_blank" rel="noopener">Abrir a app no telemóvel ↗</a>`:""}`;
  applyTheme(); syncPersona();
  const hash=(location.hash||"").replace("#",""); if(TABS.includes(hash)) S.tab=hash;
  if(S.prog.resume && !LESSON_BY_ID[S.prog.resume.id]) S.prog.resume=null;
  render();
  Voice.on(()=>{ syncPersona(); if(!Ov.kind) schedule(); if(Sheet.kind==="settings"){ const vb=$("#set-voices"); if(vb) vb.innerHTML=`<h3>Vozes</h3>${voicesBlock()}`; } });
  Voice.init();
  Nav.init();
  if(!S.settings.onboarded) Welcome.show();
  // the public site works offline once opened: the service worker keeps the page and icons
  if(PUBLIC && !IN_VIEWER && "serviceWorker" in navigator && (location.protocol==="https:" || /^(localhost|127\.0\.0\.1)$/.test(location.hostname)))
    window.addEventListener("load", ()=>{
      const had=!!navigator.serviceWorker.controller, t0=performance.now();
      navigator.serviceWorker.addEventListener("controllerchange", ()=>{ if(had && performance.now()-t0<15000 && !Ov.kind && !Sheet.isOpen) location.reload(); });
      navigator.serviceWorker.register("sw.js").catch(()=>{});
    });
})();
