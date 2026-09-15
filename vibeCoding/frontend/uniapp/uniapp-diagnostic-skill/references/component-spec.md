# 组件规范

> 本文档定义 uniapp 项目组件的开发规范

## 目录结构

```
components/
├── AppButton/          # 按钮组件
│   ├── index.vue
│   └── index.ts        # 组件导出
├── AppCard/            # 卡片组件
├── AppEmpty/           # 空状态组件
├── AppLoading/         # 加载组件
├── AppNavbar/          # 导航栏
├── AppInput/           # 输入框
└── index.ts           # 统一导出所有组件
```

## 组件开发规范

### 组件文件结构

```vue
<!-- components/AppButton/index.vue -->
<script setup lang="ts">
// 1. Props 定义
interface Props {
  /** 按钮类型 */
  type?: 'primary' | 'default' | 'text'
  /** 按钮尺寸 */
  size?: 'small' | 'medium' | 'large'
  /** 是否禁用 */
  disabled?: boolean
  /** 是否加载中 */
  loading?: boolean
  /** 块级按钮 */
  block?: boolean
}

// 默认值
const props = withDefaults(defineProps<Props>(), {
  type: 'default',
  size: 'medium',
  disabled: false,
  loading: false,
  block: false,
})

// 2. Emits 定义
const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

// 3. 事件处理
function handleClick(e: MouseEvent) {
  if (props.disabled || props.loading) return
  emit('click', e)
}
</script>

<template>
  <button
    class="app-button"
    :class="[
      `app-button--${type}`,
      `app-button--${size}`,
      {
        'is-disabled': disabled,
        'is-loading': loading,
        'is-block': block,
      },
    ]"
    :disabled="disabled || loading"
    @click="handleClick"
  >
    <text v-if="loading" class="app-button__loading">加载中...</text>
    <slot />
  </button>
</template>

<style lang="scss" scoped>
.app-button {
  /* 基础样式 */
}
</style>
```

### 组件导出

```typescript
// components/AppButton/index.ts
import AppButton from './index.vue'

export { AppButton }
```

### 统一导出

```typescript
// components/index.ts
export * from './AppButton'
export * from './AppCard'
export * from './AppEmpty'
export * from './AppLoading'
export * from './AppNavbar'
export * from './AppInput'
```

## 必需公共组件

建议项目一开始就建立以下公共组件：

| 组件 | 说明 |
|------|------|
| AppButton | 按钮（primary/default/text） |
| AppCard | 卡片容器 |
| AppEmpty | 空状态 |
| AppLoading | 加载 |
| AppNavbar | 导航栏（自定义时使用） |
| AppTabBar | 标签栏（自定义时使用） |
| AppInput | 输入框 |

## 组件使用示例

### 按钮

```vue
<AppButton type="primary" @click="handleSubmit">
  提交
</AppButton>

<AppButton type="primary" :loading="submitting">
  提交中...
</AppButton>
```

### 空状态

```vue
<AppEmpty
  description="暂无数据"
  :image="EmptyImage"
  v-if="list.length === 0"
/>
```

### 卡片

```vue
<AppCard>
  <view>卡片内容</view>
</AppCard>
```

## 组件命名规范

| 类型 | 规范 | 示例 |
|------|------|------|
| 目录 | PascalCase | `AppButton/` |
| Vue 文件 | index.vue 或组件名.vue | `AppButton/index.vue` |
| 组件名 | PascalCase，前缀 App | `AppButton` |
| Props | camelCase | `buttonText` |
| Events | camelCase | `onClick` |
| Slots | camelCase | `default`, `prefix` |

## Props 规范

### 必须包含

```typescript
interface Props {
  /** 类名 */
  class?: string
  /** 自定义样式 */
  style?: string | Record<string, string>
}
```

### 常用可选

```typescript
interface Props {
  /** 禁用状态 */
  disabled?: boolean
  /** 加载状态 */
  loading?: boolean
  /** 只读状态 */
  readonly?: boolean
}
```

## 事件规范

使用 `defineEmits` 定义事件：

```typescript
const emit = defineEmits<{
  /** 点击事件 */
  click: [event: MouseEvent]
  /** 输入事件 */
  input: [value: string]
  /** 变化事件 */
  change: [value: string]
}>()
```

## 样式规范

### 必选

- 使用 SCSS
- 使用主题变量
- scoped 作用域
- BEM 命名或 CSS Modules

### 禁止

- 禁止使用行内样式（除动态样式）
- 禁止使用 px（使用 rpx）
- 禁止硬编码颜色（使用变量）

## 禁止事项

- 禁止页面直接写业务组件代码（抽离到 components/）
- 禁止相似组件重复实现（抽离公共组件）
- 禁止组件内直接调用 API（通过 props/emit）
- 禁止组件名使用不符合规范的命名
