# 共享组件规范

> **核心原则：3 次复用原则 —— 复用 ≥3 次才抽到 src/components/。**
> **反对过早抽象，反对硬凑复用。**

---

## 1. 抽取时机决策树

```
我需要这个 UI
  │
  ├─ Element Plus / Naive UI 已有？
  │    ├─ 是 → 直接用，不抽
  │    └─ 否 → 继续
  │
  ├─ 已经在 3+ 个页面用过？
  │    ├─ 是 → 抽到 src/components/<Name>.vue
  │    └─ 否 → 继续
  │
  └─ 写在当前页面 inline，先不抽
```

**典型案例**：

| UI 需求 | 决策 |
|---------|------|
| 主按钮 | Element Plus `el-button` 已有，直接用 |
| 确认弹窗 | Element Plus `el-message-box` 已有，直接用 |
| 空状态（图 + 文）| Element Plus `el-empty` 不够灵活，**3+ 页用 → 抽 `AppEmpty.vue`** |
| 加载动画 | Element Plus `el-loading`，直接用；如果是自定义 spinner → **3+ 页用 → 抽 `AppLoading.vue`** |
| 表格列定义 | Element Plus `el-table-column`，直接用 |
| 表格筛选工具栏 | 各页差异大，**不抽**，写在页面内 |
| 分页 | Element Plus `el-pagination`，直接用 |
| 面包屑 | Element Plus `el-breadcrumb`，直接用 |

---

## 2. 强制共享组件清单

> 这些组件**在 3+ 页**必然用到，**默认抽取**。

### `AppLayout.vue` —— 全局布局

```vue
<script setup lang="ts">
import { useRoute } from 'vue-router';
import { computed } from 'vue';

const route = useRoute();
const showLayout = computed(() => !route.meta.public);
</script>

<template>
  <div v-if="showLayout" class="app-layout">
    <AppSidebar />
    <AppHeader />
    <main class="app-layout__main">
      <router-view />
    </main>
  </div>
  <router-view v-else />
</template>

<style scoped>
.app-layout {
  display: grid;
  grid-template-columns: 240px 1fr;
  grid-template-rows: 60px 1fr;
  height: 100vh;
}

.app-layout__main {
  padding: var(--space-6);
  overflow-y: auto;
}
</style>
```

### `AppEmpty.vue` —— 空状态

```vue
<script setup lang="ts">
interface Props {
  description?: string;
  image?: string;
}

withDefaults(defineProps<Props>(), {
  description: '暂无数据',
  image: '/empty.png',
});
</script>

<template>
  <div class="app-empty">
    <img :src="image" :alt="description" />
    <p>{{ description }}</p>
  </div>
</template>

<style scoped>
.app-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--space-8);
  color: var(--color-text-secondary);
}

.app-empty img {
  width: 120px;
  opacity: 0.6;
}
</style>
```

### `AppPageHeader.vue` —— 页面标题栏

```vue
<script setup lang="ts">
interface Props {
  title: string;
  description?: string;
}

defineProps<Props>();
</script>

<template>
  <header class="page-header">
    <div>
      <h2>{{ title }}</h2>
      <p v-if="description">{{ description }}</p>
    </div>
    <div class="page-header__actions">
      <slot name="actions" />
    </div>
  </header>
</template>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-4);
}

.page-header h2 {
  margin: 0;
  font-size: var(--font-xl);
}

.page-header p {
  margin: var(--space-1) 0 0;
  color: var(--color-text-secondary);
  font-size: var(--font-sm);
}
</style>
```

---

## 3. 命名约定

### 通用业务组件

`App` + 功能 → `AppButton` / `AppTab` / `AppPopup` / `AppCard` / `AppEmpty` / `AppInput` / `AppNavbar`

### 特定业务组件

`业务域` + 名词 → `UserCard` / `OrderTable` / `ProductForm`

### 禁止

