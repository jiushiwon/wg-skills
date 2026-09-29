#!/usr/bin/env bash
# FFmpeg Mac / Linux 一键安装脚本
# Mac: brew  install; Linux: 检测包管理器后自动安装

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}=== FFmpeg 安装脚本 (Mac / Linux) ===${NC}"

if command -v ffmpeg &> /dev/null; then
    echo -e "${GREEN}[OK] FFmpeg 已安装${NC}"
    ffmpeg -version 2>&1 | head -1
    exit 0
fi

detect_linux_pkg() {
    if command -v apt &> /dev/null; then
        echo "apt"
    elif command -v dnf &> /dev/null; then
        echo "dnf"
    elif command -v yum &> /dev/null; then
        echo "yum"
    elif command -v pacman &> /dev/null; then
        echo "pacman"
    elif command -v zypper &> /dev/null; then
        echo "zypper"
    elif command -v apk &> /dev/null; then
        echo "apk"
    else
        echo "unknown"
    fi
}

OS="$(uname -s)"

if [ "$OS" = "Darwin" ]; then
    echo -e "${YELLOW}[1/2] 检测到 macOS，使用 Homebrew 安装...${NC}"
    if ! command -v brew &> /dev/null; then
        echo -e "${RED}[ERROR] 未检测到 Homebrew。请先安装:${NC}"
        echo -e "  /bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
        exit 1
    fi
    brew install ffmpeg
elif [ "$OS" = "Linux" ]; then
    PKG=$(detect_linux_pkg)
    echo -e "${YELLOW}[1/2] 检测到 Linux，包管理器: $PKG${NC}"
    case "$PKG" in
        apt)
            sudo apt update && sudo apt install -y ffmpeg
            ;;
        dnf)
            sudo dnf install -y ffmpeg-free
            ;;
        yum)
            sudo yum install -y epel-release
            sudo yum install -y ffmpeg
            ;;
        pacman)
            sudo pacman -S --noconfirm ffmpeg
            ;;
        zypper)
            sudo zypper install -y ffmpeg
            ;;
        apk)
            sudo apk add ffmpeg
            ;;
        *)
            echo -e "${RED}[ERROR] 无法识别的包管理器。请手动安装 FFmpeg:${NC}"
            echo -e "  https://ffmpeg.org/download.html"
            exit 1
            ;;
    esac
else
    echo -e "${RED}[ERROR] 不支持的操作系统: $OS${NC}"
    exit 1
fi

echo -e "${YELLOW}[2/2] 验证安装...${NC}"
if command -v ffmpeg &> /dev/null; then
    ffmpeg -version 2>&1 | head -1
    echo -e "${GREEN}FFmpeg 安装完成${NC}"
else
    echo -e "${RED}[ERROR] 安装失败${NC}"
    echo -e "请手动安装: https://ffmpeg.org/download.html"
    exit 1
fi
