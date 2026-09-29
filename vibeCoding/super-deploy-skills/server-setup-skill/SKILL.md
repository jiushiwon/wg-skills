---
name: server-setup-skill
description: 用于检测目标部署服务器的基础环境（OS、内核、内存、运行状态、当前目录）与运行时依赖（Java/Node.js/Python/Go/Docker/Nginx 等版本），并对比 deploy-profile.md 推断的项目需求，生成按 OS 区分的安装/补齐命令清单。支持「仅检测」与「执行安装」两种模式。当用户说「服务器环境检测」「server setup」「环境安装」「检测服务器依赖」时触发。
---

# Server Setup Skill

## Overview

本 skill 解决「项目要部署到某台服务器，但不知道服务器上缺什么环境」的问题。它读取 `deploy-detect-skill` 生成的 `deploy-profile.md`，检测目标服务器的 OS、已安装运行时版本，对比缺失项，生成幂等的安装命令清单。

默认行为是「只生成脚本/命令，不自动执行」；如用户明确要求执行安装，必须二次确认，且数据库初始化类操作永不自动执行。

## When to Use

触发词：

- `服务器环境检测`
- `server setup`
- `环境安装`
- `检测服务器依赖`
- `看看服务器缺什么`

前置依赖：建议先运行 `deploy-detect-skill` 生成 `deploy-profile.md`。如无画像，本 skill 仍可检测服务器基础环境，但无法判断「缺什么」。

## Workflow Summary

```
Phase 1: 读取 deploy-profile.md（如存在）
  → 提取需要运行时、数据库、缓存、反向代理需求

Phase 2: 检测目标服务器 OS
  → Ubuntu / Debian / CentOS / RHEL / Alpine / macOS / Windows Server
  → 确定包管理器（apt / yum / dnf / apk / brew / winget）

Phase 3: 检测已安装环境版本
  → java -version / node -v / python3 -V / go version
  → docker -v / docker compose version / nginx -v
  → psql / mysql / mongosh / redis-cli（按画像需求）

Phase 4: 对比缺失项
  → 画像需要 vs 服务器已有 = 缺失清单

Phase 5: 生成安装命令清单
  → 按 OS 输出对应包管理器命令
  → 每条命令必须幂等（已存在则跳过）
  → 区分「仅检测」与「执行安装」两种模式

Phase 6: 数据库单独处理
  → 生成安装 + 初始化命令，但默认不执行
  → 初始化（建库、建用户、导入 schema）必须用户手动确认
```

## Phase 1: 读取 deploy-profile.md

- 如画像存在：提取「需要运行时 / 数据库 / 缓存 / 消息队列 / 反向代理」。
- 如画像不存在：仅做基础环境检测，并提示用户先运行 `deploy-detect-skill`。

## Phase 2: 检测目标服务器 OS

按 `references/os-detection.md` 执行检测命令，输出：

- OS 名称与版本（如 Ubuntu 22.04 LTS）
- 内核版本（`uname -r` / `systeminfo`）
- CPU 架构（`uname -m`，影响部分安装包选择）
- 包管理器（apt / yum / dnf / apk / brew / winget）
- 当前用户与 sudo 权限

## Phase 3: 检测已安装环境版本

按画像需求逐项检测，记录「已安装 / 未安装 / 版本不符」：

| 组件 | 检测命令 |
|------|----------|
| Java | `java -version` / `javac -version` |
| Node.js | `node -v` / `npm -v` |
| Python | `python3 -V` / `pip3 -V` |
| Go | `go version` |
| Docker | `docker -v` / `docker compose version` |
| Nginx | `nginx -v` |
| PostgreSQL | `psql --version` / `pg_isready` |
| MySQL | `mysql --version` |
| MongoDB | `mongosh --version` |
| Redis | `redis-cli --version` / `redis-cli ping` |

### 3.1 运行状态检测

除「是否安装」外，还要检测「运行状态」（见 `references/os-detection.md` 的「运行状态检测」段）：

- 监听端口清单（`ss -tlnp` / `Get-NetTCPConnection`），与画像目标端口比对冲突。
- 运行中的服务（`systemctl list-units --state=running` / `Get-Service`）。
- 目标应用的老实例进程（`pgrep -af` / `Get-Process`），用于部署前优雅停止。
- 负载与资源占用（`uptime` / `vmstat` / `Get-Counter`），判断容量是否足够。

