import { get, post, put, del } from '@/utils/request';

/**
 * 菜单类型：`M`=目录 / `C`=菜单 / `F`=按钮。
 * 兼容读取历史数据里的 `B`（旧值，语义同 `F`=按钮），写入时一律用 `F`。
 */
export type MenuType = 'M' | 'C' | 'F' | 'B';

/** 菜单 VO（后端 `MenuVO`，与 GET /api/menus 同结构） */
export interface MenuVO {
  id: number;
  parentId: number | null;
  name: string;
  path: string | null;
  component: string | null;
  menuType: MenuType;
  /** 图标名（kebab-case，如 `users`），由 BaseIcon 映射到图形；不得存 Unicode 图形字符 */
  icon: string | null;
  /** 权限标识（三段式 模块:资源:动作） */
  permission: string | null;
  sortOrder: number;
  /** 0 隐藏 / 1 显示 */
  visible: number;
  /** 0 禁用 / 1 启用 */
  status: number;
  children?: MenuVO[];
}

export interface SaveMenuRequest {
  parentId: number | null;
  name: string;
  path?: string | null;
  component?: string | null;
  menuType: MenuType;
  icon?: string | null;
  permission?: string | null;
  sortOrder?: number;
  visible?: number;
  status?: number;
}

/** 菜单树（全量，不受当前用户角色限制） */
export function getMenuTree(): Promise<MenuVO[]> {
  return get('/api/menus');
}

export function createMenu(data: SaveMenuRequest): Promise<MenuVO> {
  return post('/api/menus', data);
}

export function updateMenu(id: number, data: Partial<SaveMenuRequest>): Promise<MenuVO> {
  return put(`/api/menus/${id}`, data);
}

export function deleteMenu(id: number): Promise<void> {
  return del(`/api/menus/${id}`);
}
