import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import * as authApi from '@/api/auth';
import { getToken, setToken, removeToken, setRefreshToken } from '@/utils/auth';
import router from '@/router';

const USER_INFO_CACHE_KEY = 'vue_admin_user_info_cache';
const USER_INFO_TTL_MS = 5 * 60 * 1000; // 5 分钟

interface CachedUserInfo {
  info: authApi.UserInfoResponse;
  ts: number;
}

/** ponytail: userInfo 也持久化 —— 刷新页面后立刻有昵称/角色，避免 dashboard 显示空值 */
function loadCachedUser(): CachedUserInfo | null {
  try {
    const raw = localStorage.getItem(USER_INFO_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedUserInfo;
    if (!parsed.ts || Date.now() - parsed.ts > USER_INFO_TTL_MS) return null;
    return parsed;
  } catch {
    return null;
  }
}

function saveCachedUser(info: authApi.UserInfoResponse): void {
  try {
    const payload: CachedUserInfo = { info, ts: Date.now() };
    localStorage.setItem(USER_INFO_CACHE_KEY, JSON.stringify(payload));
  } catch {
    // ignore
  }
}

function clearCachedUser(): void {
  try {
    localStorage.removeItem(USER_INFO_CACHE_KEY);
  } catch {
    // ignore
  }
}

/** 超级管理员角色码（与后端 `AuthPerms.ROLE_SUPER_ADMIN` 一致，是唯一的角色名短路白名单）。 */
export const ROLE_SUPER_ADMIN = 'super_admin';

export const useUserStore = defineStore('user', () => {
  const token = ref<string>(getToken() || '');
  // 优先从缓存恢复 —— 刷新后 dashboard 立即有昵称 + 角色，不再"undefined"
  const cached = loadCachedUser();
  const userInfo = ref<authApi.UserInfoResponse | null>(cached?.info ?? null);
  const permissions = ref<string[]>(cached?.info.permissions ?? []);
  const roles = ref<string[]>(cached?.info.roles ?? []);

  const isLoggedIn = computed(() => !!token.value);

  async function login(form: { username: string; password: string }): Promise<void> {
    const res = await authApi.login(form);
    token.value = res.accessToken;
    setToken(res.accessToken);
    if (res.refreshToken) setRefreshToken(res.refreshToken);
    await fetchUserInfo();
    // ponytail: 登录后必须加载菜单（pinia refresh 后 loaded=false 也要重置），
    // lazy import 避开 store 间循环依赖。
    const { usePermissionStore } = await import('@/store/permission');
    await usePermissionStore().loadMenus(true);
  }

  async function fetchUserInfo(force = false): Promise<void> {
    if (!force && userInfo.value) return;
    const info = await authApi.getUserInfo();
    userInfo.value = info;
    roles.value = info.roles || [];
    permissions.value = info.permissions || [];
    saveCachedUser(info);
  }

  async function logout(): Promise<void> {
    try {
      await authApi.logout();
    } catch {
      // ponytail: 即使后端登出失败也要清空前端态
    }
    token.value = '';
    userInfo.value = null;
    roles.value = [];
    permissions.value = [];
    removeToken();
    clearCachedUser();
    // ponytail: 退出登录必须清空权限菜单（loaded + menus），否则新用户登录看到的是上一个用户的菜单。
    const { usePermissionStore } = await import('@/store/permission');
    usePermissionStore().reset();
    router.push('/login');
  }

  /**
   * 权限判定。
   *
   * 1. 超管短路放行 —— 只认 `super_admin` 这一个角色码（与后端常量一致），
   *    不额外硬编码其他角色名。
   * 2. 其余角色按权限码**全等**匹配；权限码一律三段式 `模块:资源:动作`，
   *    与后端 `AuthPerms` / DB `wg_sys_menu.permission` 逐字一致，不做前缀/模糊匹配。
   */
  function hasPermission(p: string): boolean {
    if (roles.value.includes(ROLE_SUPER_ADMIN)) return true;
    return permissions.value.includes(p);
  }

  function hasAnyPermission(required: string[]): boolean {
    return required.some((p) => hasPermission(p));
  }

  return {
    token,
    userInfo,
    permissions,
    roles,
    isLoggedIn,
    login,
    fetchUserInfo,
    logout,
    hasPermission,
    hasAnyPermission
  };
});
