#!/usr/bin/env node
/**
 * 生成激励时刻火焰和奖杯图标
 * 输出：icon-plan-streakFire.png, icon-plan-streakTrophy.png
 *
 * 用法：node scripts/gen-streak-icons.js
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const PROJECT_DIR = 'D:\\projects\\hv-health-miniapp';
const OUT_DIR = path.join(PROJECT_DIR, 'src', 'static', 'icons');

// 图标尺寸：192x192，显示时 64rpx 会更清晰
const SIZE = 192;

async function main() {
  // 确保目录存在
  fs.mkdirSync(OUT_DIR, { recursive: true });

  // 1. 火焰图标 - 橙红色渐变火焰
  const fireSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 192 192">
  <defs>
    <!-- 火焰渐变 -->
    <linearGradient id="fireGrad" x1="0%" y1="100%" x2="0%" y2="0%">
      <stop offset="0%" style="stop-color:#FF6B35;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#FF8C42;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#FFD166;stop-opacity:1" />
    </linearGradient>
    <!-- 内焰渐变 -->
    <linearGradient id="innerFireGrad" x1="0%" y1="100%" x2="0%" y2="0%">
      <stop offset="0%" style="stop-color:#FF8C42;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#FFE066;stop-opacity:1" />
    </linearGradient>
  </defs>
  <!-- 外焰 -->
  <path d="M96 16
           C96 16, 40 60, 40 110
           C40 140, 60 168, 96 176
           C132 168, 152 140, 152 110
           C152 60, 96 16, 96 16Z"
        fill="url(#fireGrad)"/>
  <!-- 内焰 -->
  <path d="M96 60
           C96 60, 66 90, 66 118
           C66 140, 78 156, 96 160
           C114 156, 126 140, 126 118
           C126 90, 96 60, 96 60Z"
        fill="url(#innerFireGrad)"/>
  <!-- 火焰高光 -->
  <ellipse cx="96" cy="120" rx="18" ry="24" fill="#FFF3E0" opacity="0.4"/>
</svg>`;

  // 2. 奖杯图标 - 金色奖杯
  const trophySvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 192 192">
  <defs>
    <!-- 奖杯渐变 -->
    <linearGradient id="trophyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#FFD700;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#FFA500;stop-opacity:1" />
    </linearGradient>
  </defs>
  <!-- 杯身 -->
  <path d="M60 30 L132 30 L126 100 C126 100, 120 120, 96 120 C72 120, 66 100, 66 100 Z"
        fill="url(#trophyGrad)"/>
  <!-- 左把手 -->
  <path d="M60 40 C40 40, 28 55, 28 72 C28 89, 40 100, 55 100"
        fill="none" stroke="#FFD700" stroke-width="8" stroke-linecap="round"/>
  <!-- 右把手 -->
  <path d="M132 40 C152 40, 164 55, 164 72 C164 89, 152 100, 137 100"
        fill="none" stroke="#FFD700" stroke-width="8" stroke-linecap="round"/>
  <!-- 底座 -->
  <rect x="80" y="120" width="32" height="20" rx="2" fill="#FFA500"/>
  <rect x="68" y="140" width="56" height="16" rx="4" fill="#FFD700"/>
  <!-- 杯身高光 -->
  <path d="M75 45 L85 45 L82 85 C82 85, 80 95, 75 95 Z"
        fill="#FFF8DC" opacity="0.5"/>
  <!-- 星星装饰 -->
  <path d="M96 55 L100 65 L110 67 L103 74 L105 84 L96 79 L87 84 L89 74 L82 67 L92 65 Z"
        fill="#FFF8DC" opacity="0.8"/>
</svg>`;

  const icons = [
    { name: 'icon-plan-streakFire.png', svg: fireSvg },
    { name: 'icon-plan-streakTrophy.png', svg: trophySvg },
  ];

  for (const icon of icons) {
    const outPath = path.join(OUT_DIR, icon.name);

    // 始终重新生成（覆盖旧的）
    try {
      await sharp(Buffer.from(icon.svg))
        .resize(SIZE, SIZE, { fit: 'contain' })
        .png({ quality: 100 })
        .toFile(outPath);
      const stats = fs.statSync(outPath);
      console.log(`[OK] ${icon.name} (${(stats.size / 1024).toFixed(1)} KB)`);
    } catch (e) {
      console.error(`[ERR] ${icon.name}: ${e.message}`);
    }
  }

  console.log('\nDone! Icons generated at:', OUT_DIR);
}

main().catch(e => {
  console.error('[ERR]', e.message);
  process.exit(1);
});
