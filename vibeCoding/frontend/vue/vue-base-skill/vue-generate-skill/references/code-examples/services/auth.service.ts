// src/services/auth.service.ts
// ponytail: Login.vue import { login } from '@/services/auth.service' 的源文件。
// 永远不要在组件里直接调 authApi + 手动 setToken：统一走 services 层。
// 这是 vue-generate-skill 标准四层架构（api / services / stores / composables）的一部分。

import { authApi } from '@/api/modules/auth';
import { setToken, setRefreshToken, clearToken, getRefreshToken } from '@/utils/auth';
import { useUserStore } from '@/stores/modules/user';
import { formatError } from '@/utils/error';
import type { LoginRequest, LoginResponse, RefreshTokenResponse } from '@/types/api';

/**
 * 登录入口 —— LoginForm @submit 直接 await 这个
 * ponytail: 内部串好 setToken + setRefreshToken + store.setProfile，
 * 调用方不需要再 import utils/auth 或 store。
 */
export async function login(credentials: LoginRequest): Promise<LoginResponse['user']> {
  const res = await authApi.login(credentials);
  setToken(res.token);
  if (res.refreshToken) setRefreshToken(res.refreshToken);
  const userStore = useUserStore();
  userStore.setProfile(res.user);
  return res.user;
}

/** 登出（清理前端态 + 调后端登出接口 + 跳登录页） */
export async function logout(): Promise<void> {
  try {
    await authApi.logout();
  } catch {
    // ponytail: 即使后端登出失败也要清前端态
  }
  clearToken();
  useUserStore().clearProfile();
  window.location.href = '/login';
}

/** 401 统一处理（响应拦截器抛 UNAUTHORIZED 时自动调用） */
export function handleUnauthorized(): void {
  clearToken();
  useUserStore().clearProfile();
  if (window.location.pathname !== '/login') {
    window.location.href = '/login';
  }
}

// ==================== Token 刷新队列（带并发控制） ====================

let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

function subscribeTokenRefresh(cb: (token: string) => void): void {
  refreshSubscribers.push(cb);
}

function onTokenRefreshed(token: string): void {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

/**
 * 刷新 Token
 * - 已刷新：复用同一 Promise
 * - 刷新中：后续请求进入队列等待
 * - 刷新失败：统一登出
 */
export async function refreshAccessToken(): Promise<string | null> {
  if (isRefreshing) {
    return new Promise((resolve) => subscribeTokenRefresh(resolve));
  }

  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    handleUnauthorized();
    return null;
  }

  isRefreshing = true;
  try {
    const res = await authApi.refresh({ refreshToken });
    setToken(res.token);
    if (res.refreshToken) setRefreshToken(res.refreshToken);
    onTokenRefreshed(res.token);
    return res.token;
  } catch {
    handleUnauthorized();
    throw formatError('REFRESH_FAILED', '刷新 Token 失败');
  } finally {
    isRefreshing = false;
  }
}