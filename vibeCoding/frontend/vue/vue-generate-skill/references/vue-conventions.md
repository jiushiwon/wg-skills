# Vue 3 + TypeScript 编码约定

> 本文是 AGENTS.md 的扩展，聚焦 Vue 3 Composition API + TypeScript 的具体写法。

---

## 1. `<script setup>` 写法

### ✅ 标准模板

```vue
<script setup lang="ts">
// 1. 类型导入
import type { User } from '@/types/user';
import type { PropType } from 'vue';

// 2. 第三方库
import { ref, computed, onMounted } from 'vue';
import { ElMessage } from 'element-plus';

// 3. 项目内部
import { useUserStore } from '@/stores/modules/user';
import { userApi } from '@/api/modules/user';
import { formatDate } from '@/utils/format';

// 4. 类型定义
interface Props {
  userId: number;
  showAvatar?: boolean;
}

interface Emits {
  (e: 'update', user: User): void;
  (e: 'delete', id: number): void;
}

// 5. Props / Emits
const props = withDefaults(defineProps<Props>(), {
  showAvatar: true,
});
const emit = defineEmits<Emits>();

// 6. 响应式状态
const loading = ref(false);
const user = ref<User | null>(null);

// 7. 计算属性
const displayName = computed(() => user.value?.nickname || '匿名');

// 8. 方法
async function loadUser() {
  loading.value = true;
  try {
    user.value = await userApi.get(props.userId);
  } finally {
    loading.value = false;
  }
}

function handleDelete() {
  emit('delete', props.userId);
}

// 9. 生命周期
onMounted(loadUser);

// 10. 暴露给父组件（可选）
defineExpose({ loadUser });
</script>

<template>
  <div class="user-card">
    <img v-if="showAvatar" :src="user?.avatar" :alt="displayName" />
    <h3>{{ displayName }}</h3>
    <button @click="handleDelete">删除</button>
  </div>
</template>

<style scoped>
.user-card {
  padding: var(--space-4);
  border-radius: var(--radius-md);
  background: var(--color-bg);
}
</style>
```

---

## 2. Props 写法（3 种对比）

### ✅ 推荐：泛型 defineProps

```typescript
const { title, count = 0 } = defineProps<{
  title: string;
  count?: number;
  items?: string[];
}>();
```

### ⚠️ 可接受：withDefaults

```typescript
const props = withDefaults(defineProps<{
  title: string;
  count?: number;
}>(), {
  count: 0,
});
```

### ❌ 避免：运行时声明

```typescript
const props = defineProps({
  title: String,
  count: { type: Number, default: 0 },
});
```

（运行时声明丢失类型信息，必须尽量避免）

---

## 3. Emits 写法

### ✅ 推荐：对象式类型签名（Vue 3.3+）

```typescript
const emit = defineEmits<{
  change: [value: string];
  submit: [data: FormData];
}>();

emit('change', 'hello');
emit('submit', formData);
```

### ⚠️ 可接受：函数式类型签名（兼容旧版）

```typescript
const emit = defineEmits<{
  (e: 'change', value: string): void;
  (e: 'submit', data: FormData): void;
}>();
```

---

## 4. Refs 使用约定

| 场景 | 写法 |
|------|------|
| 单个值 | `const count = ref(0)` |
| 对象 | `const user = ref<User \| null>(null)` |
| 计算属性 | `const display = computed(() => ...)` |
| DOM 引用 | `const elRef = ref<HTMLElement>()` |
| 模板引用 | `<div ref="elRef">` |

**避免**：
```typescript
// ❌ 不要用 reactive 包装普通对象后再修改
const state = reactive({ count: 0 });
state.count = 1; // 不能自动追踪嵌套属性的类型
```

**推荐**：
```typescript
// ✅ 用 ref + 解包
const state = ref({ count: 0 });
state.value.count = 1; // 类型完全推导
```

---

## 5. 组合式函数（Composables）

### 标准结构

