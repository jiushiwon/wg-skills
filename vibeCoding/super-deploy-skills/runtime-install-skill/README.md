# Runtime Install Skill（运行时安装父技能）

## 简介

运行时软件安装父技能，负责分发安装请求到对应的子技能。支持 Java、Python、Node.js、Go 的自动化安装。

## 使用方式

### 触发方式

直接告诉技能要安装什么运行时：

- "安装 Java" / "装 Java"
- "安装 Python" / "装 Python"
- "安装 Node.js" / "装 Node"
- "安装 Go" / "装 Go"

### 交互流程

1. **系统检测** — 自动检测当前系统（OS、版本、架构、包管理器）
2. **安装方式** — 询问选择包管理器安装还是 Docker 安装
3. **版本选择** — 显示可选版本，让用户选择
4. **执行安装** — 幂等安装，已安装则跳过
5. **输出结果** — 显示安装结果和验证命令

## 子技能

| 子技能 | 说明 |
|--------|------|
| [java-install-skill](children/java-install-skill/) | Java 安装 |
| [python-install-skill](children/python-install-skill/) | Python 安装 |
| [nodejs-install-skill](children/nodejs-install-skill/) | Node.js 安装 |
| [go-install-skill](children/go-install-skill/) | Go 安装 |

## 目录结构

```
runtime-install-skill/
├── SKILL.md                 # 本文件
├── README.md                # 使用说明
├── references/
│   ├── os-detection.md     # OS 检测逻辑
│   └── common-commands.md  # 通用命令模板
└── children/               # 子技能目录
    ├── java-install-skill/
    ├── python-install-skill/
    ├── nodejs-install-skill/
    └── go-install-skill/
```

## 示例

```
用户: 帮我装个 Java

技能:
  检测到: Ubuntu 22.04 LTS, apt 包管理器
  请选择安装方式: A) apt 包管理器  B) Docker
  请选择版本: A) Java 21  B) Java 17  C) Java 11
  正在安装 openjdk-21-jdk...
  ✅ 安装完成！验证命令: java -version
```

## 注意事项

- 安装是幂等的，已安装会提示并询问是否升级
- Docker 方式需要目标服务器已安装 Docker
- Windows 环境使用 winget 包管理器
