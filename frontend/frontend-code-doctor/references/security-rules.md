# Security 安全审查规则

本文档定义前端项目的安全审查规则。

---

## 1. 敏感信息泄露

### 检查项

| 规则 ID | 描述 | 严重程度 |
|---------|------|----------|
| SE-001 | API Key/Token 硬编码 | Critical |
| SE-002 | 私钥/密钥硬编码 | Critical |
| SE-003 | 生产环境 URL 泄露 | Warning |
| SE-004 | 用户密码在 localStorage | Error |
| SE-005 | 身份证/银行卡等敏感数据存储 | Error |

### 检查模式

```bash
# 检查常见的敏感 key
Grep "(apiKey|apikey|API_KEY|secretKey|SECRET|token|TOKEN|password|PASSWORD)" --output_mode content

# 检查 jwt/token 存储
Grep "localStorage\.(setItem|getItem).*token" --output_mode content

# 检查 environment 文件中的 secrets
Grep "(sk_live|AKIA|-----BEGIN RSA PRIVATE KEY)" --output_mode content
```

### 正确示例

```typescript
// 使用环境变量
const API_KEY = import.meta.env.VITE_API_KEY;

// 使用后端接口获取 token，永不存储敏感信息
const token = await auth.getToken();
```

---

## 2. XSS 跨站脚本

### 检查项

| 规则 ID | 描述 | 严重程度 |
|---------|------|----------|
| SE-010 | dangerouslySetInnerHTML 未校验输入 | Error |
| SE-011 | innerHTML/dangerouslySetInnerHTML 使用 | Warning |
| SE-012 | eval/Function 执行用户输入 | Error |
| SE-013 | URL 参数拼接到 DOM | Error |

### 正确示例

```typescript
// React: 使用 textContent 而非 innerHTML
element.textContent = userInput;
// 或使用库
import DOMPurify from 'dompurify';
element.innerHTML = DOMPurify.sanitize(userInput);
```

---

## 3. CSRF/XSRF

### 检查项

| 规则 ID | 描述 | 严重程度 |
|---------|------|----------|
| SE-020 | POST 请求缺少 CSRF Token | Error |
| SE-021 | 关键操作使用 GET | Error |
| SE-022 | 请求头 Origin/Referer 未校验 | Warning |

### 正确示例

```typescript
// 添加 CSRF token
async function postData(url, data) {
  const csrfToken = getCsrfToken();
  return fetch(url, {
    method: 'POST',
    headers: {
      'X-CSRF-Token': csrfToken,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
    credentials: 'same-origin',
  });
}
```

---

## 4. 输入校验

### 检查项

| 规则 ID | 描述 | 严重程度 |
|---------|------|----------|
| SE-030 | 仅客户端校验 | Warning |
| SE-031 | 正则校验不完整 | Warning |
| SE-032 | 文件上传未限制类型/大小 | Error |

### 正确示例

```typescript
// 文件上传校验
function validateFile(file: File) {
  const ALLOWED_TYPES = ['image/jpeg', 'image/png'];
  const MAX_SIZE = 5 * 1024 * 1024; // 5MB
  
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('不支持的文件类型');
  }
  if (file.size > MAX_SIZE) {
    throw new Error('文件大小不能超过 5MB');
  }
}
```

---

## 5. 第三方依赖安全

### 检查项

| 规则 ID | 描述 | 严重程度 |
|---------|------|----------|
| SE-040 | 已知漏洞依赖未更新 | Error |
| SE-041 | package.json 来源不明 | Warning |
| SE-042 | @types/* 版本与原包不一致 | Warning |

### 检查模式

```bash
# 检查已知漏洞（需要安全工具）
Grep "lodash" --output_mode content

# 检查 source map 泄露
Grep "sourceMappingURL" --output_mode content
```

---

## 6. 网络安全

### 检查项

| 规则 ID | 描述 | 严重程度 |
|---------|------|----------|
| SE-050 | HTTP 而非 HTTPS | Error |
| SE-051 | CORS 配置为 * | Error |
| SE-052 | 敏感 Cookie 缺少 Secure/HttpOnly | Warning |

### 正确示例

```typescript
// CORS 正确配置
const corsOptions = {
  origin: ['https://app.example.com'],
  credentials: true,
};

// Cookie 设置
Set-Cookie: token=xxx; Secure; HttpOnly; SameSite=Strict;
```