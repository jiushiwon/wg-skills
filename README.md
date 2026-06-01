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

## 📋 Skill 列表

| Skill | 说明 | 触发关键词 |
|------------|------------------|------------------|
| [frontend-code-doctor](frontend-code-doctor/) | 前端代码审查 | 审查代码、code review |
| [ai-speech-detector](ai-speech-detector/) | AI 风检测 | AI风、AI味、像AI写的 |

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
├── frontend-code-doctor/ # Skill 1
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
└── ai-speech-detector/    # Skill 2
    ├── SKILL.md
    ├── README.md
    └── references/
        └── ai-words.md
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