---
name: deploy-detect-skill
description: 用于自动检测项目根目录的技术栈（语言、Web 框架、前端框架、数据库、缓存/消息），并生成标准化的「项目部署画像 deploy-profile.md」，作为 server-setup-skill、static-nginx-skill、deploy-native-skill、deploy-docker-skill 共享的事实来源。当用户说「部署检测」「detect deploy」「项目技术栈检测」「识别部署技术栈」时触发。
---

# Deploy Detect Skill

## Overview

本 skill 把「这个项目要部署需要哪些环境」这件事规范化：扫描项目根目录的标志性文件，推断语言、Web 框架、前端构建产物、数据库、缓存/消息组件，输出一份可被下游 4 个部署 skill 消费的 `deploy-profile.md`。

它不执行安装、不修改项目代码，只做「识别 + 文档落地」。

## When to Use

触发词：

- `部署检测`
- `detect deploy`
- `项目技术栈检测`
- `识别部署技术栈`
- `帮我看看这个项目部署需要什么`

当用户准备部署一个项目，但还没确定部署方式时，应先调用本 skill。

## Workflow Summary

```
Phase 1: 扫描根目录标志性文件
  → package.json / pom.xml / build.gradle / go.mod / requirements.txt / pyproject.toml
  → Dockerfile / docker-compose.yml
  → .env / .env.example / config/ 目录
  → dist/ / build/ / public/ 等前端产物目录

Phase 2: 推断技术栈
  → 语言（Node.js / Python / Java / Go / Ruby / PHP）
  → Web 框架（Express / NestJS / FastAPI / Django / Spring Boot / Gin）
  → 前端框架（Vue / React / Angular / Svelte / 纯静态）
  → 数据库（PostgreSQL / MySQL / MongoDB / SQLite）
  → 缓存/消息（Redis / RabbitMQ / Kafka / Elasticsearch）
  → 标注每项的置信度（高 / 中 / 低）

Phase 3: 询问用户确认/修正
  → 对「中 / 低」置信度项必须确认
  → 区分「开发依赖」与「生产依赖」（如 .env 里的 DB_URL 是本地还是生产）
  → 询问是否包含前端静态资源

Phase 4: 写入 deploy-profile.md
  → 固定结构：项目信息 / 技术栈表格 / 推断的部署需求
  → 输出到项目根目录（或用户指定路径）
```

## Phase 1: 扫描根目录标志性文件

按优先级扫描以下文件/目录，命中即记录：

| 优先级 | 文件/目录 | 用途 |
|--------|----------|------|
| 高 | `package.json` | Node.js / 前端框架识别 |
| 高 | `pom.xml` / `build.gradle` | Java / Kotlin 识别 |
| 高 | `go.mod` | Go 识别 |
| 高 | `requirements.txt` / `pyproject.toml` / `Pipfile` | Python 识别 |
| 高 | `Gemfile` / `composer.json` | Ruby / PHP 识别 |
| 中 | `Dockerfile` / `docker-compose.yml` | 已有容器化线索、base image 推断版本 |
| 中 | `.env` / `.env.example` / `config/` | 数据库、缓存、第三方组件线索 |
| 中 | `dist/` / `build/` / `public/` / `.next/` / `.nuxt/` | 前端构建产物 |
| 低 | 源码中出现的关键字（如 `import redis`） | 辅助佐证 |

**只读不改**：本 skill 不得修改任何项目文件。

## Phase 2: 推断技术栈

按 `references/detection-rules.md` 的规则逐项识别。每项必须标注置信度：

- **高**：存在明确标志性文件或依赖声明（如 `package.json` 里有 `express`）。
- **中**：通过配置文件推断（如 `.env` 里有 `DB_URL=postgres://...`）。
- **低**：代码里出现关键字但未在依赖中声明（如 `import redis` 但 `package.json` 没有 redis）。

### 2.1 语言识别顺序

如果一个项目同时存在多种语言（如 monorepo），分别记录每个子目录的技术栈，并在 `deploy-profile.md` 中分区列出。

### 2.2 前端构建产物

检测 `package.json` 的 `scripts.build` 与产物目录：

- Vue / Nuxt → `dist/` 或 `.output/`
- React / Next → `build/` 或 `.next/`
- Angular → `dist/<project>/`
- Svelte → `build/` 或 `.svelte-kit/`
- 纯 HTML/CSS/JS → `public/` 或根目录

命中前端产物时，在 `deploy-profile.md` 标注「需要反向代理（Nginx）」。

## Phase 3: 询问用户确认/修正

对中/低置信度项，必须向用户确认，例如：

- 「检测到 `.env` 里有 PostgreSQL 连接串，是生产数据库还是仅本地开发？」
- 「代码里 import 了 redis，但 `package.json` 没有声明依赖，生产环境需要 Redis 吗？」
- 「同时存在 `Dockerfile` 和 `docker-compose.yml`，希望用 Docker 部署还是原生部署？」
- 「项目是否包含前端静态资源（Vue/React）需要 Nginx 托管？」

**禁止假设**：无法确定时宁可问，不要写错画像。

## Phase 4: 写入 deploy-profile.md

按 `references/profile-spec.md` 的格式生成 `deploy-profile.md`，示例：

```markdown
# 项目部署画像

## 项目信息
- 项目根目录：/srv/apps/my-api
- 检测时间：2026-07-10

## 检测到的技术栈
| 类型 | 识别结果 | 置信度 | 依据文件 |
|------|----------|--------|----------|
| 语言 | Node.js 22 | 高 | package.json engines |
| Web 框架 | Express 4.18 | 高 | package.json dependencies |
| 前端构建产物 | 无（后端服务） | 高 | 未检测到 dist/ build/ |
| 数据库 | PostgreSQL 16 | 中 | .env DB_URL |
| 缓存 | Redis 7 | 低 | 代码 import ioredis，需用户确认 |

## 推断的部署需求
- 需要运行时：Node.js 22
- 需要数据库：PostgreSQL 16（待用户确认是否生产）
- 需要缓存：Redis 7（待用户确认）
- 需要反向代理：否
- 建议部署方式：原生 / Docker 均可
```

### 4.1 关于「项目变更自动检测」

本 skill 不实现文件监听或后台 daemon，改为提供「重新检测」入口 + 可接入 git hook / CI 的标准触发方式，详见 `references/auto-redetect.md`：

- **重新检测入口**：用户可随时再次调用本 skill，重新扫描并覆盖 `deploy-profile.md`，并追加「变化摘要」。
- **git hook**：`post-merge` 监听标志性文件变更，提醒或自动刷新。
- **CI job**：合并到 main 后在流水线校验画像是否过期。
- **Claude Code headless**：已配置环境可在 hook/CI 里 headless 调用本 skill 自动刷新。

在 `deploy-profile.md` 顶部记录「检测时间」，便于下游判断画像是否过期。

## Output Constraints

- `deploy-profile.md` 是下游 skill 的唯一事实来源，结构必须稳定。
- 字段缺失时填「未检测」或「N/A」，不要编造。
- 置信度必须标注，下游 skill 据此决定是否需要二次确认。

## Resources

- `references/detection-rules.md` — 各语言/框架/数据库的识别规则与默认版本
- `references/profile-spec.md` — `deploy-profile.md` 的固定结构与字段含义
- `references/auto-redetect.md` — 项目变更后自动重新检测（git hook / CI / headless）

## Best Practices

- 只读不改：识别过程不得修改项目文件。
- 中/低置信度必须向用户确认。
- monorepo 按子目录分区记录。
- 检测完成后建议下一步调用 `server-setup-skill`。
- 不要在本 skill 里执行任何安装或部署动作。
