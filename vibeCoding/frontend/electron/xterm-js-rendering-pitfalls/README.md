# xterm-js-rendering-pitfalls

> xterm.js（`@xterm/xterm` 6.x）在 Electron 终端类项目里最容易踩的 4 个渲染坑合集。

## 4 个坑速览

1. **fontFamily 传 CSS 变量** → `ctx.font` 不解析 `var(--font-mono)`，vi `gg/G` 失效、字符越界
2. **主题切换不生效** → 每个组件各自 `useState` 造成「state 孤岛」，主题不跨组件传播
3. **主题切了但不重绘** → `term.options.theme = X` 只更新变量，必须 `term.refresh(0, rows-1)`
4. **PTY 尺寸在字体加载完成前 fit** → rows/cols 偏大，远端 vi 排版错乱

## 快速上手

出现「vi 排版错乱 / 主题不切换 / 字符越界」时，按 `SKILL.md` 的 4 个坑逐一对照修复，每条都附现象、根因、修复代码。

## 边界

- 仅覆盖 xterm.js 渲染相关，不涉及 PTY 协议与 SSH 逻辑本身

## 详细规范 → [SKILL.md](SKILL.md)

## 相关技能

- [electron-dev-restart](../electron-dev-restart/SKILL.md) — 改完渲染端必须重启 Electron
- [vue-style-skill](../../vue/vue-style-skill/SKILL.md) — CSS 变量与主题系统规范
