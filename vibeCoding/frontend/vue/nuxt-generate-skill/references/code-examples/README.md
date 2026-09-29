# code-examples

本目录包含 nuxt-generate-skill 生成项目时的参考代码示例。

## 目录说明

```
code-examples/
├── types/
│   ├── api.ts          # 后端统一响应信封类型
│   └── user.ts         # 用户相关接口定义
├── stores/
│   ├── user.ts         # 用户状态（Pinia Setup Store + SSR 安全存储）
│   └── app.ts          # 全局应用状态
├── components/
│   └── AppLayout.vue   # 管理后台布局组件
├── pages/
│   ├── login.vue       # 登录页（无布局）
│   └── users/
│       └── index.vue   # 用户列表页（SSR 数据预取）
└── server/api/
    ├── auth/
    │   └── login.post.ts   # 登录 API Route（cookie 写入）
    └── users/
        └── index.get.ts    # 用户列表 API Route（分页查询）
```

## 使用说明

- 代码仅作参考，生成项目时根据实际需求调整
- 类型定义应放在 `types/` 目录，保持与实际后端接口对齐
- Store 使用 Pinia Setup Store + Nuxt SSR 安全存储（useCookie / useState）
- API Route 使用 H3 原生 API，不依赖 Express/Koa
