---
name: vue-layout-skill
description: Vue 3 管理端布局技能，提供 7 种布局模式。触发词："vue 布局"、"vue-layout"、"管理端布局"、"admin 布局"、"后台框架"。
---

# vue-layout-skill

> **容器原则**：布局组件是项目的最外层骨架，所有页面都在 AppMain 内渲染
> **零 HTML5 标签**：菜单项、面包屑等全部用 `<div>` + CSS3 实现
> **Token 驱动**：所有尺寸、颜色、间距必须使用 `var(--*)` 变量

管理端标准布局，支持 7 种布局模式，全部原生实现。

## 引用组件

| 组件技能 | 用途 | 状态 |
|----------|------|------|
| vue-theme-skill | 设计 Token（颜色/尺寸/间距） | ✅ |
| vue-menu-skill | 菜单组件（侧边栏/顶部菜单） | ✅ |
| vue-card-skill | 容器包裹 | ✅ |
| frontend-icon-skill | 图标渲染 | ✅ |
| vue-badge-skill | 菜单徽标 | ✅ |
| vue-dropdown-skill | 用户下拉菜单 | ✅ |
| vue-breadcrumb-skill | 面包屑导航 | ✅ |

## 7 种布局模式

| 模式 | 布局 | 说明 |
|------|------|------|
| `sidebar` | 侧边栏用户 | 左侧侧边栏，用户在侧边栏内，顶部有面包屑+用户 |
| `horizontal` | 横向顶部 | Logo 在左，菜单在顶部横排，用户在右上 |
| `topbar` | 顶部双栏 | 顶部两行：Logo+用户 / 导航菜单 |
| `sidebar-user-bottom` | 用户在菜单下 | 用户在侧边栏菜单下方，顶部仅面包屑 |
| `mix` | 混合模式 | 顶部导航 + 左侧图标侧边栏 |
| `sidebar-right` | 侧边栏在右 | 菜单在右侧显示 |
| `header-only` | 只有顶栏 | 无侧边栏，仅顶部导航 |

## 组件层级

```
AppLayout (L0 布局容器)
├── AppSidebar (L1 侧边栏)
│   ├── Logo 区域
│   └── base-menu (引用 vue-menu-skill)
├── AppHeader (L1 顶栏)
│   ├── 折叠按钮 + 面包屑
│   └── 用户下拉 (引用 vue-dropdown-skill)
└── AppMain (L1 内容区)
    └── <router-view />
```

## 组件清单

| 组件 | 文件 | 说明 |
|------|------|------|
| AppLayout | AppLayout.vue | 最外层容器，管理折叠状态和布局模式 |
| AppSidebar | AppSidebar.vue | 侧边栏（Logo + 菜单 + 折叠按钮） |
| AppHeader | AppHeader.vue | 顶栏（折叠按钮 + 面包屑 + 用户下拉） |
| AppMain | AppMain.vue | 内容区（router-view + 过渡动画） |

## 组件代码

### AppLayout.vue

