# TypeScript 渐进式引入策略

> 从纯 JS 的 Vue2 项目迁移到 TypeScript 的 Vue3 项目，1000+ 页面不可能一次性加完类型。需要渐进式策略。

## 一、总体策略

```
阶段 0: 骨架引入 TS（骨架对齐完成，对应 Phase 2）
  标准骨架自带 tsconfig.json、ESLint+TS 规则

阶段 1: 宽松模式（基础设施层迁移 + 逐模块迁移并行，对应 Phase 3-4）
  strict: false，允许 any，不做强制类型检查
  新迁移的代码优先写 TS，旧 JS 代码保持不变

阶段 2: 核心类型定义（逐模块迁移中后期，对应 Phase 4）
  定义全局类型：API 响应结构、Store 类型、通用 Props 类型
  核心 Store 和 utils 添加完整类型

阶段 3: 严格模式（收尾清理，对应 Phase 6）
  strict: true，开启所有 TS 严格检查
  逐个模块补齐类型，移除 any
```

## 二、tsconfig.json 分阶段配置

### 阶段 1 — 宽松模式

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": false,
    "noImplicitAny": false,
    "strictNullChecks": false,
    "jsx": "preserve",
    "sourceMap": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "esModuleInterop": true,
    "lib": ["ESNext", "DOM"],
    "skipLibCheck": true,
    "noEmit": true,
    "allowJs": true,
    "checkJs": false,
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src/**/*.ts", "src/**/*.d.ts", "src/**/*.vue", "src/**/*.js"],
  "exclude": ["node_modules", "dist"]
}
```

**关键配置**：
- `strict: false` — 不强制严格类型检查
- `allowJs: true` — 允许 `.js` 文件与 `.ts` 文件共存
- `checkJs: false` — 不检查 `.js` 文件的类型
- `include` 中包含 `*.js` — 保证旧 JS 文件能被编译

### 阶段 3 — 严格模式

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "jsx": "preserve",
    "sourceMap": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "esModuleInterop": true,
    "lib": ["ESNext", "DOM"],
    "skipLibCheck": true,
    "noEmit": true,
    "allowJs": false,
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src/**/*.ts", "src/**/*.d.ts", "src/**/*.vue"],
  "exclude": ["node_modules", "dist"]
}
```

## 三、类型定义优先级

### P0 — 全局类型（最早定义）

```typescript
// src/types/index.ts

// API 统一响应结构
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

// 分页请求参数
export interface PageParams {
  page: number
  pageSize: number
}

// 分页响应
export interface PageResult<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}
```

```typescript
// src/types/global.d.ts

// uni-app 类型声明（如果未安装 @dcloudio/types）
declare const uni: any

// 模块声明（用于没有 TS 类型的 npm 包）
declare module '*.vue' {
  import { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module '*.png'
declare module '*.jpg'
declare module '*.svg'
```

### P1 — Store 类型

```typescript
// stores/modules/user.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

interface UserInfo {
  id: number
  nickname: string
  avatar: string
  phone: string
}

export const useUserStore = defineStore('user', () => {
  const token = ref<string>('')
  const userInfo = ref<UserInfo | null>(null)
  const isLoggedIn = computed<boolean>(() => !!token.value)

  function setToken(newToken: string): void {
    token.value = newToken
  }

  function setUserInfo(info: UserInfo): void {
    userInfo.value = info
  }

  return { token, userInfo, isLoggedIn, setToken, setUserInfo }
})
```

### P2 — API 接口类型

```typescript
// api/modules/user.ts
import type { ApiResponse } from '@/types'

export interface LoginParams {
  phone: string
  code: string
}

export interface LoginResult {
  token: string
  userInfo: {
    id: number
    nickname: string
    avatar: string
  }
}

export function login(params: LoginParams): Promise<ApiResponse<LoginResult>> {
  return request.post('/api/user/login', params)
}
```

### P3 — 组件 Props 类型

```typescript
// 页面组件
<script setup lang="ts">
interface UserDetailData {
  id: number
  nickname: string
  avatar: string
  createTime: string
}

const userDetail = ref<UserDetailData | null>(null)

// onLoad 参数类型
interface PageOptions {
  id: string
}

onLoad((options: any) => {
  const id = Number(options.id)
  fetchUserDetail(id)
})
</script>
```

## 四、.js → .ts 转换策略

### 渐进式转换顺序

```
第一阶段（基础设施层迁移完成，对应 Phase 3）：
  main.js → main.ts ✓
  App.vue → 已包含 <script setup lang="ts">

第二阶段（逐模块完成时）：
  stores/modules/xxx.js → xxx.ts  (每个模块迁移时转换)
  utils/xxx.js → xxx.ts
  api/modules/xxx.js → xxx.ts

第三阶段（所有模块完成时）：
  pages/**/xxx.vue → <script setup lang="ts">
  删除所有 .js 文件
```

### JS 文件中的降级类型注解

对于暂时无法完全转 TS 的 JS 文件，使用 JSDoc 添加类型提示：

```javascript
// utils/format.js — 暂不转 TS，但用 JSDoc 标注类型

/**
 * @param {number} price - 价格（分）
 * @returns {string} 格式化后的价格（元）
 */
export function formatPrice(price) {
  return (price / 100).toFixed(2)
}

/**
 * @param {string} dateStr - 日期字符串
 * @param {string} [format='YYYY-MM-DD'] - 格式
 * @returns {string}
 */
export function formatDate(dateStr, format = 'YYYY-MM-DD') {
  return dayjs(dateStr).format(format)
}
```

## 五、any 豁免策略

在渐进式迁移过程中，以下场景可临时使用 `any`：

| 场景 | `any` 用法 | 后续应替换为 |
|------|-----------|-------------|
| API 响应数据 | `const data = ref<any>(null)` | `ref<ApiResponse<UserData>>(null)` |
| uni API 返回值 | `const res: any = await uni.request(...)` | 使用有类型的 request 封装 |
| 第三方库无类型 | `import xxx from 'xxx'` + `declare module 'xxx'` | 写好 `.d.ts` 类型声明 |
| 动态数据 | `const config: any = {}` | 根据实际数据结构定义 interface |

**代码审查规则**：
- `any` 数量应随迁移进度逐步下降
- 收尾清理（对应 Phase 6）时，`any` 数量应趋近于 0
- 可在 ESLint 中逐步收紧：`"@typescript-eslint/no-explicit-any": "warn"` → `"error"`

## 六、TS 迁移检查清单

```
□ [骨架对齐] tsconfig.json 宽松模式配置完成
□ [骨架对齐] src/types/ 全局类型定义完成
□ [基础设施层迁移] stores/ 核心 Store 有完整类型
□ [基础设施层迁移] api/ 接口定义有完整 request/response 类型
□ [逐模块迁移] 每个模块完成后，模块内 .js 全部转为 .ts
□ [逐模块迁移] 每个模块的 props/emits 有类型声明
□ [收尾清理] tsconfig.json 切换 strict: true
□ [收尾清理] ESLint @typescript-eslint/no-explicit-any → "error"
□ [收尾清理] 全局搜索 any → 替换为具体类型 / unknown
```
