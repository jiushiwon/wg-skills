# BaseListItem —— 列表项基座

> **一切"列表类"组件的共同底层**。menu / tree / dropdown / select / tabs / breadcrumb 全部基于此。

## 组件层级

```
base-card             ← 容器（L0）
└─ base-list-item     ← 列表项基座（L1，本组件）
   ├─ base-tree       ← 树形菜单（L2，消费 list-item）
   ├─ base-contextmenu← 右键菜单（L2，消费 list-item）
   └─ base-dropdown   ← 万能浮层（L2，消费 list-item）
```

## Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `item` | `ListItem` | — | 数据契约（必填） |
| `variant` | `'basic' \| 'finder' \| 'win' \| 'vscode' \| 'admin' \| 'notion' \| 'nav'` | `'basic'` | 视觉风格 |
| `open` | `boolean` | `false` | 子项是否展开（仅 children 存在时） |
| `active` | `boolean` | `false` | 是否选中（一般由上层控制） |
| `indent` | `number` | `0` | 缩进层级（树用） |

## Events

| 事件名 | 参数 | 说明 |
|--------|------|------|
| `select` | `(item, event)` | 点击项 |
| `contextmenu` | `(item, event)` | 右键项 |
| `toggle` | `(item)` | 点击 expander 折叠/展开 |

## Slots

| 插槽名 | 说明 |
|--------|------|
| `default` | 完全自定义覆盖（不推荐，破坏抽象） |
| `expander` | 替换折叠箭头 |
| `icon` | 替换图标 |
| `label` | 替换主文本 |
| `meta` | 替换右侧附加 |

> 90% 场景只用 `:item` + `variant`，slot 是高级定制用。

## 数据契约 ListItem

```typescript
interface ListItem {
  id: string                  // 唯一标识（必填）
  label: string               // 显示文本（必填）
  icon?: string               // 图标 key
  meta?: string               // 次要文本
  badge?: string | number     // 徽章
  shortcut?: string           // 快捷键
  disabled?: boolean          // 禁用
  danger?: boolean            // 危险项
  open?: boolean              // 默认展开
  children?: ListItem[]       // 子项
  divider?: boolean           // 是否为分隔线
}
```

## 完整组件实现

```vue
<template>
  <div
    class="list-item"
    :class="[
      `list-item--${variant}`,
      { 'is-active': active, 'is-disabled': item.disabled, 'is-danger': item.danger, 'is-open': open }
    ]"
    :style="{ paddingLeft: indent * 16 + 'px' }"
    @click="handleClick"
    @contextmenu.prevent="handleContextMenu"
  >
    <!-- expander 槽位 -->
    <div class="list-item__expander" @click.stop="handleToggle">
      <span v-if="hasChildren" class="list-item__expander-icon">{{ open ? '▾' : '▸' }}</span>
    </div>

    <!-- icon 槽位 -->
    <slot name="icon">
      <div v-if="item.icon" class="list-item__icon">{{ item.icon }}</div>
    </slot>

    <!-- label 槽位 -->
    <slot name="label">
      <div class="list-item__label">{{ item.label }}</div>
    </slot>

    <!-- shortcut 槽位（菜单专属）-->
    <div v-if="item.shortcut" class="list-item__shortcut">{{ item.shortcut }}</div>

    <!-- meta 槽位 -->
    <slot name="meta">
      <div v-if="item.meta" class="list-item__meta">{{ item.meta }}</div>
      <div v-if="item.badge" class="list-item__badge">{{ item.badge }}</div>
    </slot>
  </div>

  <!-- 递归 children -->
  <template v-if="hasChildren && open">
    <base-list-item
      v-for="child in item.children"
      :key="child.id"
      :item="child"
      :variant="variant"
      :indent="indent + 1"
      @select="emit('select', $event[0], $event[1])"
      @contextmenu="emit('contextmenu', $event[0], $event[1])"
      @toggle="emit('toggle', $event)"
    />
  </template>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ListItem } from './types'

const props = withDefaults(defineProps<{
  item: ListItem
  variant?: 'basic' | 'finder' | 'win' | 'vscode' | 'admin' | 'notion' | 'nav'
  open?: boolean
  active?: boolean
  indent?: number
}>(), {
  variant: 'basic',
  open: false,
  active: false,
  indent: 0
})

const emit = defineEmits<{
  (e: 'select', item: ListItem, event: MouseEvent): void
  (e: 'contextmenu', item: ListItem, event: MouseEvent): void
  (e: 'toggle', item: ListItem): void
}>()

const hasChildren = computed(() => props.item.children?.length > 0)

function handleClick(event: MouseEvent) {
  if (props.item.disabled) return
  if (props.item.divider) return
  emit('select', props.item, event)
}

function handleContextMenu(event: MouseEvent) {
  if (props.item.disabled) return
  if (props.item.divider) return
  emit('contextmenu', props.item, event)
}

function handleToggle() {
  if (!hasChildren.value) return
  emit('toggle', props.item)
}
</script>
```

