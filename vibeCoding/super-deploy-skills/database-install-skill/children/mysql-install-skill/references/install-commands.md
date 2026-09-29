# MySQL 安装命令参考

## Ubuntu/Debian

### 安装命令

```bash
# 更新包索引
sudo apt update

# 安装 MySQL Server
sudo apt install -y mysql-server

# 安装 MySQL Client（可选）
sudo apt install -y mysql-client
```

### 服务管理

```bash
# 启动
sudo systemctl start mysql

# 开机自启
sudo systemctl enable mysql

# 查看状态
sudo systemctl status mysql

# 重启
sudo systemctl restart mysql
```

### 安全配置

```bash
# 运行安全配置向导
sudo mysql_secure_installation

# 交互式配置内容：
# - 设置 root 密码
# - 移除匿名用户
# - 禁止 root 远程登录
# - 移除测试数据库
# - 重新加载权限表
```

## CentOS/RHEL

### 安装命令

```bash
# 安装 MySQL Server
sudo dnf install -y mysql-server

# 启动
sudo systemctl start mysqld

# 开机自启
sudo systemctl enable mysqld
```

### 获取临时密码

```bash
# MySQL 5.7+ 安装后会生成临时密码
sudo grep 'temporary password' /var/log/mysqld.log

# 使用临时密码登录
mysql -u root -p
```

### 安全配置

```bash
sudo mysql_secure_installation
```

## macOS

### 安装命令

```bash
# 使用 Homebrew
brew install mysql

# 启动服务
brew services start mysql

# 连接
mysql -u root
```

### 版本选择

```bash
# 安装特定版本
brew install mysql@5.7

# 链接
brew link mysql@5.7
```

## Windows

### winget 安装

```powershell
# 安装 MySQL
winget install Oracle.MySQL

# 或使用 winget search 查找版本
winget search mysql
```

### Chocolatey 安装

```powershell
choco install mysql
```

### 手动安装

1. 下载安装包：https://dev.mysql.com/downloads/installer/
2. 运行 MySQL Installer
3. 选择"Full"安装类型
4. 设置 root 密码

### 服务管理（PowerShell）

```powershell
# 启动服务
Start-Service MySQL

# 停止服务
Stop-Service MySQL

# 查看状态
Get-Service MySQL
```

## Docker 方式

### 拉取镜像

```bash
# 指定版本
docker pull mysql:8.0
docker pull mysql:5.7

# Alpine 轻量镜像
docker pull mysql:8.0-alpine
```

### 运行容器

```bash
# 基础运行
docker run -d --name mysql \
  -e MYSQL_ROOT_PASSWORD=your_password \
  -v mysql_data:/var/lib/mysql \
  mysql:8.0

# 指定端口
docker run -d --name mysql \
  -e MYSQL_ROOT_PASSWORD=your_password \
  -p 3306:3306 \
  -v mysql_data:/var/lib/mysql \
  mysql:8.0

# 自定义数据库和用户
docker run -d --name mysql \
  -e MYSQL_ROOT_PASSWORD=your_password \
  -e MYSQL_DATABASE=mydb \
  -e MYSQL_USER=myuser \
  -e MYSQL_PASSWORD=myuser_password \
  -p 3306:3306 \
  mysql:8.0
```

### Docker Compose

```yaml
version: '3.8'
services:
  mysql:
    image: mysql:8.0-alpine
    environment:
      MYSQL_ROOT_PASSWORD: your_password
      MYSQL_DATABASE: mydb
      MYSQL_USER: myuser
      MYSQL_PASSWORD: myuser_password
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
volumes:
  mysql_data:
```

## 连接配置

### 本地连接

```bash
# 使用 root 用户
mysql -u root -p

# 指定数据库
mysql -u root -p mydb

# 指定主机和端口
mysql -u root -p -h localhost -P 3306
```

### 远程连接

```bash
# 安装客户端
sudo apt install mysql-client

# 连接
mysql -u root -p -h remote_host -P 3306
```

## 配置文件位置

| 操作系统 | 配置目录 |
|----------|----------|
| Ubuntu/Debian | /etc/mysql/ |
| CentOS/RHEL | /etc/ |
| macOS | /usr/local/etc/ |
| Windows | C:\Program Files\MySQL\MySQL Server 8.0\ |

### 主要配置文件

- `my.cnf` — 主配置
- `mysql.conf.d/` — 配置片段

## 常用配置修改

### 字符集

```ini
# my.cnf
[client]
default-character-set = utf8mb4

[mysqld]
character-set-server = utf8mb4
collation-server = utf8mb4_unicode_ci
```

### 监听地址

```ini
# 允许远程
bind-address = 0.0.0.0

# 仅本地
bind-address = 127.0.0.1
```

### 内存配置

```ini
[mysqld]
innodb_buffer_pool_size = 1G
max_connections = 200
```

### 远程访问授权

```sql
-- 创建可远程访问的用户
CREATE USER 'myuser'@'%' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON mydb.* TO 'myuser'@'%';
FLUSH PRIVILEGES;
```

## 卸载命令

### Ubuntu/Debian

```bash
sudo apt remove --purge -y mysql-server mysql-client
sudo rm -rf /var/lib/mysql
sudo rm -rf /etc/mysql
```

### CentOS/RHEL

```bash
sudo dnf remove -y mysql-server
sudo rm -rf /var/lib/mysql
```

### macOS

```bash
brew uninstall mysql
rm -rf /usr/local/var/mysql
```

## 常见问题

### Q: Access denied for user 'root'@'localhost'

A: 使用 sudo 运行 mysql 命令，或重置密码

### Q: Can't connect to local MySQL server

A: 检查 MySQL 服务是否运行：sudo systemctl status mysql

### Q: 端口 3306 被占用

A: 修改 my.cnf 中的 port 为其他端口

### Q: 中文乱码

A: 确保使用 utf8mb4 字符集，连接时也指定字符集
