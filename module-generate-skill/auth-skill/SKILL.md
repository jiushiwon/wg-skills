---
name: auth-skill
description: 登录鉴权模块生成。用户要做登录、注册、JWT 鉴权、短信验证码登录、图形验证码、密码找回重置、uniapp/微信小程序登录、第三方登录、登出、刷新令牌时使用。可独立使用（自带技术栈+数据库选型），也可作为 backend-generate-skill 某框架之上的业务填充。产出标准用户表/凭证领域模型、表结构、接口契约增量（含完整接口文档）与四语言实现，默认阿里云短信，遵循 backend-convention-skill。覆盖完整用户系统：注册、登录鉴权、找回密码、资料管理（profile 读写、改密、换绑手机、注销账号）。权限系统不实现只留扩展尾巴。触发词："加登录"、"登录鉴权"、"用户注册"、"用户系统"、"用户体系"、"JWT 登录"、"验证码登录"、"手机号登录"、"短信登录"、"图形验证码"、"密码找回"、"忘记密码"、"重置密码"、"修改密码"、"换绑手机号"、"绑定手机号"、"注销账号"、"个人资料"、"资料管理"、"刷新令牌"、"token 续期"、"登出"、"auth module"、"login module"、"user system"、"profile"、"第三方登录"、"微信登录"、"微信小程序登录"、"uniapp 登录"、"openid 登录"、"SSO 登录"。
---

# Auth Skill

登录鉴权模块生成器。产出：领域模型 + 表结构 + 接口契约增量（完整接口文档）+ 目标语言可运行实现。

**定位**：纯后端的**用户系统（User System）生成器**。以标准用户表为根，长出「注册 + 登录鉴权 + 资料管理」完整闭环：既是 `backend-generate-skill` 某一框架之上的「用户业务填充」，也能**独立使用**（自带技术栈 + 数据库选型，内置 `api-contract.md` 产出）。只要项目需要用户体系，就能用本技能。**权限系统不实现，只留扩展尾巴**（见「模块红线」），交给下游 org-permission-skill。

**依赖**：backend-convention-skill（规范，引用不复制）、database-skill（DB 选型，引用不复制）。本模块是 org-permission-skill、ai-chat-skill 的上游依赖——**权限系统由 org-permission-skill 提供，本模块只留「当前用户注入」扩展点，不实现角色/权限**。

## 两种使用模式

| 模式 | 触发场景 | 技术栈/DB 来源 |
|------|----------|----------------|
| **组合模式** | 项目已由 backend-generate-skill 生成，或已有骨架 | 读项目根 `pom.xml`/`go.mod`/`pyproject.toml`/`requirements.txt`/`package.json` 自动检测；沿用其 `.env` 与 `api-contract.md` |
| **独立模式** | 只要登录模块、还没有骨架 | 走「选型」（下节），现场生成最小可运行骨架 + 登录模块 + 全新 `api-contract.md` |

独立模式下，骨架只生成「能跑通登录」所必需的部分（信封、JWT、DB、配置），完整骨架仍建议交给 backend-generate-skill。

## 生成流程

1. **选型**（独立模式必做；组合模式跳过，直接检测）：语言+框架、数据库、表前缀，规则与 backend-generate-skill 完全一致（见下节）。
2. **问答确认业务边界**（见「问答清单」，未明确的一律按默认值并告知用户）。
3. 按 `references/domain-model.md` 产出表结构 DDL（按确认结果裁剪：不要第三方登录不建 oauth 表；图形验证码/密码找回只加 Redis 键不加表）。
4. 按 `references/api-contract.md` 产出接口契约：组合模式**追加**进项目 `api-contract.md`；独立模式**新建**完整 `api-contract.md`（含基础信息/响应格式/枚举字典/错误码汇总，格式遵循 `api-contract-spec.md`）。
5. 按选定技术栈，展开 `references/<lang>.md` 为可运行代码（含图形验证码生成、阿里云短信 Sender、密码找回、uniapp 微信登录、第三方 oauth 登录）。
6. 补 `.env` / `.env.example`：在 convention 必备变量之上，追加短信所需变量（见 domain-model.md「环境变量」节）。
7. 逐条核对「模块红线」。

## 选型（与 backend-generate-skill 一致）

**语言 + 框架**（团队强偏好优先；检测不到时问）：

| 项目类型 | 推荐 |
|----------|------|
| 企业级 / 复杂业务 | Java + Spring Boot |
| 快速 API / AI / 数据 | Python + FastAPI |
| 全栈 JS / MVP | Node.js + Express |
| 全栈 JS / 企业模块化 | Node.js + NestJS |
| 高并发 / 微服务 | Go + Gin |

**数据库**（规则同 database-skill）：

| 数据特征 | 推荐 | 备注 |
|----------|------|------|
| 强关系、事务 | PostgreSQL | 默认首选 |
| 团队熟 MySQL | MySQL 8 | 兼容现有团队 |
| 文档、灵活模式 | MongoDB | 仅 Node / Python 栈 |

