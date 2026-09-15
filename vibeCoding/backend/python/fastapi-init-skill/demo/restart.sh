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