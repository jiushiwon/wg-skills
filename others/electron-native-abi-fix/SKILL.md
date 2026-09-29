---
name: electron-native-abi-fix
description: |
  排查并修复 Electron 主进程因原生模块（native addon）加载失败而引发的"界面能开、功能全废"类故障。
  触发词：No handler registered、NODE_MODULE_VERSION、ABI 不匹配、require('electron') 返回字符串、
  electron --version 版本不对、node-gyp 编译失败、npm install 原生模块失败、Electron 点了没反应、
  better-sqlite3 / node-pty / keytar / serialport 等原生模块在 Electron 里加载报错
agent_created: true
---

# Electron 原生模块故障排查与修复

## Overview

处理一类**报错信息完全指错方向**的 Electron 故障：应用能启动、GUI 正常弹出，但一点功能就报错，
而报错把人引向"代码没写对"的假象。真实原因通常是原生模块（`.node` 插件）加载失败引发连锁反应。

核心命题：**先翻译报错、再实锤根因，不要照着报错去改业务代码。**

## 何时使用

出现以下任一信号时使用本技能：

- Electron 报 `No handler registered for '<channel>'`，但代码里 `ipcMain.handle('<channel>')` 确实存在
- 日志出现 `was compiled against a different Node.js version using NODE_MODULE_VERSION X`
- `require('electron')` 返回的是**字符串**而不是对象
- `electron --version` 打出的版本与 `package.json` 声明的不一致
- `npm install` 原生模块时卡在 `node-gyp` / `gyp ERR` / `MSB####` 编译错误
- 换了 Node 版本、或重装依赖后，Electron 突然起不来 / 功能全废

## 第一步：翻译报错（照着报错改代码必错）

| 表面报错 | 真实含义 |
|---|---|
| `No handler registered for 'connection:create'` | 通常**不是**漏注册 handler，而是 `app.whenReady()` 里**服务初始化抛错，导致写在它后面的整段 `ipcMain.handle` 全部没执行**；GUI 因为 `createWindow()` 在最前面照常弹出 |
| `require('electron')` 返回 `string` | 环境变量 `ELECTRON_RUN_AS_NODE=1` 把 electron 降级成纯 node，返回的是二进制路径 fallback |
| `electron --version` 打出 v16（装的是 v22） | 同上，是环境变量伪装的假象，**不是**装错版本 |
| `NODE_MODULE_VERSION 130 ... requires 110` | 原生模块按 **node 的 ABI** 编译，而 Electron 主进程要**另一个 ABI**（electron 22 → 110） |
| `No prebuilt binaries found` | 该包版本**根本不为当前 Electron 版本提供预编译**（不是网络问题） |

## 第二步：侦察本机硬约束（决定后续方案可行性）

动手前先确认这几条，它们直接决定"能不能本地编译""走哪条网络通道"：

```bash
# 1) 有没有 MSVC / VS —— 没有就【不能】node-gyp 本地编译，只能靠官方预编译
ls -d "/c/Program Files (x86)/Microsoft Visual Studio"/* 2>&1
ls -d "/c/Program Files/Microsoft Visual Studio"/* 2>&1

# 2) Electron 版本与 ABI
./node_modules/electron/dist/electron.exe --version        # 必须 unset ELECTRON_RUN_AS_NODE

# 3) 代理变量（本机代理常对 GitHub 返回 502）
env | grep -iE "proxy"

# 4) 环境变量里是否残留 ELECTRON_RUN_AS_NODE
echo $ELECTRON_RUN_AS_NODE
```

**本机（Windows / gang.wang）已知事实清单**：

- **没有 MSVC**（`Program Files` 下无 VS 目录，只有 managed Python）→ node-gyp 本地编译原生模块**不可行**
- 代理 `127.0.0.1:62481` 对 GitHub 偶发 **502**；`unset HTTP_PROXY/HTTPS_PROXY` **直连 GitHub 反而通**
- npmmirror 的 `-/binary` 镜像**不托管老版本 Electron 预编译**（查得到、下不到）
- `ELECTRON_RUN_AS_NODE` 曾被写进系统/用户环境变量 → 会让所有 Electron 应用退化成 node

## 第三步：定位（区分"真没注册"还是"被中断"）

1. **排除陈旧产物**：确认编译产物里确实含有该 channel 字符串
   ```bash
   node -e "const s=require('fs').readFileSync('out/main/index.js','utf8'); console.log(s.includes('connection:create'))"
   ```
2. **看代码顺序**：如果 `ipcMain.handle` 写在服务初始化（`getDatabaseManager()`、`new XxxService()`）**之后**，
   初始化一旦抛错，后面几十个 handler 会**集体静默消失** → 这就是 `No handler registered` 的经典成因。

