# vue-layout-skill

Vue 3 管理端布局技能，对标 Element Plus `el-container + el-aside + el-header + el-main`，全部原生实现。

## 功能特性

- ✅ 侧边栏菜单（多级嵌套、图标、徽标、折叠/展开）
- ✅ 顶栏（折叠按钮、面包屑、用户下拉菜单）
- ✅ 内容区（router-view + 自动 padding）
- ✅ 折叠动画（0.28s cubic-bezier 平滑过渡）
- ✅ 深色侧边栏 + 浅色内容区（经典管理端配色）
- ✅ 响应式（sidebar 固定定位，content 自适应）
- ✅ Token 驱动（所有颜色/尺寸走 CSS 变量）

## 引用组件

- vue-theme-skill — 设计 Token
- vue-button-skill — 折叠按钮
- vue-dropdown-skill — 用户下拉菜单

## 使用方式

```vue
<template>
  <AppLayout
    :menus="menus"
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

## 组件清单

| 组件 | 说明 |
|------|------|
| AppLayout | 最外层容器 |
| AppSidebar | 侧边栏（Logo + 菜单 + 折叠按钮） |
| AppHeader | 顶栏（折叠 + 面包屑 + 用户下拉） |
| AppMain | 内容区 |
| MenuItem | 菜单项（递归组件，支持多级） |

## 触发词

- "vue 布局" / "vue-layout"
- "管理端布局" / "admin 布局"
- "侧边栏" / "后台框架" / "AppLayout"
