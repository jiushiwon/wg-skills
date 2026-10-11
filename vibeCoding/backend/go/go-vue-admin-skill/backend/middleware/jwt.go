package middleware

import (
	"net/http"
	"strings"

	"go-vue-admin-skill/backend/modules/auth"

	"github.com/gin-gonic/gin"
)

func Cors() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Origin, Content-Type, Accept, Authorization")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}
		c.Next()
	}
}

func JWT() gin.HandlerFunc {
	return func(c *gin.Context) {
		token := c.GetHeader("Authorization")
		if token == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "未提供Token"})
			c.Abort()
			return
		}
		token = strings.TrimPrefix(token, "Bearer ")
		claims, err := auth.ParseToken(token)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "Token无效或已过期"})
			c.Abort()
			return
		}
		c.Set("userID", claims.UserID)
		c.Set("username", claims.Username)
		c.Next()
	}
}

func RequireAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Next()
	}
}

func AppAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		appKey := c.GetHeader("X-App-Key")
		if appKey == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "缺少签名参数"})
			c.Abort()
			return
		}
		c.Set("appKey", appKey)
		c.Next()
	}
}
