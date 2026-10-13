# 支付宝模块接口契约

> 由 fastapi-alipay-pay-skill 生成。**仅覆盖支付宝**，不含微信。

## 接口清单

| 方法 | 路径 | 说明 | 鉴权 |
|------|------|------|------|
| POST | /api/alipay/precreate | 当面付（生成二维码） | 是 |
| POST | /api/alipay/wap | 手机网站支付（返回 form） | 是 |
| POST | /api/alipay/page | PC 网站支付（页面跳转） | 是 |
| POST | /api/alipay/app | App 支付（返回 orderStr） | 是 |
| POST | /api/alipay/refund | 申请退款 | 是 |
| GET | /api/alipay/query/{order_no} | 查询订单 | 是 |
| POST | /api/alipay/close/{order_no} | 关闭订单 | 是 |
| GET | /api/alipay/bill?date=YYYY-MM-DD | 下载对账单 | 是 |
| POST | /api/alipay/notify | 支付回调 | 否（RSA2 验签） |

## 数据模型

### PrecreateResponse
| 字段 | 类型 | 说明 |
|------|------|------|
| qrCode | string | 支付宝二维码内容（前端 qrcode.js 生成） |

### WapPayResponse / PagePayResponse
| 字段 | 类型 | 说明 |
|------|------|------|
| formHtml | string | HTML form 字符串，前端自动提交 |

### AppPayResponse
| 字段 | 类型 | 说明 |
|------|------|------|
| orderStr | string | App 端调起支付宝 SDK 用 |

### 错误码

| code | 含义 | 触发场景 |
|------|------|---------|
| -3001 | 统一下单失败 | 支付宝网关拒绝 |
| -3002 | 回调签名无效 | RSA2 验签失败 |
| -3003 | 订单不存在 | order_no 未找到 |
| -3004 | 订单已存在 | 重复下单 |
| -3005 | 退款失败 | 金额超限 / 网关拒绝 |
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
- `trade_status` → TRADE_SUCCESS / TRADE_CLOSED / TRADE_FINISHED
- `total_amount` → 单位**元**（不是分）

## 金额单位

⚠️ **与微信支付不同**：支付宝金额单位是**元**（Decimal），微信是**分**（int）。

```python
# 微信
amount = 10000  # 100.00 元

# 支付宝
amount = Decimal("100.00")
```
