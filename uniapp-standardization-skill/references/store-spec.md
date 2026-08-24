# 状态管理规范

> 本文档定义 uniapp 项目 Pinia 状态管理的规范

## 目录结构

```
stores/
├── index.ts            # store 入口
└── modules/           # store 模块
    ├── user.ts        # 用户状态
    ├── app.ts         # 应用状态
    └── cart.ts        # 购物车状态
```

## Store 模块规范

### 基本结构

```typescript
// stores/modules/user.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login, getUserInfo } from '@/api'
import type { UserInfo, LoginParams } from '@/api/types'

export const useUserStore = defineStore('user', () => {
  // ===== State =====
  const token = ref<string>(uni.getStorageSync('token') || '')
  const userInfo = ref<UserInfo | null>(null)
  const loading = ref(false)

  // ===== Getters =====
  const isLoggedIn = computed(() => !!token.value)
  const nickname = computed(() => userInfo.value?.nickname || '未登录')

  // ===== Actions =====
  async function loginAction(params: LoginParams) {
    loading.value = true
    try {
      const result = await login(params)
      token.value = result.token
      uni.setStorageSync('token', result.token)
      // 登录成功后获取用户信息
      await fetchUserInfo()
    } finally {
      loading.value = false
    }
  }

  async function fetchUserInfo() {
    if (!token.value) return
    try {
      userInfo.value = await getUserInfo()
    } catch (e) {
      console.error(e)
    }
  }

  function logout() {
    token.value = ''
    userInfo.value = null
    uni.removeStorageSync('token')
  }

  return {
    // State
    token,
    userInfo,
    loading,
    // Getters
    isLoggedIn,
    nickname,
    // Actions
    loginAction,
    fetchUserInfo,
    logout,
  }
})
```

## Store 入口规范

```typescript
// stores/index.ts
import { createPinia } from 'pinia'

const pinia = createPinia()

export default pinia

// 统一导出所有 store
export * from './modules/user'
export * from './modules/app'
export * from './modules/cart'
```

## 应用级 Store

```typescript
// stores/modules/app.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAppStore = defineStore('app', () => {
  // ===== State =====
  const theme = ref<'light' | 'dark'>('light')
  const systemInfo = ref<UniApp.SystemInfo>()
  const safeAreaInsets = ref<UniApp.SafeAreaInsets>()

  // ===== Actions =====
  function setTheme(newTheme: 'light' | 'dark') {
    theme.value = newTheme
    uni.setStorageSync('theme', newTheme)
  }

  function initSystemInfo() {
    const info = uni.getSystemInfoSync()
    systemInfo.value = info

    // 获取安全区域
    const menuButton = uni.getMenuButtonBoundingClientRect()
    safeAreaInsets.value = {
      top: menuButton.top,
      bottom: info.screenHeight - menuButton.bottom,
      left: 0,
      right: 0,
    }
  }

  // 初始化
  initSystemInfo()

  return {
    theme,
    systemInfo,
    safeAreaInsets,
    setTheme,
    initSystemInfo,
  }
})
```

## 使用示例

### 页面中使用

```typescript
// pages/user/user.vue
<script setup lang="ts">
import { useUserStore } from '@/stores'

const userStore = useUserStore()

// 访问 state
console.log(userStore.nickname)

// 调用 action
await userStore.loginAction({ username: 'xxx', password: 'xxx' })
</script>
```

### 组件中使用

```typescript
// components/Avatar/Avatar.vue
<script setup lang="ts">
import { useUserStore } from '@/stores'

const userStore = useUserStore()
</script>

<template>
  <image :src="userStore.userInfo?.avatar" />
</template>
```

## 持久化

需要持久化的 state 使用 `uni.setStorageSync`：

```typescript
// 自动持久化 token
const token = ref<string>(uni.getStorageSync('token') || '')

// 登出时清除
function logout() {
  token.value = ''
  uni.removeStorageSync('token')
}
```

## 禁止事项

- 禁止使用 Vuex（使用 Pinia）
- 禁止直接修改 state（通过 action 修改）
- 禁止在 store 中直接调用 uni API（封装到 action 中）
- 禁止 store 过于臃肿（按模块拆分）
