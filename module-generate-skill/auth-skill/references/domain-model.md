# auth-skill — 领域模型与表结构

语言无关。表前缀默认 `wg`（可覆盖），DDL 以 PostgreSQL 为准，MySQL 差异在注释中标注。按问答结果裁剪：不要第三方登录不建 `wg_oauth_account`；图形验证码/密码找回只加 Redis 键，不建表。

## 实体关系

```
wg_user（用户） 1 ──── n wg_refresh_token（刷新令牌）
wg_user（用户） 1 ──── n wg_oauth_account（第三方绑定，可选）
短信验证码、图形验证码、登录失败计数、token 黑名单：走 Redis，不建表
```

## 表结构

> **用户 ID 生成策略**（按问答选择，**默认自增**）：
> - **自增 BIGINT（默认）**：`id BIGSERIAL`（MySQL `BIGINT AUTO_INCREMENT`），简单、有序、索引/外键最优。MongoDB 直接用驱动默认 `ObjectId`，不自造。
> - **UUIDv7 / 雪花**：仅当用户明确要求防枚举、多实例或对外暴露 ID 时启用，主键改为 `CHAR(36)`/`VARCHAR(26)` 或 `BIGINT`（雪花）。
> - **双 ID（可选，防枚举最彻底）**：内部 `id` 自增用于外键/存储（永不暴露），另加 `public_id VARCHAR(26) UNIQUE`（ULID/UUIDv7）用于对外出入参与 URL；JWT `sub` 仍用内部 `id`。
>
> 默认就选自增完事；以下 DDL 以自增为准，选其他策略时只改 `id` 列类型（必要时加 `public_id`）。

### wg_user — 用户（标准用户表）

```sql
CREATE TABLE wg_user (
  id            BIGSERIAL PRIMARY KEY,          -- MySQL: BIGINT AUTO_INCREMENT
  username      VARCHAR(64) UNIQUE,             -- 账号密码登录用，可空（纯验证码场景）
  phone         VARCHAR(20) UNIQUE,             -- 手机号，可空
  password_hash VARCHAR(100),                   -- bcrypt，可空（纯验证码/第三方/uniapp 场景）
  open_id       VARCHAR(64) UNIQUE,             -- uniapp 微信小程序 openid（选 uniapp 时建），可空
  nickname      VARCHAR(64) NOT NULL DEFAULT '',
  avatar        VARCHAR(500) NOT NULL DEFAULT '',
  status        SMALLINT NOT NULL DEFAULT 1,    -- 1 正常 0 禁用
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),  -- MySQL: DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3)
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_user_phone ON wg_user(phone);
CREATE INDEX idx_user_openid ON wg_user(open_id);   -- 选 uniapp 时建
```

设计要点：
- `username`/`phone`/`password_hash`/`open_id` 全部可空：支持纯密码、纯验证码、纯第三方、uniapp 四种形态，唯一约束天然防重。
- `open_id` 是 uniapp 微信小程序的用户唯一标识（选「仅 openid」模式时作为主身份；选「解析手机号」模式时作为辅助绑定，主身份仍是 phone）。**只有选 uniapp 登录才建此列与索引**。APP/H5 的第三方账号不走此列，走 `wg_oauth_account`。
- 不放角色/权限字段——那是 org-permission-skill 的事，本表保持最小。
- `status` 在鉴权过滤器里校验：禁用用户的 token 一律拒绝（`-1002`）。

### wg_refresh_token — 刷新令牌

```sql
CREATE TABLE wg_refresh_token (
  id           BIGSERIAL PRIMARY KEY,
  user_id      BIGINT NOT NULL REFERENCES wg_user(id),
  token_hash   VARCHAR(64) NOT NULL UNIQUE,     -- refresh token 的 SHA-256，禁止存明文
  jti          VARCHAR(64) NOT NULL,            -- 对应 access token 的 jti，登出拉黑用
  revoked      BOOLEAN NOT NULL DEFAULT FALSE,
  expires_at   TIMESTAMPTZ NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_rt_user ON wg_refresh_token(user_id);
```

设计要点：
- **轮换（rotation）**：每次 `POST /api/auth/refresh` 校验通过后，旧行 `revoked = true`，插入新行。旧令牌被重放时直接拒绝（`-1002`），并可选择连带吊销该用户全部令牌（防盗刷）。
- **密码重置后**：把该 `user_id` 全部行 `revoked = true`，强制重新登录。
- 清理：过期行定时任务删除（job-skill 二期；临时用 SQL cron）。

