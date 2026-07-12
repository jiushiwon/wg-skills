# wg-skills 🛠️

> Claude Code 技能集合，让 AI 更懂你的开发需求

## 什么是 Skills？

Skills 是 Claude Code 的能力扩展，通过预先定义的规则和指令，让 AI 在特定场景下表现更专业、更精准。

每个 Skill 包含：
- **触发条件**：什么情况下调用
- **审查/生成规则**：具体的检查维度或实现步骤
- **输出格式**：标准化的结果呈现
- **参考资料**：相关的技术文档与规范

## 🚀 快速开始

### 安装 Skills

skills 已经随 Claude Code 一起安装，无需额外操作。

### 使用方式

直接告诉 Claude 你要做什么：

```
帮我审查前端代码
检测这段文案有没有AI风
帮我做一个 uniapp 小程序
生成后端项目
```

Claude 会根据你的需求自动匹配并调用对应的 Skill。

### 显示可用技能

```
/skill list
```

或

```
有哪些技能
```

---

## 📦 当前可用 Skills

### 1. frontend-code-doctor 🩺

> 前端代码审查技能

**功能**：自动检测前端代码质量问题、性能问题、安全漏洞。

**使用场景**：
- 审查 Vue/React/uni-app 项目代码
- 检查 TypeScript 类型安全
- 发现性能问题和内存泄漏
- 检测安全漏洞（XSS、CSRF、敏感信息泄露）
- 审查 i18n 和 Accessibility

**使用方式**：

```
/frontend-code-doctor
```

或

```
/frontend-code-review
帮我审查下这个前端项目
看看代码有什么问题
```

**详细文档**：[frontend-code-doctor/README.md](frontend-code-doctor/README.md)

---

### 2. ai-speech-detector 🗣️

> AI 风检测技能

**功能**：检测文案中的 AI 风味词汇、套话、车轱辘话，提供量化评分、领域适配、风格校准和一键修复。

**使用场景**：
- 检测文章是否 AI 生成
- 公众号审稿
- 简历/面试文书检查
- 电商文案优化
- 社媒内容审核

**使用方式**：

```
/ai-speech-detector
```

或

```
帮我检测下这篇文章的AI风
看看像不像AI写的
去除这段文字的AI味
```

**详细文档**：[ai-speech-detector/README.md](ai-speech-detector/README.md)

---

### 3. frontend-ui-foundry 🎨

> 综合前端 UI 技能：按场景生成 / 一键优化 / Token 统一 / 品牌套用

**功能**：8 大场景 × 10 套调色板 × 58 个品牌 × 6 大技术栈的端到端 UI 工具链。提供 `forge`（从零生成）、`optimize`（智能重构）、`audit`（设计+代码审查）、`tokens`（设计资产管理）、`unify`（多页面变体收敛）、`brand`（品牌套用）、`scenario`（场景方案）、`stack`（技术栈最佳实践）共 8 个子命令。

**使用场景**：
- 从零生成新项目（落地页/官网/后台/文档/金融/3D 等）
- 智能重构现有项目（Vue/React/uniapp/HTML）
- 提取并统一设计 Token（颜色/字体/间距/圆角/动效）
- 套用品牌风格（Stripe/Linear/Vercel/Apple/Claude 等）
- 审查项目 AI slop 与可访问性

**使用方式**：

```
/frontend-ui-foundry
```

或自然语言：

```
用 foundry 帮我做一个营销落地页，用 Stripe 风格
用 foundry 优化我当前项目
用 foundry 审查这个项目
```

**8 个子命令速查**：

| 命令 | 干什么 | 例子 |
|------|--------|------|
| `forge` | 从零生成 | `forge landing-marketing --brand stripe --stack react-nextjs` |
| `optimize` | 智能重构 | `optimize --strategy gradual` |
| `audit` | 设计+代码审查 | `audit --depth deep` |
| `tokens` | Token 提取/导出 | `tokens export tailwind` |
| `unify` | 多页面统一 | `unify --scope pages` |
| `brand` | 套用品牌 | `brand apple ./my-project` |
| `scenario` | 查看场景方案 | `scenario admin-dashboard` |
| `stack` | 查看栈方案 | `stack react-nextjs` |

**详细文档**：[frontend-ui-foundry/README.md](frontend-ui-foundry/README.md)（安装说明 + 8 子命令 + 完整资源索引）

---

### 4. backend-generate-skill 🖥️

> 后端项目骨架生成技能集合（父目录 + 7 嵌套子技能）

