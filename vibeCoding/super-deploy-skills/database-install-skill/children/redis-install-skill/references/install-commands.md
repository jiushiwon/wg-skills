# Redis 安装命令参考

## Ubuntu/Debian

### 安装命令

```bash
# 更新包索引
sudo apt update

# 安装 Redis
sudo apt install -y redis-server
```

### 服务管理

```bash
# 启动
sudo systemctl start redis-server

# 开机自启
sudo systemctl enable redis-server

# 查看状态
sudo systemctl status redis-server

# 重启
sudo systemctl restart redis-server
```

### 配置文件

```bash
# 主配置文件
sudo vim /etc/redis/redis.conf

# 检查配置
redis-server --test-memory 1024
```

## CentOS/RHEL

### 安装命令

```bash
# 安装 Redis 6
sudo dnf install -y redis

# 安装 Redis 7（需要 EPEL）
sudo dnf install -y epel-release
sudo dnf install -y redis
```

### 服务管理

```bash
# 启动
sudo systemctl start redis

# 开机自启
sudo systemctl enable redis

# 查看状态
sudo systemctl status redis
```

## macOS

### 安装命令

```bash
# 使用 Homebrew
brew install redis

# 启动服务
brew services start redis

# 连接
redis-cli
```

### 配置

```bash
# 配置文件位置
/usr/local/etc/redis.conf

# 前台运行（调试）
redis-server
```

## Windows

### winget 安装

```powershell
# 安装 Redis
winget install Redis.Redis

# 或使用 Chocolatey
choco install redis
```

### Memurai（Windows 替代品）

```powershell
# 安装 Memurai（Redis 兼容）
choco install memurai
```

### 服务管理（PowerShell）

```powershell
# 启动服务
Start-Service Redis

# 停止服务
Stop-Service Redis
```

## Docker 方式

### 拉取镜像

```bash
# 指定版本
docker pull redis:7
docker pull redis:6
docker pull redis:7-alpine
```

### 运行容器

```bash
# 基础运行
docker run -d --name redis \
  -e REDIS_PASSWORD=your_password \
  -v redis_data:/data \
  redis:7

# 指定端口
docker run -d --name redis \
  -e REDIS_PASSWORD=your_password \
  -p 6379:6379 \
  -v redis_data:/data \
  redis:7

# 自定义配置
docker run -d --name redis \
  -e REDIS_PASSWORD=your_password \
  -p 6379:6379 \
  -v redis_data:/data \
  redis:7 redis-server --appendonly yes
```

### Docker Compose

```yaml
version: '3.8'
services:
  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes
    environment:
      REDIS_PASSWORD: your_password
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
volumes:
  redis_data:
```

## 连接配置

### 本地连接

```bash
# 默认连接
redis-cli

# 测试
redis-cli ping

# 带密码
redis-cli -a your_password ping
```

### 远程连接

```bash
# 安装客户端
sudo apt install redis-tools

# 连接
redis-cli -h remote_host -p 6379 -a your_password
```

## 配置文件位置

| 操作系统 | 配置目录 |
|----------|----------|
| Ubuntu/Debian | /etc/redis/redis.conf |
| CentOS/RHEL | /etc/redis.conf |
| macOS | /usr/local/etc/redis.conf |
| Windows | C:\Program Files\Redis\redis.windows.conf |

## 常用配置修改

### 监听地址

```conf
# 允许远程
bind 0.0.0.0

# 仅本地（默认）
bind 127.0.0.1
```

### 设置密码

```conf
# 必须设置密码
requirepass your_password
```

### 持久化

```conf
# 开启 AOF
appendonly yes

# RDB 持久化
save 900 1
save 300 10
save 60 10000
```

### 内存配置

```conf
# 最大内存
maxmemory 256mb

# 内存策略
maxmemory-policy allkeys-lru
```

### 远程访问配置

```conf
# 1. 设置密码
requirepass your_password

# 2. 绑定地址
bind 0.0.0.0

# 3. 重启
sudo systemctl restart redis-server
```

## 卸载命令

### Ubuntu/Debian

```bash
sudo apt remove --purge -y redis-server
sudo rm -rf /var/lib/redis
sudo rm -rf /etc/redis
```

### CentOS/RHEL

```bash
sudo dnf remove -y redis
sudo rm -rf /var/lib/redis
```

### macOS

```bash
brew uninstall redis
rm -rf /usr/local/var/redis
```

## 常见问题

### Q: Connection refused

A: 检查 Redis 服务是否运行：sudo systemctl status redis-server

### Q: NOAUTH Authentication required

A: 需要密码认证：redis-cli -a your_password

### Q: 端口 6379 被占用

A: 修改 redis.conf 中的 port 为其他端口

### Q: 内存不足

A: 修改 maxmemory 配置限制内存使用
