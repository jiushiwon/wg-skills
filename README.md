# wg-skills — Claude Code 精选技能集

> 精选 21 个自包含技能，覆盖后端、前端、小程序、数据库、工具全栈场景。所有开放技能零外部依赖，开箱即用。
> 完整技能体系（90+ 个）请访问 [VibeCoding Portal](https://github.com/jiushiwon/vibecoding-portal)（私有）

---

## 快速使用

```bash
# 克隆到 Claude Code 技能目录
git clone https://github.comjiushiwon/wg-skills.git ~/.claude/skills/wg-skills

# 在 Claude Code 中即可使用，例如：
# "帮我用 springboot-init-skill 初始化一个 Java 项目"
```

---

## 精选技能清单

### 后端（4 个）

| 技能 | 说明 | 路径 |
|------|------|------|
| **springboot-init-skill** | SpringBoot 项目脚手架 | `vibeCoding/backend/java/` |
| **java-fast-skill** | Java 快速开发工具集 | `vibeCoding/backend/java/` |
| **fastapi-init-skill** | FastAPI 项目初始化 | `vibeCoding/backend/python/` |
| **python-fast-skill** | Python 快速开发工具集 | `vibeCoding/backend/python/` |

### 数据库（2 个）

| 技能 | 说明 | 路径 |
|------|------|------|
| **mysql-guide-skill** | MySQL 建模与优化指南 | `vibeCoding/backend/database/` |
| **redis-guide-skill** | Redis 缓存设计指南 | `vibeCoding/backend/database/` |

### 前端（9 个）

| 技能 | 说明 | 依赖 |
|------|------|------|
| **vue-generate-skill** | Vue 页面一键生成（请求层已内嵌） | 无 |
| **vue-theme-skill** | CSS 变量设计 Token + 深色主题 | 无 |
| **vue-card-skill** | 卡片容器（所有组件的根容器） | 无 |
| **vue-button-skill** | 按钮组件（4 类型 / 3 尺寸 / loading） | 无 |
| **vue-status-skill** | 状态标签（5 状态 / dot 模式） | 无 |
| **vue-form-skill** | 表单组件（8 组件体系） | vue-theme-skill |
| **vue-table-skill** | 表格组件（23 种形态） | vue-button / vue-status / vue-card |
| **vue-base-skill** | 基础组件父技能（规范层） | 无 |
| **react-generate-skill** | React 页面生成（请求层已内嵌） | 无 |

### 小程序（4 个）

| 技能 | 说明 | 依赖 |
|------|------|------|
| **uniapp-base-skill** | 基础组件父技能（规范层） | 无 |
| **uniapp-theme-skill** | 主题/样式 Token 系统 | 无 |
| **uniapp-request-skill** | 请求层（小程序适配） | 无 |
| **uniapp-app-generate-skill** | 小程序项目脚手架 | 无 |

### 工具（2 个）

| 技能 | 说明 | 路径 |
|------|------|------|
| **skill-auditor** | 技能质量审计工具 | `others/` |
| **ai-speech-detector** | AI 内容检测（识别 AI 生成文本） | `others/` |

---

## 开放 vs 私有边界

| 维度 | 开放（本仓库 21 个） | 私有（VibeCoding Portal 90+ 个） |
|------|------|------|
| 定位 | 积木块：单技能闭环，可独立使用 | 高级组合：多技能编排、业务场景 |
| 复杂度 | 基础能力（初始化 / 组件 / 规范） | 完整模块（auth / payment / ws / ai-chat） |
| 依赖 | 零外部依赖，开箱即用 | 可依赖多个开放技能 |
| 价值 | 让你尝到 AI 编程的甜头 | 解锁完整生产力 |

**一句话**：开放的是「食材」，私有的是「菜谱」。

---

## 完整技能体系

完整版（90+ 个技能）包含：

- SpringBoot 11 个子模块（auth / payment / storage / redis / kafka ...）
- FastAPI 13 个子模块（auth / ws / ai-chat / payment ...）
- Go / Rust / Node.js 后端
- Vue 25+ 组件技能（图表 / 仪表盘 / CRUD / 登录 / 上传 ...）
- UniApp 15+ 移动端技能
- React Native
- 部署全套（Docker / 原生 / 数据库安装 / 运行时安装 / Nginx）
- 垂直工具（AI 检测 / 人性改写 / 小红书写作 / 视频剪辑）

→ 完整版位于 [VibeCoding Portal](https://github.com/jiushiwon/vibecoding-portal)（私有仓库）

---

## 目录结构

```
wg-skills/
├── vibeCoding/
│   ├── backend/
│   │   ├── java/
│   │   │   ├── springboot-init-skill/
│   │   │   └── java-fast-skill/
│   │   ├── python/
│   │   │   ├── fastapi-init-skill/
│   │   │   └── python-fast-skill/
│   │   └── database/
│   │       ├── mysql-guide-skill/
│   │       └── redis-guide-skill/
│   └── frontend/
│       ├── vue/vue-base-skill/
│       │   ├── vue-theme-skill/
│       │   ├── vue-card-skill/
│       │   ├── vue-button-skill/
│       │   ├── vue-status-skill/
│       │   ├── vue-generate-skill/
│       │   ├── vue-form-skill/
│       │   └── vue-table-skill/
│       ├── react/
│       │   └── react-generate-skill/
│       └── uniapp/
│           ├── uniapp-base-skill/
│           ├── uniapp-theme-skill/
│           ├── uniapp-request-skill/
│           └── uniapp-app-generate-skill/
├── others/
│   ├── skill-auditor/
│   └── ai-speech-detector/
├── AGENTS.md
├── CLAUDE.md
└── LICENSE
```

---

## 许可证

MIT License
