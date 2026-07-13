# auth-skill — 接口契约增量

以下接口**追加**进项目根目录 `api-contract.md`（组合模式）；独立模式则作为完整 `api-contract.md` 的「接口清单」节。格式遵循 backend-convention-skill `references/api-contract-spec.md`：所有接口 HTTP 状态码统一 200，业务结果走 `{ code, message, data }` 信封；鉴权栏为 `Bearer` 的接口需有效 access token。

> 按问答裁剪：未开图形验证码则无 `GET /api/auth/captcha`，且各接口去掉 `captchaId`/`captcha` 入参；未接第三方则无 `oauth/*` 两个接口；未开密码找回则无 `forgot-password`/`reset-password`。错误码含义以 `response-format.md` 闭集为准。

---

## GET /api/auth/captcha

**描述**：获取图形验证码（简单算术题，加减乘除）。仅开启图形验证码时存在。返回 SVG 与 captchaId，答案存 Redis，5 分钟有效、一次性。

**鉴权**：不需要

**请求参数**：无

**响应 data 结构**：

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| captchaId | string | 是 | 验证码标识，提交时回传 |
| svg | string | 是 | SVG 文本，前端直接渲染（如 `v-html`/`<img src="data:image/svg+xml;utf8,...">`） |

**响应示例**：

```json
{ "code": 0, "message": "success", "data": { "captchaId": "b3f1...9a", "svg": "<svg xmlns=\"...\">...12 + 7 = ?...</svg>" } }
```

**可能错误码**：

| 错误码 | 触发条件 | 前端处理建议 |
|--------|----------|--------------|
| -2000 | 生成失败 | 提示重试 |

---

## POST /api/auth/register

**描述**：账号密码注册（开放注册场景）。手机号验证码注册走 `/api/auth/sms-login`（未注册自动建号，可配置关闭）。

> **找回密码依赖手机号**：纯账号密码注册的用户若未绑定手机号，将无法走 `forgot-password`/`reset-password`。建议注册时可选采集并短信验证手机号，或在产品层明确「未绑手机号账号不支持找回密码」。

**鉴权**：不需要

**请求体**（Content-Type: application/json）：

| 字段 | 类型 | 必填 | 校验规则 | 说明 | 示例 |
|------|------|------|----------|------|------|
| username | string | 是 | 4-64 字符，字母数字下划线 | 用户名 | alice |
| password | string | 是 | 8-64 字符，需含字母和数字 | 密码（前端不得明文落盘） | Passw0rd! |
| nickname | string | 否 | ≤ 64 字符 | 昵称，默认空 | Alice |

**请求示例**：

```json
{ "username": "alice", "password": "Passw0rd!", "nickname": "Alice" }
```

**响应 data 结构**：

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | integer | 是 | 用户 ID |
| username | string | 是 | 用户名 |

**响应示例**：

```json
{ "code": 0, "message": "success", "data": { "id": 1, "username": "alice" } }
```

**可能错误码**：

| 错误码 | 触发条件 | 前端处理建议 |
|--------|----------|--------------|
| -1001 | 参数校验失败 | 显示 message 并定位字段 |
| -1005 | 用户名已存在 | 提示更换用户名 |

---

## POST /api/auth/login

**描述**：账号密码登录，签发双令牌。开启图形验证码时必须先过 `/api/auth/captcha`。

**鉴权**：不需要

**请求体**：

| 字段 | 类型 | 必填 | 校验规则 | 说明 | 示例 |
|------|------|------|----------|------|------|
| username | string | 是 | 非空 | 用户名或手机号 | alice |
| password | string | 是 | 非空 | 明文密码，服务端 bcrypt 比对 | Passw0rd! |
| captchaId | string | 开图形码时必填 | — | 图形验证码标识 | b3f1...9a |
| captcha | string | 开图形码时必填 | — | 图形验证码答案 | 19 |

**请求示例**：

```json
{ "username": "alice", "password": "Passw0rd!", "captchaId": "b3f1...9a", "captcha": "19" }
```

