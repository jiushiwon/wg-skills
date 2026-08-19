# 一键启动脚本模板

生成项目时，只落地两个脚本：

- `restart.sh`（Linux / macOS）
- `restart.bat`（Windows）

一条命令完成：拉代码 → 装依赖 → 安全停止旧进程 → 启动服务 → 输出日志命令。

## 使用方式

```bash
# Linux / macOS
./restart.sh        # 默认 dev 模式（热重载，日志 logs/dev.log）
./restart.sh prod   # 生产模式（多 worker，日志 logs/app.log）
```

```batch
:: Windows
restart.bat         :: 默认 dev 模式
restart.bat prod    :: 生产模式
```

环境变量：

- `APP_PORT`：端口，默认 8080
- `APP_WORKERS`：`prod` 模式 worker 数，默认 2

## 编写规则（强制）

1. **单入口**：每个平台只生成一个脚本，禁止拆成 setup / dev / start / restart 多个文件。
2. **参数区分模式**：`./restart.sh dev` 开发模式（热重载），`./restart.sh prod` 生产模式（多 worker + 资源限制），默认 `dev`。
3. **一条龙**：脚本必须依次完成——拉代码（可选）→ 安装/更新依赖 → 安全停止旧进程 → 启动服务 → 输出日志命令。
4. **安全杀旧进程**：
   - 先按 `app.pid` 停止已记录的 uvicorn/python 进程；
   - 若 PID 文件丢失或进程已失效，必须按 `APP_PORT` 扫描并强制清理占用端口的残留进程；
   - 禁止无差别 `killall python`。
5. **自动生成 .env**：启动前若根目录无 `.env`，自动从 `.env.example` 复制并提示用户编辑。
6. **日志落地**：`dev` 输出到 `logs/dev.log`，`prod` 输出到 `logs/app.log`，启动成功后必须打印查看日志命令。
7. **PID 记录**：启动成功后把主进程 PID 写入 `app.pid`，供下次重启识别。
8. **失败可排查**：启动失败时打印最近 50 行日志路径，而不是只报"起不来"。
9. **跨平台**：`.sh` 使用 POSIX/Bash，`set -e`；`.bat` 使用 `setlocal enabledelayedexpansion`，错误时 `exit /b`。
10. **不替用户提交 git**：可以 `git pull`，但绝不执行 `git add/commit/push`。

## restart.sh（Linux / macOS）

