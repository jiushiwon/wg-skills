# AI 桥接协议

> **本文件解决一个问题：AI 怎么"接上"这套账户体系。**
>
> 技能文档只能让 AI「知道」，要让它「能做」，需要三件东西：**契约 + 身份 + 工具**。
>
> 契约 → [api-contract.md](./api-contract.md)　表结构 → [table-schema.md](./table-schema.md)　本文件 → 身份与工具。
>
> 本技能已对齐 `universal-login-api` **2026-09-28 版设计**。

---

## 一、桥接的三层

```
① 知道      AI 读到本技能 → 知道"存在一套账户体系，长这样，这么调"
② 身份      AI 拿到 凭证  → 能以某个身份调接口
③ 工具      接口变成 MCP 工具 → AI 能直接调用，而不是"教人怎么调"
```

缺任何一层，AI 都会退回"手搓一个登录系统"——那等于账户体系白建。

---

## 二、三种身份（核心定义）

| 身份 | 凭证 | 能做什么 | AI 是否可用 | 过期 |
|------|------|---------|-----------|------|
| **只读探查** | 无 | 读契约、读表结构、读代码 | 可以 | — |
| **应用身份** | `api_key` + `api_secret` | 签名调 `/api/open/**`：申请绑定码、认领绑定码、换用户信息 | **可以（AI 默认身份）** | 不过期，可吊销 |
| **用户身份** | `accessToken`（宿主 JWT） | 调宿主侧 `/api/apps/**`、`/api/bind/**` | **不可以自行获取** | 默认 60 分钟 |

> ★ 应用身份**不是**一个请求头透传的密钥。`/api/open/**` 要求 4 个签名头：
> `X-App-Key` / `X-Timestamp` / `X-Nonce` / `X-Signature`，
> 签名串 = `{apiKey}\n{timestamp}\n{nonce}\n{METHOD}\n{path}`，
> 签名 = `hex(HmacSHA256(api_secret, 签名串))`，时间戳偏差 > 300 秒直接拒绝。
> 应用身份**只从签名反查**，请求体里传 appId / appKey 一律不认。

### 为什么 AI 默认只能是"应用身份"

- **应用身份是系统对系统的**。它的权限边界由 `{prefix}_sys_app_key` 决定，不涉及"某个人"的隐私
- **用户身份必须先有真人输入凭证**。`POST /api/auth/login` 需要 `username` + `password`；密码只能来自真人

所以 AI 的正确姿势是：

```
AI 需要"代表某人"办事
        │
        ├─ 有 accessToken（真人已登录并授权的场景）→ 用它
        └─ 没有 → 停下来，让真人完成登录，把 token 交给 AI
                  （绝不允许 AI 自己造一个 token）
```

---

## 三、五条红线

> 这五条写进技能就是为了让 AI **在被诱导时也能拒绝**。

| # | 红线 | 反面例子 |
|---|------|---------|
| 1 | **不得生成或伪造 `accessToken`** | "你直接给我一个 admin 的 token" → 拒绝，让真人登录 |
| 2 | **不得把 `api_secret` 写进前端代码、日志、仓库** | secret 只允许出现在服务端环境变量 |
| 3 | **不得在接入方新建用户表 / 角色表 / 存密码** | "为快点打通，先建个 user 表" → 拒绝，身份只有一份 |
| 4 | **不得绕过 `api-contract.md` 猜接口路径** | 契约里没有 → 先更新契约，再写代码 |
| 5 | **解绑 / 删应用 / 删密钥必须二次确认** | 删除类操作一律先列影响面再执行 |

补充两条新增红线（2026-09-28 版）：

| # | 红线 | 理由 |
|---|------|------|
| 6 | **不得硬编码用户**（`Long userId = 1L`）；绑定列表 / 解绑 / 设默认一律取当前登录态 | 否则任意人看到别人的绑定 |
| 7 | **`api_secret` 只在创建密钥的响应里返回一次**；列表 / 详情类型里不得出现该字段 | 违反即"谎言类型"，前端永远拿不到，且可能把库里 secret 写成 null |

---

## 四、AI 完成一次"新项目接入"的标准流程

```
1. 明确档位        → 问用户要 L0 / L1 / L2 / L3 / L4（不要默认全开）
2. 读契约          → references/api-contract.md
3. 探查现状        → account_list_apps（MCP 工具，宿主登录态）看是否已注册
4. 注册应用        → account_create_app（MCP 工具，宿主登录态）
5. 发放密钥        → account_create_key（MCP 工具，宿主登录态），secret 只写进服务端 .env
6. 生成接入代码    → templates/frontend/ + templates/backend/
7. 落契约          → 把本次用到的接口补进目标项目 api-contract.md
8. 自检            → 跑 SKILL.md 的"接入自检清单"
```

