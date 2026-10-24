#!/usr/bin/env node
/**
 * 小程序端专项可执行检查（胶囊避让 / 键盘顶起 / 小程序端不可用写法）
 *
 * 用法：node scripts/check-miniprogram.js [项目根目录]
 *        默认可疑目录为当前工作目录下的 src/
 * 退出码：0 = 无 P0/P1；1 = 存在 P0/P1 问题
 *
 * 判据来源：uniapp/AGENTS.md §9「小程序端专项」
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(process.argv[2] || process.cwd());
const srcDir = fs.existsSync(path.join(root, 'src')) ? path.join(root, 'src') : root;

const findings = [];
const add = (level, rule, file, line, message) =>
  findings.push({ level, rule, file: path.relative(root, file), line, message });

/** 去掉注释，避免把注释里的示例代码当成真问题 */
function stripComments(src) {
  return src.replace(/<!--[\s\S]*?-->/g, '').replace(/\/\*[\s\S]*?\*\//g, '');
}

/** 收集 .vue / .json 文件 */
function collect(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) collect(full, out);
    else if (/\.(vue|json)$/.test(entry.name)) out.push(full);
  }
  return out;
}

const files = collect(srcDir);
const vueFiles = files.filter((f) => f.endsWith('.vue'));

// ---- M1：scoped 样式里定义 :root 变量（编译后匹配不到根元素，变量静默失效）----
for (const file of vueFiles) {
  const src = stripComments(fs.readFileSync(file, 'utf8'));
  const styleRe = /<style[^>]*scoped[^>]*>([\s\S]*?)<\/style>/g;
  for (const m of src.matchAll(styleRe)) {
    const body = m[1];
    const rootIdx = body.indexOf(':root');
    if (rootIdx === -1) continue;
    const line = src.slice(0, src.indexOf(body) + rootIdx).split('\n').length;
    add('P0', 'M1', file, line, 'scoped 样式中定义了 :root 变量，编译为 :root[data-v-xxx] 后匹配不到 <html>，变量静默失效');
  }
}

// ---- K1：输入框未声明 adjust-position（键盘顶起）----
for (const file of vueFiles) {
  const src = fs.readFileSync(file, 'utf8');
  for (const m of src.matchAll(/<(input|textarea)\b[^>]*>/g)) {
    if (!/adjust-position/.test(m[0])) {
      const line = src.slice(0, m.index).split('\n').length;
      add('P1', 'K1', file, line, `<${m[1]}> 未声明 adjust-position，键盘弹起时可能被遮挡`);
    }
  }
}

// ---- M2：自定义导航页未读取胶囊位置 ----
const pagesJson = path.join(srcDir, 'pages.json');
let customNav = false;
if (fs.existsSync(pagesJson)) {
  const raw = fs.readFileSync(pagesJson, 'utf8');
  customNav = /"navigationStyle"\s*:\s*"custom"/.test(raw);
}
if (customNav) {
  const hasCapsule = files.some((f) =>
    /getMenuButtonBoundingClientRect|getNavbarHeight|getNavbarMetrics/.test(fs.readFileSync(f, 'utf8'))
  );
  if (!hasCapsule) {
    add('P1', 'M2', pagesJson, 1, '存在 navigationStyle=custom 的页面，但全项目未读取胶囊位置（getMenuButtonBoundingClientRect），标题可能压住胶囊');
  }
}

// ---- M7：小程序端不识别的 HTML 标签 ----
const HTML_TAGS = /<(div|span|strong|em|p|ul|ol|li|h[1-6]|img|section|article|header|footer|main|nav|button|form|label|a)\b[\s>]/gi;
for (const file of vueFiles) {
  const src = stripComments(fs.readFileSync(file, 'utf8'));
  const templateEnd = src.indexOf('</template>');
  const template = templateEnd === -1 ? src : src.slice(0, templateEnd);
  for (const m of template.matchAll(HTML_TAGS)) {
    const line = template.slice(0, m.index).split('\n').length;
    add('P1', 'M7', file, line, `模板中出现 HTML 标签 <${m[1]}>，小程序端不识别`);
  }
}

// ---- M8：DOM 式图片兜底（event.target.src）----
for (const file of vueFiles) {
  const src = stripComments(fs.readFileSync(file, 'utf8'));
  const re = /event\.target[^\n]*\.src|target as HTMLImageElement/g;
  for (const m of src.matchAll(re)) {
    const line = src.slice(0, m.index).split('\n').length;
    add('P1', 'M8', file, line, '用 event.target.src 做图片兜底，小程序端无 DOM 节点，应改为状态变量');
  }
}

// ---- M9：登录 / 注册页缺四态（loading / error / 重试）----
for (const file of vueFiles) {
  const rel = path.relative(root, file);
  if (!/(login|register|sign-?in|sign-?up)/i.test(rel)) continue;
  const src = fs.readFileSync(file, 'utf8');
  const missing = [];
  if (!/loading/i.test(src)) missing.push('loading');
  if (!/error/i.test(src)) missing.push('error');
  if (!/retry|重试/i.test(src)) missing.push('重试');
  if (missing.length > 0) {
    add('P2', 'M9', file, 1, `登录/注册页缺少状态：${missing.join(' / ')}`);
  }
}

// ---- 输出 ----
const order = { P0: 0, P1: 1, P2: 2 };
findings.sort((a, b) => order[a.level] - order[b.level] || a.file.localeCompare(b.file) || a.line - b.line);

if (findings.length === 0) {
  console.log(`小程序端专项检查通过：${vueFiles.length} 个组件文件，无 P0/P1 问题。`);
  process.exit(0);
}

const blocking = findings.filter((f) => f.level === 'P0' || f.level === 'P1');
console.log(`小程序端专项检查：共 ${findings.length} 处（P0 ${count('P0')} / P1 ${count('P1')} / P2 ${count('P2')}）\n`);
findings.forEach((f) => console.log(`  [${f.level}] ${f.rule} ${f.file}:${f.line} ${f.message}`));
process.exit(blocking.length > 0 ? 1 : 0);

function count(level) {
  return findings.filter((f) => f.level === level).length;
}
