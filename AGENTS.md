# 根模块迁移规范

本仓库聚焦古法工程经验融入 AI。根目录以 frontend、backend、database、super-deploy-skills、vibecoding-guide-skill 五个模块组织。prompts 由私有 wg-project-kits 维护。迁移时同步入口、引用和使用文档。

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

**核心设计理念**：前后端一体化。前端 4 套体系（Vue / UniApp / React / HTML）与后端 5 语言矩阵（Java / Python / Go / Node.js / Rust）通过 `api-contract.md` 契约连接，前端请求层自动适配后端响应信封和错误码，Design Token 命名体系跨框架对齐。

**对外定位**：本仓库是“古法全栈开发经验 × AI”的公开基础能力层。它提供项目骨架、通用模块、前后端契约、主题与部署规范；不承诺覆盖每个行业业务规则、品牌视觉或个性化产品决策。项目级编排、模板与验收链路由私有仓库 `wg-project-kits` 持续沉淀。

### 1.1 核心理念

> **将"古法编程"容纳到 AI 体系之中。**

AI 时代的编程不是"取代程序员"，而是把传统工程中**重复、规范、体系化**的部分抽出来，沉淀成可被 AI 调用的技能，让人类专注于业务决策与架构判断。

| 维度 | 古法编程 | 本仓库技能体系 |
|------|----------|---------------|
| 写一个 CRUD 接口 | 查文档、写代码、写测试、写文档（半天） | 一句话触发技能（5 分钟） |
| 搭一套后端骨架 | 选型、写配置、写中间件、写鉴权、写重启脚本（1-2 天） | 触发 `xxx-init-skill`（10 分钟） |
| 前后端联调 | 口头约定接口格式、反复沟通 | `api-contract.md` 契约连接，零沟通成本 |
| 前端样式不统一 | 各页面颜色/间距/字号随意 | Design Token 体系，Vue 与 UniApp 命名完全对齐 |
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

> 对应技能：`database/` 下各模块技能（mysql/pgsql/mongodb/redis/kafka/sqlite）提供中间件配置参考。

#### 场景 3：学习各种语言规范
**针对小白、追求更高效的 Vibecoding**：

- ☕ **一天学会 Java 体系** → 触发 `java-fast-skill` / `springboot-init-skill`
- 🐍 **一天学会 Python 体系** → 触发 `python-fast-skill` / `fastapi-init-skill`
- 🐹 **一天学会 Go 体系** → 触发 `go-gin-init-skill`
- 🟢 **一天学会 Node.js 体系** → 触发 `nodejs-init-skill`
- 🎨 **一天学会 Vue 体系** → 触发 `vue-base-skill` / `vue-generate-skill`（SPA）/ `nuxt-generate-skill`（SSR）
- 📱 **一天学会 React 体系** → 触发 `react-generate-skill` / `next-generate-skill`
- 📱 **一天学会 uni-app 体系** → 触发 `uniapp-base-skill`（基础组件与容器真源）及 14 个独立 uniapp 技能

> 一句"帮我用 Java 搭一个商城"，智能体会按"选型 → 骨架 → 业务模块"的顺序串起多个技能，**小白也能跟着提示词完成一个完整项目**。

### 1.3 与"传统 AI 一键做项目"的区别

| 维度 | 传统 AI 一键做项目 | 本仓库技能体系 |
|------|-------------------|----------------|
| 输出 | 一次性代码片段 | **完整可运行、可演进**的项目 |
| 文档 | 通常无 | 强制交付 `api-contract.md` + `docs/project-guide.md` |
| 前后端 | 只生成一端 | **完整前后端 + 数据库 + 架构**，通过 `api-contract.md` 契约连接 |
| 前端体系 | 单一框架 | **4 套体系**（Vue/UniApp/React/HTML），共享 Design Token 和请求层 |
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

## 三、目录结构

五个根模块分别维护前端、后端、数据库、环境部署与学习辅助。

- frontend/：前端框架、组件、主题、请求层与页面审查。
- backend/：语言骨架、业务模块与 shared 公共契约。
- database/：建模规范与数据库、中间件集成参考。
- super-deploy-skills/：环境识别、运行依赖与部署。
- vibecoding-guide-skill/：选型、学习和工程协作流程。

prompts/ 与独立领域工具维护于私有 wg-project-kits。

