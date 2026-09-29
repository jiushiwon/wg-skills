# 各运行时安装命令模板

本文件列出常见运行时、数据库、容器、反向代理在主流 OS 上的「检测命令 + 安装命令」骨架。所有命令必须**幂等**：先检测，已存在则跳过。

> 约束：默认只生成命令不执行；执行安装需二次确认；数据库初始化永不自动执行。

## JDK

| OS | 检测 | 安装命令骨架 |
|----|------|-------------|
| Ubuntu/Debian | `java -version` | `sudo apt update && sudo apt install -y openjdk-17-jdk` |
| CentOS/RHEL | `java -version` | `sudo dnf install -y java-17-openjdk-devel` |
| Alpine | `java -version` | `sudo apk add openjdk17` |
| macOS | `java -version` | `brew install openjdk@17` |
| Windows | `java -version` | `winget install Microsoft.OpenJDK.17` |

默认 JDK 17（LTS）；如画像要求 21/23，替换版本号。

## Node.js

推荐用 NodeSource（Linux）或 nvm（跨平台）。

| OS | 检测 | 安装命令骨架 |
|----|------|-------------|
| Ubuntu/Debian | `node -v` | `curl -fsSL https://deb.nodesource.com/setup_22.x \| sudo -E bash - && sudo apt install -y nodejs` |
| CentOS/RHEL | `node -v` | `curl -fsSL https://rpm.nodesource.com/setup_22.x \| sudo bash - && sudo dnf install -y nodejs` |
| macOS | `node -v` | `brew install node@22` |
| Windows | `node -v` | `winget install OpenJS.NodeJS.LTS` |

可选 nvm：`curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash` 后 `nvm install 22`。

## Python

| OS | 检测 | 安装命令骨架 |
|----|------|-------------|
| Ubuntu/Debian | `python3 -V` | `sudo apt install -y python3.11 python3.11-venv python3-pip`（deadsnakes PPA 提供非默认版本） |
| CentOS/RHEL | `python3 -V` | `sudo dnf install -y python3.11 python3-pip` |
| macOS | `python3 -V` | `brew install python@3.11` |
| Windows | `python -V` | `winget install Python.Python.3.11` |

## Go

| OS | 检测 | 安装命令骨架 |
|----|------|-------------|
| Linux | `go version` | 官方 tar.gz：`curl -LO https://go.dev/dl/go1.22.x.linux-amd64.tar.gz && sudo tar -C /usr/local -xzf go1.22.x.linux-amd64.tar.gz`，加入 `PATH` |
| macOS | `go version` | `brew install go` |
| Windows | `go version` | `winget install GoLang.Go` |

## Docker

| OS | 检测 | 安装命令骨架 |
|----|------|-------------|
| Ubuntu/Debian | `docker -v` | `curl -fsSL https://get.docker.com \| sudo sh`（官方脚本，含 apt repo 配置） |
| CentOS/RHEL | `docker -v` | `sudo dnf install -y dnf-plugins-core && sudo dnf config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo && sudo dnf install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin` |
| macOS | `docker -v` | `brew install --cask docker` |
| Windows | `docker -v` | `winget install Docker.DockerDesktop` |

安装后需把当前用户加入 `docker` 组：`sudo usermod -aG docker $USER`（重新登录生效）。

## Nginx

| OS | 检测 | 安装命令骨架 |
|----|------|-------------|
| Ubuntu/Debian | `nginx -v` | `sudo apt install -y nginx` |
| CentOS/RHEL | `nginx -v` | `sudo dnf install -y nginx` |
| Alpine | `nginx -v` | `sudo apk add nginx` |
| macOS | `nginx -v` | `brew install nginx` |
| Windows | `nginx -v` | `winget install nginxinc.nginx` 或下载官方 zip |

## 数据库（仅安装，不初始化）

> 安装后初始化（建库/建用户/导 schema）由用户手动确认执行。

| 数据库 | Ubuntu/Debian | CentOS/RHEL | macOS | Windows |
|--------|---------------|-------------|-------|---------|
| PostgreSQL 16 | `sudo apt install -y postgresql-16`（需 PGDG repo） | `sudo dnf install -y postgresql16-server` | `brew install postgresql@16` | `winget install PostgreSQL.PostgreSQL` |
| MySQL 8.0 | `sudo apt install -y mysql-server` | `sudo dnf install -y mysql-server` | `brew install mysql` | `winget install Oracle.MySQL` |
| MongoDB 7 | 官方 repo + `sudo apt install -y mongodb-org` | 官方 repo + `sudo dnf install -y mongodb-org` | `brew install mongodb-community` | `winget install MongoDB.Server` |
| Redis 7 | `sudo apt install -y redis-server` | `sudo dnf install -y redis` | `brew install redis` | `winget install Redis.Redis`（或 Memurai） |

## 进程管理器（原生部署用）

| 工具 | 安装 | 适用 |
|------|------|------|
| systemd | 系统自带 | Linux 首选，写 unit 文件 |
| pm2 | `sudo npm install -g pm2` | Node.js 多进程/集群 |
| supervisor | `sudo apt install -y supervisor` | Python/Go/通用进程守护 |

## 幂等性模板

每条命令遵循以下模式（以 Node.js 为例）：

```bash
if ! command -v node >/dev/null 2>&1 || [ "$(node -v | cut -d. -f1 | tr -d v)" -lt 22 ]; then
  curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
  sudo apt install -y nodejs
else
  echo "Node.js $(node -v) already installed, skip"
fi
```

PowerShell 等价：

```powershell
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  winget install OpenJS.NodeJS.LTS
} else {
  Write-Host "Node.js $(node -v) already installed, skip"
}
```

## 风险标注

- `curl | sh` 类安装（Docker、NodeSource）需标注「将下载并执行远程脚本，请审计来源」。
- 添加第三方 repo（PGDG、MongoDB、Docker）需标注「修改系统软件源」。
- 数据库安装后默认监听本地；如需远程访问，单独提示修改 `bind` / `listen_addresses` 与防火墙。
