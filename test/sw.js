// Service workers side by side: the installed Estúdio Veio (old worker) meets the new deploy with Calepin under /francais/.
const { chromium } = require('/opt/npm-tools/node_modules/playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const OLD = '/home/claude/estudio-veio', NEW_VEIO = '/home/claude/veio/site', CAL = '/home/claude/francais/site';
let mode = 'old', offline = false;
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.webmanifest': 'application/manifest+json', '.png': 'image/png', '.txt': 'text/plain' };
const srv = http.createServer((req, res) => {
  if (offline) { req.socket.destroy(); return; }
  const u = decodeURIComponent(req.url.split('?')[0]);
  let root, rel;
  if (u.startsWith('/estudio-veio/francais/') && mode === 'new') { root = CAL; rel = u.slice('/estudio-veio/francais/'.length); }
  else if (u.startsWith('/estudio-veio/')) { root = mode === 'old' ? OLD : NEW_VEIO; rel = u.slice('/estudio-veio/'.length); }
  else { res.writeHead(404); res.end(); return; }
  if (!rel || rel.endsWith('/')) rel += 'index.html';
  fs.readFile(path.join(root, rel), (err, data) => {
    if (err) { res.writeHead(404); res.end('nf'); return; }
    res.writeHead(200, { 'content-type': types[path.extname(rel)] || 'application/octet-stream', 'cache-control': 'no-cache' }); res.end(data);
  });
});
const log = (...a) => console.log(...a);
(async () => {
  await new Promise(r => srv.listen(8770, '127.0.0.1', r));
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ serviceWorkers: 'allow', viewport: { width: 400, height: 800 } });
  await ctx.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  const page = await ctx.newPage();
  const B = 'http://127.0.0.1:8770/estudio-veio/';
  // 1. Estúdio installed with its old worker
  await page.goto(B); await page.evaluate(() => navigator.serviceWorker.ready); await page.waitForTimeout(800);
  log('OLD controlled', await page.evaluate(() => !!navigator.serviceWorker.controller), '| caches', JSON.stringify(await page.evaluate(() => caches.keys())));
  // 2. deploy: new Estúdio worker + Calepin; open Calepin first
  mode = 'new';
  await page.goto(B + 'francais/?fast=0.05'); await page.waitForTimeout(2500);
  log('CALEPIN title', await page.title(), '| welcome', await page.locator('.wel-title').count());
  await page.evaluate(() => navigator.serviceWorker.ready); await page.waitForTimeout(1500);
  const regs = await page.evaluate(async () => (await navigator.serviceWorker.getRegistrations()).map(r => [r.scope, r.active && r.active.scriptURL]));
  log('REGISTRATIONS', JSON.stringify(regs));
  const keys = await page.evaluate(() => caches.keys()); log('CACHES', JSON.stringify(keys));
  const check = await page.evaluate(async () => {
    const out = {};
    for (const k of await caches.keys()) {
      const c = await caches.open(k);
      for (const u of ['/estudio-veio/', '/estudio-veio/francais/']) { const r = await c.match(u); if (r) { const t = await r.text(); out[k + ' ' + u] = (t.match(/<title>([^<]*)/) || [])[1]; } }
    }
    return out;
  });
  log('PAGES IN CACHES', JSON.stringify(check));
  // 3. reload Calepin: now its own worker controls it
  await page.reload(); await page.waitForTimeout(800);
  log('CALEPIN controller', await page.evaluate(() => navigator.serviceWorker.controller && navigator.serviceWorker.controller.scriptURL));
  // 4. Estúdio still Estúdio
  await page.goto(B); await page.waitForTimeout(800);
  log('ESTUDIO title', await page.title(), '| controller', await page.evaluate(() => navigator.serviceWorker.controller && navigator.serviceWorker.controller.scriptURL));
  // 5. offline: both open from their own caches
  offline = true; await ctx.setOffline(true);
  await page.goto(B + 'francais/').catch(e => log('nav err', e.message)); await page.waitForTimeout(600);
  log('OFFLINE calepin', await page.title(), '| icon', await page.evaluate(async () => { try { const r = await fetch('icon-192.png'); return r.status; } catch (e) { return 'ERR'; } }));
  await page.goto(B).catch(e => log('nav err', e.message)); await page.waitForTimeout(600);
  log('OFFLINE estudio', await page.title());
  await browser.close(); srv.close();
})().catch(e => { console.error('FAIL', e); process.exit(1); });
