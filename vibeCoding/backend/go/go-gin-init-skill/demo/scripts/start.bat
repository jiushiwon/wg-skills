@echo off
chcp 65001 >nul
cd /d %~dp0\..

echo ===^> 下载依赖
go mod tidy

echo ===^> 启动服务
go run cmd/server/main.go

pause
