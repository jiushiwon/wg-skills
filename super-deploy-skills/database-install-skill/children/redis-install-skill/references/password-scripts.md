# Redis 密码相关脚本

本文件提供 Redis 密码修改和重置的参考脚本。

## 修改密码脚本

### 临时修改密码（重启后失效）

```bash
# 设置密码（临时，重启后失效）
redis-cli CONFIG SET requirepass 你的密码

# 验证
redis-cli ping  # 返回 NOAUTH Authentication required
redis-cli -a 你的密码 ping  # 返回 PONG
```

### 持久修改密码

```bash
# 方法 1：使用 CONFIG SET + CONFIG REWRITE
redis-cli CONFIG SET requirepass 你的密码
redis-cli CONFIG REWRITE

# 方法 2：手动编辑配置文件
# 编辑 /etc/redis/redis.conf
# 找到 requirepass 这一行，修改密码
# 保存后重启
sudo systemctl restart redis-server
```

### 交互式修改密码

```bash
# 安全的交互式修改
echo "请输入新密码："
read -s NEW_PASSWORD
echo ""

redis-cli CONFIG SET requirepass "$NEW_PASSWORD"
redis-cli CONFIG REWRITE

echo "✅ 密码已修改"
```

## 忘记密码急救脚本

### Ubuntu/Debian

```bash
#!/bin/bash
# redis-reset-password.sh - Redis 密码重置脚本

echo "=== Redis 密码重置 ==="
echo "警告：此操作需要重启 Redis 服务"

# 1. 停止 Redis
echo "[1/4] 停止 Redis 服务..."
sudo systemctl stop redis-server

# 2. 临时移除密码限制
echo "[2/4] 临时移除密码限制..."
CONFIG_FILE="/etc/redis/redis.conf"

# 备份配置
sudo cp $CONFIG_FILE $CONFIG_FILE.backup

# 注释掉 requirepass 行
sudo sed -i 's/^requirepass/#requirepass/g' $CONFIG_FILE

# 3. 启动并设置新密码
echo "[3/4] 启动 Redis 并设置新密码..."
sudo systemctl start redis-server

echo "请输入新密码："
read -s NEW_PASSWORD
echo ""

redis-cli CONFIG SET requirepass "$NEW_PASSWORD"
redis-cli CONFIG REWRITE

# 4. 恢复配置
echo "[4/4] 恢复配置..."
sudo systemctl stop redis-server
sudo mv $CONFIG_FILE.backup $CONFIG_FILE
sudo systemctl start redis-server

echo "✅ 密码重置完成！"
echo "请使用新密码连接：redis-cli -a 你的密码"
```

### CentOS/RHEL

```bash
#!/bin/bash
# redis-reset-password-centos.sh

echo "=== Redis 密码重置 (CentOS/RHEL) ==="

# 1. 停止
echo "[1/4] 停止 Redis..."
sudo systemctl stop redis

# 2. 临时移除密码
CONFIG_FILE="/etc/redis.conf"
sudo cp $CONFIG_FILE $CONFIG_FILE.backup
sudo sed -i 's/^requirepass/#requirepass/g' $CONFIG_FILE

# 3. 启动并重置
echo "[3/4] 启动并重置密码..."
sudo systemctl start redis

read -s -p "新密码: " NEW_PASSWORD
echo ""

redis-cli CONFIG SET requirepass "$NEW_PASSWORD"
redis-cli CONFIG REWRITE

# 4. 恢复
echo "[4/4] 恢复配置..."
sudo systemctl stop redis
sudo mv $CONFIG_FILE.backup $CONFIG_FILE
sudo systemctl start redis

echo "✅ 完成"
```

## Redis 密码策略建议

### 强密码要求

Redis 本身不强制密码复杂度，但建议：

- 至少 16 位
- 包含大小写、数字、特殊字符
- 不要使用常见密码

### 密码相关配置

```conf
# 密码（必设）
requirepass your_strong_password

# 最大客户端数量
maxclients 10000

# 密码过期（需要额外脚本实现）
# Redis 本身不支持密码过期
```

## 连接串格式

```bash
# 环境变量
export REDIS_PASSWORD=你的密码

# 命令行
redis-cli -a 你的密码

# URI 格式
redis://:你的密码@localhost:6379/0

# Python 示例
redis.Redis(host='localhost', port=6379, password='你的密码', db=0)

# Node.js 示例
const redis = require('redis');
const client = redis.createClient({
  password: '你的密码'
});
```

## 备份和恢复密码相关

### 备份

```bash
# 备份 RDB 文件
sudo cp /var/lib/redis/dump.rdb /backup/dump.rdb.$(date +%Y%m%d)

# 备份 AOF 文件
sudo cp /var/lib/redis/appendonly.aof /backup/appendonly.aof.$(date +%Y%m%d)
```

### 恢复

```bash
# 停止 Redis
sudo systemctl stop redis-server

# 恢复文件
sudo cp /backup/dump.rbd /var/lib/redis/dump.rdb

# 启动
sudo systemctl start redis-server
```

## 安全建议

1. **必须设置密码**：生产环境必须设置强密码
2. **限制监听地址**：生产环境仅监听内网 IP
3. **使用 SSL**：使用 stunnel 或 Redis 6.0+ 的 TLS
4. **禁用危险命令**：在配置中禁用 FLUSHDB、FLUSHALL、CONFIG 等
5. **限制内存**：设置 maxmemory 防止内存耗尽
6. **开启持久化**：生产环境开启 AOF 或 RDB
7. **定期备份**：定期备份数据文件

## 禁用危险命令

```conf
# 在 redis.conf 中添加
rename-command FLUSHDB ""
rename-command FLUSHALL ""
rename-command CONFIG "CONFIG_cd7e3f9a"
rename-command DEBUG ""
rename-command SHUTDOWN ""
```

## 内存策略

```conf
# 最大内存
maxmemory 512mb

# 内存策略（当达到最大内存时）
maxmemory-policy noeviction      # 返回错误
maxmemory-policy allkeys-lru     # 删除最近最少使用的键
maxmemory-policy volatile-lru    # 删除设置过期的最近最少使用的键
maxmemory-policy allkeys-random  # 随机删除键
maxmemory-policy volatile-random # 随机删除设置过期的键
maxmemory-policy volatile-ttl    # 删除最近过期的键
```

## 性能优化

```conf
# TCP keepalive
tcp-keepalive 300

# 慢查询日志
slowlog-log-slower-than 10000
slowlog-max-len 128

# 启用压缩
rdbcompression yes
rdbchecksum yes
```
