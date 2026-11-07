# OS 与内核检测规则

本文件定义 `server-setup-skill` 如何识别目标服务器的操作系统、内核版本、CPU 架构与包管理器。

## Linux 发行版检测

优先读 `/etc/os-release`（标准），回退到发行版特有文件。

| OS | 主检测命令 | 回退文件 | 包管理器 |
|----|-----------|----------|----------|
| Ubuntu | `cat /etc/os-release` | `/etc/lsb-release` | apt |
| Debian | `cat /etc/os-release` | `/etc/debian_version` | apt |
| CentOS | `cat /etc/centos-release` | `/etc/redhat-release` | yum（7）/ dnf（8+） |
| RHEL | `cat /etc/redhat-release` | - | yum / dnf |
| Rocky / Alma | `cat /etc/os-release` | `/etc/redhat-release` | dnf |
| Alpine | `cat /etc/alpine-release` | `/etc/os-release` | apk |
| Amazon Linux | `cat /etc/os-release` | `/etc/system-release` | yum / dnf |
| openSUSE | `cat /etc/os-release` | `/etc/SuSE-release` | zypper |

解析 `/etc/os-release` 时取 `ID` 与 `VERSION_ID` 两个字段：

```bash
. /etc/os-release
echo "$ID $VERSION_ID"   # ubuntu 22.04
```

## macOS 检测

```bash
sw_vers -productName     # macOS
sw_vers -productVersion  # 14.x
```

包管理器：优先 `brew`（Homebrew）。如未安装，提示用户先装 Homebrew，不自动装。

## Windows Server 检测

PowerShell：

```powershell
$PSVersionTable.PSVersion              # PowerShell 版本
(Get-CimInstance Win32_OperatingSystem).Caption   # Windows Server 2019/2022
(Get-CimInstance Win32_OperatingSystem).Version   # 10.0.xxxxx
```

CMD 回退：

```cmd
systeminfo | findstr /B /C:"OS Name" /C:"OS Version"
```

包管理器：优先 `winget`（Windows 10 1809+ / Server 2019+ 内置），回退 `chocolatey`。

## 内核与架构

```bash
uname -s   # Linux / Darwin
uname -r   # 内核版本
uname -m   # x86_64 / aarch64 / arm64
```

Windows：

```powershell
[System.Environment]::OSVersion.Version
(Get-CimInstance Win32_Processor).Architecture   # 9 = x64, 12 = ARM64
```

## 内存与磁盘

Linux：

```bash
free -h                 # 内存
df -h /                 # 根分区磁盘
```

Windows：

```powershell
(Get-CimInstance Win32_ComputerSystem).TotalPhysicalMemory
(Get-CimInstance Win32_LogicalDisk -Filter "DeviceID='C:'").FreeSpace
```

## 当前目录与用户

```bash
pwd
whoami
id -u                   # 0 表示 root
sudo -n true 2>/dev/null && echo "has sudo" || echo "no sudo"
```

Windows：

```powershell
(Get-Location).Path
$env:USERNAME
([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
```

## 运行状态检测

用于判断「服务器当前在跑什么、哪些端口被占用、目标应用是否已在运行」。这是部署前避免端口冲突、误杀进程的关键。

### 监听端口

Linux：

```bash
ss -tlnp                 # TCP 监听端口 + 进程（推荐）
# 回退：netstat -tlnp
```

macOS：

```bash
lsof -nP -iTCP -sTCP:LISTEN
```

Windows：

```powershell
Get-NetTCPConnection -State Listen | Select-Object LocalAddress,LocalPort,OwningProcess
```

解析时提取「端口 → PID → 进程名」，与 `deploy-profile.md` 的目标端口对比，输出冲突清单。

### 运行中的服务（systemd）

```bash
systemctl list-units --type=service --state=running
systemctl is-active <service>     # active / inactive / failed
systemctl is-enabled <service>    # enabled / disabled
```

无 systemd（Alpine/OpenRC）：

```bash
rc-status
service <name> status
```

Windows 服务：

```powershell
Get-Service | Where-Object {$_.Status -eq 'Running'} | Select-Object Name,DisplayName,Status
```

### 按进程名/端口查目标应用

部署前确认「同一应用的老实例」是否还在跑：

```bash
# 按进程名
pgrep -af "node.*server.js"
pgrep -af "java.*app.jar"
pgrep -af "uvicorn"

# 按端口反查 PID
lsof -ti:8080
```

Windows：

```powershell
Get-Process node,java,python -ErrorAction SilentlyContinue | Select-Object Id,ProcessName,Path
(Get-NetTCPConnection -LocalPort 8080 -ErrorAction SilentlyContinue).OwningProcess
```

### 资源占用（运行态容量）

```bash
uptime                  # load average
top -bn1 | head -20     # 进程 CPU/内存快照（Linux）
vmstat 1 3              # CPU/内存/IO 趋势（采样 3 次）
```

Windows：

```powershell
Get-Counter '\Processor(_Total)\% Processor Time','\Memory\Available MBytes'
```

### 输出到报告

`server-env-report.md` 增加「运行状态」小节：

```markdown
## 运行状态
- 负载：0.42 0.38 0.35（1/5/15 min）
- 监听端口：:22 sshd, :80 nginx, :8080 node（目标端口 8080 已被占用 → 需停老进程）
- 目标应用：my-api 正在运行（PID 1234，pm2）
- 待处理冲突：无 / 端口 8080 冲突
```

## 包管理器决策表

| OS ID | 默认包管理器 | 备注 |
|-------|-------------|------|
| ubuntu / debian | apt | 先 `apt update` |
| centos / rhel / rocky / almalinux | dnf（≥8）/ yum（7） | 看 `VERSION_ID` 主版本 |
| alpine | apk | 先 `apk update` |
| amzn | dnf（2023）/ yum（2） | - |
| darwin (macOS) | brew | 不自动装 brew |
| windows | winget | 回退 chocolatey |

## 容错

- 检测命令失败时，记录「未知 OS」，提示用户手动指定。
- 无 sudo/root 权限时，标注「需要管理员权限」，生成命令但不执行。
