---
name: postgres-install-skill
description: PostgreSQL 安装子技能。支持 apt/dnf/Docker 方式安装指定版本的 PostgreSQL，强制获取密码，幂等检测。当用户说「安装 PostgreSQL」「装 PG」时触发。
---

# PostgreSQL Install Skill

## Overview

本技能负责在目标服务器上安装 PostgreSQL。支持多种安装方式，强制获取密码，幂等检测。

## When to Use

触发词：

- 安装 PostgreSQL
- 装 PG
- install postgresql

## 交互流程

```
1. 检测当前系统（OS + 版本 + 包管理器）
2. 询问安装方式（包管理器 / Docker）
3. 询问版本（16 / 15 / 14）
4. [强制] 获取数据库 root 密码 → 不输入则拒绝
5. 执行安装（幂等）
6. 不执行初始化，输出初始化清单
7. 输出修改密码和重置密码脚本
```

## 安装方式

### 包管理器安装

| OS | 安装命令 |
|----|----------|
| Ubuntu/Debian | 添加 PGDG 仓库 + apt install postgresql-16 |
| CentOS/RHEL | dnf install postgresql16-server |
| macOS | brew install postgresql@16 |
| Windows | winget install PostgreSQL.PostgreSQL.16 |

### Docker 安装

```bash
docker pull postgres:16
```

## 版本选择

- PostgreSQL 16（最新）
- PostgreSQL 15
- PostgreSQL 14

## 密码安全

- **强制获取密码**：不输入密码则直接拒绝安装
- **不显示输入**：交互式输入时不显示密码
- **不记录密码**：不将密码写入脚本或日志

## 输出

```markdown
# PostgreSQL 安装完成

## 系统信息
- OS: Ubuntu 22.04 LTS
- 包管理器: apt

## 安装结果
- 版本: PostgreSQL 16
- 安装方式: apt
- 状态: ✅ 已安装

## 下一步（手动执行）
- [ ] 启动服务: sudo systemctl start postgresql
- [ ] 初始化数据库

## 初始化清单
- [ ] 1. 启动 PostgreSQL 服务
- [ ] 2. 修改 postgres 用户密码
- [ ] 3. 创建业务数据库
- [ ] 4. 创建业务用户并授权

## 修改密码脚本
sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD '你的密码';"

## 忘记密码急救脚本
sudo pg_ctlcluster 16 main stop
sudo pg_ctlcluster 16 main start -o "-c auth=trust"
sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD '新密码';"
sudo pg_ctlcluster 16 main restart
```

## Resources

- [references/install-commands.md](references/install-commands.md) — 各 OS 安装命令
- [references/password-scripts.md](references/password-scripts.md) — 密码相关脚本