**功能**：从零生成标准化后端项目，按职责拆成 7 个子 skill：

| 子 skill | 职责 | 触发关键词 |
|----------|------|-----------|
| [backend-select-skill](backend-generate-skill/backend-select-skill/) | 入口：问答选型、分流 | `生成后端项目`、`backend generate` |
| [backend-convention-skill](backend-generate-skill/backend-convention-skill/) | 公共规范：响应信封、错误码、api-contract | `后端规范`、`api 契约` |
| [java-backend-skill](backend-generate-skill/java-backend-skill/) | Spring Boot 项目生成 | `用 Java 写后端`、`Spring Boot` |
| [go-backend-skill](backend-generate-skill/go-backend-skill/) | Gin 项目生成 | `用 Go 写后端`、`Gin 项目` |
| [python-backend-skill](backend-generate-skill/python-backend-skill/) | FastAPI 项目生成 | `用 Python 写后端`、`FastAPI` |
| [nodejs-backend-skill](backend-generate-skill/nodejs-backend-skill/) | Express / NestJS 项目生成 | `用 Node 写后端`、`Express`、`NestJS` |
| [database-skill](backend-generate-skill/database-skill/) | PG/MySQL/Mongo 选型与迁移 | `数据库选型`、`schema 设计` |

**使用场景**：
- 新建后端服务
- 搭建后端 API 骨架
- 为 uni-app 前端生成配套后端
- 统一团队后端项目结构与接口规范

**使用方式**：

```
生成后端项目              # 进入选型 skill，问答后分流
用 Java 写后端            # 直接进入 java-backend-skill
用 FastAPI 写一个后端     # 直接进入 python-backend-skill
后端规范                  # 进入 convention skill
数据库选型                # 进入 database skill
```

**设计原则**：
- 拆分不删除：原 7 套 boilerplate 全部转为现场生成，能力不丢失
- 公共规范单一来源：响应信封、错误码、契约只在 `backend-convention-skill` 定义
- 版本不腐烂：不再维护写死版本号，生成时查询官方源
- 强制双文档：每个生成项目必带 `api-contract.md`（接口 md，前后端唯一事实来源）+ `docs/project-guide.md`（介绍 & 拓展性文档：技术栈/对接前端/接口范式/拦截器/出入参）

**详细文档**：[backend-generate-skill/README.md](backend-generate-skill/README.md)

---

### 5. uniapp-app-generate-skill 📱

> uni-app 项目生成技能

**功能**：从零生成标准化 uni-app 项目，支持微信小程序、H5、App 三端。基于 Vue3 + TypeScript + Pinia + SCSS，内置主题色阶（含色阶外颜色硬卡）、强制复用组件库、跨平台抽象层、自定义导航栏（胶囊独占一行）、静态资源规范与一键自检。

**使用场景**：
- 新建微信小程序/H5/App 三端应用
- 快速搭建小程序标准目录与规范
- 为后端接口生成配套前端

**使用方式**：

```
/uniapp-app-generate-skill
```

或自然语言：

```
帮我做一个 uniapp 小程序
初始化一个微信小程序项目
用 uniapp 搭建一个商城小程序
```

**详细文档**：[uniapp-app-generate-skill/README.md](uniapp-app-generate-skill/README.md)

---

### 6. icon-forge 🎨

> 图标生成技能

**功能**：把 SVG path 或完整 SVG 批量渲染成 PNG。适合 uni-app / 小程序 / React Native / H5 等需要成套单色 PNG 图标的场景。

**使用场景**：
- 批量生成 tabBar 图标
- 生成登录页功能图标
- 统一应用图标风格与尺寸

**使用方式**：

```
/icon-forge
```

或自然语言：

```
生成图标
做一套图标
生成 png 图标
给我加几个图标
```

**详细文档**：[icon-forge/README.md](icon-forge/README.md)

---

### 7. super-deploy-skills 🚀

> 一键部署技能套件（父技能 + 5 个子技能，统一放在 `super-deploy-skills/` 目录下）

**功能**：从「检测项目技术栈」到「服务器装环境」到「生成部署脚本/Docker」一条龙。包含 5 个子技能，通过共享的 `deploy-profile.md` 串联：

