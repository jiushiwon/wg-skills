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

> 首次启动自动播种到 `wg_user` 表，密码只存 **bcrypt 哈希**（不可逆），登录时查库比对。

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
| JWT_SECRET | **无默认值，缺失即拒绝启动** | HS256 签名密钥，至少 32 字节 |
| DB_PATH    | data.db           | SQLite 文件路径 |

> 启动前必须设置 `JWT_SECRET`（≥32 字节），否则进程直接退出：
>
> ```bash
> export JWT_SECRET=$(openssl rand -base64 48)
> go run cmd/server/main.go
> ```

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
- **JWT** v5 - 鉴权（固定 HS256，禁 alg 混淆）
- **bcrypt** (golang.org/x/crypto) - 密码哈希

## 已知遗留

Demo 只演示最小链路，以下按 `crypto-scenario-skill` 的清单仍未实现：

- **Refresh Token**：目前只有 access token（2 小时），未做双令牌与刷新令牌轮换。
- **登录限流 / 账号锁定**：未实现。
- **用户注册接口**：账号靠首次启动播种。
- **注销接口**：未做令牌黑名单，依赖 access token 短过期。

