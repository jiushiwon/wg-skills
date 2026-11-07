# Java Install Skill

## 简介

Java 安装子技能，支持在 Ubuntu、CentOS、macOS、Windows 上安装指定版本的 JDK。

## 使用方式

### 触发方式

- "安装 Java"
- "装 Java"
- "install java"

### 交互流程

```
技能: 检测到 Ubuntu 22.04，apt 包管理器
请选择安装方式: A) apt 包管理器  B) Docker
请选择版本: A) Java 21  B) Java 17  C) Java 11
正在安装 openjdk-21-jdk...
✅ 安装完成！
验证命令: java -version
```

## 安装方式

### 包管理器（推荐）

| 操作系统 | 命令 |
|----------|------|
| Ubuntu/Debian | `sudo apt install openjdk-21-jdk` |
| CentOS/RHEL | `sudo dnf install java-21-openjdk` |
| macOS | `brew install openjdk@21` |
| Windows | `winget install OpenJDK.21` |

### Docker

```bash
# 拉取镜像
docker pull openjdk:21

# 运行
docker run -it --rm openjdk:21 java -version
```

## 版本说明

| 版本 | 类型 | 建议 |
|------|------|------|
| Java 21 | LTS | 新项目推荐 |
| Java 17 | LTS | 稳定项目 |
| Java 11 | 老 LTS | 老项目兼容 |

## 验证

```bash
# 查看版本
java -version

# 编译测试
javac -version

# 查看 JAVA_HOME
echo $JAVA_HOME
```

## 目录结构

```
java-install-skill/
├── SKILL.md
├── README.md
└── references/
    └── install-commands.md
```

## 注意事项

- 安装是幂等的，已安装会提示版本
- 需要 sudo/管理员权限
- Windows 建议使用 winget 或 chocolatey
