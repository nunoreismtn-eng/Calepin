#!/usr/bin/env python3
"""Build Calepin from src/: the Claude artifact page (private defaults) and the public site for GitHub Pages."""
import json, pathlib, math, hashlib
from PIL import Image, ImageDraw

ROOT = pathlib.Path(__file__).parent
SRC = ROOT / "src"
DIST = ROOT / "dist"
SITE = ROOT / "site"
SCRATCH = pathlib.Path("/tmp/claude-0/-home-claude/2ce96e16-f172-537e-a0ea-1e8a59815d44/scratchpad")  # artifact source, when it exists
DIST.mkdir(exist_ok=True); SITE.mkdir(exist_ok=True)
# personal defaults (name, company) live only in private.json, which is git-ignored
PRIVATE = json.loads((ROOT / "private.json").read_text(encoding="utf-8")) if (ROOT / "private.json").exists() else {}

css = (SRC / "styles.css").read_text(encoding="utf-8")
body_js = "\n".join((SRC / f).read_text(encoding="utf-8") for f in ["content.js", "engine.js", "app.js"])
shell = (SRC / "shell.html").read_text(encoding="utf-8")
assert "</style" not in css.lower()

PAGES_URL = "https://nunoreismtn-eng.github.io/estudio-veio/francais/"

def page(public):
    build = {"public": public, "appUrl": "" if public else PAGES_URL, "defaults": {} if public else PRIVATE}
    js = '(() => {\n"use strict";\nconst BUILD = ' + json.dumps(build, ensure_ascii=False) + ';\n' + body_js + '\n})();'
    if public:
        leaked = [v for v in PRIVATE.values() if v and v.lower() in js.lower()]
        assert not leaked, "personal data left in the public build: %s" % leaked
    assert "</script" not in js.lower()
    return shell.replace("/*CSS*/", css).replace("/*JS*/", js), js

RESET = ('<style>:root{color-scheme:light}body{margin:0}img{max-width:100%}[hidden]{display:none!important}</style>')
def standalone(html, extra_head=""):
    head, body = html.split("<!--HEAD-END-->")
    return ('<!doctype html>\n<html lang="pt-PT">\n<head>\n<meta charset="utf-8">\n'
            '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover,interactive-widget=resizes-content">\n'
            '<meta name="theme-color" content="#EDEFEE" media="(prefers-color-scheme: light)">\n'
            '<meta name="theme-color" content="#0E1315" media="(prefers-color-scheme: dark)">\n'
            '<meta name="mobile-web-app-capable" content="yes">\n'
            '<meta name="apple-mobile-web-app-capable" content="yes">\n'
            '<meta name="apple-mobile-web-app-status-bar-style" content="default">\n'
            '<meta name="apple-mobile-web-app-title" content="Calepin">\n'
            + extra_head + RESET + "\n" + head.strip() + "\n</head>\n<body>\n" + body.strip() + "\n</body>\n</html>\n")

# 1) Claude artifact (private defaults, links to the phone app)
art, js_private = page(False)
if SCRATCH.exists(): (SCRATCH / "calepin.html").write_text(art, encoding="utf-8")
(DIST / "calepin.html").write_text(art, encoding="utf-8")
(DIST / "calepin-local.html").write_text(standalone(art), encoding="utf-8")   # for local tests of the private build
# 2) public site: no personal defaults, not indexed, installable
pub, js_public = page(True)
extra = ('<meta name="robots" content="noindex, nofollow">\n'
         '<link rel="manifest" href="manifest.webmanifest">\n'
         '<link rel="apple-touch-icon" href="apple-touch-icon.png">\n'
         '<link rel="icon" type="image/png" sizes="192x192" href="icon-192.png">\n')
(SITE / "index.html").write_text(standalone(pub, extra), encoding="utf-8")
(SITE / "manifest.webmanifest").write_text(json.dumps({
    "id": "./", "name": "Calepin · Français de la pierre", "short_name": "Calepin", "lang": "pt-PT",
    "description": "Francês profissional para a pedra natural, ao estilo Pimsleur.",
    "start_url": "./", "scope": "./", "display": "standalone", "orientation": "portrait",
    "background_color": "#EDEFEE", "theme_color": "#162023",
    "icons": [{"src": "icon-192.png", "sizes": "192x192", "type": "image/png"},
              {"src": "icon-512.png", "sizes": "512x512", "type": "image/png"},
              {"src": "icon-maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable"}]
}, ensure_ascii=False, indent=2), encoding="utf-8")

