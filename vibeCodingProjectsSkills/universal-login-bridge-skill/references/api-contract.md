# API Contract - Universal Login（多系统账户互通）

> 本文是 `universal-login-api` 的接口契约，与 `springboot-auth-module-skill/api-contract-auth.md` **共用同一套约定**：
> 信封 `{ code, message, data }`（成功 `code === 0`）、字段 **camelCase**、分页 `{ list, total, page, pageSize }`、
> 错误码 `-1001 ~ -2000`、入参出参一律 DTO、删除一律软删除。

---

## 0. 定位与边界

| 项 | 值 |
|----|----|
| 宿主账户 | `{prefix}_sys_user`（auth 模块）。本模块**不建账户表** |
| 本模块新增表 | `{prefix}_sys_app` / `{prefix}_sys_app_key` / `{prefix}_sys_app_binding` / `{prefix}_sys_bind_code` |
| 鉴权方式 | 宿主接口 = 宿主 JWT；开放接口 = 应用级 `HmacSHA256` 签名 |

---

## 1. 错误码

| 码 | HTTP | 说明 |
|----|------|------|
| `0` | 200 | 成功 |
| `-1001` | 400 | 参数校验失败 / 绑定码方向不匹配 |
| `-1002` | 401 | 未登录 / 签名无效 / 时间戳偏差超限 |
| `-1003` | 403 | 无权操作该应用或绑定 / 应用已被禁用 / 宿主账户被禁用 |
| `-1004` | 404 | 应用、密钥、绑定、绑定码不存在 |
| `-1005` | 409 | 该应用已绑定 / 绑定码已被使用或已过期 / 密钥不属于该应用 |
| `-2000` | 500 | 系统异常 |

> 禁止出现 `-1`、`500`、`400` 这类非契约值。

---

## 2. 应用管理

### 2.1 应用列表

```
GET /api/apps?page=1&pageSize=10
```

