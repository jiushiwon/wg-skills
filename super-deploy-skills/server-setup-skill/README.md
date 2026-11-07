# server-setup-skill

一个用于 **检测服务器环境并补齐部署依赖** 的 Claude Skill。读取 `deploy-profile.md`，检测目标服务器的 OS、内核、内存、运行时版本，对比缺失项，生成按 OS 区分的安装命令清单。

---

## 它能做什么

当你说：

- 「服务器环境检测」
- 「server setup」
- 「环境安装」
- 「看看服务器缺什么」

这个 Skill 会检测目标服务器的基础环境和运行时版本，告诉你「项目画像需要 X，服务器现状是 Y，缺 Z」，并生成可执行的安装命令清单。

---

## 它解决了什么问题

| 问题 | 解决方案 |
|------|----------|
| 不知道服务器是否装了 Java/Node/Python/Go | 逐项检测版本，输出对比表 |
| 不同 Linux 发行版安装命令不同 | 按 OS 自动选择 apt / yum / dnf / apk / brew / winget |
| 误装已有组件浪费时间 | 命令幂等，已存在则跳过 |
| 数据库初始化误删数据 | 初始化永不自动执行，需手动确认 |
| Windows Server 与 Linux 命令混淆 | 按 OS 输出对应脚本，并提示生产优先 Linux |

---

## 支持检测的 OS

| OS | 检测命令 | 包管理器 |
|----|----------|----------|
| Ubuntu / Debian | `cat /etc/os-release` | apt |
| CentOS / RHEL | `cat /etc/redhat-release` | yum / dnf |
| Alpine | `cat /etc/alpine-release` | apk |
| macOS | `sw_vers` | brew |
| Windows Server | `systeminfo` | winget / chocolatey |

---

## 检测项目清单

- 内核版本、CPU 架构、内存、磁盘
- 当前目录、当前用户、sudo 权限
- 已安装运行时版本：Java / Node.js / Python / Go
- 容器：Docker / docker compose
- 反向代理：Nginx
- 数据库（按画像需求）：PostgreSQL / MySQL / MongoDB / Redis
- **运行状态**：监听端口、运行中的服务、目标应用老实例进程、负载与资源占用

---

## 使用方式

```
服务器环境检测
```

或自然语言：

```
看看这台服务器缺什么环境
帮我检测下服务器能不能跑这个项目
```

### 六阶段流程

```
Phase 1: 读取 deploy-profile.md（如有）
Phase 2: 检测 OS + 包管理器
Phase 3: 检测已安装运行时版本
Phase 4: 对比画像需求 vs 服务器现状
Phase 5: 生成安装命令清单（仅检测 / 执行安装 两种模式）
Phase 6: 数据库单独处理（生成命令，不自动初始化）
```

---

## 两种模式

| 模式 | 行为 | 何时用 |
|------|------|--------|
| 仅检测（默认） | 只输出命令清单，不改服务器 | 想先看缺什么、或交给运维执行 |
| 执行安装 | 二次确认后执行幂等安装 | 明确要立刻补齐环境 |

---

## 输出报告

执行后生成 `server-env-report.md`，包含：

- 服务器基础信息
- 缺失项对比表
- 建议安装命令
- 数据库初始化清单（需手动确认）

---

## 预置安装脚本（可直接运行）

`assets/` 提供幂等安装脚本，遵循统一日志与退出码规范（`script-standards.md`）：

```bash
# Linux（自动识别 apt/dnf/yum/apk）
chmod +x assets/install.sh
./assets/install.sh jdk --version 17
./assets/install.sh node --version 22
./assets/install.sh python --version 3.11
./assets/install.sh go --version 1.22
./assets/install.sh nginx
./assets/install.sh docker
```

```powershell
# Windows Server（winget/choco，需管理员 PowerShell）
.\assets\install.ps1 jdk -Version 17
.\assets\install.ps1 node
.\assets\install.ps1 nginx
```

特性：已装则跳过、日志写 `/var/log/<app>/install.log`（Windows: `C:\var\log\<app>\install.log`）、`curl|sh` 类打印 WARN、不含数据库初始化。

---

## 目录结构

```
server-setup-skill/
├── SKILL.md                         # 技能定义：触发条件、六阶段流程
├── README.md                        # 本文件
├── assets/
│   ├── install.sh                   # Linux 幂等安装脚本（jdk/node/python/go/nginx/docker）
│   └── install.ps1                  # Windows 幂等安装脚本
└── references/
    ├── os-detection.md              # OS 与内核检测、运行状态检测、包管理器映射
    ├── install-commands.md          # 各运行时主流 OS 安装命令模板
    └── database-setup.md            # 数据库安装与初始化骨架（初始化手动执行）
```

---

## 与上游/下游 Skill 的关系

- 上游：[deploy-detect-skill](../deploy-detect-skill/) 提供 `deploy-profile.md`。
- 下游：[deploy-native-skill](../deploy-native-skill/) 或 [deploy-docker-skill](../deploy-docker-skill/) 在环境就绪后生成部署脚本。

---

## 注意事项

1. **默认不执行**：本 Skill 默认只输出命令，不修改服务器。
2. **二次确认**：执行安装模式必须确认「即将安装 X，是否继续」。
3. **数据库安全**：初始化（建库/建用户/导入 schema）永不自动执行。
4. **幂等**：所有安装命令先检测再执行，已存在则跳过。
5. **可审计**：避免不可审计的 `curl | sh`；如必须使用，标注风险。
