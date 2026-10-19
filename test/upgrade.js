// A phone that already opened Calepin (worker that cached the manifest) gets the new version: the new manifest must reach it.
const { chromium } = require('/opt/npm-tools/node_modules/playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const OLD = '/home/claude/calepin', NEW = path.join(__dirname, '..', 'site');
let root = OLD;
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.webmanifest': 'application/manifest+json', '.png': 'image/png' };
const srv = http.createServer((req, res) => {
  let u = decodeURIComponent(req.url.split('?')[0]);
  if (!u.startsWith('/Calepin/')) { res.writeHead(404); res.end(); return; }
  let rel = u.slice(9) || 'index.html';
  fs.readFile(path.join(root, rel), (err, data) => {
    if (err) { res.writeHead(404); res.end('nf'); return; }
    res.writeHead(200, { 'content-type': types[path.extname(rel)] || 'application/octet-stream', 'cache-control': 'no-cache' }); res.end(data);
  });
});
const log = (...a) => console.log(...a);
(async () => {
  await new Promise(r => srv.listen(8772, '127.0.0.1', r));
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ serviceWorkers: 'allow', viewport: { width: 400, height: 800 } });
  await ctx.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  await ctx.addInitScript(`localStorage.setItem('calepin:settings', JSON.stringify({ onboarded:true }));`);
  const page = await ctx.newPage(); const errors = []; page.on('pageerror', e => errors.push(e.message));
  const U = 'http://127.0.0.1:8772/Calepin/';
  const manifestId = () => page.evaluate(async () => (await (await fetch('manifest.webmanifest')).json()).id);
  await page.goto(U); await page.evaluate(() => navigator.serviceWorker.ready); await page.waitForTimeout(500);
  await page.reload(); await page.waitForTimeout(500);
  log('OLD version: manifest id', JSON.stringify(await manifestId()), '| cache', JSON.stringify(await page.evaluate(() => caches.keys())));
  root = NEW;   // deploy
  let reloads = 0; page.on('load', () => reloads++);
  await page.goto(U); await page.waitForTimeout(4000);
  log('after deploy: automatic reloads', reloads - 1, '| controller', await page.evaluate(() => navigator.serviceWorker.controller && navigator.serviceWorker.controller.scriptURL));
  log('NEW version: manifest id', JSON.stringify(await manifestId()), '| cache', JSON.stringify(await page.evaluate(() => caches.keys())), '| install button', await page.locator('[data-act="install-help"]').count());
  log('ERRORS', JSON.stringify(errors));
  await browser.close(); srv.close();
})().catch(e => { console.error('FAIL', e); process.exit(1); });
