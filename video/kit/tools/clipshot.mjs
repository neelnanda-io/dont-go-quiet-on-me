// clipshot.mjs: 2x screenshot of a vertical slice of a page at phone width (for reading tall checkpoint cards).
//   node tools/clipshot.mjs <url> <out.png> <css selector> [offset px below its top=0] [height=1200] [dark]
import puppeteer from 'puppeteer-core';
const [url, out, sel, off = 0, h = 1200, dark = ''] = process.argv.slice(2);
const b = await puppeteer.launch({ executablePath: process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
const p = await b.newPage(); await p.setViewport({ width: 400, height: 900, deviceScaleFactor: 2 });
if (dark) await p.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'dark' }]);
await p.goto(url, { waitUntil: 'networkidle0' });
const y = await p.evaluate((s) => { const e = document.querySelector(s); return e.getBoundingClientRect().top + window.scrollY; }, sel);
await p.screenshot({ path: out, clip: { x: 0, y: y + +off, width: 400, height: +h }, captureBeyondViewport: true });
await b.close();
