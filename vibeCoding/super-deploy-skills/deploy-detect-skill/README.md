# deploy-detect-skill

一个用于 **自动检测项目部署技术栈** 的 Claude Skill。扫描项目根目录，识别语言、Web 框架、前端框架、数据库、缓存/消息组件，输出标准化的 `deploy-profile.md`，作为后续部署技能的事实来源。

---

## 它能做什么

当你说：

- 「部署检测」
- 「detect deploy」
- 「项目技术栈检测」
- 「帮我看看这个项目部署需要什么」

这个 Skill 会扫描你的项目根目录，自动识别部署所需的运行时与依赖组件，并生成一份 `deploy-profile.md`。

---

## 它解决了什么问题

| 问题 | 解决方案 |
|------|----------|
| 部署前不清楚项目依赖什么运行时 | 扫描标志性文件，自动识别语言/框架/数据库 |
| 不同项目技术栈差异大，部署脚本难复用 | 输出标准化画像，下游 skill 按画像生成脚本 |
| 数据库/缓存是开发依赖还是生产依赖分不清 | 中/低置信度项强制向用户确认 |
| 项目变更后画像过期 | 提供「重新检测」入口，记录检测时间 |

---

## 支持识别的技术栈

### 语言

| 语言 | 标志性文件 | 默认版本 |
|------|-----------|----------|
| Node.js | package.json | 22 |
| Java | pom.xml / build.gradle | 17 |
| Python | requirements.txt / pyproject.toml | 3.11 |
| Go | go.mod | 1.22 |
| Ruby | Gemfile | 3.x |
| PHP | composer.json | 8.x |

### Web 框架

Express、NestJS、FastAPI、Django、Flask、Spring Boot、Gin、Echo、Rails、Laravel 等。

### 前端框架/产物

Vue、Nuxt、React、Next、Angular、Svelte、纯 HTML/CSS/JS。

### 数据库 / 缓存 / 消息

PostgreSQL、MySQL、MongoDB、SQLite、Redis、RabbitMQ、Kafka、Elasticsearch。

---

## 使用方式

```
部署检测
```

或自然语言：

```
帮我检测下这个项目部署需要什么环境
识别当前项目的技术栈
```

### 四阶段流程

```
Phase 1: 扫描根目录标志性文件
  → package.json / pom.xml / go.mod / requirements.txt / Dockerfile / .env

Phase 2: 推断技术栈 + 置信度
  → 高（明确依赖）/ 中（配置推断）/ 低（关键字佐证）

Phase 3: 询问确认
  → 中/低置信度项必须确认
  → 区分开发依赖与生产依赖

Phase 4: 写入 deploy-profile.md
  → 项目信息 / 技术栈表格 / 部署需求
```

---

## 生成的 deploy-profile.md 示例

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
| 数据库 | PostgreSQL 16 | 中 | .env DB_URL |
| 缓存 | Redis 7 | 低 | 代码 import ioredis |

## 推断的部署需求
- 需要运行时：Node.js 22
- 需要数据库：PostgreSQL 16（待确认）
- 需要缓存：Redis 7（待确认）
- 需要反向代理：否
- 建议部署方式：原生 / Docker 均可
```

---

## 目录结构

```
deploy-detect-skill/
├── SKILL.md                         # 技能定义：触发条件、四阶段流程
├── README.md                        # 本文件
└── references/
    ├── detection-rules.md           # 各语言/框架/数据库识别规则与默认版本
    ├── profile-spec.md              # deploy-profile.md 固定结构与字段含义
    └── auto-redetect.md             # 项目变更后自动重新检测（git hook / CI / headless）
```

---

## 与下游 Skill 的关系

`deploy-profile.md` 是以下 4 个 skill 的共享输入：

| 下游 Skill | 用途 |
|-----------|------|
| [server-setup-skill](../server-setup-skill/) | 检测服务器环境，按画像补齐缺失依赖 |
| [static-nginx-skill](../static-nginx-skill/) | 检测前端产物，配置 Nginx |
| [deploy-native-skill](../deploy-native-skill/) | 按画像生成原生部署脚本 |
| [deploy-docker-skill](../deploy-docker-skill/) | 按画像生成 Dockerfile / compose |

**建议流程**：先跑 `deploy-detect-skill`，再按需调用下游 skill。

---

## 注意事项

1. **只读不改**：本 Skill 不修改任何项目文件，只生成 `deploy-profile.md`。
2. **置信度**：中/低置信度项必须向你确认，不会擅自假设。
3. **monorepo**：多语言项目按子目录分区记录。
4. **重新检测**：项目变更后再次调用即可刷新画像；如需自动化，可自行配置 git hook 或 CI。
