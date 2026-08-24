# module-generate-skill

后端**业务模块级**生成器：`backend-generate-skill` 搭骨架，本技能在骨架上长出具体业务模块——登录鉴权、组织权限、AI 聊天、短信邮件、支付等。每个模块按统一规范产出领域模型、表结构、接口契约和四语言（Java/Go/Python/Node）实现要点，避免每次重复跟 AI 申明"我要做什么、按什么边界做"。

## 功能

- 用户说"加登录 / 加权限 / 对接支付 / 做 AI 聊天 / 发短信"等，自动识别目标模块并分流。
- 无项目骨架时，串联 backend-generate-skill 先生成骨架。
- 自动检测已有项目技术栈，按对应语言产出实现。
- 所有模块强制遵循 backend-convention-skill：统一响应信封 `{code,message,data}`、错误码闭集、JWT 约定、api-contract 模板。
- 每个模块内置「红线」：把该模块最容易做错的事（支付验签幂等、令牌安全、短信限流…）写成强制约束。

## 使用方式

在 Claude Code 中直接用自然语言描述要做的模块即可触发：

```
帮我做一个登录鉴权模块，手机号 + 验证码登录
现有 Spring Boot 项目里加一套 RBAC 权限，要菜单权限和数据权限
对接微信支付和支付宝，需要退款和对账
做一个带记忆的 AI 聊天模块，会话要持久化
```

也可与 backend-generate-skill 串联：

```
帮我用 Go 搭个后端，然后加上组织权限和短信通知模块
```

## 当前模块（一期）

| 子技能 | 模块 | 内容 |
|--------|------|------|
| auth-skill | 登录鉴权 | JWT 双令牌、账号密码/短信验证码登录、图形验证码、密码找回重置、uniapp 微信小程序登录、（可选）第三方 oauth 登录；可独立使用（自带选型）或组合 backend-generate-skill |
| org-permission-skill | 组织与权限 | 组织树、用户-角色-权限 RBAC、菜单权限、数据权限 |
| ai-chat-skill | AI 聊天 | 会话管理、消息持久化、短期+长期记忆、流式输出、上下文裁剪 |
| notification-skill | 短信邮箱 | 阿里云短信参考实现、邮件、模板、限流、发送记录 |
| payment-skill | 支付 | 微信/支付宝下单、回调验签、退款、幂等、对账 |

二期规划：电商、工作流与定时任务、三方 API 对接、文件存储。完整全景与设计决策见 `docs/tmp/2026-07-12-module-generate-skill-design.md`。

## 目录说明

```
module-generate-skill/
├── SKILL.md               # 父入口：模块识别 + 分流 + 技术栈检测
├── README.md              # 本文件
├── auth-skill/            # 登录鉴权模块（含 references/ 领域模型、契约、四语言要点）
├── org-permission-skill/  # 组织与权限模块
├── ai-chat-skill/         # AI 聊天模块
├── notification-skill/    # 短信邮箱模块
└── payment-skill/         # 支付模块
```

每个子技能结构一致：`SKILL.md`（触发词、生成流程、问答清单、模块红线）+ `README.md` + `references/`（`domain-model.md` 表结构与状态机、`api-contract.md` 契约增量、`java/go/python/nodejs.md` 四语言实现要点）。

## 依赖关系

- 规范依赖：`backend-generate-skill/backend-convention-skill`（引用不复制）。
- 模块依赖：`org-permission-skill`、`ai-chat-skill` 依赖 `auth-skill` 的用户表与当前用户注入；`payment-skill`、`notification-skill` 独立。
