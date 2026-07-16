---
name: ui-replica-skill
description: "把 UI 原型图/截图高还原地复刻成可运行代码。触发词：复刻这张图、把原型图转成代码、图片转 HTML/Vue/React、Figma 转代码、Stitch 转代码、照着设计稿写页面、截图转代码、仿照这个页面。"
user-invocable: true
argument-hint: "[image-path-or-url] [target-stack]"
triggers:
  - "复刻.*图"
  - "复刻.*页面"
  - "把.*图.*转成.*代码"
  - "把.*原型.*转成.*代码"
  - "把.*设计稿.*写成.*"
  - "图片转HTML"
  - "图片转Vue"
  - "图片转React"
  - "截图转代码"
  - "仿照.*页面"
  - "照着.*设计稿.*写"
  - "Figma.*转代码"
  - "Stitch.*转代码"
  - "原型图.*复刻"
---

# UI Replica Skill

**把 UI 原型图/截图高还原地复刻成可运行代码。**

核心原则：**先看到像原图的页面，再谈规范和收敛**。第一稿目标是把可见部分还原到 80% 以上；样式收敛、组件沉淀、设计系统治理交给 `frontend-style-harmonizer-skill` 或 `ui-component-commands-skill` 后续处理。

## 适用场景

- 用户发来一张 UI 原型图或截图，要求复刻成代码
- 图片来源是 AI UI 生成器（Stitch、v0、Galileo AI、Uizard、Figma/AI 等）
- 用户之前复刻效果差，需要系统化方法提升还原度

## 不适用场景

- 用户只有文字需求，没有图片 —— 用 `frontend-ui-foundry`
- 用户想从零设计一个新页面 —— 用 `frontend-ui-foundry` 或 `ui-ux-pro-max`
- 用户只想改某个已有组件 —— 用 `ui-component-commands-skill`

## 两种执行模式

| 模式 | 触发方式 | 输出 |
|---|---|---|
| **快速模式** | 用户只发图，未指定框架 | 直接输出单文件 HTML，一句话结构说明，Token 表折叠或后置 |
| **完整模式** | 用户指定技术栈、要求接入项目、或发来多图 | 走完整 0-6 阶段流程，输出结构分析 + Token 表 + 代码 |

**默认走快速模式**。只有用户明确说“我要 Vue/React/uniapp 版本”或“接入项目”时，才进入完整模式。

## 核心流程

```
0. 读图准备
   └── 读取本地路径或 URL，失败时要求用户重新提供
   └── 评估图片清晰度、完整性、是否长图/多图
   └── 质量不足时，先告知用户再估算

1. 结构化读图
   └── 识别页面类型（中后台/营销/官网/移动端/文档）
   └── 拆结构：页面 → 区块 → 卡片 → 元素
   └── 标记颜色、字号、间距、圆角、阴影、图标
   └── 识别特殊元素：二维码、图表、头像、地图

2. 收敛 Token
   └── 提取主色、中性色、文字色、背景色
   └── 收敛间距、圆角、阴影、字号阶梯
   └── Token 用于快速保持一致，不强求与项目设计系统对齐

3. 代码生成
   └── 先搭骨架（layout），再填血肉（components）
   └── 默认单文件 HTML + Tailwind CDN（可直接浏览器打开）
   └── 指定框架时生成对应骨架并填充页面
   └── 复杂元素优先用代码模拟，无法模拟再占位

4. 验证与交付
   └── 检查关键状态（hover/active/disabled）
   └── 说明未在浏览器实测
   └── 给出还原度自评和待确认项
```

## 输出规范

### 快速模式

1. **一句话结构分析**：页面类型 + 主要区块
2. **完整代码**：单文件 HTML，可直接打开
3. **Token 表**：可选，用户追问时再给
4. **验证提醒**：说明未实测，请用户打开查看并指出差异

### 完整模式

1. **结构分析**：页面类型 + 结构树
2. **图质量评估**：清晰度、完整性、遮挡情况
3. **Token 表**：颜色、间距、圆角、阴影
4. **完整代码**：按指定技术栈输出
5. **验证提醒与还原度自评**：说明未实测，列出待确认项

