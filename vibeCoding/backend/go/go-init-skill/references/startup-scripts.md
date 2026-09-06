# 启动脚本指南

提供 dev/prod 双模式的一键启动/重启脚本。

## restart.sh (Linux/macOS)

```bash
#!/bin/bash

# ============================================
# {{PROJECT_NAME}} 启动脚本
# 用法: ./restart.sh [dev|prod]
# ============================================

set -e

# 配置
PROJECT_NAME="{{PROJECT_NAME}}"
APP_DIR="$(cd "$(dirname "$0")" && pwd)"
BIN_DIR="$APP_DIR/bin"
LOG_DIR="$APP_DIR/logs"
MODE="${1:-dev}"

# 创建必要的目录
mkdir -p "$BIN_DIR" "$LOG_DIR"

# 日志文件
if [ "$MODE" = "prod" ]; then
    LOG_FILE="$LOG_DIR/app.log"
else
    LOG_FILE="$LOG_DIR/dev.log"
fi

# 颜色
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查 Go 环境
check_go() {
    if ! command -v go &> /dev/null; then
        log_error "Go 未安装，请先安装 Go 1.20+"
        exit 1
    fi

    GO_VERSION=$(go version | grep -oP 'go\d+\.\d+' | grep -oP '\d+\.\d+')
    log_info "Go 版本: $GO_VERSION"
}

# 安装依赖
install_deps() {
    log_info "安装 Go 依赖..."
    cd "$APP_DIR"
    go mod tidy
}

# 编译
build() {
    log_info "编译项目..."
    cd "$APP_DIR"

    if [ "$MODE" = "prod" ]; then
        CGO_ENABLED=0 go build -ldflags="-s -w" -o "$BIN_DIR/server" ./cmd/server
    else
        go build -o "$BIN_DIR/server" ./cmd/server
    fi

    log_info "编译完成"
}

# 停止旧进程
stop_old() {
    if [ -f "$BIN_DIR/server.pid" ]; then
        PID=$(cat "$BIN_DIR/server.pid")
        if kill -0 "$PID" 2>/dev/null; then
            log_info "停止旧进程: $PID"
            kill "$PID"
            sleep 2
            # 强制杀死
            if kill -0 "$PID" 2>/dev/null; then
                kill -9 "$PID" 2>/dev/null || true
            fi
        fi
        rm -f "$BIN_DIR/server.pid"
    fi
}

# 启动
start() {
    log_info "启动服务 (模式: $MODE)..."

    cd "$APP_DIR"

    if [ "$MODE" = "prod" ]; then
        # 后台运行
        nohup "$BIN_DIR/server" > "$LOG_FILE" 2>&1 &
        echo $! > "$BIN_DIR/server.pid"
        log_info "服务已启动 (PID: $(cat $BIN_DIR/server.pid))"
    else
        # 前台运行（热重载）
        if command -v air &> /dev/null; then
            air -c .air.conf
        else
            log_warn "未安装 air，使用普通模式"
            go run ./cmd/server
        fi
    fi
}

# 主逻辑
main() {
    log_info "=== $PROJECT_NAME 启动脚本 ==="
    log_info "模式: $MODE"

    check_go
    install_deps
    build
    stop_old
    start

    if [ "$MODE" = "prod" ]; then
        log_info "日志文件: $LOG_FILE"
        log_info "查看日志: tail -f $LOG_FILE"
    fi
}

main
```

## restart.bat (Windows)

```bat
@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

:: ============================================
:: {{PROJECT_NAME}} 启动脚本 (Windows)
:: 用法: restart.bat [dev|prod]
:: ============================================

set "PROJECT_NAME={{PROJECT_NAME}}"
set "APP_DIR=%~dp0"
set "BIN_DIR=%APP_DIR%bin"
set "LOG_DIR=%APP_DIR%logs"
set "MODE=%1"

if "%MODE%"=="" set "MODE=dev"

:: 创建目录
if not exist "%BIN_DIR%" mkdir "%BIN_DIR%"
if not exist "%LOG_DIR%" mkdir "%LOG_DIR%"

:: 日志文件
if "%MODE%"=="prod" (
    set "LOG_FILE=%LOG_DIR%\app.log"
) else (
    set "LOG_DIR%\dev.log"
)

echo [INFO] === %PROJECT_NAME% 启动脚本 ===
echo [INFO] 模式: %MODE%

:: 检查 Go
where go >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Go 未安装，请先安装 Go 1.20+
    exit /b 1
)

go version | findstr /C:"go"

:: 安装依赖
echo [INFO] 安装 Go 依赖...
cd /d "%APP_DIR%"
go mod tidy

:: 编译
echo [INFO] 编译项目...
if "%MODE%"=="prod" (
    go build -ldflags="-s -w" -o "%BIN_DIR%\server.exe" .\cmd\server
) else (
    go build -o "%BIN_DIR%\server.exe" .\cmd\server
)

echo [INFO] 编译完成

:: 停止旧进程
if exist "%BIN_DIR%\server.pid" (
    set /p PID=<"%BIN_DIR%\server.pid"
    tasklist /FI "PID eq %PID%" | findstr /C:"server.exe" >nul
    if %errorlevel% equ 0 (
        echo [INFO] 停止旧进程: %PID%
        taskkill /F /PID %PID% >nul 2>&1
    )
    del "%BIN_DIR%\server.pid"
)

:: 启动
echo [INFO] 启动服务 (模式: %MODE%)...
cd /d "%APP_DIR%"

if "%MODE%"=="prod" (
    start /B "" "%BIN_DIR%\server.exe" > "%LOG_FILE%" 2>&1
    echo %errorlevel% > "%BIN_DIR%\server.pid"
    echo [INFO] 服务已启动
) else (
    go run .\cmd\server
)

if "%MODE%"=="prod" (
    echo [INFO] 日志文件: %LOG_FILE%
)

endlocal
```

## air 配置（开发热重载）

### .air.conf

```ini
# .air.conf
# 开发模式热重载配置

root = "."
testdata_dir = "testdata"
tmp_dir = "tmp"

[build]
  args_bin = []
  bin = "./tmp/main"
  cmd = "go build -o ./tmp/main ./cmd/server"
  delay = 1000
  exclude_dir = ["assets", "tmp", "vendor", "testdata"]
  exclude_file = []
  exclude_regex = ["_test.go"]
  exclude_unchanged = false
  follow_symlink = false
  full_bin = ""
  include_dir = []
  include_ext = ["go", "tpl", "tmpl", "html"]
  include_file = []
  kill_delay = "0s"
  log = "build-errors.log"
  poll = false
  poll_interval = 0
  rerun = false
  rerun_delay = 500
  send_interrupt = false
  stop_on_error = false

[color]
  app = ""
  build = "yellow"
  main = "magenta"
  runner = "green"
  watcher = "cyan"

[log]
  main_only = false
  time = false

[misc]
  clean_on_exit = false

[screen]
  clear_on_rebuild = false
  keep_scroll = true
```

## 启动方式总结

| 命令 | 模式 | 说明 |
|------|------|------|
| `./restart.sh` | dev | 默认开发模式 |
| `./restart.sh dev` | dev | 开发模式，热重载 |
| `./restart.sh prod` | prod | 生产模式，后台运行 |
| `restart.bat` | dev | Windows 开发模式 |
| `restart.bat prod` | prod | Windows 生产模式 |

## 日志查看

```bash
# 开发模式日志
tail -f logs/dev.log

# 生产模式日志
tail -f logs/app.log

# 实时查看
tail -f logs/*.log
```
