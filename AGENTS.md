# wg-skills 仓库规范（Agents Skills 主控文档）

> **本文件是 wg-skills 仓库的主控规范文档**，所有项目级逻辑、结构、流程、规范均沉淀于此。
>
> - **Claude 用户**：Claude Code 通过 `CLAUDE.md` 间接引用本文件
> - **Codex / Workbuddy / OpenCode / VS Code / Kimi 等其他智能体**：直接读取 `AGENTS.md`
> - **人类维护者**：直接阅读本文
>
> **任何对本仓库的修改都必须先更新本文件**，再同步到具体 skill 目录与根 README。

---

## 一、仓库定位

本仓库是一套 **Agents Skills 集合（智能体技能集合）**，不绑定任何一家厂商、不依赖任何私有协议。

每个子目录对应一个独立 skill（技能），技能通过 `SKILL.md` 定义触发条件、审查维度与输出格式。**任何支持 Skill / Agent 协议的智能体都可以加载并使用本仓库的技能**。

### 1.1 核心理念

> **将"古法编程"容纳到 AI 体系之中。**

AI 时代的编程不是"取代程序员"，而是把传统工程中**重复、规范、体系化**的部分抽出来，沉淀成可被 AI 调用的技能，让人类专注于业务决策与架构判断。

| 维度 | 古法编程 | 本仓库技能体系 |
|------|----------|---------------|
| 写一个 CRUD 接口 | 查文档、写代码、写测试、写文档（半天） | 一句话触发技能（5 分钟） |
| 搭一套后端骨架 | 选型、写配置、写中间件、写鉴权、写重启脚本（1-2 天） | 触发 `xxx-init-skill`（10 分钟） |
| 学一门新语言 | 买书、查文档、写 demo（1-2 周） | 触发"一天学会 xxx 体系"技能（半天） |
| 多人协作 | 各自风格、风格不统一 | 技能强制规范（生成即遵守） |
| 项目迭代 | 重构历史债、文档落后 | 技能可平滑升级，文档同步 |

### 1.2 适用场景

本仓库的技能不是"演示玩具"，而是面向**真实的工程项目**：

#### 场景 1：具体业务项目
- 🛒 **商城系统**：商品、订单、支付、库存、优惠券
- 📋 **后台管理系统**：用户、权限、组织、数据看板、表单工作流
- 📱 **App / 小程序**：uniapp 一套代码多端发布
- 💬 **社区 / 内容平台**：帖子、评论、点赞、关注
- 🎓 **在线教育**：课程、章节、播放进度、考试

#### 场景 2：大型平台项目
需要大量中间件与多插件部署：
- 📨 **消息中心**：Kafka / Redis Stream / RabbitMQ 接入
- 🔍 **搜索引擎**：Elasticsearch 集成
- ⚡ **缓存层**：Redis Cluster / 多级缓存策略
- 📊 **监控告警**：Prometheus / Grafana / 链路追踪
- 🔐 **统一认证**：OAuth2 / SSO / JWT 多端
- 🗄️ **分库分表**：ShardingSphere / MyCAT
- 📦 **对象存储**：MinIO / OSS / S3 兼容

> 对应技能：`super-deploy-skills/`（部署套件，含数据库 / 运行时 / 服务器 / Nginx / Docker / 原生部署 6 大子技能，**含 redis / kafka / mongodb / mysql / postgres / go / java / python / nodejs 等中间件安装**）。

#### 场景 3：学习各种语言规范
**针对小白、追求更高效的 Vibecoding**：

- ☕ **一天学会 Java 体系** → 触发 `java-backend-skill` / `springboot-init-skill`
- 🐍 **一天学会 Python 体系** → 触发 `python-backend-skill` / `fastapi-init-skill`
- 🐹 **一天学会 Go 体系** → 触发 `go-backend-skill`
- 🟢 **一天学会 Node.js 体系** → 触发 `nodejs-backend-skill`
- 🎨 **一天学会 Vue 体系** → 触发 `vue-base-skill` / `vue-generate-skill`
- 📱 **一天学会 uni-app 体系** → 触发 `uniapp-base-skill` 及其 21 个子技能

> 一句"帮我用 Java 搭一个商城"，智能体会按"选型 → 骨架 → 业务模块"的顺序串起多个技能，**小白也能跟着提示词完成一个完整项目**。

### 1.3 与"传统 AI 一键做项目"的区别