## 复杂元素策略

按“能模拟就模拟，不能模拟再占位”处理：

| 元素 | 优先方案 | 降级方案 |
|---|---|---|
| 通用图标 | Iconify / 内联 SVG | 语义文字标签 |
| 二维码 | QRCode.js 真实生成 | 占位 div |
| 图表 | ECharts / Recharts 渲染 mock 数据 | 占位 div |
| 地图 | CSS 色块 + 标注点模拟 | 占位 div |
| Banner/头像 | Unsplash 直接 URL | CSS gradient 占位 |
| 日历 | 原生 `<input type="date">` 或组件库 DatePicker | 占位 div |
| 文件上传 | 拖拽上传 UI | 占位 div |

**禁止直接使用 Emoji 作为正式图标。**

## 技术栈默认策略

| 用户输入 | 工作目录 | 输出形态 |
|---|---|---|
| 只发图，未指定框架 | 任意 | **单文件 HTML + Tailwind CDN** |
| 指定 uniapp/Vue/React/HTML | 任意 | 按指定框架生成 |
| 要求“接入项目” | 目标项目 | 询问确认后按项目技术栈生成 |
| 多图/原型图集 | 任意 | 先梳理页面关系，再逐个生成 |

**项目检测规则**：看到 `manifest.json` + `pages.json` 提示可能是 uniapp，看到 `vue` 依赖提示可能是 Vue，看到 `react` 依赖提示可能是 React/Next。但**不自动决定输出形态**，只作为提示询问用户是否接入项目。

## 长页面与滚动截图

若图片高度明显大于宽度 2 倍以上，视为长页面：

1. 按视觉断点拆成若干屏（如首屏、列表区、表单区、底部区）
2. 先复刻当前可见区域
3. 询问用户是否继续复刻下方内容，或合并为同一页面的滚动区块

## 增量精调

用户拿到第一稿后通常会提出局部修改：

1. 只改被指出的元素，不重写整页
2. 记录已确认的视觉参数
3. 直接输出局部 diff 或修改后的完整文件
4. 不重复输出整份 Token 表

## 与其他 skill 的关系

- 复刻完成后，如需收敛样式、提取公共变量 → `frontend-style-harmonizer-skill`
- 复刻完成后，如需沉淀可复用组件 → `ui-component-commands-skill`
- 无图纯文字需求 → `frontend-ui-foundry`

本 skill 默认独立运行，专注复刻，不中途调用其他 skill。

## 还原度目标

- **第一稿目标**：整体布局、主色、关键组件形态与原图一致，达到 80% 以上还原度即可交付。
- **精调目标**：修复用户指出的差异点。
- **不追求**：100% 像素级还原、全部交互状态、完整响应式。

## 常见错误

- ❌ 直接让模型“复刻这张图”，不先拆结构
- ❌ 每个元素各写一套颜色/间距/圆角
- ❌ 只还原静态图，漏掉 hover、focus 等关键状态
- ❌ 对图表/地图直接给占位 div，不尝试模拟
- ❌ 不说明技术栈假设，直接输出代码
- ❌ 对模糊/局部图片直接硬猜，不询问用户补充

## 参考资料

| 文件 | 用途 |
|---|---|
| [references/workflow.md](references/workflow.md) | 详细复刻流程 |
| [references/checklist.md](references/checklist.md) | 逐项自检 |
| [references/token-template.md](references/token-template.md) | 设计 Token 模板 |
| [references/structure-template.md](references/structure-template.md) | 页面结构拆解模板 |
| [references/complex-components.md](references/complex-components.md) | 图表/表单/动画/地图等复杂组件处理 |
| [references/integration-guide.md](references/integration-guide.md) | 把产出代码集成到真实项目 |
| [references/multi-mockups.md](references/multi-mockups.md) | 多原型图梳理与复刻计划 |
| [examples/](examples/) | 复刻样例 |
