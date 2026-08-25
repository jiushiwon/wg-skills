# Go + Gin 骨架

生成 Gin 项目时按本骨架现场写代码。版本号一律不写，由 SKILL.md 的版本获取策略动态决定。

## 依赖（go.mod）

- `github.com/gin-gonic/gin`
- `gorm.io/gorm` + `gorm.io/driver/postgres` / `gorm.io/driver/mysql`
- `github.com/joho/godotenv`
- `github.com/caarlos0/env/v10`
- `github.com/go-playground/validator/v10`
- `github.com/golang-jwt/jwt/v5`
- `github.com/google/uuid`
- `golang.org/x/crypto/bcrypt`

## 目录结构

```
{{project}}/
├── cmd/server/main.go       # 入口
├── internal/
│   ├── config/config.go     # 环境变量映射
│   ├── database/database.go # GORM 连接 + AutoMigrate（开发）
│   ├── handlers/            # HTTP 处理器
│   ├── services/            # 业务逻辑
│   ├── repositories/        # 数据访问
│   ├── models/              # GORM 模型
│   ├── middlewares/         # 响应包装、日志、错误、JWT、CORS
│   ├── exceptions/          # AppError{Code,Message}
│   └── utils/               # 工具
├── migrations/              # golang-migrate（生产）
├── .env.example
├── .gitignore
├── docker-compose.yml       # PostgreSQL 默认
├── docker-compose.mysql.yml # MySQL 备选
├── Dockerfile
├── go.mod / go.sum
├── README.md
├── api-contract.md
└── versions.md
```

## 关键文件清单

| 文件 | 责任 |
|------|------|
| `cmd/server/main.go` | 入口，装配依赖，启动 Gin |
| `internal/config/config.go` | `caarlos0/env` 映射，`envDefault` |
| `internal/database/database.go` | GORM 连接，postgres/mysql 二选一 |
| `internal/exceptions/business.go` | `AppError{Code int; Message string}` + 工厂函数 |
| `internal/middlewares/response.go` | `OK()/Fail()`（唯一包装点）+ `ErrorHandler`/`Recovery` + `RequestLog` + `CORS` |
| `internal/middlewares/auth.go` | JWT 中间件 |
| `internal/utils/auth.go` | bcrypt / JWT 工具 |
| `internal/models/user.go` | User GORM 模型 |
| `internal/handlers/bind.go` | `BindJSON` 唯一绑定入口，校验失败统一转 `-1001` |
| `internal/handlers/health.go` / `user.go` / `auth.go` | HTTP 处理器 |

## config.go 模板

```go
type Config struct {
  AppPort      string `env:"APP_PORT" envDefault:"8080"`
  DBType       string `env:"DB_TYPE" envDefault:"postgres"`
  DBHost       string `env:"DB_HOST" envDefault:"localhost"`
  DBPort       string `env:"DB_PORT" envDefault:"5432"`
  DBName       string `env:"DB_NAME" envDefault:"app_db"`
  DBUser       string `env:"DB_USER" envDefault:"postgres"`
  DBPass       string `env:"DB_PASSWORD" envDefault:"postgres"`
  DBPrefix     string `env:"DB_PREFIX" envDefault:"wg"`
  CORSOrigins  string `env:"CORS_ORIGINS" envDefault:"*"`
  JWTSecret    string `env:"JWT_SECRET,required"`
  JWTExpiresIn int    `env:"JWT_EXPIRES_IN" envDefault:"86400"` // 秒
}
```

> 变量名与 backend-convention-skill `env-config-guide.md` 一致；CORS 中间件若改为读 `cfg.CORSOrigins`（而非直接 `os.Getenv`），把 cfg 传入中间件工厂即可。

## 开箱即用片段

### JWT 工具

