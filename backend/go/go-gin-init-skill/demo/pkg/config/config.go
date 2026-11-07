package config

import (
	"fmt"
	"log"
	"os"
)

// MinJWTSecretLen HS256 要求密钥至少 256 位（32 字节）
const MinJWTSecretLen = 32

// Config 全局配置
type Config struct {
	Port      string
	JWTSecret string
	DBPath    string
}

// Load 加载配置。JWT_SECRET 缺失或过短直接退出——宁可启动失败，也不要带着弱密钥上线。
func Load() *Config {
	secret := os.Getenv("JWT_SECRET")
	if err := ValidateJWTSecret(secret); err != nil {
		log.Fatal(err)
	}
	return &Config{
		Port:      getEnv("PORT", "8080"),
		JWTSecret: secret,
		DBPath:    getEnv("DB_PATH", "data.db"),
	}
}

// ValidateJWTSecret 校验 JWT 签名密钥强度
func ValidateJWTSecret(secret string) error {
	if secret == "" {
		return fmt.Errorf("JWT_SECRET 缺失，拒绝启动。请设置一个至少 %d 字节的随机密钥，例如：export JWT_SECRET=$(openssl rand -base64 48)", MinJWTSecretLen)
	}
	if len(secret) < MinJWTSecretLen {
		return fmt.Errorf("JWT_SECRET 短于 %d 字节，拒绝启动", MinJWTSecretLen)
	}
	return nil
}

func getEnv(k, def string) string {
	if v := os.Getenv(k); v != "" {
		return v
	}
	return def
}
