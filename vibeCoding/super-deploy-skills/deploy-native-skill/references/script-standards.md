# 部署脚本规范（Logging + 环境变量 + 结构）

本文件定义本套件所有预置脚本（`server-setup-skill/assets/`、`deploy-native-skill/assets/`）必须遵守的统一规范。所有脚本均**自包含**（内联日志函数，无外部依赖），便于拷贝到目标服务器直接运行。

## 日志规范

### 格式

```
[YYYY-MM-DD HH:MM:SS] [LEVEL] message
```

- LEVEL 取 `INFO` / `WARN` / `ERROR` / `OK`。
- `INFO`：步骤进度；`WARN`：可继续的异常；`ERROR`：致命错误（随后退出）；`OK`：步骤成功。
- 输出同时写到 **stdout** 与 **日志文件**（`${LOG_DIR}/<script>.log`），便于实时查看与事后追溯。

### Bash 日志函数（每个 .sh 脚本内联）

```bash
LOG_DIR="${LOG_DIR:-/var/log/${APP_NAME:-deploy}}"
mkdir -p "$LOG_DIR"
LOG_FILE="${LOG_DIR}/$(basename "$0" .sh).log"

_ts() { date '+%Y-%m-%d %H:%M:%S'; }
log()  { local lvl="$1"; shift; printf '[%s] [%s] %s\n' "$(_ts)" "$lvl" "$*" | tee -a "$LOG_FILE"; }
info() { log INFO "$@"; }
warn() { log WARN "$@"; }
err()  { log ERROR "$@"; }
ok()   { log OK "$@"; }
die()  { err "$@"; exit 1; }
run()  { info ">> $*"; "$@" >>"$LOG_FILE" 2>&1 || die "command failed: $*"; }
```

> `run` 用于执行「需记录到日志文件但屏幕只显示摘要」的命令；`info/ok/warn/err` 用于人类可读的进度。

### PowerShell 日志函数（每个 .ps1 脚本内联）

```powershell
$LogDir = if ($env:LOG_DIR) { $env:LOG_DIR } else { "C:\var\log\$($env:APP_NAME ?? 'deploy')" }
$null = New-Item -ItemType Directory -Force -Path $LogDir
$LogFile = Join-Path $LogDir "$( [IO.Path]::GetFileNameWithoutExtension($MyInvocation.MyCommand.Name) ).log"

function Write-Log {
    param([string]$Level, [string]$Message)
    $line = "[{0}] [{1}] {2}" -f (Get-Date -Format 'yyyy-MM-dd HH:mm:ss'), $Level, $Message
    $line | Tee-Object -FilePath $LogFile -Append
}
function Info { param($m) Write-Log INFO $m }
function Warn { param($m) Write-Log WARN $m }
function Err  { param($m) Write-Log ERROR $m }
function Ok   { param($m) Write-Log OK $m }
function Die  { param($m) Err $m; exit 1 }
```

## 环境变量约定

所有部署相关脚本统一从 `.env` 读取，变量名固定：

| 变量 | 含义 | 默认 |
|------|------|------|
| `APP_NAME` | 应用名（进程名/服务名/日志目录名） | 项目目录名 |
| `APP_DIR` | 应用部署目录 | `/srv/apps/<APP_NAME>`（Linux）/ `C:\srv\<APP_NAME>`（Windows） |
| `APP_PORT` | **应用监听端口**（核心约定，见下） | 按语言：8080 |
| `APP_ENV` | 运行环境 | `production` |
| `LOG_DIR` | 日志目录 | `/var/log/<APP_NAME>` / `C:\var\log\<APP_NAME>` |
| `BRANCH` | 部署分支 | `main` |
| `HEALTH_PATH` | 健康检查路径 | `/health` |

### 端口约定（重点）

- **统一变量名 `APP_PORT`**，所有启动脚本、systemd unit、pm2 ecosystem、Dockerfile EXPOSE、Nginx `proxy_pass` 都引用它。
- 启动脚本读取顺序：命令行 `-p/--port` > 环境变量 `APP_PORT` > 语言默认值（8080）。
- 应用代码应读 `process.env.APP_PORT` / `os.getenv("APP_PORT")` / `@Value("${APP_PORT:8080}")` / `os.Getenv("APP_PORT")`，与部署脚本一致。
- 反向代理（Nginx）把 80/443 转发到 `127.0.0.1:${APP_PORT}`。
- 健康检查用 `http://127.0.0.1:${APP_PORT}${HEALTH_PATH}`。

`.env` 片段：

```bash
APP_NAME=my-api
APP_DIR=/srv/apps/my-api
APP_PORT=8080
APP_ENV=production
LOG_DIR=/var/log/my-api
BRANCH=main
HEALTH_PATH=/health
```

## 脚本结构规范

### Bash（.sh）

```bash
#!/usr/bin/env bash
set -euo pipefail

# 1. 加载 .env（如存在）
[ -f .env ] && set -a && . ./.env && set +a

# 2. 默认值
APP_NAME="${APP_NAME:-$(basename "$(pwd)")}"
APP_PORT="${APP_PORT:-8080}"

# 3. 内联日志函数（见上）

# 4. 参数解析（--port / --branch / --yes）

# 5. 主流程，每步 info/run/ok

# 6. 健康检查 + 退出码
```

### PowerShell（.ps1）

```powershell
#Requires -Version 5.1
param(
    [string]$Port,
    [string]$Branch,
    [switch]$Yes
)
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

# 加载 .env、默认值、内联日志函数、主流程，与 bash 对应
```

## 幂等与可重入

- 安装脚本：先 `command -v` 检测，已存在且版本满足则 `ok "... already installed, skip"` 并退出 0。
- 启动脚本：先按 `APP_PORT` 检测并停老进程，再起新进程；重复执行结果一致。
- 任何失败立即非零退出（`set -e` / `$ErrorActionPreference='Stop'`），便于 CI 判定。

## 退出码

| 码 | 含义 |
|----|------|
| 0 | 成功 |
| 1 | 一般错误（命令失败、健康检查失败） |
| 2 | 参数错误（未知子命令、缺少必填参数） |
| 3 | 权限不足（需要 sudo/root/管理员） |

## 安全

- 不在脚本里硬编码密码/密钥；从 `.env` 读取。
- `curl | sh` 类安装必须打印 `WARN` 提示审计来源。
- 数据库相关命令不在安装脚本里执行初始化，仅安装服务。