```go
type JWTUtil struct {
  secret     []byte
  expiration time.Duration
}

func NewJWTUtil(secret string, expiration time.Duration) *JWTUtil {
  return &JWTUtil{secret: []byte(secret), expiration: expiration}
}

func (j *JWTUtil) Generate(userID uint, username string) (string, error) {
  claims := jwt.MapClaims{
    "user_id":  userID,
    "username": username,
    "exp":      time.Now().Add(j.expiration).Unix(),
    "iat":      time.Now().Unix(),
  }
  return jwt.NewWithClaims(jwt.SigningMethodHS256, claims).SignedString(j.secret)
}

func (j *JWTUtil) Parse(tokenStr string) (jwt.MapClaims, error) {
  token, err := jwt.Parse(tokenStr, func(t *jwt.Token) (interface{}, error) {
    // 必须校验签名算法，否则攻击者可把 alg 改成 none 或用 RS256 公钥当 HMAC 密钥伪造 token
    if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
      return nil, errors.New("unexpected signing method")
    }
    return j.secret, nil
  })
  if err != nil || !token.Valid {
    return nil, errors.New("invalid token")
  }
  return token.Claims.(jwt.MapClaims), nil
}
```

### JWT 中间件

```go
func Auth(jwtUtil *utils.JWTUtil) gin.HandlerFunc {
  return func(c *gin.Context) {
    header := c.GetHeader("Authorization")
    if header == "" || !strings.HasPrefix(header, "Bearer ") {
      Fail(c, -1002, "未登录")
      c.Abort()
      return
    }
    claims, err := jwtUtil.Parse(strings.TrimPrefix(header, "Bearer "))
    if err != nil {
      Fail(c, -1002, "Token 无效或已过期")
      c.Abort()
      return
    }
    uid, ok := claims["user_id"].(float64) // JSON 数字解出来是 float64；断言失败说明 token 非本服务签发
    if !ok {
      Fail(c, -1002, "Token 无效")
      c.Abort()
      return
    }
    c.Set("currentUserId", uint(uid))
    c.Next()
  }
}
```

### 请求日志中间件

```go
func RequestLog() gin.HandlerFunc {
  return func(c *gin.Context) {
    start := time.Now()
    requestID := uuid.NewString()[:16]
    c.Set("requestId", requestID)
    c.Next()
    log.Printf("[%s] %s %s %d %dms",
      requestID, c.Request.Method, c.Request.URL.Path,
      c.Writer.Status(), time.Since(start).Milliseconds())
  }
}
```

### CORS 中间件

策略见 backend-convention-skill `env-config-guide.md`（读 `CORS_ORIGINS`，禁 `*`+凭证同开）。需 import `os`、`strings`。

```go
func CORS() gin.HandlerFunc {
  raw := os.Getenv("CORS_ORIGINS")
  allowAll := raw == "" || raw == "*"
  var allowed []string
  if !allowAll {
    for _, o := range strings.Split(raw, ",") {
      allowed = append(allowed, strings.TrimSpace(o))
    }
  }
  return func(c *gin.Context) {
    if allowAll {
      c.Header("Access-Control-Allow-Origin", "*") // 红线：* 时不开 credentials
    } else {
      origin := c.Request.Header.Get("Origin")
      for _, o := range allowed {
        if o == origin {
          c.Header("Access-Control-Allow-Origin", origin)
          c.Header("Access-Control-Allow-Credentials", "true")
          break
        }
      }
    }
    c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
    c.Header("Access-Control-Allow-Headers", "Authorization, Content-Type, X-Request-Id")
    c.Header("Access-Control-Expose-Headers", "X-Request-Id")
    if c.Request.Method == "OPTIONS" {
      c.AbortWithStatus(204)
      return
    }
    c.Next()
  }
}
```

### 参数校验转 -1001

Gin 的 `ShouldBindJSON` 校验失败默认只返回 `error`，必须由 handler 统一映射成 `-1001`。在 `internal/handlers` 提供唯一绑定入口，handler 一律经此绑定：

