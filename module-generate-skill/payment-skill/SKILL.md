---
name: payment-skill
description: 支付模块生成。用户要做支付、对接微信/支付宝、下单、支付回调、退款、对账时使用。产出支付单/退款单领域模型、表结构、接口契约增量与四语言实现要点，遵循 backend-convention-skill。触发词："对接支付"、"支付模块"、"微信支付"、"支付宝支付"、"扫码支付"、"小程序支付"、"JSAPI"、"当面付"、"支付回调"、"退款"、"对账"、"payment module"、"wechat pay"、"alipay"。
---

# Payment Skill

支付模块生成器。**本技能只做后端接口，不含前端 UI**。

## 定位

- **上游**：backend-generate-skill（项目骨架）+ auth-skill（用户表）
- **下游**：业务方调用本模块的支付/退款接口
- **边界**：只做后端 REST 接口，不做前端页面、不做 SDK 封装

## 联动规范

### 与 backend-generate-skill 联动

1. 检测项目是否已有后端骨架（pom.xml / go.mod / pyproject.toml / package.json）
2. 如无骨架，引导用户先走 backend-generate-skill 生成骨架，再回到本技能
3. 复用骨架的：统一信封、错误码闭集、JWT 中间件、配置加载、.env 格式
4. 追加支付相关环境变量到 `.env.example`

### 与 auth-skill 联动

1. **用户表**：`wg_pay_order.user_id` 关联 `wg_user.id`（auth-skill 生成的表）
2. 如项目尚未接入 auth-skill，默认在支付单表里记录 `user_id`，不外键强绑
3. 订单归属从 **Bearer token 的 sub claim** 取，禁止信任客户端传入的 user_id
4. 查询/管理接口需校验 token，防止越权查他人订单

> 注：auth-skill 生成的表前缀默认 `wg`，与本模块一致，无需额外映射

## 渠道选择

**二选一，不可多选**（与 auth-skill 的短信供应商策略一致）：

| 渠道 | 支持场景 |
|------|----------|
| 微信支付 | Native 扫码、JSAPI 小程序 |
| 支付宝 | 当面付（扫码）、手机网站支付（WAP） |

用户未明确时，**默认微信支付**。

## 生成流程

1. **技术栈检测**：读取项目根判断语言/框架，沿用 backend-generate-skill 的配置格式
2. **问答确认边界**（见下节，未明确的一律按默认值并告知用户）
3. **联动检查**：确认 auth-skill 用户表存在；如无，引导用户先接 auth-skill
4. 按 `references/domain-model.md` 产出表结构 DDL（按选定渠道裁剪）
5. 按 `references/api-contract.md` 把接口增量追加进项目 `api-contract.md`
6. 按检测到的技术栈，展开 `references/<lang>.md` 为可运行代码
7. **生成对接文档**：见「交付物」节
8. 逐条核对「模块红线」

## 问答清单（生成前确认）

| 决策 | 选项 | 默认 |
|------|------|------|
| 支付渠道 | **微信支付** / 支付宝 | 微信支付（单选） |
| 支付场景（微信） | Native 扫码 / JSAPI 小程序 | Native 扫码 |
| 支付场景（支付宝） | 当面付 / WAP 手机网站 | 当面付 |
| 异步通知 | 有消息队列 / 无（定时扫表降级） | 无 → 定时扫表降级 |
| 是否需要分账 | 不要 / 要 | 不要（二期） |
| 对账时间 | — | 每日凌晨 |
| 回调可达性 | 回调地址必须公网可达 | 提示用内网穿透/沙箱联调 |

## 模块红线（本模块灵魂，逐条核对）

