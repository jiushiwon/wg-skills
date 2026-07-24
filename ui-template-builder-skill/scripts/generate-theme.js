/**
 * 主题色生成脚本
 * 输入：主题色 hex 值
 * 输出：10 个色阶的 CSS 变量
 *
 * 算法：使用 HSL 颜色空间，保持色相(Hue)，调节亮度(Lightness)
 * 色阶：50(最浅) -> 500(主题色) -> 900(最深)
 */

const DEFAULT_SHADES = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];

/**
 * Hex 转 RGB
 */
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) {
    throw new Error(`无效的十六进制颜色值: ${hex}`);
  }
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  };
}

/**
 * RGB 转 Hex
 */
function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(x => {
    const hex = Math.round(x).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

/**
 * RGB 转 HSL
 */
function rgbToHsl(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return { h: h * 360, s: s * 100, l: l * 100 };
}

/**
 * HSL 转 RGB
 */
function hslToRgb(h, s, l) {
  h /= 360;
  s /= 100;
  l /= 100;

  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255)
  };
}

/**
 * 生成色阶
 * @param {string} primaryColor - 主题色 hex 值
 * @param {string} colorName - 颜色名称（如 primary, success 等）
 * @param {number[]} shades - 色阶数组，默认 50-900
 * @returns {object} 包含 hex 数组和 CSS 变量字符串
 */
function generateColorShades(primaryColor, colorName = 'primary', shades = DEFAULT_SHADES) {
  const rgb = hexToRgb(primaryColor);
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

  // 主题色的位置（通常是 500）
  const primaryIndex = shades.indexOf(500);
  const primaryHsl = primaryIndex !== -1 ? hsl : { h: hsl.h, s: hsl.s, l: 50 };

  // 计算每个色阶的亮度
  // 50 最浅 (95% 亮度)，500 中间，900 最深 (25% 亮度)
  const lightnessMap = {
    50: 95,
    100: 90,
    200: 80,
    300: 70,
    400: 60,
    500: 50,  // 主题色亮度
    600: 45,
    700: 40,
    800: 30,
    900: 25
  };

  const results = {};
  const cssVars = [];

  shades.forEach(shade => {
    const targetLightness = lightnessMap[shade] || 50;
    const newRgb = hslToRgb(hsl.h, hsl.s, targetLightness);
    const hex = rgbToHex(newRgb.r, newRgb.g, newRgb.b);
    results[shade] = hex;

    cssVars.push(`  --${colorName}-${shade}: ${hex};`);
  });

  return {
    shades: results,
    cssVariables: cssVars.join('\n')
  };
}

/**
 * 生成完整的主题色阶 CSS
 * @param {string} primaryColor - 主题色
 * @param {string} colorName - 颜色名称
 */
function generateThemeColorCss(primaryColor, colorName = 'primary') {
  const { cssVariables } = generateColorShades(primaryColor, colorName);

  return `/* ${colorName} 色阶 (基于 ${primaryColor}) */
${cssVariables}

/* 配套文本颜色 */
--${colorName}-text: ${primaryColor};
--${colorName}-text-light: ${generateColorShades(primaryColor, colorName).shades[400]};
--${colorName}-bg: ${generateColorShades(primaryColor, colorName).shades[50]};
--${colorName}-border: ${generateColorShades(primaryColor, colorName).shades[200]};
`;
}

/**
 * 生成所有语义化颜色
 * @param {string} primaryColor - 主色
 * @param {object} options - 其他颜色配置
 */
function generateSemanticColors(primaryColor, options = {}) {
  const {
    success = '#10B981',
    warning = '#F59E0B',
    error = '#EF4444',
    info = '#3B82F6'
  } = options;

  let css = `/* ============================================
   Design Tokens - 主题色阶系统
   基于主色: ${primaryColor}
   生成工具: scripts/generate-theme.js
   ============================================ */

:root {
  /* 主色色阶 */
${generateColorShades(primaryColor, 'primary').cssVariables.split('\n').map(line => '  ' + line).join('\n')}

  /* 成功色阶 */
${generateColorShades(success, 'success').cssVariables.split('\n').map(line => '  ' + line).join('\n')}

  /* 警告色阶 */
${generateColorShades(warning, 'warning').cssVariables.split('\n').map(line => '  ' + line).join('\n')}

  /* 错误色阶 */
${generateColorShades(error, 'error').cssVariables.split('\n').map(line => '  ' + line).join('\n')}

  /* 信息色阶 */
${generateColorShades(info, 'info').cssVariables.split('\n').map(line => '  ' + line).join('\n')}
}
`;

  return css;
}

// CLI 入口
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log(`
用法: node generate-theme.js <主题色> [选项]

示例:
  node generate-theme.js #f43f5e                    # 生成 primary 色阶
  node generate-theme.js #f43f5e --css-only           # 只输出 CSS
  node generate-theme.js #f43f5e --semantic          # 生成语义化颜色
  node generate-theme.js #f43f5e --preview           # 预览色阶

颜色名称映射:
  primary  -> 主色
  success  -> 成功 (#10B981)
  warning  -> 警告 (#F59E0B)
  error    -> 错误 (#EF4444)
  info     -> 信息 (#3B82F6)
`);
    process.exit(0);
  }

  const primaryColor = args[0];
  const flags = args.slice(1);

  if (flags.includes('--semantic')) {
    console.log(generateSemanticColors(primaryColor));
  } else if (flags.includes('--preview')) {
    const { shades } = generateColorShades(primaryColor, 'primary');
    console.log('\n色阶预览:');
    Object.entries(shades).forEach(([shade, hex]) => {
      console.log(`  ${shade}: ${hex}`);
    });
  } else {
    console.log(generateThemeColorCss(primaryColor, 'primary'));
  }
}

module.exports = {
  generateColorShades,
  generateThemeColorCss,
  generateSemanticColors,
  hexToRgb,
  rgbToHex,
  rgbToHsl,
  hslToRgb
};
