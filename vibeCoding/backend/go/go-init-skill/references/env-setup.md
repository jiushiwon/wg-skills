# Go 环境探测与自动安装

检测用户开发环境，提示安装或升级 Go 环境。

## 探测流程

### 第一步：检测 Go 是否安装

```bash
# 检测命令
go version
```

### 第二步：检测版本

- 最低要求：**Go 1.20**（支持 generics）
- 推荐版本：**Go 1.21+**（最新稳定版）

### 第三步：检测操作系统

| 操作系统 | 检测命令 | 注意事项 |
|----------|----------|----------|
| Linux | `uname -a` | 推荐使用包管理器安装 |
| macOS | `sw_vers` | 推荐使用 Homebrew |
| Windows | `systeminfo` | 推荐使用 scoop/chocolatey |

## 未安装时的安装指引

### Windows

**推荐方式：scoop 或 chocolatey**

```powershell
# 使用 scoop
scoop install go

# 使用 chocolatey
choco install golang
```

**备用方式：手动下载**

1. 访问 https://go.dev/dl/
2. 下载 Windows MSI 安装包
3. 双击安装，勾选"Add to PATH"
4. 打开新的 PowerShell 终端验证

### macOS

**推荐方式：Homebrew**

```bash
# 安装 Homebrew（如果没有）
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 安装 Go
brew install go
```

**备用方式：手动下载**

1. 访问 https://go.dev/dl/
2. 下载 macOS ARM64 或 x86_64 pkg 安装包
3. 双击安装

### Linux

**方式一：包管理器**

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install golang-go

# CentOS/RHEL
sudo yum install golang

# Fedora
sudo dnf install golang
```

**方式二：手动安装（推荐）**

```bash
# 下载最新稳定版
wget https://go.dev/dl/go1.21.6.linux-amd64.tar.gz

# 解压到 /usr/local
sudo tar -C /usr/local -xzf go1.21.6.linux-amd64.tar.gz

# 添加到 PATH
echo 'export PATH=$PATH:/usr/local/go/bin' >> ~/.bashrc
source ~/.bashrc
```

## 版本过低时的升级指引

### 方式一：重新安装

按上述安装步骤重新安装最新版本。

### 方式二：使用 go version manager (gvm)

```bash
# 安装 gvm
bash < <(curl -s -S -L https://raw.githubusercontent.com/moovweb/gvm/master/binscripts/gvm-installer)

# 安装最新稳定版
gvm install go1.21.6
gvm use go1.21.6 --default
```

## 验证安装

```bash
# 验证版本
go version

# 验证环境
go env GOPATH
go env GOROOT
```

## 常见问题

### Q: 安装后还是旧版本？

A: 可能是 PATH 顺序问题。检查 `echo $PATH`，确保 Go 安装路径在前面。

### Q: Windows 下提示"找不到命令"？

A: 需要重启终端或电脑，让环境变量生效。

### Q: 代理问题导致下载失败？

A: 设置 Go 代理：
```bash
go env -w GOPROXY=https://goproxy.cn,direct
```

## 自动检测脚本

```bash
#!/bin/bash

# 检测 Go 是否安装
if ! command -v go &> /dev/null; then
    echo "[ERROR] Go 未安装，正在引导安装..."
    # 显示安装指引
    exit 1
fi

# 检测版本
GO_VERSION=$(go version | grep -oP 'go\d+\.\d+(\.\d+)?' | grep -oP '\d+\.\d+(\.\d+)?')
MAJOR=$(echo $GO_VERSION | cut -d. -f1)
MINOR=$(echo $GO_VERSION | cut -d. -f2)

if [ "$MAJOR" -eq 1 ] && [ "$MINOR" -lt 20 ]; then
    echo "[ERROR] Go 版本过低: $GO_VERSION，需要 1.20+"
    echo "请升级 Go: https://go.dev/dl/"
    exit 1
fi

echo "[OK] Go 版本: $GO_VERSION"
```

## Docker 环境检测

如果用户有 Docker，也可以选择使用 Docker 运行：

```bash
# 检测 Docker
docker --version

# 使用官方 Go 镜像运行
docker run --rm -it golang:1.21 go version
```
