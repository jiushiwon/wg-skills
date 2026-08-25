# Redis Install Skill

## 简介

Redis 安装子技能，支持在 Ubuntu、CentOS、macOS、Windows 上安装指定版本的 Redis。

## 使用方式

### 触发方式

- "安装 Redis"
- "装 Redis"
- "install redis"

### 交互流程

```
技能: 检测到 Ubuntu 22.04，apt 包管理器
请选择安装方式: A) apt 包管理器  B) Docker
请选择版本: A) Redis 7  B) Redis 6
⚠️ 请输入 Redis 密码: ********   ← 必须输入
正在安装 redis-server...
✅ 安装完成！

下一步:
- [ ] 启动服务
- [ ] 配置密码
```

## 安装方式

### 包管理器（推荐）

| 操作系统 | 命令 |
|----------|------|
| Ubuntu/Debian | apt install redis-server |
| CentOS/RHEL | dnf install redis |
| macOS | brew install redis |
| Windows | winget install Redis.Redis |

### Docker

```bash
docker pull redis:7
```

## 版本说明

| 版本 | 类型 | 建议 |
|------|------|------|
| Redis 7 | 推荐 | 新项目推荐，功能更多 |
| Redis 6 | 稳定 | 稳定项目 |

## 密码安全

- **强制获取密码**：安装前必须输入密码，不输入则拒绝安装
- **不显示输入**：输入时不显示字符
- **不记录密码**：不写入脚本或日志

## 修改密码

```bash
# 临时修改（重启后失效）
redis-cli CONFIG SET requirepass 新密码

# 持久修改
# 1. 编辑 /etc/redis/redis.conf
# 2. 设置 requirepass 你的密码
# 3. 重启服务
redis-cli CONFIG REWRITE
```

## 忘记密码急救

```bash
# 1. 停止 Redis
sudo systemctl stop redis

# 2. 临时移除密码限制
# 编辑 /etc/redis/redis.conf，注释掉 requirepass

# 3. 启动并设置新密码
sudo systemctl start redis
redis-cli CONFIG SET requirepass 新密码
redis-cli CONFIG REWRITE
```

## 验证连接

```bash
# 测试连接
redis-cli ping

# 带密码测试
redis-cli -a 你的密码 ping
```

## 目录结构

```
redis-install-skill/
├── SKILL.md
├── README.md
└── references/
    ├── install-commands.md
    └── password-scripts.md
```

## 注意事项

- 安装是幂等的，已安装会提示版本
- Redis 安装后必须设置密码
- 需要 sudo/管理员权限
- Windows 建议使用 Docker 或 winget
