# VibeCoding Guide Skill Implementation Plan — Phase 1: Skeleton

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 创建 `vibecoding-guide-skill/` 父技能及 3 个嵌套子技能的目录骨架、最小可运行的 `SKILL.md` / `README.md`、占位二维码、欠缺技能文档，并更新根目录 `README.md`。

**Architecture:** 参考仓库已有父子技能结构（如 `backend-generate-skill/`），父技能只做意图识别和分流，子技能各自承载独立路线。本阶段只落地空壳与最小内容，详细参考资料在 Phase 2 填充。

**Tech Stack:** Markdown + Git；无需额外依赖。

## Global Constraints

- 所有技能目录使用 kebab-case。
- 每个 `SKILL.md` 必须包含 YAML frontmatter：`name` + `description`。
- 只做推荐，不调用、不包装其他 skill。
- 所有解释与文档使用中文。
- 不替用户执行安装、部署、生成代码。
- 触发词变更后同步更新父技能、子技能 `SKILL.md` 及根目录 `README.md`。

---

### Task 1: 创建父技能 `vibecoding-guide-skill/` 骨架

**Files:**
- Create: `vibecoding-guide-skill/SKILL.md`
- Create: `vibecoding-guide-skill/README.md`
- Create: `vibecoding-guide-skill/assets/humeng.png`
- Create: `vibecoding-guide-skill/references/future-skills.md`

**Interfaces:**
- Consumes: 无
- Produces: 父技能入口文件、二维码占位图、未来技能清单

- [ ] **Step 1: 创建父技能 SKILL.md**

Create `vibecoding-guide-skill/SKILL.md`:

```markdown
---
name: vibecoding-guide-skill
description: VibeCoding / AI 开发全流程知识导师入口。识别用户目标后分流到 vibecoding-workflow-skill、agent-learning-skill 或 agent-interview-skill。只做推荐，不调用其他 skill。
---

# VibeCoding Guide Skill

本技能是 VibeCoding / AI 开发的知识总入口，不执行具体生成任务，只负责把用户分流到合适的子技能。

## 分流规则

| 用户意图 | 进入子技能 |
|----------|------------|
| 想做项目、选型模型/IDE、写提示词、产品开发全流程 | vibecoding-workflow-skill |
| 想了解 Agent、学习智能体、做 Agent | agent-learning-skill |
| 准备 Agent 工程师面试、入行、包装项目 | agent-interview-skill |
| 意图不明确 | 询问用户目标后分流 |

## 使用方式

```
/vibecoding
我想学 VibeCoding
AI 编程怎么入门
```

## 红线

- 不调用、不包装其他 skill。
- 不替用户执行安装、部署、生成代码。
- 子技能触发词变更后，同步更新本文件 description 与 README.md。
```

- [ ] **Step 2: 创建父技能 README.md**

Create `vibecoding-guide-skill/README.md`:

```markdown
# vibecoding-guide-skill

> VibeCoding / AI 开发全流程知识导师入口

## 功能

- 根据用户目标分流到 3 条独立路线：产品落地、Agent 学习、Agent 面试。
- 只推荐、不执行：输出路线、工具、模型、Skill 建议。

## 使用方式

```
/vibecoding
我想学 VibeCoding
AI 编程怎么入门
```

## 子技能

| 子技能 | 说明 |
|--------|------|
| [vibecoding-workflow-skill](vibecoding-workflow-skill/) | 产品落地全流程：工具→模型→IDE→提示词→开发→联调→测试→部署 |
| [agent-learning-skill](agent-learning-skill/) | Agent 系统学习路线 |
| [agent-interview-skill](agent-interview-skill/) | Agent 工程师面试准备 |

## 欠缺技能清单

见 [references/future-skills.md](references/future-skills.md)。
```

- [ ] **Step 3: 创建狐獴笔记二维码占位图**

Run:

```bash
printf '%s' 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==' | base64 -d > vibecoding-guide-skill/assets/humeng.png
```

Expected: `vibecoding-guide-skill/assets/humeng.png` exists and is a valid PNG (file size > 0 bytes).

- [ ] **Step 4: 创建欠缺技能文档 future-skills.md**

Create `vibecoding-guide-skill/references/future-skills.md`:

```markdown
# 当前仓库欠缺的独立 SKILL 清单

本文档记录 VibeCoding 路线中需要的、但当前仓库尚未提供的「生成/审计/工具型」SKILL。这些 SKILL 与 `vibecoding-guide-skill` 互补，未来应独立创建。

## 1. product-brainstorm-skill（产品头脑风暴）

- **解决什么问题**：用户只有一个模糊想法（如"我想做电商"）时，系统拆解出标准产品模块。
- **典型场景**：商城、内容社区、SaaS、O2O 等产品从零规划。
- **建议输出**：产品模块清单、MVP 范围、功能优先级、数据表初稿。
- **定位**：独立技能，可被 `vibecoding-workflow-skill` 推荐。

## 2. fullstack-testing-skill（全栈测试）

- **解决什么问题**：前后端联调、接口规范、生产测试环节缺乏综合视角。
- **典型场景**：接口出入参规范、请求规范、生产/测试环境规范、前后端联调 checklist。
- **建议输出**：测试策略文档、接口契约检查、自动化测试建议。
- **定位**：独立技能，与 `webapp-testing` 互补。

## 3. backend-architecture-skill（后端架构选型）

- **解决什么问题**：`backend-generate-skill` 偏骨架生成，缺少架构决策层（微服务/单体、缓存/消息队列/搜索、分库分表等）。
- **典型场景**：中大型项目技术架构选型、性能与可扩展性评估。
- **建议输出**：架构决策记录（ADR）、组件选型表、风险清单。
- **定位**：独立技能，可被 `vibecoding-workflow-skill` 在"技术架构选型"阶段推荐。
```

- [ ] **Step 5: 提交 Task 1**

```bash
git add vibecoding-guide-skill/SKILL.md vibecoding-guide-skill/README.md vibecoding-guide-skill/assets/humeng.png vibecoding-guide-skill/references/future-skills.md
git commit -m "feat(vibecoding-guide): add parent skill skeleton, placeholder QR and future-skills doc"
```

---

### Task 2: 创建子技能 `vibecoding-workflow-skill/` 骨架

**Files:**
- Create: `vibecoding-guide-skill/vibecoding-workflow-skill/SKILL.md`
- Create: `vibecoding-guide-skill/vibecoding-workflow-skill/README.md`
- Create: `vibecoding-guide-skill/vibecoding-workflow-skill/references/.gitkeep`

**Interfaces:**
- Consumes: 无
- Produces: 子技能 1 的入口与使用说明

- [ ] **Step 1: 创建子技能 SKILL.md**

Create `vibecoding-guide-skill/vibecoding-workflow-skill/SKILL.md`:

```markdown
---
name: vibecoding-workflow-skill
description: VibeCoding 产品落地全流程导师：工具/模型/IDE 选型、提示词、产品模块拆解、开发、联调、测试、部署推荐。最终生成 docs/vibecoding/roadmap.md。触发词：/vibecoding-workflow、我要做商城、帮我选型模型、前后端怎么联调。
---

# VibeCoding Workflow Skill

本技能覆盖从工具选型到产品部署的完整 VibeCoding 落地流程，只推荐不执行。

## 使用方式

### 完整规划
用户描述水平和目标后，生成 `docs/vibecoding/roadmap.md`。

示例：

```
/vibecoding-workflow
我想做一个商城小程序
```

### 快捷入口
直接询问某个阶段，返回对应参考资料内容：

- 模型/IDE 选型
- 提示词怎么写
- 电商系统怎么做
- 前后端怎么联调
- 怎么测试
- 怎么部署

## 红线

- 不调用其他 skill。
- 不替用户执行安装、部署、生成代码。
- 模型价格和可用性信息必须加"需自行核实最新信息"提示。
```

- [ ] **Step 2: 创建子技能 README.md**

Create `vibecoding-guide-skill/vibecoding-workflow-skill/README.md`:

```markdown
# vibecoding-workflow-skill

> VibeCoding 产品落地全流程导师

## 功能

- 模型、IDE、工具链选型推荐
- 提示词工程简化模板
- 产品模块拆解（电商/SaaS/内容等）
- 开发、联调、测试、部署全流程指引

## 使用方式

```
/vibecoding-workflow
我要做商城
帮我选型模型
前后端怎么联调
```

## 输出

完整规划模式下生成 `docs/vibecoding/roadmap.md`。

## 参考资料

见 [references/](references/) 目录，Phase 2 逐步填充。
```

- [ ] **Step 3: 创建 references 目录占位**

Run:

```bash
mkdir -p vibecoding-guide-skill/vibecoding-workflow-skill/references
touch vibecoding-guide-skill/vibecoding-workflow-skill/references/.gitkeep
```

- [ ] **Step 4: 提交 Task 2**

```bash
git add vibecoding-guide-skill/vibecoding-workflow-skill/
git commit -m "feat(vibecoding-workflow): add sub-skill skeleton"
```

---

### Task 3: 创建子技能 `agent-learning-skill/` 骨架