**响应 data 结构**：

| 字段 | 类型 | 说明 |
|------|------|------|
| accessToken | string | JWT，默认 2h，前端写入 storage，后续请求自动携带 `Authorization: Bearer` |
| refreshToken | string | 随机串，默认 30d，服务端仅存哈希 |
| expiresIn | integer | access 剩余秒数 |
| user | User | 用户信息，引用数据模型 User |

**响应示例**：

```json
{
  "code": 0, "message": "success",
  "data": {
    "accessToken": "eyJhbGciOi...",
    "refreshToken": "9f2c...8ab",
    "expiresIn": 7200,
    "user": { "id": 1, "username": "alice", "nickname": "Alice", "avatar": "" }
  }
}
```

**可能错误码**：

| 错误码 | 触发条件 | 前端处理建议 |
|--------|----------|--------------|
| -1001 | 参数缺失 / 图形验证码错误 | 显示 message；图形码错误刷新验证码 |
| -1002 | 账号或密码错误 / 用户已禁用 / 账号锁定中 | 统一提示「账号或密码错误」，不区分原因 |
| -1006 | 请求过频 | 提示稍后重试 |

---

## POST /api/auth/sms-code

**描述**：发送短信验证码（登录/注册/找回密码通用）。同一手机号 60s 内禁止重发，每日上限 10 次。开启图形验证码时必须先过 `/api/auth/captcha`（防短信轰炸）。

**鉴权**：不需要

**请求体**：

| 字段 | 类型 | 必填 | 校验规则 | 说明 | 示例 |
|------|------|------|----------|------|------|
| phone | string | 是 | `^1[3-9]\d{9}$` | 手机号 | 13800138000 |
| scene | string | 否 | 枚举 SmsScene | 场景，默认 `login` | login |
| captchaId | string | 开图形码时必填 | — | 图形验证码标识 | b3f1...9a |
| captcha | string | 开图形码时必填 | — | 图形验证码答案 | 19 |

**请求示例**：

```json
{ "phone": "13800138000", "scene": "login", "captchaId": "b3f1...9a", "captcha": "19" }
```

**响应 data 结构**：

| 字段 | 类型 | 说明 |
|------|------|------|
| ttl | integer | 验证码有效秒数，固定 300 |

**响应示例**：

```json
{ "code": 0, "message": "success", "data": { "ttl": 300 } }
```

> 开发环境（`APP_ENV=dev`）可在 data 中附带 `code` 明文方便联调；生产环境绝不返回。

**可能错误码**：

| 错误码 | 触发条件 | 前端处理建议 |
|--------|----------|--------------|
| -1001 | 手机号格式错误 / 图形验证码错误 | 显示 message；图形码错误刷新验证码 |
| -1006 | 发送过频或超每日上限 | 提示稍后重试，前端做 60s 倒计时 |

---

## POST /api/auth/sms-login

**描述**：短信验证码登录。用户不存在时自动注册（可在问答阶段配置为拒绝）。

**鉴权**：不需要

**请求体**：

| 字段 | 类型 | 必填 | 校验规则 | 说明 | 示例 |
|------|------|------|----------|------|------|
| phone | string | 是 | `^1[3-9]\d{9}$` | 手机号 | 13800138000 |
| code | string | 是 | 6 位数字 | 短信验证码 | 482913 |

**请求示例**：

```json
{ "phone": "13800138000", "code": "482913" }
```

**响应 data 结构**：同 `/api/auth/login`。

**可能错误码**：

| 错误码 | 触发条件 | 前端处理建议 |
|--------|----------|--------------|
| -1001 | 参数缺失 | 显示 message |
| -1002 | 验证码错误或已过期 / 用户已禁用 | 提示「验证码错误或已过期」 |
| -1006 | 尝试过频 | 提示稍后重试 |

---

## POST /api/auth/forgot-password

**描述**：密码找回第一步——向手机号发送重置验证码（复用 `sms-code` 限流）。**统一返回成功**，不泄露手机号是否已注册（防枚举）。

**鉴权**：不需要

