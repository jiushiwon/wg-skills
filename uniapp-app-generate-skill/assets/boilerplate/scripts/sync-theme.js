const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const themePath = path.join(root, 'theme.json');

const theme = JSON.parse(fs.readFileSync(themePath, 'utf8'));

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

function generateColors() {
  const { colors, semantic } = theme;

  const lines = [
    '// JS 侧主题色常量，由 theme.json 自动生成',
    '// 修改 theme.json 后运行 npm run theme:sync 同步',
    '',
    `export const COLOR_PRIMARY = '${colors.primary}';`,
    `export const COLOR_PRIMARY_LIGHT = '${semantic.primaryLight}';`,
    `export const COLOR_PRIMARY_DARK = '${semantic.primaryDark}';`,
    '',
    `export const COLOR_SUCCESS = '${colors.success}';`,
    `export const COLOR_WARNING = '${colors.warning}';`,
    `export const COLOR_ERROR = '${colors.error}';`,
    `export const COLOR_INFO = '${colors.info}';`,
    '',
    `export const COLOR_TEXT_PRIMARY = '${semantic.textPrimary}';`,
    `export const COLOR_TEXT_SECONDARY = '${semantic.textSecondary}';`,
    `export const COLOR_TEXT_TERTIARY = '${semantic.textTertiary}';`,
    '',
    `export const COLOR_BG_PRIMARY = '${semantic.bgPrimary}';`,
    `export const COLOR_BG_SECONDARY = '${semantic.bgSecondary}';`,
    `export const COLOR_BG_TERTIARY = '${semantic.bgTertiary}';`,
    '',
    `export const COLOR_BORDER = '${semantic.border}';`,
    `export const COLOR_BORDER_LIGHT = '${semantic.borderLight}';`,
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

function main() {
  if (!fs.existsSync(themePath)) {
    console.error('[sync-theme] theme.json not found');
    process.exit(1);
  }

  generateThemeConfig();
  generateColors();
  console.log('[sync-theme] done');
}

main();
