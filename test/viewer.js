// The artifact page as the Claude viewer shows it (window.claude present, no microphone policy).
const { chromium } = require('/opt/npm-tools/node_modules/playwright');
const { fonts, speechMock } = require('./lib');
(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1180, height: 800 } });
  await fonts(ctx); await ctx.addInitScript(speechMock());
  await ctx.addInitScript(`window.claude = { use(){ return null; } }; Object.defineProperty(document, 'permissionsPolicy', { value: { allowsFeature: f => f !== 'microphone' } });`);
  const page = await ctx.newPage(); const errors = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto('file:///home/claude/francais/dist/calepin.html'); await page.waitForTimeout(600);
  console.log('WELCOME name/company', await page.inputValue('#w-name'), '/', await page.inputValue('#w-company'));
  await page.click('[data-act="w-start"]'); await page.waitForTimeout(300);
  console.log('H1', await page.locator('h1').innerText(), '| notice', (await page.locator('.notice').first().innerText()).replace(/\n/g, ' '), '| link', await page.locator('.notice a').getAttribute('href'));
  console.log('MIC buttons', await page.locator('[data-act="check"]').count(), '| rail link', await page.locator('.rail-foot a').count());
  await page.screenshot({ path: __dirname + '/shots/60-viewer.png' });
  console.log('ERRORS', JSON.stringify(errors));
  await browser.close();
})().catch(e => { console.error('FAIL', e); process.exit(1); });
