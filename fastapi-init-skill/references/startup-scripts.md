# 一键启动脚本模板

生成项目时，以下脚本与代码同时落地到项目根目录。Linux/macOS 脚本需 `chmod +x` 赋予执行权限，Windows 脚本双击即可运行。

## 脚本概览

| 脚本 | 作用 | 适用场景 |
|------|------|----------|
| `setup.sh` / `setup.bat` | 环境搭建 + 安装 + 启动 | **首次使用**，自动完成全部步骤 |
| `dev.sh` / `dev.bat` | 开发模式，热重载 | **开发时**使用，修改代码自动重启 |
| `start.sh` / `start.bat` | 生产模式启动 | **后台多 worker** 运行 |
| `restart.sh` / `restart.bat` | 一键重启 | 停止后重新启动 |

## setup.sh（Linux / macOS）

```bash
#!/bin/bash
set -e

# ============================================
# FastAPI 项目一键环境搭建脚本
# 功能：检测 Python → 创建 venv → 生成 .env → 安装依赖 → 检查 DB → 启动服务
# ============================================

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
VENV_DIR="$PROJECT_DIR/venv"
PORT="${APP_PORT:-8080}"
DB_TYPE="${DB_TYPE:-mysql}"

echo "========================================"
echo "  FastAPI 项目环境搭建"
echo "========================================"
echo ""

# ---------- 1. 检测 Python ----------
echo "[1/6] 检测 Python 环境..."

PYTHON=""
for cmd in python3 python; do
    if command -v $cmd &> /dev/null; then
        VERSION=$($cmd --version 2>&1 | grep -oP '\d+\.\d+')
        MAJOR=$(echo $VERSION | cut -d. -f1)
        MINOR=$(echo $VERSION | cut -d. -f2)
        if [ "$MAJOR" -ge 3 ] && [ "$MINOR" -ge 9 ]; then
            PYTHON=$cmd
            echo "  ✓ 找到 $($PYTHON --version)"
            break
        fi
    fi
done

if [ -z "$PYTHON" ]; then
    echo "  ✗ 未找到 Python 3.9+"
    echo "  请安装 Python 3.9 或更高版本：https://python.org/downloads"
    exit 1
fi

# ---------- 2. 创建虚拟环境 ----------
echo "[2/6] 配置虚拟环境..."

if [ -d "$VENV_DIR" ]; then
    echo "  → 检测到已有虚拟环境，跳过创建"
else
    $PYTHON -m venv "$VENV_DIR"
    echo "  ✓ 虚拟环境已创建: venv/"
fi

source "$VENV_DIR/bin/activate"
echo "  ✓ 虚拟环境已激活"

# ---------- 3. 生成 .env 配置文件 ----------
echo "[3/6] 初始化配置文件..."

if [ ! -f "$PROJECT_DIR/.env" ]; then
    if [ -f "$PROJECT_DIR/.env.example" ]; then
        cp "$PROJECT_DIR/.env.example" "$PROJECT_DIR/.env"
        echo "  ✓ 已从 .env.example 创建 .env（请按需修改数据库连接信息）"
    else
        echo "  ⚠ 未找到 .env.example，将使用默认配置"
    fi
else
    echo "  → .env 已存在，跳过创建"
fi

# ---------- 4. 安装依赖 ----------
echo "[4/6] 安装 Python 依赖..."

if [ -f "$PROJECT_DIR/requirements.txt" ]; then
    pip install -r "$PROJECT_DIR/requirements.txt"
    echo "  ✓ 依赖安装完毕"
else
    echo "  ✗ 找不到 requirements.txt"
    exit 1
fi

# ---------- 5. 编译检查 ----------
echo "[5/6] 语法检查..."

python -m compileall "$PROJECT_DIR/app" -q
echo "  ✓ 编译通过"

# ---------- 6. 数据库就绪检查 ----------
echo "[6/6] 检查数据库连接..."

echo "  → 数据库类型: $DB_TYPE"

if [ "$DB_TYPE" = "none" ]; then
    echo "  ✓ 已选择不启用数据库，跳过数据库检查"
elif command -v docker &> /dev/null && docker info &> /dev/null; then
    echo "  ✓ Docker 已就绪"

    case "$DB_TYPE" in
        mysql)
            CONTAINER_NAME="${PROJECT_NAME:-my}-mysql"
            if docker ps --format '{{.Names}}' 2>/dev/null | grep -q "$CONTAINER_NAME"; then
                echo "  ✓ MySQL 容器已在运行"
            else
                echo "  → 正在启动 MySQL（Docker）..."
                docker run -d -p 3306:3306 \
                    -e MYSQL_ROOT_PASSWORD=root \
                    -e MYSQL_DATABASE=app_db \
                    --name "$CONTAINER_NAME" \
                    mysql:8.0 2>/dev/null || true
                echo "  ✓ MySQL 已启动（如首次启动，初始化约需 30 秒）"
            fi
            ;;
        postgresql)
            CONTAINER_NAME="${PROJECT_NAME:-my}-postgres"
            if docker ps --format '{{.Names}}' 2>/dev/null | grep -q "$CONTAINER_NAME"; then
                echo "  ✓ PostgreSQL 容器已在运行"
            else
                echo "  → 正在启动 PostgreSQL（Docker）..."
                docker run -d -p 5432:5432 \
                    -e POSTGRES_PASSWORD=root \
                    -e POSTGRES_DB=app_db \
                    --name "$CONTAINER_NAME" \
                    postgres:15 2>/dev/null || true
                echo "  ✓ PostgreSQL 已启动（如首次启动，初始化约需 30 秒）"
            fi
            ;;
        mongodb)
            CONTAINER_NAME="${PROJECT_NAME:-my}-mongo"
            if docker ps --format '{{.Names}}' 2>/dev/null | grep -q "$CONTAINER_NAME"; then
                echo "  ✓ MongoDB 容器已在运行"
            else
                echo "  → 正在启动 MongoDB（Docker）..."
                docker run -d -p 27017:27017 \
                    -e MONGO_INITDB_DATABASE=app_db \
                    --name "$CONTAINER_NAME" \
                    mongo:6 2>/dev/null || true
                echo "  ✓ MongoDB 已启动（如首次启动，初始化约需 30 秒）"
            fi
            ;;
        *)
            echo "  ⚠ 未知的数据库类型: $DB_TYPE"
            ;;
    esac
else
    echo "  ⚠ 未检测到 Docker，无法自动启动数据库"
    echo "  请确保 $DB_TYPE 已在本机运行，或安装 Docker 后重试："
    echo "    macOS:  brew install docker"
    echo "    Linux:  curl -fsSL https://get.docker.com | sh"
    echo "    Windows: https://www.docker.com/products/docker-desktop"
    echo ""
    echo "  或者手动启动数据库后重新运行本脚本。"
fi

echo ""
echo "========================================"
echo "  ✓ 环境搭建完成！"
echo ""
echo "  Swagger 文档：http://localhost:${PORT}/docs"
echo "  ReDoc 文档：  http://localhost:${PORT}/redoc"
echo "  健康检查：    http://localhost:${PORT}/api/health"
echo "  SSE 示例：    http://localhost:${PORT}/api/sse/chat"
echo "  上传示例：    curl -F file=@test.png http://localhost:${PORT}/api/upload"
echo ""
echo "  ⚠ 重要提醒："
echo "    请编辑 .env 文件修改 JWT_SECRET（搜索 change-me）"
echo "    生产环境务必使用随机密钥！"
echo ""
echo "  🚀 当前为「开发模式」（热重载已开启）"
echo ""
echo "  按 Ctrl+C 停止服务"
echo "========================================"
echo ""

uvicorn app.main:app --host 0.0.0.0 --port "$PORT" --reload
```