**请求体**：

| 字段 | 类型 | 必填 | 校验规则 | 说明 | 示例 |
|------|------|------|----------|------|------|
| phone | string | 是 | `^1[3-9]\d{9}$` | 手机号 | 13800138000 |
| captchaId | string | 开图形码时必填 | — | 图形验证码标识 | b3f1...9a |
| captcha | string | 开图形码时必填 | — | 图形验证码答案 | 19 |

**请求示例**：

```json
{ "phone": "13800138000", "captchaId": "b3f1...9a", "captcha": "19" }
```

**响应 data 结构**：

| 字段 | 类型 | 说明 |
|------|------|------|
| ttl | integer | 验证码有效秒数，固定 300 |

**可能错误码**：

| 错误码 | 触发条件 | 前端处理建议 |
|--------|----------|--------------|
| -1001 | 手机号格式错误 / 图形验证码错误 | 显示 message；图形码错误刷新验证码 |
| -1006 | 发送过频或超每日上限 | 提示稍后重试 |

> 无论手机号是否注册，均返回成功（已注册才真发码）；前端一律引导用户查收短信。**限流（60s/每日 10 次）对所有手机号一致执行**——未注册号同样占用限流配额，否则可凭「`-1006` vs 成功」判定手机号是否注册（防枚举预言机）。

---

## POST /api/auth/reset-password

**描述**：密码找回第二步——校验验证码并重置密码。成功后吊销该用户全部 refresh token（强制重新登录）。

**鉴权**：不需要

**请求体**：

| 字段 | 类型 | 必填 | 校验规则 | 说明 | 示例 |
|------|------|------|----------|------|------|
| phone | string | 是 | `^1[3-9]\d{9}$` | 手机号 | 13800138000 |
| code | string | 是 | 6 位数字 | 短信验证码 | 482913 |
| newPassword | string | 是 | 8-64 字符，需含字母和数字 | 新密码 | NewPass1! |

**请求示例**：

```json
{ "phone": "13800138000", "code": "482913", "newPassword": "NewPass1!" }
```

**响应 data 结构**：`null`

**响应示例**：

```json
{ "code": 0, "message": "success", "data": null }
```

**可能错误码**：

| 错误码 | 触发条件 | 前端处理建议 |
|--------|----------|--------------|
| -1001 | 参数校验失败（如新密码强度不足） | 显示 message 并定位字段 |
| -1002 | 验证码错误或已过期 | 提示「验证码错误或已过期」，可重新获取 |

---

## POST /api/auth/wx-login

**描述**：uniapp 微信小程序登录。前端 `uni.login()` 拿 code 后调用，后端用 appid/secret 换 openid 并签发双令牌。仅选 uniapp 登录时存在。按「身份标识」配置分两种模式。

**鉴权**：不需要

**请求体**：

| 字段 | 类型 | 必填 | 校验规则 | 说明 | 示例 |
|------|------|------|----------|------|------|
| code | string | 是 | 非空 | `uni.login()` 返回的临时登录凭证 | 081aBc... |
| phoneCode | string | 解析手机号模式时必填 | 非空 | `getPhoneNumber` 返回的 code，用于解析手机号 | 4f2c... |

**请求示例（仅 openid 模式）**：

```json
{ "code": "081aBc..." }
```

**请求示例（解析手机号模式）**：

```json
{ "code": "081aBc...", "phoneCode": "4f2c..." }
```

**响应 data 结构**：同 `/api/auth/login`（`accessToken` / `refreshToken` / `expiresIn` / `user`）。用户不存在时自动建号。

**可能错误码**：

| 错误码 | 触发条件 | 前端处理建议 |
|--------|----------|--------------|
| -1001 | 参数缺失（解析手机号模式缺 phoneCode） | 提示重新授权手机号 |
| -1002 | code 无效或已过期 / 用户已禁用 | 重新 `uni.login()` 再试 |
| -2000 | 微信服务调用失败 | 提示稍后重试 |

