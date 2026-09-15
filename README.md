# wg-skills — Claude Code 精选技能集

> 精选 10 个高频实用技能，覆盖后端、前端、数据库全栈场景。
> 完整技能体系（90+ 个）请访问 [VibeCoding Portal](https://github.com/jiushiwon/vibecoding-portal)（私有）

---

## 快速使用

```bash
# 克隆到 Claude Code 技能目录
git clone https://github.com/jiushiwon/wg-skills.git ~/.claude/skills/wg-skills

# 在 Claude Code 中即可使用，例如：
# "帮我用 springboot-init-skill 初始化一个 Java 项目"
```

---

## 精选技能清单

### 后端（4 个）

| 技能 | 说明 | 路径 |
|------|------|------|
| ☕ **springboot-init-skill** | SpringBoot 项目脚手架 | `vibeCoding/backend/java/` |
| ⚡ **java-fast-skill** | Java 快速开发工具集 | `vibeCoding/backend/java/` |
| 🐍 **fastapi-init-skill** | FastAPI 项目初始化 | `vibeCoding/backend/python/` |
| 🚀 **python-fast-skill** | Python 快速开发工具集 | `vibeCoding/backend/python/` |

### 数据库（2 个）

| 技能 | 说明 | 路径 |
|------|------|------|
| 🐬 **mysql-guide-skill** | MySQL 建模与优化指南 | `vibeCoding/backend/database/` |
| 🔴 **redis-guide-skill** | Redis 缓存设计指南 | `vibeCoding/backend/database/` |

### 前端（4 个）

| 技能 | 说明 | 路径 |
|------|------|------|
| 📄 **vue-generate-skill** | Vue 页面一键生成 | `vibeCoding/frontend/vue/` |
| 📝 **vue-form-skill** | Vue 表单组件 | `vibeCoding/frontend/vue/` |
| 📊 **vue-table-skill** | Vue 表格组件 | `vibeCoding/frontend/vue/` |
| ⚛️ **react-generate-skill** | React 页面生成 | `vibeCoding/frontend/react/` |

### 工具（1 个）

| 技能 | 说明 | 路径 |
|------|------|------|
| 🔍 **skill-auditor** | 技能质量审计工具 | `others/` |

---

## 完整技能体系

公开版本仅包含精选 10 个技能。**完整版（90+ 个技能）** 包含：

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
│       │   ├── vue-generate-skill/
│       │   ├── vue-form-skill/
│       │   └── vue-table-skill/
│       └── react/
│           └── react-generate-skill/
├── others/
│   └── skill-auditor/
├── AGENTS.md
├── CLAUDE.md
└── LICENSE
```

---

## 许可证

MIT License