### wg_oauth_account — 第三方绑定（可选，确认要第三方登录才建）

```sql
CREATE TABLE wg_oauth_account (
  id           BIGSERIAL PRIMARY KEY,
  user_id      BIGINT NOT NULL REFERENCES wg_user(id),
  provider     VARCHAR(20) NOT NULL,            -- wechat / alipay / github ...
  open_id      VARCHAR(128) NOT NULL,
  union_id     VARCHAR(128),                    -- 微信开放平台 unionid，可空
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (provider, open_id)
);
```

设计要点：
- `(provider, open_id)` 唯一：同一个第三方账号只能绑一个本地用户。
- 首次第三方登录未绑定时：按问答配置自动建 `wg_user`（username/password 为空）或返回「需绑定」由前端走 `/api/auth/oauth/bind`。

## 状态机

### 用户状态

```
[正常 1] ──禁用──▶ [禁用 0]    禁用后：登录拒绝、已有 token 在过滤器层拒绝
[禁用 0] ──启用──▶ [正常 1]
[正常 1] ──注销──▶ [禁用 0]    注销(deactivate)：二次确认后置 status=0 + 吊销全部 token
```

> **注销复用 `status=0`**：用户主动注销与后台禁用共用「禁用」态即可（都拒绝登录）。若业务需区分二者，再加 `status=2 注销` 或 `deactivated_at` 字段，默认不必加。注销是软删除，不删行（保留数据与审计）。

### 刷新令牌生命周期

```
签发 ──▶ 有效 ──轮换──▶ 已作废（revoked=true，新行生效）
        │
        ├──登出──▶ 已作废
        ├──密码重置──▶ 已作废（该用户全量吊销）
        └──到期──▶ 失效（expires_at 过期，定时清理）
```

## Redis 键约定

| 键 | 值 | TTL | 用途 |
|----|----|----|------|
| `sms:code:{scene}:{phone}` | 6 位验证码 | 5min | 短信登录/注册/找回密码；**scene∈{login,reset} 分场景存储，互不覆盖、不可串用** |
| `sms:limit:{phone}` | 计数 | 60s | 发送间隔限流（跨场景共享，按手机号） |
| `sms:daily:{phone}` | 计数 | 24h | 每日上限 10 次（跨场景共享，按手机号） |
| `captcha:{captchaId}` | 算术答案 | 5min | 图形验证码（开启时） |
| `login:fail:{username\|phone}` | 计数 | 15min | 失败锁定（≥5 次）；**登录成功后必须 `DEL` 重置** |
| `token:blacklist:{jti}` | 1 | access 剩余有效期 | 登出后 access 立即失效（可选） |

> **短信发送顺序红线**：先查限流/当日上限（`sms:limit`、`sms:daily`），通过后**先调 `smsSender.send()`，发送成功才写 `sms:code` 与 `sms:limit`**；发送失败要回退当日计数（`DECR sms:daily`）且不写限流键，避免「用户没收到短信却被锁 60s、白烧配额」。
>
> **`forgot-password` 防枚举**：限流判断（60s/每日）必须对**所有手机号一致执行**，无论是否注册都占用同样的限流配额，仅「是否真发短信」按注册与否区分；否则第二次请求即可凭「`-1006` vs 成功」判定手机号是否注册。

无 Redis 的降级：短信验证码与计数落 DB 表（`wg_sms_code`：`phone, scene, code, expires_at, used`，唯一键 `(phone, scene)`）；图形验证码降级为内存 `ConcurrentHashMap`/进程内 Map（单实例可用，多实例需 Redis）；黑名单取消（接受 access 自然过期）。

## 环境变量（在 convention 必备变量之上追加）

convention 的 `JWT_SECRET` / `JWT_EXPIRES_IN` / `DB_*` / `REDIS_*` 已含。本模块追加短信变量（命名遵循 env-config-guide：全大写）：

| 变量名 | 示例 | 说明 |
|--------|------|------|
| ALIYUN_ACCESS_KEY_ID | （必填，开短信时） | 阿里云 AccessKeyId |
| ALIYUN_ACCESS_KEY_SECRET | （必填，开短信时） | 阿里云 AccessKeySecret |
| SMS_REGION_ID | cn-hangzhou | 阿里云短信地域，默认 cn-hangzhou |
| SMS_SIGN_NAME | 你的签名 | 短信签名（需在阿里云审核通过） |
| SMS_TEMPLATE_CODE | SMS_xxxxxxx | 验证码模板 Code（模板变量约定为 `${code}`） |

