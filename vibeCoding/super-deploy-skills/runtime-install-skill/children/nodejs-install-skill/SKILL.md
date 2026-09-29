---
name: nodejs-install-skill
description: Node.js 安装子技能。支持 apt/dnf/Docker 方式安装指定版本的 Node.js，幂等检测，已安装则提示。当用户说「安装 Node.js」「装 Node」「装 Nodejs」时触发。
---

# Node.js Install Skill

## Overview

本技能负责在目标服务器上安装 Node.js。支持多种安装方式，幂等检测。

## When to Use

触发词：

- 安装 Node.js
- 装 Node
- 装 Nodejs
- install nodejs
- install node

## 交互流程

```
1. 检测当前系统（OS + 版本 + 包管理器）
2. 询问安装方式（包管理器 / Docker）
3. 询问版本（20 LTS / 18 / 16）
4. 检测是否已安装
5. 执行安装（幂等）
6. 输出验证命令
```

## 安装方式

### 包管理器安装

| OS | 安装命令 |
|----|----------|
| Ubuntu/Debian | Nodesource repo + `apt install nodejs` |
| CentOS/RHEL | Nodesource repo + `dnf install nodejs` |
| macOS | `brew install node@20` |
| Windows | `winget install NodeJS.20` |

### Docker 安装

```bash
docker pull node:20
```

## 版本选择

- Node.js 20 LTS（推荐）
- Node.js 18
- Node.js 16

## 输出

```markdown
# Node.js 安装完成

## 系统信息
- OS: Ubuntu 22.04 LTS
- 包管理器: apt

## 安装结果
- 版本: v20.10.0
- 安装方式: apt
- npm 版本: 10.2.3
- 状态: ✅ 已安装

## 验证命令
node -v
npm -v
```

## Resources

- [references/install-commands.md](references/install-commands.md) — 各 OS 安装命令
