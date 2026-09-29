<template>
  <div class="app-shell">
    <AdminLayout
      :menus="layoutMenus"
      :username="userInfo?.nickname || userInfo?.username || 'User'"
      logo="Vue Admin"
      logo-icon="layout-dashboard"
      @logout="handleLogout"
      @menu-click="handleMenuClick"
      @user-menu="handleUserMenu"
    >
      <router-view />
    </AdminLayout>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import AdminLayout from '@/components/AdminLayout.vue';
import { useUserStore } from '@/store/user';
import { usePermissionStore } from '@/store/permission';

const userStore = useUserStore();
const permissionStore = usePermissionStore();
const router = useRouter();

const userInfo = computed(() => userStore.userInfo);
const menus = computed(() => permissionStore.menus);

// ponytail: SPA reload 之后 vue-router 4 不会触发 navigation（same-route 不算 push），
// 所以 router.beforeEach 不跑 → permission store 不会被 loadMenus 唤醒。
// 在 layout 的 onMounted 里**主动**调一次 loadMenus + fetchUserInfo：
// - loadMenus 走 localStorage 缓存（< 5 分钟）—— 0 网络请求，刷新后菜单立刻出现
// - 如果缓存过期或没缓存，会 fallback 到 fetchUserInfo → getMenus 拉取后端
// - 已加载过则两个都是 no-op（permission.loaded=false 时才执行）
onMounted(async () => {
  if (userStore.token && !permissionStore.loaded) {
    await permissionStore.loadMenus()
  }
  if (userStore.token && !userStore.userInfo) {
    try {
      await userStore.fetchUserInfo()
    } catch {
      // 401 由 request 拦截器统一处理
    }
  }
})

// 后端返回的菜单 icon 是图标名（kebab-case），交给 BaseIcon 渲染；null → undefined
const layoutMenus = computed(() =>
  menus.value.map((m) => ({
    id: m.id,
    name: m.name,
    path: m.path ?? undefined,
    icon: m.icon ?? undefined,
    children: m.children?.map((c) => ({
      id: c.id,
      name: c.name,
      path: c.path ?? undefined,
      icon: c.icon ?? undefined
    }))
  }))
);

function handleMenuClick(item: { path?: string }) {
  if (item.path) router.push(item.path);
}

function handleLogout() {
  userStore.logout();
}

/** ponytail: 头像 dropdown 子项。
 *  当前仅 logout 真正触发，其它项（个人中心/修改密码/切换主题）等待后续页面开发。
 *  switchTheme 演示如何挂载 token 主题切换，开发者按需扩展。 */
function handleUserMenu(key: string) {
  switch (key) {
    case 'logout':
      break
    case 'theme':
      const cur = document.documentElement.dataset.theme
      document.documentElement.dataset.theme = cur === 'dark' ? 'light' : 'dark'
      break
    case 'profile':
    case 'password':
      console.info(`[layout] ${key} 待 vue-account-skill 落地后接入`)
      break
  }
}
</script>

<style scoped>
.app-shell {
  width: 100%;
  height: 100vh;
}
</style>
