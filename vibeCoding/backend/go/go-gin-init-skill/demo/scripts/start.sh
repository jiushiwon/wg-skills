#!/bin/bash
# 一键启动脚本
set -e
cd "$(dirname "$0")/.."

echo "==> 下载依赖"
go mod tidy

# JWT_SECRET 缺失会被 config.Load 直接拒绝启动；这里给一个演示用密钥
export JWT_SECRET="${JWT_SECRET:-wg-skills-demo-only-secret-change-me-32bytes}"

echo "==> 启动服务"
go run cmd/server/main.go
