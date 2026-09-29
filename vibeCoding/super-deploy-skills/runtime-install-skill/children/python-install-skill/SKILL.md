---
name: python-install-skill
description: Python 安装子技能。支持 apt/dnf/Docker 方式安装指定版本的 Python3，幂等检测，已安装则提示。当用户说「安装 Python」「装 Python」时触发。
---

# Python Install Skill

## Overview

本技能负责在目标服务器上安装 Python3。支持多种安装方式，幂等检测。

## When to Use

触发词：

- 安装 Python
- 装 Python
- install python

## 交互流程

```
1. 检测当前系统（OS + 版本 + 包管理器）
2. 询问安装方式（包管理器 / Docker）
3. 询问版本（3.12 / 3.11 / 3.10）
4. 检测是否已安装
5. 执行安装（幂等）
6. 输出验证命令
```

## 安装方式

### 包管理器安装

| OS | 安装命令 |
|----|----------|
| Ubuntu/Debian | `apt install python3.12` + deadsnakes PPA |
| CentOS/RHEL | `dnf install python3.12` |
| macOS | `brew install python3.12` |
| Windows | `winget install Python.3.12` |

### Docker 安装

```bash
docker pull python:3.12
```

## 版本选择

- Python 3.12（最新）
- Python 3.11（稳定）
- Python 3.10（老项目兼容）

## 输出

```markdown
# Python 安装完成

## 系统信息
- OS: Ubuntu 22.04 LTS
- 包管理器: apt

## 安装结果
- 版本: Python 3.12.0
- 安装方式: apt
- 状态: ✅ 已安装

## 验证命令
python3 --version
pip3 --version
```

## Resources

- [references/install-commands.md](references/install-commands.md) — 各 OS 安装命令
