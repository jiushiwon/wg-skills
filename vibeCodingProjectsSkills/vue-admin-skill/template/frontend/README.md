# Vue Admin Frontend

Vue3 + TypeScript + Vite + Pinia + Vue Router 通用管理后台前端模板。

## 技术栈

- **框架**: Vue 3.4 + TypeScript 5.3
- **构建**: Vite 5
- **状态管理**: Pinia 2
- **路由**: Vue Router 4
- **HTTP**: Axios 1.6（按 frontend-request-skill 规范封装）
- **布局/登录**: 软链接到 `vibeCoding/frontend/vue/vue-base-skill/` 下的真实 .vue 组件
  - `vue-layout-skill/components/AppLayout.vue`
  - `vue-login-skill/templates/LoginForm.vue`

## 软链接前置条件

> **用户必须保证以下目录与 vue-admin-skill 平级存在：**

```
vibecoding-portal/skills/
├── vibecodingProjectsSkills/vue-admin-skill/  ← 本模板位置
└── vibeCoding/
    ├── frontend/
    │   ├── vue/vue-base-skill/                              ← 软链接目标
    │   │   ├── vue-complex-skill/vue-login-skill/          ← LoginForm
    │   │   ├── vue-layout-skill/                          ← AppLayout
    │   │   ├── vue-table-skill/  vue-form-skill/  ...
    │   └── frontend-request-skill/
```

`package.json` 中所有 `file:../../../...` 软链接路径都基于这个假设。若实际目录结构不同，调整 `file:` 后的相对路径深度即可。

## 启动

```bash
cd template/frontend
pnpm install   # 或 npm install / yarn
pnpm dev       # 默认 5173 端口，自动代理 /api -> http://localhost:8080
pnpm build     # 生产构建
```

## 默认账号（来自后端 springboot-auth-module-skill）

| 账号 | 密码 | 角色 |
|------|------|------|
| `admin` | `admin123` | 超级管理员（全部菜单） |
| `user_admin` | `admin123` | 用户管理员（部分菜单） |
| `demo` | `admin123` | 普通用户（仅仪表盘） |

## 目录结构

```
src/
├── api/            # 业务 API 定义（auth/user/role/menu/org/product）
├── store/          # Pinia stores（user/permission/app）
├── router/         # Vue Router + 全局守卫
├── utils/          # request / auth / error
├── directives/     # v-permission 自定义指令
├── layout/         # AppLayout 包装
├── views/
│   ├── login/      # 登录页（vue-login-skill）
│   ├── dashboard/  # 仪表盘
│   ├── system/
│   │   ├── user/   # 用户管理 CRUD + 分配角色 + 重置密码
│   │   ├── role/   # 角色管理 + 分配菜单
│   │   ├── menu/   # 菜单管理（树 + 详情）
│   │   └── org/    # 组织管理（树 + 详情）
│   ├── example/product/  # 商品列表（演示非权限业务）
│   └── error/      # 403 / 404
├── styles/         # tokens.css / global.css / page.css
└── types/          # api.d.ts（ApiResponse / PageResponse）
```

## 后端契约

接口与 `springboot-auth-module-skill/api-contract-auth.md` 严格对齐：

- 响应信封：`{ code, message, data }`，`code === 0` 表示成功
- 分页字段：`items / total / page / pageSize`
- 401 自动清理 token 并跳登录

## 关于 vue-base-skill 下其他技能包

**重要**：vue-base-skill 下大部分子技能包（如 vue-table-skill / vue-form-skill / vue-tree-skill / vue-dialog-skill 等）当前**仅有 markdown 文档，没有可导入的 .vue 源文件**。因此本模板中各 CRUD 页面使用**原生 HTML5 元素 + 自定义 CSS** 实现，而非依赖这些组件。

只有以下两个技能包提供了真实的 .vue 组件：
- **vue-layout-skill** —— `components/AppLayout.vue`
- **vue-login-skill** —— `templates/LoginForm.vue`

如果你后续将其他技能包补齐为真实 .vue 组件，只需修改 `src/views/**/*.vue` 中的模板部分，将原生 `<table>` 替换为 `<base-table>` 等。

## v-permission 用法

```vue
<button v-permission="'user:add'">新增</button>
<button v-permission="['user:edit', 'user:delete']">操作</button>
```

指令内部判定：超管（super_admin）放行 / 包含任一权限即放行。

## 已知约束

- `request.ts` 当前仅做基础信封处理，未实现 Token 自动刷新队列（frontend-request-skill 的高级特性）
- 角色/菜单/组织的「新增子节点」交互简化，跳过表单直接保存为占位实现
- 仪表盘 KPI 数字为静态写死，后续可接入 `/api/dashboard/stats` 真实数据
