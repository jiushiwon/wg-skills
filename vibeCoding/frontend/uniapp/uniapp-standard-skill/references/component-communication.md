# 组件通信规范

## 1. 通信方式对比

| 方式 | 适用场景 | 优点 | 缺点 |
|------|----------|------|------|
| **props/emit** | 父子组件 | 简单、直观 | 深层传递麻烦 |
| **ref/defineExpose** | 父子组件 | 双向通信 | 耦合性高 |
| **provide/inject** | 祖孙组件 | 跨层级传递 | 不直观 |
| **EventBus** | 任意组件 | 灵活 | 难以追踪 |
| **Store (Pinia)** | 任意组件 | 集中管理 | 过度使用导致混乱 |

## 2. props/emit 父子通信

### 2.1 基础用法

```vue
<!-- Parent.vue -->
<template>
  <Child
    :title="title"
    :list="list"
    @change="handleChange"
    @delete="handleDelete"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Child from './Child.vue';

const title = ref('标题');
const list = ref([1, 2, 3]);

function handleChange(value: string) {
  console.log('change:', value);
}

function handleDelete(id: number) {
  list.value = list.value.filter(item => item !== id);
}
</script>
```

```vue
<!-- Child.vue -->
<template>
  <view>
    <text>{{ title }}</text>
    <view v-for="item in list" :key="item">
      {{ item }}
      <button @click="$emit('change', item)">修改</button>
      <button @click="$emit('delete', item)">删除</button>
    </view>
  </view>
</template>

<script setup lang="ts">
interface Props {
  title: string;
  list: number[];
}

const props = defineProps<Props>();

// 定义事件
const emit = defineEmits<{
  change: [value: string];
  delete: [id: number];
}>();

function onDelete(id: number) {
  emit('delete', id);
}
</script>
```

### 2.2 类型化 props

```typescript
// 基础类型
defineProps<{ name: string; age?: number }>();

// 接口定义
interface UserProps {
  name: string;
  age: number;
  avatar?: string;
}

defineProps<UserProps>();

// 带默认值
const props = withDefaults(defineProps<UserProps>(), {
  age: 18,
  avatar: ''
});
```

### 2.3 类型化 emit

```typescript
// 类型化 emit
const emit = defineEmits<{
  (e: 'update', value: string): void;
  (e: 'change', id: number, data: any): void;
  (e: 'delete'): void;
}>();

// 使用
emit('update', 'new value');
emit('change', 1, { name: 'test' });
emit('delete');
```

## 3. ref 父子通信

### 3.1 子组件暴露方法

```vue
<!-- Child.vue -->
<script setup lang="ts">
const count = ref(0);

function increment() {
  count.value++;
}

function reset() {
  count.value = 0;
}

// 暴露方法给父组件
defineExpose({
  count,
  increment,
  reset,
});
</script>
```

### 3.2 父组件调用

```vue
<!-- Parent.vue -->
<template>
  <Child ref="childRef" />
  <button @click="handleIncrement">增加</button>
  <button @click="handleReset">重置</button>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Child from './Child.vue';

const childRef = ref<InstanceType<typeof Child> | null>(null);

function handleIncrement() {
  childRef.value?.increment();
}

function handleReset() {
  childRef.value?.reset();
  console.log('当前值:', childRef.value?.count);
}
</script>
```

## 4. provide/inject 祖孙通信

### 4.1 基础用法

```typescript
// 祖组件：provide
import { provide } from 'vue';

const theme = ref('light');
provide('theme', theme);

// 孙组件：inject
import { inject } from 'vue';

const theme = inject<Ref<string>>('theme');
```

### 4.2 响应式共享

```typescript
// 祖组件
import { provide, reactive } from 'vue';

const state = reactive({
  user: null,
  token: null,
});

provide('appState', {
  state,
  setUser: (user: any) => { state.user = user; },
  setToken: (token: string) => { state.token = token; },
});

// 孙组件
const { state, setUser } = inject<any>('appState');
```

### 4.3 只读注入

```typescript
// 祖组件：只读暴露
provide('theme', readonly(theme));

// 孙组件：无法修改
const theme = inject('theme'); // 只读
```

## 5. EventBus 兄弟/任意通信

### 5.1 封装

