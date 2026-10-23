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
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

// demoAccount 演示账号，首次启动时自动播种
const (
	demoUsername = "admin"
	demoPassword = "admin123"
)

func main() {
	// 加载配置（JWT_SECRET 缺失或过短直接退出）
	cfg := config.Load()

	// 初始化数据库（SQLite 零依赖）
	db, err := gorm.Open(sqlite.Open(cfg.DBPath), &gorm.Config{})
	if err != nil {
		log.Fatal("数据库连接失败: ", err)
	}
	if err := db.AutoMigrate(&model.User{}); err != nil {
		log.Fatal("数据库迁移失败: ", err)
	}
	if err := seedDemoUser(db); err != nil {
		log.Fatal("演示账号初始化失败: ", err)
	}

	// 装配链路：repository -> service -> handler
	userRepo := repository.NewUserRepository(db)
	userSvc := service.NewUserService(userRepo)
	userHandler := handler.NewUserHandler(userSvc)
	authHandler := handler.NewAuthHandler(cfg.JWTSecret, userSvc)

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

// seedDemoUser 首次启动播种演示账号，密码只存 bcrypt 哈希（不可逆）
func seedDemoUser(db *gorm.DB) error {
	var count int64
	if err := db.Model(&model.User{}).Where("username = ?", demoUsername).Count(&count).Error; err != nil {
		return err
	}
	if count > 0 {
		return nil
	}
	hash, err := bcrypt.GenerateFromPassword([]byte(demoPassword), 12)
	if err != nil {
		return err
	}
	return db.Create(&model.User{
		Username:     demoUsername,
		Nickname:     "管理员",
		PasswordHash: string(hash),
		Status:       1,
	}).Error
}
