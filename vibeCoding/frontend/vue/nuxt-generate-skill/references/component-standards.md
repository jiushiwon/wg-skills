# 组件规范

## 复用 vue-base-skill 组件

Nuxt 项目应优先复用 **vue-base-skill** 提供的基础组件，避免重复造轮子。

### 复用原则

1. **3 次复用原则** — 一个组件被 3 个以上页面使用时，提取到 `components/` 公共目录
2. **vue-base-skill 优先** — 基础 UI 组件（Button、Table、Form、Modal 等）从 vue-base-skill 复制
3. **不魔改** — 如需定制，在外层包装一层，不直接修改源组件

### 复用方式

```
1. 从 vue-base-skill 复制基础组件到项目 components/ 目录
2. 根据项目 UI 库（Element Plus / Nuxt UI）适配样式
3. 需要时在 Nuxt 的 components/ 自动导入机制下直接使用
```

### vue-base-skill 可复用组件清单

| 组件 | 文件 | Nuxt 适配要点 |
|------|------|-------------|
| 基础按钮 | `BaseButton.vue` | 无需适配，直接使用 |
| 数据表格 | `BaseTable.vue` | SSR 安全检查 |
| 表单组件 | `BaseForm.vue` | SSR 安全检查 |
| 弹窗组件 | `BaseModal.vue` | 使用 `ClientOnly` 包裹 |
| 分页组件 | `BasePagination.vue` | 无需适配 |
| 空状态 | `BaseEmpty.vue` | 无需适配 |
| 加载态 | `BaseLoading.vue` | 使用 `ClientOnly` 包裹 |

### SSR 适配注意

```vue
<!-- 涉及 DOM/BOM 的组件需用 ClientOnly 包裹 -->
<ClientOnly>
  <BaseModal v-model="visible" />
</ClientOnly>
```

## Nuxt 项目中组件规范

### 组件文件结构

```vue
<script setup lang="ts">
// 1. Props & Emits 定义
interface Props {
  title: string
  count?: number
}

interface Emits {
  (e: 'update', value: number): void
  (e: 'close'): void
}

// 2. Props 默认值
const props = withDefaults(defineProps<Props>(), {
  count: 0,
})

const emit = defineEmits<Emits>()

// 3. Composables（自动导入）
const route = useRoute()

// 4. 响应式状态
const loading = ref(false)

// 5. 计算属性
const displayTitle = computed(() => `${props.title} (${props.count})`)

// 6. 方法
function handleUpdate(value: number): void {
  emit('update', value)
}

// 7. 生命周期
onMounted(() => {
  // 初始化逻辑
})
</script>

<template>
  <!-- 模板内容 -->
</template>

<style scoped>
/* 组件样式 */
</style>
```

### Props 定义规范

```typescript
// ✅ 推荐：使用 TypeScript interface
interface Props {
  title: string
  count?: number
  items: User[]
}

const props = withDefaults(defineProps<Props>(), {
  count: 0,
  items: () => [],
})

// ❌ 避免：运行时声明（缺乏类型信息）
defineProps({
  title: { type: String, required: true },
  count: { type: Number, default: 0 },
})
```

### 组件通信方式

| 方式 | 适用场景 | 示例 |
|------|---------|------|
| Props down | 父 → 子 | `<UserCard :user="user" />` |
| Emits up | 子 → 父 | `emit('update', value)` |
| Pinia store | 跨组件 | `const store = useUserStore()` |
| provide/invert | 深层嵌套 | `provide('theme', theme)` |

### 样式规范

- 使用 `scoped` 避免样式污染
- BEM 命名 `.block__element--modifier`
- 布局用 CSS Grid / Flexbox，不写 float
- 颜色/间距使用 SCSS 变量或 CSS 自定义属性

```vue
<style scoped>
.user-card {
  padding: 16px;
  border-radius: 8px;
}

.user-card__header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-card__name {
  font-size: 16px;
  font-weight: 600;
}

.user-card__name--highlight {
  color: var(--color-primary);
}
</style>
```
