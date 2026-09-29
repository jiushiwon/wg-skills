---
name: vue-layout-skill
description: Vue 3 管理端布局技能，提供 AppLayout 骨架（侧边栏菜单 + 顶栏 + 内容区）。触发词："vue 布局"、"vue-layout"、"管理端布局"、"admin 布局"、"侧边栏"、"后台框架"。
---

# Vue Layout Skill

> **容器原则**：布局组件是项目的最外层骨架，所有页面都在 AppMain 内渲染
> **零 HTML5 标签**：菜单项、面包屑等全部用 `<div>` + CSS3 实现
> **Token 驱动**：所有尺寸、颜色、间距必须使用 `var(--*)` 变量

管理端标准布局，对标 Element Plus 的 `el-container + el-aside + el-header + el-main`，全部原生实现。

## 引用组件

| 组件技能 | 用途 |
|----------|------|
| vue-theme-skill | 设计 Token（颜色/尺寸/间距） |
| vue-button-skill | 侧边栏折叠按钮 |
| vue-dropdown-skill | 用户头像下拉菜单 |
| vue-tree-skill | 多级菜单树（可选） |

## 布局结构

```
┌─────────────────────────────────────────────┐
│ AppLayout                                   │
│ ┌──────────┬──────────────────────────────┐ │
│ │          │ AppHeader                    │ │
│ │ AppSidebar│ ┌──────────────────────────┐│ │
│ │          │ │ 折叠按钮 | 面包屑 | 用户  ││ │
│ │ ┌──────┐ │ └──────────────────────────┘│ │
│ │ │ Logo │ │                              │ │
│ │ ├──────┤ │ AppMain                      │ │
│ │ │      │ │ ┌──────────────────────────┐│ │
│ │ │ 菜单 │ │ │                          ││ │
│ │ │      │ │ │    <router-view />       ││ │
│ │ │      │ │ │                          ││ │
│ │ │      │ │ │                          ││ │
│ │ └──────┘ │ └──────────────────────────┘│ │
│ └──────────┴──────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

## 组件清单

| 组件 | 文件 | 说明 |
|------|------|------|
| AppLayout | AppLayout.vue | 最外层容器，管理 sidebar 折叠状态 |
| AppSidebar | AppSidebar.vue | 侧边栏（Logo + 菜单 + 折叠按钮） |
| AppHeader | AppHeader.vue | 顶栏（折叠按钮 + 面包屑 + 用户下拉） |
| AppMain | AppMain.vue | 内容区（router-view + 过渡动画） |
| MenuItem | MenuItem.vue | 菜单项（支持多级嵌套 + 图标 + 徽标） |

## 组件代码

### AppLayout.vue

```vue
<script setup lang="ts">
import { ref, provide } from 'vue';
import AppSidebar from './AppSidebar.vue';
import AppHeader from './AppHeader.vue';
import AppMain from './AppMain.vue';
import './styles.css';

interface MenuItem {
  key: string;
  label: string;
  icon?: string;
  path?: string;
  badge?: number | string;
  children?: MenuItem[];
}

interface Props {
  /** 菜单数据 */
  menus?: MenuItem[];
  /** Logo 文字 */
  logo?: string;
  /** Logo 图标（emoji 或文字） */
  logoIcon?: string;
  /** 默认折叠 */
  defaultCollapsed?: boolean;
  /** 侧边栏宽度 */
  sidebarWidth?: number;
  /** 折叠后宽度 */
  collapsedWidth?: number;
  /** 顶栏高度 */
  headerHeight?: number;
  /** 面包屑数据 */
  breadcrumbs?: Array<{ label: string; path?: string }>;
  /** 用户名 */
  username?: string;
  /** 头像（URL 或文字） */
  avatar?: string;
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
});

const emit = defineEmits<{
  'menu-click': [item: MenuItem];
  'logout': [];
  'collapse-change': [collapsed: boolean];
}>();

const collapsed = ref(props.defaultCollapsed);

