#!/usr/bin/env node
/**
 * 通用图标生成器：读取 JSON 配置，把 SVG path（或完整 svg）批量渲染成 PNG。
 * 用法：
 *   node forge-icons.js spec.json
 *   echo '{...}' | node forge-icons.js -
 *
 * 配置格式：
 * {
 *   "outDir": "D:/项目/src/static/icons",   // 必填，输出目录（自动创建）
 *   "size": 72,                              // 可选，输出像素，默认 72
 *   "color": "#059669",                      // 可选，描边色，默认 #059669
 *   "strokeWidth": 2,                        // 可选，描边宽度，默认 2
 *   "icons": [
 *     { "name": "a.png", "path": "M9 12h6..." },   // heroicons 风格 path
 *     { "name": "b.png", "svg": "<svg>...</svg>" }  // 或直接给完整 svg
 *   ]
 * }
 */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

function readSpec() {
  const arg = process.argv[2];
  if (!arg) {
    console.error('用法: node forge-icons.js <spec.json | ->');
    process.exit(1);
  }
  const raw = arg === '-' ? fs.readFileSync(0, 'utf8') : fs.readFileSync(arg, 'utf8');
  return JSON.parse(raw);
}

function buildSvg(icon, size, color, strokeWidth) {
  if (icon.svg) return icon.svg;
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round">
  <path d="${icon.path}" />
</svg>`;
}

async function main() {
  const spec = readSpec();
  const { outDir, size = 72, color = '#059669', strokeWidth = 2, icons } = spec;

  if (!outDir) throw new Error('配置缺少 outDir');
  if (!Array.isArray(icons) || icons.length === 0) throw new Error('配置缺少 icons 数组');

  fs.mkdirSync(outDir, { recursive: true });
  for (const icon of icons) {
    if (!icon.name) throw new Error('每个图标必须有 name');
    if (!icon.path && !icon.svg) throw new Error(`图标 ${icon.name} 缺少 path 或 svg`);
    const svg = buildSvg(icon, size, color, strokeWidth);
    const outPath = path.join(outDir, icon.name);
    await sharp(Buffer.from(svg)).resize(size, size, { fit: 'contain' }).png().toFile(outPath);
    console.log('[OK]', outPath);
  }
  console.log(`Done! ${icons.length} icons -> ${outDir}`);
}

main().catch((e) => { console.error('[ERR]', e.message); process.exit(1); });
