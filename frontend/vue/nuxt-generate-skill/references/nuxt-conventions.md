# Nuxt 3 开发约定

## 1. Auto-imports 约定

Nuxt 3 自动导入以下 API，无需手动 import：

### Vue 核心 API

```typescript
// ✅ 直接使用，无需 import
ref()
computed()
reactive()
watch()
watchEffect()
onMounted()
onUnmounted()
defineComponent()
nextTick()
toRef() / toRefs()
```

### Nuxt 组合函数

```typescript
// ✅ 直接使用
useHead()
useSeoMeta()
useRoute()
useRouter()
useFetch()
useAsyncData()
useLazyFetch()
useLazyAsyncData()
useCookie()
useState()
navigateTo()
abortNavigation()
definePageMeta()
defineNuxtRouteMiddleware()
```

### 组件自动导入

```vue
<template>
  <!-- ✅ components/ 下的组件自动注册，无需 import -->
  <AppLayout />
  <BaseButton />

  <!-- Nuxt 内置组件也无需 import -->
  <NuxtLink to="/about">关于</NuxtLink>
  <NuxtPage />
  <NuxtLayout />
</template>
```

### 需要手动 import 的

```typescript
// ❌ 这些需要手动 import
import { defineStore } from 'pinia'          // Pinia
import { ElMessage } from 'element-plus'      // Element Plus 方法
import type { User } from '~/types/user'      // 类型（但可以用 #imports）
```

## 2. composables/ vs utils/ 职责边界

| 目录 | 职责 | 返回值 | 自动导入 |
|------|------|--------|---------|
| `composables/` | 有状态的复用逻辑 | 通常返回 ref/reactive | 是 |
| `utils/` | 无状态的工具函数 | 普通返回值 | 是 |

### composables/ 示例

```typescript
// composables/useAuth.ts — 有状态
export function useAuth() {
  const token = useCookie('auth_token')
  const user = useState<User | null>('auth_user', () => null)

  async function login(params: LoginParams) { /* ... */ }
  function logout() { /* ... */ }

  return { token, user, login, logout }
}
```

### utils/ 示例

```typescript
// utils/format.ts — 无状态
export function formatDate(date: string | Date, pattern = 'YYYY-MM-DD'): string {
  // ...
}

export function formatFileSize(bytes: number): string {
  // ...
}
```

## 3. 组件命名规范

| 场景 | 规范 | 示例 |
|------|------|------|
| 组件文件名 | PascalCase | `UserCard.vue`、`AppHeader.vue` |
| 模板中使用 | PascalCase 或 kebab-case | `<UserCard />` 或 `<user-card />` |
| 组件内部变量 | camelCase | `const userCard = ref(...)` |

### 组件自动导入命名规则

```
components/
├── AppHeader.vue           → <AppHeader />
├── user/
│   └── UserCard.vue        → <UserUserCard />
│   └── UserCard.vue        → <UserCard /> (前缀去重)
└── base/
    └── BaseButton.vue      → <BaseButton />
```

建议使用 `pathPrefix: false` 配置简化：

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  components: [
    { path: '~/components', pathPrefix: false },
  ],
})
```

## 4. 文件命名规范

| 文件类型 | 规范 | 示例 |
|---------|------|------|
| 页面文件 | kebab-case | `pages/user-list.vue` |
| 组件文件 | PascalCase | `components/UserCard.vue` |
| 组合函数 | camelCase，`use` 前缀 | `composables/useAuth.ts` |
| 工具函数 | camelCase | `utils/formatDate.ts` |
| 中间件 | kebab-case | `middleware/auth-check.ts` |
| 类型文件 | kebab-case | `types/api-response.ts` |
| 插件文件 | kebab-case | `plugins/element-plus.ts` |

## 5. TypeScript 严格模式

```json
// tsconfig.json
{
  "extends": "./.nuxt/tsconfig.json",
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "exactOptionalPropertyTypes": false
  }
}
```

### 关键规则

1. **禁止 `any`** — 使用 `unknown` 替代，再做类型收窄
2. **接口优先于 type** — 用于对象类型定义
3. **枚举慎用** — 优先使用 `as const` + 联合类型
4. **泛型约束** — 使用 `extends` 明确约束

```typescript
// ✅ 推荐
interface User { id: number; name: string }
type Status = 'active' | 'inactive'

// ❌ 避免
type User = { id: number; name: string }  // 对象用 interface
const status: any = 'active'              // 禁止 any
```

## 6. SSR 安全规则

### 客户端专属 API 禁止在服务端执行

```typescript
// ❌ 服务端没有 window/document/navigator
if (import.meta.client) {
  // 客户端专属代码
  window.addEventListener('resize', handler)
  localStorage.getItem('key')
}

// ✅ 使用 import.meta.server 判断
if (import.meta.server) {
  // 服务端专属代码
}
```

### useState 做 SSR 状态同步

```typescript
// ✅ useState 在 SSR 期间确保服务端和客户端状态一致
const count = useState('count', () => 0)

// ❌ 普通 ref 在 SSR 会导致 hydration mismatch
const count = ref(0) // 服务端和客户端各自独立
```

## 7. 路径别名

```typescript
// Nuxt 内置别名
'~'  或  '@'      → 项目根目录（srcDir）
'#imports'        → 自动导入的 API
'#app'            → Nuxt 运行时
'~~' 或 '@@'      → 项目根目录（含外层）

// 示例
import { useAuth } from '~/composables/useAuth'
import type { User } from '~/types/user'
import { formatDate } from '~/utils/format'
```
