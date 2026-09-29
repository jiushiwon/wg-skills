#!/usr/bin/env bash
#
# launch.sh — 原生部署脚本（拉代码 → 装依赖 → 构建 → 停老 → 起新 → 健康检查）
#
# 用法：
#   ./launch.sh <language> [options]
#
# language: node | python | java | go
# options:
#   --manager, -m   systemd | pm2 | nohup   （默认自动选择：有 pm2 用 pm2，否则 nohup）
#   --port, -p      覆盖 APP_PORT
#   --branch, -b    部署分支（默认 main / 来自 .env）
#   --skip-pull     跳过 git pull（如 CI 已拉好）
#   --skip-build    跳过构建
#
# 规范：见 deploy-native-skill/references/script-standards.md
# 端口：统一从 APP_PORT 读取（命令行 > .env > 默认 8080）
#
set -euo pipefail

# ---------- 加载 .env ----------
[ -f .env ] && set -a && . ./.env && set +a

# ---------- 默认值 ----------
APP_NAME="${APP_NAME:-$(basename "$(pwd)")}"
APP_DIR="${APP_DIR:-$(pwd)}"
APP_PORT="${APP_PORT:-8080}"
APP_ENV="${APP_ENV:-production}"
LOG_DIR="${LOG_DIR:-/var/log/${APP_NAME}}"
BRANCH="${BRANCH:-main}"
HEALTH_PATH="${HEALTH_PATH:-/health}"
MANAGER=""
SKIP_PULL=0
SKIP_BUILD=0

# ---------- 日志函数（自包含）----------
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

have() { command -v "$1" >/dev/null 2>&1; }
require_cmd() { for c in "$@"; do have "$c" || die "missing required command: $c"; done; }
SUDO=""
[ "$(id -u)" -ne 0 ] && SUDO="sudo"

# ---------- 各语言命令 ----------
cmd_install() {
  case "$LANG" in
    node)   have pnpm && run pnpm install --prod --frozen-lockfile || run npm ci --production ;;
    python) run python3 -m venv .venv; run bash -c ". .venv/bin/activate && pip install -r requirements.txt" ;;
    java)   [ -x ./mvnw ] && run ./mvnw -q -DskipTests package || run mvn -q -DskipTests package ;;
    go)     run go mod download ;;
  esac
}
cmd_build() {
  case "$LANG" in
    node)   run npm run build ;;
    python) info "python 无需构建，跳过" ;;
    java)   info "java 已在 install 阶段打包" ;;
    go)     run go build -o "bin/${APP_NAME}" ./... ;;
  esac
}
cmd_start_cmd() {
  # 输出启动命令字符串
  case "$LANG" in
    node)   echo "node dist/server.js" ;;
    python) echo ". .venv/bin/activate && exec gunicorn -k uvicorn.workers.UvicornWorker -b 0.0.0.0:${APP_PORT} app.main:app" ;;
    java)   local jar; jar="$(ls target/*.jar 2>/dev/null | grep -v '/original-' | head -1)"; [ -n "$jar" ] || die "no jar found in target/ (build first)"; echo "java -jar ${jar} --server.port=${APP_PORT}" ;;
    go)     echo "./bin/${APP_NAME}" ;;
  esac
}

# ---------- 停老进程 ----------
stop_old() {
  info "stopping old process on port ${APP_PORT}"
  if [ "$MANAGER" = "systemd" ]; then
    run $SUDO systemctl stop "$APP_NAME" || true
    return
  fi
  if [ "$MANAGER" = "pm2" ] && have pm2; then
    pm2 stop "$APP_NAME" >>"$LOG_FILE" 2>&1 || true
    pm2 delete "$APP_NAME" >>"$LOG_FILE" 2>&1 || true
    return
  fi
  # nohup / 按端口
  if [ -f "${APP_DIR}/${APP_NAME}.pid" ]; then
    local pid; pid="$(cat "${APP_DIR}/${APP_NAME}.pid")"
    kill -TERM "$pid" 2>/dev/null || true
    sleep 2
    kill -KILL "$pid" 2>/dev/null || true
    rm -f "${APP_DIR}/${APP_NAME}.pid"
  fi
  # 按端口兜底（lsof 缺失时回退 fuser）
  local pids=""
  if have lsof; then
    pids="$(lsof -ti:"${APP_PORT}" 2>/dev/null || true)"
  elif have fuser; then
    pids="$(fuser -n tcp "${APP_PORT}" 2>/dev/null || true)"
  fi
  if [ -n "$pids" ]; then
    echo "$pids" | xargs -r kill -TERM 2>/dev/null || true
    sleep 2
    echo "$pids" | xargs -r kill -KILL 2>/dev/null || true
  fi
  ok "old process stopped"
}

