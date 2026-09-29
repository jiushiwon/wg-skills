import { get, post, put, del } from '@/utils/request';

/** 数据权限范围（4 档，多角色取最宽档位；与后端 DataScope 一致） */
export type DataScope = 'ALL' | 'DEPT_AND_BELOW' | 'DEPT_ONLY' | 'SELF_ONLY';

/** 角色 VO（后端 `RoleVO`；`menuCount` 由后端真实统计返回） */
export interface RoleVO {
  id: number;
  name: string;
  code: string;
  description: string | null;
  dataScope: DataScope;
  sortOrder: number;
  /** 0 禁用 / 1 启用 */
  status: number;
  /** 已关联菜单数 */
  menuCount: number;
  createdAt: string;
}

export interface RoleQuery {
  page?: number;
  pageSize?: number;
  keyword?: string;
  status?: number;
}

export interface CreateRoleRequest {
  name: string;
  code: string;
  description?: string;
  dataScope: DataScope;
  sortOrder?: number;
  status: number;
}

/** 更新角色（不含 code，编码不可改） */
export interface UpdateRoleRequest {
  name?: string;
  description?: string;
  dataScope?: DataScope;
  sortOrder?: number;
  status?: number;
}

export function getRoleList(query: RoleQuery): Promise<PageResponse<RoleVO>> {
  return get('/roles', query as unknown as Record<string, unknown>);
}

export function getRole(id: number): Promise<RoleVO> {
  return get(`/roles/${id}`);
}

export function createRole(data: CreateRoleRequest): Promise<RoleVO> {
  return post('/roles', data);
}

export function updateRole(id: number, data: UpdateRoleRequest): Promise<RoleVO> {
  return put(`/roles/${id}`, data);
}

export function deleteRole(id: number): Promise<void> {
  return del(`/roles/${id}`);
}

/** 分配菜单（全量覆盖：传空数组即清空该角色全部菜单权限） */
export function assignRoleMenus(id: number, menuIds: number[]): Promise<void> {
  return put(`/roles/${id}/menus`, { menuIds });
}

/**
 * ★ 分配菜单回填：当前已选菜单 id（GET /api/roles/{id}/menus → List<Long>）。
 *
 * 没有这个回填，弹窗每次都是空树，点确定会把该角色的菜单权限**全部清空**。
 */
export function getRoleMenus(id: number): Promise<number[]> {
  return get(`/roles/${id}/menus`);
}