`.env.example` 追加段（`.env` 必须 gitignore；`.env.example` 可提交但敏感值留空）：

```bash
# Aliyun SMS（短信登录/找回密码；dev 环境用 LogSender 不真发）
ALIYUN_ACCESS_KEY_ID=
ALIYUN_ACCESS_KEY_SECRET=
SMS_REGION_ID=cn-hangzhou
SMS_SIGN_NAME=
SMS_TEMPLATE_CODE=

# WeChat Mini-Program（uniapp 微信小程序登录，选 uniapp 时必填）
WECHAT_MINIAPP_APPID=
WECHAT_MINIAPP_SECRET=
```

> `APP_ENV=dev` 时用只打日志、不真发的 `LogSmsSender`，避免开发期烧短信费；生产必须注入真实 AccessKey。APP/H5 第三方 oauth 的 `appid/secret` 同理走环境变量（如 `WECHAT_APP_ID` / `WECHAT_APP_SECRET`）。微信的 `session_key` 只用于本次解析手机号，禁止落库或下发前端。

## 核心时序

### 双令牌登录与续期

```
客户端                服务端
  │  POST /login       │
  │ ─────────────────▶ │ (开图形码则先校验 captcha) → 校验密码 → 签发 access(2h) + refresh(30d, 哈希入库)
  │ ◀───────────────── │
  │  业务请求 + access │
  │ ─────────────────▶ │ 校验签名/过期/黑名单/status
  │  access 过期       │
  │  POST /refresh     │
  │ ─────────────────▶ │ 校验 refresh 哈希+revoked+exp → 旧行 revoked → 签新对
  │ ◀───────────────── │
```

### 短信登录（含图形验证码）

```
客户端                服务端
  │ GET /captcha       │ (开启时) 生成算术题 → 存 Redis captcha:{id} → 返回 {captchaId, svg}
  │ ◀───────────────── │
  │ POST /sms-code     │ 校验 captcha → 限流(60s/每日10) → 生成码存 Redis → 阿里云发送
  │ ◀───────────────── │
  │ POST /sms-login    │ 校验 sms:code → 不存在则自动建号 → 签发双令牌
  │ ◀───────────────── │
```

### 密码找回 / 重置

```
客户端                服务端
  │ POST /forgot-password │ 校验手机号格式 → 复用短信限流发码 → 统一返回成功(不泄露是否注册)
  │ ◀──────────────────── │
  │ POST /reset-password  │ 校验 sms:code → bcrypt 重置 → 吊销该用户全部 refresh → 成功
  │ ◀──────────────────── │
```

### 第三方 oauth 登录（APP/H5 客户端模式）

```
客户端                服务端                      第三方(微信/支付宝/GitHub)
  │ 拿 code(前端 SDK)  │                            │
  │ POST /oauth/login  │                            │
  │ ─────────────────▶ │ code + appid/secret 换 openid │
  │                    │ ─────────────────────────▶ │
  │                    │ ◀──── openid(+unionid) ─── │
  │                    │ 查 wg_oauth_account：已绑→签发双令牌；未绑→建号或返回需绑定
  │ ◀───────────────── │
```

### uniapp 微信小程序登录

```
uniapp 前端            服务端                      微信
  │ uni.login() 拿 code │                            │
  │ POST /wx-login      │                            │
  │ ──────────────────▶ │ jscode2session(appid,secret,code) │
  │                     │ ────────────────────────▶ │
  │                     │ ◀── openid + session_key ── │
  │   ①仅 openid 模式：  │ 按 open_id 查/建 wg_user → 签发双令牌 │
  │   ②解析手机号模式：  │ 前端另传 getPhoneNumber 的 code； │
  │                     │ 服务端用 access_token+code 调微信手机号接口 │
  │                     │ ────────────────────────▶ │
  │                     │ ◀── phone ──────────────── │
  │                     │ 按 phone 查/建 wg_user 并绑 open_id → 签发双令牌 │
  │ ◀────────────────── │
```

> 解析手机号需小程序「企业级」权限且前端按钮 `open-type="getPhoneNumber"`；个人小程序只能用①仅 openid 模式。`session_key` 与 `access_token` 都不下发前端、不落库（access_token 由服务端缓存至过期）。
