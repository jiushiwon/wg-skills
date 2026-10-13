# 统一响应格式规范

> ⚠️ **本文件已迁移**：内容已并入 [../../shared/response-envelope-spec.md](../../shared/response-envelope-spec.md)。
>
> 迁移原因：
> 1. **单一事实来源（SoT）**：避免本文件与 `shared/response-envelope-spec.md` 各自演进导致冲突
> 2. **冲突修复**：本文件曾用 `1000/1001/1002` 正数表示成功，与 shared 规范"code 只能是 0 或负数"冲突
> 3. **引用统一**：所有后端 skill 已统一引用 `shared/response-envelope-spec.md`
>
> **本文件保留为占位符**，仅作历史追溯。新文档请直接引用 shared。

---

## 迁移对照表

| 本文件原章节 | 现地址 |
|-------------|--------|
| 响应结构 `{ code, message, data }` | [shared/response-envelope-spec.md §响应格式](../../shared/response-envelope-spec.md) |
| 字段说明 | 同上 |
| 状态码规则 | [shared/error-code-spec.md](../../shared/error-code-spec.md) |
| 分页格式 `{ list, total, page, pageSize }` | [shared/pagination-spec.md](../../shared/pagination-spec.md) |
| 各语言实现参考 | 保留在本文件下方（不变） |

---

## 各语言实现参考（保留本节，不重复 shared）

> 本节是 shared 中"各语言实现参考"的**超集**，包含更多语言实现细节。仅 convention-skill 内部使用。

### Java / Spring Boot

```java
@Data
public class ApiResponse<T> {
    private Integer code;
    private String message;
    private T data;

    public static <T> ApiResponse<T> ok(T data) {
        return new ApiResponse<>(0, "success", data);
    }

    public static <T> ApiResponse<T> fail(int code, String message) {
        return new ApiResponse<>(code, message, null);
    }
}
```

### Python / FastAPI

```python
from typing import Generic, TypeVar
from pydantic import BaseModel

T = TypeVar("T")

class ApiResponse(BaseModel, Generic[T]):
    code: int = 0
    message: str = "success"
    data: T | None = None

    @classmethod
    def ok(cls, data: T) -> "ApiResponse[T]":
        return cls(code=0, message="success", data=data)

    @classmethod
    def fail(cls, code: int, message: str) -> "ApiResponse[None]":
        return cls(code=code, message=message, data=None)
```

### Go / Gin

```go
type ApiResponse struct {
    Code    int         `json:"code"`
    Message string      `json:"message"`
    Data    interface{} `json:"data"`
}

func OK(data interface{}) ApiResponse {
    return ApiResponse{Code: 0, Message: "success", Data: data}
}

func Fail(code int, message string) ApiResponse {
    return ApiResponse{Code: code, Message: message, Data: nil}
}
```

### Node.js / Express

```typescript
export interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data: T | null;
}

export const ok = <T>(data: T): ApiResponse<T> => ({ code: 0, message: 'success', data });
export const fail = (code: number, message: string): ApiResponse<null> => ({ code, message, data: null });
```

### Rust / Actix-web

```rust
use serde::Serialize;

#[derive(Serialize)]
pub struct ApiResponse<T: Serialize> {
    pub code: i32,
    pub message: String,
    pub data: Option<T>,
}

impl<T: Serialize> ApiResponse<T> {
    pub fn ok(data: T) -> Self { Self { code: 0, message: "success".into(), data: Some(data) } }
    pub fn fail(code: i32, message: impl Into<String>) -> Self { Self { code, message: message.into(), data: None } }
}
```