```typescript
// src/composables/useTable.ts
import { ref, computed } from 'vue';
import type { Ref } from 'vue';

interface UseTableOptions<T> {
  fetchApi: (params: any) => Promise<{ items: T[]; total: number }>;
  defaultPageSize?: number;
}

export function useTable<T>(options: UseTableOptions<T>) {
  const items = ref<T[]>([]);
  const total = ref(0);
  const loading = ref(false);
  const page = ref(1);
  const pageSize = ref(options.defaultPageSize ?? 10);

  async function fetch() {
    loading.value = true;
    try {
      const res = await options.fetchApi({ page: page.value, pageSize: pageSize.value });
      items.value = res.items;
      total.value = res.total;
    } finally {
      loading.value = false;
    }
  }

  function handlePageChange(p: number) {
    page.value = p;
    fetch();
  }

  return {
    items: items as Ref<T[]>,
    total,
    loading,
    page,
    pageSize,
    fetch,
    handlePageChange,
  };
}
```

### 使用

```vue
<script setup lang="ts">
import { useTable } from '@/composables/useTable';
import { userApi } from '@/api/modules/user';
import type { User } from '@/types/user';

const { items, total, loading, page, pageSize, fetch, handlePageChange } = useTable<User>({
  fetchApi: userApi.list,
});
</script>
```

---

## 6. 异步组件

### defineAsyncComponent

```typescript
import { defineAsyncComponent } from 'vue';

const HeavyChart = defineAsyncComponent({
  loader: () => import('@/components/HeavyChart.vue'),
  loadingComponent: LoadingSpinner,
  delay: 200,
});
```

### 何时使用

- 组件体积 > 50KB（gzip 后）
- 组件不在首屏（如设置页、详情页）
- 组件用得很少

---

## 7. 错误处理

### async/await + try/catch

```typescript
async function loadUser(id: number) {
  try {
    const user = await userApi.get(id);
    return user;
  } catch (error) {
    if (error instanceof Error) {
      ElMessage.error(`加载用户失败：${error.message}`);
    } else {
      ElMessage.error('加载用户失败');
    }
    throw error; // 让上层知道
  }
}
```

### Promise 链式

```typescript
userApi.get(id)
  .then((user) => {
    // 处理成功
  })
  .catch((error) => {
    // 处理错误
  });
```

（async/await 更清晰，优先使用）

---

## 8. 模板最佳实践

### ✅ 简短表达式

```vue
<template>
  <div :class="{ active: isActive }">{{ userName }}</div>
</template>
```

### ✅ 复杂逻辑用计算属性

```vue
<template>
  <div>{{ formattedDate }}</div>
</template>

<script setup>
const formattedDate = computed(() => formatDate(props.date));
</script>
```

### ❌ 避免模板中写复杂逻辑

```vue
<!-- ❌ 反模式 -->
<template>
  <div>{{ new Date(date).toLocaleDateString() + ' ' + new Date(date).toLocaleTimeString() }}</div>
</template>
```

---

## 9. 性能提示

- `v-for` 必须加 `:key`
- 大列表用 `virtual-list`（vue-virtual-scroller）
- 图片懒加载用 `<img loading="lazy">` 或 `vue-lazyload`
- 频繁触发的滚动/输入事件用 `lodash.throttle` / `lodash.debounce`

---

## 10. TypeScript 集成

### tsconfig.json 关键配置

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "paths": {
      "@/*": ["./src/*"]
    },
    "types": ["vite/client"]
  }
}
```

### 自动导入

```typescript
// vite.config.ts
import AutoImport from 'unplugin-auto-import/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';

export default defineConfig({
  plugins: [
    AutoImport({
      imports: ['vue', 'vue-router', 'pinia'],
      resolvers: [ElementPlusResolver()],
      dts: 'auto-imports.d.ts',
    }),
  ],
});
```

---

## 11. 注释规范

```typescript
/**
 * 加载用户详情
 *
 * @param id - 用户 ID
 * @returns 用户对象，未找到返回 null
 *
 * @example
 * ```ts
 * const user = await loadUser(123);
 * ```
 */
async function loadUser(id: number): Promise<User | null> {
  // 实现细节注释（解释 why，不解释 what）
  if (id <= 0) return null;

  return userApi.get(id);
}
```

---

## 12. 红线（不可违反）

1. ❌ 使用 Options API
2. ❌ 使用 `any` 类型
3. ❌ 使用 `console.log` 提交代码
4. ❌ 不写组件类型（`<script setup>` 不加 `lang="ts"`）
5. ❌ 写裸色值 / 裸间距 / 裸圆角
6. ❌ 手写 Element Plus 已有的组件
7. ❌ 把所有逻辑塞进 `views/`（必须拆 composables / stores）
8. ❌ 用 `v-html` 渲染未 sanitization 的用户输入
