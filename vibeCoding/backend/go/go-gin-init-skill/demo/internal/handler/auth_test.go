package handler

import (
	"testing"

	"golang.org/x/crypto/bcrypt"
)

func TestVerifyPassword(t *testing.T) {
	hash, err := bcrypt.GenerateFromPassword([]byte("admin123"), bcrypt.DefaultCost)
	if err != nil {
		t.Fatalf("生成哈希失败: %v", err)
	}
	if !verifyPassword(string(hash), "admin123") {
		t.Fatal("正确密码应校验通过")
	}
	if verifyPassword(string(hash), "admin1234") {
		t.Fatal("错误密码不应通过")
	}
	if verifyPassword("", "admin123") {
		t.Fatal("空哈希不应通过")
	}
}
