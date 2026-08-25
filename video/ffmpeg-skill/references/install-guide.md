# FFmpeg 安装指南

> 脚本安装失败时的手动备选方案。优先使用 `scripts/` 下的安装脚本。

## 检测是否已安装

```bash
# Windows PowerShell
ffmpeg -version

# Mac / Linux
which ffmpeg && ffmpeg -version
```

无输出或报错则未安装。

## Windows 手动安装

1. 访问 [gyan.dev FFmpeg builds](https://www.gyan.dev/ffmpeg/builds/)
2. 下载 `ffmpeg-release-essentials.zip`
3. 解压到 `C:\ffmpeg` 或 `%LOCALAPPDATA%\ffmpeg`
4. 将 `bin` 目录路径添加到系统环境变量 `PATH`：
   - 搜索"环境变量" → "编辑系统环境变量" → "环境变量"
   - 在"系统变量"中找到 `Path` → "编辑" → "新建" → 填入 `C:\ffmpeg\bin`
5. 重新打开终端，执行 `ffmpeg -version` 验证

## macOS 手动安装

```bash
# 方式1: Homebrew（推荐）
brew install ffmpeg

# 方式2: 手动下载
# 访问 https://evermeet.cx/ffmpeg/ 下载静态构建
# 放入 /usr/local/bin/
```

## Linux 手动安装

| 发行版 | 命令 |
|--------|------|
| Ubuntu/Debian | `sudo apt update && sudo apt install ffmpeg` |
| Fedora | `sudo dnf install ffmpeg-free` |
| CentOS/RHEL | `sudo yum install epel-release && sudo yum install ffmpeg` |
| Arch | `sudo pacman -S ffmpeg` |
| openSUSE | `sudo zypper install ffmpeg` |
| Alpine | `sudo apk add ffmpeg` |

## 安装后验证

```bash
ffmpeg -version
```

应输出类似内容：

```
ffmpeg version 7.1-essentials_build-www.gyan.dev Copyright (c) 2000-2024 ...
```
