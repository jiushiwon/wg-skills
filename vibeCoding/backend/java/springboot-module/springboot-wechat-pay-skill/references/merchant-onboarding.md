# 微信支付商户开通与配置完整指南

> 本文档由 springboot-wechat-pay-skill 提供，**从"0 商户号"到"成功下单"全流程**。

## 0. 流程总览

```
[步骤 1] 注册微信支付商户号                 ← 预计 1-3 工作日
[步骤 2] 获取 AppID（公众号/小程序/移动应用）← 已有则跳过
[步骤 3] 商户号关联 AppID                   ← 关键步骤
[步骤 4] 申请 API 证书（V3 必需）            ← 必须
[步骤 5] 设置 APIv3 密钥（V3 必需）          ← 必须
[步骤 6] 配置回调地址                        ← 必须公网可访问
[步骤 7] 沙箱测试                           ← 上线前必做
[步骤 8] 正式上线
```

---

## 步骤 1：注册微信支付商户号

### 1.1 入口

**地址**：https://pay.weixin.qq.com/

### 1.2 申请条件

| 类型 | 需要的资质 |
|------|------------|
| **个体工商户** | 营业执照、法人身份证、结算银行卡 |
| **企业** | 营业执照、法人身份证、对公账户、ICP 备案 |
| **小微商户**（特殊） | 法人身份证 + 结算银行卡（无营业执照） |

### 1.3 申请步骤

1. 点击「接入微信支付」→ 「成为商家」
2. 选择主体类型（个体/企业/小微）
3. 填写主体信息（营业执照号、法人姓名、联系方式）
4. 提交经营场景（截图：店铺门面、办公场所）
5. 填写结算账户（对公账户/法人银行卡）
6. 等待审核（**1-3 个工作日**）
7. 审核通过 → 收到商户号（**10 位数字**，如 `1900000109`）

### 1.4 关键资料保存

- ✅ **商户号**（mch_id）→ 配置到 `wechat.pay.mch-id`
- ✅ **商户平台登录账号**（不是微信，是 pay.weixin.qq.com 的账号）
- ✅ **商户平台登录密码** + **操作证书**（登录时需要）

---

## 步骤 2：获取 AppID（三选一或多个）

### 2.1 公众号 AppID

| 项目 | 说明 |
|------|------|
| 申请地址 | https://mp.weixin.qq.com/ |
| 适用 | JSAPI 支付（公众号内网页） |
| 费用 | 免费（个人订阅号可申请，但需认证） |
| 认证费用 | 300 元/年（企业/个体可申请认证） |

### 2.2 小程序 AppID

| 项目 | 说明 |
|------|------|
| 申请地址 | https://mp.weixin.qq.com/ → 「小程序」 |
| 适用 | 小程序支付 |
| 费用 | 免费，**个人主体**可申请 |

### 2.3 移动应用 AppID

| 项目 | 说明 |
|------|------|
| 申请地址 | https://open.weixin.qq.com/ → 「移动应用」 |
| 适用 | App 支付（iOS / Android） |
| 费用 | 需企业认证 |
| 审核 | 1-7 个工作日（提供官网+应用截图） |

### 2.4 H5 / Native 支付

**不需要单独 AppID**。H5 和 Native 支付使用**公众号或小程序的 AppID** 即可。

---

## 步骤 3：商户号关联 AppID（关键！）

### 3.1 为什么必须关联？

微信支付 V3 强制要求 **AppID 必须与商户号绑定**，否则统一下单会报：`APPID_MCHID_NOT_MATCH`。

### 3.2 关联步骤

1. 登录商户平台：https://pay.weixin.qq.com/
2. 顶部菜单：「产品中心」→ 「AppID 账号管理」→ 「关联 AppID」
3. 输入要关联的 AppID（公众号/小程序/移动应用的 AppID）
4. **用对应 AppID 的管理员微信扫码确认**
5. 等待审核（**通常 5 分钟到 2 小时**）

### 3.3 多 AppID 关联

**支持 1 个商户号关联多个 AppID**（如：商户号 + 公众号 + 小程序 + App 都关联）。

每个 AppID 单独发起关联申请，互不影响。

---

## 步骤 4：申请 API 证书（V3 必需）

### 4.1 什么是 API 证书？

微信支付 V3 **不再使用 API Key 签名**，改用 **商户 API 证书**（公私钥对）签名。

### 4.2 申请步骤

