# wg-skills 🛠️

> **Agents Skills 集合 —— 让 AI 时代的编程更高效、更体系、更可进阶**
>
> 任何智能体（Claude / Codex / Workbuddy / OpenCode / VS Code / Cursor / Cline / Kimi 等）都可以加载并使用本仓库的技能。

[![Skills](https://img.shields.io/badge/skills-50%2B-blue)]() [![Blocks](https://img.shields.io/badge/blocks-3-success)]() [![Agents](https://img.shields.io/badge/agents-multi--platform-orange)]()

---

## 🎯 核心理念

> **将"古法编程"容纳到 AI 体系之中。**

AI 时代的编程不是"取代程序员"，而是把传统工程中**重复、规范、体系化**的部分抽出来，沉淀成可被 AI 调用的技能，让人类专注于业务决策与架构判断。

| 古法编程痛点 | Agents Skills 解决方案 |
|------------|----------------------|
| 写一个 CRUD 接口要半天 | 一句话触发（5 分钟） |
| 搭后端骨架要 1-2 天 | 触发 `xxx-init-skill`（10 分钟） |
| 学一门新语言要 1-2 周 | 触发"一天学会 xxx 体系"技能（半天） |
| 多人风格不统一 | 技能强制规范（生成即遵守） |
| 项目迭代是历史债 | 技能可平滑升级（向下兼容） |

---

## 🧩 三大板块

本仓库将所有技能按业务域划分为 **3 个板块**，**不分散布局**：

### 🎯 板块一：`vibeCoding/` —— 编程开发（85%）

> 覆盖前后端、数据库、部署、AI 编程教学，让**古法编程升级为 AI 体系化编程**。

#### 1.1 `vibeCoding/backend/` —— 后端语言矩阵

> 一句话选型 + 一键生成 + 业务模块叠加，覆盖 Java / Python / Go / Node.js 四大语言。

| 技能 | 用途 | 触发词 |
|------|------|--------|
| `springboot-init-skill/` | Spring Boot 一键初始化（Java 小白友好） | "帮我搭 Spring Boot"、"Java 初始化" |
| `java-auth-module-skill/` | Spring Boot 组织与鉴权 | "加 RBAC"、"组织权限" |
| `fastapi-init-skill/` | FastAPI 一键初始化（Python 小白友好） | "帮我搭 FastAPI"、"Python 后端" |
| `fastapi-auth-module-skill/` | FastAPI 组织与鉴权 | "FastAPI 加权限"、"RBAC" |
| `fastapi-ws-module-skill/` | FastAPI WebSocket 即时通讯 | "WebSocket 聊天"、"IM 模块" |
| `fastapi-agent-module-skill/` | FastAPI + LangGraph AI Agent | "AI Agent 服务"、"LangGraph" |
| `backend-analysis-skill/` | 后端项目全景分析 | "分析这个后端项目" |
| `backend-generate-skill/` | 后端骨架生成（**父技能 + 7 子技能**） | "生成后端骨架"、"后端选型" |
| `module-generate-skill/` | 后端业务模块生成（**父技能 + 5 子技能**） | "加鉴权模块"、"加支付模块" |

#### 1.2 `vibeCoding/frontend/` —— 前端框架矩阵

> 覆盖 uni-app / Vue / 通用前端，组件库、请求层、样式规范全部沉淀。

| 技能 | 用途 | 触发词 |
|------|------|--------|
| `frontend-code-doctor/` | 前端代码审查 | "审查前端代码" |
| `frontend-request-skill/` | 前端请求层规范 | "请求层"、"axios 封装" |
| `frontend-style-harmonizer-skill/` | 前端样式一致性治理 | "统一样式"、"样式审查" |
| `frontend-ui-foundry/` | 综合前端 UI 工厂 | "做 UI"、"组件库" |
| `icon-image-catch-skill/` | 素材抓取（**父技能 + 2 子技能**） | "抓图标"、"抓图片" |
| `image-forge-skill/` | 图片处理 + 图标生成 | "生成图标"、"处理图片" |
| `uniapp/` | **uni-app 技能矩阵（15+ skill）** | "做 uni-app"、"小程序" |
| └─ `uniapp-base-skill/` | uni-app 基础（**含 21 个组件**） | "uniapp 基础组件" |
| └─ `uniapp-app-generate-skill/` | uni-app 项目生成 | "生成 uni-app 项目" |
| └─ `uniapp-standard-skill/` | 开发通用规范 | "uniapp 规范" |
| └─ `uniapp-style-skill/` | 设计系统 | "uniapp 样式" |
| └─ `uniapp-theme-skill/` | 主题系统 | "uniapp 主题" |
| └─ `uniapp-components-skill/` | 登录鉴权与安全 | "uniapp 登录" |
| └─ `uniapp-page-components-skill/` | 组件化页面 | "uniapp 页面" |
| └─ `uniapp-request-skill/` | 请求层设计 | "uniapp 请求" |
| └─ `uniapp-standardization-skill/` | 项目规范化 | "uniapp 规范项目" |
| └─ `uniapp-code-audit-skill/` | 代码审计 | "uniapp 审计" |
| └─ `uniapp-crossplatform-audit-skill/` | 跨平台兼容审计 | "uniapp 跨平台" |
| └─ `uniapp-vue2-upgrade-skill/` | Vue2 → Vue3 升级 | "Vue2 升级" |
| └─ `uniapp-ui-replica-skill/` | UI 原型图复刻 | "复刻 UI" |
| └─ `uniapp-ui-component-commands-skill/` | UI 组件指令 | "UI 组件命令" |
| └─ `uniapp-ui-template-builder-skill/` | UI 页面模板 | "UI 模板" |
| `vue/` | **Vue 通用技能矩阵** | "做 Vue" |
| └─ `vue-base-skill/` | Vue 基础（按钮/卡片/表格/标签） | "Vue 基础组件" |
| └─ `vue-generate-skill/` | Vue 项目生成 | "生成 Vue 项目" |
| └─ `vue-theme-skill/` | Vue 主题系统 | "Vue 主题" |

#### 1.3 `vibeCoding/super-deploy-skills/` —— 一键部署套件

> **大型平台项目必备**：覆盖大量中间件（Redis / Kafka / MySQL / PostgreSQL / MongoDB / Go / Java / Python / Node.js）的多插件部署。

| 技能 | 用途 | 触发词 |
|------|------|--------|
| `database-install-skill/` | 数据库安装（含 mysql/pg/redis/mongo 4 子技能） | "安装数据库"、"装 Redis"、"装 Kafka" |
| `runtime-install-skill/` | 运行时安装（含 go/java/python/nodejs 4 子技能） | "安装运行时"、"装 Java"、"装 Go" |
| `deploy-detect-skill/` | 环境探测 | "探测服务器环境" |
| `deploy-docker-skill/` | Docker 部署 | "Docker 部署" |
| `deploy-native-skill/` | 原生部署 | "原生部署" |
| `server-setup-skill/` | 服务器初始化 | "初始化服务器" |
| `static-nginx-skill/` | Nginx 静态站点 | "配置 Nginx" |

---

### 🧰 板块二：`others/` —— 其他领域工具

> 写作、绘图、审计、流程图等通用工具。

| 技能 | 用途 | 触发词 |
|------|------|--------|
| `ai-speech-detector/` | AI 风检测 | "检测 AI 风"、"去 AI 味" |
| `article-illustrator-skill/` | 文章配图生成 | "文章配图" |
| `skill-auditor/` | Skill 安全审计 | "审计 Skill" |
| `workflow-diagram-skill/` | 一句话生成流程图 | "生成流程图" |
| `xhs-style-writer-skill/` | 小红书个人风格写作 | "写小红书" |

---

## 🚀 适用场景

### 场景 1：具体业务项目

| 业务类型 | 涉及技能 | 触发示例 |
|---------|---------|---------|
| 🛒 **商城系统** | `springboot/fastapi-init` + `module-generate`（auth + payment）+ `frontend/uniapp` | "帮我做一个商城系统" |
| 📋 **后台管理系统** | `xxx-init` + `xxx-auth-module` + `frontend-ui-foundry` | "做一个后台管理" |
| 📱 **App / 小程序** | `uniapp-app-generate-skill` + `uniapp-base-skill` | "做一个小程序" |
| 💬 **社区平台** | `fastapi-init` + `fastapi-ws-module` + `fastapi-agent-module` | "做一个社区" |
| 🎓 **在线教育** | `xxx-init` + `module-generate` + `frontend` | "做一个在线教育平台" |

### 场景 2：大型平台项目（大量中间件 + 多插件部署）

> 对应 `vibeCoding/super-deploy-skills/`，覆盖 redis / kafka / mysql / postgres / mongodb / go / java / python / nodejs 等安装与编排。

| 中间件 | 技能 | 触发 |
|--------|------|------|
| 📨 **消息中心**（Kafka / RabbitMQ） | `database-install-skill` + 自定义编排 | "部署 Kafka 集群" |
| ⚡ **Redis 缓存** | `database-install-skill/children/redis-install-skill` | "安装 Redis" |
| 🗄️ **MySQL / PG / MongoDB** | `database-install-skill/children/{mysql,postgres,mongodb}-install-skill` | "安装 MySQL 主从" |
| 📊 **Prometheus / Grafana** | `server-setup-skill` + `deploy-docker-skill` | "部署监控" |

### 场景 3：学习各种语言规范（针对小白）

> **一天学会 xxx 体系**，更好的 Vibecoding：

| 体系 | 技能 | 触发 |
|------|------|------|
| ☕ **一天学会 Java 体系** | `java-backend-skill` + `springboot-init-skill` | "教我 Java" |
| 🐍 **一天学会 Python 体系** | `python-backend-skill` + `fastapi-init-skill` | "教我 Python" |
| 🐹 **一天学会 Go 体系** | `go-backend-skill` | "教我 Go" |
| 🟢 **一天学会 Node.js 体系** | `nodejs-backend-skill` | "教我 Node" |
| 🎨 **一天学会 Vue 体系** | `vue-base-skill` + `vue-generate-skill` | "教我 Vue" |
| 📱 **一天学会 uni-app 体系** | `uniapp-base-skill` + 21 个组件 | "教我 uni-app" |

---

## 🆚 与"传统 AI 一键做项目"的区别

| 维度 | 传统 AI 一键做项目 | 本仓库 Agents Skills 体系 |
|------|-------------------|-------------------------|
| 输出 | 一次性代码片段 | **完整可运行、可演进**的项目 |
| 文档 | 通常无 | 强制交付 `api-contract.md` + `docs/project-guide.md` |
| 前后端 | 只生成一端 | **完整前后端 + 数据库 + 架构** |
| 规范 | AI 自由发挥 | 技能强制约束（生成即遵守） |
| 迭代 | 重做 | 技能可平滑升级、向下兼容 |
| 学习曲线 | 一次性的"惊喜" | **可循序渐进**的体系 |
| 中间件 | 通常无 | 内置部署套件（Redis / Kafka / DB） |

> **一句话**：本仓库不是"AI 帮我写了一个项目"，而是"**一套完整的可进阶可迭代的体系化项目**，包括完整的前后端和数据库，包括架构"。

---

## 🤖 多智能体支持

本仓库的技能遵循**通用 Skill / Agent 协议**，任何支持以下特性的智能体都可以直接使用：

| 智能体 | 加载方式 |
|--------|---------|
| **Claude Code** | 通过 `CLAUDE.md` 引用 `AGENTS.md` |
| **Codex** | 直接读取 `AGENTS.md` |
| **Workbuddy** | 直接读取 `AGENTS.md` |
| **OpenCode** | 直接读取 `AGENTS.md` |
| **VS Code (Copilot)** | 通过 `AGENTS.md` 或 `.github/copilot-instructions.md` |
| **Cursor** | 通过 `.cursorrules` 引用 |
| **Cline** | 通过 `.clinerules` 引用 |
| **Kimi** | 直接读取 `AGENTS.md` |
| **通义灵码 / 文心一言** | 通过自定义指令 |

**所有 `SKILL.md` 使用统一 YAML frontmatter**：

```yaml
---
name: skill-name              # 必填
description: 一句话描述（含触发词）  # 必填
---
```

---

## 📦 快速开始

### 加载技能（以 Claude Code 为例）

```bash
# 1. 克隆仓库
git clone https://github.com/your-org/wg-skills.git ~/.claude/skills/wg-skills

# 2. Claude Code 启动时会自动读取 CLAUDE.md → AGENTS.md → 各 SKILL.md
```

### 使用技能（自然语言触发）

```
帮我审查这段前端代码          → frontend-code-doctor
帮我搭一个 FastAPI 项目       → fastapi-init-skill
帮我做一个 uni-app 小程序     → uniapp-app-generate-skill
帮我加 WebSocket 聊天         → fastapi-ws-module-skill
帮我装 Redis                  → super-deploy-skills/database-install-skill
帮我做一个流程图              → workflow-diagram-skill
```

---

## 🛠️ 贡献与开发

**主控规范文档：[`AGENTS.md`](AGENTS.md)** —— 所有项目级逻辑（开发原则、新增/修改 skill 流程、commit 规范、输出要求、父子嵌套结构说明）都在此。

- 新增 skill：见 `AGENTS.md` 第五节
- 修改现有 skill：见 `AGENTS.md` 第六节
- commit / 分支规范：见 `AGENTS.md` 第七节
- 输出要求：见 `AGENTS.md` 第八节

---

## 📊 仓库总览

| 板块 | skill 总数 | 占比 |
|------|----------|------|
| **vibeCoding** | 45+ | 90% |
| └ backend | 15+ | |
| └ frontend | 30+ | |
| └ super-deploy | 7（含 13 嵌套子） | |
| **others** | 5 | 10% |
| **合计** | **50+ skills** | 100% |

---

## 📜 许可证

MIT License —— 详见 [LICENSE](LICENSE) 文件。

---

**【wg-skills】让 AI 时代的编程可进阶、可迭代、可体系化。**