# ---------- 起新进程 ----------
start_new() {
  local cmd; cmd="$(cmd_start_cmd)"
  info "starting: ${cmd} (manager=${MANAGER}, port=${APP_PORT})"
  case "$MANAGER" in
    systemd)
      run $SUDO systemctl daemon-reload
      run $SUDO systemctl enable --now "$APP_NAME"
      run $SUDO systemctl restart "$APP_NAME" ;;
    pm2)
      APP_NAME="$APP_NAME" APP_PORT="$APP_PORT" APP_ENV="$APP_ENV" LOG_DIR="$LOG_DIR" pm2 start ecosystem.config.js --env production >>"$LOG_FILE" 2>&1
      pm2 save >>"$LOG_FILE" 2>&1 || true ;;
    nohup)
      APP_PORT="$APP_PORT" APP_ENV="$APP_ENV" nohup bash -c "$cmd" >> "${LOG_DIR}/app.log" 2>&1 &
      echo $! > "${APP_DIR}/${APP_NAME}.pid"
      ok "started pid=$(cat "${APP_DIR}/${APP_NAME}.pid")" ;;
  esac
}

# ---------- 健康检查 ----------
health_check() {
  local url="http://127.0.0.1:${APP_PORT}${HEALTH_PATH}"
  info "health check: ${url} (retry 10x)"
  for i in $(seq 1 10); do
    if curl -fsS "$url" >>"$LOG_FILE" 2>&1; then ok "deploy OK (${url})"; return 0; fi
    sleep 2
  done
  die "health check FAILED after 20s: ${url}"
}

usage() { sed -n '2,22p' "$0"; exit 2; }

# ---------- 参数解析 ----------
[ $# -lt 1 ] && usage
LANG="$1"; shift
case "$LANG" in node|python|java|go) ;; *) err "未知语言: $LANG"; usage ;; esac

while [ $# -gt 0 ]; do
  case "$1" in
    --manager|-m) MANAGER="$2"; shift 2 ;;
    --port|-p)    APP_PORT="$2"; shift 2 ;;
    --branch|-b)  BRANCH="$2"; shift 2 ;;
    --skip-pull)  SKIP_PULL=1; shift ;;
    --skip-build) SKIP_BUILD=1; shift ;;
    -h|--help)    usage ;;
    *) die "未知参数: $1" ;;
  esac
done

# 自动选择进程管理器
if [ -z "$MANAGER" ]; then
  if have pm2 && [ -f ecosystem.config.js ]; then MANAGER=pm2
  elif [ -f "/etc/systemd/system/${APP_NAME}.service" ]; then MANAGER=systemd
  else MANAGER=nohup
  fi
fi
case "$MANAGER" in systemd|pm2|nohup) ;; *) die "未知 manager: $MANAGER" ;; esac

cd "$APP_DIR"
require_cmd git curl
info "==== deploy ${APP_NAME} (${LANG}) port=${APP_PORT} branch=${BRANCH} manager=${MANAGER} ===="

[ "$SKIP_PULL" -eq 0 ] && { info "[1/5] pull code"; run git fetch origin "$BRANCH"; run git reset --hard "origin/$BRANCH"; } || info "[1/5] skip pull"
info "[2/5] install deps"; cmd_install
[ "$SKIP_BUILD" -eq 0 ] && { info "[3/5] build"; cmd_build; } || info "[3/5] skip build"
info "[4/5] restart"; stop_old; start_new
info "[5/5] verify"; health_check

ok "==== deploy ${APP_NAME} SUCCESS (log: ${LOG_FILE}) ===="
