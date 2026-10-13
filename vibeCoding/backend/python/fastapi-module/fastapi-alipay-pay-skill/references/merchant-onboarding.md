# 支付宝商户开通与配置完整指南（Python 版）

> 由 fastapi-alipay-pay-skill 提供。**与 Spring Boot 版流程完全相同**（同一个 APPID/密钥对）。

## 0. 流程总览

```
[步骤 1] 注册开放平台账号
[步骤 2] 实名认证
[步骤 3] 创建应用
[步骤 4] 生成密钥对 + 上传应用公钥
[步骤 5] 配置支付宝公钥
[步骤 6] 应用上线
[步骤 7] 配置回调地址
[步骤 8] 沙箱测试 → 正式上线
```

## 步骤 1：注册开放平台账号
https://open.alipay.com/ — 已有支付宝账号直接登录，否则注册。

## 步骤 2：实名认证
1-3 工作日。企业/个体需营业执照 + 法人身份证 + 结算账户。

## 步骤 3：创建应用
选择「网页/移动应用」，勾选支付能力（当面付/手机网站/PC/App）。

## 步骤 4：生成密钥对（Python 关键步骤）

### 方式 1：命令行（推荐）
```bash
# 1. 生成 2048 位 RSA 私钥
openssl genrsa -out app_private_key.pem 2048

# 2. 提取公钥
openssl rsa -in app_private_key.pem -pubout -out app_public_key.pem

# 3. 转 PKCS8（Python 同样需要 PKCS8 格式）
openssl pkcs8 -topk8 -nocrypt -inform PEM \
  -in app_private_key.pem -outform PEM -out app_private_key_pkcs8.pem
```

### 方式 2：支付宝密钥工具
- 下载：https://opendocs.alipay.com/common/02kkv7
- 一键生成 PKCS8 格式

### Python 特别说明
- 私钥文件需 PEM 格式 + PKCS8
- 头是 `-----BEGIN PRIVATE KEY-----`（不是 `RSA PRIVATE KEY`）
- **完整**带头带尾（含换行符）粘到 `.env`：

```ini
ALIPAY_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDxxxxx...
-----END PRIVATE KEY-----"
```

## 步骤 5：上传应用公钥 + 获取支付宝公钥

1. 开放平台 → 应用 → 「应用信息」→ 「接口加签方式」
2. 选「公钥」模式
3. 把 `app_public_key.pem` 内容粘贴到文本框
4. 保存后系统显示**支付宝公钥** → **复制下来！**

⚠️ **90% 新手栽在这里**：配的是**支付宝公钥**，不是应用公钥。

```ini
# 错误：配了应用公钥
ALIPAY_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----\nMIIBIjANB... (这是应用公钥)\n-----END PUBLIC KEY-----"

# 正确：配了支付宝公钥
ALIPAY_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----\nMIIBIjANB... (这是支付宝公钥)\n-----END PUBLIC KEY-----"
```

## 步骤 6：应用上线
提交审核（1-7 工作日）。审核未通过只能沙箱测试。

## 步骤 7：配置回调地址
支付宝回调支持 HTTP（生产建议 HTTPS），必须**公网可访问**。

```
生产：https://pay.yourdomain.com/api/alipay/notify
测试：https://test-pay.yourdomain.com/api/alipay/notify
```

> **关键**：回调处理完必须返回**纯文本 "success"**（小写无空格），否则支付宝会重试 24 小时。

## 步骤 8：沙箱测试

### 沙箱参数

| 参数 | 沙箱值 |
|------|--------|
| app_id | `2021000000000000`（登录沙箱后获得） |
| 网关 | `https://openapi.alipaydev.com/gateway.do` |
| 买家账号 | 沙箱控制台自动生成 |
| 卖家账号 | 沙箱控制台自动生成 |

### Python 沙箱配置

```python
class Settings(BaseSettings):
    alipay_app_id: str = "2021000000000000"  # 沙箱 APPID
    alipay_private_key: str = ""              # 沙箱应用私钥
    alipay_public_key: str = ""               # 沙箱支付宝公钥
    alipay_gateway: str = "https://openapi.alipaydev.com/gateway.do"
    alipay_debug: bool = True                  # 沙箱必须开 debug
```

### 沙箱支付测试
1. 开放平台 → 「沙箱」→ 登录主账号
2. 复制「买家账号」
3. 用「沙箱支付宝 App」登录（**只能沙箱 App**）
4. 扫码支付

## 步骤 9：正式上线 checklist

- [ ] APPID 是生产环境（非沙箱）
- [ ] 配的是**支付宝公钥**（不是应用公钥）
- [ ] 私钥是 PKCS8 格式
- [ ] 网关是 `https://openapi.alipay.com/gateway.do`
- [ ] 回调地址公网可访问
- [ ] 沙箱支付成功
- [ ] 沙箱退款成功
- [ ] 回调验签通过
- [ ] 生产 1 元真实交易测试
- [ ] `.env` 加入 `.gitignore`

## Python 特定踩坑

### Q1: `cryptography` 库缺失
```bash
pip install pycryptodome cryptography
```

### Q2: 私钥加载报 `Could not deserialize key data`
- 原因 1：不是 PKCS8 格式
- 原因 2：缺 BEGIN/END 头
- 解决：用 `openssl pkcs8 -topk8` 重新转

### Q3: Decimal 精度问题
```python
# 错误
amount = float("0.1") + float("0.2")  # 0.30000000000000004

# 正确
amount = Decimal("0.1") + Decimal("0.2")  # 0.3
```

### Q4: 验签一直失败
1. 用错公钥（应用公钥 vs 支付宝公钥）
2. 私钥非 PKCS8
3. sign_type 与公钥模式不匹配（必须 `RSA2`）

### Q5: FastAPI 接收 form 表单
```python
from fastapi import Request
async def notify(request: Request):
    form = await request.form()
    data = dict(form)
```

## 与 Spring Boot 版的差异

| 维度 | Java/Spring Boot | Python/FastAPI |
|------|------------------|----------------|
| SDK | `alipay-sdk-java` | `python-alipay-sdk` |
| 私钥格式 | String（PEM 内容） | String（PEM 内容） |
| 公钥格式 | String（PEM 内容） | String（PEM 内容） |
| 回调接收 | `HttpServletRequest` | `await request.form()` |
| 验签 API | `AlipaySignature.rsaCheckV1()` | `alipay.verify(data, sign)` |
| 金额类型 | `BigDecimal` | `Decimal` |
| 部署 | JAR + JVM | uvicorn / gunicorn |
