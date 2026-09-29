# 安全规范详解

## 1. 接口安全

### 1.1 Token 管理

```typescript
// ✅ 正确：Token 存储在 Storage
uni.setStorageSync('token', response.token);

// ❌ 错误：敏感信息存 Storage
uni.setStorageSync('password', '123456');
uni.setStorageSync('idCard', '110101199001011234');
```

### 1.2 请求头注入

```typescript
// 请求拦截器中注入 Token
const token = getToken();
if (token) {
  headers['Authorization'] = `Bearer ${token}`;
}
```

### 1.3 敏感接口

```typescript
// 敏感接口添加额外验证
interface SensitiveOptions extends RequestOptions {
  signature?: string;  // 签名
  timestamp?: number;   // 时间戳
  nonce?: string;       // 随机字符串
}
```

## 2. 数据安全

### 2.1 存储安全

```typescript
// ❌ 禁止：明文存储敏感信息
uni.setStorageSync('userInfo', {
  password: '123456',
  idCard: '110101199001011234',
  bankCard: '6222021234567890'
});

// ✅ 正确：只存储非敏感信息
uni.setStorageSync('userInfo', {
  id: 1,
  nickname: '用户昵称',
  avatar: 'https://...'
});
```

### 2.2 日志脱敏

```typescript
// ❌ 错误：日志输出敏感信息
console.log('用户登录', { phone: '13800138000', password: '123456' });

// ✅ 正确：脱敏处理
console.log('用户登录', {
  phone: phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2'),
  hasPassword: !!password
});
```

### 2.3 数据传输

```typescript
// ✅ 敏感数据使用 HTTPS
const BASE_URL = 'https://api.example.com';

// ✅ 敏感数据加密传输
import { encrypt } from '@/utils/crypto';

const encryptedData = encrypt(JSON.stringify(sensitiveData));
```

## 3. 代码安全

### 3.1 危险方法

```typescript
// ❌ 禁止使用
eval('...');
new Function('...');
setTimeout('...', 0);
setInterval('...', 0);

// ✅ 必须使用
JSON.parse('...');
uni.setStorageSync('key', 'value');
```

### 3.2 用户输入

```typescript
// ✅ 用户输入转义
function escapeHtml(str: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;'
  };
  return str.replace(/[&<>"'/]/g, char => map[char]);
}
```

### 3.3 URL 校验

```typescript
// ✅ URL 安全校验
function isSafeUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}
```

## 4. 鉴权安全

### 4.1 路由守卫

```typescript
// 页面鉴权
function checkAuth(): boolean {
  const token = getToken();
  if (!token) {
    uni.showToast({ title: '请先登录', icon: 'none' });
    uni.navigateTo({ url: '/pages/login/index' });
    return false;
  }
  return true;
}

// 页面 onLoad 中调用
onLoad(() => {
  if (!checkAuth()) return;
  // 业务逻辑
});
```

### 4.2 权限校验

```typescript
// 权限定义
const PERMISSIONS = {
  ADMIN: 'admin',
  USER: 'user',
  GUEST: 'guest'
} as const;

// 权限检查
function hasPermission(permission: string): boolean {
  const userInfo = getUserInfo();
  return userInfo?.permissions?.includes(permission);
}

// 使用
function onClick() {
  if (!hasPermission(PERMISSIONS.ADMIN)) {
    uni.showToast({ title: '权限不足', icon: 'none' });
    return;
  }
  // 执行操作
}
```

### 4.3 敏感操作二次确认

```typescript
// 敏感操作二次确认
function confirmSensitive(action: string): Promise<boolean> {
  return new Promise((resolve) => {
    uni.showModal({
      title: '安全提示',
      content: `确定要${action}吗？`,
      success: (res) => {
        resolve(res.confirm);
      }
    });
  });
}

// 使用
async function onDelete() {
  const confirmed = await confirmSensitive('删除此数据');
  if (!confirmed) return;
  // 执行删除
}
```

## 5. 网络安全

### 5.1 请求校验

```typescript
// 请求参数校验
function validateParams(data: Record<string, any>): boolean {
  for (const key in data) {
    if (data[key] === undefined || data[key] === null) {
      return false;
    }
  }
  return true;
}
```

### 5.2 响应校验

```typescript
// 响应数据校验
function validateResponse(data: any): boolean {
  if (!data) return false;
  if (typeof data.code !== 'number') return false;
  if (data.code !== 0 && data.code !== 200) return false;
  return true;
}
```

## 6. 本地安全

### 6.1 Storage 加密

```typescript
// 使用 uni.setStorageSync 带加密
uni.setStorageSync('key', 'value', {
  encrypt: true  // 加密存储
});
```

### 6.2 清理敏感数据

```typescript
// 登出时清理所有敏感数据
function clearSensitiveData() {
  const keys = ['token', 'userInfo', 'phone', 'idCard'];
  keys.forEach(key => {
    uni.removeStorageSync(key);
  });
}
```

## 7. 调试安全

### 7.1 生产环境禁用

```typescript
// 开发环境专用代码
if (process.env.NODE_ENV === 'development') {
  console.log('debug info');
}

// ✅ 生产环境自动移除
// 构建时自动去除 console.log
```

### 7.2 错误处理

```typescript
// 全局错误捕获
App.onError((err) => {
  // 上报错误
  reportError({
    message: err.message,
    stack: err.stack,
    // 脱敏用户信息
    userId: userInfo?.id
  });
});
```

---

## 8. 安全检查清单

| 检查项 | 要求 |
|--------|------|
| Token 存储 | 只存 Storage，不存敏感信息 |
| 日志输出 | 脱敏处理 |
| 用户输入 | 转义处理 |
| URL 参数 | 校验协议 |
| 路由跳转 | 鉴权检查 |
| 敏感操作 | 二次确认 |
| 错误上报 | 脱敏用户信息 |
| 清理数据 | 登出时清理 |
