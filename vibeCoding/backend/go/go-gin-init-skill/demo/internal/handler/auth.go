package handler

import (
	"net/http"
	"time"

	"demo/pkg/utils"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

// AuthHandler 认证处理器（演示用，账号硬编码）
type AuthHandler struct {
	jwtSecret []byte
}

func NewAuthHandler(secret string) *AuthHandler {
	return &AuthHandler{jwtSecret: []byte(secret)}
}

type loginReq struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

// Login 登录接口
func (h *AuthHandler) Login(c *gin.Context) {
	var req loginReq
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Fail(c, http.StatusBadRequest, "参数错误")
		return
	}
	// 演示：固定账号
	if req.Username != "admin" || req.Password != "admin123" {
		utils.Fail(c, http.StatusUnauthorized, "账号或密码错误")
		return
	}
	claims := jwt.MapClaims{
		"userId":   1,
		"username": req.Username,
		"exp":      time.Now().Add(24 * time.Hour).Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	signed, err := token.SignedString(h.jwtSecret)
	if err != nil {
		utils.Fail(c, http.StatusInternalServerError, "签发失败")
		return
	}
	utils.Success(c, gin.H{"token": signed, "username": req.Username})
}
