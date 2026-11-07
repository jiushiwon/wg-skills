# deploy-native-skill

一个用于 **生成原生部署脚本** 的 Claude Skill。按 `deploy-profile.md` 选择启动方式，生成「拉代码 → 装依赖 → 构建 → 停老进程 → 起新进程 → 日志定向 → 健康检查」的完整部署脚本，按 OS 输出 `.sh` 或 `.ps1`。

---

## 它能做什么

当你说：

- 「原生部署」
- 「deploy native」
- 「生成部署脚本」
- 「帮我写个一键部署脚本」

这个 Skill 会帮你把过去手写的部署流程规范化，生成可幂等重复执行的脚本，支持 systemd / pm2 / supervisor / nohup 等进程管理方式。

---

## 它解决了什么问题

| 问题 | 解决方案 |
|------|----------|
| 每次部署都重写脚本 | 按画像自动生成标准流程脚本 |
| 老进程没杀干净导致端口占用 | 优雅停止（TERM → 等待 → KILL） |
| 进程崩溃后没人拉起来 | systemd / pm2 自动重启 |
| 日志散落各处 | 统一输出到 `/var/log/<app>/` |
| 部署完不知道起没起来 | 内置健康检查（重试 N 次） |
| Windows 与 Linux 命令混淆 | 按 OS 输出 `.sh` 或 `.ps1` |

---

## 支持的启动方式

| 语言 / 框架 | 启动命令 |
|------------|----------|
| Node.js / Express | `node dist/server.js` 或 pm2 |
| Node.js / NestJS | `node dist/main.js` |
| Python / FastAPI | `gunicorn` 托管 `uvicorn` worker |
| Python / Django | `gunicorn config.wsgi:application` |
| Java / Spring Boot | `java -jar target/app.jar` |
| Go / Gin | `./bin/server` |
| Ruby / Rails | `puma` |
| PHP / Laravel | `php-fpm` + Nginx |

---

## 使用方式

```
原生部署
```

或自然语言：

```
帮我写个部署脚本
生成一键部署脚本，含日志和健康检查
```

### 五阶段流程

```
Phase 1: 读 deploy-profile.md，确定语言/框架/启动方式
Phase 2: 选择进程管理方式（systemd / pm2 / supervisor / nohup）
Phase 3: 生成部署脚本骨架（拉代码 → 装依赖 → 构建 → 停老 → 起新 → 日志 → 健康检查）
Phase 4: 按 OS 输出 .sh 或 .ps1
Phase 5: 输出使用说明（首次配置 / 日志 / 回滚 / CI 接入）
```

---

## 脚本标准步骤

```
[1/6] git fetch + reset --hard origin/main
[2/6] 装依赖（npm ci / pip install / go mod download / mvn package）
[3/6] 构建（如有）
[4/6] 优雅停老进程（按端口或 PID）
[5/6] 后台起新进程（systemd / pm2 / nohup）
[6/6] 健康检查（curl /health，重试 10 次）
```

---

## 进程管理方式选择

| 场景 | 推荐 |
|------|------|
| Linux 通用 | systemd |
| Node.js 多实例 | pm2 |
| Python/Go 简单守护 | supervisor |
| 临时/简单场景 | nohup |
| Windows 服务 | NSSM |

---

## 预置启动脚本（可直接运行）

`assets/` 提供自包含部署脚本，统一日志、端口与退出码规范（`script-standards.md`）：

```bash
# Linux
chmod +x assets/launch.sh
./assets/launch.sh node --port 8080 --branch main        # 自动选 pm2/nohup
./assets/launch.sh java --manager systemd --port 8080
./assets/launch.sh go --skip-pull                        # CI 已拉代码
```

```powershell
# Windows（管理员 PowerShell）
.\assets\launch.ps1 node -Port 8080
.\assets\launch.ps1 java -Manager nssm -Port 8080
```

配套模板：

```bash
# systemd
sudo cp assets/my-api.service /etc/systemd/system/my-api.service
# 替换 {{APP_NAME}}/{{APP_DIR}}/{{START_CMD}}/{{LOG_DIR}}/{{APP_USER}}
sudo systemctl daemon-reload && sudo systemctl enable --now my-api

# pm2
cp assets/ecosystem.config.js . && pm2 start ecosystem.config.js --env production
```

日志统一输出到 `${LOG_DIR}`（默认 `/var/log/<app>/`，Windows `C:\var\log\<app>\`），格式 `[YYYY-MM-DD HH:MM:SS] [LEVEL] message`。

---

## 目录结构

```
deploy-native-skill/
├── SKILL.md                         # 技能定义：触发条件、五阶段流程
├── README.md                        # 本文件
├── assets/
│   ├── launch.sh                    # Linux 部署脚本（node/python/java/go）
│   ├── launch.ps1                   # Windows 部署脚本
│   ├── my-api.service               # systemd unit 模板
│   └── ecosystem.config.js          # pm2 模板
└── references/
    ├── script-standards.md          # 脚本规范（日志 + APP_PORT + shebang + 退出码）
    └── script-pipeline.md           # 部署脚本标准步骤与可选实现
```

---

## 与上游/下游 Skill 的关系

- 上游：[deploy-detect-skill](../deploy-detect-skill/) 提供画像。
- 上游：[server-setup-skill](../server-setup-skill/) 确保运行时/进程管理器已装。
- 协作：[static-nginx-skill](../static-nginx-skill/) 处理前端产物 Nginx 配置。

---

## 注意事项

1. **默认不执行**：本 Skill 只生成脚本，不远程跑；执行需二次确认。
2. **优雅停止**：先 TERM 再 KILL，避免数据未落盘。
3. **健康检查重试**：进程刚起可能还没监听端口，必须重试。
4. **日志轮转**：建议配 logrotate，避免磁盘打满。
5. **密钥安全**：脚本不硬编码密钥，从 `.env` 读取。
6. **回滚能力**：保留上一 commit 或 release 目录，便于快速回滚。
