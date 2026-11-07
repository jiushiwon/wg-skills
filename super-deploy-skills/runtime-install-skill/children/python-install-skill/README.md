# Python Install Skill

## 简介

Python 安装子技能，支持在 Ubuntu、CentOS、macOS、Windows 上安装指定版本的 Python3。

## 使用方式

### 触发方式

- "安装 Python"
- "装 Python"
- "install python"

### 交互流程

```
技能: 检测到 Ubuntu 22.04，apt 包管理器
请选择安装方式: A) apt 包管理器  B) Docker
请选择版本: A) Python 3.12  B) Python 3.11  C) Python 3.10
正在安装 python3.12...
✅ 安装完成！
验证命令: python3 --version
```

## 安装方式

### 包管理器（推荐）

| 操作系统 | 命令 |
|----------|------|
| Ubuntu/Debian | `sudo apt install python3.12` (需先添加 deadsnakes PPA) |
| CentOS/RHEL | `sudo dnf install python3.12` |
| macOS | `brew install python3.12` |
| Windows | `winget install Python.3.12` |

### Docker

```bash
docker pull python:3.12
```

## 版本说明

| 版本 | 类型 | 建议 |
|------|------|------|
| Python 3.12 | 最新 | 新项目推荐 |
| Python 3.11 | 稳定 | 稳定项目 |
| Python 3.10 | 老 | 老项目兼容 |

## 验证

```bash
python3 --version
pip3 --version
python3 -m venv --help
```

## 目录结构

```
python-install-skill/
├── SKILL.md
├── README.md
└── references/
    └── install-commands.md
```

## 注意事项

- 安装是幂等的，已安装会提示版本
- 需要 sudo/管理员权限
- Windows 建议使用 winget
- Ubuntu 需要先添加 deadsnakes PPA 安装新版 Python
