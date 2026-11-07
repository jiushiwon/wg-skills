# 微信支付模块接口契约

> 本文件由 springboot-wechat-pay-skill 生成，遵循 `backend/shared/module-output-spec.md`。
> 仅覆盖微信支付（V3），**不含支付宝**。

## 接口清单

| 方法 | 路径 | 说明 | 鉴权 |
|------|------|------|------|
| POST | /api/wechat-pay/jsapi | JSAPI 支付（公众号 / 微信内 H5） | 是 |
| POST | /api/wechat-pay/miniprogram | 小程序支付 | 是 |
| POST | /api/wechat-pay/h5 | H5 支付（手机浏览器） | 是 |
| POST | /api/wechat-pay/native | Native 支付（PC 扫码） | 是 |
| POST | /api/wechat-pay/app | App 支付 | 是 |
| POST | /api/wechat-pay/refund | 申请退款 | 是 |
| GET | /api/wechat-pay/query/{orderNo} | 查询订单 | 是 |
| POST | /api/wechat-pay/close/{orderNo} | 关闭订单 | 是 |
| GET | /api/wechat-pay/bill?date=2026-10-12 | 下载对账单 | 是 |
| POST | /api/wechat-pay/notify | 支付回调 | 否（V3 验签） |
| POST | /api/wechat-pay/refund-notify | 退款回调 | 否（V3 验签） |

## 数据模型

### PayOrderRequest（创建订单请求）

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| orderNo | string | 是 | 业务订单号（商户系统唯一，32 字符内） |
| amount | integer | 是 | 金额（**单位：分**，如 100 = 1元） |
| description | string | 是 | 商品描述（最长 127 字符） |
| openid | string | JSAPI/小程序必填 | 用户 openid |
| clientIp | string | H5 必填 | 用户真实 IP（影响支付风控） |
| attach | string | 否 | 附加数据，原样回调 |
| expireMinutes | integer | 否 | 订单过期时间（默认 30 分钟） |

### JsapiPayResponse（JSAPI/小程序响应）

| 字段 | 类型 | 说明 |
|------|------|------|
| prepayId | string | 微信预支付 ID |
| timestamp | integer | 时间戳（前端调起支付用） |
| nonceStr | string | 随机串 |
| paySign | string | 支付签名（前端 WeixinJSBridge 调起） |
| signType | string | 固定 "RSA" |

### H5PayResponse

| 字段 | 类型 | 说明 |
|------|------|------|
| h5Url | string | 微信返回的 h5_url，前端跳转 |

### NativePayResponse

| 字段 | 类型 | 说明 |
|------|------|------|
| codeUrl | string | 二维码内容，前端用 qrcode.js 生成图片 |

### AppPayResponse

| 字段 | 类型 | 说明 |
|------|------|------|
| prepayId | string | 预支付 ID |
| partnerId | string | 商户号 |
| packageValue | string | 固定 "Sign=WXPay" |
| nonceStr | string | 随机串 |
| timestamp | integer | 时间戳 |
| sign | string | 签名 |

### RefundRequest

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| orderNo | string | 是 | 原支付订单号 |
| refundNo | string | 是 | 商户退款单号（唯一） |
| refundAmount | integer | 是 | 退款金额（分，**≤ 原单金额**） |
| reason | string | 否 | 退款原因 |
| notifyUrl | string | 否 | 退款回调地址 |

### RefundResponse

| 字段 | 类型 | 说明 |
|------|------|------|
| refundNo | string | 商户退款单号 |
| status | string | PROCESSING（处理中，最终以回调为准） |

### WechatPayOrder（订单详情）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | integer | 系统 ID |
| orderNo | string | 业务订单号 |
| transactionId | string | 微信支付订单号 |
| scene | string | JSAPI / MINI_PROGRAM / H5 / NATIVE / APP |
| status | string | PENDING / PAID / CLOSED / REFUNDED |
| amount | integer | 金额（分） |
| description | string | 商品描述 |
| paidAt | string | 支付时间（ISO 8601） |
| createdAt | string | 创建时间 |

## 错误码扩展

| code | 含义 | 触发场景 |
|------|------|---------|
| -3001 | 统一下单失败 | 微信网关拒绝（如余额不足、参数错） |
| -3002 | 回调签名无效 | V3 验签失败 |
| -3003 | 订单不存在 | orderNo 未找到 |
| -3004 | 订单已支付 | 重复支付 |
| -3005 | 退款失败 | 退款金额超限或网关拒绝 |
| -3006 | 关单失败 | 订单已支付无法关闭 |
| -3007 | 证书错误 | API 证书路径/序列号错 |
| -3008 | 平台证书获取失败 | 网络问题或 mch_id 错 |

## 回调通知格式（V3）

```json
{
  "id": "EV-2018022511223320873",
  "create_time": "2026-10-12T16:21:00+08:00",
  "resource_type": "encrypt-resource",
  "event_type": "TRANSACTION.SUCCESS",
  "summary": "支付成功",
  "resource": {
    "algorithm": "AEAD_AES_256_GCM",
    "ciphertext": "...",
    "associated_data": "transaction",
    "nonce": "..."
  }
}
```

**解密后**：
```json
{
  "appid": "wx1234567890",
  "mchid": "1900000109",
  "out_trade_no": "ORDER_20261012_001",
  "transaction_id": "420000123420231012000001",
  "trade_state": "SUCCESS",
  "amount": { "total": 100, "currency": "CNY" },
  "success_time": "2026-10-12T16:21:00+08:00"
}
```

**关键字段**：
- `out_trade_no` → 业务订单号
- `transaction_id` → 微信支付订单号（必须入库）
- `trade_state` → SUCCESS / REFUND / CLOSED
