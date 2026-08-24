# payment-skill — 接口契约增量

以下接口追加进项目根目录 `api-contract.md`，格式遵循 backend-convention-skill `references/api-contract-spec.md`。业务接口 HTTP 状态码统一 200，结果走 `{ code, message, data }` 信封；鉴权栏为 `Bearer` 的接口需要有效 access token。

> **信封例外（重要）**：`POST /api/pay/notify/{channel}` 与 `POST /api/pay/notify/{channel}/refund` 是渠道回调接口，公网可达、无鉴权（安全完全依赖渠道验签），且**不走统一响应信封**——渠道要求收到特定应答格式才停止重推：微信返回 `{"code":"SUCCESS","message":"成功"}`（或旧版 XML），支付宝返回纯文本 `success`。这是响应信封红线的**合法例外**，仅限这四个回调接口，原因是应答格式由渠道协议强制规定，不遵守会导致渠道持续重推。其余接口一律走信封。

> **渠道单选**：本模块仅支持单一渠道接入（微信支付或支付宝），接口路径中 `{channel}` 按实际接入渠道返回（wechat 或 alipay）。

---

## POST /api/pay/orders

**描述**：创建支付单并向渠道统一下单，返回前端拉起支付所需参数。金额由服务端按业务单据重算（红线），客户端只传业务单据号。

**鉴权**：Bearer（下单需登录态，`userId` 从 access token 取，**不信任客户端传入的归属**，与"金额不信任客户端"一致。若为服务端到服务端调用，由内部网关鉴权后传入 `userId`）

**请求参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| outTradeNo | string | 是 | 商户单号，全局唯一，业务方单据映射 |
| userId | integer | 否 | 归属用户 ID，默认从 Bearer token 取；仅服务端到服务端调用时由内部传入 |
| subject | string | 是 | 商品标题，≤128 字符 |
| amount | integer | 是 | 金额，单位：分。服务端会按业务单据二次核对，不一致即拒绝 |
| channel | string | 是 | `wechat` / `alipay`（单选，按接入渠道） |
| scene | string | 是 | 微信：`native` / `jsapi`；支付宝：`f2f` / `wap` |
| openId | string | 否 | JSAPI 小程序场景必填（微信 openid） |

**请求示例**

```json
{ "outTradeNo": "BIZ202607120001", "subject": "会员年卡", "amount": 19900, "channel": "wechat", "scene": "native" }
```

**响应结构**

| 字段 | 类型 | 说明 |
|------|------|------|
| outTradeNo | string | 商户单号 |
| channel | string | 渠道 |
| payParams | object | 拉起支付所需参数，按渠道/场景不同（见下） |

`payParams` 说明：
- 微信 Native：`{ "codeUrl": "weixin://wxpay/bizpayurl?pr=xxx" }`（前端生成二维码）
- 微信 JSAPI：`{ "appId","timeStamp","nonceStr","package","signType","paySign" }`（小程序 `wx.requestPayment` 参数）
- 支付宝（当面付/wap）：`{ "orderString": "alipay_sdk=...&sign=..." }`（客户端 SDK 直接传）

**响应示例**

```json
{
  "code": 0, "message": "success",
  "data": { "outTradeNo": "BIZ202607120001", "channel": "wechat", "payParams": { "codeUrl": "weixin://wxpay/bizpayurl?pr=abc" } }
}
```

**错误码**：`-1001` 参数校验失败；`-1005` outTradeNo 已存在（重复下单）；`-2000` 渠道下单失败（message 含渠道错误码摘要）

---

## GET /api/pay/orders/{outTradeNo}

**描述**：查询支付单状态。本地未支付时会主动向渠道查单做一次对账同步（防回调丢失）。

**鉴权**：Bearer

**响应结构**

| 字段 | 类型 | 说明 |
|------|------|------|
| outTradeNo | string | 商户单号 |
| channel | string | 渠道 |
| amount | integer | 金额，单位：分 |
| refundedAmount | integer | 已退款累计，单位：分 |
| status | integer | 0 待支付 1 已支付 2 已关闭 3 退款中 4 已退款 |
| providerTradeNo | string | 渠道交易号，可空 |
| paidAt | string | 支付完成时间（ISO8601），可空 |

**响应示例**

```json
{ "code": 0, "message": "success", "data": { "outTradeNo": "BIZ202607120001", "channel": "wechat", "amount": 19900, "refundedAmount": 0, "status": 1, "providerTradeNo": "4200001234", "paidAt": "2026-07-12T10:00:00+08:00" } }
```

