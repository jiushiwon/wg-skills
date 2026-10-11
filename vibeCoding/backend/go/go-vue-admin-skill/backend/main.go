package main

import (
	"log"
	"os"

	"go-vue-admin-skill/backend/middleware"
	"go-vue-admin-skill/backend/modules/auth"
	"go-vue-admin-skill/backend/modules/crud"

	"github.com/gin-gonic/gin"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func main() {
	db, err := gorm.Open(sqlite.Open("data.db"), &gorm.Config{})
	if err != nil {
		log.Fatal("数据库连接失败:", err)
	}

	db.AutoMigrate(
		&auth.SysUser{},
		&auth.SysRole{},
		&auth.SysMenu{},
		&auth.SysDept{},
		&auth.SysApp{},
		&auth.SysAppKey{},
		&auth.SysAppBinding{},
		&auth.SysBindCode{},
	)

	r := gin.Default()
	r.Use(middleware.Cors())
	r.Use(middleware.JWT())

	r.POST("/api/auth/login", auth.Login)
	r.POST("/api/auth/register", auth.Register)
	r.POST("/api/auth/refresh", auth.RefreshToken)

	authGroup := r.Group("/api")
	authGroup.Use(middleware.RequireAuth())
	{
		authGroup.GET("/auth/me", auth.Me)
		authGroup.PUT("/auth/password", auth.ChangePassword)
		authGroup.GET("/roles", auth.ListRoles)
		authGroup.POST("/roles", auth.CreateRole)
		authGroup.PUT("/roles/:id", auth.UpdateRole)
		authGroup.DELETE("/roles/:id", auth.DeleteRole)
		authGroup.GET("/menus", auth.ListMenus)
		authGroup.POST("/menus", auth.CreateMenu)
		authGroup.PUT("/menus/:id", auth.UpdateMenu)
		authGroup.DELETE("/menus/:id", auth.DeleteMenu)
		authGroup.GET("/depts", auth.ListDepts)
		authGroup.POST("/depts", auth.CreateDept)
		authGroup.PUT("/depts/:id", auth.UpdateDept)
		authGroup.DELETE("/depts/:id", auth.DeleteDept)
		crudGroup := authGroup.Group("/crud")
		{
			crud.RegisterRouters(crudGroup, db)
		}
	}

	openGroup := r.Group("/api/open")
	openGroup.Use(middleware.AppAuth())
	{
		openGroup.GET("/user/info", auth.GetUserByAppUserID)
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	log.Printf("服务启动: http://localhost:%s", port)
	r.Run(":" + port)
}
