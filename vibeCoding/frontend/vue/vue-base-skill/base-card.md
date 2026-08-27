# base-card 基础卡片

> **核心地位**：base-card 是 vue-base-skill 的基石，所有组件（base-table / base-button / base-tag / base-input / base-radio / base-select 等）和所有页面都必须由 base-card 包裹。
> **零第三方 UI 库**，所有样式来自 vue-theme-skill。

## 为什么一切皆卡片？

```
┌─────────────────────────────────────┐
│  页面 = 多个 base-card + 布局       │
│  ┌─────────┐  ┌─────────┐           │
│  │base-card│  │base-card│           │
│  └─────────┘  └─────────┘           │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  base-card = 容器属性 + 内容         │
│  ┌─────────────────────────────┐    │
│  │  背景/圆角/边框/阴影         │    │
│  │  ┌─────────────────────┐    │    │
│  │  │  base-table / 其他  │    │    │
│  │  └─────────────────────┘    │    │
│  └─────────────────────────────┘    │
└─────────────────────────────────────┘
```

## 为什么必须 base-card 包裹？

| 不使用 base-card | 使用 base-card |
|----------------|--------------|
| ❌ 组件样式碎片化 | ✅ 统一间距 `var(--space-4)` |
| ❌ 圆角 / 阴影各自实现 | ✅ 统一圆角 `var(--radius-lg)` |
| ❌ 主题切换难以同步 | ✅ 统一主题继承 |
| ❌ 页面层级不清晰 | ✅ 视觉边界清晰 |

## Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `title` | string | - | 卡片标题 |
| `desc` | string | - | 卡片描述（标题下方） |
| `radius` | `'sm' \| 'md' \| 'lg' \| 'xl'` | `'lg'` | 圆角 |
| `padding` | `'none' \| 'sm' \| 'md' \| 'lg'` | `'md'` | 内边距 |
| `shadow` | `'none' \| 'sm' \| 'md' \| 'lg'` | `'sm'` | 阴影 |
| `bordered` | boolean | `false` | 是否显示边框 |
| `clickable` | boolean | `false` | 是否可点击（显示点击态） |
| `loading` | boolean | `false` | 加载态（显示 spinner） |

## Slots

| Slot | 说明 |
|------|------|
| `default` | 卡片主体内容 |
| `header-right` | 卡片标题右侧（如按钮组） |
| `footer` | 卡片底部（如分页、操作栏） |

## Events

| Event | 参数 | 说明 |
|-------|------|------|
| `click` | `event: MouseEvent` | 卡片被点击（仅 clickable=true 时触发） |

## 代码

