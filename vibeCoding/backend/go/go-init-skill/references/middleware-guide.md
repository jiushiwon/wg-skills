# 中间件指南

## 中间件链顺序

Go Gin 中间件按注册顺序执行，建议顺序：

1. Logger - 日志记录
2. Recovery - 异常恢复
3. SecurityHeaders - 安全头
4. CORS - 跨域请求
5. RateLimit - 限流（可选）
6. JWTAuth - JWT 鉴权
7. Business - 业务中间件

## 安全头中间件

```go
// internal/middleware/security.go
package middleware

import (
	"github.com/gin-gonic/gin"
)

// SecurityHeaders 安全头中间件
func SecurityHeaders() gin.HandlerFunc {
	return func(c *gin.Context) {
		// 防止点击劫持
		c.Header("X-Frame-Options", "DENY")
		// 防止 MIME 类型嗅探
		c.Header("X-Content-Type-Options", "nosniff")
		// XSS 防护
		c.Header("X-XSS-Protection", "1; mode=block")
		// 引用策略
		c.Header("Referrer-Policy", "strict-origin-when-cross-origin")
		// 权限策略
		c.Header("Permissions-Policy", "geolocation=(), microphone=(), camera=()")
		// 内容安全策略（可根据需要配置）
		// c.Header("Content-Security-Policy", "default-src 'self'")

		c.Next()
	}
}
```

## CORS 中间件

```go
// internal/middleware/cors.go
package middleware

import (
	"strings"

	"github.com/gin-gonic/gin"
)

// CORS 中间件配置
type CORSConfig struct {
	Origins string // 允许的 Origins，多个用逗号分隔
}

// NewCORS 创建 CORS 中间件
func NewCORS(origins string) gin.HandlerFunc {
	originList := strings.Split(origins, ",")
	allowOrigins := make([]string, len(originList))
	for i, o := range originList {
		allowOrigins[i] = strings.TrimSpace(o)
	}

	return func(c *gin.Context) {
		origin := c.GetHeader("Origin")

		// 检查是否允许该 origin
		for _, allowed := range allowOrigins {
			if allowed == "*" || allowed == origin {
				c.Header("Access-Control-Allow-Origin", origin)
				break
			}
		}

		// 允许的请求方法
		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS")
		// 允许的请求头
		c.Header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With")
		// 允许携带凭证
		c.Header("Access-Control-Allow-Credentials", "true")
		// 预检请求缓存时间
		c.Header("Access-Control-Max-Age", "86400")

		// 处理预检请求
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	}
}
```

## 日志中间件

```go
// internal/middleware/logger.go
package middleware

import (
	"log"
	"time"

	"github.com/gin-gonic/gin"
)

// Logger 日志中间件
func Logger() gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()
		path := c.Request.URL.Path
		method := c.Request.Method

		// 处理请求
		c.Next()

		// 记录日志
		latency := time.Since(start)
		status := c.Writer.Status()

		log.Printf("[%s] %s %s %d %v",
			method,
			path,
			c.ClientIP(),
			status,
			latency,
		)
	}
}
```

## JWT 鉴权中间件

```go
// internal/middleware/jwt.go
package middleware

import (
	"net/http"
	"strings"

	"{{PROJECT_NAME}}/internal/config"
	"{{PROJECT_NAME}}/internal/response"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

// JWTAuth JWT 鉴权中间件
func JWTAuth(cfg *config.Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		// 获取 Authorization 头
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			response.Error(c, -401, "缺少 Authorization 头")
			c.Abort()
			return
		}

		// 解析 Bearer Token
		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			response.Error(c, -401, "无效的 Authorization 格式，请使用 Bearer token")
			c.Abort()
			return
		}

		tokenString := parts[1]

		// 解析 Token
		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			// 验证签名方法
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, jwt.ErrSignatureInvalid
			}
			return []byte(cfg.JwtSecret), nil
		})

		if err != nil || !token.Valid {
			response.Error(c, -401, "无效或已过期的 Token")
			c.Abort()
			return
		}

		// 提取用户信息
		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			response.Error(c, -401, "无效的 Token 声明")
			c.Abort()
			return
		}

		// 存入上下文
		c.Set("user_id", claims["user_id"])
		c.Set("username", claims["username"])

		c.Next()
	}
}
```

## 限流中间件（可选）

```go
// internal/middleware/ratelimit.go
package middleware

import (
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
)

// RateLimiter 简单限流器
type RateLimiter struct {
	mu       sync.Mutex
	requests map[string][]time.Time
	limit    int
	window   time.Duration
}

// NewRateLimiter 创建限流器
func NewRateLimiter(limit int, window time.Duration) *RateLimiter {
	rl := &RateLimiter{
		requests: make(map[string][]time.Time),
		limit:    limit,
		window:   window,
	}
	// 清理过期记录
	go rl.cleanup()
	return rl
}

// Allow 检查是否允许请求
func (rl *RateLimiter) Allow(key string) bool {
	rl.mu.Lock()
	defer rl.mu.Unlock()

	now := time.Now()
	windowStart := now.Add(-rl.window)

	// 获取该 key 的请求历史
	history := rl.requests[key]

	// 过滤掉窗口外的请求
	valid := make([]time.Time, 0, len(history))
	for _, t := range history {
		if t.After(windowStart) {
			valid = append(valid, t)
		}
	}

	// 检查是否超限
	if len(valid) >= rl.limit {
		rl.requests[key] = valid
		return false
	}

	// 记录新请求
	rl.requests[key] = append(valid, now)
	return true
}

// cleanup 清理过期记录
func (rl *RateLimiter) cleanup() {
	ticker := time.NewTicker(rl.window)
	for range ticker.C {
		rl.mu.Lock()
		now := time.Now()
		windowStart := now.Add(-rl.window)
		for key, history := range rl.requests {
			valid := make([]time.Time, 0)
			for _, t := range history {
				if t.After(windowStart) {
					valid = append(valid, t)
				}
			}
			if len(valid) == 0 {
				delete(rl.requests, key)
			} else {
				rl.requests[key] = valid
			}
		}
		rl.mu.Unlock()
	}
}

// RateLimit 限流中间件
func RateLimit(limit int, window time.Duration) gin.HandlerFunc {
	limiter := NewRateLimiter(limit, window)
	return func(c *gin.Context) {
		key := c.ClientIP()
		if !limiter.Allow(key) {
			c.JSON(http.StatusTooManyRequests, gin.H{
				"code":    -429,
				"message": "请求过于频繁，请稍后重试",
			})
			c.Abort()
			return
		}
		c.Next()
	}
}
```

## 中间件注册

```go
// internal/middleware/middleware.go
package middleware

import (
	"{{PROJECT_NAME}}/internal/config"

	"github.com/gin-gonic/gin"
)

// Register 注册所有中间件
func Register(r *gin.Engine, cfg *config.Config) {
	// 全局中间件
	r.Use(gin.Logger())           // 日志
	r.Use(gin.Recovery())         // 异常恢复

	// 安全头
	r.Use(SecurityHeaders())

	// CORS
	r.Use(NewCORS(cfg.CorsOrigins))

	// 限流（可选，每分钟 60 次）
	// r.Use(RateLimit(60, time.Minute))

	// 路由注册...
}
```

## 错误码规范

| 错误码 | 说明 |
|--------|------|
| -401 | 未授权（无 Token） |
| -403 | 禁止访问（权限不足） |
| -404 | 资源不存在 |
| -429 | 请求过于频繁 |
| -500 | 系统错误 |