| 子技能 | 职责 |
|--------|------|
| [deploy-detect-skill](super-deploy-skills/deploy-detect-skill/) | 检测项目语言/框架/数据库，生成 `deploy-profile.md` |
| [server-setup-skill](super-deploy-skills/server-setup-skill/) | 检测服务器环境，按画像装依赖（含预置安装脚本 `install.sh`/`install.ps1`） |
| [static-nginx-skill](super-deploy-skills/static-nginx-skill/) | 前端 Vue/React 静态产物 Nginx 托管配置 |
| [deploy-native-skill](super-deploy-skills/deploy-native-skill/) | 原生部署脚本（含预置 `launch.sh`/`launch.ps1` + systemd/pm2 模板） |
| [deploy-docker-skill](super-deploy-skills/deploy-docker-skill/) | Dockerfile + docker-compose 生成 |

**使用场景**：
- Node.js / Python / Java / Go 后端服务部署
- Vue / React 前端静态资源 Nginx 托管
- 服务器环境检测与依赖补齐（JDK/Node/Python/Go/Nginx/Docker）
- 原生（pm2/systemd/nohup）或 Docker 两种部署方式

**使用方式**：

```
/super-deploy-skills
```

或自然语言：

```
帮我部署这个项目
一键部署到服务器
用 Docker 部署
用原生脚本部署
```

**详细文档**：[super-deploy-skills/README.md](super-deploy-skills/README.md)（含完整使用走查）

---

### 8. backend-analysis-skill 🔍

> 后端项目全景分析技能：不运行项目，静态扫描源码，一次产出 4 份报告

**功能**：接手陌生后端项目时，一次回答四个问题——**有哪些接口？用了什么技术？数据库长什么样？业务怎么跑？** 支持 Java(Spring Boot/Cloud)、Go(Gin/Echo)、Python(FastAPI/Django/Flask)、Node.js(Express/NestJS)。

| 报告 | 内容 |
|------|------|
| `01-api-report.md` | 全部 API 清单：方法/路径/入参/出参/鉴权 + 无鉴权接口预警 |
| `02-tech-report.md` | 语言框架版本、中间件（Redis/MQ/ES）、第三方 API（短信/支付/推送）、架构组件（拦截器/全局异常/跨域）、安全隐患 |
| `03-database-report.md` | 数据库类型、表清单、核心表结构、迁移脚本、Redis 缓存设计 |
| `04-business-report.md` | 模块划分、核心业务流程（带调用链）、定时任务、对外集成点 |
| `00-overview.md` | 项目画像 + 规模统计 + Top 风险 + 接手阅读顺序 |

**特点**：项目跑不起来也能分析（纯静态扫描）；每条结论标注来源 `file:line`；密钥密码自动打码；报告默认写入目标项目 `docs/backend-analysis/`。

**使用场景**：
- 接手老项目、新人 onboarding
- 补交接文档、接口文档、数据字典
- 技术盘点、重构/迁移前摸底

**使用方式**：

```
帮我分析下这个后端项目，出完整报告
梳理下这个项目所有接口
盘点下技术栈和第三方服务
出一份数据库文档
```

**详细文档**：[backend-analysis-skill/README.md](backend-analysis-skill/README.md)

---

### 9. icon-image-catch-skill 🖼️

> 远程素材抓取套件（父技能 + 2 个子技能）：说「一只猫的图片」就去找猫的图，说「home 图标」就去找合适的 home icon

**功能**：根据自然语言语义，动态从远程抓取**专业图标**与**正版高清图片**，根治 VibeCoding 页面两大顽疾：粗糙 Emoji 图标 + 渐变占位。

| 子技能 | 职责 | 数据源 | 配置 |
|--------|------|--------|------|
| [icon-catch-skill](icon-image-catch-skill/icon-catch-skill/) | 语义搜图标 → 下载 SVG（可换色/改尺寸） | Iconify（20 万+ 图标，含 lucide/tabler/heroicons 等 100+ 图标集） | **零配置，免费无需 Key** |
| [image-catch-skill](icon-image-catch-skill/image-catch-skill/) | 语义搜图片 → 下载高清图，三源自动降级 | Pexels / Pixabay / Unsplash | 免费 Key，1 分钟申请 |

**使用场景**：
- 把页面中的 Emoji 全部替换为专业图标
- 给 Hero 区域 / 卡片 / banner 配真实高清图片
- 批量抓取成套图标（tabBar、功能入口）

**使用方式**：

```
帮我抓一个 home 图标，放到 static/icons
给首页 Hero 区域抓一张科技感办公背景图
把这个页面的 Emoji 全部换成 lucide 风格的专业图标
```

**详细文档**：[icon-image-catch-skill/README.md](icon-image-catch-skill/README.md)

