package main

import (
	"log"

	"demo/internal/handler"
	"demo/internal/model"
	"demo/internal/repository"
	"demo/internal/service"
	"demo/pkg/config"
	"demo/pkg/middleware"

	"github.com/gin-gonic/gin"
	"github.com/glebarez/sqlite"
	"gorm.io/gorm"
)

func main() {
	// 加载配置
	cfg := config.Load()

	// 初始化数据库（SQLite 零依赖）
	db, err := gorm.Open(sqlite.Open(cfg.DBPath), &gorm.Config{})
	if err != nil {
		log.Fatal("数据库连接失败: ", err)
	}
	if err := db.AutoMigrate(&model.User{}); err != nil {
		log.Fatal("数据库迁移失败: ", err)
	}

	// 装配链路：repository -> service -> handler
	userRepo := repository.NewUserRepository(db)
	userSvc := service.NewUserService(userRepo)
	userHandler := handler.NewUserHandler(userSvc)
	authHandler := handler.NewAuthHandler(cfg.JWTSecret)

	// 路由
	r := gin.Default()
	r.Use(middleware.CORS())
	r.Use(middleware.Logger())

	// 公开接口
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})
	r.POST("/api/auth/login", authHandler.Login)

	// 受保护接口
	api := r.Group("/api")
	api.Use(middleware.JWT(cfg.JWTSecret))
	{
		api.GET("/users", userHandler.List)
		api.POST("/users", userHandler.Create)
		api.GET("/users/:id", userHandler.Get)
		api.PUT("/users/:id", userHandler.Update)
		api.DELETE("/users/:id", userHandler.Delete)
	}

	log.Printf("服务启动: http://localhost:%s", cfg.Port)
	if err := r.Run(":" + cfg.Port); err != nil {
		log.Fatal("服务异常退出: ", err)
	}
}
