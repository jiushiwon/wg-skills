# nodejs-backend-skill

现场生成 **Node.js** 后端项目骨架。默认 **Express**，要企业模块化时走 **NestJS** 分支。

## 适合场景

- 全栈 JS / 快速 MVP（Express）
- 企业级模块化、装饰器架构、依赖注入（NestJS）
- 前后端同语言、TypeScript

## 触发关键词

`用 Node 写后端`、`Express 项目`、`NestJS 项目`、`nodejs backend`、`ts 后端`、`node 骨架`

## 分支选择

- **Express（默认）**：轻量、快速启动。MongoDB 仅 Express 分支支持。
- **NestJS（可选）**：用户明确要"企业模块化 / 装饰器架构"时走。NestJS 分支不引 MongoDB。

没明说就用 Express。

## 输入

- 项目名
- 框架分支（Express 默认 / NestJS）
- 数据库（PostgreSQL 默认 / MySQL / MongoDB）
- 表前缀（默认 `wg`）
- 核心实体
- 是否需要 Redis / Kafka 等中间件（YAGNI）

## 输出

Express：
```
{{project}}/
├── src/
│   ├── server.ts  app.ts  config/  common/  modules/
├── package.json  tsconfig.json  Dockerfile  docker-compose.yml
├── .env.example  .gitignore  README.md
├── api-contract.md  versions.md  CLAUDE.md  AGENTS.md
```

NestJS：
```
{{project}}/
├── src/
│   ├── main.ts  app.module.ts  common/  modules/
├── nest-cli.json  package.json  tsconfig.json  Dockerfile  docker-compose.yml
├── .env.example  .gitignore  README.md
├── api-contract.md  versions.md  CLAUDE.md  AGENTS.md
```

内置：统一响应中间件 / 拦截器、全局异常处理（NestJS 分支 404/405 原生透传）、JWT、请求日志、class-validator 校验、分页列表、`/api/health`。

## 强制交付物（文档）

生成项目时与代码同时落地两份文档，缺一不可：

| 文档 | 位置 | 内容 |
|------|------|------|
| 介绍 & 拓展性文档 | `docs/project-guide.md` | 技术栈、启动方式、如何对接前端（uni-app / axios）、接口范式、拦截器链路（Express：cors→日志→信封包装→鉴权→校验→错误兜底；NestJS：CORS→日志→ValidationPipe→JwtAuthGuard→TransformInterceptor→HttpExceptionFilter）、出入参范式、鉴权范式、错误码、拓展指南（加模块/加中间件/TypeORM 迁移） |
| 接口契约（接口 md） | 根目录 `api-contract.md` | 全部接口字段级定义，前后端唯一事实来源 |

模板：`backend-convention-skill/references/project-guide-template.md`（栈特定段按本 skill 对应 skeleton 末尾「project-guide 填充段」填）+ `default-api-contract.md`（已含 health/auth/users 全量接口，按实体追加）。

## 调用样例

```
你：用 Node 写一个博客后端

AI（nodejs-backend-skill）：
  默认 Express 还是 NestJS？（没明说用 Express）

你：Express。

AI：选型：Node.js + Express + PostgreSQL。
  ① 核心实体？

你：用户、文章、评论、标签。

AI：正在生成项目 blog/：
  - package.json、tsconfig.json、src/ 各层
  - 统一响应、全局异常、JWT、请求日志、class-validator、分页
  - User/Post/Comment/Tag 的 entity/dto/service/controller/routes
  - api-contract.md、versions.md
  正在 npm install && npm run build && curl /api/health ...
  ✓ 构建通过
```

## 版本获取

不写死版本号。生成时按优先级：本机 `node -v` / `npm -v` → `nodejs.org/dist/index.json` / `npm view <pkg> version` 查最新稳定 → 你覆盖 → 写入 `versions.md`。

## 验证

```bash
npm install
npm run build
npm run lint
npm run dev   # Express: ts-node-dev；NestJS: nest start --watch
curl http://localhost:8080/api/health
```

## 与其他 skill 的关系

- 规范引用 `backend-convention-skill`（不复制）
- 数据库/schema/迁移引用 `database-skill`

## 不做

- NestJS 分支不引 MongoDB
- 不加未请求的中间件
- 不锁定版本号
- 不替你提交
