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

const consoleLogs = [];
page.on('console', (msg) => consoleLogs.push({ type: msg.type(), text: msg.text() }));
page.on('pageerror', (err) => consoleLogs.push({ type: 'pageerror', text: err.message }));

console.log('=== 登录 + 菜单加载 ===');
await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle0', timeout: 15000 });
await page.waitForSelector('.login-card__submit', { timeout: 5000 });
await page.click('.login-card__submit');
await new Promise((r) => setTimeout(r, 3000));
console.log('落地 URL:', page.url());

console.log('\n=== 菜单 SVG icon 渲染统计 ===');
const svgStats = await page.evaluate(() => {
  const icons = document.querySelectorAll('.base-icon, .menu-icon, .sidebar svg');
  const rendered = Array.from(icons).filter((el) => {
    const html = el.innerHTML || el.outerHTML || '';
    return html.includes('<svg');
  });
  return {
    total: icons.length,
    rendered: rendered.length,
    sample: Array.from(icons).slice(0, 8).map((el) => ({
      tag: el.tagName,
      cls: el.className?.baseVal ?? el.className,
      svgIn: ((el.innerHTML || el.outerHTML) + '').includes('<svg'),
    })),
  };
});
console.log(`  菜单 icon 元素总数: ${svgStats.total}`);
console.log(`  含 SVG 元素数: ${svgStats.rendered}`);
console.log(`  比例: ${svgStats.total > 0 ? ((svgStats.rendered * 100) / svgStats.total).toFixed(0) + '%' : 'N/A'}`);
console.log('  样本（前 8）:');
svgStats.sample.forEach((s, i) => console.log(`    [${i}] tag=${s.tag} cls="${s.cls}" svgIn=${s.svgIn}`));

console.log('\n=== console.warn/error/pageerror 统计 ===');
const warnings = consoleLogs.filter((l) => ['warning', 'error', 'pageerror'].includes(l.type));
console.log(`  总警告/错误数: ${warnings.length}`);
warnings.slice(0, 10).forEach((w) => console.log(`    [${w.type}] ${w.text.slice(0, 200)}`));

const iconWarns = warnings.filter((w) => /BaseIcon|frontend-icon/.test(w.text));
console.log(`  BaseIcon/frontend-icon warn 数（应=0）: ${iconWarns.length}`);

await browser.close();
const ok = iconWarns.length === 0 && svgStats.rendered > 0 && svgStats.total > 0;
console.log(`\n=== 结果: ${ok ? '✅ PASS' : '❌ FAIL'} ===`);
process.exit(ok ? 0 : 1);