## 第四步：实锤（用 Electron 二进制跑诊断，不要靠猜）

必须用 **electron 二进制**跑，用 node 跑会得到 node 的 ABI、结论完全不同：

```bash
cd <项目根>
env -u ELECTRON_RUN_AS_NODE ./node_modules/electron/dist/electron.exe --no-sandbox \
  <skill目录>/scripts/diag-native.cjs better-sqlite3 keytar ssh2
cat diag-native-result.txt
```

典型输出解读：

```
ABI: 110
ERR better-sqlite3: ... NODE_MODULE_VERSION 130. This version requires NODE_MODULE_VERSION 110
OK  keytar
```

→ `better-sqlite3` 是按 node ABI 130 编的，Electron 22 要 110 → **ABI 不匹配**。

## 第五步：修复（让 ABI 对上）

### 5.1 决策：降级包 还是 升级 Electron

| 选项 | 适用 | 代价 |
|---|---|---|
| **降级原生模块包** | 项目锁死了老 Electron（如 22），新版包不再为它出预编译 | 小：只动一个依赖版本 |
| 升级 Electron | 必须跟上新版包要求的 ABI | 大：动 Electron 版本，API/其它原生模块都要重新适配 |

**优先降级包**。

### 5.2 查该包是否为目标 ABI 提供预编译

```bash
curl -s https://api.github.com/repos/<owner>/<repo>/releases/tags/v<版本> \
  | grep -oE 'electron-v[0-9]+' | sort -u
```

例如 `better-sqlite3`：v11.10.0 只有 v116–v135（**不含** electron 22 的 v110），
而 **v9.6.0 含 `electron-v110`** → 应选 v9.6.0。

### 5.3 安装（必须 `--ignore-scripts`）

旧版本通常**没有本机 Node 的 ABI 预编译**，不跳过安装脚本就会回退本地编译 → 本机无 MSVC → **安装直接失败**。

```bash
npm install <pkg>@<版本> --save --ignore-scripts
```

### 5.4 手动拉取 Electron 版预编译

```bash
cd node_modules/<pkg>     # ⚠️ cwd 必须是包目录，否则 prebuild-install 会拿根 package.json 拼出错误 URL
env -u HTTP_PROXY -u HTTPS_PROXY -u http_proxy -u https_proxy \
  node ../prebuild-install/bin.js --runtime electron --target <electron版本> --arch x64 --platform win32
```

### 5.5 ⚠️ 必踩的副作用：`--ignore-scripts` 会弄丢 Electron 二进制

`--ignore-scripts` 是**全局**生效的。npm 重解析依赖时会重新解压 `electron` 包，
而 Electron 的二进制正是靠它自己的 postinstall 下载的 → 跳过后
`node_modules/electron/dist/` 与 `path.txt` **被清空**，electron.exe 消失。

补救（约 157MB，走 npmmirror 很快）：

```bash
cd node_modules/electron
ELECTRON_MIRROR=https://npmmirror.com/mirrors/electron/ node install.js
```

**结论：这类项目里不要用全局 `--ignore-scripts` 装包；确需跳过，装完立刻检查 `node_modules/electron/dist/` 是否还在。**

## 第六步：验证

```bash
env -u ELECTRON_RUN_AS_NODE ./node_modules/electron/dist/electron.exe --version   # 应为声明的版本
# 重跑第四步诊断脚本，所有模块应为 OK
npm run typecheck        # 降级包后确认类型仍兼容
```

## 防御性改进（修完顺手做）

把服务初始化单独包 try/catch，失败时暴露**真实原因**再向上抛，
避免以后再退化成 `No handler registered` 这种误导性报错：

```ts
let connectionService!: ConnectionService
try {
  connectionService = new ConnectionService(dbManager)
  // ...其余初始化
} catch (err) {
  console.error('[fatal] 后端服务初始化失败，IPC handler 未注册:', err)
  dialog.showErrorBox('启动失败', `后端服务初始化失败:\n\n${err instanceof Error ? err.message : err}`)
  throw err
}
// ipcMain.handle 注册保持在 try 之后
```

## Resources

### scripts/diag-native.cjs

通用原生模块诊断脚本。在项目根目录下、用 Electron 二进制运行，
逐个 `require` 指定模块并报告当前 ABI 与加载结果（结果写入 `diag-native-result.txt`）。

```bash
env -u ELECTRON_RUN_AS_NODE ./node_modules/electron/dist/electron.exe --no-sandbox \
  <skill目录>/scripts/diag-native.cjs better-sqlite3 keytar
```

脚本通过 `path.join(process.cwd(), 'node_modules', <模块>)` 显式解析，
因此**脚本可以放在任意位置**，但**必须在项目根目录运行**。
