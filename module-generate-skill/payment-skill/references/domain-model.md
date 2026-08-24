# payment-skill — 领域模型与表结构

语言无关。表前缀默认 `wg`（可覆盖），DDL 以 PostgreSQL 为准，MySQL 差异在注释中标注。

## 实体关系

```
wg_pay_order（支付单） 1 ──── n wg_pay_refund（退款单）
业务方单据（商品/订单） 1 ──── 1 wg_pay_order（out_trade_no 映射，业务方持有）
wg_user（用户表） 1 ──── n wg_pay_order（user_id，外键关联）
```

### 用户表关联

`user_id` 关联 **auth-skill 生成的 `wg_user.id`**。本模块不创建用户表，只记录归属。

- 下单时 `user_id` 从 **Bearer token 的 `sub` claim** 取，禁止信任客户端传入
- 如项目未接入 auth-skill，仍记录 `user_id`，不做外键强绑

> 注：auth-skill 的 `wg_user` 表前缀同为 `wg`，默认兼容

## 表结构

### wg_pay_order — 支付单

```sql
CREATE TABLE wg_pay_order (
  id                BIGSERIAL PRIMARY KEY,            -- MySQL: BIGINT AUTO_INCREMENT
  out_trade_no      VARCHAR(64) NOT NULL,             -- 商户单号，全局唯一，业务方单据映射
  user_id           BIGINT NOT NULL,                  -- 归属用户，业务方传入，不外键
  channel           VARCHAR(10) NOT NULL,             -- wechat / alipay（单选，二选一）
  scene             VARCHAR(10) NOT NULL,             -- 见下节「场景枚举」
  amount            BIGINT NOT NULL,                  -- 金额，单位：分（红线：禁止 float/decimal）
  refunded_amount   BIGINT NOT NULL DEFAULT 0,        -- 已退款累计，单位：分（部分退款用）
  subject           VARCHAR(128) NOT NULL DEFAULT '', -- 商品标题
  status            SMALLINT NOT NULL DEFAULT 0,      -- 0 待支付 1 已支付 2 已关闭 3 退款中 4 已退款
  provider_trade_no VARCHAR(64),                      -- 微信/支付宝交易号，可空（支付成功后回填）
  paid_at           TIMESTAMPTZ,                      -- 支付完成时间，可空
  expire_at         TIMESTAMPTZ NOT NULL,             -- 过期时间，超时关单任务扫描依据
  notify_payload    TEXT,                             -- 最近一次回调原始报文留档，排查用
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),  -- MySQL: DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3)
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX uk_pay_order_out_trade_no ON wg_pay_order(out_trade_no);
CREATE INDEX idx_pay_order_user ON wg_pay_order(user_id);
CREATE INDEX idx_pay_order_provider_trade_no ON wg_pay_order(provider_trade_no);
CREATE INDEX idx_pay_order_expire ON wg_pay_order(status, expire_at);  -- 关单任务扫描
```

设计要点：
- `out_trade_no` 全局唯一：业务方单据与支付单一一映射，重复下单直接冲突（`-1005`），天然防重。
- `amount`/`refunded_amount` 一律 **BIGINT 单位分**，这是金额红线，展示层才除 100。
- `provider_trade_no` 可空：下单时渠道未返回，支付成功回调/查单后回填；建索引便于按渠道单号反查。
- `notify_payload` 留档最近一次回调原始报文：排查"渠道说付了本地没变"类问题时是关键证据。
- `expire_at` 必填：所有支付单都必须有过期时间，关单任务靠它扫描。

### 场景枚举（按渠道动态生成）

生成时按选定渠道裁剪，**不可混用**：

| 渠道 | 场景 | 说明 |
|------|------|------|
| 微信支付 | `native` | Native 扫码（商户扫码） |
| 微信支付 | `jsapi` | 小程序/公众号 JSAPI |
| 支付宝 | `f2f` | 当面付（扫码） |
| 支付宝 | `wap` | 手机网站支付 |

### wg_pay_refund — 退款单

```sql
CREATE TABLE wg_pay_refund (
  id                 BIGSERIAL PRIMARY KEY,
  out_refund_no      VARCHAR(64) NOT NULL,            -- 商户退款单号，唯一
  pay_order_id       BIGINT NOT NULL REFERENCES wg_pay_order(id),
  amount             BIGINT NOT NULL,                 -- 本次退款金额，单位：分（支持部分退款）
  status             SMALLINT NOT NULL DEFAULT 0,     -- 0 退款中 1 成功 2 失败
  provider_refund_no VARCHAR(64),                     -- 渠道退款单号，可空
  reason             VARCHAR(128) NOT NULL DEFAULT '',
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX uk_pay_refund_out_refund_no ON wg_pay_refund(out_refund_no);
CREATE INDEX idx_pay_refund_order ON wg_pay_refund(pay_order_id);
```

