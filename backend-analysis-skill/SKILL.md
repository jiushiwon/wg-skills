---
name: backend-analysis-skill
description: 后端项目静态分析技能。不运行项目，直接扫描源码，为 Java(Spring Boot/Spring Cloud)、Go(Gin/Echo)、Python(FastAPI/Django/Flask)、Node.js(Express/NestJS) 项目产出 4 份报告：① 接口报告（全部 API 清单：方法/路径/入参/出参/鉴权）② 技术报告（语言/框架版本、中间件如 Redis/MQ/ES、第三方 API 如短信/支付/推送、架构组件如拦截器/全局异常/全局配置/路由注册）③ 数据库报告（表结构/ORM/索引/迁移脚本）④ 业务逻辑报告（模块划分/核心流程/定时任务/外部集成）。当用户要求"分析后端项目"、"梳理后端接口"、"盘点技术栈"、"出数据库文档"、"接手老项目"、"读懂后端代码"、"backend analysis" 时调用。
---

# Backend Analysis Skill — 后端项目全景分析

本技能对**已有后端项目**做静态扫描（不编译、不运行），一次产出 4 份报告，用于接手老项目、技术盘点、交接文档、重构前摸底。

## 适用场景与边界

- **适用**：接手陌生项目、盘点技术栈与接口、补交接文档、重构/迁移前摸底
- **不做**：不修改目标项目代码、不运行业务、不替代运行时接口文档（Knife4j/Swagger）
- **与其他技能的区别**：
  - `deploy-detect-skill` 为**部署**生成画像（轻量），本技能为**理解项目**产出 4 份完整报告
  - `frontend-code-doctor` 审查**前端**代码质量，本技能盘点**后端**项目
  - `backend-generate-skill` 是**从零生成**后端，本技能是**分析已有**后端

## 工作流程

```
Step 0 识别技术栈 → Step 1 接口扫描 → Step 2 技术扫描 → Step 3 数据库扫描 → Step 4 业务梳理 → Step 5 汇总总览
```

默认 4 份报告全出；用户指定单份时（如"只出接口报告"）只跑对应 Step。

### Step 0：技术栈识别（必先执行）

读取构建文件判断语言与框架，规则详见 [references/detection-rules.md](references/detection-rules.md)：

- `pom.xml` / `build.gradle(.kts)` → Java
- `go.mod` → Go
- `requirements.txt` / `pyproject.toml` / `Pipfile` → Python
- `package.json` → Node.js

识别结果（语言 + 框架 + 版本 + ORM）决定后续使用哪套扫描模式。多模块/多语言混合项目逐模块识别后分别套用。

### Step 1：接口扫描 → `01-api-report.md`

扫描模式详见 [references/api-scan-patterns.md](references/api-scan-patterns.md)。要点：

1. 先 Glob 定位控制器/路由文件，再 Grep 路由注解/注册语句
2. **类级路由前缀 + 方法级路径**拼接出完整 URL（如 `@RequestMapping("/user")` + `@PostMapping("/login")` → `POST /user/login`）
3. 提取每个接口的：HTTP 方法、完整路径、处理函数、入参（DTO/Query）、出参类型、鉴权标记
4. 识别全局路由配置（context-path、统一前缀 `/api`、版本前缀 `/v1`）
5. 标注**无鉴权接口**、被注释/废弃的接口

### Step 2：技术栈扫描 → `02-tech-report.md`

扫描模式详见 [references/tech-scan-patterns.md](references/tech-scan-patterns.md)。覆盖 6 个维度：

| 维度 | 内容 |
|------|------|
| 基础栈 | 语言与运行时版本、框架版本、构建工具 |
| 依赖清单 | 按 Web/ORM/缓存/MQ/工具/测试 分类 |
| 中间件 | Redis、Kafka/RabbitMQ/RocketMQ、ES、对象存储（OSS/S3/MinIO） |
| 第三方 API | 短信、支付、推送、地图、OAuth/SSO、邮件、AI 服务（依赖 + 配置 key 双证据） |
| 架构组件 | 拦截器/过滤器/中间件、全局异常处理、AOP、全局配置加载、跨域配置、路由注册方式、定时任务 |
| 安全隐患 | 硬编码密钥、拼接 SQL、DEBUG 开启、Actuator 暴露 |

