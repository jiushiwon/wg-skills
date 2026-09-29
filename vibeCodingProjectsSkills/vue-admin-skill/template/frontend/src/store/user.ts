import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import * as authApi from '@/api/auth';
import { getToken, setToken, removeToken, setRefreshToken } from '@/utils/auth';
import router from '@/router';

/** 超级管理员角色码（与后端 `AuthPerms.ROLE_SUPER_ADMIN` 一致，是唯一的角色名短路白名单）。 */
export const ROLE_SUPER_ADMIN = 'super_admin';

export const useUserStore = defineStore('user', () => {
  const token = ref<string>(getToken() || '');
  const userInfo = ref<authApi.UserInfoResponse | null>(null);
  const permissions = ref<string[]>([]);
  const roles = ref<string[]>([]);

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
    await usePermissionStore().loadMenus();
  }

  async function fetchUserInfo(): Promise<void> {
    const info = await authApi.getUserInfo();
    userInfo.value = info;
    roles.value = info.roles || [];
    permissions.value = info.permissions || [];
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
