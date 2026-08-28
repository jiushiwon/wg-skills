export const PagePaths = {
  HOME: 'pages/index/index',
  LIST: 'pages/list/index',
  FORM: 'pages/form/index',
  PROFILE: 'pages/profile/index',
} as const;

export type PagePath = typeof PagePaths[keyof typeof PagePaths];

export const PageTitles: Record<PagePath, string> = {
  [PagePaths.HOME]: '首页',
  [PagePaths.LIST]: '列表',
  [PagePaths.FORM]: '表单',
  [PagePaths.PROFILE]: '我的',
};