### 3.2 父子嵌套结构（5 个父技能）

以下目录采用**父-子嵌套**结构（子技能可单独触发，也可由父技能串接触发）：

| 父技能 | 嵌套子技能数 | 子技能定位 |
|--------|------------|-----------|
| `frontend/icon-image-catch-skill` | 2 | 图标抓取 / 图片抓取 |
| `frontend/vue/vue-base-skill` | 20+ | Vue 组件体系（按钮/卡片/表格/表单/树等） |

### 3.3 顶层遗留目录

当前仓库根**无**遗留副本目录，全部技能均位于 `` 之下。

### 3.4 规范分层体系（仓库级 / 模块级 / 个体级）

规范分三层，**上层定框架、下层填细节，同一条规则只在一处写**。

| 层级 | 文件 | 覆盖范围 | 写什么 | 不写什么 |
|------|------|----------|--------|----------|
| **仓库级** | 根 `AGENTS.md` | 全仓库 | 仓库定位、目录结构、跨栈通用规则、文档格式、提交纪律 | 单个 skill 的实现细节 |
| **模块级** | `<技术栈目录>/AGENTS.md` | 一个技术栈（整目录） | 该栈的层级架构、唯一真源表、跨 skill 协作、变更纪律 | 具体组件的属性 / 事件 / 代码 |
| **个体级** | `<skill>/STANDARD.md` | 单个 skill | 该 skill 特有红线（编号约束）、自检清单 | 与上层重复的通用规则 |

**引用方向：个体 → 模块 → 仓库（单向向下，禁止反向依赖）。**

| 文件 | 位置 | 数量 | 头部必须声明 |
|------|------|------|--------------|
| `AGENTS.md` | 技术栈目录根（如 `frontend/uniapp/AGENTS.md`） | 每栈 1 个 | 上位规范：仓库根 `AGENTS.md`；下位规范：各 skill `STANDARD.md` |
| `STANDARD.md`（可选） | 有局部约束的 skill 目录根 | 仅在需要时创建 | 上位规范：所属模块级 `AGENTS.md` |
| `SKILL.md` | 每个 skill 目录根 | 每 skill 1 个（必备入口） | — |
| `README.md` | 每个 skill 目录根 | 每 skill 1 个（对外说明） | — |

新增或调整规范时，先明确模块级真源，再判断单个 skill 是否确有不可替代的局部约束；不得用“补齐数量”衡量规范质量。

---

## 四、开发原则

1. **技能自治**：每个 skill 目录自包含，修改时只动目标 skill，不影响其他技能。
2. **入口一致**：每个 skill 必须提供 `SKILL.md`；面向用户的说明写入同目录 `README.md`。
3. **触发词稳定**：修改 `SKILL.md` 的触发条件后，必须同步更新 `README.md` 中的使用示例。
4. **参考资料沉淀**：通用规则、词表、案例放入 skill 内 `references/`；避免把长文本直接塞进 `SKILL.md`。
5. **向后兼容**：已有触发词和命令行保持可用；破坏性变更需在 `README.md` 中标注迁移方式。
6. **多智能体通用**：所有 `SKILL.md` 必须使用通用 YAML frontmatter，**不得绑定特定智能体**。
7. **目录归位**：新增 skill 必须放在上述所属根模块下，禁止散落到顶层。
8. **规范分层**：通用规则写在所属技术栈的模块级 `AGENTS.md`，单个 skill 的特有红线写在自己的 `STANDARD.md`；**同一条规则只在一处写**，下位不重复上位。

---

## 五、新增 Skill 流程

1. **确定所属根模块**。
2. **创建目录**：`<板块>/<二级分类>/<skill-name>/`，目录名 kebab-case。
3. **写入 `SKILL.md`**，必填前置元数据：

   ```yaml
   ---
   name: skill-name
   description: 一句话描述技能用途（含触发词）
   ---
   ```
4. **判断是否需要 `STANDARD.md`**：仅当存在无法由模块 `AGENTS.md` 与 `SKILL.md` 表达的局部约束时创建；创建后写模块定位、依赖、目录约定、编号红线、变更纪律与自检清单，头部声明上位规范。
5. **写入 `README.md`**：包含功能、使用方式、示例、目录说明。
6. **创建 `references/`**：通用规则、词表、案例按主题拆分文件。
7. **更新本文件（AGENTS.md）**：将新 skill 加入第三节"目录结构"对应位置。
8. **更新根 `README.md`**：将该 skill 加入对应板块的"当前可用 Skills"表格。
9. **同步触发词**：检查与其他 skill 的触发词是否冲突。

