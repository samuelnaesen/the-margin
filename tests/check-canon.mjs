// Checks every page against the canon (see .claude/skills/canon-grid) and for text overflow.
// Usage: node tests/check-canon.mjs [--shots <dir>]
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { mkdirSync } from 'node:fs';

const shotsIdx = process.argv.indexOf('--shots');
const shots = shotsIdx > -1 ? process.argv[shotsIdx + 1] : null;
if (shots) mkdirSync(shots, { recursive: true });

const url = pathToFileURL(resolve('index.html')).href;
const viewports = [{ name: 'desktop', width: 1440, height: 900 }, { name: 'phone', width: 390, height: 844 }];
const TOL = 1; // px
let failures = 0;

const browser = await chromium.launch();
for (const vp of viewports) {
  const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
  await page.goto(url);
  await page.evaluate(() => document.fonts.ready);
  const count = await page.evaluate(() => window.__pageCount);
  for (let i = 0; i < count; i++) {
    await page.evaluate(n => window.__goto(n), i);
    const r = await page.evaluate(n => {
      const el = document.querySelectorAll('.page')[n];
      const tb = el.querySelector('.text-block');
      const p = el.getBoundingClientRect(), t = tb.getBoundingClientRect();
      const verso = el.classList.contains('verso');
      const W = p.width, H = p.height;
      const exp = { left: p.left + (verso ? 2 : 1) * W / 9, top: p.top + H / 9, width: 6 * W / 9, height: 6 * H / 9 };
      const got = { left: t.left, top: t.top, width: t.width, height: t.height };
      const overflow = tb.scrollHeight - tb.clientHeight;
      const ratio = H / W;
      // margin notes must stay inside the page
      const notesOut = [...el.querySelectorAll('.note, .ink-hidden')].filter(n => {
        const b = n.getBoundingClientRect();
        return b.left < p.left - 1 || b.right > p.right + 1 || b.top < p.top - 1 || b.bottom > p.bottom + 1;
      }).map(n => n.textContent.slice(0, 30));
      return { exp, got, overflow, ratio, notesOut, visible: W > 0 };
    }, i);
    const errs = [];
    if (!r.visible) errs.push('page not visible');
    if (Math.abs(r.ratio - 1.5) > 0.01) errs.push(`page ratio ${r.ratio.toFixed(3)} (want 1.5)`);
    for (const k of ['left', 'top', 'width', 'height'])
      if (Math.abs(r.exp[k] - r.got[k]) > TOL) errs.push(`${k} off by ${(r.got[k] - r.exp[k]).toFixed(2)}px`);
    if (r.overflow > 1) errs.push(`text overflows block by ${r.overflow}px`);
    if (r.notesOut.length) errs.push(`notes outside page: ${r.notesOut.join(' | ')}`);
    console.log(`${vp.name} page ${i}: ${errs.length ? 'FAIL ' + errs.join('; ') : 'ok'}`);
    failures += errs.length;
    if (shots && (vp.name === 'phone' || i === 0 || i % 2 === 1)) {
      await page.screenshot({ path: `${shots}/${vp.name}-${String(i).padStart(2, '0')}.png` });
    }
  }
  await page.close();
}
await browser.close();
console.log(failures ? `\n${failures} problem(s)` : '\nall pages match the canon');
process.exit(failures ? 1 : 0);
