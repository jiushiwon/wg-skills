import { get, post, put, del } from '@/utils/request';

/** 角色 / 岗位简要信息（用户详情接口返回） */
export interface RoleBrief {
  id: number;
  name: string;
  code: string;
}

export interface PostBrief {
  id: number;
  name: string;
  code: string;
}

/**
 * 用户 VO（后端 `UserVO`）。
 *
 * 不含 `password`；列表项不含 `roles` / `posts`（需要时用回填接口 getUserRoles / getUserPosts）。
 */
export interface UserVO {
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
  createdAt: string;
  /** 仅详情接口返回 */
  updatedAt?: string | null;
  /** 仅详情接口返回；列表接口不返回 */
  roles?: RoleBrief[];
  /** 仅详情接口返回；列表接口不返回 */
  posts?: PostBrief[];
}

export interface UserQuery {
  page?: number;
  pageSize?: number;
  username?: string;
  status?: number;
}

/** 创建用户（roleIds / postIds 也可创建后走分配接口，不要两处都传） */
export interface CreateUserRequest {
  username: string;
  password: string;
  nickname: string;
  email?: string;
  phone?: string;
  orgId?: number;
  roleIds?: number[];
  postIds?: number[];
  status: number;
}

/** 更新用户（后端不支持改 username / password，也不在此接口处理 roleIds / postIds） */
export interface UpdateUserRequest {
  nickname?: string;
  email?: string;
  phone?: string;
  orgId?: number;
  status?: number;
}

export function getUserList(query: UserQuery): Promise<PageResponse<UserVO>> {
  return get('/users', query as unknown as Record<string, unknown>);
}

export function getUser(id: number): Promise<UserVO> {
  return get(`/users/${id}`);
}

export function createUser(data: CreateUserRequest): Promise<UserVO> {
  return post('/users', data);
}

export function updateUser(id: number, data: UpdateUserRequest): Promise<UserVO> {
  return put(`/users/${id}`, data);
}

export function deleteUser(id: number): Promise<void> {
  return del(`/users/${id}`);
}

/** 分配角色（全量覆盖：传空数组即清空） */
export function assignUserRoles(id: number, roleIds: number[]): Promise<void> {
  return put(`/users/${id}/roles`, { roleIds });
}

/** 分配岗位（全量覆盖：传空数组即清空） */
export function assignUserPosts(id: number, postIds: number[]): Promise<void> {
  return put(`/users/${id}/posts`, { postIds });
}

/** ★ 分配回填：当前已选角色 id（GET /api/users/{id}/roles → List<Long>） */
export function getUserRoles(id: number): Promise<number[]> {
  return get(`/users/${id}/roles`);
}

/** ★ 分配回填：当前已选岗位 id（GET /api/users/{id}/posts → List<Long>） */
export function getUserPosts(id: number): Promise<number[]> {
  return get(`/users/${id}/posts`);
}

/** 管理员重置用户密码 */
export function resetUserPassword(id: number, newPassword: string): Promise<void> {
  return put(`/users/${id}/password`, { newPassword });
}
