# 微信支付模块接口契约

> 由 fastapi-wechat-pay-skill 生成。**仅覆盖微信支付**，不含支付宝。

## 接口清单

| 方法 | 路径 | 说明 | 鉴权 |
|------|------|------|------|
| POST | /api/wechat-pay/jsapi | JSAPI 公众号支付 | 是 |
| POST | /api/wechat-pay/miniprogram | 小程序支付 | 是 |
| POST | /api/wechat-pay/h5 | H5 支付 | 是 |
| POST | /api/wechat-pay/native | Native 扫码支付 | 是 |
| POST | /api/wechat-pay/app | App 支付 | 是 |
| POST | /api/wechat-pay/refund | 申请退款 | 是 |
| GET | /api/wechat-pay/query/{order_no} | 查询订单 | 是 |
| POST | /api/wechat-pay/close/{order_no} | 关单 | 是 |
| GET | /api/wechat-pay/bill?date=YYYY-MM-DD | 下载对账单 | 是 |
| POST | /api/wechat-pay/notify | 支付回调 | 否（V3 验签） |

## 数据模型

### JsapiPayRequest
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| orderNo | string | ✅ | 业务订单号（≤32位） |
| amount | int | ✅ | 金额（**分**） |
| description | string | ✅ | 商品描述 |
| openid | string | ✅ | 用户 openid |

### JsapiPayResponse
| 字段 | 类型 | 说明 |
|------|------|------|
| prepayId | string | 预支付交易会话标识 |
| timestamp | int | 时间戳 |
| nonceStr | string | 随机串 |
| package | string | `prepay_id=xxx` |
| sign | string | RSA 签名 |
| signType | string | 固定 "RSA" |

### RefundRequest
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| orderNo | string | ✅ | 原订单号 |
| refundNo | string | ✅ | 退款单号 |
| refundAmount | int | ✅ | 退款金额（**分**） |
| reason | string | ❌ | 退款原因 |

### 错误码

| code | 含义 | 触发场景 |
|------|------|---------|
| -3001 | 统一下单失败 | 微信网关拒绝（余额不足、参数错误） |
| -3002 | 回调验签失败 | V3 签名校验不通过 |
| -3003 | 订单不存在 | orderNo 未找到 |
| -3004 | 订单号已存在 | 重复下单 |
| -3005 | 退款失败 | 金额超限/订单未支付 |
| -3006 | 关单失败 | 订单已支付 |
| -3007 | 配置错误 | 商户号/证书路径错误 |
| -3008 | 网络异常 | 调微信接口超时 |

## 回调通知格式（V3）

微信 V3 回调是 JSON 加密传输：

```http
POST /api/wechat-pay/notify HTTP/1.1
Wechatpay-Timestamp: 1700000000
Wechatpay-Nonce: 5K8264...
Wechatpay-Serial: 4A1B2C3D...
Wechatpay-Signature: xxx...
Content-Type: application/json

{"resource":{"ciphertext":"...","associated_data":"...","nonce":"..."}}
```

**关键字段**（解密后）：
- `out_trade_no` → 商户订单号
- `transaction_id` → 微信订单号（必须入库）
- `trade_state` → SUCCESS / REFUND / CLOSE / REVOKED
- `amount.total` → 单位**分**
