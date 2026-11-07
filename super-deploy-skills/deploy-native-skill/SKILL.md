---
name: deploy-native-skill
description: 用于按 deploy-profile.md 生成原生（非 Docker）部署脚本，覆盖 git 拉取、依赖安装、构建、优雅停止老进程、后台启动新进程、日志定向、健康检查等步骤，按 OS 输出 .sh 或 .ps1。支持 systemd / pm2 / supervisor / nohup 等进程管理方式。当用户说「原生部署」「deploy native」「生成部署脚本」「一键部署脚本」时触发。
---

# Deploy Native Skill

## Overview

本 skill 把你过去手写的「拉代码 → 杀老进程 → 起新进程 → 管日志」脚本规范化。它读取 `deploy-profile.md` 选择对应语言的启动方式，生成可幂等重复执行的部署脚本。

默认行为：生成脚本到项目目录（如 `deploy/deploy.sh`），不自动执行；用户审查后手动跑，或接入 CI。

## When to Use

触发词：

- `原生部署`
- `deploy native`
- `生成部署脚本`
- `一键部署脚本`
- `帮我写个部署脚本`

前置依赖：建议先运行 `deploy-detect-skill` 与 `server-setup-skill`，确保画像准确、服务器环境就绪。

## Workflow Summary

```
Phase 1: 读取 deploy-profile.md
  → 提取语言、框架、数据库、缓存、构建产物
  → 确认是否含前端产物（是则联动 static-nginx-skill）

Phase 2: 选择进程管理方式
  → Linux：systemd（首选）/ pm2（Node）/ supervisor / nohup
  → Windows：NSSM / Task Scheduler / PowerShell 后台 job

Phase 3: 生成部署脚本骨架
  → 拉代码（git pull / fetch+reset）
  → 装依赖（npm install / pip install / go mod download / mvn package）
  → 构建（如有）
  → 优雅停老进程（按端口或 PID 文件）
  → 后台起新进程
  → 日志定向到指定目录
  → 健康检查（重试 N 次）

Phase 4: 按 OS 输出
  → Linux/macOS：deploy.sh（bash）
  → Windows：deploy.ps1（PowerShell）

Phase 5: 输出使用说明
  → 首次配置（systemd unit / pm2 ecosystem）
  → 日志位置、回滚方式
```

## Phase 1: 读取 deploy-profile.md

按画像的「语言 / Web 框架 / 构建产物」决定启动命令：

| 语言 / 框架 | 启动命令 |
|------------|----------|
| Node.js / Express | `node dist/server.js` 或 `pm2 start ecosystem.config.js` |
| Node.js / NestJS | `node dist/main.js` |
| Python / FastAPI | `uvicorn app.main:app --host 0.0.0.0 --port 8080`（生产用 gunicorn 托管） |
| Python / Django | `gunicorn config.wsgi:application` |
| Java / Spring Boot | `java -jar target/app.jar` |
| Go / Gin | `./bin/server`（先 `go build`） |
| Ruby / Rails | `bundle exec puma -C config/puma.rb` |
| PHP / Laravel | `php-fpm` + Nginx 反代 |

## Phase 2: 选择进程管理方式

按 OS 与语言推荐：

| 场景 | 推荐方式 | 理由 |
|------|----------|------|
| Linux 通用 | systemd | 系统自带，开机自启、崩溃重启、日志统一 |
| Node.js 多实例 | pm2 | 集群模式、零停机 reload、日志聚合 |
| Python/Go 简单守护 | supervisor | 配置简单，适合非 systemd 环境 |
| 临时/简单场景 | nohup `&` | 无需额外组件，但无自启 |
| Windows 服务 | NSSM | 把任意可执行文件注册为 Windows 服务 |

> 优先 systemd；如服务器无 systemd（如 Alpine、容器内），回退 supervisor 或 pm2。

## Phase 3: 生成部署脚本骨架

按 `references/script-pipeline.md` 的标准步骤生成。核心结构（bash 示例）：

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

echo "[1/6] pull latest code"
git fetch origin "$BRANCH"
git reset --hard "origin/$BRANCH"

echo "[2/6] install deps"
npm ci --production

echo "[3/6] build"
npm run build

echo "[4/6] stop old process"
if command -v pm2 >/dev/null 2>&1; then
  pm2 stop "$APP_NAME" || true
else
  lsof -ti:"$PORT" | xargs -r kill -TERM || true
  sleep 2
  lsof -ti:"$PORT" | xargs -r kill -KILL || true
fi

echo "[5/6] start new process"
if command -v pm2 >/dev/null 2>&1; then
  pm2 start ecosystem.config.js --env production
  pm2 save
else
  nohup node dist/server.js >> "${LOG_DIR}/app.log" 2>&1 &
  echo $! > "${APP_DIR}/${APP_NAME}.pid"
fi

