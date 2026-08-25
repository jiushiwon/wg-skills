# 存储规范

## 1. 存储 Key 常量

所有存储 Key 必须定义在 `src/constants/storage.ts`，禁止硬编码。

```typescript
// src/constants/storage.ts

/** 存储 Key 常量 - 禁止硬编码 */
export const STORAGE_KEYS = {
  // ===== 认证相关 =====
  /** 登录 Token */
  TOKEN: 'auth_token',
  /** 刷新 Token */
  REFRESH_TOKEN: 'refresh_token',

  // ===== 用户相关 =====
  /** 用户信息 */
  USER_INFO: 'user_info',
  /** 用户设置 */
  USER_SETTINGS: 'user_settings',

  // ===== 应用相关 =====
  /** 主题 */
  THEME: 'app_theme',
  /** 语言 */
  LANGUAGE: 'app_language',

  // ===== 业务缓存 =====
  /** 搜索历史 */
  SEARCH_HISTORY: 'search_history',
  /** 草稿箱 */
  DRAFT: 'draft_',

  // ===== 版本相关 =====
  /** 最后版本号 */
  LAST_VERSION: 'last_version',
} as const;

/** 类型导出 */
export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];
```

## 2. 存储工具封装

```typescript
// src/utils/storage.ts

import { STORAGE_KEYS } from '@/constants/storage';

/** 存储工具 */
export const storage = {
  /** 获取值 */
  get<T>(key: string, defaultValue?: T): T | null {
    const value = uni.getStorageSync(key);
    return value ? JSON.parse(value) : (defaultValue ?? null);
  },

  /** 设置值 */
  set<T>(key: string, value: T): void {
    uni.setStorageSync(key, JSON.stringify(value));
  },

  /** 删除值 */
  remove(key: string): void {
    uni.removeStorageSync(key);
  },

  /** 清空 */
  clear(): void {
    uni.clearStorageSync();
  },

  /** 获取 Token */
  getToken(): string | null {
    return this.get<string>(STORAGE_KEYS.TOKEN);
  },

  /** 设置 Token */
  setToken(token: string): void {
    this.set(STORAGE_KEYS.TOKEN, token);
  },

  /** 移除 Token */
  removeToken(): void {
    this.remove(STORAGE_KEYS.TOKEN);
  },
};
```

## 3. 使用方式

```typescript
import { storage } from '@/utils/storage';
import { STORAGE_KEYS } from '@/constants/storage';

// ✅ 正确 - 使用常量
storage.setToken('xxx');
const userInfo = storage.get(STORAGE_KEYS.USER_INFO);

// ❌ 错误 - 硬编码
uni.setStorageSync('token', 'xxx');
```

## 4. 命名规范

| 前缀 | 用途 | 示例 |
|------|------|------|
| `auth_` | 认证相关 | `auth_token` |
| `user_` | 用户相关 | `user_info` |
| `app_` | 应用配置 | `app_theme` |
| `draft_` | 草稿缓存 | `draft_xxx` |

## 5. 注意事项

- **敏感信息**：Token、用户信息建议加密存储
- **大小限制**：本地存储不建议超过 10MB
- **清理策略**：定期清理过期缓存（草稿、搜索历史等）