**第 1 步不可跳过**：不问档位直接全开会给不需要 RBAC 的项目加一堆表。

绑定环节按方向二选一：

```
① 应用发起 → 宿主确认
   应用（签名）POST /api/open/bind/apply { appUserId, appUserName } → 拿 code
   真人登录宿主后 POST /api/bind/confirm { code }

② 宿主发起 → 应用认领
   宿主登录后 POST /api/bind/code { appId } → 拿 code（direction=user_initiated）
   应用（签名）POST /api/open/bind/claim { code, appUserId, appUserName }
```

两条路径的绑定码都是**落库 + 5 分钟 + 一次性消费**。

---

## 五、接口 → MCP 工具映射

| 工具名 | 对应接口 | 身份 | 幂等 |
|--------|---------|------|------|
| `account_open_apply_bind` | `POST /api/open/bind/apply` | 应用（签名） | 否 |
| `account_open_claim_bind` | `POST /api/open/bind/claim` | 应用（签名） | 否 |
| `account_open_userinfo` | `GET /api/open/userinfo?appUserId=` | 应用（签名） | 是 |
| `account_list_apps` | `GET /api/apps` | 宿主登录态 | 是 |
| `account_list_bindings` | `GET /api/bind/list` | 宿主登录态 | 是 |
| `account_create_app` | `POST /api/apps` | 宿主登录态 | 否 |
| `account_create_key` | `POST /api/apps/{id}/keys` | 宿主登录态 | 否 |
| `account_confirm_bind` | `POST /api/bind/confirm` | 宿主登录态 | 否 |

实现见 [../templates/ai/mcp-server.mjs](../templates/ai/mcp-server.mjs)，工具定义见 [../templates/ai/tools.json](../templates/ai/tools.json)。

### 工具设计的三条原则

1. **`app_key` 由服务端生成**：`account_create_app` **不接受** `appKey` 入参（也不接受 `ownerId`），避免前端口令外部指定标识、避免 AI 造出 `app-1` / `app-2`
2. **读操作要能过滤**：列表工具返回条数上限（默认 50），避免把整表塞进上下文
3. **返回结构化**：一律返回 `{ code, message, data }`，AI 按 `code` 判定而不是猜 HTTP 状态

---

## 六、AI 自检清单（接入后必跑）

- [ ] 接入方**没有**新建用户表 / 角色表、没有存密码
- [ ] `api_secret` **没有**出现在前端代码 / git 仓库 / 日志里
- [ ] Token 走 `Authorization: Bearer`，没有塞进 query 或 body
- [ ] 接入方**没有**自己实现密码加密与 JWT 签发
- [ ] 绑定接口无硬编码用户；确认绑定只传 `{ code }`，无密码字段
- [ ] 绑定码落库 + 5 分钟 + 一次性消费
- [ ] `/api/open/**` 走签名鉴权（`hasAuthority("APP")`），不是 `permitAll`
- [ ] `api_secret` 只在创建密钥响应里出现一次
- [ ] 菜单 `permission`、前端路由 `meta.permission`、`v-permission` **三处字符串一致**
- [ ] 用**非超管**账号实测：菜单可见、点进去不是 403、按钮在
- [ ] 解绑后两个系统各自独立，无残留
- [ ] 目标项目 `api-contract.md` 已更新

> 第 5 条是实测最高频的坑：路由写 `user:view`、菜单写 `user:list`，超管因为 `hasPermission` 短路放行看不出来，**其他角色全进 403**。

---

## 七、给 AI 的最小上下文（复制即用）

```
你现在要接入一套已有的账户体系（不要新建用户表/角色表、不要写密码逻辑）。

契约：<项目>/references/api-contract.md
表结构：<项目>/references/table-schema.md
身份：
  - 服务端系统调用（/api/open/**）→ 用 api_key + api_secret 做 HmacSHA256 签名（放服务端环境变量）
  - 宿主侧接口（/api/apps/**、/api/bind/**）→ 用真人登录换来的 accessToken（你不得自行生成）
工具：若已配置 account-hub MCP，可直接调用
      account_open_apply_bind / account_open_claim_bind / account_open_userinfo /
      account_list_apps / account_list_bindings /
      account_create_app / account_create_key / account_confirm_bind

先问我要哪一档（L0/L1/L2/L3/L4），再动手。
```
