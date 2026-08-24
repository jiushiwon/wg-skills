# notification-skill — 领域模型与表结构

语言无关。表前缀默认 `wg`（可覆盖），DDL 以 PostgreSQL 为准，MySQL 差异在注释中标注。

## 实体关系

```
wg_notify_template（通知模板） 1 ──── n wg_notify_record（发送记录）
限流计数：走 Redis，不建表
业务方 ──sendSms/sendEmail(模板code)──▶ NotifyService ──▶ 供应商（阿里云短信 / SMTP）
```

设计核心：**业务方只用模板 `code`**。`code` → 供应商模板 ID / 邮件主题正文的映射只存在 `wg_notify_template` 里，换供应商只改这张表的配置，业务代码零改动。

## 表结构

### wg_notify_template — 通知模板

```sql
CREATE TABLE wg_notify_template (
  id                   BIGSERIAL PRIMARY KEY,          -- MySQL: BIGINT AUTO_INCREMENT
  code                 VARCHAR(64) NOT NULL UNIQUE,    -- 业务标识，如 login_code / pay_success；业务方只用它
  channel              VARCHAR(10) NOT NULL,           -- sms / email
  provider_template_id VARCHAR(128) NOT NULL,          -- 阿里云模板 CODE（SMS_xxx）或邮件主题模板；业务方不感知
  content              TEXT,                           -- 邮件正文模板（变量占位 {{var}}）；短信为空（内容在阿里云侧）
  variables            JSONB,                          -- 模板变量定义，如 {"code":"验证码"}；MySQL: JSON
  status               SMALLINT NOT NULL DEFAULT 1,    -- 1 启用 0 停用
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),  -- MySQL: DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3)
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_notify_tpl_channel ON wg_notify_template(channel);
```

设计要点：
- `code` 唯一，是业务方与模板的唯一契约；`provider_template_id` 是供应商侧标识，**禁止泄露到业务代码**。
- 短信 `content` 为空：阿里云短信内容在控制台审核，代码侧只传模板 CODE + 变量 JSON。邮件 `content` 存正文模板，`provider_template_id` 存主题模板。
- `variables` 仅作文档/校验用途（提示该模板需要哪些变量），不参与发送。

### wg_notify_record — 发送记录

```sql
CREATE TABLE wg_notify_record (
  id                  BIGSERIAL PRIMARY KEY,
  channel             VARCHAR(10) NOT NULL,        -- sms / email
  target              VARCHAR(128) NOT NULL,       -- 手机号 / 邮箱地址
  template_code       VARCHAR(64) NOT NULL,        -- 冗余存 code，便于审计（模板可能被改）
  params              JSONB,                       -- 实际发送变量，如 {"code":"482913"}；MySQL: JSON
  provider            VARCHAR(20) NOT NULL,        -- aliyun / smtp
  provider_request_id VARCHAR(128),                -- 阿里云 BizId / 邮件 Message-ID，用于对账与回执匹配
  status              SMALLINT NOT NULL DEFAULT 0, -- 0 待发送 1 成功 2 失败
  error_msg           VARCHAR(500),                -- 失败原因（供应商返回或异常信息），禁止含密钥
  retry_count         INT NOT NULL DEFAULT 0,      -- 已重试次数，上限 3
  next_retry_at       TIMESTAMPTZ,                 -- 下次重试时间（指数退避），扫表 worker 用
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  sent_at             TIMESTAMPTZ                  -- 实际发出时间
);
CREATE INDEX idx_notify_record_status_retry ON wg_notify_record(status, next_retry_at); -- 扫表 worker 用
CREATE INDEX idx_notify_record_target ON wg_notify_record(target);
CREATE INDEX idx_notify_record_created ON wg_notify_record(created_at);
```

设计要点：
- **所有发送（成功失败）都落库**。`status=0` 是「已落库待发送」，HTTP 链路到此即返回，真正发送交给后台 worker。
- `provider_request_id` 是与供应商对账、匹配阿里云回执的唯一线索，必须落库。
- `next_retry_at` + 状态索引让「定时扫表」成为无队列时的降级发送方案。

## 状态机

### 发送记录状态

```
[待发送 0] ──发送成功──▶ [成功 1]
   │
   └──发送失败──▶  retry_count < 3 且「可重试错误」？
                     │ 是
                     ▼
              置 next_retry_at（指数退避 1min/5min/15min），retry_count+1，回到 [待发送 0]
                     │ 否（业务错误 / 已达上限）
                     ▼
                 [失败 2]（终态，不再重试；支持手动 retry 接口重置）
```

退避：第 1 次失败后 1 分钟重试，第 2 次后 5 分钟，第 3 次后 15 分钟；超过 3 次置 `status=2`。

**可重试判定**（关键）：只对「未收到供应商回执 / 网络超时 / 限流 / 5xx」重试；对「签名未审核、模板未审核、号码黑名单、余额不足、参数错误」等明确业务错误**直接置失败不重试**（避免无效重试与重复计费）。

## Redis 键约定

| 键 | 值 | TTL | 用途 |
|----|----|----|------|
| `sms:limit:{phone}` | 计数 | 60s | 短信发送间隔限流（复用 auth-skill 约定） |
| `sms:daily:{phone}` | 计数 | 24h | 短信每日上限 10 次（复用 auth-skill 约定） |
| `mail:limit:{addr}` | 计数 | 60s | 邮件发送间隔限流 |
| `mail:daily:{addr}` | 计数 | 24h | 邮件每日上限 50 次 |

短信限流键与 auth-skill 完全一致——auth 发验证码与本模块发短信走同一条通道、同一套限流，避免重复定义。无 Redis 的降级：限流计数落 DB 表（`target, channel, window, count`），同样做 TTL 校验；可接受限流精度下降。

## 阿里云短信签名机制（了解即可，优先用 SDK）

阿里云短信 API 是 RPC 风格，公共参数（`AccessKeyId`、`SignatureMethod=HMAC-SHA1`、`SignatureVersion=1.0`、`SignatureNonce`、`Timestamp`、`Format`）+ 业务参数（`PhoneNumbers`、`SignName`、`TemplateCode`、`TemplateParam`）按 key 排序后做 URL 编码拼接，用 `AccessKeySecret` 做 HMAC-SHA1 再 Base64 得到 `Signature`。

**红线：优先用官方 SDK**（Java `dysmsapi20170525`、Go `alibabacloud-go/dysmsapi`、Python `alibabacloud_dysmsapi20170525`、Node `@alicloud/dysmsapi20170525`），SDK 已封装签名、重试与异常分类，不要手算签名。仅当环境无法安装 SDK（如受限内网）时，才按上述机制手算，且 `AccessKeySecret` 仍只走环境变量。

## 核心时序：异步发送（无队列降级）

```
业务方                NotifyService                 后台 worker（定时扫表）
  │ sendSms(phone,     │                              │
  │  code, params)     │                              │
  │ ─────────────────▶ │ 限流校验 → 落库(status=0)    │
  │ ◀───────────────── │ 立即返回（不阻塞）            │
  │                    │                              │ 扫 status=0 且到 next_retry_at
  │                    │                              │ ──▶ 调阿里云/SMTP
  │                    │ ◀── 更新 status=1/2、          │
  │                    │     provider_request_id       │ （或等阿里云回执更新）
```

有消息队列时：落库后投递到队列，由消费者发送，逻辑相同，把「定时扫表」换成「消费队列」。
