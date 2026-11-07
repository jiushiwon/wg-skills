package main

import (
	"fmt"
	"log"
	"net"
	"os"

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

const demoUsername = "admin"

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
	if err := prepareDemoUser(db, os.Getenv("DEMO_ADMIN_PASSWORD")); err != nil {
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
	if err := r.Run(net.JoinHostPort("127.0.0.1", cfg.Port)); err != nil {
		log.Fatal("服务异常退出: ", err)
	}
}

// prepareDemoUser 只在显式提供凭据时创建本地演示账号。
func prepareDemoUser(db *gorm.DB, password string) error {
	var user model.User
	err := db.Where("username = ?", demoUsername).Take(&user).Error
	switch err {
	case nil:
		if bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte("admin123")) == nil {
			return fmt.Errorf("检测到旧版固定管理员密码，请先离线迁移现有数据或为 DB_PATH 指定新的演示库")
		}
		return nil
	case gorm.ErrRecordNotFound:
		// 只有新库或尚未创建管理员的数据库需要初始化。
	default:
		return err
	}

	if password == "" {
		return nil
	}
	if len(password) < 12 || len(password) > 72 {
		return fmt.Errorf("DEMO_ADMIN_PASSWORD 必须为 12 到 72 字节")
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(password), 12)
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
