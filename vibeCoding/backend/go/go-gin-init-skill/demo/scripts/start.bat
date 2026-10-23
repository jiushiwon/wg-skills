@echo off
chcp 65001 >nul
cd /d %~dp0\..

echo ===^> 下载依赖
go mod tidy

REM JWT_SECRET 缺失会被 config.Load 直接拒绝启动；这里给一个演示用密钥
if "%JWT_SECRET%"=="" set JWT_SECRET=wg-skills-demo-only-secret-change-me-32bytes

echo ===^> 启动服务
go run cmd/server/main.go

pause
