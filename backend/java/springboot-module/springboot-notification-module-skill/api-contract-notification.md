# 通知模块接口契约

> 本文件由 springboot-notification-module-skill 生成，遵循 `backend/shared/module-output-spec.md`。

## 接口清单

| 方法 | 路径 | 说明 | 鉴权 |
|------|------|------|------|
| POST | /api/notifications/send | 发送通知 | 是 |
| GET | /api/notifications | 通知列表（分页） | 是 |
| GET | /api/notifications/unread-count | 未读数量 | 是 |
| PUT | /api/notifications/{id}/read | 标记已读 | 是 |
| PUT | /api/notifications/read-all | 全部已读 | 是 |
| POST | /api/notifications/sms/send | 发送短信验证码 | 否 |
| POST | /api/notifications/sms/verify | 验证短信验证码 | 否 |
| POST | /api/notifications/email/send | 发送邮件 | 是 |

## 数据模型

### NotificationResponse

| 字段 | 类型 | 说明 |
|------|------|------|
| id | integer | 通知 ID |
| title | string | 标题 |
| content | string | 内容 |
| type | string | system / message / alert |
| isRead | boolean | 是否已读 |
| createdAt | string | ISO 8601 |

### SendNotificationRequest

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| userId | integer | 是 | 目标用户 ID |
| title | string | 是 | 标题 |
| content | string | 是 | 内容 |
| type | string | 否 | 默认 system |

## 错误码扩展

| code | 含义 | 触发场景 |
|------|------|---------|
| -3001 | 短信发送失败 | 第三方短信服务异常 |
| -3002 | 验证码无效 | 验证码错误或过期 |
| -3003 | 验证码过期 | 超过有效期（默认 5 分钟） |
| -3004 | 发送过于频繁 | 同一手机号 60s 内重复发送 |
| -3005 | 邮件发送失败 | SMTP 异常 |
