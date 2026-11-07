# 数据库通用逻辑

本文件定义数据库安装时的通用逻辑。

## 密码获取

### 交互式获取密码（Linux）

```bash
# 获取密码（不显示）
read -s -p "请输入数据库 root 密码: " DB_PASSWORD
echo ""  # 换行

# 验证密码
if [ -z "$DB_PASSWORD" ]; then
    echo "错误: 密码为必填项，取消安装"
    exit 1
fi
```

### 交互式获取密码（PowerShell）

```powershell
# 获取密码（不显示）
$Password = Read-Host "请输入数据库 root 密码" -AsSecureString
$BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($Password)
$PlainPassword = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)
[System.Runtime.InteropServices.Marshal]::ZeroFreeBSTR($BSTR)

if ([string]::IsNullOrEmpty($PlainPassword)) {
    Write-Host "错误: 密码为必填项，取消安装"
    exit 1
}
```

## 幂等检测

### 检测命令

| 数据库 | 检测命令 | 成功输出示例 |
|--------|----------|--------------|
| PostgreSQL | `pg_isready` 或 `psql --version` | accepting connections |
| MySQL | `mysql --version` | Ver 8.0.x |
| MongoDB | `mongod --version` | db version 7.0 |
| Redis | `redis-cli ping` | PONG |

### 检测脚本

```bash
# PostgreSQL
if command -v pg_isready &> /dev/null; then
    if pg_isready -q; then
        echo "PostgreSQL 已安装并运行"
    fi
fi

# MySQL
if command -v mysql &> /dev/null; then
    echo "MySQL 已安装: $(mysql --version)"
fi

# MongoDB
if command -v mongod &> /dev/null; then
    echo "MongoDB 已安装: $(mongod --version | head -1)"
fi

# Redis
if command -v redis-cli &> /dev/null; then
    if redis-cli ping &> /dev/null; then
        echo "Redis 已安装并运行"
    fi
fi
```

## 服务管理

### systemctl（Linux）

```bash
# 启动服务
sudo systemctl start postgresql
sudo systemctl start mysql
sudo systemctl start mongod
sudo systemctl start redis

# 停止服务
sudo systemctl stop postgresql

# 重启服务
sudo systemctl restart postgresql

# 开机自启
sudo systemctl enable postgresql

# 查看状态
sudo systemctl status postgresql
```

### launchd（macOS）

```bash
# 启动服务
brew services start postgresql
brew services start mysql
brew services start mongodb-community
brew services start redis

# 停止服务
brew services stop postgresql
```

### Windows 服务

```powershell
# 启动服务
Start-Service MySQL

# 停止服务
Stop-Service MySQL

# 设置开机自启
Set-Service -Name MySQL -StartupType Automatic
```

## 初始化清单（不自动执行）

数据库安装后，以下步骤必须由用户手动确认：

```markdown
## 数据库初始化清单（手动执行）

- [ ] 1. 启动数据库服务
- [ ] 2. 修改默认管理员密码（见下方脚本）
- [ ] 3. 创建业务数据库 `<app>_db`
- [ ] 4. 创建业务用户并授予最小权限
- [ ] 5. 配置监听地址（默认仅本地）
- [ ] 6. 配置防火墙（如需远程访问）
- [ ] 7. 导入 schema 或运行迁移
- [ ] 8. 验证连接（用业务账号测试）
- [ ] 9. 配置备份策略
```

## 修改密码脚本模板

### PostgreSQL

```bash
# 修改 postgres 用户密码
sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD '新密码';"

# 修改业务用户密码
sudo -u postgres psql -c "ALTER USER appuser WITH PASSWORD '新密码';"
```

### MySQL

```bash
# 修改 root 密码
sudo mysql -u root -e "ALTER USER 'root'@'localhost' IDENTIFIED BY '新密码';"
sudo mysql -u root -p'旧密码' -e "ALTER USER 'root'@'localhost' IDENTIFIED BY '新密码';"
```

