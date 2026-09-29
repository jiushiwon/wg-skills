# Next.js App Router 编码约定

> 本文档聚焦 Next.js 特有约定。与 React 18 通用约定一致的部分，继承自 `react-generate-skill` 的 `react-conventions.md`。

---

## 1. `'use client'` / `'use server'` 指令

### 1.1 `'use client'` 使用时机

```typescript
// 只在以下场景加 'use client'：
'use client'; // ← 文件顶部

// 1. 使用 Hooks（useState / useEffect / useRef / useContext 等）
// 2. 使用事件处理（onClick / onChange / onSubmit 等）
// 3. 使用浏览器 API（window / document / localStorage）
// 4. 使用第三方客户端库（antd 的大部分组件）
// 5. 使用 Zustand Store
```

### 1.2 不需要 `'use client'` 的场景

```typescript
// 这些场景默认就是 Server Component，不加任何指令：
// 1. 纯数据获取（fetch / ORM 查询）
// 2. 纯展示组件（只渲染，无交互）
// 3. 访问环境变量（不带 NEXT_PUBLIC_ 的也可以）
// 4. 使用 next/headers（cookies / headers）
// 5. 读取文件系统
```

### 1.3 `'use server'` 使用时机

```typescript
// Server Actions 文件顶部
'use server';

// 用于：
// 1. 表单提交（配合 <form action={...}>）
// 2. 数据变更（创建/更新/删除）
// 3. 替代大部分 POST 请求
```

### 1.4 常见错误

```typescript
// ❌ 错误：Server Component 中加了 'use client'
// 这会把整个组件树标记为客户端，丧失 RSC 优势
'use client';
export default async function UserPage() {
  const data = await fetch('/api/users');
  return <div>{data}</div>;
}

// ✅ 正确：不加指令，保持 Server Component
export default async function UserPage() {
  const data = await fetchUsers();
  return <UserTable data={data} />;
}
```

---

## 2. Server Components vs Client Components 选择指南

```
组件需要以下能力？
├── 事件处理（onClick 等）     → Client
├── useState / useEffect      → Client
├── 浏览器 API                 → Client
├── Zustand Store              → Client
├── antd 交互组件              → Client（Table/Modal/Form 等）
├── 只获取数据 + 展示          → Server
├── 访问 cookies / headers    → Server
├── 访问数据库（通过 ORM）     → Server
├── 读取文件系统               → Server
└── 不确定                     → Server（默认）
```

### 最佳实践：Client 推到叶子节点

```typescript
// ✅ 正确：Server Component → Client Component
// app/(dashboard)/users/page.tsx
export default async function UsersPage() {
  const users = await fetchUsers();  // Server 侧获取数据
  return <UserTable data={users} />; // 传给 Client 侧交互
}

// ❌ 错误：整个页面标记为 Client
'use client';
export default function UsersPage() {
  const [users, setUsers] = useState([]);
  useEffect(() => {
    fetchUsers().then(setUsers);  // 客户端再次请求
  }, []);
  return <UserTable data={users} />;
}
```

---

## 3. Server Actions 最佳实践

### 3.1 配合 useActionState（React 19）

```typescript
'use client';

import { useActionState } from 'react';
import { createUserAction } from '@/lib/actions/user';

export function CreateUserForm() {
  const [state, formAction, isPending] = useActionState(createUserAction, null);

  return (
    <form action={formAction}>
      <input name="username" required />
      {state?.error && <span>{state.error}</span>}
      <button disabled={isPending}>
        {isPending ? '提交中...' : '创建用户'}
      </button>
    </form>
  );
}
```

### 3.2 配合 revalidatePath

```typescript
'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';

export async function createUserAction(
  _prevState: unknown,
  formData: FormData
) {
  const username = formData.get('username') as string;

  await db.user.create({ data: { username } });

  // 数据变更后刷新缓存
  revalidatePath('/users');

  return { success: true };
}
```

---

## 4. 组件命名规范

| 类型 | 命名 | 示例 |
|------|------|------|
| 路由页面 | `page.tsx` | `app/(dashboard)/users/page.tsx` |
| 布局 | `layout.tsx` | `app/(dashboard)/layout.tsx` |
| 加载 | `loading.tsx` | `app/(dashboard)/loading.tsx` |
| 错误 | `error.tsx` | `app/(dashboard)/error.tsx` |
| API 路由 | `route.ts` | `app/api/users/route.ts` |
| 共享组件 | PascalCase `.tsx` | `components/AppLayout.tsx` |
| Server Action | camelCase `.ts` | `lib/actions/auth.ts` |

---

## 5. TypeScript 配置

Next.js 使用自己的 TypeScript 插件，关键配置：

```json
{
  "compilerOptions": {
    "strict": true,
    "jsx": "preserve",         // Next.js 处理 JSX
    "module": "esnext",
    "moduleResolution": "bundler",
    "plugins": [{ "name": "next" }]  // Next.js TS 插件
  }
}
```

**不要**使用 `tsc --noEmit`（Next.js 有自己的类型检查），改用：

```bash
npx next lint        # ESLint（含 TS 规则）
npx next build       # 构建时自动做类型检查
```

---

## 6. 与 React 18 通用约定的关系

以下约定**继承自 `react-generate-skill`**，本技能不重复：

| 约定 | 来源 |
|------|------|
| 函数组件 + Hooks（禁 class） | react-conventions.md |
| 不用 `any`，用 `unknown` + 类型守卫 | react-conventions.md |
| Zustand 使用方式 | react-conventions.md |
| `useEffect` 依赖数组完整性 | react-conventions.md |
| CSS Modules 样式隔离 | react-conventions.md |
| 3 次复用原则 | component-standards.md |

**Next.js 特有差异**：

| 维度 | React SPA | Next.js App Router |
|------|-----------|-------------------|
| 路由 | React Router | 文件系统路由（app/） |
| 数据获取 | useEffect + fetch | Server Component 直接 fetch |
| 状态管理 | Zustand 全局 | Zustand 仅 Client 侧 |
| 样式 | CSS Modules | CSS Modules + CSS-in-JS（按需） |
| 构建工具 | Vite | Turbopack / Webpack（内置） |
| TypeScript 检查 | `tsc --noEmit` | `next build` 内置 |
| 路径别名 | `@/` → `src/` | `@/` → `src/`（相同） |