---

## 六、修改现有 Skill 规范

1. 优先改 `SKILL.md`，再同步 `README.md` 与 `references/`。
2. 触发词变化必须检查是否有其他 skill 冲突。
3. 删除或重命名 references 文件时，检查 SKILL.md 中的引用路径。
4. 修改父技能时，**必须**逐个审查所有嵌套子技能的依赖关系。
5. 跨仓库迁移需在变更记录中说明归属、目标路径与兼容方式。
6. **规范归属判断**：改的是"该技术栈通用规则" → 改模块级 `<技术栈>/AGENTS.md`；改的是"单个 skill 特有红线" → 改该 skill 的 `STANDARD.md`；两者都不要重复写。
7. 改了模块级 `AGENTS.md` 后，**必须**逐个核对受影响 skill 的 `STANDARD.md` 是否与上位冲突（例：上位已禁止 `px`，下位不得再允许 `px`）。

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

- uni-app 跨端审计必须分别核查模板/脚本语法、运行时内置对象、CSS 渲染器与平台专属能力，App 需区分 vue/nvue、逻辑层和原生插件调用环境。

- 跨端审计先核对平台版本与代码可达性，报告区分已确认、待验证、不适用、未执行。`uniapp-crossplatform-audit-skill` 仅交付报告，不输出修复方案或补丁。

- **每季度**审查一次所有 skill 的 `SKILL.md` 触发词是否仍然准确。
- **每年**检查一次目录结构与本文件的同步性，移除废弃 skill。
- **重大变更**（破坏性、重命名、跨板块调整）必须在根 README 的"近期变更"小节标注。

---

## 十、附：体系总览

前端、后端通过 backend/shared/ 与项目 api-contract.md 连接，database/ 提供数据设计规范，部署与学习辅助分别由对应根模块负责。

## 十一、文档沉淀规范

内部计划、设计与调研统一写入 docs/plans/，docs/ 不提交。公开技能说明跟随技能目录。任务提示词模板归属私有 wg-project-kits/prompts/。

## 十二、Vue 组件实现规范（md vs demo 关系）

本节针对 `frontend/vue/**` 下所有 `.md` 组件文档与 demo 演示文件的协作关系。

### 12.1 核心分层

| 层级 | 文件类型 | 性质 | 受约束对象 |
|------|----------|------|-----------|
| **逻辑层（md）** | `*.md` 组件文档 | Vue 组件**实现代码** + 设计契约（props/events/slots） | 受**零 HTML5 标签**红线约束 |
| **视觉层（demo）** | `demo-components/**/html/*.html` | 纯静态 HTML 演示，给用户查看运行效果 | **不受**零 HTML5 标签约束 |

> **一句话**：md 决定"怎么实现"，demo 决定"长什么样"。两者必须视觉一致，但实现路径独立。

### 12.2 md 端红线（强制）

`vue-base-skill/`、`vue-form-skill/`、`vue-table-skill/` 下的所有 `.md` 文件，**严禁出现**以下 HTML5 原生标签：

```
<button>  <input>  <select>  <table>  <tr>  <td>  <th>
<textarea>  <form>  <option>  <label>  <fieldset>  <legend>
<header>  <footer>  <h1>-<h6>  <ul>/<ol>/<li>  <a href>
```

**替代方案**（在 `.md` 示例代码中必须遵守）：

| 原生标签 | 替代写法 |
|----------|----------|
| `<button>` | `<div role="button" tabindex="0" :aria-disabled @click @keydown.enter @keydown.space.prevent>` |
| `<input type="checkbox">` | `<div role="checkbox" tabindex="0" :aria-checked>` |
| `<input type="radio">` | `<div role="radio" tabindex="0" :aria-checked>` |
| `<button type="button">` 开关 | `<div role="switch" tabindex="0" :aria-checked>` |
| `<input type="text">` | `<div contenteditable="!disabled && !readonly" role="textbox" @input>` |
| `<input type="file">` 上传 | **唯一技术豁免**：Web 文件选择是浏览器安全模型硬性要求，`base-upload.md` 内部允许渲染一个 `display:none` 的隐藏 file 控件（Element Plus / Naive UI 等所有上传组件均如此），可见触发区仍用 `<div role="button">` |
| `<textarea>` | `<div contenteditable="true" role="textbox">` |
| `<form @submit.prevent>` | `<div role="form" @keydown.enter.prevent>` + `emit('submit')` |
| `<table>/<tr>/<td>` | CSS Grid / Flex 实现（语义保留 `<div>` + ARIA role="grid/row/gridcell"） |
| `<header>/<footer>` | `<div class="xxx__header">` / `<div class="xxx__footer">` |

