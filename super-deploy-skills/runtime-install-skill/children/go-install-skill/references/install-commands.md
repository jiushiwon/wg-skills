# Go 安装命令参考

## Ubuntu/Debian

### 下载官方二进制

```bash
# 下载 Go 1.21
wget https://go.dev/dl/go1.21.5.linux-amd64.tar.gz

# 或使用 curl
curl -OL https://go.dev/dl/go1.21.5.linux-amd64.tar.gz

# 安装到 /usr/local
sudo rm -rf /usr/local/go
sudo tar -C /usr/local -xzf go1.21.5.linux-amd64.tar.gz

# 添加到 PATH
export PATH=$PATH:/usr/local/go/bin

# 持久化
echo "export PATH=\$PATH:/usr/local/go/bin" >> ~/.bashrc
source ~/.bashrc
```

### 验证

```bash
go version
go env GOROOT
```

## CentOS/RHEL

### 下载官方二进制

```bash
# 下载
curl -OL https://go.dev/dl/go1.21.5.linux-amd64.tar.gz

# 安装
sudo rm -rf /usr/local/go
sudo tar -C /usr/local -xzf go1.21.5.linux-amd64.tar.gz

# 添加到 PATH
export PATH=$PATH:/usr/local/go/bin

# 持久化
echo "export PATH=\$PATH:/usr/local/go/bin" >> ~/.bash_profile
source ~/.bash_profile
```

## macOS

### Homebrew 安装

```bash
# 安装
brew install go

# 验证
go version
```

### 手动安装

```bash
# 下载 macOS ARM64 或 AMD64
curl -OL https://go.dev/dl/go1.21.5.darwin-arm64.tar.gz
# 或
curl -OL https://go.dev/dl/go1.21.5.darwin-amd64.tar.gz

# 安装
sudo rm -rf /usr/local/go
sudo tar -C /usr/local -xzf go1.21.5.darwin-*.tar.gz
```

## Windows

### winget 安装

```powershell
# 安装
winget install Golang.Go

# 验证
go version
```

### 手动安装

1. 下载 MSI 安装包：https://go.dev/dl/go1.21.5.windows-amd64.msi
2. 运行安装程序
3. 打开新的 PowerShell 窗口验证

### Chocolatey 安装

```powershell
choco install golang
```

## Docker 方式

### 拉取镜像

```bash
# 指定版本
docker pull golang:1.21
docker pull golang:1.20
docker pull golang:1.21-alpine
```

### 运行

```bash
# 交互式
docker run -it golang:1.21 /bin/bash

# 编译程序
docker run -v /path/to/project:/project golang:1.21 sh -c "cd /project && go build -o app"
```

### Docker Compose

```yaml
version: '3.8'
services:
  go-app:
    image: golang:1.21-alpine
    volumes:
      - ./app:/app
    working_dir: /app
    command: go run main.go
    ports:
      - "8080:8080"
```

## 环境配置

### GOPATH 和 GOBIN

```bash
# 设置 GOPATH
export GOPATH=$HOME/go

# 设置 GOBIN（安装目录）
export GOBIN=$GOPATH/bin

# 创建目录
mkdir -p $GOPATH/bin

# 持久化
echo "export GOPATH=\$HOME/go" >> ~/.bashrc
echo "export GOBIN=\$GOPATH/bin" >> ~/.bashrc
echo "export PATH=\$PATH:\$GOBIN" >> ~/.bashrc
```

### Go Modules

```bash
# 开启 Go Modules（1.11+ 默认开启）
export GO111MODULE=on

# 使用代理（国内）
export GOPROXY=https://goproxy.cn,direct

# 阿里云
export GOPROXY=https://mirrors.aliyun.com/goproxy/,direct
```

## 常用命令

```bash
# 初始化模块
go mod init module-name

# 下载依赖
go mod download

# 构建
go build -o app-name

# 运行
go run main.go

# 测试
go test ./...

# 安装工具
go install golang.org/x/tools/cmd/goplay@latest
```

## 卸载命令

### Ubuntu/Debian

```bash
sudo rm -rf /usr/local/go
# 清理 PATH 中的 /usr/local/go/bin
```

### CentOS/RHEL

```bash
sudo rm -rf /usr/local/go
```

### macOS

```bash
# Homebrew
brew uninstall go

# 手动
sudo rm -rf /usr/local/go
```

### Windows

```powershell
# 卸载
winget uninstall Golang.Go

# 或通过设置 → 应用 → Go → 卸载
```

## 常见问题

### Q: go command not found

A: 检查 PATH 是否包含 `/usr/local/go/bin`，或重启终端

### Q: 编译太慢

A: 启用 Go Modules 代理：`export GOPROXY=https://goproxy.cn,direct`

### Q: 内存不足

A: 设置 GOMEMLIMIT：`go env -w GOMEMLIMIT=1GiB`

### Q: 多个 Go 版本

A: 使用 go.mod 指定版本需求，或使用 gvm（Go Version Manager）