```typescript
// src/utils/event-bus.ts
import { onUnmounted } from 'vue';

type EventCallback = (...args: any[]) => void;

class EventBus {
  private events: Record<string, EventCallback[]> = {};

  on(event: string, callback: EventCallback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }

  off(event: string, callback?: EventCallback) {
    if (!callback) {
      delete this.events[event];
    } else {
      this.events[event] = this.events[event].filter(cb => cb !== callback);
    }
  }

  emit(event: string, ...args: any[]) {
    if (this.events[event]) {
      this.events[event].forEach(cb => cb(...args));
    }
  }

  once(event: string, callback: EventCallback) {
    const wrapper = (...args: any[]) => {
      callback(...args);
      this.off(event, wrapper);
    };
    this.on(event, wrapper);
  }
}

export const eventBus = new EventBus();
```

### 5.2 使用示例

```typescript
// 组件A：监听事件
import { onMounted, onUnmounted } from 'vue';
import { eventBus } from '@/utils/event-bus';

onMounted(() => {
  eventBus.on('refresh-list', handleRefresh);
});

onUnmounted(() => {
  eventBus.off('refresh-list', handleRefresh);
});

function handleRefresh() {
  // 刷新列表
}

// 组件B：触发事件
import { eventBus } from '@/utils/event-bus';

function onDelete() {
  // 删除操作
  eventBus.emit('refresh-list');
}
```

## 6. Store 任意组件通信

### 6.1 适用场景

- 全局状态共享
- 多个组件需要响应同一数据
- 复杂的状态逻辑

```typescript
// stores/ui.ts
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useUIStore = defineStore('ui', () => {
  const showModal = ref(false);
  const modalContent = ref('');
  const loading = ref(false);

  function openModal(content: string) {
    modalContent.value = content;
    showModal.value = true;
  }

  function closeModal() {
    showModal.value = false;
    modalContent.value = '';
  }

  function setLoading(value: boolean) {
    loading.value = value;
  }

  return {
    showModal,
    modalContent,
    loading,
    openModal,
    closeModal,
    setLoading,
  };
});
```

### 6.2 使用

```typescript
// 组件A：修改状态
import { useUIStore } from '@/stores/ui';

const uiStore = useUIStore();
uiStore.openModal('确认删除？');

// 组件B：响应状态
import { useUIStore } from '@/stores/ui';
import { storeToRefs } from 'pinia';

const uiStore = useUIStore();
const { showModal } = storeToRefs(uiStore);

// showModal 变化时自动更新
```

## 7. 选择决策树

```
需要组件通信？
    │
    ├─ 父子组件？
    │   │
    │   ├─ 父→子：props ✓
    │   │
    │   └─ 子→父：emit ✓
    │
    ├─ 祖孙组件？
    │   │
    │   └─ provide/inject ✓
    │
    ├─ 兄弟组件？
    │   │
    │   ├─ 简单：props → 父组件 → props ✓
    │   │
    │   └─ 复杂：EventBus 或 Store ✓
    │
    └─ 全局状态？
        │
        └─ Store (Pinia) ✓
```

## 8. 最佳实践

### 8.1 禁止事项

```typescript
// ❌ 禁止：直接修改 props
props.name = '新名字'; // 错误

// ✅ 正确：emit 给父组件修改
emit('update:name', '新名字');

// ❌ 禁止：EventBus 滥用
// 满屏 eventBus.on/off，难以追踪

// ✅ 正确：优先使用 props/emit
// 简单场景不要用 Store
```

### 8.2 命名规范

```typescript
// props：使用 camelCase
defineProps<{ userName: string; avatarUrl: string }>();

// emit：使用 camelCase
const emit = defineEmits<{
  (e: 'updateUser', user: User): void;
  (e: 'deleteUser', id: number): void;
}>();

// v-model
const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();
```

### 8.3 类型定义

```typescript
// 抽离类型定义
// types/component.ts

export interface DialogProps {
  visible: boolean;
  title?: string;
  content?: string;
  confirmText?: string;
  cancelText?: string;
}

export interface DialogEmits {
  (e: 'update:visible', value: boolean): void;
  (e: 'confirm'): void;
  (e: 'cancel'): void;
}

// 使用
defineProps<DialogProps>();
const emit = defineEmits<DialogEmits>();
```