1. 登录商户平台：https://pay.weixin.qq.com/
2. 「账户中心」→ 「API 安全」→ 「申请 API 证书」
3. 点击「生成 API 证书」→ 系统会要求下载"证书工具"
4. **下载并运行 cert-tool 工具**（macOS / Windows 都有）
5. 工具生成 3 个文件：
   - `apiclient_key.pem` ← **商户私钥**（保密，绝不能提交到代码仓库）
   - `apiclient_cert.pem` ← **商户证书**（公开）
   - `apiclient_cert_serial_no` ← **证书序列号**

### 4.3 文件用途

| 文件 | 配置项 | 说明 |
|------|--------|------|
| `apiclient_key.pem` | `wechat.pay.private-key-path` | 用于签名 |
| `apiclient_cert.pem` | `wechat.pay.merchant-cert-path` | 用于 TLS 双向认证 |
| 证书序列号 | `wechat.pay.api-cert-serial-no` | 32 位十六进制字符串 |

### 4.4 安全建议

- ✅ 私钥放 `/opt/secret/wechat/` 目录，**限制 600 权限**
- ✅ 用 K8s Secret / Vault 注入，**不进代码仓库**
- ❌ **不要**把 `apiclient_key.pem` 提交到 git
- ❌ **不要**在日志里打印私钥内容
- ✅ 证书有效期 5 年，到期前 60 天邮件提醒

### 4.5 申请 .gitignore 模板

```gitignore
# 微信支付证书
*apiclient_key*
*apiclient_cert*
wechat-pay/
/opt/secret/
```

---

## 步骤 5：设置 APIv3 密钥（V3 必需）

### 5.1 什么是 APIv3 密钥？

- 32 位字符串
- 用于**回调通知的 AES-256-GCM 解密**
- 用于**下载平台证书的密钥派生**

### 5.2 设置步骤

1. 商户平台 → 「账户中心」→ 「API 安全」→ 「APIv3 密钥」
2. 点击「设置」→ 验证操作证书
3. 输入 32 位字符串（**必须包含大小写+数字**）
4. 点击「确定」

### 5.3 生成随机 32 位密钥

```bash
# Linux/macOS
openssl rand -base64 32 | tr -d "=+/" | cut -c1-32

# 或在线生成
# https://www.random.org/strings/
```

### 5.4 配置项

```yaml
wechat:
  pay:
    api-v3-key: ${WECHAT_API_V3_KEY}  # 32 位字符串
```

### 5.5 ⚠️ 重要警告

- **不要轻易重置 APIv3 密钥**！重置后**所有未解密的历史回调通知都将无法解密**
- 重置前确保所有回调都已处理完毕
- 建议**项目上线后不再重置**

---

## 步骤 6：配置回调地址

### 6.1 回调地址要求

| 要求 | 说明 |
|------|------|
| **公网可访问** | 微信服务器必须能 POST 到你的回调地址 |
| **HTTPS** | 必须是 https://（http 在生产环境会被拒） |
| **有效证书** | 不能是自签名证书（Let''s Encrypt OK） |
| **POST 方法** | 微信用 POST 发送回调 |
| **返回 200** | 业务处理后必须返回 "SUCCESS" 字符串 |

### 6.2 回调地址示例

```
生产：https://pay.yourdomain.com/api/wechat-pay/notify
测试：https://test-pay.yourdomain.com/api/wechat-pay/notify
沙箱：https://sandbox-pay.yourdomain.com/api/wechat-pay/notify
```

### 6.3 内网穿透（开发阶段）

微信回调**必须公网可访问**，开发阶段需要内网穿透工具：

| 工具 | 推荐度 |
|------|--------|
| **frp** | ⭐⭐⭐⭐⭐ 稳定、可自建 |
| **ngrok** | ⭐⭐⭐ 免费版限速 |
| **cpolar** | ⭐⭐⭐ 国内可用 |
| **Cloudflare Tunnel** | ⭐⭐⭐⭐ 国外项目推荐 |

```bash
# frp 示例（假设 frps 在公网）
frpc tcp --remote_port 7000 --local_port 8080

# 回调地址设为：https://your-frp-domain.com:7000/api/wechat-pay/notify
```

---

## 步骤 7：沙箱测试（上线前必做）

### 7.1 什么是沙箱？

微信支付提供**测试环境**（沙箱），使用**虚拟商户号**测试，避免产生真实交易。

### 7.2 沙箱地址

```
统一下单：https://api.mch.weixin.qq.com/sandboxnew/pay/unifiedorder
回调地址：自定义（沙箱不会真正回调）
```

### 7.3 沙箱测试要点

| 场景 | 沙箱是否支持 |
|------|--------------|
| JSAPI 统一下单 | ✅ |
| 退款 | ✅ |
| 回调通知 | ❌（需自己 mock） |
| 关单 | ✅ |
| 账单下载 | ❌ |
| 企业付款 | ❌ |