| 维度 | 传统 AI 一键做项目 | 本仓库技能体系 |
|------|-------------------|----------------|
| 输出 | 一次性代码片段 | **完整可运行、可演进**的项目 |
| 文档 | 通常无 | 强制交付 `api-contract.md` + `docs/project-guide.md` |
| 前后端 | 只生成一端 | **完整前后端 + 数据库 + 架构** |
| 规范 | AI 自由发挥 | 技能强制约束（生成即遵守） |
| 迭代 | 重做 | 技能可平滑升级、向下兼容 |
| 学习曲线 | 一次性的"惊喜" | 可**循序渐进**的体系 |
| 中间件 | 通常无 | 内置部署套件（K8s / Docker / Nginx / Redis / Kafka / DB） |

**一句话**：本仓库提供的不是"AI 帮我写了一个项目"，而是"**一套完整的可进阶可迭代的体系化项目**，包括完整的前后端和数据库，包括架构"。

---

## 二、支持的多智能体

本仓库的技能遵循**通用的 Skill / Agent 协议**，任何支持以下特性的智能体都可以直接使用：

| 智能体 | 类型 | 加载方式 |
|--------|------|----------|
| **Claude Code** | Anthropic 官方 | 通过 `CLAUDE.md` 引用本文件，自动加载 `SKILL.md` |
| **Codex** | OpenAI | 通过 `AGENTS.md` 直接加载 |
| **Workbuddy** | AI 编程助手 | 通过 `AGENTS.md` 加载 |
| **OpenCode** | 开源 AI IDE | 通过 `AGENTS.md` 加载 |
| **VS Code** | GitHub Copilot | 通过 `.github/copilot-instructions.md` 或 `AGENTS.md` |
| **Cursor** | AI 编辑器 | 通过 `.cursorrules` 引用本文件 |
| **Cline** | VS Code 插件 | 通过 `.clinerules` 引用本文件 |
| **Kimi** | Moonshot AI | 通过 `AGENTS.md` 加载 |
| **通义灵码** | 阿里云 | 通过自定义指令加载 |
| **文心一言** | 百度 | 通过系统提示词加载 |

**技能文件兼容性**：所有 `SKILL.md` 文件使用统一的 YAML frontmatter：

```yaml
---
name: skill-name              # 必填，kebab-case
description: 一句话描述技能用途  # 必填，含触发词
---
```

**任何智能体只要能识别这个 frontmatter + Markdown 正文结构，就能加载本仓库的技能。**

---

## 三、目录结构（三大板块）

本仓库采用 **3 + N** 板块布局，将所有 skill 按业务域归类：

