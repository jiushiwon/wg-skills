# MongoDB Install Skill

## 简介

MongoDB 安装子技能，支持在 Ubuntu、CentOS、macOS、Windows 上安装指定版本的 MongoDB。

## 使用方式

### 触发方式

- "安装 MongoDB"
- "装 Mongo"
- "install mongodb"

### 交互流程

```
技能: 检测到 Ubuntu 22.04，apt 包管理器
请选择安装方式: A) apt 包管理器  B) Docker
请选择版本: A) MongoDB 7.0  B) MongoDB 6.0
⚠️ 请输入 MongoDB admin 用户密码: ********   ← 必须输入
正在安装 mongodb-org...
✅ 安装完成！

下一步（手动执行）:
- [ ] 启动服务
- [ ] 创建管理员用户
- [ ] 启用认证
```

## 安装方式

### 包管理器（推荐）

| 操作系统 | 命令 |
|----------|------|
| Ubuntu/Debian | 添加 MongoDB 仓库后 apt install mongodb-org |
| CentOS/RHEL | 添加 MongoDB 仓库后 dnf install mongodb-org |
| macOS | brew install mongodb-community |
| Windows | winget install MongoDB.Server |

### Docker

```bash
docker pull mongo:7.0
```

## 版本说明

| 版本 | 类型 | 建议 |
|------|------|------|
| MongoDB 7.0 | 推荐 | 新项目推荐 |
| MongoDB 6.0 | 稳定 | 稳定项目 |

## 密码安全

- **强制获取密码**：安装前必须输入密码，不输入则拒绝安装
- **不显示输入**：输入时不显示字符
- **不记录密码**：不写入脚本或日志

## 修改密码

```bash
# 修改 admin 用户密码
mongosh admin --eval "db.changeUserPassword('admin', '新密码');"
```

## 忘记密码急救

```bash
# 1. 停止 MongoDB
sudo systemctl stop mongod

# 2. 以跳过认证模式启动
sudo mongod --dbpath /var/lib/mongodb --port 27017 --bind_ip 127.0.0.1 --auth false &

# 3. 重置密码
mongosh admin --eval "db.updateUser('admin', {pwd: '新密码'});"

# 4. 重启
sudo systemctl restart mongod
```

## 验证连接

```bash
# 本地连接（无认证）
mongosh

# 测试
mongosh --eval "db.version()"
```

## 目录结构

```
mongodb-install-skill/
├── SKILL.md
├── README.md
└── references/
    ├── install-commands.md
    └── password-scripts.md
```

## 注意事项

- 安装是幂等的，已安装会提示版本
- MongoDB 默认不启用认证，需要手动启用
- 安装后不自动初始化，由用户手动确认
- 需要 sudo/管理员权限
