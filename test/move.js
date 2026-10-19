// Moving Calepin from estudio-veio/francais/ to its own address, on a phone that already used the first one.
const { chromium } = require('/opt/npm-tools/node_modules/playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const DEPLOY = '/home/claude/estudio-veio', NEW = path.join(__dirname, '..', 'site'), OLDKIT = path.join(__dirname, '..', 'old-address');
let phase = 'before', offline = false;
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.webmanifest': 'application/manifest+json', '.png': 'image/png' };
function resolve(u) {
  if (u.startsWith('/Calepin/')) return phase === 'after' ? path.join(NEW, u.slice(9) || 'index.html') : null;
  if (u.startsWith('/estudio-veio/francais/')) {
    let rel = u.slice('/estudio-veio/francais/'.length) || 'index.html';
    if (phase === 'after' && (rel === 'index.html' || rel === 'sw.js')) return path.join(OLDKIT, rel);
    return path.join(DEPLOY, 'francais', rel);
  }
  if (u.startsWith('/estudio-veio/')) return path.join(DEPLOY, u.slice(14) || 'index.html');
  return null;
}
const srv = http.createServer((req, res) => {
  if (offline) { req.socket.destroy(); return; }
  let u = decodeURIComponent(req.url.split('?')[0]); if (u.endsWith('/')) u += 'index.html';
  const f = resolve(u);
  if (!f) { res.writeHead(404); res.end('nf'); return; }
  fs.readFile(f, (err, data) => {
    if (err) { res.writeHead(404); res.end('nf'); return; }
    if (f.startsWith(OLDKIT)) data = Buffer.from(data.toString('utf8').split('https://nunoreismtn-eng.github.io/Calepin/').join('http://127.0.0.1:8771/Calepin/'));   // same logic, local address
    res.writeHead(200, { 'content-type': types[path.extname(f)] || 'application/octet-stream', 'cache-control': 'no-cache' }); res.end(data);
  });
});
const log = (...a) => console.log(...a);
(async () => {
  await new Promise(r => srv.listen(8771, '127.0.0.1', r));
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ serviceWorkers: 'allow', viewport: { width: 400, height: 800 } });
  await ctx.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  const page = await ctx.newPage(); const errors = []; page.on('pageerror', e => errors.push(e.message));
  const H = 'http://127.0.0.1:8771';
  // before: both apps used, with some progress in Calepin
  await page.goto(H + '/estudio-veio/'); await page.evaluate(() => navigator.serviceWorker.ready);
  await page.goto(H + '/estudio-veio/francais/'); await page.evaluate(() => navigator.serviceWorker.ready); await page.waitForTimeout(500);
  await page.evaluate(() => { localStorage.setItem('calepin:settings', JSON.stringify({ onboarded: true, name: 'Rui' })); localStorage.setItem('calepin:progress', JSON.stringify({ lessons: { l01: { n: 1, first: '2026-10-19', last: '2026-10-19', ok: true } }, srs: {}, days: { '2026-10-19': 600 }, history: [] })); });
  log('BEFORE caches', JSON.stringify(await page.evaluate(() => caches.keys())));
  // after the move: the old link
  phase = 'after';
  await page.goto(H + '/estudio-veio/francais/'); await page.waitForURL(/\/calepin\//i, { timeout: 15000 }); await page.waitForTimeout(1500);
  log('OLD LINK ->', page.url(), '| title', await page.title(), '| h1', await page.locator('h1').innerText().catch(() => '-'), '| welcome', await page.locator('.wel-title').count());
  log('HERO', await page.locator('.hero .fr-title').innerText().catch(() => '-'));
  await page.evaluate(() => navigator.serviceWorker.ready); await page.waitForTimeout(1000);
  log('REGISTRATIONS', JSON.stringify(await page.evaluate(async () => (await navigator.serviceWorker.getRegistrations()).map(r => r.scope))));
  log('CACHES', JSON.stringify(await page.evaluate(() => caches.keys())));
  await page.reload(); await page.waitForTimeout(600);
  log('CONTROLLER', await page.evaluate(() => navigator.serviceWorker.controller && navigator.serviceWorker.controller.scriptURL));
  // the old link once more (old worker gone): still lands on the new address
  await page.goto(H + '/estudio-veio/francais/'); await page.waitForURL(/\/calepin\//i, { timeout: 15000 });
  log('OLD LINK again ->', page.url());
  // offline
  offline = true; await ctx.setOffline(true);
  await page.goto(H + '/Calepin/').catch(e => log('nav err', e.message)); await page.waitForTimeout(500);
  log('OFFLINE calepin', await page.title(), '| h1', await page.locator('h1').innerText().catch(() => '-'));
  log('ESTUDIO cached page', await page.evaluate(async () => { const r = await caches.match('/estudio-veio/'); return r ? r.status : 'none'; }),
      '| estudio worker', await page.evaluate(async () => { const r = await navigator.serviceWorker.getRegistration('/estudio-veio/'); return r ? [r.scope, r.active && r.active.state] : 'none'; }));
  await page.goto(H + '/estudio-veio/').catch(e => log('nav err', e.message.split('\n')[0])); await page.waitForTimeout(500);
  log('OFFLINE estudio (1st try)', await page.title());
  if (!(await page.title())) { await page.goto(H + '/estudio-veio/').catch(e => log('nav err', e.message.split('\n')[0])); await page.waitForTimeout(500); log('OFFLINE estudio (2nd try)', await page.title()); }
  log('ERRORS', JSON.stringify(errors));
  await browser.close(); srv.close();
})().catch(e => { console.error('FAIL', e); process.exit(1); });
