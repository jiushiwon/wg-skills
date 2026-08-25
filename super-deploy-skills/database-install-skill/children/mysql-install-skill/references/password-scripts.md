# MySQL 密码相关脚本

本文件提供 MySQL 密码修改和重置的参考脚本。

## 修改密码脚本

### 修改 root 密码

```bash
# 方法 1：使用 ALTER USER（推荐）
sudo mysql -u root -e "ALTER USER 'root'@'localhost' IDENTIFIED BY '你的密码';"

# 方法 2：使用 SET PASSWORD
sudo mysql -u root -e "SET PASSWORD FOR 'root'@'localhost' = PASSWORD('你的密码');"

# 方法 3：使用 mysql_secure_installation
sudo mysql_secure_installation
```

### 修改业务用户密码

```bash
# 假设业务用户为 appuser
sudo mysql -u root -e "ALTER USER 'appuser'@'localhost' IDENTIFIED BY '你的密码';"
```

### 交互式修改密码

```bash
# 安全的交互式修改
sudo mysql -u root <<'EOF'
ALTER USER 'root'@'localhost' IDENTIFIED BY :'DB_PASSWORD';
FLUSH PRIVILEGES;
\q
EOF
```

## 忘记密码急救脚本

### Ubuntu/Debian

```bash
#!/bin/bash
# mysql-reset-password.sh - MySQL 密码重置脚本

echo "=== MySQL 密码重置 ==="
echo "警告：此操作将在跳过权限模式下重启数据库"

# 1. 停止 MySQL
echo "[1/5] 停止 MySQL 服务..."
sudo systemctl stop mysql

# 2. 创建跳过权限启动脚本
echo "[2/5] 配置跳过权限启动..."
sudo mkdir -p /var/run/mysqld
sudo chown mysql:mysql /var/run/mysqld

# 3. 以跳过权限模式启动
echo "[3/5] 以跳过权限模式启动 MySQL..."
sudo mysqld_safe --skip-grant-tables &
sleep 5

# 4. 修改密码
echo "[4/5] 输入新密码："
read -s -p "新密码: " NEW_PASSWORD
echo ""

sudo mysql <<EOF
FLUSH PRIVILEGES;
ALTER USER 'root'@'localhost' IDENTIFIED BY '$NEW_PASSWORD';
FLUSH PRIVILEGES;
EOF

# 5. 重启 MySQL
echo "[5/5] 重启 MySQL 服务..."
sudo killall mysqld
sleep 3
sudo systemctl start mysql

echo "✅ 密码重置完成！"
echo "请使用新密码连接：mysql -u root -p"
```

### CentOS/RHEL

```bash
#!/bin/bash
# mysql-reset-password-centos.sh

echo "=== MySQL 密码重置 (CentOS/RHEL) ==="

# 1. 停止
echo "[1/5] 停止 MySQL..."
sudo systemctl stop mysqld

# 2. 跳过权限启动
echo "[2/5] 配置跳过权限启动..."
sudo mysqld_safe --skip-grant-tables &
sleep 5

# 3. 修改密码
echo "[3/5] 输入新密码："
read -s NEW_PASSWORD
echo ""

sudo mysql <<EOF
FLUSH PRIVILEGES;
ALTER USER 'root'@'localhost' IDENTIFIED BY '$NEW_PASSWORD';
FLUSH PRIVILEGES;
EOF

# 4. 停止
echo "[4/5] 停止 MySQL..."
sudo killall mysqld
sleep 3

# 5. 启动
echo "[5/5] 启动 MySQL..."
sudo systemctl start mysqld

echo "✅ 完成"
```

## 密码策略建议

### 强密码要求

```sql
-- 安装密码验证组件
INSTALL PLUGIN validate_password SONAME 'validate_password.so';

-- 查看密码策略
SHOW VARIABLES LIKE 'validate_password%';

-- 设置密码策略
SET GLOBAL validate_password.policy = 'STRONG';
SET GLOBAL validate_password.length = 12;
```

### 密码强度要求

| 策略 | 说明 |
|------|------|
| LOW | 仅检查密码长度 |
| MEDIUM | 检查长度、数字、大小写、特殊字符 |
| STRONG | 加上字典文件检查 |

## 连接串格式

```bash
# 环境变量
export MYSQL_PWD="你的密码"

# 命令行（不推荐，密码会显示在进程列表）
mysql -u root -p你的密码

# URI 格式
mysql://root:密码@localhost:3306/mydb

# .my.cnf 文件
[client]
user=root
password=密码
```

## 备份和恢复密码相关

### 导出数据

```bash
# 导出
mysqldump -u root -p mydb > mydb.sql

# 带密码（不推荐）
mysqldump -u root -p'你的密码' mydb > mydb.sql
```

### 导入数据

```bash
# 导入
mysql -u root -p mydb < mydb.sql
```

## 安全建议

1. **不要使用弱密码**：至少 12 位，包含大小写、数字、特殊字符
2. **定期更换密码**：建议每 90 天更换
3. **限制远程访问**：生产环境尽量不用 root 远程访问
4. **使用 SSL**：启用 SSL 加密连接
5. **审计日志**：开启日志记录登录尝试
6. **删除匿名用户**：运行 mysql_secure_installation

## 认证方式对比

| 认证插件 | 说明 |
|----------|------|
| mysql_native_password | 旧认证插件，兼容性 |
| caching_sha2_password | MySQL 8.0 默认，更安全 |
| auth_socket | 仅 Unix socket 认证 |

```sql
-- 查看用户认证方式
SELECT user, host, plugin FROM mysql.user WHERE user = 'root';

-- 修改认证方式
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '密码';
```

## 用户权限管理

```sql
-- 创建用户
CREATE USER 'appuser'@'localhost' IDENTIFIED BY '密码';

-- 授予权限
GRANT ALL PRIVILEGES ON mydb.* TO 'appuser'@'localhost';

-- 授予所有数据库
GRANT ALL PRIVILEGES ON *.* TO 'appuser'@'localhost';

-- 撤销权限
REVOKE ALL PRIVILEGES ON mydb.* FROM 'appuser'@'localhost';

-- 删除用户
DROP USER 'appuser'@'localhost';

-- 刷新权限
FLUSH PRIVILEGES;
```
