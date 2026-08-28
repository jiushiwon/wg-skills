# backend-convention-skill

后端规范的**唯一定义处**。所有跨语言强制规范（响应信封、错误码、JWT、命名、环境变量、api-contract、项目元文件）都在这里定义，4 个后端 skill 引用它，禁止复制。

## 适合场景

- "后端接口统一返回格式怎么定？"
- "错误码规范是什么？"
- "api-contract.md 怎么写？"
- "JWT 鉴权的最小约定？"

**不适合**：生成具体后端项目（那是 4 个后端 skill 的事）。

## 触发关键词

`后端规范`、`统一返回格式`、`api 契约`、`错误码规范`、`JWT 规范`

## 核心规范速览

| 规范 | 内容 | 详见 |
|------|------|------|
| 响应信封 | `{ code, message, data }`，`code >= 0` 成功，HTTP 一律 200 | `references/response-format.md` |
| 错误码 | -1 / -1001 / -1002 / -1003 / -1004 / -1005 / -2000 | `references/response-format.md` |
| api-contract | 前后端唯一事实来源，12 节强制规范 | `references/api-contract-spec.md` |
| 默认接口 md 模板 | health/auth/users 全量接口，生成 `api-contract.md` 的起点 | `references/default-api-contract.md` |
| 介绍 & 拓展性文档模板 | 技术栈/对接前端/接口范式/拦截器/出入参，生成 `docs/project-guide.md` 的依据 | `references/project-guide-template.md` |
| 环境变量 | APP_/DB_/JWT_/CORS_ORIGINS + 可选 REDIS_/KAFKA_/S3_ 全量表 + 安全规则 | `references/env-config-guide.md` |
| 项目元文件 | CLAUDE.md（简短）+ AGENTS.md（详细） | `references/claude-md-template.md` / `agents-md-template.md` |
| 版本记录 | versions.md 模板（只保留所选栈） | `references/versions-template.md` |

## 红线

1. 所有接口返回 `{ code, message, data }`，HTTP 一律 200（仅 404/405/500 例外）
2. 业务异常带 `code + message`，控制器只返数据，由拦截器统一包装
3. 边界校验失败返 `-1001`
4. `api-contract.md` 是前后端唯一事实来源，实现与契约冲突时**契约赢**
5. `.env` 必须 gitignore
6. 每个生成的后端项目必须同时落地 `docs/project-guide.md` 与 `api-contract.md` 两份文档

## 调用样例

```
你：后端统一返回格式怎么定？

AI：所有接口返回 { code, message, data }：
  - code >= 0 成功，< 0 失败；HTTP 一律 200
  - 列表 data 含 { page, pageSize, total, list }
  前端必须读 code 判断业务状态，禁止用 HTTP 状态码。
  详见 backend-convention-skill/references/response-format.md。
```

## 与其他 skill 的关系

被 4 个后端 skill（java / go / python / nodejs）引用，规则文本不复制。

## 不做

- 不写业务代码
- 不锁定版本号
- 不替你提交
