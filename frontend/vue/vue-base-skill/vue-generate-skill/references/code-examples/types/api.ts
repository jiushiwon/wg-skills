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

/** 分页响应。
 * ★ 数组字段固定为 `list`（不是 `items` / `records` / `content`），与 frontend-request-skill 规范一致。
 * 后端 PageResponse.java 的 Jackson 序列化字段名必须同源一致。 */
export interface PageResponse<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}

// ==================== 鉴权模块类型 ====================

/** 登录请求 */
export interface LoginRequest {
  username: string;
  password: string;
}

/** 登录响应（token + 用户信息） */
export interface LoginResponse {
  token: string;
  refreshToken: string;
  user: User;
  expiresIn?: number;
  tokenType?: string;
}

/** 刷新 Token 请求 */
export interface RefreshTokenRequest {
  refreshToken: string;
}

/** 刷新 Token 响应 */
export interface RefreshTokenResponse {
  token: string;
  refreshToken: string;
}