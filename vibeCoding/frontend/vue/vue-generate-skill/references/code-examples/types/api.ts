// src/types/api.ts
// 全局 API 类型定义（严格对齐 backend-convention-skill 的响应信封）

import type { User } from './user';

/** 后端响应信封（与后端契约对齐） */
export interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data: T;
}

/** 请求错误 */
export interface RequestError {
  code: string | number;
  message: string;
  raw?: unknown;
}

/** HTTP 方法 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'OPTIONS' | 'HEAD';

/** Token 鉴权头模式 */
export type AuthMode = 'bearer' | 'customer-token';

/** 分页请求参数 */
export interface PageParams {
  page?: number;
  pageSize?: number;
  keyword?: string;
}

/** 分页响应 */
export interface PageResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

/** 登录请求 */
export interface LoginRequest {
  username: string;
  password: string;
}

/** 登录响应 */
export interface LoginResponse {
  token: string;
  refreshToken: string;
  user: User;
}

/** 刷新 Token 请求 */
export interface RefreshTokenRequest {
  refreshToken: string;
}