**认证**：需登录 ｜ **权限**：`system:app:list`
**范围**：只返回 `owner_id = 当前用户` 的应用。

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [
      {
        "id": 1,
        "appName": "鉴权中心",
        "appKey": "app_9f2c1a7b3d5e",
        "description": "统一鉴权中心服务",
        "logo": null,
        "callbackUrl": "https://app-b.example.com/callback",
        "status": 1,
        "createdAt": "2026-09-28 10:00:00"
      }
    ],
    "total": 1,
    "page": 1,
    "pageSize": 10
  }
}
```

> ⚠️ `AppVO` **不含任何 secret 字段**。应用级密钥见 §3。

### 2.2 应用详情

```
GET /api/apps/{id}
```

**认证**：需登录 ｜ **权限**：`system:app:list` ｜ 非本人应用 → `-1003`

### 2.3 创建应用

```
POST /api/apps
```

**认证**：需登录 ｜ **权限**：`system:app:create`

```json
{
  "appName": "写作平台",
  "description": "第三方写作系统",
  "logo": null,
  "callbackUrl": "https://writer.example.com/callback"
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| appName | string | 是 | 最长 100 |
| description | string | 否 | 最长 500 |
| logo | string | 否 | 最长 500 |
| callbackUrl | string | 否 | 最长 500 |

**响应**：返回 `AppVO`（**不是** `{ id }`）。

> ★ 请求体**不接受** `appKey` / `ownerId` / `status` —— `appKey` 服务端生成，`ownerId` 取当前登录用户。

### 2.4 更新应用

```
PUT /api/apps/{id}
```

**认证**：需登录 ｜ **权限**：`system:app:edit`

```json
{ "appName": "写作平台（改）", "status": 0 }
```

> `appKey` **不可改**（它是应用对外标识，改了会破坏所有已发出的签名配置）。

### 2.5 删除应用

```
DELETE /api/apps/{id}
```

**认证**：需登录 ｜ **权限**：`system:app:delete`

**副作用**：级联软删该应用的**全部密钥**与**全部绑定**。

---

## 3. 应用密钥管理

### 3.1 密钥列表

```
GET /api/apps/{id}/keys
```

**认证**：需登录 ｜ **权限**：`system:app:key-manage`

```json
{
  "code": 0,
  "message": "success",
  "data": [
    {
      "id": 1,
      "keyName": "默认密钥",
      "apiKey": "ak_3b7e9d1c4a2f8e5061b3d7a9c2e4f608",
      "status": 1,
      "lastUsedAt": "2026-09-28 12:30:00",
      "createdAt": "2026-09-28 10:05:00"
    }
  ]
}
```

> ⚠️ `AppKeyVO` **没有** `apiSecret` 字段。若前端类型里写了 `apiSecret`，那是"谎言类型"，必须删掉。

### 3.2 创建密钥（★ 唯一返回 secret 的接口）

```
POST /api/apps/{id}/keys
```

**认证**：需登录 ｜ **权限**：`system:app:key-manage`

```json
{ "keyName": "生产环境密钥" }
```

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": 2,
    "keyName": "生产环境密钥",
    "apiKey": "ak_5d1f8b2e6c3a9047e1f2a3b4c5d6e7f8",
    "apiSecret": "sk_7a2c9e4b8f1d6035a7c2e9b4f1d8a3c6e0b7d2f9a4c1e8b5d3f6a0c7e2b9d4f1",
    "status": 1,
    "createdAt": "2026-09-28 10:05:00"
  }
}
```

> ★ **`apiSecret` 只有这一次能拿到。** 前端必须弹窗提示"请立即保存，关闭后不再显示"。
> 服务端不得在落库后把实体 secret 置 null 再返回（历史缺陷）。

### 3.3 删除密钥

```
DELETE /api/apps/{id}/keys/{keyId}
```

**认证**：需登录 ｜ **权限**：`system:app:key-manage`
**校验**：`key.appId` 必须等于路径 `{id}`，否则 `-1003`。

---

## 4. 账户绑定（宿主侧）

### 4.1 我的绑定列表

```
GET /api/bind/list
```

**认证**：需登录 ｜ **权限**：`account:bind:list`
**主体**：**当前登录用户**（`@CurrentUser`），不接受 `userId` 入参。

```json
{
  "code": 0,
  "message": "success",
  "data": [
    {
      "id": 10,
      "appId": 1,
      "appKey": "app_9f2c1a7b3d5e",
      "appName": "鉴权中心",
      "logo": null,
      "appUserId": "u-1001",
      "appUserName": "张三",
      "bindType": "app_initiated",
      "isDefault": true,
      "bindAt": "2026-09-28 11:00:00"
    }
  ]
}
```

### 4.2 生成绑定码（宿主发起 → 应用认领）

```
POST /api/bind/code
```

**认证**：需登录 ｜ **权限**：`account:bind:create`

```json
{ "appId": 1 }
```

```json
{
  "code": 0,
  "message": "success",
  "data": { "code": "6f1a9c3e7b2d4058", "direction": "user_initiated", "expireSeconds": 300 }
}
```

**约束**：已绑定该应用时返回 `-1005`。

### 4.3 确认绑定（应用发起 → 宿主确认）

```
POST /api/bind/confirm
```

**认证**：需登录 ｜ **权限**：`account:bind:create`

```json
{ "code": "6f1a9c3e7b2d4058" }
```

**响应**：返回 `BindVO`。

> ★ 请求体**只有 `code` 一个字段**。身份取自登录态，**不收也不校验主账户密码**。
> 历史契约里的 `mainUsername` / `mainPassword` / `phone` / `bindType` / `appKey` 全部删除
> —— 那些字段既被前端漏传导致必然失败，又被后端忽略导致越权。

**错误**：码不存在 `-1004`；方向不是 `app_initiated` `-1001`；已用/过期 `-1005`；已绑定该应用 `-1005`。

### 4.4 解绑

```
DELETE /api/bind/{id}
```

**认证**：需登录 ｜ **权限**：`account:bind:delete`
**校验**：`binding.sysUserId` 必须等于当前用户，否则 `-1004`（按"资源不存在"处理，不泄露他人绑定存在性）。

### 4.5 设为默认应用

```
PUT /api/bind/{id}/default
```

**认证**：需登录 ｜ **权限**：`account:bind:set-default`
**语义**：先把当前用户所有绑定 `isDefault = 0`，再置本条为 `1`。

---

## 5. 开放接口（应用级签名）

### 5.1 鉴权方式

| 请求头 | 必填 | 说明 |
|--------|------|------|
| `X-App-Key` | 是 | 密钥的 `apiKey` |
| `X-Timestamp` | 是 | epoch 秒；偏差 > 300 秒 拒绝 |
| `X-Nonce` | 是 | 随机串（建议 8 字节 hex） |
| `X-Signature` | 是 | 见下方签名串 |

```
签名串 = {apiKey}\n{timestamp}\n{nonce}\n{HTTP_METHOD}\n{requestPath}
签名   = hex( HmacSHA256(apiSecret, 签名串) )     // 小写 hex
```

- `HTTP_METHOD` 全大写：`GET` / `POST`。
- `requestPath` **不含 query string**：例如 `/api/open/userinfo`。
- 失败统一 `HTTP 401` + `{"code":-1002,...}`。

> ★ 应用 ID / appKey **只从签名反查**，请求体里传了也不认 —— 杜绝"替别的应用申请绑定码"。

### 5.2 应用为其用户申请绑定码

```
POST /api/open/bind/apply
```

```json
{ "appUserId": "u-1001", "appUserName": "张三" }
```

```json
{
  "code": 0,
  "message": "success",
  "data": { "code": "3c8e1f7a2b9d4065", "direction": "app_initiated", "expireSeconds": 300 }
}
```

### 5.3 应用认领绑定码（扫码）

```
POST /api/open/bind/claim
```

```json
{ "code": "6f1a9c3e7b2d4058", "appUserId": "u-1001", "appUserName": "张三" }
```

**响应**：返回 `BindVO`。

**错误**：码方向不是 `user_initiated` → `-1001`；码不属于当前应用 → `-1003`；已用/过期 `-1005`。

### 5.4 换取宿主用户信息

```
GET /api/open/userinfo?appUserId=u-1001
```

**未绑定**（`bound=false`，不泄露任何宿主字段）：

```json
{ "code": 0, "message": "success",
  "data": { "bound": false, "bindingId": null, "userId": null, "username": null,
            "nickname": null, "avatar": null, "email": null, "phone": null,
            "appUserId": "u-9999" } }
