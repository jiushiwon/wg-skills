# 分页规范

> 所有后端技能的分页接口**必须**遵循本规范。前端 `frontend-request-skill` 按相同结构发送请求和解析响应。

## 请求参数

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `page` | integer | 1 | 页码，从 1 开始 |
| `pageSize` | integer | 20 | 每页条数 |

**约束**：
- `page` 最小值为 1
- `pageSize` 上限为 100，超过时强制截断为 100
- `pageSize` 最小值为 1

## 响应结构（在 `data` 内）

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [],
    "total": 0,
    "page": 1,
    "pageSize": 20
  }
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `list` | array | 是 | 当前页数据列表 |
| `total` | integer | 是 | 总条数 |
| `page` | integer | 是 | 当前页码 |
| `pageSize` | integer | 是 | 每页条数 |

## 前端请求示例

```typescript
// GET /api/users?page=1&pageSize=20
const { data } = await get<PaginatedResponse<User>>('/users', { page: 1, pageSize: 20 });
// data.list → User[]
// data.total → number
```

## 各语言查询参数命名

| 语言 | 参数名 | 说明 |
|------|--------|------|
| Java | `page`, `pageSize` | Spring Data Pageable |
| Python | `page`, `pageSize` | Query 参数 |
| Go | `page`, `pageSize` | Query 参数 |
| Node.js | `page`, `pageSize` | Query 参数 |

**统一使用 `page` + `pageSize`**（camelCase），不使用 `page_size` 或 `per_page`。
