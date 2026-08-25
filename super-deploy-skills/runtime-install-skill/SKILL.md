---
name: runtime-install-skill
description: 运行时软件安装父技能。根据用户请求的软件类型，分发到对应的子技能（Java/Python/Node.js/Go）。当用户说「安装 Java」「安装 Python」「安装 Node.js」「安装 Go」「安装运行环境」时触发。
---

# Runtime Install Skill（运行时安装父技能）

## Overview

本技能是运行时软件安装的入口技能，负责接收用户请求并分发到对应的子技能。子技能位于本目录的 `children/` 目录下。

## 子技能清单

| 子技能 | 触发词 | 职责 |
|--------|--------|------|
| `java-install-skill` | "安装 Java" / "装 Java" | Java 安装 |
| `python-install-skill` | "安装 Python" / "装 Python" | Python 安装 |
| `nodejs-install-skill` | "安装 Node.js" / "装 Node" | Node.js 安装 |
| `go-install-skill` | "安装 Go" / "装 Go" | Go 安装 |

## When to Use

触发词：

- 安装 Java
- 安装 Python
- 安装 Node.js
- 安装 Go
- 安装运行环境
- runtime install

## 路由规则

```
用户说「安装 Java」或「装 Java」
  → 分发到 java-install-skill

用户说「安装 Python」或「装 Python」
  → 分发到 python-install-skill

用户说「安装 Node.js」或「装 Node」或「装 Nodejs」
  → 分发到 nodejs-install-skill

用户说「安装 Go」或「装 Go」
  → 分发到 go-install-skill
```

## 通用交互流程

所有子技能遵循统一的交互流程：

```
1. 自动检测当前系统（OS + 版本 + 架构）
2. 询问安装方式（包管理器 / Docker）
3. 询问版本选择
4. 生成安装命令
5. 执行安装（幂等）
6. 输出安装结果和验证命令
```

## OS 检测

所有子技能共享 OS 检测能力，输出格式：

```markdown
## 系统信息
- 系统: Ubuntu 22.04 LTS
- 内核: 5.15.0-91-generic
- 架构: x86_64
- 包管理器: apt
```

检测方式详见 [references/os-detection.md](references/os-detection.md)。

## Resources

- [references/os-detection.md](references/os-detection.md) — OS 检测逻辑
- [references/common-commands.md](references/common-commands.md) — 通用命令模板
- [children/](children/) — 各运行时子技能
