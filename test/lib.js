// Test helpers: a local server for site/ under /estudio-veio/francais/, local copies of the Google fonts,
// and mocks for speechSynthesis and SpeechRecognition (no audio in the sandbox).
const http = require('http'), fs = require('fs'), path = require('path');
const SITE = path.join(__dirname, '..', 'site');
const FONTS = '/home/claude/fonttest/node_modules/@fontsource/';
const BASE = '/Calepin/';

function serve(port) {
  const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.png': 'image/png' };
  const srv = http.createServer((req, res) => {
    let u = decodeURIComponent(req.url.split('?')[0]);
    if (!u.startsWith(BASE)) { res.writeHead(404); res.end('nf'); return; }
    let f = path.join(SITE, u.slice(BASE.length)); if (u.endsWith('/')) f = path.join(f, 'index.html');
    fs.readFile(f, (err, data) => {
      if (err) { res.writeHead(404); res.end('nf'); return; }
      res.writeHead(200, { 'content-type': types[path.extname(f)] || 'application/octet-stream', 'cache-control': 'no-cache' }); res.end(data);
    });
  });
  return new Promise(r => srv.listen(port, '127.0.0.1', () => r(srv)));
}

const FACES = [
  ['EB Garamond', 'eb-garamond', [[400, 'normal'], [500, 'normal'], [400, 'italic'], [500, 'italic']]],
  ['IBM Plex Mono', 'ibm-plex-mono', [[400, 'normal'], [500, 'normal']]],
  ['Marcellus', 'marcellus', [[400, 'normal']]],
  ['Schibsted Grotesk', 'schibsted-grotesk', [[400, 'normal'], [500, 'normal'], [600, 'normal'], [700, 'normal']]]
];
const RANGES = {
  latin: 'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD',
  'latin-ext': 'U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF'
};
const FONT_CSS = FACES.flatMap(([fam, slug, list]) => list.flatMap(([w, st]) => Object.keys(RANGES).map(sub =>
  `@font-face{font-family:'${fam}';font-style:${st};font-weight:${w};font-display:swap;src:url(https://fonts.gstatic.com/local/${slug}/${slug}-${sub}-${w}-${st}.woff2) format('woff2');unicode-range:${RANGES[sub]}}`))).join('\n');
async function fonts(ctx) {
  await ctx.route('https://fonts.googleapis.com/**', r => r.fulfill({ status: 200, contentType: 'text/css', body: FONT_CSS, headers: { 'access-control-allow-origin': '*' } }));
  await ctx.route('https://fonts.gstatic.com/local/**', r => {
    const rest = r.request().url().split('/local/')[1], [slug, file] = rest.split('/');
    r.fulfill({ path: path.join(FONTS, slug, 'files', file), contentType: 'font/woff2', headers: { 'access-control-allow-origin': '*' } });
  });
}

// speechSynthesis: logs what is said; each utterance "plays" for __ttsMs ms
function speechMock(opts) {
  opts = opts || {};
  return `(() => {
    const voices = ${JSON.stringify(opts.voices || [
      { name: 'Microsoft Henri Online (Natural) - French (France)', lang: 'fr-FR', voiceURI: 'henri', localService: false, default: false },
      { name: 'Google français', lang: 'fr-FR', voiceURI: 'google-fr', localService: false, default: false },
      { name: 'Google português (Portugal)', lang: 'pt-PT', voiceURI: 'pt-pt', localService: true, default: false },
      { name: 'Google UK English Female', lang: 'en-GB', voiceURI: 'en-gb', localService: false, default: true }
    ])};
    window.__spoken = []; window.__ttsMs = ${opts.ttsMs || 20};
    class Utt { constructor(t){ this.text=t; this.lang=''; this.voice=null; this.rate=1; this.pitch=1; this.volume=1; this.onstart=null; this.onend=null; this.onerror=null; } }
    const synth = {
      speaking:false, pending:false, paused:false, _cur:null,
      getVoices(){ return ${opts.lateVoices ? 'window.__voicesReady ? voices : []' : 'voices'}; },
      speak(u){
        if(window.__failFr && /^fr/.test(u.lang)){ setTimeout(()=>u.onerror && u.onerror({ error:'synthesis-failed' }), 5); return; }
        this.speaking=true; window.__spoken.push({ text:u.text, lang:u.lang, voice:u.voice && u.voice.name, rate:u.rate, pitch:u.pitch });
        const t1=setTimeout(()=>{ u.onstart && u.onstart({}); }, 3), t2=setTimeout(()=>{ this.speaking=false; this._cur=null; u.onend && u.onend({}); }, window.__ttsMs);
        this._cur={ u, t1, t2 };
      },
      cancel(){ if(this._cur){ clearTimeout(this._cur.t1); clearTimeout(this._cur.t2); const u=this._cur.u; this._cur=null; this.speaking=false; u.onerror && u.onerror({ error:'interrupted' }); } },
      pause(){}, resume(){},
      _l:[], addEventListener(t,f){ this._l.push(f); }, removeEventListener(){}
    };
    window.__fireVoices = () => { window.__voicesReady=true; synth._l.forEach(f=>f()); };
    Object.defineProperty(window, 'speechSynthesis', { value: synth, configurable: true });
    window.SpeechSynthesisUtterance = Utt;
    class Rec { constructor(){ this.lang=''; }
      start(){ window.__recStarted=(window.__recStarted||0)+1; setTimeout(()=>{ const txt=window.__heard || 'je voudrais parler à madame moreau'; this.onresult && this.onresult({ results:[ Object.assign([{ transcript:txt }], { isFinal:true }) ] }); this.onend && this.onend(); }, 40); }
      stop(){} abort(){} }
    window.webkitSpeechRecognition = Rec; window.SpeechRecognition = Rec;
  })();`;
}
const ANDROID_UA = 'Mozilla/5.0 (Linux; Android 15; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36';
module.exports = { serve, fonts, speechMock, ANDROID_UA, BASE };
