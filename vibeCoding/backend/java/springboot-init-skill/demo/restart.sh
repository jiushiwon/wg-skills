#!/usr/bin/env bash
# Spring Boot 一键启动脚本（Linux / macOS）
# 用法：./restart.sh [dev|prod|stop|status]

set -euo pipefail

MODE="${1:-dev}"
APP_PID_FILE="app.pid"
APP_LOG_DIR="logs"

mkdir -p "$APP_LOG_DIR"

stop_old() {
  if [ -f "$APP_PID_FILE" ]; then
    OLD_PID=$(cat "$APP_PID_FILE")
    if ps -p "$OLD_PID" > /dev/null 2>&1; then
      echo "🛑 停止旧进程 $OLD_PID"
      kill "$OLD_PID" 2>/dev/null || true
      sleep 2
      kill -9 "$OLD_PID" 2>/dev/null || true
    fi
    rm -f "$APP_PID_FILE"
  fi
}

ensure_env() {
  if [ ! -f .env ]; then
    cp .env.example .env
    echo "📝 已从 .env.example 复制生成 .env"
  fi
}

case "$MODE" in
  dev)
    echo "🚀 启动开发模式（热重载）..."
    ensure_env
    stop_old
    nohup ./mvnw spring-boot:run \
      -Dspring-boot.run.profiles=dev \
      > "$APP_LOG_DIR/dev.log" 2>&1 &
    PID=$!
    echo $PID > "$APP_PID_FILE"
    echo "✅ 开发模式已启动（PID $PID）"
    echo "📄 实时日志：tail -f $APP_LOG_DIR/dev.log"
    echo "🌐 Swagger UI：http://localhost:8080/swagger-ui.html"
    ;;

  prod)
    echo "🏭 启动生产模式（后台运行）..."
    ensure_env
    stop_old
    echo "📦 编译中..."
    ./mvnw clean package -DskipTests -q
    JAR=$(ls -t target/*.jar 2>/dev/null | grep -v "\.original$" | head -1)
    if [ -z "$JAR" ]; then
      echo "❌ 未找到可执行 JAR（target/*.jar），编译失败？"
      exit 1
    fi
    echo "🚀 启动 $JAR"
    nohup java -jar "$JAR" --spring.profiles.active=prod \
      > "$APP_LOG_DIR/app.log" 2>&1 &
    PID=$!
    echo $PID > "$APP_PID_FILE"
    echo "✅ 生产模式已启动（PID $PID）"
    echo "📄 实时日志：tail -f $APP_LOG_DIR/app.log"
    echo "🌐 服务地址：http://localhost:8080"
    ;;

  stop)
    stop_old
    echo "✅ 已停止"
    ;;

  status)
    if [ -f "$APP_PID_FILE" ] && ps -p "$(cat "$APP_PID_FILE")" > /dev/null 2>&1; then
      echo "✅ 运行中（PID $(cat "$APP_PID_FILE")）"
    else
      echo "❌ 未运行"
    fi
    ;;

  *)
    echo "用法：$0 [dev|prod|stop|status]"
    exit 1
    ;;
esac