# 接口契约模板

## 统一响应格式

```json
{
  "code": 0,
  "message": "success",
  "data": {}
}
```

## 错误码规范

| 错误码 | 说明 |
|--------|------|
| 0 | 成功 |
| -1 | 通用错误 |
| -1001 | 参数校验错误 |
| -2000 | 系统错误 |
| -401 | 未授权 |
| -403 | 禁止访问 |
| -404 | 资源不存在 |

## 接口列表

### 健康检查

- `GET /api/health` - 健康检查
- `GET /api/health/db` - 数据库健康检查

### 认证

- `POST /api/auth/register` - 注册
- `POST /api/auth/login` - 登录
- `POST /api/auth/refresh` - 刷新 Token

### 用户

- `GET /api/users` - 用户列表
- `GET /api/users/:id` - 用户详情
- `PUT /api/users/:id` - 更新用户
- `DELETE /api/users/:id` - 删除用户
