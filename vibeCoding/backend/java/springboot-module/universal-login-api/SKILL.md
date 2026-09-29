---
name: universal-login-api
description: 多系统账户互通后端模块。为已有 Spring Boot 项目叠加「应用注册 + 应用级密钥 + 账户绑定」能力，让多个业务系统公用同一套宿主账户。**不定义账户、不定义角色**。触发词："第三方授权后端","账户互通后端","多系统鉴权","应用注册","API 密钥管理","统一鉴权后端","账户绑定后端","应用管理后端","第三方账户绑定","union login","多系统账户绑定"。
trigger: |
  第三方授权后端 | 账户互通后端 | 多系统鉴权 | 应用注册 | API 密钥管理
  统一鉴权后端 | 账户绑定后端 | 应用管理后端 | 第三方账户绑定
  多系统账户绑定 | 第三方应用接入 | 应用密钥轮换
---

# universal-login-api

> 多系统账户互通模块：**宿主账户 ↔ 第三方应用身份**的绑定，以及第三方应用的注册与密钥管理。

> ## ⚠️ 唯一权威声明
>
> **"第三方应用接入 / 应用密钥 / 账户绑定"三类需求，本技能是唯一权威。**
>
> 本模块**不定义账户表、不定义角色表、不定义 RBAC**：
> - 账户 = 宿主 `wg_sys_user`（由 `springboot-auth-module-skill` 提供）
> - 角色 / 菜单 / 权限 = 宿主 `wg_sys_role` / `_sys_menu` / `_sys_user_role` / `_sys_role_menu`
>
> 历史版本自带 `sys_main_account` + `sys_role` + `sys_permission` 三张表，形成**第二套账户与第二套 RBAC**，
> 且 `sys_app_binding.main_account_id` 指向 `sys_main_account`，与宿主 `wg_sys_user` 无任何映射
> —— 于是"绑定成功"也只是在绑定表里凭空加一行，登录态依然只认宿主账户。**该设计已作废。**

## 定位

一句话：**让第三方系统直接复用宿主账户体系，不再各建一套用户表。**

- 目标：在已有 `springboot-init-skill` + `springboot-auth-module-skill` 的骨架上，**叠加**应用接入与账户绑定模块。
- 输出：实体、仓储、服务、控制器、DTO、Flyway 迁移、应用签名鉴权、接口契约、Security 接入指南。
- **不做**：不生成登录/注册/找回密码/验证码/JWT（宿主已有）；不生成角色与菜单（宿主已有）；不生成统一响应信封（宿主已有）。

## 依赖（前置，缺一不可）

| 技能 | 提供什么 | 本模块怎么用 |
|------|----------|--------------|
| `springboot-init-skill` | `ApiResponse` / `BusinessException` / `GlobalExceptionHandler` / `PageRequest` / `PageResponse` / `JwtAuthenticationFilter` / `CurrentUser` + `CurrentUserArgumentResolver` / `SecurityConfig` | 直接复用，**不重复生成** |
| `springboot-auth-module-skill` | `wg_sys_user` + `wg_sys_role/_menu/_user_role/_role_menu` + `@EnableMethodSecurity` + `AuthorityLoader` | 绑定锚点用 `sys_user.id`；权限码沿用其全量表 |

> 本模块代码中 import 的宿主类：`{{basePackage}}.common.ApiResponse`、`{{basePackage}}.common.CurrentUser`、
> `{{basePackage}}.common.PageResponse`、`{{basePackage}}.common.BusinessException`、
> `{{basePackage}}.auth.entity.SysUser`、`{{basePackage}}.auth.repository.SysUserRepository`。
> 若宿主把账户实体放在别的包，**只需改 import**。

## 用户问题（最多 3 个）

```
1. Spring 包名是什么？（默认 {{basePackage}} = com.example.demo）
2. 表前缀是什么？（默认 wg）
3. 是否启用「应用级开放接口」/api/open/**（server-to-server 签名调用）？（默认启用）
```

## 核心概念

