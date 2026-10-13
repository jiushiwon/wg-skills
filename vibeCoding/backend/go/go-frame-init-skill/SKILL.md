---
name: go-frame-init-skill
description: Go Web 框架初始化技能。面向零基础小白，提供多种 Go Web 框架（Gin/Hertz/Fiber/Chi）的项目初始化、骨架生成、一键启动脚本。触发词："Go 框架"、"Go Web 框架"、"Hertz"、"Fiber"、"初始化 Go 项目"、"Go 脚手架"。
---

# Go Frame Skill

面向**零基础小白**，快速初始化 Go Web 框架项目。

## 支持的框架

| 框架 | 特点 | 场景 |
|------|------|------|
| **Gin** | 最流行、性能好 | 默认推荐 |
| **Hertz** | 阿里开源、云原生 | 高性能 HTTP |
| **Fiber** | Express 风格、易上手 | 快速开发 |
| **Chi** | 轻量、Router 链路 | API Gateway |

## 触发场景

用户说"帮我搭 Go Web 框架"或"初始化 Go 项目"时触发。

## 核心能力

| 能力 | 说明 |
|------|------|
| **项目初始化** | 多种框架可选 |
| **目录结构** | 标准 Go 项目布局 |
| **中间件** | 日志/鉴权/CORS/安全头 |
| **配置管理** | godotenv 配置 |
| **数据库集成** | GORM（MySQL/PostgreSQL） |
| **一键启动** | 开发/生产脚本 |

## 不做

- 不重复 go-gin-init-skill（ Gin 已在 go-gin-init-skill 中）
- 本 skill 主要用于其他框架（Hertz/Fiber/Chi）的初始化

## 与 go-gin-init-skill 的关系

| 技能 | 关系 |
|------|------|
| `go-gin-init-skill` | Gin 专项（更深入） |
| `go-frame-init-skill` | 多框架（除 Gin 外） |

## 快速使用

### 选择框架初始化

```bash
# 1. 选择框架
echo "选择框架: 1) Gin 2) Hertz 3) Fiber 4) Chi"

# 2. 输入项目名
read -p "项目名: " project_name

# 3. 生成项目
go-frame-init new $project_name --framework=hertz
```

### 目录结构

```
my-project/
├── cmd/
│   └── server/
│       └── main.go        # 入口
├── internal/
│   ├── handler/           # HTTP 处理
│   ├── service/           # 业务逻辑
│   ├── repository/        # 数据访问
│   └── model/             # 实体
├── pkg/
│   ├── middleware/        # 中间件
│   ├── config/            # 配置
│   └── utils/             # 工具
├── configs/
│   └── config.yaml
├── scripts/
│   ├── dev.sh            # 开发启动
│   └── prod.sh           # 生产启动
├── go.mod
└── README.md
```

## 配置示例

```yaml
# configs/config.yaml
app:
  name: my-app
  port: 8080
  env: development

database:
  driver: mysql
  host: 127.0.0.1
  port: 3306
  dbname: mydb
  username: root
  password: root

log:
  level: info
  path: ./logs/app.log
```

## 中间件清单

| 中间件 | 作用 |
|--------|------|
| `Logger` | 请求日志 |
| `Recover` | panic 恢复 |
| `CORS` | 跨域 |
| `Auth` | JWT 鉴权 |
| `RateLimit` | 限流 |

## 推荐搭配

- `go-auth-module-skill` - 权限底座
- `go-ws-module-skill` - WebSocket 支持
- `database-design-skill` - 数据库设计

## 触发词

- Go 框架
- Go Web 框架
- Hertz
- Fiber
- Chi
- 初始化 Go 项目
- Go 脚手架
