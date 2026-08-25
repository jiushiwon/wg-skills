# Database Install Skill（数据库安装父技能）

## 简介

数据库软件安装父技能，负责分发安装请求到对应的子技能。支持 PostgreSQL、MySQL、MongoDB、Redis 的自动化安装。

## 使用方式

### 触发方式

直接告诉技能要安装什么数据库：

- "安装 PostgreSQL" / "装 PG"
- "安装 MySQL" / "装 MySQL"
- "安装 MongoDB" / "装 Mongo"
- "安装 Redis" / "装 Redis"

### 交互流程

1. **系统检测** — 自动检测当前系统（OS、版本、架构、包管理器）
2. **安装方式** — 询问选择包管理器安装还是 Docker 安装
3. **版本选择** — 显示可选版本，让用户选择
4. **强制密码** — **必须输入数据库 root 密码**，不输入则拒绝安装
5. **执行安装** — 幂等安装，已安装则跳过
6. **输出初始化清单** — 不自动初始化，提供清单让用户手动确认
7. **输出密码脚本** — 提供修改密码和重置密码脚本

## 子技能

| 子技能 | 说明 |
|--------|------|
| [postgres-install-skill](children/postgres-install-skill/) | PostgreSQL 安装 |
| [mysql-install-skill](children/mysql-install-skill/) | MySQL 安装 |
| [mongodb-install-skill](children/mongodb-install-skill/) | MongoDB 安装 |
| [redis-install-skill](children/redis-install-skill/) | Redis 安装 |

## 目录结构

```
database-install-skill/
├── SKILL.md                 # 本文件
├── README.md                # 使用说明
├── references/
│   ├── os-detection.md     # OS 检测逻辑
│   └── database-common.md  # 数据库通用逻辑
└── children/               # 子技能目录
    ├── postgres-install-skill/
    ├── mysql-install-skill/
    ├── mongodb-install-skill/
    └── redis-install-skill/
```

## 密码安全

- **强制获取密码**：安装前必须获取数据库 root 密码
- **不显示输入**：交互式输入密码时不显示
- **不记录密码**：不将密码写入脚本或日志文件
- **输出修改密码脚本**：安装完成后必须输出修改密码的参考脚本
- **输出重置密码脚本**：提供忘记密码时的急救脚本

## 示例

```
用户: 帮我装个 MySQL

技能:
  检测到: Ubuntu 22.04 LTS, apt 包管理器
  请选择安装方式: A) apt 包管理器  B) Docker
  请选择版本: A) MySQL 8.0  B) MySQL 5.7
  ⚠️ 请输入 MySQL root 密码: ********   ← 必须输入
  正在安装 mysql-server...
  ✅ 安装完成！

  下一步（手动执行）:
  - [ ] 启动服务
  - [ ] 修改 root 密码
  - [ ] 创建业务数据库

  修改密码脚本:
  ALTER USER 'root'@'localhost' IDENTIFIED BY '新密码';
```

## 注意事项

- 安装是幂等的，已安装会提示并询问是否升级
- Docker 方式需要目标服务器已安装 Docker
- 数据库初始化（建库、建用户）不自动执行，由用户手动确认
- Windows 环境使用 winget 包管理器