**错误码**：`-1002` 未授权；`-1004` 支付单不存在

---

## POST /api/pay/orders/{outTradeNo}/close

**描述**：主动关闭未支付的支付单。**先调渠道关单，成功后再改本地状态**（防关单瞬间支付成功的资损）；渠道关单失败返回错误、不改本地。

**鉴权**：Bearer

**请求参数**：无

**响应示例**

```json
{ "code": 0, "message": "success", "data": null }
```

**错误码**：`-1002` 未授权；`-1004` 支付单不存在；`-1005` 状态冲突（非待支付不可关单）；`-2000` 渠道关单失败

---

## POST /api/pay/refunds

**描述**：申请退款，支持部分退款。退款总额（含本次）不得超过已支付金额（用支付单 `refunded_amount` 累计校验）。退款是异步的，结果以渠道退款回调/查单为准。

**鉴权**：Bearer

**请求参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| outTradeNo | string | 是 | 原支付单的商户单号 |
| outRefundNo | string | 是 | 商户退款单号，全局唯一 |
| amount | integer | 是 | 本次退款金额，单位：分 |
| reason | string | 否 | 退款原因 |

**请求示例**

```json
{ "outTradeNo": "BIZ202607120001", "outRefundNo": "REF202607120001", "amount": 9900, "reason": "用户取消" }
```

**响应结构**

| 字段 | 类型 | 说明 |
|------|------|------|
| outRefundNo | string | 商户退款单号 |
| status | integer | 0 退款中（已受理，结果待回调/查单） |

**响应示例**

```json
{ "code": 0, "message": "success", "data": { "outRefundNo": "REF202607120001", "status": 0 } }
```

**错误码**：`-1001` 参数校验失败；`-1002` 未授权；`-1004` 支付单不存在；`-1005` 状态冲突（未支付不可退 / outRefundNo 重复 / 退款超额）；`-2000` 渠道退款调用失败

---

## GET /api/pay/refunds/{outRefundNo}

**描述**：查询退款单状态。本地状态为"退款中"（0）时，主动向渠道查单同步状态（防回调丢失）。支付宝退款主要依赖主动查单（回调不保证）。

**鉴权**：Bearer

**响应结构**

| 字段 | 类型 | 说明 |
|------|------|------|
| outRefundNo | string | 商户退款单号 |
| outTradeNo | string | 原支付单商户单号 |
| amount | integer | 退款金额，单位：分 |
| status | integer | 0 退款中 1 成功 2 失败 |
| providerRefundNo | string | 渠道退款单号，可空 |

**响应示例**

```json
{ "code": 0, "message": "success", "data": { "outRefundNo": "REF202607120001", "outTradeNo": "BIZ202607120001", "amount": 9900, "status": 1, "providerRefundNo": "202607122200123456" } }
```

**错误码**：`-1002` 未授权；`-1004` 退款单不存在

---

## POST /api/pay/notify/{channel}

**描述**：渠道支付结果回调。`{channel}` 按实际接入渠道填写（wechat/alipay）。**无鉴权、不走响应信封**，安全完全依赖渠道验签。

**鉴权**：无（公网可达；验签是唯一的防伪手段）

**处理**：验签 → 解密报文 → `FOR UPDATE` 锁支付单 + 状态判断幂等推进 → 回填 `provider_trade_no`/`paid_at`/`notify_payload` → 发事件通知业务方。

**应答**（渠道格式，非信封）：
- 微信：`{ "code": "SUCCESS", "message": "成功" }`
- 支付宝：`success`

验签失败或处理异常返回失败应答（HTTP 500），渠道会重推；重复回调已处理时返回成功应答让渠道停止重推。

---

## POST /api/pay/notify/{channel}/refund

**描述**：渠道退款结果回调。**无鉴权、不走响应信封**，安全完全依赖渠道验签。

**鉴权**：无（公网可达；验签是唯一的防伪手段）

**处理**：验签 → **聚合根优先锁序**（先锁支付单再锁退款单，防死锁）→ 退款单判重 → 退款成功回写 `refunded_amount`（唯一回写点）并按全额/部分推进支付单状态；退款失败恢复支付单状态 → 发事件通知业务方。

**应答**（渠道格式，非信封）：
- 微信：`{ "code": "SUCCESS", "message": "成功" }`
- 支付宝：`success`

> **支付宝退款**：主要依赖主动查单（`GET /api/pay/refunds/{outRefundNo}`），回调不保证送达，定时任务应定期查单同步。
