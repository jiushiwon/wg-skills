/**
 * 主题生成器 - 动态色阶 & 尺寸阶梯生成
 *
 * 用于 uniapp-theme-skill：
 * - 输入任意 HEX 颜色 → 自动生成 50-900 色阶
 * - 输入基准尺寸 → 自动生成尺寸/圆角阶梯
 * - 输出 uni-app 兼容的 CSS 变量（rpx 单位）
 */

// ============================================
// 工具函数
// ============================================

/**
 * HEX 转 RGB
 */
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null
}

/**
 * RGB 转 HEX
 */
function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(x => {
    const hex = Math.max(0, Math.min(255, Math.round(x))).toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }).join('')
}

/**
 * 混合颜色（t: 0 = color1, 1 = color2）
 */
function mix(color1, color2, t) {
  const c1 = hexToRgb(color1)
  const c2 = hexToRgb(color2)
  if (!c1 || !c2) return color1

  return rgbToHex(
    c1.r + (c2.r - c1.r) * t,
    c1.g + (c2.g - c1.g) * t,
    c1.b + (c2.b - c1.b) * t
  )
}

/**
 * 判断颜色深浅
 */
function getColorBrightness(hex) {
  const rgb = hexToRgb(hex)
  if (!rgb) return 'dark'
  const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000
  return brightness > 128 ? 'light' : 'dark'
}

// ============================================
// 色阶生成器
// ============================================

/**
 * 生成色阶（50-900）
 * @param {string} primaryColor - 基准色
 * @param {object} options - 配置
 * @returns {object} 色阶对象 {50: '#xxx', 100: '#xxx', ...}
 */
function generateColorScale(primaryColor, options = {}) {
  const {
    steps = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900],
    lightMix = '#ffffff',
    darkMix = '#000000',
    baseStep = 500
  } = options

  const baseRgb = hexToRgb(primaryColor)
  if (!baseRgb) {
    console.error('Invalid primary color:', primaryColor)
    return {}
  }

  const baseIndex = steps.indexOf(baseStep)
  if (baseIndex === -1) {
    console.error('Invalid baseStep:', baseStep)
    return {}
  }

  const scale = {}

  steps.forEach((step, index) => {
    if (step === baseStep) {
      scale[step] = primaryColor.toLowerCase()
    } else if (step < baseStep) {
      // 浅色方向：向白色混合
      const t = (baseIndex - index) / baseIndex
      scale[step] = mix(lightMix, primaryColor, t * 0.9 + 0.1).toLowerCase()
    } else {
      // 深色方向：向黑色混合
      const t = (index - baseIndex) / (steps.length - 1 - baseIndex)
      scale[step] = mix(primaryColor, darkMix, t * 0.85 + 0.15).toLowerCase()
    }
  })

  return scale
}

/**
 * 生成完整主题色阶
 */
function generateThemeTokens(primaryColor) {
  const primary = generateColorScale(primaryColor, { baseStep: 500 })
  const gray = generateColorScale('#6B7280', { baseStep: 500 })

  // 状态色固定
  const semantic = {
    success: { 500: '#10B981', 600: '#059669' },
    warning: { 500: '#F59E0B', 600: '#D97706' },
    error: { 500: '#EF4444', 600: '#DC2626' },
    info: { 500: '#3B82F6', 600: '#2563EB' }
  }

  return { primary, gray, ...semantic }
}

// ============================================
// 尺寸阶梯生成器（uni-app rpx 单位）
// ============================================

/**
 * 字体大小阶梯（rpx）
 */
function generateFontSizeScale(baseSize = 28) {
  const scale = 1.25
  const steps = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl']

  const baseRpx = baseSize // uni-app 基准字号

  return {
    xs: Math.round(baseRpx / (scale * scale)),
    sm: Math.round(baseRpx / scale),
    md: baseRpx,
    lg: Math.round(baseRpx * scale),
    xl: Math.round(baseRpx * scale * scale),
    '2xl': Math.round(baseRpx * Math.pow(scale, 3)),
    '3xl': Math.round(baseRpx * Math.pow(scale, 4))
  }
}

/**
 * 间距阶梯（rpx）
 */
function generateSpacingScale(baseUnit = 4) {
  const values = [0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96]

  const result = {}
  values.forEach(v => {
    result[v] = v
  })

  return result
}

/**
 * 圆角阶梯（rpx）
 */
function generateRadiusScale() {
  return {
    none: 0,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    full: 9999
  }
}

