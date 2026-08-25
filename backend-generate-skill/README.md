# backend-generate-skill

后端生成技能集合。按职责拆成 7 个独立子 skill，每个可单独触发。

## 使用方式

**它不是斜杠命令**，没有 `/backend-generate-skill` 这种敲法。装好（软链到 `~/.claude/skills/`）后，在任意项目里用**自然语言触发词**即可，模型会自动命中本 skill 并按需分流到子 skill。

| 你想做的事 | 直接说 | 进入 |
|------------|--------|------|
| 做后端但没定语言 | `生成后端项目`、`搭建后端骨架`、`初始化后端服务`、`backend generate` | backend-select-skill（问答选型） |
| 已选定语言 | `用 Go 写后端`、`用 Java 写后端`、`用 Python 写后端`、`用 Node 写后端` | 对应后端 skill（跳过选型） |
| 只问接口规范 | `后端统一返回格式`、`错误码规范`、`api 契约`、`JWT 规范` | backend-convention-skill |
| 只问数据库 | `PostgreSQL 还是 MySQL`、`数据库选型`、`schema 设计` | database-skill |

想强制走本 skill，明说即可：`用 backend-generate-skill 帮我搭个 Go + PostgreSQL 的后端`。

最小起手示例：

```
你：生成后端项目
AI：进 backend-select-skill，分批问 3~5 个关键问题（用途 / 核心实体 / 流量 / 团队语言 / 是否要 Redis 等）
你：中小型，团队熟 Go，只要 PostgreSQL
AI：推荐 Go + Gin + PostgreSQL，写入 spec.md 让你确认
你：确认
AI：分流到 go-backend-skill，现场生成可运行骨架 + api-contract.md
```

## 子 skill

| 子 skill | 职责 | 触发关键词 |
|----------|------|-----------|
| [backend-select-skill](backend-select-skill/) | 入口：问答选型，分流到对应后端 skill | `生成后端项目`、`搭建后端骨架`、`backend generate` |
| [backend-convention-skill](backend-convention-skill/) | 公共规范：响应信封、错误码、JWT、api-contract | `后端规范`、`统一返回格式`、`api 契约` |
| [java-backend-skill](java-backend-skill/) | Spring Boot 项目生成 | `用 Java 写后端`、`Spring Boot 项目` |
| [go-backend-skill](go-backend-skill/) | Gin 项目生成 | `用 Go 写后端`、`Gin 项目` |
| [python-backend-skill](python-backend-skill/) | FastAPI 项目生成 | `用 Python 写后端`、`FastAPI 项目` |
| [nodejs-backend-skill](nodejs-backend-skill/) | Express / NestJS 项目生成 | `用 Node 写后端`、`Express 项目`、`NestJS 项目` |
| [database-skill](database-skill/) | PostgreSQL / MySQL / MongoDB 选型与迁移 | `数据库选型`、`数据库迁移`、`schema 设计` |

## 触发链

```
用户："生成后端项目"
  → backend-select-skill（问答选型）
  → 用户确认"用 Go + PostgreSQL"
  → go-backend-skill（引用 convention + database，现场生成）
  → 输出可运行项目 + api-contract.md
```

用户已指定语言时（如"用 Java 写后端"），直接命中对应后端 skill，select 跳过。

## 生成项目的强制交付物

无论走哪条路径生成后端项目，交付物中**必须包含两份文档**，与代码同时落地：

| 文档 | 位置 | 内容 | 模板来源 |
|------|------|------|----------|
| 介绍 & 拓展性文档 | `docs/project-guide.md` | 用什么技术、如何对接前端（uni-app / axios 示例）、接口范式、拦截器链路、出入参范式、鉴权范式、错误码、拓展指南（加模块/加中间件/加迁移） | `backend-convention-skill/references/project-guide-template.md` |
| 接口契约（接口 md） | 根目录 `api-contract.md` | 全部接口的字段级定义（路径/方法/入参/出参/枚举/错误码），前后端唯一事实来源 | `backend-convention-skill/references/default-api-contract.md` + `api-contract-spec.md` |

分工原则：**范式进 guide，字段进 contract**，两边不重复。前端工程师拿到项目后，先读 `project-guide.md` 建立整体认知，再按 `api-contract.md` 逐接口对接。

## 完整使用走查

下面 3 个真实对话样例，演示从一句话到生成项目的全过程。

### 走查 1：未指定语言（最常用）

