# 状态管理规范

## 1. Store 设计原则

### 1.1 单一职责

每个 Store 只负责一个领域的数据：

```
stores/
├── user.ts        # 用户相关（登录态、用户信息）
├── app.ts         # 应用级（主题、配置、全局状态）
├── cart.ts        # 购物车（电商项目）
└── message.ts    # 消息通知
```

### 1.2 文件命名

- 文件名使用 `kebab-case`
- 语义清晰，如 `user.ts`、`cart.ts`
- 避免 `store.ts`、`data.ts` 等模糊命名

## 2. Store 结构

### 2.1 基础结构

```typescript
// src/stores/user.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useUserStore = defineStore('user', () => {
  // ========== State ==========
  const userInfo = ref<UserInfo | null>(null);
  const token = ref<string | null>(null);
  const loading = ref(false);

  // ========== Computed ==========
  const isLoggedIn = computed(() => !!token.value);
  const userId = computed(() => userInfo.value?.id);

  // ========== Actions ==========
  function setUserInfo(info: UserInfo) {
    userInfo.value = info;
  }

  function setToken(newToken: string) {
    token.value = newToken;
  }

  function clearUser() {
    userInfo.value = null;
    token.value = null;
  }

  return {
    // State
    userInfo,
    token,
    loading,
    // Computed
    isLoggedIn,
    userId,
    // Actions
    setUserInfo,
    setToken,
    clearUser,
  };
});
```

### 2.2 复杂 Store 结构

```typescript
// src/stores/cart.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { getCartList, addCart, removeCart } from '@/api/cart';

export const useCartStore = defineStore('cart', () => {
  // State
  const items = ref<CartItem[]>([]);
  const loading = ref(false);
  const selectedIds = ref<string[]>([]);

  // Computed
  const totalItems = computed(() => items.value.length);

  const selectedItems = computed(() =>
    items.value.filter(item => selectedIds.value.includes(item.id))
  );

  const totalPrice = computed(() =>
    selectedItems.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
  );

  const isAllSelected = computed(() =>
    items.value.length > 0 && selectedIds.value.length === items.value.length
  );

  // Actions
  async function fetchCart() {
    loading.value = true;
    try {
      const res = await getCartList();
      items.value = res.data;
    } finally {
      loading.value = false;
    }
  }

  async function add(item: CartItem) {
    await addCart(item);
    items.value.push(item);
  }

  async function remove(id: string) {
    await removeCart(id);
    items.value = items.value.filter(item => item.id !== id);
  }

  function toggleSelect(id: string) {
    const index = selectedIds.value.indexOf(id);
    if (index > -1) {
      selectedIds.value.splice(index, 1);
    } else {
      selectedIds.value.push(id);
    }
  }

  function toggleAllSelect() {
    if (isAllSelected.value) {
      selectedIds.value = [];
    } else {
      selectedIds.value = items.value.map(item => item.id);
    }
  }

  return {
    // State
    items,
    loading,
    selectedIds,
    // Computed
    totalItems,
    selectedItems,
    totalPrice,
    isAllSelected,
    // Actions
    fetchCart,
    add,
    remove,
    toggleSelect,
    toggleAllSelect,
  };
});
```

## 3. State 类型定义

### 3.1 基础类型

```typescript
// src/types/store.d.ts

export interface UserInfo {
  id: number;
  nickname: string;
  avatar?: string;
  phone?: string;
}

export interface CartItem {
  id: string;
  productId: number;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}
```

### 3.2 Store 类型

```typescript
// 统一导出所有 Store 类型
import type { useUserStore } from './stores/user';
import type { useCartStore } from './stores/cart';

export type UserStore = ReturnType<typeof useUserStore>;
export type CartStore = ReturnType<typeof useCartStore>;
```

## 4. 使用规范

### 4.1 在页面中使用

