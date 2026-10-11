package auth

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func Login(c *gin.Context) {
	var req struct {
		Username string `json:"username" binding:"required"`
		Password string `json:"password" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "参数错误"})
		return
	}

	var user SysUser
	db := c.MustGet("db").(*gorm.DB)
	if err := db.Where("username = ?", req.Username).First(&user).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "用户不存在"})
		return
	}

	if !user.CheckPassword(req.Password) {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "密码错误"})
		return
	}

	if user.Status != 1 {
		c.JSON(http.StatusForbidden, gin.H{"success": false, "message": "账号已被禁用"})
		return
	}

	token, _ := GenerateToken(user.ID, user.Username)
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"token": token,
			"user": gin.H{
				"id":       user.ID,
				"username": user.Username,
				"nickname": user.Nickname,
				"avatar":   user.Avatar,
			},
		},
	})
}

func Register(c *gin.Context) {
	var req struct {
		Username string `json:"username" binding:"required"`
		Password string `json:"password" binding:"required"`
		Nickname string `json:"nickname"`
		Phone    string `json:"phone"`
	}
	db := c.MustGet("db").(*gorm.DB)
	var count int64
	db.Model(&SysUser{}).Where("username = ?", req.Username).Count(&count)
	if count > 0 {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "用户名已存在"})
		return
	}
	user := SysUser{Username: req.Username, Password: req.Password, Nickname: req.Nickname, Phone: req.Phone, Status: 1}
	db.Create(&user)
	c.JSON(http.StatusOK, gin.H{"success": true, "message": "注册成功"})
}

func Me(c *gin.Context) {
	userID := c.GetUint("userID")
	db := c.MustGet("db").(*gorm.DB)
	var user SysUser
	db.First(&user, userID)
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"id":       user.ID,
			"username": user.Username,
			"nickname": user.Nickname,
			"avatar":   user.Avatar,
			"email":    user.Email,
			"phone":    user.Phone,
		},
	})
}

func ChangePassword(c *gin.Context) {
	userID := c.GetUint("userID")
	var req struct {
		OldPassword string `json:"oldPassword" binding:"required"`
		NewPassword string `json:"newPassword" binding:"required"`
	}
	db := c.MustGet("db").(*gorm.DB)
	var user SysUser
	db.First(&user, userID)
	if !user.CheckPassword(req.OldPassword) {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "原密码错误"})
		return
	}
	user.Password = req.NewPassword
	db.Save(&user)
	c.JSON(http.StatusOK, gin.H{"success": true, "message": "密码修改成功"})
}

func ListRoles(c *gin.Context) {
	db := c.MustGet("db").(*gorm.DB)
	var roles []SysRole
	db.Find(&roles)
	c.JSON(http.StatusOK, gin.H{"success": true, "data": roles})
}

func CreateRole(c *gin.Context) {
	var role SysRole
	c.ShouldBindJSON(&role)
	db := c.MustGet("db").(*gorm.DB)
	db.Create(&role)
	c.JSON(http.StatusOK, gin.H{"success": true, "data": role})
}

func UpdateRole(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 32)
	var role SysRole
	db := c.MustGet("db").(*gorm.DB)
	db.First(&role, id)
	c.ShouldBindJSON(&role)
	db.Save(&role)
	c.JSON(http.StatusOK, gin.H{"success": true, "data": role})
}

func DeleteRole(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 32)
	db := c.MustGet("db").(*gorm.DB)
	db.Delete(&SysRole{}, id)
	c.JSON(http.StatusOK, gin.H{"success": true, "message": "删除成功"})
}

func ListMenus(c *gin.Context) {
	db := c.MustGet("db").(*gorm.DB)
	var menus []SysMenu
	db.Order("sort ASC").Find(&menus)
	c.JSON(http.StatusOK, gin.H{"success": true, "data": menus})
}

func CreateMenu(c *gin.Context) {
	var menu SysMenu
	c.ShouldBindJSON(&menu)
	db := c.MustGet("db").(*gorm.DB)
	db.Create(&menu)
	c.JSON(http.StatusOK, gin.H{"success": true, "data": menu})
}

func UpdateMenu(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 32)
	var menu SysMenu
	db := c.MustGet("db").(*gorm.DB)
	db.First(&menu, id)
	c.ShouldBindJSON(&menu)
	db.Save(&menu)
	c.JSON(http.StatusOK, gin.H{"success": true, "data": menu})
}

func DeleteMenu(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 32)
	db := c.MustGet("db").(*gorm.DB)
	db.Delete(&SysMenu{}, id)
	c.JSON(http.StatusOK, gin.H{"success": true, "message": "删除成功"})
}

func ListDepts(c *gin.Context) {
	db := c.MustGet("db").(*gorm.DB)
	var depts []SysDept
	db.Order("sort ASC").Find(&depts)
	c.JSON(http.StatusOK, gin.H{"success": true, "data": depts})
}

func CreateDept(c *gin.Context) {
	var dept SysDept
	c.ShouldBindJSON(&dept)
	db := c.MustGet("db").(*gorm.DB)
	db.Create(&dept)
	c.JSON(http.StatusOK, gin.H{"success": true, "data": dept})
}

func UpdateDept(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 32)
	var dept SysDept
	db := c.MustGet("db").(*gorm.DB)
	db.First(&dept, id)
	c.ShouldBindJSON(&dept)
	db.Save(&dept)
	c.JSON(http.StatusOK, gin.H{"success": true, "data": dept})
}

func DeleteDept(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 32)
	db := c.MustGet("db").(*gorm.DB)
	db.Delete(&SysDept{}, id)
	c.JSON(http.StatusOK, gin.H{"success": true, "message": "删除成功"})
}

func GetUserByAppUserID(c *gin.Context) {
	appUserID := c.Query("appUserID")
	appID := c.GetUint("appID")
	db := c.MustGet("db").(*gorm.DB)
	var binding SysAppBinding
	if err := db.Where("app_id = ? AND app_user_id = ?", appID, appUserID).First(&binding).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "message": "用户未绑定"})
		return
	}
	var user SysUser
	db.First(&user, binding.UserID)
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"id":       user.ID,
			"username": user.Username,
			"nickname": user.Nickname,
			"phone":    user.Phone,
		},
	})
}

func RefreshToken(c *gin.Context) {
	userID := c.GetUint("userID")
	username := c.GetString("username")
	token, _ := GenerateToken(userID, username)
	c.JSON(http.StatusOK, gin.H{"success": true, "data": gin.H{"token": token}})
}
