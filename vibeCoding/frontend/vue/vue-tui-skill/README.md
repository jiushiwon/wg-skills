# vue-tui-skill

> Vue3 TUI（Terminal User Interface）终端界面技能。用 Vue3 + CSS3 模拟终端风格 UI。

## 核心理念

- **终端美学**：等宽字体、绿色/琥珀色文本、扫描线效果
- **零依赖**：纯 Vue3 + CSS3，无需第三方库
- **组件化**：8 个核心 TUI 组件，按需使用

## 组件列表

| 组件 | 说明 | 状态 |
|------|------|------|
| tui-card | 终端卡片容器 | ✅ |
| tui-table | ASCII 表格 | ✅ |
| tui-chart | ASCII 图表（柱状/折线） | ✅ |
| tui-log | 日志输出流 | ✅ |
| tui-terminal | 终端模拟器 | ✅ |
| tui-progress | 进度条 | ✅ |
| tui-spinner | 加载动画 | ✅ |
| tui-notification | 通知消息 | ✅ |

## 设计 Token

```css
:root {
  /* 终端颜色 */
  --tui-bg: #0d1117;
  --tui-bg-card: #161b22;
  --tui-text: #c9d1d9;
  --tui-text-dim: #8b949e;
  --tui-accent-green: #3fb950;
  --tui-accent-amber: #d29922;
  --tui-accent-red: #f85149;
  --tui-accent-blue: #58a6ff;
  --tui-border: #30363d;

  /* 等宽字体 */
  --tui-font-mono: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace;

  /* 间距 */
  --tui-space-1: 4px;
  --tui-space-2: 8px;
  --tui-space-3: 12px;
  --tui-space-4: 16px;
  --tui-space-6: 24px;
}
```

## 使用场景

- 管理后台的终端风格仪表盘
- 开发者工具界面
- 命令行工具的 Web 版本
- 黑客/赛博朋克风格页面
- 服务器监控面板

## 快速上手

```vue
<template>
  <tui-card title="System Monitor">
    <tui-table :data="processes" :columns="columns" />
    <tui-progress :value="cpuUsage" label="CPU" />
    <tui-progress :value="memUsage" label="Memory" />
  </tui-card>
</template>
```

## 开发计划

- [ ] tui-card 组件实现
- [ ] tui-table 组件实现
- [ ] tui-chart 组件实现
- [ ] tui-log 组件实现
- [ ] tui-terminal 组件实现
- [ ] tui-progress 组件实现
- [ ] tui-spinner 组件实现
- [ ] tui-notification 组件实现
- [ ] Demo 文件
- [ ] SKILL.md 技能定义

## 依赖技能

- [vue-base-skill](../vue-base-skill/SKILL.md) — 基础组件体系
- [vue-theme-skill](../vue-theme-skill/SKILL.md) — 主题 Token 体系
