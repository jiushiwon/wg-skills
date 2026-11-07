@echo off
chcp 65001 >nul
rem Spring Boot 一键启动脚本（Windows）
rem 用法：restart.bat [dev|prod|stop|status]

setlocal
set MODE=%1
if "%MODE%"=="" set MODE=dev

set APP_PID_FILE=app.pid
set APP_LOG_DIR=logs

if not exist "%APP_LOG_DIR%" mkdir "%APP_LOG_DIR%"

if "%MODE%"=="dev" goto dev
if "%MODE%"=="prod" goto prod
if "%MODE%"=="stop" goto stop
if "%MODE%"=="status" goto status

echo 用法：%0 [dev^|prod^|stop^|status]
exit /b 1

:dev
echo 🚀 启动开发模式（热重载）...
if exist "%APP_PID_FILE%" (
    for /f %%i in (%APP_PID_FILE%) do (
        taskkill /F /PID %%i >nul 2>&1
    )
    del /f /q "%APP_PID_FILE%"
)
if not exist .env copy /Y .env.example .env >nul
start /B "" cmd /c "mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=dev > %APP_LOG_DIR%\dev.log 2>&1"
echo ✅ 开发模式已启动
echo 📄 实时日志：type %APP_LOG_DIR%\dev.log
echo 🌐 Swagger UI：http://localhost:8080/swagger-ui.html
goto :eof

:prod
echo 🏭 启动生产模式（后台运行）...
if exist "%APP_PID_FILE%" (
    for /f %%i in (%APP_PID_FILE%) do (
        taskkill /F /PID %%i >nul 2>&1
    )
    del /f /q "%APP_PID_FILE%"
)
if not exist .env copy /Y .env.example .env >nul
echo 📦 编译中...
call mvnw.cmd clean package -DskipTests -q
for /f "delims=" %%j in ('dir /b /od target\*.jar ^| findstr /v "\.original$"') do (
    set "JAR=target\%%j"
    goto runJar
)
:runJar
if not defined JAR (
    echo ❌ 未找到可执行 JAR，编译失败？
    exit /b 1
)
start /B "" cmd /c "java -jar %JAR% --spring.profiles.active=prod > %APP_LOG_DIR%\app.log 2>&1"
echo ✅ 生产模式已启动
echo 📄 实时日志：type %APP_LOG_DIR%\app.log
echo 🌐 服务地址：http://localhost:8080
goto :eof

:stop
if exist "%APP_PID_FILE%" (
    for /f %%i in (%APP_PID_FILE%) do (
        taskkill /F /PID %%i >nul 2>&1
        echo 🛑 已停止进程 %%i
    )
    del /f /q "%APP_PID_FILE%"
) else (
    echo ℹ️ 未运行
)
goto :eof

:status
if exist "%APP_PID_FILE%" (
    for /f %%i in (%APP_PID_FILE%) do (
        echo ✅ 运行中（PID %%i）
        goto :eof
    )
)
echo ❌ 未运行
goto :eof