// shot.mjs: screenshot one element of a page (checkpoint pages). node tools/shot.mjs <url> <out.png> <viewport width> <css selector>
import puppeteer from 'puppeteer-core';
const [url, out, w, sel] = process.argv.slice(2);
const b = await puppeteer.launch({ executablePath: process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
const p = await b.newPage(); await p.setViewport({ width: +w, height: 1400, deviceScaleFactor: 1 });
await p.goto(url, { waitUntil: 'networkidle0' });
const el = await p.$(sel); await el.screenshot({ path: out });
await b.close();
