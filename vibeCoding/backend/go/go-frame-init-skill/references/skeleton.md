# Go 多框架项目骨架

生成 Go 多框架项目时按本骨架现场写代码。版本号一律不写。

## 目录结构

```
{{PROJECT_NAME}}/
├── cmd/
│   └── server/
│       └── main.go              # 程序入口
├── internal/
│   ├── config/
│   │   └── config.go           # 配置加载
│   ├── database/
│   │   └── database.go         # 数据库连接
│   ├── response/
│   │   └── response.go         # 统一响应
│   ├── middleware/
│   │   └── middleware.go       # 中间件
│   ├── handlers/
│   │   ├── health.go           # 健康检查
│   │   ├── auth.go             # 认证
│   │   └── users.go            # 用户
│   └── utils/
│       └── jwt.go              # JWT 工具
├── docs/
│   └── project-guide.md
├── scripts/
│   └── restart.sh
├── .env.example
├── .env
├── .gitignore
├── go.mod
├── go.sum
├── api-contract.md
├── Dockerfile
├── docker-compose.yml
└── README.md
```

## 配置加载规则

1. `.env.example`、`.env`、`.gitignore` 必须生成
2. `internal/config/config.go` 使用 `godotenv` 读取 `.env`

## go.mod 模板

```mod
module {{PROJECT_NAME}}

go {{GO_VERSION}}
```

## main.go 模板（多框架适配）

### Gin 模板

```go
package main

import (
	"log"
	"os"
	"os/signal"
	"syscall"

	"{{PROJECT_NAME}}/internal/config"
	"{{PROJECT_NAME}}/internal/database"
	"{{PROJECT_NAME}}/internal/middleware"
	"{{PROJECT_NAME}}/internal/handlers"

	"github.com/gin-gonic/gin"
)

func main() {
	cfg := config.Load()
	db, err := database.Init(cfg)
	if err != nil {
		log.Fatalf("数据库连接失败: %v", err)
	}

	r := gin.Default()
	middleware.Register(r, cfg)
	handlers.Register(r, db, cfg)

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)

	go func() {
		addr := ":" + cfg.AppPort
		log.Printf("服务启动: http://localhost%s", addr)
		if err := r.Run(addr); err != nil {
			log.Fatalf("服务启动失败: %v", err)
		}
	}()

	<-quit
	log.Println("正在关闭服务...")
}
```

### Hertz 模板

```go
package main

import (
	"context"
	"log"

	"{{PROJECT_NAME}}/internal/config"
	"{{PROJECT_NAME}}/internal/database"
	"{{PROJECT_NAME}}/internal/handlers"

	"github.com/cloudwego/hertz/pkg/app"
	"github.com/cloudwego/hertz/pkg/app/server"
)

func main() {
	cfg := config.Load()
	db, err := database.Init(cfg)
	if err != nil {
		log.Fatalf("数据库连接失败: %v", err)
	}

	h := server.Default(
		server.WithHostPorts(":" + cfg.AppPort),
	)

	handlers.Register(h, db, cfg)

	h.Spin()
}
```

### Fiber 模板

```go
package main

import (
	"log"

	"{{PROJECT_NAME}}/internal/config"
	"{{PROJECT_NAME}}/internal/database"
	"{{PROJECT_NAME}}/internal/handlers"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"
)

func main() {
	cfg := config.Load()
	db, err := database.Init(cfg)
	if err != nil {
		log.Fatalf("数据库连接失败: %v", err)
	}

	app := fiber.New()
	app.Use(logger.New())
	app.Use(recover.New())

	handlers.Register(app, db, cfg)

	log.Printf("服务启动: http://localhost:%s", cfg.AppPort)
	log.Fatal(app.Listen(":" + cfg.AppPort))
}
```

### Chi 模板

```go
package main

import (
	"log"
	"net/http"
	"os"
	"os/signal"
	"context"
	"syscall"

	"{{PROJECT_NAME}}/internal/config"
	"{{PROJECT_NAME}}/internal/database"
	"{{PROJECT_NAME}}/internal/handlers"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
)

func main() {
	cfg := config.Load()
	db, err := database.Init(cfg)
	if err != nil {
		log.Fatalf("数据库连接失败: %v", err)
	}

	r := chi.NewRouter()
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)

	handlers.Register(r, db, cfg)

	srv := &http.Server{
		Addr:    ":" + cfg.AppPort,
		Handler: r,
	}

	go func() {
		log.Printf("服务启动: http://localhost%s", srv.Addr)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("服务启动失败: %v", err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("正在关闭服务...")
	srv.Shutdown(context.Background())
}
```

## config.go 模板

