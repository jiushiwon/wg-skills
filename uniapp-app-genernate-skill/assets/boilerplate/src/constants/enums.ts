export enum TabBarKey {
  HOME = 'home',
  LIST = 'list',
  PROFILE = 'profile',
}

export const TAB_BAR_TEXT: Record<TabBarKey, string> = {
  [TabBarKey.HOME]: '首页',
  [TabBarKey.LIST]: '列表',
  [TabBarKey.PROFILE]: '我的',
};
