# 前后端联调指南

一句话：VibeCoding 场景下的前后端协作快速入门。

## 联调流程

1. **定义接口文档**（优先推荐 OpenAPI/Swagger）
2. **Mock 数据开发**（前端不等待后端）
3. **接口联调**（实测接口）
4. **问题排查**（日志、Network、错误码）

## 常见问题排查

| 问题 | 可能原因 | 排查方向 |
|------|----------|----------|
| 404 | 路径错误、CORS | Network 面板、代理配置 |
| 401 | Token 失效/未传 | Authorization 头 |
| 500 | 服务端异常 | 服务端日志 |
| 跨域 | CORS 未配置 | 后端配置或代理 |

## 前端调用规范

```typescript
// 统一的请求封装
const request = (options) => {
  return axios({
    baseURL: import.meta.env.VITE_API_BASE,
    ...options,
    headers: {
      Authorization: `Bearer ${getToken()}`,
      ...options.headers,
    },
  });
};
```

## 接口规范建议

- RESTful 风格
- 统一错误码
- 请求/响应结构统一
- 分页接口规范
