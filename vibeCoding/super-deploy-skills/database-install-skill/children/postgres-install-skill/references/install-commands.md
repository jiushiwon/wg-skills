# PostgreSQL 安装命令参考

## Ubuntu/Debian

### 添加 PostgreSQL APT 仓库

```bash
# 安装依赖
sudo apt update
sudo apt install -y curl ca-certificates gnupg

# 添加 PostgreSQL GPG 密钥
sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
curl -fsSL https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo gpg --dearmor -o /etc/apt/trusted.gpg.d/postgresql.gpg
sudo apt update
```

### 安装命令

```bash
# 安装 PostgreSQL 16
sudo apt install -y postgresql-16

# 安装 PostgreSQL 15
sudo apt install -y postgresql-15

# 安装 PostgreSQL 14
sudo apt install -y postgresql-14
```

### 服务管理

```bash
# 启动
sudo systemctl start postgresql

# 开机自启
sudo systemctl enable postgresql

# 查看状态
sudo systemctl status postgresql

# 重启
sudo systemctl restart postgresql
```

## CentOS/RHEL

### 安装命令

```bash
# 安装 PostgreSQL 16
sudo dnf install -y https://download.postgresql.org/pub/repos/yum/reporpms/EL-9-x86_64/pgdg-redhat-repo-latest.noarch.rpm
sudo dnf install -y postgresql16-server postgresql16

# 安装 PostgreSQL 15
sudo dnf install -y postgresql15-server postgresql15

# 安装 PostgreSQL 14
sudo dnf install -y postgresql14-server postgresql14
```

### 初始化数据库

```bash
# 初始化
sudo /usr/pgsql-16/bin/postgresql-16-setup initdb

# 启动
sudo systemctl start postgresql-16

# 开机自启
sudo systemctl enable postgresql-16
```

## macOS

### 安装命令

```bash
# 使用 Homebrew
brew install postgresql@16

# 启动服务
brew services start postgresql@16

# 连接
psql -U $(whoami) -d postgres
```

### 版本切换

```bash
# 链接指定版本
brew link postgresql@16

# 强制链接
brew link --force postgresql@16
```

## Windows

### winget 安装

```powershell
# 安装 PostgreSQL 16
winget install PostgreSQL.PostgreSQL.16

# 或指定版本
winget install PostgreSQL.PostgreSQL.15
```

### 手动安装

1. 下载安装包：https://www.enterprisedb.com/downloads/postgres-postgresql-downloads
2. 运行安装程序
3. 设置端口、密码等

### 服务管理（PowerShell）

```powershell
# 启动服务
Start-Service postgresql-x64-16

# 停止服务
Stop-Service postgresql-x64-16

# 查看状态
Get-Service postgresql-x64-16
```

## Docker 方式

### 拉取镜像

```bash
# 指定版本
docker pull postgres:16
docker pull postgres:15
docker pull postgres:14

# Alpine 轻量镜像
docker pull postgres:16-alpine
```

### 运行容器

```bash
# 基础运行
docker run -d --name postgres \
  -e POSTGRES_PASSWORD=your_password \
  -v postgres_data:/var/lib/postgresql/data \
  postgres:16

# 指定端口
docker run -d --name postgres \
  -e POSTGRES_PASSWORD=your_password \
  -p 5432:5432 \
  -v postgres_data:/var/lib/postgresql/data \
  postgres:16

# 自定义数据库和用户
docker run -d --name postgres \
  -e POSTGRES_PASSWORD=your_password \
  -e POSTGRES_DB=mydb \
  -e POSTGRES_USER=myuser \
  -p 5432:5432 \
  postgres:16
```

### Docker Compose

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_PASSWORD: your_password
      POSTGRES_DB: mydb
      POSTGRES_USER: myuser
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
volumes:
  postgres_data:
```

## 连接配置

### 本地连接

```bash
# 默认连接
psql -U postgres

# 指定数据库
psql -U postgres -d mydb

# 指定主机和端口
psql -U postgres -h localhost -p 5432 -d mydb
```

### 远程连接

```bash
# 安装客户端
sudo apt install postgresql-client-16

# 连接
psql -U postgres -h remote_host -p 5432 -d mydb
```

## 配置文件位置

| 操作系统 | 配置目录 |
|----------|----------|
| Ubuntu/Debian | /etc/postgresql/16/main/ |
| CentOS/RHEL | /var/lib/pgsql/16/data/ |
| macOS | /usr/local/var/postgres |
| Windows | C:\Program Files\PostgreSQL\16\data |

### 主要配置文件

- `postgresql.conf` — 主配置
- `pg_hba.conf` — 认证配置
- `pg_ident.conf` — 用户映射

## 常用配置修改

### 监听地址

```bash
# postgresql.conf
listen_addresses = 'localhost'  # 仅本地
listen_addresses = '*'        # 允许远程
```

### 最大连接数

```bash
# postgresql.conf
max_connections = 100
```

### 内存配置

```bash
# postgresql.conf
shared_buffers = 256MB
effective_cache_size = 1GB
work_mem = 64MB
```

### 远程访问认证

```bash
# pg_hba.conf 添加
host all all 0.0.0.0/0 scram-sha-256
host all all ::/0 scram-sha-256
```

## 卸载命令

### Ubuntu/Debian

```bash
sudo apt remove --purge -y postgresql-16 postgresql-client-16
sudo rm -rf /var/lib/postgresql
sudo rm -rf /etc/postgresql
```

### CentOS/RHEL

```bash
sudo dnf remove -y postgresql16-server postgresql16
sudo rm -rf /var/lib/pgsql
```

### macOS

```bash
brew uninstall postgresql@16
rm -rf /usr/local/var/postgres
```

## 常见问题

### Q: 连接被拒绝

A: 检查 pg_hba.conf 是否允许该 IP 连接

### Q: 密码认证失败

A: 检查 postgresql.conf 中的 `password_encryption` 和 pg_hba.conf 中的认证方法

### Q: 端口冲突

A: 修改 postgresql.conf 中的 `port` 为其他端口

### Q: 数据目录权限

A: 确保 /var/lib/postgresql/data 目录属于 postgres 用户
