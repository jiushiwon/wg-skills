---
name: backend-select-skill
description: Use when the user wants to generate a backend project from scratch but the tech stack is undecided. Gathers requirements via questions and recommends "language + framework + database + middleware", then routes to the matching backend skill. Triggers: "生成后端项目", "搭建后端骨架", "初始化后端服务", "backend generate", "帮我做个后端接口", "后端选型", "用什么语言写后端".
---

# Backend Select Skill

后端生成入口。当用户**未指定语言**或明确要"选型/推荐"时进入；用户已指定语言（如"用 Java"）时直接进对应后端 skill，本 skill 跳过。

## 工作流程

1. **分批问答**（别一次抛完）：
   - 这个后端服务解决什么问题？目标用户是谁？
   - 列出 3~5 个核心实体（如用户、订单、文章）。
   - 预期并发/流量规模？（个人 / 中小型 / 高并发）
   - 团队熟哪种语言？Java / Python / Node.js / Go，还是无所谓？
   - 是否需要认证、权限、文件上传等通用能力？
   - 是否对接 uni-app 前端？
   - 部署偏好？Docker / K8s / Serverless？

2. **选型**：用 `references/tech-stack-decision-matrix.md` 给推荐：

   | 项目类型 | 推荐 |
   |----------|------|
   | 企业级 / 复杂业务 | Java + Spring Boot |
   | 快速 API / AI / 数据 | Python + FastAPI |
   | 全栈 JS / MVP | Node.js + Express |
   | 全栈 JS / 企业模块化 | Node.js + NestJS |
   | 高并发 / 微服务 | Go + Gin |

   团队强偏好优先。

3. **数据库**：调用 `database-skill` 完成 PostgreSQL / MySQL / MongoDB 选型与表前缀（默认 `wg`）。

4. **中间件**：按需问 Redis / Kafka / Elasticsearch / 对象存储 / SMS / Swagger（YAGNI，不要的全不加）。

5. **写 spec.md**：定位 / 模块 / 实体 / API 轮廓 / 选型 / 接口规范，与用户确认后再分流。spec.md 中必须记录「是否对接 uni-app 前端」的答案——分流时交给后端 skill，用于在生成的 `docs/project-guide.md` 中保留对应前端对接段（uni-app 与 axios 两段默认都写）。

## 分流

按选定语言显式调用对应后端 skill，并声明：

> 公共规范见 backend-convention-skill，数据库见 database-skill。

分流时必须把 spec.md 交给目标后端 skill，并提醒其交付物包含：可运行骨架 + `api-contract.md`（接口 md）+ `docs/project-guide.md`（介绍 & 拓展性文档）+ `versions.md` + `CLAUDE.md`/`AGENTS.md`。

| 选定 | 调用 |
|------|------|
| Java | java-backend-skill |
| Go | go-backend-skill |
| Python | python-backend-skill |
| Node.js | nodejs-backend-skill（默认 Express；要企业模块化走 NestJS 分支） |

## 红线

- 不在本 skill 写任何业务代码（属于 4 个后端 skill）。
- 不替用户提交。
- 不锁定版本号（后端 skill 现场查询官方源，写入 `versions.md`）。
