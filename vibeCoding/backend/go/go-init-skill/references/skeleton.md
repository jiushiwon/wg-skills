# Go 项目完整骨架

生成 Go 项目时按本骨架现场写代码。版本号一律不写，由 SKILL.md 的版本获取策略动态决定。

> 维护者可用 `scripts/generate_project.go` 从本文件和 `references/startup-scripts.md` 自动生成完整项目，避免人工复制遗漏文件。

## 目录结构

```
{{PROJECT_NAME}}/
├── cmd/
│   └── server/
│       └── main.go              # 程序入口
├── internal/
│   ├── config/
│   │   └── config.go           # 配置加载：从 .env 读取全部配置
│   ├── database/
│   │   └── database.go         # 数据库连接：GORM
│   ├── response/
│   │   └── response.go         # 统一响应：Response 结构体
│   ├── exceptions/
│   │   └── exceptions.go       # 业务异常：BusinessException
│   ├── middleware/
│   │   └── middleware.go       # 中间件：CORS/鉴权/日志/安全头
│   ├── models/
│   │   └── user.go             # User 模型
│   ├── handlers/
│   │   ├── health.go           # 健康检查
│   │   ├── auth.go             # 注册/登录/刷新
│   │   ├── users.go            # 用户 CRUD
│   │   ├── sse.go              # SSE 流式
│   │   └── upload.go           # 文件上传
│   ├── services/
│   │   ├── user.go             # 用户业务逻辑
│   │   └── upload.go           # 文件保存策略
│   └── utils/
│       └── jwt.go              # JWT 签发/验证
├── docs/
│   └── project-guide.md       # 项目指南（强制交付物）
├── restart.sh                  # 一键启动/重启脚本（Linux/macOS，dev/prod 双模式）
├── restart.bat                 # 一键启动/重启脚本（Windows，dev/prod 双模式）
├── .env.example                # 环境变量模板（带安全注释，必须生成）
├── .env                        # 实际运行环境变量（首次从 .env.example 复制，按需修改）
├── .gitignore                  # Git 忽略规则（必须生成，.env 默认不提交）
├── go.mod                      # Go 模块定义
├── go.sum                      # 依赖校验
├── api-contract.md             # 接口契约（强制交付物）
├── Dockerfile                   # Docker 构建文件
├── docker-compose.yml          # Docker Compose（MySQL）
├── docker-compose.pg.yml       # Docker Compose（PostgreSQL）
└── README.md                   # 项目说明
```

## 配置生成与加载规则（强制）

1. **`.env.example`、`.env`、`.gitignore` 必须随脚手架一起生成**。`.gitignore` 中必须忽略 `.env`、`.env.local`、`.env.production` 等包含敏感信息的文件。
2. **首次生成时**，若用户目录不存在 `.env`，自动从 `.env.example` 复制一份，并提示用户按需修改数据库、JWT、CORS 等关键配置。
3. **所有运行时可变配置必须从 `.env` 加载**。`internal/config/config.go` 使用 `godotenv` 读取 `.env` 全部配置，禁止在业务代码中硬编码端口、数据库连接、密钥、上传路径等。
4. **`.env.example` 中的每一项配置都必须在 `internal/config/config.go` 中有对应字段**，并在 main.go、database、handlers、services 等运行环节被实际使用。

## go.mod 模板

```mod
module {{PROJECT_NAME}}

go {{GO_VERSION}}
```

## 关键文件模板

### cmd/server/main.go

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
	"{{PROJECT_NAME}}/internal/exceptions"

	"github.com/gin-gonic/gin"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

// @title           {{PROJECT_NAME}} API
// @version         1.0
// @description     {{PROJECT_NAME}} Web 服务 API 文档
// @termsOfService  http://swagger.io/terms/

// @contact.name   API Support
// @contact.url    http://www.example.com/support
// @contact.email  support@example.com

// @license.name  Apache 2.0
// @license.url   http://www.apache.org/licenses/LICENSE-2.0.html

