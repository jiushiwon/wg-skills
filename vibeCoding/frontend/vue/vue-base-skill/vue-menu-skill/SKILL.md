---
name: vue-menu-skill
description: Vue 菜单组件技能。垂直/水平菜单、可折叠、多级子菜单、路由集成、权限控制。通过 props 控制模式（横向/纵向）、触发方式（hover/click）、展开策略（当前级/全级）。依赖 vue-list-item-skill 作为底层渲染。触发词：Vue 菜单、侧边栏菜单、顶部菜单、导航菜单、menu 组件、base-menu。
trigger: |
  做一个菜单组件 | 做一个侧边栏菜单 | 做一个顶部菜单
  vue-menu | base-menu | 导航菜单
  菜单组件 | 横向菜单 | 垂直菜单
  菜单折叠 | 子菜单 | 多级菜单
---

> **容器原则**：必须用 [vue-card-skill](../vue-card-skill/SKILL.md) 的 `<base-card>` 包裹。
>
> **底层依赖**：[vue-list-item-skill](../vue-list-item-skill/SKILL.md)（节点渲染基座）
>
> **零样式标签铁律**：实现代码仅使用 `<div>` / `<span>` + CSS3

# vue-menu-skill

> 菜单组件技能。横向/纵向、可折叠、多级子菜单、路由/权限集成。
> 依赖 `vue-list-item-skill` 作为底层渲染。

## 核心组件

| 组件 | 说明 |
|------|------|
| BaseMenu | 主菜单组件 |
| BaseMenuItem | 菜单项 |
| BaseSubMenu | 子菜单容器 |

## 模式矩阵

| props | 值 | 说明 |
|-------|-----|------|
| `mode` | `'vertical'` / `'horizontal'` | 横向/纵向 |
| `trigger` | `'hover'` / `'click'` | 子菜单触发方式 |
| `expandLevel` | `'current'` / `'all'` | 展开策略 |
| `collapsible` | `boolean` | 是否可折叠 |
| `collapsed` | `boolean` | 折叠状态（受控） |

## Props

### BaseMenu

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `mode` | `'vertical' \| 'horizontal'` | `'vertical'` | 菜单模式 |
| `data` | `MenuData[]` | `[]` | 菜单数据 |
| `activeKey` | `string` | `''` | 当前激活项 |
| `trigger` | `'hover' \| 'click'` | `'hover'` | 子菜单触发方式 |
| `expandLevel` | `'current' \| 'all'` | `'current'` | 展开策略 |
| `collapsible` | `boolean` | `false` | 是否可折叠 |
| `collapsed` | `boolean` | `false` | 折叠状态 |
| `accordion` | `boolean` | `true` | 手风琴模式 |
| `router` | `boolean` | `false` | 是否启用路由 |
| `width` | `string` | `'200px'` | 菜单宽度 |
| `collapsedWidth` | `string` | `'64px'` | 折叠宽度 |

### BaseMenuItem

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `item` | `MenuItemData` | - | 菜单项数据 |
| `level` | `number` | `0` | 层级 |
| `collapsed` | `boolean` | `false` | 折叠态 |

## 类型定义

```typescript
export interface MenuItemData {
  key: string
  label: string
  icon?: string
  badge?: string | number
  disabled?: boolean
  route?: string
  children?: MenuItemData[]
}

export type MenuMode = 'vertical' | 'horizontal'
export type MenuTrigger = 'hover' | 'click'
export type MenuExpandLevel = 'current' | 'all'
```

## 使用示例

```vue
<!-- 纵向菜单（侧边栏） -->
<base-menu
  mode="vertical"
  :data="menuData"
  v-model:activeKey="activeKey"
  collapsible
  @select="handleSelect"
/>

<!-- 横向菜单（顶部） -->
<base-menu
  mode="horizontal"
  :data="menuData"
  trigger="hover"
  expandLevel="current"
/>

<!-- 折叠菜单 -->
<base-menu
  mode="vertical"
  :data="menuData"
  :collapsed="isCollapsed"
  @select="handleSelect"
/>

<script setup>
const menuData = [
  {
    key: 'dashboard',
    label: '控制台',
    icon: 'home',
    route: '/dashboard'
  },
  {
    key: 'system',
    label: '系统管理',
    icon: 'setting',
    children: [
      { key: 'user', label: '用户管理', icon: 'user', route: '/system/user' },
      { key: 'role', label: '角色管理', icon: 'team', route: '/system/role' },
      { key: 'menu', label: '菜单管理', icon: 'menu', route: '/system/menu' }
    ]
  }
]

const activeKey = ref('dashboard')
const isCollapsed = ref(false)

function handleSelect(item: MenuItemData) {
  console.log('select:', item.key)
}
</script>
```

## 样式 Token

所有样式必须引用 vue-theme-skill 的 Token，禁止自定义变量：

| 类别 | 命名规范 | 示例 |
|------|----------|------|
| 颜色 | `--color-*` | `--color-primary`, `--color-surface`, `--color-border` |
| 间距 | `--space-{n}` | `--space-2`, `--space-3`, `--space-4` |
| 字号 | `--font-{size}` | `--font-sm`, `--font-base` |
| 圆角 | `--radius-{size}` | `--radius-sm`, `--radius-md` |
| 高度 | `--height-*-*` | `--height-button-md` |
| 阴影 | `--shadow-{size}` | `--shadow-sm` |

## 容器原则（铁律）

> **菜单组件必须嵌入 `<base-card>` 容器**

```vue
<!-- ✅ 正确 -->
<base-card title="系统菜单">
  <base-menu :data="menuData" mode="vertical" />
</base-card>

<!-- ❌ 错误：裸用 -->
<base-menu :data="menuData" mode="vertical" />
```

## 跨技能协同

| 技能 | 用途 |
|------|------|
| vue-list-item-skill | 底层渲染（4 槽位 + 6 风格） |
| vue-theme-skill | Token 样式（唯一来源） |
| vue-icon-skill | 菜单图标 |
| vue-badge-skill | 徽标 badge |
| vue-card-skill | 容器包裹（容器原则） |
| vue-layout-skill | 布局集成 |
| vue-router | 路由集成 |
| frontend-request-skill | 权限菜单数据获取 |

## 红线

- ❌ 禁止硬编码颜色/尺寸/间距（必须用 vue-theme-skill Token）
- ❌ 禁止使用 emoji 作为图标
- ❌ 禁止脱离 vue-list-item-skill 自行实现节点渲染
- ❌ 禁止第三方 UI 库
- ❌ 禁止裸用 `<base-menu>`（必须 base-card 包裹）

## 文件结构

```
vue-menu-skill/
├── SKILL.md
├── README.md
├── base-menu.md
├── components/
│   ├── BaseMenu.vue
│   ├── BaseMenuItem.vue
│   └── types.ts
├── demo-components/
│   └── base-menu/
│       └── html/
│           └── 00-showcase.html
└── references/
    └── menu-data-format.md
```
