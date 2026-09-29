# 日志模块接口契约

> 本文件由 fastapi-log-module-skill 生成，遵循 `backend/shared/module-output-spec.md`。

## 接口清单

| 方法 | 路径 | 说明 | 鉴权 |
|------|------|------|------|
| GET | /api/logs/operation | 操作日志列表（分页） | 是 |
| GET | /api/logs/operation/{id} | 操作日志详情 | 是 |
| GET | /api/logs/login | 登录日志列表（分页） | 是 |
| DELETE | /api/logs/operation | 清理操作日志（按日期） | 是 |
| DELETE | /api/logs/login | 清理登录日志（按日期） | 是 |

## 数据模型

### OperationLogResponse

| 字段 | 类型 | 说明 |
|------|------|------|
| id | integer | 日志 ID |
| user_id | integer | 操作人 ID |
| username | string | 操作人用户名 |
| module | string | 模块名 |
| action | string | 操作类型 |
| method | string | HTTP 方法 |
| url | string | 请求 URL |
| ip | string | 操作人 IP |
| status | integer | 响应状态码 |
| cost_time | integer | 耗时（ms） |
| created_at | string | ISO 8601 |

### LoginLogResponse

| 字段 | 类型 | 说明 |
|------|------|------|
| id | integer | 日志 ID |
| user_id | integer | 用户 ID |
| username | string | 用户名 |
| ip | string | 登录 IP |
| user_agent | string | 浏览器 UA |
| status | string | SUCCESS / FAILED |
| message | string | 失败原因 |
| created_at | string | ISO 8601 |