```bash
#!/bin/bash
set -e

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$PROJECT_DIR"

MODE="${1:-dev}"
PORT="${APP_PORT:-8080}"
VENV_DIR="$PROJECT_DIR/venv"
LOG_DIR="$PROJECT_DIR/logs"
PID_FILE="$PROJECT_DIR/app.pid"

if [ "$MODE" = "prod" ]; then
    LOG_FILE="$LOG_DIR/app.log"
    WORKERS="${APP_WORKERS:-2}"
else
    LOG_FILE="$LOG_DIR/dev.log"
    WORKERS=1
fi

mkdir -p "$LOG_DIR"

echo "========================================"
echo "  一键重启 [$MODE]"
echo "  端口：$PORT"
echo "  日志：$LOG_FILE"
echo "========================================"

# 1. 拉取代码（可选）
if command -v git &> /dev/null && [ -d "$PROJECT_DIR/.git" ]; then
    echo "[1/4] 拉取代码更新..."
    git pull || echo "  ⚠ git pull 失败，将继续使用当前代码"
else
    echo "[1/4] 未检测到 git 仓库，跳过拉取"
fi

# 2. 安装/更新依赖
echo "[2/4] 检查环境并安装依赖..."
if [ ! -d "$VENV_DIR" ]; then
    python3 -m venv "$VENV_DIR" 2>/dev/null || python -m venv "$VENV_DIR"
    echo "  ✓ 虚拟环境已创建"
fi
source "$VENV_DIR/bin/activate"
pip install -r "$PROJECT_DIR/requirements.txt"
echo "  ✓ 依赖已更新"

# 3. 安全停止旧进程
echo "[3/4] 安全停止旧进程..."
if [ -f "$PID_FILE" ]; then
    PID=$(cat "$PID_FILE")
    if ps -p "$PID" -o comm= 2>/dev/null | grep -qE "uvicorn|python"; then
        echo "  → 停止 PID: $PID"
        kill "$PID" 2>/dev/null || true
        sleep 2
    else
        echo "  ⚠ PID 文件已失效，忽略"
    fi
    rm -f "$PID_FILE"
fi

OLD_PIDS=""
if command -v lsof &> /dev/null; then
    OLD_PIDS=$(lsof -ti tcp:"$PORT" 2>/dev/null || true)
elif command -v ss &> /dev/null; then
    OLD_PIDS=$(ss -ltnp "sport = :$PORT" 2>/dev/null | awk -F'pid=' '{print $2}' | awk -F',' '{print $1}' | sort -u | tr '\n' ' ')
elif command -v fuser &> /dev/null; then
    fuser -k "$PORT"/tcp 2>/dev/null || true
fi

if [ -n "$OLD_PIDS" ]; then
    echo "  → 端口 $PORT 仍有残留进程，强制清理: $OLD_PIDS"
    kill -9 $OLD_PIDS 2>/dev/null || true
    sleep 1
fi

echo "  ✓ 旧进程已清理"

# 4. 启动服务
echo "[4/4] 启动服务..."
if [ ! -f "$PROJECT_DIR/.env" ] && [ -f "$PROJECT_DIR/.env.example" ]; then
    cp "$PROJECT_DIR/.env.example" "$PROJECT_DIR/.env"
    echo "  ⚠ 已自动生成 .env，请编辑后重新启动"
fi

if [ "$MODE" = "prod" ]; then
    nohup uvicorn app.main:app --host 0.0.0.0 --port "$PORT" --workers "$WORKERS" \
        --limit-max-requests 10000 --limit-concurrency 100 --timeout-graceful-shutdown 30 \
        --log-level info > "$LOG_FILE" 2>&1 &
else
    nohup uvicorn app.main:app --host 0.0.0.0 --port "$PORT" --reload --log-level info > "$LOG_FILE" 2>&1 &
fi

echo $! > "$PID_FILE"

sleep 1
if ps -p "$(cat "$PID_FILE")" -o comm= &> /dev/null; then
    echo ""
    echo "========================================"
    echo "  ✓ 服务已启动 [$MODE]"
    echo "  PID: $(cat "$PID_FILE")"
    echo "  Swagger: http://localhost:${PORT}/docs"
    echo "  健康检查: http://localhost:${PORT}/api/health"
    echo ""
    echo "  查看日志："
    echo "    tail -f \"$LOG_FILE\""
    echo "========================================"
else
    echo "  ✗ 服务启动失败，请查看日志："
    echo "    tail -n 50 \"$LOG_FILE\""
    exit 1
fi
```

## restart.bat（Windows）

