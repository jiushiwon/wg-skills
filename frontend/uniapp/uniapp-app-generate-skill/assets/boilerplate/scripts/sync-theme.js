const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const themePath = path.join(root, 'theme.json');

const theme = JSON.parse(fs.readFileSync(themePath, 'utf8'));

// ---------------------------------------------------------------------------
// 色阶生成：与 src/styles/_functions.scss 中的 primary-palette()/gray-palette()
// 保持同一套 mix 公式，确保 JS / SCSS / 校验三方同源。
//   level < 500：混白，权重 ratio = (1000 - level) / 1000 * 0.9（白色占比）
//   level = 500：本色
//   level > 500：混黑，权重 ratio = (level - 500) / 1000 * 0.9（黑色占比）
// ---------------------------------------------------------------------------
const LEVELS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];
const MIX_RATIO = 0.9;

function hexToRgb(hex) {
  let s = hex.replace('#', '').trim();
  if (s.length === 3) {
    s = s.split('').map((c) => c + c).join('');
  }
  return {
    r: parseInt(s.slice(0, 2), 16),
    g: parseInt(s.slice(2, 4), 16),
    b: parseInt(s.slice(4, 6), 16),
  };
}

function rgbToHex({ r, g, b }) {
  const to = (v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0');
  return `#${to(r)}${to(g)}${to(b)}`;
}

// c1 * w + c2 * (1 - w)，w 为 c1 的权重（对齐 Sass color.mix）
function mixChannel(c1, c2, w) {
  return c1 * w + c2 * (1 - w);
}

function palette(baseHex, level) {
  const base = hexToRgb(baseHex);
  if (level === 500) return rgbToHex(base);
  if (level < 500) {
    const w = ((1000 - level) / 1000) * MIX_RATIO; // 白色权重
    return rgbToHex({
      r: mixChannel(255, base.r, w),
      g: mixChannel(255, base.g, w),
      b: mixChannel(255, base.b, w),
    });
  }
  const w = ((level - 500) / 1000) * MIX_RATIO; // 黑色权重
  return rgbToHex({
    r: mixChannel(0, base.r, w),
    g: mixChannel(0, base.g, w),
    b: mixChannel(0, base.b, w),
  });
}

function buildScale(baseHex) {
  const scale = {};
  for (const level of LEVELS) {
    scale[level] = palette(baseHex, level);
  }
  return scale;
}

function generateThemeConfig() {
  const { colors, spacing, font, radius } = theme;

  const lines = [
    '// 主题唯一人工配置入口：由 theme.json 自动生成',
    '// 修改 theme.json 后运行 npm run theme:sync 同步',
    '',
    '// 主色',
    `$theme-primary: ${colors.primary};`,
    '',
    '// 功能色',
    `$theme-success: ${colors.success};`,
    `$theme-warning: ${colors.warning};`,
    `$theme-error: ${colors.error};`,
    `$theme-info: ${colors.info};`,
    '',
    '// 灰阶基础',
    `$theme-gray-base: ${colors.grayBase};`,
    '',
    '// 间距基数',
    `$theme-spacing-base: ${spacing.base};`,
    '',
    '// 字体基数',
    `$theme-font-base: ${font.base};`,
    '',
    '// 圆角基数',
    `$theme-radius-base: ${radius.base};`,
    '',
  ];

  const target = path.join(root, 'src/styles/config/_theme-config.scss');
  fs.writeFileSync(target, lines.join('\n'));
  console.log('[sync-theme] generated src/styles/config/_theme-config.scss');
}

function generateColors(primary, gray) {
  const { colors } = theme;

  const scaleLines = (name, scale) =>
    LEVELS.map((l) => `export const ${name}_${l} = '${scale[l]}';`).join('\n');

  const mapLines = (name, scale) =>
    [`export const ${name} = {`, ...LEVELS.map((l) => `  ${l}: ${name}_${l},`), '};'].join('\n');

  const lines = [
    '// JS 侧主题色常量，由 theme.json 自动生成',
    '// 修改 theme.json 后运行 npm run theme:sync 同步',
    '// 色阶与 SCSS 端 primary-palette()/gray-palette() 同源，禁止手动修改。',
    '',
    '// 主色阶 50 ~ 900',
    scaleLines('PRIMARY', primary),
    '',
    mapLines('PRIMARY', primary),
    '',
    '// 灰阶 50 ~ 900',
    scaleLines('GRAY', gray),
    '',
    mapLines('GRAY', gray),
    '',
    '// 功能色',
    `export const COLOR_SUCCESS = '${colors.success}';`,
    `export const COLOR_WARNING = '${colors.warning}';`,
    `export const COLOR_ERROR = '${colors.error}';`,
    `export const COLOR_INFO = '${colors.info}';`,
    '',
    '// 语义色（全部由色阶派生，禁止写死）',
    "export const COLOR_PRIMARY = PRIMARY_500;",
    "export const COLOR_PRIMARY_LIGHT = PRIMARY_100;",
    "export const COLOR_PRIMARY_DARK = PRIMARY_700;",
    '',
    "export const COLOR_TEXT_PRIMARY = GRAY_900;",
    "export const COLOR_TEXT_SECONDARY = GRAY_500;",
    "export const COLOR_TEXT_TERTIARY = GRAY_400;",
    '',
    "export const COLOR_BG_PRIMARY = '#ffffff';",
    "export const COLOR_BG_SECONDARY = GRAY_50;",
    "export const COLOR_BG_TERTIARY = GRAY_100;",
    '',
    "export const COLOR_BORDER = GRAY_200;",
    "export const COLOR_BORDER_LIGHT = GRAY_100;",
    '',
    'export const COLORS = {',
    '  primary: COLOR_PRIMARY,',
    '  primaryLight: COLOR_PRIMARY_LIGHT,',
    '  primaryDark: COLOR_PRIMARY_DARK,',
    '  success: COLOR_SUCCESS,',
    '  warning: COLOR_WARNING,',
    '  error: COLOR_ERROR,',
    '  info: COLOR_INFO,',
    '  textPrimary: COLOR_TEXT_PRIMARY,',
    '  textSecondary: COLOR_TEXT_SECONDARY,',
    '  textTertiary: COLOR_TEXT_TERTIARY,',
    '  bgPrimary: COLOR_BG_PRIMARY,',
    '  bgSecondary: COLOR_BG_SECONDARY,',
    '  bgTertiary: COLOR_BG_TERTIARY,',
    '  border: COLOR_BORDER,',
    '  borderLight: COLOR_BORDER_LIGHT,',
    '};',
    '',
  ];

  const target = path.join(root, 'src/constants/colors.ts');
  fs.writeFileSync(target, lines.join('\n'));
  console.log('[sync-theme] generated src/constants/colors.ts');
}

function generateScaleManifest(primary, gray) {
  const { colors } = theme;
  const set = new Set();
  for (const level of LEVELS) {
    set.add(primary[level].toLowerCase());
    set.add(gray[level].toLowerCase());
  }
  for (const key of ['success', 'warning', 'error', 'info']) {
    set.add(String(colors[key]).toLowerCase());
  }

  const manifest = {
    _comment: '由 sync-theme.js 生成，check-colors.js 用作白名单，禁止手动修改。',
    generatedFrom: 'theme.json',
    allowed: Array.from(set).sort(),
  };

  const target = path.join(root, 'scripts/.theme-scale.json');
  fs.writeFileSync(target, `${JSON.stringify(manifest, null, 2)}\n`);
  console.log('[sync-theme] generated scripts/.theme-scale.json');
}

function main() {
  if (!fs.existsSync(themePath)) {
    console.error('[sync-theme] theme.json not found');
    process.exit(1);
  }

  const primary = buildScale(theme.colors.primary);
  const gray = buildScale(theme.colors.grayBase);

  generateThemeConfig();
  generateColors(primary, gray);
  generateScaleManifest(primary, gray);
  console.log('[sync-theme] done');
}

main();
