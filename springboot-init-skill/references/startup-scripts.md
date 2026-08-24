# 启动脚本模板

生成项目时直接落地两个脚本：`restart.sh`（Linux / macOS）和 `restart.bat`（Windows）。两条命令完成开发/生产模式切换、PID 管理、安全重启。

## 设计原则

1. **一条命令 = 一个完整生命周期**：`./restart.sh dev` = 环境检查 + 安全停旧 + 启动 + 输出日志命令
2. **PID 管理**：进程 ID 写入 `app.pid`，重启时先安全停止旧进程
3. **UTF-8**：`.bat` 必须保存为 UTF-8 with BOM + CRLF（中文注释兼容 Windows CMD），由 `scripts/generate_project.py` 强制处理
4. **dev / prod 双模式**：
   - `dev`：直接 `mvnw spring-boot:run`（含 devtools 热重载），日志 `logs/dev.log`
   - `prod`：先 `mvnw clean package` → 后台 `java -jar`，日志 `logs/app.log`
5. **额外指令**：`stop` 停进程，`status` 看状态

### restart.sh

```bash
#!/usr/bin/env bash
# Spring Boot 一键启动脚本（Linux / macOS）
# 用法：./restart.sh [dev|prod|stop|status]

set -euo pipefail

MODE="${1:-dev}"
APP_PID_FILE="app.pid"
APP_LOG_DIR="logs"

mkdir -p "$APP_LOG_DIR"

stop_old() {
  if [ -f "$APP_PID_FILE" ]; then
    OLD_PID=$(cat "$APP_PID_FILE")
    if ps -p "$OLD_PID" > /dev/null 2>&1; then
      echo "🛑 停止旧进程 $OLD_PID"
      kill "$OLD_PID" 2>/dev/null || true
      sleep 2
      # 强杀兜底
      kill -9 "$OLD_PID" 2>/dev/null || true
    fi
    rm -f "$APP_PID_FILE"
  fi
}

ensure_env() {
  if [ ! -f .env ]; then
    cp .env.example .env
    echo "📝 已从 .env.example 复制生成 .env"
  fi
}

case "$MODE" in
  dev)
    echo "🚀 启动开发模式（热重载）..."
    ensure_env
    stop_old
    # 后台启动并写入 PID
    nohup ./mvnw spring-boot:run \
      -Dspring-boot.run.profiles=dev \
      > "$APP_LOG_DIR/dev.log" 2>&1 &
    PID=$!
    echo $PID > "$APP_PID_FILE"
    echo "✅ 开发模式已启动（PID $PID）"
    echo "📄 实时日志：tail -f $APP_LOG_DIR/dev.log"
    echo "🌐 Swagger UI：http://localhost:8080/swagger-ui.html"
    ;;

  prod)
    echo "🏭 启动生产模式（后台运行）..."
    ensure_env
    stop_old
    echo "📦 编译中..."
    ./mvnw clean package -DskipTests -q
    JAR=$(ls -t target/*.jar 2>/dev/null | grep -v "\\.original$" | head -1)
    if [ -z "$JAR" ]; then
      echo "❌ 未找到可执行 JAR（target/*.jar），编译失败？"
      exit 1
    fi
    echo "🚀 启动 $JAR"
    nohup java -jar "$JAR" --spring.profiles.active=prod \
      > "$APP_LOG_DIR/app.log" 2>&1 &
    PID=$!
    echo $PID > "$APP_PID_FILE"
    echo "✅ 生产模式已启动（PID $PID）"
    echo "📄 实时日志：tail -f $APP_LOG_DIR/app.log"
    echo "🌐 服务地址：http://localhost:8080"
    ;;

  stop)
    stop_old
    echo "✅ 已停止"
    ;;

  status)
    if [ -f "$APP_PID_FILE" ] && ps -p "$(cat "$APP_PID_FILE")" > /dev/null 2>&1; then
      echo "✅ 运行中（PID $(cat "$APP_PID_FILE")）"
    else
      echo "❌ 未运行"
    fi
    ;;

  *)
    echo "用法：$0 [dev|prod|stop|status]"
    exit 1
    ;;
esac
```

### restart.bat

> 编码必须 UTF-8 with BOM + CRLF，由 `scripts/generate_project.py` 写入时强制处理。
> 中文 emoji 在 chcp 65001 下正常显示。

```batch
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
```

## 编码与 BOM 处理

`scripts/generate_project.py` 写入 `restart.bat` 时必须：

```python
content = template.replace('{{project}}', project_name)
# UTF-8 with BOM（Windows CMD 中文注释必需）
with open(target_path, 'w', encoding='utf-8-sig', newline='') as f:
    f.write(content)
# 强制 CRLF（Windows 脚本规范）
with open(target_path, 'rb') as f:
    data = f.read()
with open(target_path, 'wb') as f:
    f.write(data.replace(b'\r\n', b'\n').replace(b'\n', b'\r\n'))
```

## 可执行权限

生成完成后，Linux / macOS 必须 `chmod +x restart.sh`，由 `scripts/generate_project.py` 自动执行：

```python
os.chmod(target_sh, 0o755)
```