<script setup lang="ts">
/**
 * AppSidebar — 侧边栏（Logo + 多级菜单 + 折叠按钮）
 * 菜单支持无限级嵌套（递归 MenuItem 组件）
 * 支持深色/浅色两种主题
 */
import { ref, computed } from 'vue';
import MenuItemComp from './MenuItem.vue';
import type { MenuItem } from './types';

interface Props {
  menus: MenuItem[];
  logo: string;
  logoIcon: string;
  width: number;
  collapsedWidth: number;
  collapsed: boolean;
  theme?: 'dark' | 'light';
}

const props = withDefaults(defineProps<Props>(), {
  theme: 'dark',
});

const emit = defineEmits<{
  'menu-click': [item: MenuItem];
  'toggle-collapse': [];
}>();

const activeKey = ref('');
const openKeys = ref<string[]>([]);

function handleItemClick(item: MenuItem) {
  if (item.disabled) return;

  if (item.children?.length) {
    // 有子菜单 → 展开/折叠
    const idx = openKeys.value.indexOf(item.key);
    if (idx >= 0) {
      openKeys.value.splice(idx, 1);
    } else {
      openKeys.value.push(item.key);
    }
  } else {
    // 叶子节点 → 激活 + 触发事件
    activeKey.value = item.key;
    emit('menu-click', item);
  }
}
</script>

<template>
  <aside
    class="app-sidebar"
    :class="[`app-sidebar--${theme}`]"
    :style="{ width: collapsed ? collapsedWidth + 'px' : width + 'px' }"
  >
    <!-- Logo 区 -->
    <div class="app-sidebar__logo" :class="{ 'is-collapsed': collapsed }">
      <span class="app-sidebar__logo-icon">{{ logoIcon }}</span>
      <transition name="fade">
        <span v-show="!collapsed" class="app-sidebar__logo-text">{{ logo }}</span>
      </transition>
    </div>

    <!-- 菜单区 -->
    <div class="app-sidebar__menu-wrap">
      <MenuItemComp
        v-for="item in menus"
        :key="item.key"
        :item="item"
        :active-key="activeKey"
        :open-keys="openKeys"
        :collapsed="collapsed"
        :level="0"
        @click="handleItemClick"
      />
    </div>

    <!-- 折叠按钮 -->
    <div class="app-sidebar__footer" @click="emit('toggle-collapse')">
      <span class="app-sidebar__collapse-icon" :class="{ 'is-collapsed': collapsed }">
        ◀
      </span>
    </div>
  </aside>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
