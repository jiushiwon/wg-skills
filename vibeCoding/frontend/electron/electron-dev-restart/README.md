# electron-dev-restart

> electron-vite dev 下主进程（`electron/main/*`）与 preload 没有 HMR，改完必须彻底退出重启才会生效。

## 什么时候用

- 用户反复点按钮报「No handler registered」/「api.xxx is not a function」，但源码里 handler 确实存在
- 改了 `electron/main/*` 或 `electron/preload/*` 后行为不变
- `out/main/index.js` 产物里能看到新代码，运行时却像旧代码

## 核心结论

dev 模式只对渲染端（`src/renderer/*`）做 HMR；主进程和 preload 完全无 HMR，运行中的 Electron 进程里永远是启动那一刻的代码。

## 快速上手

1. 先验证「新代码有没有进产物」：`grep -c "new-channel" out/main/index.js`
2. 真正重启：`MSYS_NO_PATHCONV=1 taskkill /F /T /PID <pid>`（必须 `/T` 杀进程树 + 等端口释放）
3. 或 `cmd /c start.bat stop` 再 `cmd /c start.bat`

## 边界

- 不替用户写 `start.bat`
- 不在沙箱里启动 Electron GUI

## 详细规范 → [SKILL.md](SKILL.md)

## 相关技能

- [electron-native-abi-fix](../../../others/electron-native-abi-fix/SKILL.md) — 原生模块 ABI 不匹配的同类问题，先排除 ABI 再查 HMR
- [electron-vue-init-skill](../../vue/electron-vue-init-skill/SKILL.md) — Electron + Vue 初始化模板