**禁止裸用**：所有组件必须被 `<base-card>` 包裹（容器原则）。

### 12.3 demo 端例外（豁免）

`demo-components/**/*.html` 文件**允许**自由使用 `<button>` `<input>` `<table>` 等原生标签，**不需要遵守**零 HTML5 标签约束。

> 用户原话：**"demo文件 违约 不用管"** / **"demo里面 使用没关系。这只是给别人看的"**

**理由**：
1. demo 是给人类查看的运行示例，目标是"看到效果"，不是"展示实现规范"。
2. 原生标签让 demo 体积更小、可读性更高、无需 ARIA 属性堆砌。
3. demo 与生产组件实现**隔离**，demo 不参与工程编译，不污染业务代码。

**demo 必须遵守**（仅此一条）：
- ✅ 视觉必须与对应 `.md` 的渲染效果**完全一致**（className、CSS3、组件层级、交互状态）
- ✅ demo 底部需列出**完整入参**（props / columns / events / slots / data 结构），方便用户对照 `.md` 实现

### 12.4 视觉匹配契约

| 维度 | md 端 | demo 端 | 一致性要求 |
|------|-------|---------|-----------|
| className | `base-button--primary` | `base-button--primary` | **完全相同** |
| CSS 变量 | `var(--color-primary)` | `var(--color-primary)` | **完全相同** |
| 组件层级 | `<base-card><base-form>...` | `<div class="demo-card"><div class="demo-form">...` | **结构镜像**（class 命名映射） |
| 状态类 | `.is-disabled` / `.is-checked` | `.is-disabled` / `.is-checked` | **完全相同** |
| 交互态 | hover/focus/active | hover/focus/active | **完全相同** |

### 12.5 审计范围（仅查 md，不查 demo）

```bash
# ✅ 正确：审计零 HTML5 标签违规（仅 .md）
# --exclude base-upload.md：其隐藏 file 控件是 Web 文件选择的唯一技术豁免
grep -rnE '<(button|input|select|table|tr|td|th|textarea|form|option|label|fieldset|header|footer|h[1-6])' \
  --include="*.md" \
  --exclude="base-upload.md" \
  ./frontend/vue/vue-base-skill \
  ./frontend/vue/vue-base-skill/vue-form-skill \
  ./frontend/vue/vue-base-skill/vue-table-skill

# ❌ 错误：把 demo HTML 也纳入审计（会大量误报，无需修复）
grep -rnE '<button' ./frontend/vue/vue-base-skill/vue-table-skill/demo-components
```

### 12.6 修复责任划分

| 文件 | 违反零 HTML5 标签 | 处理方式 |
|------|------------------|---------|
| `*.md` 组件文档 | ❌ **必须修复** | 替换为 `<div role="*">` + ARIA + 键盘事件 |
| `demo-components/**/*.html` | ✅ **无需修复** | 保留原生标签，作为视觉演示 |
| `*.md` 中的"正确/错误对比"注释 | ⚠️ **注释里也要避免** | 用 `div + role="form"` 描述，不要直接写 `<form>` 字面量 |

### 12.7 新增 Vue 组件的强制清单

新增 `.md` 组件文档时，按顺序过一遍：

- [ ] 所有交互元素是否用了 `<div role="*">` 替代 HTML5 标签？
- [ ] 是否包含 `aria-*` 属性（checked / disabled / readonly / label）？
- [ ] 是否包含键盘事件（`@keydown.enter` / `@keydown.space.prevent`）？
- [ ] 是否包了 `<base-card>` 容器？
- [ ] demo HTML 是否与 md 视觉一致？
- [ ] demo 底部是否列出了完整入参（props / columns / events / slots）？
- [ ] 是否跑过 `grep -rnE '<(button|input|select|table|...)' --include="*.md"` 确认零违规？
- [ ] 代码中是否包含彩色 emoji？（必须替换为纯文本/Unicode 符号）

