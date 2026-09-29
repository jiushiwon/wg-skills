# wg-skills — Agents Skills 集合（前后端一体化）

> **149 个** Claude Code / Cursor / Codex / 任意支持 Skill 协议的智能体技能，**全部公开、零门槛、MIT 协议**。
> 一句话触发，**完整可运行、可演进**的前后端项目，覆盖前端 4 套体系 × 后端 5 语言矩阵。

**🚁 想把一个想法变成上线的小程序？** → [itlifetime.com 7 天陪跑](https://itlifetime.com/services)（¥699 一次性，10 年经验手把手陪你做完）

---

## 这是什么

一个**自包含**的技能仓库。每个子目录是一个技能（`SKILL.md` + `README.md` + `references/`），用一句话触发，AI 智能体按"选型 → 骨架 → 业务模块 → 上线"的顺序串起来执行。

**不是** AI 一键生成的流水线玩具，**是** 10 年开发经验沉淀的可复用体系——真实项目跑过、迭代过、留下工程方法论的产物。

### 一句话定位

> **把"古法编程"容纳到 AI 体系之中**。AI 时代不是取代程序员，而是把传统工程中**重复、规范、体系化**的部分抽出来，沉淀成可被 AI 调用的技能，让人专注于业务决策与架构判断。

### 与"传统 AI 一键做项目"的区别

| 维度 | 传统 AI 一键做项目 | wg-skills |
|------|-------------------|-----------|
| **输出** | 一次性代码片段 | 完整可运行、可演进的项目 |
| **前后端** | 只生成一端 | 完整前后端 + 数据库，通过 `api-contract.md` 契约连接 |
| **文档** | 通常无 | 强制交付 `api-contract.md` + `docs/project-guide.md` |
| **前端体系** | 单一框架 | **4 套体系**：Vue / UniApp / React / HTML，共享 Design Token 与请求层 |
| **规范** | AI 自由发挥 | 技能强制约束（生成即遵守） |
| **中间件** | 通常无 | 内置部署套件（Docker / Nginx / Redis / Kafka / 数据库安装） |
| **学习曲线** | 一次性惊喜 | 可循序渐进的体系 |

---

## 149 个技能，按 6 大板块组织

| 板块 | 数量 | 业务定位 |
|------|------|---------|
| **[`vibeCoding/backend`](#后端)** | 48 | 5 语言后端矩阵 + 数据库 + 元工具 |
| **[`vibeCoding/frontend`](#前端)** | 70 | 4 套前端体系（Vue / UniApp / React / HTML）|
| **[`vibeCoding/super-deploy-skills`](#部署套件)** | 16 | 部署全栈（Docker / 原生 / 7 个 runtime 与 DB 安装）|
| **[`vibeCoding/vibecoding-guide-skill`](#vibecoding-工作流)** | 4 | Vibecoding 工作流（智能体协作 / 学习 / 访谈）|
| **[`vibeCoding/video`](#视频)** | 2 | FFmpeg / Remotion 视频处理 |
| **[`others`](#其他工具)** | 6 | AI 检测 / 人性化改写 / 技能审计 / 流程图 / 小红书写作 |

> 📂 项目级编排技能（开箱即用的完整项目骨架）：[`vibeCodingProjectsSkills/`](vibeCodingProjectsSkills/) — 3 个：Vue3 管理后台 / SSE Agent / 万能登录桥接

---

## 快速使用

```bash
# 克隆到 Claude Code 技能目录
git clone https://github.com/jiushiwon/wg-skills.git ~/.claude/skills/wg-skills
```

在 Claude Code 中即可触发，例如：

- 「帮我用 Java 搭一个商城」
- 「用 FastAPI 做一个 AI 聊天后端」
- 「用 Vue 做一个带登录的 CRUD 后台」
- 「帮我分析这个老后端项目，盘点接口」
- 「用 Docker 一键部署这个项目」

> 智能体会按"选型 → 骨架 → 业务模块 → 部署"的顺序串起多个技能，**小白也能跟着提示词完成一个完整项目**。

---

## 完整技能清单

### 后端

**48 个**，覆盖 5 语言后端 + 数据库 + 后端元工具。

#### Java 矩阵（12 个）

| 技能 | 说明 |
|------|------|
| `java-fast-skill` | Java 快速入门（小白友好） |
| `springboot-init-skill` | Spring Boot 一键初始化 |
| `springboot-module/`（10 个子技能） | 万能登录 API / auth / agent / dict / kafka / log / notification / org-permission / payment / redis / storage / upload |

#### Python 矩阵（13 个）

| 技能 | 说明 |
|------|------|
| `python-fast-skill` | Python 快速入门 |
| `fastapi-init-skill` | FastAPI 一键初始化 |
| `fastapi-module/`（14 个子技能） | auth / agent / ai-chat / dict / log / notification / org-permission / payment / storage / upload / ws / python-redis / python-kafka |
| `article-generator` | 多平台文章生成 |
| `hot-trend-collector` | 热点抓取工具 |

#### Go 矩阵（3 个）

| 技能 | 说明 |
|------|------|
| `go-gin-init-skill` | Go + Gin 一键初始化 |
| `go-frame-init-skill` | Go 多框架初始化（Hertz/Fiber/Chi） |
| `go-ws-module-skill` | Go WebSocket 模块 |
| `go-module/go-storage-module-skill` | Go 文件存储模块 |

#### Node.js / Rust 矩阵（2 个）

| 技能 | 说明 |
|------|------|
| `nodejs-init-skill` | Node.js + Express 一键初始化 |
| `rust-backend-skill` | Rust + Axum 后端初始化 |

#### 数据库矩阵（8 个）

| 技能 | 说明 |
|------|------|
| `database-design-skill` | 数据库设计规范（表名/索引/分库分表/性能） |
| `database-learning-skill` | 数据库学习与选型 |
| `mysql-guide-skill` | MySQL 模块集成 |
| `pgsql-guide-skill` | PostgreSQL 模块集成 |
| `mongodb-guide-skill` | MongoDB 模块集成 |
| `redis-guide-skill` | Redis 缓存/分布式锁 |
| `kafka-guide-skill` | Kafka 消息队列 |
| `sqlite-guide-skill` | SQLite 轻量数据库 |

#### 后端元工具（3 个）

| 技能 | 说明 |
|------|------|
| `backend-analysis-skill` | 后端项目静态分析（接口/技术/数据库/业务四份报告） |
| `backend-convention-skill` | 后端强制规范（响应信封/错误码/JWT） |
| `backend-select-skill` | 后端选型入口（语言/框架/数据库推荐） |

#### 公共规范层

`vibeCoding/backend/shared/` — 响应信封 / 错误码 / JWT / 分页 / API 契约模板（5 个规范）

---

### 前端

**70 个**，按 4 套体系组织。

#### Vue 体系（30 个）— SPA + SSR

**核心组件体系**（`vue-base-skill/` 父技能 + 22 个子技能）：

按钮 / 卡片 / 表格 / 表单 / 下拉 / 树 / 输入 / 选择 / 日期 / 复选 / 单选 / 开关 / 上传 / 列表页 / 列表项 / 右键菜单 / 折叠 / 状态 / 标签 / 综合 CRUD / 登录页 / 仪表盘

**配套规范**：

- `vue-theme-skill` — 设计 Token + 深色主题
- `vue-style-skill` — 样式规范（动画/工具类/布局）
- `vue-tui-skill` — TUI 终端界面
- `vue-generate-skill` — Vue 项目生成
- `nuxt-generate-skill` — Nuxt 3 + TS + Pinia 全栈（SSR/SEO）
- `electron-vue-init-skill` — Electron + Vue3 桌面端
- `universal-login-page` — 万能登录页（嵌入式）

#### UniApp 体系（16 个）— 跨端小程序

`uniapp-base-skill`（父技能，含表单/卡片/页面）+ 14 个独立技能：

- 项目类：`uniapp-app-generate-skill` / `uniapp-standard-skill`
- 规范类：`uniapp-style-skill` / `uniapp-theme-skill` / `request-skill`
- 鉴权类：`uniapp-auth-skill`
- 组件类：`uniapp-page-components-skill`
- 诊断类：`uniapp-diagnostic-skill` / `uniapp-code-audit-skill` / `uniapp-crossplatform-audit-skill` / `uniapp-vue2-upgrade-skill`
- UI 类：`uniapp-ui-replica-skill` / `uniapp-ui-component-commands-skill` / `uniapp-ui-template-builder-skill`

#### React 体系（3 个）

- `react-generate-skill` — React + TS + Vite
- `next-generate-skill` — Next.js 14+ App Router（全栈 SSR/RSC）
- `react-native-generate-skill` — React Native 移动端

#### HTML 体系（1 个）

- `html-frontend-template` — 纯 HTML 管理后台模板（**下一个重点建设方向**）

#### 综合前端（10 个）

- `frontend-code-doctor` — 前端代码审查
- `frontend-request-skill` — **4 套体系共用**请求层（响应信封 + 错误码 + Token 注入 + 防抖 + Mock + SSE）
- `frontend-style-harmonizer-skill` — 前端样式一致性
- `frontend-ui-foundry` — 综合前端 UI
- `frontend-icon-skill` — SVG 模板生成 + 图片处理
- `icon-image-catch-skill`（父 + 2 子）— 图标抓取 / 图片抓取

---

### 部署套件

**16 个**，覆盖从服务器到数据库的完整部署链路。

| 技能 | 说明 |
|------|------|
| `super-deploy-skills`（父技能） | 部署总入口 |
| `database-install-skill`（含 4 子） | MySQL / PostgreSQL / MongoDB / Redis 安装 |
| `runtime-install-skill`（含 4 子） | Go / Java / Node.js / Python 安装 |
| `deploy-detect-skill` | 部署环境画像检测 |
| `deploy-docker-skill` | Docker 编排 |
| `deploy-native-skill` | 原生部署 |
| `server-setup-skill` | 服务器初始化 |
| `static-nginx-skill` | Nginx 静态代理 |

---

### Vibecoding 工作流

**4 个**，是 AI 编程的方法论层（不只是工具）。

| 技能 | 说明 |
|------|------|
| `vibecoding-guide-skill` | Vibecoding 工作流总入口 |
| `agent-interview-skill` | 智能体需求访谈 |
| `agent-learning-skill` | 智能体学习引导 |
| `vibecoding-workflow-skill` | 完整工作流编排 |

---

### 视频

**2 个**，跨平台视频处理。

| 技能 | 说明 |
|------|------|
| `ffmpeg-skill` | FFmpeg 命令与脚本 |
| `remotion-skill` | Remotion React 视频 |

---

### 其他工具

**6 个**，覆盖写作、检测、流程图等领域。

| 技能 | 说明 |
|------|------|
| `ai-speech-detector` | AI 风检测（识别 AI 生成文本） |
| `humanizer` | 去除 AI 写作模式（35 个模式识别） |
| `skill-auditor` | Skill 安全审计 |
| `workflow-diagram-skill` | 一句话生成流程图 |
| `xhs-style-writer-skill` | 小红书个人风格写作 |
| `electron-native-abi-fix` | Electron 原生 ABI 修复 |

---

## 适用场景

### 场景 1：具体业务项目

| 项目类型 | 推荐技能组合 |
|---------|-------------|
| 🛒 商城系统 | `springboot-init-skill` + `payment-module` + `storage-module` + `vue-base-skill` + `vue-form-skill` |
| 📋 后台管理 | `springboot-init-skill` + `auth-module` + `vue-base-skill` + `vue-table-skill` + `vue-form-skill` |
| 📱 小程序 / App | `uniapp-base-skill` + `fastapi-init-skill` + `auth-module` |
| 💬 AI 聊天 | `vue-base-skill` + `frontend-request-skill` (SSE) + `fastapi-init-skill` + `agent-module` + `ai-chat-module` |
| 🎓 在线教育 | `springboot-init-skill` + `auth-module` + `vue-base-skill` + `vue-dashboard-skill` |

### 场景 2：老项目接手 / 重构

| 任务 | 推荐技能 |
|------|---------|
| 接手陌生项目 | `backend-analysis-skill`（产出 4 份报告：接口/技术/数据库/业务） |
| 前端代码优化 | `frontend-code-doctor` |
| 项目规范化 | `uniapp-diagnostic-skill` |
| Skill 自身审计 | `skill-auditor` |

### 场景 3：完整部署上线

`super-deploy-skills` 一键编排：`deploy-detect-skill` 探环境 → `database-install-skill` / `runtime-install-skill` 装依赖 → `deploy-docker-skill` 或 `deploy-native-skill` 编排 → `static-nginx-skill` 配反向代理

### 场景 4：学一门新语言

| 想学什么 | 触发技能 |
|---------|---------|
| ☕ Java | `java-fast-skill` / `springboot-init-skill` |
| 🐍 Python | `python-fast-skill` / `fastapi-init-skill` |
| 🐹 Go | `go-gin-init-skill` |
| 🎨 Vue | `vue-base-skill` / `vue-generate-skill` |
| 📱 UniApp | `uniapp-base-skill` 21 个组件 |
| ⚛️ React | `react-generate-skill` / `next-generate-skill` |

一句"帮我用 Java 搭一个商城"，智能体按"选型 → 骨架 → 业务模块"串起多个技能。

---

## 架构：前后端契约连接

```
用户触发一句话
"帮我做一个管理后台"
        │
   ┌────┼────┐
   │    │    │
前端层 后端层 数据库层
组件库  init-skill  design-skill
主题    module
请求层
样式
   │    │    │
   └──┬─┴──┘
      │
api-contract.md  ← 前后端唯一事实来源
      │
  ┌───┼───┐
  │   │   │
响应格式 错误码 接口清单
```

**4 套前端体系共享**：`frontend-request-skill`（请求层）+ Design Token 命名（`--color-primary-{50~950}` 完全对齐）

**5 语言后端共享**：`vibeCoding/backend/shared/`（响应信封 + 错误码 + JWT + 分页）

强制规则：每个 `init-skill` 必须生成 `api-contract.md`，每个 `module-skill` 必须输出 `api-contract-<module>.md`，前后端契约一致。

完整规范见 [`AGENTS.md`](AGENTS.md) 第十三节。

---

## 文档分层

| 文件 | 面向对象 | 看什么 |
|------|---------|-------|
| **`README.md`**（本文件） | 人类访客 / 潜在用户 | 仓库能干什么、怎么快速上手、有什么技能 |
| **[`AGENTS.md`](AGENTS.md)** | AI 智能体 + 维护者 | 完整规范、目录结构、开发原则、提交规范 |
| **[`CLAUDE.md`](CLAUDE.md)** | Claude Code | 入口（引用 `AGENTS.md`） |
| `各 skill/SKILL.md` | AI 智能体 | 触发条件、生成流程、输出规范、依赖 |
| `各 skill/README.md` | 人类用户 | 技能安装、快速上手、目录结构 |

> **禁止重叠**：`README.md` 不复制 `SKILL.md` 的能力清单或触发词列表（详见 `AGENTS.md` 第十三、五节）

---

## 适用与不适用

**✅ 适用**：
- 个人 / 小团队快速搭项目骨架（10 分钟 vs 1-2 天）
- 中小企业项目（商城 / 后台 / 小程序）
- 教学 / 学习场景（"一天学会 xxx 体系"）
- 老项目盘点、重构、迁移

**❌ 不适用**：
- 超大规模分布式系统（万级 QPS、复杂微服务编排）
- 嵌入式 / 硬件相关项目
- 对实时性 / 一致性有极端要求的金融核心系统
- 纯设计型项目（UI 套娃但无业务）

---

## 为什么开放 + 为什么 149 个

之前这个仓库是分层结构（精选 23 个公开 + 全量私有）。经过两轮迭代决定：

> **全部公开，全部免费**。技能文件本身不值钱，值钱的是"10 年经验如何把技能串成完整项目"。这部分能力不卖技能，是技能全部公开后——**陪跑服务**。

如果你看完这个 README 觉得"我能用这套技能搭一个项目"，那就是这个仓库的目的。

如果你想**跳过学习曲线，让一个老司机带你 7 天把想法变成上线的小程序**：

### 🚁 [itlifetime.com 7 天陪跑](https://itlifetime.com/services) — ¥699 一次性

- 7 天把一个想法变成**上线、能跑、能用**的 MVP（小程序 / 网站 / H5）
- 全程陪做，不是给资料让你自学
- 10 年经验判断（"这功能别做 / 这方案不要选"）
- 后续 30 天轻量答疑

> 加微信 **jiushiwon**，简单说明你的想法 + 预算即可。

---

## 贡献与规范

- 提交规范见 [`AGENTS.md`](AGENTS.md) 第七节（中文 commit message，直接推送 main）
- 新增 skill 必须更新 `AGENTS.md` 第三节目录结构 + `README.md` 对应板块
- `docs/` 目录本地沉淀，不进入版本控制

---

## 许可证

MIT License — 自由使用、修改、商用。