---
name: go-backend-skill
description: Use when the user wants to generate a Go + Gin backend project, or when routed from backend-select-skill with Go chosen. Generates a runnable scaffold on the spot following backend-convention-skill. Triggers: "用 Go 写后端", "Gin 项目", "生成 Gin", "golang backend", "go 骨架", "go web 项目".
---

# Go Backend Skill

现场生成 Gin 后端项目骨架。

**依赖**：backend-convention-skill（规范）、database-skill（DB）。本 skill 只写 Gin 特定骨架与片段，规则文本不复制。

## 版本获取（不写死）

优先级：本机已装版本 → 官方最新稳定/LTS → 用户可覆盖 → 写入 `versions.md`。

- Go：`go version`（或 `go env GOVERSION`）；否则 `https://go.dev/VERSION?m=text` 或 `https://endoflife.date/api/go.json`。
- 依赖：`go get -u <mod>@latest` 或 `https://pkg.go.dev/<mod>?tab=versions`。

**禁止**：在 SKILL.md 写"Go 1.22 / Gin 1.9"等具体数字。

## 生成步骤

1. 从 `spec.md` 读项目名、模块路径、数据库、表前缀（默认 `wg`）。
2. 按 `references/skeleton.md` 的目录结构建文件。
3. 用下面最小片段生成关键文件，AI 扩写完整。
4. **落地两份强制交付物**（见下节），缺一不可。

## 强制交付物（文档）

生成项目时必须与代码**同时落地**两份文档，漏交视为生成未完成：

| 文档 | 位置 | 生成依据 |
|------|------|----------|
| 介绍 & 拓展性文档 | `docs/project-guide.md` | 按 backend-convention-skill `references/project-guide-template.md`，栈特定段按本 skill `references/skeleton.md` 末尾「project-guide 填充段」填 |
| 接口契约（接口 md） | 项目根目录 `api-contract.md` | 以 backend-convention-skill `references/default-api-contract.md` 为起点（已含 health/auth/users 全量接口），按 `api-contract-spec.md` 模板追加业务实体接口 |

要求：
- `project-guide.md` 第 4~10 节（接口范式/入参/出参/拦截器链路/鉴权/对接前端/错误码）不得省略，这是前端对接的最低信息量。
- `api-contract.md` 必须覆盖骨架自带接口 + 确认的全部业务实体接口，每个接口按模板写全。
- 两份文档字段细节不重复：范式进 guide，字段进 contract。

## 关键文件最小片段

### 入口 main.go

```go
func main() {
  cfg := config.Load()
  db := database.New(cfg)
  jwtUtil := utils.NewJWTUtil(cfg.JWTSecret, time.Duration(cfg.JWTExpiresIn)*time.Second)
  userRepo := repositories.NewUserRepository(db)
  userSvc := services.NewUserService(userRepo)
  userH := handlers.NewUserHandler(userSvc)

  r := gin.Default()
  // ErrorHandler 必须最先注册：才能 recover 后续中间件与 handler 的 panic 并转成信封；
  // 否则 panic 落到 gin.Default() 自带 Recovery，返纯文本 500，破坏信封红线。
  r.Use(middlewares.ErrorHandler(), middlewares.CORS(), middlewares.RequestLog())
  api := r.Group("/api")
  api.GET("/health", handlers.Health)
  userH.RegisterRoutes(api)
  r.Run(":" + cfg.AppPort)
}
```

### 统一响应

`OK`/`Fail` 是本栈**唯一包装点**；handler 必须经此输出，禁止直接 `c.JSON` 返业务数据，禁止再注册响应包装中间件（避免漏包/双包）。业务错误可抛 `*exceptions.AppError`（由 `ErrorHandler` 捕获转 `Fail`）或直接 `Fail(c, code, msg)`，两条路径都汇入 `Fail` 这一唯一包装点。

```go
type Response struct {
  Code    int         `json:"code"`
  Message string      `json:"message"`
  Data    interface{} `json:"data"`
}

func OK(c *gin.Context, data interface{}) {
  c.JSON(200, Response{Code: 0, Message: "success", Data: data})
}

func Fail(c *gin.Context, code int, message string) {
  c.JSON(200, Response{Code: code, Message: message, Data: nil})
}
```

### 错误恢复中间件

```go
func ErrorHandler() gin.HandlerFunc {
  return func(c *gin.Context) {
    defer func() {
      if r := recover(); r != nil {
        if e, ok := r.(*exceptions.AppError); ok {
          Fail(c, e.Code, e.Message)
        } else {
          log.Printf("panic: %v", r)
          Fail(c, -2000, "系统繁忙，请稍后再试")
        }
        c.Abort()
      }
    }()
    c.Next()
  }
}
```

### 健康检查

```go
func Health(c *gin.Context) {
  OK(c, gin.H{"status": "ok"})
}
```

## 标准能力清单

生成项目必须内置以下能力，完整片段见 `references/skeleton.md` 的"开箱即用片段"节：

| 能力 | 关键文件 |
|------|----------|
| 统一响应 `{ code, message, data }` | `internal/middlewares/response.go` |
| 全局异常（-1001 / -2000） | `internal/middlewares/response.go` 的 `ErrorHandler` |
| JWT 签发 / 验证 / 当前用户注入 | `internal/utils/auth.go` + `internal/middlewares/auth.go` |
| 请求日志（requestId / method / path / status / duration） | `internal/middlewares/response.go` 的 `RequestLog` |
| 参数校验 | `go-playground/validator`，失败转 `-1001` |
| 分页列表 `{ page, pageSize, total, list }` | `internal/handlers/user.go` 的 `List` |
| CORS | `internal/middlewares/response.go` 的 `CORS` |
| 密码 bcrypt hash | `golang.org/x/crypto/bcrypt` |
| 健康检查 `/api/health` | `internal/handlers/health.go` |
| Docker / docker-compose | `Dockerfile` + `docker-compose.yml` |
| 介绍 & 拓展性文档 | `docs/project-guide.md`（强制交付物，见上节） |
| api-contract.md（接口 md） | 项目根目录，以 convention `default-api-contract.md` 为起点按 `api-contract-spec.md` 补全 |

## 验证

```bash
go mod tidy
go build ./...
go vet ./...
go run cmd/server/main.go
curl http://localhost:8080/api/health
```

预期：`{ "code": 0, "message": "success", "data": { "status": "ok" } }`

## 不做

- 不引 MongoDB（关系型默认 PostgreSQL / MySQL）。
- 不加未请求的中间件。
- 不在 SKILL.md 锁定版本号。
- 不替用户提交。