---

## 📋 Skill 一览

| Skill | 说明 | 触发关键词 |
|------|------|-----------|
| [frontend-code-doctor](frontend-code-doctor/) | 前端代码审查 | `审查代码`、`code review` |
| [ai-speech-detector](ai-speech-detector/) | AI 风检测 | `AI风`、`AI味`、`像AI写的` |
| [frontend-ui-foundry](frontend-ui-foundry/) | 综合前端 UI | `生成 UI`、`优化项目`、`Token 统一` |
| [backend-generate-skill](backend-generate-skill/) | 后端项目骨架生成（7 子技能：选型/规范/Java/Go/Python/Node/数据库） | `生成后端`、`backend generate`、`用 Java/Go/Python/Node 写后端` |
| [uniapp-app-generate-skill](uniapp-app-generate-skill/) | uni-app 项目生成 | `uniapp 小程序`、`初始化微信小程序` |
| [icon-forge](icon-forge/) | 图标生成 | `生成图标`、`icon 生成`、`png 图标` |
| [super-deploy-skills](super-deploy-skills/) | 一键部署套件（5 子技能：检测/装机/Nginx/原生/Docker） | `部署项目`、`一键部署`、`deploy`、`Docker 部署` |
| [backend-analysis-skill](backend-analysis-skill/) | 后端项目全景分析（接口/技术栈/数据库/业务 4 份报告） | `分析后端项目`、`梳理接口`、`盘点技术栈`、`出数据库文档`、`接手老项目` |
| [icon-image-catch-skill](icon-image-catch-skill/) | 素材抓取套件（2 子技能：图标抓取 Iconify 免 Key / 图片抓取 Pexels·Pixabay·Unsplash 自动降级） | `抓图标`、`下载 icon`、`抓图片`、`找配图`、`背景图` |

> 注：`demo/foundry-demo` 是 [frontend-ui-foundry](frontend-ui-foundry/) 的端到端示例，不是独立 Skill。
> 注：`super-deploy-skills` 是父技能，包含 5 个子技能，统一放在 `super-deploy-skills/` 目录下；`deploy-detect-skill` 是其余子技能的共享前置。

---

## 🔗 部署技能套件组合使用

5 个部署技能通过共享的 `deploy-profile.md` 串联，典型流程：

```
1. deploy-detect-skill      检测项目技术栈 → 生成 deploy-profile.md
2. server-setup-skill       检测服务器环境 → 对比画像 → 生成/执行安装命令
3. static-nginx-skill       (仅前端项目) 配置 Nginx 托管静态产物
4a. deploy-native-skill     二选一：生成原生部署脚本（systemd/pm2/...）
4b. deploy-docker-skill     二选一：生成 Dockerfile + docker-compose.yml
5. (可选) 配置自动重新检测   git hook / CI 在代码变更后刷新 deploy-profile.md
```

自然语言示例：

```
帮我部署这个项目                    → 触发 deploy-detect-skill
检测下服务器能不能跑                → 触发 server-setup-skill
用 Docker 部署                      → 触发 deploy-docker-skill（读画像）
用原生脚本部署                      → 触发 deploy-native-skill（读画像）
前端用 Nginx 托管                   → 触发 static-nginx-skill（读画像）
代码更新了，重新检测下部署画像       → 再次触发 deploy-detect-skill
```

**关键约定**：

- 父技能 `super-deploy-skills` 是统一入口，按意图路由到 5 个子技能（位于 `super-deploy-skills/` 目录下）。
- 所有技能默认**只生成脚本/命令，不自动执行**；执行安装或部署需二次确认。
- **数据库初始化永不自动执行**，由用户审查命令后手动跑。
- **端口统一 `APP_PORT`**（默认 8080），贯穿启动脚本、systemd/pm2、Dockerfile、Nginx；详见 [script-standards.md](super-deploy-skills/deploy-native-skill/references/script-standards.md)。
- **预置脚本**：装机用 [`install.sh`](super-deploy-skills/server-setup-skill/assets/install.sh) / [`install.ps1`](super-deploy-skills/server-setup-skill/assets/install.ps1)，部署用 [`launch.sh`](super-deploy-skills/deploy-native-skill/assets/launch.sh) / [`launch.ps1`](super-deploy-skills/deploy-native-skill/assets/launch.ps1)，统一日志格式 `[时间] [级别] 消息`。
- 项目变更后重新跑 `deploy-detect-skill` 即可刷新画像，无需手动改文档。