| 概念 | 落地 | 说明 |
|------|------|------|
| **宿主账户** | `wg_sys_user` | 唯一身份来源。本模块**只是引用**它，不新增账户表 |
| **应用（App）** | `wg_sys_app` | 接入的业务系统。只有**公开标识** `app_key`，**无密钥字段** |
| **应用密钥（AppKey）** | `wg_sys_app_key` | 应用级凭证的唯一存放处：`api_key` + `api_secret`，可多组、可轮换 |
| **绑定（Binding）** | `wg_sys_app_binding` | `sys_user_id` ↔ `app_id`（+ 应用侧 `app_user_id`） |
| **绑定码（BindCode）** | `wg_sys_bind_code` | 一次性、5 分钟有效的绑定凭证，**落库** |

> **职责收敛**：`App` 管「应用是什么」，`AppKey` 管「怎么证明自己是这个应用」。
> 历史版本两处都存 `appKey + appSecret`，导致密钥可以绕过轮换长期存活 —— 已删除 `App.appSecret`。

## 能力清单（8 项）

| # | 能力 | 说明 |
|---|------|------|
| 1 | **应用注册** | 创建/编辑/删除应用，`app_key` 服务端生成，`owner_id` 服务端注入 |
| 2 | **应用密钥管理** | 多密钥、可轮换、可禁用；`api_secret` **只在创建时返回一次** |
| 3 | **应用发起绑定** | 第三方应用调 `/api/open/bind/apply` 取码 → 宿主用户确认 |
| 4 | **宿主发起绑定** | 宿主用户生成码 → 第三方应用调 `/api/open/bind/claim` 认领 |
| 5 | **绑定列表 / 解绑 / 设默认** | 全部以当前登录用户为范围，越权返回 `-1003` |
| 6 | **应用级签名鉴权** | `HmacSHA256` + 时间戳 + nonce，保护 `/api/open/**` |
| 7 | **用户信息换取** | 第三方应用按 `appUserId` 换宿主用户信息，未绑定不泄露 |
| 8 | **接口契约** | 产出 `api-contract-universal-login.md` |

## 表设计（4 张，统一 `wg_` 前缀）

```sql
wg_sys_app          id, app_name, app_key, description, logo, callback_url,
                          status, owner_id, created_at, updated_at, deleted_at
                          ★ 无 app_secret

wg_sys_app_key      id, app_id, key_name, api_key, api_secret,
                          status, last_used_at, created_at, deleted_at
                          ★ api_secret 仅创建时返回一次

wg_sys_app_binding  id, sys_user_id, app_id, app_user_id, app_user_name,
                          bind_type, is_default, bind_at, created_at, deleted_at
                          UNIQUE (sys_user_id, app_id)   ★ 锚点是 sys_user_id

wg_sys_bind_code    id, code, direction, app_id, sys_user_id, app_user_id,
                          app_user_name, status, expire_at, used_at, created_at
                          ★ 一次性；direction = app_initiated / user_initiated
```

**不建的表**：`sys_main_account`、`sys_role`、`sys_permission`、`sys_captcha`
（账户/角色/权限/验证码都归宿主技能，重复建表 = 双权威）。

## 接口清单

统一 `/api` 前缀，与 `springboot-auth-module-skill`、`springboot-init-skill` 一致。

### A. 应用管理（宿主登录 + 权限码）

| 接口 | 方法 | 权限码 |
|------|------|--------|
| `/api/apps` | GET | `system:app:list` |
| `/api/apps/{id}` | GET | `system:app:list` |
| `/api/apps` | POST | `system:app:create` |
| `/api/apps/{id}` | PUT | `system:app:edit` |
| `/api/apps/{id}` | DELETE | `system:app:delete` |
| `/api/apps/{id}/keys` | GET | `system:app:key-manage` |
| `/api/apps/{id}/keys` | POST | `system:app:key-manage` |
| `/api/apps/{id}/keys/{keyId}` | DELETE | `system:app:key-manage` |

### B. 账户绑定（宿主登录 + 权限码）