```go
// BindJSON 绑定并校验请求体；失败统一 Fail(-1001) 并返回 false，handler 直接 return
func BindJSON(c *gin.Context, obj interface{}) bool {
  if err := c.ShouldBindJSON(obj); err != nil {
    var ve validator.ValidationErrors
    if errors.As(err, &ve) && len(ve) > 0 {
      f := ve[0]
      Fail(c, -1001, fmt.Sprintf("参数校验失败: %s 不符合规则 %s", f.Field(), f.Tag()))
    } else {
      Fail(c, -1001, "请求体格式错误（需合法 JSON）")
    }
    return false
  }
  return true
}

// 用法
func (h *UserHandler) Create(c *gin.Context) {
  var req CreateUserRequest
  if !BindJSON(c, &req) {
    return
  }
  // ...
}
```

### 分页列表

```go
type PageResult struct {
  Page     int         `json:"page"`
  PageSize int         `json:"pageSize"`
  Total    int64       `json:"total"`
  List     interface{} `json:"list"`
}

func (h *UserHandler) List(c *gin.Context) {
  page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
  pageSize, _ := strconv.Atoi(c.DefaultQuery("pageSize", "20"))
  if page < 1 {
    page = 1 // 下限保护：page=0/负数会导致 OFFSET 计算异常
  }
  if pageSize > 100 {
    pageSize = 100
  }
  users, total, err := h.svc.List(page, pageSize)
  if err != nil {
    Fail(c, -1, err.Error())
    return
  }
  OK(c, PageResult{Page: page, PageSize: pageSize, Total: total, List: users})
}
```

## 关键约定

- 模块路径：`github.com/{{org}}/{{project}}`，用户输入 org（默认 `wg`）。
- 表名：`{DB_PREFIX}_user`，snake_case。
- 路由前缀：`/api`；健康检查 `GET /api/health` 返回信封。
- 校验：`go-playground/validator`，失败转 `-1001`。
- 不引 MongoDB（关系型默认 PostgreSQL / MySQL）。

## project-guide 填充段

生成 `docs/project-guide.md` 时，按 backend-convention-skill `references/project-guide-template.md` 的占位符填入以下本栈内容：

| 占位符 | 本栈填充值 |
|--------|-----------|
| `{{STACK}}` | Go + Gin + GORM |
| `{{START_COMMAND}}` | `go run cmd/server/main.go` |
| `{{DIRECTORY_TREE}}` | 上文「目录结构」节 |
| `{{LAYER_RESPONSIBILITY}}` | handlers 接请求返数据（只调 OK/Fail）；services 业务逻辑；repositories 数据访问（GORM）；models 表映射；middlewares 信封/鉴权/日志/CORS；config 环境变量；exceptions 业务错误 |
| `{{MIDDLEWARE_CHAIN}}` | `ErrorHandler（panic 兜底，必须最先注册）→ CORS → RequestLog 日志 → Auth JWT 鉴权（按路由组挂载）→ BindJSON 校验 → Handler → Service → OK()/Fail() 信封输出` |
| `{{VALIDATION_WAY}}` | 请求 struct 加 `binding:"required"` 等 tag，经 `handlers.BindJSON` 绑定，失败转 `-1001` |
| `{{ENVELOPE_WAY}}` | `OK()/Fail()` 为唯一包装点，handler 禁止直接 `c.JSON` 返业务数据，禁止再注册响应包装中间件 |
| `{{MODULE_STEPS}}` | ① 更新 `api-contract.md` → ② `internal/models/post.go` → ③ `internal/repositories/post.go` → ④ `internal/services/post.go` → ⑤ `internal/handlers/post.go`（BindJSON 入参、OK/Fail 出参）→ ⑥ `main.go` 注册路由 → ⑦ `migrations/` 加迁移 → ⑧ `go build ./...` + curl 验证 |
| `{{MIDDLEWARE_STEPS}}` | 写 `func Xxx() gin.HandlerFunc` → `main.go` 中 `r.Use(...)` 或挂到路由组 → `ErrorHandler` 必须保持最先注册，否则 panic 破信封 |
| `{{MIGRATION_WAY}}` | golang-migrate / goose：`migrations/0001_xxx.up.sql` + `.down.sql`；开发期可 GORM AutoMigrate，生产必须显式迁移 |
| `{{EXTRA_MIDDLEWARE_WAY}}` | 按需接 Redis/Kafka，连接信息只从环境变量读，命名见 backend-convention-skill `env-config-guide.md` |
