import router from './index';
import { useUserStore } from '@/store/user';
import { usePermissionStore } from '@/store/permission';
import { getToken } from '@/utils/auth';

const WHITE_LIST = ['/login', '/403'];

router.beforeEach(async (to, _from, next) => {
  const userStore = useUserStore();
  const permissionStore = usePermissionStore();
  const token = getToken();

  if (to.meta.public || WHITE_LIST.includes(to.path)) {
    return next();
  }

  if (!token) {
    return next(`/login?redirect=${encodeURIComponent(to.fullPath)}`);
  }

  // ponytail: 只要 token 有效就保证 userInfo + menus 已加载（之前只判断 !userInfo，
  // 但 menu 走缓存后 userInfo 也得每次刷新都拉一次，否则 userInfo 缺失会跳 /login）。
  if (!userStore.userInfo || !permissionStore.loaded) {
    try {
      if (!userStore.userInfo) await userStore.fetchUserInfo();
      await permissionStore.loadMenus();
    } catch {
      // fetchUserInfo 401（token 过期）由 request 拦截器统一跳 /login
      // 这里 catch 是为了避免未捕获的 promise rejection
      return next('/login');
    }
  }

  // 路由级权限校验：meta.permission 为三段式权限码（与后端 AuthPerms / DB 菜单逐字一致），
  // 超管短路放行在 store.user.hasPermission 内完成。
  const requiredPermission = to.meta.permission as string | undefined;
  if (requiredPermission && !userStore.hasPermission(requiredPermission)) {
    return next('/403');
  }

  next();
});