```
wg-skills/
├── AGENTS.md                          # 本文件：主控规范（所有智能体的入口）
├── CLAUDE.md                          # Claude Code 入口（仅引用 AGENTS.md）
├── README.md                          # 仓库总览（人类视角）
├── .gitignore
├── LICENSE
│
├── vibeCoding/                        # 🎯 板块一：编程开发（占比 85%）
│   ├── backend/                       # 后端语言矩阵
│   │   ├── java/springboot/
│   │   │   ├── springboot-init-skill/        # Spring Boot 一键初始化
│   │   │   └── java-auth-module-skill/       # Spring Boot 组织与鉴权
│   │   ├── python/fastapi/
│   │   │   ├── fastapi-init-skill/           # FastAPI 一键初始化
│   │   │   ├── fastapi-auth-module-skill/    # FastAPI 组织与鉴权
│   │   │   ├── fastapi-ws-module-skill/       # FastAPI WebSocket 即时通讯
│   │   │   └── fastapi-agent-module-skill/   # FastAPI + LangGraph AI Agent
│   │   ├── backend-analysis-skill/           # 后端项目全景分析
│   │   ├── backend-generate-skill/           # 后端项目骨架生成（父技能 + 7 嵌套子技能）
│   │   │   ├── backend-select-skill/         # 选型（语言/框架/数据库）
│   │   │   ├── backend-convention-skill/     # 通用规范
│   │   │   ├── java-backend-skill/           # Java 体系
│   │   │   ├── go-backend-skill/             # Go 体系
│   │   │   ├── python-backend-skill/         # Python 体系
│   │   │   ├── nodejs-backend-skill/         # Node.js 体系
│   │   │   └── database-skill/               # 数据库选型
│   │   └── module-generate-skill/            # 后端业务模块生成（父技能 + 5 嵌套子技能）
│   │       ├── auth-skill/                   # 鉴权模块
│   │       ├── org-permission-skill/         # 组织权限
│   │       ├── ai-chat-skill/                # AI 聊天
│   │       ├── notification-skill/           # 通知模块
│   │       └── payment-skill/                # 支付模块
│   │
│   ├── frontend/                      # 前端框架矩阵
│   │   ├── frontend-code-doctor/             # 前端代码审查
│   │   ├── frontend-request-skill/           # 前端请求层规范
│   │   ├── frontend-style-harmonizer-skill/  # 前端样式一致性
│   │   ├── frontend-ui-foundry/              # 综合前端 UI
│   │   ├── icon-image-catch-skill/           # 素材抓取（父技能 + 2 嵌套子）
│   │   ├── image-forge-skill/                # 图片处理 + 图标生成
│   │   ├── uniapp/                           # uni-app 技能矩阵（15+ skill）
│   │   │   ├── uniapp-base-skill/            # uni-app 基础组件（父技能，内含 21 组件）
│   │   │   │   ├── uniapp-form-skill/        # 表单组件
│   │   │   │   ├── uniapp-card-skill/        # 卡片组件
│   │   │   │   └── uniapp-page-skill/        # 页面模板
│   │   │   ├── uniapp-app-generate-skill/    # uni-app 项目生成
│   │   │   ├── uniapp-standard-skill/        # 开发通用规范
│   │   │   ├── uniapp-style-skill/           # 设计系统
│   │   │   ├── uniapp-theme-skill/           # 主题系统
│   │   │   ├── uniapp-components-skill/      # 登录鉴权与安全
│   │   │   ├── uniapp-page-components-skill/ # 组件化页面
│   │   │   ├── uniapp-request-skill/         # 请求层设计
│   │   │   ├── uniapp-standardization-skill/ # 项目规范化
│   │   │   ├── uniapp-code-audit-skill/      # 代码审计
│   │   │   ├── uniapp-crossplatform-audit-skill/ # 跨平台兼容审计
│   │   │   ├── uniapp-vue2-upgrade-skill/    # Vue2 → Vue3
│   │   │   ├── uniapp-ui-replica-skill/      # UI 原型图复刻
│   │   │   ├── uniapp-ui-component-commands-skill/ # UI 组件指令
│   │   │   └── uniapp-ui-template-builder-skill/   # UI 页面模板
│   │   └── vue/                              # Vue 通用技能矩阵
│   │       ├── vue-base-skill/               # Vue 基础（按钮/卡片/表格/标签）
│   │       ├── vue-generate-skill/           # Vue 项目生成
│   │       └── vue-theme-skill/              # Vue 主题系统
│   │
│   ├── super-deploy-skills/           # 🚀 一键部署套件（父技能 + 13 嵌套子技能）
│   │   ├── database-install-skill/           # 数据库安装（mysql/pg/redis/mongo 子技能）
│   │   ├── runtime-install-skill/            # 运行时安装（go/java/python/nodejs 子技能）
│   │   ├── deploy-detect-skill/              # 环境探测
│   │   ├── deploy-docker-skill/              # Docker 部署
│   │   ├── deploy-native-skill/              # 原生部署
│   │   ├── server-setup-skill/               # 服务器初始化
│   │   └── static-nginx-skill/               # Nginx 静态站点
│   │
│   └── vibecoding-guide-skill/        # 📚 VibeCoding 知识导师（父技能 + 3 嵌套子技能）
│       ├── vibecoding-workflow-skill/        # 工作流教学
│       ├── agent-learning-skill/             # 智能体学习
│       └── agent-interview-skill/            # 智能体面试 / 自检
│
├── others/                            # 🧰 板块二：其他领域工具
│   └── ffmpeg-skill/                         # FFmpeg 多媒体处理（剪辑/转码/水印/合成/提取）
│
└── others/                            # 🧰 板块三：其他领域工具
    ├── ai-speech-detector/                   # AI 风检测
    ├── article-illustrator-skill/            # 文章配图生成
    ├── skill-auditor/                        # Skill 安全审计
    ├── workflow-diagram-skill/               # 一句话生成流程图
    └── xhs-style-writer-skill/                # 小红书个人风格写作
```

### 3.1 板块说明

| 板块 | 占比 | 业务定位 |
|------|------|---------|
| **vibeCoding** | 85% | 编程开发：覆盖前后端、数据库、部署、AI 编程教学 |
| **others** | 10% | 其他领域工具：写作、审计、流程图等 |
| **others** | 5% | 其他工具：写作、绘图、审计、流程图 |

