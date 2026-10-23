package handler

import (
	"net/http"
	"time"

	"demo/internal/service"
	"demo/pkg/utils"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

// AccessTokenTTL 访问令牌有效期，短令牌降低泄露窗口
const AccessTokenTTL = 2 * time.Hour

// AuthHandler 认证处理器
type AuthHandler struct {
	jwtSecret []byte
	userSvc   *service.UserService
}

func NewAuthHandler(secret string, userSvc *service.UserService) *AuthHandler {
	return &AuthHandler{jwtSecret: []byte(secret), userSvc: userSvc}
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
	// 查库比对 bcrypt 哈希；用户不存在与密码错误返回同一提示，避免账号枚举
	user, err := h.userSvc.FindByUsername(req.Username)
	if err != nil || user.Status != 1 || !verifyPassword(user.PasswordHash, req.Password) {
		utils.Fail(c, http.StatusUnauthorized, "账号或密码错误")
		return
	}
	claims := jwt.MapClaims{
		"userId":   user.ID,
		"username": user.Username,
		"exp":      time.Now().Add(AccessTokenTTL).Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	signed, err := token.SignedString(h.jwtSecret)
	if err != nil {
		utils.Fail(c, http.StatusInternalServerError, "签发失败")
		return
	}
	utils.Success(c, gin.H{"token": signed, "username": user.Username, "expiresIn": int(AccessTokenTTL.Seconds())})
}

// verifyPassword 用 bcrypt 比对密码哈希（不可逆，库中不存明文）
func verifyPassword(hash, raw string) bool {
	return bcrypt.CompareHashAndPassword([]byte(hash), []byte(raw)) == nil
}
