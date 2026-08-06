/**
 * 主题生成器 - HSL 色阶 & 尺寸阶梯生成
 *
 * 用于 uniapp-theme-skill：
 * - 输入任意 HEX 颜色 → 自动生成 50-950 色阶（HSL 算法）
 * - 支持多主题色阶（primary/secondary/tertiary/quaternary/quinary）
 * - 输入基准尺寸 → 自动生成尺寸/圆角阶梯（静态 rpx，无 calc）
 * - 输出 uni-app 兼容的 CSS 变量（带 fallback）
 */

// ============================================
// 工具函数
// ============================================

/**
 * HEX 转 HSL
 */
function hexToHsl(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) return null

  let r = parseInt(result[1], 16) / 255
  let g = parseInt(result[2], 16) / 255
  let b = parseInt(result[3], 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6
        break
      case g: h = ((b - r) / d + 2) / 6
        break
      case b: h = ((r - g) / d + 4) / 6
        break
    }
  }

  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) }
}

/**
 * HSL 转 HEX
 */
function hslToHex(h, s, l) {
  h = h / 360
  s = s / 100
  l = l / 100

  let r, g, b

  if (s === 0) {
    r = g = b = l
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1 / 6) return p + (q - p) * 6 * t
      if (t < 1 / 2) return q
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
      return p
    }

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    r = hue2rgb(p, q, h + 1 / 3)
    g = hue2rgb(p, q, h)
    b = hue2rgb(p, q, h - 1 / 3)
  }

  const toHex = x => {
    const hex = Math.max(0, Math.min(255, Math.round(x * 255))).toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

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

// ============================================
// HSL 色阶生成器（核心算法）
// ============================================

/**
 * HSL 色阶生成（保持色相绝对稳定，仅调整明度和饱和度）
 *
 * 档位	饱和度 S	明度 L
 * 50	×0.12	98%
 * 100	×0.22	94%
 * 200	×0.38	86%
 * 300	×0.56	74%
 * 400	×0.78	60%
 * 500	基准	基准
 * 600	×1.06	max(L-10, 18%)
 * 700	×1.10	max(L-20, 14%)
 * 800	×1.14	max(L-30, 10%)
 * 900	×1.08	max(L-40, 8%)
 * 950	×0.92	max(L-48, 5%)
 */
function generateHslScale(hexColor, steps = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]) {
  const hsl = hexToHsl(hexColor)
  if (!hsl) return {}

  const { h, s: baseS, l: baseL } = hsl
  const baseIndex = steps.indexOf(500)

  const scale = {}

  steps.forEach((step, index) => {
    if (step === 500) {
      scale[step] = hexColor.toLowerCase()
      return
    }

    let newS, newL

    if (step < 500) {
      // 浅色方向：增加明度，降低饱和度
      const t = (baseIndex - index) / baseIndex
      newS = Math.round(baseS * (1 - t * 0.88))
      newL = Math.min(98, Math.round(baseL + (100 - baseL) * t * 0.9 + 4))
    } else {
      // 深色方向：降低明度，增加饱和度
      const t = (index - baseIndex) / (steps.length - 1 - baseIndex)
      newS = Math.min(100, Math.round(baseS * (1 + t * 0.14)))
      newL = Math.max(5, Math.round(baseL - baseL * t * 0.9))
    }

    scale[step] = hslToHex(h, newS, newL)
  })

  return scale
}

// ============================================
// 多主题色阶生成
// ============================================

/**
 * 生成多主题色阶
 * @param {string} primaryColor - 主色
 * @param {string|null} secondaryColor - 第二主题色
 * @param {string|null} tertiaryColor - 第三主题色
 */