// @host      localhost:8080
// @BasePath  /api

func main() {
	// 加载配置
	cfg := config.Load()

	// 初始化数据库
	db, err := database.Init(cfg)
	if err != nil {
		log.Fatalf("数据库连接失败: %v", err)
	}

	// 创建 Gin 引擎
	if cfg.AppMode == "prod" {
		gin.SetMode(gin.ReleaseMode)
	}
	r := gin.Default()

	// 注册中间件
	middleware.Register(r, cfg)

	// 注册路由
	handlers.Register(r, db, cfg)

	// 优雅关闭
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

### internal/config/config.go

```go
package config

import (
	"os"
	"strconv"
	"strings"

	"github.com/joho/godotenv"
)

type Config struct {
	// 应用配置
	AppMode  string // dev / prod
	AppPort  string
	AppDebug bool

	// 数据库配置
	DBHost     string
	DBPort     string
	DBUser     string
	DBPassword string
	DBName     string
	DBDriver   string // mysql / postgres

	// JWT 配置
	JwtSecret string
	JwtExpire int // 小时

	// CORS 配置
	CorsOrigins string

	// 上传配置
	UploadPath string
	UploadMaxSize int64 // MB

	// Redis 配置（可选）
	RedisEnabled bool
	RedisHost    string
	RedisPort    string
}

func Load() *Config {
	// 尝试加载 .env 文件（开发环境）
	_ = godotenv.Load()

	return &Config{
		AppMode:       getEnv("APP_MODE", "dev"),
		AppPort:       getEnv("APP_PORT", "8080"),
		AppDebug:      getEnvBool("APP_DEBUG", true),
		DBHost:        getEnv("DB_HOST", "localhost"),
		DBPort:        getEnv("DB_PORT", "3306"),
		DBUser:        getEnv("DB_USER", "root"),
		DBPassword:    getEnv("DB_PASSWORD", ""),
		DBName:        getEnv("DB_NAME", "wg_db"),
		DBDriver:      getEnv("DB_DRIVER", "mysql"),
		JwtSecret:     getEnv("JWT_SECRET", "change-me-in-production"),
		JwtExpire:     getEnvInt("JWT_EXPIRE", 24),
		CorsOrigins:   getEnv("CORS_ORIGINS", "*"),
		UploadPath:    getEnv("UPLOAD_PATH", "./uploads"),
		UploadMaxSize: getEnvInt64("UPLOAD_MAX_SIZE", 10),
		RedisEnabled:  getEnvBool("REDIS_ENABLED", false),
		RedisHost:     getEnv("REDIS_HOST", "localhost"),
		RedisPort:     getEnv("REDIS_PORT", "6379"),
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

func getEnvInt64(key string, defaultValue int64) int64 {
	if value := os.Getenv(key); value != "" {
		if intVal, err := strconv.ParseInt(value, 10, 64); err == nil {
			return intVal
		}
	}
	return defaultValue
}
```

### internal/database/database.go

```go
package database

import (
	"fmt"
	"log"

	"{{PROJECT_NAME}}/internal/config"

	"gorm.io/driver/mysql"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
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

	logLevel := logger.Silent
	if cfg.AppDebug {
		logLevel = logger.Info
	}

	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logLevel),
	})
	if err != nil {
		return nil, fmt.Errorf("数据库连接失败: %w", err)
	}

	// 获取原生 SQL DB
	sqlDB, err := db.DB()
	if err != nil {
		return nil, err
	}

	// 连接池配置
	sqlDB.SetMaxIdleConns(10)
	sqlDB.SetMaxOpenConns(100)

	log.Println("数据库连接成功")
	return db, nil
}
```

### internal/response/response.go

```go
package response

import "github.com/gin-gonic/gin"

// Response 统一响应结构
type Response struct {
	Code    int         `json:"code"`
	Message string      `json:"message"`
	Data    interface{} `json:"data,omitempty"`
}

// Success 成功响应
func Success(c *gin.Context, data interface{}) {
	c.JSON(200, Response{
		Code:    0,
		Message: "success",
		Data:    data,
	})
}

// SuccessWithMsg 带消息的成功响应
func SuccessWithMsg(c *gin.Context, message string, data interface{}) {
	c.JSON(200, Response{
		Code:    0,
		Message: message,
		Data:    data,
	})
}

// Error 错误响应
func Error(c *gin.Context, code int, message string) {
	c.JSON(200, Response{
		Code:    code,
		Message: message,
	})
}

// ErrorWithMsg 业务错误响应（快捷方法）
func ErrorWithMsg(c *gin.Context, message string) {
	Error(c, -1, message)
}

// ValidationError 校验错误
func ValidationError(c *gin.Context, message string) {
	Error(c, -1001, message)
}

// SystemError 系统错误
func SystemError(c *gin.Context, message string) {
	Error(c, -2000, message)
}

// PageData 分页数据
type PageData struct {
	List     interface{} `json:"list"`
	Total    int64       `json:"total"`
	Page     int         `json:"page"`
	PageSize int         `json:"page_size"`
}

// SuccessPage 分页成功响应
func SuccessPage(c *gin.Context, data PageData) {
	Success(c, data)
}
```

### internal/exceptions/exceptions.go

```go
package exceptions

import (
	"log"
	"net/http"

	"{{PROJECT_NAME}}/internal/response"

	"github.com/gin-gonic/gin"
)

// BusinessException 业务异常
type BusinessException struct {
	Code    int
	Message string
}

func (e *BusinessException) Error() string {
	return e.Message
}

// NewBusinessException 创建业务异常
func NewBusinessException(code int, message string) *BusinessException {
	return &BusinessException{Code: code, Message: message}
}

// HandleException 处理异常
func HandleException(c *gin.Context, err error) {
	if err == nil {
		return
	}

	switch e := err.(type) {
	case *BusinessException:
		response.Error(c, e.Code, e.Message)
	case *BusinessException:
		log.Printf("[业务异常] %d: %s", e.Code, e.Message)
		response.Error(c, e.Code, e.Message)
	default:
		log.Printf("[系统异常] %v", err)
		response.SystemError(c, "系统错误，请稍后重试")
	}
}

// PanicIfError 有错误则 panic
func PanicIfError(err error) {
	if err != nil {
		panic(err)
	}
}
```

### internal/middleware/middleware.go

```go
package middleware

import (
	"log"
	"strings"
	"time"

	"{{PROJECT_NAME}}/internal/config"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

// Register 注册中间件
func Register(r *gin.Engine, cfg *config.Config) {
	// 全局中间件
	r.Use(gin.Logger())
	r.Use(gin.Recovery())

	// 安全头
	r.Use(func(c *gin.Context) {
		c.Header("X-Frame-Options", "DENY")
		c.Header("X-Content-Type-Options", "nosniff")
		c.Header("X-XSS-Protection", "1; mode=block")
		c.Next()
	})

	// CORS
	origins := strings.Split(cfg.CorsOrigins, ",")
	r.Use(func(c *gin.Context) {
		origin := c.GetHeader("Origin")
		for _, o := range origins {
			if o == "*" || strings.TrimSpace(o) == origin {
				c.Header("Access-Control-Allow-Origin", origin)
				break
			}
		}
		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Content-Type, Authorization")
		c.Header("Access-Control-Max-Age", "86400")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	})

	// 路由组
	api := r.Group("/api")
	{
		// 健康检查（无需鉴权）
		api.GET("/health", healthCheck)

		// 认证路由（无需鉴权）
		auth := api.Group("/auth")
		{
			auth.POST("/register", register)
			auth.POST("/login", login)
		}

		// 需要鉴权的路由
		protected := api.Group("")
		protected.Use(JWTAuth(cfg))
		{
			protected.GET("/users", listUsers)
			protected.GET("/users/:id", getUser)
			protected.PUT("/users/:id", updateUser)
			protected.DELETE("/users/:id", deleteUser)
			protected.POST("/auth/refresh", refreshToken)
			protected.GET("/sse/chat", sseChat)
			protected.POST("/upload", uploadFile)
			protected.POST("/uploads", uploadFiles)
		}
	}

	// Swagger
	r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))
	r.GET("/docs/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))
}

// ========== 内置处理器占位 ==========

func healthCheck(c *gin.Context) {
	c.JSON(200, gin.H{"status": "ok", "timestamp": time.Now().Unix()})
}

// JWTAuth JWT 鉴权中间件
func JWTAuth(cfg *config.Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(401, gin.H{"code": -401, "message": "缺少 Authorization 头"})
			c.Abort()
			return
		}

		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			c.JSON(401, gin.H{"code": -401, "message": "无效的 Authorization 格式"})
			c.Abort()
			return
		}

		tokenString := parts[1]
		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			return []byte(cfg.JwtSecret), nil
		})

		if err != nil || !token.Valid {
			c.JSON(401, gin.H{"code": -401, "message": "无效的 Token"})
			c.Abort()
			return
		}

		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			c.JSON(401, gin.H{"code": -401, "message": "无效的 Token 声明"})
			c.Abort()
			return
		}

		// 将用户信息存入上下文
		c.Set("user_id", claims["user_id"])
		c.Set("username", claims["username"])
		c.Next()
	}
}

// 占位函数（实际在 handlers 中实现）
func register(c *gin.Context)  { c.JSON(501, gin.H{"message": "not implemented"}) }
func login(c *gin.Context)     { c.JSON(501, gin.H{"message": "not implemented"}) }
func listUsers(c *gin.Context) { c.JSON(501, gin.H{"message": "not implemented"}) }
func getUser(c *gin.Context)   { c.JSON(501, gin.H{"message": "not implemented"}) }
func updateUser(c *gin.Context) { c.JSON(501, gin.H{"message": "not implemented"}) }
func deleteUser(c *gin.Context) { c.JSON(501, gin.H{"message": "not implemented"}) }
func refreshToken(c *gin.Context) { c.JSON(501, gin.H{"message": "not implemented"}) }
func sseChat(c *gin.Context)    { c.JSON(501, gin.H{"message": "not implemented"}) }
func uploadFile(c *gin.Context)  { c.JSON(501, gin.H{"message": "not implemented"}) }
func uploadFiles(c *gin.Context)  { c.JSON(501, gin.H{"message": "not implemented"}) }
```

### internal/models/user.go

```go
package models

import (
	"time"

	"gorm.io/gorm"
)

// User 用户模型
type User struct {
	ID        uint           `gorm:"primarykey" json:"id"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"deleted_at"`

	Username string `gorm:"uniqueIndex;size:50;not null" json:"username"`
	Password string `gorm:"size:255;not null" json:"-"`
	Nickname string `gorm:"size:100" json:"nickname"`
	Email    string `gorm:"index;size:100" json:"email"`
	Phone    string `gorm:"index;size:20" json:"phone"`
	Avatar   string `gorm:"size:255" json:"avatar"`
	Status   int    `gorm:"default:1" json:"status"` // 1:正常 0:禁用
}

func (User) TableName() string {
	return "wg_user"
}
```

### internal/utils/jwt.go

```go
package utils

import (
	"errors"
	"time"

	"{{PROJECT_NAME}}/internal/config"

	"github.com/golang-jwt/jwt/v5"
)

var jwtSecret []byte

// InitJWT 初始化 JWT
func InitJWT(secret string) {
	jwtSecret = []byte(secret)
}

// Claims JWT 声明
type Claims struct {
	UserID   uint   `json:"user_id"`
	Username string `json:"username"`
	jwt.RegisteredClaims
}

// GenerateToken 生成 Token
func GenerateToken(userID uint, username string, expireHours int) (string, error) {
	now := time.Now()
	expire := now.Add(time.Duration(expireHours) * time.Hour)

	claims := Claims{
		UserID:   userID,
		Username: username,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expire),
			IssuedAt:  jwt.NewNumericDate(now),
			NotBefore: jwt.NewNumericDate(now),
			Issuer:    "wg-app",
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(jwtSecret)
}

// ParseToken 解析 Token
func ParseToken(tokenString string) (*Claims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (interface{}, error) {
		return jwtSecret, nil
	})

	if err != nil {
		return nil, err
	}

	if claims, ok := token.Claims.(*Claims); ok && token.Valid {
		return claims, nil
	}

	return nil, errors.New("invalid token")
}

// RefreshToken 刷新 Token
func RefreshToken(tokenString string, expireHours int) (string, error) {
	claims, err := ParseToken(tokenString)
	if err != nil {
		return "", err
	}
	return GenerateToken(claims.UserID, claims.Username, expireHours)
}
```

### .env.example 模板

```bash
# ==================== 应用配置 ====================
# 运行模式：dev / prod
APP_MODE=dev
# 服务端口
APP_PORT=8080
# 调试模式
APP_DEBUG=true

# ==================== 数据库配置 ====================
# 数据库驱动：mysql / postgres
DB_DRIVER=mysql
# 数据库地址
DB_HOST=localhost
# 数据库端口（MySQL: 3306, PostgreSQL: 5432）
DB_PORT=3306
# 数据库用户名
DB_USER=root
# 数据库密码
DB_PASSWORD=your_password_here
# 数据库名称
DB_NAME=wg_db

# ==================== JWT 配置 ====================
# JWT 密钥 [WARNING] 生产环境必须修改！
JWT_SECRET=change-me-in-production-use-openssl-rand-hex-32
# Token 过期时间（小时）
JWT_EXPIRE=24

# ==================== CORS 配置 ====================
# 允许的 Origins，多个用逗号分隔
CORS_ORIGINS=*

# ==================== 文件上传配置 ====================
# 上传文件保存路径
UPLOAD_PATH=./uploads
# 上传文件大小限制（MB）
UPLOAD_MAX_SIZE=10

# ==================== Redis 配置（可选）====================
# 是否启用 Redis
REDIS_ENABLED=false
# Redis 地址
REDIS_HOST=localhost
# Redis 端口
REDIS_PORT=6379
```

### .gitignore 模板

```
# Binaries
*.exe
*.dll
*.so
*.dylib
/bin/

# Test binary
*.test

# Output of the go coverage tool
*.out

# Dependency directories
vendor/

# Go workspace file
go.work

# Environment variables
.env
.env.local
.env.production

# IDE
.idea/
.vscode/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
logs/
*.log

# Uploads
uploads/

# Build
dist/
```

### Dockerfile 模板

```dockerfile
# 构建阶段
FROM golang:1.21-alpine AS builder

WORKDIR /app

# 安装依赖
COPY go.mod go.sum ./
RUN go mod download

# 复制源码
COPY . .

# 构建
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o server ./cmd/server

# 运行阶段
FROM alpine:latest

WORKDIR /app

# 安装证书（用于 HTTPS）
RUN apk --no-cache add ca-certificates tzdata

# 复制构建产物
COPY --from=builder /app/server .
COPY --from=builder /app/.env.example .

# 创建上传目录
RUN mkdir -p uploads

# 暴露端口
EXPOSE 8080

# 启动
CMD ["./server"]
```

### docker-compose.yml (MySQL)

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
    volumes:
      - ./uploads:/app/uploads

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

### docker-compose.pg.yml (PostgreSQL)

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "8080:8080"
    environment:
      - APP_MODE=prod
      - DB_DRIVER=postgres
      - DB_HOST=db
      - DB_USER=postgres
      - DB_PASSWORD=wg123456
      - DB_NAME=wg_db
    depends_on:
      db:
        condition: service_healthy
    volumes:
      - ./uploads:/app/uploads

  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_PASSWORD: wg123456
      POSTGRES_DB: wg_db
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
```
