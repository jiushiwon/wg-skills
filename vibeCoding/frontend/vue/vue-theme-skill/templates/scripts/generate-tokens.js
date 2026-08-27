#!/usr/bin/env node
/* eslint-disable */
/**
 * Vue Theme Skill — Token Generator
 *
 * 生成 9 级色阶（HSL 算法）+ 完整尺寸阶梯
 * 输出到 src/styles/tokens.css
 *
 * 使用：node scripts/generate-tokens.js [theme-name]
 *   - 无参数：生成默认蓝色主题
 *   - 参数：blue/green/purple/red/orange/cyan/pink/slate
 */

const fs = require('node:fs')
const path = require('node:path')

// ============== 主题配置 ==============
const THEMES = {
  blue:   { hue: 211, sat: 100, base: 56 },
  green:  { hue: 152, sat: 69,  base: 45 },
  purple: { hue: 262, sat: 83,  base: 58 },
  red:    { hue: 0,   sat: 84,  base: 60 },
  orange: { hue: 33,  sat: 100, base: 56 },
  cyan:   { hue: 180, sat: 77,  base: 47 },
  pink:   { hue: 330, sat: 81,  base: 60 },
  slate:  { hue: 220, sat: 9,   base: 46 },
}

/**
 * 生成 9 级色阶（HSL 算法）
 * @param {number} hue - 色相 0-360
 * @param {number} sat - 饱和度 0-100
 * @param {number} base - 基准亮度 0-100
 */
function hslScale(hue, sat, base) {
  return {
    50:  `hsl(${hue}, ${sat}%, 96%)`,
    100: `hsl(${hue}, ${sat}%, 92%)`,
    200: `hsl(${hue}, ${sat}%, 86%)`,
    300: `hsl(${hue}, ${sat}%, 76%)`,
    400: `hsl(${hue}, ${sat}%, 66%)`,
    500: `hsl(${hue}, ${sat}%, ${base}%)`,
    600: `hsl(${hue}, ${sat}%, ${Math.max(base - 8, 0)}%)`,
    700: `hsl(${hue}, ${sat}%, 40%)`,
    800: `hsl(${hue}, ${sat}%, 32%)`,
    950: `hsl(${hue}, ${sat}%, 16%)`,
  }
}

/**
 * 生成单主题 CSS 变量块
 */
function generateThemeBlock(name, config) {
  const scale = hslScale(config.hue, config.sat, config.base)
  return Object.entries(scale).map(([key, value]) =>
    `  --color-primary-${key}: ${value};`
  ).join('\n')
}

/**
 * 生成完整 tokens.css
 */
function generateTokensCss(themeName = 'blue') {
  const config = THEMES[themeName]
  if (!config) {
    console.error(`❌ 未知主题: ${themeName}`)
    console.error(`   可用主题: ${Object.keys(THEMES).join(', ')}`)
    process.exit(1)
  }

  return `/* ============================================
 * Vue Theme Skill — 完整设计 Token
 * 由 scripts/generate-tokens.js 生成（默认主题: ${themeName}）
 * 不要手改，由 generator 维护
 * 命名对齐 uniapp-theme-skill
 * ============================================ */

:root {
  /* ==================== 主题色（HSL 50-950） ==================== */
${Object.entries(hslScale(config.hue, config.sat, config.base)).map(([k, v]) =>
  `  --color-primary-${k.padStart(3, ' ')}: ${v};`
).join('\n')}

  /* 主色简写 */
  --color-primary:        var(--color-primary-500);
  --color-primary-light:  var(--color-primary-300);
  --color-primary-dark:   var(--color-primary-600);

  /* ==================== 语义色 ==================== */
  --color-success: hsl(152, 69%, 45%);
  --color-success-light: hsl(152, 69%, 92%);
  --color-success-dark: hsl(152, 69%, 38%);

  --color-warning: hsl(33, 100%, 56%);
  --color-warning-light: hsl(33, 100%, 92%);
  --color-warning-dark: hsl(33, 100%, 48%);

  --color-danger: hsl(0, 84%, 60%);
  --color-danger-light: hsl(0, 84%, 92%);
  --color-danger-dark: hsl(0, 84%, 48%);

  --color-info: var(--color-primary);

  /* ==================== 中性色 ==================== */
  --color-bg:              hsl(220, 20%, 98%);
  --color-bg-secondary:    hsl(220, 14%, 96%);
  --color-surface:         hsl(0, 0%, 100%);
  --color-surface-hover:   hsl(220, 14%, 98%);

  --color-border:          hsl(220, 14%, 92%);
  --color-border-strong:   hsl(220, 13%, 86%);
  --color-divider:         hsl(220, 14%, 95%);

  --color-text:            hsl(220, 13%, 18%);
  --color-text-secondary:  hsl(220, 9%, 46%);
  --color-text-tertiary:   hsl(220, 9%, 65%);
  --color-text-disabled:   hsl(220, 9%, 78%);
  --color-text-inverse:    hsl(0, 0%, 100%);
  --color-text-link:       var(--color-primary);

  /* ==================== 间距 --space-{n} ==================== */
  --space-1:  4px;
  --space-2:  8px;
  --space-3:  12px;
  --space-4:  16px;
  --space-5:  20px;
  --space-6:  24px;
  --space-8:  32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;

  /* ==================== 字体 --font-{size} ==================== */
  --font-2xs:  11px;
  --font-xs:   12px;
  --font-sm:   13px;
  --font-base: 14px;
  --font-lg:   16px;
  --font-xl:   18px;
  --font-2xl:  22px;
  --font-3xl:  28px;
  --font-4xl:  36px;

  --leading-tight:  1.2;
  --leading-normal: 1.5;
  --leading-loose:  1.8;

  --weight-normal:   400;
  --weight-medium:   500;
  --weight-semibold: 600;
  --weight-bold:     700;

  /* ==================== 圆角 --radius-{size} ==================== */
  --radius-sm:   8px;
  --radius-md:   12px;
  --radius-lg:   16px;
  --radius-xl:   20px;
  --radius-2xl:  24px;
  --radius-full: 999px;

  /* ==================== 组件高度 --height-{comp}-{size} ==================== */
  --height-button-sm: 32px;
  --height-button-md: 40px;
  --height-button-lg: 48px;

  --height-input-sm:  32px;
  --height-input-md:  40px;
  --height-input-lg:  48px;

  --height-card-sm:   80px;
  --height-card-md:   120px;
  --height-card-lg:   200px;

  --height-table-row-sm: 40px;
  --height-table-row-md: 52px;
  --height-table-row-lg: 64px;

  /* ==================== 图标 --icon-{size} ==================== */
  --icon-xs: 12px;
  --icon-sm: 16px;
  --icon-md: 20px;
  --icon-lg: 24px;
  --icon-xl: 32px;

  /* ==================== 阴影 ==================== */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.04);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.08);
  --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.12);
  --shadow-xl: 0 16px 48px rgba(0, 0, 0, 0.16);
}
`
}

// ============== 执行 ==============
const args = process.argv.slice(2)
const themeName = args[0] || 'blue'
const outputDir = path.resolve(__dirname, '../src/styles')
const outputFile = path.join(outputDir, 'tokens.css')

// 确保目录存在
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true })
}

// 生成
const content = generateTokensCss(themeName)
fs.writeFileSync(outputFile, content, 'utf-8')

console.log(`✅ 已生成 ${outputFile}`)
console.log(`   主题：${themeName}`)
console.log(`   色阶：50-950（HSL 算法）`)
console.log(`   命名：完全对齐 uniapp-theme-skill`)