### 12.8 零 Emoji 铁律

所有组件代码（`.md` 的 template/script/style + `demo-components/**/*.html`）**严禁使用彩色 emoji**。

| 位置 | 约束 |
|------|------|
| `.md` 组件代码（template / script / style） | ❌ 禁止任何 emoji |
| `demo-components/**/*.html` 的可见 UI | ❌ 禁止彩色 emoji |
| `.md` 文档正文（标题、说明、表格） | ✅ 允许（仅文档，不进运行时） |
| 约定标记（❌ ✅ ⚠️） | ✅ 允许（Unicode 基本区段，非彩色） |
| 标准 Unicode 符号（✓ × ✎ →） | ✅ 允许（跨平台一致） |

**理由**：
1. 不同操作系统/浏览器对 emoji 渲染差异大（iOS vs Android vs Windows）
2. uniapp 跨端场景下 emoji 可能导致布局错乱或白屏
3. emoji 不可控的字形宽度影响精确布局

**替代方案**：

| emoji 用途 | 替代写法 |
|-----------|---------|
| 文件类型图标 | 纯文本标记 `PDF` `DOC` `IMG` + CSS badge 样式 |
| 状态指示 | `✓` `×` `!` 等 Unicode 符号 + CSS 着色 |
| 装饰性图标 | CSS mask / background-image / SVG |
| 区域标题 | 纯文本，不用 emoji 前缀 |

---

## 十三、前后端一体化设计规范

本仓库不是"前端技能 + 后端技能"的松散集合，而是一套**前后端打通的一体化体系**。前后端通过**接口契约（api-contract.md）** 连接，前端通过**统一请求层（request.ts）** 消费后端接口，后端通过**统一响应信封**输出数据。

### 13.1 一体化架构

```
┌─────────────────────────────────────────────────────────┐
│                    用户触发一句话                         │
│              "帮我做一个管理后台"                          │
└────────────────────────┬────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
    ┌────▼─────┐   ┌─────▼─────┐   ┌─────▼─────┐
    │  前端层   │   │  后端层    │   │  数据库层  │
    │          │   │           │   │           │
    │ 组件库    │   │ init-skill│   │ database- │
    │ 主题系统  │   │ module-   │   │ design-   │
    │ 请求层    │   │ skill     │   │ skill     │
    │ 样式规范  │   │           │   │           │
    └────┬─────┘   └─────┬─────┘   └───────────┘
         │               │
         │    ┌──────────┘
         │    │
    ┌────▼────▼────┐
    │ 项目 api-contract │  ← 项目接口实例真源
    │    .md       │
    └──────────────┘
```

### 13.2 前端 4 套体系

本仓库的前端技能按框架分为 4 套体系，共享同一套设计理念（Design Token、响应信封、请求层规范）：

| 体系 | 完成度 | 组件库 | 主题系统 | 样式规范 | 请求层 | 项目生成 | 定位 |
|------|--------|--------|---------|---------|--------|---------|------|
| **Vue** | 85% | vue-base-skill (20+) | vue-theme-skill | vue-style-skill | frontend-request-skill | vue-generate-skill（SPA）/ **nuxt-generate-skill**（SSR） | Web 管理后台、H5、SSR 全栈 |
| **UniApp** | 90% | uniapp-base-skill (26 组件 + 6 容器) | uniapp-theme-skill | uniapp-style-skill | uniapp-request-skill | uniapp-app-generate-skill | 小程序、App、跨端 |
| **React** | 30% | 待建设 | 待建设 | 待建设 | 可复用 frontend-request-skill | react-generate-skill / next-generate-skill | Web SPA / 全栈 SSR |
| **HTML** | 10% | 待建设 | 待建设 | 待建设 | api.js（不标准） | html-frontend-template | 轻量后台、原型 |

**优先级**：HTML 体系是下一个重点建设方向。HTML 组件的核心原则**参考 Vue 体系**——因为 Vue 组件技能的核心原则就是使用纯 H5（div + CSS3 + ARIA），与纯 HTML 天然一致。

