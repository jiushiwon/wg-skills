---
name: module-generate-skill
description: 后端业务模块生成总入口。用户要在后端项目里加某个具体业务模块时，按模块分流到子技能：登录鉴权进 auth-skill；组织架构/RBAC/角色权限进 org-permission-skill；AI 聊天/带记忆的对话进 ai-chat-skill；短信/邮件/通知进 notification-skill；支付/微信支付宝/退款进 payment-skill。所有模块遵循 backend-convention-skill 的统一响应信封、错误码、JWT、api-contract 模板，并与 backend-generate-skill 串联（无骨架时先生成骨架）。触发词："生成 XX 模块"、"做一个 XX 系统"、"加登录"、"加权限"、"RBAC"、"角色菜单"、"对接支付"、"微信支付"、"支付宝"、"短信验证码"、"图形验证码"、"密码找回"、"忘记密码"、"微信小程序登录"、"uniapp 登录"、"发邮件"、"AI 聊天"、"带记忆的对话"、"会话记忆"、"退款"、"对账"。
---

# Module Generate Skill

后端业务模块生成父入口，本身不写代码，只负责识别目标模块并分流到子技能。设计文档见 `docs/tmp/2026-07-12-module-generate-skill-design.md`。

## 定位

- `backend-generate-skill`：项目**骨架**怎么搭（选型、目录、规范、Docker）。
- `module-generate-skill`（本技能）：骨架之上，某个**业务模块**怎么长出来（领域模型、表结构、接口契约、四语言实现要点）。

两者可串联：用户没骨架时先走 backend-generate-skill，再回本技能加模块。

## 分流规则

| 用户意图 | 进入子技能 |
|----------|------------|
| 登录、注册、鉴权、JWT、短信验证码登录、图形验证码、密码找回重置、uniapp/微信小程序登录、第三方登录 | auth-skill |
| 组织架构、部门、RBAC、角色、权限、菜单、数据权限 | org-permission-skill |
| AI 聊天、对话、带记忆、会话、流式输出、上下文 | ai-chat-skill |
| 短信、验证码发送、邮件、通知、消息推送 | notification-skill |
| 支付、微信支付、支付宝、退款、回调、对账 | payment-skill |
| 用户要"新项目 / 骨架 / 选型" | 转 backend-generate-skill，不本技能处理 |

## 执行流程（命中模块后）

1. **技术栈检测**：读项目根 `pom.xml` / `go.mod` / `pyproject.toml` / `requirements.txt` / `package.json` 判断语言与框架；检测不到时问用户，或建议先走 backend-generate-skill 生成骨架。
2. **依赖模块检查**：目标模块若依赖其他模块（如 org-permission 依赖 auth 的用户表），确认依赖已存在或征得用户同意一并生成。
3. 进入对应模块子技能，按其 SKILL.md 的「生成流程」执行。
4. 交付物：领域模型 + 表结构 DDL + 接口契约增量（追加到项目 `api-contract.md`）+ 目标语言的可运行代码。

## 通用红线（所有子技能继承）

1. 公共规范只在 backend-convention-skill 定义（响应信封、错误码闭集、JWT、契约模板），子技能**引用不复制**。
2. 表前缀默认 `wg`，与 backend-generate-skill 一致；用户可覆盖。
3. 错误码从 `response-format.md` 闭集取；模块特有错误优先 `-1` + 明确 message。
4. 接口契约增量必须按 `api-contract-spec.md` 模板写全。
5. 不锁定版本号；不替用户提交。
6. 安全敏感默认值必须收敛：密码 bcrypt、令牌有过期、密钥走环境变量、回调必验签。

## 子技能触发词变更

任何子技能修改触发词后，必须同步更新本文件 description 与 README.md，并检查与其他技能无冲突。
