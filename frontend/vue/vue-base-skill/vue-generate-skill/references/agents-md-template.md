# AGENTS.md 模板（≤ 400 行，按主题拆分）

> **AGENTS.md 是按需查阅的详细规范，不是 AI 自动加载的。**
> **AI 会根据当前任务的主题（页面/组件/接口/store）查找对应章节。**

---

## 模板

```markdown
# {{PROJECT_NAME}} - 详细规范

> CLAUDE.md 是速查版（≤ 50 行）。本文档是详细版，按主题拆分，按需查阅。

---

## 1. 项目结构

### 1.1 标准目录
（参考 references/project-structure.md）

### 1.2 何时新增目录
只用一次的不建。第三次用到时考虑拆子目录。

### 1.3 文件命名
- 组件/页面：PascalCase
- 工具/store/类型：camelCase
- 组合式函数：`use` + camelCase

---

## 2. TypeScript 规范

### 2.1 类型注解
- 所有函数参数必须有类型
- 所有函数返回值必须有类型（除非可以自动推导）
- 不使用 `any`，必要时用 `unknown` + 类型守卫
- 不使用 `@ts-ignore`，必要时用 `@ts-expect-error` 并写理由

### 2.2 接口 vs 类型别名
- 描述对象结构：用 `interface`
- 描述联合类型/工具类型：用 `type`

### 2.3 枚举
- 优先用 `const enum` 或 `as const` 对象（避免运行时枚举）
- 仅当需要反向映射时用 `enum`

---

## 3. Vue 3 规范

### 3.1 Composition API
- **必须** 用 `<script setup lang="ts">`
- **禁止** 用 Options API
- 组合式函数放 `src/composables/`（`use*` 命名）

### 3.2 Props 定义
```typescript
// ✅ 推荐：使用 defineProps 的类型参数
const { title, size = 'medium' } = defineProps<{
  title: string;
  size?: 'small' | 'medium' | 'large';
}>()

// ❌ 避免：使用 withDefaults + 复杂类型
```

### 3.3 Emits 定义
```typescript
const emit = defineEmits<{
  click: [event: MouseEvent];
  change: [value: string];
}>()
```

### 3.4 Refs 和响应式
- 单个值用 `ref`
- 对象/数组用 `reactive` 或 `ref`（推荐 ref + 自动解包）
- 计算属性用 `computed`
- 副作用用 `watch` 或 `watchEffect`

---

## 4. 样式规范

### 4.1 CSS 变量
**所有颜色、间距、字体、圆角、阴影必须用 CSS 变量**：
```vue
<style scoped>
.button {
  background: var(--color-primary);
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-md);
}
</style>
```

### 4.2 禁止
- ❌ 裸色值：`background: #10b981`（必须用 `var(--color-primary)`）
- ❌ 裸间距：`padding: 12px`（必须用 `var(--space-3)`）
- ❌ 裸圆角：`border-radius: 8px`（必须用 `var(--radius-md)`）
- ❌ 内联样式：`style="margin: 10px"`（用 scoped style）

---

## 5. 组件规范

### 5.1 抽取时机
- ✅ 复用 ≥3 次 → 抽到 `src/components/<Name>.vue`
- ❌ 复用 <3 次 → 写在页面内 inline

### 5.2 共享组件清单
（参考 references/component-standards.md）

### 5.3 组件命名
- 业务组件：`App` + 功能 → `AppButton` / `AppLayout` / `AppEmpty`
- 业务组件（特定）：`功能` + 名词 → `UserCard` / `OrderTable`

---

## 6. 路由规范

### 6.1 路由声明
- 静态路由放 `src/router/routes.ts`
- 动态路由（按角色生成）放 `src/router/dynamic-routes.ts`

### 6.2 路由守卫
- 登录态校验：`src/router/guards.ts` 的 `beforeEach`
- 角色校验：在路由的 `meta.roles` 中声明

### 6.3 懒加载
所有页面**必须**懒加载：
```typescript
component: () => import('@/views/Dashboard.vue')
```

---

## 7. Pinia 规范

### 7.1 Store 风格
**必须用 Setup Store**（Composition API 风格）：
```typescript
export const useUserStore = defineStore('user', () => {
  const token = ref('');
  const profile = ref<User | null>(null);

  function login(credentials: LoginRequest) { /* ... */ }
  function logout() { /* ... */ }

  return { token, profile, login, logout };
});
```

### 7.2 命名
- Store id：camelCase 单数 → `'user'` / `'app'`
- Store 文件：`src/stores/modules/<name>.ts`

---