/**
 * 按钮高度阶梯（rpx）
 */
function generateHeightScale() {
  return {
    sm: 56,
    md: 72,
    lg: 88,
    xl: 104
  }
}

// ============================================
// CSS 变量输出
// ============================================

/**
 * 生成 CSS 变量字符串（uni-app 格式）
 */
function generateCSSVariables(config = {}) {
  const {
    primaryColor = '#333333',
    fontBase = 28,
    themeName = 'custom'
  } = config

  // 生成色阶
  const themeTokens = generateThemeTokens(primaryColor)

  // 生成尺寸
  const fontSizes = generateFontSizeScale(fontBase)
  const spacing = generateSpacingScale()
  const radius = generateRadiusScale()
  const heights = generateHeightScale()

  let css = ':root {\n'

  // ===== 色阶变量 =====
  Object.entries(themeTokens).forEach(([colorName, scale]) => {
    if (typeof scale === 'object' && scale !== null) {
      Object.entries(scale).forEach(([step, value]) => {
        css += `  --${colorName}-${step}: ${value};\n`
      })
    }
  })

  // ===== 语义化颜色 =====
  css += `
  /* 语义化变量 */
  --color-primary: var(--primary-500);
  --color-success: var(--success-500);
  --color-warning: var(--warning-500);
  --color-error: var(--error-500);
  --color-info: var(--info-500);

  --color-bg-page: var(--gray-50);
  --color-bg-surface: #ffffff;
  --color-bg-tinted: var(--primary-50);

  --color-text-primary: var(--gray-900);
  --color-text-secondary: var(--gray-600);
  --color-text-tertiary: var(--gray-400);

  --color-border: var(--gray-200);
  --color-border-light: var(--gray-100);
`

  // ===== 字号变量 =====
  css += '\n  /* 字号 */\n'
  Object.entries(fontSizes).forEach(([size, value]) => {
    css += `  --font-${size}: ${value}rpx;\n`
  })

  // ===== 间距变量 =====
  css += '\n  /* 间距 */\n'
  Object.entries(spacing).forEach(([size, value]) => {
    css += `  --spacing-${size}: ${value}rpx;\n`
  })

  // ===== 圆角变量 =====
  css += '\n  /* 圆角 */\n'
  Object.entries(radius).forEach(([size, value]) => {
    css += `  --radius-${size}: ${value}rpx;\n`
  })

  // ===== 高度变量 =====
  css += '\n  /* 组件高度 */\n'
  Object.entries(heights).forEach(([size, value]) => {
    css += `  --height-btn-${size}: ${value}rpx;\n`
  })

  // ===== 常用复合变量 =====
  css += `
  /* 常用复合变量 */
  --radius-card: var(--radius-lg);
  --radius-btn: var(--radius-full);
  --radius-input: var(--radius-md);
`

  css += '}\n'
  return css
}

// ============================================
// 预设主题（可直接使用）
// ============================================

const PRESET_THEMES = {
  cute: { primaryColor: '#FF8FB1', fontBase: 28, radiusStyle: 'full' },
  minimal: { primaryColor: '#333333', fontBase: 28, radiusStyle: 'sm' },
  business: { primaryColor: '#2563EB', fontBase: 28, radiusStyle: 'sm' },
  fresh: { primaryColor: '#34D399', fontBase: 28, radiusStyle: 'md' },
  cyber: { primaryColor: '#00F0FF', fontBase: 28, radiusStyle: 'none' },
  retro: { primaryColor: '#D97706', fontBase: 28, radiusStyle: 'sm' },
  glass: { primaryColor: '#8B5CF6', fontBase: 28, radiusStyle: 'md' }
}

/**
 * 获取预设主题的 CSS
 */
function getPresetTheme(themeName) {
  const config = PRESET_THEMES[themeName]
  if (!config) {
    console.warn(`Unknown preset: ${themeName}`)
    return generateCSSVariables({ themeName: 'custom' })
  }
  return generateCSSVariables({ ...config, themeName })
}

// ============================================
// 导出
// ============================================

module.exports = {
  // 核心函数
  generateColorScale,
  generateThemeTokens,
  generateFontSizeScale,
  generateSpacingScale,
  generateRadiusScale,
  generateHeightScale,
  generateCSSVariables,

  // 预设
  PRESET_THEMES,
  getPresetTheme,

  // 工具
  hexToRgb,
  rgbToHex,
  mix,
  getColorBrightness
}