**体系间共享**：
- `frontend-request-skill`：4 套体系共用同一套请求层规范（响应信封、错误码、Token 注入、防抖、Mock、SSE）
- Design Token 命名：Vue 与 UniApp **语义色简写与工具类 Token 对齐**（`--color-primary`、`--color-error`、`--space-{n}`、`--font-{size}`、`--radius-{size}`、`--shadow-{size}`、`--z-index-*`）。色阶前缀为各栈实现细节：Vue 用 `--color-primary-{50~950}`，UniApp 用 `--primary-{50~950}`（并映射到 `--color-primary` 简写）
- api-contract.md：4 套体系共用同一份后端接口契约

### 13.3 后端统一分层

后端技能按**语言 × 框架 × 统一规范**三层组织：

| 层级 | 说明 | 示例 |
|------|------|------|
| **语言** | 编程语言选择 | Java / Python / Go / Node.js / Rust |
| **框架** | Web 框架选择 | Spring Boot / FastAPI / Gin / Express / Axum |
| **统一规范** | 跨语言不变的契约层 | 响应信封 / 错误码 / JWT / 分页 / api-contract |

**统一规范（跨语言一致）**：

| 规范 | 定义 | 所有后端技能必须遵守 |
|------|------|-------------------|
| 响应信封 | `{ code: 0, message: "success", data: {} }` | ✅ |
| 错误码 | `-1001` 校验 / `-1002` 未授权 / `-1003` 无权限 / ... | ✅ |
| JWT | `Authorization: Bearer {token}` | ✅ |
| 分页 | `page` + `pageSize`（上限 100） | ✅ |
| API 前缀 | `/api` | ✅ |
| 接口契约 | `api-contract.md`（生成产物） | ✅ |

### 13.4 契约连接机制

前后端通过 **api-contract.md** 连接：

```
后端 init-skill 生成 → api-contract.md ← 前端 request.ts 消费
                            │
                    ┌───────┼───────┐
                    │       │       │
              响应格式   错误码表   接口清单
              {code,    -1001~    GET /api/users
               message, -2000    POST /api/login
               data}             ...
```

**强制规则**：
1. 每个 init-skill **必须**生成 `api-contract.md`（模板在 `references/api-contract-template.md`）
2. 每个 module-skill **必须**输出 `api-contract-<module>.md`（接口清单 + 错误码扩展）
3. `frontend-request-skill` 的 `ERROR_CODE_MAP` **必须**与后端 `api-contract.md` 错误码表对齐
4. 项目级编排器（vue-admin-skill / sse-agent-skill）**必须**确保契约从后端传递到前端

### 13.5 README.md 与 SKILL.md 分工

| 文件 | 面向对象 | 内容 | 禁止 |
|------|---------|------|------|
| **SKILL.md** | AI 智能体 | 触发条件、生成流程、输出规范、依赖关系、契约定义 | 安装教程、人类快速上手 |
| **README.md** | 人类用户 | 安装方式、快速上手、目录结构、贡献指南 | 与 SKILL.md 重复的能力清单、触发词列表 |

**禁止重叠**：README.md 不得复制 SKILL.md 中的"核心能力清单"表格或触发词列表。README 应引用 SKILL.md：`详见 [SKILL.md](SKILL.md)`。

---

## 十四、Vibecoding 场景矩阵

本仓库的核心使用场景：**一句话触发，完整前后端项目**。

| 场景 | 前端 | 后端 | 数据库 | 触发示例 |
|------|------|------|--------|---------|
| 管理后台 | vue-base-skill + vue-table-skill + vue-form-skill | springboot-init-skill + auth-module + dict-module | database-design-skill (MySQL) | "帮我做一个管理后台" |
| 小程序 | uniapp-base-skill + uniapp-request-skill | fastapi-init-skill + auth-module | database-design-skill (MySQL) | "帮我做一个小程序" |
| AI 聊天 | vue-base-skill + frontend-request-skill (SSE) | fastapi-init-skill + agent-module | database-design-skill | "帮我做一个 AI 聊天" |
| 轻量后台 | html-frontend-template | nodejs-init-skill | database-design-skill (MongoDB) | "帮我做一个简单的后台" |
| 电商系统 | uniapp-base-skill + vue-form-skill | springboot-init-skill + auth-module + payment-module + storage-module | database-design-skill (MySQL) | "帮我做一个商城" |

