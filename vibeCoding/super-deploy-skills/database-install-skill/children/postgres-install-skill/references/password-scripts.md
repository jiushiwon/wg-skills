# PostgreSQL 密码相关脚本

本文件提供 PostgreSQL 密码修改和重置的参考脚本。

## 修改密码脚本

### 修改 postgres 用户密码

```bash
# 方法 1：使用 psql（推荐）
sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD '你的密码';"

# 方法 2：使用 -c 选项
sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD '你的密码';"
```

### 修改业务用户密码

```bash
# 假设业务用户为 appuser
sudo -u postgres psql -c "ALTER USER appuser WITH PASSWORD '你的密码';"
```

### 交互式修改密码

```bash
# 安全的交互式修改（密码不显示）
sudo -u postgres psql <<'EOF'
ALTER USER postgres WITH PASSWORD :'DB_PASSWORD';
\q
EOF

# 传入密码变量
DB_PASSWORD="你的密码" sudo -u postgres psql -v DB_PASSWORD="$DB_PASSWORD" -c "ALTER USER postgres WITH PASSWORD :'DB_PASSWORD';"
```

## 忘记密码急救脚本

### Ubuntu/Debian

```bash
#!/bin/bash
# pg-reset-password.sh - PostgreSQL 密码重置脚本

echo "=== PostgreSQL 密码重置 ==="
echo "警告：此操作将在安全模式下重启数据库"

# 1. 停止 PostgreSQL
echo "[1/4] 停止 PostgreSQL 服务..."
sudo pg_ctlcluster 16 main stop

# 2. 以信任认证模式启动
echo "[2/4] 以跳过认证模式启动..."
sudo pg_ctlcluster 16 main start -o "-c auth=trust"

# 3. 修改密码
echo "[3/4] 输入新密码："
read -s -p "新密码: " NEW_PASSWORD
echo ""

sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD '$NEW_PASSWORD';"

# 4. 恢复正常模式
echo "[4/4] 恢复正常模式..."
sudo pg_ctlcluster 16 main stop
sudo pg_ctlcluster 16 main start

echo "✅ 密码重置完成！"
echo "请使用新密码连接：psql -U postgres -W"
```

### CentOS/RHEL

```bash
#!/bin/bash
# pg-reset-password-centos.sh

VERSION=16  # 修改为你的版本

echo "=== PostgreSQL 密码重置 (CentOS/RHEL) ==="

# 1. 停止
echo "[1/4] 停止 PostgreSQL..."
sudo systemctl stop postgresql-$VERSION

# 2. 修改 pg_hba.conf 临时允许无密码
sudo sed -i 's/peer/trust/g' /var/lib/pgsql/$VERSION/data/pg_hba.conf
sudo sed -i 's/scram-sha-256/trust/g' /var/lib/pgsql/$VERSION/data/pg_hba.conf

# 3. 启动并修改密码
echo "[2/4] 启动并修改密码..."
sudo -u postgres systemctl start postgresql-$VERSION
echo "输入新密码："
read -s NEW_PASSWORD
echo ""
sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD '$NEW_PASSWORD';"

# 4. 恢复配置并重启
echo "[4/4] 恢复配置..."
sudo sed -i 's/trust/peer/g' /var/lib/pgsql/$VERSION/data/pg_hba.conf
sudo systemctl restart postgresql-$VERSION

echo "✅ 完成"
```

## 密码策略建议

### 强密码要求

```sql
-- 检查密码策略
-- PostgreSQL 不内置密码策略，可通过插件实现

-- 安装密码验证插件
CREATE EXTENSION passwordcheck;

-- 设置最小长度等（在 postgresql.conf）
passwordcheck.enforce = on
```

### 连接串格式

```bash
# 环境变量
export PGPASSWORD="你的密码"

# URI 格式
postgresql://postgres:密码@localhost:5432/mydb

# .pgpass 文件（自动登录）
# 格式：hostname:port:database:username:password
# 权限：chmod 0600 ~/.pgpass
```

## 备份和恢复密码相关

### 导出数据

```bash
# 导出
pg_dump -U postgres -Fc mydb > mydb.dump

# 带密码
PGPASSWORD=你的密码 pg_dump -U postgres -Fc mydb > mydb.dump
```

### 导入数据

```bash
# 恢复
pg_restore -U postgres -d mydb mydb.dump

# 创建新数据库后导入
createdb -U postgres newdb
pg_restore -U postgres -d newdb mydb.dump
```

## 安全建议

1. **不要使用弱密码**：至少 12 位，包含大小写、数字、特殊字符
2. **定期更换密码**：建议每 90 天更换
3. **限制远程访问**：生产环境尽量不用远程访问
4. **使用 SSL**：启用 SSL 加密连接
5. **审计日志**：开启日志记录登录尝试

## 认证方式对比

| 方式 | 安全级别 | 适用场景 |
|------|----------|----------|
| trust | 高（仅本地） | 本地开发 |
| scram-sha-256 | 高 | 生产推荐 |
| md5 | 中 | 兼容性要求 |
| peer | 高（仅本地） | 本地服务账户 |
| reject | - | 拒绝连接 |

配置位置：`pg_hba.conf`

```conf
# 本地使用 peer/scram-sha-256
local   all             all                                     peer
# 远程使用 scram-sha-256
host    all             all             0.0.0.0/0             scram-sha-256
host    all             all             ::/0                  scram-sha-256
```
