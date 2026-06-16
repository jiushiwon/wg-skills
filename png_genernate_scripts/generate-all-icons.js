#!/usr/bin/env node
/**
 * 批量图标生成脚本
 * 将 scripts/svgs/ 和 scripts/svgs/tabbar/ 下的 SVG 文件转换为 PNG
 *
 * 用法:
 *     node scripts/generate-all-icons.js
 */

const fs = require('fs');
const path = require('path');

const BASE_DIR = path.dirname(__dirname);
const sharp = require(path.join(BASE_DIR, 'frontend', 'node_modules', 'sharp'));
const SVGS_DIR = path.join(BASE_DIR, 'scripts', 'svgs');
const TABBAR_SVGS_DIR = path.join(SVGS_DIR, 'tabbar');
const OUTPUT_TABBAR = path.join(BASE_DIR, 'frontend', 'src', 'static', 'tabbar');
const OUTPUT_IMAGES = path.join(BASE_DIR, 'frontend', 'src', 'static', 'images');
const OUTPUT_ICONS = path.join(BASE_DIR, 'frontend', 'src', 'static', 'icons');

/**
 * 替换 SVG 中的 currentColor 为指定颜色
 */
function replaceSvgColor(svgContent, color) {
  return svgContent
    .replace(/stroke="currentColor"/gi, `stroke="${color}"`)
    .replace(/stroke='currentColor'/gi, `stroke="${color}"`)
    .replace(/fill="currentColor"/gi, `fill="${color}"`)
    .replace(/fill='currentColor'/gi, `fill="${color}"`);
}

/**
 * 将 SVG 转换为指定尺寸的 PNG
 */
async function svgToPng(svgPath, pngPath, width, height, color = null) {
  let svgContent = fs.readFileSync(svgPath, 'utf-8');

  if (color) {
    svgContent = replaceSvgColor(svgContent, color);
  }

  fs.mkdirSync(path.dirname(pngPath), { recursive: true });

  await sharp(Buffer.from(svgContent))
    .resize(width, height, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(pngPath);

  console.log(`  [OK] ${path.relative(BASE_DIR, pngPath)} (${width}x${height})`);
}

/**
 * 处理 tabBar 图标：81x81px
 */
async function processTabbarIcons() {
  console.log('\n[TABBAR] 生成 tabBar 图标 (81x81px)...');

  const icons = [
    { name: 'home', color: '#8C8C8C' },
    { name: 'home-active', color: '#7BA59D' },
    { name: 'dashboard', color: '#8C8C8C' },
    { name: 'dashboard-active', color: '#7BA59D' },
    { name: 'profile', color: '#8C8C8C' },
    { name: 'profile-active', color: '#7BA59D' },
  ];

  for (const { name, color } of icons) {
    const svgPath = path.join(TABBAR_SVGS_DIR, `${name}.svg`);
    if (!fs.existsSync(svgPath)) {
      console.log(`  [SKIP] 未找到: ${svgPath}`);
      continue;
    }

    const pngName = `${name}.png`;
    const pngPath = path.join(OUTPUT_TABBAR, pngName);
    await svgToPng(svgPath, pngPath, 81, 81, color);
  }
}

/**
 * 处理分享封面图：500x400px
 */
async function processShareImage() {
  console.log('\n[SHARE] 生成分享封面 (500x400px)...');

  const svgPath = path.join(SVGS_DIR, 'share-default.svg');
  if (fs.existsSync(svgPath)) {
    const pngPath = path.join(OUTPUT_IMAGES, 'share-default.png');
    await svgToPng(svgPath, pngPath, 500, 400);
  } else {
    console.log(`  [SKIP] 未找到: ${svgPath}`);
  }
}

/**
 * 处理 scripts/svgs/ 下已有的 SVG 文件
 */
async function processExistingSvgs() {
  console.log('\n[ICONS] 生成通用图标 (48x48px)...');

  const files = fs.readdirSync(SVGS_DIR);
  for (const file of files) {
    if (!file.endsWith('.svg')) continue;

    const name = path.basename(file, '.svg');
    const svgPath = path.join(SVGS_DIR, file);

    // 跳过 tabbar 目录和 share-default
    if (name === 'share-default') continue;

    const pngPath = path.join(OUTPUT_ICONS, `icon-${name}.png`);
    await svgToPng(svgPath, pngPath, 48, 48);
  }
}

async function main() {
  console.log('='.repeat(50));
  console.log('图标批量生成工具');
  console.log('='.repeat(50));

  try {
    await processTabbarIcons();
    await processShareImage();
    await processExistingSvgs();
  } catch (e) {
    console.error(`\n[ERR] 生成失败: ${e.message}`);
    process.exit(1);
  }

  console.log('\n' + '='.repeat(50));
  console.log('[DONE] 所有图标生成完成!');
  console.log('='.repeat(50));
}

main();
