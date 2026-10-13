package config

import "os"

// Config 全局配置
type Config struct {
	Port      string
	JWTSecret string
	DBPath    string
}

func Load() *Config {
	return &Config{
		Port:      getEnv("PORT", "8080"),
		JWTSecret: getEnv("JWT_SECRET", "wg-skills-secret"),
		DBPath:    getEnv("DB_PATH", "data.db"),
	}
}

func getEnv(k, def string) string {
	if v := os.Getenv(k); v != "" {
		return v
	}
	return def
}