// 通过 provide 向子组件传递折叠状态
provide('layoutCollapsed', collapsed);
provide('layoutSidebarWidth', () => collapsed.value ? props.collapsedWidth : props.sidebarWidth);

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
</script>

<template>
  <div class="app-layout" :class="{ 'is-collapsed': collapsed }">
    <AppSidebar
      :menus="menus"
      :logo="logo"
      :logo-icon="logoIcon"
      :width="sidebarWidth"
      :collapsed-width="collapsedWidth"
      :collapsed="collapsed"
      @menu-click="onMenuClick"
      @toggle-collapse="toggleCollapse"
    />
    <div class="app-layout__right" :style="{ marginLeft: (collapsed ? collapsedWidth : sidebarWidth) + 'px' }">
      <AppHeader
        :height="headerHeight"
        :collapsed="collapsed"
        :breadcrumbs="breadcrumbs"
        :username="username"
        :avatar="avatar"
        @toggle-collapse="toggleCollapse"
        @logout="onLogout"
      />
      <AppMain :header-height="headerHeight">
        <slot />
      </AppMain>
    </div>
  </div>
</template>
```

### AppSidebar.vue

```vue
<script setup lang="ts">
import { ref, computed, inject } from 'vue';
import MenuItem from './MenuItem.vue';

interface MenuItemData {
  key: string;
  label: string;
  icon?: string;
  path?: string;
  badge?: number | string;
  children?: MenuItemData[];
}

interface Props {
  menus: MenuItemData[];
  logo: string;
  logoIcon: string;
  width: number;
  collapsedWidth: number;
  collapsed: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  'menu-click': [item: MenuItemData];
  'toggle-collapse': [];
}>();

const activeKey = ref('');
const openKeys = ref<string[]>([]);

function handleClick(item: MenuItemData) {
  if (item.children?.length) {
    // 展开/折叠子菜单
    const idx = openKeys.value.indexOf(item.key);
    if (idx >= 0) openKeys.value.splice(idx, 1);
    else openKeys.value.push(item.key);
  } else {
    activeKey.value = item.key;
    emit('menu-click', item);
  }
}
</script>

<template>
  <aside class="app-sidebar" :style="{
    width: collapsed ? collapsedWidth + 'px' : width + 'px',
  }">
    <!-- Logo 区 -->
    <div class="app-sidebar__logo" :class="{ 'is-collapsed': collapsed }">
      <span class="app-sidebar__logo-icon">{{ logoIcon }}</span>
      <span v-if="!collapsed" class="app-sidebar__logo-text">{{ logo }}</span>
    </div>

    <!-- 菜单区 -->
    <nav class="app-sidebar__menu">
      <MenuItem
        v-for="item in menus"
        :key="item.key"
        :item="item"
        :active-key="activeKey"
        :open-keys="openKeys"
        :collapsed="collapsed"
        :level="0"
        @click="handleClick"
      />
    </nav>

    <!-- 折叠按钮 -->
    <div class="app-sidebar__collapse-btn" @click="emit('toggle-collapse')">
      <span :style="{ transform: collapsed ? 'rotate(180deg)' : '' }">◀</span>
    </div>
  </aside>
</template>
```

### AppHeader.vue

```vue
<script setup lang="ts">
import { ref } from 'vue';

interface Breadcrumb { label: string; path?: string }

interface Props {
  height: number;
  collapsed: boolean;
  breadcrumbs: Breadcrumb[];
  username: string;
  avatar?: string;
}

defineProps<Props>();
const emit = defineEmits<{
  'toggle-collapse': [];
  'logout': [];
}>();

const showDropdown = ref(false);
</script>

