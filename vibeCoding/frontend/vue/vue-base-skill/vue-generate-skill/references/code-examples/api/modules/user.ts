// src/api/modules/user.ts
// 业务模块 API 示例（参考 vue-generate-skill/references/api-integration.md § 9）
import { get, post, put, del } from '../request';
import type { User, UserListParams, UserListResponse } from '@/types/user';

export const userApi = {
  list: (params: UserListParams) =>
    get<UserListResponse>('/users', params),

  get: (id: number) =>
    get<User>(`/users/${id}`),

  create: (data: Omit<User, 'id' | 'createdAt'>) =>
    post<User>('/users', data),

  update: (id: number, data: Partial<User>) =>
    put<User>(`/users/${id}`, data),

  remove: (id: number) =>
    del<void>(`/users/${id}`),
};