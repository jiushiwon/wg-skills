#!/usr/bin/env node
/**
 * match-profile.mjs — 把项目事实 Token 匹配到品牌/调色板画像
 * 用法：node match-profile.mjs <extract-tokens-output.json>
 * 输出：matched brand, confidence, drift, strategy recommendation
 */

import fs from 'node:fs';

const inputFile = process.argv[2];
if (!inputFile) {
  console.error('Usage: node match-profile.mjs <extract-tokens.json>');
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(inputFile, 'utf8'));

// === 10 套调色板特征 ===
const PALETTE_SIGNATURES = {
  vermilionAmber: {
    name: '赤琥金',
    hueCenter: 28,
    hueSpread: 30,
    chroma: 0.10,
    lightnessRange: [0.15, 0.75],
    mood: 'warm-literary',
  },
  coldMinimal: {
    name: '冷调极简',
    hueCenter: 250,
    hueSpread: 25,
    chroma: 0.05,
    lightnessRange: [0.10, 0.95],
    mood: 'cool-minimal',
  },
  warmBusiness: {
    name: '暖色商务',
    hueCenter: 30,
    hueSpread: 40,
    chroma: 0.15,
    lightnessRange: [0.20, 0.80],
    mood: 'warm-business',
  },
  dataDark: {
    name: '数据深色',
    hueCenter: 195,
    hueSpread: 50,
    chroma: 0.12,
    lightnessRange: [0.10, 0.70],
    mood: 'dark-data',
  },
  financeSolid: {
    name: '金融稳重',
    hueCenter: 155,
    hueSpread: 30,
    chroma: 0.08,
    lightnessRange: [0.20, 0.80],
    mood: 'trust-finance',
  },
  docsFresh: {
    name: '文档清爽',
    hueCenter: 270,
    hueSpread: 30,
    chroma: 0.08,
    lightnessRange: [0.20, 0.95],
    mood: 'clean-docs',
  },
  creativeAd: {
    name: '创意广告',
    hueCenter: 270,
    hueSpread: 10,
    chroma: 0.01,
    lightnessRange: [0.10, 0.99],
    mood: 'white-canvas',
  },
  nativeMobile: {
    name: '原生移动',
    hueCenter: 250,
    hueSpread: 60,
    chroma: 0.15,
    lightnessRange: [0.20, 0.90],
    mood: 'platform-native',
  },
  threejsImmersive: {
    name: '3D 沉浸',
    hueCenter: 320,
    hueSpread: 60,
    chroma: 0.20,
    lightnessRange: [0.10, 0.80],
    mood: 'immersive-dark',
  },
  b2bSlate: {
    name: '2B 灰蓝',
    hueCenter: 240,
    hueSpread: 20,
    chroma: 0.05,
    lightnessRange: [0.20, 0.95],
    mood: 'b2b-slate',
  },
};

// === 颜色到 hue / chroma / lightness 转换（简化）===
function hexToHsl(hex) {
  hex = hex.replace('#', '');
  if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
  const r = parseInt(hex.slice(0, 2), 16) / 255;
  const g = parseInt(hex.slice(2, 4), 16) / 255;
  const b = parseInt(hex.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0, s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)); break;
      case g: h = ((b - r) / d + 2); break;
      case b: h = ((r - g) / d + 4); break;
    }
    h *= 60;
  }
  return { h, s, l };
}

// === 提取主色相 ===
function extractDominantHues(colors) {
  const hues = [];
  for (const [color, count] of colors) {
    if (color.startsWith('#') && color.length === 7) {
      const { h, s, l } = hexToHsl(color);
      // 忽略太亮/太暗的中性色
      if (l > 0.05 && l < 0.95 && s > 0.05) {
        hues.push({ h, s, l, count });
      }
    } else if (color.startsWith('oklch')) {
      // 简化：跳过 oklch
    }
  }
  // 加权平均
  const totalCount = hues.reduce((sum, x) => sum + x.count, 0);
  if (totalCount === 0) return null;
  let avgHue = 0;
  for (const x of hues) {
    avgHue += (x.h * x.count) / totalCount;
  }
  // 计算色相方差
  const variance = hues.reduce((sum, x) => {
    const d = Math.min(Math.abs(x.h - avgHue), 360 - Math.abs(x.h - avgHue));
    return sum + (d * d * x.count) / totalCount;
  }, 0);
  const spread = Math.sqrt(variance);
  return { avgHue, spread, lightness: hues.reduce((s, x) => s + x.l * x.count, 0) / totalCount, chroma: hues.reduce((s, x) => s + x.s * x.count, 0) / totalCount };
}

