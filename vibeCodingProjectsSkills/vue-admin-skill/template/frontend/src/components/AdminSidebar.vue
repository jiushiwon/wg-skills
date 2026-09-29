<!--
  AdminSidebar — vue-admin-skill 本地侧边栏

  替代 vue-layout-skill 的 AppSidebar（仍在 package.json 软链接，但本项目不直接用）。
  原因：vue-layout-skill 的 MenuItem.vue 直接输出 icon 字符串，无法接入 SVG 图标组件。

  Logo 与折叠按钮的图形同样走 BaseIcon（图标名，见 frontend/ICONS.md）。
  改动范围：仅 vue-admin-skill 本地组件，不影响 vue-layout-skill 子技能本身。
-->
<script setup lang="ts">
/**
 * AdminSidebar — Logo + 多级菜单（递归）+ 折叠按钮
 * 主题：dark / light（与 vue-layout-skill 兼容）
 */
import { ref } from 'vue'
import AdminMenuItem from './AdminMenuItem.vue'
import BaseIcon from './icons/BaseIcon.vue'
import type { AdminMenuItemData } from './AdminMenuItem.vue'

interface Props {
  menus: AdminMenuItemData[]
  logo: string
  /** Logo 图标名（kebab-case） */
  logoIcon?: string
  width: number
  collapsedWidth: number
  collapsed: boolean
  theme?: 'dark' | 'light'
}

const props = withDefaults(defineProps<Props>(), {
  logoIcon: 'layout-dashboard',
  theme: 'dark',
})

const emit = defineEmits<{
  'menu-click': [item: AdminMenuItemData]
  'toggle-collapse': []
}>()

const activeKey = ref('')
const openKeys = ref<string[]>([])

function handleItemClick(item: AdminMenuItemData) {
  if (item.disabled) return
  if (item.children?.length) {
    const idx = openKeys.value.indexOf(String(item.id))
    if (idx >= 0) openKeys.value.splice(idx, 1)
    else openKeys.value.push(String(item.id))
  } else {
    activeKey.value = String(item.id)
    emit('menu-click', item)
  }
}
</script>

<template>
  <aside
    class="admin-sidebar"
    :class="[`admin-sidebar--${theme}`]"
    :style="{ width: collapsed ? collapsedWidth + 'px' : width + 'px' }"
  >
    <!-- Logo -->
    <div class="admin-sidebar__logo" :class="{ 'is-collapsed': collapsed }">
      <span class="admin-sidebar__logo-icon"><BaseIcon :name="logoIcon" :size="20" /></span>
      <span v-show="!collapsed" class="admin-sidebar__logo-text">{{ logo }}</span>
    </div>

    <!-- 菜单 -->
    <nav class="admin-sidebar__menu">
      <AdminMenuItem
        v-for="m in menus"
        :key="m.id"
        :item="m"
        :active-key="activeKey"
        :open-keys="openKeys"
        :collapsed="collapsed"
        :level="0"
        @click="handleItemClick"
      />
    </nav>

    <!-- 折叠按钮（图形走 BaseIcon，折叠态旋转 90° 表示展开方向） -->
    <div class="admin-sidebar__toggle" @click="emit('toggle-collapse')">
      <BaseIcon
        name="chevron-down"
        :size="16"
        class="admin-sidebar__toggle-icon"
        :class="{ 'is-collapsed': collapsed }"
      />
      <span v-show="!collapsed">收起</span>
    </div>
  </aside>
</template>

<style scoped>
.admin-sidebar {
  position: fixed; top: 0; left: 0; bottom: 0;
  display: flex; flex-direction: column;
  background: var(--color-surface);
  border-right: 1px solid var(--color-border);
  transition: width 0.2s ease;
  z-index: 100;
}
.admin-sidebar--dark {
  background: #1e293b;
  border-right-color: #334155;
  color: #cbd5e1;
}
.admin-sidebar--dark :deep(.mi) { color: #cbd5e1; }
.admin-sidebar--dark :deep(.mi__label:hover) { background: #334155; }
.admin-sidebar--dark :deep(.mi.is-active > .mi__label) {
  background: var(--color-primary);
  color: #fff;
}
.admin-sidebar--light {
  background: var(--color-surface);
  color: var(--color-text);
}

.admin-sidebar__logo {
  display: flex; align-items: center; gap: var(--space-2);
  height: 56px; padding: 0 var(--space-4);
  border-bottom: 1px solid var(--color-border);
  font-weight: 600;
}
.admin-sidebar--dark .admin-sidebar__logo { border-bottom-color: #334155; }
.admin-sidebar__logo.is-collapsed { justify-content: center; padding: 0; }
.admin-sidebar__logo-icon {
  display: inline-flex; align-items: center; justify-content: center;
}
.admin-sidebar__logo-text { font-size: 16px; }

.admin-sidebar__menu {
  flex: 1; overflow-y: auto; padding: var(--space-2) 0;
}

.admin-sidebar__toggle {
  display: flex; align-items: center; justify-content: center;
  gap: var(--space-2);
  height: 48px;
  border-top: 1px solid var(--color-border);
  cursor: pointer; font-size: 13px;
  transition: background 0.15s;
}
.admin-sidebar--dark .admin-sidebar__toggle { border-top-color: #334155; }
.admin-sidebar__toggle:hover { background: var(--color-background); }
.admin-sidebar--dark .admin-sidebar__toggle:hover { background: #334155; }
.admin-sidebar__toggle-icon { transition: transform 0.2s; }
.admin-sidebar__toggle-icon.is-collapsed { transform: rotate(-90deg); }
</style>
