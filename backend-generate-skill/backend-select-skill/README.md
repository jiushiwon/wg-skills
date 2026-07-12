# backend-select-skill

后端生成**入口**。当你想做后端但还没定技术栈时，它会通过问答收集需求，推荐"语言 + 框架 + 数据库 + 中间件"，然后分流到对应后端 skill。

## 适合场景

- "我想做个后端，但不知道用 Java 还是 Node"
- "帮我选一个后端技术栈"
- "我有一堆需求，帮我梳理成 spec.md"

**不适合**：你已经确定用某种语言（如"用 Java 写后端"）——那种情况直接进 java-backend-skill，跳过本 skill。

## 触发关键词

`生成后端项目`、`搭建后端骨架`、`初始化后端服务`、`backend generate`、`帮我做个后端接口`、`后端选型`、`用什么语言写后端`

## 输入（你需要回答）

分批问，不会一次抛完：

1. 这个后端解决什么问题？目标用户是谁？
2. 3~5 个核心实体（如用户、订单、文章）
3. 预期流量规模（个人 / 中小型 / 高并发）
4. 团队熟哪种语言（Java / Python / Node.js / Go / 无所谓）
5. 是否需要认证、权限、文件上传
6. 是否对接 uni-app 前端
7. 部署偏好（Docker / K8s / Serverless）

## 输出

- 项目根目录 `spec.md`（定位 / 模块 / 实体 / API 轮廓 / 选型 / 接口规范 / 是否对接 uni-app 前端）
- 与你确认后，按选定语言**分流**到对应后端 skill，由其交付：可运行骨架 + `api-contract.md`（接口 md）+ `docs/project-guide.md`（介绍 & 拓展性文档）+ `versions.md` + `CLAUDE.md`/`AGENTS.md`

## 调用样例

```
你：生成后端项目

AI：我先问几个问题。① 这个后端解决什么问题？② 核心实体有哪些？

你：做一个博客，用户能发文章、评论。实体：用户、文章、评论、标签。

AI：③ 流量规模？④ 团队熟哪种语言？

你：中小型，团队熟 Node.js。

AI：推荐 Node.js + Express + PostgreSQL。是否需要 Redis / Elasticsearch？

你：都不要。

AI：已写入 spec.md，请确认 → 分流到 nodejs-backend-skill 生成。
```

## 与其他 skill 的关系

- 调用 `database-skill` 完成数据库选型
- 分流到 `java-backend-skill` / `go-backend-skill` / `python-backend-skill` / `nodejs-backend-skill`
- 告诉用户"公共规范见 backend-convention-skill"

## 不做

- 不写业务代码（属于 4 个后端 skill）
- 不替你提交
- 不锁定版本号