## dev.sh（Linux / macOS）

```bash
#!/bin/bash
set -e

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
VENV_DIR="$PROJECT_DIR/venv"
PORT="${APP_PORT:-8080}"

if [ ! -d "$VENV_DIR" ]; then
    echo "首次使用，请先运行 ./setup.sh"
    echo "或手动创建虚拟环境：python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt"
    exit 1
fi

source "$VENV_DIR/bin/activate"

if [ ! -f "$PROJECT_DIR/.env" ]; then
    if [ -f "$PROJECT_DIR/.env.example" ]; then
        cp "$PROJECT_DIR/.env.example" "$PROJECT_DIR/.env"
        echo "  ⚠ 已自动生成 .env，请编辑后重新启动"
    fi
fi

echo "========================================"
echo "  开发模式（热重载已启用）"
echo "  Swagger: http://localhost:${PORT}/docs"
echo "  按 Ctrl+C 停止"
echo "========================================"

uvicorn app.main:app --host 0.0.0.0 --port "$PORT" --reload --log-level info
```

## start.sh（Linux / macOS）

```bash
#!/bin/bash
set -e

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
VENV_DIR="$PROJECT_DIR/venv"
PORT="${APP_PORT:-8080}"
WORKERS="${APP_WORKERS:-2}"
LOG_DIR="$PROJECT_DIR/logs"

if [ ! -d "$VENV_DIR" ]; then
    echo "首次使用，请先运行 ./setup.sh"
    exit 1
fi

source "$VENV_DIR/bin/activate"
mkdir -p "$LOG_DIR"

echo "========================================"
echo "  生产模式启动"
echo "  端口：$PORT"
echo "  工作进程：$WORKERS"
echo "  日志：$LOG_DIR"
echo "========================================"

nohup uvicorn app.main:app --host 0.0.0.0 --port "$PORT" --workers "$WORKERS" \
    --log-level info > "$LOG_DIR/app.log" 2>&1 &
echo $! > "$PROJECT_DIR/app.pid"

echo "  ✓ 服务已后台启动，PID: $(cat "$PROJECT_DIR/app.pid")"
echo "  访问：http://localhost:${PORT}/api/health"
```

