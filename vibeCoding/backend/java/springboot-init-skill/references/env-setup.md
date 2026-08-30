# 环境探测流程

生成项目前必须按本流程探测用户环境，缺失则给出明确提示。

## 探测项

### 1. JDK 是否安装 + 版本（>= 17 LTS）

```bash
if command -v java >/dev/null 2>&1; then
  VERSION=$(java -version 2>&1 | head -1 | awk -F '"' '{print $2}')
  MAJOR=$(echo "$VERSION" | awk -F. '{ if ($1 == 1 && $2 != 0) print $1.$2; else print $1 }')
  if [ "${MAJOR%.*}" -ge 17 ]; then
    echo "✅ JDK $VERSION"
  else
    echo "⚠️ JDK 版本过低（$VERSION），需要 >= 17 LTS"
  fi
else
  echo "❌ 未检测到 JDK"
fi
```

未安装 / 版本过低时的提示：

```
❌ 未检测到 JDK 17+

Spring Boot 3.x 要求 JDK 17 LTS 及以上。

推荐下载：
- Adoptium Temurin:  https://adoptium.net/
- Oracle JDK:        https://www.oracle.com/java/technologies/downloads/
- Azul Zulu:         https://www.azul.com/downloads/

Windows 安装后请设置 JAVA_HOME 环境变量：
  setx JAVA_HOME "C:\Program Files\Eclipse Adoptium\jdk-21.x.x"
  setx PATH "%PATH%;%JAVA_HOME%\bin"
```

### 2. Maven 是否可用

```bash
if [ -f mvnw ] || [ -f mvnw.cmd ]; then
  echo "✅ Maven Wrapper 已就绪"
elif command -v mvn >/dev/null 2>&1; then
  MVN_VERSION=$(mvn --version 2>&1 | head -1)
  echo "✅ $MVN_VERSION"
else
  echo "⚠️ 未检测到 Maven，将生成 Maven Wrapper（无需本机安装）"
fi
```

**关键**：本 skill 不强制要求用户预装 Maven。`mvnw` / `mvnw.cmd` 会随项目生成，运行 `./mvnw` 时会自动下载指定 Maven 版本。

### 3. 操作系统

```bash
case "$(uname -s 2>/dev/null || echo Windows)" in
  Linux*)   OS=linux ;;
  Darwin*)  OS=macos ;;
  CYGWIN*|MINGW*|MSYS*) OS=windows ;;
  *)        OS=unknown ;;
esac
echo "🖥️  操作系统：$OS"
```

按平台决定生成哪些启动脚本（`restart.sh` + `restart.bat` 都生成，但 `restart.sh` 在 Windows 上意义不大）。

### 4. Docker（可选）

```bash
if command -v docker >/dev/null 2>&1; then
  echo "✅ Docker 已安装（可一键启动数据库）"
else
  echo "ℹ️ 未安装 Docker（数据库需自行启动或不使用）"
fi
```

未安装 Docker 时：
- 不阻塞项目生成
- 仅警告
- 用户需自行安装 MySQL / PostgreSQL / MongoDB，或选择「无数据库」模式

## 探测结果汇总模板

生成项目前向用户输出：

```
🔍 环境探测结果：

✅ JDK 21.0.1 (>= 17)
✅ Maven Wrapper（将自动生成）
✅ Docker 27.0（可一键启动数据库）
🖥️  操作系统：Windows 11

📦 数据库选择：
   - 如选 MySQL：将自动 docker-compose up -d 启动容器
   - 如不选 Docker：请确认本机已安装对应数据库

🚀 准备生成项目 {{project}} ...
```

## 常见排错

### Q: Maven Wrapper 下载慢？

A: 配置 Maven 镜像：

```bash
# ~/.m2/settings.xml
<mirrors>
  <mirror>
    <id>aliyun</id>
    <name>Aliyun Maven Mirror</name>
    <url>https://maven.aliyun.com/repository/public</url>
    <mirrorOf>central</mirrorOf>
  </mirror>
</mirrors>
```

### Q: `mvnw` 报 JAVA_HOME 未设置？

A: 显式声明：

```bash
# Linux / macOS
export JAVA_HOME=/path/to/jdk-21
./mvnw spring-boot:run

# Windows
set JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-21
mvnw.cmd spring-boot:run
```

### Q: 端口 8080 被占用？

A: 修改 `.env` 中 `SERVER_PORT=8081`，Spring Boot 自动重新加载。