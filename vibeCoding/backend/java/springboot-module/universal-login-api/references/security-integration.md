# Security 接入指南（universal-login-api）

> 本模块**不生成** `SecurityConfig` —— 骨架归 `springboot-init-skill`，方法级鉴权开关归 `springboot-auth-module-skill`。
> 但本模块要求宿主 `SecurityConfig` 做**两处修改**，否则 `/api/open/**` 会全量 401，而 `/api/apps/**`、`/api/bind/**` 会裸奔。

---

## 1. 必须修改的两处

### 1.1 注册应用签名过滤器（在 JWT 过滤器**之前**）

```java
import {{basePackage}}.security.AppSignatureAuthFilter;

// 构造函数注入
private final AppSignatureAuthFilter appSignatureAuthFilter;

@Bean
public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    http
        // ... 既有配置 ...
        .addFilterBefore(appSignatureAuthFilter, UsernamePasswordAuthenticationFilter.class);
    return http.build();
}
```

> ⚠️ 顺序很重要：签名过滤器要先跑完，`/api/open/**` 才会带着 `APP` 权限进入鉴权链。
> 若注册在 JWT 过滤器之后，JWT 过滤器会因为找不到 Bearer token 而放行空 context，最终被 `hasAuthority("APP")` 拒绝。

### 1.2 收紧授权规则（**删除** `permitAll`）

```java
.authorizeHttpRequests(auth -> auth
    // 公开端点：仅登录/刷新/健康检查/Swagger
    .requestMatchers("/api/auth/login", "/api/auth/refresh").permitAll()
    .requestMatchers("/api/health/**", "/swagger-ui/**", "/v3/api-docs/**").permitAll()

    // ★ 开放接口：不是 permitAll，要求签名过滤器授予的 APP 权限
    .requestMatchers("/api/open/**").hasAuthority("APP")

    // ★ 应用管理 / 密钥 / 绑定：登录 + 方法级鉴权（@PreAuthorize 负责细粒度权限码）
    .requestMatchers("/api/apps/**", "/api/bind/**").authenticated()

    .anyRequest().authenticated()
)
```

**必须删除的历史写法**（会导致任意未登录用户可读他人绑定、改他人应用）：

```java
.requestMatchers("/api/apps/**").permitAll()   // ❌
.requestMatchers("/api/bind/**").permitAll()   // ❌
```

并且确认 `@EnableMethodSecurity` 已开启（见 `springboot-auth-module-skill/references/skeleton.md` §SecurityConfig），否则 `@PreAuthorize` 静默失效。

---

## 2. `/api/open/**` 不是 permitAll —— 它是应用级鉴权

| 项 | 值 |
|----|----|
| 请求头 | `X-App-Key`、`X-Timestamp`（epoch 秒）、`X-Nonce`（随机串）、`X-Signature` |
| 签名串 | `{apiKey}\n{timestamp}\n{nonce}\n{HTTP_METHOD}\n{requestPath}` |
| 算法 | `HmacSHA256(apiSecret, 签名串)` → 小写 hex |
| 有效期 | 时间戳偏差 ≤ 300 秒 |
| 失败返回 | HTTP 401 + `{"code":-1002,"message":"..."}` |

`requestPath` 是**不含 query string** 的路径，例如 `/api/open/userinfo`。

### 2.1 服务端调用示例（Node.js）

```js
const crypto = require('crypto');

function sign(apiKey, apiSecret, method, path) {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const nonce = crypto.randomBytes(8).toString('hex');
  const payload = [apiKey, timestamp, nonce, method.toUpperCase(), path].join('\n');
  const signature = crypto.createHmac('sha256', apiSecret).update(payload).digest('hex');
  return { 'X-App-Key': apiKey, 'X-Timestamp': timestamp, 'X-Nonce': nonce, 'X-Signature': signature };
}

const apiKey = 'ak_xxx';
const apiSecret = 'sk_xxx';   // 创建密钥时返回的唯一一次，务必落库到应用侧配置

// 为应用侧用户 u-1001 申请绑定码
const headers = { 'Content-Type': 'application/json', ...sign(apiKey, apiSecret, 'POST', '/api/open/bind/apply') };
await fetch('https://host.example.com/api/open/bind/apply', {
  method: 'POST', headers, body: JSON.stringify({ appUserId: 'u-1001', appUserName: '张三' })
});
```

### 2.2 服务端调用示例（Java）

```java
String payload = String.join("\n", apiKey, timestamp, nonce, method.toUpperCase(), path);
String signature = AppSignatureVerifier.hmacHex(apiSecret, payload);
```

---

## 3. 自检清单

| # | 检查 | 判定 |
|---|------|------|
| 1 | `grep -c "permitAll" ` 后，`/api/apps/**`、`/api/bind/**`、`/api/open/**` 都不在其中 | 命中即未完成 |
| 2 | 签名过滤器注册在 `UsernamePasswordAuthenticationFilter` **之前** | 否则 `/api/open/**` 全 401 |
| 3 | `@EnableMethodSecurity` 已开启 | 否则 `@PreAuthorize` 静默失效 |
| 4 | `grep -rn "1L" controller/` 无硬编码用户 | 命中即未完成 |
| 5 | `grep -rn "@RequestBody App\b"` 无实体入参 | 命中即 mass assignment 风险 |