**表前缀**：默认 `wg`，可覆盖。

**用户 ID 生成策略**（规则详见 domain-model.md「用户 ID 生成」节；检测不到时问，**默认自增**）：

| 场景 | 推荐 | 备注 |
|------|------|------|
| 单库 / 默认 | **BIGINT 自增** | 8字节、有序、索引/外键最优，默认选这个完事 |
| MongoDB | **默认 ObjectId** | 沿用驱动默认，不自造 |
| 多实例 / 防枚举 / 对外暴露 ID | UUIDv7 或雪花 | 仅在用户明确要求时启用；对外可用 public_id 双 ID 模式 |

## 问答清单（生成前确认）

| 决策 | 选项 | 默认 |
|------|------|------|
| 登录形态 | 常规 / uniapp(微信小程序) / 两者都要 | 常规 |
| uniapp 身份标识 | （选 uniapp 时必问）仅 openid 作为用户唯一 ID / 解析手机号(企业级) | 仅 openid |
| 登录方式（常规时） | 账号密码 / 短信验证码 / 两者都要 | **两者都要**（短信登录必做） |
| 短信供应商 | 阿里云 / 其他 | **阿里云（Dysmsapi）**，密钥走 env |
| 图形验证码 | 开 / 关 | 关（勾选才开；作用于密码登录 + 发短信） |
| 密码找回/重置 | 开 / 关 | **开**（常规且含短信时；纯 uniapp-openid 无密码则不需要） |
| 第三方登录(oauth) | 不接 / 微信 / 其他 | 不接（APP/H5 客户端模式：拿 code 换 openid 绑定） |
| 令牌模式 | 单 access token / access + refresh 双令牌 | 双令牌 |
| access 过期时间 | — | 2h |
| refresh 过期时间 | — | 30d，滑动续期 |
| 注册方式 | 开放注册 / 仅后台创建 / 邀请制 | 开放注册 |
| **用户 ID 策略** | **自增 BIGINT（默认）** / UUIDv7 / 雪花；MongoDB 用默认 ObjectId | **自增 BIGINT** |
| 资料管理 | 开 / 关 | **开**（profile 读写 + 改密 + 换绑手机 + 注销，构成用户系统闭环） |

> **uniapp 登录**：微信小程序专用通道。前端 `uni.login()` 拿 code → 后端用 `WECHAT_MINIAPP_APPID`/`SECRET`（写 .env）调微信 `jscode2session` 换 openid+session_key。身份标识两种方式：**①仅 openid**——openid 作为用户唯一 ID，用户表新增 `open_id` 字段；**②解析手机号（企业级）**——前端额外传 `getPhoneNumber` 的 code，后端用 appid/secret 调微信手机号接口解析出手机号，以手机号为用户标识并绑定 open_id。两者选一，实施前必须问。
>
> **短信通道**：默认走本模块内置的最小阿里云 Sender；检测到项目已接入 notification-skill 时**委托**给它（业务方只调 `sendSms`，不重复实现）。未接阿里云且无 notification-skill 时，留 `SmsSender` 接口 + dev 日志实现兜底。

## 模块红线

