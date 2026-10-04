// glyphprobe.mjs: which characters of a string each FONT lacks. node tools/glyphprobe.mjs "text" [fontKey ...]
import puppeteer from 'puppeteer-core';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
const [str, ...keys] = process.argv.slice(2);
const b = await puppeteer.launch({ executablePath: process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true, args: ['--allow-file-access-from-files'] });
const p = await b.newPage(); await p.goto(pathToFileURL(resolve('studio.html')).href + '?render'); await p.waitForFunction('window.ready===true');
console.log(JSON.stringify(await p.evaluate((s, ks) => Object.fromEntries((ks.length ? ks : Object.keys(FONT)).map(k => [k, missingGlyphs(s, FONT[k]).join('')])), str, keys)));
await b.close();
