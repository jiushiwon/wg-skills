# 支付宝模块接口契约

> 本文件由 springboot-alipay-pay-skill 生成。**仅覆盖支付宝**，不含微信。

## 接口清单

| 方法 | 路径 | 说明 | 鉴权 |
|------|------|------|------|
| POST | /api/alipay/trade/precreate | 当面付（生成二维码） | 是 |
| POST | /api/alipay/trade/wap | 手机网站支付（返回 form） | 是 |
| POST | /api/alipay/trade/page | PC 网站支付（页面跳转） | 是 |
| POST | /api/alipay/trade/app | App 支付（返回 orderStr） | 是 |
| POST | /api/alipay/trade/refund | 申请退款 | 是 |
| GET | /api/alipay/trade/query/{orderNo} | 查询订单 | 是 |
| POST | /api/alipay/trade/close/{orderNo} | 关闭订单 | 是 |
| GET | /api/alipay/bill?date=2026-10-12 | 下载对账单 | 是 |
| POST | /api/alipay/notify | 支付回调 | 否（RSA2 验签） |

## 数据模型

### PrecreateResponse（当面付响应）

| 字段 | 类型 | 说明 |
|------|------|------|
| qrCode | string | 支付宝二维码内容（前端用 qrcode.js 生成） |

### WapPayResponse / PagePayResponse

| 字段 | 类型 | 说明 |
|------|------|------|
| formHtml | string | HTML form 字符串，前端自动提交 |

### AppPayResponse

| 字段 | 类型 | 说明 |
|------|------|------|
| orderStr | string | App 端调起支付宝 SDK 用 |

### 错误码扩展

| code | 含义 | 触发场景 |
|------|------|---------|
| -3001 | 统一下单失败 | 支付宝网关拒绝 |
| -3002 | 回调签名无效 | RSA2 验签失败 |
| -3003 | 订单不存在 | orderNo 未找到 |
| -3004 | 订单已支付 | 重复支付 |
| -3005 | 退款失败 | 退款金额超限或网关拒绝 |
| -3006 | 关单失败 | 订单已支付 |
| -3007 | 密钥错误 | 应用公钥/支付宝公钥错 |

## 回调通知格式

支付宝回调是 form 表单 POST，参数示例：

```
out_trade_no=ORDER_20261012_001
trade_no=2026101222001234567890
trade_status=TRADE_SUCCESS
total_amount=100.00
gmt_payment=2026-10-12 16:21:00
sign=...
sign_type=RSA2
```

**关键字段**：
- `out_trade_no` → 商户订单号
- `trade_no` → 支付宝交易号（必须入库）
- `trade_status` → TRADE_SUCCESS（成功）/ TRADE_CLOSED（关闭）/ TRADE_FINISHED（完结）
- `total_amount` → 单位**元**（不是分）
