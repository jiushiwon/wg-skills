import puppeteer from 'puppeteer-core';

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const browser = await puppeteer.launch({
  executablePath: EDGE,
  headless: 'new',
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});

const page = await browser.newPage();
await page.evaluateOnNewDocument(() => {
  try { localStorage.clear(); sessionStorage.clear(); } catch (e) {}
});

await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle0' });
await page.waitForSelector('.login-card__submit', { timeout: 5000 });
await page.click('.login-card__submit');
await new Promise((r) => setTimeout(r, 2500));

const token = await page.evaluate(() => localStorage.getItem('vue_admin_token'));
console.log('login token:', token ? 'OK' : 'MISSING');

const createResult = await page.evaluate(async (token) => {
  const res = await fetch('http://localhost:8080/api/roles', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      name: 'AuditRole_2026',
      code: 'audit_role_2026',
      description: 'audit-2026-09-23 CRUD test',
      dataScope: 'ALL',
      sortOrder: 99,
      status: 1,
    }),
  });
  return { status: res.status, body: await res.json() };
}, token);
console.log(`POST /api/roles: ${createResult.status}`, JSON.stringify(createResult.body).slice(0, 200));

const roleId = createResult.body?.data?.id;
console.log('roleId:', roleId);

const listResult = await page.evaluate(async (token) => {
  const res = await fetch('http://localhost:8080/api/roles?page=1&size=50', {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  return await res.json();
}, token);
const found = listResult.data?.items?.find((r) => r.code === 'audit_role_2026');
console.log(`GET /api/roles contains new role: ${found ? 'YES' : 'NO'} (id=${found?.id})`);

if (roleId) {
  const delResult = await page.evaluate(async ({ token, id }) => {
    const res = await fetch(`http://localhost:8080/api/roles/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return { status: res.status, body: await res.json() };
  }, { token, id: roleId });
  console.log(`DELETE /api/roles/${roleId}: ${delResult.status}`, JSON.stringify(delResult.body).slice(0, 100));
}

await browser.close();
const ok = found && roleId && createResult.status === 200;
console.log(`\nresult: ${ok ? 'PASS' : 'FAIL'}`);
process.exit(ok ? 0 : 1);