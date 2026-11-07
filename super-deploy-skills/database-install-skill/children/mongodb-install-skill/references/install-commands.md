# MongoDB 安装命令参考

## Ubuntu/Debian

### 添加 MongoDB APT 仓库

```bash
# 安装依赖
sudo apt update
sudo apt install -y curl gnupg

# 添加 GPG 密钥
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | sudo gpg --dearmor -o /usr/share/keyrings/mongodb-server-7.0.gpg

# 添加仓库
echo "deb [ signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] http://repo.mongodb.org/apt/debian bookworm/mongodb-org/7.0 main" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# 更新
sudo apt update
```

### 安装命令

```bash
# 安装 MongoDB
sudo apt install -y mongodb-org

# 安装特定版本
sudo apt install -y mongodb-org=7.0.5 mongodb-org-server=7.0.5 mongodb-org-shell=7.0.5 mongodb-org-mongos=7.0.5 mongodb-org-tools=7.0.5
```

### 服务管理

```bash
# 启动
sudo systemctl start mongod

# 开机自启
sudo systemctl enable mongod

# 查看状态
sudo systemctl status mongod

# 重启
sudo systemctl restart mongod
```

## CentOS/RHEL

### 添加 MongoDB YUM 仓库

```bash
# 创建仓库文件
cat <<EOF | sudo tee /etc/yum.repos.d/mongodb-org-7.0.repo
[mongodb-org-7.0]
name=MongoDB Repository
baseurl=https://repo.mongodb.org/yum/redhat/\$releasever/mongodb-org/7.0/x86_64/
gpgcheck=1
enabled=1
gpgkey=https://www.mongodb.org/static/pgp/server-7.0.asc
EOF
```

### 安装命令

```bash
# 安装
sudo dnf install -y mongodb-org

# 安装特定版本
sudo dnf install -y mongodb-org-7.0.5 mongodb-org-server-7.0.5 mongodb-org-mongos-7.0.5 mongodb-org-tools-7.0.5
```

## macOS

### 安装命令

```bash
# 使用 Homebrew
brew tap mongodb/brew
brew install mongodb-community

# 启动服务
brew services start mongodb-community

# 连接
mongosh
```

### 版本选择

```bash
# 安装特定版本
brew install mongodb-community@6.0
```

## Windows

### winget 安装

```powershell
# 安装
winget install MongoDB.Server

# 指定版本
winget install MongoDB.Server --version 6.0.12
```

### 手动安装

1. 下载 MSI：https://www.mongodb.com/try/download/community
2. 运行安装程序
3. 选择"Complete"安装类型

### 服务管理（PowerShell）

```powershell
# 启动服务
Start-Service MongoDB

# 停止服务
Stop-Service MongoDB

# 查看状态
Get-Service MongoDB
```

## Docker 方式

### 拉取镜像

```bash
# 指定版本
docker pull mongo:7.0
docker pull mongo:6.0
docker pull mongo:7.0-arm64

# Enterprise 版
docker pull mongo/mongodb-enterprise:7.0
```

### 运行容器

```bash
# 基础运行
docker run -d --name mongodb \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=your_password \
  -v mongodb_data:/data/db \
  mongo:7.0

# 指定端口
docker run -d --name mongodb \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=your_password \
  -p 27017:27017 \
  -v mongodb_data:/data/db \
  mongo:7.0

# 使用 Docker Compose 最佳实践
```

### Docker Compose

```yaml
version: '3.8'
services:
  mongodb:
    image: mongo:7.0
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: your_password
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
volumes:
  mongodb_data:
```

## 连接配置

### 本地连接

```bash
# 无认证连接
mongosh

# 指定数据库
mongosh mydb

# 指定主机和端口
mongosh mongodb://localhost:27017/mydb
```

### 远程连接

```bash
# 安装客户端
sudo apt install mongodb-org-shell

# 连接
mongosh mongodb://remote_host:27017/admin -u admin -p
```

## 配置文件位置

| 操作系统 | 配置目录 |
|----------|----------|
| Ubuntu/Debian | /etc/mongod.conf |
| CentOS/RHEL | /etc/mongod.conf |
| macOS | /usr/local/etc/mongod.conf |
| Windows | C:\Program Files\MongoDB\Server\7.0\bin\mongod.cfg |

## 常用配置修改

### 监听地址

```yaml
# mongod.conf
net:
  port: 27017
  bindIp: 127.0.0.1  # 改为 0.0.0.0 允许远程
```

### 启用认证

```yaml
security:
  authorization: enabled
```

### 数据目录

```yaml
storage:
  dbPath: /var/lib/mongodb
```

## 卸载命令

### Ubuntu/Debian

```bash
sudo systemctl stop mongod
sudo apt remove --purge -y mongodb-org
sudo rm -rf /var/lib/mongodb
sudo rm -rf /var/log/mongodb
sudo rm -rf /etc/mongod.conf
```

### CentOS/RHEL

```bash
sudo systemctl stop mongod
sudo dnf remove -y mongodb-org
sudo rm -rf /var/lib/mongodb
sudo rm -rf /var/log/mongodb
```

### macOS

```bash
brew uninstall mongodb-community
rm -rf /usr/local/var/mongodb
rm -rf /usr/local/log/mongodb
```

## 常见问题

### Q: Connection refused

A: 检查 MongoDB 服务是否运行：sudo systemctl status mongod

### Q: Authentication failed

A: 检查用户名密码是否正确，确认用户有对应权限

### Q: 端口 27017 被占用

A: 修改 mongod.conf 中的 port 为其他端口

### Q: 启动失败 permission denied

A: 检查数据目录权限：sudo chown -R mongodb:mongodb /var/lib/mongodb
