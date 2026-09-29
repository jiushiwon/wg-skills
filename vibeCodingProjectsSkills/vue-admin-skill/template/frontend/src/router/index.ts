import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';

/**
 * 路由表。
 *
 * ★ meta.permission 必须是三段式 `模块:资源:动作`，且与
 *   后端 `AuthPerms`（template/backend/.../auth/common/AuthPerms.java）
 *   和 DB `wg_sys_menu.permission` **逐字一致**。
 *
 *   页面权限码与列表接口权限码共用同一码，例如「用户管理」页面与 `GET /api/users`
 *   都是 `system:user:list`。写成两段式（`user:view`）会导致非超管角色进入系统管理
 *   菜单时全部 403。
 *
 * ★ meta.icon 存**图标名**（kebab-case），由 `components/icons/BaseIcon.vue`
 *   映射到图形；不得存 Unicode 图形字符（详见 frontend/ICONS.md）。
 */
const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: { public: true, title: '登录' }
  },
  {
    path: '/',
    component: () => import('@/layout/index.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/index.vue'),
        meta: { title: '仪表盘', icon: 'layout-dashboard', permission: 'dashboard:home:view' }
      },
      {
        path: 'system/user',
        name: 'User',
        component: () => import('@/views/system/user/index.vue'),
        meta: { title: '用户管理', icon: 'users', permission: 'system:user:list' }
      },
      {
        path: 'system/role',
        name: 'Role',
        component: () => import('@/views/system/role/index.vue'),
        meta: { title: '角色管理', icon: 'shield-check', permission: 'system:role:list' }
      },
      {
        path: 'system/menu',
        name: 'Menu',
        component: () => import('@/views/system/menu/index.vue'),
        meta: { title: '菜单管理', icon: 'settings', permission: 'system:menu:list' }
      },
      {
        path: 'system/org',
        name: 'Org',
        component: () => import('@/views/system/org/index.vue'),
        meta: { title: '组织管理', icon: 'building-2', permission: 'system:org:list' }
      },
      {
        path: 'system/app',
        name: 'App',
        component: () => import('@/views/system/app/index.vue'),
        meta: { title: '应用管理', icon: 'plug', permission: 'system:app:list' }
      },
      {
        path: 'example/product',
        name: 'Product',
        component: () => import('@/views/example/product/index.vue'),
        meta: { title: '商品列表', icon: 'blocks', permission: 'example:product:list' }
      },
      {
        path: 'account/bind',
        name: 'Bind',
        component: () => import('@/views/account/bind/index.vue'),
        meta: { title: '应用绑定', icon: 'link-2', permission: 'account:bind:list' }
      }
    ]
  },
  {
    path: '/403',
    name: 'Forbidden',
    component: () => import('@/views/error/403.vue'),
    meta: { public: true, title: '无权限' }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/error/404.vue'),
    meta: { public: true, title: '404' }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
