# Vue3 最佳实践规则

本文档定义 Vue3 + TypeScript 项目的代码审查规则。

---

## 1. Composition API 正确使用

### 检查项

| 规则 ID | 描述 | 严重程度 |
|---------|------|----------|
| V3-001 | ref/reactive 混用导致响应式丢失 | Error |
| V3-002 | shallowRef 用作深层对象 | Warning |
| V3-003 | computed 未指定返回值类型 | Info |

### 正确示例

```typescript
// 使用 ref 处理基本类型
const count = ref(0);

// 使用 reactive 处理对象
const state = reactive({
  name: 'Alice',
  age: 25
});
```

---

## 2. computed 效率

### 检查项

| 规则 ID | 描述 | 严重程度 |
|---------|------|----------|
| V3-010 | computed 内部创建新对象 | Warning |
| V3-011 | computed 依赖未缓存 | Error |

### 正确示例

```typescript
// 好：纯计算，不创建新对象
const visibleMessages = computed(() => 
  sortedMessages.value.slice(-visibleCount.value)
);

// 不好：每次重新创建 Date
const messagesWithDividers = computed(() => {
  const today = new Date(); // 每次创建
});
```

---

## 3. 生命周期清理

### 检查项

| 规则 ID | 描述 | 严重程度 |
|---------|------|----------|
| V3-020 | onMounted 外调用响应式 API | Error |
| V3-021 | 缺少清理逻辑 | Warning |

### 正确示例

```typescript
import { onMounted, onUnmounted, ref } from 'vue';

const timer = ref<number | null>(null);

onMounted(() => {
  timer.value = setInterval(() => {}, 1000);
});

onUnmounted(() => {
  if (timer.value) clearInterval(timer.value);
});
```

---

## 4. Props 和 Emit 类型

### 检查项

| 规则 ID | 描述 | 严重程度 |
|---------|------|----------|
| V3-040 | Props 未使用 defineProps 泛型 | Error |
| V3-041 | Emit 未使用 defineEmits | Warning |

### 正确示例

```typescript
const props = defineProps<{
  title: string;
  count?: number;
}>();

const emit = defineEmits<{
  (e: 'update', value: string): void;
  (e: 'delete', id: number): void;
}>();
```

---

## 5. 性能注意

### 检查项

| 规则 ID | 描述 | 严重程度 |
|---------|------|----------|
| V3-070 | 大列表未虚拟化 | Error |
| V3-071 | v-for 缺少 key | Error |

### 正确示例

```vue
<!-- 正确的 key -->
<div v-for="item in list" :key="item.id">
```