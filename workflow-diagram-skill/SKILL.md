---
name: workflow-diagram-skill
description: Use when 用户想用一句话生成流程图、工作流图解、开发流程图、AI 流程图或任何步骤型图解，支持多风格输出（flat icon / 暖白手账风 / dark / cute），并提供现成模板一键出图。
---

# workflow-diagram-skill - 一句话生成流程图

核心原则：**用户不需要描述节点和箭头，只需要说「画个 XXX 流程图」**，skill 自动匹配模板或理解语义生成 SVG + PNG。

## 适用场景

- 开发/AI 工作流：vibe coding、Claude Code / Codex 开发流程、AI 学习路径、LLM 原理图
- 通用流程：入职、毕业、程序员上班、会议组织
- 学术/医疗：博士生研究流程、医学报告大会流程
- 内容创作：短剧 AI 视频制作、小红书起号流程
- 自定义流程：用户提供步骤，skill 生成图解

## 触发词

| 类型 | 示例 |
|------|------|
| 现成模板 | `画个 vibe coding 流程图`、`生成 Claude Code 开发流程图`、`短剧 AI 视频制作流程图` |
| 通用流程 | `画个入职流程图`、`毕业流程图`、`程序员上班流程图` |
| 自定义步骤 | `帮我画一个 XXX 的流程图，步骤是：A → B → C` |
| 一句话生成 | `画一个 AI Agent 学习流程，我要找工作`、`帮我画程序员成长路径` |
| 风格切换 | `用草图风格`、`换成 dark 风格`、`扁平风格` |
| 风格切换 | `用 cute 风格`、`可爱风格`、`插画风格` |

## 🎨 可选风格（4 种）

直接说想要的风格即可切换：

| 风格 | 说明 | 适合 |
|------|------|------|
| **flat** (默认) | clean、圆角、蓝色箭头 | 文档/PPT |
| **sketchy** | 暖白手账风、铅笔灰边框 | 公众号/视频 |
| **dark** | 深色背景、高对比 | 技术博客/Github |
| **cute** | 马卡龙配色、圆润胶囊 | 小红书/知识付费 |

📌 **快速切换**：说「换成 cute 风格」「用 dark 风格」即可

## 📐 布局方式

| 布局 | 说明 | 适合 |
|------|------|------|
| **vertical** (默认) | 上下分阶段 | 步骤多/有分组 |
| **horizontal** | 左右横向 | 步骤少/线性流程 |

📌 **切换**：说「横向布局」「改成左右」即可

## 〰️ 箭头样式

| 箭头 | 说明 | 适合 |
|------|------|------|
| **straight** (默认) | 直线箭头 | 简洁/正式 |
| **curved** | 曲线箭头 | 柔和/活泼 |

📌 **切换**：说「用曲线箭头」「改成曲线」即可

---

## 📋 全部内置模板（25 个）

### AI/开发（6个）
`vibe-coding` · `claude-code` · `codex` · `ai-learning` · `llm-internals` · `rag-flow`

### 学习流程（4个）
`english-learning` · `finance-learning` · `coding-learning` · `exam-cert`

### 日常流程（6个）
`fitness-flow` · `morning-routine` · `house-buying` · `travel-flow` · `healthy-life` · `side-hustle`

### 工作流程（4个）
`onboarding` · `programmer-daily` · `meeting-flow` · `product-launch`

### 学术/医疗（3个）
`phd-research` · `graduation` · `medical-conference`

### 内容创作（2个）
`short-drama-ai-video` · `xiaohongshu-start`

📌 **直接说**：「画个 vibe coding 流程图」「生成英语学习流程」「画一个副业赚钱流程」

---

### 🤖 推荐的模型/平台组合

| 场景 | 推荐组合 | 说明 |
|------|----------|------|
| 快速原型 | **Codex + Cursor** | 在线沙盒，即开即用 |
| 本地开发 | **Claude / Grok + VSCode** | 完全离线，数据不外出 |
| 深度定制 | **Claude + Windsurf** | 超长上下文，适合大型项目 |
| 国内白嫖 | **通义千问 / DeepSeek + VSCode** | 免费额度够用 |
| 全栈开发 | **Claude + Cursor** | 前端/后端/数据库一把梭 |

📌 **画这类图**：可以说「画个 Claude Code + Cursor 开发流程图」「画个 Codex 工作流」

---

### 🆕 自定义复杂流程

如果内置模板不满足需求，直接给步骤就能画。复制下面的格式修改：

```
画一个 [主题] 流程图，步骤是：
1. [步骤1]
2. [步骤2]
3. [步骤3]
4. [步骤4]
可选：换成 [sketchy/dark/cute] 风格
```