### 3.2 父子嵌套结构（5 个父技能）

以下目录采用**父-子嵌套**结构（子技能可单独触发，也可由父技能串接触发）：

| 父技能 | 嵌套子技能数 | 子技能定位 |
|--------|------------|-----------|
| `vibeCoding/backend/backend-generate-skill` | 7 | 语言/框架/DB 选型 + 规范 + 各语言骨架 |
| `vibeCoding/backend/module-generate-skill` | 5 | 鉴权/权限/AI聊天/通知/支付 |
| `vibeCoding/frontend/icon-image-catch-skill` | 2 | 图标抓取 / 图片抓取 |
| `vibeCoding/super-deploy-skills` | 13（含 2 级嵌套） | 数据库安装 / 运行时安装 / 各种部署 |
| `vibeCoding/frontend/uniapp/uniapp-base-skill` | 3 | uniapp 表单/卡片/页面 |
| `vibeCoding/vibecoding-guide-skill` | 3 | 工作流 / 学习 / 面试 |

> `super-deploy-skills` 含二级嵌套：`database-install-skill/children/{mysql,postgres,redis,mongodb}-install-skill` 与 `runtime-install-skill/children/{go,java,python,nodejs}-install-skill`，**对应"大量中间件多插件部署"的真实需求**。

### 3.3 顶层遗留目录

| 目录 | 状态 | 说明 |
|------|------|------|
| `uniapp-base-skill/`（顶层） | ⚠️ **历史遗留副本** | 完整版已在 `vibeCoding/frontend/uniapp/uniapp-base-skill/`，顶层这份仅含部分 demo，建议删除 |

---

## 四、开发原则

1. **技能自治**：每个 skill 目录自包含，修改时只动目标 skill，不影响其他技能。
2. **入口一致**：每个 skill 必须提供 `SKILL.md`；面向用户的说明写入同目录 `README.md`。
3. **触发词稳定**：修改 `SKILL.md` 的触发条件后，必须同步更新 `README.md` 中的使用示例。
4. **参考资料沉淀**：通用规则、词表、案例放入 skill 内 `references/`；避免把长文本直接塞进 `SKILL.md`。
5. **向后兼容**：已有触发词和命令行保持可用；破坏性变更需在 `README.md` 中标注迁移方式。
6. **多智能体通用**：所有 `SKILL.md` 必须使用通用 YAML frontmatter，**不得绑定特定智能体**。
7. **目录归位**：新增 skill 必须放在所属板块下（vibeCoding / others），禁止散落到顶层。

---

## 五、新增 Skill 流程

1. **确定归属板块**（vibeCoding / others）。
2. **创建目录**：`<板块>/<二级分类>/<skill-name>/`，目录名 kebab-case。
3. **写入 `SKILL.md`**，必填前置元数据：

   ```yaml
   ---
   name: skill-name
   description: 一句话描述技能用途（含触发词）
   ---
   ```
4. **写入 `README.md`**：包含功能、使用方式、示例、目录说明。
5. **创建 `references/`**：通用规则、词表、案例按主题拆分文件。
6. **更新本文件（AGENTS.md）**：将新 skill 加入第三节"目录结构"对应位置。
7. **更新根 `README.md`**：将该 skill 加入对应板块的"当前可用 Skills"表格。
8. **同步触发词**：检查与其他 skill 的触发词是否冲突。

---

## 六、修改现有 Skill 规范

1. 优先改 `SKILL.md`，再同步 `README.md` 与 `references/`。
2. 触发词变化必须检查是否有其他 skill 冲突。
3. 删除或重命名 references 文件时，检查 SKILL.md 中的引用路径。
4. 修改父技能时，**必须**逐个审查所有嵌套子技能的依赖关系。
5. 跨板块调整（vibeCoding ↔ others）需先在 PR 描述中说明理由。

---

## 七、分支与提交规范

- **所有变更直接提交并推送到 `main` 分支**。
- **禁止在未获得用户明确授权的情况下自行创建功能分支或 Pull Request**。
- **任何时候禁止提交 `docs/` 目录下的任何内容**（该目录仅用于本地文档沉淀，不进入版本控制）。
- **任何时候禁止提交 `**/node_modules/`、`**/__pycache__/`、`.env` 等构建/依赖产物**（`.gitignore` 已配置）。
- 若用户要求创建分支，须使用用户指定的分支名；未指定时须先询问。
- 提交信息使用中文，格式：`<类型>: <简短描述>`，类型包括 `feat / fix / refactor / docs / chore / audit`。

