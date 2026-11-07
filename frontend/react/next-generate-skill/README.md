# Next.js Generate Skill

面向**前端开发者**的 Next.js 14+ App Router + TypeScript + Zustand 全栈项目一键初始化助手。

## 适合场景

- SEO 敏感的企业官网、营销落地页
- 需要 SSR/RSC 的后台管理系统
- 全栈应用（前后端同仓库，API Routes）
- 需要认证中间件的多角色系统

## 不适合场景

- 纯 SPA（无 SSR 需求） → 用 `react-generate-skill`
- 移动端 App → 用 `react-native-generate-skill`
- Pages Router 项目（已过时）
- 小程序 → 用 `uniapp-app-generate-skill`

## 快速上手

1. 对 AI 说："帮我做一个 Next.js 后台管理系统"
2. 回答 3-5 个澄清问题（项目定位、核心页面、视觉风格、UI 库、认证需求）
3. AI 按四阶段工作流自动生成项目骨架

## 技术栈一览

| 技术 | 版本 | 说明 |
|------|------|------|
| Next.js | 14+ | 全栈框架（App Router） |
| React | 18.x | UI 框架 |
| TypeScript | 5.x | 类型安全 |
| Zustand | 5.x | 状态管理（Client 侧） |
| Ant Design | 5.x | UI 组件库 |

## 触发词

- "帮我做一个 **Next.js** 项目"（注意是 Next.js，不是 Nuxt）
- "初始化 Next.js 模板"
- "用 **Next.js** 做一个 SSR 网站"
- "做一个 **Next.js** 后台管理系统"

> 完整触发词列表见 [SKILL.md](SKILL.md) description 字段。

## 详细规范

详见 [SKILL.md](SKILL.md)

## 目录说明

```
next-generate-skill/
├── SKILL.md                       # 技能定义（四阶段工作流）
├── README.md                      # 本文件
└── references/                    # 参考资料
    ├── project-structure.md       # 标准目录结构
    ├── claude-md-template.md      # CLAUDE.md 模板
    ├── agents-md-template.md      # AGENTS.md 模板
    ├── api-integration.md         # 三轨请求层集成
    ├── next-config-template.md    # next.config.js 配置
    ├── seo-strategy.md            # SEO 策略
    ├── middleware-auth.md         # 认证中间件
    ├── next-conventions.md        # 编码约定
    ├── component-standards.md     # 组件规范
    └── code-examples/             # 完整代码示例
        ├── types/
        ├── stores/
        ├── components/
        └── app/
```
