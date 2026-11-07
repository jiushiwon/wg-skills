# JWT 鉴权规范

> 所有后端 init-skill 的 JWT 实现**必须**遵循本规范。前端 `frontend-request-skill` 按相同逻辑注入 Token。

## Token 格式

```
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOi...
```

## JWT 载荷

```json
{
  "sub": "username",
  "uid": 1,
  "type": "access | refresh",
  "iss": "{{project_name}}",
  "iat": 1692600000,
  "exp": 1692603600
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| `sub` | string | 用户名（Subject） |
| `uid` | integer | 用户 ID |
| `type` | string | `access`（访问令牌）或 `refresh`（刷新令牌） |
| `iss` | string | 签发者（项目名） |
| `iat` | integer | 签发时间（Unix 时间戳） |
| `exp` | integer | 过期时间（Unix 时间戳） |

## Token 有效期

| Token 类型 | 默认有效期 | 说明 |
|-----------|-----------|------|
| access_token | 3600s（1 小时） | 短期，用于接口鉴权 |
| refresh_token | 604800s（7 天） | 长期，用于刷新 access_token |

## 接口鉴权规则

| 接口类型 | 是否需要 Token | 说明 |
|---------|---------------|------|
| 健康检查 `/health` | 否 | — |
| 认证接口 `/auth/*` | 否（除 `/auth/logout` 和 `/auth/me`） | 注册/登录/刷新不需要 |
| SSE 公开 `/sse/chat` | 否 | — |
| SSE 受保护 `/sse/chat/protected` | 是 | 可通过 URL 参数 `?token=` 传递（SSE 不支持自定义 Header） |
| 上传 `/upload` | 是 | `none` 数据库模式下可选 |
| 其他所有接口 | 是 | 默认需要鉴权 |

## 刷新流程

```
前端 request.ts                后端
    │                           │
    ├─ 401 Unauthorized ───────►│
    │                           │
    ├─ POST /auth/refresh ─────►│
    │   { refreshToken }        │
    │                           │
    │◄─ { accessToken, ... } ──┤
    │                           │
    ├─ 重试原请求（自动）───────►│
```

前端 `auth.service.ts` 维护刷新队列，多个并发 401 只触发一次刷新。

## 各语言实现参考

| 语言 | 依赖库 | 算法 |
|------|--------|------|
| Java | jjwt 0.12.x | HS256 |
| Python | python-jose / PyJWT | HS256 |
| Go | golang-jwt/jwt v5 | HS256 |
| Node.js | jsonwebtoken | HS256 |
| Rust | jsonwebtoken crate | HS256 |

**统一使用 HS256 算法**，密钥通过环境变量 `JWT_SECRET` 注入。