> 解析手机号需企业级小程序权限且前端按钮 `open-type="getPhoneNumber"`；个人小程序只能用仅 openid 模式。openid/手机号均不下发明文 `session_key`。

---

## POST /api/auth/refresh

**描述**：用 refresh token 换新的双令牌（轮换：旧 refresh 立即作废）。

**鉴权**：不需要（凭 refresh token）

**请求体**：

| 字段 | 类型 | 必填 | 校验规则 | 说明 |
|------|------|------|----------|------|
| refreshToken | string | 是 | 非空 | 登录时签发的 refresh token |

**请求示例**：

```json
{ "refreshToken": "9f2c...8ab" }
```

**响应 data 结构**：同 `/api/auth/login` 的令牌字段（`accessToken` / `refreshToken` / `expiresIn`）。

**可能错误码**：

| 错误码 | 触发条件 | 前端处理建议 |
|--------|----------|--------------|
| -1001 | 参数缺失 | 显示 message |
| -1002 | refresh 无效、已作废或已过期 | 跳转登录页重新登录 |

---

## POST /api/auth/logout

**描述**：登出。作废当前 refresh token；配置了黑名单时同时拉黑当前 access jti。

**鉴权**：Bearer

**请求参数**：无（从 token 取用户身份；如客户端持有 refreshToken 可一并传，服务端按 jti 关联作废）

**响应 data 结构**：`null`

**响应示例**：

```json
{ "code": 0, "message": "success", "data": null }
```

**可能错误码**：

| 错误码 | 触发条件 | 前端处理建议 |
|--------|----------|--------------|
| -1002 | 未授权 | 清理本地 token 并跳登录页 |

---

## GET /api/auth/me

**描述**：获取当前登录用户信息。

**鉴权**：Bearer

**响应 data 结构**：引用数据模型 User（phone 脱敏）。

**响应示例**：

```json
{
  "code": 0, "message": "success",
  "data": { "id": 1, "username": "alice", "phone": "138****8000", "nickname": "Alice", "avatar": "", "status": 1 }
}
```

**可能错误码**：

| 错误码 | 触发条件 | 前端处理建议 |
|--------|----------|--------------|
| -1002 | 未授权 | 跳转登录页 |
| -1004 | 用户不存在（token 有效但用户已删） | 清理本地 token 并跳登录页 |

---

## POST /api/auth/oauth/login

**描述**：第三方登录（客户端模式）。前端用第三方 SDK 拿到 code 后调用，后端用 code 向第三方换 openid，已绑定则签发双令牌；未绑定按配置自动建号或返回需绑定。仅接第三方登录时存在。

**鉴权**：不需要

**请求体**：

| 字段 | 类型 | 必填 | 校验规则 | 说明 | 示例 |
|------|------|------|----------|------|------|
| provider | string | 是 | 枚举 OAuthProvider | 第三方平台 | wechat |
| code | string | 是 | 非空 | 第三方授权 code | 081aBc... |

**请求示例**：

```json
{ "provider": "wechat", "code": "081aBc..." }
```

**响应 data 结构**：

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| needBind | boolean | 是 | 是否需要绑定本地账号（true 时其余令牌字段为空，返回 bindToken） |
| bindToken | string | needBind=true 时 | 临时绑定凭证，10 分钟有效，用于 `/oauth/bind` |
| accessToken | string | needBind=false 时 | JWT |
| refreshToken | string | needBind=false 时 | refresh token |
| expiresIn | integer | needBind=false 时 | access 剩余秒数 |
| user | User | needBind=false 时 | 用户信息 |

**响应示例（已绑定）**：

```json
{ "code": 0, "message": "success", "data": { "needBind": false, "accessToken": "eyJ...", "refreshToken": "9f2c...", "expiresIn": 7200, "user": { "id": 1 } } }
```

**响应示例（需绑定）**：

```json
{ "code": 0, "message": "success", "data": { "needBind": true, "bindToken": "tmp_7d3f..." } }
```

**可能错误码**：

