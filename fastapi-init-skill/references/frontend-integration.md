# 与前端请求层联动

`fastapi-init-skill` 生成的后端与 `frontend-request-skill` 通过统一响应信封和接口契约联动。

## 1. 响应信封对齐

后端所有 JSON 接口统一返回：

```json
{
  "code": 0,
  "message": "success",
  "data": { }
}
```

前端 `frontend-request-skill/references/frontend-spec.md` 中的 `ApiResponse<T>`：

```typescript
interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}
```

二者字段名、含义、成功判定（`code === 0`）完全一致。

## 2. 错误码直接复用

后端错误码表应原样复制为前端 `ERROR_CODE_MAP`：

```typescript
export const ERROR_CODE_MAP: Record<number, string> = {
  0: "操作成功",
  [-1001]: "参数校验失败",
  [-1002]: "未登录或登录已过期",
  [-1003]: "无权限访问",
  [-1004]: "资源不存在",
  [-1005]: "资源冲突或重复",
  [-1006]: "请求过于频繁",
  [-1031]: "文件大小超过限制",
  [-1032]: "不支持的文件类型",
  [-2000]: "系统繁忙，请稍后再试",
};
```

## 3. Token 注入方式

登录/注册接口返回 `TokenResponse`：

```json
{
  "access_token": "...",
  "refresh_token": "...",
  "token_type": "bearer"
}
```

前端保存 `access_token`，后续请求在 Header 中注入：

```
Authorization: Bearer {access_token}
```

当收到 `-1002` 时，使用 `refresh_token` 调用 `POST /api/auth/refresh` 换取新的 `access_token`。

## 4. SSE 对接

### H5 / Web

```javascript
const es = new EventSource("http://localhost:8080/api/sse/chat");
es.onmessage = (e) => {
  const msg = JSON.parse(e.data);
  console.log(msg);
};
es.addEventListener("done", () => es.close());
```

### uni-app 小程序

小程序原生不支持 `EventSource`，使用 `uni.request` 开启 `enableChunked: true` 接收流式数据：

```javascript
const requestTask = uni.request({
  url: `http://localhost:8080/api/sse/chat/protected?token=${token}`,
  enableChunked: true,
  success: () => {},
});
requestTask.onChunkReceived((res) => {
  const text = new TextDecoder("utf-8").decode(res.data);
  // 按 \n\n 解析 SSE 事件
});
```

> 注意：`EventSource` 无法自定义 Header，SSE 认证通过 URL 查询参数 `?token=xxx` 传递。

## 5. 文件上传对接

### Web / H5

```javascript
const formData = new FormData();
formData.append("file", fileInput.files[0]);

fetch("http://localhost:8080/api/upload", {
  method: "POST",
  headers: { Authorization: `Bearer ${token}` },
  body: formData,
});
```

### uni-app

```javascript
uni.uploadFile({
  url: "http://localhost:8080/api/upload",
  filePath: tempFilePath,
  name: "file",
  header: { Authorization: `Bearer ${token}` },
  success: (res) => {
    const response = JSON.parse(res.data);
    if (response.code === 0) {
      console.log(response.data.url);
    }
  },
});
```

注意：`Content-Type` 不要手动设置，让浏览器或 `uni.uploadFile` 自动填充 `multipart/form-data` 及 boundary。

## 6. 接口契约是唯一的桥梁

生成项目后必须落地 `api-contract.md`，其中包含：

- 全局错误码表
- 每个接口的 URL、方法、入参、出参
- Token 注入方式
- SSE 事件格式
- 上传限制（大小、类型）

前端开发时应以 `api-contract.md` 为准，而不是直接看后端的模型代码。
