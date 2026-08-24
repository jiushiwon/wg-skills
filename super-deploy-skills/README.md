# super-deploy-skills 🚀

一键部署技能套件：从「检测项目」到「服务器装环境」到「生成部署脚本/Docker」一条龙。包含 5 个子技能，统一放在本目录下，通过 `deploy-profile.md` 串联。

---

## 子技能

| 子技能 | 干什么 | 触发词 |
|--------|--------|--------|
| [deploy-detect-skill](deploy-detect-skill/) | 检测项目语言/框架/数据库，生成画像 | `部署检测` |
| [server-setup-skill](server-setup-skill/) | 检测服务器，按画像装依赖（含预置安装脚本） | `服务器环境检测` |
| [static-nginx-skill](static-nginx-skill/) | 前端 Nginx 托管配置 | `nginx 部署` / `vue 部署` |
| [deploy-native-skill](deploy-native-skill/) | 原生部署脚本（含预置 launch.sh/.ps1） | `原生部署` |
| [deploy-docker-skill](deploy-docker-skill/) | Dockerfile + compose | `Docker 部署` |

---

## 如何具体使用（完整走查）

### 0. 前置准备

- 项目代码已 push 到 git 仓库（部署脚本默认 `git fetch + reset --hard`）。
- 服务器可 SSH（Linux）或 WinRM/RDP（Windows）。
- 项目根有健康检查端点 `GET /health`（脚本默认用它判定启动成功，可改 `HEALTH_PATH`）。

### 1. 检测项目画像

对 Claude 说：

```
帮我部署这个项目
```

或：

```
部署检测
```

Claude 调用 `deploy-detect-skill`，扫描项目根，输出 `deploy-profile.md`（项目根目录）。示例：

```markdown
# 项目部署画像
## 检测到的技术栈
| 类型 | 识别结果 | 置信度 | 依据文件 |
| 语言 | Node.js 22 | 高 | package.json |
| Web 框架 | Express | 高 | package.json |
| 数据库 | PostgreSQL 16 | 中 | .env DB_URL |
## 推断的部署需求
- 需要运行时：Node.js 22
- 需要数据库：PostgreSQL 16
- 应用端口（APP_PORT）：8080
- 建议部署方式：原生 / Docker 均可
```

> 中/低置信度项会向你确认（如「.env 里的 DB 是生产还是本地」）。

### 2. 准备服务器环境

对 Claude 说：

```
检测下这台服务器能不能跑，缺什么装上
```

Claude 调用 `server-setup-skill`：

1. 读 `deploy-profile.md`，得到「需要 Node.js 22 + PostgreSQL 16」。
2. 检测服务器 OS / 已装版本 / 端口占用 / 运行状态。
3. 输出缺失项对比表 + 安装命令。
4. **默认只生成命令不执行**；你说「直接装」并二次确认后，才用预置脚本执行。

手动执行预置安装脚本（拷贝到服务器）：

```bash
# Linux
chmod +x install.sh
./install.sh node --version 22
./install.sh nginx          # 如需反向代理
# PostgreSQL 安装：
./install.sh postgres       # 仅装服务；初始化（建库/建用户）按 database-setup.md 手动执行
```

```powershell
# Windows（管理员 PowerShell）
.\install.ps1 node -Version 22
.\install.ps1 nginx
```

日志：`/var/log/<app>/install.log`（Windows: `C:\var\log\<app>\install.log`）。

### 3. 选择部署方式（二选一）

#### 方案 A：原生部署

对 Claude 说：

```
用原生脚本部署
```

Claude 调用 `deploy-native-skill`，把 `assets/launch.sh`（或 `launch.ps1`）复制到项目，填入 `APP_NAME` / `APP_PORT` / `BRANCH`。

项目根准备 `.env`：

```bash
APP_NAME=my-api
APP_DIR=/srv/apps/my-api
APP_PORT=8080
APP_ENV=production
LOG_DIR=/var/log/my-api
BRANCH=main
HEALTH_PATH=/health
```

执行：

```bash
chmod +x launch.sh
./launch.sh node --port 8080 --branch main
# 自动：git pull → npm ci → npm run build → 停老进程 → 起新进程 → curl /health 重试 10 次
```

进程管理器自动选择：有 `ecosystem.config.js` 用 pm2；有 systemd unit 用 systemd；都没有用 nohup。也可显式指定 `--manager systemd`。

#### 方案 B：Docker 部署

对 Claude 说：

```
用 Docker 部署
```

Claude 调用 `deploy-docker-skill`，生成 `Dockerfile` + `docker-compose.yml` + `.dockerignore`。执行：

```bash
docker compose up -d --build
docker compose logs -f app
```