<template>
  <header class="app-header" :style="{ height: height + 'px' }">
    <!-- 左侧：折叠按钮 + 面包屑 -->
    <div class="app-header__left">
      <div class="app-header__collapse-btn" @click="emit('toggle-collapse')">
        <span :class="{ 'is-collapsed': collapsed }">☰</span>
      </div>
      <div v-if="breadcrumbs.length" class="app-header__breadcrumbs">
        <template v-for="(crumb, i) in breadcrumbs" :key="crumb.label">
          <span v-if="i > 0" class="app-header__breadcrumb-sep">/</span>
          <span class="app-header__breadcrumb-item" :class="{ 'is-last': i === breadcrumbs.length - 1 }">
            {{ crumb.label }}
          </span>
        </template>
      </div>
    </div>

    <!-- 右侧：用户下拉 -->
    <div class="app-header__right">
      <div class="app-header__user" @click="showDropdown = !showDropdown">
        <div v-if="avatar" class="app-header__avatar">
          <img :src="avatar" alt="avatar" />
        </div>
        <div v-else class="app-header__avatar app-header__avatar--text">
          {{ username.charAt(0).toUpperCase() }}
        </div>
        <span class="app-header__username">{{ username }}</span>
        <span class="app-header__arrow">▾</span>
      </div>
      <!-- 下拉菜单 -->
      <div v-if="showDropdown" class="app-header__dropdown">
        <div class="app-header__dropdown-item">个人中心</div>
        <div class="app-header__dropdown-item">设置</div>
        <div class="app-header__dropdown-divider"></div>
        <div class="app-header__dropdown-item app-header__dropdown-item--danger" @click="emit('logout')">
          退出登录
        </div>
      </div>
    </div>
  </header>
</template>
```

### AppMain.vue

```vue
<script setup lang="ts">
interface Props {
  headerHeight: number;
}

defineProps<Props>();
</script>

<template>
  <main class="app-main" :style="{ paddingTop: headerHeight + 'px' }">
    <div class="app-main__content">
      <slot />
    </div>
  </main>
</template>
```

### MenuItem.vue

```vue
<script setup lang="ts">
import { computed } from 'vue';

interface MenuItemData {
  key: string;
  label: string;
  icon?: string;
  path?: string;
  badge?: number | string;
  children?: MenuItemData[];
}

interface Props {
  item: MenuItemData;
  activeKey: string;
  openKeys: string[];
  collapsed: boolean;
  level: number;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  click: [item: MenuItemData];
}>();

const isOpen = computed(() => props.openKeys.includes(props.item.key));
const isActive = computed(() => props.activeKey === props.item.key);
const hasChildren = computed(() => props.item.children && props.item.children.length > 0);
</script>

<template>
  <div class="menu-item" :class="{
    'is-active': isActive,
    'is-open': isOpen,
    'is-collapsed': collapsed && level === 0,
  }">
    <!-- 菜单项本体 -->
    <div
      class="menu-item__label"
      :style="{ paddingLeft: collapsed && level === 0 ? '0' : (16 + level * 16) + 'px' }"
      @click="emit('click', item)"
      :title="collapsed && level === 0 ? item.label : ''"
    >
      <span v-if="item.icon" class="menu-item__icon">{{ item.icon }}</span>
      <span v-if="!collapsed || level > 0" class="menu-item__text">{{ item.label }}</span>
      <span v-if="item.badge && (!collapsed || level > 0)" class="menu-item__badge">{{ item.badge }}</span>
      <span v-if="hasChildren && (!collapsed || level > 0)" class="menu-item__arrow" :class="{ 'is-open': isOpen }">▾</span>
    </div>

    <!-- 子菜单（递归） -->
    <div v-if="hasChildren && isOpen && (!collapsed || level > 0)" class="menu-item__children">
      <MenuItem
        v-for="child in item.children"
        :key="child.key"
        :item="child"
        :active-key="activeKey"
        :open-keys="openKeys"
        :collapsed="collapsed"
        :level="level + 1"
        @click="(item) => emit('click', item)"
      />
    </div>
  </div>
