# MySQL Install Skill

## 简介

MySQL 安装子技能，支持在 Ubuntu、CentOS、macOS、Windows 上安装指定版本的 MySQL。

## 使用方式

### 触发方式

- "安装 MySQL"
- "装 MySQL"
- "install mysql"

### 交互流程

```
技能: 检测到 Ubuntu 22.04，apt 包管理器
请选择安装方式: A) apt 包管理器  B) Docker
请选择版本: A) MySQL 8.0  B) MySQL 5.7
⚠️ 请输入 MySQL root 密码: ********   ← 必须输入
正在安装 mysql-server...
✅ 安装完成！

下一步（手动执行）:
- [ ] 启动服务
- [ ] 运行安全配置
- [ ] 修改密码
```

## 安装方式

### 包管理器（推荐）

| 操作系统 | 命令 |
|----------|------|
| Ubuntu/Debian | apt install mysql-server |
| CentOS/RHEL | dnf install mysql-server |
| macOS | brew install mysql |
| Windows | winget install Oracle.MySQL |

### Docker

```bash
docker pull mysql:8.0
```

## 版本说明

| 版本 | 类型 | 建议 |
|------|------|------|
| MySQL 8.0 | 推荐 | 新项目推荐，性能更好 |
| MySQL 5.7 | 老 | 老项目兼容 |

## 密码安全

- **强制获取密码**：安装前必须输入密码，不输入则拒绝安装
- **不显示输入**：输入时不显示字符
- **不记录密码**：不写入脚本或日志

## 修改密码

```bash
# 方法 1
sudo mysql -u root -e "ALTER USER 'root'@'localhost' IDENTIFIED BY '你的密码';"

# 方法 2（交互式）
sudo mysql_secure_installation
```

## 忘记密码急救

```bash
# 1. 停止 MySQL
sudo systemctl stop mysql

# 2. 以跳过权限模式启动
sudo mysqld_safe --skip-grant-tables &

# 3. 连接并重置密码
mysql -u root
FLUSH PRIVILEGES;
ALTER USER 'root'@'localhost' IDENTIFIED BY '新密码';

# 4. 重启
sudo systemctl restart mysql
```

## 验证连接

```bash
# 本地连接
mysql -u root -p

# 测试
mysql -u root -e "SELECT VERSION();"
```

## 目录结构

```
mysql-install-skill/
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
