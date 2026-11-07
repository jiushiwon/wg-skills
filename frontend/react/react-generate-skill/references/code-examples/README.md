# Code Examples

本目录包含 React + TypeScript + Vite 项目的完整代码示例。

## 文件清单

| 文件 | 说明 |
|------|------|
| `types/api.ts` | API 通用类型定义 |
| `types/user.ts` | 用户相关类型定义 |
| `stores/userStore.ts` | 用户 Store（Zustand + 持久化） |
| `stores/appStore.ts` | 全局 App Store |
| `components/AppLayout.tsx` | 全局布局组件（侧边栏 + Header） |
| `components/AppLayout.module.css` | 布局样式 |
| `pages/Login.tsx` | 登录页 |
| `pages/Login.module.css` | 登录页样式 |
| `pages/UserManagement.tsx` | 用户管理页（列表/分页/CRUD） |
| `pages/UserManagement.module.css` | 用户管理页样式 |

## 使用方式

生成项目时，从本目录复制对应文件到目标项目：
- `types/` → `src/types/`
- `stores/` → `src/stores/`
- `components/` → `src/components/`
- `pages/` → `src/pages/`