检测结果写入 `server-env-report.md` 的「运行状态」小节。

## Phase 4: 对比缺失项

输出对比表：

```markdown
| 组件 | 画像需求 | 服务器现状 | 状态 |
|------|----------|-----------|------|
| Node.js | 22 | 18 | 需升级 |
| PostgreSQL | 16 | 未安装 | 需安装 |
| Nginx | 是 | 已安装 1.24 | OK |
| Docker | 否 | 未安装 | 跳过 |
```

## Phase 5: 生成安装命令清单

按 `references/install-commands.md` 的模板生成命令。两种模式：

### 5.1 仅检测模式（默认）

- 只输出「如果执行，会跑这些命令」的清单。
- 不修改服务器状态。
- 用户可复制到目标服务器手动执行，或交给运维。

### 5.2 执行安装模式（需二次确认）

- 用户明确要求「直接装上」时进入。
- 进入前必须二次确认：「即将在 <OS> 上安装 <组件列表>，是否继续？」
- 每条命令幂等：先检测，已存在则跳过。
- 记录安装日志到 `server-setup-report.md`。

## Phase 6: 数据库单独处理

数据库是部署中最容易误伤数据的部分，规则更严格（详见 `references/database-setup.md`）：

- **安装**：生成命令，执行安装模式需二次确认。
- **初始化（建库/建用户/授权/导入 schema）**：永不自动执行；生成 SQL/脚本，由用户手动审查后逐项执行。
- **已存在数据库**：禁止执行 `DROP DATABASE`、`TRUNCATE`、`FLUSHALL` 等破坏性命令。
- **密码**：用 `read -s` 或环境变量传入，不进命令历史、不进脚本。
- 输出「数据库初始化清单」供用户逐项确认，并给出备份策略模板。

## Output: server-env-report.md

执行后生成报告：

```markdown
# 服务器环境报告

## 服务器信息
- OS：Ubuntu 22.04 LTS
- 内核：5.15.0-91-generic
- 内存：4 GB
- 当前目录：/srv/apps/my-api

## 缺失项
| 组件 | 画像需求 | 现状 | 建议命令 |
|------|----------|------|----------|
| Node.js | 22 | 18 | `curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash - && sudo apt install -y nodejs` |

## 数据库初始化清单（需手动确认）
- [ ] 创建数据库 `myapi_db`
- [ ] 创建用户 `app` 并授权
- [ ] 导入 `migrations/` 下 schema
```

## Assets（预置安装脚本）

本 skill 提供可直接拷贝到服务器运行的幂等安装脚本，统一遵循 `deploy-native-skill/references/script-standards.md` 的日志与退出码规范：

| 文件 | 平台 | 用法 |
|------|------|------|
| `assets/install.sh` | Linux（自动识别 apt/dnf/yum/apk） | `./install.sh <jdk\|node\|python\|go\|nginx\|docker> [--version X] [--yes]` |
| `assets/install.ps1` | Windows Server（winget/choco） | `.\install.ps1 <jdk\|node\|python\|go\|nginx\|docker> [-Version X]` |

特点：幂等（已装则跳过）、规范化日志（`[时间] [级别] 消息`，同步写 `/var/log/<app>/install.log`）、`curl\|sh` 类打印 WARN 提示审计、不含数据库初始化。

> Claude 生成安装方案时，默认直接引用这两个脚本并替换 `--version`；只有在目标环境不被脚本覆盖时（如 BSD、AIX）才回退到 `references/install-commands.md` 手工拼命令。

## Resources

- `references/os-detection.md` — OS 与内核版本检测、运行状态检测、包管理器映射
- `references/install-commands.md` — 各运行时在主流 OS 上的安装命令模板（幂等）
- `references/database-setup.md` — PostgreSQL/MySQL/MongoDB/Redis 的安装与初始化骨架（初始化手动执行）
- `assets/install.sh` / `assets/install.ps1` — 可运行的预置安装脚本（见上）

## Best Practices

- 默认只生成命令，不执行；执行必须二次确认。
- 所有安装命令必须幂等。
- 数据库初始化永不自动执行。
- 检测到 Windows Server 时，输出 PowerShell / winget 命令，但提示生产部署优先 Linux。
- 不使用 `curl | sh` 之外的不可审计安装方式；如必须，明确标注风险。
