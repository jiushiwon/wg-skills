// src/api/modules/auth.ts
// ponytail: 鉴权 API 模块（扁平命名空间风格，与 user.ts / order.ts 等其他模块风格一致）。
// 必须与 src/api/_mocks_/auth.mock.ts 配对，VITE_USE_MOCK=true 时所有请求自动走 Mock。

import { post, get } from '../request';
import type { LoginRequest, LoginResponse, RefreshTokenRequest, RefreshTokenResponse } from '@/types/api';

/**
 * 鉴权 API 命名空间
 * 消费方：authApi.login(credentials) / authApi.logout() / authApi.getCurrentUser()
 *
 * 注意：login 不需要带 Token（needAuth: false），其他接口默认 needAuth: true。
 */
export const authApi = {
  /** 用户名密码登录 */
  login: (data: LoginRequest) =>
    post<LoginResponse>('/auth/login', data, { needAuth: false }),

  /** 登出（清理服务端 session） */
  logout: () =>
    post<void>('/auth/logout', undefined, { needAuth: false }),

  /** 刷新 Token（响应拦截器自动触发，业务代码不需要手动调用） */
  refresh: (data: RefreshTokenRequest) =>
    post<RefreshTokenResponse>('/auth/refresh', data, { needAuth: false, skipAuthHandler: true }),

  /** 获取当前登录用户信息（启动时 / 401 后拉取） */
  getCurrentUser: () =>
    get<LoginResponse['user']>('/auth/me'),
};