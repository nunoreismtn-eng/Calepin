// Screenshots of the lesson player in each state, at a pace slow enough to catch them; plus desktop and no-Portuguese-voice cases.
const { chromium } = require('/opt/npm-tools/node_modules/playwright');
const { serve, fonts, speechMock, ANDROID_UA, BASE } = require('./lib');
const SHOTS = __dirname + '/shots/';
const log = (...a) => console.log(...a);
const ONBOARDED = `localStorage.setItem('calepin:settings', JSON.stringify({ onboarded:true, name:'Rui', company:'Casa Pedra' }));`;
async function until(page, fn, arg, ms) { await page.waitForFunction(fn, arg, { timeout: ms || 60000, polling: 30 }); }
(async () => {
  const srv = await serve(8767);
  const browser = await chromium.launch();
  const errors = [];
  async function phone(opts) {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, userAgent: ANDROID_UA, isMobile: true, hasTouch: true, serviceWorkers: 'block', colorScheme: opts.dark ? 'dark' : 'light' });
    await fonts(ctx); await ctx.addInitScript(speechMock(opts.mock || { ttsMs: 650 }));
    await ctx.addInitScript(ONBOARDED);
    const page = await ctx.newPage();
    page.on('pageerror', e => errors.push(e.message));
    await page.goto(`http://127.0.0.1:8767${BASE}?fast=${opts.fast || 0.3}`); await page.waitForTimeout(400);
    return { ctx, page };
  }
  const state = (page) => page.evaluate(() => ({ dial: document.querySelector('#dial') && document.querySelector('#dial').dataset.state, card: document.querySelector('#pl-card') && document.querySelector('#pl-card').dataset.kind, phase: (document.querySelector('#pl-phases li.on') || {}).dataset ? document.querySelector('#pl-phases li.on') && document.querySelector('#pl-phases li.on').dataset.p : null }));

  // 1) the lesson player, state by state
  {
    const { ctx, page } = await phone({});
    await page.click('.hero [data-act="play-lesson"]');
    await until(page, () => { const c = document.querySelector('#pl-card'); return c && c.dataset.kind === 'title'; });
    await page.screenshot({ path: SHOTS + '20-player-title.png' });
    await until(page, () => { const c = document.querySelector('#pl-card'); return c && c.dataset.kind === 'line' && document.querySelectorAll('.pc-dlg .dl').length >= 4 && document.querySelector('#dial').dataset.state === 'listen'; });
    await page.screenshot({ path: SHOTS + '21-player-dialogue.png' });
    while ((await state(page)).phase !== 'vocab') { await page.click('[data-act="pl-skip"]'); await page.waitForTimeout(60); }
    await until(page, () => { const c = document.querySelector('#pl-card'); return c && c.dataset.kind === 'new' && document.querySelector('.pc-fr.on') && document.querySelector('#dial').dataset.state === 'repeat'; });
    await page.waitForTimeout(250);
    await page.screenshot({ path: SHOTS + '22-player-new-repeat.png' });
    await until(page, () => { const c = document.querySelector('#pl-card'); return c && c.dataset.kind === 'recall' && document.querySelector('#dial').dataset.state === 'answer'; });
    await page.waitForTimeout(300);
    await page.screenshot({ path: SHOTS + '23-player-recall-answer.png' });
    log('recall state', JSON.stringify(await state(page)), '| done btn', await page.locator('#pl-done').innerText(), await page.locator('#pl-done').isEnabled());
    await page.click('#pl-done'); await page.waitForTimeout(80);
    log('after Já respondi', JSON.stringify(await state(page)));
    while ((await state(page)).phase !== 'practice') { await page.click('[data-act="pl-skip"]'); await page.waitForTimeout(40); }
    await until(page, () => { const c = document.querySelector('#pl-card'); return c && (c.dataset.kind === 'drill' || c.dataset.kind === 'review') && document.querySelector('#dial').dataset.state === 'answer'; });
    await page.waitForTimeout(300);
    await page.screenshot({ path: SHOTS + '24-player-drill.png' });
    while ((await state(page)).phase !== 'role') { await page.click('[data-act="pl-skip"]'); await page.waitForTimeout(40); }
    await until(page, () => { const c = document.querySelector('#pl-card'); return c && c.dataset.kind === 'role' && document.querySelector('#dial').dataset.state === 'answer'; });
    await page.waitForTimeout(300);
    await page.screenshot({ path: SHOTS + '25-player-role.png' });
    await page.click('[data-act="pl-pop"]'); await page.waitForTimeout(150);
    await page.click('#pl-toggle'); await page.waitForTimeout(150);
    await page.screenshot({ path: SHOTS + '26-player-paused-pop.png' });
    await page.click('[data-act="pl-pop"]'); await page.click('#pl-toggle');
    while ((await state(page)).phase !== 'end') { await page.click('[data-act="pl-skip"]'); await page.waitForTimeout(40); }
    for (let k = 0; k < 9; k++) { await page.click('[data-act="pl-skip"]'); await page.waitForTimeout(40); }
    await until(page, () => { const c = document.querySelector('#pl-card'); return c && c.dataset.kind === 'note'; });
    await page.waitForTimeout(200);
    await page.screenshot({ path: SHOTS + '27-player-note.png' });
    await ctx.close();
  }

  // 2) no Portuguese voice: the narrator reads on screen, and Hoje explains how to install it
  {
    const { ctx, page } = await phone({ mock: { ttsMs: 500, voices: [{ name: 'Français France', lang: 'fr-FR', voiceURI: 'fr-fr-x-frc-local', localService: true, default: false }, { name: 'English United States', lang: 'en-US', voiceURI: 'en-us', localService: true, default: true }] } });
    log('NOTICES', (await page.locator('.notice').allInnerTexts()).map(t => t.replace(/\n/g, ' ')).join(' || '));
    await page.screenshot({ path: SHOTS + '30-hoje-no-pt.png' });
    await page.click('.hero [data-act="play-lesson"]'); await page.waitForTimeout(500);
    log('TEXT NARRATOR dial', await page.locator('#dial').getAttribute('data-state'), '| spoken', JSON.stringify(await page.evaluate(() => window.__spoken.map(s => s.text.slice(0, 30)))));
    await page.screenshot({ path: SHOTS + '31-player-read.png' });
    await until(page, () => { const c = document.querySelector('#pl-card'); return c && c.dataset.kind === 'line'; }, null, 60000);
    const sp = await page.evaluate(() => window.__spoken.slice(0, 3).map(s => [s.text, s.voice, s.pitch]));
    log('SINGLE VOICE PITCHES', JSON.stringify(sp));
    await page.click('[data-act="pl-close"]'); await page.waitForTimeout(150);
    await page.click('.hoje-head [data-act="settings"]'); await page.waitForTimeout(200);
    log('VOICE STATUS', (await page.locator('#set-voices').innerText()).replace(/\n/g, ' | ').slice(0, 500));
    await ctx.close();
  }

  // 3) desktop
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 820 }, deviceScaleFactor: 1, serviceWorkers: 'block' });
    await fonts(ctx); await ctx.addInitScript(speechMock({ ttsMs: 600 })); await ctx.addInitScript(ONBOARDED);
    const page = await ctx.newPage(); page.on('pageerror', e => errors.push(e.message));
    await page.goto(`http://127.0.0.1:8767${BASE}?fast=0.3`); await page.waitForTimeout(500);
    await page.screenshot({ path: SHOTS + '40-desktop-hoje.png' });
    await page.click('.rtab[data-tab="licoes"]'); await page.waitForTimeout(200);
    await page.screenshot({ path: SHOTS + '41-desktop-licoes.png' });
    await page.click('.lrow[data-id="l07"]'); await page.waitForTimeout(250);
    await page.screenshot({ path: SHOTS + '42-desktop-sheet.png' });
    await page.click('#sheet-body [data-act="play-lesson"]');
    await until(page, () => { const c = document.querySelector('#pl-card'); return c && c.dataset.kind === 'line' && document.querySelectorAll('.pc-dlg .dl').length >= 3; });
    await page.screenshot({ path: SHOTS + '43-desktop-player.png' });
    await page.keyboard.press('Space'); await page.waitForTimeout(100);
    log('KEY space ->', await page.locator('#dial').getAttribute('data-state'));
    await page.keyboard.press('Escape'); await page.waitForTimeout(150);
    log('KEY esc -> overlay hidden', await page.locator('#ov').isHidden());
    await ctx.close();
  }
  // 4) dark phone, lesson 13 (granite) player
  {
    const { ctx, page } = await phone({ dark: true });
    await page.click('.tab[data-tab="licoes"]'); await page.waitForTimeout(200);
    await page.screenshot({ path: SHOTS + '50-dark-licoes.png' });
    await page.click('.lrow[data-id="l13"]'); await page.waitForTimeout(250);
    await page.click('#sheet-body [data-act="play-lesson"]');
    while ((await state(page)).phase !== 'role') { await page.click('[data-act="pl-skip"]'); await page.waitForTimeout(40); }
    await until(page, () => { const c = document.querySelector('#pl-card'); return c && c.dataset.kind === 'role' && document.querySelector('#dial').dataset.state === 'answer'; });
    await page.waitForTimeout(300);
    await page.screenshot({ path: SHOTS + '51-dark-player-role.png' });
    await ctx.close();
  }
  log('ERRORS', JSON.stringify(errors));
  await browser.close(); srv.close();
})().catch(e => { console.error('FAIL', e); process.exit(1); });