**Files:**
- Create: `vibecoding-guide-skill/agent-learning-skill/SKILL.md`
- Create: `vibecoding-guide-skill/agent-learning-skill/README.md`
- Create: `vibecoding-guide-skill/agent-learning-skill/references/.gitkeep`

**Interfaces:**
- Consumes: 无
- Produces: 子技能 2 的入口与使用说明

- [ ] **Step 1: 创建子技能 SKILL.md**

Create `vibecoding-guide-skill/agent-learning-skill/SKILL.md`:

```markdown
---
name: agent-learning-skill
description: Agent 系统学习路线导师：从 Agent 概念、最小实现、模型底层、算法到 Skill/Tool 学习。触发词：/agent-learning、什么是 Agent、怎么做一个 Agent、Agent 学习路线。
---

# Agent Learning Skill

本技能提供 Agent 技术的系统学习路线，只推荐学习资源和路径，不执行代码生成。

## 使用方式

### 完整规划
用户说明当前基础和学习目标后，生成个人学习路线图。

示例：

```
/agent-learning
我想系统学习 Agent，小白起步
```

### 快捷入口
- Agent 是什么
- 怎么做一个最小 Agent
- 需要学哪些模型底层知识
- 怎么写 Claude Code Skill

## 红线

- 不调用其他 skill。
- 不替用户运行实验或安装环境。
```

- [ ] **Step 2: 创建子技能 README.md**

Create `vibecoding-guide-skill/agent-learning-skill/README.md`:

```markdown
# agent-learning-skill

> Agent 系统学习路线导师

## 功能

- Agent 概念与架构
- 最小 Agent 实现路径
- 模型底层与算法知识树
- Skill / MCP / Tool 学习指引

## 使用方式

```
/agent-learning
什么是 Agent
怎么做一个 Agent
Agent 学习路线
```

## 参考资料

见 [references/](references/) 目录，Phase 2 逐步填充。
```

- [ ] **Step 3: 创建 references 目录占位**

Run:

```bash
mkdir -p vibecoding-guide-skill/agent-learning-skill/references
touch vibecoding-guide-skill/agent-learning-skill/references/.gitkeep
```

- [ ] **Step 4: 提交 Task 3**

```bash
git add vibecoding-guide-skill/agent-learning-skill/
git commit -m "feat(agent-learning): add sub-skill skeleton"
```

---

### Task 4: 创建子技能 `agent-interview-skill/` 骨架

**Files:**
- Create: `vibecoding-guide-skill/agent-interview-skill/SKILL.md`
- Create: `vibecoding-guide-skill/agent-interview-skill/README.md`
- Create: `vibecoding-guide-skill/agent-interview-skill/references/.gitkeep`

**Interfaces:**
- Consumes: 无
- Produces: 子技能 3 的入口与使用说明

- [ ] **Step 1: 创建子技能 SKILL.md**

Create `vibecoding-guide-skill/agent-interview-skill/SKILL.md`:

```markdown
---
name: agent-interview-skill
description: Agent 工程师面试准备导师：知识树、项目包装、模拟面试题。触发词：/agent-interview、Agent 工程师面试、准备 Agent 面试、Agent 面试题。
---

# Agent Interview Skill

本技能帮助准备 Agent 工程师面试，输出面试准备计划与知识清单，不替代真实面试或项目经验。

## 使用方式

### 完整规划
用户提供背景和目标岗位后，生成 `docs/vibecoding/agent-interview-plan.md`。

示例：

```
/agent-interview
我想准备 Agent 工程师面试，目前会 Python 和 Prompt Engineering
```

### 快捷入口
- Agent 面试常考哪些知识点
- 怎么把 VibeCoding 项目写成简历项目
- 给我 10 道 Agent 面试题

## 红线

- 不调用其他 skill。
- 不保证面试结果。
```

- [ ] **Step 2: 创建子技能 README.md**

Create `vibecoding-guide-skill/agent-interview-skill/README.md`:

```markdown
# agent-interview-skill

> Agent 工程师面试准备导师

## 功能

- Agent 工程师面试知识树
- VibeCoding 项目简历包装建议
- 模拟面试题清单

## 使用方式

```
/agent-interview
Agent 工程师面试
准备 Agent 面试
Agent 面试题
```

## 输出

完整规划模式下生成 `docs/vibecoding/agent-interview-plan.md`。

## 参考资料

见 [references/](references/) 目录，Phase 2 逐步填充。
```

- [ ] **Step 3: 创建 references 目录占位**

Run:

```bash
mkdir -p vibecoding-guide-skill/agent-interview-skill/references
touch vibecoding-guide-skill/agent-interview-skill/references/.gitkeep
```

- [ ] **Step 4: 提交 Task 4**

