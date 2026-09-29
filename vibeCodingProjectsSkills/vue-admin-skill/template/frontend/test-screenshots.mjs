import puppeteer from 'puppeteer-core';
import { mkdirSync } from 'node:fs';

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const SHOT_DIR = 'D:/tmp/audit-2026-09-23-screenshots';
mkdirSync(SHOT_DIR, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: EDGE,
  headless: 'new',
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});

const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
await page.evaluateOnNewDocument(() => {
  try { localStorage.clear(); sessionStorage.clear(); } catch (e) {}
});

await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle0' });
await page.waitForSelector('.login-card__submit', { timeout: 5000 });
await page.click('.login-card__submit');
await new Promise((r) => setTimeout(r, 3000));

const PAGES = [
  { name: '01-dashboard', path: '/dashboard' },
  { name: '02-system-user', path: '/system/user' },
  { name: '03-system-role', path: '/system/role' },
  { name: '04-system-menu', path: '/system/menu' },
  { name: '05-system-org', path: '/system/org' },
  { name: '06-example-product', path: '/example/product' },
];

for (const p of PAGES) {
  await page.goto(`http://localhost:5173${p.path}`, { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 1500));
  await page.screenshot({ path: `${SHOT_DIR}/${p.name}.png`, fullPage: false });
  console.log(`  shot ${p.name}.png`);
}

await browser.close();
console.log(`\n6 screenshots at ${SHOT_DIR}`);