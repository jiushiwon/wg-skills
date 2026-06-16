# wg-skills 🛠️

> Claude Code 技能集合，让 AI 更懂你的开发需求

## 什么是 Skills？

Skills 是 Claude Code 的能力扩展，通过预先定义的规则和指令，让 AI 在特定场景下表现更专业、更精准。

每个 Skill 包含：
- **触发条件**：什么情况下调用
- **审查规则**：具体的检查维度
- **输出格式**：标准化的结果呈现
- **参考资料**：相关的技术文档

## 🚀 快速开始

### 安装 Skills

skills 已经随 Claude Code 一起安装，无需额外操作。

### 使用方式

直接告诉 Claude 你要做什么：

```
帮我审查前端代码
检测这段文案有没有AI风
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

**功能**：自动检测前端代码质量问题、性能问题、安全漏洞

**使用场景**：
- 审查 Vue/React 项目代码
- 检查 TypeScript 类型安全
- 发现性能问题和内存泄漏
- 检测安全漏洞（XSS、CSRF）
- 审查 i18n 和 Accessibility

**使用方式**：

```
/frontend-code-review
```

或

```
帮我审查下这个前端项目
看看代码有什么问题
```

**详细文档**：[frontend-code-doctor/README.md](frontend-code-doctor/README.md)

---

### 2. ai-speech-detector 🗣️

> AI 风检测技能

**功能**：检测文案中的 AI 风味词汇、套话、车轱辘话

**使用场景**：
- 检测文章是否 AI 生成
- 公号文审稿
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

## 📋 Skill 列表

| Skill | 说明 | 触发关键词 |
|------------|------------------|------------------|
| [frontend-code-doctor](frontend-code-doctor/) | 前端代码审查 | 审查代码、code review |
| [ai-speech-detector](ai-speech-detector/) | AI 风检测 | AI风、AI味、像AI写的 |
| [frontend-ui-foundry](frontend-ui-foundry/) | 综合前端 UI | 生成 UI、优化项目、Token 统一 |
| [demo/foundry-demo](demo/foundry-demo/) | 端到端示例 | admin-dashboard · Supabase 风 · html-tailwind |

---

## 🧰 工具脚本

### png_genernate_scripts 🖼️

> 一键批量生成 PNG 图标工具集

**功能**：从 SVG 源文件一键生成 tabBar 图标、通用图标、分享封面等多尺寸 PNG，支持自动修复 `pages.json` 缺失的 `iconPath`。

**使用场景**：
- 小程序 / uniapp 项目图标批量生成
- 根据 tabBar 文字自动匹配语义图标
- 统一输出 81×81 tabBar 图标、48×48 页面图标、500×400 分享封面

**使用方式**：

```bash
# 智能生成全部图标（推荐）
node png_genernate_scripts/gen-icons.js

# 预览需要生成的文件
node png_genernate_scripts/gen-icons.js --dry-run

# 批量 SVG → PNG
node png_genernate_scripts/generate-all-icons.js
```

**详细文档**：[png_genernate_scripts/README.md](png_genernate_scripts/README.md)

---

## ➕ 添加新 Skill

### 方式一：手动创建

```
wg-skills/
├── new-skill/
│   ├── SKILL.md          # 必须：技能定义
│   ├── README.md         # 可选：使用文档
│   └── references/     # 可选：参考规则
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
├── README.md              # 本文件
├── SKILL.md               # 入口定义（旧格式，保留兼容）
├── frontend-code-doctor/  # Skill 1
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
├── ai-speech-detector/    # Skill 2
│   ├── SKILL.md
│   ├── README.md
│   └── references/
│       └── ai-words.md
├── demo/                  # Foundry 端到端 demo
│   └── foundry-demo/      # admin-dashboard 完整示例
│       ├── index.html
│       ├── assets/css/tokens.css
│       ├── tailwind.config.js
│       ├── README.md
│       └── forge-report.md
└── frontend-ui-foundry/   # Skill 3（综合前端 UI，56 文件）
    ├── SKILL.md           # 入口（8 子命令路由）
    ├── README.md          # 使用文档（GitHub 首页）
    ├── docs/              # 11 份独立使用文档
    │   ├── README.md
    │   └── usage/         # 10 份使用指南
    ├── references/        # 24 份知识库
    │   ├── anti-patterns.md
    │   ├── tokens/        # 6 份
    │   ├── scenarios/     # 8 份
    │   ├── brands/        # 11 份（58 总览 + 10 详细）
    │   ├── stacks/        # 6 份
    │   └── commands/      # 8 份
    ├── scripts/           # 4 个工具脚本
    ├── templates/         # 2 份 Token 模板
    └── demo/              # 端到端验证
└── png_genernate_scripts/ # 图标生成工具集
    ├── README.md          # 本文件
    ├── package.json
    ├── gen-icons.js
    ├── generate-all-icons.js
    ├── generate-all-icons.py
    ├── svg-to-png.py
    └── svgs/              # SVG 源文件
        ├── *.svg
        └── tabbar/
            └── *.svg
```

---

## 🤝 贡献

欢迎提交新的 Skill！

1. Fork 项目
2. 创建新技能目录
3. 添加 SKILL.md 和 README.md
4. 提交 Pull Request

---

## 📄 License

MIT License