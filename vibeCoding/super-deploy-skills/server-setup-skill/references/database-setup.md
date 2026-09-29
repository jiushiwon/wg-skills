# 数据库安装与初始化参考

数据库是部署中最容易误伤数据的环节。本文件给出 PostgreSQL / MySQL / MongoDB / Redis 在主流 OS 上的**安装**与**初始化**骨架。

> 安全边界（强制）：
> - **安装**可由 `server-setup-skill` 在「执行安装模式 + 二次确认」后执行。
> - **初始化（建库/建用户/授权/导入 schema）永不自动执行**，生成命令/SQL，由用户审查后手动跑。
> - 已存在数据库时，禁止生成 `DROP DATABASE` / `DROP USER` / `TRUNCATE` 等破坏性命令。
> - 密码统一从 `.env` 读取，不进脚本、不进命令历史（用 `read -s` 或环境变量传入）。

## 通用初始化清单

无论哪种数据库，初始化都按以下顺序生成，逐项由用户确认：

```markdown
## 数据库初始化清单（手动执行）
- [ ] 1. 安装并启动数据库服务（可由 server-setup 执行安装模式完成）
- [ ] 2. 加固默认账号（修改 root/postgres 默认密码，删除匿名用户）
- [ ] 3. 创建业务数据库 `<app>_db`
- [ ] 4. 创建业务账号 `<app_user>` 并授予最小权限
- [ ] 5. 配置监听地址与防火墙（默认仅本地；远程需单独确认）
- [ ] 6. 导入 schema / 运行迁移（migrate 命令）
- [ ] 7. 验证连接（用业务账号连一次）
- [ ] 8. 配置备份策略（cron + dump）
```

## PostgreSQL

### 安装

| OS | 命令 |
|----|------|
| Ubuntu/Debian | 加 PGDG repo 后 `sudo apt install -y postgresql-16` |
| CentOS/RHEL | `sudo dnf install -y postgresql16-server && sudo postgresql-16-setup --initdb` |
| macOS | `brew install postgresql@16 && brew services start postgresql@16` |
| Windows | `winget install PostgreSQL.PostgreSQL.16` |

启动/开机自启：

```bash
sudo systemctl enable --now postgresql        # Linux
brew services start postgresql@16             # macOS
```

### 初始化（手动执行，示例）

```bash
sudo -u postgres psql <<'SQL'
-- 创建业务账号（密码从环境变量读取，勿硬编码）
CREATE USER app WITH PASSWORD :'APP_DB_PASSWORD';
-- 创建业务库
CREATE DATABASE myapi_db OWNER app;
-- 最小权限：仅给业务库权限
GRANT ALL PRIVILEGES ON DATABASE myapi_db TO app;
SQL
```

> `: 'APP_DB_PASSWORD'` 是 psql 变量；执行前 `psql -v APP_DB_PASSWORD="$DB_PASSWORD"` 传入，避免命令行泄露。

监听与远程访问（默认仅本地，需远程时单独确认）：

```bash
# /etc/postgresql/16/main/postgresql.conf
listen_addresses = 'localhost'      # 远程改为 '*' 并配合防火墙

# /etc/postgresql/16/main/pg_hba.conf
host    myapi_db    app    127.0.0.1/32    scram-sha-256
```

迁移导入（按项目栈）：

```bash
# Node.js (Prisma)
npx prisma migrate deploy
# Node.js (TypeORM)
npm run migration:run
# Python (Alembic)
alembic upgrade head
# Java (Flyway)
./mvnw flyway:migrate
```

## MySQL

### 安装

| OS | 命令 |
|----|------|
| Ubuntu/Debian | `sudo apt install -y mysql-server` |
| CentOS/RHEL | `sudo dnf install -y mysql-server && sudo systemctl enable --now mysqld` |
| macOS | `brew install mysql && brew services start mysql` |
| Windows | `winget install Oracle.MySQL` |

### 初始化（手动执行，示例）

```bash
# 加固（交互式，改 root 密码、删匿名用户、禁远程 root）
sudo mysql_secure_installation

# 业务库与账号
sudo mysql <<'SQL'
CREATE DATABASE myapi_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'app'@'127.0.0.1' IDENTIFIED BY 'CHANGE_ME';
GRANT ALL PRIVILEGES ON myapi_db.* TO 'app'@'127.0.0.1';
FLUSH PRIVILEGES;
SQL
```

