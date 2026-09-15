<script setup lang="ts">
/**
 * AppLayout — 管理端最外层布局容器
 * 经典侧边栏 + 顶栏 + 内容区，支持折叠/展开
 * 方案一（经典）+ 方案二（Tabs）合并，通过 showTabs 控制
 */
import { ref, provide, computed } from 'vue';
import AppSidebar from './AppSidebar.vue';
import AppHeader from './AppHeader.vue';
import AppMain from './AppMain.vue';
import type { MenuItem, Breadcrumb, TabItem } from './types';
import './styles.css';

interface Props {
  /** 菜单数据 */
  menus?: MenuItem[];
  /** Logo 文字 */
  logo?: string;
  /** Logo 图标（emoji 或文字） */
  logoIcon?: string;
  /** 默认折叠侧边栏 */
  defaultCollapsed?: boolean;
  /** 侧边栏宽度 */
  sidebarWidth?: number;
  /** 折叠后宽度 */
  collapsedWidth?: number;
  /** 顶栏高度 */
  headerHeight?: number;
  /** 面包屑数据 */
  breadcrumbs?: Breadcrumb[];
  /** 用户名 */
  username?: string;
  /** 头像 URL */
  avatar?: string;
  /** 是否显示 Tabs 标签页 */
  showTabs?: boolean;
  /** Tabs 数据（showTabs=true 时必传） */
  tabs?: TabItem[];
  /** 当前激活的 Tab key */
  activeTab?: string;
  /** 侧边栏主题 */
  sidebarTheme?: 'dark' | 'light';
}

const props = withDefaults(defineProps<Props>(), {
  menus: () => [],
  logo: 'Admin',
  logoIcon: '⚡',
  defaultCollapsed: false,
  sidebarWidth: 220,
  collapsedWidth: 64,
  headerHeight: 56,
  breadcrumbs: () => [],
  username: 'Admin',
  showTabs: false,
  tabs: () => [],
  activeTab: '',
  sidebarTheme: 'dark',
});

const emit = defineEmits<{
  'menu-click': [item: MenuItem];
  'logout': [];
  'collapse-change': [collapsed: boolean];
  'tab-click': [tab: TabItem];
  'tab-close': [tab: TabItem];
  'user-click': [];
}>();

const collapsed = ref(props.defaultCollapsed);

// 向子组件 provide 折叠状态（MenuItem 的 tooltip 需要）
provide('layoutCollapsed', collapsed);
provide('layoutSidebarWidth', () => collapsed.value ? props.collapsedWidth : props.sidebarWidth);

const sidebarActualWidth = computed(() => collapsed.value ? props.collapsedWidth : props.sidebarWidth);

function toggleCollapse() {
  collapsed.value = !collapsed.value;
  emit('collapse-change', collapsed.value);
}

function onMenuClick(item: MenuItem) {
  emit('menu-click', item);
}

function onLogout() {
  emit('logout');
}

function onTabClick(tab: TabItem) {
  emit('tab-click', tab);
}

function onTabClose(tab: TabItem) {
  emit('tab-close', tab);
}
</script>

<template>
  <div class="app-layout" :class="[
    `app-layout--sidebar-${sidebarTheme}`,
    { 'is-collapsed': collapsed },
  ]">
    <!-- 侧边栏 -->
    <AppSidebar
      :menus="menus"
      :logo="logo"
      :logo-icon="logoIcon"
      :width="sidebarWidth"
      :collapsed-width="collapsedWidth"
      :collapsed="collapsed"
      :theme="sidebarTheme"
      @menu-click="onMenuClick"
      @toggle-collapse="toggleCollapse"
    />

    <!-- 右侧区域 -->
    <div
      class="app-layout__main"
      :style="{ marginLeft: sidebarActualWidth + 'px' }"
    >
      <!-- 顶栏 -->
      <AppHeader
        :height="headerHeight"
        :collapsed="collapsed"
        :breadcrumbs="breadcrumbs"
        :username="username"
        :avatar="avatar"
        @toggle-collapse="toggleCollapse"
        @logout="onLogout"
        @user-click="emit('user-click')"
      />

      <!-- Tabs 标签页（可选） -->
      <div
        v-if="showTabs"
        class="app-layout__tabs"
        :style="{ top: headerHeight + 'px' }"
      >
        <div
          v-for="tab in tabs"
          :key="tab.key"
          class="app-layout__tab"
          :class="{ 'is-active': tab.key === activeTab, 'is-affix': tab.affix }"
          @click="onTabClick(tab)"
        >
          <span class="app-layout__tab-label">{{ tab.label }}</span>
          <span
            v-if="!tab.affix"
            class="app-layout__tab-close"
            @click.stop="onTabClose(tab)"
          >×</span>
        </div>
      </div>

      <!-- 内容区 -->
      <AppMain
        :header-height="headerHeight"
        :tabs-height="showTabs ? 40 : 0"
      >
        <slot />
      </AppMain>
    </div>
  </div>
</template>
