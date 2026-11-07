/**
 * 自定义导航栏尺寸计算
 *
 * 口径说明（与 AppNavbar 组件内部完全一致，禁止各页面自行推算）：
 *   导航栏总高 = 胶囊带高度 + 标题行高度
 *   胶囊带高度 = (胶囊顶部 - 状态栏高度) * 2 + 胶囊高度
 *   标题行高度 = 88rpx 按当前屏宽折算为 px
 *
 * 为什么要单独成文件：
 *   `scoped` 样式里的 `:root { --height-navbar: ... }` 不会生效
 *   （编译后变成 `:root[data-v-xxx]`，匹配不到根元素），
 *   页面拿到的只会是 `var()` 的兜底值，导致内容被吸顶导航遮挡。
 *   因此高度一律由 JS 计算后通过 style 绑定下发。
 */

/** 标题行设计稿高度（rpx），与 SCSS 中的导航标题行高度对齐 */
const TITLE_ROW_RPX = 88;

export interface NavbarMetrics {
  /** 状态栏高度（px） */
  statusBarHeight: number;
  /** 胶囊带高度（px）：胶囊独占一行，返回图标在带内垂直居中 */
  capsuleBandHeight: number;
  /** 标题行高度（px） */
  titleRowHeight: number;
  /** 导航栏总高（px） */
  navBarHeight: number;
}

/** 读取系统信息与胶囊位置，失败时退化为保守默认值 */
function readSystemInfo() {
  const info = uni.getSystemInfoSync();
  const menuInfo =
    (uni.getMenuButtonBoundingClientRect && uni.getMenuButtonBoundingClientRect()) || null;
  return { info, menuInfo };
}

/** 计算导航栏各项尺寸 */
export function getNavbarMetrics(): NavbarMetrics {
  const { info, menuInfo } = readSystemInfo();

  const statusBarHeight = info.statusBarHeight || 0;
  const screenWidth = info.screenWidth || info.windowWidth || 375;

  const titleRowHeight = Math.round((TITLE_ROW_RPX * screenWidth) / 750);

  const capsuleTop = menuInfo ? menuInfo.top : statusBarHeight + 8;
  const capsuleHeight = menuInfo ? menuInfo.height : 32;
  const gapAbove = capsuleTop - statusBarHeight;
  const capsuleBandHeight = gapAbove * 2 + capsuleHeight;

  return {
    statusBarHeight,
    capsuleBandHeight,
    titleRowHeight,
    navBarHeight: capsuleBandHeight + titleRowHeight,
  };
}

/** 页面内容避让吸顶导航所需的下边距（px） */
export function getNavbarHeight(): number {
  return getNavbarMetrics().navBarHeight;
}