1. **密码必须 bcrypt**（cost ≥ 10），禁止 MD5/SHA 裸哈希、禁止明文、禁止可逆加密。
2. **短信验证码**：6 位数字、用 CSPRNG（`secrets`/等价物，禁 `random`）、5 分钟过期、一次性（验证成功即作废）、同一手机号 60s 内禁止重发、每日每号上限 10 次。存储用 Redis，**按场景分键 `sms:code:{scene}:{phone}`（login/reset 互不串用）**；限流/当日计数按手机号跨场景共享（`sms:limit:{phone}`、`sms:daily:{phone}`）。无 Redis 时用 DB 表但同样 TTL 校验。**发送顺序：先过限流、调 `send()` 成功后才写验证码与 60s 限流键；发送失败回退当日计数、不写限流键**（避免没收到短信却被锁 60s）。
3. **图形验证码**（开启时）：简单算术题（加减乘除，两位数内），答案存 Redis `captcha:{id}` TTL 5min、一次性；以 **SVG** 返回（无第三方图片库依赖）；**密码登录与发短信前必须校验**，校验错误计入登录失败锁定。
4. **refresh token 不落明文**：DB 只存其 SHA-256 哈希 + 过期时间 + 作废标记；轮换（rotation）时旧令牌立即作废；旧令牌被重放可连带吊销该用户全部令牌。
5. **登出即拉黑**：access token 无状态无法撤销，登出时把 refresh 作废即可；若业务要求 access 立即失效，用 Redis 黑名单存 jti 至其过期。
6. **密码找回**：`forgot-password` 复用短信验证码限流（60s/每日 10 次），且**限流对所有手机号一致执行**（未注册号同样占配额，仅「是否真发」按注册区分），否则可凭「`-1006` vs 成功」枚举手机号；`reset-password` 校验码通过后 bcrypt 重置密码，并**吊销该用户全部 refresh token**（强制重新登录）。全程不泄露「手机号是否已注册」（防枚举，统一返回成功）。
7. **JWT payload 只放 `sub`（用户ID）、`jti`、`exp`**，禁止放角色权限等可变数据（权限查库/缓存，见 org-permission-skill）。
8. **登录失败统一文案**"账号或密码错误"，禁止区分"用户不存在"与"密码错误"（防枚举）；连续失败 5 次锁定 15 分钟（计数走 Redis），**登录成功后必须重置该计数**。
9. **第三方登录(oauth)只做客户端模式**：后端拿前端传来的 code 向第三方换 openid，不实现 OAuth2 服务端/SSO 服务端；openid 与本地用户的绑定走 `wg_oauth_account`，首次登录可自动建号（可配置）。
10. **uniapp 微信小程序登录**：appid/secret 只走环境变量（`WECHAT_MINIAPP_APPID`/`WECHAT_MINIAPP_SECRET`），禁止硬编码；code→openid 用微信 `jscode2session`，解析手机号用微信手机号接口（access_token + code），禁止手算或前端传明文手机号冒充；session_key 不落库、不下发前端。
11. 错误码用闭集：参数错 `-1001`、未授权 `-1002`、资源不存在 `-1004`、资源冲突（手机号已注册）`-1005`、限流 `-1006`；服务/三方异常（短信发送失败、微信调用失败、验证码生成失败）用 `-2000` 兜底（与 backend-convention-skill 闭集一致）。
12. JWT 密钥、阿里云 AccessKey、短信签名/模板 ID、微信 appid/secret 一律走环境变量（见 domain-model.md「环境变量」节），禁止入库或硬编码。
13. **契约即事实**：接口字段/枚举/错误码以 `api-contract.md` 为准，实现与契约冲突时契约赢。
14. **权限只留尾巴**：本模块不实现角色/权限，`wg_user` 不开任何权限列，只认 `status`（启用/禁用）；授权一律下游 org-permission-skill。仅预留「当前用户注入」扩展点供下游 enrich，JWT payload 不放权限数据。
15. **用户 ID**：默认自增 BIGINT（MongoDB 用默认 ObjectId），简单优先；仅当用户明确要求防枚举/多实例/对外暴露 ID 时，才启用 UUIDv7、雪花或「内部自增 + 对外 public_id」双 ID。启用双 ID 时对外响应一律用 `public_id`，不泄露内部自增 id。
16. **资料管理**：改密必须校验旧密码、改后吊销该用户其他设备的 refresh（保留当前会话）；换绑手机必须校验新号短信验证码（`scene=bind`）且唯一冲突转 `-1005`；注销必须二次确认（密码或短信验证码）并吊销全部 token、置 `status=0`。

## 标准接口

见 `references/api-contract.md`（按问答裁剪）：
`GET /api/auth/captcha`（开图形验证码时）、`POST /api/auth/register`、`POST /api/auth/login`、`POST /api/auth/sms-code`、`POST /api/auth/sms-login`、`POST /api/auth/forgot-password`、`POST /api/auth/reset-password`、`POST /api/auth/wx-login`（uniapp 微信小程序时）、`POST /api/auth/refresh`、`POST /api/auth/logout`、`GET /api/auth/me`、`POST /api/auth/oauth/login` + `POST /api/auth/oauth/bind`（接第三方 oauth 时）。

**资料管理**（开资料管理时，鉴权均为 Bearer）：
`GET /api/user/profile`、`PATCH /api/user/profile`、`POST /api/user/change-password`、`POST /api/user/bind-phone`、`POST /api/user/deactivate`。

## 四语言实现要点

- Java：`references/java.md`（Spring Boot；阿里云 dysmsapi SDK、SVG 验证码、bcrypt）
- Go：`references/go.md`（Gin；alibabacloud-go/dysmsapi、SVG 验证码、bcrypt）
- Python：`references/python.md`（FastAPI；alibabacloud_dysmsapi20170525、SVG 验证码、bcrypt）
- Node：`references/nodejs.md`（Express/NestJS；@alicloud/dysmsapi20170525、SVG 验证码、bcrypt）

## 交付物

可运行代码（注册 + 登录鉴权 + 资料管理全套）+ `api-contract.md`（接口文档，与代码同时交付，便于前端对接；缺一则视为未完成）。独立模式另含最小骨架与 `.env.example`。

## 不做

- **不实现权限系统**：角色/权限/RBAC 一律不做，只留「当前用户注入」扩展尾巴，交给下游 org-permission-skill。
- 不实现 SSO/OAuth2 服务端（第三方 oauth 与 uniapp 微信登录都只做客户端模式：拿 code 换 openid/手机号）。
- 不做图形验证码以外的滑块/点选等复杂人机校验（需要时提示接三方）。
- 不复制 backend-convention-skill 已有的 JWT 工具、过滤器骨架、响应信封与错误码表，本模块只在其上补用户业务。
- 不替用户提交；不锁定版本号。
