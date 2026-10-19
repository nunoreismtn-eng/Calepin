// Failure modes: French voice errors, voices that load late, an engine that never reports the end of speech.
const { chromium } = require('/opt/npm-tools/node_modules/playwright');
const { serve, speechMock, ANDROID_UA, BASE } = require('./lib');
const log = (...a) => console.log(...a);
const ONBOARDED = `localStorage.setItem('calepin:settings', JSON.stringify({ onboarded:true, name:'Rui', company:'Casa Pedra' }));`;
(async () => {
  const srv = await serve(8768);
  const browser = await chromium.launch();
  const errors = [];
  async function open(mock, fast) {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, userAgent: ANDROID_UA, isMobile: true, hasTouch: true, serviceWorkers: 'block' });
    await ctx.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
    await ctx.addInitScript(speechMock(mock)); await ctx.addInitScript(ONBOARDED);
    const page = await ctx.newPage(); page.on('pageerror', e => errors.push(e.message));
    await page.goto(`http://127.0.0.1:8768${BASE}?fast=${fast || 0.03}`); await page.waitForTimeout(300);
    return { ctx, page };
  }
  // 1) every French utterance fails: the lesson keeps going on screen and says so
  {
    const { ctx, page } = await open({});
    await page.evaluate(() => { window.__failFr = true; });
    await page.click('.hero [data-act="play-lesson"]');
    await page.waitForFunction(() => { const w = document.querySelector('#pl-warn'); return w && !w.hidden; }, null, { timeout: 30000 });
    log('FR FAIL warn:', await page.locator('#pl-warn').innerText());
    await page.waitForFunction(() => { const li = document.querySelector('#pl-phases li.on'); return li && li.dataset.p === 'vocab'; }, null, { timeout: 60000 });
    log('FR FAIL still advancing to vocab: yes');
    await ctx.close();
  }
  // 2) voices arrive late (Android): the app speaks by language first, then picks voices
  {
    const { ctx, page } = await open({ lateVoices: true });
    log('LATE before: notices', await page.locator('.notice').count());
    await page.waitForTimeout(2800);
    log('LATE after timeout: status', await page.evaluate(() => document.querySelectorAll('.notice').length));
    await page.evaluate(() => window.__fireVoices()); await page.waitForTimeout(200);
    await page.click('.hero [data-act="play-lesson"]'); await page.waitForTimeout(400);
    log('LATE spoken', JSON.stringify(await page.evaluate(() => window.__spoken.slice(0, 2).map(s => [s.text.slice(0, 25), s.voice]))));
    await ctx.close();
  }
  // 3) the engine never fires onend: the watchdog moves on
  {
    const { ctx, page } = await open({ ttsMs: 600000 });
    await page.click('.hero [data-act="play-lesson"]');
    const t0 = Date.now();
    await page.waitForFunction(() => window.__spoken.length >= 2, null, { timeout: 30000 });
    log('WATCHDOG second utterance after', ((Date.now() - t0) / 1000).toFixed(1), 's:', await page.evaluate(() => window.__spoken[1].text.slice(0, 40)));
    await ctx.close();
  }
  log('ERRORS', JSON.stringify(errors));
  await browser.close(); srv.close();
})().catch(e => { console.error('FAIL', e); process.exit(1); });
