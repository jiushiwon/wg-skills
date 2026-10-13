package handler

import (
	"net/http"
	"strconv"

	"demo/internal/model"
	"demo/internal/service"
	"demo/pkg/utils"

	"github.com/gin-gonic/gin"
)

// UserHandler 用户 HTTP 处理器
type UserHandler struct {
	svc *service.UserService
}

func NewUserHandler(svc *service.UserService) *UserHandler {
	return &UserHandler{svc: svc}
}

// Create 创建用户
func (h *UserHandler) Create(c *gin.Context) {
	var user model.User
	if err := c.ShouldBindJSON(&user); err != nil {
		utils.Fail(c, http.StatusBadRequest, "参数错误: "+err.Error())
		return
	}
	if user.Username == "" {
		utils.Fail(c, http.StatusBadRequest, "用户名不能为空")
		return
	}
	if err := h.svc.Create(&user); err != nil {
		utils.Fail(c, http.StatusInternalServerError, "创建失败: "+err.Error())
		return
	}
	utils.Success(c, user)
}

// Get 查询单个
func (h *UserHandler) Get(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	user, err := h.svc.Get(uint(id))
	if err != nil {
		utils.Fail(c, http.StatusNotFound, "用户不存在")
		return
	}
	utils.Success(c, user)
}

// List 分页列表
func (h *UserHandler) List(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	size, _ := strconv.Atoi(c.DefaultQuery("size", "10"))
	if page < 1 {
		page = 1
	}
	if size < 1 || size > 100 {
		size = 10
	}
	users, total, err := h.svc.List(page, size)
	if err != nil {
		utils.Fail(c, http.StatusInternalServerError, "查询失败")
		return
	}
	utils.Success(c, gin.H{"list": users, "total": total, "page": page, "size": size})
}

// Update 更新
func (h *UserHandler) Update(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	user, err := h.svc.Get(uint(id))
	if err != nil {
		utils.Fail(c, http.StatusNotFound, "用户不存在")
		return
	}
	if err := c.ShouldBindJSON(user); err != nil {
		utils.Fail(c, http.StatusBadRequest, "参数错误")
		return
	}
	if err := h.svc.Update(user); err != nil {
		utils.Fail(c, http.StatusInternalServerError, "更新失败")
		return
	}
	utils.Success(c, user)
}

// Delete 删除
func (h *UserHandler) Delete(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	if err := h.svc.Delete(uint(id)); err != nil {
		utils.Fail(c, http.StatusInternalServerError, "删除失败")
		return
	}
	utils.Success(c, nil)
}
