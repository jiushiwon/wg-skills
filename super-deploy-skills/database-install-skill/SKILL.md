---
name: database-install-skill
description: 数据库软件安装父技能。根据用户请求的数据库类型，分发到对应的子技能（PostgreSQL/MySQL/MongoDB/Redis）。当用户说「安装 PostgreSQL」「安装 MySQL」「安装 MongoDB」「安装 Redis」「安装数据库」时触发。
---

# Database Install Skill（数据库安装父技能）

## Overview

本技能是数据库软件安装的入口技能，负责接收用户请求并分发到对应的子技能。子技能位于本目录的 `children/` 目录下。

## 子技能清单

| 子技能 | 触发词 | 职责 |
|--------|--------|------|
| `postgres-install-skill` | "安装 PostgreSQL" / "装 PG" | PostgreSQL 安装 |
| `mysql-install-skill` | "安装 MySQL" / "装 MySQL" | MySQL 安装 |
| `mongodb-install-skill` | "安装 MongoDB" / "装 Mongo" | MongoDB 安装 |
| `redis-install-skill` | "安装 Redis" / "装 Redis" | Redis 安装 |

## When to Use

触发词：

- 安装 PostgreSQL
- 安装 MySQL
- 安装 MongoDB
- 安装 Redis
- 安装数据库
- database install

## 路由规则

```
用户说「安装 PostgreSQL」或「装 PG」
  → 分发到 postgres-install-skill

用户说「安装 MySQL」或「装 MySQL」
  → 分发到 mysql-install-skill

用户说「安装 MongoDB」或「装 Mongo」
  → 分发到 mongodb-install-skill

用户说「安装 Redis」或「装 Redis」
  → 分发到 redis-install-skill
```

## 通用交互流程

所有子技能遵循统一的交互流程：

```
1. 自动检测当前系统（OS + 版本 + 架构）
2. 询问安装方式（包管理器 / Docker）
3. 询问版本选择
4. [强制] 获取数据库 root 密码（不输入则拒绝继续）
5. 生成安装命令
6. 执行安装（幂等）
7. 不执行初始化，输出初始化清单供用户手动确认
8. 输出修改密码/重置密码脚本
```

## 密码安全规则

- **强制获取密码**：无密码直接拒绝安装
- **密码不显示**：交互式输入时不显示密码
- **密码不记录**：不将密码写入脚本或日志
- **输出修改密码脚本**：安装后必须输出修改密码和重置密码的参考脚本

## Resources

- [references/os-detection.md](references/os-detection.md) — OS 检测逻辑
- [references/database-common.md](references/database-common.md) — 数据库通用逻辑
- [children/](children/) — 各数据库子技能
