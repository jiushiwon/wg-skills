# API 封装规范

> 本文档定义 uniapp 项目 API 层的规范

## 目录结构

```
api/
├── modules/              # 按业务模块拆分
│   ├── user.ts         # 用户相关 API
│   ├── order.ts        # 订单相关 API
│   ├── product.ts      # 商品相关 API
│   └── index.ts        # 统一导出
├── types/              # API 相关类型
│   └── index.ts
└── index.ts            # API 入口
```

## 模块 API 文件规范

### 基本结构

```typescript
// api/modules/user.ts
import request from '@/utils/request'
import type { UserInfo, LoginParams, LoginResult } from '../types'

// 登录
export function login(data: LoginParams): Promise<LoginResult> {
  return request({
    url: '/api/login',
    method: 'POST',
    data,
  })
}

// 获取用户信息
export function getUserInfo(): Promise<UserInfo> {
  return request({
    url: '/api/user/info',
    method: 'GET',
  })
}

// 更新用户信息
export function updateUserInfo(data: Partial<UserInfo>): Promise<void> {
  return request({
    url: '/api/user/info',
    method: 'PUT',
    data,
  })
}
```

### 统一导出

```typescript
// api/modules/index.ts
export * from './user'
export * from './order'
export * from './product'
```

### API 入口

```typescript
// api/index.ts
export * from './modules'
```

## 请求封装规范

### request.ts 要点

```typescript
// utils/request.ts
import { useUserStore } from '@/stores/modules/user'

interface RequestOptions {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  data?: any
  header?: Record<string, string>
  loading?: boolean // 是否显示 loading
}

export default function request<T = any>(options: RequestOptions): Promise<T> {
  const { url, method = 'GET', data, header = {}, loading = true } = options
  const userStore = useUserStore()

  // 统一添加 Token
  const token = userStore.token
  if (token) {
    header['Authorization'] = `Bearer ${token}`
  }

  // 统一处理 loading
  if (loading) {
    uni.showLoading({ title: '加载中...', mask: true })
  }

  return new Promise((resolve, reject) => {
    uni.request({
      url: `${process.env.VITE_BASE_URL}${url}`,
      method,
      data,
      header: {
        'Content-Type': 'application/json',
        ...header,
      },
      success: (res) => {
        if (res.statusCode === 200) {
          // 业务层错误处理
          if (res.data.code === 0) {
            resolve(res.data.data)
          } else {
            uni.showToast({
              title: res.data.message || '请求失败',
              icon: 'none',
            })
            reject(res.data)
          }
        } else if (res.statusCode === 401) {
          // Token 过期，跳转登录
          userStore.logout()
          uni.reLaunch({ url: '/pages/login/login' })
          reject(new Error('未授权'))
        } else {
          uni.showToast({
            title: '网络错误',
            icon: 'none',
          })
          reject(new Error('网络错误'))
        }
      },
      fail: (err) => {
        uni.showToast({
          title: '网络请求失败',
          icon: 'none',
        })
        reject(err)
      },
      complete: () => {
        if (loading) {
          uni.hideLoading()
        }
      },
    })
  })
}
```

## 类型定义规范

### 按模块定义类型

```typescript
// api/types/index.ts

// 用户相关
export interface LoginParams {
  username: string
  password: string
}

export interface LoginResult {
  token: string
  refreshToken: string
  expiresIn: number
}

export interface UserInfo {
  id: string
  nickname: string
  avatar: string
  phone?: string
  email?: string
}

// 订单相关
export interface Order {
  id: string
  orderNo: string
  status: OrderStatus
  amount: number
  items: OrderItem[]
  createdAt: string
}

export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'completed' | 'cancelled'

export interface OrderItem {
  productId: string
  productName: string
  price: number
  quantity: number
}
```

## 使用示例

### 页面中调用

```typescript
// pages/user/user.vue
<script setup lang="ts">
import { ref } from 'vue'
import { getUserInfo } from '@/api'

const userInfo = ref<UserInfo>()
const loading = ref(false)

async function fetchUserInfo() {
  loading.value = true
  try {
    userInfo.value = await getUserInfo()
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

fetchUserInfo()
</script>
```

## 禁止事项

- 禁止在页面中直接使用 `uni.request`
- 禁止在组件中直接调用 API（应传递 props 或 emit 事件）
- 禁止硬编码 API URL
- 禁止不处理错误情况