```batch
@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

set PROJECT_DIR=%~dp0
cd /d "%PROJECT_DIR%"

set MODE=dev
if not "%~1"=="" set MODE=%~1
set PORT=8080
if defined APP_PORT set PORT=%APP_PORT%
set VENV_DIR=%PROJECT_DIR%venv
set LOG_DIR=%PROJECT_DIR%logs
set PID_FILE=%PROJECT_DIR%app.pid

if "%MODE%"=="prod" (
    set LOG_FILE=%LOG_DIR%\app.log
    set WORKERS=2
    if defined APP_WORKERS set WORKERS=%APP_WORKERS%
) else (
    set LOG_FILE=%LOG_DIR%\dev.log
    set WORKERS=1
)

if not exist "%LOG_DIR%" mkdir "%LOG_DIR%"

echo ========================================
echo   一键重启 [%MODE%]
echo   端口：%PORT%
echo   日志：%LOG_FILE%
echo ========================================

:: 1. 拉取代码（可选）
where git >nul 2>nul
if !errorlevel! equ 0 (
    if exist "%PROJECT_DIR%.git" (
        echo [1/4] 拉取代码更新...
        git pull
        if !errorlevel! neq 0 echo   ! git pull 失败，将继续使用当前代码
    ) else (
        echo [1/4] 未检测到 git 仓库，跳过拉取
    )
) else (
    echo [1/4] 未安装 git，跳过拉取
)

:: 2. 安装/更新依赖
echo [2/4] 检查环境并安装依赖...
if not exist "%VENV_DIR%" (
    python -m venv "%VENV_DIR%"
    echo   虚拟环境已创建
)
call "%VENV_DIR%\Scripts\activate.bat"
pip install -r "%PROJECT_DIR%requirements.txt"
echo   依赖已更新

:: 3. 安全停止旧进程
echo [3/4] 安全停止旧进程...
if exist "%PID_FILE%" (
    for /f %%P in (%PID_FILE%) do (
        echo   停止旧进程 PID: %%P
        taskkill /PID %%P >nul 2>nul
        timeout /t 2 /nobreak >nul
        taskkill /PID %%P /F >nul 2>nul
    )
    del "%PID_FILE%"
)

for /f "tokens=5" %%A in ('netstat -ano ^| findstr ":%PORT%"') do (
    echo   端口 %PORT% 仍被占用，清理残留 PID: %%A
    taskkill /PID %%A /F >nul 2>nul
)
timeout /t 1 /nobreak >nul
echo   旧进程已清理

:: 4. 启动服务
echo [4/4] 启动服务...
if not exist "%PROJECT_DIR%.env" (
    if exist "%PROJECT_DIR%.env.example" (
        copy /y "%PROJECT_DIR%.env.example" "%PROJECT_DIR%.env" >nul
        echo   ! 已自动生成 .env，请编辑后重新启动
    )
)

if "%MODE%"=="prod" (
    start /b uvicorn app.main:app --host 0.0.0.0 --port %PORT% --workers %WORKERS% --limit-max-requests 10000 --limit-concurrency 100 --timeout-graceful-shutdown 30 --log-level info > "%LOG_FILE%" 2>&1
) else (
    start /b uvicorn app.main:app --host 0.0.0.0 --port %PORT% --reload --log-level info > "%LOG_FILE%" 2>&1
)

:: 5. 记录 PID
timeout /t 2 /nobreak >nul
set PID=
for /f "tokens=2 delims=," %%P in ('wmic process where "name='python.exe' and CommandLine like '%%app.main:app%%'" get ProcessId /format:csv 2^>nul ^| findstr "[0-9]"') do (
    echo %%P > "%PID_FILE%"
    set PID=%%P
    goto :started
)
:started

echo.
echo ========================================
echo   服务已启动 [%MODE%]
if defined PID echo   PID: %PID%
echo   Swagger: http://localhost:%PORT%/docs
echo   健康检查: http://localhost:%PORT%/api/health
echo.
echo   查看日志：
echo     type "%LOG_FILE%"            （查看全部）
echo     Get-Content "%LOG_FILE%" -Wait    （PowerShell 实时查看）
echo ========================================

pause
```

## 脚本权限设置（Linux / macOS）

生成 `.sh` 文件后，需执行：

```bash
chmod +x restart.sh
```

## 自定义端口与工作进程

```bash
# 使用自定义端口
APP_PORT=9090 ./restart.sh

# 生产模式指定 worker 数
APP_PORT=9090 APP_WORKERS=4 ./restart.sh prod
```

Windows：

```batch
set APP_PORT=9090
restart.bat prod
```

## AI 生成注意事项

1. 生成 `.sh` 和 `.bat` 文件时，分别使用 LF 和 CRLF 换行符
2. `.sh` 文件自动设置可执行权限
3. Windows 脚本必须保存为 **UTF-8 with BOM**；模板本身是 UTF-8 纯文本，生成到项目时需自动追加 BOM（`\xef\xbb\xbf`），否则 `cmd.exe` 会按系统默认 ANSI（中文系统为 GBK）解析，导致中文乱码、命令被截断
4. Windows 脚本首行保留 `chcp 65001` 将控制台切到 UTF-8，配合 BOM 保证中文显示正常
5. Shell 脚本使用 `set -e`，batch 脚本错误时 `exit /b`
6. 生成时需根据用户的项目名替换 `app` 目录路径
7. `DB_TYPE` 根据用户选择的数据库类型生成（mysql / postgresql / mongodb / none）