**示例**：
```
画一个 AI PPT 制作流程图，步骤是：
1. 主题确认
2. 大纲生成
3. 内容填充
4. AI 生图
5. 排版美化
6. 导出分享
用 cute 风格
```

📌 **节点超过 8 个会自动分组**，不用担心太乱

## 工作模式

### A. 现成模板（一键出图）

1. 提取用户话题关键词。
2. 在 `references/templates.md` 中按 `id` / `name` / `tags` / `category` 模糊匹配。
3. 命中模板后读取其 `nodes` 和 `edges`。
4. 默认风格为 `flat`，用户可指定 `sketchy` / `dark` / `cute`。
5. 调用 `scripts/generate_diagram.py` 生成 SVG，再调用 `scripts/svg2png.py` 渲染 PNG。
6. 输出文件路径并展示 PNG。

### B. 自定义流程（用户给步骤）

1. 从用户输入中提取流程名称和步骤列表。
2. 如果步骤 ≤8 个，直接按顺序垂直排列；如果步骤多，自动分组或换横向布局。
3. 用户没说风格时默认 `flat`。
4. 同样调用脚本生成 SVG + PNG。

### C. 一句话智能生成（用户只给主题）

当用户只给一个模糊主题（如「学习 AI Agent」「如何应聘大厂」）时：

1. **理解意图**：分析用户的描述，提取核心需求
2. **生成步骤**：根据领域知识，自动推断合理的步骤结构
3. **调用脚本**：用生成的节点数据调用 `generate_diagram.py`

**示例处理**：
- 用户说「帮我画一个学习 AI Agent 和大模型的流程，要精细一点，要去应聘当牛马」
- Skill 自动分析：
  - 主题：AI Agent + 大模型学习路径
  - 受众：求职者（想去大厂）
  - 自动生成：基础概念 → 机器学习 → 深度学习 → LLM → Agent 开发 → 项目实战 → 面试准备 → 大厂应聘
4. 自动选择合适风格（默认 flat）
5. 生成 SVG + PNG

**📌 怎么说都行**：
- 「画个 AI 学习流程，我要找工作」
- 「帮我画一个程序员成长路径」
- 「生成一个产品从 0 到 1 的流程图」
- 「画一个去大城市闯荡的流程」

### C. 风格切换

- `flat`： clean、圆角、实色图标、蓝色主流程箭头，适合文档/PPT
- `sketchy`： 暖白手账风、铅笔灰边框、手写字体，适合公众号/视频
- `dark`： 深色背景、高对比，适合技术博客/Github
- `cute`：马卡龙配色、圆润胶囊节点、可爱描边图标，适合公众号/小红书/知识付费

## 输出规格

- SVG：矢量源文件，可二次编辑
- PNG：2x 分辨率，直接可用
- 默认保存到当前工作目录：`{topic}-diagram.svg` 和 `{topic}-diagram.png`
- 节点标题 ≤6 字，副标题 ≤14 字，保证可读性

## 硬性规则

- 不要问用户「节点怎么连」，模板优先、语义推断兜底。
- 风格只在用户明确指定或上下文已提及时切换，默认 `flat`。
- 节点超过 8 个时必须分组（用虚线容器），禁止一条长流程塞到底。
- 必须同时输出 SVG 和 PNG，不能只输出一个。
- 生成后必须展示 PNG 并给出文件路径。

## 模板索引

现成模板定义在 `references/templates.md`，分类如下：

- **AI/开发**：vibe-coding、claude-code、codex、ai-learning、llm-internals、rag-flow
- **通用职场**：onboarding、programmer-daily、meeting-flow
- **学术医疗**：phd-research、graduation、medical-conference
- **内容创作**：short-drama-ai-video、xiaohongshu-start

## 第三方依赖

- Python 3.10+
- `puppeteer-core`（用于 PNG 渲染， skill 内 `scripts/svg2png.py` 已包含安装检测）
- Microsoft Edge / Google Chrome（用于 headless 截图）

## 红线

- 不生成包含敏感信息、歧视、违法内容的图解。
- 不替代用户做专业决策（如医疗诊断流程仅作示意）。
- 不承诺图形美观度 100% 符合用户预期，但提供 SVG 源文件便于二次调整。

## 常见问题

**Q：用户说「画个图」但没给主题怎么办？**  
A：列出 3-5 个热门模板让用户选，例如：vibe coding、入职流程、Claude Code 开发流程。

**Q：没有匹配模板怎么办？**  
A：按用户描述抽取步骤生成通用流程图；如果描述不清，反问步骤。

**Q：风格参数怎么传？**  
A：`scripts/generate_diagram.py --style flat|sketchy|dark|cute --template vibe-coding -o output.svg`
