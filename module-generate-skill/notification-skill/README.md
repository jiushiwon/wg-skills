# notification-skill

统一通知发送模块生成器：在已有后端项目（或经 backend-generate-skill 生成的骨架）上长出短信 + 邮件通知能力。短信以**阿里云短信（Dysmsapi）**为参考实现，邮件以 **SMTP** 为参考实现。

## 功能

- **统一发送通道**：对外提供 `sendSms(phone, templateCode, params)` / `sendEmail(to, templateCode, params)` Service 接口，供 auth-skill（验证码）、payment-skill（支付结果通知）等业务模块调用
- **模板化管理**：业务方只用模板 `code`（如 `login_code`），不感知供应商模板 ID；换供应商只改配置，业务代码零改动
- **发送记录全量落库**：成功/失败/供应商返回（阿里云 BizId、邮件 Message-ID）一律入库，可审计、可对账
- **限流**：同号码/同邮箱 60s 间隔 + 每日上限（短信复用 auth-skill 的 `sms:limit`/`sms:daily`，邮件 `mail:limit`/`mail:daily`）
- **失败重试**：上限 3 次 + 指数退避（1/5/15 min）；只对可重试错误重试，业务错误（签名/模板未审核等）直接置失败
- **异步发送**：HTTP 链路只落库，真正发送走后台 worker；无队列时用定时扫表降级
- **LogSender 开发实现**：`APP_ENV=dev` 时只打日志不真发，由环境变量切换
- 管理接口：模板增删改查、发送记录查询、失败记录手动重试

## 使用方式

```
帮我加一个短信邮箱通知模块
现有 Go 项目里加阿里云短信发送，要能发验证码、记录落库
做一个 notification 模块，短信走阿里云、邮件走 SMTP，没有消息队列
```

技能会先确认短信供应商、邮件方式、是否有消息队列等关键决策（都有默认值），然后产出表结构、Service 接口、管理接口契约增量和目标语言实现。

## 产出物

| 产出 | 内容 |
|------|------|
| 表结构 | `wg_notify_template`、`wg_notify_record`，含索引、状态机、Redis 键约定 |
| Service 接口 | `sendSms` / `sendEmail`：限流 + 落库 + 异步投递，供业务模块调用 |
| 接口契约 | 管理接口（templates/records/retry）+ 可选 `/api/notify/send` |
| 实现 | 按项目技术栈展开 Java/Go/Python/Node 对应实现要点为可运行代码 |

## 目录说明

```
notification-skill/
├── SKILL.md                  # 触发词、生成流程、问答清单、模块红线
├── README.md                 # 本文件
└── references/
    ├── domain-model.md       # 领域模型、表结构 DDL、状态机、Redis 键、阿里云签名说明、时序
    ├── api-contract.md       # 接口契约增量（追加进项目 api-contract.md）
    ├── java.md               # Spring Boot 实现要点（阿里云 SDK + spring-boot-starter-mail）
    ├── go.md                 # Gin 实现要点（alibabacloud-go/dysmsapi + gomail）
    ├── python.md             # FastAPI 实现要点（alibabacloud_dysmsapi20170525 + aiosmtplib）
    └── nodejs.md             # Express/NestJS 实现要点（@alicloud/dysmsapi20170525 + nodemailer）
```

## 模块红线（摘要）

密钥只走环境变量；发送记录全量落库（含失败与供应商返回）；短信/邮件必须限流且对外接口必须鉴权；业务方只用模板 code，禁止写死供应商模板 ID；重试上限 3 次 + 指数退避且只在可重试错误时重试；异步发送（HTTP 只落库，无队列用定时扫表降级）；开发环境用 LogSender。完整红线见 SKILL.md。

## 依赖

- 规范：backend-convention-skill（响应信封、错误码、JWT、契约模板，引用不复制）。
- 本模块**独立**，不依赖其他业务模块。
- 被调用方：auth-skill（注册/登录验证码）、payment-skill（支付结果通知）等业务模块以本模块为发送通道，调用其 `sendSms` / `sendEmail` Service 接口。
