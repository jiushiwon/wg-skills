# BaseMenu —— 菜单组件

> 节点渲染 = `base-list-item`（4 槽位复用），业务只关心 `MenuData` 数据契约 + 5 个模式控制 props。

## 组件层级

```
base-card                ← 容器（L0）
└─ base-menu            ← 菜单组件（L1，本组件）
   └─ base-list-item    ← 节点渲染（L1，依赖）
      ↳ 嵌套渲染子菜单
```

## Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `data` | `MenuData[]` | `[]` | 菜单数据（必填） |
| `mode` | `'vertical' \| 'horizontal'` | `'vertical'` | 菜单模式 |
| `variant` | `string` | `'basic'` | 继承自 list-item：basic / finder / win / vscode / admin / notion / nav |
| `activeKey` | `string` | `''` | 当前激活项（v-model） |
| `trigger` | `'hover' \| 'click'` | `'hover'` | 子菜单触发方式 |
| `expandLevel` | `'current' \| 'all'` | `'current'` | 展开策略 |
| `collapsible` | `boolean` | `false` | 是否可折叠 |
| `collapsed` | `boolean` | `false` | 折叠状态（受控） |
| `accordion` | `boolean` | `true` | 手风琴模式 |
| `router` | `boolean` | `false` | 是否启用路由 |
| `width` | `string` | `'200px'` | 菜单宽度 |
| `collapsedWidth` | `string` | `'64px'` | 折叠宽度 |
| `indent` | `number` | `16` | 子菜单缩进宽度 |

## Events

| 事件名 | 参数 | 说明 |
|--------|------|------|
| `select` | `(item: MenuItemData)` | 菜单项点击 |
| `update:activeKey` | `(key: string)` | 激活项变化 |
| `update:collapsed` | `(collapsed: boolean)` | 折叠状态变化 |
| `toggle` | `(key: string, expanded: boolean)` | 展开/折叠 |

## Slots

| 插槽名 | 说明 |
|--------|------|
| `title` | 自定义菜单标题 |
| `icon-{key}` | 自定义菜单项图标 |
| `label-{key}` | 自定义菜单项文本 |
| `meta-{key}` | 自定义菜单项右侧内容 |

## 数据契约 MenuData

```typescript
interface MenuItemData {
  key: string                    // 唯一标识（必填）
  label: string                 // 显示文本（必填）
  icon?: string                 // 图标
  badge?: string | number       // 徽标
  disabled?: boolean            // 禁用
  route?: string                // 路由路径
  children?: MenuItemData[]     // 子菜单
  [key: string]: any           // 扩展字段
}

type MenuMode = 'vertical' | 'horizontal'
type MenuTrigger = 'hover' | 'click'
type MenuExpandLevel = 'current' | 'all'
```

## 完整组件实现

