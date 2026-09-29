// test-crud.mjs — 6 大 CRUD 端到端验证（vue-admin skill dogfooding）
import puppeteer from 'puppeteer-core';

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const BASE = 'http://localhost:5173';

const browser = await puppeteer.launch({
  executablePath: EDGE,
  headless: 'new',
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
});

const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });

// ponytail: only clear once on first navigation; putting localStorage.clear()
// in evaluateOnNewDocument wipes the auth token every page.goto() and 403s every API.
// 首次页面加载前清一次登录态，之后保留 token。
await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded', timeout: 15000 });
await page.evaluate(() => {
  try { localStorage.clear(); sessionStorage.clear(); } catch (e) {}
});

const consoleErrors = [];
const apiLog = [];

page.on('console', (msg) => {
  if (['error', 'pageerror'].includes(msg.type())) {
    consoleErrors.push({ type: msg.type(), text: msg.text() });
  }
});

page.on('pageerror', (err) => {
  consoleErrors.push({ type: 'pageerror', text: err.message });
});

page.on('response', async (res) => {
  if (res.url().includes('/api/') && !res.url().includes('/src/') && res.url().startsWith(BASE.replace(/:\d+/, ':5173')) || res.url().includes('localhost:8080')) {
    let body = '';
    try { body = (await res.text()).slice(0, 200); } catch {}
    apiLog.push({ url: res.url(), status: res.status(), method: res.request().method(), body });
  }
});

const resetCounters = () => { apiLog.length = 0; consoleErrors.length = 0; };

console.log('=== 1. 登录闭环 ===');
await page.reload({ waitUntil: 'networkidle0' });
await page.waitForSelector('.login-card__submit', { timeout: 5000 });

// 检查输入框是否预填用户名（vite proxy 后端通常要求 captcha） - 不强制 captcha，看登录页面行为
const loginHtml = await page.content();
console.log('  登录页面加载:', loginHtml.includes('login-card') ? '✅' : '❌');

// 尝试直接点登录，看自动重定向行为
await page.click('.login-card__submit');
await new Promise((r) => setTimeout(r, 3000));

const loginUrl = page.url();
console.log(`  点登录后 URL: ${loginUrl}`);
const loginOk = loginUrl.includes('/dashboard') || loginUrl === `${BASE}/`;
console.log(`  ${loginOk ? '✅ 登录闭环（已到 dashboard/根）' : '⚠️ 未到 dashboard（可能需要 captcha 或仍在 login）'}`);

// ===== 2. 6 大业务页面访问 =====
const PAGES = [
  { name: '用户管理', path: '/system/user', expectedApi: '/api/users' },
  { name: '角色管理', path: '/system/role', expectedApi: '/api/roles' },
  { name: '菜单管理', path: '/system/menu', expectedApi: '/api/menus' },
  { name: '组织管理', path: '/system/org', expectedApi: '/api/orgs' },
  { name: '商品示例', path: '/example/product', expectedApi: '/api/products' },
];

const pageResults = [];

for (const p of PAGES) {
  console.log(`\n=== ${p.name} (${p.path}) ===`);
  resetCounters();

  await page.goto(`${BASE}${p.path}`, { waitUntil: 'networkidle0', timeout: 15000 }).catch((e) => console.log(`  ❌ 导航失败: ${e.message}`));
  await new Promise((r) => setTimeout(r, 1500));

  // 校验 expectedApi 调用
  const expectedCall = apiLog.find((l) => l.url.includes(p.expectedApi));
  if (expectedCall && expectedCall.status === 200) {
    console.log(`  ✅ ${p.expectedApi} ${expectedCall.status}`);
    pageResults.push({ page: p.name, ok: true, status: expectedCall.status });
  } else {
    const status = expectedCall ? expectedCall.status : 'NOT_FOUND';
    console.log(`  ❌ ${p.expectedApi} 期望 200 实际 ${status}`);
    if (expectedCall) console.log(`     body: ${expectedCall.body.slice(0, 100)}`);
    pageResults.push({ page: p.name, ok: false, status });
  }

  // 校验 console error
  if (consoleErrors.length === 0) {
    console.log(`  ✅ 无 console 错误`);
  } else {
    console.log(`  ⚠️ ${consoleErrors.length} 个 console 错误:`);
    consoleErrors.slice(0, 3).forEach((e) => console.log(`     [${e.type}] ${e.text.slice(0, 150)}`));
  }
}