```typescript
// pages/index/index.vue
<script setup lang="ts">
import { useUserStore } from '@/stores/user';
import { storeToRefs } from 'pinia';

const userStore = useUserStore();

// 解构响应式数据（必须使用 storeToRefs）
const { userInfo, isLoggedIn } = storeToRefs(userStore);

// 方法直接解构
const { setUserInfo } = userStore;

function handleLogin() {
  setUserInfo({ id: 1, nickname: '张三' });
}
</script>
```

### 4.2 在组件中使用

```vue
<!-- components/Avatar.vue -->
<script setup lang="ts">
import { useUserStore } from '@/stores/user';

const userStore = useUserStore();
</script>

<template>
  <image :src="userStore.userInfo?.avatar" />
</template>
```

### 4.3 在 API 层使用

```typescript
// src/api/user.ts
import { useUserStore } from '@/stores/user';

export async function getUserProfile() {
  const userStore = useUserStore();
  const token = userStore.token;

  return get('/user/profile', {}, {
    header: { Authorization: `Bearer ${token}` }
  });
}
```

## 5. 持久化

### 5.1 简单持久化

```typescript
import { defineStore } from 'pinia';
import { ref, watch } from 'vue';

export function definePersistedStore<T>(key: string, defaultValue: T) {
  const data = ref<T>(uni.getStorageSync(key) || defaultValue);

  // 防抖写入，避免高频变更时频繁写 Storage
  let writeTimer: number | null = null;
  watch(data, (newValue) => {
    if (writeTimer) clearTimeout(writeTimer);
    writeTimer = setTimeout(() => {
      uni.setStorageSync(key, newValue);
      writeTimer = null;
    }, 300);
  }, { deep: true });

  return data;
}

// 使用
export const useUserStore = defineStore('user', () => {
  const token = definePersistedStore('token', null);
  const userInfo = definePersistedStore('userInfo', null);

  return { token, userInfo };
});
```

### 5.2 插件方式

```typescript
// src/plugins/pinia-plugin-storage.ts
import { definePiniaPlugin } from 'pinia-plugin-persistedstate';

export const piniaPluginStorage = definePiniaPlugin(({ store }) => {
  const storageKey = `pinia_${store.$id}`;

  store.$subscribe(() => {
    uni.setStorageSync(storageKey, store.$state);
  });

  const stored = uni.getStorageSync(storageKey);
  if (stored) {
    store.$patch(stored);
  }
});

// main.ts
import { createPinia } from 'pinia';
import { piniaPluginStorage } from './plugins/pinia-plugin-storage';

const pinia = createPinia();
pinia.use(piniaPluginStorage);
```

## 6. 最佳实践

### 6.1 禁止事项

```typescript
// ❌ 禁止：在 Store 外部直接修改 state
userStore.userInfo.name = '张三';

// ✅ 正确：通过 action 修改
userStore.updateUserInfo({ name: '张三' });

// ❌ 禁止：直接在页面中操作其他 Store 的 state
const cartStore = useCartStore();
cartStore.items = [];  // 不要这样做
```

### 6.2 异步操作

```typescript
// ❌ 禁止：直接在 action 中修改其他 Store
function login(credentials) {
  const userStore = useUserStore();
  userStore.token = 'xxx';  // 跨 Store 操作
}

// ✅ 正确：只在同一个 Store 中操作
function login(credentials) {
  this.token = 'xxx';
}
```

### 6.3 初始化时机

```typescript
// ✅ 正确：在 App.vue 中初始化全局状态
// src/App.vue
<script setup>
import { useAppStore } from '@/stores/app';
import { useUserStore } from '@/stores/user';

const appStore = useAppStore();
const userStore = useUserStore();

onLaunch(() => {
  appStore.init();
  userStore.initUser();
});
</script>
```

## 7. 目录结构示例

```
src/
├── stores/
│   ├── index.ts           # Store 入口，导出所有 Store
│   ├── user.ts           # 用户状态
│   ├── app.ts            # 应用状态
│   └── cart.ts           # 购物车状态
├── types/
│   └── store.d.ts        # Store 类型定义
└── plugins/
    └── pinia-plugin-storage.ts  # 持久化插件
```
