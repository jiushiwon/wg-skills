/** 菜单项 */
export interface MenuItem {
  /** 唯一标识 */
  key: string;
  /** 显示文字 */
  label: string;
  /** 图标（emoji、文字或 icon class） */
  icon?: string;
  /** 路由路径 */
  path?: string;
  /** 角标数字或文字 */
  badge?: number | string;
  /** 子菜单 */
  children?: MenuItem[];
  /** 是否禁用 */
  disabled?: boolean;
  /** 外链地址（新窗口打开） */
  href?: string;
}

/** 面包屑项 */
export interface Breadcrumb {
  label: string;
  path?: string;
}

/** Tab 标签页项 */
export interface TabItem {
  /** 唯一标识（通常用 route.path 或 route.name） */
  key: string;
  /** 显示文字 */
  label: string;
  /** 是否固定（不可关闭） */
  affix?: boolean;
  /** 关联的路由路径 */
  path?: string;
  /** 图标 */
  icon?: string;
}