// === 匹配调色板 ===
const projectHues = extractDominantHues(data.colors || []);

let bestMatch = null;
let bestScore = -1;
const matches = [];

if (projectHues) {
  for (const [key, sig] of Object.entries(PALETTE_SIGNATURES)) {
    // Hue 距离（环形）
    const hueDiff = Math.min(
      Math.abs(projectHues.avgHue - sig.hueCenter),
      360 - Math.abs(projectHues.avgHue - sig.hueCenter)
    );
    const hueScore = Math.max(0, 1 - hueDiff / 180);
    const spreadScore = Math.max(0, 1 - Math.abs(projectHues.spread - sig.hueSpread) / 90);
    const score = (hueScore * 0.6 + spreadScore * 0.4);

    matches.push({ key, name: sig.name, score, hueDiff, spread: projectHues.spread });
    if (score > bestScore) {
      bestScore = score;
      bestMatch = { key, name: sig.name, score, mood: sig.mood };
    }
  }
}

// === 字体匹配 ===
const fontFamilies = (data.fontFamilies || []).map(([name]) => name.toLowerCase());
const hasChineseFont = fontFamilies.some(f => /noto sans sc|pingfang|yahei|han/i.test(f));
const hasInter = fontFamilies.some(f => /inter/i.test(f));
const hasGeist = fontFamilies.some(f => /geist/i.test(f));
const hasFraunces = fontFamilies.some(f => /fraunces|tiempos|playfair/i.test(f));

let fontProfile = 'unknown';
if (hasChineseFont && hasInter) fontProfile = 'chinese-tech-with-inter';
else if (hasChineseFont) fontProfile = 'chinese-tech';
else if (hasGeist) fontProfile = 'geist';
else if (hasFraunces) fontProfile = 'editorial';
else if (hasInter) fontProfile = 'inter-heavy';

// === 圆角分析 ===
const radii = (data.radii || []).map(([r]) => parseFloat(r)).filter(n => !isNaN(n));
const uniqueRadii = [...new Set(radii)].sort((a, b) => a - b);
const radiusProfile = {
  min: uniqueRadii[0] || 0,
  max: uniqueRadii[uniqueRadii.length - 1] || 0,
  uniqueCount: uniqueRadii.length,
  standardSet: uniqueRadii.every(r => [0, 2, 4, 6, 8, 10, 12, 16, 24, 9999].includes(r)),
};

// === 间距分析 ===
const spacings = (data.spacings || []).map(([s]) => parseFloat(s)).filter(n => !isNaN(n));
const onGrid = spacings.filter(s => s % 4 === 0).length;
const spacingProfile = {
  uniqueCount: [...new Set(spacings)].length,
  onGridRatio: spacings.length > 0 ? onGrid / spacings.length : 1,
};

// === 优化策略推荐 ===
const drift = [];

// 颜色匹配度低
if (bestScore < 0.5) {
  drift.push('当前调色板与主流设计语言差异较大');
}

// 圆角过多
if (radiusProfile.uniqueCount > 8) {
  drift.push(`圆角有 ${radiusProfile.uniqueCount} 种不同值，建议收敛到 5-6 档`);
}

// 间距不在 4pt 网格
if (spacingProfile.onGridRatio < 0.7) {
  drift.push(`约 ${Math.round((1 - spacingProfile.onGridRatio) * 100)}% 间距值不在 4pt 网格上`);
}

// 颜色过多
if (data.summary.uniqueColors > 30) {
  drift.push(`检测到 ${data.summary.uniqueColors} 种独立颜色值，建议用 CSS 变量统一`);
}

// 字体过多
if (data.summary.uniqueFontFamilies > 5) {
  drift.push(`字体家族过多（${data.summary.uniqueFontFamilies}），建议 ≤3 种`);
}

let strategy = 'conservative';  // 保守
if (drift.length === 0) strategy = 'conservative';
else if (drift.length <= 2) strategy = 'gradual';      // 渐进（默认）
else if (drift.length <= 4) strategy = 'gradual';
else strategy = 'reshape';                              // 重塑

const result = {
  projectHues,
  bestMatch: bestMatch || { name: '未匹配', score: 0 },
  fontProfile,
  radiusProfile,
  spacingProfile,
  drift,
  strategy,
  strategyDescription: {
    conservative: '保留现状，仅统一不一致项（最低风险）',
    gradual: '对齐到匹配品牌/调色板 80%（推荐）',
    reshape: '完全重塑为统一设计系统（高风险）',
  }[strategy],
  matches: matches.sort((a, b) => b.score - a.score).slice(0, 3),
  warnings: data.warnings || [],
};

console.log(JSON.stringify(result, null, 2));
