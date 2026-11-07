---
name: vue-tui-skill
description: Vue 3 终端风格 UI（TUI）技能。提供 8 个核心终端美学组件（tui-card / tui-table / tui-chart / tui-log / tui-terminal / tui-progress / tui-spinner / tui-notification），纯 Vue3 + CSS3 零依赖、等宽字体、扫描线效果、零 HTML5 标签。**当前为开发计划态**（8 个组件均未实现，仅 README 草案）。触发词："终端风格界面"、"TUI 组件"、"赛博朋克风格"、"终端仪表盘"、"ASCII 表格"、"黑客风格页面"、"tui-card"、"tui-table"、"tui-chart"。
---

# Vue TUI Skill

> 终端美学 UI 组件库，**零第三方依赖、纯 Vue3 + CSS3**。
>
> ⚠️ **当前状态：开发计划态**（8 个核心组件均未实现）。本 SKILL.md 用于能力定义与触发词占位，**勿用于生产**。

## 与 vue-base-skill 的关系

| 技能 | 关系 |
|------|------|
| `vue-base-skill` | 基础组件体系（必须先有） |
| `vue-theme-skill` | 主题 Token（颜色/字体定义） |
| `vue-tui-skill`（本） | 终端美学专用组件层 |

## 能力清单（草案）

| 组件 | 用途 | 状态 |
|------|------|------|
| **tui-card** | 终端卡片容器 | 📝 计划 |
| **tui-table** | ASCII 表格 | 📝 计划 |
| **tui-chart** | ASCII 柱状/折线图 | 📝 计划 |
| **tui-log** | 日志流输出 | 📝 计划 |
| **tui-terminal** | 终端模拟器 | 📝 计划 |
| **tui-progress** | 进度条 | 📝 计划 |
| **tui-spinner** | 加载动画 | 📝 计划 |
| **tui-notification** | 通知消息 | 📝 计划 |

## 适用场景

- 管理后台的终端风格仪表盘
- 开发者工具界面（DevTool Web 版）
- 命令行工具的 Web 化
- 黑客/赛博朋克/复古未来主义风格页面
- 服务器监控面板（运维台）

## 设计 Token（草案）

```css
:root {
  /* 终端配色 */
  --tui-bg: #0d1117;
  --tui-bg-card: #161b22;
  --tui-text: #c9d1d9;
  --tui-text-dim: #8b949e;
  --tui-accent-green: #3fb950;
  --tui-accent-amber: #d29922;
  --tui-accent-red: #f85149;
  --tui-accent-blue: #58a6ff;
  --tui-border: #30363d;

  /* 等宽字体栈 */
  --tui-font-mono: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace;

  /* 间距 */
  --tui-space-1: 4px;
  --tui-space-2: 8px;
  --tui-space-3: 12px;
  --tui-space-4: 16px;
  --tui-space-6: 24px;
}
```

## 使用示例（草案）

```vue
<template>
  <tui-card title="System Monitor">
    <tui-table :data="processes" :columns="columns" />
    <tui-progress :value="cpuUsage" label="CPU" />
    <tui-progress :value="memUsage" label="Memory" />
  </tui-card>
</template>
```

## 不做

- ❌ 实际组件实现（待 v0.1 起逐个交付）
- ❌ 真实 Demo
- ❌ SSR 适配（仅 Vue3 客户端）

## 触发场景

- 「给我做个终端风格仪表盘」
- 「用 ASCII 表格展示数据」
- 「赛博朋克风格登录页」
- 「加个 tui-card / tui-table」

## 依赖

- `vue-base-skill`（基础）
- `vue-theme-skill`（Token）
