# 代码示例目录（code-examples/）

> 本目录提供**完整可直接复制**的代码示例。所有代码均通过 `vue-tsc --noEmit` 与 ESLint 严格检查。

---

## 目录索引

```
code-examples/
├── README.md                       # 本文件
├── types/
│   ├── api.ts                      # ApiResponse<T> / RequestError / 通用类型
│   └── user.ts                     # User / UserListParams 等业务类型
├── stores/
│   ├── user.ts                     # 用户 Pinia store（含 token / profile）
│   └── app.ts                      # 全局 app 状态
├── components/
│   └── AppLayout.vue               # 全局布局（侧边栏 + 顶部栏 + 内容区）
└── views/
    ├── Login.vue                   # 登录页（表单 + 校验 + 跳转）
    └── UserManagement.vue          # 用户管理（列表 + 分页 + 搜索 + CRUD）
```

---

## 与 `frontend-request-skill` 的对应关系

| vue-generate-skill 文件 | 对应 frontend-request-skill 文件 | 说明 |
|------------------------|-------------------------------|------|
| `code-examples/views/Login.vue` | `references/auth-patterns.md` | 登录流程参考 |
| `code-examples/stores/user.ts` | `references/auth-patterns.md` 方案 B | Pinia userStore |
| `api/request.ts`（见 api-integration.md） | `references/frontend-spec.md` | fetch 标准实现 |
| `services/auth.service.ts`（见 api-integration.md） | `references/auth-patterns.md` | Token 刷新队列 |
| `config/api.config.ts` | `references/frontend-spec.md` | BASE_URL 等配置 |

---

## 使用方式

1. **第一次接入**：按 `api-integration.md` 复制 `request.ts`、`auth.service.ts`、`utils/auth.ts`、`utils/error.ts`、`utils/toast.ts`、`composables/useAuth.ts` 到你的项目
2. **添加新页面**：参考 `views/UserManagement.vue` 的结构
3. **添加新 store**：参考 `stores/user.ts` 的 Setup Store 风格
4. **添加新类型**：参考 `types/user.ts` 的命名与结构

---

## 严格红线

所有示例代码**强制遵守**：

1. ✅ 全部使用 `<script setup lang="ts">`
2. ✅ 全部使用 Setup Store 风格（不用 Options Store）
3. ✅ Props/Emits 全部用类型声明（不用运行时声明）
4. ✅ 错误捕获用 `unknown`（不用 `any`）
5. ✅ CSS 全部用 `var(--color-*)` 等变量（不用裸色值）
6. ✅ 请求层走 `frontend-request-skill` 标准（不用 axios）
7. ✅ 鉴权走 `auth.service.ts`（不在组件里直接调 localStorage）
8. ✅ 所有可空字段显式标注 `| null` 或 `?`

---

## 反例（已从代码中剔除）

| 反例 | 后果 |
|------|------|
| `interface User { name: string; avatar: string }` | avatar 可能为空导致运行时错误 |
| `try { ... } catch (err) { console.log(err.message) }` | err 是 unknown，无法访问 message |
| `localStorage.getItem('token')` 直接读取 | 绕过 store，状态不同步 |
| `import axios from 'axios'` | 与 frontend-request-skill 不一致 |
| `<script setup>` 不加 `lang="ts"` | TypeScript 检查失效 |
| `<button class="my-button">` 手写按钮 | 应该用 `<el-button>` |
| `style="background: #10b981"` 内联样式 | 应该用 CSS 变量 |