```
用户：生成后端项目

AI（backend-select-skill）：
  我先问几个关键问题，分批问。
  ① 这个后端服务解决什么问题？目标用户是谁？
  ② 列出 3~5 个核心实体（如用户、订单、文章）。

用户：做一个博客平台，用户能发文章、评论。核心实体：用户、文章、评论、标签。

AI：
  ③ 预期流量规模？个人 / 中小型 / 高并发？
  ④ 团队熟哪种语言？Java / Python / Node.js / Go，还是无所谓？

用户：中小型，团队熟 Node.js。

AI（backend-select-skill → database-skill）：
  推荐：Node.js + Express（轻量、MVP 友好）+ PostgreSQL（强关系）。
  数据库表前缀默认 wg。是否需要 Redis 缓存、Elasticsearch 搜索？（YAGNI，不要的全不加）

用户：只要 PostgreSQL，其他不要。

AI（backend-select-skill）：
  已写入 spec.md，请确认：
  - 栈：Node.js + Express
  - 数据库：PostgreSQL，前缀 wg
  - 实体：User、Post、Comment、Tag
  - API：/api/auth/*、/api/posts/*、/api/comments/*、/api/tags/*
  确认后我分流到 nodejs-backend-skill 生成。

用户：确认。

AI（nodejs-backend-skill，引用 convention + database）：
  正在生成项目 my-blog/：
  - 目录骨架、package.json、tsconfig.json、Dockerfile、docker-compose.yml
  - 统一响应、全局异常、请求日志、JWT 认证、健康检查、分页
  - User/Post/Comment/Tag 的 entity / dto / service / controller / routes
  - api-contract.md（接口 md）、docs/project-guide.md（介绍&拓展性文档）、versions.md、CLAUDE.md、AGENTS.md
  正在 npm install && npm run build && curl /api/health ...
  ✓ 构建通过，健康检查返回 { code: 0, message: "success", data: { status: "ok" } }

  交付清单：
  - 项目目录：my-blog/
  - 启动：cp .env.example .env && docker-compose up -d && npm run dev
  - 契约：my-blog/api-contract.md（前端严格对齐）
  - 使用&拓展：my-blog/docs/project-guide.md（前端对接先读这份）
```

### 走查 2：已指定语言（跳过选型）

```
用户：用 Java 写一个电商后端，要 MySQL

AI（java-backend-skill，直接命中，引用 convention + database）：
  选型：Java + Spring Boot + MySQL（用户已指定，跳过 select）。
  我问 2 个关键问题：
  ① 核心实体？（默认 users/products/orders/order_items/addresses）
  ② 是否需要 Redis / Kafka / 对象存储？（YAGNI）

用户：实体就用默认的，要 Redis 做缓存。

AI（java-backend-skill）：
  正在生成项目 shop/：
  - pom.xml、mvnw、application.yml、Dockerfile、docker-compose.yml（MySQL 用 docker-compose.mysql.yml 改名）
  - 统一响应 ApiResponse、全局异常 GlobalExceptionHandler、JWT 过滤器、请求日志拦截器
  - User/Product/Order/OrderItem/Address 的 entity / dto / repository / service / controller
  - 分页列表 GET /api/products?page=1&pageSize=20
  - api-contract.md、docs/project-guide.md、versions.md、AGENTS.md
  正在 ./mvnw compile && curl /api/health ...
  ✓ 构建通过，健康检查正常

  注意：MySQL 数据库名默认 app_db，DB_USER 用 app（官方镜像禁 root）。
```

### 走查 3：单独问规范或数据库（不生成项目）

```
用户：后端统一返回格式怎么定？

AI（backend-convention-skill）：
  所有接口返回 { code, message, data }：
  - code >= 0 成功，< 0 失败；HTTP 一律 200
  - 列表 data 含 { page, pageSize, total, list }
  - 错误码表见 references/response-format.md
  前端必须读 code 判断业务状态，禁止用 HTTP 状态码。

用户：PostgreSQL 还是 MySQL？

AI（database-skill）：
  - 强关系、事务 → PostgreSQL（默认首选）
  - 团队熟 MySQL → MySQL 8
  - 文档、灵活模式 → MongoDB（仅 Node/Python 栈自动生成）
  你的项目如果涉及订单、库存、强一致，推荐 PostgreSQL。
```

## 我该如何选子 skill？

| 你的需求 | 用哪个子 skill |
|----------|----------------|
| "我想做后端，但不知道用什么语言" | backend-select-skill |
| "我确定用 Java / Go / Python / Node" | 对应 java / go / python / nodejs-backend-skill |
| "我只想看接口规范、错误码、契约" | backend-convention-skill |
| "我在纠结 PostgreSQL / MySQL / MongoDB" | database-skill |
| "我要设计博客/电商/SaaS 的基础表" | database-skill（查 database-skill/references/base-schemas.md） |

## 设计原则

- **拆分不删除**：原 backend-generate-skill 的全部功能分散到 7 个子 skill，能力不丢失。
- **公共规范单一来源**：响应信封、错误码、契约、命名只在 `backend-convention-skill` 定义，4 个后端 skill 引用不复制。
- **现场生成，不写死版本**：不再维护 174 个 boilerplate 文件；版本号由后端 skill 现场查询官方源，写入生成项目的 `versions.md`。
- **数据库独立**：PostgreSQL / MySQL / MongoDB 选型与迁移规则集中在 `database-skill`。