**密钥/密码类信息在报告中必须打码**（如 `AKIA****`）。

### Step 3：数据库扫描 → `03-database-report.md`

扫描模式详见 [references/database-scan-patterns.md](references/database-scan-patterns.md)。要点：

1. 从连接配置（`spring.datasource.url` / `DATABASE_URL` 等）判断数据库类型
2. 按 ORM 扫描实体/模型文件，提取表名、字段、索引、关联关系
3. 收集 SQL 与迁移文件（`*.sql`、Flyway `db/migration`、Liquibase changelog、Alembic/Prisma/Django migrations）
4. 扫描缓存设计（Redis key 模式、`@Cacheable`）
5. 连接串中的账号密码打码

### Step 4：业务梳理 → `04-business-report.md`

1. 基于包/目录结构划分模块，给出每个模块职责
2. 挑 2-5 条核心业务链路，从入口接口追到 Service 再到底层（DAO/外部调用），文字描述流程
3. 列出定时任务（`@Scheduled`/cron/xxl-job）与异步任务（MQ 消费者、`@Async`）
4. 列出对外集成点（调谁、被谁调）
5. 允许用 mermaid 画 1-3 张核心流程图（非必须，复杂项目才画）
6. 推测性结论必须标注"（推测）"

### Step 5：汇总 → `00-overview.md`

- 项目画像（一段话：这是什么系统、用什么技术、规模多大）
- 规模统计表（源文件数、接口数、表数、依赖数）
- 4 份报告的链接 + 每份 3-5 条摘要
- Top 风险/遗留点清单
- 给接手人的建议阅读顺序

## 输出规范

- **默认写入目标项目** `docs/backend-analysis/`（用户可指定其他路径）：

  | 文件 | 内容 |
  |------|------|
  | `00-overview.md` | 总览：项目画像 + 4 报告摘要 + 风险 Top |
  | `01-api-report.md` | 接口报告 |
  | `02-tech-report.md` | 技术报告 |
  | `03-database-report.md` | 数据库报告 |
  | `04-business-report.md` | 业务逻辑报告 |

- 报告模板详见 [references/report-templates.md](references/report-templates.md)，必须按模板输出
- 对话中只输出**摘要 + 文件路径**，不全文粘贴报告
- 报告中的结论必须标注来源（`path/to/file.java:42`），便于核对

## 注意事项

1. **排除目录**：`node_modules/`、`target/`、`dist/`、`build/`、`.git/`、`vendor/`、`__pycache__/`、`.idea/`、`.gradle/`
2. **大项目分批**：先 Glob 看结构 → 按模块逐个深入，禁止一次性读取全量文件
3. **只读原则**：不修改、不运行目标项目任何代码与脚本
4. **敏感信息打码**：密钥、密码、Token、连接串账密一律 `****`
5. **证据优先**：每条结论带来源文件；拿不准的标"（推测）"，不编造。**目录名/项目名不可信**（`xxx-back` 可能是前端），技术栈以构建文件内容为唯一证据
6. **鉴权扫描禁限量**：Grep 设 `head_limit` 会漏文件导致误判无鉴权接口；鉴权相关扫描必须不限量，且每个"无鉴权"结论逐端点读函数签名确认
7. **触发冲突处理**：用户要"部署检测/部署画像"时转 `deploy-detect-skill`，要"生成后端"时转 `backend-generate-skill`

## 交付确认

报告生成后，在对话末尾输出：

```
✅ 后端分析完成，报告已写入 <项目>/docs/backend-analysis/：
- 00-overview.md（总览，建议先读）
- 01-api-report.md（接口 N 个）
- 02-tech-report.md（中间件 N 个 / 第三方 API N 个 / 安全隐患 N 处）
- 03-database-report.md（数据表 N 张）
- 04-business-report.md（模块 N 个 / 核心流程 N 条）

如需深入某个模块或补充运行时验证（如启动项目核对接口），请告诉我。
```
