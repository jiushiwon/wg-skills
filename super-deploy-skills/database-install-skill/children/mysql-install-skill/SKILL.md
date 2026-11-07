---
name: mysql-install-skill
description: MySQL 安装子技能。支持 apt/dnf/Docker 方式安装指定版本的 MySQL，强制获取密码，幂等检测。当用户说「安装 MySQL」「装 MySQL」时触发。
---

# MySQL Install Skill

## Overview

本技能负责在目标服务器上安装 MySQL。支持多种安装方式，强制获取密码，幂等检测。

## When to Use

触发词：

- 安装 MySQL
- 装 MySQL
- install mysql

## 交互流程

```
1. 检测当前系统（OS + 版本 + 包管理器）
2. 询问安装方式（包管理器 / Docker）
3. 询问版本（8.0 / 5.7）
4. [强制] 获取数据库 root 密码 → 不输入则拒绝
5. 执行安装（幂等）
6. 不执行初始化，输出初始化清单
7. 输出修改密码和重置密码脚本
```

## 安装方式

### 包管理器安装

| OS | 安装命令 |
|----|----------|
| Ubuntu/Debian | apt install mysql-server |
| CentOS/RHEL | dnf install mysql-server |
| macOS | brew install mysql |
| Windows | winget install Oracle.MySQL |

### Docker 安装

```bash
docker pull mysql:8.0
```

## 版本选择

- MySQL 8.0（推荐）
- MySQL 5.7

## 密码安全

- **强制获取密码**：不输入密码则直接拒绝安装
- **不显示输入**：交互式输入时不显示密码
- **不记录密码**：不将密码写入脚本或日志

## 输出

```markdown
# MySQL 安装完成

## 系统信息
- OS: Ubuntu 22.04 LTS
- 包管理器: apt

## 安装结果
- 版本: MySQL 8.0.35
- 安装方式: apt
- 状态: ✅ 已安装

## 下一步（手动执行）
- [ ] 启动服务: sudo systemctl start mysql
- [ ] 运行安全配置: sudo mysql_secure_installation

## 初始化清单
- [ ] 1. 启动 MySQL 服务
- [ ] 2. 运行 mysql_secure_installation
- [ ] 3. 创建业务数据库
- [ ] 4. 创建业务用户并授权

## 修改密码脚本
sudo mysql -u root -e "ALTER USER 'root'@'localhost' IDENTIFIED BY '你的密码';"

## 忘记密码急救脚本
sudo systemctl stop mysql
sudo mysqld_safe --skip-grant-tables &
mysql -u root
FLUSH PRIVILEGES;
ALTER USER 'root'@'localhost' IDENTIFIED BY '新密码';
```

## Resources

- [references/install-commands.md](references/install-commands.md) — 各 OS 安装命令
- [references/password-scripts.md](references/password-scripts.md) — 密码相关脚本
