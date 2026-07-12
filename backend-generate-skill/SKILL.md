---
name: backend-generate-skill
description: 后端生成总入口。用户想做后端但未指定语言时进 backend-select-skill 问答选型；已指定语言（Java/Go/Python/Node）时直接进对应后端 skill；只问规范进 backend-convention-skill；只问数据库进 database-skill。所有后端 skill 强制遵循 backend-convention-skill 的统一响应信封、错误码、JWT、api-contract。触发词："生成后端项目"、"搭建后端骨架"、"初始化后端服务"、"backend generate"、"帮我做个后端接口"、"后端选型"、"用 Java/Go/Python/Node 写后端"、"Spring Boot"、"Gin"、"FastAPI"、"Express"、"NestJS"、"数据库选型"、"后端规范"、"api 契约"。
---

# Backend Generate Skill

后端生成父入口，本身不写代码，只负责按用户意图分流到 7 个子 skill。完整说明与走查样例见同目录 [README.md](README.md)。

## 分流规则

| 用户意图 | 进入子 skill |
|----------|--------------|
| 未指定语言 / 要"选型、推荐" | backend-select-skill（问答 → 选型 → 分流） |
| "用 Java / Spring Boot" | java-backend-skill |
| "用 Go / Gin" | go-backend-skill |
| "用 Python / FastAPI" | python-backend-skill |
| "用 Node / Express / NestJS" | nodejs-backend-skill（默认 Express，企业模块化走 NestJS） |
| 只问响应格式 / 错误码 / JWT / 契约 | backend-convention-skill |
| 只问 PostgreSQL / MySQL / MongoDB / 迁移 | database-skill |

已指定语言时**跳过 select**，直接命中对应后端 skill。后端 skill 现场生成可运行骨架，并显式引用：

> 公共规范见 backend-convention-skill，数据库见 database-skill。

## 红线

- 不在本 skill 写任何业务代码（属于 4 个后端 skill）。
- 公共规范（响应信封、错误码、契约、命名）只在 backend-convention-skill 定义，禁止复制到各处。
- 不替用户提交；不锁定版本号（后端 skill 现场查官方源，写入生成项目的 `versions.md`）。
- 子 skill 触发词变更后，同步更新本文件 description 与 README.md。
- 任何后端生成流程的交付物必须含两份文档：`api-contract.md`（接口 md）+ `docs/project-guide.md`（介绍 & 拓展性文档）；模板在 backend-convention-skill/references/。