echo "[6/6] health check"
for i in $(seq 1 10); do
  if curl -fsS "http://127.0.0.1:${PORT}/health" >/dev/null; then
    echo "deploy OK"
    exit 0
  fi
  sleep 2
done
echo "health check failed" >&2
exit 1
```

## Phase 4: 按 OS 输出

- **Linux / macOS**：生成 `deploy/deploy.sh`，`chmod +x`。
- **Windows**：生成 `deploy/deploy.ps1`，使用 PowerShell 语法（`Stop-Process`、`Start-Process`、NSSM 注册服务）。

Windows 关键差异：

| 操作 | Linux | Windows |
|------|-------|---------|
| 杀进程 | `lsof -ti:PORT \| xargs kill` | `Get-NetTCPConnection -LocalPort $PORT \| Stop-Process` |
| 后台启动 | `nohup ... &` | `Start-Process -WindowStyle Hidden` 或 NSSM |
| 日志 | `>> app.log 2>&1` | `Out-File -Append` / NSSM 接管 stdout |

## Phase 5: 输出使用说明

脚本生成后，附带：

- **首次配置**：systemd unit 模板或 pm2 ecosystem 模板。
- **日志位置**：默认 `/var/log/<app>/`（Linux）或项目内 `logs/`。
- **回滚**：`git reset --hard <上一 commit>` 后重跑脚本；建议保留最近 N 个 release 目录。
- **CI 接入**：在 GitHub Actions / GitLab CI 中通过 SSH 执行 `deploy.sh`。

## systemd unit 模板

> 可运行的模板见 `assets/my-api.service`，端口经 `EnvironmentFile=.env` 中的 `APP_PORT` 注入。

```ini
[Unit]
Description=My API Service
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/srv/apps/my-api
EnvironmentFile=/srv/apps/my-api/.env
ExecStart=/usr/bin/node /srv/apps/my-api/dist/server.js
Restart=always
RestartSec=5
StandardOutput=append:/var/log/my-api/app.log
StandardError=append:/var/log/my-api/app.log

[Install]
WantedBy=multi-user.target
```

启用：

```bash
sudo cp deploy/my-api.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now my-api
```

## pm2 ecosystem 模板

> 可运行的模板见 `assets/ecosystem.config.js`，端口从 `APP_PORT` 读取。

```js
module.exports = {
  apps: [{
    name: 'my-api',
    script: 'dist/server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env_production: {
      NODE_ENV: 'production',
      APP_PORT: 8080
    },
    error_file: '/var/log/my-api/err.log',
    out_file: '/var/log/my-api/out.log',
    merge_logs: true
  }]
}
```

## Assets（预置启动脚本）

可直接拷贝到服务器运行，统一遵循 `references/script-standards.md` 的日志、端口与退出码规范：

| 文件 | 平台 | 用法 |
|------|------|------|
| `assets/launch.sh` | Linux | `./launch.sh <node\|python\|java\|go> [--manager systemd\|pm2\|nohup] [--port P] [--branch B] [--skip-pull] [--skip-build]` |
| `assets/launch.ps1` | Windows | `.\launch.ps1 <node\|python\|java\|go> [-Manager nssm\|hidden] [-Port P] [-Branch B]` |
| `assets/my-api.service` | systemd 模板 | 替换 `{{APP_NAME}}/{{APP_DIR}}/{{START_CMD}}/{{LOG_DIR}}` 后拷到 `/etc/systemd/system/` |
| `assets/ecosystem.config.js` | pm2 模板 | `pm2 start ecosystem.config.js --env production` |

特点：自包含日志函数（`[时间] [级别] 消息`，同步写 `${LOG_DIR}/launch.log`）、端口统一读 `APP_PORT`（命令行 > .env > 默认 8080）、优雅停老进程、健康检查重试 10 次、失败非零退出。

> Claude 生成部署脚本时，默认直接基于 `launch.sh` / `launch.ps1` 填充语言与管理器参数；只有目标语言/进程管理器不被覆盖时，才按 `references/script-pipeline.md` 手工拼装。

## Resources

- `references/script-standards.md` — 脚本规范（日志格式 + APP_PORT/环境变量约定 + shebang + 退出码）
- `references/script-pipeline.md` — 部署脚本标准步骤与每一步的可选实现
- `assets/launch.sh` / `assets/launch.ps1` / `assets/my-api.service` / `assets/ecosystem.config.js` — 可运行脚本与模板（见上）

## Best Practices

- 脚本顶部 `set -euo pipefail`（bash），任何步骤失败立即终止。
- 优雅停老进程：先 SIGTERM，等待 2s，未退出再 SIGKILL。
- 健康检查必须重试，避免进程刚起还没监听端口就误判失败。
- 日志加时间戳或按天轮转（logrotate），避免磁盘打满。
- 不在脚本里硬编码密钥；从 `.env` 读取。
- 保留回滚能力（上一 commit 或上一 release 目录）。
- 默认只生成脚本，不远程执行；如需执行必须二次确认。
