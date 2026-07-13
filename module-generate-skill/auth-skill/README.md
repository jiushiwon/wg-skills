# auth-skill

**用户系统（User System）生成器**：以标准用户表为根，长出「注册 + 登录鉴权 + 资料管理」完整闭环。在已有后端项目（或经 backend-generate-skill 生成的骨架）上长出完整用户体系，也能**独立使用**（自带技术栈 + 数据库选型，现场生成最小骨架与完整 `api-contract.md`）。只要项目需要用户体系，就能用本技能。权限系统不实现，只留扩展尾巴（交下游 org-permission-skill）。

## 功能

- **多种登录形态**：账号密码、手机号短信验证码（短信登录必做，默认阿里云）、uniapp 微信小程序（code→openid，可选解析手机号）、第三方 oauth（APP/H5 客户端模式）。
- **JWT access + refresh 双令牌**：refresh 哈希存储 + 轮换 + 重放检测 + 登出拉黑。
- **资料管理闭环**：个人资料读写、凭旧密码改密（吊销其他设备）、换绑手机号（短信验证 + 唯一防重）、注销账号（二次确认 + 吊销全部 token）。
- **用户 ID 策略**：默认自增 BIGINT（MongoDB 用默认 ObjectId），可选 UUIDv7/雪花/双 ID 防枚举。
- **图形验证码**（可选）：简单算术题（加减乘除）SVG，作用于密码登录 + 发短信，防爆破防轰炸。
- **密码找回/重置**（默认开启）：短信验证码重置，重置后吊销全部令牌强制重登。
- **标准用户表**：用户名 / 手机号 / 密码 / openid 按需裁剪，唯一约束天然防重。
- **安全红线内置**：bcrypt、CSPRNG 验证码、失败锁定防枚举、密钥走环境变量。

## 使用方式

```
帮我加一个用户系统（登录 + 注册 + 资料管理）
现有 FastAPI 项目里加手机号验证码登录，要双令牌
做一个 auth 模块，账号密码 + 短信登录，开图形验证码和密码找回
帮我做个 uniapp 微信小程序登录，要能解析手机号
加个人资料页：改昵称头像、修改密码、换绑手机号、注销账号
```

两种模式：
- **组合模式**：项目已有骨架 → 自动检测技术栈，接口契约**追加**进项目 `api-contract.md`。
- **独立模式**：还没有骨架 → 先做技术栈 + 数据库选型（规则同 backend-generate-skill），生成最小可运行骨架 + 全新 `api-contract.md`。

技能会先确认登录形态、用户 ID 策略、短信供应商、图形验证码、密码找回、第三方登录、令牌模式、资料管理等关键决策（都有默认值，未明确一律按默认并告知），然后产出表结构、接口契约增量和目标语言实现。

## 产出物

| 产出 | 内容 |
|------|------|
| 表结构 | `wg_user`（含 openid）、`wg_refresh_token`、（可选）`wg_oauth_account`，含索引与状态机 |
| 接口契约 | captcha / register / login / sms-code / sms-login / forgot-password / reset-password / wx-login / refresh / logout / me / oauth + 资料管理 profile/change-password/bind-phone/deactivate（按问答裁剪），格式同 backend-generate-skill，便于前端对接 |
| 实现 | 按技术栈展开 Java/Go/Python/Node 实现要点（含图形验证码、阿里云短信、密码找回、uniapp 微信登录） |
| 环境变量 | `.env.example` 追加阿里云短信、微信小程序、图形验证码开关等变量 |

## 目录说明

```
auth-skill/
├── SKILL.md                  # 触发词、两种使用模式、选型、生成流程、问答清单、模块红线
├── README.md                 # 本文件
└── references/
    ├── domain-model.md       # 领域模型、表结构 DDL、状态机、Redis 键、环境变量、核心时序
    ├── api-contract.md       # 接口契约增量（完整接口文档，追加进项目 api-contract.md）
    ├── java.md               # Spring Boot 实现要点
    ├── go.md                 # Gin 实现要点
    ├── python.md             # FastAPI 实现要点
    └── nodejs.md             # Express/NestJS 实现要点
```

## 模块红线（摘要）

密码必须 bcrypt；短信验证码 CSPRNG + 5 分钟过期 + 一次性 + 60s 限流 + 每日上限 + 按场景分键；图形验证码算术题一次性 + 登录/发短信前校验；refresh token 只存哈希且轮换 + 重放全量吊销；密码重置后吊销全部令牌；改密吊销其他设备、注销吊销全部；JWT payload 只放 sub/jti/exp；登录失败统一文案防枚举 + 成功重置计数；微信 session_key 不下发不落库；密钥走环境变量；**权限系统不实现只留尾巴**（交 org-permission-skill）。完整红线见 SKILL.md。

## 依赖

- 规范：backend-convention-skill（响应信封、错误码、JWT、契约模板，引用不复制）。
- DB 选型：database-skill（引用不复制）。
- 短信通道：默认内置最小阿里云 Sender；检测到已接入 notification-skill 时**委托**给它，不重复实现。
- 下游：org-permission-skill、ai-chat-skill 依赖本模块的用户表与当前用户注入。