## restart.sh（Linux / macOS）

```bash
#!/bin/bash
set -e

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
PID_FILE="$PROJECT_DIR/app.pid"

echo "========================================"
echo "  服务重启"
echo "========================================"

if [ -f "$PID_FILE" ]; then
    PID=$(cat "$PID_FILE")
    if kill -0 "$PID" 2>/dev/null; then
        echo "  → 停止旧进程 PID: $PID"
        kill "$PID"
        sleep 2
    fi
    rm -f "$PID_FILE"
fi

exec "$PROJECT_DIR/start.sh"
```

## setup.bat（Windows）

```batch
@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

:: ============================================
:: FastAPI 项目一键环境搭建脚本 (Windows)
:: ============================================

set PROJECT_DIR=%~dp0
set VENV_DIR=%PROJECT_DIR%venv
set PORT=8080
if defined APP_PORT set PORT=%APP_PORT%
set DB_TYPE=mysql
if defined DB_TYPE set DB_TYPE=%DB_TYPE%

echo ========================================
echo   FastAPI 项目环境搭建
echo ========================================
echo.

:: ---------- 1. 检测 Python ----------
echo [1/6] 检测 Python 环境...

set PYTHON=
for %%C in (python python3) do (
    where %%C >nul 2>nul
    if !errorlevel! equ 0 (
        for /f "tokens=2 delims=." %%V in ('%%C --version 2^>^&1') do (
            set PYTHON=%%C
        )
    )
)

if "%PYTHON%"=="" (
    echo   × 未找到 Python
    echo   请安装 Python 3.9+: https://python.org/downloads
    echo   安装时请勾选 "Add Python to PATH"
    pause
    exit /b 1
)

%PYTHON% --version
echo   √ Python 已找到

:: ---------- 2. 创建虚拟环境 ----------
echo [2/6] 配置虚拟环境...

if exist "%VENV_DIR%" (
    echo   → 检测到已有虚拟环境，跳过创建
) else (
    %PYTHON% -m venv "%VENV_DIR%"
    echo   √ 虚拟环境已创建: venv\
)

call "%VENV_DIR%\Scripts\activate.bat"
echo   √ 虚拟环境已激活

:: ---------- 3. 生成 .env 配置文件 ----------
echo [3/6] 初始化配置文件...

if not exist "%PROJECT_DIR%.env" (
    if exist "%PROJECT_DIR%.env.example" (
        copy /y "%PROJECT_DIR%.env.example" "%PROJECT_DIR%.env" >nul
        echo   √ 已从 .env.example 创建 .env（请按需修改数据库连接信息）
    ) else (
        echo   ! 未找到 .env.example，将使用默认配置
    )
) else (
    echo   → .env 已存在，跳过创建
)

:: ---------- 4. 安装依赖 ----------
echo [4/6] 安装 Python 依赖...

if not exist "%PROJECT_DIR%requirements.txt" (
    echo   × 找不到 requirements.txt
    pause
    exit /b 1
)

pip install -r "%PROJECT_DIR%requirements.txt"
echo   √ 依赖安装完毕

:: ---------- 5. 编译检查 ----------
echo [5/6] 语法检查...

%PYTHON% -m compileall "%PROJECT_DIR%app" -q
echo   √ 编译通过

:: ---------- 6. 数据库就绪检查 ----------
echo [6/6] 检查数据库连接...

echo   → 数据库类型: %DB_TYPE%

if "%DB_TYPE%"=="none" (
    echo   √ 已选择不启用数据库，跳过数据库检查
) else (
    where docker >nul 2>nul
    if !errorlevel! equ 0 (
        echo   √ Docker 已就绪

        docker ps --format "{{.Names}}" 2>nul | findstr /i "%DB_TYPE%" >nul
        if !errorlevel! neq 0 (
            echo   → 正在启动 %DB_TYPE%（Docker）...
            cd /d "%PROJECT_DIR%"
            if "%DB_TYPE%"=="mysql" (
                docker run -d -p 3306:3306 -e MYSQL_ROOT_PASSWORD=root -e MYSQL_DATABASE=app_db --name my-mysql mysql:8.0 2>nul
            ) else if "%DB_TYPE%"=="postgresql" (
                docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=root -e POSTGRES_DB=app_db --name my-postgres postgres:15 2>nul
            ) else if "%DB_TYPE%"=="mongodb" (
                docker run -d -p 27017:27017 -e MONGO_INITDB_DATABASE=app_db --name my-mongo mongo:6 2>nul
            )
            echo   √ %DB_TYPE% 已启动（如首次启动，初始化约需 30 秒）
        ) else (
            echo   √ %DB_TYPE% 容器已在运行
        )
    ) else (
        echo   ! 未检测到 Docker，无法自动启动数据库
        echo   请确保 %DB_TYPE% 已在本机运行，或安装 Docker Desktop：
        echo   https://www.docker.com/products/docker-desktop
        echo   或者手动启动数据库后重新运行本脚本。
    )
)

echo.
echo ========================================
echo   √ 环境搭建完成！
echo.
echo   Swagger 文档：http://localhost:%PORT%/docs
echo   ReDoc 文档：  http://localhost:%PORT%/redoc
echo   健康检查：    http://localhost:%PORT%/api/health
echo   SSE 示例：    http://localhost:%PORT%/api/sse/chat
echo   上传示例：    curl -F file=@test.png http://localhost:%PORT%/api/upload
echo.
echo   ! 重要提醒：
echo     请编辑 .env 文件修改 JWT_SECRET（搜索 change-me）
echo     生产环境务必使用随机密钥！
echo.
echo   当前为「开发模式」（热重载已开启）
echo.
echo   按 Ctrl+C 停止服务
echo ========================================
echo.

uvicorn app.main:app --host 0.0.0.0 --port %PORT% --reload

pause
```