```vue
<script setup lang="ts">
import { ref, provide, computed } from 'vue';
import AppSidebar from './AppSidebar.vue';
import AppHeader from './AppHeader.vue';
import AppMain from './AppMain.vue';
import './styles.css';

type LayoutMode = 'sidebar' | 'horizontal' | 'topbar' | 'sidebar-user-bottom' | 'mix' | 'sidebar-right' | 'header-only';

interface MenuItem {
  key: string;
  label: string;
  icon?: string;
  path?: string;
  badge?: number | string;
  children?: MenuItem[];
}

interface Props {
  /** 布局模式 */
  mode?: LayoutMode;
  /** 菜单数据 */
  menus?: MenuItem[];
  /** Logo 文字 */
  logo?: string;
  /** Logo 图标（使用 frontend-icon-skill 生成） */
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
  mode: 'sidebar',
  menus: () => [],
  logo: 'Admin',
  logoIcon: 'logo',
  defaultCollapsed: false,
  sidebarWidth: 220,
  collapsedWidth: 64,
  headerHeight: 48,
  breadcrumbs: () => [],
  username: 'Admin',
});

const emit = defineEmits<{
  'menu-click': [item: MenuItem];
  'logout': [];
  'collapse-change': [collapsed: boolean];
}>();

const collapsed = ref(props.defaultCollapsed);

// 布局类名
const layoutClass = computed(() => ({
  'is-collapsed': collapsed.value,
  [`layout-${props.mode}`]: true,
}));

// 侧边栏位置
const sidebarPosition = computed(() => props.mode === 'sidebar-right' ? 'right' : 'left');

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

provide('layoutCollapsed', collapsed);
provide('layoutSidebarWidth', () => collapsed.value ? props.collapsedWidth : props.sidebarWidth);
</script>

<template>
  <div class="app-layout" :class="layoutClass">
    <!-- 混合模式：顶部导航 -->
    <div v-if="mode === 'mix'" class="app-topbar">
      <div class="app-topbar__logo">
        <slot name="logo-icon">
          <div class="app-topbar__logo-icon">
            <base-icon :name="logoIcon" />
          </div>
        </slot>
        <span class="app-topbar__logo-text">{{ logo }}</span>
      </div>
      <div class="app-topbar__menu">
        <base-menu :data="menus" mode="horizontal" @select="onMenuClick" />
      </div>
      <div class="app-topbar__right">
        <base-dropdown :trigger="['click']">
          <template #trigger>
            <div class="app-header__user">
              <div class="app-header__avatar">
                <img v-if="avatar" :src="avatar" alt="avatar" />
                <span v-else>{{ username.charAt(0) }}</span>
              </div>
              <span class="app-header__username">{{ username }}</span>
            </div>
          </template>
          <div class="app-header__dropdown-menu">
            <div class="app-header__dropdown-item">个人中心</div>
            <div class="app-header__dropdown-item">账号设置</div>
            <div class="app-header__dropdown-divider"></div>
            <div class="app-header__dropdown-item is-danger" @click="onLogout">退出登录</div>
          </div>
        </base-dropdown>
      </div>
    </div>

    <!-- 顶部双栏模式 -->
    <div v-if="mode === 'topbar'" class="app-topbar app-topbar--double">
      <div class="app-topbar__top">
        <div class="app-topbar__logo">
          <slot name="logo-icon">
            <div class="app-topbar__logo-icon">
              <base-icon :name="logoIcon" />
            </div>
          </slot>
          <span class="app-topbar__logo-text">{{ logo }}</span>
        </div>
        <div class="app-topbar__right">
          <base-dropdown :trigger="['click']">
            <template #trigger>
              <div class="app-header__user">
                <div class="app-header__avatar">
                  <img v-if="avatar" :src="avatar" alt="avatar" />
                  <span v-else>{{ username.charAt(0) }}</span>
                </div>
                <span class="app-header__username">{{ username }}</span>
              </div>
            </template>
            <div class="app-header__dropdown-menu">
              <div class="app-header__dropdown-item">个人中心</div>
              <div class="app-header__dropdown-item is-danger" @click="onLogout">退出登录</div>
            </div>
          </base-dropdown>
        </div>
      </div>
      <div class="app-topbar__nav">
        <base-menu :data="menus" mode="horizontal" @select="onMenuClick" />
      </div>
    </div>

    <!-- 横向顶部模式 -->
    <div v-if="mode === 'horizontal'" class="app-topbar app-topbar--single">
      <div class="app-topbar__logo">
        <slot name="logo-icon">
          <div class="app-topbar__logo-icon">
            <base-icon :name="logoIcon" />
          </div>
        </slot>
        <span class="app-topbar__logo-text">{{ logo }}</span>
      </div>
      <div class="app-topbar__menu">
        <base-menu :data="menus" mode="horizontal" @select="onMenuClick" />
      </div>
      <div class="app-topbar__right">
        <base-dropdown :trigger="['click']">
          <template #trigger>
            <div class="app-header__user">
              <div class="app-header__avatar">
                <img v-if="avatar" :src="avatar" alt="avatar" />
                <span v-else>{{ username.charAt(0) }}</span>
              </div>
              <span class="app-header__username">{{ username }}</span>
            </div>
          </template>
          <div class="app-header__dropdown-menu">
            <div class="app-header__dropdown-item">个人中心</div>
            <div class="app-header__dropdown-item is-danger" @click="onLogout">退出登录</div>
          </div>
        </base-dropdown>
      </div>
    </div>

    <!-- 侧边栏 -->
    <AppSidebar
      v-if="mode !== 'header-only'"
      :menus="menus"
      :logo="logo"
      :logo-icon="logoIcon"
      :width="sidebarWidth"
      :collapsed-width="collapsedWidth"
      :collapsed="collapsed"
      :position="sidebarPosition"
      :mode="mode"
      :username="username"
      :avatar="avatar"
      @menu-click="onMenuClick"
      @toggle-collapse="toggleCollapse"
      @logout="onLogout"
    />

    <!-- 主内容区 -->
    <div class="app-layout__right" :class="{ 'is-sidebar-right': mode === 'sidebar-right' }">
      <AppHeader
        v-if="mode !== 'topbar' && mode !== 'horizontal' && mode !== 'mix'"
        :height="headerHeight"
        :collapsed="collapsed"
        :breadcrumbs="breadcrumbs"
        :username="username"
        :avatar="avatar"
        :show-toggle="mode === 'sidebar' || mode === 'sidebar-user-bottom'"
        :show-user="mode === 'sidebar'"
        @toggle-collapse="toggleCollapse"
        @logout="onLogout"
      />
      <AppMain :header-height="mode === 'topbar' ? 110 : (mode === 'mix' ? 48 : headerHeight)">
        <slot />
      </AppMain>
    </div>
  </div>
</template>
```