| 错误码 | 触发条件 | 前端处理建议 |
|--------|----------|--------------|
| -1001 | 参数缺失 / provider 非法 | 显示 message |
| -1002 | code 无效或已过期 / 用户已禁用 | 提示第三方授权失败，重试 |
| -2000 | 第三方服务调用失败 | 提示稍后重试 |

---

## POST /api/auth/oauth/bind

**描述**：第三方账号绑定本地账号（`needBind=true` 时调用）。支持「绑定已有账号（手机号+验证码）」或「新建账号绑定」。

**鉴权**：不需要（凭 bindToken）

**请求体**：

| 字段 | 类型 | 必填 | 校验规则 | 说明 | 示例 |
|------|------|------|----------|------|------|
| bindToken | string | 是 | 非空 | `/oauth/login` 返回的临时绑定凭证 | tmp_7d3f... |
| phone | string | 是 | `^1[3-9]\d{9}$` | 手机号 | 13800138000 |
| code | string | 是 | 6 位数字 | 短信验证码 | 482913 |

**请求示例**：

```json
{ "bindToken": "tmp_7d3f...", "phone": "13800138000", "code": "482913" }
```

**响应 data 结构**：同 `/api/auth/login`（绑定成功后直接签发双令牌）。

**可能错误码**：

| 错误码 | 触发条件 | 前端处理建议 |
|--------|----------|--------------|
| -1001 | 参数缺失 | 显示 message |
| -1002 | bindToken 无效或过期 / 验证码错误 | 提示重新走第三方登录 |
| -1005 | 该手机号已绑定其他第三方账号 | 提示更换手机号 |

---

## GET /api/user/profile

**描述**：获取当前用户完整资料（资料管理）。与 `GET /api/auth/me`（鉴权上下文的最小身份）相比，本接口面向「个人资料页」，返回完整 User。仅开资料管理时存在。

**鉴权**：Bearer

**响应 data 结构**：引用数据模型 User（phone 脱敏）。

**可能错误码**：

| 错误码 | 触发条件 | 前端处理建议 |
|--------|----------|--------------|
| -1002 | 未授权 | 跳转登录页 |
| -1004 | 用户不存在 | 清理本地 token 并跳登录页 |

---

## PATCH /api/user/profile

**描述**：修改当前用户资料（昵称/头像）。两个字段至少传一个。仅开资料管理时存在。

**鉴权**：Bearer

**请求体**：

| 字段 | 类型 | 必填 | 校验规则 | 说明 | 示例 |
|------|------|------|----------|------|------|
| nickname | string | 否 | ≤ 64 字符 | 昵称 | Alice |
| avatar | string | 否 | ≤ 500 字符，合法 URL | 头像 URL | https://cdn.x/a.png |

**请求示例**：

```json
{ "nickname": "Alice", "avatar": "https://cdn.x/a.png" }
```

**响应 data 结构**：更新后的 User。

**可能错误码**：

| 错误码 | 触发条件 | 前端处理建议 |
|--------|----------|--------------|
| -1001 | 参数校验失败 / 两字段都为空 | 显示 message 并定位字段 |
| -1002 | 未授权 | 跳转登录页 |

---

## POST /api/user/change-password

**描述**：已登录用户凭旧密码修改密码。成功后**吊销该用户其他设备的全部 refresh token**（保留当前会话），其他设备需重新登录。仅开资料管理时存在。

**鉴权**：Bearer

**请求体**：

| 字段 | 类型 | 必填 | 校验规则 | 说明 | 示例 |
|------|------|------|----------|------|------|
| oldPassword | string | 是 | 非空 | 旧密码，服务端 bcrypt 比对 | Passw0rd! |
| newPassword | string | 是 | 8-64 字符，需含字母和数字，且与旧密码不同 | 新密码 | NewPass1! |

**请求示例**：

```json
{ "oldPassword": "Passw0rd!", "newPassword": "NewPass1!" }
```

**响应 data 结构**：`null`

**可能错误码**：

