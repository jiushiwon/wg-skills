# 通用登录（universal-login）：应用 / 密钥 / 绑定 / 开放接口

多账户体系：宿主系统（vue-admin）的账号可以绑定到任意第三方应用（接入方）的账号。

## 表

| 表 | 说明 |
|----|------|
| `wg_sys_app` | 第三方应用：`app_key`(`app_xxx`) `owner_id` `callback_url` |
| `wg_sys_app_key` | 应用密钥：`api_key`(`ak_xxx`) `api_secret`(`sk_xxx`) `last_used_at` |
| `wg_sys_app_binding` | 绑定关系：`sys_user_id` ↔ `app_id` + `app_user_id` |
| `wg_sys_bind_code` | 绑定码：`code` `direction` `status` `expire_at` |

## ★ appKey 与 apiKey 别混淆

| 字段 | 形态 | 用途 |
|------|------|------|
| `App.app_key` | `app_xxx` | 应用标识（展示用），**不参与签名** |
| `AppKey.api_key` | `ak_xxx` | 密钥 ID，放进 `X-App-Key` 头并**参与签名** |

中间件按 `api_key = ? AND status = 1` 查 `wg_sys_app_key`。把 `app_xxx` 塞进
`X-App-Key` 会查不到 → 401「应用密钥无效或已禁用」。

## 密钥（AppKey）

- `api_secret = "sk_" + randomHex(32)`（实测长度 67）
- **仅创建响应返回一次**（`CreatedAppKeyVO`），列表 / 详情用 `AppKeyVO`（无 secret）
- 模型字段 `json:"-"`，绝不出现在普通响应里
- ★ 服务端**不得**把 secret 回写到实体后再返回（历史缺陷：`setApiSecret(null)` 让前端永远
  拿不到 secret，同时把库里的 secret 写成 null）
- 删除密钥、删除应用时级联软删密钥与绑定

## 绑定码（BindCode）

- 5 分钟有效，**一次性消费**（`status`：`0` 待用 / `1` 已用 / `2` 过期）
- `direction`：`app_initiated`（应用发起，宿主扫码认领）/ `user_initiated`（宿主发起）
- 可用判定：`status == 0 && expire_at > now`

## 绑定流程（双向）

| 方向 | 入口 | 说明 |
|------|------|------|
| 应用发起 | `POST /api/open/bind/apply` → 拿绑定码 → `POST /api/open/bind/claim` | 第三方主导 |
| 宿主发起 | `POST /api/bind/code` → 拿绑定码 → 应用侧认领 | 宿主主导 |
| 宿主确认 | `POST /api/bind/confirm`，**只接收 `{ code }`** | 身份取自登录态 |

★ `confirm` 曾支持 `mainUsername` / `mainPassword`，那是**越权漏洞**，已删除。
绑定身份只来自登录态，请求体永远只有一个 `code` 字段。

## 开放接口应用签名（`/api/open/**`）

请求头（四个缺一不可）：

```
X-App-Key:     ak_xxx        ← AppKey.api_key
X-Timestamp:   1791087227    ← Unix 秒
X-Nonce:       随机串
X-Signature:   HMAC 十六进制
```

签名构造：

```
payload  = join([apiKey, timestamp, nonce, method, path, rawQuery, sha256Hex(body)], "\n")
signature = hex(HmacSHA256(apiSecret, payload))
```

**7 段，顺序不可变**：

| 段 | 取值 | 说明 |
|----|------|------|
| apiKey | `AppKey.apiKey` | 与 `X-App-Key` 头一致 |
| timestamp | Unix 秒 | 与 `X-Timestamp` 一致 |
| nonce | 随机串 | 与 `X-Nonce` 一致 |
| method | 大写，如 `GET` | — |
| path | `/api/open/userinfo` | **不含** query |
| rawQuery | `appUserId=demo` | **不含**前导 `?`；无 query 时为空串 |
| sha256Hex(body) | 请求体摘要 | 无 body 时为 `sha256Hex("")` = `e3b0c442...b855` |

> ⚠️ **query 与 body 必须参与签名**（P0-4）。
> 只签 5 段（不含 query/body）时，把 `?appUserId=X` 换成 `?appUserId=Y` 仍会验签通过，
> POST 请求体也可被整体替换 —— **签名形同虚设**。
> 回归断言：篡改 query 后原签名必须 401。

- 时间偏差容忍 **300 秒**
- 比较用**常量时间比较**（`subtle.ConstantTimeCompare`），十六进制解码后再比字节
- 校验通过后**登记 nonce 防重放**（10 分钟内复用同一 nonce 直接拒绝，P0-4）
- 校验通过后更新 `last_used_at`，并写入 `AppPrincipal{AppID, OwnerID, APIKey}` 到上下文

### 开放端点

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/open/bind/apply` | POST | 应用发起绑定，返回绑定码 |
| `/api/open/bind/claim` | POST | 应用认领绑定码 |
| `/api/open/userinfo` | GET | 查询 `?appUserId=` 的绑定状态与宿主信息 |

`OpenUserInfo` 未绑定时返回 `{ appUserId, bound: false }`（不是 404），
已绑定才回填 `userId / username / nickname / avatar / email / phone`。

## 宿主侧端点（登录态，`/api/bind`）

| 端点 | 方法 | 返回 |
|------|------|------|
| `/api/bind` | GET | **裸数组** `BindVO[]`（不是分页） |
| `/api/bind/code` | POST | `BindCodeVO` |
| `/api/bind/confirm` | POST | `BindVO` |
| `/api/bind/{id}` | DELETE | 解绑 |
| `/api/bind/{id}/default` | PUT | 设为默认 |

★ `/api/bind` 返回裸数组，前端直接 `rows.value = res`，**不要**取 `res.list`。