| 接口 | 方法 | 权限码 | 说明 |
|------|------|--------|------|
| `/api/bind/list` | GET | `account:bind:list` | 我的绑定列表 |
| `/api/bind/code` | POST | `account:bind:create` | 宿主发起：生成绑定码 |
| `/api/bind/confirm` | POST | `account:bind:create` | 宿主确认：用码完成绑定 |
| `/api/bind/{id}` | DELETE | `account:bind:delete` | 解绑（仅自己） |
| `/api/bind/{id}/default` | PUT | `account:bind:set-default` | 设默认应用 |

### C. 开放接口（应用级签名，`hasAuthority("APP")`）

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/open/bind/apply` | POST | 应用为其用户申请绑定码 |
| `/api/open/bind/claim` | POST | 应用认领宿主生成的绑定码 |
| `/api/open/userinfo?appUserId=` | GET | 换取宿主用户信息 |

## 绑定流程

### 流程一：应用发起 → 宿主确认

```
1. 用户在第三方应用 B 点击「绑定到我的宿主账号」
2. 应用 B 后端（AppKey 签名）POST /api/open/bind/apply { appUserId, appUserName }
   → 返回 { code, direction: "app_initiated", expireSeconds: 300 }
3. 用户被引导到宿主系统，若未登录先登录
4. 宿主前端 POST /api/bind/confirm { code }     ← 身份来自 JWT，不收密码
5. 落库 wg_sys_app_binding(sys_user_id = 当前用户, app_id, app_user_id)
6. 应用 B 之后可用 GET /api/open/userinfo?appUserId=xxx 换宿主用户信息
```

### 流程二：宿主发起 → 应用认领（扫码）

```
1. 宿主用户在「我的绑定」选择应用 → POST /api/bind/code { appId }
   → 返回 { code, direction: "user_initiated" }（sys_user_id 此刻已写入）