## 7 种风格的 CSS 变体表

```scss
.list-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  user-select: none;
  transition: background 0.15s, color 0.15s;

  &.is-disabled { opacity: 0.5; cursor: not-allowed; }
  &.is-danger { color: #ef4444; }

  &__expander {
    width: 18px; height: 18px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0; font-size: 11px; color: #999;
    transition: transform 0.15s;
    &.is-open { transform: rotate(90deg); }
  }

  &__icon { flex-shrink: 0; }
  &__label { flex: 1; }
  &__shortcut { font-size: 11px; color: #999; }
  &__meta { font-size: 11px; color: #999; }
  &__badge {
    font-size: 11px; color: #fff; background: #6366f1;
    padding: 1px 6px; border-radius: 999px;
  }
}

/* 风格 01: basic（中性浅灰）*/
.list-item--basic {
  &:hover { background: #f3f4f6; }
  &.is-active { background: #eef2ff; color: #4f46e5; }
}

/* 风格 02: finder（macOS 蓝色 + 紧凑行高）*/
.list-item--finder {
  height: 22px; padding: 0 6px; border-radius: 5px;
  &:hover { background: rgba(0, 0, 0, 0.06); }
  &.is-active { background: #007aff; color: #fff; }
  &.is-active .list-item__meta, &.is-active .list-item__shortcut { color: #fff; }
}

/* 风格 03: win（浅蓝 hover + 蓝边选中）*/
.list-item--win {
  border-radius: 2px;
  &:hover { background: #e5f1fb; }
  &.is-active {
    background: #cce8ff; border: 1px solid #99d1ff;
    padding: 0 6px;
  }
}

/* 风格 04: vscode（深色主题）*/
.list-item--vscode {
  height: 22px; color: #cccccc;
  &:hover { background: #2a2d2e; }
  &.is-active { background: #094771; color: #fff; }
  &__meta, &__shortcut { color: #858585; font-family: monospace; }
}

/* 风格 05: admin（Ant Design 风）*/
.list-item--admin {
  height: 30px; padding: 0 10px;
  &:hover { background: #f5f5f5; }
  &.is-active { background: #e6f7ff; color: #1890ff; }
}

/* 风格 06: notion（极简）*/
.list-item--notion {
  height: 26px; color: #37352f;
  &:hover { background: rgba(55, 53, 47, 0.08); }
  &.is-active { background: rgba(55, 53, 47, 0.08); font-weight: 500; }
}

/* 风格 07: nav（强引导渐变）*/
.list-item--nav {
  height: 36px; padding: 0 12px; border-radius: 6px;
  &:hover { background: rgba(99, 102, 241, 0.08); }
  &.is-active {
    background: linear-gradient(90deg, #6366f1, #4f46e5);
    color: #fff;
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
  }
}
```

## 使用场景对照

| 场景 | 推荐风格 | 说明 |
|------|---------|------|
| 后台管理系统 | `basic` | 默认中性风格 |
| 个人文件应用 | `finder` | macOS 风格，紧凑行高 |
| Windows 桌面应用 | `win` | 浅蓝 hover + 蓝边选中 |
| IDE / 代码编辑器 | `vscode` | 深色主题 + 等宽 meta |
| Ant Design 项目 | `admin` | 蓝色主题，与 antd 一致 |
| 文档 / 笔记应用 | `notion` | 极简纯文本风格 |
| 营销 / 仪表盘导航 | `nav` | 渐变强引导 |

## 反例 vs 正例

```vue
<!-- ❌ 严禁：在业务组件中重新实现 expander / icon / label 渲染 -->
<template>
  <div class="my-tree-item" @click="select(node)">
    <span class="my-arrow">{{ node.open ? '▼' : '▶' }}</span>
    <span class="my-icon">📁</span>
    <span class="my-label">{{ node.label }}</span>
    <span class="my-count">{{ node.count }}</span>
  </div>
</template>
```

```vue
<!-- ✅ 正确：业务组件只负责数据 + 事件，渲染交给 base-list-item -->
<template>
  <div class="base-tree">
    <base-list-item
      v-for="node in data"
      :key="node.id"
      :item="node"
      variant="basic"
      :open="node.open"
      @toggle="toggleNode(node)"
      @select="onSelect"
      @contextmenu="onContextMenu"
    />
  </div>
</template>
```

## 容器原则

```vue
<base-card title="组织架构">
  <base-list-item
    v-for="node in orgData"
    :key="node.id"
    :item="node"
    variant="basic"
  />
</base-card>
```

## 文件结构

```
vue-list-item-skill/
├── SKILL.md                          # 入口（trigger / 4 槽位 / 6 风格）
├── README.md
├── base-list-item.md                 # 组件规范（本文件）
└── demo-components/
    ├── shared/                       # 共享 CSS（tokens / demo / icons）
    └── base-list-item/
        ├── html/
        │   └── 00-showcase.html      # 单一 showcase
        └── screenshots/
            └── 00-showcase.png
```