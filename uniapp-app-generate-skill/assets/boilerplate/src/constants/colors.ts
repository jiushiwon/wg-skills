// JS 侧主题色常量，由 theme.json 自动生成
// 修改 theme.json 后运行 npm run theme:sync 同步
// 色阶与 SCSS 端 primary-palette()/gray-palette() 同源，禁止手动修改。

// 主色阶 50 ~ 900
export const PRIMARY_50 = '#dcf5ed';
export const PRIMARY_100 = '#d2f2e7';
export const PRIMARY_200 = '#bcebdc';
export const PRIMARY_300 = '#a7e5d0';
export const PRIMARY_400 = '#91dfc5';
export const PRIMARY_500 = '#10b981';
export const PRIMARY_600 = '#0fa875';
export const PRIMARY_700 = '#0d986a';
export const PRIMARY_800 = '#0c875e';
export const PRIMARY_900 = '#0a7653';

export const PRIMARY = {
  50: PRIMARY_50,
  100: PRIMARY_100,
  200: PRIMARY_200,
  300: PRIMARY_300,
  400: PRIMARY_400,
  500: PRIMARY_500,
  600: PRIMARY_600,
  700: PRIMARY_700,
  800: PRIMARY_800,
  900: PRIMARY_900,
};

// 灰阶 50 ~ 900
export const GRAY_50 = '#eaebed';
export const GRAY_100 = '#e3e4e7';
export const GRAY_200 = '#d6d8db';
export const GRAY_300 = '#c8cbd0';
export const GRAY_400 = '#bbbec5';
export const GRAY_500 = '#6b7280';
export const GRAY_600 = '#616874';
export const GRAY_700 = '#585d69';
export const GRAY_800 = '#4e535d';
export const GRAY_900 = '#444952';

export const GRAY = {
  50: GRAY_50,
  100: GRAY_100,
  200: GRAY_200,
  300: GRAY_300,
  400: GRAY_400,
  500: GRAY_500,
  600: GRAY_600,
  700: GRAY_700,
  800: GRAY_800,
  900: GRAY_900,
};

// 功能色
export const COLOR_SUCCESS = '#4caf50';
export const COLOR_WARNING = '#ff9800';
export const COLOR_ERROR = '#f44336';
export const COLOR_INFO = '#2196f3';

// 语义色（全部由色阶派生，禁止写死）
export const COLOR_PRIMARY = PRIMARY_500;
export const COLOR_PRIMARY_LIGHT = PRIMARY_100;
export const COLOR_PRIMARY_DARK = PRIMARY_700;

export const COLOR_TEXT_PRIMARY = GRAY_900;
export const COLOR_TEXT_SECONDARY = GRAY_500;
export const COLOR_TEXT_TERTIARY = GRAY_400;

export const COLOR_BG_PRIMARY = '#ffffff';
export const COLOR_BG_SECONDARY = GRAY_50;
export const COLOR_BG_TERTIARY = GRAY_100;

export const COLOR_BORDER = GRAY_200;
export const COLOR_BORDER_LIGHT = GRAY_100;

export const COLORS = {
  primary: COLOR_PRIMARY,
  primaryLight: COLOR_PRIMARY_LIGHT,
  primaryDark: COLOR_PRIMARY_DARK,
  success: COLOR_SUCCESS,
  warning: COLOR_WARNING,
  error: COLOR_ERROR,
  info: COLOR_INFO,
  textPrimary: COLOR_TEXT_PRIMARY,
  textSecondary: COLOR_TEXT_SECONDARY,
  textTertiary: COLOR_TEXT_TERTIARY,
  bgPrimary: COLOR_BG_PRIMARY,
  bgSecondary: COLOR_BG_SECONDARY,
  bgTertiary: COLOR_BG_TERTIARY,
  border: COLOR_BORDER,
  borderLight: COLOR_BORDER_LIGHT,
};
