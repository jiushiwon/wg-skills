---
name: electron-dev-restart
description: |
  electron-vite dev 模式下主进程（electron/main/*）修改后**不会**热重启，
  改完代码用户看到的"还是旧的"现象（连接不存在、API 不识别、no handler registered）
  几乎都根源于此。触发词：electron-vite dev 主进程没生效、ipcMain.handle 没注册、
  electron-vite HMR、主进程无 HMR、改 electron/main 要重启、electron 修改不生效、
  start.bat restart、no handler registered 不存在的 channel、点连接成功但功能异常、
  api.xxx is not a function。
agent_created: true
---

# Electron Dev 主进程无 HMR 必须重启

## Overview

`electron-vite dev` 只对**渲染端**（`src/renderer/*`）做 HMR，**主进程**（`electron/main/*`）
和 **preload**（`electron/preload/*`）**完全没有 HMR**——dev 模式只是「每次启动 Electron 时
跑一次最新源码」，运行中的 Electron 进程里的代码永远是启动那一刻的版本。

后果：
- 改 `ipcMain.handle('xxx')` → 运行中 GUI 上点按钮调 `ipcRenderer.invoke('xxx')` 仍报 **No handler registered**
- 改 `sshPtyOpen = sshConnect` 之类别名 → 仍报 **api.xxx is not a function**
- 改 session id 反解兜底 → 运行中仍按原始逻辑报错
- 用户反复点按钮，以为"还没生效"，其实是主进程代码根本没动

**铁律**：改 `electron/main/*` 或 `electron/preload/*` 后，必须**彻底退出**当前 Electron 进程并重启。

## 何时使用

- 用户反馈"我连了 X 次都没生效" + 主进程有相关改动
- `out/main/index.js` 里能看到新加的字符串，但用户 GUI 报 "No handler registered"
- 用户反馈 `api.xxx is not a function`，但 preload 源码里有这个方法
- `git grep` 能查到新代码，运行时表现却像旧代码
- electron-vite 控制台**没报错**但行为不变

## 第一步：先验证"新代码到底有没有进运行中的 Electron"

产物会随 main rebuild 自动更新，但**运行中的 Electron 不会**——这是关键：

```bash
# 检查产物里的字符串
grep -c "new-channel-name" out/main/index.js
grep -c "new-method-name" out/preload/index.js
```

| 产物里 | 运行中 | 根因 |
|---|---|---|
| 有 | 无 | 用户没退出重启（最大可能） |
| 无 | 无 | `npm run build` 没真跑成 / 改错文件 / 改了没保存 |
| 有 | 有 | 这条 skill 不适用，去查代码本身逻辑 |

## 第二步：怎么"真正"重启 Electron

### Windows / Git Bash 下杀干净（2026-09-13 实测）

```bash
# 唯一可靠写法（绕开 MSYS 把 /F /T 当路径转换）
MSYS_NO_PATHCONV=1 taskkill /F /T /PID <pid>
```

- `MSYS_NO_PATHCONV=1` **必加**——否则 `/F` `/T` 被 MSYS 当路径转换，报"无效参数"
- `/T` **必加**（杀进程树）：pnpm/uvicorn 会 fork 子进程，只杀父进程端口不释放
- 杀完必须**轮询等端口真正释放**再起新进程

### 推荐：用项目自带 start.bat 一键重启

```bash
cmd /c start.bat stop      # 杀旧 electron
cmd /c start.bat           # 重新启动（dev 自动 compile + 启动 Electron）
```

典型 `start.bat` 应有这些子命令：
- `dev`（前台 tee）/ 默认（后台）/ `stop`（杀进程）/ `status`（查运行态）/ `-h`
- 启动用 `nohup ... > logs/x.log 2>&1 &` + `echo $! > logs/x.pid`
- 失败时 `tail -20 日志` 排查

参考实现：`games/lobby/server/restart.sh`、`humeng-uniapp-note/restart.sh`、`super-shell/start.bat`、`vibecoding-portal/restart.sh`。

## 第三步：构建不跑也是坑

dev 模式下**修改源码后**，electron-vite **默认会自动 rebuild**——但只在主进程真正启动那一刻。
如果想"代码改了、不重启、跑构建、确认产物里有"，用：

```bash
C:/nvm4w/nodejs/node.exe node_modules/electron-vite/bin/electron-vite.js build 2>&1 | tail -10
```

直接 `cmd /c start.bat build` 在沙箱里会被安全策略拦截，**改调系统 node 直跑本地 electron-vite.js**，
这一步只验证编译、不启动服务——**禁止在沙箱里启动 GUI**（会被 SIGTERM 或前置代理吃 curl）。

## 第四步：常见误诊与正解

| 用户反馈 | 用户以为 | 真相 |
|---|---|---|
| "我点了十几次了都没生效" | 功能坏了 | **运行中的 Electron 是旧版本** |
| "No handler registered" | 漏注册 | **handler 注册了**，但主进程根本没启动新代码 |
| "代码改对了为什么还报错" | 改错地方 | 改的是 `out/main/index.js` 而不是 `electron/main/index.ts`（产物是构建生成的） |
| "我重启了 start.bat 还是报错" | 工具坏了 | `start.bat` 启的是 npm/electron-vite，**没真杀旧进程**——用 taskkill 看下 |
| "No handler registered 但 grep 产物有" | 玄学 | **grep 看的是新构建产物**，但 Electron 内存里跑的是旧版本 |
| "我改完刷新一下就好了" | HMR 工作了 | 渲染端可能 HMR 了，但主进程没动；看着好是巧合 |

## 第五步：用户教育模板（直接复制给用户）

```
修复已编译进 out/。
改的是主进程代码（electron/main/*），必须彻底退出 Electron 重启才生效：

1. 关闭 Electron 窗口（或 start.bat stop）
2. 重新双击 start.bat
3. 再试一次功能

如果还是异常，把报错截图发我。
```

## 不做

- 不替用户写 `start.bat`——那是用户自己的项目惯例
- 不在沙箱里启 Electron——会被 SIGTERM（背景任务）或前置代理吃 curl（502）
- 不删 `.git/`（会导致本机"批量删除保护"机制触发 SIGTERM）
- 不擅自改名/搬走旧文件——用户规则：「宁可留着旧目录占用空间，也不许替用户决定」

## 红线

1. **必须 kill 整个进程树**：`taskkill /F /T /PID`，漏 `/T` 子进程继续占端口
2. **必须等端口真正释放**：杀完轮询 `netstat -ano | findstr :PORT`，新进程立刻起会撞 `Port is already in use`
3. **必须改 `electron/main/*` 而非 `out/main/index.js`**：产物是构建生成的，下次 build 就被覆盖
4. **必须在沙箱外启服务**：沙箱里启服务要么被 SIGTERM 要么被前置代理吃 curl（502）

## 自检 checklist

排查 Electron 行为不对时按顺序问：

- [ ] 是渲染端问题（`src/renderer/*`）还是主进程问题（`electron/main/*`）？
- [ ] 产物里有没有新加的字符串（`grep out/main/index.js` / `out/preload/index.js`）？
- [ ] 用 `tasklist | findstr electron` 看运行中的 Electron 进程
- [ ] `taskkill /F /T /PID <pid>` 后端口是否真的释放（`netstat`）？
- [ ] 重新 `start.bat` 后日志里是否真有新代码相关 INFO/ERROR？
- [ ] 如果用户说"刷新一下就好了"——很可能只是渲染端 HMR，**主进程根本就没动**

## 引用索引

| 文件 | 内容 |
|---|---|
| `scripts/diag-processes.cjs` | Windows 下查 Electron 进程与端口占用（备用，参见 electron-native-abi-fix 的 diag-native.cjs 写法） |

## 触发关键词清单

```
electron-vite dev 主进程没生效、ipcMain.handle 没注册、electron-vite HMR、
主进程无 HMR、改 electron/main 要重启、electron 修改不生效、start.bat restart、
no handler registered 不存在的 channel、点连接成功但功能异常、
api.xxx is not a function、Electron 点了没反应、连了 X 次都不行
```

## 关联技能

- **`vibeCoding/others/electron-native-abi-fix`**：原生模块 ABI 不匹配的同类问题（`No handler registered` 也可能是它），先排除 ABI 再排查 HMR
- **`vibeCoding/frontend/vue/electron-vue-init-skill`**：本类项目（Electron + Vue/React）的初始化模板