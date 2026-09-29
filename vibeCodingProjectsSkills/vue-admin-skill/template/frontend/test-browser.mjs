// 真实浏览器模拟：先清 localStorage，访问 /login，点登录，抓全链路
import puppeteer from 'puppeteer-core';

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

const browser = await puppeteer.launch({
  executablePath: EDGE,
  headless: 'new',
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
});

const page = await browser.newPage();

// 关键：每次新 document 注入前先清 localStorage
await page.evaluateOnNewDocument(() => {
  try {
    localStorage.clear();
    sessionStorage.clear();
  } catch (e) {}
});

const consoleLogs = [];
const networkLog = [];

page.on('console', (msg) => {
  consoleLogs.push({ type: msg.type(), text: msg.text() });
});

page.on('pageerror', (err) => {
  consoleLogs.push({ type: 'pageerror', text: err.message, stack: err.stack });
});

page.on('request', (req) => {
  if (req.url().includes('/api/') && !req.url().includes('/src/')) {
    networkLog.push({
      stage: 'request',
      method: req.method(),
      url: req.url(),
      headers: req.headers(),
      postData: req.postData(),
    });
  }
});

page.on('response', async (res) => {
  if (res.url().includes('/api/') && !res.url().includes('/src/')) {
    let body = '';
    try { body = (await res.text()).slice(0, 500); } catch {}
    networkLog.push({
      stage: 'response',
      url: res.url(),
      status: res.status(),
      headers: res.headers(),
      body,
    });
  }
});

console.log('=== 1. 直接访问 /login（避开 / 自动跳 dashboard）===');
await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle0', timeout: 15000 });

const url1 = page.url();
console.log('  落地 URL:', url1);

console.log('\n=== 2. 验证 localStorage 确实被清空 ===');
const ls = await page.evaluate(() => Object.fromEntries(Object.entries(localStorage)));
console.log('  localStorage:', ls);

console.log('\n=== 3. 等登录按钮出现 ===');
await page.waitForSelector('.login-card__submit', { timeout: 5000 }).catch(() => console.log('  ❌ 登录按钮找不到'));

const btnText = await page.$eval('.login-card__submit', (el) => el.innerText).catch(() => 'N/A');
console.log('  登录按钮文字:', btnText);

console.log('\n=== 4. 等 1 秒再点 ===');
await new Promise((r) => setTimeout(r, 1000));

console.log('\n=== 5. 点击登录按钮 ===');
await page.click('.login-card__submit').catch((e) => console.log('  ❌ 点击失败:', e.message));

console.log('\n=== 6. 等 3 秒看结果 ===');
await new Promise((r) => setTimeout(r, 3000));

const url2 = page.url();
console.log('  点击后 URL:', url2);

console.log('\n=== 7. localStorage 后 ===');
const ls2 = await page.evaluate(() => Object.fromEntries(Object.entries(localStorage)));
console.log('  localStorage keys:', Object.keys(ls2));

console.log('\n=== 8. console 日志（只红色 / 警告 / error）===');
consoleLogs.filter((l) => ['error', 'warning', 'pageerror'].includes(l.type)).forEach((l) => {
  console.log(`  [${l.type}] ${l.text.slice(0, 300)}`);
  if (l.stack) console.log(`    stack: ${l.stack.slice(0, 200)}`);
});

if (consoleLogs.filter((l) => ['error', 'warning', 'pageerror'].includes(l.type)).length === 0) {
  console.log('  ✅ 无 console 错误');
}

console.log('\n=== 9. /api/* network 请求 ===');
networkLog.forEach((l) => {
  if (l.stage === 'request') {
    console.log(`\n  📤 ${l.method} ${l.url}`);
    console.log(`     Content-Type: ${l.headers['content-type'] || '(无)'}`);
    console.log(`     Authorization: ${l.headers['authorization'] ? l.headers['authorization'].slice(0, 40) + '...' : '(无)'}`);
    console.log(`     Body: ${l.postData || '(空)'}`);
  } else {
    console.log(`\n  📥 ${l.status} ${l.url}`);
    console.log(`     Content-Type: ${l.headers['content-type'] || '(无)'}`);
    console.log(`     Body: ${l.body}`);
  }
});

await browser.close();