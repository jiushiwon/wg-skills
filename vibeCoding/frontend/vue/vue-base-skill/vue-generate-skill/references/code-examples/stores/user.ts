// src/stores/modules/user.ts
// 用户 Pinia store（Setup 风格，严格类型推导）

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { User } from '@/types/user';

const TOKEN_KEY = 'token';
const REFRESH_TOKEN_KEY = 'refresh_token';

/**
 * 唯一允许 localStorage 操作的位置。
 * 组件、composable、其他 store 都通过 utils/auth.ts 调用本 store，
 * 严禁在外部直接读写 localStorage（见 api-integration.md §10 红线 #3）。
 */
export const useUserStore = defineStore('user', () => {
  // ========== State ==========
  const token = ref<string | null>(localStorage.getItem(TOKEN_KEY));
  const refreshToken = ref<string | null>(localStorage.getItem(REFRESH_TOKEN_KEY));
  const profile = ref<User | null>(null);
  const loading = ref(false);

  // ========== Getters ==========
  const isLoggedIn = computed<boolean>(() => Boolean(token.value));
  const userId = computed<number | null>(() => profile.value?.id ?? null);
  const roles = computed<string[]>(() => profile.value?.roles ?? []);
  const tenantId = computed<number | null>(() => profile.value?.tenantId ?? null);

  // ========== Actions ==========
  function setToken(value: string): void {
    token.value = value;
    localStorage.setItem(TOKEN_KEY, value);
  }

  function setRefreshToken(value: string): void {
    refreshToken.value = value;
    localStorage.setItem(REFRESH_TOKEN_KEY, value);
  }

  function setProfile(user: User): void {
    profile.value = user;
  }

  function setLoading(value: boolean): void {
    loading.value = value;
  }

  function clearToken(): void {
    token.value = null;
    refreshToken.value = null;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }

  function clearProfile(): void {
    profile.value = null;
  }

  function logout(): void {
    clearToken();
    clearProfile();
  }

  // ========== Reset ==========
  function $reset(): void {
    token.value = null;
    refreshToken.value = null;
    profile.value = null;
    loading.value = false;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }

  return {
    // State
    token,
    refreshToken,
    profile,
    loading,
    // Getters
    isLoggedIn,
    userId,
    roles,
    tenantId,
    // Actions
    setToken,
    setRefreshToken,
    setProfile,
    setLoading,
    clearToken,
    clearProfile,
    logout,
    $reset,
  };
});
