/**
 * 主题 Token 生成脚本
 *
 * 使用方式：
 *   node generate-tokens.js                    # 使用默认主色
 *   node generate-tokens.js #6366F1            # 使用指定主色
 *   node generate-tokens.js #6366F1 cute       # 指定主色和主题名
 *
 * 输出：
 *   - src/static/css/tokens.css    # CSS 变量
 *   - src/styles/tokens.scss       # SCSS 变量
 */

const fs = require('fs');
const path = require('path');

// ============================================
// 配置
// ============================================

const args = process.argv.slice(2);
const primaryColor = args[0] || '#14b8a6';
const themeName = args[1] || 'custom';

// ============================================
// 工具函数
// ============================================

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(x => {
    const hex = Math.max(0, Math.min(255, Math.round(x))).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

function mix(color1, color2, t) {
  const c1 = hexToRgb(color1);
  const c2 = hexToRgb(color2);
  if (!c1 || !c2) return color1;

  return rgbToHex(
    c1.r + (c2.r - c1.r) * t,
    c1.g + (c2.g - c1.g) * t,
    c1.b + (c2.b - c1.b) * t
  );
}

// ============================================
// 色阶生成
// ============================================

function generateColorScale(primaryColor) {
  const steps = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];
  const baseIndex = 4; // 500 is index 4

  const scale = {};
  steps.forEach((step, index) => {
    if (step === 500) {
      scale[step] = primaryColor.toLowerCase();
    } else if (step < 500) {
      const t = (baseIndex - index) / baseIndex;
      scale[step] = mix('#ffffff', primaryColor, t * 0.9 + 0.1).toLowerCase();
    } else {
      const t = (index - baseIndex) / (steps.length - 1 - baseIndex);
      scale[step] = mix(primaryColor, '#000000', t * 0.85 + 0.15).toLowerCase();
    }
  });

  return scale;
}

// ============================================
// CSS 生成
// ============================================

function generateCSSTokens(primaryScale) {
  const grayScale = generateColorScale('#6B7280');

  let css = `/**
 * Design Tokens - ${themeName} 主题
 * 主色: ${primaryColor}
 * 由 generate-tokens.js 自动生成
 */

:root,
page {
  /* ==================== 主题色阶 ==================== */
`;

  // 主色
  Object.entries(primaryScale).forEach(([step, value]) => {
    css += `  --primary-${step}: ${value};\n`;
  });

  css += `
  /* ==================== 灰度 ==================== */
`;

  // 灰度
  Object.entries(grayScale).forEach(([step, value]) => {
    css += `  --gray-${step}: ${value};\n`;
  });

  css += `
  /* ==================== 语义化变量 ==================== */
  --color-primary: var(--primary-500);
  --color-success: #16ac57;
  --color-warning: #f59e0b;
  --color-error: #dc2626;
  --color-info: #3b82f6;

  --text-primary: var(--gray-900);
  --text-secondary: var(--gray-600);
  --text-tertiary: var(--gray-400);

  --bg-page: var(--gray-50);
  --bg-card: #ffffff;
  --bg-light: var(--gray-100);

  --border: var(--gray-200);
  --border-light: var(--gray-100);

  /* ==================== 字号 ==================== */
  --font-xs: 24rpx;
  --font-sm: 26rpx;
  --font-md: 28rpx;
  --font-lg: 30rpx;
  --font-xl: 34rpx;

  /* ==================== 间距 ==================== */
  --space-xs: 8rpx;
  --space-sm: 12rpx;
  --space-md: 16rpx;
  --space-lg: 24rpx;
  --space-xl: 32rpx;

  /* ==================== 圆角 ==================== */
  --radius-sm: 8rpx;
  --radius-md: 16rpx;
  --radius-lg: 24rpx;
  --radius-full: 9999rpx;

  /* ==================== 阴影 ==================== */
  --shadow-sm: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
  --shadow-md: 0 6rpx 20rpx rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 12rpx 32rpx rgba(0, 0, 0, 0.08);

  /* ==================== 按钮高度 ==================== */
  --height-btn-sm: 56rpx;
  --height-btn-md: 72rpx;
  --height-btn-lg: 88rpx;
}
`;

  return css;
}

// ============================================
// SCSS 生成
// ============================================

function generateSCSSTokens(primaryScale) {
  const grayScale = generateColorScale('#6B7280');

  let scss = `/**
 * Design Tokens - ${themeName} 主题
 * 主色: ${primaryColor}
 * 由 generate-tokens.js 自动生成
 */

// 主色
`;

  Object.entries(primaryScale).forEach(([step, value]) => {
    scss += `$primary-${step}: ${value};\n`;
  });

  scss += `
// 灰度
`;

  Object.entries(grayScale).forEach(([step, value]) => {
    scss += `$gray-${step}: ${value};\n`;
  });

  scss += `
// 语义变量
$color-primary: $primary-500;
$text-primary: $gray-900;
$text-secondary: $gray-600;

// 间距
$space-xs: 8rpx;
$space-sm: 12rpx;
$space-md: 16rpx;
$space-lg: 24rpx;
$space-xl: 32rpx;

// 圆角
$radius-sm: 8rpx;
$radius-md: 16rpx;
$radius-lg: 24rpx;
$radius-full: 9999rpx;
`;

  return scss;
}

// ============================================
// 主程序
// ============================================

function main() {
  console.log(`🎨 生成主题 Token`);
  console.log(`   主色: ${primaryColor}`);
  console.log(`   主题: ${themeName}`);
  console.log('');

  const primaryScale = generateColorScale(primaryColor);

  // 输出路径
  const cssOutput = path.join(__dirname, '..', 'src', 'static', 'css', 'tokens.css');
  const scssOutput = path.join(__dirname, '..', 'src', 'styles', 'tokens.scss');

  // 确保目录存在
  fs.mkdirSync(path.dirname(cssOutput), { recursive: true });
  fs.mkdirSync(path.dirname(scssOutput), { recursive: true });

  // 写入文件
  const cssContent = generateCSSTokens(primaryScale);
  const scssContent = generateSCSSTokens(primaryScale);

  fs.writeFileSync(cssOutput, cssContent);
  fs.writeFileSync(scssOutput, scssContent);

  console.log(`✅ 已生成:`);
  console.log(`   ${cssOutput}`);
  console.log(`   ${scssOutput}`);
  console.log('');
  console.log(`📝 使用方式:`);
  console.log(`   在 App.vue 中引入: import '@/static/css/tokens.css'`);
}

main();