```bash
git add vibecoding-guide-skill/agent-interview-skill/
git commit -m "feat(agent-interview): add sub-skill skeleton"
```

---

### Task 5: 更新根目录 README.md

**Files:**
- Modify: `README.md`

**Interfaces:**
- Consumes: 无
- Produces: 根目录技能列表中新增 `vibecoding-guide-skill` 条目

- [ ] **Step 1: 在「当前可用 Skills」区域新增父技能介绍**

在 `README.md` 的「当前可用 Skills」列表末尾（`workflow-diagram-skill` 之后）新增一段：

```markdown
---

### 21. vibecoding-guide-skill 🧭

> VibeCoding / AI 开发全流程知识导师（父技能 + 3 嵌套子技能）

**功能**：把用户分流到三条独立路线——VibeCoding 产品落地、Agent 系统学习、Agent 工程师面试准备。只做推荐，不执行具体生成任务。

**子技能**：

| 子技能 | 职责 |
|--------|------|
| [vibecoding-workflow-skill](vibecoding-guide-skill/vibecoding-workflow-skill/) | 工具→模型→IDE→提示词→产品模块→开发→联调→测试→部署 |
| [agent-learning-skill](vibecoding-guide-skill/agent-learning-skill/) | Agent 概念→制作→模型底层→算法→Skill 学习 |
| [agent-interview-skill](vibecoding-guide-skill/agent-interview-skill/) | 面试知识树 + 项目包装 + 模拟题 |

**使用方式**：

```
/vibecoding
我想学 VibeCoding
AI 编程怎么入门
```

**详细文档**：[vibecoding-guide-skill/README.md](vibecoding-guide-skill/README.md)
```

- [ ] **Step 2: 在「Skill 一览」表格新增一行**

在 `README.md` 末尾的 Skill 一览表格新增一行：

```markdown
| [vibecoding-guide-skill](vibecoding-guide-skill/) | VibeCoding / AI 开发知识导师（3 子技能） | `/vibecoding`、`我想学 VibeCoding` |
```

- [ ] **Step 3: 提交 Task 5**

```bash
git add README.md
git commit -m "docs: add vibecoding-guide-skill to root README"
```

---

### Task 6: 验证与最终提交

**Files:**
- 验证所有新建文件

**Interfaces:**
- Consumes: 前面 5 个任务的产物
- Produces: 通过结构验证

- [ ] **Step 1: 验证目录结构**

Run:

```bash
ls -R vibecoding-guide-skill/
```

Expected output contains:

```
vibecoding-guide-skill/:
README.md
SKILL.md
agent-interview-skill
agent-learning-skill
assets
references
vibecoding-workflow-skill

vibecoding-guide-skill/agent-interview-skill:
README.md
SKILL.md
references

vibecoding-guide-skill/agent-interview-skill/references:
.gitkeep

vibecoding-guide-skill/agent-learning-skill:
README.md
SKILL.md
references

vibecoding-guide-skill/agent-learning-skill/references:
.gitkeep

vibecoding-guide-skill/assets:
humeng.png

vibecoding-guide-skill/references:
future-skills.md

vibecoding-guide-skill/vibecoding-workflow-skill:
README.md
SKILL.md
references

vibecoding-guide-skill/vibecoding-workflow-skill/references:
.gitkeep
```

- [ ] **Step 2: 验证每个 SKILL.md 都有 frontmatter**

Run:

```bash
grep -l "^---" vibecoding-guide-skill/SKILL.md vibecoding-guide-skill/vibecoding-workflow-skill/SKILL.md vibecoding-guide-skill/agent-learning-skill/SKILL.md vibecoding-guide-skill/agent-interview-skill/SKILL.md
```

Expected: 4 个文件路径均输出。

- [ ] **Step 3: 验证根目录 README 已更新**

Run:

```bash
grep -n "vibecoding-guide-skill" README.md
```

Expected: 至少输出 2 行（介绍段 + 表格行）。

- [ ] **Step 4: 最终提交检查**

Run:

```bash
git status
```

Expected: working tree clean，无未提交改动。

---

## Spec Coverage Check

| 设计文档要求 | 对应任务 |
|--------------|----------|
| 父技能目录与分流 | Task 1 |
| 3 个嵌套子技能目录 | Task 2、3、4 |
| 狐獴笔记二维码占位图 | Task 1 |
| 欠缺技能文档 future-skills.md | Task 1 |
| 根目录 README 更新 | Task 5 |
| 不调用其他 skill 的红线 | 已写入各 SKILL.md |

## Placeholder Scan

- 无 TBD / TODO。
- Phase 2 参考资料使用 `.gitkeep` 占位，符合"先落地空壳"的明确阶段目标。
