// overflow.mjs: report elements wider than the viewport (phone-width check for checkpoint pages).
//   node tools/overflow.mjs <url> [width=400]
import puppeteer from 'puppeteer-core';
const [url, w = 400] = process.argv.slice(2);
const b = await puppeteer.launch({ executablePath: process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
const p = await b.newPage(); await p.setViewport({ width: +w, height: 900 });
await p.goto(url, { waitUntil: 'networkidle0' });
const r = await p.evaluate(() => {
  const vw = document.documentElement.clientWidth, out = [];
  for (const el of document.querySelectorAll('body *')) {
    const bb = el.getBoundingClientRect(); if (bb.width === 0) continue;
    if (bb.right > vw + 1) { let sc = false; for (let a = el.parentElement; a; a = a.parentElement) { const o = getComputedStyle(a).overflowX; if (o === 'auto' || o === 'scroll' || o === 'hidden') { sc = true; break; } } if (!sc) out.push(`${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}.${[...el.classList].join('.')} right=${Math.round(bb.right)} w=${Math.round(bb.width)}`); }
  }
  return { vw, scrollWidth: document.documentElement.scrollWidth, offenders: out.slice(0, 25), n: out.length };
});
console.log(JSON.stringify(r, null, 1)); await b.close();
