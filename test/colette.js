// Bonus "Sans pitié": Madame Colette asks, the (mocked) microphone answers, she comments on each kind of mistake.
const { chromium } = require('/opt/npm-tools/node_modules/playwright');
const { serve, fonts, speechMock, ANDROID_UA, BASE } = require('./lib');
const fs = require('fs'), path = require('path');
const SHOTS = __dirname + '/shots/';
const log = (...a) => console.log(...a);
global.window = {}; global.navigator = { userAgent: 'node' };
const src = ['content.js', 'engine.js'].map(f => fs.readFileSync(path.join(__dirname, '..', 'src', f), 'utf8')).join('\n');
const E = new Function(src + ';return { ITEM_BY_ID, fill };')();
const key = t => String(t).replace(/[’']/g, "'").replace(/\s+/g, ' ').trim();
const FR = {}; Object.values(E.ITEM_BY_ID).forEach(it => { FR[key(it.pt)] = E.fill(it.fr); });
const clean = t => t.toLowerCase().replace(/[.?!]/g, '').replace(/\s+/g, ' ').trim();
const variants = {
  perfect: fr => clean(fr),
  miss: fr => { const w = clean(fr).split(' '); w.splice(Math.max(1, w.length - 2), 1); return w.join(' '); },
  near: fr => { const w = clean(fr).split(' '); let k = 0; w.forEach((x, i) => { if (x.length > w[k].length) k = i; }); w[k] = w[k].slice(0, -2) + 'a'; return w.join(' '); },
  nonsense: () => 'bonjour bonjour la vache',
  extra: fr => { const w = clean(fr).split(' '); w.splice(1, 0, 'vraiment'); return w.join(' '); },
};
(async () => {
  const srv = await serve(8770);
  const browser = await chromium.launch();
  const mk = async (opts) => {
    const ctx = await browser.newContext(Object.assign({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, userAgent: ANDROID_UA, isMobile: true, hasTouch: true, serviceWorkers: 'block' }, opts || {}));
    await fonts(ctx); await ctx.addInitScript(speechMock());
    await ctx.addInitScript(`if(!localStorage.getItem('calepin:settings')) localStorage.setItem('calepin:settings', JSON.stringify({ onboarded:true }));`);
    const page = await ctx.newPage(); const errors = [];
    page.on('pageerror', e => errors.push('pageerror: ' + e.message));
    page.on('console', m => { if (m.type() === 'error' && !/net::|ERR_|Failed to load resource/.test(m.text())) errors.push('console: ' + m.text()); });
    return { ctx, page, errors };
  };
  const { page, errors } = await mk();
  await page.goto(`http://127.0.0.1:8770${BASE}?fast=0.03`); await page.waitForTimeout(400);
  await page.click('.tab[data-tab="licoes"]'); await page.waitForTimeout(200);
  log('SECTIONS', await page.locator('section.mod').count(), '| lesson rows', await page.locator('[data-act="lesson"]').count(), '| roast rows', await page.locator('[data-act="roast"]').count());
  log('BANNER', (await page.locator('section.roast .mb-txt').innerText()).replace(/\n/g, ' | '));
  log('ROWS', (await page.locator('section.roast .lrows').innerText()).replace(/\n/g, ' · '));
  await page.locator('section.roast').scrollIntoViewIfNeeded(); await page.screenshot({ path: SHOTS + 'c1-section.png' });

  await page.evaluate(() => { window.__spoken = []; window.__ttsMs = 4000; });
  await page.click('[data-act="roast"][data-id="m1"]');
  await page.waitForTimeout(300);
  log('INTRO', (await page.locator('#pl-card').innerText()).replace(/\n/g, ' | '), '| dial', await page.locator('#dial').getAttribute('data-state'), '| talking', await page.locator('.ro-say.talk').count());
  await page.screenshot({ path: SHOTS + 'c2-intro.png' });
  await page.evaluate(() => { window.__ttsMs = 20; });
  await page.click('[data-act="ro-go"]');
  const prompt = async () => { await page.waitForSelector('#pl-stage[data-stage="answer"], #pl-stage[data-stage="ask"]'); return key(await page.locator('#pl-card .pc-pt').innerText()); };
  const verdict = async () => { await page.waitForSelector('#pl-stage[data-stage="verdict"]'); await page.waitForFunction(() => document.querySelector('#d-fr') && document.querySelector('#dial').dataset.state === 'cnext', null, { timeout: 15000 }); return (await page.locator('#pl-card').innerText()).replace(/\n+/g, ' | '); };
  const startRound = async id => { await page.evaluate(() => { window.__ttsMs = 4000; }); await page.click(`[data-act="roast"][data-id="${id}"]`); await page.waitForSelector('[data-act="ro-go"]'); await page.evaluate(() => { window.__ttsMs = 20; }); await page.click('[data-act="ro-go"]'); return prompt(); };
  const plan = ['perfect', 'miss', 'near', 'nonsense', 'silence', 'skip', 'extra', 'nonsense+retry', 'perfect', 'miss'];
  for (let q = 0; q < plan.length; q++) {
    const pt = await prompt(), fr = FR[pt]; const step = plan[q];
    if (!fr) { log('NO MAPPING FOR', pt); }
    if (q === 1) await page.screenshot({ path: SHOTS + 'c3-ask.png' });
    if (step === 'skip') { await page.click('[data-act="ro-skip"]'); }
    else {
      await page.evaluate(([h, err]) => { window.__heard = h; window.__recErr = err; }, step === 'silence' ? ['', 'no-speech'] : [variants[step.split('+')[0]](fr), null]);
      await page.click('[data-act="ro-mic"]');
    }
    let v = await verdict();
    log(`Q${q + 1} [${step}] ${fr}\n    → ${v}`);
    if (q === 1) await page.screenshot({ path: SHOTS + 'c4-verdict-miss.png' });
    if (q === 2) await page.screenshot({ path: SHOTS + 'c5-verdict-near.png' });
    if (step.endsWith('+retry')) {
      await page.evaluate(h => { window.__heard = h; window.__recErr = null; }, variants.perfect(fr));
      await page.click('[data-act="ro-retry"]');
      await page.waitForTimeout(200);
      v = await verdict();
      log(`    retry → ${v}`);
    }
    await page.evaluate(() => { window.__recErr = null; });
    await page.click('[data-act="ro-next"]');
  }
  await page.waitForSelector('.ro-done');
  await page.waitForTimeout(1300);
  log('DONE', (await page.locator('.ro-done').innerText()).replace(/\n+/g, ' | '));
  log('DONE BUTTONS', (await page.locator('#pl-ctl').innerText()).replace(/\n+/g, ' | '));
  await page.screenshot({ path: SHOTS + 'c6-done.png' });
  await page.click('[data-act="ro-again"]'); await page.waitForTimeout(150);
  await prompt(); log('OUTRA RONDA → stage', await page.locator('#pl-stage').getAttribute('data-stage'), '| left', await page.locator('#pl-left').innerText());
  const sp = await page.evaluate(() => window.__spoken.map(s => [s.text, s.lang, s.voice]));
  log('SPOKEN', sp.length, JSON.stringify(sp.reduce((a, s) => (a[s[1]] = (a[s[1]] || 0) + 1, a), {})), '| first 6', JSON.stringify(sp.slice(0, 6).map(s => [s[0].slice(0, 60), s[1]])));
  log('COLETTE VOICE', JSON.stringify([...new Set(sp.filter(s => /^fr/.test(s[1])).map(s => s[2]))]));
  const prog = await page.evaluate(() => JSON.parse(localStorage.getItem('calepin:progress')));
  log('HISTORY', JSON.stringify(prog.history), '| srs', Object.keys(prog.srs).length, '| lessons', JSON.stringify(prog.lessons), '| days', JSON.stringify(prog.days));
  await page.click('.pl-top [data-act="ro-close"]'); await page.waitForTimeout(250);
  log('ROWS AFTER', (await page.locator('section.roast .lrows').innerText()).replace(/\n/g, ' · '));
  // second round: greeting is now one of the "hello" lines; close halfway through
  await page.evaluate(() => { window.__ttsMs = 4000; });
  await page.click('[data-act="roast"][data-id="all"]'); await page.waitForTimeout(150);
  log('ROUND 2 INTRO', (await page.locator('#pl-card .ro-say').innerText()).replace(/\n/g, ' | '));
  await page.evaluate(() => { window.__ttsMs = 20; });
  await page.click('[data-act="ro-go"]'); await prompt();
  await page.click('[data-act="ro-close"]'); await page.waitForTimeout(200);
  log('CLOSED MID-ROUND overlay hidden', await page.locator('#ov').isHidden(), '| history n', (await page.evaluate(() => JSON.parse(localStorage.getItem('calepin:progress')).history.length)));
  await page.click('.tab[data-tab="progresso"]'); await page.waitForTimeout(200);
  log('PROGRESSO HISTORY', (await page.locator('.hist').innerText()).replace(/\n/g, ' | '));
  // microphone refused: she switches to typed answers
  await page.click('.tab[data-tab="licoes"]'); await page.evaluate(() => { window.__recErr = 'not-allowed'; });
  await startRound('m4');
  await page.click('[data-act="ro-mic"]'); await page.waitForSelector('#ro-in');
  log('MIC REFUSED → typed form', await page.locator('#ro-form').count(), '| toast', await page.locator('#toast').innerText());
  await page.evaluate(() => { window.__recErr = null; });
  await page.click('[data-act="ro-close"]'); await page.waitForTimeout(150);
  // dark theme verdict
  await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));
  await page.click('.tab[data-tab="licoes"]');
  const pt3 = await startRound('m3'); await page.fill('#ro-in', variants.near(FR[pt3])); await page.click('.ro-type button[type="submit"]'); await verdict();   // still typing: the microphone was refused above
  await page.screenshot({ path: SHOTS + 'c7-dark.png' });
  log('WIDTH', JSON.stringify(await page.evaluate(() => [document.documentElement.scrollWidth, innerWidth])));
  log('ERRORS', JSON.stringify(errors));

  // typed answers: a browser without speech recognition
  const T = await mk({ userAgent: undefined, isMobile: false, hasTouch: false, viewport: { width: 1280, height: 860 }, deviceScaleFactor: 1 });
  await T.ctx.addInitScript(`delete window.SpeechRecognition; delete window.webkitSpeechRecognition;`);
  await T.page.goto(`http://127.0.0.1:8770${BASE}?fast=0.03`); await T.page.waitForTimeout(400);
  await T.page.evaluate(() => { window.__ttsMs = 4000; });
  await T.page.locator('[data-tab="licoes"]:visible').first().click(); await T.page.click('[data-act="roast"][data-id="m2"]'); await T.page.waitForTimeout(150);
  log('TYPED INTRO', (await T.page.locator('.ro-how').innerText()));
  await T.page.evaluate(() => { window.__ttsMs = 20; });
  await T.page.click('[data-act="ro-go"]');
  const tpt = key(await (await T.page.waitForSelector('#pl-card .pc-pt')).innerText()), tfr = FR[tpt];
  const noAcc = clean(tfr).normalize('NFD').replace(/[̀-ͯ]/g, '');
  log('TYPED focus in input', await T.page.evaluate(() => document.activeElement && document.activeElement.id));
  await T.page.fill('#ro-in', noAcc); await T.page.keyboard.press('Enter');
  await T.page.waitForSelector('#pl-stage[data-stage="verdict"]'); await T.page.waitForTimeout(300);
  log(`TYPED [${noAcc}] for ${tfr}\n    → ${(await T.page.locator('#pl-card').innerText()).replace(/\n+/g, ' | ')}`);
  await T.page.screenshot({ path: SHOTS + 'c8-typed.png' });
  await T.page.click('[data-act="ro-next"]'); await T.page.waitForSelector('#ro-in');
  await T.page.click('.ro-type button[type="submit"]'); await T.page.waitForSelector('#pl-stage[data-stage="verdict"]'); await T.page.waitForTimeout(200);
  log('TYPED EMPTY →', (await T.page.locator('.ro-say').innerText()).replace(/\n/g, ' | '));
  log('TYPED ERRORS', JSON.stringify(T.errors));
  await browser.close(); srv.close();
})().catch(e => { console.error('FAIL', e); process.exit(1); });
