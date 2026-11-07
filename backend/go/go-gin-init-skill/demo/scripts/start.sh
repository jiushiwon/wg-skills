#!/bin/bash
# 一键启动脚本
set -e
cd "$(dirname "$0")/.."

echo "==> 下载依赖"
go mod download

echo "==> 启动服务"
go run cmd/server/main.go