1. **金额一律用整数分（BIGINT）**：全链路（存储、计算、传输、对账）禁止 float/double/decimal 运算金额；只有展示层才除 100。
2. **金额不信任客户端**：下单时 `amount` 必须由服务端按业务单据（商品/订单）重算，客户端只传业务单据号；若确需客户端传金额，必须服务端二次核对，不一致即拒绝。
3. **回调必须验签**：微信 v3 用平台证书验签（`Wechatpay-Signature` 头），支付宝用 RSA2 公钥验签；验签失败直接拒绝并记录告警日志。**禁止任何"开发方便"跳过验签的开关进生产。**
4. **回调处理幂等**：重复回调要正确处理。状态推进以 `SELECT ... FOR UPDATE` 锁支付单 + 状态判断为准，渠道单号判重；已推进过的重复回调直接返回成功应答。
5. **回调里只做状态推进 + 发事件/消息通知业务方**：禁止在回调链路里做重业务逻辑（发券、发货一律走异步），避免处理超时导致渠道重推风暴。
6. **超时关单先关渠道再改本地**：防用户在关单瞬间支付成功造成资损；渠道关单失败则不改本地状态，等下次任务或对账修复。
7. **对账必须存在**：每日定时拉渠道账单与本地支付单核对（比对字段：商户单号/渠道单号/金额/状态），差异记录告警、人工介入；对账是最终一致性的兜底。
8. **密钥与证书**：全部走环境变量（变量名见 `references/domain-model.md`「环境变量」节），禁止入库/日志/代码；证书文件路径走配置。
9. **错误码用闭集**：`-1001` 参数、`-1002` 未授权、`-1004` 支付单不存在、`-1005` 状态冲突（重复支付/重复退款）、`-2000` 渠道调用失败（message 含渠道错误码摘要，不泄露密钥）。
10. **退款总额不得超过已支付金额**；部分退款用支付单上的 `refunded_amount` 累计校验，超额即拒绝（`-1005`）。
11. **渠道调用必须在事务外**：本地落库并提交成功后，再调渠道 API；渠道失败时本地已提交，需补偿（更新本地状态、发告警、人工介入）。**禁止在事务内调远程渠道**，否则锁放大 + 失败难补偿。

## 标准接口

见 `references/api-contract.md`：

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/pay/orders | 创建支付单 |
| GET | /api/pay/orders/{outTradeNo} | 查询支付单 |
| POST | /api/pay/orders/{outTradeNo}/close | 关闭支付单 |
| POST | /api/pay/refunds | 申请退款 |
| POST | /api/pay/notify/{channel} | 渠道回调（支付） |
| POST | /api/pay/notify/{channel}/refund | 渠道回调（退款） |

## 交付物

本技能交付 **4 份产物**，缺一视为未完成：

| 产物 | 说明 |
|------|------|
| **代码** | 按技术栈展开的 Java/Go/Python/Node 实现要点（含实体/Service/Controller/Job） |
| **接口契约** | 追加到项目 `api-contract.md` |
| **DDL** | 支付单/退款单表结构（PostgreSQL/MySQL 语法） |
| **对接文档** | 详细说明：环境变量清单、回调地址配置、渠道商户后台设置、前端对接要点 |

### 对接文档模板

生成的文档应包含（按 auth-skill 的详细程度）：

```markdown
# {渠道}支付对接文档

## 1. 环境变量

| 变量名 | 说明 | 示例 |
|--------|------|------|
| WECHAT_MCH_ID | 商户号 | 1234567890 |
| ... | ... | ... |

## 2. 渠道商户后台配置

- 回调通知地址：https://your-domain.com/api/pay/notify/wechat
- 退款回调地址：https://your-domain.com/api/pay/notify/wechat/refund
- ...

## 3. 前端对接要点

- 调 /api/pay/orders 获取支付参数
- 拉起支付控件
- 支付结果以回调为准，前端可轮询 /api/pay/orders 查询状态

## 4. 业务方接入

- 支付成功事件：监听 PaySuccessEvent
- 退款成功事件：监听 RefundSuccessEvent
- ...
```

## 四语言实现要点

- Java：`references/java.md`（Spring Boot）
- Go：`references/go.md`（Gin）
- Python：`references/python.md`（FastAPI）
- Node：`references/nodejs.md`（Express/NestJS）

## 不做

- **不做前端 UI**：只输出后端 REST 接口
- 不做分账、服务商模式、跨境支付（二期）
- 不做余额/钱包/储值（独立资金账户模块）
- 不在回调链路里做发券/发货等重业务
- 不复制 backend-convention-skill 的骨架，本模块只补支付业务
- 不支持多渠道同时接入（必须单选）
