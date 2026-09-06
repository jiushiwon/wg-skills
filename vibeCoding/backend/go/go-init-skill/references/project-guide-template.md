# {{PROJECT_NAME}} 项目指南

## 技术栈

| 类别 | 技术 |
|------|------|
| 编程语言 | Go 1.21+ |
| Web 框架 | Gin |
| ORM | GORM |
| 数据库 | MySQL 8.0 / PostgreSQL 15 |
| 认证 | JWT |
| API 文档 | swaggo/gin-swagger |
| 热重载 | air |

## 项目结构

```
{{PROJECT_NAME}}/
├── cmd/
│   └── server/
│       └── main.go              # 程序入口
├── internal/
│   ├── config/                  # 配置管理
│   ├── database/               # 数据库连接
│   ├── response/               # 统一响应
│   ├── exceptions/             # 异常处理
│   ├── middleware/             # 中间件
│   ├── models/                 # 数据模型
│   ├── handlers/               # 控制器
│   ├── services/               # 业务逻辑
│   └── utils/                  # 工具函数
├── docs/                       # 项目文档
├── logs/                       # 日志目录
├── uploads/                    # 上传文件目录
├── .env                        # 环境变量
├── .env.example                # 环境变量模板
├── .gitignore                  # Git 忽略规则
├── go.mod                      # Go 模块
├── go.sum                      # 依赖校验
├── Dockerfile                  # Docker 构建
├── docker-compose.yml          # Docker Compose
└── README.md                  # 项目说明
```

## 快速开始

### 环境要求

- Go 1.20+
- MySQL 8.0+ 或 PostgreSQL 15+

### 本地开发

```bash
# 1. 复制环境变量配置
cp .env.example .env

# 2. 修改 .env 配置（数据库连接等）

# 3. 启动数据库（可选，使用 Docker）
docker-compose up -d db

# 4. 安装依赖
go mod tidy

# 5. 启动开发服务器（热重载）
./restart.sh dev

# 或者普通模式
go run ./cmd/server
```

### 生产部署

```bash
# 1. 构建
./restart.sh prod

# 2. 或使用 Docker
docker-compose up -d
```

## 启动方式

| 命令 | 模式 | 说明 |
|------|------|------|
| `./restart.sh` | dev | 默认开发模式 |
| `./restart.sh dev` | dev | 开发模式，热重载 |
| `./restart.sh prod` | prod | 生产模式 |

## 接口文档

启动服务后访问：

- Swagger UI: http://localhost:8080/swagger/index.html
- API Docs: http://localhost:8080/docs

## API 接口

### 健康检查

| 接口 | 方法 | 说明 |
|------|------|------|
| /api/health | GET | 服务健康检查 |
| /api/health/db | GET | 数据库连通检查 |

### 认证接口

| 接口 | 方法 | 说明 |
|------|------|------|
| /api/auth/register | POST | 用户注册 |
| /api/auth/login | POST | 用户登录 |
| /api/auth/refresh | POST | 刷新 Token |
| /api/auth/me | GET | 当前用户信息 |
| /api/auth/logout | POST | 登出 |

### 用户接口

| 接口 | 方法 | 说明 |
|------|------|------|
| /api/users | GET | 用户列表 |
| /api/users/:id | GET | 用户详情 |
| /api/users/:id | PUT | 更新用户 |
| /api/users/:id | DELETE | 删除用户 |

### 其他接口

| 接口 | 方法 | 说明 |
|------|------|------|
| /api/sse/chat | GET | SSE 聊天 |
| /api/upload | POST | 单文件上传 |
| /api/uploads | POST | 多文件上传 |

## 配置说明

### 环境变量

| 变量 | 默认值 | 说明 |
|------|--------|------|
| APP_MODE | dev | 运行模式 |
| APP_PORT | 8080 | 服务端口 |
| DB_DRIVER | mysql | 数据库驱动 |
| DB_HOST | localhost | 数据库地址 |
| DB_PORT | 3306 | 数据库端口 |
| DB_USER | root | 数据库用户名 |
| DB_PASSWORD | - | 数据库密码 |
| DB_NAME | wg_db | 数据库名称 |
| JWT_SECRET | - | JWT 密钥 |
| JWT_EXPIRE | 24 | access_token 过期时间（小时） |
| JWT_REFRESH_EXPIRE | 7 | refresh_token 过期时间（天） |
| CORS_ORIGINS | * | 允许的跨域来源 |

## 常见问题

### Q: 启动报错 "database connection failed"

A: 检查 `.env` 中的数据库配置，确保数据库服务已启动。

### Q: 上传文件失败

A: 确保 `uploads` 目录存在且有写权限。

### Q: JWT Token 过期

A: 使用 `/api/auth/refresh` 接口刷新 Token。

## 拓展指南

### 添加新功能

1. 在 `internal/models/` 添加模型
2. 在 `internal/handlers/` 添加处理器
3. 在 `internal/services/` 添加业务逻辑
4. 在路由中注册

### 添加数据库表

```go
// internal/models/xxx.go
type XXX struct {
    ID        uint      `gorm:"primarykey"`
    CreatedAt time.Time `json:"created_at"`
    UpdatedAt time.Time `json:"updated_at"`

    Name string `gorm:"size:100"`
}

func (XXX) TableName() string {
    return "wg_xxx"
}
```

### 添加中间件

在 `internal/middleware/middleware.go` 中注册。

## 相关文档

- [接口契约](../api-contract.md)
- [数据库设计](references/db-schema-guide.md)
- [SSE 指南](references/sse-guide.md)
- [中间件说明](references/middleware-guide.md)
