<script setup lang="ts">
import { useAppStore } from '~/stores/app'
import { useUserStore } from '~/stores/user'

const appStore = useAppStore()
const userStore = useUserStore()

const sidebarWidth = computed(() =>
  appStore.config.sidebarCollapsed ? '64px' : '220px',
)

const menuItems = [
  { label: '首页', icon: 'ep:home-filled', to: '/' },
  { label: '用户管理', icon: 'ep:user', to: '/users' },
  { label: '系统设置', icon: 'ep:setting', to: '/settings' },
]

function handleLogout(): void {
  userStore.logout()
}
</script>

<template>
  <div class="app-layout">
    <aside class="app-layout__sidebar" :style="{ width: sidebarWidth }">
      <div class="sidebar-logo">
        <img :src="appStore.config.logo" alt="Logo" class="sidebar-logo__img" />
        <span v-show="!appStore.config.sidebarCollapsed" class="sidebar-logo__title">
          {{ appStore.config.title }}
        </span>
      </div>

      <nav class="sidebar-menu">
        <NuxtLink
          v-for="item in menuItems"
          :key="item.to"
          :to="item.to"
          class="sidebar-menu__item"
        >
          <span class="sidebar-menu__icon">{{ item.icon }}</span>
          <span v-show="!appStore.config.sidebarCollapsed" class="sidebar-menu__label">
            {{ item.label }}
          </span>
        </NuxtLink>
      </nav>
    </aside>

    <div class="app-layout__main">
      <header class="app-layout__header">
        <button class="header-toggle" @click="appStore.toggleSidebar">
          折叠
        </button>

        <div class="header-user">
          <span class="header-user__name">{{ userStore.user?.nickname }}</span>
          <button class="header-user__logout" @click="handleLogout">
            退出登录
          </button>
        </div>
      </header>

      <main class="app-layout__content">
        <slot />
      </main>
    </div>
  </div>
</template>

<style scoped>
.app-layout {
  display: flex;
  min-height: 100vh;
}

.app-layout__sidebar {
  background: #001529;
  color: #fff;
  transition: width 0.3s ease;
  overflow: hidden;
}

.sidebar-logo {
  display: flex;
  align-items: center;
  padding: 16px;
  gap: 8px;
}

.sidebar-logo__img {
  width: 32px;
  height: 32px;
}

.sidebar-logo__title {
  font-size: 16px;
  font-weight: 600;
  white-space: nowrap;
}

.sidebar-menu {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px;
}

.sidebar-menu__item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  color: rgba(255, 255, 255, 0.65);
  text-decoration: none;
  border-radius: 6px;
  transition: background 0.2s;
}

.sidebar-menu__item:hover,
.sidebar-menu__item.router-link-active {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.app-layout__main {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.app-layout__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  height: 56px;
  background: #fff;
  border-bottom: 1px solid #f0f0f0;
}

.app-layout__content {
  flex: 1;
  padding: 24px;
  background: #f5f5f5;
}
</style>
