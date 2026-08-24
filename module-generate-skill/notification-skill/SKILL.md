---
name: notification-skill
description: 短信邮箱通知模块生成。用户要做短信发送、邮件发送、通知模板、验证码发送通道、发送记录、阿里云短信时使用。产出通知模板/发送记录领域模型、表结构、供其他模块调用的 Service 接口（sendSms/sendEmail）、管理接口契约增量与四语言实现要点，遵循 backend-convention-skill。触发词："通知模块"、"发短信"、"短信验证码通道"、"发邮件"、"邮件通知"、"阿里云短信"、"通知模板"、"发送记录"、"notification module"、"sms module"、"email module"、"站内信"（二期）。
---

# Notification Skill

统一通知发送模块生成器。产出：领域模型 + 表结构 + **供其他模块调用的 Service 接口** + 管理接口契约增量 + 目标语言实现。

短信以**阿里云短信（Dysmsapi）**为参考实现，邮件以 **SMTP** 为参考实现；模板化管理、发送记录落库、限流、失败重试。

**依赖**：backend-convention-skill（规范，引用不复制）。本模块**独立**，被 auth-skill（验证码）、payment-skill（支付结果通知）等业务模块作为发送通道调用。

## 核心定位：先 Service，后 HTTP

本模块的主要使用方式是**模块内 Service 调用**，不是 HTTP 接口。业务方拿到的是：

```text
sendSms(phone, templateCode, params)     // 短信
sendEmail(to, templateCode, params)      // 邮件
```

业务方只传**模板 code**（如 `login_code`）+ 变量，不感知供应商模板 ID、不感知用哪家供应商。换供应商只改配置与 `provider_template_id`，业务代码零改动。HTTP 接口（`/api/notify/send`）仅给跨服务场景，默认关闭，必须鉴权 + 限流。

## 生成流程

1. **问答确认边界**（见下节，未明确的一律按默认值并告知用户）。
2. 按 `references/domain-model.md` 产出表结构 DDL（`wg_notify_template`、`wg_notify_record`）。
3. 按 `references/api-contract.md` 把管理接口增量追加进项目 `api-contract.md`。
4. 按检测到的技术栈，展开 `references/<lang>.md` 为可运行代码（重点：`NotifyService` + 短信/邮件 Sender 实现 + 后台发送 worker/扫表）。
5. 逐条核对「模块红线」。

## 问答清单（生成前确认）

| 决策 | 选项 | 默认 |
|------|------|------|
| 短信供应商 | 阿里云 / 其他 | 阿里云（Dysmsapi） |
| 邮件方式 | SMTP / 其他 | SMTP |
| 是否有消息队列 | 有（RocketMQ/RabbitMQ 等）/ 无 | 无 → 定时扫表降级 |
| 是否需要站内信 | 要 / 不要 | 不要（二期） |
| 发送是否需要审批流 | 要 / 不要 | 不要 |

## 模块红线

1. **密钥只走环境变量**：AccessKeyId/AccessKeySecret、SMTP 密码禁止入库/日志/代码；疑似泄露立即轮换。发送日志、记录落库时禁止打印密钥与完整签名。
2. **发送记录全量落库**：成功、失败、供应商返回（BizId / Message-ID / 错误信息）一律写入 `wg_notify_record`，禁止「发了就忘」，保证可审计、可对账。
3. **必须限流**：同号码/同邮箱 60s 间隔 + 每日上限（短信复用 auth-skill 的 `sms:limit`/`sms:daily` 约定，邮件见 domain-model.md）；对外的 `/api/notify/send` 必须鉴权，防短信/邮件轰炸。
4. **业务方只用模板 code**：禁止在业务代码里写死供应商模板 ID（如阿里云 SMS_xxx）或模板内容；模板与供应商映射只存在 `wg_notify_template` 表里。
5. **重试有界且防重**：上限 3 次 + 指数退避（1min/5min/15min）；超过置终态失败，禁止重试风暴。**重试只在「未收到供应商回执 / 明确可重试错误（网络超时、限流、5xx）」时做**；明确业务错误（签名未审核、模板未审核、号码黑名单、余额不足）**不重试**，直接置失败。重试复用同一 record 行，禁止重复创建导致重复计费。
6. **异步发送**：HTTP 请求链路里只做「落库 + 投递」，真正发送走后台 worker/队列；**无队列时用定时扫表降级**（扫 `status=0` 且到达重试时间的记录发送）。发送结果通过阿里云回执（推荐）或同步返回更新记录状态。
7. **错误码用闭集**：`-1001` 参数、`-1002` 未授权、`-1004` 模板不存在、`-1005` 模板 code 冲突、`-1006` 限流、`-2000` 供应商调用失败。
8. **开发环境提供 LogSender**：`APP_ENV=dev` 时用只打日志、不真发的实现，由环境变量切换，避免开发期烧短信费/发真实邮件。

## 标准接口

见 `references/api-contract.md`：
- 管理接口：`GET /api/notify/templates`、`POST /api/notify/templates`、`PUT /api/notify/templates/{id}`、`GET /api/notify/records`、`POST /api/notify/records/{id}/retry`
- 业务触发接口（可选，默认关闭）：`POST /api/notify/send`

## 四语言实现要点

- Java：`references/java.md`（阿里云 dysmsapi20170525 SDK + spring-boot-starter-mail）
- Go：`references/go.md`（alibabacloud-go/dysmsapi + gomail）
- Python：`references/python.md`（alibabacloud_dysmsapi20170525 + aiosmtplib）
- Node：`references/nodejs.md`（@alicloud/dysmsapi20170525 + nodemailer）

## 不做

- 不做站内信（二期；本模块只负责 sms/email 通道）。
- 不做审批流（默认不要；需要时提示接 job-skill/工作流）。
- 不手算阿里云签名——优先用官方 SDK（SDK 已封装签名）；仅当环境无法安装 SDK 时，才参考 domain-model.md 的手算签名说明。
- 不复制 backend-convention-skill 已有的响应信封/错误码/JWT/契约模板，本模块只写通知特有的东西。
