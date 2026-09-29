# Performance 性能规则

本文档定义前端项目的性能审查规则。

---

## 1. 内存泄漏

### 检查项

| 规则 ID | 描述 | 严重程度 |
|---------|------|----------|
| PF-001 | setTimeout 无限递归无清理 | Error |
| PF-002 | addEventListener 未 remove | Error |
| PF-003 | setInterval 未 clearInterval | Error |

### 正确示例

```typescript
// 带上限的递归 setTimeout
let attempts = 0;
const maxAttempts = 200;
const timer = setInterval(() => {
  if (attempts++ > maxAttempts) {
    clearInterval(timer);
    return;
  }
}, 50);

// 清理
onUnmounted(() => {
  clearInterval(timer);
  removeEventListener('resize', handler);
});
```

---

## 2. 大方法拆分

### 检查项

| 规则 ID | 描述 | 严重程度 |
|---------|------|----------|
| PF-010 | 方法超过 500 行 | Error |

### 拆分建议

将超过 500 行的方法拆分为独立函数。

---

## 3. 控制台日志

### 检查项

| 规则 ID | 描述 | 严重程度 |
|---------|------|----------|
| PF-050 | 生产环境 console.log 遗留 | Warning |
| PF-051 | 高频回调中 console | Error |

### 正确示例

```typescript
const DEBUG = import.meta.env.DEV;
if (DEBUG) {
  console.info('Request:', url);
}
```

---

## 4. Magic Numbers

### 检查项

| 规则 ID | 描述 | 严重程度 |
|---------|------|----------|
| PF-060 | 魔数 9999999 | Error |
| PF-061 | 硬编码时间值 | Info |

### 正确示例

```typescript
// 常量提取
const TYPEWRITER_INTERVAL = 20;
const MAX_ATTEMPTS = 200;
```