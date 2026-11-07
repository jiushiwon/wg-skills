# Node.js + 前端联动规范

> 确保 `nodejs-init-skill` 生成的后端接口可被 `frontend-request-skill` 直接消费。

## 联动矩阵

| 后端（Express） | 前端（request.ts） | 对齐点 |
|----------------|-------------------|--------|
| `res.success(data)` | `ApiResponse<T>.code === 0` → resolve | 响应信封 |
| `res.fail(-1001, '参数错误')` | `ERROR_CODE_MAP['-1001']` → 用户提示 | 错误码 |
| `passport.authenticate('jwt')` | `headers: { Authorization: 'Bearer ...' }` | JWT 注入 |
| `res.write('data: ...')` | `new EventSource(url)` / `enableChunked` | SSE 流式 |
| `multer` 中间件 | `FormData` + `upload<T>(options)` | 文件上传 |

## 字段命名对齐

后端 Express 路由返回的字段名**必须**使用 camelCase（与前端 TypeScript 一致）：

```javascript
// ✅ 正确
res.success({ userId: 1, createdAt: '2026-01-01T00:00:00Z' })

// ❌ 错误（snake_case 不对齐）
res.success({ user_id: 1, created_at: '2026-01-01T00:00:00Z' })
```

> MongoDB (Mongoose) 默认使用 camelCase，天然对齐。Sequelize 需配置 `underscored: false`。

## 分页对齐

后端分页响应**必须**返回以下 4 个字段：

```javascript
res.success({
  list: users,      // 当前页数据
  total: count,     // 总条数
  page: pageNum,    // 当前页码
  pageSize: size    // 每页条数
})
```

前端请求：

```typescript
const { data } = await get<PaginatedResponse<User>>('/users', { page: 1, pageSize: 20 })
```

## CORS 配置

开发环境必须允许前端 dev server 的跨域：

```javascript
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}))
```