## 8. API 规范（严格对齐 frontend-request-skill）

> **本节强制使用 `fetch`，不用 axios。** 完整实现见 `frontend-request-skill` 的 `references/frontend-spec.md`。

### 8.1 request.ts 入口
统一在 `src/api/request.ts`，所有接口模块都从这里导入：

```typescript
import { get, post, put, del } from '@/api/request';
```

### 8.2 接口模块
按业务聚合到 `src/api/modules/<module>.ts`：

```typescript
// src/api/modules/user.ts
import { get, post, put, del } from '@/api/request';
import type { User, UserListParams, UserCreateRequest } from '@/types/user';

export const userApi = {
  list: (params: UserListParams) =>
    get<UserListResponse>('/users', params),
  get: (id: number) =>
    get<User>(`/users/${id}`),
  create: (data: UserCreateRequest) =>
    post<User>('/users', data),
  update: (id: number, data: Partial<User>) =>
    put<User>(`/users/${id}`, data),
  remove: (id: number) =>
    del<void>(`/users/${id}`),
};
```

### 8.3 错误处理
- 业务错误：统一抛 `RequestError`（`utils/error.ts` 内的 `formatError()` 生成）
- HTTP 错误：fetch 拦截器识别 HTTP 状态码 + 业务码
- 401：自动调 `auth.service.ts` 的 `refreshToken()` 队列，失败再统一登出
- 错误提示：调 `utils/toast.ts` 的 `showError(err)`，文案走 `ERROR_CODE_MAP`

### 8.4 红线
- ❌ 不用 axios（用 fetch）
- ❌ 不在组件里直接调 `localStorage`（走 `utils/auth.ts`）
- ❌ 不在组件里写 401 跳转（交给 `auth.service.ts`）
- ❌ 不用 `request.get` / `request.post`（用 `get` / `post` 命名导出）

---

## 9. 测试规范（可选）

### 9.1 单元测试
- 工具函数（src/utils/）必须覆盖
- 组合式函数（src/composables/）推荐覆盖
- 组件不强制（除非关键业务组件）

### 9.2 测试框架
- Vitest（与 Vite 集成最好）
- @vue/test-utils（组件测试）

---

## 10. Git 规范

### 10.1 分支
- `main`：稳定分支
- `feat/<name>`：新功能
- `fix/<name>`：bug 修复

### 10.2 Commit
- 遵循 Conventional Commits
- `<type>(<scope>): <description>`
- 类型：feat / fix / docs / style / refactor / test / chore

### 10.3 提交前
- ✅ `npm run lint` 通过
- ✅ `npm run type-check` 通过
- ✅ `npm run build` 成功
- ❌ 不要提交未完成的代码

---

## 11. 性能规范

### 11.1 路由懒加载
（见 6.3）

### 11.2 组件懒加载
大组件用 `defineAsyncComponent`：
```typescript
import { defineAsyncComponent } from 'vue';
const HeavyChart = defineAsyncComponent(() => import('@/components/HeavyChart.vue'));
```

### 11.3 计算属性 vs 方法
- 模板中频繁调用的逻辑 → `computed`
- 事件处理逻辑 → `methods`/函数

### 11.4 v-if vs v-show
- 一次性条件渲染 → `v-if`
- 频繁切换 → `v-show`
- ❌ 不要用 `v-if` 做权限判断（在路由守卫里做）

---

## 12. 安全规范

### 12.1 XSS
- v-html 必须经过 sanitization（DOMPurify）
- 用户输入渲染前必须 escape

### 12.2 CSRF
- 不使用 GET 改状态
- POST 请求必须带 CSRF token（如果后端要求）

### 12.3 token 存储
- 默认 localStorage（简单场景）
- 敏感场景用 httpOnly cookie + 后端校验

---

## 13. 完成后清单

提交前自检：

- [ ] CLAUDE.md ≤ 50 行
- [ ] 本文档 ≤ 400 行
- [ ] `npm run lint` 通过
- [ ] `npm run type-check` 通过
- [ ] `npm run build` 成功
- [ ] 没有 `console.log` 残留
- [ ] 没有 `any` 类型
- [ ] 没有裸色值 / 裸间距
- [ ] 没有未使用的 imports / variables
```

---

## 使用方式

AI 在做具体任务时，**只读对应章节**：

- 写组件 → 读 §3 §4 §5
- 写接口 → 读 §8
- 写 store → 读 §7
- 写路由 → 读 §6
- 性能优化 → 读 §11
- 提交代码 → 读 §10 §13

**不需要一次性读完全文。**