---

## 十五、Skill 文档格式强制规范

### 15.1 SKILL.md 必备章节

```markdown
---
name: skill-name
description: 一句话描述（含触发词）
---

# 技能名称

## 定位 / 边界声明（做/不做）

## When to Use / When NOT to Use

## 核心能力清单（表格）

## 生成流程 / 实现规范

## 依赖（引用了哪些其他 skill）

## 输出产物清单
```

### 15.2 README.md 必备章节

```markdown
# 技能名称

> 一句话定位

## 适合场景 / 不适合场景

## 快速上手（人类视角，3 步以内）

## 目录结构

## 详细规范 → [SKILL.md](SKILL.md)

## 贡献指南（可选）
```

### 15.3 STANDARD.md 必备章节（个体规范）

```markdown
# <skill-name> 个体规范

> 上位规范：[<技术栈>/AGENTS.md](../AGENTS.md)　本文件：个体规范

## 一、模块定位（本 skill 做什么 / 不做什么）

## 二、依赖（依赖哪些 skill，依赖方向单向）

## 三、目录约定（本 skill 的目录结构与固定文件）

## 四、内容清单（实现了哪些能力，逐项列出）

## 五、内置约束（编号红线，如 B01 / B02 / C01）

## 六、变更纪律（改本 skill 时必须同步哪些文件）

## 七、自检清单（提交前逐条打勾）
```

**硬性要求**：
- 约束必须**编号**（`B01`、`C01`…），便于跨文档引用与评审。
- 每条编号约束一句话讲清"禁止什么 / 必须怎么做"。
- 头部必须声明上位规范文件路径。
- 不重复上位已写过的通用规则。

### 15.4 模块级 AGENTS.md 必备章节

适用于 `<技术栈目录>/AGENTS.md`（如 `frontend/uniapp/AGENTS.md`）。

```markdown
# <技术栈> 模块规范

> 上位规范：[根 AGENTS.md](../../AGENTS.md)　下属：<各 skill 名>

## 一、模块定位

## 二、层级架构（变量层 / 容器层 / 专项层 及依赖方向）

## 三、唯一真源表（每类资产只有一个真源，写明文件路径）

## 四、跨 skill 协作规则（谁调用谁，调用方必须先做什么）

## 五、变更纪律（改本模块时必须同步哪些文件）

## 六、Demo 与示例规范
```

**硬性要求**：
- 必须有**唯一真源表**（列名：资产 / 真源文件 / 说明）。
- 必须写明**层级依赖方向**，并声明**禁止反向依赖**。
- 必须列出**变更纪律**（改动时同步哪几个文件），杜绝真源分裂。

### 15.5 禁止事项

- ❌ README.md 复制 SKILL.md 的能力清单表格
- ❌ README.md 复制 SKILL.md 的触发词列表
- ❌ SKILL.md 写安装教程（这是 README 的职责）
- ❌ 同一规范在多个 init-skill 中各自内联（应引用公共层）
- ❌ 同一条规则在上层 `AGENTS.md` 与下层 `STANDARD.md` 各写一遍
- ❌ `STANDARD.md` 缺少编号约束，或约束不可被逐条引用
- ❌ 模块级 `AGENTS.md` 没有唯一真源表

---

**【wg-skills】让 AI 时代的编程可进阶、可迭代、可体系化。**

### 公开示例的安全与验收基线

前端请求示例只向配置的 API 源附加项目令牌，公开请求失败不启动会话刷新。演示账号须显式配置凭据，数据库示例须标明并遵循目标引擎方言。可交互页面 Demo 应验证窄屏布局和关键键盘路径。

### 前端一致性审计职责补充（2026-10-31）

`frontend-style-harmonizer-skill` 的审计覆盖公共组件、主题、页面空间、兼容性、图标、前端请求六类；具体取证清单由该技能 references/frontend-audit-checklist.md 维护。原有复用、对齐、硬编码参数保持可用。请求审计默认只读，不扩展到后端实现；静态证据、待验证风险、模拟示例分开记录。


## 2026-10-31 审计技能回滚边界补充

样式治理不得建议整仓回滚覆盖未提交工作；回滚仅针对本次明确的改动，先审查差异并保护用户原有改动。Skill 调用示例是智能体指令，不代表安装了同名终端命令。
