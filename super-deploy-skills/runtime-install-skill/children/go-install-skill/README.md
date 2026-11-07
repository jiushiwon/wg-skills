# Go Install Skill

## 简介

Go 安装子技能，支持在 Ubuntu、CentOS、macOS、Windows 上安装指定版本的 Go。

## 使用方式

### 触发方式

- "安装 Go"
- "装 Go"
- "install go"

### 交互流程

```
技能: 检测到 Ubuntu 22.04
请选择安装方式: A) 下载二进制  B) Docker
请选择版本: A) Go 1.21  B) Go 1.20  C) Go 1.19
正在下载并安装 go1.21.5...
✅ 安装完成！
验证命令: go version
```

## 安装方式

### 二进制（推荐）

| 操作系统 | 命令 |
|----------|------|
| Ubuntu/Debian | 下载官方二进制到 /usr/local |
| CentOS/RHEL | 下载官方二进制到 /usr/local |
| macOS | brew install go |
| Windows | winget install Golang.Go |

### Docker

```bash
docker pull golang:1.21
```

## 版本说明

| 版本 | 类型 | 建议 |
|------|------|------|
| Go 1.21 | 最新 | 新项目推荐 |
| Go 1.20 | 稳定 | 稳定项目 |
| Go 1.19 | 老 | 老项目 |

## 验证

```bash
go version
go env GOROOT
go env GOPATH
```

## 目录结构

```
go-install-skill/
├── SKILL.md
├── README.md
└── references/
    └── install-commands.md
```

## 注意事项

- 安装是幂等的，已安装会提示版本
- 官方二进制方式可获得最新版本
- 需要将 $GOPATH/bin 加入 PATH
- Docker 方式适合容器化部署
