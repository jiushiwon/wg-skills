#!/usr/bin/env node
/**
 * 生成健康数据统计卡片图标
 * 输出：static/icons/stat-completed.png, stat-pending.png, stat-skipped.png
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const PROJECT_DIR = 'D:\\projects\\hv-health-miniapp';
const OUT_DIR = path.join(PROJECT_DIR, 'src', 'static', 'icons');

const SIZE = 128;

async function main() {
  // 确保目录存在
  fs.mkdirSync(OUT_DIR, { recursive: true });

  // 1. 已完成图标 - 浅色对勾（白色半透明）
  const completedSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 128 128">
  <!-- 圆形边框 -->
  <circle cx="64" cy="64" r="56" fill="none" stroke="rgba(255,255,255,0.85)" stroke-width="5"/>
  <!-- 对勾 -->
  <path d="M36 64 L56 84 L92 44"
        stroke="rgba(255,255,255,0.9)"
        stroke-width="7"
        stroke-linecap="round"
        stroke-linejoin="round"
        fill="none"/>
</svg>`;

  // 2. 待完成图标 - 浅色时钟（白色半透明）
  const pendingSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 128 128">
  <!-- 圆形边框 -->
  <circle cx="64" cy="64" r="56" fill="none" stroke="rgba(255,255,255,0.85)" stroke-width="5"/>
  <!-- 时钟指针 -->
  <line x1="64" y1="64" x2="64" y2="36" stroke="rgba(255,255,255,0.9)" stroke-width="6" stroke-linecap="round"/>
  <line x1="64" y1="64" x2="84" y2="64" stroke="rgba(255,255,255,0.9)" stroke-width="6" stroke-linecap="round"/>
  <!-- 中心点 -->
  <circle cx="64" cy="64" r="4" fill="rgba(255,255,255,0.9)"/>
</svg>`;

  // 3. 已跳过图标 - 浅色快进（白色半透明）
  const skippedSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 128 128">
  <!-- 圆形边框 -->
  <circle cx="64" cy="64" r="56" fill="none" stroke="rgba(255,255,255,0.85)" stroke-width="5"/>
  <!-- 快进三角形 1 -->
  <path d="M40 40 L72 64 L40 88 Z" fill="rgba(255,255,255,0.85)"/>
  <!-- 快进三角形 2 -->
  <path d="M68 40 L100 64 L68 88 Z" fill="rgba(255,255,255,0.85)"/>
</svg>`;

  // 4. 睡眠图标 - 月亮
  const sleepSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 128 128">
  <path d="M64 20 C40 20 20 40 20 64 C20 88 40 108 64 108 C88 108 108 88 108 64 C108 40 88 20 64 20 Z"
        fill="none" stroke="#9C27B0" stroke-width="5"/>
  <path d="M64 20 C48 36 48 56 64 72 C48 72 36 64 28 52 C36 80 56 100 84 104 C76 108 64 108 52 100 C40 92 36 76 40 60 C44 44 56 32 72 28 C68 24 64 20 64 20 Z"
        fill="#9C27B0"/>
</svg>`;

  // 5. 心情图标 - 笑脸
  const moodSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 128 128">
  <circle cx="64" cy="64" r="52" fill="none" stroke="#FF9800" stroke-width="5"/>
  <circle cx="44" cy="52" r="6" fill="#FF9800"/>
  <circle cx="84" cy="52" r="6" fill="#FF9800"/>
  <path d="M40 76 Q64 100 88 76" fill="none" stroke="#FF9800" stroke-width="5" stroke-linecap="round"/>
</svg>`;

  // 6. 冥想图标 - 莲花
  const meditationSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 128 128">
  <path d="M64 30 Q44 50 44 70 Q44 90 64 100 Q84 90 84 70 Q84 50 64 30 Z"
        fill="none" stroke="#00BCD4" stroke-width="5"/>
  <path d="M64 100 Q44 80 30 70 Q44 70 64 80" fill="none" stroke="#00BCD4" stroke-width="4"/>
  <path d="M64 100 Q84 80 98 70 Q84 70 64 80" fill="none" stroke="#00BCD4" stroke-width="4"/>
  <circle cx="64" cy="70" r="8" fill="#00BCD4"/>
</svg>`;

  // 7. 饮水图标 - 水滴
  const waterSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 128 128">
  <path d="M64 20 Q32 64 32 84 Q32 108 64 108 Q96 108 96 84 Q96 64 64 20 Z"
        fill="none" stroke="#2196F3" stroke-width="5"/>
  <path d="M48 84 Q56 76 64 84 Q72 92 80 84" fill="none" stroke="#2196F3" stroke-width="4" stroke-linecap="round"/>
</svg>`;

  const icons = [
    { name: 'stat-completed.png', svg: completedSvg },
    { name: 'stat-pending.png', svg: pendingSvg },
    { name: 'stat-skipped.png', svg: skippedSvg },
    { name: 'sleep.png', svg: sleepSvg },
    { name: 'mood.png', svg: moodSvg },
    { name: 'meditation.png', svg: meditationSvg },
    { name: 'water.png', svg: waterSvg },
  ];

  for (const icon of icons) {
    const outPath = path.join(OUT_DIR, icon.name);

    if (fs.existsSync(outPath)) {
      console.log(`[EXISTS] ${icon.name} already exists`);
      continue;
    }

    try {
      await sharp(Buffer.from(icon.svg))
        .resize(SIZE, SIZE, { fit: 'contain' })
        .png()
        .toFile(outPath);
      console.log(`[OK] ${icon.name}`);
    } catch (e) {
      console.error(`[ERR] ${icon.name}: ${e.message}`);
    }
  }

  console.log('\nDone!');
}

main().catch(e => {
  console.error('[ERR]', e.message);
  process.exit(1);
});