2. 用户把 code（或二维码）交给第三方应用 B
3. 应用 B 后端（AppKey 签名）POST /api/open/bind/claim { code, appUserId, appUserName }
4. 绑定完成，code 立即失效
```

**两条流程的共同硬约束**：绑定码落库、5 分钟有效、**一次性消费**（并发下用
`UPDATE ... WHERE status = 0` 的受影响行数判定，返回 0 即报 `-1005`）。

## 权限码（沿用 `springboot-auth-module-skill` 全量表）

```
system:app:list          system:app:create        system:app:edit
system:app:delete        system:app:key-manage
account:bind:list        account:bind:create      account:bind:delete
account:bind:set-default
```

三段式 `模块:资源:动作`；前端路由 `meta.permission`、`v-permission`、后端 `@PreAuthorize`、DB
`wg_sys_menu.permission` 必须**逐字一致**。

## 错误码（沿用宿主负数表）

| 场景 | 码 |
|------|----|
| 参数校验失败 / 绑定码方向不匹配 | `-1001` |
| 未登录 / 签名无效 / 时间戳过期 | `-1002` |
| 无权操作该应用 / 该绑定 / 应用被禁用 | `-1003` |
| 应用不存在 / 密钥不存在 / 绑定不存在 / 绑定码无效 | `-1004` |
| 已绑定同一应用 / 绑定码已被使用 | `-1005` |

## 红线

| # | 红线 | 理由 |
|---|------|------|
| **U1** | **禁止自建账户表与角色表**。账户一律用宿主 `wg_sys_user` | 自建即产生第二套账户，绑定没有落点 |
| **U2** | 表名统一 `wg_sys_*`；**禁止** `sys_` 裸前缀 | 历史上一库三前缀 |
| **U3** | **禁止 `permitAll` 放行 `/api/apps/**`、`/api/bind/**`、`/api/open/**`** | 历史缺陷：未登录可读他人绑定、改他人应用 |
| **U4** | `/api/bind/**` 与 `/api/apps/**` **必须**登录 + `@PreAuthorize`；`/api/open/**` **必须**签名鉴权授予 `APP` | 只写 `authenticated()` 视为未完成 |
| **U5** | **禁止硬编码用户**（`Long userId = 1L`）。一律 `@CurrentUser` | 历史缺陷：任意人看到 admin 的绑定 |
| **U6** | 绑定类操作**必须**校验归属（`binding.sysUserId == 当前用户`） | 防止操作他人绑定 |
| **U7** | `bindCode` **必须**落库 + 有效期 + 一次性消费；**禁止**只返回不保存 | 历史缺陷：绑定码可无限重放 |
| **U8** | `confirm` **禁止**接收/要求主账户密码；身份一律取自登录态 | 历史缺陷：密码字段收了却从不校验 |
| **U9** | `api_secret` **只在创建响应返回一次**（`CreatedAppKeyVO`）；列表/详情出参**禁止**含 secret；**禁止** `setApiSecret(null)` 后返回实体 | 历史缺陷：前端永远拿不到，且脏检查把库里 secret 写成 null |
| **U10** | `App` **禁止**存密钥；密钥只在 `wg_sys_app_key` | 两处并存会导致绕过轮换 |
| **U11** | **禁止实体直接作为入参/出参**，一律 DTO | 防 mass assignment（注入 `appSecret`/`ownerId`/`createTime`） |
| **U12** | **禁止**在迁移脚本中写死账号、明文密码、公共 BCrypt 哈希 | 泄漏且不可轮换 |
| **U13** | 所有删除为软删除（`deleted_at`） | 统一审计口径 |
| **U14** | 密钥/绑定码生成用 `SecureRandom`，**禁止** `UUID.randomUUID()` 截断 | 密钥熵不足 |
| **U15** | 注释、文档用中文 | 目标用户是中文开发者 |

## 交付自检（缺一不可）

| # | 检查 | 判定 |
|---|------|------|
| 1 | 是否存在 `sys_main_account` / `sys_role` / `sys_permission` | 存在 = 违反 U1 |
| 2 | 表名是否全部 `wg_sys_*` | 出现裸 `sys_*` = 违反 U2 |
| 3 | `/api/apps/**`、`/api/bind/**`、`/api/open/**` 是否有 `permitAll` | 命中 = 违反 U3 |
| 4 | 每个受控端点是否有 `@PreAuthorize` | `0` 命中 = 未完成 |
| 5 | `grep -rn "1L" controller/ service/` | 命中 = 违反 U5 |
| 6 | `BindCode` 是否有落库写入 + `consumeByUser/consumeByApp` 受影响行数校验 | 缺 = 违反 U7 |
| 7 | `BindConfirmRequest` 是否只有 `code` 字段 | 含 password 字段 = 违反 U8 |
| 8 | `AppKeyVO` 是否**没有** `apiSecret` 字段 | 有 = 违反 U9 |
| 9 | `App` 实体是否**没有** `appSecret` 字段 | 有 = 违反 U10 |
| 10 | 迁移脚本是否含明文密码 / 固定 BCrypt 哈希 | 含 = 违反 U12 |
| 11 | 三方权限码 diff（DB ⟷ 路由 meta ⟷ `v-permission` ⟷ `@PreAuthorize`） | 必须零差集 |

## 交付物

| 文档 | 位置 | 说明 |
|------|------|------|
| 接口契约 | `api-contract-universal-login.md` | 三组接口 + DTO + 签名算法 + 错误码 |
| Security 接入 | `references/security-integration.md` | `SecurityConfig` 两处必改 + 客户端签名示例 + 自检 |
| 前端契约 | `vue-form-skill/references/form-contract.md` | 表单字段类型与校验 |
| 请求层 | `frontend-request-skill/references/api-contract.md` | 响应信封与分页字段 |

## 后续迭代

- 绑定码清理定时任务（`BindCodeRepository.expireOutdated`）。
- 应用级权限范围（scope）与授权码模式（OAuth2 授权码 + PKCE）。
- 应用回调 webhook（`callback_url` 当前仅存储，未投递）。
- 与 `fastapi-auth-module-skill` 保持 API 字段一致，便于前后端跨语言复用。

---

**【考拉搞AI】，带你全面进入 VibeCoding 的世界~**