---

## 八、输出要求

- 所有解释、注释、文档使用中文。
- 修改代码时给出完整函数或文件，避免使用 `// ... rest of code`。
- 若变更可能破坏现有 skill 调用方式，在末尾明确发出兼容性警告。
- 输出文档默认 Markdown 格式；表格用 GFM 语法；流程图用 Mermaid（若支持）。

---

## 九、审计与维护

- **每季度**审查一次所有 skill 的 `SKILL.md` 触发词是否仍然准确。
- **每年**检查一次目录结构与本文件的同步性，移除废弃 skill。
- **重大变更**（破坏性、重命名、跨板块调整）必须在根 README 的"近期变更"小节标注。

---

## 十、附：体系总览图

```
                ┌─────────────────────────────────────────────────────────┐
                │            wg-skills —— Agents Skills 集合              │
                │   让 AI 时代的编程更高效：古法编程 → AI 体系化            │
                └──────────────────────┬──────────────────────────────────┘
                                       │
        ┌──────────────────────────────┼──────────────────────────────┐
        │                              │                              │
   ┌────▼─────┐                  ┌─────▼─────┐                  ┌──────▼──────┐
   │vibeCoding│  编程开发 90%     │   others   │  其他工具 10%  │
   └────┬─────┘                  └─────┬─────┘                  └──────┬──────┘
        │                              │                              │
   ┌────┴────────────────┐             │                              │
   │   backend           │        ┌────┴─────┐                  ┌──────┴───────┐
   │   ├ java            │        │  remotion│                  │ai-speech-det │
   │   ├ python/fastapi  │        │  ffmpeg  │                  │article-illus │
   │   ├ backend-gen     │        └──────────┘                  │skill-auditor │
   │   └ module-gen      │                                       │workflow-diag │
   │                     │                                       │xhs-writer    │
   │   frontend          │                                       └──────────────┘
   │   ├ uniapp (15+)    │
   │   ├ vue (3)         │
   │   └ ui-foundry      │
   │                     │
   │   super-deploy (13) │ ← 大量中间件：redis / kafka / mysql / pg / mongo
   │                     │
   └─────────────────────┘
                │
                ▼
   真实项目：商城 / 管理系统 / App / 小程序 / 大型平台（多中间件）
   学习场景：一天学会 Java 体系 / Python 体系 / Vue 体系 / uni-app 体系
```

---

## 十一、文档沉淀规范（plan / design / doc）

本仓库的所有**计划、设计稿、辅助文档**（不含 skill 内容本身），**统一沉淀到 `docs/plans/`** 下。

### 11.1 适用范围

| 类型 | 是否沉淀到 `docs/plans/` | 说明 |
|------|------------------------|------|
| 实施计划（plan） | ✅ 是 | 如商业模式、设计方案、重构计划 |
| 设计稿（design） | ✅ 是 | 架构图、接口设计、UI 草稿 |
| 调研笔记（research） | ✅ 是 | 选型对比、可行性分析 |
| 会议纪要（meeting） | ✅ 是 | 协作沟通结果 |
| Skill 文档（SKILL.md / README.md） | ❌ 否 | 跟随 skill 目录 |
| 仓库主控（AGENTS.md / CLAUDE.md / README.md） | ❌ 否 | 在仓库根目录 |
| 公众号文章 | ❌ 否 | 在 `docs/<对应分类>/公众号文章.md` |

### 11.2 命名规范

文件名格式：`<kebab-case-主题>-<类型>.md`

示例：
- `monetization-plan.md`（变现方案计划）
- `fastapi-ws-refactor-design.md`（fastapi-ws 重构设计）
- `redis-vs-kafka-research.md`（选型调研）

### 11.3 禁止事项

- ❌ **禁止写入全局默认 `~/.claude/plans/`** —— 本仓库所有 plan **必须**沉淀到 `docs/plans/`
- ❌ 禁止把 plan 文件放到 skill 目录里（污染 skill 自包含性）
- ❌ 禁止把 plan / design 内容混入 SKILL.md（SKILL.md 只承载技能定义）

### 11.4 版本控制

按第七节规定，`docs/` 全目录**不进入 git**。`docs/plans/` 同理，本地沉淀、随时查阅，**无需提交**。

---

**【wg-skills】让 AI 时代的编程可进阶、可迭代、可体系化。**