# Node.js Install Skill

## 简介

Node.js 安装子技能，支持在 Ubuntu、CentOS、macOS、Windows 上安装指定版本的 Node.js。

## 使用方式

### 触发方式

- "安装 Node.js"
- "装 Node"
- "装 Nodejs"
- "install nodejs"

### 交互流程

```
技能: 检测到 Ubuntu 22.04，apt 包管理器
请选择安装方式: A) apt 包管理器  B) Docker
请选择版本: A) Node.js 20 LTS  B) Node.js 18  C) Node.js 16
正在安装 nodejs...
✅ 安装完成！
验证命令: node -v, npm -v
```

## 安装方式

### 包管理器（推荐）

| 操作系统 | 命令 |
|----------|------|
| Ubuntu/Debian | Nodesource + apt |
| CentOS/RHEL | Nodesource + dnf |
| macOS | brew install node@20 |
| Windows | winget install NodeJS.20 |

### Docker

```bash
docker pull node:20
```

## 版本说明

| 版本 | 类型 | 建议 |
|------|------|------|
| Node.js 20 | LTS | 新项目推荐 |
| Node.js 18 | LTS | 稳定项目 |
| Node.js 16 | 维护 | 老项目 |

## 验证

```bash
node -v
npm -v
which node
```

## 目录结构

```
nodejs-install-skill/
├── SKILL.md
├── README.md
└── references/
    └── install-commands.md
```

## 注意事项

- 安装是幂等的，已安装会提示版本
- Nodesource 仓库安装的 nodejs 包同时包含 npm
- 需要 sudo/管理员权限
- Windows 建议使用 winget
