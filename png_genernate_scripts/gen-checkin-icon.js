#!/usr/bin/env node
/**
 * 生成打卡日历的打勾图标
 * 输出：static/icons/checkin-check.png
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const PROJECT_DIR = path.resolve(__dirname, '..', 'hv-health-miniapp');
const OUT_DIR = path.join(PROJECT_DIR, 'src', 'static', 'icons');

// 主题色
const THEME = { r: 123, g: 165, b: 157 }; // #7BA59D

async function main() {
  const size = 32;
  const iconSize = 18;
  const iconStroke = 2.5;

  // 创建 SVG 图标：圆圈内打勾
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <!-- 圆形背景 -->
  <circle cx="${size/2}" cy="${size/2}" r="${size/2 - 1}" fill="#7BA59D"/>
  <!-- 打勾路径 -->
  <path d="M9 16 L14 21 L22 10"
        stroke="white"
        stroke-width="${iconStroke}"
        stroke-linecap="round"
        stroke-linejoin="round"
        fill="none"/>
</svg>`;

  const outPath = path.join(OUT_DIR, 'checkin-check.png');

  // 确保目录存在
  fs.mkdirSync(OUT_DIR, { recursive: true });

  // 生成 PNG
  await sharp(Buffer.from(svg))
    .resize(size, size, { fit: 'contain' })
    .png()
    .toFile(outPath);

  console.log('[OK]', outPath);
}

main().catch(e => {
  console.error('[ERR]', e.message);
  process.exit(1);
});