### AppSidebar.vue

```vue
<script setup lang="ts">
import { ref, computed } from 'vue';
import BaseMenu from 'vue-menu-skill/components/BaseMenu.vue';

type LayoutMode = 'sidebar' | 'horizontal' | 'topbar' | 'sidebar-user-bottom' | 'mix' | 'sidebar-right' | 'header-only';

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
  position?: 'left' | 'right';
  mode?: LayoutMode;
  username?: string;
  avatar?: string;
}

const props = withDefaults(defineProps<Props>(), {
  position: 'left',
  mode: 'sidebar',
  username: 'Admin',
});

const emit = defineEmits<{
  'menu-click': [item: MenuItemData];
  'toggle-collapse': [];
  'logout': [];
}>();

const activeKey = ref('');
const showUserDropdown = ref(false);

const sidebarStyle = computed(() => ({
  width: props.collapsed ? props.collapsedWidth + 'px' : props.width + 'px',
  left: props.position === 'left' ? '0' : 'auto',
  right: props.position === 'right' ? '0' : 'auto',
}));

function handleSelect(item: MenuItemData) {
  emit('menu-click', item);
}

function toggleUserDropdown() {
  showUserDropdown.value = !showUserDropdown.value;
}
</script>

<template>
  <div class="app-sidebar" :class="{ 'is-collapsed': collapsed, 'is-right': position === 'right' }" :style="sidebarStyle">
    <!-- Logo 区 -->
    <div class="app-sidebar__logo" :class="{ 'is-collapsed': collapsed }">
      <slot name="logo-icon">
        <div class="app-sidebar__logo-icon">
          <base-icon :name="logoIcon" />
        </div>
      </slot>
      <span v-if="!collapsed" class="app-sidebar__logo-text">{{ logo }}</span>
    </div>

    <!-- 菜单区：引用 vue-menu-skill -->
    <div class="app-sidebar__menu">
      <BaseMenu
        v-if="mode !== 'mix'"
        :data="menus"
        mode="vertical"
        :active-key="activeKey"
        :collapsed="collapsed"
        :collapsible="true"
        @select="handleSelect"
      />
    </div>

    <!-- 用户在侧边栏（sidebar 模式） -->
    <div v-if="mode === 'sidebar'" class="app-sidebar__user" @click="toggleUserDropdown">
      <div class="app-sidebar__user-avatar">
        <img v-if="avatar" :src="avatar" alt="avatar" />
        <span v-else>{{ username?.charAt(0) }}</span>
      </div>
      <div v-if="!collapsed" class="app-sidebar__userinfo">
        <div class="app-sidebar__username">{{ username }}</div>
        <div class="app-sidebar__role">超级管理员</div>
      </div>
      <!-- 下拉菜单 -->
      <div v-if="showUserDropdown" class="app-sidebar__dropdown">
        <div class="app-sidebar__dropdown-item">个人中心</div>
        <div class="app-sidebar__dropdown-item">账号设置</div>
        <div class="app-sidebar__dropdown-divider"></div>
        <div class="app-sidebar__dropdown-item is-danger" @click.stop="emit('logout')">退出登录</div>
      </div>
    </div>

    <!-- 用户在菜单下方（sidebar-user-bottom 模式） -->
    <div v-if="mode === 'sidebar-user-bottom'" class="app-sidebar__user-bottom" @click="toggleUserDropdown">
      <div class="app-sidebar__user-avatar">
        <img v-if="avatar" :src="avatar" alt="avatar" />
        <span v-else>{{ username?.charAt(0) }}</span>
      </div>
      <div class="app-sidebar__userinfo">
        <div class="app-sidebar__username">{{ username }}</div>
        <div class="app-sidebar__role">超级管理员</div>
      </div>
      <div v-if="showUserDropdown" class="app-sidebar__dropdown">
        <div class="app-sidebar__dropdown-item">个人中心</div>
        <div class="app-sidebar__dropdown-item is-danger" @click.stop="emit('logout')">退出登录</div>
      </div>
    </div>

    <!-- 混合模式：图标侧边栏 -->
    <div v-if="mode === 'mix'" class="app-sidebar__menu app-sidebar__menu--icon">
      <BaseMenu
        :data="menus"
        mode="vertical"
        :collapsed="true"
        :collapsible="false"
        @select="handleSelect"
      />
    </div>

    <!-- 折叠按钮 -->
    <div v-if="mode === 'sidebar'" class="app-sidebar__toggle" @click="emit('toggle-collapse')">
      <base-icon :name="collapsed ? 'expand' : 'collapse'" />
    </div>
  </div>
</template>
```