设计要点：
- 一笔支付单可有多笔退款单（部分退款），`wg_pay_refund.amount` 之和 ≤ `wg_pay_order.amount`。
- `out_refund_no` 唯一：同一退款单号重复申请直接冲突，防重复退款。

## 回调幂等设计

渠道回调会重推（网络抖动、应答超时），也可能乱序（退款通知先于支付通知）。处理原则：

1. **先验签**（见红线 3），验签失败直接拒绝，不进业务。
2. **加行锁**：`SELECT ... FROM wg_pay_order WHERE out_trade_no = ? FOR UPDATE`，锁住支付单再判断。
3. **状态判断**：仅当 `status = 0`（待支付）且回调为支付成功时，才推进为已支付；其余情况（已支付/已关闭/重复回调）视为已处理。
4. **渠道单号判重**：回调里的 `provider_trade_no` 与本地一致且已支付，说明是重复回调。
5. **已处理直接返回成功应答**：微信/支付宝收到成功应答才不再重推，重复回调返回成功即可，不要报错。
6. `notify_payload` 每次回调都更新留档（支付与退款各自留档最近一次）。

### 退款回调幂等

退款同样异步、会重推。退款回调（微信 `out_refund_no` / 支付宝 `out_biz_no`）处理原则：

1. **先验签**（同支付回调）。
2. **聚合根优先锁序**：先 `SELECT ... FROM wg_pay_order WHERE id = ? FOR UPDATE` 锁支付单（聚合根），再锁退款单。**禁止反序**，否则与退款申请路径（先锁支付单）形成死锁风险。
3. **退款单判重**：退款单已是终态（1 成功 / 2 失败）→ 重复回调，直接返回成功应答。
4. **退款成功**：`refund.status=1`、回填 `provider_refund_no`；`order.refunded_amount += refund.amount`——**这是 `refunded_amount` 唯一的回写点**，超额校验（红线 10）才有意义；随后 `refunded_amount == amount` → `order.status=4`（已退款），否则 → `order.status=1`（部分退，可再次退款）。
5. **退款失败**：`refund.status=2`，`order.status` 回到 1（释放"退款中"，允许重新发起退款）。
6. 已处理返回成功应答止重推。

> 说明：只有已支付（`status=1`）的单才能发起退款，退款回调到达时支付单必为 1 或 3。

## 状态机

```
[待支付 0] ──回调验签通过 / 主动查单支付成功──▶ [已支付 1]
[待支付 0] ──超时关单任务（先关渠道再改本地）──▶ [已关闭 2]
[已支付 1] ──退款申请──▶ [退款中 3]
[退款中 3] ──退款回调/查单：全额退款──▶ [已退款 4]
[退款中 3] ──退款回调/查单：部分退款──▶ [已支付 1]（refunded_amount 累计，可再次退款）
```

说明：
- 已关闭（2）是终态，不可再支付；用户在关单瞬间支付成功的，由对账发现并走退款补偿。
- 退款中（3）是中间态：退款是异步的，以渠道退款回调/查单结果为准。
- 已退款（4）仅表示**全额**退款完成；部分退款后回到已支付（1），`refunded_amount` 记录累计已退金额。

## 核心时序

### 下单时序

```
业务方                本模块                          渠道
  │  POST /orders      │                              │
  │  (业务单据号/场景)  │                              │
  │ ─────────────────▶ │ 按业务单据重算金额(红线)        │
  │                    │ 生成 out_trade_no，落 wg_pay_order(status=0)
  │                    │ 调渠道统一下单 ─────────────▶ │
  │                    │ ◀──── 返回 prepay/二维码串 ─── │
  │ ◀──── 支付参数 ──── │ （微信 prepay 参数 / 二维码串， │
  │                    │  支付宝 orderString）          │
```

### 回调时序