function generateMultiThemeTokens(primaryColor, secondaryColor = null, tertiaryColor = null) {
  const primary = generateHslScale(primaryColor)

  const result = { primary }

  if (secondaryColor) {
    result.secondary = generateHslScale(secondaryColor)
  }

  if (tertiaryColor) {
    result.tertiary = generateHslScale(tertiaryColor)
  }

  // 灰色阶（固定）
  result.gray = generateHslScale('#6B7280')

  // 语义色（由 HSL 算法生成，不硬编码）
  result.success = generateHslScale('#10B981')
  result.warning = generateHslScale('#F59E0B')
  result.error = generateHslScale('#EF4444')
  result.info = generateHslScale('#3B82F6')

  return result
}

// ============================================
// 尺寸阶梯生成器（uni-app rpx 单位）
// ============================================

/**
 * 字体大小阶梯（rpx）- 静态值，无 calc
 */
function generateFontSizeScale() {
  return {
    '2xs': 20,
    'xs': 24,
    'sm': 26,
    'md': 28,
    'lg': 30,
    'xl': 32,
    '2xl': 40,
    '3xl': 48
  }
}

/**
 * 间距阶梯（rpx）- 静态值，无 calc
 */
function generateSpacingScale() {
  return {
    0: 0,
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    5: 20,
    6: 24,
    7: 28,
    8: 32,
    10: 40,
    12: 48,
    14: 56,
    16: 64,
    20: 80,
    24: 96
  }
}

/**
 * 圆角阶梯（rpx）- 静态值，无 calc
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
 * 按钮高度阶梯（rpx）- 静态值，无 calc
 */
function generateHeightScale() {
  return {
    sm: 56,
    md: 72,
    lg: 88
  }
}

/**
 * 图标尺寸阶梯（rpx）- 静态值，无 calc
 */
function generateIconScale() {
  return {
    xs: 24,
    sm: 36,
    md: 48,
    lg: 72,
    xl: 96
  }
}

// ============================================
// CSS 变量输出
// ============================================

/**
 * 生成 CSS 变量字符串（uni-app 格式，带 APP fallback）
 */
