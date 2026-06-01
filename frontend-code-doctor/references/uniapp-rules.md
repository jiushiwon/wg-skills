# uniapp 特有规则检查清单

本文档定义了 uniapp 项目特有的代码审查规则。

---

## 1. 条件编译

### 检查项

| 规则 ID | 描述 | 严重程度 |
|---------|------|----------|
| UP-001 | `#ifdef` / `#ifndef` 未配对 | Warning |
| UP-002 | 条件编译块内代码过长（>50行） | Info |
| UP-003 | 混用条件编译平台标识 | Error |

### 正确示例

```typescript
// #ifdef MP-WEIXIN
uni.showToast({ title: '仅微信小程序' });
// #endif

// #ifndef H5
uni.hideLoading();
// #endif
```

---

## 2. uni. API 类型安全

### 检查项

| 规则 ID | 描述 | 严重程度 |
|---------|------|----------|
| UP-010 | `uni.request` 返回类型为 `any` | Error |
| UP-011 | `uni.uploadFile` 类型缺失 | Warning |
| UP-012 | `uni.downloadFile` 未处理失败情况 | Error |

### 正确示例

```typescript
interface UploadResult {
  statusCode: number;
  tempFilePath?: string;
}

uni.uploadFile({
  url: '...',
  success: (res: UploadResult) => {
    if (res.statusCode === 200) {
      // 处理成功
    }
  },
  fail: () => {
    // 处理失败
  }
});
```

---

## 3. 安全区域

### 检查项

| 规则 ID | 描述 | 严重程度 |
|---------|------|----------|
| UP-020 | fixed 元素未预留安全区域 | Error |
| UP-021 | bottom tabbar 遮挡内容 | Error |

### 正确示例

```scss
.fixed-bottom {
  bottom: calc(env(safe-area-inset-bottom) + 100rpx);
}

.scroll-content {
  padding-bottom: calc(env(safe-area-inset-bottom) + 180rpx);
}
```

---

## 4. 平台差异

### 检查项

| 规则 ID | 描述 | 严重程度 |
|---------|------|----------|
| UP-030 | 使用不兼容的 CSS 属性 | Warning |
| UP-031 | 调用不存在的 API | Error |

### 常见平台差异

| 特性 | H5 | 微信小程序 | App |
|------|-----|----------|-----|
| `window.innerWidth` | ✅ | ❌ | ✅ |
| `uni.createSelectorQuery` | ✅ | ✅ | 部分 |
| `position: sticky` | ✅ | ✅ | ❌ |

---

## 5. 环境配置检查

### 检查项

| 规则 ID | 描述 | 严重程度 |
|---------|------|----------|
| UP-040 | hardcode 测试环境 URL | Error |
| UP-041 | 缺少环境判断逻辑 | Warning |
| UP-042 | secretKey 硬编码 | Critical |

### 正确示例

```typescript
const API_BASE = import.meta.env.VITE_API_BASE || 'https://prod.example.com';

// #ifdef DEV
console.log('Debug mode');
// #endif
```