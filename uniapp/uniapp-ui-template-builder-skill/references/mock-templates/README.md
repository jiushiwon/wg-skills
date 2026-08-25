# Mock 数据规范

所有页面模板目录下的 `mock.json` 统一采用以下响应信封格式：

```json
{
  "code": 200,
  "message": "success",
  "data": { }
}
```

## 字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| `code` | number | 业务状态码，`200` 表示成功 |
| `message` | string | 提示信息 |
| `data` | object | 页面所需数据，具体内容由页面模板定义 |

## 页面模板 data 约定

页面模板内部的数据结构建议按页面类型拆分：

- `title`：页面标题
- `list` / `rows` / `products`：列表类数据
- `pagination`：分页信息（列表页）
- `user` / `shop`：单对象信息

示例：

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "title": "商品列表",
    "products": [],
    "pagination": {
      "current": 1,
      "pageSize": 10,
      "total": 0,
      "totalPages": 0
    }
  }
}
```

## 状态覆盖

每份 mock 数据建议覆盖以下状态，便于前端联调：

- **正常态**：5-20 条典型数据
- **空状态**：`data.list` 为空数组
- **加载态**：由页面组件通过 `loading` prop 控制
- **错误态**：`code !== 200` 或网络错误模拟

## 与后端 API 对接

页面模板组件通过 props 接收 `mock.data` 中的字段：

```vue
<product-list
  :title="mock.data.title"
  :product-list="mock.data.products"
  :loading="loading"
  @retry="fetchData"
/>
```

这样 `mock.json` 可直接替换为后端 API 返回数据。

## 通用模板文件

`references/mock-templates/` 下的 `user.json`、`product.json`、`order.json` 用于定义各业务模块的字段规范，实际页面 mock 应在此基础上按统一信封格式输出。
