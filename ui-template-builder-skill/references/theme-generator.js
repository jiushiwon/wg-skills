/**
 * 主题生成器 - 色阶 & 尺寸阶梯自动生成
 *
 * 使用方式：
 * 1. 在代码中引入：import { generateTokens, generateSizeScale } from './theme-generator'
 * 2. 或在 Node 环境中运行：node theme-generator.js
 *
 * 用户只需要提供一个基准色/基准尺寸，系统自动生成完整阶梯
 */

// ============================================
// 色阶生成器 - 基于一个基准色生成 50-900 色阶
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
 * 判断颜色深浅，返回 'light' 或 'dark'
 */
function getColorBrightness(hex) {
  const rgb = hexToRgb(hex)
  if (!rgb) return 'dark'
  // 使用 W3C 公式计算亮度
  const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000
  return brightness > 128 ? 'light' : 'dark'
}

/**
 * 生成色阶（50-900）
 * @param {string} primaryColor - 基准色（如 #333333 或 #FF6B6B）
 * @param {object} options - 配置选项
 * @returns {object} 色阶对象
 */
function generateColorScale(primaryColor, options = {}) {
  const {
    // 自定义色阶映射（可选）
    steps = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950],
    // 50/100 使用的浅色基准（默认白色）
    lightMix = '#ffffff',
    // 800/900/950 使用的深色基准（默认黑色）
    darkMix = '#000000',
    // 基准色对应哪个阶梯（默认 500）
    baseStep = 500
  } = options

  const baseRgb = hexToRgb(primaryColor)
  if (!baseRgb) {
    console.error('Invalid primary color:', primaryColor)
    return {}
  }

  // 计算基准色在色阶中的位置
  const baseIndex = steps.indexOf(baseStep)
  if (baseIndex === -1) {
    console.error('Invalid baseStep:', baseStep)
    return {}
  }

  const scale = {}

  steps.forEach((step, index) => {
    if (step === baseStep) {
      // 基准色直接使用
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
 * 生成完整的主题色阶
 * @param {string} primaryColor - 主色
 * @param {string} accentColor - 强调色（可选，默认同 primary）
 * @returns {object} 完整的主题 tokens
 */
function generateThemeTokens(primaryColor, accentColor) {
  const primary = generateColorScale(primaryColor, { baseStep: 500 })

  // 强调色使用不同的基准
  const accent = accentColor
    ? generateColorScale(accentColor, { baseStep: 500 })
    : { ...primary }

  // 语义色（固定值，推荐使用）
  const semantic = {
    success: { 500: '#10B981', 600: '#059669' },
    warning: { 500: '#F59E0B', 600: '#D97706' },
    error: { 500: '#EF4444', 600: '#DC2626' },
    info: { 500: '#3B82F6', 600: '#2563EB' }
  }

  // 灰阶（中性色）
  const gray = generateColorScale('#6B7280', { baseStep: 500 })

  return {
    colors: {
      primary,
      accent,
      gray,
      ...semantic
    }
  }
}

// ============================================
// 尺寸阶梯生成器
// ============================================

/**
 * 尺寸阶梯配置
 */
const SIZE_SCALE_CONFIG = {
  // 字体大小阶梯（base: 14px）
  fontSize: {
    base: 14,
    scale: 1.25, // 纯四度 scale
    steps: ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl']
  },
  // 间距阶梯（base: 4px）
  spacing: {
    base: 4,
    scale: 4, // 固定增量
    steps: ['0', '0.5', '1', '1.5', '2', '2.5', '3', '3.5', '4', '5', '6', '8', '10', '12', '16']
  },
  // 圆角阶梯
  radius: {
    base: 4,
    values: [0, 2, 4, 6, 8, 10, 12, 14, 16, 20, 24, 28, 32, 'full']
  },
  // 阴影阶梯（基于层的深度）
  shadow: {
    base: 0,
    steps: ['sm', 'md', 'lg', 'xl', '2xl']
  }
}

/**
 * 生成字体大小阶梯
 * @param {number} baseSize - 基准字体大小（默认 14）
 * @param {number} scale - 缩放比例（默认 1.25）
 * @returns {object} 字体大小对象
 */
function generateFontSizeScale(baseSize = 14, scale = 1.25) {
  const { steps } = SIZE_SCALE_CONFIG.fontSize
  const result = {}

  // 计算各阶梯值
  const values = [
    baseSize / (scale * scale),    // xs
    baseSize / scale,               // sm
    baseSize,                       // md (基准)
    baseSize * scale,               // lg
    baseSize * scale * scale,       // xl
    baseSize * scale * scale * scale, // 2xl
    baseSize * Math.pow(scale, 3) * scale, // 3xl
    baseSize * Math.pow(scale, 4) * scale, // 4xl
    baseSize * Math.pow(scale, 5) * scale  // 5xl
  ]

  steps.forEach((step, index) => {
    result[step] = `${Math.round(values[index] * 10) / 10}px`
  })

  return result
}

/**
 * 生成间距阶梯
 * @param {number} baseUnit - 基础单位（默认 4px）
 * @returns {object} 间距对象
 */
function generateSpacingScale(baseUnit = 4) {
  const { values } = SIZE_SCALE_CONFIG.spacing
  const result = {}

  values.forEach(value => {
    const numValue = typeof value === 'number' ? value : parseFloat(value)
    result[value] = `${numValue * baseUnit}px`
  })

  return result
}

/**
 * 生成圆角阶梯
 * @param {object} options - 配置选项
 * @returns {object} 圆角对象
 */
function generateRadiusScale(options = {}) {
  const {
    baseSize = 4,
    customValues = []
  } = options

  const { values } = SIZE_SCALE_CONFIG.radius
  const result = {}

  values.forEach(value => {
    if (value === 'full') {
      result[value] = '9999px'
    } else {
      result[value] = `${value * baseSize}px`
    }
  })

  // 添加自定义值
  customValues.forEach(v => {
    result[v] = typeof v === 'number' ? `${v * baseSize}px` : v
  })

  return result
}

/**
 * 生成阴影阶梯
 * @param {string} primaryColor - 主色（用于阴影颜色）
 * @returns {object} 阴影对象
 */
function generateShadowScale(primaryColor = '#000000') {
  const opacity = getColorBrightness(primaryColor) === 'light' ? 0.1 : 0.15

  return {
    sm: `0 1px 2px 0 rgba(0, 0, 0, ${opacity})`,
    md: `0 4px 6px -1px rgba(0, 0, 0, ${opacity * 1.5})`,
    lg: `0 10px 15px -3px rgba(0, 0, 0, ${opacity * 2})`,
    xl: `0 20px 25px -5px rgba(0, 0, 0, ${opacity * 2.5})`,
    '2xl': `0 25px 50px -12px rgba(0, 0, 0, ${opacity * 3})'
  }
}

// ============================================
// 生成完整的主题 Tokens
// ============================================

/**
 * 生成完整的 Design Tokens
 * @param {object} config - 主题配置
 * @returns {object} 完整的 tokens
 */
function generateTokens(config = {}) {
  const {
    // 基础配置
    primaryColor = '#333333',    // 主色
    accentColor = null,          // 强调色（默认同主色）
    fontBase = 14,              // 基准字号
    spacingBase = 4,             // 基础间距单位

    // 可选：覆盖特定阶梯
    customFontSizes = null,
    customSpacing = null,
    customRadius = null,
    customShadows = null
  } = config

  // 生成色阶
  const themeColors = generateThemeTokens(primaryColor, accentColor)

  // 生成尺寸阶梯
  const fontSizes = customFontSizes || generateFontSizeScale(fontBase)
  const spacing = customSpacing || generateSpacingScale(spacingBase)
  const radius = customRadius || generateRadiusScale()
  const shadows = customShadows || generateShadowScale(primaryColor)

  return {
    // 颜色
    colors: themeColors.colors,

    // 字体
    fontSize: fontSizes,
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75
    },

    // 间距
    spacing,

    // 圆角
    radius,

    // 阴影
    shadow: shadows,

    // 过渡
    transition: {
      fast: '150ms',
      normal: '200ms',
      slow: '300ms'
    }
  }
}

/**
 * 生成 CSS 变量字符串
 * @param {object} tokens - Design Tokens
 * @returns {string} CSS 变量字符串
 */
function generateCSSVariables(tokens) {
  let css = ':root {\n'

  // 颜色变量
  Object.entries(tokens.colors).forEach(([colorName, scale]) => {
    if (typeof scale === 'object' && scale !== null) {
      Object.entries(scale).forEach(([step, value]) => {
        css += `  --color-${colorName}-${step}: ${value};\n`
      })
    }
  })

  // 字体大小
  Object.entries(tokens.fontSize).forEach(([size, value]) => {
    css += `  --text-${size}: ${value};\n`
  })

  // 间距
  Object.entries(tokens.spacing).forEach(([size, value]) => {
    css += `  --space-${size}: ${value};\n`
  })

  // 圆角
  Object.entries(tokens.radius).forEach(([size, value]) => {
    css += `  --radius-${size}: ${value};\n`
  })

  // 阴影
  Object.entries(tokens.shadow).forEach(([size, value]) => {
    css += `  --shadow-${size}: ${value};\n`
  })

  // 常用复合变量
  css += `
  /* 常用复合变量 */
  --color-primary: var(--color-primary-500, #333333);
  --color-text-primary: var(--color-gray-900, #111827);
  --color-text-secondary: var(--color-gray-600, #4b5563);
  --color-text-tertiary: var(--color-gray-400, #9ca3af);
  --color-border: var(--color-gray-200, #e5e7eb);
  --color-border-light: var(--color-gray-100, #f3f4f6);
  --color-bg-surface: #ffffff;
  --color-bg-surface-hover: var(--color-gray-50, #f9fafb);
  --color-bg-surface-active: var(--color-gray-100, #f3f4f6);
`

  css += '}\n'
  return css
}

// ============================================
// 预设主题
// ============================================

const PRESET_THEMES = {
  modern: {
    primaryColor: '#333333',
    accentColor: '#2563EB',
    fontBase: 14,
    spacingBase: 4
  },
  vibrant: {
    primaryColor: '#FF6B6B',
    accentColor: '#FF8E53',
    fontBase: 14,
    spacingBase: 4
  },
  premium: {
    primaryColor: '#D4AF37',
    accentColor: '#1A1A2E',
    fontBase: 14,
    spacingBase: 4
  },
  nature: {
    primaryColor: '#2ECC71',
    accentColor: '#27AE60',
    fontBase: 14,
    spacingBase: 4
  },
  'dark-tech': {
    primaryColor: '#00D9FF',
    accentColor: '#7C4DFF',
    fontBase: 14,
    spacingBase: 4
  }
}

/**
 * 获取预设主题
 */
function getPresetTheme(presetName) {
  const preset = PRESET_THEMES[presetName]
  if (!preset) {
    console.warn(`Unknown preset: ${presetName}`)
    return generateTokens()
  }
  return generateTokens(preset)
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
  generateShadowScale,
  generateTokens,
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

// CLI 模式
if (require.main === module) {
  const args = process.argv.slice(2)
  const preset = args[0] || 'modern'
  const customColor = args[1]

  let config = PRESET_THEMES[preset] || PRESET_THEMES.modern

  if (customColor) {
    config.primaryColor = customColor
  }

  const tokens = generateTokens(config)
  const css = generateCSSVariables(tokens)

  console.log(`\n# Theme: ${preset}${customColor ? ` (custom: ${customColor})` : ''}\n`)
  console.log(css)
  console.log('\n# JSON Tokens:\n')
  console.log(JSON.stringify(tokens, null, 2))
}
