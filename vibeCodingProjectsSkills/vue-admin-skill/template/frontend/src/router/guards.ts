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

  if (!userStore.userInfo) {
    try {
      await userStore.fetchUserInfo();
      await permissionStore.loadMenus();
    } catch {
      userStore.logout();
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