### AppHeader.vue

```vue
<script setup lang="ts">
import { ref } from 'vue';
import BaseDropdown from 'vue-dropdown-skill/components/BaseDropdown.vue';

interface Breadcrumb {
  label: string;
  path?: string;
}

interface Props {
  height: number;
  collapsed: boolean;
  breadcrumbs: Breadcrumb[];
  username: string;
  avatar?: string;
  showToggle?: boolean;
  showUser?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  breadcrumbs: () => [],
  showToggle: true,
  showUser: true,
});

const emit = defineEmits<{
  'toggle-collapse': [];
  'logout': [];
}>();

const showDropdown = ref(false);
</script>

<template>
  <div class="app-header" :style="{ height: height + 'px' }">
    <!-- 左侧 -->
    <div class="app-header__left">
      <div v-if="showToggle" class="app-header__toggle" @click="emit('toggle-collapse')">
        <base-icon :name="collapsed ? 'menu-unfold' : 'menu-fold'" />
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
    <div v-if="showUser" class="app-header__right">
      <BaseDropdown v-model:open="showDropdown" :trigger="['click']">
        <template #trigger>
          <div class="app-header__user" @click="showDropdown = !showDropdown">
            <div class="app-header__avatar">
              <img v-if="avatar" :src="avatar" alt="avatar" />
              <span v-else>{{ username?.charAt(0) }}</span>
            </div>
            <span class="app-header__username">{{ username }}</span>
            <span class="app-header__arrow">▼</span>
          </div>
        </template>
        <div class="app-header__dropdown-menu">
          <div class="app-header__dropdown-item">个人中心</div>
          <div class="app-header__dropdown-item">账号设置</div>
          <div class="app-header__dropdown-divider"></div>
          <div class="app-header__dropdown-item is-danger" @click="emit('logout')">退出登录</div>
        </div>
      </BaseDropdown>
    </div>
  </div>
</template>
```

### AppMain.vue

