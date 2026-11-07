---
name: mongodb-install-skill
description: MongoDB 安装子技能。支持 apt/dnf/Docker 方式安装指定版本的 MongoDB，强制获取密码，幂等检测。当用户说「安装 MongoDB」「装 Mongo」时触发。
---

# MongoDB Install Skill

## Overview

本技能负责在目标服务器上安装 MongoDB。支持多种安装方式，强制获取密码，幂等检测。

## When to Use

触发词：

- 安装 MongoDB
- 装 Mongo
- install mongodb

## 交互流程

```
1. 检测当前系统（OS + 版本 + 包管理器）
2. 询问安装方式（包管理器 / Docker）
3. 询问版本（7.0 / 6.0）
4. [强制] 获取数据库 root 密码 → 不输入则拒绝
5. 执行安装（幂等）
6. 不执行初始化，输出初始化清单
7. 输出修改密码和重置密码脚本
```

## 安装方式

### 包管理器安装

| OS | 安装命令 |
|----|----------|
| Ubuntu/Debian | 添加 MongoDB apt 仓库 + apt install mongodb-org |
| CentOS/RHEL | 添加 MongoDB yum 仓库 + dnf install mongodb-org |
| macOS | brew install mongodb-community |
| Windows | winget install MongoDB.Server |

### Docker 安装

```bash
docker pull mongo:7.0
```

## 版本选择

- MongoDB 7.0（推荐）
- MongoDB 6.0

## 密码安全

- **强制获取密码**：不输入密码则直接拒绝安装
- **不显示输入**：交互式输入时不显示密码
- **不记录密码**：不将密码写入脚本或日志

## 输出

```markdown
# MongoDB 安装完成

## 系统信息
- OS: Ubuntu 22.04 LTS
- 包管理器: apt

## 安装结果
- 版本: MongoDB 7.0.5
- 安装方式: apt
- 状态: ✅ 已安装

## 下一步（手动执行）
- [ ] 启动服务: sudo systemctl start mongod
- [ ] 启用认证

## 初始化清单
- [ ] 1. 启动 MongoDB 服务
- [ ] 2. 创建管理员用户
- [ ] 3. 启用认证
- [ ] 4. 创建业务数据库和用户

## 修改密码脚本
mongosh admin --eval "db.changeUserPassword('admin', '新密码');"

## 忘记密码急救脚本
sudo systemctl stop mongod
sudo mongod --dbpath /var/lib/mongodb --port 27017 --bind_ip 127.0.0.1 --auth false &
mongosh admin --eval "db.updateUser('admin', {pwd: '新密码'});"
```

## Resources

- [references/install-commands.md](references/install-commands.md) — 各 OS 安装命令
- [references/password-scripts.md](references/password-scripts.md) — 密码相关脚本