</template>
```

## styles.css

```css
/* ==================== AppLayout ==================== */
.app-layout {
  min-height: 100vh;
  background: var(--color-bg, #f0f2f5);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

.app-layout__right {
  transition: margin-left 0.28s cubic-bezier(0.4, 0, 0.2, 1);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* ==================== AppSidebar ==================== */
.app-sidebar {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  background: var(--color-sidebar-bg, #001529);
  color: var(--color-sidebar-text, rgba(255, 255, 255, 0.65));
  transition: width 0.28s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 100;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.app-sidebar__logo {
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 0 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  flex-shrink: 0;
}

.app-sidebar__logo.is-collapsed {
  padding: 0;
}

.app-sidebar__logo-icon {
  font-size: 22px;
  flex-shrink: 0;
}

.app-sidebar__logo-text {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-sidebar-text-bright, #fff);
  white-space: nowrap;
  overflow: hidden;
}

.app-sidebar__menu {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 8px 0;
}

.app-sidebar__menu::-webkit-scrollbar {
  width: 4px;
}

.app-sidebar__menu::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 2px;
}

.app-sidebar__collapse-btn {
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.45);
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  flex-shrink: 0;
  transition: color 0.2s;
}

.app-sidebar__collapse-btn:hover {
  color: rgba(255, 255, 255, 0.85);
}

.app-sidebar__collapse-btn span {
  font-size: 12px;
  transition: transform 0.28s;
}

/* ==================== MenuItem ==================== */
.menu-item__label {
  height: 40px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding-right: 16px;
  cursor: pointer;
  border-radius: 6px;
  margin: 2px 8px;
  transition: all 0.2s;
  white-space: nowrap;
  overflow: hidden;
}

.menu-item__label:hover {
  background: rgba(255, 255, 255, 0.06);
}

.menu-item.is-active > .menu-item__label {
  background: var(--color-primary, #1890ff);
  color: #fff;
}

.menu-item.is-collapsed > .menu-item__label {
  justify-content: center;
  padding: 0;
  margin: 2px 12px;
}

.menu-item__icon {
  font-size: 16px;
  flex-shrink: 0;
  width: 20px;
  text-align: center;
}

.menu-item__text {
  flex: 1;
  font-size: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.menu-item__badge {
  background: var(--color-danger, #f56c6c);
  color: #fff;
  font-size: 11px;
  padding: 1px 6px;
  border-radius: 10px;
  min-width: 16px;
  text-align: center;
}

.menu-item__arrow {
  font-size: 10px;
  transition: transform 0.2s;
  color: rgba(255, 255, 255, 0.35);
}

.menu-item__arrow.is-open {
  transform: rotate(180deg);
}

.menu-item__children {
  overflow: hidden;
}

/* ==================== AppHeader ==================== */
.app-header {
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
  background: var(--color-surface, #fff);
  border-bottom: 1px solid var(--color-border, #e8e8e8);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  z-index: 99;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

.app-header__left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.app-header__collapse-btn {
  cursor: pointer;
  font-size: 18px;
  color: var(--color-text, #333);
  padding: 4px;
  border-radius: 4px;
  transition: background 0.2s;
}

.app-header__collapse-btn:hover {
  background: var(--color-bg-muted, #f5f5f5);
}

.app-header__collapse-btn span {
  display: inline-block;
  transition: transform 0.28s;
}

.app-header__collapse-btn span.is-collapsed {
  transform: rotate(90deg);
}

.app-header__breadcrumbs {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  color: var(--color-text-secondary, #999);
}

.app-header__breadcrumb-sep {
  color: var(--color-border, #ddd);
}

.app-header__breadcrumb-item.is-last {
  color: var(--color-text, #333);
  font-weight: 500;
}

.app-header__right {
  position: relative;
}

.app-header__user {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  transition: background 0.2s;
}

.app-header__user:hover {
  background: var(--color-bg-muted, #f5f5f5);
}

.app-header__avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
}

.app-header__avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.app-header__avatar--text {
  background: var(--color-primary, #1890ff);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
}

.app-header__username {
  font-size: 14px;
  color: var(--color-text, #333);
}

.app-header__arrow {
  font-size: 10px;
  color: var(--color-text-secondary, #999);
}

.app-header__dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 4px;
  background: var(--color-surface, #fff);
  border-radius: 8px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
  min-width: 140px;
  padding: 4px 0;
  z-index: 200;
}

.app-header__dropdown-item {
  padding: 8px 16px;
  font-size: 14px;
  color: var(--color-text, #333);
  cursor: pointer;
  transition: background 0.15s;
}

.app-header__dropdown-item:hover {
  background: var(--color-bg-muted, #f5f5f5);
}

.app-header__dropdown-item--danger {
  color: var(--color-danger, #f56c6c);
}

.app-header__dropdown-divider {
  height: 1px;
  background: var(--color-border, #eee);
  margin: 4px 0;
}

/* ==================== AppMain ==================== */
.app-main {
  flex: 1;
  min-height: 100vh;
}

.app-main__content {
  padding: 20px;
  min-height: calc(100vh - 56px);
}
```

## 使用方式

```vue
<script setup lang="ts">
import { AppLayout } from './components/AppLayout';

const menus = [
  { key: 'dashboard', label: '首页', icon: '📊', path: '/dashboard' },
  {
    key: 'system', label: '系统管理', icon: '⚙️',
    children: [
      { key: 'user', label: '用户管理', path: '/system/user' },
      { key: 'role', label: '角色管理', path: '/system/role' },
      { key: 'menu', label: '菜单管理', path: '/system/menu' },
    ],
  },
  {
    key: 'business', label: '业务管理', icon: '📦',
    children: [
      { key: 'goods', label: '商品管理', path: '/business/goods' },
      { key: 'order', label: '订单管理', badge: '12', path: '/business/order' },
    ],
  },
  { key: 'settings', label: '系统设置', icon: '🛠️', path: '/settings' },
];

const breadcrumbs = [
  { label: '首页' },
  { label: '系统管理' },
  { label: '用户管理' },
];

function onMenuClick(item) {
  router.push(item.path);
}

function onLogout() {
  // 清除 token + 跳转登录页
}
</script>

<template>
  <AppLayout
    :menus="menus"
    :breadcrumbs="breadcrumbs"
    logo="MyAdmin"
    logo-icon="⚡"
    username="Admin"
    @menu-click="onMenuClick"
    @logout="onLogout"
  >
    <router-view />
  </AppLayout>
</template>
```

## Props

### AppLayout

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| menus | `MenuItem[]` | `[]` | 菜单数据 |
| logo | `string` | `'Admin'` | Logo 文字 |
| logoIcon | `string` | `'⚡'` | Logo 图标 |
| defaultCollapsed | `boolean` | `false` | 默认折叠 |
| sidebarWidth | `number` | `220` | 侧边栏宽度（px） |
| collapsedWidth | `number` | `64` | 折叠后宽度（px） |
| headerHeight | `number` | `56` | 顶栏高度（px） |
| breadcrumbs | `Breadcrumb[]` | `[]` | 面包屑 |
| username | `string` | `'Admin'` | 用户名 |
| avatar | `string` | - | 头像 URL |

### MenuItem

```typescript
interface MenuItem {
  key: string;        // 唯一标识
  label: string;      // 显示文字
  icon?: string;      // 图标（emoji 或文字）
  path?: string;      // 路由路径
  badge?: number | string;  // 角标
  children?: MenuItem[];    // 子菜单
}
```

## 万能守则

-  禁止使用 `<nav>` `<header>` `<aside>` `<main>` 等 HTML5 语义标签（用 `<div>` + class）
-  禁止裸色值 / 裸 px（必须 `var(--*)` Token 变量）
-  禁止混入 Element Plus / Naive UI 的布局组件
-  禁止硬编码侧边栏宽度（必须通过 Props 控制）
-  菜单最多支持 3 级嵌套（超过 3 级说明信息架构有问题）

## 触发词

- "vue 布局"
- "vue-layout"
- "管理端布局"
- "admin 布局"
- "后台框架"
- "侧边栏"
- "AppLayout"
