# nodejs-backend-skill

现场生成 **Node.js + Express** 后端项目骨架。

## 适合场景

- 全栈 JS / 快速 MVP
- 前后端同语言、TypeScript
- 团队熟 Node.js
- MongoDB（仅本栈与 Python 栈自动生成）

## 触发关键词

`用 Node 写后端`、`Express 项目`、`Express 脚手架`、`nodejs backend`、`ts 后端`、`node 骨架`

## 输入

- 项目名
- 数据库（PostgreSQL 默认 / MySQL / MongoDB）
- 表前缀（默认 `wg`）
- 核心实体
- 是否需要 Redis / Kafka 等中间件（YAGNI）

## 输出

```
{{project}}/
├── src/
│   ├── server.ts  app.ts  config/  common/  modules/
├── package.json  tsconfig.json  Dockerfile  docker-compose.yml
├── .env.example  .gitignore  README.md
├── api-contract.md  versions.md  CLAUDE.md  AGENTS.md
```

内置：统一响应 `responseWrapperMiddleware`（patch `res.json`，已是信封则透传，禁双包）、全局异常 `errorHandlerMiddleware`（含 `ValidationError`→-1001）、JWT（jsonwebtoken）、请求日志 `requestLogMiddleware`（含 requestId / duration）、class-validator 校验、分页列表、`/api/health`。

**MongoDB**：本栈与 Python 栈是唯一自动生成 MongoDB 的两个栈（用 mongoose）。

## 强制交付物（文档）

生成项目时与代码同时落地两份文档，缺一不可：

| 文档 | 位置 | 内容 |
|------|------|------|
| 介绍 & 拓展性文档 | `docs/project-guide.md` | 技术栈、启动方式、如何对接前端（uni-app / axios）、接口范式、拦截器链路（cors→json→日志→信封包装→路由→错误兜底）、出入参范式、鉴权范式、错误码、拓展指南（加模块/加中间件/TypeORM 迁移） |
| 接口契约（接口 md） | 根目录 `api-contract.md` | 全部接口字段级定义，前后端唯一事实来源 |

模板：`backend-convention-skill/references/project-guide-template.md`（栈特定段按本 skill `references/skeleton.md` 末尾「project-guide 填充段」填）+ `default-api-contract.md`（已含 health/auth/users 全量接口，按实体追加）。

## 调用样例

```
你：用 Node 写一个博客后端

AI（nodejs-backend-skill）：
  选型：Node.js + Express + PostgreSQL。
  ① 核心实体？
  ② 是否需要 Redis？

你：实体：用户、文章、评论、标签。不要 Redis。

AI：正在生成项目 blog/：
  - package.json、tsconfig.json、src/ 各层
  - 统一响应、全局异常、JWT、请求日志、class-validator、分页
  - User/Post/Comment/Tag 的 entity/dto/service/controller/routes
  - api-contract.md、docs/project-guide.md、versions.md
  正在 npm install && npm run build && curl /api/health ...
  ✓ 构建通过
```

## 版本获取

不写死版本号。生成时按优先级：本机 `node -v` / `npm -v` → `nodejs.org/dist/index.json` / `npm view <pkg> version` 查最新稳定 → 你覆盖 → 写入 `versions.md`。

## 验证

```bash
npm install
npm run build
npm run dev   # ts-node-dev
curl http://localhost:8080/api/health
```

## 与其他 skill 的关系

- 规范引用 `backend-convention-skill`（不复制）
- 数据库/schema/迁移引用 `database-skill`

## 不做

- **Express-only**：不引其他框架（NestJS / Koa / Fastify）。要企业级模块化请改用 java-backend-skill。
- MongoDB 仅本栈（与 Python 栈同），关系型默认 PostgreSQL / MySQL
- 不加未请求的中间件
- 不锁定版本号
- 不替你提交