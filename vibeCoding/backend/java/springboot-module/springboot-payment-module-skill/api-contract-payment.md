# 支付模块接口契约

> 本文件由 springboot-payment-module-skill 生成，遵循 `backend/shared/module-output-spec.md`。

## 接口清单

| 方法 | 路径 | 说明 | 鉴权 |
|------|------|------|------|
| POST | /api/payments/create | 创建支付订单 | 是 |
| GET | /api/payments/{id} | 查询支付详情 | 是 |
| GET | /api/payments | 支付记录列表（分页） | 是 |
| POST | /api/payments/notify/wechat | 微信支付回调 | 否（签名验证） |
| POST | /api/payments/notify/alipay | 支付宝回调 | 否（签名验证） |
| POST | /api/payments/{id}/refund | 申请退款 | 是 |

## 数据模型

### PaymentResponse

| 字段 | 类型 | 说明 |
|------|------|------|
| id | integer | 支付记录 ID |
| orderNo | string | 业务订单号 |
| tradeNo | string | 第三方交易号 |
| channel | string | 支付渠道（wechat / alipay） |
| amount | integer | 金额（分） |
| status | string | PENDING / SUCCESS / FAILED / REFUNDED |
| paidAt | string | 支付时间（ISO 8601） |
| createdAt | string | 创建时间 |

### CreatePaymentRequest

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| orderNo | string | 是 | 业务订单号（唯一） |
| channel | string | 是 | wechat / alipay |
| amount | integer | 是 | 金额（分） |
| description | string | 否 | 商品描述 |
| notifyUrl | string | 否 | 回调地址（默认 /api/payments/notify/{channel}） |

## 错误码扩展

| code | 含义 | 触发场景 |
|------|------|---------|
| -3001 | 支付创建失败 | 第三方网关拒绝 |
| -3002 | 回调签名无效 | 签名验证失败 |
| -3003 | 订单不存在 | orderNo 未找到 |
| -3004 | 订单已支付 | 重复支付 |
| -3005 | 退款失败 | 退款金额超限或网关拒绝 |
