# PostgreSQL Install Skill

## 简介

PostgreSQL 安装子技能，支持在 Ubuntu、CentOS、macOS、Windows 上安装指定版本的 PostgreSQL。

## 使用方式

### 触发方式

- "安装 PostgreSQL"
- "装 PG"
- "install postgresql"

### 交互流程

```
技能: 检测到 Ubuntu 22.04，apt 包管理器
请选择安装方式: A) apt 包管理器  B) Docker
请选择版本: A) PostgreSQL 16  B) PostgreSQL 15  C) PostgreSQL 14
⚠️ 请输入 PostgreSQL postgres 用户密码: ********   ← 必须输入
正在安装 postgresql-16...
✅ 安装完成！

下一步（手动执行）:
- [ ] 启动服务
- [ ] 修改密码
- [ ] 创建业务数据库
```

## 安装方式

### 包管理器（推荐）

| 操作系统 | 命令 |
|----------|------|
| Ubuntu/Debian | 添加 PGDG 仓库后 apt install postgresql-16 |
| CentOS/RHEL | dnf install postgresql16-server |
| macOS | brew install postgresql@16 |
| Windows | winget install PostgreSQL.PostgreSQL.16 |

### Docker

```bash
docker pull postgres:16
```

## 版本说明

| 版本 | 类型 | 建议 |
|------|------|------|
| PostgreSQL 16 | 最新 | 新项目推荐 |
| PostgreSQL 15 | 稳定 | 稳定项目 |
| PostgreSQL 14 | 老 | 老项目兼容 |

## 密码安全

- **强制获取密码**：安装前必须输入密码，不输入则拒绝安装
- **不显示输入**：输入时不显示字符
- **不记录密码**：不写入脚本或日志

## 修改密码

```bash
# 修改 postgres 用户密码
sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD '你的密码';"
```

## 忘记密码急救

```bash
# 1. 停止 PostgreSQL
sudo pg_ctlcluster 16 main stop

# 2. 以信任认证模式启动
sudo pg_ctlcluster 16 main start -o "-c auth=trust"

# 3. 修改密码
sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD '新密码';"

# 4. 恢复正常模式
sudo pg_ctlcluster 16 main stop
sudo pg_ctlcluster 16 main start
```

## 验证连接

```bash
# 本地连接
psql -U postgres

# 测试密码
psql -U postgres -W
```

## 目录结构

```
postgres-install-skill/
├── SKILL.md
├── README.md
└── references/
    ├── install-commands.md
    └── password-scripts.md
```

## 注意事项

- 安装是幂等的，已安装会提示版本
- 安装后不自动初始化，由用户手动确认
- 需要 sudo/管理员权限
- Windows 建议使用 Docker 或 winget
