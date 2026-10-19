// End-to-end run of the public build on an Android-sized screen, with mocked voices.
const { chromium } = require('/opt/npm-tools/node_modules/playwright');
const { serve, fonts, speechMock, ANDROID_UA, BASE } = require('./lib');
const SHOTS = __dirname + '/shots/';
const log = (...a) => console.log(...a);
(async () => {
  const srv = await serve(8766);
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, userAgent: ANDROID_UA, isMobile: true, hasTouch: true, serviceWorkers: 'block' });
  await fonts(ctx);
  await ctx.addInitScript(speechMock());
  const page = await ctx.newPage(); const errors = [];
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error' && !/net::|ERR_|Failed to load resource/.test(m.text())) errors.push('console: ' + m.text()); });
  const url = `http://127.0.0.1:8766${BASE}?fast=0.03`;
  await page.goto(url); await page.waitForTimeout(500);

  // 1. welcome
  log('WELCOME', await page.locator('.wel-title').innerText(), '|', await page.locator('.wel-sub').innerText());
  await page.screenshot({ path: SHOTS + '01-welcome.png' });
  await page.fill('#w-name', 'Rui'); await page.fill('#w-company', 'Casa Pedra');
  await page.click('[data-act="w-test"]'); await page.waitForTimeout(600);
  log('SOUND TEST', await page.locator('#w-sound').innerText());
  log('SPOKEN', JSON.stringify(await page.evaluate(() => window.__spoken.map(s => [s.text, s.lang, s.voice, s.pitch]))));
  await page.click('[data-act="w-start"]'); await page.waitForTimeout(300);

  // 2. Hoje
  log('H1', await page.locator('h1').innerText(), '| hero', (await page.locator('.hero .fr-title').innerText()), '| facts', (await page.locator('.hero .facts').innerText()).replace(/\n/g, ' '));
  log('REVIEW CARD', (await page.locator('.rv').innerText()).replace(/\n/g, ' | '));
  log('NOTICES', await page.locator('.notice').count());
  await page.screenshot({ path: SHOTS + '02-hoje.png', fullPage: true });

  // 3. the whole of lesson 1
  await page.evaluate(() => { window.__spoken = []; });
  const t0 = Date.now();
  await page.click('.hero [data-act="play-lesson"]');
  await page.waitForTimeout(200);
  log('PLAYER phases', await page.locator('#pl-phases li').count(), '| dial', await page.locator('#dial').getAttribute('data-state'));
  await page.waitForSelector('.pl-done', { timeout: 180000 });
  log('LESSON 1 done in', ((Date.now() - t0) / 1000).toFixed(1), 's');
  const sp = await page.evaluate(() => window.__spoken);
  const byLang = {}; sp.forEach(s => { byLang[s.lang] = (byLang[s.lang] || 0) + 1; });
  log('UTTERANCES', sp.length, JSON.stringify(byLang));
  log('FIRST 6', JSON.stringify(sp.slice(0, 6).map(s => [s.text.slice(0, 60), s.lang, s.voice, s.pitch])));
  const intro = sp.find(s => /De la part de Rui/.test(s.text));
  log('NAME LINE', intro && intro.text, '|', intro && intro.voice);
  const fem = sp.find(s => s.text === 'Cabinet Moreau, bonjour.'); log('A VOICE', fem && fem.voice, fem && fem.pitch);
  const slow = sp.find(s => s.text === 'Madame Moreau'); log('BUILD CHUNK', slow && slow.text, slow && slow.rate);
  const mixed = sp.filter(s => s.text === 'Je vous la passe'); log('NOTE FR PART', mixed.length, mixed[0] && mixed[0].lang);
  log('LAST', JSON.stringify(sp.slice(-2).map(s => s.text.slice(0, 80))));
  log('DONE CARD', (await page.locator('.pl-done').innerText()).replace(/\n/g, ' | '));
  await page.screenshot({ path: SHOTS + '05-done.png' });
  await page.click('[data-act="rate-lesson"][data-ok="1"]');
  log('RATE MSG', await page.locator('#done-msg').innerText(), '| next btn', await page.locator('#done-next').innerText());
  await page.click('.done-actions [data-act="pl-close"]'); await page.waitForTimeout(250);
  log('HERO AFTER', await page.locator('.hero .fr-title').innerText(), '|', await page.locator('.hero .eyebrow').innerText());
  log('REVIEW AFTER', (await page.locator('.rv').innerText()).replace(/\n/g, ' | '));

  // 4. review: make every phrase due
  await page.evaluate(() => { const p = JSON.parse(localStorage.getItem('calepin:progress')); Object.values(p.srs).forEach(x => { x.due = '2020-01-01'; }); localStorage.setItem('calepin:progress', JSON.stringify(p)); });
  await page.goto(url.replace('fast=0.03', 'fast=1')); await page.waitForTimeout(400);   // real answer windows, so the test can tap in time
  log('BADGE', await page.locator('.tab .badge').innerText(), '| card', (await page.locator('.rv h3').innerText()));
  await page.click('[data-act="review"]');
  await page.waitForSelector('[data-act="rv-mic"]', { timeout: 10000 });
  await page.screenshot({ path: SHOTS + '06-review-prompt.png' });
  await page.click('[data-act="rv-mic"]');
  await page.waitForSelector('.grades', { timeout: 10000 });
  log('MIC RESULT', (await page.locator('.rv-res').innerText()).replace(/\n/g, ' | '), '| suggested', await page.locator('.gbtn.sug b').innerText().catch(() => '-'));
  await page.screenshot({ path: SHOTS + '07-review-graded.png' });
  await page.click('.gbtn.g2');
  let n = 1;
  while (!(await page.locator('.ov .pl-done').count())) {
    await page.waitForSelector('[data-act="rv-show"], .grades, .ov .pl-done', { timeout: 10000 });
    if (await page.locator('.ov .pl-done').count()) break;
    if (await page.locator('[data-act="rv-show"]').count()) await page.click('[data-act="rv-show"]');
    await page.waitForSelector('.grades', { timeout: 10000 });
    await page.click(n % 3 === 0 ? '.gbtn.g0' : n % 3 === 1 ? '.gbtn.g1' : '.gbtn.g2'); n++;
    await page.waitForTimeout(30);
  }
  log('REVIEW DONE', n, (await page.locator('.ov .pl-done').innerText()).replace(/\n/g, ' | '));
  await page.click('[data-act="rv-close"]'); await page.waitForTimeout(200);
  await page.goto(url); await page.waitForTimeout(400);
  const prog = await page.evaluate(() => JSON.parse(localStorage.getItem('calepin:progress')));
  const boxes = {}; Object.values(prog.srs).forEach(x => { boxes[x.b] = (boxes[x.b] || 0) + 1; });
  log('BOXES', JSON.stringify(boxes), '| history', prog.history.map(e => e.k).join(','), '| days', JSON.stringify(prog.days));

  // 5. Frases + glossary
  await page.click('.tab[data-tab="frases"]'); await page.waitForTimeout(200);
  log('FRASES rows', await page.locator('.frow').count(), '| groups', await page.locator('details.grp').count(), '| open', await page.locator('details.grp[open]').count());
  await page.fill('#q', 'tranche'); await page.waitForTimeout(250);
  log('SEARCH tranche', await page.locator('.frow').count(), (await page.locator('.frow .fr').allInnerTexts()).join(' / '));
  await page.fill('#q', ''); await page.waitForTimeout(250);
  const firstRow = page.locator('details.grp[open] .frow').first();
  await firstRow.locator('[data-act="check"]').click(); await page.waitForTimeout(400);
  log('ROW CHECK', (await firstRow.locator('.fres').innerText()).replace(/\n/g, ' | '));
  await page.screenshot({ path: SHOTS + '08-frases.png' });
  await page.click('[data-act="seg"][data-v="glossario"]'); await page.waitForTimeout(200);
  await page.fill('#q', 'chant'); await page.waitForTimeout(250);
  log('GLOSS chant', (await page.locator('.grow .g-fr').allInnerTexts()).join(' / '));
  await page.evaluate(() => { window.__spoken = []; });
  await page.locator('.grow [data-act="say"]').first().click(); await page.waitForTimeout(200);
  log('GLOSS SAY', JSON.stringify(await page.evaluate(() => window.__spoken.map(s => [s.text, s.voice]))));
  await page.fill('#q', ''); await page.waitForTimeout(200);
  await page.screenshot({ path: SHOTS + '09-glossario.png' });

  // 6. Progresso
  await page.click('.tab[data-tab="progresso"]'); await page.waitForTimeout(200);
  log('TILES', (await page.locator('.tiles').innerText()).replace(/\n/g, ' | '));
  log('HEAT cells', await page.locator('.hm .c').count(), '| practiced', await page.locator('.hm .c[tabindex]').count(), '| meters', await page.locator('.mrow').count());
  await page.screenshot({ path: SHOTS + '10-progresso.png', fullPage: true });

  // 7. Lições + lesson sheet + dialogue only
  await page.click('.tab[data-tab="licoes"]'); await page.waitForTimeout(200);
  log('LESSON ROWS', await page.locator('.lrow').count(), '| statuses', (await page.locator('.lstat').allInnerTexts()).join(','));
  await page.screenshot({ path: SHOTS + '11-licoes.png' });
  await page.click('.lrow[data-id="l03"]'); await page.waitForTimeout(300);
  log('SHEET', await page.locator('#sheet-title').innerText(), '| rows', await page.locator('#sheet-body .frow').count(), '| dlg', await page.locator('#sheet-body .ls-dlg .dl').count());
  await page.screenshot({ path: SHOTS + '12-lesson-sheet.png' });
  await page.click('#sheet-body [data-act="play-dialogue"]');
  await page.waitForSelector('.pl-done', { timeout: 30000 });
  log('DIALOGUE ONLY', (await page.locator('.pl-done').innerText()).replace(/\n/g, ' | '));
  await page.click('.done-actions [data-act="pl-close"]'); await page.waitForTimeout(200);

  // 8. resume: start lesson 2, leave with the back gesture, come back
  await page.click('.tab[data-tab="hoje"]'); await page.waitForTimeout(150);
  await page.evaluate(() => { window.__ttsMs = 120; });
  await page.click('.hero [data-act="play-lesson"]');
  await page.waitForFunction(() => { const li = document.querySelector('#pl-phases li.on'); return li && li.dataset.p === 'vocab'; }, null, { timeout: 30000 });
  await page.waitForTimeout(600);
  const before = await page.evaluate(() => window.__spoken.slice(-1)[0].text);
  await page.evaluate(() => history.back()); await page.waitForTimeout(400);
  log('AFTER BACK overlay', await page.locator('#ov').isHidden(), '| toast', await page.locator('#toast').innerText());
  log('RESUME', JSON.stringify(await page.evaluate(() => { const p = JSON.parse(localStorage.getItem('calepin:progress')); return p.resume && { id: p.resume.id, i: p.resume.i, ph: p.resume.ph, pct: p.resume.pct }; })));
  log('HERO RESUME', (await page.locator('.hero .eyebrow').innerText()), '|', await page.locator('.hero [data-act="play-lesson"]').innerText());
  await page.screenshot({ path: SHOTS + '13-hoje-resume.png' });
  await page.evaluate(() => { window.__spoken = []; });
  await page.click('.hero [data-act="play-lesson"]'); await page.waitForTimeout(500);
  log('RESUMED FROM', JSON.stringify(await page.evaluate(() => window.__spoken.slice(0, 2).map(s => s.text))), '| before leaving:', before);
  // controls: pause, back, skip, replay, done
  await page.click('#pl-toggle'); await page.waitForTimeout(150);
  log('PAUSED dial', await page.locator('#dial').getAttribute('data-state'));
  await page.click('[data-act="pl-skip"]'); await page.waitForTimeout(100);
  await page.click('[data-act="pl-back"]'); await page.waitForTimeout(100);
  await page.click('#pl-toggle'); await page.waitForTimeout(300);
  log('PLAYING again', await page.locator('#dial').getAttribute('data-state'));
  await page.evaluate(() => { window.__ttsMs = 20; });
  await page.click('[data-act="pl-close"]'); await page.waitForTimeout(200);

  // 9. settings
  await page.click('.hoje-head [data-act="settings"]'); await page.waitForTimeout(250);
  log('VOICES', (await page.locator('#set-voices').innerText()).replace(/\n/g, ' | ').slice(0, 400));
  await page.screenshot({ path: SHOTS + '14-settings.png' });
  await page.click('[data-act="set"][data-k="rate"][data-v="0.8"]');
  await page.click('[data-act="set"][data-k="theme"][data-v="dark"]');
  await page.click('#sheet-close'); await page.waitForTimeout(250);
  log('SETTINGS SAVED', JSON.stringify(await page.evaluate(() => { const s = JSON.parse(localStorage.getItem('calepin:settings')); return [s.rate, s.theme, s.name, s.company]; })));
  await page.screenshot({ path: SHOTS + '15-hoje-dark.png', fullPage: true });
  await page.click('.tab[data-tab="progresso"]'); await page.waitForTimeout(200);
  await page.screenshot({ path: SHOTS + '16-progresso-dark.png', fullPage: true });

  // 10. narrow screen: nothing scrolls sideways
  await page.setViewportSize({ width: 360, height: 740 });
  for (const t of ['hoje', 'licoes', 'frases', 'progresso']) {
    await page.click(`.tab[data-tab="${t}"]`); await page.waitForTimeout(150);
    const o = await page.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]);
    log('WIDTH', t, o.join(' vs '));
  }
  log('ERRORS', JSON.stringify(errors));
  await browser.close(); srv.close();
})().catch(e => { console.error('FAIL', e); process.exit(1); });
