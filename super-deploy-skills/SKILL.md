---
name: super-deploy-skills
description: 一键部署技能套件（父入口）。覆盖项目技术栈检测、服务器环境检测与依赖安装、前端 Nginx 托管、原生部署脚本、Docker 部署。当用户说「部署项目」「一键部署」「deploy」「帮我上线」「发布到服务器」时触发，并按意图路由到子技能 deploy-detect-skill / server-setup-skill / static-nginx-skill / deploy-native-skill / deploy-docker-skill。
---

# Super Deploy Skills（父入口）

## Overview

本技能是 5 个部署子技能的统一入口。所有子技能位于本目录下，通过共享的 `deploy-profile.md` 串联。用户用一句话（「帮我部署这个项目」）即可触发完整流程，也可单独触发某个子技能。

## 子技能清单

| 子技能 | 职责 | 路径 |
|--------|------|------|
| `deploy-detect-skill` | 检测项目技术栈，生成 `deploy-profile.md` | [deploy-detect-skill/](deploy-detect-skill/) |
| `server-setup-skill` | 检测服务器环境，按画像补齐依赖（含预置安装脚本） | [server-setup-skill/](server-setup-skill/) |
| `static-nginx-skill` | 前端静态产物 Nginx 托管配置 | [static-nginx-skill/](static-nginx-skill/) |
| `deploy-native-skill` | 原生部署脚本（含预置 launch.sh / launch.ps1） | [deploy-native-skill/](deploy-native-skill/) |
| `deploy-docker-skill` | Dockerfile / docker-compose 生成 | [deploy-docker-skill/](deploy-docker-skill/) |

## When to Use

触发词（父入口）：

- `部署项目`
- `一键部署`
- `deploy`
- `帮我上线`
- `发布到服务器`

直接触发子技能的关键词见各子技能 SKILL.md。

## 路由规则

根据用户意图决定调用顺序：

```
用户说「部署 / 上线 / 发布」且没有 deploy-profile.md
  → 先 deploy-detect-skill 生成画像

用户说「服务器能不能跑 / 装环境」
  → server-setup-skill（读画像，缺则按画像装）

用户说「前端 / Vue / React / Nginx」
  → static-nginx-skill（读画像确认有前端产物）

用户说「原生部署 / pm2 / systemd」
  → deploy-native-skill（读画像，复制 launch.sh / launch.ps1）

用户说「Docker / 容器化」
  → deploy-docker-skill（读画像，生成 Dockerfile + compose）
```

完整链路（典型）：

```
deploy-detect-skill → server-setup-skill → (static-nginx-skill) → deploy-native-skill / deploy-docker-skill
```

## 共享约定

- **事实来源**：`deploy-profile.md`（由 `deploy-detect-skill` 生成，结构见 `deploy-detect-skill/references/profile-spec.md`）。
- **端口**：统一环境变量 `APP_PORT`（默认 8080），贯穿启动脚本、systemd/pm2、Dockerfile、Nginx。详见 `deploy-native-skill/references/script-standards.md`。
- **日志**：所有预置脚本统一格式 `[YYYY-MM-DD HH:MM:SS] [LEVEL] message`，同步写 `${LOG_DIR}`。
- **安全边界**：默认只生成脚本/命令，不自动执行；执行安装或部署需二次确认；数据库初始化永不自动执行。

## Workflow（父入口默认流程）

```
Phase 1: 检测画像（deploy-detect-skill）
  → 扫描项目根，生成 deploy-profile.md
  → 中/低置信度项向用户确认

Phase 2: 选择部署方式（询问用户）
  → 原生（deploy-native-skill） 还是 Docker（deploy-docker-skill）
  → 是否包含前端静态资源（是 → static-nginx-skill）

Phase 3: 服务器环境（server-setup-skill）
  → 检测 OS / 运行时 / 端口占用
  → 缺失项用 assets/install.sh 或 install.ps1 补齐（二次确认后执行）

Phase 4: 生成部署产物
  → 原生：复制 launch.sh / launch.ps1，填充 APP_NAME/APP_PORT/BRANCH
  → Docker：生成 Dockerfile + docker-compose.yml
  → 前端：生成 Nginx 站点配置

Phase 5: 交付与说明
  → 告知用户产物位置、如何执行、日志位置、回滚方式
  → 提示可配置「项目变更自动重新检测」（auto-redetect.md）
```

## 重要边界

- **不自动执行**：父入口与子技能默认只产出文件和命令；任何会修改服务器状态的动作（安装、起停进程、写 Nginx 配置）都必须二次确认。
- **不替代运维判断**：端口冲突、防火墙、HTTPS 证书、数据库密码等需用户最终决定。
- **跨平台**：Linux 与 Windows Server 均支持；生产优先 Linux，Windows 路径与命令见各子技能脚本。

## Resources

- 各子技能目录下的 `SKILL.md` / `README.md` / `references/` / `assets/`
- 使用走查见本目录 [README.md](README.md)
