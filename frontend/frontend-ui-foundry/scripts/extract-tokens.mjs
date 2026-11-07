#!/usr/bin/env node
/**
 * extract-tokens.mjs — 从现有代码提取"事实设计 Token"
 * 用法：node extract-tokens.mjs [path]
 * 输出：colors / typography / spacing / radius / shadows / motion 的频次统计
 */

import fs from 'node:fs';
import path from 'node:path';

const root = process.argv[2] || process.cwd();

const SKIP_DIRS = new Set(['node_modules', 'dist', 'build', '.git', '.next', 'unpackage', '.nuxt', '.svelte-kit', '.output', 'coverage']);
const EXTENSIONS = ['.vue', '.tsx', '.jsx', '.svelte', '.html', '.css', '.scss', '.sass', '.less'];

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir)) {
    if (SKIP_DIRS.has(entry)) continue;
    const full = path.join(dir, entry);
    const st = fs.statSync(full);
    if (st.isDirectory()) walk(full, files);
    else if (EXTENSIONS.some(ext => full.endsWith(ext))) files.push(full);
  }
  return files;
}

const files = walk(root);

// 计数器
const tokens = {
  colors: new Map(),         // #hex / rgb() / hsl() / oklch()
  fontFamilies: new Map(),
  fontSizes: new Map(),      // 16px / 1rem / 16 / 32rpx
  fontWeights: new Map(),
  lineHeights: new Map(),
  spacings: new Map(),       // padding/margin/gap 值
  radii: new Map(),
  shadows: new Map(),
  durations: new Map(),      // 150ms / 0.15s
  easings: new Map(),
  breakpoints: new Map(),
};

// === 正则 ===
const RE_HEX = /#([0-9a-f]{3,8})\b/gi;
const RE_RGB = /rgba?\s*\(\s*([\d\s,%.]+)\s*\)/gi;
const RE_HSL = /hsla?\s*\(\s*([\d\s,%.deg]+)\s*\)/gi;
const RE_OKLCH = /oklch\s*\(\s*([^)]+)\s*\)/gi;
const RE_FONT_FAMILY = /font-family\s*:\s*([^;}\n]+)/gi;
const RE_FONT_SIZE = /font-size\s*:\s*([^;}\n]+)/gi;
const RE_FONT_WEIGHT = /font-weight\s*:\s*([^;}\n]+)/gi;
const RE_LINE_HEIGHT = /line-height\s*:\s*([^;}\n]+)/gi;
const RE_PADDING = /(?:padding|padding-(?:top|right|bottom|left|inline|block))\s*:\s*([^;}\n]+)/gi;
const RE_MARGIN = /(?:margin|margin-(?:top|right|bottom|left|inline|block))\s*:\s*([^;}\n]+)/gi;
const RE_GAP = /gap\s*:\s*([^;}\n]+)/gi;
const RE_RADIUS = /border-radius\s*:\s*([^;}\n]+)/gi;
const RE_SHADOW = /box-shadow\s*:\s*([^;}\n]+)/gi;
const RE_DURATION = /(?:transition|animation)-duration\s*:\s*([^;}\n]+)/gi;
const RE_TRANSITION = /transition\s*:\s*([^;}\n]+)/gi;
const RE_BREAKPOINT = /@media\s*\(\s*(?:min|max)-width\s*:\s*([^)]+)\)/gi;

function count(map, value) {
  if (!value || typeof value !== 'string') return;
  const v = value.trim().replace(/\s+/g, ' ');
  if (!v) return;
  map.set(v, (map.get(v) || 0) + 1);
}

