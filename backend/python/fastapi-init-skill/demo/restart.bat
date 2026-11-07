@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

set PROJECT_DIR=%~dp0
cd /d "%PROJECT_DIR%"

set MODE=dev
if not "%~1"=="" set MODE=%~1
set PORT=8080
if defined APP_PORT set PORT=%APP_PORT%
set VENV_DIR=%PROJECT_DIR%venv
set LOG_DIR=%PROJECT_DIR%logs
set PID_FILE=%PROJECT_DIR%app.pid

if "%MODE%"=="prod" (
    set LOG_FILE=%LOG_DIR%\app.log
    set WORKERS=2
    if defined APP_WORKERS set WORKERS=%APP_WORKERS%
) else (
    set LOG_FILE=%LOG_DIR%\dev.log
    set WORKERS=1
)

if not exist "%LOG_DIR%" mkdir "%LOG_DIR%"

echo ========================================
echo   一键重启 [%MODE%]
echo   端口：%PORT%
echo   日志：%LOG_FILE%
echo ========================================

:: 1. 拉取代码（可选）
where git >nul 2>nul
if !errorlevel! equ 0 (
    if exist "%PROJECT_DIR%.git" (
        echo [1/4] 拉取代码更新...
        git pull
        if !errorlevel! neq 0 echo   ! git pull 失败，将继续使用当前代码
    ) else (
        echo [1/4] 未检测到 git 仓库，跳过拉取
    )
) else (
    echo [1/4] 未安装 git，跳过拉取
)

:: 2. 安装/更新依赖
echo [2/4] 检查环境并安装依赖...
if not exist "%VENV_DIR%" (
    python -m venv "%VENV_DIR%"
    echo   虚拟环境已创建
)
call "%VENV_DIR%\Scripts\activate.bat"
pip install -r "%PROJECT_DIR%requirements.txt"
echo   依赖已更新

:: 3. 安全停止旧进程
echo [3/4] 安全停止旧进程...
if exist "%PID_FILE%" (
    for /f %%P in (%PID_FILE%) do (
        echo   停止旧进程 PID: %%P
        taskkill /PID %%P >nul 2>nul
        timeout /t 2 /nobreak >nul
        taskkill /PID %%P /F >nul 2>nul
    )
    del "%PID_FILE%"
)

for /f "tokens=5" %%A in ('netstat -ano ^| findstr ":%PORT%"') do (
    echo   端口 %PORT% 仍被占用，清理残留 PID: %%A
    taskkill /PID %%A /F >nul 2>nul
)
timeout /t 1 /nobreak >nul
echo   旧进程已清理

:: 4. 启动服务
echo [4/4] 启动服务...
if not exist "%PROJECT_DIR%.env" (
    if exist "%PROJECT_DIR%.env.example" (
        copy /y "%PROJECT_DIR%.env.example" "%PROJECT_DIR%.env" >nul
        echo   ! 已自动生成 .env，请编辑后重新启动
    )
)

if "%MODE%"=="prod" (
    start /b uvicorn app.main:app --host 0.0.0.0 --port %PORT% --workers %WORKERS% --limit-max-requests 10000 --limit-concurrency 100 --timeout-graceful-shutdown 30 --log-level info > "%LOG_FILE%" 2>&1
) else (
    start /b uvicorn app.main:app --host 0.0.0.0 --port %PORT% --reload --log-level info > "%LOG_FILE%" 2>&1
)

:: 5. 记录 PID
timeout /t 2 /nobreak >nul
set PID=
for /f "tokens=2 delims=," %%P in ('wmic process where "name='python.exe' and CommandLine like '%%app.main:app%%'" get ProcessId /format:csv 2^>nul ^| findstr "[0-9]"') do (
    echo %%P > "%PID_FILE%"
    set PID=%%P
    goto :started
)
:started

echo.
echo ========================================
echo   服务已启动 [%MODE%]
if defined PID echo   PID: %PID%
echo   Swagger: http://localhost:%PORT%/docs
echo   健康检查: http://localhost:%PORT%/api/health
echo.
echo   查看日志：
echo     type "%LOG_FILE%"            （查看全部）
echo     Get-Content "%LOG_FILE%" -Wait    （PowerShell 实时查看）
echo ========================================

pause