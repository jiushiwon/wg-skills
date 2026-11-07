# nuxt-generate-skill

Nuxt 3 + TypeScript + Pinia 全栈项目骨架生成技能。引导完成从需求澄清到后置验证的完整流程。

## 适合场景

- 管理后台（SSR + BFF API 代理）
- 企业官网（SSG 静态生成 + SEO 优化）
- 内容型网站（SSR + 结构化数据）
- 需要 SEO 的全栈应用

## 不适合场景

- 纯 SPA 应用（无 SSR 需求）→ 使用 vue-generate-skill
- 静态文档站 → 使用 VitePress / Nuxt Content
- 移动端 App → 使用 UniApp 相关技能

## 快速上手

1. 触发技能后，回答需求澄清问题（项目类型、UI 框架、认证方式等）
2. 确认技术方案，技能自动执行项目初始化
3. 完成开发后通过 `nuxt typecheck` + `nuxt build` 验证

## 技术栈

| 层级 | 技术 |
|------|------|
| 框架 | Nuxt 3 + Vue 3 Composition API |
| 语言 | TypeScript（strict） |
| 状态 | Pinia Setup Store |
| UI | Element Plus 或 Nuxt UI |
| 请求 | frontend-request-skill 规范 + $fetch |
| SEO | useHead / useSeoMeta / sitemap / robots |
| 认证 | JWT + Cookie + 中间件 |
| BFF | server/api/ + H3 |

## 触发词

- "帮我做一个 **Nuxt** 项目"（注意是 Nuxt，不是 Next.js）
- "初始化 Nuxt3 模板"
- "用 **Nuxt** 做一个 SSR 网站"
- "做一个 **Nuxt** 后台管理系统"

> 完整触发词列表见 [SKILL.md](SKILL.md) description 字段。

## 依赖技能

- **frontend-request-skill**（强依赖） — 客户端请求层规范
- **vue-base-skill**（可选） — 基础组件复用

## 详细规范

→ [SKILL.md](SKILL.md)

## 目录结构

```
nuxt-generate-skill/
├── SKILL.md                       # 技能定义（四阶段工作流）
├── README.md                      # 本文件
└── references/                    # 参考资料
    ├── project-structure.md       # Nuxt 3 标准目录结构
    ├── claude-md-template.md      # CLAUDE.md 模板
    ├── agents-md-template.md      # AGENTS.md 模板
    ├── api-integration.md         # SSR 双轨请求策略
    ├── nuxt-config-template.md    # nuxt.config.ts 配置
    ├── seo-strategy.md            # SEO 策略
    ├── middleware-auth.md         # 认证中间件
    ├── server-api-routes.md       # BFF API 层
    ├── nuxt-conventions.md        # 编码约定
    ├── component-standards.md     # 组件规范
    └── code-examples/             # 完整代码示例
        ├── types/                 # 响应信封 + 用户类型
        ├── stores/                # Pinia SSR 安全 Store
        ├── components/            # 布局组件
        ├── pages/                 # 页面（login + users）
        └── server/api/            # BFF API Routes
```