```vue
<template>
  <div
    :class="[
      'base-card',
      `base-card--radius-${radius}`,
      `base-card--padding-${padding}`,
      `base-card--shadow-${shadow}`,
      { 'base-card--bordered': bordered, 'base-card--clickable': clickable },
    ]"
    @click="handleClick"
  >
    <!-- Loading 遮罩 -->
    <div v-if="loading" class="base-card__loading">
      <div class="base-card__spinner"></div>
    </div>

    <!-- 头部 -->
    <header v-if="title || $slots.header" class="base-card__header">
      <div class="base-card__header-main">
        <h3 v-if="title" class="base-card__title">{{ title }}</h3>
        <p v-if="desc" class="base-card__desc">{{ desc }}</p>
      </div>
      <div v-if="$slots['header-right']" class="base-card__header-right">
        <slot name="header-right" />
      </div>
    </header>

    <!-- 主体 -->
    <div class="base-card__body">
      <slot />
    </div>

    <!-- 底部 -->
    <footer v-if="$slots.footer" class="base-card__footer">
      <slot name="footer" />
    </footer>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  title?: string
  desc?: string
  radius?: 'sm' | 'md' | 'lg' | 'xl'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  shadow?: 'none' | 'sm' | 'md' | 'lg'
  bordered?: boolean
  clickable?: boolean
  loading?: boolean
}>(), {
  radius: 'lg',
  padding: 'md',
  shadow: 'sm',
  bordered: false,
  clickable: false,
  loading: false,
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

function handleClick(event: MouseEvent) {
  // clickable 由模板 @click 触发，emit 在业务中处理
  emit('click', event)
}
</script>

<style scoped>
/* ============================================
 * 严格使用 vue-theme-skill Token
 * 零裸色值 / 零裸 px
 * ============================================ */
.base-card {
  position: relative;
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  transition: box-shadow 0.2s;
}

.base-card--radius-sm { border-radius: var(--radius-sm); }
.base-card--radius-md { border-radius: var(--radius-md); }
.base-card--radius-lg { border-radius: var(--radius-lg); }
.base-card--radius-xl { border-radius: var(--radius-xl); }

.base-card--shadow-none { box-shadow: none; }
.base-card--shadow-sm   { box-shadow: var(--shadow-sm); }
.base-card--shadow-md   { box-shadow: var(--shadow-md); }
.base-card--shadow-lg   { box-shadow: var(--shadow-lg); }

.base-card--bordered {
  border: 1px solid var(--color-border);
}

.base-card--clickable {
  cursor: pointer;
}
.base-card--clickable:hover {
  box-shadow: var(--shadow-md);
}

.base-card--padding-none .base-card__body { padding: 0; }
.base-card--padding-sm .base-card__body   { padding: var(--space-3); }
.base-card--padding-md .base-card__body   { padding: var(--space-4); }
.base-card--padding-lg .base-card__body   { padding: var(--space-6); }

.base-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-4) var(--space-4) var(--space-3);
  border-bottom: 1px solid var(--color-border);
}

.base-card__title {
  margin: 0;
  font-size: var(--font-lg);
  font-weight: var(--weight-semibold);
  color: var(--color-text);
  line-height: var(--leading-tight);
}

.base-card__desc {
  margin: var(--space-1) 0 0;
  font-size: var(--font-sm);
  color: var(--color-text-tertiary);
}

.base-card__footer {
  padding: var(--space-3) var(--space-4);
  border-top: 1px solid var(--color-border);
  background: var(--color-bg);
}

.base-card__loading {
  position: absolute;
  inset: 0;
  background: color-mix(in srgb, var(--color-surface) 80%, transparent);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  border-radius: inherit;
}

.base-card__spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: var(--radius-full);
  animation: base-card-spin 0.8s linear infinite;
}

@keyframes base-card-spin {
  to { transform: rotate(360deg); }
}
</style>
```

## 使用示例

### 1. 基础用法

```vue
<base-card title="用户管理" desc="管理系统所有用户">
  <p>卡片内容...</p>
</base-card>
```

### 2. 带 header-right（按钮组）

```vue
<base-card title="订单列表">
  <template #header-right>
    <base-button type="primary">+ 新建订单</base-button>
    <base-button>导出</base-button>
  </template>

  <base-table :data="orders" :columns="columns" />
</base-card>
```

### 3. 带 footer（分页）

```vue
<base-card title="订单列表">
  <base-table :data="orders" :columns="columns" />

  <template #footer>
    <base-pagination v-model:current="page" :total="100" />
  </template>
</base-card>
```

### 4. 嵌套卡片

```vue
<base-card title="父卡片">
  <base-card title="子卡片 1" padding="sm">
    <p>子内容</p>
  </base-card>

  <base-card title="子卡片 2" padding="sm" bordered>
    <p>子内容</p>
  </base-card>
</base-card>
```

### 5. 可点击卡片

```vue
<base-card
  title="点击跳转到详情"
  clickable
  @click="goDetail"
>
  <p>点击整个卡片可触发跳转</p>
</base-card>
```

### 6. 加载态

```vue
<base-card title="数据看板" :loading="loading">
  <base-table :data="data" :columns="columns" />
</base-card>
```

## 红线

- ❌ 禁止用 `<div>` 替代 `<base-card>` 作为内容容器
- ❌ 禁止在 base-card 内部自定义背景色（必须用 Token）
- ❌ 禁止跨端硬编码 rpx / rem
- ❌ 禁止修改 base-card 的圆角 / 阴影 Token

## 关联组件

所有其他 base-* 组件都必须在 `<base-card>` 内部：

- [base-button.md](base-button.md) — 按钮
- [base-tag.md](base-tag.md) — 标签
- [base-table.md](base-table.md) — 表格
- base-input / base-radio / base-select（规划中）

## HTML Demo

- [demo-components/base-card/html/](demo-components/base-card/html/) — 各形态 HTML 演示