| 错误码 | 触发条件 | 前端处理建议 |
|--------|----------|--------------|
| -1001 | 参数校验失败（新密码强度不足 / 与旧密码相同） | 显示 message 并定位字段 |
| -1002 | 旧密码错误 / 未授权 | 提示「旧密码错误」 |

---

## POST /api/user/bind-phone

**描述**：绑定或换绑手机号。先通过 `/api/auth/sms-code`（`scene=bind`）向**新手机号**发码，再调本接口校验并绑定。仅开资料管理时存在。

**鉴权**：Bearer

**请求体**：

| 字段 | 类型 | 必填 | 校验规则 | 说明 | 示例 |
|------|------|------|----------|------|------|
| phone | string | 是 | `^1[3-9]\d{9}$` | 新手机号 | 13900139000 |
| code | string | 是 | 6 位数字 | 发到新手机号的验证码（scene=bind） | 482913 |

**请求示例**：

```json
{ "phone": "13900139000", "code": "482913" }
```

**响应 data 结构**：更新后的 User（phone 脱敏）。

**可能错误码**：

| 错误码 | 触发条件 | 前端处理建议 |
|--------|----------|--------------|
| -1001 | 参数缺失 / 手机号格式错误 | 显示 message |
| -1002 | 验证码错误或已过期 / 未授权 | 提示「验证码错误或已过期」 |
| -1005 | 该手机号已被其他账号绑定 | 提示更换手机号 |

---

## POST /api/user/deactivate

**描述**：注销当前账号（软删除：置 `status=0`，不删行）。需二次确认身份——传密码或短信验证码（`scene=login`，发到已绑手机号）其一。成功后吊销全部 refresh token、当前 access 拉黑，强制退出。仅开资料管理时存在。

**鉴权**：Bearer

**请求体**（`password` 与 `code` 至少传一个）：

| 字段 | 类型 | 必填 | 校验规则 | 说明 | 示例 |
|------|------|------|----------|------|------|
| password | string | 二选一 | 非空 | 账号密码确认（有密码时） | Passw0rd! |
| code | string | 二选一 | 6 位数字 | 短信验证码确认（无密码的纯验证码/第三方账号） | 482913 |

**请求示例**：

```json
{ "password": "Passw0rd!" }
```

**响应 data 结构**：`null`

**可能错误码**：

| 错误码 | 触发条件 | 前端处理建议 |
|--------|----------|--------------|
| -1001 | 密码与验证码都未传 | 提示需二次确认 |
| -1002 | 密码错误 / 验证码错误或已过期 / 未授权 | 提示确认信息错误 |

---

## 数据模型（追加进契约第 5 节）

### User

| 字段 | 类型 | 必填 | 说明 | 枚举/引用 |
|------|------|------|------|-----------|
| id | integer | 是 | 用户 ID | - |
| username | string | 否 | 用户名，可空 | - |
| phone | string | 否 | 手机号，脱敏 `138****8000` | - |
| nickname | string | 是 | 昵称 | - |
| avatar | string | 是 | 头像 URL | - |
| status | integer | 是 | 用户状态，1 正常 0 禁用 | - |

## 枚举字典（追加进契约第 3 节）

### SmsScene（短信场景）

- 字段类型：string
- 默认值：`login`

| 枚举值 | 含义 | 前端展示 |
|--------|------|----------|
| login | 登录/注册 | 登录 |
| reset | 找回密码 | 找回密码 |
| bind | 绑定/换绑手机号 | 绑定手机号 |

> 验证码按场景隔离存储（Redis 键 `sms:code:{scene}:{phone}`）：`login` 场景申请的码只能用于 `/sms-login`，`reset` 场景的码只能用于 `/reset-password`，两者互不覆盖、不可串用。`sms:limit`/`sms:daily` 限流则按手机号跨场景共享。

### OAuthProvider（第三方平台）

- 字段类型：string

| 枚举值 | 含义 | 前端展示 |
|--------|------|----------|
| wechat | 微信 | 微信 |
| alipay | 支付宝 | 支付宝 |
| github | GitHub | GitHub |

> 枚举为闭集，按实际接入的平台裁剪，前端不得新增。