```
渠道                  本模块                          业务方
  │  POST /notify/xx   │                              │
  │ ─────────────────▶ │ 验签(失败即拒绝+告警)          │
  │                    │ FOR UPDATE 锁支付单 + 状态判断 │
  │                    │ status=0 → 推进已支付，回填     │
  │                    │ provider_trade_no/paid_at/     │
  │                    │ notify_payload                 │
  │ ◀── 成功应答 ────── │ （微信 SUCCESS / 支付宝 success）│
  │                    │ 发事件/消息通知业务方 ────────▶ │ 发券/发货(异步)
  │  （重推）           │                              │
  │ ─────────────────▶ │ 已支付 → 判重 → 直接返回成功应答 │
```

回调链路只做状态推进 + 发通知，禁止同步做重业务（见红线 5）。

### 退款回调时序

```
渠道                  本模块
  │  POST /notify/xx  │
  │  (退款结果)        │
  │ ─────────────────▶ │ 验签(失败即拒绝+告警)
  │                    │ FOR UPDATE 锁退款单 → 锁支付单
  │                    │ 退款成功: refund.status=1, 回填 provider_refund_no
  │                    │   order.refunded_amount += amount (唯一回写点)
  │                    │   全额→status=4 / 部分→status=1
  │                    │ 退款失败: refund.status=2, order.status=1
  │ ◀── 成功应答 ────── │ （止重推）
```

### 关单时序

```
定时任务              本模块                          渠道
  │ 扫 expire_at<now   │                              │
  │ 且 status=0 的单    │                              │
  │ ─────────────────▶ │ 调渠道关单接口 ─────────────▶ │
  │                    │ ◀──── 关单成功 ────────────── │
  │                    │ 改本地 status=2（已关闭）       │
  │                    │ （渠道关单失败：不改本地，       │
  │                    │  等下次任务或对账修复）         │
```

**先关渠道再改本地**：防止用户刚好在关单瞬间支付成功（本地已关但渠道还能付）造成资损。

## 对账任务

每日凌晨定时拉取渠道账单（微信下载对账单 / 支付宝查询对账单下载地址），与本地 `wg_pay_order` 逐笔核对：

| 比对字段 | 渠道账单 | 本地 |
|----------|----------|------|
| 商户单号 | out_trade_no | out_trade_no |
| 渠道单号 | transaction_id | provider_trade_no |
| 金额 | 总金额（分） | amount |
| 状态 | 交易状态 | status |

差异类型：渠道有本地无（漏单）、本地已支付渠道无（掉单）、金额不一致、状态不一致。所有差异记录告警日志并落差异清单，**人工介入处理**——对账是最终一致性兜底，不自动改账。

## 环境变量

密钥与证书一律走环境变量/密钥管理服务（红线 8），禁止入库/日志/代码；证书文件路径走配置。各语言实现按名读取：

| 变量 | 说明 |
|------|------|
| `WECHAT_MCH_ID` | 微信商户号 |
| `WECHAT_APP_ID` | 微信 AppID（小程序/公众号） |
| `WECHAT_API_V3_KEY` | API v3 密钥（回调解密、平台证书自动更新） |
| `WECHAT_PRIVATE_KEY_PATH` | 商户 API 私钥文件路径（apiclient_key.pem） |
| `WECHAT_SERIAL_NO` | 商户 API 证书序列号 |
| `WECHAT_NOTIFY_URL` | 微信支付/退款回调地址（公网可达） |
| `ALIPAY_APP_ID` | 支付宝应用 AppID |
| `ALIPAY_PRIVATE_KEY` | 支付宝应用私钥（RSA2） |
| `ALIPAY_PUBLIC_KEY` | 支付宝公钥（验签） |
| `ALIPAY_NOTIFY_URL` | 支付宝回调地址（公网可达） |
| `PAY_ORDER_EXPIRE_MINUTES` | 支付单过期分钟数（默认 30，可选） |

## 对接文档

生成的代码外，需产出详细的**对接文档**，包含：

1. **环境变量清单**：上节所有变量 + 项目复用骨架的变量
2. **渠道商户后台配置**：
   - 回调通知地址（支付 / 退款）
   - 授权目录（JSAPI）/回调白名单
   - 商户密钥/证书上传
3. **前端对接要点**：
   - 调 `/api/pay/orders` 获取支付参数
   - 拉起支付控件（微信 `wx.requestPayment` / 支付宝 `tradePay`）
   - 支付结果以回调为准，前端可轮询 `/api/pay/orders/{outTradeNo}` 查询状态
4. **业务方接入**：
   - 支付成功事件：`PaySuccessEvent`（监听并做业务处理）
   - 退款成功事件：`RefundSuccessEvent`
   - 退款查单定时任务（超时未收到回调时主动查）
