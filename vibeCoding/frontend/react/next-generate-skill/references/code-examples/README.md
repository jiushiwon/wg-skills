# Code Examples

本目录包含 Next.js 14+ App Router + TypeScript 项目的完整代码示例。

## 文件清单

| 文件 | 渲染方式 | 说明 |
|------|---------|------|
| `types/api.ts` | - | API 通用类型定义 |
| `types/user.ts` | - | 用户相关类型定义 |
| `stores/userStore.ts` | Client | 用户 Store（Zustand + 持久化） |
| `stores/appStore.ts` | Client | 全局 App Store |
| `components/AppLayout.tsx` | Client | 全局布局组件（侧边栏 + Header） |
| `app/layout.tsx` | Server | 根 Layout（metadata + 全局样式） |
| `app/(auth)/login/page.tsx` | Client | 登录页（Form + useActionState） |
| `app/(dashboard)/users/page.tsx` | Server | 用户列表页（RSC 预取 + Client 交互） |
| `app/api/auth/login/route.ts` | Server | 登录 Route Handler |
| `app/api/users/route.ts` | Server | 用户列表 Route Handler |

## 使用方式

生成项目时，从本目录复制对应文件到目标项目的 `src/` 下：
- `types/` → `src/types/`
- `stores/` → `src/stores/`
- `components/` → `src/components/`
- `app/` → `src/app/`
