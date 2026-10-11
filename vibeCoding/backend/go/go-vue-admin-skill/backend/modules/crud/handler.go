package crud

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func RegisterRouters(r *gin.RouterGroup, db *gorm.DB) {
	r.GET("/:module", func(c *gin.Context) { List(c, db, c.Param("module")) })
	r.GET("/:module/:id", func(c *gin.Context) { Get(c, db, c.Param("module"), c.Param("id")) })
	r.POST("/:module", func(c *gin.Context) { Create(c, db, c.Param("module")) })
	r.PUT("/:module/:id", func(c *gin.Context) { Update(c, db, c.Param("module"), c.Param("id")) })
	r.DELETE("/:module/:id", func(c *gin.Context) { Delete(c, db, c.Param("module"), c.Param("id")) })
}

func List(c *gin.Context, db *gorm.DB, module string) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("pageSize", "10"))
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"list":  []interface{}{},
			"total": 0,
			"page":  page,
			"size":  pageSize,
		},
	})
}

func Get(c *gin.Context, db *gorm.DB, module, id string) {
	c.JSON(http.StatusOK, gin.H{"success": true, "data": gin.H{"id": id}})
}

func Create(c *gin.Context, db *gorm.DB, module string) {
	var data map[string]interface{}
	c.ShouldBindJSON(&data)
	c.JSON(http.StatusOK, gin.H{"success": true, "data": data, "message": "创建成功"})
}

func Update(c *gin.Context, db *gorm.DB, module, id string) {
	var data map[string]interface{}
	c.ShouldBindJSON(&data)
	c.JSON(http.StatusOK, gin.H{"success": true, "data": data, "message": "更新成功"})
}

func Delete(c *gin.Context, db *gorm.DB, module, id string) {
	c.JSON(http.StatusOK, gin.H{"success": true, "message": "删除成功"})
}