### MongoDB

```bash
# 修改用户密码
mongosh admin --eval "db.changeUserPassword('admin', '新密码')"

# 或使用 db.updateUser
mongosh admin --eval "db.updateUser('admin', {pwd: '新密码'})"
```

### Redis

```bash
# 临时修改（重启后失效）
redis-cli CONFIG SET requirepass 新密码

# 持久修改（需编辑配置文件）
# 1. 停止 Redis
# 2. 编辑 /etc/redis/redis.conf
# 3. 设置 requirepass 新密码
# 4. 重启 Redis
```

## 重置密码脚本模板（急救）

### PostgreSQL

```bash
# 紧急重置 postgres 密码
# 1. 停止 PostgreSQL
sudo pg_ctlcluster 16 main stop

# 2. 以信任认证模式启动
sudo pg_ctlcluster 16 main start -o "-c auth=trust"

# 3. 连接并修改密码
sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD '新密码';"

# 4. 恢复正常模式并重启
sudo pg_ctlcluster 16 main stop
sudo pg_ctlcluster 16 main start
```

### MySQL

```bash
# 紧急重置 root 密码
# 1. 停止 MySQL
sudo systemctl stop mysql

# 2. 以跳过权限模式启动
sudo mysqld_safe --skip-grant-tables &

# 3. 连接并修改密码
sudo mysql
# 在 MySQL 命令行:
# FLUSH PRIVILEGES;
# ALTER USER 'root'@'localhost' IDENTIFIED BY '新密码';

# 4. 重启 MySQL
sudo systemctl restart mysql
```

### MongoDB

```bash
# 紧急重置 admin 密码
# 1. 停止 MongoDB
sudo systemctl stop mongod

# 2. 以跳过认证模式启动
sudo mongod --dbpath /var/lib/mongodb --port 27017 --bind_ip 127.0.0.1 --auth false &

# 3. 连接并重置密码
mongosh admin --eval "db.updateUser('admin', {pwd: '新密码'})"

# 4. 重启 MongoDB
sudo systemctl restart mongod
```

### Redis

```bash
# Redis 无法重置密码，只能通过配置文件重置
# 1. 停止 Redis
sudo systemctl stop redis

# 2. 临时移除密码限制
# 编辑 /etc/redis/redis.conf，注释掉 requirepass

# 3. 启动 Redis 并设置新密码
sudo systemctl start redis
redis-cli CONFIG SET requirepass 新密码
redis-cli CONFIG REWRITE

# 4. 恢复配置文件
# 取消注释 requirepass 并设置新密码
# 重启 Redis
```

## 端口配置

| 数据库 | 默认端口 | 配置文件 |
|--------|----------|----------|
| PostgreSQL | 5432 | /etc/postgresql/16/main/postgresql.conf |
| MySQL | 3306 | /etc/mysql/my.cnf 或 /etc/mysql/mysql.conf.d/ |
| MongoDB | 27017 | /etc/mongod.conf |
| Redis | 6379 | /etc/redis/redis.conf |

## 监听地址配置

默认仅监听本地（127.0.0.1），如需远程访问：

```bash
# PostgreSQL
# postgresql.conf
listen_addresses = '*'

# pg_hba.conf 添加
host all all 0.0.0.0/0 scram-sha-256

# MySQL
# my.cnf
bind-address = 0.0.0.0

# MongoDB
# mongod.conf
net:
  port: 27017
  bindIp: 0.0.0.0

# Redis
# redis.conf
bind 0.0.0.0
```

⚠️ 远程访问需要同时配置防火墙和安全策略。

## 安全红线

- 永不自动执行 `DROP DATABASE`、`DROP USER`、`TRUNCATE`
- 初始化命令生成后必须逐条展示给用户确认
- 密码用环境变量或交互式输入，不进脚本
- 默认监听本地；远程访问单独提示