```vue
<script setup lang="ts">
interface Props {
  headerHeight: number;
}

const props = defineProps<Props>();
</script>

<template>
  <div class="app-main" :style="{ paddingTop: headerHeight + 'px' }">
    <div class="app-main__content">
      <slot />
    </div>
  </div>
</template>
```

## styles.css

> **所有样式必须引用 vue-theme-skill Token，禁止自定义变量**

```css
/* ==================== AppLayout ==================== */
.app-layout {
  min-height: 100vh;
  background: var(--color-bg);
  font-family: var(--font-family, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif);
}

.app-layout.is-collapsed .app-layout__right {
  margin-left: var(--collapsed-width, 64px);
}

.app-layout.is-sidebar-right .app-layout__right {
  margin-right: var(--sidebar-width, 220px);
  margin-left: 0;
}

/* ==================== AppSidebar ==================== */
.app-sidebar {
  position: fixed;
  top: 0;
  bottom: 0;
  background: var(--color-surface);
  border-right: 1px solid var(--color-border);
  transition: width 0.28s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 100;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.app-sidebar.is-right {
  border-right: none;
  border-left: 1px solid var(--color-border);
}

.app-sidebar.is-collapsed {
  width: var(--collapsed-width, 64px);
}

.app-sidebar__logo {
  height: var(--height-button-lg, 48px);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: 0 var(--space-4);
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
}

.app-sidebar__logo.is-collapsed {
  padding: 0;
  justify-content: center;
}

.app-sidebar__logo-icon {
  width: 24px;
  height: 24px;
  background: var(--color-primary);
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.app-sidebar__logo-text {
  font-size: var(--font-lg);
  font-weight: var(--weight-semibold);
  color: var(--color-text);
  white-space: nowrap;
  overflow: hidden;
}

.app-sidebar__menu {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-2) 0;
}

.app-sidebar__menu--icon .menu-item__label {
  justify-content: center;
  padding: 0;
}

.app-sidebar__menu--icon .menu-item__text,
.app-sidebar__menu--icon .menu-item__arrow {
  display: none;
}

.app-sidebar__user {
  padding: var(--space-4);
  border-top: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  gap: var(--space-3);
  cursor: pointer;
  position: relative;
}

.app-sidebar__user-avatar {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-full);
  background: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-inverse);
  font-size: var(--font-xs);
  font-weight: var(--weight-semibold);
  flex-shrink: 0;
  overflow: hidden;
}

.app-sidebar__user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.app-sidebar__userinfo {
  flex: 1;
  overflow: hidden;
}

.app-sidebar__username {
  font-size: var(--font-sm);
  font-weight: var(--weight-medium);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.app-sidebar__role {
  font-size: var(--font-xs);
  color: var(--color-text-secondary);
}

.app-sidebar__user-bottom {
  margin-top: auto;
  padding: var(--space-4);
  border-top: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  gap: var(--space-3);
  cursor: pointer;
  position: relative;
}

.app-sidebar__dropdown {
  position: absolute;
  bottom: 100%;
  left: var(--space-4);
  right: var(--space-4);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-md);
  padding: var(--space-1) 0;
  margin-bottom: var(--space-2);
  z-index: 100;
}

.app-sidebar__dropdown-item {
  padding: var(--space-2) var(--space-4);
  font-size: var(--font-sm);
  color: var(--color-text);
  cursor: pointer;
  transition: background 0.15s;
}

.app-sidebar__dropdown-item:hover {
  background: var(--color-bg);
}

.app-sidebar__dropdown-item.is-danger {
  color: var(--color-danger);
}

.app-sidebar__dropdown-divider {
  height: 1px;
  background: var(--color-border);
  margin: var(--space-1) 0;
}

.app-sidebar__toggle {
  height: var(--height-button-md, 40px);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--color-text-secondary);
  border-top: 1px solid var(--color-border);
  flex-shrink: 0;
  transition: color 0.2s;
}

.app-sidebar__toggle:hover {
  color: var(--color-text);
}

/* ==================== AppTopbar（顶部导航） ==================== */
.app-topbar {
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  padding: 0 var(--space-4);
  gap: var(--space-4);
  height: var(--height-button-lg, 48px);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 99;
}

.app-topbar--double {
  height: 110px;
  flex-direction: column;
  align-items: stretch;
}

.app-topbar--double .app-topbar__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: var(--space-3);
  border-bottom: 1px solid var(--color-border);
}

.app-topbar--double .app-topbar__nav {
  padding-top: var(--space-2);
  display: flex;
  gap: var(--space-2);
}

.app-topbar__logo {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.app-topbar__logo-icon {
  width: 24px;
  height: 24px;
  background: var(--color-primary);
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
}

.app-topbar__logo-text {
  font-size: var(--font-lg);
  font-weight: var(--weight-semibold);
}

.app-topbar__menu {
  flex: 1;
  display: flex;
}

.app-topbar__right {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

/* ==================== AppHeader ==================== */
.app-header {
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
  height: var(--height-button-lg, 48px);
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--space-5);
  z-index: 99;
  box-shadow: var(--shadow-sm);
}

.app-header__left {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.app-header__toggle {
  cursor: pointer;
  padding: var(--space-1);
  border-radius: var(--radius-sm);
  color: var(--color-text-secondary);
  transition: all 0.2s;
}

.app-header__toggle:hover {
  background: var(--color-bg);
  color: var(--color-text);
}

.app-header__breadcrumbs {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  font-size: var(--font-sm);
  color: var(--color-text-secondary);
}

.app-header__breadcrumb-sep {
  color: var(--color-border);
}

.app-header__breadcrumb-item.is-last {
  color: var(--color-text);
  font-weight: var(--weight-medium);
}

.app-header__right {
  position: relative;
}

.app-header__user {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  cursor: pointer;
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-md);
  transition: background 0.2s;
}

.app-header__user:hover {
  background: var(--color-bg);
}

.app-header__avatar {
  width: 28px;
  height: 28px;
  border-radius: var(--radius-full);
  background: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-inverse);
  font-size: var(--font-xs);
  font-weight: var(--weight-semibold);
  flex-shrink: 0;
  overflow: hidden;
}

.app-header__avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.app-header__username {
  font-size: var(--font-sm);
  color: var(--color-text);
}

.app-header__arrow {
  font-size: 10px;
  color: var(--color-text-secondary);
}

.app-header__dropdown-menu {
  position: absolute;
  top: calc(100% + 4px);
  right: 0;
  min-width: 160px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-md);
  padding: var(--space-1) 0;
  z-index: 100;
}

.app-header__dropdown-item {
  padding: var(--space-2) var(--space-4);
  font-size: var(--font-sm);
  color: var(--color-text);
  cursor: pointer;
  transition: background 0.15s;
}

.app-header__dropdown-item:hover {
  background: var(--color-bg);
}

.app-header__dropdown-item.is-danger {
  color: var(--color-danger);
}

.app-header__dropdown-divider {
  height: 1px;
  background: var(--color-border);
  margin: var(--space-1) 0;
}

/* ==================== AppMain ==================== */
.app-main {
  flex: 1;
  min-height: 100vh;
}

.app-main__content {
  padding: var(--space-5);
  min-height: calc(100vh - var(--height-button-lg, 48px));
}
```

