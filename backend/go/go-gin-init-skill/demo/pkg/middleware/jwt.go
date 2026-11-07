package middleware

import (
	"net/http"
	"strings"

	"demo/pkg/utils"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

// JWT 鉴权中间件
func JWT(secret string) gin.HandlerFunc {
	return func(c *gin.Context) {
		auth := c.GetHeader("Authorization")
		if !strings.HasPrefix(auth, "Bearer ") {
			utils.Fail(c, http.StatusUnauthorized, "未登录")
			c.Abort()
			return
		}
		tokenStr := strings.TrimPrefix(auth, "Bearer ")
		// 固定期望算法 HS256：不让 token header 里的 alg 决定验签方式，堵死 alg 混淆攻击
		token, err := jwt.Parse(tokenStr, func(t *jwt.Token) (interface{}, error) {
			return []byte(secret), nil
		}, jwt.WithValidMethods([]string{"HS256"}))
		if err != nil || !token.Valid {
			utils.Fail(c, http.StatusUnauthorized, "token 无效")
			c.Abort()
			return
		}
		if claims, ok := token.Claims.(jwt.MapClaims); ok {
			c.Set("userId", claims["userId"])
			c.Set("username", claims["username"])
		}
		c.Next()
	}
}