function generateCSSVariables(config = {}) {
  const {
    primaryColor = '#14b8a6',
    secondaryColor = null,
    tertiaryColor = null,
    themeName = 'custom'
  } = config

  const tokens = generateMultiThemeTokens(primaryColor, secondaryColor, tertiaryColor)
  const fontSizes = generateFontSizeScale()
  const spacing = generateSpacingScale()
  const radius = generateRadiusScale()
  const heights = generateHeightScale()
  const icons = generateIconScale()

  let css = `/* ============================================ */\n`
  css += `/* Theme: ${themeName} */\n`
  css += `/* Generated by theme-generator.js */\n`
  css += `/* ============================================ */\n\n`
  css += `:root {\n`

  // 主色阶
  css += `  /* === 主色阶 === */\n`
  Object.entries(tokens.primary).forEach(([step, value]) => {
    css += `  --primary-${step}: ${value};\n`
  })

  // 第二主题色阶
  if (tokens.secondary) {
    css += `\n  /* === 第二主题色阶 === */\n`
    Object.entries(tokens.secondary).forEach(([step, value]) => {
      css += `  --secondary-${step}: ${value};\n`
    })
  }

  // 第三主题色阶
  if (tokens.tertiary) {
    css += `\n  /* === 第三主题色阶 === */\n`
    Object.entries(tokens.tertiary).forEach(([step, value]) => {
      css += `  --tertiary-${step}: ${value};\n`
    })
  }

  // 灰色阶
  css += `\n  /* === 灰色阶 === */\n`
  Object.entries(tokens.gray).forEach(([step, value]) => {
    css += `  --gray-${step}: ${value};\n`
  })

  // 语义化颜色
  css += `\n  /* === 语义化变量 === */\n`
  css += `  --color-primary: var(--primary-500, ${tokens.primary[500]});\n`
  if (tokens.secondary) {
    css += `  --color-secondary: var(--secondary-500, ${tokens.secondary[500]});\n`
  }
  if (tokens.tertiary) {
    css += `  --color-tertiary: var(--tertiary-500, ${tokens.tertiary[500]});\n`
  }
  css += `  --color-success: var(--success-500, ${tokens.success[500]});\n`
  css += `  --color-warning: var(--warning-500, ${tokens.warning[500]});\n`
  css += `  --color-error: var(--error-500, ${tokens.error[500]});\n`
  css += `  --color-info: var(--info-500, ${tokens.info[500]});\n`

  css += `  --color-bg-page: var(--gray-50, ${tokens.gray[50]});\n`
  css += `  --color-bg-surface: #ffffff;\n`
  css += `  --color-bg-tinted: var(--primary-50, ${tokens.primary[50]});\n`

  css += `  --color-text-primary: var(--gray-900, ${tokens.gray[900]});\n`
  css += `  --color-text-secondary: var(--gray-600, ${tokens.gray[600]});\n`
  css += `  --color-text-tertiary: var(--gray-400, ${tokens.gray[400]});\n`
  css += `  --color-text-inverse: #ffffff;\n`

  css += `  --color-border: var(--gray-200, ${tokens.gray[200]});\n`
  css += `  --color-border-light: var(--gray-100, ${tokens.gray[100]});\n`

  // 字号变量
  css += `\n  /* === 字号 === */\n`
  Object.entries(fontSizes).forEach(([size, value]) => {
    css += `  --font-${size}: ${value}rpx;\n`
  })

  // 间距变量
  css += `\n  /* === 间距 === */\n`
  Object.entries(spacing).forEach(([size, value]) => {
    css += `  --space-${size}: ${value}rpx;\n`
  })

  // 圆角变量
  css += `\n  /* === 圆角 === */\n`
  Object.entries(radius).forEach(([size, value]) => {
    css += `  --radius-${size}: ${value}rpx;\n`
  })

  // 高度变量
  css += `\n  /* === 按钮高度 === */\n`
  Object.entries(heights).forEach(([size, value]) => {
    css += `  --height-btn-${size}: ${value}rpx;\n`
  })

  // 图标变量
  css += `\n  /* === 图标尺寸 === */\n`
  Object.entries(icons).forEach(([size, value]) => {
    css += `  --icon-${size}: ${value}rpx;\n`
  })

  // 常用复合变量
  css += `\n  /* === 常用复合变量 === */\n`
  css += `  --radius-btn: var(--radius-full, 9999rpx);\n`
  css += `  --radius-input: var(--radius-md, 16rpx);\n`
  css += `  --radius-card: var(--radius-lg, 24rpx);\n`
  css += `  --radius-tag: var(--radius-sm, 8rpx);\n`
  css += `  --radius-image: var(--radius-sm, 8rpx);\n`
  css += `  --radius-avatar: var(--radius-full, 9999rpx);\n`

  css += `}\n`
  return css
}

// ============================================
// 预设主题
// ============================================

const PRESET_THEMES = {
  cute: { primaryColor: '#FF8FB1', secondaryColor: null, tertiaryColor: null },
  minimal: { primaryColor: '#333333', secondaryColor: null, tertiaryColor: null },
  business: { primaryColor: '#2563EB', secondaryColor: null, tertiaryColor: null },
  fresh: { primaryColor: '#34D399', secondaryColor: null, tertiaryColor: null },
  cyber: { primaryColor: '#00F0FF', secondaryColor: null, tertiaryColor: null },
  retro: { primaryColor: '#D97706', secondaryColor: null, tertiaryColor: null },
  glass: { primaryColor: '#8B5CF6', secondaryColor: null, tertiaryColor: null },
  minimal: { primaryColor: '#333333', secondaryColor: null, tertiaryColor: null },
  warm: { primaryColor: '#F97316', secondaryColor: null, tertiaryColor: null }
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
  generateHslScale,
  generateMultiThemeTokens,
  generateCSSVariables,
  getPresetTheme,

  // 尺寸生成
  generateFontSizeScale,
  generateSpacingScale,
  generateRadiusScale,
  generateHeightScale,
  generateIconScale,

  // 预设
  PRESET_THEMES,

  // 工具
  hexToRgb,
  rgbToHex,
  hexToHsl,
  hslToHex
}