## 使用方式

```vue
<script setup lang="ts">
import { AppLayout } from './components/AppLayout';

const menus = [
  { key: 'dashboard', label: '控制台', icon: 'dashboard', path: '/dashboard' },
  {
    key: 'system', label: '系统管理', icon: 'setting',
    children: [
      { key: 'user', label: '用户管理', icon: 'user', path: '/system/user' },
      { key: 'role', label: '角色管理', icon: 'team', path: '/system/role' },
    ],
  },
  { key: 'order', label: '订单管理', icon: 'order', badge: 5, path: '/order' },
];

const breadcrumbs = [
  { label: '首页', path: '/' },
  { label: '系统管理' },
  { label: '用户管理' },
];

function handleMenuClick(item) {
  router.push(item.path);
}

function handleLogout() {
  // 清除 token + 跳转登录页
}
</script>

<template>
  <!-- 1. 侧边栏用户（默认） -->
  <AppLayout
    mode="sidebar"
    :menus="menus"
    :breadcrumbs="breadcrumbs"
    logo="考拉搞AI"
    logo-icon="logo"
    username="Admin"
    @menu-click="handleMenuClick"
    @logout="handleLogout"
  >
    <router-view />
  </AppLayout>

  <!-- 2. 横向顶部 -->
  <AppLayout
    mode="horizontal"
    :menus="menus"
    logo="考拉搞AI"
    logo-icon="logo"
    username="Admin"
  >
    <router-view />
  </AppLayout>

  <!-- 3. 顶部双栏 -->
  <AppLayout
    mode="topbar"
    :menus="menus"
    logo="考拉搞AI"
    logo-icon="logo"
    username="Admin"
  >
    <router-view />
  </AppLayout>

  <!-- 4. 用户在侧边栏菜单下方 -->
  <AppLayout
    mode="sidebar-user-bottom"
    :menus="menus"
    :breadcrumbs="breadcrumbs"
    logo="考拉搞AI"
    logo-icon="logo"
    username="Admin"
  >
    <router-view />
  </AppLayout>

  <!-- 5. 混合模式 -->
  <AppLayout
    mode="mix"
    :menus="menus"
    logo="考拉搞AI"
    logo-icon="logo"
    username="Admin"
  >
    <router-view />
  </AppLayout>

  <!-- 6. 侧边栏在右 -->
  <AppLayout
    mode="sidebar-right"
    :menus="menus"
    :breadcrumbs="breadcrumbs"
    logo="考拉搞AI"
    logo-icon="logo"
    username="Admin"
  >
    <router-view />
  </AppLayout>

  <!-- 7. 只有顶栏 -->
  <AppLayout
    mode="header-only"
    :menus="menus"
    :breadcrumbs="breadcrumbs"
    logo="考拉搞AI"
    logo-icon="logo"
    username="Admin"
  >
    <router-view />
  </AppLayout>
</template>
```

