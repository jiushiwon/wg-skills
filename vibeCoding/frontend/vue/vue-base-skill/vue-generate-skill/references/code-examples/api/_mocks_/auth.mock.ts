// src/api/_mocks_/auth.mock.ts
// ponytail: VITE_USE_MOCK=true 时所有 authApi 调用走这里，
// 让 LoginForm @submit 可以端到端跑通，联调时关掉 VITE_USE_MOCK 即可对接真实后端。
// 必须与 src/api/_mocks_/index.ts 的 MOCK_MAP 同名 import，否则会被 tree-shaking 清空。

import { MOCK_MAP, type MockEntry } from './index';
import type { LoginResponse, RefreshTokenResponse } from '@/types/api';
import type { User } from '@/types/user';

// ==================== 登录 ====================

MOCK_MAP['POST:/auth/login'] = {
  code: 0,
  message: 'ok',
  data: {
    token: 'mock-access-token-' + Date.now(),
    refreshToken: 'mock-refresh-token-' + Date.now(),
    tokenType: 'Bearer',
    expiresIn: 3600,
    user: {
      id: 1,
      username: 'admin',
      nickname: '超级管理员',
      avatar: 'https://example.com/avatar.png',
      email: 'admin@example.com',
      roles: ['super_admin'],
      tenantId: 1,
      createdAt: new Date().toISOString(),
    } satisfies User,
  },
} satisfies MockEntry<LoginResponse>;

// 登录失败示例（密码错误，可用于测试 toast）
MOCK_MAP['POST:/auth/login:wrong'] = {
  code: -1001,
  message: '用户名或密码错误',
  data: null,
} satisfies MockEntry<null>;

// ==================== 刷新 Token ====================

MOCK_MAP['POST:/auth/refresh'] = {
  code: 0,
  message: 'ok',
  data: {
    token: 'mock-access-token-refreshed-' + Date.now(),
    refreshToken: 'mock-refresh-token-refreshed-' + Date.now(),
  },
} satisfies MockEntry<RefreshTokenResponse>;

// ==================== 登出 ====================

MOCK_MAP['POST:/auth/logout'] = {
  code: 0,
  message: 'ok',
  data: null,
} satisfies MockEntry<null>;

// ==================== 当前用户信息 ====================

MOCK_MAP['GET:/auth/me'] = {
  code: 0,
  message: 'ok',
  data: {
    id: 1,
    username: 'admin',
    nickname: '超级管理员',
    avatar: 'https://example.com/avatar.png',
    email: 'admin@example.com',
    roles: ['super_admin'],
    tenantId: 1,
    createdAt: new Date().toISOString(),
  } satisfies User,
};