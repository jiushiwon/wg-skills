# 统一响应信封规范

> 所有后端技能的 JSON 接口（除 SSE 外）**必须**遵循本规范。前端 `frontend-request-skill` 按相同结构解析。

## 响应格式

```json
{
  "code": 0,
  "message": "success",
  "data": {}
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `code` | integer | 是 | 业务状态码。`0` = 成功，负数 = 失败（见 [error-code-spec.md](error-code-spec.md)） |
| `message` | string | 是 | 人类可读描述 |
| `data` | any | 是 | 业务数据。空时为 `null`，列表时为数组，分页时为 `{ list, total, page, pageSize }` |

## 约束

- HTTP 状态码统一 `200`（路由不存在等底层异常除外），业务状态由 `code` 表达
- 响应中**禁止**返回堆栈、SQL、内部错误信息
- `code` 只能是 `0` 或负数，**禁止使用正数表示错误**

## 各语言实现参考

| 语言 | 实现方式 |
|------|---------|
| Java (Spring Boot) | `ResponseBodyAdvice` 自动包装 |
| Python (FastAPI) | 自定义 `JSONResponse` 中间件 |
| Go (Gin) | 自定义 `ResponseWriter` 包装 |
| Node.js (Express) | 自定义中间件 `res.success()` / `res.fail()` |
| Rust (Axum) | 自定义 `IntoResponse` 实现 |

## 前端消费

前端 `request.ts` 按以下逻辑解析：

```typescript
interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

// code === 0 → 成功，resolve(data)
// code !== 0 → 业务异常，reject({ code, message })
```
