---
name: redis-install-skill
description: Redis 安装子技能。支持 apt/dnf/Docker 方式安装指定版本的 Redis，强制获取密码，幂等检测。当用户说「安装 Redis」「装 Redis」时触发。
---

# Redis Install Skill

## Overview

本技能负责在目标服务器上安装 Redis。支持多种安装方式，强制获取密码，幂等检测。

## When to Use

触发词：

- 安装 Redis
- 装 Redis
- install redis

## 交互流程

```
1. 检测当前系统（OS + 版本 + 包管理器）
2. 询问安装方式（包管理器 / Docker）
3. 询问版本（7 / 6）
4. [强制] 获取 Redis 密码 → 不输入则拒绝
5. 执行安装（幂等）
6. 配置密码
7. 输出修改密码和重启脚本
```

## 安装方式

### 包管理器安装

| OS | 安装命令 |
|----|----------|
| Ubuntu/Debian | apt install redis-server |
| CentOS/RHEL | dnf install redis |
| macOS | brew install redis |
| Windows | winget install Redis.Redis |

### Docker 安装

```bash
docker pull redis:7
```

## 版本选择

- Redis 7（推荐）
- Redis 6

## 密码安全

- **强制获取密码**：不输入密码则直接拒绝安装
- **不显示输入**：交互式输入时不显示密码
- **不记录密码**：不将密码写入脚本或日志

## 输出

```markdown
# Redis 安装完成

## 系统信息
- OS: Ubuntu 22.04 LTS
- 包管理器: apt

## 安装结果
- 版本: Redis 7.2.3
- 安装方式: apt
- 状态: ✅ 已安装

## 下一步
- [ ] 启动服务: sudo systemctl start redis-server
- [ ] 配置密码（已生成配置）

## 修改密码脚本
redis-cli CONFIG SET requirepass 新密码
redis-cli CONFIG REWRITE

## 忘记密码急救脚本
sudo systemctl stop redis
# 编辑 /etc/redis/redis.conf，注释掉 requirepass
sudo systemctl start redis
redis-cli CONFIG SET requirepass 新密码
redis-cli CONFIG REWRITE
```

## Resources

- [references/install-commands.md](references/install-commands.md) — 各 OS 安装命令
- [references/password-scripts.md](references/password-scripts.md) — 密码相关脚本
