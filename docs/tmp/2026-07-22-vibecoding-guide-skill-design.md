# VibeCoding Guide Skill 设计文档

## 1. 背景与目标

用户希望有一个**知识型导师技能**，帮助任何水平的人进入或进阶 VibeCoding / AI 开发世界。该技能不执行具体生成任务，只做推荐、规划和知识引导，最终输出一份详细的个人路线图文档。

## 2. 核心决策

- **不调用其他 skill**：只做推荐，不包装、不触发仓库内其他 skill。
- **父技能 + 嵌套子技能**：参考 `backend-generate-skill`、`super-deploy-skills` 的父子结构，把三条独立路线拆成子技能，便于独立演进。
- **先建空壳，再填内容**：第一阶段先把目录和占位 `SKILL.md` 落地；第二阶段再完善各子技能内容。

## 3. 目录结构

```
vibecoding-guide-skill/                 # 父入口：识别意图 + 分流
├── SKILL.md
├── README.md
├── assets/
│   └── humeng.png                      # 狐獴笔记二维码占位图，后续替换
├── references/
│   └── future-skills.md                # 当前仓库欠缺的独立 SKILL 清单
├── vibecoding-workflow-skill/          # 子技能 1：VibeCoding 产品落地全流程
│   ├── SKILL.md
│   ├── README.md
│   └── references/
│       ├── tools-and-models.md
│       ├── prompt-patterns.md
│       ├── product-modules.md
│       ├── dev-lifecycle.md
│       └── skill-map.md
├── agent-learning-skill/               # 子技能 2：Agent 系统学习路线
│   ├── SKILL.md
│   ├── README.md
│   └── references/
│       ├── agent-concepts.md
│       ├── agent-building.md
│       ├── model-fundamentals.md
│       └── skill-authoring.md
└── agent-interview-skill/              # 子技能 3：Agent 工程师面试准备
    ├── SKILL.md
    ├── README.md
    └── references/
        ├── interview-knowledge-tree.md
        ├── project-portfolio.md
        └── coding-prep.md
```

## 4. 各技能职责与触发词

| 技能 | 职责 | 触发词 |
|------|------|--------|
| `vibecoding-guide-skill` | 识别用户目标，分流到子技能 | `/vibecoding`、`我想学 VibeCoding`、`AI 编程入门` |
| `vibecoding-workflow-skill` | 工具→模型→IDE→提示词→产品模块→开发→联调→测试→部署 | `/vibecoding-workflow`、`我要做商城`、`帮我选型模型`、`前后端怎么联调` |
| `agent-learning-skill` | Agent 概念→制作→模型底层→算法→Skill 学习 | `/agent-learning`、`什么是 Agent`、`怎么做一个 Agent` |
| `agent-interview-skill` | Agent 工程师面试知识树 + 项目包装 + coding 准备 | `/agent-interview`、`Agent 工程师面试`、`准备 Agent 面试` |

## 5. 父技能分流规则

```
用户输入 → vibecoding-guide-skill
    ├── 含 "Agent" 且含 "面试" / "找工作" / "入行" → agent-interview-skill
    ├── 含 "Agent" / "智能体" / "做 Agent" → agent-learning-skill
    ├── 含 "做项目" / "商城" / "SaaS" / "小程序" / "开发" / "模型" / "IDE" / "提示词" → vibecoding-workflow-skill
    └── 未命中以上任何一条 → 询问用户目标后分流
```

## 6. 子技能内部流程

### 6.1 vibecoding-workflow-skill

两种使用模式：

1. **完整规划模式**：问 4 个问题，生成 `docs/vibecoding/roadmap.md`。
   - 当前水平？（小白 / 进阶 / 大佬）
   - 主要目标？（学工具 / 做产品 / 系统学习）
   - 具体方向？（商城 / SaaS / 博客 / 小程序 / 无）
   - 约束？（预算、团队、国内/海外模型、部署环境）
2. **快捷入口模式**：用户直接问某个阶段，返回对应 reference 内容。
   - 模型/IDE 选型 → `references/tools-and-models.md`
   - 提示词 → `references/prompt-patterns.md` + 狐獴笔记二维码
   - 产品模块拆解 → `references/product-modules.md`
   - 开发/联调/测试/部署 → `references/dev-lifecycle.md` + `references/skill-map.md`

### 6.2 agent-learning-skill

按学习阶段组织：

1. Agent 是什么（概念、与 LLM 的区别、典型架构）
2. 如何做一个最小 Agent（工具调用、记忆、规划、执行循环）
3. 模型底层与算法（Transformer、RAG、Fine-tuning、Eval）
4. Skill / Tool 学习（Claude Code Skill、MCP、Function Calling）
5. 推荐学习路径与练习项目

### 6.3 agent-interview-skill

输出 `docs/vibecoding/agent-interview-plan.md`：

1. 面试知识树（LLM、Prompt、RAG、Agent、Eval、系统设计）
2. 项目包装建议（如何把 VibeCoding 项目写成简历项目）
3. Coding 与算法准备
4. 模拟面试问题清单

## 7. 输出文档模板

`vibecoding-workflow-skill` 生成的 `docs/vibecoding/roadmap.md` 包含：

1. 个人画像与目标
2. 装备层：模型 + IDE 推荐（按水平和约束）
3. 提示词层：学习路径 + 模板 + 狐獴笔记
4. 产品落地路线图（若目标含做产品）
5. Agent 学习路线（若相关）
6. 面试准备路线（若相关）
7. 下一步行动清单
8. 附录：速查表

## 8. future-skills.md 内容

列出当前仓库欠缺的独立 SKILL，并说明场景：

- `product-brainstorm-skill`：完整产品模块拆解（电商/内容/SaaS）
- `fullstack-testing-skill`：前后端联调、接口规范、生产测试综合视角
- `backend-architecture-skill`：后端架构选型与治理

## 9. 实施阶段

### 第一阶段：建空壳

- 创建 `vibecoding-guide-skill/` 及 3 个子技能目录。
- 每个子技能写入最小 `SKILL.md` 占位文件。
- 创建 `assets/humeng.png` 占位图。
- 创建 `references/future-skills.md`。
- 更新根目录 `README.md` 的「当前可用 Skills」表格。

### 第二阶段：填内容

- 完善 `vibecoding-workflow-skill/references/` 下 5 份参考资料。
- 完善 `agent-learning-skill/references/` 下 4 份参考资料。
- 完善 `agent-interview-skill/references/` 下 3 份参考资料。
- 完善父技能 `SKILL.md` 分流逻辑。
- 补充各子技能 `README.md` 使用示例。

## 10. 红线

- 不调用、不包装其他 skill。
- 不替用户执行安装、部署、生成代码。
- 模型价格和可用性信息必须加「需自行核实最新信息」提示。
- 触发词变更后同步更新父技能与子技能 `SKILL.md` 及根目录 `README.md`。
