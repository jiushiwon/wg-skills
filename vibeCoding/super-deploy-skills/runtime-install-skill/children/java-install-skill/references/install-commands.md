# Java 安装命令参考

## Ubuntu/Debian

### 安装命令

```bash
# 更新包索引
sudo apt update

# 安装 OpenJDK 21
sudo apt install -y openjdk-21-jdk

# 安装 OpenJDK 17
sudo apt install -y openjdk-17-jdk

# 安装 OpenJDK 11
sudo apt install -y openjdk-11-jdk
```

### 设置 JAVA_HOME

```bash
# 查找安装路径
readlink -f $(which java)

# 对于 OpenJDK 21，路径通常是 /usr/lib/jvm/java-21-openjdk-amd64
export JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64
export PATH=$JAVA_HOME/bin:$PATH

# 持久化（写入 ~/.bashrc 或 /etc/profile）
echo "export JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64" >> ~/.bashrc
echo "export PATH=\$JAVA_HOME/bin:\$PATH" >> ~/.bashrc
source ~/.bashrc
```

## CentOS/RHEL

### 安装命令

```bash
# 安装 OpenJDK 21
sudo dnf install -y java-21-openjdk java-21-openjdk-devel

# 安装 OpenJDK 17
sudo dnf install -y java-17-openjdk java-17-openjdk-devel

# 安装 OpenJDK 11
sudo dnf install -y java-11-openjdk java-11-openjdk-devel
```

### 设置 JAVA_HOME

```bash
# 查找路径
/usr/lib/jvm/java-21-openjdk

export JAVA_HOME=/usr/lib/jvm/java-21-openjdk
export PATH=$JAVA_HOME/bin:$PATH

# 持久化
echo "export JAVA_HOME=/usr/lib/jvm/java-21-openjdk" >> ~/.bashrc
echo "export PATH=\$JAVA_HOME/bin:\$PATH" >> ~/.bashrc
```

## macOS

### 安装命令

```bash
# 使用 Homebrew
brew install openjdk@21

# 链接
sudo ln -sfn $(brew --prefix)/opt/openjdk@21/libexec/openjdk.jdk /Library/Java/JavaVirtualMachines/openjdk-21.jdk
```

### 设置 JAVA_HOME

```bash
export JAVA_HOME=$(/usr/libexec/java_home -v 21)
export PATH=$JAVA_HOME/bin:$PATH
```

## Windows

### 安装命令（winget）

```powershell
# 使用 winget
winget install OpenJDK.21

# 或指定版本
winget install OpenJDK.17
```

### 手动配置

1. 右键"此电脑" → 属性 → 高级系统设置 → 环境变量
2. 新建系统变量：
   - 变量名：`JAVA_HOME`
   - 变量值：`C:\Program Files\Eclipse Adoptium\jdk-21.xxx-xx-xx`
3. 编辑 PATH，添加：`%JAVA_HOME%\bin`

### PowerShell 检测

```powershell
# 检测已安装
Get-Command java -ErrorAction SilentlyContinue

# 查看版本
java -version
```

## Docker 方式

### 拉取镜像

```bash
# 指定版本
docker pull openjdk:21
docker pull openjdk:17
docker pull openjdk:11

# 带 JDK 的镜像（用于编译）
docker pull openjdk:21-slim
docker pull eclipse-temurin:21-jdk
```

### 运行容器

```bash
# 交互式
docker run -it openjdk:21 /bin/bash

# 运行 Java 程序
docker run -v /path/to/app:/app openjdk:21 java -jar /app/app.jar
```

### Docker Compose

```yaml
version: '3.8'
services:
  java-app:
    image: eclipse-temurin:21-jdk
    volumes:
      - ./app:/app
    working_dir: /app
    command: java -jar app.jar
```

## 卸载命令

### Ubuntu/Debian

```bash
sudo apt remove --purge -y openjdk-21-jdk openjdk-21-jdk-headless
sudo apt autoremove
```

### CentOS/RHEL

```bash
sudo dnf remove -y java-21-openjdk java-21-openjdk-devel
```

### macOS

```bash
brew uninstall openjdk@21
sudo rm -rf /Library/Java/JavaVirtualMachines/openjdk-21.jdk
```

## 常见问题

### Q: java 命令找不到

A: 检查 JAVA_HOME 是否设置正确，确保 `$JAVA_HOME/bin` 在 PATH 中

### Q: 多个 Java 版本共存

A: 使用 `update-alternatives` 切换默认版本：
```bash
sudo update-alternatives --config java
```

### Q: Maven/Gradle 使用错误版本

A: 设置 `MAVEN_HOME` 或 `GRADLE_HOME`，或在项目指定 JAVA_HOME