# icons: the mark (guillemets as the arrows of a dimension line) on slate
def stroke(d, pts, w, fill):
    r = w/2
    for (x0, y0), (x1, y1) in zip(pts, pts[1:]):
        n = max(1, int(math.hypot(x1-x0, y1-y0)/(r*0.3)))
        for i in range(n+1):
            x = x0 + (x1-x0)*i/n; y = y0 + (y1-y0)*i/n
            d.ellipse([x-r, y-r, x+r, y+r], fill=fill)
def icon(size, maskable=False, radius_frac=0.22):
    S = 4; W = size*S
    img = Image.new("RGBA", (W, W), (0, 0, 0, 0)); d = ImageDraw.Draw(img)
    bg = (22, 32, 35, 255)
    if maskable: d.rectangle([0, 0, W, W], fill=bg); scale = 0.60
    else: d.rounded_rectangle([0, 0, W-1, W-1], radius=int(W*radius_frac), fill=bg); scale = 0.80
    off = W*(1-scale)/2; k = W*scale/32
    P = lambda x, y: (off + x*k, off + y*k)
    stone = (236, 240, 239, 255); verd = (98, 176, 164, 255)
    for x in (3, 29):
        stroke(d, [P(x, 9.5), P(x, 22.5)], 1.5*k, verd)
    for pts in ([(9.6, 13), (6.6, 16), (9.6, 19)], [(13.6, 13), (10.6, 16), (13.6, 19)],
                [(22.4, 13), (25.4, 16), (22.4, 19)], [(18.4, 13), (21.4, 16), (18.4, 19)]):
        stroke(d, [P(*p) for p in pts], 2.1*k, stone)
    return img.resize((size, size), Image.LANCZOS)
icon(192).save(SITE / "icon-192.png"); icon(512).save(SITE / "icon-512.png")
icon(512, maskable=True).save(SITE / "icon-maskable-512.png")
icon(180, radius_frac=0).save(SITE / "apple-touch-icon.png")

# service worker: opens offline once visited; page network-first so updates arrive on the next open.
# It shares the origin with Estúdio Veio, so it only touches its own pages and its own caches.
SW = r"""// Calepin: works offline once opened. Page network-first (updates arrive on the next open),
// own files cache-first, Google Fonts kept for offline use. Touches only its own scope and caches.
const CACHE = "calepin-__VERSION__", FONTS = "calepin-fonts";
const CORE = ["./", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png", "./icon-maskable-512.png", "./apple-touch-icon.png"];
const SCOPE = new URL(self.registration.scope).pathname;
const OWN = new Set(CORE.map(u => new URL(u, self.registration.scope).pathname));
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE.map(u => new Request(u, { cache: "reload" })))).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith("calepin-") && k !== CACHE && k !== FONTS).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
function page(req) {
  return new Promise(resolve => {
    let done = false;
    const finish = r => { if (!done && r) { done = true; resolve(r); } };
    const cached = () => caches.open(CACHE).then(c => c.match("./"));
    const slow = setTimeout(() => cached().then(finish), 4000);
    fetch(req.url, { cache: "no-cache", credentials: "same-origin" }).then(res => {
      clearTimeout(slow);
      if (res && res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put("./", copy)); }
      finish(res.redirected ? new Response(res.body, { status: res.status, statusText: res.statusText, headers: res.headers }) : res);
    }).catch(() => { clearTimeout(slow); cached().then(hit => finish(hit || Response.error())); });
  });
}
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin === self.location.origin) {
    if (req.mode === "navigate") { if (url.pathname === SCOPE || url.pathname === SCOPE + "index.html") e.respondWith(page(req)); return; }
    if (OWN.has(url.pathname)) e.respondWith(caches.open(CACHE).then(c => c.match(req)).then(hit => hit || fetch(req)));
    return;
  }
  if (url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com") {
    e.respondWith(caches.open(FONTS).then(c => c.match(req).then(hit => {
      const net = fetch(req).then(res => { if (res && (res.ok || res.type === "opaque")) c.put(req, res.clone()); return res; }).catch(() => hit || Response.error());
      return hit || net;
    })));
  }
});
"""
digest = hashlib.sha256()
for f in ["index.html", "manifest.webmanifest", "icon-192.png", "icon-512.png", "icon-maskable-512.png", "apple-touch-icon.png"]:
    digest.update((SITE / f).read_bytes())
(SITE / "sw.js").write_text(SW.replace("__VERSION__", digest.hexdigest()[:10]), encoding="utf-8")
print("artifact", len(art)//1024, "KB · site", (SITE/"index.html").stat().st_size//1024, "KB · sw", digest.hexdigest()[:10])
