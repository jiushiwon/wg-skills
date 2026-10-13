# go-gin-init-skill Demo

最小可运行示例，演示 **Gin + GORM + JWT** 三件套的标准结构。

## 目录结构

```
demo/
├── cmd/server/main.go        # 入口：装配 DB / Handler / Middleware / Route
├── internal/
│   ├── model/user.go         # 实体（含 gorm tag）
│   ├── repository/user.go    # 数据访问
│   ├── service/user.go       # 业务逻辑
│   └── handler/
│       ├── auth.go           # /api/auth/login
│       └── user.go           # /api/users CRUD
├── pkg/
│   ├── config/               # 环境变量加载
│   ├── middleware/           # CORS / Logger / JWT
│   └── utils/                # 统一响应
├── scripts/
│   ├── start.sh              # Linux/Mac 启动
│   └── start.bat             # Windows 启动
├── configs/                  # 配置示例
└── go.mod
```

## 快速开始

### 1. 启动

```bash
# Windows
scripts\start.bat

# Linux/Mac
./scripts/start.sh
```

服务监听 `http://localhost:8080`

### 2. 登录获取 token

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

返回：
```json
{"code":0,"message":"ok","data":{"token":"eyJhbGc...","username":"admin"}}
```

### 3. 访问受保护接口

```bash
# 创建用户
curl -X POST http://localhost:8080/api/users \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"username":"zhangsan","nickname":"张三","email":"z@w.com"}'

# 列表
curl http://localhost:8080/api/users?page=1&size=10 \
  -H "Authorization: Bearer <token>"

# 详情
curl http://localhost:8080/api/users/1 \
  -H "Authorization: Bearer <token>"

# 更新
curl -X PUT http://localhost:8080/api/users/1 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"nickname":"新名字"}'

# 删除
curl -X DELETE http://localhost:8080/api/users/1 \
  -H "Authorization: Bearer <token>"
```

## 默认账号

| 用户名 | 密码 |
|--------|------|
| admin  | admin123 |

> Demo 阶段账号硬编码在 `handler/auth.go`，真实业务请查库。

## 公共路由

| 方法 | 路径 | 说明 |
|------|------|------|
| GET   | /health            | 健康检查 |
| POST  | /api/auth/login    | 登录 |

## 受保护路由（需 JWT）

| 方法 | 路径 | 说明 |
|------|------|------|
| POST   | /api/users         | 新增 |
| GET    | /api/users         | 分页列表 |
| GET    | /api/users/:id     | 详情 |
| PUT    | /api/users/:id     | 更新 |
| DELETE | /api/users/:id     | 删除 |

## 配置项

通过环境变量覆盖：

| 变量 | 默认值 | 说明 |
|------|--------|------|
| PORT       | 8080              | 监听端口 |
| JWT_SECRET | wg-skills-secret  | 签名密钥 |
| DB_PATH    | data.db           | SQLite 文件路径 |

## 切换数据库

默认使用 SQLite（零环境）。生产推荐 MySQL / PostgreSQL：

```go
// main.go
import "gorm.io/driver/mysql"

db, err = gorm.Open(mysql.Open("user:pass@tcp(127.0.0.1:3306)/db?charset=utf8mb4&parseTime=True&loc=Local"), &gorm.Config{})
```

## 技术栈

- **Gin** v1.9.x - HTTP 框架
- **GORM** v1.25.x - ORM
- **SQLite** (glebarez 驱动) - 零依赖数据库
- **JWT** v5 - 鉴权