```

**已绑定**：

```json
{ "code": 0, "message": "success",
  "data": { "bound": true, "bindingId": 10, "userId": 1, "username": "admin",
            "nickname": "超级管理员", "avatar": null, "email": "admin@example.com",
            "phone": "13800000001", "appUserId": "u-1001" } }
```

---

## 6. 绑定状态机

```
{prefix}_sys_bind_code.status

  0 待使用 ──consume（受影响行数=1）──> 1 已使用
     │
     └──expire_at 过后 / 定时任务 expireOutdated ──> 2 已失效
```

**一次性保证**：消费走条件更新

```
UPDATE {prefix}_sys_bind_code SET status = 1, used_at = ?, sys_user_id = ?
WHERE code = ? AND status = 0
```

受影响行数为 `0` → 抛 `-1005`。并发下天然互斥，无需分布式锁。

---

## 7. 表结构摘要

```
{prefix}_sys_app          id, app_name, app_key(uq), description, logo, callback_url,
                          status, owner_id, created_at, updated_at, deleted_at
{prefix}_sys_app_key      id, app_id, key_name, api_key(uq), api_secret,
                          status, last_used_at, created_at, deleted_at
{prefix}_sys_app_binding  id, sys_user_id, app_id, app_user_id, app_user_name,
                          bind_type, is_default, bind_at, created_at, deleted_at
                          uq(sys_user_id, app_id)
{prefix}_sys_bind_code    id, code(uq), direction, app_id, sys_user_id, app_user_id,
                          app_user_name, status, expire_at, used_at, created_at
```

**首次部署**：迁移脚本**不含任何账号种子**。管理员账号由 auth 模块 bootstrap 生成随机密码并打印一次；
首个应用在「应用管理」页面创建。

---

## 8. 变更记录

| 日期 | 变更 |
|------|------|
| 2026-09-20 | 初版：独立 `sys_main_account` + 自带 `sys_role`/`sys_permission`；`/auth/bind/*` 路径；`confirm` 收 `mainUsername/mainPassword`；绑定码不落库 |
| **2026-09-28** | **定位改为「复用宿主 `{prefix}_sys_user`」，删除 `sys_main_account`/`sys_role`/`sys_permission`；表前缀统一 `{prefix}_sys_*`；接口路径统一 `/api`；`confirm` 只收 `code`（取消密码）；绑定码落库 + 5 分钟 + 一次性；新增 `/api/open/**` 签名鉴权与应用认领流程；`App` 移除 `secret`、密钥收敛到 `AppKey`；`api_secret` 只在创建响应返回；取消种子账号与公共 BCrypt 哈希** |
