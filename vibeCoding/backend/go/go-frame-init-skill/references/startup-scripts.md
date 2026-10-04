# 启动脚本模板

## restart.sh (Linux/macOS)

```bash
#!/bin/bash

MODE=${1:-dev}

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}=== Go 多框架项目启动脚本 ===${NC}"
echo "模式: $MODE"

# 创建日志目录
mkdir -p logs

# 停止旧进程
if [ -f "bin/server" ]; then
    PID=$(ps aux | grep "bin/server" | grep -v grep | awk '{print $2}')
    if [ -n "$PID" ]; then
        echo -e "${YELLOW}停止旧进程: $PID${NC}"
        kill -9 $PID 2>/dev/null
        sleep 1
    fi
fi

# 加载环境变量
if [ -f ".env" ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# 启动
if [ "$MODE" = "prod" ]; then
    echo -e "${GREEN}生产模式启动${NC}"
    nohup ./bin/server > logs/app.log 2>&1 &
    echo -e "${GREEN}服务已启动，日志: logs/app.log${NC}"
else
    echo -e "${GREEN}开发模式启动（热重载）${NC}"
    if command -v air &> /dev/null; then
        air -c .air.conf > logs/dev.log 2>&1 &
        echo -e "${GREEN}服务已启动，日志: logs/dev.log${NC}"
    else
        echo -e "${YELLOW}未安装 air，使用普通模式${NC}"
        nohup ./bin/server > logs/dev.log 2>&1 &
    fi
fi

sleep 2
echo -e "${GREEN}启动完成！${NC}"
```

## restart.bat (Windows)

```bat
@echo off
set MODE=%1
if "%MODE%"=="" set MODE=dev

echo === Go 多框架项目启动脚本 ===
echo 模式: %MODE%

if not exist "logs" mkdir logs

:: 停止旧进程
taskkill /F /IM server.exe 2>nul

:: 启动
if "%MODE%"=="prod" (
    echo 生产模式启动
    start /B bin\server.exe > logs\app.log 2>&1
    echo 服务已启动，日志: logs\app.log
) else (
    echo 开发模式启动
    start /B bin\server.exe > logs\dev.log 2>&1
    echo 服务已启动，日志: logs\dev.log
)

echo 启动完成！
pause
```

## .air.conf (开发热重载)

```toml
root = "."
testdata_dir = "testdata"
tmp_dir = "tmp"

[build]
  args_bin = []
  bin = "./bin/server"
  cmd = "go build -o ./bin/server ./cmd/server"
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
