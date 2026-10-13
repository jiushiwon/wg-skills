# 微信支付商户开通与配置完整指南

> 本文档由 fastapi-wechat-pay-skill 提供。**与 Spring Boot 版流程完全相同**（同一个商户号、同一个证书）。

## 0. 流程总览

```
[步骤 1] 注册微信支付商户号        ← 1-5 工作日
[步骤 2] 申请 AppID                ← 立即可用
[步骤 3] 商户号关联 AppID          ← 立即可用
[步骤 4] 申请 API 证书（V3）       ← 立即可用
[步骤 5] 设置 APIv3 密钥           ← 立即可用
[步骤 6] 配置回调地址              ← 立即可用
[步骤 7] 沙箱测试 → 正式上线
```

---

## 步骤 1：注册商户号

**入口**：https://pay.weixin.qq.com/

| 主体 | 资料 | 备注 |
|------|------|------|
| **企业** | 营业执照、对公账户、法人身份证 | ✅ 推荐 |
| **个体工商户** | 营业执照、结算银行卡、法人身份证 | ✅ |
| **个人** | 身份证、结算银行卡 | ⚠️ 受限：单笔≤1000，日≤5 笔 |

> Python 和 Spring Boot 共用**同一个商户号**。两者是不同实现，**配置参数完全相同**。

## 步骤 2-3：AppID 申请与关联

### 公众号 AppID
- 入口：https://mp.weixin.qq.com/
- 用于 JSAPI（微信内 H5）

### 小程序 AppID
- 入口：https://mp.weixin.qq.com/
- 用于小程序支付

### App 应用 AppID
- 微信开放平台：https://open.weixin.qq.com/
- 用于 App 支付

### 关联商户号
1. 微信支付商户平台 → 「产品中心」→ 「AppID 账号管理」→ 「关联 AppID」
2. 公众号/小程序/开放平台后台同意关联
3. 关联后才能用对应 AppID 调起支付

## 步骤 4：API 证书（V3 必填）

### 下载证书生成工具
- https://pay.weixin.qq.com/wiki/doc/apiv3/Online/tools/certificate/index.html

### 命令行方式（Linux / macOS）
```bash
# 使用官方证书生成工具
java -jar CertificateDownloader.jar \
  -k <商户APIv3密钥> \
  -m <商户号> \
  -f <私钥文件绝对路径> \
  -s <证书序列号> \
  -o <输出目录>
```

### 关键文件
| 文件 | 配置项 | 说明 |
|------|--------|------|
| `apiclient_key.pem` | `wechat_private_key_path` | 商户私钥（PEM PKCS8） |
| `apiclient_cert.pem` | `wechat_merchant_cert_path` | 商户证书 |
| `apiclient_cert_serial_no` | `wechat_api_cert_serial_no` | 证书序列号 |

**注意**：V3 推荐用 SDK 的 `AutoUpdateCertificatesVerifier` 自动下载平台证书，无需手动管理。

## 步骤 5：APIv3 密钥

**入口**：商户平台 → 「账户中心」→ 「API 安全」→ 「APIv3 密钥」

- 必须是 **32 位**字符串（字母+数字）
- 自己妥善保存，**只显示一次**
- 用于回调通知 AES-256-GCM 解密

## 步骤 6：回调地址

| 渠道 | 要求 |
|------|------|
| **生产** | 必须 **HTTPS** + 公网可访问 + ICP 备案 |
| **开发** | 用 frp / ngrok 穿透到本地 |
| **沙箱** | 沙箱网关通知测试地址 |

> ⚠️ **与支付宝不同**：微信支付回调 **必须 HTTPS**，HTTP 不行。

## 步骤 7：沙箱测试

### 沙箱特有参数

| 参数 | 沙箱值 |
|------|--------|
| `mch_id` | 190000xxxx（沙箱专用） |
| `app_id` | 任意已关联 AppID |
| 网关 | 自动指向沙箱，无需配置 |
| `notify_url` | 必须公网可访问 |

### 沙箱密钥
- 沙箱 V3 密钥：`00000000000000000000000000000000`（32 个 0）
- 沙箱证书：商户平台「账户中心」→ 「API 安全」→ 「沙箱」单独下载

## 步骤 8：正式上线 checklist

- [ ] 商户号已认证（企业/个体）
- [ ] AppID 已关联商户号
- [ ] API 证书已下载并放置到安全目录
- [ ] APIv3 密钥已设置（32 位）
- [ ] 回调地址是 **HTTPS**
- [ ] 沙箱支付成功
- [ ] 沙箱退款成功
- [ ] 回调验签通过
- [ ] 生产 1 元真实交易测试
- [ ] `.gitignore` 添加 `*apiclient_key*`、`*apiclient_cert*`

## Python 特定说明

```python
# 推荐使用新版 SDK（持续维护）
pip install wechatpayv3-py

# 平台证书自动下载（推荐）
from wechatpayv3 import WechatPay
from wechatpayv3.certificates import AutoUpdateCertificatesVerifier
```

**关键差异**（对比 Java）：
- Python 没有 `maven` 配置，pip 一行
- 私钥文件直接 `open(path, "rb")` 读
- 异步用 `asyncio`/`httpx`（不是 CompletableFuture）

## 常见问题

### Q1: 报 "openid is invalid"
- **原因**：openid 与 appid 不匹配
- **解决**：JSAPI 用公众号 openid，小程序用小程序 openid

### Q2: 平台证书验证失败
- **原因**：用了 `wechatpayv3` 旧版
- **解决**：升级到 `wechatpayv3-py` + `AutoUpdateCertificatesVerifier`

### Q3: 回调验签失败
- **原因 1**：apiv3_key 错误
- **原因 2**：使用生产证书验沙箱回调
- **解决**：用 32 位密钥重新配置

### Q4: 私钥加载失败
- **原因**：不是 PKCS8 格式
- **解决**：
  ```bash
  openssl pkcs8 -topk8 -nocrypt -inform PEM \
    -in apiclient_key.pem -outform PEM -out apiclient_key_pkcs8.pem
  ```
