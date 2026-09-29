<!--
  AdminLayout — vue-admin-skill 本地简化版布局

  替代 vue-layout-skill 的 AppLayout（本项目仍软链接，但本地 override）。
  原因：vue-layout-skill 的 AppLayout 内部硬编码 import AppSidebar，
        而 AppSidebar 内部硬编码 import MenuItem（直接输出 icon 字符串）。
        本组件用 AdminSidebar（SVG 图标）替换。

  简化点：去掉 vue-layout-skill 的 Tabs / 多 sidebar theme / 折叠 tooltip 等高级特性，
         仅保留核心（侧边栏 + header + 主内容区）。
-->
<script setup lang="ts">
import { ref, provide, computed } from 'vue'
import AdminSidebar from './AdminSidebar.vue'
import BaseIcon from './icons/BaseIcon.vue'
import type { AdminMenuItemData } from './AdminMenuItem.vue'

interface Props {
  menus?: AdminMenuItemData[]
  logo?: string
  username?: string
  avatar?: string
  /** Logo 图标名（kebab-case，见 frontend/ICONS.md） */
  logoIcon?: string
  sidebarWidth?: number
  collapsedWidth?: number
}

const props = withDefaults(defineProps<Props>(), {
  menus: () => [],
  logo: 'Vue Admin',
  username: 'User',
  logoIcon: 'layout-dashboard',
  sidebarWidth: 220,
  collapsedWidth: 64,
})

const emit = defineEmits<{
  'menu-click': [item: AdminMenuItemData]
  'logout': []
}>()

const collapsed = ref(false)
provide('layoutCollapsed', collapsed)

const actualMargin = computed(() =>
  collapsed.value ? props.collapsedWidth : props.sidebarWidth
)

function onMenuClick(item: AdminMenuItemData) {
  emit('menu-click', item)
}
</script>

<template>
  <div class="admin-layout">
    <AdminSidebar
      :menus="menus"
      :logo="logo"
      :logo-icon="logoIcon"
      :width="sidebarWidth"
      :collapsed-width="collapsedWidth"
      :collapsed="collapsed"
      theme="dark"
      @menu-click="onMenuClick"
      @toggle-collapse="collapsed = !collapsed"
    />

    <div class="admin-layout__main" :style="{ marginLeft: actualMargin + 'px' }">
      <!-- 顶栏 -->
      <header class="admin-layout__header">
        <div class="admin-layout__header-left">
          <button
            class="admin-layout__toggle"
            type="button"
            :aria-label="collapsed ? '展开侧边栏' : '收起侧边栏'"
            @click="collapsed = !collapsed"
          >
            <BaseIcon name="menu" :size="16" />
          </button>
        </div>
        <div class="admin-layout__header-right">
          <div class="admin-layout__user" @click="emit('logout')">
            <div class="admin-layout__avatar">
              {{ username?.charAt(0)?.toUpperCase() || 'U' }}
            </div>
            <span class="admin-layout__username">{{ username }}</span>
          </div>
        </div>
      </header>

      <!-- 内容区 -->
      <main class="admin-layout__content">
        <slot />
      </main>
    </div>
  </div>
</template>

<style scoped>
.admin-layout { min-height: 100vh; background: var(--color-background); }
.admin-layout__main {
  min-height: 100vh;
  display: flex; flex-direction: column;
  transition: margin-left 0.2s ease;
}
.admin-layout__header {
  display: flex; align-items: center; justify-content: space-between;
  height: 56px; padding: 0 var(--space-4);
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
}
.admin-layout__toggle {
  width: 32px; height: 32px; border: none; background: transparent;
  cursor: pointer; font-size: 16px;
  display: inline-flex; align-items: center; justify-content: center;
  color: var(--color-text);
}
.admin-layout__toggle:hover { background: var(--color-background); border-radius: 4px; }

.admin-layout__user {
  display: flex; align-items: center; gap: var(--space-2);
  cursor: pointer; padding: 4px 8px; border-radius: 4px;
}
.admin-layout__user:hover { background: var(--color-background); }
.admin-layout__avatar {
  width: 32px; height: 32px; border-radius: 50%;
  background: var(--color-primary); color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-weight: 600;
}
.admin-layout__username { font-size: 14px; }

.admin-layout__content {
  flex: 1; padding: var(--space-4);
  overflow-y: auto;
}
</style>
