# 部署脚本标准步骤（Native Pipeline）

本文件定义 `deploy-native-skill` 生成部署脚本的标准步骤顺序，以及每一步的可选实现。

## 步骤总览

```
1. 拉取/更新代码
2. 安装依赖
3. 构建（如需）
4. 优雅停止老进程
5. 后台启动新进程
6. 日志定向
7. 健康检查
```

## 1. 拉取/更新代码

### 选项 A：pull（保留本地修改，可能冲突）

```bash
git pull origin main
```

### 选项 B：fetch + reset（强制对齐远端，推荐生产）

```bash
git fetch origin main
git reset --hard origin/main
```

### Windows

```powershell
git fetch origin main
git reset --hard origin/main
```

> 生产环境建议用 B，避免本地残留文件导致构建异常。如有 `node_modules` 缓存，可在 CI 里用 `actions/cache`，不在脚本里管。

## 2. 安装依赖

| 语言 | 命令 | 说明 |
|------|------|------|
| Node.js | `npm ci --production` | 比 `npm install` 更快、可复现 |
| Node.js (pnpm) | `pnpm install --prod --frozen-lockfile` | - |
| Python | `pip install -r requirements.txt` | 建议在 venv 内 |
| Go | `go mod download` | 通常构建时自动处理 |
| Java | `./mvnw -q -DskipTests package` | 构建阶段一并处理 |

## 3. 构建（如需）

| 语言 | 命令 |
|------|------|
| Node.js (TS) | `npm run build` |
| Java | `./mvnw -q -DskipTests package` 或 `./gradlew build -x test` |
| Go | `go build -o bin/server ./cmd/server` |
| 前端 | `npm run build`（产物给 static-nginx-skill） |

## 4. 优雅停止老进程

### 按 PID 文件

```bash
if [ -f "${APP_DIR}/${APP_NAME}.pid" ]; then
  kill -TERM "$(cat "${APP_DIR}/${APP_NAME}.pid")" 2>/dev/null || true
  sleep 2
  kill -KILL "$(cat "${APP_DIR}/${APP_NAME}.pid")" 2>/dev/null || true
  rm -f "${APP_DIR}/${APP_NAME}.pid"
fi
```

### 按端口（无 PID 文件时）

```bash
PIDS=$(lsof -ti:"$PORT" || true)
if [ -n "$PIDS" ]; then
  echo "$PIDS" | xargs -r kill -TERM
  sleep 2
  echo "$PIDS" | xargs -r kill -KILL 2>/dev/null || true
fi
```

### pm2

```bash
pm2 stop "$APP_NAME" || true
pm2 delete "$APP_NAME" || true
```

### systemd

```bash
sudo systemctl stop "$APP_NAME" || true
```

### Windows

```powershell
$conn = Get-NetTCPConnection -LocalPort $PORT -ErrorAction SilentlyContinue
if ($conn) { $conn.OwningProcess | Sort-Object -Unique | ForEach-Object { Stop-Process -Id $_ -Force } }
```

## 5. 后台启动新进程

### systemd（推荐）

```bash
sudo systemctl start "$APP_NAME"
sudo systemctl status "$APP_NAME" --no-pager
```

### pm2

```bash
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup   # 首次：生成开机自启脚本
```

### supervisor

```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start "$APP_NAME"
```

### nohup（简单场景）

```bash
nohup node dist/server.js >> "${LOG_DIR}/app.log" 2>&1 &
echo $! > "${APP_DIR}/${APP_NAME}.pid"
```

### Windows NSSM

```powershell
nssm install $APP_NAME "C:\path\to\node.exe" "C:\srv\my-api\dist\server.js"
nssm set $APP_NAME AppStdout "C:\var\log\my-api\app.log"
nssm set $APP_NAME AppStderr "C:\var\log\my-api\app.log"
nssm start $APP_NAME
```

## 6. 日志定向

| 方式 | 日志位置 |
|------|----------|
| systemd | `journalctl -u <app>` 或 `StandardOutput=append:/var/log/<app>/app.log` |
| pm2 | `error_file` / `out_file` 指定路径 |
| nohup | `>> /var/log/<app>/app.log 2>&1` |
| NSSM | `AppStdout` / `AppStderr` |

建议日志目录：`/var/log/<app>/`（Linux）、`C:\var\log\<app>\`（Windows）、或项目内 `logs/`（便于查看但需注意权限）。

### logrotate 配置（防止磁盘打满）

```
/var/log/my-api/*.log {
    daily
    rotate 14
    compress
    delaycompress
    missingok
    notifempty
    copytruncate
}
```

## 7. 健康检查

```bash
HEALTH_URL="http://127.0.0.1:${PORT}/health"
for i in $(seq 1 10); do
  if curl -fsS "$HEALTH_URL" >/dev/null; then
    echo "deploy OK"
    exit 0
  fi
  sleep 2
done
echo "health check failed after 20s" >&2
exit 1
```

健康检查端点约定：`GET /health` 返回 `{ "code": 0, "message": "ok" }`。

## 完整脚本骨架

```bash
#!/usr/bin/env bash
set -euo pipefail

APP_NAME="my-api"
APP_DIR="/srv/apps/my-api"
LOG_DIR="/var/log/${APP_NAME}"
PORT=8080
BRANCH="main"

mkdir -p "$LOG_DIR"
cd "$APP_DIR"

git fetch origin "$BRANCH"
git reset --hard "origin/$BRANCH"

npm ci --production
npm run build

# 停老进程（按进程管理方式二选一）
if command -v pm2 >/dev/null 2>&1; then
  pm2 stop "$APP_NAME" || true
  pm2 start ecosystem.config.js --env production
  pm2 save
else
  lsof -ti:"$PORT" | xargs -r kill -TERM || true
  sleep 2
  lsof -ti:"$PORT" | xargs -r kill -KILL || true
  nohup node dist/server.js >> "${LOG_DIR}/app.log" 2>&1 &
  echo $! > "${APP_DIR}/${APP_NAME}.pid"
fi

for i in $(seq 1 10); do
  curl -fsS "http://127.0.0.1:${PORT}/health" >/dev/null && { echo "deploy OK"; exit 0; }
  sleep 2
done
echo "deploy FAILED" >&2
exit 1
```

## 回滚策略

### 选项 A：按 commit 回滚

```bash
git reset --hard <上一正常 commit>
./deploy/deploy.sh
```

### 选项 B：保留 release 目录（推荐）

```
/srv/apps/my-api/
├── releases/
│   ├── 20260710-1200/
│   ├── 20260710-1300/
│   └── 20260710-1400/
├── current -> releases/20260710-1400   # 软链接
└── shared/
    ├── .env
    └── logs/
```

回滚只需把 `current` 软链接指回上一 release 目录并重启进程。

## 容错

- 健康检查失败：脚本退出码非 0，CI 可据此告警。
- 端口被占用且杀不掉：脚本应报错而非继续起新进程。
- `.env` 缺失：脚本启动前检查，缺失则中止并提示。