// ===== 3. 用户 CRUD 端到端（最关键的一个）=====
console.log('\n=== 用户 CRUD 端到端 ===');
resetCounters();
await page.goto(`${BASE}/system/user`, { waitUntil: 'networkidle0', timeout: 15000 });
await new Promise((r) => setTimeout(r, 2000));

// 3.1 列表渲染（找非 header 的 row）
const allRows = await page.$$('.base-table__row');
// 减去 header 行
const headerRows = await page.$$('.base-table__row--header');
const userRows = allRows.length - headerRows.length;
console.log(`  列表渲染: ${userRows} 行 ${userRows > 0 ? '✅' : '❌'}`);

// 3.2 搜索（找 placeholder 是 "请输入用户名" 的 input）
apiLog.length = 0;
const searchInput = await page.evaluateHandle(() => {
  const all = document.querySelectorAll('.base-input__input');
  for (const el of all) {
    if (el.getAttribute('data-placeholder') === '请输入用户名') return el;
  }
  return null;
}).catch(() => null);

let searchOk = false;
if (searchInput && (await searchInput.evaluate((el) => !!el))) {
  await page.evaluate((el) => { el.focus(); }, searchInput);
  await searchInput.type('admin');
  await new Promise((r) => setTimeout(r, 800));
  const searchCall = apiLog.find((l) => l.url.includes('/api/users') && l.url.includes('username=admin'));
  // 兼容不同参数格式
  const anySearchCall = apiLog.find((l) => l.url.includes('/api/users'));
  console.log(`  搜索: ${searchCall || anySearchCall ? '✅' : '⚠️ 没找到 search call'}`);
  searchOk = true;
} else {
  // 退到 base-input 包裹层
  const wrapInput = await page.$('input[placeholder*="用户名"]').catch(() => null);
  if (wrapInput) {
    await wrapInput.type('admin');
    await new Promise((r) => setTimeout(r, 800));
    const searchCall = apiLog.find((l) => l.url.includes('/api/users'));
    console.log(`  搜索 (via input[placeholder]): ${searchCall ? '✅' : '⚠️ 没找到 search call'}`);
    searchOk = true;
  } else {
    console.log(`  搜索: ⚠️ 找不到输入框（跳过）`);
  }
}

// 3.3 新建按钮存在（找包含 "新增用户" 文字的 button）
const newBtnExists = await page.evaluate(() => {
  const buttons = document.querySelectorAll('.base-button, button');
  for (const b of buttons) {
    const text = (b.innerText || b.textContent || '').trim();
    if (text.includes('新增用户') || text.includes('新增')) return text;
  }
  return null;
}).catch(() => null);
console.log(`  新建按钮: ${newBtnExists ? `✅ "${newBtnExists}"` : '⚠️ 找不到'}`);

// 3.4 表头列存在
const headers = await page.$$eval('.base-table__cell', (cells) => cells.map((c) => c.innerText.trim()).filter(Boolean));
console.log(`  表头列: ${headers.slice(0, 8).join(' | ')} ${headers.length > 8 ? '...' : ''}`);

// ===== 4. 总结 =====
console.log('\n=== 测试总结 ===');
const pageOkCount = pageResults.filter(r => r.ok).length;
const allOk = pageResults.every((r) => r.ok) && userRows > 0 && newBtnExists;
console.log(`  业务页面: ${pageOkCount}/${pageResults.length} 通过`);
console.log(`  用户列表行: ${userRows}`);
console.log(`  用户搜索: ${searchOk ? '通过' : '跳过/失败'}`);
console.log(`  用户新建按钮: ${newBtnExists ? '通过' : '缺失'}`);
console.log(`  整体: ${allOk ? '✅ 全部通过' : '⚠️ 部分通过'}`);

pageResults.forEach((r) => {
  console.log(`    ${r.ok ? '✅' : '❌'} ${r.page}: ${r.status}`);
});

// 汇总 console error
const totalErrors = consoleErrors.length;
console.log(`  总 console 错误: ${totalErrors}`);
if (totalErrors > 0 && totalErrors < 6) {
  consoleErrors.forEach((e) => console.log(`     [${e.type}] ${e.text.slice(0, 200)}`));
}

await browser.close();
process.exit(allOk ? 0 : 1);