- ❌ `MyButton` / `CommonButton` / `BaseButton`（前缀无意义）
- ❌ `Button.vue`（名字不具体）
- ❌ 数字后缀：`Button1.vue` / `Button2.vue`

---

## 4. Props 设计原则

### 单一职责

```vue
<!-- ✅ 一个组件一个职责 -->
<AppButton @click="submit">提交</AppButton>

<!-- ❌ 不要做"万能按钮" -->
<SuperButton type="primary" icon="check" size="lg" loading="true" onClick="submit" />
```

### Props 数量

- **≤ 7 个**：常规
- **8-12 个**：考虑拆组件或用 `useXxx` composable
- **> 12 个**：必须重构

### 默认值

```typescript
withDefaults(defineProps<{
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
}>(), {
  size: 'medium',
  disabled: false,
  loading: false,
});
```

---

## 5. Emits 设计

### 命名

- 动作：`update` / `delete` / `submit` / `cancel` / `change`
- 不带 `on` 前缀（Emits 是事件，事件名不带 on）

### 数量

- **≤ 5 个**：常规
- **6-8 个**：考虑拆组件
- **> 8 个**：必须重构

### 类型安全

```typescript
const emit = defineEmits<{
  change: [value: string];
  submit: [data: FormData];
  cancel: [];
}>();
```

---

## 6. Slots 设计

### 默认插槽 + 具名插槽

```vue
<template>
  <div class="card">
    <header v-if="$slots.header" class="card__header">
      <slot name="header" />
    </header>
    <div class="card__body">
      <slot />
    </div>
    <footer v-if="$slots.footer" class="card__footer">
      <slot name="footer" />
    </footer>
  </div>
</template>
```

### 插槽数量

- **≤ 3 个**：常规
- **4-5 个**：合理（header / body / footer / actions）
- **> 5 个**：考虑用配置对象或拆组件

---

## 7. 禁止的反模式

### ❌ 反模式 1：组件过深嵌套

```
AppPage
  └─ AppContainer
       └─ AppWrapper
            └─ AppInnerBox
                 └─ AppCard ← 实际组件
```

### ❌ 反模式 2：组件参数爆炸

```typescript
defineProps<{
  type, size, color, variant, disabled, loading, icon, iconPosition,
  block, round, plain, text, bg, link, underline
}>()
```

### ❌ 反模式 3：业务组件耦合业务逻辑

```typescript
// ❌ AppCard 直接调 API
async function loadData() {
  data.value = await userApi.list();
}

// ✅ AppCard 只渲染数据，数据由父组件传入
defineProps<{ items: User[] }>();
```

### ❌ 反模式 4：手写 Element Plus 已有的组件

| 需求 | 错误 | 正确 |
|------|------|------|
| 按钮 | 手写 `<button class="my-button">` | `<el-button>` |
| 弹窗 | 手写 `<div class="modal">` + JS 控制 | `<el-dialog>` |
| 下拉菜单 | 手写 `<ul class="dropdown">` | `<el-dropdown>` |
| 表单验证 | 手写 input + 校验 | `<el-form>` + rules |

---

## 8. 何时升级到全局组件库

如果某些组件在 5+ 项目都用到，可以抽到 `packages/ui/` 形成内部组件库。

**短期项目**（一个项目）：用 Element Plus，不自研。
**长期项目**（多项目共用）：把 AppLayout / AppEmpty 等抽到独立 npm 包。

---

## 9. 测试建议

| 组件类型 | 测试范围 |
|----------|---------|
| 通用业务组件（AppLayout / AppEmpty） | 必须测 |
| 特定业务组件（UserCard） | 推荐测 |
| 页面级组件 | 不强求测，集成测试覆盖 |

测试重点：
- Props 边界（最大值、最小值、空值）
- Emits 触发（点击/输入/选择）
- Slots 渲染（默认插槽、具名插槽）
- 状态变化（loading / disabled / error）
