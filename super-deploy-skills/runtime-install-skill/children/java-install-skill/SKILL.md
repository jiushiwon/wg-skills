---
name: java-install-skill
description: Java 安装子技能。支持 apt/dnf/Docker 方式安装指定版本的 JDK，幂等检测，已安装则提示。当用户说「安装 Java」「装 Java」时触发。
---

# Java Install Skill

## Overview

本技能负责在目标服务器上安装 Java（JDK）。支持多种安装方式，幂等检测。

## When to Use

触发词：

- 安装 Java
- 装 Java
- install java

## 交互流程

```
1. 检测当前系统（OS + 版本 + 包管理器）
2. 询问安装方式（包管理器 / Docker）
3. 询问版本（21 / 17 LTS / 11）
4. 检测是否已安装
5. 执行安装（幂等）
6. 输出验证命令
```

## 安装方式

### 包管理器安装

| OS | 安装命令 |
|----|----------|
| Ubuntu/Debian | `apt install openjdk-21-jdk` |
| CentOS/RHEL | `dnf install java-21-openjdk` |
| macOS | `brew install openjdk@21` |
| Windows | `winget install OpenJDK.21` |

### Docker 安装

```bash
docker pull openjdk:21
docker run -d --name java-runtime -v /app:/app openjdk:21 java -jar /app/app.jar
```

## 版本选择

- Java 21（最新 LTS）
- Java 17（LTS，稳定）
- Java 11（老项目兼容）

## 幂等检测

```bash
# 检测是否已安装
java -version 2>&1 | head -1

# 检测指定版本
java -version 2>&1 | grep "21"
```

## 输出

```markdown
# Java 安装完成

## 系统信息
- OS: Ubuntu 22.04 LTS
- 包管理器: apt

## 安装结果
- 版本: OpenJDK 21
- 安装方式: apt
- 状态: ✅ 已安装

## 验证命令
java -version
javac -version
echo $JAVA_HOME
```

## Resources

- [references/install-commands.md](references/install-commands.md) — 各 OS 安装命令