### 7.4 沙箱测试账号

| 参数 | 沙箱值 |
|------|--------|
| appid | `wx40a4e02646a0f4c0`（官方沙箱 appid） |
| mch_id | 通过 https://api.mch.weixin.qq.com/sandboxnew/pay/getsignkey 获取 |
| key | 沙箱专用 key（24 小时过期） |

### 7.5 切换到生产

```yaml
# application-sandbox.yml
wechat:
  pay:
    base-url: https://api.mch.weixin.qq.com/sandboxnew

# application-prod.yml
wechat:
  pay:
    base-url: https://api.mch.weixin.qq.com
```

---

## 步骤 8：正式上线 checklist

上线前**逐项检查**：

- [ ] 商户号已审核通过
- [ ] AppID 已与商户号关联
- [ ] API 证书已申请（apiclient_key.pem / apiclient_cert.pem）
- [ ] APIv3 密钥已设置（32 位）
- [ ] 回调地址已配置且公网可访问
- [ ] 沙箱环境测试通过
- [ ] 1 元真实交易测试通过（**用完退款**）
- [ ] 订单超时关单任务已实现
- [ ] 退款流程跑通
- [ ] 对账任务已配置
- [ ] 监控告警已配置（回调失败、订单异常）
- [ ] **私钥文件未提交到 git**（重要！）

---

## 常见问题 FAQ

### Q1: 报 "APPID_MCHID_NOT_MATCH"

**原因**：AppID 没有关联到这个商户号。

**解决**：
1. 商户平台 → 「产品中心」→ 「AppID 账号管理」查看是否已关联
2. 没关联 → 按步骤 3 重新关联
3. 关联后等 5 分钟再试（关联生效有延迟）

### Q2: 报 "签名错误"

**原因**：
1. 私钥路径错误
2. 证书序列号错误
3. SDK 版本太旧

**排查**：
```bash
# 验证私钥格式
openssl pkcs12 -in apiclient_key.pem -noout -text
# 应输出：以 -----BEGIN PRIVATE KEY----- 开头

# 验证证书序列号
openssl x509 -in apiclient_cert.pem -noout -serial
# 输出如：serial=1234ABCD...
```

### Q3: 回调验签失败

**原因**：
1. 平台证书没下载（需用 `AutoUpdateCertificatesVerifier`）
2. 验签串拼错
3. HTTP body 被框架提前解析（V3 验签需要**原始 body**）

**解决**：
- Spring 用 `@RequestBody String body` 接收**原始字符串**
- 启动时调用一次 `client.getCertificates()` 验证平台证书能下载

### Q4: 退款一直 "PROCESSING"

**正常**！退款是异步流程，PROCESSING 表示微信已接收，最终状态以**退款回调**为准。

**等待**：通常 1-3 分钟，最长 24 小时。

### Q5: 个人开发者能申请商户号吗？

**不能**。微信支付商户号必须**企业 / 个体工商户 / 小微商户**主体。

**个人开发者选择**：
- 申请「个人」小程序 → 仅支持**小程序虚拟支付**（受限）
- 用他人的商户号（合规风险）
- 注册个体工商户（推荐，200-500 元代办）

---

## 快速参数速查表

| 参数 | 来源 | 格式 | 必填 |
|------|------|------|------|
| **app_id** | 公众平台 | `wx` + 32 位 | ✅ |
| **mch_id** | 商户平台 | 10 位数字 | ✅ |
| **api_v3_key** | 商户平台「APIv3 密钥」 | 32 位字符串 | ✅ |
| **merchant_private_key** | 证书工具生成 | PEM 格式 | ✅ |
| **merchant_cert_serial_no** | 证书工具生成 | 32 位十六进制 | ✅ |
| **platform_cert** | 自动下载 | - | 自动 |
| **notify_url** | 自有域名 | HTTPS URL | ✅ |

---

## 参考链接

- 微信支付官方文档：https://pay.weixin.qq.com/wiki/doc/apiv3/
- V3 API 字典：https://pay.weixin.qq.com/wiki/doc/apiv3/wxpay/pay/chapter3_1.shtml
- 商户平台：https://pay.weixin.qq.com/
- 证书下载工具：https://pay.weixin.qq.com/index.php/public/cert/tool
- 错误码查询：https://pay.weixin.qq.com/wiki/doc/apiv3/wxpay/pay/chapter4_1.shtml
- 沙箱文档：https://pay.weixin.qq.com/wiki/doc/api/jsapi.php?chapter=23_1
