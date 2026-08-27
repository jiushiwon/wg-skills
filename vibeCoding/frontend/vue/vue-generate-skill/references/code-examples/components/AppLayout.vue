<script setup lang="ts">
// src/components/AppLayout.vue
// 全局布局组件（必备）

import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAppStore } from '@/stores/modules/app';
import { useUserStore } from '@/stores/modules/user';

interface Props {
  /** 是否显示侧边栏 */
  showSidebar?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  showSidebar: true,
});

const emit = defineEmits<{
  /** 登出事件 */
  logout: [];
}>();

const route = useRoute();
const router = useRouter();
const appStore = useAppStore();
const userStore = useUserStore();

const activeMenu = computed<string>(() => route.path);
const breadcrumb = computed<string[]>(() => appStore.breadcrumb);

function handleLogout(): void {
  userStore.logout();
  emit('logout');
  router.push('/login');
}
</script>

<template>
  <el-container class="app-layout">
    <el-aside v-if="props.showSidebar" :width="appStore.sidebarCollapsed ? '64px' : '240px'" class="app-layout__aside">
      <div class="app-layout__logo">
        <span v-if="!appStore.sidebarCollapsed">My App</span>
        <span v-else>MA</span>
      </div>
      <el-menu :default-active="activeMenu" router :collapse="appStore.sidebarCollapsed">
        <el-menu-item index="/">
          <el-icon><HomeFilled /></el-icon>
          <template #title>首页</template>
        </el-menu-item>
        <el-menu-item index="/users">
          <el-icon><User /></el-icon>
          <template #title>用户管理</template>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header class="app-layout__header">
        <div class="app-layout__header-left">
          <el-button text @click="appStore.toggleSidebar">
            <el-icon><Expand v-if="appStore.sidebarCollapsed" /><Fold v-else /></el-icon>
          </el-button>
          <el-breadcrumb :separator="'/'">
            <el-breadcrumb-item v-for="(item, idx) in breadcrumb" :key="idx">
              {{ item }}
            </el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="app-layout__header-right">
          <el-dropdown @command="handleLogout">
            <span class="app-layout__user">
              <el-avatar :size="32" :src="userStore.profile?.avatar">
                {{ userStore.profile?.nickname?.charAt(0) }}
              </el-avatar>
              <span>{{ userStore.profile?.nickname }}</span>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item>个人中心</el-dropdown-item>
                <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <el-main class="app-layout__main">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<style scoped lang="scss">
.app-layout {
  height: 100vh;

  &__aside {
    background: var(--color-bg-secondary);
    transition: width 0.2s;
  }

  &__logo {
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: var(--font-lg);
    font-weight: 600;
    color: var(--color-primary);
  }

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 var(--space-6);
    background: var(--color-bg);
    border-bottom: 1px solid var(--color-border);
  }

  &__header-left {
    display: flex;
    align-items: center;
    gap: var(--space-4);
  }

  &__user {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    cursor: pointer;
  }

  &__main {
    padding: var(--space-6);
    overflow-y: auto;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