## dev.bat（Windows）

```batch
@echo off
chcp 65001 >nul

set PROJECT_DIR=%~dp0
set VENV_DIR=%PROJECT_DIR%venv
set PORT=8080
if defined APP_PORT set PORT=%APP_PORT%

if not exist "%VENV_DIR%" (
    echo 首次使用，请先运行 setup.bat
    pause
    exit /b 1
)

call "%VENV_DIR%\Scripts\activate.bat"

if not exist "%PROJECT_DIR%.env" (
    if exist "%PROJECT_DIR%.env.example" (
        copy /y "%PROJECT_DIR%.env.example" "%PROJECT_DIR%.env" >nul
        echo   ! 已自动生成 .env，请编辑后重新启动
    )
)

echo ========================================
echo   开发模式（热重载已启用）
echo   Swagger: http://localhost:%PORT%/docs
echo   按 Ctrl+C 停止
echo ========================================

uvicorn app.main:app --host 0.0.0.0 --port %PORT% --reload --log-level info

pause
```

## start.bat（Windows）

```batch
@echo off
chcp 65001 >nul

set PROJECT_DIR=%~dp0
set VENV_DIR=%PROJECT_DIR%venv
set PORT=8080
if defined APP_PORT set PORT=%APP_PORT%
set WORKERS=2
if defined APP_WORKERS set WORKERS=%APP_WORKERS%

if not exist "%VENV_DIR%" (
    echo 首次使用，请先运行 setup.bat
    pause
    exit /b 1
)

call "%VENV_DIR%\Scripts\activate.bat"
if not exist "%PROJECT_DIR%logs" mkdir "%PROJECT_DIR%logs"

echo ========================================
echo   生产模式启动
echo   端口：%PORT%
echo   工作进程：%WORKERS%
echo ========================================

start /b uvicorn app.main:app --host 0.0.0.0 --port %PORT% --workers %WORKERS% --log-level info > "%PROJECT_DIR%logs\app.log" 2>&1
for /f "tokens=2" %%P in ('tasklist ^| findstr "uvicorn"') do (
    echo %%P > "%PROJECT_DIR%app.pid"
    goto :done
)
:done

echo   √ 服务已后台启动
echo   访问：http://localhost:%PORT%/api/health
pause
```