```go
package config

import (
	"os"
	"strconv"
	"strings"

	"github.com/joho/godotenv"
)

type Config struct {
	AppMode    string
	AppPort    string
	AppDebug   bool
	DBHost     string
	DBPort     string
	DBUser     string
	DBPassword string
	DBName     string
	DBDriver   string
	JwtSecret  string
	JwtExpire  int
	CorsOrigins string
}

func Load() *Config {
	_ = godotenv.Load()

	return &Config{
		AppMode:     getEnv("APP_MODE", "dev"),
		AppPort:     getEnv("APP_PORT", "8080"),
		AppDebug:    getEnvBool("APP_DEBUG", true),
		DBHost:      getEnv("DB_HOST", "localhost"),
		DBPort:      getEnv("DB_PORT", "3306"),
		DBUser:      getEnv("DB_USER", "root"),
		DBPassword:  getEnv("DB_PASSWORD", ""),
		DBName:      getEnv("DB_NAME", "wg_db"),
		DBDriver:    getEnv("DB_DRIVER", "mysql"),
		JwtSecret:   getEnv("JWT_SECRET", "change-me"),
		JwtExpire:   getEnvInt("JWT_EXPIRE", 24),
		CorsOrigins: getEnv("CORS_ORIGINS", "*"),
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func getEnvBool(key string, defaultValue bool) bool {
	if value := os.Getenv(key); value != "" {
		return strings.ToLower(value) == "true" || value == "1"
	}
	return defaultValue
}

func getEnvInt(key string, defaultValue int) int {
	if value := os.Getenv(key); value != "" {
		if intVal, err := strconv.Atoi(value); err == nil {
			return intVal
		}
	}
	return defaultValue
}
```

## database.go 模板

```go
package database

import (
	"fmt"
	"log"

	"{{PROJECT_NAME}}/internal/config"

	"gorm.io/driver/mysql"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func Init(cfg *config.Config) (*gorm.DB, error) {
	var dsn string
	var driver string

	switch cfg.DBDriver {
	case "postgres":
		dsn = fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=disable",
			cfg.DBHost, cfg.DBUser, cfg.DBPassword, cfg.DBName, cfg.DBPort)
		driver = "postgres"
	default:
		dsn = fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local",
			cfg.DBUser, cfg.DBPassword, cfg.DBHost, cfg.DBPort, cfg.DBName)
		driver = "mysql"
	}

	var db *gorm.DB
	var err error

	if driver == "postgres" {
		db, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	} else {
		db, err = gorm.Open(mysql.Open(dsn), &gorm.Config{})
	}

	if err != nil {
		return nil, fmt.Errorf("数据库连接失败: %w", err)
	}

	sqlDB, _ := db.DB()
	sqlDB.SetMaxIdleConns(10)
	sqlDB.SetMaxOpenConns(100)

	log.Println("数据库连接成功")
	return db, nil
}
```

## response.go 模板

```go
package response

type Response struct {
	Code    int         `json:"code"`
	Message string      `json:"message"`
	Data    interface{} `json:"data,omitempty"`
}

func Success(data interface{}) Response {
	return Response{Code: 0, Message: "success", Data: data}
}

func Error(code int, message string) Response {
	return Response{Code: code, Message: message}
}
```

## middleware.go 模板

```go
package middleware

import (
	"strings"

	"{{PROJECT_NAME}}/internal/config"
)

// Register 注册中间件（框架适配由调用方实现）
func Register(engine interface{}, cfg *config.Config) {
	// 具体实现根据框架不同而变化
	// Gin: engine *gin.Engine
	// Hertz: engine *hertz.Hertz
	// Fiber: engine *fiber.App
	// Chi: engine chi.Router
}

// CORS 中间件
func CORS(origins string) func(interface{}) {
	return func(c interface{}) {
		// 框架特定的 CORS 实现
	}
}

// JWT 鉴权中间件
func JWTAuth(secret string) func(interface{}) {
	return func(c interface{}) {
		// 框架特定的 JWT 实现
	}
}
```

## handlers.go 模板

```go
package handlers

import (
	"{{PROJECT_NAME}}/internal/config"
	"{{PROJECT_NAME}}/internal/response"

	"gorm.io/gorm"
)

func Register(engine interface{}, db *gorm.DB, cfg *config.Config) {
	// 框架特定的路由注册
}

// HealthCheck 健康检查
func HealthCheck(c interface{}) {
	// 框架特定的实现
	response.Success(nil)
}
```

## .env.example 模板

```bash
# 应用配置
APP_MODE=dev
APP_PORT=8080
APP_DEBUG=true

# 数据库配置
DB_DRIVER=mysql
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password_here
DB_NAME=wg_db

# JWT 配置
JWT_SECRET=change-me-in-production
JWT_EXPIRE=24

# CORS
CORS_ORIGINS=*
```

## .gitignore 模板

```
.env
.env.local
.env.production
*.exe
*.dll
*.so
*.dylib
/bin/
*.test
*.out
vendor/
.idea/
.vscode/
*.log
logs/
uploads/
dist/
```

## Dockerfile 模板

```dockerfile
FROM golang:1.21-alpine AS builder

WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o server ./cmd/server

FROM alpine:latest
WORKDIR /app
RUN apk --no-cache add ca-certificates
COPY --from=builder /app/server .
COPY --from=builder /app/.env.example .
EXPOSE 8080
CMD ["./server"]
```

## docker-compose.yml 模板

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "8080:8080"
    environment:
      - APP_MODE=prod
      - DB_HOST=db
      - DB_USER=root
      - DB_PASSWORD=wg123456
      - DB_NAME=wg_db
    depends_on:
      db:
        condition: service_healthy

  db:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: wg123456
      MYSQL_DATABASE: wg_db
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  mysql_data:
```