> Docker 镜像限制：官方 MySQL 镜像拒绝 `root` 作为 `MYSQL_USER`，业务账号用 `app` 等非 root 名（与 `backend-generate-skill/database-skill` 的 MySQL 规范一致）。

## MongoDB

### 安装

| OS | 命令 |
|----|------|
| Ubuntu/Debian | 加 MongoDB repo 后 `sudo apt install -y mongodb-org` |
| CentOS/RHEL | 加 repo 后 `sudo dnf install -y mongodb-org` |
| macOS | `brew tap mongodb/brew && brew install mongodb-community@7.0` |
| Windows | `winget install MongoDB.Server` |

启动：

```bash
sudo systemctl enable --now mongod
```

### 初始化（手动执行，示例）

```bash
mongosh <<'JS'
use myapi_db
db.createUser({
  user: "app",
  pwd: "CHANGE_ME",
  roles: [{ role: "readWrite", db: "myapi_db" }]
})
JS
```

开启认证：编辑 `/etc/mongod.conf`：

```yaml
security:
  authorization: enabled
```

重启后生效。默认 MongoDB 安装**不开启认证**，生产必须开启。

## Redis

### 安装

| OS | 命令 |
|----|------|
| Ubuntu/Debian | `sudo apt install -y redis-server` |
| CentOS/RHEL | `sudo dnf install -y redis && sudo systemctl enable --now redis` |
| macOS | `brew install redis && brew services start redis` |
| Windows | `winget install Redis.Redis`（或 Memurai） |

### 初始化（手动执行，示例）

Redis 一般无需「建库」，但必须设密码与绑定：

```bash
# /etc/redis/redis.conf
bind 127.0.0.1 ::1            # 默认仅本地
requirepass CHANGE_ME         # 必须设密码
appendonly yes                # 需要持久化时开启
maxmemory 256mb               # 按服务器内存设置
maxmemory-policy allkeys-lru  # 缓存场景
```

重启：`sudo systemctl restart redis`。验证：`redis-cli -a "$REDIS_PASSWORD" ping` 期望 `PONG`。

## 连接串格式（写入 .env）

```bash
# PostgreSQL
DB_URL=postgresql://app:CHANGE_ME@127.0.0.1:5432/myapi_db
# MySQL
DB_URL=mysql://app:CHANGE_ME@127.0.0.1:3306/myapi_db
# MongoDB
DB_URL=mongodb://app:CHANGE_ME@127.0.0.1:27017/myapi_db?authSource=myapi_db
# Redis
REDIS_URL=redis://:CHANGE_ME@127.0.0.1:6379/0
```

## 备份策略（建议）

生成 cron 模板，由用户决定是否启用：

```bash
# PostgreSQL 每日备份
0 2 * * * pg_dump -U app myapi_db | gzip > /var/backups/myapi_db_$(date +\%F).sql.gz
# MySQL
0 2 * * * mysqldump -u app -p"$DB_PASSWORD" myapi_db | gzip > /var/backups/myapi_db_$(date +\%F).sql.gz
# MongoDB
0 2 * * * mongodump --db myapi_db --archive=/var/backups/myapi_db_$(date +\%F).archive.gz --gzip
```

保留策略：保留最近 7 天，每周归档一份到对象存储（用户自配）。

## 与 Docker 部署的关系

- 选择 Docker 部署时，数据库通常以 compose 服务形式起（见 `deploy-docker-skill/references/dockerfile-spec.md` 的「数据库镜像选择」），初始化变量走 `env_file`。
- Docker 的 named volume 持久化数据；禁止 `docker compose down -v`。
- 原生部署用本文件的安装 + 初始化流程。

## 安全红线（再次强调）

- 永不自动执行 `DROP` / `TRUNCATE` / `FLUSHALL`。
- 初始化命令生成后，必须逐条展示给用户确认才执行。
- 密码用 `read -s` 或环境变量传入，不进命令历史、不进脚本。
- 默认监听本地；远程访问单独提示修改 `bind` + 防火墙 + 强密码/证书。
