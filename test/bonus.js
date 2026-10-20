// Bonus "Sans filtre": the section at the end of Lições, its sheet, a full round in the player, history and status.
const { chromium } = require('/opt/npm-tools/node_modules/playwright');
const { serve, fonts, speechMock, ANDROID_UA, BASE } = require('./lib');
const SHOTS = __dirname + '/shots/';
const log = (...a) => console.log(...a);
(async () => {
  const srv = await serve(8767);
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, userAgent: ANDROID_UA, isMobile: true, hasTouch: true, serviceWorkers: 'block' });
  await fonts(ctx);
  await ctx.addInitScript(speechMock());
  await ctx.addInitScript(`if(!localStorage.getItem('calepin:settings')) localStorage.setItem('calepin:settings', JSON.stringify({ onboarded:true }));`);
  const page = await ctx.newPage(); const errors = [];
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error' && !/net::|ERR_|Failed to load resource/.test(m.text())) errors.push('console: ' + m.text()); });
  await page.goto(`http://127.0.0.1:8767${BASE}?fast=0.03`); await page.waitForTimeout(400);

  // Lições: four modules untouched, bonus section after them
  await page.click('.tab[data-tab="licoes"]');
  await page.waitForTimeout(200);
  log('SECTIONS', await page.locator('section.mod').count(), '| lesson rows', await page.locator('[data-act="lesson"].lrow').count(), '| bonus rows', await page.locator('[data-act="bonus"]').count());
  log('BANNER', (await page.locator('section.bonus .mb-txt').innerText()).replace(/\n/g, ' | '));
  log('ROWS', (await page.locator('section.bonus .lrows').innerText()).replace(/\n/g, ' | '));
  await page.locator('section.bonus').scrollIntoViewIfNeeded();
  await page.screenshot({ path: SHOTS + 'b1-section.png' });

  // sheet
  await page.click('[data-act="bonus"][data-id="b1"]'); await page.waitForTimeout(300);
  log('SHEET', await page.locator('#sheet-title').innerText(), '|', (await page.locator('#sheet-body .ls-ht').innerText()).replace(/\n/g, ' | '));
  log('COTE', await page.locator('#sheet-body .cote').innerText(), '| list open?', await page.locator('.bn-list').evaluate(d => d.open));
  await page.screenshot({ path: SHOTS + 'b2-sheet.png' });
  await page.click('.bn-list summary'); await page.waitForTimeout(150);
  log('LIST rows', await page.locator('.bn-list .frow').count(), '| first', (await page.locator('.bn-list .frow').first().innerText()).replace(/\n/g, ' | '));
  await page.evaluate(() => { window.__spoken = []; });
  await page.locator('.bn-list .frow').nth(1).locator('[data-act="say"]').click(); await page.waitForTimeout(300);
  log('TAP SAY', JSON.stringify(await page.evaluate(() => window.__spoken.map(s => [s.text, s.lang, s.voice]))));
  await page.locator('.bn-list .frow').nth(4).scrollIntoViewIfNeeded();
  await page.screenshot({ path: SHOTS + 'b3-list.png' });

  // the round
  await page.evaluate(() => { window.__spoken = []; window.__ttsMs = 120; });
  await page.click('#sheet-body [data-act="play-bonus"]');
  await page.waitForTimeout(150);
  log('PLAYER title', (await page.locator('.pl-title').innerText()).replace(/\n/g, ' | '), '| phases bar', await page.locator('#pl-phases').count());
  await page.waitForFunction(() => document.querySelector('#pl-card[data-kind="joke"] .pc-lit'), null, { timeout: 60000 });
  log('JOKE CARD', (await page.locator('#pl-card').innerText()).replace(/\n/g, ' | '));
  await page.screenshot({ path: SHOTS + 'b4-joke.png' });
  await page.evaluate(() => { window.__ttsMs = 20; });
  const t0 = Date.now();
  await page.waitForSelector('.pl-done', { timeout: 180000 });
  log('ROUND done in', ((Date.now() - t0) / 1000).toFixed(1), 's');
  const sp = await page.evaluate(() => window.__spoken.map(s => [s.text, s.lang, s.voice, s.pitch]));
  log('UTTERANCES', sp.length, JSON.stringify(sp.reduce((a, s) => (a[s[1]] = (a[s[1]] || 0) + 1, a), {})));
  log('FIRST 12', JSON.stringify(sp.slice(0, 12).map(s => [s[0].slice(0, 70), s[1]])));
  log('LAST 3', JSON.stringify(sp.slice(-3).map(s => [s[0].slice(0, 70), s[1]])));
  log('DONE', (await page.locator('.pl-done').innerText()).replace(/\n/g, ' | '), '| buttons', (await page.locator('.done-actions').innerText()).replace(/\n/g, ' | '));
  await page.screenshot({ path: SHOTS + 'b5-done.png' });
  const prog = await page.evaluate(() => JSON.parse(localStorage.getItem('calepin:progress')));
  log('PROGRESS lessons', JSON.stringify(prog.lessons), '| srs', Object.keys(prog.srs).length, '| history', JSON.stringify(prog.history.map(e => [e.k, e.id])), '| resume', JSON.stringify(prog.resume));

  // next round straight from the done screen, then close mid-way
  await page.click('.done-actions [data-act="play-bonus"]'); await page.waitForTimeout(400);
  log('ROUND 2 title', (await page.locator('.pl-title').innerText()).replace(/\n/g, ' | '));
  await page.click('[data-act="pl-close"]'); await page.waitForTimeout(300);
  log('AFTER CLOSE overlay hidden', await page.locator('#ov').isHidden(), '| toast', await page.locator('#toast').isVisible() ? await page.locator('#toast').innerText() : '(none)');
  log('ROWS AFTER', (await page.locator('section.bonus .lrows').innerText()).replace(/\n/g, ' | '));

  // Progresso: history label
  await page.click('.tab[data-tab="progresso"]'); await page.waitForTimeout(200);
  log('HISTORY', (await page.locator('.hist').innerText()).replace(/\n/g, ' | '));

  // dark theme banner + desktop width
  await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));
  await page.click('.tab[data-tab="licoes"]'); await page.waitForTimeout(200);
  await page.locator('section.bonus').scrollIntoViewIfNeeded();
  await page.screenshot({ path: SHOTS + 'b6-dark.png' });
  log('WIDTH', await page.evaluate(() => [document.documentElement.scrollWidth, innerWidth]));
  log('ERRORS', JSON.stringify(errors));
  await browser.close(); srv.close();
})().catch(e => { console.error('FAIL', e); process.exit(1); });
