import { post, get, put } from '@/utils/request';
import type { MenuType } from './menu';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
}

/** 当前登录用户（GET /api/auth/me；含 roles / permissions，permissions 为三段式权限码） */
export interface UserInfoResponse {
  id: number;
  username: string;
  nickname: string;
  email: string | null;
  phone: string | null;
  avatar: string | null;
  tenantId: number | null;
  orgId: number | null;
  orgName: string | null;
  /** 0 禁用 / 1 启用 */
  status: number;
  /** 角色码列表，如 ['super_admin'] */
  roles: string[];
  /** 权限码列表（三段式），如 ['system:user:list'] */
  permissions: string[];
}

/** 菜单节点（GET /api/auth/menus，结构同 GET /api/menus，但只含当前用户可见的菜单） */
export interface MenuNode {
  id: number;
  parentId: number | null;
  name: string;
  path: string | null;
  component: string | null;
  menuType: MenuType;
  /** 图标名（kebab-case），由 BaseIcon 映射到图形 */
  icon: string | null;
  permission: string | null;
  sortOrder: number;
  /** 0 隐藏 / 1 显示 */
  visible: number;
  /** 0 禁用 / 1 启用 */
  status: number;
  children?: MenuNode[];
}

export function login(data: LoginRequest): Promise<LoginResponse> {
  return post('/auth/login', data);
}

/** 无状态 JWT：服务端不维护会话，前端清除 token 即视为登出 */
export function logout(): Promise<void> {
  return post('/auth/logout');
}

export function getUserInfo(): Promise<UserInfoResponse> {
  return get('/auth/me');
}

export function changePassword(data: { oldPassword: string; newPassword: string }): Promise<void> {
  return put('/auth/password', data);
}

export function getMenus(): Promise<MenuNode[]> {
  return get('/auth/menus');
}