```vue
<template>
  <div
    class="base-menu"
    :class="[
      `base-menu--${mode}`,
      { 'is-collapsed': collapsed && collapsible }
    ]"
    :style="menuStyle"
  >
    <!-- 折叠按钮 -->
    <div
      v-if="collapsible"
      class="base-menu__collapse-btn"
      @click="toggleCollapse"
    >
      <span class="collapse-icon">{{ collapsed ? '→' : '←' }}</span>
    </div>

    <!-- 菜单列表 -->
    <div class="base-menu__list">
      <template v-for="item in data" :key="item.key">
        <!-- 有子菜单 -->
        <div
          v-if="item.children?.length"
          class="base-menu__submenu"
          :class="{ 'is-expanded': expandedKeys.includes(item.key) }"
        >
          <base-list-item
            :item="toListItem(item)"
            :variant="variant"
            :indent="indent"
            :class="{ 'is-active': activeKey === item.key }"
            @select="onSelect(item)"
            @toggle="toggleSubmenu(item.key)"
          >
            <template #expander>
              <span class="submenu-arrow">{{ expandedKeys.includes(item.key) ? '↓' : '→' }}</span>
            </template>
          </base-list-item>

          <!-- 子菜单 -->
          <div
            class="base-menu__submenu-children"
            :style="{ height: expandedKeys.includes(item.key) ? childHeight + 'px' : '0' }"
          >
            <base-list-item
              v-for="child in item.children"
              :key="child.key"
              :item="toListItem(child)"
              :variant="variant"
              :indent="indent * 2"
              :class="{ 'is-active': activeKey === child.key }"
              @select="onSelect(child)"
            />
          </div>
        </div>

        <!-- 无子菜单 -->
        <base-list-item
          v-else
          :item="toListItem(item)"
          :variant="variant"
          :indent="indent"
          :class="{ 'is-active': activeKey === item.key }"
          @select="onSelect(item)"
        />
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import BaseListItem from '@/components/BaseListItem.vue'
import type { ListItem } from '@/components/BaseListItem.vue'

interface Props {
  data?: MenuItemData[]
  mode?: 'vertical' | 'horizontal'
  variant?: string
  activeKey?: string
  trigger?: 'hover' | 'click'
  expandLevel?: 'current' | 'all'
  collapsible?: boolean
  collapsed?: boolean
  accordion?: boolean
  router?: boolean
  width?: string
  collapsedWidth?: string
  indent?: number
}

const props = withDefaults(defineProps<Props>(), {
  data: () => [],
  mode: 'vertical',
  variant: 'basic',
  activeKey: '',
  trigger: 'hover',
  expandLevel: 'current',
  collapsible: false,
  collapsed: false,
  accordion: true,
  router: false,
  width: '200px',
  collapsedWidth: '64px',
  indent: 16
})

const emit = defineEmits<{
  select: [item: MenuItemData]
  'update:activeKey': [key: string]
  'update:collapsed': [collapsed: boolean]
  toggle: [key: string, expanded: boolean]
}>()

const expandedKeys = ref<string[]>([])

// 初始展开处理
watch(() => props.data, (data) => {
  if (props.expandLevel === 'all') {
    expandedKeys.value = data.filter(item => item.children?.length).map(item => item.key)
  }
}, { immediate: true })

const menuStyle = computed(() => ({
  width: props.collapsed && props.collapsible ? props.collapsedWidth : props.width
}))

// 转换 MenuItemData 为 ListItem（适配 base-list-item）
function toListItem(item: MenuItemData): ListItem {
  return {
    id: item.key,
    label: item.label,
    icon: item.icon,
    badge: item.badge,
    disabled: item.disabled,
    open: expandedKeys.value.includes(item.key),
    children: item.children
  }
}

// 菜单项点击
function onSelect(item: MenuItemData) {
  if (item.disabled) return
  emit('update:activeKey', item.key)
  emit('select', item)

  if (props.router && item.route) {
    // router.push(item.route)
  }
}

// 子菜单展开/折叠
function toggleSubmenu(key: string) {
  const index = expandedKeys.value.indexOf(key)
  const isExpanded = index > -1

  if (props.accordion) {
    // 手风琴模式：只展开一个
    expandedKeys.value = isExpanded ? [] : [key]
  } else {
    // 多开模式
    if (isExpanded) {
      expandedKeys.value.splice(index, 1)
    } else {
      expandedKeys.value.push(key)
    }
  }

  emit('toggle', key, !isExpanded)
}

// 折叠/展开
function toggleCollapse() {
  const newVal = !props.collapsed
  emit('update:collapsed', newVal)
  if (newVal) {
    expandedKeys.value = []
  }
}

// 子菜单高度（用于动画）
const childHeight = computed(() => {
  // 实际计算基于子项数量和行高
  return 44 // 预估每项 44px
})
</script>

<style scoped>
.base-menu {
  position: relative;
  background: var(--color-surface);
  border-right: 1px solid var(--color-border);
}

.base-menu--horizontal {
  border-right: none;
  border-bottom: 1px solid var(--color-border);
  display: flex;
}

.base-menu__list {
  overflow: hidden;
}

.base-menu__submenu {
  position: relative;
}

.base-menu__submenu-children {
  overflow: hidden;
  transition: height 0.3s ease;
}

.base-menu__collapse-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-2);
  cursor: pointer;
  border-top: 1px solid var(--color-border);
}

.base-menu__collapse-btn:hover {
  background: var(--color-bg);
}

.is-active {
  background: var(--color-primary-50);
  color: var(--color-primary);
}

.submenu-arrow {
  font-size: var(--font-xs);
  color: var(--color-text-secondary);
}
</style>
```

## 形态矩阵

| 形态 | mode | trigger | expandLevel | 场景 |
|------|------|---------|-------------|------|
| 纵向菜单 | vertical | hover | current | 侧边栏（默认） |
| 纵向手风琴 | vertical | click | current | 只展开一个子菜单 |
| 纵向全展开 | vertical | click | all | 多级导航 |
| 横向菜单 | horizontal | hover | current | 顶部导航 |
| 横向点击 | horizontal | click | current | 顶部导航 |
| 折叠菜单 | vertical | hover | current | 侧边栏折叠模式 |

## 零样式标签铁律

> **所有 `.md` 文档中的实现代码必须仅使用 `<div>` / `<span>` + CSS3**

```vue
<!-- ❌ 严禁 -->
<nav class="menu">
  <ul>
    <li><a href="#">菜单项</a></li>
  </ul>
</nav>
```

```vue
<!-- ✅ 正确 -->
<div class="base-menu">
  <div class="base-menu__list">
    <base-list-item :item="item" />
  </div>
</div>
```

## 与其他组件的关系

| 组件 | 关系 |
|------|------|
| base-card | 容器（必须包裹） |
| base-list-item | 节点渲染（依赖） |
| base-icon | 图标渲染 |
| base-badge | 徽标渲染 |
