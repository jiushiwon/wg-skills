# 环境探测与安装

## Go 环境要求

- Go 版本 >= 1.20
- 推荐 Go 1.21+

## 探测步骤

### 1. 检测 Go 是否安装

```bash
go version
```

### 2. 检测 GOPATH

```bash
echo $GOPATH
```

### 3. 检测操作系统

```bash
uname -s  # Linux/macOS
echo %OS%  # Windows
```

## 自动安装

### Linux/macOS

```bash
# 安装 Go
wget https://go.dev/dl/go1.21.linux-amd64.tar.gz
sudo tar -C /usr/local -xzf go1.21.linux-amd64.tar.gz
export PATH=$PATH:/usr/local/go/bin

# 验证
go version
```

### Windows

下载安装包：https://go.dev/dl/go1.21.windows-amd64.msi

## 依赖安装

```bash
go mod init {{PROJECT_NAME}}
go mod tidy
go build -o bin/server ./cmd/server
```

## 热重载工具

```bash
go install github.com/air-verse/air@latest
```
