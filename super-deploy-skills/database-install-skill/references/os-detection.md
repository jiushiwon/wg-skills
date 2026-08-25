# OS 检测逻辑

本文件定义数据库软件安装时的系统检测逻辑。

## Linux 检测

### 发行版检测

```bash
# 获取发行版信息
if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS_NAME="$NAME"
    OS_VERSION="$VERSION_ID"
    OS_ID="$ID"
elif [ -f /etc/lsb-release ]; then
    . /etc/lsb-release
    OS_NAME="$DISTRIB_DESCRIPTION"
    OS_VERSION="$DISTRIB_RELEASE"
    OS_ID="$DISTRIB_ID"
fi
```

### 常见发行版识别

| OS_ID | 发行版 | 包管理器 |
|-------|--------|----------|
| ubuntu | Ubuntu | apt |
| debian | Debian | apt |
| centos | CentOS | yum/dnf |
| rhel | RHEL | yum/dnf |
| fedora | Fedora | dnf |
| alpine | Alpine | apk |
| darwin | macOS | brew |

### 包管理器检测

```bash
# 检测可用的包管理器（按优先级）
if command -v apt &> /dev/null; then
    PACKAGE_MANAGER="apt"
elif command -v dnf &> /dev/null; then
    PACKAGE_MANAGER="dnf"
elif command -v yum &> /dev/null; then
    PACKAGE_MANAGER="yum"
elif command -v apk &> /dev/null; then
    PACKAGE_MANAGER="apk"
elif command -v brew &> /dev/null; then
    PACKAGE_MANAGER="brew"
fi
```

### 架构检测

```bash
ARCH=$(uname -m)
# x86_64, aarch64, armv7l, i386, i686
```

## Windows 检测

### PowerShell 命令

```powershell
# 基本信息
$OS = Get-CimInstance Win32_OperatingSystem
$OSName = $OS.Caption
$OSVersion = $OS.Version

# 架构
$Arch = $env:PROCESSOR_ARCHITECTURE

# 包管理器
if (Get-Command winget -ErrorAction SilentlyContinue) {
    $PackageManager = "winget"
} elseif (Get-Command choco -ErrorAction SilentlyContinue) {
    $PackageManager = "choco"
}
```

### Windows 版本映射

| OS 版本 | 名称 |
|---------|------|
| 10.0.xxxxxx | Windows 10 |
| 10.0.14393 | Windows Server 2016 |
| 10.0.17763 | Windows Server 2019 |
| 10.0.20348 | Windows Server 2022 |
| 6.3.xxxxxx | Windows 8.1 |
| 6.2.xxxxxx | Windows 8 |

## 输出格式

检测结果统一输出为 markdown 格式：

```markdown
## 系统信息
- 系统: Ubuntu 22.04 LTS
- 内核: 5.15.0-91-generic
- 架构: x86_64
- 包管理器: apt
```

```markdown
## 系统信息
- 系统: Windows Server 2022
- 架构: AMD64
- 包管理器: winget
```

## 检测脚本模板

```bash
#!/bin/bash
# detect-os.sh - 系统检测脚本

detect_os() {
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        echo "OS_NAME=$NAME"
        echo "OS_VERSION=$VERSION_ID"
        echo "OS_ID=$ID"
    fi

    echo "ARCH=$(uname -m)"

    # 检测包管理器
    for pm in apt dnf yum apk brew winget choco; do
        if command -v $pm &> /dev/null; then
            echo "PACKAGE_MANAGER=$pm"
            break
        fi
    done
}
```

## 常见问题

- **WSL 检测**：WSL 下 `uname -r` 会包含 `microsoft` 字符串
- **sudo 权限**：检测当前用户是否有 sudo 权限
- **容器检测**：检测是否在容器中（`/.dockerenv` 文件存在）