// === 主扫描 ===
for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');

  let m;
  while ((m = RE_HEX.exec(content)) !== null) count(tokens.colors, m[0]);
  while ((m = RE_RGB.exec(content)) !== null) count(tokens.colors, m[0]);
  while ((m = RE_HSL.exec(content)) !== null) count(tokens.colors, m[0]);
  while ((m = RE_OKLCH.exec(content)) !== null) count(tokens.colors, m[0]);

  while ((m = RE_FONT_FAMILY.exec(content)) !== null) count(tokens.fontFamilies, m[1]);
  while ((m = RE_FONT_SIZE.exec(content)) !== null) count(tokens.fontSizes, m[1]);
  while ((m = RE_FONT_WEIGHT.exec(content)) !== null) count(tokens.fontWeights, m[1]);
  while ((m = RE_LINE_HEIGHT.exec(content)) !== null) count(tokens.lineHeights, m[1]);

  while ((m = RE_PADDING.exec(content)) !== null) count(tokens.spacings, m[1]);
  while ((m = RE_MARGIN.exec(content)) !== null) count(tokens.spacings, m[1]);
  while ((m = RE_GAP.exec(content)) !== null) count(tokens.spacings, m[1]);

  while ((m = RE_RADIUS.exec(content)) !== null) count(tokens.radii, m[1]);
  while ((m = RE_SHADOW.exec(content)) !== null) count(tokens.shadows, m[1]);

  while ((m = RE_DURATION.exec(content)) !== null) count(tokens.durations, m[1]);
  while ((m = RE_TRANSITION.exec(content)) !== null) count(tokens.transitions, m[1]);

  while ((m = RE_BREAKPOINT.exec(content)) !== null) count(tokens.breakpoints, m[1]);

  // 重置
  [RE_HEX, RE_RGB, RE_HSL, RE_OKLCH, RE_FONT_FAMILY, RE_FONT_SIZE, RE_FONT_WEIGHT,
   RE_LINE_HEIGHT, RE_PADDING, RE_MARGIN, RE_GAP, RE_RADIUS, RE_SHADOW,
   RE_DURATION, RE_TRANSITION, RE_BREAKPOINT].forEach(re => re.lastIndex = 0);
}

// === 排序输出 ===
function sortedMap(map, limit = 30) {
  return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit);
}

const result = {
  root,
  filesScanned: files.length,
  summary: {
    uniqueColors: tokens.colors.size,
    uniqueFontFamilies: tokens.fontFamilies.size,
    uniqueFontSizes: tokens.fontSizes.size,
    uniqueSpacings: tokens.spacings.size,
    uniqueRadii: tokens.radii.size,
    uniqueShadows: tokens.shadows.size,
    uniqueDurations: tokens.durations.size,
    uniqueBreakpoints: tokens.breakpoints.size,
  },
  colors: sortedMap(tokens.colors, 30),
  fontFamilies: sortedMap(tokens.fontFamilies, 15),
  fontSizes: sortedMap(tokens.fontSizes, 15),
  fontWeights: sortedMap(tokens.fontWeights, 10),
  lineHeights: sortedMap(tokens.lineHeights, 10),
  spacings: sortedMap(tokens.spacings, 30),
  radii: sortedMap(tokens.radii, 15),
  shadows: sortedMap(tokens.shadows, 15),
  durations: sortedMap(tokens.durations, 15),
  breakpoints: sortedMap(tokens.breakpoints, 10),
};

// === 一致性检查 ===
const warnings = [];

// 颜色：超过 20 种独立色相说明缺少 token 化
if (result.summary.uniqueColors > 30) {
  warnings.push(`检测到 ${result.summary.uniqueColors} 种独立颜色值，建议用 CSS 变量统一`);
}

// 间距：超过 15 种不同值说明不在 4pt 网格上
const spacingValues = [...tokens.spacings.keys()];
const onGrid = spacingValues.filter(v => {
  const px = parseFloat(v);
  if (isNaN(px)) return true; // 非 px 单位跳过
  return px % 4 === 0;
});
if (spacingValues.length > 0 && onGrid.length / spacingValues.length < 0.7) {
  warnings.push(`约 ${Math.round((1 - onGrid.length / spacingValues.length) * 100)}% 的间距值不在 4pt 网格上`);
}

// 圆角：超过 8 种不同值说明不一致
if (result.summary.uniqueRadii > 8) {
  warnings.push(`检测到 ${result.summary.uniqueRadii} 种不同圆角，建议收敛到 5-6 档`);
}

// 字体：超过 4 种字族说明太多
if (result.summary.uniqueFontFamilies > 5) {
  warnings.push(`检测到 ${result.summary.uniqueFontFamilies} 种字体家族，建议 ≤3 种`);
}

result.warnings = warnings;

console.log(JSON.stringify(result, null, 2));
