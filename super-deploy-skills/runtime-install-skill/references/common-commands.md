# 通用命令模板

本文件定义运行时软件安装时的通用命令模板。

## 幂等检测命令

| 软件 | 检测命令 | 成功输出示例 |
|------|----------|--------------|
| Java | `java -version 2>&1` | openjdk version "21.0.1" |
| Python | `python3 --version` | Python 3.12.0 |
| Node.js | `node -v` | v20.10.0 |
| Go | `go version` | go1.21.5 linux/amd64 |

## 常见安装源

### Node.js

```bash
# Nodesource（Ubuntu/Debian）
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Nodesource（CentOS/RHEL）
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo dnf install -y nodejs
```

### Python

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install -y software-properties-common
sudo add-apt-repository -y ppa:deadsnakes/ppa
sudo apt install -y python3.12 python3.12-venv python3.12-dev

# CentOS/RHEL
sudo dnf install -y python3.12 python3.12-devel
```

### Go

```bash
# 下载安装（所有 Linux 发行版）
wget https://go.dev/dl/go1.21.5.linux-amd64.tar.gz
sudo rm -rf /usr/local/go
sudo tar -C /usr/local -xzf go1.21.5.linux-amd64.tar.gz
export PATH=$PATH:/usr/local/go/bin
```

## Docker 安装命令

### Docker 官方安装脚本

```bash
# Linux
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# 启动服务
sudo systemctl enable --now docker
```

### Docker Compose

```bash
# 作为插件安装（Docker 24+）
docker compose version

# 独立二进制
sudo curl -L "https://github.com/docker/compose/releases/download/v2.23.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

## 验证命令

### Java

```bash
java -version
javac -version
echo $JAVA_HOME
```

### Python

```bash
python3 --version
pip3 --version
python3 -m venv --help
```

### Node.js

```bash
node -v
npm -v
which node
```

### Go

```bash
go version
go env GOROOT
go env GOPATH
```

## 卸载命令（供参考）

### Ubuntu/Debian

```bash
# Node.js
sudo apt remove -y nodejs
sudo rm -rf /etc/apt/sources.list.d/nodesource.list

# Python（系统自带不删，仅删自定义版本）
sudo apt remove -y python3.12

# Go
sudo rm -rf /usr/local/go
```

## 服务管理命令

### systemctl（Linux）

```bash
# 启动
sudo systemctl start <service>

# 停止
sudo systemctl stop <service>

# 重启
sudo systemctl restart <service>

# 开机自启
sudo systemctl enable <service>

# 查看状态
sudo systemctl status <service>
```

### launchd（macOS）

```bash
# 启动服务
brew services start <service>

# 停止服务
brew services stop <service>

# 查看状态
brew services list
```

## Windows 服务命令

```powershell
# 启动服务
Start-Service <ServiceName>

# 停止服务
Stop-Service <ServiceName>

# 查看状态
Get-Service <ServiceName>

# 设置开机自启
Set-Service -Name <ServiceName> -StartupType Automatic
```
