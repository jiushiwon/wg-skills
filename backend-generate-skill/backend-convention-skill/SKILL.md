---
name: backend-convention-skill
description: Use when generating or reviewing any backend project that needs cross-language mandatory conventions. Covers unified response envelope, error codes, JWT auth, naming rules, environment variables, api-contract skeleton, and project meta-file templates. Referenced by the 4 backend skills; rarely triggered alone. Triggers: "后端规范", "统一返回格式", "api 契约", "错误码规范", "JWT 规范".
---

# Backend Convention Skill

本 skill 是后端规范的**唯一定义处**。4 个后端生成 skill（java / go / python / nodejs）引用它，禁止复制规则文本。

## 红线（不可绕过）

1. 所有接口返回 `{ code, message, data }`；`code >= 0` 成功，`< 0` 失败；HTTP 一律 200（仅 404/405/500 例外）。
2. 业务异常带 `code + message`；控制器只返数据，由拦截器/中间件统一包装；禁止业务代码手造 HTTP 状态码。
3. 边界校验失败返 `-1001`。
4. JWT：登录签发、`Authorization: Bearer` 携带；前端不得硬编码未声明的字段/枚举/路径/错误码。
5. 命名：表/集合 snake_case + 前缀；路由 `/api/<资源>`；环境变量全大写。
6. `api-contract.md` 是前后端唯一事实来源；实现与契约冲突时**契约赢**。
7. `.env` 必须 gitignore；敏感信息不进仓库。
8. 每个生成的后端项目必须同时落地两份文档：`docs/project-guide.md`（介绍 & 拓展性文档）与 `api-contract.md`（接口 md），与代码同时交付，缺一则视为生成未完成。

## 引用索引

| 文件 | 内容 |
|------|------|
| `references/response-format.md` | 响应信封结构、字段约束、错误码表、列表分页格式 |
| `references/api-contract-spec.md` | 12 节契约规范（含强制红线、枚举字典、接口模板、变更规则） |
| `references/default-api-contract.md` | 默认接口 md 模板（health/auth/users 全量写全），生成 `api-contract.md` 的起点 |
| `references/project-guide-template.md` | 介绍 & 拓展性文档模板（技术栈/对接前端/接口范式/拦截器/出入参），生成 `docs/project-guide.md` 的依据 |
| `references/env-config-guide.md` | 环境变量命名、各语言配置加载方式、`.env.example` 模板、安全规则 |
| `references/versions-template.md` | 生成项目 `versions.md` 的模板（只保留所选栈的行） |
| `references/claude-md-template.md` | 生成项目 `CLAUDE.md` 的模板（简短红线 + 重定向 AGENTS.md） |
| `references/agents-md-template.md` | 生成项目 `AGENTS.md` 的模板（详细规范入口） |

## 给后端 skill 的引用方式

后端 skill 主体第一句必须声明：

> 依赖：backend-convention-skill（规范）、database-skill（DB）

生成代码时：
- 信封/错误码/分页 → 按 `response-format.md`
- api-contract → 以 `default-api-contract.md` 为起点，按 `api-contract-spec.md` 补全（前端严格对齐）
- 介绍 & 拓展性文档 → 按 `project-guide-template.md`，栈特定段取各后端 skill skeleton 的「project-guide 填充段」
- 环境变量 → 按 `env-config-guide.md`
- 项目元文件 → 按 `claude-md-template.md` / `agents-md-template.md`

**禁止**：把上述规则复制进后端 skill 主体，避免漂移。

## 不做

- 不写任何业务代码（属于 4 个后端 skill）。
- 不替用户提交（`git commit`）。
- 不在本 skill 锁定版本号（版本由后端 skill 现场查询官方源，写入 `versions.md`）。
