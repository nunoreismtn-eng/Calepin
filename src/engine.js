/* ===================== ENGINE: speech, lesson scripts, spaced review, scoring ===================== */
const clamp = (v,a,b)=>Math.max(a,Math.min(b,v));
const fin = v => v!=null && !isNaN(v) && isFinite(v);
const sleep = ms => new Promise(r=>setTimeout(r,ms));
const escHtml = s => String(s==null?"":s).replace(/[&<>"']/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function hashStr(str){ let h=2166136261; for(let i=0;i<str.length;i++){ h^=str.charCodeAt(i); h=Math.imul(h,16777619); } return h>>>0; }
function seeded(seed){ let s=seed||1; return ()=>{ s=(Math.imul(s,1664525)+1013904223)>>>0; return s/4294967296; }; }

/* ---------- Days (local calendar) ---------- */
const DAY = 86400000;
function dayKey(ts){ const d=new Date(ts==null?Date.now():ts); return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0"); }
function keyDate(k){ const p=String(k).split("-").map(Number); return new Date(p[0], p[1]-1, p[2]); }
function addDays(k, n){ const d=keyDate(k); d.setDate(d.getDate()+n); return dayKey(d.getTime()); }
function daysBetween(a, b){ return Math.round((keyDate(b)-keyDate(a))/DAY); }

/* ---------- Text ---------- */
// «…» is French everywhere in the course; Portuguese quotes use “…”.
const FALLBACK = { name:"Pedro", company:"Pedra Nobre" };
const Persona = { name:"", company:"" };
function fill(t){ return String(t==null?"":t).replace(/\{nome\}/g, Persona.name||FALLBACK.name).replace(/\{empresa\}/g, Persona.company||FALLBACK.company); }
// French display typography: typographic apostrophe, narrow no-break space before ? ! : ; » and after «
function frTypo(t){ return fill(t).replace(/'/g,"’").replace(/\s+([?!:;»])/g," $1").replace(/«\s*/g,"« "); }
const frHtml = t => escHtml(frTypo(t));
function segs(t){
  const out=[], re=/«\s*([^»]*?)\s*»/g; let last=0, m;
  while((m=re.exec(t))){ if(m.index>last) out.push({ fr:false, text:t.slice(last,m.index) }); out.push({ fr:true, text:m[1] }); last=re.lastIndex; }
  if(last<t.length) out.push({ fr:false, text:t.slice(last) });
  return out;
}
// Portuguese with the French quotations set in the French face
function ptHtml(t){ return segs(fill(t)).map(s=> s.fr ? `<span class="q-fr">«${escHtml(frTypo(s.text).replace(/^ | $/g,""))}»</span>` : escHtml(s.text.replace(/'/g,"’"))).join(""); }
const frSpeech = t => fill(t).replace(/[«»“”"]/g,"").replace(/…/g,".").replace(/\s+/g," ").trim();
const ptSpeech = t => fill(t).replace(/[«»“”"]/g,"").replace(/…/g,".").replace(/\s+/g," ").trim();
// narrator line → parts to voice: Portuguese, with the «French» bits in a French voice
function speechParts(t){
  const out=[];
  segs(fill(t)).forEach(s=>{ const lang=s.fr?"fr":"pt"; chunkText(s.fr?frSpeech(s.text):ptSpeech(s.text)).forEach(text=>out.push({ lang, text })); });
  return out.filter(p=>/[\p{L}\p{N}]/u.test(p.text));
}
// long lines go out sentence by sentence: some browser voices stop after about 15 seconds
function chunkText(t, max){
  max=max||150; if(t.length<=max) return [t];
  const out=[]; let cur="";
  t.split(/(?<=[.!?;:])\s+/).forEach(p=>{ if(cur && (cur+" "+p).length>max){ out.push(cur); cur=p; } else cur = cur ? cur+" "+p : p; });
  if(cur) out.push(cur);
  return out;
}
function speechSec(text, lang, rate){ const n=(text||"").length; return 0.35 + n*(/^fr/i.test(lang||"")?0.068:0.062)/(rate||1); }
function readSec(text){ return Math.max(1.6, 0.9 + String(text||"").length*0.05); }

/* ---------- Pronunciation check (speech recognition → words) ---------- */
const NUM_U = ["zéro","un","deux","trois","quatre","cinq","six","sept","huit","neuf","dix","onze","douze","treize","quatorze","quinze","seize","dix-sept","dix-huit","dix-neuf"];
const NUM_T = ["","","vingt","trente","quarante","cinquante","soixante","soixante","quatre-vingt","quatre-vingt"];
function nombre(n){
  n=Math.floor(Math.abs(n));
  if(n<20) return NUM_U[n];
  if(n<100){
    const t=Math.floor(n/10), u=n%10;
    if(t===7 || t===9) return NUM_T[t] + (t===7 && u===1 ? " et " : "-") + NUM_U[10+u];
    if(u===0) return t===8 ? "quatre-vingts" : NUM_T[t];
    if(u===1 && t!==8) return NUM_T[t]+" et un";
    return NUM_T[t]+"-"+NUM_U[u];
  }
  if(n<1000){ const c=Math.floor(n/100), r=n%100; if(!r) return c===1 ? "cent" : NUM_U[c]+" cents"; return (c===1?"cent":NUM_U[c]+" cent")+" "+nombre(r); }
  if(n<1e6){ const m=Math.floor(n/1000), r=n%1000; const head = m===1 ? "mille" : nombre(m).replace(/s$/,"")+" mille"; return r ? head+" "+nombre(r) : head; }
  return String(n);
}
function normFr(t){
  let s=String(t||"").toLowerCase()
    .replace(/(\d+)\s*h\s*(\d+)/g, (m,a,b)=> nombre(+a)+" heures "+nombre(+b))
    .replace(/(\d+)\s*h\b/g, (m,a)=> nombre(+a)+" heures")
    .replace(/(\d+)\s*%/g, (m,a)=> nombre(+a)+" pour cent")
    .replace(/(\d+)\s*€/g, (m,a)=> nombre(+a)+" euros")
    .replace(/\b(\d{1,3})(?:[   .](\d{3}))+\b/g, m=> nombre(+m.replace(/\D/g,"")))
    .replace(/\d+/g, m=> nombre(+m));
  return s.normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/œ/g,"oe").replace(/æ/g,"ae")
    .replace(/[’'`\-]/g," ").replace(/[^a-z ]+/g," ").replace(/\s+/g," ").trim();
}
// word-level edit distance against the target; missing = target words the speaker did not say
function wordScore(target, heard){
  const toks=[]; fill(target).replace(/[’'\-]/g," ").split(/\s+/).forEach(o=>{ const n=normFr(o); if(n) n.split(" ").forEach(w=>toks.push({ o:o.replace(/[^\p{L}\p{N}]+/gu,""), n:w })); });
  const a=toks.map(t=>t.n), b=normFr(heard).split(" ").filter(Boolean);
  const m=a.length, n=b.length;
  if(!m) return { score:0, missing:[] };
  const D=[]; for(let i=0;i<=m;i++){ D.push(new Array(n+1).fill(0)); D[i][0]=i; } for(let j=0;j<=n;j++) D[0][j]=j;
  for(let i=1;i<=m;i++) for(let j=1;j<=n;j++) D[i][j]=Math.min(D[i-1][j]+1, D[i][j-1]+1, D[i-1][j-1]+(a[i-1]===b[j-1]?0:1));
  const L=[]; for(let i=0;i<=m;i++) L.push(new Array(n+1).fill(0));
  for(let i=m-1;i>=0;i--) for(let j=n-1;j>=0;j--) L[i][j] = a[i]===b[j] ? L[i+1][j+1]+1 : Math.max(L[i+1][j], L[i][j+1]);
  const missing=[]; let i=0, j=0;
  while(i<m && j<n){ if(a[i]===b[j]){ i++; j++; } else if(L[i+1][j]>=L[i][j+1]){ missing.push(toks[i].o); i++; } else j++; }
  while(i<m) missing.push(toks[i++].o);
  return { score:Math.max(0, 1-D[m][n]/m), missing:missing.filter(Boolean) };
}
function bestScore(target, alts){
  let best={ score:0, missing:[], heard:"" };
  (alts||[]).forEach(h=>{ const r=wordScore(target, h); if(r.score>best.score || !best.heard) best={ score:r.score, missing:r.missing, heard:h }; });
  return best;
}
function scoreLabel(s){ return s>=0.85 ? ["Excelente","ok"] : s>=0.6 ? ["Quase","mid"] : ["Repete","low"]; }
const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition || null;
function listenFr(maxMs){
  return new Promise(resolve=>{
    if(!SpeechRec){ resolve({ ok:false, err:"unsupported", alts:[] }); return; }
    let r; try{ r=new SpeechRec(); }catch(e){ resolve({ ok:false, err:"unsupported", alts:[] }); return; }
    r.lang="fr-FR"; r.interimResults=false; r.maxAlternatives=4; r.continuous=false;
    let done=false;
    const end=x=>{ if(done) return; done=true; clearTimeout(t); try{ r.abort(); }catch(e){} listenFr.cur=null; resolve(x); };
    r.onresult=e=>{ const alts=[]; for(const res of e.results) for(let k=0;k<res.length;k++) if(res[k].transcript) alts.push(res[k].transcript); end({ ok:alts.length>0, alts, err:alts.length?null:"no-speech" }); };
    r.onerror=e=>end({ ok:false, err:(e&&e.error)||"error", alts:[] });
    r.onend=()=>end({ ok:false, err:"no-speech", alts:[] });
    const t=setTimeout(()=>end({ ok:false, err:"timeout", alts:[] }), maxMs||9000);
    listenFr.cur={ stop:()=>{ try{ r.stop(); }catch(e){} } };
    try{ r.start(); }catch(e){ end({ ok:false, err:"start", alts:[] }); }
  });
}
listenFr.cur=null;

/* ---------- Sans pitié: what was said, word by word, against the target (for Madame Colette's remarks) ---------- */
function roastToks(text){
  const disp=String(text||"").trim().split(/\s+/).filter(Boolean), toks=[];
  disp.forEach((d,di)=>d.replace(/[’'\-]/g," ").split(/\s+/).forEach(o=>{ const n=normFr(o); if(n) n.split(" ").forEach(w=>toks.push({ n:w, o:o.replace(/[^\p{L}\p{N}]+/gu,""), di })); }));
  return { disp, toks };
}
function charSim(a, b){
  const m=a.length, n=b.length; if(!m || !n) return 0;
  let p=Array.from({ length:n+1 }, (_,j)=>j);
  for(let i=1;i<=m;i++){ const c=[i]; for(let j=1;j<=n;j++) c[j]=Math.min(p[j]+1, c[j-1]+1, p[j-1]+(a[i-1]===b[j-1]?0:1)); p=c; }
  return 1-p[n]/Math.max(m,n);
}
const bare = w => String(w||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/œ/g,"oe").replace(/æ/g,"ae");
// how a word sounds, roughly: the recogniser may write «parlé» for «parler», «et» for «est», «mot» for «mots»
const PHON_W = { est:"e", et:"e", es:"e", ai:"e" };
function phon(o, n){
  let w = /\d/.test(o) ? n : String(o||"").toLowerCase();
  if(PHON_W[w]) return PHON_W[w];
  w=w.replace(/(aient|ais|ait|ai|ées|ée|és|ez|er|é)$/,"§");
  w=bare(w);
  while(w.length>2 && /[sxtd]$/.test(w)) w=w.slice(0,-1);
  if(w.length>2) w=w.replace(/e$/,"");
  return w.replace(/(.)\1+/g,"$1");
}
// word-level alignment (spoken answers compare sounds, typed answers compare spelling): what was missing, swapped, added
function roastDiff(target, heard, typed){
  const T=roastToks(fill(target)), H=roastToks(heard), a=T.toks, b=H.toks, m=a.length, n=b.length;
  [a,b].forEach(l=>l.forEach(t=>{ t.p=phon(t.o, t.n); }));
  const same = typed ? (x,y)=>x.n===y.n : (x,y)=>x.n===y.n || x.p===y.p;
  const D=[]; for(let i=0;i<=m;i++){ D.push(new Array(n+1).fill(0)); D[i][0]=i; } for(let j=0;j<=n;j++) D[0][j]=j;
  for(let i=1;i<=m;i++) for(let j=1;j<=n;j++) D[i][j]=Math.min(D[i-1][j]+1, D[i][j-1]+1, D[i-1][j-1]+(same(a[i-1],b[j-1])?0:1));
  const ops=[]; let i=m, j=n;
  while(i>0 || j>0){
    if(i>0 && j>0 && D[i][j]===D[i-1][j-1]+(same(a[i-1],b[j-1])?0:1)){ ops.push({ t:same(a[i-1],b[j-1])?"ok":"sub", ti:i-1, hi:j-1 }); i--; j--; }
    else if(i>0 && D[i][j]===D[i-1][j]+1){ ops.push({ t:"miss", ti:i-1 }); i--; }
    else { ops.push({ t:"extra", hi:j-1 }); j--; }
  }
  ops.reverse();
  const missing=[], subs=[], extras=[], acc=[], tBad=new Set(), hBad=new Set();
  const word = x => x===a[0] && /^\p{Lu}\p{Ll}/u.test(x.o) ? x.o[0].toLowerCase()+x.o.slice(1) : x.o;   // «excellente», not «Excellente», when quoted on its own
  ops.forEach(o=>{
    const x=a[o.ti], y=b[o.hi];
    if(o.t==="miss"){ missing.push(word(x)); tBad.add(x.di); }
    else if(o.t==="extra"){ extras.push(y.o); hBad.add(y.di); }
    else if(o.t==="sub"){ subs.push({ want:word(x), got:y.o.toLowerCase(), near:charSim(x.n, y.n)>=0.5 }); tBad.add(x.di); hBad.add(y.di); }
    else if(typed && /\p{L}/u.test(x.o) && bare(x.o)===bare(y.o) && x.o.toLowerCase()!==y.o.toLowerCase()){ acc.push({ want:word(x), got:y.o }); tBad.add(x.di); hBad.add(y.di); }   // right letters, wrong accents (typed answers)
  });
  return { score:m ? Math.max(0, 1-D[m][n]/m) : 0, missing:missing.filter(Boolean), subs, extras:extras.filter(Boolean), acc, heardN:n,
    t:T.disp.map((w,k)=>({ w, bad:tBad.has(k) })), h:H.disp.map((w,k)=>({ w, bad:hBad.has(k) })) };
}
// which kind of remark: the first try is judged on its own, a retry against the previous try
function roastKind(d, prev, typed){
  if(!d || !d.heardN) return "silence";
  const s=d.score;
  if(prev!=null){
    if(s>=0.8 && prev<0.8) return "better";
    if(s<prev-0.15) return "worse";
    if(s<0.45 && prev<0.45) return "again";
  }
  if(s>=0.95) return typed && d.acc.length ? "accents" : "perfect";
  if(s>=0.8) return "good";
  if(s<0.45) return "bad";
  if(d.subs.some(x=>x.near)) return "near";
  if(d.subs.length) return "sub";
  if(d.missing.length) return "miss";
  if(d.extras.length) return "extra";
  return "bad";
}
// the words that go into the remark: the most telling slip (longest word, near-misses first)
function roastSlots(d, typed){
  const long=arr=>arr.filter(w=>w.length>1).sort((x,y)=>y.length-x.length)[0] || arr[0] || "";
  if(!d) return { miss:"", want:"", got:"", extra:"" };
  const sub=d.subs.find(x=>x.near) || d.subs.slice().sort((x,y)=>y.want.length-x.want.length)[0] || (typed && d.acc[0]) || null;
  return { miss:long(d.missing), want:sub?sub.want:"", got:sub?sub.got:"", extra:long(d.extras) };
}
const roastFill = (t, v) => String(t).replace(/\{(\w+)\}/g, (m,k)=> v[k]!=null && v[k]!=="" ? v[k] : m);
function roastNote(scores){
  const avg=scores.length ? scores.reduce((x,y)=>x+y,0)/scores.length : 0, raw=Math.round(avg*20);
  return { raw, note:Math.min(19, raw) };   // 20 is for God, as French teachers say
}

/* ---------- Voices ---------- */
const FEM = /denise|eloise|éloïse|hortense|julie|am[eé]lie|audrey|marie|c[eé]line|virginie|aur[eé]lie|charlotte|\bl[eé]a\b|chantal|sylvie|vivienne|brigitte|coralie|jacqueline|yvette|ariane|raquel|fernanda|joana|catarina|female|femme|woman|x-fr[ac]-/i;   // fr-fr-x-fra/frc: Google's female French voices on Android
const MASC = /henri|\bpaul\b|thomas|r[eé]mi|claude|gilles|antoine|nicolas|daniel|j[eé]r[oô]me|alain|guillaume|fabrice|\bjean\b|maxime|\byves\b|mathieu|duarte|\bmale\b|homme|\bman\b|x-fr[bd]-/i;
const vLang = v => String((v&&v.lang)||"").replace("_","-").toLowerCase();
function voiceQuality(v, want){
  const n=(v.name||"")+" "+(v.voiceURI||""), l=vLang(v);
  let s=0;
  if(l===want) s+=50; else if(l.slice(0,2)===want.slice(0,2)) s += want==="fr-fr" ? (/^fr-(be|ch)/.test(l)?30:15) : 10;
  if(/natural|neural|online|premium|enhanced|wavenet|studio/i.test(n)) s+=20;
  if(/google/i.test(n)) s+=12;
  if(/compact|espeak|robot|eloquence/i.test(n)) s-=30;
  if(v.default) s+=2;
  return s;
}
const Voice = {
  ok: typeof window.speechSynthesis!=="undefined" && typeof window.SpeechSynthesisUtterance==="function",
  all:[], fr:[], pt:[], loaded:false, keep:[], subs:new Set(),
  prefs:{ A:"auto", N:"auto", C:"auto", P:"auto" },
  pick:{ A:null, N:null, C:null, P:null }, pitch:{ A:1, N:1, C:1 },
  init(){
    if(!this.ok){ this.loaded=true; return Promise.resolve(); }
    return new Promise(res=>{
      let settled=false; const settle=()=>{ if(settled) return; settled=true; this.loaded=true; res(); this.emit(); };
      const take=()=>{ let v=[]; try{ v=window.speechSynthesis.getVoices()||[]; }catch(e){} if(v.length){ this.set(v); return true; } return false; };
      if(take()) settle();
      const on=()=>{ if(take()){ settle(); this.emit(); } };
      try{ window.speechSynthesis.addEventListener("voiceschanged", on); }catch(e){ window.speechSynthesis.onvoiceschanged=on; }
      setTimeout(()=>{ take(); settle(); }, 2600);
    });
  },
  on(f){ this.subs.add(f); }, emit(){ this.subs.forEach(f=>{ try{ f(); }catch(e){} }); },
  set(list){
    this.all=list.slice();
    this.fr=this.all.filter(v=>vLang(v).startsWith("fr")).sort((a,b)=>voiceQuality(b,"fr-fr")-voiceQuality(a,"fr-fr"));
    this.pt=this.all.filter(v=>vLang(v).startsWith("pt")).sort((a,b)=>voiceQuality(b,"pt-pt")-voiceQuality(a,"pt-pt"));
    this.assign();
  },
  byId(id){ return id && id!=="auto" && id!=="off" ? (this.all.find(v=>v.voiceURI===id) || this.all.find(v=>v.name===id) || null) : null; },
  assign(){
    const fr=this.fr, best=fr[0]||null;
    const id=v=>(v.name||"")+" "+(v.voiceURI||""), fem=fr.filter(v=>FEM.test(id(v)) && !MASC.test(id(v))), masc=fr.filter(v=>MASC.test(id(v)) && !FEM.test(id(v)));
    // you (N) and the site manager (C) are men, the interlocutor (A) a woman; unknown voices fill the gaps
    const N=this.byId(this.prefs.N) || masc[0] || fr.find(v=>!fem.includes(v)) || best;
    const A=this.byId(this.prefs.A) || fem[0] || fr.find(v=>v!==N && !masc.includes(v)) || fr.find(v=>v!==N) || best;
    const C=this.byId(this.prefs.C) || masc.find(v=>v!==N) || fr.find(v=>v!==N && v!==A && !fem.includes(v)) || N;
    this.pick.A=A; this.pick.N=N; this.pick.C=C;
    // one voice for several speakers: tell them apart by pitch
    this.pitch={ A:1, N:1, C:1 };
    if(A && A===N){ this.pitch.A=1.12; this.pitch.N=0.9; }
    if(C && (C===N || C===A)) this.pitch.C=0.8;
    this.pick.P = this.prefs.P==="off" ? null : (this.byId(this.prefs.P) || this.pt[0] || null);
  },
  // "ok": French voices listed · "blind": the browser lists no voices at all, so we speak by language and hope · "missing" · "none"
  get frStatus(){ return !this.ok ? "none" : this.fr.length ? "ok" : this.all.length ? "missing" : "blind"; },
  get narratorOn(){ return this.ok && this.prefs.P!=="off" && (!!this.pick.P || (this.all.length===0 && this.loaded)); },
  get narratorBR(){ return !!this.pick.P && vLang(this.pick.P)==="pt-br"; },
  speak(text, o){
    o=o||{};
    return new Promise(resolve=>{
      if(!this.ok || !text){ resolve({ ok:false, err:"unsupported" }); return; }
      const synth=window.speechSynthesis;
      const u=new SpeechSynthesisUtterance(text);
      u.lang = o.voice && o.voice.lang ? o.voice.lang.replace("_","-") : (o.lang||"fr-FR");
      if(o.voice) u.voice=o.voice;
      u.rate=o.rate||1; u.pitch=o.pitch||1; u.volume=1;
      let done=false, started=false;
      const est=speechSec(text, u.lang, u.rate);
      const finish=(ok, err)=>{ if(done) return; done=true; clearTimeout(wd); clearTimeout(ns); const k=this.keep.indexOf(u); if(k>=0) this.keep.splice(k,1); resolve({ ok, err:err||null, started }); };
      u.onstart=()=>{ started=true; };
      u.onend=()=>finish(true);
      u.onerror=e=>finish(false, (e && e.error) || "error");
      // onend is unreliable on some phones: never wait forever
      const wd=setTimeout(()=>finish(true,"watchdog"), (est*2+3)*1000);
      const ns=setTimeout(()=>{ if(!started && !synth.speaking) finish(false,"nostart"); }, 6000);
      this.keep.push(u);   // keeps the utterance alive until it ends (Chrome may drop it otherwise)
      try{ if(synth.paused) synth.resume(); synth.speak(u); }catch(e){ finish(false,"speak"); }
    });
  },
  stop(){ if(!this.ok) return; try{ window.speechSynthesis.cancel(); }catch(e){} },
  busy(){ try{ return this.ok && (window.speechSynthesis.speaking || window.speechSynthesis.pending); }catch(e){ return false; } }
};

/* ---------- Lesson script (Pimsleur-style) ----------
   Steps: {t:"phase",p} · {t:"pt",text,card,cue?} narrator · {t:"fr",who,text,slow?,card?} · {t:"wait",k,ans,sec} · {t:"gap",sec}
   Every step carries u (unit: the block that Voltar/Saltar move by) and ph (phase).                                   */
const PHASES = [
  { id:"dialogue", fr:"Dialogue", pt:"Diálogo" },
  { id:"vocab", fr:"Vocabulaire", pt:"Vocabulário" },
  { id:"practice", fr:"Pratique", pt:"Prática" },
  { id:"role", fr:"Conversation", pt:"Conversa" },
  { id:"end", fr:"Fin", pt:"Fim" }
];
const COACH = "Como funciona: eu digo-te o que queres dizer, em português. Tu respondes em francês, em voz alta, antes de ouvires a resposta certa. Depois repetes. Falar em voz alta é o que fixa a língua.";
const LEADS = {
  neu: ["Repara como se diz:", "Ouve como se diz:", "E agora:"],
  recall: [["Como se diz","?"], ["Lembras-te? Como se diz","?"], ["Diz em francês:",""], ["Agora em francês:",""]],
  drill: ["Como dirias:", "Tenta dizer:", "Diz em francês:"],
  review: ["De uma lição anterior:", "Ainda te lembras?", "Lembras-te desta?"]
};
function waitSec(k, ans, f){
  const n=frSpeech(ans).length;
  const base = k==="answer" ? clamp(2.2+0.07*n, 3, 9) : k==="role" ? clamp(3+0.08*n, 4, 12) : clamp(1.2+0.055*n, 2, 6);
  return Math.round(base*(f||1.3)*10)/10;
}
// “phrase” for the narrator: Portuguese quotes are display-only, French stays in «»
const qpt = t => "“"+String(t).replace(/[.!]$/,"")+"”";
function lessonItems(L){ return L.items.map((it,k)=>({ id:L.id+":i"+k, lesson:L.id, fr:it[0], pt:it[1], build:it[2]||null })); }

function buildLesson(L, ctx){
  ctx=ctx||{};
  const pf=ctx.pause||1.3, rnd=seeded(hashStr(L.id+"·"+(ctx.seed||0)));
  const pick=a=>a[Math.floor(rnd()*a.length)];
  const S=[]; let u=0, ph="intro";
  const add=st=>{ st.u=u; st.ph=ph; S.push(st); return st; };
  const unit=()=>{ u++; };
  const say=(text, card, extra)=>add(Object.assign({ t:"pt", text, card:card||null }, extra||{}));
  const fr=(who, text, extra)=>add(Object.assign({ t:"fr", who, text }, extra||{}));
  const wait=(k, ans, mul)=>add({ t:"wait", k, ans, sec:Math.round(waitSec(k, ans, pf)*(mul||1)*10)/10 });
  const phase=p=>{ unit(); ph=p; add({ t:"phase", p }); };
  const W=(lead, phrase, end)=>{ const q=qpt(phrase); return lead+" "+q+(/[?!…]”$/.test(q) ? "" : (end||"")); };
  const dialogue=()=>L.dialogue.forEach((d,j)=>{ unit(); fr(d[0], d[1], { card:{ kind:"line", who:d[0], fr:d[1], pt:d[2], j } }); add({ t:"gap", sec:0.45 }); });
  const items=lessonItems(L);

  // intro + first listening
  unit();
  say(`Lição ${L.n}: ${L.pt}.`, { kind:"title" });
  say(L.situation, { kind:"say", text:L.situation });
  if(ctx.first) say(COACH, { kind:"say", text:COACH });
  say("Ouve a conversa. Não precisas de perceber tudo.", { kind:"say", text:"Ouve a conversa. Não precisas de perceber tudo." });
  phase("dialogue"); dialogue();

  // new phrases, with graduated recall of the earlier ones
  phase("vocab"); say("Agora, vamos por partes.", { kind:"say", text:"Agora, vamos por partes." });
  const queue=[]; let built=false;
  const recall=(it)=>{
    unit(); const [lead,end]=pick(LEADS.recall);
    say(W(lead, it.pt, end), { kind:"recall", label:lead.replace(/[:?]$/,""), pt:it.pt, fr:it.fr, item:it.id });
    wait("answer", it.fr); fr("N", it.fr, { reveal:true }); wait("repeat", it.fr, 0.8);
  };
  const flush=(k, max)=>{
    queue.sort((a,b)=>a.at-b.at || a.k-b.k);
    let n=0; for(let i=0;i<queue.length && n<max;){ if(queue[i].at<=k){ recall(queue[i].it); queue.splice(i,1); n++; } else i++; }
  };
  items.forEach((it,k)=>{
    unit();
    const lead = k===0 ? LEADS.neu[0] : pick(LEADS.neu);
    say(W(lead, it.pt, "."), { kind:"new", label:lead.replace(/:$/,""), pt:it.pt, fr:it.fr, item:it.id });
    fr("N", it.fr, { reveal:true });
    if(k<2) say("Repete.", null, { cue:true });
    wait("repeat", it.fr);
    if(it.build && it.build.length>1){
      say(built ? "Por partes." : "Agora por partes, a começar pelo fim.", null, { cue:true }); built=true;
      it.build.slice(0,-1).forEach(c=>{ fr("N", c, { slow:true, part:c }); wait("repeat", c); });
      say("A frase toda.", null, { cue:true });
    }
    fr("N", it.fr, { reveal:true }); wait("repeat", it.fr);
    queue.push({ it, k, at:k+1 }, { it, k, at:k+3 }, { it, k, at:k+6 });
    flush(k, 2);
  });
  // last phrases get their recall before moving on
  const seen=new Set(); queue.sort((a,b)=>a.k-b.k).forEach(q=>{ if(seen.has(q.it.id) || seen.size>=6) return; seen.add(q.it.id); recall(q.it); });

  // anticipation drills, interleaved with phrases from earlier lessons
  phase("practice"); say("Agora, frases novas com o que já sabes. Tenta sempre antes de ouvires a resposta.", { kind:"say", text:"Frases novas com o que já sabes. Tenta sempre antes de ouvires a resposta." });
  const drills=L.drills.map(d=>({ pt:d[0], fr:d[1] })), prev=(ctx.prev||[]).slice(0,6), mixed=[];
  for(let i=0;i<Math.max(drills.length, prev.length);i++){ if(drills[i]) mixed.push([drills[i],false]); if(prev[i]) mixed.push([prev[i],true]); }
  mixed.forEach(([d,old])=>{
    unit(); const lead=pick(old ? LEADS.review : LEADS.drill);
    say(W(lead, d.pt, ""), { kind:old?"review":"drill", label:lead.replace(/[:?]$/,""), pt:d.pt, fr:d.fr, item:d.id||null });
    wait("answer", d.fr); fr("N", d.fr, { reveal:true }); wait("repeat", d.fr, 0.8);
  });

  // role-play: they speak, the narrator says what to answer, you answer
  phase("role");
  const ri="Agora a conversa é contigo. Ouves a outra pessoa, eu digo-te o que responder, e tu respondes em francês.";
  say(ri, { kind:"say", text:ri });
  L.roles.forEach(r=>{
    unit();
    const card={ kind:"role", who:L.cue, cue:r[0], task:r[1], fr:r[2] };
    fr(L.cue, r[0], { card }); say(r[1], null, { task:true }); wait("role", r[2]); fr("N", r[2], { reveal:true }); wait("repeat", r[2], 0.8);
  });

  // the dialogue again, the notes, and the 80% rule
  phase("end");
  const ei="Para terminar, ouve outra vez a conversa do início. Agora já deves perceber quase tudo.";
  say(ei, { kind:"say", text:ei });
  dialogue();
  unit(); say(L.notes.length===1 ? "Uma nota para levares desta lição." : "Duas notas para levares desta lição.", { kind:"say", text:"Notas da lição" });
  L.notes.forEach((n,j)=>{ unit(); say(n, { kind:"note", text:n, j }); });
  unit();
  const last = L.n===LESSONS.length;
  const out = last
    ? `Fim da lição ${L.n}, e fim do curso. A partir de agora, a revisão diária mantém tudo fresco. Bom trabalho.`
    : `Fim da lição ${L.n}. Se acertaste em pelo menos oito de cada dez respostas, estás pronto para a seguinte. Se não, repete esta lição amanhã: é assim que o método funciona.`;
  say(out, { kind:"end", text:out });
  return finalizeScript(S, ctx);
}
// a short script that only plays the dialogue
function buildDialogue(L, ctx){
  const S=[]; let u=0;
  L.dialogue.forEach((d,j)=>{ u++; S.push({ t:"fr", who:d[0], text:d[1], card:{ kind:"line", who:d[0], fr:d[1], pt:d[2], j }, u, ph:"dialogue" }); S.push({ t:"gap", sec:0.45, u, ph:"dialogue" }); });
  return finalizeScript(S, ctx);
}
function stepSec(st, ctx){
  const rate=(ctx&&ctx.rate)||0.92, narr=!!(ctx&&ctx.narrator);
  if(st.t==="fr") return speechSec(frSpeech(st.text),"fr",rate*(st.slow?0.8:1));
  if(st.t==="pt") return narr ? speechParts(st.text).reduce((s,p)=>s+speechSec(p.text,p.lang,p.lang==="fr"?rate:1)+0.15,0) : (st.cue ? 0 : readSec(st.text));
  if(st.t==="wait" || st.t==="gap") return st.sec;
  return 0;
}
function finalizeScript(S, ctx){
  const starts={}; S.forEach((st,i)=>{ if(starts[st.u]==null) starts[st.u]=i; });
  const est=S.map(st=>stepSec(st, ctx)), acc=[0]; est.forEach(e=>acc.push(acc[acc.length-1]+e));
  return { steps:S, starts, est, acc, total:acc[acc.length-1], spoken:S.filter(s=>s.t==="wait").length, phases:PHASES.filter(p=>S.some(s=>s.ph===p.id)).map(p=>p.id) };
}

/* ---------- Spaced review (Leitner boxes) ---------- */
const BOX_DAYS = [0, 1, 3, 7, 16, 35];
const ITEM_BY_ID = {};
LESSONS.forEach(L=>lessonItems(L).forEach(it=>{ ITEM_BY_ID[it.id]=it; }));
function srsAddLesson(srs, L, today){ lessonItems(L).forEach(it=>{ if(!srs[it.id]) srs[it.id]={ b:1, due:addDays(today,1), n:0 }; }); }
function srsGrade(srs, id, g, today, practice){
  const it=srs[id] || (srs[id]={ b:1, due:addDays(today,1), n:0 });
  if(g===2){ if(!practice){ it.b=Math.min(5, it.b+1); it.due=addDays(today, BOX_DAYS[it.b]); } }
  else if(g===1){ if(!practice) it.due=addDays(today, 1); }
  else { it.b=1; it.due=addDays(today, 1); }
  it.n=(it.n||0)+1; it.last=today;
  return it;
}
function srsDue(srs, today){
  return Object.keys(srs).filter(id=>ITEM_BY_ID[id] && srs[id].due<=today).sort((a,b)=>srs[a].due<srs[b].due?-1:srs[a].due>srs[b].due?1:(srs[a].b-srs[b].b) || (a<b?-1:1));
}
function srsNext(srs, today){
  let best=null, n=0;
  Object.keys(srs).forEach(id=>{ const d=srs[id].due; if(d>today && (!best || d<best)) best=d; });
  if(best) Object.keys(srs).forEach(id=>{ if(srs[id].due===best) n++; });
  return best ? { day:best, n } : null;
}
// phrases from earlier lessons for the practice block: due ones first, then the previous lesson
function prevForLesson(L, srs, today, seed){
  const own=L.id+":", out=[];
  srsDue(srs, today).forEach(id=>{ if(out.length<4 && !id.startsWith(own) && keyOf(id)<L.n) out.push(ITEM_BY_ID[id]); });
  const P=LESSONS.find(x=>x.n===L.n-1);
  if(P){ const rnd=seeded(hashStr(L.id+(seed||""))); const pool=lessonItems(P).filter(it=>!out.some(o=>o.id===it.id)); while(out.length<6 && pool.length) out.push(pool.splice(Math.floor(rnd()*pool.length),1)[0]); }
  return out;
}
function keyOf(id){ const L=LESSONS.find(x=>id.startsWith(x.id+":")); return L ? L.n : 0; }

/* ---------- Practice stats ---------- */
function streak(days, today){
  let k = days[today] ? today : addDays(today,-1), n=0;
  while(days[k]){ n++; k=addDays(k,-1); }
  return n;
}
const fmtN = (v,dec=0)=> !fin(v) ? "—" : Number(v).toLocaleString("pt-PT",{ minimumFractionDigits:dec, maximumFractionDigits:dec });
function fmtDur(sec){ sec=Math.max(0, Math.round(sec||0)); if(sec<30) return "< 1 min"; const h=Math.floor(sec/3600), m=Math.round((sec%3600)/60); return h ? `${h} h ${String(m).padStart(2,"0")}` : `${Math.max(1,m)} min`; }
const FR_DAYS=["dimanche","lundi","mardi","mercredi","jeudi","vendredi","samedi"], FR_MONTHS=["janvier","février","mars","avril","mai","juin","juillet","août","septembre","octobre","novembre","décembre"];
const PT_MONTHS=["jan","fev","mar","abr","mai","jun","jul","ago","set","out","nov","dez"];
function frDate(ts){ const d=new Date(ts==null?Date.now():ts); return `${FR_DAYS[d.getDay()]} ${d.getDate()===1?"1er":d.getDate()} ${FR_MONTHS[d.getMonth()]}`; }
function ptShort(k){ const d=keyDate(k); return d.getDate()+" "+PT_MONTHS[d.getMonth()]; }