端口由 `.env` 的 `APP_PORT` 决定（compose 映射 `${APP_PORT:-8080}:8080`）。

### 4. 前端 Nginx（仅前端项目）

如画像检测到 Vue/React 产物，对 Claude 说：

```
前端用 Nginx 托管
```

Claude 调用 `static-nginx-skill`，生成站点配置（SPA `try_files` + `/api` 反代到 `APP_PORT`）。手动落地：

```bash
sudo cp -r dist/* /var/www/my-app/
sudo cp my-app.conf /etc/nginx/sites-available/
sudo ln -s /etc/nginx/sites-available/my-app.conf /etc/nginx/sites-enabled/
sudo nginx -t && sudo nginx -s reload
```

### 5. 验证

```bash
curl http://<服务器IP>:8080/health        # 后端
curl -I http://<服务器IP>/                 # 前端
tail -f /var/log/my-api/launch.log         # 部署日志
```

### 6. 后续：代码更新后

- **重新部署**：`./launch.sh node --skip-pull`（CI 已拉代码）或 `./launch.sh node`（脚本内 git pull）。
- **重新检测画像**（依赖/端口变了）：再跑一次 `部署检测`，会追加「变化摘要」。
- **自动重新检测**：按 `deploy-detect-skill/references/auto-redetect.md` 配 git hook / CI。

### 7. 回滚

```bash
# 按 commit
git reset --hard <上一正常 commit> && ./launch.sh node

# 或 release 目录（如启用）：把 current 软链接指回上一版本后 systemctl restart
```

---

## 端口与日志约定（重点）

- **端口统一 `APP_PORT`**：启动脚本、systemd/pm2、Dockerfile `EXPOSE`、Nginx `proxy_pass` 都读它。优先级：命令行 `-p/--port` > `.env` 的 `APP_PORT` > 默认 8080。
- **应用代码要读 `APP_PORT`**：`process.env.APP_PORT` / `os.getenv("APP_PORT")` / `@Value("${APP_PORT:8080}")` / `os.Getenv("APP_PORT")`。
- **日志格式**：`[YYYY-MM-DD HH:MM:SS] [LEVEL] message`，同时输出到 stdout 与 `${LOG_DIR}/<script>.log`。

详见 [deploy-native-skill/references/script-standards.md](deploy-native-skill/references/script-standards.md)。

---

## 目录结构

```
super-deploy-skills/
├── SKILL.md                         # 父入口：触发条件 + 路由规则
├── README.md                        # 本文件
├── deploy-detect-skill/             # 子技能：项目技术栈检测
│   ├── SKILL.md
│   ├── README.md
│   └── references/
│       ├── detection-rules.md
│       ├── profile-spec.md
│       └── auto-redetect.md
├── server-setup-skill/              # 子技能：服务器环境检测与依赖安装
│   ├── SKILL.md
│   ├── README.md
│   ├── assets/
│   │   ├── install.sh               # Linux 幂等安装脚本
│   │   └── install.ps1              # Windows 幂等安装脚本
│   └── references/
│       ├── os-detection.md
│       ├── install-commands.md
│       └── database-setup.md
├── static-nginx-skill/              # 子技能：前端 Nginx 托管
│   ├── SKILL.md
│   ├── README.md
│   └── references/
│       └── nginx-config-spec.md
├── deploy-native-skill/             # 子技能：原生部署
│   ├── SKILL.md
│   ├── README.md
│   ├── assets/
│   │   ├── launch.sh                # Linux 部署脚本
│   │   ├── launch.ps1               # Windows 部署脚本
│   │   ├── my-api.service           # systemd 模板
│   │   └── ecosystem.config.js      # pm2 模板
│   └── references/
│       ├── script-standards.md
│       └── script-pipeline.md
└── deploy-docker-skill/             # 子技能：Docker 部署
    ├── SKILL.md
    ├── README.md
    └── references/
        └── dockerfile-spec.md
```

---

## 安全边界

- 所有技能默认**只生成脚本/命令，不自动执行**；执行安装或部署需二次确认。
- **数据库初始化永不自动执行**（建库/建用户/授权/导 schema 手动跑，见 `database-setup.md`）。
- 密码/密钥走 `.env`，不进脚本、不进命令历史。
- `curl | sh` 类安装会打印 WARN 提示审计来源。

---

## 注意事项

1. 首次部署前确保项目有 `/health` 健康检查端点，否则 `launch.sh` 会判定失败（可改 `HEALTH_PATH`）。
2. Windows 部署需管理员 PowerShell；生产优先 Linux。
3. 端口冲突时 `launch.sh` 会先停老进程；如不是同一应用占用端口，先人工确认。
4. 画像过期（依赖变更）时重新跑 `部署检测` 即可，无需手动改 `deploy-profile.md`。
