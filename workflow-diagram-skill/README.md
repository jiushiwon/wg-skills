# workflow-diagram-skill - 一句话生成流程图

> 用户不需要画节点和箭头，说一句话就能生成多风格流程图。

## 解决什么问题

- 打开 draw.io / Excalidraw 太麻烦，想一键出图
- 做公众号、视频、PPT 经常需要流程图，但不想花时间排版
- 想要统一的风格，而不是每次重新设计

## 用法

### 现成模板（最常用）

```
画个 vibe coding 流程图
生成英语学习流程图
画一个副业赚钱流程，用 cute 风格
```

### 切换风格

```
画个 vibe coding 流程图，用草图风格
生成理财流程图，dark 风格
画个健身流程图，用 cute 风格
```

### 切换布局

```
画一个学习流程，横向布局
生成步骤图，左右布局
```

### 切换箭头

```
画个流程图，用曲线箭头
生成步骤图，曲线
```

### 自定义步骤

```
帮我画一个项目上线流程：代码评审 -> 合并 -> 构建 -> 部署 -> 验证
```

### 一句话智能生成

只给模糊主题，AI 自动推断步骤：

```
画一个 AI Agent 学习路径，我要找工作
帮我画程序员成长路径
生成一个产品从 0 到 1 的流程图
```

## 目录说明

```
workflow-diagram-skill/
├── SKILL.md                        # 技能入口：触发词 + 工作模式 + 规则
├── README.md                       # 本文件
├── scripts/
│   ├── generate_diagram.py         # SVG 生成主脚本
│   ├── svg2png.py                  # PNG 渲染脚本
│   └── init_skill_assets.py        # 依赖检测与初始化
├── references/
│   ├── templates.md                # 现成模板库（24个）
│   ├── style-flat-icon.md          # Flat Icon 风格规范
│   ├── style-sketchy.md            # 暖白手账风格规范
│   ├── style-dark.md               # Dark 风格规范
│   ├── style-cute.md               # Cute 插画风格规范
│   └── icon-library.md             # 图标定义
└── assets/
    └── (运行时输出目录，已被 gitignore)
```

## 支持风格

| 风格 | 特点 | 适用场景 |
|------|------|----------|
| `flat` | 圆角、实色图标、蓝色箭头 | 文档、PPT、技术博客 |
| `sketchy` | 暖白手账风、铅笔灰边框、手写字体 | 公众号、视频、演讲 |
| `dark` | 深色背景、高对比 | 代码仓库、深色主题文章 |
| `cute` | 马卡龙配色、圆润胶囊、可爱图标 | 公众号、小红书、知识付费 |

## 支持布局

| 布局 | 特点 | 适用场景 |
|------|------|----------|
| `vertical` (默认) | 上下分阶段 | 步骤多/有分组 |
| `horizontal` | 左右横向 | 步骤少/线性流程 |

## 支持箭头

| 箭头 | 特点 | 适用场景 |
|------|------|----------|
| `straight` (默认) | 直线箭头 | 简洁/正式 |
| `curved` | 曲线箭头 | 柔和/活泼 |

## 模板列表（24个）

### AI / 开发
- `vibe-coding`：Vibe Coding 完整流程（含头脑风暴、架构选型、部署上线）
- `claude-code`：Claude Code 开发工作流
- `codex`：Codex 开发工作流
- `ai-learning`：AI 学习路径
- `llm-internals`：LLM 内部结构/训练推理流程
- `rag-flow`：RAG 检索增强生成流程

### 学习流程
- `english-learning`：英语学习路径
- `finance-learning`：理财学习路径
- `coding-learning`：编程学习路径
- `exam-cert`：考证流程

### 日常流程
- `fitness-flow`：健身流程
- `morning-routine`：早起流程
- `house-buying`：买房流程
- `travel-flow`：自助旅行流程
- `healthy-life`：健康生活流程
- `side-hustle`：副业赚钱流程

### 工作流程
- `onboarding`：入职流程
- `programmer-daily`：程序员上班一天
- `meeting-flow`：会议组织流程
- `product-launch`：产品上线流程

### 学术 / 医疗
- `phd-research`：博士生研究流程
- `graduation`：毕业流程
- `medical-conference`：医学报告大会流程

### 内容创作
- `short-drama-ai-video`：短剧 AI 视频制作流程
- `xiaohongshu-start`：小红书起号流程

## 自定义模板

在 `references/templates.md` 中按 YAML 格式添加：

```yaml
- id: my-flow
  name: 我的流程
  category: 自定义
  tags: [my, flow]
  default_style: flat
  nodes:
    - id: a
      label: 步骤 A
      sub: 说明
      icon: user
  edges:
    - from: a
      to: b
```

## 依赖安装

首次使用会自动检测并提示安装：

```bash
pip install pyyaml
npm install puppeteer-core --no-save
```

同时需要系统中已安装 Edge 或 Chrome。

## 兼容性

- 输出 SVG + PNG
- 中文显示正常
- 可在 Windows / macOS / Linux 运行

## 更新记录

- 2026-07-22：初版，支持 flat / sketchy / dark / cute 四种风格，内置 14 个模板
- 2026-07-22：新增横向布局、曲线箭头，新增 10 个学习/日常模板，共 24 个
