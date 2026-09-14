// src/types/user.ts
// 用户业务类型

/** 用户基础信息 */
export interface User {
  id: number;
  username: string;
  nickname: string;
  avatar?: string;
  email?: string;
  roles: string[];
  tenantId: number;
  createdAt: string;
}

/** 用户列表查询参数 */
export interface UserListParams {
  page?: number;
  pageSize?: number;
  keyword?: string;
}

/** 用户列表响应 */
export interface UserListResponse {
  items: User[];
  total: number;
}

/** 创建用户请求 */
export type UserCreateRequest = Omit<User, 'id' | 'createdAt'>;

/** 更新用户请求 */
export type UserUpdateRequest = Partial<Omit<User, 'id' | 'createdAt'>>;