## restart.bat（Windows）

```batch
@echo off
chcp 65001 >nul

set PROJECT_DIR=%~dp0
set PID_FILE=%PROJECT_DIR%app.pid

if exist "%PID_FILE%" (
    for /f %%P in (%PID_FILE%) do (
        echo 停止旧进程 PID: %%P
        taskkill /PID %%P /F >nul 2>nul
    )
    del "%PID_FILE%"
)

call "%PROJECT_DIR%start.bat"
```

## 脚本权限设置（Linux / macOS）

生成 `.sh` 文件后，需执行：

```bash
chmod +x setup.sh dev.sh start.sh restart.sh
```

## 自定义端口与工作进程

所有脚本读取环境变量：

```bash
# 使用自定义端口启动
APP_PORT=9090 ./dev.sh

# 生产模式指定 worker 数
APP_PORT=9090 APP_WORKERS=4 ./start.sh
```

Windows：

```batch
set APP_PORT=9090
dev.bat
```

## AI 生成注意事项

1. 生成 `.sh` 和 `.bat` 文件时，分别使用 LF 和 CRLF 换行符
2. `.sh` 文件自动设置可执行权限
3. Windows 脚本第一行 `chcp 65001` 确保中文不乱码
4. 所有脚本使用 `set -e`（shell）或 `exit /b`（batch）确保错误时退出
5. 生成时需根据用户的项目名替换 `app` 目录路径
6. `DB_TYPE` 根据用户选择的数据库类型生成（mysql / postgresql / mongodb / none）
