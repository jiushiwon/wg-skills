# electron-native-abi-fix

> 排查并修复 Electron 主进程因原生模块（native addon）ABI 不匹配导致的「界面能开、功能全废」类故障。

## 什么时候用

- 报 `No handler registered`，但 `ipcMain.handle` 确实存在
- 日志出现 `NODE_MODULE_VERSION ... was compiled against a different Node.js version`
- `require('electron')` 返回字符串、`electron --version` 版本不对
- `npm install` 原生模块（better-sqlite3 / node-pty / keytar / serialport）卡在 node-gyp 编译

## 核心思路

**先翻译报错、再实锤根因，不要照着报错去改业务代码。**

六步流程：翻译报错 → 侦察本机硬约束 → 定位（区分真没注册 vs 初始化中断）→ 用 Electron 二进制实锤 → 修复（降级包或升级 Electron）→ 验证。

## 快速上手

```bash
env -u ELECTRON_RUN_AS_NODE ./node_modules/electron/dist/electron.exe --no-sandbox \
  <skill目录>/scripts/diag-native.cjs better-sqlite3 keytar ssh2
```

## 边界

- 不做 node-gyp 本地编译（无 MSVC 场景不可行）
- 不在沙箱里启动 Electron GUI

## 详细规范 → [SKILL.md](SKILL.md)

## 相关技能

- [electron-dev-restart](../../vibeCoding/frontend/electron/electron-dev-restart/SKILL.md) — HMR 无热重启的同类「No handler registered」成因
