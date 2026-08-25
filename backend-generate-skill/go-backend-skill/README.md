# go-backend-skill

现场生成 **Go + Gin** 后端项目骨架。

## 适合场景

- 高并发、微服务、云原生
- 需要小体积二进制、快速启动
- 团队熟悉 Go

## 触发关键词

`用 Go 写后端`、`Gin 项目`、`生成 Gin`、`golang backend`、`go 骨架`、`go web 项目`

## 输入

- 项目名、模块路径（默认 `github.com/wg/<project>`）
- 数据库（PostgreSQL 默认 / MySQL）
- 表前缀（默认 `wg`）
- 核心实体
- 是否需要 Redis / Kafka 等中间件（YAGNI）

## 输出

```
{{project}}/
├── cmd/server/main.go
├── internal/
│   ├── config/  database/  handlers/  services/
│   ├── repositories/  models/  middlewares/  exceptions/  utils/
├── migrations/
├── go.mod  go.sum  Dockerfile  docker-compose.yml
├── .env.example  .gitignore  README.md
├── api-contract.md  versions.md  CLAUDE.md  AGENTS.md
```

内置：统一响应 `Response`（`OK()/Fail()` 唯一包装点）、错误恢复中间件（panic→信封）、JWT 中间件、请求日志、`BindJSON` 校验（失败转 -1001）、分页列表、`/api/health`。

## 强制交付物（文档）

生成项目时与代码同时落地两份文档，缺一不可：

| 文档 | 位置 | 内容 |
|------|------|------|
| 介绍 & 拓展性文档 | `docs/project-guide.md` | 技术栈、启动方式、如何对接前端（uni-app / axios）、接口范式、拦截器链路（ErrorHandler→CORS→日志→Auth→BindJSON→OK/Fail）、出入参范式、鉴权范式、错误码、拓展指南（加模块/加中间件/golang-migrate 迁移） |
| 接口契约（接口 md） | 根目录 `api-contract.md` | 全部接口字段级定义，前后端唯一事实来源 |

模板：`backend-convention-skill/references/project-guide-template.md`（栈特定段按本 skill `references/skeleton.md` 末尾「project-guide 填充段」填）+ `default-api-contract.md`（已含 health/auth/users 全量接口，按实体追加）。

## 调用样例

```
你：用 Go 写一个高并发订单服务

AI（go-backend-skill）：
  选型：Go + Gin + PostgreSQL。
  ① 模块路径？（默认 github.com/wg/order-service）
  ② 核心实体？

你：路径默认，实体：用户、订单、订单项。

AI：正在生成项目 order-service/：
  - go.mod、cmd/server/main.go、internal/ 各层
  - 统一响应、错误恢复、JWT、请求日志、validator、分页
  - User/Order/OrderItem 的 model/handler/service/repository
  - api-contract.md、versions.md
  正在 go mod tidy && go build ./... && curl /api/health ...
  ✓ 构建通过
```

## 版本获取

不写死版本号。生成时按优先级：本机 `go version` → `go.dev/VERSION?m=text` / `pkg.go.dev` 查最新稳定 → 你覆盖 → 写入 `versions.md`。

## 验证

```bash
go mod tidy
go build ./...
go vet ./...
go run cmd/server/main.go
curl http://localhost:8080/api/health
```

## 与其他 skill 的关系

- 规范引用 `backend-convention-skill`（不复制）
- 数据库/schema/迁移引用 `database-skill`

## 不做

- 不引 MongoDB（关系型默认 PostgreSQL / MySQL）
- 不加未请求的中间件
- 不锁定版本号
- 不替你提交
