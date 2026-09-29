<template>
  <div class="app-shell">
    <AdminLayout
      :menus="layoutMenus"
      :username="userInfo?.nickname || userInfo?.username || 'User'"
      logo="Vue Admin"
      logo-icon="layout-dashboard"
      @logout="handleLogout"
      @menu-click="handleMenuClick"
    >
      <router-view />
    </AdminLayout>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import AdminLayout from '@/components/AdminLayout.vue';
import { useUserStore } from '@/store/user';
import { usePermissionStore } from '@/store/permission';

const userStore = useUserStore();
const permissionStore = usePermissionStore();
const router = useRouter();

const userInfo = computed(() => userStore.userInfo);
const menus = computed(() => permissionStore.menus);

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
</script>

<style scoped>
.app-shell {
  width: 100%;
  height: 100vh;
}
</style>
