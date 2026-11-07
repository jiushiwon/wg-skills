---
name: go-install-skill
description: Go 安装子技能。支持 apt/dnf/Docker 方式安装指定版本的 Go，幂等检测，已安装则提示。当用户说「安装 Go」「装 Go」时触发。
---

# Go Install Skill

## Overview

本技能负责在目标服务器上安装 Go。支持多种安装方式，幂等检测。

## When to Use

触发词：

- 安装 Go
- 装 Go
- install go

## 交互流程

```
1. 检测当前系统（OS + 版本 + 包管理器）
2. 询问安装方式（包管理器 / Docker）
3. 询问版本（1.21 / 1.20 / 1.19）
4. 检测是否已安装
5. 执行安装（幂等）
6. 输出验证命令
```

## 安装方式

### 包管理器安装

| OS | 安装命令 |
|----|----------|
| Ubuntu/Debian | 下载官方二进制 |
| CentOS/RHEL | 下载官方二进制 |
| macOS | `brew install go` |
| Windows | `winget install Golang.Go` |

### Docker 安装

```bash
docker pull golang:1.21
```

## 版本选择

- Go 1.21（最新）
- Go 1.20（稳定）
- Go 1.19

## 输出

```markdown
# Go 安装完成

## 系统信息
- OS: Ubuntu 22.04 LTS
- 包管理器: apt

## 安装结果
- 版本: go1.21.5 linux/amd64
- 安装方式: 二进制
- GOROOT: /usr/local/go
- 状态: ✅ 已安装

## 验证命令
go version
go env GOROOT
```

## Resources

- [references/install-commands.md](references/install-commands.md) — 各 OS 安装命令
