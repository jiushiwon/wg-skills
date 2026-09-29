#!/usr/bin/env node
/**
 * verify-output.mjs — 验证优化/生成结果质量
 * 用法：node verify-output.mjs <project-path> [output.json]
 * 输出：质量检查报告
 */

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const root = process.argv[2] || process.cwd();
const outFile = process.argv[3];

function exists(p) { try { return fs.existsSync(p); } catch { return false; } }
function readJSON(p) { try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return null; } }
function readFile(p) { try { return fs.readFileSync(p, 'utf8'); } catch { return null; } }

const checks = [];
function check(name, status, message, fix = null) {
  checks.push({ name, status, message, fix });
}

// === 1. 构建检查 ===
const pkg = readJSON(path.join(root, 'package.json'));
if (pkg) {
  const hasBuildScript = pkg.scripts?.build;
  if (hasBuildScript) {
    try {
      const before = Date.now();
      execSync('npm run build', { cwd: root, stdio: 'pipe', timeout: 120000 });
      const duration = ((Date.now() - before) / 1000).toFixed(1);
      check('构建', 'pass', `构建成功，耗时 ${duration}s`);
    } catch (e) {
      check('构建', 'fail', '构建失败', '查看错误信息，修复后再验证');
    }
  } else {
    check('构建', 'na', '未配置 build 脚本');
  }
}

// === 2. Token 文件存在 ===
const tokenFiles = [
  'tokens.css', 'src/styles/tokens.css', 'src/assets/css/tokens.css',
  'tailwind.config.js', 'tailwind.config.ts', 'app/globals.css',
  'src/app.css', 'src/styles/global.css',
];
const hasToken = tokenFiles.some(f => exists(path.join(root, f)));
if (hasToken) {
  check('Token 文件', 'pass', '找到设计 Token 文件');
} else {
  check('Token 文件', 'warn', '未找到统一 Token 文件', '创建 src/styles/tokens.css 并引入 globals');
}

// === 3. viewport meta ===
const htmlFiles = [];
function findHtml(dir) {
  if (!exists(dir)) return;
  for (const e of fs.readdirSync(dir)) {
    if (['node_modules', 'dist', '.next'].includes(e)) continue;
    const p = path.join(dir, e);
    const s = fs.statSync(p);
    if (s.isDirectory()) findHtml(p);
    else if (p.endsWith('.html') || p.endsWith('.vue') || p.endsWith('.tsx')) htmlFiles.push(p);
  }
}
findHtml(root);

