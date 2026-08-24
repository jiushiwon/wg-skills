# notification-skill — 接口契约增量

以下接口追加进项目根目录 `api-contract.md`，格式遵循 backend-convention-skill `references/api-contract-spec.md`。所有接口 HTTP 状态码统一 200，业务结果走 `{ code, message, data }` 信封。

> **主要使用方式是模块内 Service 调用**（`sendSms(phone, templateCode, params)` / `sendEmail(to, templateCode, params)`），不是 HTTP。下列管理接口供后台运维模板与查看发送记录；`POST /api/notify/send` 仅给跨服务场景，默认关闭，必须鉴权 + 限流。

---

## GET /api/notify/templates

**描述**：分页查询通知模板列表，可按 channel 筛选。

**鉴权**：Bearer（后台管理）

**请求参数**（query）

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | integer | 否 | 默认 1 |
| pageSize | integer | 否 | 默认 20 |
| channel | string | 否 | sms / email，不传查全部 |
| keyword | string | 否 | 按 code 模糊匹配 |

**响应结构**

| 字段 | 类型 | 说明 |
|------|------|------|
| page | integer | 当前页 |
| pageSize | integer | 每页条数 |
| total | integer | 总数 |
| list | array | 模板项：`{ id, code, channel, providerTemplateId, content, variables, status, createdAt, updatedAt }` |

**响应示例**

```json
{
  "code": 0, "message": "success",
  "data": {
    "page": 1, "pageSize": 20, "total": 1,
    "list": [
      { "id": 1, "code": "login_code", "channel": "sms", "providerTemplateId": "SMS_123456789",
        "content": null, "variables": { "code": "验证码" }, "status": 1,
        "createdAt": "2026-07-12T10:00:00+08:00", "updatedAt": "2026-07-12T10:00:00+08:00" }
    ]
  }
}
```

**错误码**：`-1002` 未授权

---

## POST /api/notify/templates

**描述**：新建通知模板。`code` 全局唯一。

**鉴权**：Bearer（后台管理）

**请求参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| code | string | 是 | 业务标识，字母数字下划线，如 `login_code` |
| channel | string | 是 | sms / email |
| providerTemplateId | string | 是 | 阿里云模板 CODE（SMS_xxx）或邮件主题模板 |
| content | string | 否 | 邮件正文模板（`{{var}}` 占位）；短信不传 |
| variables | object | 否 | 模板变量定义，如 `{ "code": "验证码" }` |
| status | integer | 否 | 1 启用 0 停用，默认 1 |

**请求示例**

```json
{ "code": "login_code", "channel": "sms", "providerTemplateId": "SMS_123456789", "variables": { "code": "验证码" } }
```

**响应示例**

```json
{ "code": 0, "message": "success", "data": { "id": 1, "code": "login_code" } }
```

**错误码**：`-1001` 参数校验失败；`-1002` 未授权；`-1005` 模板 code 已存在

---

## PUT /api/notify/templates/{id}

**描述**：更新通知模板（含启停）。`code` 不允许修改（业务方已依赖）。

**鉴权**：Bearer（后台管理）

**请求参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| providerTemplateId | string | 否 | 供应商模板 ID |
| content | string | 否 | 邮件正文模板 |
| variables | object | 否 | 模板变量定义 |
| status | integer | 否 | 1 启用 0 停用 |

**请求示例**

```json
{ "status": 0 }
```

**响应示例**

```json
{ "code": 0, "message": "success", "data": null }
```

**错误码**：`-1001` 参数校验失败；`-1002` 未授权；`-1004` 模板不存在

---

## GET /api/notify/records

**描述**：分页查询发送记录，可按 channel / status 筛选。用于审计与对账。

**鉴权**：Bearer（后台管理）

**请求参数**（query）

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | integer | 否 | 默认 1 |
| pageSize | integer | 否 | 默认 20 |
| channel | string | 否 | sms / email |
| status | integer | 否 | 0 待发送 1 成功 2 失败 |
| target | string | 否 | 按手机号/邮箱模糊匹配 |

**响应结构**

| 字段 | 类型 | 说明 |
|------|------|------|
| page | integer | 当前页 |
| pageSize | integer | 每页条数 |
| total | integer | 总数 |
| list | array | 记录项：`{ id, channel, target, templateCode, params, provider, providerRequestId, status, errorMsg, retryCount, createdAt, sentAt }` |

**响应示例**

```json
{
  "code": 0, "message": "success",
  "data": {
    "page": 1, "pageSize": 20, "total": 1,
    "list": [
      { "id": 100, "channel": "sms", "target": "138****8000", "templateCode": "login_code",
        "params": { "code": "482913" }, "provider": "aliyun", "providerRequestId": "900619829936498440^0",
        "status": 1, "errorMsg": null, "retryCount": 0,
        "createdAt": "2026-07-12T10:00:00+08:00", "sentAt": "2026-07-12T10:00:01+08:00" }
    ]
  }
}
```

**错误码**：`-1002` 未授权

---

## POST /api/notify/records/{id}/retry

**描述**：手动重试一条失败记录（`status=2`）。重置为待发送、清零退避，交给后台 worker 重新发送。仅对终态失败记录有效。

**鉴权**：Bearer（后台管理）

**请求参数**：无

**响应示例**

```json
{ "code": 0, "message": "success", "data": null }
```

**错误码**：`-1001` 记录非失败终态（不可重试）；`-1002` 未授权；`-1004` 记录不存在

---

## POST /api/notify/send（可选，默认关闭）

**描述**：跨服务触发发送。**主要使用方式是模块内 Service 调用，本接口仅供跨服务场景**，默认关闭（配置开关），开启时必须鉴权 + 限流，防短信/邮件轰炸。

**鉴权**：Bearer + 内部调用标记（如内网网关 / 服务间 token），禁止对公网开放

**请求参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| channel | string | 是 | sms / email |
| target | string | 是 | 手机号 / 邮箱 |
| templateCode | string | 是 | 模板 code（业务方只用 code） |
| params | object | 否 | 模板变量，如 `{ "code": "482913" }` |

**请求示例**

```json
{ "channel": "sms", "target": "13800138000", "templateCode": "login_code", "params": { "code": "482913" } }
```

**响应结构**

| 字段 | 类型 | 说明 |
|------|------|------|
| recordId | integer | 发送记录 ID（已落库，异步发送） |

**响应示例**

```json
{ "code": 0, "message": "success", "data": { "recordId": 100 } }
```

> 接口落库后即返回，不代表已送达；送达状态查 `GET /api/notify/records`。

**错误码**：`-1001` 参数校验失败；`-1002` 未授权；`-1004` 模板不存在或已停用；`-1006` 触发限流