完整使用走查见 [super-deploy-skills/README.md](super-deploy-skills/README.md)。

---

## ➕ 添加新 Skill

### 方式一：手动创建

```
wg-skills/
├── new-skill/
│   ├── SKILL.md          # 必须：技能定义
│   ├── README.md         # 可选：使用文档
│   └── references/       # 可选：参考规则
│       └── xxx-rules.md
```

### SKILL.md 必填字段

```yaml
---
name: skill-name
description: 技能的简短描述
---

# Skill Title

## 使用方式
xxx

## 审查维度
xxx
```

### 方式二：使用 skill-creator

直接告诉 Claude：

```
帮我创建一个 xxx 技能
```

---

## 📁 项目结构

```
wg-skills/
├── README.md                   # 本文件：仓库总览
├── CLAUDE.md                   # 项目级规范
├── .claudeignore               # Claude 索引忽略配置
├── .gitignore
├── LICENSE
├── frontend-code-doctor/       # 前端代码审查技能
│   ├── SKILL.md
│   ├── README.md
│   └── references/
│       ├── typescript-rules.md
│       ├── vue3-rules.md
│       ├── react-rules.md
│       ├── security-rules.md
│       ├── i18n-rules.md
│       ├── a11y-rules.md
│       ├── performance.md
│       └── uniapp-rules.md
├── ai-speech-detector/         # AI 风检测技能
│   ├── SKILL.md
│   ├── README.md
│   └── references/
│       ├── ai-words.md
│       ├── english-words.md
│       ├── structural-patterns.md
│       ├── domain-patterns.md
│       ├── mixed-language.md
│       └── voice-calibration.md
├── frontend-ui-foundry/        # 综合前端 UI 技能
│   ├── SKILL.md
│   ├── README.md
│   ├── docs/                   # 完整使用文档
│   ├── references/             # 知识库（tokens / scenarios / brands / stacks / commands）
│   ├── scripts/                # 工具脚本
│   ├── templates/              # Token 模板
│   └── demo/                   # 端到端验证
├── backend-generate-skill/     # 后端项目骨架生成技能集合（父目录 + 7 嵌套子技能）
│   ├── SKILL.md
│   ├── README.md
│   ├── backend-select-skill/        # 选型入口：问答 → 推荐 → 分流
│   │   ├── SKILL.md
│   │   ├── README.md
│   │   └── references/tech-stack-decision-matrix.md
│   ├── backend-convention-skill/    # 公共规范：响应信封/错误码/契约/项目模板
│   │   ├── SKILL.md
│   │   ├── README.md
│   │   └── references/
│   │       ├── response-format.md
│   │       ├── api-contract-spec.md
│   │       ├── default-api-contract.md     # 默认接口 md 模板（生成 api-contract.md 的起点）
│   │       ├── project-guide-template.md   # 介绍&拓展性文档模板（生成 docs/project-guide.md）
│   │       ├── env-config-guide.md
│   │       ├── versions-template.md
│   │       ├── claude-md-template.md
│   │       └── agents-md-template.md
│   ├── java-backend-skill/          # Spring Boot 生成器
│   │   ├── SKILL.md
│   │   ├── README.md
│   │   └── references/
│   │       ├── skeleton.md          # 含 project-guide 填充段
│   │       └── middleware.md        # Redis/Kafka/RabbitMQ/Actuator 接入指引
│   ├── go-backend-skill/            # Gin 生成器
│   │   ├── SKILL.md
│   │   ├── README.md
│   │   └── references/skeleton.md   # 含 project-guide 填充段
│   ├── python-backend-skill/        # FastAPI 生成器
│   │   ├── SKILL.md
│   │   ├── README.md
│   │   └── references/skeleton.md   # 含 project-guide 填充段
│   ├── nodejs-backend-skill/        # Express / NestJS 生成器
│   │   ├── SKILL.md
│   │   ├── README.md
│   │   └── references/
│   │       ├── skeleton-express.md  # 含 project-guide 填充段
│   │       └── skeleton-nestjs.md   # 含 project-guide 填充段
│   └── database-skill/              # PG/MySQL/Mongo 选型与迁移
│       ├── SKILL.md
│       ├── README.md
│       └── references/
│           ├── base-schemas.md
│           └── migration-guide.md
├── uniapp-app-generate-skill/  # uni-app 项目生成技能
│   ├── SKILL.md
│   ├── README.md
│   ├── assets/
│   │   └── boilerplate/        # 可直接运行的 uni-app 项目模板
│   └── references/
│       ├── agents-md-template.md
│       ├── claude-md-template.md
│       ├── component-standards.md
│       ├── cross-platform-compatibility.md
│       ├── design-skills-guide.md
│       ├── layout-patterns.md
│       ├── mini-program-checklist.md
│       ├── pexels-integration.md
│       ├── project-structure.md
│       ├── static-assets-guide.md
│       ├── theme-system.md
│       └── wechat-common-patterns.md
├── icon-forge/                 # 图标生成技能
│   ├── SKILL.md
│   ├── README.md
│   ├── forge-icons.js          # 基于 sharp 的 PNG 渲染器
│   ├── package.json
│   └── svgs/                   # 示例 SVG 源文件
├── super-deploy-skills/        # 一键部署技能套件（父技能 + 5 子技能）
│   ├── SKILL.md                # 父入口：路由规则
│   ├── README.md               # 完整使用走查
│   ├── deploy-detect-skill/    # 子技能：项目技术栈检测
│   │   ├── SKILL.md
│   │   ├── README.md
│   │   └── references/
│   │       ├── detection-rules.md
│   │       ├── profile-spec.md
│   │       └── auto-redetect.md
│   ├── server-setup-skill/     # 子技能：服务器环境检测与依赖安装
│   │   ├── SKILL.md
│   │   ├── README.md
│   │   ├── assets/
│   │   │   ├── install.sh      # Linux 幂等安装脚本
│   │   │   └── install.ps1     # Windows 幂等安装脚本
│   │   └── references/
│   │       ├── os-detection.md
│   │       ├── install-commands.md
│   │       └── database-setup.md
│   ├── static-nginx-skill/     # 子技能：前端 Nginx 托管
│   │   ├── SKILL.md
│   │   ├── README.md
│   │   └── references/
│   │       └── nginx-config-spec.md
│   ├── deploy-native-skill/    # 子技能：原生部署
│   │   ├── SKILL.md
│   │   ├── README.md
│   │   ├── assets/
│   │   │   ├── launch.sh       # Linux 部署脚本
│   │   │   ├── launch.ps1      # Windows 部署脚本
│   │   │   ├── my-api.service  # systemd 模板
│   │   │   └── ecosystem.config.js  # pm2 模板
│   │   └── references/
│   │       ├── script-standards.md
│   │       └── script-pipeline.md
│   └── deploy-docker-skill/    # 子技能：Docker 部署
│       ├── SKILL.md
│       ├── README.md
│       └── references/
│           └── dockerfile-spec.md
├── backend-analysis-skill/     # 后端项目全景分析技能（4 份报告）
│   ├── SKILL.md
│   ├── README.md
│   └── references/
│       ├── detection-rules.md        # 语言/框架/ORM/数据库识别规则
│       ├── api-scan-patterns.md      # 各框架接口扫描模式
│       ├── tech-scan-patterns.md     # 中间件/第三方API/架构组件/安全隐患扫描
│       ├── database-scan-patterns.md # 各 ORM 实体扫描 + SQL/迁移收集
│       └── report-templates.md       # 4 份报告 + 总览的输出模板
├── icon-image-catch-skill/     # 素材抓取套件（父技能 + 2 子技能）
│   ├── SKILL.md                # 父入口：意图判断与路由
│   ├── README.md
│   ├── .env.example            # 图片源 API Key 模板
│   ├── icon-catch-skill/       # 子技能：图标抓取（Iconify，免 Key）
│   │   ├── SKILL.md
│   │   ├── README.md
│   │   ├── scripts/icon-catch.js    # 零依赖抓取脚本
│   │   └── references/icon-sources.md
│   └── image-catch-skill/      # 子技能：图片抓取（三源自动降级）
│       ├── SKILL.md
│       ├── README.md
│       ├── scripts/image-catch.js   # 零依赖抓取脚本
│       └── references/image-sources.md
└── demo/
    └── foundry-demo/           # frontend-ui-foundry 端到端示例
        ├── index.html
        ├── assets/css/tokens.css
        ├── tailwind.config.js
        ├── README.md
        └── forge-report.md
```

---

## 🤝 贡献

欢迎提交新的 Skill！

1. Fork 项目
2. 创建新技能目录（kebab-case）
3. 添加 `SKILL.md` 和 `README.md`
4. 按需创建 `references/`
5. 更新根目录 `README.md` 的「当前可用 Skills」与「Skill 一览」表格
6. 提交 Pull Request

---

## 📄 License

MIT License