let viewportOk = true;
let viewportBad = 0;
let noViewport = 0;
for (const file of htmlFiles.slice(0, 20)) {
  const content = readFile(file) || '';
  if (/<meta\s+name=["']viewport["']/i.test(content)) {
    if (/maximum-scale\s*=\s*1|user-scalable\s*=\s*no/i.test(content)) {
      viewportBad++;
    }
  } else if (file.endsWith('.html')) {
    noViewport++;
  }
}
if (viewportBad > 0) {
  viewportOk = false;
  check('viewport', 'fail', `${viewportBad} 个文件禁用了缩放（违反 a11y）`, '移除 maximum-scale=1 或 user-scalable=no');
} else if (noViewport > 0) {
  check('viewport', 'warn', `${noViewport} 个 HTML 文件未配置 viewport meta`);
} else {
  check('viewport', 'pass', 'viewport 配置正确');
}

// === 4. AI Slop 检查 ===
const slopPatterns = [
  { re: /font-family\s*:\s*['"]?Inter['"]?\s*[;,}]/i, name: 'Inter 字体（AI slop）' },
  { re: /font-family\s*:\s*['"]?Roboto['"]?\s*[;,}]/i, name: 'Roboto 字体' },
  { re: /background-clip\s*:\s*text/i, name: '渐变文字' },
  { re: /border-left\s*:\s*[3-9]\d*px/i, name: '侧边色条边框' },
  { re: /backdrop-filter\s*:\s*blur\(\s*\d{2,}px\s*\)/i, name: '玻璃拟态（重度）' },
];

let slopHits = [];
for (const file of htmlFiles.slice(0, 30)) {
  const content = readFile(file) || '';
  for (const { re, name } of slopPatterns) {
    if (re.test(content)) slopHits.push({ file, issue: name });
  }
}
if (slopHits.length > 0) {
  check('AI Slop', 'warn', `检测到 ${slopHits.length} 处可能的 AI slop 模式`, '查看 anti-patterns.md 修正');
  check.slopHits = slopHits.slice(0, 10);
} else {
  check('AI Slop', 'pass', '未检测到典型 AI slop 模式');
}

// === 5. 触摸目标检查（CSS 中 height: 36px 之类的按钮）===
let smallTouchTargets = 0;
const touchPattern = /min-height\s*:\s*([3-3]\d)px/g;
for (const file of htmlFiles.slice(0, 20)) {
  const content = readFile(file) || '';
  let m;
  while ((m = touchPattern.exec(content)) !== null) {
    if (parseInt(m[1]) < 44) smallTouchTargets++;
  }
}
if (smallTouchTargets > 0) {
  check('触摸目标', 'warn', `检测到 ${smallTouchTargets} 个按钮触摸目标 < 44px`, '调整为 min-height: 44px');
} else {
  check('触摸目标', 'pass', '触摸目标尺寸符合规范');
}

// === 6. 间距 4pt 网格检查 ===
const spacingValues = new Set();
const spacingPattern = /(?:padding|margin|gap)\s*:\s*(\d+(?:\.\d+)?)px/g;
for (const file of htmlFiles.slice(0, 20)) {
  const content = readFile(file) || '';
  let m;
  while ((m = spacingPattern.exec(content)) !== null) {
    spacingValues.add(parseFloat(m[1]));
  }
}
const offGrid = [...spacingValues].filter(v => v > 0 && v % 4 !== 0);
if (offGrid.length > 0 && spacingValues.size > 0) {
  const ratio = offGrid.length / spacingValues.size;
  if (ratio > 0.3) {
    check('4pt 网格', 'warn', `约 ${Math.round(ratio * 100)}% 间距值不在 4pt 网格上（${offGrid.slice(0, 5).join(', ')}）`, '对齐到 4pt 网格');
  } else {
    check('4pt 网格', 'pass', `大部分间距值在 4pt 网格上`);
  }
} else {
  check('4pt 网格', 'na', '未发现 px 单位的间距值');
}

// === 7. 减弱动效支持 ===
let reducedMotionOk = 0;
const rmPattern = /prefers-reduced-motion/g;
for (const file of htmlFiles.slice(0, 20)) {
  if (rmPattern.test(readFile(file) || '')) reducedMotionOk++;
}
if (reducedMotionOk > 0) {
  check('减弱动效', 'pass', `${reducedMotionOk} 个文件支持 prefers-reduced-motion`);
} else {
  check('减弱动效', 'warn', '未检测到 prefers-reduced-motion 媒体查询', '在全局 CSS 中加入 @media (prefers-reduced-motion: reduce)');
}

// === 8. 颜色 token 化 ===
const cssContent = (() => {
  for (const f of tokenFiles) {
    if (exists(path.join(root, f))) return readFile(path.join(root, f)) || '';
  }
  return '';
})();
const hasCssVars = /--color-(primary|secondary|surface|on-surface)/.test(cssContent);
if (hasCssVars) {
  check('颜色 Token', 'pass', '检测到 CSS 变量定义的语义颜色');
} else {
  check('颜色 Token', 'warn', '未检测到颜色语义 Token', '添加 --color-primary / --color-surface 等');
}

// === 输出 ===
const result = {
  root,
  timestamp: new Date().toISOString(),
  summary: {
    total: checks.length,
    pass: checks.filter(c => c.status === 'pass').length,
    warn: checks.filter(c => c.status === 'warn').length,
    fail: checks.filter(c => c.status === 'fail').length,
    na: checks.filter(c => c.status === 'na').length,
  },
  checks,
};

if (outFile) fs.writeFileSync(outFile, JSON.stringify(result, null, 2));

console.log(JSON.stringify(result, null, 2));
console.log(`\n=== 总结 ===`);
console.log(`✅ 通过: ${result.summary.pass} | ⚠️ 警告: ${result.summary.warn} | ❌ 失败: ${result.summary.fail} | ⊘ 跳过: ${result.summary.na}`);