## Props

### AppLayout

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| mode | `'sidebar' \| 'horizontal' \| 'topbar' \| 'sidebar-user-bottom' \| 'mix' \| 'sidebar-right' \| 'header-only'` | `'sidebar'` | 布局模式 |
| menus | `MenuItem[]` | `[]` | 菜单数据 |
| logo | `string` | `'Admin'` | Logo 文字 |
| logoIcon | `string` | `'logo'` | Logo 图标名（frontend-icon-skill） |
| defaultCollapsed | `boolean` | `false` | 默认折叠 |
| sidebarWidth | `number` | `220` | 侧边栏宽度（px） |
| collapsedWidth | `number` | `64` | 折叠后宽度（px） |
| headerHeight | `number` | `48` | 顶栏高度（px） |
| breadcrumbs | `Breadcrumb[]` | `[]` | 面包屑 |
| username | `string` | `'Admin'` | 用户名 |
| avatar | `string` | - | 头像 URL |

### MenuItem

```typescript
interface MenuItem {
  key: string;        // 唯一标识
  label: string;      // 显示文字
  icon?: string;      // 图标名（frontend-icon-skill）
  path?: string;      // 路由路径
  badge?: number | string;  // 角标
  children?: MenuItem[];    // 子菜单
}
```

## 万能守则

- 禁止使用 `<nav>` `<header>` `<aside>` `<main>` 等 HTML5 语义标签（用 `<div>` + class）
- 禁止裸色值 / 裸 px（必须 `var(--*)` Token 变量）
- 禁止混入 Element Plus / Naive UI 的布局组件
- 禁止硬编码侧边栏宽度（必须通过 Props 控制）
- 菜单最多支持 3 级嵌套
- **图标必须使用 frontend-icon-skill**，禁止 emoji
- **用户下拉必须使用 vue-dropdown-skill**
- **侧边栏菜单必须使用 vue-menu-skill**

## 触发词

- "vue 布局"
- "vue-layout"
- "管理端布局"
- "admin 布局"
- "后台框架"
- "侧边栏"
- "AppLayout"
- "顶部导航"
- "混合布局"
