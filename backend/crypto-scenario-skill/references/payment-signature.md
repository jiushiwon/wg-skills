# 支付接口签名（微信支付 / 支付宝）

两家都不需要你"选算法"，算法是平台定的。但它们的报文结构完全不同，混淆了必然对不上。

---

## 一、微信支付 APIv3

### 请求签名（我方 → 微信）

请求头：

```
Authorization: WECHATPAY2-SHA256-RSA2048 mchid="1900000100",nonce_str="593BEC0C930BF1AFEB40B4A08C8FB242",signature="...",timestamp="1554208460",serial_no="5157F09EFDC096DE15EBE81A47057A72",sign_type="RSA"
```

签名串：

```
HTTP方法\nURL\n时间戳\n随机串\n请求报文主体\n
```

例：

```
POST
/wechat/v3/merchant/transactions/jsapi
1554208460
593BEC0C930BF1AFEB40B4A08C8FB242
{"appid":"wxd678efh567hg6787",...}
```

签名 = **商户 API 私钥**做 `SHA256withRSA`，Base64 编码。`serial_no` 是商户 API 证书序列号，`sign_type=RSA`。

> 注意：APIv3 **没有** MD5 签名，也没有 `key=` 那套。网上大量老教程是 APIv2 的，别混。

### 应答验签（微信 → 我方）

验签串 = `时间戳\n随机串\n应答报文主体\n`（注意结尾多一个换行）。

用**微信支付平台证书的公钥**验签。平台证书会轮换，要定期下载更新并保留旧证书（验签时按 `serial_no` 选对应证书）。

### 敏感字段加密

回调里的姓名、身份证、银行卡号是 `AEAD_AES_256_GCM` 加密的：

```json
"resource": {
  "algorithm": "AEAD_AES_256_GCM",
  "ciphertext": "...",
  "associated_data": "transaction",
  "nonce": "...",
  "original_type": "bmi"
}
```

解密用 **APIv3 密钥**（32 字节），`associated_data` 参与认证但不加密——官方示例值是 `transaction`。

```python
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

def decrypt_resource(res: dict, api_v3_key: bytes) -> bytes:
    aesgcm = AESGCM(api_v3_key)
    return aesgcm.decrypt(
        base64.b64decode(res["nonce"]),
        base64.b64decode(res["ciphertext"]),
        res["associated_data"].encode(),
    )
```

### 处理顺序（错一步就出事）

1. 验签 → 失败直接拒绝，不落库不返回业务成功。
2. 解密敏感字段。
3. 幂等处理（同一 `transaction_id` 只处理一次）。
4. 返回应答（微信要求 HTTP 200，失败也要返回 JSON 错误体，否则会一直重推）。

---

## 二、支付宝开放平台

### 签名（我方 → 支付宝）

算法 **RSA2 = SHA256WithRSA**。步骤：

1. 取所有**非空**参数（`sign`、`sign_type` 排除），按 key **字典序**排列。
2. 拼成 `k1=v1&k2=v2`（**不 URL 编码**，不拼 `&` 结尾）。
3. 用**应用私钥**做 SHA256WithRSA 签名，Base64 得到 `sign`。
4. 请求参数里带 `sign_type=RSA2`。

```python
def build_sign_content(params: dict) -> str:
    items = [
        f"{k}={v}" for k, v in sorted(params.items())
        if v is not None and v != "" and k not in ("sign", "sign_type")
    ]
    return "&".join(items)
```

### 验签（支付宝 → 我方）

用**支付宝公钥**验签，验签串同样是排序拼接后的原文。

### 历史包袱

RSA2 是 2015 年支付宝定的方案，SHA256WithRSA 现在不再是最优（Ed25519 更快更安全），但**开放平台只认 RSA2**，没有替代选项。这是"跟着平台走"的典型场景：算法选型权不在你手上。

---

## 三、两家的对照

| 项 | 微信支付 APIv3 | 支付宝开放平台 |
|---|---|---|
| 签名算法 | SHA256withRSA（`WECHATPAY2-SHA256-RSA2048`） | RSA2（SHA256WithRSA） |
| 摘要/签名串 | `方法\nURL\n时间戳\n随机串\nbody\n` | 参数字典序 `k=v&k=v`（不 URL 编码） |
| 签名密钥 | 商户 API 私钥 | 应用私钥 |
| 验签公钥 | 微信支付平台证书公钥（会轮换） | 支付宝公钥 |
| 敏感字段 | AEAD_AES_256_GCM + APIv3 密钥 | 一般无（用 REEF 加密的极少） |
| 编码 | Base64 | Base64 |

---

## 四、通用原则

1. **验签先于一切业务动作**。回调处理器的第一行必须是验签。
2. **验签用常量时间比较**，不要用 `==`。
3. **回调必须幂等**——支付平台会重推，靠 `transaction_id` / `out_trade_no` 去重。
4. **平台证书 / 公钥要能更新**——写进配置而不是硬编码，支持多证书并存按 serial 号选择。
5. **不要自己造签名格式**——除非平台明确要求（部分老平台确实要 `key=xxx` 拼接，那也是平台定义的，代码里标注来源）。
